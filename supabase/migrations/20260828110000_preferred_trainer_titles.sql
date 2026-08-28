begin;

alter table public.catalog_title
  drop constraint catalog_title_unlock_type_check;
alter table public.catalog_title
  add constraint catalog_title_unlock_type_check check (unlock_type in (
    'starter_selected', 'pokedex_type_complete', 'berries_harvested',
    'opponent_victory', 'battle_tower_streak'
  ));

select server_authority_private.begin_game_data_change(
  p_label => 'Aggiunge il Titolo onboarding Nuovo arrivato',
  p_affected_families => array['titles']::text[],
  p_source_checksums => jsonb_build_object(
    'app/data/titles.js', 'c7e1fd14fa89489645202877ec3b32fb6bf835441d1cfb3896a1899fcbfdef9e'
  ),
  p_requires_battle_idle => false
);

insert into public.catalog_title(
  catalog_release_id, title_key, collection_key, sort_order, unlock_type, unlock_rules
)
select release.id, 'newcomer', 'trainer_titles_onboarding', 22, 'starter_selected', '{}'::jsonb
from public.catalog_release release
where release.version = 'revival-baseline';

select server_authority_private.finish_game_data_change();

alter table public.player_title
  add column is_preferred boolean not null default false;

create unique index player_title_one_preferred_idx
  on public.player_title(auth_user_id)
  where is_preferred;

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
  v_make_preferred boolean;
begin
  perform pg_advisory_xact_lock(hashtextextended(
    p_auth_user_id::text || ':trainer-title', 0
  ));

  select catalog_release_id into v_catalog_release_id
  from public.player_profile_state
  where auth_user_id = p_auth_user_id;
  if v_catalog_release_id is null then return false; end if;

  v_make_preferred := not exists (
    select 1 from public.player_title
    where auth_user_id = p_auth_user_id
      and is_preferred
  );

  insert into public.player_title(
    auth_user_id, catalog_release_id, title_key, unlocked_at, is_preferred
  )
  select p_auth_user_id, v_catalog_release_id, title.title_key,
    coalesce(p_unlocked_at, now()), v_make_preferred
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

  if exists (
    select 1 from public.player_starter_selection starter
    where starter.auth_user_id = p_auth_user_id
      and starter.catalog_release_id = v_profile.catalog_release_id
  ) then
    perform server_authority_private.grant_player_title(
      p_auth_user_id, 'newcomer', now()
    );
  end if;

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

create or replace function server_authority_private.process_newcomer_title_starter()
returns trigger
language plpgsql
security definer
set search_path = public, server_authority_private, pg_temp
as $$
begin
  perform server_authority_private.grant_player_title(
    new.auth_user_id, 'newcomer', new.selected_at
  );
  return new;
end;
$$;

create trigger process_newcomer_title_starter
after insert on public.player_starter_selection
for each row execute function server_authority_private.process_newcomer_title_starter();

create or replace function server_authority_private.restore_player_preferred_title()
returns trigger
language plpgsql
security definer
set search_path = public, server_authority_private, pg_temp
as $$
begin
  if old.is_preferred then
    update public.player_title owned
    set is_preferred = true
    from (
      select remaining.auth_user_id, remaining.title_key
      from public.player_title remaining
      join public.catalog_title title
        on title.catalog_release_id = remaining.catalog_release_id
       and title.title_key = remaining.title_key
      where remaining.auth_user_id = old.auth_user_id
        and remaining.title_key <> old.title_key
      order by title.sort_order, remaining.title_key
      limit 1
    ) replacement
    where owned.auth_user_id = replacement.auth_user_id
      and owned.title_key = replacement.title_key;
  end if;
  return old;
end;
$$;

create trigger restore_player_preferred_title
after delete on public.player_title
for each row execute function server_authority_private.restore_player_preferred_title();

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
          'unlocked_at', player_title.unlocked_at,
          'is_preferred', player_title.is_preferred
        ) order by player_title.is_preferred desc, title.sort_order)
        from public.player_title player_title
        join public.catalog_title title
          on title.catalog_release_id = player_title.catalog_release_id
         and title.title_key = player_title.title_key
        where player_title.auth_user_id = p_auth_user_id
      ), '[]'::jsonb)
    )
$$;

create or replace function public.set_preferred_trainer_title(p_title_key text)
returns jsonb
language plpgsql
security definer
set search_path = public, server_authority_private, pg_temp
as $$
declare
  v_auth_user_id uuid := auth.uid();
  v_catalog_release_id uuid;
begin
  if v_auth_user_id is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;
  if coalesce(p_title_key, '') !~ '^[a-z][a-z0-9_]*$' then
    raise exception 'invalid Trainer Title key' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(
    v_auth_user_id::text || ':trainer-title', 0
  ));

  select catalog_release_id into strict v_catalog_release_id
  from public.player_profile_state
  where auth_user_id = v_auth_user_id;

  if not exists (
    select 1 from public.player_title
    where auth_user_id = v_auth_user_id
      and catalog_release_id = v_catalog_release_id
      and title_key = p_title_key
  ) then
    raise exception 'Trainer Title is not owned' using errcode = '22023';
  end if;

  update public.player_title
  set is_preferred = false
  where auth_user_id = v_auth_user_id
    and catalog_release_id = v_catalog_release_id
    and is_preferred
    and title_key <> p_title_key;

  update public.player_title
  set is_preferred = true
  where auth_user_id = v_auth_user_id
    and catalog_release_id = v_catalog_release_id
    and title_key = p_title_key
    and not is_preferred;

  return server_authority_private.player_state_projection(v_auth_user_id);
end;
$$;

revoke all on function public.set_preferred_trainer_title(text)
  from public, anon, authenticated;
grant execute on function public.set_preferred_trainer_title(text)
  to authenticated, service_role;

create or replace function public.list_player_directory()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, server_authority_private, pg_temp
as $$
declare
  v_auth_user_id uuid := auth.uid();
begin
  if v_auth_user_id is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;

  return (
    select jsonb_build_object(
      'players', coalesce(jsonb_agg(
        jsonb_build_object(
          'username', left(coalesce(nullif(btrim(recovery.username), ''), 'Allenatore'), 32),
          'badges', least(8, greatest(0, profile.badges)),
          'team', coalesce(team_data.team, '[]'::jsonb),
          'preferred_title', title_data.preferred_title
        )
        order by lower(coalesce(recovery.username, '')), profile.auth_user_id
      ), '[]'::jsonb),
      'generated_at', now()
    )
    from public.player_profile_state profile
    join public.player_auth_recovery recovery
      on recovery.auth_user_id = profile.auth_user_id
    left join lateral (
      select jsonb_agg(
        jsonb_build_object(
          'slot', placement.slot_index,
          'pokemon',
            jsonb_build_object(
              's', pokemon.state ->> 's',
              'l', greatest(1, coalesce((pokemon.state ->> 'l')::integer, 1)),
              'hp', greatest(1, coalesce((pokemon.state ->> 'hp')::integer, 1)),
              'm', case when jsonb_typeof(pokemon.state -> 'm') = 'array'
                then pokemon.state -> 'm' else '[]'::jsonb end,
              'xp', greatest(0, coalesce((pokemon.state ->> 'xp')::integer, 0))
            )
            || case when coalesce((pokemon.state ->> 'i')::integer, 0) > 0
              then jsonb_build_object('i', (pokemon.state ->> 'i')::integer)
              else '{}'::jsonb end
        )
        order by placement.slot_index
      ) as team
      from public.player_pokemon_placement placement
      join public.player_pokemon_instance pokemon
        on pokemon.id = placement.pokemon_instance_id
       and pokemon.auth_user_id = placement.auth_user_id
      where placement.auth_user_id = profile.auth_user_id
        and placement.placement_type = 'team'
    ) team_data on true
    left join lateral (
      select owned.title_key as preferred_title
      from public.player_title owned
      where owned.auth_user_id = profile.auth_user_id
        and owned.catalog_release_id = profile.catalog_release_id
        and owned.is_preferred
      limit 1
    ) title_data on true
    where profile.auth_user_id <> v_auth_user_id
  );
end;
$$;

revoke all on function public.list_player_directory() from public, anon, authenticated;
grant execute on function public.list_player_directory() to authenticated, service_role;

revoke all on function server_authority_private.grant_player_title(uuid, text, timestamptz) from public;
revoke all on function server_authority_private.sync_player_titles(uuid) from public;
revoke all on function server_authority_private.process_newcomer_title_starter() from public;
revoke all on function server_authority_private.restore_player_preferred_title() from public;

comment on column public.player_title.is_preferred is
  'At most one owned Trainer Title per player is selected for public display.';
comment on function public.set_preferred_trainer_title(text) is
  'Selects one owned Trainer Title for display without mutating gameplay revision.';

commit;
