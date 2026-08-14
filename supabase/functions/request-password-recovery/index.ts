import { createClient } from "https://esm.sh/@supabase/supabase-js@2.108.2";
import { getServiceRoleKey, EdgeJsonBodyError, enforceEdgeRateLimit, readBoundedJsonBody } from "../_shared/edge-rate-limit.ts";

const SUCCESS_MESSAGE = "Se i dati sono corretti, riceverai una email per reimpostare la password.";
const RECOVERY_REDIRECT_URL = "https://pokemon-game-revival.vercel.app/auth/recovery";

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

function normalizeEmail(email: unknown) {
  return String(email || "").trim().toLowerCase();
}

function isValidUsername(username: string) {
  return /^[A-Za-z0-9_]{3,12}$/.test(username);
}

function isValidEmail(email: string) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
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
    return jsonResponse({ ok: false, message: "Configurazione recupero password incompleta." }, 500);
  }

  const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  const globalLimit = await enforceEdgeRateLimit(serviceClient, "auth_recovery_global", "route:request-password-recovery", corsHeaders);
  if (globalLimit) return globalLimit;

  let body: Record<string, unknown>;
  try {
    body = await readBoundedJsonBody(request);
  } catch (error) {
    const bodyError = error instanceof EdgeJsonBodyError ? error : new EdgeJsonBodyError(400);
    return jsonResponse({ ok: false, message: bodyError.message }, bodyError.status);
  }

  const username = normalizeUsername(body.username);
  const email = normalizeEmail(body.email);
  if (!isValidUsername(username) || !isValidEmail(email)) {
    return jsonResponse({ ok: false, message: "Inserisci nome utente e email validi." }, 400);
  }

  const authClient = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  const recoveryResult = await serviceClient
    .from("player_auth_recovery")
    .select("recovery_email")
    .eq("username_normalized", username.toLowerCase())
    .eq("recovery_email_normalized", email)
    .maybeSingle();

  if (recoveryResult.error) {
    console.error("Recovery lookup failed", { category: "recovery_lookup" });
    return jsonResponse({ ok: false, message: "Impossibile richiedere il recupero password." }, 500);
  }
  if (!recoveryResult.data || !recoveryResult.data.recovery_email) {
    return jsonResponse({ ok: true, message: SUCCESS_MESSAGE });
  }

  const resetResult = await authClient.auth.resetPasswordForEmail(email, {
    redirectTo: RECOVERY_REDIRECT_URL
  });

  if (resetResult.error) {
    console.error("Native recovery email failed", { category: "auth_recovery_delivery" });
    return jsonResponse({ ok: false, message: resetResult.error.message || "Impossibile inviare l'email di recupero." }, 500);
  }

  return jsonResponse({ ok: true, message: SUCCESS_MESSAGE });
});
