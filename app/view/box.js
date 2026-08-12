import * as Engine from "../engine/index.js";
import { state } from "../client/game-state.js";
import { escapeHtml, getTypeImage, renderImage } from "../client/asset-helpers.js";
import { button, sceneShell } from "../client/render-utils.js";
import { renderPokemonCard, renderPokemonCardFrame } from "../client/pokemon-card.js";

function boxTypeOptions() {
  var seenTypes = {};
  Engine.getAllSpecies().forEach(function (species) {
    species.type.forEach(function (typeName) {
      seenTypes[typeName] = true;
    });
  });
  return Object.keys(seenTypes).sort(function (a, b) {
    return a.localeCompare(b, "it");
  });
}

function filteredBoxEntries() {
  var filter = state.boxFilter || { type: "", minLevel: "", maxLevel: "", name: "", heldItemOnly: false };
  var minLevel = Number(filter.minLevel || 0);
  var maxLevel = Number(filter.maxLevel || 0);
  var nameFragment = String(filter.name || "").toLocaleLowerCase("it-IT");

  return state.box.map(function (pokemon, index) {
    return {
      pokemon: pokemon,
      originalIndex: index
    };
  }).filter(function (entry) {
    var pokemon = entry.pokemon;
    if (filter.type && pokemon.type.indexOf(filter.type) === -1) { return false; }
    if (minLevel && pokemon.level < minLevel) { return false; }
    if (maxLevel && pokemon.level > maxLevel) { return false; }
    if (nameFragment && pokemon.name.toLocaleLowerCase("it-IT").indexOf(nameFragment) === -1) { return false; }
    if (filter.heldItemOnly && !pokemon.heldItemIndex) { return false; }
    return true;
  });
}

export function renderBoxScene() {
  var filter = state.boxFilter || { type: "", minLevel: "", maxLevel: "", name: "", heldItemOnly: false };
  var typeOptions = boxTypeOptions();
  var selectedType = filter.type || "";
  var heldItemChecked = filter.heldItemOnly ? " checked" : "";
  var typeSummary = selectedType
    ? renderImage(getTypeImage(selectedType), selectedType, "type-label-image choice-menu-current")
    : '<span class="choice-menu-placeholder">Tutti</span>';
  var typeMenu = [
    '<details class="choice-menu">',
    '  <summary class="choice-menu-summary">' + typeSummary + "</summary>",
    '  <div class="choice-menu-list">',
    '    <label class="choice-menu-option' + (!selectedType ? " is-active" : "") + '">',
    '      <input type="radio" name="box-filter-type" value="" ' + (!selectedType ? "checked" : "") + ">",
    '      <span>Tutti</span>',
    "    </label>",
    typeOptions.map(function (typeName) {
      var selectedClass = selectedType === typeName ? " is-active" : "";
      return [
        '<label class="choice-menu-option' + selectedClass + '">',
        '  <input type="radio" name="box-filter-type" value="' + escapeHtml(typeName) + '" ' + (selectedType === typeName ? "checked" : "") + ">",
        renderImage(getTypeImage(typeName), typeName, "type-label-image choice-menu-image"),
        "</label>"
      ].join("");
    }).join(""),
    "  </div>",
    "</details>"
  ].join("");
  var filterControls = [
    '<section class="box-filter-row" aria-label="Filtra Box">',
    '  <span class="box-filter-label">Filtra per:</span>',
    '  <label class="box-filter-field box-filter-type-field"><span>Tipo</span>' + typeMenu + "</label>",
    '  <label class="box-filter-field"><span>Lv min</span><input data-field="box-filter-min-level" type="text" inputmode="numeric" maxlength="3" pattern="[0-9]*" value="' + escapeHtml(filter.minLevel || "") + '"></label>',
    '  <label class="box-filter-field"><span>Lv max</span><input data-field="box-filter-max-level" type="text" inputmode="numeric" maxlength="3" pattern="[0-9]*" value="' + escapeHtml(filter.maxLevel || "") + '"></label>',
    '  <label class="box-filter-field box-filter-name-field"><span>Nome</span><input data-field="box-filter-name" type="text" maxlength="3" pattern="[A-Za-z0-9-]{0,3}" value="' + escapeHtml(filter.name || "") + '"></label>',
    '  <label class="box-filter-held-field"><span>Con strumento</span><input data-field="box-filter-held-item" type="checkbox"' + heldItemChecked + '></label>',
    '  <div class="box-filter-actions">',
    button("Azzera filtri", "box-filter-reset", "", "button-ghost box-filter-reset"),
    button("Filtra", "box-filter-apply", "", "button-primary box-filter-submit"),
    "  </div>",
    "</section>"
  ].join("");
  var filteredEntries = filteredBoxEntries();
  var boxContent = state.box.length
    ? (filteredEntries.length ? '<div class="box-pokemon-grid">' + filteredEntries.map(function (entry) {
      var pokemon = entry.pokemon;
      var actions = [
        button("Ritira", "box-to-team", 'data-index="' + entry.originalIndex + '"' + (state.inBattle ? " disabled" : ""), "button-primary box-card-action-button"),
        button("Libera", "box-release", 'data-index="' + entry.originalIndex + '"', "button-danger box-card-action-button")
      ].join("");
      return renderPokemonCardFrame(renderPokemonCard(pokemon), { actions: actions });
    }).join("") + "</div>" : "")
    : "";
  var content = [
    '<div class="box-scene-stack">',
    filterControls,
    '<section class="box-storage-panel">',
    boxContent,
    "</section>",
    "</div>"
  ].join("");

  return sceneShell(
    "Box",
    "",
    content,
    "",
    "",
    "parent-back"
  );
}
