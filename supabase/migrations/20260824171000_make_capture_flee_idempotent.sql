-- Treat cancelling an encounter that is already gone as a successful no-op.
-- This prevents stale clients from retrying a deterministic "not found" error.
create or replace function public.flee_edge_capture_encounter(
  p_auth_user_id uuid,
  p_command_id uuid,
  p_expected_player_revision bigint,
  p_encounter_id uuid
) returns jsonb
language plpgsql
security definer
set search_path = 'public', 'server_authority_private', 'extensions', 'pg_temp'
as $$
declare
  v_request jsonb;
  v_request_hash text;
  v_receipt public.player_command_receipt%rowtype;
  v_revision bigint;
  v_encounter public.player_encounter%rowtype;
  v_pending_battle_id uuid;
  v_result jsonb;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'service role required' using errcode = '42501';
  end if;
  if p_auth_user_id is null or p_command_id is null or p_encounter_id is null
    or p_expected_player_revision is null or p_expected_player_revision < 0 then
    raise exception 'capture flee envelope is invalid' using errcode = '22023';
  end if;

  v_request := jsonb_build_object(
    'command_type', 'wild_encounter_cancel',
    'expected_player_revision', p_expected_player_revision,
    'encounter_id', p_encounter_id
  );
  v_request_hash := encode(digest(convert_to(v_request::text, 'UTF8'), 'sha256'), 'hex');
  perform pg_advisory_xact_lock(hashtextextended(p_auth_user_id::text || ':' || p_command_id::text, 0));

  select * into v_receipt
  from public.player_command_receipt
  where auth_user_id = p_auth_user_id and command_id = p_command_id;
  if found then
    if v_receipt.command_type <> 'wild_encounter_cancel' or v_receipt.request_hash <> v_request_hash then
      raise exception 'command id was reused with a different payload' using errcode = '22023';
    end if;
    return v_receipt.result;
  end if;

  select revision into strict v_revision
  from public.player_state_revision
  where auth_user_id = p_auth_user_id
  for update;

  select * into v_encounter
  from public.player_encounter
  where id = p_encounter_id and auth_user_id = p_auth_user_id
  for update;

  if not found or v_encounter.status <> 'active' then
    v_result := jsonb_build_object(
      'ok', true,
      'command_id', p_command_id,
      'command_type', 'wild_encounter_cancel',
      'cancelled', false,
      'player_revision', v_revision,
      'player_state', server_authority_private.player_state_projection(p_auth_user_id)
    );
    insert into public.player_command_receipt(
      auth_user_id, command_id, command_type, request_hash, result, resulting_revision
    ) values (
      p_auth_user_id, p_command_id, 'wild_encounter_cancel', v_request_hash, v_result, v_revision
    );
    return v_result;
  end if;

  if v_revision <> p_expected_player_revision then
    raise exception 'player revision conflict' using errcode = '40001';
  end if;

  select battle.id into v_pending_battle_id
  from public.authoritative_battle battle
  where battle.encounter_id = p_encounter_id
    and battle.auth_user_id = p_auth_user_id
    and battle.contract_key = 'capture'
    and battle.status in ('active', 'needs_player_switch')
    and battle.engine_runtime_state = 'pending'
    and battle.engine_snapshot is null
  for update;

  if v_pending_battle_id is not null then
    delete from public.player_command_receipt receipt
    where receipt.auth_user_id = p_auth_user_id
      and receipt.command_type = 'authoritative_capture_start'
      and receipt.result #>> '{battle,battle_id}' = v_pending_battle_id::text;

    delete from public.authoritative_battle
    where id = v_pending_battle_id;
  end if;

  if exists (
    select 1
    from public.authoritative_battle battle
    where battle.encounter_id = p_encounter_id
      and battle.contract_key = 'capture'
      and battle.status in ('active', 'needs_player_switch')
  ) then
    raise exception 'encounter is bound to an initialized capture battle' using errcode = '55000';
  end if;

  update public.player_encounter
  set status = 'cancelled'
  where id = p_encounter_id;

  update public.player_state_revision
  set revision = revision + 1, updated_at = now()
  where auth_user_id = p_auth_user_id
  returning revision into v_revision;

  v_result := jsonb_build_object(
    'ok', true,
    'command_id', p_command_id,
    'command_type', 'wild_encounter_cancel',
    'cancelled', true,
    'player_revision', v_revision,
    'player_state', server_authority_private.player_state_projection(p_auth_user_id)
  );
  insert into public.player_command_receipt(
    auth_user_id, command_id, command_type, request_hash, result, resulting_revision
  ) values (
    p_auth_user_id, p_command_id, 'wild_encounter_cancel', v_request_hash, v_result, v_revision
  );
  return v_result;
end;
$$;

revoke all on function public.flee_edge_capture_encounter(uuid, uuid, bigint, uuid) from public, anon, authenticated;
grant execute on function public.flee_edge_capture_encounter(uuid, uuid, bigint, uuid) to service_role;
