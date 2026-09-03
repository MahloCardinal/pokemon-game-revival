begin;

alter function server_authority_private.battle_dome_today()
  set search_path = pg_catalog;

revoke execute on function public.get_game_data_revision()
  from public, anon, authenticated;
grant execute on function public.get_game_data_revision()
  to service_role;

commit;
