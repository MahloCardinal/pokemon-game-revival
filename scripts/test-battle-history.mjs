import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

export function testBattleHistory(Engine, Moves, Items) {
  function fixture(contract, admin = false, firstActor = "player") {
    const pokemon = slot => {
      const result = new Engine.Pokemon({ name: "Aipom", speciesKey: "190", ndex: 190, level: 100,
        maxHp: 400, type: ["normal"], moves: [Engine.createMove(Moves.tackle, { power: 20, stats: 10 })] });
      result.authoritativeSlot = slot;
      return result;
    };
    const manager = new Engine.BattleManager(new Engine.Team("Player", [pokemon(0), pokemon(1)]), new Engine.Team("Opponent", [pokemon(0), pokemon(1)]));
    manager.battleType = contract;
    manager.adminControlled = admin;
    manager.firstActor = firstActor;
    manager.waitingFor = "player";
    manager.npcItems = [[Items.potion.index, 3]];
    manager.startInitialEntry();
    const items = [[Items.potion.index, 3], [Items.master_ball.index, 3]];
    return { manager, items, snapshot: () => Engine.serializeBattleManager(manager, Engine.createRngState(123), { playerItems: items }) };
  }
  const checkpoints = result => result.events.filter(event => event.type === "turn_checkpoint");
  for (const contract of ["capture", "training", "gym", "battle_tower", "admin_gym", "league", "debug_training", "battle_dome"]) {
    const admin = ["admin_gym", "league", "debug_training", "battle_dome"].includes(contract);
    const battle = fixture(contract, admin);
    const snapshot = battle.snapshot();
    let result = Engine.executeBattleCommand(snapshot, { type: "move", moveSlot: 0 });
    if (admin) {
      assert.equal(checkpoints(result).length, 0, contract + ": half a turn must not be selectable");
      result = Engine.executeAdminBattleCommand(result.snapshot, { type: "move", moveSlot: 0 });
    }
    const saved = checkpoints(result);
    assert.equal(saved.length, 1, contract + ": a completed turn must have one checkpoint");
    assert.equal(saved[0].data.turn_number, 1);
    assert.deepEqual(saved[0].data.projection.participants, result.projection.participants);
    assert.deepEqual(saved[0].data.projection.player_items, result.projection.player_items);
    assert.equal(result.events.at(-1).type, "turn_checkpoint");
    assert.equal(JSON.stringify(result.snapshot).includes("turn_checkpoint"), false, "History must not grow the live snapshot");
    const savedJson = JSON.stringify(saved[0]);
    Engine.executeBattleCommand(result.snapshot, { type: "move", moveSlot: 0 });
    assert.equal(JSON.stringify(saved[0]), savedJson, "Historical data must not follow live mutations");
    const replay = Engine.executeBattleCommand(snapshot, { type: "move", moveSlot: 0 });
    assert.deepEqual(replay, Engine.executeBattleCommand(snapshot, { type: "move", moveSlot: 0 }), "Checkpoint capture must remain deterministic");
  }

  for (const admin of [false, true]) {
    const battle = fixture(admin ? "battle_dome" : "training", admin);
    battle.manager.playerTeam.getActive().hp = 200;
    let result = Engine.executeBattleCommand(battle.snapshot(), { type: "item", itemIndex: Items.potion.index, targetSlot: 0 });
    if (admin) result = Engine.executeAdminBattleCommand(result.snapshot, { type: "move", moveSlot: 0 });
    const checkpoint = checkpoints(result)[0].data.projection;
    assert.equal(checkpoint.player_items.find(entry => entry[0] === Items.potion.index)[1], 2);
    assert.equal(checkpoint.used_items[Items.potion.key], 1);
  }

  const npcFirst = fixture("gym", false, "npc");
  const opening = Engine.executeInitialNpcOpening(npcFirst.snapshot());
  assert.equal(checkpoints(opening).length, 0);
  const next = Engine.executeBattleCommand(opening.snapshot, { type: "move", moveSlot: 0 });
  assert.equal(checkpoints(next).length, 1);
  const boundary = checkpoints(next)[0];
  assert.equal(boundary.data.turn_number, 1);
  assert.ok(next.events.some((event, index) => index > next.events.indexOf(boundary) && event.type === "display_log" && event.data.entry.key === "turn.started"),
    "An automatic NPC action in the next turn must follow, not contaminate, the previous checkpoint");
  assert.ok(boundary.data.projection.participants[0].current_hp > next.projection.participants[0].current_hp);

  const captured = Engine.executeCaptureBattleCommand(fixture("capture").snapshot(), { type: "ball", itemIndex: Items.master_ball.index, targetSlot: 0 });
  assert.equal(captured.captureSuccess, true);
  assert.equal(checkpoints(captured).length, 1, "A terminal capture must close the final partial turn");
  assert.equal(checkpoints(captured)[0].data.projection.player_items.find(entry => entry[0] === Items.master_ball.index)[1], 2);

  const effects = fixture("battle_dome", true);
  effects.manager.playerTeam.getActive().hp = 200;
  effects.manager.playerTeam.getActive().magicCoatActive = true;
  effects.manager.playerTeam.getActive().magicCoatTurns = 2;
  effects.manager.enemyTeam.getActive().seedTarget = effects.manager.playerTeam;
  effects.manager.enemyTeam.getActive().seedValue = 25;
  const effectsOpening = Engine.executeBattleCommand(effects.snapshot(), { type: "move", moveSlot: 0 });
  const effectsEnd = Engine.executeAdminBattleCommand(effectsOpening.snapshot, { type: "move", moveSlot: 0 });
  const effectsFrame = checkpoints(effectsEnd)[0];
  assert.equal(effectsFrame.data.projection.participants[0].current_hp, 205, "End-turn drain healing must be included");
  assert.equal(effectsFrame.data.projection.participants[0].presentation_state.magicCoatTurns, 1);
  assert.equal(effectsFrame.data.projection.participants[2].seed_target_side, "player");
  assert.ok(effectsEnd.events.findIndex(event => event.type === "display_log" && event.data.entry.key === "hazard.leechSeedDrain") < effectsEnd.events.indexOf(effectsFrame));

  const forced = fixture("battle_dome", true);
  forced.manager.enemyTeam.getActive().hp = 1;
  const forcedOpening = Engine.executeBattleCommand(forced.snapshot(), { type: "move", moveSlot: 0 });
  assert.equal(checkpoints(forcedOpening).length, 0, "A mid-turn forced switch must not fabricate a completed turn");
  const forcedSwitch = Engine.executeAdminBattleCommand(forcedOpening.snapshot, { type: "switch", teamSlot: 1 });
  const forcedEnd = Engine.executeAdminBattleCommand(forcedSwitch.snapshot, { type: "move", moveSlot: 0 });
  assert.equal(checkpoints(forcedEnd)[0].data.projection.npc_active_slot, 1);

  const terminal = fixture("battle_dome", true);
  terminal.manager.playerTeam.getActive().hp = 1;
  terminal.manager.playerTeam.combatantList[1].hp = 0;
  const terminalOpening = Engine.executeBattleCommand(terminal.snapshot(), { type: "move", moveSlot: 0 });
  const terminalEnd = Engine.executeAdminBattleCommand(terminalOpening.snapshot, { type: "move", moveSlot: 0 });
  assert.equal(checkpoints(terminalEnd).length, 1, "The second actor's terminal action must preserve the final turn");
  assert.equal(checkpoints(terminalEnd)[0].data.projection.status, "concluded");

  const source = readFileSync(new URL("../app/client/battle-history-handler.js", import.meta.url), "utf8").replace(/^import .*;\r?\n/gm, "");
  const state = { scene: { battleHistoryView: {} } };
  let guard;
  vm.runInNewContext(source, { state, registerAction() {}, registerActionGuard: value => { guard = value; } });
  for (const action of ["battle-move", "battle-switch", "battle-item-use", "battle-item-target", "battle-abandon-confirm", "admin-battle-move", "admin-battle-item-use", "battle-entry-choice-pick", "battle-authoritative-retry"])
    assert.equal(guard(action), false, action + " must not act from history");
  for (const action of ["battle-history-live", "battle-history-open", "battle-info-tab", "battle-bottom-tab", "parent-back", "back-home", "open-battle-dome-lobby"])
    assert.equal(guard(action), true, action + " must remain available");
  state.scene = {};
  assert.equal(guard("battle-move"), true);
  console.log("Battle history: all battle contracts, complete turns, NPC boundaries, inventories, capture and action guards passed.");
}

export async function testBattleHistoryClient() {
  const source = readFileSync(new URL("../app/client/battle-history-handler.js", import.meta.url), "utf8").replace(/^import .*;\r?\n/gm, "");
  const scene = () => ({ authoritativeBattleId: "fixture", battleHistoryTurns: { 1: { seq: 8, logLength: 2 } },
    manager: { log: ["turn one", "end one", "turn two"] }, playerTeam: { name: "Player" }, enemyTeam: { name: "Opponent" } });
  const state = { scene: scene() };
  const handlers = {};
  let resolveRequest;
  let applied = 0;
  vm.runInNewContext(source, {
    state, registerAction: (name, handler) => { handlers[name] = handler; }, registerActionGuard() {},
    render() {}, openMessage() {}, t: key => key, openPendingBattleEntryChoice() {},
    readBattleTurnHistory: () => new Promise(resolve => { resolveRequest = resolve; }),
    applyAuthoritativeProjection: (view, projection, events, options) => {
      applied++;
      assert.equal(options.history, true);
      assert.deepEqual(Array.from(view.manager.log), ["turn one", "end one"]);
      view.playerTeam = {};
      view.enemyTeam = {};
    }
  });
  const response = { ok: true, projection: { history: { event_seq: 8, projection: {} } } };
  let pending = handlers["battle-history-open"]({ dataset: { turn: "1" } });
  await handlers["battle-history-live"]();
  resolveRequest(response);
  await pending;
  assert.equal(applied, 0, "Returning live must cancel an in-flight history read");
  pending = handlers["battle-history-open"]({ dataset: { turn: "1" } });
  state.scene = scene();
  resolveRequest(response);
  await pending;
  assert.equal(applied, 0, "A response for a previous screen must be discarded");
  pending = handlers["battle-history-open"]({ dataset: { turn: "1" } });
  state.scene.battleHistoryLoading = null; // Canonical terminal/deletion update cancels the read.
  resolveRequest(response);
  await pending;
  assert.equal(applied, 0, "A terminal update must cancel an in-flight history read");
  pending = handlers["battle-history-open"]({ dataset: { turn: "1" } });
  resolveRequest(response);
  await pending;
  assert.equal(applied, 1);
  assert.equal(state.scene.manager.log.length, 3, "Browsing must leave the live log untouched");

  const apiSource = readFileSync(new URL("../app/api/battle-dome.js", import.meta.url), "utf8")
    .replace(/^import .*;\r?\n/gm, "").replace(/export /g, "");
  const cursors = [];
  const context = { invokeAuthoritativeBattleCommand: async body => {
    cursors.push(body.afterSeq);
    return { ok: true, battle: { battle_version: body.afterSeq + 1 },
      events: body.afterSeq < 4 ? [{ seq: body.afterSeq + 1 }, { seq: body.afterSeq + 2 }] : [] };
  } };
  vm.runInNewContext(apiSource, context);
  const result = await context.readBattleDomeBattle("fixture", { limit: 2 });
  assert.deepEqual(cursors, [0, 2, 4]);
  assert.deepEqual(Array.from(result.events, event => event.seq), [1, 2, 3, 4]);
  assert.equal(result.battle.battle_version, 5, "Reload must use the most recent canonical projection");
  console.log("Battle history client: log boundaries, canceled reads, navigation races and full PvP pagination passed.");
}
