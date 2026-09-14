import { registerAction } from "./action-registry.js";
import { pendingOwnedBattleEntryChoice, sceneAllowsBallUse } from "./battle-scene-policy.js";
import { createCaptureScene } from "./router.js";
import { backgroundKeyForScene } from "../data/scene-backgrounds.js";
import { openMessage, openConfirm, openTeamChoiceDialog } from "./dialog-handler.js";
import { holdDialogContent, markDirty, render, renderDialogLayer, setScene, syncBattleLayoutMeasurements } from "./renderer.js";
import { applyPlayerSave, state, root } from "./game-state.js";
import { getInventoryItemByIndex, getItemByIndex, updateInventoryQuantity, ItemCategory, ItemSubcategory } from "../data/items.js";
import { authoritativeNpcItemsForBattle } from "../data/authoritative-npc-items.js";
import * as Engine from "../engine/index.js";
import {
  activateBattleRuntimeOwnership,
  battleRuntimeOwnerId,
  clearBattleRuntimeOwnership,
  forceClaimBattleRuntimeLock,
  isBattleRuntimeActive,
  setBattleRuntimeActive,
  setBattleRuntimeObserved,
  setPendingActivityRuntime,
  syncBattleRuntimeState,
  enforceBattleRuntimeSceneLock,
  ensureBattleBindings
} from "./battle-scene-lock.js";
import { activeProgressionScene, resumeActiveProgressionDialog } from "./level-up.js";

var TEAM_MAX = Engine.TEAM_MAX;
import { setHtml } from "./renderer.js";
import { serializePokemonList, revivePokemonList, saveAfterStateChange } from "./save-runtime.js";
import { saveFromAuthoritativeProjection } from "../api/player.js";
import { normalizeTrainingOpponentProfile, trainingAssignableLevelsForTeam, trainingDifficultyConfig } from "./training-data.js";
import { abandonAuthoritativeBattle, allocateAuthoritativeTrainingLevels, authoritativeBattleRuntimeOwnerId, claimAuthoritativeBattleRuntime, clearPendingAuthoritativeBattleCommand, createActivePlayerBattle, deleteActivePlayerBattle, getAuthoritativeBattle, inspectPendingAuthoritativeBattleCommand, readAuthoritativeOrdinaryProgression, readAuthoritativeTrainingProgression, resolveAuthoritativeBattleEntryChoice, resolveAuthoritativeOrdinaryProgression, resolveAuthoritativeTrainingPokemon, retryPendingAuthoritativeBattleCommand, retryPendingAuthoritativeTrainingProgressionCommand, startAuthoritativeBattleTower, startAuthoritativeLeagueBattle, startPostBattleExpEvents, submitAuthoritativeBattleMove, switchAuthoritativeBattlePokemon, useAuthoritativeBattleBall, useAuthoritativeBattleItem } from "../api/battle.js";
import { startPostBattleExpProgression } from "./level-up.js";
import { button, moneyText } from "./render-utils.js";
import { getTrainerImage } from "./asset-helpers.js";
import { KANTO_GYM_BADGES, kantoGymCityByKey, kantoEliteFourMemberByIndex, KANTO_CHAMPION } from "../data/gyms.js";
import { resolveText, t, textDescriptor } from "./i18n.js";
import { itemDisplayName, itemNameDescriptor, moveDisplayName, moveNameDescriptor, pokemonDisplayName, pokemonNameDescriptor, speciesNameDescriptor, typeDisplayName } from "./entity-text.js";
import { resolveBattleEvent } from "./battle-text.js";
import { adjustInventoryItemQuantity, adjustTrainerMoney, broadcastAuthoritativeRevision, broadcastCaptureEncounterRuntimeInvalidation, replaceInventoryRuntimeState, replaceTeamRuntimeState, updateTrainerProfile } from "./runtime-state.js";
import { ADMIN_BATTLE_ITEMS, isAdminControlledBattleType } from "../data/admin-battles.js";
import { getSupabaseClient } from "../api/supabase.js";
import { GYM_REWARDS, KANTO_LEAGUE_REWARDS, MAX_TRAINING_LEVELS_PER_POKEMON, expMultiplierForWinnerLevel, levelLimitForBadges, trainingRewardForBadges } from "../data/progression.js";
import { claimTrainingZoneReward } from "../api/training-zone.js";
import { createMissionEventKey, recordMissionEvent } from "./mission-runtime.js";

var activeBattleRealtimeChannel = null;
var activeAuthoritativeRealtimeRefresh = null;
var activeAuthoritativeRealtimeGeneration = 0;
var activeAuthoritativeRealtimeDirty = false;
var activeAuthoritativeRealtimeDeferred = false;
var BATTLE_ITEM_USE_LIMIT = 3;
var activeAuthoritativeTrainingResolution = null;
import { confirmMoveForget, progressionMove, progressionPokemon, progressionResultPokemon, showEvolutionResult } from "./progression-dialog.js";
var authoritativeTrainingProgressionPending = false;
var authoritativeTrainingRecoveryPromise = null;
var authoritativeOrdinaryProgressionComplete = null;
var authoritativeExpPresentation = null;

function battleText(key, params) {
  return textDescriptor("battleText.dialog." + key, params);
}

function battleTextNow(key, params) {
  return t("battleText.dialog." + key, params || {});
}

function battleTitle(key) {
  return battleText("titles." + key);
}

function battleFailure(key) {
  return battleText(key || "commandFailed");
}

function localizedBattleResultLines(scene) {
  var entries = scene && scene.manager && Array.isArray(scene.manager.battleResultLines) ? scene.manager.battleResultLines : [];
  return entries.length ? entries.map(function (entry) { return resolveBattleEvent(entry, scene); }).filter(Boolean) : [battleText("battleConcluded")];
}

function gymBadgeDisplayName(index) {
  var badge = KANTO_GYM_BADGES[Number(index)];
  return badge ? t("ui.gyms.badges." + badge.key) : "";
}

function trainerNameDescriptor(trainer) {
  return trainer && trainer.key ? textDescriptor("ui.gyms.trainers." + trainer.key) : textDescriptor("ui.gyms.eliteFourTitle");
}

function authoritativePokemon(entry) {
  var pokemon = new Engine.Pokemon({
    name: String(entry.display_name || entry.species_key || "Pokemon"), speciesKey: String(entry.species_key || ""),
    ndex: Number(entry.ndex) || 0, level: Number(entry.level) || 1,
    type: Array.isArray(entry.type_keys) ? entry.type_keys.slice() : [], maxHp: Number(entry.max_hp) || 1,
    gender: entry.gender || null, isShiny: Boolean(entry.is_shiny),
    moves: (entry.moves || []).map(function (move) { return Engine.moveFromJSON([Number(move.move_index), Number(move.power) || 0, Number(move.stats) || 0]); }),
    expCurrent: Number(entry.exp_current) || 0, expCap: Number(entry.exp_cap) || 0,
    instanceId: entry.pokemon_instance_id || null, heldItemIndex: Number(entry.held_item_index) || 0
  });
  pokemon.displaySpeciesKey = String(entry.original_species_key || entry.species_key || "");
  pokemon.authoritativeSlot = Number(entry.slot_index);
  return pokemon;
}

export function authoritativeTrainingPreview(projection) {
  var participants = Array.isArray(projection && projection.participants) ? projection.participants : [];
  return {
    opponent: normalizeTrainingOpponentProfile(projection && projection.presentation),
    team: participants.filter(function (entry) { return entry.side === "npc"; }).sort(function (a, b) {
      return Number(a.slot_index) - Number(b.slot_index);
    }).map(authoritativePokemon)
  };
}

function normalizedAuthoritativeExpAwards(awards) {
  return (Array.isArray(awards) ? awards : []).map(function (award) {
    return {
      pokemonInstanceId: String(award && award.pokemon_instance_id || ""),
      teamSlot: Number(award && award.team_slot),
      exp: Math.max(0, Math.floor(Number(award && award.exp) || 0)),
      koCount: Math.max(0, Math.floor(Number(award && award.ko_count) || 0))
    };
  }).filter(function (award) {
    return /^[0-9a-f-]{36}$/i.test(award.pokemonInstanceId)
      && Number.isInteger(award.teamSlot) && award.teamSlot >= 0
      && award.exp > 0 && award.koCount > 0;
  }).sort(function (left, right) {
    return left.teamSlot - right.teamSlot;
  });
}

function storeAuthoritativeExpAwards(scene, awards) {
  var normalized = normalizedAuthoritativeExpAwards(awards);
  if (normalized.length && !scene.authoritativeExpAwardsShown) {
    scene.authoritativeExpAwards = normalized;
  }
}

export function appendAuthoritativeEventLines(scene, events) {
  (events || []).forEach(function (event) {
    var seq = Number(event.seq);
    var type = String(event.event_type || event.type || "");
    var data = event.event_data || event.data || {};
    if (Number.isFinite(seq) && seq <= scene.authoritativeLastEventSeq) { return; }
    if (Number.isFinite(seq)) { scene.authoritativeLastEventSeq = Math.max(scene.authoritativeLastEventSeq, seq); }
    if (type === "display_log" && data.entry && typeof data.entry.key === "string") { scene.manager.log.push(data.entry); }
    if (type === "turn_checkpoint" && Number(data.turn_number) > 0) {
      scene.battleHistoryTurns = scene.battleHistoryTurns || {};
      scene.battleHistoryTurns[Number(data.turn_number)] = { seq: seq, logLength: scene.manager.log.length };
    }
    if (type === "ordinary_exp_awarded") { storeAuthoritativeExpAwards(scene, data.awards); }
  });
}

export function applyAuthoritativeProjection(scene, projection, events, options) {
  options = options || {};
  if (!options.history && ["concluded", "abandoned"].indexOf(projection.status) !== -1
    && !(scene.manager && scene.manager.battleOver)) {
    scene.battleHistoryView = null;
    scene.battleHistoryLoading = null;
  }
  var isTraining = ["training", "debug_training"].indexOf(String(projection && projection.contract_key || "")) !== -1;
  var isGym = ["gym", "admin_gym"].indexOf(String(projection && projection.contract_key || "")) !== -1;
  var isLeague = String(projection && projection.contract_key || "") === "league";
  var isCapture = String(projection && projection.contract_key || "") === "capture";
  var isBattleTower = String(projection && projection.contract_key || "") === "battle_tower";
  var captureContext = projection && projection.capture_context || {};
  var captureZoneName = String(captureContext.zone_key
    || projection && projection.presentation && projection.presentation.zoneKey
    || scene && scene.captureScene && scene.captureScene.zoneName || "");
  var leagueMemberIndex = Number(projection && projection.league_member_index);
  var participants = Array.isArray(projection && projection.participants) ? projection.participants : [];
  var playerEntries = participants.filter(function (entry) { return entry.side === "player"; }).sort(function (a, b) { return a.slot_index - b.slot_index; });
  var npcEntries = participants.filter(function (entry) { return entry.side === "npc"; }).sort(function (a, b) { return a.slot_index - b.slot_index; });
  var previousLog = scene.manager && Array.isArray(scene.manager.log) ? scene.manager.log.slice() : [];
  var presentation = projection.presentation || scene.authoritativePresentation || {};
  var battleState = projection.battle_state && typeof projection.battle_state === "object" ? projection.battle_state : {};
  var playerTeam = new Engine.Team(String(state.playerName || state.auth.userLabel || "").trim() || "Player", playerEntries.map(authoritativePokemon), Math.max(0, playerEntries.findIndex(function (entry) { return Number(entry.slot_index) === Number(projection.player_active_slot); })));
  var enemyTeam = new Engine.Team(String(presentation.name || "Challenger"), npcEntries.map(authoritativePokemon), Math.max(0, npcEntries.findIndex(function (entry) { return Number(entry.slot_index) === Number(projection.npc_active_slot); })));
  playerEntries.forEach(function (entry, index) {
    var combatant = playerTeam.combatantList[index];
    Object.assign(combatant, { hp: Number(entry.current_hp), status: entry.status || null,
      sleepCounter: Number(entry.sleep_counter) || 0, sleepDuration: Number(entry.sleep_duration) || 0,
      confCounter: Number(entry.confusion_counter) || 0 });
    if (entry.presentation_state && typeof entry.presentation_state === "object") {
      Object.assign(combatant, entry.presentation_state);
    }
    hydrateAuthoritativeMoveState(combatant, entry);
  });
  npcEntries.forEach(function (entry, index) {
    var combatant = enemyTeam.combatantList[index];
    Object.assign(combatant, { hp: Number(entry.current_hp), status: entry.status || null,
      sleepCounter: Number(entry.sleep_counter) || 0, sleepDuration: Number(entry.sleep_duration) || 0,
      confCounter: Number(entry.confusion_counter) || 0 });
    if (entry.presentation_state && typeof entry.presentation_state === "object") {
      Object.assign(combatant, entry.presentation_state);
    }
    hydrateAuthoritativeMoveState(combatant, entry);
  });
  var manager = new Engine.BattleManager(playerTeam, enemyTeam);
  if (battleState.player_team && typeof battleState.player_team === "object") {
    Object.assign(playerTeam, battleState.player_team);
  }
  if (battleState.npc_team && typeof battleState.npc_team === "object") {
    Object.assign(enemyTeam, battleState.npc_team);
  }
  playerTeam.battleManager = manager;
  enemyTeam.battleManager = manager;
  playerTeam.combatantList.forEach(function (combatant, index) {
    combatant.team = playerTeam;
    combatant.seedTarget = playerEntries[index] && playerEntries[index].seed_target_side === "npc" ? enemyTeam
      : playerEntries[index] && playerEntries[index].seed_target_side === "player" ? playerTeam : null;
  });
  enemyTeam.combatantList.forEach(function (combatant, index) {
    combatant.team = enemyTeam;
    combatant.seedTarget = npcEntries[index] && npcEntries[index].seed_target_side === "player" ? playerTeam
      : npcEntries[index] && npcEntries[index].seed_target_side === "npc" ? enemyTeam : null;
  });
  if (battleState.manager && typeof battleState.manager === "object") {
    Object.assign(manager, battleState.manager);
  }
  manager.log = previousLog;
  manager.turn = Number(projection.turn_number) || 1;
  manager.firstActor = projection.first_actor === "npc" ? "npc" : "player";
  manager.battleType = isTraining
    ? "training_" + String(projection.training_difficulty || scene.trainingDifficulty || "")
    : isGym ? "gym_" + String(projection.gym_key || scene.authoritativeGymKey || "")
      : isLeague ? (leagueMemberIndex === 4 ? "kanto_league_champion" : "kanto_league_" + (leagueMemberIndex + 1))
      : isCapture ? "capture_" + String(captureContext.zone_key || presentation.zoneKey || "")
        : String(projection.contract_key || scene.battleType || "tackle_test");
  manager.battleOver = projection.status === "concluded" || projection.status === "abandoned";
  manager.playerNeedsSwitch = Boolean(projection.player_needs_switch);
  manager.playerPostMoveSwitch = Boolean(projection.player_post_move_switch);
  manager.battleFled = projection.status === "abandoned";
  manager.usedItems = projection.used_items && typeof projection.used_items === "object" ? Object.assign({}, projection.used_items) : {};
  manager.enemyUsedItems = battleState.enemy_used_items && typeof battleState.enemy_used_items === "object"
    ? Object.assign({}, battleState.enemy_used_items) : {};
  manager.battleResultLines = Array.isArray(battleState.battle_result_lines) ? battleState.battle_result_lines.slice() : null;
  manager.weather = projection.weather || null;
  manager.weatherMoveUsedLastAction = projection.weather_move_used_last_action && typeof projection.weather_move_used_last_action === "object"
    ? Object.assign({ player: false, npc: false }, projection.weather_move_used_last_action)
    : { player: false, npc: false };
  manager.adminControlled = Boolean(projection.admin_controlled);
  manager.opponentControl = String(projection.opponent_control || (manager.adminControlled ? "admin" : scene.battleDome ? "player" : "automatic"));
  manager.waitingFor = projection.waiting_for === "admin" ? "admin" : "player";
  manager.npcNeedsSwitch = Boolean(projection.npc_needs_switch);
  scene.playerTeam = playerTeam;
  scene.enemyTeam = enemyTeam;
  scene.manager = manager;
  scene.battleType = manager.battleType;
  scene.trainingBattle = isTraining;
  scene.authoritativeGym = isGym;
  scene.authoritativeLeague = isLeague;
  scene.authoritativeCapture = isCapture;
  scene.battleTower = isBattleTower;
  scene.authoritativeTowerRunId = isBattleTower ? String(projection.tower_run_id || scene.authoritativeTowerRunId || "") : "";
  scene.authoritativeTowerChallenge = isBattleTower ? Math.max(1, Number(projection.tower_challenge) || 1) : null;
  scene.authoritativeTowerWins = isBattleTower ? Math.max(0, Number(projection.tower_wins) || 0) : 0;
  if (!options.history && isBattleTower && ["concluded", "abandoned"].indexOf(String(projection.status || "")) === -1) {
    state.battleTower = {
      runId: scene.authoritativeTowerRunId || null,
      wins: scene.authoritativeTowerWins,
      nextChallenge: scene.authoritativeTowerChallenge,
      record: Math.max(0, Number(state.battleTower && state.battleTower.record) || 0),
      attemptedToday: Boolean(state.battleTower && state.battleTower.attemptedToday)
    };
  }
  scene.captureScene = isCapture && !options.history ? Object.assign(createCaptureScene(captureZoneName, scene.captureScene), {
    encounterId: String(projection.encounter_id || captureContext.encounter_id || "")
  }) : scene.captureScene;
  scene.kantoLeague = isLeague;
  scene.authoritativeLeagueMemberIndex = isLeague ? leagueMemberIndex : null;
  scene.authoritativeGymKey = isGym ? String(projection.gym_key || scene.authoritativeGymKey || "") : "";
  scene.gymScene = isGym ? { name: "gym-city", cityKey: scene.authoritativeGymKey }
    : isLeague ? (leagueMemberIndex === 4
      ? { name: "gym-city", cityKey: "kanto_champion" }
      : { name: "gym-city", cityKey: "elite_four", e4MemberIndex: leagueMemberIndex }) : scene.gymScene;
  scene.authoritativeContractKey = String(projection.contract_key || "");
  scene.trainingDifficulty = isTraining ? (projection.contract_key === "debug_training"
    ? "debug" : String(projection.training_difficulty || scene.trainingDifficulty || "")) : "";
  scene.trainingConfig = isTraining ? trainingDifficultyConfig(scene.trainingDifficulty) : null;
  scene.trainingOpponent = isTraining ? normalizeTrainingOpponentProfile(presentation) : null;
  scene.trainingTrainerSprite = scene.trainingOpponent ? scene.trainingOpponent.sprite : "";
  scene.authoritativePresentation = presentation;
  scene.authoritativeBattleId = String(projection.battle_id || scene.authoritativeBattleId || "");
  scene.authoritativeBattleVersion = Math.max(Number(scene.authoritativeBattleVersion) || 0,
    Number(projection.battle_version) || 0, 1);
  scene.authoritativeRuntimeOwnerId = String(projection.runtime_owner_id || scene.authoritativeRuntimeOwnerId || "");
  scene.adminControlled = manager.adminControlled;
  scene.adminItems = copyInventoryEntries(projection.admin_items);
  scene.authoritativeStatus = String(projection.status || "active");
  scene.authoritativeResultKey = projection.result_key || null;
  scene.authoritativeEntryChoice = projection.entry_choice && typeof projection.entry_choice === "object" ? projection.entry_choice : null;
  scene.authoritativeAdminEntryChoice = projection.admin_entry_choice && typeof projection.admin_entry_choice === "object" ? projection.admin_entry_choice : null;
  scene.authoritativeInitialEntry = projection.initial_entry && typeof projection.initial_entry === "object" ? projection.initial_entry : null;
  scene.playerInventory = copyInventoryEntries(projection.player_items);
  if (!options.history) storeAuthoritativeExpAwards(scene, projection.ordinary_exp_awards);
  appendAuthoritativeEventLines(scene, events);
  ensureBattleBindings(scene);
  return scene;
}

function hydrateAuthoritativeMoveState(combatant, entry) {
  var disabledSlots = Array.isArray(entry.disabled_move_slots) ? entry.disabled_move_slots.map(Number) : [];
  var pendingSlot = entry.pending_move_slot === null || entry.pending_move_slot === undefined
    ? null : Number(entry.pending_move_slot);
  combatant.disabledMoves = disabledSlots.map(function (slot) {
    return combatant.pokemon.moves[slot] && combatant.pokemon.moves[slot].key;
  }).filter(Boolean);
  combatant.pendingMove = Number.isInteger(pendingSlot) ? combatant.pokemon.moves[pendingSlot] || null : null;
  combatant.updateMovesState();
  combatant.moveStates.forEach(function (moveState, slot) {
    if (entry.moves && entry.moves[slot] && typeof entry.moves[slot].available === "boolean") {
      moveState.enabled = entry.moves[slot].available;
    }
  });
}

export function openAuthoritativeBattleProjection(projection, events, options) {
  var isTraining = ["training", "debug_training"].indexOf(String(projection && projection.contract_key || "")) !== -1;
  var isGym = ["gym", "admin_gym"].indexOf(String(projection && projection.contract_key || "")) !== -1;
  var isLeague = String(projection && projection.contract_key || "") === "league";
  var leagueMemberIndex = Number(projection && projection.league_member_index);
  var sourceScene = options && options.sourceScene || state.scene;
  var sourceBackgroundKey = sourceScene ? backgroundKeyForScene(sourceScene) : "";
  var scene = { name: "battle", authoritativeBattle: true, authoritativeLastEventSeq: 0, trainingBattle: isTraining,
    trainingScene: isTraining ? { name: "training-zone", trainingDifficulty: projection.contract_key === "debug_training"
      ? "debug" : String(projection.training_difficulty || "") } : null,
    gymScene: isGym ? { name: "gym-city", cityKey: String(projection.gym_key || "") }
      : isLeague ? (leagueMemberIndex === 4 ? { name: "gym-city", cityKey: "kanto_champion" }
        : { name: "gym-city", cityKey: "elite_four", e4MemberIndex: leagueMemberIndex }) : null,
    manager: { log: [] },
    captureScene: options && options.captureScene ? Object.assign({}, options.captureScene) : null,
    sourceBackgroundKey: sourceBackgroundKey };
  applyAuthoritativeProjection(scene, projection, events);
  activateBattleRuntimeOwnership();
  setActiveBattleMeta({ battleType: scene.battleType, firstActor: scene.manager.firstActor, authoritative: true }, { ownsRuntime: true });
  setScene(scene, { history: options && options.history === "replace" ? "replace" : undefined });
  clearActiveBattleRealtime();
  syncActiveBattleRealtime(scene);
  if (scene.authoritativeEntryChoice) {
    openPendingBattleEntryChoice(scene);
  }
  recoverStoredAuthoritativeBattleCommand(scene);
  return scene;
}

function authoritativeExpAwardPokemon(scene, award) {
  return pokemonByInstanceId(award.pokemonInstanceId)
    || scene.playerTeam && scene.playerTeam.combatantList.map(function (combatant) {
    return combatant.pokemon;
  }).find(function (pokemon) {
    return String(pokemon.instanceId || "") === award.pokemonInstanceId;
  }) || null;
}

function openNextAuthoritativeExpAward(scene, onComplete) {
  var awards = scene.authoritativeExpAwards || [];
  var presentation = authoritativeExpPresentation;
  var resolution = authoritativeOrdinaryResolution();
  var award;
  var pokemon;
  var beforePokemon;
  // Resolve each Pokemon's canonical level/move/evolution sequence before
  // presenting another award. The server advances the next Pokemon on commit.
  if (resolution) {
    award = awards.find(function (entry) {
      return entry.pokemonInstanceId === String(resolution.pokemon_instance_id)
        && !presentation.shown[entry.pokemonInstanceId];
    });
    if (award) { presentation.shown[award.pokemonInstanceId] = true; }
    resumeAuthoritativeOrdinaryChoices(award);
    return;
  }
  award = awards.find(function (entry) { return !presentation.shown[entry.pokemonInstanceId]; });
  if (!award) {
    authoritativeExpPresentation = null;
    onComplete();
    return;
  }
  presentation.shown[award.pokemonInstanceId] = true;
  pokemon = authoritativeExpAwardPokemon(scene, award);
  if (!pokemon) {
    openNextAuthoritativeExpAward(scene, onComplete);
    return;
  }
  beforePokemon = scene.authoritativeExpBefore && scene.authoritativeExpBefore[award.pokemonInstanceId];
  if ((beforePokemon || pokemon).level >= levelLimitForBadges(state.trainerInfo[2])
    && (!beforePokemon || beforePokemon.level === pokemon.level) && pokemon.expCurrent === 0) {
    openMessage([textDescriptor(pokemon.level >= 100 ? "messages.progression.level100NoExperience"
      : "messages.progression.badgeLevelAlreadyReached", { pokemon: pokemonNameDescriptor(pokemon) })], {
      title: textDescriptor("ui.dialogs.experienceGained"), pokemon: pokemon,
      closeLabel: textDescriptor("ui.dialogs.ok"), requireButtonClose: true,
      scrollBattleLogToBottom: true,
      onClose: function () { openNextAuthoritativeExpAward(scene, onComplete); }
    });
    return;
  }
  if (!beforePokemon) {
    beforePokemon = Engine.Pokemon.fromJSON(pokemon.toJSON());
    beforePokemon.expCurrent = Math.max(0, beforePokemon.expCurrent - award.exp);
  }
  state.dialog = {
    type: "level-up", title: textDescriptor("ui.dialogs.experienceGained"),
    resultLines: [textDescriptor("ui.dialogs.experienceSentence", { pokemon: pokemonNameDescriptor(pokemon), experience: award.exp })],
    beforePokemon: beforePokemon, afterPokemon: Engine.Pokemon.fromJSON(pokemon.toJSON()),
    continueAction: "dialog-close",
    onClose: function () {
      openNextAuthoritativeExpAward(scene, onComplete);
    }
  };
  renderDialogLayer({ scrollBattleLogToBottom: true });
}

function openAuthoritativeExpAwards(scene, onComplete) {
  if (scene.authoritativeExpAwardsShown || !(scene.authoritativeExpAwards || []).length) {
    return false;
  }
  scene.authoritativeExpAwardsShown = true;
  authoritativeExpPresentation = { scene: scene, onComplete: onComplete, shown: {} };
  openNextAuthoritativeExpAward(scene, onComplete);
  return true;
}

function continueAuthoritativeBattleTerminal(scene, projection) {
  if (scene.battleTower && scene.authoritativeStatus === "concluded" && scene.authoritativeResultKey === "player_win_no_reward") {
    openMessage([battleText("towerNext")], {
      title: battleTitle("tower"), requireButtonClose: true, closeLabel: battleText("buttons.continue"), closeClass: "button-accent",
      onClose: function () { startNextAuthoritativeBattleTower(scene); }
    });
    return true;
  }
  if (state.ordinaryProgression) {
    authoritativeOrdinaryProgressionComplete = function () {
      if (scene.authoritativeGym && projection && projection.gym_reward) {
        openAuthoritativeGymReward(scene, projection.gym_reward);
      } else if (scene.authoritativeLeague && projection && projection.league_reward) {
        openAuthoritativeLeagueReward(scene, projection.league_reward, projection.league_state);
      } else {
        openAuthoritativeBattleOutcome(scene, projection);
      }
    };
    openAuthoritativeOrdinaryProgression();
    return true;
  }
  if (scene.trainingBattle && projection && projection.player_state) {
    openAuthoritativeTrainingProgression();
    return true;
  }
  if (scene.authoritativeGym && projection && projection.gym_reward) {
    openAuthoritativeGymReward(scene, projection.gym_reward);
    return true;
  }
  if (scene.authoritativeLeague && projection && projection.league_reward) {
    openAuthoritativeLeagueReward(scene, projection.league_reward, projection.league_state);
    return true;
  }
  if (scene.authoritativeLeague && projection && projection.league_state) {
    openAuthoritativeLeagueFailure(scene, projection.league_state);
    return true;
  }
  if (scene.authoritativeCapture && scene.authoritativeResultKey === "pokemon_captured") {
    var capturedName = scene.enemyTeam && scene.enemyTeam.getActive() && scene.enemyTeam.getActive().pokemon
      ? pokemonNameDescriptor(scene.enemyTeam.getActive().pokemon) : speciesNameDescriptor("");
    openMessage([battleText("captured", { pokemon: capturedName }), projection && projection.placement === "team"
      ? battleText("addedToTeam", { pokemon: capturedName }) : battleText("sentToBox", { pokemon: capturedName })], {
      title: battleTitle("capture"), requireButtonClose: true, closeClass: "button-accent", onClose: function () {
        showTerminalBattleScreen(scene);
      }
    });
    return true;
  }
  openAuthoritativeBattleOutcome(scene, projection);
  return true;
}

function startNextAuthoritativeBattleTower(scene) {
  if (!scene || state.battleStartPending) { return; }
  state.battleStartPending = true;
  startAuthoritativeBattleTower({ expectedPlayerRevision: state.authoritativeRevision }).then(function (result) {
    state.battleStartPending = false;
    if (!result.ok || !result.battle) {
      openMessage([battleFailure("nextTowerFailed")], { title: battleTitle("tower"), onClose: function () {
        showTerminalBattleScreen(scene);
      } });
      return;
    }
    state.authoritativeRevision = result.playerRevision;
    openAuthoritativeBattleProjection(result.battle, result.events, { history: "replace" });
  }).catch(function (error) {
    state.battleStartPending = false;
    openMessage([battleFailure("nextTowerFailed")], { title: battleTitle("tower"), onClose: function () {
      showTerminalBattleScreen(scene);
    } });
  });
}

function handleAuthoritativeBattleTerminal(scene, projection) {
  if (!scene.manager.battleOver || scene.authoritativeResultHandled) { return false; }
  scene.authoritativeResultHandled = true;
  if (scene.authoritativeStatus === "concluded" && scene.authoritativeResultKey === "player_win_no_reward"
    && openAuthoritativeExpAwards(scene, function () {
    continueAuthoritativeBattleTerminal(scene, projection);
  })) {
    return true;
  }
  scene.authoritativeExpAwards = [];
  return continueAuthoritativeBattleTerminal(scene, projection);
}

function presentationHpHistory(beforeSnapshot, afterSnapshot, events) {
  var history = [beforeSnapshot];
  (events || []).forEach(function (event) {
    var type = String(event && (event.event_type || event.type) || "");
    var data = event && (event.event_data || event.data) || {};
    var frame = {};
    if (type !== "presentation_frame" || !Array.isArray(data.player_hp) || !Array.isArray(data.npc_hp)) {
      return;
    }
    data.player_hp.forEach(function (hp, index) { frame["p_" + index] = Math.max(0, Number(hp) || 0); });
    data.npc_hp.forEach(function (hp, index) { frame["e_" + index] = Math.max(0, Number(hp) || 0); });
    if (Object.keys(frame).length === Object.keys(afterSnapshot).length
      && snapshotChanged(history[history.length - 1], frame)) {
      history.push(frame);
    }
  });
  if (snapshotChanged(history[history.length - 1], afterSnapshot)) {
    history.push(afterSnapshot);
  }
  return history;
}

function commandResetsBattleScroll(events) {
  return (events || []).some(function (event) {
    var type = String(event && (event.event_type || event.type) || "");
    var data = event && (event.event_data || event.data) || {};
    return (type === "command_resolved" && ["item", "switch"].indexOf(data.command_type) !== -1)
      || type === "ball_resolved";
  });
}

function applyAuthoritativeBattleCommandResult(scene, result) {
  var beforeSnapshot = hpSnapshot(scene);
  var afterSnapshot;
  var failedBall = (result.events || []).some(function (event) {
    var type = String(event && (event.event_type || event.type) || "");
    var data = event && (event.event_data || event.data) || {};
    return type === "ball_resolved" && data.capture_success === false;
  });
  var finishPresentation = function () {
    if (!state.scene || state.scene !== scene) {
      setBattleAnimationLock(false);
      return;
    }
    scene.authoritativeCommandPending = false;
    setBattleAnimationLock(false);
    refreshDeferredAuthoritativeScene(scene, commandResetsBattleScroll(result.events));
    render({ preserveScroll: commandResetsBattleScroll(result.events) ? false : true, scrollBattleLogToBottom: true });
    if (scene.authoritativeEntryChoice) {
      openPendingBattleEntryChoice(scene);
    }
    if (scene.authoritativeCapture && failedBall && !scene.manager.battleOver) {
      openMessage([battleText("ballEscaped")], {
        title: battleTitle("capture"), closeLabel: "Ok", closeClass: "button-accent", scrollBattleLogToBottom: true
      });
    }
    handleAuthoritativeBattleTerminal(scene, result.projection);
  };
  scene.authoritativeCommandUncertain = false;
  scene.authoritativeRecoveryPending = false;
  scene.authoritativePendingCommandId = null;
  state.authoritativeRevision = result.playerRevision;
  broadcastAuthoritativeRevision(state.authoritativeRevision);
  if (result.projection && result.projection.player_state) {
    if (!scene.authoritativeExpBefore) {
      scene.authoritativeExpBefore = {};
      (state.team || []).forEach(function (pokemon) {
        scene.authoritativeExpBefore[pokemon.instanceId] = Engine.Pokemon.fromJSON(pokemon.toJSON());
      });
    }
    applyAuthoritativeBattlePlayerState(result.projection.player_state);
  }
  if (result.projection && result.projection.league_state) {
    state.authoritativeLeagueState = result.projection.league_state;
  }
  if (result.projection && result.projection.tower_run) {
    var towerRun = result.projection.tower_run;
    state.battleTower = {
      runId: ["active", "awaiting_next"].indexOf(String(towerRun.status || "")) !== -1 ? String(towerRun.run_id || "") || null : null,
      wins: Math.max(0, Number(towerRun.wins) || 0),
      nextChallenge: Math.max(1, Number(towerRun.next_challenge) || 1),
      record: Math.max(0, Number(result.projection.tower_record !== undefined ? result.projection.tower_record : state.battleTower && state.battleTower.record) || 0),
      attemptedToday: true
    };
  }
  applyAuthoritativeProjection(scene, result.battle, result.events);
  afterSnapshot = hpSnapshot(scene);
  if (snapshotChanged(beforeSnapshot, afterSnapshot)) {
    scene.authoritativeCommandPending = true;
    setBattleAnimationLock(true);
    render({ scrollBattleLogToBottom: true }).then(function () {
      if (!state.scene || state.scene !== scene) {
        return;
      }
      return animateHpSequence(presentationHpHistory(beforeSnapshot, afterSnapshot, result.events), scene);
    }).then(finishPresentation);
    return;
  }
  finishPresentation();
}

function setAuthoritativeCommandUncertain(scene, result) {
  scene.authoritativeCommandPending = false;
  scene.authoritativeRecoveryPending = false;
  scene.authoritativeCommandUncertain = true;
  scene.authoritativeUncertaintyMessage = battleText("commandVerifying");
  render({ scrollBattleLogToBottom: true });
}

function readAuthoritativeBattleAfterResolution(scene) {
  return getAuthoritativeBattle(scene.authoritativeBattleId, { afterSeq: scene.authoritativeLastEventSeq }).then(function (fresh) {
    if (!state.scene || state.scene !== scene) { return fresh; }
    if (fresh.ok && fresh.battle) {
      applyAuthoritativeBattleCommandResult(scene, fresh);
    } else {
      setAuthoritativeCommandUncertain(scene, fresh);
      openMessage([battleFailure("verifyFailed")], { title: battleTitle("battle") });
    }
    return fresh;
  });
}

function recoverAuthoritativeBattleCommand(scene, options) {
  options = options || {};
  if (!scene || scene.authoritativeRecoveryPending) { return Promise.resolve(false); }
  scene.authoritativeRecoveryPending = true;
  scene.authoritativeCommandPending = true;
  render();
  return retryPendingAuthoritativeBattleCommand(scene.authoritativeBattleId).then(function (result) {
    if (!state.scene || state.scene !== scene) { return false; }
    scene.authoritativeRecoveryPending = false;
    scene.authoritativeCommandPending = false;
    if (result.pending && result.ok && result.battle) {
      if (options.readAfter) {
        return readAuthoritativeBattleAfterResolution(scene).then(function () { return true; });
      }
      applyAuthoritativeBattleCommandResult(scene, result);
      return true;
    }
    if (result.pending && !result.ok && result.uncertain) {
      setAuthoritativeCommandUncertain(scene, result);
      return false;
    }
    if (result.pending && result.code === "revision_conflict") {
      clearPendingAuthoritativeBattleCommand(scene.authoritativeBattleId, result.commandId);
    }
    return readAuthoritativeBattleAfterResolution(scene).then(function () { return true; });
  }).catch(function (error) {
    if (state.scene === scene) {
      setAuthoritativeCommandUncertain(scene, { message: error.message });
    }
    return false;
  });
}

function recoverStoredAuthoritativeBattleCommand(scene) {
  if (!scene || ["active", "needs_player_switch"].indexOf(String(scene.authoritativeStatus || "")) === -1) {
    if (scene && scene.authoritativeBattleId) {
      clearPendingAuthoritativeBattleCommand(scene.authoritativeBattleId);
    }
    return;
  }
  inspectPendingAuthoritativeBattleCommand(scene.authoritativeBattleId).then(function (pending) {
    if (!pending || !state.scene || state.scene !== scene) { return; }
    scene.authoritativePendingCommandId = pending.body.commandId;
    scene.authoritativeCommandUncertain = true;
    scene.authoritativeUncertaintyMessage = battleText("automaticRecovery");
    render();
    recoverAuthoritativeBattleCommand(scene, { automatic: true });
  });
}

function authoritativeBattleCommand(scene, operation) {
  if (!scene || scene.authoritativeCommandPending || scene.authoritativeCommandUncertain || scene.manager.battleOver) { return; }
  scene.authoritativeCommandPending = true;
  scene.authoritativePendingCommandId = scene.authoritativePendingCommandId || globalThis.crypto.randomUUID();
  render();
  operation({ battleId: scene.authoritativeBattleId, expectedPlayerRevision: state.authoritativeRevision,
    expectedBattleVersion: scene.authoritativeBattleVersion, runtimeOwnerId: authoritativeBattleRuntimeOwnerId(),
    commandId: scene.authoritativePendingCommandId }).then(function (result) {
    if (!state.scene || state.scene !== scene) { return; }
    if (!result.ok) {
      if (result.uncertain) {
        scene.authoritativeCommandUncertain = true;
        if (result.code === "rate_limited") {
          setAuthoritativeCommandUncertain(scene, result);
          return;
        }
        recoverAuthoritativeBattleCommand(scene, { automatic: true });
        return;
      }
      scene.authoritativeCommandPending = false;
      scene.authoritativePendingCommandId = null;
      if (result.code === "revision_conflict" || result.code === "battle_command_rejected") {
        readAuthoritativeBattleAfterResolution(scene);
        return;
      }
      openMessage([battleFailure("commandFailed")], { title: battleTitle("battle") });
      render();
      return;
    }
    applyAuthoritativeBattleCommandResult(scene, result);
  }).catch(function (error) {
    if (!state.scene || state.scene !== scene) { return; }
    scene.authoritativeCommandUncertain = true;
    recoverAuthoritativeBattleCommand(scene, { automatic: true }).then(function (recovered) {
      if (!recovered && state.scene === scene) {
        scene.authoritativeUncertaintyMessage = battleText("commandUnverified");
        render();
      }
    });
  });
}

function openAuthoritativeBattleOutcome(scene, projection) {
  var wildKo = scene.authoritativeCapture && scene.authoritativeResultKey === "player_win_no_reward";
  var playerKo = scene.authoritativeCapture && scene.playerTeam.isAllFainted();
  var captureUnavailable = scene.authoritativeCapture
    && ["pokemon_captured", "player_win_no_reward", "player_loss_no_reward", "abandoned_no_reward"].indexOf(scene.authoritativeResultKey) === -1;
  var wildPokemonName = scene.enemyTeam && scene.enemyTeam.getActive() && scene.enemyTeam.getActive().pokemon
    ? pokemonNameDescriptor(scene.enemyTeam.getActive().pokemon) : speciesNameDescriptor("");
  var lines = [captureUnavailable ? battleText("noRewards")
    : wildKo ? battleText("wildKo", { pokemon: wildPokemonName }) : playerKo ? battleText("teamDefeated")
    : scene.authoritativeStatus === "abandoned" ? battleText("abandoned")
      : scene.playerTeam.isAllFainted() ? battleText("lostChallenge") : battleText("wonChallenge")];
  var hasPenalty = projection && projection.money_penalty !== null && projection.money_penalty !== undefined;
  var penalty = Math.max(0, Number(projection && projection.money_penalty) || 0);
  var towerPoints = Number(projection && projection.tower_reward && projection.tower_reward.battle_points) || 0;
  if (scene.battleTower && (scene.authoritativeStatus === "abandoned" || scene.playerTeam.isAllFainted())) {
    lines.push(battleText("earnedBattlePoints", { points: towerPoints }));
  }
  if (hasPenalty) {
    lines.push(battleText(scene.authoritativeCapture ? "lostMoneyConfusion" : "lostMoney", { money: moneyText(penalty) }));
  }
  openMessage(lines, { title: battleTitle(scene.authoritativeCapture ? "capture" : scene.authoritativeGym ? "gym"
    : scene.trainingBattle ? "training" : scene.battleTower ? "tower" : "battle"),
    requireButtonClose: true, onClose: function () {
      showTerminalBattleScreen(scene);
    } });
}

function showTerminalBattleScreen(scene) {
  var release = function () {
    ensureFinalBattleDisplaySnapshot(scene);
    scene.terminalExitReady = true;
    state.activeBattle = null;
    clearActiveBattleRealtime();
    setBattleRuntimeActive(false);
    render({ scrollBattleLogToBottom: true });
  };
  if (!scene || !scene.manager || !scene.manager.battleOver) { return; }
  if (scene.authoritativeBattle) {
    release();
    return;
  }
  closePersistedBattleRuntime(scene).then(release);
}

function openAuthoritativeLeagueReward(scene, reward, leagueState) {
  var memberIndex = Number(reward && reward.memberIndex);
  var isChampion = memberIndex === 4;
  var member = isChampion ? KANTO_CHAMPION : kantoEliteFourMemberByIndex(memberIndex);
  openMessage([
    battleText("defeatedMember", { member: trainerNameDescriptor(isChampion ? KANTO_CHAMPION : member) }),
    battleText("receivedPrizeMoney", { money: moneyText(Number(reward && reward.money) || 0) })
  ], {
    title: battleTitle("league"), closeLabel: "Ok", closeClass: "button-accent", requireButtonClose: true,
    scrollBattleLogToBottom: true,
    onClose: function () {
      state.activeBattle = null;
      setBattleRuntimeActive(false);
      if (leagueState && leagueState.nextMemberIndex !== null && leagueState.nextMemberIndex !== undefined) {
        startKantoLeagueNextBattle(Number(leagueState.nextMemberIndex));
      } else {
        setScene({ name: "gyms" }, { history: "replace" });
      }
    }
  });
}

function openAuthoritativeLeagueFailure(scene, leagueState) {
  var penalty = Number(leagueState && leagueState.moneyPenalty) || 0;
  var lines = [battleText(scene.authoritativeStatus === "abandoned" ? "retiredChallenge" : "lostLeagueRun")];
  if (penalty) { lines.push(battleText("lostMoneyConfusion", { money: moneyText(penalty) })); }
  lines.push(battleText("leagueRestart"));
  openMessage(lines, { title: battleTitle("league"), requireButtonClose: true, onClose: function () {
    showTerminalBattleScreen(scene);
  } });
}

function openAuthoritativeGymReward(scene, reward) {
  var lines = [battleText("wonChallenge"), battleText("earnedMoney", { money: moneyText(Number(reward.money) || 0) })];
  var badgeIndex = Number(reward.badgeIndex);
  (Array.isArray(reward.items) ? reward.items : []).forEach(function (entry) {
    var item = getItemByIndex(entry && entry.itemIndex);
    if (item) { lines.push(battleText("earnedItem", { item: itemNameDescriptor(item) })); }
  });
  if (Number.isInteger(badgeIndex) && KANTO_GYM_BADGES[badgeIndex]) {
    lines.push(battleText("earnedBadge", { badge: textDescriptor("ui.gyms.badges." + KANTO_GYM_BADGES[badgeIndex].key) }));
  }
  openMessage(lines, {
    title: battleTitle("gym"),
    closeLabel: "Ok",
    closeClass: "button-accent",
    requireButtonClose: true,
    scrollBattleLogToBottom: true,
    onClose: function () {
      showTerminalBattleScreen(scene);
    }
  });
}

function applyAuthoritativeBattlePlayerState(projection) {
  var previousEncounter = state.activeEncounter;
  var previousEncounterKey = previousEncounter ? String(previousEncounter.encounterId || "") + ":" + String(previousEncounter.battleId || "") : "";
  var nextEncounter;
  var nextEncounterKey;
  applyPlayerSave(saveFromAuthoritativeProjection(projection));
  nextEncounter = state.activeEncounter;
  nextEncounterKey = nextEncounter ? String(nextEncounter.encounterId || "") + ":" + String(nextEncounter.battleId || "") : "";
  replaceTeamRuntimeState(state.team);
  state.authoritativeRevision = Number(projection && projection.revision) || state.authoritativeRevision;
  broadcastAuthoritativeRevision(state.authoritativeRevision);
  if (previousEncounterKey !== nextEncounterKey) {
    broadcastCaptureEncounterRuntimeInvalidation(state.authoritativeRevision);
  }
  setPendingActivityRuntime(state.pendingActivity);
}

function authoritativeTrainingResolution() {
  return (state.pendingResolutions || []).filter(function (resolution) {
    return resolution && resolution.status === "pending" && resolution.options
      && resolution.options.source === "training";
  }).sort(function (left, right) {
    return Number(left.options.team_slot) - Number(right.options.team_slot);
  })[0] || null;
}

function authoritativeOrdinaryResolution() {
  return (state.pendingResolutions || []).filter(function (resolution) {
    return resolution && resolution.status === "pending" && resolution.options
      && resolution.options.source === "ordinary";
  }).sort(function (left, right) {
    return Number(left.options.team_slot) - Number(right.options.team_slot);
  })[0] || null;
}

function pokemonByInstanceId(instanceId) {
  return (state.team || []).find(function (pokemon) {
    return pokemon && String(pokemon.instanceId || "") === String(instanceId || "");
  }) || null;
}

function trainingEvolutionTarget(targetSpeciesKey, pokemon) {
  var species = Engine.findSpecies(targetSpeciesKey);
  return { speciesKey: String(targetSpeciesKey), name: species && species.name || String(targetSpeciesKey),
    gender: pokemon && pokemon.gender, isShiny: pokemon && pokemon.isShiny };
}

function finishAuthoritativeTrainingProgression() {
  activeAuthoritativeTrainingResolution = null;
  state.dialog = null;
  renderDialogLayer();
  showTerminalBattleScreen(state.scene);
}

function submitAuthoritativeTrainingResolution(evolutionTargetSpeciesKey) {
  var session = activeAuthoritativeTrainingResolution;
  if (!session || authoritativeTrainingProgressionPending) { return; }
  authoritativeTrainingProgressionPending = true;
  holdDialogContent();
  (session.source === "ordinary" ? resolveAuthoritativeOrdinaryProgression : resolveAuthoritativeTrainingPokemon)({
    commandId: session.commandId,
    expectedPlayerRevision: state.authoritativeRevision,
    pendingResolutionId: session.resolution.id,
    choices: { moves: session.choices, evolutionTargetSpeciesKey: evolutionTargetSpeciesKey || null }
  }).then(function (result) {
    if (!result.ok || !result.projection || !result.projection.player_state) {
      authoritativeTrainingProgressionPending = false;
      if (!result.uncertain) { session.commandId = globalThis.crypto.randomUUID(); }
      openMessage([battleFailure("trainingResolutionFailed")], {
        title: battleTitle("training"), onClose: function () {
          if (result.uncertain) {
            if (session.source === "ordinary") { resumeAuthoritativeOrdinaryProgression(); }
            else { resumeAuthoritativeTrainingProgression(); }
          }
          else { openNextAuthoritativeTrainingChoice(); }
        }
      });
      return;
    }
    applyAuthoritativeBattlePlayerState(result.projection.player_state);
    activeAuthoritativeTrainingResolution = null;
    authoritativeTrainingProgressionPending = false;
    var pokemon = progressionResultPokemon(pokemonByInstanceId(session.resolution.pokemon_instance_id), state.pendingResolutions);
    var learned = (pokemon && pokemon.moves || []).filter(function (move) {
      return session.choices.some(function (choice) { return choice.moveIndex === Number(move.index); })
        && !(session.pokemon.moves || []).some(function (oldMove) { return Number(oldMove.index) === Number(move.index); });
    });
    var continueProgression = function () {
      if (session.source === "ordinary") { openAuthoritativeOrdinaryProgression(); }
      else { openAuthoritativeTrainingProgression(); }
    };
    var afterLearning = function () {
      if (evolutionTargetSpeciesKey && pokemon && pokemon.speciesKey === evolutionTargetSpeciesKey
        && pokemon.speciesKey !== session.pokemon.speciesKey) {
        showEvolutionResult(session.pokemon, pokemon, continueProgression);
      } else { continueProgression(); }
    };
    if (learned.length) {
      openMessage(learned.map(function (move) {
        return textDescriptor("messages.progression.learned", {
          pokemon: pokemonNameDescriptor(session.pokemon), move: moveNameDescriptor(move)
        });
      }), { title: battleTitle(session.source === "ordinary" ? "experience" : "training"),
        pokemon: pokemon, requireButtonClose: true, onClose: afterLearning });
    } else { afterLearning(); }
  }).catch(function (error) {
    authoritativeTrainingProgressionPending = false;
    openMessage([battleFailure("trainingResolutionFailed")], {
      title: battleTitle("training"), onClose: function () {
        if (session.source === "ordinary") { resumeAuthoritativeOrdinaryProgression(); }
        else { resumeAuthoritativeTrainingProgression(); }
      }
    });
  });
}

function finishAuthoritativeOrdinaryProgression() {
  var onComplete = authoritativeOrdinaryProgressionComplete;
  activeAuthoritativeTrainingResolution = null;
  authoritativeOrdinaryProgressionComplete = null;
  if (typeof onComplete === "function") { onComplete(); return; }
  setScene(state.authoritativeLeagueState && state.authoritativeLeagueState.status === "awaiting_battle"
    ? { name: "gym-city", cityKey: "elite_four" } : { name: "home" }, { history: "replace" });
  openMessage([battleText("progressionComplete")], { title: battleTitle("experience") });
}

function resumeAuthoritativeOrdinaryChoices(experienceAward) {
  var resolution = authoritativeOrdinaryResolution();
  var pokemon;
  var options;
  if (!resolution) { finishAuthoritativeOrdinaryProgression(); return; }
  pokemon = pokemonByInstanceId(resolution.pokemon_instance_id);
  if (!pokemon) { openMessage([battleText("progressionPokemonMissing")], { title: battleTitle("experience") }); return; }
  options = resolution.options || {};
  // Recovery can start outside the battle screen. The first level's frozen
  // before_state includes the awarded EXP; subtract it only for presentation.
  if (!authoritativeExpPresentation && !experienceAward && options.before_state) {
    var entry = (state.ordinaryProgression.pokemon || []).find(function (candidate) {
      return candidate.pokemon_instance_id === resolution.pokemon_instance_id;
    });
    var segmentLevels = options.after_state ? Number(options.after_state.l) - Number(options.before_state.l) : 0;
    if (entry && segmentLevels > 0 && Number(entry.levels_gained) === segmentLevels) {
      experienceAward = { exp: Number(entry.exp_awarded) || 0 };
    }
  }
  activeAuthoritativeTrainingResolution = {
    source: "ordinary", resolution: resolution, pokemon: pokemon,
    offers: Array.isArray(options.level_moves) ? options.level_moves : [],
    evolutions: Array.isArray(options.evolutions) ? options.evolutions : [],
    offerIndex: 0, choices: [], commandId: globalThis.crypto.randomUUID(), levelShown: false,
    beforePokemon: options.before_state ? Engine.Pokemon.fromJSON(options.before_state) : null,
    afterPokemon: options.after_state ? Engine.Pokemon.fromJSON(options.after_state) : null,
    moves: (pokemon.moves || []).map(function (move) { return Engine.moveFromJSON(move.toJSON()); })
  };
  if (experienceAward && activeAuthoritativeTrainingResolution.beforePokemon) {
    activeAuthoritativeTrainingResolution.gainedExp = experienceAward.exp;
    activeAuthoritativeTrainingResolution.beforePokemon.expCurrent = Math.max(0,
      activeAuthoritativeTrainingResolution.beforePokemon.expCurrent - experienceAward.exp);
  }
  openNextAuthoritativeTrainingChoice();
}

export function openAuthoritativeOrdinaryProgression() {
  if (authoritativeExpPresentation) {
    openNextAuthoritativeExpAward(authoritativeExpPresentation.scene, authoritativeExpPresentation.onComplete);
    return;
  }
  if (!state.ordinaryProgression) { finishAuthoritativeOrdinaryProgression(); return; }
  resumeAuthoritativeOrdinaryChoices();
}

export function resumeAuthoritativeOrdinaryProgression() {
  holdDialogContent();
  var waitingDialog = state.dialog;
  return readAuthoritativeOrdinaryProgression().then(function (result) {
    if (!result.ok || !result.projection || !result.projection.player_state) { return false; }
    applyAuthoritativeBattlePlayerState(result.projection.player_state);
    if (!state.ordinaryProgression) { return false; }
    openAuthoritativeOrdinaryProgression();
    return true;
  }).finally(function () {
    if (waitingDialog && state.dialog === waitingDialog && waitingDialog.pending) {
      state.dialog = null;
      renderDialogLayer();
    }
  });
}

function openNextAuthoritativeTrainingChoice() {
  var session = activeAuthoritativeTrainingResolution;
  var offer;
  var moveIndex;
  var knownSlot;
  if (!session) { return; }
  if (!session.levelShown && session.beforePokemon && session.afterPokemon) {
    var lines = [textDescriptor("messages.progression.levelReached", { pokemon: pokemonNameDescriptor(session.pokemon), level: session.afterPokemon.level })];
    if (session.gainedExp) {
      lines.unshift(textDescriptor("ui.dialogs.experienceSentence", { pokemon: pokemonNameDescriptor(session.pokemon), experience: session.gainedExp }));
    }
    state.dialog = { type: "level-up", pokemonName: session.pokemon.name,
      title: session.gainedExp ? textDescriptor("ui.dialogs.experienceGained") : null,
      resultLines: lines,
      beforePokemon: session.beforePokemon, afterPokemon: session.afterPokemon,
      continueAction: "authoritative-progression-level-continue" };
    renderDialogLayer();
    return;
  }
  while (session.offerIndex < session.offers.length) {
    offer = session.offers[session.offerIndex];
    moveIndex = Number(offer.move_index);
    knownSlot = session.moves.findIndex(function (move) { return Number(move.index) === moveIndex; });
    if (knownSlot !== -1) {
      session.choices.push({ offerIndex: session.offerIndex, moveIndex: moveIndex, replacementSlot: null });
      session.offerIndex += 1;
      continue;
    }
    if (session.moves.length < 4) {
      session.choices.push({ offerIndex: session.offerIndex, moveIndex: moveIndex, replacementSlot: null });
      session.moves.push(progressionMove(offer));
      session.offerIndex += 1;
      continue;
    }
    state.dialog = { type: "training-move-resolution", pokemon: progressionPokemon(session.pokemon, session.moves),
      move: progressionMove(offer), moves: session.moves.slice() };
    renderDialogLayer();
    return;
  }
  if (session.evolutions.length) {
    state.dialog = { type: "training-evolution-resolution", pokemonName: session.pokemon.name,
      targets: session.evolutions.map(function (entry) { return trainingEvolutionTarget(entry.target_species_key, session.pokemon); }) };
    renderDialogLayer();
    return;
  }
  submitAuthoritativeTrainingResolution(null);
}

function resumeAuthoritativeTrainingChoices() {
  var resolution = authoritativeTrainingResolution();
  var pokemon;
  var options;
  if (!resolution) { finishAuthoritativeTrainingProgression(); return; }
  pokemon = pokemonByInstanceId(resolution.pokemon_instance_id);
  if (!pokemon) {
    openMessage([battleText("rewardPokemonMissing")], { title: battleTitle("training") });
    return;
  }
  options = resolution.options || {};
  activeAuthoritativeTrainingResolution = {
    source: "training", resolution: resolution, pokemon: pokemon,
    offers: Array.isArray(options.level_moves) ? options.level_moves : [],
    evolutions: Array.isArray(options.evolutions) ? options.evolutions : [],
    offerIndex: 0, choices: [], commandId: globalThis.crypto.randomUUID(), levelShown: false,
    beforePokemon: options.before_state ? Engine.Pokemon.fromJSON(options.before_state) : null,
    afterPokemon: options.after_state ? Engine.Pokemon.fromJSON(options.after_state) : null,
    moves: (pokemon.moves || []).map(function (move) { return Engine.moveFromJSON(move.toJSON()); })
  };
  openNextAuthoritativeTrainingChoice();
}

export function openAuthoritativeTrainingProgression() {
  var progression = state.trainingProgression;
  var maxLevelsPerPokemon;
  var entries;
  if (!progression) { finishAuthoritativeTrainingProgression(); return; }
  if (progression.status === "awaiting_choices") {
    if (!activeAuthoritativeTrainingResolution
      || activeAuthoritativeTrainingResolution.resolution !== authoritativeTrainingResolution()) {
      resumeAuthoritativeTrainingChoices();
    }
    return;
  }
  // The allocation and its following choices share an id. Only preserve an
  // interactive allocation, never the held popup from the completed request.
  if (state.dialog && state.dialog.type === "training-level-assignment" && state.dialog.authoritative
    && state.dialog.progressionId === progression.id && !state.dialog.pending) { return; }
  maxLevelsPerPokemon = Math.max(1, Math.floor(Number(progression.max_levels_per_pokemon) || MAX_TRAINING_LEVELS_PER_POKEMON));
  entries = (progression.eligible_pokemon || []).map(function (eligible) {
    var pokemon = pokemonByInstanceId(eligible.pokemon_instance_id);
    return pokemon ? { pokemon: pokemon, pokemonInstanceId: eligible.pokemon_instance_id,
      assigned: 0, maxAssignable: Math.min(maxLevelsPerPokemon, Number(eligible.max_assignable) || 0),
      disabledReason: Number(eligible.max_assignable) > 0 ? "" : battleTextNow("badgeCap") } : null;
  }).filter(Boolean);
  state.dialog = {
    type: "training-level-assignment", authoritative: true, progressionId: progression.id,
    commandId: globalThis.crypto.randomUUID(), totalLevels: Number(progression.assignable_levels) || 0,
    lines: trainingRewardLines({ fullReward: progression.reward_kind === "daily", battlePoints: Number(progression.battle_points_awarded) || 0 },
      Number(progression.assignable_levels) || 0, maxLevelsPerPokemon),
    entries: entries
  };
  renderDialogLayer();
}

export function resumeAuthoritativeTrainingProgression(options) {
  options = options || {};
  if (authoritativeTrainingRecoveryPromise) { return authoritativeTrainingRecoveryPromise; }
  if (!options.silent) holdDialogContent();
  var waitingDialog = state.dialog;
  authoritativeTrainingRecoveryPromise = retryPendingAuthoritativeTrainingProgressionCommand().then(function (retry) {
    if (retry.pending && retry.ok && retry.projection && retry.projection.player_state) {
      applyAuthoritativeBattlePlayerState(retry.projection.player_state);
    } else if (retry.pending && !retry.ok && retry.uncertain) {
      if (!options.silent) { openMessage([battleFailure("rewardRecoveryFailed")], { title: battleTitle("training") }); }
      return null;
    }
    return readAuthoritativeTrainingProgression();
  }).then(function (result) {
    if (!result) { return false; }
    if (!result.ok || !result.projection || !result.projection.player_state) {
      if (!options.silent) { openMessage([battleFailure("rewardRecoveryFailed")], { title: battleTitle("training") }); }
      return false;
    }
    applyAuthoritativeBattlePlayerState(result.projection.player_state);
    if (!state.trainingProgression) { return false; }
    setScene({ name: "training-zone", trainingDifficulty: state.trainingProgression.difficulty || "" }, { history: "replace" });
    openAuthoritativeTrainingProgression();
    return true;
  }).finally(function () {
    authoritativeTrainingRecoveryPromise = null;
    if (!options.silent && waitingDialog && state.dialog === waitingDialog && waitingDialog.pending) {
      state.dialog = null;
      renderDialogLayer();
    }
  });
  return authoritativeTrainingRecoveryPromise;
}

function setBattleAnimationLock(locked) {
  state._battleAnimationLock = locked;
}

export function hpSnapshot(scene) {
  var snap = {};
  (scene.playerTeam.combatantList || []).forEach(function (c, i) {
    snap["p_" + i] = c.hp;
  });
  (scene.enemyTeam.combatantList || []).forEach(function (c, i) {
    snap["e_" + i] = c.hp;
  });
  return snap;
}

function snapshotChanged(fromSnapshot, toSnapshot) {
  return Object.keys(toSnapshot).some(function (key) {
    return fromSnapshot[key] !== toSnapshot[key];
  });
}

function hpBarForKey(key, sceneOverride) {
  var parts = key.split("_");
  var side = parts[0];
  var index = parseInt(parts[1], 10);
  var scene = sceneOverride || state.scene;
  var team = side === "p" ? scene.playerTeam : scene.enemyTeam;
  var combatant = team && team.combatantList ? team.combatantList[index] : null;
  var visualSide = scene.adminBattle ? (side === "p" ? "enemy" : "own") : (side === "p" ? "own" : "enemy");
  var container = document.querySelector('[data-battle-hp-team="' + visualSide + '"][data-battle-hp-index="' + index + '"]');
  var card = container && container.closest(".pokemon-card");
  return {
    fill: container ? container.querySelector(".hp-fill") : null,
    label: container ? container.querySelector(".hp-label") : null,
    vitals: card ? card.querySelector(".pokemon-card-vitals") : null,
    maxHp: combatant && combatant.pokemon ? combatant.pokemon.maxHp : 1,
    level: combatant && combatant.pokemon ? combatant.pokemon.level : 1
  };
}

function setHpBar(bar, hp, animate, duration) {
  var percent;
  if (!bar.fill) {
    return;
  }
  percent = Math.max(0, Math.min(100, (hp / bar.maxHp) * 100));
  bar.fill.style.transition = animate ? "width " + duration + "ms linear" : "none";
  bar.fill.classList.toggle("is-animating", Boolean(animate));
  bar.fill.style.width = percent + "%";
  if (bar.label) {
    bar.label.textContent = t("ui.battle.hpLabel", { hp: hp, maxHp: bar.maxHp });
  }
  if (bar.vitals) {
    bar.vitals.textContent = t("ui.battle.vitalsLabel", { level: bar.level, hp: hp });
  }
}

function hpAnimationDuration(bars) {
  var largestChange = bars.reduce(function (largest, entry) {
    return Math.max(largest, Math.abs(entry.toHp - entry.fromHp) / entry.bar.maxHp);
  }, 0);
  if (largestChange <= 0.25) { return 400; }
  if (largestChange <= 0.5) { return 700; }
  if (largestChange <= 0.75) { return 1000; }
  return 1300;
}

function animateHpStep(fromSnapshot, toSnapshot, sceneOverride) {
  return new Promise(function (resolve) {
    var bars;
    var duration;
    if (!state.scene || state.scene !== sceneOverride || ["battle", "admin-battle"].indexOf(state.scene.name) === -1
      || !snapshotChanged(fromSnapshot, toSnapshot)) {
      resolve();
      return;
    }

    bars = Object.keys(toSnapshot).filter(function (key) {
      return fromSnapshot[key] !== toSnapshot[key];
    }).map(function (key) {
      return { bar: hpBarForKey(key, sceneOverride), fromHp: fromSnapshot[key], toHp: toSnapshot[key] };
    }).filter(function (entry) {
      return entry.bar.fill;
    });

    if (!bars.length) {
      resolve();
      return;
    }

    bars.forEach(function (entry) { setHpBar(entry.bar, entry.fromHp, false); });
    duration = hpAnimationDuration(bars);
    window.requestAnimationFrame(function () {
      void bars[0].bar.fill.offsetWidth;
      window.requestAnimationFrame(function () {
        bars.forEach(function (entry) { setHpBar(entry.bar, entry.toHp, true, duration); });
        window.setTimeout(function () {
          bars.forEach(function (entry) { setHpBar(entry.bar, entry.toHp, false); });
          resolve();
        }, duration + 50);
      });
    });
  });
}

export function animateHpSequence(history, sceneOverride) {
  var promise = Promise.resolve();
  sceneOverride = sceneOverride || state.scene;
  if (history.length > 1) {
    Object.keys(history[0]).forEach(function (key) {
      setHpBar(hpBarForKey(key, sceneOverride), history[0][key], false);
    });
    void document.body.offsetWidth;
  }
  for (var i = 1; i < history.length; i++) {
    if (snapshotChanged(history[i - 1], history[i])) {
      (function (fromSnapshot, toSnapshot) {
        promise = promise.then(function () {
          return animateHpStep(fromSnapshot, toSnapshot, sceneOverride);
        });
      }(history[i - 1], history[i]));
    }
  }
  return promise;
}

registerAction("training-level-adjust", function (element) {
  adjustTrainingLevelAssignment(element);
});

registerAction("training-level-confirm", function () {
  confirmTrainingLevelAssignment();
});

registerAction("open-pending-training-progression", function () {
  resumeAuthoritativeTrainingProgression();
});

if (typeof window !== "undefined") {
  window.addEventListener("focus", function () {
    if (!state.activeBattle && !state.dialog && state.pendingActivity
      && state.pendingActivity.type === "training_progression") {
      resumeAuthoritativeTrainingProgression({ silent: true });
    }
  });
}

registerAction("open-pending-ordinary-progression", function () {
  resumeAuthoritativeOrdinaryProgression();
});

registerAction("authoritative-progression-level-continue", function () {
  if (!activeAuthoritativeTrainingResolution) { return; }
  activeAuthoritativeTrainingResolution.levelShown = true;
  state.dialog = null;
  openNextAuthoritativeTrainingChoice();
});

registerAction("training-resolution-replace-move", function (element) {
  var session = activeAuthoritativeTrainingResolution;
  var slot = Math.floor(Number(element.dataset.index));
  var offer;
  var moveIndex;
  if (!session || slot < 0 || slot > 3) { return; }
  offer = session.offers[session.offerIndex];
  moveIndex = Number(offer.move_index);
  confirmMoveForget(slot, function () {
    if (activeAuthoritativeTrainingResolution !== session) return;
    session.choices.push({ offerIndex: session.offerIndex, moveIndex: moveIndex, replacementSlot: slot });
    session.moves[slot] = progressionMove(offer);
    session.offerIndex += 1;
    state.dialog = null;
    openNextAuthoritativeTrainingChoice();
  });
});

registerAction("training-resolution-decline-move", function () {
  var session = activeAuthoritativeTrainingResolution;
  var offer;
  if (!session) { return; }
  offer = session.offers[session.offerIndex];
  session.choices.push({ offerIndex: session.offerIndex, moveIndex: Number(offer.move_index), replacementSlot: null });
  session.offerIndex += 1;
  state.dialog = null;
  openNextAuthoritativeTrainingChoice();
});

registerAction("training-resolution-choose-evolution", function (element) {
  submitAuthoritativeTrainingResolution(String(element.dataset.speciesKey || ""));
});

registerAction("training-resolution-decline-evolution", function () {
  submitAuthoritativeTrainingResolution(null);
});

registerAction("battle-move", function (element) {
  runBattleRuntimeAction(function () {
    performBattleMove(element);
  });
});

function performBattleMove(element) {
  var battleScene = state.scene;
  var capturedBattleMoveEvents;
  var eventData;
  if (battleScene && battleScene.battleDome) {
    battleScene.authoritativeCommandPending = true;
    render({ preserveScroll: true });
    import("./battle-dome-handler.js").then(function (module) {
      module.runBattleDomeCommand(battleScene, "move", { moveSlot: Number(element.dataset.index) });
    });
    return;
  }
  if (battleScene && battleScene.authoritativeBattle) {
    authoritativeBattleCommand(battleScene, function (input) {
      return submitAuthoritativeBattleMove(Object.assign(input, { moveSlot: Number(element.dataset.index) }));
    });
    return;
  }
  if (sceneAllowsBallUse(battleScene)) {
    openMessage([battleText("captureDirectOnly")], { title: battleTitle("capture") });
    return;
  }
  if (battleScene.manager.battleOver) {
    return;
  }
  var moveIndex = Number(element.dataset.index);
  var moveEntry = battleScene.playerTeam.getActive().moveStates[moveIndex];
  if (!moveEntry || !moveEntry.enabled) {
    return;
  }

  var hpHistory = [hpSnapshot(battleScene)];
  var origExec = battleScene.manager.executeMove;
  battleScene.manager.executeMove = function (attacker, defender, move) {
    origExec.call(battleScene.manager, attacker, defender, move);
    hpHistory.push(hpSnapshot(battleScene));
  };

  try {
    if (sceneIsAdminControlled(battleScene)) {
      capturedBattleMoveEvents = [];
      battleScene.manager.playerUseMove(moveEntry.move);
    } else {
      capturedBattleMoveEvents = captureNpcEventsDuring(battleScene, function () {
        battleScene.manager.playerUseMove(moveEntry.move);
      });
    }
  } finally {
    battleScene.manager.executeMove = origExec;
  }

  eventData = { actor: "player", moveIndex: moveIndex };
  if (battleScene.manager.lastPlayerResolvedMoveIndex && battleScene.manager.lastPlayerResolvedMoveIndex !== moveEntry.move.index) {
    eventData.resolvedMoveIndex = battleScene.manager.lastPlayerResolvedMoveIndex;
  }
  if (battleScene.manager.lastPlayerResolvedType) {
    eventData.resolvedType = battleScene.manager.lastPlayerResolvedType;
  }
  if (battleScene.manager.lastPlayerActionSkipped) {
    eventData.skipped = true;
  }
  appendBattleEvents(battleScene, [{
    eventType: "move",
    eventData: eventData
  }].concat(capturedBattleMoveEvents));
  notifyAdminIfWaiting(battleScene);

  if (hpHistory.length > 1 && hpHistory.some(function (s, i) { return i > 0 && snapshotChanged(hpHistory[i - 1], s); })) {
    setBattleAnimationLock(true);
    render({ scrollBattleLogToBottom: true });
    animateHpSequence(hpHistory).then(function () {
      setBattleAnimationLock(false);
      showBattleFollowup(battleScene);
    });
  } else {
    showBattleFollowup(battleScene);
  }
}

registerAction("battle-info-tab", function (element) {
  setBattleInfoPanel(element.dataset.panel);
});

registerAction("battle-bottom-tab", function (element) {
  setBattleBottomPanel(element.dataset.panel);
});

registerAction("battle-abandon-open", function () {
  var container = root.querySelector("[data-battle-abandon-inline]");
  if (!container) {
    return;
  }
  setHtml(container, [
    '<p class="battle-abandon-confirm-text">' + battleTextNow("abandonQuestion") + '</p>',
    button(battleTextNow("buttons.yes"), "battle-abandon-confirm", "", "button-danger button-slim"),
    button(battleTextNow("buttons.no"), "battle-abandon-cancel", "", "button-dark button-slim")
  ].join(""));
});

registerAction("battle-abandon-cancel", function () {
  var container = root.querySelector("[data-battle-abandon-inline]");
  if (!container) {
    return;
  }
  setHtml(container, button(battleTextNow("buttons.abandon"), "battle-abandon-open", "", "button-danger button-slim"));
});

registerAction("battle-abandon-confirm", function () {
  if (state.scene && state.scene.battleDome) {
    import("./battle-dome-handler.js").then(function (module) { module.abandonCurrentBattleDome(state.scene); });
    return;
  }
  runBattleRuntimeAction(function () {
    abandonBattleAndExit(state.scene);
  });
});

registerAction("battle-switch", function (element) {
  handleBattleSwitch(Number(element.dataset.index), null, element);
});

registerAction("battle-item-use", function (element) {
  runBattleRuntimeAction(function () {
    performBattleItemUse(element);
  });
});

function playerMustChooseBattleReplacement(scene) {
  return Boolean(scene && scene.manager && (scene.manager.playerNeedsSwitch || scene.manager.playerPostMoveSwitch) && !scene.manager.battleOver);
}

function showBattleReplacementRequiredMessage() {
  openMessage([battleText("sendPokemonFirst")], { title: battleTitle("battle") });
}

function performBattleItemUse(element) {
  if (!state || !state.scene || ["battle", "battle-dome-battle"].indexOf(state.scene.name) === -1) {
    openMessage([battleText("itemBattleOnly")], { title: battleTitle("bag") });
    return;
  }
  if (state.scene.manager.battleOver) {
    return;
  }
  if (playerMustChooseBattleReplacement(state.scene)) {
    showBattleReplacementRequiredMessage();
    return;
  }

  var itemIndex = Number(element.dataset.itemIndex);
  var battleItem = getInventoryItemByIndex(inventoryForBattleEvent(state.scene, "player"), itemIndex);
  if (!battleItem || (battleItem.quantity || 0) <= 0) {
    openMessage([battleText("itemUnavailable")], { title: battleTitle("bag") });
    return;
  }

  if (battleItem.category === ItemCategory.Ball) {
    if (!sceneAllowsBallUse(state.scene)) {
      openMessage([battleText("noBallsAgainstTrainer")], { title: itemNameDescriptor(battleItem) });
      return;
    }
    attemptCaptureWithBall(state.scene, battleItem);
    return;
  }

  if (state.scene.manager.itemNeedsPokemonTarget(battleItem)) {
    var targetEntries = buildBattleItemTargetEntries(state.scene, battleItem);
    if (!targetEntries.some(function (entry) { return entry && entry.selectable; })) {
      openBattleTargetPanel(element, battleItem, targetEntries);
      return;
    }
    if (battleItemUseLimitReached(state.scene, battleItem)) {
      openBattleTargetPanel(element, battleItem, [], null, battleItemUseLimitMessage(battleItem));
      return;
    }
    openBattleTargetPanel(element, battleItem, targetEntries);
    return;
  }

  var capturedBattleItemEvents;
  var itemEventData;
  var useResult;
  var itemValidation = state.scene.manager.canUseItemOnTarget(battleItem, null);
  if (!itemValidation.ok && battleItem.subcategory === ItemSubcategory.Weather) {
    openBattleTargetPanel(element, battleItem, [], null, itemValidation.message);
    return;
  }
  if (battleItemUseLimitReached(state.scene, battleItem)) {
    openBattleTargetPanel(element, battleItem, [], null, battleItemUseLimitMessage(battleItem));
    return;
  }
  if (state.scene.authoritativeBattle) {
    closeBattleTargetPanel();
    window.scrollTo(0, 0);
    if (state.scene.battleDome) {
      state.scene.authoritativeCommandPending = true;
      render({ preserveScroll: true });
      import("./battle-dome-handler.js").then(function (module) {
        module.runBattleDomeCommand(state.scene, "item", { itemIndex: battleItem.index, targetSlot: null });
      });
      return;
    }
    authoritativeBattleCommand(state.scene, function (input) {
      return useAuthoritativeBattleItem(Object.assign(input, { itemIndex: battleItem.index, targetSlot: null }));
    });
    return;
  }
  if (sceneIsAdminControlled(state.scene)) {
    capturedBattleItemEvents = [];
    useResult = state.scene.manager.playerUseItem(battleItem, null);
  } else {
    capturedBattleItemEvents = captureNpcEventsDuring(state.scene, function () {
      useResult = state.scene.manager.playerUseItem(battleItem, null);
    });
  }
  if (!useResult.ok) {
    openMessage([resolveBattleEvent(useResult.event, state.scene) || battleText("unusable")], { title: itemNameDescriptor(battleItem) });
    return;
  }

  if (useResult.itemConsumed !== false) {
    consumePlayerBattleInventoryItem(state.scene, battleItem.index);
  }
  itemEventData = { actor: "player", itemIndex: battleItem.index, targetIndex: null };
  if (useResult.actionSkipped) {
    itemEventData.skipped = true;
  }
  appendBattleEvents(state.scene, [{
    eventType: "item",
    eventData: itemEventData
  }].concat(capturedBattleItemEvents));
  notifyAdminIfWaiting(state.scene);
  markDirty();
  closeBattleTargetPanel();
  showBattleFollowup(state.scene);
  window.scrollTo(0, 0);
}

registerAction("battle-item-target", function (element) {
  runBattleRuntimeAction(function () {
    performBattleItemTarget(element);
  });
});

function performBattleItemTarget(element) {
  if (!state || !state.scene || ["battle", "battle-dome-battle"].indexOf(state.scene.name) === -1 || !state.battleTargetPanel.visible) {
    return;
  }
  if (playerMustChooseBattleReplacement(state.scene)) {
    closeBattleTargetPanel();
    showBattleReplacementRequiredMessage();
    return;
  }

  var selectedItemIndex = Number(element.dataset.itemIndex || state.battleTargetPanel.itemIndex);
  var selectedItem = getInventoryItemByIndex(inventoryForBattleEvent(state.scene, "player"), selectedItemIndex);
  var targetIndex = Number(element.dataset.index);
  var targetCombatant = state.scene.playerTeam.combatantList[targetIndex];
  if (!selectedItem || !targetCombatant) {
    return;
  }

  if (battleItemUseLimitReached(state.scene, selectedItem)) {
    showBattleTargetPanelEmptyMessage(battleItemUseLimitMessage(selectedItem));
    return;
  }

  if (state.scene.authoritativeBattle) {
    closeBattleTargetPanel();
    window.scrollTo(0, 0);
    if (state.scene.battleDome) {
      state.scene.authoritativeCommandPending = true;
      render({ preserveScroll: true });
      import("./battle-dome-handler.js").then(function (module) {
        module.runBattleDomeCommand(state.scene, "item", {
          itemIndex: selectedItem.index,
          targetSlot: targetCombatant.pokemon.authoritativeSlot
        });
      });
      return;
    }
    authoritativeBattleCommand(state.scene, function (input) {
      return useAuthoritativeBattleItem(Object.assign(input, {
        itemIndex: selectedItem.index,
        targetSlot: targetCombatant.pokemon.authoritativeSlot
      }));
    });
    return;
  }

  var capturedBattleTargetEvents;
  var targetEventData;
  var targetResult;
  if (sceneIsAdminControlled(state.scene)) {
    capturedBattleTargetEvents = [];
    targetResult = state.scene.manager.playerUseItem(selectedItem, targetCombatant);
  } else {
    capturedBattleTargetEvents = captureNpcEventsDuring(state.scene, function () {
      targetResult = state.scene.manager.playerUseItem(selectedItem, targetCombatant);
    });
  }
  if (!targetResult.ok) {
    openMessage([resolveBattleEvent(targetResult.event, state.scene) || battleText("unusable")], { title: itemNameDescriptor(selectedItem) });
    return;
  }

  if (targetResult.itemConsumed !== false) {
    consumePlayerBattleInventoryItem(state.scene, selectedItem.index);
  }
  targetEventData = { actor: "player", itemIndex: selectedItem.index, targetIndex: targetIndex };
  if (targetResult.actionSkipped) {
    targetEventData.skipped = true;
  }
  appendBattleEvents(state.scene, [{
    eventType: "item",
    eventData: targetEventData
  }].concat(capturedBattleTargetEvents));
  notifyAdminIfWaiting(state.scene);
  markDirty();
  closeBattleTargetPanel();
  showBattleFollowup(state.scene);
  window.scrollTo(0, 0);
}

registerAction("battle-target-close", function () {
  closeBattleTargetPanel();
});

registerAction("battle-start-target", function (element) {
  var index = Number(element.dataset.index);
  var callback = battleStartTargetPanelCallback;
  closeBattleStartTargetPanel();
  if (typeof callback === "function") {
    callback(index);
  }
});

registerAction("battle-start-target-close", function () {
  closeBattleStartTargetPanel();
});

registerAction("battle-entry-choice-pick", function (element) {
  var scene = state.scene;
  var panel = scene && scene.battleEntryChoicePanel;
  var index = Number(element.dataset.index);
  if (!panel || typeof panel.onPick !== "function" || !Number.isInteger(index)) {
    return;
  }
  scene.battleEntryChoicePanel = null;
  render();
  panel.onPick(index);
});

registerAction("battle-entry-choice-cancel", function () {
  var scene = state.scene;
  if (!scene || !scene.battleEntryChoicePanel || !scene.battleEntryChoicePanel.canCancel) {
    return;
  }
  scene.battleEntryChoicePanel = null;
  render();
});

registerAction("open-active-battle", function () {
  if (openActiveProgressionScene()) {
    return;
  }
  refreshActiveBattleFromDb({ open: true });
});

function battleLockExitScene(scene) {
  if (!scene) {
    return null;
  }
  if (scene.name === "training-zone") {
    return { name: "battle-area" };
  }
  if (scene.name === "pokemon-center") {
    return { name: "city" };
  }
  if (scene.name === "capture") {
    return { name: "zones" };
  }
  return null;
}

function battleLockMessage(scene) {
  return battleText("activeActivity");
}

export function openActiveProgressionScene() {
  var scene = activeProgressionScene();
  if (!scene || scene.name !== "battle") {
    return false;
  }
  setScene(scene, { history: "replace" });
  resumeActiveProgressionDialog();
  return true;
}

export function handleBattleRuntimeChange() {
  if (state.battleStartPending) {
    return;
  }
  if (enforceBattleRuntimeSceneLock()) {
    return;
  }
  if (state.scene && ["battle", "battle-restore", "login", "starter"].indexOf(state.scene.name) === -1) {
    render();
  }
}

function showBattleRuntimeLostMessage() {
  clearBattleRuntimeOwnership();
  setScene({ name: "home" }, { history: "replace" });
  openMessage([
    battleText("battleElsewhere")
  ], { title: battleTitle("battle"), closeLabel: "Ok", closeClass: "button-primary" });
}

function runBattleRuntimeAction(action) {
  if (!state.scene || ["battle", "battle-dome-battle"].indexOf(state.scene.name) === -1) {
    return false;
  }
  if (state._battleAnimationLock) {
    return true;
  }
  if (state.scene.battleHistoryView || state.scene.battleHistoryLoading) return false;
  action();
  return true;
}

export function blockActionDuringBattle(lines, options) {
  if (!isBattleRuntimeActive()) {
    return false;
  }
  openMessage(lines, options || {});
  return true;
}

export function battleTypeForCapture(zoneName) {
  return "capture_" + String(zoneName || "");
}

function battleTypeForTraining(difficulty) {
  return "training_" + String(difficulty || "");
}

export function battleTypeForGym(cityKey) {
  return "gym_" + String(cityKey || "");
}

function sceneIsAdminControlled(scene) {
  return Boolean(scene && scene.manager && (scene.manager.opponentIsExternallyControlled()
    || scene.adminControlled || isAdminControlledBattleType(scene.battleType || scene.manager.battleType)));
}

function battleTypeRequiresAdminEntryChoice(battleType) {
  return String(battleType || "") === "kanto_league_champion";
}

function sceneRequiresAdminEntryChoice(scene) {
  return sceneIsAdminControlled(scene) && battleTypeRequiresAdminEntryChoice(scene.battleType || (scene.manager && scene.manager.battleType));
}

function sceneHasPendingAdminEntryChoice(scene) {
  return sceneRequiresAdminEntryChoice(scene) && Boolean(scene.pendingAdminEntryChoice);
}

function sceneNeedsInitialPlayerEntryChoice(scene) {
  return sceneRequiresAdminEntryChoice(scene)
    && !scene.pendingAdminEntryChoice
    && !scene.initialEntryCompleted
    && scene.manager
    && scene.manager.waitingFor === "player"
    && !scene.manager.battleOver;
}

function normalizedBattleWaitingFor(value) {
  return value === "admin" ? "admin" : "player";
}

function waitingForFirstActor(firstActor) {
  return firstActor === "admin" || firstActor === "npc" || firstActor === "enemy" ? "admin" : "player";
}

function initialAdminBattleWaitingFor(battle, initialState) {
  var firstActor = battle && battle.first_actor || initialState && initialState.firstActor || "player";
  return waitingForFirstActor(firstActor);
}

function sceneUsesNpcItems(scene) {
  var battleType = String(scene && (scene.battleType || scene.manager && scene.manager.battleType) || "");
  return sceneIsAdminControlled(scene) || battleType.indexOf("training_") === 0 || battleType.indexOf("gym_") === 0;
}

function battleItemUseLimitReached(scene, item) {
  var itemKey = item && item.key ? String(item.key) : "";
  var usedItems = scene && scene.manager && scene.manager.usedItems ? scene.manager.usedItems : {};
  if (!itemKey || item.category === ItemCategory.Ball) {
    return false;
  }
  return (Number(usedItems[itemKey]) || 0) >= BATTLE_ITEM_USE_LIMIT;
}

function battleItemUseLimitMessage(item) {
  return battleText("itemUseLimit", { item: itemNameDescriptor(item) });
}

function attemptCaptureWithBall(scene, ballItem) {
  var wildCombatant = scene && scene.enemyTeam ? scene.enemyTeam.getActive() : null;
  var wildPokemon = wildCombatant && wildCombatant.pokemon;
  if (!wildPokemon) {
    openMessage([battleText("noWildTarget")], { title: itemNameDescriptor(ballItem) });
    return;
  }
  window.scrollTo(0, 0);
  authoritativeBattleCommand(scene, function (input) {
    return useAuthoritativeBattleBall(Object.assign(input, {
      itemIndex: ballItem.index,
      targetSlot: wildCombatant.pokemon.authoritativeSlot
    }));
  });
}

function syncAdminControlledScene(scene) {
  var battleType;
  var adminControlled;
  if (!scene || !scene.manager) {
    return;
  }
  battleType = scene.battleType || scene.manager.battleType;
  adminControlled = isAdminControlledBattleType(battleType);
  scene.adminControlled = adminControlled;
  scene.manager.adminControlled = adminControlled;
  scene.manager.opponentControl = scene.battleDome ? "player" : adminControlled ? "admin" : "automatic";
}

function createAdminBattleItems() {
  return ADMIN_BATTLE_ITEMS.map(function (entry) {
    return [Number(entry[0]), Number(entry[1])];
  });
}

function createNpcBattleItems(battleType) {
  var type = String(battleType || "");
  if (type.indexOf("training_") === 0) {
    return authoritativeNpcItemsForBattle({ contractKey: "training", trainingDifficulty: type.slice("training_".length) });
  }
  if (type.indexOf("gym_") === 0) {
    return authoritativeNpcItemsForBattle({ contractKey: "gym", gymKey: type.slice("gym_".length) });
  }
  return [];
}

function notifyAdminIfWaiting(scene) {
  if (!sceneIsAdminControlled(scene) || !scene.manager || scene.manager.waitingFor !== "admin" || scene.manager.battleOver) {
    return;
  }
  // Discord notification is handled by the Supabase DB trigger.
}

function clearActiveBattleRealtime() {
  var client = getSupabaseClient();
  if (client && activeBattleRealtimeChannel) {
    client.removeChannel(activeBattleRealtimeChannel);
  }
  activeBattleRealtimeChannel = null;
  activeAuthoritativeRealtimeRefresh = null;
  activeAuthoritativeRealtimeDirty = false;
  activeAuthoritativeRealtimeDeferred = false;
  activeAuthoritativeRealtimeGeneration += 1;
}

function authoritativePresentationActive(scene) {
  return Boolean(scene && (scene.authoritativeCommandPending || state._battleAnimationLock));
}

function refreshDeferredAuthoritativeScene(scene, resetScroll) {
  if (!activeAuthoritativeRealtimeDeferred || !scene || state.scene !== scene || !scene.authoritativeBattleId) {
    return;
  }
  activeAuthoritativeRealtimeDeferred = false;
  refreshAuthoritativeSceneFromNotification(scene, String(scene.authoritativeBattleId), activeAuthoritativeRealtimeGeneration, resetScroll);
}

function refreshAuthoritativeSceneFromNotification(scene, battleId, generation, resetScroll) {
  var limit = 100;
  var latestProjection = null;
  if (authoritativePresentationActive(scene)) {
    activeAuthoritativeRealtimeDeferred = true;
    return Promise.resolve(null);
  }
  function readPage() {
    var afterSeq = Number(scene.authoritativeLastEventSeq) || 0;
    return getAuthoritativeBattle(battleId, { afterSeq: afterSeq, limit: limit }).then(function (result) {
      var events = result.events || [];
      var incomingVersion;
      var currentVersion;
      if (generation !== activeAuthoritativeRealtimeGeneration || state.scene !== scene
        || String(scene.authoritativeBattleId || "") !== battleId) { return result; }
      if (result.ok && !result.battle) {
        setActiveBattleMeta(null);
        setScene(battleReturnScene(scene), { history: "replace" });
        return result;
      }
      if (!result.ok) {
        state.saveStatus = { state: "error", message: battleFailure("updateFailed") };
        return result;
      }
      if (authoritativePresentationActive(scene)) {
        activeAuthoritativeRealtimeDeferred = true;
        return result;
      }
      incomingVersion = Number(result.battle.battle_version) || 0;
      currentVersion = Number(scene.authoritativeBattleVersion) || 0;
      if (incomingVersion >= currentVersion) {
        if (result.projection && result.projection.player_state) {
          applyAuthoritativeBattlePlayerState(result.projection.player_state);
        }
        state.authoritativeRevision = Math.max(Number(state.authoritativeRevision) || 0, Number(result.playerRevision) || 0);
        broadcastAuthoritativeRevision(state.authoritativeRevision);
        if (result.projection && result.projection.league_state) {
          state.authoritativeLeagueState = result.projection.league_state;
        }
        latestProjection = result.projection;
        applyAuthoritativeProjection(scene, result.battle, events);
      } else {
        appendAuthoritativeEventLines(scene, events);
      }
      if (events.length === limit && scene.authoritativeLastEventSeq > afterSeq) { return readPage(); }
      return result;
    });
  }
  return readPage().then(function (result) {
    if (generation === activeAuthoritativeRealtimeGeneration && state.scene === scene) {
      if (authoritativePresentationActive(scene)) {
        activeAuthoritativeRealtimeDeferred = true;
        return result;
      }
      render({ preserveScroll: resetScroll ? false : true, scrollBattleLogToBottom: true });
      handleAuthoritativeBattleTerminal(scene, latestProjection);
    }
    return result;
  });
}

function syncActiveBattleRealtime(scene) {
  var client = getSupabaseClient();
  var userId = state.auth && state.auth.user ? String(state.auth.user.id || "") : "";
  if (!client || !userId || activeBattleRealtimeChannel) {
    return;
  }
  if (scene && scene.authoritativeBattleId) {
    var battleId = String(scene.authoritativeBattleId);
    var generation = ++activeAuthoritativeRealtimeGeneration;
    function refreshFromAuthoritativeNotification() {
      if (authoritativePresentationActive(scene)) {
        activeAuthoritativeRealtimeDeferred = true;
        return;
      }
      if (activeAuthoritativeRealtimeRefresh) { activeAuthoritativeRealtimeDirty = true; return; }
      function drainNotifications() {
        activeAuthoritativeRealtimeDirty = false;
        return refreshAuthoritativeSceneFromNotification(scene, battleId, generation).then(function () {
          if (activeAuthoritativeRealtimeDirty && generation === activeAuthoritativeRealtimeGeneration) {
            return drainNotifications();
          }
        });
      }
      activeAuthoritativeRealtimeRefresh = drainNotifications().finally(function () {
        if (generation === activeAuthoritativeRealtimeGeneration) { activeAuthoritativeRealtimeRefresh = null; }
      });
    }
    activeBattleRealtimeChannel = client.channel("authoritative-battle-" + battleId).on("postgres_changes", {
      event: "UPDATE", schema: "public", table: "authoritative_battle", filter: "id=eq." + battleId
    }, refreshFromAuthoritativeNotification).on("postgres_changes", {
      event: "DELETE", schema: "public", table: "authoritative_battle"
    }, function (payload) {
      if (state.scene === scene && String(payload && payload.old && payload.old.id || "") === battleId) {
        setActiveBattleMeta(null);
        setScene(battleReturnScene(scene), { history: "replace" });
      }
    }).subscribe(function (status) {
      if (status === "SUBSCRIBED") {
        refreshFromAuthoritativeNotification();
      }
    });
    return;
  }
}

function createBattleDisplaySnapshot(scene) {
  var restored = Engine.restoreBattleManager(Engine.serializeBattleManager(
    scene.manager,
    Engine.createRngState(1),
    { playerItems: scene.playerInventory || [], includeDisplayHistory: true }
  ));
  var manager = restored.manager;
  var playerTeam = manager.playerTeam;
  var enemyTeam = manager.enemyTeam;
  return {
    name: "battle",
    battleType: scene.battleType,
    firstActor: scene.firstActor || manager.firstActor || "player",
    trainingBattle: scene.trainingBattle,
    trainingDifficulty: scene.trainingDifficulty,
    trainingConfig: scene.trainingConfig,
    trainingOpponent: scene.trainingOpponent ? normalizeTrainingOpponentProfile(scene.trainingOpponent) : null,
    trainingTrainerSprite: scene.trainingTrainerSprite,
    captureScene: scene.captureScene,
    playerTeam: playerTeam,
    enemyTeam: enemyTeam,
    manager: manager,
    adminControlled: scene.adminControlled,
    adminItems: scene.adminItems ? scene.adminItems.map(function (entry) { return entry.slice(); }) : [],
    isBattleDisplaySnapshot: true
  };
}

export function ensureFinalBattleDisplaySnapshot(scene) {
  if (!scene || !scene.manager || !scene.manager.battleOver) {
    return null;
  }
  if (!scene.finalBattleDisplayScene) {
    scene.finalBattleDisplayScene = createBattleDisplaySnapshot(scene);
  }
  return scene.finalBattleDisplayScene;
}

function initialStateForBattle(scene, battleType, firstActor) {
  return {
    firstActor: firstActor || scene.firstActor || (scene.manager && scene.manager.firstActor) || "player",
    playerName: scene.playerTeam && scene.playerTeam.name || state.playerName || state.auth.userLabel || "",
    playerActiveIndex: scene.playerTeam.activeIndex || 0,
    enemyActiveIndex: scene.enemyTeam.activeIndex || 0,
    enemyTeamName: scene.enemyTeam.name || "",
    pendingAdminEntryChoice: Boolean(scene.pendingAdminEntryChoice),
    initialEntryCompleted: Boolean(scene.initialEntryCompleted),
    trainingOpponent: scene.trainingBattle && scene.trainingOpponent ? normalizeTrainingOpponentProfile(scene.trainingOpponent) : null,
    missionEventKey: scene.missionEventKey || "",
    playerTeam: serializePokemonList(scene.playerTeam.pokemonList),
    enemyTeam: serializePokemonList(scene.enemyTeam.pokemonList),
    itemReturnSnapshots: scene.manager && scene.manager.itemReturnSnapshots ? scene.manager.itemReturnSnapshots.slice() : [],
    inventory: (state.inventory || []).map(function (entry) {
      return [Number(entry[0]), Number(entry[1])];
    }).filter(function (entry) {
      return Number.isFinite(entry[0]) && Number.isFinite(entry[1]) && entry[1] > 0;
    })
  };
}

function setActiveBattleMeta(meta, options) {
  state.activeBattle = meta || null;
  if (!meta) {
    clearActiveBattleRealtime();
    setBattleRuntimeActive(false);
    return;
  }
  if (options && options.ownsRuntime) {
    setBattleRuntimeActive(true);
    return;
  }
  setBattleRuntimeObserved(true);
}

export function appendBattleEvents(scene, events) {
  return Promise.resolve({ ok: true });
}

function expEventEntries(events) {
  return (events || []).filter(function (event) {
    return event && (event.event_type === "exp" || event.event_type === "exp_level");
  });
}

function aggregateBattleExpEvents(scene, events) {
  var byTarget = {};
  (events || []).forEach(function (event) {
    var targetIndex = event && event.winner && event.winner.team ? event.winner.team.combatantList.indexOf(event.winner) : -1;
    var defeatedLevel = event && event.defeated && event.defeated.pokemon ? Number(event.defeated.pokemon.level) : 0;
    var winnerLevel = event && event.winner && event.winner.pokemon ? Number(event.winner.pokemon.level) : 0;
    var value = Math.max(0, Math.floor(defeatedLevel) || 0) * expMultiplierForWinnerLevel(winnerLevel);
    if (!Number.isFinite(targetIndex) || targetIndex < 0 || value <= 0) {
      return;
    }
    if (!byTarget[targetIndex]) {
      byTarget[targetIndex] = { actor: "player", target_index: targetIndex, value: 0 };
    }
    byTarget[targetIndex].value += value;
  });
  return Object.keys(byTarget).map(function (key) {
    return byTarget[key];
  }).filter(function (entry) {
    return entry.value > 0 && scene.playerTeam.combatantList[entry.target_index];
  });
}

function trainingLevelAssignmentEntries(scene) {
  var levelLimit = Math.min(100, levelLimitForBadges(state.trainerInfo[2]));
  if (!scene || !scene.playerTeam) {
    return [];
  }
  return scene.playerTeam.combatantList.map(function (combatant, index) {
    var pokemon = combatant && combatant.pokemon;
    var maxAssignable;
    var disabledReason = battleTextNow("unavailable");
    if (!pokemon) {
      return null;
    }
    maxAssignable = Math.max(0, Math.min(
      MAX_TRAINING_LEVELS_PER_POKEMON,
      levelLimit - (Number(pokemon.level) || 0),
      100 - (Number(pokemon.level) || 0)
    ));
    if (maxAssignable > 0) {
      disabledReason = "";
    } else if ((Number(pokemon.level) || 0) >= 100) {
      disabledReason = battleTextNow("level100");
    } else {
      disabledReason = battleTextNow("badgeCap");
    }
    return {
      pokemon: pokemon,
      targetIndex: index,
      assigned: 0,
      maxAssignable: maxAssignable,
      disabledReason: disabledReason
    };
  }).filter(Boolean);
}

function trainingLevelAssignmentTotalAssigned(dialog) {
  return (dialog && dialog.entries || []).reduce(function (sum, entry) {
    return sum + Math.max(0, Math.floor(Number(entry.assigned) || 0));
  }, 0);
}

function trainingLevelAssignmentRemaining(dialog) {
  return Math.max(0, Math.floor(Number(dialog && dialog.totalLevels) || 0) - trainingLevelAssignmentTotalAssigned(dialog));
}

function trainingLevelAssignmentCanAssignMore(dialog) {
  return trainingLevelAssignmentRemaining(dialog) > 0 && (dialog && dialog.entries || []).some(function (entry) {
    return entry && entry.assigned < entry.maxAssignable;
  });
}

function trainingLevelAssignmentReady(dialog) {
  return trainingLevelAssignmentRemaining(dialog) <= 0 || !trainingLevelAssignmentCanAssignMore(dialog);
}

function trainingLevelAssignmentPayloads(dialog) {
  return (dialog && dialog.entries || []).map(function (entry) {
    if (dialog.authoritative) {
      return { pokemonInstanceId: entry.pokemonInstanceId, levels: Math.max(0, Math.floor(Number(entry.assigned) || 0)) };
    }
    return {
      actor: "player",
      target_index: entry.targetIndex,
      value: Math.max(0, Math.floor(Number(entry.assigned) || 0))
    };
  }).filter(function (entry) {
    return (dialog.authoritative ? entry.levels : entry.value) > 0;
  });
}

function trainingRewardPreview(difficulty) {
  var dailyState = state.trainingDaily && state.trainingDaily[difficulty];
  var fullReward = !(dailyState && dailyState.claimedToday);
  var reward = trainingRewardForBadges(state.trainerInfo[2], difficulty, fullReward);
  return {
    fullReward: fullReward,
    money: reward.money,
    levels: reward.levels
  };
}

function trainingRewardLines(reward, assignableLevels, maxLevelsPerPokemon) {
  maxLevelsPerPokemon = Math.max(1, Math.floor(Number(maxLevelsPerPokemon) || MAX_TRAINING_LEVELS_PER_POKEMON));
  var lines = [battleText("trainingWon")];
  if (reward && Object.prototype.hasOwnProperty.call(reward, "battlePoints")) {
    lines.push(battleText("earnedBattlePoints", { points: Number(reward.battlePoints) || 0 }));
  } else {
    lines.push(battleText("earnedMoney", { money: moneyText(reward.money) }));
  }
  if (assignableLevels > 0) {
    lines.push(battleText(assignableLevels === 1 ? "assignTrainingLevel" : "assignTrainingLevels", { levels: assignableLevels }));
    lines.push(battleText("maxTrainingLevels", { max: maxLevelsPerPokemon }));
  }
  return lines;
}

function updateTrainingDailyState(difficulty, claimResult) {
  if (state.trainingDaily && state.trainingDaily[difficulty]) {
    state.trainingDaily[difficulty].claimedToday = true;
    state.trainingDaily[difficulty].lastClaimedAt = claimResult && claimResult.last_claimed_at || new Date().toISOString();
  }
}

function commitTrainingReward(scene, payloads, onNoPayloads) {
  return claimTrainingZoneReward(scene.trainingDifficulty).then(function (claimResult) {
    var reward;
    if (!claimResult || claimResult.ok === false) {
      openMessage([battleFailure("dailyRewardFailed")], { title: battleTitle("training") });
      return { ok: false };
    }
    reward = trainingRewardForBadges(state.trainerInfo[2], scene.trainingDifficulty, claimResult.full_reward !== false);
    updateTrainingDailyState(scene.trainingDifficulty, claimResult);
    recordMissionEvent("training_victory", {
      difficulty: scene.trainingDifficulty,
      teamSizeAtStart: Number(scene.trainingTeamSizeAtStart) || (scene.playerTeam && scene.playerTeam.pokemonList ? scene.playerTeam.pokemonList.length : 0)
    }, {
      eventKey: String(scene.missionEventKey || "training") + ":training_victory"
    });
    adjustTrainerMoney(reward.money);
    if (!payloads || !payloads.length) {
      if (typeof onNoPayloads === "function") {
        onNoPayloads(reward);
      }
      return { ok: true };
    }
    return Promise.resolve(startPersistedPostBattleExp(scene, payloads, null, { deferProgression: true })).then(function (result) {
      if (!result || result.ok === false) {
        return result || { ok: false };
      }
      resumePostBattleExpProgression(scene);
      return result;
    });
  });
}

function markTrainingRewardPostBattle(scene) {
  if (scene.battleStatus === "post_battle") {
    return Promise.resolve({ ok: true });
  }
  ensureFinalBattleDisplaySnapshot(scene);
  return (scene.battleEventQueue || Promise.resolve()).catch(function () {
    return null;
  }).then(function () {
    return saveBattleEndAfterInventorySync(scene, { renderOnComplete: false });
  }).then(function (saveResult) {
    if (saveResult && saveResult.ok === false) {
      return saveResult;
    }
    return startPostBattleExpEvents([], battleRuntimeOwnerId(), "exp_level");
  }).then(function (result) {
    if (result && result.ok === false) {
      if (result.locked || result.reason === "locked") {
        showBattleRuntimeLostMessage();
      } else {
        state.saveStatus = { state: "error", message: battleFailure("rewardSaveFailed") };
        render({ scrollBattleLogToBottom: true });
      }
      return result;
    }
    scene.battleStatus = "post_battle";
    scene.postBattleEvents = [];
    return { ok: true };
  }).catch(function () {
    state.saveStatus = { state: "error", message: battleFailure("rewardSaveFailed") };
    render({ scrollBattleLogToBottom: true });
    return { ok: false, code: "reward_save_failed" };
  });
}

function openTrainingRewardAssignment(scene, options) {
  var reward = trainingRewardPreview(scene.trainingDifficulty);
  var assignableLevels = trainingAssignableLevelsForTeam(scene.playerTeam ? scene.playerTeam.pokemonList : [], reward.levels);
  var config = scene.trainingConfig || trainingDifficultyConfig(scene.trainingDifficulty) || {};
  var lines = trainingRewardLines(reward, assignableLevels);
  options = options || {};
  if (assignableLevels <= 0) {
    markTrainingRewardPostBattle(scene).then(function (result) {
      if (result && result.ok === false) {
        return;
      }
      commitTrainingReward(scene, [], function () {
        finishTrainingBattle(scene, lines.concat(reward.levels > 0 ? [battleText("noEligibleLevels")] : []));
      });
    });
    return;
  }
  function openDialog() {
    openTrainingLevelAssignmentDialog(scene, Object.assign({}, config, { expLevels: assignableLevels }), lines);
  }
  if (options.persistPostBattle === false) {
    openDialog();
    return;
  }
  markTrainingRewardPostBattle(scene).then(function (result) {
    if (result && result.ok === false) {
      return;
    }
    openDialog();
  });
}

function openTrainingLevelAssignmentDialog(scene, config, rewardLines) {
  var entries = trainingLevelAssignmentEntries(scene);
  var assignableLevels = Math.min(
    Math.max(0, Math.floor(Number(config && config.expLevels) || 0)),
    entries.reduce(function (sum, entry) {
      return sum + Math.max(0, Math.floor(Number(entry.maxAssignable) || 0));
    }, 0)
  );
  state.dialog = {
    type: "training-level-assignment",
    scene: scene,
    totalLevels: assignableLevels,
    lines: rewardLines,
    entries: entries
  };
  render({ scrollBattleLogToBottom: true });
}

function adjustTrainingLevelAssignment(element) {
  var dialog = state.dialog;
  var index = Number(element && element.dataset.index);
  var delta = Number(element && element.dataset.delta);
  var entry = dialog && dialog.entries ? dialog.entries[index] : null;
  if (!dialog || dialog.type !== "training-level-assignment" || !entry || !Number.isFinite(delta)) {
    return;
  }
  if (delta > 0) {
    if (trainingLevelAssignmentRemaining(dialog) <= 0 || entry.assigned >= entry.maxAssignable) {
      return;
    }
    entry.assigned += 1;
  } else if (delta < 0) {
    if (entry.assigned <= 0) {
      return;
    }
    entry.assigned -= 1;
  }
  render({ scrollBattleLogToBottom: true });
}

function confirmTrainingLevelAssignment() {
  var dialog = state.dialog;
  var scene = dialog && dialog.scene;
  var payloads;
  if (!dialog || dialog.type !== "training-level-assignment"
    || (!dialog.authoritative && !scene) || !trainingLevelAssignmentReady(dialog)) {
    return;
  }
  payloads = trainingLevelAssignmentPayloads(dialog);
  if (dialog.authoritative) {
    if (authoritativeTrainingProgressionPending) { return; }
    authoritativeTrainingProgressionPending = true;
    holdDialogContent();
    allocateAuthoritativeTrainingLevels({ commandId: dialog.commandId,
      expectedPlayerRevision: state.authoritativeRevision, progressionId: dialog.progressionId,
      allocations: payloads }).then(function (result) {
      if (!result.ok || !result.projection || !result.projection.player_state) {
        authoritativeTrainingProgressionPending = false;
        if (!result.uncertain) { dialog.commandId = globalThis.crypto.randomUUID(); }
        openMessage([battleFailure("levelAssignmentFailed")], {
          title: battleTitle("training"), onClose: function () {
            if (result.uncertain) { resumeAuthoritativeTrainingProgression(); }
            else { delete dialog.pending; state.dialog = dialog; renderDialogLayer(); }
          }
        });
        return;
      }
      authoritativeTrainingProgressionPending = false;
      applyAuthoritativeBattlePlayerState(result.projection.player_state);
      openAuthoritativeTrainingProgression();
    }).catch(function () {
      authoritativeTrainingProgressionPending = false;
      openMessage([battleFailure("levelAssignmentFailed")], {
        title: battleTitle("training"),
        onClose: function () { resumeAuthoritativeTrainingProgression(); }
      });
    });
    return;
  }
  state.dialog = null;
  if (!payloads.length) {
    commitTrainingReward(scene, [], function () {
      finishTrainingBattle(scene, (dialog.lines || []).concat(dialog.totalLevels > 0 ? [battleText("noEligibleLevels")] : []));
    });
    return;
  }
  commitTrainingReward(scene, payloads);
}

function localExpEventsFromPayloads(scene, payloads, eventType) {
  var baseSeq = Number(scene.battleEventSeq) || 0;
  return (payloads || []).map(function (payload, index) {
    return {
      auth_user_id: "",
      seq: baseSeq + index + 1,
      event_type: eventType || "exp",
      event_data: payload
    };
  });
}

function rewardEventEntry(events) {
  return (events || []).find(function (event) {
    return event && event.event_type === "reward";
  }) || null;
}

function copyInventoryEntries(entries) {
  return (entries || []).map(function (entry) {
    return Array.isArray(entry) ? [Number(entry[0]), Number(entry[1])] : null;
  }).filter(function (entry) {
    return entry && Number.isFinite(entry[0]) && Number.isFinite(entry[1]) && entry[1] > 0;
  });
}

function normalizedRewardResult(data) {
  var profile = data && data.profile && typeof data.profile === "object" ? data.profile : {};
  if (!data || typeof data !== "object") {
    return null;
  }
  return {
    ok: data.ok !== false,
    already: Boolean(data.already),
    battleType: String(data.battleType || data.battle_type || ""),
    rewardKind: String(data.rewardKind || data.reward_kind || ""),
    money: Number(data.money) || 0,
    badgeIndex: data.badgeIndex !== null && data.badgeIndex !== undefined ? Number(data.badgeIndex) : null,
    tm: data.tm !== null && data.tm !== undefined ? Number(data.tm) : null,
    item: data.item !== null && data.item !== undefined ? Number(data.item) : null,
    profile: {
      pokedollars: Number(profile.pokedollars) || 0,
      badges: Number(profile.badges) || 0
    },
    inventory: copyInventoryEntries(data.inventory)
  };
}

function rewardResultFromEvent(event) {
  return normalizedRewardResult(event && event.event_data ? event.event_data : null);
}

function applyFinalizedBattleReward(scene, result) {
  var inventory;
  if (!result || result.ok === false) {
    return false;
  }
  if (result.profile) {
    updateTrainerProfile(function (trainerInfo) {
      return [trainerInfo[0], result.profile.pokedollars, result.profile.badges, trainerInfo[3]];
    });
  }
  inventory = copyInventoryEntries(result.inventory);
  if (inventory.length) {
    replaceInventoryRuntimeState(inventory);
    if (scene) {
      scene.playerInventory = copyInventoryEntries(inventory);
    }
  }
  if (scene) {
    scene.rewardFinalized = true;
    if (result.rewardKind === "gym") {
      scene.gymRewardHandled = true;
    }
    if (result.rewardKind === "league") {
      scene.leagueRewardHandled = true;
    }
  }
  return true;
}

function applySceneRewardEvent(scene) {
  var result = rewardResultFromEvent(scene && scene.rewardEvent);
  if (!result) {
    return false;
  }
  return applyFinalizedBattleReward(scene, result);
}

function battleRewardAuthUserId(scene) {
  return String(scene && scene.playerAuthUserId || state.auth && state.auth.user && state.auth.user.id || "");
}

function battleRewardInventory(scene) {
  if (scene && Array.isArray(scene.playerInventory)) {
    return copyInventoryEntries(scene.playerInventory);
  }
  return copyInventoryEntries(state.inventory);
}

function openFinalizedGymRewardMessage(scene, baseLines, result) {
  var city = scene && scene.gymScene ? kantoGymCityByKey(scene.gymScene.cityKey) : null;
  var rewardLines = (baseLines && baseLines.length ? baseLines : localizedBattleResultLines(scene)).slice();
  var rewardTM = result && result.tm ? getItemByIndex(result.tm) : null;
  var rewardItem = result && result.item ? getItemByIndex(result.item) : null;
  var badgeIndex = result && result.badgeIndex !== null && result.badgeIndex !== undefined ? result.badgeIndex : city && city.badgeIndex;

  if (result && result.already) {
    rewardLines.push(battleText("rewardsAlreadyRegistered"));
  } else {
    rewardLines.push(battleText("earnedMoney", { money: moneyText(result ? result.money : 0) }));
    if (rewardTM) {
      rewardLines.push(battleText("earnedItem", { item: itemNameDescriptor(rewardTM) }));
    }
    if (rewardItem) {
      rewardLines.push(battleText("earnedItem", { item: itemNameDescriptor(rewardItem) }));
    }
    rewardLines.push(battleText("earnedBadge", { badge: textDescriptor("ui.gyms.badges." + KANTO_GYM_BADGES[badgeIndex].key) }));
  }
  openMessage(rewardLines, {
    title: battleTitle("gym"),
    closeLabel: "Ok",
    closeClass: "button-accent",
    scrollBattleLogToBottom: true,
    requireButtonClose: true,
    onClose: function () {
      showTerminalBattleScreen(scene);
    }
  });
}

function finishAdminControlledGymBattle(scene, lines) {
  var eventResult = rewardResultFromEvent(scene && scene.rewardEvent);
  var baseLines = (lines && lines.length ? lines : localizedBattleResultLines(scene)).slice();
  var rewardPromise = Promise.resolve(eventResult || {
    ok: false,
    code: "authoritative_result_missing"
  });

  rewardPromise.then(function (result) {
    if (!result || result.ok === false) {
      state.saveStatus = { state: "error", message: battleFailure("registerRewardsFailed") };
      render({ scrollBattleLogToBottom: true });
      return;
    }
    applyFinalizedBattleReward(scene, result);
    saveBattleEndAfterInventorySync(scene).then(function () {
      openFinalizedGymRewardMessage(scene, baseLines, result);
    });
  }).catch(function () {
    state.saveStatus = { state: "error", message: battleFailure("registerRewardsFailed") };
    render({ scrollBattleLogToBottom: true });
  });
}

function finishPostBattleProgression(scene) {
  scene.postBattleExpCompleted = true;
  if (scene.kantoLeague && scene.gymScene && scene.enemyTeam.isAllFainted()) {
    finishKantoLeagueBattle(scene, []);
    return;
  }
  if (scene.gymScene && scene.enemyTeam.isAllFainted()) {
    finishGymBattle(scene, []);
    return;
  }
  if (!scene.trainingBattle) {
    openMessage(localizedBattleResultLines(scene), {
      title: "",
      closeLabel: "Ok",
      closeClass: "button-accent",
      scrollBattleLogToBottom: true,
      requireButtonClose: true,
      onClose: function () {
        showTerminalBattleScreen(scene);
      }
    });
    return;
  }
  closePersistedBattleRuntime(scene).then(function () {
    render({ scrollBattleLogToBottom: true });
  });
}

function resumePostBattleFollowup(scene) {
  if (!state.activeBattle || !scene || scene.battleStatus !== "post_battle") {
    return false;
  }
  if (resumePostBattleExpProgression(scene)) {
    return true;
  }
  if (scene.trainingBattle && scene.manager && scene.manager.battleOver && !scene.playerTeam.isAllFainted()) {
    if (state.trainingDaily && state.trainingDaily[scene.trainingDifficulty] && state.trainingDaily[scene.trainingDifficulty].claimedToday) {
      finishPostBattleProgression(scene);
      return true;
    }
    openTrainingRewardAssignment(scene, { persistPostBattle: false });
    return true;
  }
  if (scene.manager && scene.manager.battleOver) {
    finishPostBattleProgression(scene);
    return true;
  }
  return false;
}

export function resumeBattleSceneFollowup(scene) {
  if (resumePostBattleFollowup(scene)) {
    return true;
  }
  if (state.dialog || !state.activeBattle || !scene || scene.battleStatus === "post_battle" || !scene.manager || !scene.manager.battleOver) {
    return false;
  }
  showBattleFollowup(scene);
  return true;
}

function openFinalizedKantoLeagueRewardMessage(scene, rewardLines, isChampion, memberIndex) {
  openMessage(rewardLines, {
    title: battleTitle("league"),
    closeLabel: "Ok",
    closeClass: "button-accent",
    scrollBattleLogToBottom: true,
    requireButtonClose: true,
    onClose: function () {
      closePersistedBattleRuntime(scene).then(function () {
        if (isChampion) {
          setScene({ name: "gyms" }, { history: "replace" });
          return;
        }
        if (memberIndex !== undefined && memberIndex < 3) {
          startKantoLeagueNextBattle(memberIndex + 1);
        } else if (memberIndex !== undefined && memberIndex === 3) {
          startKantoLeagueNextBattle(4);
        }
      });
    }
  });
}

function finishAdminControlledKantoLeagueBattle(scene, lines) {
  var rewardLines = (lines && lines.length ? lines : localizedBattleResultLines(scene)).slice();
  var isChampion = scene.gymScene && scene.gymScene.cityKey === "kanto_champion";
  var memberIndex = scene.gymScene && scene.gymScene.e4MemberIndex;
  var member = !isChampion && memberIndex !== undefined ? kantoEliteFourMemberByIndex(memberIndex) : null;
  var memberName = trainerNameDescriptor(isChampion ? KANTO_CHAMPION : member);
  var eventResult = rewardResultFromEvent(scene && scene.rewardEvent);
  var rewardPromise = Promise.resolve(eventResult || {
    ok: false,
    code: "authoritative_result_missing"
  });

  rewardPromise.then(function (result) {
    if (!result || result.ok === false) {
      state.saveStatus = { state: "error", message: battleFailure("registerRewardsFailed") };
      render({ scrollBattleLogToBottom: true });
      return;
    }
    applyFinalizedBattleReward(scene, result);
    rewardLines.push(battleText("defeatedMember", { member: memberName }));
    rewardLines.push(result.already ? battleText("rewardAlreadyRegistered") : battleText("receivedPrizeMoney", { money: moneyText(result.money) }));
    saveBattleEndAfterInventorySync(scene).then(function () {
      openFinalizedKantoLeagueRewardMessage(scene, rewardLines, isChampion, memberIndex);
    });
  }).catch(function () {
    state.saveStatus = { state: "error", message: battleFailure("registerRewardsFailed") };
    render({ scrollBattleLogToBottom: true });
  });
}

function finishKantoLeagueBattle(scene, lines) {
  if (sceneIsAdminControlled(scene)) {
    finishAdminControlledKantoLeagueBattle(scene, lines);
    return;
  }
  var rewardLines = (lines && lines.length ? lines : localizedBattleResultLines(scene)).slice();
  var isChampion = scene.gymScene && scene.gymScene.cityKey === "kanto_champion";
  var memberIndex = scene.gymScene && scene.gymScene.e4MemberIndex;
  var member = !isChampion && memberIndex !== undefined ? kantoEliteFourMemberByIndex(memberIndex) : null;
  var memberName = trainerNameDescriptor(isChampion ? KANTO_CHAMPION : member);
  var rewardMoney = isChampion ? KANTO_LEAGUE_REWARDS.champion.money : KANTO_LEAGUE_REWARDS.member.money;
  state.trainerInfo[1] = (state.trainerInfo[1] || 0) + rewardMoney;
  rewardLines.push(battleText("defeatedMember", { member: memberName }));
  rewardLines.push(battleText("receivedPrizeMoney", { money: moneyText(rewardMoney) }));
  saveBattleEndAfterInventorySync(scene);
  openMessage(rewardLines, {
    title: battleTitle("league"),
    closeLabel: "Ok",
    closeClass: "button-accent",
    scrollBattleLogToBottom: true,
    requireButtonClose: true,
    onClose: function () {
      closePersistedBattleRuntime(scene).then(function () {
        if (isChampion) {
          setScene({ name: "gyms" }, { history: "replace" });
          return;
        }
        if (memberIndex !== undefined && memberIndex < 3) {
          startKantoLeagueNextBattle(memberIndex + 1);
        } else if (memberIndex !== undefined && memberIndex === 3) {
          startKantoLeagueNextBattle(4);
        }
      });
    }
  });
}

function showKantoLeagueEntryDialogForScene(battleScene, battleType) {
  var enemyTeam = battleScene && battleScene.enemyTeam;
  var trainerName = enemyTeam ? enemyTeam.name : "";
  var member = battleScene.gymScene && battleScene.gymScene.cityKey === "elite_four" && battleScene.gymScene.e4MemberIndex !== undefined
    ? kantoEliteFourMemberByIndex(battleScene.gymScene.e4MemberIndex) : null;
  var champion = battleScene.gymScene && battleScene.gymScene.cityKey === "kanto_champion" ? KANTO_CHAMPION : null;
  var trainerInfo = member || champion;
  var trainerImage = trainerInfo ? getTrainerImage(trainerInfo.sprite) : "";
  var teamEntries = state.team.filter(Boolean).map(function (pokemon, index) {
    return { pokemon: pokemon, index: index };
  });
  state.dialog = {
    type: "kanto-league-entry",
    trainerName: trainerName,
    trainerImage: trainerImage,
    entries: teamEntries,
    onPick: function (index) {
      state.dialog = null;
      battleScene.playerTeam.activeIndex = Number(index);
      if (battleTypeRequiresAdminEntryChoice(battleType)) {
        battleScene.pendingAdminEntryChoice = true;
        battleScene.initialEntryCompleted = false;
      }
      persistBattleStart(battleScene, battleType, "player").then(function (ok) {
        if (ok) {
          openPersistedBattleScene(battleScene);
        } else {
          setScene({ name: "gyms" }, { history: "replace" });
        }
      });
    }
  };
  render();
}

export function startKantoLeagueNextBattle(nextIndex) {
  var playerPokemon = state.team.filter(Boolean);
  var playerTeam;
  var enemyTeam;
  var battleType;
  var battleScene;
  var member;

  if (!playerPokemon.length) {
    openMessage([battleText("emptyTeam")], { title: battleTitle("league") });
    return;
  }

  openAuthoritativeLeagueNextEntry(nextIndex);
  return;
}

function openAuthoritativeLeagueNextEntry(nextIndex) {
  var trainer = nextIndex === 4 ? KANTO_CHAMPION : kantoEliteFourMemberByIndex(nextIndex);
  state.dialog = {
    type: "kanto-league-entry",
    trainerName: trainer ? trainer.name : battleTextNow("titles.league"),
    trainerImage: trainer ? getTrainerImage(trainer.sprite) : "",
    entries: state.team.map(function (pokemon, slot) {
      return pokemon ? { pokemon: pokemon, index: slot } : null;
    }).filter(Boolean),
    onPick: function (activeSlot) {
      state.dialog = null;
      submitAuthoritativeLeagueNextStart(activeSlot, nextIndex);
    }
  };
  render();
}

function submitAuthoritativeLeagueNextStart(activeSlot, expectedMemberIndex) {
  var commandId = globalThis.crypto.randomUUID();
  var ownerId = authoritativeBattleRuntimeOwnerId();
  return startAuthoritativeLeagueBattle({ commandId: commandId, expectedPlayerRevision: state.authoritativeRevision,
    runtimeOwnerId: ownerId, activeSlot: activeSlot, expectedMemberIndex: expectedMemberIndex }).then(function (result) {
    if (result.ok && result.battle && result.battle.contract_key === "league") {
      state.authoritativeRevision = result.playerRevision;
      state.authoritativeLeagueState = null;
      openAuthoritativeBattleProjection(result.battle, result.events, { history: "push" });
      return true;
    }
    if (result.uncertain || result.code === "revision_conflict" || result.code === "battle_command_rejected") {
      return getAuthoritativeBattle(null, { afterSeq: 0, limit: 100, commandId: commandId, runtimeOwnerId: ownerId }).then(function (fresh) {
        if (fresh.ok && fresh.battle && fresh.battle.contract_key === "league"
          && ["active", "needs_player_switch"].indexOf(fresh.battle.status) !== -1
          && String(fresh.battle.runtime_owner_id || "") === ownerId) {
          state.authoritativeRevision = fresh.playerRevision;
          state.authoritativeLeagueState = null;
          openAuthoritativeBattleProjection(fresh.battle, fresh.events, { history: "push" });
          return true;
        }
        if (fresh.ok && fresh.projection && fresh.projection.league_state) {
          state.authoritativeLeagueState = fresh.projection.league_state;
        }
        openMessage([battleFailure("leagueStateChanged")], { title: battleTitle("league") });
        setScene({ name: "gym-city", cityKey: "elite_four" }, { history: "replace" });
        return false;
      });
    }
    openMessage([battleFailure("nextLeagueFailed")], { title: battleTitle("league") });
    setScene({ name: "gym-city", cityKey: "elite_four" }, { history: "replace" });
    return false;
  }).catch(function () {
    openMessage([battleFailure("nextLeagueFailed")], { title: battleTitle("league") });
    setScene({ name: "gym-city", cityKey: "elite_four" }, { history: "replace" });
    return false;
  });
}

function startPersistedPostBattleExp(scene, payloads, onComplete, options) {
  var localEvents;
  var eventType = scene.trainingBattle ? "exp_level" : "exp";
  var deferProgression = options && options.deferProgression;
  if (!scene || scene.postBattleExpStartPending || scene.postBattleExpStarted) {
    return true;
  }
  if (!payloads || !payloads.length) {
    return false;
  }
  ensureFinalBattleDisplaySnapshot(scene);
  scene.postBattleExpStartPending = true;
  return (scene.battleEventQueue || Promise.resolve()).catch(function () {
    return null;
  }).then(function () {
    return saveBattleEndAfterInventorySync(scene, { renderOnComplete: false });
  }).then(function (saveResult) {
    if (saveResult && saveResult.ok === false) {
      return saveResult;
    }
    return startPostBattleExpEvents(payloads, battleRuntimeOwnerId(), eventType);
  }).then(function (result) {
    scene.postBattleExpStartPending = false;
    if (result && result.ok === false) {
      if (result.locked || result.reason === "locked") {
        showBattleRuntimeLostMessage();
        return result;
      }
      state.saveStatus = { state: "error", message: textDescriptor("messages.progression.saveFailed") };
      render({ scrollBattleLogToBottom: true });
      return result;
    }
    localEvents = localExpEventsFromPayloads(scene, payloads, eventType);
    scene.battleEventSeq = (Number(scene.battleEventSeq) || 0) + localEvents.length;
    scene.battleStatus = "post_battle";
    scene.postBattleEvents = localEvents;
    if (deferProgression) {
      return { ok: true };
    }
    scene.postBattleExpStarted = true;
    startPostBattleExpProgression(scene, localEvents, onComplete || function () {
      finishPostBattleProgression(scene);
    });
    return { ok: true };
  }).catch(function (error) {
    scene.postBattleExpStartPending = false;
    state.saveStatus = { state: "error", message: textDescriptor("messages.progression.saveFailed") };
    render({ scrollBattleLogToBottom: true });
    return { ok: false, message: error.message };
  });
}

function resumePostBattleExpProgression(scene) {
  var events = expEventEntries(scene && scene.postBattleEvents);
  if (!scene || scene.postBattleExpStarted || !events.length) {
    return false;
  }
  ensureFinalBattleDisplaySnapshot(scene);
  scene.postBattleExpStarted = true;
  return startPostBattleExpProgression(scene, events, function () {
    finishPostBattleProgression(scene);
  });
}

function captureNpcEventsDuring(scene, action) {
  var manager = scene.manager;
  var originalChooseNpcAction = manager.chooseNpcAction;
  var originalExecuteMove = manager.executeMove;
  var originalSwitchRandom = scene.enemyTeam.switchRandom;
  var capturedEvents = [];
  var pendingNpcMoveEvent = null;
  manager.chooseNpcAction = function (npcActive) {
    var npcAction = originalChooseNpcAction.call(manager, npcActive);
    var move = npcAction.type === "move" ? npcAction.move : null;
    var moveIndex = move && npcActive && npcActive.pokemon && npcActive.pokemon.moves ? npcActive.pokemon.moves.findIndex(function (entry) {
      return entry === move || entry && entry.index === move.index;
    }) : -1;
    if (move) {
      pendingNpcMoveEvent = {
        eventType: "move",
        eventData: { actor: "npc", moveIndex: moveIndex }
      };
      capturedEvents.push(pendingNpcMoveEvent);
    } else {
      capturedEvents.push({
        eventType: "item",
        eventData: { actor: "npc", itemIndex: npcAction.item.index, targetIndex: npcAction.targetIndex }
      });
    }
    return npcAction;
  };
  manager.executeMove = function (attacker, defender, move) {
    originalExecuteMove.call(manager, attacker, defender, move);
    if (attacker && attacker.team === scene.enemyTeam && pendingNpcMoveEvent && manager.lastResolvedMoveIndex && manager.lastResolvedMoveIndex !== move.index) {
      pendingNpcMoveEvent.eventData.resolvedMoveIndex = manager.lastResolvedMoveIndex;
    }
    if (attacker && attacker.team === scene.enemyTeam && pendingNpcMoveEvent && manager.lastResolvedType) {
      pendingNpcMoveEvent.eventData.resolvedType = manager.lastResolvedType;
    }
    pendingNpcMoveEvent = null;
  };
  scene.enemyTeam.switchRandom = function () {
    var previousIndex = scene.enemyTeam.activeIndex;
    var message = originalSwitchRandom.call(scene.enemyTeam);
    if (scene.enemyTeam.activeIndex !== previousIndex) {
      capturedEvents.push({
        eventType: "switch",
        eventData: { actor: "npc", targetIndex: scene.enemyTeam.activeIndex }
      });
    }
    return message;
  };
  try {
    action();
  } finally {
    manager.chooseNpcAction = originalChooseNpcAction;
    manager.executeMove = originalExecuteMove;
    scene.enemyTeam.switchRandom = originalSwitchRandom;
  }
  return capturedEvents;
}

function withReplayNpcEvents(scene, npcEvents, action) {
  var manager = scene.manager;
  var originalChooseNpcAction = manager.chooseNpcAction;
  var originalSwitchRandom = scene.enemyTeam.switchRandom;
  var queue = (npcEvents || []).slice();
  function takeEvent(eventType) {
    var index = queue.findIndex(function (entry) {
      return entry && entry.event_type === eventType && entry.event_data && entry.event_data.actor === "npc";
    });
    if (index === -1) {
      return null;
    }
    return queue.splice(index, 1)[0];
  }
  function takeNpcActionEvent() {
    var index = queue.findIndex(function (entry) {
      return entry && (entry.event_type === "move" || entry.event_type === "item") && entry.event_data && entry.event_data.actor === "npc";
    });
    if (index === -1) {
      throw new Error("Missing NPC action event in battle replay.");
    }
    return queue.splice(index, 1)[0];
  }
  manager.chooseNpcAction = function (npcActive) {
    var event = takeNpcActionEvent();
    var data = event.event_data;
    var item;
    var moveIndex = event.event_type === "move" ? Number(data.moveIndex) : NaN;
    var move = event.event_type === "move" && npcActive && npcActive.pokemon ? npcActive.pokemon.moves[moveIndex] : null;
    if (event.event_type === "move" && moveIndex === -1) {
      return manager.availableNpcMoveActions(npcActive)[0];
    }
    if (move) {
      move.forcedCopiedMoveIndex = data.resolvedMoveIndex || null;
      move.forcedResolvedType = data.resolvedType || null;
      return { type: "move", move: move };
    }
    item = getInventoryItemByIndex(inventoryForBattleEvent(scene, "npc"), Number(data.itemIndex));
    if (!item) {
      throw new Error("Missing NPC item in battle replay.");
    }
    return {
      type: "item",
      item: item,
      target: data.targetIndex !== null && data.targetIndex !== undefined ? scene.enemyTeam.combatantList[Number(data.targetIndex)] : null,
      targetIndex: data.targetIndex !== null && data.targetIndex !== undefined ? Number(data.targetIndex) : null
    };
  };
  scene.enemyTeam.switchRandom = function () {
    var event = takeEvent("switch");
    var targetIndex = event ? Number(event.event_data.targetIndex) : NaN;
    var previousIndex = scene.enemyTeam.activeIndex;
    if (Number.isFinite(targetIndex) && scene.enemyTeam.combatantList[targetIndex]) {
      if (scene.enemyTeam.getActive()) {
        scene.enemyTeam.getActive().resetSwitchModifiers();
      }
      scene.enemyTeam.lastSwitchedOutIndex = previousIndex;
      scene.enemyTeam.activeIndex = targetIndex;
      return {
        ok: true,
        events: [Engine.battleEvent("switch.entered", {
          pokemon: Engine.battleSpeciesRef(scene.enemyTeam.getActive())
        })]
      };
    }
    return originalSwitchRandom.call(scene.enemyTeam);
  };
  try {
    action();
  } finally {
    manager.chooseNpcAction = originalChooseNpcAction;
    scene.enemyTeam.switchRandom = originalSwitchRandom;
  }
}

function replayBattleEvents(scene, events) {
  var index = 0;
  var event;
  var data;
  var npcEvents;
  var nextIndex;
  events = Array.isArray(events) ? events : [];
  if (sceneIsAdminControlled(scene)) {
    events.forEach(function (entry) {
      applyBattleEvent(scene, entry);
    });
    scene.battleEventSeq = events.reduce(function (highest, entry) {
      return Math.max(highest, Number(entry.seq) || 0);
    }, 0);
    return;
  }
  while (index < events.length) {
    event = events[index];
    data = event && event.event_data ? event.event_data : {};
    if (data.actor !== "player") {
      index += 1;
      continue;
    }
    nextIndex = index + 1;
    while (nextIndex < events.length && (!events[nextIndex].event_data || events[nextIndex].event_data.actor !== "player")) {
      nextIndex += 1;
    }
    npcEvents = events.slice(index + 1, nextIndex);
    withReplayNpcEvents(scene, npcEvents, function () {
      applyBattleEvent(scene, event);
    });
    index = nextIndex;
  }
  scene.battleEventSeq = events.reduce(function (highest, entry) {
    return Math.max(highest, Number(entry.seq) || 0);
  }, 0);
}

function inventoryForBattleEvent(scene, actor) {
  if (actor === "npc" || actor === "admin") {
    return scene && Array.isArray(scene.adminItems) ? scene.adminItems : [];
  }
  return scene && Array.isArray(scene.playerInventory) ? scene.playerInventory : state.inventory;
}

export function consumePlayerBattleInventoryItem(scene, itemIndex) {
  if (scene && Array.isArray(scene.playerInventory)) {
    scene.playerInventory = updateInventoryQuantity(scene.playerInventory, itemIndex, -1);
    return;
  }
  adjustInventoryItemQuantity(itemIndex, -1);
}

export function syncBattleInventoryToState(scene) {
  if (!scene || !Array.isArray(scene.playerInventory)) {
    return;
  }
  state.inventory = scene.playerInventory.map(function (entry) {
    return Array.isArray(entry) ? entry.slice() : entry;
  });
}

function saveBattleEndAfterInventorySync(scene, options) {
  syncBattleInventoryToState(scene);
  return saveAfterStateChange("battle-end", options);
}

function badgeActivitySubjectName(name) {
  return String(name || "").trim();
}

function applyBattleEvent(scene, event) {
  var data = event && event.event_data ? event.event_data : {};
  var item;
  var itemResult;
  var target;
  var moveState;
  var actor = data.actor === "npc" || data.actor === "admin" ? "npc" : "player";
  if (!scene || !event || scene.manager.battleOver) {
    return;
  }
  if (event.event_type === "move") {
    moveState = actor === "npc"
      ? scene.enemyTeam.getActive().moveStates[Number(data.moveIndex)]
      : scene.playerTeam.getActive().moveStates[Number(data.moveIndex)];
    if (moveState && moveState.move) {
      moveState.move.forcedCopiedMoveIndex = data.resolvedMoveIndex || null;
      moveState.move.forcedResolvedType = data.resolvedType || null;
      try {
        if (actor === "npc") {
          scene.manager.npcUseMove(moveState.move);
        } else {
          scene.manager.playerUseMove(moveState.move);
        }
      } finally {
        moveState.move.forcedCopiedMoveIndex = null;
        moveState.move.forcedResolvedType = null;
      }
    }
    return;
  }
  if (event.event_type === "switch") {
    if (actor === "npc") {
      scene.manager.npcSwitch(Number(data.targetIndex));
    } else {
      scene.manager.playerSwitch(Number(data.targetIndex), data.entryChoice || null);
    }
    return;
  }
  if (event.event_type === "entry_item") {
    target = data.targetIndex !== null && data.targetIndex !== undefined ? scene.playerTeam.combatantList[Number(data.targetIndex)] : scene.playerTeam.getActive();
    if (target) {
      scene.manager.applyEntryHeldItemChoice(target, data.entryChoice || null);
    }
    scene.initialEntryCompleted = true;
    return;
  }
  if (event.event_type === "player_entry") {
    scene.initialEntryCompleted = true;
    scene.manager.waitingFor = normalizedBattleWaitingFor(data.waitingFor);
    return;
  }
  if (event.event_type === "admin_entry") {
    scene.enemyTeam.activeIndex = Math.max(0, Math.min(scene.enemyTeam.combatantList.length - 1, Math.floor(Number(data.targetIndex) || 0)));
    scene.pendingAdminEntryChoice = false;
    scene.manager.waitingFor = normalizedBattleWaitingFor(data.waitingFor);
    return;
  }
  if (event.event_type === "item") {
    item = getInventoryItemByIndex(inventoryForBattleEvent(scene, actor), Number(data.itemIndex));
    target = data.targetIndex !== null && data.targetIndex !== undefined
      ? (actor === "npc" ? scene.enemyTeam.combatantList[Number(data.targetIndex)] : scene.playerTeam.combatantList[Number(data.targetIndex)])
      : null;
    if (item) {
      itemResult = actor === "npc" ? scene.manager.npcUseItem(item, target) : scene.manager.playerUseItem(item, target);
      if (actor === "player" && itemResult && itemResult.ok && itemResult.itemConsumed !== false) {
        if (scene && Array.isArray(scene.playerInventory)) {
          scene.playerInventory = updateInventoryQuantity(scene.playerInventory, item.index, -1);
        } else {
          state.inventory = updateInventoryQuantity(state.inventory, item.index, -1);
        }
      }
    }
    return;
  }
  if (event.event_type === "ball_success") {
    if (actor === "player") {
      item = getInventoryItemByIndex(inventoryForBattleEvent(scene, actor), Number(data.itemIndex));
      if (item) {
        consumePlayerBattleInventoryItem(scene, item.index);
      }
    }
    scene.manager.endBattle();
    scene.manager.log.push({ key: "capture.replayConcluded", params: {} });
    return;
  }
  if (event.event_type === "ball_fail") {
    item = getInventoryItemByIndex(inventoryForBattleEvent(scene, actor), Number(data.itemIndex));
    itemResult = scene.manager.playerUseBall(item || getItemByIndex(Number(data.itemIndex)) || { key: "poke_ball", index: Number(data.itemIndex) || 1 });
    if (item && actor === "player" && itemResult && itemResult.ok && itemResult.itemConsumed !== false) {
      consumePlayerBattleInventoryItem(scene, item.index);
    }
    return;
  }
}

export function sceneFromBattleRecord(battle, events) {
  var initialState = battle && battle.initial_state ? battle.initial_state : {};
  var battleType = battle ? battle.battle_type : "";
  var battleStatus = battle && battle.status ? battle.status : "active";
  var rewardEvent = rewardEventEntry(events || []);
  var playerName = String(battle && battle.player_username || state.playerName || state.auth.userLabel || "").trim() || "Player";
  var playerTeam = new Engine.Team(playerName, revivePokemonList(initialState.playerTeam), Number(initialState.playerActiveIndex) || 0);
  var enemyTeamName = initialState.enemyTeamName || (String(battleType || "").indexOf("capture_") === 0 ? "Wild Pokemon" : "Challenger");
  var enemyTeam = new Engine.Team(enemyTeamName, revivePokemonList(initialState.enemyTeam), Number(initialState.enemyActiveIndex) || 0);
  var manager = new Engine.BattleManager(playerTeam, enemyTeam);
  manager.battleType = battleType;
  manager.firstActor = battle.first_actor || initialState.firstActor || "player";
  manager.adminControlled = Boolean(battle.admin_controlled || isAdminControlledBattleType(battleType));
  manager.waitingFor = manager.adminControlled
    ? initialAdminBattleWaitingFor(battle, initialState)
    : normalizedBattleWaitingFor(battle && battle.waiting_for);
  manager.itemReturnSnapshots = Array.isArray(initialState.itemReturnSnapshots)
    ? initialState.itemReturnSnapshots.map(function (entry) { return Object.assign({}, entry); })
    : [];
  var scene = {
    name: "battle",
    battleType: battleType,
    firstActor: manager.firstActor,
    playerTeam: playerTeam,
    enemyTeam: enemyTeam,
    manager: manager,
    battleEventSeq: 0,
    battleStatus: battleStatus,
    postBattleEvents: expEventEntries(events || []),
    adminControlled: manager.adminControlled,
    adminItems: battle.admin_items || [],
    playerUsername: playerName,
    playerInventory: Array.isArray(initialState.inventory) ? initialState.inventory : [],
    missionEventKey: String(initialState.missionEventKey || ""),
    pendingAdminEntryChoice: Boolean(initialState.pendingAdminEntryChoice),
    initialEntryCompleted: Boolean(initialState.initialEntryCompleted),
    rewardFinalized: Boolean(rewardEvent),
    rewardEvent: rewardEvent
  };
  manager.npcItems = scene.adminItems;
  var trainingDifficulty = String(battleType || "").indexOf("training_") === 0 ? String(battleType).slice("training_".length) : "";
  var gymCity = String(battleType || "").indexOf("gym_") === 0 ? String(battleType).slice("gym_".length) : "";
  var captureZone = String(battleType || "").indexOf("capture_") === 0 ? String(battleType).slice("capture_".length) : "";
  if (trainingDifficulty) {
    var trainingOpponentProfile = normalizeTrainingOpponentProfile(initialState.trainingOpponent || { name: enemyTeamName });
    scene.trainingBattle = true;
    scene.trainingDifficulty = trainingDifficulty;
    scene.trainingConfig = trainingDifficultyConfig(trainingDifficulty);
    scene.trainingOpponent = trainingOpponentProfile;
    scene.trainingTrainerSprite = trainingOpponentProfile.sprite;
    scene.trainingTeamSizeAtStart = Array.isArray(initialState.playerTeam) ? initialState.playerTeam.length : playerTeam.pokemonList.length;
    scene.trainingScene = { name: "training-zone", trainingDifficulty: trainingDifficulty, trainingOpponentTeam: [], trainingOpponent: trainingOpponentProfile };
  }
  if (captureZone) {
    scene.captureScene = {
      name: "capture",
      zoneName: captureZone
    };
  }
  if (gymCity) {
    scene.gymScene = { name: "gym-city", cityKey: gymCity };
  }
  var kantoLeagueMatch = String(battleType || "").match(/^kanto_league_(\d+)$/);
  if (kantoLeagueMatch) {
    var memberIdx = Number(kantoLeagueMatch[1]) - 1;
    scene.kantoLeague = true;
    scene.gymScene = { name: "gym-city", cityKey: "elite_four", e4MemberIndex: memberIdx };
  }
  if (String(battleType || "") === "kanto_league_champion") {
    scene.kantoLeague = true;
    scene.gymScene = { name: "gym-city", cityKey: "kanto_champion" };
  }
  ensureBattleBindings(scene);
  syncAdminControlledScene(scene);
  replayBattleEvents(scene, events || []);
  if (battleStatus === "post_battle") {
    ensureFinalBattleDisplaySnapshot(scene);
    scene.playerTeam = new Engine.Team(playerName, state.team.length ? state.team : revivePokemonList(initialState.playerTeam), Number(initialState.playerActiveIndex) || 0);
    ensureBattleBindings(scene);
  }
  return scene;
}

export function persistBattleStart(scene, battleType, firstActor) {
  state.battleStartPending = true;
  if (!scene.missionEventKey) {
    scene.missionEventKey = createMissionEventKey("battle");
  }
  var initialState = initialStateForBattle(scene, battleType, firstActor);
  syncAdminControlledScene(scene);
  scene.adminItems = sceneUsesNpcItems(scene) ? (sceneIsAdminControlled(scene) ? createAdminBattleItems() : createNpcBattleItems(battleType)) : [];
  scene.manager.npcItems = scene.adminItems;
  return createActivePlayerBattle({
    battleType: battleType,
    firstActor: initialState.firstActor,
    initialState: initialState,
    adminControlled: sceneIsAdminControlled(scene),
    waitingFor: sceneIsAdminControlled(scene) ? waitingForFirstActor(initialState.firstActor) : "player",
    adminItems: scene.adminItems
  }, battleRuntimeOwnerId()).then(function (result) {
    if (!result.ok) {
      state.battleStartPending = false;
      openMessage([battleFailure("createFailed")], { title: battleTitle("battle") });
      return false;
    }
    activateBattleRuntimeOwnership();
    scene.battleType = battleType;
    scene.firstActor = initialState.firstActor;
    scene.manager.battleType = battleType;
    scene.manager.firstActor = scene.firstActor;
    syncAdminControlledScene(scene);
    scene.manager.waitingFor = sceneIsAdminControlled(scene) ? waitingForFirstActor(scene.firstActor) : "player";
    scene.battleEventSeq = 0;
    setActiveBattleMeta({
      battleType: battleType || "",
      firstActor: scene.firstActor || "player"
    }, { ownsRuntime: true });
    syncActiveBattleRealtime(scene);
    return true;
  }).catch(function () {
    state.battleStartPending = false;
    openMessage([battleFailure("createFailed")], { title: battleTitle("battle") });
    return false;
  });
}

export function openPersistedBattleScene(scene) {
  setScene(scene);
  state.battleStartPending = false;
  openPendingBattleEntryChoice(scene);
}

function openBattleTakenOverScene(result) {
  var scene = sceneFromBattleRecord(result.battle, result.events);
  applySceneRewardEvent(scene);
  setActiveBattleMeta({
    battleType: (result.battle.battle_type) || "",
    firstActor: (result.battle.first_actor) || "player"
  }, { ownsRuntime: true });
  setScene(scene, { history: "replace" });
  syncActiveBattleRealtime(scene);
  resumeBattleSceneFollowup(scene);
  if (sceneNeedsInitialPlayerEntryChoice(scene)) {
    openPendingBattleEntryChoice(scene);
  }
}

function openBattleTakeoverDialog(result) {
  setScene({ name: "home" }, { history: "replace" });
  openConfirm(
    battleTitle("battle"),
    [battleText("alreadyOpen")],
    function () {
      forceClaimBattleRuntimeLock().then(function (lockResult) {
        if (!lockResult.ok) {
          openMessage([battleFailure("resumeFailed")], { title: battleTitle("battle") });
          return;
        }
        openBattleTakenOverScene(result);
      }).catch(function () {
        openMessage([battleFailure("resumeFailed")], { title: battleTitle("battle") });
      });
    },
    {
      confirmLabel: battleText("buttons.resumeHere"),
      confirmClass: "button-accent"
    }
  );
}

export function refreshActiveBattleFromDb(options) {
  options = options || {};
  return refreshAuthoritativeBattle(options);
}

export function evaluateBattleStateAfterAuth() {
  syncBattleRuntimeState();
  return refreshActiveBattleFromDb({ open: false }).then(function () {
    enforceBattleRuntimeSceneLock();
  });
}

function exitPersistedBattle(nextScene) {
  return deleteActivePlayerBattle(battleRuntimeOwnerId()).then(function (result) {
    if (!result.ok) {
      if (result.locked || result.reason === "locked") {
        showBattleRuntimeLostMessage();
        return result;
      }
      openMessage([battleFailure("closeFailed")], { title: battleTitle("battle") });
      return result;
    }
    setActiveBattleMeta(null);
    setScene(nextScene, { history: "replace" });
    return result;
  }).catch(function () {
    openMessage([battleFailure("closeFailed")], { title: battleTitle("battle") });
    return { ok: false, code: "battle_close_failed" };
  });
}

export function closePersistedBattleRuntime(scene) {
  if (!scene || scene.persistedBattleClosed) {
    return Promise.resolve({ ok: true });
  }
  scene.persistedBattleClosed = true;
  return (scene.battleEventQueue || Promise.resolve()).catch(function () {
    return null;
  }).then(function () {
    return deleteActivePlayerBattle(battleRuntimeOwnerId());
  }).then(function (result) {
    if (!result.ok) {
      scene.persistedBattleClosed = false;
      if (result.locked || result.reason === "locked") {
        showBattleRuntimeLostMessage();
        return result;
      }
      state.saveStatus = { state: "error", message: battleFailure("closeFailed") };
      return result;
    }
    setActiveBattleMeta(null);
    return result;
  }).catch(function () {
    scene.persistedBattleClosed = false;
    state.saveStatus = { state: "error", message: battleFailure("closeFailed") };
    return { ok: false, code: "battle_close_failed" };
  });
}

function persistAndCloseFinishedBattle(scene) {
  if (!scene || scene.finalBattlePersistStarted) {
    return Promise.resolve({ ok: true });
  }
  ensureFinalBattleDisplaySnapshot(scene);
  scene.finalBattlePersistStarted = true;
  markDirty();
  return saveBattleEndAfterInventorySync(scene, { renderOnComplete: false }).then(function (result) {
    if (result && result.ok === false) {
      scene.finalBattlePersistStarted = false;
      return result;
    }
    return closePersistedBattleRuntime(scene);
  });
}

function setBattleInfoPanel(mode) {
  var nextMode = mode === "log" ? "log" : "summary";
  if (!state.scene || ["battle", "admin-battle", "battle-dome-battle"].indexOf(state.scene.name) === -1) {
    return;
  }

  state.scene.battleInfoPanel = nextMode;
  root.querySelectorAll('[data-action="battle-info-tab"]').forEach(function (btn) {
    var isSelected = btn.dataset.panel === nextMode;
    btn.classList.toggle("button-primary", isSelected);
    btn.classList.toggle("button-ghost", !isSelected);
    btn.setAttribute("aria-selected", isSelected ? "true" : "false");
  });
  root.querySelectorAll("[data-battle-info-pane]").forEach(function (pane) {
    var isSelected = pane.dataset.battleInfoPane === nextMode;
    pane.classList.toggle("is-active", isSelected);
    pane.setAttribute("aria-hidden", isSelected ? "false" : "true");
  });
  syncBattleLayoutMeasurements();
}

function refreshAuthoritativeBattle(options) {
  var shouldOpen = !!options.open || state.scene && state.scene.name === "battle-restore";
  var ownerId = authoritativeBattleRuntimeOwnerId();
  return getAuthoritativeBattle(null, { afterSeq: 0, limit: 100,
    commandId: globalThis.crypto.randomUUID(), runtimeOwnerId: ownerId }).then(function (result) {
    if (result.ok && result.battle && result.battle.contract_key === "capture"
      && result.battle.engine_runtime_state === "pending") {
      return startAuthoritativeCaptureBattle({
        commandId: globalThis.crypto.randomUUID(),
        expectedPlayerRevision: result.playerRevision,
        runtimeOwnerId: ownerId,
        encounterId: result.battle.encounter_id,
        activeSlot: Number(result.battle.player_active_slot) || 0
      }).then(function (recovered) {
        if (recovered.ok && recovered.battle) {
          state.authoritativeRevision = recovered.playerRevision;
          if (shouldOpen) {
            openAuthoritativeBattleProjection(recovered.battle, recovered.events, { history: "replace" });
          }
        }
        return recovered;
      });
    }
    if (result.ok && result.battle && result.battle.contract_key === "training"
      && ["concluded", "abandoned"].indexOf(result.battle.status) !== -1 && shouldOpen
      && result.projection && result.projection.player_state) {
      state.authoritativeRevision = result.playerRevision;
      applyAuthoritativeBattlePlayerState(result.projection.player_state);
      if (state.trainingProgression) {
        state.activeBattle = null;
        setBattleRuntimeActive(false);
        setScene({ name: "training-zone", trainingDifficulty: state.trainingProgression.difficulty || "" }, { history: "replace" });
        openAuthoritativeTrainingProgression();
        return result;
      }
    }
    if (result.ok && result.battle && ["concluded", "abandoned"].indexOf(result.battle.status) !== -1
      && shouldOpen) {
      if (state.scene && state.scene.authoritativeBattle) {
        applyAuthoritativeBattleCommandResult(state.scene, result);
        return result;
      }
      state.authoritativeRevision = result.playerRevision;
      if (result.projection && result.projection.player_state) {
        applyAuthoritativeBattlePlayerState(result.projection.player_state);
      }
      if (result.projection && result.projection.league_state) {
        state.authoritativeLeagueState = result.projection.league_state;
      }
      var terminalScene = openAuthoritativeBattleProjection(result.battle, result.events, { history: "replace" });
      handleAuthoritativeBattleTerminal(terminalScene, result.projection);
      return result;
    }
    if (result.ok && result.projection && result.projection.league_state) {
      state.authoritativeLeagueState = result.projection.league_state;
    } else if (result.ok && result.battle && result.battle.contract_key === "league"
      && ["active", "needs_player_switch"].indexOf(result.battle.status) !== -1) {
      state.authoritativeLeagueState = null;
    }
    if (!result.ok || !result.battle || ["active", "needs_player_switch"].indexOf(result.battle.status) === -1) {
      setActiveBattleMeta(null);
      if (shouldOpen) { setScene({ name: "home" }, { history: "replace" }); }
      else if (state.scene && (state.scene.name === "gyms"
        || state.scene.name === "gym-city" && state.scene.cityKey === "elite_four")) { render(); }
      return result;
    }
    setActiveBattleMeta({ battleType: ["training", "debug_training"].indexOf(result.battle.contract_key) !== -1
      ? "training_" + String(result.battle.contract_key === "debug_training" ? "debug" : result.battle.training_difficulty || "")
       : ["gym", "admin_gym"].indexOf(result.battle.contract_key) !== -1 ? "gym_" + String(result.battle.gym_key || "")
        : result.battle.contract_key === "league" ? (Number(result.battle.league_member_index) === 4
          ? "kanto_league_champion" : "kanto_league_" + (Number(result.battle.league_member_index) + 1))
         : String(result.battle.contract_key || "tackle_test"), firstActor: result.battle.first_actor, authoritative: true });
    if (!shouldOpen) { return result; }
    if (String(result.battle.runtime_owner_id || "") === ownerId) {
      openAuthoritativeBattleProjection(result.battle, result.events, { history: "replace" });
      return result;
    }
    setScene({ name: "home" }, { history: "replace" });
    openConfirm(battleTitle("battle"), [battleText("alreadyOpen")], function () {
      claimAuthoritativeBattleRuntime({ battleId: result.battle.battle_id, expectedPlayerRevision: result.playerRevision,
        expectedBattleVersion: result.battle.battle_version, runtimeOwnerId: ownerId, takeover: true }).then(function (claimResult) {
        if (!claimResult.ok) { openMessage([battleFailure("resumeFailed")], { title: battleTitle("battle") }); return; }
        state.authoritativeRevision = claimResult.playerRevision;
        getAuthoritativeBattle(result.battle.battle_id, { afterSeq: 0, limit: 100 }).then(function (fresh) {
          if (fresh.ok && fresh.battle) { state.authoritativeRevision = fresh.playerRevision; openAuthoritativeBattleProjection(fresh.battle, fresh.events, { history: "replace" }); }
        });
      });
    }, { confirmLabel: battleText("buttons.resumeHere"), confirmClass: "button-accent" });
    return result;
  });
}

registerAction("battle-authoritative-refresh", function () {
  if (state.scene && state.scene.authoritativeBattle && !state.scene.authoritativeCommandPending) {
    if (state.scene.authoritativeCommandUncertain) {
      recoverAuthoritativeBattleCommand(state.scene, { readAfter: true });
    } else {
      refreshAuthoritativeBattle({ open: true });
    }
  }
});

registerAction("battle-terminal-exit", function () {
  var scene = state.scene;
  if (scene && scene.battleDome && scene.terminalExitReady) {
    import("./battle-dome-handler.js").then(function (module) { module.exitCurrentBattleDome(scene); });
    return;
  }
  if (!scene || scene.name !== "battle" || !scene.terminalExitReady) { return; }
  setScene(battleReturnScene(scene), { history: "replace" });
});

registerAction("battle-authoritative-retry", function () {
  if (state.scene && state.scene.authoritativeBattle && state.scene.authoritativeCommandUncertain
    && !state.scene.authoritativeCommandPending) {
    recoverAuthoritativeBattleCommand(state.scene);
  }
});

registerAction("battle-authoritative-cancel", function () {
  var scene = state.scene;
  if (!scene || !scene.authoritativeBattle || !scene.authoritativeCommandUncertain || scene.authoritativeCommandPending) {
    return;
  }
  openConfirm(battleTitle("deleteChallenge"), [battleText("verifyLastCommand"), battleText("abandonIfMissing")], function () {
    cancelUncertainAuthoritativeBattle(scene);
  }, { confirmLabel: battleTitle("deleteChallenge"), confirmClass: "button-danger" });
});

function cancelUncertainAuthoritativeBattle(scene) {
  var pendingCommandId = scene.authoritativePendingCommandId;
  if (!scene || scene.authoritativeCommandPending) { return; }
  scene.authoritativeCommandPending = true;
  render();
  retryPendingAuthoritativeBattleCommand(scene.authoritativeBattleId).then(function (retried) {
    if (!state.scene || state.scene !== scene) { return null; }
    if (retried.pending && retried.ok && retried.battle) {
      applyAuthoritativeBattleCommandResult(scene, retried);
      return null;
    }
    return getAuthoritativeBattle(scene.authoritativeBattleId, { afterSeq: scene.authoritativeLastEventSeq, limit: 100 });
  }).then(function (fresh) {
    if (!fresh || !state.scene || state.scene !== scene) { return null; }
    if (!fresh.ok || !fresh.battle) {
      scene.authoritativeCommandPending = false;
      setAuthoritativeCommandUncertain(scene, fresh);
      return null;
    }
    if (Number(fresh.battle.battle_version) !== Number(scene.authoritativeBattleVersion)
      || ["concluded", "abandoned"].indexOf(String(fresh.battle.status)) !== -1) {
      applyAuthoritativeBattleCommandResult(scene, fresh);
      return null;
    }
    return clearPendingAuthoritativeBattleCommand(scene.authoritativeBattleId, pendingCommandId).then(function () {
      return abandonAuthoritativeBattle({
        battleId: scene.authoritativeBattleId,
        expectedPlayerRevision: fresh.playerRevision,
        expectedBattleVersion: fresh.battle.battle_version,
        runtimeOwnerId: authoritativeBattleRuntimeOwnerId(),
        commandId: globalThis.crypto.randomUUID()
      });
    });
  }).then(function (abandoned) {
    if (!abandoned || !state.scene || state.scene !== scene) { return; }
    if (abandoned.ok && abandoned.battle) {
      applyAuthoritativeBattleCommandResult(scene, abandoned);
      return;
    }
    scene.authoritativeCommandPending = false;
    if (abandoned.code === "revision_conflict" || abandoned.code === "battle_command_rejected") {
      readAuthoritativeBattleAfterResolution(scene);
      return;
    }
    setAuthoritativeCommandUncertain(scene, abandoned);
  }).catch(function (error) {
    if (state.scene === scene) {
      scene.authoritativeCommandPending = false;
      setAuthoritativeCommandUncertain(scene, { message: error.message });
    }
  });
}

function setBattleBottomPanel(mode) {
  var nextMode;
  var layout;
  if (!state.scene || ["battle", "admin-battle", "battle-dome-battle"].indexOf(state.scene.name) === -1) {
    return;
  }
  nextMode = mode === "teams" ? "teams" : mode === "items" && !state.scene.battleTower ? "items" : "info";
  state.scene.battleBottomPanel = nextMode;
  layout = root.querySelector(".battle-layout");
  if (layout) {
    layout.setAttribute("data-battle-active-panel", nextMode);
  }
  root.querySelectorAll('[data-action="battle-bottom-tab"]').forEach(function (btn) {
    var isSelected = btn.dataset.panel === nextMode;
    btn.classList.toggle("button-primary", isSelected);
    btn.classList.toggle("button-ghost", !isSelected);
  });
}

function openPostMoveSwitchDialog(scene) {
  openTeamChoiceDialog({
    title: battleTitle("batonPass"),
    copy: battleText("batonPassChoice"),
    activeIndex: scene.playerTeam.activeIndex,
    canCancel: false,
    entries: scene.playerTeam.combatantList.map(function (combatant, index) {
      return {
        pokemon: combatant.pokemon,
        statusLabel: combatant.isFainted() ? "KO" : (index === scene.playerTeam.activeIndex ? battleText("active") : ""),
        disabled: combatant.isFainted() || index === scene.playerTeam.activeIndex
      };
    }),
    onPick: function (index) {
      handleBattleSwitch(index);
    }
  });
}

function localizedBattleEntryChoiceEntries(kind, entries) {
  return (entries || []).map(function (entry) {
    return Object.assign({}, entry, {
      name: kind === "move" ? moveDisplayName(entry) : typeDisplayName(entry.key || entry.typeName)
    });
  });
}

function openBattleEntryChoiceOverlay(scene, combatant, choice, onPick, options) {
  var kind = String(choice && choice.kind || "");
  var entries = localizedBattleEntryChoiceEntries(kind, choice && choice.entries);
  var heldItem = combatant ? Engine.getActiveHeldItem(combatant) : null;
  if (!scene || !combatant || !heldItem || ["move", "type"].indexOf(kind) === -1 || !entries.length
    || typeof onPick !== "function") {
    return false;
  }
  scene.battleEntryChoicePanel = {
    kind: kind,
    item: heldItem,
    pokemon: combatant.pokemon,
    entries: entries,
    canCancel: Boolean(options && options.canClose),
    onPick: onPick
  };
  // A complete render invalidates any pending scene transition and places the
  // choice inside the player's battle card, preserving the battle context.
  render();
  return true;
}

export function openBattleEntryChoicePanel(scene, combatant, _anchorElement, onPick, options) {
  var kind = scene && scene.manager ? scene.manager.entryHeldItemChoiceKind(combatant) : "";
  var entries = kind ? scene.manager.entryHeldItemChoiceEntries(combatant) : [];
  if (!kind || !entries.length) {
    return false;
  }
  return openBattleEntryChoiceOverlay(scene, combatant, { kind: kind, entries: entries }, function (choiceIndex) {
    onPick({ index: Number(choiceIndex), kind: kind });
  }, options);
}

function completeInitialBattleEntry(scene, entryChoice) {
  var eventData;
  eventData = {
    actor: "player",
    targetIndex: scene.playerTeam.activeIndex
  };
  if (entryChoice) {
    eventData.entryChoice = entryChoice;
  }
  appendBattleEvents(scene, [{
    eventType: "entry_item",
    eventData: eventData
  }]);
  scene.initialEntryCompleted = true;
  if (sceneHasPendingAdminEntryChoice(scene)) {
    waitForAdminEntryChoice(scene);
    render({ scrollBattleLogToBottom: true });
    return;
  }
  showBattleFollowup(scene);
}

function waitForAdminEntryChoice(scene) {
  scene.initialEntryCompleted = true;
  scene.manager.waitingFor = "admin";
  appendBattleEvents(scene, [{
    eventType: "player_entry",
    eventData: {
      actor: "player",
      targetIndex: scene.playerTeam.activeIndex
    }
  }]);
  notifyAdminIfWaiting(scene);
}

export function openPendingBattleEntryChoice(scene) {
  if (scene && (scene.battleHistoryView || scene.battleHistoryLoading)) return false;
  var pending = scene && scene.authoritativeBattle ? pendingOwnedBattleEntryChoice(scene) : null;
  var combatant = pending ? pending.combatant : scene && scene.playerTeam ? scene.playerTeam.getActive() : null;
  var panelOpened;
  if (!scene || !scene.manager || !combatant || scene.manager.battleOver) {
    return false;
  }
  if (scene.authoritativeBattle) {
    if (!pending || scene.battleEntryChoicePanel) return false;
    var authoritativeChoice = pending.choice;
    if (!authoritativeChoice || !Array.isArray(authoritativeChoice.entries) || !authoritativeChoice.entries.length) {
      return false;
    }
    return openBattleEntryChoiceOverlay(scene, combatant, authoritativeChoice, function (choiceIndex) {
      if (scene.battleDome) {
        scene.authoritativeCommandPending = true;
        import("./battle-dome-handler.js").then(function (module) {
          module.runBattleDomeCommand(scene, "entry_choice", {
            entryChoice: { index: Number(choiceIndex), kind: String(authoritativeChoice.kind || "") }
          });
        });
        return;
      }
      authoritativeBattleCommand(scene, function (input) {
        return resolveAuthoritativeBattleEntryChoice(Object.assign(input, {
          entryChoice: { index: Number(choiceIndex), kind: String(authoritativeChoice.kind || "") }
        }));
      });
    }, { canClose: false });
  }
  panelOpened = openBattleEntryChoicePanel(scene, combatant, null, function (entryChoice) {
    runBattleRuntimeAction(function () {
      if (!scene.manager.applyEntryHeldItemChoice(combatant, entryChoice)) {
        render({ scrollBattleLogToBottom: true });
        return;
      }
      completeInitialBattleEntry(scene, entryChoice);
    });
  }, { canClose: false });
  if (!panelOpened && sceneHasPendingAdminEntryChoice(scene)) {
    return runBattleRuntimeAction(function () {
      waitForAdminEntryChoice(scene);
      render({ scrollBattleLogToBottom: true });
    });
  }
  if (!panelOpened && sceneNeedsInitialPlayerEntryChoice(scene)) {
    return runBattleRuntimeAction(function () {
      completeInitialBattleEntry(scene, null);
    });
  }
  return panelOpened;
}

function handleBattleSwitch(index, entryChoice, anchorElement) {
  runBattleRuntimeAction(function () {
    performBattleSwitch(index, entryChoice, anchorElement);
  });
}

function performBattleSwitch(index, entryChoice, anchorElement) {
  var scene = state.scene;
  var capturedSwitchEvents;
  var switchEventData;
  var switched;
  if (["battle", "battle-dome-battle"].indexOf(scene.name) === -1) {
    return;
  }
  if (scene.authoritativeBattle) {
    var authoritativeTarget = scene.playerTeam.combatantList[index];
    if (!authoritativeTarget || authoritativeTarget.isFainted()) { return; }
    if (!entryChoice && openBattleEntryChoicePanel(scene, authoritativeTarget,
      anchorElement || root.querySelector('[data-action="battle-switch"][data-index="' + index + '"]'), function (choice) {
        handleBattleSwitch(index, choice, anchorElement);
      }, { canClose: true })) {
      return;
    }
    window.scrollTo(0, 0);
    if (scene.battleDome) {
      scene.authoritativeCommandPending = true;
      render({ preserveScroll: true });
      import("./battle-dome-handler.js").then(function (module) {
        module.runBattleDomeCommand(scene, "switch", {
          teamSlot: authoritativeTarget.pokemon.authoritativeSlot,
          entryChoice: entryChoice || null
        });
      });
      return;
    }
    authoritativeBattleCommand(scene, function (input) {
      return switchAuthoritativeBattlePokemon(Object.assign(input, {
        teamSlot: authoritativeTarget.pokemon.authoritativeSlot,
        entryChoice: entryChoice || null
      }));
    });
    return;
  }
  state.dialog = null;
  var targetCombatant = scene.playerTeam.combatantList[index];
  if (!targetCombatant) {
    return;
  }
  if (targetCombatant.isFainted()) {
    openMessage([battleText("targetFainted", { pokemon: pokemonNameDescriptor(targetCombatant.pokemon) })], { title: battleTitle("battle") });
    return;
  }
  if (!entryChoice && openBattleEntryChoicePanel(scene, targetCombatant, anchorElement || root.querySelector('[data-action="battle-switch"][data-index="' + index + '"]'), function (choice) {
    handleBattleSwitch(index, choice, anchorElement);
  }, { canClose: true })) {
    return;
  }
  if (sceneIsAdminControlled(scene)) {
    capturedSwitchEvents = [];
    switched = scene.manager.playerSwitch(index, entryChoice || null);
  } else {
    capturedSwitchEvents = captureNpcEventsDuring(scene, function () {
      switched = scene.manager.playerSwitch(index, entryChoice || null);
    });
  }
  if (!switched) {
    openMessage([battleText("switchFailed")], { title: battleTitle("battle") });
    return;
  }
  switchEventData = { actor: "player", targetIndex: index };
  if (entryChoice) {
    switchEventData.entryChoice = entryChoice;
  }
  if (scene.manager.lastPlayerActionSkipped) {
    switchEventData.skipped = true;
  }
  appendBattleEvents(scene, [{
    eventType: "switch",
    eventData: switchEventData
  }].concat(capturedSwitchEvents));
  notifyAdminIfWaiting(scene);
  showBattleFollowup(scene);
  window.scrollTo(0, 0);
}

export function closeBattleTargetPanel() {
  var existingPanel = root.querySelector("[data-floating-panel]");
  if (battleTargetPanelCleanup) {
    battleTargetPanelCleanup();
    battleTargetPanelCleanup = null;
  }
  if (existingPanel) {
    existingPanel.remove();
  }
  state.battleTargetPanel = { visible: false, itemIndex: null, entries: [], position: null };
}

function buildBattleItemTargetEntries(scene, item) {
  return Array.from({ length: TEAM_MAX }, function (_, index) {
    var combatant = scene.playerTeam.combatantList[index];
    if (!combatant || !combatant.pokemon) {
      return { name: "", idx: index, selectable: false };
    }
    return {
      name: pokemonDisplayName(combatant.pokemon),
      idx: index,
      selectable: scene.manager.canUseItemOnTarget(item, combatant).ok
    };
  });
}

var battleTargetPanelCleanup = null;
var battleStartTargetPanelCleanup = null;
var battleStartTargetPanelCallback = null;

function positionBattleTargetPanel(anchorElement, panel) {
  var rect = anchorElement.getBoundingClientRect();
  var viewportWidth = document.documentElement.clientWidth || window.innerWidth || 0;
  var margin = 10;
  var panelWidth;
  var desiredLeft;
  var minLeft;
  var maxLeft;
  var top;

  panel.style.maxHeight = "";
  panel.style.overflowY = "";
  panelWidth = panel.offsetWidth;
  desiredLeft = rect.left + rect.width / 2 - panelWidth / 2;
  minLeft = margin;
  maxLeft = Math.max(minLeft, viewportWidth - panelWidth - margin);
  top = Math.round(rect.bottom + margin);

  return {
    left: Math.round(Math.min(Math.max(desiredLeft, minLeft), maxLeft)),
    top: top
  };
}

function floatingPanelGridClass(count) {
  return "floating-panel-grid floating-panel-grid-count-" + Math.min(3, Math.max(1, Number(count) || 1));
}

export function openBattleTargetPanel(anchorElement, item, entries, actionName, emptyText) {
  var backdrop = document.createElement("div");
  var panel = document.createElement("section");
  var title = document.createElement("h3");
  var grid = document.createElement("div");
  var targetAction = actionName || "battle-item-target";
  var selectableEntries = entries.filter(function (entry) {
    return entry && entry.name && entry.selectable;
  });

  closeBattleTargetPanel();
  state.battleTargetPanel = {
    visible: true,
    itemIndex: item.index,
    entries: entries,
    position: null
  };

  backdrop.className = "floating-panel-backdrop";
  backdrop.dataset.action = "battle-target-close";
  backdrop.dataset.floatingPanel = "true";

  panel.className = "floating-panel pokemon_choice-panel";
  panel.style.left = "0";
  panel.style.top = "0";
  panel.style.visibility = "hidden";

  if (!selectableEntries.length) {
    var emptyMessage = document.createElement("div");
    emptyMessage.className = "floating-panel-empty";
    emptyMessage.textContent = resolveText(emptyText || battleText("unusable"));
    panel.className += " is-empty";
    panel.appendChild(emptyMessage);
  } else {
    title.className = "floating-panel-title";
    title.textContent = battleTextNow("useOn", { item: itemDisplayName(item) });
    panel.appendChild(title);

    grid.className = floatingPanelGridClass(selectableEntries.length);
    selectableEntries.forEach(function (entry) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "floating-panel-btn selectable";
      button.dataset.action = targetAction;
      button.dataset.index = String(entry.idx);
      button.dataset.itemIndex = String(item.index);
      button.textContent = entry.name;
      grid.appendChild(button);
    });
    panel.appendChild(grid);
  }

  backdrop.appendChild(panel);
  root.appendChild(backdrop);

  function syncBattleTargetPanelPosition() {
    var nextPosition;
    if (!anchorElement.isConnected || !panel.isConnected) {
      closeBattleTargetPanel();
      return;
    }
    nextPosition = positionBattleTargetPanel(anchorElement, panel);
    state.battleTargetPanel.position = nextPosition;
    panel.style.left = nextPosition.left + "px";
    panel.style.top = nextPosition.top + "px";
    panel.style.visibility = "";
  }

  syncBattleTargetPanelPosition();

  window.addEventListener("scroll", syncBattleTargetPanelPosition, true);
  window.addEventListener("resize", syncBattleTargetPanelPosition);
  battleTargetPanelCleanup = function () {
    window.removeEventListener("scroll", syncBattleTargetPanelPosition, true);
    window.removeEventListener("resize", syncBattleTargetPanelPosition);
  };
}

function showBattleTargetPanelEmptyMessage(message) {
  var panel = root.querySelector(".floating-panel");
  var emptyMessage;
  if (!panel) {
    return;
  }
  panel.classList.add("is-empty");
  panel.innerHTML = "";
  emptyMessage = document.createElement("div");
  emptyMessage.className = "floating-panel-empty";
  emptyMessage.textContent = resolveText(message || battleText("unusable"));
  panel.appendChild(emptyMessage);
}

function closeBattleStartTargetPanel() {
  var existingPanel = root.querySelector("[data-battle-start-panel]");
  if (battleStartTargetPanelCleanup) {
    battleStartTargetPanelCleanup();
    battleStartTargetPanelCleanup = null;
  }
  if (existingPanel) {
    existingPanel.remove();
  }
  battleStartTargetPanelCallback = null;
}

export function openBattleStartTargetPanel(anchorElement, entries, onPick, options) {
  var backdrop = document.createElement("div");
  var panel = document.createElement("section");
  var grid = document.createElement("div");
  var position;
  options = options || {};

  closeBattleStartTargetPanel();
  if (!anchorElement || !entries || !entries.length || typeof onPick !== "function") {
    return;
  }

  position = function (el) {
    var rect = el.getBoundingClientRect();
    return { left: Math.round(rect.left + rect.width / 2), top: Math.round(rect.bottom + 10) };
  }(anchorElement);
  battleStartTargetPanelCallback = onPick;

  backdrop.className = "floating-panel-backdrop";
  if (options.canClose !== false) {
    backdrop.dataset.action = "battle-start-target-close";
  }
  backdrop.dataset.battleStartPanel = "true";

  panel.className = "floating-panel pokemon_choice-panel battle-start-panel";
  panel.style.left = position.left + "px";
  panel.style.top = position.top + "px";
  panel.style.transform = "translateX(-50%)";

  var title = document.createElement("h3");
  title.className = "battle-start-title";
  title.textContent = resolveText(options.title || battleText("chooseFirst"));
  panel.appendChild(title);

  grid.className = floatingPanelGridClass(entries.length);
  entries.forEach(function (entry) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "floating-panel-btn selectable";
    button.dataset.action = "battle-start-target";
    button.dataset.index = String(entry.index);
    button.textContent = entry.name;
    grid.appendChild(button);
  });
  panel.appendChild(grid);
  backdrop.appendChild(panel);
  root.appendChild(backdrop);

  function syncBattleStartTargetPanelPosition() {
    var nextPosition;
    if (!anchorElement.isConnected || !panel.isConnected) {
      closeBattleStartTargetPanel();
      return;
    }
    nextPosition = function (el) {
      var rect = el.getBoundingClientRect();
      return { left: Math.round(rect.left + rect.width / 2), top: Math.round(rect.bottom + 10) };
    }(anchorElement);
    panel.style.left = nextPosition.left + "px";
    panel.style.top = nextPosition.top + "px";
  }

  window.addEventListener("scroll", syncBattleStartTargetPanelPosition, true);
  window.addEventListener("resize", syncBattleStartTargetPanelPosition);
  battleStartTargetPanelCleanup = function () {
    window.removeEventListener("scroll", syncBattleStartTargetPanelPosition, true);
    window.removeEventListener("resize", syncBattleStartTargetPanelPosition);
  };
}

function returnToTrainingZone(scene) {
  setScene({
    name: "training-zone",
    trainingDifficulty: scene && scene.trainingDifficulty ? scene.trainingDifficulty : "",
    trainingOpponentTeam: scene && Array.isArray(scene.trainingOpponentTeam) ? scene.trainingOpponentTeam.slice() : [],
    trainingOpponent: scene && scene.trainingOpponent ? normalizeTrainingOpponentProfile(scene.trainingOpponent) : null
  }, { history: "replace" });
}

export function battleReturnScene(scene) {
  if (scene && scene.battleTower) {
    return { name: "battle-tower" };
  }
  if (scene && scene.trainingBattle) {
    return {
      name: "training-zone",
      trainingDifficulty: scene.trainingScene && scene.trainingScene.trainingDifficulty ? scene.trainingScene.trainingDifficulty : "",
      trainingOpponentTeam: scene.trainingScene && Array.isArray(scene.trainingScene.trainingOpponentTeam) ? scene.trainingScene.trainingOpponentTeam.slice() : [],
      trainingOpponent: scene.trainingScene && scene.trainingScene.trainingOpponent ? normalizeTrainingOpponentProfile(scene.trainingScene.trainingOpponent) : null
    };
  }
  if (scene && scene.captureScene && scene.captureScene.zoneName) {
    return createCaptureScene(scene.captureScene.zoneName, scene.captureScene);
  }
  if (scene && scene.gymScene && scene.gymScene.cityKey) {
    if (scene.kantoLeague) {
      return { name: "gyms" };
    }
    return { name: "gym-city", cityKey: scene.gymScene.cityKey };
  }
  return { name: "home" };
}

function finishTrainingBattle(scene, lines) {
  saveBattleEndAfterInventorySync(scene);
  openMessage(lines, {
    title: battleTitle("training"),
    closeLabel: "Ok",
    closeClass: "button-accent",
    requireButtonClose: true,
    scrollBattleLogToBottom: true,
    onClose: function () {
      showTerminalBattleScreen(scene);
    }
  });
}

function finishGymBattle(scene, lines) {
  if (sceneIsAdminControlled(scene)) {
    finishAdminControlledGymBattle(scene, lines);
    return;
  }
  var city = scene && scene.gymScene ? kantoGymCityByKey(scene.gymScene.cityKey) : null;
  var badgeCount = Math.max(0, Math.floor(Number(state.trainerInfo[2]) || 0));
  var gymReward = city ? GYM_REWARDS[city.badgeIndex] : null;
  var rewardMoney = gymReward ? Number(gymReward.money) || 0 : 0;
  var rewardTM = gymReward && gymReward.tm ? getItemByIndex(gymReward.tm) : null;
  var rewardItem = gymReward && gymReward.item ? getItemByIndex(gymReward.item) : null;
  var rewardItemQuantity = Math.max(1, Number(gymReward && gymReward.itemQuantity) || 1);
  var rewardLines = (lines && lines.length ? lines : localizedBattleResultLines(scene)).slice();
  if (!scene.gymRewardHandled && city && badgeCount === city.badgeIndex) {
    updateTrainerProfile(function (trainerInfo) {
      return [trainerInfo[0], (Number(trainerInfo[1]) || 0) + rewardMoney, Math.min(8, badgeCount + 1), trainerInfo[3]];
    });
    if (rewardTM) {
      adjustInventoryItemQuantity(rewardTM.index, 1);
    }
    if (rewardItem) {
      adjustInventoryItemQuantity(rewardItem.index, rewardItemQuantity);
    }
    scene.gymRewardHandled = true;
    rewardLines.push(battleText("earnedMoney", { money: moneyText(rewardMoney) }));
    if (rewardTM) {
      rewardLines.push(battleText("earnedItem", { item: itemNameDescriptor(rewardTM) }));
    }
    if (rewardItem) {
      rewardLines.push(battleText(rewardItemQuantity > 1 ? "earnedItems" : "earnedItem", { quantity: rewardItemQuantity, item: itemNameDescriptor(rewardItem) }));
    }
    rewardLines.push(battleText("earnedBadge", { badge: textDescriptor("ui.gyms.badges." + KANTO_GYM_BADGES[city.badgeIndex].key) }));
  }
  saveBattleEndAfterInventorySync(scene);
  openMessage(rewardLines, {
    title: battleTitle("gym"),
    closeLabel: "Ok",
    closeClass: "button-accent",
    scrollBattleLogToBottom: true,
    requireButtonClose: true,
    onClose: function () {
      showTerminalBattleScreen(scene);
    }
  });
}

function applyBattleMoneyPenalty(scene) {
  var currentMoney = Number(state.trainerInfo[1]) || 0;
  var moneyPenalty = scene && scene.lossPenaltyAmount;
  if (!scene) {
    return 0;
  }
  if (!scene.lossPenaltyApplied) {
    moneyPenalty = Math.floor(currentMoney / 5);
    scene.lossPenaltyApplied = true;
    scene.lossPenaltyAmount = moneyPenalty;
    adjustTrainerMoney(-moneyPenalty);
  }
  return Number.isFinite(moneyPenalty) ? moneyPenalty : 0;
}

function abandonTrainingBattle(scene) {
  scene.manager.endBattle();
  scene.trainingResultHandled = true;
  markDirty();
  persistAndCloseFinishedBattle(scene);
  openMessage([battleText("trainingAbandoned")], {
    title: battleTitle("training"),
    closeLabel: "Ok",
    closeClass: "button-accent",
    scrollBattleLogToBottom: true,
    requireButtonClose: true,
    onClose: function () { showTerminalBattleScreen(scene); }
  });
}

function confirmBattleAbandon(scene) {
  openConfirm(
    battleTitle("abandon"),
    [battleText("abandonConfirm")],
    function () {
      if (scene.trainingBattle) {
        abandonTrainingBattle(scene);
        return;
      }
      if (scene.gymScene) {
        applyBattleMoneyPenalty(scene);
      }
      scene.manager.endBattle();
      markDirty();
      saveBattleEndAfterInventorySync(scene);
      showTerminalBattleScreen(scene);
    },
    {
      confirmLabel: battleText("buttons.yes"),
      confirmClass: "button-danger"
    }
  );
}

function abandonBattleAndExit(scene) {
  var moneyPenalty;
  if (!scene || ["battle", "battle-dome-battle"].indexOf(scene.name) === -1) {
    return;
  }
  if (scene.authoritativeBattle) {
    authoritativeBattleCommand(scene, function (input) { return abandonAuthoritativeBattle(input); });
    return;
  }
  scene.manager.endBattle();
  if (scene.trainingBattle) {
    scene.trainingResultHandled = true;
  }
  if (scene.gymScene) {
    moneyPenalty = applyBattleMoneyPenalty(scene);
  }
  markDirty();
  saveBattleEndAfterInventorySync(scene, { renderOnComplete: false }).then(function (result) {
    if (result && result.ok === false) {
      openMessage([battleFailure("abandonSaveFailed")], { title: battleTitle("battle") });
      return;
    }
    closePersistedBattleRuntime(scene).then(function (closeResult) {
      if (closeResult && closeResult.ok === false) {
        openMessage([battleFailure("closeEncounterFailed")], { title: battleTitle("battle") });
        return;
      }
      if (scene.gymScene) {
        openMessage([battleText("retired"), battleText("lostMoney", { money: moneyText(moneyPenalty) })], {
          title: battleTitle("withdraw"),
          closeLabel: "Ok",
          closeClass: "button-accent",
          requireButtonClose: true,
          scrollBattleLogToBottom: true,
          onClose: function () {
            showTerminalBattleScreen(scene);
          }
        });
        return;
      }
      openMessage([battleText("abandoned")], {
        title: battleTitle("battle"),
        closeLabel: "Ok",
        closeClass: "button-accent",
        requireButtonClose: true,
        scrollBattleLogToBottom: true,
        onClose: function () { showTerminalBattleScreen(scene); }
      });
    });
  });
}

function showTrainingBattleFollowup(scene) {
  var config = scene.trainingConfig || trainingDifficultyConfig(scene.trainingDifficulty);

  scene.manager.consumeExpEvents();
  if (scene.manager.playerNeedsSwitch) {
    render({ scrollBattleLogToBottom: true });
    return;
  }
  if (scene.manager.playerPostMoveSwitch) {
    openPostMoveSwitchDialog(scene);
    render({ scrollBattleLogToBottom: true });
    return;
  }
  if (!scene.manager.battleOver) {
    render({ scrollBattleLogToBottom: true });
    return;
  }
  if (scene.trainingResultHandled) {
    render({ scrollBattleLogToBottom: true });
    return;
  }

  scene.trainingResultHandled = true;
  if (scene.playerTeam.isAllFainted()) {
    finishTrainingBattle(scene, [battleText("trainingLost")]);
    return;
  }

  if (!config) {
    finishTrainingBattle(scene, [battleText("challengeConcluded")]);
    return;
  }

  openTrainingRewardAssignment(scene);
}

function showBattleFollowup(scene) {
  if (scene.trainingBattle) {
    showTrainingBattleFollowup(scene);
    return;
  }

  if (scene.manager.battleFled) {
    abandonBattleAndExit(scene);
    return;
  }

  if (scene.manager.battleOver && scene.playerTeam.isAllFainted()) {
    var moneyPenalty = applyBattleMoneyPenalty(scene);
    markDirty();
    persistAndCloseFinishedBattle(scene);
    openMessage([battleText("allPokemonKo"), battleText(scene.gymScene ? "lostMoney" : "lostMoneyConfusion", { money: moneyText(moneyPenalty) })], {
      title: battleTitle("battle"),
      closeLabel: "Ok",
      closeClass: "button-accent",
      requireButtonClose: true,
      scrollBattleLogToBottom: true,
      onClose: function () { showTerminalBattleScreen(scene); }
    });
    return;
  }

  var lines = [];
  if (scene.manager.playerNeedsSwitch) {
    render({ scrollBattleLogToBottom: true });
    return;
  }
  if (scene.manager.playerPostMoveSwitch) {
    openPostMoveSwitchDialog(scene);
    render({ scrollBattleLogToBottom: true });
    return;
  }

  if (scene.manager.battleOver) {
    var expPayloads = aggregateBattleExpEvents(scene, scene.manager.consumeExpEvents());
    if (expPayloads.length && !scene.postBattleExpCompleted) {
      startPersistedPostBattleExp(scene, expPayloads, function () {
        finishPostBattleProgression(scene);
      });
      return;
    }
    if (scene.gymScene && scene.enemyTeam.isAllFainted()) {
      if (scene.kantoLeague) {
        finishKantoLeagueBattle(scene, lines);
      } else {
        finishGymBattle(scene, lines);
      }
      return;
    }
    if (!lines.length) {
      lines = localizedBattleResultLines(scene);
    }
    markDirty();
    saveBattleEndAfterInventorySync(scene, { renderOnComplete: false }).then(function () {
      closePersistedBattleRuntime(scene);
    });
    openMessage(lines, {
      title: "",
      closeLabel: "Ok",
      closeClass: "button-accent",
      requireButtonClose: true,
      scrollBattleLogToBottom: true,
      onClose: function () { showTerminalBattleScreen(scene); }
    });
    return;
  }

  if (lines.length) {
    openMessage(lines, {
      title: battleTitle("battle"),
      closeLabel: battleText("buttons.continue"),
      closeClass: "button-accent",
      scrollBattleLogToBottom: true
    });
    return;
  }

  render({ scrollBattleLogToBottom: true });
}
