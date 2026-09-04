begin;

-- Freeze the complete paid withdrawal separately from each pending choice.
-- The record disappears with the daycare row when the Pokemon returns to team.
lock table public.player_daycare_state in share row exclusive mode;
do $$ begin
  if exists (select 1 from public.player_daycare_state where status = 'withdraw_pending') then
    raise exception 'Finish pending daycare withdrawals before installing segmented progression';
  end if;
end $$;
alter table public.player_daycare_state add column progression jsonb;
alter table public.player_daycare_state add constraint daycare_progression_object
  check (progression is null or jsonb_typeof(progression) = 'object');

create function server_authority_private.daycare_segment_options(p_pokemon_id uuid)
returns jsonb language plpgsql stable security definer set search_path = pg_catalog as $$
declare
  v_instance public.player_pokemon_instance%rowtype;
  v_daycare public.player_daycare_state%rowtype;
  v_start integer;
  v_target integer;
  v_min_move integer;
  v_slot integer;
  v_moves jsonb;
  v_evolutions jsonb;
begin
  select * into strict v_instance from public.player_pokemon_instance where id = p_pokemon_id;
  select * into strict v_daycare from public.player_daycare_state where pokemon_instance_id = p_pokemon_id;
  if v_daycare.progression is null then
    raise exception 'Daycare progression is not initialized' using errcode = '22023';
  end if;
  select slot_index into strict v_slot from public.player_pokemon_placement
  where pokemon_instance_id = p_pokemon_id and placement_type = 'daycare';
  v_start := (v_instance.state ->> 'l')::integer;
  v_target := (v_daycare.progression ->> 'target_level')::integer;
  -- After evolution, offer moves of the new species at the same level once.
  v_min_move := v_start + case when coalesce((v_daycare.progression ->> 'include_current_moves')::boolean, false) then 0 else 1 end;
  select least(v_target, min(move.level)) into v_target
  from public.catalog_species_level_move move
  where move.catalog_release_id = v_instance.catalog_release_id and move.species_key = v_instance.species_key
    and move.level >= v_min_move and move.level <= v_target
    and not exists (select 1 from jsonb_array_elements(v_instance.state -> 'm') known where (known ->> 0)::integer = move.move_index);
  if not (v_daycare.progression -> 'declined_species' ? v_instance.species_key) then
    select least(v_target, min(greatest(v_start, (evolution.trigger_rules ->> 'level')::integer))) into v_target
    from public.catalog_species_evolution evolution
    where evolution.catalog_release_id = v_instance.catalog_release_id and evolution.species_key = v_instance.species_key
      and evolution.trigger_key = 'level' and (evolution.trigger_rules ->> 'level')::integer <= v_target;
  end if;
  select coalesce(jsonb_agg(jsonb_build_object('level', move.level, 'move_index', move.move_index,
    'move_order', move.move_order, 'name', catalog_move.display_name) order by move.level, move.move_order), '[]'::jsonb)
  into v_moves from public.catalog_species_level_move move
  join public.catalog_move catalog_move using (catalog_release_id, move_index)
  where move.catalog_release_id = v_instance.catalog_release_id and move.species_key = v_instance.species_key
    and move.level >= v_min_move and move.level <= v_target
    and not exists (select 1 from jsonb_array_elements(v_instance.state -> 'm') known where (known ->> 0)::integer = move.move_index);
  select coalesce(jsonb_agg(jsonb_build_object('target_species_key', evolution.target_species_key,
    'evolution_order', evolution.evolution_order, 'trigger_level', (evolution.trigger_rules ->> 'level')::integer)
    order by evolution.evolution_order), '[]'::jsonb) into v_evolutions
  from public.catalog_species_evolution evolution
  where evolution.catalog_release_id = v_instance.catalog_release_id and evolution.species_key = v_instance.species_key
    and evolution.trigger_key = 'level' and (evolution.trigger_rules ->> 'level')::integer <= v_target
    and not (v_daycare.progression -> 'declined_species' ? v_instance.species_key);
  return jsonb_build_object('source', 'daycare_withdrawal', 'daycare_slot_index', v_slot,
    'starting_level', v_start, 'target_level', v_target, 'levels_gained', v_target - v_start,
    'charged_cost', v_daycare.progression -> 'charged_cost', 'level_cap', v_daycare.progression -> 'level_cap',
    'level_moves', v_moves, 'evolutions', v_evolutions);
end;
$$;

create function server_authority_private.continue_daycare_progression(
  p_pokemon_id uuid, p_old_species text, p_declined_evolution boolean, p_revision bigint
) returns boolean language plpgsql security definer set search_path = pg_catalog as $$
declare
  v_instance public.player_pokemon_instance%rowtype;
  v_options jsonb;
  v_id uuid;
begin
  select * into strict v_instance from public.player_pokemon_instance where id = p_pokemon_id;
  update public.player_daycare_state set progression = progression || jsonb_build_object(
    'include_current_moves', v_instance.species_key <> p_old_species,
    'declined_species', case when p_declined_evolution then (progression -> 'declined_species') || to_jsonb(p_old_species)
      else progression -> 'declined_species' end
  ) where pokemon_instance_id = p_pokemon_id;
  v_options := server_authority_private.daycare_segment_options(p_pokemon_id);
  if (v_options ->> 'levels_gained')::integer = 0 and jsonb_array_length(v_options -> 'level_moves') = 0
    and jsonb_array_length(v_options -> 'evolutions') = 0 then return false; end if;
  insert into public.player_pending_resolution(auth_user_id,pokemon_instance_id,resolution_type,options,expected_revision)
  values(v_instance.auth_user_id, p_pokemon_id,
    case when jsonb_array_length(v_options -> 'evolutions') > 0 then 'evolution' else 'move' end,
    v_options, p_revision) returning id into v_id;
  update public.player_daycare_state set starting_level = (v_instance.state ->> 'l')::integer,
    pending_levels = (v_options ->> 'levels_gained')::integer, pending_resolution_id = v_id, updated_at = now()
  where pokemon_instance_id = p_pokemon_id;
  return true;
end;
$$;
revoke all on function server_authority_private.daycare_segment_options(uuid) from public, anon, authenticated, service_role;
revoke all on function server_authority_private.continue_daycare_progression(uuid,text,boolean,bigint) from public, anon, authenticated, service_role;

-- Keep the existing command guards, locks, shape validation, move reducer and
-- idempotent receipts; replace only construction/continuation of the segments.
do $migration$
declare
  v_definition text;
  v_start integer;
  v_end integer;
begin
  v_definition := pg_get_functiondef('server_authority_private.execute_daycare_command_before_ordinary_guard(text,uuid,bigint,uuid,integer)'::regprocedure);
  v_start := strpos(v_definition, '    if v_has_move_choice or v_has_evolution_choice then');
  v_end := strpos(v_definition, '      insert into public.player_pending_resolution (');
  if v_start = 0 or v_end <= v_start then raise exception 'Daycare initialization anchor not found'; end if;
  v_definition := substring(v_definition, 1, v_start - 1) || $replacement$
    if v_levels > 0 or v_has_move_choice or v_has_evolution_choice then
      update public.player_daycare_state set progression = jsonb_build_object(
        'starting_level', v_level, 'target_level', v_target_level, 'charged_cost', v_cost,
        'level_cap', v_level_cap, 'declined_species', '[]'::jsonb, 'include_current_moves', false
      ) where pokemon_instance_id = p_pokemon_instance_id;
      v_resolution_options := server_authority_private.daycare_segment_options(p_pokemon_instance_id);
      v_levels := (v_resolution_options ->> 'levels_gained')::integer;
      v_has_evolution_choice := jsonb_array_length(v_resolution_options -> 'evolutions') > 0;
$replacement$ || substring(v_definition, v_end);
  execute v_definition;

  v_definition := pg_get_functiondef('server_authority_private.resolve_daycare_withdrawal_before_ordinary_guard(uuid,bigint,uuid,jsonb)'::regprocedure);
  v_definition := replace(v_definition, '  v_result jsonb;', '  v_result jsonb; v_has_next boolean;');
  v_start := strpos(v_definition, '  -- Catalog content is immutable');
  v_end := strpos(v_definition, '  if (jsonb_array_length(v_catalog_evolutions)');
  if v_start = 0 or v_end <= v_start then raise exception 'Daycare validation anchor not found'; end if;
  v_definition := substring(v_definition, 1, v_start - 1) || $replacement$
  v_result := server_authority_private.daycare_segment_options(v_instance.id);
  if v_result <> v_resolution.options then
    raise exception 'frozen daycare segment does not match the catalog' using errcode = '22023';
  end if;
  v_catalog_level_moves := v_result -> 'level_moves';
  v_catalog_evolutions := v_result -> 'evolutions';
$replacement$ || substring(v_definition, v_end);
  v_start := strpos(v_definition, '  delete from public.player_daycare_state');
  v_end := strpos(v_definition, '  update public.player_state_revision set revision = revision + 1');
  if v_start = 0 or v_end <= v_start then raise exception 'Daycare continuation anchor not found'; end if;
  v_definition := substring(v_definition, 1, v_start - 1) || $replacement$
  v_has_next := server_authority_private.continue_daycare_progression(v_instance.id, v_instance.species_key,
    v_evolution_target is null and jsonb_array_length(v_catalog_evolutions) > 0, v_current_revision + 1);
  if not v_has_next then
    -- Completion facts use the whole paid cycle, including a final zero-level evolution.
    v_levels_gained := (v_daycare.progression ->> 'target_level')::integer - (v_daycare.progression ->> 'starting_level')::integer;
    delete from public.player_daycare_state where pokemon_instance_id = v_instance.id and auth_user_id = v_auth_user_id;
    update public.player_pokemon_placement set placement_type = 'team', slot_index = v_team_count,
      box_index = null, updated_at = now() where pokemon_instance_id = v_instance.id and auth_user_id = v_auth_user_id;
  end if;
$replacement$ || substring(v_definition, v_end);
  if strpos(v_definition, '''withdrawal_status'', ''completed''') = 0 then raise exception 'Daycare receipt anchor not found'; end if;
  v_definition := replace(v_definition, '''withdrawal_status'', ''completed''',
    '''withdrawal_status'', case when v_has_next then ''resolution_required'' else ''completed'' end');
  execute v_definition;
end;
$migration$;

commit;
