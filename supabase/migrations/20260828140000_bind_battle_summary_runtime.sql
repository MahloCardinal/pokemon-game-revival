begin;

do $bind_battle_summary_runtime$
declare
  v_catalog_release_id uuid;
  v_previous_runtime_checksum constant text := '48293aae74ba45f53667b6d52a6101e7509ac095e38571bdd6a05a165dc811f0';
  v_target_runtime_checksum constant text := 'b71eb3a1d1c74d8a6c126a15f4ee94a4b6230163f2aed9adf4ef68f0e9b48080';
begin
  select id into strict v_catalog_release_id
  from public.catalog_release
  where version = 'revival-baseline'
    and status = 'published'
  for update;

  insert into public.catalog_engine_runtime_binding(
    catalog_release_id, engine_version, engine_checksum, enabled
  ) values (
    v_catalog_release_id, 'pokemon-game-revival', v_target_runtime_checksum, true
  )
  on conflict(catalog_release_id, engine_version, engine_checksum)
  do update set enabled = true;

  if exists (
    select 1
    from public.authoritative_battle
    where (
      status in ('active', 'needs_player_switch')
      or engine_runtime_state = 'pending'
    )
      and coalesce(engine_checksum, requested_engine_checksum) not in (
        v_previous_runtime_checksum,
        v_target_runtime_checksum
      )
  ) then
    raise exception 'an active battle uses an incompatible runtime and cannot be migrated safely'
      using errcode = '55000';
  end if;

  update public.authoritative_battle
  set engine_checksum = v_target_runtime_checksum
  where (
    status in ('active', 'needs_player_switch')
    or engine_runtime_state = 'pending'
  )
    and engine_checksum = v_previous_runtime_checksum;

  update public.authoritative_battle
  set requested_engine_checksum = v_target_runtime_checksum
  where (
    status in ('active', 'needs_player_switch')
    or engine_runtime_state = 'pending'
  )
    and requested_engine_checksum = v_previous_runtime_checksum;

  if not exists (
    select 1
    from public.catalog_engine_runtime_binding
    where catalog_release_id = v_catalog_release_id
      and engine_version = 'pokemon-game-revival'
      and engine_checksum = v_target_runtime_checksum
      and enabled
  ) or exists (
    select 1
    from public.authoritative_battle
    where (
      status in ('active', 'needs_player_switch')
      or engine_runtime_state = 'pending'
    )
      and coalesce(engine_checksum, requested_engine_checksum) <> v_target_runtime_checksum
  ) then
    raise exception 'battle summary runtime migration did not converge on the target runtime'
      using errcode = '55000';
  end if;
end
$bind_battle_summary_runtime$;

commit;
