import { poke_ball, potion } from "../data/items.js";
import { FLUTE_DAILY_USE_LIMIT } from "../data/progression.js";
import { defaultTrainerIndex } from "../data/trainers.js";
import { defaultPokefanMissionRows } from "../data/pokefan-missions.js";
import { revivePokemonList, reviveBoxList, reviveDaycareRows } from "./save-runtime.js";
import { applyLocalDailyReset, missionRowsHaveClaimable } from "./mission-reset.js";
import { dateKeyInRome, isTodayInRome } from "./rome-date.js";

export var STARTING_POKEDOLLARS = 5000;
export var STARTING_BADGES = 0;
export var STARTING_BATTLE_POINTS = 0;
export var root = document.getElementById("app");

var STARTING_INVENTORY_ITEMS = [
  [potion.index, 3], [poke_ball.index, 5]
];

function createStartingInventory() {
  return STARTING_INVENTORY_ITEMS.map(function (entry) {
    return [entry[0], entry[1]];
  });
}

function notifyPokedexPokemonRegistered(pokemon) {
  if (typeof window !== "undefined" && typeof window.dispatchEvent === "function" && typeof window.CustomEvent === "function") {
    window.dispatchEvent(new window.CustomEvent("pokemon-game-revival:pokedex-pokemon-registered", {
      detail: { pokemon: pokemon }
    }));
  }
}

function createDefaultMissionState() {
  return {
    loading: false,
    rows: defaultPokefanMissionRows(),
    claimingMissionIndex: null,
    claimedNoticeMissionIndex: null,
    hasClaimableCompletion: false,
    error: ""
  };
}

function createDefaultDailyBerryState() {
  return {
    loading: false,
    claiming: false,
    claimedToday: false,
    lastClaimedAt: null,
    rewardItemIndex: null,
    error: ""
  };
}

function createDefaultGardenState() {
  return {
    plots: [null, null, null],
    dailyBerry: createDefaultDailyBerryState(),
    plantingPlotIndex: null,
    harvestNotices: [null, null, null]
  };
}

function createDefaultTrainingDailyState() {
  return {
    easy: { claimedToday: false, lastClaimedAt: null },
    medium: { claimedToday: false, lastClaimedAt: null },
    hard: { claimedToday: false, lastClaimedAt: null },
    loading: false,
    error: ""
  };
}

function createDefaultFluteDailyState() {
  return {
    whiteFlute: { remaining: FLUTE_DAILY_USE_LIMIT, lastClaimedAt: null },
    blackFlute: { remaining: FLUTE_DAILY_USE_LIMIT, lastClaimedAt: null }
  };
}

function createDefaultActivityFeedState() {
  return { loading: false, loaded: false, rows: [], error: "" };
}

export function createDefaultBattleDomeState() {
  return {
    loading: false,
    loaded: false,
    saving: false,
    team: [],
    teamRevision: 0,
    lobby: null,
    lobbies: [],
    battles: [],
    error: "",
    notice: "",
    tab: "team",
    codeDraft: "",
    draft: { speciesKey: "", heldItemIndex: 0, moveIndexes: [0, 0, 0, 0] }
  };
}

function createDefaultAdminDashboardMessageState() {
  return { text: "", sending: false, error: "", notice: "" };
}

export var state = {
  playerName: "",
  trainerInfo: [defaultTrainerIndex(), STARTING_POKEDOLLARS, STARTING_BADGES, STARTING_BATTLE_POINTS],
  team: [],
  box: [],
  authoritativeRevision: 0,
  authoritativeLeagueState: null,
  catalogReleaseId: null,
  activeEncounter: null,
  captureWildCard: null,
  dirty: false,
  saveStatus: { state: "idle", message: "" },
  playerLoadStatus: { state: "idle", message: "" },
  auth: {
    ready: false,
    loading: false,
    session: null,
    user: null,
    serverRoles: [],
    error: "",
    message: "",
    mode: "login",
    usernameDraft: "",
    emailDraft: ""
  },
  starterSetup: { error: "", loading: false },
  scene: { name: "login" },
  dialog: null,
  inBattle: false,
  battleStartPending: false,
  activeBattle: null,
  battleTower: { runId: null, wins: 0, nextChallenge: 1, record: 0, attemptedToday: false },
  battleShopOffers: [],
  battleShopOffersLoaded: false,
  battleShopOffersLoading: false,
  battleShopOffersError: "",
  battleShopPurchasePending: false,
  pendingActivity: null,
  playerDex: [],
  trainerTitles: [],
  pokedexDirty: false,
  inventory: createStartingInventory(),
  inventoryFlippedItems: {},
  shoppingCenterCart: {},
  shoppingCenterSellCart: {},
  shopPurchases: {},
  daycare: [null, null],
  pendingResolutions: [],
  trainingProgression: null,
  ordinaryProgression: null,
  boxFilter: { type: "", minLevel: "", maxLevel: "", name: "", heldItemOnly: false },
  pendingBoxUpserts: [],
  pendingBoxDeletes: [],
  battleTargetPanel: { visible: false, itemIndex: null, entries: [], position: null },
  garden: createDefaultGardenState(),
  trainingDaily: createDefaultTrainingDailyState(),
  fluteDaily: createDefaultFluteDailyState(),
  missions: createDefaultMissionState(),
  adminBattles: { loading: false, rows: [], error: "" },
  adminDashboardMessage: createDefaultAdminDashboardMessageState(),
  activityFeed: createDefaultActivityFeedState(),
  battleDome: createDefaultBattleDomeState(),
  pendingGlobalActivities: []
};

function trainerInfoFromProfile(profile) {
  var trainerIndex = Number(profile.trainer_index);
  var pokedollars = Number(profile.pokedollars);
  var badges = Number(profile.badges);
  if (!Number.isFinite(trainerIndex) || trainerIndex <= 0) {
    trainerIndex = defaultTrainerIndex();
  }
  if (!Number.isFinite(pokedollars) || pokedollars < 0) {
    pokedollars = STARTING_POKEDOLLARS;
  }
  if (!Number.isFinite(badges) || badges < 0) {
    badges = STARTING_BADGES;
  }
  var battlePoints = Number(profile.battle_points);
  if (!Number.isFinite(battlePoints) || battlePoints < 0) {
    battlePoints = STARTING_BATTLE_POINTS;
  }
  return [trainerIndex, Math.floor(pokedollars), Math.floor(badges), Math.floor(battlePoints)];
}

function normalizePokedexNumbers(numbers) {
  if (!Array.isArray(numbers)) {
    return [];
  }
  return numbers.map(function (number) {
    return Math.floor(Number(number));
  }).filter(function (number, index, list) {
    return Number.isFinite(number) && number > 0 && list.indexOf(number) === index;
  }).sort(function (left, right) {
    return left - right;
  });
}

export function registerPokedexPokemon(pokemon) {
  var dexNumber = Math.floor(Number(pokemon && pokemon.ndex));
  if (!Number.isFinite(dexNumber) || dexNumber <= 0) {
    return false;
  }
  if (state.playerDex.indexOf(dexNumber) !== -1) {
    return false;
  }
  state.playerDex = normalizePokedexNumbers(state.playerDex.concat([dexNumber]));
  state.pokedexDirty = true;
  notifyPokedexPokemonRegistered(pokemon);
  return true;
}

export function resetBoxFilter() {
  state.boxFilter = { type: "", minLevel: "", maxLevel: "", name: "", heldItemOnly: false };
}

export function resetPlayerState() {
  state.playerName = "";
  state.trainerInfo = [defaultTrainerIndex(), STARTING_POKEDOLLARS, STARTING_BADGES, STARTING_BATTLE_POINTS];
  state.team = [];
  state.box = [];
  state.authoritativeRevision = 0;
  state.authoritativeLeagueState = null;
  state.catalogReleaseId = null;
  state.activeEncounter = null;
  state.captureWildCard = null;
  state.inventory = createStartingInventory();
  state.inventoryFlippedItems = {};
  state.shoppingCenterCart = {};
  state.shoppingCenterSellCart = {};
  state.shopPurchases = {};
  state.daycare = [null, null];
  state.pendingResolutions = [];
  state.battleDome = createDefaultBattleDomeState();
  state.trainingProgression = null;
  state.ordinaryProgression = null;
  state.inBattle = false;
  state.battleStartPending = false;
  state.activeBattle = null;
  state.battleTower = { runId: null, wins: 0, nextChallenge: 1, record: 0, attemptedToday: false };
  state.battleShopOffers = [];
  state.battleShopOffersLoaded = false;
  state.battleShopOffersLoading = false;
  state.battleShopOffersError = "";
  state.battleShopPurchasePending = false;
  state.pendingActivity = null;
  state.playerDex = [];
  state.trainerTitles = [];
  state.pokedexDirty = false;
  resetBoxFilter();
  state.pendingBoxUpserts = [];
  state.pendingBoxDeletes = [];
  state.battleTargetPanel = { visible: false, itemIndex: null, entries: [], position: null };
  state.starterSetup = { error: "", loading: false };
  state.garden = createDefaultGardenState();
  state.trainingDaily = createDefaultTrainingDailyState();
  state.fluteDaily = createDefaultFluteDailyState();
  state.missions = createDefaultMissionState();
  state.adminBattles = { loading: false, rows: [], error: "" };
  state.adminDashboardMessage = createDefaultAdminDashboardMessageState();
  state.activityFeed = createDefaultActivityFeedState();
  state.pendingGlobalActivities = [];
  state.dirty = false;
  state.saveStatus = { state: "idle", message: "" };
  state.playerLoadStatus = { state: "idle", message: "" };
}

export function applyGardenDailyLimit(dailyLimit) {
  var lastClaimedAt = dailyLimit && dailyLimit.last_claimed_at ? dailyLimit.last_claimed_at : null;
  state.garden.dailyBerry = {
    loading: false,
    claiming: false,
    claimedToday: isTodayInRome(lastClaimedAt),
    lastClaimedAt: lastClaimedAt,
    rewardItemIndex: null,
    error: ""
  };
}

function normalizeShopPurchases(rows) {
  var purchases = {};
  (rows || []).forEach(function (row) {
    var itemIndex = Math.floor(Number(row.item_index !== undefined ? row.item_index : row.itemIndex) || 0);
    var quantity = Math.max(0, Math.floor(Number(row.purchased_quantity !== undefined ? row.purchased_quantity : row.purchasedQuantity) || 0));
    if (itemIndex > 0 && quantity > 0) {
      purchases[String(itemIndex)] = quantity;
    }
  });
  return purchases;
}

export function applyTrainingDailyLimits(rows) {
  var nextState = createDefaultTrainingDailyState();
  (rows || []).forEach(function (row) {
    var type = String(row && row.limit_type || "");
    var difficulty = type.indexOf("training_") === 0 ? type.slice("training_".length) : "";
    if (!nextState[difficulty]) {
      return;
    }
    nextState[difficulty] = {
      claimedToday: isTodayInRome(row.last_claimed_at),
      lastClaimedAt: row.last_claimed_at || null
    };
  });
  state.trainingDaily = nextState;
}

export function applyFluteDailyLimits(rows) {
  var nextState = createDefaultFluteDailyState();
  (rows || []).forEach(function (row) {
    var type = String(row && row.limit_type || "");
    var key = type === "flute_white" ? "whiteFlute" : type === "flute_black" ? "blackFlute" : "";
    if (!key || !nextState[key]) {
      return;
    }
    var useCount = Number(row.use_count) || 0;
    var lastClaimedAt = row.last_claimed_at || null;
    var remaining = isTodayInRome(lastClaimedAt) ? Math.max(0, FLUTE_DAILY_USE_LIMIT - useCount) : FLUTE_DAILY_USE_LIMIT;
    nextState[key] = { remaining: remaining, lastClaimedAt: lastClaimedAt };
  });
  state.fluteDaily = nextState;
}

export function consumeFluteDailyUseLocally(fluteKey) {
  var entry = state.fluteDaily && state.fluteDaily[fluteKey];
  if (entry && entry.remaining > 0) {
    entry.remaining -= 1;
    entry.lastClaimedAt = new Date().toISOString();
  }
}

export function applyPlayerSave(save) {
  var pendingDaycareSlot;
  if (!save) {
    resetPlayerState();
    return;
  }
  state.trainerInfo = trainerInfoFromProfile(save.profile);
  state.team = revivePokemonList(save.team);
  state.box = reviveBoxList(save.box, "box_index");
  state.authoritativeRevision = Number(save.authoritativeRevision) || 0;
  state.catalogReleaseId = save.catalogReleaseId || null;
  state.activeEncounter = save.activeEncounter && save.activeEncounter.pokemon ? {
    encounterId: save.activeEncounter.encounter_id,
    zoneKey: save.activeEncounter.zone_key,
    currentHp: Number(save.activeEncounter.current_hp),
    maxHp: Number(save.activeEncounter.max_hp),
    battleId: save.activeEncounter.battle_id || null,
    pokemon: revivePokemonList([save.activeEncounter.pokemon])[0]
  } : null;
  state.inventory = Array.isArray(save.items) ? save.items : createStartingInventory();
  state.inventoryFlippedItems = {};
  state.playerDex = normalizePokedexNumbers(save.dex);
  state.trainerTitles = Array.isArray(save.trainerTitles) ? save.trainerTitles.map(function (entry) {
    return {
      titleKey: String(entry && entry.titleKey || ""),
      unlockedAt: entry && entry.unlockedAt || null,
      isPreferred: Boolean(entry && entry.isPreferred)
    };
  }).filter(function (entry) { return entry.titleKey; }) : [];
  state.pokedexDirty = false;
  state.shoppingCenterCart = {};
  state.shoppingCenterSellCart = {};
  state.shopPurchases = normalizeShopPurchases(save.shopPurchases);
  state.daycare = reviveDaycareRows(save.daycare);
  state.pendingResolutions = Array.isArray(save.pendingResolutions) ? save.pendingResolutions : [];
  state.trainingProgression = save.trainingProgression || null;
  state.ordinaryProgression = save.ordinaryProgression || null;
  state.inBattle = false;
  state.battleStartPending = false;
  state.activeBattle = null;
  state.battleTower = save.battleTower && save.battleTower.run_id ? {
    runId: String(save.battleTower.run_id),
    wins: Math.max(0, Number(save.battleTower.wins) || 0),
    nextChallenge: Math.max(1, Number(save.battleTower.next_challenge) || 1),
    record: Math.max(0, Number(save.battleTowerRecord) || 0),
    attemptedToday: Boolean(save.battleTower.attempted_today)
  } : {
    runId: null, wins: 0, nextChallenge: 1, record: Math.max(0, Number(save.battleTowerRecord) || 0),
    attemptedToday: Boolean(save.battleTower && save.battleTower.attempted_today)
  };
  if (Array.isArray(save.battleShopOffers)) {
    state.battleShopOffers = save.battleShopOffers;
    state.battleShopOffersLoaded = true;
  }
  state.battleShopOffersLoading = false;
  state.battleShopOffersError = "";
  state.battleShopPurchasePending = false;
  pendingDaycareSlot = state.daycare.find(function (slot) {
    return slot && slot.status === "withdraw_pending";
  });
  state.pendingActivity = state.ordinaryProgression
    ? { type: "ordinary_progression" }
    : state.trainingProgression
    ? { type: "training_progression" }
    : pendingDaycareSlot ? { type: "daycare_withdraw", slotIndex: pendingDaycareSlot.slotIndex } : null;
  resetBoxFilter();
  state.pendingBoxUpserts = [];
  state.pendingBoxDeletes = [];
  state.battleTargetPanel = { visible: false, itemIndex: null, entries: [], position: null };
  state.starterSetup = { error: "", loading: false };
  state.garden = createDefaultGardenState();
  state.trainingDaily = createDefaultTrainingDailyState();
  state.missions = createDefaultMissionState();
  if (Array.isArray(save.missions)) {
    state.missions.rows = save.missions;
    applyLocalDailyReset(state.missions.rows);
    state.missions.hasClaimableCompletion = missionRowsHaveClaimable(
      state.missions.rows,
      state.trainerInfo[2]
    );
  }
  state.adminDashboardMessage = createDefaultAdminDashboardMessageState();
  state.activityFeed = createDefaultActivityFeedState();
  state.pendingGlobalActivities = [];
  if (save.garden) {
    state.garden = {
      plots: [
        save.garden.plant_1 ? { berryIndex: save.garden.plant_1, seedTime: save.garden.seed_time_1, readyAt: save.garden.ready_at_1 || null } : null,
        save.garden.plant_2 ? { berryIndex: save.garden.plant_2, seedTime: save.garden.seed_time_2, readyAt: save.garden.ready_at_2 || null } : null,
        save.garden.plant_3 ? { berryIndex: save.garden.plant_3, seedTime: save.garden.seed_time_3, readyAt: save.garden.ready_at_3 || null } : null
      ],
      dailyBerry: createDefaultDailyBerryState(),
      plantingPlotIndex: null,
      harvestNotices: [null, null, null]
    };
  }
  applyGardenDailyLimit(save.dailyBerryLimit);
  applyTrainingDailyLimits(save.trainingDailyLimits);
  applyFluteDailyLimits(save.fluteDailyLimits);
  state.dirty = false;
  state.saveStatus = { state: "saved", message: "" };
}
