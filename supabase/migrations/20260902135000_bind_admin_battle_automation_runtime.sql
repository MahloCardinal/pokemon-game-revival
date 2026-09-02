begin;

-- The automatic admin controller and shared NPC Aroma policy change battle
-- execution. Historical bindings remain available for terminal snapshots.
do $bind_admin_battle_automation_runtime$
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
    raise exception 'Admin battle automation runtime requires no open battles' using errcode = '55000';
  end if;

  insert into public.catalog_engine_runtime_binding (
    catalog_release_id,
    engine_version,
    engine_checksum,
    enabled
  ) values (
    v_release,
    'pokemon-game-revival',
    '118b342f70fbc5dc8e8db2be12dfa5e24cf0fa593ce5c920c847252c4517d698',
    true
  )
  on conflict (catalog_release_id, engine_version, engine_checksum)
  do update set enabled = true;
end;
$bind_admin_battle_automation_runtime$;

commit;
