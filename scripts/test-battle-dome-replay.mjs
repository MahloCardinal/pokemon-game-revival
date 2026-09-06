import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

const source = readFileSync(new URL("../supabase/functions/battle-command/index.ts", import.meta.url), "utf8");
const start = source.indexOf("async function prepareDome(");
const end = source.indexOf("async function initializeDomeIfNeeded(", start);
assert.ok(start > 0 && end > start);
const context = vm.createContext({
  sha256: async value => JSON.stringify(value), uuid: value => value,
  BATTLE_ENGINE_VERSION: "fixture", manifest: { bundleChecksum: "fixture-checksum" },
  projectionForDatabase: value => value,
  domeProjectionFromPrepared: prepared => prepared.canonicalProjection,
  databaseError: error => Object.assign(new Error(error.message), { code: error.code })
});
vm.runInContext(stripTypeScriptTypes(source.slice(start, end)), context);
const body = { battleId: "battle", commandId: "command", expectedBattleVersion: 5 };
const prepared = { battle: { battle_id: "battle", battle_version: 5 }, viewer_role: "creator", input_snapshot_hash: "input" };
const canonical = { battle: { battle_id: "battle", battle_version: 7 }, viewer_role: "creator",
  canonicalProjection: { battle_id: "battle", battle_version: 7, status: "concluded", state: "committed" } };
const transition = { snapshot: { speculative: true }, events: [{ type: "speculative" }],
  projection: { state: "not persisted", status: "active" } };
function client(sequence) {
  return { async rpc(name, args) {
    const expected = sequence.shift();
    assert.ok(expected, `Unexpected RPC ${name}`);
    assert.equal(name, expected.name);
    expected.check?.(args);
    return expected.result;
  } };
}
{
  const calls = [
    { name: "commit_edge_battle_dome_command", result: { data: { ok: true, replayed: true,
      battle: { battle_version: 6 }, events: [{ type: "old receipt" }] } } },
    { name: "prepare_edge_battle_dome", check: args => assert.equal(args.p_battle_id, "battle"), result: { data: canonical } }
  ];
  const result = await context.commitDome(client(calls), "user", body, prepared, "move", transition);
  assert.equal(result.battle, canonical.canonicalProjection, "A replay must use current canonical state");
  assert.equal(result.events.length, 0, "Receipt events must not animate twice");
  assert.equal(result.replayed, true);
  assert.equal(calls.length, 0);
}
{
  const calls = [{ name: "commit_edge_battle_dome_command", result: { data: { ok: true,
    battle: { battle_version: 6 }, events: [{ type: "committed" }] } } }];
  const result = await context.commitDome(client(calls), "user", body, prepared, "move", transition);
  assert.equal(result.battle.battle_version, 6);
  assert.equal(result.battle.state, transition.projection.state);
  assert.equal(result.events[0].type, "committed");
  assert.equal(calls.length, 0);
}
for (const timing of ["preflight", "during preparation", "new command", "real conflict"]) {
  const calls = [{ name: "replay_edge_battle_dome_command", check: args => {
    assert.equal(args.p_command_type, "move");
    assert.equal(args.p_command_id, "command");
    assert.equal(args.p_command_hash, JSON.stringify({ commandType: "move", envelope: body }));
  }, result: { data: timing === "preflight" ? { ok: true } : null } }];
  if (timing === "preflight") calls.push({ name: "prepare_edge_battle_dome", result: { data: canonical } });
  else {
    calls.push({ name: "prepare_edge_battle_dome", result: { data: timing === "new command" ? prepared : canonical } });
    if (timing !== "new command") {
      calls.push({ name: "replay_edge_battle_dome_command", result: { data: timing === "real conflict" ? null : { ok: true } } });
      if (timing !== "real conflict") calls.push({ name: "prepare_edge_battle_dome", result: { data: canonical } });
    }
  }
  const operation = context.prepareDomeCommand(client(calls), "user", body, "move");
  if (timing === "real conflict") await assert.rejects(operation, error => error.code === "40001");
  else {
    const result = await operation;
    if (timing === "new command") {
      assert.equal(result.prepared, prepared);
      assert.equal(result.replay, null);
    } else {
      assert.equal(result.prepared, null);
      assert.equal(result.replay.battle, canonical.canonicalProjection);
      assert.equal(result.replay.events.length, 0);
    }
  }
  assert.equal(calls.length, 0, timing);
}
await assert.rejects(context.commitDome(client([{ name: "commit_edge_battle_dome_command",
  result: { error: { code: "22023", message: "command id reused" } } }]), "user", body, prepared, "move", transition),
  error => error.code === "22023");
console.log("Battle Dome replay: preflight race, transaction replay, canonical projection and genuine conflicts passed.");
