-- A terminal capture command updates the battle before it increments the
-- player revision. During that same transaction, the generic encounter
-- invalidation trigger must leave the bound encounter to the capture wrapper:
-- it will consume it after a successful Ball, or cancel it after another
-- terminal outcome. Without this narrow transaction guard, a successful Ball
-- cancels its own encounter immediately before finish_capture_success().

create or replace function server_authority_private.cancel_unbound_wild_encounters_after_activity()
returns trigger
language plpgsql
security definer
set search_path = 'public', 'server_authority_private', 'pg_temp'
as $$
begin
  update public.player_encounter encounter
  set status = 'cancelled'
  where encounter.auth_user_id = new.auth_user_id
    and encounter.status = 'active'
    and encounter.origin_player_revision < new.revision
    and not exists (
      select 1
      from public.authoritative_battle battle
      where battle.encounter_id = encounter.id
        and battle.contract_key = 'capture'
        and (
          battle.status in ('active', 'needs_player_switch')
          or battle.updated_at = transaction_timestamp()
        )
    );
  return new;
end;
$$;

revoke all on function server_authority_private.cancel_unbound_wild_encounters_after_activity() from public;
