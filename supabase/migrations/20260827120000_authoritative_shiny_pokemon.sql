begin;

alter table public.catalog_level_rule
  add column normal_max_hp integer,
  add column normal_max_power integer,
  add column normal_max_stats integer,
  add column shiny_hp_bonus integer,
  add column shiny_power_bonus integer,
  add column shiny_stats_bonus integer;

alter table public.player_encounter
  add column is_shiny boolean not null default false,
  add column shiny_origin_level smallint;

alter table public.player_encounter
  add constraint player_encounter_shiny_origin_check check (
    (not is_shiny and shiny_origin_level is null)
    or (is_shiny and shiny_origin_level between 5 and 100 and shiny_origin_level = level)
  );

create or replace function server_authority_private.shiny_hp_bonus_for_level(p_level integer)
returns integer
language sql
immutable
set search_path = pg_temp
as $$
  select case
    when p_level <= 6 then 4 when p_level <= 8 then 5 when p_level <= 10 then 6
    when p_level <= 12 then 7 when p_level <= 14 then 8 when p_level <= 16 then 9
    when p_level <= 18 then 10 when p_level = 19 then 11 when p_level <= 21 then 12
    when p_level <= 23 then 13 when p_level <= 25 then 14 when p_level <= 27 then 15
    when p_level <= 29 then 16 when p_level <= 32 then 17 when p_level <= 35 then 18
    when p_level <= 38 then 19 else 20
  end
$$;

create or replace function server_authority_private.shiny_power_bonus_for_level(p_level integer)
returns integer
language sql
immutable
set search_path = pg_temp
as $$
  select case
    when p_level <= 7 then 1 when p_level <= 11 then 2 when p_level <= 14 then 3
    when p_level <= 17 then 4 when p_level <= 20 then 5 when p_level <= 23 then 6
    when p_level <= 25 then 7 when p_level <= 28 then 8 when p_level <= 30 then 9
    when p_level <= 32 then 10 when p_level <= 34 then 11 when p_level <= 36 then 12
    when p_level <= 38 then 13 when p_level = 39 then 14 else 15
  end
$$;

create or replace function server_authority_private.shiny_stats_bonus_for_level(p_level integer)
returns integer
language sql
immutable
set search_path = pg_temp
as $$
  select case
    when p_level <= 15 then 1 when p_level <= 20 then 2 when p_level <= 24 then 3
    when p_level <= 27 then 4 when p_level <= 30 then 5 when p_level <= 32 then 6
    when p_level <= 34 then 7 when p_level = 35 then 8 when p_level = 36 then 9
    when p_level = 37 then 10 when p_level = 38 then 12 when p_level = 39 then 13 else 15
  end
$$;

select server_authority_private.begin_game_data_change(
  p_label => 'Add fixed acquisition-level bonuses for Shiny Pokemon',
  p_affected_families => array['combat-rules', 'progression']::text[],
  p_source_checksums => jsonb_build_object(
    'app/data/stat-tables.js', 'e2d9b98985cb9b8f6fe836c226baba061d197bee52d132832d5d6606fb482e5b',
    'app/data/progression.js', 'df55d5a3e7c8872d49cedb24085c807fb1d24a352840a8722efe3c1338eb6413'
  ),
  p_requires_battle_idle => true
);

update public.catalog_level_rule
set normal_max_hp = max_hp,
    normal_max_power = max_power,
    normal_max_stats = max_stats,
    shiny_hp_bonus = server_authority_private.shiny_hp_bonus_for_level(level),
    shiny_power_bonus = server_authority_private.shiny_power_bonus_for_level(level),
    shiny_stats_bonus = server_authority_private.shiny_stats_bonus_for_level(level),
    max_hp = max_hp + server_authority_private.shiny_hp_bonus_for_level(level),
    max_power = max_power + server_authority_private.shiny_power_bonus_for_level(level),
    max_stats = max_stats + server_authority_private.shiny_stats_bonus_for_level(level),
    base_stats = case when level = 56 then 53 else base_stats end
where catalog_release_id = (
  select id from public.catalog_release where version = 'revival-baseline'
);

insert into public.catalog_progression_rule(
  catalog_release_id, rule_family, rule_key, sort_order, rules
)
select id, 'constant', 'shiny_odds_denominator', 7, '{"value":2000}'::jsonb
from public.catalog_release where version = 'revival-baseline'
on conflict(catalog_release_id, rule_family, rule_key) do update
set sort_order = excluded.sort_order, rules = excluded.rules;

select server_authority_private.finish_game_data_change();

alter table public.catalog_level_rule
  alter column normal_max_hp set not null,
  alter column normal_max_power set not null,
  alter column normal_max_stats set not null,
  alter column shiny_hp_bonus set not null,
  alter column shiny_power_bonus set not null,
  alter column shiny_stats_bonus set not null,
  add constraint catalog_level_rule_normal_max_hp_check check (normal_max_hp > 0),
  add constraint catalog_level_rule_normal_max_power_check check (normal_max_power >= 0),
  add constraint catalog_level_rule_normal_max_stats_check check (normal_max_stats >= 0),
  add constraint catalog_level_rule_shiny_hp_bonus_check check (shiny_hp_bonus between 0 and 20),
  add constraint catalog_level_rule_shiny_power_bonus_check check (shiny_power_bonus between 0 and 15),
  add constraint catalog_level_rule_shiny_stats_bonus_check check (shiny_stats_bonus between 0 and 15),
  add constraint catalog_level_rule_absolute_caps_check check (
    max_hp = normal_max_hp + shiny_hp_bonus
    and max_power = normal_max_power + shiny_power_bonus
    and max_stats = normal_max_stats + shiny_stats_bonus
  );

create or replace function server_authority_private.pokemon_shiny_origin_level(p_state jsonb)
returns integer
language sql
immutable
set search_path = pg_temp
as $$
  select case
    when coalesce(p_state ->> 'sh', '0') = '1'
      and coalesce(p_state ->> 'shl', '') ~ '^[0-9]+$'
      and (p_state ->> 'shl')::integer between 5 and 100
      then (p_state ->> 'shl')::integer
    else null
  end
$$;

create or replace function server_authority_private.pokemon_stat_caps(
  p_catalog_release_id uuid,
  p_state jsonb
) returns table(max_hp integer, max_power integer, max_stats integer)
language sql
stable
security definer
set search_path = public, server_authority_private, pg_temp
as $$
  select current_rule.normal_max_hp + coalesce(origin_rule.shiny_hp_bonus, 0),
         current_rule.normal_max_power + coalesce(origin_rule.shiny_power_bonus, 0),
         current_rule.normal_max_stats + coalesce(origin_rule.shiny_stats_bonus, 0)
  from public.catalog_level_rule current_rule
  left join public.catalog_level_rule origin_rule
    on origin_rule.catalog_release_id = current_rule.catalog_release_id
   and origin_rule.level = server_authority_private.pokemon_shiny_origin_level(p_state)
  where current_rule.catalog_release_id = p_catalog_release_id
    and current_rule.level = server_authority_private.edge_jsonb_bigint(p_state -> 'l')
$$;

create or replace function server_authority_private.pokemon_max_hp_for_instance(
  p_pokemon_instance_id uuid,
  p_level integer
) returns integer
language sql
stable
security definer
set search_path = public, server_authority_private, pg_temp
as $$
  select caps.max_hp
  from public.player_pokemon_instance pokemon
  cross join lateral server_authority_private.pokemon_stat_caps(
    pokemon.catalog_release_id,
    jsonb_set(pokemon.state, '{l}', to_jsonb(p_level), true)
  ) caps
  where pokemon.id = p_pokemon_instance_id
$$;

create or replace function server_authority_private.pokemon_max_power_for_instance(
  p_pokemon_instance_id uuid,
  p_level integer
) returns integer
language sql
stable
security definer
set search_path = public, server_authority_private, pg_temp
as $$
  select caps.max_power
  from public.player_pokemon_instance pokemon
  cross join lateral server_authority_private.pokemon_stat_caps(
    pokemon.catalog_release_id,
    jsonb_set(pokemon.state, '{l}', to_jsonb(p_level), true)
  ) caps
  where pokemon.id = p_pokemon_instance_id
$$;

create or replace function server_authority_private.pokemon_max_stats_for_instance(
  p_pokemon_instance_id uuid,
  p_level integer
) returns integer
language sql
stable
security definer
set search_path = public, server_authority_private, pg_temp
as $$
  select caps.max_stats
  from public.player_pokemon_instance pokemon
  cross join lateral server_authority_private.pokemon_stat_caps(
    pokemon.catalog_release_id,
    jsonb_set(pokemon.state, '{l}', to_jsonb(p_level), true)
  ) caps
  where pokemon.id = p_pokemon_instance_id
$$;

create or replace function server_authority_private.validate_player_pokemon_shiny_state()
returns trigger
language plpgsql
security definer
set search_path = public, server_authority_private, pg_temp
as $$
declare
  v_origin integer;
  v_caps record;
  v_move jsonb;
begin
  v_origin := server_authority_private.pokemon_shiny_origin_level(new.state);
  if coalesce(new.state ->> 'sh', '0') = '1' then
    if v_origin is null then
      raise exception 'Shiny Pokemon state requires a valid acquisition level' using errcode = '22023';
    end if;
  elsif new.state ? 'sh' or new.state ? 'shl' then
    raise exception 'non-Shiny Pokemon state cannot contain Shiny metadata' using errcode = '22023';
  end if;

  if new.debug_created then
    return new;
  end if;
  select * into strict v_caps
  from server_authority_private.pokemon_stat_caps(new.catalog_release_id, new.state);
  if server_authority_private.edge_jsonb_bigint(new.state -> 'hp') not between 1 and v_caps.max_hp then
    raise exception 'Pokemon HP exceeds its acquisition-adjusted cap' using errcode = '22023';
  end if;
  for v_move in select value from jsonb_array_elements(new.state -> 'm') loop
    if server_authority_private.edge_jsonb_bigint(v_move -> 1) not between 0 and v_caps.max_power
      or server_authority_private.edge_jsonb_bigint(v_move -> 2) not between 0 and v_caps.max_stats then
      raise exception 'Pokemon move exceeds its acquisition-adjusted cap' using errcode = '22023';
    end if;
  end loop;
  return new;
end
$$;

create trigger validate_player_pokemon_shiny_state
before insert or update of catalog_release_id, state, debug_created
on public.player_pokemon_instance
for each row execute function server_authority_private.validate_player_pokemon_shiny_state();

create or replace function server_authority_private.active_encounter_projection(p_auth_user_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public, server_authority_private, extensions, pg_temp
as $$
  select (select jsonb_build_object(
    'encounter_id',e.id,'zone_key',e.zone_key,'current_hp',e.current_hp,
    'max_hp',e.max_hp,'search_mode',e.search_mode,'flute_choice',e.flute_choice,
    'battle_id',(select b.id from public.authoritative_battle b where b.encounter_id=e.id
      and b.status in ('active','needs_player_switch') limit 1),
    'pokemon',jsonb_build_object('s',e.species_key,'g',case e.gender_key when 'male' then 'male' when 'female' then 'female' else null end,
      'l',e.level,'hp',e.max_hp,'m',e.moves,'xp',0,
      'sh',case when e.is_shiny then 1 else 0 end,
      'shl',case when e.is_shiny then e.shiny_origin_level else null end,
      'catalog_release_id',e.catalog_release_id))
  from public.player_encounter e where e.auth_user_id=p_auth_user_id and e.status='active'
    and e.species_key is not null order by e.created_at desc limit 1)
$$;

do $patch_shiny_runtime_functions$
declare
  v_definition text;
  v_original text;
begin
  select pg_get_functiondef('public.start_wild_encounter_before_revision_guard(uuid,bigint,text,integer,jsonb,text)'::regprocedure)
  into v_definition;
  v_original := v_definition;
  v_definition := replace(v_definition,
    'v_level_rule public.catalog_level_rule%rowtype;',
    'v_level_rule public.catalog_level_rule%rowtype;' || E'\n  v_shiny_odds integer;\n  v_is_shiny boolean;');
  v_definition := replace(v_definition,
    'v_max_hp := v_level_rule.base_hp - floor(random() * (v_hp_delta + 1))::integer;',
    $replacement$select (rule.rules ->> 'value')::integer into v_shiny_odds
  from public.catalog_progression_rule rule
  where rule.catalog_release_id = v_profile.catalog_release_id
    and rule.rule_family = 'constant' and rule.rule_key = 'shiny_odds_denominator'
    and jsonb_typeof(rule.rules -> 'value') = 'number';
  if v_shiny_odds is null or v_shiny_odds <= 0 then
    raise exception 'Shiny odds catalog rule is incomplete';
  end if;
  v_is_shiny := floor(random() * v_shiny_odds)::integer = 0;
  v_max_hp := v_level_rule.base_hp - floor(random() * (v_hp_delta + 1))::integer
    + case when v_is_shiny then v_level_rule.shiny_hp_bonus else 0 end;$replacement$);
  v_definition := replace(v_definition,
    'v_level_rule.base_power - floor(random()',
    '(v_level_rule.base_power + case when v_is_shiny then v_level_rule.shiny_power_bonus else 0 end) - floor(random()');
  v_definition := replace(v_definition,
    'v_level_rule.base_stats - floor(random()',
    '(v_level_rule.base_stats + case when v_is_shiny then v_level_rule.shiny_stats_bonus else 0 end) - floor(random()');
  v_definition := replace(v_definition,
    'species_key, level, gender_key, rarity_key, max_hp, current_hp, moves, search_mode, flute_choice',
    'species_key, level, gender_key, rarity_key, max_hp, current_hp, moves, search_mode, flute_choice, is_shiny, shiny_origin_level');
  v_definition := replace(v_definition,
    'v_moves, p_search_mode, v_flute_choice',
    'v_moves, p_search_mode, v_flute_choice, v_is_shiny, case when v_is_shiny then v_level else null end');
  if v_definition = v_original then
    raise exception 'wild encounter function no longer matches the expected definition' using errcode = '55000';
  end if;
  execute v_definition;

  select pg_get_functiondef('public.start_edge_capture_battle_before_ordinary_guard(uuid,uuid,bigint,uuid,uuid,integer,text,text)'::regprocedure)
  into v_definition;
  v_original := v_definition;
  v_definition := replace(v_definition,
    $needle$case v_encounter.gender_key when 'male' then 'male' when 'female' then 'female' else null end)$needle$,
    $replacement$case v_encounter.gender_key when 'male' then 'male' when 'female' then 'female' else null end,
      'sh',case when v_encounter.is_shiny then 1 else 0 end,
      'shl',case when v_encounter.is_shiny then v_encounter.shiny_origin_level else null end)$replacement$);
  if v_definition = v_original then
    raise exception 'capture battle function no longer matches the expected definition' using errcode = '55000';
  end if;
  execute v_definition;

  select pg_get_functiondef('server_authority_private.prepare_edge_battle_command_core(uuid,uuid)'::regprocedure)
  into v_definition;
  v_original := v_definition;
  v_definition := replace(v_definition,
    $needle$'is_mega', coalesce($needle$,
    $replacement$'shiny_origin_level', coalesce(server_authority_private.edge_jsonb_bigint(participant.source_snapshot -> 'shl'), participant.level),
        'is_mega', coalesce($replacement$);
  if v_definition = v_original then
    raise exception 'battle preparation function no longer matches the expected definition' using errcode = '55000';
  end if;
  execute v_definition;

  select pg_get_functiondef('server_authority_private.authoritative_battle_projection_before_reward_status(uuid,uuid)'::regprocedure)
  into v_definition;
  v_original := v_definition;
  v_definition := replace(v_definition,
    $needle$'moves', participant.moves$needle$,
    $replacement$'moves', participant.moves,
          'gender', participant.source_snapshot ->> 'g',
          'is_shiny', coalesce(server_authority_private.edge_jsonb_bigint(participant.source_snapshot -> 'sh'), 0) = 1,
          'shiny_origin_level', coalesce(server_authority_private.edge_jsonb_bigint(participant.source_snapshot -> 'shl'), participant.level),
          'is_mega', coalesce(server_authority_private.edge_jsonb_bigint(participant.source_snapshot -> 'mg'), 0) = 1$replacement$);
  if v_definition = v_original then
    raise exception 'battle projection function no longer matches the expected definition' using errcode = '55000';
  end if;
  execute v_definition;
end
$patch_shiny_runtime_functions$;

do $patch_shiny_progression_caps$
declare
  v_definition text;
  v_original text;
begin
  select pg_get_functiondef('server_authority_private.training_level_move_offers(uuid,uuid,uuid,text,integer,jsonb)'::regprocedure)
  into v_definition;
  v_original := v_definition;
  v_definition := replace(v_definition, 'level_rule.max_power',
    'server_authority_private.pokemon_max_power_for_instance(p_pokemon_instance_id, p_level)');
  v_definition := replace(v_definition, 'level_rule.max_stats',
    'server_authority_private.pokemon_max_stats_for_instance(p_pokemon_instance_id, p_level)');
  if v_definition = v_original then raise exception 'training move offers no longer match expected caps' using errcode='55000'; end if;
  execute v_definition;

  select pg_get_functiondef('server_authority_private.advance_training_progression(uuid,uuid,bigint)'::regprocedure)
  into v_definition;
  v_original := v_definition;
  v_definition := replace(v_definition, 'v_rule.max_hp',
    'server_authority_private.pokemon_max_hp_for_instance(v_instance.id, v_segment_level)');
  v_definition := replace(v_definition, 'v_rule.max_power',
    'server_authority_private.pokemon_max_power_for_instance(v_instance.id, v_segment_level)');
  v_definition := replace(v_definition, 'v_rule.max_stats',
    'server_authority_private.pokemon_max_stats_for_instance(v_instance.id, v_segment_level)');
  if v_definition = v_original then raise exception 'training progression no longer matches expected caps' using errcode='55000'; end if;
  execute v_definition;

  select pg_get_functiondef('server_authority_private.advance_ordinary_progression(uuid,uuid,bigint)'::regprocedure)
  into v_definition;
  v_original := v_definition;
  v_definition := replace(v_definition, 'v_rule.max_hp',
    'server_authority_private.pokemon_max_hp_for_instance(v_instance.id, v_level)');
  v_definition := replace(v_definition, 'v_rule.max_power',
    'server_authority_private.pokemon_max_power_for_instance(v_instance.id, v_level)');
  v_definition := replace(v_definition, 'v_rule.max_stats',
    'server_authority_private.pokemon_max_stats_for_instance(v_instance.id, v_level)');
  if v_definition = v_original then raise exception 'ordinary progression no longer matches expected caps' using errcode='55000'; end if;
  execute v_definition;

  select pg_get_functiondef('public.resolve_edge_ordinary_progression(uuid,uuid,bigint,uuid,jsonb)'::regprocedure)
  into v_definition;
  v_original := v_definition;
  v_definition := replace(v_definition, 'v_rule.max_power',
    $replacement$server_authority_private.pokemon_max_power_for_instance(v_instance.id, (v_resolution.options->>'level')::integer)$replacement$);
  v_definition := replace(v_definition, 'v_rule.max_stats',
    $replacement$server_authority_private.pokemon_max_stats_for_instance(v_instance.id, (v_resolution.options->>'level')::integer)$replacement$);
  if v_definition = v_original then raise exception 'ordinary resolution no longer matches expected caps' using errcode='55000'; end if;
  execute v_definition;

  select pg_get_functiondef('public.execute_pokemon_center_command_before_ordinary_guard(uuid,bigint,uuid,text,integer,integer,text)'::regprocedure)
  into v_definition;
  v_original := v_definition;
  v_definition := replace(v_definition, 'v_level_rule.max_hp',
    $replacement$server_authority_private.pokemon_max_hp_for_instance(v_instance.id, (v_instance.state->>'l')::integer)$replacement$);
  v_definition := replace(v_definition, 'v_level_rule.max_power',
    $replacement$server_authority_private.pokemon_max_power_for_instance(v_instance.id, (v_instance.state->>'l')::integer)$replacement$);
  v_definition := replace(v_definition, 'v_level_rule.max_stats',
    $replacement$server_authority_private.pokemon_max_stats_for_instance(v_instance.id, (v_instance.state->>'l')::integer)$replacement$);
  if v_definition = v_original then raise exception 'Pokemon Center no longer matches expected caps' using errcode='55000'; end if;
  execute v_definition;
end
$patch_shiny_progression_caps$;

do $patch_debug_shiny$
declare
  v_definition text;
  v_original text;
begin
  select pg_get_functiondef('public.execute_debug_command_before_ordinary_guard(uuid,uuid,bigint,text,jsonb)'::regprocedure)
  into v_definition;
  v_original := v_definition;
  v_definition := replace(v_definition, 'v_stats integer;', 'v_stats integer;' || E'\n  v_is_shiny boolean;');
  v_definition := replace(v_definition,
    $needle$(select count(*) from jsonb_object_keys(p_payload)) <> 5$needle$,
    $replacement$(select count(*) from jsonb_object_keys(p_payload)) <> 6$replacement$);
  v_definition := replace(v_definition,
    $needle$array['speciesKey', 'level', 'maxHp', 'heldItemIndex', 'moves']$needle$,
    $replacement$array['speciesKey', 'level', 'maxHp', 'heldItemIndex', 'moves', 'isShiny']$replacement$);
  v_definition := replace(v_definition,
    $needle$v_moves := p_payload -> 'moves';$needle$,
    $replacement$v_moves := p_payload -> 'moves';
    if jsonb_typeof(p_payload -> 'isShiny') is distinct from 'boolean' then
      raise exception 'Shiny flag must be boolean' using errcode = '22023';
    end if;
    v_is_shiny := (p_payload ->> 'isShiny')::boolean;$replacement$);
  v_definition := replace(v_definition,
    $needle$v_state := jsonb_build_object('s', v_species_key, 'g', null, 'l', v_level, 'hp', v_max_hp, 'm', v_moves, 'xp', 0);$needle$,
    $replacement$v_state := jsonb_build_object('s', v_species_key, 'g', null, 'l', v_level, 'hp', v_max_hp, 'm', v_moves, 'xp', 0);
    if v_is_shiny then v_state := v_state || jsonb_build_object('sh', 1, 'shl', v_level); end if;$replacement$);
  if v_definition = v_original then
    raise exception 'debug Pokemon function no longer matches the expected definition' using errcode = '55000';
  end if;
  execute v_definition;
end
$patch_debug_shiny$;

create or replace function server_authority_private.finish_capture_success(
  p_auth_user_id uuid,
  p_battle_id uuid,
  p_command_id uuid,
  p_command_hash text,
  p_item_index integer,
  p_result jsonb
) returns jsonb
language plpgsql
security definer
set search_path = public, server_authority_private, pg_temp
as $$
declare
  v_battle public.authoritative_battle%rowtype;
  v_encounter public.player_encounter%rowtype;
  v_instance uuid := gen_random_uuid();
  v_state jsonb;
  v_count integer;
  v_species_count integer;
  v_slot integer;
  v_box bigint;
  v_place text;
  v_revision bigint;
  v_receipt public.player_command_receipt%rowtype;
  v_player jsonb;
  v_result jsonb := p_result;
begin
  select * into strict v_battle from public.authoritative_battle
  where id=p_battle_id and auth_user_id=p_auth_user_id for update;
  select * into strict v_encounter from public.player_encounter
  where id=v_battle.encounter_id and auth_user_id=p_auth_user_id for update;
  if v_encounter.status <> 'active' then
    raise exception 'L''incontro associato non e piu attivo.' using errcode='40001';
  end if;
  v_state := jsonb_build_object(
    's',v_encounter.species_key,
    'g',case v_encounter.gender_key when 'male' then 'male' when 'female' then 'female' else null end,
    'l',v_encounter.level,'hp',v_encounter.max_hp,'m',v_encounter.moves,'xp',0
  );
  if v_encounter.is_shiny then
    v_state := v_state || jsonb_build_object('sh',1,'shl',v_encounter.shiny_origin_level);
  end if;
  insert into public.player_pokemon_instance(id,auth_user_id,catalog_release_id,species_key,state_version,state,revision)
  values(v_instance,p_auth_user_id,v_encounter.catalog_release_id,v_encounter.species_key,1,v_state,1);
  select count(*) into v_count from public.player_pokemon_placement
  where auth_user_id=p_auth_user_id and placement_type='team';
  select count(*) into v_species_count from public.player_pokemon_placement p
  join public.player_pokemon_instance i on i.id=p.pokemon_instance_id
  where p.auth_user_id=p_auth_user_id and p.placement_type='team' and i.species_key=v_encounter.species_key;
  if v_count<6 and v_species_count<2 then
    select slot into v_slot from generate_series(0,5) slot where not exists(
      select 1 from public.player_pokemon_placement
      where auth_user_id=p_auth_user_id and placement_type='team' and slot_index=slot
    ) order by slot limit 1;
    insert into public.player_pokemon_placement(pokemon_instance_id,auth_user_id,placement_type,slot_index,box_index)
    values(v_instance,p_auth_user_id,'team',v_slot,null);
    v_place:='team';
  else
    insert into public.player_box_index_state(auth_user_id,next_box_index)
    select p_auth_user_id,coalesce(max(box_index),-1)::bigint+1 from public.player_pokemon_placement
    where auth_user_id=p_auth_user_id and placement_type='box' on conflict(auth_user_id) do nothing;
    select next_box_index into v_box from public.player_box_index_state where auth_user_id=p_auth_user_id for update;
    select greatest(v_box,coalesce(max(box_index),-1)::bigint+1) into v_box from public.player_pokemon_placement
    where auth_user_id=p_auth_user_id and placement_type='box';
    if v_box>2147483647 then raise exception 'box index limit exceeded' using errcode='22003'; end if;
    update public.player_box_index_state set next_box_index=v_box+1,updated_at=now() where auth_user_id=p_auth_user_id;
    insert into public.player_pokemon_placement(pokemon_instance_id,auth_user_id,placement_type,slot_index,box_index)
    values(v_instance,p_auth_user_id,'box',null,v_box::integer);
    v_place:='box';
  end if;
  insert into public.player_dex_entry(auth_user_id,catalog_release_id,species_key)
  values(p_auth_user_id,v_encounter.catalog_release_id,v_encounter.species_key) on conflict do nothing;
  update public.player_encounter set status='consumed',consumed_at=now(),captured_pokemon_instance_id=v_instance
  where id=v_encounter.id;
  update public.authoritative_battle set result_key='pokemon_captured' where id=p_battle_id;
  select revision into v_revision from public.player_state_revision where auth_user_id=p_auth_user_id;
  v_player:=server_authority_private.player_state_projection(p_auth_user_id);
  v_result:=jsonb_set(v_result,'{battle,result_key}',to_jsonb('pokemon_captured'::text),true)
    ||jsonb_build_object('capture_success',true,'placement',v_place,'pokemon_instance_id',v_instance,'player_state',v_player);
  insert into public.player_command_receipt(auth_user_id,command_id,command_type,request_hash,result,resulting_revision)
  values(p_auth_user_id,p_command_id,'wild_capture_attempt',p_command_hash,
    jsonb_build_object('capture_success',true,'pokemon_instance_id',v_instance,'item_index',p_item_index,'battle_id',p_battle_id),v_revision)
  returning * into v_receipt;
  v_player:=server_authority_private.player_state_projection(p_auth_user_id);
  v_result:=jsonb_set(v_result,'{player_state}',v_player,true);
  update public.authoritative_battle_command_receipt set command_type='ball',result=v_result
  where auth_user_id=p_auth_user_id and command_id=p_command_id;
  return v_result;
end
$$;

revoke all on function server_authority_private.shiny_hp_bonus_for_level(integer) from public;
revoke all on function server_authority_private.shiny_power_bonus_for_level(integer) from public;
revoke all on function server_authority_private.shiny_stats_bonus_for_level(integer) from public;
revoke all on function server_authority_private.pokemon_shiny_origin_level(jsonb) from public;
revoke all on function server_authority_private.pokemon_stat_caps(uuid,jsonb) from public;
revoke all on function server_authority_private.pokemon_max_hp_for_instance(uuid,integer) from public;
revoke all on function server_authority_private.pokemon_max_power_for_instance(uuid,integer) from public;
revoke all on function server_authority_private.pokemon_max_stats_for_instance(uuid,integer) from public;
revoke all on function server_authority_private.validate_player_pokemon_shiny_state() from public;
revoke all on function server_authority_private.finish_capture_success(uuid,uuid,uuid,text,integer,jsonb) from public;

comment on column public.player_encounter.is_shiny is
  'True only when the authoritative wild encounter won its configured Shiny roll.';
comment on column public.player_encounter.shiny_origin_level is
  'Acquisition level that permanently determines this Shiny Pokemon bonus.';
comment on function server_authority_private.pokemon_stat_caps(uuid,jsonb) is
  'Returns normal caps plus the immutable acquisition-level Shiny bonus encoded in sh/shl.';

insert into public.catalog_engine_runtime_binding(
  catalog_release_id, engine_version, engine_checksum, enabled
)
select id, 'pokemon-game-revival', '429840015afd63fa0679c5c10b4d7d1f3c1f6a94552feb2b3b34ab4991aece4a', true
from public.catalog_release
where version = 'revival-baseline'
on conflict(catalog_release_id, engine_version, engine_checksum)
do update set enabled = true;

commit;
