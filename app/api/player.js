import { chooseStarterAuthoritative, getCurrentPlayerState } from "./player-command.js";

export function serializePokemonList(list) {
  return (list || []).map(function (pokemon) { return pokemon.toJSON(); });
}

export function serializePokedexNumbers(numbers) {
  if (!Array.isArray(numbers)) return [];
  return numbers.map(function (number) { return Math.floor(Number(number)); })
    .filter(function (number, index, list) {
      return Number.isFinite(number) && number > 0 && list.indexOf(number) === index;
    })
    .sort(function (left, right) { return left - right; });
}

function missionRowsFromProjection(rows) {
  return (Array.isArray(rows) ? rows : []).map(function (row) {
    return {
      missionIndex: Number(row && row.mission_index),
      counter: Math.max(0, Math.floor(Number(row && row.counter) || 0)),
      claimStatus: String(row && row.claim_status || "unclaimed"),
      trackedKeys: Array.isArray(row && row.tracked_keys) ? row.tracked_keys.map(String) : [],
      lastCountedDay: row && row.last_counted_day || null,
      claimCount: Math.max(0, Math.floor(Number(row && row.claim_count) || 0)),
      lastClaimedAt: row && row.last_claimed_at || null,
      lastUpdateAt: row && row.updated_at || null,
      dailyResetDate: row && row.daily_reset_date || null
    };
  }).filter(function (row) { return Number.isFinite(row.missionIndex); });
}

function titleRowsFromProjection(rows) {
  return (Array.isArray(rows) ? rows : []).map(function (row) {
    return {
      titleKey: String(row && row.title_key || ""),
      unlockedAt: row && row.unlocked_at || null
    };
  }).filter(function (row) { return row.titleKey; });
}

export function saveFromAuthoritativeProjection(projection) {
  var profile = projection && projection.profile;
  return {
    profile: profile,
    team: projection && projection.team || [],
    box: projection && projection.box || [],
    daycare: projection && projection.daycare || [],
    pendingResolutions: projection && projection.pending_resolutions || [],
    trainingProgression: projection && projection.training_progression || null,
    ordinaryProgression: projection && projection.ordinary_progression || null,
    trainingDailyLimits: projection && projection.training_daily || [],
    items: projection && projection.items || [],
    dex: projection && projection.dex || [],
    starter: projection && projection.starter || null,
    shopPurchases: projection && projection.shop_purchases || [],
    garden: projection && projection.garden || null,
    dailyBerryLimit: projection && projection.daily_berry || null,
    fluteDailyLimits: projection && projection.flute_daily || [],
    activeEncounter: projection && projection.active_encounter || null,
    battleTower: projection && projection.battle_tower || null,
    battleTowerRecord: Math.max(0, Number(profile && profile.battle_tower_record) || 0),
    battleShopOffers: projection && Array.isArray(projection.battle_shop_offers)
      ? projection.battle_shop_offers : undefined,
    trainerTitles: titleRowsFromProjection(projection && projection.titles),
    missions: missionRowsFromProjection(projection && projection.missions),
    authoritativeRevision: Number(projection && projection.revision) || 0,
    catalogReleaseId: profile && profile.catalog_release_id || null
  };
}

export async function loadPlayerSave() {
  var result = await getCurrentPlayerState();
  if (!result.ok) return { ok: false, message: result.message, save: null };
  if (!result.projection || !result.projection.has_player) return { ok: true, save: null };
  return { ok: true, save: saveFromAuthoritativeProjection(result.projection) };
}

export async function createInitialPlayerSave(starterInput) {
  var result = await chooseStarterAuthoritative(starterInput);
  if (!result.ok) return result;
  if (!result.projection || !result.projection.has_player) {
    return { ok: false, message: "The server did not return the player's initial state." };
  }
  return { ok: true, save: saveFromAuthoritativeProjection(result.projection) };
}
