import { CATCH_HP_THRESHOLDS, CATCH_RARITY_MULTIPLIERS } from "../data/capture-zones.js";
import { random } from "./deterministic-rng.js";
import { findSpecies } from "./species.js";

var MASTER_BALL_INDEX = 620;

export function computeBallCaptureResult(ballItem, wildCombatant) {
  var catchRate;
  if (!ballItem || !wildCombatant || !wildCombatant.pokemon) {
    return false;
  }
  if (Number(ballItem.index) === MASTER_BALL_INDEX) {
    return true;
  }

  catchRate = computeBallCaptureRate(ballItem, wildCombatant);
  return random() * 100 < catchRate;
}

export function computeBallCaptureRate(ballItem, wildCombatant) {
  var baseRate = Number(ballItem && ballItem.value) || 0;
  var pokemon = wildCombatant && wildCombatant.pokemon;
  var species = pokemon ? findSpecies(pokemon.speciesKey || pokemon.name) : null;
  var encounter = species && species.encounter ? species.encounter : {};
  var rarity = encounter.rarity !== undefined ? encounter.rarity : species && species.rarity;
  var rarityMult = CATCH_RARITY_MULTIPLIERS[rarity] || 1.0;
  var maxHp = Number(pokemon && pokemon.maxHp) || 0;
  var hp = Number(wildCombatant && wildCombatant.hp);
  var hpFraction = maxHp > 0 ? Math.max(0, Math.min(1, hp / maxHp)) : 1;
  var hpMult = hpMultiplierForFraction(hpFraction);
  return Math.min(100, Math.max(0, baseRate * rarityMult * hpMult));
}

function hpMultiplierForFraction(hpFraction) {
  var index;
  for (index = 0; index < CATCH_HP_THRESHOLDS.length; index += 1) {
    if (hpFraction <= CATCH_HP_THRESHOLDS[index].maxHpFraction) {
      return CATCH_HP_THRESHOLDS[index].multiplier;
    }
  }
  return 1.0;
}
