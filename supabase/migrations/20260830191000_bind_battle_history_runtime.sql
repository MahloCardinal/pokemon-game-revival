begin;

-- Maintenance release: old terminal snapshots and their bindings stay intact.
-- No historical state is fabricated for battles created by an older runtime.
do $bind_history_runtime$
declare v_release uuid;
begin
  select id into strict v_release from public.catalog_release
    where version = 'revival-baseline' and status = 'published' for update;
  lock table public.authoritative_battle, public.battle_dome_battle in share row exclusive mode;
  if exists(select 1 from public.authoritative_battle
    where status in ('active', 'needs_player_switch', 'prepared') or engine_runtime_state = 'pending')
    or exists(select 1 from public.battle_dome_battle) then
    raise exception 'Turn history runtime requires no open battles' using errcode = '55000';
  end if;
  insert into public.catalog_engine_runtime_binding(catalog_release_id, engine_version, engine_checksum, enabled)
  values(v_release, 'pokemon-game-revival', '95ee6ce2cfeec3c79858b19b5c96e18196e337ba966671a7bad38519820e8f15', true)
  on conflict(catalog_release_id, engine_version, engine_checksum) do update set enabled = true;
end;
$bind_history_runtime$;

commit;
