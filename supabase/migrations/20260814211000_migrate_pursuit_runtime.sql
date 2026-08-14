begin;

do $migrate_pursuit_runtime$
declare
  baseline_id uuid;
  previous_runtime_checksum constant text := '821256ca024278d58dbda68b668d2d04fb886220ea800546836073eb2bcac8e2';
  target_runtime_checksum constant text := '72747d8b8088f03145795e897487e758effaae494328d854be94d1823b453f88';
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

  if exists (
    select 1
    from public.authoritative_battle
    where (status not in ('concluded', 'abandoned') or engine_runtime_state = 'pending')
      and coalesce(engine_checksum, requested_engine_checksum) not in (
        previous_runtime_checksum,
        target_runtime_checksum
      )
  ) then
    raise exception 'an active battle uses an incompatible runtime and cannot be migrated safely'
      using errcode = '55000';
  end if;

  update public.authoritative_battle
  set engine_checksum = target_runtime_checksum
  where (status not in ('concluded', 'abandoned') or engine_runtime_state = 'pending')
    and engine_checksum = previous_runtime_checksum;

  update public.authoritative_battle
  set requested_engine_checksum = target_runtime_checksum
  where (status not in ('concluded', 'abandoned') or engine_runtime_state = 'pending')
    and requested_engine_checksum = previous_runtime_checksum;

  if not exists (
    select 1
    from public.catalog_engine_runtime_binding
    where catalog_release_id = baseline_id
      and engine_version = 'pokemon-game-revival'
      and engine_checksum = target_runtime_checksum
      and enabled
  ) or exists (
    select 1
    from public.authoritative_battle
    where (status not in ('concluded', 'abandoned') or engine_runtime_state = 'pending')
      and coalesce(engine_checksum, requested_engine_checksum) <> target_runtime_checksum
  ) then
    raise exception 'pursuit runtime migration did not converge on the target runtime'
      using errcode = '55000';
  end if;
end
$migrate_pursuit_runtime$;

commit;
