import { itemDisplayName, moveDisplayName, speciesDisplayName, typeDisplayName } from "./entity-text.js";
import { t } from "./i18n.js";

function genericTeamName(ref, scene) {
  var name = String(ref && ref.name || "").trim();
  if (ref && ref.actor === "player") {
    var playerName = String(scene && scene.playerUsername || "").trim()
      || String(scene && scene.playerTeam && scene.playerTeam.name || "").trim();
    return !playerName || playerName === "Player" ? t("ui.battle.playerFallback") : playerName;
  }
  if (!name || name === "Challenger" || name === "Opponent" || name === "Wild Pokemon") {
    return t("ui.battle.opponent");
  }
  return name;
}

export function resolveBattleValue(value, scene) {
  if (!value || typeof value !== "object" || Array.isArray(value) || !value.ref) {
    return value === undefined || value === null ? "" : String(value);
  }
  if (value.ref === "species") {
    return speciesDisplayName(value.key) || t("entityDescriptions.species.fallbackName");
  }
  if (value.ref === "move") {
    return moveDisplayName({ key: value.key, index: value.index }) || t("entityDescriptions.moves.fallbackName");
  }
  if (value.ref === "item") {
    return itemDisplayName({ key: value.key, index: value.index }) || t("entityDescriptions.items.fallbackName");
  }
  if (value.ref === "type") {
    return typeDisplayName(value.key) || "-";
  }
  if (value.ref === "status") {
    return t("battleText.statuses." + String(value.key || "fallback"), {}, t("battleText.statuses.fallback"));
  }
  if (value.ref === "team") {
    return genericTeamName(value, scene);
  }
  return "";
}

export function resolveBattleEvent(entry, scene) {
  var params = {};
  var text;
  if (!entry || typeof entry.key !== "string") {
    return "";
  }
  Object.keys(entry.params || {}).forEach(function (name) {
    params[name] = resolveBattleValue(entry.params[name], scene);
  });
  text = t("battleText.events." + entry.key, params);
  if (entry.efficacy === "super" || entry.efficacy === "weak") {
    text += " " + t("battleText.effectiveness." + entry.efficacy);
  }
  return text;
}

function tag(text) { return text ? "[" + text + "]" : ""; }

function combatantText(entry) {
  var parts = [];
  var statusKey = String(entry && entry.status || "");
  var changedTypes;
  if (!entry) { return "-"; }
  if (statusKey) {
    parts.push(tag(t("battleText.summary.status." + statusKey, {
      current: statusKey === "slp" ? entry.sleepCounter : entry.confusionCounter,
      max: statusKey === "slp" ? entry.sleepDuration : 5
    }, resolveBattleValue({ ref: "status", key: statusKey }))));
  }
  if (entry.pendingStatus) {
    parts.push(tag(t(entry.pendingStatus.source === "yawn" ? "battleText.summary.drowsy" : "battleText.summary.pendingStatus", { turns: entry.pendingStatus.delay })));
  }
  if (entry.attackBuff) { parts.push(tag(t("battleText.summary.attackBuff", { value: entry.attackBuff }))); }
  if (entry.attackNerf) { parts.push(tag(t("battleText.summary.attackNerf", { value: entry.attackNerf }))); }
  if (entry.defenseBuff) { parts.push(tag(t("battleText.summary.defenseBuff", { value: entry.defenseBuff }))); }
  if (entry.defenseNerf) { parts.push(tag(t("battleText.summary.defenseNerf", { value: entry.defenseNerf }))); }
  if (entry.charged) { parts.push(tag(t("battleText.summary.doubleDamageNextTurn"))); }
  if (entry.pendingMoveKey) {
    parts.push(tag(t(entry.pendingMoveForced ? "battleText.summary.repeatMove" : "battleText.summary.pendingMove", {
      move: moveDisplayName({ key: entry.pendingMoveKey }), turns: entry.pendingMoveTurns
    })));
  }
  if (entry.defRaiseBlocked) { parts.push(tag(t("battleText.summary.noDefenseBoost"))); }
  if (entry.endure) { parts.push(tag(t("battleText.summary.endure"))); }
  if (entry.destinyBond) { parts.push(tag(moveDisplayName({ key: "destiny_bond" }))); }
  if (entry.grudge) { parts.push(tag(moveDisplayName({ key: "grudge" }))); }
  if (entry.magicCoat) { parts.push(tag(moveDisplayName({ key: "magic_coat" }))); }
  if (entry.rooted) { parts.push(tag(moveDisplayName({ key: "ingrain" }))); }
  if (entry.itemLocked) { parts.push(tag(t("battleText.summary.itemLocked"))); }
  if (entry.exclusive) { parts.push(tag(moveDisplayName({ key: "imprison" }))); }
  if (entry.disabledMoveKeys && entry.disabledMoveKeys.length) {
    parts.push(tag(t("battleText.summary.disabledMoves", { moves: entry.disabledMoveKeys.map(function (key) { return moveDisplayName({ key: key }); }).join(", ") })));
  }
  if (entry.trappedTurns) { parts.push(tag(t(entry.trappedTurns >= 99 ? "battleText.summary.trapped" : "battleText.summary.trappedTurns", { turns: entry.trappedTurns }))); }
  if (entry.seeded) { parts.push(tag(t("battleText.summary.leechSeed", { amount: entry.seedValue }))); }
  if (entry.perishSongTurns) { parts.push(tag(t("battleText.summary.koInTurns", { turns: entry.perishSongTurns }))); }
  changedTypes = JSON.stringify(entry.currentTypes || []) !== JSON.stringify(entry.originalTypes || []);
  if (changedTypes) {
    parts.push(tag(t("battleText.summary.type", {
      types: (entry.currentTypes || []).map(typeDisplayName).join("/")
    })));
  }
  return speciesDisplayName(entry.speciesKey) + " [" + entry.hp + "/" + entry.maxHp + "]" + parts.join("");
}

function teamEffectsText(effects) {
  var parts = [];
  if (effects.attackBuff) { parts.push("+" + effects.attackBuff + " Atk " + effects.attackBuffTurns + "/5"); }
  if (effects.defenseBuff) { parts.push("+" + effects.defenseBuff + " Def " + effects.defenseBuffTurns + "/5"); }
  if (effects.mistTurns) { parts.push(t("battleText.summary.noStatNerfs", { turns: effects.mistTurns })); }
  if (effects.moveBoostProtectionTurns) { parts.push(t("battleText.summary.noMoveBoosts", { turns: effects.moveBoostProtectionTurns, max: 5 })); }
  if (effects.statusProtectionTurns) { parts.push(t("battleText.summary.noStatus", { turns: effects.statusProtectionTurns })); }
  if (effects.boostSuppressionTurns) { parts.push(t("battleText.summary.noMoveBoosts", { turns: effects.boostSuppressionTurns, max: 1 })); }
  if (effects.sleepImmunityTurns) { parts.push(t("battleText.summary.noSleep", { turns: effects.sleepImmunityTurns })); }
  if (effects.spikes) { parts.push(moveDisplayName({ key: "spikes" })); }
  if (effects.wish) { parts.push(t("battleText.summary.wishNextTurn")); }
  if (effects.futureSight) { parts.push(t("battleText.summary.futureMove", { move: moveDisplayName({ key: effects.futureSight.moveKey }), turns: effects.futureSight.turns })); }
  return parts.length ? tag(parts.join(", ")) : "";
}

function usedItemsText(usedItems) {
  var keys = Object.keys(usedItems || {});
  return keys.length ? keys.map(function (key) {
    return String(usedItems[key]) + "x" + itemDisplayName({ key: key });
  }).join(", ") : "-";
}

export function localizeBattleSummary(summary, scene) {
  var lines = [];
  (summary || []).forEach(function (entry) {
    var active;
    if (entry.kind === "weather") {
      if (entry.weather) { lines.push({ kind: "text", text: t("battleText.summary.weather", { weather: t("battleText.summary.weatherTypes." + entry.weather) }) }); }
      return;
    }
    if (entry.kind !== "team") { return; }
    active = combatantText(entry.active) + teamEffectsText(entry.effects || {});
    lines.push({ kind: "team", text: genericTeamName({ actor: entry.actor, name: entry.name }, scene) });
    lines.push({ kind: "text", text: t("battleText.summary.activePokemon", { pokemon: active }) });
    lines.push({ kind: "text", text: t("battleText.summary.alivePokemon", { pokemon: entry.alive.length ? entry.alive.map(combatantText).join(", ") : "-" }) });
    lines.push({ kind: "text", text: t("battleText.summary.koPokemon", { pokemon: entry.knockedOut.length ? entry.knockedOut.map(combatantText).join(", ") : "-" }) });
    lines.push({ kind: "text", text: t("battleText.summary.items", { items: usedItemsText(entry.usedItems) }) });
    lines.push({ kind: "text", text: t("battleText.summary.percentage", { value: t(entry.percentagePositive ? "battleText.summary.positive" : "battleText.summary.negative") }) });
  });
  return lines;
}
