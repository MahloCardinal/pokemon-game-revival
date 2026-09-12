-- Execute current feed functions on temporary tables, never on real messages.
begin;
set local statement_timeout = '20s';
create temporary table global_activity_feed
  (like public.global_activity_feed including defaults including identity including constraints) on commit drop;
create temporary table player_auth_recovery(auth_user_id uuid, username text) on commit drop;
insert into player_auth_recovery values
  ('10000000-0000-4000-8000-000000000001', 'fixture_admin'),
  ('10000000-0000-4000-8000-000000000002', 'fixture_player');

create function pg_temp.user_has_server_role(p_user uuid, p_role text)
returns boolean language sql as $$
  select p_user = '10000000-0000-4000-8000-000000000001'::uuid and p_role = 'admin';
$$;

do $fixture$
declare v_signature text; v_definition text;
begin
  foreach v_signature in array array[
    'public.list_global_activity_feed()',
    'public.append_admin_global_activity_message(text)',
    'server_authority_private.append_global_activity_feed_event(uuid,text,text,text)'
  ] loop
    v_definition := pg_get_functiondef(v_signature::regprocedure);
    v_definition := replace(v_definition, 'public.list_global_activity_feed', 'pg_temp.list_global_activity_feed');
    v_definition := replace(v_definition, 'public.append_admin_global_activity_message', 'pg_temp.append_admin_global_activity_message');
    v_definition := replace(v_definition, 'server_authority_private.append_global_activity_feed_event', 'pg_temp.append_global_activity_feed_event');
    v_definition := replace(v_definition, 'public.global_activity_feed', 'pg_temp.global_activity_feed');
    v_definition := replace(v_definition, 'public.player_auth_recovery', 'pg_temp.player_auth_recovery');
    v_definition := replace(v_definition, 'server_authority_private.user_has_server_role', 'pg_temp.user_has_server_role');
    -- Do not contend with real feed writers during a fixture test.
    v_definition := replace(v_definition, '''global_activity_feed_retention''', '''fixture_activity_feed_retention''');
    execute v_definition;
  end loop;
end;
$fixture$;

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);
do $test$
declare v_index integer; v_result jsonb; v_events jsonb; v_players text[];
begin
  if pg_temp.list_global_activity_feed()->'events' <> '[]'::jsonb then raise exception 'Empty feed failed'; end if;
  for v_index in 1..25 loop
    v_result := pg_temp.append_admin_global_activity_message('Announcement ' || v_index);
    if v_result->>'ok' <> 'true' then raise exception 'Admin fixture rejected'; end if;
    perform pg_temp.append_global_activity_feed_event(
      '10000000-0000-4000-8000-000000000002', 'capture', v_index::text);
  end loop;
  if (select count(*) from pg_temp.global_activity_feed where event_type = 'admin_message') <> 25
    or (select count(*) from pg_temp.global_activity_feed where event_type <> 'admin_message') <> 10 then
    raise exception 'Mixed inserts did not preserve 25 announcements and 10 player events';
  end if;
  -- Announcements added after the player window must not evict any player row.
  perform pg_temp.append_admin_global_activity_message('Announcement 26');
  v_events := pg_temp.list_global_activity_feed()->'events';
  if jsonb_array_length(v_events) <> 36 then raise exception 'Reader truncated admin or player rows'; end if;
  select array_agg(e->>'subject_name' order by ordinal) into v_players
    from jsonb_array_elements(v_events) with ordinality as events(e, ordinal)
    where e->>'event_type' <> 'admin_message';
  if v_players is distinct from array['25','24','23','22','21','20','19','18','17','16'] then
    raise exception 'Reader did not return the latest ten player events in order';
  end if;
  if v_events->0->>'subject_name' <> 'Announcement 26' then raise exception 'Latest-first ordering changed'; end if;
  -- Exercise the reader independently of retention with an oversized fixture.
  insert into pg_temp.global_activity_feed(auth_user_id, player_username, event_type, subject_name, created_at)
  select '10000000-0000-4000-8000-000000000002', 'fixture_player', 'capture', 'old', now() - interval '1 day'
  from generate_series(1, 20);
  if jsonb_array_length(pg_temp.list_global_activity_feed()->'events') <> 36 then
    raise exception 'Reader failed to limit only player events';
  end if;
  perform set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000002', true);
  if pg_temp.append_admin_global_activity_message('Unauthorized')->>'ok' <> 'false' then
    raise exception 'Player can publish an admin announcement';
  end if;
  if (select count(*) from pg_temp.global_activity_feed where event_type = 'admin_message') <> 26 then
    raise exception 'Rejected announcement changed data';
  end if;
end;
$test$;
select 'Feed retention: unlimited admin messages, latest 10 player events, ordering and admin authorization passed' as result;
rollback;
