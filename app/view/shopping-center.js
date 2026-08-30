import { ItemCategory } from "../data/items.js";
import { SHOPPING_CENTER_SECTIONS, getShoppingCenterSections, getShoppingCenterGroups, shoppingCenterSalePrice, shoppingCenterIsSellSection, shoppingCenterItemIsSinglePurchase, shoppingCenterSectionify, computeCartEntries, computeCartTotal } from "../data/shopping-center.js";
import { state } from "../client/game-state.js";
import { escapeHtml, getItemDisplayImage, renderImage } from "../client/asset-helpers.js";
import { button, formatInteger, moneyMarkup, renderScenePresentationPanel, sceneShell } from "../client/render-utils.js";
import { isDebugUser } from "../client/debug-tools.js";
import { itemDisplayDescription, itemDisplayName } from "../client/entity-text.js";
import { t } from "../client/i18n.js";

function shoppingCenterItemImageMarkup(item) {
  var imageClass = item && item.category === ItemCategory.TM ? "inventory-item-image shopping-center-mt-image" : "inventory-item-image";
  var imageSrc = getItemDisplayImage(item);
  return imageSrc ? renderImage(imageSrc, itemDisplayName(item), imageClass) : '<span class="inventory-item-image inventory-item-image-empty"></span>';
}

function renderDebugAddButton(item) {
  if (!isDebugUser()) return "";
  return button("+50", "debug-add-item", 'data-item-index="' + escapeHtml(item.index) + '"', "button-ghost button-slim shopping-center-debug-add-item");
}

function shoppingCenterItemDescription(item) {
  return itemDisplayDescription(item);
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
    '      <h3 class="market-item-name shopping-center-item-name">' + escapeHtml(itemDisplayName(item)) + "</h3>",
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
  var stockText = canPurchase && entry.stockRemaining !== Infinity ? '<span class="shopping-center-sell-stock">' + escapeHtml(t("ui.shoppingCenter.availableShort")) + " " + escapeHtml(formatInteger(entry.stockRemaining)) + "</span>" : "";
  var showPrice = shoppingCenterShouldShowPrice(entry);
  var actionHtml;
  if (canPurchase) {
    if (isSinglePurchase) {
      actionHtml = button(t("ui.shoppingCenter.buy"), "shopping-center-buy-item", 'data-item-index="' + escapeHtml(item.index) + '" data-quantity="1"', "button-primary");
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
      '    <span class="shopping-center-sell-stock">' + escapeHtml(t("ui.shoppingCenter.availableShort")) + " " + escapeHtml(formatInteger(item.quantity)) + "</span>",
      '    <input class="shopping-center-sell-quantity" type="text" inputmode="numeric" pattern="[0-9]*" value="1" aria-label="' + escapeHtml(t("ui.shoppingCenter.sellQuantity")) + '" data-field="shopping-center-sell-quantity" data-item-index="' + escapeHtml(item.index) + '" data-max-quantity="' + escapeHtml(item.quantity) + '">',
      button(t("ui.shoppingCenter.add"), "shopping-center-sell-item", 'data-item-index="' + escapeHtml(item.index) + '"', "button-primary shopping-center-sell-button")
    ].join("")
  });
}

function shoppingCenterGroupTitle(group) {
  var category = t("ui.shoppingCenter.categories." + group.categoryKey);
  var availabilityKey = String(group.availabilityKey || "");
  var availability;
  if (!availabilityKey || availabilityKey === "sell") return category;
  availability = t("ui.shoppingCenter.availability." + availabilityKey, {
    count: group.requiredBadges,
    badges: t(group.requiredBadges === 1 ? "ui.shoppingCenter.badgeOne" : "ui.shoppingCenter.badgeMany")
  });
  return category + " - " + availability;
}

function renderShoppingCenterItemGroup(group, isSellSection) {
  var items = group.items || [];
  var title = shoppingCenterGroupTitle(group);
  if (!items.length) return "";
  return [
    '<section class="shopping-center-item-group">',
    title ? '  <h2 class="stack-title shopping-center-group-title">' + escapeHtml(title) + "</h2>" : "",
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
  if (!groups.length) return '<p class="empty-state inventory-empty">' + escapeHtml(t("ui.shoppingCenter.emptyItems")) + "</p>";
  return groups.map(function (g) { return renderShoppingCenterItemGroup(g, isSell); }).join("");
}

function renderShoppingCenterSectionPanel(activeSectionName) {
  var sections = getShoppingCenterSections();
  var buttons = sections.map(function (sectionName) {
    var selectedClass = sectionName === activeSectionName ? " button-primary" : " button-ghost";
    return button(t("ui.shoppingCenter.sections." + sectionName), "shopping-center-section", 'data-section="' + escapeHtml(sectionName) + '"', "button-slim" + selectedClass);
  }).join("");
  return '<section class="panel shopping-center-sections-panel"><div class="panel-inner"><div class="shopping-center-tabs">' + buttons + "</div></div></section>";
}

export function renderShoppingCenterCartPanelContent(pokedollars, entries, total, isSale) {
  var confirmLabel = isSale ? t("ui.shoppingCenter.sections.sell") : t("ui.shoppingCenter.purchase");
  var confirmAction = isSale ? "shopping-center-confirm-sale" : "shopping-center-confirm-purchases";
  var totalLabel = t(isSale ? "ui.shoppingCenter.saleTotal" : "ui.shoppingCenter.purchaseTotal");
  var rows = entries.length ? entries.map(function (entry) {
    return [
      '<div class="shopping-center-cart-row" data-shopping-center-cart-item="' + escapeHtml(entry.item.index) + '">',
      '  <span class="shopping-center-cart-quantity">x' + escapeHtml(formatInteger(entry.quantity)) + "</span>",
      '  <span class="shopping-center-cart-name">' + escapeHtml(itemDisplayName(entry.item)) + "</span>",
      '  <strong class="shopping-center-cart-price">' + moneyMarkup(entry.subtotal) + "</strong>",
      button(t("ui.shoppingCenter.remove"), "shopping-center-remove-cart-item", 'data-item-index="' + escapeHtml(entry.item.index) + '"', "button-dark button-slim"),
      "</div>"
    ].join("");
  }).join("") : '<p class="empty-state shopping-center-cart-empty">' + escapeHtml(t("ui.shoppingCenter.emptyCart")) + "</p>";
  return [
    '<div class="shopping-center-cart-list-cell">',
    '  <div class="shopping-center-cart-scroll" data-scroll-key="shopping-center-cart">',
    '    <div class="shopping-center-cart-list">' + rows + "</div>",
    "  </div>",
    "</div>",
    '<div class="shopping-center-cart-info-cell">',
    '  <div class="shopping-center-cart-summary">',
    '    <span>' + escapeHtml(t("ui.shoppingCenter.availableFunds")) + "</span>",
    '    <strong>' + moneyMarkup(pokedollars) + "</strong>",
    "  </div>",
    '  <div class="shopping-center-cart-summary">',
    '    <span>' + totalLabel + "</span>",
    '    <strong data-shopping-center-cart-total>' + moneyMarkup(total) + "</strong>",
    "  </div>",
    '  <div class="shopping-center-cart-actions button-row">',
    button(confirmLabel, confirmAction, total ? "" : "disabled", "button-accent"),
    button(t("ui.shoppingCenter.clear"), "shopping-center-clear-cart", total ? "" : "disabled", "button-ghost"),
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
  return sceneShell(t("ui.shoppingCenter.sceneTitle"), "", [
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
