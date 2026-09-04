import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../app/client/battle-handler.js", import.meta.url), "utf8");
function functionSource(name) {
  const start = source.indexOf("function " + name + "(");
  assert.ok(start >= 0, name);
  return source.slice(start, source.indexOf("\n}", start) + 2);
}
function actionSource(name) {
  const start = source.indexOf('registerAction("' + name + '"');
  assert.ok(start >= 0, name);
  return source.slice(start, source.indexOf("\n});", start) + 4);
}

export async function testProgressionDialogFlow(Engine) {
  const actions = {};
  const requests = [];
  const state = { team: [], pendingResolutions: [], authoritativeRevision: 1 };
  const context = vm.createContext({
    Engine, state, console, crypto: { randomUUID: () => "command-id" },
    activeAuthoritativeTrainingResolution: null, authoritativeTrainingProgressionPending: false,
    authoritativeOrdinaryProgressionComplete: null, authoritativeExpPresentation: null,
    registerAction: (name, callback) => { actions[name] = callback; },
    render: () => { throw new Error("A progression popup must only render the dialog layer"); },
    renderDialogLayer() {},
    textDescriptor: (key, params) => ({ key, params }),
    pokemonNameDescriptor: pokemon => pokemon.speciesKey,
    moveNameDescriptor: move => move.index,
    moveDisplayName: move => "Move " + move.index,
    t: key => key,
    battleTitle: key => key, battleText: key => key, battleFailure: key => key,
    openMessage: (lines, options) => { state.dialog = { type: "message", lines, ...options }; },
    applyAuthoritativeBattlePlayerState: projection => Object.assign(state, projection),
    resolveAuthoritativeOrdinaryProgression: request => new Promise(resolve => { requests.push({ request, resolve }); }),
    resolveAuthoritativeTrainingPokemon: request => new Promise(resolve => { requests.push({ request, resolve }); }),
    openAuthoritativeTrainingProgression() {}, resumeAuthoritativeTrainingProgression() {},
    finishAuthoritativeOrdinaryProgression() {},
    readAuthoritativeOrdinaryProgression: () => Promise.resolve({ ok: true, projection: { player_state: {} } })
  });
  vm.runInContext([
    ...["authoritativeExpAwardPokemon", "openNextAuthoritativeExpAward", "openAuthoritativeExpAwards",
      "authoritativeOrdinaryResolution", "pokemonByInstanceId", "trainingMoveName", "trainingEvolutionTarget",
      "submitAuthoritativeTrainingResolution", "resumeAuthoritativeOrdinaryChoices",
      "openAuthoritativeOrdinaryProgression", "resumeAuthoritativeOrdinaryProgression",
      "openNextAuthoritativeTrainingChoice"].map(functionSource),
    ...["authoritative-progression-level-continue", "training-resolution-replace-move",
      "training-resolution-decline-move", "training-resolution-choose-evolution"].map(actionSource)
  ].join("\n"), context);
  const pokemon = (id, level, xp, moves = [[25, 10, 2]]) => {
    const result = Engine.Pokemon.fromJSON({ s: "4", l: level, xp, hp: 32, m: moves });
    result.instanceId = id;
    return result;
  };
  const resolution = (id, before, after, offers = [], evolutions = []) => ({
    id: "resolution-" + id + "-" + after.level,
    pokemon_instance_id: id, status: "pending", options: {
      source: "ordinary", team_slot: 0, before_state: before.toJSON(), after_state: after.toJSON(),
      level_moves: offers, evolutions
    }
  });
  const award = (id, exp) => ({ pokemonInstanceId: id, exp });
  const close = () => { const callback = state.dialog.onClose; state.dialog = null; callback(); };
  const settle = async projection => {
    const pending = requests.shift();
    assert.ok(pending, "Expected an authoritative command");
    pending.resolve({ ok: true, projection: { player_state: projection } });
    await Promise.resolve(); await Promise.resolve();
    return pending.request;
  };
  let complete = 0;
  const firstAfter = pokemon("first", 7, 5);
  const secondAfter = pokemon("second", 9, 2);
  const cappedAfter = pokemon("capped", 100, 0);
  const before = pokemon("first", 6, 55);
  const first = resolution("first", before, firstAfter, [{ move_index: 245, power: 12, stats: 2 }]);
  state.team = [firstAfter, secondAfter, cappedAfter];
  state.pendingResolutions = [first];
  state.ordinaryProgression = { pokemon: [] };
  const scene = { authoritativeExpAwards: [award("first", 45), award("second", 40), award("capped", 20)],
    authoritativeExpBefore: { capped: pokemon("capped", 100, 3) } };
  context.openAuthoritativeExpAwards(scene, () => { complete++; });
  assert.equal(state.dialog.type, "level-up");
  assert.equal(state.dialog.title.key, "ui.dialogs.experienceGained");
  assert.equal(state.dialog.resultLines[0].params.experience, 45);
  assert.equal(state.dialog.beforePokemon.expCurrent, 10);
  assert.equal(state.dialog.afterPokemon.expCurrent, 5);
  assert.equal(state.dialog.beforePokemon.level, 6);
  assert.equal(state.dialog.afterPokemon.level, 7);
  assert.equal(before.expCurrent, 55, "Presentation must not mutate canonical EXP");
  actions["authoritative-progression-level-continue"]();
  assert.equal(state.dialog, null, "Do not announce learning before server success");
  assert.equal(firstAfter.moves.length, 1, "Do not grant moves in client state");

  // Explicit failure must retry, not silently skip a free-slot move or announce success.
  requests.shift().resolve({ ok: false, uncertain: false });
  await Promise.resolve(); await Promise.resolve();
  assert.equal(state.dialog.lines[0], "trainingResolutionFailed");
  close();
  const learnedFirst = pokemon("first", 7, 5, [[25, 10, 2], [245, 12, 2]]);
  await settle({ team: [learnedFirst, secondAfter, cappedAfter],
    pendingResolutions: [resolution("second", pokemon("second", 8, 42), secondAfter)] });
  assert.equal(state.dialog.type, "message");
  assert.equal(state.dialog.lines[0].key, "messages.progression.learned");
  assert.equal(state.dialog.lines[0].params.move, 245);
  close();
  assert.equal(state.dialog.resultLines[0].params.experience, 40);
  assert.equal(state.dialog.beforePokemon.expCurrent, 2);
  assert.equal(state.dialog.afterPokemon.level, 9);
  actions["authoritative-progression-level-continue"]();
  await settle({ pendingResolutions: [], ordinaryProgression: null });
  assert.equal(state.dialog.title.key, "ui.dialogs.experienceGained");
  assert.equal(state.dialog.beforePokemon.expCurrent, 3, "Preserve actual EXP before a cap reset");
  assert.equal(state.dialog.afterPokemon.expCurrent, 0);
  assert.equal(state.dialog.beforePokemon.level, state.dialog.afterPokemon.level);
  close();
  assert.equal(complete, 1);
  assert.equal(context.authoritativeExpPresentation, null);
  assert.equal(context.openAuthoritativeExpAwards(scene, () => { complete++; }), false, "Never replay awards");

  // Full moveset: replacement/decline remains a separate second popup.
  const full = pokemon("full", 7, 0, [[25, 10, 2], [245, 10, 2], [53, 10, 2], [54, 10, 2]]);
  state.team = [full];
  state.ordinaryProgression = { pokemon: [] };
  state.pendingResolutions = [resolution("full", pokemon("full", 6, 50, full.toJSON().m), full,
    [{ move_index: 55, power: 12, stats: 2 }])];
  context.openAuthoritativeExpAwards({ authoritativeExpAwards: [award("full", 50)] }, () => { complete++; });
  actions["authoritative-progression-level-continue"]();
  assert.equal(state.dialog.type, "training-move-resolution");
  actions["training-resolution-decline-move"]();
  await settle({ pendingResolutions: [], ordinaryProgression: null });
  assert.equal(complete, 2, "A declined move must not create a learned message");

  // On the next level of a multi-level reward, EXP is not announced twice.
  state.team = [firstAfter]; state.ordinaryProgression = { pokemon: [] };
  state.pendingResolutions = [resolution("first", pokemon("first", 6, 105), firstAfter)];
  context.openAuthoritativeExpAwards({ authoritativeExpAwards: [award("first", 100)] }, () => { complete++; });
  actions["authoritative-progression-level-continue"]();
  const nextLevel = pokemon("first", 8, 5);
  await settle({ team: [nextLevel], pendingResolutions: [resolution("first", pokemon("first", 7, 55), nextLevel,
    [], [{ target_species_key: "5" }])] });
  assert.equal(state.dialog.resultLines.length, 1);
  assert.equal(state.dialog.resultLines[0].key, "messages.progression.levelReached");
  actions["authoritative-progression-level-continue"]();
  assert.equal(state.dialog.type, "training-evolution-resolution");
  actions["training-resolution-choose-evolution"]({ dataset: { speciesKey: "5" } });
  const evolutionRequest = await settle({ pendingResolutions: [], ordinaryProgression: null });
  assert.equal(evolutionRequest.choices.evolutionTargetSpeciesKey, "5");
  assert.equal(complete, 3);

  // An award below the next-level threshold still gets an actual comparison.
  state.team = [pokemon("no-level", 6, 35)];
  context.openAuthoritativeExpAwards({ authoritativeExpAwards: [award("no-level", 25)],
    authoritativeExpBefore: { "no-level": pokemon("no-level", 6, 10) } }, () => { complete++; });
  assert.equal(state.dialog.beforePokemon.expCurrent, 10);
  assert.equal(state.dialog.afterPokemon.expCurrent, 35);
  assert.equal(state.dialog.resultLines.length, 1);
  close();
  assert.equal(complete, 4);

  state.team = [full]; state.ordinaryProgression = { pokemon: [] };
  state.pendingResolutions = [resolution("full", pokemon("full", 6, 50, full.toJSON().m), full,
    [{ move_index: 55, power: 12, stats: 2 }])];
  context.openAuthoritativeExpAwards({ authoritativeExpAwards: [award("full", 50)] }, () => { complete++; });
  actions["authoritative-progression-level-continue"]();
  actions["training-resolution-replace-move"]({ dataset: { index: "1" } });
  const replaced = pokemon("full", 7, 0, [[25, 10, 2], [55, 12, 2], [53, 10, 2], [54, 10, 2]]);
  const replacementRequest = await settle({ team: [replaced], pendingResolutions: [], ordinaryProgression: null });
  assert.equal(replacementRequest.choices.moves[0].replacementSlot, 1);
  assert.equal(state.dialog.lines[0].params.move, 55);
  close();
  assert.equal(complete, 5);

  // Recovery without a battle scene still combines EXP and the first level.
  state.team = [firstAfter]; state.pendingResolutions = [first];
  state.ordinaryProgression = { pokemon: [{ pokemon_instance_id: "first", levels_gained: 1, exp_awarded: 45 }] };
  context.openAuthoritativeOrdinaryProgression();
  assert.equal(state.dialog.resultLines[0].params.experience, 45);
  assert.equal(state.dialog.beforePokemon.expCurrent, 10);
  const dialogs = readFileSync(new URL("../app/view/dialogs.js", import.meta.url), "utf8");
  const start = dialogs.indexOf("function renderLevelUpDialog(");
  const renderer = vm.createContext({
    escapeHtml: String, resolveText: value => typeof value === "string" ? value : value.key,
    t: key => key, assetPath: () => "arrow.webp", renderImage: () => "<img>",
    renderPokemonCard: value => `<article>Lv ${value.level} EXP ${value.expCurrent}</article>`,
    button: (label, action) => `<button data-action="${action}">${label}</button>`
  });
  vm.runInContext(dialogs.slice(start, dialogs.indexOf("\n}", start) + 2), renderer);
  const html = renderer.renderLevelUpDialog(state.dialog);
  assert.match(html, /ui.dialogs.experienceGained/);
  assert.match(html, /Lv 6 EXP 10/);
  assert.match(html, /Lv 7 EXP 5/);
  assert.match(html, /authoritative-progression-level-continue/);
  assert.doesNotMatch(dialogs, /function renderExperienceDialog/);
  console.log("Progression dialogs: combined EXP/comparison, free-slot confirmation, failures, multiple Pokemon/levels, evolution and recovery passed.");
}
