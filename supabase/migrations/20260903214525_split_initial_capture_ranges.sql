begin;

select server_authority_private.begin_game_data_change(
  p_label => 'Split zero-badge capture ranges into 5-7 and 8-10',
  p_affected_families => array['progression']::text[],
  p_source_checksums => jsonb_build_object(
    'app/data/progression.js', 'bfb402ecacf5485b94b9f150ca1cce5cdc23a35dd2486d34eb0933b68d8b9dc8'
  ),
  p_requires_battle_idle => true
);

lock table public.authoritative_battle, public.battle_dome_battle in share row exclusive mode;
do $check_runtime_idle$
begin
  if exists (select 1 from public.battle_dome_battle)
     or exists (select 1 from public.authoritative_battle where engine_runtime_state = 'pending') then
    raise exception 'Capture range runtime requires no open battles' using errcode = '55000';
  end if;
end;
$check_runtime_idle$;

insert into public.catalog_progression_rule (
  catalog_release_id, rule_family, rule_key, sort_order, rules
)
select release.id, 'capture_level_range', ranges.rule_key, ranges.sort_order,
       jsonb_build_object('badges', 0, 'min', ranges.min_level, 'max', ranges.max_level)
from public.catalog_release as release
cross join (values ('0.0', 0, 5, 7), ('0.1', 1, 8, 10))
  as ranges(rule_key, sort_order, min_level, max_level)
where release.version = 'revival-baseline'
on conflict (catalog_release_id, rule_family, rule_key)
do update set sort_order = excluded.sort_order, rules = excluded.rules;

select server_authority_private.finish_game_data_change();

-- Keep older bindings available for historical snapshots.
insert into public.catalog_engine_runtime_binding (
  catalog_release_id, engine_version, engine_checksum, enabled
)
select id, 'pokemon-game-revival',
       '44e9aca344a97610c37cb056bf653c619c0e19f3a4845728bca7ad342920b89c', true
from public.catalog_release
where version = 'revival-baseline' and status = 'published'
on conflict (catalog_release_id, engine_version, engine_checksum)
do update set enabled = true;

commit;
