-- Clone the actual command bodies, including receipt/revision guards, onto
-- session-local tables. Never create accounts or mutate real player data.
begin;
set local statement_timeout = '30s';
do $setup$
declare v_table text; v_signature text; v_function text; v_definition text;
  v_tables text[] := array['player_pokemon_instance','player_pokemon_placement','player_daycare_state',
    'player_pending_resolution','player_profile_state','player_state_revision','player_command_receipt',
    'player_dex_entry','catalog_species_level_move','catalog_species_evolution'];
begin
  foreach v_table in array v_tables loop
    execute format('create temporary table %I (like public.%I including all) on commit drop',v_table,v_table);
  end loop;
  foreach v_signature in array array[
    'server_authority_private.daycare_segment_options(uuid)',
    'server_authority_private.continue_daycare_progression(uuid,text,boolean,bigint)',
    'public.preview_daycare_withdrawal(uuid)',
    'server_authority_private.execute_daycare_command_before_ordinary_guard(text,uuid,bigint,uuid,integer)',
    'server_authority_private.resolve_daycare_withdrawal_before_ordinary_guard(uuid,bigint,uuid,jsonb)'] loop
    v_definition := pg_get_functiondef(v_signature::regprocedure);
    foreach v_table in array v_tables loop
      v_definition := replace(v_definition,'public.'||v_table,'pg_temp.'||v_table);
    end loop;
    foreach v_function in array array['daycare_segment_options','continue_daycare_progression',
      'execute_daycare_command_before_ordinary_guard','resolve_daycare_withdrawal_before_ordinary_guard','player_state_projection'] loop
      v_definition := replace(v_definition,'server_authority_private.'||v_function,'pg_temp.'||v_function);
    end loop;
    v_definition := replace(v_definition,'public.preview_daycare_withdrawal','pg_temp.preview_daycare_withdrawal');
    execute v_definition;
  end loop;
end;
$setup$;
create function pg_temp.player_state_projection(p_user uuid) returns jsonb language sql as $$
  select jsonb_build_object('revision',revision) from pg_temp.player_state_revision where auth_user_id=p_user;
$$;

do $test$
declare
  v_release uuid; v_user uuid; v_pokemon uuid; v_id uuid; v_command uuid; v_revision bigint;
  v_case text; v_result jsonb; v_options jsonb; v_preview jsonb; v_choices jsonb; v_state jsonb;
  v_levels integer[]; v_expected integer[]; v_cost bigint; v_count integer; v_evolution text;
  v_money bigint := 100000; v_resolved jsonb;
begin
  select id into strict v_release from public.catalog_release where version='revival-baseline';
  select withdraw_base_cost+10*withdraw_level_cost into strict v_cost from public.catalog_daycare_rule where catalog_release_id=v_release;
  foreach v_case in array array['move','empty','known','evolution','declined','same_level','replacement','declined_move'] loop
    truncate pg_temp.catalog_species_level_move,pg_temp.catalog_species_evolution;
    v_user := gen_random_uuid(); v_levels := array[5]; v_count := 0;
    insert into pg_temp.player_profile_state(auth_user_id,catalog_release_id,trainer_index,pokedollars,badges,starter_status)
    values(v_user,v_release,1,v_money,8,'selected');
    insert into pg_temp.player_state_revision(auth_user_id,revision) values(v_user,1);
    insert into pg_temp.player_pokemon_instance(auth_user_id,catalog_release_id,species_key,state)
    values(v_user,v_release,'4',jsonb_build_object('s','4','l',5,'hp',30,'xp',7,
      'm',case when v_case in ('replacement','declined_move') then '[[25,20,10],[53,20,10],[54,20,10],[56,20,10]]'::jsonb
        else '[[25,20,10]]'::jsonb end)) returning id into v_pokemon;
    insert into pg_temp.player_pokemon_placement(pokemon_instance_id,auth_user_id,placement_type,slot_index)
    values(v_pokemon,v_user,'daycare',0);
    insert into pg_temp.player_daycare_state(pokemon_instance_id,auth_user_id,catalog_release_id,starting_level,deposited_at)
    select v_pokemon,v_user,v_release,5,clock_timestamp()-make_interval(secs=>10*level_interval_seconds+10)
    from public.catalog_daycare_rule where catalog_release_id=v_release;
    if v_case in ('move','known','replacement','declined_move') then
      insert into pg_temp.catalog_species_level_move(catalog_release_id,species_key,level,move_order,move_index)
      values(v_release,'4',8,0,case when v_case='known' then 25 else 55 end);
    end if;
    if v_case in ('evolution','declined','same_level') then
      insert into pg_temp.catalog_species_evolution(catalog_release_id,species_key,evolution_order,target_species_key,trigger_key,trigger_rules)
      values(v_release,'4',0,'5','level','{"level":8}');
      insert into pg_temp.catalog_species_level_move(catalog_release_id,species_key,level,move_order,move_index)
      values(v_release,'5',case when v_case='same_level' then 8 else 12 end,0,55);
    end if;
    perform set_config('request.jwt.claim.sub',v_user::text,true);
    v_command := gen_random_uuid();
    v_result := pg_temp.execute_daycare_command_before_ordinary_guard('daycare_withdraw',v_command,1,v_pokemon,null);
    if v_result <> pg_temp.execute_daycare_command_before_ordinary_guard('daycare_withdraw',v_command,1,v_pokemon,null) then
      raise exception 'Withdrawal replay must return the same receipt'; end if;
    if (select pokedollars from pg_temp.player_profile_state where auth_user_id=v_user) <> v_money-v_cost then
      raise exception 'The complete cycle must be charged once'; end if;
    loop
      v_count := v_count+1;
      if v_count>5 then raise exception 'Progression loop for %',v_case; end if;
      select pending_resolution_id into strict v_id from pg_temp.player_daycare_state where pokemon_instance_id=v_pokemon;
      select options,expected_revision into strict v_options,v_revision from pg_temp.player_pending_resolution where id=v_id;
      if (v_options->>'starting_level')::int <> v_levels[array_length(v_levels,1)] then raise exception 'Wrong start %',v_options; end if;
      v_levels := array_append(v_levels,(v_options->>'target_level')::int);
      v_preview := pg_temp.preview_daycare_withdrawal(v_id);
      if (v_preview#>>'{pokemon,l}')::int <> (v_options->>'target_level')::int then raise exception 'Wrong preview'; end if;
      v_evolution := case when jsonb_array_length(v_options->'evolutions')>0 and v_case<>'declined' then v_options#>>'{evolutions,0,target_species_key}' else null end;
      select jsonb_build_object('moves',coalesce(jsonb_agg(jsonb_build_object('offer_index',ordinal-1,
        'move_index',(offer->>'move_index')::int,'replacement_slot',case when v_case='replacement' then 1 else null end)
        order by ordinal),'[]'::jsonb),'evolution_target_species_key',v_evolution) into v_choices
      from jsonb_array_elements(v_options->'level_moves') with ordinality as offers(offer,ordinal);
      v_command := gen_random_uuid();
      v_result := pg_temp.resolve_daycare_withdrawal_before_ordinary_guard(v_command,v_revision,v_id,v_choices);
      if v_result <> pg_temp.resolve_daycare_withdrawal_before_ordinary_guard(v_command,v_revision,v_id,v_choices) then
        raise exception 'Segment replay must be idempotent'; end if;
      select state into strict v_state from pg_temp.player_pokemon_instance where id=v_pokemon;
      v_resolved := server_authority_private.evolve_pokemon_state(v_release,v_preview->'pokemon',v_evolution);
      if v_state->'hp' <> v_resolved->'hp' or v_state->'l' <> v_resolved->'l' then raise exception 'Preview growth mismatch'; end if;
      if v_evolution is not null and jsonb_array_length(v_options->'level_moves')=0
        and v_state->'m'<>v_resolved->'m' then raise exception 'Evolution bonus missing from daycare moves'; end if;
      if v_result->>'withdrawal_status'='completed' then exit; end if;
      if (select placement_type from pg_temp.player_pokemon_placement where pokemon_instance_id=v_pokemon)<>'daycare' then
        raise exception 'Pokemon must stay in daycare between segments'; end if;
    end loop;
    v_expected := case when v_case in ('empty','known') then array[5,15]
      when v_case='evolution' then array[5,8,12,15]
      when v_case='same_level' then array[5,8,8,15] else array[5,8,15] end;
    if v_levels <> v_expected then raise exception 'Wrong milestones for %: % expected %',v_case,v_levels,v_expected; end if;
    if (v_result->>'levels_gained')::int<>10 or (v_state->>'l')::int<>15
      or exists(select 1 from pg_temp.player_daycare_state where pokemon_instance_id=v_pokemon)
      or (select placement_type from pg_temp.player_pokemon_placement where pokemon_instance_id=v_pokemon)<>'team'
      or (select pokedollars from pg_temp.player_profile_state where auth_user_id=v_user)<>v_money-v_cost then
      raise exception 'Invalid completed cycle for %',v_case; end if;
    if (select count(*) from pg_temp.player_command_receipt where auth_user_id=v_user and result->>'withdrawal_status'='completed')<>1 then
      raise exception 'Only the final receipt may emit cycle completion'; end if;
    if v_case='declined_move' and exists(select 1 from jsonb_array_elements(v_state->'m') m where m->>0='55') then
      raise exception 'Declined move must not be learned'; end if;
    if v_case='replacement' and v_state#>>'{m,1,0}'<>'55' then raise exception 'Wrong replacement'; end if;
    if v_case in ('move','evolution','same_level') and not exists(select 1 from jsonb_array_elements(v_state->'m') m where m->>0='55') then
      raise exception 'Free-slot learning lost'; end if;
  end loop;
  if has_function_privilege('authenticated','server_authority_private.daycare_segment_options(uuid)','execute')
    or has_function_privilege('anon','server_authority_private.continue_daycare_progression(uuid,text,boolean,bigint)','execute') then
    raise exception 'Private helpers must not be browser executable'; end if;
end;
$test$;
rollback;
select 'Daycare segments: grouped levels, new-species learnset, same-level moves, refusals, canonical preview, single charge, revisions and idempotency passed' as result;
