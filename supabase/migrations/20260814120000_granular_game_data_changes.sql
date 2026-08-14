begin;

create table public.game_data_change_set (
  revision bigint generated always as identity primary key,
  id uuid not null default gen_random_uuid() unique,
  catalog_release_id uuid not null references public.catalog_release(id) on delete restrict,
  label text not null,
  affected_families text[] not null,
  source_checksums jsonb not null default '{}'::jsonb,
  requires_battle_idle boolean not null default false,
  status text not null default 'applying',
  previous_catalog_checksum text not null,
  resulting_catalog_checksum text,
  created_at timestamptz not null default now(),
  applied_at timestamptz,
  constraint game_data_change_set_label_check check (length(btrim(label)) between 3 and 160),
  constraint game_data_change_set_families_check check (cardinality(affected_families) > 0),
  constraint game_data_change_set_source_checksums_check check (jsonb_typeof(source_checksums) = 'object'),
  constraint game_data_change_set_status_check check (status in ('applying', 'applied')),
  constraint game_data_change_set_completion_check check (
    (status = 'applying' and resulting_catalog_checksum is null and applied_at is null)
    or (status = 'applied' and resulting_catalog_checksum is not null and applied_at is not null)
  )
);

create table public.game_data_change (
  id bigint generated always as identity primary key,
  change_set_revision bigint not null references public.game_data_change_set(revision) on delete restrict,
  table_name text not null,
  operation text not null,
  row_before jsonb,
  row_after jsonb,
  changed_at timestamptz not null default now(),
  constraint game_data_change_operation_check check (operation in ('INSERT', 'UPDATE', 'DELETE')),
  constraint game_data_change_shape_check check (
    (operation = 'INSERT' and row_before is null and row_after is not null)
    or (operation = 'UPDATE' and row_before is not null and row_after is not null)
    or (operation = 'DELETE' and row_before is not null and row_after is null)
  )
);

create index game_data_change_change_set_revision_idx
  on public.game_data_change(change_set_revision, id);

alter table public.game_data_change_set enable row level security;
alter table public.game_data_change enable row level security;

revoke all on table public.game_data_change_set from public, anon, authenticated;
revoke all on table public.game_data_change from public, anon, authenticated;
grant select on table public.game_data_change_set to service_role;
grant select on table public.game_data_change to service_role;

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
    when 'opponents' then 'catalog_opponent'
    else null
  end
$$;

create or replace function server_authority_private.track_game_data_change()
returns trigger
language plpgsql
security definer
set search_path = public, server_authority_private, pg_temp
as $$
declare
  v_change_set_id uuid;
  v_change_set_revision bigint;
  v_release_id uuid;
begin
  begin
    v_change_set_id := nullif(current_setting('server_authority.game_data_change_set_id', true), '')::uuid;
  exception when invalid_text_representation then
    raise exception 'invalid game-data change-set context' using errcode = '55000';
  end;

  if v_change_set_id is null then
    raise exception 'catalog rows can only change inside a game-data change set' using errcode = '55000';
  end if;

  v_release_id := case when tg_op = 'DELETE' then old.catalog_release_id else new.catalog_release_id end;
  select revision into v_change_set_revision
  from public.game_data_change_set
  where id = v_change_set_id
    and catalog_release_id = v_release_id
    and status = 'applying';

  if v_change_set_revision is null then
    raise exception 'game-data change-set context is missing, closed, or belongs to another catalog'
      using errcode = '55000';
  end if;

  insert into public.game_data_change (
    change_set_revision, table_name, operation, row_before, row_after
  ) values (
    v_change_set_revision,
    tg_table_name,
    tg_op,
    case when tg_op = 'INSERT' then null else to_jsonb(old) - 'catalog_release_id' end,
    case when tg_op = 'DELETE' then null else to_jsonb(new) - 'catalog_release_id' end
  );

  return case when tg_op = 'DELETE' then old else new end;
end
$$;

do $install_game_data_audit_triggers$
declare
  v_table record;
begin
  for v_table in
    select distinct table_name
    from information_schema.columns
    where table_schema = 'public'
      and column_name = 'catalog_release_id'
      and table_name like 'catalog\_%' escape '\'
      and table_name not in (
        'catalog_engine_runtime_binding', 'catalog_import_batch', 'catalog_import_chunk'
      )
    order by table_name
  loop
    execute format(
      'create trigger track_game_data_change after insert or update or delete on public.%I for each row execute function server_authority_private.track_game_data_change()',
      v_table.table_name
    );
  end loop;
end
$install_game_data_audit_triggers$;

create or replace function server_authority_private.ensure_game_data_change_completed()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not exists (
    select 1 from public.game_data_change_set
    where revision = new.revision and status = 'applied'
  ) then
    raise exception 'game-data change set % was not completed before commit', new.revision
      using errcode = '55000';
  end if;
  return null;
end
$$;

create constraint trigger ensure_game_data_change_completed
after insert or update on public.game_data_change_set
deferrable initially deferred
for each row execute function server_authority_private.ensure_game_data_change_completed();

create or replace function server_authority_private.begin_game_data_change(
  p_label text,
  p_affected_families text[],
  p_source_checksums jsonb default '{}'::jsonb,
  p_requires_battle_idle boolean default false
)
returns bigint
language plpgsql
security definer
set search_path = public, server_authority_private, pg_temp
as $$
declare
  v_release public.catalog_release%rowtype;
  v_change_set_id uuid;
  v_revision bigint;
  v_family text;
  v_source record;
begin
  perform pg_advisory_xact_lock(hashtextextended('pokemon-game-revival:game-data-change', 0));

  if length(btrim(coalesce(p_label, ''))) not between 3 and 160 then
    raise exception 'game-data change label must contain 3 to 160 characters' using errcode = '22023';
  end if;
  if coalesce(cardinality(p_affected_families), 0) = 0 then
    raise exception 'at least one affected catalog family is required' using errcode = '22023';
  end if;
  if jsonb_typeof(coalesce(p_source_checksums, '{}'::jsonb)) <> 'object' then
    raise exception 'source checksums must be a JSON object' using errcode = '22023';
  end if;

  foreach v_family in array p_affected_families loop
    if server_authority_private.catalog_family_tables(v_family) is null then
      raise exception 'unsupported catalog family: %', v_family using errcode = '22023';
    end if;
  end loop;
  if cardinality(p_affected_families) <> (
    select count(distinct family)::integer from unnest(p_affected_families) family
  ) then
    raise exception 'affected catalog families must be unique' using errcode = '22023';
  end if;

  for v_source in select key source_path, value source_checksum from jsonb_each_text(coalesce(p_source_checksums, '{}'::jsonb))
  loop
    if v_source.source_checksum !~ '^[0-9a-f]{64}$' then
      raise exception 'invalid SHA-256 for source %', v_source.source_path using errcode = '22023';
    end if;
  end loop;

  if (select count(*) from public.catalog_release) <> 1 then
    raise exception 'granular updates require exactly one catalog release' using errcode = '55000';
  end if;

  select * into strict v_release
  from public.catalog_release
  where version = 'revival-baseline' and status = 'published'
  for update;

  if exists (select 1 from public.game_data_change_set where status = 'applying') then
    raise exception 'another game-data change set is already applying' using errcode = '55000';
  end if;

  if p_requires_battle_idle and (
    exists (select 1 from public.authoritative_battle where status not in ('concluded', 'abandoned'))
    or exists (select 1 from public.authoritative_league_run where status in ('awaiting_battle', 'active'))
    or exists (select 1 from public.authoritative_battle_tower_run where status in ('active', 'awaiting_next'))
    or exists (select 1 from public.player_encounter where status = 'active')
    or exists (select 1 from public.player_pending_resolution where status = 'pending')
    or exists (select 1 from public.player_ordinary_progression where status = 'awaiting_choices')
    or exists (select 1 from public.player_training_progression where status in ('awaiting_allocation', 'awaiting_choices'))
  ) then
    raise exception 'this game-data change requires battles and pending resolutions to be idle'
      using errcode = '55000';
  end if;

  insert into public.game_data_change_set (
    catalog_release_id, label, affected_families, source_checksums,
    requires_battle_idle, previous_catalog_checksum
  ) values (
    v_release.id, btrim(p_label), p_affected_families,
    coalesce(p_source_checksums, '{}'::jsonb), p_requires_battle_idle,
    v_release.checksum
  ) returning id, revision into v_change_set_id, v_revision;

  perform set_config('server_authority.game_data_change_set_id', v_change_set_id::text, true);

  update public.catalog_release
  set status = 'draft', published_at = null
  where id = v_release.id;

  return v_revision;
end
$$;

create or replace function server_authority_private.refresh_catalog_family_manifest(
  p_catalog_release_id uuid,
  p_family text
)
returns void
language plpgsql
security definer
set search_path = public, server_authority_private, pg_temp
as $$
declare
  v_tables text[];
  v_primary_table text;
  v_table text;
  v_count integer;
  v_row_count integer := 0;
  v_entity_counts jsonb := '{}'::jsonb;
  v_updated integer;
begin
  v_tables := server_authority_private.catalog_family_tables(p_family);
  v_primary_table := server_authority_private.catalog_family_primary_table(p_family);
  if v_tables is null then
    raise exception 'unsupported catalog family: %', p_family using errcode = '22023';
  end if;

  foreach v_table in array v_tables loop
    execute format('select count(*)::integer from public.%I where catalog_release_id = $1', v_table)
      into v_count using p_catalog_release_id;
    v_entity_counts := v_entity_counts || jsonb_build_object(v_table, v_count);
    if v_primary_table is null then
      v_row_count := v_row_count + v_count;
    elsif v_table = v_primary_table then
      v_row_count := v_count;
    end if;
  end loop;

  update public.catalog_import_batch
  set row_count = v_row_count,
      entity_counts = v_entity_counts,
      imported_at = now()
  where catalog_release_id = p_catalog_release_id
    and family_key = p_family
    and row_count is not null;
  get diagnostics v_updated = row_count;

  if v_updated <> 1 then
    raise exception 'catalog family % must have exactly one primary manifest, found %', p_family, v_updated
      using errcode = '55000';
  end if;
end
$$;

create or replace function server_authority_private.compute_game_data_checksum(p_catalog_release_id uuid)
returns text
language plpgsql
stable
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_table record;
  v_rows text;
  v_input text := '';
begin
  for v_table in
    select distinct columns.table_name
    from information_schema.columns columns
    where columns.table_schema = 'public'
      and columns.column_name = 'catalog_release_id'
      and columns.table_name like 'catalog\_%' escape '\'
      and columns.table_name not in (
        'catalog_engine_runtime_binding', 'catalog_import_batch', 'catalog_import_chunk'
      )
    order by columns.table_name
  loop
    execute format(
      'select coalesce(string_agg((to_jsonb(row_data) - ''catalog_release_id'')::text, E''\\n'' order by (to_jsonb(row_data) - ''catalog_release_id'')::text), '''') from public.%I row_data where catalog_release_id = $1',
      v_table.table_name
    ) into v_rows using p_catalog_release_id;
    v_input := v_input || v_table.table_name || E'\n' || v_rows || E'\n';
  end loop;

  return 'sha256:' || encode(digest(convert_to(v_input, 'UTF8'), 'sha256'), 'hex');
end
$$;

create or replace function server_authority_private.finish_game_data_change()
returns jsonb
language plpgsql
security definer
set search_path = public, server_authority_private, extensions, pg_temp
as $$
declare
  v_change_set_id uuid;
  v_change_set public.game_data_change_set%rowtype;
  v_family text;
  v_source record;
  v_updated integer;
  v_checksum text;
begin
  begin
    v_change_set_id := nullif(current_setting('server_authority.game_data_change_set_id', true), '')::uuid;
  exception when invalid_text_representation then
    raise exception 'invalid game-data change-set context' using errcode = '55000';
  end;

  if v_change_set_id is null then
    raise exception 'no game-data change set is active in this transaction' using errcode = '55000';
  end if;

  select * into strict v_change_set
  from public.game_data_change_set
  where id = v_change_set_id and status = 'applying'
  for update;

  if not exists (
    select 1 from public.game_data_change
    where change_set_revision = v_change_set.revision
  ) then
    raise exception 'game-data change set % did not change any catalog row', v_change_set.revision
      using errcode = '55000';
  end if;

  for v_source in select key source_path, value source_checksum from jsonb_each_text(v_change_set.source_checksums)
  loop
    update public.catalog_import_batch
    set source_checksum = v_source.source_checksum,
        imported_at = now()
    where catalog_release_id = v_change_set.catalog_release_id
      and family_key = any(v_change_set.affected_families)
      and source_path = v_source.source_path;
    get diagnostics v_updated = row_count;
    if v_updated <> 1 then
      raise exception 'source path % must match exactly one affected catalog manifest, found %', v_source.source_path, v_updated
        using errcode = '55000';
    end if;
  end loop;

  foreach v_family in array v_change_set.affected_families loop
    perform server_authority_private.refresh_catalog_family_manifest(
      v_change_set.catalog_release_id, v_family
    );
  end loop;

  perform public.publish_catalog_release('revival-baseline');
  v_checksum := server_authority_private.compute_game_data_checksum(v_change_set.catalog_release_id);

  update public.catalog_release
  set checksum = v_checksum
  where id = v_change_set.catalog_release_id and status = 'published';
  if not found then
    raise exception 'catalog release was not republished by the game-data change set'
      using errcode = '55000';
  end if;

  update public.game_data_change_set
  set status = 'applied',
      resulting_catalog_checksum = v_checksum,
      applied_at = now()
  where revision = v_change_set.revision;

  perform set_config('server_authority.game_data_change_set_id', '', true);

  return jsonb_build_object(
    'revision', v_change_set.revision,
    'catalog_release_id', v_change_set.catalog_release_id,
    'catalog_checksum', v_checksum,
    'changed_rows', (
      select count(*) from public.game_data_change
      where change_set_revision = v_change_set.revision
    )
  );
end
$$;

create or replace function public.get_game_data_revision()
returns bigint
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(max(revision) filter (where status = 'applied'), 0)
  from public.game_data_change_set
$$;

create or replace function server_authority_private.player_state_projection(p_auth_user_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public, server_authority_private, pg_temp
as $$
  select server_authority_private.player_state_projection_before_battle_shop(p_auth_user_id)
    || jsonb_build_object('game_data_revision', public.get_game_data_revision())
$$;

revoke all on function public.publish_catalog_release(text) from anon, authenticated;
revoke all on function server_authority_private.catalog_family_tables(text) from public;
revoke all on function server_authority_private.catalog_family_primary_table(text) from public;
revoke all on function server_authority_private.track_game_data_change() from public;
revoke all on function server_authority_private.ensure_game_data_change_completed() from public;
revoke all on function server_authority_private.begin_game_data_change(text, text[], jsonb, boolean) from public, anon, authenticated, service_role;
revoke all on function server_authority_private.refresh_catalog_family_manifest(uuid, text) from public, anon, authenticated, service_role;
revoke all on function server_authority_private.compute_game_data_checksum(uuid) from public, anon, authenticated;
revoke all on function server_authority_private.finish_game_data_change() from public, anon, authenticated, service_role;
revoke all on function public.get_game_data_revision() from public;
grant execute on function public.get_game_data_revision() to anon, authenticated, service_role;

comment on table public.game_data_change_set is
  'Atomic revision history for in-place granular updates of the single Revival catalog baseline.';
comment on table public.game_data_change is
  'Row-level audit trail for catalog changes made by a game-data change set.';
comment on function server_authority_private.begin_game_data_change(text, text[], jsonb, boolean) is
  'Starts a transaction-scoped, audited update of selected catalog families without cloning the release.';
comment on function server_authority_private.finish_game_data_change() is
  'Refreshes affected manifests, republishes the stable baseline and completes its atomic data revision.';

commit;
