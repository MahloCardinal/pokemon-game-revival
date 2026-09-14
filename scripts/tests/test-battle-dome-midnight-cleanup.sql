-- Only session-local fixtures are deleted. No accounts or real battles change.
begin;
set local statement_timeout = '20s';

create temporary table battle_dome_battle (
  id integer primary key, status text, concluded_at timestamptz,
  creator_exited boolean, challenger_exited boolean
) on commit drop;
create temporary table dome_child (
  battle_id integer references pg_temp.battle_dome_battle(id) on delete cascade
) on commit drop;

do $fixture$
declare v_definition text;
begin
  select pg_get_functiondef('server_authority_private.cleanup_battle_dome_at_midnight(timestamptz)'::regprocedure)
    into v_definition;
  v_definition := replace(v_definition, 'server_authority_private.cleanup_battle_dome_at_midnight', 'pg_temp.cleanup_dome');
  v_definition := replace(v_definition, 'public.battle_dome_battle', 'pg_temp.battle_dome_battle');
  execute v_definition;
end;
$fixture$;

do $test$
declare v_midnight timestamptz; v_deleted integer; v_role text;
begin
  -- Winter, summer, and the midnights on either side of both DST changes.
  foreach v_midnight in array array[
    '2026-01-15 23:00:00+00'::timestamptz,
    '2026-09-05 22:00:00+00'::timestamptz,
    '2026-03-28 23:00:00+00'::timestamptz,
    '2026-03-29 22:00:00+00'::timestamptz,
    '2026-10-24 22:00:00+00'::timestamptz,
    '2026-10-25 23:00:00+00'::timestamptz
  ] loop
    truncate pg_temp.battle_dome_battle cascade;
    insert into pg_temp.battle_dome_battle values
      (1, 'concluded', v_midnight - interval '1 second', false, false),
      (2, 'concluded', v_midnight - interval '2 days', true, false),
      (3, 'concluded', v_midnight - interval '2 hours', false, true),
      (4, 'concluded', v_midnight - interval '1 hour', true, true),
      (5, 'active', null, false, false),
      (6, 'needs_player_switch', null, false, false),
      (7, 'concluded', v_midnight, false, false),
      (8, 'concluded', v_midnight + interval '10 seconds', false, false);
    insert into pg_temp.dome_child select id from pg_temp.battle_dome_battle;
    if pg_temp.cleanup_dome(v_midnight - interval '1 second') <> 0 then
      raise exception 'Cleanup ran before Rome midnight';
    end if;
    v_deleted := pg_temp.cleanup_dome(v_midnight);
    if v_deleted <> 4 or (select array_agg(id order by id) from pg_temp.battle_dome_battle) <> array[5,6,7,8]
      or (select count(*) from pg_temp.dome_child) <> 4 then
      raise exception 'Midnight cleanup removed the wrong battles at %', v_midnight;
    end if;
    if pg_temp.cleanup_dome(v_midnight) <> 0
      or pg_temp.cleanup_dome(v_midnight + interval '1 hour') <> 0 then
      raise exception 'Cleanup is not idempotent or ran outside midnight';
    end if;
  end loop;
  foreach v_role in array array['anon','authenticated','service_role'] loop
    if has_function_privilege(v_role, 'server_authority_private.cleanup_battle_dome_at_midnight(timestamptz)', 'execute') then
      raise exception 'Cleanup is executable by %', v_role;
    end if;
  end loop;
  if (select count(*) from pg_constraint
      where confrelid = 'public.battle_dome_battle'::regclass and contype = 'f' and confdeltype = 'c'
        and conrelid in ('public.battle_dome_event'::regclass,
          'public.battle_dome_command_receipt'::regclass,
          'server_authority_private.battle_turn_history'::regclass)) <> 3 then
    raise exception 'Dome events, receipts and history must cascade on deletion';
  end if;
end;
$test$;
select 'Battle Dome midnight cleanup: Rome time, DST, exit flags, active battles, cascades and permissions passed' as result;
rollback;
