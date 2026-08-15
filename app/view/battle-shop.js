import { getItemByIndex } from "../data/items.js";
import { state } from "../client/game-state.js";
import { escapeHtml, getItemDisplayImage, renderImage } from "../client/asset-helpers.js";
import { button, formatInteger, renderScenePresentationPanel, sceneShell } from "../client/render-utils.js";
import { battleShopOfferName } from "../client/battle-shop-presentation.js";
import { isBattleRuntimeActive } from "../client/battle-scene-lock.js";

function offerItemImage(offer) {
  var item = getItemByIndex(Number(offer && offer.item_index));
  var image = getItemDisplayImage(item);
  return image ? renderImage(image, offer.display_name, "pokefan-mission-item-image") : "";
}

function renderOfferReward(offer) {
  var isItem = String(offer && offer.offer_kind || "").toLowerCase() === "item";
  return [
    '<span class="pokefan-mission-reward">',
    isItem ? offerItemImage(offer) : "",
    "  <span>" + escapeHtml(battleShopOfferName(offer)) + "</span>",
    "</span>"
  ].join("");
}

function renderOfferRow(offer) {
  var eligible = Boolean(offer && offer.eligible);
  var price = Math.max(0, Number(offer && offer.battle_point_price) || 0);
  var battlePoints = Math.max(0, Number(state.trainerInfo && state.trainerInfo[3]) || 0);
  var disabled = eligible && price <= battlePoints && !state.battleShopPurchasePending && !isBattleRuntimeActive() ? "" : "disabled";
  return [
    '<div class="pokefan-mission-row">',
    '  <div class="pokefan-mission-cell">' + renderOfferReward(offer) + "</div>",
    '  <div class="pokefan-mission-cell">' + escapeHtml(formatInteger(price)) + " PL</div>",
    '  <div class="pokefan-mission-cell pokefan-mission-completion">' + button("Ritira", "battle-shop-buy", 'data-offer-key="' + escapeHtml(offer && offer.offer_key || "") + '" ' + disabled, "button-accent button-slim pokefan-claim-button") + "</div>",
    "</div>"
  ].join("");
}

function renderOfferTable(offers) {
  var emptyMessage = state.battleShopOffersLoading ? "Caricamento premi..."
    : state.battleShopOffersError || "Nessun premio disponibile.";
  var rows = offers.length ? offers.map(renderOfferRow).join("")
    : '<div class="pokefan-mission-row pokefan-empty-row"><div class="pokefan-empty-state">' + escapeHtml(emptyMessage) + "</div></div>";
  return [
    '<div class="pokefan-data-table">',
    '  <div class="pokefan-mission-header"><span>Premio</span><span>Prezzo (PL)</span><span>Ritira</span></div>',
    rows,
    "</div>"
  ].join("");
}

export function renderBattleShopScene() {
  var offers = Array.isArray(state.battleShopOffers) ? state.battleShopOffers : [];
  var content = [
    '<section class="pokefan-layout battle-shop-layout">',
    renderScenePresentationPanel("battle_shop", "battle-shop-info-panel"),
    '  <section class="panel pokefan-missions-panel" data-render-region="battle-shop-offers"><div class="panel-inner">',
    renderOfferTable(offers),
    "  </div></section>",
    "</section>"
  ].join("");
  return sceneShell("Negozio Lotta", "", content, "", "scene-content-battle-shop", "parent-back");
}
