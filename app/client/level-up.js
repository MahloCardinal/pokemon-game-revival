import { GDR_DATA as DATA, clampToLimits } from "../data/index.js";
import * as Engine from "../engine/index.js";
import { registerPokedexPokemon, root, state } from "./game-state.js";
import { markDirty, render, setScene } from "./renderer.js";
import { markTeamRuntimeStateChanged, replaceTeamRuntimeState } from "./runtime-state.js";
import { openMessage } from "./dialog-handler.js";
import { queueGlobalActivityEvent } from "./activity-feed-runtime.js";
import { createMissionEventKey, recordMissionEvent } from "./mission-runtime.js";

import { levelLimitForBadges } from "../data/progression.js";

var MAX_LEVEL = 100;
var HP_GAIN_PER_LEVEL = 3;
var MOVE_GAIN_PER_LEVEL = 2;
var progressionQueue = [];
var activeSession = null;

function speciesDataForPokemon(pokemon) {
  return Engine.findSpecies(pokemon.speciesKey);
}

function speciesDisplayName(speciesIdentifier) {
  var entry = Engine.findSpecies(speciesIdentifier);
  return entry ? entry.name || entry.speciesKey : speciesIdentifier;
}

function progressionValue(table, level) {
  var value = table[level];
  if (value !== undefined) {
    return value;
  }
  return table[60] || 0;
}

function moveDefsAtLevel(pokemon, level) {
  var data = speciesDataForPokemon(pokemon);
  var knownIndexes = {};
  if (!data || !data.movesByLevel) {
    return [];
  }
  pokemon.moves.forEach(function (move) {
    knownIndexes[move.index] = true;
  });
  return (data.movesByLevel[level] || []).filter(function (moveDef) {
    return moveDef && !knownIndexes[moveDef.index];
  });
}

function strongestKnownValue(moves, key) {
  return moves.reduce(function (highest, move) {
    var value = Number(move[key]) || 0;
    return value > highest ? value : highest;
  }, 0);
}

function createLearnedMove(pokemon, moveDef) {
  var strongestPower = strongestKnownValue(pokemon.moves, "power");
  var strongestStats = strongestKnownValue(pokemon.moves, "stats");
  var power = strongestPower > 0
    ? strongestPower + Engine.randInt(2, 3)
    : progressionValue(DATA.powerByLevel, pokemon.level);
  var stats = strongestStats > 0
    ? strongestStats + Engine.randInt(2, 3)
    : progressionValue(DATA.statsByLevel, pokemon.level);

  return Engine.createMove(moveDef, {
    power: power,
    stats: stats
  });
}

function levelEvolutionFor(pokemon, level, refusedBySpecies) {
  var speciesKey = pokemon.speciesKey;
  var data = speciesDataForPokemon(pokemon);
  var candidates = data && data.evolution && Array.isArray(data.evolution.to) ? data.evolution.to : [];
  if (refusedBySpecies[speciesKey]) {
    return null;
  }
  var levelCandidates = candidates.filter(function (entry) {
    return entry
      && entry.species
      && entry.trigger
      && entry.trigger.kind === "level"
      && Number(entry.trigger.level) <= level;
  });
  if (levelCandidates.length === 0) {
    return null;
  }
  if (levelCandidates.length === 1) {
    return levelCandidates[0];
  }
  var pick = Math.floor(Math.random() * levelCandidates.length);
  return levelCandidates[pick];
}

function syncCombatant(session) {
  if (!session.combatant) {
    return;
  }
  session.combatant.level = session.pokemon.level;
  session.combatant.type = session.pokemon.type.slice();
  if (typeof session.combatant.updateMovesState === "function") {
    session.combatant.updateMovesState();
  }
}

function clonePokemon(pokemon) {
  return Engine.Pokemon.fromJSON(pokemon.toJSON());
}

export function giveLevelsToPokemon(pokemon, levels, levelLimit) {
  levels = Math.max(0, Math.floor(Number(levels) || 0));
  levelLimit = Number.isFinite(levelLimit) ? Math.floor(levelLimit) : MAX_LEVEL;
  if (!pokemon || levels <= 0 || pokemon.level >= levelLimit) {
    return 0;
  }
  var targetLevel = Math.min(pokemon.level + levels, levelLimit, MAX_LEVEL);
  var actualLevels = targetLevel - pokemon.level;
  if (actualLevels <= 0) {
    return 0;
  }
  pokemon.level = targetLevel;
  pokemon.maxHp += HP_GAIN_PER_LEVEL * actualLevels;
  if (pokemon.moves && pokemon.moves.length) {
    pokemon.moves.forEach(function (move) {
      move.power = (Number(move.power) || 0) + MOVE_GAIN_PER_LEVEL * actualLevels;
      move.stats = (Number(move.stats) || 0) + MOVE_GAIN_PER_LEVEL * actualLevels;
    });
  }
  clampToLimits(pokemon);
  return actualLevels;
}

function canApplyLevelUp(session) {
  var pokemon = session.pokemon;
  var expCap = Number(pokemon.expCap) || 0;
  if (session.levelsToApply > 0) {
    return pokemon.level < levelLimitForSession(session) && session.levelsToApply > 0;
  }
  return pokemon.level < levelLimitForSession(session) && expCap > 0 && pokemon.expCurrent >= expCap;
}

function levelLimitForSession(session) {
  var limit = levelLimitForBadges(state.trainerInfo[2]);
  if (session && Number.isFinite(Number(session.levelLimit))) {
    limit = Number(session.levelLimit);
  }
  return Math.max(1, Math.min(MAX_LEVEL, Math.floor(limit) || MAX_LEVEL));
}

function levelLimitWarningMessage(pokemon, limit) {
  return pokemon.name + " ha raggiunto il livello massimo gestibile con le Medaglie attuali: Lv " + limit + ".";
}

function markLevelLimitReached(session) {
  var limit = levelLimitForSession(session);
  if (limit >= MAX_LEVEL || session.levelLimitWarningShown) {
    return;
  }
  session.pokemon.expCurrent = 0;
  session.levelLimitWarningPending = true;
}

function currentLevelHasFollowup(session) {
  return session.moveQueue.length || Boolean(levelEvolutionFor(session.pokemon, session.currentLevel, session.refusedBySpecies));
}

function applyLevelUp(session) {
  var pokemon = session.pokemon;
  var expCap = Number(pokemon.expCap) || 0;
  var levelLimit = levelLimitForSession(session);
  var beforePokemon;
  if (!canApplyLevelUp(session)) {
    return false;
  }

  beforePokemon = clonePokemon(pokemon);
  if (!session.levelUpRunBefore) {
    session.levelUpRunBefore = beforePokemon;
  }
  session.levelUpBefore = session.levelUpRunBefore;
  if (session.levelsToApply > 0) {
    session.levelsToApply -= 1;
  } else {
    pokemon.expCurrent -= expCap;
  }
  pokemon.level += 1;
  pokemon.maxHp += HP_GAIN_PER_LEVEL;
  pokemon.moves.forEach(function (move) {
    move.power = (Number(move.power) || 0) + MOVE_GAIN_PER_LEVEL;
    move.stats = (Number(move.stats) || 0) + MOVE_GAIN_PER_LEVEL;
  });
  clampToLimits(pokemon);
  if (session.combatant && session.combatant.hp > 0) {
    session.combatant.hp += HP_GAIN_PER_LEVEL;
  }
  if (pokemon.level >= levelLimit) {
    pokemon.level = levelLimit;
    pokemon.expCurrent = 0;
    markLevelLimitReached(session);
  }
  session.scene.manager.log.push(pokemon.name + " sale al Livello " + pokemon.level + "!");
  if (session.resultLines && session.resultLines.length > 1) {
    if (session.levelsToApply > 0 || session.levelBased) {
      session.resultLines[1] = pokemon.name + " ha guadagnato " + session.totalLevelsGained + " livelli!";
    } else {
      session.resultLines[1] = pokemon.name + " ha guadagnato " + session.gainedExp + " punti esperienza ed è salito di livello!";
    }
  }
  syncCombatant(session);
  markTeamRuntimeStateChanged();
  session.levelUpAfter = clonePokemon(pokemon);
  session.currentLevel = pokemon.level;
  session.phase = "level-up";
  session.moveQueue = moveDefsAtLevel(pokemon, pokemon.level);
  recordMissionEvent("pokemon_level_up", { speciesKey: String(pokemon.speciesKey || "") }, {
    eventKey: createMissionEventKey("pokemon_level_up", [session.eventSeq || "local", pokemon.speciesKey, pokemon.level])
  });
  return true;
}

function applyEvolution(session, evolution) {
  var pokemon = session.pokemon;
  var targetData = Engine.findSpecies(evolution.species);
  var oldName = pokemon.name;
  var sourceSpeciesKey = String(pokemon.speciesKey || "");
  if (!targetData) {
    return;
  }
  pokemon.speciesKey = targetData.speciesKey;
  pokemon.name = targetData.name || targetData.speciesKey;
  pokemon.ndex = targetData.dexNumber;
  pokemon.type = targetData.type.slice();
  pokemon.expCap = targetData.exp;
  registerPokedexPokemon(pokemon);
  queueGlobalActivityEvent({ eventType: "evolution", subjectName: oldName, secondarySubjectName: pokemon.name });
  session.scene.manager.log.push(oldName + " si evolve in " + pokemon.name + "!");
  syncCombatant(session);
  markTeamRuntimeStateChanged();
  session.moveQueue = moveDefsAtLevel(pokemon, session.currentLevel);
  session.phase = "post-evolution-moves";
  session.evolutionResult = {
    oldName: oldName,
    newName: pokemon.name
  };
  recordMissionEvent("pokemon_evolved", { speciesKey: sourceSpeciesKey }, {
    eventKey: createMissionEventKey("pokemon_evolved", [session.eventSeq || "local", sourceSpeciesKey, pokemon.speciesKey])
  });
}

function finishProgression() {
  var completedSession = activeSession;
  var onComplete = completedSession ? completedSession.onComplete : null;
  activeSession = null;

  function continueProgression() {
    if (progressionQueue.length) {
      activeSession = progressionQueue.shift();
      openNextProgressionStep();
      return;
    }

    markDirty();
    if (typeof onComplete === "function") {
      onComplete();
    } else {
      render({ scrollBattleLogToBottom: true });
    }
  }

  if (completedSession && typeof completedSession.onSessionComplete === "function") {
    completedSession.onSessionComplete(completedSession).then(function (result) {
      if (result && result.ok === false) {
        if (result.locked || result.reason === "locked") {
          setScene({ name: "home" }, { history: "replace" });
          openMessage(["La battaglia è stata ripresa in un'altra scheda."], {
            title: "Battaglia",
            closeLabel: "Ok",
            closeClass: "button-primary"
          });
          return;
        }
        state.saveStatus = { state: "error", message: result.message || "Errore durante il salvataggio dell'esperienza." };
        render({ scrollBattleLogToBottom: true });
        return;
      }
      continueProgression();
    }).catch(function (error) {
      state.saveStatus = { state: "error", message: error.message || "Errore durante il salvataggio dell'esperienza." };
      render({ scrollBattleLogToBottom: true });
    });
    return;
  }

  continueProgression();
}

function resultLinesForDialog(session) {
  if (session.resultLinesShown) {
    return [];
  }
  session.resultLinesShown = true;
  return session.resultLines;
}

function openMoveLearnDialog(session, moveDef) {
  var move = createLearnedMove(session.pokemon, moveDef);
  session.pendingMove = move;
  if (session.pokemon.moves.length < 4) {
    session.pokemon.moves.push(move);
    clampToLimits(session.pokemon);
    session.scene.manager.log.push(session.pokemon.name + " impara " + move.name + "!");
    syncCombatant(session);
    markTeamRuntimeStateChanged();
    session.pendingMove = null;
    state.dialog = {
      type: "move-learn-result",
      pokemonName: session.pokemon.name,
      moveName: move.name,
      message: session.pokemon.name + " ha imparato " + move.name + "!",
      pokemon: session.pokemon
    };
    render({ scrollBattleLogToBottom: true });
    return;
  }
  state.dialog = {
    type: "move-learn",
    pokemonName: session.pokemon.name,
    move: move,
    pokemon: session.pokemon,
    moves: session.pokemon.moves.slice()
  };
  render({ scrollBattleLogToBottom: true });
}

function openEvolutionDialog(session, evolution) {
  var targetName = speciesDisplayName(evolution.species);
  session.pendingEvolution = evolution;
  state.dialog = {
    type: "evolution",
    pokemonName: session.pokemon.name,
    resultLines: resultLinesForDialog(session),
    targetName: targetName,
    targetPokemon: {
      speciesKey: evolution.species,
      name: targetName,
      gender: session.pokemon.gender,
      isShiny: session.pokemon.isShiny
    }
  };
  render({ scrollBattleLogToBottom: true });
}

function openLevelUpDialog(session) {
  state.dialog = {
    type: "level-up",
    pokemonName: session.pokemon.name,
    resultLines: resultLinesForDialog(session),
    beforePokemon: session.levelUpBefore,
    afterPokemon: session.levelUpAfter
  };
  render({ scrollBattleLogToBottom: true });
}

function openExperienceResultDialog(session) {
  var lines = resultLinesForDialog(session);
  if (!lines.length) {
    finishProgression();
    return;
  }
  state.dialog = {
    type: "message",
    title: "Esperienza",
    lines: lines,
    closeLabel: "Ok",
    closeClass: "button-primary",
    onClose: function () {
      state.dialog = null;
      finishProgression();
    },
    requireButtonClose: true
  };
  render({ scrollBattleLogToBottom: true });
}

function openLevelLimitWarning(session) {
  var message = levelLimitWarningMessage(session.pokemon, levelLimitForSession(session));
  var lines = resultLinesForDialog(session).concat([message]);
  session.levelLimitWarningPending = false;
  session.levelLimitWarningShown = true;
  session.scene.manager.log.push(message);
  state.dialog = {
    type: "message",
    title: "Livello massimo raggiunto",
    lines: lines,
    closeLabel: "Ok",
    closeClass: "button-primary",
    onClose: function () {
      state.dialog = null;
      openNextProgressionStep();
    },
    requireButtonClose: true
  };
  render({ scrollBattleLogToBottom: true });
}

function completeCurrentLevel(session) {
  session.currentLevel = null;
  session.phase = null;
  session.moveQueue = [];
  session.pendingEvolution = null;
  session.pendingMove = null;
}

function openNextProgressionStep() {
  var session = activeSession;
  var evolution;

  if (!session) {
    finishProgression();
    return;
  }

  if (session.currentLevel !== null && session.phase === "level-up") {
    if (!currentLevelHasFollowup(session) && canApplyLevelUp(session) && applyLevelUp(session)) {
      openNextProgressionStep();
      return;
    }
    openLevelUpDialog(session);
    return;
  }

  if (session.moveQueue.length) {
    openMoveLearnDialog(session, session.moveQueue.shift());
    return;
  }

  if (session.currentLevel !== null && session.phase === "moves") {
    evolution = levelEvolutionFor(session.pokemon, session.currentLevel, session.refusedBySpecies);
    if (evolution) {
      session.phase = "evolution";
      openEvolutionDialog(session, evolution);
      return;
    }
    completeCurrentLevel(session);
    openNextProgressionStep();
    return;
  }

  if (session.currentLevel !== null && session.phase === "post-evolution-moves") {
    completeCurrentLevel(session);
    openNextProgressionStep();
    return;
  }

  if (session.currentLevel !== null && session.phase === "evolution") {
    completeCurrentLevel(session);
    openNextProgressionStep();
    return;
  }

  if (session.levelLimitWarningPending) {
    openLevelLimitWarning(session);
    return;
  }

  if (applyLevelUp(session)) {
    openNextProgressionStep();
    return;
  }

  openExperienceResultDialog(session);
}

function expGainLine(pokemon, gainedExp) {
  return pokemon
    ? pokemon.name + " ha guadagnato " + gainedExp + " punti esperienza"
    : "Esperienza non assegnabile.";
}

function queueExperienceAmount(scene, combatant, eventData, onComplete) {
  var pokemon = combatant && combatant.pokemon;
  var gainedExp = Math.max(0, Math.floor(Number(eventData && eventData.value) || 0));
  var levelLimit = levelLimitForBadges(state.trainerInfo[2]);
  var atBadgeLevelLimit = pokemon && levelLimit < MAX_LEVEL && pokemon.level >= levelLimit;
  var resultLines = [
    expGainLine(pokemon, gainedExp)
  ];
  if (!pokemon) {
    return false;
  }
  if (atBadgeLevelLimit) {
    pokemon.expCurrent = 0;
    markTeamRuntimeStateChanged();
    resultLines[0] = pokemon.name + " non ottiene altra esperienza.";
    progressionQueue.push({
      scene: scene,
      pokemon: pokemon,
      combatant: combatant,
      onComplete: onComplete,
      onSessionComplete: eventData && eventData.seq ? completePersistedExpSession : null,
      eventSeq: eventData ? eventData.seq : null,
      currentLevel: null,
      phase: null,
      moveQueue: [],
      pendingMove: null,
      pendingEvolution: null,
      levelUpBefore: null,
      levelUpAfter: null,
      levelUpRunBefore: null,
      refusedBySpecies: {},
      gainedExp: 0,
      levelLimit: levelLimit,
      levelLimitWarningPending: true,
      levelLimitWarningShown: false,
      resultLines: resultLines,
      resultLinesShown: false
    });
    return true;
  }
  if (pokemon.level >= MAX_LEVEL) {
    pokemon.expCurrent = 0;
    markTeamRuntimeStateChanged();
    scene.manager.log.push(pokemon.name + " è già al Livello 100 e non ottiene altra esperienza.");
    progressionQueue.push({
      scene: scene,
      pokemon: pokemon,
      combatant: combatant,
      onComplete: onComplete,
      onSessionComplete: eventData && eventData.seq ? completePersistedExpSession : null,
      eventSeq: eventData ? eventData.seq : null,
      currentLevel: null,
      phase: null,
      moveQueue: [],
      pendingMove: null,
      pendingEvolution: null,
      levelUpBefore: null,
      levelUpAfter: null,
      levelUpRunBefore: null,
      refusedBySpecies: {},
      gainedExp: 0,
      levelLimit: levelLimit,
      levelLimitWarningPending: false,
      levelLimitWarningShown: false,
      resultLines: [pokemon.name + " è già al Livello 100 e non ottiene altra esperienza."],
      resultLinesShown: false
    });
    return true;
  }
  pokemon.expCurrent += gainedExp;
  markTeamRuntimeStateChanged();
  scene.manager.log.push(pokemon.name + " ottiene " + gainedExp + " punti esperienza.");
  progressionQueue.push({
    scene: scene,
    pokemon: pokemon,
    combatant: combatant,
    onComplete: onComplete,
    onSessionComplete: eventData && eventData.seq ? completePersistedExpSession : null,
    eventSeq: eventData ? eventData.seq : null,
    currentLevel: null,
    phase: null,
    moveQueue: [],
    pendingMove: null,
    pendingEvolution: null,
    levelUpBefore: null,
    levelUpAfter: null,
    levelUpRunBefore: null,
    refusedBySpecies: {},
    gainedExp: gainedExp,
    levelLimit: levelLimit,
    levelLimitWarningPending: false,
    levelLimitWarningShown: false,
    resultLines: resultLines,
    resultLinesShown: false
  });
  return true;
}

function queueLevelAmount(scene, combatant, eventData, onComplete) {
  var pokemon = combatant && combatant.pokemon;
  var levels = Math.max(0, Math.floor(Number(eventData && eventData.value) || 0));
  var levelText = levels === 1 ? " livello" : " livelli";
  var levelLimit = levelLimitForBadges(state.trainerInfo[2]);
  var atBadgeLevelLimit = pokemon && levelLimit < MAX_LEVEL && pokemon.level >= levelLimit;
  var resultLines = [
    pokemon ? pokemon.name + " ha guadagnato " + levels + levelText : "Esperienza non assegnabile."
  ];
  if (!pokemon) {
    return false;
  }
  if (atBadgeLevelLimit) {
    markTeamRuntimeStateChanged();
    resultLines[0] = pokemon.name + " non ottiene altri livelli.";
    progressionQueue.push({
      scene: scene,
      pokemon: pokemon,
      combatant: combatant,
      onComplete: onComplete,
      onSessionComplete: eventData && eventData.seq ? completePersistedExpSession : null,
      eventSeq: eventData ? eventData.seq : null,
      currentLevel: null,
      phase: null,
      moveQueue: [],
      pendingMove: null,
      pendingEvolution: null,
      levelUpBefore: null,
      levelUpAfter: null,
      levelUpRunBefore: null,
      refusedBySpecies: {},
      gainedExp: 0,
      levelsToApply: 0,
      levelBased: true,
      totalLevelsGained: 0,
      levelLimit: levelLimit,
      levelLimitWarningPending: true,
      levelLimitWarningShown: false,
      resultLines: resultLines,
      resultLinesShown: false
    });
    return true;
  }
  if (pokemon.level >= MAX_LEVEL) {
    markTeamRuntimeStateChanged();
    scene.manager.log.push(pokemon.name + " è già al Livello 100 e non ottiene altri livelli.");
    progressionQueue.push({
      scene: scene,
      pokemon: pokemon,
      combatant: combatant,
      onComplete: onComplete,
      onSessionComplete: eventData && eventData.seq ? completePersistedExpSession : null,
      eventSeq: eventData ? eventData.seq : null,
      currentLevel: null,
      phase: null,
      moveQueue: [],
      pendingMove: null,
      pendingEvolution: null,
      levelUpBefore: null,
      levelUpAfter: null,
      levelUpRunBefore: null,
      refusedBySpecies: {},
      gainedExp: 0,
      levelsToApply: 0,
      levelBased: true,
      totalLevelsGained: 0,
      levelLimit: levelLimit,
      levelLimitWarningPending: false,
      levelLimitWarningShown: false,
      resultLines: [pokemon.name + " è già al Livello 100 e non ottiene altri livelli."],
      resultLinesShown: false
    });
    return true;
  }
  markTeamRuntimeStateChanged();
  scene.manager.log.push(pokemon.name + " sale di " + levels + levelText + "!");
  progressionQueue.push({
    scene: scene,
    pokemon: pokemon,
    combatant: combatant,
    onComplete: onComplete,
    onSessionComplete: eventData && eventData.seq ? completePersistedExpSession : null,
    eventSeq: eventData ? eventData.seq : null,
    currentLevel: null,
    phase: null,
    moveQueue: [],
    pendingMove: null,
    pendingEvolution: null,
    levelUpBefore: null,
    levelUpAfter: null,
    levelUpRunBefore: null,
    refusedBySpecies: {},
    gainedExp: 0,
    levelsToApply: levels,
    levelBased: true,
    totalLevelsGained: levels,
    levelLimit: levelLimit,
    levelLimitWarningPending: false,
    levelLimitWarningShown: false,
    resultLines: resultLines,
    resultLinesShown: false
  });
  return true;
}

function completePersistedExpSession(session) {
  var playerTeam = session.scene && session.scene.playerTeam ? session.scene.playerTeam.pokemonList : state.team;
  replaceTeamRuntimeState(playerTeam);
  return Promise.resolve({ ok: true });
}

export function startPostBattleExpProgression(scene, events, onComplete) {
  var queued = false;
  events = Array.isArray(events) ? events : [];
  events.forEach(function (event) {
    var data = event && event.event_data ? event.event_data : {};
    var targetIndex = Number(data.target_index);
    var combatant = scene && scene.playerTeam ? scene.playerTeam.combatantList[targetIndex] : null;
    if (event.event_type === "exp_level") {
      queued = queueLevelAmount(scene, combatant, {
        seq: event.seq,
        target_index: targetIndex,
        value: data.value
      }, onComplete) || queued;
    } else {
      queued = queueExperienceAmount(scene, combatant, {
        seq: event.seq,
        target_index: targetIndex,
        value: data.value
      }, onComplete) || queued;
    }
  });

  if (!queued) {
    markDirty();
    return false;
  }

  if (!activeSession) {
    activeSession = progressionQueue.shift();
    openNextProgressionStep();
  }
  return true;
}

export function startDirectLevelProgression(pokemon, levels, resultLines, onComplete) {
  var scene = { manager: { log: [] } };
  var queued = queueLevelAmount(scene, { pokemon: pokemon }, { value: levels }, onComplete);
  if (!queued) {
    markDirty();
    if (typeof onComplete === "function") {
      onComplete();
    } else {
      render();
    }
    return false;
  }
  if (progressionQueue.length) {
    progressionQueue[progressionQueue.length - 1].resultLines = Array.isArray(resultLines) ? resultLines : progressionQueue[progressionQueue.length - 1].resultLines;
  }
  if (!activeSession) {
    activeSession = progressionQueue.shift();
    openNextProgressionStep();
  }
  return true;
}

export function activeProgressionScene() {
  return activeSession ? activeSession.scene : null;
}

export function hasActiveProgression() {
  return Boolean(activeSession);
}

export function clearHiddenProgression() {
  if (state.dialog || (!activeSession && !progressionQueue.length)) {
    return false;
  }
  activeSession = null;
  progressionQueue = [];
  return true;
}

export function resumeActiveProgressionDialog() {
  if (!activeSession) {
    return false;
  }
  if (!state.dialog) {
    openNextProgressionStep();
  }
  return true;
}

export function continueAfterLevelUp() {
  if (!activeSession) {
    return;
  }
  activeSession.phase = "moves";
  activeSession.levelUpBefore = null;
  activeSession.levelUpAfter = null;
  activeSession.levelUpRunBefore = null;
  state.dialog = null;
  openNextProgressionStep();
}

export function replaceProgressionMove(index) {
  var oldMove;
  var learnedMove;
  if (!activeSession || !activeSession.pendingMove || !activeSession.pokemon.moves[index]) {
    return;
  }
  oldMove = activeSession.pokemon.moves[index];
  learnedMove = activeSession.pendingMove;
  activeSession.pokemon.moves[index] = learnedMove;
  clampToLimits(activeSession.pokemon);
  activeSession.scene.manager.log.push(activeSession.pokemon.name + " dimentica " + oldMove.name + " e impara " + learnedMove.name + "!");
  syncCombatant(activeSession);
  markTeamRuntimeStateChanged();
  activeSession.pendingMove = null;
  state.dialog = {
    type: "move-learn-result",
    pokemonName: activeSession.pokemon.name,
    moveName: learnedMove.name,
    message: activeSession.pokemon.name + " ha imparato " + learnedMove.name + "!",
    pokemon: activeSession.pokemon
  };
  render({ scrollBattleLogToBottom: true });
}

var progressionMoveConfirmPanelCleanup = null;

export function showProgressionMoveConfirmPanel(index, anchorElement) {
  var oldMove;
  var backdrop;
  var panel;
  var title;
  var grid;
  var confirmBtn;
  var noBtn;

  if (!activeSession || !activeSession.pendingMove || !activeSession.pokemon.moves[index]) {
    return;
  }
  oldMove = activeSession.pokemon.moves[index];

  closeProgressionMoveConfirmPanel();

  backdrop = document.createElement("div");
  backdrop.className = "floating-panel-backdrop";
  backdrop.dataset.action = "progression-replace-move-cancel";
  backdrop.style.position = "fixed";
  backdrop.style.zIndex = "200";

  panel = document.createElement("section");
  panel.className = "floating-panel";
  panel.style.position = "fixed";
  panel.style.visibility = "hidden";

  title = document.createElement("h3");
  title.className = "floating-panel-title";
  title.textContent = "Vuoi davvero far dimenticare " + oldMove.name + "?";
  panel.appendChild(title);

  grid = document.createElement("div");
  grid.className = "floating-panel-grid";
  grid.style.gridTemplateColumns = "repeat(2, 120px)";

  confirmBtn = document.createElement("button");
  confirmBtn.type = "button";
  confirmBtn.className = "floating-panel-btn selectable";
  confirmBtn.textContent = "Conferma";
  confirmBtn.dataset.action = "progression-replace-move-confirm";
  confirmBtn.dataset.index = String(index);
  grid.appendChild(confirmBtn);

  noBtn = document.createElement("button");
  noBtn.type = "button";
  noBtn.className = "floating-panel-btn selectable";
  noBtn.textContent = "No";
  noBtn.dataset.action = "progression-replace-move-cancel";
  grid.appendChild(noBtn);

  panel.appendChild(grid);
  backdrop.appendChild(panel);
  root.appendChild(backdrop);

  function syncPosition() {
    var anchorRect;
    var viewportWidth;
    var margin = 6;
    var panelWidth;
    var panelHeight;
    var desiredLeft;
    var minLeft;
    var maxLeft;
    var top;

    if (!anchorElement.isConnected || !panel.isConnected) {
      closeProgressionMoveConfirmPanel();
      return;
    }

    anchorRect = anchorElement.getBoundingClientRect();
    viewportWidth = document.documentElement.clientWidth || window.innerWidth || 0;

    panel.style.maxHeight = "";
    panel.style.overflowY = "";
    panelWidth = panel.offsetWidth;
    panelHeight = panel.offsetHeight;

    desiredLeft = anchorRect.left + anchorRect.width / 2 - panelWidth / 2;
    minLeft = margin;
    maxLeft = Math.max(minLeft, viewportWidth - panelWidth - margin);
    top = Math.round(anchorRect.top - panelHeight - margin);

    if (top < margin) {
      top = Math.round(anchorRect.bottom + margin);
    }

    panel.style.left = Math.round(Math.min(Math.max(desiredLeft, minLeft), maxLeft)) + "px";
    panel.style.top = top + "px";
    panel.style.visibility = "";
  }

  syncPosition();

  window.addEventListener("scroll", syncPosition, true);
  window.addEventListener("resize", syncPosition);
  progressionMoveConfirmPanelCleanup = function () {
    window.removeEventListener("scroll", syncPosition, true);
    window.removeEventListener("resize", syncPosition);
  };
}

export function closeProgressionMoveConfirmPanel() {
  if (progressionMoveConfirmPanelCleanup) {
    progressionMoveConfirmPanelCleanup();
    progressionMoveConfirmPanelCleanup = null;
  }
  var existing = root.querySelector(".floating-panel-backdrop[data-action='progression-replace-move-cancel']");
  if (existing) {
    existing.remove();
  }
}

export function skipProgressionMove() {
  var skippedMove;
  if (!activeSession || !activeSession.pendingMove) {
    return;
  }
  skippedMove = activeSession.pendingMove;
  activeSession.scene.manager.log.push(activeSession.pokemon.name + " non impara " + skippedMove.name + ".");
  activeSession.pendingMove = null;
  state.dialog = {
    type: "move-learn-result",
    pokemonName: activeSession.pokemon.name,
    moveName: skippedMove.name,
    message: activeSession.pokemon.name + " non ha imparato " + skippedMove.name,
    pokemon: null
  };
  render({ scrollBattleLogToBottom: true });
}

export function continueAfterMoveResult() {
  if (!activeSession) {
    return;
  }
  state.dialog = null;
  openNextProgressionStep();
}

export function resolveProgressionEvolution(accepted) {
  if (!activeSession || !activeSession.pendingEvolution) {
    return;
  }
  if (accepted) {
    applyEvolution(activeSession, activeSession.pendingEvolution);
    state.dialog = {
      type: "evolution-result",
      oldName: activeSession.evolutionResult.oldName,
      newName: activeSession.evolutionResult.newName,
      pokemon: activeSession.pokemon
    };
    activeSession.pendingEvolution = null;
    render({ scrollBattleLogToBottom: true });
    return;
  } else {
    activeSession.refusedBySpecies[activeSession.pokemon.speciesKey] = true;
    activeSession.scene.manager.log.push(activeSession.pokemon.name + " non si evolve.");
    activeSession.phase = "evolution";
  }
  activeSession.pendingEvolution = null;
  state.dialog = null;
  openNextProgressionStep();
}

export function continueAfterEvolutionResult() {
  if (!activeSession) {
    return;
  }
  activeSession.evolutionResult = null;
  state.dialog = null;
  openNextProgressionStep();
}
