begin;

do $bind_granular_game_runtime$
declare
  baseline_id uuid;
  target_runtime_checksum constant text := '821256ca024278d58dbda68b668d2d04fb886220ea800546836073eb2bcac8e2';
begin
  select id into strict baseline_id
  from public.catalog_release
  where version = 'revival-baseline'
    and status = 'published'
  for update;

  insert into public.catalog_engine_runtime_binding (
    catalog_release_id, engine_version, engine_checksum, enabled
  ) values (
    baseline_id, 'pokemon-game-revival', target_runtime_checksum, true
  )
  on conflict (catalog_release_id, engine_version, engine_checksum)
  do update set enabled = true;

  if not exists (
    select 1 from public.catalog_engine_runtime_binding
    where catalog_release_id = baseline_id
      and engine_version = 'pokemon-game-revival'
      and engine_checksum = target_runtime_checksum
      and enabled
  ) then
    raise exception 'granular game runtime binding was not enabled' using errcode = '55000';
  end if;
end
$bind_granular_game_runtime$;

commit;
