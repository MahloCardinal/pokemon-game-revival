begin;

-- Battle item timing and delayed-status semantics change while preserving the
-- snapshot schema. Existing historical bindings remain available.
do $bind_battle_item_effect_runtime$
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
    raise exception 'Battle item runtime requires no open battles' using errcode = '55000';
  end if;

  insert into public.catalog_engine_runtime_binding (
    catalog_release_id,
    engine_version,
    engine_checksum,
    enabled
  ) values (
    v_release,
    'pokemon-game-revival',
    '5293eb988f21a2d1437d5f3fd5962b3b54453b2e4b13688b6eeee3447c77246f',
    true
  )
  on conflict (catalog_release_id, engine_version, engine_checksum)
  do update set enabled = true;
end;
$bind_battle_item_effect_runtime$;

commit;
