import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.108.2";

export type EdgeRateLimitCategory =
  | "battle_user"
  | "auth_login_global"
  | "auth_register_global"
  | "auth_recovery_global"
  | "auth_delete_user";

const encoder = new TextEncoder();

export function getServiceRoleKey() {
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
}

async function hmacSubject(subject: string) {
  const pepper = Deno.env.get("EDGE_RATE_LIMIT_PEPPER") || "";
  if (!pepper) throw new Error("rate limiter configuration missing");
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(pepper),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const digest = await crypto.subtle.sign("HMAC", key, encoder.encode(subject));
  return Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, "0")).join("");
}

function response(
  status: number,
  message: string,
  corsHeaders: Record<string, string>,
  retryAfter?: number
) {
  const headers: Record<string, string> = {
    ...corsHeaders,
    "Content-Type": "application/json",
    "Access-Control-Expose-Headers": "Retry-After"
  };
  if (retryAfter !== undefined) headers["Retry-After"] = String(Math.max(1, Math.ceil(retryAfter)));
  return new Response(JSON.stringify({
    ok: false,
    message,
    error: { code: status === 429 ? "rate_limited" : "rate_limit_unavailable", message }
  }), { status, headers });
}

export class EdgeJsonBodyError extends Error {
  constructor(public status: 400 | 413) {
    super(status === 413 ? "Il corpo della richiesta è troppo grande." : "Richiesta non valida.");
  }
}

export async function readBoundedJsonBody(request: Request, maxBytes = 16 * 1024) {
  const contentLength = request.headers.get("content-length");
  if (contentLength && /^\d+$/.test(contentLength) && Number(contentLength) > maxBytes) {
    throw new EdgeJsonBodyError(413);
  }
  const reader = request.body?.getReader();
  if (!reader) throw new EdgeJsonBodyError(400);
  const chunks: Uint8Array[] = [];
  let byteLength = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    byteLength += value.byteLength;
    if (byteLength > maxBytes) {
      try { await reader.cancel(); } catch (_error) {}
      throw new EdgeJsonBodyError(413);
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(byteLength);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  let body: unknown;
  try {
    body = JSON.parse(new TextDecoder().decode(bytes));
  } catch (_error) {
    throw new EdgeJsonBodyError(400);
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new EdgeJsonBodyError(400);
  return body as Record<string, unknown>;
}

export async function enforceEdgeRateLimit(
  serviceClient: SupabaseClient,
  category: EdgeRateLimitCategory,
  subject: string,
  corsHeaders: Record<string, string>
) {
  try {
    const subjectHash = await hmacSubject(subject);
    const result = await serviceClient.rpc("consume_edge_request_rate_limit", {
      category,
      subject_hash: subjectHash
    });
    if (result.error || !result.data || typeof result.data.allowed !== "boolean") {
      return response(500, "Il controllo delle richieste non è al momento disponibile.", corsHeaders);
    }
    if (!result.data.allowed) {
      return response(
        429,
        "Troppe richieste. Attendi prima di riprovare.",
        corsHeaders,
        Number(result.data.retry_after) || 1
      );
    }
    return null;
  } catch (_error) {
    return response(500, "Il controllo delle richieste non è al momento disponibile.", corsHeaders);
  }
}
