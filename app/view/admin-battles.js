import { state } from "../client/game-state.js";
import { assetPath, escapeHtml, renderImage } from "../client/asset-helpers.js";
import { button, sceneShell } from "../client/render-utils.js";

function battleLabel(row) {
  var type = String(row && row.battle_type || "");
  if (type === "gym_isola-cannella") { return "Palestra 7 - Isola Cannella"; }
  if (type === "gym_smeraldopoli") { return "Palestra 8 - Smeraldopoli"; }
  if (type === "training_debug") { return "Zona Allenamento - Debug"; }
  if (type === "kanto_league_champion") { return "Campione Kanto"; }
  if (/^kanto_league_[1-4]$/.test(type)) { return "Superquattro " + type.slice("kanto_league_".length); }
  return type || "Sfida";
}

function waitingLabel(waitingFor) {
  if (waitingFor === "admin") { return "Tocca all'admin"; }
  if (waitingFor === "player") { return "Tocca al giocatore"; }
  return waitingFor || "-";
}

function renderRows(rows) {
  if (!rows.length) {
    return '<div class="empty-state admin-battles-empty">Nessuna sfida admin-controlled in corso.</div>';
  }
  return rows.map(function (row) {
    return [
      '<article class="admin-battle-row">',
      '  <h3 class="stack-title">' + escapeHtml(battleLabel(row)) + "</h3>",
      '  <p>Giocatore: <strong>' + escapeHtml(row.player_username || row.auth_user_id || "-") + "</strong></p>",
      '  <p>Stato: ' + escapeHtml(waitingLabel(row.waiting_for)) + "</p>",
      '  <p>Creata: ' + escapeHtml(row.created_at || "-") + "</p>",
      button("Apri sfida", "admin-battle-open", 'data-auth-user-id="' + escapeHtml(row.auth_user_id || "") + '" data-battle-id="' + escapeHtml(row.battle_id || "") + '"', "button-primary"),
      "</article>"
    ].join("");
  }).join("");
}

function renderAdminDashboardMessagePanel() {
  var messageState = state.adminDashboardMessage || { text: "", sending: false, error: "", notice: "" };
  var feedback = messageState.error
    ? '<p class="admin-dashboard-message-feedback is-error">' + escapeHtml(messageState.error) + "</p>"
    : messageState.notice
      ? '<p class="admin-dashboard-message-feedback is-notice">' + escapeHtml(messageState.notice) + "</p>"
      : "";
  return [
    '<section class="admin-dashboard-message-panel">',
    '  <h2 class="admin-dashboard-section-title">Dashboard eventi</h2>',
    '  <label class="admin-dashboard-message-label" for="admin-dashboard-message-text">Comunicazione di servizio</label>',
    '  <textarea id="admin-dashboard-message-text" class="admin-dashboard-message-input" data-field="admin-dashboard-message" maxlength="300" rows="3" placeholder="Scrivi un messaggio per la dashboard eventi..."' + (messageState.sending ? " disabled" : "") + ">" + escapeHtml(messageState.text || "") + "</textarea>",
    '  <div class="admin-dashboard-message-actions">',
    button("Invia", "admin-dashboard-message-send", messageState.sending ? "disabled" : "", "button-primary"),
    "  </div>",
    feedback,
    "</section>"
  ].join("");
}

export function renderAdminBattlesScene() {
  var adminState = state.adminBattles || { loading: false, rows: [], error: "" };
  var content;
  if (adminState.loading) {
    content = '<div class="empty-state">Caricamento sfide in corso...</div>';
  } else {
    content = [
      adminState.error ? '<div class="empty-state">' + escapeHtml(adminState.error) + "</div>" : "",
      '<section class="admin-battles-list' + ((adminState.rows || []).length ? "" : " is-empty") + '">' + renderRows(adminState.rows || []) + "</section>"
    ].join("");
  }
  return sceneShell("Sfide in corso", "", content, "", "scene-content-admin", "parent-back");
}

export function renderAdminHomeScene() {
  var content = [
    '<section class="admin-dashboard-grid">',
    '  <a class="admin-dashboard-card" href="/admin/battles" data-action="open-admin-battles">',
    '    <span class="admin-dashboard-card-media">' + renderImage(assetPath("img_miscellaneous", "ball_icon.webp"), "Sfide in corso", "admin-dashboard-card-image") + "</span>",
    '    <span class="admin-dashboard-card-title">Sfide in corso</span>',
    '  </a>',
    '</section>',
    renderAdminDashboardMessagePanel()
  ].join("");
  return sceneShell("Admin", "", content, "", "scene-content-admin scene-content-admin-home", "parent-back", true);
}

export function renderAdminBattleRestoreScene() {
  return sceneShell("Sfida", "", '<div class="empty-state">Caricamento sfida in corso...</div>', "", "scene-content-admin", "parent-back");
}
