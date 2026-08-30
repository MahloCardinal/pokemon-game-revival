import { state } from "../client/game-state.js";
import { escapeHtml } from "../client/asset-helpers.js";
import { renderPokemonCard, renderPokemonCardFrame } from "../client/pokemon-card.js";
import { button, renderScenePresentationPanel, sceneShell } from "../client/render-utils.js";
import { itemDisplayName, moveDisplayName, speciesDisplayName } from "../client/entity-text.js";
import { t } from "../client/i18n.js";
import { renderSearchCombobox } from "../client/search-combobox.js";
import { SPECIES_LIBRARY } from "../data/index.js";
import { MOVE_LIBRARY } from "../data/moves.js";
import { BATTLE_DOME_HP, BATTLE_DOME_LEVEL, BATTLE_DOME_MOVE_POWER, BATTLE_DOME_MOVE_STATS, BATTLE_DOME_TEAM_SIZE, battleDomeHeldItems, battleDomeMovePool, battleDomeSpecies } from "../data/battle-dome.js";
import * as Engine from "../engine/index.js";

function sortedOptions(entries, keyFor, labelFor) {
  return entries.map(function (entry) { return { key: String(keyFor(entry)), label: labelFor(entry) }; })
    .sort(function (left, right) { return left.label.localeCompare(right.label); });
}

function battleDomePokemon(entry) {
  var speciesKey = String(entry.species_key || "");
  var species = SPECIES_LIBRARY[speciesKey] || {};
  var moves = (entry.moves || []).map(function (moveIndex) {
    var move = MOVE_LIBRARY.find(function (entryMove) { return Number(entryMove.index) === Number(moveIndex); });
    return move ? Engine.createMove(move, { power: BATTLE_DOME_MOVE_POWER, stats: BATTLE_DOME_MOVE_STATS }) : null;
  }).filter(Boolean);
  return {
    name: species.name || speciesKey,
    speciesKey: speciesKey,
    ndex: species.dexNumber,
    level: BATTLE_DOME_LEVEL,
    type: Array.isArray(species.type) ? species.type.slice() : [],
    maxHp: BATTLE_DOME_HP,
    gender: null,
    expCurrent: 0,
    expCap: Number(species.exp) || 0,
    moves: moves,
    heldItemIndex: Number(entry.held_item_index) || 0
  };
}

function teamCard(entry, index) {
  var actions = button(
    t("ui.battleDome.removePokemon"),
    "battle-dome-remove-pokemon",
    'data-team-index="' + index + '"' + (state.battleDome.saving ? " disabled" : ""),
    "button-danger button-slim"
  );
  return renderPokemonCardFrame(renderPokemonCard(battleDomePokemon(entry)), { actions: actions });
}

function renderBuilder() {
  var dome = state.battleDome;
  var draft = dome.draft || { speciesKey: "", heldItemIndex: 0, moveIndexes: [0, 0, 0, 0] };
  var selectedMoves = Array.isArray(draft.moveIndexes) ? draft.moveIndexes.map(Number) : [0, 0, 0, 0];
  var speciesOptions = sortedOptions(battleDomeSpecies(), function (species) { return species.speciesKey; }, function (species) { return speciesDisplayName(species.speciesKey); });
  var movePool = battleDomeMovePool(draft.speciesKey);
  var itemOptions = sortedOptions(battleDomeHeldItems(), function (item) { return item.index; }, itemDisplayName);
  var moveFields = [0, 1, 2, 3].map(function (slot) {
    var options = sortedOptions(movePool.filter(function (move) {
      return selectedMoves.indexOf(Number(move.index)) === -1 || selectedMoves[slot] === Number(move.index);
    }), function (move) { return move.index; }, moveDisplayName);
    return '<label><span>' + escapeHtml(t("ui.battleDome.move", { number: slot + 1 })) + '</span>'
      + renderSearchCombobox({ options: options, value: selectedMoves[slot] || "", field: { attribute: "battle-dome-field", value: "move-" + slot } }) + '</label>';
  }).join("");
  var canAdd = dome.team.length < BATTLE_DOME_TEAM_SIZE && draft.speciesKey && selectedMoves.some(Boolean) && !dome.saving;
  return [
    '<section class="team-description-panel trainer-debug-pokemon-panel battle-dome-builder-panel">',
    '<div class="trainer-debug-pokemon-heading"><h2>' + escapeHtml(t("ui.battleDome.builderTitle")) + '</h2></div>',
    '<p class="battle-dome-note">' + escapeHtml(t("ui.battleDome.fixedStats", { level: BATTLE_DOME_LEVEL, hp: BATTLE_DOME_HP, power: BATTLE_DOME_MOVE_POWER, stats: BATTLE_DOME_MOVE_STATS })) + '</p>',
    '<div class="trainer-debug-pokemon-grid battle-dome-builder-primary">',
    '<label><span>' + escapeHtml(t("ui.battleDome.pokemon")) + '</span>' + renderSearchCombobox({ options: speciesOptions, value: draft.speciesKey, field: { attribute: "battle-dome-field", value: "species" } }) + '</label>',
    '<label><span>' + escapeHtml(t("ui.battleDome.heldItem")) + '</span>' + renderSearchCombobox({ options: itemOptions, value: draft.heldItemIndex || "", field: { attribute: "battle-dome-field", value: "item" }, placeholder: t("ui.battleDome.noItem") }) + '</label>',
    '</div>',
    '<div class="trainer-debug-pokemon-moves"><div class="trainer-debug-pokemon-move-row">' + moveFields + '</div></div>',
    '<div class="trainer-debug-pokemon-actions">' + button(t("ui.battleDome.addPokemon"), "battle-dome-add-pokemon", canAdd ? "" : "disabled", "button-primary") + '</div>',
    '</section>'
  ].join("");
}

function renderTeam() {
  var dome = state.battleDome;
  var teamCount = Math.min(3, dome.team.length || 1);
  var teamGrid = '<section class="pokemon-grid team-pokemon-grid battle-dome-team-grid team-pokemon-count-' + escapeHtml(teamCount) + '">'
    + (dome.team.length ? dome.team.map(teamCard).join("") : '<div class="empty-state">' + escapeHtml(t("ui.battleDome.emptyTeam")) + '</div>')
    + '</section>';
  return [
    '<div class="battle-dome-panel" data-render-region="battle-dome-content">',
    '<section class="battle-dome-team-block">' + teamGrid + '</section>',
    renderBuilder(),
    dome.notice ? '<p>' + escapeHtml(dome.notice) + '</p>' : "",
    dome.error ? '<p class="battle-dome-error">' + escapeHtml(dome.error) + '</p>' : "",
    '</div>'
  ].join("");
}

function renderLobby() {
  var dome = state.battleDome;
  var ownLobby = dome.lobby;
  var activeCount = dome.battles.filter(function (battle) { return battle.own_role !== "spectator"; }).length;
  var canCreate = dome.team.length >= 1 && activeCount < 2 && !dome.saving;
  var inviteCode = ownLobby && !ownLobby.expired ? String(ownLobby.invite_code || "") : "";
  var lobbyRows = dome.lobbies.map(function (lobby) {
    return '<div class="battle-dome-lobby-row"><strong>' + escapeHtml(lobby.username) + '</strong>'
      + (lobby.own ? '' : button(t("ui.battleDome.challenge"), "battle-dome-challenge", 'data-creator-user-id="' + escapeHtml(lobby.creator_auth_user_id) + '"' + (canCreate ? "" : " disabled"), "button-primary button-slim")) + '</div>';
  }).join("");
  var battleRows = dome.battles.map(function (battle) {
    return '<div class="battle-dome-battle-row"><span>' + escapeHtml(t("ui.battleDome.versus", { creator: battle.creator_username, challenger: battle.challenger_username })) + '</span>'
      + button(t("ui.battleDome.watch"), "battle-dome-open-battle", 'data-battle-id="' + escapeHtml(battle.battle_id) + '"', "button-primary button-slim") + '</div>';
  }).join("");
  return [
    '<div class="battle-dome-panel" data-render-region="battle-dome-content">',
    '<section class="panel"><div class="panel-inner battle-dome-split-panel">',
    '<section class="battle-dome-split-section"><h2>' + escapeHtml(t("ui.battleDome.yourLobby")) + '</h2>',
    ownLobby && ownLobby.expired ? '<p class="battle-dome-error">' + escapeHtml(t("ui.battleDome.expired")) + '</p>' : "",
    '<div class="battle-dome-link-row"><input readonly value="' + escapeHtml(inviteCode) + '" data-battle-dome-invite-code aria-label="' + escapeHtml(t("ui.battleDome.yourCode")) + '"><span class="battle-dome-copy-wrapper">'
      + button(t("ui.battleDome.copy"), "battle-dome-copy-code", inviteCode ? "" : "disabled", "button-primary")
      + '<span class="battle-dome-copy-tooltip">' + escapeHtml(t("ui.battleDome.copied")) + '</span></span></div>',
    inviteCode ? button(t("ui.battleDome.cancelLobby"), "battle-dome-cancel-lobby", "", "button-danger") : button(t("ui.battleDome.createChallenge"), "battle-dome-create-lobby", canCreate ? "" : "disabled", "button-primary"),
    '<p class="battle-dome-note">' + escapeHtml(t("ui.battleDome.teamRequirement")) + '</p>',
    '</section>',
    '<section class="battle-dome-split-section"><h2>' + escapeHtml(t("ui.battleDome.joinByCode")) + '</h2>',
    '<div class="battle-dome-link-row"><input type="text" value="' + escapeHtml(dome.codeDraft || "") + '" data-battle-dome-join-code placeholder="' + escapeHtml(t("ui.battleDome.codePlaceholder")) + '" inputmode="numeric" maxlength="6" pattern="[0-9]{6}">' + button(t("ui.battleDome.join"), "battle-dome-join-code", canCreate ? "" : "disabled", "button-primary") + '</div>',
    '</section></div></section>',
    '<section class="panel"><div class="panel-inner battle-dome-split-panel battle-dome-list-panel">',
    '<section class="battle-dome-split-section"><h2>' + escapeHtml(t("ui.battleDome.waitingPlayers")) + '</h2><div class="battle-dome-scroll">' + (lobbyRows || '<p>' + escapeHtml(t("ui.battleDome.noLobbies")) + '</p>') + '</div></section>',
    '<section class="battle-dome-split-section"><h2>' + escapeHtml(t("ui.battleDome.ongoing")) + '</h2><div class="battle-dome-scroll">' + (battleRows || '<p>' + escapeHtml(t("ui.battleDome.noBattles")) + '</p>') + '</div></section>',
    '</div></section>',
    dome.notice ? '<p>' + escapeHtml(dome.notice) + '</p>' : "",
    dome.error ? '<p class="battle-dome-error">' + escapeHtml(dome.error) + '</p>' : "",
    '</div>'
  ].join("");
}

export function renderBattleDomeScene() {
  var dome = state.battleDome;
  var tabs = '<section class="panel pokefan-sections-panel battle-dome-sections-panel"><div class="panel-inner"><nav class="pokemon-center-action-row rules-section-row" aria-label="' + escapeHtml(t("ui.sceneTitles.battleDome")) + '">'
    + button(t("ui.battleDome.teamTab"), "battle-dome-tab", 'data-tab="team" aria-pressed="' + (dome.tab === "team" ? "true" : "false") + '"', "button-slim" + (dome.tab === "team" ? " button-primary" : " button-ghost"))
    + button(t("ui.battleDome.lobbyTab"), "battle-dome-tab", 'data-tab="lobby" aria-pressed="' + (dome.tab === "lobby" ? "true" : "false") + '"', "button-slim" + (dome.tab === "lobby" ? " button-primary" : " button-ghost"))
    + '</nav></div></section>';
  var body = dome.loading && !dome.loaded ? '<p>' + escapeHtml(t("ui.battleDome.loading")) + '</p>' : tabs + (dome.tab === "lobby" ? renderLobby() : renderTeam());
  body = renderScenePresentationPanel("battle_dome", "battle-dome-info-panel") + body;
  return sceneShell(t("ui.sceneTitles.battleDome"), "", body, "", "scene-content-battle-dome", "parent-back");
}
