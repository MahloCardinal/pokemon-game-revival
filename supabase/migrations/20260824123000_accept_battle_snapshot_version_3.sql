-- Keep PostgreSQL snapshot validation aligned with app/engine/battle-runtime.js.
-- Runtime snapshot version 3 is already deployed and bound to the current Edge bundle.

CREATE OR REPLACE FUNCTION "server_authority_private"."commit_edge_battle_command_core"("p_auth_user_id" "uuid", "p_command_id" "uuid", "p_command_type" "text", "p_command_hash" "text", "p_expected_player_revision" bigint, "p_battle_id" "uuid", "p_expected_battle_version" bigint, "p_runtime_owner_id" "uuid", "p_engine_version" "text", "p_engine_checksum" "text", "p_input_snapshot_hash" "text", "p_next_snapshot" "jsonb", "p_events" "jsonb", "p_projection" "jsonb", "p_terminal_effects" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'server_authority_private', 'extensions', 'pg_temp'
    AS $_$
declare
  v_battle public.authoritative_battle%rowtype;
  v_receipt public.authoritative_battle_command_receipt%rowtype;
  v_player_revision bigint;
  v_battle_version bigint;
  v_snapshot_hash text;
  v_event jsonb;
  v_participant jsonb;
  v_event_index integer := 0;
  v_status text;
  v_result_key text;
  v_result jsonb;
  v_expected_participants integer;
  v_projected_participants integer;
  v_current_input_hash text;
  v_turn_number bigint;
  v_player_active_slot bigint;
  v_npc_active_slot bigint;
  v_player_active_index bigint;
  v_npc_active_index bigint;
  v_snapshot_roster_count integer;
  v_snapshot_roster_matches boolean;
  v_rng_start jsonb;
  v_rng_end jsonb;
  v_rng_start_draws bigint;
  v_rng_end_draws bigint;
  v_rng_audit jsonb;
  v_global_seq bigint;
  v_committed_events jsonb := '[]'::jsonb;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'service role required' using errcode = '42501';
  end if;
  if p_auth_user_id is null or p_command_id is null or p_battle_id is null or p_runtime_owner_id is null then
    raise exception 'required command identity is missing' using errcode = '22023';
  end if;
  if p_command_type is null or p_command_hash is null or p_input_snapshot_hash is null
    or p_engine_version is null or p_engine_checksum is null
    or p_command_type not in ('initialize', 'move', 'switch', 'entry_choice', 'item', 'abandon')
    or p_command_hash !~ '^[0-9a-f]{64}$'
    or p_input_snapshot_hash !~ '^[0-9a-f]{64}$'
    or p_engine_checksum !~ '^[0-9a-f]{64}$'
    or length(p_engine_version) not between 1 and 80 then
    raise exception 'command metadata is invalid' using errcode = '22023';
  end if;
  if p_expected_player_revision is null or p_expected_battle_version is null
    or p_expected_player_revision < 0 or p_expected_battle_version < 1 then
    raise exception 'expected revisions are invalid' using errcode = '22023';
  end if;
  if p_terminal_effects is distinct from jsonb_build_object('reward', 'none', 'inventory', 'unchanged', 'team', 'unchanged') then
    raise exception 'first Edge slice permits no terminal rewards or persistent mutations' using errcode = '0A000';
  end if;
  if jsonb_typeof(p_next_snapshot) is distinct from 'object' then
    raise exception 'next engine snapshot must be an object' using errcode = '22023';
  end if;
  if octet_length(p_next_snapshot::text) > 524288
    or not (p_next_snapshot ?& array['snapshotVersion', 'engineVersion', 'manager', 'playerTeam', 'enemyTeam', 'rng'])
    or server_authority_private.edge_jsonb_bigint(p_next_snapshot -> 'snapshotVersion') is null
    or server_authority_private.edge_jsonb_bigint(p_next_snapshot -> 'snapshotVersion') <> 3
    or p_next_snapshot ->> 'engineVersion' <> p_engine_version
    or jsonb_typeof(p_next_snapshot -> 'manager') is distinct from 'object'
    or jsonb_typeof(p_next_snapshot -> 'playerTeam') is distinct from 'object'
    or jsonb_typeof(p_next_snapshot -> 'enemyTeam') is distinct from 'object'
    or jsonb_typeof(p_next_snapshot -> 'rng') is distinct from 'object'
    or p_next_snapshot ->> 'engineVersion' is null
    or p_next_snapshot #>> '{rng,algorithm}' is null
    or p_next_snapshot #>> '{rng,algorithm}' <> 'xorshift32-v1'
    or server_authority_private.edge_jsonb_bigint(p_next_snapshot #> '{rng,state}') is null
    or coalesce(server_authority_private.edge_jsonb_bigint(p_next_snapshot #> '{rng,draws}'), -1) < 0 then
    raise exception 'next engine snapshot is invalid' using errcode = '22023';
  end if;
  if jsonb_typeof(p_events) is distinct from 'array' or jsonb_typeof(p_projection) is distinct from 'object' then
    raise exception 'events/projection root schema is invalid' using errcode = '22023';
  end if;
  if jsonb_typeof(p_projection -> 'participants') is distinct from 'array' then
    raise exception 'projection participants must be an array' using errcode = '22023';
  end if;
  if jsonb_array_length(p_events) not between 1 and 128 or octet_length(p_events::text) > 131072
    or octet_length(p_projection::text) > 131072
    or not (p_projection ?& array['status', 'reward_status', 'turn_number', 'first_actor', 'player_active_slot', 'npc_active_slot', 'participants'])
    or jsonb_array_length(p_projection -> 'participants') not between 2 and 12 then
    raise exception 'transition output exceeds its schema bounds' using errcode = '22023';
  end if;
  v_status := p_projection ->> 'status';
  v_result_key := p_projection ->> 'result_key';
  v_turn_number := server_authority_private.edge_jsonb_bigint(p_projection -> 'turn_number');
  v_player_active_slot := server_authority_private.edge_jsonb_bigint(p_projection -> 'player_active_slot');
  v_npc_active_slot := server_authority_private.edge_jsonb_bigint(p_projection -> 'npc_active_slot');
  if v_status is null or v_status not in ('active', 'needs_player_switch', 'concluded', 'abandoned')
    or (v_status in ('concluded', 'abandoned')) <> (v_result_key is not null)
    or (v_result_key is not null and v_result_key not in ('player_win_no_reward', 'player_loss_no_reward', 'abandoned_no_reward'))
    or p_projection ->> 'reward_status' is null
    or p_projection ->> 'reward_status' <> 'disabled_edge_first_slice'
    or p_projection ->> 'first_actor' is null
    or p_projection ->> 'first_actor' not in ('player', 'npc')
    or coalesce(v_turn_number, 0) < 1
    or coalesce(v_player_active_slot, -1) not between 0 and 5
    or coalesce(v_npc_active_slot, -1) not between 0 and 5 then
    raise exception 'battle projection is invalid' using errcode = '22023';
  end if;
  if jsonb_typeof(p_next_snapshot #> '{playerTeam,pokemon}') is distinct from 'array'
    or jsonb_typeof(p_next_snapshot #> '{playerTeam,combatants}') is distinct from 'array'
    or jsonb_typeof(p_next_snapshot #> '{enemyTeam,pokemon}') is distinct from 'array'
    or jsonb_typeof(p_next_snapshot #> '{enemyTeam,combatants}') is distinct from 'array' then
    raise exception 'snapshot roster arrays are missing' using errcode = '22023';
  end if;
  if jsonb_array_length(p_next_snapshot #> '{playerTeam,pokemon}') <> jsonb_array_length(p_next_snapshot #> '{playerTeam,combatants}')
    or jsonb_array_length(p_next_snapshot #> '{enemyTeam,pokemon}') <> jsonb_array_length(p_next_snapshot #> '{enemyTeam,combatants}') then
    raise exception 'snapshot roster arrays are invalid' using errcode = '22023';
  end if;
  v_player_active_index := server_authority_private.edge_jsonb_bigint(p_next_snapshot #> '{playerTeam,state,activeIndex}');
  v_npc_active_index := server_authority_private.edge_jsonb_bigint(p_next_snapshot #> '{enemyTeam,state,activeIndex}');
  if v_player_active_index is null or v_npc_active_index is null
    or v_player_active_index not between 0 and jsonb_array_length(p_next_snapshot #> '{playerTeam,pokemon}') - 1
    or v_npc_active_index not between 0 and jsonb_array_length(p_next_snapshot #> '{enemyTeam,pokemon}') - 1 then
    raise exception 'snapshot active indexes are invalid' using errcode = '22023';
  end if;
  if server_authority_private.edge_jsonb_bigint(
      ((p_next_snapshot #> '{playerTeam,pokemon}') -> v_player_active_index::integer) #> '{state,authoritativeSlot}'
    ) <> v_player_active_slot
    or server_authority_private.edge_jsonb_bigint(
      ((p_next_snapshot #> '{enemyTeam,pokemon}') -> v_npc_active_index::integer) #> '{state,authoritativeSlot}'
    ) <> v_npc_active_slot
    or server_authority_private.edge_jsonb_bigint(p_next_snapshot #> '{manager,turn}') is null
    or server_authority_private.edge_jsonb_bigint(p_next_snapshot #> '{manager,turn}') <> v_turn_number
    or p_next_snapshot #>> '{manager,firstActor}' is null
    or p_next_snapshot #>> '{manager,firstActor}' <> p_projection ->> 'first_actor'
    or server_authority_private.edge_jsonb_boolean(p_next_snapshot #> '{manager,battleOver}') is null
    or server_authority_private.edge_jsonb_boolean(p_next_snapshot #> '{manager,playerNeedsSwitch}') is null
    or server_authority_private.edge_jsonb_boolean(p_next_snapshot #> '{manager,playerPostMoveSwitch}') is null then
    raise exception 'snapshot and projection metadata diverge' using errcode = '22023';
  end if;
  if (v_status in ('concluded', 'abandoned')) <> server_authority_private.edge_jsonb_boolean(p_next_snapshot #> '{manager,battleOver}')
    or (v_status = 'active' and (
      server_authority_private.edge_jsonb_boolean(p_next_snapshot #> '{manager,playerNeedsSwitch}')
      or server_authority_private.edge_jsonb_boolean(p_next_snapshot #> '{manager,playerPostMoveSwitch}')
    ))
    or (v_status = 'needs_player_switch' and not (
      server_authority_private.edge_jsonb_boolean(p_next_snapshot #> '{manager,playerNeedsSwitch}')
      or server_authority_private.edge_jsonb_boolean(p_next_snapshot #> '{manager,playerPostMoveSwitch}')
    )) then
    raise exception 'snapshot and projection phase diverge' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_auth_user_id::text || ':' || p_command_id::text, 0));
  select * into v_receipt from public.authoritative_battle_command_receipt
  where auth_user_id = p_auth_user_id and command_id = p_command_id;
  if found then
    if v_receipt.battle_id <> p_battle_id or v_receipt.command_type <> p_command_type or v_receipt.command_hash <> p_command_hash then
      raise exception 'command id was already used with a different payload' using errcode = '22023';
    end if;
    return v_receipt.result;
  end if;

  select revision into v_player_revision from public.player_state_revision
  where auth_user_id = p_auth_user_id for update;
  if not found then raise exception 'player state does not exist' using errcode = 'P0002'; end if;
  if v_player_revision <> p_expected_player_revision then raise exception 'player revision conflict' using errcode = '40001'; end if;
  select * into v_battle from public.authoritative_battle
  where id = p_battle_id and auth_user_id = p_auth_user_id for update;
  if not found then raise exception 'authoritative battle was not found' using errcode = 'P0002'; end if;
  if v_battle.battle_version <> p_expected_battle_version then raise exception 'battle version conflict' using errcode = '40001'; end if;
  if v_battle.runtime_owner_id <> p_runtime_owner_id then raise exception 'runtime lock is owned by another client' using errcode = '55P03'; end if;
  if v_battle.status not in ('active', 'needs_player_switch') then raise exception 'battle no longer accepts commands' using errcode = '22023'; end if;
  if not exists (
    select 1 from public.catalog_engine_runtime_binding binding
    where binding.catalog_release_id = v_battle.catalog_release_id and binding.enabled
      and binding.engine_version = p_engine_version and binding.engine_checksum = p_engine_checksum
  ) then raise exception 'incompatible active battle engine binding' using errcode = '0A000'; end if;
  v_current_input_hash := server_authority_private.prepare_edge_battle_command_core(p_auth_user_id, p_battle_id) ->> 'input_snapshot_hash';
  if v_current_input_hash <> p_input_snapshot_hash
    or (v_battle.engine_version is not null and v_battle.engine_version <> p_engine_version)
    or (v_battle.engine_checksum is not null and v_battle.engine_checksum <> p_engine_checksum)
    or (v_battle.engine_runtime_state = 'pending') <> (p_command_type = 'initialize') then
    raise exception 'engine snapshot/version conflict' using errcode = '40001';
  end if;

  select count(*) into v_expected_participants from public.authoritative_battle_participant where battle_id = p_battle_id;
  select count(*) into v_projected_participants from (
    select distinct value ->> 'side' as side, value ->> 'slot_index' as slot
    from jsonb_array_elements(p_projection -> 'participants')
  ) projected;
  if jsonb_array_length(p_projection -> 'participants') <> v_expected_participants
    or v_projected_participants <> v_expected_participants then
    raise exception 'projection participant count changed' using errcode = '22023';
  end if;
  for v_participant in select value from jsonb_array_elements(p_projection -> 'participants') loop
    if jsonb_typeof(v_participant) is distinct from 'object'
      or v_participant ->> 'side' not in ('player', 'npc')
      or coalesce(server_authority_private.edge_jsonb_bigint(v_participant -> 'slot_index'), -1) not between 0 and 5
      or coalesce(server_authority_private.edge_jsonb_bigint(v_participant -> 'current_hp'), -1) < 0
      or server_authority_private.edge_jsonb_bigint(v_participant -> 'level') is null
      or server_authority_private.edge_jsonb_bigint(v_participant -> 'max_hp') is null
      or not exists (
        select 1 from public.authoritative_battle_participant participant
        where participant.battle_id = p_battle_id
          and participant.side = v_participant ->> 'side'
          and participant.slot_index = server_authority_private.edge_jsonb_bigint(v_participant -> 'slot_index')
          and participant.species_key = v_participant ->> 'species_key'
          and participant.level = server_authority_private.edge_jsonb_bigint(v_participant -> 'level')
          and participant.max_hp = server_authority_private.edge_jsonb_bigint(v_participant -> 'max_hp')
          and server_authority_private.edge_jsonb_bigint(v_participant -> 'current_hp') <= participant.max_hp
      ) then raise exception 'participant projection is invalid' using errcode = '22023'; end if;
  end loop;
  with snapshot_roster as (
    select 'player'::text as side,
      server_authority_private.edge_jsonb_bigint(pokemon.value #> '{state,authoritativeSlot}') as slot,
      server_authority_private.edge_jsonb_bigint(combatant.value #> '{state,hp}') as hp,
      pokemon.value #>> '{state,speciesKey}' as species_key,
      server_authority_private.edge_jsonb_bigint(pokemon.value #> '{state,level}') as level,
      server_authority_private.edge_jsonb_bigint(pokemon.value #> '{state,maxHp}') as max_hp
    from jsonb_array_elements(p_next_snapshot #> '{playerTeam,pokemon}') with ordinality pokemon(value, ordinality)
    join jsonb_array_elements(p_next_snapshot #> '{playerTeam,combatants}') with ordinality combatant(value, ordinality) using (ordinality)
    union all
    select 'npc'::text,
      server_authority_private.edge_jsonb_bigint(pokemon.value #> '{state,authoritativeSlot}'),
      server_authority_private.edge_jsonb_bigint(combatant.value #> '{state,hp}'),
      pokemon.value #>> '{state,speciesKey}',
      server_authority_private.edge_jsonb_bigint(pokemon.value #> '{state,level}'),
      server_authority_private.edge_jsonb_bigint(pokemon.value #> '{state,maxHp}')
    from jsonb_array_elements(p_next_snapshot #> '{enemyTeam,pokemon}') with ordinality pokemon(value, ordinality)
    join jsonb_array_elements(p_next_snapshot #> '{enemyTeam,combatants}') with ordinality combatant(value, ordinality) using (ordinality)
  )
  select count(*), coalesce(bool_and(roster.slot is not null and roster.hp is not null
    and roster.species_key is not null and roster.level is not null and roster.max_hp is not null and exists (
    select 1 from jsonb_array_elements(p_projection -> 'participants') projected(value)
    where projected.value ->> 'side' = roster.side
      and server_authority_private.edge_jsonb_bigint(projected.value -> 'slot_index') = roster.slot
      and server_authority_private.edge_jsonb_bigint(projected.value -> 'current_hp') = roster.hp
      and projected.value ->> 'species_key' = roster.species_key
      and server_authority_private.edge_jsonb_bigint(projected.value -> 'level') = roster.level
      and server_authority_private.edge_jsonb_bigint(projected.value -> 'max_hp') = roster.max_hp
  )), false)
  into v_snapshot_roster_count, v_snapshot_roster_matches from snapshot_roster roster;
  if v_snapshot_roster_count <> v_expected_participants or not v_snapshot_roster_matches then
    raise exception 'snapshot and participant projection diverge' using errcode = '22023';
  end if;
  for v_event in select value from jsonb_array_elements(p_events) loop
    if jsonb_typeof(v_event) is distinct from 'object'
      or server_authority_private.edge_jsonb_bigint(v_event -> 'sequence') is null
      or server_authority_private.edge_jsonb_bigint(v_event -> 'sequence') <> v_event_index
      or coalesce(v_event ->> 'type', '') !~ '^[a-z][a-z0-9_]{0,47}$'
      or jsonb_typeof(v_event -> 'data') is distinct from 'object' or octet_length((v_event -> 'data')::text) > 8192 then
      raise exception 'display event sequence/schema is invalid' using errcode = '22023';
    end if;
    v_event_index := v_event_index + 1;
  end loop;

  v_snapshot_hash := encode(digest(convert_to(p_next_snapshot::text, 'UTF8'), 'sha256'), 'hex');
  v_rng_start := coalesce(v_battle.engine_snapshot -> 'rng', p_next_snapshot -> 'rng');
  v_rng_end := p_next_snapshot -> 'rng';
  v_rng_start_draws := server_authority_private.edge_jsonb_bigint(v_rng_start -> 'draws');
  v_rng_end_draws := server_authority_private.edge_jsonb_bigint(v_rng_end -> 'draws');
  if v_rng_start_draws is null or v_rng_end_draws is null or v_rng_end_draws < v_rng_start_draws then
    raise exception 'RNG draw counter regressed' using errcode = '22023';
  end if;
  v_rng_audit := jsonb_build_array(jsonb_build_object(
    'start', v_rng_start,
    'end', v_rng_end,
    'draw_delta', v_rng_end_draws - v_rng_start_draws
  ));
  update public.authoritative_battle set
    engine_version = p_engine_version,
    engine_checksum = p_engine_checksum,
    engine_snapshot = p_next_snapshot,
    engine_snapshot_hash = v_snapshot_hash,
    engine_runtime_state = 'ready',
    rng_state = p_next_snapshot -> 'rng',
    status = v_status,
    result_key = v_result_key,
    turn_number = v_turn_number,
    first_actor = p_projection ->> 'first_actor',
    player_active_slot = v_player_active_slot,
    npc_active_slot = v_npc_active_slot,
    battle_version = battle_version + 1,
    concluded_at = case when v_status in ('concluded', 'abandoned') then now() else null end,
    updated_at = now()
  where id = p_battle_id returning battle_version into v_battle_version;
  for v_participant in select value from jsonb_array_elements(p_projection -> 'participants') loop
    update public.authoritative_battle_participant set current_hp = server_authority_private.edge_jsonb_bigint(v_participant -> 'current_hp')
    where battle_id = p_battle_id and side = v_participant ->> 'side'
      and slot_index = server_authority_private.edge_jsonb_bigint(v_participant -> 'slot_index');
  end loop;
  for v_event in select value from jsonb_array_elements(p_events) loop
    v_global_seq := server_authority_private.authoritative_battle_append_event(
      p_battle_id, v_event ->> 'type', v_event -> 'data',
      case when server_authority_private.edge_jsonb_bigint(v_event -> 'sequence') = 0 and p_command_type <> 'initialize' then p_command_id else null end,
      v_rng_audit
    );
    v_committed_events := v_committed_events || jsonb_build_array(v_event || jsonb_build_object(
      'seq', v_global_seq,
      'battle_version', v_battle_version,
      'rng_audit', v_rng_audit
    ));
  end loop;
  update public.player_state_revision set revision = revision + 1, updated_at = now()
  where auth_user_id = p_auth_user_id returning revision into v_player_revision;
  v_result := jsonb_build_object(
    'ok', true,
    'player_revision', v_player_revision,
    'battle_version', v_battle_version,
    'engine_snapshot_hash', v_snapshot_hash,
    'battle', p_projection || jsonb_build_object(
      'mode', 'authoritative_edge',
      'battle_id', p_battle_id,
      'battle_version', v_battle_version,
      'engine_version', p_engine_version,
      'engine_checksum', p_engine_checksum,
      'engine_snapshot_hash', v_snapshot_hash
    ),
    'events', v_committed_events
  );
  insert into public.authoritative_battle_command_receipt(
    auth_user_id, command_id, battle_id, command_type, command_hash, result,
    resulting_player_revision, resulting_battle_version
  ) values (
    p_auth_user_id, p_command_id, p_battle_id, p_command_type, p_command_hash, v_result,
    v_player_revision, v_battle_version
  );
  return v_result;
end;
$_$;


ALTER FUNCTION "server_authority_private"."commit_edge_battle_command_core"("p_auth_user_id" "uuid", "p_command_id" "uuid", "p_command_type" "text", "p_command_hash" "text", "p_expected_player_revision" bigint, "p_battle_id" "uuid", "p_expected_battle_version" bigint, "p_runtime_owner_id" "uuid", "p_engine_version" "text", "p_engine_checksum" "text", "p_input_snapshot_hash" "text", "p_next_snapshot" "jsonb", "p_events" "jsonb", "p_projection" "jsonb", "p_terminal_effects" "jsonb") OWNER TO "postgres";
