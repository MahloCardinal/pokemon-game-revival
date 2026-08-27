begin;

drop trigger if exists validate_player_pokemon_shiny_state
on public.player_pokemon_instance;

-- The acquisition bonus is already part of the persisted values. Remove the
-- redundant acquisition-level marker without changing HP, Power or Stats.
update public.player_pokemon_instance
set state = state - 'shl'
where state ? 'shl';

alter table public.catalog_level_rule
  drop constraint catalog_level_rule_absolute_caps_check,
  add column legendary_hp_bonus integer,
  add column legendary_power_bonus integer,
  add column legendary_stats_bonus integer;

create or replace function server_authority_private.legendary_hp_bonus_for_level(p_level integer)
returns integer
language sql
immutable
set search_path = pg_temp
as $$
  select case when p_level >= 60 then 80
    else round(80 * greatest(1, p_level)::numeric / 60)::integer end
$$;

create or replace function server_authority_private.legendary_power_bonus_for_level(p_level integer)
returns integer
language sql
immutable
set search_path = pg_temp
as $$
  select case when p_level >= 60 then 65
    else round(65 * greatest(1, p_level)::numeric / 60)::integer end
$$;

create or replace function server_authority_private.legendary_stats_bonus_for_level(p_level integer)
returns integer
language sql
immutable
set search_path = pg_temp
as $$
  select case when p_level >= 60 then 65
    else round(65 * greatest(1, p_level)::numeric / 60)::integer end
$$;

select server_authority_private.begin_game_data_change(
  p_label => 'Use current-level Shiny caps and add Legendary stat bonuses',
  p_affected_families => array['combat-rules']::text[],
  p_source_checksums => jsonb_build_object(
    'app/data/stat-tables.js', 'bdd0843b1536976dcc925cc44c83cfe98c8c8b65739df84379fdd59483047c0b'
  ),
  p_requires_battle_idle => true
);

update public.catalog_level_rule
set legendary_hp_bonus = server_authority_private.legendary_hp_bonus_for_level(level),
    legendary_power_bonus = server_authority_private.legendary_power_bonus_for_level(level),
    legendary_stats_bonus = server_authority_private.legendary_stats_bonus_for_level(level),
    max_hp = normal_max_hp + shiny_hp_bonus
      + server_authority_private.legendary_hp_bonus_for_level(level),
    max_power = normal_max_power + shiny_power_bonus
      + server_authority_private.legendary_power_bonus_for_level(level),
    max_stats = normal_max_stats + shiny_stats_bonus
      + server_authority_private.legendary_stats_bonus_for_level(level)
where catalog_release_id = (
  select id from public.catalog_release where version = 'revival-baseline'
);

select server_authority_private.finish_game_data_change();

alter table public.catalog_level_rule
  alter column legendary_hp_bonus set not null,
  alter column legendary_power_bonus set not null,
  alter column legendary_stats_bonus set not null,
  add constraint catalog_level_rule_legendary_hp_bonus_check
    check (legendary_hp_bonus between 0 and 80),
  add constraint catalog_level_rule_legendary_power_bonus_check
    check (legendary_power_bonus between 0 and 65),
  add constraint catalog_level_rule_legendary_stats_bonus_check
    check (legendary_stats_bonus between 0 and 65),
  add constraint catalog_level_rule_absolute_caps_check check (
    max_hp = normal_max_hp + shiny_hp_bonus + legendary_hp_bonus
    and max_power = normal_max_power + shiny_power_bonus + legendary_power_bonus
    and max_stats = normal_max_stats + shiny_stats_bonus + legendary_stats_bonus
  );

create or replace function server_authority_private.pokemon_stat_caps(
  p_catalog_release_id uuid,
  p_state jsonb
) returns table(max_hp integer, max_power integer, max_stats integer)
language sql
stable
security definer
set search_path = public, server_authority_private, pg_temp
as $$
  select rule.normal_max_hp
           + case when coalesce(p_state ->> 'sh', '0') = '1' then rule.shiny_hp_bonus else 0 end
           + case when species.encounter_rarity_key = 'legendary' then rule.legendary_hp_bonus else 0 end,
         rule.normal_max_power
           + case when coalesce(p_state ->> 'sh', '0') = '1' then rule.shiny_power_bonus else 0 end
           + case when species.encounter_rarity_key = 'legendary' then rule.legendary_power_bonus else 0 end,
         rule.normal_max_stats
           + case when coalesce(p_state ->> 'sh', '0') = '1' then rule.shiny_stats_bonus else 0 end
           + case when species.encounter_rarity_key = 'legendary' then rule.legendary_stats_bonus else 0 end
  from public.catalog_level_rule rule
  join public.catalog_species species
    on species.catalog_release_id = rule.catalog_release_id
   and species.species_key = p_state ->> 's'
  where rule.catalog_release_id = p_catalog_release_id
    and rule.level = server_authority_private.edge_jsonb_bigint(p_state -> 'l')
$$;

create or replace function server_authority_private.validate_player_pokemon_shiny_state()
returns trigger
language plpgsql
security definer
set search_path = public, server_authority_private, pg_temp
as $$
declare
  v_caps record;
  v_move jsonb;
begin
  if new.state ? 'shl' then
    raise exception 'Pokemon state cannot contain a Shiny acquisition level' using errcode = '22023';
  end if;
  if new.state ? 'sh'
    and coalesce(server_authority_private.edge_jsonb_bigint(new.state -> 'sh'), 0) <> 1 then
    raise exception 'Shiny Pokemon state flag is invalid' using errcode = '22023';
  end if;

  if new.debug_created then
    return new;
  end if;
  select * into strict v_caps
  from server_authority_private.pokemon_stat_caps(new.catalog_release_id, new.state);
  if server_authority_private.edge_jsonb_bigint(new.state -> 'hp') not between 1 and v_caps.max_hp then
    raise exception 'Pokemon HP exceeds its rarity-adjusted cap' using errcode = '22023';
  end if;
  for v_move in select value from jsonb_array_elements(new.state -> 'm') loop
    if server_authority_private.edge_jsonb_bigint(v_move -> 1) not between 0 and v_caps.max_power
      or server_authority_private.edge_jsonb_bigint(v_move -> 2) not between 0 and v_caps.max_stats then
      raise exception 'Pokemon move exceeds its rarity-adjusted cap' using errcode = '22023';
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
      'catalog_release_id',e.catalog_release_id))
  from public.player_encounter e where e.auth_user_id=p_auth_user_id and e.status='active'
    and e.species_key is not null order by e.created_at desc limit 1)
$$;

do $patch_current_level_shiny_and_legendary$
declare
  v_definition text;
begin
  select pg_get_functiondef('public.start_wild_encounter_before_revision_guard(uuid,bigint,text,integer,jsonb,text)'::regprocedure)
  into v_definition;
  if strpos(v_definition, ' + case when v_is_shiny then v_level_rule.shiny_hp_bonus else 0 end;') = 0 then
    raise exception 'wild encounter HP generation no longer matches the expected definition' using errcode = '55000';
  end if;
  v_definition := replace(v_definition,
    ' + case when v_is_shiny then v_level_rule.shiny_hp_bonus else 0 end;',
    ' + case when v_is_shiny then v_level_rule.shiny_hp_bonus else 0 end' || E'\n    + case when v_species.encounter_rarity_key = ''legendary'' then v_level_rule.legendary_hp_bonus else 0 end;');
  if strpos(v_definition, '(v_level_rule.base_power + case when v_is_shiny then v_level_rule.shiny_power_bonus else 0 end) - floor(random()') = 0 then
    raise exception 'wild encounter Power generation no longer matches the expected definition' using errcode = '55000';
  end if;
  v_definition := replace(v_definition,
    '(v_level_rule.base_power + case when v_is_shiny then v_level_rule.shiny_power_bonus else 0 end) - floor(random()',
    '(v_level_rule.base_power + case when v_is_shiny then v_level_rule.shiny_power_bonus else 0 end + case when v_species.encounter_rarity_key = ''legendary'' then v_level_rule.legendary_power_bonus else 0 end) - floor(random()');
  if strpos(v_definition, '(v_level_rule.base_stats + case when v_is_shiny then v_level_rule.shiny_stats_bonus else 0 end) - floor(random()') = 0 then
    raise exception 'wild encounter Stats generation no longer matches the expected definition' using errcode = '55000';
  end if;
  v_definition := replace(v_definition,
    '(v_level_rule.base_stats + case when v_is_shiny then v_level_rule.shiny_stats_bonus else 0 end) - floor(random()',
    '(v_level_rule.base_stats + case when v_is_shiny then v_level_rule.shiny_stats_bonus else 0 end + case when v_species.encounter_rarity_key = ''legendary'' then v_level_rule.legendary_stats_bonus else 0 end) - floor(random()');
  if strpos(v_definition, 'search_mode, flute_choice, is_shiny, shiny_origin_level') = 0
    or strpos(v_definition, 'v_flute_choice, v_is_shiny, case when v_is_shiny then v_level else null end') = 0 then
    raise exception 'wild encounter Shiny persistence no longer matches the expected definition' using errcode = '55000';
  end if;
  v_definition := replace(v_definition,
    'search_mode, flute_choice, is_shiny, shiny_origin_level',
    'search_mode, flute_choice, is_shiny');
  v_definition := replace(v_definition,
    'v_flute_choice, v_is_shiny, case when v_is_shiny then v_level else null end',
    'v_flute_choice, v_is_shiny');
  begin
    execute v_definition;
  exception when others then
    raise exception 'wild encounter patch failed: %', sqlerrm using errcode = sqlstate;
  end;

  select pg_get_functiondef('public.start_edge_capture_battle_before_ordinary_guard(uuid,uuid,bigint,uuid,uuid,integer,text,text)'::regprocedure)
  into v_definition;
  if strpos(v_definition, E'''sh'',case when v_encounter.is_shiny then 1 else 0 end,\n      ''shl'',case when v_encounter.is_shiny then v_encounter.shiny_origin_level else null end') = 0 then
    raise exception 'capture battle Shiny snapshot no longer matches the expected definition' using errcode = '55000';
  end if;
  v_definition := replace(v_definition,
    E'''sh'',case when v_encounter.is_shiny then 1 else 0 end,\n      ''shl'',case when v_encounter.is_shiny then v_encounter.shiny_origin_level else null end',
    '''sh'',case when v_encounter.is_shiny then 1 else 0 end');
  begin
    execute v_definition;
  exception when others then
    raise exception 'capture battle patch failed: %', sqlerrm using errcode = sqlstate;
  end;

  select pg_get_functiondef('server_authority_private.prepare_edge_battle_command_core(uuid,uuid)'::regprocedure)
  into v_definition;
  if strpos(v_definition, E'''shiny_origin_level'', coalesce(server_authority_private.edge_jsonb_bigint(participant.source_snapshot -> ''shl''), participant.level),\n        ') = 0 then
    raise exception 'battle preparation Shiny metadata no longer matches the expected definition' using errcode = '55000';
  end if;
  v_definition := replace(v_definition,
    E'''shiny_origin_level'', coalesce(server_authority_private.edge_jsonb_bigint(participant.source_snapshot -> ''shl''), participant.level),\n        ', '');
  begin
    execute v_definition;
  exception when others then
    raise exception 'battle preparation patch failed: %', sqlerrm using errcode = sqlstate;
  end;

  select pg_get_functiondef('server_authority_private.authoritative_battle_projection_before_reward_status(uuid,uuid)'::regprocedure)
  into v_definition;
  if strpos(v_definition, E'''shiny_origin_level'', coalesce(server_authority_private.edge_jsonb_bigint(participant.source_snapshot -> ''shl''), participant.level),\n          ') = 0 then
    raise exception 'battle projection Shiny metadata no longer matches the expected definition' using errcode = '55000';
  end if;
  v_definition := replace(v_definition,
    E'''shiny_origin_level'', coalesce(server_authority_private.edge_jsonb_bigint(participant.source_snapshot -> ''shl''), participant.level),\n          ', '');
  begin
    execute v_definition;
  exception when others then
    raise exception 'battle projection patch failed: %', sqlerrm using errcode = sqlstate;
  end;

  select pg_get_functiondef('public.execute_debug_command_before_ordinary_guard(uuid,uuid,bigint,text,jsonb)'::regprocedure)
  into v_definition;
  if strpos(v_definition, 'jsonb_build_object(''sh'', 1, ''shl'', v_level)') = 0 then
    raise exception 'debug Shiny state no longer matches the expected definition' using errcode = '55000';
  end if;
  v_definition := replace(v_definition,
    'jsonb_build_object(''sh'', 1, ''shl'', v_level)',
    'jsonb_build_object(''sh'', 1)');
  begin
    execute v_definition;
  exception when others then
    raise exception 'debug Pokemon patch failed: %', sqlerrm using errcode = sqlstate;
  end;

  select pg_get_functiondef('public.claim_player_mission_before_revision_guard(uuid,bigint,integer,integer,text)'::regprocedure)
  into v_definition;
  if strpos(v_definition, 'v_base_hp := coalesce(v_rule.base_hp, v_rule_60.base_hp + greatest(0, v_level - 60) * 3);') = 0
    or strpos(v_definition, 'v_base_power := coalesce(v_rule.base_power, v_rule_60.base_power + greatest(0, v_level - 60) * 2);') = 0
    or strpos(v_definition, 'v_base_stats := coalesce(v_rule.base_stats, v_rule_60.base_stats + greatest(0, v_level - 60) * 2);') = 0 then
    raise exception 'mission Pokemon generation no longer matches the expected definition' using errcode = '55000';
  end if;
  v_definition := replace(v_definition,
    'v_base_hp := coalesce(v_rule.base_hp, v_rule_60.base_hp + greatest(0, v_level - 60) * 3);',
    'v_base_hp := coalesce(v_rule.base_hp, v_rule_60.base_hp + greatest(0, v_level - 60) * 3)' || E'\n      + case when exists (select 1 from public.catalog_species where catalog_release_id = v_profile.catalog_release_id and species_key = v_species_key and encounter_rarity_key = ''legendary'') then server_authority_private.legendary_hp_bonus_for_level(v_level) else 0 end;');
  v_definition := replace(v_definition,
    'v_base_power := coalesce(v_rule.base_power, v_rule_60.base_power + greatest(0, v_level - 60) * 2);',
    'v_base_power := coalesce(v_rule.base_power, v_rule_60.base_power + greatest(0, v_level - 60) * 2)' || E'\n      + case when exists (select 1 from public.catalog_species where catalog_release_id = v_profile.catalog_release_id and species_key = v_species_key and encounter_rarity_key = ''legendary'') then server_authority_private.legendary_power_bonus_for_level(v_level) else 0 end;');
  v_definition := replace(v_definition,
    'v_base_stats := coalesce(v_rule.base_stats, v_rule_60.base_stats + greatest(0, v_level - 60) * 2);',
    'v_base_stats := coalesce(v_rule.base_stats, v_rule_60.base_stats + greatest(0, v_level - 60) * 2)' || E'\n      + case when exists (select 1 from public.catalog_species where catalog_release_id = v_profile.catalog_release_id and species_key = v_species_key and encounter_rarity_key = ''legendary'') then server_authority_private.legendary_stats_bonus_for_level(v_level) else 0 end;');
  begin
    execute v_definition;
  exception when others then
    raise exception 'mission Pokemon patch failed: %', sqlerrm using errcode = sqlstate;
  end;
end
$patch_current_level_shiny_and_legendary$;

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
    v_state := v_state || jsonb_build_object('sh',1);
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

alter table public.player_encounter
  drop constraint player_encounter_shiny_origin_check,
  drop column shiny_origin_level;

drop function server_authority_private.pokemon_shiny_origin_level(jsonb);

revoke all on function server_authority_private.legendary_hp_bonus_for_level(integer) from public;
revoke all on function server_authority_private.legendary_power_bonus_for_level(integer) from public;
revoke all on function server_authority_private.legendary_stats_bonus_for_level(integer) from public;
revoke all on function server_authority_private.pokemon_stat_caps(uuid,jsonb) from public;
revoke all on function server_authority_private.validate_player_pokemon_shiny_state() from public;
revoke all on function server_authority_private.finish_capture_success(uuid,uuid,uuid,text,integer,jsonb) from public;

comment on column public.player_encounter.is_shiny is
  'True only when the authoritative wild encounter won its configured Shiny roll.';
comment on function server_authority_private.pokemon_stat_caps(uuid,jsonb) is
  'Returns normal caps plus current-level Shiny and species-rarity Legendary bonuses.';

insert into public.catalog_engine_runtime_binding(
  catalog_release_id, engine_version, engine_checksum, enabled
)
select id, 'pokemon-game-revival', 'ab45a29472ef41e96789f831196ce12fe74e05e596b8da7b543982d8ee2fda09', true
from public.catalog_release
where version = 'revival-baseline'
on conflict(catalog_release_id, engine_version, engine_checksum)
do update set enabled = true;

commit;
