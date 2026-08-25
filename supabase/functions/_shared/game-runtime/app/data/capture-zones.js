export var CAPTURE_ZONES = {
  viridian_forest: ["grass", "poison", "bug"],
  mt_moon: ["normal", "steel", "fairy"],
  sea: ["water", "ice"],
  ghost_tower: ["psychic", "ghost", "dark"],
  safari_zone: ["dragon", "fighting", "flying"],
  swamp: ["electric", "fire"],
  desert: ["ground", "rock"]
};

export var RARITY_WEIGHTS = {
  test: 999999999,
  common: 1000,
  uncommon: 600,
  rare: 200,
  super_rare: 30,
  mythic: 5,
  fossil: 0,
  legendary: 0
};

export var CATCH_RARITY_MULTIPLIERS = {
  test: 100,
  common: 100,
  uncommon: 75,
  rare: 35,
  super_rare: 20,
  mythic: 10,
  fossil: 25,
  legendary: 3
};

export var CATCH_HP_THRESHOLDS = [
  { maxHpFraction: 0.05, multiplier: 0.967 },
  { maxHpFraction: 0.30, multiplier: 0.800 },
  { maxHpFraction: 0.70, multiplier: 0.533 },
  { maxHpFraction: 1.00, multiplier: 0.333 }
];

export var CATCH_STATUS_MULTIPLIERS = {
  slp: 2,
  par_block: 2,
  par_free: 2,
  frz: 2
};

export var CATCH_FORMULA = {
  denominator: 255,
  exponent: 0.75,
  maximumRate: 95
};
