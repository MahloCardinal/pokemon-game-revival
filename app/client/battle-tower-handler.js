import { startAuthoritativeBattleTower } from "../api/battle.js";
import { openAuthoritativeBattleProjection } from "./battle-handler.js";
import { enforceBattleRuntimeSceneLock } from "./battle-scene-lock.js";
import { registerAction } from "./action-registry.js";
import { openMessage } from "./dialog-handler.js";
import { isDebugUser } from "./debug-tools.js";
import { state } from "./game-state.js";
import { render } from "./renderer.js";

registerAction("battle-tower-start", function () {
  if (state.battleStartPending || enforceBattleRuntimeSceneLock()) { return; }
  if (!state.scene || state.scene.name !== "battle-tower") { return; }
  var teamCount = state.team.filter(Boolean).length;
  var tower = state.battleTower || {};
  if (tower.attemptedToday && !tower.runId && !isDebugUser()) {
    openMessage(["Hai già effettuato il tentativo di oggi"], { title: "Torre Lotta" });
    return;
  }
  if (teamCount < 3) {
    openMessage(["Devi avere almeno 3 Pokémon in squadra per partecipare alla Torre Lotta."], { title: "Torre Lotta" });
    return;
  }
  state.battleStartPending = true;
  render();
  startAuthoritativeBattleTower({ expectedPlayerRevision: state.authoritativeRevision }).then(function (result) {
    state.battleStartPending = false;
    if (!result.ok || !result.battle) {
       openMessage([towerStartMessage(result.message) || "Impossibile avviare la scalata."], { title: "Torre Lotta" });
      render();
      return;
    }
    state.authoritativeRevision = result.playerRevision;
    openAuthoritativeBattleProjection(result.battle, result.events, { history: "push" });
  }).catch(function (error) {
    state.battleStartPending = false;
     openMessage([towerStartMessage(error.message) || "Impossibile avviare la scalata."], { title: "Torre Lotta" });
    render();
  });
});

function towerStartMessage(message) {
  var text = String(message || "");
  return /authoritative_battle_tower_run_auth_user_id_attempt_date_key|Hai già effettuato il tentativo di oggi/i.test(text)
    ? "Hai già effettuato il tentativo di oggi" : text;
}
