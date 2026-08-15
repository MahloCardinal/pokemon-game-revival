import { TYPE_CHART, typeDisplayName } from "./type-chart.js";
import { random } from "../engine/deterministic-rng.js";

function buildMoveLibrary(entries) {
  var library = [];
  var usedIndexes = {};

  Object.keys(entries).forEach(function (key) {
    var config = entries[key];
    var index = Number(config.index);
    var definition;

    if (!Number.isFinite(index) || index <= 0) {
      throw new Error("Index mossa non valido: " + (config && config.name ? config.name : index));
    }

    if (usedIndexes[index]) {
      throw new Error("Index mossa duplicato: " + index);
    }

    usedIndexes[index] = true;

    config.key = key;
    definition = Object.assign({}, config, {
      key: key,
      index: index,
      effect_before: config.effect_before || config.before || null,
      effect_after: config.effect_after || config.after || null
    });

    if (!definition.name) {
      throw new Error("Nome mossa mancante per index: " + index);
    }

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
  target.pendingDelayedStatus = null;
  return true;}
function setTeamPercentageNegative(team) {
  if (team) {
    team.percentage = false;
  }}
function simpleNegatePercentageMove(name) {
  return {
    name: name,
    damagingMove: false,
    description: "La percentuale avversaria diventa negativa",
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
function bindDamageMove(name, description, bindTurns) {
  return {
    name: name,
    description: description,
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
function blockStatBoostMove(name, description, turns) {
  return {
    name: name,
    damagingMove: false,
    description: description || "Protegge la squadra dai boost delle mosse avversarie",
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
function buffLossMove(name, description) {
  return {
    name: name,
    description: description,
    before: function (attacker, _defender, hit) {
      this.damagingMove = Boolean(hit);
      if (hit) {
        if (attacker.atkBuff > 0) {
          this.moveMult = 2;
          attacker.atkBuff = 0;
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
function chargeBuffMove(name, description) {
  return {
    name: name,
    damagingMove: false,
    description: description || "+Lv Difesa, x2 al danno nel prossimo turno",
    before: function () {
      this.damagingMove = false;
    },
    after: function (attacker) {
      attacker.buffSelfDef(attacker.level);
      attacker.chargeDamageMultiplier = 2;
      this.logKey = "charge";
    }
  };}
function twoTurnDefenseDamageMove(name, description) {
  return {
    name: name,
    description: description || "1° turno +{stats} Difesa, 2° turno -{power}",
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
function conditionX2Move(name, description, conditionFn) {
  return {
    name: name,
    description: description,
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
function repeatLastTurnDamageMove(name) {
  return {
    name: name,
    description: "-{power}, x1.5 se già usata nell'ultimo turno",
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
function confuseBuffEnemyMove(name) {
  return {
    name: name,
    damagingMove: false,
    description: "Confonde, +{stats} Attacco avversario",
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
function counterMove(name, description) {
  return {
    name: name,
    description: description,
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
function createToggleDamageMove(name, description, onPositiveHit) {
  return {
    name: name,
    description: description,
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
function damagePlusAlwaysStatus(name, description, statusKey, logKey) {
  return {
    name: name,
    description: description,
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
function damageRecoveryMove(name, description, fraction) {
  return {
    name: name,
    description: description,
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
function recoilDamageMove(name) {
  return {
    name: name,
    description: "-{power}, contraccolpo PS di 1/4 del danno inflitto",
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
function rechargeDamageMove(name) {
  return {
    name: name,
    description: "1° turno -{power} x2, 2° ricarica",
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
function forcedTripleHitConfusionMove(name) {
  return {
    name: name,
    description: "-{power}, da usare altri 2 turni, poi Confonde l'utilizzatore",
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
    name: config.name,
    power: overrides.power !== undefined ? overrides.power : 0,
    stats: overrides.stats !== undefined ? overrides.stats : 0,
    damagingMove: config.damagingMove !== undefined ? config.damagingMove : true,
    description: config.description || "",
    logKey: config.logKey || null,
    requestsBattleFlee: false,
    requestsBattleSwitch: Boolean(config.requestsBattleSwitch),
    setWeather: config.setWeather || null,
    weatherLabel: config.weatherLabel || null,
    logMessage: "",
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
    prepareLog: function (attacker, defender, damage, efficacy) {
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
    }
  };}
function ohkoMove(name) {
  return {
    name: name,
    damagingMove: false,
    isOhkoMove: true,
    description: "50% manda l'avversario KO",
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
function preventDefRaiseMove(name, description) {
  return {
    name: name,
    damagingMove: false,
    description: description || "L'avversario non può aumentare la propria Difesa finché l'utilizzatore è in campo",
    after: function (_attacker, defender, hit) {
      if (hit) {
        defender.defRaiseBlocked = true;
        this.logKey = "def_raise_block";
      } else {
        this.logKey = "fail";
      }
    }
  };}
function disableLastMoveMove(name) {
  return {
    name: name,
    damagingMove: false,
    description: "Disattiva l'ultima mossa dell'avversario fino al suo cambio o KO",
    after: function (_attacker, defender, hit) {
      var lastMove = defender.turnBeforeMoveUsed;
      if (hit && lastMove !== null && lastMove.key !== "struggle") {
        defender.disableMoveInhibit(lastMove.key);
        this.logKey = "inhibit";
        this.txt = lastMove.name;
      } else {
        this.logKey = "fail";
      }
    }
  };}
function selfBuffDebuffMove(name) {
  return {
    name: name,
    damagingMove: false,
    description: "-{stats} Difesa, +2x{stats} Attacco",
    after: function (attacker) {
      attacker.nerfSelfDef(this.stats);
      attacker.buffSelfAtk(this.stats * 2);
      this.logKey = "buff_debuff_self";
    }
  };}
function semiInvulnerableDamageMove(name, description, invulnerabilityLogKey, onHit) {
  return {
    name: name,
    description: description || "1° turno diventa non bersagliabile, 2° turno -{power}",
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
function simpleConfusionMove(name) {
  return {
    name: name,
    damagingMove: false,
    description: "Confonde l'avversario",
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
function simpleDamage(name, description) {
  return {
    name: name,
    description: description || "-{power}",
    before: function (_attacker, _defender, hit) {
      this.damagingMove = Boolean(hit);
    },
    after: function (_attacker, _defender, hit) {
      this.logKey = hit ? "dmg" : "fail";
    }
  };}
function missingHpDamageMove(name) {
  return {
    name: name,
    description: "-{power}, danni pari alla differenza tra PS max e PS attuali",
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
function simpleEnemyAttackNerf(name) {
  return {
    name: name,
    damagingMove: false,
    description: "-{stats} Attacco avversario",
    after: function (_attacker, defender, hit) {
      if (hit && defender.team.teamMistCounter === 0) {
        defender.nerfSelfAtk(this.stats);
        this.logKey = "nerf_enem_atk";
      } else {
        this.logKey = "fail";
      }
    }
  };}
function simpleEnemyDefenseNerf(name) {
  return {
    name: name,
    damagingMove: false,
    description: "-{stats} Difesa avversaria",
    after: function (_attacker, defender, hit) {
      if (hit && defender.team.teamMistCounter === 0) {
        defender.nerfSelfDef(this.stats);
        this.logKey = "nerf_enem_def";
      } else {
        this.logKey = "fail";
      }
    }
  };}
function simpleEnemyAtkDefNerf(name) {
  return {
    name: name,
    damagingMove: false,
    description: "-{stats} Attacco e Difesa avversario",
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
function simpleHalfRecovery(name) {
  return {
    name: name,
    damagingMove: false,
    description: "Recupera metà dei PS massimi",
    logKey: "rest_hp",
    after: function (attacker) {
      this.restored = Math.floor(attacker.pokemon.maxHp / 2);
      attacker.hp = Math.min(attacker.hp + this.restored, attacker.pokemon.maxHp);
    }
  };}
function simpleParalysisMove(name) {
  return {
    name: name,
    damagingMove: false,
    description: "Paralizza l'avversario",
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
function simpleBurnMove(name) {
  return {
    name: name,
    damagingMove: false,
    description: "Scotta l'avversario",
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
function simpleSelfAttackBuff(name) {
  return {
    name: name,
    damagingMove: false,
    description: "+{stats} Attacco",
    logKey: "buff_self_atk",
    after: function (attacker) {
      attacker.buffSelfAtk(this.stats);
    }
  };}
function simpleSelfAttackBigBuff(name) {
  return {
    name: name,
    damagingMove: false,
    description: "+2x{stats} Attacco",
    logKey: "buff_self_atk_big",
    after: function (attacker) {
      buffSelfAttackGreatly(attacker, this);
    }
  };}
function simpleSelfAttackDefenseBuff(name) {
  return {
    name: name,
    damagingMove: false,
    description: "+{stats} Attacco e Difesa",
    logKey: "buff_self_atk_def",
    after: function (attacker) {
      attacker.buffSelfAtk(this.stats);
      attacker.buffSelfDef(this.stats);
    }
  };}
function simpleSelfDefenseBuff(name) {
  return {
    name: name,
    damagingMove: false,
    description: "+{stats} Difesa",
    logKey: "buff_self_def",
    after: function (attacker) {
      attacker.buffSelfDef(this.stats);
    }
  };}
function simpleSleepMove(name) {
  return {
    name: name,
    damagingMove: false,
    description: "Addormenta l'avversario",
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
function simpleTeamAttackBuff(name) {
  return {
    name: name,
    damagingMove: false,
    description: "+{stats} Attacco della squadra per 5 turni",
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
function simpleTeamDefenseBuff(name) {
  return {
    name: name,
    damagingMove: false,
    description: "+{stats} Difesa della squadra per 5 turni",
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
function teamStatusCureMove(name, description) {
  return {
    name: name,
    damagingMove: false,
    description: description || "Risolve tutti i problemi di stato della squadra",
    after: function (attacker) {
      var count = 0;
      attacker.team.combatantList.forEach(function (c) {
        if (c.status || c.sleepCounter || c.confCounter || c.pendingDelayedStatus) {
          c.status = null;
          c.sleepCounter = 0;
          c.sleepDuration = 3;
          c.confCounter = 0;
          c.pendingDelayedStatus = null;
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
function toggleSecondaryStatus(name, description, statusKey, hitLogKey) {
  return {
    name: name,
    description: description,
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
function trapMove(name, description) {
  return {
    name: name,
    damagingMove: false,
    description: description || "L'avversario non può scappare",
    after: function (_attacker, defender, hit) {
      if (hit && defender.trappedTurns === 0 && defender.trappedMoveIndex === 0) {
        defender.trappedTurns = 99;
        this.logKey = "trap";
      } else {
        this.logKey = "fail";
      }
    }
  };}
function targetTypeDoubleDamageMove(name, targetType) {
  return {
    name: name,
    description: "-{power}, x2 contro Pokémon " + targetType,
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
function weatherRecoveryMove(name, description) {
  return {
    name: name,
    damagingMove: false,
    description: description,
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
function futureSightMove(name) {
  return {
    name: name,
    description: "-{power}, colpisce dopo 3 mosse totali, non riutilizzabile finché non si conclude",
    before: function (_attacker, _defender, hit) {
      this.damagingMove = false;
    },
    after: function (attacker, _defender, hit) {
      if (hit && !attacker.team.futureSight.active) {
        attacker.team.futureSight.active = true;
        attacker.team.futureSight.timer = 3;
        attacker.team.futureSight.power = this.power || 1;
        attacker.team.futureSight.attackerTypes = attacker.type.slice();
        attacker.team.futureSight.attackerName = attacker.pokemon.name;
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

function capitalizedDamageText(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function damageLog(ctx, text) {
  var base = ctx.attacker.pokemon.name + " usa " + ctx.move.name;
  if (ctx.efficacy > 1) {
    return base + ", è superefficace! " + capitalizedDamageText(text);
  }
  if (ctx.efficacy < 1) {
    return base + ", non è molto efficace. " + capitalizedDamageText(text);
  }
  return base + ", " + text;
}

export var LOG_LIBRARY = {
  "1HKO": function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", " + ctx.defender.pokemon.name + " KO"; },
  baton_pass: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", passa le alterazioni al nuovo Pokemon!"; },
  buff_debuff_self: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", -" + ctx.move.stats + " Difesa, +" + (ctx.move.stats * 2) + " Attacco"; },
  buff_self_atk: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", +" + ctx.move.stats + " Attacco"; },
  buff_self_atk_big: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", +" + (ctx.move.stats * 2) + " Attacco"; },
  buff_self_atk_def: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", +" + ctx.move.stats + " Attacco e Difesa"; },
  buff_self_def: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", +" + ctx.move.stats + " Difesa"; },
  buff_self_def_burn: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", +" + ctx.move.stats + " Difesa, immune alla Scottatura"; },
  brn: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", " + ctx.defender.pokemon.name + " è scottato"; },
  buff_team_atk: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", +" + ctx.move.stats + " Attacco della squadra per 5 turni"; },
  buff_team_def: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", +" + ctx.move.stats + " Difesa della squadra per 5 turni"; },
  charge: function (ctx) { return ctx.attacker.pokemon.name + " si sta caricando"; },
  cnf: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", " + ctx.defender.pokemon.name + " è confuso"; },
  cnf_buff_enem: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", confonde e aumenta l'Attacco di " + ctx.defender.pokemon.name; },
  convers: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", diventa di Tipo " + ctx.move.txt; },
  copy_stats: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", copia le alterazioni delle statistiche di " + ctx.defender.pokemon.name; },
  cure_status: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", risolve i suoi problemi di stato"; },
  cure_status_team: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", risolve i problemi di stato della squadra"; },
  def_raise_block: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", " + ctx.defender.pokemon.name + " non può aumentare la Difesa!"; },
  destiny_bond: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", se nel prossimo turno va KO, manderà KO anche l'avversario"; },
  dmg: function (ctx) { return damageLog(ctx, "infligge " + ctx.damage + " danni"); },
  dmg_1hp: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", " + ctx.defender.pokemon.name + " resiste con 1 PS!"; },
  dmg_bind: function (ctx) { return damageLog(ctx, "infligge " + ctx.damage + " danni e impedisce il cambio di " + ctx.defender.pokemon.name + " per " + ctx.move.bindTurns + " turni"); },
  dmg_brn: function (ctx) { return damageLog(ctx, "infligge " + ctx.damage + " danni e brucia " + ctx.defender.pokemon.name); },
  dmg_cnf: function (ctx) { return damageLog(ctx, "infligge " + ctx.damage + " danni e confonde " + ctx.defender.pokemon.name); },
  dmg_double: function (ctx) { return damageLog(ctx, "la potenza raddoppia e infligge " + ctx.damage + " danni"); },
  dmg_enem_atk: function (ctx) { return damageLog(ctx, "infligge " + ctx.damage + " danni, -" + ctx.move.stats + " Attacco " + ctx.defender.pokemon.name); },
  dmg_enem_def: function (ctx) { return damageLog(ctx, "infligge " + ctx.damage + " danni, -" + ctx.move.stats + " Difesa " + ctx.defender.pokemon.name); },
  dmg_frz: function (ctx) { return damageLog(ctx, "infligge " + ctx.damage + " danni e congela " + ctx.defender.pokemon.name); },
  dmg_los_hp: function (ctx) { return damageLog(ctx, "infligge " + ctx.damage + " danni ma perde " + ctx.move.recoil + " PS"); },
  dmg_los_perc: function (ctx) { return damageLog(ctx, "infligge " + ctx.damage + " danni, non si attiva l'effetto ma perde la percentuale"); },
  dmg_one_half: function (ctx) { return damageLog(ctx, "si attiva l'effetto e infligge " + ctx.damage + " danni"); },
  dmg_par: function (ctx) { return damageLog(ctx, "infligge " + ctx.damage + " danni e paralizza " + ctx.defender.pokemon.name); },
  dmg_psn: function (ctx) { return damageLog(ctx, "infligge " + ctx.damage + " danni e avvelena " + ctx.defender.pokemon.name); },
  dmg_pursuit_switch: function (ctx) { return damageLog(ctx, "colpisce " + ctx.defender.pokemon.name + " in ritirata e infligge " + ctx.damage + " danni"); },
  dmg_rec_hp: function (ctx) { return damageLog(ctx, "infligge " + ctx.damage + " danni e recupera " + ctx.move.absorbed + " PS"); },
  dmg_rec_perc: function (ctx) { return damageLog(ctx, "infligge " + ctx.damage + " danni e recupera la percentuale"); },
  dmg_seed: function (ctx) { return damageLog(ctx, "infligge " + ctx.damage + " danni, " + ctx.defender.pokemon.name + " è pieno di semi"); },
  dmg_self_cnf: function (ctx) { return damageLog(ctx, "infligge " + ctx.damage + " danni ed è Confuso"); },
  dmg_self_cnf_fail: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", ma fallisce. " + ctx.attacker.pokemon.name + " è Confuso"; },
  dmg_snatch_buffs: function (ctx) {
    var parts = [];
    if (ctx.move.stolenAtkBuff) { parts.push("+" + ctx.move.stolenAtkBuff + " Attacco"); }
    if (ctx.move.stolenDefBuff) { parts.push("+" + ctx.move.stolenDefBuff + " Difesa"); }
    return damageLog(ctx, "infligge " + ctx.damage + " danni e ruba " + parts.join(" e ") + " a " + ctx.defender.pokemon.name);
  },
  dmg_sleep_immunity: function (ctx) { return damageLog(ctx, "infligge " + ctx.damage + " danni, la squadra è immune al sonno x5 turni"); },
  dmg_suppress_boost: function (ctx) { return damageLog(ctx, "infligge " + ctx.damage + " danni, i boost dell'avversario vengono annullati il prossimo turno"); },
  dmg_status_uproar: function (ctx) { return damageLog(ctx, "infligge " + ctx.damage + " danni, ma " + ctx.defender.pokemon.name + " è protetto da Baraonda"); },
  dmg_status_delayed: function (ctx) { return damageLog(ctx, "infligge " + ctx.damage + " danni e Distraroma ritarda " + ctx.move.delayedStatusName + " di " + ctx.move.delayedStatusTargetName); },
  dmg_status_safeguard: function (ctx) { return damageLog(ctx, "infligge " + ctx.damage + " danni, ma " + ctx.defender.pokemon.name + " è protetto da Salvaguardia"); },
  dmg_status_waiting: function (ctx) { return damageLog(ctx, "infligge " + ctx.damage + " danni ma " + ctx.move.delayedStatusTargetName + " ha già uno status in attesa"); },
  embargo: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", " + ctx.defender.pokemon.name + " non può usare oggetti!"; },
  endeavor: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", i PS di " + ctx.defender.pokemon.name + " diventano " + ctx.defender.hp; },
  endure: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", si prepara e resistere"; },
  fail: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", ma fallisce"; },
  flee: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + " e fugge dalla lotta"; },
  future_sight_set: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", colpirà tra 2 turni"; },
  gain_self_perc: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", recupera la percentuale"; },
  grudge: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", se viene mandato KO inibirà la mossa avversaria!"; },
  imprison: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", blocca le mosse in comune con " + ctx.defender.pokemon.name; },
  inhibit: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", disabilita " + ctx.move.txt + " avversaria"; },
  invul_dig: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", si nasconde sotto terra"; },
  invul_fly: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", vola alto nel cielo"; },
  invul_sub: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", diventa temporaneamente non bersagliabile"; },
  lose_enem_perc: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", la percentuale avversaria diventa negativa"; },
  lose_self_perc: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", perde la percentuale"; },
  magic_coat: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", rifletterà gli status nemici!"; },
  mimic: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + " e copia l'ultima mossa usata dall'avversario"; },
  nerf_enem_atk: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", -" + ctx.move.stats + " Attacco " + ctx.defender.pokemon.name; },
  nerf_enem_atk_def: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", -" + ctx.move.stats + " Attacco e Difesa " + ctx.defender.pokemon.name; },
  nerf_enem_def: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", -" + ctx.move.stats + " Difesa " + ctx.defender.pokemon.name; },
  nightmare_dmg: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", " + ctx.defender.pokemon.name + " perde PS a causa dell'Incubo!"; },
  no_move_boost_team: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", squadra protetta dai boost delle mosse avversarie x5 turni"; },
  no_stat_nerf_team: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", squadra protetta da modifiche stats avversarie x5 turni"; },
  nube: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", annulla ogni modifica di stats delle squadre"; },
  pain_split: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", i PS di " + ctx.attacker.pokemon.name + " e " + ctx.defender.pokemon.name + " vengono divisi equamente"; },
  par: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", " + ctx.defender.pokemon.name + " è paralizzato"; },
  perish_song: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", tutti andranno KO tra 3 turni!"; },
  present_heal: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", " + ctx.defender.pokemon.name + " recupera 1/4 dei PS!"; },
  psn: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", " + ctx.defender.pokemon.name + " è avvelenato"; },
  spikes_set: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", chi entra subisce danni pari al livello"; },
  rapid_spin: function (ctx) { return damageLog(ctx, "infligge " + ctx.damage + " danni e rimuove gli effetti sul proprio terreno!"); },
  recharge: function (ctx) { return ctx.attacker.pokemon.name + " deve ricaricarsi"; },
  repeat: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", " + ctx.defender.pokemon.name + " deve ripetere " + ctx.move.txt + " x3 turni!"; },
  rest: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", si addormenta e recupera tutti i PS"; },
  rest_hp: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", recupera " + ctx.move.restored + " PS"; },
  recycle_item: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", ricrea lo strumento assegnato a inizio battaglia"; },
  roar: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + "! " + ctx.move.txt; },
  selfdestruct: function (ctx) { return damageLog(ctx, "infligge " + ctx.damage + " danni ma va KO"); },
  sleep_delayed: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", " + ctx.defender.pokemon.name + " si addormenterà alla fine del prossimo turno"; },
  slp: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", " + ctx.defender.pokemon.name + " è addormentato"; },
  smp_move: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name; },
  status_delayed: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", Distraroma ritarda " + ctx.move.delayedStatusName + " di " + ctx.move.delayedStatusTargetName; },
  status_uproar: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", ma fallisce perché " + ctx.defender.pokemon.name + " è protetto da Baraonda"; },
  status_not_done: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", ma fallisce perché " + ctx.defender.pokemon.name + " ha già uno status"; },
  status_protect: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", squadra protetta da problemi di stato x5 turni"; },
  status_safeguard: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", ma fallisce perché " + ctx.defender.pokemon.name + " è protetto da Salvaguardia"; },
  status_waiting: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", ma fallisce perché " + ctx.move.delayedStatusTargetName + " ha già uno status in attesa"; },
  steal_item: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", ruba lo strumento di " + ctx.defender.pokemon.name; },
  suppress_boost: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", i boost dell'avversario vengono annullati il prossimo turno"; },
  transform: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", si trasforma nell'avversario"; },
  trick_item: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", scambia lo strumento con " + ctx.defender.pokemon.name; },
  trap: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", " + ctx.defender.pokemon.name + " non può scappare!"; },
  weather_set: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + " e modifica il meteo"; }
};
export const luster_purge = Object.assign(createToggleDamageMove("Abbagliante", "-{power}, 50% +{stats} Attacco", function(attacker) { attacker.buffSelfAtk(this.stats); this.logKey = "buff_self_atk"; }), { index: 1 });
export const fissure = Object.assign(ohkoMove("Abisso"), { index: 2 });
export const stockpile = { index: 3, name: "Accumulo", damagingMove: false, description: "+{stats} Difesa, prepara Introenergia e Sfoghenergia", logKey: "buff_self_def", before: function(attacker) { attacker.buffSelfDef(this.stats); attacker.stockpileUsed = true; } };
export const acid = Object.assign(createToggleDamageMove("Acido", "-{power}, 50% -{stats} Difesa avversaria", function(_attacker, defender) { if (defender.team.teamMistCounter === 0) { defender.nerfSelfDef(this.stats); this.logKey = "nerf_enem_def"; } }), { index: 4 });
export const flatter = Object.assign(confuseBuffEnemyMove("Adulazione"), { index: 5 });
export const air_cutter = Object.assign(simpleDamage("Aerasoio"), { index: 6 });
export const aerial_ace = Object.assign(targetTypeDoubleDamageMove("Aeroassalto", "fighting"), { index: 7 });
export const sky_attack = Object.assign(simpleDamage("Aeroattacco"), { index: 8 });
export const aeroblast = {
        index: 9,
        name: "Aerocolpo",
        description: "-{power}, ignora buff Difesa avversari",
        before: function (_attacker, _defender, hit) {
          this.damagingMove = Boolean(hit);
          this.defMult = 0;
        },
        after: function (_attacker, _defender, hit) {
          this.defMult = 1;
          this.logKey = hit ? "dmg" : "fail";
        }
      };
export const sharpen = Object.assign(simpleSelfAttackBuff("Affilatore"), { index: 10 });
export const agility = Object.assign(simpleSelfAttackBuff("Agilità"), { index: 11 });
export const steel_wing = Object.assign(createToggleDamageMove("Alacciaio", "-{power}, 50% +{stats} Difesa", function(attacker) { attacker.buffSelfDef(this.stats); this.logKey = "buff_self_def"; }), { index: 12 });
export const helping_hand = Object.assign(simpleTeamAttackBuff("Altruismo"), { index: 13 });
export const amnesia = Object.assign(simpleSelfDefenseBuff("Amnesia"), { index: 14 });
export const aromatherapy = Object.assign(teamStatusCureMove("Aromaterapia", "Risolve tutti i problemi di stato della squadra"), { index: 15 });
export const assist = {
        index: 16,
        name: "Assistente",
        description: "Usa una mossa a caso della squadra (potenza: {power}, stats: {stats})",
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
export const absorb = Object.assign(damageRecoveryMove("Assorbimento", "-{power}, PS +1/8 del danno inflitto", 1/8), { index: 17 });
export const torment = Object.assign(disableLastMoveMove("Attaccalite"), { index: 18 });
export const wing_attack = Object.assign(simpleDamage("Attacco d'Ala"), { index: 19 });
export const barrage = Object.assign(simpleDamage("Attacco Pioggia"), { index: 20 });
export const quick_attack = Object.assign(simpleDamage("Attacco Rapido"), { index: 21 });
export const attract = Object.assign(simpleEnemyAttackNerf("Attrazione"), { index: 22 });
export const self_destruct = {
        index: 23,
        name: "Autodistruzione",
        description: "-2xPS max utilizzatore, che va KO",
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
export const wrap = Object.assign(bindDamageMove("Avvolgibotta", "-{power}, l'avversario non può essere sostituito x4 turni", 4), { index: 24 });
export const tackle = Object.assign(simpleDamage("Azione"), { index: 25 });
export const uproar = {
        index: 26,
        name: "Baraonda",
        description: "-{power}, i Pokemon alleati non possono essere Addormentati x5 turni",
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
export const barrier = Object.assign(simpleSelfDefenseBuff("Barriera"), { index: 27 });
export const peck = Object.assign(simpleDamage("Beccata"), { index: 28 });
export const block = Object.assign(trapMove("Blocco", "L'avversario non può essere sostituito"), { index: 29 });
export const roar = {
        index: 30,
        name: "Boato",
        damagingMove: false,
        description: "L'avversario viene sostituito",
        logKey: "roar",
        after: function (_attacker, defender, hit) {
          if (hit) {
            this.txt = defender.team.switchRandom();
            this.logKey = "roar";
          } else {
            this.logKey = "fail";
          }
        }
      };
export const bubble = Object.assign(simpleDamage("Bolla"), { index: 31 });
export const bubble_beam = Object.assign(simpleDamage("Bollaraggio"), { index: 32 });
export const blizzard = Object.assign(toggleSecondaryStatus("Bora", "-{power}, 50% Congela l'avversario", "frz", "dmg_frz"), { index: 33 });
export const pound = Object.assign(simpleDamage("Botta"), { index: 34 });
export const headbutt = Object.assign(simpleDamage("Bottintesta"), { index: 35 });
export const ember = Object.assign(simpleDamage("Braciere"), { index: 36 });
export const brick_break = {
        index: 37,
        name: "Breccia",
        description: "-{power}, prima distrugge gli schermi difensivi avversari",
        before: function (attacker, defender, hit) {
          this.damagingMove = Boolean(hit);
          if (hit) {
            if (defender && defender.team && (defender.team.teamDefBuff !== 0 || defender.team.buffDefCounter !== 0)) {
              var manager = attacker && attacker.team && attacker.team.battleManager;
              defender.team.teamDefBuff = 0;
              defender.team.buffDefCounter = 0;
              if (manager) {
                manager.emit({ log: "Breccia distrugge gli schermi di " + defender.team.name });
              }
            }
            this.logKey = "dmg";
          } else {
            this.logKey = "fail";
          }
        }
      };
export const fake_out = Object.assign(simpleDamage("Bruciapelo"), { index: 38 });
export const swagger = Object.assign(confuseBuffEnemyMove("Bullo"), { index: 39 });
export const milk_drink = Object.assign(simpleHalfRecovery("Buonlatte"), { index: 40 });
export const rock_blast = Object.assign(simpleDamage("Cadutamassi"), { index: 41 });
export const blaze_kick = Object.assign(simpleDamage("Calciardente"), { index: 42 });
export const high_jump_kick = Object.assign(simpleDamage("Calcinvolo"), { index: 43 });
export const rolling_kick = Object.assign(simpleDamage("Calciorullo"), { index: 44 });
export const jump_kick = Object.assign(simpleDamage("Calciosalto"), { index: 45 });
export const calm_mind = Object.assign(simpleSelfAttackDefenseBuff("Calmamente"), { index: 46 });
export const camouflage = {
        index: 47,
        name: "Camuffamento",
        damagingMove: false,
        description: "Chi la usa diventa dello stesso tipo dell'avversario",
        after: function (attacker, defender, hit) {
          if (hit) {
            attacker.type = defender.type.slice();
            attacker.pokemon.type = defender.pokemon.type.slice();
            this.txt = defender.type.map(typeDisplayName).join("/");
            this.logKey = "convers";
          } else {
            this.logKey = "fail";
          }
        }
      };
export const sing = Object.assign(simpleSleepMove("Canto"), { index: 48 });
export const skull_bash = Object.assign(twoTurnDefenseDamageMove("Capocciata"), { index: 49 });
export const waterfall = Object.assign(targetTypeDoubleDamageMove("Cascata", "flying"), { index: 50 });
export const focus_punch = Object.assign(conditionX2Move("Centripugno", "-{power}, x2 se l'utilizzatore non ha subito danni nel turno precedente", function(a) { return a.prevTurnActive && !a.prevTurnDamaged; }), { index: 51 });
export const kinesis = Object.assign(simpleEnemyAttackNerf("Cinèsi"), { index: 52 });
export const iron_tail = Object.assign(createToggleDamageMove("Codacciaio", "-{power}, 50% -{stats} Difesa avversaria", function(_attacker, defender) { if (defender.team.teamMistCounter === 0) { defender.nerfSelfDef(this.stats); this.logKey = "nerf_enem_def"; } }), { index: 53 });
export const tail_glow = Object.assign(simpleSelfAttackBigBuff("Codadiluce"), { index: 54 });
export const thrash = Object.assign(forcedTripleHitConfusionMove("Colpo"), { index: 55 });
export const low_kick = Object.assign(targetTypeDoubleDamageMove("Colpo Basso", "normal"), { index: 56 });
export const tail_whip = Object.assign(simpleEnemyDefenseNerf("Colpocoda"), { index: 57 });
export const mud_shot = Object.assign(simpleDamage("Colpodifango"), { index: 58 });
export const karate_chop = Object.assign(targetTypeDoubleDamageMove("Colpokarate", "dark"), { index: 59 });
export const comet_punch = Object.assign(simpleDamage("Cometapugno"), { index: 60 });
export const swift = Object.assign(simpleDamage("Comete", "-{power}, colpisce anche avversari semi-invulnerabili"), { index: 61 });
export const confusion = Object.assign(simpleDamage("Confusione"), { index: 62 });
export const counter = Object.assign(counterMove("Contrattacco", "Danno base pari al doppio del danno subito nel turno precedente"), { index: 63 });
export const reversal = Object.assign(missingHpDamageMove("Contropiede"), { index: 64 });
export const conversion = {
        index: 65,
        name: "Conversione",
        damagingMove: false,
        description: "Per il resto della battaglia ottiene il Tipo dell'avversario",
        logKey: "convers",
        after: function (attacker, defender, hit) {
          if (hit) {
            attacker.type = defender.type.slice();
            this.txt = defender.type.map(typeDisplayName).join("/");
          } else {
            this.logKey = "fail";
          }
        }
      };
export const conversion_2 = {
        index: 66,
        name: "Conversione2",
        damagingMove: false,
        description: "Diventa di un Tipo casuale resistente in totale ai Tipi dell'avversario",
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
          attacker.type = [chosenType];
          attacker.pokemon.type = [chosenType];
          this.txt = chosenType;
          this.logKey = "convers";
        }
      };
export const body_slam = Object.assign(toggleSecondaryStatus("Corposcontro", "-{power}, 50% Paralizza l'avversario", "par_block", "dmg_par"), { index: 67 });
export const cosmic_power = Object.assign(simpleSelfDefenseBuff("Cosmoforza"), { index: 68 });
export const cotton_spore = Object.assign(simpleEnemyAttackNerf("Cottonspora"), { index: 69 });
export const soft_boiled = Object.assign(simpleHalfRecovery("Covauova"), { index: 70 });
export const growth = Object.assign(simpleSelfAttackDefenseBuff("Crescita"), { index: 71 });
export const feather_dance = Object.assign(simpleEnemyAttackNerf("Danzadipiume"), { index: 72 });
export const swords_dance = Object.assign(simpleSelfAttackBigBuff("Danzaspada"), { index: 73 });
export const lovely_kiss = Object.assign(simpleSleepMove("Demonbacio"), { index: 74 });
export const wish = { index: 75, name: "Desiderio", damagingMove: false, description: "Alla fine del prossimo turno il Pokémon in campo recupera 1/2 PS max di chi ha usato Desiderio", after: function(attacker) { this.restored = Math.floor(attacker.pokemon.maxHp / 2); attacker.team.wishHealAmount += this.restored; attacker.team.wishSourceName = attacker.pokemon.name; this.logKey = "wish"; } };
export const destiny_bond = {
        index: 76,
        name: "Destinobbligato",
        damagingMove: false,
        description: "Se chi la usa va KO durante la prossima mossa avversaria, manda KO anche l'avversario",
        after: function (attacker) {
          attacker.destinyBondActive = true;
          this.logKey = "destiny_bond";
        }
      };
export const dynamic_punch = Object.assign(damagePlusAlwaysStatus("Dinamipugno", "-{power}, Confonde l'avversario", "cnf_block", "dmg_cnf"), { index: 77 });
export const spite = Object.assign(simpleNegatePercentageMove("Dispetto"), { index: 78 });
export const future_sight = Object.assign(futureSightMove("Divinazione"), { index: 79 });
export const water_sport = {
        index: 80,
        name: "Docciascudo",
        damagingMove: false,
        description: "+{stats} Difesa, previene la Scottatura",
        after: function (attacker) {
          attacker.buffSelfDef(this.stats);
          clearStatusEffect(attacker, "brn");
          attacker.burnImmune = true;
          this.logKey = "buff_self_def_burn";
        }
      };
export const sweet_kiss = Object.assign(simpleConfusionMove("Dolcebacio"), { index: 81 });
export const double_slap = Object.assign(simpleDamage("Doppiasberla"), { index: 82 });
export const twineedle = Object.assign(toggleSecondaryStatus("Doppio Ago", "-{power}, 50% Avvelena l'avversario", "psn", "dmg_psn"), { index: 83 });
export const double_kick = Object.assign(repeatLastTurnDamageMove("Doppiocalcio"), { index: 84 });
export const double_team = Object.assign(simpleSelfDefenseBuff("Doppioteam"), { index: 85 });
export const dragon_claw = Object.assign(simpleDamage("Dragartigli"), { index: 86 });
export const dragon_dance = Object.assign(simpleSelfAttackDefenseBuff("Dragodanza"), { index: 87 });
export const dragon_breath = Object.assign(toggleSecondaryStatus("Dragospiro", "-{power}, 50% Paralizza l'avversario", "par_block", "dmg_par"), { index: 88 });
export const eruption = Object.assign(conditionX2Move("Eruzione", "-{power}, x2 se chi la usa ha più di metà PS", function(a) { return a.hp > a.pokemon.maxHp / 2; }), { index: 89 });
export const imprison = {
        index: 90,
        name: "Esclusiva",
        damagingMove: false,
        description: "Blocca le mosse dell'avversario identiche a quelle di chi la usa",
        after: function (attacker, defender, hit) {
          if (hit) {
            var keys = attacker.pokemon.moves.map(function (m) { return m.key; });
            var blocked = [];
            defender.pokemon.moves.forEach(function (m) {
              if (keys.indexOf(m.key) !== -1 && defender.disabledMoves.indexOf(m.key) === -1) {
                defender.disabledMoves.push(m.key);
                blocked.push(m.name);
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
        name: "Esplosione",
        description: "-2xPS max utilizzatore, che va KO",
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
export const extreme_speed = Object.assign(simpleDamage("Extrarapido"), { index: 92 });
export const extrasensory = Object.assign(simpleDamage("Extrasenso"), { index: 93 });
export const facade = {
        index: 94,
        name: "Facciata",
        description: "-{power}, x2 se chi la usa ha uno status",
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
export const zap_cannon = Object.assign(damagePlusAlwaysStatus("Falcecannone", "-{power}, Paralizza l'avversario", "par_block", "dmg_par"), { index: 95 });
export const fake_tears = Object.assign(simpleEnemyDefenseNerf("Falselacrime"), { index: 96 });
export const false_swipe = {
        index: 97,
        name: "Falsofinale",
        description: "-{power}, lascia almeno 1 PS all'avversario",
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
export const mud_sport = Object.assign(simpleEnemyAttackNerf("Fangata"), { index: 98 });
export const muddy_water = Object.assign(simpleDamage("Fanghiglia"), { index: 99 });
export const sludge = Object.assign(toggleSecondaryStatus("Fango", "-{power}, 50% Avvelena l'avversario", "psn", "dmg_psn"), { index: 100 });
export const sludge_bomb = Object.assign(targetTypeDoubleDamageMove("Fangobomba", "fairy"), { index: 101 });
export const mud_slap = Object.assign(targetTypeDoubleDamageMove("Fangosberla", "electric"), { index: 102 });
export const charm = Object.assign(simpleEnemyAttackNerf("Fascino"), { index: 103 });
export const leaf_blade = Object.assign(simpleDamage("Fendifoglia"), { index: 104 });
export const metal_claw = Object.assign(createToggleDamageMove("Ferrartigli", "-{power}, 50% +{stats} Attacco", function(attacker) { attacker.buffSelfAtk(this.stats); this.logKey = "buff_self_atk"; }), { index: 105 });
export const iron_defense = Object.assign(simpleSelfDefenseBuff("Ferroscudo"), { index: 106 });
export const metal_sound = Object.assign(simpleEnemyDefenseNerf("Ferrostrido"), { index: 107 });
export const feint_attack = Object.assign(targetTypeDoubleDamageMove("Finta", "ghost"), { index: 108 });
export const flail = Object.assign(missingHpDamageMove("Flagello"), { index: 109 });
export const flash = Object.assign(simpleNegatePercentageMove("Flash"), { index: 110 });
export const focus_energy = Object.assign(simpleTeamAttackBuff("Focalenergia"), { index: 111 });
export const magical_leaf = Object.assign(simpleDamage("Fogliamagica"), { index: 112 });
export const razor_leaf = Object.assign(simpleDamage("Foglielama"), { index: 113 });
export const strength = Object.assign(simpleDamage("Forza"), { index: 114 });
export const ancient_power = Object.assign(createToggleDamageMove("Forzantica", "-{power}, 50% +{stats} Attacco e Difesa", function(attacker) { attacker.buffSelfAtk(this.stats); attacker.buffSelfDef(this.stats); this.logKey = "buff_self_atk_def"; }), { index: 115 });
export const secret_power = {
        index: 116,
        name: "Forzasegreta",
        description: "-{power}, effetto aggiuntivo dipendente dal meteo",
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
export const mist_ball = Object.assign(createToggleDamageMove("Foschisfera", "-{power}, 50% +{stats} Difesa", function(attacker) { attacker.buffSelfDef(this.stats); this.logKey = "buff_self_def"; }), { index: 117 });
export const dig = Object.assign(semiInvulnerableDamageMove("Fossa", "1° turno diventa non bersagliabile, 2° turno -{power}", "invul_dig"), { index: 118 });
export const rock_slide = Object.assign(targetTypeDoubleDamageMove("Frana", "bug"), { index: 119 });
export const vine_whip = Object.assign(simpleDamage("Frustata"), { index: 120 });
export const frustration = Object.assign(simpleDamage("Frustrazione"), { index: 121 });
export const thunderbolt = Object.assign(toggleSecondaryStatus("Fulmine", "-{power}, 50% Paralizza l'avversario", "par_block", "dmg_par"), { index: 122 });
export const leer = Object.assign(simpleEnemyDefenseNerf("Fulmisguardo"), { index: 123 });
export const fire_blast = Object.assign(toggleSecondaryStatus("Fuocobomba", "-{power}, 50% Brucia l'avversario", "brn", "dmg_brn"), { index: 124 });
export const will_o_wisp = Object.assign(simpleBurnMove("Fuocofatuo"), { index: 125 });
export const fire_punch = Object.assign(targetTypeDoubleDamageMove("Fuocopugno", "steel"), { index: 126 });
export const fury_attack = Object.assign(repeatLastTurnDamageMove("Furia"), { index: 127 });
export const thief = Object.assign(createToggleDamageMove("Furto", "-{power}, 50% se chi la usa non ha uno strumento, ruba quello dell'avversario", function(attacker, defender) {
    var manager = attacker.team && attacker.team.battleManager;
    this.logKey = manager && manager.stealHeldItem(attacker, defender) ? "steal_item" : "dmg_los_perc";
  }), { index: 128 });
export const icicle_spear = Object.assign(simpleDamage("Gelolancia"), { index: 129 });
export const ice_punch = Object.assign(targetTypeDoubleDamageMove("Gelopugno", "dragon"), { index: 130 });
export const ice_beam = Object.assign(toggleSecondaryStatus("Geloraggio", "-{power}, 50% Congela l'avversario", "frz", "dmg_frz"), { index: 131 });
export const guillotine = Object.assign(ohkoMove("Ghigliottina"), { index: 132 });
export const giga_drain = Object.assign(damageRecoveryMove("Gigassorbimento", "-{power}, PS +1/2 del danno inflitto", 1/2), { index: 133 });
export const sunny_day = {
        index: 134,
        name: "Giornodisole",
        damagingMove: false,
        description: "Fa splendere il sole",
        logKey: "weather_set",
        weatherLabel: "Giornodisole",
        setWeather: "sun",
        after: function () {
          this.logKey = "weather_set";
        }
      };
export const pay_day = Object.assign(simpleDamage("Giornopaga"), { index: 135 });
export const scratch = Object.assign(simpleDamage("Graffio"), { index: 136 });
export const hail = {
        index: 137,
        name: "Grandine",
        damagingMove: false,
        description: "Causa una grandinata",
        logKey: "weather_set",
        weatherLabel: "Grandine",
        setWeather: "hail",
        after: function () {
          this.logKey = "weather_set";
        }
      };
export const bulk_up = Object.assign(simpleSelfAttackDefenseBuff("Granfisico"), { index: 138 });
export const hyper_voice = Object.assign(simpleDamage("Granvoce"), { index: 139 });
export const howl = Object.assign(simpleSelfAttackBuff("Gridodilotta"), { index: 140 });
export const hydro_pump = Object.assign(simpleDamage("Idropompa"), { index: 141 });
export const water_pulse = Object.assign(toggleSecondaryStatus("Idropulsar", "-{power}, 50% Confonde l'avversario", "cnf_block", "dmg_cnf"), { index: 142 });
export const horn_attack = Object.assign(simpleDamage("Incornata"), { index: 143 });
export const cross_chop = Object.assign(simpleDamage("Incrocolpo"), { index: 144 });
export const nightmare = {
        index: 145,
        name: "Incubo",
        damagingMove: false,
        description: "Se l'avversario è Addormentato perde 1/3 dei PS max a fine turno",
        after: function (_attacker, defender, hit) {
          if (hit && defender.status === "slp") {
            defender.hp = Math.max(0, defender.hp - Math.floor(defender.pokemon.maxHp / 3));
            this.logKey = "nightmare_dmg";
          } else if (hit) {
            this.logKey = "status_not_done";
          } else {
            this.logKey = "fail";
          }
        }
      };
export const detect = Object.assign(blockStatBoostMove("Individua", "50% protegge la squadra dai moltiplicatori delle mosse avversarie x5 turni", 5), { index: 146 });
export const disable = Object.assign(disableLastMoveMove("Inibitore"), { index: 147 });
export const pursuit = {
        index: 148,
        name: "Inseguimento",
        description: "-{power}, se l'avversario è appena stato sostituito questo attacco colpisce invece lui con danno x1.5",
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
export const swallow = { index: 149, name: "Introenergia", damagingMove: false, description: "Recupera tutti i PS se Accumulo è stato usato in precedenza", after: function(attacker) { if (attacker.stockpileUsed) { attacker.hp = attacker.pokemon.maxHp; this.logKey = "rest_hp"; } else { this.logKey = "fail"; } } };
export const hidden_power = {
        index: 150,
        name: "Introforza",
        description: "-{power}, il prossimo turno non valgono i boost delle mosse dell'avversario",
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
export const hyper_beam = Object.assign(rechargeDamageMove("Iper Raggio"), { index: 151 });
export const hyper_fang = Object.assign(simpleDamage("Iperzanna"), { index: 152 });
export const hypnosis = Object.assign(simpleSleepMove("Ipnosi"), { index: 153 });
export const rage = Object.assign(conditionX2Move("Ira", "-{power}, x2 se chi la usa non ha tutti i PS", function(a) { return a.hp < a.pokemon.maxHp; }), { index: 154 });
export const dragon_rage = Object.assign(simpleDamage("Ira di Drago"), { index: 155 });
export const slash = Object.assign(simpleDamage("Lacerazione"), { index: 156 });
export const flamethrower = Object.assign(toggleSecondaryStatus("Lanciafiamme", "-{power}, 50% Brucia l'avversario", "brn", "dmg_brn"), { index: 157 });
export const lick = Object.assign(toggleSecondaryStatus("Leccata", "-{power}, 50% Paralizza l'avversario", "par_block", "dmg_par"), { index: 158 });
export const bind = Object.assign(bindDamageMove("Legatutto", "-{power}, l'avversario non può essere sostituito x4 turni", 4), { index: 159 });
export const mind_reader = Object.assign(chargeBuffMove("Leggimente"), { index: 160 });
export const constrict = Object.assign(simpleDamage("Limitazione"), { index: 161 });
export const lock_on = Object.assign(chargeBuffMove("Localizza"), { index: 162 });
export const moonlight = Object.assign(simpleHalfRecovery("Lucelunare"), { index: 163 });
export const sacred_fire = { index: 164, name: "Magifuoco", description: "-{power}, scongela chi lo usa e Scotta l'avversario", before: function(_attacker, _defender, hit) { this.damagingMove = Boolean(hit); }, after: function(attacker, defender, hit) { if (hit) { clearStatusEffect(attacker, "frz"); applyStatusEffect(defender, "brn"); this.logKey = "dmg_brn"; } else { this.logKey = "fail"; } } };
export const magic_coat = {
        index: 165,
        name: "Magivelo",
        damagingMove: false,
        description: "Riflette gli status subiti sull'attaccante finché chi la usa resta in campo",
        after: function (attacker, _defender, hit) {
          if (hit) {
            attacker.magicCoatActive = true;
            this.logKey = "magic_coat";
          } else {
            this.logKey = "fail";
          }
        }
      };
export const magnitude = Object.assign(conditionX2Move("Magnitudo", "-{power}, x2 se l'avversario sta usando Fossa", function(a, d) { return d.semiInvulnerable !== null && d.semiInvulnerable === "dig"; }), { index: 166 });
export const pain_split = {
        index: 167,
        name: "Malcomune",
        damagingMove: false,
        description: "Distribuisce in parti uguali i PS di chi la usa e del bersaglio",
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
export const curse = Object.assign(selfBuffDebuffMove("Maledizione"), { index: 168 });
export const mean_look = Object.assign(trapMove("Malosguardo", "L'avversario non può scappare"), { index: 169 });
export const dream_eater = {
        index: 170,
        name: "Mangiasogni",
        description: "Solo se l'avversario è Addormentato: -{power}, PS +1/2 del danno inflitto",
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
        name: "Maniereforti",
        description: "-{power}, x2 se l'avversario è Paralizzato ma ne cura la Paralisi",
        before: function (_attacker, defender, hit) {
          this.damagingMove = Boolean(hit);
          if (hit) {
            if (defender && (defender.status === "par_block" || defender.status === "par_free")) {
              this.moveMult = 2;
              defender.status = null;
              defender.sleepCounter = 0;
              defender.sleepDuration = 3;
              defender.confCounter = 0;
              defender.pendingDelayedStatus = null;
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
export const crabhammer = Object.assign(simpleDamage("Martellata"), { index: 172 });
export const morning_sun = Object.assign(weatherRecoveryMove("Mattindoro", "Recupera 1/2 PS max, 1/4 con meteo avverso, tutti con sole"), { index: 173 });
export const meditate = Object.assign(simpleSelfAttackBuff("Meditazione"), { index: 174 });
export const mega_kick = Object.assign(simpleDamage("Megacalcio"), { index: 175 });
export const megahorn = Object.assign(targetTypeDoubleDamageMove("Megacorno", "psychic"), { index: 176 });
export const mega_punch = Object.assign(simpleDamage("Megapugno"), { index: 177 });
export const mega_drain = Object.assign(damageRecoveryMove("Megassorbimento", "-{power}, PS +1/4 del danno inflitto", 1/4), { index: 178 });
export const grass_whistle = Object.assign(simpleSleepMove("Meloderba"), { index: 179 });
export const memento = Object.assign(simpleEnemyAtkDefNerf("Memento"), { index: 180 });
export const meteor_mash = Object.assign(createToggleDamageMove("Meteorpugno", "-{power}, 50% +{stats} Attacco", function(attacker) { attacker.buffSelfAtk(this.stats); this.logKey = "buff_self_atk"; }), { index: 181 });
export const metronome = {
        index: 182,
        name: "Metronomo",
        damagingMove: false,
        description: "Utilizza una mossa casuale (potenza: {power}, stats: {stats})",
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
export const string_shot = Object.assign(simpleEnemyAttackNerf("Millebave"), { index: 183 });
export const mimic = {
        index: 184,
        name: "Mimica",
        damagingMove: false,
        description: "Diventa l'ultima mossa dell'avversario fino al proprio cambio o KO (potenza: {power}, stats: {stats})",
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
export const minimize = Object.assign(simpleSelfDefenseBuff("Minimizzato"), { index: 185 });
export const pin_missile = Object.assign(repeatLastTurnDamageMove("Missilspillo"), { index: 186 });
export const bite = Object.assign(simpleDamage("Morso"), { index: 187 });
export const seismic_toss = {
        index: 188,
        name: "Movimento Sismico",
        description: "-PS attuali",
        before: function (attacker, _defender, hit) {
          this.damagingMove = Boolean(hit);
          this.power = attacker.hp;
        },
        after: function (_attacker, _defender, hit) {
          this.logKey = hit ? "dmg" : "fail";
        }
      };
export const whirlpool = Object.assign(bindDamageMove("Mulinello", "-{power}, l'avversario non può essere sostituito x4 turni", 4), { index: 189 });
export const smokescreen = Object.assign(simpleEnemyAttackNerf("Muro di Fumo"), { index: 190 });
export const nature_power = Object.assign(conditionX2Move("Naturforza", "-{power}, x2 se è attiva una mossa meteorologica", function(a) { return a.team.battleManager && a.team.battleManager.weather !== null; }), { index: 191 });
export const mist = {
        index: 192,
        name: "Nebbia",
        damagingMove: false,
        description: "Previene la riduzione di Attacco/Difesa della propria squadra x5 turni",
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
        name: "Nube",
        damagingMove: false,
        description: "Annulla le modifiche di stats di ogni squadra",
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
export const doom_desire = Object.assign(futureSightMove("Desiderio Fatale"), { index: 194 });
export const octazooka = Object.assign(createToggleDamageMove("Octazooka", "-{power}, 50% -{stats} Attacco avversario", function(_attacker, defender) { if (defender.team.teamMistCounter === 0) { defender.nerfSelfAtk(this.stats); this.logKey = "nerf_enem_atk"; } }), { index: 195 });
export const outrage = Object.assign(forcedTripleHitConfusionMove("Oltraggio"), { index: 196 });
export const night_shade = {
        index: 197,
        name: "Ombra Notturna",
        description: "-PS attuali",
        before: function (attacker, _defender, hit) {
          this.damagingMove = Boolean(hit);
          this.power = attacker.hp;
        },
        after: function (_attacker, _defender, hit) {
          this.logKey = hit ? "dmg" : "fail";
        }
      };
export const heat_wave = Object.assign(simpleDamage("Ondacalda"), { index: 198 });
export const shock_wave = Object.assign(simpleDamage("Ondashock"), { index: 199 });
export const bone_club = {
        index: 200,
        name: "Ossoclava",
        description: "-{power}, ignora buff Difesa avversari",
        before: function (_attacker, _defender, hit) {
          this.damagingMove = Boolean(hit);
          this.defMult = 0;
        },
        after: function (_attacker, _defender, hit) {
          this.defMult = 1;
          this.logKey = hit ? "dmg" : "fail";
        }
      };
export const bonemerang = Object.assign(simpleDamage("Ossomerang"), { index: 201 });
export const bone_rush = Object.assign(simpleDamage("Ossoraffica"), { index: 202 });
export const weather_ball = Object.assign(conditionX2Move("Palla Clima", "-{power}, x2 se è attivo un cambiamento climatico", function(attacker) { return Boolean(attacker.team.battleManager && attacker.team.battleManager.weather); }), { index: 203 });
export const ice_ball = Object.assign(simpleDamage("Palla Gelo"), { index: 204 });
export const shadow_ball = Object.assign(createToggleDamageMove("Palla Ombra", "-{power}, 50% -{stats} Difesa avversaria", function(_attacker, defender) { if (defender.team.teamMistCounter === 0) { defender.nerfSelfDef(this.stats); this.logKey = "nerf_enem_def"; } }), { index: 205 });
export const belly_drum = Object.assign(selfBuffDebuffMove("Panciamburo"), { index: 206 });
export const stun_spore = Object.assign(simpleParalysisMove("Paralizzante"), { index: 207 });
export const leech_seed = {
        index: 208,
        name: "Parassiseme",
        description: "-{power}, a fine turno il Pokémon attivo assorbe 1/8 dei PS max dell'avversario",
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
export const bide = Object.assign(twoTurnDefenseDamageMove("Pazienza"), { index: 209 });
export const drill_peck = Object.assign(simpleDamage("Perforbecco"), { index: 210 });
export const horn_drill = Object.assign(ohkoMove("Perforcorno"), { index: 211 });
export const stomp = Object.assign(simpleDamage("Pestone"), { index: 212 });
export const petal_dance = Object.assign(forcedTripleHitConfusionMove("Petalodanza"), { index: 213 });
export const beat_up = Object.assign(conditionX2Move("Picchiaduro", "-{power}, x2 se un compagno è appena andato KO", function(a) { if (a.team.teamKOTracker) { a.team.teamKOTracker = false; return true; } return false; }), { index: 214 });
export const slack_off = Object.assign(simpleHalfRecovery("Pigro"), { index: 215 });
export const rain_dance = {
        index: 216,
        name: "Pioggiadanza",
        damagingMove: false,
        description: "Causa un acquazzone",
        logKey: "weather_set",
        weatherLabel: "Pioggiadanza",
        setWeather: "rain",
        after: function () {
          this.logKey = "weather_set";
        }
      };
export const water_gun = Object.assign(simpleDamage("Pistolacqua"), { index: 217 });
export const powder_snow = Object.assign(simpleDamage("Polneve"), { index: 218 });
export const vise_grip = Object.assign(simpleDamage("Presa"), { index: 219 });
export const foresight = Object.assign(preventDefRaiseMove("Preveggenza"), { index: 220 });
export const knock_off = {
        index: 221,
        name: "Privazione",
        description: "-{power}, l'avversario non può usare l'oggetto tenuto fino al KO",
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
export const sweet_scent = Object.assign(simpleEnemyDefenseNerf("Profumino"), { index: 222 });
export const protect = Object.assign(blockStatBoostMove("Protezione", "50% protegge la squadra dai moltiplicatori delle mosse avversarie x5 turni", 5), { index: 223 });
export const taunt = Object.assign(disableLastMoveMove("Provocazione"), { index: 224 });
export const psych_up = {
        index: 225,
        name: "Psicamisù",
        damagingMove: false,
        description: "Copia le alterazioni delle statistiche del bersaglio",
        after: function (attacker, defender) {
          attacker.atkBuff = Math.max(attacker.atkBuff, defender.atkBuff);
          attacker.defBuff = Math.max(attacker.defBuff, defender.defBuff);
          attacker.atkNerf = Math.max(attacker.atkNerf, defender.atkNerf);
          attacker.defNerf = Math.max(attacker.defNerf, defender.defNerf);
          this.logKey = "copy_stats";
        }
      };
export const psychic = Object.assign(createToggleDamageMove("Psichico", "-{power}, 50% -{stats} Difesa avversaria", function(_attacker, defender) { if (defender.team.teamMistCounter === 0) { defender.nerfSelfDef(this.stats); this.logKey = "nerf_enem_def"; } }), { index: 226 });
export const psywave = {
        index: 227,
        name: "Psiconda",
        description: "Danno base pari a 1.5xLv",
        before: function (attacker, _defender, hit) {
          this.power = attacker.pokemon.level * 1.5;
          this.damagingMove = Boolean(hit);
        },
        after: function (_attacker, _defender, hit) {
          this.logKey = hit ? "dmg" : "fail";
        }
      };
export const psybeam = Object.assign(targetTypeDoubleDamageMove("Psicoraggio", "poison"), { index: 228 });
export const psycho_boost = Object.assign(simpleDamage("Psicoslancio"), { index: 229 });
export const shadow_punch = Object.assign(simpleDamage("Pugnodombra"), { index: 230 });
export const mach_punch = Object.assign(simpleDamage("Pugnorapido"), { index: 231 });
export const needle_arm = Object.assign(simpleDamage("Pugnospine"), { index: 232 });
export const spikes = {
        index: 233,
        name: "Punte",
        damagingMove: false,
        description: "Infligge danni pari al livello al Pokemon avversario che entra in campo",
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
export const sheer_cold = Object.assign(ohkoMove("Purogelo"), { index: 234 });
export const ingrain = { index: 235, name: "Radicamento", damagingMove: false, description: "Recupera 1/2 PS max dopo ogni mossa, non puo essere ritirato", after: function(attacker) { attacker.rooted = true; this.logKey = "root"; } };
export const gust = Object.assign(conditionX2Move("Raffica", "-{power}, x2 se l'avversario sta usando Volo", function(_a, d) { return d.semiInvulnerable === "fly"; }), { index: 236 });
export const harden = Object.assign(simpleSelfDefenseBuff("Rafforzatore"), { index: 237 });
export const aurora_beam = Object.assign(createToggleDamageMove("Raggiaurora", "-{power}, 50% -{stats} Attacco avversario", function(_attacker, defender) { if (defender.team.teamMistCounter === 0) { defender.nerfSelfAtk(this.stats); this.logKey = "nerf_enem_atk"; } }), { index: 238 });
export const trick = {
        index: 239,
        name: "Raggiro",
        damagingMove: false,
        description: "Scambia il proprio strumento con quello dell'avversario",
        after: function (attacker, defender, hit) {
          var manager = attacker.team && attacker.team.battleManager;
          if (hit && manager && manager.swapHeldItems(attacker, defender)) {
            this.logKey = "trick_item";
          } else {
            this.logKey = "fail";
          }
        }
      };
export const spider_web = Object.assign(trapMove("Ragnatela", "L'avversario non può scappare"), { index: 240 });
export const grudge = {
        index: 241,
        name: "Rancore",
        damagingMove: false,
        description: "Se chi la usa viene mandato KO da una mossa avversaria, la blocca",
        after: function (attacker) {
          attacker.grudgeActive = true;
          this.logKey = "grudge";
        }
      };
export const rapid_spin = {
        index: 242,
        name: "Rapigiro",
        description: "-{power}, rimuove Punte, Parassiseme e blocchi multiturno",
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
        name: "Regalino",
        description: "-{power}, 50% l'avversario recupera 1/4 dei PS max",
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
export const endure = { index: 244, name: "Resistenza", damagingMove: false, description: "Resiste al turno successivo con almeno 1 PS", after: function(attacker) { attacker.endure = true; this.logKey = "endure"; } };
export const defense_curl = {
        index: 245,
        name: "Ricciolscudo",
        damagingMove: false,
        description: "+{stats} Difesa",
        logKey: "buff_self_def",
        before: function (attacker) {
          attacker.buffSelfDef(this.stats);
          attacker.defenseCurlUsed = true;
        }
      };
export const recycle = {
        index: 246,
        name: "Riciclo",
        damagingMove: false,
        description: "Ricrea lo strumento assegnato a inizio battaglia",
        after: function (attacker) {
          var manager = attacker.team && attacker.team.battleManager;
          this.logKey = manager && manager.recycleHeldItem(attacker) ? "recycle_item" : "fail";
        }
      };
export const take_down = Object.assign(recoilDamageMove("Riduttore"), { index: 247 });
export const reflect = Object.assign(simpleTeamDefenseBuff("Riflesso"), { index: 248 });
export const bounce = Object.assign(semiInvulnerableDamageMove("Rimbalzo", "1° turno diventa non bersagliabile, 2° turno -{power} e Paralizza", "invul_fly", function (_attacker, defender) {
        if (applyStatusEffect(defender, "par_block")) {
          this.logKey = "dmg_par";
        }
      }), { index: 249 });
export const endeavor = {
        index: 250,
        name: "Rimonta",
        damagingMove: false,
        description: "Riduce i PS dell'avversario pari a quelli di chi lo usa",
        after: function (attacker, defender, hit) {
          if (hit) {
            defender.hp = Math.min(defender.hp, attacker.hp);
            this.logKey = "endeavor";
          } else {
            this.logKey = "fail";
          }
        }
      };
export const refresh = { index: 251, name: "Rinfrescata", damagingMove: false, description: "Risolve tutti i problemi di stato di chi lo usa", after: function(attacker) { if (attacker.status || attacker.sleepCounter || attacker.confCounter || attacker.pendingDelayedStatus) { attacker.status = null; attacker.sleepCounter = 0; attacker.sleepDuration = 3; attacker.confCounter = 0; attacker.pendingDelayedStatus = null; this.logKey = "cure_status"; } else { this.logKey = "fail"; } } };
export const heal_bell = Object.assign(teamStatusCureMove("Rintoccasana", "Risolve tutti i problemi di stato della squadra"), { index: 252 });
export const encore = {
        index: 253,
        name: "Ripeti",
        damagingMove: false,
        description: "L'avversario ripete l'ultima mossa usata x3 turni",
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
            this.txt = lastMove.name;
          } else {
            this.logKey = "fail";
          }
        }
      };
export const rest = {
        index: 254,
        name: "Riposo",
        damagingMove: false,
        description: "Chi la usa dorme per 2 turni e recupera tutti i PS",
        before: function (attacker) {
          if (attacker.status !== null || attacker.hp !== attacker.pokemon.maxHp) {
            attacker.status = null;
            attacker.sleepCounter = 0;
            attacker.sleepDuration = 3;
            attacker.confCounter = 0;
            attacker.pendingDelayedStatus = null;
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
export const recover = Object.assign(simpleHalfRecovery("Ripresa"), { index: 255 });
export const withdraw = Object.assign(simpleSelfDefenseBuff("Ritirata"), { index: 256 });
export const return_move = Object.assign(simpleDamage("Ritorno"), { index: 257 });
export const rock_tomb = Object.assign(createToggleDamageMove("Rocciotomba", "-{power}, 50% +{stats} Difesa", function(attacker) { attacker.buffSelfDef(this.stats); this.logKey = "buff_self_def"; }), { index: 258 });
export const rollout = Object.assign(conditionX2Move("Rotolamento", "-{power}, x2 se chi lo usa ha attivo Ricciolscudo", function(a) { return a.defenseCurlUsed; }), { index: 259 });
export const growl = Object.assign(simpleEnemyAttackNerf("Ruggito"), { index: 260 });
export const flame_wheel = { index: 261, name: "Ruotafuoco", description: "-{power}, scongela chi lo usa", before: function(_attacker, _defender, hit) { this.damagingMove = Boolean(hit); }, after: function(attacker, _defender, hit) { if (hit) { clearStatusEffect(attacker, "frz"); this.logKey = "dmg"; } else { this.logKey = "fail"; } } };
export const snore = { index: 262, name: "Russare", description: "-{power}, utilizzabile solo mentre si dorme", before: function(attacker, _defender, hit) { if (attacker.status !== "slp") { this.damagingMove = false; return; } this.damagingMove = Boolean(hit); }, after: function(_attacker, _defender, hit) { this.logKey = this.damagingMove && hit ? "dmg" : "fail"; } };
export const sand_tomb = Object.assign(bindDamageMove("Sabbiotomba", "-{power}, l'avversario non può essere sostituito x4 turni", 4), { index: 263 });
export const safeguard = {
        index: 264,
        name: "Salvaguardia",
        damagingMove: false,
        description: "50% protegge la squadra dai problemi di stato x5 turni",
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
export const leech_life = Object.assign(damageRecoveryMove("Sanguisuga", "-{power}, PS +1/4 del danno inflitto", 1/4), { index: 265 });
export const rock_throw = Object.assign(targetTypeDoubleDamageMove("Sassata", "ice"), { index: 266 });
export const yawn = {
        index: 267,
        name: "Sbadiglio",
        damagingMove: false,
        description: "Addormenta l'avversario alla fine del turno successivo",
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
                delay: 3,
                source: "yawn"
              };
              this.logKey = "sleep_delayed";
            }
          } else {
            this.logKey = "fail";
          }
        }
      };
export const arm_thrust = Object.assign(simpleDamage("Sberletese"), { index: 268 });
export const light_screen = Object.assign(simpleTeamDefenseBuff("Schermoluce"), { index: 269 });
export const slam = Object.assign(simpleDamage("Schianto"), { index: 270 });
export const sketch = {
        index: 271,
        name: "Schizzo",
        damagingMove: false,
        description: "Copia permanentemente l'ultima mossa usata dall'avversario",
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
export const spark = Object.assign(toggleSecondaryStatus("Scintilla", "-{power}, 50% Paralizza l'avversario", "par_block", "dmg_par"), { index: 272 });
export const snatch = {
        index: 273,
        name: "Scippo",
        description: "-{power}, 50% ruba i buff statistiche non multiturno dell'avversario",
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
export const struggle = Object.assign(recoilDamageMove("Scontro"), { index: 274 });
export const acid_armor = Object.assign(simpleSelfDefenseBuff("Scudo Acido"), { index: 275 });
export const double_edge = Object.assign(recoilDamageMove("Sdoppiatore"), { index: 276 });
export const signal_beam = Object.assign(toggleSecondaryStatus("Segnoraggio", "-{power}, 50% Confonde l'avversario", "cnf_block", "dmg_cnf"), { index: 277 });
export const odor_sleuth = Object.assign(preventDefRaiseMove("Segugio"), { index: 278 });
export const bullet_seed = Object.assign(simpleDamage("Semitraglia"), { index: 279 });
export const spit_up = {
        index: 280,
        name: "Sfoghenergia",
        description: "-{power}, x2 se Accumulo è stato usato in precedenza",
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
export const fury_swipes = Object.assign(simpleDamage("Sfuriate"), { index: 281 });
export const astonish = Object.assign(simpleDamage("Sgomento"), { index: 282 });
export const crunch = Object.assign(createToggleDamageMove("Sgranocchio", "-{power}, 50% -{stats} Difesa avversaria", function(_attacker, defender) { if (defender.team.teamMistCounter === 0) { defender.nerfSelfDef(this.stats); this.logKey = "nerf_enem_def"; } }), { index: 283 });
export const glare = Object.assign(simpleParalysisMove("Sguardo Feroce"), { index: 284 });
export const synthesis = Object.assign(weatherRecoveryMove("Sintesi", "Recupera 1/2 PS max, 1/4 con meteo avverso, tutti con sole"), { index: 285 });
export const smog = Object.assign(toggleSecondaryStatus("Smog", "-{power}, 50% Avvelena l'avversario", "psn", "dmg_psn"), { index: 286 });
export const solar_beam = {
        index: 287,
        name: "Solarraggio",
        description: "1° turno carica, 2° -{power} x2, con Giornodisole attacca subito",
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
export const tickle = Object.assign(simpleEnemyAtkDefNerf("Solletico"), { index: 288 });
export const sonic_boom = Object.assign(simpleDamage("Sonicboom"), { index: 289 });
export const sleep_powder = Object.assign(simpleSleepMove("Sonnifero"), { index: 290 });
export const sleep_talk = {
        index: 291,
        name: "Sonnolalia",
        damagingMove: false,
        description: "Usabile solo se chi la usa è addormentato, usa una mossa a caso tra quelle conosciute",
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
        name: "Sostituto",
        damagingMove: false,
        description: "Resiste al turno successivo con almeno 1 PS",
        after: function (attacker) {
          attacker.endure = true;
          this.logKey = "endure";
        }
      };
export const charge = Object.assign(chargeBuffMove("Sottocarica"), { index: 293 });
export const dive = Object.assign(semiInvulnerableDamageMove("Sub", "1° turno diventa non bersagliabile, 2° turno -{power}", "invul_sub"), { index: 294 });
export const submission = Object.assign(recoilDamageMove("Sottomissione"), { index: 295 });
export const rock_smash = Object.assign(targetTypeDoubleDamageMove("Spaccaroccia", "rock"), { index: 296 });
export const spike_cannon = Object.assign(repeatLastTurnDamageMove("Sparalance"), { index: 297 });
export const mirror_coat = Object.assign(counterMove("Specchiovelo", "Danno base pari al doppio del danno subito nel turno precedente"), { index: 298 });
export const mirror_move = {
        index: 299,
        name: "Speculmossa",
        damagingMove: false,
        description: "Utilizza l'ultima mossa utilizzata dall'avversario (potenza: {power}, stats: {stats})",
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
        name: "Splash",
        damagingMove: false,
        description: "*Parte la sigla di Paperissima*",
        after: function () {
          this.logKey = "smp_move";
        }
      };
export const spore = Object.assign(simpleSleepMove("Spora"), { index: 301 });
export const baton_pass = {
        index: 302,
        name: "Staffetta",
        damagingMove: false,
        requestsBattleSwitch: true,
        description: "Chi la usa è sostituito e passa le alterazioni al nuovo Pokemon",
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
              status: attacker.status === "cnf_block" || attacker.status === "cnf_free" ? null : attacker.status,
              sleepCounter: attacker.sleepCounter,
              sleepDuration: attacker.sleepDuration,
              slpSource: attacker.slpSource,
              confCounter: 0,
              pendingDelayedStatus: attacker.pendingDelayedStatus && attacker.pendingDelayedStatus.status !== "cnf_block" && attacker.pendingDelayedStatus.status !== "cnf_free"
                ? Object.assign({}, attacker.pendingDelayedStatus)
                : null
            };
            this.logKey = "baton_pass";
          } else {
            this.logKey = "fail";
          }
        }
      };
export const dizzy_punch = Object.assign(toggleSecondaryStatus("Stordipugno", "-{power}, 50% Confonde l'avversario", "cnf_block", "dmg_cnf"), { index: 303 });
export const confuse_ray = Object.assign(simpleConfusionMove("Stordiraggio"), { index: 304 });
export const sky_uppercut = Object.assign(conditionX2Move("Stramontante", "-{power}, x2 se l'avversario sta usando Volo", function(_a, d) { return d.semiInvulnerable === "fly"; }), { index: 305 });
export const teeter_dance = Object.assign(simpleConfusionMove("Strampadanza"), { index: 306 });
export const screech = Object.assign(simpleEnemyDefenseNerf("Stridio"), { index: 307 });
export const supersonic = Object.assign(simpleConfusionMove("Supersuono"), { index: 308 });
export const super_fang = {
        index: 309,
        name: "Superzanna",
        description: "Dimezza i PS avversari (almeno 1 danno)",
        before: function (_attacker, defender, hit) {
          if (hit) {
            defender.hp = Math.floor(defender.hp / 2);
          }
        },
        after: function (_attacker, _defender, hit) {
          this.logKey = hit ? "dmg" : "fail";
        }
      };
export const covet = Object.assign(createToggleDamageMove("Supplica", "-{power}, 50% se chi la usa non ha uno strumento, ruba quello dell'avversario", function(attacker, defender) {
    var manager = attacker.team && attacker.team.battleManager;
    this.logKey = manager && manager.stealHeldItem(attacker, defender) ? "steal_item" : "dmg_los_perc";
  }), { index: 310 });
export const surf = Object.assign(targetTypeDoubleDamageMove("Surf", "ground"), { index: 311 });
export const cut = Object.assign(targetTypeDoubleDamageMove("Taglio", "grass"), { index: 312 });
export const fury_cutter = Object.assign(repeatLastTurnDamageMove("Tagliofuria"), { index: 313 });
export const teleport = {
        index: 314,
        name: "Teletrasporto",
        damagingMove: false,
        description: "Fugge dal Pokémon selvatico",
        logKey: "fail",
        after: function () {
          this.requestsBattleFlee = true;
        }
      };
export const clamp = Object.assign(bindDamageMove("Tenaglia", "-{power}, l'avversario non può essere sostituito x4 turni", 4), { index: 315 });
export const earthquake = Object.assign(targetTypeDoubleDamageMove("Terremoto", "fire"), { index: 316 });
export const sandstorm = {
        index: 317,
        name: "Terrempesta",
        damagingMove: false,
        description: "Causa una tempesta di sabbia",
        logKey: "weather_set",
        weatherLabel: "Terrempesta",
        setWeather: "sand",
        after: function () {
          this.logKey = "weather_set";
        }
      };
export const twister = Object.assign(conditionX2Move("Tornado", "-{power}, x2 se l'avversario sta usando Volo", function(_a, d) { return d.semiInvulnerable === "fly"; }), { index: 318 });
export const toxic = {
        index: 319,
        name: "Tossina",
        description: "-{power}, Avvelena l'avversario",
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
        name: "Trasformazione",
        damagingMove: false,
        description: "Copia Tipo e mosse avversari (potenza: {power}, stats: {stats})",
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
            origType: attacker.type.slice()
          };

          attacker.mimicInfo = null;
          attacker.tempMoveInfo = null;
          attacker.pokemon.type = defender.pokemon.type.slice();
          attacker.pokemon.moves = transformedMoves;
          attacker.type = defender.type.slice();
          attacker.updateMovesState();
          this.logKey = "transform";
        }
      };
export const tri_attack = Object.assign(simpleDamage("Tripletta"), { index: 321 });
export const triple_kick = Object.assign(simpleDamage("Triplocalcio"), { index: 322 });
export const crush_claw = Object.assign(createToggleDamageMove("Tritartigli", "-{power}, 50% +{stats} Attacco", function(attacker) { attacker.buffSelfAtk(this.stats); this.logKey = "buff_self_atk"; }), { index: 323 });
export const superpower = Object.assign(buffLossMove("Troppoforte", "-{power}, x2 se chi la usa ha l'attacco alzato ma lo perde"), { index: 324 });
export const thunder = {
        index: 325,
        name: "Tuono",
        description: "-{power}, 50% Paralizza, se piove Paralizza senza modificare la %",
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
export const thunder_wave = Object.assign(simpleParalysisMove("Tuononda"), { index: 326 });
export const thunder_punch = Object.assign(targetTypeDoubleDamageMove("Tuonopugno", "water"), { index: 327 });
export const thunder_shock = Object.assign(simpleDamage("Tuonoshock"), { index: 328 });
export const whirlwind = {
        index: 329,
        name: "Turbine",
        damagingMove: false,
        description: "L'avversario viene sostituito",
        logKey: "roar",
        after: function (_attacker, defender, hit) {
          if (hit) {
            this.txt = defender.team.switchRandom();
            this.logKey = "roar";
          } else {
            this.logKey = "fail";
          }
        }
      };
export const fire_spin = Object.assign(bindDamageMove("Turbofuoco", "-{power}, l'avversario non può essere sostituito x4 turni", 4), { index: 330 });
export const sand_attack = Object.assign(simpleEnemyAttackNerf("Turbosabbia"), { index: 331 });
export const perish_song = {
        index: 332,
        name: "Ultimocanto",
        damagingMove: false,
        description: "Ogni Pokemon in campo va KO alla fine di 3 turni se non viene sostituito",
        after: function (attacker, _defender, hit) {
          if (hit) {
            var bm = attacker.team.battleManager;
            [attacker.team, bm.playerTeam === attacker.team ? bm.enemyTeam : bm.playerTeam].forEach(function (team) {
              team.combatantList.forEach(function (c) {
                if (!c.isFainted()) {
                  c.perishSongTurns = 3;
                }
              });
            });
            attacker.perishSongTurns = 2;
            this.logKey = "perish_song";
          } else {
            this.logKey = "fail";
          }
        }
      };
export const egg_bomb = Object.assign(simpleDamage("Uovobomba"), { index: 333 });
export const overheat = Object.assign(buffLossMove("Vampata", "-{power}, x2 se chi la usa ha l'attacco alzato ma lo perde"), { index: 334 });
export const poison_tail = Object.assign(simpleDamage("Velenocoda"), { index: 335 });
export const poison_fang = Object.assign(toggleSecondaryStatus("Velenodenti", "-{power}, 50% Avvelena l'avversario", "psn", "dmg_psn"), { index: 336 });
export const poison_gas = {
        index: 337,
        name: "Velenogas",
        damagingMove: false,
        description: "Avvelena l'avversario",
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
export const poison_sting = Object.assign(simpleDamage("Velenospina"), { index: 338 });
export const poison_powder = {
        index: 339,
        name: "Velenpolvere",
        damagingMove: false,
        description: "Avvelena l'avversario",
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
export const revenge = Object.assign(conditionX2Move("Vendetta", "-{power}, x2 se chi la usa non ha tutti i PS", function(a) { return a.hp < a.pokemon.maxHp; }), { index: 340 });
export const razor_wind = {
        index: 341,
        name: "Ventagliente",
        description: "1° turno carica, 2° -{power} ignorando buff Difesa avversari",
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
export const silver_wind = Object.assign(createToggleDamageMove("Ventargenteo", "-{power}, 50% +{stats} Attacco e Difesa", function(attacker) { attacker.buffSelfAtk(this.stats); attacker.buffSelfDef(this.stats); this.logKey = "buff_self_atk_def"; }), { index: 342 });
export const icy_wind = Object.assign(createToggleDamageMove("Ventogelato", "-{power}, 50% -{stats} Attacco avversario", function(_attacker, defender) { if (defender.team.teamMistCounter === 0) { defender.nerfSelfAtk(this.stats); this.logKey = "nerf_enem_atk"; } }), { index: 343 });
export const scary_face = Object.assign(simpleEnemyAttackNerf("Visotruce"), { index: 344 });
export const vital_throw = Object.assign(simpleDamage("Vitaltiro"), { index: 345 });
export const fly = Object.assign(semiInvulnerableDamageMove("Volo", "1° turno diventa non bersagliabile, 2° turno -{power}", "invul_fly"), { index: 346 });
export const water_spout = Object.assign(conditionX2Move("Zampillo", "-{power}, x2 se chi la usa ha più di metà PS", function(a) { return a.hp > a.pokemon.maxHp / 2; }), { index: 347 });
export const volt_tackle = Object.assign(recoilDamageMove("Locomovolt"), { index: 348 });
export const hydro_cannon = Object.assign(rechargeDamageMove("Idrocannone"), { index: 349 });
export const blast_burn = Object.assign(rechargeDamageMove("Incendio"), { index: 350 });
export const frenzy_plant = Object.assign(rechargeDamageMove("Radicalbero"), { index: 351 });
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
