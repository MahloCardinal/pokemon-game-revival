import { invokeAuthoritativeBattleCommand } from "./battle.js";

var DEBUG_COMMAND_STORAGE_PREFIX = "pokemon_game_revival:debug_command:";
var debugCommandInFlight = null;

function commandId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  throw new Error("Impossibile generare l'identificativo del comando debug.");
}

async function runDebugCommand(action, expectedPlayerRevision, semantic) {
  if (debugCommandInFlight) {
    return {
      ok: false,
      code: "debug_command_in_progress",
      uncertain: false,
      message: "Attendi il completamento del comando debug già in corso."
    };
  }
  debugCommandInFlight = executeDebugCommand(action, expectedPlayerRevision, semantic);
  try {
    return await debugCommandInFlight;
  } finally {
    debugCommandInFlight = null;
  }
}

async function executeDebugCommand(action, expectedPlayerRevision, semantic) {
  var storageKey = DEBUG_COMMAND_STORAGE_PREFIX + action;
  var pending = null;
  var semanticBody = Object.assign({
    action: action,
    expectedPlayerRevision: Number(expectedPlayerRevision) || 0
  }, semantic || {});
  var payloadKey = JSON.stringify(semanticBody);
  try { pending = JSON.parse(window.sessionStorage.getItem(storageKey) || "null"); } catch (error) {}
  var body = Object.assign({
    commandId: pending && pending.payloadKey === payloadKey ? pending.commandId : commandId()
  }, semanticBody);
  try {
    window.sessionStorage.setItem(storageKey, JSON.stringify({ commandId: body.commandId, payloadKey: payloadKey }));
  } catch (error) {}
  var result = await invokeAuthoritativeBattleCommand(body);
  if (result.ok || !result.uncertain) {
    try { window.sessionStorage.removeItem(storageKey); } catch (error) {}
  }
  return result;
}

export function adjustAuthoritativeDebugMoney(input) {
  return runDebugCommand("debug_money", input.expectedPlayerRevision, { delta: Math.floor(Number(input.delta)) });
}

export function adjustAuthoritativeDebugBadges(input) {
  return runDebugCommand("debug_badges", input.expectedPlayerRevision, { delta: Math.floor(Number(input.delta)) });
}

export function addAuthoritativeDebugBattlePoints(input) {
  return runDebugCommand("debug_battle_points", input.expectedPlayerRevision, {});
}

export function adjustAuthoritativeDebugInventory(input) {
  return runDebugCommand("inventory_adjust", input.expectedPlayerRevision, {
    itemIndex: Math.floor(Number(input.itemIndex)),
    delta: Math.floor(Number(input.delta))
  });
}

export function createAuthoritativeDebugPokemon(input) {
  return runDebugCommand("debug_create_pokemon", input.expectedPlayerRevision, { pokemon: input.pokemon });
}

export function completeAuthoritativeDebugMission(input) {
  return runDebugCommand("debug_complete_mission", input.expectedPlayerRevision, {
    missionIndex: Math.floor(Number(input.missionIndex))
  });
}
