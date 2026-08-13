import { claimPlayerMission, recordPlayerMissionProgress, syncPlayerMissions } from "../api/pokefan-missions.js";
import {
  MISSION_CATEGORY_ADVENTURE,
  MISSION_CATEGORY_CAPTURE,
  MISSION_CATEGORY_DAILY,
  MISSION_STATUS_CLAIMED,
  MISSION_STATUS_SKIPPED,
  MISSION_STATUS_UNCLAIMED,
  adventurePhaseMissions,
  defaultPokefanMissionRows,
  pokefanMissionByIndex,
  pokefanMissionsForMode
} from "../data/pokefan-missions.js";
import { state } from "./game-state.js";
import { render } from "./renderer.js";
import { replaceInventoryRuntimeState, replaceTrainerMoneyRuntimeState } from "./runtime-state.js";
import { applyLocalDailyReset } from "./mission-reset.js";

var MISSION_RUNTIME_STORAGE_PREFIX = "pokemon_game_revival:runtime:missions:";
var missionOperationQueue = Promise.resolve();
var tabId = String(Date.now()) + "-" + Math.random().toString(36).slice(2);

function authUserId() {
  return state.auth && state.auth.user ? String(state.auth.user.id || "") : "";
}

function ensureMissionState() {
  if (!state.missions) {
    state.missions = createDefaultMissionState();
  }
  return state.missions;
}

function enqueueMissionOperation(operation) {
  missionOperationQueue = missionOperationQueue.then(operation, operation);
  return missionOperationQueue;
}

function shouldRenderClub() {
  return state.scene && state.scene.name === "city-fanclub";
}

function currentMissionCatalog() {
  return pokefanMissionsForMode();
}

export function missionCatalogByIndex(missionIndex) {
  return pokefanMissionByIndex(missionIndex);
}

export function missionCategories() {
  return [MISSION_CATEGORY_ADVENTURE, MISSION_CATEGORY_CAPTURE, MISSION_CATEGORY_DAILY];
}

function normalizeRuntimeRow(row) {
  return {
    missionIndex: Number(row && row.missionIndex),
    counter: Math.max(0, Math.floor(Number(row && row.counter) || 0)),
    claimStatus: String(row && row.claimStatus || MISSION_STATUS_UNCLAIMED),
    trackedKeys: Array.isArray(row && row.trackedKeys) ? row.trackedKeys.map(String) : [],
    lastCountedDay: row && row.lastCountedDay || null,
    claimCount: Math.max(0, Math.floor(Number(row && row.claimCount) || 0)),
    lastClaimedAt: row && row.lastClaimedAt || null,
    lastUpdateAt: row && row.lastUpdateAt || null,
    dailyResetDate: row && row.dailyResetDate || null
  };
}

function resetDailyRows(rows) {
  var resetIndexes = applyLocalDailyReset(rows);
  if (resetIndexes.indexOf(Number(ensureMissionState().claimedNoticeMissionIndex)) !== -1) {
    ensureMissionState().claimedNoticeMissionIndex = null;
  }
  if (resetIndexes.length) {
    recalculateClaimableState();
  }
}

function replaceMissionRows(rows) {
  var byIndex = {};
  (rows || []).forEach(function (row) {
    byIndex[Number(row.missionIndex)] = normalizeRuntimeRow(row);
  });
  ensureMissionState().rows = defaultPokefanMissionRows().map(function (row) {
    return byIndex[row.missionIndex] || row;
  });
  resetDailyRows(ensureMissionState().rows);
  recalculateClaimableState();
}

function broadcastMissionState() {
  var userId = authUserId();
  if (!userId || typeof window === "undefined" || !window.localStorage) {
    return;
  }
  try {
    window.localStorage.setItem(MISSION_RUNTIME_STORAGE_PREFIX + userId, JSON.stringify({
      source: tabId,
      invalidation: true,
      revision: Number(state.authoritativeRevision) || 0,
      updatedAt: Date.now()
    }));
  } catch (error) {}
}

function rowByIndex(missionIndex, rows) {
  return (rows || ensureMissionState().rows).find(function (row) {
    return Number(row.missionIndex) === Number(missionIndex);
  }) || null;
}

function phaseRowsAreClaimed(phase, rows) {
  return adventurePhaseMissions(phase).every(function (mission) {
    var row = rowByIndex(mission.missionIndex, rows);
    return row && (row.claimStatus === MISSION_STATUS_CLAIMED || row.claimStatus === MISSION_STATUS_SKIPPED);
  });
}

export function createDefaultMissionState() {
  return {
    loading: false,
    error: "",
    rows: defaultPokefanMissionRows(),
    claimingMissionIndex: null,
    claimedNoticeMissionIndex: null,
    hasClaimableCompletion: false
  };
}

export function missionRows() {
  resetDailyRows(ensureMissionState().rows);
  return currentMissionCatalog().map(function (mission) {
    var row = rowByIndex(mission.missionIndex) || {};
    return Object.assign({}, mission, normalizeRuntimeRow(Object.assign({ missionIndex: mission.missionIndex }, row)));
  });
}

export function missionRowsByCategory(category) {
  return missionRows().filter(function (mission) { return mission.category === category; });
}

export function missionByIndex(missionIndex) {
  var mission = missionCatalogByIndex(missionIndex);
  var row = rowByIndex(missionIndex);
  return mission && row ? Object.assign({}, mission, normalizeRuntimeRow(row)) : null;
}

export function adventurePhaseIsUnlocked(phase, rows, badges) {
  var normalizedPhase = Math.max(1, Math.floor(Number(phase) || 1));
  var badgeCount = Math.max(0, Math.floor(Number(badges) || 0));
  if (normalizedPhase === 1) {
    return true;
  }
  return badgeCount >= normalizedPhase - 1 && phaseRowsAreClaimed(normalizedPhase - 1, rows || ensureMissionState().rows);
}

export function missionIsActive(mission, rows, badges) {
  var runtimeRows = rows || ensureMissionState().rows;
  var badgeCount = badges === undefined ? state.trainerInfo[2] : badges;
  var row = rowByIndex(mission && mission.missionIndex, runtimeRows);
  if (!mission || !row || row.claimStatus === MISSION_STATUS_CLAIMED || row.claimStatus === MISSION_STATUS_SKIPPED) {
    return false;
  }
  if (mission.category === MISSION_CATEGORY_DAILY) {
    return row.claimStatus === MISSION_STATUS_UNCLAIMED;
  }
  if (mission.category === MISSION_CATEGORY_CAPTURE) {
    return row.claimStatus === MISSION_STATUS_UNCLAIMED;
  }
  if (!adventurePhaseIsUnlocked(mission.phase, runtimeRows, badgeCount)) {
    return false;
  }
  return true;
}

export function adventurePhaseIsCompleted(phase, rows) {
  var runtimeRows = rows || ensureMissionState().rows;
  return adventurePhaseMissions(phase).every(function (mission) {
    var row = rowByIndex(mission.missionIndex, runtimeRows);
    return row && (row.claimStatus === MISSION_STATUS_CLAIMED || row.claimStatus === MISSION_STATUS_SKIPPED);
  });
}

export function adventurePhaseIsClaimed(phase, rows) {
  return phaseRowsAreClaimed(phase, rows || ensureMissionState().rows);
}

export function missionIsClaimable(mission, rows) {
  var runtimeRows = rows || ensureMissionState().rows;
  var row = rowByIndex(mission && mission.missionIndex, runtimeRows);
  return Boolean(mission && row && missionIsActive(mission, runtimeRows, state.trainerInfo[2]) && Number(row.counter) >= Number(mission.target));
}

function recalculateClaimableState() {
  ensureMissionState().hasClaimableCompletion = currentMissionCatalog().some(function (mission) {
    return missionIsClaimable(mission);
  });
  return ensureMissionState().hasClaimableCompletion;
}

export function hasClaimableMission() {
  return recalculateClaimableState();
}

export function firstClaimableMissionCategory() {
  var mission = currentMissionCatalog().find(function (entry) { return missionIsClaimable(entry); });
  return mission ? mission.category : MISSION_CATEGORY_ADVENTURE;
}

export function refreshMissionState(options) {
  var missionState = ensureMissionState();
  var renderOnComplete = !(options && options.renderOnComplete === false);
  missionState.loading = true;
  missionState.error = "";
  return enqueueMissionOperation(function () {
    return syncPlayerMissions().then(function (result) {
      missionState.loading = false;
      if (result.ok) {
        replaceMissionRows(result.rows);
        if (!(options && options.keepClaimNotice)) {
          missionState.claimedNoticeMissionIndex = null;
        }
        if (!(options && options.broadcast === false)) {
          broadcastMissionState();
        }
      } else {
        missionState.error = result.message || "Impossibile aggiornare le missioni.";
      }
      if (renderOnComplete) {
        render();
      }
      return result;
    }).catch(function (error) {
      missionState.loading = false;
      missionState.error = error.message || "Impossibile aggiornare le missioni.";
      if (renderOnComplete) {
        render();
      }
      return { ok: false, message: missionState.error };
    });
  });
}

export function createMissionEventKey(prefix, parts) {
  var suffix = Array.isArray(parts) ? parts.filter(function (part) { return part !== null && part !== undefined && part !== ""; }).map(String).join(":") : "";
  if (!suffix && typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    suffix = crypto.randomUUID();
  }
  if (!suffix) {
    suffix = Date.now() + ":" + Math.random().toString(36).slice(2);
  }
  return String(prefix || "mission") + ":" + suffix;
}

function trainingMissionMatches(mission, payload) {
  var difficulty = String(payload && payload.difficulty || "");
  var teamSize = Math.max(0, Math.floor(Number(payload && payload.teamSizeAtStart) || 0));
  var acceptedDifficulties = mission.difficulties || (mission.difficulty ? [mission.difficulty] : []);
  return acceptedDifficulties.indexOf(difficulty) !== -1 && teamSize >= (Number(mission.minTeamSize) || 0);
}

function eventUpdateForMission(mission, eventType, payload) {
  var dexNumber = Math.floor(Number(payload && payload.dexNumber) || 0);
  var types = Array.isArray(payload && payload.types) ? payload.types : [];
  var speciesKey = String(payload && payload.speciesKey || "");
  var matches = false;
  var amount = 1;
  var distinctKey = "";
  if (eventType === "pokemon-captured") {
    matches = mission.type === "total-captures" || mission.type === "total-captures-after-badge";
    if (mission.type === "same-type") {
      matches = types.indexOf(mission.typeName) !== -1;
    }
    if (mission.type === "species-specific") {
      matches = dexNumber > 0 && mission.speciesDexNumbers.indexOf(dexNumber) !== -1;
      distinctKey = matches ? String(dexNumber) : "";
    }
  } else if (eventType === "pokedex-species-registered") {
    matches = mission.type === "species-different";
    distinctKey = dexNumber > 0 ? String(dexNumber) : "";
  } else if (eventType === "berries-harvested") {
    matches = mission.type === "berries-harvested";
    amount = Math.max(1, Math.floor(Number(payload && payload.quantity) || 1));
  } else if (eventType === "training-victory") {
    matches = (mission.type === "training-victory" || mission.type === "training-difficulties") && trainingMissionMatches(mission, payload);
    if (mission.type === "training-difficulties") {
      distinctKey = matches ? "difficulty:" + String(payload && payload.difficulty || "") : "";
    }
  } else if (eventType === "held-item-assigned") {
    matches = mission.type === "held-item-assigned";
  } else if (eventType === "pokemon-level-up") {
    matches = mission.type === "distinct-species-level-up" && Boolean(speciesKey);
    distinctKey = speciesKey;
  } else if (eventType === "pokemon-evolved") {
    matches = mission.type === "distinct-species-evolved" && Boolean(speciesKey);
    distinctKey = speciesKey;
  } else if (eventType === "daycare-cycle-completed") {
    matches = mission.type === "daycare-cycle-completed";
  }
  if (!matches) {
    return null;
  }
  return {
    mission_index: mission.missionIndex,
    target: mission.target,
    amount: amount,
    distinct_key: distinctKey || null,
    distinct_day: Boolean(mission.distinctDays)
  };
}

export function recordMissionEvent(eventType, payload, options) {
  // Authoritative progress is derived from the command receipt. This refresh
  // never forwards the browser event type, payload, amount, or distinct key.
  return refreshMissionState({ renderOnComplete: shouldRenderClub() || !state.inBattle });
}

function resolvedRewardForClaim(mission, selectedReward) {
  if (!mission || !mission.reward) {
    return null;
  }
  if (mission.reward.kind === "pokemon-choice") {
    return selectedReward && selectedReward.speciesKey ? selectedReward : null;
  }
  if (mission.reward.kind !== "choice") {
    return mission.reward;
  }
  return (mission.reward.choices || []).find(function (choice) {
    return Number(choice.itemIndex) === Number(selectedReward && selectedReward.itemIndex);
  }) || null;
}

export function claimMission(missionIndex, selectedReward) {
  var mission = missionCatalogByIndex(missionIndex);
  var reward = resolvedRewardForClaim(mission, selectedReward);
  var selectedRewardItemIndex = mission && mission.reward && mission.reward.kind === "choice" && reward
    ? Number(reward.itemIndex)
    : null;
  var selectedRewardSpeciesKey = mission && mission.reward && mission.reward.kind === "pokemon-choice" && reward
    ? String(reward.speciesKey || "")
    : null;
  var missionState = ensureMissionState();
  if (!mission || !reward) {
    return Promise.resolve({ ok: false, message: "Missione o ricompensa non valida." });
  }
  missionState.claimingMissionIndex = mission.missionIndex;
  missionState.error = "";
  return enqueueMissionOperation(function () {
    return claimPlayerMission(
      mission.missionIndex,
      mission.target,
      reward,
      state.authoritativeRevision,
      selectedRewardItemIndex,
      selectedRewardSpeciesKey
    ).then(function (result) {
      missionState.claimingMissionIndex = null;
      if (!result.ok) {
        missionState.error = result.message || "Riscossione non riuscita.";
        return result;
      }
      if (Array.isArray(result.items)) {
        replaceInventoryRuntimeState(result.items, { markDirty: false });
      }
      if (Number.isFinite(Number(result.pokedollars))) {
        replaceTrainerMoneyRuntimeState(Number(result.pokedollars));
      }
      if (Number.isFinite(Number(result.revision))) {
        state.authoritativeRevision = Number(result.revision);
      }
      if (Array.isArray(result.rows)) {
        replaceMissionRows(result.rows);
      }
      if (result.row) {
        var nextRows = ensureMissionState().rows.filter(function (row) { return Number(row.missionIndex) !== Number(result.row.missionIndex); });
        nextRows.push(result.row);
        replaceMissionRows(nextRows);
      }
      missionState.claimedNoticeMissionIndex = mission.missionIndex;
      broadcastMissionState();
      return result;
    }).catch(function (error) {
      missionState.claimingMissionIndex = null;
      missionState.error = error.message || "Riscossione non riuscita.";
      return { ok: false, message: missionState.error };
    });
  });
}

export function setMissionError(message) {
  ensureMissionState().error = message || "";
}

if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
  window.addEventListener("storage", function (event) {
    var userId = authUserId();
    var payload;
    if (!userId || event.key !== MISSION_RUNTIME_STORAGE_PREFIX + userId || !event.newValue) {
      return;
    }
    try {
      payload = JSON.parse(event.newValue);
    } catch (error) {
      return;
    }
    if (!payload || payload.source === tabId || !payload.invalidation) {
      return;
    }
    ensureMissionState().claimedNoticeMissionIndex = null;
    refreshMissionState({ renderOnComplete: shouldRenderClub() || !state.inBattle, broadcast: false });
  });

  window.addEventListener("pokemon-game-revival:pokedex-pokemon-registered", function (event) {
    var pokemon = event && event.detail ? event.detail.pokemon : null;
    var dexNumber = Math.floor(Number(pokemon && pokemon.ndex) || 0);
    if (dexNumber > 0) {
      recordMissionEvent("pokedex-species-registered", { dexNumber: dexNumber }, {
        eventKey: createMissionEventKey("pokedex", [dexNumber, Date.now()])
      });
    }
  });
}
