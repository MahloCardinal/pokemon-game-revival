import {
  flauto_bianco,
  flauto_nero,
  occhialoni,
  spettrosonda,
  ItemCategory
} from "../data/items.js";

var SINGLE_COPY_INVENTORY_ITEM_INDEXES = Object.freeze([
  occhialoni.index,
  spettrosonda.index,
  flauto_bianco.index,
  flauto_nero.index
]);

export function isSingleCopyInventoryItem(item) {
  var itemIndex = Number(item && item.index);
  return Boolean(item && (item.category === ItemCategory.Mt
    || SINGLE_COPY_INVENTORY_ITEM_INDEXES.indexOf(itemIndex) !== -1));
}
