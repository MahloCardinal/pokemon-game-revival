var activeHeldItemTarget = null;
var heldItemTooltip = null;
var heldItemTooltipFrame = null;
var heldItemTooltipPinned = false;
var lastTouchTooltipPointerTime = 0;

var TOOLTIP_MARGIN = 12;
var TOOLTIP_GAP = 8;
var TOOLTIP_MAX_WIDTH = 280;
var TOUCH_FOCUS_SUPPRESSION_MS = 750;

function ensureHeldItemTooltip() {
  if (heldItemTooltip) {
    return heldItemTooltip;
  }

  heldItemTooltip = document.createElement("div");
  heldItemTooltip.className = "held-item-tooltip-global";
  heldItemTooltip.setAttribute("role", "tooltip");
  heldItemTooltip.hidden = true;
  document.body.appendChild(heldItemTooltip);
  return heldItemTooltip;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

function positionHeldItemTooltip() {
  var tooltip;
  var targetRect;
  var tooltipRect;
  var viewportWidth;
  var viewportHeight;
  var maxTooltipWidth;
  var left;
  var top;

  heldItemTooltipFrame = null;
  if (!activeHeldItemTarget || !document.body.contains(activeHeldItemTarget)) {
    hideHeldItemTooltip();
    return;
  }

  tooltip = ensureHeldItemTooltip();
  if (tooltip.hidden) {
    return;
  }

  viewportWidth = document.documentElement.clientWidth || window.innerWidth;
  viewportHeight = document.documentElement.clientHeight || window.innerHeight;
  maxTooltipWidth = Math.min(TOOLTIP_MAX_WIDTH, Math.max(0, viewportWidth - (TOOLTIP_MARGIN * 2)));
  tooltip.style.maxWidth = maxTooltipWidth + "px";

  targetRect = activeHeldItemTarget.getBoundingClientRect();
  tooltipRect = tooltip.getBoundingClientRect();
  left = clamp(targetRect.left, TOOLTIP_MARGIN, viewportWidth - tooltipRect.width - TOOLTIP_MARGIN);
  top = targetRect.bottom + TOOLTIP_GAP;

  if (top + tooltipRect.height + TOOLTIP_MARGIN > viewportHeight && targetRect.top - tooltipRect.height - TOOLTIP_GAP >= TOOLTIP_MARGIN) {
    top = targetRect.top - tooltipRect.height - TOOLTIP_GAP;
  }
  top = clamp(top, TOOLTIP_MARGIN, viewportHeight - tooltipRect.height - TOOLTIP_MARGIN);

  tooltip.style.left = left + "px";
  tooltip.style.top = top + "px";
}

function scheduleHeldItemTooltipPosition() {
  if (!activeHeldItemTarget || heldItemTooltipFrame) {
    return;
  }
  heldItemTooltipFrame = window.requestAnimationFrame(positionHeldItemTooltip);
}

function isTooltipVisibleFor(target) {
  return activeHeldItemTarget === target && heldItemTooltip && !heldItemTooltip.hidden;
}

function pointerEventIsTouch(event) {
  return event && event.pointerType === "touch";
}

function isRecentTouchTooltipPointer() {
  return Date.now() - lastTouchTooltipPointerTime < TOUCH_FOCUS_SUPPRESSION_MS;
}

function showHeldItemTooltip(target, options) {
  var text = target && target.dataset ? String(target.dataset.heldItemTooltip || "").trim() : "";
  var tooltip;

  options = options || {};

  if (!text) {
    hideHeldItemTooltip();
    return;
  }

  activeHeldItemTarget = target;
  heldItemTooltipPinned = Boolean(options.pinned);
  tooltip = ensureHeldItemTooltip();
  tooltip.textContent = text;
  tooltip.hidden = false;
  tooltip.classList.remove("is-visible");
  tooltip.style.left = "0";
  tooltip.style.top = "0";
  positionHeldItemTooltip();
  window.requestAnimationFrame(function () {
    if (activeHeldItemTarget === target && !tooltip.hidden) {
      tooltip.classList.add("is-visible");
    }
  });
}

function hideHeldItemTooltip() {
  if (heldItemTooltipFrame) {
    window.cancelAnimationFrame(heldItemTooltipFrame);
    heldItemTooltipFrame = null;
  }
  activeHeldItemTarget = null;
  heldItemTooltipPinned = false;
  if (!heldItemTooltip) {
    return;
  }
  heldItemTooltip.classList.remove("is-visible");
  heldItemTooltip.hidden = true;
}

export function initializeHeldItemTooltip(root) {
  root.addEventListener("pointerdown", function (event) {
    if (pointerEventIsTouch(event) && event.target.closest("[data-held-item-tooltip]")) {
      lastTouchTooltipPointerTime = Date.now();
    }
  });

  root.addEventListener("pointerover", function (event) {
    var target = event.target.closest("[data-held-item-tooltip]");
    if (pointerEventIsTouch(event)) {
      return;
    }
    if (target) {
      showHeldItemTooltip(target);
    }
  });

  root.addEventListener("pointerout", function (event) {
    if (pointerEventIsTouch(event) || heldItemTooltipPinned) {
      return;
    }
    if (!activeHeldItemTarget || activeHeldItemTarget.contains(event.relatedTarget)) {
      return;
    }
    hideHeldItemTooltip();
  });

  root.addEventListener("focusin", function (event) {
    var target = event.target.closest("[data-held-item-tooltip]");
    if (target && isRecentTouchTooltipPointer()) {
      return;
    }
    if (target) {
      showHeldItemTooltip(target);
    }
  });

  root.addEventListener("focusout", function (event) {
    if (heldItemTooltipPinned) {
      return;
    }
    if (!activeHeldItemTarget || activeHeldItemTarget.contains(event.relatedTarget)) {
      return;
    }
    hideHeldItemTooltip();
  });

  root.addEventListener("click", function (event) {
    var target = event.target.closest("[data-held-item-tooltip]");
    if (target) {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (isTooltipVisibleFor(target) && heldItemTooltipPinned) {
        hideHeldItemTooltip();
        return;
      }
      showHeldItemTooltip(target, { pinned: true });
      return;
    }

    if (heldItemTooltipPinned) {
      hideHeldItemTooltip();
    }
  }, true);

  window.addEventListener("scroll", scheduleHeldItemTooltipPosition, true);
  window.addEventListener("resize", scheduleHeldItemTooltipPosition);
}
