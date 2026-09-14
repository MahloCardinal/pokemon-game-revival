-- All writes use temporary copies; no accounts, encounters or real battles change.
begin;
set local statement_timeout='30s';
create temporary table catalog_release (like public.catalog_release including all) on commit drop;
insert into catalog_release select * from public.catalog_release where version='revival-baseline';
create temporary table catalog_engine_runtime_binding (like public.catalog_engine_runtime_binding including all) on commit drop;
create temporary table runtime_package (like server_authority_private.runtime_package including all) on commit drop;
create temporary table runtime_deployment (like server_authority_private.runtime_deployment including all) on commit drop;
create temporary table authoritative_battle (like public.authoritative_battle including defaults) on commit drop;
create temporary table battle_dome_battle (like public.battle_dome_battle including defaults) on commit drop;
create temporary table battle_dome_event (like public.battle_dome_event including defaults) on commit drop;
create temporary table battle_dome_command_receipt (like public.battle_dome_command_receipt including defaults) on commit drop;
do $clone$
declare target regprocedure; definition text;
begin
  foreach target in array array[
    'server_authority_private.activate_runtime_package(jsonb,boolean)'::regprocedure,
    'server_authority_private.runtime_transition_allowed(uuid,text,text,jsonb,bigint)'::regprocedure
  ] loop
    definition:=pg_get_functiondef(target);
    definition:=replace(definition,'server_authority_private.activate_runtime_package','pg_temp.activate_runtime_package');
    definition:=replace(definition,'server_authority_private.runtime_transition_allowed','pg_temp.runtime_transition_allowed');
    definition:=replace(definition,'server_authority_private.runtime_package','pg_temp.runtime_package');
    definition:=replace(definition,'server_authority_private.runtime_deployment','pg_temp.runtime_deployment');
    definition:=replace(definition,'public.','pg_temp.');
    execute definition;
  end loop;
  definition:=pg_get_functiondef('public.commit_edge_battle_dome_command_before_turn_history(uuid,uuid,text,text,uuid,bigint,text,text,text,jsonb,jsonb,jsonb)'::regprocedure);
  definition:=replace(definition,'public.commit_edge_battle_dome_command_before_turn_history','pg_temp.commit_dome');
  definition:=replace(definition,'from public.battle_dome_battle','from pg_temp.battle_dome_battle');
  definition:=replace(definition,'update public.battle_dome_battle','update pg_temp.battle_dome_battle');
  definition:=replace(definition,'into public.battle_dome_event','into pg_temp.battle_dome_event');
  definition:=replace(definition,'into public.battle_dome_command_receipt','into pg_temp.battle_dome_command_receipt');
  definition:=replace(definition,'from public.battle_dome_command_receipt','from pg_temp.battle_dome_command_receipt');
  definition:=replace(definition,'server_authority_private.runtime_transition_allowed','pg_temp.runtime_transition_allowed');
  execute definition;
end;
$clone$;
create trigger test_receipt_runtime before insert on battle_dome_command_receipt for each row execute function server_authority_private.record_command_runtime();
select set_config('request.jwt.claim.role','service_role',true);

do $test$
declare r uuid:=(select id from catalog_release); manifest jsonb; first_result jsonb; replay jsonb; command_id uuid:=gen_random_uuid(); input_hash text;
  snapshot jsonb:='{"snapshotVersion":3,"engineVersion":"pokemon-game-revival"}';
begin
  select jsonb_build_object('bundleChecksum',repeat('a',64),'snapshotVersion',3,'components',jsonb_object_agg(key,jsonb_build_object('checksum',repeat('a',64)))) into manifest
  from unnest(array['encounters','initialization','battle_core','move_effects','consumable_items','held_items','capture','progression','opponents_rewards','presentation']) key;
  perform pg_temp.activate_runtime_package(manifest,false);
  if exists(select 1 from runtime_deployment) then raise exception 'Staging activated the package';end if;
  perform pg_temp.activate_runtime_package(manifest,true);
  if not pg_temp.runtime_transition_allowed(r,'pokemon-game-revival',repeat('a',64),snapshot,1) then raise exception 'Initial package rejected';end if;
  insert into battle_dome_battle(id,creator_auth_user_id,challenger_auth_user_id,creator_username,challenger_username,
    catalog_release_id,status,battle_version,engine_version,engine_checksum,initial_participants,engine_snapshot,next_event_seq,creator_exited,challenger_exited,waiting_for)
    values('10000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000003',
    'fixture_creator','fixture_challenger',r,'active',5,'pokemon-game-revival',repeat('a',64),'[]',snapshot,1,false,false,'creator');
  manifest:=jsonb_set(manifest,'{bundleChecksum}',to_jsonb(repeat('b',64)));
  manifest:=jsonb_set(manifest,'{components,move_effects,checksum}',to_jsonb(repeat('b',64)));
  perform pg_temp.activate_runtime_package(manifest,true);
  begin
    perform pg_temp.runtime_transition_allowed(r,'pokemon-game-revival',repeat('a',64),snapshot,1);
    raise exception 'Old in-flight package accepted';
  exception when sqlstate 'PGRST' then null;end;
  begin
    perform pg_temp.runtime_transition_allowed(r,'pokemon-game-revival',repeat('b',64),snapshot,1);
    raise exception 'Old catalog generation accepted';
  exception when sqlstate 'PGRST' then null;end;
  begin
    perform pg_temp.runtime_transition_allowed(r,'pokemon-game-revival',repeat('b',64),jsonb_set(snapshot,'{snapshotVersion}','4'),2);
    raise exception 'Incompatible snapshot accepted';
  exception when feature_not_supported then null;end;
  input_hash:=encode(extensions.digest(convert_to(snapshot::text,'UTF8'),'sha256'),'hex');
  first_result:=pg_temp.commit_dome('10000000-0000-4000-8000-000000000002',command_id,'move','same-command',
    '10000000-0000-4000-8000-000000000001',5,'pokemon-game-revival',repeat('b',64),input_hash,snapshot||'{"next":true}',
    '[{"type":"fixture","data":{}}]','{"runtime_generation":2,"status":"active","waiting_for":"admin","player_active_slot":0,"npc_active_slot":0}');
  if (select engine_checksum from battle_dome_battle)<>repeat('b',64)
    or (select battle_version from battle_dome_battle)<>6
    or (select runtime_components->>'move_effects' from battle_dome_command_receipt)<>repeat('b',64) then
    raise exception 'Live command failed to adopt/audit new components';end if;
  manifest:=jsonb_set(manifest,'{bundleChecksum}',to_jsonb(repeat('c',64)));
  manifest:=jsonb_set(manifest,'{components,capture,checksum}',to_jsonb(repeat('c',64)));
  perform pg_temp.activate_runtime_package(manifest,true);
  replay:=pg_temp.commit_dome('10000000-0000-4000-8000-000000000002',command_id,'move','same-command',
    '10000000-0000-4000-8000-000000000001',5,'pokemon-game-revival',repeat('b',64),input_hash,'{}','[]','{}');
  if replay<>first_result||'{"replayed":true}'::jsonb or (select count(*) from battle_dome_event)<>1
    or (select runtime_generation from battle_dome_command_receipt)<>2 then raise exception 'Replay changed after deployment';end if;
  begin
    perform pg_temp.activate_runtime_package(jsonb_set(manifest,'{snapshotVersion}','4'),true);
    raise exception 'Activation silently converted active state';
  exception when sqlstate '22023' or sqlstate '55000' then null;end;
  if server_authority_private.runtime_components_for_change('catalog_rarity_rule','{"catch_multiplier":90,"encounter_weight":100}',
    '{"catch_multiplier":90,"encounter_weight":200}')<>array['encounters'] then raise exception 'Encounter weights affect captures';end if;
  if server_authority_private.runtime_components_for_change('catalog_rarity_rule','{"catch_multiplier":90}','{"catch_multiplier":100}')<>array['capture'] then raise exception 'Capture component not isolated';end if;
end;
$test$;
select 'Granular runtime: staging, activation, live PvP transition, stale generation, schema rejection and replay passed' as result;
rollback;
