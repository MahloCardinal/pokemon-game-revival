begin;

do $bind_battle_sprite_identity_runtime$
declare
  v_catalog_release_id uuid;
  v_runtime_checksum constant text := 'fe5ff576ec35e7d01101f1aba356dfbfd96ff862ca43ff8c669073cf6bd7af4d';
begin
  select id into strict v_catalog_release_id
  from public.catalog_release
  where version = 'revival-baseline'
    and status = 'published'
  for update;

  insert into public.catalog_engine_runtime_binding(
    catalog_release_id, engine_version, engine_checksum, enabled
  ) values (
    v_catalog_release_id, 'pokemon-game-revival', v_runtime_checksum, true
  )
  on conflict(catalog_release_id, engine_version, engine_checksum)
  do update set enabled = true;

  if not exists (
    select 1
    from public.catalog_engine_runtime_binding
    where catalog_release_id = v_catalog_release_id
      and engine_version = 'pokemon-game-revival'
      and engine_checksum = v_runtime_checksum
      and enabled
  ) then
    raise exception 'battle sprite identity runtime binding was not created'
      using errcode = '55000';
  end if;
end
$bind_battle_sprite_identity_runtime$;

commit;
