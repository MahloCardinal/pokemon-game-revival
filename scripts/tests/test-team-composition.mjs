import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const moduleCache = new Map();
function sourceModule(path) {
  const absolutePath = resolve(path);
  if (moduleCache.has(absolutePath)) return moduleCache.get(absolutePath);
  const module = new vm.SourceTextModule(readFileSync(absolutePath, "utf8"), { identifier: absolutePath });
  moduleCache.set(absolutePath, module);
  return module;
}

const teamCompositionModule = sourceModule(fileURLToPath(new URL("../../app/data/team-composition.js", import.meta.url)));
await teamCompositionModule.link((specifier, referencingModule) => {
  assert.ok(specifier.startsWith("."), "Only relative game-data imports are allowed");
  return sourceModule(resolve(dirname(referencingModule.identifier), specifier));
});
await teamCompositionModule.evaluate();
const {
  OHKO_MOVE_INDEXES,
  TEAM_OHKO_POKEMON_LIMIT,
  TEAM_PORT_ITEM_LIMIT,
  findTeamCompositionViolation
} = teamCompositionModule.namespace;

function pokemon(speciesKey, heldItemIndex = 0, moves = [1]) {
  return {
    speciesKey: String(speciesKey),
    heldItemIndex,
    moves: moves.map((index) => ({ index }))
  };
}

assert.deepEqual(OHKO_MOVE_INDEXES, [2, 132, 211, 234]);
assert.equal(TEAM_OHKO_POKEMON_LIMIT, 2);
assert.equal(TEAM_PORT_ITEM_LIMIT, 2);
assert.equal(findTeamCompositionViolation([
  pokemon(1), pokemon(1), pokemon(1)
]).key, "team_species_limit");
assert.equal(findTeamCompositionViolation([
  pokemon(1, 220), pokemon(2, 220), pokemon(3, 220)
]).key, "team_held_item_limit");
assert.equal(findTeamCompositionViolation([
  pokemon(1, 229), pokemon(2, 234), pokemon(3, 237)
]).key, "port_held_item_limit");
assert.equal(findTeamCompositionViolation([
  pokemon(1, 229), pokemon(2, 229)
]).key, "port_held_item_duplicate");
assert.equal(findTeamCompositionViolation([
  pokemon(1, 0, [2, 132]), pokemon(2, 0, [211]), pokemon(3, 0, [234])
]).key, "ohko_move_pokemon_limit", "A Pokemon with several OHKO moves must count once");
assert.equal(findTeamCompositionViolation([
  pokemon(1, 229, [2]), pokemon(2, 234, [132])
]), null);

console.log("Team composition checks passed.");
