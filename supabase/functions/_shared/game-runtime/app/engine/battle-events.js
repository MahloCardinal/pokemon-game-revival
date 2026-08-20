function normalizedKey(value) {
  return String(value || "").trim();
}

export function battleEvent(key, params, meta) {
  var event = {
    key: normalizedKey(key),
    params: Object.assign({}, params || {})
  };
  if (meta && typeof meta === "object") {
    Object.keys(meta).forEach(function (name) {
      if (meta[name] !== undefined) {
        event[name] = meta[name];
      }
    });
  }
  return event;
}

export function battleSpeciesRef(value) {
  var pokemon = value && value.pokemon ? value.pokemon : value;
  return { ref: "species", key: normalizedKey(pokemon && pokemon.speciesKey) };
}

export function battleMoveRef(move) {
  return { ref: "move", key: normalizedKey(move && move.key), index: Number(move && move.index) || 0 };
}

export function battleItemRef(item) {
  return { ref: "item", key: normalizedKey(item && item.key), index: Number(item && item.index) || 0 };
}

export function battleTypeRef(type) {
  return { ref: "type", key: normalizedKey(type) };
}

export function battleStatusRef(status) {
  return { ref: "status", key: normalizedKey(status) };
}

export function battleTeamRef(team) {
  var manager = team && team.battleManager;
  var actor = manager && team === manager.enemyTeam ? "npc" : "player";
  return {
    ref: "team",
    actor: actor,
    name: normalizedKey(team && team.name)
  };
}

export function moveBattleEvent(logKey, context) {
  var move = context.move || {};
  return battleEvent("move." + normalizedKey(logKey || "fail"), {
    attacker: battleSpeciesRef(context.attacker),
    defender: battleSpeciesRef(context.defender),
    move: battleMoveRef(move),
    damage: Math.max(0, Number(context.damage) || 0),
    stats: Number(move.stats) || 0,
    doubledStats: (Number(move.stats) || 0) * 2,
    turns: Math.max(0, Number(move.bindTurns) || 0),
    recoil: Math.max(0, Number(move.recoil) || 0),
    absorbed: Math.max(0, Number(move.absorbed) || 0),
    restored: Math.max(0, Number(move.restored) || 0),
    stolenAttack: Math.max(0, Number(move.stolenAtkBuff) || 0),
    stolenDefense: Math.max(0, Number(move.stolenDefBuff) || 0),
    relatedMove: battleMoveRef({ key: move.relatedMoveKey, index: move.relatedMoveIndex }),
    resolvedType: battleTypeRef(move.resolvedType || move.forcedResolvedType),
    delayedStatus: battleStatusRef(move.delayedStatusKey),
    delayedTarget: battleSpeciesRef({ speciesKey: move.delayedStatusTargetSpeciesKey })
  }, {
    efficacy: Number(context.efficacy) > 1 ? "super" : Number(context.efficacy) < 1 ? "weak" : "neutral"
  });
}
