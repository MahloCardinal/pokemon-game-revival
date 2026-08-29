begin;

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
    begin
      insert into public.battle_dome_lobby(
        creator_auth_user_id, invite_code, lobby_date, catalog_release_id, team_snapshot
      ) values (
        p_auth_user_id, v_code, v_today, v_team.catalog_release_id, v_team.team
      )
      on conflict(creator_auth_user_id) do update set
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

revoke all on function public.create_edge_battle_dome_lobby(uuid) from public, anon, authenticated;
grant execute on function public.create_edge_battle_dome_lobby(uuid) to service_role;

commit;
