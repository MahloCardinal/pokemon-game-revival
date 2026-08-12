import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getServiceRoleKey, enforceEdgeRateLimit } from "../_shared/edge-rate-limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Expose-Headers": "Retry-After",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Metodo non consentito." }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = getServiceRoleKey();
  const authorization = req.headers.get("Authorization") || "";

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return jsonResponse({ error: "Configurazione Supabase mancante." }, 500);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  if (!authorization.startsWith("Bearer ")) {
    return jsonResponse({ error: "Sessione non valida." }, 401);
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();

  if (userError || !userData.user) {
    return jsonResponse({ error: "Sessione non valida." }, 401);
  }

  const userLimit = await enforceEdgeRateLimit(adminClient, "auth_delete_user", userData.user.id, corsHeaders);
  if (userLimit) return userLimit;

  const { error: deleteError } = await adminClient.auth.admin.deleteUser(userData.user.id);

  if (deleteError) {
    return jsonResponse({ error: deleteError.message || "Impossibile eliminare l'account." }, 500);
  }

  return jsonResponse({ ok: true });
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
