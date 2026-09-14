import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import vm from "node:vm";

const ROOT = resolve(import.meta.dirname, "../..");
const moduleCache = new Map();

function sourceModule(path) {
  const absolutePath = resolve(path);
  if (moduleCache.has(absolutePath)) return moduleCache.get(absolutePath);
  const module = new vm.SourceTextModule(readFileSync(absolutePath, "utf8"), { identifier: absolutePath });
  moduleCache.set(absolutePath, module);
  return module;
}

async function loadModule(path) {
  const module = sourceModule(resolve(ROOT, path));
  if (module.status === "unlinked") {
    await module.link((specifier, referencingModule) => {
      assert.ok(specifier.startsWith("."), `Unexpected import ${specifier}`);
      return sourceModule(resolve(dirname(referencingModule.identifier), specifier));
    });
  }
  if (module.status !== "evaluated") await module.evaluate();
  return module.namespace;
}

if (!vm.SourceTextModule) {
  throw new Error("Run this audit with --experimental-vm-modules");
}

const moves = (await loadModule("app/data/moves.js")).MOVE_LIBRARY;
const itemModule = await loadModule("app/data/items.js");
const items = itemModule.ITEM_LIBRARY;
const species = (await loadModule("app/data/index.js")).SPECIES_LIBRARY;
const italianCatalog = (await loadModule("app/i18n/it.js")).IT_TRANSLATIONS;
const englishCatalog = (await loadModule("app/i18n/en.js")).EN_TRANSLATIONS;
const italian = italianCatalog.entities;
const english = englishCatalog.entities;

function assertNames(entries, catalogKey, keyForEntry) {
  entries.forEach((entry) => {
    const key = String(keyForEntry(entry));
    assert.equal(typeof italian[catalogKey]?.[key]?.name, "string", `Missing Italian ${catalogKey}.${key}.name`);
    assert.equal(typeof english[catalogKey]?.[key]?.name, "string", `Missing English ${catalogKey}.${key}.name`);
  });
}

assertNames(moves, "moves", (move) => move.key);
assertNames(items.filter((item) => item.category !== itemModule.ItemCategory.TM), "items", (item) => item.key);
assertNames(Object.keys(species), "species", (key) => key);
items.filter((item) => item.category === itemModule.ItemCategory.TM).forEach((item) => {
  assert.ok(Number.isFinite(item.number), `Missing canonical TM number for ${item.key}`);
  assert.ok(item.move?.key && moves.some((move) => move.key === item.move.key), `Missing canonical move for ${item.key}`);
});
assert.equal(typeof italianCatalog.entityDescriptions?.items?.tmName, "string", "Missing Italian TM name template");
assert.equal(typeof englishCatalog.entityDescriptions?.items?.tmName, "string", "Missing English TM name template");
moves.forEach((move) => {
  assert.equal(typeof italianCatalog.entityDescriptions?.moves?.[move.key]?.description, "string", `Missing Italian move description for ${move.key}`);
  assert.equal(typeof englishCatalog.entityDescriptions?.moves?.[move.key]?.description, "string", `Missing English move description for ${move.key}`);
});

console.log("All canonical moves, items, and species have localized names and move descriptions.");
