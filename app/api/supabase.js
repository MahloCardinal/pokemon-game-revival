import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.108.2/+esm";
import { resolveSupabaseRuntimeConfig } from "./supabase-config.js";

var supabaseClient = null;
var USERNAME_AUTH_DOMAIN = "pokemon-game-revival.local";

function runtimeConfig() {
  var explicitConfig = null;
  if (typeof window !== "undefined") {
    explicitConfig = window.POKEMON_GAME_REVIVAL_SUPABASE || null;
  }
  return resolveSupabaseRuntimeConfig(explicitConfig);
}

export function getRuntimeEnvironment() {
  var config = runtimeConfig();
  return { name: config.environment, label: config.environmentLabel };
}

export function isSupabaseConfigured() {
  var config = runtimeConfig();
  return Boolean(config.url && config.publishableKey);
}

export function getSupabaseClient() {
  var config;
  if (supabaseClient) { return supabaseClient; }
  config = runtimeConfig();
  if (!config.url || !config.publishableKey) { return null; }
  supabaseClient = createClient(config.url, config.publishableKey, {
    auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true }
  });
  return supabaseClient;
}

function authSessionIdentity(session) {
  var token = String(session && session.access_token || "");
  var encodedPayload = token.split(".")[1] || "";
  var payload;
  try {
    encodedPayload = encodedPayload.replace(/-/g, "+").replace(/_/g, "/");
    while (encodedPayload.length % 4) { encodedPayload += "="; }
    payload = JSON.parse(globalThis.atob(encodedPayload));
  } catch (error) {
    payload = null;
  }
  return String(session && session.user && session.user.id || "") + ":"
    + String(payload && payload.session_id || "");
}

async function authenticatedSessionContext(client) {
  var result;
  var session;
  if (!client) {
    return { ok: false, code: "missing_configuration", detail: "Supabase is not configured." };
  }
  try {
    result = await client.auth.getSession();
  } catch (error) {
    return { ok: false, code: "invalid_session", detail: error && error.message || "Session check failed." };
  }
  session = result && result.data ? result.data.session : null;
  if (result && result.error || !session || !session.access_token || !session.user || !session.user.id) {
    return {
      ok: false,
      code: "invalid_session",
      detail: result && result.error && result.error.message || "The authenticated session is unavailable."
    };
  }
  return {
    ok: true,
    session: session,
    accessToken: session.access_token,
    userId: session.user.id,
    sessionIdentity: authSessionIdentity(session)
  };
}

async function authenticatedSessionStillMatches(client, context) {
  var current = await authenticatedSessionContext(client);
  return Boolean(current.ok && context && current.sessionIdentity === context.sessionIdentity);
}

async function invokePublicEdgeFunction(functionName, options) {
  var client = getSupabaseClient();
  var config = runtimeConfig();
  var invokeOptions;
  if (!client || !config.publishableKey) {
    return { data: null, error: new Error("Supabase is not configured.") };
  }
  invokeOptions = Object.assign({}, options || {});
  invokeOptions.headers = Object.assign({}, invokeOptions.headers || {}, {
    apikey: config.publishableKey
  });
  try {
    return await client.functions.invoke(String(functionName || ""), invokeOptions);
  } catch (error) {
    return { data: null, error: error };
  }
}

export async function invokeAuthenticatedEdgeFunction(functionName, options) {
  var client = getSupabaseClient();
  var config = runtimeConfig();
  var context = await authenticatedSessionContext(client);
  var invokeOptions;
  var result;
  if (!context.ok) {
    return { data: null, error: null, authError: context, requestStarted: false };
  }
  invokeOptions = Object.assign({}, options || {});
  invokeOptions.headers = Object.assign({}, invokeOptions.headers || {}, {
    apikey: config.publishableKey,
    Authorization: "Bearer " + context.accessToken
  });
  try {
    result = await client.functions.invoke(String(functionName || ""), invokeOptions);
  } catch (error) {
    result = { data: null, error: error };
  }
  if (!await authenticatedSessionStillMatches(client, context)) {
    return {
      data: null,
      error: null,
      authError: {
        ok: false,
        code: "stale_session",
        detail: "The authenticated session changed while the request was running.",
        uncertain: true
      },
      requestStarted: true
    };
  }
  return Object.assign({}, result, { authError: null, requestStarted: true });
}

export async function currentUserId(client) {
  var context = await authenticatedSessionContext(client);
  if (!context.ok) {
    return { ok: false, code: context.code, detail: context.detail || "", userId: null };
  }
  return { ok: true, userId: context.userId };
}

export async function runQuery(resultPromise) {
  var result = await resultPromise;
  if (result.error) { return { ok: false, code: "query_failed", detail: result.error.message || "" }; }
  return { ok: true };
}

export function translateSupabaseErrorMessage(message) {
  var text = String(message || "");
  if (/could not query the database for the schema cache|PGRST002/i.test(text)) {
    return "The data service is temporarily unavailable.";
  }
  if (/insufficient Battle Points/i.test(text)) {
    return "Insufficient Battle Points.";
  }
  return text;
}

export function dailyLimitTableIsMissing(error) {
  var code = String(error && error.code || "");
  var message = String(error && error.message || "");
  return code === "42P01" || code === "PGRST205" || message.indexOf("player_daily_limits") !== -1 && message.indexOf("schema cache") !== -1;
}

function normalizeUsername(username) {
  return String(username || "").trim();
}

function usernameToAuthEmail(username) {
  return normalizeUsername(username).toLowerCase() + "@" + USERNAME_AUTH_DOMAIN;
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(email || ""));
}

function authFailure(message, fallbackCode) {
  var text = String(message || "");
  var secondsMatch;
  if (/could not query the database for the schema cache|PGRST002/i.test(text)) {
    return { ok: false, code: "data_unavailable", detail: text };
  }
  if (/security/i.test(text) && /request/i.test(text) && /second/i.test(text)) {
    secondsMatch = text.match(/(\d+)\s*second/i);
    return { ok: false, code: "rate_limited", retrySeconds: secondsMatch ? Number(secondsMatch[1]) : null, detail: text };
  }
  if (/new password should be different from the old password/i.test(text)) {
    return { ok: false, code: "password_unchanged", detail: text };
  }
  if (/invalid login credentials/i.test(text)) {
    return { ok: false, code: "invalid_credentials", detail: text };
  }
  return { ok: false, code: fallbackCode || "auth_failed", detail: text };
}

function validateCredentials(username, password) {
  var normalizedUsername = normalizeUsername(username);
  if (!/^[A-Za-z0-9_]{3,12}$/.test(normalizedUsername)) {
    return { ok: false, code: "invalid_username" };
  }
  if (String(password || "").length < 6) {
    return { ok: false, code: "password_too_short" };
  }
  return { ok: true, username: normalizedUsername, password: String(password) };
}

function validateRegistration(username, password, recoveryEmail) {
  var validation = validateCredentials(username, password);
  var normalizedEmail = normalizeEmail(recoveryEmail);
  if (!validation.ok) { return validation; }
  if (normalizedEmail && !isValidEmail(normalizedEmail)) {
    return { ok: false, code: "invalid_optional_email" };
  }
  validation.recoveryEmail = normalizedEmail;
  return validation;
}

export async function getCurrentSession() {
  var client = getSupabaseClient();
  var result;
  if (!client) { return null; }
  result = await client.auth.getSession();
  if (result.error) {
    throw new Error("session_check_failed", { cause: result.error });
  }
  return result && result.data ? result.data.session : null;
}

export function onAuthStateChange(callback) {
  var client = getSupabaseClient();
  if (!client) { return null; }
  return client.auth.onAuthStateChange(callback);
}

export async function readServerRoles() {
  var client = getSupabaseClient();
  var context = await authenticatedSessionContext(client);
  var result;
  if (!context.ok) { return context; }
  result = await client.rpc("read_current_server_roles");
  if (!await authenticatedSessionStillMatches(client, context)) {
    return { ok: false, code: "stale_session", detail: "The authenticated session changed while reading roles." };
  }
  if (result.error) {
    return { ok: false, code: "roles_read_failed", detail: result.error.message || "" };
  }
  return { ok: true, roles: Array.isArray(result.data) ? result.data.map(String) : [] };
}

export async function registerWithUsername(username, password, recoveryEmail) {
  var validation = validateRegistration(username, password, recoveryEmail);
  var client = getSupabaseClient();
  var result;
  var errorMessage;
  if (!validation.ok) { return validation; }
  if (!client) { return { ok: false, code: "missing_configuration" }; }
  result = await invokePublicEdgeFunction("register-with-username", {
    body: {
      username: validation.username,
      password: validation.password,
      recoveryEmail: validation.recoveryEmail
    }
  });
  if (result.error && result.error.context && typeof result.error.context.json === "function") {
    try {
      var errorBody = await result.error.context.json();
      if (errorBody && errorBody.message) {
        errorMessage = errorBody.message;
      }
    } catch (_error) {
      // Fall back to the transport error when the response has no JSON body.
    }
  }
  if (result.error || !result.data || result.data.ok === false) {
    errorMessage = errorMessage || result.data && result.data.message || result.error && result.error.message || "Registration failed.";
    return authFailure(errorMessage, "registration_failed");
  }
  return loginWithUsername(validation.username, validation.password);
}

export async function loginWithUsername(username, password) {
  var validation = validateCredentials(username, password);
  var client = getSupabaseClient();
  var result;
  var sessionResult;
  var message;
  if (!validation.ok) { return validation; }
  if (!client) { return { ok: false, code: "missing_configuration" }; }
  result = await invokePublicEdgeFunction("login-with-username", {
    body: { username: validation.username, password: validation.password }
  });
  if (result.error) {
    message = result.error.message || "Invalid login credentials";
    if (result.error.context && typeof result.error.context.json === "function") {
      try {
        var errorBody = await result.error.context.json();
        if (errorBody && errorBody.message) { message = errorBody.message; }
      } catch (error) {}
    }
    return authFailure(message, "invalid_credentials");
  }
  if (!result.data || !result.data.session || !result.data.session.access_token || !result.data.session.refresh_token) {
    return { ok: false, code: "invalid_login_session" };
  }
  sessionResult = await client.auth.setSession({
    access_token: result.data.session.access_token,
    refresh_token: result.data.session.refresh_token
  });
  if (sessionResult.error) {
    return authFailure(sessionResult.error.message, "open_session_failed");
  }
  return { ok: true, session: sessionResult.data.session || result.data.session };
}

export async function logout() {
  var client = getSupabaseClient();
  if (!client) { return { ok: true }; }
  var result = await client.auth.signOut();
  if (result.error) {
    if (result.error.status === 403) { return { ok: true }; }
    return { ok: false, code: "logout_failed", detail: result.error.message || "" };
  }
  return { ok: true };
}

export async function requestPasswordRecovery(username, recoveryEmail) {
  var normalizedUsername = normalizeUsername(username);
  var normalizedEmail = normalizeEmail(recoveryEmail);
  var client = getSupabaseClient();
  var result;
  var errorMessage;
  if (!/^[A-Za-z0-9_]{3,12}$/.test(normalizedUsername)) {
    return { ok: false, code: "invalid_username" };
  }
  if (!isValidEmail(normalizedEmail)) {
    return { ok: false, code: "invalid_email" };
  }
  if (!client) { return { ok: false, code: "missing_configuration" }; }
  result = await invokePublicEdgeFunction("request-password-recovery", {
    body: { username: normalizedUsername, email: normalizedEmail }
  });
  if (result.error) {
    errorMessage = result.error.message || "Password recovery request failed.";
    if (result.error.context && typeof result.error.context.json === "function") {
      try {
        var errorBody = await result.error.context.json();
        if (errorBody && errorBody.message) { errorMessage = errorBody.message; }
        if (errorBody && errorBody.detail) { errorMessage += " Dettaglio: " + errorBody.detail; }
      } catch (error) {}
    }
    return authFailure(errorMessage, "recovery_failed");
  }
  return { ok: true, code: "recovery_requested" };
}

export async function updateCurrentUserPassword(password) {
  var client = getSupabaseClient();
  var normalizedPassword = String(password || "");
  var result;
  if (normalizedPassword.length < 6) {
    return { ok: false, code: "password_too_short" };
  }
  if (!client) { return { ok: false, code: "missing_configuration" }; }
  result = await client.auth.updateUser({ password: normalizedPassword });
  if (result.error) {
    return authFailure(result.error.message, "password_update_failed");
  }
  return { ok: true };
}

export async function deletePlayerAccount() {
  var client = getSupabaseClient();
  var result;
  if (!client) { return { ok: false, code: "missing_configuration" }; }
  result = await invokeAuthenticatedEdgeFunction("delete-account");
  if (result.authError) {
    return { ok: false, code: result.authError.code || "invalid_session", detail: result.authError.detail || "" };
  }
  if (result.error) {
    var errorMessage = result.error.message || "Account deletion failed.";
    if (result.error.context && typeof result.error.context.json === "function") {
      try {
        var errorBody = await result.error.context.json();
        if (errorBody && errorBody.error) { errorMessage = errorBody.error; }
      } catch (error) {}
    }
    return { ok: false, code: "delete_account_failed", detail: errorMessage };
  }
  try { await client.auth.signOut(); } catch (e) {}
  return { ok: true };
}
