import { state } from "../client/game-state.js";
import { escapeHtml } from "../client/asset-helpers.js";
import { button, sceneShell } from "../client/render-utils.js";

function fieldValueAttr(value) {
  return value ? ' value="' + escapeHtml(value) + '"' : "";
}

function authFeedback() {
  if (state.auth.error) {
    return '<p class="auth-error">' + escapeHtml(state.auth.error) + "</p>";
  }
  if (state.auth.message) {
    return '<p class="auth-message">' + escapeHtml(state.auth.message) + "</p>";
  }
  return "";
}

function loadingText() {
  var loadState = state.playerLoadStatus || {};
  var message = loadState.state === "loading" && loadState.message ? loadState.message : "Connessione in corso...";
  return state.auth.loading ? '<p class="stack-note auth-loading-message" role="status" aria-live="polite">' + escapeHtml(message) + '</p>' : "";
}

function authTabs(mode, disabled) {
  if (mode === "reset-password") {
    return "";
  }
  return [
    '<div class="auth-tabs" role="tablist" aria-label="Accesso account">',
    button("Accesso", "auth-mode-login", disabled, mode === "login" ? "button-primary auth-tab-active" : "button-dark"),
    button("Registrazione", "auth-mode-register", disabled, mode === "register" ? "button-primary auth-tab-active" : "button-dark"),
    "</div>"
  ].join("");
}

function renderLoginForm(disabled) {
  return [
    '  <form class="auth-form" data-auth-form="login" data-auth-submit-action="auth-login">',
    '    <div class="field">',
    '      <label for="auth-login-username">Nome utente</label>',
    '      <input id="auth-login-username" data-field="auth-username" type="text" autocomplete="username" minlength="3" maxlength="12" pattern="[A-Za-z0-9_]{3,12}"' + fieldValueAttr(state.auth.usernameDraft) + " required>",
    "    </div>",
    '    <div class="field">',
    '      <label for="auth-login-password">Password</label>',
    '      <input id="auth-login-password" data-field="auth-password" type="password" autocomplete="current-password" minlength="6" required>',
    "    </div>",
    '    <p class="auth-inline-note"><button type="button" data-action="auth-mode-recover">Non ricordi la password?</button></p>',
    authFeedback(),
    loadingText(),
    '    <div class="button-row">',
    button("Accedi", "auth-login", disabled, "button-accent"),
    "    </div>",
    "  </form>"
  ].join("");
}

function renderRegisterForm(disabled) {
  return [
    '  <form class="auth-form" data-auth-form="register" data-auth-submit-action="auth-register">',
    '    <div class="field">',
    '      <label for="auth-register-username">Utente</label>',
    '      <input id="auth-register-username" data-field="auth-username" type="text" autocomplete="username" minlength="3" maxlength="12" pattern="[A-Za-z0-9_]{3,12}"' + fieldValueAttr(state.auth.usernameDraft) + " required>",
    "    </div>",
    '    <div class="field">',
    '      <label for="auth-register-password">Password</label>',
    '      <input id="auth-register-password" data-field="auth-password" type="password" autocomplete="new-password" minlength="6" required>',
    "    </div>",
    '    <div class="field">',
    '      <label for="auth-register-email">Email</label>',
    '      <input id="auth-register-email" data-field="auth-email" type="email" autocomplete="email"' + fieldValueAttr(state.auth.emailDraft) + ">",
    "    </div>",
    "    <p class='auth-inline-note'>L'email è facoltativa, ma senza non potrai recuperare la password</p>",
    authFeedback(),
    loadingText(),
    '    <div class="button-row">',
    button("Registrati", "auth-register", disabled, "button-accent"),
    "    </div>",
    "  </form>"
  ].join("");
}

function renderRecoveryForm(disabled) {
  return [
    '  <h2 class="stack-title">Recupera password</h2>',
    "  <p class='auth-description'>Inserisci nome utente ed email indicati in registrazione. Se i dati corrispondono, riceverai un link per scegliere una nuova password.</p>",
    '  <form class="auth-form" data-auth-form="recover" data-auth-submit-action="auth-recover">',
    '    <div class="field">',
    '      <label for="auth-recover-username">Nome utente</label>',
    '      <input id="auth-recover-username" data-field="auth-username" type="text" autocomplete="username" minlength="3" maxlength="12" pattern="[A-Za-z0-9_]{3,12}"' + fieldValueAttr(state.auth.usernameDraft) + " required>",
    "    </div>",
    '    <div class="field">',
    '      <label for="auth-recover-email">Email</label>',
    '      <input id="auth-recover-email" data-field="auth-email" type="email" autocomplete="email"' + fieldValueAttr(state.auth.emailDraft) + " required>",
    "    </div>",
    authFeedback(),
    loadingText(),
    '    <div class="button-row">',
    button("Invia email", "auth-recover", disabled, "button-primary"),
    "    </div>",
    "  </form>"
  ].join("");
}

function renderPasswordResetForm(disabled) {
  return [
    '  <h2 class="stack-title">Imposta nuova password</h2>',
    "  <p class='auth-description'>Scegli una nuova password per completare il recupero account.</p>",
    '  <form class="auth-form" data-auth-form="reset-password" data-auth-submit-action="auth-reset-password">',
    '    <div class="field">',
    '      <label for="auth-new-password">Nuova password</label>',
    '      <input id="auth-new-password" data-field="auth-new-password" type="password" autocomplete="new-password" minlength="6" required>',
    "    </div>",
    authFeedback(),
    loadingText(),
    '    <div class="button-row">',
    button("Aggiorna password", "auth-reset-password", disabled, "button-primary"),
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

  return sceneShell("Accesso Pokémon Game", "", form, "", "scene-content-auth");
}
