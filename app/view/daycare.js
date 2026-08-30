import { state } from "../client/game-state.js";
import { escapeHtml } from "../client/asset-helpers.js";
import { button, renderScenePresentationPanel, sceneShell } from "../client/render-utils.js";
import { renderPokemonCard, renderPokemonCardFrame } from "../client/pokemon-card.js";
import { levelLimitForBadges } from "../data/progression.js";
import { speciesDisplayName } from "../client/entity-text.js";
import { t } from "../client/i18n.js";

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
    return "lastTeamMember";
  }
  if (!pokemon) {
    return "emptySlot";
  }
  if (pokemon.level >= 100) {
    return "level100";
  }
  if (pokemon.level >= levelLimit) {
    return "levelCap";
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
      if (reason !== "level100" && reason !== "levelCap") {
        allAtLevelCap = false;
      }
    } else {
      anyEnabled = true;
      allAtLevelCap = false;
    }
    buttons.push('<button type="button" class="daycare-choice-option' + (disabled ? ' is-ko' : '') + '" data-action="daycare-deposit-pokemon" data-team-index="' + index + '"' + (disabled ? ' disabled title="' + escapeHtml(t("ui.daycare.reasons." + reason)) + '"' : '') + '>' + escapeHtml(speciesDisplayName(pokemon)) + '</button>');
  });

  if (!buttons.length) {
    return '<div class="daycare-placeholder-card"><span>' + escapeHtml(t("ui.daycare.noTeamPokemon")) + '</span></div>';
  }

  if (!anyEnabled) {
    var msg;
    if (!hasMultipleMembers) {
      msg = t("ui.daycare.onlyOnePokemon");
    } else if (allAtLevelCap) {
      msg = t("ui.daycare.allAtLevelCap");
    } else {
      msg = t("ui.daycare.noneAvailable");
    }
    return '<div class="daycare-placeholder-card" style="position:relative"><div class="daycare-choice-overlay"><section class="daycare-choice-panel"><h3>' + escapeHtml(msg) + '</h3></section></div></div>';
  }

  return '<div class="daycare-placeholder-card" style="position:relative;overflow:hidden">' +
    '<div class="daycare-choice-overlay">' +
    '  <section class="daycare-choice-panel">' +
    '    <h3>' + escapeHtml(t("ui.daycare.choosePokemon")) + '</h3>' +
    '    <div class="daycare-choice-grid">' +
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
    ? button(t(isPendingWithdraw ? "ui.daycare.withdrawPending" : "ui.daycare.withdraw"), isPendingWithdraw ? "open-pending-daycare-withdraw" : "daycare-withdraw", 'data-slot-index="' + escapeHtml(index) + '"' + (state.inBattle && !isPendingWithdraw ? " disabled" : ""), "button-accent")
    : button(t(isDepositTarget ? "ui.daycare.cancel" : "ui.daycare.deposit"), isDepositTarget ? "daycare-cancel-deposit" : "daycare-start-deposit", 'data-slot-index="' + escapeHtml(index) + '"' + (state.inBattle ? " disabled" : ""), isDepositTarget ? "button-dark" : "button-primary");
  var card = slot && slot.pokemon
    ? renderPokemonCard(slot.pokemon, { className: "daycare-slot-pokemon-card" })
    : isDepositTarget
      ? renderDaycareDepositMinimenu()
      : '<div class="daycare-placeholder-card"><span>' + escapeHtml(t("ui.daycare.freeSlot")) + '</span></div>';
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
    '  <h2 class="stack-title">' + escapeHtml(t("ui.daycare.depositedPokemon")) + '</h2>',
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
    : '<div class="empty-state">' + escapeHtml(t("ui.daycare.emptyTeam")) + '</div>';
  return [
    '<section class="panel daycare-team-panel"><div class="panel-inner daycare-team-inner">',
    '  <h2 class="stack-title">' + escapeHtml(t("ui.daycare.team")) + '</h2>',
    '  <div class="daycare-team-row">' + teamCards + '</div>',
    '</div></section>'
  ].join("");
}

export function renderDaycareScene() {
  var content = [
    '<section class="daycare-layout">',
    renderScenePresentationPanel("daycare", "daycare-info-panel"),
    renderDaycareSlotsPanel(),
    renderTeamPanel(),
    '</section>'
  ].join("");
  return sceneShell(t("ui.daycare.sceneTitle"), "", content, "", "scene-content-daycare", "parent-back");
}
