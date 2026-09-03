begin;

-- Debug accounts are operational tools and must not appear in the public
-- player directory. The server role is the canonical identity for `aaa`.
create or replace function public.list_player_directory()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, server_authority_private, pg_temp
as $$
declare
  v_auth_user_id uuid := auth.uid();
begin
  if v_auth_user_id is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;

  return (
    with dex_data as (
      select auth_user_id, catalog_release_id, count(*)::integer as pokedex_caught
      from public.player_dex_entry
      group by auth_user_id, catalog_release_id
    ), catalog_data as (
      select catalog_release_id, count(*)::integer as pokedex_total
      from public.catalog_species
      group by catalog_release_id
    )
    select jsonb_build_object(
      'players', coalesce(jsonb_agg(
        jsonb_build_object(
          'username', left(coalesce(nullif(btrim(recovery.username), ''), 'Allenatore'), 32),
          'trainer_index', profile.trainer_index,
          'badges', least(8, greatest(0, profile.badges)),
          'team', coalesce(team_data.team, '[]'::jsonb),
          'preferred_title', title_data.preferred_title,
          'pokedex_caught', least(catalog_data.pokedex_total, coalesce(dex_data.pokedex_caught, 0)),
          'pokedex_total', catalog_data.pokedex_total
        )
        order by lower(coalesce(recovery.username, '')), profile.auth_user_id
      ), '[]'::jsonb),
      'generated_at', now()
    )
    from public.player_profile_state profile
    join public.player_auth_recovery recovery
      on recovery.auth_user_id = profile.auth_user_id
    join catalog_data
      on catalog_data.catalog_release_id = profile.catalog_release_id
    left join dex_data
      on dex_data.auth_user_id = profile.auth_user_id
     and dex_data.catalog_release_id = profile.catalog_release_id
    left join lateral (
      select jsonb_agg(
        jsonb_build_object(
          'slot', placement.slot_index,
          'pokemon',
            jsonb_build_object(
              's', pokemon.state ->> 's',
              'l', greatest(1, coalesce((pokemon.state ->> 'l')::integer, 1)),
              'hp', greatest(1, coalesce((pokemon.state ->> 'hp')::integer, 1)),
              'm', case when jsonb_typeof(pokemon.state -> 'm') = 'array'
                then pokemon.state -> 'm' else '[]'::jsonb end,
              'xp', greatest(0, coalesce((pokemon.state ->> 'xp')::integer, 0))
            )
            || case when coalesce((pokemon.state ->> 'i')::integer, 0) > 0
              then jsonb_build_object('i', (pokemon.state ->> 'i')::integer)
              else '{}'::jsonb end
        )
        order by placement.slot_index
      ) as team
      from public.player_pokemon_placement placement
      join public.player_pokemon_instance pokemon
        on pokemon.id = placement.pokemon_instance_id
       and pokemon.auth_user_id = placement.auth_user_id
      where placement.auth_user_id = profile.auth_user_id
        and placement.placement_type = 'team'
    ) team_data on true
    left join lateral (
      select owned.title_key as preferred_title
      from public.player_title owned
      where owned.auth_user_id = profile.auth_user_id
        and owned.catalog_release_id = profile.catalog_release_id
        and owned.is_preferred
      limit 1
    ) title_data on true
    where profile.auth_user_id <> v_auth_user_id
      and not exists (
        select 1
        from public.user_server_role role
        where role.auth_user_id = profile.auth_user_id
          and role.role_key = 'debug'
      )
  );
end;
$$;

revoke all on function public.list_player_directory() from public, anon, authenticated;
grant execute on function public.list_player_directory() to authenticated, service_role;

comment on function public.list_player_directory() is
  'Returns the reduced public player-card projection while excluding server debug accounts.';

commit;
