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

function normalizeRpcResult(data, fallbackCode) {
  if (!data || typeof data !== "object") {
    return { ok: false, code: fallbackCode || "activity_feed_failed", events: [] };
  }
  return {
    ok: data.ok !== false,
    code: data.ok === false ? fallbackCode || "activity_feed_failed" : "",
    events: Array.isArray(data.events) ? data.events.map(normalizeActivityRow) : []
  };
}

export async function loadGlobalActivityFeed() {
  var client = getSupabaseClient();
  var result;
  if (!client) {
    return { ok: false, code: "missing_configuration", events: [] };
  }
  result = await client.rpc("list_global_activity_feed");
  if (result.error) {
    return { ok: false, code: "activity_feed_load_failed", detail: result.error.message || "", events: [] };
  }
  return normalizeRpcResult(result.data, "activity_feed_load_failed");
}

export async function appendGlobalActivityFeedEvent(event) {
  var client = getSupabaseClient();
  var result;
  if (!client) {
    return { ok: false, code: "missing_configuration" };
  }
  result = await client.rpc("append_global_activity_feed_event", {
    p_event_type: String(event && event.eventType || ""),
    p_subject_name: String(event && event.subjectName || ""),
    p_secondary_subject_name: String(event && event.secondarySubjectName || "")
  });
  if (result.error) {
    return { ok: false, code: "activity_feed_save_failed", detail: result.error.message || "" };
  }
  return normalizeRpcResult(result.data, "activity_feed_save_failed");
}

export async function appendAdminGlobalActivityMessage(message) {
  var client = getSupabaseClient();
  var result;
  if (!client) {
    return { ok: false, code: "missing_configuration" };
  }
  result = await client.rpc("append_admin_global_activity_message", {
    p_message: String(message || "")
  });
  if (result.error) {
    return { ok: false, code: "admin_announcement_failed", detail: result.error.message || "" };
  }
  return normalizeRpcResult(result.data, "admin_announcement_failed");
}
