import { GDR_DATA } from "./index.js";
import * as Engine from "../engine/index.js";
import { getItemByIndex } from "./items.js";
import { BADGE_LEVEL_LIMITS, GYM_REWARDS, KANTO_LEAGUE_REWARDS } from "./progression.js";

export var KANTO_GYM_CITIES = [
  { key: "pewter_city", image: "plumbeopoli_bottone.webp", badgeIndex: 0 },
  { key: "cerulean_city", image: "celestopoli_bottone.webp", badgeIndex: 1 },
  { key: "vermilion_city", image: "aranciopoli_bottone.webp", badgeIndex: 2 },
  { key: "celadon_city", image: "azzurropoli_bottone.webp", badgeIndex: 3 },
  { key: "saffron_city", image: "zafferanopoli_bottone.webp", badgeIndex: 4 },
  { key: "fuchsia_city", image: "fucsiapoli_bottone.webp", badgeIndex: 5 },
  { key: "cinnabar_island", image: "isola_cannella_bottone.webp", badgeIndex: 6 },
  { key: "viridian_city", image: "smeraldopoli_bottone.webp", badgeIndex: 7 }
];

export var KANTO_GYM_BADGES = [
  { key: "boulder", image: "medaglia_sasso.webp" },
  { key: "cascade", image: "medaglia_cascata.webp" },
  { key: "thunder", image: "medaglia_tuono.webp" },
  { key: "rainbow", image: "medaglia_arcobaleno.webp" },
  { key: "marsh", image: "medaglia_anima.webp" },
  { key: "soul", image: "medaglia_palude.webp" },
  { key: "volcano", image: "medaglia_vulcano.webp" },
  { key: "earth", image: "medaglia_terra.webp" }
];

function gymMove(index, power, stats) {
  return { index: index, power: power, stats: stats };
}

function gymPokemon(speciesKey, level, maxHp, moves, heldItemIndex, options) {
  options = options || {};
  return Object.assign({
    speciesKey: String(speciesKey),
    level: level,
    maxHp: maxHp,
    moves: moves || [],
    heldItemIndex: heldItemIndex || 0
  }, options);
}

function buildGymPokemon(config) {
  var speciesData = GDR_DATA.speciesLibrary[String(config.speciesKey)];
  if (!speciesData) { return null; }
  return new Engine.Pokemon({
    speciesKey: String(config.speciesKey),
    name: config.name || speciesData.name,
    ndex: config.ndex !== undefined ? config.ndex : speciesData.dexNumber,
    level: config.level,
    type: (config.type || speciesData.type).slice(),
    maxHp: config.maxHp,
    gender: config.gender !== undefined ? config.gender : "male",
    isShiny: Boolean(config.isShiny),
    isMega: Boolean(config.isMega),
    expCurrent: Number(config.expCurrent) || 0,
    expCap: config.expCap !== undefined ? Number(config.expCap) : speciesData.exp,
    heldItemIndex: Number(config.heldItemIndex) || 0,
    moves: (config.moves || []).map(function (move) {
      return Engine.createMove(move.index, { power: move.power, stats: move.stats });
    })
  });
}

export var KANTO_GYM_LEADERS = {
  pewter_city: { name: "Brock", sprite: "brock.webp", team: [
    gymPokemon("74", 12, 62, [gymMove(25, 28, 2), gymMove(245, 29, 2), gymMove(98, 30, 2), gymMove(266, 31, 2)]),
    gymPokemon("95", 14, 68, [gymMove(25, 32, 2), gymMove(307, 33, 2), gymMove(266, 35, 2), gymMove(159, 34, 2)])
  ], extraLimits: [] },
  cerulean_city: { name: "Misty", sprite: "misty.webp", team: [
    gymPokemon("116", 20, 86, [gymMove(31, 64, 4), gymMove(190, 66, 4), gymMove(123, 68, 4)]),
    gymPokemon("120", 20, 86, [gymMove(217, 64, 4), gymMove(242, 65, 4), gymMove(255, 66, 4), gymMove(47, 67, 4)]),
    gymPokemon("121", 22, 92, [gymMove(217, 68, 7), gymMove(255, 69, 7), gymMove(61, 71, 7), gymMove(242, 70, 7)])
  ], extraLimits: [] },
  vermilion_city: { name: "Lt. Surge", sprite: "lt_surge.webp", team: [
    gymPokemon("25", 28, 110, [gymMove(21, 80, 19), gymMove(85, 81, 19), gymMove(270, 82, 19), gymMove(122, 83, 19)]),
    gymPokemon("100", 31, 119, [gymMove(307, 106, 26), gymMove(289, 107, 26), gymMove(272, 108, 26), gymMove(23, 109, 26)]),
    gymPokemon("26", 34, 128, [gymMove(328, 114, 29), gymMove(57, 113, 29), gymMove(21, 112, 29), gymMove(122, 115, 29)])
  ], extraLimits: [] },
  celadon_city: { name: "Erika", sprite: "erika.webp", team: [
    gymPokemon("71", 39, 143, [gymMove(120, 122, 34), gymMove(290, 123, 34), gymMove(222, 124, 34), gymMove(113, 125, 34)]),
    gymPokemon("114", 40, 161, [gymMove(159, 144, 34), gymMove(178, 147, 34), gymMove(207, 146, 34), gymMove(270, 145, 34)]),
    gymPokemon("45", 43, 170, [gymMove(319, 150, 38), gymMove(15, 151, 38), gymMove(207, 152, 38), gymMove(178, 153, 38)])
  ], extraLimits: [] },
  saffron_city: { name: "Sabrina", sprite: "sabrina.webp", team: [
    gymPokemon("64", 48, 185, [gymMove(255, 160, 54), gymMove(79, 161, 56), gymMove(226, 162, 58), gymMove(228, 163, 60)]),
    gymPokemon("122", 50, 226, [gymMove(239, 174, 58), gymMove(226, 177, 60), gymMove(228, 174, 62), gymMove(264, 177, 64)]),
    gymPokemon("49", 50, 226, [gymMove(207, 174, 58), gymMove(236, 175, 60), gymMove(228, 177, 62), gymMove(290, 177, 64)]),
    gymPokemon("65", 53, 235, [gymMove(79, 180, 64), gymMove(46, 181, 66), gymMove(226, 182, 68), gymMove(150, 183, 70)])
  ], extraLimits: [] },
  fuchsia_city: { name: "Koga", sprite: "koga.webp", team: [
    gymPokemon("109", 55, 241, [gymMove(100, 184, 68), gymMove(91, 185, 70), gymMove(128, 186, 72), gymMove(180, 187, 74)]),
    gymPokemon("49", 58, 250, [gymMove(228, 191, 76), gymMove(290, 192, 78), gymMove(236, 190, 74), gymMove(226, 193, 80)]),
    gymPokemon("24", 70, 306, [gymMove(148, 254, 98), gymMove(280, 255, 100), gymMove(3, 256, 102), gymMove(214, 257, 104)]),
    gymPokemon("89", 62, 282, [gymMove(133, 238, 82), gymMove(275, 239, 84), gymMove(100, 240, 86), gymMove(77, 240, 88)]),
    gymPokemon("110", 62, 282, [gymMove(100, 238, 82), gymMove(91, 239, 84), gymMove(76, 240, 86), gymMove(319, 241, 88)])
  ], extraLimits: [] },
  "cinnabar_island": { name: "Blaine", sprite: "blaine.webp", team: [
    gymPokemon("58", 70, 306, [gymMove(157, 254, 98), gymMove(13, 255, 100), gymMove(11, 256, 102), gymMove(154, 257, 104)]),
    gymPokemon("38", 72, 312, [gymMove(53, 258, 102), gymMove(154, 259, 104), gymMove(264, 260, 106), gymMove(330, 261, 108)], 204),
    gymPokemon("6", 76, 324, [gymMove(124, 269, 110), gymMove(87, 267, 112), gymMove(214, 267, 114), gymMove(330, 266, 116)], 220),
    gymPokemon("59", 76, 324, [gymMove(134, 266, 110), gymMove(128, 267, 112), gymMove(116, 268, 114), gymMove(92, 265, 116)], 308),
    gymPokemon("78", 80, 336, [gymMove(11, 274, 118), gymMove(127, 274, 120), gymMove(154, 275, 122), gymMove(124, 277, 124)], 238),
    gymPokemon("126", 80, 336, [gymMove(134, 274, 118), gymMove(157, 277, 120), gymMove(327, 275, 122), gymMove(77, 277, 124)])
  ], extraLimits: [] },
  viridian_city: { name: "Giovanni", sprite: "giovanni.webp", team: [
    gymPokemon("111", 88, 360, [gymMove(128, 290, 134), gymMove(247, 289, 136), gymMove(127, 292, 138), gymMove(154, 292, 140)]),
    gymPokemon("51", 90, 366, [gymMove(148, 296, 138), gymMove(154, 296, 140), gymMove(100, 294, 142), gymMove(2, 297, 144)], 220),
    gymPokemon("112", 90, 366, [gymMove(211, 294, 138), gymMove(128, 295, 140), gymMove(77, 296, 142), gymMove(188, 297, 144)], 308),
    gymPokemon("34", 90, 366, [gymMove(84, 296, 138), gymMove(338, 294, 140), gymMove(327, 295, 142), gymMove(77, 297, 144)], 214),
    gymPokemon("115", 90, 366, [gymMove(151, 297, 138), gymMove(77, 295, 140), gymMove(128, 293, 142), gymMove(264, 297, 144)], 308),
    gymPokemon("31", 92, 372, [gymMove(111, 298, 142), gymMove(77, 302, 144), gymMove(67, 300, 146), gymMove(154, 299, 148)], 229)
  ], extraLimits: [] }
};

export function kantoGymCityByKey(cityKey) {
  return KANTO_GYM_CITIES.find(function (city) { return city.key === cityKey; }) || KANTO_GYM_CITIES[0];
}

export function adventurePhaseForGym(cityKey) {
  var city = kantoGymCityByKey(cityKey);
  return city ? city.badgeIndex + 1 : null;
}

export function isGymOrLeagueBattleType(battleType) {
  var type = String(battleType || "");
  return /^gym_/.test(type) || /^kanto_league_/.test(type);
}

export function kantoGymChallengeStatus(cityKey, badges) {
  var city = kantoGymCityByKey(cityKey);
  var badgeCount = Math.max(0, Math.floor(Number(badges) || 0));
  if (badgeCount > city.badgeIndex) {
    return { state: "completed" };
  }
  if (badgeCount < city.badgeIndex) {
    return {
      state: "locked",
      reason: "previous_badge",
      requiredBadgeKey: KANTO_GYM_BADGES[city.badgeIndex - 1].key
    };
  }
  return { state: "available" };
}

function kantoGymSuperEffectiveChallengeLimit(badgeIndex) {
  if (badgeIndex === 5 || badgeIndex === 6) {
    return { key: "super_effective_max", count: 3 };
  }
  if (badgeIndex === 7) {
    return { key: "super_effective_max", count: 2 };
  }
  return "";
}

export function kantoGymLeaderByCity(cityKey) {
  var city = kantoGymCityByKey(cityKey);
  var maxLevel = BADGE_LEVEL_LIMITS[city.badgeIndex] || BADGE_LEVEL_LIMITS[0];
  var leader = KANTO_GYM_LEADERS[cityKey];
  if (!leader) { return null; }
  var team = leader.team.map(buildGymPokemon).filter(Boolean);
  var rewardConfig = GYM_REWARDS[city.badgeIndex];
  var rewardTM = rewardConfig.tm ? getItemByIndex(rewardConfig.tm) : null;
  var rewardItem = rewardConfig.item ? getItemByIndex(rewardConfig.item) : null;
  var rewardItemQuantity = Math.max(1, Number(rewardConfig.itemQuantity) || 1);
  return {
    key: city.key,
    name: leader.name,
    sprite: leader.sprite,
    rewards: [
      { kind: "money", quantity: rewardConfig.money },
      rewardTM ? { kind: "item", itemIndex: rewardTM.index } : null,
      rewardItem ? { kind: "item", itemIndex: rewardItem.index, quantity: rewardItemQuantity } : null,
      { kind: "badge", badgeKey: KANTO_GYM_BADGES[city.badgeIndex].key, image: KANTO_GYM_BADGES[city.badgeIndex].image }
    ].filter(Boolean),
    challengeLimits: [
      { key: "max_level", level: maxLevel },
      kantoGymSuperEffectiveChallengeLimit(city.badgeIndex)
    ].filter(Boolean),
    extraLimits: leader.extraLimits || [],
    team: team
  };
}

function buildNamedPokemon(speciesKey, level, maxHp, moveIndices, heldItemIndex) {
  var speciesData = GDR_DATA.speciesLibrary[String(speciesKey)];
  if (!speciesData) { return null; }
  return new Engine.Pokemon({
    speciesKey: String(speciesKey),
    name: speciesData.name,
    ndex: speciesData.dexNumber,
    level: level,
    type: speciesData.type.slice(),
    maxHp: maxHp,
    gender: "male",
    isShiny: false,
    isMega: false,
    expCurrent: 0,
    expCap: speciesData.exp,
    heldItemIndex: Number(heldItemIndex) || 0,
    moves: (moveIndices || []).map(function (moveIndex) {
      return Engine.createMove(moveIndex, { power: 350, stats: 200 });
    })
  });
}

var PLACEHOLDER_REWARDS = [
  { kind: "money", quantity: KANTO_LEAGUE_REWARDS.member.money }
];

var CHAMPION_REWARDS = [
  { kind: "money", quantity: KANTO_LEAGUE_REWARDS.champion.money }
];

export var KANTO_ELITE_FOUR = [
  {
    key: "lorelei",
    name: "Lorelei",
    sprite: "lorelei.webp",
    team: [
      buildNamedPokemon(124, 100, 420, [77, 51, 226, 182], 220),
      buildNamedPokemon(87, 100, 420, [128, 234, 150, 137]),
      buildNamedPokemon(131, 100, 420, [234, 33, 264, 50], 233),
      buildNamedPokemon(195, 100, 420, [53, 77, 188, 37]),
      buildNamedPokemon(221, 100, 420, [131, 116, 137, 269], 308),
      buildNamedPokemon(279, 100, 420, [148, 33, 94, 95], 229)
    ],
    rewards: PLACEHOLDER_REWARDS,
    challengeLimits: [],
    extraLimits: []
  },
  {
    key: "bruno",
    name: "Bruno",
    sprite: "bruno.webp",
    team: [
      buildNamedPokemon(68, 100, 420, [188, 77, 94, 2], 229),
      buildNamedPokemon(26, 100, 420, [188, 95, 53, 269]),
      buildNamedPokemon(62, 100, 420, [77, 51, 160, 131], 308),
      buildNamedPokemon(107, 100, 420, [148, 340, 138, 258], 231),
      buildNamedPokemon(237, 100, 420, [77, 148, 154, 37], 237),
      buildNamedPokemon(212, 100, 420, [132, 313, 148, 342], 220)
    ],
    rewards: PLACEHOLDER_REWARDS,
    challengeLimits: [],
    extraLimits: []
  },
  {
    key: "agatha",
    name: "Agatha",
    sprite: "agatha.webp",
    team: [
      buildNamedPokemon(356, 100, 420, [188, 77, 168, 205], 220),
      buildNamedPokemon(215, 100, 420, [77, 148, 94, 234], 229),
      buildNamedPokemon(94, 100, 420, [197, 154, 77, 128], 308),
      buildNamedPokemon(302, 100, 420, [188, 77, 150, 51], 238),
      buildNamedPokemon(197, 100, 420, [148, 205, 151, 273], 220),
      buildNamedPokemon(198, 100, 420, [7, 148, 197, 128], 308)
    ],
    rewards: PLACEHOLDER_REWARDS,
    challengeLimits: [],
    extraLimits: []
  },
  {
    key: "lance",
    name: "Lance",
    sprite: "lance.webp",
    team: [
      buildNamedPokemon(149, 100, 420, [150, 95, 53, 211]),
      buildNamedPokemon(230, 100, 420, [150, 95, 85, 234], 237),
      buildNamedPokemon(334, 100, 420, [148, 131, 154, 264], 232),
      buildNamedPokemon(330, 100, 420, [95, 111, 157, 184], 220),
      buildNamedPokemon(373, 100, 420, [283, 37, 154, 151], 207),
      buildNamedPokemon(142, 100, 420, [94, 115, 148, 154], 229)
    ],
    rewards: PLACEHOLDER_REWARDS,
    challengeLimits: [],
    extraLimits: []
  }
];

export var KANTO_CHAMPION = {
  key: "kanto_champion",
  name: "Blue",
  sprite: "blu.webp",
  team: [
    buildNamedPokemon(214, 100, 420, [37, 258, 148, 188], 220),
    buildNamedPokemon(65, 100, 420, [226, 264, 46, 154], 233),
    buildNamedPokemon(248, 100, 420, [124, 51, 94, 148], 229),
    buildNamedPokemon(130, 100, 420, [67, 87, 151, 154], 308),
    buildNamedPokemon(59, 100, 420, [157, 264, 154, 140], 232),
    buildNamedPokemon(103, 100, 420, [95, 133, 115, 248], 237)
  ],
  rewards: CHAMPION_REWARDS,
  challengeLimits: [],
  extraLimits: []
};

export function kantoEliteFourMemberByIndex(index) {
  return KANTO_ELITE_FOUR[index] || null;
}

export function kantoEliteFourMemberByKey(key) {
  return KANTO_ELITE_FOUR.find(function (m) { return m.key === key; }) || null;
}

export function kantoEliteFourChallengeStatus(badges) {
  var badgeCount = Math.max(0, Math.floor(Number(badges) || 0));
  if (badgeCount >= 8) {
    return { state: "available" };
  }
  return { state: "locked", reason: "required_badge", requiredBadgeKey: "earth" };
}

export function kantoChampionChallengeStatus() {
  return { state: "locked", reason: "elite_four_required" };
}
