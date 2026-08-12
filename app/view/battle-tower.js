import { state } from "../client/game-state.js";
import { escapeHtml } from "../client/asset-helpers.js";
import { isDebugUser } from "../client/debug-tools.js";
import { button, renderScenePresentationPanel, sceneShell } from "../client/render-utils.js";
import { renderPokemonCard } from "../client/pokemon-card.js";

function towerTeamCards() {
  return Array.from({ length: 6 }, function (_, slot) {
    var pokemon = state.team[slot];
    return pokemon
      ? '<div class="battle-tower-team-slot">' + renderPokemonCard(pokemon, { className: "mini-card", showMoves: false }) + "</div>"
      : '<div class="battle-tower-team-slot battle-tower-team-slot-empty" aria-label="Slot squadra vuoto">Slot vuoto</div>';
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
      ? '<p class="battle-tower-status">Hai già effettuato il tentativo di oggi.</p>'
      : "";
  var rules = [
    "Si ha un solo tentativo di scalata al giorno",
    "Bisogna avere almeno 3 Pokémon in squadra per poter partecipare",
    "Non si possono usare strumenti, Bacche o Ball durante la sfida",
    "L'avversario attacca sempre per primo",
    "I Pokémon vengono curati completamente tra una sfida e l'altra",
    "Ottieni PL pari agli sfidanti sconfitti, con bonus +20 alla 7ª e +50 alla 10ª vittoria",
    "La difficoltà aumenta con l'aumentare della scalata"
  ].map(function (rule) { return "<li>" + escapeHtml(rule) + "</li>"; }).join("");
  var disabled = canStart ? "" : "disabled";
  var content = [
    '<section class="team-scene-stack battle-tower-layout">',
    renderScenePresentationPanel("Torre Lotta", "battle-tower-info-panel"),
    '  <section class="panel battle-tower-panel"><div class="panel-inner stack">',
    '    <h2 class="stack-title">La tua squadra</h2>',
    '    <div class="battle-tower-team-grid">' + towerTeamCards() + "</div>",
    '    <h2 class="stack-title">Regolamento</h2>',
    status,
    '    <ul class="battle-tower-rules">' + rules + "</ul>",
    '    <p class="battle-tower-record"><span>Record vittorie consecutive</span><strong>' + escapeHtml(record) + "</strong></p>",
    '    <div class="battle-tower-actions">' + button("Comincia la scalata!", "battle-tower-start", disabled, "button-primary") + "</div>",
    "  </div></section>",
    "</section>"
  ].join("");
  return sceneShell("Torre Lotta", "", content, "", "scene-content-battle-tower", "parent-back");
}
