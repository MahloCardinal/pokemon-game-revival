import { assetPath, escapeHtml, musicPath, renderImage } from "./asset-helpers.js";
import { root, state } from "./game-state.js";
import { isGymOrLeagueBattleType } from "../data/gyms.js";
import { registerAction } from "./action-registry.js";
import { renderLanguageSettingsControl } from "./language-settings.js";

var MUSIC_ENABLED_KEY = "pokemon_game_revival:music_enabled";
var MUSIC_VOLUME_KEY = "pokemon_game_revival:music_volume";
var mainTrack = null;
var adminBattleTrack = null;
var lastScene = null;
var unlockListenersBound = false;
var pageFocusSuspended = false;

function storedMusicEnabled() {
  try {
    return localStorage.getItem(MUSIC_ENABLED_KEY) === "on";
  } catch (error) {
    return false;
  }
}

var musicEnabled = storedMusicEnabled();

function clampVolume(value) {
  var number = Number(value);
  if (!Number.isFinite(number)) {
    return 0.1;
  }
  return Math.max(0, Math.min(1, number));
}

function storedMusicVolume() {
  var value;
  try {
    value = localStorage.getItem(MUSIC_VOLUME_KEY);
    return value === null ? 0.1 : clampVolume(value);
  } catch (error) {
    return 0.1;
  }
}

var musicVolume = storedMusicVolume();

function createTrack(fileName) {
  var track = new Audio(musicPath(fileName));
  track.loop = true;
  track.preload = "auto";
  track.volume = musicVolume;
  return track;
}

function ensureTracks() {
  if (!mainTrack) {
    mainTrack = createTrack("main.mp3");
  }
  if (!adminBattleTrack) {
    adminBattleTrack = createTrack("pvp_battle.mp3");
  }
}

function stopTrack(track, resetPosition) {
  if (!track) {
    return;
  }
  track.pause();
  if (resetPosition) {
    try { track.currentTime = 0; } catch (error) {}
  }
}

function stopAllTracks(resetPosition) {
  stopTrack(mainTrack, resetPosition);
  stopTrack(adminBattleTrack, resetPosition);
}

function playTrack(track) {
  var result;
  if (!track || !track.paused) {
    return;
  }
  result = track.play();
  if (result && typeof result.catch === "function") {
    result.catch(function () {
      bindUnlockListeners();
    });
  }
}

function battleTypeForScene(scene) {
  if (!scene) {
    return "";
  }
  return scene.battleType || (scene.manager && scene.manager.battleType) || "";
}

function activeBattleType() {
  return state.activeBattle ? state.activeBattle.battleType || "" : "";
}

function isAdminMusicScene(scene) {
  return Boolean(scene && (
    scene.name === "admin-battle"
    || scene.adminBattle
    || scene.adminControlled
    || (scene.manager && scene.manager.adminControlled)
    || isGymOrLeagueBattleType(battleTypeForScene(scene))
  ));
}

function desiredModeForScene(scene) {
  if (!scene || scene.name === "login" || scene.name === "privacy-policy" || scene.name === "terms") {
    return "none";
  }
  return isAdminMusicScene(scene) || isGymOrLeagueBattleType(activeBattleType()) ? "admin-battle" : "main";
}

function playMode(mode) {
  if (pageFocusSuspended) {
    stopAllTracks(false);
    return;
  }
  if (!musicEnabled || mode === "none") {
    if (!mainTrack && !adminBattleTrack) {
      return;
    }
    stopTrack(mainTrack, mode === "none");
    stopTrack(adminBattleTrack, true);
    return;
  }
  ensureTracks();
  if (mode === "admin-battle") {
    stopTrack(mainTrack, true);
    playTrack(adminBattleTrack);
    return;
  }
  stopTrack(adminBattleTrack, true);
  playTrack(mainTrack);
}

function retryAfterInteraction() {
  if (!musicEnabled) {
    return;
  }
  playMode(desiredModeForScene(lastScene || state.scene));
}

function bindUnlockListeners() {
  if (unlockListenersBound) {
    return;
  }
  unlockListenersBound = true;
  document.addEventListener("pointerdown", retryAfterInteraction, true);
  document.addEventListener("keydown", retryAfterInteraction, true);
}

function setPageFocusSuspended(suspended) {
  if (pageFocusSuspended === Boolean(suspended)) {
    return;
  }
  pageFocusSuspended = Boolean(suspended);
  if (pageFocusSuspended) {
    stopAllTracks(false);
    return;
  }
  playMode(desiredModeForScene(lastScene || state.scene));
}

function syncPageFocusSuspension() {
  setPageFocusSuspended(Boolean(document.hidden));
}

function bindPageFocusListeners() {
  document.addEventListener("visibilitychange", syncPageFocusSuspension);
  window.addEventListener("pagehide", function () {
    setPageFocusSuspended(true);
  });
  window.addEventListener("pageshow", syncPageFocusSuspension);
  window.addEventListener("blur", function () {
    setPageFocusSuspended(true);
  });
  window.addEventListener("focus", syncPageFocusSuspension);
  syncPageFocusSuspension();
}

export function syncMusicForScene(scene) {
  lastScene = scene || null;
  playMode(desiredModeForScene(lastScene));
}

export function isMusicEnabled() {
  return musicEnabled;
}

export function setMusicVolume(value) {
  musicVolume = clampVolume(value);
  try {
    localStorage.setItem(MUSIC_VOLUME_KEY, String(musicVolume));
  } catch (error) {}
  if (mainTrack) {
    mainTrack.volume = musicVolume;
  }
  if (adminBattleTrack) {
    adminBattleTrack.volume = musicVolume;
  }
  return musicVolume;
}

export function toggleMusicEnabled() {
  musicEnabled = !musicEnabled;
  try {
    localStorage.setItem(MUSIC_ENABLED_KEY, musicEnabled ? "on" : "off");
  } catch (error) {}
  if (!musicEnabled) {
    ensureTracks();
    stopTrack(mainTrack, true);
    stopTrack(adminBattleTrack, true);
    return musicEnabled;
  }
  syncMusicForScene(lastScene || state.scene);
  return musicEnabled;
}

function userSettingsName() {
  return state.auth.userLabel || state.playerName || "Utente";
}

export function renderUserSettingsMenu(scene) {
  var volumePercent = Math.round(musicVolume * 100);
  if (!scene || scene.name === "login" || scene.name === "privacy-policy" || scene.name === "terms") {
    return "";
  }
  return [
    '<details class="user-settings">',
    '  <summary class="user-settings-trigger" aria-label="Apri impostazioni utente">',
    '    <span class="user-settings-name">Impostazioni</span>',
    '    ' + renderImage(assetPath("img_miscellaneous", "settings_icon.webp"), "", "user-settings-icon", 'aria-hidden="true" loading="eager" decoding="async"'),
    '  </summary>',
    '  <div class="user-settings-menu">',
    '    <div class="user-settings-heading">',
    '      <strong>Utente: ' + escapeHtml(userSettingsName()) + '</strong>',
    '    </div>',
    '    <button type="button" class="button music-toggle' + (musicEnabled ? ' is-on' : ' is-off') + '" data-action="music-toggle" aria-pressed="' + (musicEnabled ? 'true' : 'false') + '">',
    '      <span class="music-toggle-label">Musica</span>',
    '      <span class="music-toggle-state">' + (musicEnabled ? 'ON' : 'OFF') + '</span>',
    '    </button>',
    '    <label class="settings-volume-control">',
    '      <span>Volume <strong data-music-volume-value>' + volumePercent + '%</strong></span>',
    '      <input type="range" min="0" max="100" step="1" value="' + volumePercent + '" data-field="music-volume" aria-label="Volume musica">',
    '    </label>',
    renderLanguageSettingsControl(),
    '    <div class="user-settings-actions">',
    '      <button type="button" class="button button-dark user-settings-action" data-action="auth-logout">Logout</button>',
    '      <button type="button" class="button button-danger user-settings-action" data-action="auth-delete-account">Elimina account</button>',
    '    </div>',
    '  </div>',
    '</details>'
  ].join("");
}

registerAction("music-toggle", function (element) {
  var enabled = toggleMusicEnabled();
  var stateLabel = element ? element.querySelector(".music-toggle-state") : null;
  if (element) {
    element.classList.toggle("is-on", enabled);
    element.classList.toggle("is-off", !enabled);
    element.setAttribute("aria-pressed", enabled ? "true" : "false");
  }
  if (stateLabel) {
    stateLabel.textContent = enabled ? "ON" : "OFF";
  }
});

registerAction("music-volume-change", function (element) {
  var volume = setMusicVolume((Number(element && element.value) || 0) / 100);
  var label = root.querySelector("[data-music-volume-value]");
  if (label) {
    label.textContent = Math.round(volume * 100) + "%";
  }
});

bindUnlockListeners();
bindPageFocusListeners();
