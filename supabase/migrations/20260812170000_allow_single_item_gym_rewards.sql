-- Gym rewards now contain money, one item stack and the badge.  Keep the
-- authoritative grant compatible with that catalog shape for both regular and
-- admin-controlled gyms.

create or replace function server_authority_private.award_terminal_gym_victory_core(
  p_auth_user_id uuid,
  p_battle_id uuid,
  p_command_id uuid,
  p_contract_key text
)
returns jsonb
language plpgsql
security definer
set search_path = public, server_authority_private, extensions, pg_temp
as $$
declare
  v_battle public.authoritative_battle%rowtype;
  v_profile public.player_profile_state%rowtype;
  v_opponent public.catalog_opponent%rowtype;
  v_existing public.player_gym_victory%rowtype;
  v_reward jsonb;
  v_items jsonb;
  v_item record;
  v_money bigint;
  v_badge_index integer;
  v_revision bigint;
  v_hash text;
  v_result jsonb;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'service role required' using errcode = '42501';
  end if;

  select * into strict v_battle from public.authoritative_battle
    where id = p_battle_id and auth_user_id = p_auth_user_id for update;
  if v_battle.contract_key <> p_contract_key or v_battle.status <> 'concluded'
    or v_battle.result_key <> 'player_win_no_reward' then
    return null;
  end if;

  select * into v_existing from public.player_gym_victory where battle_id = p_battle_id;
  if found then
    return jsonb_build_object('gym_reward', v_existing.reward,
      'player_state', server_authority_private.player_state_projection(p_auth_user_id));
  end if;

  select * into strict v_opponent from public.catalog_opponent
    where catalog_release_id = v_battle.catalog_release_id
      and opponent_key = 'gym_' || v_battle.gym_key for share;
  select * into strict v_profile from public.player_profile_state
    where auth_user_id = p_auth_user_id for update;
  if v_opponent.opponent_kind <> 'gym' or v_opponent.badge_index <> v_profile.badges then
    raise exception 'gym victory no longer matches canonical badge progression' using errcode = '40001';
  end if;

  if (select count(*) from public.catalog_opponent_reward
      where catalog_release_id = v_battle.catalog_release_id and opponent_key = v_opponent.opponent_key) <> 3
    or (select count(*) from public.catalog_opponent_reward
      where catalog_release_id = v_battle.catalog_release_id and opponent_key = v_opponent.opponent_key
        and reward_kind = 'money' and quantity > 0 and item_index is null) <> 1
    or (select count(*) from public.catalog_opponent_reward
      where catalog_release_id = v_battle.catalog_release_id and opponent_key = v_opponent.opponent_key
        and reward_kind = 'item' and quantity > 0 and item_index is not null) <> 1
    or (select count(*) from public.catalog_opponent_reward
      where catalog_release_id = v_battle.catalog_release_id and opponent_key = v_opponent.opponent_key
        and reward_kind = 'badge' and quantity = 1 and item_index is null
        and (rules ->> 'badgeIndex')::integer = v_opponent.badge_index) <> 1 then
    raise exception 'canonical gym reward shape is unsupported' using errcode = '0A000';
  end if;

  select quantity::bigint into strict v_money from public.catalog_opponent_reward
    where catalog_release_id = v_battle.catalog_release_id and opponent_key = v_opponent.opponent_key
      and reward_kind = 'money';
  v_badge_index := v_opponent.badge_index;
  select jsonb_agg(jsonb_build_object('itemIndex', item_index, 'quantity', quantity)
    order by reward_order) into v_items from public.catalog_opponent_reward
    where catalog_release_id = v_battle.catalog_release_id and opponent_key = v_opponent.opponent_key
      and reward_kind = 'item';
  v_reward := jsonb_build_object('rewardKind', 'gym', 'gymKey', v_battle.gym_key,
    'opponentKey', v_opponent.opponent_key, 'badgeIndex', v_badge_index,
    'money', v_money, 'items', coalesce(v_items, '[]'::jsonb), 'already', false);

  update public.player_profile_state set pokedollars = pokedollars + v_money,
    badges = badges + 1, updated_at = now() where auth_user_id = p_auth_user_id;
  for v_item in select item_index, quantity from public.catalog_opponent_reward
    where catalog_release_id = v_battle.catalog_release_id and opponent_key = v_opponent.opponent_key
      and reward_kind = 'item' order by reward_order
  loop
    insert into public.player_inventory_item(auth_user_id, catalog_release_id, item_index, quantity, updated_at)
    values(p_auth_user_id, v_battle.catalog_release_id, v_item.item_index, v_item.quantity, now())
    on conflict (auth_user_id, item_index) do update
      set quantity = public.player_inventory_item.quantity + excluded.quantity, updated_at = now();
  end loop;

  insert into public.player_gym_victory(auth_user_id, opponent_key, battle_id,
    catalog_release_id, badge_index, terminal_command_id, reward)
  values(p_auth_user_id, v_opponent.opponent_key, p_battle_id,
    v_battle.catalog_release_id, v_badge_index, p_command_id, v_reward);
  update public.player_state_revision set revision = revision + 1, updated_at = now()
    where auth_user_id = p_auth_user_id returning revision into v_revision;
  v_result := server_authority_private.player_state_projection(p_auth_user_id)
    || jsonb_build_object('command_id', p_command_id, 'command_type', 'gym_terminal_reward',
      'battle_id', p_battle_id, 'gym_reward', v_reward);
  v_hash := encode(digest(convert_to(jsonb_build_object('battle_id', p_battle_id,
    'result_key', v_battle.result_key, 'opponent_key', v_opponent.opponent_key)::text, 'UTF8'), 'sha256'), 'hex');
  insert into public.player_command_receipt(auth_user_id, command_id, command_type,
    request_hash, result, resulting_revision)
  values(p_auth_user_id, p_command_id, 'gym_terminal_reward', v_hash, v_result, v_revision);
  perform server_authority_private.authoritative_battle_append_event(p_battle_id, 'gym_reward_awarded',
    v_reward, null, '[]'::jsonb);
  v_result := jsonb_build_object('gym_reward', v_reward,
    'player_state', server_authority_private.player_state_projection(p_auth_user_id));
  update public.player_command_receipt set result = result || v_result
    where auth_user_id = p_auth_user_id and command_id = p_command_id;
  return v_result;
end;
$$;

create or replace function server_authority_private.award_terminal_gym_victory(
  p_auth_user_id uuid,
  p_battle_id uuid,
  p_command_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, server_authority_private, extensions, pg_temp
as $$
begin
  return server_authority_private.award_terminal_gym_victory_core(
    p_auth_user_id, p_battle_id, p_command_id, 'gym'
  );
end;
$$;

create or replace function server_authority_private.award_terminal_admin_gym_victory(
  p_auth_user_id uuid,
  p_battle_id uuid,
  p_command_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, server_authority_private, extensions, pg_temp
as $$
begin
  return server_authority_private.award_terminal_gym_victory_core(
    p_auth_user_id, p_battle_id, p_command_id, 'admin_gym'
  );
end;
$$;

revoke all on function server_authority_private.award_terminal_gym_victory_core(uuid, uuid, uuid, text)
  from public, anon, authenticated;
