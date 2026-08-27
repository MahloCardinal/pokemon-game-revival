export var HP_BY_LEVEL = {
  5: 23, 6: 26, 7: 29, 8: 32, 9: 35, 10: 38,
  11: 40, 12: 42, 13: 45, 14: 47, 15: 50, 16: 52,
  17: 54, 18: 56, 19: 58, 20: 60, 21: 62, 22: 64,
  23: 66, 24: 68, 25: 70, 26: 74, 27: 78, 28: 82,
  29: 86, 30: 90, 31: 95, 32: 100, 33: 105, 34: 110,
  35: 115, 36: 120, 37: 125, 38: 130, 39: 135, 40: 140,
  41: 146, 42: 153, 43: 159, 44: 166, 45: 172, 46: 179,
  47: 185, 48: 192, 49: 198, 50: 205, 51: 210, 52: 216,
  53: 221, 54: 227, 55: 232, 56: 238, 57: 243, 58: 249,
  59: 254, 60: 260
};

export var PW_BY_LEVEL = {
  5: 4, 6: 6, 7: 8, 8: 10, 9: 12, 10: 15,
  11: 16, 12: 17, 13: 19, 14: 20, 15: 22, 16: 23,
  17: 26, 18: 28, 19: 31, 20: 34, 21: 36, 22: 40,
  23: 42, 24: 45, 25: 48, 26: 51, 27: 54, 28: 58,
  29: 61, 30: 65, 31: 68, 32: 72, 33: 75, 34: 79,
  35: 82, 36: 86, 37: 89, 38: 93, 39: 95, 40: 98,
  41: 103, 42: 106, 43: 109, 44: 112, 45: 115, 46: 118,
  47: 121, 48: 124, 49: 127, 50: 130, 51: 135, 52: 140,
  53: 145, 54: 150, 55: 155, 56: 160, 57: 165, 58: 170,
  59: 175, 60: 180
};

export var STATS_BY_LEVEL = {
  5: 1, 6: 1, 7: 1, 8: 1, 9: 1,
  10: 1, 11: 2, 12: 2, 13: 2, 14: 2,
  15: 2, 16: 2, 17: 3, 18: 3, 19: 3,
  20: 4, 21: 6, 22: 7, 23: 9, 24: 10,
  25: 12, 26: 14, 27: 17, 28: 19, 29: 22,
  30: 25, 31: 26, 32: 27, 33: 28, 34: 29,
  35: 30, 36: 31, 37: 32, 38: 33, 39: 34,
  40: 34, 41: 36, 42: 37, 43: 38, 44: 39,
  45: 40, 46: 41, 47: 42, 48: 43, 49: 44,
  50: 45, 51: 46, 52: 47, 53: 48, 54: 49,
  55: 51, 56: 53, 57: 54, 58: 56, 59: 57,
  60: 59
};

export var SHINY_HP_BONUS_BY_LEVEL = {
  5: 4, 6: 4, 7: 5, 8: 5, 9: 6, 10: 6,
  11: 7, 12: 7, 13: 8, 14: 8, 15: 9, 16: 9,
  17: 10, 18: 10, 19: 11, 20: 12, 21: 12, 22: 13,
  23: 13, 24: 14, 25: 14, 26: 15, 27: 15, 28: 16,
  29: 16, 30: 17, 31: 17, 32: 17, 33: 18, 34: 18,
  35: 18, 36: 19, 37: 19, 38: 19, 39: 20, 40: 20
};

export var SHINY_POWER_BONUS_BY_LEVEL = {
  5: 1, 6: 1, 7: 1, 8: 2, 9: 2, 10: 2,
  11: 2, 12: 3, 13: 3, 14: 3, 15: 4, 16: 4,
  17: 4, 18: 5, 19: 5, 20: 5, 21: 6, 22: 6,
  23: 6, 24: 7, 25: 7, 26: 8, 27: 8, 28: 8,
  29: 9, 30: 9, 31: 10, 32: 10, 33: 11, 34: 11,
  35: 12, 36: 12, 37: 13, 38: 13, 39: 14, 40: 15
};

export var SHINY_STATS_BONUS_BY_LEVEL = {
  5: 1, 6: 1, 7: 1, 8: 1, 9: 1, 10: 1,
  11: 1, 12: 1, 13: 1, 14: 1, 15: 1, 16: 2,
  17: 2, 18: 2, 19: 2, 20: 2, 21: 3, 22: 3,
  23: 3, 24: 3, 25: 4, 26: 4, 27: 4, 28: 5,
  29: 5, 30: 5, 31: 6, 32: 6, 33: 7, 34: 7,
  35: 8, 36: 9, 37: 10, 38: 12, 39: 13, 40: 15
};

function shinyBonusForLevel(table, level) {
  var numericLevel = Math.max(5, Math.min(40, Math.floor(Number(level) || 5)));
  return Number(table[numericLevel]) || 0;
}

export function shinyHpBonusForLevel(level) {
  return shinyBonusForLevel(SHINY_HP_BONUS_BY_LEVEL, level);
}

export function shinyPowerBonusForLevel(level) {
  return shinyBonusForLevel(SHINY_POWER_BONUS_BY_LEVEL, level);
}

export function shinyStatsBonusForLevel(level) {
  return shinyBonusForLevel(SHINY_STATS_BONUS_BY_LEVEL, level);
}

export function shinyOriginLevelForPokemon(pokemon) {
  if (!pokemon || !pokemon.isShiny) { return 0; }
  return Math.max(5, Math.min(100, Math.floor(Number(pokemon.shinyOriginLevel || pokemon.level) || 5)));
}

var HP_CAPS = {
  5: 40, 10: 60, 20: 90, 30: 120, 40: 165, 50: 230, 60: 280, 70: 310, 80: 340, 90: 370, 100: 400
};

var POWER_CAPS = {
  5: 10, 10: 30, 20: 70, 30: 110, 40: 150, 50: 180, 60: 240, 70: 260, 80: 280, 90: 300, 100: 320
};

var STATS_CAPS = {
  5: 5, 10: 5, 20: 5, 30: 25, 40: 50, 50: 70, 60: 90, 70: 110, 80: 130, 90: 150, 100: 170
};

export var STAT_CAP_LEVELS = Object.keys(Object.assign({}, HP_CAPS, POWER_CAPS, STATS_CAPS)).map(Number).sort(function (a, b) { return a - b; });

function nearestTableLevel(caps, level) {
  var levels = Object.keys(caps).map(Number).sort(function (a, b) { return a - b; });
  var result = levels[0];
  for (var i = 0; i < levels.length; i++) {
    if (levels[i] <= level) { result = levels[i]; }
  }
  return result;
}

export function maxHpForLevel(level) {
  var tbl = nearestTableLevel(HP_CAPS, level);
  if (tbl === level) { return HP_CAPS[level]; }
  return HP_CAPS[tbl] + (level - tbl) * 3;
}

export function maxPowerForLevel(level) {
  var tbl = nearestTableLevel(POWER_CAPS, level);
  if (tbl === level) { return POWER_CAPS[level]; }
  return POWER_CAPS[tbl] + (level - tbl) * 2;
}

export function maxStatsForLevel(level) {
  var numericLevel = Math.max(5, Math.floor(Number(level) || 5));
  var tbl;
  if (numericLevel <= 20) { return 5; }
  tbl = nearestTableLevel(STATS_CAPS, numericLevel);
  if (tbl === numericLevel) { return STATS_CAPS[numericLevel]; }
  return STATS_CAPS[tbl] + (numericLevel - tbl) * 2;
}

export function maxHpForPokemon(pokemon) {
  var originLevel = shinyOriginLevelForPokemon(pokemon);
  return maxHpForLevel(pokemon && pokemon.level) + (originLevel ? shinyHpBonusForLevel(originLevel) : 0);
}

export function maxPowerForPokemon(pokemon) {
  var originLevel = shinyOriginLevelForPokemon(pokemon);
  return maxPowerForLevel(pokemon && pokemon.level) + (originLevel ? shinyPowerBonusForLevel(originLevel) : 0);
}

export function maxStatsForPokemon(pokemon) {
  var originLevel = shinyOriginLevelForPokemon(pokemon);
  return maxStatsForLevel(pokemon && pokemon.level) + (originLevel ? shinyStatsBonusForLevel(originLevel) : 0);
}

export function clampToLimits(pokemon) {
  if (!pokemon) { return; }
  pokemon.maxHp = Math.min(pokemon.maxHp, maxHpForPokemon(pokemon));
  if (pokemon.moves && Array.isArray(pokemon.moves)) {
    var powerCap = maxPowerForPokemon(pokemon);
    var statsCap = maxStatsForPokemon(pokemon);
    pokemon.moves.forEach(function (move) {
      if (move) {
        if (typeof move.power === "number") { move.power = Math.min(move.power, powerCap); }
        if (typeof move.stats === "number") { move.stats = Math.min(move.stats, statsCap); }
      }
    });
  }
}
