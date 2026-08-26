import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const FAMILIES = [
  "metadata", "zones", "moves", "items", "species", "progression", "shop", "battle-shop",
  "combat-rules", "zone-access", "missions", "titles", "opponents", "admin-battles", "trainers"
];

function argument(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1];
}

function usage(message) {
  if (message) console.error(message);
  console.error("Usage: node scripts/generate-all-catalog-seeds.mjs --release <version> [--checksum <draft-label>] [--species-chunks <count>] [--check]");
  console.error("SQL is written only to stdout; redirect it to a caller-selected file when needed.");
  process.exit(1);
}

const release = argument("--release");
const checksum = argument("--checksum") || "draft:pending";
const speciesChunks = Number(argument("--species-chunks") || 1);
const checkOnly = process.argv.includes("--check");
if (!release) usage("Release is required.");
if (!Number.isInteger(speciesChunks) || speciesChunks < 1) usage("Species chunk count must be a positive integer.");

const generator = fileURLToPath(new URL("./generate-catalog-seed.mjs", import.meta.url));
const spawnOptions = { encoding: "utf8", windowsHide: true, maxBuffer: 128 * 1024 * 1024 };
for (const family of FAMILIES) {
  const chunkCount = family === "species" ? speciesChunks : 1;
  for (let chunk = 1; chunk <= chunkCount; chunk += 1) {
    const args = ["--experimental-vm-modules", generator, "--release", release, "--family", family];
    if (family === "metadata") args.push("--checksum", checksum);
    if (chunkCount > 1) args.push("--chunk", chunk + "/" + chunkCount);
    const result = spawnSync(process.execPath, args, spawnOptions);
    if (result.status !== 0) {
      process.stderr.write(result.stderr || "Catalog generator failed for " + family + "\n");
      process.exit(result.status || 1);
    }
    if (checkOnly) {
      const repeated = spawnSync(process.execPath, args, spawnOptions);
      if (repeated.status !== 0 || repeated.stdout !== result.stdout) {
        process.stderr.write(repeated.stderr || "Nondeterministic catalog output for " + family + "\n");
        process.exit(repeated.status || 1);
      }
      continue;
    }
    process.stdout.write("-- catalog family: " + family + (chunkCount > 1 ? " " + chunk + "/" + chunkCount : "") + "\n");
    process.stdout.write(result.stdout);
  }
}
if (checkOnly) console.log("All catalog families generated deterministically.");
