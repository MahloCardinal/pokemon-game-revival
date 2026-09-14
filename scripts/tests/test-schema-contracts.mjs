import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { BATTLE_SNAPSHOT_VERSION } from "../../app/engine/battle-runtime.js";

const read = path => readFileSync(new URL("../../" + path, import.meta.url), "utf8");
const schema = read("supabase/baseline/schema.sql");
const metadata = JSON.parse(read("supabase/baseline/metadata.json"));
const manifest = JSON.parse(read("supabase/functions/_shared/game-runtime/manifest.json"));
assert.equal(metadata.projectRef, "etotvaneppzkxunezqrl");
assert.match(metadata.through_migration, /^\d{14}$/);
assert.equal(manifest.snapshotVersion, BATTLE_SNAPSHOT_VERSION);
// The baseline contains the actual current definitions, not an inferred sequence
// of historical CREATE statements and dynamic migration patches.
function body(name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = schema.match(new RegExp(`CREATE (?:OR REPLACE )?FUNCTION "server_authority_private"\\."${escaped}"[\\s\\S]*?\\bAS (\\$[\\w]*\\$)([\\s\\S]*?)\\1;`));
  assert.ok(match, `Missing current function ${name}`);
  return match[2];
}
const prepare = ["prepare_edge_battle_command", "prepare_edge_battle_command_with_inventory",
  "prepare_edge_battle_command_with_contract_items", "prepare_edge_battle_command_with_roster", "prepare_edge_battle_command_core"];
for (let i = 0; i < prepare.length; i++) {
  const calls = prepare.filter(name => body(prepare[i]).includes(`server_authority_private.${name}(`));
  assert.deepEqual(calls, i === prepare.length - 1 ? [] : [prepare[i + 1]], "Preparation must remain acyclic and terminate at core");
}
const progression = body("create_terminal_ordinary_progression");
assert.match(progression, /v_badges\s*:=\s*least\(8,\s*greatest\(0,\s*v_profile\.badges\)\)/);
assert.ok(progression.indexOf("if found then return") < progression.indexOf("v_badges:="), "Replays preserve the frozen progression");
assert.match(body("award_terminal_gym_victory_core"), /when 'item' then quantity > 0 and item_index is not null/);
assert.doesNotMatch(body("raise_revision_conflict"), /errcode\s*=\s*'40001'/i);
for (const table of ["authoritative_battle", "battle_dome_battle", "player_pokemon_instance", "player_profile_state"]) {
  assert.ok(schema.includes(`ALTER TABLE "public"."${table}" ENABLE ROW LEVEL SECURITY;`), `${table} must preserve RLS`);
}
assert.ok(metadata.scheduled_jobs.some(job => job.name === "revival-battle-dome-midnight" && job.active));
assert.ok(metadata.scheduled_jobs.some(job => job.name === "revival-terminal-retention-hourly" && job.active));
assert.ok(metadata.publications.some(publication => publication.tables.includes("public.authoritative_battle")));
console.log("Current schema: preparation chain, post-badge EXP, reward validation, application conflicts, RLS, retention and realtime passed.");
