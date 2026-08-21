function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function positionAnchoredPanel(panel, anchorElement) {
  var margin = 10;
  var gap = 10;
  var viewportWidth = Math.max(0, document.documentElement.clientWidth || window.innerWidth || 0);
  var viewportHeight = Math.max(0, document.documentElement.clientHeight || window.innerHeight || 0);
  var anchorRect = anchorElement.getBoundingClientRect();
  var panelWidth = panel.offsetWidth;
  var panelHeight = panel.offsetHeight;
  var minimumLeft = margin + panelWidth / 2;
  var maximumLeft = viewportWidth - margin - panelWidth / 2;
  var centeredLeft = anchorRect.left + anchorRect.width / 2;
  var belowTop = anchorRect.bottom + gap;
  var aboveTop = anchorRect.top - gap - panelHeight;
  var maximumTop = Math.max(margin, viewportHeight - margin - panelHeight);
  var left = maximumLeft >= minimumLeft
    ? clamp(centeredLeft, minimumLeft, maximumLeft)
    : viewportWidth / 2;
  var top = belowTop;

  if (belowTop + panelHeight > viewportHeight - margin && aboveTop >= margin) {
    top = aboveTop;
  } else {
    top = clamp(belowTop, margin, maximumTop);
  }

  panel.style.left = Math.round(left) + "px";
  panel.style.top = Math.round(top) + "px";
  panel.style.visibility = "";
}

export function bindAnchoredPanel(panel, anchorElement, onInvalidAnchor) {
  function syncPosition() {
    if (!anchorElement || !anchorElement.isConnected || !panel || !panel.isConnected) {
      if (typeof onInvalidAnchor === "function") onInvalidAnchor();
      return;
    }
    positionAnchoredPanel(panel, anchorElement);
  }

  syncPosition();
  window.addEventListener("scroll", syncPosition, true);
  window.addEventListener("resize", syncPosition);

  return function cleanupAnchoredPanel() {
    window.removeEventListener("scroll", syncPosition, true);
    window.removeEventListener("resize", syncPosition);
  };
}
