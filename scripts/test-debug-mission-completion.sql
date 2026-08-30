-- Run with: supabase db query --linked --file scripts/test-debug-mission-completion.sql
-- The real function bodies run against session-local fixture tables only.
-- No real account, role, inventory, mission or catalog is changed. Always roll back.
begin;
set local statement_timeout = '20s';

do $fixtures$
declare
  v_table text;
  v_signature text;
  v_definition text;
begin
  foreach v_table in array array[
    'player_profile_state', 'player_state_revision', 'player_mission_state',
    'catalog_mission', 'player_dex_entry', 'player_title', 'catalog_title',
    'user_server_role', 'player_command_receipt', 'authoritative_battle'
  ] loop
    execute format('create temporary table %I (like public.%I including all) on commit drop', v_table, v_table);
  end loop;

  insert into pg_temp.catalog_mission select * from public.catalog_mission;
  insert into pg_temp.catalog_title select * from public.catalog_title;

  foreach v_signature in array array[
    'server_authority_private.user_has_server_role(uuid,text)',
    'server_authority_private.apply_daily_mission_resets(uuid,date)',
    'server_authority_private.mission_is_active(uuid,integer)',
    'server_authority_private.sync_player_missions(uuid)',
    'public.complete_debug_mission(uuid,uuid,bigint,integer)'
  ] loop
    select pg_get_functiondef(v_signature::regprocedure) into v_definition;
    v_definition := replace(replace(v_definition, 'server_authority_private.', 'pg_temp.'), 'public.', 'pg_temp.');
    execute v_definition;
  end loop;
end;
$fixtures$;

create function pg_temp.assert_no_pending_ordinary_progression(uuid,uuid) returns void
language plpgsql as $$ begin return; end; $$;

create function pg_temp.player_state_projection(p_auth_user_id uuid) returns jsonb
language sql as $$
  select jsonb_build_object('has_player', true,
    'revision', (select revision from pg_temp.player_state_revision where auth_user_id = p_auth_user_id),
    'missions', (select jsonb_agg(to_jsonb(m)) from pg_temp.player_mission_state m where auth_user_id = p_auth_user_id))
$$;

-- The real receipt trigger synchronizes missions after every command insertion.
create function pg_temp.sync_after_receipt() returns trigger language plpgsql as $$
begin
  perform pg_temp.sync_player_missions(new.auth_user_id);
  return new;
end;
$$;
create trigger sync_after_receipt after insert on pg_temp.player_command_receipt
for each row execute function pg_temp.sync_after_receipt();

do $test$
declare
  v_debug uuid := gen_random_uuid();
  v_normal uuid := gen_random_uuid();
  v_catalog uuid;
  v_mission record;
  v_command uuid;
  v_revision bigint;
  v_result jsonb;
  v_repeat jsonb;
  v_daily integer;
begin
  select id into strict v_catalog from public.catalog_release
  where version = 'revival-baseline' and status = 'published';
  insert into pg_temp.player_profile_state(auth_user_id, catalog_release_id, trainer_index, starter_status)
  values (v_debug, v_catalog, 1, 'selected'), (v_normal, v_catalog, 1, 'selected');
  insert into pg_temp.player_state_revision(auth_user_id) values (v_debug), (v_normal);
  insert into pg_temp.user_server_role(auth_user_id, role_key) values (v_debug, 'debug');
  perform set_config('request.jwt.claim.role', 'service_role', true);
  perform pg_temp.sync_player_missions(v_debug);
  perform pg_temp.sync_player_missions(v_normal);

  for v_mission in
    select * from pg_temp.catalog_mission
    where catalog_release_id = v_catalog
      and mission_type in ('pokedex_species_count', 'title_collection')
    order by mission_index
  loop
    v_command := gen_random_uuid();
    select revision into v_revision from pg_temp.player_state_revision where auth_user_id = v_debug;
    v_result := pg_temp.complete_debug_mission(v_debug, v_command, v_revision, v_mission.mission_index);
    perform pg_temp.sync_player_missions(v_debug);
    perform pg_temp.sync_player_missions(v_debug);
    if not exists (
      select 1 from pg_temp.player_mission_state
      where auth_user_id = v_debug and mission_index = v_mission.mission_index
        and counter = v_mission.target and claim_status = 'unclaimed'
        and tracked_keys @> array['debug_completed']::text[]
    ) then
      raise exception 'Debug completion lost after receipt/sync for mission %', v_mission.mission_index;
    end if;
    if not pg_temp.mission_is_active(v_debug, v_mission.mission_index) then
      raise exception 'Completed debug mission is not claimable';
    end if;
    v_repeat := pg_temp.complete_debug_mission(v_debug, v_command, v_revision, v_mission.mission_index);
    if v_repeat is distinct from v_result or
      (select revision from pg_temp.player_state_revision where auth_user_id = v_debug) <> v_revision + 1 then
      raise exception 'Debug retry is not idempotent';
    end if;

    -- The marker alone must never grant completion to an ordinary player.
    update pg_temp.player_mission_state set counter = v_mission.target, tracked_keys = array['debug_completed']
    where auth_user_id = v_normal and mission_index = v_mission.mission_index;
    perform pg_temp.sync_player_missions(v_normal);
    if (select counter from pg_temp.player_mission_state
      where auth_user_id = v_normal and mission_index = v_mission.mission_index) <> 0 then
      raise exception 'A non-debug player retained a forged completion marker';
    end if;
  end loop;

  if exists(select 1 from pg_temp.player_dex_entry) or exists(select 1 from pg_temp.player_title) then
    raise exception 'Debug completion created fake Pokedex entries or Trainer Titles';
  end if;

  begin
    perform pg_temp.complete_debug_mission(v_normal, gen_random_uuid(), 0, 3006);
    raise exception 'An ordinary player could execute a debug command';
  exception when insufficient_privilege then null;
  end;
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  begin
    perform pg_temp.complete_debug_mission(v_debug, gen_random_uuid(), 0, 3006);
    raise exception 'A browser role could directly execute a debug command';
  exception when insufficient_privilege then null;
  end;
  perform set_config('request.jwt.claim.role', 'service_role', true);

  -- Event-based missions still complete normally; no override marker is needed.
  select * into strict v_mission from pg_temp.catalog_mission
  where catalog_release_id = v_catalog and mission_index = 3000;
  select revision into v_revision from pg_temp.player_state_revision where auth_user_id = v_debug;
  perform pg_temp.complete_debug_mission(v_debug, gen_random_uuid(), v_revision, v_mission.mission_index);
  if not exists(select 1 from pg_temp.player_mission_state where auth_user_id = v_debug
    and mission_index = v_mission.mission_index and counter = v_mission.target and tracked_keys = array[]::text[]) then
    raise exception 'Event-based debug mission completion regressed';
  end if;

  select mission_index into strict v_daily from pg_temp.catalog_mission
  where catalog_release_id = v_catalog and mission_index = 1002;
  select revision into v_revision from pg_temp.player_state_revision where auth_user_id = v_debug;
  perform pg_temp.complete_debug_mission(v_debug, gen_random_uuid(), v_revision, v_daily);
  update pg_temp.player_mission_state set daily_reset_date = daily_reset_date - 1,
    tracked_keys = array['debug_completed'] where auth_user_id = v_debug and mission_index = v_daily;
  perform pg_temp.apply_daily_mission_resets(v_debug);
  if not exists(select 1 from pg_temp.player_mission_state where auth_user_id = v_debug
    and mission_index = v_daily and counter = 0 and tracked_keys = array[]::text[]) then
    raise exception 'Daily reset did not clear completion and tracking';
  end if;

  delete from pg_temp.user_server_role where auth_user_id = v_debug;
  perform pg_temp.sync_player_missions(v_debug);
  if exists(select 1 from pg_temp.player_mission_state s join pg_temp.catalog_mission m
    on m.catalog_release_id = s.catalog_release_id and m.mission_index = s.mission_index
    where s.auth_user_id = v_debug and m.mission_type in ('pokedex_species_count', 'title_collection') and s.counter <> 0) then
    raise exception 'Revoked debug role still bypasses canonical mission counts';
  end if;
end;
$test$;

select 'Debug mission synchronization, idempotency, access checks and daily resets passed' as result;
rollback;
