begin;

-- Self-inflicted statuses now take priority over pending delayed statuses;
-- historical bindings remain available for terminal snapshots.
do $bind_self_induced_status_runtime$
declare
  v_release uuid;
begin
  select id
  into strict v_release
  from public.catalog_release
  where version = 'revival-baseline'
    and status = 'published'
  for update;

  lock table public.authoritative_battle, public.battle_dome_battle in share row exclusive mode;

  if exists (
    select 1
    from public.authoritative_battle
    where status in ('active', 'needs_player_switch', 'prepared')
       or engine_runtime_state = 'pending'
  ) or exists (
    select 1
    from public.battle_dome_battle
  ) then
    raise exception 'Self-induced status runtime requires no open battles' using errcode = '55000';
  end if;

  insert into public.catalog_engine_runtime_binding (
    catalog_release_id,
    engine_version,
    engine_checksum,
    enabled
  ) values (
    v_release,
    'pokemon-game-revival',
    '37a8a2c205f9a8ed8c905890495966b37eb8e6976e78b2254fd504859c305d3d',
    true
  )
  on conflict (catalog_release_id, engine_version, engine_checksum)
  do update set enabled = true;
end;
$bind_self_induced_status_runtime$;

commit;
