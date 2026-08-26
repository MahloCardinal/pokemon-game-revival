import * as i from "./items.js";
import { getItemByIndex } from "./items.js";
import { tmIsPurchasable } from "./progression.js";
import { SHOPPING_CENTER_CATEGORIES, SHOPPING_CENTER_ITEMS, SHOPPING_CENTER_SECTIONS, SHOPPING_CENTER_UNPURCHASABLE_ITEMS } from "./shopping-center.js";

export var MISSION_CATEGORY_ADVENTURE = "adventure";
export var MISSION_CATEGORY_CAPTURE = "capture";
export var MISSION_CATEGORY_DAILY = "daily";

export var MISSION_STATUS_UNCLAIMED = "unclaimed";
export var MISSION_STATUS_CLAIMED = "claimed";
export var MISSION_STATUS_SKIPPED = "skipped";

var TYPE_BOOSTER_ITEMS = i.itemsSortedByIndex(i.ITEM_LIBRARY.filter(function (item) { return item && item.boostType; }));
var ALL_PURCHASABLE_TM_ITEMS = i.itemsSortedByIndex(i.ITEM_LIBRARY.filter(function (item) {
  return tmIsPurchasable(item);
})).map(function (item) { return item.index; });
var AROMA_ITEM_INDEXES = SHOPPING_CENTER_ITEMS.filter(function (entry) {
  return entry.category === SHOPPING_CENTER_CATEGORIES.INCENSES;
}).sort(function (left, right) {
  return i.compareItemsByIndex(left && left.item, right && right.item);
}).map(function (entry) { return entry.item.index; });
var PORT_PURCHASABLE_ITEM_INDEXES = SHOPPING_CENTER_ITEMS.filter(function (entry) {
  return entry.section === SHOPPING_CENTER_SECTIONS.PORT && SHOPPING_CENTER_UNPURCHASABLE_ITEMS.indexOf(entry.item) === -1;
}).sort(function (left, right) {
  return i.compareItemsByIndex(left && left.item, right && right.item);
}).map(function (entry) { return entry.item.index; });
function itemChoiceReward(choiceKey, itemIndexes) {
  return {
    kind: "choice",
    choiceKey: choiceKey,
    choices: itemIndexes.map(function (itemIndex) {
      var item = getItemByIndex(itemIndex);
      return item ? { kind: "item", itemIndex: item.index, quantity: 1 } : null;
    }).filter(Boolean)
  };
}

function pokemonChoiceReward(choiceKey, levelMode, excludeFossils) {
  return {
    kind: "pokemon_choice",
    choiceKey: choiceKey,
    levelMode: levelMode,
    level: levelMode === "fixed_5" ? 5 : null,
    excludeLegendary: true,
    excludeFossils: Boolean(excludeFossils)
  };
}

function defineMission(config) {
  return Object.freeze(Object.assign({
    category: MISSION_CATEGORY_CAPTURE,
    target: 1
  }, config));
}

function totalCaptureMission(missionIndex, count, reward) {
  return defineMission({
    missionIndex: missionIndex,
    category: MISSION_CATEGORY_CAPTURE,
    type: "total_captures",
    target: count,
    reward: reward
  });
}

function differentSpeciesMission(missionIndex, count, reward) {
  return defineMission({
    missionIndex: missionIndex,
    category: MISSION_CATEGORY_CAPTURE,
    type: "species_different",
    target: count,
    reward: reward
  });
}

export var AUTHORITATIVE_ADVENTURE_MISSIONS = [
  defineMission({ missionIndex: 2000, category: MISSION_CATEGORY_ADVENTURE, phase: 1, sequence: 1, type: "berries_harvested", target: 3, reward: { kind: "item", itemIndex: i.super_potion.index, quantity: 3 } }),
  defineMission({ missionIndex: 2001, category: MISSION_CATEGORY_ADVENTURE, phase: 1, sequence: 2, type: "training_victory", difficulty: "easy", target: 1, reward: { kind: "item", itemIndex: i.poke_ball.index, quantity: 10 } }),
  defineMission({ missionIndex: 2002, category: MISSION_CATEGORY_ADVENTURE, phase: 2, sequence: 1, type: "training_victory", difficulty: "medium", target: 1, reward: { kind: "money", quantity: 3000 } }),
  defineMission({ missionIndex: 2003, category: MISSION_CATEGORY_ADVENTURE, phase: 2, sequence: 2, type: "held_item_assigned", target: 1, reward: itemChoiceReward("fast_berry", i.BERRY_NORMAL_CYCLE_ITEMS.map(function (item) { return item.index; })) }),
  defineMission({ missionIndex: 2004, category: MISSION_CATEGORY_ADVENTURE, phase: 3, sequence: 1, type: "training_victory", difficulty: "hard", minTeamSize: 3, target: 1, reward: { kind: "item", itemIndex: i.revive.index, quantity: 3 } }),
  defineMission({ missionIndex: 2005, category: MISSION_CATEGORY_ADVENTURE, phase: 3, sequence: 2, type: "berries_harvested", target: 6, reward: { kind: "item", itemIndex: i.hp_up.index, quantity: 2 } }),
  defineMission({ missionIndex: 2006, category: MISSION_CATEGORY_ADVENTURE, phase: 4, sequence: 1, type: "zone_captures", target: 10, reward: { kind: "money", quantity: 5000 } }),
  defineMission({ missionIndex: 2007, category: MISSION_CATEGORY_ADVENTURE, phase: 4, sequence: 2, type: "distinct_species_level_up", target: 4, reward: { kind: "item", itemIndex: i.great_ball.index, quantity: 10 } }),
  defineMission({ missionIndex: 2008, category: MISSION_CATEGORY_ADVENTURE, phase: 5, sequence: 1, type: "training_victory", difficulties: ["medium", "hard"], distinctDays: true, target: 4, reward: { kind: "item", itemIndex: i.hyper_potion.index, quantity: 6 } }),
  defineMission({ missionIndex: 2009, category: MISSION_CATEGORY_ADVENTURE, phase: 5, sequence: 2, type: "daycare_cycle_completed", target: 1, reward: { kind: "item", itemIndex: i.ultra_ball.index, quantity: 10 } }),
  defineMission({ missionIndex: 2010, category: MISSION_CATEGORY_ADVENTURE, phase: 6, sequence: 1, type: "training_victory", difficulty: "hard", minTeamSize: 4, target: 1, reward: { kind: "money", quantity: 10000 } }),
  defineMission({ missionIndex: 2011, category: MISSION_CATEGORY_ADVENTURE, phase: 6, sequence: 2, type: "berries_harvested", target: 9, reward: { kind: "item", itemIndex: i.pp_up.index, quantity: 2 } }),
  defineMission({ missionIndex: 2012, category: MISSION_CATEGORY_ADVENTURE, phase: 7, sequence: 1, type: "distinct_species_evolved", target: 5, reward: { kind: "item", itemIndex: i.max_potion.index, quantity: 6 } }),
  defineMission({ missionIndex: 2013, category: MISSION_CATEGORY_ADVENTURE, phase: 7, sequence: 2, type: "training_victory", difficulty: "hard", distinctDays: true, target: 4, reward: itemChoiceReward("slow_berry", i.BERRY_LONG_CYCLE_ITEMS.map(function (item) { return item.index; })) }),
  defineMission({ missionIndex: 2014, category: MISSION_CATEGORY_ADVENTURE, phase: 8, sequence: 1, type: "training_victory", difficulty: "hard", minTeamSize: 6, distinctDays: true, target: 3, reward: { kind: "item", itemIndex: i.full_restore.index, quantity: 6 } }),
  defineMission({ missionIndex: 2015, category: MISSION_CATEGORY_ADVENTURE, phase: 8, sequence: 2, type: "zone_captures_after_badge", minBadges: 7, target: 20, reward: { kind: "item", itemIndex: i.pp_max.index, quantity: 2 } }),
  defineMission({ missionIndex: 2016, category: MISSION_CATEGORY_ADVENTURE, phase: 9, sequence: 1, type: "training_victory", difficulty: "hard", minTeamSize: 6, distinctDays: true, target: 5, reward: { kind: "money", quantity: 90000 } }),
  defineMission({ missionIndex: 2017, category: MISSION_CATEGORY_ADVENTURE, phase: 9, sequence: 2, type: "zone_captures_after_badge", minBadges: 8, target: 30, reward: itemChoiceReward("port_item", PORT_PURCHASABLE_ITEM_INDEXES) })
];

export var AUTHORITATIVE_CAPTURE_MISSIONS = [
  totalCaptureMission(3000, 50, { kind: "money", quantity: 20000 }),
  totalCaptureMission(3001, 100, { kind: "item", itemIndex: i.hp_up.index, quantity: 10 }),
  totalCaptureMission(3002, 150, Object.assign(itemChoiceReward("purchasable_tm", ALL_PURCHASABLE_TM_ITEMS), { purchasableNow: true })),
  totalCaptureMission(3003, 200, pokemonChoiceReward("pokemon_level_5_no_fossil_legendary", "fixed_5", true)),
  totalCaptureMission(3004, 250, { kind: "item", itemIndex: i.pp_max.index, quantity: 10 }),
  totalCaptureMission(3005, 300, pokemonChoiceReward("pokemon_badge_cap_no_fossil_legendary", "badge_cap", true)),
  differentSpeciesMission(3006, 50, itemChoiceReward("type_booster", TYPE_BOOSTER_ITEMS.map(function (item) { return item.index; }))),
  differentSpeciesMission(3007, 100, { kind: "item", itemIndex: i.ultra_ball.index, quantity: 30 }),
  differentSpeciesMission(3008, 150, itemChoiceReward("incense", AROMA_ITEM_INDEXES)),
  differentSpeciesMission(3009, 200, { kind: "item", itemIndex: i.heart_scale.index, quantity: 3 }),
  differentSpeciesMission(3010, 250, { kind: "item", itemIndex: i.master_ball.index, quantity: 1 }),
  differentSpeciesMission(3011, 300, pokemonChoiceReward("pokemon_level_5_no_fossil", "fixed_5", false)),
  defineMission({
    missionIndex: 3012,
    category: MISSION_CATEGORY_CAPTURE,
    type: "title_collection",
    target: 21,
    collectionKey: "trainer_titles_initial",
    reward: {
      kind: "pokemon_choice",
      choiceKey: "legendary_pokemon_level_100",
      levelMode: "fixed",
      level: 100,
      requiredRarity: "legendary"
    }
  })
].map(function (mission) {
  if (mission.type === "total_captures") {
    return Object.freeze(Object.assign({}, mission, { type: "zone_captures" }));
  }
  if (mission.type === "species_different") {
    return Object.freeze(Object.assign({}, mission, { type: "pokedex_species_count" }));
  }
  return mission;
});

export var DAILY_MISSIONS = [
  defineMission({ missionIndex: 1000, category: MISSION_CATEGORY_DAILY, type: "daily_login", target: 1, reward: { kind: "dynamic_item", itemIndex: i.ultra_ball.index, baseQuantity: 3, perBadge: 1 }, daily: true }),
  defineMission({ missionIndex: 1001, category: MISSION_CATEGORY_DAILY, type: "zone_captures", target: 10, reward: { kind: "dynamic_money", baseQuantity: 2000, perBadge: 500 }, daily: true }),
  defineMission({ missionIndex: 1002, category: MISSION_CATEGORY_DAILY, type: "training_difficulties", difficulties: ["easy", "medium", "hard"], target: 3, reward: Object.assign(itemChoiceReward("purchasable_tm", ALL_PURCHASABLE_TM_ITEMS), { purchasableNow: true }), daily: true })
];

export var POKEFAN_MISSIONS = AUTHORITATIVE_ADVENTURE_MISSIONS.concat(AUTHORITATIVE_CAPTURE_MISSIONS, DAILY_MISSIONS);
export var POKEFAN_MISSION_INDEXES = POKEFAN_MISSIONS.map(function (mission) { return mission.missionIndex; });

export function pokefanMissionsForMode() {
  return POKEFAN_MISSIONS;
}

export function pokefanMissionByIndex(missionIndex) {
  var normalizedIndex = Number(missionIndex);
  return POKEFAN_MISSIONS.find(function (mission) { return mission.missionIndex === normalizedIndex; }) || null;
}

export function pokefanMissionsByType(type) {
  return POKEFAN_MISSIONS.filter(function (mission) { return mission.type === type; });
}

export function adventurePhaseMissions(phase) {
  return AUTHORITATIVE_ADVENTURE_MISSIONS.filter(function (mission) { return mission.phase === Number(phase); });
}

export function defaultPokefanMissionRows() {
  return POKEFAN_MISSIONS.map(function (mission) {
    return {
      missionIndex: mission.missionIndex,
      counter: 0,
      claimStatus: MISSION_STATUS_UNCLAIMED,
      trackedKeys: [],
      lastCountedDay: null,
      claimCount: 0,
      lastClaimedAt: null,
      lastUpdateAt: null,
      dailyResetDate: null
    };
  });
}
