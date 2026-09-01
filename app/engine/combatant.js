import * as m from "../data/moves.js";
import { createMove } from "./moves.js";

export function Combatant(pokemon) {
  this.pokemon = pokemon;
  this.type = pokemon.type.slice();
  this.originalTypes = pokemon.type.slice();
  this.hp = pokemon.maxHp;
  this.level = pokemon.level;
  this.team = null;
  this.gui = { applyMoveStates: function () {}, setPokemon: function () {} };
  this.moveStates = [];
  this.atkBuff = 0;
  this.defBuff = 0;
  this.atkNerf = 0;
  this.defNerf = 0;
  this.weatherAtkBuff = 0;
  this.weatherDefBuff = 0;
  this.wasHitSinceSwitch = false;
  this.prevTurnDamaged = false;
  this.prevTurnActive = false;
  this.turnBeforeMoveUsed = null;
  this.turnBeforeDamageTaken = 0;
  this.status = null;
  this.sleepCounter = 0;
  this.sleepDuration = 3;
  this.confCounter = 0;
  this.slpSource = null;
  this.pendingDelayedStatus = null;
  this.pendingMove = null;
  this.pendingMoveTurns = 0;
  this.chargeDamageMultiplier = 1;
  this.activeChargeDamageMultiplier = 1;
  this.semiInvulnerable = null;
  this.disabledMoves = [];
  this.initialHeldItemIndex = Number(pokemon.heldItemIndex) || 0;
  this.lastConsumedHeldItemIndex = 0;
  this.trappedTurns = 0;
  this.trappedMoveIndex = 0;
  this.seedTarget = null;
  this.seedValue = 0;
  this.endure = false;
  this.defenseCurlUsed = false;
  this.stockpileUsed = false;
  this.rooted = false;
  this.grudgeActive = false;
  this.destinyBondActive = false;
  this.destinyBondTurns = 0;
  this.burnImmune = false;
  this.defRaiseBlocked = false;
  this.itemLocked = false;
  this.magicCoatActive = false;
  this.magicCoatTurns = 0;
  this.exclusiveActive = false;
  this.perishSongTurns = 0;
  this.perishSongSkipNextAction = false;
  this.nightmareActive = false;
  this.entryAddedType = null;
  this.entryHeldItemResolved = false;
  this.mimicInfo = null;
  this.tempMoveInfo = null;
  this.transformationInfo = null;
  this.moveKoTrigger = null;
  this.expAwarded = false;
};

Combatant.prototype.isFainted = function () {
  var fainted = this.hp <= 0;
  if (fainted) {
    this.resetSwitchModifiers();
    this.resetAlsoKOModifiers();
  }
  return fainted;
};

Combatant.prototype.setPersistentType = function (types) {
  var normalizedTypes = (Array.isArray(types) ? types : []).filter(function (type, index, entries) {
    return Boolean(type) && entries.indexOf(type) === index;
  }).slice(0, 2);
  if (!normalizedTypes.length) {
    return false;
  }
  this.type = normalizedTypes.slice();
  this.pokemon.type = normalizedTypes.slice();
  return true;
};

Combatant.prototype.resetSwitchModifiers = function () {
  if (this.status === "cnf_block" || this.status === "cnf_free") {
    this.status = null;
    this.confCounter = 0;
  }
  if (this.pendingDelayedStatus && this.pendingDelayedStatus.source === "yawn") {
    this.pendingDelayedStatus = null;
  }
  this.atkBuff = 0;
  this.defBuff = 0;
  this.atkNerf = 0;
  this.defNerf = 0;
  this.weatherAtkBuff = 0;
  this.weatherDefBuff = 0;
  this.wasHitSinceSwitch = false;
  this.prevTurnDamaged = false;
  this.prevTurnActive = false;
  this.turnBeforeMoveUsed = null;
  this.turnBeforeDamageTaken = 0;
  this.trappedTurns = 0;
  this.trappedMoveIndex = 0;
  this.seedTarget = null;
  this.seedValue = 0;
  this.pendingMove = null;
  this.pendingMoveTurns = 0;
  this.endure = false;
  this.chargeDamageMultiplier = 1;
  this.activeChargeDamageMultiplier = 1;
  this.semiInvulnerable = null;
  this.disabledMoves = [];
  this.stockpileUsed = false;
  this.rooted = false;
  this.grudgeActive = false;
  this.destinyBondActive = false;
  this.destinyBondTurns = 0;
  this.burnImmune = false;
  this.defRaiseBlocked = false;
  this.magicCoatActive = false;
  this.magicCoatTurns = 0;
  this.exclusiveActive = false;
  this.perishSongTurns = 0;
  this.perishSongSkipNextAction = false;
  this.nightmareActive = false;
  this.entryAddedType = null;
  this.entryHeldItemResolved = false;
  this._brightPowderActive = false;
  this._focusSashProtect = false;
  this.type = this.pokemon.type.slice();

  if (this.mimicInfo) {
    this.pokemon.moves[this.mimicInfo.slot] = this.mimicInfo.originalMove;
    this.mimicInfo = null;
  }
  if (this.tempMoveInfo) {
    this.pokemon.moves[this.tempMoveInfo.slot] = this.tempMoveInfo.originalMove;
    this.tempMoveInfo = null;
  }
  if (this.transformationInfo) {
    this.pokemon.type = this.transformationInfo.origType.slice();
    this.pokemon.moves = this.transformationInfo.origMoves.slice();
    this.type = this.transformationInfo.origType.slice();
    delete this.pokemon.transformedSpeciesKey;
    delete this.pokemon.transformedNdex;
    delete this.pokemon.transformedIsShiny;
    delete this.pokemon.transformedGender;
    this.transformationInfo = null;
  }
  this.updateMovesState();
};

Combatant.prototype.resetAlsoKOModifiers = function () {
  this.status = null;
  this.sleepCounter = 0;
  this.sleepDuration = 3;
  this.confCounter = 0;
  this.slpSource = null;
  this.pendingDelayedStatus = null;
  this.destinyBondActive = false;
  this.destinyBondTurns = 0;
  this.magicCoatActive = false;
  this.magicCoatTurns = 0;
  this.perishSongTurns = 0;
  this.perishSongSkipNextAction = false;
  this.nightmareActive = false;
  this.itemLocked = false;
  this.exclusiveActive = false;
  this.entryAddedType = null;
  this.entryHeldItemResolved = false;
};

Combatant.prototype.buffSelfAtk = function (amount) {
  if (amount > this.atkBuff) {
    this.atkBuff = amount;
  }
};

Combatant.prototype.buffSelfDef = function (amount) {
  if (this.defRaiseBlocked) {
    return;
  }
  if (amount > this.defBuff) {
    this.defBuff = amount;
  }
};

Combatant.prototype.nerfSelfAtk = function (amount) {
  if (this.team.teamMistCounter !== 0) {
    return;
  }
  if (amount > this.atkNerf) {
    this.atkNerf = amount;
  }
};

Combatant.prototype.nerfSelfDef = function (amount) {
  if (this.team.teamMistCounter !== 0) {
    return;
  }
  if (amount > this.defNerf) {
    this.defNerf = amount;
  }
};

Combatant.prototype.getAtkNerfAndBrn = function () {
  var burnNerf = this.status === "brn" ? Math.floor(this.level * 1.5) : 0;
  return Math.max(this.atkNerf, burnNerf);
};

Combatant.prototype.activatePending = function (move) {
  this.pendingMove = move;
  this.updateMovesState();
};

Combatant.prototype.removePending = function () {
  this.pendingMove = null;
  this.updateMovesState();
};

Combatant.prototype.disableMoveInhibit = function (moveKey) {
  if (this.disabledMoves.indexOf(moveKey) === -1) {
    this.disabledMoves.push(moveKey);
    this.updateMovesState();
  }
};

Combatant.prototype.updateMovesState = function () {
  if (this.tempMoveInfo !== null) {
    if (this.pendingMove === this.tempMoveInfo.copiedMove) {
      this.pokemon.moves[this.tempMoveInfo.slot] = this.tempMoveInfo.copiedMove;
    } else {
      this.pokemon.moves[this.tempMoveInfo.slot] = this.tempMoveInfo.originalMove;
      this.tempMoveInfo = null;
    }
  }

  if (this.mimicInfo !== null) {
    this.pokemon.moves[this.mimicInfo.slot] = this.mimicInfo.copiedMove;
  }

  var allDisabled = this.disabledMoves.length === this.pokemon.moves.length;
  var replacementMove = null;
  if (allDisabled) {
    replacementMove = createMove(m.struggle, {
      power: this.pokemon.moves[0].power,
      stats: this.pokemon.moves[0].stats
    });
  }

  var states = this.pokemon.moves.map(function (move, index) {
    var moveToShow = allDisabled && index === 0 ? replacementMove : move;
    var enabled;
    if (this.pendingMove !== null) {
      enabled = moveToShow.key === this.pendingMove.key;
    } else if (allDisabled) {
      enabled = index === 0;
    } else if (this.disabledMoves.length) {
      enabled = this.disabledMoves.indexOf(moveToShow.key) === -1;
    } else {
      enabled = true;
    }
    return { idx: index, move: moveToShow, enabled: enabled };
  }, this);

  this.moveStates = states;
  if (this.gui && typeof this.gui.applyMoveStates === "function") {
    this.gui.applyMoveStates(states);
  }
};
