begin;

-- Direct move KOs are now resolved before end-of-action effects. Historical
-- bindings remain available for terminal snapshots.
do $bind_immediate_ko_runtime$
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
    raise exception 'Immediate KO runtime requires no open battles' using errcode = '55000';
  end if;

  insert into public.catalog_engine_runtime_binding (
    catalog_release_id,
    engine_version,
    engine_checksum,
    enabled
  ) values (
    v_release,
    'pokemon-game-revival',
    '04bdb0ee7705192127e9d72a154ef1a9f6128d3a7d46de0b79a54280bcc6a412',
    true
  )
  on conflict (catalog_release_id, engine_version, engine_checksum)
  do update set enabled = true;
end;
$bind_immediate_ko_runtime$;

commit;
