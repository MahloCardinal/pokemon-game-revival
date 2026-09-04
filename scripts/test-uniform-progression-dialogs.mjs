import assert from "node:assert/strict";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = fileURLToPath(new URL("..", import.meta.url));
const read = path => readFileSync(resolve(root, path), "utf8");
const cache = new Map();
const stubs = new Map([
  [resolve(root, "app/client/game-state.js"), { state: {} }],
  [resolve(root, "app/client/admin-auth.js"), { currentUserIsAdmin: () => false }],
  [resolve(root, "app/api/supabase.js"), { getRuntimeEnvironment: () => ({}) }]
]);
function sourceModule(path) {
  const filename = resolve(path);
  if (cache.has(filename)) return cache.get(filename);
  const stub = stubs.get(filename);
  const module = stub ? new vm.SyntheticModule(Object.keys(stub), function () {
    for (const [key, value] of Object.entries(stub)) this.setExport(key, value);
  }, { identifier: filename }) : new vm.SourceTextModule(readFileSync(filename, "utf8"), { identifier: filename });
  cache.set(filename, module);
  return module;
}
async function load(path) {
  const module = sourceModule(resolve(root, path));
  if (module.status === "unlinked") await module.link((specifier, parent) => sourceModule(resolve(dirname(parent.identifier), specifier)));
  if (module.status !== "evaluated") await module.evaluate();
  return module.namespace;
}
const Engine = await load("app/engine/index.js");
const { renderDialog } = await load("app/view/dialogs.js");
const { setLocale, t, messageDescriptor } = await load("app/client/i18n.js");
const text = await load("app/client/entity-text.js");
const { escapeHtml } = await load("app/client/asset-helpers.js");
const items = await load("app/data/items.js");
const pokemon = Engine.Pokemon.fromJSON({ s: "4", l: 30, hp: 80, xp: 1, m: [[25, 80, 35], [245, 83, 39], [53, 77, 30], [54, 85, 42]] });
pokemon.instanceId = "test-pokemon";
const move = Engine.moveFromJSON([55, 87, 44]);
const previews = [];
for (const locale of ["it", "en"]) {
  setLocale(locale);
  for (const [type, prefix] of [["move-learn", "progression"], ["training-move-resolution", "training-resolution"],
    ["daycare-move-resolution", "daycare-resolution"], ["pokemon-center-move-resolution", "pokemon-center-resolution"]]) {
    const dialog = { type, pokemon, move, moves: pokemon.moves };
    const html = renderDialog(dialog);
    assert.equal((html.match(new RegExp(`data-action="${prefix}-replace-move"`, "g")) || []).length, 4);
    assert.match(html, /<button[^>]+disabled>/);
    assert.ok(html.includes(escapeHtml(text.moveDisplayDescription(move))), "New move must include its actual complete effect");
    for (const known of pokemon.moves) assert.ok(html.includes(escapeHtml(text.moveDisplayDescription(known))));
    assert.match(html, /pokemon-card/);
    assert.doesNotMatch(html, /undefined|NaN|\[object Object\]/);
    const confirmation = renderDialog({ ...dialog, forgetConfirmation: { move: pokemon.moves[1] } });
    assert.ok(confirmation.includes(t("messages.progression.confirmForget", { move: text.moveDisplayName(pokemon.moves[1]) })));
    assert.match(confirmation, /class="dialog-backdrop" inert aria-hidden="true"/);
    assert.match(confirmation, /role="alertdialog"/);
    assert.match(confirmation, /data-action="move-forget-confirm"/);
    assert.match(confirmation, /data-action="move-forget-cancel"/);
    if (locale === "it" && type === "training-move-resolution") previews.push(["Mossa", html], ["Conferma", confirmation]);
  }
  for (const type of ["training-evolution-resolution", "daycare-evolution-resolution", "pokemon-center-evolution"]) {
    const html = renderDialog({ type, pokemon, item: items.fire_stone, targets: [{ speciesKey: "5", isShiny: true }] });
    assert.doesNotMatch(html, /<button[^>]*>(?:(?!<\/button>)[\s\S])*<img/);
    assert.match(html, /evolution-preview-wrap/);
    assert.match(html, /evolution-actions/);
    assert.ok(html.includes(t("ui.dialogs.evolve")) && html.includes(t("ui.dialogs.stopEvolution")));
    if (locale === "it" && type === "training-evolution-resolution") previews.push(["Evoluzione", html]);
  }
}
setLocale("it");

function extract(source, name, async = false) {
  const start = source.indexOf((async ? "async " : "") + "function " + name + "(");
  assert.ok(start >= 0, name);
  return source.slice(start, source.indexOf("\n}", start) + 2);
}
function action(source, name) {
  const start = source.indexOf('registerAction("' + name + '"');
  assert.ok(start >= 0, name);
  return source.slice(start, source.indexOf("\n});", start) + 4);
}
const shared = read("app/client/progression-dialog.js").replace(/^import .*;\r?\n/gm, "").replaceAll("export function", "function");
const centerSource = read("app/client/pokemon-center-handler.js");
for (const tutor of [false, true]) {
  const actions = {};
  const state = { team: [pokemon], scene: { name: "pokemon-center" }, authoritativeRevision: 1 };
  const calls = [];
  let respond;
  const command = request => { calls.push(request); return new Promise(resolve => { respond = resolve; }); };
  const context = vm.createContext({
    Engine, state, messageDescriptor, textDescriptor: key => key, ...text,
    authoritativePokemonCenterCommandPending: false, clearPokemonCenterChoicePopup() {},
    renderDialogLayer() {}, renderPokemonCenter() {}, updatePokemonCenterModeDom() {},
    clearPokemonCenterAfterAction() {}, saveFromAuthoritativeProjection: value => value,
    applyPlayerSave: value => Object.assign(state, value), pokemonCenterCommandError: value => value,
    executePokemonCenterCommandAuthoritative: command, executePokemonCenterMoveTutorAuthoritative: command,
    registerAction: (name, callback) => { actions[name] = callback; },
    openMessage: (lines, options) => { state.dialog = { type: "message", lines, ...options }; }
  });
  vm.runInContext([shared,
    ...["createPokemonCenterLearnedMove", "openPokemonCenterMoveResolution", "showPokemonCenterLearnedResult"].map(name => extract(centerSource, name)),
    extract(centerSource, "runAuthoritativePokemonCenterCommand", true), extract(centerSource, "runAuthoritativePokemonCenterTutorCommand", true),
    ...["pokemon-center-resolution-replace-move", "pokemon-center-resolution-decline-move"].map(name => action(centerSource, name))
  ].join("\n"), context);
  const offered = context.createPokemonCenterLearnedMove(move, pokemon);
  assert.equal(offered.power, 85); assert.equal(offered.stats, 42);
  context.openPokemonCenterMoveResolution(pokemon, items.tm01, offered, tutor);
  const selection = state.dialog;
  actions["pokemon-center-resolution-replace-move"]({ dataset: { index: "2" } });
  assert.equal(calls.length, 0);
  actions["move-forget-cancel"](); assert.equal(state.dialog, selection);
  actions["pokemon-center-resolution-replace-move"]({ dataset: { index: "2" } });
  actions["move-forget-confirm"](); assert.equal(calls.length, 1);
  assert.equal(calls[0].replacementSlot, 2);
  const canonical = Engine.Pokemon.fromJSON(pokemon.toJSON()); canonical.instanceId = pokemon.instanceId;
  canonical.moves[2] = offered;
  respond({ ok: true, projection: { team: [canonical] } });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(state.dialog.pokemon, canonical);
  assert.equal(pokemon.moves[2].index, 53, "The old card must not be mutated locally");
  // Free-slot learning follows the same post-commit confirmation path.
  state.dialog = null;
  if (tutor) context.runAuthoritativePokemonCenterTutorCommand(canonical, items.tm01, offered, null);
  else context.runAuthoritativePokemonCenterCommand({ operation: "teach_tm", pokemon: canonical, item: items.tm01 }, "learned");
  assert.equal(state.dialog, null);
  respond({ ok: false, message: "failed" });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(state.dialog.pokemon, undefined, "Failure must never show a learned card");
}

// Daycare: use the server preview, preserve choices on No, then show only the
// canonical withdrawn Pokemon after commit (including automatic learning).
const daycareSource = read("app/client/daycare-handler.js");
for (const full of [false, true]) {
  const actions = {};
  const original = Engine.Pokemon.fromJSON(pokemon.toJSON());
  if (!full) original.moves = original.moves.slice(0, 2);
  const state = { team: [], pendingResolutions: [], authoritativeRevision: 1 };
  const resolution = { id: "withdrawal", pokemon_instance_id: "daycare-pokemon", status: "pending",
    options: { source: "daycare_withdrawal", evolutions: [] } };
  state.pendingResolutions = [resolution];
  const preview = Engine.Pokemon.fromJSON(original.toJSON()); preview.level = 34;
  preview.moves.forEach(move => { move.power += 8; move.stats += 8; });
  const offer = { move_index: 55, power: 91, stats: 48 };
  let respond;
  const requests = [];
  const context = vm.createContext({
    Engine, state, ...text, messageDescriptor, textDescriptor: key => key,
    activeDaycareResolution: null, authoritativeDaycareCommandPending: false,
    render() {}, renderDialogLayer() {}, replaceTeamRuntimeState() {},
    clearPendingActivityRuntime() {}, recordMissionEvent() {},
    registerAction: (name, callback) => { actions[name] = callback; },
    previewDaycareWithdrawal: async () => ({ ok: true, projection: { pokemon: preview.toJSON(), level_moves: [offer] } }),
    resolveDaycareWithdrawalCommand: request => { requests.push(request); return new Promise(resolve => { respond = resolve; }); },
    saveFromAuthoritativeProjection: value => value, applyPlayerSave: value => Object.assign(state, value),
    openMessage: (lines, options) => { state.dialog = { type: "message", lines, ...options }; }
  });
  vm.runInContext([shared,
    ...["pendingResolutionForSlot", "speciesChoice", "submitAuthoritativeDaycareResolution", "openNextAuthoritativeDaycareChoice"].map(name => extract(daycareSource, name)),
    extract(daycareSource, "startAuthoritativeDaycareResolution", true),
    action(daycareSource, "daycare-resolution-replace-move")
  ].join("\n"), context);
  await context.startAuthoritativeDaycareResolution({ pendingResolutionId: resolution.id, pokemon: original });
  if (full) {
    assert.equal(state.dialog.pokemon.level, 34);
    assert.equal(state.dialog.move.power, 91);
    assert.equal(state.dialog.moves[0].power, preview.moves[0].power);
    const selection = state.dialog;
    actions["daycare-resolution-replace-move"]({ dataset: { index: "1" } });
    assert.equal(requests.length, 0);
    actions["move-forget-cancel"](); assert.equal(state.dialog, selection);
    actions["daycare-resolution-replace-move"]({ dataset: { index: "1" } });
    actions["move-forget-confirm"]();
  }
  assert.equal(requests.length, 1);
  assert.equal(requests[0].choices.moves[0].replacement_slot, full ? 1 : null);
  const canonical = Engine.Pokemon.fromJSON(preview.toJSON()); canonical.instanceId = resolution.pokemon_instance_id;
  if (full) canonical.moves[1] = Engine.moveFromJSON([55, 91, 48]);
  else canonical.moves.push(Engine.moveFromJSON([55, 91, 48]));
  respond({ ok: true, projection: { team: [canonical] } });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(state.dialog.pokemon, canonical);
  assert.equal(original.moves.some(move => move.index === 55), false);
}

if (process.argv.includes("--preview")) {
  mkdirSync(resolve(root, ".build"), { recursive: true });
  const links = [...read("index.html").matchAll(/<link[^>]+href="[^"]+\.css"[^>]*>/g)].map(match => match[0]).join("\n");
  const sections = previews.map(([label, html], index) => `<div data-preview="${index}" ${index ? "hidden" : ""}>${html}</div>`).join("");
  writeFileSync(resolve(root, ".build/progression-preview.html"), `<!doctype html><html lang="it"><head><base href="/"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${links}</head><body><nav style="position:fixed;top:0;left:0;z-index:999">${previews.map(([label], index) => `<button onclick="document.querySelectorAll('[data-preview]').forEach(e=>e.hidden=e.dataset.preview!='${index}')">${label}</button>`).join("")}</nav><div id="app">${sections}</div></body></html>`);
}
console.log("Uniform progression dialogs: real localized cards/effects, overlays, static evolutions, TM/tutor confirmations and canonical results passed.");
