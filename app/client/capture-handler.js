import { registerAction } from "./action-registry.js";
import { pokemonDisplayName, teamViolationFromBattleResult, teamViolationLines } from "./entity-text.js";
import { messageDescriptor, t, textDescriptor } from "./i18n.js";
import {
  battleTypeForCapture,
  ensureFinalBattleDisplaySnapshot,
  appendBattleEvents,
  closePersistedBattleRuntime,
  openActiveProgressionScene,
  openBattleStartTargetPanel,
  consumePlayerBattleInventoryItem,
  syncBattleInventoryToState
} from "./battle-handler.js";
import { assignNextBoxIndex, queueBoxUpsert } from "./box-handler.js";
import { enforceBattleRuntimeSceneLock, ensureBattleBindings } from "./battle-scene-lock.js";

var TEAM_MAX = Engine.TEAM_MAX;
var findTeamCompositionViolation = Engine.findTeamCompositionViolation;
import { FLUTE_DAILY_USE_LIMIT, SEARCH_TOOL_ITEMS, captureLevelIsUnlocked, captureLevelLimitForBadges, captureLevelRangesForBadges } from "../data/progression.js";
import { openMessage } from "./dialog-handler.js";
import { markDirty, setScene } from "./renderer.js";
import { saveAfterStateChange } from "./save-runtime.js";
import { saveFromAuthoritativeProjection } from "../api/player.js";
import { currentUserId, getSupabaseClient } from "../api/supabase.js";
import { applyPlayerSave, root, state, registerPokedexPokemon, consumeFluteDailyUseLocally } from "./game-state.js";
import { createCaptureScene, rememberCaptureSearchPreferences } from "./router.js";
import * as Engine from "../engine/index.js";
import { button } from "./render-utils.js";
import { setHtml } from "./renderer.js";
import { renderPokemonCard } from "./pokemon-card.js";
import { broadcastCaptureEncounterRuntimeInvalidation, broadcastTeamBoxRuntimeState } from "./runtime-state.js";
import { recordMissionEvent } from "./mission-runtime.js";
import { renderCaptureTeamSectionInner } from "../view/capture.js";
import { queueGlobalActivityEvent } from "./activity-feed-runtime.js";
import { getResolvedInventoryItem } from "../data/items.js";
import { claimFluteDailyUse, startAuthoritativeWildEncounter } from "../api/search-tools.js";
import { authoritativeBattleRuntimeOwnerId, clearPendingAuthoritativeCaptureFlee, fleeAuthoritativeCaptureEncounter, getAuthoritativeBattle, startAuthoritativeCaptureBattle } from "../api/battle.js";
import { openAuthoritativeBattleProjection } from "./battle-handler.js";
import { getCurrentPlayerState } from "../api/player-command.js";

var authoritativeCaptureCommandPending = false;
var CAPTURE_START_STORAGE_KEY = "pokemon-game-revival:pending-capture-battle-start";

function captureFailureMessage(result, fallbackKey) {
  var keyByCode = {
    activity_in_progress: "capture.activeBattle",
    battle_snapshot_incompatible: "capture.snapshotIncompatible",
    capture_battle_active: "capture.battleAlreadyStarted",
    encounter_unavailable: "capture.encounterUnavailable",
    revision_conflict: "capture.stateChanged",
    runtime_locked: "capture.runtimeLocked",
    team_level_limit_exceeded: "capture.teamLevelLimit"
  };
  return messageDescriptor(keyByCode[String(result && result.code || "")] || fallbackKey);
}

function captureStartPayload(input) {
  return JSON.stringify({
    expectedPlayerRevision: Number(input.expectedPlayerRevision),
    runtimeOwnerId: String(input.runtimeOwnerId),
    encounterId: String(input.encounterId),
    activeSlot: Number(input.activeSlot)
  });
}

function captureStartStorageKey(userId, encounterId) {
  return CAPTURE_START_STORAGE_KEY + ":" + String(userId || "") + ":" + String(encounterId || "");
}

function normalizedCaptureStartInput(input) {
  return {
    expectedPlayerRevision: Number(input.expectedPlayerRevision),
    runtimeOwnerId: String(input.runtimeOwnerId),
    encounterId: String(input.encounterId),
    activeSlot: Number(input.activeSlot)
  };
}

function pendingCaptureStart(userId, input) {
  var normalizedInput = normalizedCaptureStartInput(input);
  var encounterId = normalizedInput.encounterId;
  var storageKey = captureStartStorageKey(userId, encounterId);
  var pending = null;
  try { pending = JSON.parse(window.sessionStorage.getItem(storageKey) || "null"); } catch (error) {}
  if (!pending || pending.userId !== userId || pending.encounterId !== encounterId
    || !pending.input || String(pending.input.encounterId || "") !== encounterId
    || pending.payload !== captureStartPayload(pending.input)
    || !/^[0-9a-f-]{36}$/i.test(String(pending.commandId || ""))) {
    pending = { userId: userId, encounterId: encounterId, commandId: globalThis.crypto.randomUUID(),
      input: normalizedInput, payload: captureStartPayload(normalizedInput) };
    try { window.sessionStorage.setItem(storageKey, JSON.stringify(pending)); } catch (error) {
      throw new Error("Unable to persist the pending capture battle start.");
    }
  }
  return Object.assign({ storageKey: storageKey }, pending);
}

async function clearPendingCaptureStart(expected) {
  var client = getSupabaseClient();
  var user = client ? await currentUserId(client) : { ok: false };
  var stored = null;
  if (!expected || !user.ok || user.userId !== expected.userId
    || expected.storageKey !== captureStartStorageKey(expected.userId, expected.encounterId)) { return false; }
  try { stored = JSON.parse(window.sessionStorage.getItem(expected.storageKey) || "null"); } catch (error) {}
  if (!stored || stored.userId !== expected.userId || stored.encounterId !== expected.encounterId
    || stored.commandId !== expected.commandId) { return false; }
  try { window.sessionStorage.removeItem(expected.storageKey); } catch (error) { return false; }
  return true;
}

registerAction("capture-search", async function(element) {
  if (enforceBattleRuntimeSceneLock()) {
    return;
  }
  var scene = state.scene;
  if (captureWildPokemonForScene(scene)) {
    return;
  }
  var levelInput = root.querySelector('[data-field="capture-level"]');
  var rangeSelect = root.querySelector('[name="capture-search-range"]:checked');
  var typeSelect = root.querySelector('[name="capture-search-type"]:checked');
  var maxSearchLevel = captureLevelLimitForBadges(state.trainerInfo[2]);
  var ranges = captureLevelRangesForBadges(state.trainerInfo[2], true);
  var rangeIndex = Math.max(0, Math.min(ranges.length - 1, Math.floor(Number(rangeSelect ? rangeSelect.value : scene.selectedRangeIndex) || 0)));
  var selectedRange = ranges[rangeIndex] || ranges[0];
  var zoneTypes = Engine.getZoneTypes(scene.zoneName);
  var hasWhiteFlute = Number((getResolvedInventoryItem(state.inventory, SEARCH_TOOL_ITEMS.whiteFlute.index) || {}).quantity) > 0;
  var hasBlackFlute = Number((getResolvedInventoryItem(state.inventory, SEARCH_TOOL_ITEMS.blackFlute.index) || {}).quantity) > 0;
  var whiteFluteRemaining = state.fluteDaily && state.fluteDaily.whiteFlute && state.fluteDaily.whiteFlute.remaining || 0;
  var blackFluteRemaining = state.fluteDaily && state.fluteDaily.blackFlute && state.fluteDaily.blackFlute.remaining || 0;
  var useWhiteFlute = hasWhiteFlute && whiteFluteRemaining > 0 && Boolean(root.querySelector('[name="capture-use-white-flute"]:checked'));
  var useBlackFlute = hasBlackFlute && blackFluteRemaining > 0 && Boolean(root.querySelector('[name="capture-use-black-flute"]:checked'));
  var levelText = levelInput ? levelInput.value.replace(/\D/g, "").slice(0, 2) : "";
  var level = useWhiteFlute ? Number(levelText) : Engine.randInt(selectedRange.min, selectedRange.max);
  var selectedType = useBlackFlute && typeSelect ? typeSelect.value : zoneTypes[0] || "";
  scene.levelText = levelText;
  scene.selectedRangeIndex = rangeIndex;
  scene.useWhiteFlute = useWhiteFlute;
  scene.useBlackFlute = useBlackFlute;
  scene.selectedType = selectedType;
  rememberCaptureSearchPreferences(scene);
  if (!selectedRange || !selectedType || zoneTypes.indexOf(selectedType) === -1) {
    scene.searchError = "";
    flashCaptureLevelHint();
    return;
  }
  if (useWhiteFlute && (!/^\d{1,2}$/.test(levelText) || level < 5 || level > maxSearchLevel || !captureLevelIsUnlocked(level, state.trainerInfo[2]))) {
    scene.searchError = "";
    flashCaptureLevelHint();
    return;
  }
  if (authoritativeCaptureCommandPending) {
    return;
  }
  authoritativeCaptureCommandPending = true;
  var authoritativeResult = await startAuthoritativeWildEncounter({
    expectedRevision: state.authoritativeRevision,
    zoneKey: scene.zoneName,
    requestedLevel: useWhiteFlute ? level : null,
    searchMode: { rangeIndex: rangeIndex, typeKey: selectedType },
    fluteChoice: useWhiteFlute ? (useBlackFlute ? "both" : "white") : (useBlackFlute ? "black" : "none")
  });
  authoritativeCaptureCommandPending = false;
  if (!authoritativeResult.ok) {
    openMessage([messageDescriptor(authoritativeResult.code === "activity_in_progress" ? "capture.activeBattle" : "capture.searchFailed")], {
      title: messageDescriptor("capture.searchTitle")
    });
    return;
  }
  applyPlayerSave(saveFromAuthoritativeProjection(authoritativeResult.projection));
  syncCaptureSceneToActiveEncounter(scene);
  broadcastCaptureEncounterRuntimeInvalidation(state.authoritativeRevision);
  updateCaptureSearchResultInline(scene);
  updateCaptureToolUsageInline("whiteFlute");
  updateCaptureToolUsageInline("blackFlute");
  return;
});

registerAction("capture-start-fight", function(element) {
  var violation;
  if (enforceBattleRuntimeSceneLock()) {
    return;
  }
  var captureScene = state.scene;
  syncCaptureSceneToActiveEncounter(captureScene);
  if (!captureScene.wildPokemon) {
    return;
  }
  var available = state.team.filter(function(p) { return p != null; });
  violation = findTeamCompositionViolation(available);
  if (violation) {
    openMessage(teamViolationLines(violation), { title: textDescriptor("ui.zoneCards.zones.title") });
    return;
  }
  if (available.length === 1) {
    buildBattleScene(captureScene, state.team.indexOf(available[0]));
    return;
  }
  openBattleStartTargetPanel(element, state.team.map(function (pokemon, index) {
    return pokemon ? { name: pokemon.name, index: index } : null;
  }).filter(Boolean), function (activeIndex) {
    buildBattleScene(captureScene, activeIndex);
  });
  return;
});

registerAction("capture-flee", async function() {
  var captureScene;
  var wildPokemon;
  var encounter;
  var result;
  var refreshed;
  if (enforceBattleRuntimeSceneLock()) {
    return;
  }
  captureScene = state.scene;
  encounter = state.activeEncounter && state.activeEncounter.zoneKey === captureScene.zoneName ? state.activeEncounter : null;
  wildPokemon = encounter && encounter.pokemon;
  if (!wildPokemon) {
    return;
  }
  if (authoritativeCaptureCommandPending || !encounter || !encounter.encounterId) {
    return;
  }
  authoritativeCaptureCommandPending = true;
  try {
    result = await fleeAuthoritativeCaptureEncounter({
      expectedPlayerRevision: state.authoritativeRevision,
      encounterId: encounter.encounterId
    });
    if (result.ok && result.projection && result.projection.player_state) {
      applyPlayerSave(saveFromAuthoritativeProjection(result.projection.player_state));
      syncCaptureSceneToActiveEncounter(captureScene);
      broadcastCaptureEncounterRuntimeInvalidation(state.authoritativeRevision);
      updateCaptureSearchResultInline(captureScene);
      return;
    }
    if (result.code === "rate_limited") {
      openMessage([messageDescriptor("capture.rateLimited")], { title: messageDescriptor("capture.fleeTitle") });
      return;
    }
    refreshed = await refreshCaptureEncounterState(captureScene);
    if (result.uncertain && refreshed && !captureEncounterForScene(captureScene)) {
      await clearPendingAuthoritativeCaptureFlee(encounter.encounterId);
      return;
    }
    if (result.uncertain || !refreshed || captureEncounterForScene(captureScene)) {
      openMessage([captureFailureMessage(result, "capture.fleeFailed")], { title: messageDescriptor("capture.fleeTitle") });
    }
  } finally {
    authoritativeCaptureCommandPending = false;
  }
});

function updateCaptureSearchResultInline(scene, options) {
  options = options || {};
  var wildCardWrap = root.querySelector(".wild-card-wrap");
  var searchActions = root.querySelector(".capture-search-actions");
  var wildPokemon = captureWildPokemonForScene(scene);
  var encounter = captureEncounterForScene(scene);
  var appearanceKey = wildPokemon && String(encounter && encounter.encounterId || wildPokemon.instanceId || [
    scene.zoneName, wildPokemon.speciesKey, wildPokemon.level, wildPokemon.name
  ].join(":"));
  var shouldAnimate = Boolean(wildPokemon && appearanceKey && appearanceKey !== lastAnimatedCaptureEncounterKey);

  if (wildCardWrap && options.updateWildCard !== false) {
    state.captureWildCard = null;
    setHtml(wildCardWrap, wildPokemon
      ? renderPokemonCard(wildPokemon)
      : '<div class="empty-state capture-wild-placeholder">' + t("ui.capture.noWildPokemon") + '</div>');
    wildCardWrap.classList.remove("wild-card-wrap--appearing");
    if (shouldAnimate) {
      void wildCardWrap.offsetWidth;
      wildCardWrap.classList.add("wild-card-wrap--appearing");
      lastAnimatedCaptureEncounterKey = appearanceKey;
    }
  }
  if (!wildPokemon) { lastAnimatedCaptureEncounterKey = ""; }
  if (searchActions) {
    setHtml(searchActions, renderCaptureSearchActions(scene));
  }
}

function renderCaptureSearchActions(scene) {
  var wildPokemon = captureWildPokemonForScene(scene);
  var wildPokemonName = wildPokemon ? pokemonDisplayName(wildPokemon) : "";
  return [
    button(t("ui.capture.search"), "capture-search", wildPokemon ? "disabled" : "", "button-accent capture-search-button"),
    button(t("ui.capture.flee"), "capture-flee", wildPokemon ? "" : "disabled", "button-ghost capture-flee-button"),
    button(
      wildPokemon ? t("ui.capture.fightPokemon", { pokemon: wildPokemonName }) : t("ui.capture.fight"),
      "capture-start-fight",
      wildPokemon ? "" : "disabled",
      "button-primary capture-fight-button"
    )
  ].join("");
}

function captureEncounterForScene(scene) {
  return state.activeEncounter && state.activeEncounter.zoneKey === scene.zoneName ? state.activeEncounter : null;
}

function captureWildPokemonForScene(scene) {
  var encounter = captureEncounterForScene(scene);
  return encounter && encounter.pokemon || null;
}

function syncCaptureSceneToActiveEncounter(scene) {
  var encounter;
  if (!scene || scene.name !== "capture") {
    return;
  }
  encounter = captureEncounterForScene(scene);
  scene.wildPokemon = encounter && encounter.pokemon || null;
  scene.encounterId = encounter && encounter.encounterId || null;
}

async function refreshCaptureEncounterState(scene) {
  var result = await getCurrentPlayerState();
  if (!result.ok) {
    return false;
  }
  applyPlayerSave(saveFromAuthoritativeProjection(result.projection));
  syncCaptureSceneToActiveEncounter(scene);
  updateCaptureSearchResultInline(scene);
  return true;
}

var captureRuntimeRefresh = null;
var lastAnimatedCaptureEncounterKey = "";

function canRefreshCaptureRuntime() {
  return !state.inBattle && !state.battleStartPending;
}

export function refreshCaptureEncounterRuntime() {
  var scene = state.scene;
  if (!canRefreshCaptureRuntime()) {
    return Promise.resolve(false);
  }
  if (captureRuntimeRefresh) {
    return captureRuntimeRefresh;
  }
  captureRuntimeRefresh = getCurrentPlayerState().then(function (result) {
    var incomingRevision = Number(result && result.projection && result.projection.revision) || 0;
    if (!result.ok || incomingRevision < Number(state.authoritativeRevision || 0)) {
      return false;
    }
    applyPlayerSave(saveFromAuthoritativeProjection(result.projection));
    if (state.scene === scene && scene && scene.name === "capture") {
      syncCaptureSceneToActiveEncounter(scene);
      updateCaptureSearchResultInline(scene);
    }
    return true;
  }).catch(function () {
    return false;
  }).finally(function () {
    captureRuntimeRefresh = null;
  });
  return captureRuntimeRefresh;
}

export function handleCaptureEncounterRuntimeInvalidation() {
  var scene = state.scene;
  // Remove the stale card before the canonical projection arrives.
  state.activeEncounter = null;
  if (scene && scene.name === "capture") {
    scene.wildPokemon = null;
    scene.encounterId = null;
    updateCaptureSearchResultInline(scene);
  }
  if (canRefreshCaptureRuntime()) {
    refreshCaptureEncounterRuntime();
  }
}

export function initializeCaptureEncounterRuntime() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }
  window.addEventListener("focus", function () {
    if (state.scene && state.scene.name === "capture") {
      refreshCaptureEncounterRuntime();
    }
  });
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden && state.scene && state.scene.name === "capture") {
      refreshCaptureEncounterRuntime();
    }
  });
}

function updateCaptureToolUsageInline(fluteKey) {
  var entry = state.fluteDaily && state.fluteDaily[fluteKey];
  var limit = FLUTE_DAILY_USE_LIMIT;
  var remaining = entry ? Math.max(0, Number(entry.remaining) || 0) : 0;
  var used = Math.max(0, limit - remaining);
  var count = root.querySelector('[data-capture-tool-count="' + fluteKey + '"]');
  var inputName = fluteKey === "whiteFlute" ? "capture-use-white-flute" : "capture-use-black-flute";
  var input = root.querySelector('[name="' + inputName + '"]');
  var buttonLabel = input ? input.closest(".capture-tool-button") : null;

  if (count) {
    count.textContent = "(" + used + "/" + limit + ")";
  }
  if (remaining <= 0 && input) {
    input.checked = false;
    input.disabled = true;
    if (fluteKey === "whiteFlute") {
      state.scene.useWhiteFlute = false;
    } else {
      state.scene.useBlackFlute = false;
    }
  }
  if (buttonLabel && remaining <= 0) {
    buttonLabel.classList.remove("is-selected");
    buttonLabel.classList.add("is-unavailable");
  }
  if (state.scene && state.scene.name === "capture") {
    rememberCaptureSearchPreferences(state.scene);
  }
}

var captureLevelHintTimer = null;

function flashCaptureLevelHint() {
  var hint = root.querySelector("[data-capture-level-hint]");
  if (!hint) {
    return;
  }
  if (captureLevelHintTimer) {
    window.clearTimeout(captureLevelHintTimer);
  }
  hint.classList.add("is-invalid");
  captureLevelHintTimer = window.setTimeout(function () {
    if (hint.isConnected) {
      hint.classList.remove("is-invalid");
    }
    captureLevelHintTimer = null;
  }, 2000);
}

export function updateCaptureTeamRuntimeInline() {
  var teamSection;
  if (!state.scene || state.scene.name !== "capture") {
    return false;
  }
  teamSection = root.querySelector(".capture-team-section");
  if (teamSection) {
    setHtml(teamSection, renderCaptureTeamSectionInner());
  }
  return Boolean(teamSection);
}

async function buildBattleScene(captureScene, rosterIndex) {
  var violation = findTeamCompositionViolation(state.team.filter(Boolean));
  if (enforceBattleRuntimeSceneLock()) {
    return;
  }
  if (violation) {
    openMessage(teamViolationLines(violation), { title: textDescriptor("ui.zoneCards.zones.title") });
    return;
  }
  syncCaptureSceneToActiveEncounter(captureScene);
  rememberCaptureSearchPreferences(captureScene);
  if (authoritativeCaptureCommandPending || !captureScene.encounterId) { return; }
  authoritativeCaptureCommandPending = true;
  var ownerId = authoritativeBattleRuntimeOwnerId();
  var pending = null;
  try {
    var client = getSupabaseClient();
    var user = client ? await currentUserId(client) : { ok: false, code: "missing_supabase_config" };
    if (!user.ok) { throw new Error("capture_user_unavailable"); }
    if (!await refreshCaptureEncounterState(captureScene)) {
      throw new Error("capture_refresh_failed");
    }
    if (state.ordinaryProgression) {
      authoritativeCaptureCommandPending = false;
      if (!openActiveProgressionScene()) {
        openMessage([messageDescriptor("capture.previousProgression")], { title: messageDescriptor("capture.title") });
      }
      return;
    }
    if (!captureScene.encounterId) {
      authoritativeCaptureCommandPending = false;
      openMessage([messageDescriptor("capture.encounterUnavailable")], { title: messageDescriptor("capture.title") });
      return;
    }
    var input = { expectedPlayerRevision: state.authoritativeRevision, runtimeOwnerId: ownerId,
      encounterId: captureScene.encounterId, activeSlot: rosterIndex };
    pending = pendingCaptureStart(user.userId, input);
    var result = await startAuthoritativeCaptureBattle(Object.assign({}, pending.input, { commandId: pending.commandId }));
    if (result.ok && result.battle) {
      await clearPendingCaptureStart(pending);
      if (result.projection && result.projection.player_state) {
        applyPlayerSave(saveFromAuthoritativeProjection(result.projection.player_state));
      }
      state.authoritativeRevision = result.playerRevision;
      broadcastCaptureEncounterRuntimeInvalidation(state.authoritativeRevision);
      authoritativeCaptureCommandPending = false;
      openAuthoritativeBattleProjection(result.battle, result.events, { captureScene: captureScene });
      return;
    }
    var serverViolation = teamViolationFromBattleResult(result);
    if (serverViolation) {
      await clearPendingCaptureStart(pending);
      authoritativeCaptureCommandPending = false;
      openMessage(teamViolationLines(serverViolation), { title: messageDescriptor("capture.title") });
      return;
    }
    if (result.uncertain || result.code === "revision_conflict" || result.code === "battle_command_rejected") {
      authoritativeCaptureCommandPending = false;
      await recoverAuthoritativeCaptureStart(result, pending, captureScene);
      return;
    }
    await clearPendingCaptureStart(pending);
    authoritativeCaptureCommandPending = false;
    openMessage([captureFailureMessage(result, "capture.startFailed")], { title: messageDescriptor("capture.title") });
  } catch (error) {
    authoritativeCaptureCommandPending = false;
    if (pending) {
      await recoverAuthoritativeCaptureStart({ uncertain: true, message: error.message }, pending, captureScene);
    } else {
      openMessage([messageDescriptor("capture.startFailed")], { title: messageDescriptor("capture.title") });
    }
  }
  return;
}

async function recoverAuthoritativeCaptureStart(startResult, pending, captureScene) {
  authoritativeCaptureCommandPending = true;
  try {
    var ownerId = pending.input.runtimeOwnerId;
    var readResult = await getAuthoritativeBattle(null, { afterSeq: 0, limit: 100,
      commandId: pending.commandId, runtimeOwnerId: ownerId });
    var battle = readResult.battle;
    authoritativeCaptureCommandPending = false;
    if (readResult.ok && battle && battle.contract_key === "capture"
      && String(battle.encounter_id || "") === pending.encounterId
      && ["active", "needs_player_switch"].indexOf(battle.status) !== -1
      && String(battle.runtime_owner_id || "") === ownerId) {
      await clearPendingCaptureStart(pending);
      state.authoritativeRevision = readResult.playerRevision;
      broadcastCaptureEncounterRuntimeInvalidation(state.authoritativeRevision);
      openAuthoritativeBattleProjection(battle, readResult.events, { captureScene: captureScene });
      return;
    }
    if (!readResult.uncertain) { await clearPendingCaptureStart(pending); }
    openMessage([captureFailureMessage(readResult, "capture.verifyStartFailed")], { title: messageDescriptor("capture.title") });
  } catch (error) {
    authoritativeCaptureCommandPending = false;
    openMessage([messageDescriptor("capture.verifyStartFailed")], { title: messageDescriptor("capture.title") });
  }
}
