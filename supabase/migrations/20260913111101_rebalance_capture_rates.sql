begin;

select server_authority_private.begin_game_data_change(
  p_label => 'Ribilancia probabilità di cattura e bonus status',
  p_affected_families => array['zones', 'items']::text[],
  p_source_checksums => jsonb_build_object(
    'app/data/capture-zones.js', '991adcccffd55e60626bce3f6889ae719ccdd095c8319cb182a13a27d9ab02b8',
    'app/data/items.js', 'b68ea50be11967e637405dd56a66de404cd6e93f48ccc1d5c5bd2ec99d57f771'
  ),
  p_requires_battle_idle => true
);

-- Only audited terminal snapshots may survive this capture-only runtime update.
do $$
begin
  if exists (select 1 from public.battle_dome_battle)
    or exists (select 1 from public.authoritative_battle where engine_snapshot is not null
      and (status not in ('concluded', 'abandoned')
        or engine_version is distinct from 'pokemon-game-revival'
        or engine_checksum is null or engine_checksum not in ('3ddd1a5af3bd3137b05d5c9b9bf4a0977e9f63a09204819ecf66f1f1cfc97774', 'b16989bce9dc53c0d155f486e5d0e030ac6fe624b6ea82bc40fc60cd11e04d18'))) then
    raise exception 'capture runtime deployment found an unsupported battle snapshot' using errcode = '55000';
  end if;
end;
$$;

-- Allow a positive configurable status coefficient instead of hard-coding 2.
alter table public.catalog_capture_status_multiplier
  drop constraint catalog_capture_status_multiplier_catch_multiplier_check;
alter table public.catalog_capture_status_multiplier
  add constraint catalog_capture_status_multiplier_catch_multiplier_check check (catch_multiplier >= 1);

update public.catalog_rarity_rule rule
set catch_multiplier = proposed.multiplier
from (values ('common', 190::numeric), ('uncommon', 140), ('rare', 90),
  ('super_rare', 45), ('ultra_rare', 20), ('fossil', 20), ('legendary', 7)) as proposed(rarity_key, multiplier)
where rule.catalog_release_id = (select id from public.catalog_release where version = 'revival-baseline')
  and rule.rarity_key = proposed.rarity_key;

update public.catalog_capture_status_multiplier
set catch_multiplier = 1.5
where catalog_release_id = (select id from public.catalog_release where version = 'revival-baseline');

update public.catalog_item
set rules = jsonb_set(rules, '{value}', case item_index when 101 then '1.3'::jsonb else '1.7'::jsonb end)
where catalog_release_id = (select id from public.catalog_release where version = 'revival-baseline')
  and item_index in (101, 102);

select server_authority_private.finish_game_data_change();

-- Add the new runtime without disabling previously published bindings.
insert into public.catalog_engine_runtime_binding(catalog_release_id, engine_version, engine_checksum, enabled)
select id, 'pokemon-game-revival', 'b16989bce9dc53c0d155f486e5d0e030ac6fe624b6ea82bc40fc60cd11e04d18', true
from public.catalog_release where version = 'revival-baseline'
on conflict (catalog_release_id, engine_version, engine_checksum) do update set enabled = excluded.enabled;

commit;
