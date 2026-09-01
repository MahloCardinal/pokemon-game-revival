import { ITEM_LIBRARY, ItemCategory, ItemSubcategory } from "../data/items.js";
import { MOVE_LIBRARY } from "../data/moves.js";
import { SPECIES_LIBRARY } from "../data/index.js";
import { messageDescriptor, t, textDescriptor } from "./i18n.js";

var ITEM_KEY_BY_INDEX = Object.freeze(ITEM_LIBRARY.reduce(function (catalog, item) {
  catalog[item.index] = item.key;
  return catalog;
}, {}));
var ITEM_KEYS = Object.freeze(ITEM_LIBRARY.reduce(function (catalog, item) {
  catalog[item.key] = true;
  return catalog;
}, {}));

var MOVE_KEY_BY_INDEX = Object.freeze(MOVE_LIBRARY.reduce(function (catalog, move) {
  catalog[move.index] = move.key;
  return catalog;
}, {}));
var MOVE_KEYS = Object.freeze(MOVE_LIBRARY.reduce(function (catalog, move) {
  catalog[move.key] = true;
  return catalog;
}, {}));

var SPECIES_KEY_BY_CANONICAL_NAME = Object.freeze(Object.keys(SPECIES_LIBRARY).reduce(function (catalog, key) {
  var species = SPECIES_LIBRARY[key];
  if (species && species.name) {
    catalog[String(species.name).toLocaleLowerCase("en-US")] = key;
  }
  return catalog;
}, {}));

export function itemTranslationKey(item) {
  if (!item) {
    return "";
  }
  if (typeof item === "string") {
    return ITEM_KEYS[item] ? item : "";
  }
  return String(item.key || ITEM_KEY_BY_INDEX[Number(item.index)] || "");
}

export function moveTranslationKey(move) {
  if (!move) {
    return "";
  }
  if (typeof move === "string") {
    return MOVE_KEYS[move] ? move : "";
  }
  return String(move.key || MOVE_KEY_BY_INDEX[Number(move.index)] || "");
}

export function itemDisplayName(item) {
  var key = itemTranslationKey(item);
  var resolvedItem = item && typeof item === "object" ? item : ITEM_LIBRARY.find(function (entry) { return entry.key === key; });
  if (resolvedItem && resolvedItem.category === ItemCategory.TM) {
    return t("entityDescriptions.items.tmName", {
      number: String(resolvedItem.number).padStart(2, "0"),
      move: moveDisplayName(resolvedItem.move)
    });
  }
  return key ? t("entities.items." + key + ".name") : (typeof item === "string" ? item : "");
}

export function itemNameDescriptor(item) {
  var key = itemTranslationKey(item);
  var resolvedItem = item && typeof item === "object" ? item : ITEM_LIBRARY.find(function (entry) { return entry.key === key; });
  if (resolvedItem && resolvedItem.category === ItemCategory.TM) {
    return textDescriptor("entityDescriptions.items.tmName", {
      number: String(resolvedItem.number).padStart(2, "0"),
      move: moveNameDescriptor(resolvedItem.move)
    });
  }
  return key ? textDescriptor("entities.items." + key + ".name") : textDescriptor("entityDescriptions.items.fallbackName");
}

function statusDescriptionKey(statuses) {
  var values = Array.isArray(statuses) ? statuses : [];
  if (values.indexOf("all") !== -1) return "all";
  if (values.indexOf("psn") !== -1) return "poison";
  if (values.indexOf("par_block") !== -1 || values.indexOf("par_free") !== -1) return "paralysis";
  if (values.indexOf("slp") !== -1) return "sleep";
  if (values.indexOf("brn") !== -1) return "burn";
  if (values.indexOf("frz") !== -1) return "freeze";
  if (values.indexOf("cnf_block") !== -1 || values.indexOf("cnf_free") !== -1) return "confusion";
  return "all";
}

function evolutionDescriptionParams(itemKey) {
  var evolutions = {
    deep_sea_tooth: ["366", "367"], deep_sea_scale: ["366", "368"], prism_scale: ["349", "350"],
    upgrade: ["137", "233"], dragon_scale: ["117", "230"]
  };
  var pair = evolutions[itemKey];
  return pair ? { from: speciesDisplayName(pair[0]), to: speciesDisplayName(pair[1]) } : null;
}

export function itemDisplayDescription(item) {
  var key = itemTranslationKey(item);
  var subcategoryKey = item && item.subcategory && item.subcategory.key || "";
  var statusKey;
  var evolutionParams;
  if (!item) return "";
  if (item.category === ItemCategory.TM && item.move) {
    return t("entityDescriptions.items.teachMove", { move: moveDisplayName(item.move) });
  }
  if (key === "master_ball") return t("entityDescriptions.items.captureGuaranteed");
  if (key === "great_ball") return t("entityDescriptions.items.captureBetter", { ball: itemDisplayName({ key: "poke_ball" }) });
  if (key === "ultra_ball") return t("entityDescriptions.items.captureBetter", { ball: itemDisplayName({ key: "great_ball" }) });
  if (item.category === ItemCategory.Ball) return t("entityDescriptions.items.capture");
  if (subcategoryKey === ItemSubcategory.HealFull.key) return t("entityDescriptions.items.fullRestore");
  if (subcategoryKey === ItemSubcategory.HealHp.key) {
    if (item.category === ItemCategory.Berry) {
      return item.healFraction ? t("entityDescriptions.items.heldHealQuarter") : t("entityDescriptions.items.heldHealHp", { value: item.value });
    }
    return item.value === "max" ? t("entityDescriptions.items.healMax") : t("entityDescriptions.items.healHp", { value: item.value });
  }
  if (subcategoryKey === ItemSubcategory.HealStatus.key) {
    statusKey = statusDescriptionKey(item.statuses);
    if (statusKey === "all") return t(item.category === ItemCategory.Berry ? "entityDescriptions.items.heldCureAllStatus" : "entityDescriptions.items.cureAllStatus");
    return t(item.category === ItemCategory.Berry ? "entityDescriptions.items.heldCureStatus" : "entityDescriptions.items.cureStatus", { status: t("entityDescriptions.statuses." + statusKey) });
  }
  if (subcategoryKey === ItemSubcategory.HealKo.key) {
    return item.value === "max" ? t("entityDescriptions.items.reviveFull") : t("entityDescriptions.items.reviveHalf");
  }
  if (subcategoryKey === ItemSubcategory.Weather.key) return t("entityDescriptions.items.clearWeather");
  if (subcategoryKey === ItemSubcategory.TypeBoost.key && item.boostType) {
    return t("entityDescriptions.items.boostType", { type: typeDisplayName(item.boostType) });
  }
  if (subcategoryKey === ItemSubcategory.TypeProtection.key && item.protectType) {
    return t("entityDescriptions.items.protectType", { type: typeDisplayName(item.protectType) });
  }
  if (item.effect && t("entityDescriptions.items.effects." + item.effect) !== "entityDescriptions.items.effects." + item.effect) {
    return t("entityDescriptions.items.effects." + item.effect, {
      species: (item.allowedSpeciesKeys || []).map(speciesDisplayName).join(" / ")
    });
  }
  if (item.category === ItemCategory.Vitamin) {
    return t(item.effect === "max_hp" ? "entityDescriptions.items.maxHpUp" : "entityDescriptions.items.movePowerUp", { value: item.value });
  }
  evolutionParams = evolutionDescriptionParams(key);
  if (evolutionParams) return t("entityDescriptions.items.evolutionSpecific", evolutionParams);
  if (subcategoryKey === ItemSubcategory.EvolutionStone.key) return t("entityDescriptions.items.evolutionGeneric");
  if (key === "go_goggles") return t("entityDescriptions.items.visitDesert");
  if (key === "silph_scope") return t("entityDescriptions.items.visitGhostTower");
  if (key === "white_flute") return t("entityDescriptions.items.chooseSearchLevel");
  if (key === "black_flute") return t("entityDescriptions.items.chooseSearchType");
  if (key === "heart_scale") return t("entityDescriptions.items.moveTutor");
  return t("entityDescriptions.items.fallback");
}

export function moveDisplayName(move) {
  var key = moveTranslationKey(move);
  return key ? t("entities.moves." + key + ".name") : (typeof move === "string" ? move : "");
}

export function moveNameDescriptor(move) {
  var key = moveTranslationKey(move);
  return key ? textDescriptor("entities.moves." + key + ".name") : textDescriptor("entityDescriptions.moves.fallbackName");
}

function moveDescriptionTemplate(move) {
  var key = moveTranslationKey(move);
  return key ? t("entityDescriptions.moves." + key + ".description") : t("entityDescriptions.moves.fallbackDescription");
}

export function moveDisplayDescription(move) {
  return moveDescriptionTemplate(move).replace(/\{(\w+)\}/g, function (_match, key) {
    var value = key === "power" ? move && move.power : (key === "stats" || key === "buff") ? move && move.stats : undefined;
    return value !== undefined ? value : "";
  });
}

export function moveCatalogDescription(move) {
  return moveDescriptionTemplate(move)
    .replace(/\s*\((?:power|potenza): \{power\}, stats: \{(?:stats|buff)\}\)/gi, "")
    .replace(/\+2x\{(?:stats|buff)\}/g, function (_match, offset) { return t("entityDescriptions.moveFormatting." + (offset === 0 ? "increaseGreatlyStart" : "increaseGreatly")); })
    .replace(/-2x\{(?:stats|buff)\}/g, function (_match, offset) { return t("entityDescriptions.moveFormatting." + (offset === 0 ? "decreaseGreatlyStart" : "decreaseGreatly")); })
    .replace(/-\{power\}/g, function (_match, offset) { return t("entityDescriptions.moveFormatting." + (offset === 0 ? "damageStart" : "damage")); })
    .replace(/\+\{(?:stats|buff)\}/g, function (_match, offset) { return t("entityDescriptions.moveFormatting." + (offset === 0 ? "increaseStart" : "increase")); })
    .replace(/-\{(?:stats|buff)\}/g, function (_match, offset) { return t("entityDescriptions.moveFormatting." + (offset === 0 ? "decreaseStart" : "decrease")); });
}

export function speciesDisplayName(species) {
  var key = species && typeof species === "object" ? species.speciesKey : species;
  return key !== undefined && key !== null && String(key)
    ? t("entities.species." + String(key) + ".name")
    : "";
}

export function speciesNameDescriptor(species) {
  var key = species && typeof species === "object" ? species.speciesKey : species;
  return key !== undefined && key !== null && String(key)
    ? textDescriptor("entities.species." + String(key) + ".name")
    : textDescriptor("entityDescriptions.species.fallbackName");
}

export function pokemonNameDescriptor(pokemon) {
  var directKey = pokemon && typeof pokemon === "object" ? pokemon.displaySpeciesKey || pokemon.speciesKey : "";
  var canonicalName = pokemon && typeof pokemon === "object" ? pokemon.name : pokemon;
  var key = directKey || SPECIES_KEY_BY_CANONICAL_NAME[String(canonicalName || "").toLocaleLowerCase("en-US")];
  return key ? speciesNameDescriptor(key) : textDescriptor("entityDescriptions.species.fallbackName");
}

export function pokemonDisplayName(pokemon) {
  var directKey = pokemon && typeof pokemon === "object" ? pokemon.displaySpeciesKey || pokemon.speciesKey : "";
  var canonicalName = pokemon && typeof pokemon === "object" ? pokemon.name : pokemon;
  var key = directKey || SPECIES_KEY_BY_CANONICAL_NAME[String(canonicalName || "").toLocaleLowerCase("en-US")];
  return key ? speciesDisplayName(key) : String(canonicalName || "");
}

export function typeDisplayName(typeKey) {
  return typeKey ? t("entities.types." + String(typeKey) + ".name") : "";
}

export function teamViolationLines(violation) {
  var item = violation && violation.itemIndex ? ITEM_LIBRARY.find(function (entry) {
    return Number(entry.index) === Number(violation.itemIndex);
  }) : null;
  var params = {
    item: itemNameDescriptor(item),
    pokemon: speciesNameDescriptor(violation && violation.speciesKey),
    count: violation && violation.count,
    max: violation && violation.max,
    moves: (violation && violation.moveIndexes || []).map(function (index) {
      return moveDisplayName({ index: index });
    }).join(", ")
  };
  var lineCount = 2;
  if (!violation || !violation.key) return [messageDescriptor("generic.failed")];
  return Array.from({ length: lineCount }, function (_entry, index) {
    return messageDescriptor("teamRules." + violation.key + ".line" + (index + 1), params);
  });
}

export function teamViolationMessage(violation) {
  return teamViolationLines(violation)[0];
}

export function teamViolationFromBattleResult(result) {
  var violation = result && result.details && result.details.teamViolation;
  return violation && typeof violation === "object" && violation.key ? violation : null;
}
