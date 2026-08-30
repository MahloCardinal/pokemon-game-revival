// Battle-only affordances default to unavailable outside their explicit contract.
export function sceneAllowsBallUse(scene) {
  return Boolean(scene && /^capture_[a-z0-9_]+$/.test(String(scene.battleType || ""))
    && (scene.authoritativeCapture || scene.captureScene && scene.captureScene.name === "capture"));
}

export function pendingOwnedBattleEntryChoice(scene) {
  if (!scene || !scene.manager || scene.manager.battleOver || scene.authoritativeCommandPending
    || scene.battleDomeSpectator || scene.battleDomeRole === "spectator") return null;
  var challenger = scene.battleDome && scene.battleDomeRole === "challenger";
  var team = challenger ? scene.enemyTeam : scene.playerTeam;
  var choice = challenger ? scene.authoritativeAdminEntryChoice : scene.authoritativeEntryChoice;
  if (scene.battleDome && scene.manager.waitingFor !== (challenger ? "admin" : "player")) return null;
  var combatant = team && team.getActive();
  return combatant && choice && Array.isArray(choice.entries) && choice.entries.length
    ? { combatant: combatant, choice: choice } : null;
}
