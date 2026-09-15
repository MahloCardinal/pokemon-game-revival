begin;
set local statement_timeout = '30s';
create temporary table authoritative_battle (like public.authoritative_battle including defaults) on commit drop;
create temporary table player_state_revision (like public.player_state_revision including defaults) on commit drop;
create temporary table player_command_receipt (like public.player_command_receipt including defaults) on commit drop;
do $clone$
declare definition text;
begin
  definition := pg_get_functiondef('public.discard_prepared_training_battle(uuid,uuid,bigint,uuid,bigint,uuid)'::regprocedure);
  definition := replace(definition,'public.discard_prepared_training_battle','pg_temp.discard_training');
  definition := replace(definition,'public.authoritative_battle','pg_temp.authoritative_battle');
  definition := replace(definition,'public.player_state_revision','pg_temp.player_state_revision');
  definition := replace(definition,'public.player_command_receipt','pg_temp.player_command_receipt');
  execute definition;
end;
$clone$;
select set_config('request.jwt.claim.role','service_role',true);
do $test$
declare player uuid := gen_random_uuid(); other_player uuid := gen_random_uuid(); battle_id uuid;
  command_id uuid; owner_id uuid := gen_random_uuid(); result jsonb; revision bigint; round integer;
begin
  insert into pg_temp.player_state_revision(auth_user_id,revision) values(player,10),(other_player,10);
  for round in 1..25 loop
    battle_id := gen_random_uuid(); command_id := gen_random_uuid();
    select r.revision into revision from pg_temp.player_state_revision r where auth_user_id=player;
    insert into pg_temp.authoritative_battle(id,auth_user_id,catalog_release_id,contract_key,status,first_actor,
      player_active_slot,battle_version,runtime_owner_id,rng_state,engine_runtime_state)
    values(battle_id,player,gen_random_uuid(),'training','prepared','player',0,3,gen_random_uuid(),'{}','ready');
    begin
      perform pg_temp.discard_training(other_player,gen_random_uuid(),10,battle_id,3,owner_id);
      raise exception 'Another player must never discard the preview';
    exception when no_data_found then null;
    end;
    begin
      perform pg_temp.discard_training(player,gen_random_uuid(),revision,battle_id,2,owner_id);
      raise exception 'Stale versions must remain rejected';
    exception when sqlstate 'PGRST' then null;
    end;
    result := pg_temp.discard_training(player,command_id,revision,battle_id,3,owner_id);
    if result->>'discarded' is distinct from 'true'
      or (result->>'player_revision')::bigint <> revision+1
      or exists(select 1 from pg_temp.authoritative_battle b where b.id=battle_id) then
      raise exception 'Replacement % failed after changing the browser session',round;
    end if;
    if pg_temp.discard_training(player,command_id,revision,battle_id,3,owner_id) <> result then
      raise exception 'Replacement replay did not retain its receipt';
    end if;
  end loop;
  insert into pg_temp.authoritative_battle(id,auth_user_id,catalog_release_id,contract_key,status,first_actor,
    player_active_slot,battle_version,runtime_owner_id,rng_state)
  values(battle_id,player,gen_random_uuid(),'training','active','player',0,3,owner_id,'{}');
  begin
    perform pg_temp.discard_training(player,gen_random_uuid(),revision+1,battle_id,3,owner_id);
    raise exception 'Replacement must not cancel a battle already started';
  exception when sqlstate 'PGRST' then null;
  end;
end;
$test$;
rollback;
select 'Training replacement: 25 successive previews, changed sessions, player ownership, versions, replay and active-battle protection passed' as result;
