create or replace function server_authority_private.commit_edge_battle_command_before_snapshot(
  p_auth_user_id uuid,
  p_command_id uuid,
  p_command_type text,
  p_command_hash text,
  p_expected_player_revision bigint,
  p_battle_id uuid,
  p_expected_battle_version bigint,
  p_runtime_owner_id uuid,
  p_engine_version text,
  p_engine_checksum text,
  p_input_snapshot_hash text,
  p_next_snapshot jsonb,
  p_events jsonb,
  p_projection jsonb,
  p_terminal_effects jsonb
) returns jsonb
language plpgsql
security definer
set search_path to 'public', 'server_authority_private', 'pg_temp'
as $$
declare
  v_battle public.authoritative_battle%rowtype;
  v_result jsonb;
  v_player jsonb;
  v_penalty jsonb;
  v_replay boolean;
  v_wins integer;
  v_record integer;
begin
  select * into strict v_battle
  from public.authoritative_battle
  where id = p_battle_id and auth_user_id = p_auth_user_id;

  select exists(
    select 1
    from public.authoritative_battle_command_receipt
    where auth_user_id = p_auth_user_id and command_id = p_command_id
  ) into v_replay;

  v_result := server_authority_private.commit_edge_battle_command_before_battle_tower_record(
    p_auth_user_id,
    p_command_id,
    p_command_type,
    p_command_hash,
    p_expected_player_revision,
    p_battle_id,
    p_expected_battle_version,
    p_runtime_owner_id,
    p_engine_version,
    p_engine_checksum,
    p_input_snapshot_hash,
    p_next_snapshot,
    p_events,
    p_projection,
    p_terminal_effects
  );

  if not v_replay and p_projection ->> 'status' in ('concluded', 'abandoned') then
    if v_battle.contract_key in ('gym', 'admin_gym', 'capture') then
      v_penalty := server_authority_private.apply_ordinary_money_penalty(
        p_auth_user_id,
        p_battle_id,
        p_command_id
      );
      if v_penalty is not null then
        v_player := v_penalty -> 'player_state';
      end if;
    end if;

    if v_battle.contract_key in ('gym', 'admin_gym', 'capture', 'league')
      and p_projection ->> 'status' = 'concluded'
      and p_projection ->> 'result_key' = 'player_win_no_reward' then
      v_player := server_authority_private.create_terminal_ordinary_progression(
        p_auth_user_id,
        p_battle_id,
        p_command_id,
        p_projection -> 'ordinary_exp_awards'
      );
    end if;

    if v_player is not null then
      v_result := jsonb_set(v_result, '{player_revision}', v_player -> 'revision', true)
        || jsonb_build_object(
          'player_state', v_player,
          'ordinary_progression', v_player -> 'ordinary_progression',
          'money_penalty', case when v_penalty is null then null else v_penalty -> 'amount' end
        );
      update public.authoritative_battle_command_receipt
      set result = v_result,
          resulting_player_revision = (v_player ->> 'revision')::bigint
      where auth_user_id = p_auth_user_id and command_id = p_command_id;
    end if;
  end if;

  if v_battle.contract_key <> 'battle_tower'
    or v_replay
    or p_projection ->> 'status' <> 'concluded'
    or p_projection ->> 'result_key' <> 'player_win_no_reward' then
    return v_result;
  end if;

  select wins into v_wins
  from public.authoritative_battle_tower_run
  where id = v_battle.tower_run_id;

  update public.player_profile_state
  set battle_tower_record = greatest(battle_tower_record, coalesce(v_wins, 0)),
      updated_at = now()
  where auth_user_id = p_auth_user_id
  returning battle_tower_record into v_record;

  v_result := v_result || jsonb_build_object(
    'tower_record', coalesce(v_record, 0),
    'player_state', server_authority_private.player_state_projection(p_auth_user_id)
  );
  update public.authoritative_battle_command_receipt
  set result = v_result
  where auth_user_id = p_auth_user_id and command_id = p_command_id;
  return v_result;
end;
$$;

revoke all on function server_authority_private.commit_edge_battle_command_before_snapshot(
  uuid, uuid, text, text, bigint, uuid, bigint, uuid, text, text, text, jsonb, jsonb, jsonb, jsonb
) from public;
