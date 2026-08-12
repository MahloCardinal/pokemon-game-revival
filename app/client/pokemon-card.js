import { getItemByIndex, itemDisplayDescription } from "../data/items.js";
import { formatDescription } from "../engine/index.js";
import {
  escapeHtml,
  renderImage,
  renderPokemonSprite,
  getPokemonImage,
  getGenderImage,
  getItemImage,
  renderTypeIcons
} from "./asset-helpers.js";

var POKEMON_CARD_TYPE_COLORS = {
  Normale: "#eadfcd",
  Fuoco: "#f7c7ad",
  Acqua: "#b9d9f4",
  Elettro: "#f5e7a5",
  Erba: "#c6e2bb",
  Ghiaccio: "#c5e8e8",
  Lotta: "#e7b7ad",
  Veleno: "#d7c1e8",
  Terra: "#e7d3ad",
  Volante: "#cbd4f4",
  Psico: "#f5bfd2",
  Coleottero: "#dce6ad",
  Roccia: "#d8c9a2",
  Spettro: "#c8bddc",
  Drago: "#c6c1ec",
  Buio: "#c3bab4",
  Acciaio: "#d5d8e2",
  Folletto: "#f2cce3"
};

function itemByIndex(itemIndex) {
  return getItemByIndex(itemIndex);
}

function renderPokemonCardMove(move) {
  var description = formatDescription(move);
  return '<button type="button" class="move-button pokemon-move-line" disabled><span class="move-name">' + escapeHtml(move.name) + (description ? ' <span class="move-effect">(' + escapeHtml(description) + ")</span>" : "") + "</span></button>";
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
  var vitalsText = "Lv: " + pokemon.level + "\u00a0\u00a0\u00a0\u00a0PS: " + currentHp;
  var expText = "Exp: " + pokemon.expCurrent + "/" + pokemon.expCap;
  var heldItemDescription = heldItem ? itemDisplayDescription(heldItem) : "";
  var heldItemClass = "pokemon-card-held-item" + (heldItemDescription ? " has-held-item-tooltip" : "");
  var heldItemAttrs = heldItemDescription
    ? ' tabindex="0" aria-label="' + escapeHtml(heldItem.name + ": " + heldItemDescription) + '" data-held-item-tooltip="' + escapeHtml(heldItemDescription) + '"'
    : "";
  var heldItemMarkup = heldItem
    ? [
      '      <p class="' + heldItemClass + '"' + heldItemAttrs + ">",
      heldItem.image ? renderImage(getItemImage(heldItem.image), heldItem.name, "pokemon-card-held-item-image", imageAttrs) : "",
      '        <span>' + escapeHtml(heldItem.name) + "</span>",
      "      </p>"
    ].join("")
    : [
      '      <p class="pokemon-card-held-item pokemon-card-held-item-empty" aria-hidden="true">',
      '        <span class="pokemon-card-held-item-image pokemon-card-held-item-image-empty"></span>',
      "        <span>Nessuno</span>",
      "      </p>"
    ].join("");
  var cardClassName = "pokemon-card " + (options.className || "");

  return [
    '<article class="' + cardClassName + '"' + pokemonCardTypeStyle(pokemon && pokemon.type) + (attrs ? " " + attrs : "") + ">",
    '  <div class="pokemon-card-summary">',
    '    <div class="pokemon-visual">',
    renderPokemonSprite(pokemon, "", imageAttrs),
    "    </div>",
    '    <div class="pokemon-card-main">',
    '      <div class="pokemon-card-name-row">',
    '        <h3 class="pokemon-card-name">' + escapeHtml(pokemon.name) + "</h3>",
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
