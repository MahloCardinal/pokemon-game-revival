begin;

do $consolidate$
declare
  active_catalog_id uuid;
  obsolete_catalog record;
  reference record;
  referenced_rows bigint;
  target_runtime_checksum constant text := '51ebd82cd1373b029f5b7e54aa8c3e5ee08732c7e05ce11b5ce3db12e048367f';
begin
  if exists (select 1 from auth.users)
    or exists (select 1 from public.player_profile_state)
    or exists (select 1 from public.authoritative_battle)
    or exists (select 1 from public.player_encounter)
    or exists (select 1 from public.player_pokemon_instance) then
    raise exception 'single development catalog consolidation requires an empty game database'
      using errcode = '55000';
  end if;

  select id into strict active_catalog_id
  from public.catalog_release
  where status = 'published'
  for update;

  if not exists (
    select 1
    from public.catalog_engine_runtime_binding
    where catalog_release_id = active_catalog_id
      and engine_version = 'pokemon-game-revival'
      and engine_checksum = target_runtime_checksum
      and enabled
  ) then
    raise exception 'the active catalog is not bound to the current runtime'
      using errcode = '55000';
  end if;

  update server_authority_private.runtime_catalog_config
  set catalog_release_id = active_catalog_id,
      allow_draft = false,
      updated_at = now()
  where catalog_release_id <> active_catalog_id
     or allow_draft;

  for obsolete_catalog in
    select id, version
    from public.catalog_release
    where id <> active_catalog_id
    for update
  loop
    for reference in
      select distinct tc.table_schema, tc.table_name
      from information_schema.table_constraints tc
      join information_schema.referential_constraints rc
        on rc.constraint_schema = tc.constraint_schema
       and rc.constraint_name = tc.constraint_name
      join information_schema.constraint_column_usage target
        on target.constraint_schema = rc.unique_constraint_schema
       and target.constraint_name = rc.unique_constraint_name
      where tc.constraint_type = 'FOREIGN KEY'
        and target.table_schema = 'public'
        and target.table_name = 'catalog_release'
        and tc.table_name not like 'catalog_%'
        and not (
          tc.table_schema = 'server_authority_private'
          and tc.table_name = 'runtime_catalog_config'
        )
    loop
      execute format(
        'select count(*) from %I.%I where catalog_release_id = $1',
        reference.table_schema,
        reference.table_name
      ) into referenced_rows using obsolete_catalog.id;

      if referenced_rows > 0 then
        raise exception 'obsolete catalog % is still referenced by %.% (% rows)',
          obsolete_catalog.version,
          reference.table_schema,
          reference.table_name,
          referenced_rows
          using errcode = '55000';
      end if;
    end loop;

    delete from public.catalog_engine_runtime_binding
    where catalog_release_id = obsolete_catalog.id;

    update public.catalog_release
    set status = 'draft',
        published_at = null
    where id = obsolete_catalog.id;

    -- These tables also reference another catalog table without ON DELETE
    -- CASCADE. Remove them first so the release-level cascades cannot race
    -- against their item, move, species, type or zone foreign keys.
    delete from public.catalog_opponent_move
    where catalog_release_id = obsolete_catalog.id;
    delete from public.catalog_opponent_reward
    where catalog_release_id = obsolete_catalog.id;
    delete from public.catalog_opponent_pokemon
    where catalog_release_id = obsolete_catalog.id;
    delete from public.catalog_species_evolution
    where catalog_release_id = obsolete_catalog.id;
    delete from public.catalog_species_level_move
    where catalog_release_id = obsolete_catalog.id;
    delete from public.catalog_species_machine_move
    where catalog_release_id = obsolete_catalog.id;
    delete from public.catalog_species_gender
    where catalog_release_id = obsolete_catalog.id;
    delete from public.catalog_species_type
    where catalog_release_id = obsolete_catalog.id;
    delete from public.catalog_type_effectiveness
    where catalog_release_id = obsolete_catalog.id;
    delete from public.catalog_zone_access_requirement
    where catalog_release_id = obsolete_catalog.id;
    delete from public.catalog_zone_type
    where catalog_release_id = obsolete_catalog.id;
    delete from public.catalog_shop_offer
    where catalog_release_id = obsolete_catalog.id;
    delete from public.catalog_battle_shop_offer
    where catalog_release_id = obsolete_catalog.id;
    delete from public.catalog_admin_battle_item
    where catalog_release_id = obsolete_catalog.id;
    delete from public.catalog_pve_move_category
    where catalog_release_id = obsolete_catalog.id;

    delete from public.catalog_release
    where id = obsolete_catalog.id;
  end loop;

  delete from public.catalog_engine_runtime_binding
  where catalog_release_id = active_catalog_id
    and (
      engine_version <> 'pokemon-game-revival'
      or engine_checksum <> target_runtime_checksum
      or not enabled
    );

  update public.catalog_release
  set version = 'revival-baseline'
  where id = active_catalog_id;

  if (select count(*) from public.catalog_release) <> 1
    or (select count(*) from public.catalog_engine_runtime_binding) <> 1
    or exists (
      select 1
      from server_authority_private.runtime_catalog_config
      where catalog_release_id <> active_catalog_id
        or allow_draft
    ) then
    raise exception 'development catalog consolidation did not converge on one baseline'
      using errcode = '55000';
  end if;
end
$consolidate$;

commit;
