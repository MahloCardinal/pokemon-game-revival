begin;

create or replace function public.adjust_debug_trainer_title(
  p_auth_user_id uuid,
  p_command_id uuid,
  p_expected_player_revision bigint,
  p_delta integer
)
returns jsonb
language plpgsql
security definer
set search_path = public, server_authority_private, extensions, pg_temp
as $$
declare
  v_request jsonb;
  v_request_hash text;
  v_receipt public.player_command_receipt%rowtype;
  v_revision bigint;
  v_catalog_release_id uuid;
  v_title_key text;
  v_changed boolean := false;
  v_result jsonb;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'service role required' using errcode = '42501';
  end if;
  if p_auth_user_id is null or p_command_id is null
    or p_expected_player_revision is null or p_expected_player_revision < 0
    or p_delta not in (-1, 1) then
    raise exception 'invalid debug Trainer Title command' using errcode = '22023';
  end if;
  if not server_authority_private.user_has_server_role(p_auth_user_id, 'debug') then
    raise exception 'debug role required' using errcode = '42501';
  end if;

  v_request := jsonb_build_object(
    'command_type', 'debug_titles',
    'expected_player_revision', p_expected_player_revision,
    'delta', p_delta
  );
  v_request_hash := encode(digest(convert_to(v_request::text, 'UTF8'), 'sha256'), 'hex');
  perform pg_advisory_xact_lock(hashtextextended(
    p_auth_user_id::text || ':' || p_command_id::text, 0
  ));

  select * into v_receipt
  from public.player_command_receipt
  where auth_user_id = p_auth_user_id and command_id = p_command_id;
  if found then
    if v_receipt.command_type <> 'debug_titles' or v_receipt.request_hash <> v_request_hash then
      raise exception 'command id was already used with a different payload' using errcode = '22023';
    end if;
    return v_receipt.result;
  end if;

  perform server_authority_private.assert_no_pending_ordinary_progression(
    p_auth_user_id, p_command_id
  );
  select revision into strict v_revision
  from public.player_state_revision
  where auth_user_id = p_auth_user_id
  for update;

  if v_revision <> p_expected_player_revision then
    return jsonb_build_object(
      'ok', true,
      'applied', false,
      'conflict', 'player_revision',
      'player_revision', v_revision,
      'player_state', server_authority_private.player_state_projection(p_auth_user_id)
    );
  end if;
  if exists (
    select 1 from public.authoritative_battle
    where auth_user_id = p_auth_user_id
      and status in ('active', 'needs_player_switch')
  ) then
    raise exception 'debug commands are blocked during an active battle' using errcode = '55000';
  end if;

  select catalog_release_id into strict v_catalog_release_id
  from public.player_profile_state
  where auth_user_id = p_auth_user_id;

  if p_delta = 1 then
    select title.title_key into v_title_key
    from public.catalog_title title
    where title.catalog_release_id = v_catalog_release_id
      and not exists (
        select 1 from public.player_title owned
        where owned.auth_user_id = p_auth_user_id
          and owned.catalog_release_id = title.catalog_release_id
          and owned.title_key = title.title_key
      )
    order by title.sort_order
    limit 1;
    if v_title_key is not null then
      v_changed := server_authority_private.grant_player_title(
        p_auth_user_id, v_title_key, now()
      );
    end if;
  else
    select title.title_key into v_title_key
    from public.player_title owned
    join public.catalog_title title
      on title.catalog_release_id = owned.catalog_release_id
     and title.title_key = owned.title_key
    where owned.auth_user_id = p_auth_user_id
      and owned.catalog_release_id = v_catalog_release_id
    order by title.sort_order
    limit 1;
    if v_title_key is not null then
      delete from public.player_title
      where auth_user_id = p_auth_user_id
        and catalog_release_id = v_catalog_release_id
        and title_key = v_title_key;
      v_changed := found;
      if v_changed then
        perform server_authority_private.sync_player_missions(p_auth_user_id);
      end if;
    end if;
  end if;

  if v_changed then
    update public.player_state_revision
    set revision = revision + 1, updated_at = now()
    where auth_user_id = p_auth_user_id
    returning revision into v_revision;
  end if;

  v_result := jsonb_build_object(
    'ok', true,
    'applied', v_changed,
    'delta', p_delta,
    'title_key', v_title_key,
    'player_revision', v_revision,
    'player_state', server_authority_private.player_state_projection(p_auth_user_id)
  );
  insert into public.player_command_receipt(
    auth_user_id, command_id, command_type, request_hash, result, resulting_revision
  ) values (
    p_auth_user_id, p_command_id, 'debug_titles', v_request_hash, v_result, v_revision
  );
  return v_result;
end;
$$;

revoke all on function public.adjust_debug_trainer_title(uuid, uuid, bigint, integer)
  from public, anon, authenticated;
grant execute on function public.adjust_debug_trainer_title(uuid, uuid, bigint, integer)
  to service_role;

comment on function public.adjust_debug_trainer_title(uuid, uuid, bigint, integer) is
  'Adds the first missing or removes the first owned Trainer Title for debug-role UI testing.';

commit;
