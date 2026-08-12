import { getSupabaseClient, currentUserId } from "./supabase.js";
import { serializePokemonList, serializePokedexNumbers } from "./player.js";
import { adminControlledBattleRewardForType } from "../data/progression.js";

export var AUTHORITATIVE_BATTLE_UI_BLOCK_MESSAGE = "L'interfaccia Edge autoritativa supporta ripristino, mosse, sostituzioni e abbandono; strumenti e Ball sono disponibili nei contratti che li ammettono.";

var AUTHORITATIVE_OWNER_STORAGE_KEY = "pokemon_game_revival:runtime:authoritative_battle_owner";
var TRAINING_PROGRESSION_COMMAND_STORAGE_KEY = "pokemon_game_revival:training_progression_command";
var AUTHORITATIVE_BATTLE_COMMAND_STORAGE_KEY = "pokemon_game_revival:authoritative_battle_pending_command";
var AUTHORITATIVE_CAPTURE_FLEE_STORAGE_KEY = "pokemon_game_revival:authoritative_capture_flee";
var AUTHORITATIVE_BATTLE_COMMAND_TIMEOUT_MS = 20000;
var authoritativeBattleRateLimitUntil = 0;

export function authoritativeBattleRuntimeOwnerId() {
  var owner = "";
  try { owner = window.sessionStorage.getItem(AUTHORITATIVE_OWNER_STORAGE_KEY) || ""; } catch (error) {}
  if (!/^[0-9a-f-]{36}$/i.test(owner)) {
    owner = globalThis.crypto && typeof globalThis.crypto.randomUUID === "function" ? globalThis.crypto.randomUUID() : "";
    if (!owner) { throw new Error("Impossibile generare l'identificativo del runtime battaglia."); }
    try { window.sessionStorage.setItem(AUTHORITATIVE_OWNER_STORAGE_KEY, owner); } catch (error) {}
  }
  return owner;
}

export function bootstrapAuthoritativeBattleUi() {
  return { ok: false, message: AUTHORITATIVE_BATTLE_UI_BLOCK_MESSAGE };
}

function battleCommandId(input) {
  if (input && input.commandId) { return String(input.commandId); }
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  throw new Error("Impossibile generare l'identificativo del comando battaglia.");
}

export async function invokeAuthoritativeBattleCommand(body) {
  var client = getSupabaseClient();
  var result;
  var message;
  var timeoutId = null;
  var timeoutResult = {};
  var remainingRateLimitSeconds;
  if (!client) { return { ok: false, message: "Configurazione Supabase mancante." }; }
  remainingRateLimitSeconds = Math.ceil((authoritativeBattleRateLimitUntil - Date.now()) / 1000);
  if (remainingRateLimitSeconds > 0) {
    return {
      ok: false,
      message: "Troppe richieste. Attendi prima di riprovare.",
      code: "rate_limited",
      retryAfterSeconds: remainingRateLimitSeconds,
      uncertain: false
    };
  }
  try {
    result = await Promise.race([
      client.functions.invoke("battle-command", { body: body }),
      new Promise(function (resolve) {
        timeoutId = globalThis.setTimeout(function () { resolve(timeoutResult); }, AUTHORITATIVE_BATTLE_COMMAND_TIMEOUT_MS);
      })
    ]);
    if (result === timeoutResult) {
      return { ok: false, uncertain: true, timedOut: true, code: "command_timeout",
        message: "Il comando sta impiegando troppo tempo. Verifica dello stato in corso." };
    }
  } catch (error) {
    return { ok: false, message: error && error.message || "Comando battaglia Edge non riuscito.", uncertain: true };
  } finally {
    if (timeoutId !== null) { globalThis.clearTimeout(timeoutId); }
  }
  if (result.error || !result.data || result.data.ok === false) {
    message = result.data && result.data.error && result.data.error.message || result.error && result.error.message || "Comando battaglia Edge non riuscito.";
    var errorCode = result.data && result.data.error && result.data.error.code || "";
    var errorStatus = Number(result.error && result.error.context && result.error.context.status) || 0;
    var retryAfterSeconds = null;
    if (errorStatus === 429 && result.error.context.headers && typeof result.error.context.headers.get === "function") {
      var retryAfter = result.error.context.headers.get("Retry-After");
      var retryAfterNumber = Number(retryAfter);
      var retryAfterDate = Date.parse(retryAfter);
      if (retryAfter !== null && retryAfter !== "" && Number.isFinite(retryAfterNumber)) {
        retryAfterSeconds = Math.max(0, Math.ceil(retryAfterNumber));
      } else if (Number.isFinite(retryAfterDate)) {
        retryAfterSeconds = Math.max(0, Math.ceil((retryAfterDate - Date.now()) / 1000));
      }
    }
    if (result.error && result.error.context && typeof result.error.context.json === "function") {
      try {
        var errorBody = await result.error.context.json();
        if (errorBody && errorBody.error) {
          if (errorBody.error.message) { message = errorBody.error.message; }
          if (errorBody.error.code) { errorCode = errorBody.error.code; }
        }
      } catch (error) {}
    }
    if (errorStatus === 429) {
      retryAfterSeconds = retryAfterSeconds || 1;
      authoritativeBattleRateLimitUntil = Math.max(authoritativeBattleRateLimitUntil,
        Date.now() + retryAfterSeconds * 1000);
    }
    return {
      ok: false,
      message: message,
      code: errorStatus === 429 ? "rate_limited" : errorCode,
      retryAfterSeconds: retryAfterSeconds,
      // A limiter rejection happens before a command can mutate canonical state.
      uncertain: errorStatus >= 500 || Boolean(result.error && !result.data && !errorCode)
    };
  }
  return {
    ok: true,
    projection: result.data,
    battle: result.data.battle || null,
    events: Array.isArray(result.data.events) ? result.data.events : [],
    playerRevision: Number(result.data.player_revision) || 0
  };
}

function authoritativeBattleCommandSemanticKey(body) {
  var semanticBody = Object.assign({}, body);
  delete semanticBody.commandId;
  return JSON.stringify(semanticBody);
}

function authoritativeBattleCommandStorageKey(userId, battleId) {
  return AUTHORITATIVE_BATTLE_COMMAND_STORAGE_KEY + ":" + String(userId || "") + ":" + String(battleId || "");
}

async function authoritativeBattleCommandStorage(battleId) {
  var client = getSupabaseClient();
  var user = client ? await currentUserId(client) : { ok: false, message: "Configurazione Supabase mancante." };
  var pending = null;
  var storageKey;
  if (!user.ok) { return { ok: false, message: user.message || "Sessione utente non disponibile.", userId: "", pending: null }; }
  storageKey = authoritativeBattleCommandStorageKey(user.userId, battleId);
  try { pending = JSON.parse(window.sessionStorage.getItem(storageKey) || "null"); } catch (error) {}
  if (!pending || pending.userId !== user.userId || String(pending.battleId || "") !== String(battleId || "")
    || !pending.body || typeof pending.body !== "object") { pending = null; }
  return { ok: true, userId: user.userId, storageKey: storageKey, pending: pending };
}

export async function inspectPendingAuthoritativeBattleCommand(battleId) {
  var stored = await authoritativeBattleCommandStorage(battleId);
  if (!stored.ok || !stored.pending) { return null; }
  return stored.pending;
}

function removePendingAuthoritativeBattleCommand(storageKey) {
  try { window.sessionStorage.removeItem(storageKey); } catch (error) { return false; }
  return true;
}

export async function clearPendingAuthoritativeBattleCommand(battleId, commandId) {
  var stored = await authoritativeBattleCommandStorage(battleId);
  if (!stored.ok || !stored.pending) { return false; }
  if (commandId && String(stored.pending.body.commandId || "") !== String(commandId)) { return false; }
  return removePendingAuthoritativeBattleCommand(stored.storageKey);
}

export async function retryPendingAuthoritativeBattleCommand(battleId) {
  var stored = await authoritativeBattleCommandStorage(battleId);
  var pending = stored.pending;
  if (!stored.ok) { return { ok: false, pending: true, uncertain: true, message: stored.message }; }
  if (!pending) { return { ok: true, pending: false }; }
  var result = await invokeAuthoritativeBattleCommand(pending.body);
  if (result.ok || !result.uncertain) {
    removePendingAuthoritativeBattleCommand(stored.storageKey);
  }
  return Object.assign({ pending: true, commandId: pending.body.commandId }, result);
}

async function runAuthoritativeBattleCommand(action, input, semantic) {
  var body = Object.assign({
    action: action,
    commandId: battleCommandId(input),
    expectedPlayerRevision: Number(input.expectedPlayerRevision) || 0,
    battleId: String(input.battleId || ""),
    expectedBattleVersion: Number(input.expectedBattleVersion) || 0,
    runtimeOwnerId: String(input.runtimeOwnerId || "")
  }, semantic || {});
  var stored = await authoritativeBattleCommandStorage(body.battleId);
  var pending = stored.pending;
  var semanticKey = authoritativeBattleCommandSemanticKey(body);
  if (!stored.ok) { return { ok: false, code: "command_persistence_failed", message: stored.message }; }
  if (pending) {
    if (String(pending.battleId || "") !== body.battleId || pending.semanticKey !== semanticKey) {
      return { ok: false, uncertain: true, code: "pending_command_conflict",
        message: "Un altro comando di battaglia è ancora in verifica. Risolvi quel comando prima di continuare." };
    }
    body = pending.body;
  } else {
    pending = { userId: stored.userId, battleId: body.battleId, semanticKey: semanticKey, body: body };
    try {
      window.sessionStorage.setItem(stored.storageKey, JSON.stringify(pending));
    } catch (error) {
      return { ok: false, code: "command_persistence_failed",
        message: "Impossibile memorizzare il comando di battaglia prima dell'invio." };
    }
  }
  var result = await invokeAuthoritativeBattleCommand(body);
  if (result.ok || !result.uncertain) {
    removePendingAuthoritativeBattleCommand(stored.storageKey);
  }
  return result;
}

export function startAuthoritativeTackleTestBattle(input) {
  return invokeAuthoritativeBattleCommand({
    action: "start",
    commandId: battleCommandId(input),
    expectedPlayerRevision: Number(input.expectedPlayerRevision) || 0,
    runtimeOwnerId: String(input.runtimeOwnerId || "")
  });
}

export function startAuthoritativeTrainingBattle(input) {
  return invokeAuthoritativeBattleCommand({
    action: "start_training",
    commandId: battleCommandId(input),
    expectedPlayerRevision: Number(input.expectedPlayerRevision) || 0,
    runtimeOwnerId: String(input.runtimeOwnerId || authoritativeBattleRuntimeOwnerId()),
    difficulty: String(input.difficulty || ""),
    activeSlot: Math.floor(Number(input.activeSlot))
  });
}

export function prepareAuthoritativeTrainingBattle(input) {
  return invokeAuthoritativeBattleCommand({
    action: "prepare_training",
    commandId: battleCommandId(input),
    expectedPlayerRevision: Number(input.expectedPlayerRevision) || 0,
    runtimeOwnerId: String(input.runtimeOwnerId || authoritativeBattleRuntimeOwnerId()),
    difficulty: String(input.difficulty || ""),
    previewActiveSlot: Math.floor(Number(input.previewActiveSlot))
  });
}

export function activateAuthoritativeTrainingBattle(input) {
  return runAuthoritativeBattleCommand("activate_training", input, {
    activeSlot: Math.floor(Number(input.activeSlot))
  });
}

export function discardAuthoritativeTrainingBattle(input) {
  return runAuthoritativeBattleCommand("discard_training", input);
}

export function startAuthoritativeDebugTrainingBattle(input) {
  var opponentTeam = Array.isArray(input.opponentTeam) ? input.opponentTeam.map(function (pokemon) {
    return { speciesKey: String(pokemon.speciesKey), level: Number(pokemon.level), maxHp: Number(pokemon.maxHp),
      heldItemIndex: Number(pokemon.heldItemIndex), moves: (pokemon.moves || []).map(function (move) {
        return { moveIndex: Number(move.moveIndex), power: Number(move.power), stats: Number(move.stats) };
      }) };
  }) : [];
  return invokeAuthoritativeBattleCommand({
    action: "start_debug_training",
    commandId: battleCommandId(input),
    expectedPlayerRevision: Number(input.expectedPlayerRevision) || 0,
    runtimeOwnerId: String(input.runtimeOwnerId || authoritativeBattleRuntimeOwnerId()),
    activeSlot: Math.floor(Number(input.activeSlot)),
    opponentTeam: opponentTeam
  });
}

export function startAuthoritativeCaptureBattle(input) {
  return invokeAuthoritativeBattleCommand({
    action: "start_capture",
    commandId: battleCommandId(input),
    expectedPlayerRevision: Number(input.expectedPlayerRevision) || 0,
    runtimeOwnerId: String(input.runtimeOwnerId || authoritativeBattleRuntimeOwnerId()),
    encounterId: String(input.encounterId || ""),
    activeSlot: Math.floor(Number(input.activeSlot))
  });
}

function authoritativeCaptureFleeStorageKey(userId, encounterId) {
  return AUTHORITATIVE_CAPTURE_FLEE_STORAGE_KEY + ":" + String(userId || "") + ":" + String(encounterId || "");
}

async function authoritativeCaptureFleeStorage(encounterId) {
  var client = getSupabaseClient();
  var user = client ? await currentUserId(client) : { ok: false, message: "Configurazione Supabase mancante." };
  var storageKey;
  var pending = null;
  if (!user.ok) { return { ok: false, message: user.message || "Sessione utente non disponibile." }; }
  storageKey = authoritativeCaptureFleeStorageKey(user.userId, encounterId);
  try { pending = JSON.parse(window.sessionStorage.getItem(storageKey) || "null"); } catch (error) {}
  if (!pending || pending.userId !== user.userId || String(pending.encounterId || "") !== String(encounterId || "")
    || !pending.body || pending.body.action !== "flee_capture" || String(pending.body.encounterId || "") !== String(encounterId || "")) {
    pending = null;
  }
  return { ok: true, userId: user.userId, storageKey: storageKey, pending: pending };
}

function removePendingAuthoritativeCaptureFlee(storageKey) {
  try { window.sessionStorage.removeItem(storageKey); } catch (error) { return false; }
  return true;
}

export async function clearPendingAuthoritativeCaptureFlee(encounterId) {
  var stored = await authoritativeCaptureFleeStorage(encounterId);
  if (!stored.ok || !stored.pending) { return false; }
  return removePendingAuthoritativeCaptureFlee(stored.storageKey);
}

export async function fleeAuthoritativeCaptureEncounter(input) {
  var encounterId = String(input.encounterId || "");
  var stored = await authoritativeCaptureFleeStorage(encounterId);
  var pending;
  var body;
  var result;
  if (!stored.ok) { return { ok: false, code: "command_persistence_failed", message: stored.message }; }
  pending = stored.pending;
  if (pending) {
    body = pending.body;
  } else {
    body = {
      action: "flee_capture",
      commandId: battleCommandId(input),
      expectedPlayerRevision: Number(input.expectedPlayerRevision) || 0,
      encounterId: encounterId
    };
    pending = { userId: stored.userId, encounterId: encounterId, body: body };
    try {
      window.sessionStorage.setItem(stored.storageKey, JSON.stringify(pending));
    } catch (error) {
      return { ok: false, code: "command_persistence_failed",
        message: "Impossibile memorizzare la fuga prima dell'invio." };
    }
  }
  result = await invokeAuthoritativeBattleCommand(body);
  if (result.ok || !result.uncertain) {
    removePendingAuthoritativeCaptureFlee(stored.storageKey);
  }
  return result;
}

export function startAuthoritativeGymBattle(input) {
  return invokeAuthoritativeBattleCommand({
    action: input.adminControlled ? "start_admin_gym" : "start_gym",
    commandId: battleCommandId(input),
    expectedPlayerRevision: Number(input.expectedPlayerRevision) || 0,
    runtimeOwnerId: String(input.runtimeOwnerId || authoritativeBattleRuntimeOwnerId()),
    gymKey: String(input.gymKey || ""),
    activeSlot: Math.floor(Number(input.activeSlot))
  });
}

export function startAuthoritativeLeagueBattle(input) {
  return invokeAuthoritativeBattleCommand({
    action: "start_league",
    commandId: battleCommandId(input),
    expectedPlayerRevision: Number(input.expectedPlayerRevision) || 0,
    runtimeOwnerId: String(input.runtimeOwnerId || authoritativeBattleRuntimeOwnerId()),
    activeSlot: Math.floor(Number(input.activeSlot)),
    expectedMemberIndex: Math.floor(Number(input.expectedMemberIndex))
  });
}

export function startAuthoritativeBattleTower(input) {
  return invokeAuthoritativeBattleCommand({
    action: "start_tower",
    commandId: battleCommandId(input),
    expectedPlayerRevision: Number(input.expectedPlayerRevision) || 0,
    runtimeOwnerId: String(input.runtimeOwnerId || authoritativeBattleRuntimeOwnerId())
  });
}

export async function readServerRoles() {
  var result = await invokeAuthoritativeBattleCommand({ action: "roles" });
  if (!result.ok) { return result; }
  return { ok: true, roles: Array.isArray(result.projection.roles) ? result.projection.roles : [] };
}

function runAuthoritativeAdminCommand(action, input, semantic) {
  return invokeAuthoritativeBattleCommand(Object.assign({
    action: "admin_" + action,
    battleId: String(input.battleId || ""),
    commandId: battleCommandId(input),
    expectedBattleVersion: Number(input.expectedBattleVersion) || 0
  }, semantic || {}));
}

export function submitAuthoritativeAdminMove(input) {
  return runAuthoritativeAdminCommand("move", input, { moveSlot: Math.floor(Number(input.moveSlot)) });
}

export function switchAuthoritativeAdminPokemon(input) {
  return runAuthoritativeAdminCommand("switch", input, { teamSlot: Math.floor(Number(input.teamSlot)) });
}

export function useAuthoritativeAdminItem(input) {
  return runAuthoritativeAdminCommand("item", input, {
    itemIndex: Math.floor(Number(input.itemIndex)),
    targetSlot: input.targetSlot === null || input.targetSlot === undefined ? null : Math.floor(Number(input.targetSlot))
  });
}

export function resolveAuthoritativeAdminEntryChoice(input) {
  return runAuthoritativeAdminCommand("entry_choice", input, {
    entryChoice: {
      index: Math.floor(Number(input.entryChoice && input.entryChoice.index)),
      kind: String(input.entryChoice && input.entryChoice.kind || "")
    }
  });
}

export function submitAuthoritativeBattleMove(input) {
  return runAuthoritativeBattleCommand("move", input, { moveSlot: Math.floor(Number(input.moveSlot)) });
}

export function switchAuthoritativeBattlePokemon(input) {
  return runAuthoritativeBattleCommand("switch", input, {
    teamSlot: Math.floor(Number(input.teamSlot)),
    entryChoice: input.entryChoice && typeof input.entryChoice === "object" ? {
      index: Math.floor(Number(input.entryChoice.index)), kind: String(input.entryChoice.kind || "")
    } : null
  });
}

export function resolveAuthoritativeBattleEntryChoice(input) {
  return runAuthoritativeBattleCommand("entry_choice", input, {
    entryChoice: {
      index: Math.floor(Number(input.entryChoice && input.entryChoice.index)),
      kind: String(input.entryChoice && input.entryChoice.kind || "")
    }
  });
}

export function useAuthoritativeBattleItem(input) {
  return runAuthoritativeBattleCommand("item", input, {
    itemIndex: Math.floor(Number(input.itemIndex)),
    targetSlot: input.targetSlot === null || input.targetSlot === undefined ? null : Math.floor(Number(input.targetSlot))
  });
}

export function useAuthoritativeBattleBall(input) {
  return runAuthoritativeBattleCommand("ball", input, {
    itemIndex: Math.floor(Number(input.itemIndex)),
    targetSlot: Math.floor(Number(input.targetSlot))
  });
}

export function abandonAuthoritativeBattle(input) {
  return runAuthoritativeBattleCommand("abandon", input);
}

export async function getAuthoritativeBattle(battleId, options) {
  options = options || {};
  return invokeAuthoritativeBattleCommand({
    action: "read",
    battleId: battleId || undefined,
    afterSeq: options.afterSeq !== undefined ? Number(options.afterSeq) : undefined,
    limit: options.limit !== undefined ? Number(options.limit) : undefined,
    commandId: options.commandId || undefined,
    runtimeOwnerId: options.runtimeOwnerId || undefined
  });
}

export function readAuthoritativeTrainingProgression() {
  return invokeAuthoritativeBattleCommand({ action: "read_training" });
}

export function readAuthoritativeOrdinaryProgression() {
  return invokeAuthoritativeBattleCommand({ action: "read_ordinary_progression" });
}

export function resolveAuthoritativeOrdinaryProgression(input) {
  return invokeAuthoritativeBattleCommand({
    action: "resolve_ordinary_progression",
    commandId: battleCommandId(input),
    expectedPlayerRevision: Number(input.expectedPlayerRevision) || 0,
    pendingResolutionId: String(input.pendingResolutionId || ""),
    choices: input.choices || { moves: [], evolutionTargetSpeciesKey: null }
  });
}

async function currentTrainingProgressionCommand() {
  var client = getSupabaseClient();
  var user = client ? await currentUserId(client) : { ok: false };
  var pending = null;
  if (!user.ok) { return { userId: "", pending: null }; }
  try { pending = JSON.parse(window.sessionStorage.getItem(TRAINING_PROGRESSION_COMMAND_STORAGE_KEY) || "null"); } catch (error) {}
  if (pending && pending.userId !== user.userId) {
    try { window.sessionStorage.removeItem(TRAINING_PROGRESSION_COMMAND_STORAGE_KEY); } catch (error) {}
    pending = null;
  }
  return { userId: user.userId, pending: pending };
}

async function runTrainingProgressionCommand(action, input, semantic) {
  var stored = await currentTrainingProgressionCommand();
  var semanticBody = Object.assign({ action: action,
    expectedPlayerRevision: Number(input.expectedPlayerRevision) || 0 }, semantic);
  var payloadKey = JSON.stringify(semanticBody);
  var pending = stored.pending;
  if (pending && pending.body && ["allocate_training", "resolve_training"].indexOf(pending.action) !== -1) {
    var pendingResult = await invokeAuthoritativeBattleCommand(pending.body);
    if (pendingResult.ok || !pendingResult.uncertain) {
      try { window.sessionStorage.removeItem(TRAINING_PROGRESSION_COMMAND_STORAGE_KEY); } catch (error) {}
    }
    return pendingResult;
  }
  var body = Object.assign({ commandId: pending && pending.action === action && pending.payloadKey === payloadKey
    ? pending.commandId : battleCommandId(input) }, semanticBody);
  try { window.sessionStorage.setItem(TRAINING_PROGRESSION_COMMAND_STORAGE_KEY, JSON.stringify({
    userId: stored.userId, action: action, commandId: body.commandId, payloadKey: payloadKey, body: body
  })); } catch (error) {}
  var result = await invokeAuthoritativeBattleCommand(body);
  if (result.ok || !result.uncertain) {
    try { window.sessionStorage.removeItem(TRAINING_PROGRESSION_COMMAND_STORAGE_KEY); } catch (error) {}
  }
  return result;
}

export async function retryPendingAuthoritativeTrainingProgressionCommand() {
  var stored = await currentTrainingProgressionCommand();
  if (!stored.pending || !stored.pending.body
    || ["allocate_training", "resolve_training"].indexOf(stored.pending.action) === -1) {
    return { ok: true, pending: false };
  }
  var result = await invokeAuthoritativeBattleCommand(stored.pending.body);
  if (result.ok || !result.uncertain) {
    try { window.sessionStorage.removeItem(TRAINING_PROGRESSION_COMMAND_STORAGE_KEY); } catch (error) {}
  }
  return Object.assign({ pending: true }, result);
}

export function allocateAuthoritativeTrainingLevels(input) {
  return runTrainingProgressionCommand("allocate_training", input, {
    expectedPlayerRevision: Number(input.expectedPlayerRevision) || 0,
    progressionId: String(input.progressionId || ""),
    allocations: Array.isArray(input.allocations) ? input.allocations : []
  });
}

export function resolveAuthoritativeTrainingPokemon(input) {
  return runTrainingProgressionCommand("resolve_training", input, {
    expectedPlayerRevision: Number(input.expectedPlayerRevision) || 0,
    pendingResolutionId: String(input.pendingResolutionId || ""),
    choices: input.choices || { moves: [], evolutionTargetSpeciesKey: null }
  });
}

export async function claimAuthoritativeBattleRuntime(input) {
  var client = getSupabaseClient();
  var result;
  if (!client) { return { ok: false, message: "Configurazione Supabase mancante.", battle: null }; }
  result = await client.rpc("claim_authoritative_battle_runtime", {
    p_battle_id: String(input.battleId || ""),
    p_expected_player_revision: Number(input.expectedPlayerRevision) || 0,
    p_expected_battle_version: Number(input.expectedBattleVersion) || 0,
    p_runtime_owner_id: String(input.runtimeOwnerId || ""),
    p_takeover: Boolean(input.takeover)
  });
  if (result.error) { return { ok: false, message: result.error.message, battle: null }; }
  return { ok: true, projection: result.data, battle: result.data && result.data.battle || null, playerRevision: Number(result.data && result.data.player_revision) || 0 };
}

function normalizeBattleLockResult(data, fallbackMessage) {
  if (!data || typeof data !== "object") {
    return { ok: false, message: fallbackMessage || "Operazione lock battaglia non riuscita." };
  }
  return {
    ok: data.ok !== false && data.claimed !== false,
    claimed: data.claimed !== false,
    locked: data.reason === "locked",
    reason: data.reason || "",
    message: data.message || fallbackMessage || "Operazione lock battaglia non riuscita."
  };
}

export async function loadActivePlayerBattle() {
  var client = getSupabaseClient();
  if (!client) { return { ok: false, message: "Configurazione Supabase mancante.", battle: null, events: [] }; }
  var user = await currentUserId(client);
  if (!user.ok) { return { ok: false, message: user.message, battle: null, events: [] }; }
  var battleResult = await client.from("player_battle").select("auth_user_id, battle_type, first_actor, initial_state, status, created_at, runtime_owner_id, admin_controlled, waiting_for, waiting_since, admin_items, admin_notified_seq").eq("auth_user_id", user.userId).maybeSingle();
  if (battleResult.error) { return { ok: false, message: battleResult.error.message, battle: null, events: [] }; }
  if (!battleResult.data) { return { ok: true, battle: null, events: [] }; }
  var eventsResult = await client.from("player_battle_events").select("auth_user_id, seq, event_type, event_data, created_at").eq("auth_user_id", user.userId).order("seq", { ascending: true });
  if (eventsResult.error) { return { ok: false, message: eventsResult.error.message, battle: null, events: [] }; }
  return { ok: true, battle: battleResult.data, events: eventsResult.data || [] };
}

function normalizeRpcResult(data, fallbackMessage) {
  if (!data || typeof data !== "object") {
    return { ok: false, message: fallbackMessage || "Operazione non riuscita." };
  }
  return {
    ok: data.ok !== false,
    message: data.message || fallbackMessage || "Operazione non riuscita.",
    battle: data.battle || null,
    battles: Array.isArray(data.battles) ? data.battles : [],
    events: Array.isArray(data.events) ? data.events : []
  };
}

function normalizeInventoryEntries(entries) {
  if (!Array.isArray(entries)) { return []; }
  return entries.map(function (entry) {
    return Array.isArray(entry) ? [Number(entry[0]), Number(entry[1])] : null;
  }).filter(function (entry) {
    return entry && Number.isFinite(entry[0]) && Number.isFinite(entry[1]) && entry[1] > 0;
  });
}

function normalizeRewardResult(data, fallbackMessage) {
  var profile = data && data.profile && typeof data.profile === "object" ? data.profile : {};
  if (!data || typeof data !== "object") {
    return { ok: false, message: fallbackMessage || "Operazione premi non riuscita." };
  }
  return {
    ok: data.ok !== false,
    already: Boolean(data.already),
    message: data.message || fallbackMessage || "Operazione premi non riuscita.",
    battleType: String(data.battleType || data.battle_type || ""),
    rewardKind: String(data.rewardKind || data.reward_kind || ""),
    money: Number(data.money) || 0,
    badgeIndex: data.badgeIndex !== null && data.badgeIndex !== undefined ? Number(data.badgeIndex) : null,
    mt: data.mt !== null && data.mt !== undefined ? Number(data.mt) : null,
    item: data.item !== null && data.item !== undefined ? Number(data.item) : null,
    profile: {
      pokedollars: Number(profile.pokedollars) || 0,
      badges: Number(profile.badges) || 0
    },
    inventory: normalizeInventoryEntries(data.inventory)
  };
}

export async function listAdminControlledBattles() {
  var client = getSupabaseClient();
  var result;
  if (!client) { return { ok: false, message: "Configurazione Supabase mancante.", battles: [] }; }
  return invokeAuthoritativeBattleCommand({ action: "admin_list" }).then(function (edgeResult) {
    return edgeResult.ok
      ? { ok: true, battles: Array.isArray(edgeResult.projection.battles) ? edgeResult.projection.battles : [] }
      : { ok: false, message: edgeResult.message, battles: [] };
  });
}

export async function loadAdminControlledBattle(playerAuthUserId, battleId, options) {
  var result;
  var selected;
  options = options || {};
  if (battleId) {
    result = await invokeAuthoritativeBattleCommand({ action: "admin_read", battleId: battleId,
      afterSeq: options.afterSeq !== undefined ? Number(options.afterSeq) : 0,
      limit: options.limit !== undefined ? Number(options.limit) : 100 });
    return result.ok ? { ok: true, battle: result.battle, events: result.events } : { ok: false, message: result.message, battle: null, events: [] };
  }
  result = await listAdminControlledBattles();
  if (!result.ok) return { ok: false, message: result.message, battle: null, events: [] };
  selected = result.battles.find(function (battle) {
    return String(battle.auth_user_id || "") === String(playerAuthUserId || "");
  });
  if (!selected) return { ok: true, battle: null, events: [] };
  return loadAdminControlledBattle(playerAuthUserId, selected.battle_id, options);
}

export async function appendAdminBattleEvent(playerAuthUserId, event) {
  var client = getSupabaseClient();
  var result;
  if (!client) { return { ok: false, message: "Configurazione Supabase mancante." }; }
  result = await client.rpc("append_admin_battle_event", {
    p_auth_user_id: String(playerAuthUserId || ""),
    p_seq: Number(event.seq),
    p_event_type: String(event.eventType || ""),
    p_event_data: event.eventData || {}
  });
  if (result.error) { return { ok: false, message: result.error.message }; }
  return normalizeBattleLockResult(result.data, "Errore durante il salvataggio della risposta admin.");
}

export async function finalizeAdminControlledBattleReward(playerAuthUserId, battleType, result, inventory) {
  var client = getSupabaseClient();
  var reward = adminControlledBattleRewardForType(battleType);
  var rpcResult;
  if (!client) { return { ok: false, message: "Configurazione Supabase mancante." }; }
  rpcResult = await client.rpc("finalize_admin_controlled_battle_reward", {
    p_auth_user_id: playerAuthUserId || null,
    p_battle_type: String(battleType || ""),
    p_result: String(result || "player_win"),
    p_inventory: Array.isArray(inventory) ? inventory : null,
    p_reward: reward
  });
  if (rpcResult.error) { return { ok: false, message: rpcResult.error.message }; }
  return normalizeRewardResult(rpcResult.data, "Impossibile registrare i premi.");
}

export async function claimActiveBattleRuntimeLock(ownerId) {
  var client = getSupabaseClient();
  var result;
  if (!client) { return { ok: false, message: "Configurazione Supabase mancante." }; }
  result = await client.rpc("set_player_battle_runtime_lock", {
    p_action: "claim",
    p_owner_id: String(ownerId || "")
  });
  if (result.error) { return { ok: false, message: result.error.message }; }
  return normalizeBattleLockResult(result.data, "Impossibile prendere controllo della battaglia.");
}

export async function forceClaimActiveBattleRuntimeLock(ownerId) {
  var client = getSupabaseClient();
  var result;
  if (!client) { return { ok: false, message: "Configurazione Supabase mancante." }; }
  result = await client.rpc("set_player_battle_runtime_lock", {
    p_action: "force_claim",
    p_owner_id: String(ownerId || "")
  });
  if (result.error) { return { ok: false, message: result.error.message }; }
  return normalizeBattleLockResult(result.data, "Impossibile riprendere la battaglia.");
}

export async function releaseActiveBattleRuntimeLock(ownerId) {
  var client = getSupabaseClient();
  var result;
  if (!client) { return { ok: true }; }
  result = await client.rpc("set_player_battle_runtime_lock", {
    p_action: "release",
    p_owner_id: String(ownerId || "")
  });
  if (result.error) { return { ok: false, message: result.error.message }; }
  return normalizeBattleLockResult(result.data, "Impossibile rilasciare il lock battaglia.");
}

export async function createActivePlayerBattle(battle, ownerId) {
  var client = getSupabaseClient();
  var result;
  if (!client) { return { ok: false, message: "Configurazione Supabase mancante." }; }
  result = await client.rpc("create_active_player_battle_locked", {
    p_battle_type: String(battle.battleType || ""),
    p_first_actor: String(battle.firstActor || "player"),
    p_initial_state: battle.initialState || {},
    p_owner_id: String(ownerId || ""),
    p_admin_controlled: Boolean(battle.adminControlled),
    p_waiting_for: String(battle.waitingFor || "player"),
    p_admin_items: battle.adminItems
  });
  if (result.error) { return { ok: false, message: result.error.message }; }
  return normalizeBattleLockResult(result.data, "Impossibile creare la battaglia.");
}

export async function appendPlayerBattleEvent(event, ownerId) {
  var client = getSupabaseClient();
  var result;
  if (!client) { return { ok: false, message: "Configurazione Supabase mancante." }; }
  result = await client.rpc("append_player_battle_event_locked", {
    p_owner_id: String(ownerId || ""),
    p_seq: Number(event.seq),
    p_event_type: String(event.eventType || ""),
    p_event_data: event.eventData || {}
  });
  if (result.error) { return { ok: false, message: result.error.message }; }
  return normalizeBattleLockResult(result.data, "Errore durante il salvataggio della battaglia.");
}

export async function deleteActivePlayerBattle(ownerId) {
  return { ok: true, ownerId: String(ownerId || "") };
}

export async function startPostBattleExpEvents(events, ownerId, eventType) {
  return {
    ok: true,
    ownerId: String(ownerId || ""),
    eventType: String(eventType || "exp"),
    events: Array.isArray(events) ? events : []
  };
}

export async function consumePostBattleExpEvent(seq, pokemonList, state, ownerId) {
  var client = getSupabaseClient();
  var dexPayload;
  var result;
  if (!client) { return { ok: false, message: "Configurazione Supabase mancante." }; }
  dexPayload = state && state.pokedexDirty ? serializePokedexNumbers(state.playerDex) : null;
  result = await client.rpc("consume_post_battle_exp_event_locked", {
    p_owner_id: String(ownerId || ""),
    p_seq: Number(seq),
    p_team: serializePokemonList(pokemonList),
    p_dex: dexPayload
  });
  if (result.error) { return { ok: false, message: result.error.message }; }
  result = normalizeBattleLockResult(result.data, "Errore durante il consumo dell'esperienza.");
  if (!result.ok) { return result; }
  if (state && dexPayload && JSON.stringify(dexPayload) === JSON.stringify(serializePokedexNumbers(state.playerDex))) {
    state.pokedexDirty = false;
  }
  return { ok: true };
}
