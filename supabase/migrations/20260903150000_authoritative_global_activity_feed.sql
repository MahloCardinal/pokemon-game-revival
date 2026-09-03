begin;

create or replace function server_authority_private.append_global_activity_feed_event(
  p_auth_user_id uuid,
  p_event_type text,
  p_subject_name text,
  p_secondary_subject_name text default null
)
returns void
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_event_type text := btrim(coalesce(p_event_type, ''));
  v_subject_name text := btrim(coalesce(p_subject_name, ''));
  v_secondary_subject_name text := nullif(btrim(coalesce(p_secondary_subject_name, '')), '');
  v_username text;
begin
  if p_auth_user_id is null
     or v_event_type not in ('starter', 'capture', 'badge', 'evolution', 'league')
     or v_subject_name = ''
     or length(v_subject_name) > 80
     or length(coalesce(v_secondary_subject_name, '')) > 80
     or (v_event_type = 'evolution' and v_secondary_subject_name is null)
     or (v_event_type <> 'evolution' and v_secondary_subject_name is not null) then
    raise exception 'invalid authoritative activity feed event' using errcode = '22023';
  end if;

  -- Debug actions must not enter the public player feed.
  if server_authority_private.user_has_server_role(p_auth_user_id, 'debug') then
    return;
  end if;

  select btrim(recovery.username)
  into v_username
  from public.player_auth_recovery recovery
  where recovery.auth_user_id = p_auth_user_id;

  -- Serialize the small global retention window so concurrent commands still leave exactly ten rows.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('global_activity_feed_retention', 0)
  );

  insert into public.global_activity_feed(
    auth_user_id,
    player_username,
    event_type,
    subject_name,
    secondary_subject_name
  ) values (
    p_auth_user_id,
    left(coalesce(nullif(v_username, ''), 'Allenatore'), 32),
    v_event_type,
    v_subject_name,
    v_secondary_subject_name
  );

  delete from public.global_activity_feed feed
  where feed.id in (
    select stale.id
    from public.global_activity_feed stale
    order by stale.created_at desc, stale.id desc
    offset 10
  );
end;
$$;

create or replace function server_authority_private.record_starter_activity_feed_event()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin
  perform server_authority_private.append_global_activity_feed_event(
    new.auth_user_id,
    'starter',
    new.species_key,
    null
  );
  return new;
end;
$$;

create or replace function server_authority_private.record_capture_activity_feed_event()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin
  if new.status = 'consumed'
     and new.captured_pokemon_instance_id is not null
     and new.species_key is not null
     and (
       old.status is distinct from new.status
       or old.captured_pokemon_instance_id is distinct from new.captured_pokemon_instance_id
     ) then
    perform server_authority_private.append_global_activity_feed_event(
      new.auth_user_id,
      'capture',
      new.species_key,
      null
    );
  end if;
  return new;
end;
$$;

create or replace function server_authority_private.record_gym_activity_feed_event()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_badge_keys constant text[] := array[
    'boulder', 'cascade', 'thunder', 'rainbow',
    'marsh', 'soul', 'volcano', 'earth'
  ];
begin
  perform server_authority_private.append_global_activity_feed_event(
    new.auth_user_id,
    'badge',
    v_badge_keys[new.badge_index + 1],
    null
  );
  return new;
end;
$$;

create or replace function server_authority_private.record_league_activity_feed_event()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_member_keys constant text[] := array[
    'lorelei', 'bruno', 'agatha', 'lance', 'kanto_champion'
  ];
begin
  perform server_authority_private.append_global_activity_feed_event(
    new.auth_user_id,
    'league',
    v_member_keys[new.member_index + 1],
    null
  );
  return new;
end;
$$;

create or replace function server_authority_private.record_evolution_activity_feed_event()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin
  if old.species_key is distinct from new.species_key then
    perform server_authority_private.append_global_activity_feed_event(
      new.auth_user_id,
      'evolution',
      old.species_key,
      new.species_key
    );
  end if;
  return new;
end;
$$;

create trigger record_starter_activity_feed_event
after insert on public.player_starter_selection
for each row execute function server_authority_private.record_starter_activity_feed_event();

create trigger record_capture_activity_feed_event
after update of status, captured_pokemon_instance_id on public.player_encounter
for each row execute function server_authority_private.record_capture_activity_feed_event();

create trigger record_gym_activity_feed_event
after insert on public.player_gym_victory
for each row execute function server_authority_private.record_gym_activity_feed_event();

create trigger record_league_activity_feed_event
after insert on public.player_league_victory
for each row execute function server_authority_private.record_league_activity_feed_event();

create trigger record_evolution_activity_feed_event
after update of species_key on public.player_pokemon_instance
for each row
when (old.species_key is distinct from new.species_key)
execute function server_authority_private.record_evolution_activity_feed_event();

revoke all on function server_authority_private.append_global_activity_feed_event(uuid, text, text, text)
  from public, anon, authenticated;
revoke all on function server_authority_private.record_starter_activity_feed_event()
  from public, anon, authenticated;
revoke all on function server_authority_private.record_capture_activity_feed_event()
  from public, anon, authenticated;
revoke all on function server_authority_private.record_gym_activity_feed_event()
  from public, anon, authenticated;
revoke all on function server_authority_private.record_league_activity_feed_event()
  from public, anon, authenticated;
revoke all on function server_authority_private.record_evolution_activity_feed_event()
  from public, anon, authenticated;

revoke all on function public.append_global_activity_feed_event(text, text, text)
  from public, anon, authenticated, service_role;
drop function public.append_global_activity_feed_event(text, text, text);

commit;
