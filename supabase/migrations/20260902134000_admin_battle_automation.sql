create table server_authority_private.admin_battle_automation (
  singleton boolean primary key default true check (singleton),
  enabled boolean not null default false,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

insert into server_authority_private.admin_battle_automation(singleton, enabled)
values (true, false)
on conflict (singleton) do nothing;

revoke all on table server_authority_private.admin_battle_automation from public, anon, authenticated;

create or replace function public.read_edge_admin_battle_automation()
returns jsonb
language plpgsql
stable
security definer
set search_path to 'public', 'server_authority_private', 'pg_temp'
as $$
declare
  v_setting server_authority_private.admin_battle_automation%rowtype;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'service authority required' using errcode = '42501';
  end if;
  select * into strict v_setting
  from server_authority_private.admin_battle_automation
  where singleton;
  return jsonb_build_object(
    'enabled', v_setting.enabled,
    'updated_by', v_setting.updated_by,
    'updated_at', v_setting.updated_at
  );
end;
$$;

create or replace function public.set_edge_admin_battle_automation(
  p_admin_user_id uuid,
  p_enabled boolean
) returns jsonb
language plpgsql
security definer
set search_path to 'public', 'server_authority_private', 'pg_temp'
as $$
declare
  v_setting server_authority_private.admin_battle_automation%rowtype;
begin
  if coalesce(auth.role(), '') <> 'service_role'
    or not server_authority_private.user_has_server_role(p_admin_user_id, 'admin') then
    raise exception 'admin service authority required' using errcode = '42501';
  end if;
  update server_authority_private.admin_battle_automation
  set enabled = p_enabled,
      updated_by = p_admin_user_id,
      updated_at = now()
  where singleton
  returning * into strict v_setting;
  return jsonb_build_object(
    'enabled', v_setting.enabled,
    'updated_by', v_setting.updated_by,
    'updated_at', v_setting.updated_at
  );
end;
$$;

create or replace function public.list_edge_automatic_admin_battles()
returns table(battle_id uuid)
language plpgsql
stable
security definer
set search_path to 'public', 'server_authority_private', 'pg_temp'
as $$
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'service authority required' using errcode = '42501';
  end if;
  if not coalesce((select enabled from server_authority_private.admin_battle_automation where singleton), false) then
    return;
  end if;
  return query
  select battle.id
  from public.authoritative_battle battle
  where battle.contract_key in ('admin_gym', 'league', 'debug_training')
    and battle.status in ('active', 'needs_player_switch')
    and battle.engine_runtime_state = 'ready'
    and battle.engine_snapshot is not null
    and battle.waiting_for = 'admin'
  order by battle.created_at, battle.id;
end;
$$;

create or replace function public.commit_edge_automatic_admin_command(
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
) returns jsonb
language plpgsql
security definer
set search_path to 'public', 'server_authority_private', 'extensions', 'pg_temp'
as $$
declare
  v_setting server_authority_private.admin_battle_automation%rowtype;
  v_contract_key text;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'service authority required' using errcode = '42501';
  end if;
  select * into strict v_setting
  from server_authority_private.admin_battle_automation
  where singleton
  for share;
  if not v_setting.enabled then
    return jsonb_build_object('ok', false, 'conflict', 'automation_disabled');
  end if;
  if v_setting.updated_by is null
    or not server_authority_private.user_has_server_role(v_setting.updated_by, 'admin') then
    raise exception 'automation admin authority is unavailable' using errcode = '42501';
  end if;
  select contract_key into strict v_contract_key
  from public.authoritative_battle
  where id = p_battle_id
    and contract_key in ('admin_gym', 'league', 'debug_training');

  if v_contract_key = 'debug_training' and p_command_type <> 'entry_choice' then
    return public.commit_edge_admin_debug_training_command(
      v_setting.updated_by, p_command_id, p_command_type, p_command_hash,
      p_battle_id, p_expected_battle_version, p_engine_version, p_engine_checksum,
      p_input_snapshot_hash, p_next_snapshot, p_events, p_projection
    );
  end if;
  return public.commit_edge_admin_gym_command(
    v_setting.updated_by, p_command_id, p_command_type, p_command_hash,
    p_battle_id, p_expected_battle_version, p_engine_version, p_engine_checksum,
    p_input_snapshot_hash, p_next_snapshot, p_events, p_projection
  );
end;
$$;

revoke all on function public.read_edge_admin_battle_automation() from public, anon, authenticated;
revoke all on function public.set_edge_admin_battle_automation(uuid, boolean) from public, anon, authenticated;
revoke all on function public.list_edge_automatic_admin_battles() from public, anon, authenticated;
revoke all on function public.commit_edge_automatic_admin_command(uuid, text, text, uuid, bigint, text, text, text, jsonb, jsonb, jsonb)
  from public, anon, authenticated;
grant execute on function public.read_edge_admin_battle_automation() to service_role;
grant execute on function public.set_edge_admin_battle_automation(uuid, boolean) to service_role;
grant execute on function public.list_edge_automatic_admin_battles() to service_role;
grant execute on function public.commit_edge_automatic_admin_command(uuid, text, text, uuid, bigint, text, text, text, jsonb, jsonb, jsonb)
  to service_role;
