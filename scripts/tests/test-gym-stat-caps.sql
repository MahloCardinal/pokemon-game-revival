-- Read-only checks of the published gym catalog. League caps are intentionally excluded.
begin;
set local statement_timeout = '30s';
do $$
declare v_release uuid; v_count integer; v_pokemon record; v_caps record;
begin
  select id into strict v_release from public.catalog_release where version='revival-baseline';
  select count(*) into v_count from public.catalog_opponent
  where catalog_release_id=v_release and opponent_kind='gym';
  if v_count<>8 then raise exception 'Expected eight gyms, found %',v_count; end if;
  for v_pokemon in
    select p.* from public.catalog_opponent o
    join public.catalog_opponent_pokemon p using(catalog_release_id,opponent_key)
    where o.catalog_release_id=v_release and o.opponent_kind='gym'
  loop
    select * into strict v_caps from server_authority_private.pokemon_stat_caps(v_release,
      jsonb_build_object('s',v_pokemon.species_key,'l',v_pokemon.level,
        'sh',case when coalesce((v_pokemon.rules->>'isShiny')::boolean,false) then 1 else 0 end));
    if v_pokemon.max_hp>v_caps.max_hp then
      raise exception 'Gym HP exceeds cap: %/%',v_pokemon.opponent_key,v_pokemon.slot_index;
    end if;
    if exists(select 1 from public.catalog_opponent_move m
      where m.catalog_release_id=v_release and m.opponent_key=v_pokemon.opponent_key
        and m.pokemon_slot_index=v_pokemon.slot_index
        and (m.power>v_caps.max_power or m.stats>v_caps.max_stats)) then
      raise exception 'Gym move exceeds cap: %/%',v_pokemon.opponent_key,v_pokemon.slot_index;
    end if;
  end loop;
end $$;
select 'All eight gym rosters respect HP, power and stats caps; League excluded' as result;
rollback;
