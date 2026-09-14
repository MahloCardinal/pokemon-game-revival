-- Execute current reward functions against temporary copies of the live catalog.
-- No real accounts, battles, inventory or reward receipts are modified.
begin;
set local statement_timeout = '30s';
create temporary table authoritative_battle (like public.authoritative_battle including defaults) on commit drop;
create temporary table player_profile_state (like public.player_profile_state including all) on commit drop;
create temporary table player_inventory_item (like public.player_inventory_item including all) on commit drop;
create temporary table player_state_revision (like public.player_state_revision including all) on commit drop;
create temporary table player_gym_victory (like public.player_gym_victory including all) on commit drop;
create temporary table player_command_receipt (like public.player_command_receipt including all) on commit drop;
create temporary table authoritative_league_run (like public.authoritative_league_run including all) on commit drop;
create temporary table player_league_victory (like public.player_league_victory including all) on commit drop;
create temporary table catalog_opponent (like public.catalog_opponent including all) on commit drop;
create temporary table catalog_opponent_reward (like public.catalog_opponent_reward including all) on commit drop;
create temporary table player_pokemon_instance (like public.player_pokemon_instance including all) on commit drop;
create temporary table authoritative_battle_participant (like public.authoritative_battle_participant including all) on commit drop;
create temporary table player_ordinary_progression (like public.player_ordinary_progression including all) on commit drop;
create temporary table player_ordinary_progression_pokemon (like public.player_ordinary_progression_pokemon including all) on commit drop;
create temporary table player_pending_resolution (like public.player_pending_resolution including all) on commit drop;
insert into catalog_opponent select * from public.catalog_opponent
  where catalog_release_id = (select id from public.catalog_release where version = 'revival-baseline');
insert into catalog_opponent_reward select * from public.catalog_opponent_reward
  where catalog_release_id = (select id from public.catalog_release where version = 'revival-baseline');
create temporary table test_events (battle_id uuid, event_kind text, payload jsonb) on commit drop;

-- Only presentation/event plumbing is stubbed. All reward mutations and checks
-- below execute the deployed functions, redirected to isolated tables.
create function pg_temp.player_state_projection(p_user uuid) returns jsonb language sql as $$
  select to_jsonb(p) from pg_temp.player_profile_state p where auth_user_id = p_user
$$;
create function pg_temp.authoritative_battle_append_event(uuid, text, jsonb, uuid, jsonb)
returns void language sql as $$ insert into pg_temp.test_events values ($1, $2, $3) $$;
create function pg_temp.emit_ordinary_level_events(uuid, uuid, uuid)
returns void language sql as $$ select $$;
do $clone$
declare target regprocedure; definition text; table_name text;
begin
  foreach target in array array[
    'server_authority_private.award_terminal_gym_victory_core(uuid,uuid,uuid,text)'::regprocedure,
    'server_authority_private.award_terminal_gym_victory(uuid,uuid,uuid)'::regprocedure,
    'server_authority_private.award_terminal_admin_gym_victory(uuid,uuid,uuid)'::regprocedure,
    'server_authority_private.finalize_terminal_admin_league(uuid,uuid,uuid,jsonb)'::regprocedure,
    'server_authority_private.pokemon_max_hp_for_instance(uuid,integer)'::regprocedure,
    'server_authority_private.pokemon_max_power_for_instance(uuid,integer)'::regprocedure,
    'server_authority_private.pokemon_max_stats_for_instance(uuid,integer)'::regprocedure,
    'server_authority_private.advance_ordinary_progression(uuid,uuid,bigint)'::regprocedure,
    'server_authority_private.create_terminal_ordinary_progression(uuid,uuid,uuid,jsonb)'::regprocedure
  ] loop
    definition := pg_get_functiondef(target);
    definition := replace(definition, 'public.', 'pg_temp.');
    definition := replace(definition, 'server_authority_private.', 'pg_temp.');
    definition := replace(definition, 'pg_temp.raise_revision_conflict', 'server_authority_private.raise_revision_conflict');
    -- These helpers only read canonical catalog/caps, never player mutations.
    definition := replace(definition, 'pg_temp.edge_jsonb_bigint', 'server_authority_private.edge_jsonb_bigint');
    definition := replace(definition, 'pg_temp.pokemon_stat_caps', 'server_authority_private.pokemon_stat_caps');
    foreach table_name in array array['catalog_species_level_move', 'catalog_species_evolution',
      'catalog_species', 'catalog_level_rule', 'catalog_move'] loop
      definition := replace(definition, 'pg_temp.' || table_name, 'public.' || table_name);
    end loop;
    execute definition;
  end loop;
end;
$clone$;
select set_config('request.jwt.claim.role', 'service_role', true);

do $gyms$
<<fixture>>
declare opponent record; contract text; player_id uuid; battle_id uuid; command_id uuid;
  result jsonb; replay jsonb; expected_items jsonb; expected_money bigint; awarded_items jsonb;
  old_cap integer; new_cap integer; threshold integer; pokemon_id uuid; exp_awards jsonb;
  pokemon_ids uuid[]; slot integer; saved_states jsonb; saved_progression jsonb;
begin
  if (select count(*) from catalog_opponent where opponent_kind = 'gym') <> 8 then
    raise exception 'Expected all eight canonical gyms';
  end if;
  foreach contract in array array['gym', 'admin_gym'] loop
    for opponent in select * from catalog_opponent where opponent_kind = 'gym' order by badge_index loop
      player_id := gen_random_uuid(); battle_id := gen_random_uuid(); command_id := gen_random_uuid();
      insert into player_profile_state(auth_user_id, catalog_release_id, trainer_index, pokedollars, badges, starter_status)
        values(player_id, opponent.catalog_release_id, 1, 100, opponent.badge_index, 'selected');
      insert into player_state_revision(auth_user_id) values(player_id);
      insert into authoritative_battle(id, auth_user_id, catalog_release_id, contract_key, status, result_key,
          gym_key, first_actor, player_active_slot, runtime_owner_id, rng_state)
        values(battle_id, player_id, opponent.catalog_release_id, contract, 'concluded', 'player_win_no_reward',
          substring(opponent.opponent_key from 5), 'player', 0, gen_random_uuid(), '{}');
      -- Exercise accumulation into existing inventory, not only inserts.
      insert into player_inventory_item(auth_user_id, catalog_release_id, item_index, quantity)
        select player_id, catalog_release_id, item_index, 7 from catalog_opponent_reward
        where opponent_key = opponent.opponent_key and reward_kind = 'item';
      select jsonb_agg(jsonb_build_object('itemIndex', item_index, 'quantity', quantity) order by reward_order)
        into expected_items from catalog_opponent_reward where opponent_key = opponent.opponent_key and reward_kind = 'item';
      select quantity into expected_money from catalog_opponent_reward
        where opponent_key = opponent.opponent_key and reward_kind = 'money';
      if contract = 'gym' then
        result := pg_temp.award_terminal_gym_victory(player_id, battle_id, command_id);
        replay := pg_temp.award_terminal_gym_victory(player_id, battle_id, command_id);
      else
        result := pg_temp.award_terminal_admin_gym_victory(player_id, battle_id, command_id);
        replay := pg_temp.award_terminal_admin_gym_victory(player_id, battle_id, command_id);
      end if;
      select jsonb_agg(jsonb_build_object('itemIndex', inventory.item_index, 'quantity', inventory.quantity - 7)
        order by reward.reward_order) into awarded_items
        from player_inventory_item inventory join catalog_opponent_reward reward
          on reward.opponent_key = opponent.opponent_key and reward.item_index = inventory.item_index
        where inventory.auth_user_id = player_id;
      if result is distinct from replay or result #> '{gym_reward,items}' is distinct from expected_items
        or awarded_items is distinct from expected_items
        or (select pokedollars from player_profile_state where auth_user_id = player_id) <> 100 + expected_money
        or (select badges from player_profile_state where auth_user_id = player_id) <> opponent.badge_index + 1
        or (select revision from player_state_revision where auth_user_id = player_id) <> 1
        or (select count(*) from player_gym_victory v where v.battle_id = fixture.battle_id) <> 1
        or (select count(*) from player_command_receipt where auth_user_id = player_id) <> 1
        or (select count(*) from test_events e where e.battle_id = fixture.battle_id) <> 1 then
        raise exception 'Incorrect reward or duplicate grant for % / %', contract, opponent.opponent_key;
      end if;
      old_cap := (array[14,20,30,40,50,60,70,80])[opponent.badge_index + 1];
      new_cap := (array[20,30,40,50,60,70,80,100])[opponent.badge_index + 1];
      select experience_reward into strict threshold from public.catalog_species
        where catalog_release_id = opponent.catalog_release_id and species_key = '4';
      exp_awards := '[]'; pokemon_ids := '{}';
      -- Both Pokemon start at the previous cap. One retains a sub-level award;
      -- the other levels up, retaining the remainder and canonical pending choices.
      for slot in 0..1 loop
        insert into player_pokemon_instance(auth_user_id, catalog_release_id, species_key, state)
          values(player_id, opponent.catalog_release_id, '4', jsonb_build_object('s','4','l',old_cap,
            'hp',50,'xp',0,'m',jsonb_build_array(jsonb_build_array(25,20,10)))) returning id into pokemon_id;
        pokemon_ids := array_append(pokemon_ids, pokemon_id);
        insert into authoritative_battle_participant(battle_id, side, slot_index, pokemon_instance_id,
            species_key, display_name, level, max_hp, current_hp, type_keys, moves, source_snapshot)
          values(battle_id, 'player', slot, pokemon_id, '4', 'charmander', old_cap, 50, 50,
            '["fire"]', '[[25,20,10]]', '{}');
        exp_awards := exp_awards || jsonb_build_array(jsonb_build_object('pokemon_instance_id',pokemon_id,
          'team_slot',slot,'exp',case when slot = 0 then 1 else threshold + 7 end,'ko_count',1));
      end loop;
      perform pg_temp.create_terminal_ordinary_progression(player_id, battle_id, command_id, exp_awards);
      if not exists(select 1 from player_ordinary_progression p where p.battle_id = fixture.battle_id
          and p.badge_count = opponent.badge_index + 1 and p.level_cap = new_cap)
        or not exists(select 1 from player_pokemon_instance where id = pokemon_ids[1]
          and (state->>'l')::integer = old_cap and (state->>'xp')::integer = 1)
        or not exists(select 1 from player_pokemon_instance where id = pokemon_ids[2]
          and (state->>'l')::integer = old_cap + 1 and (state->>'xp')::integer = 7)
        or not exists(select 1 from player_pending_resolution where pokemon_instance_id = pokemon_ids[2]
          and (options #>> '{before_state,l}')::integer = old_cap
          and (options #>> '{after_state,l}')::integer = old_cap + 1) then
        raise exception 'New badge cap/EXP/level comparison failed for % / %', contract, opponent.opponent_key;
      end if;
      select jsonb_agg(to_jsonb(p) order by id) into saved_states from player_pokemon_instance p where auth_user_id = player_id;
      select to_jsonb(p) into saved_progression from player_ordinary_progression p where p.battle_id = fixture.battle_id;
      -- Later badge changes must not recalculate an already frozen progression.
      update player_profile_state set badges = least(8, badges + 1) where auth_user_id = player_id;
      perform pg_temp.create_terminal_ordinary_progression(player_id, battle_id, command_id, exp_awards);
      if saved_states is distinct from (select jsonb_agg(to_jsonb(p) order by id) from player_pokemon_instance p where auth_user_id = player_id)
        or saved_progression is distinct from (select to_jsonb(p) from player_ordinary_progression p where p.battle_id = fixture.battle_id) then
        raise exception 'Progression replay changed EXP, level or frozen cap';
      end if;
    end loop;
  end loop;
end;
$gyms$;

-- Invalid catalog entries still abort atomically. Restore the fixture each time.
do $invalid$
declare player_id uuid := gen_random_uuid(); battle_id uuid := gen_random_uuid();
  release_id uuid := (select catalog_release_id from catalog_opponent limit 1); variant integer; rejected boolean;
begin
  insert into player_profile_state(auth_user_id, catalog_release_id, trainer_index, pokedollars, badges, starter_status)
    values(player_id, release_id, 1, 100, 0, 'selected');
  insert into player_state_revision(auth_user_id) values(player_id);
  insert into authoritative_battle(id, auth_user_id, catalog_release_id, contract_key, status, result_key,
      gym_key, first_actor, player_active_slot, runtime_owner_id, rng_state)
    values(battle_id, player_id, release_id, 'gym', 'concluded', 'player_win_no_reward',
      'pewter_city', 'player', 0, gen_random_uuid(), '{}');
  for variant in 1..7 loop
    delete from catalog_opponent_reward where opponent_key = 'gym_pewter_city';
    insert into catalog_opponent_reward select * from public.catalog_opponent_reward
      where catalog_release_id = release_id and opponent_key = 'gym_pewter_city';
    case variant
      when 1 then update catalog_opponent_reward set quantity = 0 where opponent_key = 'gym_pewter_city' and reward_kind = 'item';
      when 2 then update catalog_opponent_reward set item_index = null where opponent_key = 'gym_pewter_city' and reward_kind = 'item';
      when 3 then update catalog_opponent_reward set quantity = null where opponent_key = 'gym_pewter_city' and reward_kind = 'item';
      when 4 then update catalog_opponent_reward set rules = '{"badgeIndex":1}' where opponent_key = 'gym_pewter_city' and reward_kind = 'badge';
      when 5 then delete from catalog_opponent_reward where opponent_key = 'gym_pewter_city' and reward_kind = 'money';
      when 6 then update catalog_opponent_reward set reward_kind = 'unsupported' where opponent_key = 'gym_pewter_city' and reward_kind = 'item';
      when 7 then update catalog_opponent_reward set rules = '{}' where opponent_key = 'gym_pewter_city' and reward_kind = 'badge';
    end case;
    rejected := false;
    begin
      perform pg_temp.award_terminal_gym_victory(player_id, battle_id, gen_random_uuid());
    exception when feature_not_supported then rejected := true;
    end;
    if not rejected or (select pokedollars from player_profile_state where auth_user_id = player_id) <> 100
      or exists(select 1 from player_gym_victory where auth_user_id = player_id)
      or exists(select 1 from player_inventory_item where auth_user_id = player_id)
      or (select revision from player_state_revision where auth_user_id = player_id) <> 0 then
      raise exception 'Invalid reward variant % was accepted or partially granted', variant;
    end if;
  end loop;
end;
$invalid$;

do $league$
declare release_id uuid := (select catalog_release_id from catalog_opponent limit 1);
  player_id uuid := gen_random_uuid(); run_id uuid := gen_random_uuid(); battle_id uuid;
  result jsonb; expected_money bigint := 100; member integer;
begin
  insert into player_profile_state(auth_user_id, catalog_release_id, trainer_index, pokedollars, badges, starter_status)
    values(player_id, release_id, 1, 100, 8, 'selected');
  insert into player_state_revision(auth_user_id) values(player_id);
  insert into authoritative_league_run(id, auth_user_id, catalog_release_id, status, next_member_index)
    values(run_id, player_id, release_id, 'active', 0);
  for member in 0..4 loop
    battle_id := gen_random_uuid();
    update authoritative_league_run set status = 'active' where id = run_id;
    insert into authoritative_battle(id, auth_user_id, catalog_release_id, contract_key, status, result_key,
        league_run_id, league_member_index, first_actor, player_active_slot, runtime_owner_id, rng_state)
      values(battle_id, player_id, release_id, 'league', 'concluded', 'player_win_no_reward',
        run_id, member, 'player', 0, gen_random_uuid(), '{}');
    result := pg_temp.finalize_terminal_admin_league(player_id, battle_id, gen_random_uuid(), '{}');
    expected_money := expected_money + (select quantity from catalog_opponent_reward where opponent_key =
      case when member = 4 then 'kanto_league_champion' else 'kanto_league_' || (member + 1)::text end);
    if (select pokedollars from player_profile_state where auth_user_id = player_id) <> expected_money
      or (select completed_members from authoritative_league_run where id = run_id) <> member + 1 then
      raise exception 'Incorrect League reward at member %', member;
    end if;
  end loop;
  perform pg_temp.finalize_terminal_admin_league(player_id, battle_id, gen_random_uuid(), '{}');
  if (select status from authoritative_league_run where id = run_id) <> 'completed'
    or (select pokedollars from player_profile_state where auth_user_id = player_id) <> expected_money
    or (select count(*) from player_league_victory where auth_user_id = player_id) <> 5 then
    raise exception 'League completion or terminal replay failed';
  end if;
end;
$league$;
select 'All eight gyms (normal/admin): rewards, post-badge EXP/caps, level comparisons and replays; invalid catalogs and five League rewards passed' as result;
rollback;
