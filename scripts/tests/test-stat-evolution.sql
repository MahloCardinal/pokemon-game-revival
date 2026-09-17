-- Actual command bodies on session-local tables; no real player data is written.
begin;
set local statement_timeout = '30s';
do $setup$
declare v_table text; v_signature text; v_function text; v_definition text;
  v_tables text[] := array['player_pokemon_instance','player_pokemon_placement','player_state_revision',
    'player_command_receipt','player_profile_state','player_inventory_item','player_dex_entry',
    'player_pending_resolution','player_ordinary_progression','player_ordinary_progression_pokemon',
    'player_training_progression','player_training_progression_pokemon','catalog_species_level_move','catalog_species_evolution'];
  v_functions text[] := array['resolve_edge_ordinary_progression','resolve_edge_training_pokemon',
    'execute_pokemon_center_command_before_ordinary_guard','advance_ordinary_progression','advance_training_progression',
    'training_level_move_offers','training_level_evolution_offers','pokemon_max_hp_for_instance',
    'pokemon_max_power_for_instance','pokemon_max_stats_for_instance','player_state_projection',
    'emit_ordinary_level_events','apply_mission_fact'];
begin
  foreach v_table in array v_tables loop
    execute format('create temporary table %I (like public.%I including all) on commit drop',v_table,v_table);
  end loop;
  foreach v_signature in array array[
    'server_authority_private.pokemon_max_hp_for_instance(uuid,integer)',
    'server_authority_private.pokemon_max_power_for_instance(uuid,integer)',
    'server_authority_private.pokemon_max_stats_for_instance(uuid,integer)',
    'server_authority_private.training_level_move_offers(uuid,uuid,uuid,text,integer,jsonb)',
    'server_authority_private.training_level_evolution_offers(uuid,text,integer,jsonb)',
    'server_authority_private.advance_ordinary_progression(uuid,uuid,bigint)',
    'server_authority_private.advance_training_progression(uuid,uuid,bigint)',
    'public.resolve_edge_ordinary_progression(uuid,uuid,bigint,uuid,jsonb)',
    'public.resolve_edge_training_pokemon(uuid,uuid,bigint,uuid,jsonb)',
    'public.execute_pokemon_center_command_before_ordinary_guard(uuid,bigint,uuid,text,integer,integer,text)'] loop
    v_definition := pg_get_functiondef(v_signature::regprocedure);
    -- Longest names first, so a table prefix never redirects another name twice.
    for v_table in select name from unnest(v_tables) name order by length(name) desc loop
      v_definition := replace(v_definition,'public.'||v_table,'pg_temp.'||v_table);
    end loop;
    foreach v_function in array v_functions loop
      v_definition := replace(v_definition,'server_authority_private.'||v_function,'pg_temp.'||v_function);
      v_definition := replace(v_definition,'public.'||v_function,'pg_temp.'||v_function);
    end loop;
    execute v_definition;
  end loop;
end;
$setup$;
-- Unrelated projection/mission side effects stay local; progression and receipts are real.
create function pg_temp.player_state_projection(uuid) returns jsonb language sql as $$
  select jsonb_build_object('revision',revision) from pg_temp.player_state_revision where auth_user_id=$1;
$$;
create function pg_temp.emit_ordinary_level_events(uuid,uuid,uuid) returns void language sql as $$ select; $$;
create function pg_temp.apply_mission_fact(uuid,text,jsonb,timestamptz) returns void language sql as $$ select; $$;
create trigger validate_caps before insert or update of state,catalog_release_id,debug_created
  on pg_temp.player_pokemon_instance for each row execute function server_authority_private.validate_player_pokemon_shiny_state();

do $calculations$
declare v_release uuid; v_state jsonb; v_after jsonb; v_caps record; v_species text; v_shiny integer; v_level integer;
begin
  select id into strict v_release from public.catalog_release where version='revival-baseline';
  if (select count(*) from public.catalog_level_rule where catalog_release_id=v_release and level between 5 and 100)<>96 then
    raise exception 'Every playable level requires a stat rule'; end if;
  if not exists(select 1 from public.catalog_level_rule where catalog_release_id=v_release and level=30
    and row(base_hp,base_power,base_stats,normal_max_hp,normal_max_power,normal_max_stats,shiny_hp_bonus,shiny_power_bonus,shiny_stats_bonus,
      evolution_hp_bonus,evolution_power_bonus,evolution_stats_bonus)=row(100,53,14,109,69,20,9,6,5,4,4,2))
    or not exists(select 1 from public.catalog_level_rule where catalog_release_id=v_release and level=70
    and row(base_hp,base_power,base_stats,normal_max_hp,normal_max_power,normal_max_stats,shiny_hp_bonus,shiny_power_bonus,shiny_stats_bonus,
      evolution_hp_bonus,evolution_power_bonus,evolution_stats_bonus)=row(290,200,80,310,260,110,20,15,15,8,15,8)) then
    raise exception 'Canonical catalog differs from stat table checkpoints'; end if;
  foreach v_species in array array['4','150'] loop
    for v_shiny in 0..1 loop
      for v_level in 5..100 loop
        v_state := jsonb_build_object('s',v_species,'l',v_level,'hp',1,'m','[[25,0,0],[55,0,0]]'::jsonb);
        if v_shiny=1 then v_state:=v_state||'{"sh":1}'::jsonb; end if;
        select * into strict v_caps from server_authority_private.pokemon_stat_caps(v_release,v_state);
        if v_caps.max_hp <> (select normal_max_hp+v_shiny*shiny_hp_bonus+case when v_species='150' then legendary_hp_bonus else 0 end
          from public.catalog_level_rule where catalog_release_id=v_release and level=v_level) then raise exception 'Wrong rarity cap'; end if;
        v_after:=server_authority_private.evolve_pokemon_state(v_release,v_state,case when v_species='150' then '151' else '5' end);
        if (v_after->>'hp')::int <> 1+(select evolution_hp_bonus from public.catalog_level_rule where catalog_release_id=v_release and level=v_level)
          or v_after#>'{m,0,1}' <> v_after#>'{m,1,1}' or v_after#>'{m,0,2}' <> v_after#>'{m,1,2}' then
          raise exception 'Every move and HP must receive the level-specific bonus'; end if;
        if server_authority_private.evolve_pokemon_state(v_release,v_after,v_after->>'s')<>v_after
          or server_authority_private.evolve_pokemon_state(v_release,v_state,null)<>v_state then raise exception 'No bonus without evolution'; end if;
      end loop;
    end loop;
  end loop;
  select * into strict v_caps from server_authority_private.pokemon_stat_caps(v_release,'{"s":"4","l":70,"sh":1}');
  if row(v_caps.max_hp,v_caps.max_power,v_caps.max_stats)<>row(330,275,125) then raise exception 'Wrong level 70 Shiny caps'; end if;
  v_state:='{"s":"4","l":30,"hp":999,"m":[[25,999,999]]}';
  if server_authority_private.grow_pokemon_state(v_release,v_state,30)<>v_state then raise exception 'Zero levels must preserve excess'; end if;
  v_after:=server_authority_private.grow_pokemon_state(v_release,v_state,31);
  if v_after->>'hp'<>'114' or v_after->'m'<>'[[25,73,22]]'::jsonb then raise exception 'Level-up must clamp old excess'; end if;
  if has_function_privilege('authenticated','server_authority_private.evolve_pokemon_state(uuid,jsonb,text)','execute')
    or has_function_privilege('anon','server_authority_private.grow_pokemon_state(uuid,jsonb,integer)','execute') then
    raise exception 'Browser roles cannot invoke internal stat mutations'; end if;
end;
$calculations$;

do $commands$
declare v_release uuid; v_user uuid; v_pokemon uuid; v_progression uuid; v_resolution uuid; v_command uuid;
  v_source text; v_case text; v_before jsonb; v_expected jsonb; v_after jsonb; v_options jsonb; v_choices jsonb;
  v_result jsonb; v_replay jsonb; v_target text; v_caps record;
begin
  select id into strict v_release from public.catalog_release where version='revival-baseline';
  perform set_config('request.jwt.claim.role','service_role',true);
  foreach v_source in array array['ordinary','training'] loop
    foreach v_case in array array['bonus','capped','declined','shiny','learned'] loop
      v_user:=gen_random_uuid(); v_progression:=gen_random_uuid(); v_command:=gen_random_uuid();
      v_target:=case when v_case='declined' then null else '5' end;
      v_before:='{"s":"4","l":30,"hp":80,"xp":0,"m":[[25,30,10],[53,32,11],[54,33,12]]}';
      if v_case='shiny' then v_before:=v_before||'{"sh":1}'::jsonb; end if;
      if v_case='capped' then
        v_before:=v_before||'{"hp":109,"m":[[25,69,20],[53,69,20],[54,69,20]]}'::jsonb;
      end if;
      insert into pg_temp.player_state_revision(auth_user_id,revision) values(v_user,1);
      insert into pg_temp.player_pokemon_instance(auth_user_id,catalog_release_id,species_key,state)
        values(v_user,v_release,'4',v_before) returning id into v_pokemon;
      v_options:=jsonb_build_object('source',v_source,'progression_id',v_progression,'level',30,'target_level',30,
        'levels_gained',0,'proposal_instance_revision',0,'level_moves',case when v_case='learned'
          then '[{"move_index":55,"power":34,"stats":13}]'::jsonb else '[]'::jsonb end,
        'evolutions','[{"target_species_key":"5"}]'::jsonb);
      insert into pg_temp.player_pending_resolution(auth_user_id,pokemon_instance_id,resolution_type,options,expected_revision)
        values(v_user,v_pokemon,'evolution',v_options,1) returning id into v_resolution;
      v_choices:=jsonb_build_object('evolutionTargetSpeciesKey',v_target,'moves',case when v_case='learned'
        then '[{"offerIndex":0,"moveIndex":55,"replacementSlot":null}]'::jsonb else '[]'::jsonb end);
      v_expected:=v_before;
      if v_case='learned' then v_expected:=jsonb_set(v_expected,'{m}',(v_expected->'m')||'[[55,34,13]]'::jsonb); end if;
      if v_source='ordinary' then
        insert into pg_temp.player_ordinary_progression(id,auth_user_id,battle_id,catalog_release_id,contract_key,
          badge_count,level_cap,status,terminal_command_id)
          values(v_progression,v_user,gen_random_uuid(),v_release,'capture',8,100,'awaiting_choices',gen_random_uuid());
        insert into pg_temp.player_ordinary_progression_pokemon(progression_id,auth_user_id,pokemon_instance_id,
          award_order,team_slot,exp_awarded,ko_count,starting_species_key,starting_level,frozen_instance_revision,status,pending_resolution_id)
          values(v_progression,v_user,v_pokemon,0,0,1,1,'4',30,0,'awaiting_choice',v_resolution);
        v_result:=pg_temp.resolve_edge_ordinary_progression(v_user,v_command,1,v_resolution,v_choices);
        v_replay:=pg_temp.resolve_edge_ordinary_progression(v_user,v_command,1,v_resolution,v_choices);
      else
        insert into pg_temp.player_training_progression(id,auth_user_id,battle_id,catalog_release_id,difficulty,reward_kind,
          money_awarded,levels_awarded,assignable_levels,forfeited_levels,max_levels_per_pokemon,level_cap,badge_count,status,terminal_command_id)
          values(v_progression,v_user,gen_random_uuid(),v_release,'easy','repeat',0,0,0,0,3,100,8,'awaiting_choices',gen_random_uuid());
        insert into pg_temp.player_training_progression_pokemon(progression_id,auth_user_id,pokemon_instance_id,team_slot,
          battle_instance_revision,frozen_instance_revision,starting_species_key,starting_level,max_assignable,allocated_levels,pending_resolution_id)
          values(v_progression,v_user,v_pokemon,0,0,0,'4',30,3,0,v_resolution);
        v_result:=pg_temp.resolve_edge_training_pokemon(v_user,v_command,1,v_resolution,v_choices);
        v_replay:=pg_temp.resolve_edge_training_pokemon(v_user,v_command,1,v_resolution,v_choices);
      end if;
      select state into strict v_after from pg_temp.player_pokemon_instance where id=v_pokemon;
      v_expected:=server_authority_private.evolve_pokemon_state(v_release,v_expected,v_target);
      if v_after<>v_expected or v_replay<>v_result then raise exception 'Evolution/replay differs: % %: %',v_source,v_case,v_after; end if;
      if v_case='bonus' and (v_after->>'hp'<>'84' or v_after->'m'<>'[[25,34,12],[53,36,13],[54,37,14]]'::jsonb) then
        raise exception 'Missing bonus in actual command'; end if;
      if (select revision from pg_temp.player_state_revision where auth_user_id=v_user)<>2
        or (select revision from pg_temp.player_pokemon_instance where id=v_pokemon)<>1 then raise exception 'Replay mutated revisions'; end if;
    end loop;
  end loop;
end;
$commands$;

do $training_growth$
declare v_release uuid; v_user uuid:=gen_random_uuid(); v_pokemon uuid; v_progression uuid; v_state jsonb;
begin
  select id into strict v_release from public.catalog_release where version='revival-baseline';
  insert into pg_temp.player_pokemon_instance(auth_user_id,catalog_release_id,species_key,state)
    values(v_user,v_release,'4','{"s":"4","l":10,"hp":38,"xp":0,"m":[[25,12,3]]}') returning id into v_pokemon;
  insert into pg_temp.player_training_progression(auth_user_id,battle_id,catalog_release_id,difficulty,reward_kind,
    money_awarded,levels_awarded,assignable_levels,forfeited_levels,max_levels_per_pokemon,level_cap,badge_count,status,terminal_command_id)
    values(v_user,gen_random_uuid(),v_release,'easy','repeat',0,3,3,0,3,100,8,'awaiting_choices',gen_random_uuid()) returning id into v_progression;
  insert into pg_temp.player_training_progression_pokemon(progression_id,auth_user_id,pokemon_instance_id,team_slot,
    battle_instance_revision,frozen_instance_revision,starting_species_key,starting_level,max_assignable,allocated_levels)
    values(v_progression,v_user,v_pokemon,0,0,0,'4',10,3,3);
  perform pg_temp.advance_training_progression(v_user,v_progression,1);
  select state into strict v_state from pg_temp.player_pokemon_instance where id=v_pokemon;
  if v_state->>'hp'<>'46' or v_state->>'l'<>'13' then raise exception 'Training skipped intermediate caps: %',v_state; end if;
end;
$training_growth$;

do $stone$
declare v_release uuid; v_user uuid:=gen_random_uuid(); v_pokemon uuid; v_command uuid:=gen_random_uuid();
  v_species text; v_target text; v_item integer; v_result jsonb; v_after jsonb;
begin
  select id into strict v_release from public.catalog_release where version='revival-baseline';
  select species_key,target_species_key,(trigger_rules#>>'{item,itemIndex}')::int into strict v_species,v_target,v_item
    from public.catalog_species_evolution where catalog_release_id=v_release and species_key='133' and target_species_key='134' and trigger_key='item';
  insert into pg_temp.catalog_species_evolution select * from public.catalog_species_evolution
    where catalog_release_id=v_release and species_key=v_species and target_species_key=v_target;
  perform set_config('request.jwt.claim.sub',v_user::text,true);
  insert into pg_temp.player_state_revision(auth_user_id,revision) values(v_user,1);
  insert into pg_temp.player_profile_state(auth_user_id,catalog_release_id,trainer_index,pokedollars,badges,starter_status)
    values(v_user,v_release,1,100,8,'selected');
  insert into pg_temp.player_pokemon_instance(auth_user_id,catalog_release_id,species_key,state)
    values(v_user,v_release,v_species,jsonb_build_object('s',v_species,'l',30,'hp',80,'xp',0,'m','[[25,30,10],[55,31,11]]'::jsonb)) returning id into v_pokemon;
  insert into pg_temp.player_pokemon_placement(pokemon_instance_id,auth_user_id,placement_type,slot_index) values(v_pokemon,v_user,'team',0);
  insert into pg_temp.player_inventory_item(auth_user_id,catalog_release_id,item_index,quantity) values(v_user,v_release,v_item,2);
  v_result:=pg_temp.execute_pokemon_center_command_before_ordinary_guard(v_command,1,v_pokemon,'evolve',v_item,null,v_target);
  if v_result<>pg_temp.execute_pokemon_center_command_before_ordinary_guard(v_command,1,v_pokemon,'evolve',v_item,null,v_target) then raise exception 'Stone replay differs'; end if;
  select state into strict v_after from pg_temp.player_pokemon_instance where id=v_pokemon;
  if v_after->>'s'<>v_target or v_after->>'hp'<>'84' or v_after->'m'<>'[[25,34,12],[55,35,13]]'::jsonb
    or (select quantity from pg_temp.player_inventory_item where auth_user_id=v_user and item_index=v_item)<>1 then
    raise exception 'Stone evolution must grant and consume once: %',v_after; end if;
end;
$stone$;
rollback;
select 'Stat evolution: all levels/rarities, real ordinary/training/stone commands, all moves, caps, refusals, replay and grouped growth passed' as result;
