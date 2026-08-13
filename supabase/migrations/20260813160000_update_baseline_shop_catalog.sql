begin;

do $update_baseline_shop$
declare
  baseline_id uuid;
  target_runtime_checksum constant text := '266b785e9c16976bd776016b9d93ebe5aa6e366bdc11fbffaa1c8f5038130b3e';
  unpurchasable_item_keys constant text[] := array[
    'acqua_fresca', 'gassosa', 'lemonsucco', 'latte_mumu', 'squama_cuore',
    'acqua_magica', 'argenpolvere', 'beccaffilato', 'calamita',
    'carbonella', 'cintura_nera', 'cucchiaio_torto', 'dente_di_drago',
    'gelomai', 'metalcopertura', 'miracolseme', 'occhialineri',
    'pietradura', 'piuma_fatata', 'sabbia_soffice', 'sciarpa_seta',
    'spettrotarga', 'velenaculeo', 'elettropalla', 'gambo',
    'fortunpugno', 'osso_spesso', 'distraroma', 'fortunaroma',
    'puroaroma', 'bizzoaroma', 'gonfioaroma', 'flauto_bianco',
    'flauto_nero', 'master_ball', 'felixpietra', 'pietralunare',
    'pietrasolare', 'dente_abissi', 'squamabissi', 'squama_bella',
    'upgrade', 'squama_drago', 'filo_dell_unione'
  ]::text[];
begin
  -- This in-place baseline workflow is only valid while development data is
  -- disposable. Once real players exist, catalog releases must stay immutable.
  if exists (select 1 from auth.users)
    or exists (select 1 from public.player_profile_state)
    or exists (select 1 from public.player_pokemon_instance)
    or exists (select 1 from public.player_encounter)
    or exists (select 1 from public.authoritative_battle)
    or exists (select 1 from public.authoritative_league_run)
    or exists (select 1 from public.authoritative_battle_tower_run) then
    raise exception 'revival-baseline can only be updated in place while the game database is empty'
      using errcode = '55000';
  end if;

  if (select count(*) from public.catalog_release) <> 1 then
    raise exception 'the development database must contain exactly one catalog release'
      using errcode = '55000';
  end if;

  select id into strict baseline_id
  from public.catalog_release
  where version = 'revival-baseline'
    and status = 'published'
  for update;

  update public.catalog_release
  set status = 'draft',
      published_at = null
  where id = baseline_id;

  update public.catalog_shop_offer offer
  set price = expected.price
  from (values
    ('ps_su', 10000),
    ('pp_su', 10000),
    ('pp_max', 15000)
  ) expected(item_key, price)
  join public.catalog_item item
    on item.catalog_release_id = baseline_id
   and item.item_key = expected.item_key
  where offer.catalog_release_id = baseline_id
    and offer.item_index = item.item_index;

  update public.catalog_shop_offer offer
  set price = null
  from public.catalog_item item
  where offer.catalog_release_id = baseline_id
    and item.catalog_release_id = offer.catalog_release_id
    and item.item_index = offer.item_index
    and item.item_key = any(unpurchasable_item_keys);

  -- The generator stores one sale rule for every item. Recompute it from the
  -- canonical purchase price so uncatalogued and non-purchasable items use 100.
  update public.catalog_shop_offer offer
  set sale_rules = jsonb_build_object(
    'price',
    case
      when item.category_key = 'Berry' then 50
      when offer.price is null then 100
      else floor(offer.price::numeric / 2)::integer
    end
  )
  from public.catalog_item item
  where offer.catalog_release_id = baseline_id
    and item.catalog_release_id = offer.catalog_release_id
    and item.item_index = offer.item_index;

  -- Reward labels are intentionally presentation-only and are stripped from
  -- relational reward rules. Their source hashes still belong in provenance.
  update public.catalog_import_batch
  set source_checksum = case family_key
      when 'shop' then '418e64b4ca76f4328219c872d6e85742b8864f1cd3f224170e8deed230c9fe21'
      when 'missions' then '30f9063f9e63f7f48b33d8e4be882158fc27f62f0e7877ac4ff45e6e4054b032'
      when 'battle-shop' then 'ede767282732ff4461bd4f6c224444765e0f5aba5137ed9ab909941e05555d10'
    end,
    imported_at = now()
  where catalog_release_id = baseline_id
    and (family_key, source_path) in (
      ('shop', 'app/data/shopping-center.js'),
      ('missions', 'app/data/pokefan-missions.js'),
      ('battle-shop', 'app/data/battle-shop.js')
    );

  if (select count(*) from public.catalog_import_batch
      where catalog_release_id = baseline_id
        and (family_key, source_path, source_checksum) in (
          ('shop', 'app/data/shopping-center.js', '418e64b4ca76f4328219c872d6e85742b8864f1cd3f224170e8deed230c9fe21'),
          ('missions', 'app/data/pokefan-missions.js', '30f9063f9e63f7f48b33d8e4be882158fc27f62f0e7877ac4ff45e6e4054b032'),
          ('battle-shop', 'app/data/battle-shop.js', 'ede767282732ff4461bd4f6c224444765e0f5aba5137ed9ab909941e05555d10')
        )) <> 3 then
    raise exception 'catalog source provenance was not updated completely'
      using errcode = '55000';
  end if;

  if exists (
    select 1
    from (values
      ('ps_su', 10000), ('pp_su', 10000), ('pp_max', 15000)
    ) expected(item_key, price)
    where not exists (
      select 1
      from public.catalog_shop_offer offer
      join public.catalog_item item
        on item.catalog_release_id = offer.catalog_release_id
       and item.item_index = offer.item_index
      where offer.catalog_release_id = baseline_id
        and item.item_key = expected.item_key
        and offer.price = expected.price
    )
  ) or (
    select count(*)
    from public.catalog_shop_offer offer
    join public.catalog_item item
      on item.catalog_release_id = offer.catalog_release_id
     and item.item_index = offer.item_index
    where offer.catalog_release_id = baseline_id
      and item.item_key = any(unpurchasable_item_keys)
      and offer.price is null
      and not offer.purchase_enabled
  ) <> cardinality(unpurchasable_item_keys) or exists (
    select 1
    from public.catalog_shop_offer offer
    join public.catalog_item item
      on item.catalog_release_id = offer.catalog_release_id
     and item.item_index = offer.item_index
    where offer.catalog_release_id = baseline_id
      and offer.sale_rules <> jsonb_build_object(
        'price',
        case
          when item.category_key = 'Berry' then 50
          when offer.price is null then 100
          else floor(offer.price::numeric / 2)::integer
        end
      )
  ) then
    raise exception 'shop catalog values do not match the canonical pricing rules'
      using errcode = '55000';
  end if;

  perform public.publish_catalog_release('revival-baseline');

  insert into public.catalog_engine_runtime_binding (
    catalog_release_id,
    engine_version,
    engine_checksum,
    enabled
  ) values (
    baseline_id,
    'pokemon-game-revival',
    target_runtime_checksum,
    true
  )
  on conflict (catalog_release_id, engine_version, engine_checksum)
  do update set enabled = excluded.enabled;

  if (select count(*) from public.catalog_release) <> 1
    or not exists (
      select 1
      from public.catalog_release
      where id = baseline_id
        and version = 'revival-baseline'
        and status = 'published'
    )
    or not exists (
      select 1
      from public.catalog_engine_runtime_binding
      where catalog_release_id = baseline_id
        and engine_version = 'pokemon-game-revival'
        and engine_checksum = target_runtime_checksum
        and enabled
    ) then
    raise exception 'the updated development baseline is incomplete'
      using errcode = '55000';
  end if;
end
$update_baseline_shop$;

commit;
