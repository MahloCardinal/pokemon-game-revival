import { registerAction } from "./action-registry.js";
import { enforceBattleRuntimeSceneLock } from "./battle-scene-lock.js";
import { openMessage } from "./dialog-handler.js";
import { render } from "./renderer.js";
import { saveAfterStateChange } from "./save-runtime.js";
import { applyPlayerSave, root, state, registerPokedexPokemon } from "./game-state.js";
import * as Engine from "../engine/index.js";
import { getItemByIndex, getResolvedInventoryItem, resolveInventoryItems, ItemCategory, ItemSubcategory, itemCanTriggerEvolution, pokemonCanHoldItem } from "../data/items.js";
import { clampToLimits, maxHpForLevel, maxPowerForLevel, maxStatsForLevel } from "../data/index.js";
import { adjustInventoryItemQuantity, markTeamRuntimeStateChanged } from "./runtime-state.js";
import { renderPokemonCenterItemPanelContent, renderPokemonCenterMoveButton } from "../view/pokemon-center.js";

var findHeldItemAssignmentViolation = Engine.findHeldItemAssignmentViolation;
import { queueGlobalActivityEvent } from "./activity-feed-runtime.js";
import { createMissionEventKey, recordMissionEvent } from "./mission-runtime.js";
import { executePokemonCenterCommandAuthoritative, executePokemonCenterMoveTutorAuthoritative } from "../api/player-command.js";
import { saveFromAuthoritativeProjection } from "../api/player.js";
import {
  pokemonCenterMode,
  pokemonCenterModeConfig,
  pokemonCenterLimit,
  pokemonCenterMoveMatchesItem,
  pokemonCenterPokemonDisplayState,
  pokemonCenterPokemonMatchesItem,
  pokemonCenterTargetMode
} from "./pokemon-center-rules.js";

var authoritativePokemonCenterCommandPending = false;
var pokemonCenterChoicePopupPositioner = null;

function clearPokemonCenterChoicePopup() {
  var popup = root.querySelector(".pokemon-center-choice-popup");
  if (popup) popup.remove();
  if (pokemonCenterChoicePopupPositioner) {
    window.removeEventListener("resize", pokemonCenterChoicePopupPositioner);
    window.removeEventListener("scroll", pokemonCenterChoicePopupPositioner, true);
    pokemonCenterChoicePopupPositioner = null;
  }
}

function positionPokemonCenterChoicePopup(popup, card) {
  var cardRect = card.getBoundingClientRect();
  var moves = card.querySelector(".pokemon-center-card-moves");
  var movesRect = moves ? moves.getBoundingClientRect() : null;
  var viewportPadding = 8;
  var gap = 10;
  var popupRect;
  var topLimit;
  var left;
  popup.classList.remove("is-above-moves");
  popup.style.left = "0px";
  popup.style.top = "0px";
  popup.style.maxHeight = "";
  popupRect = popup.getBoundingClientRect();
  if (popup.classList.contains("is-move-replacement-notice") && movesRect) {
    popup.style.width = Math.max(0, movesRect.width - 16) + "px";
    popupRect = popup.getBoundingClientRect();
    popup.style.left = movesRect.left + (movesRect.width - popupRect.width) / 2 + "px";
    popup.style.top = Math.max(viewportPadding, movesRect.top - gap - popupRect.height) + "px";
    return;
  }
  if (window.innerWidth > 680 && cardRect.right + gap + popupRect.width <= window.innerWidth - viewportPadding) {
    left = cardRect.right + gap;
  } else if (window.innerWidth > 680 && cardRect.left - gap - popupRect.width >= viewportPadding) {
    left = cardRect.left - gap - popupRect.width;
  } else {
    topLimit = (movesRect ? movesRect.top : cardRect.bottom) - gap;
    popup.classList.add("is-above-moves");
    popup.style.left = Math.max(viewportPadding, Math.min(cardRect.left, window.innerWidth - popupRect.width - viewportPadding)) + "px";
    popup.style.top = topLimit - popupRect.height + "px";
    return;
  }
  popup.style.left = left + "px";
  popup.style.top = Math.max(viewportPadding, Math.min(cardRect.top, window.innerHeight - popupRect.height - viewportPadding)) + "px";
}

function syncPokemonCenterChoicePopup() {
  var scene = state.scene;
  var pending = scene && scene.name === "pokemon-center" ? scene.pendingAction : null;
  var pokemonIndex = pending ? Number(pending.pokemonIndex) : NaN;
  var card;
  var pokemon;
  var popup;
  var title;
  var list;
  var candidates;
  clearPokemonCenterChoicePopup();
  if (!pending || !Number.isFinite(pokemonIndex)) return;
  if (["choose-tutor-move", "replace-tm-move", "replace-tutor-move"].indexOf(pending.type) === -1) return;
  card = root.querySelectorAll(".pokemon-center-card-frame > .pokemon-card")[pokemonIndex];
  pokemon = state.team[pokemonIndex];
  if (!card || !pokemon) return;
  popup = document.createElement("section");
  popup.className = "pokemon-center-choice-popup";
  popup.setAttribute("aria-live", "polite");
  if (pending.type === "choose-tutor-move") {
    title = document.createElement("p");
    title.className = "pokemon-center-choice-popup-title";
    title.textContent = "Scegli la mossa da insegnare";
    popup.appendChild(title);
    list = document.createElement("div");
    list.className = "pokemon-center-choice-popup-list";
    candidates = Engine.pokemonMoveTutorPool(pokemon).slice().sort(function (first, second) {
      return first.name.localeCompare(second.name, "it");
    });
    candidates.forEach(function (move) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "pokemon-center-choice-popup-button";
      button.dataset.action = "pokemon-center-tutor-move-pick";
      button.dataset.index = String(pokemonIndex);
      button.dataset.moveIndex = String(move.index);
      button.textContent = move.name;
      list.appendChild(button);
    });
    popup.appendChild(list);
  } else {
    popup.classList.add("is-move-replacement-notice");
    title = document.createElement("p");
    title.className = "pokemon-center-choice-popup-notice";
    title.textContent = "Seleziona la mossa da dimenticare";
    popup.appendChild(title);
  }
  root.appendChild(popup);
  pokemonCenterChoicePopupPositioner = function () {
    if (!popup.isConnected) return;
    positionPokemonCenterChoicePopup(popup, card);
  };
  pokemonCenterChoicePopupPositioner();
  window.addEventListener("resize", pokemonCenterChoicePopupPositioner);
  window.addEventListener("scroll", pokemonCenterChoicePopupPositioner, true);
}

function renderPokemonCenter() {
  clearPokemonCenterChoicePopup();
  render();
  syncPokemonCenterChoicePopup();
}

function pokemonCenterCompatibility(pokemon, item) {
  return {
    canLearnTM: Engine.pokemonCanLearnTM(pokemon, item),
    hasItemEvolution: Boolean(Engine.itemEvolutionForPokemon(pokemon, item))
  };
}

function pokemonCenterCommandError(message) {
  var text = String(message || "");
  if (/canonical Pokemon HP exceeds its catalog cap|canonical Pokemon moves are invalid/i.test(text)) {
    return "I dati del Pokemon non rispettano i limiti previsti.";
  }
  if (/Pokemon must be in the current team/i.test(text)) return "Il Pokemon deve essere nella squadra attuale.";
  if (/Pokemon has a pending resolution/i.test(text)) return "Il Pokemon ha una decisione in sospeso.";
  if (/item is not available in inventory/i.test(text)) return "Lo strumento non e disponibile nello zaino.";
  if (/Pokemon cannot learn (this MT|the selected tutor move)/i.test(text)) return "Il Pokemon non puo imparare questa mossa.";
  if (/vitamin would have no valid effect|vitamin would have no effect on the selected move/i.test(text)) {
    return "Lo strumento non avrebbe effetto.";
  }
  if (/Pokemon is not compatible with the held item/i.test(text)) return "Il Pokemon non e compatibile con questo strumento.";
  if (/Pokemon already holds this item/i.test(text)) return "Il Pokemon possiede gia questo strumento.";
  return "Impossibile completare l'operazione nel Centro Pokemon.";
}

function pokemonCenterTargetIsSelectable(scene, mode, item, pokemon, pokemonIndex, targetKind, move, compatibility) {
  var targetMode = pokemonCenterTargetMode(scene, mode, item);
  if (targetKind === "move") {
    return pokemonCenterMoveMatchesItem(scene, mode, item, pokemon, pokemonIndex, move);
  }
  return targetMode === "pokemon" || targetMode === "compatible-pokemon"
    ? pokemonCenterPokemonMatchesItem(mode, item, pokemon, compatibility)
    : false;
}

registerAction("pokemon-center-mode", function(element) {
    if (enforceBattleRuntimeSceneLock()) {
      return;
    }
    setPokemonCenterMode(element.dataset.mode);
    return;

});

registerAction("pokemon-center-notice-ok", function(element) {
    var scene = state.scene;
    if (!scene || scene.name !== "pokemon-center") {
      return;
    }
    clearPokemonCenterAfterAction(scene, "");
    updatePokemonCenterModeDom();
    return;

});

registerAction("pokemon-center-pokemon-pick", function(element) {
    if (enforceBattleRuntimeSceneLock()) {
      return;
    }
    if (state.scene && state.scene.name === "pokemon-center") {
      selectPokemonCenterTarget("pokemon", Number(element.dataset.index), null);
    }
    return;

});

registerAction("pokemon-center-move-pick", function(element) {
    if (enforceBattleRuntimeSceneLock()) {
      return;
    }
    if (state.scene && state.scene.name === "pokemon-center") {
      selectPokemonCenterTarget("move", Number(element.dataset.index), Number(element.dataset.moveIndex));
    }
    return;

});

registerAction("pokemon-center-item-pick", function(element) {
    if (enforceBattleRuntimeSceneLock()) {
      return;
    }
    if (state.scene && state.scene.name === "pokemon-center") {
      selectPokemonCenterItem(Number(element.dataset.itemIndex));
    }
    return;

});

registerAction("pokemon-center-item-cancel", function() {
    if (enforceBattleRuntimeSceneLock()) {
      return;
    }
    cancelPokemonCenterItemSelection();
    return;

});

registerAction("pokemon-center-held-item-remove", function(element) {
    if (enforceBattleRuntimeSceneLock()) {
      return;
    }
    removeHeldItemFromPokemonCenter(Number(element.dataset.index));
    return;

});

registerAction("pokemon-center-tutor-move-pick", function(element) {
  var scene = state.scene;
  var pokemonIndex = Number(element.dataset.index);
  var moveIndex = Number(element.dataset.moveIndex);
  var pokemon = state.team[pokemonIndex];
  var item = scene ? getResolvedInventoryItem(state.inventory, scene.itemIndex) : null;
  var candidate;
  if (enforceBattleRuntimeSceneLock() || !scene || scene.name !== "pokemon-center" || !pokemon || !item || false) return;
  if (!scene.pendingAction || scene.pendingAction.type !== "choose-tutor-move" || Number(scene.pendingAction.pokemonIndex) !== pokemonIndex) return;
  candidate = Engine.pokemonMoveTutorPool(pokemon).find(function (move) { return Number(move.index) === moveIndex; });
  if (!candidate) return;
  if (pokemon.moves.length < 4) {
    clearPokemonCenterChoicePopup();
    runAuthoritativePokemonCenterTutorCommand(pokemon, item, candidate, null);
    return;
  }
  scene.targetKind = "move";
  scene.pokemonIndex = pokemonIndex;
  scene.moveIndex = null;
  scene.pendingAction = { type: "replace-tutor-move", pokemonIndex: pokemonIndex, itemIndex: item.index, tutorMoveIndex: candidate.index };
  renderPokemonCenter();
});

registerAction("pokemon-center-evolution-choose", function(element) {
  var dialog = state.dialog;
  var target;
  if (!dialog || dialog.type !== "pokemon-center-evolution") return;
  target = (dialog.targets || []).find(function (entry) {
    return entry.speciesKey === element.dataset.speciesKey;
  });
  if (!target) return;
  state.dialog = null;
  runAuthoritativePokemonCenterCommand({
    operation: "evolve",
    pokemon: dialog.pokemon,
    item: dialog.item,
    evolutionTargetSpeciesKey: element.dataset.speciesKey
  }, dialog.pokemon.name + " si evolve in " + target.name + " usando " + dialog.item.name + ".");
});

registerAction("pokemon-center-evolution-decline", function() {
  var dialog = state.dialog;
  if (!dialog || dialog.type !== "pokemon-center-evolution") return;
  state.dialog = null;
  clearPokemonCenterAfterAction(state.scene, dialog.pokemon.name + " non si evolve.");
  renderPokemonCenter();
});

async function runAuthoritativePokemonCenterCommand(input, notice) {
  var scene = state.scene;
  var result;
  if (!scene || scene.name !== "pokemon-center" || authoritativePokemonCenterCommandPending) return false;
  if (!input.pokemon || !input.pokemon.instanceId || !input.item) {
    openMessage(["Identità autorevole del Pokemon o dello strumento mancante."], { title: "Centro Pokemon" });
    return false;
  }
  authoritativePokemonCenterCommandPending = true;
  clearPokemonCenterChoicePopup();
  try {
    result = await executePokemonCenterCommandAuthoritative({
      expectedRevision: state.authoritativeRevision,
      pokemonInstanceId: input.pokemon.instanceId,
      operation: input.operation,
      itemIndex: input.item.index,
      replacementSlot: input.replacementSlot,
      evolutionTargetSpeciesKey: input.evolutionTargetSpeciesKey
    });
    if (!result.ok) {
      openMessage([pokemonCenterCommandError(result.message)], { title: "Centro Pokemon" });
      return false;
    }
    applyPlayerSave(saveFromAuthoritativeProjection(result.projection));
    clearPokemonCenterAfterAction(scene, notice);
    state.saveStatus = { state: "saved", message: "" };
    renderPokemonCenter();
    return true;
  } finally {
    authoritativePokemonCenterCommandPending = false;
  }
}

async function runAuthoritativePokemonCenterTutorCommand(pokemon, item, move, replacementSlot) {
  var scene = state.scene;
  var result;
  if (!scene || scene.name !== "pokemon-center" || authoritativePokemonCenterCommandPending) return false;
  authoritativePokemonCenterCommandPending = true;
  clearPokemonCenterChoicePopup();
  try {
    result = await executePokemonCenterMoveTutorAuthoritative({ expectedRevision: state.authoritativeRevision, pokemonInstanceId: pokemon.instanceId, itemIndex: item.index, moveIndex: move.index, replacementSlot: replacementSlot });
    if (!result.ok) {
      openMessage([pokemonCenterCommandError(result.message)], { title: "Centro Pokemon" });
      return false;
    }
    applyPlayerSave(saveFromAuthoritativeProjection(result.projection));
    clearPokemonCenterAfterAction(scene, pokemon.name + " impara " + move.name + " usando " + item.name + ".");
    state.saveStatus = { state: "saved", message: "" };
    renderPokemonCenter();
    return true;
  } finally { authoritativePokemonCenterCommandPending = false; }
}

function setPokemonCenterMode(mode) {
  if (!state.scene || state.scene.name !== "pokemon-center") {
    return;
  }
  state.scene.centerMode = ["assign-held", "use-item", "use-tm"].indexOf(mode) !== -1 ? mode : "assign-held";
  state.scene.pokemonIndex = null;
  state.scene.moveIndex = null;
  state.scene.targetKind = "pokemon";
  state.scene.itemIndex = null;
  state.scene.notice = "";
  state.scene.pendingAction = null;
  updatePokemonCenterModeDom();
}

function updatePokemonCenterModeDom() {
  var scene = state.scene;
  var mode = pokemonCenterMode(scene);
  var modeConfig = pokemonCenterModeConfig(mode);
  var selectedPokemonIndex = scene && scene.pokemonIndex !== null && scene.pokemonIndex !== undefined ? Number(scene.pokemonIndex) : NaN;
  var selectedMoveIndex = scene && scene.moveIndex !== null && scene.moveIndex !== undefined ? Number(scene.moveIndex) : NaN;
  var selectedItemIndex = scene && scene.itemIndex !== null && scene.itemIndex !== undefined ? Number(scene.itemIndex) : NaN;
  var selectedTargetKind = scene && scene.targetKind === "move" ? "move" : "pokemon";
  var selectedItem = getResolvedInventoryItem(state.inventory, selectedItemIndex);
  var targetTitle = root.querySelector(".pokemon-center-target-panel .stack-title");
  var itemPanelInner = root.querySelector(".pokemon-center-item-panel .panel-inner");
  var availableItems = resolveInventoryItems(state.inventory).filter(modeConfig.itemFilter);
  var hasNotice = Boolean(scene && scene.notice);
  if (targetTitle) {
    targetTitle.textContent = modeConfig.pokemonTitle;
  }
  root.querySelectorAll('[data-action="pokemon-center-mode"]').forEach(function (btn) {
    var isSelected = btn.dataset.mode === mode;
    btn.classList.toggle("button-primary", isSelected);
    btn.classList.toggle("button-ghost", !isSelected);
  });
  root.querySelectorAll(".pokemon-center-card-frame > .pokemon-card").forEach(function (card, pokemonIndex) {
    var pokemon = state.team[pokemonIndex];
    var moveList = card.querySelector(".pokemon-center-card-moves");
    var displayState = pokemonCenterPokemonDisplayState(scene, mode, selectedItem, pokemon, pokemonIndex, pokemonCenterCompatibility(pokemon, selectedItem));
    if (displayState.clickable) {
      card.dataset.action = "pokemon-center-pokemon-pick";
      card.dataset.index = String(pokemonIndex);
      card.setAttribute("role", "button");
      card.tabIndex = 0;
    } else {
      card.removeAttribute("data-action");
      card.removeAttribute("data-index");
      card.removeAttribute("role");
      card.removeAttribute("tabindex");
    }
    card.classList.toggle("is-target-clickable", displayState.clickable);
    card.classList.toggle("is-target-muted", displayState.muted);
    card.classList.toggle("is-target-body-muted", displayState.bodyMuted);
    if (moveList && pokemon) {
      moveList.innerHTML = pokemon.moves.map(function (move, moveIndex) {
        return renderPokemonCenterMoveButton(move, pokemonIndex, moveIndex, mode, selectedItem, selectedTargetKind, selectedPokemonIndex, selectedMoveIndex, scene, state.team);
      }).join("");
    }
  });
  if (itemPanelInner) {
    itemPanelInner.classList.toggle("has-item-prompt", Boolean(selectedItem) && !hasNotice);
    itemPanelInner.classList.toggle("has-item-notice", hasNotice);
    itemPanelInner.innerHTML = renderPokemonCenterItemPanelContent(mode, modeConfig, availableItems, selectedItemIndex, scene, state.inventory);
  }
  updatePokemonCenterInteractiveState();
  syncPokemonCenterChoicePopup();
}

function updatePokemonCenterInteractiveState() {
  var scene = state.scene;
  var mode = pokemonCenterMode(scene);
  var selectedItemIndex = scene && scene.itemIndex !== null && scene.itemIndex !== undefined ? Number(scene.itemIndex) : NaN;
  var item = getResolvedInventoryItem(state.inventory, selectedItemIndex);
  if (!scene || scene.name !== "pokemon-center") return;
  root.querySelectorAll(".pokemon-center-card-frame > .pokemon-card").forEach(function (card, pokemonIndex) {
    var pokemon = state.team[pokemonIndex];
    var moveList = card.querySelector(".pokemon-center-card-moves");
    var displayState = pokemonCenterPokemonDisplayState(scene, mode, item, pokemon, pokemonIndex, pokemonCenterCompatibility(pokemon, item));
    if (displayState.clickable) {
      card.dataset.action = "pokemon-center-pokemon-pick";
      card.dataset.index = String(pokemonIndex);
      card.setAttribute("role", "button");
      card.tabIndex = 0;
    } else {
      card.removeAttribute("data-action");
      card.removeAttribute("data-index");
      card.removeAttribute("role");
      card.removeAttribute("tabindex");
    }
    card.classList.toggle("is-target-clickable", displayState.clickable);
    card.classList.toggle("is-target-muted", displayState.muted);
    card.classList.toggle("is-target-body-muted", displayState.bodyMuted);
    if (moveList && pokemon) {
      moveList.innerHTML = pokemon.moves.map(function (move, moveIndex) {
        return renderPokemonCenterMoveButton(
          move, pokemonIndex, moveIndex, mode, item,
          scene.targetKind === "move" ? "move" : "pokemon",
          scene.pokemonIndex, scene.moveIndex,
          scene, state.team
        );
      }).join("");
    }
    card.classList.toggle("is-selected",
      scene.targetKind !== "move" && Number(card.dataset.index) === scene.pokemonIndex
    );
  });
  root.querySelectorAll(".pokemon-center-move-button").forEach(function (btn) {
    btn.classList.toggle("is-selected",
      scene.targetKind === "move" && Number(btn.dataset.index) === scene.pokemonIndex && Number(btn.dataset.moveIndex) === scene.moveIndex
    );
  });
  root.querySelectorAll(".pokemon-center-item-button").forEach(function (btn) {
    btn.classList.toggle("is-selected", Number(btn.dataset.itemIndex) === scene.itemIndex);
  });
}

function clearPokemonCenterTarget(scene) {
  scene.pokemonIndex = null;
  scene.moveIndex = null;
  scene.targetKind = "pokemon";
}

function clearPokemonCenterAfterAction(scene, notice) {
  clearPokemonCenterTarget(scene);
  scene.itemIndex = null;
  scene.notice = notice || "";
  scene.pendingAction = null;
}

function applyPokemonCenterPendingRemove(scene) {
  var pokemonIndex = scene && scene.pendingAction ? Number(scene.pendingAction.pokemonIndex) : NaN;
  var pokemon = Number.isFinite(pokemonIndex) ? state.team[pokemonIndex] : null;
  var heldItemIndex = pokemon ? Number(pokemon.heldItemIndex) || 0 : 0;
  var heldItem = heldItemIndex ? getItemByIndex(heldItemIndex) : null;
  if (!scene || scene.name !== "pokemon-center" || !pokemon || !heldItem) {
    return false;
  }
  runAuthoritativePokemonCenterCommand({ operation: "remove_held", pokemon: pokemon, item: heldItem }, heldItem.name + " torna nello zaino.");
  return true;
}

function applyPokemonCenterConfirmedSelection(mode, pokemonIndex, itemIndex, targetKind, moveIndex) {
  var pokemon = state.team[pokemonIndex];
  var item = getResolvedInventoryItem(state.inventory, itemIndex);
  var scene = state.scene;
  if (!pokemon || !item) {
    return;
  }
  if (mode === "use-tm") {
    if (targetKind === "move") {
      replacePokemonCenterTMMoveInline(pokemon, item, moveIndex);
      return;
    }
    teachPokemonCenterTMInline(pokemon, item, pokemonIndex);
    return;
  }
  if (mode === "assign-held") {
    assignHeldItemToPokemonInline(pokemon, item, pokemonIndex);
    return;
  }
  if (mode === "use-item") {
    if (item.category === ItemCategory.Item && item.subcategory === ItemSubcategory.MoveTutor) {
      if (targetKind === "move" && scene.pendingAction && scene.pendingAction.type === "replace-tutor-move") {
        var candidate = Engine.pokemonMoveTutorPool(pokemon).find(function (entry) { return Number(entry.index) === Number(scene.pendingAction.tutorMoveIndex); });
        if (candidate) runAuthoritativePokemonCenterTutorCommand(pokemon, item, candidate, Number(moveIndex));
        return;
      }
      scene.pendingAction = { type: "choose-tutor-move", pokemonIndex: Number(pokemonIndex), itemIndex: item.index };
      scene.pokemonIndex = Number(pokemonIndex);
      scene.targetKind = "pokemon";
      renderPokemonCenter();
      return;
    }
    if (item.category === ItemCategory.Vitamin) {
      useVitaminOnPokemonInline(pokemon, item, pokemonIndex, targetKind, moveIndex);
      return;
    }
    useEvolutionItemOnPokemonInline(pokemon, item);
    return;
  }
}

function createPokemonCenterTMMove(item, pokemon) {
  if (!item || item.category !== ItemCategory.TM || !item.move || !pokemon) {
    return null;
  }
  var maxPower = 0;
  var maxStats = 0;
  (pokemon.moves || []).forEach(function (move) {
    if (move) {
      if (move.power > maxPower) maxPower = move.power;
      if (move.stats > maxStats) maxStats = move.stats;
    }
  });
  if (!maxPower) maxPower = Engine.powerForLevel(pokemon.level);
  if (!maxStats) maxStats = Engine.statsForLevel(pokemon.level);
  return Engine.createMove(item.move, {
    power: maxPower,
    stats: maxStats
  });
}

function teachPokemonCenterTMInline(pokemon, item, pokemonIndex) {
  var scene = state.scene;
  var move = createPokemonCenterTMMove(item, pokemon);
  if (!move || !Engine.pokemonCanLearnTM(pokemon, item)) {
    clearPokemonCenterAfterAction(scene, item.name + " non può essere insegnata a " + pokemon.name + ".");
    updatePokemonCenterModeDom();
    return;
  }
  if (pokemon.moves.length < 4) {
    runAuthoritativePokemonCenterCommand({ operation: "teach_tm", pokemon: pokemon, item: item }, pokemon.name + " impara " + move.name + ".");
    return;
  }
  if (pokemon.moves.length < 4) {
    pokemon.moves.push(move);
    clampToLimits(pokemon);
    markTeamRuntimeStateChanged();
    clearPokemonCenterAfterAction(scene, pokemon.name + " impara " + move.name + ".");
    saveAfterStateChange("tm_use");
    renderPokemonCenter();
    return;
  }
  scene.targetKind = "move";
  scene.pokemonIndex = Number(pokemonIndex);
  scene.moveIndex = null;
  scene.notice = "";
  scene.pendingAction = {
    type: "replace-tm-move",
    pokemonIndex: Number(pokemonIndex),
    itemIndex: item.index
  };
  renderPokemonCenter();
}

function replacePokemonCenterTMMoveInline(pokemon, item, moveIndex) {
  var scene = state.scene;
  var oldMove = pokemon && pokemon.moves ? pokemon.moves[Number(moveIndex)] : null;
  var newMove = createPokemonCenterTMMove(item, pokemon);
  if (
    !scene
      || !scene.pendingAction
      || scene.pendingAction.type !== "replace-tm-move"
      || !pokemon
      || !oldMove
      || !newMove
      || Number(scene.pendingAction.itemIndex) !== Number(item.index)
  ) {
    return;
  }
  runAuthoritativePokemonCenterCommand({
    operation: "teach_tm",
    pokemon: pokemon,
    item: item,
    replacementSlot: Number(moveIndex)
  }, pokemon.name + " dimentica " + oldMove.name + " e impara " + newMove.name + ".");
  return;
}

function selectPokemonCenterTarget(targetKind, pokemonIndex, moveIndex) {
  var scene = state.scene;
  var nextTargetKind = targetKind === "move" ? "move" : "pokemon";
  var nextMoveIndex = nextTargetKind === "move" ? moveIndex : null;
  var mode = pokemonCenterMode(scene);
  var item;
  var pokemon;
  var move;
  if (!scene || scene.name !== "pokemon-center") {
    return;
  }
  item = getResolvedInventoryItem(state.inventory, scene.itemIndex);
  pokemon = state.team[pokemonIndex];
  move = nextTargetKind === "move" && pokemon ? pokemon.moves[Number(nextMoveIndex)] : null;
  if (!pokemonCenterTargetIsSelectable(scene, mode, item, pokemon, pokemonIndex, nextTargetKind, move, pokemonCenterCompatibility(pokemon, item))) {
    return;
  }
  scene.targetKind = nextTargetKind;
  scene.pokemonIndex = pokemonIndex;
  scene.moveIndex = nextMoveIndex;
  scene.notice = "";
  applyPokemonCenterConfirmedSelection(mode, pokemonIndex, item.index, nextTargetKind, nextMoveIndex);
}

function selectPokemonCenterItem(itemIndex) {
  var scene = state.scene;
  var mode = pokemonCenterMode(scene);
  var nextItemIndex = Number(itemIndex);
  var nextItem;
  if (!scene || scene.name !== "pokemon-center") {
    return;
  }
  if (scene.itemIndex === nextItemIndex) {
    scene.itemIndex = null;
    scene.notice = "";
    scene.pendingAction = null;
    clearPokemonCenterTarget(scene);
    updatePokemonCenterModeDom();
    return;
  }
  scene.itemIndex = nextItemIndex;
  scene.notice = "";
  scene.pendingAction = null;
  nextItem = getResolvedInventoryItem(state.inventory, nextItemIndex);
  if (
    scene.pokemonIndex !== null &&
    scene.pokemonIndex !== undefined &&
    !pokemonCenterTargetIsSelectable(
      scene, mode, nextItem, state.team[Number(scene.pokemonIndex)],
      Number(scene.pokemonIndex), scene.targetKind || "pokemon",
      scene.targetKind === "move" && state.team[Number(scene.pokemonIndex)] ? state.team[Number(scene.pokemonIndex)].moves[Number(scene.moveIndex)] : null,
      pokemonCenterCompatibility(state.team[Number(scene.pokemonIndex)], nextItem)
    )
  ) {
    clearPokemonCenterTarget(scene);
  }
  updatePokemonCenterModeDom();
}

function cancelPokemonCenterItemSelection() {
  var scene = state.scene;
  if (!scene || scene.name !== "pokemon-center") {
    return;
  }
  scene.itemIndex = null;
  scene.notice = "";
  scene.pendingAction = null;
  clearPokemonCenterTarget(scene);
  updatePokemonCenterModeDom();
}

function removeHeldItemFromPokemonCenter(pokemonIndex) {
  var scene = state.scene;
  var pokemon = state.team[Number(pokemonIndex)];
  var heldItemIndex = pokemon ? Number(pokemon.heldItemIndex) || 0 : 0;
  var heldItem = heldItemIndex ? getItemByIndex(heldItemIndex) : null;
  if (!scene || scene.name !== "pokemon-center" || !pokemon || !heldItem) {
    return;
  }
  scene.pendingAction = { type: "remove-held", pokemonIndex: Number(pokemonIndex) };
  applyPokemonCenterPendingRemove(scene);
}

function assignHeldItemToPokemonInline(pokemon, item, pokemonIndex) {
  var previousItemIndex = Number(pokemon.heldItemIndex) || 0;
  var previousItem = previousItemIndex ? getItemByIndex(previousItemIndex) : null;
  var scene = state.scene;
  var violation;
  if (!item || (item.category !== ItemCategory.HeldItem && item.category !== ItemCategory.Berry)) {
    return;
  }
  if (!pokemonCanHoldItem(pokemon, item)) {
    clearPokemonCenterAfterAction(scene, pokemon.name + " non può tenere " + item.name + ".");
    updatePokemonCenterModeDom();
    return;
  }
  violation = findHeldItemAssignmentViolation(state.team, pokemon, item, pokemonIndex);
  if (violation) {
    clearPokemonCenterAfterAction(scene, violation.message);
    updatePokemonCenterModeDom();
    return;
  }
  runAuthoritativePokemonCenterCommand({ operation: "assign_held", pokemon: pokemon, item: item },
    pokemon.name + " ora tiene " + item.name + (previousItem ? ". " + previousItem.name + " torna nello zaino." : "."));
  return;
}

function useEvolutionItemOnPokemonInline(pokemon, item) {
  var evolution = item && pokemon ? Engine.itemEvolutionForPokemon(pokemon, item) : null;
  var targetEntry;
  var oldName = pokemon ? pokemon.name : "";
  var sourceSpeciesKey = pokemon ? String(pokemon.speciesKey || "") : "";
  var scene = state.scene;
  if (!itemCanTriggerEvolution(item)) {
    return;
  }
  if (!evolution) {
    clearPokemonCenterAfterAction(scene, item.name + " non ha effetto su " + pokemon.name + ".");
    updatePokemonCenterModeDom();
    return;
  }
  var targets;
  var source = Engine.findSpecies(pokemon.speciesKey);
  targets = source && source.evolution && Array.isArray(source.evolution.to)
    ? source.evolution.to.filter(function (entry) {
      return entry && entry.trigger && entry.trigger.kind === "item" && entry.trigger.item
        && Number(entry.trigger.item.index) === Number(item.index);
    }).map(function (entry) { return Engine.findSpecies(entry.species); }).filter(Boolean)
    : [];
  if (!targets.length) {
    clearPokemonCenterAfterAction(scene, "Evoluzione non trovata.");
    renderPokemonCenter();
    return;
  }
  state.dialog = {
    type: "pokemon-center-evolution",
    pokemon: pokemon,
    pokemonName: pokemon.name,
    item: item,
    itemName: item.name,
    targets: targets
  };
  renderPokemonCenter();
  return;
}

function useVitaminOnPokemonInline(pokemon, item, pokemonIndex, targetKind, moveIndex) {
  var scene = state.scene;
  var move;
  var moveValue;
  if (!item || item.category !== ItemCategory.Vitamin) {
    return;
  }
  if (item.effect === "max_hp") {
    if (pokemon.maxHp >= pokemonCenterLimit(pokemon, maxHpForLevel(pokemon.level))) {
      clearPokemonCenterAfterAction(scene, "Impossibile utilizzare, non avrebbe effetto.");
      updatePokemonCenterModeDom();
      return;
    }
    runAuthoritativePokemonCenterCommand({ operation: "use_vitamin", pokemon: pokemon, item: item }, "I PS di " + pokemon.name + " aumentano!");
    return;
  }
  if (item.effect === "move_power") {
    if (!pokemon.moves.length) {
      clearPokemonCenterAfterAction(scene, pokemon.name + " non ha mosse da potenziare.");
      updatePokemonCenterModeDom();
      return;
    }
    move = targetKind === "move" ? pokemon.moves[Number(moveIndex)] : null;
    if (!move) {
      clearPokemonCenterAfterAction(scene, "Scegli una mossa da potenziare.");
      updatePokemonCenterModeDom();
      return;
    }
    if (move.power >= pokemonCenterLimit(pokemon, maxPowerForLevel(pokemon.level))
      && move.stats >= pokemonCenterLimit(pokemon, maxStatsForLevel(pokemon.level))) {
      clearPokemonCenterAfterAction(scene, "Impossibile utilizzare, non avrebbe effetto.");
      updatePokemonCenterModeDom();
      return;
    }
    runAuthoritativePokemonCenterCommand({
      operation: "use_vitamin",
      pokemon: pokemon,
      item: item,
      replacementSlot: Number(moveIndex)
    }, "La potenza di " + move.name + " aumenta!");
    return;
  }
}
