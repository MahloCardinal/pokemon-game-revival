import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import vm from "node:vm";

const read = file => readFileSync(new URL("../" + file, import.meta.url), "utf8");
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
console.log("Client consistency: session isolation, retries, cart revisions and per-tab deployment updates passed.");
