import * as Engine from "../engine/index.js";
import { TRAINER_SPRITES } from "../data/trainers.js";
import { MAX_TRAINING_LEVELS_PER_POKEMON, TRAINING_DIFFICULTIES, authoritativeTrainingReward, levelLimitForBadges, trainingRewardForBadges } from "../data/progression.js";
import { state } from "./game-state.js";

export var TRAINING_ZONE_DIFFICULTIES = TRAINING_DIFFICULTIES;
export var TRAINING_ZONE_DEBUG_DIFFICULTY = { key: "debug", label: "Debug", levelDelta: 0, minLevel: 5, maxLevel: 100, reward: 0, expLevels: 0, debug: true };

export function trainingDifficultyConfig(key) {
  var dailyState = state.trainingDaily && state.trainingDaily[key];
  var difficulty = TRAINING_ZONE_DIFFICULTIES.find(function (entry) {
    return entry.key === key;
  }) || (key === TRAINING_ZONE_DEBUG_DIFFICULTY.key ? TRAINING_ZONE_DEBUG_DIFFICULTY : null);
  var fullReward = !(dailyState && dailyState.claimedToday);
  var reward = difficulty && !difficulty.debug
    ? (authoritativeTrainingReward(key, fullReward))
    : null;
  return difficulty && reward ? Object.assign({}, difficulty, {
    reward: reward.money,
    battlePoints: reward.battlePoints || 0,
    expLevels: reward.levels,
    fullRewardAvailable: !(dailyState && dailyState.claimedToday)
  }) : difficulty;
}

export function trainingAssignableLevelsForTeam(team, requestedLevels) {
  var levelLimit = Math.min(100, levelLimitForBadges(state.trainerInfo[2]));
  var capacity = (team || []).filter(Boolean).reduce(function (sum, pokemon) {
    var level = Number(pokemon && pokemon.level) || 0;
    return sum + Math.max(0, Math.min(MAX_TRAINING_LEVELS_PER_POKEMON, levelLimit - level, 100 - level));
  }, 0);
  var requested = Math.max(0, Math.floor(Number(requestedLevels) || 0));
  return requestedLevels === undefined ? capacity : Math.min(requested, capacity);
}

function trainerSpriteEntry(fileName) {
  var normalizedFileName = String(fileName || "");
  return TRAINER_SPRITES.find(function (trainer) {
    return trainer.file === normalizedFileName;
  }) || null;
}

export function normalizeTrainingOpponentProfile(profile) {
  var sprite = String(profile && (profile.sprite || profile.file) || "");
  var entry = trainerSpriteEntry(sprite) || TRAINER_SPRITES[0] || null;
  var gender = String(profile && profile.gender || entry && entry.gender || "m");
  var name = String(profile && profile.name || "").trim();

  if (gender !== "f") {
    gender = "m";
  }
  if (!name) {
    name = "Sfidante";
  }

  return {
    name: name,
    sprite: entry ? entry.file : (TRAINER_SPRITES[0] ? TRAINER_SPRITES[0].file : "bimbo.webp"),
    gender: gender
  };
}

export function createTrainingOpponentProfile() {
  return normalizeTrainingOpponentProfile(Engine.createTrainingOpponentPresentation());
}

export function trainingOpponentLevel(team, difficultyKey) {
  return Engine.trainingOpponentLevelForTeam(team, difficultyKey);
}

export function createTrainingOpponentTeam(playerTeam, difficultyKey) {
  return Engine.createTrainingOpponentTeamForRule(playerTeam, difficultyKey);
}
