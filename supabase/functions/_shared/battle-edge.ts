import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.108.2";
import { getServiceRoleKey } from "./edge-rate-limit.ts";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Expose-Headers": "Retry-After"
};

export function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}

export async function readJsonBody(request: Request, maxBytes = 32768) {
  const contentLength = request.headers.get("content-length") || "";
  if (/^\d+$/.test(contentLength) && Number(contentLength) > maxBytes) {
    throw new BattleEdgeError("request_too_large", "Il corpo della richiesta è troppo grande.", 413);
  }
  const reader = request.body?.getReader();
  if (!reader) throw new BattleEdgeError("invalid_json", "Il corpo della richiesta non contiene JSON valido.", 400);
  const chunks: Uint8Array[] = [];
  let byteLength = 0;
  while (true) {
    const { done, value: chunk } = await reader.read();
    if (done) break;
    byteLength += chunk.byteLength;
    if (byteLength > maxBytes) {
      try { await reader.cancel(); } catch (_error) {}
      throw new BattleEdgeError("request_too_large", "Il corpo della richiesta è troppo grande.", 413);
    }
    chunks.push(chunk);
  }
  const bytes = new Uint8Array(byteLength);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  let value: unknown;
  try {
    value = JSON.parse(new TextDecoder().decode(bytes));
  } catch (_error) {
    throw new BattleEdgeError("invalid_json", "Il corpo della richiesta non contiene JSON valido.", 400);
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new BattleEdgeError("invalid_request", "Il corpo della richiesta deve essere un oggetto.", 400);
  }
  return value as Record<string, unknown>;
}

export class BattleEdgeError extends Error {
  constructor(public code: string, message: string, public status = 400) {
    super(message);
  }
}

export function requireExactKeys(body: Record<string, unknown>, allowed: string[], required: string[]) {
  const unexpected = Object.keys(body).find((key) => !allowed.includes(key));
  const missing = required.find((key) => body[key] === undefined || body[key] === null || body[key] === "");
  if (unexpected || missing) throw new BattleEdgeError("invalid_request", "I dati del comando non rispettano lo schema previsto.");
}

export function uuid(value: unknown, name: string) {
  const normalized = String(value || "").toLowerCase();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(normalized)) {
    throw new BattleEdgeError("invalid_request", `${name} deve essere un UUID.`);
  }
  return normalized;
}

export function integer(value: unknown, name: string, min: number, max: number) {
  const normalized = Number(value);
  if (!Number.isInteger(normalized) || normalized < min || normalized > max) {
    throw new BattleEdgeError("invalid_request", `${name} è fuori dall'intervallo consentito.`);
  }
  return normalized;
}

export async function clientsForRequest(request: Request) {
  const url = Deno.env.get("SUPABASE_URL") || "";
  const publishableKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
  const serviceRoleKey = getServiceRoleKey();
  const authorization = request.headers.get("authorization") || "";
  const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1] || "";
  if (!url || !publishableKey || !serviceRoleKey) throw new BattleEdgeError("server_configuration", "Il runtime di battaglia non è configurato.", 500);
  if (!token) throw new BattleEdgeError("authentication_required", "È richiesto un token Bearer.", 401);
  const userClient = createClient(url, publishableKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { autoRefreshToken: false, persistSession: false }
  });
  const authResult = await userClient.auth.getUser(token);
  if (authResult.error || !authResult.data.user) throw new BattleEdgeError("invalid_token", "Il token Bearer non è valido.", 401);
  const serviceClient = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  return { userId: authResult.data.user.id, userClient, serviceClient };
}

export async function rolesForUser(serviceClient: SupabaseClient, userId: string) {
  const result = await serviceClient.from("user_server_role").select("role_key").eq("auth_user_id", userId);
  if (result.error) throw databaseError(result.error);
  return (result.data || []).map((entry) => String(entry.role_key));
}

export async function requireServerRole(serviceClient: SupabaseClient, userId: string, role: "admin" | "debug") {
  const roles = await rolesForUser(serviceClient, userId);
  if (!roles.includes(role)) throw new BattleEdgeError("role_required", `È richiesto il ruolo ${role}.`, 403);
  return roles;
}

export function requireRevivalProject() {
  const configuredUrl = Deno.env.get("SUPABASE_URL") || "";
  let hostname = "";
  try { hostname = new URL(configuredUrl).hostname.toLowerCase(); } catch (_error) {}
  if (hostname !== "etotvaneppzkxunezqrl.supabase.co") {
    throw new BattleEdgeError("debug_revival_only", "I comandi debug personalizzati sono disponibili solo nel progetto Revival configurato.", 403);
  }
}

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>).sort().reduce<Record<string, unknown>>((result, key) => {
      result[key] = stableValue((value as Record<string, unknown>)[key]);
      return result;
    }, {});
  }
  return value;
}

export async function sha256(value: unknown) {
  const bytes = new TextEncoder().encode(JSON.stringify(stableValue(value)));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (entry) => entry.toString(16).padStart(2, "0")).join("");
}

export function databaseError(error: { code?: string; message?: string } | null) {
  const code = String(error?.code || "");
  const message = String(error?.message || "");
  if (code === "40001") return new BattleEdgeError("revision_conflict", "Lo stato è cambiato; aggiorna i dati prima di riprovare.", 409);
  if (code === "55P03") return new BattleEdgeError("runtime_locked", "Il runtime di battaglia appartiene a un altro client.", 423);
  if (code === "P0002") return new BattleEdgeError("battle_not_found", "La risorsa richiesta non è stata trovata.", 404);
  if (code === "23505" && /an authoritative battle is already active/i.test(message)) {
    return new BattleEdgeError("activity_in_progress", "Completa prima l'attività in corso", 409);
  }
  if (code === "23505" && /authoritative_battle_tower_run_auth_user_id_attempt_date_key|Hai già effettuato il tentativo di oggi/i.test(message)) {
    return new BattleEdgeError("battle_tower_daily_attempt_used", "Hai già effettuato il tentativo di oggi", 409);
  }
  if (code === "42501") return new BattleEdgeError("authority_denied", "L'autorità attendibile per la battaglia è stata negata.", 500);
  if (code === "0A000" && /incompatible active battle|engine binding/i.test(message)) {
    return new BattleEdgeError("incompatible_active_battle", "La battaglia attiva richiede un bundle motore esatto non disponibile in questa distribuzione.", 409);
  }
  return new BattleEdgeError("battle_command_rejected", "Il comando di battaglia è stato rifiutato.", 400);
}

export async function prepareBattle(serviceClient: SupabaseClient, userId: string, battleId: string | null) {
  const result = await serviceClient.rpc("prepare_edge_battle_command", { p_auth_user_id: userId, p_battle_id: battleId });
  if (result.error) throw databaseError(result.error);
  return result.data as Record<string, unknown>;
}

export async function readBattleEvents(serviceClient: SupabaseClient, userId: string, battleId: string, afterSeq: number, limit: number) {
  const result = await serviceClient.rpc("read_edge_battle_events", {
    p_auth_user_id: userId,
    p_battle_id: battleId,
    p_after_seq: afterSeq,
    p_limit: limit
  });
  if (result.error) throw databaseError(result.error);
  return Array.isArray(result.data) ? result.data : [];
}
