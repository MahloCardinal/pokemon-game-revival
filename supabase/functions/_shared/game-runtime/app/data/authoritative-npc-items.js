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

function npcItemProfile(input) {
  var gym;
  var badgeIndex;
  if (input.contractKey === "training") {
    if (input.trainingDifficulty === "medium") { return { revives: [1, 2], advancedHealing: false }; }
    if (input.trainingDifficulty === "hard") { return { revives: [2, 2], advancedHealing: false }; }
    return null;
  }
  if (input.contractKey !== "gym") {
    return null;
  }
  gym = kantoGymCityByKey(String(input.gymKey || ""));
  badgeIndex = Number(gym && gym.badgeIndex);
  if (!gym || gym.key !== input.gymKey || !Number.isInteger(badgeIndex)) { return null; }
  if (badgeIndex < 2) { return { revives: [1, 2], advancedHealing: false }; }
  if (badgeIndex < 4) { return { revives: [2, 2], advancedHealing: false }; }
  if (badgeIndex < 6) { return { revives: [2, 2], advancedHealing: true }; }
  return null;
}

export function authoritativeNpcItemsForBattle(input) {
  input = input || {};
  var profile = npcItemProfile(input);
  if (!profile) {
    return [];
  }
  return AUTOMATIC_NPC_ITEMS.filter(function (item) {
    return profile.advancedHealing
      || (item.index !== hyper_potion.index && item.index !== max_potion.index && item.index !== full_restore.index);
  }).map(function (item) {
    var quantity = NPC_ITEM_QUANTITY;
    if (item.index === revive.index) { quantity = profile.revives[0]; }
    if (item.index === max_revive.index) { quantity = profile.revives[1]; }
    return [item.index, quantity];
  });
}
