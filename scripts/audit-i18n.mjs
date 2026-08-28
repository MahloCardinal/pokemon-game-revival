import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const I18N_ROOT = resolve(ROOT, "app/i18n");
const moduleCache = new Map();
const context = vm.createContext({});

function moduleFor(filename) {
  const normalized = resolve(filename);
  if (normalized !== I18N_ROOT && !normalized.startsWith(I18N_ROOT + sep)) {
    throw new Error("i18n audit rejected module outside app/i18n: " + normalized);
  }
  if (moduleCache.has(normalized)) return moduleCache.get(normalized);
  const module = new vm.SourceTextModule(readFileSync(normalized, "utf8"), {
    context,
    identifier: normalized
  });
  moduleCache.set(normalized, module);
  return module;
}

async function loadCatalog(path, exportName) {
  const module = moduleFor(resolve(ROOT, path));
  if (module.status === "unlinked") {
    await module.link((specifier, referencingModule) => {
      assert.ok(specifier.startsWith("."), "Only relative i18n imports are allowed");
      return moduleFor(resolve(dirname(referencingModule.identifier), specifier));
    });
  }
  if (module.status !== "evaluated") await module.evaluate();
  return module.namespace[exportName];
}

function valueKind(value) {
  if (Array.isArray(value)) return "array";
  if (value && typeof value === "object") return "object";
  return typeof value;
}

function placeholders(value) {
  const text = Array.isArray(value) ? value.join("\n") : String(value || "");
  return [...new Set(Array.from(text.matchAll(/\{([a-zA-Z0-9_]+)\}/g), (match) => match[1]))].sort();
}

function compareCatalogs(reference, candidate, path) {
  const referenceKind = valueKind(reference);
  const candidateKind = valueKind(candidate);
  assert.equal(candidateKind, referenceKind, `i18n type mismatch at ${path || "<root>"}`);

  if (referenceKind === "string") {
    assert.ok(candidate.length > 0, `Empty translation at ${path}`);
    assert.deepEqual(placeholders(candidate), placeholders(reference), `Placeholder mismatch at ${path}`);
    return;
  }

  if (referenceKind === "array") {
    assert.ok(reference.every((entry) => typeof entry === "string"), `Non-string reference list at ${path}`);
    assert.ok(candidate.every((entry) => typeof entry === "string" && entry.length > 0), `Invalid translation list at ${path}`);
    assert.deepEqual(placeholders(candidate), placeholders(reference), `Placeholder mismatch at ${path}`);
    return;
  }

  assert.equal(referenceKind, "object", `Unsupported i18n value at ${path}`);
  const referenceKeys = Object.keys(reference).sort();
  const candidateKeys = Object.keys(candidate).sort();
  assert.deepEqual(candidateKeys, referenceKeys, `i18n key mismatch at ${path || "<root>"}`);
  referenceKeys.forEach((key) => {
    compareCatalogs(reference[key], candidate[key], path ? path + "." + key : key);
  });
}

if (!vm.SourceTextModule) {
  throw new Error("Run the i18n audit with --experimental-vm-modules");
}

const italian = await loadCatalog("app/i18n/it.js", "IT_TRANSLATIONS");
const english = await loadCatalog("app/i18n/en.js", "EN_TRANSLATIONS");
compareCatalogs(italian, english, "");

function valueAtPath(object, path) {
  return path.split(".").reduce((value, key) => value && value[key], object);
}

function javascriptFilesBelow(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filename = resolve(directory, entry.name);
    return entry.isDirectory()
      ? javascriptFilesBelow(filename)
      : entry.isFile() && entry.name.endsWith(".js") ? [filename] : [];
  });
}

const uiSources = javascriptFilesBelow(resolve(ROOT, "app/client"))
  .concat(javascriptFilesBelow(resolve(ROOT, "app/view")));
for (const filename of uiSources) {
  const source = readFileSync(filename, "utf8");
  const literalPatterns = [
    { pattern: /\bt\(\s*["']([^"']+)["']/g, prefix: "" },
    { pattern: /\btextDescriptor\(\s*["']([^"']+)["']/g, prefix: "" },
    { pattern: /\bmessageDescriptor\(\s*["']([^"']+)["']/g, prefix: "messages." }
  ];
  for (const check of literalPatterns) {
    for (const match of source.matchAll(check.pattern)) {
      const remainder = source.slice(match.index + match[0].length);
      if (/^\s*\+/.test(remainder)) continue;
      const key = check.prefix + match[1];
      assert.notEqual(valueAtPath(italian, key), undefined, `Missing literal i18n key ${key} in ${filename}`);
    }
  }
}

const eventSources = [
  "app/engine/battle-manager.js", "app/engine/battle-runtime.js", "app/engine/held-items.js",
  "app/engine/team.js", "app/client/level-up.js", "app/client/battle-handler.js"
].map((path) => readFileSync(resolve(ROOT, path), "utf8")).join("\n");
const eventKeyPattern = /["']((?:turn|action|outcome|switch|item|capture|status|weather|team|hazard|future|heldItem|progression)\.[A-Za-z0-9_]+)["']/g;
const eventCalls = Array.from(eventSources.matchAll(/(?:Engine\.)?battleEvent\(([\s\S]{0,300}?)\)/g), (match) => match[1]).join("\n")
  + "\n" + Array.from(eventSources.matchAll(/\.log\.push\(\s*\{\s*key:\s*(["'][^"']+["'])/g), (match) => match[1]).join("\n");
for (const match of eventCalls.matchAll(eventKeyPattern)) {
  assert.equal(typeof valueAtPath(italian.battleText.events, match[1]), "string", `Missing battle event translation for ${match[1]}`);
}

const moveSource = readFileSync(resolve(ROOT, "app/data/moves.js"), "utf8");
const missingMoveEvents = new Set();
for (const match of moveSource.matchAll(/logKey\s*[:=]\s*["']([^"']+)["']/g)) {
  if (typeof italian.battleText.events.move[match[1]] !== "string") missingMoveEvents.add(match[1]);
}
assert.deepEqual([...missingMoveEvents].sort(), [], `Missing move event translations: ${[...missingMoveEvents].sort().join(", ")}`);

console.log("Italian and English i18n catalogs have matching complete schemas.");
