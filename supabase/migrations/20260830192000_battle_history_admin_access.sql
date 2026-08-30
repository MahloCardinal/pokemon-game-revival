begin;

create or replace function public.read_edge_battle_turn_history(p_auth_user_id uuid, p_battle_id uuid, p_dome boolean, p_turn_number bigint)
returns jsonb language plpgsql stable security definer
set search_path = public, server_authority_private, pg_temp as $$
declare v_history server_authority_private.battle_turn_history%rowtype;
begin
  if p_auth_user_id is null or p_turn_number < 1 then raise exception 'Invalid history request' using errcode='22023'; end if;
  if p_dome then
    if not exists(select 1 from public.battle_dome_battle where id = p_battle_id and engine_snapshot is not null) then
      return jsonb_build_object('ok', true, 'history', null);
    end if;
    select * into v_history from server_authority_private.battle_turn_history
      where dome_battle_id = p_battle_id and turn_number = p_turn_number;
  else
    if not exists(select 1 from public.authoritative_battle b where b.id = p_battle_id
      and (b.auth_user_id = p_auth_user_id or (b.contract_key in ('admin_gym', 'league', 'debug_training') and exists(
        select 1 from public.user_server_role r where r.auth_user_id = p_auth_user_id and r.role_key = 'admin')))) then
      return jsonb_build_object('ok', true, 'history', null);
    end if;
    select * into v_history from server_authority_private.battle_turn_history
      where battle_id = p_battle_id and turn_number = p_turn_number;
  end if;
  return jsonb_build_object('ok', true, 'history', case when v_history.turn_number is not null then
    jsonb_build_object('turn_number', v_history.turn_number, 'event_seq', v_history.event_seq, 'projection', v_history.projection) else null end);
end;
$$;

revoke all on function public.read_edge_battle_turn_history(uuid, uuid, boolean, bigint) from public, anon, authenticated;
grant execute on function public.read_edge_battle_turn_history(uuid, uuid, boolean, bigint) to service_role;

commit;
