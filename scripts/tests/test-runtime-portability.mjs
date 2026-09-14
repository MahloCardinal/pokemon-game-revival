import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const temporaryRoot = resolve(tmpdir());
const fixture = mkdtempSync(join(temporaryRoot, "revival-runtime-portability-"));
const mirror = join(fixture, "supabase/functions/_shared/game-runtime");
const sources = {
  "engine/battle-runtime.js": 'import { value } from "../data/value.js";\nexport const runtime = value;\n',
  "data/value.js": '// Portable Unicode: Pokémon\nexport const value = 42;\n'
};
function run(...args) {
  return spawnSync(process.execPath, [join(fixture, "scripts/sync-game-runtime.mjs"), ...args], { encoding: "utf8" });
}
function success(result) { assert.equal(result.status, 0, result.stderr); }
try {
  mkdirSync(join(fixture, "scripts"));
  writeFileSync(join(fixture, "scripts/sync-game-runtime.mjs"), readFileSync(join(root, "scripts/sync-game-runtime.mjs")));
  writeFileSync(join(fixture, "scripts/runtime-components.mjs"), readFileSync(join(root, "scripts/runtime-components.mjs")));
  let expectedManifest;
  for (const endings of ["lf", "crlf", "cr", "mixed"]) {
    for (const [path, content] of Object.entries(sources)) {
      const destination = join(fixture, "app", path);
      mkdirSync(dirname(destination), { recursive: true });
      writeFileSync(destination, endings === "crlf" ? content.replaceAll("\n", "\r\n")
        : endings === "cr" ? content.replaceAll("\n", "\r")
        : endings === "mixed" ? content.replace("\n", "\r\n") : content);
    }
    success(run());
    const manifest = readFileSync(join(mirror, "manifest.json"), "utf8");
    expectedManifest ??= manifest;
    assert.equal(manifest, expectedManifest, `${endings} changed runtime identity`);
    for (const file of JSON.parse(manifest).files) {
      const content = readFileSync(join(mirror, file.source));
      assert.equal(content.includes(13), false, "Generated sources must use LF");
      assert.equal(content.byteLength, file.bytes);
      assert.equal(createHash("sha256").update(content).digest("hex"), file.sha256);
      // Existing CRLF checkouts remain valid, including generated metadata.
      writeFileSync(join(mirror, file.source), content.toString().replaceAll("\n", "\r\n"));
    }
    writeFileSync(join(mirror, "manifest.json"), manifest.replaceAll("\n", "\r\n"));
    success(run("--check"));
  }
  writeFileSync(join(mirror, "app/data/value.js"), "export const value = 99;\n");
  assert.notEqual(run("--check").status, 0, "Real mirror drift must be rejected");
  success(run());
  writeFileSync(join(fixture, "app/data/value.js"), "export const value = 100;\n");
  assert.notEqual(run("--check").status, 0, "Real source drift must be rejected");
  success(run());
  writeFileSync(join(mirror, "unexpected.js"), "");
  assert.notEqual(run("--check").status, 0, "Unexpected generated files must be rejected");
} finally {
  const child = relative(temporaryRoot, resolve(fixture));
  assert.ok(child && !child.startsWith(`..${sep}`) && child !== "..");
  rmSync(fixture, { recursive: true, force: true });
}
console.log("Runtime portability: LF, CRLF, mixed endings, hashes and drift checks passed.");
