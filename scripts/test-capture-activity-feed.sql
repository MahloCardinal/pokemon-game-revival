-- Exercise the deployed trigger on isolated temporary data. No player rows are touched.
begin;

create temporary table capture_feed_test_events (subject_name text) on commit drop;
create temporary table capture_feed_test_encounters (
  auth_user_id uuid,
  species_key text,
  rarity_key text,
  status text,
  captured_pokemon_instance_id uuid
) on commit drop;

create function pg_temp.append_global_activity_feed_event(uuid, text, text, text)
returns void language sql as $$
  insert into pg_temp.capture_feed_test_events values ($3);
$$;

do $$
declare
  v_definition text := pg_get_functiondef(
    'server_authority_private.record_capture_activity_feed_event()'::regprocedure
  );
begin
  v_definition := replace(v_definition,
    'server_authority_private.record_capture_activity_feed_event',
    'pg_temp.record_capture_activity_feed_event');
  v_definition := replace(v_definition,
    'server_authority_private.append_global_activity_feed_event',
    'pg_temp.append_global_activity_feed_event');
  execute v_definition;
end;
$$;

create trigger capture_feed_test
after update of status, captured_pokemon_instance_id on capture_feed_test_encounters
for each row execute function pg_temp.record_capture_activity_feed_event();

insert into capture_feed_test_encounters (species_key, rarity_key, status)
select coalesce(rarity, 'null'), rarity, 'active'
from unnest(array['test', 'common', 'uncommon', 'rare', 'super_rare',
                  'ultra_rare', 'fossil', 'legendary', 'unknown', null]) rarity;

update capture_feed_test_encounters
set status = 'consumed', captured_pokemon_instance_id = '00000000-0000-0000-0000-000000000001';
-- A replay with unchanged state must not publish a second event.
update capture_feed_test_encounters set status = status;

insert into capture_feed_test_encounters (species_key, rarity_key, status)
values ('not-captured', 'rare', 'active'), ('cancelled', 'rare', 'active'),
       (null, 'rare', 'active');
update capture_feed_test_encounters set status = 'consumed' where species_key = 'not-captured';
update capture_feed_test_encounters
set status = 'cancelled', captured_pokemon_instance_id = '00000000-0000-0000-0000-000000000001'
where species_key = 'cancelled';
update capture_feed_test_encounters
set status = 'consumed', captured_pokemon_instance_id = '00000000-0000-0000-0000-000000000001'
where species_key is null;

do $$
begin
  if (select array_agg(subject_name order by subject_name) from capture_feed_test_events)
     is distinct from array['fossil', 'legendary', 'rare', 'super_rare', 'ultra_rare'] then
    raise exception 'Capture feed rarity, completion or idempotency regression';
  end if;
  if has_function_privilege('authenticated',
       'server_authority_private.append_global_activity_feed_event(uuid,text,text,text)', 'execute')
     or has_function_privilege('anon',
       'server_authority_private.append_global_activity_feed_event(uuid,text,text,text)', 'execute') then
    raise exception 'Browser roles must not execute the activity feed helper';
  end if;
end;
$$;

select 'Capture feed rarity, completion, replay and browser-permission checks passed' as result;
rollback;
