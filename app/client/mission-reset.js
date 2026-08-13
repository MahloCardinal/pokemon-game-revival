import {
  MISSION_CATEGORY_ADVENTURE,
  MISSION_CATEGORY_CAPTURE,
  MISSION_CATEGORY_DAILY,
  MISSION_STATUS_CLAIMED,
  MISSION_STATUS_SKIPPED,
  MISSION_STATUS_UNCLAIMED,
  adventurePhaseMissions,
  pokefanMissionByIndex,
  pokefanMissionsForMode
} from "../data/pokefan-missions.js";
import { dateKeyInRome } from "./rome-date.js";

export function applyLocalDailyReset(rows) {
  var today = dateKeyInRome(new Date());
  var resetIndexes = [];
  (rows || []).forEach(function (row) {
    var mission = pokefanMissionByIndex(row && row.missionIndex);
    var resetDate = String(row && row.dailyResetDate || "");
    if (!mission || !mission.daily || !/^\d{4}-\d{2}-\d{2}$/.test(resetDate) || resetDate >= today) {
      return;
    }
    row.counter = 0;
    row.trackedKeys = [];
    row.claimStatus = MISSION_STATUS_UNCLAIMED;
    row.lastCountedDay = null;
    row.dailyResetDate = today;
    resetIndexes.push(Number(row.missionIndex));
  });
  return resetIndexes;
}

function rowByIndex(rows, missionIndex) {
  return (rows || []).find(function (row) { return Number(row && row.missionIndex) === Number(missionIndex); }) || null;
}

function isClaimedOrSkipped(row) {
  return row && (row.claimStatus === MISSION_STATUS_CLAIMED || row.claimStatus === MISSION_STATUS_SKIPPED);
}

function adventureMissionIsActive(mission, rows, badges) {
  if (Number(mission.phase) < 1 || Number(badges) < Number(mission.phase) - 1) {
    return false;
  }
  if (!adventurePhaseMissions(Number(mission.phase) - 1).every(function (previous) {
    return Number(mission.phase) === 1 || isClaimedOrSkipped(rowByIndex(rows, previous.missionIndex));
  })) {
    return false;
  }
  return true;
}

export function missionRowsHaveClaimable(rows, badges) {
  return pokefanMissionsForMode().some(function (mission) {
    var row = rowByIndex(rows, mission.missionIndex);
    if (!row || row.claimStatus !== MISSION_STATUS_UNCLAIMED || Number(row.counter) < Number(mission.target)) {
      return false;
    }
    if (mission.category === MISSION_CATEGORY_ADVENTURE) {
      return adventureMissionIsActive(mission, rows, badges);
    }
    return mission.category === MISSION_CATEGORY_CAPTURE
      || mission.category === MISSION_CATEGORY_DAILY;
  });
}
