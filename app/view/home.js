import { assetPath, escapeHtml, renderImage } from "../client/asset-helpers.js";
import { isDebugUser } from "../client/debug-tools.js";
import { state } from "../client/game-state.js";
import { button, sceneShell } from "../client/render-utils.js";
import { t } from "../client/i18n.js";
import { pokemonDisplayName } from "../client/entity-text.js";
import { resolveText } from "../client/i18n.js";

function strongText(value) {
  return "<strong>" + escapeHtml(value) + "</strong>";
}

function renderAdminMessageText(text) {
  return escapeHtml(text).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

function renderActivityText(entry) {
  var playerName = entry && entry.playerUsername ? entry.playerUsername : t("ui.home.defaultTrainer");
  var subjectName = entry && entry.subjectName ? entry.subjectName : "";
  var secondarySubjectName = entry && entry.secondarySubjectName ? entry.secondarySubjectName : "";
  if (entry && entry.eventType === "starter") {
    return t("ui.home.events.starter", { player: strongText(playerName), subject: strongText(pokemonDisplayName({ speciesKey: subjectName })) });
  }
  if (entry && entry.eventType === "capture") {
    return t("ui.home.events.capture", { player: strongText(playerName), subject: strongText(pokemonDisplayName({ speciesKey: subjectName })) });
  }
  if (entry && entry.eventType === "badge") {
    return t("ui.home.events.badge", { player: strongText(playerName), badge: strongText(t("ui.gyms.badges." + subjectName)) });
  }
  if (entry && entry.eventType === "league") {
    return t("ui.home.events.league", { player: strongText(playerName), subject: strongText(t("ui.gyms.trainers." + subjectName)) });
  }
  if (entry && entry.eventType === "evolution") {
    return t("ui.home.events.evolution", { player: strongText(playerName), subject: strongText(pokemonDisplayName({ speciesKey: subjectName })), secondarySubject: strongText(pokemonDisplayName({ speciesKey: secondarySubjectName })) });
  }
  return "";
}

function renderAdminActivityText(entry) {
  var subjectName = entry && entry.subjectName ? entry.subjectName : "";
  if (!entry || entry.eventType !== "admin_message") {
    return "";
  }
  return '<strong class="home-activity-service-label">' + escapeHtml(t("ui.home.serviceCommunication")) + "</strong>: " + renderAdminMessageText(subjectName);
}

function renderActivityPanelBody(feed, rows, emptyText, renderEntry) {
  var body;
  if (feed.error) {
    body = '<p class="home-activity-empty">' + escapeHtml(resolveText(feed.error)) + "</p>";
  } else if (!feed.loaded) {
    body = '<p class="home-activity-empty">' + escapeHtml(t("ui.home.loadingActivity")) + "</p>";
  } else if (!rows.length) {
    body = '<p class="home-activity-empty">' + escapeHtml(emptyText) + "</p>";
  } else {
    body = '<ul class="home-activity-list">' + rows.map(function (entry) {
      var text = renderEntry(entry);
      return text ? '<li class="home-activity-item">' + text + "</li>" : "";
    }).join("") + "</ul>";
  }
  return body;
}

function renderUserActivityFeedPanel(feed, rows, selectedDashboard) {
  var body = renderActivityPanelBody(feed, rows, t("ui.home.noRecentActivity"), renderActivityText);
  return [
    '<section id="home-player-activity-panel" class="home-activity-panel is-player-panel' + (selectedDashboard === "players" ? " is-active" : "") + '" aria-label="' + escapeHtml(t("ui.home.eventsTitle")) + '">',
    '  <h2 class="home-activity-header">' + escapeHtml(t("ui.home.eventsTitle")) + "</h2>",
    '  <div class="home-activity-scroll">',
    body,
    "  </div>",
    "</section>"
  ].join("");
}

function renderAdminMessagesPanel(feed, rows, selectedDashboard) {
  var body = renderActivityPanelBody(feed, rows, t("ui.home.noAdminMessages"), renderAdminActivityText);
  return [
    '<section id="home-admin-activity-panel" class="home-activity-panel is-admin-panel' + (selectedDashboard === "admin" ? " is-active" : "") + '" aria-label="' + escapeHtml(t("ui.home.alertsTitle")) + '">',
    '  <h2 class="home-activity-header">' + escapeHtml(t("ui.home.alertsTitle")) + "</h2>",
    '  <div class="home-activity-scroll">',
    body,
    "  </div>",
    "</section>"
  ].join("");
}

function renderActivityDashboardTabs(selectedDashboard) {
  return [
    '<div class="home-activity-dashboard-tabs" aria-label="' + escapeHtml(t("ui.home.selectDashboard")) + '">',
    button(t("ui.home.eventsTitle"), "home-activity-dashboard-select", 'data-dashboard="players" aria-controls="home-player-activity-panel" aria-pressed="' + (selectedDashboard === "players" ? "true" : "false") + '"', "home-activity-dashboard-tab is-player-tab" + (selectedDashboard === "players" ? " is-active" : "")),
    button(t("ui.home.alertsTitle"), "home-activity-dashboard-select", 'data-dashboard="admin" aria-controls="home-admin-activity-panel" aria-pressed="' + (selectedDashboard === "admin" ? "true" : "false") + '"', "home-activity-dashboard-tab is-admin-tab" + (selectedDashboard === "admin" ? " is-active" : "")),
    "</div>"
  ].join("");
}

export function renderActivityFeedSection() {
  var feed = state.activityFeed || { loading: false, loaded: false, rows: [], error: "", selectedDashboard: "players" };
  var rows = Array.isArray(feed.rows) ? feed.rows : [];
  var selectedDashboard = feed.selectedDashboard === "admin" ? "admin" : "players";
  var userRows = rows.filter(function (entry) { return entry && entry.eventType !== "admin_message"; });
  var adminRows = rows.filter(function (entry) { return entry && entry.eventType === "admin_message"; });

  return renderActivityDashboardTabs(selectedDashboard)
    + renderUserActivityFeedPanel(feed, userRows, selectedDashboard)
    + renderAdminMessagesPanel(feed, adminRows, selectedDashboard);
}

export function renderHomeScene() {
  function homeCard(key, action, imageFile, href) {
    var title = t("ui.zoneCards." + key + ".title");
    var desc = t("ui.zoneCards." + key + ".description");
    var cardClass = imageFile ? "" : " home-zone-card-text-only";
    var mediaMarkup = imageFile ? [
      '  <div class="image-card-media">',
      renderImage(assetPath("img_zone", imageFile), title, "image-card-image"),
      "  </div>"
    ].join("") : "";

    return [
      '<a class="image-card home-zone-card' + cardClass + '" href="' + escapeHtml(href) + '" data-action="' + escapeHtml(action) + '">',
      '  <h3 class="image-card-title">' + escapeHtml(title) + "</h3>",
      mediaMarkup,
      desc ? '  <div class="image-card-description">' + escapeHtml(desc) + "</div>" : "",
      "</a>"
    ].join("");
  }

  var cards = [
    homeCard("rules", "open-rules", "regolamento_bottone.webp", "/rules"),
    homeCard("zones", "open-zones", "zone_cattura_bottone.webp", "/zones"),
    homeCard("city", "open-city", "citta_bottone.webp", "/city"),
    homeCard("team", "open-team", "scheda_allenatore_bottone.webp", "/team"),
    homeCard("box", "open-box", "box_bottone.webp", "/box"),
    homeCard("battle_area", "open-battle-area", "area_lotta_bottone.webp", "/battle-area"),
    homeCard("kanto_league", "open-gyms", "lega_kanto_bottone.webp", "/gyms"),
    homeCard("player_directory", "open-player-directory", "schede_giocatori_bottone.webp", "/players")
  ];

  if (isDebugUser()) {
    cards.push(homeCard("styles", "open-styles", "", "/styles"));
  }

  var content = [
    '<div class="home-activity-dashboards">',
    renderActivityFeedSection(),
    "</div>",
    '<section class="home-grid">',
    cards.join(""),
    "</section>"
  ].join("");

  return sceneShell(t("ui.sceneTitles.home"), "", content, "", "scene-content-home", "parent-back", true);
}
