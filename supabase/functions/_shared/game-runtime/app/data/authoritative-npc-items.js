import {
  antidote,
  ice_heal,
  burn_heal,
  paralyze_heal,
  full_heal,
  hyper_potion,
  potion,
  max_potion,
  full_restore,
  revive,
  max_revive,
  super_potion,
  awakening
} from "./items.js";
import { kantoGymCityByKey } from "./gyms.js";

var NPC_ITEM_QUANTITY = 3;
var AUTOMATIC_NPC_ITEMS = [
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
  revive,
  max_revive
];

function reviveCounts(contractKey, trainingDifficulty, gymKey) {
  var gym;
  var badgeIndex;
  if (contractKey === "training") {
    if (trainingDifficulty === "easy" || trainingDifficulty === "medium") { return [1, 1]; }
    if (trainingDifficulty === "hard") { return [2, 2]; }
    return null;
  }
  if (contractKey !== "gym") {
    return null;
  }
  gym = kantoGymCityByKey(gymKey);
  badgeIndex = Number(gym && gym.badgeIndex);
  if (!gym || !Number.isInteger(badgeIndex)) { return null; }
  if (badgeIndex < 2) { return [1, 2]; }
  if (badgeIndex < 4) { return [2, 2]; }
  if (badgeIndex < 6) { return [2, 2]; }
  return null;
}

export function authoritativeNpcItemsForBattle(input) {
  input = input || {};
  var contractKey = String(input.contractKey || "");
  var counts = reviveCounts(contractKey, String(input.trainingDifficulty || ""), String(input.gymKey || ""));
  if (!counts) {
    return [];
  }
  return AUTOMATIC_NPC_ITEMS.map(function (item) {
    var quantity = NPC_ITEM_QUANTITY;
    if (item.index === revive.index) { quantity = counts[0]; }
    if (item.index === max_revive.index) { quantity = counts[1]; }
    return [item.index, quantity];
  });
}
