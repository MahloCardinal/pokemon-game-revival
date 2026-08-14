begin;

do $finalize_strict_battle_indexes_runtime$
declare
  baseline_id uuid;
  previous_runtime_checksum constant text := '72747d8b8088f03145795e897487e758effaae494328d854be94d1823b453f88';
  target_runtime_checksum constant text := '1cb046c6d16750bf56397f694268beff592f9348bbe648343a797b267a321947';
begin
  select id into strict baseline_id
  from public.catalog_release
  where version = 'revival-baseline'
    and status = 'published'
  for update;

  update public.authoritative_battle
  set engine_checksum = target_runtime_checksum
  where (status not in ('concluded', 'abandoned') or engine_runtime_state = 'pending')
    and engine_checksum = previous_runtime_checksum;

  update public.authoritative_battle
  set requested_engine_checksum = target_runtime_checksum
  where (status not in ('concluded', 'abandoned') or engine_runtime_state = 'pending')
    and requested_engine_checksum = previous_runtime_checksum;

  if exists (
    select 1
    from public.authoritative_battle
    where (status not in ('concluded', 'abandoned') or engine_runtime_state = 'pending')
      and coalesce(engine_checksum, requested_engine_checksum) <> target_runtime_checksum
  ) then
    raise exception 'cannot finalize strict battle indexes while an incompatible battle is active or pending'
      using errcode = '55000';
  end if;

  if not exists (
    select 1
    from public.catalog_engine_runtime_binding
    where catalog_release_id = baseline_id
      and engine_version = 'pokemon-game-revival'
      and engine_checksum = target_runtime_checksum
      and enabled
  ) then
    raise exception 'the deployed strict battle-index runtime binding is missing or disabled'
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
    raise exception 'strict battle-index runtime finalization did not converge on one active binding'
      using errcode = '55000';
  end if;
end
$finalize_strict_battle_indexes_runtime$;

commit;
