begin;

select server_authority_private.begin_game_data_change(
  p_label => 'Apply Stats cap checkpoints through level 29',
  p_affected_families => array['combat-rules']::text[],
  p_source_checksums => jsonb_build_object(
    'app/data/stat-tables.js', '2e3c5f295e51aae614ac7fa941ac22e5115072d9366beaa173bf587d8445d0b7'
  ),
  p_requires_battle_idle => true
);

lock table public.authoritative_battle, public.battle_dome_battle in share row exclusive mode;

do $check_runtime_idle$
begin
  if exists (select 1 from public.battle_dome_battle)
     or exists (select 1 from public.authoritative_battle where engine_runtime_state = 'pending') then
    raise exception 'Stats cap runtime requires no open battles' using errcode = '55000';
  end if;
end;
$check_runtime_idle$;

-- Only catalog limits change; existing Pokemon are clamped by level progression.
with caps as (
  select level, case
    when level < 10 then 2
    when level < 20 then 5
    when level < 25 then 10
    else 20
  end as stats_cap
  from generate_series(5, 29) as levels(level)
)
update public.catalog_level_rule as rule
set normal_max_stats = caps.stats_cap,
    max_stats = caps.stats_cap + rule.shiny_stats_bonus + rule.legendary_stats_bonus
from caps, public.catalog_release as release
where rule.catalog_release_id = release.id
  and release.version = 'revival-baseline'
  and rule.level = caps.level
  and rule.normal_max_stats is distinct from caps.stats_cap;

select server_authority_private.finish_game_data_change();

-- Preserve prior bindings for historical snapshots.
insert into public.catalog_engine_runtime_binding (
  catalog_release_id, engine_version, engine_checksum, enabled
)
select id, 'pokemon-game-revival',
       '18aec756514634336096985609c690330472469b5a5dfdae2621a07d3d3965c9', true
from public.catalog_release
where version = 'revival-baseline' and status = 'published'
on conflict (catalog_release_id, engine_version, engine_checksum)
do update set enabled = true;

commit;
