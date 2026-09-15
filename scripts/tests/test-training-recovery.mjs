import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../../app/client/training-zone-handler.js", import.meta.url), "utf8");
function section(start, end) {
  const index = source.indexOf(start);
  assert.ok(index >= 0);
  return source.slice(index, source.indexOf(end, index));
}
const recovery = section("function recoverAuthoritativeTrainingStart(", "export function recoverPendingAuthoritativeDebugTrainingStart(");
const restore = section("function restorePreparedTrainingResult(", "function trainingSceneFrom(");
for (const status of ["prepared", "active", "needs_player_switch", "concluded"]) {
  const state = { scene: { name: "training-zone" }, authoritativeRevision: 10 };
  const team = [{ name: "Frozen opponent" }], messages = [], opened = [];
  const battle = { battle_id: "same-battle", battle_version: 3, contract_key: "training",
    training_difficulty: "hard", status, runtime_owner_id: "owner" };
  const context = vm.createContext({ state, crypto: { randomUUID: () => "read-command" },
    authoritativeBattleRuntimeOwnerId: () => "owner", render() {},
    getAuthoritativeBattle: async () => ({ ok: true, battle, playerRevision: 12, events: [] }),
    authoritativeTrainingPreview: () => ({ opponent: { name: "Original trainer" }, team }),
    setScene: scene => { assert.equal(state.battleStartPending, false, "Unlock the controls before rendering the recovered preview"); state.scene = scene; },
    openAuthoritativeBattleProjection: value => opened.push(value),
    openMessage: lines => messages.push(lines), messageDescriptor: value => value, textDescriptor: value => value,
    clearPendingDebugTrainingStart() {}
  });
  vm.runInContext(recovery + restore, context);
  const recovered = await context.recoverAuthoritativeTrainingStart({ code: "revision_conflict" }, state.scene);
  assert.equal(state.battleStartPending, false);
  if (status === "prepared") {
    assert.equal(recovered, true);
    assert.equal(state.authoritativeRevision, 12);
    assert.equal(state.scene.trainingPreparedBattle.battleId, "same-battle");
    assert.equal(state.scene.trainingPreparedBattle.battleVersion, 3);
    assert.equal(state.scene.trainingOpponentTeam, team);
    assert.equal(state.scene.trainingDifficulty, "hard");
    assert.equal(state.scene.trainingAuthoritativeReady, true);
    assert.equal(opened.length, 0, "A prepared battle returns to its preview, not combat");
    assert.equal(messages.length, 0, "Successful recovery must not show a state-changed error");
  } else if (status !== "concluded") {
    assert.equal(recovered, true);
    assert.equal(opened[0], battle, "Keep recovery of an activation that already committed");
  } else {
    assert.equal(recovered, false);
    assert.equal(messages.length, 1);
  }
}
console.log("Training recovery: prepared opponent/identity/revision retained, active battles resumed, terminal battles excluded.");

const discardSource = section("export function discardPreparedAuthoritativeTraining(", "function recoverAuthoritativeTrainingStart(").replace("export function", "function");
for (const outcome of ["success", "conflict", "active", "different", "uncertain", "navigation", "stale-read"]) {
  const scene = { name: "training-zone", trainingPreparedBattle: { battleId: "preview", battleVersion: 3 }, trainingOpponentTeam: [{}] };
  const state = { scene, authoritativeRevision: 10 };
  const calls = [], reads = [], messages = [];
  const context = vm.createContext({ state, render() {}, authoritativeBattleRuntimeOwnerId: () => "new-tab",
    discardAuthoritativeTrainingBattle: async input => {
      calls.push({ ...input });
      return outcome === "success" || calls.length === 2 ? { ok: true, playerRevision: 12 }
        : { ok: false, code: "revision_conflict", uncertain: outcome === "uncertain" };
    },
    getAuthoritativeBattle: async id => {
      reads.push(id);
      if (outcome === "navigation") state.scene = { name: "team" };
      if (outcome === "stale-read") state.authoritativeRevision = 15;
      return { ok: true, playerRevision: 11, battle: { battle_id: outcome === "different" ? "other" : "preview",
        battle_version: 4, contract_key: "training", status: outcome === "active" ? "active" : "prepared" } };
    },
    openMessage: lines => messages.push(lines), messageDescriptor: value => value, textDescriptor: value => value
  });
  vm.runInContext(discardSource, context);
  const discarded = await context.discardPreparedAuthoritativeTraining(scene);
  assert.equal(state.battleStartPending, false);
  assert.equal(discarded, ["success", "conflict"].includes(outcome), outcome);
  assert.equal(calls.length, outcome === "conflict" ? 2 : 1, "At most one retry of the same still-prepared battle: " + outcome);
  if (outcome === "conflict") {
    assert.equal(calls[1].expectedPlayerRevision, 11);
    assert.equal(calls[1].expectedBattleVersion, 4);
    assert.equal(calls[1].battleId, "preview");
    assert.equal(scene.trainingPreparedBattle, null);
    assert.equal(messages.length, 0);
  }
  if (outcome === "uncertain") assert.equal(reads.length, 0, "Do not retry uncertain mutations with a new command");
}
console.log("Training replacement client: success, bounded revision recovery, active/changed battle and navigation protection passed.");
