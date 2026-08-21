import * as Items from "./items.js";
import { tmIsPurchasable } from "./progression.js";

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
  .concat(Items.BERRY_NORMAL_CYCLE_ITEMS.map(function (item) { return itemOffer(item, 3, "fast_growing_berries"); }))
  .concat(Items.BERRY_LONG_CYCLE_ITEMS.map(function (item) { return itemOffer(item, 5, "slow_growing_berries"); }))
  .concat(DRINKS.map(function (entry) { return itemOffer(entry[0], entry[1], "drinks"); }))
  .concat([
    itemOffer(Items.heart_scale, 80, "rare_items"),
    itemOffer(Items.hp_up, 20, "vitamins"),
    itemOffer(Items.pp_up, 20, "vitamins"),
    itemOffer(Items.pp_max, 30, "vitamins")
  ])
  .concat(Items.ITEM_LIBRARY.filter(function (item) {
    return tmIsPurchasable(item);
  })
    .map(function (item) { return itemOffer(item, 10, "tms"); }))
  .concat(EVOLUTION_ITEMS.map(function (item) { return itemOffer(item, 10, "evolution_items"); }))
  .concat(AROMAS.map(function (item) { return itemOffer(item, 100, "incenses"); }))
  .concat(Items.ITEM_LIBRARY.filter(function (item) { return Boolean(item.boostType); })
    .map(function (item) { return itemOffer(item, 100, "type_boosters"); }));

export var BATTLE_SHOP_POKEMON_OFFERS = [
  { key: "pokemon_100", price: 100, excludeFossils: true },
  { key: "pokemon_500", price: 500, excludeFossils: false }
];
