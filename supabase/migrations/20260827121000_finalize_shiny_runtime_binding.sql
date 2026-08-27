begin;

do $finalize_shiny_runtime_binding$
declare
  v_catalog_release_id uuid;
  v_runtime_checksum constant text := '429840015afd63fa0679c5c10b4d7d1f3c1f6a94552feb2b3b34ab4991aece4a';
begin
  if exists (
    select 1 from public.authoritative_battle
    where status in ('active', 'needs_player_switch')
      and coalesce(engine_checksum, requested_engine_checksum) is distinct from v_runtime_checksum
  ) then
    raise exception 'cannot finalize the Shiny runtime while an older battle snapshot is active'
      using errcode = '55000';
  end if;

  select id into strict v_catalog_release_id
  from public.catalog_release
  where version = 'revival-baseline' and status = 'published'
  for update;

  if not exists (
    select 1 from public.catalog_engine_runtime_binding
    where catalog_release_id = v_catalog_release_id
      and engine_version = 'pokemon-game-revival'
      and engine_checksum = v_runtime_checksum
      and enabled
  ) then
    raise exception 'the deployed Shiny runtime binding is missing' using errcode = '55000';
  end if;

  delete from public.catalog_engine_runtime_binding
  where catalog_release_id = v_catalog_release_id
    and (engine_version <> 'pokemon-game-revival' or engine_checksum <> v_runtime_checksum or not enabled);

  if (select count(*) from public.catalog_engine_runtime_binding where catalog_release_id = v_catalog_release_id) <> 1 then
    raise exception 'Shiny runtime binding cleanup did not converge on one binding' using errcode = '55000';
  end if;
end
$finalize_shiny_runtime_binding$;

commit;
