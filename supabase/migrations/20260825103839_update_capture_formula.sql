begin;

select server_authority_private.begin_game_data_change(
  p_label => 'Aggiorna formula di cattura',
  p_affected_families => array['zones', 'items']::text[],
  p_source_checksums => jsonb_build_object(
    'app/data/capture-zones.js', '65ed3e9c4878a09b478f6c44c5e945f6b054f7366d56a2f6a52b0fb588ede50d',
    'app/data/items.js', 'f7b5ebf5e340145050aa4d1f94e3bb14a1f0fed6081460a22e01dc1de42b4d2b'
  ),
  p_requires_battle_idle => true
);

create table public.catalog_capture_status_multiplier (
  catalog_release_id uuid not null references public.catalog_release(id) on delete cascade,
  status_key text not null check (status_key in ('slp', 'par_block', 'par_free', 'frz')),
  catch_multiplier numeric not null check (catch_multiplier = 2),
  primary key (catalog_release_id, status_key)
);

alter table public.catalog_capture_status_multiplier enable row level security;
revoke all on table public.catalog_capture_status_multiplier from public, anon, authenticated;
grant select on table public.catalog_capture_status_multiplier to service_role;

create trigger reject_immutable_catalog_content
before insert or update or delete on public.catalog_capture_status_multiplier
for each row execute function public.reject_immutable_catalog_content();

create trigger track_game_data_change
after insert or update or delete on public.catalog_capture_status_multiplier
for each row execute function server_authority_private.track_game_data_change();

revoke all on function public.attempt_wild_capture_authoritative(uuid, bigint, uuid, integer)
from public, anon, authenticated;

create or replace function server_authority_private.validate_capture_status_multipliers()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.status = 'published' and (
    (select count(*) from public.catalog_capture_status_multiplier where catalog_release_id = new.id) <> 4
    or exists (
      select 1
      from unnest(array['slp', 'par_block', 'par_free', 'frz']::text[]) required(status_key)
      where not exists (
        select 1 from public.catalog_capture_status_multiplier multiplier
        where multiplier.catalog_release_id = new.id and multiplier.status_key = required.status_key
      )
    )
  ) then
    raise exception 'capture status multiplier catalog is incomplete';
  end if;
  return null;
end
$$;

create constraint trigger validate_capture_status_multipliers_on_publish
after update of status on public.catalog_release
deferrable initially immediate
for each row execute function server_authority_private.validate_capture_status_multipliers();

update public.catalog_rarity_rule
set catch_multiplier = case rarity_key
  when 'test' then 100
  when 'common' then 100
  when 'uncommon' then 75
  when 'rare' then 35
  when 'fossil' then 25
  when 'super_rare' then 20
  when 'mythic' then 10
  when 'legendary' then 3
end
where catalog_release_id = (select id from public.catalog_release where version = 'revival-baseline')
  and rarity_key in ('test', 'common', 'uncommon', 'rare', 'fossil', 'super_rare', 'mythic', 'legendary');

update public.catalog_capture_hp_threshold
set catch_multiplier = case threshold_order
  when 0 then 0.967
  when 1 then 0.800
  when 2 then 0.533
  when 3 then 0.333
end
where catalog_release_id = (select id from public.catalog_release where version = 'revival-baseline')
  and threshold_order between 0 and 3;

update public.catalog_item
set rules = jsonb_set(rules, '{value}', to_jsonb(case item_index
  when 100 then 1::numeric
  when 101 then 1.5::numeric
  when 102 then 2::numeric
end), true)
where catalog_release_id = (select id from public.catalog_release where version = 'revival-baseline')
  and item_index in (100, 101, 102);

insert into public.catalog_capture_status_multiplier (catalog_release_id, status_key, catch_multiplier)
select release.id, status_key, 2
from public.catalog_release release
cross join unnest(array['slp', 'par_block', 'par_free', 'frz']::text[]) status_key
where release.version = 'revival-baseline';

create or replace function server_authority_private.commit_edge_battle_command_before_held_item_state_repair(
  p_auth_user_id uuid, p_command_id uuid, p_command_type text, p_command_hash text,
  p_expected_player_revision bigint, p_battle_id uuid, p_expected_battle_version bigint,
  p_runtime_owner_id uuid, p_engine_version text, p_engine_checksum text, p_input_snapshot_hash text,
  p_next_snapshot jsonb, p_events jsonb, p_projection jsonb, p_terminal_effects jsonb
) returns jsonb
language plpgsql security definer
set search_path = public, server_authority_private, extensions, pg_temp
as $_$
declare v_battle public.authoritative_battle%rowtype; v_receipt public.authoritative_battle_command_receipt%rowtype;
  v_item public.catalog_item%rowtype; v_index integer; v_before integer; v_after integer; v_db integer;
  v_consumed boolean; v_success boolean; v_result jsonb; v_core_projection jsonb; v_revision bigint; v_player_receipt public.player_command_receipt%rowtype;
  v_rate numeric; v_expected_rate numeric;
begin
  if coalesce(auth.role(),'')<>'service_role' then raise exception 'service role required' using errcode='42501'; end if;
  select * into v_battle from public.authoritative_battle where id=p_battle_id and auth_user_id=p_auth_user_id;
  if not found or v_battle.contract_key<>'capture' then
    return server_authority_private.commit_edge_battle_command_before_capture(p_auth_user_id,p_command_id,p_command_type,p_command_hash,
      p_expected_player_revision,p_battle_id,p_expected_battle_version,p_runtime_owner_id,p_engine_version,p_engine_checksum,
      p_input_snapshot_hash,p_next_snapshot,p_events,p_projection,p_terminal_effects);
  end if;
  perform pg_advisory_xact_lock(hashtextextended(p_auth_user_id::text||':'||p_command_id::text,0));
  select * into v_receipt from public.authoritative_battle_command_receipt where auth_user_id=p_auth_user_id and command_id=p_command_id;
  if found then
    if v_receipt.battle_id<>p_battle_id or v_receipt.command_type<>p_command_type or v_receipt.command_hash<>p_command_hash then
      raise exception 'command id was reused with a different payload' using errcode='22023'; end if;
    return v_receipt.result;
  end if;
  if p_command_type='initialize' then
    if p_next_snapshot->'playerItems' is distinct from server_authority_private.capture_battle_inventory(p_auth_user_id,v_battle.catalog_release_id)
      or p_projection->'player_items' is distinct from p_next_snapshot->'playerItems' then
      raise exception 'capture initialization inventory is not canonical' using errcode='22023'; end if;
    return server_authority_private.commit_edge_battle_command_before_capture(p_auth_user_id,p_command_id,p_command_type,p_command_hash,
      p_expected_player_revision,p_battle_id,p_expected_battle_version,p_runtime_owner_id,p_engine_version,p_engine_checksum,
      p_input_snapshot_hash,p_next_snapshot,p_events,p_projection,p_terminal_effects);
  end if;
  if p_command_type in ('item','ball') then
    if v_battle.status<>'active' or v_battle.battle_version<>p_expected_battle_version or v_battle.runtime_owner_id<>p_runtime_owner_id
      or v_battle.engine_version is distinct from p_engine_version or v_battle.engine_checksum is distinct from p_engine_checksum then
      raise exception 'capture item version conflict' using errcode='40001'; end if;
    select revision into strict v_revision from public.player_state_revision where auth_user_id=p_auth_user_id for update;
    if v_revision<>p_expected_player_revision then raise exception 'player revision conflict' using errcode='40001'; end if;
    if p_command_type='ball' then
      if p_events#>>'{0,type}'<>'ball_resolved' or p_events#>>'{0,data,command_type}'<>'ball' then
        raise exception 'ball journal fact is invalid' using errcode='22023'; end if;
      v_index:=server_authority_private.edge_jsonb_bigint(p_events#>'{0,data,item_index}');
      v_consumed:=coalesce(server_authority_private.edge_jsonb_boolean(p_events#>'{0,data,item_consumed}'),false);
      v_success:=coalesce(server_authority_private.edge_jsonb_boolean(p_events#>'{0,data,capture_success}'),false);
      if not exists(select 1 from public.player_encounter where id=v_battle.encounter_id and status='active') then
        raise exception 'L''incontro di cattura non e piu attivo prima della conferma della Ball.' using errcode='40001'; end if;
      if server_authority_private.edge_jsonb_bigint(p_events#>'{0,data,target_slot}')<>0
        or p_projection->>'capture_success' is distinct from v_success::text
        or (v_success and not v_consumed) then raise exception 'ball outcome descriptor is invalid' using errcode='22023'; end if;
    else
      if p_events#>>'{0,type}'<>'command_resolved' or p_events#>>'{0,data,command_type}'<>'item' then
        raise exception 'capture item journal fact is invalid' using errcode='22023'; end if;
      v_index:=server_authority_private.edge_jsonb_bigint(p_events#>'{0,data,item_index}');
      v_consumed:=coalesce(server_authority_private.edge_jsonb_boolean(p_events#>'{0,data,item_consumed}'),false);
      v_success:=false;
    end if;
    select * into v_item from public.catalog_item where catalog_release_id=v_battle.catalog_release_id and item_index=v_index;
    if not found or (p_command_type='ball' and v_item.category_key<>'ball')
      or (p_command_type='item' and not ((v_item.category_key='battle_item' and v_item.subcategory_key in ('heal_hp','heal_full','heal_ko','heal_status','weather'))
        or (v_item.category_key='berry' and v_item.item_index between 300 and 308 and v_item.subcategory_key in ('heal_hp','heal_status')))) then
      raise exception 'item class is unsupported by capture' using errcode='22023'; end if;
    if p_command_type='ball' then
      if jsonb_typeof(p_events#>'{0,data,catch_rate}')<>'number'
        or p_events#>>'{0,data,catch_rate}' !~ '^[0-9]+([.][0-9]+)?$' then
        raise exception 'capture rate audit is invalid' using errcode='22023'; end if;
      v_rate:=(p_events#>>'{0,data,catch_rate}')::numeric;
      select case when v_item.item_index=620 then 100::numeric else least(95::numeric,greatest(0::numeric,
        power(((v_item.rules->>'value')::numeric*r.catch_multiplier*h.catch_multiplier*coalesce(s.catch_multiplier,1::numeric))/255::numeric,0.75::numeric)*100::numeric
      )) end
        into v_expected_rate from public.player_encounter e
        join public.catalog_rarity_rule r on r.catalog_release_id=e.catalog_release_id and r.rarity_key=e.rarity_key
        join lateral (select catch_multiplier from public.catalog_capture_hp_threshold t
          where t.catalog_release_id=e.catalog_release_id
            and (select current_hp from public.authoritative_battle_participant where battle_id=p_battle_id and side='npc' and slot_index=0)::numeric
              / e.max_hp<=t.max_hp_fraction order by t.threshold_order limit 1) h on true
        left join lateral (select status from public.authoritative_battle_participant
          where battle_id=p_battle_id and side='npc' and slot_index=0) participant on true
        left join public.catalog_capture_status_multiplier s on s.catalog_release_id=e.catalog_release_id and s.status_key=participant.status
        where e.id=v_battle.encounter_id and jsonb_typeof(v_item.rules->'value')='number';
      if v_expected_rate is null or abs(v_rate-v_expected_rate)>0.000000001 then
        raise exception 'trusted JS capture rate diverges from the exact catalog/encounter state' using errcode='22023'; end if;
    end if;
    select server_authority_private.edge_jsonb_bigint(value->1) into v_before from jsonb_array_elements(v_battle.engine_snapshot->'playerItems')
      where server_authority_private.edge_jsonb_bigint(value->0)=v_index;
    select server_authority_private.edge_jsonb_bigint(value->1) into v_after from jsonb_array_elements(p_next_snapshot->'playerItems')
      where server_authority_private.edge_jsonb_bigint(value->0)=v_index;
    if p_projection->'player_items' is distinct from p_next_snapshot->'playerItems'
      or (v_consumed and (v_before<=0 or v_after<>v_before-1))
      or (not v_consumed and (v_before<=0 or v_after is distinct from v_before))
      or exists(select 1 from jsonb_array_elements(v_battle.engine_snapshot->'playerItems') old(value)
        full join jsonb_array_elements(p_next_snapshot->'playerItems') new(value)
          on server_authority_private.edge_jsonb_bigint(old.value->0)=server_authority_private.edge_jsonb_bigint(new.value->0)
        where coalesce(server_authority_private.edge_jsonb_bigint(old.value->0),server_authority_private.edge_jsonb_bigint(new.value->0))<>v_index
          and old.value is distinct from new.value) then raise exception 'battle-local inventory delta is invalid' using errcode='22023'; end if;
    if p_command_type='item' and coalesce(server_authority_private.edge_jsonb_bigint(p_next_snapshot#>array['manager','usedItems',v_item.display_name]),0)>3 then
      raise exception 'capture battle item use limit exceeded' using errcode='22023'; end if;
    if v_consumed then
      select quantity into v_db from public.player_inventory_item where auth_user_id=p_auth_user_id
        and catalog_release_id=v_battle.catalog_release_id and item_index=v_index for update;
      if not found or v_db<>v_before then raise exception 'canonical item quantity is stale' using errcode='40001'; end if;
      update public.player_inventory_item set quantity=quantity-1,updated_at=now() where auth_user_id=p_auth_user_id and item_index=v_index;
      delete from public.player_inventory_item where auth_user_id=p_auth_user_id and item_index=v_index and quantity=0;
    end if;
    v_core_projection:=p_projection;
    if p_command_type='ball' and v_success then
      v_core_projection:=jsonb_set(v_core_projection,'{result_key}',to_jsonb('player_win_no_reward'::text),true);
    end if;
    v_result:=server_authority_private.commit_edge_battle_command_without_items(p_auth_user_id,p_command_id,'item',p_command_hash,
      p_expected_player_revision,p_battle_id,p_expected_battle_version,p_runtime_owner_id,p_engine_version,p_engine_checksum,
      p_input_snapshot_hash,p_next_snapshot,p_events,v_core_projection,jsonb_build_object('reward','none','inventory','unchanged','team','unchanged'));
    update public.authoritative_battle_command_receipt set command_type=p_command_type where auth_user_id=p_auth_user_id and command_id=p_command_id;
    if p_command_type='ball' and v_success then
      return server_authority_private.finish_capture_success(p_auth_user_id,p_battle_id,p_command_id,p_command_hash,v_index,v_result);
    end if;
    if p_projection->>'status' in ('concluded','abandoned') then
      update public.player_encounter set status='cancelled'
        where id=v_battle.encounter_id and status='active';
    end if;
    if p_command_type='ball' then
      select revision into v_revision from public.player_state_revision where auth_user_id=p_auth_user_id;
      insert into public.player_command_receipt(auth_user_id,command_id,command_type,request_hash,result,resulting_revision)
        values(p_auth_user_id,p_command_id,'wild_capture_attempt',p_command_hash,
          jsonb_build_object('capture_success',false,'item_index',v_index,'battle_id',p_battle_id),v_revision)
        returning * into v_player_receipt;
    elsif v_consumed then
      select revision into v_revision from public.player_state_revision where auth_user_id=p_auth_user_id;
      insert into public.player_command_receipt(auth_user_id,command_id,command_type,request_hash,result,resulting_revision)
        values(p_auth_user_id,p_command_id,'authoritative_battle_item',p_command_hash,
          jsonb_build_object('item_index',v_index,'battle_id',p_battle_id),v_revision) returning * into v_player_receipt;
      perform server_authority_private.apply_mission_fact(v_player_receipt.auth_user_id,'battle-item-used',
        jsonb_build_object('itemIndex',v_index,'battleId',p_battle_id,'contract','capture'),v_player_receipt.created_at);
    end if;
    v_result:=v_result||jsonb_build_object('capture_success',false,'player_state',server_authority_private.player_state_projection(p_auth_user_id));
    update public.authoritative_battle_command_receipt set result=v_result where auth_user_id=p_auth_user_id and command_id=p_command_id;
    return v_result;
  end if;
  v_result:=server_authority_private.commit_edge_battle_command_before_capture(p_auth_user_id,p_command_id,p_command_type,p_command_hash,
    p_expected_player_revision,p_battle_id,p_expected_battle_version,p_runtime_owner_id,p_engine_version,p_engine_checksum,
    p_input_snapshot_hash,p_next_snapshot,p_events,p_projection,p_terminal_effects);
  if p_projection->>'status' in ('concluded','abandoned') then
    update public.player_encounter set status='cancelled'
      where id=v_battle.encounter_id and status='active';
    v_result:=v_result||jsonb_build_object('player_state',server_authority_private.player_state_projection(p_auth_user_id));
    update public.authoritative_battle_command_receipt set result=v_result where auth_user_id=p_auth_user_id and command_id=p_command_id;
  end if;
  return v_result;
end;
$_$;

select server_authority_private.finish_game_data_change();

insert into public.catalog_engine_runtime_binding (
  catalog_release_id,
  engine_version,
  engine_checksum,
  enabled
)
select id, 'pokemon-game-revival', 'c74469809755a830d86351d3d4e71de44f8a35873897175d8fb34d3591f8457f', true
from public.catalog_release
where version = 'revival-baseline'
on conflict (catalog_release_id, engine_version, engine_checksum)
do update set enabled = excluded.enabled;

update public.catalog_engine_runtime_binding
set enabled = false
where catalog_release_id = (select id from public.catalog_release where version = 'revival-baseline')
  and engine_version = 'pokemon-game-revival'
  and engine_checksum <> 'c74469809755a830d86351d3d4e71de44f8a35873897175d8fb34d3591f8457f'
  and enabled;

commit;
