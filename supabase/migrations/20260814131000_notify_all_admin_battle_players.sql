-- Admin-controlled gym and League notifications apply to every player,
-- including debug accounts. Training debug battles remain excluded by contract.

update server_authority_private.discord_admin_battle_notification
set status = 'failed',
    last_error = 'audience_filter_removed',
    updated_at = clock_timestamp()
where status = 'skipped';

create or replace function public.claim_discord_admin_battle_notification(
  p_battle_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, server_authority_private, extensions, pg_temp
as $$
declare
  v_battle_id uuid;
  v_auth_user_id uuid;
  v_contract_key text;
  v_gym_key text;
  v_league_member_index integer;
  v_username text;
  v_claimed boolean := false;
  v_row_count integer := 0;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'service role required' using errcode = '42501';
  end if;

  select battle.id, battle.auth_user_id, battle.contract_key, battle.gym_key,
         battle.league_member_index, recovery.username
  into v_battle_id, v_auth_user_id, v_contract_key, v_gym_key,
       v_league_member_index, v_username
  from public.authoritative_battle battle
  join public.player_auth_recovery recovery on recovery.auth_user_id = battle.auth_user_id
  where battle.id = p_battle_id;

  if not found then
    return jsonb_build_object('send', false, 'reason', 'battle_not_found');
  end if;

  if v_contract_key not in ('admin_gym', 'league') then
    return jsonb_build_object('send', false, 'reason', 'unsupported_contract');
  end if;

  insert into server_authority_private.discord_admin_battle_notification(
    battle_id, status, attempts, updated_at
  ) values (p_battle_id, 'sending', 1, clock_timestamp())
  on conflict (battle_id) do nothing;
  get diagnostics v_row_count = row_count;
  v_claimed := v_row_count > 0;

  if not v_claimed then
    update server_authority_private.discord_admin_battle_notification notification
    set status = 'sending',
        attempts = notification.attempts + 1,
        last_error = null,
        updated_at = clock_timestamp(),
        sent_at = null
    where notification.battle_id = p_battle_id
      and (
        notification.status = 'failed'
        or (notification.status = 'sending' and notification.updated_at < clock_timestamp() - interval '5 minutes')
      );
    get diagnostics v_row_count = row_count;
    v_claimed := v_row_count > 0;
  end if;

  if not v_claimed then
    return jsonb_build_object('send', false, 'reason', 'already_claimed');
  end if;

  return jsonb_build_object(
    'send', true,
    'battle_id', v_battle_id,
    'auth_user_id', v_auth_user_id,
    'username', v_username,
    'contract_key', v_contract_key,
    'gym_key', v_gym_key,
    'league_member_index', v_league_member_index
  );
end;
$$;

revoke all on function public.claim_discord_admin_battle_notification(uuid) from public, anon, authenticated;
grant execute on function public.claim_discord_admin_battle_notification(uuid) to service_role;
