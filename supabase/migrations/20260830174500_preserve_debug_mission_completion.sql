begin;

-- A debug completion is not a real Pokedex entry or a Trainer Title. Preserve
-- only that mission's override; ordinary players still use canonical counts.
-- Patch the existing functions in place without adding wrappers or catalogs.
do $patch$
declare
  v_definition text;
  v_expected text;
begin
  select pg_get_functiondef('public.complete_debug_mission(uuid,uuid,bigint,integer)'::regprocedure)
  into v_definition;
  v_expected := 'set counter = v_mission.target, updated_at = now()';
  if strpos(v_definition, v_expected) = 0 then
    raise exception 'Unexpected debug mission completion definition';
  end if;
  v_definition := replace(v_definition, v_expected, $replacement$set counter = v_mission.target,
      tracked_keys = case
        when v_mission.mission_type in ('pokedex_species_count', 'title_collection')
          then array_append(array_remove(tracked_keys, 'debug_completed'), 'debug_completed')
        else tracked_keys
      end,
      updated_at = now()$replacement$);
  execute v_definition;

  select pg_get_functiondef('server_authority_private.sync_player_missions(uuid)'::regprocedure)
  into v_definition;
  if strpos(v_definition, 'v_dex_count integer;') = 0
    or strpos(v_definition, 'if v_catalog_release_id is null then return; end if;') = 0
    or strpos(v_definition, 'and mission.mission_type = ''pokedex_species_count''') = 0
    or strpos(v_definition, 'and mission.mission_type = ''title_collection''') = 0 then
    raise exception 'Unexpected mission synchronization definition';
  end if;
  v_definition := replace(v_definition, 'v_dex_count integer;', 'v_dex_count integer; v_is_debug boolean;');
  v_definition := replace(v_definition,
    'if v_catalog_release_id is null then return; end if;',
    'if v_catalog_release_id is null then return; end if;' || E'\n'
      || '  v_is_debug := server_authority_private.user_has_server_role(p_auth_user_id, ''debug'');');
  foreach v_expected in array array[
    'and mission.mission_type = ''pokedex_species_count''',
    'and mission.mission_type = ''title_collection'''
  ] loop
    v_definition := replace(v_definition, v_expected, v_expected || E'\n'
      || '    and not (v_is_debug and state.tracked_keys @> array[''debug_completed'']::text[])');
  end loop;
  execute v_definition;
end;
$patch$;

commit;
