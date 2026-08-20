import { ItemCategory } from "../data/items.js";
import { GDR_DATA as DATA } from "../data/index.js";
import { TYPE_ASSET_PATHS, captureZoneAssetPaths } from "../data/asset-paths.js";
import { speciesDisplayName, typeDisplayName } from "./entity-text.js";

var GENDER_IMAGE_MAP = {
  male: "maschio.webp",
  female: "femmina.webp"
};
var POKEMON_SPRITE_SCALE_GROUPS = {
  "scale-35": ["10.webp", "304.webp"],
  "scale-40": ["13.webp", "138.webp", "140.webp", "276.webp"],
  "scale-45": ["16.webp", "172.webp", "173.webp", "174.webp", "175.webp", "265.webp",
    "290.webp", "309.webp", "361.webp", "366.webp",
  ],
  "scale-50": [
    "1.webp", "4.webp", "7.webp", "11.webp", "14.webp", "21.webp", "27.webp",
    "29.webp", "32.webp", "50.webp", "90.webp", "100.webp", "104.webp", "116.webp", "120.webp", "129.webp",
    "129_f.webp", "132.webp", "147.webp", "151.webp", "155.webp", "165.webp", "165_f.webp", "167.webp", "177.webp",
    "183.webp", "191.webp", "201.webp", "204.webp", "213.webp", "216.webp", "218.webp", "220.webp", "223.webp",
    "228.webp", "233.webp", "236.webp", "238.webp", "240.webp", "246.webp", "251.webp", "252.webp",
    "255.webp", "258.webp", "261.webp", "263.webp", "273.webp", "280.webp", "285.webp", "293.webp",
    "328.webp", "339.webp", "341.webp", "345.webp", "349.webp", "363.webp", "370.webp", "371.webp",
  ],
  "scale-60": [
    "19.webp", "19_f.webp", "23.webp", "25.webp", "25_f.webp", "39.webp", "43.webp", "46.webp", "48.webp", "52.webp", "54.webp",
    "81.webp", "83.webp", "92.webp", "96.webp", "98.webp", "102.webp", "133.webp", "133_f.webp", "137.webp",
    "152.webp", "158.webp", "161.webp", "156.webp", "163.webp", "170.webp", "176.webp", "179.webp", "194.webp", "194_f.webp",
    "198.webp", "198_f.webp", "200.webp", "209.webp", "211.webp", "222.webp", "225.webp", "231.webp", "235.webp", "247.webp",
    "206.webp", "266.webp", "268.webp", "270.webp", "271.webp", "283.webp", "292.webp", "298.webp", "299.webp",
    "300.webp", "307.webp", "307_f.webp", "316.webp", "316_f.webp", "318.webp", "322.webp", "322_f.webp", "343.webp", "347.webp", "351.webp", "353.webp",
    "355.webp", "374.webp", "239.webp", "296.webp",
  ],
  "scale-70": [
    "5.webp", "8.webp", "30.webp", "35.webp", "37.webp", "41.webp", "41_f.webp", "53.webp", "56.webp",
    "58.webp", "60.webp", "63.webp", "66.webp", "69.webp", "72.webp", "77.webp", "79.webp", "84.webp",
    "84_f.webp", "86.webp", "88.webp", "109.webp", "111.webp", "111_f.webp", "114.webp", "139.webp",
    "168.webp", "171.webp", "182.webp", "187.webp", "188.webp", "190.webp", "190_f.webp", "195.webp", "195_f.webp", "196.webp", "197.webp",
    "207.webp", "207_f.webp", "215.webp", "215_f.webp", "219.webp", "253.webp", "259.webp", "274.webp", "274_f.webp", "281.webp", "301.webp",
    "302.webp", "311.webp", "312.webp", "314.webp", "352.webp", "358.webp", "360.webp", "372.webp", "286.webp",
  ],
  "scale-80": [
    "20.webp", "20_f.webp", "28.webp", "44.webp", "44_f.webp", "51.webp", "64.webp", "64_f.webp", "91.webp",
    "93.webp", "105.webp", "106.webp", "107.webp", "108.webp", "117.webp", "118.webp", "118_f.webp",
    "121.webp", "135.webp", "141.webp", "148.webp", "159.webp", "162.webp", "166.webp", "166_f.webp", "180.webp",
    "186.webp", "186_f.webp", "192.webp", "199.webp", "202.webp", "202_f.webp", "203.webp", "203_f.webp",
    "205.webp", "210.webp", "221.webp", "221_f.webp", "241.webp",
    "256.webp", "256_f.webp", "262.webp", "267.webp", "267_f.webp", "284.webp", "303.webp", "305.webp",
    "308.webp", "308_f.webp", "310.webp",
    "313.webp", "315.webp", "315_f.webp", "325.webp", "327.webp", "335.webp", "336.webp", "337.webp", "354.webp", "359.webp",
    "362.webp", "369.webp", "369_f.webp",
  ],
  "scale-90": [
    "2.webp", "12.webp", "12_f.webp", "15.webp", "31.webp", "33.webp", "55.webp", "57.webp", "59.webp",
    "62.webp", "65.webp", "65_f.webp", "67.webp", "94.webp", "97.webp", "97_f.webp", "101.webp", "112.webp",
    "112_f.webp", "122.webp", "124.webp", "125.webp", "127.webp", "153.webp", "157.webp", "178.webp", "178_f.webp",
    "184.webp", "185.webp", "185_f.webp", "189.webp", "212.webp", "212_f.webp", "224.webp", "224_f.webp",
    "229.webp", "229_f.webp", "230.webp", "234.webp", "237.webp", "243.webp", "244.webp", "245.webp", "254.webp",
    "257.webp", "257_f.webp", "260.webp", "264.webp", "269.webp", "269_f.webp", "279.webp",
    "282.webp", "287.webp", "288.webp", "291.webp", "294.webp", "295.webp", "317.webp", "317_f.webp", "324.webp", "326.webp",
    "331.webp", "332.webp", "332_f.webp", "333.webp", "340.webp", "346.webp", "348.webp", "356.webp", "364.webp", "368.webp",
    "385.webp",
  ],
};

var POKEMON_SPRITE_VERTICAL_ALIGN_GROUPS = {
  "sprite-y-center": ["6.webp", "12.webp", "12_f.webp", "15.webp", "17.webp", "18.webp", "22.webp", "41.webp",
  "41_f.webp", "42.webp", "42_f.webp", "49.webp", "92.webp", "93.webp", "109.webp", "110.webp", "123.webp",
  "123_f.webp", "142.webp", "144.webp", "145.webp", "146.webp", "149.webp", "151.webp", "164.webp", "165.webp",
  "165_f.webp", "166.webp", "166_f.webp", "169.webp", "176.webp", "178.webp", "178_f.webp", "187.webp",
  "188.webp", "189.webp", "193.webp", "200.webp", "201.webp", "207.webp", "207_f.webp", "226.webp", "227.webp",
  "249.webp", "250.webp", "251.webp", "267.webp", "267_f.webp", "269.webp", "269_f.webp", "277.webp", "278.webp",
  "279.webp", "284.webp", "291.webp", "292.webp", "329.webp", "330.webp", "333.webp", "334.webp", "337.webp",
  "338.webp", "344.webp", "351.webp", "353.webp", "355.webp", "357.webp", "358.webp", "362.webp", "373.webp",
  "374.webp", "380.webp", "381.webp", "384.webp", "385.webp", ],
};

var TRAINER_SPRITE_SCALE_GROUPS = {
  "scale-70": ["bimbo.webp", "ciambellina.webp", "specialista_f.webp"],
  "scale-80": ["campeggiatrice.webp", "ragazza_delle_fiabe.webp"],
  "scale-90": ["bimba.webp", "campeggiatore.webp", "pescatrice_di_perle.webp", "pupa_2.webp", "ranger_f.webp"],
};

function spriteClassMapFromGroups(groups) {
  var result = {};
  Object.keys(groups).forEach(function(scaleClass) {
    groups[scaleClass].forEach(function(file) {
      result[file] = scaleClass;
    });
  });
  return result;
}

var POKEMON_SPRITE_SCALE_CLASS_BY_FILE = spriteClassMapFromGroups(POKEMON_SPRITE_SCALE_GROUPS);
var POKEMON_SPRITE_VERTICAL_ALIGN_CLASS_BY_FILE = spriteClassMapFromGroups(POKEMON_SPRITE_VERTICAL_ALIGN_GROUPS);
var TRAINER_SPRITE_SCALE_CLASS_BY_FILE = spriteClassMapFromGroups(TRAINER_SPRITE_SCALE_GROUPS);

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function assetPath(folderName, fileName) {
  if (!fileName) {
    return "";
  }
  return "/assets/" + folderName + "/" + encodeURIComponent(fileNameWithExtension(fileName, "webp"));
}

export function musicPath(fileName) {
  if (!fileName) {
    return "";
  }
  return "/assets/music/" + encodeURIComponent(fileName);
}

export function getZoneImage(zoneName) {
  var assets = captureZoneAssetPaths(zoneName);
  return assets ? assets.card : "";
}

function pokemonSpeciesEntry(pokemon) {
  var speciesKey = pokemon && typeof pokemon !== "string" ? pokemon.speciesKey : pokemon;
  var speciesName = pokemon && typeof pokemon !== "string" ? pokemon.name : pokemon;
  var matches;
  speciesKey = speciesKey !== undefined && speciesKey !== null ? String(speciesKey).trim() : "";
  speciesName = speciesName !== undefined && speciesName !== null ? String(speciesName).trim() : "";
  if (speciesKey && DATA.speciesLibrary[speciesKey]) {
    return {
      key: speciesKey,
      data: DATA.speciesLibrary[speciesKey]
    };
  }
  matches = Object.keys(DATA.speciesLibrary).filter(function (key) {
    return DATA.speciesLibrary[key].name === speciesName;
  });
  if (matches.length) {
    return {
      key: matches[0],
      data: DATA.speciesLibrary[matches[0]]
    };
  }
  return null;
}

export function getPokemonDisplayName(pokemon) {
  var entry = pokemonSpeciesEntry(pokemon);
  if (pokemon && typeof pokemon !== "string" && pokemon.name) {
    return pokemon.name;
  }
  if (entry) {
    return entry.data.name || entry.key;
  }
  return typeof pokemon === "string" ? pokemon : (pokemon && pokemon.name) || "";
}

function pokemonNameForSprite(pokemon) {
  return getPokemonDisplayName(pokemon);
}

function genderSuffix(gender) {
  if (gender === "male") {
    return "m";
  }
  if (gender === "female") {
    return "f";
  }
  return "";
}

function spriteGenderForPokemon(pokemon, speciesData) {
  if (pokemon && typeof pokemon !== "string" && !Array.isArray(pokemon.gender) && pokemon.gender) {
    return pokemon.gender;
  }
  if (pokemon && typeof pokemon !== "string" && Array.isArray(pokemon.gender) && pokemon.gender.length) {
    return pokemon.gender[0];
  }
  if (speciesData.gender && speciesData.gender.length) {
    return speciesData.gender[0];
  }
  return "";
}

function pokemonSpriteFileBaseName(pokemon) {
  var pokemonName = pokemonNameForSprite(pokemon);
  var speciesEntry = pokemonSpeciesEntry(pokemon);
  var speciesData = speciesEntry && speciesEntry.data;
  var parts;
  var gender;

  if (!speciesData) {
    return pokemonName;
  }

  parts = [String(speciesData.dexNumber)];

  if (speciesData.spriteGendered) {
    gender = spriteGenderForPokemon(pokemon, speciesData);
    if (genderSuffix(gender) === "f") {
      parts.push("f");
    }
  }

  if (speciesData.spriteVariant) {
    parts.push(speciesData.spriteVariant);
  }

  if (pokemon && typeof pokemon !== "string" && pokemon.isMega) {
    parts.push("mega");
  }

  if (pokemon && typeof pokemon !== "string" && pokemon.isShiny) {
    parts.push("shiny");
  }

  return parts.join("_");
}

function fileNameWithExtension(fileName, extension) {
  var value = String(fileName || "");
  var extensionIndex = value.lastIndexOf(".");
  var baseName = extensionIndex === -1 ? value : value.slice(0, extensionIndex);
  return baseName + "." + extension;
}

function lowerSnakeAssetName(value) {
  return String(value || "")
    .trim()
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map(function (word) {
      return word.toLocaleLowerCase("it-IT");
    }).join("_");
}

function scalePercent(scaleClass) {
  var match = /^scale-(\d{1,3})$/.exec(String(scaleClass || ""));
  var percent;
  if (!match) {
    return "";
  }
  percent = Number(match[1]);
  if (!Number.isFinite(percent) || percent <= 0) {
    return "";
  }
  return Math.min(100, percent) + "%";
}

function scaleFactor(scaleClass) {
  var match = /^scale-(\d{1,3})$/.exec(String(scaleClass || ""));
  var percent;
  if (!match) {
    return "";
  }
  percent = Number(match[1]);
  if (!Number.isFinite(percent) || percent <= 0) {
    return "";
  }
  return String(Math.min(100, percent) / 100);
}

function spriteClass(className, scaleClass, alignmentClass) {
  return [className, scalePercent(scaleClass) ? "sprite-scale" : "", alignmentClass].filter(Boolean).join(" ");
}

function spriteScaleAttrs(scaleClass, extraAttrs) {
  var factor = scaleFactor(scaleClass);
  var attrs = extraAttrs || 'loading="eager" decoding="async"';
  if (!factor) {
    return attrs;
  }
  return attrs + ' style="--sprite-scale-factor:' + factor + ';"';
}

export function getPokemonImage(pokemon) {
  return assetPath("img_pokemon", pokemonSpriteFileBaseName(pokemon));
}

export function getPokemonStaticImage(pokemon) {
  return assetPath("img_pokemon_static", pokemonSpriteFileBaseName(pokemon));
}

export function getItemImage(fileName) {
  return assetPath("img_item", fileName);
}

export function getItemDisplayImage(item) {
  if (item && item.category === ItemCategory.TM) {
    return getItemImage("MT.webp");
  }
  return item && item.image ? getItemImage(item.image) : "";
}

export function getTypeImage(typeName) {
  return TYPE_ASSET_PATHS[String(typeName || "")] || "";
}

export function getGenderImage(gender) {
  return assetPath("img_miscellaneous", GENDER_IMAGE_MAP[gender]);
}

export function getTrainerImage(fileName) {
  return assetPath("img_trainer", fileName);
}

function getTrainerSpriteClass(fileName) {
  return TRAINER_SPRITE_SCALE_CLASS_BY_FILE[fileName] || "";
}

export function withTrainerSpriteClass(className, fileName) {
  return spriteClass(className, getTrainerSpriteClass(fileName), "");
}

export function withTrainerSpriteAttrs(fileName, extraAttrs) {
  return spriteScaleAttrs(getTrainerSpriteClass(fileName), extraAttrs);
}

function pokemonSpriteFileName(pokemon) {
  return fileNameWithExtension(pokemonSpriteFileBaseName(pokemon), "webp");
}

function getPokemonSpriteScaleClass(pokemon) {
  return POKEMON_SPRITE_SCALE_CLASS_BY_FILE[pokemonSpriteFileName(pokemon)] || "";
}

function getPokemonSpriteVerticalAlignClass(pokemon) {
  return POKEMON_SPRITE_VERTICAL_ALIGN_CLASS_BY_FILE[pokemonSpriteFileName(pokemon)] || "";
}

function getPokemonSpriteClass(pokemon) {
  return spriteClass("", getPokemonSpriteScaleClass(pokemon), getPokemonSpriteVerticalAlignClass(pokemon));
}

export function withPokemonSpriteClass(className, pokemon) {
  return spriteClass(className, getPokemonSpriteScaleClass(pokemon), getPokemonSpriteVerticalAlignClass(pokemon));
}

export function withPokemonSpriteAttrs(pokemon, extraAttrs) {
  return spriteScaleAttrs(getPokemonSpriteScaleClass(pokemon), extraAttrs);
}

export function renderImage(src, alt, className, extraAttrs) {
  if (!src) {
    return "";
  }
  return '<img class="' + escapeHtml(className || "") + '" src="' + escapeHtml(src) + '" alt="' + escapeHtml(alt || "") + '" ' + (extraAttrs || 'loading="eager" decoding="async"') + ">";
}

export function renderPokemonSprite(pokemon, className, extraAttrs) {
  var pokemonName = pokemon && typeof pokemon === "object" && pokemon.speciesKey
    ? speciesDisplayName(pokemon)
    : pokemonNameForSprite(pokemon);
  return renderImage(getPokemonImage(pokemon), pokemonName, withPokemonSpriteClass(className || "pokemon-sprite", pokemon), withPokemonSpriteAttrs(pokemon, extraAttrs));
}

export function renderTypeIcons(types, imageAttrs) {
  return '<div class="type-icon-list">' + types.map(function (typeName) {
    return renderImage(getTypeImage(typeName), typeDisplayName(typeName), "type-label-image", imageAttrs);
  }).join("") + "</div>";
}
