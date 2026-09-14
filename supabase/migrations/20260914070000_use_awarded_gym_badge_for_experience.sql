-- Gym rewards are committed before terminal ordinary progression in both the
-- player and admin paths. Use that authoritative badge count for new progressions.
-- Existing progressions and previously discarded EXP remain unchanged.
do $migration$
declare
  v_function regprocedure := 'server_authority_private.create_terminal_ordinary_progression(uuid,uuid,uuid,jsonb)'::regprocedure;
  v_definition text;
  v_previous text := $old$v_badges:=least(8,greatest(0,v_profile.badges-case when v_battle.contract_key in ('gym','admin_gym')
    and exists(select 1 from public.player_gym_victory where battle_id=p_battle_id) then 1 else 0 end));$old$;
begin
  v_definition := pg_get_functiondef(v_function);
  if strpos(v_definition, v_previous) = 0 then
    raise exception 'Expected pre-badge ordinary progression cap calculation was not found';
  end if;
  v_definition := replace(v_definition, v_previous,
    'v_badges:=least(8,greatest(0,v_profile.badges));');
  execute v_definition;
end;
$migration$;
