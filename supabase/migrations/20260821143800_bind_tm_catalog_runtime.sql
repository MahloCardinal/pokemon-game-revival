begin;

do $bind_tm_catalog_runtime$
declare
  baseline_id uuid;
  target_runtime_checksum constant text := '6114205d5486a3aae0ca732836e4cf7cac06ada1e67e1dbdd03208628367db9d';
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
    raise exception 'TM catalog runtime cannot be bound while a battle is active or pending'
      using errcode = '55000';
  end if;

  insert into public.catalog_engine_runtime_binding (
    catalog_release_id, engine_version, engine_checksum, enabled
  ) values (
    baseline_id, 'pokemon-game-revival', target_runtime_checksum, true
  )
  on conflict (catalog_release_id, engine_version, engine_checksum)
  do update set enabled = true;
end
$bind_tm_catalog_runtime$;

commit;
