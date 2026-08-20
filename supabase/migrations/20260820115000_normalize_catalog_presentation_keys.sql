begin;

select server_authority_private.begin_game_data_change(
  p_label => 'Normalize move catalog presentation fields to technical keys',
  p_affected_families => array['moves']::text[],
  p_source_checksums => jsonb_build_object(
    'app/data/moves.js', 'b714e64bca4606fe3ccf011df33e4dca57197ba8d5282b485cd7befe8a883f18'
  ),
  p_requires_battle_idle => false
);

update public.catalog_move
set display_name = move_key,
    rules = rules - 'description'
where catalog_release_id = (
    select id from public.catalog_release where version = 'revival-baseline'
  )
  and (display_name is distinct from move_key or rules ? 'description');

select server_authority_private.finish_game_data_change();

select server_authority_private.begin_game_data_change(
  p_label => 'Normalize item catalog presentation fields to technical keys',
  p_affected_families => array['items']::text[],
  p_source_checksums => jsonb_build_object(
    'app/data/items.js', '97ce05b27663a71e34df7b4876740f298520b857e250e542703d0b00259c8b2b'
  ),
  p_requires_battle_idle => false
);

update public.catalog_item
set display_name = item_key,
    rules = rules - 'description'
where catalog_release_id = (
    select id from public.catalog_release where version = 'revival-baseline'
  )
  and (display_name is distinct from item_key or rules ? 'description');

select server_authority_private.finish_game_data_change();

select server_authority_private.begin_game_data_change(
  p_label => 'Normalize zone catalog presentation fields to technical keys',
  p_affected_families => array['zones']::text[],
  p_source_checksums => jsonb_build_object(
    'app/data/capture-zones.js', '7353860549a4868139b8236a1caf93d3470613738b4c8764f7c8f548c71f61b1'
  ),
  p_requires_battle_idle => false
);

update public.catalog_type
set display_name = type_key
where catalog_release_id = (
    select id from public.catalog_release where version = 'revival-baseline'
  )
  and display_name is distinct from type_key;

update public.catalog_zone
set display_name = zone_key
where catalog_release_id = (
    select id from public.catalog_release where version = 'revival-baseline'
  )
  and display_name is distinct from zone_key;

select server_authority_private.finish_game_data_change();

select server_authority_private.begin_game_data_change(
  p_label => 'Normalize opponent catalog presentation fields to technical keys',
  p_affected_families => array['opponents']::text[],
  p_source_checksums => jsonb_build_object(
    'app/data/gyms.js', 'c84637f31b9a6099cc829f245d5dcbc03f9c76afb55741b80affb02aefd948ce'
  ),
  p_requires_battle_idle => false
);

update public.catalog_opponent
set presentation = (presentation - 'cityTitle')
  || jsonb_build_object('cityKey', substring(opponent_key from 5))
where catalog_release_id = (
    select id from public.catalog_release where version = 'revival-baseline'
  )
  and opponent_kind = 'gym'
  and (
    presentation ? 'cityTitle'
    or presentation ->> 'cityKey' is distinct from substring(opponent_key from 5)
  );

select server_authority_private.finish_game_data_change();

commit;
