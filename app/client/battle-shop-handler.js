import { buyBattleShopOfferAuthoritative } from "../api/player-command.js";
import { getBattleShopOffers } from "../api/player-command.js";
import { saveFromAuthoritativeProjection } from "../api/player.js";
import { registerAction } from "./action-registry.js";
import { requireNotInBattle } from "./battle-scene-lock.js";
import { openMessage } from "./dialog-handler.js";
import { applyPlayerSave, root, state } from "./game-state.js";
import { renderRegions } from "./renderer.js";
import { broadcastTeamBoxRuntimeState } from "./runtime-state.js";
import { battleShopChoiceName, battleShopOfferName, hydrateBattleShopOffers } from "./battle-shop-presentation.js";
import { messageDescriptor, t, textDescriptor } from "./i18n.js";
import { bindAnchoredPanel } from "./anchored-panel.js";

var pendingBattleShopChoice = null;
var battleShopChoiceCleanup = null;

function battleShopOfferSelection(offerKey) {
  var selection = null;
  (state.battleShopOffers || []).some(function(offer) {
    if (String(offer && offer.offer_key || "") === offerKey) {
      selection = { offer: offer, choice: null };
      return true;
    }
    return (offer.choices || []).some(function(choice) {
      if (String(choice && choice.offer_key || "") !== offerKey) return false;
      selection = { offer: offer, choice: choice };
      return true;
    });
  });
  return selection;
}

function canAffordBattleShopOffer(offer) {
  return Math.max(0, Number(state.trainerInfo && state.trainerInfo[3]) || 0)
    >= Math.max(0, Number(offer && offer.battle_point_price) || 0);
}

function showInsufficientBattlePoints() {
  openMessage([messageDescriptor("battleShop.insufficientPoints")], { title: textDescriptor("ui.sceneTitles.battleShop") });
}

function closeBattleShopChoiceMenu() {
  if (battleShopChoiceCleanup) {
    battleShopChoiceCleanup();
    battleShopChoiceCleanup = null;
  }
  var existing = root.querySelector("[data-battle-shop-choice-panel]");
  if (existing) existing.remove();
}

function openBattleShopChoiceMenu(anchorElement, offer) {
  var backdrop = document.createElement("div");
  var panel = document.createElement("section");
  var title = document.createElement("h3");
  var list = document.createElement("div");
  closeBattleShopChoiceMenu();
  pendingBattleShopChoice = { offerKey: String(offer.offer_key || "") };
  backdrop.className = "pokefan-choice-backdrop";
  backdrop.dataset.battleShopChoicePanel = "true";
  backdrop.dataset.action = "battle-shop-choice-close";
  panel.className = "pokefan-choice-panel";
  panel.style.left = "0";
  panel.style.top = "0";
  panel.style.visibility = "hidden";
  title.className = "pokefan-choice-title";
  title.textContent = t("messages.battleShop.chooseReward");
  list.className = "pokefan-choice-list";
  (offer.choices || []).forEach(function(choice) {
    var choiceButton = document.createElement("button");
    choiceButton.type = "button";
    choiceButton.className = "pokefan-choice-button";
    choiceButton.dataset.action = "battle-shop-choice-pick";
    choiceButton.dataset.parentOfferKey = String(offer.offer_key || "");
    choiceButton.dataset.offerKey = String(choice.offer_key || "");
    choiceButton.textContent = battleShopChoiceName(choice);
    list.appendChild(choiceButton);
  });
  panel.appendChild(title);
  panel.appendChild(list);
  backdrop.appendChild(panel);
  root.appendChild(backdrop);
  battleShopChoiceCleanup = bindAnchoredPanel(panel, anchorElement, closeBattleShopChoiceMenu);
}

async function buyBattleShopOffer(offerKey, element) {
  var result;
  var selection = battleShopOfferSelection(offerKey);
  if (!offerKey || state.battleShopPurchasePending || !requireNotInBattle()) {
    return;
  }
  if (!selection || !selection.offer || !selection.offer.eligible) return;
  if (!canAffordBattleShopOffer(selection.offer)) {
    showInsufficientBattlePoints();
    return;
  }
  state.battleShopPurchasePending = true;
  element.disabled = true;
  try {
    result = await buyBattleShopOfferAuthoritative({
      expectedRevision: state.authoritativeRevision,
      offerKey: offerKey
    });
    if (!result.ok) {
      state.battleShopPurchasePending = false;
      openMessage([messageDescriptor(/insufficient Battle Points/i.test(String(result.message || ""))
        ? "battleShop.insufficientPoints" : "battleShop.claimFailed")], { title: textDescriptor("ui.sceneTitles.battleShop") });
      return;
    }
    applyPlayerSave(saveFromAuthoritativeProjection(result.projection));
    broadcastTeamBoxRuntimeState();
    await refreshBattleShopOffers();
    var pokemonInstanceId = String(result.projection && result.projection.pokemon_instance_id || "");
    var pokemon = pokemonInstanceId ? (state.box || []).find(function(entry) {
      return String(entry && entry.instanceId || "") === pokemonInstanceId;
    }) : null;
    var rewardName = selection.choice ? battleShopChoiceName(selection.choice) : battleShopOfferName(selection.offer);
    openMessage([messageDescriptor("battleShop.claimed", { reward: rewardName })], {
      title: textDescriptor("ui.sceneTitles.battleShop"),
      closeLabel: textDescriptor("ui.dialogs.ok"),
      closeClass: "button-accent",
      pokemon: pokemon
    });
  } finally {
    state.battleShopPurchasePending = false;
    if (state.scene && state.scene.name === "battle-shop") {
      renderRegions(["battle-shop-offers"]);
    }
  }
}

registerAction("battle-shop-buy", function(element) {
  var offerKey = String(element.dataset.offerKey || "");
  var offer = (state.battleShopOffers || []).find(function(entry) {
    return String(entry && entry.offer_key || "") === offerKey;
  });
  if (!requireNotInBattle()) return;
  if (!offer || !offer.eligible) {
    openMessage([messageDescriptor("battleShop.unavailable")], { title: textDescriptor("ui.sceneTitles.battleShop") });
    return;
  }
  if (!canAffordBattleShopOffer(offer)) {
    showInsufficientBattlePoints();
    return;
  }
  if (Array.isArray(offer.choices) && offer.choices.length) {
    openBattleShopChoiceMenu(element, offer);
    return;
  }
  buyBattleShopOffer(offerKey, element);
});

registerAction("battle-shop-choice-close", function() {
  pendingBattleShopChoice = null;
  closeBattleShopChoiceMenu();
});

registerAction("battle-shop-choice-pick", function(element) {
  var parentOfferKey = String(element.dataset.parentOfferKey || "");
  var offerKey = String(element.dataset.offerKey || "");
  if (!pendingBattleShopChoice || pendingBattleShopChoice.offerKey !== parentOfferKey || !offerKey) {
    closeBattleShopChoiceMenu();
    return;
  }
  pendingBattleShopChoice = null;
  closeBattleShopChoiceMenu();
  buyBattleShopOffer(offerKey, element);
});

export async function refreshBattleShopOffers() {
  if (state.battleShopOffersLoading) return { ok: false, pending: true };
  state.battleShopOffersLoading = true;
  state.battleShopOffersError = "";
  if (state.scene && state.scene.name === "battle-shop") {
    renderRegions(["battle-shop-offers"]);
  }
  var result = await getBattleShopOffers();
  if (result.ok && Array.isArray(result.projection)) {
    state.battleShopOffers = hydrateBattleShopOffers(result.projection);
    state.battleShopOffersLoaded = true;
  } else {
    state.battleShopOffers = [];
    state.battleShopOffersLoaded = false;
    state.battleShopOffersError = messageDescriptor("battleShop.loadFailed");
  }
  state.battleShopOffersLoading = false;
  if (state.scene && state.scene.name === "battle-shop") renderRegions(["battle-shop-offers"]);
  return result;
}
