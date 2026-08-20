import { registerAction } from "./action-registry.js";
import { authoritativeTrainingPreview, openBattleStartTargetPanel } from "./battle-handler.js";
import { enforceBattleRuntimeSceneLock } from "./battle-scene-lock.js";
import { openConfirm, openInlineMessage, openMessage } from "./dialog-handler.js";
import { createDebugPokemonFromPanel, isDebugUser } from "./debug-tools.js";
import { markDirty, render, setScene } from "./renderer.js";
import { root, state } from "./game-state.js";
import { createTrainingOpponentProfile, createTrainingOpponentTeam, normalizeTrainingOpponentProfile, TRAINING_ZONE_DEBUG_DIFFICULTY, trainingDifficultyConfig } from "./training-data.js";

var TEAM_MAX = Engine.TEAM_MAX;
var findTeamCompositionViolation = Engine.findTeamCompositionViolation;
import * as Engine from "../engine/index.js";
import { activateAuthoritativeTrainingBattle, authoritativeBattleRuntimeOwnerId, discardAuthoritativeTrainingBattle, getAuthoritativeBattle, prepareAuthoritativeTrainingBattle, startAuthoritativeDebugTrainingBattle } from "../api/battle.js";
import { openAuthoritativeBattleProjection } from "./battle-handler.js";
import { pokemonDisplayName, teamViolationLines } from "./entity-text.js";
import { messageDescriptor, textDescriptor } from "./i18n.js";

var DEBUG_TRAINING_START_STORAGE_KEY = "pokemon-game-revival:pending-debug-training-start";
var debugTrainingStartRecovery = null;

function mayHaveCreatedAuthoritativeTraining(result) {
  return result && ["revision_conflict", "battle_command_rejected", "activity_in_progress"].indexOf(result.code) !== -1;
}
function authUserId() {
  return String(state.auth && state.auth.user && state.auth.user.id || "");
}

function readPendingDebugTrainingStart() {
  var pending = null;
  var userId = authUserId();
  try { pending = JSON.parse(window.sessionStorage.getItem(DEBUG_TRAINING_START_STORAGE_KEY) || "null"); } catch (error) {}
  if (pending && (!userId || pending.userId !== userId)) {
    try { window.sessionStorage.removeItem(DEBUG_TRAINING_START_STORAGE_KEY); } catch (error) {}
    pending = null;
  }
  if (pending && (!/^[0-9a-f-]{36}$/i.test(String(pending.commandId || ""))
    || !/^[0-9a-f-]{36}$/i.test(String(pending.runtimeOwnerId || ""))
    || !Number.isInteger(Number(pending.expectedPlayerRevision)) || !Number.isInteger(Number(pending.activeSlot))
    || !Array.isArray(pending.opponentTeam))) {
    try { window.sessionStorage.removeItem(DEBUG_TRAINING_START_STORAGE_KEY); } catch (error) {}
    pending = null;
  }
  return pending;
}

function writePendingDebugTrainingStart(input) {
  var existing = readPendingDebugTrainingStart();
  if (existing) { return existing; }
  var pending = { userId: authUserId(), commandId: globalThis.crypto.randomUUID(),
    expectedPlayerRevision: Number(input.expectedPlayerRevision), runtimeOwnerId: String(input.runtimeOwnerId),
    activeSlot: Number(input.activeSlot), opponentTeam: input.opponentTeam };
  try { window.sessionStorage.setItem(DEBUG_TRAINING_START_STORAGE_KEY, JSON.stringify(pending)); } catch (error) {}
  return pending;
}

function clearPendingDebugTrainingStart(commandId) {
  var pending = readPendingDebugTrainingStart();
  if (!pending || pending.commandId === commandId) {
    try { window.sessionStorage.removeItem(DEBUG_TRAINING_START_STORAGE_KEY); } catch (error) {}
  }
}

registerAction("training-zone-difficulty", function(element) {
    var difficulty = element.dataset.difficulty || "";
    if (state.battleStartPending || enforceBattleRuntimeSceneLock()) {
      return;
    }
    if (state.scene && state.scene.name === "training-zone") {
      if (difficulty === TRAINING_ZONE_DEBUG_DIFFICULTY.key && !isDebugUser()) {
        return;
      }
      updateTrainingZoneDifficultyDom(difficulty);
    }
    return;

});

registerAction("training-zone-search", function(element) {
    var trainingScene = state.scene;
    if (state.battleStartPending || enforceBattleRuntimeSceneLock()) {
      return;
    }
    if (state.scene && state.scene.name === "training-zone") {
      var searchTrainingDifficulty = trainingDifficultyConfig(state.scene.trainingDifficulty) ? state.scene.trainingDifficulty : "";
      if (!searchTrainingDifficulty) {
        openMessage([messageDescriptor("training.chooseDifficulty")], { title: textDescriptor("ui.sceneTitles.trainingZone") });
        return;
      }
      var isDebug = searchTrainingDifficulty === TRAINING_ZONE_DEBUG_DIFFICULTY.key;
      if (!isDebug && !state.team.filter(Boolean).length) {
        openMessage([messageDescriptor("training.emptyTeam")], { title: textDescriptor("ui.sceneTitles.trainingZone") });
        return;
      }
      if (!isDebug) {
        if (state.scene.trainingPreparedBattle) {
          discardPreparedAuthoritativeTraining(state.scene).then(function (discarded) {
            if (discarded && state.scene === trainingScene) { prepareAuthoritativeTrainingOpponent(trainingScene, searchTrainingDifficulty); }
          });
          return;
        }
        prepareAuthoritativeTrainingOpponent(state.scene, searchTrainingDifficulty);
        return;
      } else {
        state.scene.trainingOpponent = createTrainingOpponentProfile();
        state.scene.trainingOpponentTeam = isDebug ? [] : createTrainingOpponentTeam(state.team.filter(Boolean), searchTrainingDifficulty);
      }
      render();
    }
    return;

});

registerAction("training-zone-debug-add-pokemon", function(element) {
    var opponentTeam;
    var result;
    if (!isDebugUser() || enforceBattleRuntimeSceneLock()) {
      return;
    }
    if (!state.scene || state.scene.name !== "training-zone" || state.scene.trainingDifficulty !== TRAINING_ZONE_DEBUG_DIFFICULTY.key) {
      return;
    }
    opponentTeam = Array.isArray(state.scene.trainingOpponentTeam) ? state.scene.trainingOpponentTeam : [];
    if (opponentTeam.length >= TEAM_MAX) {
      openInlineMessage([messageDescriptor("training.opponentTeamFull")], { title: textDescriptor("ui.sceneTitles.trainingZone") });
      return;
    }
    result = createDebugPokemonFromPanel(element ? element.closest(".trainer-debug-pokemon-panel") : null);
    if (!result.ok) {
      openInlineMessage(result.errors || [messageDescriptor("training.invalidPokemon")], { title: textDescriptor("ui.sceneTitles.trainingZone") });
      return;
    }
    opponentTeam.push(result.pokemon);
    state.scene.trainingOpponentTeam = opponentTeam;
    render();
    return;

});

registerAction("training-zone-debug-remove-pokemon", function(element) {
    var opponentTeam;
    var index;
    if (!isDebugUser() || enforceBattleRuntimeSceneLock()) {
      return;
    }
    if (!state.scene || state.scene.name !== "training-zone" || state.scene.trainingDifficulty !== TRAINING_ZONE_DEBUG_DIFFICULTY.key) {
      return;
    }
    opponentTeam = Array.isArray(state.scene.trainingOpponentTeam) ? state.scene.trainingOpponentTeam : [];
    index = Number(element.dataset.index);
    if (!Number.isInteger(index) || index < 0 || index >= opponentTeam.length) {
      return;
    }
    opponentTeam.splice(index, 1);
    state.scene.trainingOpponentTeam = opponentTeam;
    render();
    return;

});

registerAction("training-zone-start", function(element) {
    var config;
    var playerPokemon;
    var opponentTeam;
    var violation;
    if (state.battleStartPending || enforceBattleRuntimeSceneLock()) {
      return;
    }
    if (state.scene && state.scene.name === "training-zone") {
      config = trainingDifficultyConfig(state.scene.trainingDifficulty || "");
      playerPokemon = state.team.filter(Boolean);
      opponentTeam = Array.isArray(state.scene.trainingOpponentTeam) ? state.scene.trainingOpponentTeam : [];
      if (!config) {
        openMessage([messageDescriptor("training.chooseDifficulty")], { title: textDescriptor("ui.sceneTitles.trainingZone") });
        return;
      }
      if (config.debug && !isDebugUser()) {
        return;
      }
      if (!playerPokemon.length) {
        openMessage([messageDescriptor("training.emptyTeam")], { title: textDescriptor("ui.sceneTitles.trainingZone") });
        return;
      }
      violation = findTeamCompositionViolation(playerPokemon);
      if (violation) {
        openMessage(teamViolationLines(violation), { title: textDescriptor("ui.sceneTitles.trainingZone") });
        return;
      }
      if (config.debug ? !opponentTeam.length : !state.scene.trainingPreparedBattle) {
        openMessage([messageDescriptor("training.findOpponentFirst")], { title: textDescriptor("ui.sceneTitles.trainingZone") });
        return;
      }
      var authoritativeEntries = state.team.map(function (pokemon, slot) { return pokemon ? { pokemon: pokemon, slot: slot } : null; }).filter(Boolean);
      if (authoritativeEntries.length > 1) {
        openBattleStartTargetPanel(element, authoritativeEntries.map(function (entry) {
           return { name: pokemonDisplayName(entry.pokemon), index: entry.slot };
        }), function (activeSlot) { startAuthoritativeTraining(state.scene, activeSlot, config.debug); });
      } else {
        startAuthoritativeTraining(state.scene, authoritativeEntries[0].slot, config.debug);
      }
      return;
    }
    return;

});

function debugOpponentSemantic(team) {
  return team.map(function (pokemon) {
    return { speciesKey: String(pokemon.speciesKey), level: Number(pokemon.level), maxHp: Number(pokemon.maxHp),
      heldItemIndex: Number(pokemon.heldItemIndex) || 0, moves: (pokemon.moves || []).map(function (move) {
        return { moveIndex: Number(move.index), power: Number(move.power) || 0, stats: Number(move.stats) || 0 };
      }) };
  });
}

function startAuthoritativeTraining(trainingScene, activeSlot, debug) {
  var input;
  if (state.battleStartPending) { return; }
  state.battleStartPending = true;
  render();
  input = {
    expectedPlayerRevision: state.authoritativeRevision,
    runtimeOwnerId: authoritativeBattleRuntimeOwnerId(), activeSlot: activeSlot,
    opponentTeam: debugOpponentSemantic(trainingScene.trainingOpponentTeam || [])
  };
  if (!debug) {
    input.battleId = String(trainingScene.trainingPreparedBattle && trainingScene.trainingPreparedBattle.battleId || "");
    input.expectedBattleVersion = Number(trainingScene.trainingPreparedBattle && trainingScene.trainingPreparedBattle.battleVersion) || 0;
  }
  if (debug) { input = writePendingDebugTrainingStart(input); }
  (debug ? startAuthoritativeDebugTrainingBattle : activateAuthoritativeTrainingBattle)(input).then(function (result) {
    state.battleStartPending = false;
    if (!result.ok || !result.battle) {
      if (debug && !result.uncertain) { clearPendingDebugTrainingStart(input.commandId); }
      if (mayHaveCreatedAuthoritativeTraining(result)) {
        recoverAuthoritativeTrainingStart(result, trainingScene, { commandId: debug ? input.commandId : "" });
        return;
      }
      openMessage([messageDescriptor("training.startFailed")], { title: textDescriptor("ui.sceneTitles.trainingZone") });
      render();
      return;
    }
    if (debug) { clearPendingDebugTrainingStart(input.commandId); }
    state.authoritativeRevision = result.playerRevision;
    trainingScene.trainingAuthoritativeReady = false;
    trainingScene.trainingOpponentTeam = [];
    trainingScene.trainingOpponent = null;
    trainingScene.trainingPreparedBattle = null;
    openAuthoritativeBattleProjection(result.battle, result.events, { history: "push" });
  }).catch(function (error) {
    state.battleStartPending = false;
    openMessage([messageDescriptor("training.startFailed")], { title: textDescriptor("ui.sceneTitles.trainingZone") });
    render();
  });
}

function prepareAuthoritativeTrainingOpponent(trainingScene, difficulty) {
  var previewActiveSlot = state.team.findIndex(function (pokemon) { return Boolean(pokemon); });
  if (previewActiveSlot < 0) {
    openMessage([messageDescriptor("training.emptyTeam")], { title: textDescriptor("ui.sceneTitles.trainingZone") });
    return;
  }
  state.battleStartPending = true;
  render();
  prepareAuthoritativeTrainingBattle({
    expectedPlayerRevision: state.authoritativeRevision,
    runtimeOwnerId: authoritativeBattleRuntimeOwnerId(),
    difficulty: difficulty,
    previewActiveSlot: previewActiveSlot
  }).then(function (result) {
    var preview;
    if (!result.ok || !result.battle) {
      if (mayHaveCreatedAuthoritativeTraining(result)) {
        return recoverAuthoritativeTrainingStart(result, trainingScene);
      }
      openMessage([messageDescriptor("training.searchFailed")], { title: textDescriptor("ui.sceneTitles.trainingZone") });
      return;
    }
    if (state.scene !== trainingScene) {
      return;
    }
    preview = authoritativeTrainingPreview(result.battle);
    trainingScene.trainingOpponent = preview.opponent;
    trainingScene.trainingOpponentTeam = preview.team;
    trainingScene.trainingPreparedBattle = {
      battleId: String(result.battle.battle_id || ""),
      battleVersion: Number(result.battle.battle_version) || 0
    };
    trainingScene.trainingAuthoritativeReady = true;
    state.authoritativeRevision = result.playerRevision;
  }).catch(function (error) {
    openMessage([messageDescriptor("training.searchFailed")], { title: textDescriptor("ui.sceneTitles.trainingZone") });
  }).finally(function () {
    state.battleStartPending = false;
    if (state.scene === trainingScene) { render(); }
  });
}

export function discardPreparedAuthoritativeTraining(trainingScene) {
  var prepared = trainingScene && trainingScene.trainingPreparedBattle;
  if (!prepared || state.battleStartPending) { return Promise.resolve(false); }
  state.battleStartPending = true;
  render();
  return discardAuthoritativeTrainingBattle({
    expectedPlayerRevision: state.authoritativeRevision,
    battleId: String(prepared.battleId || ""),
    expectedBattleVersion: Number(prepared.battleVersion) || 0,
    runtimeOwnerId: authoritativeBattleRuntimeOwnerId()
  }).then(function (result) {
    if (!result.ok) {
      openMessage([messageDescriptor("training.replaceFailed")], { title: textDescriptor("ui.sceneTitles.trainingZone") });
      return false;
    }
    state.authoritativeRevision = result.playerRevision;
    trainingScene.trainingAuthoritativeReady = false;
    trainingScene.trainingOpponent = null;
    trainingScene.trainingOpponentTeam = [];
    trainingScene.trainingPreparedBattle = null;
    return true;
  }).catch(function (error) {
    openMessage([messageDescriptor("training.replaceFailed")], { title: textDescriptor("ui.sceneTitles.trainingZone") });
    return false;
  }).finally(function () {
    state.battleStartPending = false;
    if (state.scene === trainingScene) { render(); }
  });
}

function recoverAuthoritativeTrainingStart(startResult, trainingScene, options) {
  options = options || {};
  var ownerId = authoritativeBattleRuntimeOwnerId();
  state.battleStartPending = true;
  render();
  return getAuthoritativeBattle(null, {
    afterSeq: 0,
    limit: 100,
    commandId: globalThis.crypto.randomUUID(),
    runtimeOwnerId: ownerId
  }).then(function (readResult) {
    var battle = readResult.battle;
    if (readResult.ok && battle && ["training", "debug_training"].indexOf(battle.contract_key) !== -1
      && ["active", "needs_player_switch"].indexOf(battle.status) !== -1
      && String(battle.runtime_owner_id || "") === ownerId) {
      state.battleStartPending = false;
      if (options.commandId) { clearPendingDebugTrainingStart(options.commandId); }
      state.authoritativeRevision = readResult.playerRevision;
      trainingScene.trainingAuthoritativeReady = false;
      openAuthoritativeBattleProjection(battle, readResult.events, { history: "push" });
      return true;
    }
    state.battleStartPending = false;
    if (!options.silent) {
      openMessage([messageDescriptor("training.stateChanged")], { title: textDescriptor("ui.sceneTitles.trainingZone") });
    }
    render();
    return false;
  }).catch(function () {
    state.battleStartPending = false;
    if (!options.silent) {
      openMessage([messageDescriptor("training.recoverFailed")], { title: textDescriptor("ui.sceneTitles.trainingZone") });
    }
    render();
    return false;
  });
}

export function recoverPendingAuthoritativeDebugTrainingStart(options) {
  options = options || {};
  if (debugTrainingStartRecovery) { return debugTrainingStartRecovery; }
  var pending = readPendingDebugTrainingStart();
  if (!pending || false) { return Promise.resolve(false); }
  state.battleStartPending = true;
  if (state.scene && state.scene.name === "training-zone") { render(); }
  debugTrainingStartRecovery = startAuthoritativeDebugTrainingBattle(pending).then(function (result) {
    if (result.ok && result.battle) {
      clearPendingDebugTrainingStart(pending.commandId);
      state.authoritativeRevision = result.playerRevision;
      state.battleStartPending = false;
      openAuthoritativeBattleProjection(result.battle, result.events, { history: "replace" });
      return true;
    }
    if (!result.uncertain) { clearPendingDebugTrainingStart(pending.commandId); }
    var scene = state.scene && state.scene.name === "training-zone" ? state.scene
      : { name: "training-zone", trainingDifficulty: TRAINING_ZONE_DEBUG_DIFFICULTY.key };
    return recoverAuthoritativeTrainingStart(result, scene, { commandId: pending.commandId, silent: options.silent });
  }).finally(function () {
    if (!state.scene || state.scene.name !== "battle") {
      state.battleStartPending = false;
      render();
    }
    debugTrainingStartRecovery = null;
  });
  return debugTrainingStartRecovery;
}

export function recoverPreparedAuthoritativeTraining(options) {
  options = options || {};
  return getAuthoritativeBattle(null, {
    afterSeq: 0,
    limit: 100,
    commandId: globalThis.crypto.randomUUID(),
    runtimeOwnerId: authoritativeBattleRuntimeOwnerId()
  }).then(function (result) {
    var battle = result.battle;
    var preview;
    if (!result.ok || !battle || battle.contract_key !== "training" || battle.status !== "prepared") {
      return false;
    }
    preview = authoritativeTrainingPreview(battle);
    state.authoritativeRevision = result.playerRevision;
    setScene({
      name: "training-zone",
      trainingDifficulty: String(battle.training_difficulty || ""),
      trainingOpponent: preview.opponent,
      trainingOpponentTeam: preview.team,
      trainingPreparedBattle: {
        battleId: String(battle.battle_id || ""),
        battleVersion: Number(battle.battle_version) || 0
      },
      trainingAuthoritativeReady: true
    }, { history: options.history || "replace" });
    return true;
  }).catch(function () {
    return false;
  });
}

function trainingSceneFrom(scene) {
  return {
    name: "training-zone",
    trainingDifficulty: scene && scene.trainingDifficulty ? scene.trainingDifficulty : "",
    trainingOpponentTeam: scene && Array.isArray(scene.trainingOpponentTeam) ? scene.trainingOpponentTeam.slice() : [],
    trainingOpponent: scene && scene.trainingOpponent ? normalizeTrainingOpponentProfile(scene.trainingOpponent) : null,
    trainingPreparedBattle: null
  };
}

function updateTrainingZoneDifficultyDom(difficultyKey) {
  var selectedTrainingDifficulty = trainingDifficultyConfig(difficultyKey) ? difficultyKey : "";
  var searchButton;
  var keepsPreparedOpponent;
  if (!state.scene || state.scene.name !== "training-zone") {
    return;
  }
  keepsPreparedOpponent = Boolean(state.scene.trainingPreparedBattle);
  state.scene.trainingDifficulty = selectedTrainingDifficulty;
  if (!keepsPreparedOpponent) {
    state.scene.trainingAuthoritativeReady = false;
    state.scene.trainingOpponent = null;
    state.scene.trainingOpponentTeam = [];
    state.scene.trainingPreparedBattle = null;
  }
  root.querySelectorAll('[data-action="training-zone-difficulty"]').forEach(function (btn) {
    var isSelected = btn.dataset.difficulty === selectedTrainingDifficulty;
    btn.classList.toggle("is-selected", isSelected);
    btn.setAttribute("aria-pressed", isSelected ? "true" : "false");
  });
  searchButton = root.querySelector('[data-action="training-zone-search"]');
  if (searchButton) {
    searchButton.disabled = !selectedTrainingDifficulty;
  }
  var battleButton = root.querySelector('[data-action="training-zone-start"]');
  if (battleButton) { battleButton.disabled = true; }
  render();
}
