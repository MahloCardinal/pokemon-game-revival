begin;

-- Packages identify deployed code; snapshot versions identify the state contract.
create table server_authority_private.runtime_package (
  catalog_release_id uuid not null references public.catalog_release(id),
  checksum text not null check (checksum ~ '^[0-9a-f]{64}$'),
  engine_version text not null,
  snapshot_version integer not null check(snapshot_version > 0),
  components jsonb not null check(jsonb_typeof(components)='object'),
  created_at timestamptz not null default now(),
  primary key(catalog_release_id,checksum)
);
create table server_authority_private.runtime_deployment (
  catalog_release_id uuid primary key references public.catalog_release(id),
  checksum text,
  generation bigint not null default 0,
  required_components text[] not null default '{}',
  updated_at timestamptz not null default now(),
  foreign key(catalog_release_id,checksum) references server_authority_private.runtime_package(catalog_release_id,checksum)
);
revoke all on server_authority_private.runtime_package,server_authority_private.runtime_deployment from public,anon,authenticated;

create function server_authority_private.runtime_transition_allowed(p_catalog uuid,p_version text,p_checksum text,p_snapshot jsonb,p_generation bigint default null)
returns boolean language plpgsql security definer set search_path=public,server_authority_private,pg_temp as $$
declare package server_authority_private.runtime_package%rowtype; deployment server_authority_private.runtime_deployment%rowtype;
begin
  if not pg_try_advisory_xact_lock_shared(hashtextextended('pokemon-game-revival:game-data-change',0)) then
    perform server_authority_private.raise_revision_conflict('runtime deployment is changing');
  end if;
  select * into deployment from server_authority_private.runtime_deployment where catalog_release_id=p_catalog;
  -- Before activation, the additive migration keeps the currently deployed Edge usable.
  if not found then
    return exists(select 1 from public.catalog_engine_runtime_binding where catalog_release_id=p_catalog
      and engine_version=p_version and engine_checksum=p_checksum and enabled);
  end if;
  if deployment.checksum is distinct from p_checksum or deployment.generation is distinct from p_generation then
    perform server_authority_private.raise_revision_conflict('runtime deployment changed; retry with the current Edge package');
  end if;
  select * into strict package from server_authority_private.runtime_package where catalog_release_id=p_catalog and checksum=p_checksum;
  if p_version is distinct from package.engine_version or (p_snapshot is not null and (
    p_snapshot->>'engineVersion' is distinct from package.engine_version
    or (p_snapshot->>'snapshotVersion')::integer is distinct from package.snapshot_version)) then
    raise exception 'battle snapshot requires an explicit state migration' using errcode='0A000';
  end if;
  perform set_config('server_authority.runtime_checksum',p_checksum,true);
  perform set_config('server_authority.runtime_components',package.components::text,true);
  perform set_config('server_authority.runtime_generation',deployment.generation::text,true);
  return true;
end;
$$;

create function server_authority_private.activate_runtime_package(p_manifest jsonb,p_activate boolean default true)
returns jsonb language plpgsql security definer set search_path=public,server_authority_private,pg_temp as $$
declare r uuid; v_checksum text:=p_manifest->>'bundleChecksum'; v_version integer:=(p_manifest->>'snapshotVersion')::integer;
  v_components jsonb; required text[]; prior server_authority_private.runtime_package%rowtype;
begin
  perform pg_advisory_xact_lock(hashtextextended('pokemon-game-revival:game-data-change',0));
  select id into strict r from public.catalog_release where catalog_release.version='revival-baseline' and status='published';
  if v_checksum is null or v_checksum !~ '^[0-9a-f]{64}$' or v_version is null or v_version<1
    or jsonb_typeof(p_manifest->'components') is distinct from 'object'
    or not ((p_manifest->'components') ?& array['encounters','initialization','battle_core','move_effects','consumable_items','held_items','capture','progression','opponents_rewards','presentation'])
    or (select count(*) from jsonb_object_keys(p_manifest->'components'))<>10
    or exists(select 1 from jsonb_each(p_manifest->'components') c where c.value->>'checksum' is null or c.value->>'checksum' !~ '^[0-9a-f]{64}$') then
    raise exception 'invalid component runtime manifest' using errcode='22023';
  end if;
  select jsonb_object_agg(key,value->'checksum') into v_components from jsonb_each(p_manifest->'components');
  select * into prior from server_authority_private.runtime_package where catalog_release_id=r and runtime_package.checksum=v_checksum;
  if found and (prior.snapshot_version<>v_version or (prior.components-'presentation') is distinct from (v_components-'presentation')) then
    raise exception 'a runtime checksum cannot identify different executable components' using errcode='22023';
  end if;
  if exists(select 1 from public.authoritative_battle where engine_snapshot is not null
    and (engine_snapshot->>'snapshotVersion')::integer<>v_version)
    or exists(select 1 from public.battle_dome_battle where engine_snapshot is not null
    and (engine_snapshot->>'snapshotVersion')::integer<>v_version) then
    raise exception 'existing snapshots require a state migration before activation' using errcode='55000';
  end if;
  insert into server_authority_private.runtime_package(catalog_release_id,checksum,engine_version,snapshot_version,components)
    values(r,v_checksum,'pokemon-game-revival',v_version,v_components)
    on conflict(catalog_release_id,checksum) do update set components=excluded.components;
  insert into public.catalog_engine_runtime_binding(catalog_release_id,engine_version,engine_checksum,enabled)
    values(r,'pokemon-game-revival',v_checksum,true)
    on conflict(catalog_release_id,engine_version,engine_checksum) do update set enabled=true;
  if p_activate then
  insert into server_authority_private.runtime_deployment(catalog_release_id,checksum,generation)
    values(r,v_checksum,1)
    on conflict(catalog_release_id) do update set checksum=excluded.checksum,generation=runtime_deployment.generation+1,
      required_components='{}',updated_at=now();
  end if;
  return jsonb_build_object('checksum',v_checksum,'components',v_components,'snapshot_version',v_version);
end;
$$;

create or replace function server_authority_private.pin_pending_battle_engine() returns trigger
language plpgsql security definer set search_path=public,server_authority_private,pg_temp as $$
begin
  if new.engine_runtime_state='pending' and new.requested_engine_version is null then
    select binding.engine_version,binding.engine_checksum into new.requested_engine_version,new.requested_engine_checksum
    from public.catalog_engine_runtime_binding binding
    left join server_authority_private.runtime_deployment deployment on deployment.catalog_release_id=binding.catalog_release_id
    where binding.catalog_release_id=new.catalog_release_id and binding.enabled
    order by (binding.engine_checksum=deployment.checksum) desc nulls last,binding.created_at desc limit 1;
    if new.requested_engine_checksum is null then raise exception 'pending battle has no enabled engine binding' using errcode='0A000';end if;
  end if;
  return new;
end;
$$;

create function server_authority_private.guard_runtime_snapshot() returns trigger
language plpgsql security definer set search_path=public,server_authority_private,pg_temp as $$
begin
  if new.engine_snapshot is not null and (tg_op='INSERT' or new.engine_snapshot is distinct from old.engine_snapshot) then
    perform server_authority_private.runtime_transition_allowed(new.catalog_release_id,new.engine_version,new.engine_checksum,new.engine_snapshot,nullif(current_setting('server_authority.runtime_generation',true),'')::bigint);
  end if;
  return new;
end;
$$;
create trigger runtime_snapshot_contract before insert or update of engine_snapshot on public.authoritative_battle
for each row execute function server_authority_private.guard_runtime_snapshot();
create trigger runtime_snapshot_contract before insert or update of engine_snapshot on public.battle_dome_battle
for each row execute function server_authority_private.guard_runtime_snapshot();

alter table public.authoritative_battle_command_receipt add column runtime_checksum text,add column runtime_components jsonb,add column runtime_generation bigint;
alter table public.battle_dome_command_receipt add column runtime_checksum text,add column runtime_components jsonb,add column runtime_generation bigint;
create function server_authority_private.record_command_runtime() returns trigger
language plpgsql security definer set search_path=public,server_authority_private,pg_temp as $$
begin
  new.runtime_checksum:=nullif(current_setting('server_authority.runtime_checksum',true),'');
  new.runtime_components:=nullif(current_setting('server_authority.runtime_components',true),'')::jsonb;
  new.runtime_generation:=nullif(current_setting('server_authority.runtime_generation',true),'')::bigint;
  return new;
end;
$$;
create trigger command_runtime before insert on public.authoritative_battle_command_receipt for each row execute function server_authority_private.record_command_runtime();
create trigger command_runtime before insert on public.battle_dome_command_receipt for each row execute function server_authority_private.record_command_runtime();

-- Catalog updates are classified by the changed fields, not by an unrelated
-- encounter/run happening to exist. Persistent progressions stay protected.
create function server_authority_private.runtime_components_for_change(p_table text,p_before jsonb,p_after jsonb)
returns text[] language plpgsql immutable set search_path=pg_catalog as $$
declare row_data jsonb:=coalesce(p_after,p_before); category text:=row_data->>'category_key';
begin
  if p_table='catalog_rarity_rule' then
    if p_before->'catch_multiplier' is distinct from p_after->'catch_multiplier' then return array['capture'];end if;
    return array['encounters'];
  elsif p_table in('catalog_capture_hp_threshold','catalog_capture_status_multiplier') then return array['capture'];
  elsif p_table='catalog_item' then
    if (p_before-array['image','updated_at']) is not distinct from (p_after-array['image','updated_at']) then return array['presentation'];end if;
    if category='ball' then return array['capture'];elsif category='held_item' then return array['held_items'];
    elsif category='berry' then return array['consumable_items','held_items'];else return array['consumable_items'];end if;
  elsif p_table='catalog_move' then return array['move_effects'];
  elsif p_table='catalog_progression_rule' then
    if row_data->>'rule_key' like '%shiny%' or row_data->>'rule_family' like 'capture_%'
      or row_data->>'rule_family'='search_tool' or row_data->>'rule_key' like '%flute%' then return array['encounters'];end if;
    if row_data->>'rule_family' like '%reward%' or row_data->>'rule_family'='training_difficulty' then return array['opponents_rewards'];end if;
    if row_data->>'rule_family' in('tm_tier','item_unlock') or row_data->>'rule_key'='garden_harvest_quantity' then return array[]::text[];end if;
    return array['progression'];
  elsif p_table in('catalog_daycare_rule','catalog_species_level_move','catalog_species_evolution','catalog_level_rule') then return array['progression'];
  elsif p_table like 'catalog_species%' then return array['encounters','initialization','progression','capture'];
  elsif p_table like 'catalog_opponent%' or p_table like 'catalog_admin_battle%' or p_table='catalog_training_reward_rule' then return array['opponents_rewards'];
  elsif p_table in('catalog_type','catalog_type_effectiveness','catalog_pve_move_category') then return array['battle_core'];
  elsif p_table like 'catalog_zone%' then return array['encounters'];
  elsif p_table in('catalog_shop_offer','catalog_battle_shop_offer','catalog_mission','catalog_title','catalog_trainer_avatar','catalog_trainer_name') then return array[]::text[];
  else return array['battle_core'];
  end if;
end;
$$;

-- Patch the narrow identity comparisons, preserving receipt checks, ownership,
-- revisions, locks, snapshot hashes and every existing semantic validator.
do $patch$
declare target regprocedure; definition text; original text; needle text; replacement text; changed integer:=0;
begin
  for target in select p.oid::regprocedure from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname in('public','server_authority_private') and p.prokind='f'
    and p.proname like 'commit_edge_%' and p.prosrc like '%v_battle.engine_checksum%' loop
    definition:=pg_get_functiondef(target);original:=definition;
    replacement:='not server_authority_private.runtime_transition_allowed(v_battle.catalog_release_id,p_engine_version,p_engine_checksum,v_battle.engine_snapshot,(p_projection->>''runtime_generation'')::bigint)';
    definition:=replace(definition,'(v_battle.engine_checksum is not null and v_battle.engine_checksum <> p_engine_checksum)',replacement);
    definition:=replace(definition,'v_battle.engine_checksum is distinct from p_engine_checksum',replacement);
    definition:=replace(definition,'v_battle.engine_checksum <> p_engine_checksum',replacement);
    if definition<>original then
      if definition like '%update public.battle_dome_battle set%' then
        definition:=replace(definition,'update public.battle_dome_battle set'||chr(10)||'    status',
          'update public.battle_dome_battle set'||chr(10)||'    engine_version=p_engine_version, engine_checksum=p_engine_checksum,'||chr(10)||'    status');
      end if;
      execute definition;changed:=changed+1;
    end if;
  end loop;
  if changed<>4 then raise exception 'expected 4 exact runtime guards, found %',changed;end if;

  target:='server_authority_private.prepare_edge_battle_command_core(uuid,uuid)'::regprocedure;
  definition:=pg_get_functiondef(target);
  definition:=replace(definition,'''battle_id'', v_battle.id,','''battle_id'', v_battle.id, ''runtime_generation'', (select generation from server_authority_private.runtime_deployment where catalog_release_id=v_battle.catalog_release_id),');
  execute definition;
  target:='server_authority_private.battle_dome_battle_payload(public.battle_dome_battle)'::regprocedure;
  definition:=pg_get_functiondef(target);
  definition:=replace(definition,'''battle_id'', p_battle.id,','''battle_id'', p_battle.id, ''runtime_generation'', (select generation from server_authority_private.runtime_deployment where catalog_release_id=p_battle.catalog_release_id),');
  execute definition;

  target:='server_authority_private.prepare_edge_battle_command_with_roster(uuid,uuid)'::regprocedure;
  definition:=pg_get_functiondef(target);
  needle:='  select coalesce(jsonb_agg(jsonb_build_object(';
  if position(needle in definition)=0 then raise exception 'missing pending roster preparation';end if;
  definition:=replace(definition,needle,$pending$  if v_battle.engine_snapshot is null then
    v_battle.requested_engine_version:='pokemon-game-revival';
    select coalesce((select checksum from server_authority_private.runtime_deployment where catalog_release_id=v_battle.catalog_release_id),
      v_result#>>'{battle,bound_engine_checksum}') into v_battle.requested_engine_checksum;
  end if;
$pending$||needle);
  execute definition;

  target:='server_authority_private.begin_game_data_change(text,text[],jsonb,boolean)'::regprocedure;
  definition:=pg_get_functiondef(target);
  needle:=substring(definition from '  if p_requires_battle_idle and \([\s\S]*?  end if;');
  if needle is null then raise exception 'missing idle guard';end if;
  definition:=replace(definition,needle,$guard$  if p_requires_battle_idle and (
    exists(select 1 from public.authoritative_battle where engine_snapshot is not null and status not in('concluded','abandoned'))
    or exists(select 1 from public.battle_dome_battle where engine_snapshot is not null and status not in('concluded','abandoned'))
  ) then
    raise exception 'this incompatible state change requires initialized battles to finish or migrate' using errcode='55000';
  end if;$guard$);
  execute definition;

  target:='server_authority_private.finish_game_data_change()'::regprocedure;
  definition:=pg_get_functiondef(target);
  definition:=replace(definition,'  v_checksum text;','  v_checksum text;'||chr(10)||'  v_components text[];');
  needle:='  for v_source in select key source_path, value source_checksum from jsonb_each_text(v_change_set.source_checksums)';
  if position(needle in definition)=0 then raise exception 'missing finish change context';end if;
  definition:=replace(definition,needle,$finish$  select coalesce(array_agg(distinct component),'{}'::text[]) into v_components
  from public.game_data_change c cross join lateral unnest(server_authority_private.runtime_components_for_change(c.table_name,c.row_before,c.row_after)) component
  where c.change_set_revision=v_change_set.revision;
  if 'progression'=any(v_components) and (
    exists(select 1 from public.player_pending_resolution where status='pending')
    or exists(select 1 from public.player_ordinary_progression where status='awaiting_choices')
    or exists(select 1 from public.player_training_progression where status in('awaiting_allocation','awaiting_choices'))
  ) then raise exception 'pending progression requires completion or explicit migration' using errcode='55000';end if;
  if 'opponents_rewards'=any(v_components) and (
    exists(select 1 from public.authoritative_battle where engine_snapshot is not null and status not in('concluded','abandoned')
      and contract_key in('training','debug_training','gym','admin_gym','league','battle_tower'))
    or exists(select 1 from public.authoritative_league_run where status in('active','awaiting_battle'))
    or exists(select 1 from public.authoritative_battle_tower_run where status in('active','awaiting_next'))
  ) then raise exception 'existing opponent activities require completion or explicit reward migration' using errcode='55000';end if;
  if v_components && array['initialization','battle_core','move_effects','consumable_items','held_items','capture','progression','opponents_rewards'] then
    update server_authority_private.runtime_deployment set checksum=null,required_components=v_components,updated_at=now()
      where catalog_release_id=v_change_set.catalog_release_id;
  end if;
$finish$||needle);
  execute definition;
end;
$patch$;

revoke all on function server_authority_private.runtime_transition_allowed(uuid,text,text,jsonb,bigint),
 server_authority_private.activate_runtime_package(jsonb,boolean),server_authority_private.guard_runtime_snapshot(),
 server_authority_private.record_command_runtime(),server_authority_private.runtime_components_for_change(text,jsonb,jsonb)
 from public,anon,authenticated,service_role;

commit;
