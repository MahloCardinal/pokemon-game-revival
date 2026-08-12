import { getSupabaseClient, currentUserId } from "./supabase.js";
import { FLUTE_DAILY_USE_LIMIT } from "../data/progression.js";
import { startWildEncounterAuthoritative } from "./player-command.js";

export async function claimFluteDailyUse(limitType) {
  var client = getSupabaseClient();
  if (!client) { return { ok: false, message: "Configurazione Supabase mancante." }; }
  var user = await currentUserId(client);
  if (!user.ok) { return { ok: false, message: user.message }; }
  var result = await client.rpc("claim_flute_use", { p_limit_type: limitType, p_daily_limit: FLUTE_DAILY_USE_LIMIT });
  if (result.error) { return { ok: false, message: result.error.message }; }
  return result.data || { ok: false, message: "Risposta RPC non valida." };
}

export function startAuthoritativeWildEncounter(input) {
  return startWildEncounterAuthoritative(input);
}
