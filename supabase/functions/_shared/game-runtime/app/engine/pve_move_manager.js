import { pveMoveCategoriesFor } from "../data/pve-move-categories.js";
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
} from "../data/items.js";
import { combatantHasCurableStatus } from "./held-items.js";
import { random } from "./deterministic-rng.js";

var RANDOM_MOVE_CHANCE = 0.2;
var DAMAGE_MOVE_CHANCE = 0.8;
var DAMAGE_PERCENTAGE_PREFIX = "damagePercentage";
var DAMAGE_NO_PERCENTAGE_CATEGORIES = [
  "damageNoPercentagePriority1",
  "damageNoPercentagePriority2",
  "damageNoPercentagePriority3",
  "damageNoPercentagePriority4"
];
var NPC_REVIVE_ITEM_INDEXES = [revive.index, max_revive.index];
var NPC_HP_ITEM_INDEXES = [potion.index, super_potion.index, hyper_potion.index, max_potion.index];
var NPC_STATUS_ITEM_INDEXES = [full_heal.index, awakening.index, paralyze_heal.index, ice_heal.index, antidote.index, burn_heal.index];
var NPC_ALLOWED_ITEM_INDEXES = NPC_REVIVE_ITEM_INDEXES.concat(NPC_HP_ITEM_INDEXES, [full_restore.index], NPC_STATUS_ITEM_INDEXES);

export function choosePveAction(context) {
  var actions = context.availableActions || [];
  var moves = moveActions(actions);
  var items = itemActions(actions);
  var itemAction = choosePveItemAction(context, items);

  if (itemAction) {
    return itemAction;
  }

  if (!moves.length) {
    return chooseRandomAction(actions);
  }

  return choosePveMoveAction(context, moves);
}

function choosePveMoveAction(context, moves) {
  var candidates;
  var damageCandidates;
  var nonDamageCandidates;

  if (random() < RANDOM_MOVE_CHANCE) {
    return chooseRandomAction(moves);
  }

  candidates = usefulMoveCandidates(context, moves);
  damageCandidates = candidatesWithDamage(candidates);
  if (!candidates.length || !damageCandidates.length) {
    return chooseRandomAction(moves);
  }

  nonDamageCandidates = candidatesWithNonDamage(candidates);
  if (!nonDamageCandidates.length || random() < DAMAGE_MOVE_CHANCE) {
    return chooseDamageMove(damageCandidates) || chooseRandomAction(moves);
  }

  return chooseRandomCandidate(nonDamageCandidates) || chooseRandomAction(moves);
}

function moveActions(actions) {
  return (actions || []).filter(function (action) {
    return action && action.type === "move" && action.move;
  });
}

function itemActions(actions) {
  return (actions || []).filter(function (action) {
    return action && action.type === "item";
  });
}

function choosePveItemAction(context, items) {
  var allowedItems = allowedNpcItemActions(items, NPC_ALLOWED_ITEM_INDEXES);
  var reviveAction;
  var survivalAction;
  var statusAction;
  if (!allowedItems.length || !context || !context.battleManager) {
    return null;
  }

  reviveAction = chooseReviveAction(context, allowedItems);
  if (reviveAction) {
    return reviveAction;
  }

  survivalAction = chooseSurvivalAction(context, allowedItems);
  if (survivalAction.handled) {
    return survivalAction.action;
  }

  statusAction = chooseStatusCureAction(context, allowedItems);
  if (statusAction) {
    return statusAction;
  }

  return null;
}

function chooseSurvivalAction(context, items) {
  var manager = context.battleManager;
  var npcActive = context.attacker;
  var playerActive = context.defender;
  var damage = manager.maxPotentialMoveDamage(playerActive, npcActive);
  var threshold = damage + 1;
  var action;
  if (!npcActive || !npcActive.pokemon || npcActive.hp > damage) {
    return { handled: false, action: null };
  }
  if (threshold > npcActive.pokemon.maxHp) {
    return { handled: true, action: null };
  }
  if (combatantHasCurableStatus(npcActive)) {
    action = itemActionForTarget(items, npcActive, full_restore.index);
    return { handled: true, action: action && healedHp(action.item, npcActive) >= threshold ? action : null };
  }
  action = NPC_HP_ITEM_INDEXES.map(function (itemIndex) {
    return itemActionForTarget(items, npcActive, itemIndex);
  }).find(function (candidate) {
    return candidate && healedHp(candidate.item, npcActive) >= threshold;
  });
  return { handled: true, action: action || null };
}

function healedHp(item, combatant) {
  var currentHp = Number(combatant && combatant.hp) || 0;
  var maxHp = Number(combatant && combatant.pokemon && combatant.pokemon.maxHp) || 0;
  var value = Number(item && item.value);
  if (item && item.value === "max") {
    return maxHp;
  }
  return Math.min(maxHp, currentHp + (Number.isFinite(value) ? value : 0));
}

function allowedNpcItemActions(items, allowedIndexes) {
  return (items || []).filter(function (action) {
    var itemIndex = Number(action && action.item && action.item.index);
    return allowedIndexes.indexOf(itemIndex) !== -1;
  });
}

function chooseReviveAction(context, items) {
  var manager = context.battleManager;
  var npcActive = context.attacker;
  var playerActive = context.defender;
  var action = bestReviveAction(items);
  var playerCanKoNpc;
  if (!action) {
    return null;
  }

  playerCanKoNpc = manager.combatantCanKo(playerActive, npcActive);
  if (playerCanKoNpc && manager.livingCombatantCount(manager.enemyTeam) <= 1) {
    return action;
  }
  if (!playerCanKoNpc) {
    return action;
  }
  if (manager.combatantWillBeBlockedByStatus(playerActive)) {
    return action;
  }
  return null;
}

function bestReviveAction(items) {
  var reviveActions = (items || []).filter(function (action) {
    return action && action.target && action.target.isFainted && action.target.isFainted()
      && NPC_REVIVE_ITEM_INDEXES.indexOf(Number(action.item && action.item.index)) !== -1;
  });
  if (!reviveActions.length) {
    return null;
  }
  return reviveActions.slice().sort(compareReviveActions)[0];
}

function compareReviveActions(left, right) {
  return compareCombatantPriority(right.target, left.target)
    || compareReviveItemPriority(left.item, right.item);
}

function compareCombatantPriority(left, right) {
  var leftLevel = Number(left && left.pokemon && left.pokemon.level) || 0;
  var rightLevel = Number(right && right.pokemon && right.pokemon.level) || 0;
  var leftMaxHp = Number(left && left.pokemon && left.pokemon.maxHp) || 0;
  var rightMaxHp = Number(right && right.pokemon && right.pokemon.maxHp) || 0;
  return leftLevel - rightLevel || leftMaxHp - rightMaxHp;
}

function compareReviveItemPriority(left, right) {
  return reviveItemPriority(left) - reviveItemPriority(right);
}

function reviveItemPriority(item) {
  return Number(item && item.index) === max_revive.index ? 0 : 1;
}

function chooseStatusCureAction(context, items) {
  var manager = context.battleManager;
  var npcActive = context.attacker;
  var specificItemIndex;
  if (!npcActive) {
    return null;
  }
  specificItemIndex = specificStatusCureItemIndex(npcActive);
  if (wouldFaintFromStatusTick(npcActive)) {
    return itemActionForTarget(items, npcActive, specificItemIndex)
      || itemActionForTarget(items, npcActive, full_heal.index);
  }
  if (!manager.combatantWillBeBlockedByStatus(npcActive) || playerHasStatusThreat(context.defender)) {
    return null;
  }
  return itemActionForTarget(items, npcActive, specificItemIndex)
    || itemActionForTarget(items, npcActive, full_heal.index);
}

function wouldFaintFromStatusTick(combatant) {
  var status = combatant && combatant.status;
  var tickDamage;
  if (status !== "psn" && status !== "brn") {
    return false;
  }
  tickDamage = Math.max(1, Math.floor(Number(combatant.pokemon && combatant.pokemon.maxHp) / 8));
  return Number(combatant.hp) <= tickDamage;
}

function playerHasStatusThreat(playerActive) {
  return Boolean(playerActive && playerActive.pokemon && (playerActive.pokemon.moves || []).some(function (move) {
    var categories = pveMoveCategoriesFor(move);
    return categories.indexOf("status") !== -1 || categories.indexOf("damagePercentageStatus") !== -1;
  }));
}

function specificStatusCureItemIndex(combatant) {
  var status = combatant && combatant.status;
  if (status === "slp") { return awakening.index; }
  if (status === "frz") { return ice_heal.index; }
  if (status === "par_block" || status === "par_free") { return paralyze_heal.index; }
  if (status === "psn") { return antidote.index; }
  if (status === "brn") { return burn_heal.index; }
  return null;
}

function itemActionForTarget(items, target, itemIndex) {
  if (!itemIndex) {
    return null;
  }
  return (items || []).find(function (action) {
    return action && action.target === target && Number(action.item && action.item.index) === Number(itemIndex);
  }) || null;
}

function usefulMoveCandidates(context, moves) {
  return (moves || []).map(function (action) {
    return {
      action: action,
      categories: pveMoveCategoriesFor(action.move).filter(function (category) {
        return isUsefulCategory(context, category);
      })
    };
  }).filter(function (candidate) {
    return candidate.categories.length > 0;
  });
}

function isUsefulCategory(context, category) {
  if (category === "noUtility") { return false; }
  if (category === "utility") { return true; }
  if (category === "status") { return !hasStatus(context.defender); }
  if (category === "statSelfAtk") { return !hasAttackBuff(context.attacker); }
  if (category === "statSelfDef") { return !hasDefenseBuff(context.attacker); }
  if (category === "statEnemyAtk") { return !hasAttackNerf(context.defender); }
  if (category === "statEnemyDef") { return !hasDefenseNerf(context.defender); }
  if (category === "gainHP") { return canGainHp(context.attacker); }
  if (category === "damagePercentageOther") { return hasPositivePercentage(context.attacker); }
  if (isDamagePercentageCategory(category)) {
    return !hasPositivePercentage(context.attacker) || isUsefulDamagePercentageCategory(context, category);
  }
  return DAMAGE_NO_PERCENTAGE_CATEGORIES.indexOf(category) !== -1;
}

function isUsefulDamagePercentageCategory(context, category) {
  if (category === "damagePercentageStatus") { return !hasStatus(context.defender); }
  if (category === "damagePercentageStatSelfAtk") { return !hasAttackBuff(context.attacker); }
  if (category === "damagePercentageStatSelfDef") { return !hasDefenseBuff(context.attacker); }
  if (category === "damagePercentageStatEnemyAtk") { return !hasAttackNerf(context.defender); }
  if (category === "damagePercentageStatEnemyDef") { return !hasDefenseNerf(context.defender); }
  return false;
}

function candidatesWithDamage(candidates) {
  return (candidates || []).filter(function (candidate) {
    return candidate.categories.some(isDamageCategory);
  });
}

function candidatesWithNonDamage(candidates) {
  return (candidates || []).filter(function (candidate) {
    return candidate.categories.some(function (category) {
      return !isDamageCategory(category);
    });
  });
}

function chooseDamageMove(candidates) {
  var percentageMoves = candidatesWithCategoryPrefix(candidates, DAMAGE_PERCENTAGE_PREFIX);
  var selected;
  if (percentageMoves.length) {
    return chooseRandomAction(percentageMoves);
  }

  DAMAGE_NO_PERCENTAGE_CATEGORIES.some(function (category) {
    var moves = candidatesWithCategory(candidates, category);
    selected = moves.length ? chooseRandomAction(moves) : null;
    return Boolean(selected);
  });
  return selected;
}

function chooseRandomCandidate(candidates) {
  var candidate = chooseRandomAction(candidates);
  return candidate ? candidate.action : null;
}

function candidatesWithCategory(candidates, category) {
  return uniqueCandidateActions((candidates || []).filter(function (candidate) {
    return candidate.categories.indexOf(category) !== -1;
  }));
}

function candidatesWithCategoryPrefix(candidates, prefix) {
  return uniqueCandidateActions((candidates || []).filter(function (candidate) {
    return candidate.categories.some(function (category) {
      return category.indexOf(prefix) === 0;
    });
  }));
}

function uniqueCandidateActions(candidates) {
  return (candidates || []).reduce(function (actions, candidate) {
    if (candidate && actions.indexOf(candidate.action) === -1) {
      actions.push(candidate.action);
    }
    return actions;
  }, []);
}

function isDamageCategory(category) {
  return typeof category === "string" && category.indexOf("damage") === 0;
}

function isDamagePercentageCategory(category) {
  return typeof category === "string" && category.indexOf(DAMAGE_PERCENTAGE_PREFIX) === 0;
}

function chooseRandomAction(actions) {
  return actions[Math.floor(random() * actions.length)];
}

function hasStatus(combatant) {
  return Boolean(combatant && (combatant.status !== null || combatant.sleepCounter || combatant.confCounter));
}

function hasAttackBuff(combatant) {
  return Boolean(combatant && combatant.atkBuff > 0);
}

function hasDefenseBuff(combatant) {
  return Boolean(combatant && combatant.defBuff > 0);
}

function hasAttackNerf(combatant) {
  return Boolean(combatant && combatant.atkNerf > 0);
}

function hasDefenseNerf(combatant) {
  return Boolean(combatant && combatant.defNerf > 0);
}

function canGainHp(combatant) {
  return Boolean(combatant && combatant.pokemon && combatant.hp < combatant.pokemon.maxHp);
}

function hasPositivePercentage(combatant) {
  return Boolean(combatant && combatant.team && combatant.team.percentage);
}
