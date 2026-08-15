import { ItemCategory } from "../data/items.js";
import { SHOPPING_CENTER_SECTIONS, getShoppingCenterSections, getShoppingCenterGroups, shoppingCenterSalePrice, shoppingCenterIsSellSection, shoppingCenterItemIsSinglePurchase, shoppingCenterSectionify, shoppingCenterSectionDisplayName, computeCartEntries, computeCartTotal } from "../data/shopping-center.js";
import { formatCatalogDescription } from "../engine/index.js";
import { state } from "../client/game-state.js";
import { escapeHtml, getItemDisplayImage, renderImage } from "../client/asset-helpers.js";
import { button, formatInteger, moneyMarkup, renderScenePresentationPanel, sceneShell } from "../client/render-utils.js";
import { isDebugUser } from "../client/debug-tools.js";

function shoppingCenterItemImageMarkup(item) {
  var imageClass = item && item.category === ItemCategory.TM ? "inventory-item-image shopping-center-mt-image" : "inventory-item-image";
  var imageSrc = getItemDisplayImage(item);
  return imageSrc ? renderImage(imageSrc, item.name, imageClass) : '<span class="inventory-item-image inventory-item-image-empty"></span>';
}

function renderDebugAddButton(item) {
  if (!isDebugUser()) return "";
  return button("+50", "debug-add-item", 'data-item-index="' + escapeHtml(item.index) + '"', "button-ghost button-slim shopping-center-debug-add-item");
}

function shoppingCenterItemDescription(item) {
  return item.category === ItemCategory.TM && item.move ? formatCatalogDescription(item.move) : item.description;
}

function shoppingCenterPurchaseButtons(item, sectionName) {
  var quantities = [1, 5];
  if (sectionName === SHOPPING_CENTER_SECTIONS.MARKET) {
    quantities = [1, 3];
  } else if (sectionName === SHOPPING_CENTER_SECTIONS.PORT || sectionName === SHOPPING_CENTER_SECTIONS.DEVON) {
    quantities = [1];
  }
  return quantities.map(function (quantity) {
    return button("+" + quantity, "shopping-center-buy-item", 'data-item-index="' + escapeHtml(item.index) + '" data-quantity="' + quantity + '"', "button-primary");
  }).join("");
}

function shoppingCenterShouldShowPrice(entry) {
  var availabilityKey = entry && entry.availability ? entry.availability.key : "";
  return Boolean(entry && entry.price !== null && (
    entry.canPurchase
    || availabilityKey === "unlocked"
    || availabilityKey === "locked_badges"
  ));
}

function renderShoppingCenterItemCardFrame(options) {
  var item = options.item;
  var actionsClass = options.actionsClass || "";
  var actionsHtml = options.actionsHtml ? '  <div class="market-item-actions shopping-center-item-actions' + actionsClass + '">' + options.actionsHtml + "  </div>" : "";
  return [
    '<article class="market-item-card shopping-center-item-card' + (options.cardClass || "") + '" data-shopping-center-item-index="' + escapeHtml(item.index) + '">',
    '  <div class="market-item-media shopping-center-item-media">',
    shoppingCenterItemImageMarkup(item),
    options.priceHtml ? '    <strong class="market-item-price shopping-center-item-price">' + options.priceHtml + "</strong>" : "",
    "  </div>",
    '  <div class="market-item-copy shopping-center-item-copy">',
    '    <div class="shopping-center-item-heading">',
    '      <h3 class="market-item-name shopping-center-item-name">' + escapeHtml(item.name) + "</h3>",
    "    </div>",
    '    <p class="market-item-description shopping-center-item-description">' + escapeHtml(shoppingCenterItemDescription(item)) + "</p>",
    "  </div>",
    actionsHtml,
    "</article>"
  ].join("");
}

function renderShoppingCenterItemCard(entry) {
  var item = entry.item;
  var price = entry.price;
  var canPurchase = entry.canPurchase;
  var cardClass = canPurchase ? " is-purchasable" : " is-not-purchasable";
  var isSinglePurchase = shoppingCenterItemIsSinglePurchase(item);
  var actionClass = isSinglePurchase ? " is-single-action" : "";
  var stockText = canPurchase && entry.stockRemaining !== Infinity ? '<span class="shopping-center-sell-stock">Disp. ' + escapeHtml(formatInteger(entry.stockRemaining)) + "</span>" : "";
  var showPrice = shoppingCenterShouldShowPrice(entry);
  var actionHtml;
  if (canPurchase) {
    if (isSinglePurchase) {
      actionHtml = button("Compra", "shopping-center-buy-item", 'data-item-index="' + escapeHtml(item.index) + '" data-quantity="1"', "button-primary");
    } else {
      actionHtml = shoppingCenterPurchaseButtons(item, entry.section);
    }
  } else {
    actionHtml = "";
  }
  var debugBtn = renderDebugAddButton(item);
  return renderShoppingCenterItemCardFrame({
    item: item,
    cardClass: cardClass,
    priceHtml: showPrice ? moneyMarkup(price) : "",
    actionsClass: actionClass,
    actionsHtml: canPurchase || debugBtn ? stockText + actionHtml + debugBtn : ""
  });
}

function renderShoppingCenterSellItemCard(item) {
  var price = shoppingCenterSalePrice(item);
  return renderShoppingCenterItemCardFrame({
    item: item,
    cardClass: " is-sellable",
    priceHtml: moneyMarkup(price),
    actionsClass: " shopping-center-sell-actions",
    actionsHtml: [
      '    <span class="shopping-center-sell-stock">Disp. ' + escapeHtml(formatInteger(item.quantity)) + "</span>",
      '    <input class="shopping-center-sell-quantity" type="text" inputmode="numeric" pattern="[0-9]*" value="1" aria-label="Quantit\u00e0 da vendere" data-field="shopping-center-sell-quantity" data-item-index="' + escapeHtml(item.index) + '" data-max-quantity="' + escapeHtml(item.quantity) + '">',
      button("Aggiungi", "shopping-center-sell-item", 'data-item-index="' + escapeHtml(item.index) + '"', "button-primary shopping-center-sell-button")
    ].join("")
  });
}

function renderShoppingCenterItemGroup(group, isSellSection) {
  var items = group.items || [];
  if (!items.length) return "";
  return [
    '<section class="shopping-center-item-group">',
    group.title ? '  <h2 class="stack-title shopping-center-group-title">' + escapeHtml(group.title) + "</h2>" : "",
    '  <div class="shopping-center-item-group-grid">',
    items.map(function (entry) {
      if (!isSellSection) return renderShoppingCenterItemCard(entry);
      return renderShoppingCenterSellItemCard(entry);
    }).join(""),
    "  </div>",
    "</section>"
  ].join("");
}

export function renderShoppingCenterItemGridContent(sectionName) {
  var isSell = shoppingCenterIsSellSection(sectionName);
  var groups = getShoppingCenterGroups(sectionName, state);
  if (!groups.length) return '<p class="empty-state inventory-empty">Nessun oggetto disponibile.</p>';
  return groups.map(function (g) { return renderShoppingCenterItemGroup(g, isSell); }).join("");
}

function renderShoppingCenterSectionPanel(activeSectionName) {
  var sections = getShoppingCenterSections();
  var buttons = sections.map(function (sectionName) {
    var selectedClass = sectionName === activeSectionName ? " button-primary" : " button-ghost";
    return button(shoppingCenterSectionDisplayName(sectionName), "shopping-center-section", 'data-section="' + escapeHtml(sectionName) + '"', "button-slim" + selectedClass);
  }).join("");
  return '<section class="panel shopping-center-sections-panel"><div class="panel-inner"><div class="pokemon-center-action-row rules-section-row">' + buttons + "</div></div></section>";
}

export function renderShoppingCenterCartPanelContent(pokedollars, entries, total, isSale) {
  var confirmLabel = isSale ? shoppingCenterSectionDisplayName(SHOPPING_CENTER_SECTIONS.SELL) : "Acquista";
  var confirmAction = isSale ? "shopping-center-confirm-sale" : "shopping-center-confirm-purchases";
  var totalLabel = isSale ? "Totale vendita" : "Totale spesa";
  var rows = entries.length ? entries.map(function (entry) {
    return [
      '<div class="shopping-center-cart-row" data-shopping-center-cart-item="' + escapeHtml(entry.item.index) + '">',
      '  <span class="shopping-center-cart-quantity">x' + escapeHtml(formatInteger(entry.quantity)) + "</span>",
      '  <span class="shopping-center-cart-name">' + escapeHtml(entry.item.name) + "</span>",
      '  <strong class="shopping-center-cart-price">' + moneyMarkup(entry.subtotal) + "</strong>",
      button("Togli", "shopping-center-remove-cart-item", 'data-item-index="' + escapeHtml(entry.item.index) + '"', "button-dark button-slim"),
      "</div>"
    ].join("");
  }).join("") : '<p class="empty-state shopping-center-cart-empty">Carrello vuoto.</p>';
  return [
    '<div class="shopping-center-cart-list-cell">',
    '  <div class="shopping-center-cart-scroll" data-scroll-key="shopping-center-cart">',
    '    <div class="shopping-center-cart-list">' + rows + "</div>",
    "  </div>",
    "</div>",
    '<div class="shopping-center-cart-info-cell">',
    '  <div class="shopping-center-cart-summary">',
    '    <span>Disponibili</span>',
    '    <strong>' + moneyMarkup(pokedollars) + "</strong>",
    "  </div>",
    '  <div class="shopping-center-cart-summary">',
    '    <span>' + totalLabel + "</span>",
    '    <strong data-shopping-center-cart-total>' + moneyMarkup(total) + "</strong>",
    "  </div>",
    '  <div class="shopping-center-cart-actions button-row">',
    button(confirmLabel, confirmAction, total ? "" : "disabled", "button-accent"),
    button("Svuota", "shopping-center-clear-cart", total ? "" : "disabled", "button-ghost"),
    "  </div>",
    "</div>"
  ].join("");
}

function renderShoppingCenterCartPanel(pokedollars, entries, total, isSale) {
  return [
    '<section class="panel shopping-center-cart-panel" data-render-region="shopping-center-cart"><div class="panel-inner shopping-center-cart-panel-inner" data-shopping-center-cart-panel>',
    renderShoppingCenterCartPanelContent(pokedollars, entries, total, isSale),
    "</div></section>"
  ].join("");
}

export function renderShoppingCenterScene() {
  var pokedollars = Number(state.trainerInfo[1]) || 0;
  var activeSection = shoppingCenterSectionify(state.scene && state.scene.shoppingCenterSection);
  var isSell = shoppingCenterIsSellSection(activeSection);
  var cart = isSell ? (state.shoppingCenterSellCart || {}) : (state.shoppingCenterCart || {});
  var entries = computeCartEntries(cart, isSell, state.inventory, state);
  var total = computeCartTotal(entries);
  return sceneShell("Centro commerciale", "", [
    '<section class="shopping-center-layout">',
    renderScenePresentationPanel("shopping_center", "shopping-center-info-panel"),
    '  <div class="shopping-center-top-row">',
    renderShoppingCenterSectionPanel(activeSection),
    renderShoppingCenterCartPanel(pokedollars, entries, total, isSell),
    "  </div>",
    '<div class="shopping-center-grid market-grid" data-shopping-center-item-grid data-render-region="shopping-center-items">' + renderShoppingCenterItemGridContent(activeSection) + "</div>",
    "</section>"
  ].join(""), "", "scene-content-shopping-center", "parent-back");
}
