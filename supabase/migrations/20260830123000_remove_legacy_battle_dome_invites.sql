begin;

drop function public.create_edge_battle_dome_lobby(uuid, text, text);
drop function public.join_edge_battle_dome_lobby(uuid, uuid, text, text, text);

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

alter table public.battle_dome_lobby
  drop constraint battle_dome_lobby_invite_token_hash_key,
  drop constraint battle_dome_lobby_token,
  drop constraint battle_dome_lobby_token_hash,
  drop constraint battle_dome_lobby_code,
  drop constraint battle_dome_lobby_team_snapshot,
  drop column invite_token,
  drop column invite_token_hash,
  alter column invite_code set not null,
  alter column catalog_release_id set not null,
  alter column team_snapshot set not null,
  add constraint battle_dome_lobby_code check (invite_code ~ '^[0-9]{6}$'),
  add constraint battle_dome_lobby_team_snapshot check (
    jsonb_typeof(team_snapshot) = 'array'
    and jsonb_array_length(team_snapshot) between 1 and 6
    and octet_length(team_snapshot::text) <= 32768
  );

revoke all on function public.read_edge_battle_dome_state(uuid) from public, anon, authenticated;
grant execute on function public.read_edge_battle_dome_state(uuid) to service_role;

commit;
