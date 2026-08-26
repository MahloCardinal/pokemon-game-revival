begin;

create table public.catalog_title (
  catalog_release_id uuid not null,
  title_key text not null,
  collection_key text not null,
  sort_order integer not null,
  unlock_type text not null,
  unlock_rules jsonb not null default '{}'::jsonb,
  constraint catalog_title_pkey primary key (catalog_release_id, title_key),
  constraint catalog_title_release_fkey foreign key (catalog_release_id)
    references public.catalog_release(id) on delete cascade,
  constraint catalog_title_collection_order_key unique (catalog_release_id, collection_key, sort_order),
  constraint catalog_title_key_check check (title_key ~ '^[a-z][a-z0-9_]*$'),
  constraint catalog_title_collection_key_check check (collection_key ~ '^[a-z][a-z0-9_]*$'),
  constraint catalog_title_sort_order_check check (sort_order > 0),
  constraint catalog_title_unlock_type_check check (unlock_type in (
    'pokedex_type_complete', 'berries_harvested', 'opponent_victory', 'battle_tower_streak'
  )),
  constraint catalog_title_unlock_rules_check check (jsonb_typeof(unlock_rules) = 'object')
);

create table public.player_title (
  auth_user_id uuid not null,
  catalog_release_id uuid not null,
  title_key text not null,
  unlocked_at timestamptz not null default now(),
  constraint player_title_pkey primary key (auth_user_id, title_key),
  constraint player_title_auth_user_fkey foreign key (auth_user_id)
    references auth.users(id) on delete cascade,
  constraint player_title_profile_fkey foreign key (auth_user_id, catalog_release_id)
    references public.player_profile_state(auth_user_id, catalog_release_id)
    on update cascade on delete cascade,
  constraint player_title_catalog_fkey foreign key (catalog_release_id, title_key)
    references public.catalog_title(catalog_release_id, title_key)
);

create table public.player_title_progress (
  auth_user_id uuid not null,
  catalog_release_id uuid not null,
  title_key text not null,
  progress integer not null default 0,
  updated_at timestamptz not null default now(),
  constraint player_title_progress_pkey primary key (auth_user_id, title_key),
  constraint player_title_progress_value_check check (progress >= 0),
  constraint player_title_progress_auth_user_fkey foreign key (auth_user_id)
    references auth.users(id) on delete cascade,
  constraint player_title_progress_profile_fkey foreign key (auth_user_id, catalog_release_id)
    references public.player_profile_state(auth_user_id, catalog_release_id)
    on update cascade on delete cascade,
  constraint player_title_progress_catalog_fkey foreign key (catalog_release_id, title_key)
    references public.catalog_title(catalog_release_id, title_key)
);

create index player_title_catalog_idx
  on public.player_title(catalog_release_id, title_key);

alter table public.catalog_title enable row level security;
alter table public.player_title enable row level security;
alter table public.player_title_progress enable row level security;

revoke all on table public.catalog_title from public, anon, authenticated;
revoke all on table public.player_title from public, anon, authenticated;
revoke all on table public.player_title_progress from public, anon, authenticated;
grant select, insert, update, delete on table public.catalog_title to service_role;
grant select, insert, update, delete on table public.player_title to service_role;
grant select, insert, update, delete on table public.player_title_progress to service_role;

create or replace function server_authority_private.catalog_family_tables(p_family text)
returns text[]
language sql
immutable
set search_path = public, pg_temp
as $$
  select case p_family
    when 'zones' then array['catalog_type','catalog_zone','catalog_zone_type','catalog_rarity_rule','catalog_capture_hp_threshold']
    when 'moves' then array['catalog_move']
    when 'items' then array['catalog_item']
    when 'species' then array['catalog_species','catalog_species_type','catalog_species_gender','catalog_species_level_move','catalog_species_machine_move','catalog_species_evolution']
    when 'progression' then array['catalog_progression_rule','catalog_daycare_rule','catalog_training_reward_rule']
    when 'shop' then array['catalog_shop_offer']
    when 'battle-shop' then array['catalog_battle_shop_offer']
    when 'combat-rules' then array['catalog_type_effectiveness','catalog_level_rule','catalog_pve_move_category']
    when 'zone-access' then array['catalog_zone_access_requirement']
    when 'missions' then array['catalog_mission']
    when 'titles' then array['catalog_title']
    when 'opponents' then array['catalog_opponent','catalog_opponent_pokemon','catalog_opponent_move','catalog_opponent_reward']
    when 'admin-battles' then array['catalog_admin_battle_type','catalog_admin_battle_item']
    when 'trainers' then array['catalog_trainer_avatar','catalog_trainer_name']
    else null
  end
$$;

create or replace function server_authority_private.catalog_family_primary_table(p_family text)
returns text
language sql
immutable
set search_path = public, pg_temp
as $$
  select case p_family
    when 'zones' then 'catalog_zone'
    when 'moves' then 'catalog_move'
    when 'items' then 'catalog_item'
    when 'species' then 'catalog_species'
    when 'progression' then 'catalog_progression_rule'
    when 'shop' then 'catalog_shop_offer'
    when 'battle-shop' then 'catalog_battle_shop_offer'
    when 'zone-access' then 'catalog_zone_access_requirement'
    when 'missions' then 'catalog_mission'
    when 'titles' then 'catalog_title'
    when 'opponents' then 'catalog_opponent'
    else null
  end
$$;

do $extend_catalog_publisher$
declare
  v_definition text;
  v_family_marker constant text := '''missions'', ''opponents''';
  v_primary_marker constant text := 'when ''missions'' then ''catalog_mission''';
  v_entity_marker constant text := '(''missions'',''catalog_mission''),';
  v_entity_occurrences integer;
begin
  select pg_get_functiondef('public.publish_catalog_release(text)'::regprocedure)
  into v_definition;

  v_entity_occurrences :=
    (length(v_definition) - length(replace(v_definition, v_entity_marker, '')))
    / length(v_entity_marker);
  if strpos(v_definition, v_family_marker) = 0
    or strpos(v_definition, v_primary_marker) = 0
    or v_entity_occurrences <> 2 then
    raise exception 'catalog publisher no longer matches the expected pre-title definition'
      using errcode = '55000';
  end if;

  v_definition := replace(
    v_definition,
    v_family_marker,
    '''missions'', ''titles'', ''opponents'''
  );
  v_definition := replace(
    v_definition,
    v_primary_marker,
    v_primary_marker || E'\n      when ''titles'' then ''catalog_title'''
  );
  v_definition := replace(
    v_definition,
    v_entity_marker,
    v_entity_marker || E'\n        (''titles'',''catalog_title''),'
  );
  execute v_definition;
end
$extend_catalog_publisher$;

create trigger track_game_data_change
after insert or update or delete on public.catalog_title
for each row execute function server_authority_private.track_game_data_change();

create trigger reject_immutable_catalog_content
before insert or update or delete on public.catalog_title
for each row execute function public.reject_immutable_catalog_content();

select server_authority_private.begin_game_data_change(
  p_label => 'Add permanent Trainer Titles and their collection mission',
  p_affected_families => array['titles', 'missions']::text[],
  p_source_checksums => jsonb_build_object(
    'app/data/titles.js', 'aaf711fc2c3be92f5fd4430f5998764d1660d8059092e3d21c4a9bd833634ec7',
    'app/data/pokefan-missions.js', '02dae361fcd98a99f76a71a92669a59a3c4128d3cb38dbad452fd4ab7c577453'
  ),
  p_requires_battle_idle => false
);

insert into public.catalog_import_batch (
  catalog_release_id, family_key, source_path, source_checksum, row_count, entity_counts
)
select id, 'titles', 'app/data/titles.js',
  'aaf711fc2c3be92f5fd4430f5998764d1660d8059092e3d21c4a9bd833634ec7',
  21, '{"catalog_title":21}'::jsonb
from public.catalog_release where version = 'revival-baseline'
on conflict (catalog_release_id, family_key, source_path) do update
set source_checksum = excluded.source_checksum,
    row_count = excluded.row_count,
    entity_counts = excluded.entity_counts,
    imported_at = now();

insert into public.catalog_title (
  catalog_release_id, title_key, collection_key, sort_order, unlock_type, unlock_rules
)
select release.id, title.title_key, 'trainer_titles_initial', title.sort_order,
  'pokedex_type_complete',
  jsonb_build_object(
    'typeKey', title.type_key,
    'excludedRarities', jsonb_build_array('fossil', 'legendary')
  )
from public.catalog_release release
cross join (values
  ('steel_will', 1, 'steel'),
  ('expert_angler', 2, 'water'),
  ('creature_of_the_night', 3, 'dark'),
  ('bug_catching_enthusiast', 4, 'bug'),
  ('dragon_tamer', 5, 'dragon'),
  ('picnic_enthusiast', 6, 'grass'),
  ('electric_personality', 7, 'electric'),
  ('fairy_catcher', 8, 'fairy'),
  ('flame_ranger', 9, 'fire'),
  ('ice_king', 10, 'ice'),
  ('placid_trainer', 11, 'normal'),
  ('relentless_black_belt', 12, 'fighting'),
  ('medium', 13, 'psychic'),
  ('tough_bone', 14, 'rock'),
  ('halloween_lover', 15, 'ghost'),
  ('desert_bedouin', 16, 'ground'),
  ('trap_expert', 17, 'poison'),
  ('red_baron', 18, 'flying')
) title(title_key, sort_order, type_key)
where release.version = 'revival-baseline';

insert into public.catalog_title (
  catalog_release_id, title_key, collection_key, sort_order, unlock_type, unlock_rules
)
select release.id, title.title_key, 'trainer_titles_initial', title.sort_order,
  title.unlock_type, title.unlock_rules
from public.catalog_release release
cross join (values
  ('green_thumb', 19, 'berries_harvested', '{"target":100}'::jsonb),
  ('kanto_champion', 20, 'opponent_victory', '{"opponentKey":"kanto_league_champion"}'::jsonb),
  ('battle_tower_champion', 21, 'battle_tower_streak', '{"target":10}'::jsonb)
) title(title_key, sort_order, unlock_type, unlock_rules)
where release.version = 'revival-baseline';

insert into public.catalog_mission (
  catalog_release_id, mission_index, category_key, mission_type, target,
  phase, sequence, rules, reward_rules, presentation
)
select id, 3012, 'capture', 'title_collection', 21,
  null, null,
  '{"collectionKey":"trainer_titles_initial"}'::jsonb,
  '{"kind":"pokemon_choice","choiceKey":"legendary_pokemon_level_100","levelMode":"fixed","level":100,"requiredRarity":"legendary"}'::jsonb,
  '{}'::jsonb
from public.catalog_release
where version = 'revival-baseline';

select server_authority_private.finish_game_data_change();

create or replace function server_authority_private.sync_player_missions(p_auth_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, server_authority_private, pg_temp
as $$
declare
  v_catalog_release_id uuid;
  v_today date := (now() at time zone 'Europe/Rome')::date;
  v_badges integer;
  v_dex_count integer;
begin
  select catalog_release_id, least(8, greatest(0, badges))
  into v_catalog_release_id, v_badges
  from public.player_profile_state
  where auth_user_id = p_auth_user_id;
  if v_catalog_release_id is null then return; end if;

  insert into public.player_mission_state(auth_user_id, catalog_release_id, mission_index)
  select p_auth_user_id, mission.catalog_release_id, mission.mission_index
  from public.catalog_mission mission
  where mission.catalog_release_id = v_catalog_release_id
  on conflict(auth_user_id, mission_index) do nothing;

  if exists (
    select 1 from public.player_mission_state
    where auth_user_id = p_auth_user_id and catalog_release_id <> v_catalog_release_id
  ) then
    raise exception 'player mission state is bound to a different catalog release' using errcode = '55000';
  end if;

  perform server_authority_private.apply_daily_mission_resets(p_auth_user_id, v_today);

  update public.player_mission_state state
  set counter = mission.target,
      tracked_keys = array_append(
        array_remove(state.tracked_keys, (
          select key from unnest(state.tracked_keys) key
          where key like 'reward_badges:%' limit 1
        )),
        'reward_badges:' || v_badges::text
      ),
      updated_at = now()
  from public.catalog_mission mission
  where state.auth_user_id = p_auth_user_id
    and state.catalog_release_id = v_catalog_release_id
    and mission.catalog_release_id = state.catalog_release_id
    and mission.mission_index = state.mission_index
    and mission.mission_type = 'daily_login'
    and state.claim_status = 'unclaimed'
    and state.daily_reset_date = v_today
    and state.counter < mission.target;

  select count(*)::integer into v_dex_count
  from public.player_dex_entry
  where auth_user_id = p_auth_user_id
    and catalog_release_id = v_catalog_release_id;

  update public.player_mission_state state
  set counter = least(mission.target, v_dex_count), updated_at = now()
  from public.catalog_mission mission
  where state.auth_user_id = p_auth_user_id
    and state.catalog_release_id = v_catalog_release_id
    and state.claim_status = 'unclaimed'
    and mission.catalog_release_id = state.catalog_release_id
    and mission.mission_index = state.mission_index
    and mission.mission_type = 'pokedex_species_count'
    and state.counter is distinct from least(mission.target, v_dex_count);

  update public.player_mission_state state
  set counter = least(mission.target, coalesce(title_count.value, 0)),
      updated_at = now()
  from public.catalog_mission mission
  left join lateral (
    select count(*)::integer as value
    from public.player_title player_title
    join public.catalog_title title
      on title.catalog_release_id = player_title.catalog_release_id
     and title.title_key = player_title.title_key
    where player_title.auth_user_id = p_auth_user_id
      and player_title.catalog_release_id = v_catalog_release_id
      and title.collection_key = mission.rules ->> 'collectionKey'
  ) title_count on true
  where state.auth_user_id = p_auth_user_id
    and state.catalog_release_id = v_catalog_release_id
    and state.claim_status = 'unclaimed'
    and mission.catalog_release_id = state.catalog_release_id
    and mission.mission_index = state.mission_index
    and mission.mission_type = 'title_collection'
    and state.counter is distinct from least(mission.target, coalesce(title_count.value, 0));
end;
$$;

create or replace function server_authority_private.grant_player_title(
  p_auth_user_id uuid,
  p_title_key text,
  p_unlocked_at timestamptz default now()
)
returns boolean
language plpgsql
security definer
set search_path = public, server_authority_private, pg_temp
as $$
declare
  v_catalog_release_id uuid;
  v_inserted integer;
begin
  select catalog_release_id into v_catalog_release_id
  from public.player_profile_state
  where auth_user_id = p_auth_user_id;
  if v_catalog_release_id is null then return false; end if;

  insert into public.player_title(auth_user_id, catalog_release_id, title_key, unlocked_at)
  select p_auth_user_id, v_catalog_release_id, title.title_key, coalesce(p_unlocked_at, now())
  from public.catalog_title title
  where title.catalog_release_id = v_catalog_release_id
    and title.title_key = p_title_key
  on conflict(auth_user_id, title_key) do nothing;
  get diagnostics v_inserted = row_count;

  if v_inserted = 1 then
    perform server_authority_private.sync_player_missions(p_auth_user_id);
    return true;
  end if;
  return false;
end;
$$;

create or replace function server_authority_private.sync_player_type_titles(
  p_auth_user_id uuid,
  p_species_key text default null
)
returns void
language plpgsql
security definer
set search_path = public, server_authority_private, pg_temp
as $$
declare
  v_catalog_release_id uuid;
  v_title record;
begin
  select catalog_release_id into v_catalog_release_id
  from public.player_profile_state
  where auth_user_id = p_auth_user_id;
  if v_catalog_release_id is null then return; end if;

  for v_title in
    select title.title_key, title.unlock_rules ->> 'typeKey' as type_key,
      title.unlock_rules -> 'excludedRarities' as excluded_rarities
    from public.catalog_title title
    where title.catalog_release_id = v_catalog_release_id
      and title.unlock_type = 'pokedex_type_complete'
      and (
        p_species_key is null
        or exists (
          select 1 from public.catalog_species_type species_type
          where species_type.catalog_release_id = v_catalog_release_id
            and species_type.species_key = p_species_key
            and species_type.type_key = title.unlock_rules ->> 'typeKey'
        )
      )
    order by title.sort_order
  loop
    if exists (
      select 1
      from public.catalog_species species
      join public.catalog_species_type species_type
        on species_type.catalog_release_id = species.catalog_release_id
       and species_type.species_key = species.species_key
      where species.catalog_release_id = v_catalog_release_id
        and species_type.type_key = v_title.type_key
        and not coalesce(v_title.excluded_rarities ? species.encounter_rarity_key, false)
    ) and not exists (
      select 1
      from public.catalog_species species
      join public.catalog_species_type species_type
        on species_type.catalog_release_id = species.catalog_release_id
       and species_type.species_key = species.species_key
      where species.catalog_release_id = v_catalog_release_id
        and species_type.type_key = v_title.type_key
        and not coalesce(v_title.excluded_rarities ? species.encounter_rarity_key, false)
        and not exists (
          select 1 from public.player_dex_entry dex
          where dex.auth_user_id = p_auth_user_id
            and dex.catalog_release_id = v_catalog_release_id
            and dex.species_key = species.species_key
        )
    ) then
      perform server_authority_private.grant_player_title(
        p_auth_user_id, v_title.title_key, now()
      );
    end if;
  end loop;
end;
$$;

create or replace function server_authority_private.record_player_title_progress(
  p_auth_user_id uuid,
  p_title_key text,
  p_amount integer,
  p_occurred_at timestamptz default now()
)
returns void
language plpgsql
security definer
set search_path = public, server_authority_private, pg_temp
as $$
declare
  v_catalog_release_id uuid;
  v_progress integer;
  v_target integer;
begin
  if coalesce(p_amount, 0) <= 0 then return; end if;
  select catalog_release_id into v_catalog_release_id
  from public.player_profile_state
  where auth_user_id = p_auth_user_id;
  if v_catalog_release_id is null then return; end if;

  select (unlock_rules ->> 'target')::integer into v_target
  from public.catalog_title
  where catalog_release_id = v_catalog_release_id
    and title_key = p_title_key;
  if coalesce(v_target, 0) <= 0 then
    raise exception 'trainer title progress target is invalid' using errcode = '55000';
  end if;

  insert into public.player_title_progress(
    auth_user_id, catalog_release_id, title_key, progress, updated_at
  ) values (
    p_auth_user_id, v_catalog_release_id, p_title_key,
    least(v_target, p_amount), coalesce(p_occurred_at, now())
  )
  on conflict(auth_user_id, title_key) do update
  set progress = least(v_target, player_title_progress.progress + excluded.progress),
      updated_at = greatest(player_title_progress.updated_at, excluded.updated_at)
  returning progress into v_progress;

  if v_progress >= v_target then
    perform server_authority_private.grant_player_title(
      p_auth_user_id, p_title_key, coalesce(p_occurred_at, now())
    );
  end if;
end;
$$;

create or replace function server_authority_private.sync_player_titles(p_auth_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, server_authority_private, pg_temp
as $$
declare
  v_profile public.player_profile_state%rowtype;
  v_title record;
begin
  select * into v_profile
  from public.player_profile_state
  where auth_user_id = p_auth_user_id;
  if not found then return; end if;

  perform server_authority_private.sync_player_type_titles(p_auth_user_id, null);

  for v_title in
    select title.title_key
    from public.catalog_title title
    join public.player_title_progress progress
      on progress.catalog_release_id = title.catalog_release_id
     and progress.title_key = title.title_key
     and progress.auth_user_id = p_auth_user_id
    where title.catalog_release_id = v_profile.catalog_release_id
      and title.unlock_type = 'berries_harvested'
      and progress.progress >= (title.unlock_rules ->> 'target')::integer
  loop
    perform server_authority_private.grant_player_title(p_auth_user_id, v_title.title_key, now());
  end loop;

  for v_title in
    select title.title_key
    from public.catalog_title title
    where title.catalog_release_id = v_profile.catalog_release_id
      and title.unlock_type = 'opponent_victory'
      and exists (
        select 1 from public.player_league_victory victory
        where victory.auth_user_id = p_auth_user_id
          and victory.opponent_key = title.unlock_rules ->> 'opponentKey'
      )
  loop
    perform server_authority_private.grant_player_title(p_auth_user_id, v_title.title_key, now());
  end loop;

  for v_title in
    select title.title_key
    from public.catalog_title title
    where title.catalog_release_id = v_profile.catalog_release_id
      and title.unlock_type = 'battle_tower_streak'
      and v_profile.battle_tower_record >= (title.unlock_rules ->> 'target')::integer
  loop
    perform server_authority_private.grant_player_title(p_auth_user_id, v_title.title_key, now());
  end loop;

  perform server_authority_private.sync_player_missions(p_auth_user_id);
end;
$$;

create or replace function server_authority_private.process_trainer_title_dex_entry()
returns trigger
language plpgsql
security definer
set search_path = public, server_authority_private, pg_temp
as $$
begin
  perform server_authority_private.sync_player_type_titles(new.auth_user_id, new.species_key);
  return new;
end;
$$;

create trigger process_trainer_title_dex_entry
after insert on public.player_dex_entry
for each row execute function server_authority_private.process_trainer_title_dex_entry();

create or replace function server_authority_private.process_trainer_title_command_receipt()
returns trigger
language plpgsql
security definer
set search_path = public, server_authority_private, pg_temp
as $$
declare
  v_quantity integer;
begin
  if new.command_type = 'garden_harvest' then
    v_quantity := case
      when coalesce(new.result ->> 'quantity', '') ~ '^[1-9][0-9]*$'
        then (new.result ->> 'quantity')::integer
      else 0
    end;
    if v_quantity > 0 then
      perform server_authority_private.record_player_title_progress(
        new.auth_user_id, 'green_thumb', v_quantity, new.created_at
      );
    end if;
  end if;
  return new;
end;
$$;

create trigger process_trainer_title_command_receipt
after insert on public.player_command_receipt
for each row execute function server_authority_private.process_trainer_title_command_receipt();

create or replace function server_authority_private.process_trainer_title_league_victory()
returns trigger
language plpgsql
security definer
set search_path = public, server_authority_private, pg_temp
as $$
begin
  if new.opponent_key = 'kanto_league_champion' then
    perform server_authority_private.grant_player_title(
      new.auth_user_id, 'kanto_champion', new.awarded_at
    );
  end if;
  return new;
end;
$$;

create trigger process_trainer_title_league_victory
after insert on public.player_league_victory
for each row execute function server_authority_private.process_trainer_title_league_victory();

create or replace function server_authority_private.process_trainer_title_tower_record()
returns trigger
language plpgsql
security definer
set search_path = public, server_authority_private, pg_temp
as $$
begin
  if new.battle_tower_record >= 10 then
    perform server_authority_private.grant_player_title(
      new.auth_user_id, 'battle_tower_champion', now()
    );
  end if;
  return new;
end;
$$;

create trigger process_trainer_title_tower_record
after update of battle_tower_record on public.player_profile_state
for each row
when (new.battle_tower_record >= 10)
execute function server_authority_private.process_trainer_title_tower_record();

-- Preserve any still-retained Berry harvest receipts during the transition.
do $$
declare
  v_progress record;
begin
  for v_progress in
    select receipt.auth_user_id,
      sum((receipt.result ->> 'quantity')::integer)::integer as quantity,
      max(receipt.created_at) as occurred_at
    from public.player_command_receipt receipt
    where receipt.command_type = 'garden_harvest'
      and coalesce(receipt.result ->> 'quantity', '') ~ '^[1-9][0-9]*$'
    group by receipt.auth_user_id
  loop
    perform server_authority_private.record_player_title_progress(
      v_progress.auth_user_id, 'green_thumb', v_progress.quantity, v_progress.occurred_at
    );
  end loop;
end;
$$;

do $$
declare
  v_player record;
begin
  for v_player in select auth_user_id from public.player_profile_state loop
    perform server_authority_private.sync_player_titles(v_player.auth_user_id);
  end loop;
end;
$$;

create or replace function server_authority_private.player_state_projection(p_auth_user_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public, server_authority_private, pg_temp
as $$
  select server_authority_private.player_state_projection_before_battle_shop(p_auth_user_id)
    || jsonb_build_object(
      'game_data_revision', public.get_game_data_revision(),
      'titles', coalesce((
        select jsonb_agg(jsonb_build_object(
          'title_key', player_title.title_key,
          'unlocked_at', player_title.unlocked_at
        ) order by title.sort_order)
        from public.player_title player_title
        join public.catalog_title title
          on title.catalog_release_id = player_title.catalog_release_id
         and title.title_key = player_title.title_key
        where player_title.auth_user_id = p_auth_user_id
      ), '[]'::jsonb)
    )
$$;

revoke all on function server_authority_private.grant_player_title(uuid, text, timestamptz) from public;
revoke all on function server_authority_private.sync_player_type_titles(uuid, text) from public;
revoke all on function server_authority_private.record_player_title_progress(uuid, text, integer, timestamptz) from public;
revoke all on function server_authority_private.sync_player_titles(uuid) from public;
revoke all on function server_authority_private.process_trainer_title_dex_entry() from public;
revoke all on function server_authority_private.process_trainer_title_command_receipt() from public;
revoke all on function server_authority_private.process_trainer_title_league_victory() from public;
revoke all on function server_authority_private.process_trainer_title_tower_record() from public;

comment on table public.catalog_title is
  'Canonical Trainer Title definitions for the stable Revival catalog.';
comment on table public.player_title is
  'Permanent, idempotent Trainer Titles unlocked by authoritative game state.';
comment on table public.player_title_progress is
  'Bounded progress counters used only by cumulative Trainer Title requirements.';

create or replace function public.claim_player_mission_before_revision_guard(
  p_command_id uuid,
  p_expected_revision bigint,
  p_mission_index integer,
  p_selected_reward_item_index integer,
  p_selected_reward_species_key text
)
returns jsonb
language plpgsql
security definer
set search_path = public, server_authority_private, extensions, pg_temp
as $_$
declare
  v_auth_user_id uuid := auth.uid();
  v_request jsonb;
  v_request_hash text;
  v_receipt public.player_command_receipt%rowtype;
  v_revision bigint;
  v_profile public.player_profile_state%rowtype;
  v_state public.player_mission_state%rowtype;
  v_mission public.catalog_mission%rowtype;
  v_reward jsonb;
  v_reward_kind text;
  v_reward_quantity bigint;
  v_reward_item_index integer;
  v_matching_choices integer;
  v_inventory_quantity integer := 0;
  v_reward_badges integer;
  v_species_key text;
  v_level integer;
  v_gender text;
  v_rule public.catalog_level_rule%rowtype;
  v_rule_60 public.catalog_level_rule%rowtype;
  v_base_hp integer;
  v_base_power integer;
  v_base_stats integer;
  v_max_hp integer;
  v_moves jsonb;
  v_instance_id uuid;
  v_box_index bigint;
  v_result jsonb;
begin
  if v_auth_user_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  if p_command_id is null or p_expected_revision is null or p_expected_revision < 0
    or p_mission_index is null or p_mission_index <= 0 then
    raise exception 'Invalid mission command' using errcode = '22023';
  end if;

  v_request := jsonb_build_object(
    'command_type', 'mission_claim',
    'expected_revision', p_expected_revision,
    'mission_index', p_mission_index,
    'selected_reward_item_index', p_selected_reward_item_index,
    'selected_reward_species_key', p_selected_reward_species_key
  );
  v_request_hash := encode(digest(convert_to(v_request::text, 'UTF8'), 'sha256'), 'hex');
  perform pg_advisory_xact_lock(hashtextextended(
    v_auth_user_id::text || ':' || p_command_id::text, 0
  ));

  select * into v_receipt
  from public.player_command_receipt
  where auth_user_id = v_auth_user_id and command_id = p_command_id;
  if found then
    if v_receipt.command_type <> 'mission_claim' or v_receipt.request_hash <> v_request_hash then
      raise exception 'Command id was reused with a different reward' using errcode = '22023';
    end if;
    return v_receipt.result;
  end if;

  select revision into v_revision
  from public.player_state_revision
  where auth_user_id = v_auth_user_id
  for update;
  if v_revision is null then
    raise exception 'Player state was not found' using errcode = 'P0002';
  end if;
  if v_revision <> p_expected_revision then
    raise exception 'Player state changed. Refresh and try again' using errcode = '40001';
  end if;

  select * into strict v_profile
  from public.player_profile_state
  where auth_user_id = v_auth_user_id
  for update;
  perform server_authority_private.sync_player_missions(v_auth_user_id);

  select * into v_state
  from public.player_mission_state
  where auth_user_id = v_auth_user_id and mission_index = p_mission_index
  for update;
  if not found then
    raise exception 'Mission was not found' using errcode = 'P0002';
  end if;

  select * into strict v_mission
  from public.catalog_mission
  where catalog_release_id = v_state.catalog_release_id
    and mission_index = v_state.mission_index;
  if v_state.claim_status <> 'unclaimed'
    or v_state.counter < v_mission.target
    or not server_authority_private.mission_is_active(v_auth_user_id, p_mission_index) then
    raise exception 'Mission is not complete and claimable' using errcode = '22023';
  end if;

  v_reward := v_mission.reward_rules;
  v_reward_kind := v_reward ->> 'kind';
  if v_reward_kind = 'choice' then
    if p_selected_reward_species_key is not null
      or coalesce(p_selected_reward_item_index, 0) <= 0 then
      raise exception 'Choose one of the offered reward items' using errcode = '22023';
    end if;
    select count(*)::integer into v_matching_choices
    from jsonb_array_elements(case
      when jsonb_typeof(v_reward -> 'choices') = 'array' then v_reward -> 'choices'
      else '[]'::jsonb
    end) choices(choice)
    where coalesce(choice ->> 'itemIndex', '') ~ '^[1-9][0-9]*$'
      and choice ->> 'itemIndex' = p_selected_reward_item_index::text;
    if v_matching_choices <> 1 then
      raise exception 'Selected item is not offered' using errcode = '22023';
    end if;
    select choice into v_reward
    from jsonb_array_elements(v_reward -> 'choices') choices(choice)
    where choice ->> 'itemIndex' = p_selected_reward_item_index::text;
    v_reward_kind := v_reward ->> 'kind';
  elsif v_reward_kind = 'pokemon_choice' then
    if p_selected_reward_item_index is not null
      or coalesce(p_selected_reward_species_key, '') !~ '^[1-9][0-9]*$' then
      raise exception 'Choose a reward Pokemon' using errcode = '22023';
    end if;
    v_species_key := p_selected_reward_species_key;
  elsif p_selected_reward_item_index is not null or p_selected_reward_species_key is not null then
    raise exception 'This reward does not accept a selection' using errcode = '22023';
  end if;

  if v_reward_kind in ('dynamic_money', 'dynamic_item') then
    if v_mission.mission_type = 'daily_login' then
      select substring(key from '^reward_badges:([0-8])$')::integer into v_reward_badges
      from unnest(v_state.tracked_keys) key
      where key ~ '^reward_badges:[0-8]$'
      limit 1;
      if v_reward_badges is null then
        raise exception 'Login reward level was not frozen' using errcode = '55000';
      end if;
    else
      v_reward_badges := least(8, greatest(0, v_profile.badges));
    end if;
    v_reward_quantity := coalesce((v_reward ->> 'baseQuantity')::bigint, 0)
      + v_reward_badges * coalesce((v_reward ->> 'perBadge')::bigint, 0);
    if v_reward_quantity <= 0 then
      raise exception 'Invalid dynamic reward' using errcode = '22023';
    end if;
    if v_reward_kind = 'dynamic_money' then
      v_reward := jsonb_build_object(
        'kind', 'money', 'quantity', v_reward_quantity, 'badgeCount', v_reward_badges
      );
      v_reward_kind := 'money';
    else
      v_reward := jsonb_build_object(
        'kind', 'item', 'itemIndex', v_reward -> 'itemIndex',
        'quantity', v_reward_quantity, 'badgeCount', v_reward_badges
      );
      v_reward_kind := 'item';
    end if;
  end if;

  if v_reward_kind = 'money' then
    if coalesce(v_reward ->> 'quantity', '') !~ '^[1-9][0-9]*$' then
      raise exception 'Invalid money reward';
    end if;
    v_reward_quantity := (v_reward ->> 'quantity')::bigint;
    if v_reward_quantity > 9223372036854775807 - v_profile.pokedollars then
      raise exception 'Pokedollar limit exceeded' using errcode = '22003';
    end if;
    update public.player_profile_state
    set pokedollars = pokedollars + v_reward_quantity, updated_at = now()
    where auth_user_id = v_auth_user_id;

  elsif v_reward_kind = 'item' then
    if coalesce(v_reward ->> 'itemIndex', '') !~ '^[1-9][0-9]*$'
      or coalesce(v_reward ->> 'quantity', '') !~ '^[1-9][0-9]*$' then
      raise exception 'Invalid item reward' using errcode = '22023';
    end if;
    v_reward_item_index := (v_reward ->> 'itemIndex')::integer;
    v_reward_quantity := (v_reward ->> 'quantity')::bigint;
    if not exists (
      select 1 from public.catalog_item
      where catalog_release_id = v_state.catalog_release_id
        and item_index = v_reward_item_index
    ) then
      raise exception 'Reward item is outside the catalog';
    end if;
    if coalesce((v_mission.reward_rules ->> 'purchasableNow')::boolean, false)
      and exists (
        select 1 from public.catalog_item item
        where item.catalog_release_id = v_state.catalog_release_id
          and item.item_index = v_reward_item_index
          and item.category_key = 'tm'
          and v_profile.badges < case coalesce((item.rules ->> 'tier')::integer, 3)
            when 0 then 7 when 1 then 6 when 2 then 4 else 0 end
      ) then
      raise exception 'This TM is not available yet' using errcode = '22023';
    end if;
    select coalesce((
      select quantity from public.player_inventory_item
      where auth_user_id = v_auth_user_id and item_index = v_reward_item_index
      for update
    ), 0) into v_inventory_quantity;
    if v_reward_quantity > 2147483647 - v_inventory_quantity then
      raise exception 'Inventory limit exceeded' using errcode = '22003';
    end if;
    insert into public.player_inventory_item(
      auth_user_id, catalog_release_id, item_index, quantity, updated_at
    ) values (
      v_auth_user_id, v_state.catalog_release_id, v_reward_item_index,
      v_reward_quantity::integer, now()
    )
    on conflict(auth_user_id, item_index) do update
    set quantity = player_inventory_item.quantity + excluded.quantity,
        updated_at = now();

  elsif v_reward_kind = 'pokemon_choice' then
    if exists (
      select 1 from public.player_ordinary_progression
      where auth_user_id = v_auth_user_id and status <> 'completed'
    ) then
      raise exception 'Complete pending Pokemon progression first' using errcode = '55000';
    end if;

    if v_reward ->> 'levelMode' = 'fixed'
      and coalesce(v_reward ->> 'level', '') ~ '^[1-9][0-9]*$'
      and (v_reward ->> 'level')::integer between 5 and 100 then
      v_level := (v_reward ->> 'level')::integer;
    elsif v_reward ->> 'levelMode' = 'fixed_5'
      and (v_reward ->> 'level')::integer = 5 then
      v_level := 5;
    elsif v_reward ->> 'levelMode' = 'badge_cap' then
      select (rules ->> 'level')::integer into v_level
      from public.catalog_progression_rule
      where catalog_release_id = v_profile.catalog_release_id
        and rule_family = 'badge_level_limit'
        and rule_key = least(8, greatest(0, v_profile.badges))::text;
    else
      raise exception 'Invalid reward Pokemon level' using errcode = '22023';
    end if;

    if v_reward ? 'requiredRarity' then
      if v_reward ->> 'requiredRarity' <> 'legendary'
        or not exists (
          select 1 from public.catalog_species species
          where species.catalog_release_id = v_profile.catalog_release_id
            and species.species_key = v_species_key
            and species.encounter_rarity_key = v_reward ->> 'requiredRarity'
        ) then
        raise exception 'This Pokemon is not available for the mission' using errcode = '22023';
      end if;
    elsif not exists (
      select 1
      from server_authority_private.mission_pokemon_reward_candidates(
        v_profile.catalog_release_id,
        v_level,
        coalesce((v_reward ->> 'excludeFossils')::boolean, false)
      ) candidate
      where candidate.species_key = v_species_key
    ) then
      raise exception 'This Pokemon is not available for the mission' using errcode = '22023';
    end if;

    select gender_key into v_gender
    from public.catalog_species_gender
    where catalog_release_id = v_profile.catalog_release_id
      and species_key = v_species_key
    order by random()
    limit 1;
    select * into strict v_rule
    from public.catalog_level_rule
    where catalog_release_id = v_profile.catalog_release_id and level = v_level;
    select * into strict v_rule_60
    from public.catalog_level_rule
    where catalog_release_id = v_profile.catalog_release_id and level = 60;

    v_base_hp := coalesce(v_rule.base_hp, v_rule_60.base_hp + greatest(0, v_level - 60) * 3);
    v_base_power := coalesce(v_rule.base_power, v_rule_60.base_power + greatest(0, v_level - 60) * 2);
    v_base_stats := coalesce(v_rule.base_stats, v_rule_60.base_stats + greatest(0, v_level - 60) * 2);
    v_max_hp := v_base_hp - floor(random() * (
      case when v_level >= 35 then 5 when v_level >= 15 then 3 else 1 end
    ))::integer;
    select jsonb_agg(jsonb_build_array(
      move_index,
      v_base_power - floor(random() * (
        case when v_level >= 50 then 5 when v_level >= 20 then 4
          when v_level >= 10 then 3 else 1 end
      ))::integer,
      v_base_stats - floor(random() * (
        case when v_level >= 40 then 3 else 1 end
      ))::integer
    ) order by random_order)
    into v_moves
    from (
      select candidate.move_index, random() random_order
      from (
        select distinct move_index
        from public.catalog_species_level_move
        where catalog_release_id = v_profile.catalog_release_id
          and species_key = v_species_key
          and level <= v_level
      ) candidate
      order by random()
      limit 4
    ) moves;
    if v_moves is null or jsonb_array_length(v_moves) = 0 then
      raise exception 'Reward Pokemon has no valid moves at this level' using errcode = '22023';
    end if;

    v_instance_id := gen_random_uuid();
    insert into public.player_pokemon_instance(
      id, auth_user_id, catalog_release_id, species_key,
      state_version, state, revision
    ) values (
      v_instance_id, v_auth_user_id, v_profile.catalog_release_id, v_species_key,
      1,
      jsonb_build_object(
        's', v_species_key,
        'g', case v_gender when 'male' then 'male' when 'female' then 'female' else null end,
        'l', v_level, 'hp', v_max_hp, 'm', v_moves, 'xp', 0
      ),
      1
    );
    insert into public.player_box_index_state(auth_user_id, next_box_index)
    select v_auth_user_id, coalesce(max(box_index), -1)::bigint + 1
    from public.player_pokemon_placement
    where auth_user_id = v_auth_user_id and placement_type = 'box'
    on conflict(auth_user_id) do nothing;
    select next_box_index into v_box_index
    from public.player_box_index_state
    where auth_user_id = v_auth_user_id
    for update;
    select greatest(v_box_index, coalesce(max(box_index), -1)::bigint + 1)
    into v_box_index
    from public.player_pokemon_placement
    where auth_user_id = v_auth_user_id and placement_type = 'box';
    if v_box_index > 2147483647 then
      raise exception 'Pokemon Box limit exceeded' using errcode = '22003';
    end if;
    update public.player_box_index_state
    set next_box_index = v_box_index + 1, updated_at = now()
    where auth_user_id = v_auth_user_id;
    insert into public.player_pokemon_placement(
      pokemon_instance_id, auth_user_id, placement_type, slot_index, box_index
    ) values (
      v_instance_id, v_auth_user_id, 'box', null, v_box_index::integer
    );
    insert into public.player_dex_entry(auth_user_id, catalog_release_id, species_key)
    values(v_auth_user_id, v_profile.catalog_release_id, v_species_key)
    on conflict do nothing;
    v_reward := jsonb_build_object(
      'kind', 'pokemon', 'speciesKey', v_species_key, 'level', v_level,
      'pokemonInstanceId', v_instance_id, 'boxIndex', v_box_index
    );
  else
    raise exception 'Unsupported mission reward kind: %', coalesce(v_reward_kind, '<null>');
  end if;

  update public.player_mission_state
  set claim_status = 'claimed',
      claim_count = claim_count + 1,
      last_claimed_at = now(),
      updated_at = now()
  where auth_user_id = v_auth_user_id
    and mission_index = p_mission_index;
  perform server_authority_private.sync_player_missions(v_auth_user_id);
  update public.player_state_revision
  set revision = revision + 1, updated_at = now()
  where auth_user_id = v_auth_user_id
  returning revision into v_revision;

  v_result := server_authority_private.player_state_projection(v_auth_user_id)
    || jsonb_build_object(
      'command_id', p_command_id,
      'command_type', 'mission_claim',
      'mission_index', p_mission_index,
      'selected_reward_item_index', p_selected_reward_item_index,
      'selected_reward_species_key', p_selected_reward_species_key,
      'reward', v_reward,
      'pokemon_instance_id', v_instance_id
    );
  insert into public.player_command_receipt(
    auth_user_id, command_id, command_type, request_hash, result, resulting_revision
  ) values (
    v_auth_user_id, p_command_id, 'mission_claim', v_request_hash, v_result, v_revision
  );
  v_result := server_authority_private.player_state_projection(v_auth_user_id)
    || jsonb_build_object(
      'command_id', p_command_id,
      'command_type', 'mission_claim',
      'mission_index', p_mission_index,
      'selected_reward_item_index', p_selected_reward_item_index,
      'selected_reward_species_key', p_selected_reward_species_key,
      'reward', v_reward,
      'pokemon_instance_id', v_instance_id
    );
  update public.player_command_receipt
  set result = v_result
  where auth_user_id = v_auth_user_id and command_id = p_command_id;
  return v_result;
end;
$_$;

commit;
