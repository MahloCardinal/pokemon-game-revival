import { GDR_DATA } from "../data/index.js";
import { TRAINING_DIFFICULTIES } from "../data/progression.js";
import { TRAINER_NAME_POOLS, TRAINER_SPRITES } from "../data/trainers.js";
import { random } from "./deterministic-rng.js";
import { createWildPokemon } from "./pokemon.js";
import { getAllSpecies, weightedChoice } from "./species.js";

var trainingSpeciesPoolCache = {};

export function trainingDifficultyRule(key) {
  return TRAINING_DIFFICULTIES.find(function (entry) { return entry.key === key; }) || null;
}

export function trainingOpponentLevelForTeam(team, difficultyKey) {
  var config = trainingDifficultyRule(difficultyKey);
  var baseLevel = (team || []).reduce(function (highest, pokemon) {
    var level = pokemon ? Number(pokemon.level) || 0 : 0;
    return level > highest ? level : highest;
  }, 0);
  if (!config || baseLevel <= 0) { return 5; }
  return Math.max(config.minLevel, Math.min(config.maxLevel, baseLevel + config.levelDelta));
}

export function trainingSpeciesCandidates(level) {
  var encounterLevel = Math.min(Number(level) || 0, 60);
  return getAllSpecies().filter(function (species) {
    var minLevel = species.minLevel !== undefined ? Number(species.minLevel) : 1;
    var maxLevel = species.maxLevel !== undefined ? Number(species.maxLevel) : 100;
    return encounterLevel >= minLevel && encounterLevel <= maxLevel;
  });
}

function randomTrainingSpecies(level) {
  var key = String(Math.min(Number(level) || 0, 60));
  var cached = trainingSpeciesPoolCache[key];
  var candidates;
  if (!cached) {
    candidates = trainingSpeciesCandidates(level);
    if (!candidates.length) { candidates = getAllSpecies(); }
    cached = {
      candidates: candidates,
      species: [],
      weights: []
    };
    candidates.forEach(function (species) {
    var weight = GDR_DATA.rarityWeights[species.rarity];
      if ((typeof weight === "number" ? weight : 100) > 0) {
        cached.species.push(species);
        cached.weights.push(typeof weight === "number" ? weight : 100);
      }
    });
    trainingSpeciesPoolCache[key] = cached;
  }
  if (!cached.species.length) {
    return cached.candidates[Math.floor(random() * cached.candidates.length)];
  }
  return weightedChoice(cached.species, cached.weights);
}

export function createTrainingOpponentTeamForRule(playerTeam, difficultyKey) {
  var teamSize = (playerTeam || []).filter(Boolean).length;
  var level = trainingOpponentLevelForTeam(playerTeam, difficultyKey);
  return Array.from({ length: teamSize }, function () {
    return createWildPokemon(randomTrainingSpecies(level), level);
  });
}

export function createTrainingOpponentPresentation() {
  var trainers = TRAINER_SPRITES.filter(function (entry) {
    return entry && entry.file && (entry.gender === "m" || entry.gender === "f");
  });
  var trainer = trainers.length ? trainers[Math.floor(random() * trainers.length)] : null;
  var gender = trainer && trainer.gender === "f" ? "f" : "m";
  var names = TRAINER_NAME_POOLS[gender] || TRAINER_NAME_POOLS.m || [];
  return {
    name: names.length ? names[Math.floor(random() * names.length)] : "Sfidante",
    sprite: trainer ? trainer.file : (TRAINER_SPRITES[0] ? TRAINER_SPRITES[0].file : "bimbo.webp"),
    gender: gender
  };
}
