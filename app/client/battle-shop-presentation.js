import { getItemByIndex } from "../data/items.js";
import { itemDisplayName, speciesDisplayName } from "./entity-text.js";
import { getLocale, t } from "./i18n.js";

function itemName(itemIndex) {
  var item = getItemByIndex(Number(itemIndex));
  return item ? itemDisplayName(item) : t("ui.battleShop.fallbackReward");
}

function speciesName(speciesKey) {
  return speciesDisplayName(speciesKey) || t("entityDescriptions.species.fallbackName");
}

export function battleShopOfferName(offer) {
  var offerKey = String(offer && offer.offer_key || "");
  var offerKind = String(offer && offer.offer_kind || "");
  if (offerKind === "item") return itemName(offer && offer.item_index);
  return t("ui.battleShop.offers." + offerKey, null, t("ui.battleShop.fallbackReward"));
}

export function battleShopChoiceName(choice) {
  if (choice && choice.item_index !== undefined && choice.item_index !== null) {
    return itemName(choice.item_index);
  }
  if (choice && choice.species_key !== undefined && choice.species_key !== null) {
    return speciesName(choice.species_key);
  }
  return t("ui.battleShop.fallbackReward");
}

export function hydrateBattleShopOffers(offers) {
  return (Array.isArray(offers) ? offers : []).map(function (offer) {
    var hydrated = Object.assign({}, offer, { display_name: battleShopOfferName(offer) });
    if (Array.isArray(offer && offer.choices)) {
      hydrated.choices = offer.choices.map(function (choice) {
        return Object.assign({}, choice, { display_name: battleShopChoiceName(choice) });
      }).sort(function (left, right) {
        return left.display_name.localeCompare(right.display_name, getLocale());
      });
    }
    return hydrated;
  });
}
