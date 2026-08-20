import * as m from "./moves.js";

function defineItemClassification(key) {
  return Object.freeze({ key: key });
}

export const ItemCategory = Object.freeze({
  Ball: defineItemClassification("ball"),
  Vitamin: defineItemClassification("vitamin"),
  TM: defineItemClassification("tm"),
  Item: defineItemClassification("item"),
  Berry: defineItemClassification("berry"),
  BattleItem: defineItemClassification("battle_item"),
  HeldItem: defineItemClassification("held_item")
});

export const ItemSubcategory = Object.freeze({
  EvolutionStone: defineItemClassification("evolution_stone"),
  Unknown: defineItemClassification("unknown"),
  HealHp: defineItemClassification("heal_hp"),
  HealStatus: defineItemClassification("heal_status"),
  HealFull: defineItemClassification("heal_full"),
  HealKo: defineItemClassification("heal_ko"),
  Weather: defineItemClassification("weather"),
  StatusItem: defineItemClassification("status_item"),
  DamageItem: defineItemClassification("damage_item"),
  StatsItem: defineItemClassification("stats_item"),
  Misc: defineItemClassification("misc"),
  TypeBoost: defineItemClassification("type_boost"),
  TypeProtection: defineItemClassification("type_protection"),
  MoveTutor: defineItemClassification("move_tutor")
});

function defineTM(config) {
  var number = String(config.number).padStart(2, "0");
  return {
    index: config.index,
    name: "MT" + number + " " + config.move.name,
    category: ItemCategory.TM,
    move: config.move,
    tier: config.tier
  };
}

var CATEGORIES_WITHOUT_SUBCATEGORY = [ItemCategory.Ball, ItemCategory.Vitamin, ItemCategory.TM];
var SUBCATEGORIES_BY_CATEGORY = new Map([
  [ItemCategory.Item, [ItemSubcategory.EvolutionStone, ItemSubcategory.Unknown, ItemSubcategory.MoveTutor]],
  [ItemCategory.Berry, [ItemSubcategory.HealHp, ItemSubcategory.HealStatus, ItemSubcategory.TypeProtection]],
  [ItemCategory.BattleItem, [ItemSubcategory.HealHp, ItemSubcategory.HealFull, ItemSubcategory.HealKo, ItemSubcategory.HealStatus, ItemSubcategory.Weather]],
  [ItemCategory.HeldItem, [ItemSubcategory.TypeBoost, ItemSubcategory.DamageItem, ItemSubcategory.StatusItem, ItemSubcategory.StatsItem, ItemSubcategory.Misc]]
]);

function normalizeItemClassification(item) {
  var category = item && item.category ? item.category : ItemCategory.Item;
  var subcategory = item && item.subcategory !== undefined && item.subcategory !== null
    ? item.subcategory
    : null;
  var allowedSubcategories;

  if (CATEGORIES_WITHOUT_SUBCATEGORY.indexOf(category) !== -1) {
    return subcategory
      ? { category: ItemCategory.Item, subcategory: ItemSubcategory.Unknown }
      : { category: category };
  }

  allowedSubcategories = SUBCATEGORIES_BY_CATEGORY.get(category);
  if (allowedSubcategories && allowedSubcategories.indexOf(subcategory) !== -1) {
    return { category: category, subcategory: subcategory };
  }

  return { category: ItemCategory.Item, subcategory: ItemSubcategory.Unknown };
}

export function normalizeItemDefinition(item) {
  var normalized = Object.assign({}, item);
  var classification = normalizeItemClassification(item);
  normalized.category = classification.category;
  if (classification.subcategory) {
    normalized.subcategory = classification.subcategory;
  } else {
    delete normalized.subcategory;
  }
  return normalized;
}

export const poke_ball = normalizeItemDefinition({
    index: 100,
    name: "Poké Ball",
    image: "poke_ball.webp",
    category: ItemCategory.Ball,
    value: 50
  });

export const great_ball = normalizeItemDefinition({
    index: 101,
    name: "Great Ball",
    image: "mega_ball.webp",
    category: ItemCategory.Ball,
    value: 75
  });

export const ultra_ball = normalizeItemDefinition({
    index: 102,
    name: "Ultra Ball",
    image: "ultra_ball.webp",
    category: ItemCategory.Ball,
    value: 90
  });

export const potion = normalizeItemDefinition({
    index: 103,
    name: "Potion",
    image: "pozione.webp",
    category: ItemCategory.BattleItem,
    subcategory: ItemSubcategory.HealHp,
    value: 20
  });

export const super_potion = normalizeItemDefinition({
    index: 104,
    name: "Super Potion",
    image: "superpozione.webp",
    category: ItemCategory.BattleItem,
    subcategory: ItemSubcategory.HealHp,
    value: 50
  });

export const hyper_potion = normalizeItemDefinition({
    index: 105,
    name: "Hyper Potion",
    image: "iperpozione.webp",
    category: ItemCategory.BattleItem,
    subcategory: ItemSubcategory.HealHp,
    value: 200
  });

export const max_potion = normalizeItemDefinition({
    index: 106,
    name: "Max Potion",
    image: "pozione_max.webp",
    category: ItemCategory.BattleItem,
    subcategory: ItemSubcategory.HealHp,
    value: "max"
  });

export const full_restore = normalizeItemDefinition({
    index: 107,
    name: "Full Restore",
    image: "ricarica_totale.webp",
    category: ItemCategory.BattleItem,
    subcategory: ItemSubcategory.HealFull,
    value: "max"
  });

export const antidote = normalizeItemDefinition({
    index: 108,
    name: "Antidote",
    image: "antidoto.webp",
    category: ItemCategory.BattleItem,
    subcategory: ItemSubcategory.HealStatus,
    statuses: ["psn"]
  });

export const paralyze_heal = normalizeItemDefinition({
    index: 109,
    name: "Paralyze Heal",
    image: "antiparalisi.webp",
    category: ItemCategory.BattleItem,
    subcategory: ItemSubcategory.HealStatus,
    statuses: ["par_block", "par_free"]
  });

export const awakening = normalizeItemDefinition({
    index: 110,
    name: "Awakening",
    image: "sveglia.webp",
    category: ItemCategory.BattleItem,
    subcategory: ItemSubcategory.HealStatus,
    statuses: ["slp"]
  });

export const burn_heal = normalizeItemDefinition({
    index: 111,
    name: "Burn Heal",
    image: "antiscottatura.webp",
    category: ItemCategory.BattleItem,
    subcategory: ItemSubcategory.HealStatus,
    statuses: ["brn"]
  });

export const ice_heal = normalizeItemDefinition({
    index: 112,
    name: "Ice Heal",
    image: "antigelo.webp",
    category: ItemCategory.BattleItem,
    subcategory: ItemSubcategory.HealStatus,
    statuses: ["frz"]
  });

export const full_heal = normalizeItemDefinition({
    index: 113,
    name: "Full Heal",
    image: "cura_totale.webp",
    category: ItemCategory.BattleItem,
    subcategory: ItemSubcategory.HealStatus,
    statuses: ["all"]
  });

export const fresh_water = normalizeItemDefinition({
    index: 114,
    name: "Fresh Water",
    image: "acqua_fresca.webp",
    category: ItemCategory.BattleItem,
    subcategory: ItemSubcategory.HealHp,
    value: 50
  });

export const soda_pop = normalizeItemDefinition({
    index: 115,
    name: "Soda Pop",
    image: "gassosa.webp",
    category: ItemCategory.BattleItem,
    subcategory: ItemSubcategory.HealHp,
    value: 60
  });

export const lemonade = normalizeItemDefinition({
    index: 116,
    name: "Lemonade",
    image: "lemonsucco.webp",
    category: ItemCategory.BattleItem,
    subcategory: ItemSubcategory.HealHp,
    value: 80
  });

export const moomoo_milk = normalizeItemDefinition({
    index: 117,
    name: "Moomoo Milk",
    image: "latte_mumu.webp",
    category: ItemCategory.BattleItem,
    subcategory: ItemSubcategory.HealHp,
    value: 100
  });

export const clear_sky_elixir = normalizeItemDefinition({
    index: 118,
    name: "Clear Sky Elixir",
    image: "elisir_chiarocielo.webp",
    category: ItemCategory.BattleItem,
    subcategory: ItemSubcategory.Weather
  });

export const revive = normalizeItemDefinition({
    index: 119,
    name: "Revive",
    image: "revitalizzante.webp",
    category: ItemCategory.BattleItem,
    subcategory: ItemSubcategory.HealKo,
    healFraction: 0.5
  });

export const max_revive = normalizeItemDefinition({
    index: 120,
    name: "Max Revive",
    image: "revitalizzante_max.webp",
    category: ItemCategory.BattleItem,
    subcategory: ItemSubcategory.HealKo,
    value: "max"
  });

export const heal_powder = normalizeItemDefinition({
    index: 121,
    name: "Heal Powder",
    image: "polvocura.webp",
    category: ItemCategory.BattleItem,
    subcategory: ItemSubcategory.HealStatus,
    statuses: ["all"]
  });

export const energy_powder = normalizeItemDefinition({
    index: 122,
    name: "Energy Powder",
    image: "polvenergia.webp",
    category: ItemCategory.BattleItem,
    subcategory: ItemSubcategory.HealHp,
    value: 50
  });

export const energy_root = normalizeItemDefinition({
    index: 123,
    name: "Energy Root",
    image: "radicenergia.webp",
    category: ItemCategory.BattleItem,
    subcategory: ItemSubcategory.HealHp,
    value: 200
  });

export const revival_herb = normalizeItemDefinition({
    index: 124,
    name: "Revival Herb",
    image: "vitalerba.webp",
    category: ItemCategory.BattleItem,
    subcategory: ItemSubcategory.HealKo,
    healFraction: 0.5
  });

export const mystic_water = normalizeItemDefinition({
    index: 200,
    name: "Mystic Water",
    image: "acqua_magica.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.TypeBoost,
    boostType: "water",
    value: 1.25
  });

export const silver_powder = normalizeItemDefinition({
    index: 201,
    name: "Silver Powder",
    image: "argenpolvere.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.TypeBoost,
    boostType: "bug",
    value: 1.25
  });

export const sharp_beak = normalizeItemDefinition({
    index: 202,
    name: "Sharp Beak",
    image: "beccaffilato.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.TypeBoost,
    boostType: "flying",
    value: 1.25
  });

export const magnet = normalizeItemDefinition({
    index: 203,
    name: "Magnet",
    image: "calamita.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.TypeBoost,
    boostType: "electric",
    value: 1.25
  });

export const charcoal = normalizeItemDefinition({
    index: 204,
    name: "Charcoal",
    image: "carbonella.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.TypeBoost,
    boostType: "fire",
    value: 1.25
  });

export const black_belt = normalizeItemDefinition({
    index: 205,
    name: "Black Belt",
    image: "cintura_nera.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.TypeBoost,
    boostType: "fighting",
    value: 1.25
  });

export const twisted_spoon = normalizeItemDefinition({
    index: 206,
    name: "Twisted Spoon",
    image: "cucchiaio_torto.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.TypeBoost,
    boostType: "psychic",
    value: 1.25
  });

export const dragon_fang = normalizeItemDefinition({
    index: 207,
    name: "Dragon Fang",
    image: "dente_di_drago.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.TypeBoost,
    boostType: "dragon",
    value: 1.25
  });

export const never_melt_ice = normalizeItemDefinition({
    index: 208,
    name: "Never-Melt Ice",
    image: "gelomai.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.TypeBoost,
    boostType: "ice",
    value: 1.25
  });

export const metal_coat = normalizeItemDefinition({
    index: 209,
    name: "Metal Coat",
    image: "metalcopertura.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.TypeBoost,
    boostType: "steel",
    value: 1.25
  });

export const miracle_seed = normalizeItemDefinition({
    index: 210,
    name: "Miracle Seed",
    image: "miracolseme.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.TypeBoost,
    boostType: "grass",
    value: 1.25
  });

export const black_glasses = normalizeItemDefinition({
    index: 211,
    name: "Black Glasses",
    image: "occhialineri.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.TypeBoost,
    boostType: "dark",
    value: 1.25
  });

export const hard_stone = normalizeItemDefinition({
    index: 212,
    name: "Hard Stone",
    image: "pietradura.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.TypeBoost,
    boostType: "rock",
    value: 1.25
  });

export const fairy_feather = normalizeItemDefinition({
    index: 213,
    name: "Fairy Feather",
    image: "piuma_fatata.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.TypeBoost,
    boostType: "fairy",
    value: 1.25
  });

export const soft_sand = normalizeItemDefinition({
    index: 214,
    name: "Soft Sand",
    image: "sabbia_soffice.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.TypeBoost,
    boostType: "ground",
    value: 1.25
  });

export const silk_scarf = normalizeItemDefinition({
    index: 215,
    name: "Silk Scarf",
    image: "sciarpa_seta.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.TypeBoost,
    boostType: "normal",
    value: 1.25
  });

export const spell_tag = normalizeItemDefinition({
    index: 216,
    name: "Spell Tag",
    image: "spettrotarga.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.TypeBoost,
    boostType: "ghost",
    value: 1.25
  });

export const poison_barb = normalizeItemDefinition({
    index: 217,
    name: "Poison Barb",
    image: "velenaculeo.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.TypeBoost,
    boostType: "poison",
    value: 1.25
  });

export const protector = normalizeItemDefinition({
    index: 218,
    name: "Protector",
    image: "copertura.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.DamageItem,
    effect: "status_damage_halve"
  });

export const heavy_duty_boots = normalizeItemDefinition({
    index: 219,
    name: "Heavy-Duty Boots",
    image: "scarponi_robusti.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.Misc,
    effect: "hazard_multiturn_guard"
  });

export const lax_incense = normalizeItemDefinition({
    index: 220,
    name: "Lax Incense",
    image: "distraroma.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.StatusItem,
    effect: "status_delay"
  });

export const luck_incense = normalizeItemDefinition({
    index: 221,
    name: "Luck Incense",
    image: "fortunaroma.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.StatusItem,
    effect: "status_ignore_delay"
  });

export const pure_incense = normalizeItemDefinition({
    index: 222,
    name: "Pure Incense",
    image: "puroaroma.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.StatsItem,
    effect: "ignore_stat_mods"
  });

export const odd_incense = normalizeItemDefinition({
    index: 223,
    name: "Odd Incense",
    image: "bizzoaroma.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.Misc,
    effect: "entry_disable_move",
    requiredType: "psychic"
  });

export const full_incense = normalizeItemDefinition({
    index: 224,
    name: "Full Incense",
    image: "gonfioaroma.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.Misc,
    effect: "entry_add_type",
    requiredMonoType: "normal",
    excludedChoiceTypes: ["normal"]
  });

export const light_ball = normalizeItemDefinition({
    index: 225,
    name: "Light Ball",
    image: "elettropalla.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.DamageItem,
    effect: "species_damage_boost",
    value: 4 / 3,
    allowedSpeciesKeys: ["25"]
  });

export const leek = normalizeItemDefinition({
    index: 226,
    name: "Leek",
    image: "gambo.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.DamageItem,
    effect: "species_damage_boost",
    value: 4 / 3,
    allowedSpeciesKeys: ["83"]
  });

export const lucky_punch = normalizeItemDefinition({
    index: 227,
    name: "Lucky Punch",
    image: "fortunpugno.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.DamageItem,
    effect: "species_damage_boost",
    value: 4 / 3,
    allowedSpeciesKeys: ["113"]
  });

export const thick_club = normalizeItemDefinition({
    index: 228,
    name: "Thick Club",
    image: "ossospesso.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.DamageItem,
    effect: "species_damage_boost",
    value: 4 / 3,
    allowedSpeciesKeys: ["104", "105"]
  });

export const kings_rock = normalizeItemDefinition({
    index: 229,
    name: "King's Rock",
    image: "roccia_di_re.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.StatusItem,
    effect: "invert_par_cnf"
  });

export const metronome = normalizeItemDefinition({
    index: 230,
    name: "Metronome",
    image: "plessimetro.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.DamageItem,
    effect: "consecutive_move_boost",
    value: 1.5
  });

export const life_orb = normalizeItemDefinition({
    index: 231,
    name: "Life Orb",
    image: "assorbisfera.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.DamageItem,
    effect: "hp_cost_base_boost"
  });

export const shell_bell = normalizeItemDefinition({
    index: 232,
    name: "Shell Bell",
    image: "conchinella.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.DamageItem,
    effect: "damage_drain",
    value: 0.25
  });

export const blunder_policy = normalizeItemDefinition({
    index: 233,
    name: "Blunder Policy",
    image: "fiascopolizza.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.StatsItem,
    effect: "percentage_move_atk_buff"
  });

export const focus_band = normalizeItemDefinition({
    index: 234,
    name: "Focus Band",
    image: "bandana.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.Misc,
    effect: "ohko_protect"
  });

export const rocky_helmet = normalizeItemDefinition({
    index: 235,
    name: "Rocky Helmet",
    image: "bitorzolelmo.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.DamageItem,
    effect: "status_retaliate_damage"
  });

export const zoom_lens = normalizeItemDefinition({
    index: 236,
    name: "Zoom Lens",
    image: "zoomlente.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.DamageItem,
    effect: "type_disadvantage_boost",
    value: 1.5
  });

export const bright_powder = normalizeItemDefinition({
    index: 237,
    name: "Bright Powder",
    image: "luminpolvere.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.StatusItem,
    effect: "entry_status_immunity"
  });

export const focus_sash = normalizeItemDefinition({
    index: 238,
    name: "Focus Sash",
    image: "focalnastro.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.StatusItem,
    effect: "status_protect_after_ko"
  });

export const cheri_berry = normalizeItemDefinition({
    index: 300,
    name: "Cheri Berry",
    image: "baccaliegi.webp",
    category: ItemCategory.Berry,
    subcategory: ItemSubcategory.HealStatus,
    statuses: ["par_block", "par_free"]
  });

export const chesto_berry = normalizeItemDefinition({
    index: 301,
    name: "Chesto Berry",
    image: "baccastagna.webp",
    category: ItemCategory.Berry,
    subcategory: ItemSubcategory.HealStatus,
    statuses: ["slp"]
  });

export const pecha_berry = normalizeItemDefinition({
    index: 302,
    name: "Pecha Berry",
    image: "baccapesca.webp",
    category: ItemCategory.Berry,
    subcategory: ItemSubcategory.HealStatus,
    statuses: ["psn"]
  });

export const rawst_berry = normalizeItemDefinition({
    index: 303,
    name: "Rawst Berry",
    image: "baccafrago.webp",
    category: ItemCategory.Berry,
    subcategory: ItemSubcategory.HealStatus,
    statuses: ["brn"]
  });

export const aspear_berry = normalizeItemDefinition({
    index: 304,
    name: "Aspear Berry",
    image: "baccaperina.webp",
    category: ItemCategory.Berry,
    subcategory: ItemSubcategory.HealStatus,
    statuses: ["frz"]
  });

export const oran_berry = normalizeItemDefinition({
    index: 305,
    name: "Oran Berry",
    image: "baccarancia.webp",
    category: ItemCategory.Berry,
    subcategory: ItemSubcategory.HealHp,
    value: 10
  });

export const sitrus_berry = normalizeItemDefinition({
    index: 306,
    name: "Sitrus Berry",
    image: "baccacedro.webp",
    category: ItemCategory.Berry,
    subcategory: ItemSubcategory.HealHp,
    healFraction: 0.25
  });

export const persim_berry = normalizeItemDefinition({
    index: 307,
    name: "Persim Berry",
    image: "baccaki.webp",
    category: ItemCategory.Berry,
    subcategory: ItemSubcategory.HealStatus,
    statuses: ["cnf_block", "cnf_free"]
  });

export const lum_berry = normalizeItemDefinition({
    index: 308,
    name: "Lum Berry",
    image: "baccaprugna.webp",
    category: ItemCategory.Berry,
    subcategory: ItemSubcategory.HealStatus,
    statuses: ["all"]
  });

export const occa_berry = normalizeItemDefinition({
    index: 309,
    name: "Occa Berry",
    image: "baccacao.webp",
    category: ItemCategory.Berry,
    subcategory: ItemSubcategory.TypeProtection,
    protectType: "fire"
  });

export const passho_berry = normalizeItemDefinition({
    index: 310,
    name: "Passho Berry",
    image: "baccapasflo.webp",
    category: ItemCategory.Berry,
    subcategory: ItemSubcategory.TypeProtection,
    protectType: "water"
  });

export const wacan_berry = normalizeItemDefinition({
    index: 311,
    name: "Wacan Berry",
    image: "baccaparmen.webp",
    category: ItemCategory.Berry,
    subcategory: ItemSubcategory.TypeProtection,
    protectType: "electric"
  });

export const rindo_berry = normalizeItemDefinition({
    index: 312,
    name: "Rindo Berry",
    image: "baccarindo.webp",
    category: ItemCategory.Berry,
    subcategory: ItemSubcategory.TypeProtection,
    protectType: "grass"
  });

export const yache_berry = normalizeItemDefinition({
    index: 313,
    name: "Yache Berry",
    image: "baccamoya.webp",
    category: ItemCategory.Berry,
    subcategory: ItemSubcategory.TypeProtection,
    protectType: "ice"
  });

export const chople_berry = normalizeItemDefinition({
    index: 314,
    name: "Chople Berry",
    image: "baccarosmel.webp",
    category: ItemCategory.Berry,
    subcategory: ItemSubcategory.TypeProtection,
    protectType: "fighting"
  });

export const kebia_berry = normalizeItemDefinition({
    index: 315,
    name: "Kebia Berry",
    image: "baccakebia.webp",
    category: ItemCategory.Berry,
    subcategory: ItemSubcategory.TypeProtection,
    protectType: "poison"
  });

export const shuca_berry = normalizeItemDefinition({
    index: 316,
    name: "Shuca Berry",
    image: "baccanaca.webp",
    category: ItemCategory.Berry,
    subcategory: ItemSubcategory.TypeProtection,
    protectType: "ground"
  });

export const coba_berry = normalizeItemDefinition({
    index: 317,
    name: "Coba Berry",
    image: "baccababa.webp",
    category: ItemCategory.Berry,
    subcategory: ItemSubcategory.TypeProtection,
    protectType: "flying"
  });

export const payapa_berry = normalizeItemDefinition({
    index: 318,
    name: "Payapa Berry",
    image: "baccapayapa.webp",
    category: ItemCategory.Berry,
    subcategory: ItemSubcategory.TypeProtection,
    protectType: "psychic"
  });

export const tanga_berry = normalizeItemDefinition({
    index: 319,
    name: "Tanga Berry",
    image: "baccaitan.webp",
    category: ItemCategory.Berry,
    subcategory: ItemSubcategory.TypeProtection,
    protectType: "bug"
  });

export const charti_berry = normalizeItemDefinition({
    index: 320,
    name: "Charti Berry",
    image: "baccaciofo.webp",
    category: ItemCategory.Berry,
    subcategory: ItemSubcategory.TypeProtection,
    protectType: "rock"
  });

export const kasib_berry = normalizeItemDefinition({
    index: 321,
    name: "Kasib Berry",
    image: "baccacitrus.webp",
    category: ItemCategory.Berry,
    subcategory: ItemSubcategory.TypeProtection,
    protectType: "ghost"
  });

export const haban_berry = normalizeItemDefinition({
    index: 322,
    name: "Haban Berry",
    image: "baccahaban.webp",
    category: ItemCategory.Berry,
    subcategory: ItemSubcategory.TypeProtection,
    protectType: "dragon"
  });

export const colbur_berry = normalizeItemDefinition({
    index: 323,
    name: "Colbur Berry",
    image: "baccaxan.webp",
    category: ItemCategory.Berry,
    subcategory: ItemSubcategory.TypeProtection,
    protectType: "dark"
  });

export const babiri_berry = normalizeItemDefinition({
    index: 324,
    name: "Babiri Berry",
    image: "baccababiri.webp",
    category: ItemCategory.Berry,
    subcategory: ItemSubcategory.TypeProtection,
    protectType: "steel"
  });

export const chilan_berry = normalizeItemDefinition({
    index: 325,
    name: "Chilan Berry",
    image: "baccacinlan.webp",
    category: ItemCategory.Berry,
    subcategory: ItemSubcategory.TypeProtection,
    protectType: "normal"
  });

export const tm01 = normalizeItemDefinition(defineTM({index: 401, number: 1, move: m.focus_punch, tier: 1}));
export const tm02 = normalizeItemDefinition(defineTM({index: 402, number: 2, move: m.dragon_claw, tier: 3}));
export const tm03 = normalizeItemDefinition(defineTM({index: 403, number: 3, move: m.water_pulse, tier: 2}));
export const tm04 = normalizeItemDefinition(defineTM({index: 404, number: 4, move: m.calm_mind, tier: 2}));
export const tm05 = normalizeItemDefinition(defineTM({index: 405, number: 5, move: m.roar, tier: 3}));
export const tm06 = normalizeItemDefinition(defineTM({index: 406, number: 6, move: m.toxic, tier: 1}));
export const tm07 = normalizeItemDefinition(defineTM({index: 407, number: 7, move: m.hail, tier: 3}));
export const tm08 = normalizeItemDefinition(defineTM({index: 408, number: 8, move: m.bulk_up, tier: 2}));
export const tm09 = normalizeItemDefinition(defineTM({index: 409, number: 9, move: m.bullet_seed, tier: 3}));
export const tm10 = normalizeItemDefinition(defineTM({index: 410, number: 10, move: m.hidden_power, tier: 1}));
export const tm11 = normalizeItemDefinition(defineTM({index: 411, number: 11, move: m.sunny_day, tier: 3}));
export const tm12 = normalizeItemDefinition(defineTM({index: 412, number: 12, move: m.taunt, tier: 3}));
export const tm13 = normalizeItemDefinition(defineTM({index: 413, number: 13, move: m.ice_beam, tier: 2}));
export const tm14 = normalizeItemDefinition(defineTM({index: 414, number: 14, move: m.blizzard, tier: 3}));
export const tm15 = normalizeItemDefinition(defineTM({index: 415, number: 15, move: m.hyper_beam, tier: 1}));
export const tm16 = normalizeItemDefinition(defineTM({index: 416, number: 16, move: m.light_screen, tier: 1}));
export const tm17 = normalizeItemDefinition(defineTM({index: 417, number: 17, move: m.protect, tier: 2}));
export const tm18 = normalizeItemDefinition(defineTM({index: 418, number: 18, move: m.rain_dance, tier: 3}));
export const tm19 = normalizeItemDefinition(defineTM({index: 419, number: 19, move: m.giga_drain, tier: 2}));
export const tm20 = normalizeItemDefinition(defineTM({index: 420, number: 20, move: m.safeguard, tier: 2}));
export const tm21 = normalizeItemDefinition(defineTM({index: 421, number: 21, move: m.frustration, tier: 3}));
export const tm22 = normalizeItemDefinition(defineTM({index: 422, number: 22, move: m.solar_beam, tier: 3}));
export const tm23 = normalizeItemDefinition(defineTM({index: 423, number: 23, move: m.iron_tail, tier: 2}));
export const tm24 = normalizeItemDefinition(defineTM({index: 424, number: 24, move: m.thunderbolt, tier: 2}));
export const tm25 = normalizeItemDefinition(defineTM({index: 425, number: 25, move: m.thunder, tier: 3}));
export const tm26 = normalizeItemDefinition(defineTM({index: 426, number: 26, move: m.earthquake, tier: 1}));
export const tm27 = normalizeItemDefinition(defineTM({index: 427, number: 27, move: m.return_move, tier: 3}));
export const tm28 = normalizeItemDefinition(defineTM({index: 428, number: 28, move: m.dig, tier: 3}));
export const tm29 = normalizeItemDefinition(defineTM({index: 429, number: 29, move: m.psychic, tier: 2}));
export const tm30 = normalizeItemDefinition(defineTM({index: 430, number: 30, move: m.shadow_ball, tier: 2}));
export const tm31 = normalizeItemDefinition(defineTM({index: 431, number: 31, move: m.brick_break, tier: 1}));
export const tm32 = normalizeItemDefinition(defineTM({index: 432, number: 32, move: m.double_team, tier: 3}));
export const tm33 = normalizeItemDefinition(defineTM({index: 433, number: 33, move: m.reflect, tier: 1}));
export const tm34 = normalizeItemDefinition(defineTM({index: 434, number: 34, move: m.shock_wave, tier: 3}));
export const tm35 = normalizeItemDefinition(defineTM({index: 435, number: 35, move: m.flamethrower, tier: 2}));
export const tm36 = normalizeItemDefinition(defineTM({index: 436, number: 36, move: m.sludge_bomb, tier: 2}));
export const tm37 = normalizeItemDefinition(defineTM({index: 437, number: 37, move: m.sandstorm, tier: 3}));
export const tm38 = normalizeItemDefinition(defineTM({index: 438, number: 38, move: m.fire_blast, tier: 3}));
export const tm39 = normalizeItemDefinition(defineTM({index: 439, number: 39, move: m.rock_tomb, tier: 3}));
export const tm40 = normalizeItemDefinition(defineTM({index: 440, number: 40, move: m.aerial_ace, tier: 2}));
export const tm41 = normalizeItemDefinition(defineTM({index: 441, number: 41, move: m.torment, tier: 1}));
export const tm42 = normalizeItemDefinition(defineTM({index: 442, number: 42, move: m.facade, tier: 1}));
export const tm43 = normalizeItemDefinition(defineTM({index: 443, number: 43, move: m.secret_power, tier: 1}));
export const tm44 = normalizeItemDefinition(defineTM({index: 444, number: 44, move: m.rest, tier: 3}));
export const tm45 = normalizeItemDefinition(defineTM({index: 445, number: 45, move: m.attract, tier: 3}));
export const tm46 = normalizeItemDefinition(defineTM({index: 446, number: 46, move: m.thief, tier: 1}));
export const tm47 = normalizeItemDefinition(defineTM({index: 447, number: 47, move: m.steel_wing, tier: 3}));
export const tm48 = normalizeItemDefinition(defineTM({index: 448, number: 48, move: m.rock_slide, tier: 2}));
export const tm49 = normalizeItemDefinition(defineTM({index: 449, number: 49, move: m.snatch, tier: 2}));
export const tm50 = normalizeItemDefinition(defineTM({index: 450, number: 50, move: m.overheat, tier: 2}));
export const tm51 = normalizeItemDefinition(defineTM({index: 451, number: 51, move: m.zap_cannon, tier: 0}));
export const tm52 = normalizeItemDefinition(defineTM({index: 452, number: 52, move: m.dynamic_punch, tier: 0}));

export const hp_up = normalizeItemDefinition({
    index: 600,
    name: "HP Up",
    image: "ps_su.webp",
    category: ItemCategory.Vitamin,
    effect: "max_hp",
    value: 3
  });

export const pp_up = normalizeItemDefinition({
    index: 601,
    name: "PP Up",
    image: "pp_su.webp",
    category: ItemCategory.Vitamin,
    effect: "move_power",
    value: 2
  });

export const pp_max = normalizeItemDefinition({
    index: 602,
    name: "PP Max",
    image: "pp_max.webp",
    category: ItemCategory.Vitamin,
    effect: "move_power",
    value: 4
  });

export const felix_stone = normalizeItemDefinition({
    index: 603,
    name: "Felix Stone",
    image: "felixpietra.webp",
    category: ItemCategory.Item,
    subcategory: ItemSubcategory.EvolutionStone
  });

export const fire_stone = normalizeItemDefinition({
    index: 604,
    name: "Fire Stone",
    image: "pietrafocaia.webp",
    category: ItemCategory.Item,
    subcategory: ItemSubcategory.EvolutionStone
  });

export const thunder_stone = normalizeItemDefinition({
    index: 605,
    name: "Thunder Stone",
    image: "pietratuono.webp",
    category: ItemCategory.Item,
    subcategory: ItemSubcategory.EvolutionStone
  });

export const water_stone = normalizeItemDefinition({
    index: 606,
    name: "Water Stone",
    image: "pietraidrica.webp",
    category: ItemCategory.Item,
    subcategory: ItemSubcategory.EvolutionStone
  });

export const leaf_stone = normalizeItemDefinition({
    index: 607,
    name: "Leaf Stone",
    image: "pietrafoglia.webp",
    category: ItemCategory.Item,
    subcategory: ItemSubcategory.EvolutionStone
  });

export const moon_stone = normalizeItemDefinition({
    index: 608,
    name: "Moon Stone",
    image: "pietralunare.webp",
    category: ItemCategory.Item,
    subcategory: ItemSubcategory.EvolutionStone
  });

export const sun_stone = normalizeItemDefinition({
    index: 609,
    name: "Sun Stone",
    image: "pietrasolare.webp",
    category: ItemCategory.Item,
    subcategory: ItemSubcategory.EvolutionStone
  });

export const deep_sea_tooth = normalizeItemDefinition({
    index: 610,
    name: "Deep Sea Tooth",
    image: "dente_abissi.webp",
    category: ItemCategory.Item,
    subcategory: ItemSubcategory.EvolutionStone
  });

export const deep_sea_scale = normalizeItemDefinition({
    index: 611,
    name: "Deep Sea Scale",
    image: "squamabissi.webp",
    category: ItemCategory.Item,
    subcategory: ItemSubcategory.EvolutionStone
  });

export const prism_scale = normalizeItemDefinition({
    index: 612,
    name: "Prism Scale",
    image: "squama_bella.webp",
    category: ItemCategory.Item,
    subcategory: ItemSubcategory.EvolutionStone
  });

export const upgrade = normalizeItemDefinition({
    index: 613,
    name: "Upgrade",
    image: "upgrade.webp",
    category: ItemCategory.Item,
    subcategory: ItemSubcategory.EvolutionStone
  });

export const dragon_scale = normalizeItemDefinition({
    index: 614,
    name: "Dragon Scale",
    image: "squama_drago.webp",
    category: ItemCategory.Item,
    subcategory: ItemSubcategory.EvolutionStone
  });

export const linking_cord = normalizeItemDefinition({
    index: 615,
    name: "Linking Cord",
    image: "filo_dell_unione.webp",
    category: ItemCategory.Item,
    subcategory: ItemSubcategory.EvolutionStone
  });

export const go_goggles = normalizeItemDefinition({
    index: 616,
    name: "Go-Goggles",
    image: "occhialoni.webp",
    category: ItemCategory.Item,
    subcategory: ItemSubcategory.Unknown
  });
export const silph_scope = normalizeItemDefinition({
    index: 617,
    name: "Silph Scope",
    image: "spettrosonda.webp",
    category: ItemCategory.Item,
    subcategory: ItemSubcategory.Unknown
  });

export const white_flute = normalizeItemDefinition({
    index: 618,
    name: "White Flute",
    image: "flauto_bianco.webp",
    category: ItemCategory.Item,
    subcategory: ItemSubcategory.Unknown
  });

export const black_flute = normalizeItemDefinition({
    index: 619,
    name: "Black Flute",
    image: "flauto_nero.webp",
    category: ItemCategory.Item,
    subcategory: ItemSubcategory.Unknown
  });

export const master_ball = normalizeItemDefinition({
    index: 620,
    name: "Master Ball",
    image: "master_ball.webp",
    category: ItemCategory.Ball,
    value: 100
  });

export const heart_scale = normalizeItemDefinition({
    index: 621,
    name: "Heart Scale",
    image: "squama_cuore.webp",
    category: ItemCategory.Item,
    subcategory: ItemSubcategory.MoveTutor
  });

export function itemCanTriggerEvolution(item) {
  return Boolean(
    item
      && (
        (item.category === ItemCategory.Item && item.subcategory === ItemSubcategory.EvolutionStone)
        || item.index === metal_coat.index
        || item.index === kings_rock.index
      )
  );
}

export function pokemonCanHoldItem(pokemon, item) {
  var key = pokemon && pokemon.speciesKey !== undefined && pokemon.speciesKey !== null ? String(pokemon.speciesKey) : "";
  var types = pokemon && Array.isArray(pokemon.type) ? pokemon.type : [];
  if (!pokemon || !item || (item.category !== ItemCategory.HeldItem && item.category !== ItemCategory.Berry)) {
    return false;
  }
  if (Array.isArray(item.allowedSpeciesKeys) && item.allowedSpeciesKeys.length && item.allowedSpeciesKeys.indexOf(key) === -1) {
    return false;
  }
  if (item.requiredType && types.indexOf(item.requiredType) === -1) {
    return false;
  }
  if (item.requiredMonoType && !(types.length === 1 && types[0] === item.requiredMonoType)) {
    return false;
  }
  return true;
}

function buildItemLibrary(entries) {
  return Object.freeze(Object.keys(entries).map(function (key) {
    entries[key].key = key;
    entries[key].name = key;
    delete entries[key].description;
    return Object.freeze(entries[key]);
  }));
}

export const ITEM_LIBRARY = buildItemLibrary({
  poke_ball,
  great_ball,
  ultra_ball,
  potion,
  super_potion,
  hyper_potion,
  max_potion,
  full_restore,
  antidote,
  paralyze_heal,
  awakening,
  burn_heal,
  ice_heal,
  full_heal,
  fresh_water,
  soda_pop,
  lemonade,
  moomoo_milk,
  clear_sky_elixir,
  revive,
  max_revive,
  heal_powder,
  energy_powder,
  energy_root,
  revival_herb,
  mystic_water,
  silver_powder,
  sharp_beak,
  magnet,
  charcoal,
  black_belt,
  twisted_spoon,
  dragon_fang,
  never_melt_ice,
  metal_coat,
  miracle_seed,
  black_glasses,
  hard_stone,
  fairy_feather,
  soft_sand,
  silk_scarf,
  spell_tag,
  poison_barb,
  protector,
  heavy_duty_boots,
  lax_incense,
  luck_incense,
  pure_incense,
  odd_incense,
  full_incense,
  light_ball,
  leek,
  lucky_punch,
  thick_club,
  kings_rock,
  metronome,
  life_orb,
  shell_bell,
  blunder_policy,
  focus_band,
  rocky_helmet,
  zoom_lens,
  bright_powder,
  focus_sash,
  cheri_berry,
  chesto_berry,
  pecha_berry,
  rawst_berry,
  aspear_berry,
  oran_berry,
  sitrus_berry,
  persim_berry,
  lum_berry,
  occa_berry,
  passho_berry,
  wacan_berry,
  rindo_berry,
  yache_berry,
  chople_berry,
  kebia_berry,
  shuca_berry,
  coba_berry,
  payapa_berry,
  tanga_berry,
  charti_berry,
  kasib_berry,
  haban_berry,
  colbur_berry,
  babiri_berry,
  chilan_berry,
  tm01,
  tm02,
  tm03,
  tm04,
  tm05,
  tm06,
  tm07,
  tm08,
  tm09,
  tm10,
  tm11,
  tm12,
  tm13,
  tm14,
  tm15,
  tm16,
  tm17,
  tm18,
  tm19,
  tm20,
  tm21,
  tm22,
  tm23,
  tm24,
  tm25,
  tm26,
  tm27,
  tm28,
  tm29,
  tm30,
  tm31,
  tm32,
  tm33,
  tm34,
  tm35,
  tm36,
  tm37,
  tm38,
  tm39,
  tm40,
  tm41,
  tm42,
  tm43,
  tm44,
  tm45,
  tm46,
  tm47,
  tm48,
  tm49,
  tm50,
  tm51,
  tm52,
  hp_up,
  pp_up,
  pp_max,
  felix_stone,
  fire_stone,
  thunder_stone,
  water_stone,
  leaf_stone,
  moon_stone,
  sun_stone,
  deep_sea_tooth,
  deep_sea_scale,
  prism_scale,
  upgrade,
  dragon_scale,
  linking_cord,
  go_goggles,
  silph_scope,
  white_flute,
  black_flute,
  master_ball,
  heart_scale
});

export const BERRY_NORMAL_CYCLE_ITEMS = Object.freeze([
  cheri_berry, chesto_berry, pecha_berry, rawst_berry, aspear_berry, oran_berry, sitrus_berry, persim_berry, lum_berry
]);
export const BERRY_LONG_CYCLE_ITEMS = Object.freeze([
  occa_berry, passho_berry, wacan_berry, rindo_berry, yache_berry, chople_berry, kebia_berry, shuca_berry, coba_berry, payapa_berry, tanga_berry, charti_berry, kasib_berry, haban_berry, colbur_berry, babiri_berry, chilan_berry
]);

export function isPlayerBattleInventoryItem(item) {
  var itemIndex = Number(item && item.index);
  return Boolean(item && (
    item.category === ItemCategory.BattleItem
    || BERRY_NORMAL_CYCLE_ITEMS.some(function (berry) { return berry.index === itemIndex; })
  ));
}

export function compareItemsByIndex(left, right) {
  return (Number(left && left.index) || 0) - (Number(right && right.index) || 0);
}

export function itemsSortedByIndex(items) {
  return (items || []).slice().sort(compareItemsByIndex);
}

export const PLAYER_BATTLE_USABLE_ITEMS = Object.freeze(itemsSortedByIndex(ITEM_LIBRARY.filter(isPlayerBattleInventoryItem)));

var ITEM_INDEX_MAP = ITEM_LIBRARY.reduce(function (accumulator, item) {
  accumulator[item.index] = item;
  return accumulator;
}, {});

var ITEM_KEY_MAP = ITEM_LIBRARY.reduce(function (accumulator, item) {
  accumulator[item.key] = item;
  return accumulator;
}, {});

export function getItemByKey(key) {
  return ITEM_KEY_MAP[String(key || "")] || null;
}

function sanitizeQuantity(quantity) {
  var normalized = Number(quantity);
  if (!Number.isFinite(normalized) || normalized <= 0) {
    return 0;
  }
  return Math.floor(normalized);}

function aggregateInventoryEntries(entries) {
  var grouped = {};
  entries.forEach(function (entry) {
    var itemIndex;
    var quantity;
    if (!Array.isArray(entry)) {
      return;
    }
    itemIndex = Number(entry[0]);
    quantity = sanitizeQuantity(entry[1]);
    if (!ITEM_INDEX_MAP[itemIndex] || quantity <= 0) {
      return;
    }
    grouped[itemIndex] = (grouped[itemIndex] || 0) + quantity;
  });
  return Object.keys(grouped).map(function (itemIndex) {
    return [Number(itemIndex), grouped[itemIndex]];
  }).sort(function (left, right) {
    return left[0] - right[0];
  });}

export function getItemByIndex(index) {
  return ITEM_INDEX_MAP[Number(index)] || null;}

function normalizedEntries(entries) {
  if (!Array.isArray(entries)) {
    return [];
  }
  return aggregateInventoryEntries(entries);}

export function resolveInventoryItems(inventory) {
  return normalizedEntries(inventory).map(function (entry) {
    var item = getItemByIndex(entry[0]);
    if (!item) {
      return null;
    }
    return Object.assign({}, item, {
      quantity: entry[1]
    });
  }).filter(Boolean);}

export function getResolvedInventoryItem(inventory, itemIndex) {
  var normalizedIndex = Number(itemIndex);
  return resolveInventoryItems(inventory).find(function (item) {
    return item.index === normalizedIndex;
  }) || null;}

export function getInventoryItemByIndex(inventory, itemIndex) {
  var normalizedIndex = Number(itemIndex);
  var item = getItemByIndex(normalizedIndex);
  var quantity = 0;
  if (!item || !Array.isArray(inventory)) {
    return null;
  }
  inventory.forEach(function (entry) {
    if (!Array.isArray(entry) || Number(entry[0]) !== normalizedIndex) {
      return;
    }
    quantity += sanitizeQuantity(entry[1]);
  });
  return quantity > 0 ? Object.assign({}, item, { quantity: quantity }) : null;}

export function updateInventoryQuantity(inventory, itemIndex, delta) {
  var normalized = normalizedEntries(inventory);
  var targetIndex = Number(itemIndex);
  var targetEntry = normalized.find(function (entry) {
    return entry[0] === targetIndex;
  });

  if (!targetEntry && delta > 0) {
    targetEntry = [targetIndex, 0];
    normalized.push(targetEntry);
  }

  if (!targetEntry) {
    return normalized;
  }

  targetEntry[1] = Math.max(0, sanitizeQuantity(targetEntry[1]) + Number(delta || 0));
  return normalized.filter(function (entry) {
    return sanitizeQuantity(entry[1]) > 0;
  }).sort(function (left, right) {
    return left[0] - right[0];
  });}

export function getBerryGrowthCycle(itemIndex) {
  var item = getItemByIndex(itemIndex);
  if (!item || item.category !== ItemCategory.Berry) return null;
  if (BERRY_NORMAL_CYCLE_ITEMS.indexOf(item) !== -1) return 36;
  if (BERRY_LONG_CYCLE_ITEMS.indexOf(item) !== -1) return 60;
  return null;}
