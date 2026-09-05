-- Run on the linked Revival project. Only temporary fixtures are mutated.
begin;
set local statement_timeout = '20s';

do $test$
declare v_message text; v_detail text;
begin
  if exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname in ('public', 'server_authority_private')
      and p.prosrc ~* $pattern$errcode[[:space:]]*=[[:space:]]*'40001'$pattern$
  ) then raise exception 'An application conflict still triggers transaction retries'; end if;
  begin
    perform server_authority_private.raise_revision_conflict(format('revision conflict: expected %s, current %s', 4, 5));
    raise exception 'Conflict was accepted';
  exception when sqlstate 'PGRST' then
    get stacked diagnostics v_message = message_text, v_detail = pg_exception_detail;
    if v_message::jsonb->>'code' <> '40001'
      or v_message::jsonb->>'message' <> 'revision conflict: expected 4, current 5'
      or v_detail::jsonb->>'status' <> '409'
      or v_detail::jsonb->'headers' <> '{}'::jsonb then
      raise exception 'Conflict response contract changed';
    end if;
  end;
  if has_function_privilege('anon', 'server_authority_private.raise_revision_conflict(text)', 'execute')
    or has_function_privilege('authenticated', 'server_authority_private.raise_revision_conflict(text)', 'execute') then
    raise exception 'Private helper is executable by browser roles';
  end if;
end;
$test$;

create temporary table battle_dome_battle (like public.battle_dome_battle including defaults) on commit drop;
create temporary table battle_dome_event (like public.battle_dome_event including defaults) on commit drop;
create temporary table battle_dome_command_receipt (like public.battle_dome_command_receipt including defaults) on commit drop;

-- Clone the real commit implementation, redirecting only the writable tables.
do $fixture$
declare v_definition text;
begin
  select pg_get_functiondef('public.commit_edge_battle_dome_command_before_turn_history(uuid,uuid,text,text,uuid,bigint,text,text,text,jsonb,jsonb,jsonb)'::regprocedure)
    into v_definition;
  v_definition := replace(v_definition, 'public.commit_edge_battle_dome_command_before_turn_history', 'pg_temp.commit_dome');
  -- Keep the public composite type for the existing read-only payload helper.
  v_definition := replace(v_definition, 'from public.battle_dome_battle', 'from pg_temp.battle_dome_battle');
  v_definition := replace(v_definition, 'update public.battle_dome_battle', 'update pg_temp.battle_dome_battle');
  v_definition := replace(v_definition, 'into public.battle_dome_event', 'into pg_temp.battle_dome_event');
  v_definition := replace(v_definition, 'into public.battle_dome_command_receipt', 'into pg_temp.battle_dome_command_receipt');
  execute v_definition;
end;
$fixture$;

insert into pg_temp.battle_dome_battle(id, creator_auth_user_id, challenger_auth_user_id,
  creator_username, challenger_username, catalog_release_id, status, battle_version,
  engine_version, engine_checksum, initial_participants, engine_snapshot, next_event_seq,
  creator_exited, challenger_exited, waiting_for, created_at, updated_at)
values ('10000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002',
  '10000000-0000-4000-8000-000000000003', 'fixture_creator', 'fixture_challenger',
  '10000000-0000-4000-8000-000000000004', 'active', 5,
  'pokemon-game-revival', repeat('a',64), '[]', '{}', 1, false, false, 'creator', now(), now());
select set_config('request.jwt.claim.role', 'service_role', true);
select set_config('request.jwt.claims', '{"role":"service_role"}', true);

do $test$
declare v_case text; v_result jsonb; v_message text; v_hash text;
begin
  v_hash := encode(extensions.digest(convert_to('{}'::jsonb::text,'UTF8'),'sha256'),'hex');
  foreach v_case in array array['version','engine','hash','turn','initialized'] loop
    begin
      perform pg_temp.commit_dome(
        case when v_case='turn' then '10000000-0000-4000-8000-000000000003'::uuid
          else '10000000-0000-4000-8000-000000000002'::uuid end,
        gen_random_uuid(), case when v_case='initialized' then 'initialize' else 'move' end,
        'fixture-command', '10000000-0000-4000-8000-000000000001',
        case when v_case='version' then 4 else 5 end, 'pokemon-game-revival',
        case when v_case='engine' then repeat('b',64) else repeat('a',64) end,
        case when v_case='hash' then repeat('0',64) else v_hash end,
        '{}', '[]', '{"status":"active","waiting_for":"player"}');
      raise exception 'Stale % command accepted', v_case;
    exception when sqlstate 'PGRST' then
      get stacked diagnostics v_message = message_text;
      if v_message::jsonb->>'code' <> '40001' then raise exception 'Wrong conflict code'; end if;
    end;
    if (select battle_version from pg_temp.battle_dome_battle) <> 5
      or exists(select 1 from pg_temp.battle_dome_command_receipt)
      or exists(select 1 from pg_temp.battle_dome_event) then
      raise exception 'Rejected command changed battle data';
    end if;
  end loop;
  v_result := pg_temp.commit_dome('10000000-0000-4000-8000-000000000002', gen_random_uuid(),
    'move', 'fixture-command', '10000000-0000-4000-8000-000000000001', 5,
    'pokemon-game-revival', repeat('a',64), v_hash, '{"fixture":true}',
    '[{"type":"fixture","data":{}}]', '{"status":"active","waiting_for":"admin","player_active_slot":0,"npc_active_slot":0}');
  if v_result->>'ok' <> 'true' or (select battle_version from pg_temp.battle_dome_battle) <> 6
    or (select count(*) from pg_temp.battle_dome_command_receipt) <> 1
    or (select count(*) from pg_temp.battle_dome_event) <> 1 then
    raise exception 'Valid command did not commit atomically';
  end if;
end;
$test$;
select 'Application conflicts: response contract, privileges, stale commands and valid commit passed' as result;
rollback;
