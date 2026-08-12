import { BATTLE_SHOP_CHOICE_LABELS, BATTLE_SHOP_POKEMON_LABELS } from "../data/battle-shop.js";
import { SPECIES_LIBRARY } from "../data/index.js";
import { getItemByIndex } from "../data/items.js";

function itemName(itemIndex) {
  var item = getItemByIndex(Number(itemIndex));
  return item && item.name || "Premio";
}

function speciesName(speciesKey) {
  var species = SPECIES_LIBRARY[String(speciesKey || "")];
  return species && species.name || "Pokémon";
}

export function battleShopOfferName(offer) {
  var offerKey = String(offer && offer.offer_key || "");
  var offerKind = String(offer && offer.offer_kind || "");
  if (offerKind === "item") return itemName(offer && offer.item_index);
  if (BATTLE_SHOP_CHOICE_LABELS[offerKey]) return BATTLE_SHOP_CHOICE_LABELS[offerKey];
  if (BATTLE_SHOP_POKEMON_LABELS[offerKey]) return BATTLE_SHOP_POKEMON_LABELS[offerKey];
  return "Premio";
}

export function battleShopChoiceName(choice) {
  if (choice && choice.item_index !== undefined && choice.item_index !== null) {
    return itemName(choice.item_index);
  }
  if (choice && choice.species_key !== undefined && choice.species_key !== null) {
    return speciesName(choice.species_key);
  }
  return "Premio";
}

export function hydrateBattleShopOffers(offers) {
  return (Array.isArray(offers) ? offers : []).map(function (offer) {
    var hydrated = Object.assign({}, offer, { display_name: battleShopOfferName(offer) });
    if (Array.isArray(offer && offer.choices)) {
      hydrated.choices = offer.choices.map(function (choice) {
        return Object.assign({}, choice, { display_name: battleShopChoiceName(choice) });
      }).sort(function (left, right) {
        return left.display_name.localeCompare(right.display_name, "it");
      });
    }
    return hydrated;
  });
}
