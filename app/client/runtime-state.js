import { updateInventoryQuantity } from "../data/items.js";
import { state } from "./game-state.js";
import { serializePokemonList, serializeBoxList, revivePokemonList, reviveBoxList } from "./save-runtime.js";
import { markDirty, render } from "./renderer.js";

var PLAYER_RUNTIME_STORAGE_PREFIX = "pokemon_game_revival:runtime:player_state:";
var tabId = String(Date.now()) + "-" + Math.random().toString(36).slice(2);

function authUserId() {
  return state.auth && state.auth.user ? String(state.auth.user.id || "") : "";
}

function playerRuntimeStorageKey() {
  var userId = authUserId();
  return userId ? PLAYER_RUNTIME_STORAGE_PREFIX + userId : "";
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function applyPlayerRuntimePayload(payload) {
  var domains = [];
  if (!payload || payload.source === tabId) {
    return domains;
  }
  if (Array.isArray(payload.team)) {
    state.team = revivePokemonList(payload.team);
    domains.push("team");
  }
  if (Array.isArray(payload.box)) {
    state.box = reviveBoxList(payload.box);
    domains.push("box");
  }
  if (Array.isArray(payload.inventory)) {
    state.inventory = payload.inventory;
    domains.push("inventory");
  }
  if (payload.shopPurchases && typeof payload.shopPurchases === "object") {
    state.shopPurchases = payload.shopPurchases;
    domains.push("shopPurchases");
  }
  if (Array.isArray(payload.trainerInfo)) {
    state.trainerInfo = payload.trainerInfo;
    domains.push("profile");
  }
  if (payload.canonicalStateInvalidation === true) {
    domains.push("canonicalStateInvalidation");
  } else if (Number.isInteger(Number(payload.authoritativeRevision))
    && Number(payload.authoritativeRevision) > (Number(state.authoritativeRevision) || 0)) {
    state.authoritativeRevision = Number(payload.authoritativeRevision);
    domains.push("authoritativeRevision");
  }
  return domains;
}

function broadcastPlayerRuntimeState(payload) {
  var key = playerRuntimeStorageKey();
  if (!key || !canUseStorage()) {
    return;
  }
  try {
    payload.source = tabId;
    payload.updatedAt = Date.now();
    window.localStorage.setItem(key, JSON.stringify(payload));
  } catch (error) {}
}

function refreshTrainerSheetRuntime() {
  if (state.scene && state.scene.name === "team") {
    render();
  }
}

export function adjustTrainerMoney(delta) {
  var nextProfile = updateTrainerProfile(function (trainerInfo) {
    var currentMoney = Number(trainerInfo[1]) || 0;
    return [trainerInfo[0], Math.max(0, currentMoney + (Number(delta) || 0)), trainerInfo[2], trainerInfo[3]];
  });
  return Number(nextProfile[1]) || 0;
}

export function replaceTrainerMoneyRuntimeState(pokedollars) {
  state.trainerInfo[1] = Math.max(0, Math.floor(Number(pokedollars) || 0));
  broadcastPlayerRuntimeState({ trainerInfo: state.trainerInfo });
  refreshTrainerSheetRuntime();
  return state.trainerInfo[1];
}

export function updateTrainerProfile(updater) {
  var currentProfile = Array.isArray(state.trainerInfo) ? state.trainerInfo.slice() : [0, 0, 0, 0];
  var nextProfile = typeof updater === "function" ? updater(currentProfile.slice()) : currentProfile;
  if (!Array.isArray(nextProfile)) {
    nextProfile = currentProfile;
  }
  state.trainerInfo = [Number(nextProfile[0]) || 0, Number(nextProfile[1]) || 0, Number(nextProfile[2]) || 0, Math.max(0, Number(nextProfile[3]) || 0)];
  markDirty();
  broadcastPlayerRuntimeState({ trainerInfo: state.trainerInfo });
  refreshTrainerSheetRuntime();
  return state.trainerInfo;
}

export function adjustInventoryItemQuantity(itemIndex, delta) {
  state.inventory = updateInventoryQuantity(state.inventory, itemIndex, delta);
  markDirty();
  broadcastPlayerRuntimeState({ inventory: state.inventory });
  refreshTrainerSheetRuntime();
  return state.inventory;
}

export function replaceInventoryRuntimeState(items, options) {
  state.inventory = Array.isArray(items) ? items : [];
  if (!(options && options.markDirty === false)) {
    markDirty();
  }
  broadcastPlayerRuntimeState({ inventory: state.inventory });
  refreshTrainerSheetRuntime();
  return state.inventory;
}

export function adjustShopPurchaseQuantity(itemIndex, delta) {
  var key = String(itemIndex);
  var currentQuantity = Math.max(0, Math.floor(Number((state.shopPurchases || {})[key]) || 0));
  var nextQuantity = Math.max(0, currentQuantity + Math.floor(Number(delta) || 0));
  if (!state.shopPurchases) {
    state.shopPurchases = {};
  }
  if (nextQuantity > 0) {
    state.shopPurchases[key] = nextQuantity;
  } else {
    delete state.shopPurchases[key];
  }
  broadcastPlayerRuntimeState({ shopPurchases: state.shopPurchases });
  return nextQuantity;
}

export function broadcastTeamBoxRuntimeState() {
  broadcastPlayerRuntimeState({
    team: serializePokemonList(state.team),
    box: serializeBoxList(state.box)
  });
}

export function broadcastCaptureEncounterRuntimeInvalidation(revision) {
  broadcastPlayerRuntimeState({
    captureEncounterInvalidation: true,
    authoritativeRevision: Math.max(0, Number(revision) || 0)
  });
}

export function broadcastAuthoritativeRevision(revision) {
  broadcastPlayerRuntimeState({
    authoritativeRevision: Math.max(0, Number(revision) || 0),
    canonicalStateInvalidation: true
  });
}

export function markTeamRuntimeStateChanged() {
  markDirty();
  broadcastTeamBoxRuntimeState();
  refreshTrainerSheetRuntime();
}

export function replaceTeamRuntimeState(team) {
  state.team = Array.isArray(team) ? team : [];
  markTeamRuntimeStateChanged();
  return state.team;
}

export function initializeTeamBoxRuntime(onChange, onCaptureEncounterInvalidation) {
  if (!canUseStorage()) {
    return;
  }
  window.addEventListener("storage", function (event) {
    var payload;
    var domains;
    if (!event.key || !event.newValue) {
      return;
    }
    if (event.key !== playerRuntimeStorageKey()) {
      return;
    }
    try {
      payload = JSON.parse(event.newValue);
    } catch (error) {
      return;
    }
    if (payload.captureEncounterInvalidation === true && typeof onCaptureEncounterInvalidation === "function") {
      onCaptureEncounterInvalidation(payload);
    }
    domains = applyPlayerRuntimePayload(payload);
    if (domains.length && typeof onChange === "function") {
      onChange(domains);
    }
  });
}
