import { state } from "../client/game-state.js";
import { assetPath, escapeHtml, renderImage } from "../client/asset-helpers.js";
import { button, sceneShell } from "../client/render-utils.js";
import { resolveText, t } from "../client/i18n.js";

function battleLabel(row) {
  var type = String(row && row.battle_type || "");
  if (type === "gym_cinnabar_island") { return t("ui.admin.gym7"); }
  if (type === "gym_viridian_city") { return t("ui.admin.gym8"); }
  if (type === "training_debug") { return t("ui.admin.trainingDebug"); }
  if (type === "kanto_league_champion") { return t("ui.admin.champion"); }
  if (/^kanto_league_[1-4]$/.test(type)) { return t("ui.admin.eliteFour", { number: type.slice("kanto_league_".length) }); }
  return type || t("ui.admin.challengeFallback");
}

function waitingLabel(waitingFor) {
  if (waitingFor === "admin") { return t("ui.admin.adminTurn"); }
  if (waitingFor === "player") { return t("ui.admin.playerTurn"); }
  return waitingFor || "-";
}

function renderRows(rows) {
  if (!rows.length) {
    return '<div class="empty-state admin-battles-empty">' + escapeHtml(t("ui.admin.noBattles")) + '</div>';
  }
  return rows.map(function (row) {
    return [
      '<article class="admin-battle-row">',
      '  <h3 class="stack-title">' + escapeHtml(battleLabel(row)) + "</h3>",
      '  <p>' + escapeHtml(t("ui.admin.player")) + ': <strong>' + escapeHtml(row.player_username || row.auth_user_id || "-") + "</strong></p>",
      '  <p>' + escapeHtml(t("ui.admin.status")) + ': ' + escapeHtml(waitingLabel(row.waiting_for)) + "</p>",
      '  <p>' + escapeHtml(t("ui.admin.created")) + ': ' + escapeHtml(row.created_at || "-") + "</p>",
      button(t("ui.admin.openBattle"), "admin-battle-open", 'data-auth-user-id="' + escapeHtml(row.auth_user_id || "") + '" data-battle-id="' + escapeHtml(row.battle_id || "") + '"', "button-primary"),
      "</article>"
    ].join("");
  }).join("");
}

function renderAdminDashboardMessagePanel() {
  var messageState = state.adminDashboardMessage || { text: "", sending: false, error: "", notice: "" };
  var feedback = messageState.error
    ? '<p class="admin-dashboard-message-feedback is-error">' + escapeHtml(resolveText(messageState.error)) + "</p>"
    : messageState.notice
      ? '<p class="admin-dashboard-message-feedback is-notice">' + escapeHtml(resolveText(messageState.notice)) + "</p>"
      : "";
  return [
    '<section class="admin-dashboard-message-panel">',
    '  <h2 class="admin-dashboard-section-title">' + escapeHtml(t("ui.admin.eventDashboard")) + '</h2>',
    '  <label class="admin-dashboard-message-label" for="admin-dashboard-message-text">' + escapeHtml(t("ui.admin.serviceMessage")) + '</label>',
    '  <textarea id="admin-dashboard-message-text" class="admin-dashboard-message-input" data-field="admin-dashboard-message" maxlength="300" rows="3" placeholder="' + escapeHtml(t("ui.admin.messagePlaceholder")) + '"' + (messageState.sending ? " disabled" : "") + ">" + escapeHtml(messageState.text || "") + "</textarea>",
    '  <div class="admin-dashboard-message-actions">',
    button(t("ui.admin.send"), "admin-dashboard-message-send", messageState.sending ? "disabled" : "", "button-primary"),
    "  </div>",
    feedback,
    "</section>"
  ].join("");
}

function renderAdminAutomationPanel() {
  var automation = state.adminAutomation || { enabled: false, loading: false, saving: false, error: "" };
  var pending = automation.loading || automation.saving;
  var statusKey = automation.enabled ? "ui.admin.automationEnabled" : "ui.admin.automationDisabled";
  return [
    '<section class="admin-automation-panel">',
    '  <h2 class="admin-dashboard-section-title">' + escapeHtml(t("ui.admin.automationTitle")) + '</h2>',
    '  <p class="admin-automation-status">' + escapeHtml(t(pending ? "ui.admin.automationUpdating" : statusKey)) + '</p>',
    button(t(automation.enabled ? "ui.admin.disableAutomation" : "ui.admin.enableAutomation"), "admin-automation-toggle",
      pending ? "disabled" : "", automation.enabled ? "button-danger" : "button-primary"),
    automation.error ? '<p class="admin-dashboard-message-feedback is-error">' + escapeHtml(resolveText(automation.error)) + '</p>' : "",
    '</section>'
  ].join("");
}

export function renderAdminBattlesScene() {
  var adminState = state.adminBattles || { loading: false, rows: [], error: "" };
  var content;
  if (adminState.loading) {
    content = '<div class="empty-state">' + escapeHtml(t("ui.admin.loadingBattles")) + '</div>';
  } else {
    content = [
      adminState.error ? '<div class="empty-state">' + escapeHtml(resolveText(adminState.error)) + "</div>" : "",
      '<section class="admin-battles-list' + ((adminState.rows || []).length ? "" : " is-empty") + '">' + renderRows(adminState.rows || []) + "</section>"
    ].join("");
  }
  return sceneShell(t("ui.admin.activeBattles"), "", content, "", "scene-content-admin", "parent-back");
}

export function renderAdminHomeScene() {
  var content = [
    '<section class="admin-dashboard-grid">',
    '  <a class="admin-dashboard-card" href="/admin/battles" data-action="open-admin-battles">',
    '    <span class="admin-dashboard-card-media">' + renderImage(assetPath("img_miscellaneous", "ball_icon.webp"), t("ui.admin.activeBattles"), "admin-dashboard-card-image") + "</span>",
    '    <span class="admin-dashboard-card-title">' + escapeHtml(t("ui.admin.activeBattles")) + '</span>',
    '  </a>',
    '</section>',
    renderAdminAutomationPanel(),
    renderAdminDashboardMessagePanel()
  ].join("");
  return sceneShell(t("ui.admin.title"), "", content, "", "scene-content-admin scene-content-admin-home", "parent-back", true);
}

export function renderAdminBattleRestoreScene() {
  return sceneShell(t("ui.admin.battle"), "", '<div class="empty-state">' + escapeHtml(t("ui.admin.loadingBattle")) + '</div>', "", "scene-content-admin", "parent-back");
}
