-- Test deployed SQL on session-local copies. No account, battle or real Pokemon is changed.
begin;
set local statement_timeout = '30s';

do $fixtures$
declare
  v_table text;
  v_signature text;
  v_definition text;
  v_function text;
  v_release uuid;
  v_state jsonb;
  v_caps record;
  v_level integer;
  v_species text;
  v_shiny integer;
begin
  foreach v_table in array array['player_pokemon_instance', 'player_ordinary_progression',
    'player_ordinary_progression_pokemon', 'player_pending_resolution'] loop
    execute format('create temporary table %I (like public.%I including all) on commit drop', v_table, v_table);
  end loop;
  foreach v_signature in array array[
    'server_authority_private.pokemon_max_hp_for_instance(uuid,integer)',
    'server_authority_private.pokemon_max_power_for_instance(uuid,integer)',
    'server_authority_private.pokemon_max_stats_for_instance(uuid,integer)',
    'server_authority_private.validate_player_pokemon_shiny_state()',
    'server_authority_private.advance_ordinary_progression(uuid,uuid,bigint)'
  ] loop
    v_definition := pg_get_functiondef(v_signature::regprocedure);
    foreach v_table in array array['player_pokemon_instance', 'player_ordinary_progression_pokemon',
      'player_ordinary_progression', 'player_pending_resolution'] loop
      v_definition := replace(v_definition, 'public.' || v_table, 'pg_temp.' || v_table);
    end loop;
    foreach v_function in array array['pokemon_max_hp_for_instance', 'pokemon_max_power_for_instance',
      'pokemon_max_stats_for_instance', 'validate_player_pokemon_shiny_state', 'advance_ordinary_progression'] loop
      v_definition := replace(v_definition, 'server_authority_private.' || v_function, 'pg_temp.' || v_function);
    end loop;
    execute v_definition;
  end loop;

  select id into strict v_release from public.catalog_release where version = 'revival-baseline';
  -- Seed pre-existing excess before attaching the validation trigger, exactly
  -- as a catalog cap reduction leaves already-persisted Pokemon unchanged.
  foreach v_level in array array[8, 9, 19, 24, 29, 99] loop
    foreach v_species in array array['27', '150'] loop
      for v_shiny in 0..1 loop
        v_state := jsonb_build_object('s', v_species, 'l', v_level, 'hp', 1, 'xp', 0);
        if v_shiny = 1 then v_state := v_state || '{"sh":1}'::jsonb; end if;
        select * into strict v_caps from server_authority_private.pokemon_stat_caps(v_release, v_state);
        v_state := v_state || jsonb_build_object('hp',v_caps.max_hp+20,'m', jsonb_build_array(
          jsonb_build_array(25, v_caps.max_power + 3, v_caps.max_stats + 3),
          jsonb_build_array(245, 1, 1)));
        insert into pg_temp.player_pokemon_instance(auth_user_id, catalog_release_id, species_key, state)
        values(gen_random_uuid(), v_release, v_species, v_state);
      end loop;
    end loop;
  end loop;
end;
$fixtures$;

create trigger validate_caps before insert or update of state, catalog_release_id, debug_created
on pg_temp.player_pokemon_instance
for each row execute function pg_temp.validate_player_pokemon_shiny_state();

create function pg_temp.assert_caps_rejected(p_sql text) returns void language plpgsql as $$
begin
  begin
    execute p_sql;
  exception when sqlstate '22023' then
    return;
  end;
  raise exception 'Expected cap validation rejection: %', p_sql;
end;
$$;

do $guards$
declare
  v_pokemon pg_temp.player_pokemon_instance%rowtype;
  v_state jsonb;
begin
  select * into strict v_pokemon from pg_temp.player_pokemon_instance
  where species_key = '27' and state ->> 'l' = '8' and not (state ? 'sh');
  -- Existing values survive EXP and held-item updates, and reordering.
  update pg_temp.player_pokemon_instance set state = state || '{"xp":1,"i":1}'::jsonb
  where id = v_pokemon.id;
  update pg_temp.player_pokemon_instance
  set state = jsonb_set(state, '{m}', jsonb_build_array(state #> '{m,1}', state #> '{m,0}'))
  where id = v_pokemon.id;
  update pg_temp.player_pokemon_instance
  set state = jsonb_set(state, '{m}', jsonb_build_array(state #> '{m,1}', state #> '{m,0}'))
  where id = v_pokemon.id;

  foreach v_state in array array[
    jsonb_set(v_pokemon.state,'{hp}',to_jsonb((v_pokemon.state->>'hp')::int+1)),
    jsonb_set(v_pokemon.state, '{m,0,1}', to_jsonb((v_pokemon.state #>> '{m,0,1}')::int + 1)),
    jsonb_set(v_pokemon.state, '{m,0,2}', to_jsonb((v_pokemon.state #>> '{m,0,2}')::int + 1)),
    jsonb_set(v_pokemon.state, '{m,1,2}', v_pokemon.state #> '{m,0,2}'),
    jsonb_set(v_pokemon.state, '{m,0,0}', '9999'::jsonb),
    jsonb_set(v_pokemon.state, '{m,1,2}', '-1'::jsonb),
    jsonb_set(v_pokemon.state, '{l}', '9'::jsonb),
    jsonb_set(v_pokemon.state, '{s}', '28'::jsonb),
    v_pokemon.state || '{"sh":1}'::jsonb
  ] loop
    perform pg_temp.assert_caps_rejected(format(
      'update pg_temp.player_pokemon_instance set state=%L::jsonb where id=%L', v_state, v_pokemon.id));
  end loop;
  perform pg_temp.assert_caps_rejected(format(
    'insert into pg_temp.player_pokemon_instance(auth_user_id,catalog_release_id,species_key,state) values(%L,%L,%L,%L::jsonb)',
    gen_random_uuid(), v_pokemon.catalog_release_id, v_pokemon.species_key, v_pokemon.state));
  -- Reducing an excess is permitted; its previous higher value cannot be restored.
  update pg_temp.player_pokemon_instance
  set state = jsonb_set(state, '{m,0,2}', to_jsonb((state #>> '{m,0,2}')::int - 1)) where id=v_pokemon.id;
  perform pg_temp.assert_caps_rejected(format(
    'update pg_temp.player_pokemon_instance set state=%L::jsonb where id=%L', v_pokemon.state, v_pokemon.id));
end;
$guards$;

do $progression$
declare
  v_pokemon pg_temp.player_pokemon_instance%rowtype;
  v_progression uuid;
  v_threshold integer;
  v_after jsonb;
  v_before jsonb;
  v_caps record;
  v_count integer := 0;
begin
  for v_pokemon in select * from pg_temp.player_pokemon_instance loop
    v_before := v_pokemon.state;
    select experience_reward into strict v_threshold from public.catalog_species
    where catalog_release_id=v_pokemon.catalog_release_id and species_key=v_pokemon.species_key;
    -- Reproduce the terminal battle write that previously failed, first with
    -- insufficient EXP and then with exactly enough for the following level.
    update pg_temp.player_pokemon_instance set state=jsonb_set(state,'{xp}','1'::jsonb)
    where id=v_pokemon.id;
    insert into pg_temp.player_ordinary_progression(auth_user_id,battle_id,catalog_release_id,
      contract_key,badge_count,level_cap,status,terminal_command_id)
    values(v_pokemon.auth_user_id,gen_random_uuid(),v_pokemon.catalog_release_id,
      'capture',8,100,'awaiting_choices',gen_random_uuid()) returning id into v_progression;
    insert into pg_temp.player_ordinary_progression_pokemon(progression_id,auth_user_id,pokemon_instance_id,
      award_order,team_slot,exp_awarded,ko_count,starting_species_key,starting_level,frozen_instance_revision,status)
    values(v_progression,v_pokemon.auth_user_id,v_pokemon.id,0,0,v_threshold,1,
      v_pokemon.species_key,(v_pokemon.state->>'l')::int, v_pokemon.revision,'pending');
    perform pg_temp.advance_ordinary_progression(v_pokemon.auth_user_id,v_progression,1);
    select state into strict v_after from pg_temp.player_pokemon_instance where id=v_pokemon.id;
    if v_after->'hp' is distinct from v_before->'hp' or v_after->'m' is distinct from v_before->'m' or v_after->'l' is distinct from v_before->'l' then
      raise exception 'Insufficient EXP must not prematurely clamp or level up';
    end if;

    update pg_temp.player_pokemon_instance set state=jsonb_set(state,'{xp}',to_jsonb(v_threshold)) where id=v_pokemon.id;
    update pg_temp.player_ordinary_progression_pokemon set status='pending' where progression_id=v_progression;
    update pg_temp.player_ordinary_progression set status='awaiting_choices',completed_at=null where id=v_progression;
    perform pg_temp.advance_ordinary_progression(v_pokemon.auth_user_id,v_progression,2);
    select state into strict v_after from pg_temp.player_pokemon_instance where id=v_pokemon.id;
    select * into strict v_caps from server_authority_private.pokemon_stat_caps(v_pokemon.catalog_release_id,v_after);
    if (v_after->>'hp')::int <> least((v_before->>'hp')::int+3,v_caps.max_hp)
       or (v_after->>'l')::int <> (v_before->>'l')::int + 1
       or (v_after #>> '{m,0,1}')::int <> least((v_before #>> '{m,0,1}')::int + 2,v_caps.max_power)
       or (v_after #>> '{m,0,2}')::int <> least((v_before #>> '{m,0,2}')::int + 2,v_caps.max_stats)
       or (v_after #>> '{m,1,2}')::int <> least(3,v_caps.max_stats) then
      raise exception 'Level-up must clamp excess without boosting unaffected moves to the cap';
    end if;
    if not exists(select 1 from pg_temp.player_pending_resolution
      where pokemon_instance_id=v_pokemon.id and options->'after_state'=v_after
        and options->'before_state'->'m'=v_before->'m') then
      raise exception 'Level-up projection must preserve before/after values';
    end if;
    v_count := v_count+1;
  end loop;
  if v_count <> 24 then raise exception 'Incomplete progression coverage'; end if;
end;
$progression$;

select 'Passed: existing values, strict new caps, EXP before level-up, 24 normal/Shiny/Legendary checkpoint progressions' as result;
rollback;
