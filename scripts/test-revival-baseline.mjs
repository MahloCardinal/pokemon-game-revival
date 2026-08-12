import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const config = read("app/api/supabase-config.js");
const supabaseConfig = read("supabase/config.toml");
const edge = read("supabase/functions/battle-command/index.ts");
const schema = read("supabase/migrations/20260812000000_revival_baseline.sql");
const engine = read("app/engine/battle-runtime.js");

assert.match(config, /https:\/\/etotvaneppzkxunezqrl\.supabase\.co/);
assert.doesNotMatch(config, /ompjckjbvauemoxwggdi|viliofosdnmfnfboqnwu|web-gdr-staging/);
assert.match(engine, /BATTLE_ENGINE_VERSION = "pokemon-game-revival"/);
assert.match(edge, /requireServerRole\(clients\.serviceClient, clients\.userId, "debug"\)/);
assert.match(edge, /requireRevivalProject\(\)/);

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

console.log("Revival baseline contract checks passed.");
