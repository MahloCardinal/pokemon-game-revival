import { getSupabaseClient } from "./supabase.js";

function normalizeActivityRow(row) {
  return {
    id: Number(row && row.id) || 0,
    playerUsername: String(row && (row.player_username !== undefined ? row.player_username : row.playerUsername) || ""),
    eventType: String(row && (row.event_type !== undefined ? row.event_type : row.eventType) || ""),
    subjectName: String(row && (row.subject_name !== undefined ? row.subject_name : row.subjectName) || ""),
    secondarySubjectName: String(row && (row.secondary_subject_name !== undefined ? row.secondary_subject_name : row.secondarySubjectName) || "")
  };
}

function normalizeRpcResult(data, fallbackMessage) {
  if (!data || typeof data !== "object") {
    return { ok: false, message: fallbackMessage || "Operazione feed non riuscita.", events: [] };
  }
  return {
    ok: data.ok !== false,
    message: data.message || fallbackMessage || "",
    events: Array.isArray(data.events) ? data.events.map(normalizeActivityRow) : []
  };
}

export async function loadGlobalActivityFeed() {
  var client = getSupabaseClient();
  var result;
  if (!client) {
    return { ok: false, message: "Configurazione Supabase mancante.", events: [] };
  }
  result = await client.rpc("list_global_activity_feed");
  if (result.error) {
    return { ok: false, message: result.error.message, events: [] };
  }
  return normalizeRpcResult(result.data, "Impossibile caricare le attivita recenti.");
}

export async function appendGlobalActivityFeedEvent(event) {
  var client = getSupabaseClient();
  var result;
  if (!client) {
    return { ok: false, message: "Configurazione Supabase mancante." };
  }
  result = await client.rpc("append_global_activity_feed_event", {
    p_event_type: String(event && event.eventType || ""),
    p_subject_name: String(event && event.subjectName || ""),
    p_secondary_subject_name: String(event && event.secondarySubjectName || "")
  });
  if (result.error) {
    return { ok: false, message: result.error.message };
  }
  return normalizeRpcResult(result.data, "Impossibile salvare l'attivita recente.");
}

export async function appendAdminGlobalActivityMessage(message) {
  var client = getSupabaseClient();
  var result;
  if (!client) {
    return { ok: false, message: "Configurazione Supabase mancante." };
  }
  result = await client.rpc("append_admin_global_activity_message", {
    p_message: String(message || "")
  });
  if (result.error) {
    return { ok: false, message: result.error.message };
  }
  return normalizeRpcResult(result.data, "Impossibile inviare la comunicazione.");
}
