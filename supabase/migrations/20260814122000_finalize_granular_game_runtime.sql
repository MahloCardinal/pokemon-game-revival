begin;

do $finalize_granular_game_runtime$
declare
  baseline_id uuid;
  target_runtime_checksum constant text := '821256ca024278d58dbda68b668d2d04fb886220ea800546836073eb2bcac8e2';
begin
  select id into strict baseline_id
  from public.catalog_release
  where version = 'revival-baseline'
    and status = 'published'
  for update;

  if exists (
    select 1 from public.authoritative_battle
    where status not in ('concluded', 'abandoned')
       or engine_runtime_state = 'pending'
  ) then
    raise exception 'cannot remove transitional runtime bindings while battles are active or pending'
      using errcode = '55000';
  end if;

  if not exists (
    select 1 from public.catalog_engine_runtime_binding
    where catalog_release_id = baseline_id
      and engine_version = 'pokemon-game-revival'
      and engine_checksum = target_runtime_checksum
      and enabled
  ) then
    raise exception 'the deployed granular runtime binding is missing or disabled'
      using errcode = '55000';
  end if;

  delete from public.catalog_engine_runtime_binding
  where catalog_release_id = baseline_id
    and (
      engine_version <> 'pokemon-game-revival'
      or engine_checksum <> target_runtime_checksum
      or not enabled
    );

  if (select count(*) from public.catalog_engine_runtime_binding) <> 1 then
    raise exception 'runtime binding finalization did not converge on one active binding'
      using errcode = '55000';
  end if;
end
$finalize_granular_game_runtime$;

commit;
