import { TYPE_CHART } from "./type-chart.js";
import { random } from "../engine/deterministic-rng.js";
import { battleEvent, battleTeamRef, moveBattleEvent } from "../engine/battle-events.js";

function buildMoveLibrary(entries) {
  var library = [];
  var usedIndexes = {};

  Object.keys(entries).forEach(function (key) {
    var config = entries[key];
    var index = Number(config.index);
    var definition;

    if (!Number.isFinite(index) || index <= 0) {
      throw new Error("Invalid move index: " + (config && config.key ? config.key : index));
    }

    if (usedIndexes[index]) {
      throw new Error("Duplicate move index: " + index);
    }

    usedIndexes[index] = true;

    config.key = key;
    definition = Object.assign({}, config, {
      key: key,
      index: index,
      effect_before: config.effect_before || config.before || null,
      effect_after: config.effect_after || config.after || null
    });

    library.push(Object.freeze(definition));
  });

  return Object.freeze(library);}
function consumeMovePercentage(team) {
  if (team && typeof team.consumePercentage === "function") {
    return team.consumePercentage();
  }
  var wasPositive = Boolean(team && team.percentage);
  if (team) {
    team.percentage = !wasPositive;
  }
  return wasPositive;}
function chooseMoveIndex(move, candidates) {
  var forcedIndex = move ? Number(move.forcedCopiedMoveIndex) || 0 : 0;
  var chosenIndex;
  if (forcedIndex && candidates.indexOf(forcedIndex) !== -1) {
    chosenIndex = forcedIndex;
  } else {
    chosenIndex = candidates[Math.floor(random() * candidates.length)];
  }
  if (move) {
    move.resolvedMoveIndex = chosenIndex || null;
  }
  return chosenIndex;}
function applyStatusEffect(target, statusKey, options) {
  options = options || {};
  if (target) {
    target._lastStatusFailureReason = null;
  }
  if (!target || target.status !== null || target.pendingDelayedStatus) {
    if (target) {
      target._lastStatusFailureReason = "status";
    }
    return false;
  }
  if (!options.ignoreTeamProtection && target.team && target.team.teamStatusProtectCounter > 0) {
    target._lastStatusFailureReason = "safeguard";
    return false;
  }
  if (statusKey === "slp" && !options.ignoreSleepImmunity && target.team && target.team.sleepImmunityCounter > 0) {
    target._lastStatusFailureReason = "sleepImmunity";
    return false;
  }
  if (statusKey === "brn" && target.burnImmune) {
    target._lastStatusFailureReason = "status";
    return false;
  }
  target.status = statusKey;
  target.sleepCounter = 0;
  target.sleepDuration = 3;
  target.confCounter = 0;
  if (statusKey === "slp") {
    target.sleepDuration = options.sleepDuration || 3;
  }
  if (statusKey === "cnf_block" || statusKey === "cnf_free") {
    target.confCounter = 0;
  }
  return true;}
function statusFailureLogKey(target, statusKey) {
  if (target && target._lastStatusFailureReason === "safeguard") {
    return "status_safeguard";
  }
  if (statusKey === "slp" && target && target._lastStatusFailureReason === "sleepImmunity") {
    return "status_uproar";
  }
  return "status_not_done";}
function clearStatusEffect(target, statusKey) {
  if (!target || target.status !== statusKey) {
    return false;
  }
  target.status = null;
  target.sleepCounter = 0;
  target.sleepDuration = 3;
  target.confCounter = 0;
  target.slpSource = null;
  target.nightmareActive = false;
  return true;}
function setTeamPercentageNegative(team) {
  if (team) {
    team.percentage = false;
  }}
function simpleNegatePercentageMove() {
  return {
    damagingMove: false,
    after: function (_attacker, defender, hit) {
      if (hit) {
        setTeamPercentageNegative(defender.team);
        this.logKey = "lose_enem_perc";
      } else {
        this.logKey = "fail";
      }
    }
  };}
function buffSelfAttackGreatly(attacker, move) { attacker.buffSelfAtk(move.stats * 2); }
function bindDamageMove(bindTurns) {
  return {
    bindTurns: bindTurns || 4,
    before: function (_attacker, _defender, hit) {
      this.damagingMove = Boolean(hit);
    },
    after: function (_attacker, defender, hit) {
      if (hit) {
        if (defender.trappedTurns === 0 && defender.trappedMoveIndex === 0) {
          defender.trappedTurns = 0;
          defender.trappedMoveIndex = this.index;
          this.logKey = "dmg_bind";
        } else {
          this.logKey = "dmg";
        }
      } else {
        this.logKey = "fail";
      }
    }
  };}
function blockStatBoostMove(turns) {
  return {
    damagingMove: false,
    after: function (attacker) {
      var startPerc = consumeMovePercentage(attacker.team);
      if (startPerc) {
        if (attacker.team.teamMoveBoostProtectCounter === 0) {
          attacker.team.teamMoveBoostProtectCounter = 1;
          this.logKey = "no_move_boost_team";
        } else {
          this.logKey = "fail";
        }
      } else {
        this.logKey = "gain_self_perc";
      }
    }
  };}
function buffLossMove() {
  return {
    before: function (attacker, _defender, hit) {
      this.damagingMove = Boolean(hit);
      if (hit) {
        if (attacker.atkBuff > 0) {
          this.moveMult = 2;
          this.removesAttackBuff = true;
          this.logKey = "dmg_double";
        } else {
          this.removesAttackBuff = false;
          this.logKey = "dmg";
        }
      } else {
        this.removesAttackBuff = false;
        this.logKey = "fail";
      }
    },
    after: function (attacker) {
      if (this.removesAttackBuff) {
        attacker.atkBuff = 0;
        this.logKey = "dmg_double_lost_atk_buff";
      }
      this.removesAttackBuff = false;
      this.moveMult = 1;
    }
  };}
function chargeBuffMove() {
  return {
    damagingMove: false,
    before: function () {
      this.damagingMove = false;
    },
    after: function (attacker) {
      attacker.buffSelfDef(attacker.level);
      attacker.chargeDamageMultiplier = 2;
      this.logKey = "charge";
    }
  };}
function twoTurnDefenseDamageMove() {
  return {
    before: function (attacker, _defender, hit) {
      if (attacker.pendingMove === this && attacker.pendingMoveTurns > 0) {
        this.damagingMove = Boolean(hit);
        attacker.removePending();
        attacker.pendingMoveTurns = 0;
        this.logKey = hit ? "dmg" : "fail";
        return;
      }
      this.damagingMove = false;
      attacker.buffSelfDef(this.stats);
      attacker.activatePending(this);
      attacker.pendingMoveTurns = 1;
      this.logKey = "buff_self_def";
    }
  };}
function conditionX2Move(conditionFn) {
  return {
    before: function (attacker, defender, hit) {
      this.damagingMove = Boolean(hit);
      if (hit) {
        if (conditionFn(attacker, defender)) {
          this.moveMult = 2;
          this.logKey = "dmg_double";
        } else {
          this.logKey = "dmg";
        }
      } else {
        this.logKey = "fail";
      }
    },
    after: function () {
      this.moveMult = 1;
    }
  };}
function repeatLastTurnDamageMove() {
  return {
    before: function (attacker, _defender, hit) {
      this.damagingMove = Boolean(hit);
      if (hit) {
        if (attacker.turnBeforeMoveUsed === this) {
          this.moveMult = 1.5;
          this.logKey = "dmg_one_half";
        } else {
          this.logKey = "dmg";
        }
      } else {
        this.logKey = "fail";
      }
    },
    after: function () {
      this.moveMult = 1;
    }
  };}
function confuseBuffEnemyMove() {
  return {
    damagingMove: false,
    after: function (_attacker, defender, hit) {
      if (hit) {
        applyStatusEffect(defender, "cnf_block");
        defender.buffSelfAtk(this.stats);
        this.logKey = "cnf_buff_enem";
      } else {
        this.logKey = "fail";
      }
    }
  };}
function counterMove() {
  return {
    before: function (attacker, _defender, hit) {
      this.damagingMove = Boolean(hit);
      if (hit) {
        this.power = 2 * attacker.turnBeforeDamageTaken;
      }
    },
    after: function (_attacker, _defender, hit) {
      this.logKey = hit && this.power !== 0 ? "dmg" : "fail";
      this.power = 0;
    }
  };}
function createToggleDamageMove(onPositiveHit) {
  return {
    before: function (_attacker, _defender, hit) {
      this.damagingMove = Boolean(hit);
    },
    after: function (attacker, defender, hit) {
      var startPerc = consumeMovePercentage(attacker.team);
      if (hit) {
        if (startPerc) {
          onPositiveHit.call(this, attacker, defender);
        }
        if (!this.logKey) {
          this.logKey = startPerc ? "dmg_los_perc" : "dmg_rec_perc";
        }
      } else if (startPerc) {
        this.logKey = "lose_self_perc";
      } else {
        this.logKey = "gain_self_perc";
      }
    }
  };}
function damagePlusAlwaysStatus(statusKey, logKey) {
  return {
    before: function (_attacker, _defender, hit) {
      this.damagingMove = Boolean(hit);
    },
    after: function (_attacker, defender, hit) {
      if (hit) {
        applyStatusEffect(defender, statusKey);
        this.logKey = logKey;
      } else {
        this.logKey = "fail";
      }
    }
  };}
function damageRecoveryMove(fraction) {
  return {
    before: function (_attacker, _defender, hit) {
      this.damagingMove = Boolean(hit);
    },
    after: function (attacker, defender, hit) {
      if (hit) {
        this.absorbed = Math.max(1, Math.floor(defender.turnBeforeDamageTaken * fraction));
        attacker.hp = Math.min(attacker.hp + this.absorbed, attacker.pokemon.maxHp);
        this.logKey = "dmg_rec_hp";
      } else {
        this.logKey = "fail";
      }
    }
  };}
function recoilDamageMove() {
  return {
    before: function (_attacker, _defender, hit) {
      this.damagingMove = Boolean(hit);
    },
    after: function (attacker, defender, hit) {
      if (hit) {
        this.logKey = "dmg_los_hp";
        this.recoil = Math.floor(defender.turnBeforeDamageTaken / 4);
        attacker.hp = Math.max(0, attacker.hp - this.recoil);
      } else {
        this.logKey = "fail";
      }
    }
  };}
function rechargeDamageMove() {
  return {
    before: function (attacker, _defender, hit) {
      if (attacker.pendingMove === this && attacker.pendingMoveTurns > 0) {
        this.damagingMove = false;
        attacker.removePending();
        attacker.pendingMoveTurns = 0;
        this.logKey = "recharge";
        return;
      }

      this.damagingMove = Boolean(hit);
      this.moveMult = 2;
      attacker.activatePending(this);
      attacker.pendingMoveTurns = 1;
      this.logKey = hit ? "dmg_double" : "fail";
    },
    after: function () {
      this.moveMult = 1;
    }
  };}
function forcedTripleHitConfusionMove() {
  return {
    before: function (attacker, _defender, hit) {
      if (attacker.pendingMove === this) {
        attacker.pendingMoveTurns += 1;
        this.damagingMove = Boolean(hit);
        return;
      }
      if (!hit) {
        this.damagingMove = false;
        return;
      }
      attacker.activatePending(this);
      attacker.pendingMoveTurns = 1;
      this.damagingMove = true;
    },
    after: function (attacker, _defender, hit) {
      if (attacker.pendingMove === this && attacker.pendingMoveTurns >= 3) {
        applyStatusEffect(attacker, "cnf_block");
        attacker.removePending();
        attacker.pendingMoveTurns = 0;
        this.logKey = hit ? "dmg_self_cnf" : "dmg_self_cnf_fail";
        return;
      }
      this.logKey = hit ? "dmg" : "fail";
    }
  };}
function instantiateMoveFromLibrary(moveIndex, overrides) {
  var config = moveDefinitionFromIndex(moveIndex);
  if (!config) {
    return null;
  }

  overrides = overrides || {};
  return {
    key: config.key,
    index: config.index || 0,
    power: overrides.power !== undefined ? overrides.power : 0,
    stats: overrides.stats !== undefined ? overrides.stats : 0,
    damagingMove: config.damagingMove !== undefined ? config.damagingMove : true,
    logKey: config.logKey || null,
    requestsBattleFlee: false,
    requestsBattleSwitch: Boolean(config.requestsBattleSwitch),
    setWeather: config.setWeather || null,
    weatherLabel: config.weatherLabel || null,
    forcedCopiedMoveIndex: null,
    resolvedMoveIndex: null,
    forcedResolvedType: null,
    resolvedType: null,
    toJSON: function () {
      return [this.index, this.power || 0, this.stats || 0];
    },
    _before: config.effect_before || config.before || null,
    _after: config.effect_after || config.after || null,
    absorbed: 0,
    restored: 0,
    moveMult: 1,
    defMult: 1,
    before: function (attacker, defender, hit) {
      if (typeof this._before === "function") {
        this._before.call(this, attacker, defender, hit);
      }
    },
    after: function (attacker, defender, hit) {
      if (typeof this._after === "function") {
        this._after.call(this, attacker, defender, hit);
      }
    },
    prepareEvent: function (attacker, defender, damage, efficacy) {
      return moveBattleEvent(this.logKey, {
        attacker: attacker,
        defender: defender,
        move: this,
        damage: damage,
        efficacy: efficacy
      });
    }
  };}
function ohkoMove() {
  return {
    damagingMove: false,
    isOhkoMove: true,
    before: function (attacker, defender, hit) {
      var startPerc = consumeMovePercentage(attacker.team);
      if (startPerc) {
        if (hit) {
          defender.hp = 0;
          this.logKey = "1HKO";
        } else {
          this.logKey = "lose_self_perc";
        }
      } else {
        this.logKey = "gain_self_perc";
      }
    }
  };}
function preventDefRaiseMove() {
  return {
    damagingMove: false,
    after: function (_attacker, defender, hit) {
      if (hit) {
        defender.defRaiseBlocked = true;
        this.logKey = "def_raise_block";
      } else {
        this.logKey = "fail";
      }
    }
  };}
function disableLastMoveMove() {
  return {
    damagingMove: false,
    after: function (_attacker, defender, hit) {
      var lastMove = defender.turnBeforeMoveUsed;
      if (hit && lastMove !== null && lastMove.key !== "struggle") {
        defender.disableMoveInhibit(lastMove.key);
        this.logKey = "inhibit";
        this.relatedMoveKey = lastMove.key;
      } else {
        this.logKey = "fail";
      }
    }
  };}
function selfBuffDebuffMove() {
  return {
    damagingMove: false,
    after: function (attacker) {
      attacker.nerfSelfDef(this.stats);
      attacker.buffSelfAtk(this.stats * 2);
      this.logKey = "buff_debuff_self";
    }
  };}
function semiInvulnerableDamageMove(invulnerabilityLogKey, onHit) {
  return {
    before: function (attacker, _defender, hit) {
      if (attacker.pendingMove === this && attacker.pendingMoveTurns > 0) {
        this.damagingMove = Boolean(hit);
        attacker.semiInvulnerable = null;
        attacker.removePending();
        attacker.pendingMoveTurns = 0;
        this.logKey = hit ? "dmg" : "fail";
        return;
      }

      this.damagingMove = false;
      attacker.semiInvulnerable = this.key;
      attacker.activatePending(this);
      attacker.pendingMoveTurns = 1;
      this.logKey = invulnerabilityLogKey;
    },
    after: function (attacker, defender, hit) {
      if (hit && attacker.pendingMove !== this && typeof onHit === "function") {
        onHit.call(this, attacker, defender);
      }
    }
  };}
function simpleConfusionMove() {
  return {
    damagingMove: false,
    after: function (_attacker, defender, hit) {
      if (hit) {
        if (applyStatusEffect(defender, "cnf_block")) {
          this.logKey = "cnf";
        } else {
          this.logKey = statusFailureLogKey(defender, "cnf_block");
        }
      } else {
        this.logKey = "fail";
      }
    }
  };}
function simpleDamage() {
  return {
    before: function (_attacker, _defender, hit) {
      this.damagingMove = Boolean(hit);
    },
    after: function (_attacker, _defender, hit) {
      this.logKey = hit ? "dmg" : "fail";
    }
  };}
function missingHpDamageMove() {
  return {
    before: function (attacker, _defender, hit) {
      this.damagingMove = Boolean(hit);
      if (hit) {
        this.power = attacker.pokemon.maxHp - attacker.hp;
      }
    },
    after: function (_attacker, _defender, hit) {
      this.logKey = hit && this.power > 0 ? "dmg" : "fail";
    }
  };}
function simpleEnemyAttackNerf() {
  return {
    damagingMove: false,
    after: function (_attacker, defender, hit) {
      if (hit && defender.team.teamMistCounter === 0) {
        defender.nerfSelfAtk(this.stats);
        this.logKey = "nerf_enem_atk";
      } else {
        this.logKey = "fail";
      }
    }
  };}
function simpleEnemyDefenseNerf() {
  return {
    damagingMove: false,
    after: function (_attacker, defender, hit) {
      if (hit && defender.team.teamMistCounter === 0) {
        defender.nerfSelfDef(this.stats);
        this.logKey = "nerf_enem_def";
      } else {
        this.logKey = "fail";
      }
    }
  };}
function simpleEnemyAtkDefNerf() {
  return {
    damagingMove: false,
    after: function (_attacker, defender, hit) {
      if (hit && defender.team.teamMistCounter === 0) {
        defender.nerfSelfAtk(this.stats);
        defender.nerfSelfDef(this.stats);
        this.logKey = "nerf_enem_atk_def";
      } else {
        this.logKey = "fail";
      }
    }
  };}
function simpleHalfRecovery() {
  return {
    damagingMove: false,
    logKey: "rest_hp",
    after: function (attacker) {
      this.restored = Math.floor(attacker.pokemon.maxHp / 2);
      attacker.hp = Math.min(attacker.hp + this.restored, attacker.pokemon.maxHp);
    }
  };}
function simpleParalysisMove() {
  return {
    damagingMove: false,
    after: function (_attacker, defender, hit) {
      if (hit) {
        if (applyStatusEffect(defender, "par_block")) {
          this.logKey = "par";
        } else {
          this.logKey = statusFailureLogKey(defender, "par_block");
        }
      } else {
        this.logKey = "fail";
      }
    }
  };}
function simpleBurnMove() {
  return {
    damagingMove: false,
    after: function (_attacker, defender, hit) {
      if (hit) {
        if (applyStatusEffect(defender, "brn")) {
          this.logKey = "brn";
        } else {
          this.logKey = statusFailureLogKey(defender, "brn");
        }
      } else {
        this.logKey = "fail";
      }
    }
  };}
function simpleSelfAttackBuff() {
  return {
    damagingMove: false,
    logKey: "buff_self_atk",
    after: function (attacker) {
      attacker.buffSelfAtk(this.stats);
    }
  };}
function simpleSelfAttackBigBuff() {
  return {
    damagingMove: false,
    logKey: "buff_self_atk_big",
    after: function (attacker) {
      buffSelfAttackGreatly(attacker, this);
    }
  };}
function simpleSelfAttackDefenseBuff() {
  return {
    damagingMove: false,
    logKey: "buff_self_atk_def",
    after: function (attacker) {
      attacker.buffSelfAtk(this.stats);
      attacker.buffSelfDef(this.stats);
    }
  };}
function simpleSelfDefenseBuff() {
  return {
    damagingMove: false,
    logKey: "buff_self_def",
    after: function (attacker) {
      attacker.buffSelfDef(this.stats);
    }
  };}
function simpleSleepMove() {
  return {
    damagingMove: false,
    after: function (_attacker, defender, hit) {
      if (hit) {
        if (applyStatusEffect(defender, "slp")) {
          this.logKey = "slp";
        } else {
          this.logKey = statusFailureLogKey(defender, "slp");
        }
      } else {
        this.logKey = "fail";
      }
    }
  };}
function simpleTeamAttackBuff() {
  return {
    damagingMove: false,
    after: function (attacker) {
      if (attacker.team.buffAtkCounter === 0) {
        attacker.team.buffTeamAtk(this.stats);
        attacker.team.buffAtkCounter = 0;
        this.logKey = "buff_team_atk";
      } else {
        this.logKey = "fail";
      }
    }
  };}
function simpleTeamDefenseBuff() {
  return {
    damagingMove: false,
    after: function (attacker) {
      if (attacker.team.buffDefCounter === 0) {
        attacker.team.buffTeamDef(this.stats);
        attacker.team.buffDefCounter = 1;
        this.logKey = "buff_team_def";
      } else {
        this.logKey = "fail";
      }
    }
  };}
function teamStatusCureMove() {
  return {
    damagingMove: false,
    after: function (attacker) {
      var count = 0;
      attacker.team.combatantList.forEach(function (c) {
        if (c.status || c.sleepCounter || c.confCounter) {
          c.status = null;
          c.sleepCounter = 0;
          c.sleepDuration = 3;
          c.confCounter = 0;
          c.nightmareActive = false;
          count++;
        }
      });
      if (count > 0) {
        this.logKey = "cure_status_team";
      } else {
        this.logKey = "fail";
      }
    }
  };}
function toggleSecondaryStatus(statusKey, hitLogKey) {
  return {
    before: function (_attacker, _defender, hit) {
      this.damagingMove = Boolean(hit);
    },
    after: function (attacker, defender, hit) {
      var startPerc = consumeMovePercentage(attacker.team);

      if (hit) {
        if (startPerc) {
          if (applyStatusEffect(defender, statusKey)) {
            this.logKey = hitLogKey;
          } else if (defender && defender._lastStatusFailureReason === "safeguard") {
            this.logKey = "dmg_status_safeguard";
          } else if (statusKey === "slp" && defender && defender._lastStatusFailureReason === "sleepImmunity") {
            this.logKey = "dmg_status_uproar";
          } else {
            this.logKey = "dmg_los_perc";
          }
        } else {
          this.logKey = "dmg_rec_perc";
        }
      } else if (startPerc) {
        this.logKey = "lose_self_perc";
      } else {
        this.logKey = "gain_self_perc";
      }
    }
  };}
function trapMove() {
  return {
    damagingMove: false,
    after: function (_attacker, defender, hit) {
      if (hit && defender.trappedTurns === 0 && defender.trappedMoveIndex === 0) {
        defender.trappedTurns = 99;
        this.logKey = "trap";
      } else {
        this.logKey = "fail";
      }
    }
  };}
function targetTypeDoubleDamageMove(targetType) {
  return {
    before: function (_attacker, defender, hit) {
      this.damagingMove = Boolean(hit);
      if (hit) {
        if (defender.type && defender.type.indexOf(targetType) !== -1) {
          this.moveMult = 2;
          this.logKey = "dmg_double";
        } else {
          this.logKey = "dmg";
        }
      } else {
        this.logKey = "fail";
      }
    },
    after: function () {
      this.moveMult = 1;
    }
  };}
function weatherRecoveryMove() {
  return {
    damagingMove: false,
    after: function (attacker) {
      var weather = attacker.team.battleManager && attacker.team.battleManager.weather;
      var fraction = 0.5;
      if (weather === "sand" || weather === "hail" || weather === "rain") {
        fraction = 0.25;
      } else if (weather === "sun") {
        fraction = 1;
      }
      this.restored = Math.floor(attacker.pokemon.maxHp * fraction);
      attacker.hp = Math.min(attacker.hp + this.restored, attacker.pokemon.maxHp);
      this.logKey = "rest_hp";
    }
  };}
function futureSightMove() {
  return {
    before: function (_attacker, _defender, hit) {
      this.damagingMove = false;
    },
    after: function (attacker, _defender, hit) {
      if (hit && !attacker.team.futureSight.active) {
        attacker.team.futureSight.active = true;
        attacker.team.futureSight.timer = 3;
        attacker.team.futureSight.power = this.power || 1;
        attacker.team.futureSight.attackerTypes = attacker.type.slice();
        attacker.team.futureSight.attackerSpeciesKey = attacker.pokemon.speciesKey;
        attacker.team.futureSight.moveKey = this.key;
        attacker.team.futureSight.targetIndex = defender.team.combatantList.indexOf(defender);
        this.logKey = "future_sight_set";
      } else {
        this.logKey = "fail";
      }
    }
  };}
function moveDefinitionFromIndex(moveIndex) {
  var index = Number(moveIndex);
  return MOVE_LIBRARY.find(function (move) {
    return move.index === index;
  }) || null;}
function isMultiTurnMoveIndex(moveIndex) {
  var move = moveDefinitionFromIndex(moveIndex);
  return Boolean(move && MULTI_TURN_MOVE_INDEXES.has(move.index));}
export function isMultiturnEffectMoveIndex(moveIndex) {
  var move = moveDefinitionFromIndex(moveIndex);
  return Boolean(move && MULTITURN_EFFECT_MOVE_INDEXES.has(move.index));}
function isNotCopyableMoveIndex(moveIndex) {
  var move = moveDefinitionFromIndex(moveIndex);
  return Boolean(move && NOT_COPYABLE_MOVE_INDEXES.has(move.index));}

export const luster_purge = Object.assign(createToggleDamageMove(function(attacker) { attacker.buffSelfAtk(this.stats); this.logKey = "buff_self_atk"; }), { index: 1 });
export const fissure = Object.assign(ohkoMove(), { index: 2 });
export const stockpile = { index: 3, damagingMove: false, logKey: "buff_self_def", before: function(attacker) { attacker.buffSelfDef(this.stats); attacker.stockpileUsed = true; } };
export const acid = Object.assign(createToggleDamageMove(function(_attacker, defender) { if (defender.team.teamMistCounter === 0) { defender.nerfSelfDef(this.stats); this.logKey = "nerf_enem_def"; } }), { index: 4 });
export const flatter = Object.assign(confuseBuffEnemyMove(), { index: 5 });
export const air_cutter = Object.assign(simpleDamage(), { index: 6 });
export const aerial_ace = Object.assign(targetTypeDoubleDamageMove("fighting"), { index: 7 });
export const sky_attack = Object.assign(simpleDamage(), { index: 8 });
export const aeroblast = {
        index: 9,
        before: function (_attacker, _defender, hit) {
          this.damagingMove = Boolean(hit);
          this.defMult = 0;
        },
        after: function (_attacker, _defender, hit) {
          this.defMult = 1;
          this.logKey = hit ? "dmg" : "fail";
        }
      };
export const sharpen = Object.assign(simpleSelfAttackBuff(), { index: 10 });
export const agility = Object.assign(simpleSelfAttackBuff(), { index: 11 });
export const steel_wing = Object.assign(createToggleDamageMove(function(attacker) { attacker.buffSelfDef(this.stats); this.logKey = "buff_self_def"; }), { index: 12 });
export const helping_hand = Object.assign(simpleTeamAttackBuff(), { index: 13 });
export const amnesia = Object.assign(simpleSelfDefenseBuff(), { index: 14 });
export const aromatherapy = Object.assign(teamStatusCureMove(), { index: 15 });
export const assist = {
        index: 16,
        copiedMove: null,
        before: function (attacker) {
          var teamMoveIndexes = [];
          var chosenIndex;
          var copied;
          this.copiedMove = null;
          attacker.team.combatantList.forEach(function (c) {
            c.pokemon.moves.forEach(function (move) {
              if (!isNotCopyableMoveIndex(move.index) && teamMoveIndexes.indexOf(move.index) === -1) {
                teamMoveIndexes.push(move.index);
              }
            });
          });
          chosenIndex = chooseMoveIndex(this, teamMoveIndexes);
          if (chosenIndex) {
            copied = instantiateMoveFromLibrary(chosenIndex, {
              power: this.power,
              stats: this.stats
            });
            this.copiedMove = copied;
            if (isMultiTurnMoveIndex(chosenIndex)) {
              var slot = attacker.pokemon.moves.indexOf(this);
              if (slot !== -1) {
                attacker.tempMoveInfo = {
                  slot: slot,
                  originalMove: attacker.pokemon.moves[slot],
                  copiedMove: copied
                };
                attacker.updateMovesState();
              }
            }
          }
        }
      };
export const absorb = Object.assign(damageRecoveryMove(1/8), { index: 17 });
export const torment = Object.assign(disableLastMoveMove(), { index: 18 });
export const wing_attack = Object.assign(simpleDamage(), { index: 19 });
export const barrage = Object.assign(simpleDamage(), { index: 20 });
export const quick_attack = Object.assign(simpleDamage(), { index: 21 });
export const attract = Object.assign(simpleEnemyAttackNerf(), { index: 22 });
export const self_destruct = {
        index: 23,
        before: function (attacker, _defender, hit) {
          this.damagingMove = Boolean(hit);
          this.power = attacker.pokemon.maxHp;
          this.moveMult = 2;
        },
        after: function (attacker, _defender, hit) {
          attacker.hp = 0;
          this.moveMult = 1;
          this.logKey = hit ? "selfdestruct" : "fail";
        }
      };
export const wrap = Object.assign(bindDamageMove(4), { index: 24 });
export const tackle = Object.assign(simpleDamage(), { index: 25 });
export const uproar = {
        index: 26,
        before: function (_attacker, _defender, hit) {
          this.damagingMove = Boolean(hit);
        },
        after: function (attacker, _defender, hit) {
          if (hit) {
            attacker.team.sleepImmunityCounter = 1;
            this.logKey = "dmg_sleep_immunity";
          } else {
            this.logKey = "fail";
          }
        }
      };
export const barrier = Object.assign(simpleSelfDefenseBuff(), { index: 27 });
export const peck = Object.assign(simpleDamage(), { index: 28 });
export const block = Object.assign(trapMove(), { index: 29 });
export const roar = {
        index: 30,
        damagingMove: false,
        logKey: "roar",
        after: function (_attacker, defender, hit) {
          if (hit) {
            var switchResult = defender.team.switchRandom();
            this.switchEvents = switchResult.events || [];
            this.logKey = switchResult.ok ? "roar" : "fail";
          } else {
            this.logKey = "fail";
          }
        }
      };
export const bubble = Object.assign(simpleDamage(), { index: 31 });
export const bubble_beam = Object.assign(simpleDamage(), { index: 32 });
export const blizzard = Object.assign(toggleSecondaryStatus("frz", "dmg_frz"), { index: 33 });
export const pound = Object.assign(simpleDamage(), { index: 34 });
export const headbutt = Object.assign(simpleDamage(), { index: 35 });
export const ember = Object.assign(simpleDamage(), { index: 36 });
export const brick_break = {
        index: 37,
        before: function (attacker, defender, hit) {
          this.damagingMove = Boolean(hit);
          if (hit) {
            if (defender && defender.team && (defender.team.teamDefBuff !== 0 || defender.team.buffDefCounter !== 0)) {
              var manager = attacker && attacker.team && attacker.team.battleManager;
              defender.team.teamDefBuff = 0;
              defender.team.buffDefCounter = 0;
              if (manager) {
                manager.emit(battleEvent("move.brickBreakScreens", { team: battleTeamRef(defender.team) }));
              }
            }
            this.logKey = "dmg";
          } else {
            this.logKey = "fail";
          }
        }
      };
export const fake_out = Object.assign(simpleDamage(), { index: 38 });
export const swagger = Object.assign(confuseBuffEnemyMove(), { index: 39 });
export const milk_drink = Object.assign(simpleHalfRecovery(), { index: 40 });
export const rock_blast = Object.assign(simpleDamage(), { index: 41 });
export const blaze_kick = Object.assign(simpleDamage(), { index: 42 });
export const high_jump_kick = Object.assign(simpleDamage(), { index: 43 });
export const rolling_kick = Object.assign(simpleDamage(), { index: 44 });
export const jump_kick = Object.assign(simpleDamage(), { index: 45 });
export const calm_mind = Object.assign(simpleSelfAttackDefenseBuff(), { index: 46 });
export const camouflage = {
        index: 47,
        damagingMove: false,
        after: function (attacker, defender, hit) {
          if (hit) {
            attacker.setPersistentType(defender.type);
            this.resolvedType = defender.type[0] || null;
            this.logKey = "convers";
          } else {
            this.logKey = "fail";
          }
        }
      };
export const sing = Object.assign(simpleSleepMove(), { index: 48 });
export const skull_bash = Object.assign(twoTurnDefenseDamageMove(), { index: 49 });
export const waterfall = Object.assign(targetTypeDoubleDamageMove("flying"), { index: 50 });
export const focus_punch = Object.assign(conditionX2Move(function(a) { return a.prevTurnActive && !a.prevTurnDamaged; }), { index: 51 });
export const kinesis = Object.assign(simpleEnemyAttackNerf(), { index: 52 });
export const iron_tail = Object.assign(createToggleDamageMove(function(_attacker, defender) { if (defender.team.teamMistCounter === 0) { defender.nerfSelfDef(this.stats); this.logKey = "nerf_enem_def"; } }), { index: 53 });
export const tail_glow = Object.assign(simpleSelfAttackBigBuff(), { index: 54 });
export const thrash = Object.assign(forcedTripleHitConfusionMove(), { index: 55 });
export const low_kick = Object.assign(targetTypeDoubleDamageMove("normal"), { index: 56 });
export const tail_whip = Object.assign(simpleEnemyDefenseNerf(), { index: 57 });
export const mud_shot = Object.assign(simpleDamage(), { index: 58 });
export const karate_chop = Object.assign(targetTypeDoubleDamageMove("dark"), { index: 59 });
export const comet_punch = Object.assign(simpleDamage(), { index: 60 });
export const swift = Object.assign(simpleDamage(), { index: 61 });
export const confusion = Object.assign(simpleDamage(), { index: 62 });
export const counter = Object.assign(counterMove(), { index: 63 });
export const reversal = Object.assign(missingHpDamageMove(), { index: 64 });
export const conversion = {
        index: 65,
        damagingMove: false,
        logKey: "convers",
        after: function (attacker, defender, hit) {
          if (hit) {
            attacker.setPersistentType(defender.type);
            this.resolvedType = defender.type[0] || null;
          } else {
            this.logKey = "fail";
          }
        }
      };
export const conversion_2 = {
        index: 66,
        damagingMove: false,
        after: function (attacker, defender, hit) {
          var candidates;
          var chosenType;
          if (!hit) {
            this.logKey = "fail";
            return;
          }
          candidates = Object.keys(TYPE_CHART).filter(function (defenderType) {
            var total = (defender.type || []).reduce(function (product, attackerType) {
              var row = TYPE_CHART[attackerType] || {};
              return product * (row[defenderType] !== undefined ? row[defenderType] : 1);
            }, 1);
            return total < 1;
          });
          candidates = candidates.length ? candidates : Object.keys(TYPE_CHART);
          if (this.forcedResolvedType && candidates.indexOf(this.forcedResolvedType) !== -1) {
            chosenType = this.forcedResolvedType;
          } else {
            chosenType = candidates[Math.floor(random() * candidates.length)];
          }
          this.resolvedType = chosenType || null;
          if (!chosenType) {
            this.logKey = "fail";
            return;
          }
          attacker.setPersistentType([chosenType]);
          this.logKey = "convers";
        }
      };
export const body_slam = Object.assign(toggleSecondaryStatus("par_block", "dmg_par"), { index: 67 });
export const cosmic_power = Object.assign(simpleSelfDefenseBuff(), { index: 68 });
export const cotton_spore = Object.assign(simpleEnemyAttackNerf(), { index: 69 });
export const soft_boiled = Object.assign(simpleHalfRecovery(), { index: 70 });
export const growth = Object.assign(simpleSelfAttackDefenseBuff(), { index: 71 });
export const feather_dance = Object.assign(simpleEnemyAttackNerf(), { index: 72 });
export const swords_dance = Object.assign(simpleSelfAttackBigBuff(), { index: 73 });
export const lovely_kiss = Object.assign(simpleSleepMove(), { index: 74 });
export const wish = { index: 75, damagingMove: false, after: function(attacker) { this.restored = Math.floor(attacker.pokemon.maxHp / 2); attacker.team.wishHealAmount += this.restored; attacker.team.wishSourceSpeciesKey = attacker.pokemon.speciesKey; this.logKey = "wish"; } };
export const destiny_bond = {
        index: 76,
        damagingMove: false,
        after: function (attacker) {
          attacker.destinyBondActive = true;
          attacker.destinyBondTurns = 1;
          this.logKey = "destiny_bond";
        }
      };
export const dynamic_punch = Object.assign(damagePlusAlwaysStatus("cnf_block", "dmg_cnf"), { index: 77 });
export const spite = Object.assign(simpleNegatePercentageMove(), { index: 78 });
export const future_sight = Object.assign(futureSightMove(), { index: 79 });
export const water_sport = {
        index: 80,
        damagingMove: false,
        after: function (attacker) {
          attacker.buffSelfDef(this.stats);
          attacker.burnImmune = true;
          this.logKey = "buff_self_def_burn";
        }
      };
export const sweet_kiss = Object.assign(simpleConfusionMove(), { index: 81 });
export const double_slap = Object.assign(simpleDamage(), { index: 82 });
export const twineedle = Object.assign(toggleSecondaryStatus("psn", "dmg_psn"), { index: 83 });
export const double_kick = Object.assign(repeatLastTurnDamageMove(), { index: 84 });
export const double_team = Object.assign(simpleSelfDefenseBuff(), { index: 85 });
export const dragon_claw = Object.assign(simpleDamage(), { index: 86 });
export const dragon_dance = Object.assign(simpleSelfAttackDefenseBuff(), { index: 87 });
export const dragon_breath = Object.assign(toggleSecondaryStatus("par_block", "dmg_par"), { index: 88 });
export const eruption = Object.assign(conditionX2Move(function(a) { return a.hp > a.pokemon.maxHp / 2; }), { index: 89 });
export const imprison = {
        index: 90,
        damagingMove: false,
        after: function (attacker, defender, hit) {
          if (hit) {
            var keys = attacker.pokemon.moves.map(function (m) { return m.key; });
            var blocked = [];
            defender.pokemon.moves.forEach(function (m) {
              if (keys.indexOf(m.key) !== -1 && defender.disabledMoves.indexOf(m.key) === -1) {
                defender.disabledMoves.push(m.key);
                blocked.push(m.key);
              }
            });
            if (blocked.length > 0) {
              defender.exclusiveActive = true;
              defender.updateMovesState();
              this.logKey = "imprison";
            } else {
              this.logKey = "fail";
            }
          } else {
            this.logKey = "fail";
          }
        }
      };
export const explosion = {
        index: 91,
        before: function (attacker, _defender, hit) {
          this.damagingMove = Boolean(hit);
          this.power = attacker.pokemon.maxHp;
          this.moveMult = 2;
        },
        after: function (attacker, _defender, hit) {
          attacker.hp = 0;
          this.moveMult = 1;
          this.logKey = hit ? "selfdestruct" : "fail";
        }
      };
export const extreme_speed = Object.assign(simpleDamage(), { index: 92 });
export const extrasensory = Object.assign(simpleDamage(), { index: 93 });
export const facade = {
        index: 94,
        before: function (attacker, _defender, hit) {
          this.damagingMove = Boolean(hit);
          if (hit) {
            if (attacker.status !== null) {
              this.moveMult = 2;
              this.logKey = "dmg_double";
            } else {
              this.logKey = "dmg";
            }
          } else {
            this.logKey = "fail";
          }
        },
        after: function () {
          this.moveMult = 1;
        }
      };
export const zap_cannon = Object.assign(damagePlusAlwaysStatus("par_block", "dmg_par"), { index: 95 });
export const fake_tears = Object.assign(simpleEnemyDefenseNerf(), { index: 96 });
export const false_swipe = {
        index: 97,
        before: function (_attacker, _defender, hit) {
          this.damagingMove = Boolean(hit);
        },
        after: function (_attacker, defender, hit) {
          if (hit) {
            if (defender.hp === 1) {
              this.logKey = "dmg";
            } else if (defender.hp < 1) {
              defender.hp = 1;
              this.logKey = "dmg_1hp";
            } else {
              this.logKey = "dmg";
            }
          } else {
            this.logKey = "fail";
          }
        }
      };
export const mud_sport = Object.assign(simpleEnemyAttackNerf(), { index: 98 });
export const muddy_water = Object.assign(simpleDamage(), { index: 99 });
export const sludge = Object.assign(toggleSecondaryStatus("psn", "dmg_psn"), { index: 100 });
export const sludge_bomb = Object.assign(targetTypeDoubleDamageMove("fairy"), { index: 101 });
export const mud_slap = Object.assign(targetTypeDoubleDamageMove("electric"), { index: 102 });
export const charm = Object.assign(simpleEnemyAttackNerf(), { index: 103 });
export const leaf_blade = Object.assign(simpleDamage(), { index: 104 });
export const metal_claw = Object.assign(createToggleDamageMove(function(attacker) { attacker.buffSelfAtk(this.stats); this.logKey = "buff_self_atk"; }), { index: 105 });
export const iron_defense = Object.assign(simpleSelfDefenseBuff(), { index: 106 });
export const metal_sound = Object.assign(simpleEnemyDefenseNerf(), { index: 107 });
export const feint_attack = Object.assign(targetTypeDoubleDamageMove("ghost"), { index: 108 });
export const flail = Object.assign(missingHpDamageMove(), { index: 109 });
export const flash = Object.assign(simpleNegatePercentageMove(), { index: 110 });
export const focus_energy = Object.assign(simpleTeamAttackBuff(), { index: 111 });
export const magical_leaf = Object.assign(simpleDamage(), { index: 112 });
export const razor_leaf = Object.assign(simpleDamage(), { index: 113 });
export const strength = Object.assign(simpleDamage(), { index: 114 });
export const ancient_power = Object.assign(createToggleDamageMove(function(attacker) { attacker.buffSelfAtk(this.stats); attacker.buffSelfDef(this.stats); this.logKey = "buff_self_atk_def"; }), { index: 115 });
export const secret_power = {
        index: 116,
        before: function (_attacker, _defender, hit) {
          this.damagingMove = Boolean(hit);
        },
        after: function (attacker, defender, hit) {
          var weather = attacker.team.battleManager && attacker.team.battleManager.weather;
          if (hit && weather && weather !== "normal") {
            if (weather === "sun" && applyStatusEffect(defender, "brn")) {
              this.logKey = "dmg_brn";
            } else if (weather === "rain" && applyStatusEffect(defender, "par_block")) {
              this.logKey = "dmg_par";
            } else if (weather === "sand" && applyStatusEffect(defender, "cnf_block")) {
              this.logKey = "dmg_cnf";
            } else if (weather === "hail" && applyStatusEffect(defender, "frz")) {
              this.logKey = "dmg_frz";
            } else {
              this.logKey = "dmg";
            }
          } else if (hit) {
            this.logKey = "dmg";
          } else {
            this.logKey = "fail";
          }
        }
      };
export const mist_ball = Object.assign(createToggleDamageMove(function(attacker) { attacker.buffSelfDef(this.stats); this.logKey = "buff_self_def"; }), { index: 117 });
export const dig = Object.assign(semiInvulnerableDamageMove(), { index: 118 });
export const rock_slide = Object.assign(targetTypeDoubleDamageMove("bug"), { index: 119 });
export const vine_whip = Object.assign(simpleDamage(), { index: 120 });
export const frustration = Object.assign(simpleDamage(), { index: 121 });
export const thunderbolt = Object.assign(toggleSecondaryStatus("par_block", "dmg_par"), { index: 122 });
export const leer = Object.assign(simpleEnemyDefenseNerf(), { index: 123 });
export const fire_blast = Object.assign(toggleSecondaryStatus("brn", "dmg_brn"), { index: 124 });
export const will_o_wisp = Object.assign(simpleBurnMove(), { index: 125 });
export const fire_punch = Object.assign(targetTypeDoubleDamageMove("steel"), { index: 126 });
export const fury_attack = Object.assign(repeatLastTurnDamageMove(), { index: 127 });
export const thief = Object.assign(createToggleDamageMove(function(attacker, defender) {
    var manager = attacker.team && attacker.team.battleManager;
    this.logKey = manager && manager.stealHeldItem(attacker, defender) ? "steal_item" : "dmg_los_perc";
  }), { index: 128 });
export const icicle_spear = Object.assign(simpleDamage(), { index: 129 });
export const ice_punch = Object.assign(targetTypeDoubleDamageMove("dragon"), { index: 130 });
export const ice_beam = Object.assign(toggleSecondaryStatus("frz", "dmg_frz"), { index: 131 });
export const guillotine = Object.assign(ohkoMove(), { index: 132 });
export const giga_drain = Object.assign(damageRecoveryMove(1/2), { index: 133 });
export const sunny_day = {
        index: 134,
        damagingMove: false,
        logKey: "weather_set",
        weatherLabel: "Sunny Day",
        setWeather: "sun",
        after: function () {
          this.logKey = "weather_set";
        }
      };
export const pay_day = Object.assign(simpleDamage(), { index: 135 });
export const scratch = Object.assign(simpleDamage(), { index: 136 });
export const hail = {
        index: 137,
        damagingMove: false,
        logKey: "weather_set",
        weatherLabel: "Hail",
        setWeather: "hail",
        after: function () {
          this.logKey = "weather_set";
        }
      };
export const bulk_up = Object.assign(simpleSelfAttackDefenseBuff(), { index: 138 });
export const hyper_voice = Object.assign(simpleDamage(), { index: 139 });
export const howl = Object.assign(simpleSelfAttackBuff(), { index: 140 });
export const hydro_pump = Object.assign(simpleDamage(), { index: 141 });
export const water_pulse = Object.assign(toggleSecondaryStatus("cnf_block", "dmg_cnf"), { index: 142 });
export const horn_attack = Object.assign(simpleDamage(), { index: 143 });
export const cross_chop = Object.assign(simpleDamage(), { index: 144 });
export const nightmare = {
        index: 145,
        damagingMove: false,
        after: function (_attacker, defender, hit) {
          if (hit && defender.status === "slp") {
            defender.nightmareActive = true;
            this.logKey = "nightmare";
          } else if (hit) {
            this.logKey = "status_not_done";
          } else {
            this.logKey = "fail";
          }
        }
      };
export const detect = Object.assign(blockStatBoostMove(5), { index: 146 });
export const disable = Object.assign(disableLastMoveMove(), { index: 147 });
export const pursuit = {
        index: 148,
        before: function (attacker, _defender, hit) {
          this.damagingMove = Boolean(hit);
          if (hit && this.isSwitchReaction) {
            this.moveMult = 1.5;
            this.logKey = "dmg_pursuit_switch";
          } else {
            this.logKey = hit ? "dmg" : "fail";
          }
        },
        after: function () {
          this.moveMult = 1;
        }
      };
export const swallow = { index: 149, damagingMove: false, after: function(attacker) { if (attacker.stockpileUsed) { attacker.hp = attacker.pokemon.maxHp; this.logKey = "rest_hp"; } else { this.logKey = "fail"; } } };
export const hidden_power = {
        index: 150,
        before: function (_attacker, _defender, hit) {
          this.damagingMove = Boolean(hit);
        },
        after: function (attacker, _defender, hit) {
          if (!hit) {
            this.logKey = "fail";
            return;
          }
          if (attacker.team.teamBoostSuppressCounter === 0) {
            attacker.team.teamBoostSuppressCounter = 1;
            this.logKey = "dmg_suppress_boost";
          } else {
            this.logKey = "dmg";
          }
        }
      };
export const hyper_beam = Object.assign(rechargeDamageMove(), { index: 151 });
export const hyper_fang = Object.assign(simpleDamage(), { index: 152 });
export const hypnosis = Object.assign(simpleSleepMove(), { index: 153 });
export const rage = Object.assign(conditionX2Move(function(a) { return a.hp < a.pokemon.maxHp; }), { index: 154 });
export const dragon_rage = Object.assign(simpleDamage(), { index: 155 });
export const slash = Object.assign(simpleDamage(), { index: 156 });
export const flamethrower = Object.assign(toggleSecondaryStatus("brn", "dmg_brn"), { index: 157 });
export const lick = Object.assign(toggleSecondaryStatus("par_block", "dmg_par"), { index: 158 });
export const bind = Object.assign(bindDamageMove(4), { index: 159 });
export const mind_reader = Object.assign(chargeBuffMove(), { index: 160 });
export const constrict = Object.assign(simpleDamage(), { index: 161 });
export const lock_on = Object.assign(chargeBuffMove(), { index: 162 });
export const moonlight = Object.assign(simpleHalfRecovery(), { index: 163 });
export const sacred_fire = { index: 164, before: function(_attacker, _defender, hit) { this.damagingMove = Boolean(hit); }, after: function(attacker, defender, hit) { if (hit) { clearStatusEffect(attacker, "frz"); applyStatusEffect(defender, "brn"); this.logKey = "dmg_brn"; } else { this.logKey = "fail"; } } };
export const magic_coat = {
        index: 165,
        damagingMove: false,
        after: function (attacker, _defender, hit) {
          if (hit) {
            attacker.magicCoatActive = true;
            attacker.magicCoatTurns = 2;
            this.logKey = "magic_coat";
          } else {
            this.logKey = "fail";
          }
        }
      };
export const magnitude = Object.assign(conditionX2Move(function(a, d) { return d.semiInvulnerable !== null && d.semiInvulnerable === "dig"; }), { index: 166 });
export const pain_split = {
        index: 167,
        damagingMove: false,
        after: function (attacker, defender, hit) {
          if (hit) {
            var avg = Math.floor((attacker.hp + defender.hp) / 2);
            attacker.hp = avg;
            defender.hp = avg;
            this.logKey = "pain_split";
          } else {
            this.logKey = "fail";
          }
        }
      };
export const curse = Object.assign(selfBuffDebuffMove(), { index: 168 });
export const mean_look = Object.assign(trapMove(), { index: 169 });
export const dream_eater = {
        index: 170,
        before: function (_attacker, defender, hit) {
          this.damagingMove = Boolean(hit && defender.status === "slp");
          this.logKey = this.damagingMove ? "dmg_rec_hp" : "fail";
        },
        after: function (attacker, defender, hit) {
          if (hit && defender.status === "slp") {
            this.absorbed = Math.max(1, Math.floor(defender.turnBeforeDamageTaken / 2));
            attacker.hp = Math.min(attacker.hp + this.absorbed, attacker.pokemon.maxHp);
            this.logKey = "dmg_rec_hp";
          } else {
            this.absorbed = 0;
            this.logKey = "fail";
          }
        }
      };
export const smelling_salts = {
        index: 171,
        before: function (_attacker, defender, hit) {
          this.damagingMove = Boolean(hit);
          if (hit) {
            if (defender && (defender.status === "par_block" || defender.status === "par_free")) {
              this.moveMult = 2;
              defender.status = null;
              defender.sleepCounter = 0;
              defender.sleepDuration = 3;
              defender.confCounter = 0;
              this.logKey = "dmg_double";
            } else {
              this.logKey = "dmg";
            }
          } else {
            this.logKey = "fail";
          }
        },
        after: function () {
          this.moveMult = 1;
        }
      };
export const crabhammer = Object.assign(simpleDamage(), { index: 172 });
export const morning_sun = Object.assign(weatherRecoveryMove(), { index: 173 });
export const meditate = Object.assign(simpleSelfAttackBuff(), { index: 174 });
export const mega_kick = Object.assign(simpleDamage(), { index: 175 });
export const megahorn = Object.assign(targetTypeDoubleDamageMove("psychic"), { index: 176 });
export const mega_punch = Object.assign(simpleDamage(), { index: 177 });
export const mega_drain = Object.assign(damageRecoveryMove(1/4), { index: 178 });
export const grass_whistle = Object.assign(simpleSleepMove(), { index: 179 });
export const memento = Object.assign(simpleEnemyAtkDefNerf(), { index: 180 });
export const meteor_mash = Object.assign(createToggleDamageMove(function(attacker) { attacker.buffSelfAtk(this.stats); this.logKey = "buff_self_atk"; }), { index: 181 });
export const metronome = {
        index: 182,
        damagingMove: false,
        copiedMove: null,
        before: function (attacker) {
          this.copiedMove = null;
          var candidates = MOVE_LIBRARY.map(function (move) { return move.index; }).filter(function (moveIndex) {
            return !isNotCopyableMoveIndex(moveIndex);
          });
          var chosenIndex = chooseMoveIndex(this, candidates);
          var copied = instantiateMoveFromLibrary(chosenIndex, {
            power: this.power,
            stats: this.stats
          });

          this.copiedMove = copied;
          if (isMultiTurnMoveIndex(chosenIndex)) {
            var slot = attacker.pokemon.moves.indexOf(this);
            attacker.tempMoveInfo = {
              slot: slot,
              originalMove: attacker.pokemon.moves[slot],
              copiedMove: copied
            };
            attacker.updateMovesState();
          }
        }
      };
export const string_shot = Object.assign(simpleEnemyAttackNerf(), { index: 183 });
export const mimic = {
        index: 184,
        damagingMove: false,
        after: function (attacker, defender) {
          var src = defender.turnBeforeMoveUsed;
          var copied;
          var slot;
          var alreadyKnown;

          if (!src || isNotCopyableMoveIndex(src.index) || !src.index) {
            this.logKey = "fail";
            return;
          }

          copied = instantiateMoveFromLibrary(src.index, {
            power: this.power,
            stats: this.stats
          });
          if (!copied) {
            this.logKey = "fail";
            return;
          }

          alreadyKnown = attacker.pokemon.moves.some(function (move) {
            return move.index === src.index;
          });
          if (alreadyKnown) {
            this.logKey = "fail";
            return;
          }

          slot = attacker.pokemon.moves.indexOf(this);
          attacker.mimicInfo = {
            slot: slot,
            originalMove: attacker.pokemon.moves[slot],
            copiedMove: copied
          };
          attacker.updateMovesState();
          this.logKey = "mimic";
        }
      };
export const minimize = Object.assign(simpleSelfDefenseBuff(), { index: 185 });
export const pin_missile = Object.assign(repeatLastTurnDamageMove(), { index: 186 });
export const bite = Object.assign(simpleDamage(), { index: 187 });
export const seismic_toss = {
        index: 188,
        before: function (attacker, _defender, hit) {
          this.damagingMove = Boolean(hit);
          this.power = attacker.hp;
        },
        after: function (_attacker, _defender, hit) {
          this.logKey = hit ? "dmg" : "fail";
        }
      };
export const whirlpool = Object.assign(bindDamageMove(4), { index: 189 });
export const smokescreen = Object.assign(simpleEnemyAttackNerf(), { index: 190 });
export const nature_power = Object.assign(conditionX2Move(function(a) { return a.team.battleManager && a.team.battleManager.weather !== null; }), { index: 191 });
export const mist = {
        index: 192,
        damagingMove: false,
        after: function (attacker) {
          if (attacker.team.teamMistCounter === 0) {
            attacker.team.teamMistCounter = 1;
            this.logKey = "no_stat_nerf_team";
          } else {
            this.logKey = "fail";
          }
        }
      };
export const haze = {
        index: 193,
        damagingMove: false,
        after: function (attacker, defender) {
          var teams = [attacker.team, defender.team];
          teams.forEach(function (team) {
            team.teamAtkBuff = 0;
            team.buffAtkCounter = 0;
            team.teamDefBuff = 0;
            team.buffDefCounter = 0;

            team.combatantList.forEach(function (combatant) {
              combatant.atkBuff = 0;
              combatant.defBuff = 0;
              combatant.atkNerf = 0;
              combatant.defNerf = 0;
            });
          });
          this.logKey = "nube";
        }
      };
export const doom_desire = Object.assign(futureSightMove(), { index: 194 });
export const octazooka = Object.assign(createToggleDamageMove(function(_attacker, defender) { if (defender.team.teamMistCounter === 0) { defender.nerfSelfAtk(this.stats); this.logKey = "nerf_enem_atk"; } }), { index: 195 });
export const outrage = Object.assign(forcedTripleHitConfusionMove(), { index: 196 });
export const night_shade = {
        index: 197,
        before: function (attacker, _defender, hit) {
          this.damagingMove = Boolean(hit);
          this.power = attacker.hp;
        },
        after: function (_attacker, _defender, hit) {
          this.logKey = hit ? "dmg" : "fail";
        }
      };
export const heat_wave = Object.assign(simpleDamage(), { index: 198 });
export const shock_wave = Object.assign(simpleDamage(), { index: 199 });
export const bone_club = {
        index: 200,
        before: function (_attacker, _defender, hit) {
          this.damagingMove = Boolean(hit);
          this.defMult = 0;
        },
        after: function (_attacker, _defender, hit) {
          this.defMult = 1;
          this.logKey = hit ? "dmg" : "fail";
        }
      };
export const bonemerang = Object.assign(simpleDamage(), { index: 201 });
export const bone_rush = Object.assign(simpleDamage(), { index: 202 });
export const weather_ball = Object.assign(conditionX2Move(function(attacker) { return Boolean(attacker.team.battleManager && attacker.team.battleManager.weather); }), { index: 203 });
export const ice_ball = Object.assign(simpleDamage(), { index: 204 });
export const shadow_ball = Object.assign(createToggleDamageMove(function(_attacker, defender) { if (defender.team.teamMistCounter === 0) { defender.nerfSelfDef(this.stats); this.logKey = "nerf_enem_def"; } }), { index: 205 });
export const belly_drum = Object.assign(selfBuffDebuffMove(), { index: 206 });
export const stun_spore = Object.assign(simpleParalysisMove(), { index: 207 });
export const leech_seed = {
        index: 208,
        before: function (_attacker, _defender, hit) {
          this.damagingMove = Boolean(hit);
        },
        after: function (attacker, defender, hit) {
          if (hit) {
            defender.seedTarget = attacker.team;
            defender.seedValue = Math.max(1, Math.floor(defender.pokemon.maxHp / 8));
            this.logKey = "dmg_seed";
          } else {
            this.logKey = "fail";
          }
        }
      };
export const bide = Object.assign(twoTurnDefenseDamageMove(), { index: 209 });
export const drill_peck = Object.assign(simpleDamage(), { index: 210 });
export const horn_drill = Object.assign(ohkoMove(), { index: 211 });
export const stomp = Object.assign(simpleDamage(), { index: 212 });
export const petal_dance = Object.assign(forcedTripleHitConfusionMove(), { index: 213 });
export const beat_up = Object.assign(conditionX2Move(function(a) { if (a.team.teamKOTracker) { a.team.teamKOTracker = false; return true; } return false; }), { index: 214 });
export const slack_off = Object.assign(simpleHalfRecovery(), { index: 215 });
export const rain_dance = {
        index: 216,
        damagingMove: false,
        logKey: "weather_set",
        weatherLabel: "Rain Dance",
        setWeather: "rain",
        after: function () {
          this.logKey = "weather_set";
        }
      };
export const water_gun = Object.assign(simpleDamage(), { index: 217 });
export const powder_snow = Object.assign(simpleDamage(), { index: 218 });
export const vise_grip = Object.assign(simpleDamage(), { index: 219 });
export const foresight = Object.assign(preventDefRaiseMove(), { index: 220 });
export const knock_off = {
        index: 221,
        before: function (_attacker, _defender, hit) {
            this.damagingMove = Boolean(hit);
          },
        after: function (_attacker, defender, hit) {
          if (hit) {
            defender.itemLocked = true;
            this.logKey = "embargo";
          } else {
            this.logKey = "fail";
          }
        }
      };
export const sweet_scent = Object.assign(simpleEnemyDefenseNerf(), { index: 222 });
export const protect = Object.assign(blockStatBoostMove(5), { index: 223 });
export const taunt = Object.assign(disableLastMoveMove(), { index: 224 });
export const psych_up = {
        index: 225,
        damagingMove: false,
        after: function (attacker, defender) {
          attacker.atkBuff = Math.max(attacker.atkBuff, defender.atkBuff);
          attacker.defBuff = Math.max(attacker.defBuff, defender.defBuff);
          attacker.atkNerf = Math.max(attacker.atkNerf, defender.atkNerf);
          attacker.defNerf = Math.max(attacker.defNerf, defender.defNerf);
          this.logKey = "copy_stats";
        }
      };
export const psychic = Object.assign(createToggleDamageMove(function(_attacker, defender) { if (defender.team.teamMistCounter === 0) { defender.nerfSelfDef(this.stats); this.logKey = "nerf_enem_def"; } }), { index: 226 });
export const psywave = {
        index: 227,
        before: function (attacker, _defender, hit) {
          this.power = attacker.pokemon.level * 1.5;
          this.damagingMove = Boolean(hit);
        },
        after: function (_attacker, _defender, hit) {
          this.logKey = hit ? "dmg" : "fail";
        }
      };
export const psybeam = Object.assign(targetTypeDoubleDamageMove("poison"), { index: 228 });
export const psycho_boost = Object.assign(simpleDamage(), { index: 229 });
export const shadow_punch = Object.assign(simpleDamage(), { index: 230 });
export const mach_punch = Object.assign(simpleDamage(), { index: 231 });
export const needle_arm = Object.assign(simpleDamage(), { index: 232 });
export const spikes = {
        index: 233,
        damagingMove: false,
        after: function (attacker, _defender, hit) {
          if (hit) {
            var opponent = (attacker.team === attacker.team.battleManager.playerTeam) ? attacker.team.battleManager.enemyTeam : attacker.team.battleManager.playerTeam;
            opponent.spikesActive = true;
            opponent.spikesLevel = attacker.level;
            this.logKey = "spikes_set";
          } else {
            this.logKey = "fail";
          }
        }
      };
export const sheer_cold = Object.assign(ohkoMove(), { index: 234 });
export const ingrain = { index: 235, damagingMove: false, after: function(attacker) { attacker.rooted = true; this.logKey = "root"; } };
export const gust = Object.assign(conditionX2Move(function(_a, d) { return d.semiInvulnerable === "fly"; }), { index: 236 });
export const harden = Object.assign(simpleSelfDefenseBuff(), { index: 237 });
export const aurora_beam = Object.assign(createToggleDamageMove(function(_attacker, defender) { if (defender.team.teamMistCounter === 0) { defender.nerfSelfAtk(this.stats); this.logKey = "nerf_enem_atk"; } }), { index: 238 });
export const trick = {
        index: 239,
        damagingMove: false,
        after: function (attacker, defender, hit) {
          var manager = attacker.team && attacker.team.battleManager;
          if (hit && manager && manager.swapHeldItems(attacker, defender)) {
            this.logKey = "trick_item";
          } else {
            this.logKey = "fail";
          }
        }
      };
export const spider_web = Object.assign(trapMove(), { index: 240 });
export const grudge = {
        index: 241,
        damagingMove: false,
        after: function (attacker) {
          attacker.grudgeActive = true;
          this.logKey = "grudge";
        }
      };
export const rapid_spin = {
        index: 242,
        before: function (_attacker, _defender, hit) {
          this.damagingMove = Boolean(hit);
        },
        after: function (attacker, _defender, hit) {
          var removedEffect;
          if (hit) {
            this.logKey = "dmg";
            if (attacker && attacker.team && attacker.team.spikesActive) {
              attacker.team.spikesActive = false;
              attacker.team.spikesLevel = 0;
              removedEffect = true;
            }
            if (attacker && attacker.trappedMoveIndex && isMultiturnEffectMoveIndex(attacker.trappedMoveIndex)) {
              attacker.trappedTurns = 0;
              attacker.trappedMoveIndex = 0;
              removedEffect = true;
            }
            if (attacker && attacker.seedTarget !== null) {
              attacker.seedTarget = null;
              attacker.seedValue = 0;
              removedEffect = true;
            }
            if (removedEffect) {
              this.logKey = "rapid_spin";
            }
          } else {
            this.logKey = "fail";
          }
        }
      };
export const present = {
        index: 243,
        before: function (attacker, _defender, hit) {
          this._healTarget = consumeMovePercentage(attacker.team);
          this.damagingMove = Boolean(hit);
        },
        after: function (_attacker, defender, hit) {
          if (hit && this._healTarget) {
            var heal = Math.floor(defender.pokemon.maxHp / 4);
            defender.hp = Math.min(defender.hp + heal, defender.pokemon.maxHp);
            this.logKey = "present_heal";
          } else if (hit) {
            this.logKey = "dmg";
          } else {
            this.logKey = "fail";
          }
          delete this._healTarget;
        }
      };
export const endure = { index: 244, damagingMove: false, after: function(attacker) { attacker.endure = true; this.logKey = "endure"; } };
export const defense_curl = {
        index: 245,
        damagingMove: false,
        logKey: "buff_self_def",
        before: function (attacker) {
          attacker.buffSelfDef(this.stats);
          attacker.defenseCurlUsed = true;
        }
      };
export const recycle = {
        index: 246,
        damagingMove: false,
        after: function (attacker) {
          var manager = attacker.team && attacker.team.battleManager;
          this.logKey = manager && manager.recycleHeldItem(attacker) ? "recycle_item" : "fail";
        }
      };
export const take_down = Object.assign(recoilDamageMove(), { index: 247 });
export const reflect = Object.assign(simpleTeamDefenseBuff(), { index: 248 });
export const bounce = Object.assign(semiInvulnerableDamageMove("invul_fly", function (_attacker, defender) {
        if (applyStatusEffect(defender, "par_block")) {
          this.logKey = "dmg_par";
        }
      }), { index: 249 });
export const endeavor = {
        index: 250,
        damagingMove: false,
        after: function (attacker, defender, hit) {
          if (hit) {
            defender.hp = Math.min(defender.hp, attacker.hp);
            this.logKey = "endeavor";
          } else {
            this.logKey = "fail";
          }
        }
      };
export const refresh = { index: 251, damagingMove: false, after: function(attacker) { if (attacker.status || attacker.sleepCounter || attacker.confCounter) { attacker.status = null; attacker.sleepCounter = 0; attacker.sleepDuration = 3; attacker.confCounter = 0; attacker.slpSource = null; attacker.nightmareActive = false; this.logKey = "cure_status"; } else { this.logKey = "fail"; } } };
export const heal_bell = Object.assign(teamStatusCureMove(), { index: 252 });
export const encore = {
        index: 253,
        damagingMove: false,
        after: function (_attacker, defender, hit) {
          var lastMove = defender.turnBeforeMoveUsed;
          var forcedMove;
          var forcedMoveAfter;
          if (hit && lastMove !== null && lastMove.key !== "struggle" && !defender.pendingMove) {
            forcedMove = instantiateMoveFromLibrary(lastMove.index, {
              power: lastMove.power,
              stats: lastMove.stats
            });
            if (!forcedMove) {
              this.logKey = "fail";
              return;
            }
            forcedMove.isForcedMove = true;
            forcedMove.copiato = lastMove;
            defender.activatePending(forcedMove);
            defender.pendingMoveTurns = 1;
            this.logKey = "repeat";
            this.relatedMoveKey = lastMove.key;
          } else {
            this.logKey = "fail";
          }
        }
      };
export const rest = {
        index: 254,
        damagingMove: false,
        before: function (attacker) {
          if (attacker.pendingDelayedStatus) {
            this.logKey = "fail";
          } else if (attacker.status !== null || attacker.hp !== attacker.pokemon.maxHp) {
            attacker.status = null;
            attacker.sleepCounter = 0;
            attacker.sleepDuration = 3;
            attacker.confCounter = 0;
            attacker.slpSource = null;
            attacker.nightmareActive = false;
            applyStatusEffect(attacker, "slp", {
              ignoreTeamProtection: true,
              ignoreSleepImmunity: true,
              sleepDuration: 2
            });
            attacker.hp = attacker.pokemon.maxHp;
            this.logKey = "rest";
          } else {
            this.logKey = "fail";
          }
        }
      };
export const recover = Object.assign(simpleHalfRecovery(), { index: 255 });
export const withdraw = Object.assign(simpleSelfDefenseBuff(), { index: 256 });
export const return_move = Object.assign(simpleDamage(), { index: 257 });
export const rock_tomb = Object.assign(createToggleDamageMove(function(attacker) { attacker.buffSelfDef(this.stats); this.logKey = "buff_self_def"; }), { index: 258 });
export const rollout = Object.assign(conditionX2Move(function(a) { return a.defenseCurlUsed; }), { index: 259 });
export const growl = Object.assign(simpleEnemyAttackNerf(), { index: 260 });
export const flame_wheel = { index: 261, before: function(_attacker, _defender, hit) { this.damagingMove = Boolean(hit); }, after: function(attacker, _defender, hit) { if (hit) { clearStatusEffect(attacker, "frz"); this.logKey = "dmg"; } else { this.logKey = "fail"; } } };
export const snore = { index: 262, before: function(attacker, _defender, hit) { if (attacker.status !== "slp") { this.damagingMove = false; return; } this.damagingMove = Boolean(hit); }, after: function(_attacker, _defender, hit) { this.logKey = this.damagingMove && hit ? "dmg" : "fail"; } };
export const sand_tomb = Object.assign(bindDamageMove(4), { index: 263 });
export const safeguard = {
        index: 264,
        damagingMove: false,
        after: function (attacker) {
          var startPerc = consumeMovePercentage(attacker.team);
          if (startPerc) {
            attacker.team.teamStatusProtectCounter = 1;
            this.logKey = "status_protect";
          } else {
            this.logKey = "gain_self_perc";
          }
        }
      };
export const leech_life = Object.assign(damageRecoveryMove(1/4), { index: 265 });
export const rock_throw = Object.assign(targetTypeDoubleDamageMove("ice"), { index: 266 });
export const yawn = {
        index: 267,
        damagingMove: false,
        after: function (_attacker, defender, hit) {
          if (hit) {
            if (!defender) {
              this.logKey = "fail";
            } else if (defender.status !== null || defender.pendingDelayedStatus) {
              this.logKey = "status_not_done";
            } else if (defender.team && defender.team.teamStatusProtectCounter > 0) {
              this.logKey = "status_safeguard";
            } else if (defender.team && defender.team.sleepImmunityCounter > 0) {
              this.logKey = "status_uproar";
            } else {
              defender.pendingDelayedStatus = {
                status: "slp",
                sleepDuration: 3,
                confCounter: 0,
                delay: 1,
                source: "yawn"
              };
              this.logKey = "sleep_delayed";
            }
          } else {
            this.logKey = "fail";
          }
        }
      };
export const arm_thrust = Object.assign(simpleDamage(), { index: 268 });
export const light_screen = Object.assign(simpleTeamDefenseBuff(), { index: 269 });
export const slam = Object.assign(simpleDamage(), { index: 270 });
export const sketch = {
        index: 271,
        damagingMove: false,
        after: function (attacker, defender, hit) {
          if (hit) {
            var src = defender.turnBeforeMoveUsed;
            if (src && src.index && !isNotCopyableMoveIndex(src.index)) {
              var copied = instantiateMoveFromLibrary(src.index, {
                power: this.power,
                stats: this.stats
              });
              if (copied) {
                var alreadyKnown = attacker.pokemon.moves.some(function (move) {
                  return move.index === copied.index;
                });
                if (alreadyKnown) {
                  this.logKey = "fail";
                  return;
                }
                var slot = attacker.pokemon.moves.indexOf(this);
                if (slot !== -1) {
                  attacker.pokemon.moves[slot] = copied;
                  attacker.updateMovesState();
                  this.logKey = "mimic";
                  return;
                }
              }
            }
            this.logKey = "fail";
          } else {
            this.logKey = "fail";
          }
        }
      };
export const spark = Object.assign(toggleSecondaryStatus("par_block", "dmg_par"), { index: 272 });
export const snatch = {
        index: 273,
        stolenAtkBuff: 0,
        stolenDefBuff: 0,
        before: function (_attacker, _defender, hit) {
          this.damagingMove = Boolean(hit);
        },
        after: function (attacker, defender, hit) {
          var startPerc;
          this.stolenAtkBuff = 0;
          this.stolenDefBuff = 0;
          if (!hit) {
            this.logKey = "fail";
            return;
          }
          startPerc = consumeMovePercentage(attacker.team);
          if (!startPerc) {
            this.logKey = "dmg_rec_perc";
            return;
          }
          if (defender.atkBuff > 0) {
            this.stolenAtkBuff = defender.atkBuff;
            attacker.buffSelfAtk(defender.atkBuff);
            defender.atkBuff = 0;
          }
          if (defender.defBuff > 0) {
            this.stolenDefBuff = defender.defBuff;
            attacker.buffSelfDef(defender.defBuff);
            defender.defBuff = 0;
          }
          this.logKey = this.stolenAtkBuff || this.stolenDefBuff ? "dmg_snatch_buffs" : "dmg";
        }
      };
export const struggle = Object.assign(recoilDamageMove(), { index: 274 });
export const acid_armor = Object.assign(simpleSelfDefenseBuff(), { index: 275 });
export const double_edge = Object.assign(recoilDamageMove(), { index: 276 });
export const signal_beam = Object.assign(toggleSecondaryStatus("cnf_block", "dmg_cnf"), { index: 277 });
export const odor_sleuth = Object.assign(preventDefRaiseMove(), { index: 278 });
export const bullet_seed = Object.assign(simpleDamage(), { index: 279 });
export const spit_up = {
        index: 280,
        before: function (attacker, _defender, hit) {
          this.damagingMove = Boolean(hit);
          if (hit && attacker.stockpileUsed) {
            this.moveMult = 2;
            this.logKey = "dmg_double";
          } else {
            this.logKey = hit ? "dmg" : "fail";
          }
        },
        after: function () {
          this.moveMult = 1;
        }
      };
export const fury_swipes = Object.assign(simpleDamage(), { index: 281 });
export const astonish = Object.assign(simpleDamage(), { index: 282 });
export const crunch = Object.assign(createToggleDamageMove(function(_attacker, defender) { if (defender.team.teamMistCounter === 0) { defender.nerfSelfDef(this.stats); this.logKey = "nerf_enem_def"; } }), { index: 283 });
export const glare = Object.assign(simpleParalysisMove(), { index: 284 });
export const synthesis = Object.assign(weatherRecoveryMove(), { index: 285 });
export const smog = Object.assign(toggleSecondaryStatus("psn", "dmg_psn"), { index: 286 });
export const solar_beam = {
        index: 287,
        before: function (attacker, _defender, hit) {
          var weather = attacker.team.battleManager && attacker.team.battleManager.weather;

          if (attacker.pendingMove === this && attacker.pendingMoveTurns > 0) {
            this.damagingMove = Boolean(hit);
            this.moveMult = hit ? 2 : 1;
            attacker.removePending();
            attacker.pendingMoveTurns = 0;
            this.logKey = hit ? "dmg_double" : "fail";
            return;
          }

          if (weather === "sun") {
            this.damagingMove = Boolean(hit);
            this.moveMult = hit ? 2 : 1;
            this.logKey = hit ? "dmg_double" : "fail";
            return;
          }

          this.damagingMove = false;
          this.moveMult = 1;
          attacker.activatePending(this);
          attacker.pendingMoveTurns = 1;
          this.logKey = "charge";
        },
        after: function () {
          this.moveMult = 1;
        }
      };
export const tickle = Object.assign(simpleEnemyAtkDefNerf(), { index: 288 });
export const sonic_boom = Object.assign(simpleDamage(), { index: 289 });
export const sleep_powder = Object.assign(simpleSleepMove(), { index: 290 });
export const sleep_talk = {
        index: 291,
        damagingMove: false,
        copiedMove: null,
        before: function (attacker, _defender, hit) {
          var candidates;
          var chosenIndex;
          if (!hit || !attacker || attacker.status !== "slp") {
            this.copiedMove = null;
            this.logKey = "fail";
            return;
          }
          candidates = attacker.pokemon.moves.map(function (move) {
            return move.index;
          }).filter(function (moveIndex) {
            return moveIndex && Number(moveIndex) !== sleep_talk.index && !isNotCopyableMoveIndex(moveIndex);
          });
          chosenIndex = chooseMoveIndex(this, candidates);
          this.copiedMove = chosenIndex ? instantiateMoveFromLibrary(chosenIndex, {
            power: this.power,
            stats: this.stats
          }) : null;
          this.logKey = this.copiedMove ? null : "fail";
        },
        after: function (attacker, _defender, hit) {
          if (!hit || !attacker || attacker.status !== "slp" || !this.copiedMove) {
            this.logKey = "fail";
          }
        }
      };
export const substitute = {
        index: 292,
        damagingMove: false,
        after: function (attacker) {
          attacker.endure = true;
          this.logKey = "endure";
        }
      };
export const charge = Object.assign(chargeBuffMove(), { index: 293 });
export const dive = Object.assign(semiInvulnerableDamageMove(), { index: 294 });
export const submission = Object.assign(recoilDamageMove(), { index: 295 });
export const rock_smash = Object.assign(targetTypeDoubleDamageMove("rock"), { index: 296 });
export const spike_cannon = Object.assign(repeatLastTurnDamageMove(), { index: 297 });
export const mirror_coat = Object.assign(counterMove(), { index: 298 });
export const mirror_move = {
        index: 299,
        damagingMove: false,
        copiedMove: null,
        before: function (attacker, defender) {
          var src = defender.turnBeforeMoveUsed;
          var copied;
          if (!src || isNotCopyableMoveIndex(src.index) || !src.index) {
            this.logKey = "fail";
            return;
          }

          copied = instantiateMoveFromLibrary(src.index, {
            power: this.power,
            stats: this.stats
          });
          if (!copied) {
            this.logKey = "fail";
            return;
          }

          this.copiedMove = copied;
          if (isMultiTurnMoveIndex(src.index)) {
            var slot = attacker.pokemon.moves.indexOf(this);
            attacker.tempMoveInfo = {
              slot: slot,
              originalMove: attacker.pokemon.moves[slot],
              copiedMove: copied
            };
            attacker.updateMovesState();
          }
        }
      };
export const splash = {
        index: 300,
        damagingMove: false,
        after: function () {
          this.logKey = "smp_move";
        }
      };
export const spore = Object.assign(simpleSleepMove(), { index: 301 });
export const baton_pass = {
        index: 302,
        damagingMove: false,
        requestsBattleSwitch: true,
        after: function (attacker, _defender, hit) {
          if (hit) {
            var team = attacker.team;
            var aliveCount = team.combatantList.filter(function (c) { return !c.isFainted(); }).length;
            if (aliveCount <= 1) {
              this.logKey = "fail";
              return;
            }
            team.batonPassStats = {
              atkBuff: attacker.atkBuff,
              defBuff: attacker.defBuff,
              atkNerf: attacker.atkNerf,
              defNerf: attacker.defNerf,
              status: attacker.status,
              sleepCounter: attacker.sleepCounter,
              sleepDuration: attacker.sleepDuration,
              slpSource: attacker.slpSource,
              confCounter: attacker.confCounter,
              pendingDelayedStatus: attacker.pendingDelayedStatus ? Object.assign({}, attacker.pendingDelayedStatus) : null
            };
            this.logKey = "baton_pass";
          } else {
            this.logKey = "fail";
          }
        }
      };
export const dizzy_punch = Object.assign(toggleSecondaryStatus("cnf_block", "dmg_cnf"), { index: 303 });
export const confuse_ray = Object.assign(simpleConfusionMove(), { index: 304 });
export const sky_uppercut = Object.assign(conditionX2Move(function(_a, d) { return d.semiInvulnerable === "fly"; }), { index: 305 });
export const teeter_dance = Object.assign(simpleConfusionMove(), { index: 306 });
export const screech = Object.assign(simpleEnemyDefenseNerf(), { index: 307 });
export const supersonic = Object.assign(simpleConfusionMove(), { index: 308 });
export const super_fang = {
        index: 309,
        damagingMove: false,
        before: function () {
          this.directDamage = 0;
        },
        after: function (_attacker, defender, hit) {
          if (hit) {
            var initialHp = defender.hp;
            defender.hp = Math.max(0, defender.hp - Math.max(1, Math.ceil(defender.hp / 2)));
            this.directDamage = initialHp - defender.hp;
          }
          this.logKey = hit ? "dmg" : "fail";
        }
      };
export const covet = Object.assign(createToggleDamageMove(function(attacker, defender) {
    var manager = attacker.team && attacker.team.battleManager;
    this.logKey = manager && manager.stealHeldItem(attacker, defender) ? "steal_item" : "dmg_los_perc";
  }), { index: 310 });
export const surf = Object.assign(targetTypeDoubleDamageMove("ground"), { index: 311 });
export const cut = Object.assign(targetTypeDoubleDamageMove("grass"), { index: 312 });
export const fury_cutter = Object.assign(repeatLastTurnDamageMove(), { index: 313 });
export const teleport = {
        index: 314,
        damagingMove: false,
        logKey: "fail",
        after: function () {
          this.requestsBattleFlee = true;
        }
      };
export const clamp = Object.assign(bindDamageMove(4), { index: 315 });
export const earthquake = Object.assign(targetTypeDoubleDamageMove("fire"), { index: 316 });
export const sandstorm = {
        index: 317,
        damagingMove: false,
        logKey: "weather_set",
        weatherLabel: "Sandstorm",
        setWeather: "sand",
        after: function () {
          this.logKey = "weather_set";
        }
      };
export const twister = Object.assign(conditionX2Move(function(_a, d) { return d.semiInvulnerable === "fly"; }), { index: 318 });
export const toxic = {
        index: 319,
        before: function (_attacker, _defender, hit) {
          this.damagingMove = Boolean(hit);
        },
        after: function (_attacker, defender, hit) {
          if (hit) {
            if (applyStatusEffect(defender, "psn")) {
              this.logKey = "dmg_psn";
            } else {
              this.logKey = "dmg";
            }
          } else {
            this.logKey = "fail";
          }
        }
      };
export const transform = {
        index: 320,
        damagingMove: false,
        after: function (attacker, defender, hit) {
          var origMoves;
          var transformedMoves;

          if (!hit || attacker.transformationInfo !== null) {
            this.logKey = "fail";
            return;
          }

          origMoves = attacker.pokemon.moves.slice();
          if (attacker.mimicInfo) {
            origMoves[attacker.mimicInfo.slot] = attacker.mimicInfo.originalMove;
          }
          if (attacker.tempMoveInfo) {
            origMoves[attacker.tempMoveInfo.slot] = attacker.tempMoveInfo.originalMove;
          }

          transformedMoves = defender.pokemon.moves.map(function (move) {
            return instantiateMoveFromLibrary(move.index, {
              power: this.power,
              stats: this.stats
            });
          }, this).filter(Boolean);
          if (!transformedMoves.length) {
            this.logKey = "fail";
            return;
          }

          attacker.transformationInfo = {
            origMoves: origMoves,
            origType: attacker.type.slice(),
            speciesKey: defender.pokemon.transformedSpeciesKey || defender.pokemon.speciesKey,
            ndex: defender.pokemon.transformedNdex || defender.pokemon.ndex,
            isShiny: defender.pokemon.transformedSpeciesKey ? Boolean(defender.pokemon.transformedIsShiny) : Boolean(defender.pokemon.isShiny),
            gender: defender.pokemon.transformedSpeciesKey ? defender.pokemon.transformedGender || null : defender.pokemon.gender || null
          };

          attacker.mimicInfo = null;
          attacker.tempMoveInfo = null;
          attacker.pokemon.type = defender.pokemon.type.slice();
          attacker.pokemon.moves = transformedMoves;
          attacker.pokemon.transformedSpeciesKey = attacker.transformationInfo.speciesKey;
          attacker.pokemon.transformedNdex = attacker.transformationInfo.ndex;
          attacker.pokemon.transformedIsShiny = attacker.transformationInfo.isShiny;
          attacker.pokemon.transformedGender = attacker.transformationInfo.gender;
          attacker.type = defender.type.slice();
          attacker.updateMovesState();
          this.logKey = "transform";
        }
      };
export const tri_attack = Object.assign(simpleDamage(), { index: 321 });
export const triple_kick = Object.assign(simpleDamage(), { index: 322 });
export const crush_claw = Object.assign(createToggleDamageMove(function(attacker) { attacker.buffSelfAtk(this.stats); this.logKey = "buff_self_atk"; }), { index: 323 });
export const superpower = Object.assign(buffLossMove(), { index: 324 });
export const thunder = {
        index: 325,
        before: function (_attacker, _defender, hit) {
          this.damagingMove = Boolean(hit);
        },
        after: function (attacker, defender, hit) {
          var isRaining = attacker.team.battleManager && attacker.team.battleManager.weather === "rain";
          var startPerc = !isRaining && consumeMovePercentage(attacker.team);

          if (hit) {
            if (startPerc || isRaining) {
              if (applyStatusEffect(defender, "par_block")) {
                this.logKey = "dmg_par";
              } else {
                this.logKey = isRaining ? "dmg" : "dmg_los_perc";
              }
            } else {
              this.logKey = "dmg_rec_perc";
            }
          } else if (startPerc) {
            this.logKey = "lose_self_perc";
          } else if (isRaining) {
            this.logKey = "fail";
          } else {
            this.logKey = "gain_self_perc";
          }
        }
      };
export const thunder_wave = Object.assign(simpleParalysisMove(), { index: 326 });
export const thunder_punch = Object.assign(targetTypeDoubleDamageMove("water"), { index: 327 });
export const thunder_shock = Object.assign(simpleDamage(), { index: 328 });
export const whirlwind = {
        index: 329,
        damagingMove: false,
        logKey: "roar",
        after: function (_attacker, defender, hit) {
          if (hit) {
            var switchResult = defender.team.switchRandom();
            this.switchEvents = switchResult.events || [];
            this.logKey = switchResult.ok ? "roar" : "fail";
          } else {
            this.logKey = "fail";
          }
        }
      };
export const fire_spin = Object.assign(bindDamageMove(4), { index: 330 });
export const sand_attack = Object.assign(simpleEnemyAttackNerf(), { index: 331 });
export const perish_song = {
        index: 332,
        damagingMove: false,
        after: function (attacker, _defender, hit) {
          if (hit) {
            var bm = attacker.team.battleManager;
            var defender = bm.playerTeam === attacker.team ? bm.enemyTeam.getActive() : bm.playerTeam.getActive();
            attacker.perishSongTurns = 3;
            attacker.perishSongSkipNextAction = true;
            if (defender && !defender.isFainted()) {
              defender.perishSongTurns = 3;
              defender.perishSongSkipNextAction = false;
            }
            this.logKey = "perish_song";
          } else {
            this.logKey = "fail";
          }
        }
      };
export const egg_bomb = Object.assign(simpleDamage(), { index: 333 });
export const overheat = Object.assign(buffLossMove(), { index: 334 });
export const poison_tail = Object.assign(simpleDamage(), { index: 335 });
export const poison_fang = Object.assign(toggleSecondaryStatus("psn", "dmg_psn"), { index: 336 });
export const poison_gas = {
        index: 337,
        damagingMove: false,
        after: function (_attacker, defender, hit) {
          if (hit) {
            if (applyStatusEffect(defender, "psn")) {
              this.logKey = "psn";
            } else {
              this.logKey = statusFailureLogKey(defender, "psn");
            }
          } else {
            this.logKey = "fail";
          }
        }
      };
export const poison_sting = Object.assign(simpleDamage(), { index: 338 });
export const poison_powder = {
        index: 339,
        damagingMove: false,
        after: function (_attacker, defender, hit) {
          if (hit) {
            if (applyStatusEffect(defender, "psn")) {
              this.logKey = "psn";
            } else {
              this.logKey = statusFailureLogKey(defender, "psn");
            }
          } else {
            this.logKey = "fail";
          }
        }
      };
export const revenge = Object.assign(conditionX2Move(function(a) { return a.hp < a.pokemon.maxHp; }), { index: 340 });
export const razor_wind = {
        index: 341,
        before: function (attacker, _defender, hit) {
          if (attacker.pendingMove === this && attacker.pendingMoveTurns > 0) {
            this.damagingMove = Boolean(hit);
            attacker.removePending();
            attacker.pendingMoveTurns = 0;
            if (hit) {
              this.defMult = 0;
              this.logKey = "dmg";
            } else {
              this.logKey = "fail";
            }
            return;
          }

          this.damagingMove = false;
          attacker.activatePending(this);
          attacker.pendingMoveTurns = 1;
          this.logKey = "charge";
        },
        after: function (attacker) {
          if (attacker.pendingMoveTurns === 0) {
            this.defMult = 1;
          }
        }
      };
export const silver_wind = Object.assign(createToggleDamageMove(function(attacker) { attacker.buffSelfAtk(this.stats); attacker.buffSelfDef(this.stats); this.logKey = "buff_self_atk_def"; }), { index: 342 });
export const icy_wind = Object.assign(createToggleDamageMove(function(_attacker, defender) { if (defender.team.teamMistCounter === 0) { defender.nerfSelfAtk(this.stats); this.logKey = "nerf_enem_atk"; } }), { index: 343 });
export const scary_face = Object.assign(simpleEnemyAttackNerf(), { index: 344 });
export const vital_throw = Object.assign(simpleDamage(), { index: 345 });
export const fly = Object.assign(semiInvulnerableDamageMove(), { index: 346 });
export const water_spout = Object.assign(conditionX2Move(function(a) { return a.hp > a.pokemon.maxHp / 2; }), { index: 347 });
export const volt_tackle = Object.assign(recoilDamageMove(), { index: 348 });
export const hydro_cannon = Object.assign(rechargeDamageMove(), { index: 349 });
export const blast_burn = Object.assign(rechargeDamageMove(), { index: 350 });
export const frenzy_plant = Object.assign(rechargeDamageMove(), { index: 351 });
export const MOVE_LIBRARY = buildMoveLibrary({
  luster_purge,
  fissure,
  stockpile,
  acid,
  flatter,
  air_cutter,
  aerial_ace,
  sky_attack,
  aeroblast,
  sharpen,
  agility,
  steel_wing,
  helping_hand,
  amnesia,
  aromatherapy,
  assist,
  absorb,
  torment,
  wing_attack,
  barrage,
  quick_attack,
  attract,
  self_destruct,
  wrap,
  tackle,
  uproar,
  barrier,
  peck,
  block,
  roar,
  bubble,
  bubble_beam,
  blizzard,
  pound,
  headbutt,
  ember,
  brick_break,
  fake_out,
  swagger,
  milk_drink,
  rock_blast,
  blaze_kick,
  high_jump_kick,
  rolling_kick,
  jump_kick,
  calm_mind,
  camouflage,
  sing,
  skull_bash,
  waterfall,
  focus_punch,
  kinesis,
  iron_tail,
  tail_glow,
  thrash,
  low_kick,
  tail_whip,
  mud_shot,
  karate_chop,
  comet_punch,
  swift,
  confusion,
  counter,
  reversal,
  conversion,
  conversion_2,
  body_slam,
  cosmic_power,
  cotton_spore,
  soft_boiled,
  growth,
  feather_dance,
  swords_dance,
  lovely_kiss,
  wish,
  destiny_bond,
  dynamic_punch,
  spite,
  future_sight,
  water_sport,
  sweet_kiss,
  double_slap,
  twineedle,
  double_kick,
  double_team,
  dragon_claw,
  dragon_dance,
  dragon_breath,
  eruption,
  imprison,
  explosion,
  extreme_speed,
  extrasensory,
  facade,
  zap_cannon,
  fake_tears,
  false_swipe,
  mud_sport,
  muddy_water,
  sludge,
  sludge_bomb,
  mud_slap,
  charm,
  leaf_blade,
  metal_claw,
  iron_defense,
  metal_sound,
  feint_attack,
  flail,
  flash,
  focus_energy,
  magical_leaf,
  razor_leaf,
  strength,
  ancient_power,
  secret_power,
  mist_ball,
  dig,
  rock_slide,
  vine_whip,
  frustration,
  thunderbolt,
  leer,
  fire_blast,
  will_o_wisp,
  fire_punch,
  fury_attack,
  thief,
  icicle_spear,
  ice_punch,
  ice_beam,
  guillotine,
  giga_drain,
  sunny_day,
  pay_day,
  scratch,
  hail,
  bulk_up,
  hyper_voice,
  howl,
  hydro_pump,
  water_pulse,
  horn_attack,
  cross_chop,
  nightmare,
  detect,
  disable,
  pursuit,
  swallow,
  hidden_power,
  hyper_beam,
  hyper_fang,
  hypnosis,
  hydro_cannon,
  blast_burn,
  rage,
  dragon_rage,
  slash,
  flamethrower,
  lick,
  bind,
  mind_reader,
  constrict,
  lock_on,
  volt_tackle,
  moonlight,
  sacred_fire,
  magic_coat,
  magnitude,
  pain_split,
  curse,
  mean_look,
  dream_eater,
  smelling_salts,
  crabhammer,
  morning_sun,
  meditate,
  mega_kick,
  megahorn,
  mega_punch,
  mega_drain,
  grass_whistle,
  memento,
  meteor_mash,
  metronome,
  string_shot,
  mimic,
  minimize,
  pin_missile,
  bite,
  seismic_toss,
  whirlpool,
  smokescreen,
  nature_power,
  mist,
  haze,
  doom_desire,
  octazooka,
  outrage,
  night_shade,
  heat_wave,
  shock_wave,
  bone_club,
  bonemerang,
  bone_rush,
  weather_ball,
  ice_ball,
  shadow_ball,
  belly_drum,
  stun_spore,
  leech_seed,
  bide,
  drill_peck,
  horn_drill,
  stomp,
  petal_dance,
  beat_up,
  slack_off,
  rain_dance,
  water_gun,
  powder_snow,
  vise_grip,
  foresight,
  knock_off,
  sweet_scent,
  protect,
  taunt,
  psych_up,
  psychic,
  psywave,
  psybeam,
  psycho_boost,
  shadow_punch,
  mach_punch,
  needle_arm,
  spikes,
  sheer_cold,
  ingrain,
  frenzy_plant,
  gust,
  harden,
  aurora_beam,
  trick,
  spider_web,
  grudge,
  rapid_spin,
  present,
  endure,
  defense_curl,
  recycle,
  take_down,
  reflect,
  bounce,
  endeavor,
  refresh,
  heal_bell,
  encore,
  rest,
  recover,
  withdraw,
  return_move,
  rock_tomb,
  rollout,
  growl,
  flame_wheel,
  snore,
  sand_tomb,
  safeguard,
  leech_life,
  rock_throw,
  yawn,
  arm_thrust,
  light_screen,
  slam,
  sketch,
  spark,
  snatch,
  struggle,
  acid_armor,
  double_edge,
  signal_beam,
  odor_sleuth,
  bullet_seed,
  spit_up,
  fury_swipes,
  astonish,
  crunch,
  glare,
  synthesis,
  smog,
  solar_beam,
  tickle,
  sonic_boom,
  sleep_powder,
  sleep_talk,
  substitute,
  charge,
  dive,
  submission,
  rock_smash,
  spike_cannon,
  mirror_coat,
  mirror_move,
  splash,
  spore,
  baton_pass,
  dizzy_punch,
  confuse_ray,
  sky_uppercut,
  teeter_dance,
  screech,
  supersonic,
  super_fang,
  covet,
  surf,
  cut,
  fury_cutter,
  teleport,
  clamp,
  earthquake,
  sandstorm,
  twister,
  toxic,
  transform,
  tri_attack,
  triple_kick,
  crush_claw,
  superpower,
  thunder,
  thunder_wave,
  thunder_punch,
  thunder_shock,
  whirlwind,
  fire_spin,
  sand_attack,
  perish_song,
  egg_bomb,
  overheat,
  poison_tail,
  poison_fang,
  poison_gas,
  poison_sting,
  poison_powder,
  revenge,
  razor_wind,
  silver_wind,
  icy_wind,
  scary_face,
  vital_throw,
  fly,
  water_spout
});

export var MULTI_TURN_MOVE_INDEXES = new Set([
  skull_bash.index,
  thrash.index,
  dig.index,
  hyper_beam.index,
  hydro_cannon.index,
  blast_burn.index,
  bide.index,
  bounce.index,
  frenzy_plant.index,
  solar_beam.index,
  dive.index,
  razor_wind.index,
  fly.index
]);

export var MULTITURN_EFFECT_MOVE_INDEXES = new Set([
  wrap.index,
  bind.index,
  whirlpool.index,
  sand_tomb.index,
  clamp.index,
  fire_spin.index,
  leech_seed.index
]);

export var NOT_COPYABLE_MOVE_INDEXES = new Set([
  metronome.index,
  struggle.index,
  mirror_move.index,
  transform.index
]);

export var SEMI_INVULN_ALLOWED = {
  dig: { swift: true, magnitude: true, shadow_punch: true, earthquake: true },
  dive: { swift: true, shadow_punch: true },
  fly: { swift: true, shadow_punch: true, gust: true, sky_uppercut: true, twister: true },
  bounce: { swift: true, shadow_punch: true }
};
