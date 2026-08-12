import { LOG_LIBRARY, MOVE_LIBRARY } from "../data/moves.js";
import { formatCatalogDescription } from "../data/move-format.js";
import { powerForLevel, statsForLevel } from "./level-calc.js";
var MOVE_BY_INDEX = {};

MOVE_LIBRARY.forEach(function (move) {
  if (!move || !Number.isFinite(move.index) || move.index <= 0) {
    throw new Error("Index mossa non valido: " + (move && move.name ? move.name : ""));
  }
  if (MOVE_BY_INDEX[move.index]) {
    throw new Error("Index mossa duplicato: " + move.index);
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
  this.logMessage = "";
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

Move.prototype.prepareLog = function (attacker, defender, damage, efficacy) {
  var formatter = LOG_LIBRARY[this.logKey];
  if (!formatter) {
    return null;
  }
  this.logMessage = formatter({
    self: this,
    attacker: attacker,
    defender: defender,
    move: this,
    damage: damage,
    efficacy: efficacy
  });
  if (damage === 1) {
    this.logMessage = this.logMessage.replace("danni", "danno");
  }
  return this.logMessage;
};

Move.prototype.toJSON = function () {
  return [this.index, this.power || 0, this.stats || 0];
};

export function createMove(moveRef, overrides) {
  var moveDef = resolveMoveDefinition(moveRef);
  if (!moveDef) {
    throw new Error("Mossa non trovata: " + (moveRef && moveRef.name ? moveRef.name : moveRef));
  }
  return new Move(moveDef, overrides);
}

export function moveFromJSON(data) {
  var moveDef;
  if (!Array.isArray(data)) {
    throw new Error("Formato mossa non valido.");
  }
  moveDef = resolveMoveDefinition(Number(data[0]));
  if (!moveDef) {
    throw new Error("Mossa non trovata per index: " + data[0]);
  }
  return createMove(moveDef, {
    power: data[1] || 0,
    stats: data[2] || 0
  });
}

export function buildMoveList(moveDefs, level) {
  return moveDefs.map(function (moveDef) {
    return createMove(moveDef, {
      power: powerForLevel(level),
      stats: statsForLevel(level)
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

export function formatDescription(move) {
  return String(move.description || "").replace(/\{(\w+)\}/g, function (_match, key) {
    var value = key === "power" ? move.power : (key === "stats" || key === "buff") ? move.stats : undefined;
    return value !== undefined ? value : "";
  });
}

export { formatCatalogDescription };
