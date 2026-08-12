-- Restore the terminal reader at the bottom of the canonical battle preparation
-- pipeline. The baseline accidentally made `core` call `with_inventory`, which
-- closed a recursion loop through inventory -> contract_items -> roster -> core.

create or replace function server_authority_private.prepare_edge_battle_command_core(
  p_auth_user_id uuid,
  p_battle_id uuid default null
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, server_authority_private, extensions, pg_temp
as $$
declare
  v_battle public.authoritative_battle%rowtype;
  v_player_revision bigint;
  v_participants jsonb;
  v_input_hash text;
  v_bound_engine_version text;
  v_bound_engine_checksum text;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'service role required' using errcode = '42501';
  end if;

  if p_auth_user_id is null then
    raise exception 'auth user id is required' using errcode = '22023';
  end if;

  select revision
  into v_player_revision
  from public.player_state_revision
  where auth_user_id = p_auth_user_id;

  if not found then
    raise exception 'player state does not exist' using errcode = 'P0002';
  end if;

  select *
  into v_battle
  from public.authoritative_battle battle
  where battle.auth_user_id = p_auth_user_id
    and (p_battle_id is null or battle.id = p_battle_id)
  order by
    case when battle.status in ('active', 'needs_player_switch') then 0 else 1 end,
    battle.created_at desc
  limit 1;

  if not found then
    return jsonb_build_object(
      'player_revision', v_player_revision,
      'battle', null
    );
  end if;

  select binding.engine_version, binding.engine_checksum
  into v_bound_engine_version, v_bound_engine_checksum
  from public.catalog_engine_runtime_binding binding
  where binding.catalog_release_id = v_battle.catalog_release_id
    and binding.enabled
    and (
      v_battle.engine_runtime_state = 'pending'
      or (
        binding.engine_version = v_battle.engine_version
        and binding.engine_checksum = v_battle.engine_checksum
      )
    )
  order by binding.created_at desc
  limit 1;

  if not found then
    raise exception 'incompatible active battle: catalog has no enabled exact engine binding'
      using errcode = '0A000';
  end if;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'side', participant.side,
        'slot_index', participant.slot_index,
        'pokemon_instance_id', participant.pokemon_instance_id,
        'species_key', participant.species_key,
        'display_name', participant.display_name,
        'level', participant.level,
        'max_hp', participant.max_hp,
        'current_hp', participant.current_hp,
        'type_keys', participant.type_keys,
        'moves', participant.moves,
        'instance_revision', coalesce(
          server_authority_private.edge_jsonb_bigint(participant.source_snapshot -> 'instance_revision'),
          0
        ),
        'held_item_index', coalesce(
          server_authority_private.edge_jsonb_bigint(participant.source_snapshot -> 'i'),
          0
        ),
        'gender', participant.source_snapshot ->> 'g',
        'is_shiny', coalesce(
          server_authority_private.edge_jsonb_bigint(participant.source_snapshot -> 'sh'),
          0
        ) = 1,
        'is_mega', coalesce(
          server_authority_private.edge_jsonb_bigint(participant.source_snapshot -> 'mg'),
          0
        ) = 1,
        'exp_current', coalesce(
          server_authority_private.edge_jsonb_bigint(participant.source_snapshot -> 'xp'),
          0
        )
      )
      order by
        case participant.side when 'player' then 0 else 1 end,
        participant.slot_index
    ),
    '[]'::jsonb
  )
  into v_participants
  from public.authoritative_battle_participant participant
  where participant.battle_id = v_battle.id;

  v_input_hash := coalesce(
    v_battle.engine_snapshot_hash,
    encode(
      digest(
        convert_to(
          jsonb_build_object(
            'battle_id', v_battle.id,
            'battle_version', v_battle.battle_version,
            'contract_key', v_battle.contract_key,
            'first_actor', v_battle.first_actor,
            'player_active_slot', v_battle.player_active_slot,
            'npc_active_slot', v_battle.npc_active_slot,
            'participants', v_participants
          )::text,
          'UTF8'
        ),
        'sha256'
      ),
      'hex'
    )
  );

  return jsonb_build_object(
    'player_revision', v_player_revision,
    'input_snapshot_hash', v_input_hash,
    'battle', jsonb_build_object(
      'battle_id', v_battle.id,
      'catalog_release_id', v_battle.catalog_release_id,
      'contract_key', v_battle.contract_key,
      'status', v_battle.status,
      'result_key', v_battle.result_key,
      'turn_number', v_battle.turn_number,
      'first_actor', v_battle.first_actor,
      'player_active_slot', v_battle.player_active_slot,
      'npc_active_slot', v_battle.npc_active_slot,
      'battle_version', v_battle.battle_version,
      'runtime_owner_id', v_battle.runtime_owner_id,
      'runtime_lock_version', v_battle.runtime_lock_version,
      'engine_runtime_state', v_battle.engine_runtime_state,
      'bound_engine_version', v_bound_engine_version,
      'bound_engine_checksum', v_bound_engine_checksum,
      'engine_version', v_battle.engine_version,
      'engine_checksum', v_battle.engine_checksum,
      'engine_snapshot', v_battle.engine_snapshot,
      'engine_snapshot_hash', v_battle.engine_snapshot_hash,
      'rng_state', v_battle.rng_state,
      'participants', v_participants
    )
  );
end;
$$;

revoke all on function server_authority_private.prepare_edge_battle_command_core(uuid, uuid)
  from public, anon, authenticated;
grant execute on function server_authority_private.prepare_edge_battle_command_core(uuid, uuid)
  to service_role;

