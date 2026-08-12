begin;

do $finalize$
declare
  target_catalog_id uuid;
  target_runtime_checksum constant text := '51ebd82cd1373b029f5b7e54aa8c3e5ee08732c7e05ce11b5ce3db12e048367f';
begin
  select id into strict target_catalog_id
  from public.catalog_release
  where version = 'revival-gym-rewards-20260812'
    and status = 'published';

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
    where catalog_release_id = target_catalog_id
      and engine_version = 'pokemon-game-revival'
      and engine_checksum = target_runtime_checksum
      and enabled
  ) then
    raise exception 'the target runtime binding is missing or disabled'
      using errcode = '55000';
  end if;

  update public.catalog_engine_runtime_binding
  set enabled = false
  where catalog_release_id = target_catalog_id
    and engine_version = 'pokemon-game-revival'
    and engine_checksum <> target_runtime_checksum
    and enabled;
end
$finalize$;

commit;
