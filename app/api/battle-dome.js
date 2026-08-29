import { invokeAuthoritativeBattleCommand } from "./battle.js";

function commandId() {
  return globalThis.crypto.randomUUID();
}

export function createBattleDomeInviteToken() {
  return globalThis.crypto.randomUUID().replace(/-/g, "")
    + globalThis.crypto.randomUUID().replace(/-/g, "");
}

export function readBattleDomeState() {
  return invokeAuthoritativeBattleCommand({ action: "dome_state" });
}

export function saveBattleDomeTeam(team) {
  return invokeAuthoritativeBattleCommand({ action: "dome_save_team", team: team });
}

export function createBattleDomeLobby(inviteToken) {
  return invokeAuthoritativeBattleCommand({ action: "dome_create_lobby", inviteToken: inviteToken });
}

export function cancelBattleDomeLobby() {
  return invokeAuthoritativeBattleCommand({ action: "dome_cancel_lobby" });
}

export function joinBattleDomeLobby(input) {
  return invokeAuthoritativeBattleCommand({
    action: "dome_join",
    creatorUserId: input && input.creatorUserId || undefined,
    inviteToken: input && input.inviteToken || undefined
  });
}

export function readBattleDomeBattle(battleId, options) {
  options = options || {};
  return invokeAuthoritativeBattleCommand({
    action: "dome_read",
    battleId: String(battleId || ""),
    afterSeq: options.afterSeq === undefined ? 0 : Number(options.afterSeq),
    limit: options.limit === undefined ? 100 : Number(options.limit)
  });
}

function battleCommand(action, input, semantic) {
  return invokeAuthoritativeBattleCommand(Object.assign({
    action: "dome_" + action,
    battleId: String(input.battleId || ""),
    commandId: input.commandId || commandId(),
    expectedBattleVersion: Number(input.expectedBattleVersion) || 0
  }, semantic || {}));
}

export function submitBattleDomeMove(input) {
  return battleCommand("move", input, { moveSlot: Math.floor(Number(input.moveSlot)) });
}

export function switchBattleDomePokemon(input) {
  return battleCommand("switch", input, {
    teamSlot: Math.floor(Number(input.teamSlot)),
    entryChoice: input.entryChoice && typeof input.entryChoice === "object" ? {
      index: Math.floor(Number(input.entryChoice.index)),
      kind: String(input.entryChoice.kind || "")
    } : null
  });
}

export function resolveBattleDomeEntryChoice(input) {
  return battleCommand("entry_choice", input, {
    entryChoice: {
      index: Math.floor(Number(input.entryChoice && input.entryChoice.index)),
      kind: String(input.entryChoice && input.entryChoice.kind || "")
    }
  });
}

export function useBattleDomeItem(input) {
  return battleCommand("item", input, {
    itemIndex: Math.floor(Number(input.itemIndex)),
    targetSlot: input.targetSlot === null || input.targetSlot === undefined ? null : Math.floor(Number(input.targetSlot))
  });
}

export function abandonBattleDomeBattle(battleId) {
  return invokeAuthoritativeBattleCommand({ action: "dome_abandon", battleId: String(battleId || "") });
}

export function exitBattleDomeBattle(battleId) {
  return invokeAuthoritativeBattleCommand({ action: "dome_exit", battleId: String(battleId || "") });
}
