begin;

-- Only encounter creation reads this probability. The resulting is_shiny flag
-- is already persisted before a battle starts, so existing encounters and
-- snapshots must remain untouched. Keep the deployed Edge runtime/bindings.

select server_authority_private.begin_game_data_change(
  p_label => 'Reduce wild Shiny odds to one in 8000',
  p_affected_families => array['progression']::text[],
  p_source_checksums => jsonb_build_object(
    'app/data/progression.js', '430e67d1f65a9dda12847ab9dbf3e522b1bb33e78de26d2517d0662289a25c44'
  ),
  p_requires_battle_idle => false
);

do $$
declare
  v_updated integer;
begin
  update public.catalog_progression_rule
  set rules = jsonb_set(rules, '{value}', '8000'::jsonb)
  where catalog_release_id = (select id from public.catalog_release where version = 'revival-baseline')
    and rule_family = 'constant'
    and rule_key = 'shiny_odds_denominator';
  get diagnostics v_updated = row_count;
  if v_updated <> 1 then
    raise exception 'Expected exactly one canonical Shiny odds rule';
  end if;
end;
$$;

select server_authority_private.finish_game_data_change();

commit;
