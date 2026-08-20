import { assetPath, escapeHtml, renderImage } from "../client/asset-helpers.js";
import { t } from "../client/i18n.js";
import { sceneShell } from "../client/render-utils.js";

export function renderCityScene() {
  var cityZones = [
    { key: "pokemon_center", action: "open-city-pokemon-center", image: "centro_pokemon_bottone.webp", className: "city-card-pokemon-center", href: "/city/pokemon-center" },
    { key: "shopping_center", action: "open-city-shopping-center", image: "centro_commerciale_bottone.webp", className: "city-card-shopping-center", href: "/city/shopping-center" },
    { key: "garden", action: "open-city-garden", image: "giardino_bottone.webp", className: "city-card-garden", href: "/city/garden" },
    { key: "fanclub", action: "open-city-fanclub", image: "club_pokefan_bottone.webp", className: "city-card-fanclub", href: "/city/fanclub" },
    { key: "daycare", action: "open-city-daycare", image: "pensione_bottone.webp", className: "city-card-daycare", href: "/city/daycare" }
  ];
  var cards = cityZones.map(function (zone) {
    var title = t("ui.zoneCards." + zone.key + ".title");
    var desc = t("ui.zoneCards." + zone.key + ".description");
    return [
      '<a class="zone-card city-zone-card ' + escapeHtml(zone.className) + '" href="' + escapeHtml(zone.href) + '" data-action="' + escapeHtml(zone.action) + '">',
      '  <h3 class="zone-card-title">' + escapeHtml(title) + "</h3>",
      '  <div class="zone-card-media">',
      renderImage(assetPath("img_zone", zone.image), title, "zone-card-image"),
      "  </div>",
      desc ? '  <div class="zone-card-description">' + escapeHtml(desc) + "</div>" : "",
      "</a>"
    ].join("");
  });

  return sceneShell(t("ui.sceneTitles.city"), "", '<section class="city-grid">' + cards.join("") + "</section>", "", "scene-content-city", "parent-back");
}
