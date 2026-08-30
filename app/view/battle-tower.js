import { state } from "../client/game-state.js";
import { escapeHtml } from "../client/asset-helpers.js";
import { isDebugUser } from "../client/debug-tools.js";
import { button, renderScenePresentationPanel, sceneShell } from "../client/render-utils.js";
import { renderPokemonCard } from "../client/pokemon-card.js";
import { t, tList } from "../client/i18n.js";

function towerTeamCards() {
  return Array.from({ length: 6 }, function (_, slot) {
    var pokemon = state.team[slot];
    return pokemon
      ? '<div class="battle-tower-team-slot">' + renderPokemonCard(pokemon, { className: "mini-card", showMoves: false }) + "</div>"
      : '<div class="battle-tower-team-slot battle-tower-team-slot-empty" aria-label="' + escapeHtml(t("ui.battleTower.emptyTeamSlot")) + '">' + escapeHtml(t("ui.battleTower.emptyTeamSlot")) + "</div>";
  }).join("");
}

export function renderBattleTowerScene() {
  var tower = state.battleTower || {};
  var teamCount = state.team.filter(Boolean).length;
  var record = Math.max(0, Number(tower.record) || 0);
  var attemptedToday = Boolean(tower.attemptedToday);
  var debugUser = isDebugUser();
  var canStart = (!attemptedToday || tower.runId || debugUser)
    && !state.battleStartPending && !state.activeBattle;
  var status = attemptedToday && !tower.runId && !debugUser
      ? '<p class="battle-tower-status">' + escapeHtml(t("ui.battleTower.attemptedToday")) + "</p>"
      : "";
  var rules = tList("ui.battleTower.rules").map(function (rule) { return "<li>" + escapeHtml(rule) + "</li>"; }).join("");
  var disabled = canStart ? "" : "disabled";
  var content = [
    '<section class="battle-tower-layout">',
    renderScenePresentationPanel("battle_tower", "battle-tower-info-panel"),
    '  <section class="panel battle-tower-panel"><div class="panel-inner stack">',
    '    <h2 class="stack-title">' + escapeHtml(t("ui.battleTower.yourTeam")) + "</h2>",
    '    <div class="battle-tower-team-grid">' + towerTeamCards() + "</div>",
    '    <h2 class="stack-title">' + escapeHtml(t("ui.battleTower.rulesTitle")) + "</h2>",
    status,
    '    <ul class="battle-tower-rules">' + rules + "</ul>",
    '    <p class="battle-tower-record"><span>' + escapeHtml(t("ui.battleTower.consecutiveWinsRecord")) + "</span><strong>" + escapeHtml(record) + "</strong></p>",
    '    <div class="battle-tower-actions">' + button(t("ui.battleTower.start"), "battle-tower-start", disabled, "button-primary") + "</div>",
    "  </div></section>",
    "</section>"
  ].join("");
  return sceneShell(t("ui.sceneTitles.battleTower"), "", content, "", "scene-content-battle-tower", "parent-back");
}
