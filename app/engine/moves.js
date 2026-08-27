import { MOVE_LIBRARY } from "../data/moves.js";
import { powerForLevel, statsForLevel } from "./level-calc.js";
import { moveBattleEvent } from "./battle-events.js";
var MOVE_BY_INDEX = {};

MOVE_LIBRARY.forEach(function (move) {
  if (!move || !Number.isFinite(move.index) || move.index <= 0) {
    throw new Error("Invalid move index: " + (move && move.key ? move.key : ""));
  }
  if (MOVE_BY_INDEX[move.index]) {
    throw new Error("Duplicate move index: " + move.index);
  }
  MOVE_BY_INDEX[move.index] = move;
});

function resolveMoveDefinition(moveRef) {
  var moveIndex;
  if (!moveRef) {
    return null;
  }
  if (typeof moveRef === "number") {
    return MOVE_BY_INDEX[moveRef] || null;
  }
  if (Array.isArray(moveRef)) {
    return MOVE_BY_INDEX[Number(moveRef[0])] || null;
  }
  if (moveRef.index) {
    moveIndex = Number(moveRef.index);
    return MOVE_BY_INDEX[moveIndex] || null;
  }
  return null;
}

function Move(moveDef, overrides) {
  overrides = overrides || {};
  this.key = moveDef.key;
  this.index = moveDef.index || 0;
  this.name = moveDef.name;
  this.power = overrides.power !== undefined ? overrides.power : 0;
  this.stats = overrides.stats !== undefined ? overrides.stats : 0;
  this.damagingMove = moveDef.damagingMove !== undefined ? moveDef.damagingMove : true;
  this.description = moveDef.description || "";
  this.logKey = moveDef.logKey || null;
  this.requestsBattleFlee = false;
  this.requestsBattleSwitch = Boolean(moveDef.requestsBattleSwitch);
  this.setWeather = moveDef.setWeather || null;
  this.weatherLabel = moveDef.weatherLabel || null;
  this.bindTurns = moveDef.bindTurns || 0;
  this.forcedCopiedMoveIndex = null;
  this.resolvedMoveIndex = null;
  this.forcedResolvedType = null;
  this.resolvedType = null;
  this._before = moveDef.effect_before || moveDef.before || null;
  this._after = moveDef.effect_after || moveDef.after || null;
  this.absorbed = 0;
  this.restored = 0;
  this.moveMult = 1;
  this.defMult = 1;
}

Move.prototype.before = function (attacker, defender, hit) {
  if (typeof this._before === "function") {
    this._before.call(this, attacker, defender, hit);
  }
};

Move.prototype.after = function (attacker, defender, hit) {
  if (typeof this._after === "function") {
    this._after.call(this, attacker, defender, hit);
  }
};

Move.prototype.prepareEvent = function (attacker, defender, damage, efficacy) {
  return moveBattleEvent(this.logKey, {
    attacker: attacker,
    defender: defender,
    move: this,
    damage: damage,
    efficacy: efficacy
  });
};

Move.prototype.toJSON = function () {
  return [this.index, this.power || 0, this.stats || 0];
};

export function createMove(moveRef, overrides) {
  var moveDef = resolveMoveDefinition(moveRef);
  if (!moveDef) {
    throw new Error("Move not found: " + (moveRef && moveRef.key ? moveRef.key : moveRef));
  }
  return new Move(moveDef, overrides);
}

export function moveFromJSON(data) {
  var moveDef;
  if (!Array.isArray(data)) {
    throw new Error("Invalid move format.");
  }
  moveDef = resolveMoveDefinition(Number(data[0]));
  if (!moveDef) {
    throw new Error("Move not found by index: " + data[0]);
  }
  return createMove(moveDef, {
    power: data[1] || 0,
    stats: data[2] || 0
  });
}

export function buildMoveList(moveDefs, level, options) {
  return moveDefs.map(function (moveDef) {
    return createMove(moveDef, {
      power: powerForLevel(level, options),
      stats: statsForLevel(level, options)
    });
  });
}

export function movePoolForLevel(speciesData, level) {
  var pool = [];
  Object.keys(speciesData.movesByLevel)
    .map(function (value) { return Number(value); })
    .sort(function (a, b) { return a - b; })
    .forEach(function (moveLevel) {
      if (moveLevel <= level) {
        speciesData.movesByLevel[moveLevel].forEach(function (moveDef) {
          pool.push(moveDef);
        });
      }
    });
  return pool;
}
