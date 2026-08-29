import { ITEM_LIBRARY, ItemCategory } from "./items.js";
import { MOVE_LIBRARY } from "./moves.js";
import { SPECIES_LIBRARY } from "./index.js";
import { PORT_COMPETITIVE_ITEM_INDEXES } from "./team-rule-items.js";

export var BATTLE_DOME_TEAM_SIZE = 6;
export var BATTLE_DOME_MAX_ACTIVE_BATTLES = 2;
export var BATTLE_DOME_LEVEL = 100;
export var BATTLE_DOME_HP = 400;
export var BATTLE_DOME_MOVE_POWER = 320;
export var BATTLE_DOME_MOVE_STATS = 170;
export var BATTLE_DOME_PORT_ITEM_INDEXES = Object.freeze(PORT_COMPETITIVE_ITEM_INDEXES.slice());

export function battleDomeSpecies() {
  return Object.keys(SPECIES_LIBRARY).filter(function (key) {
    var species = SPECIES_LIBRARY[key];
    var rarity = species && species.encounter && species.encounter.rarity !== undefined
      ? species.encounter.rarity : species && species.rarity;
    return rarity !== "legendary";
  }).map(function (key) { return Object.assign({ speciesKey: key }, SPECIES_LIBRARY[key]); });
}

export function battleDomeHeldItems() {
  return ITEM_LIBRARY.filter(function (item) {
    return item.category === ItemCategory.HeldItem || item.category === ItemCategory.Berry;
  });
}

export function battleDomeMovePool(speciesKey) {
  var species = SPECIES_LIBRARY[String(speciesKey || "")];
  var seen = {};
  var moves = [];
  if (!species) return moves;
  Object.keys(species.movesByLevel || {}).map(Number).filter(function (level) {
    return Number.isFinite(level) && level >= 5 && level <= BATTLE_DOME_LEVEL;
  }).sort(function (left, right) { return left - right; }).forEach(function (level) {
    (species.movesByLevel[level] || []).forEach(add);
  });
  (species.movesByTM || []).forEach(add);
  return moves;

  function add(move) {
    var index = Number(move && move.index);
    if (!Number.isFinite(index) || seen[index]) return;
    seen[index] = true;
    moves.push(MOVE_LIBRARY.find(function (entry) { return Number(entry.index) === index; }) || move);
  }
}

export function validateBattleDomeTeam(team, complete) {
  var entries = Array.isArray(team) ? team : [];
  var speciesCounts = {};
  var itemCounts = {};
  var portItems = [];
  if (entries.length > BATTLE_DOME_TEAM_SIZE || (complete && entries.length < 1)) return "team_size";
  for (var index = 0; index < entries.length; index += 1) {
    var entry = entries[index] || {};
    var speciesKey = String(entry.species_key || "");
    var moves = Array.isArray(entry.moves) ? entry.moves.map(Number) : [];
    var pool = battleDomeMovePool(speciesKey).map(function (move) { return Number(move.index); });
    var itemIndex = Number(entry.held_item_index) || 0;
    if (!SPECIES_LIBRARY[speciesKey] || !battleDomeSpecies().some(function (species) { return species.speciesKey === speciesKey; })) return "species";
    speciesCounts[speciesKey] = (speciesCounts[speciesKey] || 0) + 1;
    if (speciesCounts[speciesKey] > 2) return "species_limit";
    if (moves.length < 1 || moves.length > 4 || moves.some(function (move, moveIndex) {
      return pool.indexOf(move) === -1 || moves.indexOf(move) !== moveIndex;
    })) return "moves";
    if (itemIndex) {
      if (!battleDomeHeldItems().some(function (item) { return Number(item.index) === itemIndex; })) return "item";
      itemCounts[itemIndex] = (itemCounts[itemIndex] || 0) + 1;
      if (itemCounts[itemIndex] > 2) return "item_limit";
      if (BATTLE_DOME_PORT_ITEM_INDEXES.indexOf(itemIndex) !== -1) portItems.push(itemIndex);
    }
  }
  if (portItems.length > 2 || new Set(portItems).size !== portItems.length) return "port_limit";
  return "";
}
