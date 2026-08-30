begin;

create table server_authority_private.battle_turn_history (
  battle_id uuid references public.authoritative_battle(id) on delete cascade,
  dome_battle_id uuid references public.battle_dome_battle(id) on delete cascade,
  turn_number bigint not null check (turn_number > 0),
  event_seq bigint not null check (event_seq > 0),
  projection jsonb not null check (jsonb_typeof(projection) = 'object' and octet_length(projection::text) <= 524288),
  check (num_nonnulls(battle_id, dome_battle_id) = 1),
  unique (battle_id, turn_number),
  unique (dome_battle_id, turn_number)
);
alter table server_authority_private.battle_turn_history enable row level security;
revoke all on server_authority_private.battle_turn_history from public, anon, authenticated;

-- Heavy visual projections live once in history, never in log pages or receipts.
create function server_authority_private.battle_turn_event_refs(p_events jsonb)
returns jsonb language sql immutable set search_path = pg_catalog as $$
  select coalesce(jsonb_agg(case when e->>'type' = 'turn_checkpoint'
    then jsonb_set(e, '{data}', jsonb_build_object('turn_number', e#>'{data,turn_number}'))
    else e end order by n), '[]'::jsonb)
  from jsonb_array_elements(p_events) with ordinality as t(e,n);
$$;

create function server_authority_private.store_battle_turn_history(p_battle_id uuid, p_dome boolean, p_events jsonb, p_result jsonb)
returns void language plpgsql security definer set search_path = pg_catalog, server_authority_private as $$
declare v_event jsonb; v_turn bigint; v_seq bigint;
begin
  if coalesce((p_result->>'ok')::boolean, false) is not true then return; end if;
  for v_event in select value from jsonb_array_elements(p_events) where value->>'type' = 'turn_checkpoint' loop
    v_turn := (v_event#>>'{data,turn_number}')::bigint;
    select (e->>'seq')::bigint into v_seq from jsonb_array_elements(p_result->'events') e
      where coalesce(e->>'type', e->>'event_type') = 'turn_checkpoint'
      and coalesce(e#>>'{data,turn_number}', e#>>'{event_data,turn_number}')::bigint = v_turn;
    if v_seq is null then raise exception 'Committed turn checkpoint missing'; end if;
    insert into server_authority_private.battle_turn_history(battle_id, dome_battle_id, turn_number, event_seq, projection)
    values(case when not p_dome then p_battle_id end, case when p_dome then p_battle_id end,
      v_turn, v_seq, v_event#>'{data,projection}') on conflict do nothing;
  end loop;
end;
$$;

-- Both paths retain their existing locks, validation and idempotent receipts.
-- Splitting history before the core call preserves the narrow log size limits.
do $migration$
declare v_schema text; v_name text; v_proc record; v_args text; v_previous text;
begin
  for v_schema, v_name in values
    ('server_authority_private', 'commit_edge_battle_command_core'),
    ('public', 'commit_edge_battle_dome_command') loop
    select p.oid, pg_get_function_arguments(p.oid) as arguments,
      pg_get_function_identity_arguments(p.oid) as identity_arguments, p.proargnames
      into strict v_proc from pg_proc p join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = v_schema and p.proname = v_name;
    v_previous := v_name || '_before_turn_history';
    select string_agg(case when arg = 'p_events' then 'server_authority_private.battle_turn_event_refs(p_events)'
      else quote_ident(arg) end, ', ' order by ordinal) into v_args
      from unnest(v_proc.proargnames) with ordinality as a(arg, ordinal);
    execute format('alter function %I.%I(%s) rename to %I', v_schema, v_name, v_proc.identity_arguments, v_previous);
    execute format($definition$
      create function %I.%I(%s) returns jsonb language plpgsql security definer
      set search_path = public, server_authority_private, extensions, pg_temp as $body$
      declare v_result jsonb;
      begin
        v_result := %I.%I(%s);
        perform server_authority_private.store_battle_turn_history(p_battle_id, %L::boolean, p_events, v_result);
        return v_result;
      end;
      $body$;
    $definition$, v_schema, v_name, v_proc.arguments, v_schema, v_previous, v_args, v_name = 'commit_edge_battle_dome_command');
    execute format('revoke all on function %I.%I(%s) from public, anon, authenticated', v_schema, v_name, v_proc.identity_arguments);
    execute format('grant execute on function %I.%I(%s) to service_role', v_schema, v_name, v_proc.identity_arguments);
  end loop;
end;
$migration$;

create function public.read_edge_battle_turn_history(p_auth_user_id uuid, p_battle_id uuid, p_dome boolean, p_turn_number bigint)
returns jsonb language plpgsql stable security definer
set search_path = public, server_authority_private, pg_temp as $$
declare v_history server_authority_private.battle_turn_history%rowtype;
begin
  if p_auth_user_id is null or p_turn_number < 1 then raise exception 'Invalid history request' using errcode='22023'; end if;
  if p_dome then
    if not exists(select 1 from public.battle_dome_battle where id = p_battle_id and engine_snapshot is not null) then
      return jsonb_build_object('ok', true, 'history', null);
    end if;
    select * into v_history from server_authority_private.battle_turn_history
      where dome_battle_id = p_battle_id and turn_number = p_turn_number;
  else
    if not exists(select 1 from public.authoritative_battle b where b.id = p_battle_id
      and (b.auth_user_id = p_auth_user_id or (b.admin_controlled and exists(
        select 1 from public.user_server_role r where r.auth_user_id = p_auth_user_id and r.role_key = 'admin')))) then
      return jsonb_build_object('ok', true, 'history', null);
    end if;
    select * into v_history from server_authority_private.battle_turn_history
      where battle_id = p_battle_id and turn_number = p_turn_number;
  end if;
  return jsonb_build_object('ok', true, 'history', case when v_history.turn_number is not null then
    jsonb_build_object('turn_number', v_history.turn_number, 'event_seq', v_history.event_seq, 'projection', v_history.projection) else null end);
end;
$$;
revoke all on function server_authority_private.battle_turn_event_refs(jsonb) from public, anon, authenticated;
revoke all on function server_authority_private.store_battle_turn_history(uuid, boolean, jsonb, jsonb) from public, anon, authenticated;
revoke all on function public.read_edge_battle_turn_history(uuid, uuid, boolean, bigint) from public, anon, authenticated;
grant execute on function public.read_edge_battle_turn_history(uuid, uuid, boolean, bigint) to service_role;

commit;
