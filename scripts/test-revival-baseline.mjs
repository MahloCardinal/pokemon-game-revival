import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const config = read("app/api/supabase-config.js");
const supabaseConfig = read("supabase/config.toml");
const edge = read("supabase/functions/battle-command/index.ts");
const discordBattleEdge = read("supabase/functions/_shared/discord-admin-battle.ts");
const recoveryEdge = read("supabase/functions/request-password-recovery/index.ts");
const schema = read("supabase/migrations/20260812000000_revival_baseline.sql");
const engine = read("app/engine/battle-runtime.js");
const main = read("app/client/main.js");
const supabaseApi = read("app/api/supabase.js");
const session = read("app/client/session.js");
const deploymentWatcher = read("app/client/deployment-version.js");
const deploymentEndpoint = read("api/deployment-version.js");
const vercel = read("vercel.json");
const missionCatalog = read("app/data/pokefan-missions.js");
const missionRuntime = read("app/client/mission-runtime.js");
const missionReset = read("app/client/mission-reset.js");
const missionView = read("app/view/pokefan.js");
const shoppingCenter = read("app/data/shopping-center.js");
const itemCatalog = read("app/data/items.js");
const teamRuleItems = read("app/data/team-rule-items.js");
const catalogGenerator = read("scripts/generate-catalog-seed.mjs");
const gameDataChangeGenerator = read("scripts/create-game-data-change.mjs");
const discordAudienceMigration = read("supabase/migrations/20260814131000_notify_all_admin_battle_players.sql");
const discordTurnMigration = read("supabase/migrations/20260814132000_admin_battle_turn_discord_notifications.sql");
const renderUtils = read("app/client/render-utils.js");
const zoneTexts = read("app/data/zones-text.js");
const gymsView = read("app/view/gyms.js");
const gymsHandler = read("app/client/gyms-handler.js");
const migrationDirectory = new URL("../supabase/migrations/", import.meta.url);
const migrationSql = readdirSync(migrationDirectory)
  .filter((name) => name.endsWith(".sql"))
  .sort()
  .map((name) => readFileSync(new URL(name, migrationDirectory), "utf8"))
  .join("\n");

assert.match(config, /https:\/\/etotvaneppzkxunezqrl\.supabase\.co/);
assert.doesNotMatch(config, /ompjckjbvauemoxwggdi|viliofosdnmfnfboqnwu|web-gdr-staging/);
assert.match(supabaseConfig, /site_url = "https:\/\/pokemon-game-revival\.vercel\.app"/);
assert.match(supabaseConfig, /additional_redirect_urls = \[[^\]]*"https:\/\/pokemon-game-revival\.vercel\.app\/auth\/recovery"/);
assert.match(engine, /BATTLE_ENGINE_VERSION = "pokemon-game-revival"/);
assert.match(edge, /requireServerRole\(clients\.serviceClient, clients\.userId, "debug"\)/);
assert.match(edge, /requireRevivalProject\(\)/);
const debugTrainingAction = edge.slice(
  edge.indexOf('if (action === "start_debug_training")'),
  edge.indexOf('if (action === "start_capture")')
);
const adminGymAction = edge.slice(
  edge.indexOf('if (action === "start_admin_gym")'),
  edge.indexOf('if (action === "start_league")')
);
const leagueAction = edge.slice(
  edge.indexOf('if (action === "start_league")'),
  edge.indexOf('if (action === "start_tower")')
);
assert.match(adminGymAction, /initializeAndNotifyAdminBattle/);
assert.match(leagueAction, /initializeAndNotifyAdminBattle/);
assert.doesNotMatch(debugTrainingAction, /notifyDiscord|initializeAndNotifyAdminBattle/);
assert.match(discordBattleEdge, /DISCORD_ADMIN_BATTLE_WEBHOOK_URL/);
assert.match(discordBattleEdge, /\["discord\.com", "discordapp\.com"\]/);
assert.match(discordBattleEdge, /allowed_mentions:\s*\{ parse: \[\] \}/);
assert.match(discordBattleEdge, /content,/);
assert.match(discordBattleEdge, /notifyDiscordAdminBattleTurnReady/);
assert.doesNotMatch(discordBattleEdge, /debug_training/);
assert.match(edge, /projectionForDatabase\(projection\)/);
assert.match(edge, /notifyAdminTurnBestEffort\(clients\.serviceClient, result/);
assert.match(renderUtils, /\.normalize\("NFD"\)/);
assert.match(zoneTexts, /"Centro Pokémon"/);
assert.match(zoneTexts, /"Club Pokéfan"/);
assert.doesNotMatch(gymsView, /Completa le Missioni avventura ["']?\s*\+\s*adventurePhaseForGym/);
assert.doesNotMatch(gymsHandler, /Completa le Missioni avventura ["']?\s*\+\s*adventurePhaseForGym/);
assert.match(gymsView, /Completa le Missioni avventura necessarie/);
assert.match(recoveryEdge, /https:\/\/pokemon-game-revival\.vercel\.app\/auth\/recovery/);
assert.match(recoveryEdge, /resetPasswordForEmail\(email,[\s\S]*redirectTo:\s*RECOVERY_REDIRECT_URL/);
assert.doesNotMatch(recoveryEdge, /Deno\.env\.get\("APP_URL"\)|localhost|web-gdr-staging/);
assert.match(supabaseApi, /detectSessionInUrl:\s*true/);
assert.match(supabaseApi, /auth\.updateUser\(\{ password: normalizedPassword \}\)/);
assert.match(session, /event === "PASSWORD_RECOVERY"/);
assert.match(vercel, /"source": "\/\(\.\*\)", "destination": "\/index\.html"/);
assert.doesNotMatch(main, /app-version|AppVersion/);
assert.doesNotMatch(vercel, /app-version\.json/);
assert.match(main, /initializeDeploymentWatcher/);
assert.match(deploymentWatcher, /\/api\/deployment-version/);
assert.match(deploymentWatcher, /shouldDeferReloadForActiveBattle/);
assert.match(deploymentEndpoint, /VERCEL_GIT_COMMIT_SHA/);
for (const missionSource of [missionCatalog, missionRuntime, missionReset, missionView, catalogGenerator]) {
  assert.doesNotMatch(missionSource, /repeatable|ripetibil/i);
}
assert.match(shoppingCenter, /entry\.price === null/);
assert.match(catalogGenerator, /purchasePrice === null/);
assert.match(gameDataChangeGenerator, /begin_game_data_change/);
assert.match(gameDataChangeGenerator, /finish_game_data_change/);

for (const functionName of [
  "register-with-username",
  "login-with-username",
  "request-password-recovery",
  "delete-account",
  "battle-command"
]) {
  assert.match(supabaseConfig, new RegExp(`\\[functions\\.${functionName}\\][\\s\\S]*?verify_jwt = true`));
}

assert.match(schema, /CREATE FUNCTION "public"\."execute_debug_command"/);
assert.match(schema, /CREATE FUNCTION "public"\."complete_debug_mission"/);
assert.match(schema, /new\.role_key = 'debug'.*v_username_normalized is distinct from 'aaa'/s);
assert.match(schema, /revival-terminal-retention-hourly/);
assert.match(schema, /delete from public\.authoritative_battle_tower_run/s);
assert.doesNotMatch(schema, /CREATE TABLE "public"\."player_battle"\s*\(/);
assert.doesNotMatch(schema, /CREATE TABLE "public"\."player_battle_events"\s*\(/);
assert.doesNotMatch(schema, /tackle_test_v1|starter-v1|shop-v1|garden-v1|wild-encounter-v1|web-gdr-js-battle-v1/);

const versionedFunctionNames = Array.from(schema.matchAll(/CREATE (?:OR REPLACE )?FUNCTION "[^"]+"\."([^"]+)"/g))
  .map((match) => match[1])
  .filter((name) => /_v\d+$/.test(name));
assert.deepEqual(versionedFunctionNames, []);

const canonicalPrepareFunctions = [
  "prepare_edge_battle_command",
  "prepare_edge_battle_command_with_inventory",
  "prepare_edge_battle_command_with_contract_items",
  "prepare_edge_battle_command_with_roster",
  "prepare_edge_battle_command_core"
];

function regexpEscape(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function finalFunctionBody(schemaName, functionName) {
  const schema = regexpEscape(schemaName);
  const name = regexpEscape(functionName);
  const pattern = new RegExp(
    `create(?: or replace)? function\\s+(?:"${schema}"|${schema})\\.(?:"${name}"|${name})\\s*\\([\\s\\S]*?\\)\\s*returns\\s+[\\s\\S]*?\\bas\\s+(\\$[A-Za-z0-9_]*\\$)([\\s\\S]*?)\\1\\s*;`,
    "gi"
  );
  const matches = Array.from(migrationSql.matchAll(pattern));
  assert.ok(matches.length > 0, `Missing ${schemaName}.${functionName}`);
  return matches.at(-1)[2];
}

const prepareDependencies = new Map(canonicalPrepareFunctions.map((functionName) => {
  const body = finalFunctionBody("server_authority_private", functionName);
  const dependencies = canonicalPrepareFunctions.filter((candidate) => {
    const callPattern = new RegExp(
      `server_authority_private\\.(?:"${regexpEscape(candidate)}"|${regexpEscape(candidate)})\\s*\\(`,
      "i"
    );
    return callPattern.test(body);
  });
  return [functionName, dependencies];
}));

assert.deepEqual(prepareDependencies.get("prepare_edge_battle_command"), ["prepare_edge_battle_command_with_inventory"]);
assert.deepEqual(prepareDependencies.get("prepare_edge_battle_command_with_inventory"), ["prepare_edge_battle_command_with_contract_items"]);
assert.deepEqual(prepareDependencies.get("prepare_edge_battle_command_with_contract_items"), ["prepare_edge_battle_command_with_roster"]);
assert.deepEqual(prepareDependencies.get("prepare_edge_battle_command_with_roster"), ["prepare_edge_battle_command_core"]);
assert.deepEqual(prepareDependencies.get("prepare_edge_battle_command_core"), []);

const completed = new Set();
const active = new Set();
function assertAcyclic(functionName) {
  if (completed.has(functionName)) return;
  assert.ok(!active.has(functionName), `Recursive canonical prepare pipeline at ${functionName}`);
  active.add(functionName);
  for (const dependency of prepareDependencies.get(functionName) || []) assertAcyclic(dependency);
  active.delete(functionName);
  completed.add(functionName);
}
for (const functionName of canonicalPrepareFunctions) assertAcyclic(functionName);

const gymRewardCore = finalFunctionBody("server_authority_private", "award_terminal_gym_victory_core");
assert.match(gymRewardCore, /reward_kind\s*=\s*'item'\s+and quantity\s*>\s*0\s+and item_index is not null\)\s*<>\s*1/i);
assert.match(migrationSql, /revival-gym-rewards-20260812/);
assert.match(migrationSql, /51ebd82cd1373b029f5b7e54aa8c3e5ee08732c7e05ce11b5ce3db12e048367f/);
assert.match(migrationSql, /lower\(account\.email\) = 'aaa@pokemon-game-revival\.local'/);
assert.match(migrationSql, /catalog repair did not converge on the active release/i);
assert.match(migrationSql, /update public\.player_mission_state[\s\S]*set catalog_release_id = active_catalog_id/i);
assert.match(migrationSql, /update server_authority_private\.runtime_catalog_config[\s\S]*set catalog_release_id = active_catalog_id/i);
assert.match(migrationSql, /development catalog consolidation did not converge on one baseline/i);
const missionActive = finalFunctionBody("server_authority_private", "mission_is_active");
assert.doesNotMatch(missionActive, /repeatable/i);
assert.match(migrationSql, /drop column repeatable/);
assert.match(migrationSql, /catalog_mission_category_key_check/);
assert.match(migrationSql, /set claim_status = 'claimed',\s*claim_count = claim_count \+ 1/i);
assert.match(migrationSql, /create table public\.game_data_change_set/i);
assert.match(migrationSql, /create table public\.game_data_change/i);
assert.match(migrationSql, /create constraint trigger ensure_game_data_change_completed/i);
assert.match(migrationSql, /create or replace function server_authority_private\.compute_game_data_checksum/i);
assert.match(migrationSql, /game_data_revision/i);
assert.match(migrationSql, /create table server_authority_private\.discord_admin_battle_notification/i);
assert.match(migrationSql, /contract_key not in \('admin_gym', 'league'\)/i);
assert.match(migrationSql, /grant execute on function public\.claim_discord_admin_battle_notification\(uuid\) to service_role/i);
assert.match(discordAudienceMigration, /contract_key not in \('admin_gym', 'league'\)/i);
assert.doesNotMatch(discordAudienceMigration, /username_normalized|debug_user|= 'aaa'/i);
assert.match(discordAudienceMigration, /where status = 'skipped'/i);
assert.match(discordTurnMigration, /primary key \(battle_id, battle_version\)/i);
assert.match(discordTurnMigration, /contract_key not in \('admin_gym', 'league'\)/i);
assert.match(discordTurnMigration, /waiting_for <> 'admin'/i);
assert.match(discordTurnMigration, /grant execute on function public\.claim_discord_admin_battle_turn_notification\(uuid, bigint\) to service_role/i);

const competitiveItemNames = Array.from(shoppingCenter.matchAll(
  /shopItem\(i\.([a-z0-9_]+), SHOPPING_CENTER_SECTIONS\.PORT, SHOPPING_CENTER_CATEGORIES\.COMPETITIVE,/g
)).map((match) => match[1]).sort();
const competitiveIndexes = competitiveItemNames.map((itemName) => {
  const definition = itemCatalog.match(new RegExp(`export const ${itemName} = normalizeItemDefinition\\(\\{[\\s\\S]*?index: (\\d+),`));
  assert.ok(definition, `Missing competitive item definition: ${itemName}`);
  return Number(definition[1]);
}).sort((left, right) => left - right);
const configuredCompetitiveIndexes = teamRuleItems.match(/PORT_COMPETITIVE_ITEM_INDEXES = \[([^\]]+)\]/)[1]
  .split(",").map((value) => Number(value.trim())).sort((left, right) => left - right);
assert.deepEqual(configuredCompetitiveIndexes, competitiveIndexes);

console.log("Revival baseline contract checks passed.");
