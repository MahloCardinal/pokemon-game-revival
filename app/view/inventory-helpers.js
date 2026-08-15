import {
  white_flute,
  black_flute,
  go_goggles,
  silph_scope,
  ItemCategory
} from "../data/items.js";

var SINGLE_COPY_INVENTORY_ITEM_INDEXES = Object.freeze([
  go_goggles.index,
  silph_scope.index,
  white_flute.index,
  black_flute.index
]);

export function isSingleCopyInventoryItem(item) {
  var itemIndex = Number(item && item.index);
  return Boolean(item && (item.category === ItemCategory.TM
    || SINGLE_COPY_INVENTORY_ITEM_INDEXES.indexOf(itemIndex) !== -1));
}
