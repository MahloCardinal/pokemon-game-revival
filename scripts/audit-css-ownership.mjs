import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

const read = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const files = path => readdirSync(new URL("../" + path, import.meta.url));
const shared = new Set(["base", "components", "info", "layout", "inventory", "pokemon-card", "scene-backgrounds", "dialogs"]);
const owners = new Map();
const index = read("index.html");
for (const file of files("app/styles").filter(file => file.endsWith(".css"))) {
  assert.ok(index.includes('/app/styles/' + file), file + " must be loaded explicitly");
  const source = read("app/styles/" + file).replace(/\/\*[\s\S]*?\*\//g, "");
  assert.ok(!source.slice(1).includes("\uFEFF"), file + " must not contain a displaced byte-order mark");
  for (const match of source.matchAll(/\.([a-zA-Z][\w-]*)/g)) {
    const set = owners.get(match[1]) || new Set();
    set.add(file.slice(0, -4));
    owners.set(match[1], set);
  }
}
// These views render entities of the same feature, not a second section reusing its styles.
const featureStyles = {
  "admin-battles": ["admin-dashboard"],
  "battle-dome-lead-selection": ["battle-dome"],
  styles: ["style-proposals", "home"],
  dialogs: ["starter"] // Starter confirmation is rendered in the common dialog layer.
};
const violations = [];
for (const file of files("app/view").filter(file => file.endsWith(".js"))) {
  const feature = file.slice(0, -3);
  const allowed = new Set([feature, ...(featureStyles[feature] || []), ...shared]);
  const tokens = new Set(read("app/view/" + file).match(/[a-zA-Z][\w-]*/g) || []);
  for (const token of tokens) {
    // State modifiers alone do not own a component; their scoped selector does.
    if (/^is-/.test(token) || token === "active") continue;
    const definitions = owners.get(token);
    if (definitions && ![...definitions].some(owner => allowed.has(owner))) {
      violations.push(feature + ": " + token + " belongs to " + [...definitions].join(", "));
    }
  }
}
assert.deepEqual(violations, [], "Section views must not depend on another section's private CSS");
console.log("CSS ownership audit passed.");
