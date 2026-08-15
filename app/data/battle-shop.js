import * as Items from "./items.js";

function itemOffer(item, price, group) {
  return { kind: "item", item: item, price: price, group: group };
}

var EVOLUTION_ITEMS = [
  Items.fire_stone, Items.thunder_stone, Items.water_stone, Items.leaf_stone,
  Items.felix_stone, Items.moon_stone, Items.sun_stone, Items.deep_sea_tooth,
  Items.deep_sea_scale, Items.prism_scale, Items.upgrade, Items.dragon_scale, Items.linking_cord
];

var AROMAS = [Items.lax_incense, Items.luck_incense, Items.pure_incense, Items.odd_incense, Items.full_incense];
var DRINKS = [
  [Items.fresh_water, 5], [Items.soda_pop, 6], [Items.lemonade, 8], [Items.moomoo_milk, 10]
];

export var BATTLE_SHOP_ITEM_OFFERS = []
  .concat(Items.BERRY_NORMAL_CYCLE_ITEMS.map(function (item) { return itemOffer(item, 3, "Bacca a crescita veloce"); }))
  .concat(Items.BERRY_LONG_CYCLE_ITEMS.map(function (item) { return itemOffer(item, 5, "Bacca a crescita lenta"); }))
  .concat(DRINKS.map(function (entry) { return itemOffer(entry[0], entry[1], "Bevande"); }))
  .concat([
    itemOffer(Items.heart_scale, 80, "Strumenti rari"),
    itemOffer(Items.hp_up, 20, "Vitamine"),
    itemOffer(Items.pp_up, 20, "Vitamine"),
    itemOffer(Items.pp_max, 30, "Vitamine")
  ])
  .concat(Items.ITEM_LIBRARY.filter(function (item) { return item.category === Items.ItemCategory.TM; })
    .map(function (item) { return itemOffer(item, 10, "MT"); }))
  .concat(EVOLUTION_ITEMS.map(function (item) { return itemOffer(item, 10, "Strumenti evolutivi"); }))
  .concat(AROMAS.map(function (item) { return itemOffer(item, 100, "Aromi"); }))
  .concat(Items.ITEM_LIBRARY.filter(function (item) { return Boolean(item.boostType); })
    .map(function (item) { return itemOffer(item, 100, "Strumenti potenziatore Tipo"); }));

export var BATTLE_SHOP_POKEMON_OFFERS = [
  { key: "pokemon_100", price: 100, excludeFossils: true },
  { key: "pokemon_500", price: 500, excludeFossils: false }
];

export var BATTLE_SHOP_CHOICE_LABELS = Object.freeze({
  "choice_berry_fast": "Bacca a crescita veloce a scelta",
  "choice_berry_slow": "Bacca a crescita lenta a scelta",
  "choice_tm": "MT acquistabile a scelta",
  "choice_evolution": "Strumento evolutivo a scelta",
  "choice_incense": "Aroma a scelta",
  "choice_type_booster": "Strumento potenziatore del Tipo a scelta"
});

export var BATTLE_SHOP_POKEMON_LABELS = Object.freeze({
  "pokemon_100": "Pokémon a scelta max Lv allenabile (no Fossile, no Legend)",
  "pokemon_500": "Pokémon a scelta max Lv allenabile (no Legend)"
});
