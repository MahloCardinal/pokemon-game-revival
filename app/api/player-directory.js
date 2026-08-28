import { getSupabaseClient } from "./supabase.js";

export async function getPlayerDirectory() {
  var client = getSupabaseClient();
  var result;
  if (!client) {
    return { ok: false, code: "missing_configuration" };
  }
  try {
    result = await client.rpc("list_player_directory");
  } catch (error) {
    return { ok: false, code: "player_directory_load_failed", detail: error && error.message || "" };
  }
  if (result.error) {
    return { ok: false, code: result.error.code || "player_directory_load_failed", detail: result.error.message || "" };
  }
  return {
    ok: true,
    generatedAt: result.data && result.data.generated_at || null,
    players: result.data && Array.isArray(result.data.players) ? result.data.players : []
  };
}
