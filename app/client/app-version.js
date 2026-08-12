import { state } from "./game-state.js";

var VERSION_URL = "/app-version.json";
var VERSION_STORAGE_KEY = "pokemon_game_revival:app_version";
var CHECK_INTERVAL_MS = 60 * 60 * 1000;
var BATTLE_STORAGE_PREFIX = "pokemon_game_revival:runtime:in_battle:";
var BATTLE_STALE_AFTER_MS = 120000;

var checkingVersion = false;

function fetchAppVersion() {
  return fetch(VERSION_URL + "?t=" + Date.now(), { cache: "no-store" })
    .then(function (response) {
      if (!response.ok) {
        return null;
      }
      return response.json();
    })
    .then(function (data) {
      var version = data && typeof data.version === "string" ? data.version.trim() : "";
      return version || null;
    })
    .catch(function () {
      return null;
    });
}

function isActiveBattleInStorage() {
  try {
    if (typeof localStorage === "undefined") { return false; }
    var i, key, raw, payload;
    for (i = 0; i < localStorage.length; i++) {
      key = localStorage.key(i);
      if (key && key.indexOf(BATTLE_STORAGE_PREFIX) === 0) {
        raw = localStorage.getItem(key);
        if (raw) {
          payload = JSON.parse(raw);
          if (payload && payload.active && Date.now() - Number(payload.updatedAt || 0) < BATTLE_STALE_AFTER_MS) {
            return true;
          }
        }
      }
    }
  } catch (e) {}
  return false;
}

function shouldDeferReloadForActiveBattle() {
  return Boolean(state.activeBattle || state.inBattle || isActiveBattleInStorage());
}

function reloadForNewVersion(version) {
  if (shouldDeferReloadForActiveBattle()) {
    return false;
  }
  localStorage.setItem(VERSION_STORAGE_KEY, version);
  location.reload();
  return true;
}

export function initializeAppVersionWatcher() {
  return fetchAppVersion().then(function (version) {
    var stored;

    if (!version) {
      return false;
    }

    stored = localStorage.getItem(VERSION_STORAGE_KEY);
    if (stored && stored !== version) {
      return reloadForNewVersion(version);
    }

    localStorage.setItem(VERSION_STORAGE_KEY, version);
    return false;
  });
}

export function checkAppVersionFromServer() {
  if (checkingVersion) {
    return;
  }

  checkingVersion = true;
  fetchAppVersion()
    .then(function (version) {
      var stored;

      if (!version) {
        return;
      }

      stored = localStorage.getItem(VERSION_STORAGE_KEY);
      if (stored && stored !== version) {
        reloadForNewVersion(version);
        return;
      }

      localStorage.setItem(VERSION_STORAGE_KEY, version);
    })
    .then(function () {
      checkingVersion = false;
    });
}

export function setupAppVersionWatch() {
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") {
      checkAppVersionFromServer();
    }
  });
  setInterval(checkAppVersionFromServer, CHECK_INTERVAL_MS);
}
