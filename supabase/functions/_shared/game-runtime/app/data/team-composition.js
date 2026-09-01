import { MOVE_LIBRARY } from "./moves.js";
import { PORT_COMPETITIVE_ITEM_INDEXES } from "./team-rule-items.js";

export var TEAM_MAX = 6;
export var TEAM_SAME_SPECIES_LIMIT = 2;
export var TEAM_SAME_HELD_ITEM_LIMIT = 2;
export var TEAM_PORT_ITEM_LIMIT = 2;
export var TEAM_OHKO_POKEMON_LIMIT = 2;

export var OHKO_MOVE_INDEXES = Object.freeze(MOVE_LIBRARY.filter(function (move) {
  return Boolean(move && move.isOhkoMove);
}).map(function (move) {
  return Number(move.index);
}));

function normalizedTeam(team) {
  return Array.isArray(team) ? team.filter(Boolean) : [];
}

function speciesKey(pokemon) {
  var value = pokemon && (pokemon.speciesKey !== undefined ? pokemon.speciesKey : pokemon.species_key);
  return value !== undefined && value !== null ? String(value) : "";
}

function heldItemIndex(pokemon) {
  return Number(pokemon && (pokemon.heldItemIndex !== undefined ? pokemon.heldItemIndex : pokemon.held_item_index)) || 0;
}

function moveIndex(move) {
  return Number(move && typeof move === "object" ? move.index : move) || 0;
}

function pokemonHasOhkoMove(pokemon) {
  return Boolean(pokemon && Array.isArray(pokemon.moves) && pokemon.moves.some(function (move) {
    return OHKO_MOVE_INDEXES.indexOf(moveIndex(move)) !== -1;
  }));
}

export function isPortCompetitiveHeldItemIndex(itemIndex) {
  return PORT_COMPETITIVE_ITEM_INDEXES.indexOf(Number(itemIndex) || 0) !== -1;
}

export function findTeamCompositionViolation(team) {
  var entries = normalizedTeam(team);
  var speciesCounts = {};
  var itemCounts = {};
  var portItems = [];
  var violation = null;

  entries.some(function (pokemon) {
    var key = speciesKey(pokemon);
    if (!key) return false;
    speciesCounts[key] = (speciesCounts[key] || 0) + 1;
    if (speciesCounts[key] > TEAM_SAME_SPECIES_LIMIT) {
      violation = { key: "team_species_limit", speciesKey: key, max: TEAM_SAME_SPECIES_LIMIT };
      return true;
    }
    return false;
  });
  if (violation) return violation;

  entries.some(function (pokemon) {
    var itemIndex = heldItemIndex(pokemon);
    if (!itemIndex) return false;
    itemCounts[itemIndex] = (itemCounts[itemIndex] || 0) + 1;
    if (itemCounts[itemIndex] > TEAM_SAME_HELD_ITEM_LIMIT) {
      violation = { key: "team_held_item_limit", itemIndex: itemIndex, max: TEAM_SAME_HELD_ITEM_LIMIT };
      return true;
    }
    if (isPortCompetitiveHeldItemIndex(itemIndex)) portItems.push(itemIndex);
    return false;
  });
  if (violation) return violation;

  if (portItems.length > TEAM_PORT_ITEM_LIMIT) {
    return { key: "port_held_item_limit", count: portItems.length, max: TEAM_PORT_ITEM_LIMIT };
  }
  var seenPortItems = {};
  var duplicatePortItem = portItems.find(function (itemIndex) {
    if (seenPortItems[itemIndex]) return true;
    seenPortItems[itemIndex] = true;
    return false;
  });
  if (duplicatePortItem) {
    return { key: "port_held_item_duplicate", itemIndex: duplicatePortItem };
  }

  var ohkoPokemonCount = entries.filter(pokemonHasOhkoMove).length;
  if (ohkoPokemonCount > TEAM_OHKO_POKEMON_LIMIT) {
    return {
      key: "ohko_move_pokemon_limit",
      count: ohkoPokemonCount,
      max: TEAM_OHKO_POKEMON_LIMIT,
      moveIndexes: OHKO_MOVE_INDEXES.slice()
    };
  }
  return null;
}
