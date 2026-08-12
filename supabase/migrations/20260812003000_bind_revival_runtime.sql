begin;

do $binding$
declare
  active_catalog_id uuid;
  runtime_checksum constant text := '7261d3eee08c04e4cf65693c9c3843443258a1cbd202e2c25c41d475ee708480';
begin
  select id into strict active_catalog_id
  from public.catalog_release
  where status = 'published';

  if exists (
    select 1
    from public.authoritative_battle battle
    where battle.catalog_release_id = active_catalog_id
      and (
        battle.status in ('active', 'needs_player_switch')
        or battle.engine_runtime_state = 'pending'
      )
      and coalesce(battle.engine_checksum, battle.requested_engine_checksum)
        is distinct from runtime_checksum
  ) then
    raise exception 'cannot replace the runtime binding while incompatible battles are active'
      using errcode = '55000';
  end if;

  insert into public.catalog_engine_runtime_binding (
    catalog_release_id,
    engine_version,
    engine_checksum,
    enabled
  ) values (
    active_catalog_id,
    'pokemon-game-revival',
    runtime_checksum,
    true
  )
  on conflict (catalog_release_id, engine_version, engine_checksum)
  do update set enabled = excluded.enabled;

  update public.catalog_engine_runtime_binding
  set enabled = false
  where catalog_release_id = active_catalog_id
    and engine_version = 'pokemon-game-revival'
    and engine_checksum <> runtime_checksum
    and enabled;
end
$binding$;

commit;
