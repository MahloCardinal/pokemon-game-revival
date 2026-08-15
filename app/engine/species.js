import { GDR_DATA as DATA } from "../data/index.js";
import { random } from "./deterministic-rng.js";
import { ItemCategory } from "../data/items.js";
export function weightedChoice(items, weights) {
  var total = 0;
  var index;
  for (index = 0; index < weights.length; index += 1) {
    total += weights[index];
  }
  var pick = random() * total;
  var running = 0;
  for (index = 0; index < items.length; index += 1) {
    running += weights[index];
    if (pick <= running) {
      return items[index];
    }
  }
  return items[items.length - 1];
}
import { createWildPokemon } from "./pokemon.js";

export function getAllSpecies() {
  return Object.keys(DATA.speciesLibrary).map(function (speciesKey) {
    var entry = DATA.speciesLibrary[speciesKey];
    var encounter = entry.encounter || {};
    return {
      speciesKey: speciesKey,
      name: entry.name || speciesKey,
      dexNumber: entry.dexNumber,
      type: entry.type.slice(),
      gender: (entry.gender || []).slice(),
      rarity: encounter.rarity !== undefined ? encounter.rarity : entry.rarity,
      minLevel: encounter.minLevel !== undefined ? encounter.minLevel : entry.minLevel,
      maxLevel: encounter.maxLevel !== undefined ? encounter.maxLevel : entry.maxLevel,
      exp: entry.exp,
      spriteGendered: !!entry.spriteGendered,
      movesByLevel: entry.movesByLevel,
      movesByTM: entry.movesByTM || [],
      encounter: {
        rarity: encounter.rarity !== undefined ? encounter.rarity : entry.rarity,
        minLevel: encounter.minLevel !== undefined ? encounter.minLevel : entry.minLevel,
        maxLevel: encounter.maxLevel !== undefined ? encounter.maxLevel : entry.maxLevel
      },
      evolution: entry.evolution || { stage: "base", to: [] }
    };
  });
}

export function generationForDexNumber(dexNumber) {
  var number = Number(dexNumber);
  if (number >= 1 && number <= 151) return 1;
  if (number >= 152 && number <= 251) return 2;
  if (number >= 252 && number <= 386) return 3;
  return 0;
}

export function findSpecies(speciesIdentifier) {
  var key = speciesIdentifier !== undefined && speciesIdentifier !== null ? String(speciesIdentifier).trim() : "";
  return getAllSpecies().find(function (entry) {
    return entry.speciesKey === key;
  }) || null;
}

export function itemEvolutionForPokemon(pokemon, item) {
  var entry = pokemon ? findSpecies(pokemon.speciesKey) : null;
  var evolutions = entry && entry.evolution && Array.isArray(entry.evolution.to) ? entry.evolution.to : [];
  return evolutions.find(function (evolution) {
    return evolution
      && evolution.species
      && evolution.trigger
      && evolution.trigger.kind === "item"
      && evolution.trigger.item
      && item
      && Number(evolution.trigger.item.index) === Number(item.index);
  }) || null;
}

function pokemonKnowsMove(pokemon, moveDef) {
  return Boolean(pokemon && moveDef && (pokemon.moves || []).some(function (move) {
    return move && move.index === moveDef.index;
  }));
}

export function pokemonCanLearnTM(pokemon, item) {
  var entry = pokemon ? findSpecies(pokemon.speciesKey) : null;
  var tmPool = entry ? entry.movesByTM : [];
  var tmMove = item && item.move;
  return Boolean(
    item
      && item.category === ItemCategory.TM
      && tmMove
      && pokemon
      && tmPool.some(function (moveDef) { return moveDef && moveDef.index === tmMove.index; })
      && !pokemonKnowsMove(pokemon, tmMove)
  );
}

export function pokemonMoveTutorPool(pokemon) {
  var entry = pokemon ? findSpecies(pokemon.speciesKey) : null;
  var known = {};
  var seen = {};
  var moves = [];
  var currentLevel = Math.floor(Number(pokemon && pokemon.level) || 0);
  var levels;
  if (!entry) return moves;
  (pokemon.moves || []).forEach(function (move) {
    if (move && move.index !== undefined) known[Number(move.index)] = true;
  });
  levels = Object.keys(entry.movesByLevel || {}).map(Number).filter(function (level) {
    return Number.isFinite(level) && level >= 5 && level <= currentLevel;
  }).sort(function (left, right) { return left - right; });
  levels.forEach(function (level) {
    (entry.movesByLevel[level] || []).forEach(function (move) {
      var index = Number(move && move.index);
      if (move && Number.isFinite(index) && !known[index] && !seen[index]) {
        seen[index] = true;
        moves.push(move);
      }
    });
  });
  (entry.movesByTM || []).forEach(function (move) {
    var index = Number(move && move.index);
    if (move && Number.isFinite(index) && !known[index] && !seen[index]) {
      seen[index] = true;
      moves.push(move);
    }
  });
  return moves;
}

function getPokemonDataByType(typeName) {
  return getAllSpecies().filter(function (species) {
    return species.type.indexOf(typeName) !== -1;
  });
}

export function getZoneTypes(zoneName) {
  var baseTypes = DATA.zones[zoneName] || [];
  return baseTypes.filter(function (typeName) {
    return getPokemonDataByType(typeName).length > 0;
  });
}

export function searchWildPokemon(typeName, level) {
  var encounterLevel = Math.min(level, 60);
  var candidates = getPokemonDataByType(typeName).filter(function (species) {
    return encounterLevel >= species.minLevel && encounterLevel <= species.maxLevel;
  });
  var weightedCandidates;
  var weights;
  if (!candidates.length) {
    return null;
  }

  weightedCandidates = candidates.map(function (species) {
    var weight = DATA.rarityWeights[species.rarity];
    if (typeof weight !== "number") {
      weight = 100;
    }
    return {
      species: species,
      weight: weight
    };
  }).filter(function (entry) {
    return entry.weight > 0;
  });

  if (!weightedCandidates.length) {
    return null;
  }

  weights = weightedCandidates.map(function (entry) {
    return entry.weight;
  });
  return createWildPokemon(weightedChoice(weightedCandidates.map(function (entry) {
    return entry.species;
  }), weights), level);
}

export function searchWildPokemonFromTypes(typeNames, level) {
  var encounterLevel = Math.min(level, 60);
  var normalizedTypes = Array.isArray(typeNames) ? typeNames : [];
  var seen = {};
  var candidates = getAllSpecies().filter(function (species) {
    var matchesType = normalizedTypes.some(function (typeName) {
      return species.type.indexOf(typeName) !== -1;
    });
    if (!matchesType || seen[species.speciesKey]) {
      return false;
    }
    seen[species.speciesKey] = true;
    return encounterLevel >= species.minLevel && encounterLevel <= species.maxLevel;
  });
  var weightedCandidates;
  var weights;
  if (!candidates.length) {
    return null;
  }

  weightedCandidates = candidates.map(function (species) {
    var weight = DATA.rarityWeights[species.rarity];
    if (typeof weight !== "number") {
      weight = 100;
    }
    return {
      species: species,
      weight: weight
    };
  }).filter(function (entry) {
    return entry.weight > 0;
  });

  if (!weightedCandidates.length) {
    return null;
  }

  weights = weightedCandidates.map(function (entry) {
    return entry.weight;
  });
  return createWildPokemon(weightedChoice(weightedCandidates.map(function (entry) {
    return entry.species;
  }), weights), level);
}
