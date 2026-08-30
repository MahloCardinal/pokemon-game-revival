begin;

-- This release changes move hook closures only. The serialized snapshot schema,
-- RNG, slots, HP, pending held-item choices and event history remain untouched.
do $bind_target_type_runtime$
declare
  v_release uuid;
  v_previous constant text := '3b37dcf76a4f627e78c2d46c588f33c618c06eec3716bb43efdcded182ff6566';
  v_target constant text := '1d861c15df18fd425f0ea02e5a788ce644038c34cbf6e8543b82d2e40fd9e49d';
begin
  select id into strict v_release from public.catalog_release
  where version = 'revival-baseline' and status = 'published' for update;

  lock table public.authoritative_battle, public.battle_dome_battle in share row exclusive mode;
  if exists (
    select 1 from public.authoritative_battle
    where (status in ('active', 'needs_player_switch') or engine_runtime_state = 'pending')
      and coalesce(engine_checksum, requested_engine_checksum) not in (v_previous, v_target)
  ) or exists (
    select 1 from public.battle_dome_battle where engine_checksum not in (v_previous, v_target)
  ) then
    raise exception 'open battles require an unsupported runtime' using errcode = '55000';
  end if;

  insert into public.catalog_engine_runtime_binding(catalog_release_id, engine_version, engine_checksum, enabled)
  values (v_release, 'pokemon-game-revival', v_target, true)
  on conflict (catalog_release_id, engine_version, engine_checksum) do update set enabled = true;

  update public.authoritative_battle set engine_checksum = v_target
  where catalog_release_id = v_release and engine_checksum = v_previous
    and (status in ('active', 'needs_player_switch') or engine_runtime_state = 'pending');
  update public.authoritative_battle set requested_engine_checksum = v_target
  where catalog_release_id = v_release and requested_engine_checksum = v_previous
    and (status in ('active', 'needs_player_switch') or engine_runtime_state = 'pending');

  -- Finished Dome battles remain readable until both players leave, so retain
  -- their snapshots and let them use the same compatible runtime too.
  update public.battle_dome_battle set engine_checksum = v_target
  where catalog_release_id = v_release and engine_checksum = v_previous;
end
$bind_target_type_runtime$;

commit;
