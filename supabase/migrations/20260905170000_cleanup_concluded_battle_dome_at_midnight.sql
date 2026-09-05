begin;

create index battle_dome_battle_concluded_at_idx
  on public.battle_dome_battle(concluded_at) where status = 'concluded';

create function server_authority_private.cleanup_battle_dome_at_midnight(p_now timestamptz default now())
returns integer
language plpgsql
security definer
set search_path = pg_catalog, server_authority_private
as $$
declare
  v_local_now timestamp := p_now at time zone 'Europe/Rome';
  v_midnight timestamptz;
  v_deleted integer;
begin
  -- pg_cron runs in GMT. An hourly trigger with a Rome midnight guard follows
  -- both standard time and daylight saving time without changing other jobs.
  if p_now is null or extract(hour from v_local_now) <> 0 then return 0; end if;
  v_midnight := date_trunc('day', v_local_now) at time zone 'Europe/Rome';
  delete from public.battle_dome_battle
    where status = 'concluded' and concluded_at < v_midnight;
  get diagnostics v_deleted = row_count;
  -- Events, command receipts and turn history follow their existing CASCADE FKs.
  return v_deleted;
end;
$$;
revoke all on function server_authority_private.cleanup_battle_dome_at_midnight(timestamptz)
  from public, anon, authenticated, service_role;

select cron.schedule('revival-battle-dome-midnight', '0 * * * *',
  'select server_authority_private.cleanup_battle_dome_at_midnight();');

commit;
