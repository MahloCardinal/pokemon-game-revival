import { Pokemon } from "../engine/index.js";
import { state } from "./game-state.js";
import { render } from "./renderer.js";
import { flushPendingGlobalActivityEvents } from "./activity-feed-runtime.js";

export function serializePokemonList(list) {
  return (list || []).map(function (pokemon) { return pokemon.toJSON(); });
}

export function serializeBoxList(list) {
  return (list || []).map(function (pokemon) {
    return { boxIndex: Number(pokemon.boxIndex), pokemon: pokemon.toJSON() };
  }).filter(function (entry) { return Number.isFinite(entry.boxIndex); });
}

export function revivePokemonList(list) {
  if (!Array.isArray(list)) return [];
  return list.map(function (entry) {
    var pokemon = Pokemon.fromJSON(entry);
    pokemon.debugCreated = Boolean(entry && entry.debug_created);
    return pokemon;
  });
}

export function reviveBoxList(entries, field) {
  var key = field === "box_index" ? "box_index" : "boxIndex";
  if (!Array.isArray(entries)) return [];
  return entries.map(function (entry) {
    var pokemon = Pokemon.fromJSON(entry.pokemon || entry);
    pokemon.debugCreated = Boolean((entry.pokemon || entry).debug_created);
    pokemon.boxIndex = Number(entry[key]);
    return pokemon;
  }).filter(function (pokemon) { return Number.isFinite(pokemon.boxIndex); })
    .sort(function (left, right) { return Number(left.boxIndex) - Number(right.boxIndex); });
}

export function reviveDaycareRows(entries) {
  var slots = [null, null];
  if (!Array.isArray(entries)) return slots;
  entries.forEach(function (entry) {
    var slotIndex = Math.floor(Number(entry && (entry.slot_index !== undefined ? entry.slot_index : entry.slotIndex)) || 0);
    if (slotIndex < 0 || slotIndex > 1 || !entry || !entry.pokemon) return;
    var pokemon = Pokemon.fromJSON(entry.pokemon);
    pokemon.debugCreated = Boolean(entry.pokemon.debug_created);
    slots[slotIndex] = {
      slotIndex: slotIndex,
      pokemon: pokemon,
      depositedAt: entry.deposited_at || entry.depositedAt || null,
      status: entry.status || "deposited",
      pendingLevels: Math.max(0, Math.floor(Number(entry.pending_levels !== undefined ? entry.pending_levels : entry.pendingLevels) || 0)),
      cost: Math.max(0, Math.floor(Number(entry.cost) || 0)),
      elapsedIntervals: Math.max(0, Math.floor(Number(entry.elapsed_intervals !== undefined ? entry.elapsed_intervals : entry.elapsedIntervals) || 0)),
      levelCap: Math.max(1, Math.floor(Number(entry.level_cap !== undefined ? entry.level_cap : entry.levelCap) || 100)),
      serverTime: entry.server_time || entry.serverTime || null,
      pendingResolutionId: entry.pending_resolution_id || entry.pendingResolutionId || null
    };
  });
  return slots;
}

// Every durable mutation is already committed by its authoritative command.
// This helper only closes the local UI lifecycle and flushes informational events.
export function saveAfterStateChange(reason, options) {
  state.dirty = false;
  state.saveStatus = { state: "saved", message: "" };
  flushPendingGlobalActivityEvents();
  if (!(options && options.renderOnComplete === false)) render();
  return Promise.resolve({ ok: true, canonical: true, reason: reason || "" });
}
