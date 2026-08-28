import * as Engine from "../engine/index.js";
import { KANTO_GYM_BADGES } from "../data/gyms.js";
import { TRAINER_TITLES } from "../data/titles.js";
import { assetPath, escapeHtml, renderImage } from "../client/asset-helpers.js";
import { renderPokemonCard, renderPokemonCardFrame } from "../client/pokemon-card.js";
import { sceneShell } from "../client/render-utils.js";
import { speciesDisplayName } from "../client/entity-text.js";
import { resolveText, t } from "../client/i18n.js";
import { state } from "../client/game-state.js";

function playerDirectoryState() {
  return state.scene && state.scene.playerDirectory || { loading: true, loaded: false, players: [], error: null };
}

function playerBadgesMarkup(badges) {
  var count = Math.max(0, Math.min(KANTO_GYM_BADGES.length, Math.floor(Number(badges) || 0)));
  return KANTO_GYM_BADGES.map(function (badge, index) {
    var className = "player-directory-badge" + (index < count ? "" : " player-directory-badge--locked");
    return renderImage(
      assetPath("img_miscellaneous", badge.image),
      t("ui.gyms.badges." + badge.key),
      className,
      'loading="lazy" decoding="async" fetchpriority="low"'
    );
  }).join("");
}

function titleNames(titleKeys) {
  var unlocked = new Set((Array.isArray(titleKeys) ? titleKeys : []).map(String));
  return TRAINER_TITLES.filter(function (title) { return unlocked.has(title.key); }).map(function (title) {
    return t("ui.team.trainerTitles.entries." + title.key + ".name");
  });
}

function hydratePokemon(entry) {
  try {
    return Engine.Pokemon.fromJSON(entry && entry.pokemon ? entry.pokemon : entry);
  } catch (error) {
    return null;
  }
}

function teamSummary(team) {
  var names = (Array.isArray(team) ? team : []).map(function (entry) {
    var pokemon = hydratePokemon(entry);
    return pokemon ? speciesDisplayName(pokemon) + " (" + t("common.units.levelShort") + " " + pokemon.level + ")" : "";
  }).filter(Boolean);
  return names.length ? names.join(" · ") : t("ui.playerDirectory.emptyTeam");
}

function renderTeamDetails(team) {
  var cards = (Array.isArray(team) ? team : []).map(function (entry) {
    var pokemon = hydratePokemon(entry);
    if (!pokemon) return "";
    return renderPokemonCardFrame(renderPokemonCard(pokemon, {
      className: "player-directory-pokemon-card",
      staticSprite: true,
      showMoveValues: true,
      imageAttrs: 'loading="lazy" decoding="async" fetchpriority="low"'
    }));
  }).filter(Boolean).join("");
  return cards
    ? '<div class="player-directory-team">' + cards + "</div>"
    : '<p class="player-directory-empty">' + escapeHtml(t("ui.playerDirectory.emptyTeam")) + "</p>";
}

function renderPlayerRow(player) {
  var badges = Math.max(0, Math.min(8, Math.floor(Number(player && player.badges) || 0)));
  var titles = titleNames(player && player.titles);
  var team = Array.isArray(player && player.team) ? player.team : [];
  return [
    '<li class="player-directory-entry">',
    '  <details class="player-directory-player">',
    '    <summary class="player-directory-summary">',
    '      <span class="player-directory-summary-main">',
    '        <strong class="player-directory-player-name">' + escapeHtml(player && player.username || t("ui.home.defaultTrainer")) + "</strong>",
    '        <span class="player-directory-team-summary">' + escapeHtml(teamSummary(team)) + "</span>",
    "      </span>",
    '      <span class="player-directory-badge-count">' + escapeHtml(t("ui.playerDirectory.badges", { count: badges })) + "</span>",
    "    </summary>",
    '    <div class="player-directory-player-body">',
    '      <div class="player-directory-meta">',
    '        <div class="player-directory-badges" aria-label="' + escapeHtml(t("ui.playerDirectory.badges", { count: badges })) + '">' + playerBadgesMarkup(badges) + "</div>",
    '        <div class="player-directory-titles">',
    '          <h3>' + escapeHtml(t("ui.playerDirectory.titles")) + "</h3>",
    titles.length
      ? '<ul>' + titles.map(function (title) { return "<li>" + escapeHtml(title) + "</li>"; }).join("") + "</ul>"
      : '<p class="player-directory-empty">' + escapeHtml(t("ui.playerDirectory.emptyTitles")) + "</p>",
    "        </div>",
    "      </div>",
    '      <h3 class="player-directory-team-title">' + escapeHtml(t("ui.playerDirectory.team")) + "</h3>",
    renderTeamDetails(team),
    "    </div>",
    "  </details>",
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
    '<section class="player-directory-layout">',
    '  <p class="player-directory-intro">' + escapeHtml(t("ui.playerDirectory.description")) + "</p>",
    '  <div data-render-region="player-directory-content">' + renderDirectoryContent() + "</div>",
    "</section>"
  ].join("");
  return sceneShell(t("ui.playerDirectory.sceneTitle"), "", body, "", "scene-content-player-directory", "parent-back");
}
