begin;

select server_authority_private.begin_game_data_change(
  p_label => 'Move capture zone labels to i18n catalog',
  p_affected_families => array['zones']::text[],
  p_source_checksums => jsonb_build_object(
    'app/data/capture-zones.js', '7353860549a4868139b8236a1caf93d3470613738b4c8764f7c8f548c71f61b1',
    'app/data/type-chart.js', '8a47bca565d108cdcb86f28d30022a108be27cf6804251ad54279ba912322212',
    'app/data/i18n/it.js', '4520faf1ed16b2e9a0e87078584781a25cab3644040e3aff484e6a006417abf3'
  ),
  p_requires_battle_idle => true
);

insert into public.catalog_import_batch (
  catalog_release_id, family_key, source_path, source_checksum, row_count, entity_counts
)
select release.id, 'zones', source.source_path, source.source_checksum, null, null
from public.catalog_release release
cross join (values
  ('app/data/type-chart.js', '8a47bca565d108cdcb86f28d30022a108be27cf6804251ad54279ba912322212'),
  ('app/data/i18n/it.js', '4520faf1ed16b2e9a0e87078584781a25cab3644040e3aff484e6a006417abf3')
) source(source_path, source_checksum)
where release.version = 'revival-baseline'
on conflict (catalog_release_id, family_key, source_path)
do update set source_checksum = excluded.source_checksum, imported_at = now();

update public.catalog_zone zone
set display_name = labels.display_name
from (values
  ('viridian_forest', 'Bosco Smeraldo'),
  ('mt_moon', 'Monte Luna'),
  ('sea', 'Mare'),
  ('ghost_tower', 'Torre Fantasma'),
  ('safari_zone', 'Safari'),
  ('swamp', 'Palude'),
  ('desert', 'Deserto')
) labels(zone_key, display_name)
where zone.catalog_release_id = (
    select id from public.catalog_release where version = 'revival-baseline'
  )
  and zone.zone_key = labels.zone_key;

select server_authority_private.finish_game_data_change();

commit;
