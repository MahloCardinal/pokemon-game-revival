import { assetPath, escapeHtml, renderImage } from "../client/asset-helpers.js";
import { renderScenePresentationPanel, sceneShell } from "../client/render-utils.js";
import { ZONE_CARD_DESCRIPTIONS } from "../data/zones-text.js";
import { renderBattleTowerScene as renderTowerScene } from "./battle-tower.js";

function renderBattleAreaCard(title, action, image, href, descriptionKey) {
  var description = ZONE_CARD_DESCRIPTIONS[descriptionKey] || "";
  return [
    '<a class="zone-card city-zone-card battle-area-card" href="' + escapeHtml(href) + '" data-action="' + escapeHtml(action) + '">',
    '  <h3 class="zone-card-title">' + escapeHtml(title) + "</h3>",
    '  <div class="zone-card-media">',
    renderImage(assetPath("img_zone", image), title, "zone-card-image"),
    "  </div>",
    description ? '  <div class="zone-card-description">' + escapeHtml(description) + "</div>" : "",
    "</a>"
  ].join("");
}

export function renderBattleAreaScene() {
  var cards = [
    renderBattleAreaCard("Torre Lotta", "open-battle-tower", "torre_lotta_bottone.webp", "/battle-area/battle-tower", "battle_tower"),
    renderBattleAreaCard("Zona allenamento", "open-battle-training-zone", "zona_allenamento_bottone.webp", "/battle-area/training-zone", "training_zone"),
    renderBattleAreaCard("Negozio Lotta", "open-battle-shop", "negozio_lotta_bottone.webp", "/battle-area/battle-shop", "battle_shop")
  ];
  return sceneShell("Area Lotta", "", '<section class="city-grid battle-area-grid">' + cards.join("") + "</section>", "", "scene-content-battle-area", "parent-back");
}

export function renderBattleTowerScene() {
  return renderTowerScene();
}
