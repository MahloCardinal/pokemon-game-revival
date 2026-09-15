begin;
set local statement_timeout = '30s';
create temporary table authoritative_battle (like public.authoritative_battle including defaults) on commit drop;
create temporary table authoritative_battle_participant (like public.authoritative_battle_participant including defaults) on commit drop;
create temporary table authoritative_battle_tower_run (like public.authoritative_battle_tower_run including defaults) on commit drop;
create temporary table player_state_revision (like public.player_state_revision including defaults) on commit drop;
do $clone$
declare target regprocedure; definition text; name text;
begin
  foreach target in array array[
    'server_authority_private.prepare_edge_battle_command_core(uuid,uuid)'::regprocedure,
    'server_authority_private.prepare_edge_battle_command_with_roster(uuid,uuid)'::regprocedure,
    'server_authority_private.prepare_edge_battle_command_with_contract_items(uuid,uuid)'::regprocedure,
    'server_authority_private.prepare_edge_battle_command_with_inventory(uuid,uuid)'::regprocedure,
    'server_authority_private.prepare_edge_battle_command(uuid,uuid)'::regprocedure,
    'public.prepare_edge_battle_command(uuid,uuid)'::regprocedure
  ] loop
    definition := pg_get_functiondef(target);
    definition := replace(definition,'public.prepare_edge_battle_command','pg_temp.prepare_public');
    definition := replace(definition,'server_authority_private.prepare_edge_battle_command','pg_temp.prepare_edge_battle_command');
    foreach name in array array['authoritative_battle_participant','authoritative_battle','player_state_revision'] loop
      definition := replace(definition,'public.'||name,'pg_temp.'||name);
    end loop;
    execute definition;
  end loop;
end;
$clone$;
select set_config('request.jwt.claim.role','service_role',true);
do $test$
declare player uuid := gen_random_uuid(); other_player uuid := gen_random_uuid(); battle_id uuid := gen_random_uuid();
  catalog uuid; checksum text; version text; result jsonb; v_status text;
begin
  select deployment.catalog_release_id,deployment.checksum,package.engine_version into strict catalog,checksum,version
  from server_authority_private.runtime_deployment deployment
  join server_authority_private.runtime_package package using(catalog_release_id,checksum);
  insert into pg_temp.player_state_revision(auth_user_id,revision) values(player,17),(other_player,2);
  insert into pg_temp.authoritative_battle(id,auth_user_id,catalog_release_id,contract_key,status,first_actor,player_active_slot,
    runtime_owner_id,rng_state,battle_version,engine_version,engine_checksum,engine_snapshot,engine_snapshot_hash,engine_runtime_state,
    requested_engine_version,requested_engine_checksum,training_difficulty)
  values(battle_id,player,catalog,'training','prepared','player',0,gen_random_uuid(),'{}',3,version,checksum,
    jsonb_build_object('engineVersion',version,'snapshotVersion',3),repeat('a',64),'ready',version,checksum,'medium');
  foreach v_status in array array['prepared','active','needs_player_switch'] loop
    update pg_temp.authoritative_battle set status=v_status;
    result := pg_temp.prepare_public(player,null);
    if result #>> '{battle,battle_id}' is distinct from battle_id::text
      or result #>> '{battle,status}' is distinct from v_status
      or result #>> '{battle,training_difficulty}' is distinct from 'medium'
      or result #>> '{battle,battle_version}' is distinct from '3'
      or result #>> '{player_revision}' is distinct from '17'
      or result #> '{battle,engine_snapshot}' is null then
      raise exception 'Full read chain failed for %: %',v_status,result;
    end if;
  end loop;
  if pg_temp.prepare_public(other_player,null)->'battle' <> 'null'::jsonb
    or pg_temp.prepare_public(other_player,battle_id)->'battle' <> 'null'::jsonb then
    raise exception 'A recovery read crossed player ownership';
  end if;
  -- An unfinished initialization is recoverable only while the battle is open.
  update pg_temp.authoritative_battle set status='active',engine_runtime_state='pending',engine_snapshot=null;
  if pg_temp.prepare_public(player,null)#>>'{battle,battle_id}' is distinct from battle_id::text then
    raise exception 'An open pending initialization disappeared';
  end if;
  foreach v_status in array array['concluded','abandoned'] loop
    update pg_temp.authoritative_battle set status=v_status;
    if pg_temp.prepare_public(player,null)->'battle' <> 'null'::jsonb then
      raise exception 'A terminal battle with a pending runtime was selected for recovery';
    end if;
    if pg_temp.prepare_public(player,battle_id)#>>'{battle,battle_id}' is distinct from battle_id::text then
      raise exception 'Explicit reads of terminal battles stopped working';
    end if;
  end loop;
end;
$test$;
rollback;
select 'Training read recovery: full public-to-core chain, prepared/active/pending, ownership and terminal exclusion passed' as result;
