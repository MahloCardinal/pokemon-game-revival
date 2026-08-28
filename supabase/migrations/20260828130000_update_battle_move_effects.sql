begin;

select server_authority_private.begin_game_data_change(
  p_label => 'Corregge gli effetti delle mosse in battaglia',
  p_affected_families => array['moves']::text[],
  p_source_checksums => jsonb_build_object(
    'app/data/moves.js', 'a58bada4d4a0c710a54afa7a70388201aaf7c643e5c9140bf9ef2afe2b7a55f8'
  ),
  p_requires_battle_idle => true
);

update public.catalog_move
set rules = jsonb_set(rules, '{damagingMove}', 'false'::jsonb, true)
where catalog_release_id = (
    select id
    from public.catalog_release
    where version = 'revival-baseline'
  )
  and move_index = 309
  and rules -> 'damagingMove' is distinct from 'false'::jsonb;

do $verify_battle_move_effects$
begin
  if not exists (
    select 1
    from public.catalog_move
    where catalog_release_id = (
        select id
        from public.catalog_release
        where version = 'revival-baseline'
      )
      and move_index = 309
      and move_key = 'super_fang'
      and rules -> 'damagingMove' = 'false'::jsonb
  ) then
    raise exception 'Super Fang did not converge on direct-only damage'
      using errcode = '55000';
  end if;
end
$verify_battle_move_effects$;

select server_authority_private.finish_game_data_change();

commit;
