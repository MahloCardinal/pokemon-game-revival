import { state } from "./game-state.js";
import { setScene } from "./renderer.js";
import { openMessage } from "./dialog-handler.js";
import { messageDescriptor } from "./i18n.js";

var STORAGE_PREFIX = "pokemon_game_revival:runtime:in_battle:";
var PENDING_STORAGE_PREFIX = "pokemon_game_revival:runtime:pending_activity:";
var TAB_STORAGE_KEY = "pokemon_game_revival:runtime:battle_tab_id";
var STALE_AFTER_MS = 120000;
var tabId = currentTabId();
var listeners = [];

function authUserId() {
  return state.auth && state.auth.user ? String(state.auth.user.id || "") : "";
}

function storageKey() {
  var userId = authUserId();
  return userId ? STORAGE_PREFIX + userId : "";
}

function pendingStorageKey() {
  var userId = authUserId();
  return userId ? PENDING_STORAGE_PREFIX + userId : "";
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function createTabId() {
  return String(Date.now()) + "-" + Math.random().toString(36).slice(2);
}

function isReloadNavigation() {
  var entries;
  if (typeof window === "undefined" || typeof window.performance === "undefined") {
    return false;
  }
  if (typeof window.performance.getEntriesByType === "function") {
    entries = window.performance.getEntriesByType("navigation");
    if (entries && entries[0] && entries[0].type) {
      return entries[0].type === "reload";
    }
  }
  return window.performance.navigation && window.performance.navigation.type === 1;
}

function currentTabId() {
  var stored;
  if (typeof window === "undefined" || typeof window.sessionStorage === "undefined") {
    return createTabId();
  }
  try {
    stored = window.sessionStorage.getItem(TAB_STORAGE_KEY);
    if (stored && isReloadNavigation()) {
      return stored;
    }
    stored = createTabId();
    window.sessionStorage.setItem(TAB_STORAGE_KEY, stored);
    return stored;
  } catch (error) {
    return createTabId();
  }
}

function readPayload() {
  var key = storageKey();
  var raw;
  if (!key || !canUseStorage()) {
    return null;
  }
  try {
    raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function readPendingPayload() {
  var key = pendingStorageKey();
  var raw;
  if (!key || !canUseStorage()) {
    return null;
  }
  try {
    raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function writePayload() {
  var key = storageKey();
  if (!key || !canUseStorage()) {
    return;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify({
      active: true,
      owner: tabId,
      updatedAt: Date.now()
    }));
  } catch (error) {}
}

function payloadIsActive(payload) {
  var updatedAt = payload ? Number(payload.updatedAt) : 0;
  return Boolean(payload && payload.active && updatedAt && Date.now() - updatedAt < STALE_AFTER_MS);
}

function pendingPayloadIsActive(payload) {
  return Boolean(payload && payload.active && payload.type);
}

function syncPendingActivityFromStorage() {
  var payload = readPendingPayload();
  if (!pendingPayloadIsActive(payload)) {
    state.pendingActivity = null;
    return;
  }
  state.pendingActivity = {
    type: payload.type,
    label: payload.label || "active_activity",
    slotIndex: Number.isFinite(Number(payload.slotIndex)) ? Number(payload.slotIndex) : null
  };
}

function notifyBattleRuntimeChange() {
  listeners.forEach(function (listener) {
    listener(state.inBattle);
  });
}

function setStateInBattle(nextValue) {
  var previousValue = state.inBattle;
  state.inBattle = Boolean(nextValue);
  if (previousValue !== state.inBattle) {
    notifyBattleRuntimeChange();
  }
}

export function isBattleRuntimeActive() {
  return Boolean(state.inBattle || state.activeBattle || state.battleStartPending || state.pendingActivity
    || payloadIsActive(readPayload()) || pendingPayloadIsActive(readPendingPayload()));
}

export function battleRuntimeOwnerId() {
  return tabId;
}

export function ownsBattleRuntimeLock() {
  return true;
}

export function clearBattleRuntimeOwnership() {
  setStateInBattle(Boolean(state.activeBattle) || payloadIsActive(readPayload()) || Boolean(state.pendingActivity));
}

export function setBattleRuntimeObserved(active) {
  setStateInBattle(active);
}

export function syncBattleRuntimeState() {
  syncPendingActivityFromStorage();
  var active = Boolean(state.activeBattle) || payloadIsActive(readPayload()) || Boolean(state.pendingActivity);
  setStateInBattle(active);
  return active;
}

export function setBattleRuntimeActive(active) {
  var key = storageKey();
  var payload;
  if (active) {
    writePayload();
    setStateInBattle(true);
    return;
  }

  payload = readPayload();
  if (key && canUseStorage() && (!payload || payload.owner === tabId)) {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {}
  }
  setStateInBattle(Boolean(state.pendingActivity));
}

export function setPendingActivityRuntime(activity) {
  var key = pendingStorageKey();
  state.pendingActivity = activity || null;
  if (key && canUseStorage()) {
    try {
      if (activity) {
        window.localStorage.setItem(key, JSON.stringify(Object.assign({ active: true }, activity)));
      } else {
        window.localStorage.removeItem(key);
      }
    } catch (error) {}
  }
  syncBattleRuntimeState();
}

export function clearPendingActivityRuntime(type) {
  if (type && state.pendingActivity && state.pendingActivity.type !== type) {
    return;
  }
  setPendingActivityRuntime(null);
}

export function activateBattleRuntimeOwnership() {
  setBattleRuntimeActive(true);
}

export function claimBattleRuntimeLock() {
  activateBattleRuntimeOwnership();
  return Promise.resolve({ ok: true });
}

export function forceClaimBattleRuntimeLock() {
  activateBattleRuntimeOwnership();
  return Promise.resolve({ ok: true });
}

export function onBattleRuntimeChange(listener) {
  if (typeof listener === "function") {
    listeners.push(listener);
  }
}

export function initializeBattleRuntime() {
  if (!canUseStorage()) {
    return;
  }
  window.addEventListener("storage", function (event) {
    if (event.key && (event.key.indexOf(STORAGE_PREFIX) === 0 || event.key.indexOf(PENDING_STORAGE_PREFIX) === 0)) {
      syncBattleRuntimeState();
    }
  });
  window.addEventListener("focus", syncBattleRuntimeState);
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) {
      syncBattleRuntimeState();
    }
  });
}

export var BATTLE_LOCK_MSG = messageDescriptor("system.activeActivity");

export function requireNotInBattle() {
  if (isBattleRuntimeActive()) {
    openMessage([BATTLE_LOCK_MSG], { title: "" });
    return false;
  }
  return true;
}

export function ensureBattleBindings(scene) {
  scene.playerTeam.combatantList.concat(scene.enemyTeam.combatantList).forEach(function (combatant) {
    if (combatant.__boundForUi) {
      return;
    }
    combatant.gui = {
      applyMoveStates: function (states) {
        combatant.moveStates = states;
      },
      setPokemon: function (pokemon) {
        combatant.pokemon = pokemon;
        combatant.updateMovesState();
      }
    };
    combatant.__boundForUi = true;
    combatant.updateMovesState();
  });
}

export function enforceBattleRuntimeSceneLock() {
  var scene = state.scene;
  var exitScene;
  if (!scene) { return false; }
  if (state.battleStartPending) { return false; }
  if (!isBattleRuntimeActive()) { return false; }
  if (scene.name === "training-zone") {
    exitScene = { name: "battle-area" };
  } else if (scene.name === "pokemon-center") {
    exitScene = { name: "city" };
  } else if (scene.name === "capture") {
    exitScene = { name: "zones" };
  } else {
    return false;
  }
  if (state.dialog && state.dialog.battleLockScene === scene.name) { return true; }
  openMessage([BATTLE_LOCK_MSG], {
    title: "",
    closeLabel: messageDescriptor("system.exit"),
    closeClass: "button-accent",
    requireButtonClose: true,
    battleLockScene: scene.name,
    onClose: function () {
      setScene(exitScene, { history: "replace" });
    }
  });
  return true;
}
