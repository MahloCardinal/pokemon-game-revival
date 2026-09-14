import { spawnSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const suite = process.argv[2] || "local";
const filter = process.argv[3];
const suites = {
  local: ["test-game-contracts.mjs", "audit-i18n.mjs", "audit-localized-entities.mjs", "test-schema-contracts.mjs"],
  runtime: ["test-runtime-components.mjs", "test-runtime-projection.mjs", "test-runtime-portability.mjs"],
  i18n: ["audit-i18n.mjs", "audit-localized-entities.mjs"],
  database: readdirSync(join(root, "scripts/tests")).filter(name => name.endsWith(".sql")).sort()
};
if (suite === "--list") {
  for (const [name, tests] of Object.entries(suites)) console.log(`${name}: ${tests.join(", ")}`);
  process.exit(0);
}
if (!suites[suite] || process.argv.length > 4) throw new Error("Usage: node scripts/check.mjs [local|runtime|i18n|database] [name-filter]");
const tests = suites[suite].filter(name => !filter || name.includes(filter));
if (!tests.length) throw new Error(`No checks match ${filter}`);
function run(program, args) {
  const result = spawnSync(program, args, { cwd: root, stdio: "inherit", windowsHide: true });
  if (result.error || result.status !== 0) throw new Error(`Check failed: ${args.join(" ")}`);
}
for (const test of tests) {
  console.log(`\nChecking ${test}`);
  const path = join(root, "scripts/tests", test);
  if (suite === "database") {
    if (readFileSync(join(root, "supabase/.temp/project-ref"), "utf8").trim() !== "etotvaneppzkxunezqrl") {
      throw new Error("Wrong linked Supabase project");
    }
    run("supabase", ["db", "query", "--linked", "--file", path]);
  } else run(process.execPath, ["--experimental-vm-modules", path]);
}
if (suite === "local" || suite === "runtime") run(process.execPath, [join(root, "scripts/sync-game-runtime.mjs"), "--check"]);
console.log(`\n${suite}: all selected checks passed.`);
