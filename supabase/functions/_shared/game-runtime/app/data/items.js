import * as m from "./moves.js";
import { formatCatalogDescription } from "./move-format.js";

function defineItemClassification() {
  return Object.freeze({});
}

export const ItemCategory = Object.freeze({
  Ball: defineItemClassification(),
  Vitamin: defineItemClassification(),
  Mt: defineItemClassification(),
  Item: defineItemClassification(),
  Berry: defineItemClassification(),
  BattleItem: defineItemClassification(),
  HeldItem: defineItemClassification()
});

export const ItemSubcategory = Object.freeze({
  EvoStone: defineItemClassification(),
  Unknown: defineItemClassification(),
  HealHp: defineItemClassification(),
  HealStatus: defineItemClassification(),
  HealFull: defineItemClassification(),
  HealKo: defineItemClassification(),
  Meteo: defineItemClassification(),
  StatusItem: defineItemClassification(),
  DamageItem: defineItemClassification(),
  StatsItem: defineItemClassification(),
  Misc: defineItemClassification(),
  TypeEnhance: defineItemClassification(),
  TypeProtect: defineItemClassification(),
  MoveTutor: defineItemClassification()
});

function defineMt(config) {
  var number = String(config.number).padStart(2, "0");
  return {
    index: config.index,
    name: "MT" + number + " " + config.move.name,
    description: "Insegna la mossa " + config.move.name,
    category: ItemCategory.Mt,
    move: config.move,
    tier: config.tier
  };
}

var CATEGORIES_WITHOUT_SUBCATEGORY = [ItemCategory.Ball, ItemCategory.Vitamin, ItemCategory.Mt];
var SUBCATEGORIES_BY_CATEGORY = new Map([
  [ItemCategory.Item, [ItemSubcategory.EvoStone, ItemSubcategory.Unknown, ItemSubcategory.MoveTutor]],
  [ItemCategory.Berry, [ItemSubcategory.HealHp, ItemSubcategory.HealStatus, ItemSubcategory.TypeProtect]],
  [ItemCategory.BattleItem, [ItemSubcategory.HealHp, ItemSubcategory.HealFull, ItemSubcategory.HealKo, ItemSubcategory.HealStatus, ItemSubcategory.Meteo]],
  [ItemCategory.HeldItem, [ItemSubcategory.TypeEnhance, ItemSubcategory.DamageItem, ItemSubcategory.StatusItem, ItemSubcategory.StatsItem, ItemSubcategory.Misc]]
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
    description: "Per catturare Pokémon selvatici",
    image: "poke_ball.webp",
    category: ItemCategory.Ball,
    value: 50
  });

export const mega_ball = normalizeItemDefinition({
    index: 101,
    name: "Mega Ball",
    description: "Per catturare Pokémon selvatici. Più efficace della Poké Ball",
    image: "mega_ball.webp",
    category: ItemCategory.Ball,
    value: 75
  });

export const ultra_ball = normalizeItemDefinition({
    index: 102,
    name: "Ultra Ball",
    description: "Per catturare Pokémon selvatici. Più efficace della Mega Ball",
    image: "ultra_ball.webp",
    category: ItemCategory.Ball,
    value: 90
  });

export const pozione = normalizeItemDefinition({
    index: 103,
    name: "Pozione",
    description: "Cura il Pokémon di 20 PS",
    image: "pozione.webp",
    category: ItemCategory.BattleItem,
    subcategory: ItemSubcategory.HealHp,
    value: 20
  });

export const superpozione = normalizeItemDefinition({
    index: 104,
    name: "Superpozione",
    description: "Cura il Pokémon di 50 PS",
    image: "superpozione.webp",
    category: ItemCategory.BattleItem,
    subcategory: ItemSubcategory.HealHp,
    value: 50
  });

export const iperpozione = normalizeItemDefinition({
    index: 105,
    name: "Iperpozione",
    description: "Cura il Pokémon di 200 PS",
    image: "iperpozione.webp",
    category: ItemCategory.BattleItem,
    subcategory: ItemSubcategory.HealHp,
    value: 200
  });

export const pozione_max = normalizeItemDefinition({
    index: 106,
    name: "Pozione Max",
    description: "Cura il Pokémon di tutti i PS mancanti",
    image: "pozione_max.webp",
    category: ItemCategory.BattleItem,
    subcategory: ItemSubcategory.HealHp,
    value: "max"
  });

export const ricarica_totale = normalizeItemDefinition({
    index: 107,
    name: "Ricarica Totale",
    description: "Cura il Pokémon di tutti i PS mancanti e ogni Status",
    image: "ricarica_totale.webp",
    category: ItemCategory.BattleItem,
    subcategory: ItemSubcategory.HealFull,
    value: "max"
  });

export const antidoto = normalizeItemDefinition({
    index: 108,
    name: "Antidoto",
    description: "Cura dall'avvelenamento",
    image: "antidoto.webp",
    category: ItemCategory.BattleItem,
    subcategory: ItemSubcategory.HealStatus,
    statuses: ["psn"]
  });

export const antiparalisi = normalizeItemDefinition({
    index: 109,
    name: "Antiparalisi",
    description: "Cura dalla paralisi",
    image: "antiparalisi.webp",
    category: ItemCategory.BattleItem,
    subcategory: ItemSubcategory.HealStatus,
    statuses: ["par_block", "par_free"]
  });

export const sveglia = normalizeItemDefinition({
    index: 110,
    name: "Sveglia",
    description: "Cura dal sonno",
    image: "sveglia.webp",
    category: ItemCategory.BattleItem,
    subcategory: ItemSubcategory.HealStatus,
    statuses: ["slp"]
  });

export const antiscottatura = normalizeItemDefinition({
    index: 111,
    name: "Antiscottatura",
    description: "Cura dalla scottatura",
    image: "antiscottatura.webp",
    category: ItemCategory.BattleItem,
    subcategory: ItemSubcategory.HealStatus,
    statuses: ["brn"]
  });

export const antigelo = normalizeItemDefinition({
    index: 112,
    name: "Antigelo",
    description: "Cura dal congelamento",
    image: "antigelo.webp",
    category: ItemCategory.BattleItem,
    subcategory: ItemSubcategory.HealStatus,
    statuses: ["frz"]
  });

export const cura_totale = normalizeItemDefinition({
    index: 113,
    name: "Cura Totale",
    description: "Cura ogni status",
    image: "cura_totale.webp",
    category: ItemCategory.BattleItem,
    subcategory: ItemSubcategory.HealStatus,
    statuses: ["all"]
  });

export const acqua_fresca = normalizeItemDefinition({
    index: 114,
    name: "Acqua fresca",
    description: "Cura il Pokémon di 50 PS",
    image: "acqua_fresca.webp",
    category: ItemCategory.BattleItem,
    subcategory: ItemSubcategory.HealHp,
    value: 50
  });

export const gassosa = normalizeItemDefinition({
    index: 115,
    name: "Gassosa",
    description: "Cura il Pokémon di 60 PS",
    image: "gassosa.webp",
    category: ItemCategory.BattleItem,
    subcategory: ItemSubcategory.HealHp,
    value: 60
  });

export const lemonsucco = normalizeItemDefinition({
    index: 116,
    name: "Lemonsucco",
    description: "Cura il Pokémon di 80 PS",
    image: "lemonsucco.webp",
    category: ItemCategory.BattleItem,
    subcategory: ItemSubcategory.HealHp,
    value: 80
  });

export const latte_mumu = normalizeItemDefinition({
    index: 117,
    name: "Latte Mumu",
    description: "Cura il Pokémon di 100 PS",
    image: "latte_mumu.webp",
    category: ItemCategory.BattleItem,
    subcategory: ItemSubcategory.HealHp,
    value: 100
  });

export const elisir_chiarocielo = normalizeItemDefinition({
    index: 118,
    name: "Elisir Chiarocielo",
    description: "Rimuove ogni meteo attivo",
    image: "elisir_chiarocielo.webp",
    category: ItemCategory.BattleItem,
    subcategory: ItemSubcategory.Meteo
  });

export const revitalizzante = normalizeItemDefinition({
    index: 119,
    name: "Revitalizzante",
    description: "Rianima un Pokémon ko con metà dei PS max",
    image: "revitalizzante.webp",
    category: ItemCategory.BattleItem,
    subcategory: ItemSubcategory.HealKo,
    healFraction: 0.5
  });

export const revitalizzante_max = normalizeItemDefinition({
    index: 120,
    name: "Revitalizzante max",
    description: "Rianima un Pokémon ko con tutti i PS",
    image: "revitalizzante_max.webp",
    category: ItemCategory.BattleItem,
    subcategory: ItemSubcategory.HealKo,
    value: "max"
  });

export const polvocura = normalizeItemDefinition({
    index: 121,
    name: "Polvocura",
    description: "Cura ogni status",
    image: "polvocura.webp",
    category: ItemCategory.BattleItem,
    subcategory: ItemSubcategory.HealStatus,
    statuses: ["all"]
  });

export const polvenergia = normalizeItemDefinition({
    index: 122,
    name: "Polvenergia",
    description: "Cura il Pokémon di 50 PS",
    image: "polvenergia.webp",
    category: ItemCategory.BattleItem,
    subcategory: ItemSubcategory.HealHp,
    value: 50
  });

export const radicenergia = normalizeItemDefinition({
    index: 123,
    name: "Radicenergia",
    description: "Cura il Pokémon di 200 PS",
    image: "radicenergia.webp",
    category: ItemCategory.BattleItem,
    subcategory: ItemSubcategory.HealHp,
    value: 200
  });

export const vitalerba = normalizeItemDefinition({
    index: 124,
    name: "Vitalerba",
    description: "Rianima un Pokémon ko con metà dei PS max",
    image: "vitalerba.webp",
    category: ItemCategory.BattleItem,
    subcategory: ItemSubcategory.HealKo,
    healFraction: 0.5
  });

export const acqua_magica = normalizeItemDefinition({
    index: 200,
    name: "Acqua Magica",
    description: "Aumenta di 1/4 i danni dei Pokémon Acqua",
    image: "acqua_magica.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.TypeEnhance,
    boostType: "Acqua",
    value: 1.25
  });

export const argenpolvere = normalizeItemDefinition({
    index: 201,
    name: "Argenpolvere",
    description: "Aumenta di 1/4 i danni dei Pokémon Coleottero",
    image: "argenpolvere.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.TypeEnhance,
    boostType: "Coleottero",
    value: 1.25
  });

export const beccaffilato = normalizeItemDefinition({
    index: 202,
    name: "Beccaffilato",
    description: "Aumenta di 1/4 i danni dei Pokémon Volante",
    image: "beccaffilato.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.TypeEnhance,
    boostType: "Volante",
    value: 1.25
  });

export const calamita = normalizeItemDefinition({
    index: 203,
    name: "Calamita",
    description: "Aumenta di 1/4 i danni dei Pokémon Elettro",
    image: "calamita.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.TypeEnhance,
    boostType: "Elettro",
    value: 1.25
  });

export const carbonella = normalizeItemDefinition({
    index: 204,
    name: "Carbonella",
    description: "Aumenta di 1/4 i danni dei Pokémon Fuoco",
    image: "carbonella.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.TypeEnhance,
    boostType: "Fuoco",
    value: 1.25
  });

export const cintura_nera = normalizeItemDefinition({
    index: 205,
    name: "Cintura nera",
    description: "Aumenta di 1/4 i danni dei Pokémon Lotta",
    image: "cintura_nera.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.TypeEnhance,
    boostType: "Lotta",
    value: 1.25
  });

export const cucchiaio_torto = normalizeItemDefinition({
    index: 206,
    name: "Cucchiaio torto",
    description: "Aumenta di 1/4 i danni dei Pokémon Psico",
    image: "cucchiaio_torto.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.TypeEnhance,
    boostType: "Psico",
    value: 1.25
  });

export const dente_di_drago = normalizeItemDefinition({
    index: 207,
    name: "Dente di drago",
    description: "Aumenta di 1/4 i danni dei Pokémon Drago",
    image: "dente_di_drago.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.TypeEnhance,
    boostType: "Drago",
    value: 1.25
  });

export const gelomai = normalizeItemDefinition({
    index: 208,
    name: "Gelomai",
    description: "Aumenta di 1/4 i danni dei Pokémon Ghiaccio",
    image: "gelomai.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.TypeEnhance,
    boostType: "Ghiaccio",
    value: 1.25
  });

export const metalcopertura = normalizeItemDefinition({
    index: 209,
    name: "Metalcoperta",
    description: "Aumenta di 1/4 i danni dei Pokémon Acciaio",
    image: "metalcopertura.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.TypeEnhance,
    boostType: "Acciaio",
    value: 1.25
  });

export const miracolseme = normalizeItemDefinition({
    index: 210,
    name: "Miracolseme",
    description: "Aumenta di 1/4 i danni dei Pokémon Erba",
    image: "miracolseme.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.TypeEnhance,
    boostType: "Erba",
    value: 1.25
  });

export const occhialineri = normalizeItemDefinition({
    index: 211,
    name: "Occhialineri",
    description: "Aumenta di 1/4 i danni dei Pokémon Buio",
    image: "occhialineri.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.TypeEnhance,
    boostType: "Buio",
    value: 1.25
  });

export const pietradura = normalizeItemDefinition({
    index: 212,
    name: "Pietradura",
    description: "Aumenta di 1/4 i danni dei Pokémon Roccia",
    image: "pietradura.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.TypeEnhance,
    boostType: "Roccia",
    value: 1.25
  });

export const piuma_fatata = normalizeItemDefinition({
    index: 213,
    name: "Piuma fatata",
    description: "Aumenta di 1/4 i danni dei Pokémon Folletto",
    image: "piuma_fatata.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.TypeEnhance,
    boostType: "Folletto",
    value: 1.25
  });

export const sabbia_soffice = normalizeItemDefinition({
    index: 214,
    name: "Sabbia soffice",
    description: "Aumenta di 1/4 i danni dei Pokémon Terra",
    image: "sabbia_soffice.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.TypeEnhance,
    boostType: "Terra",
    value: 1.25
  });

export const sciarpa_seta = normalizeItemDefinition({
    index: 215,
    name: "Sciarpa seta",
    description: "Aumenta di 1/4 i danni dei Pokémon Normale",
    image: "sciarpa_seta.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.TypeEnhance,
    boostType: "Normale",
    value: 1.25
  });

export const spettrotarga = normalizeItemDefinition({
    index: 216,
    name: "Spettrotarga",
    description: "Aumenta di 1/4 i danni dei Pokémon Spettro",
    image: "spettrotarga.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.TypeEnhance,
    boostType: "Spettro",
    value: 1.25
  });

export const velenaculeo = normalizeItemDefinition({
    index: 217,
    name: "Velenaculeo",
    description: "Aumenta di 1/4 i danni dei Pokémon Veleno",
    image: "velenaculeo.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.TypeEnhance,
    boostType: "Veleno",
    value: 1.25
  });

export const copertura = normalizeItemDefinition({
    index: 218,
    name: "Copertura",
    description: "Chi la tiene subisce metà danni se è affetto da status",
    image: "copertura.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.DamageItem,
    effect: "status_damage_halve"
  });

export const scarponi_robusti = normalizeItemDefinition({
    index: 219,
    name: "Scarponi robusti",
    description: "Chi li tiene non subisce danni da trappole come Punte e da mosse multiturno",
    image: "scarponi_robusti.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.Misc,
    effect: "hazard_multiturn_guard"
  });

export const distraroma = normalizeItemDefinition({
    index: 220,
    name: "Distraroma",
    description: "Ritarda di 2 turni il prossimo status che il Pokémon subirebbe",
    image: "distraroma.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.StatusItem,
    effect: "status_delay"
  });

export const fortunaroma = normalizeItemDefinition({
    index: 221,
    name: "Fortunaroma",
    description: "Chi lo tiene infligge gli status ignorando Distraroma avversario",
    image: "fortunaroma.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.StatusItem,
    effect: "status_ignore_delay"
  });

export const puroaroma = normalizeItemDefinition({
    index: 222,
    name: "Puroaroma",
    description: "Chi lo tiene ignora le modifiche alle proprie statistiche",
    image: "puroaroma.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.StatsItem,
    effect: "ignore_stat_mods"
  });

export const bizzoaroma = normalizeItemDefinition({
    index: 223,
    name: "Bizzoaroma",
    description: "Tenuto da un Pokémon Psico, blocca una mossa avversaria quando entra in campo",
    image: "bizzoaroma.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.Misc,
    effect: "entry_disable_move",
    requiredType: "Psico"
  });

export const gonfioaroma = normalizeItemDefinition({
    index: 224,
    name: "Gonfioaroma",
    description: "Tenuto da un Pokémon Normale, aggiunge un secondo Tipo fino alla fine della sfida",
    image: "gonfioaroma.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.Misc,
    effect: "entry_add_type",
    requiredMonoType: "Normale",
    excludedChoiceTypes: ["Normale"]
  });

export const elettropalla = normalizeItemDefinition({
    index: 225,
    name: "Elettropalla",
    description: "Tenuta da Pikachu, aumenta i danni di 1/3",
    image: "elettropalla.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.DamageItem,
    effect: "species_damage_boost",
    value: 4 / 3,
    allowedSpeciesKeys: ["25"]
  });

export const gambo = normalizeItemDefinition({
    index: 226,
    name: "Gambo",
    description: "Tenuto da Farfetch'd, aumenta i danni di 1/3",
    image: "gambo.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.DamageItem,
    effect: "species_damage_boost",
    value: 4 / 3,
    allowedSpeciesKeys: ["83"]
  });

export const fortunpugno = normalizeItemDefinition({
    index: 227,
    name: "Fortunpugno",
    description: "Tenuto da Chansey, aumenta i danni di 1/3",
    image: "fortunpugno.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.DamageItem,
    effect: "species_damage_boost",
    value: 4 / 3,
    allowedSpeciesKeys: ["113"]
  });

export const osso_spesso = normalizeItemDefinition({
    index: 228,
    name: "Osso spesso",
    description: "Tenuto da Cubone o Marowak, aumenta i danni di 1/3",
    image: "ossospesso.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.DamageItem,
    effect: "species_damage_boost",
    value: 4 / 3,
    allowedSpeciesKeys: ["104", "105"]
  });

export const roccia_di_re = normalizeItemDefinition({
    index: 229,
    name: "Roccia di Re",
    description: "Inverte i turni di blocco da paralisi e confusione",
    image: "roccia_di_re.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.StatusItem,
    effect: "invert_par_cnf"
  });

export const plessimetro = normalizeItemDefinition({
    index: 230,
    name: "Plessimetro",
    description: "Se si usa la stessa mossa del turno precedente, il danno è x1.5",
    image: "plessimetro.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.DamageItem,
    effect: "consecutive_move_boost",
    value: 1.5
  });

export const assorbisfera = normalizeItemDefinition({
    index: 231,
    name: "Assorbisfera",
    description: "Chi attacca perde 1/4 dei PS attuali e aggiunge tale quantità al danno base",
    image: "assorbisfera.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.DamageItem,
    effect: "hp_cost_base_boost"
  });

export const conchinella = normalizeItemDefinition({
    index: 232,
    name: "Conchinella",
    description: "Chi la tiene recupera PS pari a 1/4 dei danni inflitti",
    image: "conchinella.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.DamageItem,
    effect: "damage_drain",
    value: 0.25
  });

export const fiascopolizza = normalizeItemDefinition({
    index: 233,
    name: "Fiascopolizza",
    description: "Chi la tiene ottiene Attacco pari al proprio livello se usa una mossa che sfrutta la %",
    image: "fiascopolizza.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.StatsItem,
    effect: "percentage_move_atk_buff"
  });

export const bandana = normalizeItemDefinition({
    index: 234,
    name: "Bandana",
    description: "Protegge da mosse OHKO. 3 usi a sfida",
    image: "bandana.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.Misc,
    effect: "ohko_protect"
  });

export const bitorzolelmo = normalizeItemDefinition({
    index: 235,
    name: "Bitorzolelmo",
    description: "Se chi lo tiene subisce uno status, infligge 2xLv danni all'avversario",
    image: "bitorzolelmo.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.DamageItem,
    effect: "status_retaliate_damage"
  });

export const zoomlente = normalizeItemDefinition({
    index: 236,
    name: "Zoomlente",
    description: "Se l'avvesario è superefficace su chi la tiene, potenzia x1.5 i propri danni",
    image: "zoomlente.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.DamageItem,
    effect: "type_disadvantage_boost",
    value: 1.5
  });

export const luminpolvere = normalizeItemDefinition({
    index: 237,
    name: "Luminpolvere",
    description: "Chi la tiene è protetto da status per un turno ogni volta che entra in campo",
    image: "luminpolvere.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.StatusItem,
    effect: "entry_status_immunity"
  });

export const focalnastro = normalizeItemDefinition({
    index: 238,
    name: "Focalnastro",
    description: "Chi lo tiene è protetto da status per 1 turno se manda ko l'avversario. 3 usi a sfida",
    image: "focalnastro.webp",
    category: ItemCategory.HeldItem,
    subcategory: ItemSubcategory.StatusItem,
    effect: "status_protect_after_ko"
  });

export const baccaliegia = normalizeItemDefinition({
    index: 300,
    name: "Baccaliegia",
    description: "Tenuta da un Pokémon, cura la paralisi",
    image: "baccaliegi.webp",
    category: ItemCategory.Berry,
    subcategory: ItemSubcategory.HealStatus,
    statuses: ["par_block", "par_free"]
  });

export const baccastagna = normalizeItemDefinition({
    index: 301,
    name: "Baccastagna",
    description: "Tenuta da un Pokémon, cura il sonno",
    image: "baccastagna.webp",
    category: ItemCategory.Berry,
    subcategory: ItemSubcategory.HealStatus,
    statuses: ["slp"]
  });

export const baccapesca = normalizeItemDefinition({
    index: 302,
    name: "Baccapesca",
    description: "Tenuta da un Pokémon, cura l'avvelenamento",
    image: "baccapesca.webp",
    category: ItemCategory.Berry,
    subcategory: ItemSubcategory.HealStatus,
    statuses: ["psn"]
  });

export const baccafrago = normalizeItemDefinition({
    index: 303,
    name: "Baccafrago",
    description: "Tenuta da un Pokémon, cura la scottatura",
    image: "baccafrago.webp",
    category: ItemCategory.Berry,
    subcategory: ItemSubcategory.HealStatus,
    statuses: ["brn"]
  });

export const baccaperina = normalizeItemDefinition({
    index: 304,
    name: "Baccaperina",
    description: "Tenuta da un Pokémon, cura il congelamento",
    image: "baccaperina.webp",
    category: ItemCategory.Berry,
    subcategory: ItemSubcategory.HealStatus,
    statuses: ["frz"]
  });

export const baccarancia = normalizeItemDefinition({
    index: 305,
    name: "Baccarancia",
    description: "Tenuta da un Pokémon, recupera 10 PS quando scende sotto 1/4 dei PS max",
    image: "baccarancia.webp",
    category: ItemCategory.Berry,
    subcategory: ItemSubcategory.HealHp,
    value: 10
  });

export const baccacedro = normalizeItemDefinition({
    index: 306,
    name: "Baccacedro",
    description: "Tenuta da un Pokémon, recupera 1/4 dei PS max quando scende sotto 1/4 dei PS max",
    image: "baccacedro.webp",
    category: ItemCategory.Berry,
    subcategory: ItemSubcategory.HealHp,
    healFraction: 0.25
  });

export const baccaki = normalizeItemDefinition({
    index: 307,
    name: "Baccaki",
    description: "Tenuta da un Pokémon, cura la confusione",
    image: "baccaki.webp",
    category: ItemCategory.Berry,
    subcategory: ItemSubcategory.HealStatus,
    statuses: ["cnf_block", "cnf_free"]
  });

export const baccaprugna = normalizeItemDefinition({
    index: 308,
    name: "Baccaprugna",
    description: "Tenuta da un Pokémon, cura ogni status",
    image: "baccaprugna.webp",
    category: ItemCategory.Berry,
    subcategory: ItemSubcategory.HealStatus,
    statuses: ["all"]
  });

export const baccacao = normalizeItemDefinition({
    index: 309,
    name: "Baccacao",
    description: "Tenuta da un Pokémon, dimezza un danno subito da un avversario di tipo Fuoco",
    image: "baccacao.webp",
    category: ItemCategory.Berry,
    subcategory: ItemSubcategory.TypeProtect,
    protectType: "Fuoco"
  });

export const baccapasflo = normalizeItemDefinition({
    index: 310,
    name: "Baccapasflo",
    description: "Tenuta da un Pokémon, dimezza un danno subito da un avversario di tipo Acqua",
    image: "baccapasflo.webp",
    category: ItemCategory.Berry,
    subcategory: ItemSubcategory.TypeProtect,
    protectType: "Acqua"
  });

export const baccaparmen = normalizeItemDefinition({
    index: 311,
    name: "Baccaparmen",
    description: "Tenuta da un Pokémon, dimezza un danno subito da un avversario di tipo Elettro",
    image: "baccaparmen.webp",
    category: ItemCategory.Berry,
    subcategory: ItemSubcategory.TypeProtect,
    protectType: "Elettro"
  });

export const baccarindo = normalizeItemDefinition({
    index: 312,
    name: "Baccarindo",
    description: "Tenuta da un Pokémon, dimezza un danno subito da un avversario di tipo Erba",
    image: "baccarindo.webp",
    category: ItemCategory.Berry,
    subcategory: ItemSubcategory.TypeProtect,
    protectType: "Erba"
  });

export const baccamoya = normalizeItemDefinition({
    index: 313,
    name: "Baccamoya",
    description: "Tenuta da un Pokémon, dimezza un danno subito da un avversario di tipo Ghiaccio",
    image: "baccamoya.webp",
    category: ItemCategory.Berry,
    subcategory: ItemSubcategory.TypeProtect,
    protectType: "Ghiaccio"
  });

export const baccarosmel = normalizeItemDefinition({
    index: 314,
    name: "Baccarosmel",
    description: "Tenuta da un Pokémon, dimezza un danno subito da un avversario di tipo Lotta",
    image: "baccarosmel.webp",
    category: ItemCategory.Berry,
    subcategory: ItemSubcategory.TypeProtect,
    protectType: "Lotta"
  });

export const baccakebia = normalizeItemDefinition({
    index: 315,
    name: "Baccakebia",
    description: "Tenuta da un Pokémon, dimezza un danno subito da un avversario di tipo Veleno",
    image: "baccakebia.webp",
    category: ItemCategory.Berry,
    subcategory: ItemSubcategory.TypeProtect,
    protectType: "Veleno"
  });

export const baccanaca = normalizeItemDefinition({
    index: 316,
    name: "Baccanaca",
    description: "Tenuta da un Pokémon, dimezza un danno subito da un avversario di tipo Terra",
    image: "baccanaca.webp",
    category: ItemCategory.Berry,
    subcategory: ItemSubcategory.TypeProtect,
    protectType: "Terra"
  });

export const baccababa = normalizeItemDefinition({
    index: 317,
    name: "Baccababa",
    description: "Tenuta da un Pokémon, dimezza un danno subito da un avversario di tipo Volante",
    image: "baccababa.webp",
    category: ItemCategory.Berry,
    subcategory: ItemSubcategory.TypeProtect,
    protectType: "Volante"
  });

export const baccapayapa = normalizeItemDefinition({
    index: 318,
    name: "Baccapayapa",
    description: "Tenuta da un Pokémon, dimezza un danno subito da un avversario di tipo Psico",
    image: "baccapayapa.webp",
    category: ItemCategory.Berry,
    subcategory: ItemSubcategory.TypeProtect,
    protectType: "Psico"
  });

export const baccaitan = normalizeItemDefinition({
    index: 319,
    name: "Baccaitan",
    description: "Tenuta da un Pokémon, dimezza un danno subito da un avversario di tipo Coleottero",
    image: "baccaitan.webp",
    category: ItemCategory.Berry,
    subcategory: ItemSubcategory.TypeProtect,
    protectType: "Coleottero"
  });

export const baccaciofo = normalizeItemDefinition({
    index: 320,
    name: "Baccaciofo",
    description: "Tenuta da un Pokémon, dimezza un danno subito da un avversario di tipo Roccia",
    image: "baccaciofo.webp",
    category: ItemCategory.Berry,
    subcategory: ItemSubcategory.TypeProtect,
    protectType: "Roccia"
  });

export const baccacitrus = normalizeItemDefinition({
    index: 321,
    name: "Baccacitrus",
    description: "Tenuta da un Pokémon, dimezza un danno subito da un avversario di tipo Spettro",
    image: "baccacitrus.webp",
    category: ItemCategory.Berry,
    subcategory: ItemSubcategory.TypeProtect,
    protectType: "Spettro"
  });

export const baccahaban = normalizeItemDefinition({
    index: 322,
    name: "Baccahaban",
    description: "Tenuta da un Pokémon, dimezza un danno subito da un avversario di tipo Drago",
    image: "baccahaban.webp",
    category: ItemCategory.Berry,
    subcategory: ItemSubcategory.TypeProtect,
    protectType: "Drago"
  });

export const baccaxan = normalizeItemDefinition({
    index: 323,
    name: "Baccaxan",
    description: "Tenuta da un Pokémon, dimezza un danno subito da un avversario di tipo Buio",
    image: "baccaxan.webp",
    category: ItemCategory.Berry,
    subcategory: ItemSubcategory.TypeProtect,
    protectType: "Buio"
  });

export const baccababiri = normalizeItemDefinition({
    index: 324,
    name: "Baccababiri",
    description: "Tenuta da un Pokémon, dimezza un danno subito da un avversario di tipo Acciaio",
    image: "baccababiri.webp",
    category: ItemCategory.Berry,
    subcategory: ItemSubcategory.TypeProtect,
    protectType: "Acciaio"
  });

export const baccacinlan = normalizeItemDefinition({
    index: 325,
    name: "Baccacinlan",
    description: "Tenuta da un Pokémon, dimezza un danno subito da un avversario di tipo Normale",
    image: "baccacinlan.webp",
    category: ItemCategory.Berry,
    subcategory: ItemSubcategory.TypeProtect,
    protectType: "Normale"
  });

export const mt01 = normalizeItemDefinition(defineMt({index: 401, number: 1, move: m.Centripugno, tier: 1}));
export const mt02 = normalizeItemDefinition(defineMt({index: 402, number: 2, move: m.Dragartigli, tier: 3}));
export const mt03 = normalizeItemDefinition(defineMt({index: 403, number: 3, move: m.Idropulsar, tier: 2}));
export const mt04 = normalizeItemDefinition(defineMt({index: 404, number: 4, move: m.Calmamente, tier: 2}));
export const mt05 = normalizeItemDefinition(defineMt({index: 405, number: 5, move: m.Boato, tier: 3}));
export const mt06 = normalizeItemDefinition(defineMt({index: 406, number: 6, move: m.Tossina, tier: 1}));
export const mt07 = normalizeItemDefinition(defineMt({index: 407, number: 7, move: m.Grandine, tier: 3}));
export const mt08 = normalizeItemDefinition(defineMt({index: 408, number: 8, move: m.Granfisico, tier: 2}));
export const mt09 = normalizeItemDefinition(defineMt({index: 409, number: 9, move: m.Semitraglia, tier: 3}));
export const mt10 = normalizeItemDefinition(defineMt({index: 410, number: 10, move: m.Introforza, tier: 1}));
export const mt11 = normalizeItemDefinition(defineMt({index: 411, number: 11, move: m.Giornodisole, tier: 3}));
export const mt12 = normalizeItemDefinition(defineMt({index: 412, number: 12, move: m.Provocazione, tier: 3}));
export const mt13 = normalizeItemDefinition(defineMt({index: 413, number: 13, move: m.Geloraggio, tier: 2}));
export const mt14 = normalizeItemDefinition(defineMt({index: 414, number: 14, move: m.Bora, tier: 3}));
export const mt15 = normalizeItemDefinition(defineMt({index: 415, number: 15, move: m.IperRaggio, tier: 1}));
export const mt16 = normalizeItemDefinition(defineMt({index: 416, number: 16, move: m.Schermoluce, tier: 1}));
export const mt17 = normalizeItemDefinition(defineMt({index: 417, number: 17, move: m.Protezione, tier: 2}));
export const mt18 = normalizeItemDefinition(defineMt({index: 418, number: 18, move: m.Pioggiadanza, tier: 3}));
export const mt19 = normalizeItemDefinition(defineMt({index: 419, number: 19, move: m.Gigassorbimento, tier: 2}));
export const mt20 = normalizeItemDefinition(defineMt({index: 420, number: 20, move: m.Salvaguardia, tier: 2}));
export const mt21 = normalizeItemDefinition(defineMt({index: 421, number: 21, move: m.Frustrazione, tier: 3}));
export const mt22 = normalizeItemDefinition(defineMt({index: 422, number: 22, move: m.Solarraggio, tier: 3}));
export const mt23 = normalizeItemDefinition(defineMt({index: 423, number: 23, move: m.Codacciaio, tier: 2}));
export const mt24 = normalizeItemDefinition(defineMt({index: 424, number: 24, move: m.Fulmine, tier: 2}));
export const mt25 = normalizeItemDefinition(defineMt({index: 425, number: 25, move: m.Tuono, tier: 3}));
export const mt26 = normalizeItemDefinition(defineMt({index: 426, number: 26, move: m.Terremoto, tier: 1}));
export const mt27 = normalizeItemDefinition(defineMt({index: 427, number: 27, move: m.Ritorno, tier: 3}));
export const mt28 = normalizeItemDefinition(defineMt({index: 428, number: 28, move: m.Fossa, tier: 3}));
export const mt29 = normalizeItemDefinition(defineMt({index: 429, number: 29, move: m.Psichico, tier: 2}));
export const mt30 = normalizeItemDefinition(defineMt({index: 430, number: 30, move: m.PallaOmbra, tier: 2}));
export const mt31 = normalizeItemDefinition(defineMt({index: 431, number: 31, move: m.Breccia, tier: 1}));
export const mt32 = normalizeItemDefinition(defineMt({index: 432, number: 32, move: m.Doppioteam, tier: 3}));
export const mt33 = normalizeItemDefinition(defineMt({index: 433, number: 33, move: m.Riflesso, tier: 1}));
export const mt34 = normalizeItemDefinition(defineMt({index: 434, number: 34, move: m.Ondashock, tier: 3}));
export const mt35 = normalizeItemDefinition(defineMt({index: 435, number: 35, move: m.Lanciafiamme, tier: 2}));
export const mt36 = normalizeItemDefinition(defineMt({index: 436, number: 36, move: m.Fangobomba, tier: 2}));
export const mt37 = normalizeItemDefinition(defineMt({index: 437, number: 37, move: m.Terrempesta, tier: 3}));
export const mt38 = normalizeItemDefinition(defineMt({index: 438, number: 38, move: m.Fuocobomba, tier: 3}));
export const mt39 = normalizeItemDefinition(defineMt({index: 439, number: 39, move: m.Rocciotomba, tier: 3}));
export const mt40 = normalizeItemDefinition(defineMt({index: 440, number: 40, move: m.Aeroassalto, tier: 2}));
export const mt41 = normalizeItemDefinition(defineMt({index: 441, number: 41, move: m.Attaccalite, tier: 1}));
export const mt42 = normalizeItemDefinition(defineMt({index: 442, number: 42, move: m.Facciata, tier: 1}));
export const mt43 = normalizeItemDefinition(defineMt({index: 443, number: 43, move: m.Forzasegreta, tier: 1}));
export const mt44 = normalizeItemDefinition(defineMt({index: 444, number: 44, move: m.Riposo, tier: 3}));
export const mt45 = normalizeItemDefinition(defineMt({index: 445, number: 45, move: m.Attrazione, tier: 3}));
export const mt46 = normalizeItemDefinition(defineMt({index: 446, number: 46, move: m.Furto, tier: 1}));
export const mt47 = normalizeItemDefinition(defineMt({index: 447, number: 47, move: m.Alacciaio, tier: 3}));
export const mt48 = normalizeItemDefinition(defineMt({index: 448, number: 48, move: m.Frana, tier: 2}));
export const mt49 = normalizeItemDefinition(defineMt({index: 449, number: 49, move: m.Scippo, tier: 2}));
export const mt50 = normalizeItemDefinition(defineMt({index: 450, number: 50, move: m.Vampata, tier: 2}));
export const mt51 = normalizeItemDefinition(defineMt({index: 451, number: 51, move: m.Falcecannone, tier: 0}));
export const mt52 = normalizeItemDefinition(defineMt({index: 452, number: 52, move: m.Dinamipugno, tier: 0}));

export const ps_su = normalizeItemDefinition({
    index: 600,
    name: "PS-su",
    description: "+3 PS massimi",
    image: "ps_su.webp",
    category: ItemCategory.Vitamin,
    effect: "max_hp",
    value: 3
  });

export const pp_su = normalizeItemDefinition({
    index: 601,
    name: "PP-su",
    description: "+2 punti potenza a una mossa",
    image: "pp_su.webp",
    category: ItemCategory.Vitamin,
    effect: "move_power",
    value: 2
  });

export const pp_max = normalizeItemDefinition({
    index: 602,
    name: "PP-max",
    description: "+4 punti potenza a una mossa",
    image: "pp_max.webp",
    category: ItemCategory.Vitamin,
    effect: "move_power",
    value: 4
  });

export const felixpietra = normalizeItemDefinition({
    index: 603,
    name: "Felixpietra",
    description: "Fa evolvere certe specie di Pokémon",
    image: "felixpietra.webp",
    category: ItemCategory.Item,
    subcategory: ItemSubcategory.EvoStone
  });

export const pietrafocaia = normalizeItemDefinition({
    index: 604,
    name: "Pietrafocaia",
    description: "Fa evolvere certe specie di Pokémon",
    image: "pietrafocaia.webp",
    category: ItemCategory.Item,
    subcategory: ItemSubcategory.EvoStone
  });

export const pietratuono = normalizeItemDefinition({
    index: 605,
    name: "Pietratuono",
    description: "Fa evolvere certe specie di Pokémon",
    image: "pietratuono.webp",
    category: ItemCategory.Item,
    subcategory: ItemSubcategory.EvoStone
  });

export const pietraidrica = normalizeItemDefinition({
    index: 606,
    name: "Pietraidrica",
    description: "Fa evolvere certe specie di Pokémon",
    image: "pietraidrica.webp",
    category: ItemCategory.Item,
    subcategory: ItemSubcategory.EvoStone
  });

export const pietrafoglia = normalizeItemDefinition({
    index: 607,
    name: "Pietrafoglia",
    description: "Fa evolvere certe specie di Pokémon",
    image: "pietrafoglia.webp",
    category: ItemCategory.Item,
    subcategory: ItemSubcategory.EvoStone
  });

export const pietralunare = normalizeItemDefinition({
    index: 608,
    name: "Pietralunare",
    description: "Fa evolvere certe specie di Pokémon",
    image: "pietralunare.webp",
    category: ItemCategory.Item,
    subcategory: ItemSubcategory.EvoStone
  });

export const pietrasolare = normalizeItemDefinition({
    index: 609,
    name: "Pietrasolare",
    description: "Fa evolvere certe specie di Pokémon",
    image: "pietrasolare.webp",
    category: ItemCategory.Item,
    subcategory: ItemSubcategory.EvoStone
  });

export const dente_abissi = normalizeItemDefinition({
    index: 610,
    name: "Dente abissi",
    description: "Fa evolvere Clamperl in Huntail",
    image: "dente_abissi.webp",
    category: ItemCategory.Item,
    subcategory: ItemSubcategory.EvoStone
  });

export const squamabissi = normalizeItemDefinition({
    index: 611,
    name: "Squamabissi",
    description: "Fa evolvere Clamperl in Gorebyss",
    image: "squamabissi.webp",
    category: ItemCategory.Item,
    subcategory: ItemSubcategory.EvoStone
  });

export const squama_bella = normalizeItemDefinition({
    index: 612,
    name: "Squama bella",
    description: "Fa evolvere Feebas in Milotic",
    image: "squama_bella.webp",
    category: ItemCategory.Item,
    subcategory: ItemSubcategory.EvoStone
  });

export const upgrade = normalizeItemDefinition({
    index: 613,
    name: "Upgrade",
    description: "Fa evolvere Porygon in Porygon2",
    image: "upgrade.webp",
    category: ItemCategory.Item,
    subcategory: ItemSubcategory.EvoStone
  });

export const squama_drago = normalizeItemDefinition({
    index: 614,
    name: "Squama drago",
    description: "Fa evolvere Seadra in Kingdra",
    image: "squama_drago.webp",
    category: ItemCategory.Item,
    subcategory: ItemSubcategory.EvoStone
  });

export const filo_dell_unione = normalizeItemDefinition({
    index: 615,
    name: "Filo dell'unione",
    description: "Fa evolvere certe specie di Pokémon",
    image: "filo_dell_unione.webp",
    category: ItemCategory.Item,
    subcategory: ItemSubcategory.EvoStone
  });

export const occhialoni = normalizeItemDefinition({
    index: 616,
    name: "Occhialoni",
    description: "Permettono di visitare il Deserto",
    image: "occhialoni.webp",
    category: ItemCategory.Item,
    subcategory: ItemSubcategory.Unknown
  });
export const spettrosonda = normalizeItemDefinition({
    index: 617,
    name: "Spettrosonda",
    description: "Permette di visitare la Torre Fantasma",
    image: "spettrosonda.webp",
    category: ItemCategory.Item,
    subcategory: ItemSubcategory.Unknown
  });

export const flauto_bianco = normalizeItemDefinition({
    index: 618,
    name: "Flauto Bianco",
    description: "Permette di scegliere il Livello esatto del Pokémon cercato. Usabile 5 volte al giorno",
    image: "flauto_bianco.webp",
    category: ItemCategory.Item,
    subcategory: ItemSubcategory.Unknown
  });

export const flauto_nero = normalizeItemDefinition({
    index: 619,
    name: "Flauto Nero",
    description: "Permette di scegliere il Tipo esatto del Pokémon cercato. Usabile 5 volte al giorno",
    image: "flauto_nero.webp",
    category: ItemCategory.Item,
    subcategory: ItemSubcategory.Unknown
  });

export const master_ball = normalizeItemDefinition({
    index: 620,
    name: "Master Ball",
    description: "Per catturare Pokémon selvatici. È infallibile",
    image: "master_ball.webp",
    category: ItemCategory.Ball,
    value: 100
  });

export const squama_cuore = normalizeItemDefinition({
    index: 621,
    name: "Squama cuore",
    description: "Permette al Pokémon di apprendere una qualsiasi mossa che potrebbe conoscere",
    image: "squama_cuore.webp",
    category: ItemCategory.Item,
    subcategory: ItemSubcategory.MoveTutor
  });

export function itemCanTriggerEvolution(item) {
  return Boolean(
    item
      && (
        (item.category === ItemCategory.Item && item.subcategory === ItemSubcategory.EvoStone)
        || item.index === metalcopertura.index
        || item.index === roccia_di_re.index
      )
  );
}

export function pokemonCanHoldItem(pokemon, item) {
  var key = pokemon && pokemon.speciesKey !== undefined && pokemon.speciesKey !== null ? String(pokemon.speciesKey) : "";
  var name = pokemon && pokemon.name !== undefined && pokemon.name !== null ? String(pokemon.name) : "";
  var types = pokemon && Array.isArray(pokemon.type) ? pokemon.type : [];
  if (!pokemon || !item || (item.category !== ItemCategory.HeldItem && item.category !== ItemCategory.Berry)) {
    return false;
  }
  if (Array.isArray(item.allowedSpeciesKeys) && item.allowedSpeciesKeys.length && item.allowedSpeciesKeys.indexOf(key) === -1) {
    return false;
  }
  if (Array.isArray(item.allowedSpeciesNames) && item.allowedSpeciesNames.length && item.allowedSpeciesNames.indexOf(name) === -1) {
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

export const ITEM_LIBRARY = Object.freeze([
  poke_ball,
  mega_ball,
  ultra_ball,
  pozione,
  superpozione,
  iperpozione,
  pozione_max,
  ricarica_totale,
  antidoto,
  antiparalisi,
  sveglia,
  antiscottatura,
  antigelo,
  cura_totale,
  acqua_fresca,
  gassosa,
  lemonsucco,
  latte_mumu,
  elisir_chiarocielo,
  revitalizzante,
  revitalizzante_max,
  polvocura,
  polvenergia,
  radicenergia,
  vitalerba,
  acqua_magica,
  argenpolvere,
  beccaffilato,
  calamita,
  carbonella,
  cintura_nera,
  cucchiaio_torto,
  dente_di_drago,
  gelomai,
  metalcopertura,
  miracolseme,
  occhialineri,
  pietradura,
  piuma_fatata,
  sabbia_soffice,
  sciarpa_seta,
  spettrotarga,
  velenaculeo,
  copertura,
  scarponi_robusti,
  distraroma,
  fortunaroma,
  puroaroma,
  bizzoaroma,
  gonfioaroma,
  elettropalla,
  gambo,
  fortunpugno,
  osso_spesso,
  roccia_di_re,
  plessimetro,
  assorbisfera,
  conchinella,
  fiascopolizza,
  bandana,
  bitorzolelmo,
  zoomlente,
  luminpolvere,
  focalnastro,
  baccaliegia,
  baccastagna,
  baccapesca,
  baccafrago,
  baccaperina,
  baccarancia,
  baccacedro,
  baccaki,
  baccaprugna,
  baccacao,
  baccapasflo,
  baccaparmen,
  baccarindo,
  baccamoya,
  baccarosmel,
  baccakebia,
  baccanaca,
  baccababa,
  baccapayapa,
  baccaitan,
  baccaciofo,
  baccacitrus,
  baccahaban,
  baccaxan,
  baccababiri,
  baccacinlan,
  mt01,
  mt02,
  mt03,
  mt04,
  mt05,
  mt06,
  mt07,
  mt08,
  mt09,
  mt10,
  mt11,
  mt12,
  mt13,
  mt14,
  mt15,
  mt16,
  mt17,
  mt18,
  mt19,
  mt20,
  mt21,
  mt22,
  mt23,
  mt24,
  mt25,
  mt26,
  mt27,
  mt28,
  mt29,
  mt30,
  mt31,
  mt32,
  mt33,
  mt34,
  mt35,
  mt36,
  mt37,
  mt38,
  mt39,
  mt40,
  mt41,
  mt42,
  mt43,
  mt44,
  mt45,
  mt46,
  mt47,
  mt48,
  mt49,
  mt50,
  mt51,
  mt52,
  ps_su,
  pp_su,
  pp_max,
  felixpietra,
  pietrafocaia,
  pietratuono,
  pietraidrica,
  pietrafoglia,
  pietralunare,
  pietrasolare,
  dente_abissi,
  squamabissi,
  squama_bella,
  upgrade,
  squama_drago,
  filo_dell_unione,
  occhialoni,
  spettrosonda,
  flauto_bianco,
  flauto_nero,
  master_ball,
  squama_cuore
]);

export const BERRY_NORMAL_CYCLE_ITEMS = Object.freeze([
  baccaliegia, baccastagna, baccapesca, baccafrago, baccaperina, baccarancia, baccacedro, baccaki, baccaprugna
]);
export const BERRY_LONG_CYCLE_ITEMS = Object.freeze([
  baccacao, baccapasflo, baccaparmen, baccarindo, baccamoya, baccarosmel, baccakebia, baccanaca, baccababa, baccapayapa, baccaitan, baccaciofo, baccacitrus, baccahaban, baccaxan, baccababiri, baccacinlan
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

export function itemDisplayDescription(item) {
  var move = item && item.category === ItemCategory.Mt && item.move ? item.move : null;
  return move ? formatCatalogDescription(move) : item.description;}

export function getBerryGrowthCycle(itemIndex) {
  var item = getItemByIndex(itemIndex);
  if (!item || item.category !== ItemCategory.Berry) return null;
  if (BERRY_NORMAL_CYCLE_ITEMS.indexOf(item) !== -1) return 36;
  if (BERRY_LONG_CYCLE_ITEMS.indexOf(item) !== -1) return 60;
  return null;}
