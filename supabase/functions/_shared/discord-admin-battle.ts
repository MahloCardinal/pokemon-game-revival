import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.108.2";

const APP_URL = "https://pokemon-game-revival.vercel.app";
const WEBHOOK_SECRET_NAME = "DISCORD_ADMIN_BATTLE_WEBHOOK_URL";
const DELIVERY_TIMEOUT_MS = 5_000;

type NotificationClaim = {
  send?: boolean;
  battle_id?: string;
  auth_user_id?: string;
  username?: string;
  contract_key?: string;
  gym_key?: string | null;
  league_member_index?: number | null;
};

const gymLabels: Record<string, string> = {
  "isola-cannella": "Isola Cannella · Blaine",
  smeraldopoli: "Smeraldopoli · Giovanni"
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

async function complete(
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

  const webhookUrl = Deno.env.get(WEBHOOK_SECRET_NAME) || "";
  if (!isDiscordWebhookUrl(webhookUrl)) {
    await complete(serviceClient, battleId, false, "webhook_not_configured");
    console.error(`${WEBHOOK_SECRET_NAME} is missing or invalid`);
    return;
  }

  const username = String(claim.username || "Giocatore").slice(0, 80);
  const adminBattleUrl = `${APP_URL}/admin/battle/${encodeURIComponent(String(claim.auth_user_id || ""))}/${encodeURIComponent(battleId)}`;
  const isLeague = claim.contract_key === "league";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DELIVERY_TIMEOUT_MS);

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        allowed_mentions: { parse: [] },
        embeds: [{
          title: isLeague ? "Nuova sfida alla Lega Pokémon" : "Nuova sfida in Palestra",
          url: adminBattleUrl,
          color: isLeague ? 0xf1c40f : 0xe74c3c,
          description: `Il giocatore **${username}** attende un amministratore.`,
          fields: [
            { name: "Avversario", value: opponentLabel(claim), inline: true },
            { name: "Battaglia", value: `[Apri il pannello admin](${adminBattleUrl})`, inline: false }
          ],
          timestamp: new Date().toISOString()
        }]
      })
    });

    if (!response.ok) {
      await complete(serviceClient, battleId, false, `discord_http_${response.status}`);
      console.error("Discord battle notification failed", response.status);
      return;
    }
    await complete(serviceClient, battleId, true);
  } catch (error) {
    const reason = error instanceof DOMException && error.name === "AbortError"
      ? "discord_timeout"
      : "discord_network_error";
    await complete(serviceClient, battleId, false, reason);
    console.error("Discord battle notification failed", reason);
  } finally {
    clearTimeout(timeout);
  }
}
