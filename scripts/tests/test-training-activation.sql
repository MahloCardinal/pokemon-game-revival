begin;
set local statement_timeout = '30s';
create temporary table authoritative_battle (like public.authoritative_battle including defaults) on commit drop;
create temporary table player_state_revision (like public.player_state_revision including defaults) on commit drop;
create temporary table player_command_receipt (like public.player_command_receipt including defaults) on commit drop;
create temporary table runtime_deployment (like server_authority_private.runtime_deployment including defaults) on commit drop;
create temporary table runtime_package (like server_authority_private.runtime_package including defaults) on commit drop;
create temporary table activation_events (battle_id uuid, event_type text);
create function pg_temp.append_event(uuid,text,jsonb,uuid,jsonb) returns bigint language plpgsql as $$
begin insert into pg_temp.activation_events values ($1,$2); return 1; end;
$$;
create function pg_temp.assert_composition(uuid) returns void language sql as $$ select; $$;
do $clone$
declare target regprocedure; definition text;
begin
  foreach target in array array[
    'server_authority_private.runtime_transition_allowed(uuid,text,text,jsonb,bigint)'::regprocedure,
    'server_authority_private.guard_runtime_snapshot()'::regprocedure,
    'public.activate_prepared_training_battle(uuid,uuid,bigint,uuid,bigint,uuid,integer)'::regprocedure,
    'public.start_edge_training_battle_without_progression_guard(uuid,uuid,bigint,uuid,text,integer,text,text)'::regprocedure
  ] loop
    definition := pg_get_functiondef(target);
    definition := replace(definition,'public.activate_prepared_training_battle','pg_temp.activate_training');
    definition := replace(definition,'public.start_edge_training_battle_without_progression_guard','pg_temp.start_training');
    definition := replace(definition,'public.authoritative_battle','pg_temp.authoritative_battle');
    definition := replace(definition,'public.player_state_revision','pg_temp.player_state_revision');
    definition := replace(definition,'public.player_command_receipt','pg_temp.player_command_receipt');
    definition := replace(definition,'server_authority_private.runtime_transition_allowed','pg_temp.runtime_transition_allowed');
    definition := replace(definition,'server_authority_private.guard_runtime_snapshot','pg_temp.guard_runtime_snapshot');
    definition := replace(definition,'server_authority_private.runtime_deployment','pg_temp.runtime_deployment');
    definition := replace(definition,'server_authority_private.runtime_package','pg_temp.runtime_package');
    definition := replace(definition,'server_authority_private.assert_player_team_composition','pg_temp.assert_composition');
    definition := replace(definition,'server_authority_private.authoritative_battle_append_event','pg_temp.append_event');
    execute definition;
  end loop;
end;
$clone$;
select set_config('request.jwt.claim.role','service_role',true);
do $test$
declare
  catalog uuid := gen_random_uuid(); player uuid := gen_random_uuid(); owner_id uuid := gen_random_uuid();
  battle_id uuid := gen_random_uuid(); command_id uuid := gen_random_uuid(); result jsonb; snapshot jsonb;
begin
  snapshot := '{"snapshotVersion":3,"engineVersion":"pokemon-game-revival","rng":{"draws":7},"playerTeam":{"state":{"activeIndex":0},"pokemon":[{"state":{"authoritativeSlot":0}},{"state":{"authoritativeSlot":3}}]}}';
  insert into pg_temp.runtime_package(catalog_release_id,checksum,engine_version,snapshot_version,components)
  values(catalog,repeat('b',64),'pokemon-game-revival',3,'{}');
  insert into pg_temp.runtime_deployment(catalog_release_id,checksum,generation) values(catalog,repeat('b',64),2);
  insert into pg_temp.player_state_revision(auth_user_id,revision) values(player,10);
  insert into pg_temp.authoritative_battle(id,auth_user_id,catalog_release_id,contract_key,status,first_actor,
    player_active_slot,battle_version,runtime_owner_id,rng_state,engine_version,engine_checksum,engine_snapshot,engine_runtime_state)
  values(battle_id,player,catalog,'training','prepared','player',0,3,owner_id,'{}','pokemon-game-revival',repeat('a',64),snapshot,'ready');
  -- Use the real snapshot guard on the cloned table: the previous activation
  -- fails here because its transaction has no runtime generation.
  execute 'create trigger runtime_guard before update on pg_temp.authoritative_battle for each row execute function pg_temp.guard_runtime_snapshot()';
  perform set_config('server_authority.runtime_generation','',true);
  begin
    perform pg_temp.start_training(player,gen_random_uuid(),10,owner_id,'medium',0,'pokemon-game-revival',repeat('b',64));
    raise exception 'A prepared battle must block another start';
  exception when sqlstate 'PGRST' then null;
  end;
  begin
    perform pg_temp.activate_training(player,gen_random_uuid(),10,battle_id,3,gen_random_uuid(),3);
    raise exception 'A different runtime owner must be rejected';
  exception when sqlstate 'PGRST' then null;
  end;
  result := pg_temp.activate_training(player,command_id,10,battle_id,3,owner_id,3);
  if (select status <> 'active' or battle_version <> 4 or engine_checksum <> repeat('b',64)
      or engine_snapshot <> jsonb_set(snapshot,'{playerTeam,state,activeIndex}','1')
      from pg_temp.authoritative_battle) then
    raise exception 'Activation must preserve the roster/RNG and adopt the current compatible package';
  end if;
  if (result ->> 'player_revision')::bigint <> 11
    or current_setting('server_authority.runtime_generation') <> '2' then
    raise exception 'Activation revision or runtime generation is incorrect';
  end if;
  update pg_temp.runtime_deployment set generation=3;
  if pg_temp.activate_training(player,command_id,10,battle_id,3,owner_id,3) <> result
    or (select count(*) from pg_temp.activation_events) <> 1 then
    raise exception 'An activation replay must retain the receipt and not append events';
  end if;
  -- A new incompatible schema must still fail; this fix must not bypass guards.
  update pg_temp.authoritative_battle set status='prepared';
  update pg_temp.runtime_package set snapshot_version=4;
  begin
    perform pg_temp.activate_training(player,gen_random_uuid(),11,battle_id,4,owner_id,0);
    raise exception 'An incompatible snapshot was accepted';
  exception when feature_not_supported then null;
  end;
end;
$test$;
rollback;
select 'Training activation: runtime guard, compatible updates, frozen roster/RNG, replay, ownership and prepared conflict passed' as result;
