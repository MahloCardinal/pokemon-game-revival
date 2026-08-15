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
  test: 1.5,
  common: 1.2,
  uncommon: 1.0,
  rare: 0.7,
  super_rare: 0.4,
  mythic: 0.15,
  fossil: 0.5,
  legendary: 0.1
};

export var CATCH_HP_THRESHOLDS = [
  { maxHpFraction: 0.05, multiplier: 1.30 },
  { maxHpFraction: 0.30, multiplier: 1.15 },
  { maxHpFraction: 0.70, multiplier: 1.05 },
  { maxHpFraction: 1.00, multiplier: 1.00 }
];
