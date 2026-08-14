import { ITEM_LIBRARY, getResolvedInventoryItem, resolveInventoryItems } from "../data/items.js";
import * as Engine from "../engine/index.js";
import { state } from "../client/game-state.js";
import { pokemonCenterMode as sceneCenterMode, pokemonCenterModeConfig, pokemonCenterMoveMatchesItem, pokemonCenterPokemonDisplayState, pokemonCenterItemPrompt } from "../client/pokemon-center-rules.js";
import { escapeHtml, getItemDisplayImage, renderImage } from "../client/asset-helpers.js";
import { button, renderScenePresentationPanel, sceneShell } from "../client/render-utils.js";
import { renderPokemonCard, renderPokemonCardFrame } from "../client/pokemon-card.js";

function pokemonCenterCompatibility(pokemon, item) {
  return {
    canLearnMt: Engine.pokemonCanLearnMt(pokemon, item),
    hasItemEvolution: Boolean(Engine.itemEvolutionForPokemon(pokemon, item))
  };
}

function renderPokemonCenterItemButton(item, selectedItemIndex) {
  var selectedClass = item.index === selectedItemIndex ? " is-selected" : "";
  var imageSrc = getItemDisplayImage(item);
  var stockMarkup = '  <span class="pokemon-center-item-quantity">x' + escapeHtml(item.quantity) + "</span>";
  return [
    '<button type="button" class="pokemon-center-item-button' + selectedClass + '" data-action="pokemon-center-item-pick" data-item-index="' + escapeHtml(item.index) + '">',
    imageSrc ? renderImage(imageSrc, item.name, "pokemon-center-item-image") : '<span class="pokemon-center-item-image pokemon-center-item-image-empty"></span>',
    '  <span class="pokemon-center-item-name">' + escapeHtml(item.name) + "</span>",
    stockMarkup,
    "</button>"
  ].join("");
}

function renderPokemonCenterItemNotice(scene) {
  return scene && scene.notice
    ? [
      '<div class="pokemon-center-item-notice">',
      '  <p class="stack-note pokemon-center-notice">' + escapeHtml(scene.notice) + "</p>",
      '  <div class="button-row">' + button("Ok", "pokemon-center-notice-ok", "", "button-primary button-slim") + "</div>",
      "</div>"
    ].join("")
    : "";
}

export function renderPokemonCenterItemPanelContent(mode, modeConfig, availableItems, selectedItemIndex, scene, inventory) {
  var item = getResolvedInventoryItem(inventory, selectedItemIndex);
  var prompt = item ? pokemonCenterItemPrompt(mode, item, scene) : "";
  var cancelButton = button("Annulla", "pokemon-center-item-cancel", "", "button-dark button-slim pokemon-center-item-cancel");
  var itemContent = item
    ? renderPokemonCenterItemButton(item, selectedItemIndex) + cancelButton
    : (availableItems.length
      ? availableItems.map(function (entry) { return renderPokemonCenterItemButton(entry, selectedItemIndex); }).join("")
      : '<p class="empty-state inventory-empty">' + escapeHtml(modeConfig.emptyText) + "</p>");
  if (scene && scene.notice) {
    return [
      '<h2 class="stack-title">Scegli lo strumento</h2>',
      renderPokemonCenterItemNotice(scene)
    ].join("");
  }
  return [
    '<h2 class="stack-title">Scegli lo strumento</h2>',
    prompt ? '<p class="stack-note pokemon-center-item-prompt">' + escapeHtml(prompt) + "</p>" : "",
    '  <div class="pokemon-center-item-row' + (item ? " is-selected-only" : "") + '">' + itemContent + "</div>"
  ].join("");
}

export function renderPokemonCenterMoveButton(move, pokemonIndex, moveIndex, mode, item, selectedTargetKind, selectedPokemonIndex, selectedMoveIndex, scene, team) {
  var description = Engine.formatDescription(move);
  var pokemon = team[pokemonIndex];
  var canPickMove = pokemonCenterMoveMatchesItem(scene, mode, item, pokemon, pokemonIndex, move);
  var selectedClass = selectedTargetKind === "move" && pokemonIndex === selectedPokemonIndex && moveIndex === selectedMoveIndex ? " is-selected" : "";
  var content = '<span class="move-name">' + escapeHtml(move.name) + (description ? ' <span class="move-effect">(' + escapeHtml(description) + ")</span>" : "") + "</span>";
  if (!canPickMove) {
    return '<span class="move-button pokemon-move-line pokemon-center-move-button">' + content + "</span>";
  }
  return '<button type="button" class="move-button pokemon-move-line pokemon-center-move-button' + selectedClass + '" data-action="pokemon-center-move-pick" data-index="' + escapeHtml(pokemonIndex) + '" data-move-index="' + escapeHtml(moveIndex) + '">' + content + "</button>";
}

export function renderPokemonCenterScene() {
  var centerMode = sceneCenterMode(state.scene);
  var selectedTargetKind = state.scene.targetKind || "pokemon";
  var selectedPokemonIndex = state.scene.pokemonIndex === null || state.scene.pokemonIndex === undefined ? NaN : Number(state.scene.pokemonIndex);
  var selectedMoveIndex = state.scene.moveIndex === null || state.scene.moveIndex === undefined ? NaN : Number(state.scene.moveIndex);
  var selectedItemIndex = state.scene.itemIndex === null || state.scene.itemIndex === undefined ? NaN : Number(state.scene.itemIndex);
  var inventoryItems = resolveInventoryItems(state.inventory);
  var modeConfig = pokemonCenterModeConfig(centerMode);
  var availableItems = inventoryItems.filter(modeConfig.itemFilter);
  var selectedItem = getResolvedInventoryItem(state.inventory, selectedItemIndex);
  var actionButtons = [
    { label: "Assegna strumento", mode: "assign-held" },
    { label: "Usa strumento", mode: "use-item" },
    { label: "Usa MT", mode: "use-mt" }
  ].map(function (activity) {
    var selectedClass = activity.mode === centerMode ? " button-primary" : " button-ghost";
    return button(activity.label, "pokemon-center-mode", 'data-mode="' + escapeHtml(activity.mode) + '"', "button-slim" + selectedClass);
  }).join("");

  function renderPokemonCenterSlot(pokemon, index) {
    var heldItem = pokemon.heldItemIndex ? ITEM_LIBRARY.find(function (item) { return item.index === Number(pokemon.heldItemIndex); }) : null;
    var displayState = pokemonCenterPokemonDisplayState(state.scene, centerMode, selectedItem, pokemon, index, pokemonCenterCompatibility(pokemon, selectedItem));
    var selectedClass = selectedTargetKind === "pokemon" && index === selectedPokemonIndex ? " is-selected" : "";
    var cardStateClass = (displayState.clickable ? " is-target-clickable" : "") + (displayState.muted ? " is-target-muted" : "") + (displayState.bodyMuted ? " is-target-body-muted" : "");
    var attrs = displayState.clickable
      ? 'data-action="pokemon-center-pokemon-pick" data-index="' + escapeHtml(index) + '" role="button" tabindex="0"'
      : "";
    var movesMarkup = pokemon.moves.length
      ? '<div class="pokemon-card-moves pokemon-center-card-moves">' + pokemon.moves.map(function (move, moveIndex) {
        return renderPokemonCenterMoveButton(move, index, moveIndex, centerMode, selectedItem, selectedTargetKind, selectedPokemonIndex, selectedMoveIndex, state.scene, state.team);
      }).join("") + "</div>"
      : "";
    var actions = heldItem
      ? button("Togli strumento", "pokemon-center-held-item-remove", 'data-index="' + escapeHtml(index) + '"', "button-dark button-slim")
      : "";
    return renderPokemonCardFrame(renderPokemonCard(pokemon, {
      className: "mini-card" + selectedClass + cardStateClass,
      showMoves: false,
      extraContent: movesMarkup,
      attrs: attrs
    }), {
      className: "pokemon-center-card-frame",
      actions: actions
    });
  }

  function renderPokemonCenterItemPanel() {
    return renderPokemonCenterItemPanelContent(centerMode, modeConfig, availableItems, selectedItemIndex, state.scene, state.inventory);
  }

  var pokemonContent = state.team.length
    ? state.team.map(renderPokemonCenterSlot).join("")
    : '<p class="empty-state inventory-empty">La squadra e\' vuota.</p>';
  var pokemonNotice = state.scene.notice || "";
  var itemPanelClass = selectedItem && !pokemonNotice ? " has-item-prompt" : "";
  itemPanelClass += pokemonNotice ? " has-item-notice" : "";
  var body = [
    '<section class="pokemon-center-layout">',
    renderScenePresentationPanel("Centro Pokémon", "pokemon-center-info-panel"),
    '  <div class="pokemon-center-top-row">',
    '    <section class="panel pokemon-center-sections-panel"><div class="panel-inner">',
    '      <h2 class="stack-title">Sezioni</h2>',
    '      <div class="pokemon-center-action-row pokemon-center-section-row">' + actionButtons + "</div>",
    "    </div></section>",
    '<section class="panel pokemon-center-selection-panel pokemon-center-item-panel" data-render-region="pokemon-center-items"><div class="panel-inner' + itemPanelClass + '">',
    renderPokemonCenterItemPanel(),
    "    </div></section>",
    "  </div>",
    '<section class="pokemon-center-work-row">',
    '<section class="panel pokemon-center-selection-panel pokemon-center-target-panel" data-render-region="pokemon-center-team"><div class="panel-inner">',
    '  <h2 class="stack-title">' + escapeHtml(modeConfig.pokemonTitle) + "</h2>",
    '  <div class="pokemon-center-pokemon-row">' + pokemonContent + "</div>",
    "</div></section>",
    "</section>"
  ].join("");

  return sceneShell(
    "Centro Pokémon", "", body, "",
    "scene-content-pokemon-center", "parent-back"
  );
}
