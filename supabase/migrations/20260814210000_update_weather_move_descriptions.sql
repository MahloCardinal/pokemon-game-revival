begin;

select server_authority_private.begin_game_data_change(
  p_label => 'Semplifica le descrizioni delle mosse meteo',
  p_affected_families => array['moves']::text[],
  p_source_checksums => jsonb_build_object(
    'app/data/moves.js', '9d6cc96999f03005969391c77a4d3da1719f845eb63d25c3802d1f17d8cc81d4'
  ),
  p_requires_battle_idle => false
);

update public.catalog_move
set rules = jsonb_set(
  rules,
  '{description}',
  to_jsonb(case move_index
    when 134 then 'Fa splendere il sole'
    when 137 then 'Causa una grandinata'
    when 216 then 'Causa un acquazzone'
    when 317 then 'Causa una tempesta di sabbia'
  end::text),
  true
)
where catalog_release_id = (
    select id
    from public.catalog_release
    where version = 'revival-baseline'
  )
  and move_index in (134, 137, 216, 317)
  and rules ->> 'description' is distinct from case move_index
    when 134 then 'Fa splendere il sole'
    when 137 then 'Causa una grandinata'
    when 216 then 'Causa un acquazzone'
    when 317 then 'Causa una tempesta di sabbia'
  end;

do $verify_weather_move_descriptions$
begin
  if exists (
    select 1
    from public.catalog_move
    where catalog_release_id = (
        select id
        from public.catalog_release
        where version = 'revival-baseline'
      )
      and move_index in (134, 137, 216, 317)
      and rules ->> 'description' is distinct from case move_index
        when 134 then 'Fa splendere il sole'
        when 137 then 'Causa una grandinata'
        when 216 then 'Causa un acquazzone'
        when 317 then 'Causa una tempesta di sabbia'
      end
  ) or (
    select count(*)
    from public.catalog_move
    where catalog_release_id = (
        select id
        from public.catalog_release
        where version = 'revival-baseline'
      )
      and move_index in (134, 137, 216, 317)
  ) <> 4 then
    raise exception 'weather move descriptions did not converge on canonical values'
      using errcode = '55000';
  end if;
end
$verify_weather_move_descriptions$;

select server_authority_private.finish_game_data_change();

commit;
