import { getItemByKey } from "../data/items.js";
import { typeDisplayName } from "../data/type-chart.js";

function conditionHard(combatant) {
  if (combatant.status === "par_block" || combatant.status === "par_free") {
    return "[Par]";
  }
  if (combatant.status === "psn") {
    return "[Avv]";
  }
  if (combatant.status === "brn") {
    return "[Bru]";
  }
  if (combatant.status === "frz") {
    return "[Cong]";
  }
  if (combatant.status === "slp") {
    return "[Add " + combatant.sleepCounter + "/" + (combatant.sleepDuration || 3) + "]";
  }
  return "";
}

function conditionSoft(combatant) {
  if (combatant.status === "cnf_block" || combatant.status === "cnf_free") {
    return "[Conf " + combatant.confCounter + "/5]";
  }
  if (combatant.pendingDelayedStatus) {
    if (combatant.pendingDelayedStatus.source === "yawn") {
      return "[Assopito]";
    }
    return "[Status in attesa " + combatant.pendingDelayedStatus.delay + "]";
  }
  return "";
}

function pokemonBuffs(combatant) {
  var parts = [];
  var effectiveAtkBuff = Math.max(combatant.atkBuff, combatant.weatherAtkBuff);
  var effectiveDefBuff = Math.max(combatant.defBuff, combatant.weatherDefBuff);
  if (effectiveAtkBuff !== 0) { parts.push("+" + effectiveAtkBuff + " Atk"); }
  if (combatant.atkNerf !== 0) { parts.push("-" + combatant.atkNerf + " Atk"); }
  if (effectiveDefBuff !== 0) { parts.push("+" + effectiveDefBuff + " Def"); }
  if (combatant.defNerf !== 0) { parts.push("-" + combatant.defNerf + " Def"); }
  return (parts.length ? "[" + parts.join(", ") + "]" : "")
    + (combatant.chargeDamageMultiplier > 1 ? "[prossimo turno danno x2]" : "");
}

function disabledMovesString(combatant) {
  var keys = combatant.disabledMoves || [];
  if (!keys.length || combatant.exclusiveActive) {
    return "";
  }
  var names = keys.map(function (key) {
    var move = combatant.pokemon.moves.find(function (candidate) { return candidate.key === key; });
    return move ? move.name : key;
  });
  return "[" + names.join(", ") + (names.length === 1 ? " bloccata]" : " bloccate]");
}

function teamEffects(combatant) {
  var team = combatant.team;
  var parts = [];
  if (team.teamAtkBuff !== 0) {
    parts.push("+" + team.teamAtkBuff + " Atk " + team.buffAtkCounter + "/5");
  }
  if (team.teamDefBuff !== 0) {
    parts.push("+" + team.teamDefBuff + " Def " + team.buffDefCounter + "/5");
  }
  if (team.teamMistCounter > 0) {
    parts.push("No nerf stats " + team.teamMistCounter + "/5");
  }
  if (team.teamMoveBoostProtectCounter > 0) {
    parts.push("No boost mosse avversarie " + team.teamMoveBoostProtectCounter + "/5");
  }
  if (team.teamStatusProtectCounter > 0) {
    parts.push("No status " + team.teamStatusProtectCounter + "/5");
  }
  if (team.teamBoostSuppressCounter > 0) {
    parts.push("No boost mosse avversarie " + team.teamBoostSuppressCounter + "/1");
  }
  if (team.sleepImmunityCounter > 0) {
    parts.push("No Add " + team.sleepImmunityCounter + "/5");
  }
  if (team.spikesActive) {
    parts.push("Punte");
  }
  if (team.wishHealAmount > 0) {
    parts.push("Desiderio colpirà tra 1 turno");
  }
  if (team.futureSight.active) {
    var futureMove = team.futureSight.moveKey ? team.combatantList.flatMap(function (entry) { return entry.pokemon.moves; }).find(function (move) { return move.key === team.futureSight.moveKey; }) : null;
    var fsName = futureMove ? futureMove.name : team.futureSight.attackerName;
    parts.push(fsName + " colpirà tra " + team.futureSight.timer + " turni");
  }
  return parts.length ? "[" + parts.join(", ") + "]" : "";
}

function combatantString(combatant, isActive) {
  var base = combatant.pokemon.name + " [" + combatant.hp + "/" + combatant.pokemon.maxHp + "]" + conditionHard(combatant);
  if (!isActive) {
    return base;
  }
  return base + [
    conditionSoft(combatant),
    pokemonBuffs(combatant),
    combatant.pendingMove ? (combatant.pendingMove.isForcedMove ? "[Ripeti su " + combatant.pendingMove.name + " " + combatant.pendingMoveTurns + "/3]" : "[" + combatant.pendingMove.name + "]") : "",
    combatant.defRaiseBlocked ? "[No buff Def]" : "",
    combatant.endure ? "[Resiste fino al prossimo turno]" : "",
    combatant.destinyBondActive ? "[Destinobbligato]" : "",
    combatant.grudgeActive ? "[Rancore]" : "",
    combatant.magicCoatActive ? "[Magivelo]" : "",
    combatant.rooted ? "[Radicamento]" : "",
    combatant.itemLocked ? "[Strumento bloccato]" : "",
    combatant.exclusiveActive ? "[Esclusiva]" : "",
    disabledMovesString(combatant),
    combatant.trappedTurns || combatant.trappedMoveIndex ? (combatant.trappedTurns >= 99 ? "[Trap]" : "[Trap " + combatant.trappedTurns + "/4]") : "",
    combatant.seedTarget ? "[Parassiseme (-" + combatant.seedValue + ")]" : "",
    combatant.perishSongTurns > 0 ? "[KO tra " + combatant.perishSongTurns + " turni]" : "",
    JSON.stringify(combatant.type) !== JSON.stringify(combatant.pokemon.type) ? "[" + combatant.type.map(typeDisplayName).join("/") + "]" : "",
    teamEffects(combatant)
  ].join("");
}

function usedItemsString(usedItems) {
  var keys = Object.keys(usedItems || {});
  if (!keys.length) {
    return "-";
  }
  return keys.map(function (key) {
    var item = getItemByKey(key);
    return usedItems[key] + "x" + (item ? item.name : key);
  }).join(", ");
}

function getTeamSummaryLines(team, usedItems) {
  var active = team.getActive();
  var aliveOther = team.combatantList.filter(function (combatant) {
    return !combatant.isFainted() && combatant !== active;
  });
  var koList = team.combatantList.filter(function (combatant) {
    return combatant.isFainted();
  });

  var lines = [
    { kind: "team", text: team.name },
    { kind: "text", text: "Pokémon in campo: " + combatantString(active, true) },
    { kind: "text", text: "Pokémon vivi: " + (aliveOther.length ? aliveOther.map(function (combatant) { return combatantString(combatant, false); }).join(", ") : "-") },
    { kind: "text", text: "Pokémon KO: " + (koList.length ? koList.map(function (combatant) { return combatantString(combatant, false); }).join(", ") : "-") }
  ];
  if (usedItems !== undefined) {
    lines.push({ kind: "text", text: "Strumenti: " + usedItemsString(usedItems) });
  }
  lines.push({ kind: "text", text: "%: " + (team.percentage ? "positiva" : "negativa") });
  return lines;
}

var WEATHER_LABELS = {
  sun: "Giornodisole",
  rain: "Pioggiadanza",
  sand: "Terrempesta",
  hail: "Grandine"
};

function weatherLine(manager) {
  if (!manager || !manager.weather || !WEATHER_LABELS[manager.weather]) {
    return [];
  }
  return [{ kind: "text", text: "Meteo: " + WEATHER_LABELS[manager.weather] }];
}

export function buildBattleSummary(team1, team2, usedItems, enemyUsedItems, manager) {
  var weather = manager ? weatherLine(manager) : [];
  return weather.concat(getTeamSummaryLines(team1, usedItems || {}), [{ kind: "spacer", text: "" }], getTeamSummaryLines(team2, enemyUsedItems || {}));
}
