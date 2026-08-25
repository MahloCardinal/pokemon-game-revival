begin;

alter table public.authoritative_battle_participant
add column status text;

comment on column public.authoritative_battle_participant.status is
  'Technical battle status key synchronized from the authoritative engine snapshot.';

create or replace function server_authority_private.sync_authoritative_battle_participant_statuses()
returns trigger
language plpgsql
security definer
set search_path = public, server_authority_private, pg_temp
as $$
begin
  if new.engine_snapshot is null then
    return null;
  end if;

  with snapshot_status as (
    select
      'player'::text as side,
      server_authority_private.edge_jsonb_bigint(pokemon.value #> '{state,authoritativeSlot}') as slot_index,
      nullif(combatant.value #>> '{state,status}', '') as status
    from jsonb_array_elements(new.engine_snapshot #> '{playerTeam,pokemon}') with ordinality pokemon(value, ordinality)
    join jsonb_array_elements(new.engine_snapshot #> '{playerTeam,combatants}') with ordinality combatant(value, ordinality) using (ordinality)

    union all

    select
      'npc'::text,
      server_authority_private.edge_jsonb_bigint(pokemon.value #> '{state,authoritativeSlot}'),
      nullif(combatant.value #>> '{state,status}', '')
    from jsonb_array_elements(new.engine_snapshot #> '{enemyTeam,pokemon}') with ordinality pokemon(value, ordinality)
    join jsonb_array_elements(new.engine_snapshot #> '{enemyTeam,combatants}') with ordinality combatant(value, ordinality) using (ordinality)
  )
  update public.authoritative_battle_participant participant
  set status = snapshot_status.status
  from snapshot_status
  where participant.battle_id = new.id
    and participant.side = snapshot_status.side
    and participant.slot_index = snapshot_status.slot_index;

  return null;
end
$$;

create trigger sync_authoritative_battle_participant_statuses
after insert or update of engine_snapshot on public.authoritative_battle
for each row execute function server_authority_private.sync_authoritative_battle_participant_statuses();

with snapshot_status as (
  select
    battle.id as battle_id,
    'player'::text as side,
    server_authority_private.edge_jsonb_bigint(pokemon.value #> '{state,authoritativeSlot}') as slot_index,
    nullif(combatant.value #>> '{state,status}', '') as status
  from public.authoritative_battle battle
  cross join lateral jsonb_array_elements(battle.engine_snapshot #> '{playerTeam,pokemon}') with ordinality pokemon(value, ordinality)
  join lateral jsonb_array_elements(battle.engine_snapshot #> '{playerTeam,combatants}') with ordinality combatant(value, ordinality) using (ordinality)
  where battle.engine_snapshot is not null

  union all

  select
    battle.id,
    'npc'::text,
    server_authority_private.edge_jsonb_bigint(pokemon.value #> '{state,authoritativeSlot}'),
    nullif(combatant.value #>> '{state,status}', '')
  from public.authoritative_battle battle
  cross join lateral jsonb_array_elements(battle.engine_snapshot #> '{enemyTeam,pokemon}') with ordinality pokemon(value, ordinality)
  join lateral jsonb_array_elements(battle.engine_snapshot #> '{enemyTeam,combatants}') with ordinality combatant(value, ordinality) using (ordinality)
  where battle.engine_snapshot is not null
)
update public.authoritative_battle_participant participant
set status = snapshot_status.status
from snapshot_status
where participant.battle_id = snapshot_status.battle_id
  and participant.side = snapshot_status.side
  and participant.slot_index = snapshot_status.slot_index;

revoke all on function server_authority_private.sync_authoritative_battle_participant_statuses()
from public, anon, authenticated, service_role;

commit;
