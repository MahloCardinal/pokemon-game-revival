-- Tests deployed functions on session-local copies. No real player is changed.
begin;
set local statement_timeout = '30s';
do $setup$
declare v_table text; v_signature text; v_definition text; v_function text;
begin
  foreach v_table in array array['player_pokemon_instance','player_ordinary_progression',
    'player_ordinary_progression_pokemon','player_pending_resolution','catalog_species_level_move','catalog_species_evolution'] loop
    execute format('create temporary table %I (like public.%I including all) on commit drop',v_table,v_table);
  end loop;
  foreach v_signature in array array[
    'server_authority_private.pokemon_max_hp_for_instance(uuid,integer)',
    'server_authority_private.pokemon_max_power_for_instance(uuid,integer)',
    'server_authority_private.pokemon_max_stats_for_instance(uuid,integer)',
    'server_authority_private.advance_ordinary_progression(uuid,uuid,bigint)'] loop
    v_definition := pg_get_functiondef(v_signature::regprocedure);
    foreach v_table in array array['player_pokemon_instance','player_ordinary_progression_pokemon',
      'player_ordinary_progression','player_pending_resolution','catalog_species_level_move','catalog_species_evolution'] loop
      v_definition := replace(v_definition,'public.'||v_table,'pg_temp.'||v_table);
    end loop;
    foreach v_function in array array['pokemon_max_hp_for_instance','pokemon_max_power_for_instance',
      'pokemon_max_stats_for_instance','advance_ordinary_progression'] loop
      v_definition := replace(v_definition,'server_authority_private.'||v_function,'pg_temp.'||v_function);
    end loop;
    execute v_definition;
  end loop;
end;
$setup$;

create function pg_temp.assert_segment(p_progression uuid,p_from integer,p_to integer,p_moves integer,p_evolutions integer)
returns jsonb language plpgsql as $$
declare v_user uuid; v_options jsonb;
begin
  select auth_user_id into strict v_user from pg_temp.player_ordinary_progression where id=p_progression;
  perform pg_temp.advance_ordinary_progression(v_user,p_progression,1);
  select options into strict v_options from pg_temp.player_pending_resolution
    where auth_user_id=v_user and status='pending';
  if (v_options #>> '{before_state,l}')::integer <> p_from
    or (v_options #>> '{after_state,l}')::integer <> p_to
    or jsonb_array_length(v_options->'level_moves') <> p_moves
    or jsonb_array_length(v_options->'evolutions') <> p_evolutions then
    raise exception 'Incorrect segment % -> %: %',p_from,p_to,v_options;
  end if;
  return v_options;
end;
$$;

-- Acknowledgement only in isolated test data; production keeps its existing
-- validated, idempotent resolver. Optional move mirrors the frozen free slot.
create function pg_temp.ack_segment(p_progression uuid,p_offer jsonb default null)
returns void language plpgsql as $$
begin
  if p_offer is not null then
    update pg_temp.player_pokemon_instance p set state=jsonb_set(state,'{m}',(state->'m')||jsonb_build_array(
      jsonb_build_array((p_offer->>'move_index')::int,(p_offer->>'power')::int,(p_offer->>'stats')::int)))
    where id=(select pokemon_instance_id from pg_temp.player_ordinary_progression_pokemon where progression_id=p_progression);
  end if;
  update pg_temp.player_pending_resolution set status='resolved'
    where id=(select pending_resolution_id from pg_temp.player_ordinary_progression_pokemon where progression_id=p_progression);
  update pg_temp.player_ordinary_progression_pokemon set status='pending',pending_resolution_id=null where progression_id=p_progression;
end;
$$;

do $test$
declare
  v_release uuid; v_user uuid; v_pokemon uuid; v_progression uuid; v_threshold integer;
  v_case text; v_options jsonb; v_after jsonb; v_expected_power integer; v_expected_stats integer; v_level integer;
begin
  select id into strict v_release from public.catalog_release where version='revival-baseline';
  select experience_reward into strict v_threshold from public.catalog_species where catalog_release_id=v_release and species_key='4';
  foreach v_case in array array['move','empty','known','evolution','refused','cap'] loop
    truncate pg_temp.catalog_species_level_move,pg_temp.catalog_species_evolution;
    v_user := gen_random_uuid();
    insert into pg_temp.player_pokemon_instance(auth_user_id,catalog_release_id,species_key,state)
    values(v_user,v_release,'4',jsonb_build_object('s','4','l',5,'hp',30,'xp',10*v_threshold+7,
      'm',jsonb_build_array(jsonb_build_array(25,1000,1000)))) returning id into v_pokemon;
    insert into pg_temp.player_ordinary_progression(auth_user_id,battle_id,catalog_release_id,contract_key,
      badge_count,level_cap,status,terminal_command_id)
    values(v_user,gen_random_uuid(),v_release,'capture',8,case when v_case='cap' then 10 else 100 end,
      'awaiting_choices',gen_random_uuid()) returning id into v_progression;
    insert into pg_temp.player_ordinary_progression_pokemon(progression_id,auth_user_id,pokemon_instance_id,
      award_order,team_slot,exp_awarded,ko_count,starting_species_key,starting_level,frozen_instance_revision,status,refused_species)
    values(v_progression,v_user,v_pokemon,0,0,10*v_threshold,1,'4',5,0,'pending',
      case when v_case='refused' then '["4"]'::jsonb else '[]'::jsonb end);
    if v_case in ('move','known') then
      insert into pg_temp.catalog_species_level_move(catalog_release_id,species_key,level,move_order,move_index)
      values(v_release,'4',8,0,case when v_case='known' then 25 else 245 end);
    end if;
    if v_case in ('evolution','refused') then
      insert into pg_temp.catalog_species_evolution(catalog_release_id,species_key,evolution_order,target_species_key,trigger_key,trigger_rules)
      values(v_release,'4',0,'5','level','{"level":10}'::jsonb);
    end if;
    if v_case='move' then
      v_options := pg_temp.assert_segment(v_progression,5,8,1,0);
      perform pg_temp.ack_segment(v_progression,v_options #> '{level_moves,0}');
      v_options := pg_temp.assert_segment(v_progression,8,15,0,0);
      if jsonb_array_length(v_options #> '{before_state,m}') <> 2 then raise exception 'New move missing at next segment start'; end if;
    elsif v_case='evolution' then
      v_options := pg_temp.assert_segment(v_progression,5,10,0,1);
      perform pg_temp.ack_segment(v_progression);
      -- Declining an offered evolution must remove it as a subsequent boundary.
      update pg_temp.player_ordinary_progression_pokemon set refused_species='["4"]' where progression_id=v_progression;
      v_options := pg_temp.assert_segment(v_progression,10,15,0,0);
    elsif v_case='cap' then
      v_options := pg_temp.assert_segment(v_progression,5,10,0,0);
    else
      v_options := pg_temp.assert_segment(v_progression,5,15,0,0);
    end if;
    v_after := v_options->'after_state';
    if (v_after->>'xp')::int <> (case when v_case='cap' then 0 else 7 end) then raise exception 'Incorrect EXP consumption'; end if;
    v_expected_power:=1000; v_expected_stats:=1000;
    for v_level in 6..(v_after->>'l')::int loop
      v_expected_power:=least(v_expected_power+2,pg_temp.pokemon_max_power_for_instance(v_pokemon,v_level));
      v_expected_stats:=least(v_expected_stats+2,pg_temp.pokemon_max_stats_for_instance(v_pokemon,v_level));
    end loop;
    if (v_after #>> '{m,0,1}')::int <> v_expected_power or (v_after #>> '{m,0,2}')::int <> v_expected_stats then
      raise exception 'Grouping must preserve per-level cap application';
    end if;
    perform pg_temp.ack_segment(v_progression);
    perform pg_temp.advance_ordinary_progression(v_user,v_progression,1);
    if exists(select 1 from pg_temp.player_pending_resolution where auth_user_id=v_user and status='pending')
      or (select status from pg_temp.player_ordinary_progression where id=v_progression)<>'completed' then
      raise exception 'Final acknowledgement must complete without an extra popup';
    end if;
  end loop;
end;
$test$;
rollback;
select 'Ordinary segments: 5->8->15, empty/known levels, evolution/refusal, cap, EXP and per-level growth passed' as result;
