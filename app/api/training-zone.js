import { currentUserId, getSupabaseClient } from "./supabase.js";

var TRAINING_LIMIT_TYPES = ["training_easy", "training_medium", "training_hard"];

async function userAndClient() {
  var client = getSupabaseClient();
  var user;
  if (!client) {
    return { ok: false, message: "Configurazione Supabase mancante." };
  }
  user = await currentUserId(client);
  if (!user.ok) {
    return user;
  }
  return { ok: true, client: client, userId: user.userId };
}

export async function loadTrainingDailyLimits() {
  var auth = await userAndClient();
  var result;
  if (!auth.ok) {
    return { ok: false, message: auth.message, rows: [] };
  }
  result = await auth.client.from("player_daily_limits")
    .select("limit_type, last_claimed_at")
    .eq("auth_user_id", auth.userId)
    .in("limit_type", TRAINING_LIMIT_TYPES);
  if (result.error) {
    return { ok: false, message: result.error.message, rows: [] };
  }
  return { ok: true, rows: result.data || [] };
}

export async function claimTrainingZoneReward(difficulty) {
  return {
    ok: false,
    difficulty: String(difficulty || ""),
    message: "Il premio della Zona allenamento viene assegnato dalla battaglia autorevole."
  };
}
