import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import vm from "node:vm";

const read = file => readFileSync(new URL("../../" + file, import.meta.url), "utf8");
const tick = () => new Promise(resolve => setImmediate(resolve));
function storage() {
  const values = new Map();
  return { getItem: key => values.get(key) || null, setItem: (key, value) => values.set(key, value),
    key: index => [...values.keys()][index], get length() { return values.size; } };
}
function synthetic(context, exports) {
  return new vm.SyntheticModule(Object.keys(exports), function () {
    for (const [key, value] of Object.entries(exports)) this.setExport(key, value);
  }, { context });
}
function session(userId, sessionId = userId, tokenVersion = 1) {
  return { user: { id: userId }, access_token: "header."
    + Buffer.from(JSON.stringify({ session_id: sessionId, tokenVersion })).toString("base64url") + ".signature" };
}

async function playerHarness() {
  let currentSession = session("A");
  const calls = [], events = [], pendingStorage = storage();
  const client = { auth: { getSession: async () => ({ data: { session: currentSession } }) },
    rpc: (name, params) => new Promise((resolve, reject) => calls.push({ name, params, resolve, reject })) };
  const context = vm.createContext({ crypto: { randomUUID }, atob,
    window: { sessionStorage: pendingStorage, dispatchEvent: event => events.push(event.detail) },
    CustomEvent: class { constructor(_name, options) { this.detail = options.detail; } } });
  const supabase = new vm.SourceTextModule(read("app/api/supabase.js"), { context });
  await supabase.link(specifier => synthetic(context, specifier.startsWith("https:")
    ? { createClient: () => client }
    : { resolveSupabaseRuntimeConfig: () => ({ url: "https://fixture.invalid", publishableKey: "fixture" }) }));
  const module = new vm.SourceTextModule(read("app/api/player-command.js"), { context });
  await module.link(() => supabase);
  await module.evaluate();
  return { api: module.namespace, calls, events, pendingStorage,
    setSession: value => { currentSession = value; } };
}
const params = { p_expected_revision: 1, p_item_index: 2 };
for (const nextSession of [session("B"), null, session("A", "new-login")]) {
  const h = await playerHarness();
  const command = h.api.runPlayerCommand("buy", params);
  await tick();
  const id = h.calls[0].params.p_command_id;
  h.setSession(nextSession);
  h.calls[0].resolve({ data: { revision: 2 }, error: null });
  const result = await command;
  assert.equal(result.code, "stale_session");
  assert.equal(result.uncertain, true);
  assert.equal(result.projection, undefined);
  assert.equal(h.events.length, 0);
  assert.ok(h.pendingStorage.getItem("pokemon-game-revival:pending-player-commands").includes(id),
    "Keep an uncertain command for its original owner");
}
{
  const h = await playerHarness();
  const readRequest = h.api.getCurrentPlayerState();
  await tick(); h.setSession(session("B"));
  h.calls[0].resolve({ data: { has_player: true, revision: 100 }, error: null });
  assert.equal((await readRequest).code, "stale_session", "Read RPCs must also reject old sessions");
}
{
  const h = await playerHarness();
  const first = h.api.runPlayerCommand("buy", params);
  const duplicate = h.api.runPlayerCommand("buy", params);
  await tick(); assert.equal(h.calls.length, 1);
  h.setSession(session("A", "A", 2));
  h.calls[0].resolve({ data: { revision: 2 }, error: null });
  assert.equal((await first).ok, true, "Token refresh is still the same session");
  assert.equal((await duplicate).ok, true);
  assert.equal(h.events.length, 1);
}
{
  const h = await playerHarness();
  const old = h.api.runPlayerCommand("buy", params);
  await tick(); h.setSession(session("B"));
  const current = h.api.runPlayerCommand("buy", params);
  await tick(); assert.equal(h.calls.length, 2, "Do not deduplicate across accounts");
  assert.notEqual(h.calls[0].params.p_command_id, h.calls[1].params.p_command_id);
  h.calls[1].resolve({ data: { revision: 2 }, error: null });
  assert.equal((await current).ok, true);
  h.calls[0].resolve({ data: { revision: 900 }, error: null });
  assert.equal((await old).code, "stale_session");
  assert.deepEqual(h.events.map(event => event.revision), [2]);
  h.setSession(session("A", "return-login"));
  const retry = h.api.runPlayerCommand("buy", params);
  await tick(); assert.equal(h.calls[2].params.p_command_id, h.calls[0].params.p_command_id);
  h.calls[2].resolve({ data: { revision: 2 }, error: null });
  assert.equal((await retry).ok, true);
}
{
  const h = await playerHarness();
  const first = h.api.runPlayerCommand("buy", params);
  const other = h.api.runPlayerCommand("sell", params);
  await tick(); const otherId = h.calls[1].params.p_command_id;
  h.calls[0].resolve({ data: { revision: 2 }, error: null });
  await first;
  assert.ok(h.pendingStorage.getItem("pokemon-game-revival:pending-player-commands").includes(otherId));
  h.calls[1].reject(new Error("transport lost"));
  assert.equal((await other).uncertain, true);
}
for (const switchDuringRefresh of [false, true]) {
  const h = await playerHarness();
  const command = h.api.runPlayerCommand("buy", params);
  await tick(); h.calls[0].resolve({ error: { code: "40001" } });
  await tick(); assert.equal(h.calls[1].name, "get_current_player_state");
  if (switchDuringRefresh) h.setSession(session("B"));
  h.calls[1].resolve({ data: { has_player: true, revision: 20 }, error: null });
  assert.equal((await command).code, switchDuringRefresh ? "stale_session" : "revision_conflict");
  if (!switchDuringRefresh) {
    assert.equal((await h.api.runPlayerCommand("buy", params)).code, "revision_conflict");
    assert.equal(h.calls.length, 2, "Cooldown still coalesces repeated conflicts in one session");
    h.setSession(session("B"));
  }
  const next = h.api.runPlayerCommand("buy", params);
  await tick(); assert.equal(h.calls.length, 3, "Another account must not inherit the cooldown");
  h.calls[2].resolve({ error: { code: "40001" } });
  await tick(); assert.equal(h.calls.length, 4, "Another account must not inherit the refresh cache");
  h.calls[3].resolve({ data: { has_player: true, revision: 7 }, error: null });
  assert.equal((await next).projection.revision, 7);
}

const cartSource = read("app/client/shopping-center-handler.js");
const cartFunction = cartSource.slice(cartSource.indexOf("async function runAuthoritativeCart("),
  cartSource.indexOf("async function confirmPurchases("));
for (const outcome of ["conflict", "transport", "success", "switch-user", "newer-state", "first-conflict"]) {
  const state = { auth: { user: { id: "A" } }, authoritativeRevision: 1, cart: { 1: 1, 2: 1 } };
  let calls = 0;
  const applied = [];
  const context = vm.createContext({ state, authoritativeShopCommandPending: false,
    applyPlayerSave: projection => { applied.push(projection.revision); state.authoritativeRevision = projection.revision; },
    saveFromAuthoritativeProjection: value => value, openMessage() {}, renderRegions() {},
    messageDescriptor: key => key, textDescriptor: key => key,
    command: async () => {
      calls++;
      if (outcome === "first-conflict") return { ok: false, projection: { revision: 4 } };
      if (calls === 1) return { ok: true, projection: { revision: 2 } };
      if (outcome === "switch-user") {
        state.auth.user = { id: "B" }; state.authoritativeRevision = 50; state.cart = { 9: 9 };
        return { ok: false, code: "stale_session" };
      }
      if (outcome === "conflict") {
        state.authoritativeRevision = 4;
        return { ok: false, code: "revision_conflict", projection: { revision: 3 } };
      }
      if (outcome === "transport") return { ok: false, uncertain: true };
      if (outcome === "newer-state") state.authoritativeRevision = 4;
      return { ok: true, projection: { revision: 3 } };
    } });
  vm.runInContext(cartFunction, context);
  await vm.runInContext('runAuthoritativeCart([{item:{index:1},quantity:1},{item:{index:2},quantity:1}], command, "cart")', context);
  const expected = { conflict: 4, transport: 2, success: 3, "switch-user": 50, "newer-state": 4, "first-conflict": 4 };
  assert.equal(state.authoritativeRevision, expected[outcome], outcome);
  assert.ok(applied.every((revision, index) => !index || revision >= applied[index - 1]));
  if (["conflict", "transport"].includes(outcome)) assert.equal(JSON.stringify(state.cart), '{"2":1}');
  if (outcome === "switch-user") assert.equal(JSON.stringify(state.cart), '{"9":9}');
}

const deploymentKey = "pokemon_game_revival:deployment";
async function deploymentTab(sharedStorage, sessionStore = storage()) {
  let serverDeployment = "old", reloads = 0, fail = false;
  const state = {};
  const context = vm.createContext({ state, sessionStorage: sessionStore, localStorage: sharedStorage,
    location: { reload: () => reloads++ },
    fetch: async () => { if (fail) throw new Error("offline"); return { ok: true, json: async () => ({ deployment: serverDeployment }) }; },
    document: { addEventListener() {} }, setInterval() {} });
  const module = new vm.SourceTextModule(read("app/client/deployment-version.js"), { context });
  await module.link(() => synthetic(context, { state })); await module.evaluate();
  return { api: module.namespace, state, reloads: () => reloads, sessionStore,
    server: value => { serverDeployment = value; }, offline: value => { fail = value; } };
}
{
  const shared = storage(), a = await deploymentTab(shared), b = await deploymentTab(shared);
  await a.api.initializeDeploymentWatcher(); await b.api.initializeDeploymentWatcher();
  a.server("new"); b.server("new");
  await a.api.checkDeploymentFromServer(); await b.api.checkDeploymentFromServer();
  assert.equal(a.reloads(), 1); assert.equal(b.reloads(), 1);
  const reloaded = await deploymentTab(shared, a.sessionStore); reloaded.server("new");
  await reloaded.api.initializeDeploymentWatcher(); assert.equal(reloaded.reloads(), 0, "No reload loop");
}
{
  const shared = storage(), a = await deploymentTab(shared), b = await deploymentTab(shared);
  await a.api.initializeDeploymentWatcher(); await b.api.initializeDeploymentWatcher();
  a.server("new"); b.server("new"); b.state.inBattle = true;
  await a.api.checkDeploymentFromServer(); await b.api.checkDeploymentFromServer();
  assert.equal(b.reloads(), 0); assert.equal(b.sessionStore.getItem(deploymentKey), "old");
  b.state.inBattle = false;
  await b.api.checkDeploymentFromServer(); assert.equal(b.reloads(), 1);
}
{
  const shared = storage(), tab = await deploymentTab(shared, {
    getItem() { throw new Error("storage blocked"); }, setItem() { throw new Error("storage blocked"); }
  });
  tab.offline(true); assert.equal(await tab.api.initializeDeploymentWatcher(), false);
  tab.offline(false); await tab.api.checkDeploymentFromServer(); tab.server("new");
  shared.setItem("pokemon_game_revival:runtime:in_battle:fixture", JSON.stringify({ active: true, updatedAt: Date.now() }));
  await tab.api.checkDeploymentFromServer(); assert.equal(tab.reloads(), 0);
  shared.setItem("pokemon_game_revival:runtime:in_battle:fixture", JSON.stringify({ active: false }));
  await tab.api.checkDeploymentFromServer(); assert.equal(tab.reloads(), 1);
}
async function boxHarness(isToday = () => false) {
  const actions = new Map(), calls = [], renders = [], messages = [];
  let confirmation;
  const context = vm.createContext({ document: { getElementById: () => ({}) } });
  const gameState = new vm.SourceTextModule(read("app/client/game-state.js"), { context });
  await gameState.link(() => synthetic(context, {
    poke_ball: { index: 100 }, potion: { index: 103 }, FLUTE_DAILY_USE_LIMIT: 3,
    defaultTrainerIndex: () => 0, defaultPokefanMissionRows: () => [],
    revivePokemonList: list => list || [], reviveBoxList: list => list || [], reviveDaycareRows: () => [null, null],
    applyLocalDailyReset: () => [], missionRowsHaveClaimable: () => false, isTodayInRome: isToday
  }));
  await gameState.evaluate();
  const state = gameState.namespace.state;
  const module = new vm.SourceTextModule(read("app/client/box-handler.js"), { context });
  const command = input => new Promise(resolve => calls.push({ input, resolve }));
  await module.link(specifier => specifier === "./game-state.js" ? gameState : synthetic(context, {
    registerAction: (key, action) => actions.set(key, action), blockActionDuringBattle: () => false,
    TEAM_MAX: 6, openInlineConfirm: (_title, lines, callback) => { confirmation = { lines, callback }; },
    openInlineMessage: lines => messages.push(lines), removeElement() {}, renderRegions: regions => renders.push(Array.from(regions)),
    broadcastTeamBoxRuntimeState() {}, moveBoxPokemonToTeamAuthoritative: command, releaseBoxPokemonAuthoritative: command,
    saveFromAuthoritativeProjection: projection => projection, pokemonDisplayName: pokemon => pokemon.name,
    messageDescriptor: (key, params) => ({ key, params }), textDescriptor: key => key
  }));
  await module.evaluate();
  state.scene = { name: "box" };
  state.authoritativeRevision = 1;
  return { state, actions, calls, renders, messages, context, gameState, confirmation: () => confirmation };
}
const boxPokemonA = { instanceId: "10000000-0000-4000-8000-000000000001", name: "Pikachu" };
const boxPokemonB = { instanceId: "10000000-0000-4000-8000-000000000002", name: "Eevee" };
const boxCommandSave = { authoritativeRevision: 3, profile: { trainer_index: 0, pokedollars: 5000, badges: 0, battle_points: 0 },
  team: [boxPokemonA], box: [boxPokemonB], items: [], missions: [] };
{
  const h = await boxHarness();
  h.state.box = [boxPokemonA, boxPokemonB];
  h.actions.get("box-release")({ dataset: { index: "0" } });
  assert.equal(h.confirmation().lines[0].params.pokemon, "Pikachu");
  h.state.box = [boxPokemonB, boxPokemonA];
  h.state.authoritativeRevision = 2;
  const pending = h.confirmation().callback();
  assert.equal(h.calls[0].input.pokemonInstanceId, boxPokemonA.instanceId, "Release the confirmed Pokemon after a reorder");
  assert.equal(h.calls[0].input.expectedRevision, 2);
  h.calls[0].resolve({ ok: true, projection: boxCommandSave });
  await pending;
}
{
  const h = await boxHarness();
  h.state.box = [boxPokemonA, boxPokemonB];
  h.actions.get("box-release")({ dataset: { index: "0" } });
  h.state.box = [boxPokemonB];
  h.state.authoritativeRevision = 2;
  await h.confirmation().callback();
  assert.equal(h.calls.length, 0, "Never substitute another Pokemon when the confirmed one leaves the Box");
  assert.equal(h.messages[0][0].key, "box.releaseFailed");
}
for (const action of ["box-to-team", "box-release"]) {
  const h = await boxHarness();
  h.state.box = [boxPokemonA, boxPokemonB];
  h.state.boxFilter = { type: "fire", minLevel: "20", maxLevel: "60", name: "cha", heldItemOnly: true };
  const filter = { ...h.state.boxFilter };
  let pending = h.actions.get(action)({ dataset: { index: "0" } });
  if (action === "box-release") pending = h.confirmation().callback();
  h.calls[0].resolve({ ok: true, projection: boxCommandSave });
  await pending;
  assert.deepEqual({ ...h.state.boxFilter }, filter, action + " must preserve every filter when applying the canonical save");
  assert.equal(h.state.authoritativeRevision, 3);
  assert.deepEqual(Array.from(h.state.box), [boxPokemonB]);
  assert.deepEqual(h.renders.at(-1), ["box-filter", "box-storage"], "Refresh controls and results together");
}
async function gardenHarness() {
  const h = await boxHarness(), reads = [];
  const module = new vm.SourceTextModule(read("app/client/garden-handler.js"), { context: h.context });
  await module.link(specifier => specifier === "./game-state.js" ? h.gameState : synthetic(h.context, {
    registerAction: (key, action) => h.actions.set(key, action), openMessage() {}, render: () => h.renders.push(["garden"]),
    getCurrentPlayerState: () => new Promise(resolve => reads.push(resolve)),
    plantGardenBerryAuthoritative: input => new Promise(resolve => h.calls.push({ input, resolve })),
    harvestGardenPlotAuthoritative() {}, claimDailyBerryAuthoritative() {}, saveFromAuthoritativeProjection: value => value,
    BERRY_NORMAL_CYCLE_ITEMS: [], BERRY_LONG_CYCLE_ITEMS: [], getBerryGrowthCycle: () => 3,
    getItemByIndex: index => ({ index, category: "berry" }), ItemCategory: { Berry: "berry" },
    requireNotInBattle: () => true, messageDescriptor: key => key, textDescriptor: key => key
  }));
  await module.evaluate();
  h.state.scene = { name: "city-garden" };
  h.gameState.namespace.applyPlayerSave(gardenSave(10));
  return { ...h, reads, refresh: module.namespace.refreshDailyBerryLimit };
}
function gardenSave(revision, planted = false) {
  return { ...boxCommandSave, has_player: true, revision, authoritativeRevision: revision,
    items: [[501, planted ? 4 : 5]], garden: planted
      ? { plant_1: 501, seed_time_1: "2026-09-14T20:00:00Z", ready_at_1: "2026-09-14T23:00:00Z" } : {} };
}
for (const ok of [true, false]) {
  const h = await gardenHarness();
  const refresh = h.refresh();
  const planting = h.actions.get("garden-plant-select")({ dataset: { itemIndex: "501", plotIndex: "0" } });
  h.calls[0].resolve({ ok: true, projection: gardenSave(11, true) });
  await planting;
  const garden = h.state.garden;
  h.reads[0]({ ok, projection: ok ? gardenSave(10) : undefined });
  await refresh;
  assert.equal(h.state.authoritativeRevision, 11, "A delayed garden read must not undo a completed command");
  assert.equal(h.state.garden, garden);
  assert.equal(h.state.garden.plots[0].berryIndex, 501);
  assert.equal(h.state.inventory[0][1], 4);
  assert.equal(h.state.garden.dailyBerry.error, "", "An obsolete error must not affect the new garden state");
}
{
  const h = await gardenHarness();
  const pending = h.refresh();
  h.state.authoritativeRevision = 12;
  h.reads[0]({ ok: true, projection: gardenSave(11) });
  await pending;
  assert.equal(h.state.authoritativeRevision, 12, "Reject older revisions even when the garden object has not changed");
  assert.equal(h.state.garden.dailyBerry.loading, false);
  assert.equal(h.renders.length, 2, "Clear the loading indicator in the rendered garden after an obsolete revision");
}
{
  const h = await gardenHarness();
  const old = h.refresh(), current = h.refresh();
  h.reads[0]({ ok: true, projection: gardenSave(10) });
  await old;
  assert.equal(h.state.garden.dailyBerry.loading, true, "The latest refresh still owns the loading indicator");
  h.reads[1]({ ok: true, projection: gardenSave(11, true) });
  await current;
  assert.equal(h.state.authoritativeRevision, 11);
  assert.equal(h.state.garden.plots[0].berryIndex, 501);
  assert.equal(h.state.garden.dailyBerry.loading, false);
}
{
  const h = await gardenHarness();
  const pending = h.refresh();
  h.state.scene = { name: "team" };
  h.reads[0]({ ok: true, projection: gardenSave(11, true) });
  await pending;
  assert.equal(h.state.authoritativeRevision, 10, "A garden read must not replace unrelated state after navigation");
  assert.equal(h.state.garden.dailyBerry.loading, false);
}
{
  const h = await gardenHarness();
  const pending = h.refresh();
  h.reads[0]({ ok: false });
  await pending;
  assert.equal(h.state.garden.dailyBerry.loading, false);
  assert.equal(h.state.garden.dailyBerry.error, "garden.actionFailed");
}
console.log("Client consistency: session isolation, retries, cart revisions, Box identity/filters, garden refresh ordering and deployment updates passed.");

async function refreshHarness(domain) {
  const h = await boxHarness(), reads = [];
  let confirm;
  const module = new vm.SourceTextModule(read("app/client/" + domain + "-handler.js"), { context: h.context });
  await module.link(specifier => specifier === "./game-state.js" ? h.gameState : synthetic(h.context, {
    registerAction: (key, action) => h.actions.set(key, action),
    getCurrentPlayerState: () => new Promise(resolve => reads.push(resolve)),
    loadPlayerDaycare: () => new Promise(resolve => reads.push(resolve)),
    withdrawDaycarePokemonCommand: input => new Promise(resolve => h.calls.push({ input, resolve })),
    completeDaycareWithdraw() {}, depositDaycarePokemonCommand() {}, resolveDaycareWithdrawalCommand() {},
    DAYCARE_WITHDRAW_BASE_COST: 1000, DAYCARE_WITHDRAW_LEVEL_COST: 500, levelLimitForBadges: () => 10,
    openConfirm: (_title, _lines, callback) => { confirm = callback; }, openMessage: lines => h.messages.push(lines),
    openInlineMessage() {}, TEAM_MAX: 6, holdDialogContent() {}, render: () => h.renders.push([domain]),
    renderRegions: regions => h.renders.push(Array.from(regions)), renderDialogLayer() {}, setScene() {},
    moneyText: String, replaceTeamRuntimeState() {}, recordMissionEvent() {}, clearPendingActivityRuntime() {},
    requireNotInBattle: () => true, setPendingActivityRuntime() {}, saveFromAuthoritativeProjection: value => value,
    confirmMoveForget() {}, progressionMove() {}, progressionPokemon() {}, showEvolutionResult() {}, previewDaycareWithdrawal() {},
    moveNameDescriptor() {}, pokemonNameDescriptor() {}, pokemonDisplayName: pokemon => pokemon.name,
    messageDescriptor: key => key, textDescriptor: key => key, t: key => key,
    blockActionDuringBattle: () => false, broadcastAuthoritativeRevision() {}, broadcastTeamBoxRuntimeState() {},
    updateCaptureTeamRuntimeInline() {}, moveTeamPokemonToBoxAuthoritative() {}, setPreferredTrainerTitle() {}, swapTeamPokemonSlotsAuthoritative() {}
  }));
  await module.evaluate();
  h.state.scene = { name: domain === "daycare" ? "city-daycare" : "team" };
  return { ...h, reads, api: module.namespace, confirm: () => confirm(),
    refresh: () => domain === "daycare" ? module.namespace.refreshDaycare() : module.namespace.handleTeamBoxRuntimeChange(["canonicalStateInvalidation"]) };
}
const refreshedSave = revision => ({ ...boxCommandSave, has_player: true, revision, authoritativeRevision: revision });
for (const domain of ["daycare", "team"]) {
  for (const change of ["revision", "identity", "scene", "battle", "starting", "session"]) {
    const h = await refreshHarness(domain);
    const pending = h.refresh();
    if (change === "revision") h.state.authoritativeRevision = 5;
    if (change === "identity") { h.state.team = []; h.state.daycare = []; }
    if (change === "scene") h.state.scene = { name: "capture" };
    if (change === "battle") h.state.inBattle = true;
    if (change === "starting") h.state.battleStartPending = true;
    h.reads[0](change === "session" ? { ok: false, code: "stale_session" } : { ok: true, projection: refreshedSave(3) });
    await pending; await tick();
    assert.equal(h.state.authoritativeRevision, change === "revision" ? 5 : 1, domain + ": reject obsolete " + change);
    assert.equal(h.renders.length, 0);
  }
  const h = await refreshHarness(domain);
  const pending = h.refresh();
  h.reads[0]({ ok: true, projection: refreshedSave(3) });
  await pending; await tick();
  assert.equal(h.state.authoritativeRevision, 3, domain + ": apply current read");
}
{
  const h = await refreshHarness("team");
  h.refresh(); h.refresh(); h.refresh();
  assert.equal(h.reads.length, 1);
  h.reads[0]({ ok: true, projection: refreshedSave(2) });
  await tick();
  assert.equal(h.state.authoritativeRevision, 1, "An invalidated in-flight read must not be rendered");
  assert.equal(h.reads.length, 2, "Coalesce invalidations into one follow-up read");
  h.reads[1]({ ok: true, projection: refreshedSave(4) });
  await tick();
  assert.equal(h.state.authoritativeRevision, 4);
}
{
  const h = await refreshHarness("daycare");
  h.state.daycare = [{ pokemon: boxPokemonA, cost: 1000, elapsedIntervals: 0 }];
  h.actions.get("daycare-withdraw")({ dataset: { slotIndex: "0" } });
  h.state.daycare[0].cost = 1500;
  h.confirm();
  assert.equal(h.calls[0].input.expectedCost, 1000, "Send the price actually confirmed, even if the displayed state changes");
  h.calls[0].resolve({ ok: false, code: "DC001" });
  await tick();
  assert.equal(h.reads.length, 1, "Refresh the quote after an atomic cost rejection");
  h.reads[0]({ ok: true, projection: refreshedSave(3) });
  await tick();
  assert.equal(h.messages.at(-1)[0], "daycare.costChanged");
}
{
  const h = await playerHarness();
  const pending = h.api.withdrawDaycarePokemonAuthoritative({ expectedRevision: 1, pokemonInstanceId: boxPokemonA.instanceId, expectedCost: 1500 });
  await tick();
  assert.equal(h.calls[0].params.p_expected_cost, 1500);
  h.calls[0].resolve({ data: { revision: 2, charged_cost: 1500 }, error: null });
  assert.equal((await pending).ok, true);
}
{
  const dateSource = read("app/client/rome-date.js");
  for (const [before, after] of [["2026-09-14T21:59:59Z", "2026-09-14T22:00:00Z"], ["2026-12-14T22:59:59Z", "2026-12-14T23:00:00Z"]]) {
    let now = before;
    const context = vm.createContext({ Date: class extends Date { constructor(...args) { super(...(args.length ? args : [now])); } } });
    const dates = new vm.SourceTextModule(dateSource, { context });
    await dates.link(() => {}); await dates.evaluate();
    const h = await boxHarness(value => dates.namespace.isTodayInRome(value));
    h.state.fluteDaily.whiteFlute = { remaining: 0, lastClaimedAt: before };
    assert.equal(h.gameState.namespace.fluteDailyRemaining("whiteFlute"), 0);
    now = after;
    assert.equal(h.gameState.namespace.fluteDailyRemaining("whiteFlute"), 3, "Rome midnight resets an exhausted flute in summer and winter");
    h.state.fluteDaily.blackFlute = { remaining: 1, lastClaimedAt: after };
    assert.equal(h.gameState.namespace.fluteDailyRemaining("blackFlute"), 1, "Today's uses remain consumed");
  }
}
console.log("Daycare quotes, stale reads, coalesced invalidations and Rome flute rollover passed.");

{
  const h = await refreshHarness("daycare");
  const first = h.refresh(), second = h.refresh();
  h.reads[0]({ ok: true, projection: refreshedSave(2) }); await first;
  assert.equal(h.state.authoritativeRevision, 1);
  h.reads[1]({ ok: true, projection: refreshedSave(3) }); await second;
  assert.equal(h.state.authoritativeRevision, 3);
}
{
  let day = "2026-09-14", timer, renderCount = 0, intervalCount = 0;
  const state = { scene: { name: "capture" } };
  const events = {};
  const context = vm.createContext({ window: { addEventListener: (name, fn) => { events[name] = fn; },
    setInterval: fn => { timer = fn; intervalCount++; return 1; } },
    document: { addEventListener() {} } });
  const module = new vm.SourceTextModule(read("app/client/capture-handler.js"), { context });
  await module.link(() => synthetic(context, {
    registerAction() {}, pokemonDisplayName() {}, teamViolationFromBattleResult() {}, teamViolationLines() {},
    messageDescriptor() {}, t() {}, textDescriptor() {}, openActiveProgressionScene() {}, openBattleStartTargetPanel() {},
    enforceBattleRuntimeSceneLock() {}, TEAM_MAX: 6, findTeamCompositionViolation() {}, FLUTE_DAILY_USE_LIMIT: 15,
    SEARCH_TOOL_ITEMS: {}, captureLevelIsUnlocked() {}, captureLevelLimitForBadges() {}, captureLevelRangesForBadges() {},
    openMessage() {}, saveFromAuthoritativeProjection() {}, currentUserId() {}, getSupabaseClient() {},
    applyPlayerSave() {}, fluteDailyRemaining() {}, root: {}, state, rememberCaptureSearchPreferences() {}, button() {},
    render: () => renderCount++, setHtml() {}, renderPokemonCard() {}, broadcastCaptureEncounterRuntimeInvalidation() {},
    renderCaptureTeamSectionInner() {}, getResolvedInventoryItem() {}, startAuthoritativeWildEncounter() {},
    authoritativeBattleRuntimeOwnerId() {}, clearPendingAuthoritativeCaptureFlee() {}, fleeAuthoritativeCaptureEncounter() {},
    getAuthoritativeBattle() {}, startAuthoritativeCaptureBattle() {}, openAuthoritativeBattleProjection() {},
    getCurrentPlayerState: async () => ({ ok: false }), dateKeyInRome: () => day
  }));
  await module.evaluate();
  module.namespace.initializeCaptureEncounterRuntime(); module.namespace.initializeCaptureEncounterRuntime();
  assert.equal(intervalCount, 1, "Initialize one daily watcher");
  timer(); assert.equal(renderCount, 0);
  day = "2026-09-15"; timer(); assert.equal(renderCount, 1, "Update the visible form when Rome's date changes");
  timer(); assert.equal(renderCount, 1);
  day = "2026-09-16"; state.inBattle = true; timer(); assert.equal(renderCount, 1, "Do not interrupt a battle");
  day = "2026-09-17"; state.inBattle = false; events.focus(); assert.equal(renderCount, 2, "A throttled background tab catches up on focus");
  await tick();
}
