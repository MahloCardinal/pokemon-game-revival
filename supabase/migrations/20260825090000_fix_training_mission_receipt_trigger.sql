create or replace function server_authority_private.process_training_command_receipt()
returns trigger
language plpgsql
security definer
set search_path = public, server_authority_private, pg_temp
as $$
declare
  v_entry jsonb;
  v_species_key text;
begin
  if new.command_type = 'training_terminal_reward' then
    perform server_authority_private.apply_mission_fact(
      new.auth_user_id,
      'training_victory',
      jsonb_build_object(
        'difficulty', new.result ->> 'training_difficulty',
        'teamSizeAtStart', new.result -> 'training_team_size'
      ),
      new.created_at
    );
  elsif new.command_type = 'training_allocate' then
    for v_entry in
      select value from jsonb_array_elements(coalesce(new.result -> 'level_events', '[]'::jsonb))
    loop
      select pokemon.species_key into v_species_key
      from public.player_pokemon_instance pokemon
      where pokemon.auth_user_id = new.auth_user_id
        and pokemon.id = (v_entry ->> 'pokemonInstanceId')::uuid;

      perform server_authority_private.apply_mission_fact(
        new.auth_user_id,
        'pokemon_level_up',
        jsonb_build_object(
          'speciesKey', v_species_key,
          'levels', v_entry -> 'levels',
          'source', 'training'
        ),
        new.created_at
      );
    end loop;
  elsif new.command_type = 'training_resolve'
    and new.result ->> 'evolved_to_species_key' is not null then
    perform server_authority_private.apply_mission_fact(
      new.auth_user_id,
      'pokemon_evolved',
      jsonb_build_object(
        'speciesKey', new.result ->> 'evolved_from_species_key',
        'targetSpeciesKey', new.result ->> 'evolved_to_species_key',
        'source', 'training'
      ),
      new.created_at
    );
  end if;

  return new;
end;
$$;

revoke all on function server_authority_private.process_training_command_receipt() from public;
