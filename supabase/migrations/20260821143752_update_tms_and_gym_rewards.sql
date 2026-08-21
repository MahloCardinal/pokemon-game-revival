begin;

select server_authority_private.begin_game_data_change(
  p_label => 'Aggiorna il catalogo delle MT',
  p_affected_families => array['items']::text[],
  p_source_checksums => jsonb_build_object(
    'app/data/items.js', 'f32d6713450deaf978068c206f17e031680c5f9ac6fa7318164809f4c5d52232'
  ),
  p_requires_battle_idle => true
);

with tm(item_index, move_index, tier) as (
  values
    (401, 51, 1), (402, 56, 2), (403, 142, 2), (404, 46, 0), (405, 228, 2),
    (406, 319, 2), (407, 137, 3), (408, 138, 1), (409, 84, 3), (410, 150, 1),
    (411, 134, 3), (412, 224, 3), (413, 130, 2), (414, 33, 3), (415, 151, 1),
    (416, 269, 1), (417, 223, 3), (418, 216, 3), (419, 133, 0), (420, 264, 2),
    (421, 119, 0), (422, 287, 3), (423, 53, 3), (424, 327, 0), (425, 325, 3),
    (426, 316, 2), (427, 102, 2), (428, 340, 1), (429, 226, 3), (430, 205, 3),
    (431, 37, 1), (432, 266, 2), (433, 248, 1), (434, 59, 2), (435, 126, 2),
    (436, 101, 2), (437, 317, 3), (438, 124, 3), (439, 258, 3), (440, 7, 2),
    (441, 176, 2), (442, 94, 1), (443, 116, 1), (444, 108, 2), (445, 154, 1),
    (446, 128, 0), (447, 12, 3), (448, 119, 2), (449, 273, 2), (450, 334, 2),
    (451, 95, 0), (452, 77, 0), (453, 312, 2), (454, 311, 0), (455, 50, 2)
)
insert into public.catalog_item (
  catalog_release_id, item_index, item_key, display_name, category_key,
  subcategory_key, move_index, rules
)
select
  release.id,
  tm.item_index,
  'tm' || lpad((tm.item_index - 400)::text, 2, '0'),
  'tm' || lpad((tm.item_index - 400)::text, 2, '0'),
  'tm',
  null,
  tm.move_index,
  jsonb_build_object(
    'number', tm.item_index - 400,
    'tier', tm.tier,
    'berryGrowthHours', null,
    'playerBattleUsable', false
  )
from tm
cross join lateral (
  select id from public.catalog_release where version = 'revival-baseline'
) release
on conflict (catalog_release_id, item_index) do update
set item_key = excluded.item_key,
    display_name = excluded.display_name,
    category_key = excluded.category_key,
    subcategory_key = excluded.subcategory_key,
    move_index = excluded.move_index,
    rules = excluded.rules
where (
  catalog_item.item_key, catalog_item.display_name, catalog_item.category_key,
  catalog_item.subcategory_key, catalog_item.move_index, catalog_item.rules
) is distinct from (
  excluded.item_key, excluded.display_name, excluded.category_key,
  excluded.subcategory_key, excluded.move_index, excluded.rules
);

select server_authority_private.finish_game_data_change();

select server_authority_private.begin_game_data_change(
  p_label => 'Aggiorna regole MT e premi Palestre',
  p_affected_families => array['progression']::text[],
  p_source_checksums => jsonb_build_object(
    'app/data/progression.js', '6a1506c78699191d20950a9f8bbcec0cf29c3468ef2372ea43f7e6ce51c57ace'
  ),
  p_requires_battle_idle => true
);

update public.catalog_progression_rule
set rules = '{"price":null,"tier":0,"unlockBadges":null}'::jsonb
where catalog_release_id = (select id from public.catalog_release where version = 'revival-baseline')
  and rule_family = 'tm_tier'
  and rule_key = '0'
  and rules is distinct from '{"price":null,"tier":0,"unlockBadges":null}'::jsonb;

with reward(rule_key, rules) as (
  values
    ('0', '{"badgeIndex":0,"item":600,"itemQuantity":3,"money":3000,"tm":421}'::jsonb),
    ('1', '{"badgeIndex":1,"item":222,"itemQuantity":1,"money":5000,"tm":454}'::jsonb),
    ('2', '{"badgeIndex":2,"item":601,"itemQuantity":3,"money":7000,"tm":424}'::jsonb),
    ('3', '{"badgeIndex":3,"item":619,"itemQuantity":1,"money":10000,"tm":419}'::jsonb),
    ('4', '{"badgeIndex":4,"item":223,"itemQuantity":1,"money":20000,"tm":404}'::jsonb),
    ('5', '{"badgeIndex":5,"item":602,"itemQuantity":3,"money":30000,"tm":446}'::jsonb),
    ('6', '{"badgeIndex":6,"item":618,"itemQuantity":1,"money":50000,"tm":452}'::jsonb),
    ('7', '{"badgeIndex":7,"item":229,"itemQuantity":1,"money":70000,"tm":451}'::jsonb)
)
update public.catalog_progression_rule target
set rules = reward.rules
from reward
where target.catalog_release_id = (select id from public.catalog_release where version = 'revival-baseline')
  and target.rule_family = 'gym_reward'
  and target.rule_key = reward.rule_key
  and target.rules is distinct from reward.rules;

insert into public.catalog_import_batch (
  catalog_release_id, family_key, source_path, source_checksum, row_count, entity_counts
)
select id, 'progression', 'app/data/items.js', 'f32d6713450deaf978068c206f17e031680c5f9ac6fa7318164809f4c5d52232', null, null
from public.catalog_release where version = 'revival-baseline'
on conflict (catalog_release_id, family_key, source_path) do update
set source_checksum = excluded.source_checksum, imported_at = now();

select server_authority_private.finish_game_data_change();

select server_authority_private.begin_game_data_change(
  p_label => 'Aggiorna disponibilita MT nel Centro Commerciale',
  p_affected_families => array['shop']::text[],
  p_source_checksums => jsonb_build_object(
    'app/data/shopping-center.js', '38ede9e0f46959a704b41f34255689b5211d21664eada7848d08e9b707b2eb41'
  ),
  p_requires_battle_idle => true
);

insert into public.catalog_shop_offer (
  catalog_release_id, offer_key, item_index, section_key, category_key, price,
  stock_rules, sort_order, purchase_enabled, sale_enabled, single_purchase,
  unlock_rules, sale_rules
)
select
  item.catalog_release_id,
  item.item_key,
  item.item_index,
  'tm_shop',
  'tms',
  case (item.rules ->> 'tier')::integer when 1 then 8000 when 2 then 5000 when 3 then 3000 else null end,
  '{"kind":"single_owned","limit":1}'::jsonb,
  item.item_index - 311,
  (item.rules ->> 'tier')::integer <> 0,
  false,
  true,
  jsonb_build_object(
    'kind', 'badges',
    'value', case (item.rules ->> 'tier')::integer when 1 then 6 when 2 then 4 when 3 then 0 else null end
  ),
  jsonb_build_object(
    'price', case (item.rules ->> 'tier')::integer when 1 then 4000 when 2 then 2500 when 3 then 1500 else 100 end
  )
from public.catalog_item item
join public.catalog_release release on release.id = item.catalog_release_id
where release.version = 'revival-baseline'
  and item.category_key = 'tm'
on conflict (catalog_release_id, offer_key) do update
set item_index = excluded.item_index,
    section_key = excluded.section_key,
    category_key = excluded.category_key,
    price = excluded.price,
    stock_rules = excluded.stock_rules,
    sort_order = excluded.sort_order,
    purchase_enabled = excluded.purchase_enabled,
    sale_enabled = excluded.sale_enabled,
    single_purchase = excluded.single_purchase,
    unlock_rules = excluded.unlock_rules,
    sale_rules = excluded.sale_rules
where (
  catalog_shop_offer.item_index, catalog_shop_offer.section_key, catalog_shop_offer.category_key,
  catalog_shop_offer.price, catalog_shop_offer.stock_rules, catalog_shop_offer.sort_order,
  catalog_shop_offer.purchase_enabled, catalog_shop_offer.sale_enabled,
  catalog_shop_offer.single_purchase, catalog_shop_offer.unlock_rules, catalog_shop_offer.sale_rules
) is distinct from (
  excluded.item_index, excluded.section_key, excluded.category_key,
  excluded.price, excluded.stock_rules, excluded.sort_order,
  excluded.purchase_enabled, excluded.sale_enabled,
  excluded.single_purchase, excluded.unlock_rules, excluded.sale_rules
);

insert into public.catalog_import_batch (
  catalog_release_id, family_key, source_path, source_checksum, row_count, entity_counts
)
select release.id, 'shop', source.source_path, source.source_checksum, null, null
from public.catalog_release release
cross join (values
  ('app/data/items.js', 'f32d6713450deaf978068c206f17e031680c5f9ac6fa7318164809f4c5d52232'),
  ('app/data/progression.js', '6a1506c78699191d20950a9f8bbcec0cf29c3468ef2372ea43f7e6ce51c57ace')
) source(source_path, source_checksum)
where release.version = 'revival-baseline'
on conflict (catalog_release_id, family_key, source_path) do update
set source_checksum = excluded.source_checksum, imported_at = now();

select server_authority_private.finish_game_data_change();

select server_authority_private.begin_game_data_change(
  p_label => 'Aggiorna disponibilita MT nel Negozio Lotta',
  p_affected_families => array['battle-shop']::text[],
  p_source_checksums => jsonb_build_object(
    'app/data/battle-shop.js', '6193e5a880a2f5e84893cecc5563022a9ca2e232aab76e5f7952514b36b85a23'
  ),
  p_requires_battle_idle => true
);

delete from public.catalog_battle_shop_offer offer
using public.catalog_item item, public.catalog_release release
where release.version = 'revival-baseline'
  and offer.catalog_release_id = release.id
  and item.catalog_release_id = release.id
  and item.item_index = offer.item_index
  and item.category_key = 'tm'
  and (item.rules ->> 'tier')::integer = 0;

update public.catalog_battle_shop_offer offer
set sort_order = offer.sort_order - 5
from public.catalog_release release
where release.version = 'revival-baseline'
  and offer.catalog_release_id = release.id
  and offer.sort_order >= 86;

with purchasable_tm as (
  select
    item.catalog_release_id,
    item.item_index,
    item.item_key,
    33 + row_number() over (order by item.item_index) as sort_order
  from public.catalog_item item
  join public.catalog_release release on release.id = item.catalog_release_id
  where release.version = 'revival-baseline'
    and item.category_key = 'tm'
    and (item.rules ->> 'tier')::integer <> 0
)
insert into public.catalog_battle_shop_offer (
  catalog_release_id, offer_key, offer_kind, item_index,
  battle_point_price, sort_order, rules
)
select catalog_release_id, 'item_' || item_index, 'item', item_index, 10, sort_order, '{"group":"tms"}'::jsonb
from purchasable_tm
on conflict (catalog_release_id, offer_key) do update
set offer_kind = excluded.offer_kind,
    item_index = excluded.item_index,
    battle_point_price = excluded.battle_point_price,
    sort_order = excluded.sort_order,
    rules = excluded.rules
where (
  catalog_battle_shop_offer.offer_kind, catalog_battle_shop_offer.item_index,
  catalog_battle_shop_offer.battle_point_price, catalog_battle_shop_offer.sort_order,
  catalog_battle_shop_offer.rules
) is distinct from (
  excluded.offer_kind, excluded.item_index,
  excluded.battle_point_price, excluded.sort_order,
  excluded.rules
);

insert into public.catalog_import_batch (
  catalog_release_id, family_key, source_path, source_checksum, row_count, entity_counts
)
select release.id, 'battle-shop', source.source_path, source.source_checksum, null, null
from public.catalog_release release
cross join (values
  ('app/data/items.js', 'f32d6713450deaf978068c206f17e031680c5f9ac6fa7318164809f4c5d52232'),
  ('app/data/progression.js', '6a1506c78699191d20950a9f8bbcec0cf29c3468ef2372ea43f7e6ce51c57ace')
) source(source_path, source_checksum)
where release.version = 'revival-baseline'
on conflict (catalog_release_id, family_key, source_path) do update
set source_checksum = excluded.source_checksum, imported_at = now();

select server_authority_private.finish_game_data_change();

select server_authority_private.begin_game_data_change(
  p_label => 'Aggiorna le MT premio delle missioni',
  p_affected_families => array['missions']::text[],
  p_source_checksums => jsonb_build_object(
    'app/data/pokefan-missions.js', 'fd2547aeba5a96642245bf6d8bda5e2b784d9f2caeb5d047ef39bfc3d94d5ac1'
  ),
  p_requires_battle_idle => true
);

with tm_reward as (
  select jsonb_build_object(
    'choiceKey', 'purchasable_tm',
    'choices', jsonb_agg(
      jsonb_build_object('itemIndex', item.item_index, 'kind', 'item', 'quantity', 1)
      order by item.item_index
    ),
    'kind', 'choice',
    'purchasableNow', true
  ) as rules
  from public.catalog_item item
  join public.catalog_release release on release.id = item.catalog_release_id
  where release.version = 'revival-baseline'
    and item.category_key = 'tm'
    and (item.rules ->> 'tier')::integer <> 0
)
update public.catalog_mission mission
set reward_rules = tm_reward.rules
from tm_reward
where mission.catalog_release_id = (select id from public.catalog_release where version = 'revival-baseline')
  and mission.mission_index in (1002, 3002)
  and mission.reward_rules is distinct from tm_reward.rules;

insert into public.catalog_import_batch (
  catalog_release_id, family_key, source_path, source_checksum, row_count, entity_counts
)
select release.id, 'missions', source.source_path, source.source_checksum, null, null
from public.catalog_release release
cross join (values
  ('app/data/items.js', 'f32d6713450deaf978068c206f17e031680c5f9ac6fa7318164809f4c5d52232'),
  ('app/data/progression.js', '6a1506c78699191d20950a9f8bbcec0cf29c3468ef2372ea43f7e6ce51c57ace'),
  ('app/data/shopping-center.js', '38ede9e0f46959a704b41f34255689b5211d21664eada7848d08e9b707b2eb41')
) source(source_path, source_checksum)
where release.version = 'revival-baseline'
on conflict (catalog_release_id, family_key, source_path) do update
set source_checksum = excluded.source_checksum, imported_at = now();

select server_authority_private.finish_game_data_change();

select server_authority_private.begin_game_data_change(
  p_label => 'Aggiunge le MT ai premi delle Palestre',
  p_affected_families => array['opponents']::text[],
  p_source_checksums => jsonb_build_object(
    'app/data/gyms.js', '97d085e8122c95df098cb991fcc0fab9ab475efed7f5d70b306f82ac6bea756f'
  ),
  p_requires_battle_idle => true
);

with gym as (
  select opponent.catalog_release_id, opponent.opponent_key, opponent.badge_index, progression.rules
  from public.catalog_opponent opponent
  join public.catalog_progression_rule progression
    on progression.catalog_release_id = opponent.catalog_release_id
   and progression.rule_family = 'gym_reward'
   and progression.rule_key = opponent.badge_index::text
  join public.catalog_release release on release.id = opponent.catalog_release_id
  where release.version = 'revival-baseline'
    and opponent.opponent_kind = 'gym'
), reward as (
  select catalog_release_id, opponent_key, 0::smallint reward_order, 'money'::text reward_kind,
    null::integer item_index, (rules ->> 'money')::integer quantity, '{}'::jsonb rules
  from gym
  union all
  select catalog_release_id, opponent_key, 1, 'item', (rules ->> 'tm')::integer, 1, '{}'::jsonb from gym
  union all
  select catalog_release_id, opponent_key, 2, 'item', (rules ->> 'item')::integer,
    (rules ->> 'itemQuantity')::integer, '{}'::jsonb from gym
  union all
  select catalog_release_id, opponent_key, 3, 'badge', null, 1,
    jsonb_build_object('badgeIndex', badge_index) from gym
)
insert into public.catalog_opponent_reward (
  catalog_release_id, opponent_key, reward_order, reward_kind,
  item_index, quantity, rules, presentation
)
select catalog_release_id, opponent_key, reward_order, reward_kind, item_index, quantity, rules, '{}'::jsonb
from reward
on conflict (catalog_release_id, opponent_key, reward_order) do update
set reward_kind = excluded.reward_kind,
    item_index = excluded.item_index,
    quantity = excluded.quantity,
    rules = excluded.rules,
    presentation = excluded.presentation
where (
  catalog_opponent_reward.reward_kind, catalog_opponent_reward.item_index,
  catalog_opponent_reward.quantity, catalog_opponent_reward.rules,
  catalog_opponent_reward.presentation
) is distinct from (
  excluded.reward_kind, excluded.item_index,
  excluded.quantity, excluded.rules,
  excluded.presentation
);

insert into public.catalog_import_batch (
  catalog_release_id, family_key, source_path, source_checksum, row_count, entity_counts
)
select release.id, 'opponents', source.source_path, source.source_checksum, null, null
from public.catalog_release release
cross join (values
  ('app/data/items.js', 'f32d6713450deaf978068c206f17e031680c5f9ac6fa7318164809f4c5d52232'),
  ('app/data/progression.js', '6a1506c78699191d20950a9f8bbcec0cf29c3468ef2372ea43f7e6ce51c57ace')
) source(source_path, source_checksum)
where release.version = 'revival-baseline'
on conflict (catalog_release_id, family_key, source_path) do update
set source_checksum = excluded.source_checksum,
    imported_at = now();

select server_authority_private.finish_game_data_change();

commit;
