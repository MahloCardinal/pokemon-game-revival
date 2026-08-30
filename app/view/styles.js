import { assetPath, escapeHtml, getItemDisplayImage, renderImage } from "../client/asset-helpers.js";
import { sceneShell } from "../client/render-utils.js";
import { ItemCategory, resolveInventoryItems } from "../data/items.js";
import { isSingleCopyInventoryItem } from "./inventory-helpers.js";
import { state } from "../client/game-state.js";
import { itemDisplayDescription, itemDisplayName } from "../client/entity-text.js";
import { t } from "../client/i18n.js";

function styleButton(label, className) {
  return '<button type="button" class="style-proposals-button ' + escapeHtml(className) + '">' + escapeHtml(label) + '</button>';
}

function stylePanel(title, text, className) {
  return [
    '<div class="style-proposals-panel ' + escapeHtml(className) + '">',
    '  <span class="style-proposals-panel-kicker">' + escapeHtml(t("ui.styles.panel")) + '</span>',
    '  <h4>' + escapeHtml(title) + '</h4>',
    '  <p>' + escapeHtml(text) + '</p>',
    '</div>'
  ].join("");
}

function styleZoneButton(title, imageFile, className) {
  return [
    '<button type="button" class="style-proposals-zone-button ' + escapeHtml(className) + '">',
    '  <span class="style-proposals-zone-title">' + escapeHtml(title) + '</span>',
    '  <span class="style-proposals-zone-media">',
    renderImage(assetPath("img_zone", imageFile), title, "style-proposals-zone-image"),
    '  </span>',
    '</button>'
  ].join("");
}

function renderFontShowcase() {
  var fonts = [
    ["Game", "Lucida Console", "style-proposals-font-game"],
    ["Mono", "Courier New", "style-proposals-font-mono"],
    ["Sans", "Trebuchet MS", "style-proposals-font-sans"],
    ["Serif", "Georgia", "style-proposals-font-serif"],
    ["Tech", "Verdana", "style-proposals-font-tech"],
    ["Arial", "Arial", "style-proposals-font-arial"],
    ["Tahoma", "Tahoma", "style-proposals-font-tahoma"],
    ["Impact", "Impact", "style-proposals-font-impact"],
    ["Times", "Times New Roman", "style-proposals-font-times"],
    ["Console", "Consolas", "style-proposals-font-consolas"]
  ];

  return [
    '<section class="style-proposals-font-panel" aria-labelledby="style-proposals-font-title">',
    '  <div class="style-proposals-font-heading">',
    '    <span class="style-proposals-eyebrow">' + escapeHtml(t("ui.styles.typography")) + '</span>',
    '    <h3 id="style-proposals-font-title">' + escapeHtml(t("ui.styles.fonts")) + '</h3>',
    '    <p>' + escapeHtml(t("ui.styles.fontDescription")) + '</p>',
    '  </div>',
    '  <div class="style-proposals-font-grid">',
    fonts.map(function (font) {
      return [
        '    <article class="style-proposals-font-sample ' + escapeHtml(font[2]) + '">',
        '      <span>' + escapeHtml(font[0]) + '</span>',
        '      <strong>' + escapeHtml(font[1]) + '</strong>',
        '      <p>' + escapeHtml(t("ui.styles.fontSample")) + '</p>',
        '      <button type="button">' + escapeHtml(t("ui.styles.button")) + '</button>',
        '    </article>'
      ].join("");
    }).join(""),
    '  </div>',
    '</section>'
  ].join("");
}

function renderShinyMarkerShowcase() {
  return [
    '<section class="style-proposals-shiny-panel" aria-labelledby="style-proposals-shiny-title">',
    '  <div class="style-proposals-shiny-heading">',
    '    <span class="style-proposals-eyebrow">' + escapeHtml(t("ui.styles.shinyMarkerEyebrow")) + '</span>',
    '    <h3 id="style-proposals-shiny-title">' + escapeHtml(t("ui.styles.shinyMarkerTitle")) + '</h3>',
    '    <p>' + escapeHtml(t("ui.styles.shinyMarkerDescription")) + '</p>',
    '  </div>',
    '  <div class="style-proposals-shiny-preview" aria-label="' + escapeHtml(t("ui.styles.shinyMarkerAccessibleLabel")) + '">',
    '    <span class="style-proposals-shiny-name">' + escapeHtml(t("ui.styles.shinyMarkerSample")) + '</span>',
    '    <span class="shiny-marker style-proposals-shiny-marker" aria-hidden="true">★</span>',
    '  </div>',
    '</section>'
  ].join("");
}

function stylePopup(className) {
  return [
    '<div class="style-proposals-popup-scene ' + escapeHtml(className) + '">',
    '  <div class="style-proposals-popup-backdrop"></div>',
    '  <div class="style-proposals-popup-dialog">',
    '    <span class="style-proposals-popup-kicker">' + escapeHtml(t("ui.styles.popup")) + '</span>',
    '    <h4>' + escapeHtml(t("ui.styles.confirmAction")) + '</h4>',
    '    <p>' + escapeHtml(t("ui.styles.proceed")) + '</p>',
    '    <div class="style-proposals-popup-actions">',
    '      <button type="button" class="style-proposals-popup-button style-proposals-popup-yes">' + escapeHtml(t("ui.styles.yes")) + '</button>',
    '      <button type="button" class="style-proposals-popup-button style-proposals-popup-no">' + escapeHtml(t("ui.styles.no")) + '</button>',
    '    </div>',
    '  </div>',
    '</div>'
  ].join("");
}

function styleCard(number, title, text, cardClass, buttons, zoneButton, panel, popup) {
  return [
    '<article class="style-proposals-card ' + escapeHtml(cardClass) + '">',
    '  <div class="style-proposals-card-header">',
    '    <span>' + escapeHtml(number) + '</span>',
    '    <h3>' + escapeHtml(title) + '</h3>',
    '  </div>',
    '  <p>' + escapeHtml(text) + '</p>',
    '  <div class="style-proposals-button-row">',
    buttons.join(""),
    '  </div>',
    zoneButton,
    panel,
    popup || "",
    '</article>'
  ].join("");
}

function renderStyleZaino() {
  var inventorySections = ["tools", "held", "battle", "balls", "mt", "berries"].map(function (key) {
    return { key: key, title: t("ui.team.inventorySections." + key) };
  });
  var inventoryItems = resolveInventoryItems(state.inventory);

  function getInventorySectionKey(item) {
    var category = item.category || "";
    if (category === ItemCategory.Ball) { return "balls"; }
    if (category === ItemCategory.TM) { return "mt"; }
    if (category === ItemCategory.Vitamin) { return "tools"; }
    if (category === ItemCategory.HeldItem) { return "held"; }
    if (category === ItemCategory.Berry) { return "berries"; }
    if (category === ItemCategory.BattleItem) { return "battle"; }
    return "tools";
  }

  function renderInventoryItem(item) {
    var itemName = itemDisplayName(item);
    var imageSrc = getItemDisplayImage(item);
    var itemImageClass = item.category === ItemCategory.TM ? "style-zaino-item-image style-zaino-item-image-mt" : "style-zaino-item-image";
    var imageMarkup = imageSrc
      ? renderImage(imageSrc, itemName, itemImageClass)
      : '<span class="style-zaino-item-image style-zaino-item-image-empty"></span>';
    var availabilityMarkup = isSingleCopyInventoryItem(item) ? "" : '<div class="style-zaino-item-availability"><span class="style-zaino-item-quantity">x' + escapeHtml(item.quantity) + "</span></div>";

    return [
      '<article class="style-zaino-item-card">',
      '  <div class="style-zaino-item-media">',
      imageMarkup,
      availabilityMarkup,
      "  </div>",
      '  <div class="style-zaino-item-copy">',
      '    <div class="style-zaino-item-heading"><h3 class="style-zaino-item-name">' + escapeHtml(itemName) + "</h3></div>",
      '    <p class="style-zaino-item-description">' + escapeHtml(itemDisplayDescription(item)) + "</p>",
      "  </div>",
      "</article>"
    ].join("");
  }

  function renderInventorySection(section) {
    var sectionItems = inventoryItems.filter(function (item) {
      return getInventorySectionKey(item) === section.key;
    });
    if (!sectionItems.length) return "";
    var sectionContent = sectionItems.map(renderInventoryItem).join("");

    return [
      '<section class="style-zaino-pocket">',
      '  <h3 class="style-zaino-pocket-title">' + escapeHtml(section.title) + "</h3>",
      '  <div class="style-zaino-pocket-scroll">',
      '    <div class="style-zaino-item-grid">' + sectionContent + "</div>",
      "  </div>",
      "</section>"
    ].join("");
  }

  var zainoHtml = '<section class="style-zaino-panel"><div class="style-zaino-stack">' +
    inventorySections.map(renderInventorySection).join("") +
    '</div></section>';

  return [
    '<section class="style-zaino-section" aria-labelledby="style-zaino-title">',
    '  <div class="style-proposals-heading">',
    '    <span class="style-proposals-eyebrow">' + escapeHtml(t("ui.styles.bagEyebrow")) + '</span>',
    '    <h3 id="style-zaino-title">' + escapeHtml(t("ui.styles.bag")) + '</h3>',
    '    <p>' + escapeHtml(t("ui.styles.bagDescription")) + '</p>',
    '  </div>',
    zainoHtml,
    '</section>'
  ].join("");
}

var STYLE_PROPOSALS = Object.freeze([
  { number: "01", key: "cartridge", image: "bosco_smeraldo_bottone.webp" },
  { number: "02", key: "gym", image: "lega_kanto_bottone.webp" },
  { number: "03", key: "night", image: "torre_fantasma_bottone.webp" },
  { number: "04", key: "dossier", image: "zone_cattura_bottone.webp" },
  { number: "05", key: "badge", image: "campione_kanto_bottone.webp" },
  { number: "06", key: "crystal", image: "mare_bottone.webp" },
  { number: "07", key: "wood", image: "safari_bottone.webp" },
  { number: "08", key: "neon", image: "zafferanopoli_bottone.webp" },
  { number: "09", key: "brick", image: "plumbeopoli_bottone.webp" }
]);

function renderStyleProposal(proposal) {
  var baseKey = "ui.styles.proposals." + proposal.key;
  return styleCard(
    proposal.number,
    t(baseKey + ".title"),
    t(baseKey + ".text"),
    "style-proposals-card-" + proposal.key,
    [
      styleButton(t(baseKey + ".primary"), "style-proposals-button-" + proposal.key),
      styleButton(t(baseKey + ".secondary"), "style-proposals-button-" + proposal.key + "-alt")
    ],
    styleZoneButton(t(baseKey + ".zone"), proposal.image, "style-proposals-zone-" + proposal.key),
    stylePanel(t(baseKey + ".panelTitle"), t(baseKey + ".panelText"), "style-proposals-panel-" + proposal.key),
    stylePopup("style-proposals-popup-" + proposal.key)
  );
}

export function renderStylesScene() {
  var content = [
    '<section class="style-proposals" aria-labelledby="style-proposals-title">',
    '  <div class="style-proposals-heading">',
    '    <span class="style-proposals-eyebrow">' + escapeHtml(t("ui.styles.eyebrow")) + '</span>',
    '    <h2 id="style-proposals-title">' + escapeHtml(t("ui.styles.sceneTitle")) + '</h2>',
    '    <p>' + escapeHtml(t("ui.styles.intro")) + '</p>',
    '  </div>',
    renderFontShowcase(),
    renderShinyMarkerShowcase(),
    '  <div class="style-proposals-grid">',
    STYLE_PROPOSALS.map(renderStyleProposal).join(""),
    '  </div>',
    renderStyleZaino(),
    '</section>'
  ].join("");

  return sceneShell(t("ui.styles.sceneTitle"), "", content, "", "scene-content-style-proposals", "parent-back");
}
