import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { buildRuntimeComponents } from "./runtime-components.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = resolve(repositoryRoot, "app");
const outputRoot = resolve(repositoryRoot, "supabase/functions/_shared/game-runtime");
const entries = [resolve(sourceRoot, "engine/battle-runtime.js")];
const importPattern = /(?:import|export)\s+(?:[^"']*?\s+from\s+)?["']([^"']+)["']/g;
const dynamicImportPattern = /import\s*\(\s*["']([^"']+)["']\s*\)/g;
const sources = new Map();
const checkOnly = process.argv.slice(2).includes("--check");
if (process.argv.slice(2).some((argument) => argument !== "--check")) {
  throw new Error("Usage: node scripts/sync-game-runtime.mjs [--check]");
}

function inside(root, path) {
  const pathFromRoot = relative(root, path);
  return pathFromRoot === "" || (!pathFromRoot.startsWith(".." + sep) && pathFromRoot !== "..");
}

// Git checkout settings must not change the runtime's identity.
function normalizeText(content) {
  return content.replace(/\r\n?/g, "\n");
}

function visit(path) {
  const normalized = resolve(path);
  if (sources.has(normalized)) return;
  if (!inside(sourceRoot, normalized)) throw new Error(`Import outside app/: ${normalized}`);
  if (!normalized.endsWith(".js") || !existsSync(normalized) || !statSync(normalized).isFile()) {
    throw new Error(`Missing or unsupported runtime import: ${normalized}`);
  }
  const content = normalizeText(readFileSync(normalized, "utf8"));
  sources.set(normalized, content);
  for (const match of [...content.matchAll(importPattern), ...content.matchAll(dynamicImportPattern)]) {
    const specifier = match[1];
    if (!specifier.startsWith(".")) throw new Error(`Non-relative runtime import in ${relative(repositoryRoot, normalized)}: ${specifier}`);
    visit(resolve(dirname(normalized), specifier));
  }
}

entries.forEach(visit);

const files = [...sources.entries()].map(([sourcePath, content]) => {
  const source = relative(repositoryRoot, sourcePath).replaceAll("\\", "/");
  const sha256 = createHash("sha256").update(content).digest("hex");
  return { source, sha256, bytes: Buffer.byteLength(content), content };
}).sort((left, right) => left.source < right.source ? -1 : left.source > right.source ? 1 : 0);

const bundleChecksum = createHash("sha256")
  .update(files.map((file) => `${file.source}\0${file.sha256}\n`).join(""))
  .digest("hex");
const componentFiles = files.slice();
function collectPresentation(path) {
  if (!existsSync(path)) return;
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    const child = resolve(path, entry.name);
    if (entry.isDirectory()) collectPresentation(child);
    else if (/\.(js|css)$/.test(child)) componentFiles.push({
      source: relative(repositoryRoot, child).replaceAll("\\", "/"),
      content: normalizeText(readFileSync(child, "utf8"))
    });
  }
}
for (const directory of ["view", "styles", "i18n"]) collectPresentation(resolve(sourceRoot, directory));
const components = buildRuntimeComponents(componentFiles);
const snapshotVersion = Number(sources.get(entries[0]).match(/BATTLE_SNAPSHOT_VERSION\s*=\s*(\d+)/)?.[1] || 0);
const manifest = {
  generated: true,
  generator: "scripts/sync-game-runtime.mjs",
  entrypoints: entries.map((entry) => relative(repositoryRoot, entry).replaceAll("\\", "/")),
  checksumAlgorithm: "sha256",
  sourceNormalization: "lf",
  bundleChecksum,
  snapshotVersion,
  components,
  files: files.map(({ source, sha256, bytes }) => ({ source, sha256, bytes }))
};
const manifestContent = JSON.stringify(manifest, null, 2) + "\n";
const noticeContent = [
  "# Generated Game Runtime",
  "",
  "Do not edit this directory manually. Canonical gameplay source is under `app/`.",
  "Regenerate with `node scripts/sync-game-runtime.mjs`.",
  "Sources, byte counts and hashes use LF line endings on every platform.",
  `Bundle SHA-256: \`${bundleChecksum}\``,
  ""
].join("\n");

if (checkOnly) {
  const expected = new Map(files.map((file) => [file.source, file.content]));
  expected.set("manifest.json", manifestContent);
  expected.set("GENERATED.md", noticeContent);
  const actualFiles = [];
  function collect(path) {
    if (!existsSync(path)) return;
    for (const entry of readdirSync(path, { withFileTypes: true })) {
      const entryPath = resolve(path, entry.name);
      if (entry.isDirectory()) collect(entryPath);
      else actualFiles.push(relative(outputRoot, entryPath).replaceAll("\\", "/"));
    }
  }
  collect(outputRoot);
  const stale = actualFiles.some((path) => !expected.has(path)) || [...expected].some(([path, content]) => {
    const destination = resolve(outputRoot, path);
    return !existsSync(destination) || normalizeText(readFileSync(destination, "utf8")) !== content;
  });
  if (stale) throw new Error("Generated game runtime is stale. Run node scripts/sync-game-runtime.mjs.");
  console.log(`Game runtime mirror is current (${bundleChecksum}).`);
} else {
  rmSync(outputRoot, { recursive: true, force: true });
  mkdirSync(outputRoot, { recursive: true });
  files.forEach((file) => {
    const destination = resolve(outputRoot, file.source);
    mkdirSync(dirname(destination), { recursive: true });
    writeFileSync(destination, file.content, "utf8");
  });
  writeFileSync(resolve(outputRoot, "manifest.json"), manifestContent, "utf8");
  writeFileSync(resolve(outputRoot, "GENERATED.md"), noticeContent, "utf8");
  console.log(`Synced ${files.length} modules (${bundleChecksum}).`);
}
