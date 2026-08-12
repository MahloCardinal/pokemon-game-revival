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

export async function currentUserId(client) {
  var userResult = await client.auth.getUser();
  if (userResult.error || !userResult.data.user) {
    return { ok: false, message: "Sessione non valida.", userId: null };
  }
  return { ok: true, userId: userResult.data.user.id };
}

export async function runQuery(resultPromise) {
  var result = await resultPromise;
  if (result.error) { return { ok: false, message: translateSupabaseErrorMessage(result.error.message) }; }
  return { ok: true };
}

export function translateSupabaseErrorMessage(message) {
  var text = String(message || "");
  if (/could not query the database for the schema cache|PGRST002/i.test(text)) {
    return "Il servizio dati non è temporaneamente disponibile. Riprova tra qualche istante.";
  }
  if (/insufficient Battle Points/i.test(text)) {
    return "Non hai abbastanza PL per ritirare questo premio.";
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

function translateAuthMessage(message) {
  var originalText = String(message || "");
  var text = translateSupabaseErrorMessage(originalText);
  var secondsMatch;
  if (text !== originalText) {
    return text;
  }
  if (/security/i.test(text) && /request/i.test(text) && /second/i.test(text)) {
    secondsMatch = text.match(/(\d+)\s*second/i);
    return secondsMatch
      ? "Per sicurezza, puoi riprovare tra " + secondsMatch[1] + " secondi."
      : "Per sicurezza, attendi qualche secondo prima di riprovare.";
  }
  if (/new password should be different from the old password/i.test(text)) {
    return "La nuova password deve essere diversa dalla password precedente.";
  }
  if (text === "Invalid login credentials") {
    return "Credenziali di accesso non valide.";
  }
  return text;
}

function validateCredentials(username, password) {
  var normalizedUsername = normalizeUsername(username);
  if (!/^[A-Za-z0-9_]{3,12}$/.test(normalizedUsername)) {
    return { ok: false, message: "Il nome utente deve avere 3-12 caratteri e usare solo lettere, numeri o underscore." };
  }
  if (String(password || "").length < 6) {
    return { ok: false, message: "La password deve avere almeno 6 caratteri." };
  }
  return { ok: true, username: normalizedUsername, password: String(password) };
}

function validateRegistration(username, password, recoveryEmail) {
  var validation = validateCredentials(username, password);
  var normalizedEmail = normalizeEmail(recoveryEmail);
  if (!validation.ok) { return validation; }
  if (normalizedEmail && !isValidEmail(normalizedEmail)) {
    return { ok: false, message: "Inserisci una email valida oppure lascia il campo vuoto." };
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
    throw new Error(translateSupabaseErrorMessage(result.error.message || "Impossibile verificare la sessione."));
  }
  return result && result.data ? result.data.session : null;
}

export function onAuthStateChange(callback) {
  var client = getSupabaseClient();
  if (!client) { return null; }
  return client.auth.onAuthStateChange(callback);
}

export async function registerWithUsername(username, password, recoveryEmail) {
  var validation = validateRegistration(username, password, recoveryEmail);
  var client = getSupabaseClient();
  var result;
  var errorMessage;
  if (!validation.ok) { return { ok: false, message: validation.message }; }
  if (!client) { return { ok: false, message: "Configurazione Supabase mancante." }; }
  result = await client.functions.invoke("register-with-username", {
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
    errorMessage = errorMessage || result.data && result.data.message || result.error && result.error.message || "Impossibile completare la registrazione.";
    return { ok: false, message: translateAuthMessage(errorMessage) };
  }
  return loginWithUsername(validation.username, validation.password);
}

export async function loginWithUsername(username, password) {
  var validation = validateCredentials(username, password);
  var client = getSupabaseClient();
  var result;
  var sessionResult;
  var message;
  if (!validation.ok) { return { ok: false, message: validation.message }; }
  if (!client) { return { ok: false, message: "Configurazione Supabase mancante." }; }
  result = await client.functions.invoke("login-with-username", {
    body: { username: validation.username, password: validation.password }
  });
  if (result.error) {
    message = result.error.message || "Credenziali di accesso non valide.";
    if (result.error.context && typeof result.error.context.json === "function") {
      try {
        var errorBody = await result.error.context.json();
        if (errorBody && errorBody.message) { message = errorBody.message; }
      } catch (error) {}
    }
    return { ok: false, message: translateAuthMessage(message) };
  }
  if (!result.data || !result.data.session || !result.data.session.access_token || !result.data.session.refresh_token) {
    return { ok: false, message: "Sessione di accesso non valida." };
  }
  sessionResult = await client.auth.setSession({
    access_token: result.data.session.access_token,
    refresh_token: result.data.session.refresh_token
  });
  if (sessionResult.error) {
    return { ok: false, message: translateAuthMessage(sessionResult.error.message || "Impossibile aprire la sessione.") };
  }
  return { ok: true, session: sessionResult.data.session || result.data.session };
}

export async function logout() {
  var client = getSupabaseClient();
  if (!client) { return { ok: true }; }
  var result = await client.auth.signOut();
  if (result.error) {
    if (result.error.status === 403) { return { ok: true }; }
    return { ok: false, message: result.error.message };
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
    return { ok: false, message: "Il nome utente deve avere 3-12 caratteri e usare solo lettere, numeri o underscore." };
  }
  if (!isValidEmail(normalizedEmail)) {
    return { ok: false, message: "Inserisci una email valida." };
  }
  if (!client) { return { ok: false, message: "Configurazione Supabase mancante." }; }
  result = await client.functions.invoke("request-password-recovery", {
    body: { username: normalizedUsername, email: normalizedEmail }
  });
  if (result.error) {
    errorMessage = result.error.message || "Impossibile richiedere il recupero password.";
    if (result.error.context && typeof result.error.context.json === "function") {
      try {
        var errorBody = await result.error.context.json();
        if (errorBody && errorBody.message) { errorMessage = errorBody.message; }
        if (errorBody && errorBody.detail) { errorMessage += " Dettaglio: " + errorBody.detail; }
      } catch (error) {}
    }
    return { ok: false, message: translateAuthMessage(errorMessage) };
  }
  return { ok: true, message: result.data && result.data.message ? result.data.message : "Se i dati sono corretti, riceverai una email per reimpostare la password." };
}

export async function updateCurrentUserPassword(password) {
  var client = getSupabaseClient();
  var normalizedPassword = String(password || "");
  var result;
  if (normalizedPassword.length < 6) {
    return { ok: false, message: "La password deve avere almeno 6 caratteri." };
  }
  if (!client) { return { ok: false, message: "Configurazione Supabase mancante." }; }
  result = await client.auth.updateUser({ password: normalizedPassword });
  if (result.error) {
    return { ok: false, message: translateAuthMessage(result.error.message || "Impossibile aggiornare la password.") };
  }
  return { ok: true };
}

export async function deletePlayerAccount() {
  var client = getSupabaseClient();
  var result;
  if (!client) { return { ok: false, message: "Configurazione Supabase mancante." }; }
  result = await client.functions.invoke("delete-account");
  if (result.error) {
    var errorMessage = result.error.message || "Impossibile eliminare l'account.";
    if (result.error.context && typeof result.error.context.json === "function") {
      try {
        var errorBody = await result.error.context.json();
        if (errorBody && errorBody.error) { errorMessage = errorBody.error; }
      } catch (error) {}
    }
    return { ok: false, message: errorMessage };
  }
  try { await client.auth.signOut(); } catch (e) {}
  return { ok: true };
}
