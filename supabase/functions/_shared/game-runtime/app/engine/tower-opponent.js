import { TYPE_CHART } from "../data/type-chart.js";
import { BATTLE_TOWER_ADVANCED_HELD_ITEMS, BATTLE_TOWER_BASE_HELD_ITEMS, BATTLE_TOWER_MOVE_EXCLUSIONS, battleTowerRuleForChallenge } from "../data/battle-tower.js";
import { getItemByIndex } from "../data/items.js";
import { pveMoveCategoriesFor } from "../data/pve-move-categories.js";
import { random } from "./deterministic-rng.js";
import { maxHpForLevel, maxPowerForLevel, maxStatsForLevel } from "../data/stat-tables.js";
import { createPokemonFromSpecies } from "./pokemon.js";
import { movePoolForLevel } from "./moves.js";
import { getAllSpecies } from "./species.js";
import { createTrainingOpponentPresentation } from "./training-opponent.js";

function randomEntry(values) {
  return values[Math.floor(random() * values.length)];
}

function shuffled(values) {
  var copy = values.slice();
  var index;
  for (index = copy.length - 1; index > 0; index -= 1) {
    var swap = Math.floor(random() * (index + 1));
    var value = copy[index];
    copy[index] = copy[swap];
    copy[swap] = value;
  }
  return copy;
}

function typeMultiplier(attackerTypes, defenderTypes) {
  var product = 1;
  (attackerTypes || []).forEach(function (attackerType) {
    var row = TYPE_CHART[attackerType] || {};
    (defenderTypes || []).forEach(function (defenderType) {
      product *= row[defenderType] !== undefined ? row[defenderType] : 1;
    });
  });
  return product > 1 ? 2 : product < 1 ? 0.5 : 1;
}

function eligibleSpecies(level) {
  var encounterLevel = Math.min(60, Math.max(1, Number(level) || 1));
  var candidates = getAllSpecies().filter(function (species) {
    var minLevel = Number(species.minLevel) || 1;
    var maxLevel = Number(species.maxLevel) || 100;
    return species.rarity !== "legendary" && encounterLevel >= minLevel && encounterLevel <= maxLevel;
  });
  return candidates.length ? candidates : getAllSpecies().filter(function (species) { return species.rarity !== "legendary"; });
}

function playerLevelSummary(team) {
  var pokemon = (team || []).filter(Boolean);
  var levels = pokemon.map(function (entry) { return Math.max(1, Math.floor(Number(entry.level) || 1)); });
  return {
    average: levels.length ? Math.floor(levels.reduce(function (sum, level) { return sum + level; }, 0) / levels.length) : 5,
    highest: levels.length ? Math.max.apply(null, levels) : 5
  };
}

function playerStatSummary(team) {
  var maxHp = 1;
  var maxPower = 0;
  var maxStats = 0;
  (team || []).filter(Boolean).forEach(function (pokemon) {
    maxHp = Math.max(maxHp, Number(pokemon.maxHp) || 0);
    (pokemon.moves || []).forEach(function (move) {
      maxPower = Math.max(maxPower, Number(move.power) || 0);
      maxStats = Math.max(maxStats, Number(move.stats) || 0);
    });
  });
  return { maxHp: maxHp, maxPower: maxPower, maxStats: maxStats };
}

function isDamageMove(move) {
  return Boolean(move && (move.damagingMove || pveMoveCategoriesFor(move).some(function (category) {
    return category.indexOf("damage") === 0;
  })));
}

function isPercentageMove(move) {
  return pveMoveCategoriesFor(move).some(function (category) { return category.indexOf("damagePercentage") === 0; });
}

function uniqueMoves(moves) {
  var seen = {};
  return (moves || []).filter(function (move) {
    var key = String(move && move.index || "");
    if (!key || seen[key]) { return false; }
    seen[key] = true;
    return true;
  });
}

function towerMovesForSpecies(species, level, rule) {
  var allMoves = uniqueMoves(movePoolForLevel(species, level));
  var exclusions = BATTLE_TOWER_MOVE_EXCLUSIONS[rule.moveTier] || [];
  var filtered = allMoves.filter(function (move) {
    return !pveMoveCategoriesFor(move).some(function (category) { return exclusions.indexOf(category) !== -1; });
  });
  var candidates = filtered.length ? filtered : allMoves;
  var requiredDamage = rule.moveTier >= 7 ? 2 : 1;
  var damage = shuffled(candidates.filter(isDamageMove));
  var result = damage.slice(0, requiredDamage);
  if (result.length < requiredDamage) {
    shuffled(allMoves.filter(isDamageMove)).forEach(function (move) {
      if (result.length < requiredDamage && result.indexOf(move) === -1) { result.push(move); }
    });
  }
  var available = shuffled(candidates.filter(function (move) { return result.indexOf(move) === -1; }));

  available.forEach(function (move) {
    if (result.length >= 4) { return; }
    if (rule.moveTier >= 7 && isPercentageMove(move) && result.filter(isPercentageMove).length >= 2) { return; }
    result.push(move);
  });
  if (result.length < Math.min(4, allMoves.length)) {
    shuffled(allMoves).forEach(function (move) {
      if (result.length < Math.min(4, allMoves.length) && result.indexOf(move) === -1) { result.push(move); }
    });
  }
  return result;
}

function pickSpecies(level, playerTeam, requireCoverage) {
  var candidates = shuffled(eligibleSpecies(level));
  var used = {};
  var playerTypes = (playerTeam || []).filter(Boolean);
  var teamSize = Math.max(1, Math.min(6, playerTypes.length));
  var superEffective = requireCoverage ? candidates.find(function (species) {
    return playerTypes.some(function (pokemon) { return typeMultiplier(species.type, pokemon.type) > 1; });
  }) : null;
  var resistant = requireCoverage ? candidates.find(function (species) {
    return playerTypes.some(function (pokemon) { return typeMultiplier(pokemon.type, species.type) < 1; });
  }) : null;
  var result = [];
  [superEffective, resistant].forEach(function (species) {
     if (species && !used[species.speciesKey] && result.length < teamSize) {
      used[species.speciesKey] = true;
      result.push(species);
    }
  });
  candidates.forEach(function (species) {
     if (result.length < teamSize && !used[species.speciesKey]) {
      used[species.speciesKey] = true;
      result.push(species);
    }
  });
   while (result.length < teamSize && candidates.length) { result.push(randomEntry(candidates)); }
  return result;
}

function typeBoosterForPokemon(pokemon) {
  var boosters = [
    200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217
  ].map(getItemByIndex).filter(function (item) {
    return item && pokemon.type.indexOf(item.boostType) !== -1;
  });
  return boosters.length ? randomEntry(boosters) : null;
}

function assignTowerHeldItems(team, rule) {
  var slots = shuffled(Array.from({ length: team.length }, function (_, index) { return index; }));
  if (rule.heldItemTier < 3) { return; }
  var assign = function (slot, itemIndex) {
    if (team[slot]) { team[slot].heldItemIndex = itemIndex; }
  };
  assign(slots[0], randomEntry(BATTLE_TOWER_BASE_HELD_ITEMS.primary));
  assign(slots[1], randomEntry(BATTLE_TOWER_BASE_HELD_ITEMS.secondary));
  assign(slots[2], randomEntry(BATTLE_TOWER_BASE_HELD_ITEMS.secondary));
  if (rule.heldItemTier < 7) { return; }
  [slots[3], slots[4]].forEach(function (slot) {
    if (!team[slot]) { return; }
    var booster = typeBoosterForPokemon(team[slot]);
    team[slot].heldItemIndex = booster ? booster.index : randomEntry(BATTLE_TOWER_ADVANCED_HELD_ITEMS);
  });
  assign(slots[5], randomEntry(BATTLE_TOWER_ADVANCED_HELD_ITEMS));
}

export function createBattleTowerOpponentTeam(playerTeam, challenge) {
  var rule = battleTowerRuleForChallenge(challenge);
  var levels = playerLevelSummary(playerTeam);
  var level = Math.max(5, Math.min(100, rule.levelRule === "average" ? levels.average : levels.highest));
  var stats = playerStatSummary(playerTeam);
  var team = pickSpecies(level, playerTeam, Boolean(rule.requireTypeCoverage)).map(function (species) {
    var moves = towerMovesForSpecies(species, level, rule);
    var maxHp = rule.statTier >= 7 ? Math.min(maxHpForLevel(level), stats.maxHp + (rule.statTier >= 10 ? 20 : 0)) : undefined;
    var pokemon = createPokemonFromSpecies(species.speciesKey, level, { moveDefs: moves, maxHp: maxHp });
    if (rule.statTier >= 7) {
      pokemon.moves.forEach(function (move) {
        move.power = Math.min(maxPowerForLevel(level), stats.maxPower + (rule.statTier >= 10 ? 10 : 0));
        move.stats = Math.min(maxStatsForLevel(level), stats.maxStats + (rule.statTier >= 10 ? 10 : 0));
      });
    }
    return pokemon;
  });
  assignTowerHeldItems(team, rule);
  return team;
}

export function createBattleTowerOpponentPresentation() {
  return createTrainingOpponentPresentation();
}
