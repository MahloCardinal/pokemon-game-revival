begin;

alter table public.battle_dome_lobby
  add column invite_code text,
  add column catalog_release_id uuid references public.catalog_release(id) on delete restrict,
  add column team_snapshot jsonb;

do $backfill_lobby_codes$
declare
  v_lobby record;
  v_code text;
begin
  for v_lobby in
    select lobby.creator_auth_user_id, lobby.lobby_date
    from public.battle_dome_lobby lobby
    order by lobby.lobby_date, lobby.created_at, lobby.creator_auth_user_id
  loop
    loop
      v_code := (100000 + floor(random() * 900000))::integer::text;
      exit when not exists (
        select 1 from public.battle_dome_lobby existing
        where existing.lobby_date = v_lobby.lobby_date and existing.invite_code = v_code
      );
    end loop;
    update public.battle_dome_lobby
    set invite_code = v_code
    where creator_auth_user_id = v_lobby.creator_auth_user_id;
  end loop;
end;
$backfill_lobby_codes$;

update public.battle_dome_lobby lobby
set catalog_release_id = team.catalog_release_id,
    team_snapshot = team.team
from public.battle_dome_team team
where team.auth_user_id = lobby.creator_auth_user_id;

delete from public.battle_dome_lobby
where catalog_release_id is null
  or jsonb_typeof(team_snapshot) <> 'array'
  or jsonb_array_length(team_snapshot) not between 1 and 6;

alter table public.battle_dome_lobby
  add constraint battle_dome_lobby_code check (invite_code is null or invite_code ~ '^[0-9]{6}$'),
  add constraint battle_dome_lobby_team_snapshot check (
    team_snapshot is null or (
      jsonb_typeof(team_snapshot) = 'array'
      and jsonb_array_length(team_snapshot) between 1 and 6
      and octet_length(team_snapshot::text) <= 32768
    )
  );

create unique index battle_dome_lobby_date_code_idx
  on public.battle_dome_lobby(lobby_date, invite_code)
  where invite_code is not null;

alter table public.battle_dome_battle
  add column creator_lead_slot smallint check (creator_lead_slot is null or creator_lead_slot between 0 and 5),
  add column challenger_lead_slot smallint check (challenger_lead_slot is null or challenger_lead_slot between 0 and 5);

update public.battle_dome_battle
set creator_lead_slot = player_active_slot,
    challenger_lead_slot = npc_active_slot;

alter table public.battle_dome_battle
  drop constraint battle_dome_battle_status_check,
  drop constraint battle_dome_participant_shape;

alter table public.battle_dome_battle
  add constraint battle_dome_battle_status_check check (status in ('selecting_leads', 'active', 'needs_player_switch', 'concluded')),
  add constraint battle_dome_participant_shape check (
    jsonb_typeof(initial_participants) = 'array'
    and jsonb_array_length(initial_participants) between 2 and 12
    and octet_length(initial_participants::text) <= 131072
  );

create or replace function server_authority_private.battle_dome_battle_payload(p_battle public.battle_dome_battle)
returns jsonb
language sql
stable
security definer
set search_path = public, server_authority_private, extensions, pg_temp
as $$
  select jsonb_build_object(
    'battle_id', p_battle.id,
    'catalog_release_id', p_battle.catalog_release_id,
    'contract_key', 'battle_dome',
    'status', p_battle.status,
    'result_key', p_battle.result_key,
    'first_actor', 'player',
    'player_active_slot', p_battle.player_active_slot,
    'npc_active_slot', p_battle.npc_active_slot,
    'creator_lead_slot', p_battle.creator_lead_slot,
    'challenger_lead_slot', p_battle.challenger_lead_slot,
    'battle_version', p_battle.battle_version,
    'engine_runtime_state', case when p_battle.engine_snapshot is null then 'pending' else 'ready' end,
    'engine_version', case when p_battle.engine_snapshot is null then null else p_battle.engine_version end,
    'engine_checksum', case when p_battle.engine_snapshot is null then null else p_battle.engine_checksum end,
    'bound_engine_version', p_battle.engine_version,
    'bound_engine_checksum', p_battle.engine_checksum,
    'engine_snapshot', p_battle.engine_snapshot,
    'engine_snapshot_hash', p_battle.engine_snapshot_hash,
    'participants', p_battle.initial_participants,
    'player_items', coalesce((select jsonb_agg(jsonb_build_array(item.item_index, item.quantity) order by item.item_index)
      from public.catalog_admin_battle_item item where item.catalog_release_id = p_battle.catalog_release_id), '[]'::jsonb),
    'admin_items', coalesce((select jsonb_agg(jsonb_build_array(item.item_index, item.quantity) order by item.item_index)
      from public.catalog_admin_battle_item item where item.catalog_release_id = p_battle.catalog_release_id), '[]'::jsonb),
    'waiting_for', p_battle.waiting_for,
    'creator_auth_user_id', p_battle.creator_auth_user_id,
    'challenger_auth_user_id', p_battle.challenger_auth_user_id,
    'creator_username', p_battle.creator_username,
    'challenger_username', p_battle.challenger_username,
    'creator_exited', p_battle.creator_exited,
    'challenger_exited', p_battle.challenger_exited,
    'created_at', p_battle.created_at
  )
$$;

create or replace function public.save_edge_battle_dome_team(p_auth_user_id uuid, p_team jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, server_authority_private, extensions, pg_temp
as $$
declare
  v_catalog uuid;
  v_team jsonb;
  v_previous jsonb;
  v_revision bigint;
begin
  if coalesce(auth.role(), '') <> 'service_role' then raise exception 'service role required' using errcode = '42501'; end if;
  select catalog_release_id into strict v_catalog from public.player_profile_state where auth_user_id = p_auth_user_id;
  v_team := server_authority_private.battle_dome_validate_team(v_catalog, p_team, false);
  select team into v_previous from public.battle_dome_team where auth_user_id = p_auth_user_id for update;
  if found and v_previous = v_team then
    select revision into v_revision from public.battle_dome_team where auth_user_id = p_auth_user_id;
  else
    insert into public.battle_dome_team(auth_user_id, catalog_release_id, team)
    values(p_auth_user_id, v_catalog, v_team)
    on conflict(auth_user_id) do update set catalog_release_id = excluded.catalog_release_id,
      team = excluded.team, revision = public.battle_dome_team.revision + 1, updated_at = now()
    returning revision into v_revision;
  end if;
  return jsonb_build_object('ok', true, 'team', v_team, 'team_revision', v_revision);
end;
$$;

create or replace function public.create_edge_battle_dome_lobby(p_auth_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, server_authority_private, extensions, pg_temp
as $$
declare
  v_team public.battle_dome_team%rowtype;
  v_today date := server_authority_private.battle_dome_today();
  v_code text;
  v_legacy_token text;
  v_attempt integer;
begin
  if coalesce(auth.role(), '') <> 'service_role' then raise exception 'service role required' using errcode = '42501'; end if;
  if server_authority_private.battle_dome_active_count(p_auth_user_id) >= 2 then
    raise exception 'battle dome active challenge limit reached' using errcode = '23514';
  end if;
  select * into strict v_team from public.battle_dome_team where auth_user_id = p_auth_user_id for update;
  v_team.team := server_authority_private.battle_dome_validate_team(v_team.catalog_release_id, v_team.team, false);
  if jsonb_array_length(v_team.team) < 1 then
    raise exception 'battle dome team must contain at least one Pokemon' using errcode = '22023';
  end if;
  for v_attempt in 1..100 loop
    v_code := (100000 + floor(random() * 900000))::integer::text;
    v_legacy_token := encode(gen_random_bytes(24), 'hex');
    begin
      insert into public.battle_dome_lobby(
        creator_auth_user_id, invite_token, invite_token_hash, invite_code, lobby_date,
        catalog_release_id, team_snapshot
      ) values (
        p_auth_user_id, v_legacy_token, encode(digest(convert_to(v_legacy_token, 'UTF8'), 'sha256'), 'hex'),
        v_code, v_today, v_team.catalog_release_id, v_team.team
      )
      on conflict(creator_auth_user_id) do update set
        invite_token = excluded.invite_token,
        invite_token_hash = excluded.invite_token_hash,
        invite_code = excluded.invite_code,
        lobby_date = excluded.lobby_date,
        catalog_release_id = excluded.catalog_release_id,
        team_snapshot = excluded.team_snapshot,
        created_at = now();
      return jsonb_build_object('ok', true, 'invite_code', v_code, 'lobby_date', v_today);
    exception when unique_violation then
      null;
    end;
  end loop;
  raise exception 'battle dome invite code is unavailable' using errcode = '54000';
end;
$$;

create or replace function public.join_edge_battle_dome_lobby_by_code(
  p_auth_user_id uuid,
  p_creator_auth_user_id uuid,
  p_invite_code text,
  p_engine_version text,
  p_engine_checksum text
)
returns jsonb
language plpgsql
security definer
set search_path = public, server_authority_private, extensions, pg_temp
as $$
declare
  v_lobby public.battle_dome_lobby%rowtype;
  v_challenger_team public.battle_dome_team%rowtype;
  v_creator_name text;
  v_challenger_name text;
  v_battle public.battle_dome_battle%rowtype;
  v_participants jsonb;
begin
  if coalesce(auth.role(), '') <> 'service_role' then raise exception 'service role required' using errcode = '42501'; end if;
  if p_creator_auth_user_id is null and (p_invite_code is null or p_invite_code !~ '^[0-9]{6}$') then
    raise exception 'battle dome lobby selector is required' using errcode = '22023';
  end if;
  select * into v_lobby from public.battle_dome_lobby lobby
  where lobby.lobby_date = server_authority_private.battle_dome_today()
    and lobby.invite_code is not null
    and lobby.catalog_release_id is not null
    and lobby.team_snapshot is not null
    and ((p_creator_auth_user_id is not null and lobby.creator_auth_user_id = p_creator_auth_user_id)
      or (p_creator_auth_user_id is null and lobby.invite_code = p_invite_code))
  for update;
  if not found then raise exception 'battle dome lobby is unavailable' using errcode = 'P0002'; end if;
  if v_lobby.creator_auth_user_id = p_auth_user_id then raise exception 'a player cannot challenge themselves' using errcode = '22023'; end if;
  perform pg_advisory_xact_lock(hashtextextended(least(v_lobby.creator_auth_user_id::text, p_auth_user_id::text), 0));
  perform pg_advisory_xact_lock(hashtextextended(greatest(v_lobby.creator_auth_user_id::text, p_auth_user_id::text), 0));
  if server_authority_private.battle_dome_active_count(v_lobby.creator_auth_user_id) >= 2
    or server_authority_private.battle_dome_active_count(p_auth_user_id) >= 2 then
    raise exception 'battle dome active challenge limit reached' using errcode = '23514';
  end if;
  select * into strict v_challenger_team from public.battle_dome_team where auth_user_id = p_auth_user_id for update;
  v_challenger_team.team := server_authority_private.battle_dome_validate_team(
    v_challenger_team.catalog_release_id, v_challenger_team.team, false
  );
  if jsonb_array_length(v_challenger_team.team) < 1 then
    raise exception 'battle dome team must contain at least one Pokemon' using errcode = '22023';
  end if;
  if v_lobby.catalog_release_id <> v_challenger_team.catalog_release_id then
    raise exception 'battle dome teams use different catalogs' using errcode = '0A000';
  end if;
  perform server_authority_private.battle_dome_validate_team(v_lobby.catalog_release_id, v_lobby.team_snapshot, false);
  if not exists(select 1 from public.catalog_engine_runtime_binding binding
    where binding.catalog_release_id = v_lobby.catalog_release_id and binding.engine_version = p_engine_version
      and binding.engine_checksum = p_engine_checksum and binding.enabled) then
    raise exception 'battle dome runtime binding is unavailable' using errcode = '0A000';
  end if;
  select username into strict v_creator_name from public.player_auth_recovery where auth_user_id = v_lobby.creator_auth_user_id;
  select username into strict v_challenger_name from public.player_auth_recovery where auth_user_id = p_auth_user_id;
  v_participants := server_authority_private.battle_dome_build_participants(v_lobby.catalog_release_id, v_lobby.team_snapshot, 'player')
    || server_authority_private.battle_dome_build_participants(v_lobby.catalog_release_id, v_challenger_team.team, 'npc');
  insert into public.battle_dome_battle(
    creator_auth_user_id, challenger_auth_user_id, catalog_release_id, creator_username, challenger_username,
    status, waiting_for, engine_version, engine_checksum, initial_participants,
    creator_lead_slot, challenger_lead_slot
  ) values (
    v_lobby.creator_auth_user_id, p_auth_user_id, v_lobby.catalog_release_id, v_creator_name, v_challenger_name,
    'selecting_leads', 'creator', p_engine_version, p_engine_checksum, v_participants,
    null, null
  ) returning * into v_battle;
  delete from public.battle_dome_lobby where creator_auth_user_id = v_lobby.creator_auth_user_id;
  if server_authority_private.battle_dome_active_count(p_auth_user_id) >= 2 then
    delete from public.battle_dome_lobby where creator_auth_user_id = p_auth_user_id;
  end if;
  return jsonb_build_object('ok', true, 'battle', server_authority_private.battle_dome_battle_payload(v_battle));
end;
$$;

create or replace function public.choose_edge_battle_dome_lead(
  p_auth_user_id uuid,
  p_command_id uuid,
  p_command_hash text,
  p_battle_id uuid,
  p_expected_battle_version bigint,
  p_team_slot smallint
)
returns jsonb
language plpgsql
security definer
set search_path = public, server_authority_private, extensions, pg_temp
as $$
declare
  v_battle public.battle_dome_battle%rowtype;
  v_receipt public.battle_dome_command_receipt%rowtype;
  v_role text;
  v_result jsonb;
begin
  if coalesce(auth.role(), '') <> 'service_role' then raise exception 'service role required' using errcode = '42501'; end if;
  select * into v_receipt from public.battle_dome_command_receipt
  where auth_user_id = p_auth_user_id and command_id = p_command_id;
  if found then
    if v_receipt.command_type <> 'lead_choice' or v_receipt.command_hash <> p_command_hash then
      raise exception 'command id was already used with another payload' using errcode = '22023';
    end if;
    return v_receipt.result;
  end if;
  select * into v_battle from public.battle_dome_battle where id = p_battle_id for update;
  if not found then raise exception 'battle dome challenge was not found' using errcode = 'P0002'; end if;
  v_role := case when v_battle.creator_auth_user_id = p_auth_user_id then 'creator'
    when v_battle.challenger_auth_user_id = p_auth_user_id then 'challenger' else null end;
  if v_role is null then raise exception 'battle dome participant required' using errcode = '42501'; end if;
  if v_battle.status <> 'selecting_leads' or v_battle.engine_snapshot is not null
    or v_battle.battle_version <> p_expected_battle_version then
    raise exception 'battle dome challenge changed' using errcode = '40001';
  end if;
  if v_role = 'creator' then
    if v_battle.waiting_for <> 'creator' or v_battle.creator_lead_slot is not null then
      raise exception 'battle dome challenge is waiting for the other player' using errcode = '40001';
    end if;
    if not exists(select 1 from jsonb_array_elements(v_battle.initial_participants) participant
      where participant ->> 'side' = 'player'
        and server_authority_private.edge_jsonb_bigint(participant -> 'slot_index') = p_team_slot) then
      raise exception 'battle dome lead choice is invalid' using errcode = '22023';
    end if;
    update public.battle_dome_battle set
      creator_lead_slot = p_team_slot,
      player_active_slot = p_team_slot,
      waiting_for = 'challenger',
      battle_version = battle_version + 1,
      updated_at = now()
    where id = p_battle_id returning * into v_battle;
  else
    if v_battle.waiting_for <> 'challenger' or v_battle.creator_lead_slot is null
      or v_battle.challenger_lead_slot is not null then
      raise exception 'battle dome challenge is waiting for the other player' using errcode = '40001';
    end if;
    if not exists(select 1 from jsonb_array_elements(v_battle.initial_participants) participant
      where participant ->> 'side' = 'npc'
        and server_authority_private.edge_jsonb_bigint(participant -> 'slot_index') = p_team_slot) then
      raise exception 'battle dome lead choice is invalid' using errcode = '22023';
    end if;
    update public.battle_dome_battle set
      challenger_lead_slot = p_team_slot,
      npc_active_slot = p_team_slot,
      waiting_for = 'creator',
      battle_version = battle_version + 1,
      updated_at = now()
    where id = p_battle_id returning * into v_battle;
  end if;
  v_result := jsonb_build_object('ok', true, 'viewer_role', v_role,
    'battle', server_authority_private.battle_dome_battle_payload(v_battle), 'events', '[]'::jsonb);
  insert into public.battle_dome_command_receipt(auth_user_id, command_id, battle_id, command_type, command_hash, result)
  values(p_auth_user_id, p_command_id, p_battle_id, 'lead_choice', p_command_hash, v_result);
  return v_result;
end;
$$;

create or replace function public.read_edge_battle_dome_state(p_auth_user_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, server_authority_private, extensions, pg_temp
as $$
declare
  v_team public.battle_dome_team%rowtype;
  v_lobby public.battle_dome_lobby%rowtype;
  v_today date := server_authority_private.battle_dome_today();
begin
  if coalesce(auth.role(), '') <> 'service_role' then raise exception 'service role required' using errcode = '42501'; end if;
  select * into v_team from public.battle_dome_team where auth_user_id = p_auth_user_id;
  select * into v_lobby from public.battle_dome_lobby where creator_auth_user_id = p_auth_user_id;
  return jsonb_build_object(
    'ok', true,
    'team', coalesce(v_team.team, '[]'::jsonb),
    'team_revision', coalesce(v_team.revision, 0),
    'lobby', case when v_lobby.creator_auth_user_id is null then null else jsonb_build_object(
      'invite_token', case when v_lobby.lobby_date = v_today then v_lobby.invite_token else null end,
      'invite_code', case when v_lobby.lobby_date = v_today then v_lobby.invite_code else null end,
      'lobby_date', v_lobby.lobby_date,
      'created_at', v_lobby.created_at,
      'expired', v_lobby.lobby_date <> v_today
    ) end,
    'lobbies', coalesce((select jsonb_agg(jsonb_build_object(
      'creator_auth_user_id', lobby.creator_auth_user_id, 'username', recovery.username,
      'own', lobby.creator_auth_user_id = p_auth_user_id, 'created_at', lobby.created_at
    ) order by lobby.created_at)
      from public.battle_dome_lobby lobby
      join public.player_auth_recovery recovery on recovery.auth_user_id = lobby.creator_auth_user_id
      where lobby.lobby_date = v_today
        and lobby.invite_code is not null
        and lobby.team_snapshot is not null
        and server_authority_private.battle_dome_active_count(lobby.creator_auth_user_id) < 2), '[]'::jsonb),
    'battles', coalesce((select jsonb_agg(jsonb_build_object(
      'battle_id', battle.id,
      'creator_username', battle.creator_username,
      'challenger_username', battle.challenger_username,
      'status', battle.status,
      'own_role', case when battle.creator_auth_user_id = p_auth_user_id and not battle.creator_exited then 'creator'
        when battle.challenger_auth_user_id = p_auth_user_id and not battle.challenger_exited then 'challenger' else 'spectator' end,
      'created_at', battle.created_at
    ) order by battle.created_at desc) from public.battle_dome_battle battle
      where battle.engine_snapshot is not null
        or battle.creator_auth_user_id = p_auth_user_id
        or battle.challenger_auth_user_id = p_auth_user_id), '[]'::jsonb)
  );
end;
$$;

revoke all on function public.create_edge_battle_dome_lobby(uuid) from public, anon, authenticated;
revoke all on function public.join_edge_battle_dome_lobby_by_code(uuid, uuid, text, text, text) from public, anon, authenticated;
revoke all on function public.choose_edge_battle_dome_lead(uuid, uuid, text, uuid, bigint, smallint) from public, anon, authenticated;
grant execute on function public.create_edge_battle_dome_lobby(uuid) to service_role;
grant execute on function public.join_edge_battle_dome_lobby_by_code(uuid, uuid, text, text, text) to service_role;
grant execute on function public.choose_edge_battle_dome_lead(uuid, uuid, text, uuid, bigint, smallint) to service_role;

commit;
