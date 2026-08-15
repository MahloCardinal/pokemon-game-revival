import { Combatant } from "./combatant.js";
import { HeldItemTriggerContext, runHeldItemTrigger } from "./held-items.js";
import { random } from "./deterministic-rng.js";

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
  this.wishSourceName = "";
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
    attackerName: "",
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
  if (index === this.activeIndex) {
    return { ok: false, message: this.getActive().pokemon.name + "è già in campo" };
  }
  if (this.getActive().trappedTurns > 0 || this.getActive().trappedMoveIndex) {
    if (this.getActive().trappedTurns >= 99) {
      return { ok: false, message: this.getActive().pokemon.name + " non può essere sostituito" };
    }
    return { ok: false, message: this.getActive().pokemon.name + " non può essere sostituito per " + this.getActive().trappedTurns + " turni" };
  }
  if (this.getActive().rooted) {
    return { ok: false, message: this.getActive().pokemon.name + " non può essere sostituito perché ha usato Radicamento" };
  }
  if (this.getActive().pendingMove && !this.getActive().pendingMove.isForcedMove) {
    return { ok: false, message: this.getActive().pokemon.name + " non può essere sostituito perché " + this.getActive().pendingMove.name + " in corso" };
  }
  this.getActive().resetSwitchModifiers();
  var previous = this.activeIndex;
  this.lastSwitchedOutIndex = previous;
  this.activeIndex = index;
  var entering = this.getActive();
  var msg = this.combatantList[previous].pokemon.name + " ritirato, entra in campo " + entering.pokemon.name;
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
    if (entering.status === "cnf_block" || entering.status === "cnf_free") {
      entering.status = null;
      entering.confCounter = 0;
    }
    if (entering.pendingDelayedStatus && (entering.pendingDelayedStatus.status === "cnf_block" || entering.pendingDelayedStatus.status === "cnf_free")) {
      entering.pendingDelayedStatus = null;
    }
    msg += ". Staffetta passa le alterazioni a " + entering.pokemon.name;
    this.batonPassStats = null;
  }
  if (this.battleManager) {
    var opponent = (this === this.battleManager.playerTeam) ? this.battleManager.enemyTeam : this.battleManager.playerTeam;
    msg = runHeldItemTrigger(this.battleManager, "switchHazard", HeldItemTriggerContext.switchHazard(entering, opponent, msg)).message;
  }
  return { ok: true, message: msg };
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
    return "L'attacco fallisce";
  }
  this.getActive().resetSwitchModifiers();
  var previous = this.activeIndex;
  index = Number.isInteger(this.preferredSwitchIndex) ? this.preferredSwitchIndex : NaN;
  this.activeIndex = aliveChoices.indexOf(index) !== -1
    ? index
    : aliveChoices[Math.floor(random() * aliveChoices.length)];
  this.lastSwitchedOutIndex = previous;
  var entering = this.getActive();
  var msg = "Entra in campo " + entering.pokemon.name;
  if (this.battleManager) {
    var opponent = (this === this.battleManager.playerTeam) ? this.battleManager.enemyTeam : this.battleManager.playerTeam;
    msg = runHeldItemTrigger(this.battleManager, "switchHazard", HeldItemTriggerContext.switchHazard(entering, opponent, msg)).message;
  }
  return msg;
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
