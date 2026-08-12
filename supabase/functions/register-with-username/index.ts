import { createClient } from "https://esm.sh/@supabase/supabase-js@2.108.2";
import { getServiceRoleKey, EdgeJsonBodyError, enforceEdgeRateLimit, readBoundedJsonBody } from "../_shared/edge-rate-limit.ts";

const USERNAME_AUTH_DOMAIN = "pokemon-game-revival.local";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Expose-Headers": "Retry-After"
};

function response(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}

function normalizeUsername(value: unknown) {
  return String(value || "").trim();
}

function normalizeEmail(value: unknown) {
  return String(value || "").trim().toLowerCase();
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return response({ ok: false, message: "Metodo non supportato." }, 405);
  }

  const url = Deno.env.get("SUPABASE_URL") || "";
  const serviceRoleKey = getServiceRoleKey();
  if (!url || !serviceRoleKey) {
    return response({ ok: false, message: "Configurazione accesso incompleta." }, 500);
  }

  const admin = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  const globalLimit = await enforceEdgeRateLimit(admin, "auth_register_global", "route:register-with-username", corsHeaders);
  if (globalLimit) return globalLimit;

  let body: Record<string, unknown>;
  try {
    body = await readBoundedJsonBody(request);
  } catch (error) {
    const bodyError = error instanceof EdgeJsonBodyError ? error : new EdgeJsonBodyError(400);
    return response({ ok: false, message: bodyError.message }, bodyError.status);
  }

  const username = normalizeUsername(body.username);
  const password = String(body.password || "");
  const recoveryEmail = normalizeEmail(body.recoveryEmail);
  if (!/^[A-Za-z0-9_]{3,12}$/.test(username) || password.length < 6) {
    return response({ ok: false, message: "Dati registrazione non validi." }, 400);
  }
  if (recoveryEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(recoveryEmail)) {
    return response({ ok: false, message: "Email di recupero non valida." }, 400);
  }

  const authEmail = recoveryEmail || username.toLowerCase() + "@" + USERNAME_AUTH_DOMAIN;
  const createResult = await admin.auth.admin.createUser({
    email: authEmail,
    password,
    email_confirm: true,
    user_metadata: { username }
  });
  if (createResult.error || !createResult.data.user) {
    return response({ ok: false, message: "Nome utente o email gia utilizzati." }, 409);
  }

  const recoveryResult = await admin.from("player_auth_recovery").insert({
    auth_user_id: createResult.data.user.id,
    username,
    username_normalized: username.toLowerCase(),
    recovery_email: recoveryEmail || null,
    recovery_email_normalized: recoveryEmail || null
  });
  if (recoveryResult.error) {
    const cleanupResult = await admin.auth.admin.deleteUser(createResult.data.user.id);
    if (cleanupResult.error) {
      console.error("Registration rollback failed", { category: "recovery_insert_and_auth_cleanup" });
      return response({ ok: false, message: "Registrazione incompleta. Contatta un amministratore." }, 500);
    }
    return response({ ok: false, message: "Impossibile completare la registrazione." }, 500);
  }

  return response({ ok: true, authEmail });
});
