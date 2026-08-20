import { currentUserId, getSupabaseClient, runQuery } from "./supabase.js";

function normalizePurchaseRow(row) {
  return {
    itemIndex: Math.floor(Number(row && (row.item_index !== undefined ? row.item_index : row.itemIndex)) || 0),
    purchasedQuantity: Math.max(0, Math.floor(Number(row && (row.purchased_quantity !== undefined ? row.purchased_quantity : row.purchasedQuantity)) || 0))
  };
}

function purchasePayload(userId, row) {
  return {
    auth_user_id: userId,
    item_index: Math.floor(Number(row.itemIndex) || 0),
    purchased_quantity: Math.max(0, Math.floor(Number(row.purchasedQuantity) || 0))
  };
}

async function userAndClient() {
  var client = getSupabaseClient();
  var user;
  if (!client) {
    return { ok: false, message: "Missing Supabase configuration." };
  }
  user = await currentUserId(client);
  if (!user.ok) {
    return user;
  }
  return { ok: true, client: client, userId: user.userId };
}

export async function loadPlayerShopPurchases() {
  var auth = await userAndClient();
  var result;
  if (!auth.ok) {
    return { ok: false, message: auth.message, rows: [] };
  }
  result = await auth.client.from("player_shop_purchases")
    .select("item_index, purchased_quantity")
    .eq("auth_user_id", auth.userId);
  if (result.error) {
    return { ok: false, message: result.error.message, rows: [] };
  }
  return { ok: true, rows: (result.data || []).map(normalizePurchaseRow).filter(function (row) { return row.itemIndex > 0; }) };
}

export async function updatePlayerShopPurchases(rows) {
  var auth = await userAndClient();
  var payload;
  if (!auth.ok) {
    return { ok: false, message: auth.message };
  }
  payload = (rows || []).map(function (row) {
    return purchasePayload(auth.userId, row);
  }).filter(function (row) {
    return row.item_index > 0;
  });
  if (!payload.length) {
    return { ok: true };
  }
  return runQuery(auth.client.from("player_shop_purchases").upsert(payload, { onConflict: "auth_user_id,item_index" }));
}
