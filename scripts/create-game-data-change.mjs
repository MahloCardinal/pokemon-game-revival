import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const migrationRoot = resolve(repositoryRoot, "supabase", "migrations");
const supportedFamilies = new Set([
  "zones", "moves", "items", "species", "progression", "shop", "battle-shop",
  "combat-rules", "zone-access", "missions", "opponents", "admin-battles", "trainers"
]);

function fail(message) {
  throw new Error(message + "\n\nUsage: node scripts/create-game-data-change.mjs --slug <slug> --label <label> --families <family,...> [--source <path> ...] [--requires-battle-idle]");
}

function parseArguments(argumentsList) {
  const options = { sources: [], requiresBattleIdle: false };
  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];
    if (argument === "--requires-battle-idle") {
      options.requiresBattleIdle = true;
      continue;
    }
    if (["--slug", "--label", "--families", "--source"].includes(argument)) {
      const value = argumentsList[index + 1];
      if (!value || value.startsWith("--")) fail(`Missing value for ${argument}.`);
      index += 1;
      if (argument === "--source") options.sources.push(value);
      else options[argument.slice(2)] = value;
      continue;
    }
    fail(`Unsupported argument: ${argument}`);
  }
  return options;
}

function sqlLiteral(value) {
  return "'" + String(value).replaceAll("'", "''") + "'";
}

function timestamp(date) {
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
    String(date.getUTCHours()).padStart(2, "0"),
    String(date.getUTCMinutes()).padStart(2, "0"),
    String(date.getUTCSeconds()).padStart(2, "0")
  ].join("");
}

function availableMigrationPath(slug) {
  const baseDate = new Date();
  for (let offset = 0; offset < 120; offset += 1) {
    const candidate = resolve(migrationRoot, `${timestamp(new Date(baseDate.getTime() + offset * 1000))}_${slug}.sql`);
    if (!existsSync(candidate)) return candidate;
  }
  throw new Error("Could not reserve a unique migration timestamp.");
}

const options = parseArguments(process.argv.slice(2));
const slug = String(options.slug || "").trim().toLowerCase();
if (!/^[a-z0-9]+(?:_[a-z0-9]+)*$/.test(slug)) fail("Slug must use lowercase words separated by underscores.");
if (String(options.label || "").trim().length < 3) fail("Label must contain at least three characters.");

const families = String(options.families || "").split(",").map((family) => family.trim()).filter(Boolean);
if (!families.length) fail("At least one catalog family is required.");
if (new Set(families).size !== families.length) fail("Catalog families must be unique.");
families.forEach((family) => {
  if (!supportedFamilies.has(family)) fail(`Unsupported catalog family: ${family}`);
});

const checksums = {};
options.sources.forEach((source) => {
  const sourcePath = resolve(repositoryRoot, source);
  const repositoryPath = relative(repositoryRoot, sourcePath).replaceAll("\\", "/");
  if (repositoryPath.startsWith("../") || repositoryPath === "..") fail(`Source is outside the repository: ${source}`);
  if (!existsSync(sourcePath)) fail(`Source does not exist: ${source}`);
  checksums[repositoryPath] = createHash("sha256").update(readFileSync(sourcePath)).digest("hex");
});

const familySql = "array[" + families.map(sqlLiteral).join(", ") + "]::text[]";
const checksumSql = Object.keys(checksums).length
  ? "jsonb_build_object(\n" + Object.entries(checksums).map(([path, checksum]) => `    ${sqlLiteral(path)}, ${sqlLiteral(checksum)}`).join(",\n") + "\n  )"
  : "'{}'::jsonb";
const migrationPath = availableMigrationPath(slug);
const content = [
  "begin;",
  "",
  "select server_authority_private.begin_game_data_change(",
  `  p_label => ${sqlLiteral(String(options.label).trim())},`,
  `  p_affected_families => ${familySql},`,
  `  p_source_checksums => ${checksumSql},`,
  `  p_requires_battle_idle => ${options.requiresBattleIdle ? "true" : "false"}`,
  ");",
  "",
  "-- Replace this comment with the smallest INSERT, UPDATE or DELETE needed.",
  "-- Always scope catalog rows through the revival-baseline release id.",
  "",
  "select server_authority_private.finish_game_data_change();",
  "",
  "commit;",
  ""
].join("\n");

writeFileSync(migrationPath, content, { encoding: "utf8", flag: "wx" });
console.log(relative(repositoryRoot, migrationPath).replaceAll("\\", "/"));
