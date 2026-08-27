import { MOVE_LIBRARY } from "./moves.js";
import { ITEM_LIBRARY, itemsSortedByIndex } from "./items.js";
import { SPECIES_LIBRARY as SPECIES_LIBRARY_I } from "./species_I.js";
import { SPECIES_LIBRARY as SPECIES_LIBRARY_II } from "./species_II.js";
import { SPECIES_LIBRARY as SPECIES_LIBRARY_III } from "./species_III.js";
import { CAPTURE_ZONES, CATCH_FORMULA, CATCH_HP_THRESHOLDS, CATCH_RARITY_MULTIPLIERS, CATCH_STATUS_MULTIPLIERS, RARITY_WEIGHTS } from "./capture-zones.js";

const SPECIES_LIBRARY = { ...SPECIES_LIBRARY_I, ...SPECIES_LIBRARY_II, ...SPECIES_LIBRARY_III };
const ITEM_LIBRARY_BY_INDEX = itemsSortedByIndex(ITEM_LIBRARY);
import { HP_BY_LEVEL, PW_BY_LEVEL, STATS_BY_LEVEL, SHINY_HP_BONUS_BY_LEVEL, SHINY_POWER_BONUS_BY_LEVEL, SHINY_STATS_BONUS_BY_LEVEL, LEGENDARY_HP_BONUS_AT_LEVEL_60, LEGENDARY_POWER_BONUS_AT_LEVEL_60, LEGENDARY_STATS_BONUS_AT_LEVEL_60, STAT_CAP_LEVELS, maxHpForLevel, maxPowerForLevel, maxStatsForLevel, maxHpForPokemon, maxPowerForPokemon, maxStatsForPokemon, shinyHpBonusForLevel, shinyPowerBonusForLevel, shinyStatsBonusForLevel, legendaryHpBonusForLevel, legendaryPowerBonusForLevel, legendaryStatsBonusForLevel, isLegendaryPokemon, clampToLimits } from "./stat-tables.js";
import { SHINY_ODDS_DENOMINATOR } from "./progression.js";

export const GDR_DATA = {
  moveLibrary: MOVE_LIBRARY,
  itemLibrary: ITEM_LIBRARY_BY_INDEX,
  speciesLibrary: SPECIES_LIBRARY,
  zones: CAPTURE_ZONES,
  rarityWeights: RARITY_WEIGHTS,
  catchRarityMultipliers: CATCH_RARITY_MULTIPLIERS,
  catchHpThresholds: CATCH_HP_THRESHOLDS,
  catchStatusMultipliers: CATCH_STATUS_MULTIPLIERS,
  catchFormula: CATCH_FORMULA,
  hpByLevel: HP_BY_LEVEL,
  powerByLevel: PW_BY_LEVEL,
  statsByLevel: STATS_BY_LEVEL
};

export {
  ITEM_LIBRARY,
  MOVE_LIBRARY,
  SPECIES_LIBRARY,
  CAPTURE_ZONES as ZONES,
  CATCH_RARITY_MULTIPLIERS,
  CATCH_HP_THRESHOLDS,
  CATCH_STATUS_MULTIPLIERS,
  CATCH_FORMULA,
  RARITY_WEIGHTS,
  HP_BY_LEVEL,
  PW_BY_LEVEL,
  STATS_BY_LEVEL,
  SHINY_HP_BONUS_BY_LEVEL,
  SHINY_POWER_BONUS_BY_LEVEL,
  SHINY_STATS_BONUS_BY_LEVEL,
  LEGENDARY_HP_BONUS_AT_LEVEL_60,
  LEGENDARY_POWER_BONUS_AT_LEVEL_60,
  LEGENDARY_STATS_BONUS_AT_LEVEL_60,
  SHINY_ODDS_DENOMINATOR,
  STAT_CAP_LEVELS,
  maxHpForLevel,
  maxPowerForLevel,
  maxStatsForLevel,
  maxHpForPokemon,
  maxPowerForPokemon,
  maxStatsForPokemon,
  shinyHpBonusForLevel,
  shinyPowerBonusForLevel,
  shinyStatsBonusForLevel,
  legendaryHpBonusForLevel,
  legendaryPowerBonusForLevel,
  legendaryStatsBonusForLevel,
  isLegendaryPokemon,
  clampToLimits
};
