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
  ultra_rare: 5,
  fossil: 0,
  legendary: 0
};

export var CATCH_RARITY_MULTIPLIERS = {
  test: 100,
  common: 190,
  uncommon: 140,
  rare: 90,
  super_rare: 45,
  ultra_rare: 20,
  fossil: 20,
  legendary: 7
};

export var CATCH_HP_THRESHOLDS = [
  { maxHpFraction: 0.05, multiplier: 0.967 },
  { maxHpFraction: 0.30, multiplier: 0.800 },
  { maxHpFraction: 0.70, multiplier: 0.533 },
  { maxHpFraction: 1.00, multiplier: 0.333 }
];

export var CATCH_STATUS_MULTIPLIERS = {
  slp: 1.5,
  par_block: 1.5,
  par_free: 1.5,
  frz: 1.5
};

export var CATCH_FORMULA = {
  denominator: 255,
  exponent: 0.75,
  maximumRate: 95
};
