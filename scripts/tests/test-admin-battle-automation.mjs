import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

const source = readFileSync(new URL("../../supabase/functions/battle-command/index.ts", import.meta.url), "utf8");
const start = source.indexOf("async function advanceAutomaticAdminBattle(");
const end = source.indexOf("async function drainAutomaticAdminBattles(", start);
assert.ok(start >= 0 && end > start);
const calls = [];
const context = vm.createContext({
  readAdminAutomation: async () => { calls.push("setting"); return { enabled: true, updated_by: "admin" }; },
  databaseError: error => new Error(error.message)
});
vm.runInContext(stripTypeScriptTypes(source.slice(start, end)), context);
const client = { rpc: async name => { calls.push(name); return { data: { battle: null } }; } };
for (const contract of ["capture", "training", "gym", "battle_tower", "tackle_test", "battle_dome", undefined]) {
  calls.length = 0;
  const result = { battle: { battle_id: "battle", contract_key: contract }, events: [{ type: "move" }] };
  assert.equal(await context.advanceAutomaticAdminBattle(client, "battle", result), result);
  assert.deepEqual(calls, [], "Ordinary battles and receipt replays must bypass admin automation: " + contract);
}
for (const contract of ["admin_gym", "league", "debug_training"]) {
  calls.length = 0;
  const result = { battle: { battle_id: "battle", contract_key: contract } };
  assert.equal(await context.advanceAutomaticAdminBattle(client, "battle", result), result);
  assert.deepEqual(calls, ["setting", "prepare_edge_admin_gym_battle"], "Preserve admin automation: " + contract);
}
calls.length = 0;
assert.equal(await context.advanceAutomaticAdminBattle(client, "battle"), null);
assert.deepEqual(calls, ["setting", "prepare_edge_admin_gym_battle"], "The filtered admin queue can prepare without a command result");
console.log("Admin automation: ordinary commands/replays bypass admin preparation; eligible battles and queue retain it.");
