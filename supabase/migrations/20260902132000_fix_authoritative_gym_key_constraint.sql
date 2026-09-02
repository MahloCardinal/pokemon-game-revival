begin;

alter table public.authoritative_battle
  drop constraint authoritative_battle_gym_context_check;

alter table public.authoritative_battle
  add constraint authoritative_battle_gym_context_check check (
    (
      contract_key in ('gym', 'admin_gym')
      and gym_key is not null
      and gym_key ~ '^[a-z0-9_]{1,40}$'
    )
    or (
      contract_key not in ('gym', 'admin_gym')
      and gym_key is null
    )
  );

commit;
