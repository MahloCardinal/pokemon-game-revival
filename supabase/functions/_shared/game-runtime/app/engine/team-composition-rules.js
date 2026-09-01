export { TEAM_MAX, findTeamCompositionViolation, isPortCompetitiveHeldItemIndex } from "../data/team-composition.js";
import { TYPE_CHART } from "../data/type-chart.js";

function normalizedTeam(team) {
  return Array.isArray(team) ? team.filter(Boolean) : [];
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
    key: "super_effective_pokemon_limit",
    count: superEffectivePokemon.length,
    max: max
  };
}
