begin;

-- Extend the live player directory with the most recently unlocked title.
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
    select jsonb_build_object(
      'players', coalesce(jsonb_agg(
        jsonb_build_object(
          'username', left(coalesce(nullif(btrim(recovery.username), ''), 'Allenatore'), 32),
          'badges', least(8, greatest(0, profile.badges)),
          'team', coalesce(team_data.team, '[]'::jsonb),
          'titles', coalesce(title_data.titles, '[]'::jsonb),
          'last_title', title_data.last_title
        )
        order by lower(coalesce(recovery.username, '')), profile.auth_user_id
      ), '[]'::jsonb),
      'generated_at', now()
    )
    from public.player_profile_state profile
    join public.player_auth_recovery recovery
      on recovery.auth_user_id = profile.auth_user_id
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
      select
        jsonb_agg(owned.title_key order by title.sort_order) as titles,
        (array_agg(owned.title_key order by owned.unlocked_at desc, title.sort_order))[1] as last_title
      from public.player_title owned
      join public.catalog_title title
        on title.catalog_release_id = owned.catalog_release_id
       and title.title_key = owned.title_key
      where owned.auth_user_id = profile.auth_user_id
        and owned.catalog_release_id = profile.catalog_release_id
    ) title_data on true
    where profile.auth_user_id <> v_auth_user_id
  );
end;
$$;

revoke all on function public.list_player_directory() from public, anon, authenticated;
grant execute on function public.list_player_directory() to authenticated, service_role;

commit;
