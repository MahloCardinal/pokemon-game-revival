import { assetPath, escapeHtml, renderImage } from "../client/asset-helpers.js";
import { sceneShell } from "../client/render-utils.js";
import { t } from "../client/i18n.js";
import { renderBattleTowerScene as renderTowerScene } from "./battle-tower.js";

function renderBattleAreaCard(key, action, image, href) {
  var title = t("ui.zoneCards." + key + ".title");
  var description = t("ui.zoneCards." + key + ".description");
  return [
    '<a class="image-card battle-area-card" href="' + escapeHtml(href) + '" data-action="' + escapeHtml(action) + '">',
    '  <h3 class="image-card-title">' + escapeHtml(title) + "</h3>",
    '  <div class="image-card-media">',
    renderImage(assetPath("img_zone", image), title, "image-card-image"),
    "  </div>",
    description ? '  <div class="image-card-description">' + escapeHtml(description) + "</div>" : "",
    "</a>"
  ].join("");
}

export function renderBattleAreaScene() {
  var cards = [
    renderBattleAreaCard("training_zone", "open-battle-training-zone", "zona_allenamento_bottone.webp", "/battle-area/training-zone"),
    renderBattleAreaCard("battle_tower", "open-battle-tower", "torre_lotta_bottone.webp", "/battle-area/battle-tower"),
    renderBattleAreaCard("battle_shop", "open-battle-shop", "negozio_lotta_bottone.webp", "/battle-area/battle-shop"),
    renderBattleAreaCard("battle_dome", "open-battle-dome", "cupola_lotta_bottone.webp", "/battle-area/battle-dome")
  ];
  return sceneShell(t("ui.sceneTitles.battleArea"), "", '<section class="battle-area-grid">' + cards.join("") + "</section>", "", "scene-content-battle-area", "parent-back");
}

export function renderBattleTowerScene() {
  return renderTowerScene();
}
