import { startAuthoritativeBattleTower } from "../api/battle.js";
import { openAuthoritativeBattleProjection } from "./battle-handler.js";
import { enforceBattleRuntimeSceneLock } from "./battle-scene-lock.js";
import { registerAction } from "./action-registry.js";
import { openMessage } from "./dialog-handler.js";
import { isDebugUser } from "./debug-tools.js";
import { state } from "./game-state.js";
import { render } from "./renderer.js";
import { messageDescriptor, textDescriptor } from "./i18n.js";

registerAction("battle-tower-start", function () {
  if (state.battleStartPending || enforceBattleRuntimeSceneLock()) { return; }
  if (!state.scene || state.scene.name !== "battle-tower") { return; }
  var teamCount = state.team.filter(Boolean).length;
  var tower = state.battleTower || {};
  if (tower.attemptedToday && !tower.runId && !isDebugUser()) {
    openMessage([messageDescriptor("battleTower.attemptedToday")], { title: textDescriptor("ui.sceneTitles.battleTower") });
    return;
  }
  if (teamCount < 3) {
    openMessage([messageDescriptor("battleTower.teamMinimum")], { title: textDescriptor("ui.sceneTitles.battleTower") });
    return;
  }
  state.battleStartPending = true;
  render();
  startAuthoritativeBattleTower({ expectedPlayerRevision: state.authoritativeRevision }).then(function (result) {
    state.battleStartPending = false;
    if (!result.ok || !result.battle) {
       openMessage([towerStartMessage(result)], { title: textDescriptor("ui.sceneTitles.battleTower") });
      render();
      return;
    }
    state.authoritativeRevision = result.playerRevision;
    openAuthoritativeBattleProjection(result.battle, result.events, { history: "push" });
  }).catch(function (error) {
    state.battleStartPending = false;
     openMessage([towerStartMessage(null)], { title: textDescriptor("ui.sceneTitles.battleTower") });
    render();
  });
});

function towerStartMessage(result) {
  return messageDescriptor(result && (result.code === "23505" || result.code === "tower_attempt_used")
    ? "battleTower.attemptedToday" : "battleTower.startFailed");
}
