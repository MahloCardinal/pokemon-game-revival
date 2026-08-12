import { applyPlayerSave, registerPokedexPokemon, root, state } from "./game-state.js";
import { registerAction } from "./action-registry.js";
import { markDirty, render } from "./renderer.js";
import { saveAfterStateChange } from "./save-runtime.js";
import { openInlineMessage } from "./dialog-handler.js";
import { adjustInventoryItemQuantity, broadcastTeamBoxRuntimeState } from "./runtime-state.js";
import * as Engine from "../engine/index.js";

var TEAM_MAX = Engine.TEAM_MAX;
import { escapeHtml } from "./asset-helpers.js";
import { button } from "./render-utils.js";
import { SPECIES_LIBRARY } from "../data/index.js";
import * as MoveConstants from "../data/moves.js";
import { getItemByIndex } from "../data/items.js";
import * as ItemConstants from "../data/items.js";
import { addAuthoritativeDebugBattlePoints, adjustAuthoritativeDebugBadges, adjustAuthoritativeDebugInventory, adjustAuthoritativeDebugMoney, createAuthoritativeDebugPokemon } from "../api/debug.js";
import { authoritativeDebugPlayerState } from "../api/debug-contract.js";
import { saveFromAuthoritativeProjection } from "../api/player.js";
import { getCurrentPlayerState } from "../api/player-command.js";

var DEBUG_USER_NAME = "aaa";
var DEBUG_POKEMON_MIN_LEVEL = 5;
var DEBUG_POKEMON_MAX_HP = 999;
var DEBUG_POKEMON_MAX_POWER = 999;
var DEBUG_POKEMON_MAX_STATS = 999;
var authoritativeDebugInventoryPending = false;
var authoritativeDebugBattlePointsPending = false;



export function isDebugUser() {
  return Boolean(state.auth && Array.isArray(state.auth.serverRoles) && state.auth.serverRoles.indexOf("debug") !== -1);
}

export function renderDebugButton(label, action, attrs, extraClasses) {
  if (!isDebugUser()) {
    return "";
  }
  return button(label, action, attrs || "", extraClasses || "");
}

export function renderDebugTrainerMoneyControls() {
  return renderDebugButton("+1.000.000", "trainer-debug-add-money", "", "button-ghost button-slim trainer-money-debug");
}

export function renderDebugTrainerBattlePointControls() {
  return renderDebugButton("+500", "trainer-debug-add-battle-points",
    authoritativeDebugBattlePointsPending ? "disabled" : "", "button-ghost button-slim trainer-battle-points-debug");
}

export function renderDebugTrainerBadgeControls() {
  return renderDebugButton("-1", "trainer-debug-adjust-badges", 'data-delta="-1"', "button-ghost button-slim trainer-badge-debug") +
    renderDebugButton("+1", "trainer-debug-adjust-badges", 'data-delta="1"', "button-ghost button-slim trainer-badge-debug");
}

export function renderDebugPokemonCreator() {
  return renderDebugPokemonCreatorPanel();
}

export function renderDebugPokemonCreatorPanel(options) {
  options = options || {};
  var moveRows;
  var count = options.count !== undefined ? Number(options.count) || 0 : state.team.length;
  var max = options.max !== undefined ? Number(options.max) || 0 : TEAM_MAX;
  var title = options.title || "Crea Pokémon (debug)";
  var action = options.action || "trainer-debug-create-pokemon";
  var buttonLabel = options.buttonLabel || "Crea Pokémon";
  var panelClass = "team-description-panel trainer-debug-pokemon-panel" + (options.className ? " " + options.className : "");
  if (!isDebugUser() || count >= max) {
    return "";
  }
  moveRows = [0, 1, 2, 3].map(function (index) {
    var slot = index + 1;
    return [
      '<div class="trainer-debug-pokemon-move-row">',
      '  <label><span>Mossa ' + slot + '</span><input type="text" data-debug-pokemon-field="move-name-' + index + '" placeholder="AttaccodAla"' + (index === 0 ? ' value="Azione"' : '') + ' autocomplete="off"></label>',
      '  <label><span>Power</span><input type="number" min="0" max="999" step="1" data-debug-pokemon-field="move-power-' + index + '"' + (index === 0 ? ' value="999"' : '') + ' inputmode="numeric"></label>',
      '  <label><span>Stats</span><input type="number" min="0" max="999" step="1" data-debug-pokemon-field="move-stats-' + index + '"' + (index === 0 ? ' value="999"' : '') + ' inputmode="numeric"></label>',
      "</div>"
    ].join("");
  }).join("");

  return [
    '<section class="' + escapeHtml(panelClass) + '">',
    '  <div class="trainer-debug-pokemon-heading">',
    "    <h2>" + escapeHtml(title) + "</h2>",
    '    <span>' + escapeHtml(count) + "/" + escapeHtml(max) + "</span>",
    "  </div>",
    '  <div class="trainer-debug-pokemon-grid">',
    '    <label><span>Indice specie</span><input type="text" data-debug-pokemon-field="species-key" placeholder="1" value="4" autocomplete="off"></label>',
    '    <label><span>Livello</span><input type="number" min="5" max="100" step="1" data-debug-pokemon-field="level" value="100" inputmode="numeric"></label>',
    '    <label><span>PS</span><input type="number" min="1" max="999" step="1" data-debug-pokemon-field="max-hp" value="999" inputmode="numeric"></label>',
    '    <label><span>Strumento</span><input type="text" data-debug-pokemon-field="held-item" placeholder="poke_ball" autocomplete="off"></label>',
    "  </div>",
    '  <div class="trainer-debug-pokemon-moves">',
    moveRows,
    "  </div>",
    '  <div class="trainer-debug-pokemon-actions">' + button(buttonLabel, action, "", "button-primary") + "</div>",
    "</section>"
  ].join("");
}

function registerDebugAction(action, handler) {
  registerAction(action, function (element) {
    if (!isDebugUser()) {
      console.warn("Debug action blocked:", action);
      return;
    }
    return handler(element);
  });
}

function readDebugPokemonField(panel, field) {
  var input = panel ? panel.querySelector('[data-debug-pokemon-field="' + field + '"]') : null;
  return input ? String(input.value || "").trim() : "";
}

function parsePositiveInteger(value, label, errors) {
  var normalized = String(value || "").replace(/\D/g, "");
  var number = Number(normalized);
  if (!normalized || !Number.isFinite(number) || number <= 0) {
    errors.push(label + " non valido.");
    return 0;
  }
  return Math.floor(number);
}

function parseMoveNumber(value) {
  var number = Number(String(value || "").trim());
  if (!Number.isFinite(number)) {
    return 0;
  }
  return Math.floor(number);
}

function resolveMoveConstant(name, errors) {
  var move = MoveConstants[name];
  if (!move || !Number.isFinite(Number(move.index))) {
    errors.push("Mossa non trovata: " + name + ".");
    return null;
  }
  return move;
}

function resolveHeldItemConstant(name, errors) {
  var item;
  if (!name) {
    return null;
  }
  item = ItemConstants[name];
  if (!item || !Number.isFinite(Number(item.index))) {
    errors.push("Strumento non trovato: " + name + ".");
    return null;
  }
  return item;
}

function buildDebugPokemonMoves(panel, errors) {
  var moves = [];
  [0, 1, 2, 3].forEach(function (index) {
    var name = readDebugPokemonField(panel, "move-name-" + index);
    var moveDef;
    if (!name) {
      return;
    }
    moveDef = resolveMoveConstant(name, errors);
    if (!moveDef) {
      return;
    }
    moves.push(Engine.createMove(moveDef, {
      power: parseMoveNumber(readDebugPokemonField(panel, "move-power-" + index)),
      stats: parseMoveNumber(readDebugPokemonField(panel, "move-stats-" + index))
    }));
  });
  return moves;
}

function buildDebugPokemonFallbackMove() {
  return Engine.createMove(MoveConstants.Azione, {
    power: 10,
    stats: 0
  });
}

export function createDebugPokemonFromPanel(panel) {
  var errors = [];
  var speciesKey = readDebugPokemonField(panel, "species-key");
  var speciesData = SPECIES_LIBRARY[speciesKey];
  var level = parsePositiveInteger(readDebugPokemonField(panel, "level"), "Livello", errors);
  var maxHp = parsePositiveInteger(readDebugPokemonField(panel, "max-hp"), "PS", errors);
  var heldItem = resolveHeldItemConstant(readDebugPokemonField(panel, "held-item"), errors);
  var moves = buildDebugPokemonMoves(panel, errors);
  var pokemon;

  if (!speciesData) {
    errors.push("Specie non trovata: " + speciesKey + ".");
  }
  if (level > 100) {
    errors.push("Il livello massimo è 100.");
  }
  if (level && level < DEBUG_POKEMON_MIN_LEVEL) {
    errors.push("Il livello minimo è 5.");
  }
  if (maxHp > DEBUG_POKEMON_MAX_HP) {
    errors.push("I PS massimi sono 999.");
  }
  moves.forEach(function (move) {
    if (move.power < 0 || move.power > DEBUG_POKEMON_MAX_POWER) {
      errors.push("La potenza delle mosse deve essere compresa tra 0 e 999.");
    }
    if (move.stats < 0 || move.stats > DEBUG_POKEMON_MAX_STATS) {
      errors.push("Le statistiche delle mosse devono essere comprese tra 0 e 999.");
    }
  });
  if (errors.length) {
    return { ok: false, errors: errors };
  }

  pokemon = Engine.createPokemonFromSpecies(speciesKey, level, {
    maxHp: maxHp,
    moveDefs: []
  });
  pokemon.moves = moves.length ? moves : [buildDebugPokemonFallbackMove()];
  pokemon.heldItemIndex = heldItem ? heldItem.index : 0;
  return {
    ok: true,
    pokemon: pokemon,
    semantic: {
      speciesKey: String(speciesKey),
      level: level,
      maxHp: maxHp,
      heldItemIndex: pokemon.heldItemIndex,
      moves: pokemon.moves.map(function (move) {
        return { moveIndex: move.index, power: move.power, stats: move.stats };
      })
    }
  };
}

function applyAuthoritativePlayerState(playerState) {
  applyPlayerSave(saveFromAuthoritativeProjection(playerState));
  broadcastTeamBoxRuntimeState();
  render();
}

async function applyAuthoritativeDebugResult(result, title) {
  var playerState = authoritativeDebugPlayerState(result);
  if (playerState) {
    applyAuthoritativePlayerState(playerState);
    if (result.projection && result.projection.conflict === "player_revision") {
      openInlineMessage(["Lo stato del giocatore è stato riallineato. Ora puoi riprovare il comando debug."], { title: title });
      return false;
    }
    return true;
  }
  if (result && result.code === "revision_conflict") {
    var refreshed = await getCurrentPlayerState();
    if (refreshed.ok && refreshed.projection && refreshed.projection.has_player) {
      applyAuthoritativePlayerState(refreshed.projection);
      openInlineMessage(["Lo stato del giocatore è cambiato. Dati aggiornati: riprova il comando debug."], { title: title });
      return false;
    }
    openInlineMessage(["Lo stato del giocatore è cambiato e non è stato possibile aggiornarlo. Ricarica prima di riprovare."], { title: title });
    return false;
  }
  if (!result || !result.ok) {
    openInlineMessage([result && result.message || "Comando debug non riuscito."], { title: title });
    return false;
  }
  openInlineMessage(["La risposta debug non contiene lo stato canonico del giocatore."], { title: title });
  return false;
}

registerDebugAction("trainer-debug-add-money", async function () {
  var result = await adjustAuthoritativeDebugMoney({ expectedPlayerRevision: state.authoritativeRevision, delta: 1000000 });
  await applyAuthoritativeDebugResult(result, "Debug denaro");
  return;
});

registerDebugAction("trainer-debug-add-battle-points", async function () {
  if (authoritativeDebugBattlePointsPending) return;
  authoritativeDebugBattlePointsPending = true;
  render();
  try {
    var result = await addAuthoritativeDebugBattlePoints({ expectedPlayerRevision: state.authoritativeRevision });
    await applyAuthoritativeDebugResult(result, "Debug PL");
  } finally {
    authoritativeDebugBattlePointsPending = false;
    render();
  }
  return;
});

registerDebugAction("trainer-debug-adjust-badges", async function (element) {
  var delta = Number(element.dataset.delta) || 0;
  var result = await adjustAuthoritativeDebugBadges({ expectedPlayerRevision: state.authoritativeRevision, delta: delta });
  await applyAuthoritativeDebugResult(result, "Debug medaglie");
  return;
});

registerDebugAction("trainer-debug-create-pokemon", async function (element) {
  var panel = element ? element.closest(".trainer-debug-pokemon-panel") : null;
  var errors = [];
  var result = createDebugPokemonFromPanel(panel);

  if (state.team.length >= TEAM_MAX) {
    errors.push("La squadra è piena.");
  }
  errors = errors.concat(result.errors || []);
  if (errors.length) {
    openInlineMessage(errors, { title: "Debug Pokémon" });
    return;
  }

  var commandResult = await createAuthoritativeDebugPokemon({
    expectedPlayerRevision: state.authoritativeRevision,
    pokemon: result.semantic
  });
  await applyAuthoritativeDebugResult(commandResult, "Debug Pokémon");
  return;
});

async function handleDebugAddItem(element) {
  var itemIndex = Number(element.dataset.itemIndex);
  var item = getItemByIndex(itemIndex);
  if (!item) {
    return;
  }
  if (authoritativeDebugInventoryPending) {
    return;
  }
  authoritativeDebugInventoryPending = true;
  root.querySelectorAll('[data-action="debug-add-item"], [data-action="shopping-center-debug-add-item"]').forEach(function(buttonElement) {
    buttonElement.disabled = true;
  });
  try {
    var result = await adjustAuthoritativeDebugInventory({
      expectedPlayerRevision: state.authoritativeRevision,
      itemIndex: item.index,
      delta: 50
    });
    await applyAuthoritativeDebugResult(result, "Debug strumenti");
  } finally {
    authoritativeDebugInventoryPending = false;
    root.querySelectorAll('[data-action="debug-add-item"], [data-action="shopping-center-debug-add-item"]').forEach(function(buttonElement) {
      buttonElement.disabled = false;
    });
  }
  return;
}

registerDebugAction("debug-add-item", function (element) {
  return handleDebugAddItem(element);
});

registerDebugAction("shopping-center-debug-add-item", function (element) {
  return handleDebugAddItem(element);
});
