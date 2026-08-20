import { state } from "../client/game-state.js";
import { escapeHtml } from "../client/asset-helpers.js";
import { resolveText, t } from "../client/i18n.js";
import { button, sceneShell } from "../client/render-utils.js";

function fieldValueAttr(value) {
  return value ? ' value="' + escapeHtml(value) + '"' : "";
}

function authFeedback() {
  if (state.auth.error) {
    return '<p class="auth-error">' + escapeHtml(resolveText(state.auth.error)) + "</p>";
  }
  if (state.auth.message) {
    return '<p class="auth-message">' + escapeHtml(resolveText(state.auth.message)) + "</p>";
  }
  return "";
}

function loadingText() {
  var loadState = state.playerLoadStatus || {};
  var message = loadState.state === "loading" && loadState.message ? loadState.message : t("ui.auth.connecting");
  return state.auth.loading ? '<p class="stack-note auth-loading-message" role="status" aria-live="polite">' + escapeHtml(resolveText(message)) + '</p>' : "";
}

function authTabs(mode, disabled) {
  if (mode === "reset-password") {
    return "";
  }
  return [
    '<div class="auth-tabs" role="tablist" aria-label="' + escapeHtml(t("ui.auth.tabsAria")) + '">',
    button(t("ui.auth.loginTab"), "auth-mode-login", disabled, mode === "login" ? "button-primary auth-tab-active" : "button-dark"),
    button(t("ui.auth.registerTab"), "auth-mode-register", disabled, mode === "register" ? "button-primary auth-tab-active" : "button-dark"),
    "</div>"
  ].join("");
}

function renderLoginForm(disabled) {
  return [
    '  <form class="auth-form" data-auth-form="login" data-auth-submit-action="auth-login">',
    '    <div class="field">',
    '      <label for="auth-login-username">' + escapeHtml(t("ui.auth.username")) + '</label>',
    '      <input id="auth-login-username" data-field="auth-username" type="text" autocomplete="username" minlength="3" maxlength="12" pattern="[A-Za-z0-9_]{3,12}"' + fieldValueAttr(state.auth.usernameDraft) + " required>",
    "    </div>",
    '    <div class="field">',
    '      <label for="auth-login-password">' + escapeHtml(t("ui.auth.password")) + '</label>',
    '      <input id="auth-login-password" data-field="auth-password" type="password" autocomplete="current-password" minlength="6" required>',
    "    </div>",
    '    <p class="auth-inline-note"><button type="button" data-action="auth-mode-recover">' + escapeHtml(t("ui.auth.forgotPassword")) + '</button></p>',
    authFeedback(),
    loadingText(),
    '    <div class="button-row">',
    button(t("ui.auth.login"), "auth-login", disabled, "button-accent"),
    "    </div>",
    "  </form>"
  ].join("");
}

function renderRegisterForm(disabled) {
  return [
    '  <form class="auth-form" data-auth-form="register" data-auth-submit-action="auth-register">',
    '    <div class="field">',
    '      <label for="auth-register-username">' + escapeHtml(t("ui.auth.username")) + '</label>',
    '      <input id="auth-register-username" data-field="auth-username" type="text" autocomplete="username" minlength="3" maxlength="12" pattern="[A-Za-z0-9_]{3,12}"' + fieldValueAttr(state.auth.usernameDraft) + " required>",
    "    </div>",
    '    <div class="field">',
    '      <label for="auth-register-password">' + escapeHtml(t("ui.auth.password")) + '</label>',
    '      <input id="auth-register-password" data-field="auth-password" type="password" autocomplete="new-password" minlength="6" required>',
    "    </div>",
    '    <div class="field">',
    '      <label for="auth-register-email">' + escapeHtml(t("ui.auth.email")) + '</label>',
    '      <input id="auth-register-email" data-field="auth-email" type="email" autocomplete="email"' + fieldValueAttr(state.auth.emailDraft) + ">",
    "    </div>",
    "    <p class='auth-inline-note'>" + escapeHtml(t("ui.auth.optionalEmail")) + "</p>",
    authFeedback(),
    loadingText(),
    '    <div class="button-row">',
    button(t("ui.auth.register"), "auth-register", disabled, "button-accent"),
    "    </div>",
    "  </form>"
  ].join("");
}

function renderRecoveryForm(disabled) {
  return [
    '  <h2 class="stack-title">' + escapeHtml(t("ui.auth.recoverTitle")) + '</h2>',
    "  <p class='auth-description'>" + escapeHtml(t("ui.auth.recoverDescription")) + "</p>",
    '  <form class="auth-form" data-auth-form="recover" data-auth-submit-action="auth-recover">',
    '    <div class="field">',
    '      <label for="auth-recover-username">' + escapeHtml(t("ui.auth.username")) + '</label>',
    '      <input id="auth-recover-username" data-field="auth-username" type="text" autocomplete="username" minlength="3" maxlength="12" pattern="[A-Za-z0-9_]{3,12}"' + fieldValueAttr(state.auth.usernameDraft) + " required>",
    "    </div>",
    '    <div class="field">',
    '      <label for="auth-recover-email">' + escapeHtml(t("ui.auth.email")) + '</label>',
    '      <input id="auth-recover-email" data-field="auth-email" type="email" autocomplete="email"' + fieldValueAttr(state.auth.emailDraft) + " required>",
    "    </div>",
    authFeedback(),
    loadingText(),
    '    <div class="button-row">',
    button(t("ui.auth.sendEmail"), "auth-recover", disabled, "button-primary"),
    "    </div>",
    "  </form>"
  ].join("");
}

function renderPasswordResetForm(disabled) {
  return [
    '  <h2 class="stack-title">' + escapeHtml(t("ui.auth.resetTitle")) + '</h2>',
    "  <p class='auth-description'>" + escapeHtml(t("ui.auth.resetDescription")) + "</p>",
    '  <form class="auth-form" data-auth-form="reset-password" data-auth-submit-action="auth-reset-password">',
    '    <div class="field">',
    '      <label for="auth-new-password">' + escapeHtml(t("ui.auth.newPassword")) + '</label>',
    '      <input id="auth-new-password" data-field="auth-new-password" type="password" autocomplete="new-password" minlength="6" required>',
    "    </div>",
    authFeedback(),
    loadingText(),
    '    <div class="button-row">',
    button(t("ui.auth.updatePassword"), "auth-reset-password", disabled, "button-primary"),
    "    </div>",
    "  </form>"
  ].join("");
}

export function renderLoginScene() {
  var disabled = state.auth.loading ? "disabled" : "";
  var mode = state.scene && state.scene.authMode === "reset-password" ? "reset-password" : state.auth.mode || "login";
  var panel;

  if (mode === "register") {
    panel = renderRegisterForm(disabled);
  } else if (mode === "recover") {
    panel = renderRecoveryForm(disabled);
  } else if (mode === "reset-password") {
    panel = renderPasswordResetForm(disabled);
  } else {
    panel = renderLoginForm(disabled);
  }

  var form = [
    '<section class="panel auth-panel"><div class="panel-inner stack">',
    authTabs(mode, disabled),
    panel,
    "</div></section>"
  ].join("");

  return sceneShell(t("ui.auth.sceneTitle"), "", form, "", "scene-content-auth");
}
