import { createClient } from "https://esm.sh/@supabase/supabase-js@2.108.2";
import { getServiceRoleKey, EdgeJsonBodyError, enforceEdgeRateLimit, readBoundedJsonBody } from "../_shared/edge-rate-limit.ts";

const USERNAME_AUTH_DOMAIN = "pokemon-game-revival.local";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Expose-Headers": "Retry-After"
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json"
    }
  });
}

function normalizeUsername(username: unknown) {
  return String(username || "").trim();
}

function usernameToAuthEmail(username: string) {
  return normalizeUsername(username).toLowerCase() + "@" + USERNAME_AUTH_DOMAIN;
}

function isValidUsername(username: string) {
  return /^[A-Za-z0-9_]{3,12}$/.test(username);
}

Deno.serve(async function (request) {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return jsonResponse({ ok: false, message: "Metodo non supportato." }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const serviceRoleKey = getServiceRoleKey();
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
  if (!supabaseUrl || !serviceRoleKey || !anonKey) {
    return jsonResponse({ ok: false, message: "Configurazione accesso incompleta." }, 500);
  }

  const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  const globalLimit = await enforceEdgeRateLimit(serviceClient, "auth_login_global", "route:login-with-username", corsHeaders);
  if (globalLimit) return globalLimit;

  let body: Record<string, unknown>;
  try {
    body = await readBoundedJsonBody(request);
  } catch (error) {
    const bodyError = error instanceof EdgeJsonBodyError ? error : new EdgeJsonBodyError(400);
    return jsonResponse({ ok: false, message: bodyError.message }, bodyError.status);
  }

  const username = normalizeUsername(body.username);
  const password = String(body.password || "");
  if (!isValidUsername(username) || password.length < 6) {
    return jsonResponse({ ok: false, message: "Credenziali di accesso non valide." }, 400);
  }

  const authClient = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  const recoveryResult = await serviceClient
    .from("player_auth_recovery")
    .select("recovery_email")
    .eq("username_normalized", username.toLowerCase())
    .maybeSingle();

  if (recoveryResult.error) {
    console.error("Username lookup failed", { category: "recovery_lookup" });
    return jsonResponse({ ok: false, message: "Impossibile verificare le credenziali." }, 500);
  }

  const authEmail = recoveryResult.data && recoveryResult.data.recovery_email
    ? String(recoveryResult.data.recovery_email)
    : usernameToAuthEmail(username);

  const loginResult = await authClient.auth.signInWithPassword({
    email: authEmail,
    password
  });

  if (loginResult.error || !loginResult.data.session) {
    return jsonResponse({ ok: false, message: "Credenziali di accesso non valide." }, 401);
  }

  return jsonResponse({ ok: true, session: loginResult.data.session });
});
