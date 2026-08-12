import { assetPath, escapeHtml, renderImage } from "../client/asset-helpers.js";
import { ZONE_CARD_DESCRIPTIONS } from "../data/zones-text.js";
import { sceneShell } from "../client/render-utils.js";

export function renderCityScene() {
  var cityZones = [
    { title: "Centro Pokémon", action: "open-city-pokemon-center", image: "centro_pokemon_bottone.webp", className: "city-card-pokemon-center", href: "/city/pokemon-center", descKey: "pokemon_center" },
    { title: "Centro commerciale", action: "open-city-shopping-center", image: "centro_commerciale_bottone.webp", className: "city-card-shopping-center", href: "/city/shopping-center", descKey: "shopping_center" },
    { title: "Giardino", action: "open-city-garden", image: "giardino_bottone.webp", className: "city-card-garden", href: "/city/garden", descKey: "garden" },
    { title: "Club Pokéfan", action: "open-city-fanclub", image: "club_pokefan_bottone.webp", className: "city-card-fanclub", href: "/city/fanclub", descKey: "fanclub" },
    { title: "Pensione", action: "open-city-daycare", image: "pensione_bottone.webp", className: "city-card-daycare", href: "/city/daycare", descKey: "daycare" }
  ];
  var cards = cityZones.map(function (zone) {
    var desc = zone.descKey ? (ZONE_CARD_DESCRIPTIONS[zone.descKey] || "") : "";
    return [
      '<a class="zone-card city-zone-card ' + escapeHtml(zone.className) + '" href="' + escapeHtml(zone.href) + '" data-action="' + escapeHtml(zone.action) + '">',
      '  <h3 class="zone-card-title">' + escapeHtml(zone.title) + "</h3>",
      '  <div class="zone-card-media">',
      renderImage(assetPath("img_zone", zone.image), zone.title, "zone-card-image"),
      "  </div>",
      desc ? '  <div class="zone-card-description">' + escapeHtml(desc) + "</div>" : "",
      "</a>"
    ].join("");
  });

  return sceneShell("Città", "", '<section class="city-grid">' + cards.join("") + "</section>", "", "scene-content-city", "parent-back");
}
