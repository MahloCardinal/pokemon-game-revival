do $$
begin
  if not exists (
    select 1
    from pg_catalog.pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'authoritative_battle'
  ) then
    alter publication supabase_realtime add table public.authoritative_battle;
  end if;
end;
$$;

