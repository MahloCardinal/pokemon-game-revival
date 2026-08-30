import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.108.2";

const APP_URL = "https://pokemon-game-revival.vercel.app";
const WEBHOOK_SECRET_NAME = "DISCORD_ADMIN_BATTLE_WEBHOOK_URL";
const DELIVERY_TIMEOUT_MS = 5_000;

type NotificationClaim = {
  send?: boolean;
  battle_id?: string;
  battle_version?: number;
  auth_user_id?: string;
  username?: string;
  contract_key?: string;
  gym_key?: string | null;
  league_member_index?: number | null;
};

const gymLabels: Record<string, string> = {
  cinnabar_island: "Isola Cannella · Blaine",
  viridian_city: "Smeraldopoli · Giovanni"
};

const leagueLabels = ["Lorelei", "Bruno", "Agatha", "Lance", "Campione Blu"];

export function isDiscordWebhookUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:"
      && ["discord.com", "discordapp.com"].includes(url.hostname)
      && /^\/api\/webhooks\/\d+\/[A-Za-z0-9._-]+$/.test(url.pathname)
      && !url.search
      && !url.hash;
  } catch (_error) {
    return false;
  }
}

function opponentLabel(claim: NotificationClaim) {
  if (claim.contract_key === "admin_gym") {
    return gymLabels[String(claim.gym_key || "")] || "Palestra amministrata";
  }
  const memberIndex = Number(claim.league_member_index);
  return Number.isInteger(memberIndex) && leagueLabels[memberIndex]
    ? leagueLabels[memberIndex]
    : "Lega Pokémon";
}

async function completeStart(
  serviceClient: SupabaseClient,
  battleId: string,
  success: boolean,
  error?: string
) {
  const result = await serviceClient.rpc("complete_discord_admin_battle_notification", {
    p_battle_id: battleId,
    p_success: success,
    p_error: error || null
  });
  if (result.error) console.error("Unable to finalize Discord battle notification", result.error.message);
}

async function completeTurn(
  serviceClient: SupabaseClient,
  battleId: string,
  battleVersion: number,
  success: boolean,
  error?: string
) {
  const result = await serviceClient.rpc("complete_discord_admin_battle_turn_notification", {
    p_battle_id: battleId,
    p_battle_version: battleVersion,
    p_success: success,
    p_error: error || null
  });
  if (result.error) console.error("Unable to finalize Discord admin-turn notification", result.error.message);
}

async function deliver(
  claim: NotificationClaim,
  completeNotification: (success: boolean, error?: string) => Promise<void>,
  message: (username: string, opponent: string, adminBattleUrl: string) => string
) {
  const battleId = String(claim.battle_id || "");
  const webhookUrl = Deno.env.get(WEBHOOK_SECRET_NAME) || "";
  if (!isDiscordWebhookUrl(webhookUrl)) {
    await completeNotification(false, "webhook_not_configured");
    console.error(`${WEBHOOK_SECRET_NAME} is missing or invalid`);
    return;
  }

  const username = String(claim.username || "Giocatore").slice(0, 80);
  const adminBattleUrl = `${APP_URL}/admin/battle/${encodeURIComponent(String(claim.auth_user_id || ""))}/${encodeURIComponent(battleId)}`;
  const content = message(username, opponentLabel(claim), adminBattleUrl).slice(0, 2_000);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DELIVERY_TIMEOUT_MS);

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        content,
        allowed_mentions: { parse: [] }
      })
    });

    if (!response.ok) {
      await completeNotification(false, `discord_http_${response.status}`);
      console.error("Discord battle notification failed", response.status);
      return;
    }
    await completeNotification(true);
  } catch (error) {
    const reason = error instanceof DOMException && error.name === "AbortError"
      ? "discord_timeout"
      : "discord_network_error";
    await completeNotification(false, reason);
    console.error("Discord battle notification failed", reason);
  } finally {
    clearTimeout(timeout);
  }
}

export async function notifyDiscordAdminBattleStarted(
  serviceClient: SupabaseClient,
  battleId: string
) {
  if (!battleId) return;

  const claimed = await serviceClient.rpc("claim_discord_admin_battle_notification", {
    p_battle_id: battleId
  });
  if (claimed.error) {
    console.error("Unable to claim Discord battle notification", claimed.error.message);
    return;
  }

  const claim = claimed.data as NotificationClaim | null;
  if (!claim?.send) return;

  await deliver(
    claim,
    (success, error) => completeStart(serviceClient, battleId, success, error),
    (username, opponent, url) => `Nuova sfida amministrata\nGiocatore: ${username}\nAvversario: ${opponent}\nApri il pannello admin: ${url}`
  );
}

export async function notifyDiscordAdminBattleTurnReady(
  serviceClient: SupabaseClient,
  battle: Record<string, unknown> | null | undefined
) {
  const battleId = String(battle?.battle_id || "");
  const battleVersion = Number(battle?.battle_version);
  if (!battleId || !Number.isInteger(battleVersion) || battleVersion < 1) return;

  const claimed = await serviceClient.rpc("claim_discord_admin_battle_turn_notification", {
    p_battle_id: battleId,
    p_battle_version: battleVersion
  });
  if (claimed.error) {
    console.error("Unable to claim Discord admin-turn notification", claimed.error.message);
    return;
  }

  const claim = claimed.data as NotificationClaim | null;
  if (!claim?.send) return;

  await deliver(
    claim,
    (success, error) => completeTurn(serviceClient, battleId, battleVersion, success, error),
    (username, opponent, url) => `È il turno dell'amministratore\nGiocatore: ${username}\nAvversario: ${opponent}\nApri il pannello admin: ${url}`
  );
}
