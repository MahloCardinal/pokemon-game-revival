import { root } from "./game-state.js";

export function reindexActionButtons(actionName, removedIndex) {
  root.querySelectorAll('[data-action="' + actionName + '"]').forEach(function (buttonNode) {
    var currentIndex = Number(buttonNode.dataset.index);
    if (Number.isFinite(currentIndex) && currentIndex > removedIndex) {
      buttonNode.dataset.index = String(currentIndex - 1);
    }
  });
}
