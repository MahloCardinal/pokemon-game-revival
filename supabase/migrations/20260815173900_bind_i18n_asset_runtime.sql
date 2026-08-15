begin;

do $bind_i18n_asset_runtime$
declare
  baseline_id uuid;
  target_runtime_checksum constant text := '22a8c61426ae837e32b3e36222860644fd3cff521757fa76bb8fba8094936018';
begin
  select id into strict baseline_id
  from public.catalog_release
  where version = 'revival-baseline'
    and status = 'published'
  for update;

  if exists (
    select 1
    from public.authoritative_battle
    where status not in ('concluded', 'abandoned')
       or engine_runtime_state = 'pending'
  ) then
    raise exception 'i18n asset runtime cannot be bound while a battle is active or pending'
      using errcode = '55000';
  end if;

  insert into public.catalog_engine_runtime_binding (
    catalog_release_id, engine_version, engine_checksum, enabled
  ) values (
    baseline_id, 'pokemon-game-revival', target_runtime_checksum, true
  )
  on conflict (catalog_release_id, engine_version, engine_checksum)
  do update set enabled = true;

  if not exists (
    select 1
    from public.catalog_engine_runtime_binding
    where catalog_release_id = baseline_id
      and engine_version = 'pokemon-game-revival'
      and engine_checksum = target_runtime_checksum
      and enabled
  ) then
    raise exception 'i18n asset runtime binding was not created'
      using errcode = '55000';
  end if;
end
$bind_i18n_asset_runtime$;

commit;
