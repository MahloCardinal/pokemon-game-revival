import * as Items from "./items.js";

function itemOffer(item, price, group) {
  return { kind: "item", item: item, price: price, group: group };
}

var EVOLUTION_ITEMS = [
  Items.pietrafocaia, Items.pietratuono, Items.pietraidrica, Items.pietrafoglia,
  Items.felixpietra, Items.pietralunare, Items.pietrasolare, Items.dente_abissi,
  Items.squamabissi, Items.squama_bella, Items.upgrade, Items.squama_drago, Items.filo_dell_unione
];

var AROMAS = [Items.distraroma, Items.fortunaroma, Items.puroaroma, Items.bizzoaroma, Items.gonfioaroma];
var DRINKS = [
  [Items.acqua_fresca, 5], [Items.gassosa, 6], [Items.lemonsucco, 8], [Items.latte_mumu, 10]
];

export var BATTLE_SHOP_ITEM_OFFERS = []
  .concat(Items.BERRY_NORMAL_CYCLE_ITEMS.map(function (item) { return itemOffer(item, 3, "Bacca a crescita veloce"); }))
  .concat(Items.BERRY_LONG_CYCLE_ITEMS.map(function (item) { return itemOffer(item, 5, "Bacca a crescita lenta"); }))
  .concat(DRINKS.map(function (entry) { return itemOffer(entry[0], entry[1], "Bevande"); }))
  .concat([
    itemOffer(Items.squama_cuore, 80, "Strumenti rari"),
    itemOffer(Items.ps_su, 20, "Vitamine"),
    itemOffer(Items.pp_su, 20, "Vitamine"),
    itemOffer(Items.pp_max, 30, "Vitamine")
  ])
  .concat(Items.ITEM_LIBRARY.filter(function (item) { return item.category === Items.ItemCategory.Mt; })
    .map(function (item) { return itemOffer(item, 10, "MT"); }))
  .concat(EVOLUTION_ITEMS.map(function (item) { return itemOffer(item, 10, "Strumenti evolutivi"); }))
  .concat(AROMAS.map(function (item) { return itemOffer(item, 100, "Aromi"); }))
  .concat(Items.ITEM_LIBRARY.filter(function (item) { return Boolean(item.boostType); })
    .map(function (item) { return itemOffer(item, 100, "Strumenti potenziatore Tipo"); }));

export var BATTLE_SHOP_POKEMON_OFFERS = [
  { key: "pokemon-100", price: 100, excludeFossils: true },
  { key: "pokemon-500", price: 500, excludeFossils: false }
];

export var BATTLE_SHOP_CHOICE_LABELS = Object.freeze({
  "choice-berry-fast": "Bacca a crescita veloce a scelta",
  "choice-berry-slow": "Bacca a crescita lenta a scelta",
  "choice-mt": "MT acquistabile a scelta",
  "choice-evolution": "Strumento evolutivo a scelta",
  "choice-aroma": "Aroma a scelta",
  "choice-type-booster": "Strumento potenziatore del Tipo a scelta"
});

export var BATTLE_SHOP_POKEMON_LABELS = Object.freeze({
  "pokemon-100": "Pokémon a scelta max Lv allenabile (no Fossile, no Legend)",
  "pokemon-500": "Pokémon a scelta max Lv allenabile (no Legend)"
});
