import {
  deletePlayerAccount,
  getCurrentSession,
  isSupabaseConfigured,
  loginWithUsername,
  logout,
  onAuthStateChange,
  registerWithUsername,
  requestPasswordRecovery,
  updateCurrentUserPassword
} from "../api/supabase.js";
import { loadPlayerSave } from "../api/player.js";
import { openMessage } from "./dialog-handler.js";
import { render, setScene } from "./renderer.js";
import { clearSceneHistory, sceneFromCurrentLocation } from "./router.js";
import { applyPlayerSave, resetPlayerState, state } from "./game-state.js";
import { clearPendingActivityRuntime, setBattleRuntimeActive, setPendingActivityRuntime } from "./battle-scene-lock.js";
import { evaluateBattleStateAfterAuth, resumeAuthoritativeOrdinaryProgression, resumeAuthoritativeTrainingProgression } from "./battle-handler.js";
import { recoverPendingAuthoritativeDebugTrainingStart, recoverPreparedAuthoritativeTraining } from "./training-zone-handler.js";
import { refreshMissionState } from "./mission-runtime.js";
import { openAdminBattle, refreshAdminAutomation, refreshAdminBattles } from "./admin-battle-handler.js";
import { readServerRoles } from "../api/battle.js";
import { currentUserIsAdmin } from "./admin-auth.js";
import { messageDescriptor } from "./i18n.js";

var activeUserId = null;
var PLAYER_SAVE_RETRY_DELAY_MS = 1000;

function authResultMessage(result, fallbackKey) {
  var code = String(result && result.code || "");
  var keys = {
    invalid_username: "invalidUsername", password_too_short: "passwordTooShort",
    invalid_optional_email: "invalidOptionalEmail", invalid_email: "invalidEmail",
    missing_configuration: "missingConfiguration", data_unavailable: "dataUnavailable",
    password_unchanged: "passwordUnchanged", invalid_credentials: "invalidCredentials",
    invalid_login_session: "invalidLoginSession", open_session_failed: "openSessionFailed",
    registration_failed: "registrationFailed", recovery_failed: "recoveryFailed",
    password_update_failed: "passwordUpdateFailed", delete_account_failed: "deleteFailed"
  };
  if (code === "rate_limited") {
    return messageDescriptor(result.retrySeconds ? "auth.rateLimitedSeconds" : "auth.rateLimited", { seconds: result.retrySeconds });
  }
  return messageDescriptor("auth." + (keys[code] || fallbackKey || "genericFailed"));
}

function isPasswordRecoveryRoute() {
  if (typeof window === "undefined") { return false; }
  return String(window.location.pathname || "").replace(/\/+$/g, "") === "/auth/recovery";
}

function isPublicLegalScene(scene) {
  return scene && (scene.name === "privacy-policy" || scene.name === "terms");
}

function wait(ms) {
  return new Promise(function (resolve) {
    window.setTimeout(resolve, ms);
  });
}

function hasPasswordRecoveryUrlParams() {
  var search;
  var hash;
  if (typeof window === "undefined") { return false; }
  search = String(window.location.search || "");
  hash = String(window.location.hash || "");
  return /(?:^|[?&#])type=recovery(?:$|&)/.test(search) || /(?:^|[?&#])type=recovery(?:$|&)/.test(hash);
}

function isPasswordRecoveryFlow(recoveryFlowAtStartup) {
  return Boolean(recoveryFlowAtStartup) || isPasswordRecoveryRoute() || hasPasswordRecoveryUrlParams();
}

function usernameFromSession(session) {
  var metadataUsername = session && session.user && session.user.user_metadata
    ? session.user.user_metadata.username || ""
    : "";
  var email = session && session.user ? String(session.user.email || "") : "";
  if (metadataUsername) {
    return metadataUsername;
  }
  if (/@pokemon-game-revival\.local$/i.test(email)) {
    return email.replace(/@pokemon-game-revival\.local$/i, "");
  }
  return "";
}

function showLogin(error) {
  var scene = sceneFromCurrentLocation();
  clearPendingActivityRuntime();
  setBattleRuntimeActive(false);
  activeUserId = null;
  state.auth.ready = true;
  state.auth.loading = false;
  state.auth.session = null;
  state.auth.user = null;
  state.auth.serverRoles = [];
  state.auth.error = error || "";
  state.auth.message = "";
  state.auth.mode = "login";
  state.auth.emailDraft = "";
  resetPlayerState();
  clearSceneHistory();
  setScene(isPublicLegalScene(scene) ? scene : { name: "login" }, { history: "replace" });
}

function showPasswordReset(session) {
  if (!session || !session.user) {
    showLogin(messageDescriptor("auth.invalidRecoverySession"));
    return;
  }
  activeUserId = session.user.id;
  clearPendingActivityRuntime();
  setBattleRuntimeActive(false);
  state.auth.ready = true;
  state.auth.loading = false;
  state.auth.session = session;
  state.auth.user = session.user;
  state.auth.error = "";
  state.auth.message = "";
  state.auth.mode = "reset-password";
  resetPlayerState();
  clearSceneHistory();
  setScene({ name: "login", authMode: "reset-password" }, { history: "replace" });
}

function restoreSceneFromSession() {
  try {
    var name = sessionStorage.getItem("pokemon_game_revival:scene_name");
    if (name && name !== "login" && name !== "starter" && name !== "battle" && name !== "battle-restore" && name !== "battle-dome-battle") {
      return { name: name };
    }
  } catch (e) {}
  return null;
}

function initialSceneAfterLogin() {
  var scene = sceneFromCurrentLocation();
  var isAdmin = currentUserIsAdmin();
  if (scene && scene.invalidRoute) {
    if (isAdmin) {
      return { name: "admin-home" };
    }
    return state.playerLoadStatus && state.playerLoadStatus.state === "new-player"
      ? { name: "starter" }
      : { name: "home" };
  }
  if (!scene || scene.name === "home" || scene.name === "login" || scene.name === "city") {
    scene = restoreSceneFromSession() || scene;
  }
  if (isAdmin) {
    return scene && String(scene.name || "").indexOf("admin-") === 0 ? scene : { name: "admin-home" };
  }
  if (state.playerLoadStatus && state.playerLoadStatus.state === "new-player" && !isPublicLegalScene(scene)) {
    return { name: "starter" };
  }
  if (!scene || scene.name === "login" || scene.name === "starter") {
    return { name: "home" };
  }
  return scene;
}

export async function startAuthenticatedSession(session) {
  var loaded;
  var nextScene;
  var sessionUserId;
  if (!session || !session.user) {
    showLogin("");
    return;
  }

  sessionUserId = session.user.id;
  activeUserId = sessionUserId;
  clearSceneHistory();
  state.auth.ready = true;
  state.auth.loading = true;
  state.auth.session = session;
  state.auth.user = session.user;
  state.auth.serverRoles = [];
  state.auth.error = "";
  state.auth.message = "";
  state.playerLoadStatus = { state: "loading", message: messageDescriptor("auth.saveLoading") };
  state.playerName = usernameFromSession(session);
  render();

  var roleResult = await readServerRoles();
  if (activeUserId !== sessionUserId) { return; }
  state.auth.serverRoles = roleResult.ok ? roleResult.roles : [];
  loaded = await loadPlayerSave();
  while (activeUserId === sessionUserId && loaded && !loaded.ok && loaded.incompleteSave) {
    state.playerLoadStatus = { state: "loading", message: messageDescriptor("auth.saveLoading") };
    render();
    await wait(PLAYER_SAVE_RETRY_DELAY_MS);
    if (activeUserId !== sessionUserId) {
      return;
    }
    loaded = await loadPlayerSave();
  }
  if (activeUserId !== sessionUserId) {
    return;
  }
  if (loaded.ok && loaded.save) {
    applyPlayerSave(loaded.save);
    state.playerLoadStatus = { state: "ready", message: "" };
    if (state.pendingActivity) {
      setPendingActivityRuntime(state.pendingActivity);
    }
  } else if (loaded.ok) {
    resetPlayerState();
    state.playerLoadStatus = { state: "new-player", message: "" };
  } else {
    state.auth.loading = false;
    state.auth.error = messageDescriptor("auth.saveLoadFailed");
    state.playerLoadStatus = {
      state: "error",
      message: messageDescriptor("auth.saveLoadFailed")
    };
    state.saveStatus = {
      state: "error",
      message: messageDescriptor("auth.saveLoadFailed")
    };
    setScene({ name: "login" }, { history: "replace" });
    return;
  }

  state.auth.loading = false;
  state.auth.userLabel = usernameFromSession(session);
  state.playerName = state.auth.userLabel;
  nextScene = initialSceneAfterLogin();
  setScene(nextScene, { history: "replace" });
  if (nextScene && nextScene.name === "admin-battle-restore") {
    openAdminBattle(nextScene.playerAuthUserId || "", nextScene.battleId || "");
  } else if (nextScene && nextScene.name === "admin-battles") {
    refreshAdminBattles();
  } else if (nextScene && nextScene.name === "admin-home") {
    refreshAdminAutomation({ silent: true });
  }
  // The administration account intentionally has no player_state_revision.
  // Player battle/progression recovery would call prepare_edge_battle_command
  // with the admin user id and produce a misleading P0002 PostgreSQL error.
  if (currentUserIsAdmin()) {
    return;
  }
  recoverPendingAuthoritativeDebugTrainingStart({ silent: true }).then(function () {
    return recoverPreparedAuthoritativeTraining({ history: "replace" });
  }).then(function (preparedTrainingRecovered) {
    if (preparedTrainingRecovered) { return false; }
    return evaluateBattleStateAfterAuth();
  }).then(function () {
    if (!state.activeBattle && state.authoritativeLeagueState
      && state.authoritativeLeagueState.status === "awaiting_battle") {
      setScene({ name: "gym-city", cityKey: "elite_four" }, { history: "replace" });
    } else if (!state.activeBattle && state.pendingActivity && state.pendingActivity.type === "ordinary_progression") {
      resumeAuthoritativeOrdinaryProgression();
    } else if (!state.activeBattle && state.pendingActivity && state.pendingActivity.type === "training_progression") {
      resumeAuthoritativeTrainingProgression();
    } else if (!state.activeBattle && state.pendingActivity && state.pendingActivity.type === "daycare_withdraw") {
      if (!state.scene || state.scene.name !== "city-daycare") {
        setScene({ name: "city-daycare", daycareDepositSlotIndex: null }, { history: "replace" });
      }
      import("./daycare-handler.js").then(function (module) {
        module.resumePendingDaycareWithdraw();
      });
    }
  });
  refreshMissionState({ renderOnComplete: true });
  if (state.playerLoadStatus.state === "ready") {
    import("./battle-dome-handler.js").then(function (module) {
      return module.refreshBattleDomeState({ silent: true });
    }).then(function () { render(); });
  }
}

export async function initializeSession() {
  var session;
  var recoveryFlowAtStartup;
  if (!isSupabaseConfigured()) {
    showLogin(messageDescriptor("auth.missingConfiguration"));
    return;
  }

  recoveryFlowAtStartup = isPasswordRecoveryFlow(false);

  state.auth.ready = false;
  state.auth.loading = true;
  render();

  onAuthStateChange(function (event, nextSession) {
    if (event === "PASSWORD_RECOVERY") {
      showPasswordReset(nextSession);
      return;
    }
    if (event === "SIGNED_IN" && isPasswordRecoveryFlow(false)) {
      showPasswordReset(nextSession);
      return;
    }
    if (event === "SIGNED_OUT") {
      showLogin("");
      return;
    }
    if (event === "SIGNED_IN") {
      return;
    }
  });

  try {
    session = await getCurrentSession();
    if (session && isPasswordRecoveryFlow(recoveryFlowAtStartup)) {
      showPasswordReset(session);
    } else if (session) {
      await startAuthenticatedSession(session);
    } else {
      showLogin("");
    }
  } catch (error) {
    showLogin(messageDescriptor("auth.sessionInitFailed"));
  }

}

export function setAuthMode(mode) {
  state.auth.mode = mode || "login";
  state.auth.error = "";
  state.auth.message = "";
  render();
}

export async function submitLogin(username, password) {
  var result;
  state.auth.loading = true;
  state.auth.error = "";
  state.auth.mode = "login";
  state.auth.message = "";
  state.auth.usernameDraft = username;
  render();
  result = await loginWithUsername(username, password);
  if (!result.ok) {
    state.auth.loading = false;
    state.auth.error = authResultMessage(result, "invalidCredentials");
    render();
    return result;
  }
  await startAuthenticatedSession(result.session);
  return result;
}

export async function submitRegistration(username, password, recoveryEmail) {
  var result;
  state.auth.loading = true;
  state.auth.error = "";
  state.auth.message = "";
  state.auth.usernameDraft = username;
  state.auth.emailDraft = recoveryEmail || "";
  render();
  result = await registerWithUsername(username, password, recoveryEmail);
  if (!result.ok) {
    state.auth.loading = false;
    state.auth.error = authResultMessage(result, "registrationFailed");
    render();
    return result;
  }
  await startAuthenticatedSession(result.session);
  return result;
}

export async function submitPasswordRecovery(username, recoveryEmail) {
  var result;
  state.auth.loading = true;
  state.auth.error = "";
  state.auth.message = "";
  state.auth.usernameDraft = username;
  state.auth.emailDraft = recoveryEmail;
  render();
  result = await requestPasswordRecovery(username, recoveryEmail);
  state.auth.loading = false;
  if (!result.ok) {
    state.auth.error = authResultMessage(result, "recoveryFailed");
    render();
    return result;
  }
  state.auth.message = messageDescriptor("auth.recoveryRequested");
  render();
  return result;
}

export async function submitRecoveredPassword(password) {
  var result;
  state.auth.loading = true;
  state.auth.error = "";
  state.auth.message = "";
  render();
  result = await updateCurrentUserPassword(password);
  if (!result.ok) {
    state.auth.loading = false;
    state.auth.error = authResultMessage(result, "passwordUpdateFailed");
    render();
    return result;
  }
  await logout();
  showLogin("");
  state.auth.message = messageDescriptor("auth.passwordUpdated");
  render();
  return result;
}

export async function submitLogout() {
  state.auth.loading = true;
  render();
  await logout();
  showLogin("");
}

export async function submitAccountDeletion() {
  var result;
  state.auth.loading = true;
  state.auth.error = "";
  render();

  result = await deletePlayerAccount();
  if (!result.ok) {
    state.auth.loading = false;
    openMessage([authResultMessage(result, "deleteFailed")], {
      title: messageDescriptor("auth.deleteTitle"),
      closeClass: "button-danger"
    });
    return result;
  }

  showLogin("");
  return result;
}
