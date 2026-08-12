import { state } from "./game-state.js";

var DEPLOYMENT_URL = "/api/deployment-version";
var DEPLOYMENT_STORAGE_KEY = "pokemon_game_revival:deployment";
var CHECK_INTERVAL_MS = 60 * 60 * 1000;
var BATTLE_STORAGE_PREFIX = "pokemon_game_revival:runtime:in_battle:";
var BATTLE_STALE_AFTER_MS = 120000;

var checkingDeployment = false;

function fetchDeploymentId() {
  return fetch(DEPLOYMENT_URL, { cache: "no-store" })
    .then(function (response) {
      if (!response.ok) { return null; }
      return response.json();
    })
    .then(function (data) {
      var deployment = data && typeof data.deployment === "string" ? data.deployment.trim() : "";
      return deployment && deployment !== "local" ? deployment : null;
    })
    .catch(function () {
      return null;
    });
}

function isActiveBattleInStorage() {
  try {
    if (typeof localStorage === "undefined") { return false; }
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (!key || key.indexOf(BATTLE_STORAGE_PREFIX) !== 0) { continue; }
      var raw = localStorage.getItem(key);
      if (!raw) { continue; }
      var payload = JSON.parse(raw);
      if (payload && payload.active && Date.now() - Number(payload.updatedAt || 0) < BATTLE_STALE_AFTER_MS) {
        return true;
      }
    }
  } catch (error) {}
  return false;
}

function shouldDeferReloadForActiveBattle() {
  return Boolean(state.activeBattle || state.inBattle || isActiveBattleInStorage());
}

function reloadForDeployment(deployment) {
  if (shouldDeferReloadForActiveBattle()) { return false; }
  localStorage.setItem(DEPLOYMENT_STORAGE_KEY, deployment);
  location.reload();
  return true;
}

export function initializeDeploymentWatcher() {
  return fetchDeploymentId().then(function (deployment) {
    if (!deployment) { return false; }
    var stored = localStorage.getItem(DEPLOYMENT_STORAGE_KEY);
    if (stored && stored !== deployment) {
      return reloadForDeployment(deployment);
    }
    localStorage.setItem(DEPLOYMENT_STORAGE_KEY, deployment);
    return false;
  });
}

export function checkDeploymentFromServer() {
  if (checkingDeployment) { return; }
  checkingDeployment = true;
  fetchDeploymentId()
    .then(function (deployment) {
      if (!deployment) { return; }
      var stored = localStorage.getItem(DEPLOYMENT_STORAGE_KEY);
      if (stored && stored !== deployment) {
        reloadForDeployment(deployment);
        return;
      }
      localStorage.setItem(DEPLOYMENT_STORAGE_KEY, deployment);
    })
    .finally(function () {
      checkingDeployment = false;
    });
}

export function setupDeploymentWatch() {
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") {
      checkDeploymentFromServer();
    }
  });
  setInterval(checkDeploymentFromServer, CHECK_INTERVAL_MS);
}
