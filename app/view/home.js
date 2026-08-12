import { assetPath, escapeHtml, renderImage } from "../client/asset-helpers.js";
import { isDebugUser } from "../client/debug-tools.js";
import { state } from "../client/game-state.js";
import { ZONE_CARD_DESCRIPTIONS } from "../data/zones-text.js";
import { button, sceneShell } from "../client/render-utils.js";

function badgeSubjectName(name) {
  return String(name || "").replace(/^Medaglia\s+/i, "").trim();
}

function strongText(value) {
  return "<strong>" + escapeHtml(value) + "</strong>";
}

function renderAdminMessageText(text) {
  return escapeHtml(text).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

function renderActivityText(entry) {
  var playerName = entry && entry.playerUsername ? entry.playerUsername : "Allenatore";
  var subjectName = entry && entry.subjectName ? entry.subjectName : "";
  var secondarySubjectName = entry && entry.secondarySubjectName ? entry.secondarySubjectName : "";
  if (entry && entry.eventType === "starter") {
    return strongText(playerName) + " ha iniziato l'avventura con " + strongText(subjectName) + ", buon divertimento!";
  }
  if (entry && entry.eventType === "capture") {
    return strongText(playerName) + " ha catturato " + strongText(subjectName) + ", un Pokémon particolarmente raro, continua così!";
  }
  if (entry && entry.eventType === "badge") {
    return strongText(playerName) + " ha conquistato la " + strongText("Medaglia " + badgeSubjectName(subjectName)) + ", complimenti!";
  }
  if (entry && entry.eventType === "league") {
    return strongText(playerName) + " ha sconfitto " + strongText(subjectName) + ", complimenti!";
  }
  if (entry && entry.eventType === "evolution") {
    return strongText(subjectName) + " di " + strongText(playerName) + " si è evoluto in " + strongText(secondarySubjectName) + "!";
  }
  return "";
}

function renderAdminActivityText(entry) {
  var subjectName = entry && entry.subjectName ? entry.subjectName : "";
  if (!entry || entry.eventType !== "admin_message") {
    return "";
  }
  return '<strong class="home-activity-service-label">Comunicazione di servizio</strong>: ' + renderAdminMessageText(subjectName);
}

function renderActivityPanelBody(feed, rows, emptyText, renderEntry) {
  var body;
  if (feed.error) {
    body = '<p class="home-activity-empty">' + escapeHtml(feed.error) + "</p>";
  } else if (!feed.loaded) {
    body = '<p class="home-activity-empty">Caricamento attività; recenti...</p>';
  } else if (!rows.length) {
    body = '<p class="home-activity-empty">' + emptyText + "</p>";
  } else {
    body = '<ul class="home-activity-list">' + rows.map(function (entry) {
      var text = renderEntry(entry);
      return text ? '<li class="home-activity-item">' + text + "</li>" : "";
    }).join("") + "</ul>";
  }
  return body;
}

function renderUserActivityFeedPanel(feed, rows, selectedDashboard) {
  var body = renderActivityPanelBody(feed, rows, "Nessuna attività; recente.", renderActivityText);
  return [
    '<section id="home-player-activity-panel" class="home-activity-panel is-player-panel' + (selectedDashboard === "players" ? " is-active" : "") + '" aria-label="Eventi GdR">',
    '  <h2 class="home-activity-header">Eventi GdR</h2>',
    '  <div class="home-activity-scroll">',
    body,
    "  </div>",
    "</section>"
  ].join("");
}

function renderAdminMessagesPanel(feed, rows, selectedDashboard) {
  var body = renderActivityPanelBody(feed, rows, "Nessun messaggio dell'admin.", renderAdminActivityText);
  return [
    '<section id="home-admin-activity-panel" class="home-activity-panel is-admin-panel' + (selectedDashboard === "admin" ? " is-active" : "") + '" aria-label="Avvisi">',
    '  <h2 class="home-activity-header">Avvisi</h2>',
    '  <div class="home-activity-scroll">',
    body,
    "  </div>",
    "</section>"
  ].join("");
}

function renderActivityDashboardTabs(selectedDashboard) {
  return [
    '<div class="home-activity-dashboard-tabs" aria-label="Seleziona dashboard">',
    button("Eventi GdR", "home-activity-dashboard-select", 'data-dashboard="players" aria-controls="home-player-activity-panel" aria-pressed="' + (selectedDashboard === "players" ? "true" : "false") + '"', "home-activity-dashboard-tab is-player-tab" + (selectedDashboard === "players" ? " is-active" : "")),
    button("Avvisi", "home-activity-dashboard-select", 'data-dashboard="admin" aria-controls="home-admin-activity-panel" aria-pressed="' + (selectedDashboard === "admin" ? "true" : "false") + '"', "home-activity-dashboard-tab is-admin-tab" + (selectedDashboard === "admin" ? " is-active" : "")),
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
  function homeCard(title, action, imageFile, href, descKey) {
    var desc = descKey ? (ZONE_CARD_DESCRIPTIONS[descKey] || "") : "";
    var cardClass = imageFile ? "" : " home-zone-card-text-only";
    var mediaMarkup = imageFile ? [
      '  <div class="zone-card-media">',
      renderImage(assetPath("img_zone", imageFile), title, "zone-card-image"),
      "  </div>"
    ].join("") : "";

    return [
      '<a class="zone-card home-zone-card' + cardClass + '" href="' + escapeHtml(href) + '" data-action="' + escapeHtml(action) + '">',
      '  <h3 class="zone-card-title">' + escapeHtml(title) + "</h3>",
      mediaMarkup,
      desc ? '  <div class="zone-card-description">' + escapeHtml(desc) + "</div>" : "",
      "</a>"
    ].join("");
  }

  var cards = [
    homeCard("Regolamento", "open-rules", "regolamento_bottone.webp", "/rules", "rules"),
    homeCard("Zone cattura", "open-zones", "zone_cattura_bottone.webp", "/zones", "zones"),
    homeCard("Città", "open-city", "citta_bottone.webp", "/city", "city"),
    homeCard("Scheda", "open-team", "scheda_bottone.webp", "/team", "team"),
    homeCard("Box", "open-box", "box_bottone.webp", "/box", "box"),
    homeCard("Area Lotta", "open-battle-area", "area_lotta_bottone.webp", "/area-lotta", "battle_area"),
    homeCard("Lega Kanto", "open-gyms", "lega_kanto_bottone.webp", "/gyms", "gyms")
  ];

  if (isDebugUser()) {
    cards.push(homeCard("Stili", "open-styles", "", "/styles"));
  }

  var content = [
    '<div class="home-activity-dashboards">',
    renderActivityFeedSection(),
    "</div>",
    '<section class="home-grid">',
    cards.join(""),
    "</section>"
  ].join("");

  return sceneShell("Home", "", content, "", "scene-content-home", "parent-back", true);
}
