begin;

do $bind_training_moves_only_runtime$
declare
  baseline_id uuid;
  target_runtime_checksum constant text := '8eaa7317147f21afd7dd7cef8865131eb6def5effeaff0abd7442249f228ee56';
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
    raise exception 'training moves-only runtime cannot be bound while a battle is active or pending'
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
$bind_training_moves_only_runtime$;

commit;
