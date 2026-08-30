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
    viridian_forest: "capture-zone-card-theme-bosco-smeraldo",
    mt_moon: "capture-zone-card-theme-monte-luna",
    sea: "capture-zone-card-theme-mare",
    ghost_tower: "capture-zone-card-theme-torre-fantasma",
    safari_zone: "capture-zone-card-theme-safari",
    swamp: "capture-zone-card-theme-palude",
    desert: "capture-zone-card-theme-deserto"
  };

  function renderZoneCard(zoneName) {
    var zoneTypes = Engine.getZoneTypes(zoneName);
    var zoneLabel = t("captureZones." + zoneName + ".name");
    var themeClass = zoneCardThemeClass[zoneName] || "capture-zone-card-theme-default";
    return [
      '<a class="capture-zone-card ' + themeClass + '" href="/capture/' + encodeURIComponent(zoneName) + '" data-action="open-zone" data-zone="' + escapeHtml(zoneName) + '">',
      '  <h3 class="capture-zone-card-title">' + escapeHtml(zoneLabel) + "</h3>",
      '  <div class="capture-zone-card-media">',
      renderImage(getZoneImage(zoneName), zoneLabel, "capture-zone-card-image"),
      "  </div>",
      '  <div class="capture-zone-card-types">',
      renderTypeIcons(zoneTypes),
      "  </div>",
      "</a>"
    ].join("");
  }

  var cards = availableZones.map(renderZoneCard);
  var grid = '<section class="capture-zones-grid">' + cards.join("") + "</section>";

  return sceneShell(t("ui.sceneTitles.zones"), "", grid, "", "scene-content-zones", "parent-back");
}
