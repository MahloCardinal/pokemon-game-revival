-- Notify Discord whenever a player hands an admin-controlled battle back to an administrator.
-- One private receipt per canonical battle version keeps retries idempotent.

create table server_authority_private.discord_admin_battle_turn_notification (
  battle_id uuid not null references public.authoritative_battle(id) on delete cascade,
  battle_version bigint not null check (battle_version > 0),
  status text not null check (status in ('sending', 'sent', 'failed')),
  attempts integer not null default 0 check (attempts >= 0),
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  sent_at timestamptz,
  primary key (battle_id, battle_version),
  constraint discord_admin_battle_turn_notification_sent_check check (
    (status = 'sent' and sent_at is not null) or (status <> 'sent' and sent_at is null)
  )
);

revoke all on table server_authority_private.discord_admin_battle_turn_notification from public, anon, authenticated;
grant select, insert, update, delete on table server_authority_private.discord_admin_battle_turn_notification to service_role;

create function public.claim_discord_admin_battle_turn_notification(
  p_battle_id uuid,
  p_battle_version bigint
)
returns jsonb
language plpgsql
security definer
set search_path = public, server_authority_private, extensions, pg_temp
as $$
declare
  v_battle public.authoritative_battle%rowtype;
  v_username text;
  v_claimed boolean := false;
  v_row_count integer := 0;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'service role required' using errcode = '42501';
  end if;

  select battle.*
  into v_battle
  from public.authoritative_battle battle
  where battle.id = p_battle_id;

  if not found then
    return jsonb_build_object('send', false, 'reason', 'battle_not_found');
  end if;

  if v_battle.battle_version <> p_battle_version then
    return jsonb_build_object('send', false, 'reason', 'battle_version_changed');
  end if;

  if v_battle.contract_key not in ('admin_gym', 'league')
     or v_battle.status not in ('active', 'needs_player_switch')
     or v_battle.waiting_for <> 'admin' then
    return jsonb_build_object('send', false, 'reason', 'admin_turn_not_ready');
  end if;

  select recovery.username
  into v_username
  from public.player_auth_recovery recovery
  where recovery.auth_user_id = v_battle.auth_user_id;

  insert into server_authority_private.discord_admin_battle_turn_notification(
    battle_id, battle_version, status, attempts, updated_at
  ) values (p_battle_id, p_battle_version, 'sending', 1, clock_timestamp())
  on conflict (battle_id, battle_version) do nothing;
  get diagnostics v_row_count = row_count;
  v_claimed := v_row_count > 0;

  if not v_claimed then
    update server_authority_private.discord_admin_battle_turn_notification notification
    set status = 'sending',
        attempts = notification.attempts + 1,
        last_error = null,
        updated_at = clock_timestamp(),
        sent_at = null
    where notification.battle_id = p_battle_id
      and notification.battle_version = p_battle_version
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
    'battle_id', v_battle.id,
    'battle_version', v_battle.battle_version,
    'auth_user_id', v_battle.auth_user_id,
    'username', coalesce(nullif(v_username, ''), 'Giocatore'),
    'contract_key', v_battle.contract_key,
    'gym_key', v_battle.gym_key,
    'league_member_index', v_battle.league_member_index
  );
end;
$$;

revoke all on function public.claim_discord_admin_battle_turn_notification(uuid, bigint) from public, anon, authenticated;
grant execute on function public.claim_discord_admin_battle_turn_notification(uuid, bigint) to service_role;

create function public.complete_discord_admin_battle_turn_notification(
  p_battle_id uuid,
  p_battle_version bigint,
  p_success boolean,
  p_error text default null
)
returns void
language plpgsql
security definer
set search_path = public, server_authority_private, extensions, pg_temp
as $$
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'service role required' using errcode = '42501';
  end if;

  update server_authority_private.discord_admin_battle_turn_notification
  set status = case when p_success then 'sent' else 'failed' end,
      last_error = case when p_success then null else left(coalesce(nullif(p_error, ''), 'delivery_failed'), 500) end,
      sent_at = case when p_success then clock_timestamp() else null end,
      updated_at = clock_timestamp()
  where battle_id = p_battle_id
    and battle_version = p_battle_version
    and status = 'sending';
end;
$$;

revoke all on function public.complete_discord_admin_battle_turn_notification(uuid, bigint, boolean, text) from public, anon, authenticated;
grant execute on function public.complete_discord_admin_battle_turn_notification(uuid, bigint, boolean, text) to service_role;
