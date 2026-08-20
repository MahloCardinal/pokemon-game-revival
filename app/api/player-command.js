import { getSupabaseClient } from "./supabase.js";

var PENDING_COMMAND_STORAGE_KEY = "pokemon-game-revival:pending-player-commands";
var PLAYER_REVISION_CONFLICT_COOLDOWN_MS = 1500;
var PLAYER_REVISION_REFRESH_CACHE_MS = 1000;
var playerCommandInFlight = {};
var playerRevisionConflictCooldown = null;
var playerRevisionRefreshInFlight = null;
var playerRevisionRefreshCache = null;
var playerRevisionRefreshCachedAt = 0;

export var PLAYER_REVISION_SYNC_EVENT = "pokemon-game-revival:player-revision-sync";

function createCommandId() {
  var runtimeCrypto = typeof globalThis !== "undefined" ? globalThis.crypto : null;
  var bytes = new Uint8Array(16);
  var index;
  if (runtimeCrypto && typeof runtimeCrypto.randomUUID === "function") {
    return runtimeCrypto.randomUUID();
  }
  if (runtimeCrypto && typeof runtimeCrypto.getRandomValues === "function") {
    runtimeCrypto.getRandomValues(bytes);
  } else {
    for (index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }
  bytes[6] = bytes[6] & 15 | 64;
  bytes[8] = bytes[8] & 63 | 128;
  return Array.from(bytes, function (value) {
    return value.toString(16).padStart(2, "0");
  }).join("").replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, "$1-$2-$3-$4-$5");
}

async function runRpc(name, params) {
  var client = getSupabaseClient();
  var result;
  if (!client) {
    return { ok: false, code: "missing_configuration" };
  }
  try {
    result = await client.rpc(name, params);
  } catch (error) {
    return { ok: false, code: "player_rpc_failed", detail: error && error.message || "" };
  }
  if (result.error) {
    return { ok: false, code: result.error.code || "player_rpc_failed", detail: result.error.message || "" };
  }
  return { ok: true, projection: result.data };
}

function canonicalPayload(name, params) {
  return JSON.stringify([name, Object.keys(params).sort().map(function (key) {
    return [key, params[key]];
  })]);
}

function pendingCommands() {
  if (typeof window === "undefined" || !window.sessionStorage) return {};
  try {
    return JSON.parse(window.sessionStorage.getItem(PENDING_COMMAND_STORAGE_KEY) || "{}") || {};
  } catch (error) {
    return {};
  }
}

function savePendingCommands(commands) {
  if (typeof window === "undefined" || !window.sessionStorage) return;
  try {
    window.sessionStorage.setItem(PENDING_COMMAND_STORAGE_KEY, JSON.stringify(commands));
  } catch (error) {}
}

function clearPendingCommand(commands, key) {
  delete commands[key];
  savePendingCommands(commands);
}

function dispatchPlayerRevisionSync(projection, revision, conflict) {
  if (typeof window === "undefined" || typeof window.dispatchEvent !== "function"
    || typeof CustomEvent !== "function") return;
  window.dispatchEvent(new CustomEvent(PLAYER_REVISION_SYNC_EVENT, {
    detail: {
      projection: projection || null,
      revision: Math.max(0, Number(revision) || 0),
      conflict: Boolean(conflict)
    }
  }));
}

function refreshPlayerStateAfterRevisionConflict() {
  var now = Date.now();
  if (playerRevisionRefreshInFlight) return playerRevisionRefreshInFlight;
  if (playerRevisionRefreshCache && now - playerRevisionRefreshCachedAt < PLAYER_REVISION_REFRESH_CACHE_MS) {
    return Promise.resolve(playerRevisionRefreshCache);
  }
  playerRevisionRefreshInFlight = runRpc("get_current_player_state").then(function (result) {
    playerRevisionRefreshInFlight = null;
    if (!result.ok || !result.projection || !result.projection.has_player) return null;
    playerRevisionRefreshCache = result.projection;
    playerRevisionRefreshCachedAt = Date.now();
    return playerRevisionRefreshCache;
  }).catch(function () {
    playerRevisionRefreshInFlight = null;
    return null;
  });
  return playerRevisionRefreshInFlight;
}

async function revisionConflictResult(expectedRevision, message, currentRevision) {
  var projection = await refreshPlayerStateAfterRevisionConflict();
  var revision = Number(projection && projection.revision) || Number(currentRevision) || 0;
  var response = {
    ok: false,
    applied: false,
    code: "revision_conflict",
    uncertain: false,
    projection: projection,
    playerRevision: revision
  };
  playerRevisionConflictCooldown = {
    expectedRevision: Math.max(0, Number(expectedRevision) || 0),
    until: Date.now() + PLAYER_REVISION_CONFLICT_COOLDOWN_MS,
    response: response
  };
  dispatchPlayerRevisionSync(projection, revision, true);
  return response;
}

async function executePlayerCommand(name, params, key) {
  var client = getSupabaseClient();
  var commands;
  var commandId;
  var result;
  commands = pendingCommands();
  commandId = commands[key] || createCommandId();
  commands[key] = commandId;
  savePendingCommands(commands);
  try {
    result = await client.rpc(name, Object.assign({ p_command_id: commandId }, params));
  } catch (error) {
    return { ok: false, code: "player_command_transport_failed", detail: error && error.message || "", uncertain: true };
  }
  if (result.error) {
    if (result.error.code) {
      clearPendingCommand(commands, key);
    }
    if (String(result.error.code || "") === "40001") {
      return revisionConflictResult(
        params.p_expected_revision,
        "player revision conflict",
        0
      );
    }
    return {
      ok: false,
      code: result.error.code || "",
      detail: result.error.message || "",
      uncertain: !result.error.code
    };
  }
  clearPendingCommand(commands, key);
  if (result.data && result.data.ok === false && result.data.conflict === "player_revision") {
    return revisionConflictResult(
      params.p_expected_revision,
      "player revision conflict",
      result.data.player_revision
    );
  }
  dispatchPlayerRevisionSync(null, result.data && result.data.revision, false);
  return { ok: true, projection: result.data };
}

export async function runPlayerCommand(name, params) {
  var client = getSupabaseClient();
  var key;
  var operation;
  var expectedRevision = Math.max(0, Number(params && params.p_expected_revision) || 0);
  if (!client) {
    return { ok: false, code: "missing_configuration" };
  }
  if (playerRevisionConflictCooldown && playerRevisionConflictCooldown.expectedRevision === expectedRevision
    && Date.now() < playerRevisionConflictCooldown.until) {
    return playerRevisionConflictCooldown.response;
  }
  key = canonicalPayload(name, params);
  if (playerCommandInFlight[key]) return playerCommandInFlight[key];
  operation = executePlayerCommand(name, params, key);
  playerCommandInFlight[key] = operation;
  try {
    return await operation;
  } finally {
    if (playerCommandInFlight[key] === operation) delete playerCommandInFlight[key];
  }
}

export function getCurrentPlayerState() {
  return runRpc("get_current_player_state");
}

export function getBattleShopOffers() {
  return runRpc("get_battle_shop_offers");
}

export function chooseStarterAuthoritative(input) {
  return runPlayerCommand("choose_starter_authoritative", {
    p_expected_revision: Number(input.expectedRevision) || 0,
    p_trainer_index: Number(input.trainerIndex),
    p_starter_species: String(input.speciesKey || ""),
    p_gender: String(input.gender || "")
  });
}

export function buyShopItemAuthoritative(input) {
  return runPlayerCommand("buy_shop_item_authoritative", {
    p_expected_revision: Number(input.expectedRevision) || 0,
    p_item_index: Math.floor(Number(input.itemIndex) || 0),
    p_quantity: Math.floor(Number(input.quantity) || 0)
  });
}

export function sellShopItemAuthoritative(input) {
  return runPlayerCommand("sell_shop_item_authoritative", {
    p_expected_revision: Number(input.expectedRevision) || 0,
    p_item_index: Math.floor(Number(input.itemIndex) || 0),
    p_quantity: Math.floor(Number(input.quantity) || 0)
  });
}

export function buyBattleShopOfferAuthoritative(input) {
  return runPlayerCommand("buy_battle_shop_offer_authoritative", {
    p_expected_revision: Number(input.expectedRevision) || 0,
    p_offer_key: String(input.offerKey || "")
  });
}

export function moveTeamPokemonToBoxAuthoritative(input) {
  return runPlayerCommand("move_team_pokemon_to_box_authoritative", {
    p_expected_revision: Number(input.expectedRevision) || 0,
    p_pokemon_instance_id: String(input.pokemonInstanceId || "")
  });
}

export function moveBoxPokemonToTeamAuthoritative(input) {
  return runPlayerCommand("move_box_pokemon_to_team_authoritative", {
    p_expected_revision: Number(input.expectedRevision) || 0,
    p_pokemon_instance_id: String(input.pokemonInstanceId || ""),
    p_target_slot: Math.floor(Number(input.targetSlot))
  });
}

export function swapTeamPokemonSlotsAuthoritative(input) {
  return runPlayerCommand("swap_team_pokemon_slots_authoritative", {
    p_expected_revision: Number(input.expectedRevision) || 0,
    p_pokemon_instance_id: String(input.pokemonInstanceId || ""),
    p_target_slot: Math.floor(Number(input.targetSlot))
  });
}

export function releaseBoxPokemonAuthoritative(input) {
  return runPlayerCommand("release_box_pokemon_authoritative", {
    p_expected_revision: Number(input.expectedRevision) || 0,
    p_pokemon_instance_id: String(input.pokemonInstanceId || "")
  });
}

export function plantGardenBerryAuthoritative(input) {
  return runPlayerCommand("plant_garden_berry_authoritative", {
    p_expected_revision: Number(input.expectedRevision) || 0,
    p_plot_index: Math.floor(Number(input.plotIndex)),
    p_item_index: Math.floor(Number(input.itemIndex) || 0)
  });
}

export function harvestGardenPlotAuthoritative(input) {
  return runPlayerCommand("harvest_garden_plot_authoritative", {
    p_expected_revision: Number(input.expectedRevision) || 0,
    p_plot_index: Math.floor(Number(input.plotIndex))
  });
}

export function claimDailyBerryAuthoritative(input) {
  return runPlayerCommand("claim_daily_berry_authoritative", {
    p_expected_revision: Number(input.expectedRevision) || 0
  });
}

export function depositDaycarePokemonAuthoritative(input) {
  return runPlayerCommand("deposit_daycare_pokemon_authoritative", {
    p_expected_revision: Number(input.expectedRevision) || 0,
    p_pokemon_instance_id: String(input.pokemonInstanceId || ""),
    p_slot_index: Math.floor(Number(input.slotIndex))
  });
}

export function withdrawDaycarePokemonAuthoritative(input) {
  return runPlayerCommand("withdraw_daycare_pokemon_authoritative", {
    p_expected_revision: Number(input.expectedRevision) || 0,
    p_pokemon_instance_id: String(input.pokemonInstanceId || "")
  });
}

export function resolveDaycareWithdrawalAuthoritative(input) {
  return runPlayerCommand("resolve_daycare_withdrawal_authoritative", {
    p_expected_revision: Number(input.expectedRevision) || 0,
    p_pending_resolution_id: String(input.pendingResolutionId || ""),
    p_choices: input.choices || { moves: [], evolution_target_species_key: null }
  });
}

export function startWildEncounterAuthoritative(input) {
  return runPlayerCommand("start_wild_encounter_authoritative", {
    p_expected_revision: Number(input.expectedRevision) || 0,
    p_zone_key: String(input.zoneKey || ""),
    p_requested_level: input.requestedLevel === null || input.requestedLevel === undefined
      ? null
      : Math.floor(Number(input.requestedLevel)),
    p_search_mode: input.searchMode || {},
    p_flute_choice: String(input.fluteChoice || "none")
  });
}

export function executePokemonCenterCommandAuthoritative(input) {
  return runPlayerCommand("execute_pokemon_center_command_authoritative", {
    p_expected_revision: Number(input.expectedRevision) || 0,
    p_pokemon_instance_id: String(input.pokemonInstanceId || ""),
    p_operation: String(input.operation || ""),
    p_item_index: Math.floor(Number(input.itemIndex) || 0),
    p_replacement_slot: input.replacementSlot === null || input.replacementSlot === undefined
      ? null
      : Math.floor(Number(input.replacementSlot)),
    p_evolution_target_species_key: input.evolutionTargetSpeciesKey
      ? String(input.evolutionTargetSpeciesKey)
      : null
  });
}

export function executePokemonCenterMoveTutorAuthoritative(input) {
  return runPlayerCommand("execute_pokemon_center_move_tutor_authoritative", {
    p_expected_revision: Number(input.expectedRevision) || 0,
    p_pokemon_instance_id: String(input.pokemonInstanceId || ""),
    p_item_index: Math.floor(Number(input.itemIndex) || 0),
    p_move_index: Math.floor(Number(input.moveIndex) || 0),
    p_replacement_slot: input.replacementSlot === null || input.replacementSlot === undefined
      ? null : Math.floor(Number(input.replacementSlot))
  });
}

export function syncPlayerMissionsAuthoritative() {
  return runRpc("sync_player_missions_authoritative", {});
}

export function claimPlayerMissionAuthoritative(input) {
  return runPlayerCommand("claim_player_mission_authoritative", {
    p_expected_revision: Number(input.expectedRevision) || 0,
    p_mission_index: Math.floor(Number(input.missionIndex) || 0),
    p_selected_reward_item_index: input.selectedRewardItemIndex === null || input.selectedRewardItemIndex === undefined
      ? null
      : Math.floor(Number(input.selectedRewardItemIndex) || 0),
    p_selected_reward_species_key: input.selectedRewardSpeciesKey === null || input.selectedRewardSpeciesKey === undefined
      ? null
      : String(input.selectedRewardSpeciesKey || "")
  });
}
