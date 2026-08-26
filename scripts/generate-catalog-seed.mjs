import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const DATA_ROOT = resolve(ROOT, "app/data");
const ENGINE_ROOT = resolve(ROOT, "app/engine");
const SUPPORTED_FAMILIES = new Set([
  "metadata", "zones", "moves", "items", "species", "progression", "shop", "battle-shop",
  "combat-rules", "zone-access", "missions", "titles", "opponents", "admin-battles", "trainers"
]);
const moduleCache = new Map();
const context = vm.createContext({});

function usage(message) {
  if (message) console.error(message);
  console.error("Usage: node --experimental-vm-modules scripts/generate-catalog-seed.mjs --release <version> --family <family> [--checksum <draft-label>] [--chunk <index>/<total>]");
  console.error("Families: metadata, zones, moves, items, species, progression, shop, battle-shop, combat-rules, zone-access, missions, titles, opponents, admin-battles, trainers");
  console.error("--chunk is 1-based and supported for species, the only currently large family.");
  process.exit(1);
}

function argument(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1];
}

function parseChunk(value) {
  const match = value && /^(\d+)\/(\d+)$/.exec(value);
  if (!value) return null;
  if (!match) usage("Chunk must use the 1-based <index>/<total> format.");
  const index = Number(match[1]);
  const total = Number(match[2]);
  if (index < 1 || total < 2 || index > total) usage("Chunk index must be between 1 and total, and total must be at least 2.");
  return { index, total };
}

function sourcePath(filename) {
  return relative(ROOT, filename).split(sep).join("/");
}

function sqlLiteral(value) {
  if (value === null || value === undefined) return "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("Catalog value must be finite");
    return String(value);
  }
  return "'" + String(value).replace(/'/g, "''") + "'";
}

function jsonLiteral(value) {
  if (value === null || value === undefined) return "null";
  return sqlLiteral(JSON.stringify(value)) + "::jsonb";
}

function integerArrayLiteral(values) {
  if (!Array.isArray(values) || values.some((value) => !Number.isInteger(value))) {
    throw new Error("Catalog integer array contains an invalid value");
  }
  return "array[" + values.join(", ") + "]::integer[]";
}

function checksum(path) {
  return createHash("sha256").update(readFileSync(resolve(ROOT, path))).digest("hex");
}

function sourceSetChecksum(sources) {
  const manifest = sources.map((path) => path + ":" + checksum(path)).join("\n");
  return createHash("sha256").update(manifest).digest("hex");
}

function releaseId(release) {
  return "(select id from public.catalog_release where version = " + sqlLiteral(release) + ")";
}

function familyGuard(release, family, sources, chunk) {
  const checks = sources.map((path) =>
    "if exists (select 1 from public.catalog_import_batch where catalog_release_id = v_release_id and family_key = "
      + sqlLiteral(family) + " and source_path = " + sqlLiteral(path) + " and source_checksum <> " + sqlLiteral(checksum(path))
      + ") then raise exception 'catalog source changed for family %: %', " + sqlLiteral(family) + ", " + sqlLiteral(path) + "; end if;"
  ).join(" ");
  const sourceList = "array[" + sources.map(sqlLiteral).join(", ") + "]::text[]";
  const chunkCheck = chunk
    ? "if exists (select 1 from public.catalog_import_chunk where catalog_release_id = v_release_id and family_key = " + sqlLiteral(family) + " and (chunk_total <> " + chunk.total + " or source_set_checksum <> " + sqlLiteral(sourceSetChecksum(sources)) + ")) then raise exception 'catalog chunk plan changed for family %', " + sqlLiteral(family) + "; end if; "
    : "if exists (select 1 from public.catalog_import_chunk where catalog_release_id = v_release_id and family_key = " + sqlLiteral(family) + ") then raise exception 'catalog family already has a chunked import: %', " + sqlLiteral(family) + "; end if; ";
  return "do $$ declare v_release_id uuid; v_status text; begin "
    + "select id, status into v_release_id, v_status from public.catalog_release where version = " + sqlLiteral(release) + " for update; "
    + "if v_release_id is null then raise exception 'catalog release not found: %', " + sqlLiteral(release) + "; end if; "
    + "if v_status <> 'draft' then raise exception 'catalog release is not mutable: %', " + sqlLiteral(release) + "; end if; "
    + "if exists (select 1 from public.catalog_import_batch where catalog_release_id = v_release_id and family_key = " + sqlLiteral(family) + " and not (source_path = any(" + sourceList + "))) then raise exception 'catalog family source set changed: %', " + sqlLiteral(family) + "; end if; "
    + chunkCheck + checks + " end $$;";
}

function sourceBatch(release, family, path, manifest, condition) {
  const rowCount = manifest ? manifest.primaryRows : null;
  const entityCounts = manifest ? manifest.entityCounts : null;
  return "insert into public.catalog_import_batch (catalog_release_id, family_key, source_path, source_checksum, row_count, entity_counts) select "
    + releaseId(release) + ", " + sqlLiteral(family) + ", " + sqlLiteral(path) + ", " + sqlLiteral(checksum(path)) + ", " + sqlLiteral(rowCount) + ", " + jsonLiteral(entityCounts) + " "
    + (condition ? "where " + condition + " " : "")
    + "on conflict (catalog_release_id, family_key, source_path) do update set imported_at = now(), row_count = excluded.row_count, entity_counts = excluded.entity_counts;";
}

function chunkStatement(release, family, chunk, sources) {
  return "insert into public.catalog_import_chunk (catalog_release_id, family_key, chunk_index, chunk_total, source_set_checksum) values ("
    + releaseId(release) + ", " + sqlLiteral(family) + ", " + chunk.index + ", " + chunk.total + ", " + sqlLiteral(sourceSetChecksum(sources)) + ") "
    + "on conflict (catalog_release_id, family_key, chunk_index) do update set loaded_at = now();";
}

function chunksCompleteCondition(release, family, chunk, sources) {
  return "(select count(*) = " + chunk.total + " from public.catalog_import_chunk where catalog_release_id = " + releaseId(release)
    + " and family_key = " + sqlLiteral(family) + " and chunk_total = " + chunk.total
    + " and source_set_checksum = " + sqlLiteral(sourceSetChecksum(sources)) + ")";
}

function assertDataPath(filename) {
  const normalized = resolve(filename);
  const allowed = [DATA_ROOT, ENGINE_ROOT].some((root) => normalized === root || normalized.startsWith(root + sep));
  if (!allowed) {
    throw new Error("Catalog loader rejected module outside app/data and app/engine: " + filename);
  }
  return normalized;
}

function moduleFor(filename) {
  const normalized = assertDataPath(filename);
  if (moduleCache.has(normalized)) return moduleCache.get(normalized);
  const module = new vm.SourceTextModule(readFileSync(normalized, "utf8"), {
    context,
    identifier: normalized,
    initializeImportMeta(meta) {
      meta.url = "file://" + normalized.replace(/\\/g, "/");
    }
  });
  moduleCache.set(normalized, module);
  return module;
}

async function loadSourceModule(path) {
  if (!vm.SourceTextModule) throw new Error("Run this generator with --experimental-vm-modules");
  const module = moduleFor(resolve(ROOT, path));
  if (module.status === "unlinked") {
    await module.link((specifier, referencingModule) => {
      if (!specifier.startsWith(".")) {
        throw new Error("Catalog loader rejected non-relative import " + specifier + " from " + sourcePath(referencingModule.identifier));
      }
      return moduleFor(resolve(dirname(referencingModule.identifier), specifier));
    });
  }
  if (module.status !== "evaluated") await module.evaluate();
  return module.namespace;
}

function loadedSources() {
  return [...moduleCache.keys()].map(sourcePath).sort();
}

function exportKeyByIdentity(namespace, values, label) {
  const keys = new Map();
  Object.keys(namespace).sort().forEach((key) => {
    const value = namespace[key];
    if (values.indexOf(value) !== -1) {
      if (keys.has(value)) throw new Error("Duplicate " + label + " exports for " + key);
      keys.set(value, key);
    }
  });
  values.forEach((value) => {
    if (!keys.has(value)) throw new Error("Missing stable export key for " + label + " index " + value.index);
  });
  return keys;
}

function moveExportKeys(namespace) {
  const byIndex = new Map();
  namespace.MOVE_LIBRARY.forEach((move) => {
    if (!move.key) throw new Error("Missing stable move key for index " + move.index);
    if (byIndex.has(move.index)) throw new Error("Duplicate move key for index " + move.index);
    byIndex.set(move.index, move.key);
  });
  return byIndex;
}

function moveReferenceSet(namespace) {
  return new Set(Object.values(namespace).filter((value) => value && Number.isInteger(value.index) && value.name));
}

function plainValue(value, path, references) {
  if (value === undefined) return undefined;
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("Non-finite catalog value at " + path);
    return value;
  }
  if (typeof value === "function") throw new Error("Unmapped executable function at " + path);
  if (references && references.items && references.items.has(value)) {
    return { itemIndex: Number(value.index) };
  }
  if (references && references.moves && references.moves.has(value)) {
    return { moveIndex: Number(value.index) };
  }
  if (Array.isArray(value)) {
    return value.map((entry, index) => plainValue(entry, path + "[" + index + "]", references));
  }
  if (Object.prototype.toString.call(value) !== "[object Object]") {
    throw new Error("Unmapped catalog object at " + path + ": " + Object.prototype.toString.call(value));
  }
  const result = {};
  Object.keys(value).sort().forEach((key) => {
    const mapped = plainValue(value[key], path + "." + key, references);
    if (mapped !== undefined) result[key] = mapped;
  });
  return result;
}

function rulesWithout(value, excluded, path, references) {
  const rules = {};
  Object.keys(value).sort().forEach((key) => {
    if (excluded.has(key)) return;
    const mapped = plainValue(value[key], path + "." + key, references);
    if (mapped !== undefined) rules[key] = mapped;
  });
  return rules;
}

function upsert(table, columns, values, conflictColumns, updates) {
  return "insert into public." + table + " (" + columns.join(", ") + ") values (" + values.map(sqlLiteral).join(", ") + ") "
    + "on conflict (" + conflictColumns.join(", ") + ") do update set " + updates.map((column) => column + " = excluded." + column).join(", ") + ";";
}

function upsertJson(table, columns, values, jsonIndexes, conflictColumns, updates) {
  const rendered = values.map((value, index) => jsonIndexes.has(index) ? jsonLiteral(value) : sqlLiteral(value));
  return "insert into public." + table + " (" + columns.join(", ") + ") values (" + rendered.join(", ") + ") "
    + "on conflict (" + conflictColumns.join(", ") + ") do update set " + updates.map((column) => column + " = excluded." + column).join(", ") + ";";
}

function familyResult(primary, rows, entityCounts, primaryRows) {
  return { rows, manifests: new Map([[primary, { primaryRows, entityCounts }]]) };
}

function withoutPresentationFields(value) {
  if (Array.isArray(value)) return value.map(withoutPresentationFields);
  if (!value || typeof value !== "object") return value;
  const result = {};
  Object.keys(value).sort().forEach((key) => {
    if (["label", "choiceLabel", "note", "requirement", "message", "image", "sprite", "file", "title"].indexOf(key) === -1) {
      result[key] = withoutPresentationFields(value[key]);
    }
  });
  return result;
}

async function progressionStatements(release) {
  const primary = "app/data/progression.js";
  const data = await loadSourceModule(primary);
  const items = await loadSourceModule("app/data/items.js");
  const itemRefs = new Set(items.ITEM_LIBRARY);
  const records = [];
  const add = (family, key, order, rules) => records.push({ family, key, order, rules: plainValue(rules, "progression " + family + "." + key, { items: itemRefs }) });
  data.BADGE_LEVEL_LIMITS.forEach((limit, badges) => add("badge_level_limit", String(badges), badges, { badges, level: limit }));
  data.CAPTURE_LEVEL_LIMITS.forEach((limit, badges) => add("capture_level_limit", String(badges), badges, { badges, level: limit }));
  data.CAPTURE_LEVEL_RANGES.forEach((ranges, badges) => ranges.forEach((range, index) => add("capture_level_range", badges + "." + index, badges * 10 + index, { badges, min: range.min, max: range.max })));
  Object.keys(data.SEARCH_TOOL_ITEMS).sort().forEach((key, index) => add("search_tool", key, index, { itemIndex: data.SEARCH_TOOL_ITEMS[key].index }));
  [
    ["flute_daily_use_limit", data.FLUTE_DAILY_USE_LIMIT], ["garden_harvest_quantity", data.GARDEN_HARVEST_QUANTITY],
    ["daycare_withdraw_base_cost", data.DAYCARE_WITHDRAW_BASE_COST], ["daycare_withdraw_level_cost", data.DAYCARE_WITHDRAW_LEVEL_COST],
    ["daycare_max_pending_levels", data.DAYCARE_MAX_PENDING_LEVELS], ["daycare_level_interval_seconds", data.DAYCARE_LEVEL_INTERVAL_SECONDS],
    ["training_max_levels_per_pokemon", data.MAX_TRAINING_LEVELS_PER_POKEMON]
  ].forEach((entry, index) => add("constant", entry[0], index, { value: entry[1] }));
  data.TRAINING_DIFFICULTIES.forEach((entry, index) => add("training_difficulty", entry.key, index, withoutPresentationFields(entry)));
  data.BADGE_LEVEL_LIMITS.forEach((_levelCap, badges) => Object.keys(data.AUTHORITATIVE_TRAINING_DAILY_REWARDS).sort().forEach((difficulty, index) => add("training_daily_reward", badges + "." + difficulty, badges * 10 + index, { badges, difficulty, money: 0, ...data.AUTHORITATIVE_TRAINING_DAILY_REWARDS[difficulty] })));
  Object.keys(data.AUTHORITATIVE_TRAINING_REPEAT_REWARDS).sort().forEach((difficulty, index) => add("training_repeat_reward", difficulty, index, { difficulty, money: 0, ...data.AUTHORITATIVE_TRAINING_REPEAT_REWARDS[difficulty] }));
  Object.keys(data.TM_TIER_RULES).sort((a, b) => Number(a) - Number(b)).forEach((tier, index) => add("tm_tier", tier, index, { tier: Number(tier), ...data.TM_TIER_RULES[tier] }));
  data.GYM_REWARDS.forEach((reward, badgeIndex) => add("gym_reward", String(badgeIndex), badgeIndex, { badgeIndex, ...reward }));
  Object.keys(data.KANTO_LEAGUE_REWARDS).sort().forEach((key, index) => add("league_reward", key, index, { key, ...data.KANTO_LEAGUE_REWARDS[key] }));
  data.ITEM_UNLOCK_RULES.forEach((entry, index) => add("item_unlock", String(entry.item.index), index, { itemIndex: entry.item.index, requirement: entry.requirement }));
  let rangeStart = 1;
  let previous = data.expMultiplierForWinnerLevel(1);
  for (let level = 2; level <= 101; level += 1) {
    const current = level <= 100 ? data.expMultiplierForWinnerLevel(level) : null;
    if (current !== previous) {
      add("experience_multiplier", String(rangeStart), rangeStart, { minLevel: rangeStart, maxLevel: level - 1, multiplier: previous });
      rangeStart = level;
      previous = current;
    }
  }
  const rows = records.map((entry) => upsertJson("catalog_progression_rule", ["catalog_release_id", "rule_family", "rule_key", "sort_order", "rules"], [releaseId(release), entry.family, entry.key, entry.order, entry.rules], new Set([4]), ["catalog_release_id", "rule_family", "rule_key"], ["sort_order", "rules"]).replace(sqlLiteral(releaseId(release)), releaseId(release)));
  rows.push(
    "insert into public.catalog_daycare_rule (catalog_release_id, level_interval_seconds, withdraw_base_cost, withdraw_level_cost, max_pending_levels, badge_level_limits) values ("
      + releaseId(release) + ", " + data.DAYCARE_LEVEL_INTERVAL_SECONDS + ", " + data.DAYCARE_WITHDRAW_BASE_COST + ", "
      + data.DAYCARE_WITHDRAW_LEVEL_COST + ", " + data.DAYCARE_MAX_PENDING_LEVELS + ", " + integerArrayLiteral([...data.BADGE_LEVEL_LIMITS]) + ") "
      + "on conflict (catalog_release_id) do update set level_interval_seconds = excluded.level_interval_seconds, withdraw_base_cost = excluded.withdraw_base_cost, "
      + "withdraw_level_cost = excluded.withdraw_level_cost, max_pending_levels = excluded.max_pending_levels, badge_level_limits = excluded.badge_level_limits;"
  );
  data.BADGE_LEVEL_LIMITS.forEach((levelCap, badges) => {
    data.TRAINING_DIFFICULTIES.forEach((difficulty) => {
      const daily = data.AUTHORITATIVE_TRAINING_DAILY_REWARDS[difficulty.key];
      const repeat = data.AUTHORITATIVE_TRAINING_REPEAT_REWARDS[difficulty.key];
      rows.push(upsert("catalog_training_reward_rule", ["catalog_release_id", "badge_count", "difficulty", "daily_levels", "daily_money", "daily_battle_points", "repeat_levels", "repeat_money", "repeat_battle_points", "level_cap", "max_levels_per_pokemon"], [releaseId(release), badges, difficulty.key, daily.levels, 0, daily.battlePoints, repeat.levels, 0, repeat.battlePoints, levelCap, data.MAX_TRAINING_LEVELS_PER_POKEMON], ["catalog_release_id", "badge_count", "difficulty"], ["daily_levels", "daily_money", "daily_battle_points", "repeat_levels", "repeat_money", "repeat_battle_points", "level_cap", "max_levels_per_pokemon"]).replace(sqlLiteral(releaseId(release)), releaseId(release)));
    });
  });
  return familyResult(primary, rows, {
    catalog_progression_rule: records.length,
    catalog_daycare_rule: 1,
    catalog_training_reward_rule: data.BADGE_LEVEL_LIMITS.length * data.TRAINING_DIFFICULTIES.length
  }, records.length);
}

async function shopStatements(release) {
  const primary = "app/data/shopping-center.js";
  const data = await loadSourceModule(primary);
  const items = await loadSourceModule("app/data/items.js");
  const progression = await loadSourceModule("app/data/progression.js");
  const explicit = new Map(data.SHOPPING_CENTER_ITEMS.map((entry) => [entry.item.index, entry]));
  const unlocks = new Map(progression.ITEM_UNLOCK_RULES.map((entry) => [entry.item.index, entry.requirement]));
  const rows = items.ITEM_LIBRARY.map((item, order) => {
    const entry = explicit.get(item.index);
    const isTM = item.category === items.ItemCategory.TM;
    const purchasePrice = data.shoppingCenterItemPrice(item);
    const unpurchasable = purchasePrice === null || data.SHOPPING_CENTER_UNPURCHASABLE_ITEMS.indexOf(item) !== -1;
    const unsellable = data.SHOPPING_CENTER_UNSELLABLE_ITEMS.indexOf(item) !== -1;
    const singlePurchase = data.shoppingCenterItemIsSinglePurchase(item);
    const initialStock = data.shoppingCenterRemainingCartQuantity(item, { inventory: [], shopPurchases: {}, trainerInfo: [null, null, 8] }, {});
    const stockRules = singlePurchase ? { kind: "single_owned", limit: 1 } : Number.isFinite(initialStock) ? { kind: "fixed", limit: initialStock } : {};
    const requirement = isTM ? { kind: "badges", value: progression.tmUnlockBadges(item) } : (unlocks.get(item.index) || {});
    const salePrice = data.shoppingCenterSalePrice(item);
    return upsertJson("catalog_shop_offer", ["catalog_release_id", "offer_key", "item_index", "section_key", "category_key", "price", "stock_rules", "sort_order", "purchase_enabled", "sale_enabled", "single_purchase", "unlock_rules", "sale_rules"], [releaseId(release), item.key, item.index, entry ? entry.section : isTM ? "tm_shop" : "none", entry ? entry.category : isTM ? "tms" : "none", purchasePrice, stockRules, order, Boolean((entry || isTM) && !unpurchasable), !unsellable, singlePurchase, requirement, { price: salePrice }], new Set([6, 11, 12]), ["catalog_release_id", "offer_key"], ["item_index", "section_key", "category_key", "price", "stock_rules", "sort_order", "purchase_enabled", "sale_enabled", "single_purchase", "unlock_rules", "sale_rules"]).replace(sqlLiteral(releaseId(release)), releaseId(release));
  });
  return familyResult(primary, rows, { catalog_shop_offer: rows.length }, rows.length);
}

async function battleShopStatements(release) {
  const primary = "app/data/battle-shop.js";
  const data = await loadSourceModule(primary);
  const rows = [];
  data.BATTLE_SHOP_ITEM_OFFERS.forEach((offer, order) => {
    rows.push(upsertJson("catalog_battle_shop_offer", ["catalog_release_id", "offer_key", "offer_kind", "item_index", "battle_point_price", "sort_order", "rules"], [releaseId(release), "item_" + offer.item.index, "item", offer.item.index, offer.price, order, { group: offer.group }], new Set([6]), ["catalog_release_id", "offer_key"], ["offer_kind", "item_index", "battle_point_price", "sort_order", "rules"]).replace(sqlLiteral(releaseId(release)), releaseId(release)));
  });
  data.BATTLE_SHOP_POKEMON_OFFERS.forEach((offer, index) => {
    rows.push(upsertJson("catalog_battle_shop_offer", ["catalog_release_id", "offer_key", "offer_kind", "item_index", "battle_point_price", "sort_order", "rules"], [releaseId(release), offer.key, "pokemon", null, offer.price, data.BATTLE_SHOP_ITEM_OFFERS.length + index, { excludeFossils: offer.excludeFossils }], new Set([6]), ["catalog_release_id", "offer_key"], ["offer_kind", "item_index", "battle_point_price", "sort_order", "rules"]).replace(sqlLiteral(releaseId(release)), releaseId(release)));
  });
  // Publication uses the dedicated Battle Shop validator because this family
  // is additive to the historical catalog manifest allowlist.
  return familyResult(primary, rows, {}, rows.length);
}

async function combatRuleStatements(release) {
  const primary = "app/data/type-chart.js";
  const types = await loadSourceModule(primary);
  const stats = await loadSourceModule("app/data/stat-tables.js");
  const pve = await loadSourceModule("app/data/pve-move-categories.js");
  const rows = [];
  function baseValueForLevel(table, level, postSixtyGain) {
    return table[level] !== undefined ? table[level] : table[60] + (level - 60) * postSixtyGain;
  }
  let typeCount = 0;
  Object.keys(types.TYPE_CHART).sort().forEach((attacker) => Object.keys(types.TYPE_CHART[attacker]).sort().forEach((defender) => {
    typeCount += 1;
    rows.push(upsert("catalog_type_effectiveness", ["catalog_release_id", "attacker_type_key", "defender_type_key", "multiplier"], [releaseId(release), attacker, defender, types.TYPE_CHART[attacker][defender]], ["catalog_release_id", "attacker_type_key", "defender_type_key"], ["multiplier"]).replace(sqlLiteral(releaseId(release)), releaseId(release)));
  }));
  for (let level = 5; level <= 100; level += 1) {
    rows.push(upsert("catalog_level_rule", ["catalog_release_id", "level", "base_hp", "base_power", "base_stats", "max_hp", "max_power", "max_stats"], [releaseId(release), level, baseValueForLevel(stats.HP_BY_LEVEL, level, 3), baseValueForLevel(stats.PW_BY_LEVEL, level, 2), baseValueForLevel(stats.STATS_BY_LEVEL, level, 2), stats.maxHpForLevel(level), stats.maxPowerForLevel(level), stats.maxStatsForLevel(level)], ["catalog_release_id", "level"], ["base_hp", "base_power", "base_stats", "max_hp", "max_power", "max_stats"]).replace(sqlLiteral(releaseId(release)), releaseId(release)));
  }
  let pveCount = 0;
  Object.keys(pve.PVE_MOVE_CATEGORIES).sort().forEach((category) => pve.PVE_MOVE_CATEGORIES[category].forEach((moveIndex, order) => {
    pveCount += 1;
    rows.push(upsert("catalog_pve_move_category", ["catalog_release_id", "category_key", "move_index", "sort_order"], [releaseId(release), category, moveIndex, order], ["catalog_release_id", "category_key", "move_index"], ["sort_order"]).replace(sqlLiteral(releaseId(release)), releaseId(release)));
  }));
  return familyResult(primary, rows, { catalog_type_effectiveness: typeCount, catalog_level_rule: 96, catalog_pve_move_category: pveCount }, typeCount + 96 + pveCount);
}

async function zoneAccessStatements(release) {
  const primary = "app/data/zone-access-rules.js";
  const access = await loadSourceModule(primary);
  const zones = await loadSourceModule("app/data/capture-zones.js");
  const rows = [];
  Object.keys(zones.CAPTURE_ZONES).sort().forEach((zone) => {
    const requirement = access.zoneAccessRequirement(zone);
    if (requirement) rows.push(upsertJson("catalog_zone_access_requirement", ["catalog_release_id", "zone_key", "item_index", "presentation"], [releaseId(release), zone, requirement.item.index, {}], new Set([3]), ["catalog_release_id", "zone_key"], ["item_index", "presentation"]).replace(sqlLiteral(releaseId(release)), releaseId(release)));
  });
  return familyResult(primary, rows, { catalog_zone_access_requirement: rows.length }, rows.length);
}

async function missionStatements(release) {
  const primary = "app/data/pokefan-missions.js";
  const data = await loadSourceModule(primary);
  const rows = data.POKEFAN_MISSIONS.map((mission) => {
    const rules = rulesWithout(mission, new Set(["missionIndex", "category", "type", "target", "phase", "sequence", "reward", "requirement"]), "mission " + mission.missionIndex, null);
    const reward = plainValue(mission.reward, "mission " + mission.missionIndex + ".reward", null);
    return upsertJson("catalog_mission", ["catalog_release_id", "mission_index", "category_key", "mission_type", "target", "phase", "sequence", "rules", "reward_rules", "presentation"], [releaseId(release), mission.missionIndex, mission.category, mission.type, mission.target, mission.phase, mission.sequence, rules, withoutPresentationFields(reward), {}], new Set([7, 8, 9]), ["catalog_release_id", "mission_index"], ["category_key", "mission_type", "target", "phase", "sequence", "rules", "reward_rules", "presentation"]).replace(sqlLiteral(releaseId(release)), releaseId(release));
  });
  return familyResult(primary, rows, { catalog_mission: rows.length }, rows.length);
}

async function titleStatements(release) {
  const primary = "app/data/titles.js";
  const data = await loadSourceModule(primary);
  const rows = data.TRAINER_TITLES.map((title) => {
    const unlockRules = rulesWithout(title, new Set(["key", "collectionKey", "sortOrder", "unlockType"]), "title " + title.key, null);
    return upsertJson(
      "catalog_title",
      ["catalog_release_id", "title_key", "collection_key", "sort_order", "unlock_type", "unlock_rules"],
      [releaseId(release), title.key, title.collectionKey, title.sortOrder, title.unlockType, unlockRules],
      new Set([5]),
      ["catalog_release_id", "title_key"],
      ["collection_key", "sort_order", "unlock_type", "unlock_rules"]
    ).replace(sqlLiteral(releaseId(release)), releaseId(release));
  });
  return familyResult(primary, rows, { catalog_title: rows.length }, rows.length);
}

function opponentPokemonRows(release, opponentKey, team, rows, counts) {
  team.forEach((pokemon, slot) => {
    const speciesKey = String(pokemon.speciesKey);
    const pokemonRules = {
      gender: pokemon.gender || null,
      isShiny: Boolean(pokemon.isShiny),
      isMega: Boolean(pokemon.isMega),
      expCurrent: Number(pokemon.expCurrent) || 0,
      expCap: Number(pokemon.expCap) || 0
    };
    rows.push(upsertJson("catalog_opponent_pokemon", ["catalog_release_id", "opponent_key", "slot_index", "species_key", "level", "max_hp", "held_item_index", "rules"], [releaseId(release), opponentKey, slot, speciesKey, pokemon.level, pokemon.maxHp, Number(pokemon.heldItemIndex) || null, pokemonRules], new Set([7]), ["catalog_release_id", "opponent_key", "slot_index"], ["species_key", "level", "max_hp", "held_item_index", "rules"]).replace(sqlLiteral(releaseId(release)), releaseId(release)));
    counts.catalog_opponent_pokemon += 1;
    (pokemon.moves || []).forEach((move, moveSlot) => {
      if (!Number.isInteger(Number(move.index))) throw new Error("Unmapped opponent move at " + opponentKey + ".team[" + slot + "].moves[" + moveSlot + "]");
      rows.push(upsert("catalog_opponent_move", ["catalog_release_id", "opponent_key", "pokemon_slot_index", "move_slot_index", "move_index", "power", "stats"], [releaseId(release), opponentKey, slot, moveSlot, Number(move.index), Number(move.power) || 0, Number(move.stats) || 0], ["catalog_release_id", "opponent_key", "pokemon_slot_index", "move_slot_index"], ["move_index", "power", "stats"]).replace(sqlLiteral(releaseId(release)), releaseId(release)));
      counts.catalog_opponent_move += 1;
    });
  });
}

function opponentRewardRows(release, opponentKey, rewards, rows, counts) {
  rewards.forEach((reward, order) => {
    const itemIndex = reward.kind === "item" ? Number(reward.itemIndex) : null;
    const quantity = reward.quantity !== undefined ? Number(reward.quantity) : null;
    const rules = withoutPresentationFields(plainValue(reward, "opponent " + opponentKey + ".reward[" + order + "]", null));
    delete rules.kind;
    delete rules.itemIndex;
    delete rules.quantity;
    rows.push(upsertJson("catalog_opponent_reward", ["catalog_release_id", "opponent_key", "reward_order", "reward_kind", "item_index", "quantity", "rules", "presentation"], [releaseId(release), opponentKey, order, reward.kind, itemIndex, quantity, rules, {}], new Set([6, 7]), ["catalog_release_id", "opponent_key", "reward_order"], ["reward_kind", "item_index", "quantity", "rules", "presentation"]).replace(sqlLiteral(releaseId(release)), releaseId(release)));
    counts.catalog_opponent_reward += 1;
  });
}

async function opponentStatements(release) {
  const primary = "app/data/gyms.js";
  const data = await loadSourceModule(primary);
  const progression = await loadSourceModule("app/data/progression.js");
  const rows = [];
  const counts = { catalog_opponent: 0, catalog_opponent_pokemon: 0, catalog_opponent_move: 0, catalog_opponent_reward: 0 };
  data.KANTO_GYM_CITIES.forEach((city, order) => {
    const leader = data.KANTO_GYM_LEADERS[city.key];
    if (!leader) throw new Error("Missing gym leader for " + city.key);
    const key = "gym_" + city.key;
    const portMax = city.badgeIndex < 6 ? 0 : 1;
    const superEffectiveMax = city.badgeIndex === 5 || city.badgeIndex === 6 ? 3 : city.badgeIndex === 7 ? 2 : null;
    rows.push(upsertJson("catalog_opponent", ["catalog_release_id", "opponent_key", "opponent_kind", "sort_order", "badge_index", "rules", "presentation"], [releaseId(release), key, "gym", order, city.badgeIndex, { unlockBadges: city.badgeIndex, maxPlayerLevel: progression.BADGE_LEVEL_LIMITS[city.badgeIndex], ohkoPokemonMax: 2, portItemMax: portMax, portItemsDistinct: false, superEffectivePokemonMax: superEffectiveMax }, { name: leader.name, sprite: leader.sprite, cityKey: city.key, cityImage: city.image }], new Set([5, 6]), ["catalog_release_id", "opponent_key"], ["opponent_kind", "sort_order", "badge_index", "rules", "presentation"]).replace(sqlLiteral(releaseId(release)), releaseId(release)));
    counts.catalog_opponent += 1;
    opponentPokemonRows(release, key, leader.team, rows, counts);
    const reward = progression.GYM_REWARDS[city.badgeIndex];
    opponentRewardRows(release, key, [
      { kind: "money", quantity: reward.money },
      reward.tm ? { kind: "item", itemIndex: reward.tm, quantity: 1 } : null,
      reward.item ? { kind: "item", itemIndex: reward.item, quantity: Math.max(1, Number(reward.itemQuantity) || 1) } : null,
      { kind: "badge", quantity: 1, badgeIndex: city.badgeIndex }
    ].filter(Boolean), rows, counts);
  });
  const league = data.KANTO_ELITE_FOUR.concat([data.KANTO_CHAMPION]);
  league.forEach((member, index) => {
    const champion = index === data.KANTO_ELITE_FOUR.length;
    const key = champion ? "kanto_league_champion" : "kanto_league_" + (index + 1);
    rows.push(upsertJson("catalog_opponent", ["catalog_release_id", "opponent_key", "opponent_kind", "sort_order", "badge_index", "rules", "presentation"], [releaseId(release), key, champion ? "champion" : "league", index, null, { unlockBadges: 8, ohkoPokemonMax: 2, portItemMax: 2, portItemsDistinct: true }, { name: member.name, sprite: member.sprite, sourceKey: member.key }], new Set([5, 6]), ["catalog_release_id", "opponent_key"], ["opponent_kind", "sort_order", "badge_index", "rules", "presentation"]).replace(sqlLiteral(releaseId(release)), releaseId(release)));
    counts.catalog_opponent += 1;
    opponentPokemonRows(release, key, member.team, rows, counts);
    opponentRewardRows(release, key, [{ kind: "money", quantity: champion ? progression.KANTO_LEAGUE_REWARDS.champion.money : progression.KANTO_LEAGUE_REWARDS.member.money }], rows, counts);
  });
  return familyResult(primary, rows, counts, counts.catalog_opponent);
}

async function adminBattleStatements(release) {
  const primary = "app/data/admin-battles.js";
  const data = await loadSourceModule(primary);
  const battleTypes = [
    "gym_pewter_city", "gym_cerulean_city", "gym_vermilion_city", "gym_celadon_city",
    "gym_saffron_city", "gym_fuchsia_city", "gym_cinnabar_island", "gym_viridian_city",
    "training_debug", "kanto_league_1", "kanto_league_2", "kanto_league_3",
    "kanto_league_4", "kanto_league_champion"
  ];
  const rows = battleTypes.map((battleType) => upsert("catalog_admin_battle_type", ["catalog_release_id", "battle_type", "admin_controlled", "reward_enabled", "league_battle"], [releaseId(release), battleType, data.isAdminControlledBattleType(battleType), data.isAdminRewardBattleType(battleType), data.isKantoLeagueBattleType(battleType)], ["catalog_release_id", "battle_type"], ["admin_controlled", "reward_enabled", "league_battle"]).replace(sqlLiteral(releaseId(release)), releaseId(release)));
  data.ADMIN_BATTLE_ITEMS.forEach((entry) => rows.push(upsert("catalog_admin_battle_item", ["catalog_release_id", "item_index", "quantity"], [releaseId(release), Number(entry[0]), Number(entry[1])], ["catalog_release_id", "item_index"], ["quantity"]).replace(sqlLiteral(releaseId(release)), releaseId(release))));
  return familyResult(primary, rows, { catalog_admin_battle_type: battleTypes.length, catalog_admin_battle_item: data.ADMIN_BATTLE_ITEMS.length }, battleTypes.length + data.ADMIN_BATTLE_ITEMS.length);
}

async function trainerStatements(release) {
  const primary = "app/data/trainers.js";
  const data = await loadSourceModule(primary);
  const rows = [];
  data.TRAINER_SPRITES.forEach((trainer) => rows.push(upsertJson("catalog_trainer_avatar", ["catalog_release_id", "trainer_index", "gender_key", "presentation"], [releaseId(release), trainer.index, trainer.gender, {}], new Set([3]), ["catalog_release_id", "trainer_index"], ["gender_key", "presentation"]).replace(sqlLiteral(releaseId(release)), releaseId(release))));
  let nameCount = 0;
  Object.keys(data.TRAINER_NAME_POOLS).sort().forEach((gender) => data.TRAINER_NAME_POOLS[gender].forEach((name, order) => {
    nameCount += 1;
    rows.push(upsert("catalog_trainer_name", ["catalog_release_id", "gender_key", "sort_order", "display_name"], [releaseId(release), gender, order, name], ["catalog_release_id", "gender_key", "sort_order"], ["display_name"]).replace(sqlLiteral(releaseId(release)), releaseId(release)));
  }));
  return familyResult(primary, rows, { catalog_trainer_avatar: data.TRAINER_SPRITES.length, catalog_trainer_name: nameCount }, data.TRAINER_SPRITES.length + nameCount);
}

async function zoneStatements(release) {
  const primary = "app/data/capture-zones.js";
  const data = await loadSourceModule(primary);
  const rows = [];
  const typeKeys = [...new Set(Object.values(data.CAPTURE_ZONES).flat())];
  typeKeys.forEach((typeKey, index) => rows.push(upsert("catalog_type", ["catalog_release_id", "type_key", "display_name", "sort_order"], [releaseId(release), typeKey, typeKey, index], ["catalog_release_id", "type_key"], ["display_name", "sort_order"]).replace(sqlLiteral(releaseId(release)), releaseId(release))));
  Object.entries(data.CAPTURE_ZONES).forEach(([zoneKey, types]) => {
    rows.push(upsertJson("catalog_zone", ["catalog_release_id", "zone_key", "display_name", "rules"], [releaseId(release), zoneKey, zoneKey, {}], new Set([3]), ["catalog_release_id", "zone_key"], ["display_name", "rules"]).replace(sqlLiteral(releaseId(release)), releaseId(release)));
    types.forEach((typeKey, index) => rows.push(upsert("catalog_zone_type", ["catalog_release_id", "zone_key", "type_key", "type_order"], [releaseId(release), zoneKey, typeKey, index], ["catalog_release_id", "zone_key", "type_key"], ["type_order"]).replace(sqlLiteral(releaseId(release)), releaseId(release))));
  });
  Object.entries(data.RARITY_WEIGHTS).forEach(([key, weight]) => rows.push(upsert("catalog_rarity_rule", ["catalog_release_id", "rarity_key", "encounter_weight", "catch_multiplier"], [releaseId(release), key, weight, data.CATCH_RARITY_MULTIPLIERS[key]], ["catalog_release_id", "rarity_key"], ["encounter_weight", "catch_multiplier"]).replace(sqlLiteral(releaseId(release)), releaseId(release))));
  data.CATCH_HP_THRESHOLDS.forEach((entry, index) => rows.push(upsert("catalog_capture_hp_threshold", ["catalog_release_id", "threshold_order", "max_hp_fraction", "catch_multiplier"], [releaseId(release), index, entry.maxHpFraction, entry.multiplier], ["catalog_release_id", "threshold_order"], ["max_hp_fraction", "catch_multiplier"]).replace(sqlLiteral(releaseId(release)), releaseId(release))));
  Object.entries(data.CATCH_STATUS_MULTIPLIERS).forEach(([statusKey, multiplier]) => rows.push(upsert("catalog_capture_status_multiplier", ["catalog_release_id", "status_key", "catch_multiplier"], [releaseId(release), statusKey, multiplier], ["catalog_release_id", "status_key"], ["catch_multiplier"]).replace(sqlLiteral(releaseId(release)), releaseId(release))));
  return { rows, manifests: new Map([[primary, {
    primaryRows: Object.keys(data.CAPTURE_ZONES).length,
    entityCounts: {
      catalog_type: typeKeys.length,
      catalog_zone: Object.keys(data.CAPTURE_ZONES).length,
      catalog_zone_type: Object.values(data.CAPTURE_ZONES).reduce((count, types) => count + types.length, 0),
      catalog_rarity_rule: Object.keys(data.RARITY_WEIGHTS).length,
      catalog_capture_hp_threshold: data.CATCH_HP_THRESHOLDS.length
    }
  }]]) };
}

async function moveStatements(release) {
  const primary = "app/data/moves.js";
  const data = await loadSourceModule(primary);
  const keys = moveExportKeys(data);
  const excluded = new Set(["key", "index", "name", "before", "after", "effect_before", "effect_after"]);
  const rows = data.MOVE_LIBRARY.map((move) => {
    const key = keys.get(move.index);
    const rules = rulesWithout(move, excluded, "move " + key, null);
    const before = move.effect_before || move.before;
    const after = move.effect_after || move.after;
    if (before !== null && before !== undefined && typeof before !== "function") throw new Error("Invalid before hook for move " + key);
    if (after !== null && after !== undefined && typeof after !== "function") throw new Error("Invalid after hook for move " + key);
    rules.effectKeys = {};
    if (before) rules.effectKeys.before = "move." + key + ".before";
    if (after) rules.effectKeys.after = "move." + key + ".after";
    rules.multiTurn = data.MULTI_TURN_MOVE_INDEXES.has(move.index);
    rules.multiturnEffect = data.MULTITURN_EFFECT_MOVE_INDEXES.has(move.index);
    rules.copyable = !data.NOT_COPYABLE_MOVE_INDEXES.has(move.index);
    rules.semiInvulnerableAllowedMoveKeys = data.SEMI_INVULN_ALLOWED[key]
      ? Object.keys(data.SEMI_INVULN_ALLOWED[key]).sort()
      : [];
    return upsertJson("catalog_move", ["catalog_release_id", "move_index", "move_key", "display_name", "rules_key", "rules"], [releaseId(release), move.index, key, move.name, "move." + key, rules], new Set([5]), ["catalog_release_id", "move_index"], ["move_key", "display_name", "rules_key", "rules"]).replace(sqlLiteral(releaseId(release)), releaseId(release));
  });
  return { rows, manifests: new Map([[primary, {
    primaryRows: data.MOVE_LIBRARY.length,
    entityCounts: { catalog_move: data.MOVE_LIBRARY.length }
  }]]) };
}

async function itemStatements(release) {
  const primary = "app/data/items.js";
  const data = await loadSourceModule(primary);
  const moves = await loadSourceModule("app/data/moves.js");
  const moveRefs = moveReferenceSet(moves);
  const itemRefs = new Set(data.ITEM_LIBRARY);
  const excluded = new Set(["key", "index", "name", "category", "subcategory", "move"]);
  const rows = data.ITEM_LIBRARY.map((item) => {
    const key = item.key;
    const category = item.category && item.category.key;
    const subcategory = item.subcategory ? item.subcategory.key : null;
    if (!category) throw new Error("Unmapped category for item " + key);
    if (item.subcategory && !subcategory) throw new Error("Unmapped subcategory for item " + key);
    const rules = rulesWithout(item, excluded, "item " + key, { items: itemRefs, moves: moveRefs });
    rules.berryGrowthHours = data.BERRY_NORMAL_CYCLE_ITEMS.indexOf(item) !== -1
      ? 36
      : data.BERRY_LONG_CYCLE_ITEMS.indexOf(item) !== -1 ? 60 : null;
    rules.playerBattleUsable = data.PLAYER_BATTLE_USABLE_ITEMS.indexOf(item) !== -1;
    return upsertJson("catalog_item", ["catalog_release_id", "item_index", "item_key", "display_name", "category_key", "subcategory_key", "move_index", "rules"], [releaseId(release), item.index, key, item.name, category, subcategory, item.move ? item.move.index : null, rules], new Set([7]), ["catalog_release_id", "item_index"], ["item_key", "display_name", "category_key", "subcategory_key", "move_index", "rules"]).replace(sqlLiteral(releaseId(release)), releaseId(release));
  });
  return { rows, manifests: new Map([[primary, {
    primaryRows: data.ITEM_LIBRARY.length,
    entityCounts: { catalog_item: data.ITEM_LIBRARY.length }
  }]]) };
}

async function speciesStatements(release, chunk) {
  const paths = ["app/data/species_I.js", "app/data/species_II.js", "app/data/species_III.js"];
  const modules = [];
  for (const path of paths) modules.push(await loadSourceModule(path));
  const moves = await loadSourceModule("app/data/moves.js");
  const items = await loadSourceModule("app/data/items.js");
  const moveRefs = moveReferenceSet(moves);
  const itemRefs = new Set(items.ITEM_LIBRARY);
  const entries = modules.flatMap((namespace, sourceIndex) => Object.entries(namespace.SPECIES_LIBRARY).map(([key, species]) => ({ key, species, sourceIndex })));
  const selectedEntries = chunk
    ? entries.filter((_entry, index) => index % chunk.total === chunk.index - 1)
    : entries;
  if (chunk && selectedEntries.length === 0) throw new Error("Chunk has no species; reduce the chunk total.");
  const requiredBaseKeys = new Set(selectedEntries.map((entry) => entry.key));
  selectedEntries.forEach((entry) => {
    ((entry.species.evolution && entry.species.evolution.to) || []).forEach((evolution) => requiredBaseKeys.add(String(evolution.species)));
  });
  const baseEntries = chunk ? entries.filter((entry) => requiredBaseKeys.has(entry.key)) : entries;
  const rows = [];
  const counts = {
    catalog_species: entries.length,
    catalog_species_type: entries.reduce((count, entry) => count + (entry.species.type || []).length, 0),
    catalog_species_gender: entries.reduce((count, entry) => count + (entry.species.gender || []).length, 0),
    catalog_species_level_move: entries.reduce((count, entry) => count + Object.values(entry.species.movesByLevel || {}).reduce((subtotal, movesAtLevel) => subtotal + movesAtLevel.length, 0), 0),
    catalog_species_machine_move: entries.reduce((count, entry) => count + (entry.species.movesByTM || []).length, 0),
    catalog_species_evolution: entries.reduce((count, entry) => count + ((entry.species.evolution && entry.species.evolution.to) || []).length, 0)
  };
  const excluded = new Set(["name", "dexNumber", "type", "gender", "encounter", "exp", "spriteGendered", "movesByLevel", "movesByTM", "evolution"]);
  baseEntries.forEach(({ key, species }) => {
    const encounter = species.encounter || {};
    const rules = rulesWithout(species, excluded, "species " + key, { items: itemRefs, moves: moveRefs });
    rules.evolutionStage = species.evolution && species.evolution.stage ? species.evolution.stage : "base";
    rows.push(upsertJson("catalog_species", ["catalog_release_id", "species_key", "dex_number", "display_name", "experience_reward", "sprite_gendered", "encounter_rarity_key", "encounter_min_level", "encounter_max_level", "rules"], [releaseId(release), key, species.dexNumber, species.name, species.exp, Boolean(species.spriteGendered), encounter.rarity, encounter.minLevel, encounter.maxLevel, rules], new Set([9]), ["catalog_release_id", "species_key"], ["dex_number", "display_name", "experience_reward", "sprite_gendered", "encounter_rarity_key", "encounter_min_level", "encounter_max_level", "rules"]).replace(sqlLiteral(releaseId(release)), releaseId(release)));
  });
  selectedEntries.forEach(({ key, species }) => {
    (species.type || []).forEach((type, index) => {
      rows.push(upsert("catalog_species_type", ["catalog_release_id", "species_key", "type_key", "type_order"], [releaseId(release), key, type, index], ["catalog_release_id", "species_key", "type_order"], ["type_key"]).replace(sqlLiteral(releaseId(release)), releaseId(release)));
    });
    (species.gender || []).forEach((gender, index) => {
      rows.push(upsert("catalog_species_gender", ["catalog_release_id", "species_key", "gender_key", "gender_order"], [releaseId(release), key, gender, index], ["catalog_release_id", "species_key", "gender_key"], ["gender_order"]).replace(sqlLiteral(releaseId(release)), releaseId(release)));
    });
    Object.keys(species.movesByLevel || {}).sort((a, b) => Number(a) - Number(b)).forEach((level) => {
      species.movesByLevel[level].forEach((move, index) => {
        if (!moveRefs.has(move)) throw new Error("Unmapped level move for species " + key + " at level " + level + "[" + index + "]");
        if (Number(level) < 1 || Number(level) > 100) throw new Error("Invalid move level for species " + key + ": " + level);
        rows.push(upsert("catalog_species_level_move", ["catalog_release_id", "species_key", "level", "move_index", "move_order"], [releaseId(release), key, Number(level), move.index, index], ["catalog_release_id", "species_key", "level", "move_order"], ["move_index"]).replace(sqlLiteral(releaseId(release)), releaseId(release)));
      });
    });
    (species.movesByTM || []).forEach((move) => {
      if (!moveRefs.has(move)) throw new Error("Unmapped machine move for species " + key);
      rows.push(upsert("catalog_species_machine_move", ["catalog_release_id", "species_key", "move_index"], [releaseId(release), key, move.index], ["catalog_release_id", "species_key", "move_index"], ["move_index"]).replace(sqlLiteral(releaseId(release)), releaseId(release)));
    });
    ((species.evolution && species.evolution.to) || []).forEach((evolution, index) => {
      const trigger = evolution.trigger || {};
      if (!trigger.kind) throw new Error("Missing evolution trigger for species " + key + " evolution " + index);
      const triggerRules = rulesWithout(trigger, new Set(["kind"]), "species " + key + ".evolution[" + index + "].trigger", { items: itemRefs, moves: moveRefs });
      rows.push(upsertJson("catalog_species_evolution", ["catalog_release_id", "species_key", "target_species_key", "evolution_order", "trigger_key", "trigger_rules"], [releaseId(release), key, String(evolution.species), index, trigger.kind, triggerRules], new Set([5]), ["catalog_release_id", "species_key", "evolution_order"], ["target_species_key", "trigger_key", "trigger_rules"]).replace(sqlLiteral(releaseId(release)), releaseId(release)));
    });
  });
  return { rows, manifests: new Map([[paths[0], {
    primaryRows: entries.length,
    entityCounts: counts
  }]]) };
}

async function familyStatements(release, family, chunk) {
  if (family === "zones") return zoneStatements(release);
  if (family === "moves") return moveStatements(release);
  if (family === "items") return itemStatements(release);
  if (family === "species") return speciesStatements(release, chunk);
  if (family === "progression") return progressionStatements(release);
  if (family === "shop") return shopStatements(release);
  if (family === "battle-shop") return battleShopStatements(release);
  if (family === "combat-rules") return combatRuleStatements(release);
  if (family === "zone-access") return zoneAccessStatements(release);
  if (family === "missions") return missionStatements(release);
  if (family === "titles") return titleStatements(release);
  if (family === "opponents") return opponentStatements(release);
  if (family === "admin-battles") return adminBattleStatements(release);
  if (family === "trainers") return trainerStatements(release);
  throw new Error("Unsupported data family: " + family);
}

async function main() {
  const release = argument("--release");
  const family = argument("--family") || "metadata";
  const draftChecksum = argument("--checksum") || "draft:pending";
  const chunk = parseChunk(argument("--chunk"));
  if (!release || !SUPPORTED_FAMILIES.has(family)) usage("Release and a supported family are required.");
  if (chunk && family !== "species") usage("Chunking is currently supported only for species; other families are below the request-size threshold.");
  if (chunk && family === "metadata") usage("Metadata cannot be chunked.");
  if (family === "metadata") {
    process.stdout.write([
      "begin;",
      "do $$ begin if exists (select 1 from public.catalog_release where version = " + sqlLiteral(release) + " and status <> 'draft') then raise exception 'catalog release is not mutable: %', " + sqlLiteral(release) + "; end if; end $$;",
      "insert into public.catalog_release (version, checksum, status) values (" + sqlLiteral(release) + ", " + sqlLiteral(draftChecksum) + ", 'draft') on conflict (version) do nothing;",
      "commit;",
      ""
    ].join("\n"));
    return;
  }
  const generated = await familyStatements(release, family, chunk);
  const sources = loadedSources();
  const statements = ["begin;", familyGuard(release, family, sources, chunk), ...generated.rows];
  let manifestCondition = null;
  if (chunk) {
    statements.push(chunkStatement(release, family, chunk, sources));
    manifestCondition = chunksCompleteCondition(release, family, chunk, sources);
  }
  sources.forEach((path) => statements.push(sourceBatch(release, family, path, generated.manifests.get(path) || null, manifestCondition)));
  statements.push("commit;");
  process.stdout.write(statements.join("\n") + "\n");
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
