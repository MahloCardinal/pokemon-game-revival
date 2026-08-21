import * as i from "./items.js";

export var BADGE_LEVEL_LIMITS = [14, 20, 30, 40, 50, 60, 70, 80, 100];
export var CAPTURE_LEVEL_LIMITS = [10, 15, 20, 25, 30, 40, 50, 60, 60];

export var CAPTURE_LEVEL_RANGES = [
  [{ min: 5, max: 10 }],
  [{ min: 11, max: 15 }],
  [{ min: 16, max: 20 }],
  [{ min: 21, max: 25 }],
  [{ min: 26, max: 30 }],
  [{ min: 31, max: 35 }, { min: 36, max: 40 }],
  [{ min: 41, max: 45 }, { min: 46, max: 50 }],
  [{ min: 51, max: 55 }, { min: 56, max: 60 }],
  []
];

export var SEARCH_TOOL_ITEMS = {
  whiteFlute: i.white_flute,
  blackFlute: i.black_flute
};

export var FLUTE_DAILY_USE_LIMIT = 15;
export var GARDEN_HARVEST_QUANTITY = 3;

export var DAYCARE_WITHDRAW_BASE_COST = 1000;
export var DAYCARE_WITHDRAW_LEVEL_COST = 500;
export var DAYCARE_MAX_PENDING_LEVELS = 100;
export var DAYCARE_LEVEL_INTERVAL_SECONDS = 3600;

export var TRAINING_DIFFICULTIES = [
  { key: "easy", levelDelta: -5, minLevel: 5, maxLevel: 100 },
  { key: "medium", levelDelta: 0, minLevel: 5, maxLevel: 100 },
  { key: "hard", levelDelta: 5, minLevel: 5, maxLevel: 100 }
];

export var TRAINING_DAILY_REWARDS = [
  { easy: { levels: 1, money: 150 }, medium: { levels: 2, money: 250 }, hard: { levels: 3, money: 400 } },
  { easy: { levels: 2, money: 250 }, medium: { levels: 2, money: 400 }, hard: { levels: 3, money: 600 } },
  { easy: { levels: 2, money: 400 }, medium: { levels: 3, money: 600 }, hard: { levels: 4, money: 900 } },
  { easy: { levels: 3, money: 600 }, medium: { levels: 3, money: 900 }, hard: { levels: 4, money: 1300 } },
  { easy: { levels: 3, money: 800 }, medium: { levels: 4, money: 1300 }, hard: { levels: 5, money: 1800 } },
  { easy: { levels: 4, money: 1300 }, medium: { levels: 5, money: 1800 }, hard: { levels: 6, money: 2600 } },
  { easy: { levels: 5, money: 1800 }, medium: { levels: 6, money: 2600 }, hard: { levels: 7, money: 3600 } },
  { easy: { levels: 6, money: 2500 }, medium: { levels: 7, money: 3500 }, hard: { levels: 8, money: 5000 } },
  { easy: { levels: 7, money: 3000 }, medium: { levels: 8, money: 4000 }, hard: { levels: 9, money: 5500 } }
];

export var TRAINING_REPEAT_REWARDS = {
  easy: { levels: 0, money: 50 },
  medium: { levels: 0, money: 100 },
  hard: { levels: 0, money: 150 }
};

export var AUTHORITATIVE_TRAINING_DAILY_REWARDS = {
  easy: { levels: 4, battlePoints: 1 }, medium: { levels: 8, battlePoints: 2 }, hard: { levels: 12, battlePoints: 3 }
};

export var AUTHORITATIVE_TRAINING_REPEAT_REWARDS = {
  easy: { levels: 1, battlePoints: 0 },
  medium: { levels: 2, battlePoints: 0 },
  hard: { levels: 3, battlePoints: 0 }
};

export var MAX_TRAINING_LEVELS_PER_POKEMON = 3;

export var TM_TIER_RULES = {
  0: { price: null, unlockBadges: null },
  1: { price: 8000, unlockBadges: 6 },
  2: { price: 5000, unlockBadges: 4 },
  3: { price: 3000, unlockBadges: 0 }
};

export var GYM_REWARDS = [
  { money: 3000, tm: i.tm21.index, item: i.hp_up.index, itemQuantity: 3 },
  { money: 5000, tm: i.tm54.index, item: i.pure_incense.index, itemQuantity: 1 },
  { money: 7000, tm: i.tm24.index, item: i.pp_up.index, itemQuantity: 3 },
  { money: 10000, tm: i.tm19.index, item: i.black_flute.index, itemQuantity: 1 },
  { money: 20000, tm: i.tm04.index, item: i.odd_incense.index, itemQuantity: 1 },
  { money: 30000, tm: i.tm46.index, item: i.pp_max.index, itemQuantity: 3 },
  { money: 50000, tm: i.tm52.index, item: i.white_flute.index, itemQuantity: 1 },
  { money: 70000, tm: i.tm51.index, item: i.kings_rock.index, itemQuantity: 1 }
];

export var KANTO_LEAGUE_REWARDS = {
  member: { money: 25000 },
  champion: { money: 30000 }
};

export function adminControlledBattleRewardForType(battleType) {
  var type = String(battleType || "");
  if (type === "gym_cinnabar_island") {
    return Object.assign({ rewardKind: "gym", badgeIndex: 6 }, GYM_REWARDS[6]);
  }
  if (type === "gym_viridian_city") {
    return Object.assign({ rewardKind: "gym", badgeIndex: 7 }, GYM_REWARDS[7]);
  }
  if (/^kanto_league_[1-4]$/.test(type)) {
    return { rewardKind: "league", badgeIndex: null, money: KANTO_LEAGUE_REWARDS.member.money, tm: null, item: null };
  }
  if (type === "kanto_league_champion") {
    return { rewardKind: "league", badgeIndex: null, money: KANTO_LEAGUE_REWARDS.champion.money, tm: null, item: null };
  }
  return null;
}

export var ITEM_UNLOCK_RULES = [
  { item: i.poke_ball, requirement: { kind: "badges", value: 0 } },
  { item: i.great_ball, requirement: { kind: "badges", value: 0 } },
  { item: i.ultra_ball, requirement: { kind: "badges", value: 2 } },

  { item: i.potion, requirement: { kind: "badges", value: 0 } },
  { item: i.super_potion, requirement: { kind: "badges", value: 0 } },
  { item: i.antidote, requirement: { kind: "badges", value: 0 } },
  { item: i.paralyze_heal, requirement: { kind: "badges", value: 0 } },
  { item: i.awakening, requirement: { kind: "badges", value: 0 } },
  { item: i.burn_heal, requirement: { kind: "badges", value: 0 } },
  { item: i.ice_heal, requirement: { kind: "badges", value: 0 } },
  { item: i.hyper_potion, requirement: { kind: "badges", value: 4 } },
  { item: i.full_heal, requirement: { kind: "badges", value: 4 } },
  { item: i.clear_sky_elixir, requirement: { kind: "badges", value: 4 } },
  { item: i.revive, requirement: { kind: "badges", value: 2 } },
  { item: i.max_potion, requirement: { kind: "badges", value: 6 } },
  { item: i.full_restore, requirement: { kind: "badges", value: 6 } },
  { item: i.max_revive, requirement: { kind: "badges", value: 6 } },

  { item: i.fire_stone, requirement: { kind: "badges", value: 4 } },
  { item: i.thunder_stone, requirement: { kind: "badges", value: 4 } },
  { item: i.water_stone, requirement: { kind: "badges", value: 4 } },
  { item: i.leaf_stone, requirement: { kind: "badges", value: 4 } },

  { item: i.heal_powder, requirement: { kind: "badges", value: 8 } },
  { item: i.energy_powder, requirement: { kind: "badges", value: 8 } },
  { item: i.energy_root, requirement: { kind: "badges", value: 8 } },
  { item: i.revival_herb, requirement: { kind: "badges", value: 8 } },

  { item: i.hp_up, requirement: { kind: "badges", value: 4 } },
  { item: i.pp_up, requirement: { kind: "badges", value: 4 } },
  { item: i.pp_max, requirement: { kind: "badges", value: 6 } },

  { item: i.kings_rock, requirement: { kind: "badges", value: 7 } },
  { item: i.focus_band, requirement: { kind: "badges", value: 7 } },
  { item: i.bright_powder, requirement: { kind: "badges", value: 7 } },
  { item: i.focus_sash, requirement: { kind: "badges", value: 7 } },

  { item: i.go_goggles, requirement: { kind: "badges", value: 0 } },
  { item: i.silph_scope, requirement: { kind: "badges", value: 0 } },
  { item: i.shell_bell, requirement: { kind: "badges", value: 0 } },
  { item: i.heavy_duty_boots, requirement: { kind: "badges", value: 0 } },
  { item: i.protector, requirement: { kind: "badges", value: 6 } },
  { item: i.metronome, requirement: { kind: "badges", value: 6 } },
  { item: i.life_orb, requirement: { kind: "badges", value: 6 } },
  { item: i.blunder_policy, requirement: { kind: "badges", value: 6 } },
  { item: i.rocky_helmet, requirement: { kind: "badges", value: 6 } },
  { item: i.zoom_lens, requirement: { kind: "badges", value: 6 } },
];

export function normalizedBadges(badges) {
  var badgeCount = Math.floor(Number(badges) || 0);
  return Math.max(0, Math.min(8, badgeCount));
}

export function levelLimitForBadges(badges) {
  return BADGE_LEVEL_LIMITS[normalizedBadges(badges)] || BADGE_LEVEL_LIMITS[0];
}

export function captureLevelLimitForBadges(badges) {
  return CAPTURE_LEVEL_LIMITS[normalizedBadges(badges)] || CAPTURE_LEVEL_LIMITS[0];
}

export function captureLevelRangesForBadges(badges, includePrevious) {
  var badgeCount = normalizedBadges(badges);
  var ranges = includePrevious
    ? CAPTURE_LEVEL_RANGES.slice(0, badgeCount + 1).reduce(function (all, row) { return all.concat(row); }, [])
    : (CAPTURE_LEVEL_RANGES[badgeCount] || CAPTURE_LEVEL_RANGES[0]).slice();
  var maxLevel = captureLevelLimitForBadges(badges);
  return ranges.map(function (range) {
    return { min: Math.max(5, range.min), max: Math.min(maxLevel, range.max) };
  }).filter(function (range, index, list) {
    return range.min <= range.max && list.findIndex(function (candidate) {
      return candidate.min === range.min && candidate.max === range.max;
    }) === index;
  });
}

export function captureRangeContainsLevel(range, level) {
  var numericLevel = Math.floor(Number(level) || 0);
  return Boolean(range && numericLevel >= range.min && numericLevel <= range.max);
}

export function captureLevelIsUnlocked(level, badges) {
  return captureLevelRangesForBadges(badges, true).some(function (range) {
    return captureRangeContainsLevel(range, level);
  });
}

export function trainingRewardForBadges(badges, difficulty, fullReward) {
  var key = String(difficulty || "");
  if (!fullReward) {
    return TRAINING_REPEAT_REWARDS[key] || { levels: 0, money: 0 };
  }
  var row = TRAINING_DAILY_REWARDS[normalizedBadges(badges)] || TRAINING_DAILY_REWARDS[0];
  return row[key] || { levels: 0, money: 0 };
}

export function authoritativeTrainingReward(difficulty, fullReward) {
  var key = String(difficulty || "");
  if (!fullReward) {
    return AUTHORITATIVE_TRAINING_REPEAT_REWARDS[key] || { levels: 0, battlePoints: 0 };
  }
  return AUTHORITATIVE_TRAINING_DAILY_REWARDS[key] || { levels: 0, battlePoints: 0 };
}

export function tmTierForItem(item) {
  var tier = Number(item && item.tier);
  return Object.prototype.hasOwnProperty.call(TM_TIER_RULES, tier) ? tier : 3;
}

export function tmPrice(item) {
  var rule = TM_TIER_RULES[tmTierForItem(item)] || TM_TIER_RULES[3];
  return rule.price;
}

export function tmUnlockBadges(item) {
  var rule = TM_TIER_RULES[tmTierForItem(item)] || TM_TIER_RULES[3];
  return rule.unlockBadges;
}

export function tmIsPurchasable(item) {
  return Boolean(item && item.category === i.ItemCategory.TM && tmPrice(item) !== null);
}

export function expMultiplierForWinnerLevel(level) {
  var numericLevel = Math.floor(Number(level) || 0);
  if (numericLevel >= 100) {
    return 0;
  }
  if (numericLevel >= 61) {
    return 2;
  }
  if (numericLevel >= 31) {
    return 3;
  }
  return numericLevel >= 5 ? 5 : 5;
}
