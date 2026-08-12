begin;

create or replace function server_authority_private.pokemon_has_active_reference(
  p_auth_user_id uuid,
  p_pokemon_instance_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public, server_authority_private, pg_temp
as $function$
  select exists (
    select 1
    from public.player_pending_resolution resolution
    where resolution.auth_user_id = p_auth_user_id
      and resolution.pokemon_instance_id = p_pokemon_instance_id
      and resolution.status = 'pending'
  ) or exists (
    select 1
    from public.player_encounter encounter
    where encounter.auth_user_id = p_auth_user_id
      and encounter.status = 'active'
      and encounter.encounter_state::text like '%' || p_pokemon_instance_id::text || '%'
  ) or exists (
    select 1
    from public.authoritative_battle_participant participant
    join public.authoritative_battle battle on battle.id = participant.battle_id
    where battle.auth_user_id = p_auth_user_id
      and battle.status in ('active', 'needs_player_switch')
      and participant.pokemon_instance_id = p_pokemon_instance_id
  ) or exists (
    select 1
    from public.authoritative_league_run_pokemon pokemon
    join public.authoritative_league_run run on run.id = pokemon.run_id
    where run.auth_user_id = p_auth_user_id
      and run.status in ('active', 'awaiting_battle')
      and pokemon.pokemon_instance_id = p_pokemon_instance_id
  ) or exists (
    select 1
    from public.authoritative_battle_tower_run_pokemon pokemon
    join public.authoritative_battle_tower_run run on run.id = pokemon.run_id
    where run.auth_user_id = p_auth_user_id
      and run.status in ('active', 'awaiting_next')
      and pokemon.pokemon_instance_id = p_pokemon_instance_id
  );
$function$;

revoke all on function server_authority_private.pokemon_has_active_reference(uuid, uuid) from public;

commit;
