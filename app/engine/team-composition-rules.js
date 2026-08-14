import { getItemByIndex } from "../data/items.js";
import { PORT_COMPETITIVE_ITEM_INDEXES } from "../data/team-rule-items.js";
import { TYPE_CHART } from "../data/type-chart.js";

export var TEAM_MAX = 6;

var SAME_SPECIES_LIMIT = 2;
var SAME_HELD_ITEM_LIMIT = 2;
var OFFICIAL_CHALLENGE_OHKO_POKEMON_LIMIT = 2;
var OHKO_MOVE_INDEXES = [2, 132, 211, 234];
var OHKO_MOVE_NAMES = ["Abisso", "Ghigliottina", "Perforcorno", "Purogelo"];

export var KANTO_LEAGUE_PORT_ITEM_RULE = { max: 2, requireDistinct: true };

function normalizedTeam(team) {
  return Array.isArray(team) ? team.filter(Boolean) : [];
}

function pokemonSpeciesKey(pokemon) {
  return pokemon && pokemon.speciesKey !== undefined && pokemon.speciesKey !== null ? String(pokemon.speciesKey) : "";
}

function pokemonName(pokemon) {
  return pokemon && pokemon.name ? String(pokemon.name) : "Pokemon";
}

function heldItemIndex(pokemon) {
  return Number(pokemon && pokemon.heldItemIndex) || 0;
}

function moveName(move) {
  return move && move.name ? String(move.name) : "";
}

function moveIndex(move) {
  return Number(move && move.index) || 0;
}

function itemName(itemIndex) {
  var item = getItemByIndex(itemIndex);
  return item ? item.name : "questo strumento";
}

function createSpeciesViolation(pokemon) {
  return {
    key: "species-limit",
    message: "Ci sono già due Pokémon della stessa specie in squadra.",
    lines: [
      "Ci sono già due Pokémon della stessa specie in squadra.",
      "Da regolamento non puoi avere più di 2 Pokémon della stessa specie."
    ],
    pokemon: pokemon || null
  };
}

function createHeldItemViolation(itemIndex) {
  return {
    key: "held-item-limit",
    message: "Ci sono già due Pokémon con " + itemName(itemIndex) + " in squadra.",
    lines: [
      "Ci sono già due Pokémon con " + itemName(itemIndex) + " in squadra.",
      "Da regolamento non puoi avere più di 2 Pokémon con lo stesso strumento tenuto."
    ],
    itemIndex: itemIndex
  };
}

function teamSpeciesCount(team, pokemon) {
  var speciesKey = pokemonSpeciesKey(pokemon);
  if (!speciesKey) {
    return 0;
  }
  return normalizedTeam(team).filter(function (teamPokemon) {
    return pokemonSpeciesKey(teamPokemon) === speciesKey;
  }).length;
}

function teamHeldItemCount(team, itemIndex, excludedIndex) {
  var normalizedItemIndex = Number(itemIndex) || 0;
  if (!normalizedItemIndex) {
    return 0;
  }
  return normalizedTeam(team).filter(function (teamPokemon, index) {
    return index !== excludedIndex && heldItemIndex(teamPokemon) === normalizedItemIndex;
  }).length;
}

function findDuplicateSpeciesViolation(team) {
  var counts = {};
  var firstPokemon = {};
  var violationKey = "";
  normalizedTeam(team).some(function (pokemon) {
    var key = pokemonSpeciesKey(pokemon);
    if (!key) {
      return false;
    }
    counts[key] = (counts[key] || 0) + 1;
    if (!firstPokemon[key]) {
      firstPokemon[key] = pokemon;
    }
    if (counts[key] > SAME_SPECIES_LIMIT) {
      violationKey = key;
      return true;
    }
    return false;
  });
  if (!violationKey) {
    return null;
  }
  return {
    key: "species-limit",
    message: "La squadra contiene più di 2 Pokémon della stessa specie.",
    lines: [
      "La squadra contiene più di 2 Pokémon della stessa specie.",
      pokemonName(firstPokemon[violationKey]) + " supera il limite consentito per le sfide."
    ]
  };
}

function findDuplicateHeldItemViolation(team) {
  var counts = {};
  var violationIndex = 0;
  normalizedTeam(team).some(function (pokemon) {
    var itemIndex = heldItemIndex(pokemon);
    if (!itemIndex) {
      return false;
    }
    counts[itemIndex] = (counts[itemIndex] || 0) + 1;
    if (counts[itemIndex] > SAME_HELD_ITEM_LIMIT) {
      violationIndex = itemIndex;
      return true;
    }
    return false;
  });
  if (!violationIndex) {
    return null;
  }
  return {
    key: "held-item-limit",
    message: "La squadra contiene più di 2 Pokémon con " + itemName(violationIndex) + ".",
    lines: [
      "La squadra contiene più di 2 Pokémon con " + itemName(violationIndex) + ".",
      "Da regolamento non puoi avere più di 2 Pokémon con lo stesso strumento tenuto."
    ],
    itemIndex: violationIndex
  };
}

function pokemonHasOhkoMove(pokemon) {
  return Boolean(pokemon && Array.isArray(pokemon.moves) && pokemon.moves.some(function (move) {
    return OHKO_MOVE_INDEXES.indexOf(moveIndex(move)) !== -1 || OHKO_MOVE_NAMES.indexOf(moveName(move)) !== -1;
  }));
}

export function findOfficialChallengeOhkoMoveViolation(team) {
  var ohkoPokemon = normalizedTeam(team).filter(pokemonHasOhkoMove);
  if (ohkoPokemon.length <= OFFICIAL_CHALLENGE_OHKO_POKEMON_LIMIT) {
    return null;
  }
  return {
    key: "ohko-move-pokemon-limit",
    message: "La squadra contiene più di 2 Pokémon con mosse OHKO.",
    lines: [
      "La squadra contiene più di 2 Pokémon con mosse OHKO.",
      "Per Palestre e Lega puoi portare al massimo 2 Pokémon con Abisso, Ghigliottina, Perforcorno o Purogelo."
    ]
  };
}

function pokemonTypeEfficacy(attacker, defender) {
  var attackerTypes = attacker && Array.isArray(attacker.type) ? attacker.type : [];
  var defenderTypes = defender && Array.isArray(defender.type) ? defender.type : [];
  var product = 1.0;
  attackerTypes.forEach(function (attackerType) {
    var row = TYPE_CHART[attackerType] || {};
    defenderTypes.forEach(function (defenderType) {
      product *= row[defenderType] !== undefined ? row[defenderType] : 1.0;
    });
  });
  if (product > 1.0) {
    return 2.0;
  }
  if (product < 1.0) {
    return 0.5;
  }
  return 1.0;
}

function pokemonIsSuperEffectiveAgainstAny(pokemon, opponentTeam) {
  return normalizedTeam(opponentTeam).some(function (opponent) {
    return pokemonTypeEfficacy(pokemon, opponent) > 1.0;
  });
}

export function teamCanReceivePokemonSpecies(team, pokemon) {
  return teamSpeciesCount(team, pokemon) < SAME_SPECIES_LIMIT;
}

export function teamCanReceivePokemonHeldItem(team, pokemon) {
  var itemIndex = heldItemIndex(pokemon);
  return !itemIndex || teamHeldItemCount(team, itemIndex) < SAME_HELD_ITEM_LIMIT;
}

export function findPokemonJoinTeamViolation(team, pokemon) {
  if (!teamCanReceivePokemonSpecies(team, pokemon)) {
    return createSpeciesViolation(pokemon);
  }
  if (!teamCanReceivePokemonHeldItem(team, pokemon)) {
    return createHeldItemViolation(heldItemIndex(pokemon));
  }
  return null;
}

export function findHeldItemAssignmentViolation(team, pokemon, item, pokemonIndex) {
  var itemIndex = Number(item && item.index) || 0;
  if (!pokemon || !itemIndex) {
    return null;
  }
  if (teamHeldItemCount(team, itemIndex, Number(pokemonIndex)) >= SAME_HELD_ITEM_LIMIT) {
    return createHeldItemViolation(itemIndex);
  }
  return null;
}

export function findTeamCompositionViolation(team) {
  return findDuplicateSpeciesViolation(team) || findDuplicateHeldItemViolation(team);
}

export function kantoGymPortItemRuleForBadgeIndex(badgeIndex) {
  return { max: Math.floor(Number(badgeIndex) || 0) < 6 ? 0 : 1, requireDistinct: false };
}

export function kantoGymSuperEffectivePokemonRuleForBadgeIndex(badgeIndex) {
  var normalizedBadgeIndex = Math.floor(Number(badgeIndex) || 0);
  if (normalizedBadgeIndex === 5 || normalizedBadgeIndex === 6) {
    return { max: 3 };
  }
  if (normalizedBadgeIndex === 7) {
    return { max: 2 };
  }
  return null;
}

export function isPortCompetitiveHeldItemIndex(itemIndex) {
  return PORT_COMPETITIVE_ITEM_INDEXES.indexOf(Number(itemIndex) || 0) !== -1;
}

export function findOfficialChallengePortItemViolation(team, rule) {
  var max = Math.max(0, Math.floor(Number(rule && rule.max) || 0));
  var requireDistinct = Boolean(rule && rule.requireDistinct);
  var portItemIndexes = normalizedTeam(team).map(function (pokemon) {
    return heldItemIndex(pokemon);
  }).filter(isPortCompetitiveHeldItemIndex);
  var seen = {};
  var duplicateIndex = 0;

  if (portItemIndexes.length > max) {
    return {
      key: "port-held-item-limit",
      message: "La squadra supera il limite di Strumenti del Porto per questa sfida.",
      lines: ["La squadra supera il limite di Strumenti del Porto per questa sfida."]
    };
  }
  if (requireDistinct) {
    portItemIndexes.some(function (itemIndex) {
      if (seen[itemIndex]) {
        duplicateIndex = itemIndex;
        return true;
      }
      seen[itemIndex] = true;
      return false;
    });
  }
  if (duplicateIndex) {
    return {
      key: "port-held-item-duplicate",
      message: "Gli Strumenti del Porto della squadra devono essere diversi.",
      lines: ["Gli Strumenti del Porto della squadra devono essere diversi.", itemName(duplicateIndex) + " non può essere tenuto in questa sfida."],
      itemIndex: duplicateIndex
    };
  }
  return null;
}

export function findOfficialChallengeSuperEffectivePokemonViolation(team, opponentTeam, rule) {
  if (!rule) {
    return null;
  }
  var max = Math.floor(Number(rule.max));
  var superEffectivePokemon;
  if (!Number.isFinite(max) || max < 0) {
    return null;
  }
  superEffectivePokemon = normalizedTeam(team).filter(function (pokemon) {
    return pokemonIsSuperEffectiveAgainstAny(pokemon, opponentTeam);
  });
  if (superEffectivePokemon.length <= max) {
    return null;
  }
  return {
    key: "super-effective-pokemon-limit",
    message: "La squadra supera il limite di Pokémon superefficaci per questa sfida.",
    lines: [
      "La squadra contiene " + superEffectivePokemon.length + " Pokémon superefficaci sui Pokémon del capopalestra.",
      "Per questa Palestra puoi portarne al massimo " + max + "."
    ],
    pokemon: superEffectivePokemon
  };
}
