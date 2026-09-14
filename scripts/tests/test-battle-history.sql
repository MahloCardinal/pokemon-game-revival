-- Session-local fixtures and real history functions; no player data is modified.
begin;
set local statement_timeout = '20s';
-- Compile both access paths against the deployed schema before using fixtures.
do $$ begin
  perform public.read_edge_battle_turn_history(gen_random_uuid(), gen_random_uuid(), false, 1);
  perform public.read_edge_battle_turn_history(gen_random_uuid(), gen_random_uuid(), true, 1);
end; $$;
create temporary table authoritative_battle as select id, auth_user_id, contract_key from public.authoritative_battle with no data;
alter table pg_temp.authoritative_battle add primary key(id);
create temporary table battle_dome_battle(id uuid primary key, engine_snapshot jsonb);
create temporary table user_server_role(auth_user_id uuid, role_key text);
create temporary table battle_turn_history(like server_authority_private.battle_turn_history including all);
alter table pg_temp.battle_turn_history add foreign key (battle_id) references pg_temp.authoritative_battle(id) on delete cascade;
alter table pg_temp.battle_turn_history add foreign key (dome_battle_id) references pg_temp.battle_dome_battle(id) on delete cascade;
do $$
declare signature text; definition text;
begin
  foreach signature in array array[
    'server_authority_private.battle_turn_event_refs(jsonb)',
    'server_authority_private.store_battle_turn_history(uuid,boolean,jsonb,jsonb)',
    'public.read_edge_battle_turn_history(uuid,uuid,boolean,bigint)'
  ] loop
    definition := pg_get_functiondef(signature::regprocedure);
    execute replace(replace(definition, 'server_authority_private.', 'pg_temp.'), 'public.', 'pg_temp.');
  end loop;
end;
$$;
do $$
declare
  owner_id uuid := gen_random_uuid(); other_id uuid := gen_random_uuid(); admin_id uuid := gen_random_uuid();
  regular_id uuid := gen_random_uuid(); dome_id uuid := gen_random_uuid(); events jsonb; result jsonb;
begin
  insert into pg_temp.authoritative_battle values(regular_id, owner_id, 'admin_gym');
  insert into pg_temp.battle_dome_battle values(dome_id, '{}'::jsonb);
  insert into pg_temp.user_server_role values(admin_id, 'admin');
  events := '[{"sequence":0,"type":"command_resolved","data":{}},{"sequence":1,"type":"turn_checkpoint","data":{"turn_number":1,"projection":{"player_items":[[1,2]],"participants":[]}}}]';
  if pg_temp.battle_turn_event_refs(events)#>'{1,data,projection}' is not null then raise exception 'Checkpoint leaked into log/receipt'; end if;
  result := '{"ok":true,"events":[{"seq":8,"type":"turn_checkpoint","data":{"turn_number":1}}]}';
  perform pg_temp.store_battle_turn_history(regular_id, false, events, result);
  perform pg_temp.store_battle_turn_history(regular_id, false, events, result);
  result := '{"ok":true,"events":[{"seq":8,"event_type":"turn_checkpoint","event_data":{"turn_number":1}}]}';
  perform pg_temp.store_battle_turn_history(dome_id, true, events, result);
  if (select count(*) from pg_temp.battle_turn_history) <> 2 then raise exception 'History is not idempotent'; end if;
  if pg_temp.read_edge_battle_turn_history(owner_id, regular_id, false, 1)->'history' = 'null'::jsonb then raise exception 'Owner cannot read'; end if;
  if pg_temp.read_edge_battle_turn_history(admin_id, regular_id, false, 1)->'history' = 'null'::jsonb then raise exception 'Admin cannot read administered battle'; end if;
  if pg_temp.read_edge_battle_turn_history(other_id, regular_id, false, 1)->'history' <> 'null'::jsonb then raise exception 'Other player can read private battle'; end if;
  if pg_temp.read_edge_battle_turn_history(other_id, dome_id, true, 1)->'history' = 'null'::jsonb then raise exception 'Spectator cannot read initialized PvP battle'; end if;
  if pg_temp.read_edge_battle_turn_history(owner_id, regular_id, false, 2)->'history' <> 'null'::jsonb then raise exception 'Missing turn was fabricated'; end if;
  update pg_temp.authoritative_battle set contract_key = 'gym';
  if pg_temp.read_edge_battle_turn_history(admin_id, regular_id, false, 1)->'history' <> 'null'::jsonb then raise exception 'Admin can read non-admin battle'; end if;
  delete from pg_temp.authoritative_battle;
  delete from pg_temp.battle_dome_battle;
  if exists(select 1 from pg_temp.battle_turn_history) then raise exception 'History survived battle deletion'; end if;
end;
$$;
-- Exercise the actual generated commit wrappers against session-local core stubs.
-- A failed history insert must roll back the core's write as well.
create temporary table history_commit_audit(battle_id uuid);
do $$
declare proc record; definition text; args text; v_battle_id uuid; events jsonb; result jsonb; audit_count bigint;
begin
  for proc in select p.oid, p.proname, p.proargnames, pg_get_function_arguments(p.oid) as arguments
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where (n.nspname = 'server_authority_private' and p.proname = 'commit_edge_battle_command_core')
      or (n.nspname = 'public' and p.proname = 'commit_edge_battle_dome_command') loop
    execute format($stub$
      create function pg_temp.%I(%s) returns jsonb language plpgsql as $body$
      begin
        if exists(select 1 from jsonb_array_elements(p_events) e where e#>'{data,projection}' is not null) then
          raise exception 'Full checkpoint reached the core';
        end if;
        insert into pg_temp.history_commit_audit values(p_battle_id);
        return jsonb_build_object('ok', true, 'events', (
          select jsonb_agg(e || jsonb_build_object('seq', 8 + (e->>'sequence')::bigint))
          from jsonb_array_elements(p_events) e));
      end;
      $body$;
    $stub$, proc.proname || '_before_turn_history', proc.arguments);
    definition := pg_get_functiondef(proc.oid);
    execute replace(replace(definition, 'server_authority_private.', 'pg_temp.'), 'public.', 'pg_temp.');
    select string_agg(case when arg = 'p_battle_id' then '$1' when arg = 'p_events' then '$2'
      else 'null' end, ', ' order by ordinal) into args from unnest(proc.proargnames) with ordinality a(arg,ordinal);
    v_battle_id := gen_random_uuid();
    if proc.proname = 'commit_edge_battle_dome_command' then
      insert into pg_temp.battle_dome_battle values(v_battle_id, '{}');
    else
      insert into pg_temp.authoritative_battle values(v_battle_id, gen_random_uuid(), 'gym');
    end if;
    events := '[{"sequence":0,"type":"turn_checkpoint","data":{"turn_number":1,"projection":{"participants":[]}}}]';
    execute format('select pg_temp.%I(%s)', proc.proname, args) into result using v_battle_id, events;
    if not exists(select 1 from pg_temp.battle_turn_history h where coalesce(h.battle_id, h.dome_battle_id) = v_battle_id and turn_number = 1) then
      raise exception 'Commit wrapper did not save history';
    end if;
    select count(*) into audit_count from pg_temp.history_commit_audit;
    begin
      events := '[{"sequence":0,"type":"turn_checkpoint","data":{"turn_number":2}}]';
      execute format('select pg_temp.%I(%s)', proc.proname, args) into result using v_battle_id, events;
      raise exception 'Invalid checkpoint unexpectedly committed';
    exception when not_null_violation then null;
    end;
    if (select count(*) from pg_temp.history_commit_audit) <> audit_count then raise exception 'History insert is not atomic with core commit'; end if;
  end loop;
end;
$$;
rollback;
