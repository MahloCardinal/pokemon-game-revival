import {
  antidoto,
  antigelo,
  antiscottatura,
  antiparalisi,
  cura_totale,
  iperpozione,
  pozione,
  pozione_max,
  ricarica_totale,
  revitalizzante,
  revitalizzante_max,
  superpozione,
  sveglia
} from "./items.js";
import { kantoGymCityByKey } from "./gyms.js";

var NPC_ITEM_QUANTITY = 3;
var AUTOMATIC_NPC_ITEMS = [
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
  revitalizzante,
  revitalizzante_max
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
    if (item.index === revitalizzante.index) { quantity = counts[0]; }
    if (item.index === revitalizzante_max.index) { quantity = counts[1]; }
    return [item.index, quantity];
  });
}
