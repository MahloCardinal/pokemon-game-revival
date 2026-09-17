-- Session-local fixtures only: no player, account, battle or reward is changed.
begin;
set local statement_timeout = '30s';
do $test$
declare
  v_table text;
  v_definition text;
  v_release uuid;
  v_user uuid := gen_random_uuid();
  v_pokemon uuid;
  v_resolution uuid;
  v_result jsonb;
  v_original jsonb := '{"s":"4","l":6,"hp":30,"xp":7,"m":[[25,20,10]],"sh":1}'::jsonb;
begin
  foreach v_table in array array['player_pending_resolution', 'player_pokemon_instance', 'player_daycare_state'] loop
    execute format('create temporary table %I (like public.%I including all) on commit drop', v_table, v_table);
  end loop;
  v_definition := pg_get_functiondef('public.preview_daycare_withdrawal(uuid)'::regprocedure);
  foreach v_table in array array['player_pending_resolution', 'player_pokemon_instance', 'player_daycare_state'] loop
    v_definition := replace(v_definition, 'public.' || v_table, 'pg_temp.' || v_table);
  end loop;
  execute replace(v_definition, 'public.preview_daycare_withdrawal', 'pg_temp.preview_daycare_withdrawal');

  select id into strict v_release from public.catalog_release where version = 'revival-baseline';
  insert into pg_temp.player_pokemon_instance(auth_user_id, catalog_release_id, species_key, state)
  values(v_user, v_release, '4', v_original) returning id into v_pokemon;
  insert into pg_temp.player_pending_resolution(auth_user_id,pokemon_instance_id,resolution_type,expected_revision,options)
  values(v_user,v_pokemon,'move',1,jsonb_build_object('source','daycare_withdrawal','starting_level',6,
    'target_level',10,'levels_gained',4,'level_cap',10,
    'level_moves','[{"level":7,"move_index":245}]'::jsonb)) returning id into v_resolution;
  insert into pg_temp.player_daycare_state(pokemon_instance_id,auth_user_id,catalog_release_id,starting_level,
    status,pending_levels,pending_cost,pending_resolution_id)
  values(v_pokemon,v_user,v_release,6,'withdraw_pending',4,0,v_resolution);
  perform set_config('request.jwt.claim.sub',v_user::text,true);
  v_result := pg_temp.preview_daycare_withdrawal(v_resolution);
  if v_result #> '{pokemon,m,0}' <> '[25,14,4]'::jsonb
    or (v_result #>> '{pokemon,l}')::int <> 10 or (v_result #>> '{pokemon,xp}')::int <> 0
    or (v_result #>> '{pokemon,hp}')::int <> 41
    or (v_result #>> '{level_moves,0,power}')::int <> 12
    or (v_result #>> '{level_moves,0,stats}')::int <> 4
    or v_result #>> '{pokemon,sh}' <> '1' then
    raise exception 'Preview differs from canonical daycare calculations: %',v_result;
  end if;
  if (select state from pg_temp.player_pokemon_instance where id=v_pokemon) <> v_original
    or (select options -> 'level_moves' from pg_temp.player_pending_resolution where id=v_resolution)
      <> '[{"level":7,"move_index":245}]'::jsonb then
    raise exception 'Preview must not mutate Pokemon or frozen offers';
  end if;
  perform set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
  begin
    perform pg_temp.preview_daycare_withdrawal(v_resolution);
    raise exception 'Another player must not read this preview';
  exception when no_data_found then null;
  end;
  perform set_config('request.jwt.claim.sub',v_user::text,true);
  update pg_temp.player_pending_resolution set status='resolved' where id=v_resolution;
  begin
    perform pg_temp.preview_daycare_withdrawal(v_resolution);
    raise exception 'Resolved withdrawals must not be previewable';
  exception when no_data_found then null;
  end;
  if has_function_privilege('anon','public.preview_daycare_withdrawal(uuid)','execute')
    or not has_function_privilege('authenticated','public.preview_daycare_withdrawal(uuid)','execute') then
    raise exception 'Incorrect preview permissions';
  end if;
end;
$test$;
rollback;
select 'Daycare preview: values, frozen state, ownership, lifecycle and grants passed' as result;
