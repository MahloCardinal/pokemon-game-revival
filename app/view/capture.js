import * as Engine from "../engine/index.js";
import { state } from "../client/game-state.js";
import { getResolvedInventoryItem } from "../data/items.js";
import { FLUTE_DAILY_USE_LIMIT, SEARCH_TOOL_ITEMS, captureLevelLimitForBadges, captureLevelRangesForBadges } from "../data/progression.js";
import { escapeHtml, getItemDisplayImage, getTypeImage, renderImage } from "../client/asset-helpers.js";
import { button, renderScenePresentationPanel, sceneShell } from "../client/render-utils.js";
import { renderPokemonCard } from "../client/pokemon-card.js";
import { t } from "../client/i18n.js";
import { itemDisplayName, speciesDisplayName, typeDisplayName } from "../client/entity-text.js";

var CAPTURE_ZONE_THEME_CLASS = {
  viridian_forest: "capture-search-wrap-bosco-smeraldo",
  mt_moon: "capture-search-wrap-monte-luna",
  sea: "capture-search-wrap-mare",
  ghost_tower: "capture-search-wrap-torre-fantasma",
  safari_zone: "capture-search-wrap-safari",
  swamp: "capture-search-wrap-palude",
  desert: "capture-search-wrap-deserto"
};

export function renderCaptureTeamSectionInner() {
  return state.team.length
    ? '<div class="pokemon-grid capture-team-grid"><h2 class="stack-title capture-team-title">' + escapeHtml(t("ui.capture.currentTeam")) + "</h2>" + state.team.map(function (pokemon) {
      return renderPokemonCard(pokemon);
    }).join("") + "</div>"
    : '<div class="pokemon-grid capture-team-grid"><h2 class="stack-title capture-team-title">' + escapeHtml(t("ui.capture.currentTeam")) + '</h2><div class="empty-state capture-team-empty">' + escapeHtml(t("ui.capture.emptyTeam")) + "</div></div>";
}

export function captureWildCardKey(scene) {
  var activeEncounter = state.activeEncounter && state.activeEncounter.zoneKey === scene.zoneName ? state.activeEncounter : null;
  var wildPokemon = scene.wildPokemon || activeEncounter && activeEncounter.pokemon;
  return wildPokemon && String(activeEncounter && activeEncounter.encounterId || wildPokemon.instanceId || [
    scene.zoneName, wildPokemon.speciesKey, wildPokemon.level, wildPokemon.name
  ].join(":"));
}

function renderCaptureToolButton(key, item, isSelected, hasItem, remaining) {
  var limit = FLUTE_DAILY_USE_LIMIT;
  var used = Math.max(0, limit - Math.max(0, Number(remaining) || 0));
  var isAvailable = hasItem && remaining > 0;
  var inputName = key === "whiteFlute" ? "capture-use-white-flute" : "capture-use-black-flute";
  var itemName = itemDisplayName(item);
  return [
    '<label class="capture-tool-button' + (isSelected ? " is-selected" : "") + (isAvailable ? "" : " is-unavailable") + '">',
    '  <input type="checkbox" name="' + inputName + '" value="1" ' + (isSelected ? "checked" : "") + ' ' + (isAvailable ? "" : "disabled") + '>',
    '  <span class="capture-tool-button-inner">',
    renderImage(getItemDisplayImage(item), itemName, "capture-tool-image"),
    '    <span class="capture-tool-text">' + escapeHtml(itemName) + ' <span class="capture-tool-count" data-capture-tool-count="' + key + '">(' + escapeHtml(t("ui.capture.toolUses", { used: used, limit: limit })) + ")</span></span>",
    '  </span>',
    '</label>'
  ].join("");
}

export function renderCaptureScene(scene) {
  var activeEncounter = state.activeEncounter && state.activeEncounter.zoneKey === scene.zoneName ? state.activeEncounter : null;
  var wildPokemon = scene.wildPokemon || activeEncounter && activeEncounter.pokemon;
  var zoneTypes = Engine.getZoneTypes(scene.zoneName);
  var selectedType = scene.selectedType || zoneTypes[0] || "";
  var maxSearchLevel = captureLevelLimitForBadges(state.trainerInfo[2]);
  var searchRanges = captureLevelRangesForBadges(state.trainerInfo[2], true);
  var selectedRangeIndex = Math.max(0, Math.min(searchRanges.length - 1, Math.floor(Number(scene.selectedRangeIndex) || 0)));
  var selectedRange = searchRanges[selectedRangeIndex] || searchRanges[0];
  var hasWhiteFlute = Number((getResolvedInventoryItem(state.inventory, SEARCH_TOOL_ITEMS.whiteFlute.index) || {}).quantity) > 0;
  var hasBlackFlute = Number((getResolvedInventoryItem(state.inventory, SEARCH_TOOL_ITEMS.blackFlute.index) || {}).quantity) > 0;
  var whiteFluteRemaining = state.fluteDaily && state.fluteDaily.whiteFlute && state.fluteDaily.whiteFlute.remaining || 0;
  var blackFluteRemaining = state.fluteDaily && state.fluteDaily.blackFlute && state.fluteDaily.blackFlute.remaining || 0;
  var useWhiteFlute = hasWhiteFlute && whiteFluteRemaining > 0 && scene.useWhiteFlute === true;
  var useBlackFlute = hasBlackFlute && blackFluteRemaining > 0 && scene.useBlackFlute === true;
  var zoneThemeClass = CAPTURE_ZONE_THEME_CLASS[scene.zoneName] || "capture-search-wrap-default";
  var wildCardKey = captureWildCardKey(scene);
  var canReuseWildCard = state.captureWildCard && state.captureWildCard.key === wildCardKey;
  var wildCard = canReuseWildCard ? "" : wildPokemon
    ? renderPokemonCard(wildPokemon)
    : '<div class="empty-state capture-wild-placeholder">' + escapeHtml(t("ui.capture.noWildPokemon")) + "</div>";
  var typeSummary = selectedType
    ? renderImage(getTypeImage(selectedType), typeDisplayName(selectedType), "type-label-image choice-menu-current")
    : '<span class="choice-menu-placeholder">' + escapeHtml(t("ui.capture.type")) + "</span>";
  var typeInlineList = zoneTypes.map(function (typeName) {
    return renderImage(getTypeImage(typeName), typeDisplayName(typeName), "type-label-image capture-type-inline-image");
  }).join("");
  var typeMenu = [
    '<details class="choice-menu capture-type-menu">',
    '  <summary class="choice-menu-summary">' + typeSummary + "</summary>",
    '  <div class="choice-menu-list capture-type-list">',
    zoneTypes.map(function (typeName) {
      var selectedClass = typeName === selectedType ? " is-active" : "";
      return [
        '<label class="choice-menu-option' + selectedClass + '">',
        '  <input type="radio" name="capture-search-type" value="' + escapeHtml(typeName) + '" ' + (typeName === selectedType ? "checked" : "") + ' ' + (hasBlackFlute && blackFluteRemaining > 0 ? "" : "disabled") + ">",
        renderImage(getTypeImage(typeName), typeDisplayName(typeName), "type-label-image choice-menu-image"),
        "</label>"
      ].join("");
    }).join(""),
    "  </div>",
    "</details>"
  ].join("");
  var rangeOptions = searchRanges.map(function (range, index) {
    var selectedClass = index === selectedRangeIndex ? " is-active" : "";
    return [
      '<label class="choice-menu-option capture-range-option' + selectedClass + '">',
      '  <input type="radio" name="capture-search-range" value="' + escapeHtml(index) + '" ' + (index === selectedRangeIndex ? "checked" : "") + ">",
      '  <span>' + escapeHtml(range.min) + '-' + escapeHtml(range.max) + '</span>',
      '</label>'
    ].join("");
  }).join("");
  var rangeMenu = [
    '<details class="choice-menu capture-range-menu">',
    '  <summary class="choice-menu-summary">' + escapeHtml(selectedRange ? selectedRange.min : 5) + '-' + escapeHtml(selectedRange ? selectedRange.max : maxSearchLevel) + '</summary>',
    '  <div class="choice-menu-list capture-type-list capture-range-list">',
    rangeOptions,
    '  </div>',
    '</details>'
  ].join("");
  var fluteButtons = [];
  if (hasWhiteFlute) {
    fluteButtons.push(renderCaptureToolButton("whiteFlute", SEARCH_TOOL_ITEMS.whiteFlute, useWhiteFlute, hasWhiteFlute, whiteFluteRemaining));
  }
  if (hasBlackFlute) {
    fluteButtons.push(renderCaptureToolButton("blackFlute", SEARCH_TOOL_ITEMS.blackFlute, useBlackFlute, hasBlackFlute, blackFluteRemaining));
  }
  var toolOptions = fluteButtons.length
    ? '<div class="capture-tool-row">' + fluteButtons.join("") + '</div>'
    : "";
  var exactLevelInput = '<input class="capture-level-input" data-field="capture-level" type="text" inputmode="numeric" maxlength="2" pattern="[0-9]*" value="' + escapeHtml(scene.levelText || "") + '" ' + (hasWhiteFlute && whiteFluteRemaining > 0 ? "" : "disabled") + '>';
  var form = [
    '<section class="capture-zone-layout">',
    '<section class="capture-search-wrap ' + zoneThemeClass + '">',
    renderScenePresentationPanel("capture." + scene.zoneName, "capture-info-panel"),
    '  <div class="capture-search-grid">',
    '    <div class="capture-search-content">',
    '      <section class="panel capture-search-panel"><div class="panel-inner stack">',
    '        <p class="footer-note capture-level-hint" data-capture-level-hint>' + escapeHtml(t("ui.capture.levelHint", { level: maxSearchLevel })) + "</p>",
    toolOptions,
    '        <div class="capture-search-sentence">',
    '          <span>' + escapeHtml(t("ui.capture.searchPokemonLevel")) + "</span>",
    rangeMenu,
    exactLevelInput,
      '          <span class="capture-type-label">' + escapeHtml(t("ui.capture.ofType")) + '</span><span class="capture-type-inline-list">' + typeInlineList + '</span>',
    typeMenu,
     '        </div>',
      '        <div class="capture-search-actions">',
      button(t("ui.capture.search"), "capture-search", wildPokemon ? "disabled" : "", "button-accent capture-search-button"),
      button(t("ui.capture.flee"), "capture-flee", wildPokemon ? "" : "disabled", "button-ghost capture-flee-button"),
      button(wildPokemon ? t("ui.capture.fightPokemon", { pokemon: speciesDisplayName(wildPokemon) }) : t("ui.capture.fight"), "capture-start-fight", wildPokemon ? "" : "disabled", "button-primary capture-fight-button"),
      "        </div>",
    "      </div></section>",
    "    </div>",
    '    <div class="wild-card-wrap">' + wildCard + "</div>",
    "  </div>",
    "</section>",
    "</section>"
  ].join("");

  return sceneShell(t("captureZones." + scene.zoneName + ".name"), "", form, "", "", "parent-back");
}
