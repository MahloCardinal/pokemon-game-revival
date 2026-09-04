begin;

-- Do not replace the catalog/runtime while a battle can still consume it.
lock table public.authoritative_battle, public.battle_dome_battle in share row exclusive mode;
do $$
begin
  if exists (select 1 from public.battle_dome_battle)
     or exists (select 1 from public.authoritative_battle
                where status in ('active', 'needs_player_switch', 'prepared')
                   or engine_runtime_state = 'pending') then
    raise exception 'Rarity rename requires no open battles' using errcode = '55000';
  end if;
end;
$$;

select server_authority_private.begin_game_data_change(
  p_label => 'Rename ultra rare tier and filter capture feed',
  p_affected_families => array['zones', 'species']::text[],
  p_source_checksums => jsonb_build_object(
    'app/data/capture-zones.js', 'dffd9b5a1f6cd4dda595dfb700ac9ce286f0af081234fc8781b03451ed23aaa9',
    'app/data/species_I.js', '42fe81a57dd707986f6834727078419c83c14c494ed81ef624b502ac7d9671cb',
    'app/data/species_II.js', 'e228cf6175e9a12e84f40457efaff856406f786d08cb322c9669d50ea83ff8ff',
    'app/data/species_III.js', '099df0a8dd2a539ab10c71fc6cd94a42238ba0efa2c87d90652963a47a068075'
  ),
  p_requires_battle_idle => true
);

update public.catalog_rarity_rule
set rarity_key = 'ultra_rare'
where catalog_release_id = (select id from public.catalog_release where version = 'revival-baseline')
  and rarity_key = 'mythic';

update public.catalog_species
set encounter_rarity_key = 'ultra_rare'
where catalog_release_id = (select id from public.catalog_release where version = 'revival-baseline')
  and encounter_rarity_key = 'mythic';

update public.player_encounter
set rarity_key = 'ultra_rare'
where catalog_release_id = (select id from public.catalog_release where version = 'revival-baseline')
  and rarity_key = 'mythic';

select server_authority_private.finish_game_data_change();

-- Preserve all starter command validation, receipts and permissions; rename only its tier.
do $starter_rarity$
declare
  v_definition text := pg_get_functiondef('public.choose_starter_authoritative(uuid,bigint,integer,text,text)'::regprocedure);
  v_old text := '(''super_rare'', ''fossil'', ''mythic'', ''legendary'')';
begin
  if strpos(v_definition, v_old) = 0 then
    raise exception 'Starter rarity validation does not match the expected contract';
  end if;
  execute replace(v_definition, v_old, '(''super_rare'', ''fossil'', ''ultra_rare'', ''legendary'')');
end;
$starter_rarity$;

create or replace function server_authority_private.record_capture_activity_feed_event()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin
  if new.status = 'consumed'
     and new.captured_pokemon_instance_id is not null
     and new.species_key is not null
     and new.rarity_key in ('rare', 'super_rare', 'ultra_rare', 'fossil', 'legendary')
     and (
       old.status is distinct from new.status
       or old.captured_pokemon_instance_id is distinct from new.captured_pokemon_instance_id
     ) then
    perform server_authority_private.append_global_activity_feed_event(
      new.auth_user_id, 'capture', new.species_key, null
    );
  end if;
  return new;
end;
$$;

revoke all on function server_authority_private.record_capture_activity_feed_event()
  from public, anon, authenticated;

-- Keep prior bindings for historical terminal snapshots.
insert into public.catalog_engine_runtime_binding (
  catalog_release_id, engine_version, engine_checksum, enabled
)
select id, 'pokemon-game-revival',
       '3ddd1a5af3bd3137b05d5c9b9bf4a0977e9f63a09204819ecf66f1f1cfc97774', true
from public.catalog_release
where version = 'revival-baseline' and status = 'published'
on conflict (catalog_release_id, engine_version, engine_checksum)
do update set enabled = true;

commit;
