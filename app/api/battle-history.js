import { invokeAuthoritativeBattleCommand } from "./battle.js";

export function readBattleTurnHistory(battleId, dome, turnNumber) {
  return invokeAuthoritativeBattleCommand({ action: "turn_history", battleId: battleId, dome: Boolean(dome), turnNumber: turnNumber });
}
