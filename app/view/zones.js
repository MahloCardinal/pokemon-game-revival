import { GDR_DATA } from "../data/index.js";
import * as Engine from "../engine/index.js";
import { escapeHtml, getZoneImage, renderImage, renderTypeIcons } from "../client/asset-helpers.js";
import { sceneShell } from "../client/render-utils.js";
import { t } from "../client/i18n.js";

export function renderZonesScene() {
  var availableZones = Object.keys(GDR_DATA.zones).filter(function (zoneName) {
    return Engine.getZoneTypes(zoneName).length > 0;
  });
  var zoneCardThemeClass = {
    viridian_forest: "zone-card-theme-bosco-smeraldo",
    mt_moon: "zone-card-theme-monte-luna",
    sea: "zone-card-theme-mare",
    ghost_tower: "zone-card-theme-torre-fantasma",
    safari_zone: "zone-card-theme-safari",
    swamp: "zone-card-theme-palude",
    desert: "zone-card-theme-deserto"
  };

  function renderZoneCard(zoneName) {
    var zoneTypes = Engine.getZoneTypes(zoneName);
    var zoneLabel = t("captureZones." + zoneName, null, zoneName);
    var themeClass = zoneCardThemeClass[zoneName] || "zone-card-theme-default";
    return [
      '<a class="zone-card ' + themeClass + '" href="/capture/' + encodeURIComponent(zoneName) + '" data-action="open-zone" data-zone="' + escapeHtml(zoneName) + '">',
      '  <h3 class="zone-card-title">' + escapeHtml(zoneLabel) + "</h3>",
      '  <div class="zone-card-media">',
      renderImage(getZoneImage(zoneName), zoneLabel, "zone-card-image"),
      "  </div>",
      '  <div class="zone-card-types">',
      renderTypeIcons(zoneTypes),
      "  </div>",
      "</a>"
    ].join("");
  }

  var cards = availableZones.map(renderZoneCard);
  var grid = '<section class="zone-grid">' + cards.join("") + "</section>";

  return sceneShell("Zone Cattura", "", grid, "", "scene-content-zones", "parent-back");
}
