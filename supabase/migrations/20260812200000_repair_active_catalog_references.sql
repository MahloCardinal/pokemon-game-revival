begin;

do $repair$
declare
  retired_catalog_id uuid;
  active_catalog_id uuid;
  aaa_id uuid;
begin
  select id into strict retired_catalog_id
  from public.catalog_release
  where version = 'revival-baseline'
    and status = 'retired';

  select id into strict active_catalog_id
  from public.catalog_release
  where version = 'revival-gym-rewards-20260812'
    and status = 'published';

  select id into strict aaa_id
  from auth.users
  where lower(email) = 'aaa@pokemon-game-revival.local';

  if not exists (
    select 1
    from public.user_server_role
    where auth_user_id = aaa_id
      and role_key = 'debug'
  ) then
    raise exception 'the aaa debug role is missing'
      using errcode = '55000';
  end if;

  if exists (
    select 1
    from public.player_mission_state state
    where state.auth_user_id = aaa_id
      and state.catalog_release_id = retired_catalog_id
      and not exists (
        select 1
        from public.catalog_mission mission
        where mission.catalog_release_id = active_catalog_id
          and mission.mission_index = state.mission_index
      )
  ) then
    raise exception 'aaa has mission state that is missing from the active catalog'
      using errcode = '55000';
  end if;

  update public.player_mission_state
  set catalog_release_id = active_catalog_id,
      updated_at = now()
  where auth_user_id = aaa_id
    and catalog_release_id = retired_catalog_id;

  update server_authority_private.runtime_catalog_config
  set catalog_release_id = active_catalog_id,
      updated_at = now()
  where catalog_release_id = retired_catalog_id;

  if (select catalog_release_id from public.player_profile_state where auth_user_id = aaa_id)
      <> active_catalog_id
    or exists (
      select 1
      from public.player_mission_state
      where auth_user_id = aaa_id
        and catalog_release_id <> active_catalog_id
    )
    or exists (
      select 1
      from server_authority_private.runtime_catalog_config
      where catalog_release_id <> active_catalog_id
    ) then
    raise exception 'catalog repair did not converge on the active release'
      using errcode = '55000';
  end if;
end
$repair$;

commit;
