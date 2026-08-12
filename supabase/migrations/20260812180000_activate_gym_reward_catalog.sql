begin;

do $activation$
declare
  target_version constant text := 'revival-gym-rewards-20260812';
  runtime_version constant text := 'pokemon-game-revival';
  previous_runtime_checksum constant text := '7261d3eee08c04e4cf65693c9c3843443258a1cbd202e2c25c41d475ee708480';
  target_runtime_checksum constant text := '51ebd82cd1373b029f5b7e54aa8c3e5ee08732c7e05ce11b5ce3db12e048367f';
  previous_catalog_id uuid;
  target_catalog_id uuid;
begin
  select id into strict target_catalog_id
  from public.catalog_release
  where version = target_version and status = 'draft'
  for update;

  select id into strict previous_catalog_id
  from public.catalog_release
  where status = 'published'
  for update;

  if exists (
    select 1
    from public.authoritative_battle
    where status in ('active', 'needs_player_switch')
       or engine_runtime_state = 'pending'
  ) then
    raise exception 'cannot activate a new catalog while authoritative battles are active or pending'
      using errcode = '55000';
  end if;

  if exists (
    select 1
    from (values
      ('gym_plumbeopoli', 3000, 'ps_su', 3, 0),
      ('gym_celestopoli', 5000, 'puroaroma', 1, 1),
      ('gym_aranciopoli', 7000, 'pp_su', 3, 2),
      ('gym_azzurropoli', 10000, 'flauto_nero', 1, 3),
      ('gym_zafferanopoli', 20000, 'bizzoaroma', 1, 4),
      ('gym_fucsiapoli', 30000, 'pp_max', 3, 5),
      ('gym_isola-cannella', 50000, 'flauto_bianco', 1, 6),
      ('gym_smeraldopoli', 70000, 'roccia_di_re', 1, 7)
    ) expected(opponent_key, money, item_key, item_quantity, badge_index)
    where not exists (
      select 1
      from public.catalog_opponent opponent
      where opponent.catalog_release_id = target_catalog_id
        and opponent.opponent_key = expected.opponent_key
        and opponent.opponent_kind = 'gym'
        and opponent.badge_index = expected.badge_index
        and (select count(*) from public.catalog_opponent_reward reward
          where reward.catalog_release_id = target_catalog_id
            and reward.opponent_key = expected.opponent_key) = 3
        and exists (select 1 from public.catalog_opponent_reward reward
          where reward.catalog_release_id = target_catalog_id
            and reward.opponent_key = expected.opponent_key
            and reward.reward_kind = 'money'
            and reward.item_index is null
            and reward.quantity = expected.money)
        and exists (select 1 from public.catalog_opponent_reward reward
          join public.catalog_item item
            on item.catalog_release_id = reward.catalog_release_id
           and item.item_index = reward.item_index
          where reward.catalog_release_id = target_catalog_id
            and reward.opponent_key = expected.opponent_key
            and reward.reward_kind = 'item'
            and reward.quantity = expected.item_quantity
            and item.item_key = expected.item_key)
        and exists (select 1 from public.catalog_opponent_reward reward
          where reward.catalog_release_id = target_catalog_id
            and reward.opponent_key = expected.opponent_key
            and reward.reward_kind = 'badge'
            and reward.item_index is null
            and reward.quantity = 1
            and (reward.rules ->> 'badgeIndex')::integer = expected.badge_index)
    )
  ) then
    raise exception 'the target catalog does not contain the expected gym rewards'
      using errcode = '22023';
  end if;

  insert into public.catalog_engine_runtime_binding (
    catalog_release_id,
    engine_version,
    engine_checksum,
    enabled
  ) values
    (target_catalog_id, runtime_version, previous_runtime_checksum, true),
    (target_catalog_id, runtime_version, target_runtime_checksum, true)
  on conflict (catalog_release_id, engine_version, engine_checksum)
  do update set enabled = excluded.enabled;

  update public.catalog_release
  set status = 'retired'
  where id = previous_catalog_id;

  perform public.publish_catalog_release(target_version);

  update public.player_profile_state
  set catalog_release_id = target_catalog_id,
      updated_at = now()
  where catalog_release_id = previous_catalog_id;

  if exists (
    select 1
    from auth.users account
    where lower(account.email) = 'aaa@pokemon-game-revival.local'
      and not exists (
        select 1
        from public.user_server_role role
        where role.auth_user_id = account.id
          and role.role_key = 'debug'
      )
  ) then
    raise exception 'the aaa debug role was not preserved'
      using errcode = '55000';
  end if;
end
$activation$;

commit;
