import { getSupabaseClient, currentUserId, dailyLimitTableIsMissing } from "./supabase.js";

function gardenPlotFromRow(row, plantKey, seedTimeKey) {
  if (!row || row[plantKey] === null || row[plantKey] === undefined) {
    return null;
  }
  return { berryIndex: row[plantKey], seedTime: row[seedTimeKey] };
}

function gardenPlotsFromRow(row) {
  return [
    gardenPlotFromRow(row, "plant_1", "seed_time_1"),
    gardenPlotFromRow(row, "plant_2", "seed_time_2"),
    gardenPlotFromRow(row, "plant_3", "seed_time_3")
  ];
}

function gardenRpcResult(data) {
  if (!data || data.ok === false) {
    return { ok: false, code: data && data.reason || "garden_operation_failed" };
  }
  if (!data.garden || !Array.isArray(data.items)) {
    return { ok: false, code: "invalid_garden_response" };
  }
  return {
    ok: true,
    plots: gardenPlotsFromRow(data.garden),
    items: data.items,
    berryIndex: data.berry_index === undefined ? null : Number(data.berry_index),
    quantity: data.quantity === undefined ? null : Number(data.quantity)
  };
}

export async function plantGardenBerryViaRpc(plotIndex, berryIndex, growthSeconds) {
  var client = getSupabaseClient();
  if (!client) { return { ok: false, code: "missing_configuration" }; }
  var user = await currentUserId(client);
  if (!user.ok) { return { ok: false, code: user.code || "invalid_session" }; }
  var result = await client.rpc("plant_garden_berry", {
    p_plot_index: Number(plotIndex),
    p_berry_index: Number(berryIndex),
    p_growth_seconds: Number(growthSeconds)
  });
  if (result.error) { return { ok: false, code: "garden_plant_failed", detail: result.error.message || "" }; }
  return gardenRpcResult(result.data);
}

export async function harvestGardenPlotViaRpc(plotIndex, growthSeconds, harvestQuantity) {
  var client = getSupabaseClient();
  if (!client) { return { ok: false, code: "missing_configuration" }; }
  var user = await currentUserId(client);
  if (!user.ok) { return { ok: false, code: user.code || "invalid_session" }; }
  var result = await client.rpc("harvest_garden_plot", {
    p_plot_index: Number(plotIndex),
    p_growth_seconds: Number(growthSeconds),
    p_quantity: Math.max(1, Math.floor(Number(harvestQuantity) || 1))
  });
  if (result.error) { return { ok: false, code: "garden_harvest_failed", detail: result.error.message || "" }; }
  return gardenRpcResult(result.data);
}

export async function loadDailyBerryLimit() {
  var client = getSupabaseClient();
  if (!client) { return { ok: false, code: "missing_configuration", dailyLimit: null }; }
  var user = await currentUserId(client);
  if (!user.ok) { return { ok: false, code: user.code || "invalid_session", dailyLimit: null }; }
  var result = await client.from("player_daily_limits").select("last_claimed_at").eq("auth_user_id", user.userId).eq("limit_type", "berry").maybeSingle();
  if (result.error) {
    if (dailyLimitTableIsMissing(result.error)) {
      return { ok: true, dailyLimit: null };
    }
    return { ok: false, code: "daily_berry_load_failed", detail: result.error.message || "", dailyLimit: null };
  }
  return { ok: true, dailyLimit: result.data || null };
}

export async function claimDailyBerryViaRpc() {
  var client = getSupabaseClient();
  if (!client) { return { ok: false, code: "missing_configuration" }; }
  var user = await currentUserId(client);
  if (!user.ok) { return { ok: false, code: user.code || "invalid_session" }; }
  var result = await client.rpc("claim_daily_berry");
  if (result.error) { return { ok: false, code: "daily_berry_claim_failed", detail: result.error.message || "" }; }
  if (!result.data || result.data.ok === false) {
    return {
      ok: false,
      alreadyClaimed: result.data && result.data.reason === "already_claimed",
      lastClaimedAt: result.data ? result.data.last_claimed_at : null,
      code: result.data && result.data.reason || "daily_berry_claim_failed"
    };
  }
  return {
    ok: true,
    lastClaimedAt: result.data.last_claimed_at || null
  };
}
