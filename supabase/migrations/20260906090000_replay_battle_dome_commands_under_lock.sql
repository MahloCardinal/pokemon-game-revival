begin;

-- Preserve the existing implementation and privileges; insert the receipt lookup
-- after the battle lock and participant check, before any mutable-state checks.
do $migration$
declare
  v_definition text;
  v_anchor text := '  if p_command_type <> ''initialize'' and v_battle.waiting_for <> v_role then';
begin
  select pg_get_functiondef('public.commit_edge_battle_dome_command_before_turn_history(uuid,uuid,text,text,uuid,bigint,text,text,text,jsonb,jsonb,jsonb)'::regprocedure)
    into v_definition;
  if strpos(v_definition, v_anchor) = 0
    or strpos(v_definition, '  v_battle public.battle_dome_battle%rowtype;') = 0
    or strpos(v_definition, 'for update;') = 0 then
    raise exception 'Unexpected Battle Dome commit implementation';
  end if;
  v_definition := replace(v_definition, '  v_battle public.battle_dome_battle%rowtype;',
    '  v_battle public.battle_dome_battle%rowtype;'
    || E'\n  v_receipt public.battle_dome_command_receipt%rowtype;');
  v_definition := replace(v_definition, v_anchor, $replay$
  select * into v_receipt from public.battle_dome_command_receipt
    where auth_user_id = p_auth_user_id and command_id = p_command_id;
  if found then
    if v_receipt.battle_id is distinct from p_battle_id
      or v_receipt.command_type is distinct from p_command_type
      or v_receipt.command_hash is distinct from p_command_hash then
      raise exception 'battle dome command id was reused with a different payload' using errcode = '22023';
    end if;
    return v_receipt.result || jsonb_build_object('replayed', true);
  end if;
$replay$ || v_anchor);
  execute v_definition;

  select pg_get_functiondef('public.commit_edge_battle_dome_command(uuid,uuid,text,text,uuid,bigint,text,text,text,jsonb,jsonb,jsonb)'::regprocedure)
    into v_definition;
  v_anchor := 'perform server_authority_private.store_battle_turn_history(p_battle_id, ''t''::boolean, p_events, v_result);';
  if strpos(v_definition, v_anchor) = 0 then
    raise exception 'Unexpected Battle Dome history wrapper';
  end if;
  v_definition := replace(v_definition, v_anchor,
    'if coalesce((v_result->>''replayed'')::boolean, false) is not true then '
    || v_anchor || ' end if;');
  execute v_definition;
end;
$migration$;

commit;
