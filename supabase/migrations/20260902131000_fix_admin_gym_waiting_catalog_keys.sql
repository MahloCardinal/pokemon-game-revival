begin;

create or replace function server_authority_private.pin_admin_gym_waiting()
returns trigger
language plpgsql
security definer
set search_path = public, server_authority_private, pg_temp
as $$
begin
  if new.contract_key = 'admin_gym' then
    if not exists (
      select 1
      from public.catalog_admin_battle_type admin_type
      where admin_type.catalog_release_id = new.catalog_release_id
        and admin_type.battle_type = 'gym_' || new.gym_key
        and admin_type.admin_controlled
    ) then
      raise exception 'admin_gym requires an admin-controlled catalog policy' using errcode = '22023';
    end if;
    new.waiting_for := case when new.first_actor = 'npc' then 'admin' else 'player' end;
  elsif new.contract_key = 'league' then
    if new.league_member_index not between 0 and 4 then
      raise exception 'league member is invalid' using errcode = '22023';
    end if;
    new.waiting_for := case when new.first_actor = 'npc' then 'admin' else 'player' end;
  elsif new.waiting_for is not null or new.admin_items <> '[]'::jsonb then
    raise exception 'admin turn state belongs only to an admin battle' using errcode = '22023';
  end if;
  return new;
end;
$$;

revoke all on function server_authority_private.pin_admin_gym_waiting() from public;

commit;
