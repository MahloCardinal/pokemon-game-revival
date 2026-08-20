import { GDR_DATA as DATA } from "../data/index.js";
import * as m from "../data/moves.js";
import { random } from "./deterministic-rng.js";
function shuffle(values) {
  var copy = values.slice();
  var index;
  for (index = copy.length - 1; index > 0; index -= 1) {
    var swapIndex = Math.floor(random() * (index + 1));
    var temp = copy[index];
    copy[index] = copy[swapIndex];
    copy[swapIndex] = temp;
  }
  return copy;
}

function sample(values, amount) {
  return shuffle(values).slice(0, amount);
}
import { hpForLevel } from "./level-calc.js";
import { buildMoveList, createMove, moveFromJSON, movePoolForLevel } from "./moves.js";

function resolveSpeciesEntry(speciesIdentifier) {
  var key = speciesIdentifier !== undefined && speciesIdentifier !== null ? String(speciesIdentifier).trim() : "";
  if (key && DATA.speciesLibrary[key]) {
    return {
      key: key,
      name: DATA.speciesLibrary[key].name || key,
      data: DATA.speciesLibrary[key]
    };
  }
  return null;
}

export function Pokemon(data) {
  this.name = data.name;
  this.speciesKey = data.speciesKey;
  this.ndex = data.ndex;
  this.level = data.level;
  this.type = data.type.slice();
  this.maxHp = data.maxHp;
  this.gender = data.gender || null;
  this.isShiny = Boolean(data.isShiny);
  this.isMega = Boolean(data.isMega);
  this.expCurrent = data.expCurrent || 0;
  this.expCap = data.expCap || 0;
  this.instanceId = data.instanceId || null;
  this.instanceRevision = Number(data.instanceRevision) || 0;
  this.catalogReleaseId = data.catalogReleaseId || null;
  var raw = (data.moves || []).slice(0, 4);
  this.moves = [];
  var seen = {};
  raw.forEach(function (move) {
    if (!seen[move.index]) {
      seen[move.index] = true;
      this.moves.push(move);
    }
  }, this);
  this.heldItemIndex = Number(data.heldItemIndex || 0);
}

Pokemon.prototype.toJSON = function () {
  var data = {
    s: this.speciesKey,
    g: this.gender,
    l: this.level,
    hp: this.maxHp,
    m: this.moves.map(function (move) {
      return move.toJSON();
    }),
    xp: this.expCurrent
  };
  if (this.isMega) {
    data.mg = 1;
  }
  if (this.isShiny) {
    data.sh = 1;
  }
  if (this.heldItemIndex) {
    data.i = this.heldItemIndex;
  }
  return data;
};

Pokemon.fromJSON = function (data) {
  var speciesEntry;
  var speciesData;
  var level;
  var maxHp;
  if (!data || data.s === undefined) {
    throw new Error("Invalid Pokemon format.");
  }
  speciesEntry = resolveSpeciesEntry(data.s);
  if (!speciesEntry) {
    throw new Error("Pokemon not found: " + data.s);
  }
  speciesData = speciesEntry.data;
  if (!Array.isArray(data.m)) {
    throw new Error("Invalid Pokemon move format.");
  }
  level = Number(data.l);
  maxHp = Number(data.hp);
  if (!Number.isFinite(level) || level <= 0 || !Number.isFinite(maxHp) || maxHp <= 0) {
    throw new Error("Invalid Pokemon values.");
  }
  return new Pokemon({
    speciesKey: speciesEntry.key,
    name: speciesEntry.name,
    ndex: speciesData.dexNumber,
    type: speciesData.type.slice(),
    gender: data.g || null,
    isShiny: Boolean(data.sh),
    isMega: Boolean(data.mg),
    level: level,
    maxHp: maxHp,
    expCurrent: Number(data.xp) || 0,
    expCap: speciesData.exp,
    moves: data.m.map(moveFromJSON),
    heldItemIndex: Number(data.i) || 0,
    instanceId: data.instance_id || null,
    instanceRevision: Number(data.instance_revision) || 0,
    catalogReleaseId: data.catalog_release_id || null
  });
};

export function createPokemonFromSpecies(speciesName, level, options) {
  options = options || {};
  var speciesEntry = resolveSpeciesEntry(speciesName);
  var speciesData = speciesEntry && speciesEntry.data;
  var genderOptions;
  var moveDefs;
  var gender;
  if (!speciesEntry) {
    throw new Error("Pokemon species not found: " + speciesName);
  }
  genderOptions = speciesData.gender || [];
  moveDefs = options.moveDefs ? options.moveDefs.slice(0, 4) : movePoolForLevel(speciesData, level);
  gender = options.gender || (genderOptions.length ? genderOptions[Math.floor(random() * genderOptions.length)] : null);

  return new Pokemon({
    speciesKey: speciesEntry.key,
    name: speciesData.name || speciesEntry.name,
    ndex: speciesData.dexNumber,
    level: level,
    type: speciesData.type.slice(),
    maxHp: options.maxHp || hpForLevel(level),
    gender: gender,
    isShiny: Boolean(options.isShiny),
    isMega: Boolean(options.isMega),
    expCurrent: options.expCurrent || 0,
    expCap: options.expCap !== undefined ? options.expCap : speciesData.exp,
    moves: buildMoveList(moveDefs, level)
  });
}

export function createWildPokemon(speciesData, level) {
  var movePool = movePoolForLevel(speciesData, level);
  var selectedKeys = sample(movePool, Math.min(4, movePool.length));
  selectedKeys = shuffle(selectedKeys);
  return new Pokemon({
    speciesKey: speciesData.speciesKey,
    name: speciesData.name,
    ndex: speciesData.dexNumber,
    level: Math.max(1, level),
    type: speciesData.type.slice(),
    maxHp: hpForLevel(level),
    gender: speciesData.gender && speciesData.gender.length ? speciesData.gender[Math.floor(random() * speciesData.gender.length)] : null,
    isShiny: false,
    isMega: false,
    expCurrent: 0,
    expCap: speciesData.exp,
    moves: buildMoveList(selectedKeys, level)
  });
}

export function createStarterPokemon(speciesName, options) {
  options = options || {};
  var pokemon = createPokemonFromSpecies(speciesName, 5, {
    gender: options.gender,
    moveDefs: [m.tackle]
  });
  pokemon.moves = [
    createMove(m.tackle, {
      power: 4,
      stats: 0
    })
  ];
  return pokemon;
}
