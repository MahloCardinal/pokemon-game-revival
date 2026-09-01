begin;

create or replace function server_authority_private.team_composition_violation(
  p_catalog_release_id uuid,
  p_team jsonb
) returns jsonb
language plpgsql
stable
security definer
set search_path = public, server_authority_private, pg_temp
as $$
declare
  v_species_key text;
  v_item_index integer;
  v_count integer;
  v_move_indexes jsonb;
begin
  if p_catalog_release_id is null or jsonb_typeof(p_team) is distinct from 'array' then
    raise exception 'team composition input is invalid' using errcode = '22023';
  end if;

  select entry ->> 'species_key', count(*)::integer
  into v_species_key, v_count
  from jsonb_array_elements(p_team) with ordinality supplied(entry, ordinality)
  where coalesce(entry ->> 'species_key', '') <> ''
  group by entry ->> 'species_key'
  having count(*) > 2
  order by min(supplied.ordinality)
  limit 1;
  if found then
    return jsonb_build_object('key', 'team_species_limit', 'speciesKey', v_species_key, 'max', 2);
  end if;

  select server_authority_private.edge_jsonb_bigint(entry -> 'held_item_index'), count(*)::integer
  into v_item_index, v_count
  from jsonb_array_elements(p_team) with ordinality supplied(entry, ordinality)
  where coalesce(server_authority_private.edge_jsonb_bigint(entry -> 'held_item_index'), 0) > 0
  group by server_authority_private.edge_jsonb_bigint(entry -> 'held_item_index')
  having count(*) > 2
  order by min(supplied.ordinality)
  limit 1;
  if found then
    return jsonb_build_object('key', 'team_held_item_limit', 'itemIndex', v_item_index, 'max', 2);
  end if;

  select count(*)::integer into v_count
  from jsonb_array_elements(p_team) with ordinality supplied(entry, ordinality)
  where exists (
    select 1 from public.catalog_shop_offer offer
    where offer.catalog_release_id = p_catalog_release_id
      and offer.section_key = 'port_market'
      and offer.category_key = 'port_items'
      and offer.item_index = server_authority_private.edge_jsonb_bigint(entry -> 'held_item_index')
  );
  if v_count > 2 then
    return jsonb_build_object('key', 'port_held_item_limit', 'count', v_count, 'max', 2);
  end if;

  select server_authority_private.edge_jsonb_bigint(entry -> 'held_item_index')
  into v_item_index
  from jsonb_array_elements(p_team) with ordinality supplied(entry, ordinality)
  where exists (
    select 1 from public.catalog_shop_offer offer
    where offer.catalog_release_id = p_catalog_release_id
      and offer.section_key = 'port_market'
      and offer.category_key = 'port_items'
      and offer.item_index = server_authority_private.edge_jsonb_bigint(entry -> 'held_item_index')
  )
  group by server_authority_private.edge_jsonb_bigint(entry -> 'held_item_index')
  having count(*) > 1
  order by min(supplied.ordinality)
  limit 1;
  if found then
    return jsonb_build_object('key', 'port_held_item_duplicate', 'itemIndex', v_item_index);
  end if;

  select count(*)::integer into v_count
  from jsonb_array_elements(p_team) supplied(entry)
  where exists (
    select 1
    from jsonb_array_elements(coalesce(entry -> 'move_indexes', '[]'::jsonb)) known(move_index)
    join public.catalog_move move
      on move.catalog_release_id = p_catalog_release_id
     and move.move_index = server_authority_private.edge_jsonb_bigint(known.move_index)
     and coalesce((move.rules ->> 'isOhkoMove')::boolean, false)
  );
  if v_count > 2 then
    select coalesce(jsonb_agg(move.move_index order by move.move_index), '[]'::jsonb)
    into v_move_indexes
    from public.catalog_move move
    where move.catalog_release_id = p_catalog_release_id
      and coalesce((move.rules ->> 'isOhkoMove')::boolean, false);
    return jsonb_build_object(
      'key', 'ohko_move_pokemon_limit',
      'count', v_count,
      'max', 2,
      'moveIndexes', v_move_indexes
    );
  end if;
  return null;
end;
$$;

create or replace function server_authority_private.player_team_composition_violation(
  p_auth_user_id uuid
) returns jsonb
language plpgsql
stable
security definer
set search_path = public, server_authority_private, pg_temp
as $$
declare
  v_catalog_release_id uuid;
  v_team jsonb;
begin
  select catalog_release_id into strict v_catalog_release_id
  from public.player_profile_state
  where auth_user_id = p_auth_user_id;

  select coalesce(jsonb_agg(jsonb_build_object(
    'species_key', pokemon.species_key,
    'held_item_index', coalesce(server_authority_private.edge_jsonb_bigint(pokemon.state -> 'i'), 0),
    'move_indexes', coalesce((
      select jsonb_agg(server_authority_private.edge_jsonb_bigint(known.move -> 0) order by known.ordinality)
      from jsonb_array_elements(coalesce(pokemon.state -> 'm', '[]'::jsonb))
        with ordinality known(move, ordinality)
    ), '[]'::jsonb)
  ) order by placement.slot_index), '[]'::jsonb)
  into v_team
  from public.player_pokemon_placement placement
  join public.player_pokemon_instance pokemon on pokemon.id = placement.pokemon_instance_id
  where placement.auth_user_id = p_auth_user_id and placement.placement_type = 'team';

  return server_authority_private.team_composition_violation(v_catalog_release_id, v_team);
end;
$$;

create or replace function server_authority_private.assert_player_team_composition(
  p_auth_user_id uuid
) returns void
language plpgsql
stable
security definer
set search_path = public, server_authority_private, pg_temp
as $$
declare
  v_violation jsonb;
begin
  v_violation := server_authority_private.player_team_composition_violation(p_auth_user_id);
  if v_violation is not null then
    raise exception 'team_composition_violation:%', v_violation::text using errcode = '22023';
  end if;
end;
$$;

revoke all on function server_authority_private.team_composition_violation(uuid,jsonb) from public;
revoke all on function server_authority_private.player_team_composition_violation(uuid) from public;
revoke all on function server_authority_private.assert_player_team_composition(uuid) from public;

-- Remove one PL/pgSQL IF block containing a legacy composition exception.
-- Every replacement is guarded so a changed upstream definition aborts atomically.
create function pg_temp.remove_composition_if_blocks(p_definition text, p_marker text)
returns text language plpgsql as $$
declare
  v_marker_at integer;
  v_prefix text;
  v_reverse_at integer;
  v_candidate_start integer;
  v_block_start integer;
  v_end_relative integer;
  v_block_end integer;
  v_line_start integer;
  v_marker_indent integer;
  v_indent integer;
begin
  loop
    v_marker_at := strpos(p_definition, p_marker);
    exit when v_marker_at = 0;
    v_prefix := substring(p_definition from 1 for v_marker_at - 1);
    v_reverse_at := strpos(reverse(v_prefix), E'\n');
    v_line_start := case when v_reverse_at = 0 then 1 else length(v_prefix) - v_reverse_at + 2 end;
    v_marker_indent := length(substring(v_prefix from v_line_start))
      - length(ltrim(substring(v_prefix from v_line_start), ' '));
    v_block_start := 0;
    for v_indent in 0..v_marker_indent loop
      v_reverse_at := strpos(reverse(v_prefix), reverse(E'\n' || repeat(' ', v_indent) || 'if '));
      if v_reverse_at > 0 then
        v_candidate_start := length(v_prefix) - v_reverse_at
          - length(E'\n' || repeat(' ', v_indent) || 'if ') + 2;
        if v_candidate_start > v_block_start then v_block_start := v_candidate_start; end if;
      end if;
    end loop;
    if v_block_start = 0 then
      raise exception 'Could not locate composition IF block for marker %', p_marker;
    end if;
    v_end_relative := strpos(substring(p_definition from v_marker_at), 'end if;');
    if v_end_relative = 0 then
      raise exception 'Could not locate composition IF terminator for marker %', p_marker;
    end if;
    v_block_end := v_marker_at + v_end_relative + length('end if;') - 2;
    p_definition := substring(p_definition from 1 for v_block_start - 1)
      || substring(p_definition from v_block_end + 1);
  end loop;
  return p_definition;
end;
$$;

do $patch_mutations$
declare
  v_definition text;
  v_before text;
begin
  select pg_get_functiondef('public.execute_pokemon_center_command_before_ordinary_guard(uuid,bigint,uuid,text,integer,integer,text)'::regprocedure)
  into v_definition;
  v_before := v_definition;
  v_definition := pg_temp.remove_composition_if_blocks(v_definition, 'team cannot contain more than two Pokemon holding the same item');
  v_definition := pg_temp.remove_composition_if_blocks(v_definition, 'resulting team cannot contain more than two Pokemon of the same species');
  if v_definition = v_before then raise exception 'Pokemon Center composition guards were not found'; end if;
  execute v_definition;

  select pg_get_functiondef('server_authority_private.execute_team_box_command_before_ordinary_guard(text,uuid,bigint,uuid,integer)'::regprocedure)
  into v_definition;
  v_before := v_definition;
  v_definition := pg_temp.remove_composition_if_blocks(v_definition, 'team cannot contain more than two Pokemon of the same species');
  v_definition := pg_temp.remove_composition_if_blocks(v_definition, 'team cannot contain more than two Pokemon holding the same item');
  if v_definition = v_before then raise exception 'Box composition guards were not found'; end if;
  execute v_definition;

  select pg_get_functiondef('server_authority_private.execute_daycare_command_before_ordinary_guard(text,uuid,bigint,uuid,integer)'::regprocedure)
  into v_definition;
  v_before := v_definition;
  v_definition := pg_temp.remove_composition_if_blocks(v_definition, 'team cannot contain more than two Pokemon of the same species');
  v_definition := pg_temp.remove_composition_if_blocks(v_definition, 'team cannot contain more than two Pokemon holding the same item');
  if v_definition = v_before then raise exception 'Daycare withdrawal composition guards were not found'; end if;
  execute v_definition;

  select pg_get_functiondef('server_authority_private.resolve_daycare_withdrawal_before_ordinary_guard(uuid,bigint,uuid,jsonb)'::regprocedure)
  into v_definition;
  v_before := v_definition;
  v_definition := pg_temp.remove_composition_if_blocks(v_definition, 'resulting team cannot contain more than two Pokemon of the same species');
  v_definition := pg_temp.remove_composition_if_blocks(v_definition, 'resulting team cannot contain more than two Pokemon holding the same item');
  if v_definition = v_before then raise exception 'Daycare resolution composition guards were not found'; end if;
  execute v_definition;

  select pg_get_functiondef('public.execute_debug_command_before_ordinary_guard(uuid,uuid,bigint,text,jsonb)'::regprocedure)
  into v_definition;
  v_before := v_definition;
  v_definition := pg_temp.remove_composition_if_blocks(v_definition, 'team already has two Pokemon of this species');
  if v_definition = v_before then raise exception 'Debug creation composition guard was not found'; end if;
  execute v_definition;

  foreach v_before in array array[
    'public.attempt_wild_capture_authoritative(uuid,bigint,uuid,integer)',
    'server_authority_private.finish_capture_success(uuid,uuid,uuid,text,integer,jsonb)'
  ] loop
    select pg_get_functiondef(v_before::regprocedure) into v_definition;
    if strpos(v_definition, ' and v_team_species_count < 2') > 0 then
      v_definition := replace(v_definition, ' and v_team_species_count < 2', '');
    elsif strpos(v_definition, ' and v_species_count<2') > 0 then
      v_definition := replace(v_definition, ' and v_species_count<2', '');
    else
      raise exception 'Capture placement composition guard was not found in %', v_before;
    end if;
    execute v_definition;
  end loop;
end;
$patch_mutations$;

-- The Dome accepts and stores drafts freely. Composition is checked only when
-- a complete team is used to create or join a challenge.
create or replace function server_authority_private.battle_dome_validate_team(
  p_catalog_release_id uuid,
  p_team jsonb,
  p_require_complete boolean default false
) returns jsonb
language plpgsql
stable
security definer
set search_path = public, server_authority_private, extensions, pg_temp
as $$
declare
  v_entry jsonb;
  v_moves jsonb;
  v_move jsonb;
  v_species_key text;
  v_item_index integer;
  v_move_index integer;
  v_normalized jsonb := '[]'::jsonb;
  v_composition_team jsonb := '[]'::jsonb;
  v_violation jsonb;
  v_count integer;
begin
  if p_catalog_release_id is null or jsonb_typeof(p_team) <> 'array' then
    raise exception 'battle dome team is invalid' using errcode = '22023';
  end if;
  v_count := jsonb_array_length(p_team);
  if v_count > 6 or (p_require_complete and v_count <> 6) then
    raise exception 'battle dome team must contain exactly six Pokemon' using errcode = '22023';
  end if;

  for v_entry in select value from jsonb_array_elements(p_team) loop
    if jsonb_typeof(v_entry) <> 'object'
      or not (v_entry ? 'species_key') or not (v_entry ? 'moves') or not (v_entry ? 'held_item_index') then
      raise exception 'battle dome Pokemon is invalid' using errcode = '22023';
    end if;
    v_species_key := v_entry ->> 'species_key';
    v_item_index := server_authority_private.edge_jsonb_bigint(v_entry -> 'held_item_index');
    v_moves := v_entry -> 'moves';
    if v_species_key is null or v_species_key !~ '^[A-Za-z0-9_-]{1,80}$'
      or v_item_index is null or v_item_index < 0
      or jsonb_typeof(v_moves) <> 'array' or jsonb_array_length(v_moves) not between 1 and 4 then
      raise exception 'battle dome Pokemon fields are invalid' using errcode = '22023';
    end if;
    if not exists (
      select 1 from public.catalog_species species
      where species.catalog_release_id = p_catalog_release_id
        and species.species_key = v_species_key
        and coalesce(species.encounter_rarity_key, '') <> 'legendary'
    ) then
      raise exception 'battle dome species is unavailable' using errcode = '22023';
    end if;
    if v_item_index > 0 and not exists (
      select 1 from public.catalog_item item
      where item.catalog_release_id = p_catalog_release_id
        and item.item_index = v_item_index
        and item.category_key in ('held_item', 'berry')
    ) then
      raise exception 'battle dome held item is unavailable' using errcode = '22023';
    end if;
    if (select count(distinct server_authority_private.edge_jsonb_bigint(value))
      from jsonb_array_elements(v_moves)) <> jsonb_array_length(v_moves) then
      raise exception 'battle dome moves must be distinct' using errcode = '22023';
    end if;
    for v_move in select value from jsonb_array_elements(v_moves) loop
      v_move_index := server_authority_private.edge_jsonb_bigint(v_move);
      if v_move_index is null or v_move_index <= 0 or not exists (
        select 1 from public.catalog_move move
        where move.catalog_release_id = p_catalog_release_id and move.move_index = v_move_index
      ) or not exists (
        select 1 from public.catalog_species_level_move learned
        where learned.catalog_release_id = p_catalog_release_id
          and learned.species_key = v_species_key and learned.move_index = v_move_index
          and learned.level between 5 and 100
        union all
        select 1 from public.catalog_species_machine_move machine
        where machine.catalog_release_id = p_catalog_release_id
          and machine.species_key = v_species_key and machine.move_index = v_move_index
      ) then
        raise exception 'battle dome move is unavailable for this species' using errcode = '22023';
      end if;
    end loop;
    v_normalized := v_normalized || jsonb_build_array(jsonb_build_object(
      'species_key', v_species_key,
      'held_item_index', v_item_index,
      'moves', (select jsonb_agg(server_authority_private.edge_jsonb_bigint(value)) from jsonb_array_elements(v_moves))
    ));
    v_composition_team := v_composition_team || jsonb_build_array(jsonb_build_object(
      'species_key', v_species_key,
      'held_item_index', v_item_index,
      'move_indexes', v_moves
    ));
  end loop;

  if p_require_complete then
    v_violation := server_authority_private.team_composition_violation(p_catalog_release_id, v_composition_team);
    if v_violation is not null then
      raise exception 'team_composition_violation:%', v_violation::text using errcode = '22023';
    end if;
  end if;
  return v_normalized;
end;
$$;

-- Replace the old per-contract checks with the shared assertion. The League
-- invokes it only while creating a run; later members use the frozen roster.
do $patch_starts$
declare
  v_definition text;
  v_before text;
  v_anchor text;
begin
  select pg_get_functiondef('public.start_edge_capture_battle_before_ordinary_guard(uuid,uuid,bigint,uuid,uuid,integer,text,text)'::regprocedure)
  into v_definition;
  v_definition := pg_temp.remove_composition_if_blocks(v_definition, 'team contains more than two Pokemon of one species');
  v_definition := pg_temp.remove_composition_if_blocks(v_definition, 'team contains more than two equal held items');
  v_anchor := 'if not found or not exists(select 1 from public.player_pokemon_placement where auth_user_id=p_auth_user_id' || E'\n'
    || '    and placement_type=''team'' and slot_index=p_active_slot) then raise exception ''canonical active team slot is missing'' using errcode=''22023''; end if;';
  if strpos(v_definition, v_anchor) = 0 then raise exception 'Capture start insertion point was not found'; end if;
  v_definition := replace(v_definition, v_anchor, v_anchor || E'\n  perform server_authority_private.assert_player_team_composition(p_auth_user_id);');
  execute v_definition;

  select pg_get_functiondef('public.start_edge_training_battle_without_progression_guard(uuid,uuid,bigint,uuid,text,integer,text,text)'::regprocedure)
  into v_definition;
  v_definition := pg_temp.remove_composition_if_blocks(v_definition, 'team contains more than two Pokemon of one species');
  v_definition := pg_temp.remove_composition_if_blocks(v_definition, 'team contains more than two equal held items');
  execute v_definition;

  select pg_get_functiondef('public.activate_prepared_training_battle(uuid,uuid,bigint,uuid,bigint,uuid,integer)'::regprocedure)
  into v_definition;
  v_anchor := 'if v_active_index is null then raise exception ''active team slot does not exist'' using errcode = ''22023''; end if;';
  if strpos(v_definition, v_anchor) = 0 then raise exception 'Training activation insertion point was not found'; end if;
  v_definition := replace(v_definition, v_anchor,
    v_anchor || E'\n  perform server_authority_private.assert_player_team_composition(p_auth_user_id);');
  execute v_definition;

  select pg_get_functiondef('public.start_edge_debug_training_battle(uuid,uuid,bigint,uuid,integer,jsonb,text,text)'::regprocedure)
  into v_definition;
  v_anchor := 'v_result:=public.start_edge_training_battle_with_ordinary_guard';
  if strpos(v_definition, v_anchor) = 0 then raise exception 'Debug training insertion point was not found'; end if;
  v_definition := replace(v_definition, v_anchor,
    'perform server_authority_private.assert_player_team_composition(p_auth_user_id);' || E'\n  ' || v_anchor);
  execute v_definition;

  select pg_get_functiondef('public.start_edge_authoritative_battle_before_ordinary_guard(uuid,uuid,bigint,text,text,text,uuid)'::regprocedure)
  into v_definition;
  v_anchor := 'if not found then raise exception ''a non-empty canonical team is required'' using errcode = ''22023''; end if;';
  if strpos(v_definition, v_anchor) = 0 then raise exception 'Tackle test insertion point was not found'; end if;
  v_definition := replace(v_definition, v_anchor,
    v_anchor || E'\n\n  perform server_authority_private.assert_player_team_composition(p_auth_user_id);');
  execute v_definition;

  foreach v_before in array array[
    'public.start_edge_gym_battle_before_ordinary_guard(uuid,uuid,bigint,uuid,text,integer,text,text)',
    'public.start_edge_admin_gym_battle_before_ordinary_guard(uuid,uuid,bigint,uuid,text,integer,text,text)'
  ] loop
    select pg_get_functiondef(v_before::regprocedure) into v_definition;
    v_definition := pg_temp.remove_composition_if_blocks(v_definition, 'team contains more than two Pokemon of one species');
    v_definition := pg_temp.remove_composition_if_blocks(v_definition, 'team contains more than two equal held items');
    v_definition := pg_temp.remove_composition_if_blocks(v_definition, 'team exceeds the gym OHKO Pokemon limit');
    v_definition := pg_temp.remove_composition_if_blocks(v_definition, 'team exceeds the gym Port held-item limit');
    v_anchor := 'if not exists (select 1 from public.player_pokemon_placement' || E'\n'
      || '    where auth_user_id = p_auth_user_id and placement_type = ''team'' and slot_index = p_active_slot) then' || E'\n'
      || '    raise exception ''active team slot does not exist'' using errcode = ''22023'';' || E'\n  end if;';
    if strpos(v_definition, v_anchor) = 0 then raise exception 'Gym start insertion point was not found in %', v_before; end if;
    v_definition := replace(v_definition, v_anchor, v_anchor || E'\n  perform server_authority_private.assert_player_team_composition(p_auth_user_id);');
    execute v_definition;
  end loop;

  select pg_get_functiondef('public.start_edge_admin_league_battle_before_ordinary_guard(uuid,uuid,bigint,uuid,integer,integer,text,text)'::regprocedure)
  into v_definition;
  v_definition := pg_temp.remove_composition_if_blocks(v_definition, 'team contains more than two Pokemon of one species');
  v_definition := pg_temp.remove_composition_if_blocks(v_definition, 'team contains more than two equal held items');
  v_definition := pg_temp.remove_composition_if_blocks(v_definition, 'team exceeds the League OHKO limit');
  v_definition := pg_temp.remove_composition_if_blocks(v_definition, 'team exceeds the League Port item limit');
  v_definition := pg_temp.remove_composition_if_blocks(v_definition, 'League Port held items must be different');
  v_anchor := 'if not found then raise exception ''a non-empty canonical team is required'' using errcode=''22023''; end if;';
  if strpos(v_definition, v_anchor) = 0 then raise exception 'League start insertion point was not found'; end if;
  v_definition := replace(v_definition, v_anchor, v_anchor || E'\n    perform server_authority_private.assert_player_team_composition(p_auth_user_id);');
  execute v_definition;

  select pg_get_functiondef('public.start_edge_battle_tower_before_team_size(uuid,uuid,bigint,uuid,text,text)'::regprocedure)
  into v_definition;
  v_definition := pg_temp.remove_composition_if_blocks(v_definition, 'team contains more than two Pokemon of one species');
  v_definition := pg_temp.remove_composition_if_blocks(v_definition, 'team contains more than two equal held items');
  v_anchor := 'if not found then' || E'\n    insert into public.authoritative_battle_tower_run';
  if strpos(v_definition, v_anchor) = 0 then raise exception 'Battle Tower start insertion point was not found'; end if;
  v_definition := replace(v_definition, v_anchor,
    'if not found then' || E'\n    perform server_authority_private.assert_player_team_composition(p_auth_user_id);' || E'\n    insert into public.authoritative_battle_tower_run');
  execute v_definition;
end;
$patch_starts$;

select server_authority_private.begin_game_data_change(
  p_label => 'Rimuove i limiti squadra specifici di Palestre e Lega',
  p_affected_families => array['opponents']::text[],
  p_source_checksums => jsonb_build_object(
    'app/data/gyms.js', '088600a5ed342c58386bc5cf1d944c0079b306b4412cb248a78075d33a5926f6'
  ),
  p_requires_battle_idle => true
);

update public.catalog_opponent
set rules = rules - array['ohkoPokemonMax', 'portItemMax', 'portItemsDistinct']::text[]
where catalog_release_id = (
    select id from public.catalog_release where version = 'revival-baseline'
  )
  and opponent_kind in ('gym', 'league', 'champion')
  and rules ?| array['ohkoPokemonMax', 'portItemMax', 'portItemsDistinct']::text[];

select server_authority_private.finish_game_data_change();

-- Keep the previous binding enabled for terminal snapshots and deploy overlap.
insert into public.catalog_engine_runtime_binding(
  catalog_release_id,
  engine_version,
  engine_checksum,
  enabled
)
select id,
  'pokemon-game-revival',
  'f03ece940d261bcbd2ab5770af06fbc3073d7341c67c698431abcb7b8aabf37f',
  true
from public.catalog_release
where version = 'revival-baseline' and status = 'published'
on conflict (catalog_release_id, engine_version, engine_checksum)
do update set enabled = true;

commit;
