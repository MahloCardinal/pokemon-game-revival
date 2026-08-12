import { state } from "../client/game-state.js";
import { escapeHtml } from "../client/asset-helpers.js";
import { button, renderScenePresentationPanel, sceneShell } from "../client/render-utils.js";
import { renderPokemonCard, renderPokemonCardFrame } from "../client/pokemon-card.js";
import { levelLimitForBadges } from "../data/progression.js";

function daycareSlots() {
  var slots = Array.isArray(state.daycare) ? state.daycare.slice(0, 2) : [];
  while (slots.length < 2) {
    slots.push(null);
  }
  return slots;
}

function pokemonDepositDisabledReason(pokemon) {
  var levelLimit = levelLimitForBadges(state.trainerInfo[2]);
  if (state.team.filter(Boolean).length <= 1) {
    return "Non puoi depositare l'ultimo Pokemon in squadra.";
  }
  if (!pokemon) {
    return "Slot vuoto.";
  }
  if (pokemon.level >= 100) {
    return "Pokemon al Lv100.";
  }
  if (pokemon.level >= levelLimit) {
    return "Pokemon al livello massimo gestibile.";
  }
  return "";
}

function renderDaycareDepositMinimenu() {
  var team = state.team;
  var hasMultipleMembers = team.filter(Boolean).length > 1;
  var buttons = [];
  var anyEnabled = false;
  var allAtLevelCap = true;

  team.forEach(function (pokemon, index) {
    if (!pokemon) {
      return;
    }
    var reason = pokemonDepositDisabledReason(pokemon);
    var disabled = Boolean(reason);
    if (disabled) {
      if (reason.indexOf("Lv100") === -1 && reason.indexOf("livello massimo") === -1) {
        allAtLevelCap = false;
      }
    } else {
      anyEnabled = true;
      allAtLevelCap = false;
    }
    buttons.push('<button type="button" class="capture-starter-slot battle-switch-choice' + (disabled ? ' is-ko' : '') + '" data-action="daycare-deposit-pokemon" data-team-index="' + index + '"' + (disabled ? ' disabled title="' + escapeHtml(reason) + '"' : '') + '>' + escapeHtml(pokemon.name) + '</button>');
  });

  if (!buttons.length) {
    return '<div class="daycare-placeholder-card"><span>Nessun Pokémon in squadra.</span></div>';
  }

  if (!anyEnabled) {
    var msg;
    if (!hasMultipleMembers) {
      msg = "Hai solo un Pokémon in squadra.";
    } else if (allAtLevelCap) {
      msg = "Tutti i tuoi Pokémon sono al livello massimo gestibile con le Medaglie attuali.";
    } else {
      msg = "Nessun Pokémon può essere depositato in questo momento.";
    }
    return '<div class="daycare-placeholder-card" style="position:relative"><div class="battle-ko-switch-overlay"><section class="battle-ko-switch-panel"><h3>' + escapeHtml(msg) + '</h3></section></div></div>';
  }

  return '<div class="daycare-placeholder-card" style="position:relative;overflow:hidden">' +
    '<div class="battle-ko-switch-overlay">' +
    '  <section class="battle-ko-switch-panel">' +
    '    <h3>Scegli il Pokémon da depositare</h3>' +
    '    <div class="capture-starter-grid battle-switch-grid">' +
    buttons.join("") +
    '    </div>' +
    '  </section>' +
    '</div>' +
    '</div>';
}

function renderDaycareSlot(slot, index) {
  var isDepositTarget = state.scene.daycareDepositSlotIndex === index;
  var isPendingWithdraw = slot && slot.status === "withdraw_pending";
  var action = slot && slot.pokemon
    ? button(isPendingWithdraw ? "Ritiro in corso" : "Ritira", isPendingWithdraw ? "open-pending-daycare-withdraw" : "daycare-withdraw", 'data-slot-index="' + escapeHtml(index) + '"' + (state.inBattle && !isPendingWithdraw ? " disabled" : ""), isPendingWithdraw ? "button-accent" : "button-accent")
    : button(isDepositTarget ? "Annulla" : "Deposita", isDepositTarget ? "daycare-cancel-deposit" : "daycare-start-deposit", 'data-slot-index="' + escapeHtml(index) + '"' + (state.inBattle ? " disabled" : ""), isDepositTarget ? "button-dark" : "button-primary");
  var card = slot && slot.pokemon
    ? renderPokemonCard(slot.pokemon, { className: "daycare-slot-pokemon-card" })
    : isDepositTarget
      ? renderDaycareDepositMinimenu()
      : '<div class="daycare-placeholder-card"><span>Slot Pensione libero</span></div>';
  return [
    '<article class="daycare-slot">',
    '  <div class="daycare-slot-card">' + card + '</div>',
    '  <div class="daycare-slot-action">' + action + '</div>',
    '</article>'
  ].join("");
}

function renderDaycareSlotsPanel() {
  return [
    '<section class="panel daycare-slots-panel"><div class="panel-inner stack">',
    '  <h2 class="stack-title">Pokemon in pensione</h2>',
    '  <div class="daycare-slots-row">',
    daycareSlots().map(renderDaycareSlot).join(""),
    '  </div>',
    '</div></section>'
  ].join("");
}

function renderTeamPokemon(pokemon, index) {
  return renderPokemonCardFrame(renderPokemonCard(pokemon, {
    className: "mini-card",
    showMoves: true
  }), {
    className: "daycare-card-frame"
  });
}

function renderTeamPanel() {
  var teamCards = state.team.length
    ? state.team.map(function (pokemon, index) { return renderTeamPokemon(pokemon, index); }).join("")
    : '<div class="empty-state">La squadra e\' vuota.</div>';
  return [
    '<section class="panel daycare-team-panel"><div class="panel-inner daycare-team-inner">',
    '  <h2 class="stack-title">Squadra</h2>',
    '  <div class="daycare-team-row">' + teamCards + '</div>',
    '</div></section>'
  ].join("");
}

export function renderDaycareScene() {
  var content = [
    '<section class="team-scene-stack daycare-layout">',
    renderScenePresentationPanel("Pensione", "daycare-info-panel"),
    renderDaycareSlotsPanel(),
    renderTeamPanel(),
    '</section>'
  ].join("");
  return sceneShell("Pensione", "", content, "", "scene-content-daycare", "parent-back");
}
