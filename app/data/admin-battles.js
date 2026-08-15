import { PLAYER_BATTLE_USABLE_ITEMS } from "./items.js";

export var ADMIN_USERNAME = "admin";

export var ADMIN_BATTLE_ITEMS = PLAYER_BATTLE_USABLE_ITEMS.map(function (item) {
  return [item.index, 3];
});

export function isAdminControlledBattleType(battleType) {
  var type = String(battleType || "");
  return type === "gym_cinnabar_island"
    || type === "gym_viridian_city"
    || type === "training_debug"
    || /^kanto_league_[1-4]$/.test(type)
    || type === "kanto_league_champion";
}

export function isKantoLeagueBattleType(battleType) {
  var type = String(battleType || "");
  return /^kanto_league_[1-4]$/.test(type)
    || type === "kanto_league_champion";
}

export function isAdminRewardBattleType(battleType) {
  var type = String(battleType || "");
  return type === "gym_cinnabar_island"
    || type === "gym_viridian_city"
    || isKantoLeagueBattleType(type);
}
