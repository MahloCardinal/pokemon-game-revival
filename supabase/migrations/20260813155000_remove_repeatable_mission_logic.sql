begin;

do $remove_repeatable_missions$
declare
  claim_function regprocedure := to_regprocedure(
    'public.claim_player_mission_before_revision_guard(uuid,bigint,integer,integer,text)'
  );
  catalog_validator regprocedure := to_regprocedure(
    'public.validate_extended_catalog_on_publish()'
  );
  function_definition text;
  previous_claim_update constant text := $previous$
  update public.player_mission_state set counter=case when v_mission.repeatable
      and not coalesce((v_mission.rules->>'daily')::boolean,false) then 0 else counter end,
    claim_status=case when v_mission.repeatable and not coalesce((v_mission.rules->>'daily')::boolean,false)
      then 'unclaimed' else 'claimed' end,
    tracked_keys=case when v_mission.repeatable and not coalesce((v_mission.rules->>'daily')::boolean,false)
      then array[]::text[] else tracked_keys end,
    last_counted_day=case when v_mission.repeatable and not coalesce((v_mission.rules->>'daily')::boolean,false)
      then null else last_counted_day end,claim_count=claim_count+1,last_claimed_at=now(),updated_at=now()
  where auth_user_id=v_auth_user_id and mission_index=p_mission_index;
$previous$;
  final_claim_update constant text := $final$
  update public.player_mission_state
  set claim_status = 'claimed',
      claim_count = claim_count + 1,
      last_claimed_at = now(),
      updated_at = now()
  where auth_user_id = v_auth_user_id
    and mission_index = p_mission_index;
$final$;
  previous_mission_checksum constant text :=
    'jsonb_build_array(mission_index, category_key, mission_type, target, repeatable, phase, sequence, rules, reward_rules, presentation)';
  final_mission_checksum constant text :=
    'jsonb_build_array(mission_index, category_key, mission_type, target, phase, sequence, rules, reward_rules, presentation)';
begin
  if exists (
    select 1
    from public.catalog_mission
    where repeatable
       or category_key = 'repeatable'
  ) then
    raise exception 'repeatable missions still exist in the Revival catalog'
      using errcode = '55000';
  end if;

  if claim_function is null or catalog_validator is null then
    raise exception 'mission functions required for cleanup were not found'
      using errcode = '55000';
  end if;

  select pg_get_functiondef(claim_function)
  into function_definition;
  if strpos(function_definition, previous_claim_update) = 0 then
    raise exception 'claim mission repeatable branch no longer matches the expected definition'
      using errcode = '55000';
  end if;
  execute replace(function_definition, previous_claim_update, final_claim_update);

  select pg_get_functiondef(catalog_validator)
  into function_definition;
  if strpos(function_definition, previous_mission_checksum) = 0 then
    raise exception 'catalog mission checksum no longer matches the expected definition'
      using errcode = '55000';
  end if;
  execute replace(function_definition, previous_mission_checksum, final_mission_checksum);
end
$remove_repeatable_missions$;

create or replace function server_authority_private.mission_is_active(
  p_auth_user_id uuid,
  p_mission_index integer
) returns boolean
language sql
stable
security definer
set search_path = 'public', 'server_authority_private', 'pg_temp'
as $$
  select coalesce((
    select state.claim_status = 'unclaimed' and case
      when mission.category_key in ('capture', 'daily') then true
      when mission.category_key <> 'adventure' then false
      when coalesce(mission.phase, 0) < 1 then false
      when profile.badges < mission.phase - 1 then false
      when exists (
        select 1
        from public.catalog_mission previous
        join public.player_mission_state previous_state
          on previous_state.auth_user_id = p_auth_user_id
         and previous_state.mission_index = previous.mission_index
        where previous.catalog_release_id = mission.catalog_release_id
          and previous.category_key = 'adventure'
          and previous.phase < mission.phase
          and previous_state.claim_status not in ('claimed', 'skipped')
      ) then false
      else true
    end
    from public.player_mission_state state
    join public.catalog_mission mission
      on mission.catalog_release_id = state.catalog_release_id
     and mission.mission_index = state.mission_index
    join public.player_profile_state profile
      on profile.auth_user_id = state.auth_user_id
    where state.auth_user_id = p_auth_user_id
      and state.mission_index = p_mission_index
  ), false);
$$;

alter table public.catalog_mission
  drop column repeatable;

alter table public.catalog_mission
  add constraint catalog_mission_category_key_check
  check (category_key in ('adventure', 'capture', 'daily'));

commit;
