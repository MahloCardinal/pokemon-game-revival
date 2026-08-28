import { Combatant } from "./combatant.js";
import { HeldItemTriggerContext, runHeldItemTrigger } from "./held-items.js";
import { random } from "./deterministic-rng.js";
import { battleEvent, battleMoveRef, battleSpeciesRef } from "./battle-events.js";

export function Team(name, pokemonList, activeIndex) {
  this.name = name;
  this.pokemonList = pokemonList;
  this.combatantList = pokemonList.map(function (pokemon) {
    return new Combatant(pokemon);
  });
  this.activeIndex = activeIndex || 0;
  this.combatantList.forEach(function (combatant) {
    combatant.team = this;
  }, this);
  this.percentage = true;
  this.teamAtkBuff = 0;
  this.buffAtkCounter = 0;
  this.teamDefBuff = 0;
  this.buffDefCounter = 0;
  this.teamMistCounter = 0;
  this.teamMoveBoostProtectCounter = 0;
  this.teamKOTracker = false;
  this.wishHealAmount = 0;
  this.wishSourceSpeciesKey = "";
  this.wishDueAmount = 0;
  this.wishDueSourceSpeciesKey = "";
  this.sleepImmunityCounter = 0;
  this.teamStatusProtectCounter = 0;
  this.teamBoostSuppressCounter = 0;
  this.spikesActive = false;
  this.spikesLevel = 0;
  this.batonPassStats = null;
  this.preferredSwitchIndex = null;
  this.lastSwitchedOutIndex = null;
  this.futureSight = {
    active: false,
    timer: 0,
    power: 0,
    attackerTypes: [],
    attackerSpeciesKey: "",
    moveKey: "",
    targetIndex: -1
  };
}

Team.prototype.consumePercentage = function () {
  var wasPositive = Boolean(this.percentage);
  this.percentage = !wasPositive;
  return wasPositive;
};

Team.prototype.getActive = function () {
  return this.combatantList[this.activeIndex];
};

Team.prototype.isAllFainted = function () {
  return this.combatantList.every(function (combatant) {
    return combatant.isFainted();
  });
};

Team.prototype.switchTo = function (index) {
  var active = this.getActive();
  if (index === this.activeIndex) {
    return { ok: false, code: "already_active", event: battleEvent("switch.alreadyActive", { pokemon: battleSpeciesRef(active) }) };
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
  this.getActive().resetSwitchModifiers();
  var previous = this.activeIndex;
  this.lastSwitchedOutIndex = previous;
  this.activeIndex = index;
  var entering = this.getActive();
  var events = [battleEvent("switch.changed", {
    outgoing: battleSpeciesRef(this.combatantList[previous]),
    incoming: battleSpeciesRef(entering)
  })];
  if (this.batonPassStats) {
    var stats = this.batonPassStats;
    entering.atkBuff = stats.atkBuff;
    entering.defBuff = stats.defBuff;
    entering.atkNerf = stats.atkNerf;
    entering.defNerf = stats.defNerf;
    entering.status = stats.status;
    entering.sleepCounter = stats.sleepCounter || 0;
    entering.sleepDuration = stats.sleepDuration || 3;
    entering.slpSource = stats.slpSource || null;
    entering.confCounter = stats.confCounter || 0;
    entering.pendingDelayedStatus = stats.pendingDelayedStatus ? Object.assign({}, stats.pendingDelayedStatus) : null;
    events.push(battleEvent("switch.batonPass", { pokemon: battleSpeciesRef(entering) }));
    this.batonPassStats = null;
  }
  if (this.battleManager) {
    var opponent = (this === this.battleManager.playerTeam) ? this.battleManager.enemyTeam : this.battleManager.playerTeam;
    var hazardResult = runHeldItemTrigger(this.battleManager, "switchHazard", HeldItemTriggerContext.switchHazard(entering, opponent));
    if (hazardResult.event) { events.push(hazardResult.event); }
  }
  return { ok: true, events: events };
};

Team.prototype.switchRandom = function () {
  var aliveChoices = [];
  var index;
  for (index = 0; index < this.combatantList.length; index += 1) {
    if (!this.combatantList[index].isFainted()) {
      aliveChoices.push(index);
    }
  }
  aliveChoices = aliveChoices.filter(function (entry) {
    return entry !== this.activeIndex;
  }, this);
   if (!aliveChoices.length || this.getActive().trappedTurns > 0 || this.getActive().trappedMoveIndex) {
    return { ok: false, event: battleEvent("move.fail", {}) };
  }
  this.getActive().resetSwitchModifiers();
  var previous = this.activeIndex;
  index = Number.isInteger(this.preferredSwitchIndex) ? this.preferredSwitchIndex : NaN;
  this.activeIndex = aliveChoices.indexOf(index) !== -1
    ? index
    : aliveChoices[Math.floor(random() * aliveChoices.length)];
  this.lastSwitchedOutIndex = previous;
  var entering = this.getActive();
  var events = [battleEvent("switch.entered", { pokemon: battleSpeciesRef(entering) })];
  if (this.battleManager) {
    var opponent = (this === this.battleManager.playerTeam) ? this.battleManager.enemyTeam : this.battleManager.playerTeam;
    var hazardResult = runHeldItemTrigger(this.battleManager, "switchHazard", HeldItemTriggerContext.switchHazard(entering, opponent));
    if (hazardResult.event) { events.push(hazardResult.event); }
  }
  return { ok: true, events: events };
};

Team.prototype.buffTeamAtk = function (amount) {
  if (amount > this.teamAtkBuff) {
    this.teamAtkBuff = amount;
  }
};

Team.prototype.buffTeamDef = function (amount) {
  if (amount > this.teamDefBuff) {
    this.teamDefBuff = amount;
  }
};
