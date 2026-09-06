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
  v_definition := replace(v_definition, 'from public.battle_dome_command_receipt', 'from pg_temp.battle_dome_command_receipt');
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
declare v_case text; v_result jsonb; v_replay jsonb; v_message text; v_hash text; v_command_id uuid := gen_random_uuid();
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
  v_result := pg_temp.commit_dome('10000000-0000-4000-8000-000000000002', v_command_id,
    'move', 'fixture-command', '10000000-0000-4000-8000-000000000001', 5,
    'pokemon-game-revival', repeat('a',64), v_hash, '{"fixture":true}',
    '[{"type":"fixture","data":{}}]', '{"status":"active","waiting_for":"admin","player_active_slot":0,"npc_active_slot":0}');
  if v_result->>'ok' <> 'true' or (select battle_version from pg_temp.battle_dome_battle) <> 6
    or (select count(*) from pg_temp.battle_dome_command_receipt) <> 1
    or (select count(*) from pg_temp.battle_dome_event) <> 1 then
    raise exception 'Valid command did not commit atomically';
  end if;
  -- The lock loser sees this same state: changed turn, version and snapshot.
  -- Its speculative transition must not replace the first committed result.
  v_replay := pg_temp.commit_dome('10000000-0000-4000-8000-000000000002', v_command_id,
    'move', 'fixture-command', '10000000-0000-4000-8000-000000000001', 5,
    'pokemon-game-revival', repeat('a',64), v_hash, '{"uncommitted":true}',
    '[{"type":"uncommitted","data":{}}]', '{"status":"active","waiting_for":"player"}');
  if v_replay <> v_result || '{"replayed":true}'::jsonb
    or (select battle_version from pg_temp.battle_dome_battle) <> 6
    or (select engine_snapshot from pg_temp.battle_dome_battle) <> '{"fixture":true}'::jsonb
    or (select count(*) from pg_temp.battle_dome_command_receipt) <> 1
    or (select count(*) from pg_temp.battle_dome_event) <> 1 then
    raise exception 'Duplicate command was not replayed without mutation';
  end if;
  foreach v_case in array array['hash', 'type'] loop
    begin
      perform pg_temp.commit_dome('10000000-0000-4000-8000-000000000002', v_command_id,
        case when v_case = 'type' then 'switch' else 'move' end,
        case when v_case = 'hash' then 'different-command' else 'fixture-command' end,
        '10000000-0000-4000-8000-000000000001', 5,
        'pokemon-game-revival', repeat('a',64), v_hash, '{}', '[]', '{}');
      raise exception 'Command ID reuse with different % was accepted', v_case;
    exception when sqlstate '22023' then null;
    end;
  end loop;
end;
$test$;

-- Execute the real history wrapper with a spy: a replay must never store the
-- speculative request's checkpoints, even if its events differ from the receipt.
create temporary table history_calls (calls integer) on commit drop;
insert into history_calls values (0);
create function pg_temp.store_history(uuid, boolean, jsonb, jsonb) returns void language plpgsql as $$
begin update pg_temp.history_calls set calls = calls + 1; end;
$$;
do $fixture$
declare v_definition text;
begin
  select pg_get_functiondef('public.commit_edge_battle_dome_command(uuid,uuid,text,text,uuid,bigint,text,text,text,jsonb,jsonb,jsonb)'::regprocedure)
    into v_definition;
  v_definition := replace(v_definition, 'public.commit_edge_battle_dome_command_before_turn_history', 'pg_temp.commit_dome');
  v_definition := replace(v_definition, 'public.commit_edge_battle_dome_command', 'pg_temp.commit_with_history');
  v_definition := replace(v_definition, 'server_authority_private.store_battle_turn_history', 'pg_temp.store_history');
  execute v_definition;
end;
$fixture$;
do $test$
declare v_receipt record; v_result jsonb;
begin
  select * into strict v_receipt from pg_temp.battle_dome_command_receipt;
  v_result := pg_temp.commit_with_history(v_receipt.auth_user_id, v_receipt.command_id,
    v_receipt.command_type, v_receipt.command_hash, v_receipt.battle_id, 5,
    'pokemon-game-revival', repeat('a',64), 'old-snapshot', '{}',
    '[{"type":"turn_checkpoint","data":{"turn_number":99,"projection":{}}}]', '{}');
  if v_result->>'replayed' <> 'true' or (select calls from pg_temp.history_calls) <> 0 then
    raise exception 'Replay attempted to write turn history';
  end if;
  -- A genuinely new command still invokes the history writer once.
  perform pg_temp.commit_with_history('10000000-0000-4000-8000-000000000003', gen_random_uuid(),
    'move', 'next-command', v_receipt.battle_id, 6, 'pokemon-game-revival', repeat('a',64),
    encode(extensions.digest(convert_to('{"fixture":true}'::jsonb::text,'UTF8'),'sha256'),'hex'),
    '{}', '[]', '{"status":"active","waiting_for":"player","player_active_slot":0,"npc_active_slot":0}');
  if (select calls from pg_temp.history_calls) <> 1 then raise exception 'New commit skipped history'; end if;
  if has_function_privilege('authenticated', 'public.commit_edge_battle_dome_command(uuid,uuid,text,text,uuid,bigint,text,text,text,jsonb,jsonb,jsonb)', 'execute')
    or has_function_privilege('anon', 'public.commit_edge_battle_dome_command_before_turn_history(uuid,uuid,text,text,uuid,bigint,text,text,text,jsonb,jsonb,jsonb)', 'execute') then
    raise exception 'Browser roles can commit Dome commands directly';
  end if;
end;
$test$;
select 'Application conflicts: response contract, privileges, stale commands, commit, replay and history passed' as result;
rollback;
