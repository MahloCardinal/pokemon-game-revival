begin;

create or replace function server_authority_private.battle_shop_offers_projection(p_auth_user_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, server_authority_private, pg_temp
as $$
declare
  v_catalog_release_id uuid;
  v_badges integer;
  v_level integer;
begin
  select catalog_release_id, badges
  into v_catalog_release_id, v_badges
  from public.player_profile_state
  where auth_user_id = p_auth_user_id;

  if v_catalog_release_id is null then
    return '[]'::jsonb;
  end if;

  select (rules ->> 'level')::integer
  into v_level
  from public.catalog_progression_rule
  where catalog_release_id = v_catalog_release_id
    and rule_family = 'badge_level_limit'
    and rule_key = least(8, greatest(0, coalesce(v_badges, 0)))::text;

  return coalesce((
    select jsonb_agg(row_json order by sort_order, stable_order)
    from (
      select
        offer.sort_order,
        offer.offer_key as stable_order,
        jsonb_build_object(
          'offer_key', offer.offer_key,
          'offer_kind', 'item',
          'item_index', offer.item_index,
          'battle_point_price', offer.battle_point_price,
          'eligible', true
        ) as row_json
      from public.catalog_battle_shop_offer offer
      where offer.catalog_release_id = v_catalog_release_id
        and offer.offer_kind = 'item'
        and coalesce(offer.rules ->> 'group', '') not in (
          'Bacca a crescita veloce',
          'Bacca a crescita lenta',
          'tms',
          'Strumenti evolutivi',
          'Aromi',
          'Strumenti potenziatore Tipo'
        )

      union all

      select
        min(offer.sort_order),
        offer.choice_key,
        jsonb_build_object(
          'offer_key', offer.choice_key,
          'offer_kind', 'item_choice',
          'battle_point_price', min(offer.battle_point_price),
          'eligible', count(*) > 0,
          'choices', jsonb_agg(
            jsonb_build_object('offer_key', offer.offer_key, 'item_index', item.item_index)
            order by item.item_index
          )
        ) as row_json
      from (
        select
          grouped_offer.*,
          case grouped_offer.rules ->> 'group'
            when 'Bacca a crescita veloce' then 'choice_berry_fast'
            when 'Bacca a crescita lenta' then 'choice_berry_slow'
            when 'tms' then 'choice_tm'
            when 'Strumenti evolutivi' then 'choice_evolution'
            when 'Aromi' then 'choice_incense'
            else 'choice_type_booster'
          end as choice_key,
          grouped_offer.rules ->> 'group' as group_name
        from public.catalog_battle_shop_offer grouped_offer
        where grouped_offer.catalog_release_id = v_catalog_release_id
          and grouped_offer.offer_kind = 'item'
          and coalesce(grouped_offer.rules ->> 'group', '') in (
            'Bacca a crescita veloce',
            'Bacca a crescita lenta',
            'tms',
            'Strumenti evolutivi',
            'Aromi',
            'Strumenti potenziatore Tipo'
          )
      ) offer
      join public.catalog_item item
        on item.catalog_release_id = offer.catalog_release_id
       and item.item_index = offer.item_index
      where offer.group_name <> 'tms'
         or (
           v_badges >= case coalesce((item.rules ->> 'tier')::integer, 3)
             when 0 then 7
             when 1 then 6
             when 2 then 4
             else 0
           end
           and not exists (
             select 1
             from public.player_inventory_item inventory
             where inventory.auth_user_id = p_auth_user_id
               and inventory.catalog_release_id = offer.catalog_release_id
               and inventory.item_index = offer.item_index
               and inventory.quantity > 0
           )
         )
      group by offer.group_name, offer.choice_key

      union all

      select
        offer.sort_order,
        offer.offer_key,
        jsonb_build_object(
          'offer_key', offer.offer_key,
          'offer_kind', 'pokemon_choice',
          'battle_point_price', offer.battle_point_price,
          'eligible', true,
          'choices', jsonb_agg(
            jsonb_build_object(
              'offer_key', offer.offer_key || ':' || species.species_key,
              'species_key', species.species_key,
              'level', v_level
            )
            order by species.species_key
          )
        ) as row_json
      from public.catalog_battle_shop_offer offer
      join lateral server_authority_private.battle_shop_pokemon_candidates(
        v_catalog_release_id,
        offer.offer_key,
        v_level
      ) candidate on true
      join public.catalog_species species
        on species.catalog_release_id = v_catalog_release_id
       and species.species_key = candidate.species_key
      where offer.catalog_release_id = v_catalog_release_id
        and offer.offer_kind = 'pokemon'
      group by offer.offer_key, offer.sort_order, offer.battle_point_price
    ) offers
  ), '[]'::jsonb);
end;
$$;

commit;
