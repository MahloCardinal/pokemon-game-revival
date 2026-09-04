begin;

-- Keep the per-level EXP, growth, rarity/Shiny caps and deterministic offers.
-- Only the frozen presentation boundary changes: stop for a choice or at the
-- end of the affordable levels, instead of creating an empty choice per level.
do $migration$
declare
  v_definition text;
  v_before text := '    v_before_state:=v_instance.state;';
  v_boundary text := '    insert into public.player_pending_resolution(auth_user_id,pokemon_instance_id,resolution_type,options,expected_revision)';
begin
  select pg_get_functiondef('server_authority_private.advance_ordinary_progression(uuid,uuid,bigint)'::regprocedure)
    into v_definition;
  if strpos(v_definition, v_before) = 0 or strpos(v_definition, v_boundary) = 0 then
    raise exception 'ordinary progression does not match the expected segment boundaries' using errcode='55000';
  end if;
  v_definition := replace(v_definition, v_before,
    '    if v_before_state is null then v_before_state:=v_instance.state; end if;');
  v_definition := replace(v_definition, v_boundary, $boundary$
    if jsonb_array_length(v_offers)=0 and jsonb_array_length(v_evolutions)=0
      and v_level<least(v_progression.level_cap,100) and v_xp>=v_threshold then
      continue;
    end if;
$boundary$ || v_boundary);
  execute v_definition;
end;
$migration$;

commit;
