create or replace function public.read_current_server_roles()
returns text[]
language plpgsql
stable
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  v_auth_user_id uuid := auth.uid();
  v_roles text[];
begin
  if v_auth_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  select coalesce(array_agg(usr.role_key order by usr.role_key), array[]::text[])
    into v_roles
    from public.user_server_role usr
   where usr.auth_user_id = v_auth_user_id;

  return v_roles;
end;
$$;

revoke all on function public.read_current_server_roles() from public, anon;
grant execute on function public.read_current_server_roles() to authenticated, service_role;
