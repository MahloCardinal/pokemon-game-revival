-- Battle Dome teams may contain any number of Pokemon between one and six.
-- Drafts may still be empty while the player is editing them.
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
  if v_count > 6 or (p_require_complete and v_count < 1) then
    raise exception 'battle dome team must contain between one and six Pokemon' using errcode = '22023';
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
