import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { IT_UI_TRANSLATIONS } from "../../app/i18n/it/ui.js";
import { EN_UI_TRANSLATIONS } from "../../app/i18n/en/ui.js";

const view = readFileSync(new URL("../../app/view/starter.js", import.meta.url), "utf8");
const handler = readFileSync(new URL("../../app/client/starter-handler.js", import.meta.url), "utf8");
assert.match(handler, /import \{ renderStarterGenderPicker, renderStarterPokemonGrid \} from "\.\.\/view\/starter.js"/);
function executable(source) {
  return source.replace(/^import .*;\r?$/gm, "").replace(/^export /gm, "");
}
for (const dictionary of [IT_UI_TRANSLATIONS, EN_UI_TRANSLATIONS]) {
  const species = { speciesKey: "1", dexNumber: 1, gender: ["male", "female"], evolution: { stage: "base" } };
  const actions = {};
  const state = { starterSetup: { trainerIndex: 0, generation: 1 } };
  const context = vm.createContext({
    state, registerAction: (key, action) => { actions[key] = action; },
    document: { addEventListener() {} }, root: { querySelector: () => null },
    Engine: { findSpecies: () => species, getAllSpecies: () => [species], generationForDexNumber: () => 1 },
    isTrainerIndex: () => false,
    t: key => key.split(".").slice(1).reduce((value, part) => value[part], dictionary),
    escapeHtml: value => String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;"),
    getGenderImage: value => value, renderImage: () => "<img>",
    getPokemonStaticImage: () => "fixture", withPokemonSpriteClass: () => "fixture",
    withPokemonSpriteAttrs: () => "", speciesDisplayName: () => "Bulbasaur"
  });
  vm.runInContext(executable(view), context);
  vm.runInContext(executable(handler), context);
  let inserted = "";
  let removed = false;
  const card = {
    dataset: { species: "1" }, closest: () => null,
    classList: { toggle() {} },
    querySelector(selector) {
      if (selector === "strong") return { insertAdjacentHTML: (position, html) => { inserted = html; } };
      if (selector === ".starter-gender-picker" && inserted) return { remove: () => { inserted = ""; removed = true; } };
      return null;
    }
  };
  // The real click action updates the existing card without a full scene render.
  actions["starter-pick"](card);
  assert.ok(inserted.includes(dictionary.starter.choosePokemonGender));
  assert.ok(inserted.indexOf("starter-gender-label") < inserted.indexOf("starter-gender-options"));
  assert.equal((inserted.match(/data-action="starter-gender-pick"/g) || []).length, 2);
  assert.ok(context.renderStarterPokemonGrid(state.starterSetup, "").includes(inserted),
    "Click updates and full grid renders must use identical picker markup");
  actions["starter-pick"](card);
  assert.equal(inserted, "");
  assert.equal(removed, true);
  assert.equal(context.renderStarterGenderPicker({ gender: ["female"] }, ""), "");
  assert.equal(context.renderStarterGenderPicker(null, ""), "");
}
console.log("Starter gender selection: click label, shared grid markup, deselection and single-gender species passed.");
