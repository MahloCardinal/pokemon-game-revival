begin;

do $finalize_shop_runtime$
declare
  baseline_id uuid;
  target_runtime_checksum constant text := '266b785e9c16976bd776016b9d93ebe5aa6e366bdc11fbffaa1c8f5038130b3e';
begin
  select id into strict baseline_id
  from public.catalog_release
  where version = 'revival-baseline'
    and status = 'published'
  for update;

  if exists (
    select 1
    from public.authoritative_battle
    where status in ('active', 'needs_player_switch')
       or engine_runtime_state = 'pending'
  ) then
    raise exception 'cannot finalize the runtime binding while authoritative battles are active or pending'
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
    raise exception 'the target runtime binding is missing or disabled'
      using errcode = '55000';
  end if;

  delete from public.catalog_engine_runtime_binding
  where catalog_release_id = baseline_id
    and (
      engine_version <> 'pokemon-game-revival'
      or engine_checksum <> target_runtime_checksum
      or not enabled
    );

  if (select count(*) from public.catalog_release) <> 1
    or (select count(*) from public.catalog_engine_runtime_binding) <> 1
    or exists (
      select 1
      from server_authority_private.runtime_catalog_config
      where catalog_release_id <> baseline_id
         or allow_draft
    ) then
    raise exception 'runtime finalization did not converge on one catalog and one binding'
      using errcode = '55000';
  end if;
end
$finalize_shop_runtime$;

commit;
