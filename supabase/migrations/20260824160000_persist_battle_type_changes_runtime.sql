begin;

do $persist_battle_type_changes_runtime$
declare
  baseline_id uuid;
  previous_runtime_checksum constant text := '8eaa7317147f21afd7dd7cef8865131eb6def5effeaff0abd7442249f228ee56';
  target_runtime_checksum constant text := '6aff603440b868c91bcbecd25e635c9e414c43c4ceff837e8b49fb3c9ce0aa64';
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
    raise exception 'persistent type runtime migration did not converge on the target runtime'
      using errcode = '55000';
  end if;
end
$persist_battle_type_changes_runtime$;

commit;
