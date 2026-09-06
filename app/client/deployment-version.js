import { state } from "./game-state.js";

var DEPLOYMENT_URL = "/api/deployment-version";
var DEPLOYMENT_STORAGE_KEY = "pokemon_game_revival:deployment";
var CHECK_INTERVAL_MS = 60 * 60 * 1000;
var BATTLE_STORAGE_PREFIX = "pokemon_game_revival:runtime:in_battle:";
var BATTLE_STALE_AFTER_MS = 120000;

var checkingDeployment = false;
var loadedDeployment = readStoredDeployment();

function readStoredDeployment() {
  try { return sessionStorage.getItem(DEPLOYMENT_STORAGE_KEY) || null; } catch (error) { return null; }
}

function rememberDeployment(deployment) {
  loadedDeployment = deployment;
  try { sessionStorage.setItem(DEPLOYMENT_STORAGE_KEY, deployment); } catch (error) {}
}

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
  rememberDeployment(deployment);
  location.reload();
  return true;
}

export function initializeDeploymentWatcher() {
  return checkDeploymentFromServer();
}

export function checkDeploymentFromServer() {
  if (checkingDeployment) { return Promise.resolve(false); }
  checkingDeployment = true;
  return fetchDeploymentId()
    .then(function (deployment) {
      if (!deployment) { return false; }
      if (loadedDeployment && loadedDeployment !== deployment) {
        return reloadForDeployment(deployment);
      }
      rememberDeployment(deployment);
      return false;
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
