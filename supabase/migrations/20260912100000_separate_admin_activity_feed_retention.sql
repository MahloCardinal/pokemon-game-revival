begin;

-- Admin announcements have no count retention. Only player events share the
-- ten-row window, with the existing advisory lock serializing player inserts.
do $migration$
declare v_definition text; v_previous text;
begin
  v_definition := pg_get_functiondef(
    'server_authority_private.append_global_activity_feed_event(uuid,text,text,text)'::regprocedure);
  v_previous := 'from public.global_activity_feed stale';
  if strpos(v_definition, v_previous) = 0 then raise exception 'Unexpected player feed implementation'; end if;
  v_definition := replace(v_definition, v_previous,
    v_previous || E'\n    where stale.event_type <> ''admin_message''');
  execute v_definition;

  v_definition := pg_get_functiondef('public.append_admin_global_activity_message(text)'::regprocedure);
  v_previous := $retention$  delete from public.global_activity_feed
  where id not in (
    select recent.id from public.global_activity_feed recent
    order by recent.created_at desc, recent.id desc limit 10
  );$retention$;
  if strpos(v_definition, v_previous) = 0 then raise exception 'Unexpected admin feed implementation'; end if;
  v_definition := replace(v_definition, v_previous, '');
  execute v_definition;
end;
$migration$;

create or replace function public.list_global_activity_feed()
returns jsonb
language sql security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'ok', true,
    'events', coalesce(jsonb_agg(jsonb_build_object(
      'id', feed.id,
      'player_username', feed.player_username,
      'event_type', feed.event_type,
      'subject_name', feed.subject_name,
      'secondary_subject_name', feed.secondary_subject_name
    ) order by feed.created_at desc, feed.id desc), '[]'::jsonb)
  )
  from (
    (select id, player_username, event_type, subject_name, secondary_subject_name, created_at
     from public.global_activity_feed
     where event_type <> 'admin_message'
     order by created_at desc, id desc limit 10)
    union all
    select id, player_username, event_type, subject_name, secondary_subject_name, created_at
    from public.global_activity_feed
    where event_type = 'admin_message'
  ) feed;
$$;

commit;
