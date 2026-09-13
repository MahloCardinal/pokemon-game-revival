import { createHash } from "node:crypto";

export const componentPolicies = Object.freeze({
  encounters: "next_encounter",
  initialization: "next_snapshot",
  battle_core: "next_command",
  move_effects: "next_command",
  consumable_items: "next_command",
  held_items: "next_command",
  capture: "next_throw",
  progression: "next_progression",
  opponents_rewards: "next_activity",
  presentation: "read_only"
});

// Hash definitions, not their transitive imports. Shared code explicitly belongs
// to every component it implements. Every byte has an owner; new modules fall
// back to battle_core rather than silently escaping the manifest.
function owners(path, name, code) {
  if (/^app\/(view|styles|i18n)\//.test(path) || /battle-(events|summary)\.js$/.test(path)) return ["presentation"];
  if (path.endsWith("/capture-zones.js")) return name.startsWith("CATCH_") ? ["capture"] : ["encounters"];
  if (path.endsWith("/capture-calc.js")) return ["capture"];
  if (path.endsWith("/held-items.js")) return ["held_items"];
  if (/\/(data|engine)\/moves\.js$/.test(path) || path.endsWith("/pve_move_manager.js")) return ["move_effects"];
  if (path.endsWith("/items.js")) {
    if (/normalizeItemDefinition\(\{/.test(code)) {
      if (/category: ItemCategory\.Ball/.test(code)) return ["capture"];
      if (/category: ItemCategory\.HeldItem/.test(code)) return ["held_items"];
      if (/category: ItemCategory\.Berry/.test(code)) return ["held_items", "consumable_items"];
      return ["consumable_items"];
    }
    return ["consumable_items", "held_items", "capture"];
  }
  if (path.endsWith("/progression.js")) {
    if (/^(CAPTURE_|SEARCH_|FLUTE_|SHINY_)/.test(name)) return ["encounters"];
    if (/REWARD|TRAINING_DIFFICULTIES|adminControlledBattleReward/.test(name)) return ["opponents_rewards"];
    return ["progression"];
  }
  if (/species(?:_I+)?\.js$/.test(path)) return ["encounters", "initialization", "progression", "capture"];
  if (/level-calc|stat-tables/.test(path)) return ["progression", "initialization"];
  if (/opponent|battle-tower|gyms|trainers|authoritative-npc-items/.test(path)) return ["opponents_rewards"];
  if (/team-composition|team-rule-items/.test(path)) return ["initialization"];
  if (path.endsWith("/battle-runtime.js")) {
    if (name === "initializeBattleRuntime") return ["initialization"];
    if (name === "executeCaptureBattleCommand") return ["capture"];
    if (name === "ordinaryExpAwards") return ["progression"];
    if (/projectBattle|capturePresentationFrames|captureTurnHistory|commandEvents/.test(name)) return ["presentation"];
  }
  // Item actions share the turn scheduler; its changes affect both contracts.
  if (path.endsWith("/battle-manager.js")) return ["battle_core", "consumable_items", "held_items"];
  return ["battle_core"];
}

export function buildRuntimeComponents(files) {
  const pieces = Object.fromEntries(Object.keys(componentPolicies).map(key => [key, []]));
  for (const file of files) {
    const text = file.content.replace(/\r\n?/g, "\n");
    // These source files use column-zero declarations; whole unclassified source
    // and gaps remain in the preamble/previous declaration, never discarded.
    const declarations = [...text.matchAll(/^(?:export )?(?:async )?(?:function|const|var|let) ([A-Za-z_$][\w$]*)/gm)];
    const parts = [{ name: "preamble", start: 0 }, ...declarations.map(m => ({ name: m[1], start: m.index }))];
    for (let i = 0; i < parts.length; i++) {
      const code = text.slice(parts[i].start, parts[i + 1]?.start ?? text.length);
      if (!code) continue;
      for (const owner of owners(file.source, parts[i].name, code)) {
        pieces[owner].push({ source: file.source, declaration: parts[i].name,
          sha256: createHash("sha256").update(code).digest("hex") });
      }
    }
  }
  return Object.fromEntries(Object.entries(pieces).map(([key, sources]) => {
    sources.sort((a, b) => { const left = a.source + ":" + a.declaration, right = b.source + ":" + b.declaration; return left < right ? -1 : left > right ? 1 : 0; });
    return [key, { policy: componentPolicies[key], checksum: createHash("sha256").update(JSON.stringify(sources)).digest("hex"), sources }];
  }));
}
