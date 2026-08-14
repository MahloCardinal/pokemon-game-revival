import { registerAction } from "./action-registry.js";
import { openMessage } from "./dialog-handler.js";
import { renderRegions, setHtml } from "./renderer.js";
import { saveAfterStateChange } from "./save-runtime.js";
import { applyPlayerSave, root, state } from "./game-state.js";
import { requireNotInBattle } from "./battle-scene-lock.js";
import { getItemByIndex, getResolvedInventoryItem } from "../data/items.js";
import { adjustInventoryItemQuantity, adjustTrainerMoney, adjustShopPurchaseQuantity } from "./runtime-state.js";
import { updatePlayerShopPurchases } from "../api/shop.js";
import { buyShopItemAuthoritative, sellShopItemAuthoritative } from "../api/player-command.js";
import { saveFromAuthoritativeProjection } from "../api/player.js";
import { shoppingCenterItemCanBePurchased, shoppingCenterRemainingCartQuantity, shoppingCenterIsSellSection, shoppingCenterSectionify, computeCartEntries, computeCartTotal } from "../data/shopping-center.js";
import { renderShoppingCenterCartPanelContent, renderShoppingCenterItemGridContent } from "../view/shopping-center.js";

var authoritativeShopCommandPending = false;

function activeCart() {
  if (shoppingCenterIsSellSection(state.scene && state.scene.shoppingCenterSection)) {
    if (!state.shoppingCenterSellCart) state.shoppingCenterSellCart = {};
    return state.shoppingCenterSellCart;
  }
  if (!state.shoppingCenterCart) state.shoppingCenterCart = {};
  return state.shoppingCenterCart;
}

registerAction("shopping-center-section", function(element) {
  updateSectionDom(element.dataset.section);
});

registerAction("shopping-center-buy-item", function(element) {
  var itemIndex = Number(element.dataset.itemIndex);
  var requestedQty = Math.max(1, Math.floor(Number(element.dataset.quantity) || 1));
  var item = getItemByIndex(itemIndex);
  if (!item || !shoppingCenterItemCanBePurchased(item, state)) return;
  if (!state.shoppingCenterCart) state.shoppingCenterCart = {};
  var remaining = shoppingCenterRemainingCartQuantity(item, state, state.shoppingCenterCart);
  var qty = remaining === Infinity ? requestedQty : Math.min(requestedQty, remaining);
  if (qty <= 0) return;
  state.shoppingCenterCart[String(item.index)] = (Number(state.shoppingCenterCart[String(item.index)]) || 0) + qty;
  updateCartInline();
  showFeedback(element);
});

registerAction("shopping-center-sell-item", function(element) {
  var itemIndex = Number(element.dataset.itemIndex);
  var item = getResolvedInventoryItem(state.inventory, itemIndex);
  if (!item || !shoppingCenterIsSellSection(state.scene && state.scene.shoppingCenterSection)) return;
  if (!state.shoppingCenterSellCart) state.shoppingCenterSellCart = {};
  var cartQty = Number(state.shoppingCenterSellCart[String(itemIndex)]) || 0;
  var maxQty = Math.floor(Number(item.quantity) || 0);
  var remaining = Math.max(0, maxQty - cartQty);
  var inputQty = sellQuantityFromInput(itemIndex);
  var qty = Math.min(inputQty, remaining);
  if (qty <= 0) return;
  state.shoppingCenterSellCart[String(itemIndex)] = cartQty + qty;
  updateCartInline();
  showFeedback(element);
});

registerAction("shopping-center-confirm-purchases", function(element) {
  confirmPurchases();
});

registerAction("shopping-center-confirm-sale", function(element) {
  confirmSale();
});

registerAction("shopping-center-clear-cart", function(element) {
  if (shoppingCenterIsSellSection(state.scene && state.scene.shoppingCenterSection)) {
    state.shoppingCenterSellCart = {};
  } else {
    state.shoppingCenterCart = {};
  }
  updateCartInline();
});

registerAction("shopping-center-remove-cart-item", function(element) {
  var cart = activeCart();
  delete cart[String(element.dataset.itemIndex)];
  updateCartInline();
});

function updateCartInline() {
  var panel = root.querySelector("[data-shopping-center-cart-panel]");
  var pokedollars = Number(state.trainerInfo[1]) || 0;
  var sectionKey = state.scene && state.scene.name === "shopping-center" ? state.scene.shoppingCenterSection : "";
  var isSell = shoppingCenterIsSellSection(sectionKey);
  var cart = activeCart();
  var entries = computeCartEntries(cart, isSell, state.inventory, state);
  var total = computeCartTotal(entries);
  if (panel) {
    setHtml(panel, renderShoppingCenterCartPanelContent(pokedollars, entries, total, isSell));
  }
  updatePurchaseControlsInline();
  updateSellControlsInline();
}

function updatePurchaseControlsInline() {
  if (!state.scene || state.scene.name !== "shopping-center" || shoppingCenterIsSellSection(state.scene.shoppingCenterSection)) return;
  root.querySelectorAll('[data-action="shopping-center-buy-item"][data-item-index]').forEach(function (btn) {
    var item = getItemByIndex(btn.dataset.itemIndex);
    var remaining = item ? shoppingCenterRemainingCartQuantity(item, state, state.shoppingCenterCart || {}) : 0;
    btn.disabled = !item || !shoppingCenterItemCanBePurchased(item, state) || remaining <= 0;
  });
}

function sellRemainingQuantity(itemIndex) {
  var item = getResolvedInventoryItem(state.inventory, itemIndex);
  var cartQty = Number((state.shoppingCenterSellCart || {})[String(itemIndex)]) || 0;
  return item ? Math.max(0, (Number(item.quantity) || 0) - cartQty) : 0;
}

function updateSellControlsInline() {
  if (!state.scene || state.scene.name !== "shopping-center" || !shoppingCenterIsSellSection(state.scene.shoppingCenterSection)) return;
  root.querySelectorAll('[data-action="shopping-center-sell-item"][data-item-index]').forEach(function (btn) {
    btn.disabled = sellRemainingQuantity(btn.dataset.itemIndex) <= 0;
  });
}

function showFeedback(buttonElement) {
  if (!buttonElement) return;
  buttonElement.disabled = true;
  buttonElement.classList.add("is-shopping-center-added");
  window.setTimeout(function () {
    if (!buttonElement.isConnected) return;
    buttonElement.disabled = false;
    buttonElement.classList.remove("is-shopping-center-added");
    updatePurchaseControlsInline();
    updateSellControlsInline();
  }, 500);
}

function updateSectionDom(sectionKey) {
  var nextSection = shoppingCenterSectionify(sectionKey);
  var prevSection = state.scene && state.scene.shoppingCenterSection;
  var grid = root.querySelector("[data-shopping-center-item-grid]");
  if (!state.scene || state.scene.name !== "shopping-center") return;
  state.scene.shoppingCenterSection = nextSection;
  if (prevSection !== nextSection && (shoppingCenterIsSellSection(nextSection) || shoppingCenterIsSellSection(prevSection))) {
    state.shoppingCenterSellCart = {};
  }
  root.querySelectorAll('[data-action="shopping-center-section"]').forEach(function (btn) {
    var isSelected = btn.dataset.section === nextSection;
    btn.classList.toggle("button-primary", isSelected);
    btn.classList.toggle("button-ghost", !isSelected);
  });
  if (grid) {
    setHtml(grid, renderShoppingCenterItemGridContent(nextSection));
  }
  updateCartInline();
}

async function runAuthoritativeCart(entries, command, cartKey) {
  var projection = null;
  var result;
  var completed = 0;
  var revision = state.authoritativeRevision;
  if (authoritativeShopCommandPending) return false;
  authoritativeShopCommandPending = true;
  try {
    for (completed = 0; completed < entries.length; completed += 1) {
      result = await command({
        expectedRevision: revision,
        itemIndex: entries[completed].item.index,
        quantity: entries[completed].quantity
      });
      if (!result.ok) {
        if (projection) {
          applyPlayerSave(saveFromAuthoritativeProjection(projection));
          state[cartKey] = entries.slice(completed).reduce(function (cart, entry) {
            cart[String(entry.item.index)] = entry.quantity;
            return cart;
          }, {});
        }
        openMessage([result.message || "Comando negozio non riuscito."], { title: "Centro commerciale" });
        renderRegions(["shopping-center-cart", "shopping-center-items"]);
        return false;
      }
      projection = result.projection;
      revision = Number(projection && projection.revision);
    }
    applyPlayerSave(saveFromAuthoritativeProjection(projection));
    state[cartKey] = {};
    state.dialog = null;
    state.saveStatus = { state: "saved", message: "" };
    renderRegions(["shopping-center-cart", "shopping-center-items"]);
    return true;
  } finally {
    authoritativeShopCommandPending = false;
  }
}

async function confirmPurchases() {
  var cart = state.shoppingCenterCart || {};
  var entries = computeCartEntries(cart, false, null, state);
  var total = computeCartTotal(entries);
  var money = Number(state.trainerInfo[1]) || 0;
  if (!requireNotInBattle()) return;
  if (!entries.length) {
    openMessage(["Nessuno strumento selezionato."], { title: "Centro commerciale" });
    return;
  }
  if (await runAuthoritativeCart(entries, buyShopItemAuthoritative, "shoppingCenterCart")) {
    openMessage(["Acquisto effettuato"], { title: "Centro commerciale" });
  }
  return;
}

async function confirmSale() {
  var entries = computeCartEntries(state.shoppingCenterSellCart || {}, true, state.inventory, state);
  var total = computeCartTotal(entries);
  if (!requireNotInBattle()) return;
  if (!entries.length) {
    openMessage(["Nessuno strumento selezionato."], { title: "Centro commerciale" });
    return;
  }
  await runAuthoritativeCart(entries, sellShopItemAuthoritative, "shoppingCenterSellCart");
  return;
}

function sellQuantityFromInput(itemIndex) {
  var input = root.querySelector('[data-field="shopping-center-sell-quantity"][data-item-index="' + itemIndex + '"]');
  var ownedItem = getResolvedInventoryItem(state.inventory, itemIndex);
  var maxQty = ownedItem ? Math.floor(Number(ownedItem.quantity) || 0) : 0;
  if (!input) return 0;
  var text = String(input.value || "").replace(/\D/g, "");
  var quantity = Math.floor(Number(text) || 0);
  if (quantity > maxQty) quantity = maxQty;
  input.value = quantity > 0 ? String(quantity) : "";
  return quantity;
}
