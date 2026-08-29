begin;

create table public.battle_dome_team (
  auth_user_id uuid primary key references auth.users(id) on delete cascade,
  catalog_release_id uuid not null references public.catalog_release(id) on delete restrict,
  team jsonb not null default '[]'::jsonb,
  revision bigint not null default 1 check (revision > 0),
  updated_at timestamptz not null default now(),
  constraint battle_dome_team_shape check (
    jsonb_typeof(team) = 'array'
    and jsonb_array_length(team) between 0 and 6
    and octet_length(team::text) <= 32768
  )
);

create table public.battle_dome_lobby (
  creator_auth_user_id uuid primary key references auth.users(id) on delete cascade,
  invite_token text not null,
  invite_token_hash text not null unique,
  lobby_date date not null,
  created_at timestamptz not null default now(),
  constraint battle_dome_lobby_token check (invite_token ~ '^[A-Za-z0-9_-]{32,160}$'),
  constraint battle_dome_lobby_token_hash check (invite_token_hash ~ '^[0-9a-f]{64}$')
);

create table public.battle_dome_battle (
  id uuid primary key default gen_random_uuid(),
  creator_auth_user_id uuid not null references auth.users(id) on delete cascade,
  challenger_auth_user_id uuid not null references auth.users(id) on delete cascade,
  catalog_release_id uuid not null references public.catalog_release(id) on delete restrict,
  creator_username text not null,
  challenger_username text not null,
  status text not null default 'active' check (status in ('active', 'needs_player_switch', 'concluded')),
  result_key text check (result_key is null or result_key in ('player_win_no_reward', 'player_loss_no_reward')),
  waiting_for text check (waiting_for is null or waiting_for in ('creator', 'challenger')),
  player_active_slot smallint not null default 0 check (player_active_slot between 0 and 5),
  npc_active_slot smallint not null default 0 check (npc_active_slot between 0 and 5),
  battle_version bigint not null default 1 check (battle_version > 0),
  engine_version text not null,
  engine_checksum text not null check (engine_checksum ~ '^[0-9a-f]{64}$'),
  engine_snapshot jsonb,
  engine_snapshot_hash text check (engine_snapshot_hash is null or engine_snapshot_hash ~ '^[0-9a-f]{64}$'),
  initial_participants jsonb not null,
  creator_exited boolean not null default false,
  challenger_exited boolean not null default false,
  next_event_seq bigint not null default 1 check (next_event_seq > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  concluded_at timestamptz,
  constraint battle_dome_distinct_players check (creator_auth_user_id <> challenger_auth_user_id),
  constraint battle_dome_participant_shape check (
    jsonb_typeof(initial_participants) = 'array'
    and jsonb_array_length(initial_participants) = 12
    and octet_length(initial_participants::text) <= 131072
  ),
  constraint battle_dome_terminal_shape check (
    (status = 'concluded') = (result_key is not null and concluded_at is not null and waiting_for is null)
  ),
  constraint battle_dome_snapshot_shape check (
    (engine_snapshot is null and engine_snapshot_hash is null)
    or (jsonb_typeof(engine_snapshot) = 'object' and engine_snapshot_hash is not null and octet_length(engine_snapshot::text) <= 524288)
  )
);

create index battle_dome_battle_creator_active_idx
  on public.battle_dome_battle(creator_auth_user_id, created_at desc);
create index battle_dome_battle_challenger_active_idx
  on public.battle_dome_battle(challenger_auth_user_id, created_at desc);

create table public.battle_dome_event (
  battle_id uuid not null references public.battle_dome_battle(id) on delete cascade,
  seq bigint not null check (seq > 0),
  event_type text not null,
  event_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  primary key (battle_id, seq),
  constraint battle_dome_event_shape check (jsonb_typeof(event_data) = 'object' and octet_length(event_data::text) <= 65536)
);

create table public.battle_dome_command_receipt (
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  command_id uuid not null,
  battle_id uuid references public.battle_dome_battle(id) on delete cascade,
  command_type text not null,
  command_hash text not null check (command_hash ~ '^[0-9a-f]{64}$'),
  result jsonb not null,
  created_at timestamptz not null default now(),
  primary key (auth_user_id, command_id),
  constraint battle_dome_receipt_shape check (jsonb_typeof(result) = 'object' and octet_length(result::text) <= 1048576)
);

alter table public.battle_dome_team enable row level security;
alter table public.battle_dome_lobby enable row level security;
alter table public.battle_dome_battle enable row level security;
alter table public.battle_dome_event enable row level security;
alter table public.battle_dome_command_receipt enable row level security;

revoke all on public.battle_dome_team from anon, authenticated;
revoke all on public.battle_dome_lobby from anon, authenticated;
revoke all on public.battle_dome_battle from anon, authenticated;
revoke all on public.battle_dome_event from anon, authenticated;
revoke all on public.battle_dome_command_receipt from anon, authenticated;

create or replace function server_authority_private.battle_dome_today()
returns date language sql stable as $$
  select (now() at time zone 'Europe/Rome')::date
$$;

create or replace function server_authority_private.battle_dome_validate_team(
  p_catalog_release_id uuid,
  p_team jsonb,
  p_require_complete boolean default false
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, server_authority_private, extensions, pg_temp
as $$
declare
  v_entry jsonb;
  v_moves jsonb;
  v_move jsonb;
  v_species_key text;
  v_item_index integer;
  v_move_index integer;
  v_normalized jsonb := '[]'::jsonb;
  v_species_counts jsonb := '{}'::jsonb;
  v_item_counts jsonb := '{}'::jsonb;
  v_port_count integer := 0;
  v_port_distinct integer := 0;
  v_count integer;
begin
  if p_catalog_release_id is null or jsonb_typeof(p_team) <> 'array' then
    raise exception 'battle dome team is invalid' using errcode = '22023';
  end if;
  v_count := jsonb_array_length(p_team);
  if v_count > 6 or (p_require_complete and v_count <> 6) then
    raise exception 'battle dome team must contain exactly six Pokemon' using errcode = '22023';
  end if;

  for v_entry in select value from jsonb_array_elements(p_team) loop
    if jsonb_typeof(v_entry) <> 'object'
      or not (v_entry ? 'species_key') or not (v_entry ? 'moves') or not (v_entry ? 'held_item_index') then
      raise exception 'battle dome Pokemon is invalid' using errcode = '22023';
    end if;
    v_species_key := v_entry ->> 'species_key';
    v_item_index := server_authority_private.edge_jsonb_bigint(v_entry -> 'held_item_index');
    v_moves := v_entry -> 'moves';
    if v_species_key is null or v_species_key !~ '^[A-Za-z0-9_-]{1,80}$'
      or v_item_index is null or v_item_index < 0
      or jsonb_typeof(v_moves) <> 'array' or jsonb_array_length(v_moves) not between 1 and 4 then
      raise exception 'battle dome Pokemon fields are invalid' using errcode = '22023';
    end if;
    if not exists (
      select 1 from public.catalog_species species
      where species.catalog_release_id = p_catalog_release_id
        and species.species_key = v_species_key
        and coalesce(species.encounter_rarity_key, '') <> 'legendary'
    ) then
      raise exception 'battle dome species is unavailable' using errcode = '22023';
    end if;
    if v_item_index > 0 and not exists (
      select 1 from public.catalog_item item
      where item.catalog_release_id = p_catalog_release_id
        and item.item_index = v_item_index
        and item.category_key in ('held_item', 'berry')
    ) then
      raise exception 'battle dome held item is unavailable' using errcode = '22023';
    end if;
    if (v_species_counts ->> v_species_key)::integer is not null then
      v_species_counts := jsonb_set(v_species_counts, array[v_species_key],
        to_jsonb((v_species_counts ->> v_species_key)::integer + 1), true);
    else
      v_species_counts := jsonb_set(v_species_counts, array[v_species_key], '1'::jsonb, true);
    end if;
    if (v_species_counts ->> v_species_key)::integer > 2 then
      raise exception 'battle dome species duplicate limit exceeded' using errcode = '22023';
    end if;
    if v_item_index > 0 then
      if v_item_counts ? v_item_index::text then
        v_item_counts := jsonb_set(v_item_counts, array[v_item_index::text],
          to_jsonb((v_item_counts ->> v_item_index::text)::integer + 1), true);
      else
        v_item_counts := jsonb_set(v_item_counts, array[v_item_index::text], '1'::jsonb, true);
      end if;
      if (v_item_counts ->> v_item_index::text)::integer > 2 then
        raise exception 'battle dome held item duplicate limit exceeded' using errcode = '22023';
      end if;
    end if;

    if (select count(distinct server_authority_private.edge_jsonb_bigint(value))
      from jsonb_array_elements(v_moves)) <> jsonb_array_length(v_moves) then
      raise exception 'battle dome moves must be distinct' using errcode = '22023';
    end if;
    for v_move in select value from jsonb_array_elements(v_moves) loop
      v_move_index := server_authority_private.edge_jsonb_bigint(v_move);
      if v_move_index is null or v_move_index <= 0 or not exists (
        select 1 from public.catalog_move move
        where move.catalog_release_id = p_catalog_release_id and move.move_index = v_move_index
      ) or not exists (
        select 1 from public.catalog_species_level_move learned
        where learned.catalog_release_id = p_catalog_release_id
          and learned.species_key = v_species_key and learned.move_index = v_move_index
          and learned.level between 5 and 100
        union all
        select 1 from public.catalog_species_machine_move machine
        where machine.catalog_release_id = p_catalog_release_id
          and machine.species_key = v_species_key and machine.move_index = v_move_index
      ) then
        raise exception 'battle dome move is unavailable for this species' using errcode = '22023';
      end if;
    end loop;
    v_normalized := v_normalized || jsonb_build_array(jsonb_build_object(
      'species_key', v_species_key,
      'held_item_index', v_item_index,
      'moves', (select jsonb_agg(server_authority_private.edge_jsonb_bigint(value)) from jsonb_array_elements(v_moves))
    ));
  end loop;

  select coalesce(sum(quantity), 0), count(distinct item_index)
  into v_port_count, v_port_distinct
  from (
    select (key)::integer item_index, (value #>> '{}')::integer quantity
    from jsonb_each(v_item_counts)
  ) held
  where item_index in (229, 234, 237, 238);
  if v_port_count > 2 or v_port_count <> v_port_distinct then
    raise exception 'battle dome Port item limit exceeded' using errcode = '22023';
  end if;
  return v_normalized;
end;
$$;

create or replace function server_authority_private.battle_dome_active_count(p_auth_user_id uuid)
returns integer language sql stable security definer
set search_path = public, server_authority_private, extensions, pg_temp
as $$
  select count(*)::integer from public.battle_dome_battle battle
  where (battle.creator_auth_user_id = p_auth_user_id and not battle.creator_exited)
    or (battle.challenger_auth_user_id = p_auth_user_id and not battle.challenger_exited)
$$;

create or replace function server_authority_private.battle_dome_build_participants(
  p_catalog_release_id uuid,
  p_team jsonb,
  p_side text
)
returns jsonb
language sql
stable
security definer
set search_path = public, server_authority_private, extensions, pg_temp
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'side', p_side,
    'slot_index', roster.ordinality - 1,
    'pokemon_instance_id', null,
    'species_key', roster.entry ->> 'species_key',
    'display_name', species.display_name,
    'ndex', species.dex_number,
    'level', 100,
    'max_hp', 400,
    'current_hp', 400,
    'type_keys', coalesce((select jsonb_agg(type.type_key order by type.type_order)
      from public.catalog_species_type type
      where type.catalog_release_id = p_catalog_release_id and type.species_key = species.species_key), '[]'::jsonb),
    'moves', coalesce((select jsonb_agg(jsonb_build_object(
      'move_index', server_authority_private.edge_jsonb_bigint(move.value), 'power', 320, 'stats', 170
    ) order by move.ordinality) from jsonb_array_elements(roster.entry -> 'moves') with ordinality move(value, ordinality)), '[]'::jsonb),
    'held_item_index', server_authority_private.edge_jsonb_bigint(roster.entry -> 'held_item_index'),
    'gender', null,
    'is_shiny', false,
    'is_mega', false,
    'exp_current', 0,
    'exp_cap', 0
  ) order by roster.ordinality), '[]'::jsonb)
  from jsonb_array_elements(p_team) with ordinality roster(entry, ordinality)
  join public.catalog_species species
    on species.catalog_release_id = p_catalog_release_id and species.species_key = roster.entry ->> 'species_key'
$$;

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
    delete from public.battle_dome_lobby where creator_auth_user_id = p_auth_user_id;
  end if;
  return jsonb_build_object('ok', true, 'team', v_team, 'team_revision', v_revision, 'lobby_cancelled', v_previous is distinct from v_team);
end;
$$;

create or replace function public.create_edge_battle_dome_lobby(
  p_auth_user_id uuid,
  p_invite_token text,
  p_invite_token_hash text
)
returns jsonb
language plpgsql
security definer
set search_path = public, server_authority_private, extensions, pg_temp
as $$
declare
  v_team public.battle_dome_team%rowtype;
  v_today date := server_authority_private.battle_dome_today();
begin
  if coalesce(auth.role(), '') <> 'service_role' then raise exception 'service role required' using errcode = '42501'; end if;
  if p_invite_token !~ '^[A-Za-z0-9_-]{32,160}$' or p_invite_token_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'battle dome invite token is invalid' using errcode = '22023';
  end if;
  if server_authority_private.battle_dome_active_count(p_auth_user_id) >= 2 then
    raise exception 'battle dome active challenge limit reached' using errcode = '23514';
  end if;
  select * into strict v_team from public.battle_dome_team where auth_user_id = p_auth_user_id for update;
  perform server_authority_private.battle_dome_validate_team(v_team.catalog_release_id, v_team.team, true);
  insert into public.battle_dome_lobby(creator_auth_user_id, invite_token, invite_token_hash, lobby_date)
  values(p_auth_user_id, p_invite_token, p_invite_token_hash, v_today)
  on conflict(creator_auth_user_id) do update set invite_token = excluded.invite_token,
    invite_token_hash = excluded.invite_token_hash, lobby_date = excluded.lobby_date, created_at = now();
  return jsonb_build_object('ok', true, 'invite_token', p_invite_token, 'lobby_date', v_today);
end;
$$;

create or replace function public.cancel_edge_battle_dome_lobby(p_auth_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, server_authority_private, extensions, pg_temp
as $$
begin
  if coalesce(auth.role(), '') <> 'service_role' then raise exception 'service role required' using errcode = '42501'; end if;
  delete from public.battle_dome_lobby where creator_auth_user_id = p_auth_user_id;
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.join_edge_battle_dome_lobby(
  p_auth_user_id uuid,
  p_creator_auth_user_id uuid,
  p_invite_token_hash text,
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
  v_creator_team public.battle_dome_team%rowtype;
  v_challenger_team public.battle_dome_team%rowtype;
  v_creator_name text;
  v_challenger_name text;
  v_battle public.battle_dome_battle%rowtype;
  v_participants jsonb;
begin
  if coalesce(auth.role(), '') <> 'service_role' then raise exception 'service role required' using errcode = '42501'; end if;
  if p_creator_auth_user_id is null and p_invite_token_hash is null then
    raise exception 'battle dome lobby selector is required' using errcode = '22023';
  end if;
  select * into v_lobby from public.battle_dome_lobby lobby
  where lobby.lobby_date = server_authority_private.battle_dome_today()
    and ((p_creator_auth_user_id is not null and lobby.creator_auth_user_id = p_creator_auth_user_id)
      or (p_creator_auth_user_id is null and lobby.invite_token_hash = p_invite_token_hash))
  for update;
  if not found then raise exception 'battle dome lobby is unavailable' using errcode = 'P0002'; end if;
  if v_lobby.creator_auth_user_id = p_auth_user_id then raise exception 'a player cannot challenge themselves' using errcode = '22023'; end if;
  perform pg_advisory_xact_lock(hashtextextended(least(v_lobby.creator_auth_user_id::text, p_auth_user_id::text), 0));
  perform pg_advisory_xact_lock(hashtextextended(greatest(v_lobby.creator_auth_user_id::text, p_auth_user_id::text), 0));
  if server_authority_private.battle_dome_active_count(v_lobby.creator_auth_user_id) >= 2
    or server_authority_private.battle_dome_active_count(p_auth_user_id) >= 2 then
    raise exception 'battle dome active challenge limit reached' using errcode = '23514';
  end if;
  select * into strict v_creator_team from public.battle_dome_team where auth_user_id = v_lobby.creator_auth_user_id for update;
  select * into strict v_challenger_team from public.battle_dome_team where auth_user_id = p_auth_user_id for update;
  if v_creator_team.catalog_release_id <> v_challenger_team.catalog_release_id then
    raise exception 'battle dome teams use different catalogs' using errcode = '0A000';
  end if;
  perform server_authority_private.battle_dome_validate_team(v_creator_team.catalog_release_id, v_creator_team.team, true);
  perform server_authority_private.battle_dome_validate_team(v_challenger_team.catalog_release_id, v_challenger_team.team, true);
  if not exists(select 1 from public.catalog_engine_runtime_binding binding
    where binding.catalog_release_id = v_creator_team.catalog_release_id and binding.engine_version = p_engine_version
      and binding.engine_checksum = p_engine_checksum and binding.enabled) then
    raise exception 'battle dome runtime binding is unavailable' using errcode = '0A000';
  end if;
  select username into strict v_creator_name from public.player_auth_recovery where auth_user_id = v_lobby.creator_auth_user_id;
  select username into strict v_challenger_name from public.player_auth_recovery where auth_user_id = p_auth_user_id;
  v_participants := server_authority_private.battle_dome_build_participants(v_creator_team.catalog_release_id, v_creator_team.team, 'player')
    || server_authority_private.battle_dome_build_participants(v_creator_team.catalog_release_id, v_challenger_team.team, 'npc');
  insert into public.battle_dome_battle(
    creator_auth_user_id, challenger_auth_user_id, catalog_release_id, creator_username, challenger_username,
    waiting_for, engine_version, engine_checksum, initial_participants
  ) values (
    v_lobby.creator_auth_user_id, p_auth_user_id, v_creator_team.catalog_release_id, v_creator_name, v_challenger_name,
    'creator', p_engine_version, p_engine_checksum, v_participants
  ) returning * into v_battle;
  delete from public.battle_dome_lobby where creator_auth_user_id = v_lobby.creator_auth_user_id;
  if server_authority_private.battle_dome_active_count(p_auth_user_id) >= 2 then
    delete from public.battle_dome_lobby where creator_auth_user_id = p_auth_user_id;
  end if;
  return jsonb_build_object('ok', true, 'battle', server_authority_private.battle_dome_battle_payload(v_battle));
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
        and server_authority_private.battle_dome_active_count(lobby.creator_auth_user_id) < 2), '[]'::jsonb),
    'battles', coalesce((select jsonb_agg(jsonb_build_object(
      'battle_id', battle.id,
      'creator_username', battle.creator_username,
      'challenger_username', battle.challenger_username,
      'status', battle.status,
      'own_role', case when battle.creator_auth_user_id = p_auth_user_id and not battle.creator_exited then 'creator'
        when battle.challenger_auth_user_id = p_auth_user_id and not battle.challenger_exited then 'challenger' else 'spectator' end,
      'created_at', battle.created_at
    ) order by battle.created_at desc) from public.battle_dome_battle battle), '[]'::jsonb)
  );
end;
$$;

create or replace function public.prepare_edge_battle_dome(p_auth_user_id uuid, p_battle_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, server_authority_private, extensions, pg_temp
as $$
declare
  v_battle public.battle_dome_battle%rowtype;
  v_payload jsonb;
  v_role text;
begin
  if coalesce(auth.role(), '') <> 'service_role' then raise exception 'service role required' using errcode = '42501'; end if;
  select * into v_battle from public.battle_dome_battle where id = p_battle_id;
  if not found then return jsonb_build_object('ok', true, 'battle', null); end if;
  v_role := case when v_battle.creator_auth_user_id = p_auth_user_id and not v_battle.creator_exited then 'creator'
    when v_battle.challenger_auth_user_id = p_auth_user_id and not v_battle.challenger_exited then 'challenger' else 'spectator' end;
  v_payload := server_authority_private.battle_dome_battle_payload(v_battle);
  return jsonb_build_object(
    'ok', true,
    'viewer_role', v_role,
    'battle', v_payload,
    'input_snapshot_hash', encode(digest(convert_to(coalesce(v_battle.engine_snapshot, v_battle.initial_participants)::text, 'UTF8'), 'sha256'), 'hex')
  );
end;
$$;

create or replace function public.read_edge_battle_dome_events(p_battle_id uuid, p_after_seq bigint, p_limit integer)
returns jsonb
language sql
stable
security definer
set search_path = public, server_authority_private, extensions, pg_temp
as $$
  select coalesce(jsonb_agg(jsonb_build_object('seq', event.seq, 'event_type', event.event_type,
    'event_data', event.event_data, 'created_at', event.created_at) order by event.seq), '[]'::jsonb)
  from (select * from public.battle_dome_event where battle_id = p_battle_id and seq > greatest(0, p_after_seq)
    order by seq limit least(100, greatest(1, p_limit))) event
$$;

create or replace function public.replay_edge_battle_dome_command(
  p_auth_user_id uuid, p_command_id uuid, p_command_type text, p_command_hash text
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, server_authority_private, extensions, pg_temp
as $$
declare v_receipt public.battle_dome_command_receipt%rowtype;
begin
  if coalesce(auth.role(), '') <> 'service_role' then raise exception 'service role required' using errcode = '42501'; end if;
  select * into v_receipt from public.battle_dome_command_receipt
  where auth_user_id = p_auth_user_id and command_id = p_command_id;
  if not found then return null; end if;
  if v_receipt.command_type <> p_command_type or v_receipt.command_hash <> p_command_hash then
    raise exception 'command id was already used with another payload' using errcode = '22023';
  end if;
  return v_receipt.result;
end;
$$;

create or replace function public.commit_edge_battle_dome_command(
  p_auth_user_id uuid,
  p_command_id uuid,
  p_command_type text,
  p_command_hash text,
  p_battle_id uuid,
  p_expected_battle_version bigint,
  p_engine_version text,
  p_engine_checksum text,
  p_input_snapshot_hash text,
  p_next_snapshot jsonb,
  p_events jsonb,
  p_projection jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, server_authority_private, extensions, pg_temp
as $$
declare
  v_battle public.battle_dome_battle%rowtype;
  v_role text;
  v_expected_waiting text;
  v_event jsonb;
  v_result jsonb;
  v_snapshot_hash text;
  v_seq bigint;
  v_committed_events jsonb := '[]'::jsonb;
begin
  if coalesce(auth.role(), '') <> 'service_role' then raise exception 'service role required' using errcode = '42501'; end if;
  if p_command_type not in ('initialize', 'move', 'switch', 'entry_choice', 'item')
    or jsonb_typeof(p_next_snapshot) <> 'object' or jsonb_typeof(p_events) <> 'array' or jsonb_typeof(p_projection) <> 'object' then
    raise exception 'battle dome command payload is invalid' using errcode = '22023';
  end if;
  select * into v_battle from public.battle_dome_battle where id = p_battle_id for update;
  if not found then raise exception 'battle dome challenge was not found' using errcode = 'P0002'; end if;
  v_role := case when v_battle.creator_auth_user_id = p_auth_user_id then 'creator'
    when v_battle.challenger_auth_user_id = p_auth_user_id then 'challenger' else null end;
  if v_role is null then raise exception 'battle dome participant required' using errcode = '42501'; end if;
  if p_command_type <> 'initialize' and v_battle.waiting_for <> v_role then
    raise exception 'battle dome challenge is waiting for the other player' using errcode = '40001';
  end if;
  if v_battle.battle_version <> p_expected_battle_version
    or v_battle.engine_version <> p_engine_version or v_battle.engine_checksum <> p_engine_checksum
    or encode(digest(convert_to(coalesce(v_battle.engine_snapshot, v_battle.initial_participants)::text, 'UTF8'), 'sha256'), 'hex') <> p_input_snapshot_hash then
    raise exception 'battle dome challenge changed' using errcode = '40001';
  end if;
  if p_command_type = 'initialize' and v_battle.engine_snapshot is not null then
    raise exception 'battle dome challenge is already initialized' using errcode = '40001';
  end if;
  v_snapshot_hash := encode(digest(convert_to(p_next_snapshot::text, 'UTF8'), 'sha256'), 'hex');
  v_expected_waiting := case p_projection ->> 'waiting_for' when 'admin' then 'challenger' when 'player' then 'creator' else null end;
  update public.battle_dome_battle set
    status = p_projection ->> 'status',
    result_key = p_projection ->> 'result_key',
    waiting_for = case when p_projection ->> 'status' = 'concluded' then null else v_expected_waiting end,
    player_active_slot = server_authority_private.edge_jsonb_bigint(p_projection -> 'player_active_slot'),
    npc_active_slot = server_authority_private.edge_jsonb_bigint(p_projection -> 'npc_active_slot'),
    battle_version = battle_version + 1,
    engine_snapshot = p_next_snapshot,
    engine_snapshot_hash = v_snapshot_hash,
    updated_at = now(),
    concluded_at = case when p_projection ->> 'status' = 'concluded' then now() else null end
  where id = p_battle_id returning * into v_battle;
  v_seq := v_battle.next_event_seq;
  for v_event in select value from jsonb_array_elements(p_events) loop
    insert into public.battle_dome_event(battle_id, seq, event_type, event_data)
    values(p_battle_id, v_seq, coalesce(v_event ->> 'type', 'event'), coalesce(v_event -> 'data', '{}'::jsonb));
    v_committed_events := v_committed_events || jsonb_build_array(jsonb_build_object(
      'seq', v_seq,
      'event_type', coalesce(v_event ->> 'type', 'event'),
      'event_data', coalesce(v_event -> 'data', '{}'::jsonb)
    ));
    v_seq := v_seq + 1;
  end loop;
  update public.battle_dome_battle set next_event_seq = v_seq where id = p_battle_id returning * into v_battle;
  v_result := jsonb_build_object('ok', true, 'viewer_role', v_role,
    'battle', server_authority_private.battle_dome_battle_payload(v_battle), 'events', v_committed_events);
  insert into public.battle_dome_command_receipt(auth_user_id, command_id, battle_id, command_type, command_hash, result)
  values(p_auth_user_id, p_command_id, p_battle_id, p_command_type, p_command_hash, v_result);
  return v_result;
end;
$$;

create or replace function public.abandon_edge_battle_dome(p_auth_user_id uuid, p_battle_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, server_authority_private, extensions, pg_temp
as $$
begin
  if coalesce(auth.role(), '') <> 'service_role' then raise exception 'service role required' using errcode = '42501'; end if;
  delete from public.battle_dome_battle where id = p_battle_id
    and (creator_auth_user_id = p_auth_user_id or challenger_auth_user_id = p_auth_user_id);
  if not found then raise exception 'battle dome challenge was not found' using errcode = 'P0002'; end if;
  return jsonb_build_object('ok', true, 'deleted', true, 'battle_id', p_battle_id);
end;
$$;

create or replace function public.exit_edge_battle_dome(p_auth_user_id uuid, p_battle_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, server_authority_private, extensions, pg_temp
as $$
declare v_battle public.battle_dome_battle%rowtype; v_deleted boolean := false;
begin
  if coalesce(auth.role(), '') <> 'service_role' then raise exception 'service role required' using errcode = '42501'; end if;
  select * into v_battle from public.battle_dome_battle where id = p_battle_id for update;
  if not found then return jsonb_build_object('ok', true, 'deleted', true); end if;
  if v_battle.status <> 'concluded' then raise exception 'battle dome challenge is not concluded' using errcode = '22023'; end if;
  if v_battle.creator_auth_user_id = p_auth_user_id then v_battle.creator_exited := true;
  elsif v_battle.challenger_auth_user_id = p_auth_user_id then v_battle.challenger_exited := true;
  else raise exception 'battle dome participant required' using errcode = '42501'; end if;
  if v_battle.creator_exited and v_battle.challenger_exited then
    delete from public.battle_dome_battle where id = p_battle_id;
    v_deleted := true;
  else
    update public.battle_dome_battle set creator_exited = v_battle.creator_exited,
      challenger_exited = v_battle.challenger_exited, updated_at = now() where id = p_battle_id;
  end if;
  return jsonb_build_object('ok', true, 'deleted', v_deleted, 'battle_id', p_battle_id);
end;
$$;

revoke all on function public.save_edge_battle_dome_team(uuid, jsonb) from public, anon, authenticated;
revoke all on function public.create_edge_battle_dome_lobby(uuid, text, text) from public, anon, authenticated;
revoke all on function public.cancel_edge_battle_dome_lobby(uuid) from public, anon, authenticated;
revoke all on function public.join_edge_battle_dome_lobby(uuid, uuid, text, text, text) from public, anon, authenticated;
revoke all on function public.read_edge_battle_dome_state(uuid) from public, anon, authenticated;
revoke all on function public.prepare_edge_battle_dome(uuid, uuid) from public, anon, authenticated;
revoke all on function public.read_edge_battle_dome_events(uuid, bigint, integer) from public, anon, authenticated;
revoke all on function public.replay_edge_battle_dome_command(uuid, uuid, text, text) from public, anon, authenticated;
revoke all on function public.commit_edge_battle_dome_command(uuid, uuid, text, text, uuid, bigint, text, text, text, jsonb, jsonb, jsonb) from public, anon, authenticated;
revoke all on function public.abandon_edge_battle_dome(uuid, uuid) from public, anon, authenticated;
revoke all on function public.exit_edge_battle_dome(uuid, uuid) from public, anon, authenticated;
grant execute on function public.save_edge_battle_dome_team(uuid, jsonb) to service_role;
grant execute on function public.create_edge_battle_dome_lobby(uuid, text, text) to service_role;
grant execute on function public.cancel_edge_battle_dome_lobby(uuid) to service_role;
grant execute on function public.join_edge_battle_dome_lobby(uuid, uuid, text, text, text) to service_role;
grant execute on function public.read_edge_battle_dome_state(uuid) to service_role;
grant execute on function public.prepare_edge_battle_dome(uuid, uuid) to service_role;
grant execute on function public.read_edge_battle_dome_events(uuid, bigint, integer) to service_role;
grant execute on function public.replay_edge_battle_dome_command(uuid, uuid, text, text) to service_role;
grant execute on function public.commit_edge_battle_dome_command(uuid, uuid, text, text, uuid, bigint, text, text, text, jsonb, jsonb, jsonb) to service_role;
grant execute on function public.abandon_edge_battle_dome(uuid, uuid) to service_role;
grant execute on function public.exit_edge_battle_dome(uuid, uuid) to service_role;

commit;
