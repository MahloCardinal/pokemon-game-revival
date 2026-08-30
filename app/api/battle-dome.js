import { invokeAuthoritativeBattleCommand } from "./battle.js";

function commandId() {
  return globalThis.crypto.randomUUID();
}

export function readBattleDomeState() {
  return invokeAuthoritativeBattleCommand({ action: "dome_state" });
}

export function saveBattleDomeTeam(team) {
  return invokeAuthoritativeBattleCommand({ action: "dome_save_team", team: team });
}

export function createBattleDomeLobby() {
  return invokeAuthoritativeBattleCommand({ action: "dome_create_lobby" });
}

export function cancelBattleDomeLobby() {
  return invokeAuthoritativeBattleCommand({ action: "dome_cancel_lobby" });
}

export function joinBattleDomeLobby(input) {
  return invokeAuthoritativeBattleCommand({
    action: "dome_join",
    creatorUserId: input && input.creatorUserId || undefined,
    inviteCode: input && input.inviteCode || undefined
  });
}

export async function readBattleDomeBattle(battleId, options) {
  options = options || {};
  var afterSeq = options.afterSeq === undefined ? 0 : Number(options.afterSeq);
  var limit = options.limit === undefined ? 100 : Number(options.limit);
  var events = [];
  while (true) {
    var result = await invokeAuthoritativeBattleCommand({ action: "dome_read", battleId: String(battleId || ""), afterSeq: afterSeq, limit: limit });
    if (!result.ok || !result.battle) return result;
    var page = result.events || [];
    events = events.concat(page);
    var nextSeq = page.reduce(function (highest, event) { return Math.max(highest, Number(event.seq) || 0); }, afterSeq);
    if (page.length < limit || nextSeq <= afterSeq) return Object.assign({}, result, { events: events });
    afterSeq = nextSeq;
  }
}

export function chooseBattleDomeLead(input) {
  return battleCommand("lead_choice", input, { teamSlot: Math.floor(Number(input.teamSlot)) });
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
