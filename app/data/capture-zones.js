export var CAPTURE_ZONES = {
  "Bosco Smeraldo": ["Erba", "Veleno", "Coleottero"],
  "Monte Luna": ["Normale", "Acciaio", "Folletto"],
  Mare: ["Acqua", "Ghiaccio"],
  "Torre Fantasma": ["Psico", "Spettro", "Buio"],
  Safari: ["Drago", "Lotta", "Volante"],
  Palude: ["Elettro", "Fuoco"],
  Deserto: ["Terra", "Roccia"]
};

export var RARITY_WEIGHTS = {
  t: 999999999, // test
  c: 1000,   // common
  u: 600,    // uncommon
  r: 200,    // rare
  s: 30,     // super rare
  m: 5,      // mythic
  f: 0,      // fossil
  l: 0       // legendary
};

export var CATCH_RARITY_MULTIPLIERS = {
  t: 1.5,
  c: 1.2,
  u: 1.0,
  r: 0.7,
  s: 0.4,
  m: 0.15,
  f: 0.5,
  l: 0.1
};

export var CATCH_HP_THRESHOLDS = [
  { maxHpFraction: 0.05, multiplier: 1.30 },
  { maxHpFraction: 0.30, multiplier: 1.15 },
  { maxHpFraction: 0.70, multiplier: 1.05 },
  { maxHpFraction: 1.00, multiplier: 1.00 }
];
