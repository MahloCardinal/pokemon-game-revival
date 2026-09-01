begin;

-- Remove a complete SELECT statement identified by a unique fragment. This is
-- intentionally guarded because the target functions are already deployed.
create function pg_temp.remove_count_statement(p_definition text, p_marker text)
returns text language plpgsql as $$
declare
  v_marker_at integer := strpos(p_definition, p_marker);
  v_prefix text;
  v_reverse_at integer;
  v_candidate_start integer;
  v_statement_start integer := 0;
  v_statement_end integer;
  v_indent integer;
begin
  if v_marker_at = 0 then
    raise exception 'Could not locate obsolete count marker %', p_marker;
  end if;
  v_prefix := substring(p_definition from 1 for v_marker_at - 1);
  for v_indent in 0..8 loop
    v_reverse_at := strpos(reverse(v_prefix),
      reverse(E'\n' || repeat(' ', v_indent) || 'select count(*) into v_count'));
    if v_reverse_at > 0 then
      v_candidate_start := length(v_prefix) - v_reverse_at
        - length(E'\n' || repeat(' ', v_indent) || 'select count(*) into v_count') + 2;
      if v_candidate_start > v_statement_start then v_statement_start := v_candidate_start; end if;
    end if;
  end loop;
  if v_statement_start = 0 then
    raise exception 'Could not locate obsolete count statement for marker %', p_marker;
  end if;
  v_statement_end := v_marker_at + strpos(substring(p_definition from v_marker_at), ';') - 1;
  if v_statement_end < v_marker_at then
    raise exception 'Could not locate obsolete count terminator for marker %', p_marker;
  end if;
  return substring(p_definition from 1 for v_statement_start - 1)
    || substring(p_definition from v_statement_end + 1);
end;
$$;

do $remove_obsolete_gym_counts$
declare
  v_signature text;
  v_definition text;
begin
  foreach v_signature in array array[
    'public.start_edge_gym_battle_before_ordinary_guard(uuid,uuid,bigint,uuid,text,integer,text,text)',
    'public.start_edge_admin_gym_battle_before_ordinary_guard(uuid,uuid,bigint,uuid,text,integer,text,text)'
  ] loop
    select pg_get_functiondef(v_signature::regprocedure) into v_definition;
    v_definition := pg_temp.remove_count_statement(v_definition,
      'edge_jsonb_bigint(move -> 0) in (2, 132, 211, 234)');
    v_definition := pg_temp.remove_count_statement(v_definition,
      'offer.section_key = ''port_market'' and offer.category_key = ''port_items''');
    execute v_definition;
  end loop;
end;
$remove_obsolete_gym_counts$;

do $remove_obsolete_league_counts$
declare
  v_definition text;
begin
  select pg_get_functiondef(
    'public.start_edge_admin_league_battle_before_ordinary_guard(uuid,uuid,bigint,uuid,integer,integer,text,text)'::regprocedure
  ) into v_definition;
  v_definition := pg_temp.remove_count_statement(v_definition,
    'edge_jsonb_bigint(m->0) in (2,132,211,234)');
  v_definition := pg_temp.remove_count_statement(v_definition,
    'offer.section_key=''port_market'' and offer.category_key=''port_items''');
  if strpos(v_definition, ' v_count integer;') = 0 then
    raise exception 'Obsolete League count variable was not found';
  end if;
  v_definition := replace(v_definition, ' v_count integer;', '');
  execute v_definition;
end;
$remove_obsolete_league_counts$;

commit;
