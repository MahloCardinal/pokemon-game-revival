import { registerAction } from "./action-registry.js";
import { enforceBattleRuntimeSceneLock } from "./battle-scene-lock.js";
import { confirmMoveForget, showEvolutionResult } from "./progression-dialog.js";
import { openMessage } from "./dialog-handler.js";
import { holdDialogContent, render, renderDialogLayer } from "./renderer.js";
import { applyPlayerSave, root, state } from "./game-state.js";
import * as Engine from "../engine/index.js";
import { getItemByIndex, getResolvedInventoryItem, resolveInventoryItems, ItemCategory, ItemSubcategory, itemCanTriggerEvolution, pokemonCanHoldItem } from "../data/items.js";
import { maxHpForPokemon, maxPowerForPokemon, maxStatsForPokemon } from "../data/index.js";
import { renderPokemonCenterItemPanelContent, renderPokemonCenterMoveButton } from "../view/pokemon-center.js";
import { getLocale, messageDescriptor, t, textDescriptor } from "./i18n.js";
import { itemNameDescriptor, moveDisplayName, moveNameDescriptor, pokemonNameDescriptor, speciesNameDescriptor } from "./entity-text.js";

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
  if (pending.type !== "choose-tutor-move") return;
  card = root.querySelectorAll(".pokemon-center-card-frame > .pokemon-card")[pokemonIndex];
  pokemon = state.team[pokemonIndex];
  if (!card || !pokemon) return;
  popup = document.createElement("section");
  popup.className = "pokemon-center-choice-popup";
  popup.setAttribute("aria-live", "polite");
  title = document.createElement("p");
  title.className = "pokemon-center-choice-popup-title";
  title.textContent = t("ui.pokemonCenter.chooseTutorMove");
  popup.appendChild(title);
  list = document.createElement("div");
  list.className = "pokemon-center-choice-popup-list";
  candidates = Engine.pokemonMoveTutorPool(pokemon).slice().sort(function (first, second) {
    return moveDisplayName(first).localeCompare(moveDisplayName(second), getLocale());
  });
  candidates.forEach(function (move) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "pokemon-center-choice-popup-button";
    button.dataset.action = "pokemon-center-tutor-move-pick";
    button.dataset.index = String(pokemonIndex);
    button.dataset.moveIndex = String(move.index);
    button.textContent = moveDisplayName(move);
    list.appendChild(button);
  });
  popup.appendChild(list);
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
    return messageDescriptor("pokemonCenter.invalidData");
  }
  if (/Pokemon must be in the current team/i.test(text)) return messageDescriptor("pokemonCenter.mustBeInTeam");
  if (/Pokemon has a pending resolution/i.test(text)) return messageDescriptor("pokemonCenter.pendingResolution");
  if (/item is not available in inventory/i.test(text)) return messageDescriptor("pokemonCenter.itemUnavailable");
  if (/Pokemon cannot learn (this MT|the selected tutor move)/i.test(text)) return messageDescriptor("pokemonCenter.cannotLearn");
  if (/vitamin would have no valid effect|vitamin would have no effect on the selected move/i.test(text)) {
    return messageDescriptor("pokemonCenter.noEffect");
  }
  if (/Pokemon is not compatible with the held item/i.test(text)) return messageDescriptor("pokemonCenter.heldIncompatible");
  if (/Pokemon already holds this item/i.test(text)) return messageDescriptor("pokemonCenter.alreadyHolds");
  return messageDescriptor("pokemonCenter.commandFailed");
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
  if (enforceBattleRuntimeSceneLock() || !scene || scene.name !== "pokemon-center" || !pokemon || !item) return;
  if (!scene.pendingAction || scene.pendingAction.type !== "choose-tutor-move" || Number(scene.pendingAction.pokemonIndex) !== pokemonIndex) return;
  candidate = Engine.pokemonMoveTutorPool(pokemon).find(function (move) { return Number(move.index) === moveIndex; });
  if (!candidate) return;
  if (pokemon.moves.length < 4) {
    clearPokemonCenterChoicePopup();
    runAuthoritativePokemonCenterTutorCommand(pokemon, item, candidate, null);
    return;
  }
  openPokemonCenterMoveResolution(pokemon, item, createPokemonCenterLearnedMove(candidate, pokemon), true);
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
  }, messageDescriptor("pokemonCenter.evolvedUsing", {
    pokemon: pokemonNameDescriptor(dialog.pokemon),
    target: speciesNameDescriptor(target.speciesKey),
    item: itemNameDescriptor(dialog.item)
  }));
});

registerAction("pokemon-center-evolution-decline", function() {
  var dialog = state.dialog;
  if (!dialog || dialog.type !== "pokemon-center-evolution") return;
  state.dialog = null;
  clearPokemonCenterAfterAction(state.scene, messageDescriptor("pokemonCenter.evolutionDeclined", { pokemon: pokemonNameDescriptor(dialog.pokemon) }));
  renderPokemonCenter();
});

async function runAuthoritativePokemonCenterCommand(input, notice) {
  var scene = state.scene;
  var result;
  if (!scene || scene.name !== "pokemon-center" || authoritativePokemonCenterCommandPending) return false;
  if (!input.pokemon || !input.pokemon.instanceId || !input.item) {
    openMessage([messageDescriptor("pokemonCenter.missingIdentity")], { title: textDescriptor("ui.pokemonCenter.sceneTitle") });
    return false;
  }
  authoritativePokemonCenterCommandPending = true;
  if (input.operation === "teach_tm" || input.operation === "evolve") holdDialogContent();
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
      openMessage([pokemonCenterCommandError(result.message)], { title: textDescriptor("ui.pokemonCenter.sceneTitle") });
      return false;
    }
    applyPlayerSave(saveFromAuthoritativeProjection(result.projection));
    clearPokemonCenterAfterAction(scene, notice);
    state.saveStatus = { state: "saved", message: "" };
    renderPokemonCenter();
    if (input.operation === "teach_tm") showPokemonCenterLearnedResult(input.pokemon, notice);
    if (input.operation === "evolve") {
      var evolved = state.team.find(function (entry) { return entry.instanceId === input.pokemon.instanceId; });
      if (evolved && evolved.speciesKey !== input.pokemon.speciesKey) showEvolutionResult(input.pokemon, evolved);
    }
    return true;
  } catch (error) {
    openMessage([pokemonCenterCommandError("")], { title: textDescriptor("ui.pokemonCenter.sceneTitle") });
    return false;
  } finally {
    authoritativePokemonCenterCommandPending = false;
  }
}

async function runAuthoritativePokemonCenterTutorCommand(pokemon, item, move, replacementSlot) {
  var scene = state.scene;
  var result;
  if (!scene || scene.name !== "pokemon-center" || authoritativePokemonCenterCommandPending) return false;
  authoritativePokemonCenterCommandPending = true;
  holdDialogContent();
  clearPokemonCenterChoicePopup();
  try {
    result = await executePokemonCenterMoveTutorAuthoritative({ expectedRevision: state.authoritativeRevision, pokemonInstanceId: pokemon.instanceId, itemIndex: item.index, moveIndex: move.index, replacementSlot: replacementSlot });
    if (!result.ok) {
      openMessage([pokemonCenterCommandError(result.message)], { title: textDescriptor("ui.pokemonCenter.sceneTitle") });
      return false;
    }
    applyPlayerSave(saveFromAuthoritativeProjection(result.projection));
    clearPokemonCenterAfterAction(scene, messageDescriptor("pokemonCenter.learnedUsing", {
      pokemon: pokemonNameDescriptor(pokemon), move: moveNameDescriptor(move), item: itemNameDescriptor(item)
    }));
    state.saveStatus = { state: "saved", message: "" };
    renderPokemonCenter();
    showPokemonCenterLearnedResult(pokemon, messageDescriptor("pokemonCenter.learnedUsing", {
      pokemon: pokemonNameDescriptor(pokemon), move: moveNameDescriptor(move), item: itemNameDescriptor(item)
    }));
    return true;
  } catch (error) {
    openMessage([pokemonCenterCommandError("")], { title: textDescriptor("ui.pokemonCenter.sceneTitle") });
    return false;
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
    targetTitle.textContent = t("ui.pokemonCenter.pokemonTitles." + modeConfig.textKey);
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
  runAuthoritativePokemonCenterCommand({ operation: "remove_held", pokemon: pokemon, item: heldItem },
    messageDescriptor("pokemonCenter.returnedToBag", { item: itemNameDescriptor(heldItem) }));
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
    teachPokemonCenterTMInline(pokemon, item, pokemonIndex);
    return;
  }
  if (mode === "assign-held") {
    assignHeldItemToPokemonInline(pokemon, item, pokemonIndex);
    return;
  }
  if (mode === "use-item") {
    if (item.category === ItemCategory.Item && item.subcategory === ItemSubcategory.MoveTutor) {
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
  return createPokemonCenterLearnedMove(item.move, pokemon);
}

function createPokemonCenterLearnedMove(moveDefinition, pokemon) {
  var maxPower = 0;
  var maxStats = 0;
  (pokemon.moves || []).forEach(function (move) {
    if (move) {
      if (move.power > maxPower) maxPower = move.power;
      if (move.stats > maxStats) maxStats = move.stats;
    }
  });
  return Engine.createMove(moveDefinition, {
    power: maxPower,
    stats: maxStats
  });
}

function teachPokemonCenterTMInline(pokemon, item, pokemonIndex) {
  var scene = state.scene;
  var move = createPokemonCenterTMMove(item, pokemon);
  if (!move || !Engine.pokemonCanLearnTM(pokemon, item)) {
    clearPokemonCenterAfterAction(scene, messageDescriptor("pokemonCenter.cannotTeach", {
      item: itemNameDescriptor(item), pokemon: pokemonNameDescriptor(pokemon)
    }));
    updatePokemonCenterModeDom();
    return;
  }
  if (pokemon.moves.length < 4) {
    runAuthoritativePokemonCenterCommand({ operation: "teach_tm", pokemon: pokemon, item: item },
      messageDescriptor("pokemonCenter.learned", { pokemon: pokemonNameDescriptor(pokemon), move: moveNameDescriptor(move) }));
    return;
  }
  openPokemonCenterMoveResolution(pokemon, item, move, false);
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
  if (!item || (item.category !== ItemCategory.HeldItem && item.category !== ItemCategory.Berry)) {
    return;
  }
  if (!pokemonCanHoldItem(pokemon, item)) {
    clearPokemonCenterAfterAction(scene, messageDescriptor("pokemonCenter.cannotHold", {
      pokemon: pokemonNameDescriptor(pokemon), item: itemNameDescriptor(item)
    }));
    updatePokemonCenterModeDom();
    return;
  }
  runAuthoritativePokemonCenterCommand({ operation: "assign_held", pokemon: pokemon, item: item },
    messageDescriptor(previousItem ? "pokemonCenter.nowHoldsReturned" : "pokemonCenter.nowHolds", {
      pokemon: pokemonNameDescriptor(pokemon), item: itemNameDescriptor(item), previousItem: itemNameDescriptor(previousItem)
    }));
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
    clearPokemonCenterAfterAction(scene, messageDescriptor("pokemonCenter.itemNoEffectOn", {
      item: itemNameDescriptor(item), pokemon: pokemonNameDescriptor(pokemon)
    }));
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
    clearPokemonCenterAfterAction(scene, messageDescriptor("pokemonCenter.evolutionNotFound"));
    renderPokemonCenter();
    return;
  }
  state.dialog = {
    type: "pokemon-center-evolution",
    pokemon: pokemon,
    pokemonName: pokemon.speciesKey,
    item: item,
    itemName: item.key,
    targets: targets.map(function (target) {
      return Object.assign({}, target, { gender: pokemon.gender, isShiny: pokemon.isShiny });
    })
  };
  renderDialogLayer();
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
    if (pokemon.maxHp >= pokemonCenterLimit(pokemon, maxHpForPokemon(pokemon))) {
      clearPokemonCenterAfterAction(scene, messageDescriptor("pokemonCenter.noEffect"));
      updatePokemonCenterModeDom();
      return;
    }
    runAuthoritativePokemonCenterCommand({ operation: "use_vitamin", pokemon: pokemon, item: item },
      messageDescriptor("pokemonCenter.hpIncreased", { pokemon: pokemonNameDescriptor(pokemon) }));
    return;
  }
  if (item.effect === "move_power") {
    if (!pokemon.moves.length) {
      clearPokemonCenterAfterAction(scene, messageDescriptor("pokemonCenter.noMovesToBoost", { pokemon: pokemonNameDescriptor(pokemon) }));
      updatePokemonCenterModeDom();
      return;
    }
    move = targetKind === "move" ? pokemon.moves[Number(moveIndex)] : null;
    if (!move) {
      clearPokemonCenterAfterAction(scene, messageDescriptor("pokemonCenter.chooseMoveToBoost"));
      updatePokemonCenterModeDom();
      return;
    }
    if (move.power >= pokemonCenterLimit(pokemon, maxPowerForPokemon(pokemon))
      && move.stats >= pokemonCenterLimit(pokemon, maxStatsForPokemon(pokemon))) {
      clearPokemonCenterAfterAction(scene, messageDescriptor("pokemonCenter.noEffect"));
      updatePokemonCenterModeDom();
      return;
    }
    runAuthoritativePokemonCenterCommand({
      operation: "use_vitamin",
      pokemon: pokemon,
      item: item,
      replacementSlot: Number(moveIndex)
    }, messageDescriptor("pokemonCenter.movePowerIncreased", { move: moveNameDescriptor(move) }));
    return;
  }
}

function showPokemonCenterLearnedResult(previousPokemon, notice) {
  var pokemon = state.team.find(function (entry) { return entry.instanceId === previousPokemon.instanceId; });
  if (!pokemon) return;
  openMessage([notice], { title: textDescriptor("ui.dialogs.newMove"), pokemon: pokemon, requireButtonClose: true });
}

function openPokemonCenterMoveResolution(pokemon, item, move, tutor) {
  clearPokemonCenterChoicePopup();
  state.scene.pendingAction = null;
  state.dialog = {
    type: "pokemon-center-move-resolution", pokemon: pokemon, item: item,
    move: move, moves: pokemon.moves.slice(), tutor: tutor
  };
  renderDialogLayer();
}

registerAction("pokemon-center-resolution-replace-move", function (element) {
  var dialog = state.dialog;
  var index = Number(element.dataset.index);
  if (!dialog || dialog.type !== "pokemon-center-move-resolution" || authoritativePokemonCenterCommandPending) return;
  confirmMoveForget(index, function () {
    if (dialog.tutor) {
      runAuthoritativePokemonCenterTutorCommand(dialog.pokemon, dialog.item, dialog.move, index);
    } else {
      runAuthoritativePokemonCenterCommand({
        operation: "teach_tm", pokemon: dialog.pokemon, item: dialog.item, replacementSlot: index
      }, messageDescriptor("pokemonCenter.forgotAndLearned", {
        pokemon: pokemonNameDescriptor(dialog.pokemon),
        oldMove: moveNameDescriptor(dialog.moves[index]), newMove: moveNameDescriptor(dialog.move)
      }));
    }
  });
});

registerAction("pokemon-center-resolution-decline-move", function () {
  if (!state.dialog || state.dialog.type !== "pokemon-center-move-resolution") return;
  state.dialog = null;
  renderDialogLayer();
});
