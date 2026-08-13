import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const config = read("app/api/supabase-config.js");
const supabaseConfig = read("supabase/config.toml");
const edge = read("supabase/functions/battle-command/index.ts");
const schema = read("supabase/migrations/20260812000000_revival_baseline.sql");
const engine = read("app/engine/battle-runtime.js");
const main = read("app/client/main.js");
const deploymentWatcher = read("app/client/deployment-version.js");
const deploymentEndpoint = read("api/deployment-version.js");
const vercel = read("vercel.json");
const migrationDirectory = new URL("../supabase/migrations/", import.meta.url);
const migrationSql = readdirSync(migrationDirectory)
  .filter((name) => name.endsWith(".sql"))
  .sort()
  .map((name) => readFileSync(new URL(name, migrationDirectory), "utf8"))
  .join("\n");

assert.match(config, /https:\/\/etotvaneppzkxunezqrl\.supabase\.co/);
assert.doesNotMatch(config, /ompjckjbvauemoxwggdi|viliofosdnmfnfboqnwu|web-gdr-staging/);
assert.match(engine, /BATTLE_ENGINE_VERSION = "pokemon-game-revival"/);
assert.match(edge, /requireServerRole\(clients\.serviceClient, clients\.userId, "debug"\)/);
assert.match(edge, /requireRevivalProject\(\)/);
assert.doesNotMatch(main, /app-version|AppVersion/);
assert.doesNotMatch(vercel, /app-version\.json/);
assert.match(main, /initializeDeploymentWatcher/);
assert.match(deploymentWatcher, /\/api\/deployment-version/);
assert.match(deploymentWatcher, /shouldDeferReloadForActiveBattle/);
assert.match(deploymentEndpoint, /VERCEL_GIT_COMMIT_SHA/);

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

console.log("Revival baseline contract checks passed.");
