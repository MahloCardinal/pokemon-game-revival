import { claimPlayerMissionAuthoritative, syncPlayerMissionsAuthoritative } from "./player-command.js";
import { currentUserId, getSupabaseClient } from "./supabase.js";

function normalizeMissionRow(row) {
  if (!row) {
    return null;
  }
  return {
    missionIndex: Number(row.mission_index !== undefined ? row.mission_index : row.missionIndex),
    counter: Math.max(0, Math.floor(Number(row.counter) || 0)),
    claimStatus: String(row.claim_status || row.claimStatus || "unclaimed"),
    trackedKeys: Array.isArray(row.tracked_keys) ? row.tracked_keys.map(String) : Array.isArray(row.trackedKeys) ? row.trackedKeys.map(String) : [],
    lastCountedDay: row.last_counted_day || row.lastCountedDay || null,
    claimCount: Math.max(0, Math.floor(Number(row.claim_count !== undefined ? row.claim_count : row.claimCount) || 0)),
    lastClaimedAt: row.last_claimed_at || row.lastClaimedAt || null,
    lastUpdateAt: row.updated_at || row.lastUpdateAt || null,
    dailyResetDate: row.daily_reset_date || row.dailyResetDate || null
  };
}

export async function syncPlayerMissions() {
  var authoritativeResult;
  authoritativeResult = await syncPlayerMissionsAuthoritative();
  if (!authoritativeResult.ok) {
    return { ok: false, message: authoritativeResult.message, rows: [] };
  }
  return {
    ok: true,
    message: "",
    rows: (authoritativeResult.projection && authoritativeResult.projection.missions || []).map(normalizeMissionRow).filter(Boolean),
    projection: authoritativeResult.projection
  };
}

export async function loadPlayerMissions() {
  return syncPlayerMissions();
}

export async function recordPlayerMissionProgress(eventKey, updates) {
  return { ok: false, message: "Authoritative mission progress is derived from server commands.", rows: [] };
}

export async function claimPlayerMission(missionIndex, target, reward, expectedRevision, selectedRewardItemIndex, selectedRewardSpeciesKey) {
  var authoritativeResult;
  var client = getSupabaseClient();
  if (!client) {
    return { ok: false, message: "Missing Supabase configuration." };
  }
  authoritativeResult = await claimPlayerMissionAuthoritative({
    expectedRevision: expectedRevision,
    missionIndex: missionIndex,
    selectedRewardItemIndex: selectedRewardItemIndex,
    selectedRewardSpeciesKey: selectedRewardSpeciesKey
  });
  if (!authoritativeResult.ok) {
    return authoritativeResult;
  }
  return {
    ok: true,
    message: "",
    row: (authoritativeResult.projection && authoritativeResult.projection.missions || []).map(normalizeMissionRow).find(function (row) {
      return Number(row.missionIndex) === Number(missionIndex);
    }) || null,
    rows: (authoritativeResult.projection && authoritativeResult.projection.missions || []).map(normalizeMissionRow).filter(Boolean),
    pokedollars: authoritativeResult.projection && authoritativeResult.projection.profile && authoritativeResult.projection.profile.pokedollars,
    items: authoritativeResult.projection && authoritativeResult.projection.items,
    revision: Number(authoritativeResult.projection && authoritativeResult.projection.revision) || 0,
    projection: authoritativeResult.projection
  };
}
