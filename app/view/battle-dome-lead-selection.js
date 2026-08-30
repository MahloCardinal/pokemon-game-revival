import * as Engine from "../engine/index.js";
import { state } from "../client/game-state.js";
import { escapeHtml } from "../client/asset-helpers.js";
import { renderPokemonCard, renderPokemonCardFrame } from "../client/pokemon-card.js";
import { button, sceneShell } from "../client/render-utils.js";
import { t } from "../client/i18n.js";

function participantPokemon(entry) {
  return new Engine.Pokemon({
    name: String(entry.display_name || entry.species_key || "Pokemon"),
    speciesKey: String(entry.species_key || ""),
    ndex: Number(entry.ndex) || 0,
    level: Number(entry.level) || 100,
    type: Array.isArray(entry.type_keys) ? entry.type_keys.slice() : [],
    maxHp: Number(entry.max_hp) || 1,
    gender: entry.gender || null,
    isShiny: Boolean(entry.is_shiny),
    moves: (entry.moves || []).map(function (move) {
      return Engine.moveFromJSON([Number(move.move_index), Number(move.power) || 0, Number(move.stats) || 0]);
    }),
    expCurrent: Number(entry.exp_current) || 0,
    expCap: Number(entry.exp_cap) || 0,
    heldItemIndex: Number(entry.held_item_index) || 0
  });
}

function renderLeadCard(entry, selectedSlot, canChoose) {
  var slot = Number(entry.slot_index);
  var selected = slot === selectedSlot;
  var actions = canChoose && !selected
    ? button(t("ui.battleDome.chooseLead"), "battle-dome-lead-choice", 'data-team-slot="' + escapeHtml(slot) + '"', "button-primary button-slim")
    : "";
  return renderPokemonCardFrame(renderPokemonCard(participantPokemon(entry), {
    showExperience: false,
    className: selected ? "battle-dome-lead-selected" : ""
  }), {
    className: "battle-dome-lead-entry",
    statusLabel: selected ? t("ui.battleDome.selectedLead") : "",
    actions: actions
  });
}

function renderLeadTeam(scene, side, username, selectedSlot) {
  var roleSide = scene.battleDomeRole === "creator" ? "player" : "npc";
  var canChoose = roleSide === side && scene.battleDomeWaitingFor === scene.battleDomeRole
    && selectedSlot === null && !scene.authoritativeCommandPending;
  var participants = scene.battleDomeParticipants.filter(function (entry) {
    return entry.side === side;
  }).sort(function (left, right) {
    return Number(left.slot_index) - Number(right.slot_index);
  });
  return [
    '<section class="panel battle-dome-lead-team"><div class="panel-inner">',
    '<h2>' + escapeHtml(t("ui.battleDome.teamOf", { name: username })) + '</h2>',
    '<div class="pokemon-grid battle-dome-lead-grid">',
    participants.map(function (entry) { return renderLeadCard(entry, selectedSlot, canChoose); }).join(""),
    '</div></div></section>'
  ].join("");
}

export function renderBattleDomeLeadSelectionScene(scene) {
  scene = scene || state.scene;
  var creator = scene.battleDomeCreatorUsername;
  var challenger = scene.battleDomeChallengerUsername;
  var ownsChoice = scene.battleDomeRole === scene.battleDomeWaitingFor;
  var instruction = ownsChoice ? t("ui.battleDome.chooseYourLead")
    : scene.battleDomeWaitingFor === "creator"
      ? t("ui.battleDome.waitingForCreatorLead", { name: creator })
      : t("ui.battleDome.waitingForChallengerLead", { name: challenger });
  var body = [
    '<section class="panel battle-dome-lead-intro"><div class="panel-inner">',
    '<p>' + escapeHtml(instruction) + '</p>',
    '<p class="battle-dome-note">' + escapeHtml(t("ui.battleDome.creatorAttacksFirst", { name: creator })) + '</p>',
    '</div></section>',
    '<div class="battle-dome-lead-teams">',
    renderLeadTeam(scene, "player", creator, scene.battleDomeCreatorLeadSlot),
    renderLeadTeam(scene, "npc", challenger, scene.battleDomeChallengerLeadSlot),
    '</div>',
    '<div class="battle-dome-lead-abandon" data-battle-abandon-inline>',
    button(t("ui.battle.abandon"), "battle-abandon-open", "", "button-danger"),
    '</div>'
  ].join("");
  return sceneShell(t("ui.battleDome.leadSelectionTitle"), "", body, "", "scene-content-battle-dome-leads", "", true);
}
