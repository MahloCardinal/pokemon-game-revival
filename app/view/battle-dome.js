import { state } from "../client/game-state.js";
import { escapeHtml } from "../client/asset-helpers.js";
import { button, sceneShell } from "../client/render-utils.js";
import { itemDisplayName, moveDisplayName, speciesDisplayName } from "../client/entity-text.js";
import { t } from "../client/i18n.js";
import { renderSearchCombobox } from "../client/search-combobox.js";
import { getItemByIndex } from "../data/items.js";
import { MOVE_LIBRARY } from "../data/moves.js";
import { BATTLE_DOME_HP, BATTLE_DOME_LEVEL, BATTLE_DOME_MOVE_POWER, BATTLE_DOME_MOVE_STATS, BATTLE_DOME_TEAM_SIZE, battleDomeHeldItems, battleDomeMovePool, battleDomeSpecies } from "../data/battle-dome.js";

function sortedOptions(entries, keyFor, labelFor) {
  return entries.map(function (entry) { return { key: String(keyFor(entry)), label: labelFor(entry) }; })
    .sort(function (left, right) { return left.label.localeCompare(right.label); });
}

function teamRow(entry, index) {
  var item = getItemByIndex(Number(entry.held_item_index));
  var moves = (entry.moves || []).map(function (moveIndex) {
    var move = MOVE_LIBRARY.find(function (entryMove) { return Number(entryMove.index) === Number(moveIndex); });
    return moveDisplayName(move || { index: moveIndex });
  }).join(", ");
  return [
    '<div class="battle-dome-team-row">',
    '<div class="battle-dome-team-copy"><strong>' + escapeHtml(speciesDisplayName(entry.species_key)) + '</strong>',
    '<small>' + escapeHtml(t("ui.battleDome.teamRow", { moves: moves, item: item ? itemDisplayName(item) : t("ui.battleDome.noItem") })) + '</small></div>',
    button(t("ui.battleDome.removePokemon"), "battle-dome-remove-pokemon", 'data-team-index="' + index + '"' + (state.battleDome.saving ? " disabled" : ""), "button-danger button-slim"),
    "</div>"
  ].join("");
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
    '<section class="panel"><div class="panel-inner battle-dome-panel">',
    '<h2>' + escapeHtml(t("ui.battleDome.builderTitle")) + '</h2>',
    '<p class="battle-dome-note">' + escapeHtml(t("ui.battleDome.fixedStats", { level: BATTLE_DOME_LEVEL, hp: BATTLE_DOME_HP, power: BATTLE_DOME_MOVE_POWER, stats: BATTLE_DOME_MOVE_STATS })) + '</p>',
    '<div class="battle-dome-builder-grid">',
    '<label><span>' + escapeHtml(t("ui.battleDome.pokemon")) + '</span>' + renderSearchCombobox({ options: speciesOptions, value: draft.speciesKey, field: { attribute: "battle-dome-field", value: "species" } }) + '</label>',
    '<label><span>' + escapeHtml(t("ui.battleDome.heldItem")) + '</span>' + renderSearchCombobox({ options: itemOptions, value: draft.heldItemIndex || "", field: { attribute: "battle-dome-field", value: "item" }, placeholder: t("ui.battleDome.noItem") }) + '</label>',
    moveFields,
    '</div>',
    '<div>' + button(t("ui.battleDome.addPokemon"), "battle-dome-add-pokemon", canAdd ? "" : "disabled", "button-primary") + '</div>',
    '</div></section>'
  ].join("");
}

function renderTeam() {
  var dome = state.battleDome;
  return [
    '<div class="battle-dome-panel" data-render-region="battle-dome-content">',
    renderBuilder(),
    '<section class="panel"><div class="panel-inner battle-dome-panel">',
    '<h2>' + escapeHtml(t("ui.battleDome.savedTeam", { count: dome.team.length, max: BATTLE_DOME_TEAM_SIZE })) + '</h2>',
    '<div class="battle-dome-team">' + (dome.team.length ? dome.team.map(teamRow).join("") : '<p>' + escapeHtml(t("ui.battleDome.emptyTeam")) + '</p>') + '</div>',
    dome.notice ? '<p>' + escapeHtml(dome.notice) + '</p>' : "",
    dome.error ? '<p class="battle-dome-error">' + escapeHtml(dome.error) + '</p>' : "",
    '</div></section></div>'
  ].join("");
}

function inviteUrl(token) {
  if (!token || typeof window === "undefined") return "";
  return new URL("/battle-area/battle-dome?invite=" + encodeURIComponent(token), window.location.origin).href;
}

function renderLobby() {
  var dome = state.battleDome;
  var ownLobby = dome.lobby;
  var activeCount = dome.battles.filter(function (battle) { return battle.own_role !== "spectator"; }).length;
  var canCreate = dome.team.length === BATTLE_DOME_TEAM_SIZE && activeCount < 2 && !dome.saving;
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
    '<section class="panel"><div class="panel-inner battle-dome-panel">',
    '<h2>' + escapeHtml(t("ui.battleDome.yourLobby")) + '</h2>',
    ownLobby && ownLobby.expired ? '<p class="battle-dome-error">' + escapeHtml(t("ui.battleDome.expired")) + '</p>' : "",
    ownLobby && ownLobby.invite_token ? '<div class="battle-dome-link-row"><input readonly value="' + escapeHtml(inviteUrl(ownLobby.invite_token)) + '" data-battle-dome-invite-url><button type="button" class="button button-primary" data-action="battle-dome-copy-link">' + escapeHtml(t("ui.battleDome.copy")) + '</button></div>' : "",
    ownLobby && ownLobby.invite_token ? button(t("ui.battleDome.cancelLobby"), "battle-dome-cancel-lobby", "", "button-danger") : button(t("ui.battleDome.createChallenge"), "battle-dome-create-lobby", canCreate ? "" : "disabled", "button-primary"),
    '<p class="battle-dome-note">' + escapeHtml(t("ui.battleDome.teamRequirement")) + '</p>',
    '</div></section>',
    '<section class="panel"><div class="panel-inner battle-dome-panel">',
    '<h2>' + escapeHtml(t("ui.battleDome.joinByUrl")) + '</h2>',
    '<div class="battle-dome-link-row"><input type="url" value="' + escapeHtml(dome.inviteDraft || "") + '" data-battle-dome-join-url placeholder="' + escapeHtml(t("ui.battleDome.urlPlaceholder")) + '">' + button(t("ui.battleDome.join"), "battle-dome-join-url", canCreate ? "" : "disabled", "button-primary") + '</div>',
    '</div></section>',
    '<section class="panel"><div class="panel-inner battle-dome-panel"><h2>' + escapeHtml(t("ui.battleDome.waitingPlayers")) + '</h2><div class="battle-dome-scroll">' + (lobbyRows || '<p>' + escapeHtml(t("ui.battleDome.noLobbies")) + '</p>') + '</div></div></section>',
    '<section class="panel"><div class="panel-inner battle-dome-panel"><h2>' + escapeHtml(t("ui.battleDome.ongoing")) + '</h2><div class="battle-dome-scroll">' + (battleRows || '<p>' + escapeHtml(t("ui.battleDome.noBattles")) + '</p>') + '</div></div></section>',
    dome.notice ? '<p>' + escapeHtml(dome.notice) + '</p>' : "",
    dome.error ? '<p class="battle-dome-error">' + escapeHtml(dome.error) + '</p>' : "",
    '</div>'
  ].join("");
}

export function renderBattleDomeScene() {
  var dome = state.battleDome;
  var tabs = '<div class="battle-dome-tabs">'
    + button(t("ui.battleDome.teamTab"), "battle-dome-tab", 'data-tab="team"', dome.tab === "team" ? "button-primary" : "button-dark")
    + button(t("ui.battleDome.lobbyTab"), "battle-dome-tab", 'data-tab="lobby"', dome.tab === "lobby" ? "button-primary" : "button-dark") + '</div>';
  var body = dome.loading && !dome.loaded ? '<p>' + escapeHtml(t("ui.battleDome.loading")) + '</p>' : tabs + (dome.tab === "lobby" ? renderLobby() : renderTeam());
  return sceneShell(t("ui.sceneTitles.battleDome"), "", body, "", "scene-content-battle-dome", "parent-back");
}
