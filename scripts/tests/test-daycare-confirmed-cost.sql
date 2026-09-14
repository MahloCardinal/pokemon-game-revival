begin;
set local statement_timeout = '30s';

-- Clone only the new confirmation boundary. Its command dependency is a
-- transaction-local fixture so rollback and replay never touch player data.
create temporary table withdrawal_fixture(balance bigint, charge bigint, receipt jsonb);
insert into withdrawal_fixture values (5000, 1500, null);
create function pg_temp.withdraw_daycare_pokemon_authoritative(uuid,bigint,uuid)
returns jsonb language plpgsql as $$
declare v_result jsonb;
begin
  if $2 = 99 then return '{"ok":false,"conflict":"player_revision"}'::jsonb; end if;
  select receipt into v_result from pg_temp.withdrawal_fixture;
  if v_result is not null then return v_result; end if;
  update pg_temp.withdrawal_fixture set balance = balance - charge,
    receipt = jsonb_build_object('charged_cost',charge,'revision',2)
    returning receipt into v_result;
  return v_result;
end;
$$;
do $test$
declare
  v_definition text;
  v_result jsonb;
  v_command uuid := gen_random_uuid();
  v_pokemon uuid := gen_random_uuid();
begin
  v_definition := pg_get_functiondef('public.withdraw_daycare_pokemon_authoritative(uuid,bigint,uuid,bigint)'::regprocedure);
  execute replace(v_definition, 'public.withdraw_daycare_pokemon_authoritative', 'pg_temp.withdraw_daycare_pokemon_authoritative');
  begin
    perform pg_temp.withdraw_daycare_pokemon_authoritative(v_command,1,v_pokemon,1000);
    raise exception 'An outdated quote must be rejected';
  exception when sqlstate 'DC001' then null;
  end;
  if (select balance <> 5000 or receipt is not null from pg_temp.withdrawal_fixture) then
    raise exception 'A cost mismatch must roll back the command and its receipt';
  end if;
  v_result := pg_temp.withdraw_daycare_pokemon_authoritative(v_command,1,v_pokemon,1500);
  if (v_result ->> 'charged_cost')::bigint <> 1500 then raise exception 'Confirmed charge differs'; end if;
  update pg_temp.withdrawal_fixture set charge = 2000;
  if pg_temp.withdraw_daycare_pokemon_authoritative(v_command,1,v_pokemon,1500) <> v_result
    or (select balance from pg_temp.withdrawal_fixture) <> 3500 then
    raise exception 'Replay must preserve the frozen cost without charging again';
  end if;
  begin
    perform pg_temp.withdraw_daycare_pokemon_authoritative(v_command,1,v_pokemon,2000);
    raise exception 'A replay with a different quote must be rejected';
  exception when sqlstate 'DC001' then null;
  end;
  begin
    perform pg_temp.withdraw_daycare_pokemon_authoritative(v_command,1,v_pokemon,null);
    raise exception 'A missing quote must be rejected';
  exception when invalid_parameter_value then null;
  end;
  if pg_temp.withdraw_daycare_pokemon_authoritative(v_command,99,v_pokemon,1500) ->> 'conflict' <> 'player_revision' then
    raise exception 'Revision conflict contract changed';
  end if;
  if has_function_privilege('anon','public.withdraw_daycare_pokemon_authoritative(uuid,bigint,uuid,bigint)','execute')
    or not has_function_privilege('authenticated','public.withdraw_daycare_pokemon_authoritative(uuid,bigint,uuid,bigint)','execute') then
    raise exception 'Incorrect confirmed withdrawal permissions';
  end if;
end;
$test$;
rollback;
select 'Daycare confirmed cost: atomic rollback, exact charge, replay, conflicts and grants passed' as result;
