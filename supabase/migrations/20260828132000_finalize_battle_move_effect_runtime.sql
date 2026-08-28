begin;

do $finalize_battle_move_effect_runtime$
declare
  v_catalog_release_id uuid;
  v_runtime_checksum constant text := '48293aae74ba45f53667b6d52a6101e7509ac095e38571bdd6a05a165dc811f0';
begin
  if exists (
    select 1
    from public.authoritative_battle
    where (
      status in ('active', 'needs_player_switch')
      or engine_runtime_state = 'pending'
    )
      and coalesce(engine_checksum, requested_engine_checksum) is distinct from v_runtime_checksum
  ) then
    raise exception 'cannot finalize battle move effect runtime while an older battle is active or pending'
      using errcode = '55000';
  end if;

  select id into strict v_catalog_release_id
  from public.catalog_release
  where version = 'revival-baseline'
    and status = 'published'
  for update;

  if not exists (
    select 1
    from public.catalog_engine_runtime_binding
    where catalog_release_id = v_catalog_release_id
      and engine_version = 'pokemon-game-revival'
      and engine_checksum = v_runtime_checksum
      and enabled
  ) then
    raise exception 'the deployed battle move effect runtime binding is missing'
      using errcode = '55000';
  end if;

  delete from public.catalog_engine_runtime_binding
  where catalog_release_id = v_catalog_release_id
    and (engine_version <> 'pokemon-game-revival' or engine_checksum <> v_runtime_checksum or not enabled);

  if (select count(*) from public.catalog_engine_runtime_binding where catalog_release_id = v_catalog_release_id) <> 1 then
    raise exception 'battle move effect runtime binding cleanup did not converge on one binding'
      using errcode = '55000';
  end if;
end
$finalize_battle_move_effect_runtime$;

commit;
