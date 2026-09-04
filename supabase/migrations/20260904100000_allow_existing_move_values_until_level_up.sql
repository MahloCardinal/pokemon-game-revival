begin;

-- EXP is persisted before advance_ordinary_progression clamps the next level.
-- Catalog cap reductions must not prevent that intermediate write. Only values
-- already stored on the same move may survive, and they may never increase.
create or replace function server_authority_private.validate_player_pokemon_shiny_state()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_caps record;
  v_move jsonb;
  v_previous_move jsonb;
  v_preserve_existing boolean := false;
  v_power_limit bigint;
  v_stats_limit bigint;
begin
  if new.state ? 'shl' then
    raise exception 'Pokemon state cannot contain a Shiny acquisition level' using errcode = '22023';
  end if;
  if new.state ? 'sh'
    and coalesce(server_authority_private.edge_jsonb_bigint(new.state -> 'sh'), 0) <> 1 then
    raise exception 'Shiny Pokemon state flag is invalid' using errcode = '22023';
  end if;

  if new.debug_created then
    return new;
  end if;

  if tg_op = 'UPDATE' then
    v_preserve_existing := not old.debug_created
      and new.id = old.id
      and new.auth_user_id = old.auth_user_id
      and new.catalog_release_id = old.catalog_release_id
      and new.species_key = old.species_key
      and new.state -> 's' is not distinct from old.state -> 's'
      and new.state -> 'l' is not distinct from old.state -> 'l'
      and new.state -> 'sh' is not distinct from old.state -> 'sh';
  end if;

  select * into strict v_caps
  from server_authority_private.pokemon_stat_caps(new.catalog_release_id, new.state);
  if server_authority_private.edge_jsonb_bigint(new.state -> 'hp') not between 1 and v_caps.max_hp then
    raise exception 'Pokemon HP exceeds its rarity-adjusted cap' using errcode = '22023';
  end if;
  for v_move in select value from jsonb_array_elements(new.state -> 'm') loop
    v_power_limit := v_caps.max_power;
    v_stats_limit := v_caps.max_stats;
    if v_preserve_existing then
      -- Match the move identity, not its slot: reordering cannot grant a bonus
      -- to a different move or transfer an old excess to a newly learned move.
      select value into v_previous_move
      from jsonb_array_elements(old.state -> 'm')
      where value -> 0 = v_move -> 0;
      if found then
        v_power_limit := greatest(v_power_limit,
          server_authority_private.edge_jsonb_bigint(v_previous_move -> 1));
        v_stats_limit := greatest(v_stats_limit,
          server_authority_private.edge_jsonb_bigint(v_previous_move -> 2));
      end if;
    end if;
    if server_authority_private.edge_jsonb_bigint(v_move -> 1) not between 0 and v_power_limit
      or server_authority_private.edge_jsonb_bigint(v_move -> 2) not between 0 and v_stats_limit then
      raise exception 'Pokemon move exceeds its rarity-adjusted cap' using errcode = '22023';
    end if;
  end loop;
  return new;
end;
$$;

revoke all on function server_authority_private.validate_player_pokemon_shiny_state()
  from public, anon, authenticated;

commit;
