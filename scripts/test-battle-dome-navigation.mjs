import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const read = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const renderer = read("app/client/renderer.js");
const sceneMarkup = renderer.slice(renderer.indexOf("function currentSceneMarkup("), renderer.indexOf("function isScrollable("));
for (const role of [undefined, "creator", "challenger", "spectator"]) {
  const scene = { name: "battle-dome-battle", battleDomeBattleId: "battle-id", battleDomeRole: role };
  const context = vm.createContext({
    state: { scene }, normalizeRenderableScene: value => value,
    renderBattleRestoreScene: () => "loading",
    renderBattleDomeLeadSelectionScene: () => "lead-selection",
    renderBattleScene: value => {
      assert.ok(value.playerTeam && value.enemyTeam && value.manager);
      return "battle";
    }
  });
  vm.runInContext(sceneMarkup, context);
  assert.equal(vm.runInContext("currentSceneMarkup()", context), "loading", "A reloaded PvP route must not render an uninitialized battle");
  assert.equal(context.state.scene, scene, "Loading must preserve the requested battle route");
  scene.battleDomeLeadSelection = true;
  assert.equal(vm.runInContext("currentSceneMarkup()", context), "lead-selection");
  scene.battleDomeLeadSelection = false;
  scene.playerTeam = {};
  assert.equal(vm.runInContext("currentSceneMarkup()", context), "loading");
  scene.enemyTeam = {};
  scene.manager = {};
  assert.equal(vm.runInContext("currentSceneMarkup()", context), "battle");
}

const router = read("app/client/router.js").replace(/^import .*;\r?\n/gm, "").replace(/^export /gm, "");
const routes = vm.runInNewContext(router + "\n({ sceneFromRoute, routeForScene });");
for (const [path, name, tab] of [
  ["/battle-area/battle-dome", "battle-dome", "team"],
  ["/battle-area/battle-dome/lobby", "battle-dome", "lobby"],
  ["/battle-area/battle-dome/battle/00000000-0000-4000-8000-000000000001", "battle-dome-battle", undefined]
]) {
  const scene = routes.sceneFromRoute(path);
  assert.equal(scene.name, name);
  assert.equal(scene.battleDomeTab, tab);
  assert.equal(routes.routeForScene(scene), path, "Direct links and reloads must preserve the destination");
}
assert.equal(routes.sceneFromRoute("/battle-area/battle-dome/unknown").invalidRoute, true);

const navigation = read("app/client/navigation-handler.js");
const lobbyAction = navigation.slice(navigation.indexOf('registerAction("open-battle-dome-lobby"'), navigation.indexOf('registerAction("open-city-pokemon-center"'));
const initializeDomeScene = renderer.slice(renderer.indexOf("export function setScene("), renderer.indexOf("  var historyMode =", renderer.indexOf("export function setScene("))).replace("export function", "function") + "\n}";
for (const previousTab of ["team", "lobby"]) {
  const state = { scene: { name: "home" }, battleDome: { tab: previousTab } };
  const context = vm.createContext({ state, normalizeRenderableScene: value => value, registerAction: (_name, callback) => callback() });
  vm.runInContext(initializeDomeScene + "\n" + lobbyAction, context);
  assert.equal(state.battleDome.tab, "lobby", "PvP must override the previously selected Cupola tab");
}
assert.match(read("app/client/render-utils.js"), /label: t\("navigation\.pvp"\), action: "open-battle-dome-lobby", href: "\/battle-area\/battle-dome\/lobby"/);

const handler = read("app/client/battle-dome-handler.js");
const tabAction = handler.slice(handler.indexOf('registerAction("battle-dome-tab"'), handler.indexOf('registerAction("battle-dome-add-pokemon"'));
for (const tab of ["team", "lobby"]) {
  const state = { scene: { name: "battle-dome", battleDomeTab: "lobby" }, battleDome: { tab: "lobby" } };
  vm.runInNewContext(tabAction, {
    state, registerAction: (_name, callback) => callback({ dataset: { tab } }),
    render() {}, refreshBattleDomeState() {},
    writeSceneHistory: (scene, mode) => {
      assert.equal(mode, "replace");
      assert.equal(routes.routeForScene(scene), "/battle-area/battle-dome" + (tab === "lobby" ? "/lobby" : ""));
    }
  });
  assert.equal(state.battleDome.tab, tab);
}

const openBattle = handler.slice(handler.indexOf("export async function openBattleDomeBattle("), handler.indexOf('registerAction("battle-dome-open-battle"')).replace("export async function", "async function");
for (const outcome of ["success", "unavailable", "navigated-away"]) {
  let completeRead;
  let opened = false;
  const user = { id: "user-id" };
  const state = { auth: { user }, scene: { name: "battle-dome-battle" }, battleDome: {} };
  const context = vm.createContext({
    state, t: key => key,
    readBattleDomeBattle: () => new Promise(resolve => { completeRead = resolve; }),
    openBattleDomeProjection: () => { opened = true; },
    setScene: scene => { state.scene = scene; }
  });
  const pending = vm.runInContext(openBattle + '\nopenBattleDomeBattle("battle-id", "replace");', context);
  if (outcome === "navigated-away") state.scene = { name: "battle-dome", battleDomeTab: "lobby" };
  completeRead(outcome === "unavailable" ? { ok: false } : { ok: true, battle: {}, events: [] });
  await pending;
  assert.equal(opened, outcome === "success");
  assert.equal(state.auth.user, user, "Restoring or losing a PvP battle must not clear authentication");
  if (outcome !== "success") {
    assert.equal(state.scene.name, "battle-dome");
    assert.equal(state.scene.battleDomeTab, "lobby");
  }
}

const battleHandler = read("app/client/battle-handler.js");
const bottomPanelSource = battleHandler.slice(battleHandler.indexOf("function setBattleBottomPanel("), battleHandler.indexOf("function openPostMoveSwitchDialog("));
for (const name of ["battle", "admin-battle", "battle-dome-battle", "home"]) {
  for (const panel of ["teams", "items", "info"]) {
    const state = { scene: { name } };
    let visiblePanel;
    const buttons = ["info", "teams", "items"].map(mode => ({ dataset: { panel: mode }, classes: {} }));
    buttons.forEach(button => { button.classList = { toggle: (key, enabled) => { button.classes[key] = enabled; } }; });
    const context = vm.createContext({ state, root: {
      querySelector: () => ({ setAttribute: (_name, value) => { visiblePanel = value; } }),
      querySelectorAll: () => buttons
    } });
    vm.runInContext(bottomPanelSource + '\nsetBattleBottomPanel("' + panel + '");', context);
    assert.equal(state.scene.battleBottomPanel, name === "home" ? undefined : panel,
      name + ": mobile tabs must select the requested battle section");
    assert.equal(visiblePanel, name === "home" ? undefined : panel);
    if (name !== "home") {
      assert.equal(buttons.filter(button => button.classes["button-primary"]).length, 1);
    }
    state.scene.battleTower = true;
    vm.runInContext('setBattleBottomPanel("items");', context);
    assert.equal(state.scene.battleBottomPanel, name === "home" ? undefined : "info");
  }
}

const battleView = read("app/view/battle.js");
const ownSlotSource = battleView.slice(battleView.indexOf("  var ownSlotOptions ="), battleView.indexOf("  var opponentSlotOptions ="));
for (const [adminPerspective, battleDome] of [[false, false], [false, true], [true, true]]) {
  for (const ownNeedsSwitch of [false, true]) {
    const scene = { battleDome, battleEntryChoicePanel: { kind: "type" } };
    const context = vm.createContext({ scene, adminPerspective, ownNeedsSwitch, readonlyHistory: false,
      ownTeam: {}, ownSwitchAction: "switch", ownMoveAction: "move",
      renderForcedSwitchOverlay: () => "replacement", renderEntryChoiceOverlay: () => "incense" });
    vm.runInContext(ownSlotSource, context);
    assert.equal(context.ownSlotOptions.overlayContent, "incense",
      "An incense choice must remain visible even while the active Pokemon is KO");
    scene.battleEntryChoicePanel = null;
    vm.runInContext(ownSlotSource, context);
    assert.equal(context.ownSlotOptions.overlayContent, ownNeedsSwitch ? "replacement" : undefined,
      "Canceling the incense choice must restore the appropriate battle controls");
    context.readonlyHistory = true;
    scene.battleEntryChoicePanel = { kind: "type" };
    vm.runInContext(ownSlotSource, context);
    assert.equal(context.ownSlotOptions.overlayContent, undefined);
  }
}

console.log("Battle Dome reload, mobile tabs, incense replacement panels and lobby navigation checks passed.");
