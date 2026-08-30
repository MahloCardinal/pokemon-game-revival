import { registerAction, registerActionGuard } from "./action-registry.js";
import { state } from "./game-state.js";
import { render } from "./renderer.js";
import { readBattleTurnHistory } from "../api/battle-history.js";
import { applyAuthoritativeProjection, openPendingBattleEntryChoice } from "./battle-handler.js";
import { openMessage } from "./dialog-handler.js";
import { t } from "./i18n.js";

registerActionGuard(function (action) {
  var scene = state.scene;
  if (!scene || !scene.battleHistoryView && !scene.battleHistoryLoading) return true;
  if (["battle-history-open", "battle-history-live", "battle-info-tab", "battle-bottom-tab"].indexOf(action) !== -1) return true;
  return !/^(battle-|admin-battle-)/.test(action);
});

registerAction("battle-history-open", async function (element) {
  var scene = state.scene;
  var turn = Number(element.dataset.turn);
  var checkpoint = scene && scene.battleHistoryTurns && scene.battleHistoryTurns[turn];
  if (!checkpoint || scene.authoritativeCommandPending || scene.authoritativeCommandUncertain) return;
  var request = {};
  scene.battleHistoryLoading = request;
  render({ preserveScroll: true });
  var result = await readBattleTurnHistory(scene.battleDomeBattleId || scene.authoritativeBattleId, scene.battleDome, turn);
  if (state.scene !== scene || scene.battleHistoryLoading !== request) return;
  scene.battleHistoryLoading = null;
  var history = result.ok && result.projection && result.projection.history;
  if (!history || Number(history.event_seq) !== checkpoint.seq) {
    render({ preserveScroll: true });
    openMessage([t("ui.battle.historyUnavailable")]);
    return;
  }
  var view = Object.assign({}, scene, {
    manager: { log: scene.manager.log.slice(0, checkpoint.logLength) },
    finalBattleDisplayScene: null, battleHistoryView: null, battleHistoryLoading: null,
    battleEntryChoicePanel: null, authoritativeEntryChoice: null, authoritativeAdminEntryChoice: null,
    battleHistoryTurn: turn
  });
  applyAuthoritativeProjection(view, Object.assign({
    contract_key: scene.authoritativeContractKey,
    gym_key: scene.authoritativeGymKey,
    league_member_index: scene.authoritativeLeagueMemberIndex,
    battle_id: scene.authoritativeBattleId
  }, history.projection), [], { history: true });
  view.playerTeam.name = scene.playerTeam.name;
  view.enemyTeam.name = scene.enemyTeam.name;
  scene.battleHistoryView = view;
  render({ preserveScroll: true });
});

registerAction("battle-history-live", function () {
  var scene = state.scene;
  if (!scene) return;
  scene.battleHistoryLoading = null;
  scene.battleHistoryView = null;
  render({ preserveScroll: true });
  openPendingBattleEntryChoice(scene);
});
