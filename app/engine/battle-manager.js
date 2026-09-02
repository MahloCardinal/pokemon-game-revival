import { TYPE_CHART } from "../data/type-chart.js";
import { getInventoryItemByIndex, ItemCategory, ItemSubcategory } from "../data/items.js";
import { HeldItemTriggerContext, clearCombatantStatus, combatantHasCurableStatus, getActiveHeldItem, heldItemHasEffect, heldItemMultiplierValue, itemCanCureStatus, runHeldItemTrigger } from "./held-items.js";
import * as m from "../data/moves.js";
import { createMove } from "./moves.js";
import { choosePveAction } from "./pve_move_manager.js";
import { random } from "./deterministic-rng.js";
import { battleEvent, battleItemRef, battleMoveRef, battleSpeciesRef, battleStatusRef, battleTeamRef } from "./battle-events.js";

export function BattleManager(playerTeam, enemyTeam) {
  this.playerTeam = playerTeam;
  this.enemyTeam = enemyTeam;
  playerTeam.battleManager = this;
  enemyTeam.battleManager = this;
  this.turn = 1;
  this.firstActionInTurn = true;
  this.log = [];
  this.usedItems = {};
  this.enemyUsedItems = {};
  this.battleOver = false;
  this.battleFled = false;
  this.battleType = "";
  this.firstActor = "player";
  this.weather = null;
  this.weatherJustSet = false;
  this.playerNeedsSwitch = false;
  this.playerPostMoveSwitch = false;
  this.replacementFlow = null;
  this.KOStatus = null;
  this.expEvents = [];
  this.itemReturnSnapshots = [];
  this.lastResolvedMoveIndex = null;
  this.lastResolvedType = null;
  this.lastResolvedMoveWasWeather = false;
  this.lastPlayerResolvedMoveIndex = null;
  this.lastPlayerResolvedType = null;
  this.lastPlayerActionSkipped = false;
  this.weatherMoveUsedLastAction = { player: false, npc: false };
  this.adminControlled = false;
  this.waitingFor = "player";
  this.npcNeedsSwitch = false;
  this.npcItems = [];
  this._trainerActionContext = null;
  this._resolvedKoCombatants = [];
  this.initialEntry = { phase: "ready", order: [], nextActor: null, entered: { player: true, npc: true }, resolved: { player: true, npc: true } };
}

BattleManager.prototype.canPlayerFlee = function () {
  return String(this.battleType || "").indexOf("capture_") === 0;
};

BattleManager.prototype.emit = function (payload) {
  if (payload && typeof payload.key === "string" && payload.key) {
    this.log.push(payload);
  }
};

BattleManager.prototype.emitEvents = function (events) {
  (Array.isArray(events) ? events : []).forEach(function (event) {
    this.emit(event);
  }, this);
};

BattleManager.prototype.capturePresentationFrame = function (actor) {
  if (typeof this.onPresentationFrame === "function") {
    this.onPresentationFrame(actor);
  }
};

BattleManager.prototype.consumeExpEvents = function () {
  if (!this.expEvents.length) {
    return [];
  }
  var copy = this.expEvents.slice();
  this.expEvents = [];
  return copy;
};

BattleManager.prototype.trackUsedItem = function (item, owner) {
  var targetMap;
  if (!item || !item.key) {
    return;
  }
  targetMap = owner === "enemy" || (owner && owner.team === this.enemyTeam)
    ? this.enemyUsedItems
    : this.usedItems;
  targetMap[item.key] = (targetMap[item.key] || 0) + 1;
};

BattleManager.prototype.normalizedActor = function (actor) {
  return actor === "npc" || actor === "enemy" ? "npc" : "player";
};

BattleManager.prototype.normalizedFirstActor = function () {
  return this.normalizedActor(this.firstActor);
};

BattleManager.prototype.teamForActor = function (actor) {
  return this.normalizedActor(actor) === "npc" ? this.enemyTeam : this.playerTeam;
};

BattleManager.prototype.opponentTeamForActor = function (actor) {
  return this.normalizedActor(actor) === "npc" ? this.playerTeam : this.enemyTeam;
};

BattleManager.prototype.actorForTeam = function (team) {
  return team === this.enemyTeam ? "npc" : "player";
};

BattleManager.prototype.opponentActor = function (actor) {
  return this.normalizedActor(actor) === "npc" ? "player" : "npc";
};

BattleManager.prototype.beginTrainerAction = function (actor, combatant, kind) {
  this._resolvedKoCombatants = [];
  this._trainerActionContext = {
    actor: this.normalizedActor(actor),
    combatant: combatant || null,
    kind: kind || "",
    pendingAtStart: combatant ? combatant.pendingDelayedStatus : null,
    resolvedMove: null
  };
};

BattleManager.prototype.recordTrainerActionMove = function (combatant) {
  if (this._trainerActionContext && this._trainerActionContext.combatant === combatant) {
    this._trainerActionContext.resolvedMove = this.lastResolvedMoveIndex ? combatant.turnBeforeMoveUsed : null;
  }
};

BattleManager.prototype.syncBatonPassStatus = function (combatant) {
  var stats = combatant && combatant.team && combatant.team.batonPassStats;
  if (!stats) {
    return;
  }
  stats.status = combatant.status;
  stats.sleepCounter = combatant.sleepCounter || 0;
  stats.sleepDuration = combatant.sleepDuration || 3;
  stats.slpSource = combatant.slpSource || null;
  stats.confCounter = combatant.confCounter || 0;
  stats.pendingDelayedStatus = combatant.pendingDelayedStatus ? Object.assign({}, combatant.pendingDelayedStatus) : null;
};

BattleManager.prototype.advanceDelayedStatusAfterAction = function (combatant, pendingAtStart) {
  var pending = combatant && combatant.pendingDelayedStatus;
  var before;
  if (!combatant || !pending || pending !== pendingAtStart) {
    this.syncBatonPassStatus(combatant);
    return;
  }
  pending.delay = Math.max(0, (Number(pending.delay) || 0) - 1);
  if (pending.delay > 0 || combatant.status !== null || combatant.hp <= 0) {
    this.syncBatonPassStatus(combatant);
    return;
  }
  before = statusSnapshot(combatant);
  combatant.status = pending.status;
  combatant.sleepCounter = pending.sleepCounter || 0;
  combatant.sleepDuration = pending.sleepDuration || 3;
  combatant.confCounter = pending.confCounter || 0;
  combatant.slpSource = pending.source || null;
  combatant.pendingDelayedStatus = null;
  if (combatant.status === "slp") {
    this.emit(battleEvent("status.fellAsleep", { pokemon: battleSpeciesRef(combatant) }));
  } else {
    this.emit(battleEvent("status.applied", { pokemon: battleSpeciesRef(combatant), status: battleStatusRef(combatant.status) }));
  }
  runHeldItemTrigger(this, "healStatusBerry", HeldItemTriggerContext.healStatusBerry(combatant, before));
  this.syncBatonPassStatus(combatant);
};

BattleManager.prototype.completeTrainerAction = function () {
  var context = this._trainerActionContext;
  var opponent;
  if (!context) {
    return;
  }
  this._trainerActionContext = null;
  if (context.combatant) {
    context.combatant.turnBeforeMoveUsed = context.resolvedMove || null;
    this.advanceDelayedStatusAfterAction(context.combatant, context.pendingAtStart);
  }
  opponent = this.opponentTeamForActor(context.actor).getActive();
  runHeldItemTrigger(this, "opponentActionResolved", HeldItemTriggerContext.opponentActionResolved(opponent));
};

BattleManager.prototype.isWeatherMoveBlocked = function (actor, move) {
  return Boolean(move && move.setWeather && this.weatherMoveUsedLastAction[this.normalizedActor(actor)]);
};

BattleManager.prototype.recordWeatherMoveAction = function (actor, usedWeatherMove) {
  this.weatherMoveUsedLastAction[this.normalizedActor(actor)] = Boolean(usedWeatherMove);
};

BattleManager.prototype.waitingForActor = function (actor) {
  return this.normalizedActor(actor) === "npc" ? "admin" : "player";
};

BattleManager.prototype.applyReplacementFlowWaiting = function () {
  var currentActor;
  this.playerNeedsSwitch = false;
  this.npcNeedsSwitch = false;
  if (!this.replacementFlow) {
    return;
  }
  currentActor = this.replacementFlow.queue.length ? this.replacementFlow.queue[0] : this.replacementFlow.nextActor;
  if (!this.replacementFlow.queue.length) {
    this.replacementFlow = null;
  } else {
    this.playerNeedsSwitch = currentActor === "player";
    this.npcNeedsSwitch = currentActor === "npc";
  }
  if (currentActor) {
    this.waitingFor = this.waitingForActor(currentActor);
  }
};

BattleManager.prototype.hasPendingReplacementFlow = function () {
  return Boolean(this.replacementFlow && this.replacementFlow.queue.length);
};

BattleManager.prototype.startReplacementFlow = function (actionActor, faintedActors) {
  var normalizedActor = this.normalizedActor(actionActor);
  var opponent = this.opponentActor(normalizedActor);
  var queue = [];
  if (!this.adminControlled) {
    return false;
  }
  if (faintedActors[normalizedActor] && faintedActors[opponent]) {
    queue = [opponent, normalizedActor];
  } else if (faintedActors[normalizedActor]) {
    queue = [normalizedActor];
  } else if (faintedActors[opponent]) {
    queue = [opponent];
  }
  if (!queue.length) {
    return false;
  }
  this.replacementFlow = {
    queue: queue,
    nextActor: opponent
  };
  this.applyReplacementFlowWaiting();
  return true;
};

BattleManager.prototype.completeReplacementForActor = function (actor) {
  if (!this.replacementFlow || this.replacementFlow.queue[0] !== this.normalizedActor(actor)) {
    return;
  }
  this.replacementFlow.queue.shift();
  this.applyReplacementFlowWaiting();
};

BattleManager.prototype.canContinuePlayerRound = function () {
  return !this.playerNeedsSwitch && !this.playerPostMoveSwitch && !this.battleOver;
};

BattleManager.prototype.playerActionSucceeded = function (result) {
  return result !== false && (!result || result.ok !== false);
};

BattleManager.prototype.updateAdminControlledWaitingAfterPlayerAction = function (result) {
  if (!this.adminControlled || !this.playerActionSucceeded(result) || this.battleOver) {
    return;
  }
  if (this.hasPendingReplacementFlow()) {
    this.applyReplacementFlowWaiting();
    return;
  }
  if (this.playerNeedsSwitch || this.playerPostMoveSwitch) {
    this.waitingFor = "player";
    return;
  }
  this.waitingFor = "admin";
};

BattleManager.prototype.updateAdminControlledWaitingAfterNpcAction = function (result) {
  if (!this.adminControlled || !this.playerActionSucceeded(result) || this.battleOver) {
    return;
  }
  if (this.hasPendingReplacementFlow()) {
    this.applyReplacementFlowWaiting();
    return;
  }
  if (result && (result.waitingFor === "player" || result.waitingFor === "admin")) {
    this.waitingFor = result.waitingFor;
    return;
  }
  if (this.npcNeedsSwitch) {
    this.waitingFor = "admin";
    return;
  }
  this.waitingFor = "player";
};

BattleManager.prototype.resolveMoveAction = function (actor, move) {
  var normalizedActor = this.normalizedActor(actor);
  var attackerTeam = this.teamForActor(normalizedActor);
  var defenderTeam = this.opponentTeamForActor(normalizedActor);
  var attacker = attackerTeam.getActive();
  var defender = defenderTeam.getActive();
  if (!move || !attacker || !defender || attacker.isFainted()) {
    return false;
  }
  if (this.isWeatherMoveBlocked(normalizedActor, move)) {
    this.emit(battleEvent("move.weatherRepeatBlocked", { pokemon: battleSpeciesRef(attacker), move: battleMoveRef(move) }));
    return false;
  }
  this.clearRecentSwitchTarget(attackerTeam);
  this.beginTrainerAction(normalizedActor, attacker, "move");
  this.startTurn(attacker, defender);
  if (attacker.isFainted()) {
    this.clearRecentSwitchTarget(defenderTeam);
    return true;
  }
  this.executeMove(attacker, defender, move);
  this.recordTrainerActionMove(attacker);
  this.recordWeatherMoveAction(normalizedActor, this.lastResolvedMoveWasWeather);
  if (normalizedActor === "player") {
    this.lastPlayerResolvedMoveIndex = this.lastResolvedMoveIndex;
    this.lastPlayerResolvedType = this.lastResolvedType;
  }
  this.KOCheck(attacker, defender);
  this.endTurn(attackerTeam.getActive(), defenderTeam.getActive());
  return true;
};

BattleManager.prototype.resolveNpcItemAction = function (item, target) {
  var effectResult;
  this.clearRecentSwitchTarget(this.enemyTeam);
  this.beginTrainerAction("npc", this.enemyTeam.getActive(), "item");
  this.startTurn(this.enemyTeam.getActive(), this.playerTeam.getActive());
  this.recordWeatherMoveAction("npc", false);
  this.consumeChargeDamageMultiplier(this.enemyTeam.getActive());
  effectResult = this.applyItemEffect(item, target);
  if (!effectResult.ok) {
    this.emit(effectResult.event);
    this.endTurn(this.enemyTeam.getActive(), this.playerTeam.getActive());
    this.clearRecentSwitchTarget(this.playerTeam);
    return { ok: true, itemConsumed: false };
  }
  this.trackUsedItem(item, "enemy");
  this.consumeNpcItem(item);
  this.endTurn(this.enemyTeam.getActive(), this.playerTeam.getActive());
  this.clearRecentSwitchTarget(this.playerTeam);
  return { ok: true, itemConsumed: true };
};

BattleManager.prototype.resolveNpcAction = function () {
  var npcActive = this.enemyTeam.getActive();
  var action;
  if (!npcActive || npcActive.isFainted()) {
    return false;
  }
  action = this.chooseNpcAction(npcActive);
  if (action.type === "item") {
    return this.resolveNpcItemAction(action.item, action.target);
  }
  return this.resolveMoveAction("npc", action.move);
};

BattleManager.prototype.npcUseMove = function (move) {
  var manager = this;
  return this.resolveNpcRound(function () {
    return manager.resolveMoveAction("npc", move);
  }, false);
};

BattleManager.prototype.canNpcSwitchTo = function (index) {
  var active = this.enemyTeam.getActive();
  var target = this.enemyTeam.combatantList[index];
  if (!target) {
    return { ok: false, code: "target_not_found", event: battleEvent("switch.targetNotFound", {}) };
  }
  if (index === this.enemyTeam.activeIndex) {
    return { ok: false, code: "already_active", event: battleEvent("switch.alreadyActive", { pokemon: battleSpeciesRef(active) }) };
  }
  if (target.isFainted()) {
    return { ok: false, code: "target_fainted", event: battleEvent("switch.targetFainted", { pokemon: battleSpeciesRef(target) }) };
  }
  if (active && !active.isFainted()) {
    if (active.trappedTurns > 0 || active.trappedMoveIndex) {
      if (active.trappedTurns >= 99) {
        return { ok: false, code: "trapped", event: battleEvent("switch.trapped", { pokemon: battleSpeciesRef(active) }) };
      }
      return { ok: false, code: "trapped_turns", event: battleEvent("switch.trappedTurns", { pokemon: battleSpeciesRef(active), turns: active.trappedTurns }) };
    }
    if (active.rooted) {
      return { ok: false, code: "rooted", event: battleEvent("switch.rooted", { pokemon: battleSpeciesRef(active) }) };
    }
    if (active.pendingMove && !active.pendingMove.isForcedMove) {
      return { ok: false, code: "pending_move", event: battleEvent("switch.pendingMove", { pokemon: battleSpeciesRef(active), move: battleMoveRef(active.pendingMove) }) };
    }
  }
  return { ok: true };
};

BattleManager.prototype.resolveNpcSwitchAction = function (index, entryChoice) {
  var result;
  if (this.npcNeedsSwitch || this.enemyTeam.getActive().isFainted()) {
    result = this.enemyTeam.switchTo(index);
    if (!result.ok) {
      this.emit(result.event);
      return false;
    }
    this.emitEvents(result.events);
    this.checkHeldHpBerryOnEntry(this.enemyTeam.getActive());
    if (entryChoice) {
      this.applyEntryHeldItemChoice(this.enemyTeam.getActive(), entryChoice);
    }
    if (this.adminControlled) {
      if (this.enemyTeam.getActive().isFainted()) {
        if (this.enemyTeam.isAllFainted()) {
          this.npcNeedsSwitch = false;
          this.replacementFlow = null;
          this.emit(battleEvent("outcome.playerWon", {}));
          this.endBattle();
          return { ok: true, waitingFor: this.waitingFor };
        }
        this.npcNeedsSwitch = true;
        return { ok: true, waitingFor: "admin" };
      }
      if (!this.replacementFlow) {
        this.npcNeedsSwitch = false;
      }
      this.completeReplacementForActor("npc");
      return { ok: true, waitingFor: this.waitingFor };
    }
    this.npcNeedsSwitch = false;
    return true;
  }
  this.beginTrainerAction("npc", this.enemyTeam.getActive(), "switch");
  this.startTurn(this.enemyTeam.getActive(), this.playerTeam.getActive());
  this.recordWeatherMoveAction("npc", false);
  this.consumeChargeDamageMultiplier(this.enemyTeam.getActive());
  result = this.enemyTeam.switchTo(index);
  if (!result.ok) {
    this.emit(result.event);
    this.endTurn(this.enemyTeam.getActive(), this.playerTeam.getActive());
    return false;
  }
  this.emitEvents(result.events);
  this.checkHeldHpBerryOnEntry(this.enemyTeam.getActive());
  if (entryChoice) {
    this.applyEntryHeldItemChoice(this.enemyTeam.getActive(), entryChoice);
  }
  this.endTurn(this.enemyTeam.getActive(), this.playerTeam.getActive());
  this.clearRecentSwitchTarget(this.playerTeam);
  return true;
};

BattleManager.prototype.npcSwitch = function (index, entryChoice) {
  var manager = this;
  var validation = this.canNpcSwitchTo(index);
  if (!validation.ok) {
    this.emit(validation.event);
    return false;
  }
  return this.resolveNpcRound(function () {
    return manager.resolveNpcSwitchAction(index, entryChoice);
  }, false);
};

BattleManager.prototype.npcUseItem = function (item, target) {
  var manager = this;
  var validation = this.canUseItemOnTarget(item, target);
  if (!validation.ok) {
    return validation;
  }
  return this.resolveNpcRound(function () {
    return manager.resolveNpcItemAction(item, target);
  }, { ok: true, itemConsumed: false });
};

BattleManager.prototype.resolvePlayerRound = function (playerAction, skippedPlayerResult) {
  var playerResult;
  this.lastPlayerActionSkipped = false;
  if (this.adminControlled) {
    if (this.waitingFor && this.waitingFor !== "player") {
      this.lastPlayerActionSkipped = true;
      return skippedPlayerResult;
    }
    playerResult = playerAction();
    this.capturePresentationFrame("player");
    this.updateAdminControlledWaitingAfterPlayerAction(playerResult);
    return playerResult;
  }
  if (this.normalizedFirstActor() === "npc" && this.firstActionInTurn) {
    this.resolveNpcAction();
    this.capturePresentationFrame("npc");
    if (!this.canContinuePlayerRound()) {
      this.lastPlayerActionSkipped = true;
      if (!this.battleOver && this.playerNeedsSwitch) {
        this.emit(battleEvent("action.playerInterruptedForSwitch", {}));
      }
      return skippedPlayerResult;
    }
    playerResult = playerAction();
    this.capturePresentationFrame("player");
    return playerResult;
  }
  playerResult = playerAction();
  this.capturePresentationFrame("player");
  if (this.playerActionSucceeded(playerResult) && this.canContinuePlayerRound()) {
    this.resolveNpcAction();
    this.capturePresentationFrame("npc");
  }
  return playerResult;
};

BattleManager.prototype.resolveNpcRound = function (npcAction, skippedNpcResult) {
  var npcResult;
  if (this.adminControlled && this.waitingFor && this.waitingFor !== "admin") {
    return skippedNpcResult;
  }
  npcResult = npcAction();
  this.updateAdminControlledWaitingAfterNpcAction(npcResult);
  return npcResult;
};

BattleManager.prototype.playerUseMove = function (move) {
  var manager = this;
  this.lastPlayerResolvedMoveIndex = null;
  this.lastPlayerResolvedType = null;
  return this.resolvePlayerRound(function () {
    return manager.resolveMoveAction("player", move);
  }, false);
};

BattleManager.prototype.itemNeedsPokemonTarget = function (item) {
  if (!item || (item.category !== ItemCategory.BattleItem && item.category !== ItemCategory.Berry)) {
    return false;
  }
  return [ItemSubcategory.HealHp, ItemSubcategory.HealFull, ItemSubcategory.HealKo, ItemSubcategory.HealStatus].indexOf(item.subcategory) !== -1;
};

function subjectHasWeather(subject) {
  return Boolean(subject && subject.weather);
}

function clearWeatherSubject(subject) {
  if (!subject) {
    return false;
  }
  var hadWeather = subjectHasWeather(subject);
  if (subject.weather !== undefined) {
    subject.weather = null;
  }
  return hadWeather;
}

BattleManager.prototype.hasActiveWeather = function () {
  return [
    this,
    this.playerTeam,
    this.enemyTeam,
    this.playerTeam && this.playerTeam.getActive(),
    this.enemyTeam && this.enemyTeam.getActive()
  ].some(subjectHasWeather);
};

BattleManager.prototype.clearWeather = function () {
  var cleared = false;
  [
    this,
    this.playerTeam,
    this.enemyTeam,
    this.playerTeam && this.playerTeam.getActive(),
    this.enemyTeam && this.enemyTeam.getActive()
  ].forEach(function (subject) {
    cleared = clearWeatherSubject(subject) || cleared;
  });
  this.combatants().forEach(function (combatant) {
    combatant.weatherAtkBuff = 0;
    combatant.weatherDefBuff = 0;
  });
  return cleared;
};

BattleManager.prototype.sideForCombatant = function (combatant) {
  if (!combatant || !combatant.team) {
    return "";
  }
  return combatant.team === this.playerTeam ? "player" : "enemy";
};

BattleManager.prototype.indexForCombatant = function (combatant) {
  return combatant && combatant.team ? combatant.team.combatantList.indexOf(combatant) : -1;
};

BattleManager.prototype.combatantBySnapshotRef = function (snapshot) {
  var team;
  if (!snapshot || (snapshot.side !== "player" && snapshot.side !== "enemy") || !Number.isInteger(snapshot.index)) {
    return null;
  }
  team = snapshot.side === "player" ? this.playerTeam : this.enemyTeam;
  return team.combatantList[snapshot.index] || null;
};

BattleManager.prototype.heldItemsReturnAtBattleEnd = function () {
  return !this.canPlayerFlee();
};

BattleManager.prototype.snapshotHeldItemForReturn = function (combatant) {
  var side = this.sideForCombatant(combatant);
  var index = this.indexForCombatant(combatant);
  var exists;
  if (!this.heldItemsReturnAtBattleEnd() || !side || index < 0) {
    return;
  }
  exists = this.itemReturnSnapshots.some(function (entry) {
    return entry.side === side && entry.index === index;
  });
  if (!exists) {
    this.itemReturnSnapshots.push({
      side: side,
      index: index,
      heldItemIndex: Number(combatant.pokemon.heldItemIndex) || 0
    });
  }
};

BattleManager.prototype.restoreHeldItemTransfers = function () {
  this.itemReturnSnapshots.forEach(function (snapshot) {
    var combatant = this.combatantBySnapshotRef(snapshot);
    if (combatant && combatant.pokemon) {
      combatant.pokemon.heldItemIndex = Number(snapshot.heldItemIndex) || 0;
    }
  }, this);
  this.itemReturnSnapshots = [];
};

BattleManager.prototype.clearHazardMultiturnEffectsForBoots = function (combatant) {
  var clearedTrap = false;
  if (!combatant || !heldItemHasEffect(combatant, "hazard_multiturn_guard")) {
    return false;
  }
  if (combatant.team && combatant.team.spikesActive) {
    combatant.team.spikesActive = false;
    combatant.team.spikesLevel = 0;
    this.emit(battleEvent("hazard.bootsClearedSpikes", { pokemon: battleSpeciesRef(combatant) }));
  }
  if (combatant.trappedMoveIndex && m.isMultiturnEffectMoveIndex(combatant.trappedMoveIndex)) {
    combatant.trappedTurns = 0;
    combatant.trappedMoveIndex = 0;
    clearedTrap = true;
  }
  if (combatant.seedTarget !== null) {
    combatant.seedTarget = null;
    combatant.seedValue = 0;
    this.emit(battleEvent("hazard.bootsClearedLeechSeed", { pokemon: battleSpeciesRef(combatant) }));
  }
  if (clearedTrap) {
    this.emit(battleEvent("hazard.bootsClearedTrap", { pokemon: battleSpeciesRef(combatant) }));
  }
  return true;
};

BattleManager.prototype.stealHeldItem = function (attacker, defender) {
  var stolenItemIndex = Number(defender && defender.pokemon && defender.pokemon.heldItemIndex) || 0;
  if (!attacker || !defender || !attacker.pokemon || !defender.pokemon || attacker.pokemon.heldItemIndex || !stolenItemIndex) {
    return false;
  }
  this.snapshotHeldItemForReturn(attacker);
  this.snapshotHeldItemForReturn(defender);
  attacker.pokemon.heldItemIndex = stolenItemIndex;
  defender.pokemon.heldItemIndex = 0;
  this.clearHazardMultiturnEffectsForBoots(attacker);
  return true;
};

BattleManager.prototype.swapHeldItems = function (attacker, defender) {
  var attackerItemIndex = Number(attacker && attacker.pokemon && attacker.pokemon.heldItemIndex) || 0;
  var defenderItemIndex = Number(defender && defender.pokemon && defender.pokemon.heldItemIndex) || 0;
  if (!attacker || !defender || !attacker.pokemon || !defender.pokemon || !attackerItemIndex || !defenderItemIndex) {
    return false;
  }
  this.snapshotHeldItemForReturn(attacker);
  this.snapshotHeldItemForReturn(defender);
  attacker.pokemon.heldItemIndex = defenderItemIndex;
  defender.pokemon.heldItemIndex = attackerItemIndex;
  this.clearHazardMultiturnEffectsForBoots(attacker);
  this.clearHazardMultiturnEffectsForBoots(defender);
  return true;
};

BattleManager.prototype.recycleHeldItem = function (combatant) {
  var itemIndex = Number(combatant && combatant.initialHeldItemIndex) || 0;
  if (!combatant || !combatant.pokemon || combatant.pokemon.heldItemIndex || !itemIndex) {
    return false;
  }
  combatant.pokemon.heldItemIndex = itemIndex;
  combatant.lastConsumedHeldItemIndex = 0;
  this.clearHazardMultiturnEffectsForBoots(combatant);
  return true;
};

BattleManager.prototype.setWeather = function (weather) {
  this.weather = weather;
  this.weatherJustSet = false;
  this.applyWeatherBuffs(this.playerTeam.getActive());
  this.applyWeatherBuffs(this.enemyTeam.getActive());
};

BattleManager.prototype.canUseItemOnTarget = function (item, target) {
  if (!item) {
    return { ok: false, code: "item_not_found", event: battleEvent("item.notFound", {}) };
  }
  if (item.category !== ItemCategory.BattleItem && item.category !== ItemCategory.Berry) {
    return { ok: false, code: "item_unusable", event: battleEvent("item.unusable", { item: battleItemRef(item) }) };
  }
  if (this.itemNeedsPokemonTarget(item)) {
    if (!target) {
      return { ok: false, code: "target_required", event: battleEvent("item.targetRequired", { item: battleItemRef(item) }) };
    }
    if (target.isFainted() && item.subcategory !== ItemSubcategory.HealKo) {
      return { ok: false, code: "target_fainted", event: battleEvent("item.targetFainted", { pokemon: battleSpeciesRef(target) }) };
    }
    if (!target.isFainted() && item.subcategory === ItemSubcategory.HealKo) {
      return { ok: false, code: "target_not_fainted", event: battleEvent("item.targetNotFainted", { pokemon: battleSpeciesRef(target) }) };
    }
  }

  switch (item.subcategory) {
    case ItemSubcategory.HealHp:
      var currentHp = typeof target.hp === "number" ? target.hp : target.pokemon.maxHp;
      if (currentHp >= target.pokemon.maxHp) {
        return { ok: false, code: "hp_full", event: battleEvent("item.hpFull", { pokemon: battleSpeciesRef(target) }) };
      }
      return { ok: true };
    case ItemSubcategory.HealFull:
      var healStatusCurrentHp = typeof target.hp === "number" ? target.hp : target.pokemon.maxHp;
      if (healStatusCurrentHp >= target.pokemon.maxHp && !combatantHasCurableStatus(target)) {
        return { ok: false, code: "no_full_restore_effect", event: battleEvent("item.noFullRestoreEffect", { pokemon: battleSpeciesRef(target) }) };
      }
      return { ok: true };
    case ItemSubcategory.HealKo:
      return { ok: true };
    case ItemSubcategory.HealStatus:
      if (!itemCanCureStatus(item, target)) {
        return { ok: false, code: "no_curable_status", event: battleEvent("item.noCurableStatus", { pokemon: battleSpeciesRef(target), item: battleItemRef(item) }) };
      }
      return { ok: true };
    case ItemSubcategory.Weather:
      if (!this.hasActiveWeather()) {
        return { ok: false, code: "weather_inactive", event: battleEvent("item.weatherInactive", {}) };
      }
      return { ok: true };
    case ItemSubcategory.TypeProtection:
      return { ok: false, code: "held_only", event: battleEvent("item.heldOnly", { item: battleItemRef(item) }) };
    default:
      return { ok: false, code: "unsupported_subcategory", event: battleEvent("item.unsupported", { item: battleItemRef(item) }) };
  }
};

BattleManager.prototype.applyItemEffect = function (item, target) {
  var healsAllHp = item.value === "max";
  var value = healsAllHp ? 0 : Number(item.value) || 0;

  switch (item.subcategory) {
    case ItemSubcategory.HealHp:
      var currentHp = typeof target.hp === "number" ? target.hp : target.pokemon.maxHp;
      var healFraction = Number(item.healFraction);
      var healAmount = Number.isFinite(healFraction) && healFraction > 0
        ? Math.max(1, Math.floor(target.pokemon.maxHp * healFraction))
        : value;
      var nextHp = healsAllHp ? target.pokemon.maxHp : Math.min(target.pokemon.maxHp, currentHp + healAmount);
      var healed = nextHp - currentHp;
      target.hp = nextHp;
      this.emit(battleEvent("item.healedHp", { item: battleItemRef(item), pokemon: battleSpeciesRef(target), amount: healed }));
      return { ok: true };
    case ItemSubcategory.HealFull:
      var healStatusCurrentHp = typeof target.hp === "number" ? target.hp : target.pokemon.maxHp;
      var healStatusNextHp = healsAllHp ? target.pokemon.maxHp : Math.min(target.pokemon.maxHp, healStatusCurrentHp + value);
      var healStatusHealed = healStatusNextHp - healStatusCurrentHp;
      var hadStatus = combatantHasCurableStatus(target);
      target.hp = healStatusNextHp;
      target.status = null;
      target.sleepCounter = 0;
      target.sleepDuration = 3;
      target.confCounter = 0;
      target.slpSource = null;
      target.nightmareActive = false;
      this.emit(battleEvent(hadStatus ? "item.fullRestore" : "item.healedHp", { item: battleItemRef(item), pokemon: battleSpeciesRef(target), amount: healStatusHealed }));
      return { ok: true };
    case ItemSubcategory.HealKo:
      var revivedHp = item.value === "max"
        ? target.pokemon.maxHp
        : Math.max(1, Math.floor(target.pokemon.maxHp * (Number(item.healFraction) || 0.5)));
      target.hp = Math.min(target.pokemon.maxHp, revivedHp);
      this.emit(battleEvent("item.revived", { item: battleItemRef(item), pokemon: battleSpeciesRef(target), amount: target.hp }));
      return { ok: true };
    case ItemSubcategory.HealStatus:
      clearCombatantStatus(target, item);
      this.emit(battleEvent("item.curedStatus", { item: battleItemRef(item), pokemon: battleSpeciesRef(target) }));
      return { ok: true };
    case ItemSubcategory.Weather:
      this.clearWeather();
      this.emit(battleEvent("item.clearedWeather", { item: battleItemRef(item) }));
      return { ok: true };
    default:
      return { ok: false, code: "unsupported_subcategory", event: battleEvent("item.unsupported", { item: battleItemRef(item) }) };
  }
};

BattleManager.prototype.playerUseItem = function (item, target) {
  var manager = this;
  var validation = this.canUseItemOnTarget(item, target);
  if (!validation.ok) {
    return validation;
  }

  return this.resolvePlayerRound(function () {
    var effectResult;
    manager.clearRecentSwitchTarget(manager.playerTeam);
    manager.beginTrainerAction("player", manager.playerTeam.getActive(), "item");
    manager.startTurn(manager.playerTeam.getActive(), manager.enemyTeam.getActive());
    manager.recordWeatherMoveAction("player", false);
    manager.consumeChargeDamageMultiplier(manager.playerTeam.getActive());
    effectResult = manager.applyItemEffect(item, target);
    if (!effectResult.ok) {
      manager.emit(effectResult.event);
      manager.endTurn(manager.playerTeam.getActive(), manager.enemyTeam.getActive());
      manager.clearRecentSwitchTarget(manager.enemyTeam);
      return { ok: true, itemConsumed: false };
    }
    manager.trackUsedItem(item, "player");
    manager.endTurn(manager.playerTeam.getActive(), manager.enemyTeam.getActive());
    manager.clearRecentSwitchTarget(manager.enemyTeam);
    return { ok: true, itemConsumed: true };
  }, { ok: true, itemConsumed: false, actionSkipped: true });
};

BattleManager.prototype.playerUseBall = function (item) {
  var manager = this;
  return this.resolvePlayerRound(function () {
    manager.clearRecentSwitchTarget(manager.playerTeam);
    manager.beginTrainerAction("player", manager.playerTeam.getActive(), "ball");
    manager.startTurn(manager.playerTeam.getActive(), manager.enemyTeam.getActive());
    manager.recordWeatherMoveAction("player", false);
    manager.consumeChargeDamageMultiplier(manager.playerTeam.getActive());
    manager.emit(battleEvent("capture.ballFailed", { team: battleTeamRef(manager.playerTeam), item: battleItemRef(item) }));
    manager.endTurn(manager.playerTeam.getActive(), manager.enemyTeam.getActive());
    manager.clearRecentSwitchTarget(manager.enemyTeam);
    return { ok: true, itemConsumed: true };
  }, { ok: true, itemConsumed: false, actionSkipped: true });
};

BattleManager.prototype.applyWeatherBuffs = function (combatant) {
  if (!combatant || combatant.isFainted()) { return; }
  if (this.weather === "sand" && combatant.type.indexOf("rock") !== -1) {
    combatant.weatherAtkBuff = Math.floor(combatant.level / 2);
    combatant.weatherDefBuff = Math.floor(combatant.level / 2);
  } else if (this.weather === "hail" && combatant.type.indexOf("ice") !== -1) {
    combatant.weatherAtkBuff = Math.floor(combatant.level / 2);
    combatant.weatherDefBuff = Math.floor(combatant.level / 2);
  } else {
    combatant.weatherAtkBuff = 0;
    combatant.weatherDefBuff = 0;
  }
};

BattleManager.prototype.startTurn = function (attacker, defender) {
  var manager = this;

  function advanceTeamEffect(team, effectKey, counterKey, max, endEvent) {
    if (team[counterKey] === 0 && (!effectKey || team[effectKey] === 0)) {
      return;
    }
    if (team[counterKey] >= max) {
      team[counterKey] = 0;
      if (effectKey) {
        team[effectKey] = 0;
      }
      if (endEvent) {
        manager.emit(endEvent);
      }
      return;
    }
    team[counterKey] += 1;
  }

  function advanceCombatantStatus(combatant) {
    if (combatant.status === "cnf_free" || combatant.status === "cnf_block") {
      if (combatant.confCounter >= 5) {
        combatant.status = null;
        combatant.confCounter = 0;
        manager.emit(battleEvent("status.confusionEnded", { pokemon: battleSpeciesRef(combatant) }));
      } else {
        combatant.confCounter += 1;
      }
    } else if (combatant.status === "slp") {
      if (combatant.sleepCounter >= combatant.sleepDuration) {
        combatant.status = null;
        combatant.sleepCounter = 0;
        combatant.sleepDuration = 3;
        combatant.slpSource = null;
        combatant.nightmareActive = false;
        manager.emit(battleEvent("status.wokeUp", { pokemon: battleSpeciesRef(combatant) }));
      } else {
        combatant.sleepCounter += 1;
      }
    }
  }

  this.emit(battleEvent("turn.started", { number: this.turn, team: battleTeamRef(attacker.team) }, { group: "turn", turn: this.turn }));
  this.applyWeatherBuffs(attacker);
  this.applyWeatherBuffs(defender);
  advanceCombatantStatus(attacker);

  advanceTeamEffect(attacker.team, "teamAtkBuff", "buffAtkCounter", 5, battleEvent("team.attackBuffEnded", { team: battleTeamRef(attacker.team) }));
  advanceTeamEffect(attacker.team, "teamDefBuff", "buffDefCounter", 5, battleEvent("team.defenseBuffEnded", { team: battleTeamRef(attacker.team) }));
  advanceTeamEffect(attacker.team, null, "teamMistCounter", 5, battleEvent("team.statProtectionEnded", { team: battleTeamRef(attacker.team) }));
  advanceTeamEffect(attacker.team, null, "teamMoveBoostProtectCounter", 5, battleEvent("team.moveBoostProtectionEnded", { team: battleTeamRef(attacker.team) }));
  advanceTeamEffect(attacker.team, null, "teamStatusProtectCounter", 5, battleEvent("team.statusProtectionEnded", { team: battleTeamRef(attacker.team) }));
  advanceTeamEffect(attacker.team, null, "sleepImmunityCounter", 5, battleEvent("team.sleepImmunityEnded", { team: battleTeamRef(attacker.team) }));
  advanceTeamEffect(attacker.team, null, "teamBoostSuppressCounter", 1, battleEvent("team.boostSuppressionEnded", { team: battleTeamRef(attacker.team) }));

  if (attacker.team.wishHealAmount > 0 && attacker.team.wishDueAmount === 0) {
    attacker.team.wishDueAmount = attacker.team.wishHealAmount;
    attacker.team.wishDueSourceSpeciesKey = attacker.team.wishSourceSpeciesKey;
    attacker.team.wishHealAmount = 0;
    attacker.team.wishSourceSpeciesKey = "";
  }

  if (attacker.rooted) {
    var rootHeal = Math.floor(attacker.pokemon.maxHp / 2);
    attacker.hp = Math.min(attacker.hp + rootHeal, attacker.pokemon.maxHp);
    manager.emit(battleEvent("status.ingrainHeal", { pokemon: battleSpeciesRef(attacker), amount: rootHeal }));
  }
  if (attacker.trappedMoveIndex && attacker.trappedTurns < 99) {
    if (attacker.trappedTurns >= 4) {
      attacker.trappedTurns = 0;
      attacker.trappedMoveIndex = 0;
    } else {
      attacker.trappedTurns += 1;
    }
  }

  defender.turnBeforeDamageTaken = 0;

  [attacker, defender].forEach(function(c) {
    c._startOfTurnStatus = c.status;
    runHeldItemTrigger(this, "startTurn", HeldItemTriggerContext.startTurn(c));
  }, this);
};

function statusSnapshot(combatant) {
  return {
    status: combatant.status,
    sleepCounter: combatant.sleepCounter,
    sleepDuration: combatant.sleepDuration,
    confCounter: combatant.confCounter,
    slpSource: combatant.slpSource,
    pendingDelayedStatus: combatant.pendingDelayedStatus
  };
}

function restoreStatusSnapshot(combatant, snapshot) {
  combatant.status = snapshot.status;
  combatant.sleepCounter = snapshot.sleepCounter;
  combatant.sleepDuration = snapshot.sleepDuration || 3;
  combatant.confCounter = snapshot.confCounter;
  combatant.slpSource = snapshot.slpSource;
  combatant.pendingDelayedStatus = snapshot.pendingDelayedStatus ? Object.assign({}, snapshot.pendingDelayedStatus) : null;
}

BattleManager.prototype.combatants = function () {
  return this.playerTeam.combatantList.concat(this.enemyTeam.combatantList);
};

BattleManager.prototype.recentSwitchTargetForMove = function (defender, move) {
  var team = defender && defender.team;
  var index = team && Number.isInteger(team.lastSwitchedOutIndex) ? team.lastSwitchedOutIndex : NaN;
  var target = Number.isInteger(index) ? team.combatantList[index] : null;
  if (!move || move.key !== "pursuit" || !target || target === defender || target.isFainted()) {
    return null;
  }
  return target;
};

BattleManager.prototype.clearRecentSwitchTarget = function (team) {
  if (team) {
    team.lastSwitchedOutIndex = null;
  }
};

BattleManager.prototype.checkHeldHpBerryOnEntry = function (combatant) {
  this.clearHazardMultiturnEffectsForBoots(combatant);
  if (combatantHasCurableStatus(combatant)) {
    runHeldItemTrigger(this, "healStatusBerry", HeldItemTriggerContext.healStatusBerry(combatant, {
      status: null, sleepCounter: 0, sleepDuration: 3, confCounter: 0, slpSource: null, pendingDelayedStatus: combatant.pendingDelayedStatus
    }));
  }
  runHeldItemTrigger(this, "healHpBerry", HeldItemTriggerContext.healHpBerry(combatant));
  runHeldItemTrigger(this, "onEntry", HeldItemTriggerContext.onEntry(combatant));
};

BattleManager.prototype.entryHeldItemChoiceKind = function (combatant) {
  return runHeldItemTrigger(this, "entryChoiceKind", HeldItemTriggerContext.entryChoiceKind(combatant)).kind;
};

BattleManager.prototype.entryHeldItemChoiceEntries = function (combatant) {
  var kind = this.entryHeldItemChoiceKind(combatant);
  return runHeldItemTrigger(this, "entryChoiceEntries", HeldItemTriggerContext.entryChoiceEntries(combatant, kind)).entries;
};

BattleManager.prototype.applyEntryHeldItemChoice = function (combatant, choice) {
  return runHeldItemTrigger(this, "entryChoiceApply", HeldItemTriggerContext.entryChoiceApply(combatant, choice)).applied;
};

BattleManager.prototype.interceptDelayedStatus = function (combatant, before, move, damage, source, bypassDelay) {
  var pendingBefore = before.pendingDelayedStatus;
  var nextStatus = combatant.status;
  var delayedStatus;
  if (before.status !== null || nextStatus === null) {
    return;
  }

  if (bypassDelay) {
    return;
  }

  if (pendingBefore) {
    restoreStatusSnapshot(combatant, before);
    move.logKey = damage > 0 ? "dmg_status_waiting" : "status_waiting";
    move.delayedStatusTargetSpeciesKey = combatant.pokemon.speciesKey;
    return;
  }

  if (!heldItemHasEffect(combatant, "status_delay")) {
    return;
  }

  if (runHeldItemTrigger(this, "statusDelay", HeldItemTriggerContext.statusDelay(source, combatant)).ignored) {
    return;
  }

  delayedStatus = {
    status: nextStatus,
    sleepCounter: combatant.sleepCounter || 0,
    sleepDuration: combatant.sleepDuration || 3,
    confCounter: combatant.confCounter || 0,
    delay: 2,
    source: "lax_incense"
  };
  restoreStatusSnapshot(combatant, before);
  combatant.pendingDelayedStatus = delayedStatus;
  move.logKey = damage > 0 ? "dmg_status_delayed" : "status_delayed";
  move.delayedStatusKey = nextStatus;
  move.delayedStatusTargetSpeciesKey = combatant.pokemon.speciesKey;
};

BattleManager.prototype.consumeChargeDamageMultiplier = function (combatant) {
  if (!combatant) {
    return 1;
  }
  combatant.activeChargeDamageMultiplier = combatant.chargeDamageMultiplier || 1;
  combatant.chargeDamageMultiplier = 1;
  return combatant.activeChargeDamageMultiplier;
};

BattleManager.prototype.clearActiveChargeDamageMultiplier = function (combatant) {
  if (combatant) {
    combatant.activeChargeDamageMultiplier = 1;
  }
};

BattleManager.prototype.calculateMoveDamage = function (attacker, defender, move) {
  var basePower = move.power;
  var basePowerResult;

  this._lifeOrbCost = 0;
  basePowerResult = runHeldItemTrigger(this, "modifyBasePower", HeldItemTriggerContext.modifyBasePower(attacker, defender, move, basePower));
  basePower = basePowerResult.basePower;
  this._lifeOrbCost = basePowerResult.hpCost || 0;
  var typeMultiplier = this.typeEfficacy(attacker, defender);
  move.lastTypeEfficacy = typeMultiplier;
  var moveMultiplier = move.moveMult !== undefined ? move.moveMult : 1;
  var chargeDamageMultiplier = attacker.activeChargeDamageMultiplier || 1;
  var defenseMultiplier = move.defMult !== undefined ? move.defMult : 1;
  var attackBuff = Math.max(attacker.atkBuff, attacker.weatherAtkBuff, attacker.team.teamAtkBuff);
  var attackNerf;
  var defenseBuff;
  var defNerf;
  var heldItemMultiplier;
  var weatherPowerMod = 0;
  var attackAdjusted;
  var moveAdjusted;
  var typeAdjusted;
  var defenseAdjusted;
  var damage;

  move.boostSuppressed = false;
  if (defender.team.teamBoostSuppressCounter > 0 || defender.team.teamMoveBoostProtectCounter > 0) {
    move.boostSuppressed = moveMultiplier !== 1 || chargeDamageMultiplier !== 1;
    moveMultiplier = 1;
    chargeDamageMultiplier = 1;
  }

  attackNerf = attacker.getAtkNerfAndBrn();
  var attackerStatMods = runHeldItemTrigger(this, "statMods", HeldItemTriggerContext.statMods(attacker, {
    attackBuff: attackBuff,
    attackNerf: attackNerf
  }));
  attackBuff = attackerStatMods.attackBuff;
  attackNerf = attackerStatMods.attackNerf;
  if (this.weather === "sun" && attacker.type.indexOf("fire") !== -1) {
    attackNerf = 0;
  }

  defenseBuff = Math.max(defender.defBuff, defender.weatherDefBuff, defender.team.teamDefBuff);
  defNerf = defender.defNerf;
  var defenderStatMods = runHeldItemTrigger(this, "statMods", HeldItemTriggerContext.statMods(defender, {
    defenseBuff: defenseBuff,
    defNerf: defNerf
  }));
  defenseBuff = defenderStatMods.defenseBuff;
  defNerf = defenderStatMods.defNerf;
  if (this.weather === "sun" && defender.type.indexOf("fire") !== -1) {
    defNerf = 0;
  }

  heldItemMultiplier = runHeldItemTrigger(this, "damageMultiplier", HeldItemTriggerContext.damageMultiplier(attacker)).multiplier;
  if (this.weather === "sun") {
    if (attacker.type.indexOf("fire") !== -1) { weatherPowerMod = Math.floor(attacker.level / 2); }
    if (attacker.type.indexOf("water") !== -1) { weatherPowerMod = -Math.floor(attacker.level / 2); }
  } else if (this.weather === "rain") {
    if (attacker.type.indexOf("water") !== -1) { weatherPowerMod = Math.floor(attacker.level / 2); }
    if (attacker.type.indexOf("fire") !== -1) { weatherPowerMod = -Math.floor(attacker.level / 2); }
  }

  attackAdjusted = basePower + attackBuff - attackNerf + weatherPowerMod;
  moveAdjusted = attackAdjusted * moveMultiplier * chargeDamageMultiplier;
  typeAdjusted = moveAdjusted * typeMultiplier;
  defenseAdjusted = typeAdjusted - defenseBuff * defenseMultiplier + defNerf;
  damage = Math.floor(defenseAdjusted * heldItemMultiplier);
  damage = runHeldItemTrigger(this, "modifyDamage", HeldItemTriggerContext.modifyDamage(attacker, defender, move, damage, this.typeEfficacy(defender, attacker))).damage;

  return damage <= 0 ? 1 : damage;
};

BattleManager.prototype.executeMove = function (attacker, defender, move) {
  var defenderTeamForSwitch = defender && defender.team;
  var defenderActiveIndexBefore = defenderTeamForSwitch ? defenderTeamForSwitch.activeIndex : null;
  var pursuitTarget;
  this._lifeOrbCost = 0;
  this.lastResolvedMoveIndex = null;
  this.lastResolvedType = null;
  this.lastResolvedMoveWasWeather = false;
  this.consumeChargeDamageMultiplier(attacker);
  if (!this.moveStatusCheck(attacker, move)) {
    move.isSwitchReaction = false;
    move.forcedCopiedMoveIndex = null;
    move.forcedResolvedType = null;
    this.clearActiveChargeDamageMultiplier(attacker);
    this.clearRecentSwitchTarget(defenderTeamForSwitch);
    return;
  }

  pursuitTarget = this.recentSwitchTargetForMove(defender, move);
  move.isSwitchReaction = Boolean(pursuitTarget);
  if (pursuitTarget) {
    defender = pursuitTarget;
  }

  var hit = this.invulnerabilityCheck(defender, move);
  var damage = 0;
  var attackerStatusBefore;
  var defenderStatusBefore;
  var typeProtectLog = "";
  var statusProtectionLog = "";
  var attackerStatusWasReflected = false;
  var chargeDamageMultiplier = 1;
  var damageDrainMultiplier = 0;
  var heldItemAtMoveStart = getActiveHeldItem(attacker);
  var attackerStatusAtMoveStart = statusSnapshot(attacker);
  var defenderStatusAtMoveStart = statusSnapshot(defender);

  var percentageBefore = attacker.team ? attacker.team.percentage : undefined;
  var defenderHpBefore = defender.hp;
  var attackerStatusBeforeBefore = attacker.status;

  move.before(attacker, defender, hit);
  var effectiveMove = move.copiedMove || move;
  if (effectiveMove !== move && move.forcedResolvedType) {
    effectiveMove.forcedResolvedType = move.forcedResolvedType;
  }
  this.lastResolvedMoveIndex = effectiveMove && effectiveMove.index ? effectiveMove.index : null;
  this.lastResolvedMoveWasWeather = Boolean(effectiveMove && effectiveMove.setWeather);

  if (effectiveMove !== move) {
    effectiveMove.before(attacker, defender, hit);
  }

  if (heldItemAtMoveStart && heldItemAtMoveStart.effect === "damage_drain") {
    damageDrainMultiplier = heldItemMultiplierValue(heldItemAtMoveStart);
  }

  if (hit && heldItemHasEffect(defender, "hazard_multiturn_guard")
      && (m.isMultiturnEffectMoveIndex(effectiveMove.index) || effectiveMove.index === m.spikes.index)) {
    hit = false;
    effectiveMove.damagingMove = false;
  }

  runHeldItemTrigger(this, "ohkoProtect", HeldItemTriggerContext.ohkoProtect(defender, effectiveMove, defenderHpBefore));

  if (effectiveMove.damagingMove) {
    chargeDamageMultiplier = attacker.activeChargeDamageMultiplier || 1;
    damage = this.calculateMoveDamage(attacker, defender, effectiveMove);
    typeProtectLog = runHeldItemTrigger(this, "typeProtectBerry", HeldItemTriggerContext.typeProtectBerry(attacker, defender)).event;
    if (typeProtectLog) {
      damage = Math.max(1, Math.floor(damage / 2));
    }

    defender.wasHitSinceSwitch = true;
    var initialHp = defender.hp;
    var newHp = Math.max(0, initialHp - damage);

    if (defender.endure === true) {
      defender.endure = false;
      if (newHp === 0) {
        newHp = 1;
        this.emit(battleEvent("status.endured", { pokemon: battleSpeciesRef(defender) }));
      }
    }

    defender.hp = newHp;
    defender.turnBeforeDamageTaken = initialHp - newHp;

    this._lifeOrbCost = runHeldItemTrigger(this, "afterDamageApplied", HeldItemTriggerContext.afterDamageApplied(attacker, defender, effectiveMove, damage, this._lifeOrbCost)).hpCost || 0;
  }

  attackerStatusBefore = statusSnapshot(attacker);
  defenderStatusBefore = statusSnapshot(defender);

  effectiveMove.after(attacker, defender, hit);
  if (Number(effectiveMove.directDamage) > 0) {
    damage = Number(effectiveMove.directDamage);
    defender.turnBeforeDamageTaken = damage;
    defender.wasHitSinceSwitch = true;
  }
  if (attacker.pendingMove && attacker.pendingMove.isForcedMove) {
    if (attacker.pendingMoveTurns >= 3) {
      attacker.removePending();
      attacker.pendingMoveTurns = 0;
    } else {
      attacker.pendingMoveTurns += 1;
    }
  }
  if (damage > 0 && chargeDamageMultiplier > 1 && !effectiveMove.boostSuppressed && effectiveMove.logKey === "dmg") {
    effectiveMove.logKey = "dmg_double";
  }
  if (effectiveMove.boostSuppressed && effectiveMove.logKey === "dmg_double") {
    effectiveMove.logKey = "dmg";
  }
  if (effectiveMove.boostSuppressed && effectiveMove.logKey === "dmg_double_lost_atk_buff") {
    effectiveMove.logKey = "dmg_lost_atk_buff";
  }

  runHeldItemTrigger(this, "selfStatusChanged", HeldItemTriggerContext.selfStatusChanged(attacker, attackerStatusBeforeBefore));

  statusProtectionLog = runHeldItemTrigger(this, "statusProtection", HeldItemTriggerContext.statusProtection(defender, defenderStatusBefore)).event;

  this.lastResolvedType = effectiveMove.resolvedType || null;
  if (effectiveMove.setWeather) {
    this.setWeather(effectiveMove.setWeather);
  }
  if (effectiveMove.requestsBattleFlee) {
    if (attacker.team === this.playerTeam && this.canPlayerFlee()) {
      effectiveMove.logKey = "flee";
      this.battleFled = true;
      this.battleResultLines = [battleEvent("outcome.fled", { pokemon: battleSpeciesRef(attacker) })];
      this.endBattle();
    } else {
      effectiveMove.logKey = "fail";
    }
  }
  if (effectiveMove.requestsBattleSwitch && hit && attacker.team.batonPassStats) {
    if (attacker.team === this.playerTeam) {
      this.playerPostMoveSwitch = true;
    } else if (this.adminControlled) {
      this.npcNeedsSwitch = true;
      this.replacementFlow = { queue: ["npc"], nextActor: "player" };
      this.applyReplacementFlowWaiting();
    } else {
      var npcEnemySwitch = this.enemyTeam.switchRandom();
      if (npcEnemySwitch.ok) { this.emitEvents(npcEnemySwitch.events); }
    }
  }
  if (defender.magicCoatActive && hit && defender.status !== defenderStatusBefore.status && defenderStatusBefore.status === null) {
    var reflected = defender.status;
    var reflectedSleepDuration = defender.sleepDuration || 3;
    restoreStatusSnapshot(defender, defenderStatusBefore);
    attacker.status = reflected;
    attackerStatusWasReflected = true;
    if (reflected === "slp") {
      attacker.sleepCounter = 0;
      attacker.sleepDuration = reflectedSleepDuration;
    }
    this.emit(battleEvent("status.magicCoatReflected", { source: battleSpeciesRef(defender), target: battleSpeciesRef(attacker) }));
  }
  this.interceptDelayedStatus(defender, defenderStatusBefore, effectiveMove, damage, attacker, false);
  this.interceptDelayedStatus(
    attacker,
    attackerStatusBefore,
    effectiveMove,
    damage,
    defender,
    Boolean(effectiveMove.selfInducedStatusApplied) && !attackerStatusWasReflected
  );
  attacker.turnBeforeMoveUsed = effectiveMove;

  this.emit(effectiveMove.prepareEvent(attacker, defender, damage, effectiveMove.lastTypeEfficacy));
  if (effectiveMove.switchEvents) {
    this.emitEvents(effectiveMove.switchEvents);
    effectiveMove.switchEvents = null;
  }
  if (statusProtectionLog) {
    this.emit(statusProtectionLog);
  }
  if (typeProtectLog) {
    this.emit(typeProtectLog);
  }
  runHeldItemTrigger(this, "afterImmediateMoveResolved", HeldItemTriggerContext.afterImmediateMoveResolved(
    attacker, defender, Math.max(0, defenderHpBefore - defender.hp), damageDrainMultiplier
  ));
  runHeldItemTrigger(this, "healStatusBerry", HeldItemTriggerContext.healStatusBerry(defender, defenderStatusAtMoveStart));
  runHeldItemTrigger(this, "healStatusBerry", HeldItemTriggerContext.healStatusBerry(attacker, attackerStatusAtMoveStart));
  if (defenderHpBefore > defender.hp) {
    runHeldItemTrigger(this, "healHpBerry", HeldItemTriggerContext.healHpBerry(defender));
  }
  this.markMoveKoTrigger(attacker, defender, effectiveMove, defenderHpBefore);

  runHeldItemTrigger(this, "afterMoveResolved", HeldItemTriggerContext.afterMoveResolved(attacker, defender, percentageBefore));

  move.forcedCopiedMoveIndex = null;
  move.forcedResolvedType = null;
  move.isSwitchReaction = false;
  if (effectiveMove !== move) {
    effectiveMove.forcedResolvedType = null;
  }
  effectiveMove.directDamage = 0;
  effectiveMove.boostSuppressed = false;
  delete effectiveMove.selfInducedStatusApplied;
  if (effectiveMove !== move) {
    delete move.selfInducedStatusApplied;
  }
  if (!defenderTeamForSwitch || defenderTeamForSwitch.activeIndex === defenderActiveIndexBefore) {
    this.clearRecentSwitchTarget(defenderTeamForSwitch);
  }
  this.clearActiveChargeDamageMultiplier(attacker);
};

BattleManager.prototype.availableMoveActions = function (actor) {
  var normalizedActor = this.normalizedActor(actor);
  var active = this.teamForActor(normalizedActor).getActive();
  var manager = this;
  var available;
  if (!active || active.isFainted()) {
    return [];
  }
  if (active.pendingMove) {
    if (active.disabledMoves.indexOf(active.pendingMove.key) !== -1
      || this.isWeatherMoveBlocked(normalizedActor, active.pendingMove)) {
      return [];
    }
    var pendingSlot = active.pokemon.moves.indexOf(active.pendingMove);
    return [{ type: "move", move: active.pendingMove, moveSlot: pendingSlot >= 0 ? pendingSlot : 0 }];
  }
  available = active.pokemon.moves.map(function (move, slot) {
    return active.disabledMoves.indexOf(move.key) === -1
      && !manager.isWeatherMoveBlocked(normalizedActor, move)
      ? { type: "move", move: move, moveSlot: slot }
      : null;
  }).filter(Boolean);
  if (available.length) {
    return available;
  }
  if (!active.pokemon.moves.length) {
    return [];
  }
  return [{
    type: "move",
    moveSlot: 0,
    move: createMove(m.struggle, {
      power: active.pokemon.moves[0].power,
      stats: active.pokemon.moves[0].stats
    })
  }];
};

BattleManager.prototype.startInitialEntry = function () {
  this.initialEntry = {
    phase: "pending",
    order: this.normalizedFirstActor() === "npc" ? ["npc", "player"] : ["player", "npc"],
    nextActor: null,
    entered: { player: false, npc: false },
    resolved: { player: false, npc: false }
  };
  this.advanceInitialEntry();
};

BattleManager.prototype.initialEntryChoiceFor = function (actor) {
  var normalizedActor = this.normalizedActor(actor);
  var combatant = this.teamForActor(normalizedActor).getActive();
  var kind = this.entryHeldItemChoiceKind(combatant);
  var entries = kind ? this.entryHeldItemChoiceEntries(combatant) : [];
  return kind && entries.length ? { side: normalizedActor, kind: kind, entries: entries } : null;
};

BattleManager.prototype.advanceInitialEntry = function () {
  var state = this.initialEntry;
  var actor;
  var choice;
  var combatant;
  if (!state || state.phase === "ready" || state.phase === "awaiting_npc_opening") { return; }
  while ((actor = state.order.find(function (side) { return !state.resolved[side]; }))) {
    combatant = this.teamForActor(actor).getActive();
    if (!state.entered[actor]) {
      this.checkHeldHpBerryOnEntry(combatant);
      state.entered[actor] = true;
    }
    choice = this.initialEntryChoiceFor(actor);
    if (choice && (actor === "player" || this.adminControlled)) {
      state.phase = actor === "player" ? "awaiting_player_entry_choice" : "awaiting_admin_entry_choice";
      state.nextActor = actor;
      if (this.adminControlled) { this.waitingFor = actor === "npc" ? "admin" : "player"; }
      return;
    }
    if (choice) {
      this.applyEntryHeldItemChoice(combatant, choice.entries[Math.floor(random() * choice.entries.length)]);
    }
    state.resolved[actor] = true;
  }
  state.nextActor = null;
  if (this.normalizedFirstActor() === "npc" && !this.adminControlled) {
    state.phase = "awaiting_npc_opening";
  } else {
    state.phase = "ready";
    if (this.adminControlled) { this.waitingFor = this.normalizedFirstActor() === "npc" ? "admin" : "player"; }
  }
};

BattleManager.prototype.resolveInitialEntryChoice = function (actor, choice) {
  var normalizedActor = this.normalizedActor(actor);
  var state = this.initialEntry;
  var expectedPhase = normalizedActor === "npc" ? "awaiting_admin_entry_choice" : "awaiting_player_entry_choice";
  var combatant;
  if (!state || state.phase !== expectedPhase || state.nextActor !== normalizedActor) { return false; }
  combatant = this.teamForActor(normalizedActor).getActive();
  if (!this.applyEntryHeldItemChoice(combatant, choice)) { return false; }
  state.resolved[normalizedActor] = true;
  state.phase = "pending";
  state.nextActor = null;
  this.advanceInitialEntry();
  return true;
};

BattleManager.prototype.resolveNpcOpeningMove = function () {
  var state = this.initialEntry;
  var npcActive = this.enemyTeam.getActive();
  var actions;
  var action;
  if (!state || state.phase !== "awaiting_npc_opening" || this.adminControlled || !npcActive || npcActive.isFainted()) {
    return false;
  }
  actions = this.availableNpcMoveActions(npcActive);
  action = choosePveAction({
    battleManager: this, attacker: npcActive, defender: this.playerTeam.getActive(), availableActions: actions,
    enemyTeam: this.enemyTeam, playerTeam: this.playerTeam, npcItems: [], turn: this.turn, weather: this.weather, battleType: this.battleType
  });
  if (!action || action.type !== "move" || !action.move) { return false; }
  state.phase = "ready";
  state.nextActor = null;
  this.resolveMoveAction("npc", action.move);
  return true;
};

BattleManager.prototype.moveActionForSlot = function (actor, slot) {
  return this.availableMoveActions(actor).find(function (action) {
    return action.moveSlot === Number(slot);
  }) || null;
};

BattleManager.prototype.availableNpcMoveActions = function (npcActive) {
  if (npcActive !== this.enemyTeam.getActive()) {
    return [];
  }
  return this.availableMoveActions("npc");
};

BattleManager.prototype.availableNpcItemActions = function () {
  var manager = this;
  return (this.npcItems || []).reduce(function (actions, entry) {
    var item = getInventoryItemByIndex([entry], Number(entry[0]));
    if (!item) {
      return actions;
    }
    if (!manager.itemNeedsPokemonTarget(item)) {
      if (manager.canUseItemOnTarget(item, null).ok) {
        actions.push({ type: "item", item: item, target: null, targetIndex: null });
      }
      return actions;
    }
    manager.enemyTeam.combatantList.forEach(function (target, index) {
      if (target && manager.canUseItemOnTarget(item, target).ok) {
        actions.push({ type: "item", item: item, target: target, targetIndex: index });
      }
    });
    return actions;
  }, []);
};

BattleManager.prototype.chooseNpcAction = function (npcActive) {
  var actions = this.availableNpcMoveActions(npcActive).concat(this.availableNpcItemActions());
  return choosePveAction({
    battleManager: this,
    attacker: npcActive,
    defender: this.playerTeam.getActive(),
    availableActions: actions,
    enemyTeam: this.enemyTeam,
    playerTeam: this.playerTeam,
    npcItems: this.npcItems,
    turn: this.turn,
    weather: this.weather,
    battleType: this.battleType
  });
};

BattleManager.prototype.consumeNpcItem = function (item) {
  var itemIndex = Number(item && item.index);
  var entryIndex = (this.npcItems || []).findIndex(function (entry) {
    return Array.isArray(entry) && Number(entry[0]) === itemIndex;
  });
  if (entryIndex === -1) {
    return;
  }
  this.npcItems[entryIndex][1] = Math.max(0, Number(this.npcItems[entryIndex][1]) - 1);
  if (this.npcItems[entryIndex][1] <= 0) {
    this.npcItems.splice(entryIndex, 1);
  }
};

BattleManager.prototype.combatantAvailableMoves = function (combatant) {
  var moves;
  if (!combatant || !combatant.pokemon) {
    return [];
  }
  if (combatant.pendingMove) {
    return [combatant.pendingMove];
  }
  moves = (combatant.pokemon.moves || []).filter(function (move) {
    return move && combatant.disabledMoves.indexOf(move.key) === -1;
  });
  if (moves.length || !(combatant.pokemon.moves || []).length) {
    return moves;
  }
  return [createMove(m.struggle, {
    power: combatant.pokemon.moves[0].power,
    stats: combatant.pokemon.moves[0].stats
  })];
};

BattleManager.prototype.maxPotentialMoveDamage = function (attacker, defender) {
  var manager = this;
  var previousHpCost = this._lifeOrbCost;
  var maxDamage = 0;
  if (!attacker || !defender || attacker.isFainted() || defender.isFainted()) {
    return 0;
  }
  this.combatantAvailableMoves(attacker).forEach(function (move) {
    var damage;
    if (!move || !move.damagingMove) {
      return;
    }
    damage = manager.calculateMoveDamage(attacker, defender, move);
    if (damage > maxDamage) {
      maxDamage = damage;
    }
  });
  this._lifeOrbCost = previousHpCost;
  return maxDamage;
};

BattleManager.prototype.combatantCanKo = function (attacker, defender) {
  if (!attacker || !defender || defender.isFainted()) {
    return false;
  }
  return this.maxPotentialMoveDamage(attacker, defender) >= defender.hp;
};

BattleManager.prototype.livingCombatantCount = function (team) {
  return (team && team.combatantList || []).filter(function (combatant) {
    return combatant && !combatant.isFainted();
  }).length;
};

BattleManager.prototype.combatantWillBeBlockedByStatus = function (combatant) {
  var status = combatant && combatant.status;
  var pending = combatant && combatant.pendingDelayedStatus;
  if (status === "slp" || status === "frz" || status === "par_block" || status === "cnf_block") {
    return true;
  }
  status = pending && pending.status;
  return status === "slp" || status === "frz" || status === "par_block" || status === "cnf_block";
};

BattleManager.prototype.chooseNpcSwitchIndex = function () {
  var manager = this;
  var playerActive = this.playerTeam.getActive();
  var candidates = (this.enemyTeam.combatantList || []).map(function (combatant, index) {
    var playerDamage;
    var npcDamage;
    if (!combatant || index === manager.enemyTeam.activeIndex || combatant.isFainted() || !manager.canNpcSwitchTo(index).ok) {
      return null;
    }
    playerDamage = playerActive && !playerActive.isFainted() ? manager.maxPotentialMoveDamage(playerActive, combatant) : 0;
    npcDamage = playerActive && !playerActive.isFainted() ? manager.maxPotentialMoveDamage(combatant, playerActive) : 0;
    return {
      index: index,
      survives: !playerActive || playerActive.isFainted() || playerDamage < combatant.hp,
      canKoPlayer: Boolean(playerActive && !playerActive.isFainted() && npcDamage >= playerActive.hp),
      damage: npcDamage,
      level: Number(combatant.pokemon && combatant.pokemon.level) || 0,
      maxHp: Number(combatant.pokemon && combatant.pokemon.maxHp) || 0
    };
  }).filter(Boolean);

  if (!candidates.length) {
    return null;
  }

  candidates.sort(function (left, right) {
    return Number(right.survives) - Number(left.survives)
      || Number(right.canKoPlayer) - Number(left.canKoPlayer)
      || right.damage - left.damage
      || right.level - left.level
      || right.maxHp - left.maxHp;
  });
  return candidates[0].index;
};

BattleManager.prototype.switchNpcAfterKo = function () {
  var previousPreferredIndex = this.enemyTeam.preferredSwitchIndex;
  this.enemyTeam.preferredSwitchIndex = this.chooseNpcSwitchIndex();
  try {
    return this.enemyTeam.switchRandom();
  } finally {
    this.enemyTeam.preferredSwitchIndex = previousPreferredIndex;
  }
};

BattleManager.prototype.moveStatusCheck = function (attacker, move) {
  var manager = this;

  function resolvePendingAsFailed() {
    if (attacker.pendingMove !== null) {
      attacker.semiInvulnerable = null;
      attacker.removePending();
      attacker.pendingMoveTurns = 0;
    }
  }

  if (attacker.status === null) {
    return true;
  }

  if (attacker.status === "par_block" || attacker.status === "par_free") {
    var parHeldStatusResult = runHeldItemTrigger(manager, "moveStatusCheck", HeldItemTriggerContext.moveStatusCheck(attacker));
    if (parHeldStatusResult.handled) {
      return parHeldStatusResult.canMove;
    }
    if (attacker.status === "par_block") {
      resolvePendingAsFailed();
      manager.emit(battleEvent("status.paralyzedCannotMove", { pokemon: battleSpeciesRef(attacker) }));
      attacker.status = "par_free";
      return false;
    }
    attacker.status = "par_block";
    return true;
  }

  if (attacker.status === "cnf_block" || attacker.status === "cnf_free") {
    var cnfHeldStatusResult = runHeldItemTrigger(manager, "moveStatusCheck", HeldItemTriggerContext.moveStatusCheck(attacker));
    if (cnfHeldStatusResult.handled) {
      return cnfHeldStatusResult.canMove;
    }
    if (attacker.status === "cnf_block") {
      var dmg = Math.max(1, Math.floor(attacker.pokemon.maxHp / 16));
      attacker.hp = Math.max(0, attacker.hp - dmg);
      resolvePendingAsFailed();
      manager.emit(battleEvent("status.confusionSelfDamage", { pokemon: battleSpeciesRef(attacker), amount: dmg }));
      attacker.status = "cnf_free";
      manager.KOCheck(attacker, attacker);
      return false;
    }
    attacker.status = "cnf_block";
    return true;
  }

  if (attacker.status === "slp") {
    if (move && (move.key === "snore" || move.key === "sleep_talk")) {
      return true;
    }
    resolvePendingAsFailed();
    manager.emit(battleEvent("status.asleepCannotMove", { pokemon: battleSpeciesRef(attacker) }));
    return false;
  }

  if (attacker.status === "frz") {
    if (move && (move.key === "sacred_fire" || move.key === "flame_wheel")) {
      attacker.status = null;
      attacker.sleepCounter = 0;
      attacker.sleepDuration = 3;
      attacker.confCounter = 0;
      attacker.slpSource = null;
      attacker.nightmareActive = false;
      manager.emit(battleEvent("status.thawed", { pokemon: battleSpeciesRef(attacker) }));
      return true;
    }
    resolvePendingAsFailed();
    manager.emit(battleEvent("status.frozenCannotMove", { pokemon: battleSpeciesRef(attacker) }));
    return false;
  }

  return true;
};

BattleManager.prototype.invulnerabilityCheck = function (defender, move) {
  var semi = defender.semiInvulnerable;
  if (!semi || !m.SEMI_INVULN_ALLOWED[semi]) {
    return true;
  }
  return Boolean(m.SEMI_INVULN_ALLOWED[semi][move.key]);
};

BattleManager.prototype.damageStatusCheck = function (attacker) {
  if (attacker.status === "psn") {
    var poisonDamage = Math.max(1, Math.floor(attacker.pokemon.maxHp / 8));
    attacker.hp = Math.max(0, attacker.hp - poisonDamage);
    this.emit(battleEvent("status.poisonDamage", { pokemon: battleSpeciesRef(attacker), amount: poisonDamage }));
  }
  if (attacker.status === "brn") {
    var burnDamage = Math.max(1, Math.floor(attacker.pokemon.maxHp / 8));
    attacker.hp = Math.max(0, attacker.hp - burnDamage);
    this.emit(battleEvent("status.burnDamage", { pokemon: battleSpeciesRef(attacker), amount: burnDamage }));
  }
  if (this.weather === "sand") {
    var sandImmune = attacker.type.indexOf("steel") !== -1 || attacker.type.indexOf("ground") !== -1 || attacker.type.indexOf("rock") !== -1;
    if (!sandImmune) {
      var sandDamage = Math.max(1, Math.floor(attacker.pokemon.maxHp / 8));
      attacker.hp = Math.max(0, attacker.hp - sandDamage);
      this.emit(battleEvent("weather.sandDamage", { pokemon: battleSpeciesRef(attacker), amount: sandDamage }));
    }
  }
  if (this.weather === "hail") {
    if (attacker.type.indexOf("ice") === -1) {
      var hailDamage = Math.max(1, Math.floor(attacker.pokemon.maxHp / 8));
      attacker.hp = Math.max(0, attacker.hp - hailDamage);
      this.emit(battleEvent("weather.hailDamage", { pokemon: battleSpeciesRef(attacker), amount: hailDamage }));
    }
  }
};

BattleManager.prototype.typeEfficacy = function (attacker, defender) {
  var product = 1.0;
  attacker.type.forEach(function (attackerType) {
    var row = TYPE_CHART[attackerType] || {};
    defender.type.forEach(function (defenderType) {
      product *= row[defenderType] !== undefined ? row[defenderType] : 1.0;
    });
  });
  if (product > 1.0) {
    return 2.0;
  }
  if (product < 1.0) {
    return 0.5;
  }
  return 1.0;
};

BattleManager.prototype.markMoveKoTrigger = function (attacker, defender, move, defenderHpBefore) {
  if (!attacker || !defender || !move || defenderHpBefore <= 0 || defender.hp > 0) {
    return;
  }
  defender.moveKoTrigger = {
    attacker: attacker,
    moveKey: move.key,
    destinyBondActive: Boolean(defender.destinyBondActive),
    grudgeActive: Boolean(defender.grudgeActive)
  };
};

BattleManager.prototype.applyMoveKoTriggeredEffects = function (defender) {
  var trigger = defender && defender.moveKoTrigger;
  var attacker = trigger && trigger.attacker;
  var moveKey = trigger && trigger.moveKey;
  var moveDefinition = moveKey ? m.MOVE_LIBRARY.find(function (move) { return move.key === moveKey; }) : null;

  if (!trigger) {
    return;
  }
  defender.moveKoTrigger = null;
  if (!attacker || attacker === defender) {
    return;
  }
  if (trigger.destinyBondActive) {
    attacker.hp = 0;
    defender.destinyBondActive = false;
    this.emit(battleEvent("status.destinyBondKo", { pokemon: battleSpeciesRef(attacker) }));
  }
  if (trigger.grudgeActive && moveKey) {
    attacker.disableMoveInhibit(moveKey);
    defender.grudgeActive = false;
    this.emit(battleEvent("status.grudgeDisabledMove", { pokemon: battleSpeciesRef(attacker), move: battleMoveRef(moveDefinition || { key: moveKey }) }));
  }
};

BattleManager.prototype.KOCheck = function (attacker, defender) {
  var resolvedCombatants = this._resolvedKoCombatants || (this._resolvedKoCombatants = []);
  var defenderKoIsNew = defender.isFainted() && resolvedCombatants.indexOf(defender) === -1;
  var attackerKoIsNew = attacker !== defender && attacker.isFainted() && resolvedCombatants.indexOf(attacker) === -1;

  if (!defenderKoIsNew && !attackerKoIsNew) {
    return;
  }

  if (defenderKoIsNew) {
    resolvedCombatants.push(defender);
    defender.team.teamKOTracker = true;
    this.emit(battleEvent("outcome.pokemonKo", { pokemon: battleSpeciesRef(defender) }));
    this.applyMoveKoTriggeredEffects(defender);
    if (!defender.expAwarded && attacker !== defender && attacker.team === this.playerTeam && defender.team === this.enemyTeam) {
      defender.expAwarded = true;
      this.expEvents.push({
        winner: attacker,
        defeated: defender
      });
    }
    runHeldItemTrigger(this, "afterKo", HeldItemTriggerContext.afterKo(attacker, defender));
  }

  if (attackerKoIsNew) {
    resolvedCombatants.push(attacker);
    attacker.team.teamKOTracker = true;
    this.emit(battleEvent("outcome.pokemonKo", { pokemon: battleSpeciesRef(attacker) }));
  }

  if (attacker.isFainted() && defender.isFainted()) {
    var attackerAllFainted = attacker.team.isAllFainted();
    var defenderAllFainted = defender.team.isAllFainted();

    if (attackerAllFainted && defenderAllFainted) {
      if (attacker.team === this.playerTeam) {
        this.emit(battleEvent("outcome.playerLost", {}));
      } else {
        this.emit(battleEvent("outcome.playerWon", {}));
      }
      this.endBattle();
      return;
    }

    if (attackerAllFainted) {
      this.emit(battleEvent(attacker.team === this.playerTeam ? "outcome.playerTeamKo" : "outcome.playerWon", {}));
      this.endBattle();
      return;
    }

    if (defenderAllFainted) {
      this.emit(battleEvent(defender.team === this.playerTeam ? "outcome.playerTeamKo" : "outcome.playerWon", {}));
      this.endBattle();
      return;
    }

    if (this.adminControlled && this.startReplacementFlow(this.actorForTeam(attacker.team), {
      player: this.playerTeam.getActive().isFainted(),
      npc: this.enemyTeam.getActive().isFainted()
    })) {
      return;
    }

    if (attacker === this.playerTeam.getActive()) {
      var doubleKoEnemySwitchResult = this.switchNpcAfterKo();
      this.emitEvents(doubleKoEnemySwitchResult.events);
      this.checkHeldHpBerryOnEntry(this.enemyTeam.getActive());
      this.playerNeedsSwitch = true;
      this.KOStatus = "recoil_player";
      return;
    }

    if (attacker === this.enemyTeam.getActive()) {
      this.playerNeedsSwitch = true;
      this.KOStatus = "recoil_NPC";
      return;
    }

    return;
  }

  if (this.playerTeam.getActive().isFainted() && this.playerTeam.isAllFainted()) {
    this.emit(battleEvent("outcome.playerTeamKo", {}));
    this.endBattle();
    return;
  }

  if (this.enemyTeam.getActive().isFainted() && this.enemyTeam.isAllFainted()) {
    this.emit(battleEvent("outcome.playerWon", {}));
    this.endBattle();
    return;
  }

  if (this.adminControlled && this.startReplacementFlow(this.actorForTeam(attacker.team), {
    player: this.playerTeam.getActive().isFainted(),
    npc: this.enemyTeam.getActive().isFainted()
  })) {
    return;
  }

  if (attacker === this.playerTeam.getActive()) {
    if (attacker.isFainted()) {
      if (attacker.team.isAllFainted()) {
        this.emit(battleEvent("outcome.playerTeamKo", {}));
        this.endBattle();
        return;
      }

      this.playerNeedsSwitch = true;
      this.KOStatus = "recoil_player";
      return;
    }

    if (defender.isFainted()) {
      if (defender.team.isAllFainted()) {
        this.emit(battleEvent("outcome.playerWon", {}));
        this.endBattle();
        return;
      }

      var enemySwitchResult = this.switchNpcAfterKo();
      this.emitEvents(enemySwitchResult.events);
      this.checkHeldHpBerryOnEntry(this.enemyTeam.getActive());
    }
  }

  if (attacker === this.enemyTeam.getActive()) {
    if (attacker.isFainted()) {
      if (attacker.team.isAllFainted()) {
        this.emit(battleEvent("outcome.playerWon", {}));
        this.endBattle();
        return;
      }
      var autoKoSwitchResult = this.switchNpcAfterKo();
      this.emitEvents(autoKoSwitchResult.events);
      this.checkHeldHpBerryOnEntry(this.enemyTeam.getActive());
      return;
    }

    if (defender.isFainted()) {
      if (defender.team.isAllFainted()) {
        this.emit(battleEvent("outcome.playerTeamKo", {}));
        this.endBattle();
        return;
      }

      this.playerNeedsSwitch = true;
    }
  }
};

BattleManager.prototype.canPlayerSwitchTo = function (index) {
  var active = this.playerTeam.getActive();
  var target = this.playerTeam.combatantList[index];
  if (!target) {
    return { ok: false, code: "target_not_found", event: battleEvent("switch.targetNotFound", {}) };
  }
  if (index === this.playerTeam.activeIndex) {
    return { ok: false, code: "already_active", event: battleEvent("switch.alreadyActive", { pokemon: battleSpeciesRef(active) }) };
  }
  if (target.isFainted()) {
    return { ok: false, code: "target_fainted", event: battleEvent("switch.targetFainted", { pokemon: battleSpeciesRef(target) }) };
  }
  if (active.trappedTurns > 0 || active.trappedMoveIndex) {
    if (active.trappedTurns >= 99) {
      return { ok: false, code: "trapped", event: battleEvent("switch.trapped", { pokemon: battleSpeciesRef(active) }) };
    }
    return { ok: false, code: "trapped_turns", event: battleEvent("switch.trappedTurns", { pokemon: battleSpeciesRef(active), turns: active.trappedTurns }) };
  }
  if (active.rooted) {
    return { ok: false, code: "rooted", event: battleEvent("switch.rooted", { pokemon: battleSpeciesRef(active) }) };
  }
  if (active.pendingMove && !active.pendingMove.isForcedMove) {
    return { ok: false, code: "pending_move", event: battleEvent("switch.pendingMove", { pokemon: battleSpeciesRef(active), move: battleMoveRef(active.pendingMove) }) };
  }
  return { ok: true };
};

BattleManager.prototype.resolvePlayerSwitchAction = function (index, entryChoice) {
  var result;
  this.beginTrainerAction("player", this.playerTeam.getActive(), "switch");
  this.startTurn(this.playerTeam.getActive(), this.enemyTeam.getActive());
  this.recordWeatherMoveAction("player", false);
  this.consumeChargeDamageMultiplier(this.playerTeam.getActive());
  result = this.playerTeam.switchTo(index);
  if (!result.ok) {
    this.emit(result.event);
    this.endTurn(this.playerTeam.getActive(), this.enemyTeam.getActive());
    return true;
  }

  this.emitEvents(result.events);
  this.checkHeldHpBerryOnEntry(this.playerTeam.getActive());
  if (entryChoice) {
    this.applyEntryHeldItemChoice(this.playerTeam.getActive(), entryChoice);
  }
  this.endTurn(this.playerTeam.getActive(), this.enemyTeam.getActive());
  this.clearRecentSwitchTarget(this.enemyTeam);
  return true;
};

BattleManager.prototype.resolveForcedPlayerSwitch = function (index, entryChoice) {
  var result = this.playerTeam.switchTo(index);
  var KOInfo;
  if (!result.ok) {
    this.emit(result.event);
    return false;
  }

  KOInfo = this.KOStatus;
  this.playerNeedsSwitch = false;
  this.KOStatus = null;
  this.emitEvents(result.events);
  this.checkHeldHpBerryOnEntry(this.playerTeam.getActive());
  if (entryChoice) {
    this.applyEntryHeldItemChoice(this.playerTeam.getActive(), entryChoice);
  }

  if (this.adminControlled) {
    if (this.playerTeam.getActive().isFainted()) {
      if (this.playerTeam.isAllFainted()) {
        this.playerNeedsSwitch = false;
        this.replacementFlow = null;
        this.emit(battleEvent("outcome.playerTeamKo", {}));
        this.endBattle();
        return true;
      }
      this.playerNeedsSwitch = true;
      this.waitingFor = "player";
    } else if (this.replacementFlow) {
      this.completeReplacementForActor("player");
    } else {
      this.playerNeedsSwitch = false;
      this.waitingFor = "admin";
    }
  } else if (KOInfo === "recoil_player" && this.firstActionInTurn === false) {
    this.resolveNpcAction();
  } else if (KOInfo === "recoil_NPC") {
    var switchResult = this.switchNpcAfterKo();
    this.emitEvents(switchResult.events);
    this.checkHeldHpBerryOnEntry(this.enemyTeam.getActive());
  }

  return true;
};

BattleManager.prototype.resolvePostMovePlayerSwitch = function (index, entryChoice) {
  var result = this.playerTeam.switchTo(index);
  if (!result.ok) {
    this.emit(result.event);
    return false;
  }

  this.playerPostMoveSwitch = false;
  this.emitEvents(result.events);
  this.checkHeldHpBerryOnEntry(this.playerTeam.getActive());
  if (entryChoice) {
    this.applyEntryHeldItemChoice(this.playerTeam.getActive(), entryChoice);
  }

  if (this.playerTeam.getActive().isFainted()) {
    if (this.playerTeam.isAllFainted()) {
      this.playerNeedsSwitch = false;
      this.emit(battleEvent("outcome.playerTeamKo", {}));
      this.endBattle();
      return true;
    }
    this.playerNeedsSwitch = true;
    this.waitingFor = "player";
    return true;
  }

  if (this.adminControlled) {
    this.waitingFor = "admin";
  } else if (!this.battleOver && !this.playerNeedsSwitch && this.firstActionInTurn === false) {
    this.resolveNpcAction();
  }

  return true;
};

BattleManager.prototype.playerSwitch = function (index, entryChoice) {
  var manager = this;
  var validation;
  if (this.playerNeedsSwitch) {
    return this.resolveForcedPlayerSwitch(index, entryChoice);
  }
  if (this.playerPostMoveSwitch) {
    return this.resolvePostMovePlayerSwitch(index, entryChoice);
  }
  validation = this.canPlayerSwitchTo(index);
  if (!validation.ok) {
    this.emit(validation.event);
    return false;
  }
  return this.resolvePlayerRound(function () {
    return manager.resolvePlayerSwitchAction(index, entryChoice);
  }, true);
};

BattleManager.prototype.endTurn = function (attacker, defender) {
  if (this.battleOver) {
    return;
  }
  if (attacker.seedTarget !== null && attacker.hp > 0) {
    if (heldItemHasEffect(attacker, "hazard_multiturn_guard")) {
      attacker.seedTarget = null;
      attacker.seedValue = 0;
      this.emit(battleEvent("hazard.bootsClearedLeechSeed", { pokemon: battleSpeciesRef(attacker) }));
    } else {
      var seedTeam = attacker.seedTarget;
      var seedHealTarget = seedTeam && typeof seedTeam.getActive === "function" ? seedTeam.getActive() : null;
      var seedDamage = Math.min(attacker.hp, Math.max(1, attacker.seedValue));
      var seedHeal = seedHealTarget && seedHealTarget.hp > 0
        ? Math.min(seedDamage, seedHealTarget.pokemon.maxHp - seedHealTarget.hp)
        : 0;
      attacker.hp = Math.max(0, attacker.hp - seedDamage);
      if (seedHealTarget && seedHeal > 0) {
        seedHealTarget.hp = Math.min(seedHealTarget.hp + seedHeal, seedHealTarget.pokemon.maxHp);
      }
      this.emit(battleEvent(seedHealTarget && seedHeal > 0 ? "hazard.leechSeedDrain" : "hazard.leechSeedDamage", {
        pokemon: battleSpeciesRef(attacker), amount: seedDamage,
        target: battleSpeciesRef(seedHealTarget), healed: seedHeal
      }));
    }
  }

  this.damageStatusCheck(attacker);
  runHeldItemTrigger(this, "healHpBerry", HeldItemTriggerContext.healHpBerry(attacker));
  this.KOCheck(attacker, defender);

  [attacker, defender].forEach(function(c) {
    runHeldItemTrigger(this, "endTurnStatusEffects", HeldItemTriggerContext.endTurnStatusEffects(c, c === attacker ? defender : attacker));
  }, this);

  if (defender.nightmareActive) {
    if (defender.status === "slp" && defender.hp > 0) {
      var nightmareDamage = Math.min(defender.hp, Math.max(1, Math.floor(defender.pokemon.maxHp / 3)));
      defender.hp = Math.max(0, defender.hp - nightmareDamage);
      this.emit(battleEvent("status.nightmareDamage", { pokemon: battleSpeciesRef(defender), amount: nightmareDamage }));
      this.KOCheck(attacker, defender);
    } else {
      defender.nightmareActive = false;
    }
  }
  this.combatants().forEach(function (combatant) {
    if (combatant.status !== "slp") {
      combatant.nightmareActive = false;
    }
  });

  if (attacker.team.futureSight.active) {
    attacker.team.futureSight.timer -= 1;
    if (attacker.team.futureSight.timer === 0) {
      var target = defender.team.getActive();
      var originalTarget = defender.team.combatantList[attacker.team.futureSight.targetIndex];
      if (originalTarget && originalTarget.hp <= 0) {
        target = null;
      }
      if (target && target.hp > 0) {
        var typeMultiplier = this.typeEfficacy(
          { type: attacker.team.futureSight.attackerTypes },
          target
        );
        var dmg = Math.max(1, Math.floor(attacker.team.futureSight.power * typeMultiplier));
        target.hp = Math.max(0, target.hp - dmg);
        var futureMove = m.MOVE_LIBRARY.find(function (move) { return move.key === attacker.team.futureSight.moveKey; });
        this.emit(battleEvent("future.hit", {
          move: battleMoveRef(futureMove || { key: attacker.team.futureSight.moveKey }),
          source: battleSpeciesRef({ speciesKey: attacker.team.futureSight.attackerSpeciesKey }),
          target: battleSpeciesRef(target), amount: dmg
        }));
        this.KOCheck(attacker, target);
      } else {
        var failedFutureMove = m.MOVE_LIBRARY.find(function (move) { return move.key === attacker.team.futureSight.moveKey; });
        this.emit(battleEvent("future.failedTargetKo", {
          move: battleMoveRef(failedFutureMove || { key: attacker.team.futureSight.moveKey }),
          target: battleSpeciesRef(originalTarget || target)
        }));
      }
      attacker.team.futureSight.active = false;
      attacker.team.futureSight.timer = 0;
      attacker.team.futureSight.power = 0;
      attacker.team.futureSight.attackerTypes = [];
      attacker.team.futureSight.attackerSpeciesKey = "";
      attacker.team.futureSight.moveKey = "";
      attacker.team.futureSight.targetIndex = -1;
    }
  }

  if (attacker.perishSongTurns > 0 && attacker.hp > 0) {
    if (attacker.perishSongSkipNextAction) {
      attacker.perishSongSkipNextAction = false;
    } else {
      attacker.perishSongTurns -= 1;
      if (attacker.perishSongTurns === 0) {
        attacker.hp = 0;
        this.emit(battleEvent("status.perishSongKo", { pokemon: battleSpeciesRef(attacker) }));
        this.KOCheck(attacker, defender);
      }
    }
  }

  if (attacker.team.wishDueAmount > 0) {
    if (attacker.hp > 0) {
      var wishHeal = Math.min(attacker.team.wishDueAmount, attacker.pokemon.maxHp - attacker.hp);
      attacker.hp = Math.min(attacker.hp + attacker.team.wishDueAmount, attacker.pokemon.maxHp);
      this.emit(battleEvent("status.wishHeal", {
        source: battleSpeciesRef({ speciesKey: attacker.team.wishDueSourceSpeciesKey || attacker.pokemon.speciesKey }),
        pokemon: battleSpeciesRef(attacker), amount: wishHeal
      }));
    }
    attacker.team.wishDueAmount = 0;
    attacker.team.wishDueSourceSpeciesKey = "";
  }

  if (defender.magicCoatTurns > 0) {
    defender.magicCoatTurns -= 1;
    defender.magicCoatActive = defender.magicCoatTurns > 0;
  }
  if (defender.destinyBondTurns > 0) {
    defender.destinyBondTurns -= 1;
    defender.destinyBondActive = defender.destinyBondTurns > 0;
  }

  this.completeTrainerAction();

  if (this.firstActionInTurn) {
    this.firstActionInTurn = false;
  } else {
    this.emit(battleEvent("turn.divider", {}, { divider: true }));
    this.firstActionInTurn = true;
    this.turn += 1;
    [this.playerTeam, this.enemyTeam].forEach(function (team) {
      var active = team.getActive();
      if (active) {
        active.prevTurnDamaged = active.wasHitSinceSwitch;
        active.prevTurnActive = true;
        active.wasHitSinceSwitch = false;
      }
    });
    if (typeof this.onTurnCompleted === "function") {
      this.onTurnCompleted(this.turn - 1);
    }
  }
};

BattleManager.prototype.endBattle = function () {
  this._trainerActionContext = null;
  this.restoreHeldItemTransfers();
  this.playerTeam.combatantList.concat(this.enemyTeam.combatantList).forEach(function (combatant) {
    combatant.resetSwitchModifiers();
  });
  this.battleOver = true;
};
