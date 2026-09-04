begin;

-- The imported progression constant also changes the Edge runtime checksum.
-- Do not strand an existing battle on a runtime that is no longer deployed.
lock table public.authoritative_battle, public.battle_dome_battle in share row exclusive mode;
do $$
begin
  if exists (select 1 from public.battle_dome_battle)
     or exists (select 1 from public.authoritative_battle
                where status in ('active', 'needs_player_switch', 'prepared')
                   or engine_runtime_state = 'pending') then
    raise exception 'Shiny odds runtime update requires no open battles' using errcode = '55000';
  end if;
end;
$$;

select server_authority_private.begin_game_data_change(
  p_label => 'Reduce wild Shiny odds to one in 8000',
  p_affected_families => array['progression']::text[],
  p_source_checksums => jsonb_build_object(
    'app/data/progression.js', '430e67d1f65a9dda12847ab9dbf3e522b1bb33e78de26d2517d0662289a25c44'
  ),
  p_requires_battle_idle => true
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

-- Retain previous bindings for historical terminal snapshots.
insert into public.catalog_engine_runtime_binding (
  catalog_release_id, engine_version, engine_checksum, enabled
)
select id, 'pokemon-game-revival',
       '400cb8395c3fbd8be01c66a37376a8231dc8be71db3ef20f7d28f446f93ac557', true
from public.catalog_release
where version = 'revival-baseline' and status = 'published'
on conflict (catalog_release_id, engine_version, engine_checksum)
do update set enabled = true;

commit;
