import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

const source = readFileSync(new URL("../supabase/functions/battle-command/index.ts", import.meta.url), "utf8");
const manifest = JSON.parse(readFileSync(new URL("../supabase/functions/_shared/game-runtime/manifest.json", import.meta.url)));
const previous = "3ddd1a5af3bd3137b05d5c9b9bf4a0977e9f63a09204819ecf66f1f1cfc97774";
let restores = 0;
const context = vm.createContext({
  manifest, BATTLE_ENGINE_VERSION: "pokemon-game-revival",
  BattleEdgeError: Error,
  restoreBattleManager: () => { restores++; return { manager: {}, playerItems: [] }; },
  projectBattle: (_manager, state) => state
});
vm.runInContext(stripTypeScriptTypes(source.slice(source.indexOf("function canProjectBattleRuntime("), source.indexOf("function projectionForDatabase("))), context);
vm.runInContext(stripTypeScriptTypes(source.slice(source.indexOf("function domeProjectionFromPrepared("), source.indexOf("async function prepareDome("))), context);

for (const project of [context.projectionFromPrepared, context.domeProjectionFromPrepared]) {
  for (const status of ["active", "needs_player_switch", "concluded", "abandoned"]) {
    for (const checksum of [manifest.bundleChecksum, previous, "unknown"]) {
      const battle = { status, engine_version: "pokemon-game-revival", engine_checksum: checksum, engine_snapshot: {} };
      const allowed = checksum === manifest.bundleChecksum || checksum === previous && ["concluded", "abandoned"].includes(status);
      const before = restores;
      if (allowed) {
        assert.equal(project({ battle }).status, status);
        assert.equal(restores, before + 1);
      } else {
        assert.throws(() => project({ battle }), /incompatible_active_battle/);
        assert.equal(restores, before, "Incompatible snapshots must not be restored");
      }
      assert.throws(() => project({ battle: { ...battle, engine_version: "unknown" } }));
    }
  }
}
// An unrelated future runtime must not inherit this exception automatically.
manifest.bundleChecksum = "future-runtime";
assert.equal(context.canProjectBattleRuntime({ status: "concluded", engine_version: "pokemon-game-revival", engine_checksum: previous }), false);
console.log("Capture release: terminal projections allowed; active and unknown runtimes rejected.");
