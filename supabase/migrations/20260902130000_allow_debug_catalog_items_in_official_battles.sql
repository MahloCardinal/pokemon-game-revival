begin;

-- The debug creator intentionally accepts every catalog item. Official battle
-- starts already relax HP and move caps for debug-created Pokemon, but still
-- applied the ordinary held-item compatibility check. Keep catalog integrity
-- while making the item rule consistent with the rest of the debug contract.
create or replace function server_authority_private.debug_or_compatible_held_item(
  p_catalog_release_id uuid,
  p_species_key text,
  p_item_index integer,
  p_debug_created boolean
) returns boolean
language sql
stable
security definer
set search_path = public, server_authority_private, pg_temp
as $$
  select case
    when coalesce(p_debug_created, false) then exists (
      select 1
      from public.catalog_item item
      where item.catalog_release_id = p_catalog_release_id
        and item.item_index = p_item_index
    )
    else server_authority_private.held_item_is_compatible(
      p_catalog_release_id,
      p_species_key,
      p_item_index
    )
  end;
$$;

revoke all on function server_authority_private.debug_or_compatible_held_item(uuid,text,integer,boolean) from public;

do $patch_official_battle_item_checks$
declare
  v_signature text;
  v_definition text;
  v_original text;
  v_old_call text := 'server_authority_private.held_item_is_compatible(';
  v_new_call text := 'server_authority_private.debug_or_compatible_held_item(';
begin
  foreach v_signature in array array[
    'public.start_edge_gym_battle_before_ordinary_guard(uuid,uuid,bigint,uuid,text,integer,text,text)',
    'public.start_edge_admin_gym_battle_before_ordinary_guard(uuid,uuid,bigint,uuid,text,integer,text,text)',
    'public.start_edge_admin_league_battle_before_ordinary_guard(uuid,uuid,bigint,uuid,integer,integer,text,text)'
  ] loop
    select pg_get_functiondef(v_signature::regprocedure) into v_definition;
    v_original := v_definition;

    if length(v_definition) - length(replace(v_definition, v_old_call, '')) <> length(v_old_call) then
      raise exception 'Expected exactly one held-item compatibility call in %', v_signature;
    end if;

    v_definition := replace(v_definition, v_old_call, v_new_call);

    if v_signature like '%league%' then
      v_definition := replace(
        v_definition,
        '(v_team.state->>''i'')::integer) then',
        '(v_team.state->>''i'')::integer, v_team.debug_created) then'
      );
    else
      v_definition := replace(
        v_definition,
        '(v_team.state ->> ''i'')::integer) then',
        '(v_team.state ->> ''i'')::integer, v_team.debug_created) then'
      );
    end if;

    if v_definition = v_original
      or strpos(v_definition, v_new_call) = 0
      or strpos(v_definition, 'v_team.debug_created) then') = 0 then
      raise exception 'Could not patch held-item compatibility in %', v_signature;
    end if;

    execute v_definition;
  end loop;
end;
$patch_official_battle_item_checks$;

commit;
