import * as Engine from "../engine/index.js";
import { KANTO_GYM_BADGES } from "../data/gyms.js";
import { trainerSpriteByIndex } from "../data/trainers.js";
import { trainerTitleByKey } from "../data/titles.js";
import { assetPath, escapeHtml, getTrainerImage, renderImage, withTrainerSpriteAttrs, withTrainerSpriteClass } from "../client/asset-helpers.js";
import { renderPokemonCard, renderPokemonCardFrame } from "../client/pokemon-card.js";
import { sceneShell } from "../client/render-utils.js";
import { resolveText, t } from "../client/i18n.js";
import { state } from "../client/game-state.js";

function playerDirectoryState() {
  return state.scene && state.scene.playerDirectory || { loading: true, loaded: false, players: [], error: null };
}

function playerBadgesMarkup(badges) {
  var count = Math.max(0, Math.min(KANTO_GYM_BADGES.length, Math.floor(Number(badges) || 0)));
  return KANTO_GYM_BADGES.slice(0, count).map(function (badge) {
    return renderImage(
      assetPath("img_miscellaneous", badge.image),
      t("ui.gyms.badges." + badge.key),
      "player-directory-badge",
      'loading="lazy" decoding="async" fetchpriority="low"'
    );
  }).join("");
}

function preferredTitleName(titleKey) {
  var title = trainerTitleByKey(titleKey);
  return title ? t("ui.team.trainerTitles.entries." + title.key + ".name") : "";
}

function hydratePokemon(entry) {
  try {
    return Engine.Pokemon.fromJSON(entry && entry.pokemon ? entry.pokemon : entry);
  } catch (error) {
    return null;
  }
}

function renderTeamDetails(team) {
  var cards = (Array.isArray(team) ? team : []).map(function (entry) {
    var pokemon = hydratePokemon(entry);
    if (!pokemon) return "";
    return renderPokemonCardFrame(renderPokemonCard(pokemon, {
      className: "player-directory-pokemon-card",
      staticSprite: true,
      imageAttrs: 'loading="lazy" decoding="async" fetchpriority="low"'
    }));
  }).filter(Boolean).join("");
  return cards
    ? '<div class="player-directory-team">' + cards + "</div>"
    : '<p class="player-directory-empty">' + escapeHtml(t("ui.playerDirectory.emptyTeam")) + "</p>";
}

function renderPlayerRow(player, playerIndex) {
  var badges = Math.max(0, Math.min(8, Math.floor(Number(player && player.badges) || 0)));
  var team = Array.isArray(player && player.team) ? player.team : [];
  var preferredTitle = preferredTitleName(player && player.preferred_title);
  var playerName = player && player.username || t("ui.home.defaultTrainer");
  var trainerSprite = trainerSpriteByIndex(player && player.trainer_index);
  var playerId = "player-directory-player-" + Math.max(0, Number(playerIndex) || 0);
  var teamId = playerId + "-team";
  return [
    '<li class="player-directory-entry">',
    '  <article class="player-directory-trainer-card" aria-labelledby="' + escapeHtml(playerId) + '-name">',
    '    <div class="player-directory-trainer-media">',
    renderImage(
      getTrainerImage(trainerSprite),
      t("ui.playerDirectory.trainerAlt", { name: playerName }),
      withTrainerSpriteClass("player-directory-trainer-image", trainerSprite),
      withTrainerSpriteAttrs(trainerSprite, 'loading="lazy" decoding="async" fetchpriority="low"')
    ),
    "    </div>",
    '    <div class="player-directory-trainer-info">',
    '      <strong class="player-directory-player-name" id="' + escapeHtml(playerId) + '-name">' + escapeHtml(playerName) + "</strong>",
    preferredTitle ? '      <span class="player-directory-preferred-title">' + escapeHtml(preferredTitle) + "</span>" : "",
    '      <span class="player-directory-summary-badges" aria-label="' + escapeHtml(t("ui.playerDirectory.badges", { count: badges })) + '">' + playerBadgesMarkup(badges) + "</span>",
    '      <button type="button" class="button button-primary player-directory-team-toggle" data-action="player-directory-toggle-team" aria-expanded="false" aria-controls="' + escapeHtml(teamId) + '" data-open-label="' + escapeHtml(t("ui.playerDirectory.showTeam")) + '" data-close-label="' + escapeHtml(t("ui.playerDirectory.hideTeam")) + '">' + escapeHtml(t("ui.playerDirectory.showTeam")) + "</button>",
    "    </div>",
    "  </article>",
    '  <section class="player-directory-team-panel" id="' + escapeHtml(teamId) + '" aria-label="' + escapeHtml(t("ui.playerDirectory.teamLabel", { name: playerName })) + '" hidden>',
    renderTeamDetails(team),
    "  </section>",
    "</li>"
  ].join("");
}

function renderDirectoryContent() {
  var directory = playerDirectoryState();
  if (directory.error) {
    return '<p class="player-directory-empty player-directory-error">' + escapeHtml(resolveText(directory.error)) + "</p>";
  }
  if (directory.loading && !directory.loaded) {
    return '<p class="player-directory-empty">' + escapeHtml(t("ui.playerDirectory.loading")) + "</p>";
  }
  if (!Array.isArray(directory.players) || !directory.players.length) {
    return '<p class="player-directory-empty">' + escapeHtml(t("ui.playerDirectory.empty")) + "</p>";
  }
  return '<ol class="player-directory-list">' + directory.players.map(renderPlayerRow).join("") + "</ol>";
}

export function renderPlayerDirectoryScene() {
  var body = [
    '<section class="panel player-directory-panel">',
    '  <div class="panel-inner player-directory-layout">',
    '    <p class="player-directory-intro">' + escapeHtml(t("ui.playerDirectory.description")) + "</p>",
    '    <div data-render-region="player-directory-content">' + renderDirectoryContent() + "</div>",
    "  </div>",
    "</section>"
  ].join("");
  return sceneShell(t("ui.playerDirectory.sceneTitle"), "", body, "", "scene-content-player-directory", "parent-back");
}
