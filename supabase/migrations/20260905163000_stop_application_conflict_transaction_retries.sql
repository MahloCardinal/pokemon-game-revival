begin;

-- Application revision conflicts cannot succeed by retrying the same transaction.
-- PostgREST 14.5 retries SQLSTATE 40001 indefinitely. Use its explicit error
-- protocol while preserving the existing client/Edge JSON code and HTTP 409.
create function server_authority_private.raise_revision_conflict(p_message text)
returns void
language plpgsql
set search_path = pg_catalog
as $$
begin
  raise sqlstate 'PGRST' using
    message = json_build_object('code', '40001', 'message', p_message)::text,
    detail = '{"status":409,"headers":{}}';
end;
$$;
revoke all on function server_authority_private.raise_revision_conflict(text) from public, anon, authenticated;

-- Change only explicit application RAISE statements, never PostgreSQL's actual
-- serialization failures. CREATE OR REPLACE preserves signatures and grants.
do $migration$
declare
  v_proc record;
  v_definition text;
  v_match text[];
  v_message text;
  v_pattern constant text := $pattern$(raise[[:space:]]+exception[[:space:]]+('([^']|'')*')([[:space:]]*,[[:space:]]*[^;]+)?[[:space:]]+using[[:space:]]+errcode[[:space:]]*=[[:space:]]*'40001'[[:space:]]*;)$pattern$;
  v_count integer := 0;
begin
  for v_proc in
    select p.oid, pg_get_functiondef(p.oid) as definition
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname in ('public', 'server_authority_private')
      and p.prokind = 'f'
      and p.prosrc ~* $pattern$errcode[[:space:]]*=[[:space:]]*'40001'$pattern$
  loop
    v_definition := v_proc.definition;
    for v_match in select regexp_matches(v_definition, v_pattern, 'gi') loop
      v_message := v_match[2];
      if nullif(btrim(v_match[4]), '') is not null then
        -- Existing RAISE formats use bare % for each argument; SQL format uses %s.
        if position('%%' in v_message) > 0 then
          raise exception 'Unsupported escaped percent in conflict format: %', v_proc.oid::regprocedure;
        end if;
        v_message := 'format(' || replace(v_message, '%', '%s') || v_match[4] || ')';
      end if;
      v_definition := replace(v_definition, v_match[1],
        'perform server_authority_private.raise_revision_conflict(' || v_message || ');');
      v_count := v_count + 1;
    end loop;
    if v_definition ~* $pattern$errcode[[:space:]]*=[[:space:]]*'40001'$pattern$ then
      raise exception 'Unconverted application conflict: %', v_proc.oid::regprocedure;
    end if;
    execute v_definition;
  end loop;
  if v_count = 0 then raise exception 'No application conflicts found'; end if;
end;
$migration$;

commit;
