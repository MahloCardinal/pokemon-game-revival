begin;

-- Read-only presentation of the already frozen withdrawal. Do not extend the
-- persisted options: the resolver checks their exact catalog contract.
create function public.preview_daycare_withdrawal(p_pending_resolution_id uuid)
returns jsonb
language plpgsql stable security definer
set search_path = pg_catalog
as $$
declare
  v_resolution public.player_pending_resolution%rowtype;
  v_instance public.player_pokemon_instance%rowtype;
  v_rule public.catalog_level_rule%rowtype;
  v_target integer;
  v_levels integer;
  v_moves jsonb;
  v_offers jsonb;
begin
  select resolution.* into v_resolution
  from public.player_pending_resolution resolution
  join public.player_daycare_state daycare
    on daycare.pending_resolution_id = resolution.id
    and daycare.auth_user_id = resolution.auth_user_id
    and daycare.pokemon_instance_id = resolution.pokemon_instance_id
    and daycare.status = 'withdraw_pending'
  where resolution.id = p_pending_resolution_id
    and resolution.auth_user_id = auth.uid()
    and resolution.status = 'pending'
    and resolution.options ->> 'source' = 'daycare_withdrawal';
  if not found then
    raise exception 'pending daycare resolution is unavailable' using errcode = 'P0002';
  end if;
  select * into strict v_instance from public.player_pokemon_instance
  where id = v_resolution.pokemon_instance_id and auth_user_id = auth.uid();
  v_target := (v_resolution.options ->> 'target_level')::integer;
  v_levels := (v_resolution.options ->> 'levels_gained')::integer;
  if (v_instance.state ->> 'l')::integer <> (v_resolution.options ->> 'starting_level')::integer
    or v_target <> (v_instance.state ->> 'l')::integer + v_levels then
    raise exception 'daycare preview no longer matches the frozen progression' using errcode = '40001';
  end if;
  select * into strict v_rule from public.catalog_level_rule
  where catalog_release_id = v_instance.catalog_release_id and level = v_target;

  -- Same deterministic calculations as resolve_daycare_withdrawal_before_ordinary_guard.
  select coalesce(jsonb_agg(jsonb_build_array(
    (move ->> 0)::integer,
    least((move ->> 1)::integer + 2 * v_levels, v_rule.max_power),
    least((move ->> 2)::integer + 2 * v_levels, v_rule.max_stats)
  ) order by ordinal), '[]'::jsonb) into v_moves
  from jsonb_array_elements(v_instance.state -> 'm') with ordinality as moves(move, ordinal);

  select coalesce(jsonb_agg(offer || jsonb_build_object(
    'power', least(coalesce(offered.base_power, fallback.base_power)
      + 2 * (v_target - (offer ->> 'level')::integer), v_rule.max_power),
    'stats', least(coalesce(offered.base_stats, fallback.base_stats)
      + 2 * (v_target - (offer ->> 'level')::integer), v_rule.max_stats)
  ) order by ordinal), '[]'::jsonb) into v_offers
  from jsonb_array_elements(v_resolution.options -> 'level_moves') with ordinality as offers(offer, ordinal)
  join public.catalog_level_rule fallback
    on fallback.catalog_release_id = v_instance.catalog_release_id and fallback.level = 60
  left join public.catalog_level_rule offered
    on offered.catalog_release_id = fallback.catalog_release_id and offered.level = (offer ->> 'level')::integer;
  if jsonb_array_length(v_offers) <> jsonb_array_length(v_resolution.options -> 'level_moves') then
    raise exception 'daycare move preview rules are missing' using errcode = 'P0002';
  end if;
  return jsonb_build_object('pokemon', v_instance.state || jsonb_build_object(
    'l', v_target, 'hp', least((v_instance.state ->> 'hp')::integer + 3 * v_levels, v_rule.max_hp),
    'xp', case when v_target = (v_resolution.options ->> 'level_cap')::integer then 0
      else coalesce((v_instance.state ->> 'xp')::integer, 0) end, 'm', v_moves
  ), 'level_moves', v_offers);
end;
$$;

revoke all on function public.preview_daycare_withdrawal(uuid) from public, anon;
grant execute on function public.preview_daycare_withdrawal(uuid) to authenticated;
comment on function public.preview_daycare_withdrawal(uuid) is
  'Owned pending daycare withdrawal presentation only; does not advance progression or grant moves.';

commit;
