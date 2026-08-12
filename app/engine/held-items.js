import { getItemByIndex, ItemCategory, ItemSubcategory, pokemonCanHoldItem } from "../data/items.js";
import { TYPE_CHART } from "../data/type-chart.js";

function heldItemCacheKey(combatant) {
  var pokemon = combatant && combatant.pokemon;
  var types = pokemon && Array.isArray(pokemon.type) ? pokemon.type.join("/") : "";
  return [
    pokemon ? Number(pokemon.heldItemIndex) || 0 : 0,
    combatant && combatant.itemLocked ? 1 : 0,
    pokemon && pokemon.speciesKey !== undefined && pokemon.speciesKey !== null ? String(pokemon.speciesKey) : "",
    pokemon && pokemon.name !== undefined && pokemon.name !== null ? String(pokemon.name) : "",
    types
  ].join("|");
}

function resolveHeldItems(combatant) {
  var key = heldItemCacheKey(combatant);
  var pokemon = combatant && combatant.pokemon;
  var heldItemIndex = pokemon ? Number(pokemon.heldItemIndex) || 0 : 0;
  var heldItem = heldItemIndex ? getItemByIndex(heldItemIndex) : null;
  var cache;
  if (combatant && combatant._heldItemCache && combatant._heldItemCache.key === key) {
    return combatant._heldItemCache;
  }
  cache = {
    key: key,
    berry: null,
    activeHeldItem: null
  };
  if (!combatant || combatant.itemLocked || !pokemon || !heldItem) {
    if (combatant) {
      combatant._heldItemCache = cache;
    }
    return cache;
  }
  if (heldItem.category === ItemCategory.Berry && pokemonCanHoldItem(pokemon, heldItem)) {
    cache.berry = heldItem;
  }
  if (heldItem.category === ItemCategory.HeldItem && pokemonCanHoldItem(pokemon, heldItem)) {
    cache.activeHeldItem = heldItem;
  }
  combatant._heldItemCache = cache;
  return cache;
}

export function getHeldBerry(combatant) {
  return resolveHeldItems(combatant).berry;
}

export function getActiveHeldItem(combatant) {
  return resolveHeldItems(combatant).activeHeldItem;
}

export function heldItemHasEffect(combatant, effect) {
  var heldItem = getActiveHeldItem(combatant);
  return Boolean(heldItem && heldItem.effect === effect);
}

export function heldItemMultiplierValue(item) {
  var multiplier = Number(item && item.value);
  return Number.isFinite(multiplier) && multiplier > 0 ? multiplier : 1;
}

export function combatantHasCurableStatus(combatant) {
  return Boolean(combatant && (combatant.status || combatant.sleepCounter || combatant.confCounter || combatant.pendingDelayedStatus));
}

export function statusDisplayName(status) {
  if (status === "psn") { return "avvelenamento"; }
  if (status === "brn") { return "scottatura"; }
  if (status === "frz") { return "congelamento"; }
  if (status === "slp") { return "sonno"; }
  if (status === "par_block" || status === "par_free") { return "paralisi"; }
  if (status === "cnf_block" || status === "cnf_free") { return "confusione"; }
  return "Status";
}

export function itemCanCureStatus(item, target) {
  var statuses = item && Array.isArray(item.statuses) ? item.statuses : ["all"];
  if (!combatantHasCurableStatus(target)) {
    return false;
  }
  if (statuses.indexOf("all") !== -1) {
    return true;
  }
  if (statuses.indexOf(target.status) !== -1) {
    return true;
  }
  return Boolean(target.pendingDelayedStatus && statuses.indexOf(target.pendingDelayedStatus.status) !== -1);
}

export function clearCombatantStatus(target, item) {
  var statuses = item && Array.isArray(item.statuses) ? item.statuses : ["all"];
  var clearsAll = statuses.indexOf("all") !== -1;
  if (!target) {
    return false;
  }
  if (!clearsAll && statuses.indexOf(target.status) === -1) {
    if (!target.pendingDelayedStatus || statuses.indexOf(target.pendingDelayedStatus.status) === -1) {
      return false;
    }
  }
  target.status = null;
  target.sleepCounter = 0;
  target.sleepDuration = 3;
  target.confCounter = 0;
  target.slpSource = null;
  target.pendingDelayedStatus = null;
  return true;
}

function consumeHeldBerry(manager, combatant, berry) {
  if (!combatant || !combatant.pokemon || !berry) {
    return false;
  }
  if (Number(combatant.pokemon.heldItemIndex) !== berry.index) {
    return false;
  }
  combatant.lastConsumedHeldItemIndex = berry.index;
  combatant.pokemon.heldItemIndex = 0;
  manager.trackUsedItem(berry, combatant);
  return true;
}

function heldBerryHpRecovery(berry, combatant) {
  var fraction = Number(berry && berry.healFraction);
  var value;
  if (Number.isFinite(fraction) && fraction > 0) {
    return Math.max(1, Math.floor(combatant.pokemon.maxHp * fraction));
  }
  value = Number(berry && berry.value);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}

function isBelowHeldBerryHpThreshold(combatant) {
  return Boolean(
    combatant
    && combatant.pokemon
    && combatant.hp > 0
    && combatant.hp < combatant.pokemon.maxHp / 4
    && combatant.hp < combatant.pokemon.maxHp
  );
}

function heldBerryProtectsFromAttacker(berry, attacker) {
  return Boolean(
    berry
    && berry.subcategory === ItemSubcategory.TypeProtect
    && berry.protectType
    && attacker
    && Array.isArray(attacker.type)
    && attacker.type.indexOf(berry.protectType) !== -1
  );
}

function applyDamageMultiplier(_manager, context) {
  var attacker = context && context.attacker;
  var heldItem = getActiveHeldItem(attacker);
  var multiplier = Number(context && context.multiplier) || 1;
  if (!heldItem) {
    return Object.assign({}, context, { multiplier: multiplier });
  }
  if (heldItem.subcategory === ItemSubcategory.TypeEnhance) {
    if (heldItem.boostType && attacker.type && attacker.type.indexOf(heldItem.boostType) !== -1) {
      multiplier *= heldItemMultiplierValue(heldItem);
    }
    return Object.assign({}, context, { heldItem: heldItem, multiplier: multiplier });
  }
  if (heldItem.subcategory === ItemSubcategory.DamageItem && heldItem.effect === "species_damage_boost") {
    multiplier *= heldItemMultiplierValue(heldItem);
  }
  return Object.assign({}, context, { heldItem: heldItem, multiplier: multiplier });
}

function applyHpCostBaseBoost(_manager, context) {
  var attacker = context && context.attacker;
  var basePower = Number(context && context.basePower) || 0;
  var hpCost = 0;
  if (heldItemHasEffect(attacker, "hp_cost_base_boost") && attacker.hp >= 3) {
    hpCost = Math.floor(attacker.hp / 4);
    if (hpCost > 0) {
      basePower += hpCost;
    }
  }
  return Object.assign({}, context, {
    basePower: basePower,
    hpCost: hpCost
  });
}

function applyStatusDamageHalve(_manager, context) {
  var defender = context && context.defender;
  var damage = Number(context && context.damage) || 0;
  if (heldItemHasEffect(defender, "status_damage_halve") && combatantHasCurableStatus(defender)) {
    damage = Math.max(1, Math.floor(damage / 2));
  }
  return Object.assign({}, context, { damage: damage });
}

function applyConsecutiveMoveBoost(_manager, context) {
  var attacker = context && context.attacker;
  var move = context && context.move;
  var heldItem = getActiveHeldItem(attacker);
  var prevMove = attacker && attacker.turnBeforeMoveUsed;
  var damage = Number(context && context.damage) || 0;
  if (heldItem && heldItem.effect === "consecutive_move_boost" && prevMove && move && prevMove.index === move.index) {
    damage = Math.floor(damage * heldItemMultiplierValue(heldItem));
  }
  return Object.assign({}, context, { damage: damage });
}

function applyTypeDisadvantageBoost(manager, context) {
  var attacker = context && context.attacker;
  var heldItem = getActiveHeldItem(attacker);
  var damage = Number(context && context.damage) || 0;
  var reverseTypeEfficacy = Number(context && context.reverseTypeEfficacy) || 1;
  if (heldItem && heldItem.effect === "type_disadvantage_boost" && reverseTypeEfficacy >= 2.0) {
    damage = Math.floor(damage * heldItemMultiplierValue(heldItem));
  }
  return Object.assign({}, context, { damage: damage });
}

function applyHpCostBaseBoostCost(manager, context) {
  var attacker = context && context.attacker;
  var defender = context && context.defender;
  var hpCost = Number(context && context.hpCost) || 0;
  if (hpCost > 0) {
    attacker.hp = Math.max(0, attacker.hp - hpCost);
    manager.emit({ log: attacker.pokemon.name + " perde " + hpCost + " PS con Assorbisfera" });
    manager.KOCheck(attacker, defender);
    hpCost = 0;
  }
  return Object.assign({}, context, { hpCost: hpCost });
}

function applyDamageDrain(manager, context) {
  var attacker = context && context.attacker;
  var heldItem = getActiveHeldItem(attacker);
  var damage = Number(context && context.damage) || 0;
  var drainHeal;
  if (damage > 0 && heldItem && heldItem.effect === "damage_drain") {
    drainHeal = Math.floor(damage * heldItemMultiplierValue(heldItem));
    if (drainHeal > 0) {
      attacker.hp = Math.min(attacker.pokemon.maxHp, attacker.hp + drainHeal);
      manager.emit({ log: attacker.pokemon.name + " recupera " + drainHeal + " PS con Conchinella" });
    }
  }
  return context;
}

function applyHealStatusBerry(manager, context) {
  var combatant = context && context.combatant;
  var before = context && context.before;
  var berry = getHeldBerry(combatant);
  var curedStatusName;
  if (!berry || berry.subcategory !== ItemSubcategory.HealStatus || !before || before.status !== null) {
    return Object.assign({}, context, { activated: false });
  }
  if (!itemCanCureStatus(berry, combatant)) {
    return Object.assign({}, context, { activated: false });
  }
  curedStatusName = statusDisplayName(combatant.status || (combatant.pendingDelayedStatus && combatant.pendingDelayedStatus.status));
  if (!clearCombatantStatus(combatant, berry)) {
    return Object.assign({}, context, { activated: false });
  }
  if (consumeHeldBerry(manager, combatant, berry)) {
    manager.emit({ log: berry.name + " si attiva: " + combatant.pokemon.name + " guarisce da " + curedStatusName});
    return Object.assign({}, context, { activated: true, berry: berry });
  }
  return Object.assign({}, context, { activated: false });
}

function applyHealHpBerry(manager, context) {
  var combatant = context && context.combatant;
  var berry = getHeldBerry(combatant);
  var recovery;
  var currentHp;
  var nextHp;
  var healed;
  if (!berry || berry.subcategory !== ItemSubcategory.HealHp || !isBelowHeldBerryHpThreshold(combatant)) {
    return Object.assign({}, context, { activated: false });
  }
  recovery = heldBerryHpRecovery(berry, combatant);
  if (recovery <= 0) {
    return Object.assign({}, context, { activated: false });
  }
  currentHp = combatant.hp;
  nextHp = Math.min(combatant.pokemon.maxHp, currentHp + recovery);
  healed = nextHp - currentHp;
  if (healed <= 0) {
    return Object.assign({}, context, { activated: false });
  }
  combatant.hp = nextHp;
  if (consumeHeldBerry(manager, combatant, berry)) {
    manager.emit({ log: berry.name + " si attiva: " + combatant.pokemon.name + " recupera " + healed + " PS" });
    return Object.assign({}, context, { activated: true, berry: berry, healed: healed });
  }
  return Object.assign({}, context, { activated: false });
}

function applyTypeProtectBerry(manager, context) {
  var attacker = context && context.attacker;
  var defender = context && context.defender;
  var berry = getHeldBerry(defender);
  var log = "";
  if (!heldBerryProtectsFromAttacker(berry, attacker)) {
    return Object.assign({}, context, { activated: false, log: log });
  }
  if (!consumeHeldBerry(manager, defender, berry)) {
    return Object.assign({}, context, { activated: false, log: log });
  }
  log = berry.name + " si attiva: protegge " + defender.pokemon.name + " dal tipo " + berry.protectType + " e dimezza il danno";
  return Object.assign({}, context, { activated: true, berry: berry, log: log });
}

function applyStatusRetaliateSetup(_manager, context) {
  var combatant = context && context.combatant;
  if (heldItemHasEffect(combatant, "status_retaliate_damage")) {
    combatant._bitorzolelmoSelfInflicted = false;
  }
  return context;
}

function applyStatusIgnoreDelay(manager, context) {
  var source = context && context.source;
  var target = context && context.target;
  if (heldItemHasEffect(source, "status_ignore_delay")) {
    manager.emit({ log: source.pokemon.name + " ignora Distraroma con Fortunaroma" });
    return Object.assign({}, context, { ignored: true });
  }
  return Object.assign({}, context, { ignored: false });
}

function applyOhkoProtect(manager, context) {
  var defender = context && context.defender;
  var move = context && context.move;
  var defenderHpBefore = Number(context && context.defenderHpBefore) || 0;
  var charges;
  if (!move || !move.isOhkoMove || !defender || defender.hp !== 0 || defenderHpBefore <= 0 || !heldItemHasEffect(defender, "ohko_protect")) {
    return Object.assign({}, context, { activated: false });
  }
  charges = defender._bandanaCharges;
  if (charges === undefined) { charges = 3; }
  if (charges <= 0) {
    return Object.assign({}, context, { activated: false });
  }
  defender.hp = defenderHpBefore;
  defender._bandanaCharges = charges - 1;
  manager.emit({ log: defender.pokemon.name + " resiste all'OHKO con Bandana! (" + (charges - 1) + " cariche rimanenti)" });
  return Object.assign({}, context, { activated: true });
}

function applyStatusRetaliateSelfInflicted(_manager, context) {
  var combatant = context && context.combatant;
  var beforeStatus = context ? context.beforeStatus : null;
  if (combatant && combatant.status !== beforeStatus && heldItemHasEffect(combatant, "status_retaliate_damage")) {
    combatant._bitorzolelmoSelfInflicted = true;
  }
  return context;
}

function applyEntryStatusImmunity(_manager, context) {
  var combatant = context && context.combatant;
  if (heldItemHasEffect(combatant, "entry_status_immunity")) {
    combatant._luminpolvereActive = true;
  }
  return context;
}

function applyEntryStatusProtection(manager, context) {
  var combatant = context && context.combatant;
  var before = context && context.before;
  if (combatant && before && combatant._luminpolvereActive && combatant.status !== null && combatant.status !== before.status) {
    combatant.status = before.status;
    combatant.sleepCounter = before.sleepCounter;
    combatant.confCounter = before.confCounter;
    manager.emit({ log: combatant.pokemon.name + " è protetto da Luminpolvere!" });
  }
  return context;
}

function applyAfterKoStatusProtection(manager, context) {
  var combatant = context && context.combatant;
  var before = context && context.before;
  if (combatant && before && combatant._focalnastroProtect && combatant.status !== null && combatant.status !== before.status) {
    combatant.status = before.status;
    combatant.sleepCounter = before.sleepCounter;
    combatant.confCounter = before.confCounter;
    combatant._focalnastroProtect = false;
    return Object.assign({}, context, { log: "Focalnastro protegge " + combatant.pokemon.name + " dallo status!" });
  }
  return context;
}

function applyAfterKoStatusProtectCharge(manager, context) {
  var attacker = context && context.attacker;
  var defender = context && context.defender;
  var charges;
  if (!attacker || !defender || attacker === defender || !heldItemHasEffect(attacker, "status_protect_after_ko")) {
    return Object.assign({}, context, { activated: false });
  }
  charges = attacker._focalnastroCharges;
  if (charges === undefined) { charges = 3; }
  if (charges <= 0) {
    return Object.assign({}, context, { activated: false });
  }
  attacker._focalnastroProtect = true;
  attacker._focalnastroCharges = charges - 1;
  manager.emit({ log: attacker.pokemon.name + " si prepara a proteggersi con Focalnastro! (" + (charges - 1) + " cariche rimanenti)" });
  return Object.assign({}, context, { activated: true });
}

function applyStatusRetaliateDamage(manager, context) {
  var combatant = context && context.combatant;
  var opponent = context && context.opponent;
  var damage;
  if (heldItemHasEffect(combatant, "status_retaliate_damage")
      && combatant._startOfTurnStatus === null
      && combatant.status !== null
      && !combatant._bitorzolelmoSelfInflicted) {
    damage = 2 * combatant.level;
    opponent.hp = Math.max(0, opponent.hp - damage);
    manager.emit({ log: opponent.pokemon.name + " subisce " + damage + " danni da Bitorzolelmo di " + combatant.pokemon.name + "!" });
    manager.KOCheck(combatant, opponent);
    return Object.assign({}, context, { activated: true, damage: damage });
  }
  return Object.assign({}, context, { activated: false });
}

function clearDefenderStatusProtectionFlags(_manager, context) {
  var defender = context && context.defender;
  if (defender && defender._luminpolvereActive) {
    defender._luminpolvereActive = false;
  }
  if (defender && defender._focalnastroProtect) {
    defender._focalnastroProtect = false;
  }
  return context;
}

function applySwitchHazard(_manager, context) {
  var combatant = context && context.combatant;
  var hazardTeam = combatant && combatant.team;
  var message = context && context.message ? String(context.message) : "";
  var hazardDamage;
  if (!combatant || !hazardTeam || !hazardTeam.punteActive) {
    return Object.assign({}, context, { message: message });
  }
  hazardDamage = hazardTeam.punteLevel;
  if (heldItemHasEffect(combatant, "hazard_multiturn_guard")) {
    hazardTeam.punteActive = false;
    hazardTeam.punteLevel = 0;
    message += ", Scarponi robusti libera il terreno di " + combatant.pokemon.name + " dalle Punte";
    return Object.assign({}, context, { message: message, protected: true });
  }
  combatant.hp = Math.max(0, combatant.hp - hazardDamage);
  message += ", Punte infligge " + hazardDamage + " danni a " + combatant.pokemon.name;
  if (combatant.isFainted()) {
    message += ". " + combatant.pokemon.name + " va KO!";
  }
  return Object.assign({}, context, { message: message, damage: hazardDamage });
}

function applyEntryChoiceKind(_manager, context) {
  var combatant = context && context.combatant;
  var heldItem = getActiveHeldItem(combatant);
  var kind = "";
  if (!heldItem || combatant.entryHeldItemResolved) {
    return Object.assign({}, context, { heldItem: heldItem, kind: kind });
  }
  if (heldItem.effect === "entry_disable_move") {
    kind = "move";
  } else if (heldItem.effect === "entry_add_type") {
    kind = "type";
  }
  return Object.assign({}, context, { heldItem: heldItem, kind: kind });
}

function applyEntryChoiceEntries(manager, context) {
  var combatant = context && context.combatant;
  var kind = context && context.kind ? context.kind : "";
  var opponent;
  var excludedTypes;
  var entries = [];
  if (kind === "move") {
    opponent = combatant && combatant.team === manager.playerTeam ? manager.enemyTeam.getActive() : manager.playerTeam.getActive();
    entries = opponent && opponent.pokemon && Array.isArray(opponent.pokemon.moves)
      ? opponent.pokemon.moves.map(function (move, index) {
        return { name: move.name, index: index };
      })
      : [];
  } else if (kind === "type") {
    excludedTypes = (getActiveHeldItem(combatant) || {}).excludedChoiceTypes || [];
    entries = Object.keys(TYPE_CHART).filter(function (typeName) {
      return excludedTypes.indexOf(typeName) === -1;
    }).map(function (typeName, index) {
      return { name: typeName, index: index, typeName: typeName };
    });
  }
  return Object.assign({}, context, { entries: entries });
}

function applyEntryChoice(manager, context) {
  var combatant = context && context.combatant;
  var choice = context && context.choice;
  var kindResult = runHeldItemTrigger(manager, "entryChoiceKind", HeldItemTriggerContext.entryChoiceKind(combatant));
  var heldItem = kindResult.heldItem;
  var kind = kindResult.kind;
  var entries = runHeldItemTrigger(manager, "entryChoiceEntries", HeldItemTriggerContext.entryChoiceEntries(combatant, kind)).entries;
  var selectedIndex = Number(choice && choice.index);
  var selectedEntry = Number.isFinite(selectedIndex) ? entries.find(function (entry) {
    return Number(entry.index) === selectedIndex;
  }) : null;
  var opponent;
  if (!heldItem || !kind || !selectedEntry) {
    return Object.assign({}, context, { applied: false });
  }
  combatant.entryHeldItemResolved = true;
  if (kind === "move") {
    opponent = combatant.team === manager.playerTeam ? manager.enemyTeam.getActive() : manager.playerTeam.getActive();
    if (!opponent || !selectedEntry.name) {
      return Object.assign({}, context, { applied: false });
    }
    opponent.disableMoveInhibit(selectedEntry.name);
    manager.emit({ log: heldItem.name + " blocca " + selectedEntry.name + " di " + opponent.pokemon.name});
    return Object.assign({}, context, { applied: true });
  }
  if (kind === "type") {
    combatant.type = ["Normale", selectedEntry.typeName || selectedEntry.name];
    combatant.entryAddedType = selectedEntry.typeName || selectedEntry.name;
    manager.emit({ log: heldItem.name + " aggiunge il tipo " + combatant.entryAddedType + " a " + combatant.pokemon.name});
    return Object.assign({}, context, { applied: true });
  }
  return Object.assign({}, context, { applied: false });
}

function applyIgnoreStatMods(_manager, context) {
  var combatant = context && context.combatant;
  var result = Object.assign({}, context || {});
  if (!heldItemHasEffect(combatant, "ignore_stat_mods")) {
    return result;
  }
  if (result.attackBuff !== undefined) { result.attackBuff = 0; }
  if (result.attackNerf !== undefined) { result.attackNerf = 0; }
  if (result.defenseBuff !== undefined) { result.defenseBuff = 0; }
  if (result.defNerf !== undefined) { result.defNerf = 0; }
  return result;
}

function applyPercentageMoveAtkBuff(_manager, context) {
  var attacker = context && context.attacker;
  var percentageBefore = context ? context.percentageBefore : undefined;
  if (heldItemHasEffect(attacker, "percentage_move_atk_buff") && attacker.team && attacker.team.percentage !== percentageBefore) {
    attacker.atkBuff = attacker.level;
    return Object.assign({}, context, { activated: true });
  }
  return Object.assign({}, context, { activated: false });
}

function resolvePendingAsFailed(attacker) {
  if (attacker.pendingMove !== null) {
    attacker.semiInvulnerable = null;
    attacker.removePending();
    attacker.pendingMoveTurns = 0;
  }
}

function applyInvertParCnf(manager, context) {
  var attacker = context && context.attacker;
  var status = attacker && attacker.status;
  var damage;
  if (!heldItemHasEffect(attacker, "invert_par_cnf")) {
    return Object.assign({}, context, { handled: false });
  }
  if (status === "par_block" || status === "par_free") {
    if (status === "par_free") {
      resolvePendingAsFailed(attacker);
      manager.emit({ log: attacker.pokemon.name + " è paralizzato, non può attaccare" });
      attacker.status = "par_block";
      return Object.assign({}, context, { handled: true, canMove: false });
    }
    attacker.status = "par_free";
    return Object.assign({}, context, { handled: true, canMove: true });
  }
  if (status === "cnf_block" || status === "cnf_free") {
    if (status === "cnf_free") {
      resolvePendingAsFailed(attacker);
      damage = Math.max(1, Math.floor(attacker.pokemon.maxHp / 16));
      attacker.hp = Math.max(0, attacker.hp - damage);
      manager.emit({ log: attacker.pokemon.name + " è così confuso da colpirsi da solo, e perde " + damage + " PS" });
      attacker.status = "cnf_block";
      manager.KOCheck(attacker, attacker);
      return Object.assign({}, context, { handled: true, canMove: false });
    }
    attacker.status = "cnf_free";
    return Object.assign({}, context, { handled: true, canMove: true });
  }
  return Object.assign({}, context, { handled: false });
}

var HELD_ITEM_TRIGGER_HANDLERS = Object.freeze({
  damageMultiplier: Object.freeze([applyDamageMultiplier]),
  modifyBasePower: Object.freeze([applyHpCostBaseBoost]),
  modifyDamage: Object.freeze([
    applyStatusDamageHalve,
    applyConsecutiveMoveBoost,
    applyTypeDisadvantageBoost
  ]),
  afterDamageApplied: Object.freeze([
    applyHpCostBaseBoostCost,
    applyDamageDrain
  ]),
  healStatusBerry: Object.freeze([applyHealStatusBerry]),
  healHpBerry: Object.freeze([applyHealHpBerry]),
  typeProtectBerry: Object.freeze([applyTypeProtectBerry]),
  startTurn: Object.freeze([applyStatusRetaliateSetup]),
  statusDelay: Object.freeze([applyStatusIgnoreDelay]),
  ohkoProtect: Object.freeze([applyOhkoProtect]),
  selfStatusChanged: Object.freeze([applyStatusRetaliateSelfInflicted]),
  onEntry: Object.freeze([applyEntryStatusImmunity]),
  statusProtection: Object.freeze([
    applyEntryStatusProtection,
    applyAfterKoStatusProtection
  ]),
  afterKo: Object.freeze([applyAfterKoStatusProtectCharge]),
  endTurnStatusEffects: Object.freeze([applyStatusRetaliateDamage]),
  switchHazard: Object.freeze([applySwitchHazard]),
  entryChoiceKind: Object.freeze([applyEntryChoiceKind]),
  entryChoiceEntries: Object.freeze([applyEntryChoiceEntries]),
  entryChoiceApply: Object.freeze([applyEntryChoice]),
  statMods: Object.freeze([applyIgnoreStatMods]),
  afterMoveResolved: Object.freeze([
    applyPercentageMoveAtkBuff,
    clearDefenderStatusProtectionFlags
  ]),
  moveStatusCheck: Object.freeze([applyInvertParCnf])
});

// GdR trigger order used by BattleManager; keep this list aligned with call sites.
export const HELD_ITEM_TRIGGER_ORDER = Object.freeze([
  "startTurn",
  "healHpBerry",
  "onEntry",
  "entryChoiceKind",
  "entryChoiceEntries",
  "entryChoiceApply",
  "statusDelay",
  "modifyBasePower",
  "statMods",
  "damageMultiplier",
  "modifyDamage",
  "ohkoProtect",
  "selfStatusChanged",
  "typeProtectBerry",
  "afterDamageApplied",
  "statusProtection",
  "healStatusBerry",
  "afterMoveResolved",
  "moveStatusCheck",
  "afterKo",
  "endTurnStatusEffects",
  "switchHazard"
]);

export const HeldItemTriggerContext = Object.freeze({
  startTurn: function (combatant) { return { combatant: combatant }; },
  healHpBerry: function (combatant) { return { combatant: combatant, activated: false }; },
  onEntry: function (combatant) { return { combatant: combatant }; },
  entryChoiceKind: function (combatant) { return { combatant: combatant, kind: "" }; },
  entryChoiceEntries: function (combatant, kind) { return { combatant: combatant, kind: kind, entries: [] }; },
  entryChoiceApply: function (combatant, choice) { return { combatant: combatant, choice: choice, applied: false }; },
  statusDelay: function (source, target) { return { source: source, target: target, ignored: false }; },
  modifyBasePower: function (attacker, defender, move, basePower) { return { attacker: attacker, defender: defender, move: move, basePower: basePower }; },
  statMods: function (combatant, values) { return Object.assign({ combatant: combatant }, values || {}); },
  damageMultiplier: function (attacker) { return { attacker: attacker, multiplier: 1 }; },
  modifyDamage: function (attacker, defender, move, damage, reverseTypeEfficacy) { return { attacker: attacker, defender: defender, move: move, damage: damage, reverseTypeEfficacy: reverseTypeEfficacy }; },
  ohkoProtect: function (defender, move, defenderHpBefore) { return { defender: defender, move: move, defenderHpBefore: defenderHpBefore, activated: false }; },
  selfStatusChanged: function (combatant, beforeStatus) { return { combatant: combatant, beforeStatus: beforeStatus }; },
  typeProtectBerry: function (attacker, defender) { return { attacker: attacker, defender: defender, activated: false, log: "" }; },
  afterDamageApplied: function (attacker, defender, move, damage, hpCost) { return { attacker: attacker, defender: defender, move: move, damage: damage, hpCost: hpCost }; },
  statusProtection: function (combatant, before) { return { combatant: combatant, before: before, log: "" }; },
  healStatusBerry: function (combatant, before) { return { combatant: combatant, before: before, activated: false }; },
  afterMoveResolved: function (attacker, defender, percentageBefore) { return { attacker: attacker, defender: defender, percentageBefore: percentageBefore, activated: false }; },
  moveStatusCheck: function (attacker) { return { attacker: attacker, handled: false, canMove: true }; },
  afterKo: function (attacker, defender) { return { attacker: attacker, defender: defender, activated: false }; },
  endTurnStatusEffects: function (combatant, opponent) { return { combatant: combatant, opponent: opponent }; },
  switchHazard: function (combatant, opponentTeam, message) { return { combatant: combatant, opponentTeam: opponentTeam, message: message }; }
});

export function runHeldItemTrigger(manager, trigger, context) {
  var handlers = HELD_ITEM_TRIGGER_HANDLERS[trigger] || [];
  var result = Object.assign({}, context || {});
  handlers.forEach(function (handler) {
    result = handler(manager, result) || result;
  });
  return result;
}
