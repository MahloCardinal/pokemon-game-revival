import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

const source = readFileSync(new URL("../../supabase/functions/battle-command/index.ts", import.meta.url), "utf8");
const manifest = JSON.parse(readFileSync(new URL("../../supabase/functions/_shared/game-runtime/manifest.json", import.meta.url)));
const previous = "a".repeat(64);
let restores = 0;
const context = vm.createContext({
  manifest, BATTLE_SNAPSHOT_VERSION: 3, BATTLE_ENGINE_VERSION: "pokemon-game-revival",
  BattleEdgeError: Error,
  restoreBattleManager: () => { restores++; return { manager: {}, playerItems: [] }; },
  projectBattle: (_manager, state) => state
});
vm.runInContext(stripTypeScriptTypes(source.slice(source.indexOf("function canProjectBattleRuntime("), source.indexOf("function projectionForDatabase("))), context);
vm.runInContext(stripTypeScriptTypes(source.slice(source.indexOf("function domeProjectionFromPrepared("), source.indexOf("async function prepareDome("))), context);

for (const project of [context.projectionFromPrepared, context.domeProjectionFromPrepared]) {
  for (const status of ["active", "needs_player_switch", "concluded", "abandoned"]) {
    for (const checksum of [manifest.bundleChecksum, previous, "unknown"]) {
      const battle = { status, engine_version: "pokemon-game-revival", engine_checksum: checksum, engine_snapshot: { snapshotVersion: 3, engineVersion: "pokemon-game-revival" } };
      const before = restores;
      assert.equal(project({ battle }).status, status);
      assert.equal(restores, before + 1);
      assert.throws(() => project({ battle: { ...battle, engine_version: "unknown" } }));
    }
  }
}
// A changed state contract requires an explicit migration.
manifest.bundleChecksum = "future-runtime";
assert.equal(context.canProjectBattleRuntime({ status: "active", engine_version: "pokemon-game-revival", engine_snapshot: { engineVersion: "pokemon-game-revival", snapshotVersion: 4 } }), false);
console.log("Runtime projection: code changes accepted; incompatible snapshot schemas rejected.");
