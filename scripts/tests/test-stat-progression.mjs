import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import * as stats from "../../app/data/stat-tables.js";

const source = readFileSync(new URL("../../app/client/level-up.js", import.meta.url), "utf8");
const start = source.indexOf("export function giveLevelsToPokemon(");
const end = source.indexOf("\n}", start) + 2;
const context = vm.createContext({ MAX_LEVEL: 100, HP_GAIN_PER_LEVEL: 3, MOVE_GAIN_PER_LEVEL: 2,
  clampToLimits: stats.clampToLimits });
vm.runInContext(source.slice(start, end).replace("export ", ""), context);
const grow = context.giveLevelsToPokemon;

for (const table of [stats.HP_BY_LEVEL, stats.PW_BY_LEVEL, stats.STATS_BY_LEVEL, stats.HP_CAPS, stats.POWER_CAPS,
  stats.STATS_CAPS, stats.SHINY_HP_BONUS_BY_LEVEL, stats.SHINY_POWER_BONUS_BY_LEVEL, stats.SHINY_STATS_BONUS_BY_LEVEL,
  stats.EVOLUTION_HP_BONUS_BY_LEVEL, stats.EVOLUTION_POWER_BONUS_BY_LEVEL, stats.EVOLUTION_STATS_BONUS_BY_LEVEL]) {
  for (let level = 5; level <= 60; level++) assert.ok(Number.isInteger(table[level]), `Missing level ${level}`);
}
const shiny = { level: 30, isShiny: true, maxHp: 109, moves: [{ power: 59, stats: 19 }] };
assert.equal(stats.maxHpForPokemon(shiny), 118);
grow(shiny, 30);
assert.equal(shiny.maxHp, 199, "Growing Shiny caps do not grant extra HP each level");
assert.equal(stats.maxHpForPokemon(shiny), 300);
shiny.level = 70;
assert.deepEqual([stats.maxHpForPokemon(shiny), stats.maxPowerForPokemon(shiny), stats.maxStatsForPokemon(shiny)], [330, 275, 125]);

const sequential = { level: 5, maxHp: 28, moves: [{ power: 6, stats: 2 }] };
grow(sequential, 7);
assert.equal(sequential.maxHp, 43, "Every intermediate cap applies to grouped growth");
const excess = { level: 30, maxHp: 999, moves: [{ power: 999, stats: 999 }] };
grow(excess, 0);
assert.equal(excess.maxHp, 999, "No normalization without level-up");
grow(excess, 1);
assert.deepEqual(excess, { level: 31, maxHp: 114, moves: [{ power: 73, stats: 22 }] });

for (const isShiny of [false, true]) for (const rarityKey of ["common", "legendary"]) {
  const pokemon = { level: 30, isShiny, rarityKey, maxHp: 50,
    moves: [{ power: 10, stats: 5 }, { power: 12, stats: 6 }, { power: 14, stats: 7 }, { power: 16, stats: 8 }] };
  const caps = [stats.maxHpForPokemon(pokemon), stats.maxPowerForPokemon(pokemon), stats.maxStatsForPokemon(pokemon)];
  stats.applyEvolutionStatBonus(pokemon);
  stats.applyEvolutionStatBonus(pokemon);
  assert.equal(pokemon.maxHp, 58, "Two actual evolutions give two bonuses");
  assert.deepEqual(pokemon.moves.map(m => [m.power, m.stats]), [[18,9],[20,10],[22,11],[24,12]]);
  assert.deepEqual([stats.maxHpForPokemon(pokemon), stats.maxPowerForPokemon(pokemon), stats.maxStatsForPokemon(pokemon)], caps);
  pokemon.maxHp = caps[0] - 1;
  pokemon.moves.forEach(m => { m.power = caps[1]; m.stats = caps[2] - 1; });
  stats.applyEvolutionStatBonus(pokemon);
  assert.equal(pokemon.maxHp, caps[0]);
  assert.ok(pokemon.moves.every(m => m.power === caps[1] && m.stats === caps[2]));
  const capped = JSON.stringify(pokemon);
  stats.applyEvolutionStatBonus(pokemon);
  assert.equal(JSON.stringify(pokemon), capped, "Evolution at cap grants nothing");
}
assert.deepEqual([stats.evolutionHpBonusForLevel(100), stats.evolutionPowerBonusForLevel(100), stats.evolutionStatsBonusForLevel(100)], [8,15,8]);
console.log("Stat progression: explicit levels, Shiny caps, grouped growth, existing excess and evolution bonuses passed.");
