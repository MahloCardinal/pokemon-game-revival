function combatantSummary(combatant, isActive) {
  if (!combatant || !combatant.pokemon) { return null; }
  return {
    speciesKey: String(combatant.pokemon.speciesKey || ""),
    hp: Math.max(0, Number(combatant.hp) || 0),
    maxHp: Math.max(1, Number(combatant.pokemon.maxHp) || 1),
    active: Boolean(isActive), status: combatant.status || null,
    sleepCounter: Number(combatant.sleepCounter) || 0, sleepDuration: Number(combatant.sleepDuration) || 3,
    confusionCounter: Number(combatant.confCounter) || 0,
    pendingStatus: combatant.pendingDelayedStatus ? {
      status: combatant.pendingDelayedStatus.status || null,
      source: combatant.pendingDelayedStatus.source || null,
      delay: Number(combatant.pendingDelayedStatus.delay) || 0
    } : null,
    attackBuff: Math.max(Number(combatant.atkBuff) || 0, Number(combatant.weatherAtkBuff) || 0),
    attackNerf: Number(combatant.atkNerf) || 0,
    defenseBuff: Math.max(Number(combatant.defBuff) || 0, Number(combatant.weatherDefBuff) || 0),
    defenseNerf: Number(combatant.defNerf) || 0,
    charged: Number(combatant.chargeDamageMultiplier) > 1,
    pendingMoveKey: combatant.pendingMove ? String(combatant.pendingMove.key || "") : "",
    pendingMoveForced: Boolean(combatant.pendingMove && combatant.pendingMove.isForcedMove),
    pendingMoveTurns: Number(combatant.pendingMoveTurns) || 0,
    defRaiseBlocked: Boolean(combatant.defRaiseBlocked), endure: Boolean(combatant.endure),
    destinyBond: Boolean(combatant.destinyBondActive), grudge: Boolean(combatant.grudgeActive),
    magicCoat: Boolean(combatant.magicCoatActive), rooted: Boolean(combatant.rooted),
    itemLocked: Boolean(combatant.itemLocked), exclusive: Boolean(combatant.exclusiveActive),
    disabledMoveKeys: combatant.exclusiveActive ? [] : (combatant.disabledMoves || []).slice(),
    trappedTurns: Number(combatant.trappedTurns) || (combatant.trappedMoveIndex ? 99 : 0),
    seeded: Boolean(combatant.seedTarget), seedValue: Number(combatant.seedValue) || 0,
    perishSongTurns: Number(combatant.perishSongTurns) || 0,
    currentTypes: Array.isArray(combatant.type) ? combatant.type.slice() : [],
    originalTypes: Array.isArray(combatant.pokemon.type) ? combatant.pokemon.type.slice() : []
  };
}

function teamEffects(team) {
  return {
    attackBuff: Number(team.teamAtkBuff) || 0, attackBuffTurns: Number(team.buffAtkCounter) || 0,
    defenseBuff: Number(team.teamDefBuff) || 0, defenseBuffTurns: Number(team.buffDefCounter) || 0,
    mistTurns: Number(team.teamMistCounter) || 0,
    moveBoostProtectionTurns: Number(team.teamMoveBoostProtectCounter) || 0,
    statusProtectionTurns: Number(team.teamStatusProtectCounter) || 0,
    boostSuppressionTurns: Number(team.teamBoostSuppressCounter) || 0,
    sleepImmunityTurns: Number(team.sleepImmunityCounter) || 0,
    spikes: Boolean(team.spikesActive), wish: Number(team.wishHealAmount) > 0,
    futureSight: team.futureSight && team.futureSight.active ? {
      moveKey: String(team.futureSight.moveKey || ""), turns: Number(team.futureSight.timer) || 0
    } : null
  };
}

function teamSummary(team, usedItems, actor) {
  var active = team.getActive();
  return {
    kind: "team", actor: actor, name: String(team.name || ""), active: combatantSummary(active, true),
    alive: team.combatantList.filter(function (combatant) { return combatant !== active && !combatant.isFainted(); }).map(function (combatant) { return combatantSummary(combatant, false); }),
    knockedOut: team.combatantList.filter(function (combatant) { return combatant.isFainted(); }).map(function (combatant) { return combatantSummary(combatant, false); }),
    usedItems: Object.assign({}, usedItems || {}), percentagePositive: Boolean(team.percentage), effects: teamEffects(team)
  };
}

export function buildBattleSummary(team1, team2, usedItems, enemyUsedItems, manager) {
  return [
    { kind: "weather", weather: manager && manager.weather || null },
    teamSummary(team1, usedItems, "player"),
    teamSummary(team2, enemyUsedItems, "npc")
  ];
}
