import { currentUserId, getSupabaseClient, runQuery } from "./supabase.js";
import { serializePokemonList, serializePokedexNumbers } from "./player.js";
import { DAYCARE_MAX_PENDING_LEVELS, DAYCARE_WITHDRAW_BASE_COST, DAYCARE_WITHDRAW_LEVEL_COST } from "../data/progression.js";
import { depositDaycarePokemonAuthoritative, getCurrentPlayerState, resolveDaycareWithdrawalAuthoritative, withdrawDaycarePokemonAuthoritative } from "./player-command.js";

function normalizeDaycareRow(row) {
  if (!row) {
    return null;
  }
  return {
    slotIndex: Math.floor(Number(row.slot_index !== undefined ? row.slot_index : row.slotIndex) || 0),
    pokemon: row.pokemon || null,
    depositedAt: row.deposited_at || row.depositedAt || null,
    status: row.status || "deposited",
    pendingLevels: Math.max(0, Math.floor(Number(row.pending_levels !== undefined ? row.pending_levels : row.pendingLevels) || 0)),
    cost: Math.max(0, Math.floor(Number(row.cost) || 0)),
    elapsedIntervals: Math.max(0, Math.floor(Number(row.elapsed_intervals !== undefined ? row.elapsed_intervals : row.elapsedIntervals) || 0)),
    levelCap: Math.max(1, Math.floor(Number(row.level_cap !== undefined ? row.level_cap : row.levelCap) || 100)),
    serverTime: row.server_time || row.serverTime || null,
    pendingResolutionId: row.pending_resolution_id || row.pendingResolutionId || null
  };
}

function normalizeRpcResult(data, fallbackCode) {
  if (!data || typeof data !== "object") {
    return { ok: false, code: fallbackCode || "daycare_operation_failed" };
  }
  return {
    ok: data.ok !== false,
    reason: data.reason || "",
    code: data.ok === false ? data.reason || fallbackCode || "daycare_operation_failed" : "",
    pokedollars: Number(data.pokedollars),
    row: normalizeDaycareRow(data.row)
  };
}

async function userAndClient() {
  var client = getSupabaseClient();
  var user;
  if (!client) {
    return { ok: false, code: "missing_configuration" };
  }
  user = await currentUserId(client);
  if (!user.ok) {
    return user;
  }
  return { ok: true, client: client, userId: user.userId };
}

export async function loadPlayerDaycare() {
  var auth;
  var result;
  result = await getCurrentPlayerState();
  return result.ok
    ? { ok: true, rows: (result.projection && result.projection.daycare || []).map(normalizeDaycareRow).filter(Boolean), projection: result.projection }
    : { ok: false, code: result.code || "daycare_load_failed", rows: [] };
}

export async function depositDaycarePokemon(slotIndex, pokemon) {
  var auth = await userAndClient();
  var payload;
  var result;
  if (!auth.ok) {
    return { ok: false, code: auth.code || "invalid_session" };
  }
  payload = {
    auth_user_id: auth.userId,
    slot_index: Math.max(0, Math.min(1, Math.floor(Number(slotIndex) || 0))),
    pokemon: pokemon.toJSON()
  };
  result = await auth.client.from("player_daycare")
    .insert(payload)
    .select("slot_index, pokemon, deposited_at, status, pending_levels")
    .maybeSingle();
  if (result.error) {
    return { ok: false, code: "daycare_deposit_failed", detail: result.error.message || "" };
  }
  return { ok: true, row: normalizeDaycareRow(result.data) };
}

export async function deleteDaycarePokemon(slotIndex) {
  var auth = await userAndClient();
  if (!auth.ok) {
    return { ok: false, code: auth.code || "invalid_session" };
  }
  return runQuery(auth.client.from("player_daycare")
    .delete()
    .eq("auth_user_id", auth.userId)
    .eq("slot_index", Math.max(0, Math.min(1, Math.floor(Number(slotIndex) || 0)))));
}

export function depositDaycarePokemonCommand(input) {
  return depositDaycarePokemonAuthoritative(input);
}

export function withdrawDaycarePokemonCommand(input) {
  return withdrawDaycarePokemonAuthoritative(input);
}

export function resolveDaycareWithdrawalCommand(input) {
  return resolveDaycareWithdrawalAuthoritative(input);
}

export async function startDaycareWithdraw(slotIndex, pendingLevels, cost) {
  var client = getSupabaseClient();
  var result;
  if (!client) {
    return { ok: false, code: "missing_configuration" };
  }
  result = await client.rpc("start_daycare_withdraw", {
    p_slot_index: Math.max(0, Math.min(1, Math.floor(Number(slotIndex) || 0))),
    p_pending_levels: Math.max(0, Math.floor(Number(pendingLevels) || 0)),
    p_cost: Math.max(0, Math.floor(Number(cost) || 0)),
    p_base_cost: DAYCARE_WITHDRAW_BASE_COST,
    p_level_cost: DAYCARE_WITHDRAW_LEVEL_COST,
    p_max_pending_levels: DAYCARE_MAX_PENDING_LEVELS
  });
  if (result.error) {
    return { ok: false, code: "daycare_withdraw_failed", detail: result.error.message || "" };
  }
  return normalizeRpcResult(result.data, "daycare_withdraw_failed");
}

export async function completeDaycareWithdraw(slotIndex, pokemonList, state) {
  var client = getSupabaseClient();
  var dexPayload;
  var result;
  if (!client) {
    return { ok: false, code: "missing_configuration" };
  }
  dexPayload = state && state.pokedexDirty ? serializePokedexNumbers(state.playerDex) : null;
  result = await client.rpc("complete_daycare_withdraw", {
    p_slot_index: Math.max(0, Math.min(1, Math.floor(Number(slotIndex) || 0))),
    p_team: serializePokemonList(pokemonList),
    p_dex: dexPayload
  });
  if (result.error) {
    return { ok: false, code: "daycare_withdraw_completion_failed", detail: result.error.message || "" };
  }
  result = normalizeRpcResult(result.data, "daycare_withdraw_completion_failed");
  if (result.ok && state && dexPayload && JSON.stringify(dexPayload) === JSON.stringify(serializePokedexNumbers(state.playerDex))) {
    state.pokedexDirty = false;
  }
  return result;
}
