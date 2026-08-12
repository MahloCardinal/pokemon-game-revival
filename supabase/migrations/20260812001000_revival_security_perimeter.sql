begin;

-- Battle Tower runs are backend-owned aggregates. They intentionally expose no
-- browser policy: the Edge Function reads and mutates them with service_role.
alter table public.authoritative_battle_tower_run enable row level security;
alter table public.authoritative_battle_tower_run_pokemon enable row level security;

-- Keep Realtime visibility aligned with the stable Revival contract names.
alter policy authoritative_battle_admin_realtime_select
on public.authoritative_battle
using (
  contract_key = any (array['admin_gym'::text, 'league'::text, 'debug_training'::text])
  and public.current_user_has_server_role('admin'::text)
);

alter policy authoritative_battle_realtime_select
on public.authoritative_battle
using (
  auth_user_id = (select auth.uid())
  or (
    contract_key = any (array['admin_gym'::text, 'league'::text])
    and (select public.current_user_has_server_role('admin'::text))
  )
);

alter policy authoritative_battle_event_admin_realtime_select
on public.authoritative_battle_event
using (
  public.current_user_has_server_role('admin'::text)
  and exists (
    select 1
    from public.authoritative_battle battle
    where battle.id = authoritative_battle_event.battle_id
      and battle.contract_key = any (array['admin_gym'::text, 'league'::text, 'debug_training'::text])
  )
);

alter policy authoritative_battle_event_realtime_select
on public.authoritative_battle_event
using (
  exists (
    select 1
    from public.authoritative_battle battle
    where battle.id = authoritative_battle_event.battle_id
      and (
        battle.auth_user_id = (select auth.uid())
        or (
          battle.contract_key = any (array['admin_gym'::text, 'league'::text])
          and (select public.current_user_has_server_role('admin'::text))
        )
      )
  )
);

-- PostgreSQL grants EXECUTE to PUBLIC by default. Start from a closed function
-- perimeter, retain unrestricted backend execution, then expose only the small
-- set of RPC entry points that the authenticated SPA calls directly.
revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on all functions in schema public to service_role;

do $permissions$
declare
  function_record record;
begin
  for function_record in
    select procedure.oid::regprocedure as signature
    from pg_proc procedure
    join pg_namespace namespace on namespace.oid = procedure.pronamespace
    where namespace.nspname = 'public'
      and procedure.proname = any (array[
        'append_admin_global_activity_message',
        'append_global_activity_feed_event',
        'buy_battle_shop_offer_authoritative',
        'buy_shop_item_authoritative',
        'choose_starter_authoritative',
        'claim_authoritative_battle_runtime',
        'claim_daily_berry_authoritative',
        'claim_player_mission_authoritative',
        'current_user_has_server_role',
        'deposit_daycare_pokemon_authoritative',
        'execute_pokemon_center_command_authoritative',
        'execute_pokemon_center_move_tutor_authoritative',
        'get_battle_shop_offers',
        'get_current_player_state',
        'harvest_garden_plot_authoritative',
        'list_global_activity_feed',
        'move_box_pokemon_to_team_authoritative',
        'move_team_pokemon_to_box_authoritative',
        'plant_garden_berry_authoritative',
        'release_box_pokemon_authoritative',
        'resolve_daycare_withdrawal_authoritative',
        'sell_shop_item_authoritative',
        'start_wild_encounter_authoritative',
        'swap_team_pokemon_slots_authoritative',
        'sync_player_missions_authoritative',
        'withdraw_daycare_pokemon_authoritative'
      ]::text[])
  loop
    execute format('grant execute on function %s to authenticated', function_record.signature);
  end loop;
end
$permissions$;

-- New functions are private until a later migration explicitly exposes a
-- deliberate browser entry point.
alter default privileges for role postgres in schema public
  revoke execute on functions from public, anon, authenticated;

commit;
