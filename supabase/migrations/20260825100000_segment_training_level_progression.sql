alter table public.player_training_progression_pokemon
  add column refused_species jsonb not null default '[]'::jsonb;

alter table public.player_training_progression_pokemon
  add constraint player_training_progression_pokemon_refused_species_check
  check (jsonb_typeof(refused_species) = 'array');

create or replace function server_authority_private.training_level_move_offers(
  p_catalog_release_id uuid,
  p_progression_id uuid,
  p_pokemon_instance_id uuid,
  p_species_key text,
  p_level integer,
  p_moves jsonb
) returns jsonb
language sql
stable
security definer
set search_path = public, server_authority_private, extensions, pg_temp
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'level', learned.level,
    'move_index', learned.move_index,
    'move_order', learned.move_order,
    'name', move.display_name,
    'power', least(
      coalesce((select max(server_authority_private.edge_jsonb_bigint(known.value -> 1))
        from jsonb_array_elements(p_moves) known(value)), level_rule.base_power)
        + 2 + mod(get_byte(digest(convert_to(
          p_progression_id::text || ':' || p_pokemon_instance_id::text || ':' || learned.move_index::text || ':power',
          'UTF8'), 'sha256'), 0), 2),
      level_rule.max_power
    ),
    'stats', least(
      coalesce((select max(server_authority_private.edge_jsonb_bigint(known.value -> 2))
        from jsonb_array_elements(p_moves) known(value)), level_rule.base_stats)
        + 2 + mod(get_byte(digest(convert_to(
          p_progression_id::text || ':' || p_pokemon_instance_id::text || ':' || learned.move_index::text || ':stats',
          'UTF8'), 'sha256'), 0), 2),
      level_rule.max_stats
    )
  ) order by learned.move_order), '[]'::jsonb)
  from public.catalog_species_level_move learned
  join public.catalog_move move
    on move.catalog_release_id = learned.catalog_release_id
   and move.move_index = learned.move_index
  join public.catalog_level_rule level_rule
    on level_rule.catalog_release_id = learned.catalog_release_id
   and level_rule.level = p_level
  where learned.catalog_release_id = p_catalog_release_id
    and learned.species_key = p_species_key
    and learned.level = p_level
    and not exists (
      select 1 from jsonb_array_elements(p_moves) known(value)
      where server_authority_private.edge_jsonb_bigint(known.value -> 0) = learned.move_index
    );
$$;

create or replace function server_authority_private.training_level_evolution_offers(
  p_catalog_release_id uuid,
  p_species_key text,
  p_level integer,
  p_refused_species jsonb
) returns jsonb
language sql
stable
security definer
set search_path = public, server_authority_private, pg_temp
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'target_species_key', evolution.target_species_key,
    'evolution_order', evolution.evolution_order,
    'trigger_level', (evolution.trigger_rules ->> 'level')::integer
  ) order by evolution.evolution_order), '[]'::jsonb)
  from public.catalog_species_evolution evolution
  where evolution.catalog_release_id = p_catalog_release_id
    and evolution.species_key = p_species_key
    and evolution.trigger_key = 'level'
    and (evolution.trigger_rules ->> 'level')::integer = p_level
    and not (coalesce(p_refused_species, '[]'::jsonb) ? p_species_key);
$$;

create or replace function server_authority_private.advance_training_progression(
  p_auth_user_id uuid,
  p_progression_id uuid,
  p_resulting_revision bigint
) returns void
language plpgsql
security definer
set search_path = public, server_authority_private, extensions, pg_temp
as $$
declare
  v_progression public.player_training_progression%rowtype;
  v_entry public.player_training_progression_pokemon%rowtype;
  v_instance public.player_pokemon_instance%rowtype;
  v_current_level integer;
  v_final_level integer;
  v_next_move_level integer;
  v_next_evolution_level integer;
  v_segment_level integer;
  v_levels_gained integer;
  v_rule public.catalog_level_rule%rowtype;
  v_moves jsonb;
  v_offers jsonb;
  v_evolutions jsonb;
  v_before_state jsonb;
  v_after_state jsonb;
  v_resolution_id uuid;
begin
  select * into strict v_progression
  from public.player_training_progression
  where id = p_progression_id and auth_user_id = p_auth_user_id
  for update;

  if exists (
    select 1
    from public.player_training_progression_pokemon eligible
    join public.player_pending_resolution resolution on resolution.id = eligible.pending_resolution_id
    where eligible.progression_id = p_progression_id and resolution.status = 'pending'
  ) then
    return;
  end if;

  loop
    select eligible.* into v_entry
    from public.player_training_progression_pokemon eligible
    join public.player_pokemon_instance pokemon
      on pokemon.id = eligible.pokemon_instance_id and pokemon.auth_user_id = p_auth_user_id
    where eligible.progression_id = p_progression_id
      and coalesce(eligible.allocated_levels, 0) > 0
      and server_authority_private.edge_jsonb_bigint(pokemon.state -> 'l')
        < eligible.starting_level + eligible.allocated_levels
    order by eligible.team_slot
    limit 1
    for update of eligible;

    if not found then
      update public.player_training_progression
      set status = 'completed', completed_at = now()
      where id = p_progression_id;
      return;
    end if;

    select * into strict v_instance
    from public.player_pokemon_instance
    where id = v_entry.pokemon_instance_id and auth_user_id = p_auth_user_id
    for update;

    if v_instance.revision <> v_entry.frozen_instance_revision then
      raise exception 'training progression Pokemon revision is stale' using errcode = '40001';
    end if;

    v_current_level := server_authority_private.edge_jsonb_bigint(v_instance.state -> 'l');
    v_final_level := v_entry.starting_level + v_entry.allocated_levels;

    select min(learned.level) into v_next_move_level
    from public.catalog_species_level_move learned
    where learned.catalog_release_id = v_progression.catalog_release_id
      and learned.species_key = v_instance.species_key
      and learned.level > v_current_level
      and learned.level <= v_final_level
      and not exists (
        select 1 from jsonb_array_elements(v_instance.state -> 'm') known(value)
        where server_authority_private.edge_jsonb_bigint(known.value -> 0) = learned.move_index
      );

    select min((evolution.trigger_rules ->> 'level')::integer) into v_next_evolution_level
    from public.catalog_species_evolution evolution
    where evolution.catalog_release_id = v_progression.catalog_release_id
      and evolution.species_key = v_instance.species_key
      and evolution.trigger_key = 'level'
      and (evolution.trigger_rules ->> 'level')::integer > v_current_level
      and (evolution.trigger_rules ->> 'level')::integer <= v_final_level
      and not (v_entry.refused_species ? v_instance.species_key);

    v_segment_level := least(
      v_final_level,
      coalesce(v_next_move_level, v_final_level),
      coalesce(v_next_evolution_level, v_final_level)
    );
    v_levels_gained := v_segment_level - v_current_level;
    if v_levels_gained <= 0 then
      raise exception 'training progression segment is invalid' using errcode = '22023';
    end if;

    v_before_state := v_instance.state;
    select * into strict v_rule
    from public.catalog_level_rule
    where catalog_release_id = v_progression.catalog_release_id and level = v_segment_level;

    select coalesce(jsonb_agg(jsonb_build_array(
      server_authority_private.edge_jsonb_bigint(known.value -> 0),
      least(server_authority_private.edge_jsonb_bigint(known.value -> 1) + 2 * v_levels_gained, v_rule.max_power),
      least(server_authority_private.edge_jsonb_bigint(known.value -> 2) + 2 * v_levels_gained, v_rule.max_stats)
    ) order by known.ordinality), '[]'::jsonb)
    into v_moves
    from jsonb_array_elements(v_instance.state -> 'm') with ordinality known(value, ordinality);

    update public.player_pokemon_instance
    set state = jsonb_set(jsonb_set(jsonb_set(state,
        '{l}', to_jsonb(v_segment_level), true),
        '{hp}', to_jsonb(least(server_authority_private.edge_jsonb_bigint(state -> 'hp') + 3 * v_levels_gained, v_rule.max_hp)), true),
        '{m}', v_moves, true),
      revision = revision + 1,
      updated_at = now()
    where id = v_instance.id;

    select state into strict v_after_state
    from public.player_pokemon_instance where id = v_instance.id;

    v_offers := server_authority_private.training_level_move_offers(
      v_progression.catalog_release_id, p_progression_id, v_instance.id,
      v_instance.species_key, v_segment_level, v_moves
    );
    v_evolutions := server_authority_private.training_level_evolution_offers(
      v_progression.catalog_release_id, v_instance.species_key,
      v_segment_level, v_entry.refused_species
    );

    insert into public.player_pending_resolution(
      auth_user_id, pokemon_instance_id, resolution_type, options, expected_revision
    ) values (
      p_auth_user_id,
      v_instance.id,
      case when jsonb_array_length(v_evolutions) > 0 then 'evolution' else 'move' end,
      jsonb_build_object(
        'source', 'training',
        'progression_id', p_progression_id,
        'team_slot', v_entry.team_slot,
        'starting_species_key', v_instance.species_key,
        'starting_level', v_current_level,
        'target_level', v_segment_level,
        'levels_gained', v_levels_gained,
        'level_cap', v_progression.level_cap,
        'before_state', v_before_state,
        'after_state', v_after_state,
        'proposal_instance_revision', v_instance.revision + 1,
        'level_moves', v_offers,
        'evolutions', v_evolutions
      ),
      p_resulting_revision
    ) returning id into v_resolution_id;

    update public.player_training_progression_pokemon
    set frozen_instance_revision = v_instance.revision + 1,
      pending_resolution_id = v_resolution_id
    where progression_id = p_progression_id and pokemon_instance_id = v_instance.id;
    return;
  end loop;
end;
$$;

create or replace function public.allocate_edge_training_levels(
  p_auth_user_id uuid,
  p_command_id uuid,
  p_expected_revision bigint,
  p_progression_id uuid,
  p_allocations jsonb
) returns jsonb
language plpgsql
security definer
set search_path = public, server_authority_private, extensions, pg_temp
as $$
declare
  v_progression public.player_training_progression%rowtype;
  v_receipt public.player_command_receipt%rowtype;
  v_revision bigint;
  v_request jsonb;
  v_hash text;
  v_entry jsonb;
  v_row public.player_training_progression_pokemon%rowtype;
  v_instance public.player_pokemon_instance%rowtype;
  v_levels integer;
  v_total integer := 0;
  v_result jsonb;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'service role required' using errcode = '42501';
  end if;
  if jsonb_typeof(p_allocations) <> 'array' or jsonb_array_length(p_allocations) not between 1 and 6 then
    raise exception 'allocations must be a non-empty array' using errcode = '22023';
  end if;

  v_request := jsonb_build_object(
    'expected_revision', p_expected_revision,
    'progression_id', p_progression_id,
    'allocations', p_allocations
  );
  v_hash := encode(digest(convert_to(v_request::text, 'UTF8'), 'sha256'), 'hex');
  perform pg_advisory_xact_lock(hashtextextended(p_auth_user_id::text || ':' || p_command_id::text, 0));

  select * into v_receipt from public.player_command_receipt
  where auth_user_id = p_auth_user_id and command_id = p_command_id;
  if found then
    if v_receipt.command_type <> 'training_allocate' or v_receipt.request_hash <> v_hash then
      raise exception 'command id payload conflict' using errcode = '22023';
    end if;
    return v_receipt.result;
  end if;

  select revision into strict v_revision from public.player_state_revision
  where auth_user_id = p_auth_user_id for update;
  if v_revision <> p_expected_revision then
    raise exception 'player revision conflict' using errcode = '40001';
  end if;

  select * into strict v_progression from public.player_training_progression
  where id = p_progression_id and auth_user_id = p_auth_user_id for update;
  if v_progression.status <> 'awaiting_allocation' then
    raise exception 'training allocation is not pending' using errcode = '22023';
  end if;
  if (select count(distinct value ->> 'pokemonInstanceId') from jsonb_array_elements(p_allocations))
    <> jsonb_array_length(p_allocations) then
    raise exception 'allocation Pokemon ids must be unique' using errcode = '22023';
  end if;

  for v_entry in select value from jsonb_array_elements(p_allocations) loop
    if jsonb_typeof(v_entry) <> 'object' or v_entry - 'pokemonInstanceId' - 'levels' <> '{}'::jsonb
      or coalesce(v_entry ->> 'pokemonInstanceId', '') !~ '^[0-9a-fA-F-]{36}$'
      or jsonb_typeof(v_entry -> 'levels') <> 'number' then
      raise exception 'allocation shape is invalid' using errcode = '22023';
    end if;
    v_levels := (v_entry ->> 'levels')::integer;
    select * into v_row from public.player_training_progression_pokemon
    where progression_id = p_progression_id
      and pokemon_instance_id = (v_entry ->> 'pokemonInstanceId')::uuid
    for update;
    if not found or v_levels < 1 or v_levels > v_row.max_assignable then
      raise exception 'allocation exceeds frozen eligibility' using errcode = '22023';
    end if;
    v_total := v_total + v_levels;
  end loop;

  if v_total <> v_progression.assignable_levels then
    raise exception 'all assignable training levels must be allocated exactly' using errcode = '22023';
  end if;

  perform 1
  from public.player_pokemon_instance pokemon
  join public.player_training_progression_pokemon eligible on eligible.pokemon_instance_id = pokemon.id
  where eligible.progression_id = p_progression_id
  order by pokemon.id
  for update of pokemon;

  for v_entry in select value from jsonb_array_elements(p_allocations) loop
    v_levels := (v_entry ->> 'levels')::integer;
    select * into strict v_row from public.player_training_progression_pokemon
    where progression_id = p_progression_id
      and pokemon_instance_id = (v_entry ->> 'pokemonInstanceId')::uuid;
    select * into strict v_instance from public.player_pokemon_instance
    where id = v_row.pokemon_instance_id and auth_user_id = p_auth_user_id;
    if v_instance.revision <> v_row.frozen_instance_revision
      or v_instance.species_key <> v_row.starting_species_key
      or server_authority_private.edge_jsonb_bigint(v_instance.state -> 'l') <> v_row.starting_level
      or not exists (
        select 1 from public.player_pokemon_placement
        where auth_user_id = p_auth_user_id and pokemon_instance_id = v_instance.id
          and placement_type = 'team' and slot_index = v_row.team_slot
      ) then
      raise exception 'frozen Pokemon revision or ownership is stale' using errcode = '40001';
    end if;
    if v_row.starting_level + v_levels > v_progression.level_cap
      or v_row.starting_level + v_levels > 100 then
      raise exception 'allocation exceeds level cap' using errcode = '22023';
    end if;

    update public.player_training_progression_pokemon
    set allocated_levels = v_levels,
      refused_species = '[]'::jsonb,
      pending_resolution_id = null
    where progression_id = p_progression_id and pokemon_instance_id = v_instance.id;
  end loop;

  update public.player_training_progression
  set status = 'awaiting_choices', allocation_command_id = p_command_id
  where id = p_progression_id;

  perform server_authority_private.advance_training_progression(
    p_auth_user_id, p_progression_id, p_expected_revision + 1
  );
  update public.player_state_revision
  set revision = revision + 1, updated_at = now()
  where auth_user_id = p_auth_user_id
  returning revision into v_revision;

  v_result := server_authority_private.player_state_projection(p_auth_user_id) || jsonb_build_object(
    'command_id', p_command_id,
    'command_type', 'training_allocate',
    'progression_id', p_progression_id,
    'level_events', p_allocations
  );
  insert into public.player_command_receipt(
    auth_user_id, command_id, command_type, request_hash, result, resulting_revision
  ) values (
    p_auth_user_id, p_command_id, 'training_allocate', v_hash, v_result, v_revision
  );

  v_result := server_authority_private.player_state_projection(p_auth_user_id) || jsonb_build_object(
    'command_id', p_command_id,
    'command_type', 'training_allocate',
    'progression_id', p_progression_id,
    'level_events', p_allocations
  );
  update public.player_command_receipt set result = v_result
  where auth_user_id = p_auth_user_id and command_id = p_command_id;
  return v_result;
end;
$$;

create or replace function public.resolve_edge_training_pokemon(
  p_auth_user_id uuid,
  p_command_id uuid,
  p_expected_revision bigint,
  p_pending_resolution_id uuid,
  p_choices jsonb
) returns jsonb
language plpgsql
security definer
set search_path = public, server_authority_private, extensions, pg_temp
as $$
declare
  v_receipt public.player_command_receipt%rowtype;
  v_resolution public.player_pending_resolution%rowtype;
  v_progression public.player_training_progression%rowtype;
  v_entry public.player_training_progression_pokemon%rowtype;
  v_instance public.player_pokemon_instance%rowtype;
  v_request jsonb;
  v_hash text;
  v_revision bigint;
  v_moves jsonb;
  v_offer jsonb;
  v_choice jsonb;
  v_offer_count integer;
  v_i integer;
  v_slot integer;
  v_evolution text;
  v_old_species text;
  v_current_level integer;
  v_followup_moves jsonb;
  v_followup_evolutions jsonb;
  v_next_resolution_id uuid;
  v_result jsonb;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'service role required' using errcode = '42501';
  end if;
  if jsonb_typeof(p_choices) <> 'object'
    or p_choices - 'moves' - 'evolutionTargetSpeciesKey' <> '{}'::jsonb
    or jsonb_typeof(p_choices -> 'moves') <> 'array'
    or jsonb_typeof(p_choices -> 'evolutionTargetSpeciesKey') not in ('string', 'null') then
    raise exception 'training choices shape is invalid' using errcode = '22023';
  end if;

  v_request := jsonb_build_object(
    'expected_revision', p_expected_revision,
    'pending_resolution_id', p_pending_resolution_id,
    'choices', p_choices
  );
  v_hash := encode(digest(convert_to(v_request::text, 'UTF8'), 'sha256'), 'hex');
  perform pg_advisory_xact_lock(hashtextextended(p_auth_user_id::text || ':' || p_command_id::text, 0));

  select * into v_receipt from public.player_command_receipt
  where auth_user_id = p_auth_user_id and command_id = p_command_id;
  if found then
    if v_receipt.command_type <> 'training_resolve' or v_receipt.request_hash <> v_hash then
      raise exception 'command id payload conflict' using errcode = '22023';
    end if;
    return v_receipt.result;
  end if;

  select revision into strict v_revision from public.player_state_revision
  where auth_user_id = p_auth_user_id for update;
  if v_revision <> p_expected_revision then
    raise exception 'player revision conflict' using errcode = '40001';
  end if;

  select * into strict v_resolution from public.player_pending_resolution
  where id = p_pending_resolution_id and auth_user_id = p_auth_user_id for update;
  if v_resolution.status <> 'pending'
    or v_resolution.options ->> 'source' <> 'training'
    or v_resolution.expected_revision <> p_expected_revision then
    raise exception 'training resolution is stale' using errcode = '40001';
  end if;

  select * into strict v_progression from public.player_training_progression
  where id = (v_resolution.options ->> 'progression_id')::uuid
    and auth_user_id = p_auth_user_id for update;
  if v_progression.status <> 'awaiting_choices' then
    raise exception 'training choices are not pending' using errcode = '22023';
  end if;

  select * into strict v_entry from public.player_training_progression_pokemon
  where progression_id = v_progression.id
    and pending_resolution_id = p_pending_resolution_id
  for update;
  if p_pending_resolution_id <> (
    select eligible.pending_resolution_id
    from public.player_training_progression_pokemon eligible
    join public.player_pending_resolution pending on pending.id = eligible.pending_resolution_id
    where eligible.progression_id = v_progression.id and pending.status = 'pending'
    order by eligible.team_slot limit 1
  ) then
    raise exception 'training resolutions must be completed in team order' using errcode = '22023';
  end if;

  select * into strict v_instance from public.player_pokemon_instance
  where id = v_resolution.pokemon_instance_id and auth_user_id = p_auth_user_id for update;
  if v_instance.revision <> (v_resolution.options ->> 'proposal_instance_revision')::bigint then
    raise exception 'canonical Pokemon no longer matches frozen training proposal' using errcode = '40001';
  end if;

  v_moves := v_instance.state -> 'm';
  v_offer_count := jsonb_array_length(v_resolution.options -> 'level_moves');
  if jsonb_array_length(p_choices -> 'moves') <> v_offer_count then
    raise exception 'every move offer requires one choice' using errcode = '22023';
  end if;

  if v_offer_count > 0 then
    for v_i in 0..v_offer_count - 1 loop
      v_offer := v_resolution.options -> 'level_moves' -> v_i;
      v_choice := p_choices -> 'moves' -> v_i;
      if jsonb_typeof(v_choice) <> 'object'
        or v_choice - 'offerIndex' - 'moveIndex' - 'replacementSlot' <> '{}'::jsonb
        or (v_choice ->> 'offerIndex')::integer <> v_i
        or (v_choice ->> 'moveIndex')::integer <> (v_offer ->> 'move_index')::integer
        or jsonb_typeof(v_choice -> 'replacementSlot') not in ('number', 'null') then
        raise exception 'move choice differs from frozen offer' using errcode = '22023';
      end if;
      if exists (
        select 1 from jsonb_array_elements(v_moves) known(value)
        where server_authority_private.edge_jsonb_bigint(known.value -> 0) = (v_offer ->> 'move_index')::integer
      ) then
        continue;
      end if;
      if jsonb_array_length(v_moves) < 4 then
        if jsonb_typeof(v_choice -> 'replacementSlot') <> 'null' then
          raise exception 'free move slot must be used automatically' using errcode = '22023';
        end if;
        v_moves := v_moves || jsonb_build_array(jsonb_build_array(
          (v_offer ->> 'move_index')::integer,
          (v_offer ->> 'power')::integer,
          (v_offer ->> 'stats')::integer
        ));
      elsif jsonb_typeof(v_choice -> 'replacementSlot') = 'number' then
        v_slot := (v_choice ->> 'replacementSlot')::integer;
        if v_slot not between 0 and 3 then
          raise exception 'replacement slot is invalid' using errcode = '22023';
        end if;
        v_moves := jsonb_set(v_moves, array[v_slot::text], jsonb_build_array(
          (v_offer ->> 'move_index')::integer,
          (v_offer ->> 'power')::integer,
          (v_offer ->> 'stats')::integer
        ), false);
      end if;
    end loop;
  end if;

  v_evolution := case
    when jsonb_typeof(p_choices -> 'evolutionTargetSpeciesKey') = 'string'
      then p_choices ->> 'evolutionTargetSpeciesKey'
    else null
  end;
  if v_evolution is not null and not exists (
    select 1 from jsonb_array_elements(v_resolution.options -> 'evolutions') offered(value)
    where offered.value ->> 'target_species_key' = v_evolution
  ) then
    raise exception 'evolution target was not offered' using errcode = '22023';
  end if;

  v_old_species := v_instance.species_key;
  v_current_level := server_authority_private.edge_jsonb_bigint(v_instance.state -> 'l');
  update public.player_pokemon_instance
  set species_key = coalesce(v_evolution, species_key),
    state = jsonb_set(jsonb_set(state, '{m}', v_moves, true),
      '{s}', to_jsonb(coalesce(v_evolution, species_key)), true),
    revision = revision + 1,
    updated_at = now()
  where id = v_instance.id;

  if v_evolution is not null then
    insert into public.player_dex_entry(auth_user_id, catalog_release_id, species_key)
    values(p_auth_user_id, v_progression.catalog_release_id, v_evolution)
    on conflict do nothing;
  elsif jsonb_array_length(v_resolution.options -> 'evolutions') > 0 then
    update public.player_training_progression_pokemon
    set refused_species = refused_species || to_jsonb(v_old_species)
    where progression_id = v_progression.id and pokemon_instance_id = v_instance.id;
  end if;

  update public.player_pending_resolution
  set status = 'resolved', resolved_at = now()
  where id = p_pending_resolution_id;
  update public.player_training_progression_pokemon
  set frozen_instance_revision = v_instance.revision + 1,
    pending_resolution_id = null
  where progression_id = v_progression.id and pokemon_instance_id = v_instance.id;

  if v_evolution is not null then
    v_followup_moves := server_authority_private.training_level_move_offers(
      v_progression.catalog_release_id, v_progression.id, v_instance.id,
      v_evolution, v_current_level, v_moves
    );
    v_followup_evolutions := server_authority_private.training_level_evolution_offers(
      v_progression.catalog_release_id, v_evolution, v_current_level, '[]'::jsonb
    );
    if jsonb_array_length(v_followup_moves) > 0 or jsonb_array_length(v_followup_evolutions) > 0 then
      insert into public.player_pending_resolution(
        auth_user_id, pokemon_instance_id, resolution_type, options, expected_revision
      ) values (
        p_auth_user_id,
        v_instance.id,
        case when jsonb_array_length(v_followup_evolutions) > 0 then 'evolution' else 'move' end,
        jsonb_build_object(
          'source', 'training',
          'progression_id', v_progression.id,
          'team_slot', v_entry.team_slot,
          'starting_species_key', v_evolution,
          'starting_level', v_current_level,
          'target_level', v_current_level,
          'levels_gained', 0,
          'level_cap', v_progression.level_cap,
          'before_state', null,
          'after_state', null,
          'proposal_instance_revision', v_instance.revision + 1,
          'level_moves', v_followup_moves,
          'evolutions', v_followup_evolutions
        ),
        p_expected_revision + 1
      ) returning id into v_next_resolution_id;
      update public.player_training_progression_pokemon
      set pending_resolution_id = v_next_resolution_id
      where progression_id = v_progression.id and pokemon_instance_id = v_instance.id;
    else
      perform server_authority_private.advance_training_progression(
        p_auth_user_id, v_progression.id, p_expected_revision + 1
      );
    end if;
  else
    perform server_authority_private.advance_training_progression(
      p_auth_user_id, v_progression.id, p_expected_revision + 1
    );
  end if;

  update public.player_state_revision
  set revision = revision + 1, updated_at = now()
  where auth_user_id = p_auth_user_id
  returning revision into v_revision;

  v_result := server_authority_private.player_state_projection(p_auth_user_id) || jsonb_build_object(
    'command_id', p_command_id,
    'command_type', 'training_resolve',
    'progression_id', v_progression.id,
    'pokemon_instance_id', v_instance.id,
    'species_key', coalesce(v_evolution, v_old_species),
    'levels_gained', v_resolution.options -> 'levels_gained',
    'evolved_from_species_key', case when v_evolution is null then null else v_old_species end,
    'evolved_to_species_key', v_evolution
  );
  insert into public.player_command_receipt(
    auth_user_id, command_id, command_type, request_hash, result, resulting_revision
  ) values (
    p_auth_user_id, p_command_id, 'training_resolve', v_hash, v_result, v_revision
  );

  v_result := server_authority_private.player_state_projection(p_auth_user_id) || jsonb_build_object(
    'command_id', p_command_id,
    'command_type', 'training_resolve',
    'progression_id', v_progression.id,
    'pokemon_instance_id', v_instance.id,
    'species_key', coalesce(v_evolution, v_old_species),
    'levels_gained', v_resolution.options -> 'levels_gained',
    'evolved_from_species_key', case when v_evolution is null then null else v_old_species end,
    'evolved_to_species_key', v_evolution
  );
  update public.player_command_receipt set result = v_result
  where auth_user_id = p_auth_user_id and command_id = p_command_id;
  return v_result;
end;
$$;

revoke all on function server_authority_private.training_level_move_offers(uuid, uuid, uuid, text, integer, jsonb) from public;
revoke all on function server_authority_private.training_level_evolution_offers(uuid, text, integer, jsonb) from public;
revoke all on function server_authority_private.advance_training_progression(uuid, uuid, bigint) from public;
