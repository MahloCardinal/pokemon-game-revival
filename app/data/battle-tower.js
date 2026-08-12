export var BATTLE_TOWER_CONTRACT = "battle_tower";
export var BATTLE_TOWER_RULES = Object.freeze([
  Object.freeze({ firstChallenge: 1, lastChallenge: 2, levelRule: "average", moveTier: 1, statTier: 1, heldItemTier: 0 }),
  Object.freeze({ firstChallenge: 3, lastChallenge: 6, levelRule: "highest", moveTier: 3, statTier: 1, heldItemTier: 3 }),
  Object.freeze({ firstChallenge: 7, lastChallenge: 9, levelRule: "highest", moveTier: 7, statTier: 7, heldItemTier: 7 }),
  Object.freeze({ firstChallenge: 10, lastChallenge: Infinity, levelRule: "highest", moveTier: 7, statTier: 10, heldItemTier: 7, requireTypeCoverage: true })
]);

export var BATTLE_TOWER_BASE_HELD_ITEMS = Object.freeze({
  primary: Object.freeze([229, 238, 237]),
  secondary: Object.freeze([220, 308])
});

export var BATTLE_TOWER_ADVANCED_HELD_ITEMS = Object.freeze([232, 230, 235, 218]);

export var BATTLE_TOWER_MOVE_EXCLUSIONS = Object.freeze({
  3: Object.freeze(["utility", "noUtility", "damageNoPercentagePriority4"]),
  7: Object.freeze(["utility", "noUtility", "damageNoPercentagePriority4", "gainHP", "damageNoPercentagePriority3"])
});

export function battleTowerRuleForChallenge(challenge) {
  var normalizedChallenge = Math.max(1, Math.floor(Number(challenge) || 1));
  return BATTLE_TOWER_RULES.find(function (rule) {
    return normalizedChallenge >= rule.firstChallenge && normalizedChallenge <= rule.lastChallenge;
  }) || BATTLE_TOWER_RULES[BATTLE_TOWER_RULES.length - 1];
}

export function battleTowerPointsForWins(wins) {
  var normalizedWins = Math.max(0, Math.floor(Number(wins) || 0));
  return normalizedWins + (normalizedWins >= 7 ? 20 : 0) + (normalizedWins >= 10 ? 50 : 0);
}
