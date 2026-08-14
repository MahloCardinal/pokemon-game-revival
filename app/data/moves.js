import { TYPE_CHART } from "./type-chart.js";
import { random } from "../engine/deterministic-rng.js";

function buildMoveLibrary(entries) {
  var library = [];
  var usedIndexes = {};

  entries.forEach(function (config) {
    var index = Number(config.index);
    var definition;

    if (!Number.isFinite(index) || index <= 0) {
      throw new Error("Index mossa non valido: " + (config && config.name ? config.name : index));
    }

    if (usedIndexes[index]) {
      throw new Error("Index mossa duplicato: " + index);
    }

    usedIndexes[index] = true;

    definition = Object.assign({}, config, {
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
    return "status_baraonda";
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
      if (hit && lastMove !== null && lastMove.name !== "Scontro") {
        defender.disableMoveInhibit(lastMove.name);
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
      attacker.semiInvulnerable = this.name;
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
            this.logKey = "dmg_status_baraonda";
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
        attacker.team.futureSight.moveName = this.name;
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
  dmg_status_baraonda: function (ctx) { return damageLog(ctx, "infligge " + ctx.damage + " danni, ma " + ctx.defender.pokemon.name + " è protetto da Baraonda"); },
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
  punte_set: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", chi entra subisce danni pari al livello"; },
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
  status_baraonda: function (ctx) { return ctx.attacker.pokemon.name + " usa " + ctx.move.name + ", ma fallisce perché " + ctx.defender.pokemon.name + " è protetto da Baraonda"; },
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
export const Abbagliante = Object.assign(createToggleDamageMove("Abbagliante", "-{power}, 50% +{stats} Attacco", function(attacker) { attacker.buffSelfAtk(this.stats); this.logKey = "buff_self_atk"; }), { index: 1 });
export const Abisso = Object.assign(ohkoMove("Abisso"), { index: 2 });
export const Accumulo = { index: 3, name: "Accumulo", damagingMove: false, description: "+{stats} Difesa, prepara Introenergia e Sfoghenergia", logKey: "buff_self_def", before: function(attacker) { attacker.buffSelfDef(this.stats); attacker.accumuloUsed = true; } };
export const Acido = Object.assign(createToggleDamageMove("Acido", "-{power}, 50% -{stats} Difesa avversaria", function(_attacker, defender) { if (defender.team.teamMistCounter === 0) { defender.nerfSelfDef(this.stats); this.logKey = "nerf_enem_def"; } }), { index: 4 });
export const Adulazione = Object.assign(confuseBuffEnemyMove("Adulazione"), { index: 5 });
export const Aerasoio = Object.assign(simpleDamage("Aerasoio"), { index: 6 });
export const Aeroassalto = Object.assign(targetTypeDoubleDamageMove("Aeroassalto", "Lotta"), { index: 7 });
export const Aeroattacco = Object.assign(simpleDamage("Aeroattacco"), { index: 8 });
export const Aerocolpo = {
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
export const Affilatore = Object.assign(simpleSelfAttackBuff("Affilatore"), { index: 10 });
export const Agilita = Object.assign(simpleSelfAttackBuff("Agilità"), { index: 11 });
export const Alacciaio = Object.assign(createToggleDamageMove("Alacciaio", "-{power}, 50% +{stats} Difesa", function(attacker) { attacker.buffSelfDef(this.stats); this.logKey = "buff_self_def"; }), { index: 12 });
export const Altruismo = Object.assign(simpleTeamAttackBuff("Altruismo"), { index: 13 });
export const Amnesia = Object.assign(simpleSelfDefenseBuff("Amnesia"), { index: 14 });
export const Aromaterapia = Object.assign(teamStatusCureMove("Aromaterapia", "Risolve tutti i problemi di stato della squadra"), { index: 15 });
export const Assistente = {
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
export const Assorbimento = Object.assign(damageRecoveryMove("Assorbimento", "-{power}, PS +1/8 del danno inflitto", 1/8), { index: 17 });
export const Attaccalite = Object.assign(disableLastMoveMove("Attaccalite"), { index: 18 });
export const AttaccodAla = Object.assign(simpleDamage("Attacco d'Ala"), { index: 19 });
export const AttaccoPioggia = Object.assign(simpleDamage("Attacco Pioggia"), { index: 20 });
export const AttaccoRapido = Object.assign(simpleDamage("Attacco Rapido"), { index: 21 });
export const Attrazione = Object.assign(simpleEnemyAttackNerf("Attrazione"), { index: 22 });
export const Autodistruzione = {
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
export const Avvolgibotta = Object.assign(bindDamageMove("Avvolgibotta", "-{power}, l'avversario non può essere sostituito x4 turni", 4), { index: 24 });
export const Azione = Object.assign(simpleDamage("Azione"), { index: 25 });
export const Baraonda = {
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
export const Barriera = Object.assign(simpleSelfDefenseBuff("Barriera"), { index: 27 });
export const Beccata = Object.assign(simpleDamage("Beccata"), { index: 28 });
export const Blocco = Object.assign(trapMove("Blocco", "L'avversario non può essere sostituito"), { index: 29 });
export const Boato = {
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
export const Bolla = Object.assign(simpleDamage("Bolla"), { index: 31 });
export const Bollaraggio = Object.assign(simpleDamage("Bollaraggio"), { index: 32 });
export const Bora = Object.assign(toggleSecondaryStatus("Bora", "-{power}, 50% Congela l'avversario", "frz", "dmg_frz"), { index: 33 });
export const Botta = Object.assign(simpleDamage("Botta"), { index: 34 });
export const Bottintesta = Object.assign(simpleDamage("Bottintesta"), { index: 35 });
export const Braciere = Object.assign(simpleDamage("Braciere"), { index: 36 });
export const Breccia = {
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
export const Bruciapelo = Object.assign(simpleDamage("Bruciapelo"), { index: 38 });
export const Bullo = Object.assign(confuseBuffEnemyMove("Bullo"), { index: 39 });
export const Buonlatte = Object.assign(simpleHalfRecovery("Buonlatte"), { index: 40 });
export const Cadutamassi = Object.assign(simpleDamage("Cadutamassi"), { index: 41 });
export const Calciardente = Object.assign(simpleDamage("Calciardente"), { index: 42 });
export const Calcinvolo = Object.assign(simpleDamage("Calcinvolo"), { index: 43 });
export const Calciorullo = Object.assign(simpleDamage("Calciorullo"), { index: 44 });
export const Calciosalto = Object.assign(simpleDamage("Calciosalto"), { index: 45 });
export const Calmamente = Object.assign(simpleSelfAttackDefenseBuff("Calmamente"), { index: 46 });
export const Camuffamento = {
        index: 47,
        name: "Camuffamento",
        damagingMove: false,
        description: "Chi la usa diventa dello stesso tipo dell'avversario",
        after: function (attacker, defender, hit) {
          if (hit) {
            attacker.type = defender.type.slice();
            attacker.pokemon.type = defender.pokemon.type.slice();
            this.txt = defender.type.join("/");
            this.logKey = "convers";
          } else {
            this.logKey = "fail";
          }
        }
      };
export const Canto = Object.assign(simpleSleepMove("Canto"), { index: 48 });
export const Capocciata = Object.assign(twoTurnDefenseDamageMove("Capocciata"), { index: 49 });
export const Cascata = Object.assign(targetTypeDoubleDamageMove("Cascata", "Volante"), { index: 50 });
export const Centripugno = Object.assign(conditionX2Move("Centripugno", "-{power}, x2 se l'utilizzatore non ha subito danni nel turno precedente", function(a) { return a.prevTurnActive && !a.prevTurnDamaged; }), { index: 51 });
export const Cinesi = Object.assign(simpleEnemyAttackNerf("Cinèsi"), { index: 52 });
export const Codacciaio = Object.assign(createToggleDamageMove("Codacciaio", "-{power}, 50% -{stats} Difesa avversaria", function(_attacker, defender) { if (defender.team.teamMistCounter === 0) { defender.nerfSelfDef(this.stats); this.logKey = "nerf_enem_def"; } }), { index: 53 });
export const Codadiluce = Object.assign(simpleSelfAttackBigBuff("Codadiluce"), { index: 54 });
export const Colpo = Object.assign(forcedTripleHitConfusionMove("Colpo"), { index: 55 });
export const ColpoBasso = Object.assign(targetTypeDoubleDamageMove("Colpo Basso", "Normale"), { index: 56 });
export const Colpocoda = Object.assign(simpleEnemyDefenseNerf("Colpocoda"), { index: 57 });
export const Colpodifango = Object.assign(simpleDamage("Colpodifango"), { index: 58 });
export const Colpokarate = Object.assign(targetTypeDoubleDamageMove("Colpokarate", "Buio"), { index: 59 });
export const Cometapugno = Object.assign(simpleDamage("Cometapugno"), { index: 60 });
export const Comete = Object.assign(simpleDamage("Comete", "-{power}, colpisce anche avversari semi-invulnerabili"), { index: 61 });
export const Confusione = Object.assign(simpleDamage("Confusione"), { index: 62 });
export const Contrattacco = Object.assign(counterMove("Contrattacco", "Danno base pari al doppio del danno subito nel turno precedente"), { index: 63 });
export const Contropiede = Object.assign(missingHpDamageMove("Contropiede"), { index: 64 });
export const Conversione = {
        index: 65,
        name: "Conversione",
        damagingMove: false,
        description: "Per il resto della battaglia ottiene il Tipo dell'avversario",
        logKey: "convers",
        after: function (attacker, defender, hit) {
          if (hit) {
            attacker.type = defender.type.slice();
            this.txt = defender.type.join("/");
          } else {
            this.logKey = "fail";
          }
        }
      };
export const Conversione2 = {
        index: 66,
        name: "Conversione 2",
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
export const Corposcontro = Object.assign(toggleSecondaryStatus("Corposcontro", "-{power}, 50% Paralizza l'avversario", "par_block", "dmg_par"), { index: 67 });
export const Cosmoforza = Object.assign(simpleSelfDefenseBuff("Cosmoforza"), { index: 68 });
export const Cottonspora = Object.assign(simpleEnemyAttackNerf("Cottonspora"), { index: 69 });
export const Covauova = Object.assign(simpleHalfRecovery("Covauova"), { index: 70 });
export const Crescita = Object.assign(simpleSelfAttackDefenseBuff("Crescita"), { index: 71 });
export const Danzadipiume = Object.assign(simpleEnemyAttackNerf("Danzadipiume"), { index: 72 });
export const Danzaspada = Object.assign(simpleSelfAttackBigBuff("Danzaspada"), { index: 73 });
export const Demonbacio = Object.assign(simpleSleepMove("Demonbacio"), { index: 74 });
export const Desiderio = { index: 75, name: "Desiderio", damagingMove: false, description: "Alla fine del prossimo turno il Pokémon in campo recupera 1/2 PS max di chi ha usato Desiderio", after: function(attacker) { this.restored = Math.floor(attacker.pokemon.maxHp / 2); attacker.team.desiderioHealAmount += this.restored; attacker.team.desiderioSourceName = attacker.pokemon.name; this.logKey = "desire"; } };
export const Destinobbligato = {
        index: 76,
        name: "Destinobbligato",
        damagingMove: false,
        description: "Se chi la usa va KO durante la prossima mossa avversaria, manda KO anche l'avversario",
        after: function (attacker) {
          attacker.destinyBondActive = true;
          this.logKey = "destiny_bond";
        }
      };
export const Dinamipugno = Object.assign(damagePlusAlwaysStatus("Dinamipugno", "-{power}, Confonde l'avversario", "cnf_block", "dmg_cnf"), { index: 77 });
export const Dispetto = Object.assign(simpleNegatePercentageMove("Dispetto"), { index: 78 });
export const Divinazione = Object.assign(futureSightMove("Divinazione"), { index: 79 });
export const Docciascudo = {
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
export const Dolcebacio = Object.assign(simpleConfusionMove("Dolcebacio"), { index: 81 });
export const Doppiasberla = Object.assign(simpleDamage("Doppiasberla"), { index: 82 });
export const DoppioAgo = Object.assign(toggleSecondaryStatus("Doppio Ago", "-{power}, 50% Avvelena l'avversario", "psn", "dmg_psn"), { index: 83 });
export const Doppiocalcio = Object.assign(repeatLastTurnDamageMove("Doppiocalcio"), { index: 84 });
export const Doppioteam = Object.assign(simpleSelfDefenseBuff("Doppioteam"), { index: 85 });
export const Dragartigli = Object.assign(simpleDamage("Dragartigli"), { index: 86 });
export const Dragodanza = Object.assign(simpleSelfAttackDefenseBuff("Dragodanza"), { index: 87 });
export const Dragospiro = Object.assign(toggleSecondaryStatus("Dragospiro", "-{power}, 50% Paralizza l'avversario", "par_block", "dmg_par"), { index: 88 });
export const Eruzione = Object.assign(conditionX2Move("Eruzione", "-{power}, x2 se chi la usa ha più di metà PS", function(a) { return a.hp > a.pokemon.maxHp / 2; }), { index: 89 });
export const Esclusiva = {
        index: 90,
        name: "Esclusiva",
        damagingMove: false,
        description: "Blocca le mosse dell'avversario identiche a quelle di chi la usa",
        after: function (attacker, defender, hit) {
          if (hit) {
            var names = attacker.pokemon.moves.map(function (m) { return m.name; });
            var blocked = [];
            defender.pokemon.moves.forEach(function (m) {
              if (names.indexOf(m.name) !== -1 && defender.disabledMoves.indexOf(m.name) === -1) {
                defender.disabledMoves.push(m.name);
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
export const Esplosione = {
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
export const Extrarapido = Object.assign(simpleDamage("Extrarapido"), { index: 92 });
export const Extrasenso = Object.assign(simpleDamage("Extrasenso"), { index: 93 });
export const Facciata = {
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
export const Falcecannone = Object.assign(damagePlusAlwaysStatus("Falcecannone", "-{power}, Paralizza l'avversario", "par_block", "dmg_par"), { index: 95 });
export const Falselacrime = Object.assign(simpleEnemyDefenseNerf("Falselacrime"), { index: 96 });
export const Falsofinale = {
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
export const Fangata = Object.assign(simpleEnemyAttackNerf("Fangata"), { index: 98 });
export const Fanghiglia = Object.assign(simpleDamage("Fanghiglia"), { index: 99 });
export const Fango = Object.assign(toggleSecondaryStatus("Fango", "-{power}, 50% Avvelena l'avversario", "psn", "dmg_psn"), { index: 100 });
export const Fangobomba = Object.assign(targetTypeDoubleDamageMove("Fangobomba", "Folletto"), { index: 101 });
export const Fangosberla = Object.assign(targetTypeDoubleDamageMove("Fangosberla", "Elettro"), { index: 102 });
export const Fascino = Object.assign(simpleEnemyAttackNerf("Fascino"), { index: 103 });
export const Fendifoglia = Object.assign(simpleDamage("Fendifoglia"), { index: 104 });
export const Ferrartigli = Object.assign(createToggleDamageMove("Ferrartigli", "-{power}, 50% +{stats} Attacco", function(attacker) { attacker.buffSelfAtk(this.stats); this.logKey = "buff_self_atk"; }), { index: 105 });
export const Ferroscudo = Object.assign(simpleSelfDefenseBuff("Ferroscudo"), { index: 106 });
export const Ferrostrido = Object.assign(simpleEnemyDefenseNerf("Ferrostrido"), { index: 107 });
export const Finta = Object.assign(targetTypeDoubleDamageMove("Finta", "Spettro"), { index: 108 });
export const Flagello = Object.assign(missingHpDamageMove("Flagello"), { index: 109 });
export const Flash = Object.assign(simpleNegatePercentageMove("Flash"), { index: 110 });
export const Focalenergia = Object.assign(simpleTeamAttackBuff("Focalenergia"), { index: 111 });
export const Fogliamagica = Object.assign(simpleDamage("Fogliamagica"), { index: 112 });
export const Foglielama = Object.assign(simpleDamage("Foglielama"), { index: 113 });
export const Forza = Object.assign(simpleDamage("Forza"), { index: 114 });
export const Forzantica = Object.assign(createToggleDamageMove("Forzantica", "-{power}, 50% +{stats} Attacco e Difesa", function(attacker) { attacker.buffSelfAtk(this.stats); attacker.buffSelfDef(this.stats); this.logKey = "buff_self_atk_def"; }), { index: 115 });
export const Forzasegreta = {
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
export const Foschisfera = Object.assign(createToggleDamageMove("Foschisfera", "-{power}, 50% +{stats} Difesa", function(attacker) { attacker.buffSelfDef(this.stats); this.logKey = "buff_self_def"; }), { index: 117 });
export const Fossa = Object.assign(semiInvulnerableDamageMove("Fossa", "1° turno diventa non bersagliabile, 2° turno -{power}", "invul_dig"), { index: 118 });
export const Frana = Object.assign(targetTypeDoubleDamageMove("Frana", "Coleottero"), { index: 119 });
export const Frustata = Object.assign(simpleDamage("Frustata"), { index: 120 });
export const Frustrazione = Object.assign(simpleDamage("Frustrazione"), { index: 121 });
export const Fulmine = Object.assign(toggleSecondaryStatus("Fulmine", "-{power}, 50% Paralizza l'avversario", "par_block", "dmg_par"), { index: 122 });
export const Fulmisguardo = Object.assign(simpleEnemyDefenseNerf("Fulmisguardo"), { index: 123 });
export const Fuocobomba = Object.assign(toggleSecondaryStatus("Fuocobomba", "-{power}, 50% Brucia l'avversario", "brn", "dmg_brn"), { index: 124 });
export const Fuocofatuo = Object.assign(simpleBurnMove("Fuocofatuo"), { index: 125 });
export const Fuocopugno = Object.assign(targetTypeDoubleDamageMove("Fuocopugno", "Acciaio"), { index: 126 });
export const Furia = Object.assign(repeatLastTurnDamageMove("Furia"), { index: 127 });
export const Furto = Object.assign(createToggleDamageMove("Furto", "-{power}, 50% se chi la usa non ha uno strumento, ruba quello dell'avversario", function(attacker, defender) {
    var manager = attacker.team && attacker.team.battleManager;
    this.logKey = manager && manager.stealHeldItem(attacker, defender) ? "steal_item" : "dmg_los_perc";
  }), { index: 128 });
export const Gelolancia = Object.assign(simpleDamage("Gelolancia"), { index: 129 });
export const Gelopugno = Object.assign(targetTypeDoubleDamageMove("Gelopugno", "Drago"), { index: 130 });
export const Geloraggio = Object.assign(toggleSecondaryStatus("Geloraggio", "-{power}, 50% Congela l'avversario", "frz", "dmg_frz"), { index: 131 });
export const Ghigliottina = Object.assign(ohkoMove("Ghigliottina"), { index: 132 });
export const Gigassorbimento = Object.assign(damageRecoveryMove("Gigassorbimento", "-{power}, PS +1/2 del danno inflitto", 1/2), { index: 133 });
export const Giornodisole = {
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
export const Giornopaga = Object.assign(simpleDamage("Giornopaga"), { index: 135 });
export const Graffio = Object.assign(simpleDamage("Graffio"), { index: 136 });
export const Grandine = {
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
export const Granfisico = Object.assign(simpleSelfAttackDefenseBuff("Granfisico"), { index: 138 });
export const Granvoce = Object.assign(simpleDamage("Granvoce"), { index: 139 });
export const Gridodilotta = Object.assign(simpleSelfAttackBuff("Gridodilotta"), { index: 140 });
export const Idropompa = Object.assign(simpleDamage("Idropompa"), { index: 141 });
export const Idropulsar = Object.assign(toggleSecondaryStatus("Idropulsar", "-{power}, 50% Confonde l'avversario", "cnf_block", "dmg_cnf"), { index: 142 });
export const Incornata = Object.assign(simpleDamage("Incornata"), { index: 143 });
export const Incrocolpo = Object.assign(simpleDamage("Incrocolpo"), { index: 144 });
export const Incubo = {
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
export const Individua = Object.assign(blockStatBoostMove("Individua", "50% protegge la squadra dai moltiplicatori delle mosse avversarie x5 turni", 5), { index: 146 });
export const Inibitore = Object.assign(disableLastMoveMove("Inibitore"), { index: 147 });
export const Inseguimento = {
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
export const Introenergia = { index: 149, name: "Introenergia", damagingMove: false, description: "Recupera tutti i PS se Accumulo è stato usato in precedenza", after: function(attacker) { if (attacker.accumuloUsed) { attacker.hp = attacker.pokemon.maxHp; this.logKey = "rest_hp"; } else { this.logKey = "fail"; } } };
export const Introforza = {
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
export const IperRaggio = Object.assign(rechargeDamageMove("Iper Raggio"), { index: 151 });
export const Iperzanna = Object.assign(simpleDamage("Iperzanna"), { index: 152 });
export const Ipnosi = Object.assign(simpleSleepMove("Ipnosi"), { index: 153 });
export const Ira = Object.assign(conditionX2Move("Ira", "-{power}, x2 se chi la usa non ha tutti i PS", function(a) { return a.hp < a.pokemon.maxHp; }), { index: 154 });
export const IradiDrago = Object.assign(simpleDamage("Ira di Drago"), { index: 155 });
export const Lacerazione = Object.assign(simpleDamage("Lacerazione"), { index: 156 });
export const Lanciafiamme = Object.assign(toggleSecondaryStatus("Lanciafiamme", "-{power}, 50% Brucia l'avversario", "brn", "dmg_brn"), { index: 157 });
export const Leccata = Object.assign(toggleSecondaryStatus("Leccata", "-{power}, 50% Paralizza l'avversario", "par_block", "dmg_par"), { index: 158 });
export const Legatutto = Object.assign(bindDamageMove("Legatutto", "-{power}, l'avversario non può essere sostituito x4 turni", 4), { index: 159 });
export const Leggimente = Object.assign(chargeBuffMove("Leggimente"), { index: 160 });
export const Limitazione = Object.assign(simpleDamage("Limitazione"), { index: 161 });
export const Localizza = Object.assign(chargeBuffMove("Localizza"), { index: 162 });
export const Lucelunare = Object.assign(simpleHalfRecovery("Lucelunare"), { index: 163 });
export const Magifuoco = { index: 164, name: "Magifuoco", description: "-{power}, scongela chi lo usa e Scotta l'avversario", before: function(_attacker, _defender, hit) { this.damagingMove = Boolean(hit); }, after: function(attacker, defender, hit) { if (hit) { clearStatusEffect(attacker, "frz"); applyStatusEffect(defender, "brn"); this.logKey = "dmg_brn"; } else { this.logKey = "fail"; } } };
export const Magivelo = {
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
export const Magnitudo = Object.assign(conditionX2Move("Magnitudo", "-{power}, x2 se l'avversario sta usando Fossa", function(a, d) { return d.semiInvulnerable !== null && d.semiInvulnerable === "Fossa"; }), { index: 166 });
export const Malcomune = {
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
export const Maledizione = Object.assign(selfBuffDebuffMove("Maledizione"), { index: 168 });
export const Malosguardo = Object.assign(trapMove("Malosguardo", "L'avversario non può scappare"), { index: 169 });
export const Mangiasogni = {
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
export const Maniereforti = {
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
export const Martellata = Object.assign(simpleDamage("Martellata"), { index: 172 });
export const Mattindoro = Object.assign(weatherRecoveryMove("Mattindoro", "Recupera 1/2 PS max, 1/4 con meteo avverso, tutti con sole"), { index: 173 });
export const Meditazione = Object.assign(simpleSelfAttackBuff("Meditazione"), { index: 174 });
export const Megacalcio = Object.assign(simpleDamage("Megacalcio"), { index: 175 });
export const Megacorno = Object.assign(targetTypeDoubleDamageMove("Megacorno", "Psico"), { index: 176 });
export const Megapugno = Object.assign(simpleDamage("Megapugno"), { index: 177 });
export const Megassorbimento = Object.assign(damageRecoveryMove("Megassorbimento", "-{power}, PS +1/4 del danno inflitto", 1/4), { index: 178 });
export const Meloderba = Object.assign(simpleSleepMove("Meloderba"), { index: 179 });
export const Memento = Object.assign(simpleEnemyAtkDefNerf("Memento"), { index: 180 });
export const Meteorpugno = Object.assign(createToggleDamageMove("Meteorpugno", "-{power}, 50% +{stats} Attacco", function(attacker) { attacker.buffSelfAtk(this.stats); this.logKey = "buff_self_atk"; }), { index: 181 });
export const Metronomo = {
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
export const Millebave = Object.assign(simpleEnemyAttackNerf("Millebave"), { index: 183 });
export const Mimica = {
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
export const Minimizzato = Object.assign(simpleSelfDefenseBuff("Minimizzato"), { index: 185 });
export const Missilspillo = Object.assign(repeatLastTurnDamageMove("Missilspillo"), { index: 186 });
export const Morso = Object.assign(simpleDamage("Morso"), { index: 187 });
export const MovimentoSismico = {
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
export const Mulinello = Object.assign(bindDamageMove("Mulinello", "-{power}, l'avversario non può essere sostituito x4 turni", 4), { index: 189 });
export const MurodiFumo = Object.assign(simpleEnemyAttackNerf("Muro di Fumo"), { index: 190 });
export const Naturforza = Object.assign(conditionX2Move("Naturforza", "-{power}, x2 se è attiva una mossa meteorologica", function(a) { return a.team.battleManager && a.team.battleManager.weather !== null; }), { index: 191 });
export const Nebbia = {
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
export const Nube = {
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
export const Obbliderio = Object.assign(futureSightMove("Obbliderio"), { index: 194 });
export const Octazooka = Object.assign(createToggleDamageMove("Octazooka", "-{power}, 50% -{stats} Attacco avversario", function(_attacker, defender) { if (defender.team.teamMistCounter === 0) { defender.nerfSelfAtk(this.stats); this.logKey = "nerf_enem_atk"; } }), { index: 195 });
export const Oltraggio = Object.assign(forcedTripleHitConfusionMove("Oltraggio"), { index: 196 });
export const OmbraNotturna = {
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
export const Ondacalda = Object.assign(simpleDamage("Ondacalda"), { index: 198 });
export const Ondashock = Object.assign(simpleDamage("Ondashock"), { index: 199 });
export const Ossoclava = {
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
export const Ossomerang = Object.assign(simpleDamage("Ossomerang"), { index: 201 });
export const Ossoraffica = Object.assign(simpleDamage("Ossoraffica"), { index: 202 });
export const PallaClima = Object.assign(conditionX2Move("Palla Clima", "-{power}, x2 se è attivo un cambiamento climatico", function(attacker) { return Boolean(attacker.team.battleManager && attacker.team.battleManager.weather); }), { index: 203 });
export const PallaGelo = Object.assign(simpleDamage("Palla Gelo"), { index: 204 });
export const PallaOmbra = Object.assign(createToggleDamageMove("Palla Ombra", "-{power}, 50% -{stats} Difesa avversaria", function(_attacker, defender) { if (defender.team.teamMistCounter === 0) { defender.nerfSelfDef(this.stats); this.logKey = "nerf_enem_def"; } }), { index: 205 });
export const Panciamburo = Object.assign(selfBuffDebuffMove("Panciamburo"), { index: 206 });
export const Paralizzante = Object.assign(simpleParalysisMove("Paralizzante"), { index: 207 });
export const Parassiseme = {
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
export const Pazienza = Object.assign(twoTurnDefenseDamageMove("Pazienza"), { index: 209 });
export const Perforbecco = Object.assign(simpleDamage("Perforbecco"), { index: 210 });
export const Perforcorno = Object.assign(ohkoMove("Perforcorno"), { index: 211 });
export const Pestone = Object.assign(simpleDamage("Pestone"), { index: 212 });
export const Petalodanza = Object.assign(forcedTripleHitConfusionMove("Petalodanza"), { index: 213 });
export const Picchiaduro = Object.assign(conditionX2Move("Picchiaduro", "-{power}, x2 se un compagno è appena andato KO", function(a) { if (a.team.teamKOTracker) { a.team.teamKOTracker = false; return true; } return false; }), { index: 214 });
export const Pigro = Object.assign(simpleHalfRecovery("Pigro"), { index: 215 });
export const Pioggiadanza = {
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
export const Pistolacqua = Object.assign(simpleDamage("Pistolacqua"), { index: 217 });
export const Polneve = Object.assign(simpleDamage("Polneve"), { index: 218 });
export const Presa = Object.assign(simpleDamage("Presa"), { index: 219 });
export const Preveggenza = Object.assign(preventDefRaiseMove("Preveggenza"), { index: 220 });
export const Privazione = {
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
export const Profumino = Object.assign(simpleEnemyDefenseNerf("Profumino"), { index: 222 });
export const Protezione = Object.assign(blockStatBoostMove("Protezione", "50% protegge la squadra dai moltiplicatori delle mosse avversarie x5 turni", 5), { index: 223 });
export const Provocazione = Object.assign(disableLastMoveMove("Provocazione"), { index: 224 });
export const Psicamisu = {
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
export const Psichico = Object.assign(createToggleDamageMove("Psichico", "-{power}, 50% -{stats} Difesa avversaria", function(_attacker, defender) { if (defender.team.teamMistCounter === 0) { defender.nerfSelfDef(this.stats); this.logKey = "nerf_enem_def"; } }), { index: 226 });
export const Psiconda = {
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
export const Psicoraggio = Object.assign(targetTypeDoubleDamageMove("Psicoraggio", "Veleno"), { index: 228 });
export const Psicoslancio = Object.assign(simpleDamage("Psicoslancio"), { index: 229 });
export const Pugnodombra = Object.assign(simpleDamage("Pugnodombra"), { index: 230 });
export const Pugnorapido = Object.assign(simpleDamage("Pugnorapido"), { index: 231 });
export const Pugnospine = Object.assign(simpleDamage("Pugnospine"), { index: 232 });
export const Punte = {
        index: 233,
        name: "Punte",
        damagingMove: false,
        description: "Infligge danni pari al livello al Pokemon avversario che entra in campo",
        after: function (attacker, _defender, hit) {
          if (hit) {
            var opponent = (attacker.team === attacker.team.battleManager.playerTeam) ? attacker.team.battleManager.enemyTeam : attacker.team.battleManager.playerTeam;
            opponent.punteActive = true;
            opponent.punteLevel = attacker.level;
            this.logKey = "punte_set";
          } else {
            this.logKey = "fail";
          }
        }
      };
export const Purogelo = Object.assign(ohkoMove("Purogelo"), { index: 234 });
export const Radicamento = { index: 235, name: "Radicamento", damagingMove: false, description: "Recupera 1/2 PS max dopo ogni mossa, non puo essere ritirato", after: function(attacker) { attacker.rooted = true; this.logKey = "root"; } };
export const Raffica = Object.assign(conditionX2Move("Raffica", "-{power}, x2 se l'avversario sta usando Volo", function(_a, d) { return d.semiInvulnerable === "Volo"; }), { index: 236 });
export const Rafforzatore = Object.assign(simpleSelfDefenseBuff("Rafforzatore"), { index: 237 });
export const Raggiaurora = Object.assign(createToggleDamageMove("Raggiaurora", "-{power}, 50% -{stats} Attacco avversario", function(_attacker, defender) { if (defender.team.teamMistCounter === 0) { defender.nerfSelfAtk(this.stats); this.logKey = "nerf_enem_atk"; } }), { index: 238 });
export const Raggiro = {
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
export const Ragnatela = Object.assign(trapMove("Ragnatela", "L'avversario non può scappare"), { index: 240 });
export const Rancore = {
        index: 241,
        name: "Rancore",
        damagingMove: false,
        description: "Se chi la usa viene mandato KO da una mossa avversaria, la blocca",
        after: function (attacker) {
          attacker.grudgeActive = true;
          this.logKey = "grudge";
        }
      };
export const Rapigiro = {
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
            if (attacker && attacker.team && attacker.team.punteActive) {
              attacker.team.punteActive = false;
              attacker.team.punteLevel = 0;
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
export const Regalino = {
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
export const Resistenza = { index: 244, name: "Resistenza", damagingMove: false, description: "Resiste al turno successivo con almeno 1 PS", after: function(attacker) { attacker.endure = true; this.logKey = "endure"; } };
export const Ricciolscudo = {
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
export const Riciclo = {
        index: 246,
        name: "Riciclo",
        damagingMove: false,
        description: "Ricrea lo strumento assegnato a inizio battaglia",
        after: function (attacker) {
          var manager = attacker.team && attacker.team.battleManager;
          this.logKey = manager && manager.recycleHeldItem(attacker) ? "recycle_item" : "fail";
        }
      };
export const Riduttore = Object.assign(recoilDamageMove("Riduttore"), { index: 247 });
export const Riflesso = Object.assign(simpleTeamDefenseBuff("Riflesso"), { index: 248 });
export const Rimbalzo = Object.assign(semiInvulnerableDamageMove("Rimbalzo", "1° turno diventa non bersagliabile, 2° turno -{power} e Paralizza", "invul_fly", function (_attacker, defender) {
        if (applyStatusEffect(defender, "par_block")) {
          this.logKey = "dmg_par";
        }
      }), { index: 249 });
export const Rimonta = {
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
export const Rinfrescata = { index: 251, name: "Rinfrescata", damagingMove: false, description: "Risolve tutti i problemi di stato di chi lo usa", after: function(attacker) { if (attacker.status || attacker.sleepCounter || attacker.confCounter || attacker.pendingDelayedStatus) { attacker.status = null; attacker.sleepCounter = 0; attacker.sleepDuration = 3; attacker.confCounter = 0; attacker.pendingDelayedStatus = null; this.logKey = "cure_status"; } else { this.logKey = "fail"; } } };
export const Rintoccasana = Object.assign(teamStatusCureMove("Rintoccasana", "Risolve tutti i problemi di stato della squadra"), { index: 252 });
export const Ripeti = {
        index: 253,
        name: "Ripeti",
        damagingMove: false,
        description: "L'avversario ripete l'ultima mossa usata x3 turni",
        after: function (_attacker, defender, hit) {
          var lastMove = defender.turnBeforeMoveUsed;
          var forcedMove;
          var forcedMoveAfter;
          if (hit && lastMove !== null && lastMove.name !== "Scontro" && !defender.pendingMove) {
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
export const Riposo = {
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
export const Ripresa = Object.assign(simpleHalfRecovery("Ripresa"), { index: 255 });
export const Ritirata = Object.assign(simpleSelfDefenseBuff("Ritirata"), { index: 256 });
export const Ritorno = Object.assign(simpleDamage("Ritorno"), { index: 257 });
export const Rocciotomba = Object.assign(createToggleDamageMove("Rocciotomba", "-{power}, 50% +{stats} Difesa", function(attacker) { attacker.buffSelfDef(this.stats); this.logKey = "buff_self_def"; }), { index: 258 });
export const Rotolamento = Object.assign(conditionX2Move("Rotolamento", "-{power}, x2 se chi lo usa ha attivo Ricciolscudo", function(a) { return a.defenseCurlUsed; }), { index: 259 });
export const Ruggito = Object.assign(simpleEnemyAttackNerf("Ruggito"), { index: 260 });
export const Ruotafuoco = { index: 261, name: "Ruotafuoco", description: "-{power}, scongela chi lo usa", before: function(_attacker, _defender, hit) { this.damagingMove = Boolean(hit); }, after: function(attacker, _defender, hit) { if (hit) { clearStatusEffect(attacker, "frz"); this.logKey = "dmg"; } else { this.logKey = "fail"; } } };
export const Russare = { index: 262, name: "Russare", description: "-{power}, utilizzabile solo mentre si dorme", before: function(attacker, _defender, hit) { if (attacker.status !== "slp") { this.damagingMove = false; return; } this.damagingMove = Boolean(hit); }, after: function(_attacker, _defender, hit) { this.logKey = this.damagingMove && hit ? "dmg" : "fail"; } };
export const Sabbiotomba = Object.assign(bindDamageMove("Sabbiotomba", "-{power}, l'avversario non può essere sostituito x4 turni", 4), { index: 263 });
export const Salvaguardia = {
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
export const Sanguisuga = Object.assign(damageRecoveryMove("Sanguisuga", "-{power}, PS +1/4 del danno inflitto", 1/4), { index: 265 });
export const Sassata = Object.assign(targetTypeDoubleDamageMove("Sassata", "Ghiaccio"), { index: 266 });
export const Sbadiglio = {
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
              this.logKey = "status_baraonda";
            } else {
              defender.pendingDelayedStatus = {
                status: "slp",
                sleepDuration: 3,
                confCounter: 0,
                delay: 3,
                source: "Sbadiglio"
              };
              this.logKey = "sleep_delayed";
            }
          } else {
            this.logKey = "fail";
          }
        }
      };
export const Sberletese = Object.assign(simpleDamage("Sberletese"), { index: 268 });
export const Schermoluce = Object.assign(simpleTeamDefenseBuff("Schermoluce"), { index: 269 });
export const Schianto = Object.assign(simpleDamage("Schianto"), { index: 270 });
export const Schizzo = {
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
export const Scintilla = Object.assign(toggleSecondaryStatus("Scintilla", "-{power}, 50% Paralizza l'avversario", "par_block", "dmg_par"), { index: 272 });
export const Scippo = {
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
export const Scontro = Object.assign(recoilDamageMove("Scontro"), { index: 274 });
export const ScudoAcido = Object.assign(simpleSelfDefenseBuff("Scudo Acido"), { index: 275 });
export const Sdoppiatore = Object.assign(recoilDamageMove("Sdoppiatore"), { index: 276 });
export const Segnoraggio = Object.assign(toggleSecondaryStatus("Segnoraggio", "-{power}, 50% Confonde l'avversario", "cnf_block", "dmg_cnf"), { index: 277 });
export const Segugio = Object.assign(preventDefRaiseMove("Segugio"), { index: 278 });
export const Semitraglia = Object.assign(simpleDamage("Semitraglia"), { index: 279 });
export const Sfoghenergia = {
        index: 280,
        name: "Sfoghenergia",
        description: "-{power}, x2 se Accumulo è stato usato in precedenza",
        before: function (attacker, _defender, hit) {
          this.damagingMove = Boolean(hit);
          if (hit && attacker.accumuloUsed) {
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
export const Sfuriate = Object.assign(simpleDamage("Sfuriate"), { index: 281 });
export const Sgomento = Object.assign(simpleDamage("Sgomento"), { index: 282 });
export const Sgranocchio = Object.assign(createToggleDamageMove("Sgranocchio", "-{power}, 50% -{stats} Difesa avversaria", function(_attacker, defender) { if (defender.team.teamMistCounter === 0) { defender.nerfSelfDef(this.stats); this.logKey = "nerf_enem_def"; } }), { index: 283 });
export const SguardoFeroce = Object.assign(simpleParalysisMove("Sguardo Feroce"), { index: 284 });
export const Sintesi = Object.assign(weatherRecoveryMove("Sintesi", "Recupera 1/2 PS max, 1/4 con meteo avverso, tutti con sole"), { index: 285 });
export const Smog = Object.assign(toggleSecondaryStatus("Smog", "-{power}, 50% Avvelena l'avversario", "psn", "dmg_psn"), { index: 286 });
export const Solarraggio = {
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
export const Solletico = Object.assign(simpleEnemyAtkDefNerf("Solletico"), { index: 288 });
export const Sonicboom = Object.assign(simpleDamage("Sonicboom"), { index: 289 });
export const Sonnifero = Object.assign(simpleSleepMove("Sonnifero"), { index: 290 });
export const Sonnolalia = {
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
            return moveIndex && Number(moveIndex) !== Sonnolalia.index && !isNotCopyableMoveIndex(moveIndex);
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
export const Sostituto = {
        index: 292,
        name: "Sostituto",
        damagingMove: false,
        description: "Resiste al turno successivo con almeno 1 PS",
        after: function (attacker) {
          attacker.endure = true;
          this.logKey = "endure";
        }
      };
export const Sottocarica = Object.assign(chargeBuffMove("Sottocarica"), { index: 293 });
export const Sub = Object.assign(semiInvulnerableDamageMove("Sub", "1° turno diventa non bersagliabile, 2° turno -{power}", "invul_sub"), { index: 294 });
export const Sottomissione = Object.assign(recoilDamageMove("Sottomissione"), { index: 295 });
export const Spaccaroccia = Object.assign(targetTypeDoubleDamageMove("Spaccaroccia", "Roccia"), { index: 296 });
export const Sparalance = Object.assign(repeatLastTurnDamageMove("Sparalance"), { index: 297 });
export const Specchiovelo = Object.assign(counterMove("Specchiovelo", "Danno base pari al doppio del danno subito nel turno precedente"), { index: 298 });
export const Speculmossa = {
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
export const Splash = {
        index: 300,
        name: "Splash",
        damagingMove: false,
        description: "*Parte la sigla di Paperissima*",
        after: function () {
          this.logKey = "smp_move";
        }
      };
export const Spora = Object.assign(simpleSleepMove("Spora"), { index: 301 });
export const Staffetta = {
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
export const Stordipugno = Object.assign(toggleSecondaryStatus("Stordipugno", "-{power}, 50% Confonde l'avversario", "cnf_block", "dmg_cnf"), { index: 303 });
export const Stordiraggio = Object.assign(simpleConfusionMove("Stordiraggio"), { index: 304 });
export const Stramontante = Object.assign(conditionX2Move("Stramontante", "-{power}, x2 se l'avversario sta usando Volo", function(_a, d) { return d.semiInvulnerable === "Volo"; }), { index: 305 });
export const Strampadanza = Object.assign(simpleConfusionMove("Strampadanza"), { index: 306 });
export const Stridio = Object.assign(simpleEnemyDefenseNerf("Stridio"), { index: 307 });
export const Supersuono = Object.assign(simpleConfusionMove("Supersuono"), { index: 308 });
export const Superzanna = {
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
export const Supplica = Object.assign(createToggleDamageMove("Supplica", "-{power}, 50% se chi la usa non ha uno strumento, ruba quello dell'avversario", function(attacker, defender) {
    var manager = attacker.team && attacker.team.battleManager;
    this.logKey = manager && manager.stealHeldItem(attacker, defender) ? "steal_item" : "dmg_los_perc";
  }), { index: 310 });
export const Surf = Object.assign(targetTypeDoubleDamageMove("Surf", "Terra"), { index: 311 });
export const Taglio = Object.assign(targetTypeDoubleDamageMove("Taglio", "Erba"), { index: 312 });
export const Tagliofuria = Object.assign(repeatLastTurnDamageMove("Tagliofuria"), { index: 313 });
export const Teletrasporto = {
        index: 314,
        name: "Teletrasporto",
        damagingMove: false,
        description: "Fugge dal Pokémon selvatico",
        logKey: "fail",
        after: function () {
          this.requestsBattleFlee = true;
        }
      };
export const Tenaglia = Object.assign(bindDamageMove("Tenaglia", "-{power}, l'avversario non può essere sostituito x4 turni", 4), { index: 315 });
export const Terremoto = Object.assign(targetTypeDoubleDamageMove("Terremoto", "Fuoco"), { index: 316 });
export const Terrempesta = {
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
export const Tornado = Object.assign(conditionX2Move("Tornado", "-{power}, x2 se l'avversario sta usando Volo", function(_a, d) { return d.semiInvulnerable === "Volo"; }), { index: 318 });
export const Tossina = {
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
export const Trasformazione = {
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
export const Tripletta = Object.assign(simpleDamage("Tripletta"), { index: 321 });
export const Triplocalcio = Object.assign(simpleDamage("Triplocalcio"), { index: 322 });
export const Tritartigli = Object.assign(createToggleDamageMove("Tritartigli", "-{power}, 50% +{stats} Attacco", function(attacker) { attacker.buffSelfAtk(this.stats); this.logKey = "buff_self_atk"; }), { index: 323 });
export const Troppoforte = Object.assign(buffLossMove("Troppoforte", "-{power}, x2 se chi la usa ha l'attacco alzato ma lo perde"), { index: 324 });
export const Tuono = {
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
export const Tuononda = Object.assign(simpleParalysisMove("Tuononda"), { index: 326 });
export const Tuonopugno = Object.assign(targetTypeDoubleDamageMove("Tuonopugno", "Acqua"), { index: 327 });
export const Tuonoshock = Object.assign(simpleDamage("Tuonoshock"), { index: 328 });
export const Turbine = {
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
export const Turbofuoco = Object.assign(bindDamageMove("Turbofuoco", "-{power}, l'avversario non può essere sostituito x4 turni", 4), { index: 330 });
export const Turbosabbia = Object.assign(simpleEnemyAttackNerf("Turbosabbia"), { index: 331 });
export const Ultimocanto = {
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
export const Uovobomba = Object.assign(simpleDamage("Uovobomba"), { index: 333 });
export const Vampata = Object.assign(buffLossMove("Vampata", "-{power}, x2 se chi la usa ha l'attacco alzato ma lo perde"), { index: 334 });
export const Velenocoda = Object.assign(simpleDamage("Velenocoda"), { index: 335 });
export const Velenodenti = Object.assign(toggleSecondaryStatus("Velenodenti", "-{power}, 50% Avvelena l'avversario", "psn", "dmg_psn"), { index: 336 });
export const Velenogas = {
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
export const Velenospina = Object.assign(simpleDamage("Velenospina"), { index: 338 });
export const Velenpolvere = {
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
export const Vendetta = Object.assign(conditionX2Move("Vendetta", "-{power}, x2 se chi la usa non ha tutti i PS", function(a) { return a.hp < a.pokemon.maxHp; }), { index: 340 });
export const Ventagliente = {
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
export const Ventargenteo = Object.assign(createToggleDamageMove("Ventargenteo", "-{power}, 50% +{stats} Attacco e Difesa", function(attacker) { attacker.buffSelfAtk(this.stats); attacker.buffSelfDef(this.stats); this.logKey = "buff_self_atk_def"; }), { index: 342 });
export const Ventogelato = Object.assign(createToggleDamageMove("Ventogelato", "-{power}, 50% -{stats} Attacco avversario", function(_attacker, defender) { if (defender.team.teamMistCounter === 0) { defender.nerfSelfAtk(this.stats); this.logKey = "nerf_enem_atk"; } }), { index: 343 });
export const Visotruce = Object.assign(simpleEnemyAttackNerf("Visotruce"), { index: 344 });
export const Vitaltiro = Object.assign(simpleDamage("Vitaltiro"), { index: 345 });
export const Volo = Object.assign(semiInvulnerableDamageMove("Volo", "1° turno diventa non bersagliabile, 2° turno -{power}", "invul_fly"), { index: 346 });
export const Zampillo = Object.assign(conditionX2Move("Zampillo", "-{power}, x2 se chi la usa ha più di metà PS", function(a) { return a.hp > a.pokemon.maxHp / 2; }), { index: 347 });
export const Locomovolt = Object.assign(recoilDamageMove("Locomovolt"), { index: 348 });
export const Idrocannone = Object.assign(rechargeDamageMove("Idrocannone"), { index: 349 });
export const Incendio = Object.assign(rechargeDamageMove("Incendio"), { index: 350 });
export const Radicalbero = Object.assign(rechargeDamageMove("Radicalbero"), { index: 351 });
export const MOVE_LIBRARY = buildMoveLibrary([
  Abbagliante,
  Abisso,
  Accumulo,
  Acido,
  Adulazione,
  Aerasoio,
  Aeroassalto,
  Aeroattacco,
  Aerocolpo,
  Affilatore,
  Agilita,
  Alacciaio,
  Altruismo,
  Amnesia,
  Aromaterapia,
  Assistente,
  Assorbimento,
  Attaccalite,
  AttaccodAla,
  AttaccoPioggia,
  AttaccoRapido,
  Attrazione,
  Autodistruzione,
  Avvolgibotta,
  Azione,
  Baraonda,
  Barriera,
  Beccata,
  Blocco,
  Boato,
  Bolla,
  Bollaraggio,
  Bora,
  Botta,
  Bottintesta,
  Braciere,
  Breccia,
  Bruciapelo,
  Bullo,
  Buonlatte,
  Cadutamassi,
  Calciardente,
  Calcinvolo,
  Calciorullo,
  Calciosalto,
  Calmamente,
  Camuffamento,
  Canto,
  Capocciata,
  Cascata,
  Centripugno,
  Cinesi,
  Codacciaio,
  Codadiluce,
  Colpo,
  ColpoBasso,
  Colpocoda,
  Colpodifango,
  Colpokarate,
  Cometapugno,
  Comete,
  Confusione,
  Contrattacco,
  Contropiede,
  Conversione,
  Conversione2,
  Corposcontro,
  Cosmoforza,
  Cottonspora,
  Covauova,
  Crescita,
  Danzadipiume,
  Danzaspada,
  Demonbacio,
  Desiderio,
  Destinobbligato,
  Dinamipugno,
  Dispetto,
  Divinazione,
  Docciascudo,
  Dolcebacio,
  Doppiasberla,
  DoppioAgo,
  Doppiocalcio,
  Doppioteam,
  Dragartigli,
  Dragodanza,
  Dragospiro,
  Eruzione,
  Esclusiva,
  Esplosione,
  Extrarapido,
  Extrasenso,
  Facciata,
  Falcecannone,
  Falselacrime,
  Falsofinale,
  Fangata,
  Fanghiglia,
  Fango,
  Fangobomba,
  Fangosberla,
  Fascino,
  Fendifoglia,
  Ferrartigli,
  Ferroscudo,
  Ferrostrido,
  Finta,
  Flagello,
  Flash,
  Focalenergia,
  Fogliamagica,
  Foglielama,
  Forza,
  Forzantica,
  Forzasegreta,
  Foschisfera,
  Fossa,
  Frana,
  Frustata,
  Frustrazione,
  Fulmine,
  Fulmisguardo,
  Fuocobomba,
  Fuocofatuo,
  Fuocopugno,
  Furia,
  Furto,
  Gelolancia,
  Gelopugno,
  Geloraggio,
  Ghigliottina,
  Gigassorbimento,
  Giornodisole,
  Giornopaga,
  Graffio,
  Grandine,
  Granfisico,
  Granvoce,
  Gridodilotta,
  Idropompa,
  Idropulsar,
  Incornata,
  Incrocolpo,
  Incubo,
  Individua,
  Inibitore,
  Inseguimento,
  Introenergia,
  Introforza,
  IperRaggio,
  Iperzanna,
  Ipnosi,
  Idrocannone,
  Incendio,
  Ira,
  IradiDrago,
  Lacerazione,
  Lanciafiamme,
  Leccata,
  Legatutto,
  Leggimente,
  Limitazione,
  Localizza,
  Locomovolt,
  Lucelunare,
  Magifuoco,
  Magivelo,
  Magnitudo,
  Malcomune,
  Maledizione,
  Malosguardo,
  Mangiasogni,
  Maniereforti,
  Martellata,
  Mattindoro,
  Meditazione,
  Megacalcio,
  Megacorno,
  Megapugno,
  Megassorbimento,
  Meloderba,
  Memento,
  Meteorpugno,
  Metronomo,
  Millebave,
  Mimica,
  Minimizzato,
  Missilspillo,
  Morso,
  MovimentoSismico,
  Mulinello,
  MurodiFumo,
  Naturforza,
  Nebbia,
  Nube,
  Obbliderio,
  Octazooka,
  Oltraggio,
  OmbraNotturna,
  Ondacalda,
  Ondashock,
  Ossoclava,
  Ossomerang,
  Ossoraffica,
  PallaClima,
  PallaGelo,
  PallaOmbra,
  Panciamburo,
  Paralizzante,
  Parassiseme,
  Pazienza,
  Perforbecco,
  Perforcorno,
  Pestone,
  Petalodanza,
  Picchiaduro,
  Pigro,
  Pioggiadanza,
  Pistolacqua,
  Polneve,
  Presa,
  Preveggenza,
  Privazione,
  Profumino,
  Protezione,
  Provocazione,
  Psicamisu,
  Psichico,
  Psiconda,
  Psicoraggio,
  Psicoslancio,
  Pugnodombra,
  Pugnorapido,
  Pugnospine,
  Punte,
  Purogelo,
  Radicamento,
  Radicalbero,
  Raffica,
  Rafforzatore,
  Raggiaurora,
  Raggiro,
  Ragnatela,
  Rancore,
  Rapigiro,
  Regalino,
  Resistenza,
  Ricciolscudo,
  Riciclo,
  Riduttore,
  Riflesso,
  Rimbalzo,
  Rimonta,
  Rinfrescata,
  Rintoccasana,
  Ripeti,
  Riposo,
  Ripresa,
  Ritirata,
  Ritorno,
  Rocciotomba,
  Rotolamento,
  Ruggito,
  Ruotafuoco,
  Russare,
  Sabbiotomba,
  Salvaguardia,
  Sanguisuga,
  Sassata,
  Sbadiglio,
  Sberletese,
  Schermoluce,
  Schianto,
  Schizzo,
  Scintilla,
  Scippo,
  Scontro,
  ScudoAcido,
  Sdoppiatore,
  Segnoraggio,
  Segugio,
  Semitraglia,
  Sfoghenergia,
  Sfuriate,
  Sgomento,
  Sgranocchio,
  SguardoFeroce,
  Sintesi,
  Smog,
  Solarraggio,
  Solletico,
  Sonicboom,
  Sonnifero,
  Sonnolalia,
  Sostituto,
  Sottocarica,
  Sub,
  Sottomissione,
  Spaccaroccia,
  Sparalance,
  Specchiovelo,
  Speculmossa,
  Splash,
  Spora,
  Staffetta,
  Stordipugno,
  Stordiraggio,
  Stramontante,
  Strampadanza,
  Stridio,
  Supersuono,
  Superzanna,
  Supplica,
  Surf,
  Taglio,
  Tagliofuria,
  Teletrasporto,
  Tenaglia,
  Terremoto,
  Terrempesta,
  Tornado,
  Tossina,
  Trasformazione,
  Tripletta,
  Triplocalcio,
  Tritartigli,
  Troppoforte,
  Tuono,
  Tuononda,
  Tuonopugno,
  Tuonoshock,
  Turbine,
  Turbofuoco,
  Turbosabbia,
  Ultimocanto,
  Uovobomba,
  Vampata,
  Velenocoda,
  Velenodenti,
  Velenogas,
  Velenospina,
  Velenpolvere,
  Vendetta,
  Ventagliente,
  Ventargenteo,
  Ventogelato,
  Visotruce,
  Vitaltiro,
  Volo,
  Zampillo
]);

export var MULTI_TURN_MOVE_INDEXES = new Set([
  Capocciata.index,
  Colpo.index,
  Fossa.index,
  IperRaggio.index,
  Idrocannone.index,
  Incendio.index,
  Pazienza.index,
  Rimbalzo.index,
  Radicalbero.index,
  Solarraggio.index,
  Sub.index,
  Ventagliente.index,
  Volo.index
]);

export var MULTITURN_EFFECT_MOVE_INDEXES = new Set([
  Avvolgibotta.index,
  Legatutto.index,
  Mulinello.index,
  Sabbiotomba.index,
  Tenaglia.index,
  Turbofuoco.index,
  Parassiseme.index
]);

export var NOT_COPYABLE_MOVE_INDEXES = new Set([
  Metronomo.index,
  Scontro.index,
  Speculmossa.index,
  Trasformazione.index
]);

export var SEMI_INVULN_ALLOWED = {
  Fossa: { Comete: true, Magnitudo: true, Pugnodombra: true, Terremoto: true },
  Sub: { Comete: true, Pugnodombra: true },
  Volo: { Comete: true, Pugnodombra: true, Raffica: true, Stramontante: true, Tornado: true },
  Rimbalzo: { Comete: true, Pugnodombra: true }
};
