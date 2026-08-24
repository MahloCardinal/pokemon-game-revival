begin;

-- Revival accepts only the current battle snapshot format. The historical
-- version-2-to-version-1 adapter is no longer part of the live call chain.
create or replace function server_authority_private.commit_edge_battle_command(
  p_auth_user_id uuid,
  p_command_id uuid,
  p_command_type text,
  p_command_hash text,
  p_expected_player_revision bigint,
  p_battle_id uuid,
  p_expected_battle_version bigint,
  p_runtime_owner_id uuid,
  p_engine_version text,
  p_engine_checksum text,
  p_input_snapshot_hash text,
  p_next_snapshot jsonb,
  p_events jsonb,
  p_projection jsonb,
  p_terminal_effects jsonb
) returns jsonb
language plpgsql
security definer
set search_path to 'public', 'server_authority_private', 'extensions', 'pg_temp'
as $$
begin
  return server_authority_private.commit_edge_battle_command_before_snapshot(
    p_auth_user_id,
    p_command_id,
    p_command_type,
    p_command_hash,
    p_expected_player_revision,
    p_battle_id,
    p_expected_battle_version,
    p_runtime_owner_id,
    p_engine_version,
    p_engine_checksum,
    p_input_snapshot_hash,
    p_next_snapshot,
    p_events,
    p_projection,
    p_terminal_effects
  );
exception when serialization_failure then
  if sqlerrm = 'player revision conflict' then
    return jsonb_build_object('ok', false, 'conflict', 'player_revision');
  end if;
  raise;
end;
$$;

drop function server_authority_private.commit_edge_battle_command_before_revision_conflict_response(
  uuid, uuid, text, text, bigint, uuid, bigint, uuid, text, text, text, jsonb, jsonb, jsonb, jsonb
);

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
begin
  if p_command_type <> 'entry_choice' then
    return public.commit_edge_admin_gym_command_before_snapshot(
      p_admin_user_id,
      p_command_id,
      p_command_type,
      p_command_hash,
      p_battle_id,
      p_expected_battle_version,
      p_engine_version,
      p_engine_checksum,
      p_input_snapshot_hash,
      p_next_snapshot,
      p_events,
      p_projection
    );
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
) from public, anon, authenticated;
grant execute on function public.commit_edge_admin_gym_command(
  uuid, uuid, text, text, uuid, bigint, text, text, text, jsonb, jsonb, jsonb
) to service_role;

do $keep_only_current_runtime$
declare
  baseline_id uuid;
  current_runtime_checksum constant text := 'a549cba0c8cb6461d60d97585bce9f31dd37848c452dc5d18a949a5b947374a0';
begin
  if exists (
    select 1
    from public.authoritative_battle
    where status not in ('concluded', 'abandoned')
       or engine_runtime_state = 'pending'
  ) then
    raise exception 'runtime compatibility cleanup requires no active or pending battles'
      using errcode = '55000';
  end if;

  select id into strict baseline_id
  from public.catalog_release
  where version = 'revival-baseline'
    and status = 'published'
  for update;

  insert into public.catalog_engine_runtime_binding(
    catalog_release_id, engine_version, engine_checksum, enabled
  ) values (
    baseline_id, 'pokemon-game-revival', current_runtime_checksum, true
  )
  on conflict (catalog_release_id, engine_version, engine_checksum)
  do update set enabled = true;

  delete from public.catalog_engine_runtime_binding
  where catalog_release_id = baseline_id
    and (
      engine_version <> 'pokemon-game-revival'
      or engine_checksum <> current_runtime_checksum
      or not enabled
    );

  if (
    select count(*)
    from public.catalog_engine_runtime_binding
    where catalog_release_id = baseline_id
  ) <> 1 then
    raise exception 'runtime compatibility cleanup did not converge on one binding'
      using errcode = '55000';
  end if;
end
$keep_only_current_runtime$;

commit;
