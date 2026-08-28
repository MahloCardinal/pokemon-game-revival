import { getItemByIndex } from "../data/items.js";
import { itemDisplayDescription, itemDisplayName, moveDisplayDescription, moveDisplayName, speciesDisplayName } from "./entity-text.js";
import { t } from "./i18n.js";
import {
  escapeHtml,
  renderImage,
  renderPokemonSprite,
  getPokemonImage,
  getPokemonStaticImage,
  getGenderImage,
  getItemImage,
  renderTypeIcons,
  withPokemonSpriteAttrs,
  withPokemonSpriteClass
} from "./asset-helpers.js";

var POKEMON_CARD_TYPE_COLORS = {
  normal: "#eadfcd",
  fire: "#f7c7ad",
  water: "#b9d9f4",
  electric: "#f5e7a5",
  grass: "#c6e2bb",
  ice: "#c5e8e8",
  fighting: "#e7b7ad",
  poison: "#d7c1e8",
  ground: "#e7d3ad",
  flying: "#cbd4f4",
  psychic: "#f5bfd2",
  bug: "#dce6ad",
  rock: "#d8c9a2",
  ghost: "#c8bddc",
  dragon: "#c6c1ec",
  dark: "#c3bab4",
  steel: "#d5d8e2",
  fairy: "#f2cce3"
};

function itemByIndex(itemIndex) {
  return getItemByIndex(itemIndex);
}

function renderPokemonCardMove(move) {
  var description = moveDisplayDescription(move);
  return '<button type="button" class="move-button pokemon-move-line" disabled><span class="move-name">' + escapeHtml(moveDisplayName(move)) + (description ? ' <span class="move-effect">(' + escapeHtml(description) + ")</span>" : "") + "</span></button>";
}

function renderPokemonCardSprite(pokemon, options, imageAttrs) {
  if (!options.staticSprite) {
    return renderPokemonSprite(pokemon, "", imageAttrs);
  }
  return renderImage(
    getPokemonStaticImage(pokemon.speciesKey),
    speciesDisplayName(pokemon),
    withPokemonSpriteClass("pokemon-sprite", pokemon),
    withPokemonSpriteAttrs(pokemon, imageAttrs)
  );
}

function pokemonCardTypeStyle(types) {
  var pokemonTypes = Array.isArray(types) ? types.filter(Boolean).slice(0, 2) : [];
  var colors = pokemonTypes.map(function (typeName) {
    return POKEMON_CARD_TYPE_COLORS[typeName] || "#ddd2bf";
  });
  var background;
  if (!colors.length) {
    return "";
  }
  background = colors.length === 1
    ? "linear-gradient(145deg, " + colors[0] + ", rgba(255, 251, 244, 0.9))"
    : "linear-gradient(145deg, " + colors[0] + " 0%, " + colors[0] + " 46%, " + colors[1] + " 54%, " + colors[1] + " 100%)";
  return ' style="--pokemon-card-bg:' + background + ';--pokemon-card-border:rgba(31,37,40,0.2);"';
}

export function renderPokemonCard(pokemon, options) {
  options = options || {};
  var overlayContent = options.overlayContent || "";
  var attrs = options.attrs || "";
  var heldItem = pokemon && pokemon.heldItemIndex ? itemByIndex(pokemon.heldItemIndex) : null;
  var showVitals = options.showVitals !== false;
  var showMoves = options.showMoves !== false;
  var imageAttrs = options.imageAttrs || "";
  var extraContent = options.extraContent || "";
  var currentHp = options.currentHp !== undefined ? options.currentHp : pokemon.maxHp;
  var vitalsText = t("common.units.levelShort") + ": " + pokemon.level + "\u00a0\u00a0\u00a0\u00a0" + t("common.units.hpShort") + ": " + currentHp;
  var expText = t("common.units.experienceShort") + ": " + pokemon.expCurrent + "/" + pokemon.expCap;
  var heldItemDescription = heldItem ? itemDisplayDescription(heldItem) : "";
  var heldItemName = heldItem ? itemDisplayName(heldItem) : "";
  var heldItemClass = "pokemon-card-held-item" + (heldItemDescription ? " has-held-item-tooltip" : "");
  var heldItemAttrs = heldItemDescription
    ? ' tabindex="0" aria-label="' + escapeHtml(heldItemName + ": " + heldItemDescription) + '" data-held-item-tooltip="' + escapeHtml(heldItemDescription) + '"'
    : "";
  var heldItemMarkup = heldItem
    ? [
      '      <p class="' + heldItemClass + '"' + heldItemAttrs + ">",
      heldItem.image ? renderImage(getItemImage(heldItem.image), heldItemName, "pokemon-card-held-item-image", imageAttrs) : "",
      '        <span>' + escapeHtml(heldItemName) + "</span>",
      "      </p>"
    ].join("")
    : [
      '      <p class="pokemon-card-held-item pokemon-card-held-item-empty" aria-hidden="true">',
      '        <span class="pokemon-card-held-item-image pokemon-card-held-item-image-empty"></span>',
      "        <span>" + escapeHtml(t("common.actions.none")) + "</span>",
      "      </p>"
    ].join("");
  var cardClassName = "pokemon-card " + (options.className || "");

  return [
    '<article class="' + cardClassName + '"' + pokemonCardTypeStyle(pokemon && pokemon.type) + (attrs ? " " + attrs : "") + ">",
    '  <div class="pokemon-card-summary">',
    '    <div class="pokemon-visual">',
    renderPokemonCardSprite(pokemon, options, imageAttrs),
    "    </div>",
    '    <div class="pokemon-card-main">',
    '      <div class="pokemon-card-name-row">',
    '        <h3 class="pokemon-card-name">' + escapeHtml(speciesDisplayName(pokemon)) + "</h3>",
    pokemon.gender ? renderImage(getGenderImage(pokemon.gender), pokemon.gender, "gender-icon", imageAttrs) : "",
    "      </div>",
    '      <div class="pokemon-card-type-row">',
    renderTypeIcons(pokemon.type, imageAttrs),
    "      </div>",
    showVitals ? '      <p class="pokemon-card-vitals">' + escapeHtml(vitalsText) + "</p>" : "",
    showVitals ? '      <p class="pokemon-card-exp">' + escapeHtml(expText) + "</p>" : "",
    heldItemMarkup,
    "    </div>",
    "  </div>",
    extraContent,
    showMoves ? '  <div class="pokemon-card-moves">' + pokemon.moves.map(renderPokemonCardMove).join("") + "</div>" : "",
    "",
    overlayContent,
    "</article>"
  ].join("");
}

export function renderPokemonCardFrame(cardMarkup, options) {
  options = options || {};
  var statusLabel = options.statusLabel || "";
  var actions = options.actions || "";
  var className = "pokemon-card-frame" + (options.className ? " " + options.className : "");
  if (!statusLabel && !actions && !options.className) {
    return cardMarkup;
  }
  var externalParts = "";
  if (statusLabel) {
    externalParts += '<div class="pokemon-card-external-meta"><span class="status-pill">' + escapeHtml(statusLabel) + "</span></div>";
  }
  if (actions) {
    externalParts += '<div class="button-row pokemon-card-external-actions">' + actions + "</div>";
  }
  return [
    '<div class="' + className + '">',
    cardMarkup,
    externalParts ? '<div class="pokemon-card-external">' + externalParts + "</div>" : "",
    "</div>"
  ].join("");
}
