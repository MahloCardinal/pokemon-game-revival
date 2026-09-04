import { registerAction } from "./action-registry.js";
import { state } from "./game-state.js";
import { escapeHtml, getItemDisplayImage, renderImage } from "./asset-helpers.js";
import { setHtml } from "./renderer.js";
import { getResolvedInventoryItem, ItemCategory } from "../data/items.js";
import { itemDisplayDescription, itemDisplayName } from "./entity-text.js";

registerAction("inventory-toggle-item", function(element) {
    var toggledItemIndex = String(element.dataset.itemIndex || "");
    var toggledItem;
    var isFlipped;
    if (toggledItemIndex) {
      isFlipped = !state.inventoryFlippedItems[toggledItemIndex];
      state.inventoryFlippedItems[toggledItemIndex] = isFlipped;
      toggledItem = getResolvedInventoryItem(state.inventory, toggledItemIndex);
      updateInventoryItemCard(element, toggledItem, isFlipped);
    }
    return;

});

function updateInventoryItemCard(card, item, isFlipped) {
  var imageMarkup;
  var imageSrc;
  var nameClass;
  var quantityMarkup;
  var displayName;
  if (!card || !item) {
    return;
  }
  card.classList.toggle("is-flipped", isFlipped);
  if (isFlipped) {
    setHtml(card, '  <span class="inventory-item-detail">' + escapeHtml(itemDisplayDescription(item)) + "</span>");
    return;
  }
  imageSrc = getItemDisplayImage(item);
  displayName = itemDisplayName(item);
  var itemImageClass = item.category === ItemCategory.TM ? "inventory-item-image inventory-item-image-mt" : "inventory-item-image";
  imageMarkup = imageSrc
    ? renderImage(imageSrc, displayName, itemImageClass)
    : '<span class="inventory-item-image inventory-item-image-empty"></span>';
  nameClass = card.classList.contains("battle-inventory-item-card") && displayName.length > 14 ? " is-long-name" : "";
  quantityMarkup = item.category === ItemCategory.TM ? "" : '  <span class="inventory-item-quantity">x' + escapeHtml(item.quantity) + "</span>";
  setHtml(card, [
    imageMarkup,
    '  <span class="inventory-item-name' + nameClass + '">' + escapeHtml(displayName) + "</span>",
    quantityMarkup
  ].join(""));
}
