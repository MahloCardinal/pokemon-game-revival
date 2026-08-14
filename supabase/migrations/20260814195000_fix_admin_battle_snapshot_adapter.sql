-- Gym and League admin commands enter below the player-facing snapshot adapter.
-- Normalize their current-format snapshot at this endpoint only, then persist
-- the untouched current-format snapshot after the existing commit chain succeeds.

create or replace function public.commit_edge_admin_gym_command(
  p_admin_user_id uuid,
  p_command_id uuid,
  p_command_type text,
  p_command_hash text,
  p_battle_id uuid,
  p_expected_battle_version bigint,
  p_engine_version text,
  p_engine_checksum text,
  p_input_snapshot_hash text,
  p_next_snapshot jsonb,
  p_events jsonb,
  p_projection jsonb
) returns jsonb
language plpgsql
security definer
set search_path to 'public', 'server_authority_private', 'extensions', 'pg_temp'
as $$
declare
  v_battle public.authoritative_battle%rowtype;
  v_receipt public.authoritative_admin_gym_command_receipt%rowtype;
  v_revision bigint;
  v_internal uuid := gen_random_uuid();
  v_result jsonb;
  v_owner uuid;
  v_commit_snapshot jsonb := p_next_snapshot;
  v_snapshot_hash text;
begin
  if p_command_type <> 'entry_choice' then
    if server_authority_private.edge_jsonb_bigint(p_next_snapshot -> 'snapshotVersion') = 2 then
      v_commit_snapshot := jsonb_set(p_next_snapshot, '{snapshotVersion}', '1'::jsonb, false);
    end if;

    v_result := public.commit_edge_admin_gym_command_before_snapshot(
      p_admin_user_id,
      p_command_id,
      p_command_type,
      p_command_hash,
      p_battle_id,
      p_expected_battle_version,
      p_engine_version,
      p_engine_checksum,
      p_input_snapshot_hash,
      v_commit_snapshot,
      p_events,
      p_projection
    );

    if v_commit_snapshot is distinct from p_next_snapshot then
      v_snapshot_hash := encode(digest(convert_to(p_next_snapshot::text, 'UTF8'), 'sha256'), 'hex');
      update public.authoritative_battle
      set engine_snapshot = p_next_snapshot,
          engine_snapshot_hash = v_snapshot_hash,
          rng_state = p_next_snapshot -> 'rng'
      where id = p_battle_id
        and engine_version = p_engine_version
        and engine_checksum = p_engine_checksum;
    end if;

    return v_result;
  end if;

  if coalesce(auth.role(), '') <> 'service_role'
    or not server_authority_private.user_has_server_role(p_admin_user_id, 'admin') then
    raise exception 'admin service authority required' using errcode = '42501';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_admin_user_id::text || ':' || p_command_id::text, 0));
  select * into v_receipt
  from public.authoritative_admin_gym_command_receipt
  where admin_auth_user_id = p_admin_user_id and command_id = p_command_id;
  if found then
    return v_receipt.result;
  end if;

  select * into strict v_battle
  from public.authoritative_battle
  where id = p_battle_id;
  if v_battle.contract_key not in ('admin_gym', 'league', 'debug_training')
    or v_battle.waiting_for <> 'admin'
    or v_battle.battle_version <> p_expected_battle_version then
    raise exception 'admin initial entry choice is invalid' using errcode = '22023';
  end if;

  select revision into strict v_revision
  from public.player_state_revision
  where auth_user_id = v_battle.auth_user_id;
  v_owner := v_battle.runtime_owner_id;
  v_result := public.commit_edge_battle_command(
    v_battle.auth_user_id,
    v_internal,
    p_command_type,
    p_command_hash,
    v_revision,
    p_battle_id,
    p_expected_battle_version,
    v_owner,
    p_engine_version,
    p_engine_checksum,
    p_input_snapshot_hash,
    p_next_snapshot,
    p_events,
    p_projection,
    jsonb_build_object('reward', 'none', 'inventory', 'unchanged', 'team', 'unchanged')
  );

  update public.authoritative_battle
  set waiting_for = p_projection ->> 'waiting_for',
      admin_items = coalesce(p_projection -> 'admin_items', admin_items)
  where id = p_battle_id and runtime_owner_id = v_owner;

  insert into public.authoritative_admin_gym_command_receipt(
    admin_auth_user_id,
    command_id,
    battle_id,
    command_type,
    command_hash,
    result,
    resulting_battle_version
  ) values (
    p_admin_user_id,
    p_command_id,
    p_battle_id,
    p_command_type,
    p_command_hash,
    v_result,
    (v_result ->> 'battle_version')::bigint
  );
  return v_result;
end;
$$;

revoke all on function public.commit_edge_admin_gym_command(
  uuid, uuid, text, text, uuid, bigint, text, text, text, jsonb, jsonb, jsonb
) from public;
revoke all on function public.commit_edge_admin_gym_command(
  uuid, uuid, text, text, uuid, bigint, text, text, text, jsonb, jsonb, jsonb
) from anon;
revoke all on function public.commit_edge_admin_gym_command(
  uuid, uuid, text, text, uuid, bigint, text, text, text, jsonb, jsonb, jsonb
) from authenticated;
grant execute on function public.commit_edge_admin_gym_command(
  uuid, uuid, text, text, uuid, bigint, text, text, text, jsonb, jsonb, jsonb
) to service_role;
