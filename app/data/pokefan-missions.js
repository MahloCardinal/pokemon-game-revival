import * as i from "./items.js";
import { getItemByIndex } from "./items.js";
import { GYM_REWARD_MT_ITEMS } from "./progression.js";
import { SHOPPING_CENTER_CATEGORIES, SHOPPING_CENTER_ITEMS, SHOPPING_CENTER_SECTIONS, SHOPPING_CENTER_UNPURCHASABLE_ITEMS } from "./shopping-center.js";

export var MISSION_CATEGORY_ADVENTURE = "adventure";
export var MISSION_CATEGORY_CAPTURE = "capture";
export var MISSION_CATEGORY_DAILY = "daily";

export var MISSION_STATUS_UNCLAIMED = "unclaimed";
export var MISSION_STATUS_CLAIMED = "claimed";
export var MISSION_STATUS_SKIPPED = "skipped";

var TYPE_BOOSTER_ITEMS = i.itemsSortedByIndex(i.ITEM_LIBRARY.filter(function (item) { return item && item.boostType; }));
var ALL_PURCHASABLE_MT_ITEMS = i.itemsSortedByIndex(i.ITEM_LIBRARY.filter(function (item) {
  return item && item.category === i.ItemCategory.Mt && GYM_REWARD_MT_ITEMS.indexOf(item.index) === -1;
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
function itemChoiceReward(choiceLabel, itemIndexes) {
  return {
    kind: "choice",
    choiceLabel: choiceLabel,
    choices: itemIndexes.map(function (itemIndex) {
      var item = getItemByIndex(itemIndex);
      return item ? { kind: "item", itemIndex: item.index, quantity: 1, label: item.name } : null;
    }).filter(Boolean)
  };
}

function pokemonChoiceReward(choiceLabel, levelMode, excludeFossils) {
  return {
    kind: "pokemon-choice",
    choiceLabel: choiceLabel,
    levelMode: levelMode,
    level: levelMode === "fixed-5" ? 5 : null,
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
    type: "total-captures",
    target: count,
    requirement: count + " catture totali",
    reward: reward
  });
}

function differentSpeciesMission(missionIndex, count, reward) {
  return defineMission({
    missionIndex: missionIndex,
    category: MISSION_CATEGORY_CAPTURE,
    type: "species-different",
    target: count,
    requirement: count + " specie diverse",
    reward: reward
  });
}

export var AUTHORITATIVE_ADVENTURE_MISSIONS = [
  defineMission({ missionIndex: 2000, category: MISSION_CATEGORY_ADVENTURE, phase: 1, sequence: 1, type: "berries-harvested", target: 3, requirement: "Raccogli 3 bacche dalle piante", reward: { kind: "item", itemIndex: i.superpozione.index, quantity: 3 } }),
  defineMission({ missionIndex: 2001, category: MISSION_CATEGORY_ADVENTURE, phase: 1, sequence: 2, type: "training-victory", difficulty: "easy", target: 1, requirement: "Completa una sfida nella Zona Allenamento facile", reward: { kind: "item", itemIndex: i.poke_ball.index, quantity: 10 } }),
  defineMission({ missionIndex: 2002, category: MISSION_CATEGORY_ADVENTURE, phase: 2, sequence: 1, type: "training-victory", difficulty: "medium", target: 1, requirement: "Vinci una sfida nella Zona Allenamento media", reward: { kind: "money", quantity: 3000 } }),
  defineMission({ missionIndex: 2003, category: MISSION_CATEGORY_ADVENTURE, phase: 2, sequence: 2, type: "held-item-assigned", target: 1, requirement: "Assegna uno strumento al Centro Pokémon", reward: itemChoiceReward("Bacca a crescita veloce a scelta", i.BERRY_NORMAL_CYCLE_ITEMS.map(function (item) { return item.index; })) }),
  defineMission({ missionIndex: 2004, category: MISSION_CATEGORY_ADVENTURE, phase: 3, sequence: 1, type: "training-victory", difficulty: "hard", minTeamSize: 3, target: 1, requirement: "Vinci nella Zona Allenamento difficile con almeno 3 Pokémon in squadra all'inizio della sfida", reward: { kind: "item", itemIndex: i.revitalizzante.index, quantity: 3 } }),
  defineMission({ missionIndex: 2005, category: MISSION_CATEGORY_ADVENTURE, phase: 3, sequence: 2, type: "berries-harvested", target: 6, requirement: "Raccogli 6 bacche dalle piante", reward: { kind: "item", itemIndex: i.ps_su.index, quantity: 2 } }),
  defineMission({ missionIndex: 2006, category: MISSION_CATEGORY_ADVENTURE, phase: 4, sequence: 1, type: "zone-captures", target: 10, requirement: "Cattura 10 Pokémon nelle Zone Cattura", reward: { kind: "money", quantity: 5000 } }),
  defineMission({ missionIndex: 2007, category: MISSION_CATEGORY_ADVENTURE, phase: 4, sequence: 2, type: "distinct-species-level-up", target: 4, requirement: "Porta 4 Pokémon di specie diverse a un nuovo livello", reward: { kind: "item", itemIndex: i.mega_ball.index, quantity: 10 } }),
  defineMission({ missionIndex: 2008, category: MISSION_CATEGORY_ADVENTURE, phase: 5, sequence: 1, type: "training-victory", difficulties: ["medium", "hard"], distinctDays: true, target: 4, requirement: "Vinci 4 sfide nella Zona Allenamento media o difficile in giorni diversi", reward: { kind: "item", itemIndex: i.iperpozione.index, quantity: 6 } }),
  defineMission({ missionIndex: 2009, category: MISSION_CATEGORY_ADVENTURE, phase: 5, sequence: 2, type: "daycare-cycle-completed", target: 1, requirement: "Ritira un Pokémon dalla Pensione", reward: { kind: "item", itemIndex: i.ultra_ball.index, quantity: 10 } }),
  defineMission({ missionIndex: 2010, category: MISSION_CATEGORY_ADVENTURE, phase: 6, sequence: 1, type: "training-victory", difficulty: "hard", minTeamSize: 4, target: 1, requirement: "Vinci nella Zona Allenamento difficile con almeno 4 Pokémon in squadra all'inizio della sfida", reward: { kind: "money", quantity: 10000 } }),
  defineMission({ missionIndex: 2011, category: MISSION_CATEGORY_ADVENTURE, phase: 6, sequence: 2, type: "berries-harvested", target: 9, requirement: "Raccogli 9 bacche dalle piante", reward: { kind: "item", itemIndex: i.pp_su.index, quantity: 2 } }),
  defineMission({ missionIndex: 2012, category: MISSION_CATEGORY_ADVENTURE, phase: 7, sequence: 1, type: "distinct-species-evolved", target: 5, requirement: "Fai evolvere 5 Pokémon di specie diverse", reward: { kind: "item", itemIndex: i.pozione_max.index, quantity: 6 } }),
  defineMission({ missionIndex: 2013, category: MISSION_CATEGORY_ADVENTURE, phase: 7, sequence: 2, type: "training-victory", difficulty: "hard", distinctDays: true, target: 4, requirement: "Vinci 4 sfide nella Zona Allenamento difficile in giorni diversi", reward: itemChoiceReward("Bacca a crescita lenta a scelta", i.BERRY_LONG_CYCLE_ITEMS.map(function (item) { return item.index; })) }),
  defineMission({ missionIndex: 2014, category: MISSION_CATEGORY_ADVENTURE, phase: 8, sequence: 1, type: "training-victory", difficulty: "hard", minTeamSize: 6, distinctDays: true, target: 3, requirement: "Vinci 3 volte nella Zona Allenamento difficile con almeno 6 Pokémon in squadra all'inizio della sfida in giorni diversi", reward: { kind: "item", itemIndex: i.ricarica_totale.index, quantity: 6 } }),
  defineMission({ missionIndex: 2015, category: MISSION_CATEGORY_ADVENTURE, phase: 8, sequence: 2, type: "zone-captures-after-badge", minBadges: 7, target: 20, requirement: "Cattura 20 Pokémon nelle Zone Cattura dopo aver ottenuto la settima medaglia", reward: { kind: "item", itemIndex: i.pp_max.index, quantity: 2 } }),
  defineMission({ missionIndex: 2016, category: MISSION_CATEGORY_ADVENTURE, phase: 9, sequence: 1, type: "training-victory", difficulty: "hard", minTeamSize: 6, distinctDays: true, target: 5, requirement: "Vinci 5 volte nella Zona Allenamento difficile con almeno 6 Pokémon in squadra all'inizio della sfida in giorni diversi", reward: { kind: "money", quantity: 90000 } }),
  defineMission({ missionIndex: 2017, category: MISSION_CATEGORY_ADVENTURE, phase: 9, sequence: 2, type: "zone-captures-after-badge", minBadges: 8, target: 30, requirement: "Cattura 30 Pokémon nelle Zone Cattura dopo aver ottenuto l'ottava medaglia", reward: itemChoiceReward("Strumento del Porto a scelta", PORT_PURCHASABLE_ITEM_INDEXES) })
];

export var AUTHORITATIVE_CAPTURE_MISSIONS = [
  totalCaptureMission(3000, 50, { kind: "money", quantity: 20000 }),
  totalCaptureMission(3001, 100, { kind: "item", itemIndex: i.ps_su.index, quantity: 10 }),
  totalCaptureMission(3002, 150, Object.assign(itemChoiceReward("MT acquistabile a scelta", ALL_PURCHASABLE_MT_ITEMS), { purchasableNow: true })),
  totalCaptureMission(3003, 200, pokemonChoiceReward("Pokémon a scelta Lv5 (no Fossile, no Legend)", "fixed-5", true)),
  totalCaptureMission(3004, 250, { kind: "item", itemIndex: i.pp_max.index, quantity: 10 }),
  totalCaptureMission(3005, 300, pokemonChoiceReward("Pokémon a scelta max Lv allenabile (no Fossile, no Legend)", "badge-cap", true)),
  differentSpeciesMission(3006, 50, itemChoiceReward("Strumento potenziatore del Tipo a scelta", TYPE_BOOSTER_ITEMS.map(function (item) { return item.index; }))),
  differentSpeciesMission(3007, 100, { kind: "item", itemIndex: i.ultra_ball.index, quantity: 30 }),
  differentSpeciesMission(3008, 150, itemChoiceReward("Aroma a scelta", AROMA_ITEM_INDEXES)),
  differentSpeciesMission(3009, 200, { kind: "item", itemIndex: i.squama_cuore.index, quantity: 3 }),
  differentSpeciesMission(3010, 250, { kind: "item", itemIndex: i.master_ball.index, quantity: 1 }),
  differentSpeciesMission(3011, 300, pokemonChoiceReward("Pokémon a scelta Lv5 (no Fossile)", "fixed-5", false))
].map(function (mission) {
  if (mission.type === "total-captures") {
    return Object.freeze(Object.assign({}, mission, { type: "zone-captures", requirement: mission.target + " catture nelle Zone Cattura" }));
  }
  return Object.freeze(Object.assign({}, mission, { type: "pokedex-species-count", requirement: mission.target + " specie registrate nel Pokédex Nazionale" }));
});

export var DAILY_MISSIONS = [
  defineMission({ missionIndex: 1000, category: MISSION_CATEGORY_DAILY, type: "daily-login", target: 1, requirement: "Effettua il login giornaliero", reward: { kind: "dynamic-item", itemIndex: i.ultra_ball.index, baseQuantity: 3, perBadge: 1 }, daily: true }),
  defineMission({ missionIndex: 1001, category: MISSION_CATEGORY_DAILY, type: "zone-captures", target: 10, requirement: "Cattura 10 Pokémon nelle Zone Cattura", reward: { kind: "dynamic-money", baseQuantity: 2000, perBadge: 500 }, daily: true }),
  defineMission({ missionIndex: 1002, category: MISSION_CATEGORY_DAILY, type: "training-difficulties", difficulties: ["easy", "medium", "hard"], target: 3, requirement: "Vinci una sfida facile, una media e una difficile nella Zona Allenamento", reward: Object.assign(itemChoiceReward("MT acquistabile a scelta", ALL_PURCHASABLE_MT_ITEMS), { purchasableNow: true }), daily: true })
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
