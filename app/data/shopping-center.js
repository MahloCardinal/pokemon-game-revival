import * as i from "./items.js";
import { ITEM_UNLOCK_RULES, tmPrice, tmUnlockBadges, normalizedBadges } from "./progression.js";

function shopItem(item, section, category, price) {
  return { item: item, section: section, category: category, price: price };
}

var DEFAULT_UNCATALOGUED_SALE_PRICE = 100;

export var SHOPPING_CENTER_SECTIONS = {
  MARKET: "market",
  PORT: "port_market",
  DEVON: "devon_corporation",
  TM: "tm_shop",
  SELL: "sell"
};

export var SHOPPING_CENTER_CATEGORIES = {
  POKE_BALL: "poke_balls",
  HEALING: "healing_items",
  EVOLUTION_STONES: "evolution_stones",
  HERB: "medicinal_herbs",
  DRINK: "drinks",
  VITAMIN: "vitamins",
  COMPETITIVE: "port_items",
  TYPE_BOOSTERS: "type_boosters",
  DEVON: "devon_items",
  INCENSES: "incenses",
  FLUTES: "flutes",
  EVOLUTION_ITEMS: "evolution_items",
  TM: "tms",
  RARE: "rare_items"
};

export var SHOPPING_CENTER_ITEMS = [
  shopItem(i.poke_ball, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.POKE_BALL, 200),
  shopItem(i.great_ball, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.POKE_BALL, 600),
  shopItem(i.ultra_ball, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.POKE_BALL, 1200),
  shopItem(i.potion, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.HEALING, 300),
  shopItem(i.super_potion, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.HEALING, 700),
  shopItem(i.hyper_potion, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.HEALING, 2000),
  shopItem(i.max_potion, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.HEALING, 3500),
  shopItem(i.full_restore, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.HEALING, 4500),
  shopItem(i.antidote, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.HEALING, 100),
  shopItem(i.paralyze_heal, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.HEALING, 200),
  shopItem(i.awakening, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.HEALING, 250),
  shopItem(i.burn_heal, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.HEALING, 250),
  shopItem(i.ice_heal, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.HEALING, 250),
  shopItem(i.full_heal, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.HEALING, 600),
  shopItem(i.clear_sky_elixir, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.HEALING, 1000),
  shopItem(i.revive, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.HEALING, 2000),
  shopItem(i.max_revive, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.HEALING, 6000),
  shopItem(i.fire_stone, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.EVOLUTION_STONES, 2500),
  shopItem(i.thunder_stone, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.EVOLUTION_STONES, 2500),
  shopItem(i.water_stone, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.EVOLUTION_STONES, 2500),
  shopItem(i.leaf_stone, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.EVOLUTION_STONES, 2500),
  shopItem(i.heal_powder, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.HERB, 300),
  shopItem(i.energy_powder, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.HERB, 500),
  shopItem(i.energy_root, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.HERB, 1200),
  shopItem(i.revival_herb, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.HERB, 2800),
  shopItem(i.fresh_water, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.DRINK, null),
  shopItem(i.soda_pop, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.DRINK, null),
  shopItem(i.lemonade, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.DRINK, null),
  shopItem(i.moomoo_milk, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.DRINK, null),
  shopItem(i.heart_scale, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.RARE, null),

  shopItem(i.hp_up, SHOPPING_CENTER_SECTIONS.PORT, SHOPPING_CENTER_CATEGORIES.VITAMIN, 10000),
  shopItem(i.pp_up, SHOPPING_CENTER_SECTIONS.PORT, SHOPPING_CENTER_CATEGORIES.VITAMIN, 10000),
  shopItem(i.pp_max, SHOPPING_CENTER_SECTIONS.PORT, SHOPPING_CENTER_CATEGORIES.VITAMIN, 15000),

  shopItem(i.focus_band, SHOPPING_CENTER_SECTIONS.PORT, SHOPPING_CENTER_CATEGORIES.COMPETITIVE, 8000),
  shopItem(i.focus_sash, SHOPPING_CENTER_SECTIONS.PORT, SHOPPING_CENTER_CATEGORIES.COMPETITIVE, 10000),
  shopItem(i.bright_powder, SHOPPING_CENTER_SECTIONS.PORT, SHOPPING_CENTER_CATEGORIES.COMPETITIVE, 10000),
  shopItem(i.kings_rock, SHOPPING_CENTER_SECTIONS.PORT, SHOPPING_CENTER_CATEGORIES.COMPETITIVE, 12000),

  shopItem(i.mystic_water, SHOPPING_CENTER_SECTIONS.PORT, SHOPPING_CENTER_CATEGORIES.TYPE_BOOSTERS, null),
  shopItem(i.silver_powder, SHOPPING_CENTER_SECTIONS.PORT, SHOPPING_CENTER_CATEGORIES.TYPE_BOOSTERS, null),
  shopItem(i.sharp_beak, SHOPPING_CENTER_SECTIONS.PORT, SHOPPING_CENTER_CATEGORIES.TYPE_BOOSTERS, null),
  shopItem(i.magnet, SHOPPING_CENTER_SECTIONS.PORT, SHOPPING_CENTER_CATEGORIES.TYPE_BOOSTERS, null),
  shopItem(i.charcoal, SHOPPING_CENTER_SECTIONS.PORT, SHOPPING_CENTER_CATEGORIES.TYPE_BOOSTERS, null),
  shopItem(i.black_belt, SHOPPING_CENTER_SECTIONS.PORT, SHOPPING_CENTER_CATEGORIES.TYPE_BOOSTERS, null),
  shopItem(i.twisted_spoon, SHOPPING_CENTER_SECTIONS.PORT, SHOPPING_CENTER_CATEGORIES.TYPE_BOOSTERS, null),
  shopItem(i.dragon_fang, SHOPPING_CENTER_SECTIONS.PORT, SHOPPING_CENTER_CATEGORIES.TYPE_BOOSTERS, null),
  shopItem(i.never_melt_ice, SHOPPING_CENTER_SECTIONS.PORT, SHOPPING_CENTER_CATEGORIES.TYPE_BOOSTERS, null),
  shopItem(i.metal_coat, SHOPPING_CENTER_SECTIONS.PORT, SHOPPING_CENTER_CATEGORIES.TYPE_BOOSTERS, null),
  shopItem(i.miracle_seed, SHOPPING_CENTER_SECTIONS.PORT, SHOPPING_CENTER_CATEGORIES.TYPE_BOOSTERS, null),
  shopItem(i.black_glasses, SHOPPING_CENTER_SECTIONS.PORT, SHOPPING_CENTER_CATEGORIES.TYPE_BOOSTERS, null),
  shopItem(i.hard_stone, SHOPPING_CENTER_SECTIONS.PORT, SHOPPING_CENTER_CATEGORIES.TYPE_BOOSTERS, null),
  shopItem(i.fairy_feather, SHOPPING_CENTER_SECTIONS.PORT, SHOPPING_CENTER_CATEGORIES.TYPE_BOOSTERS, null),
  shopItem(i.soft_sand, SHOPPING_CENTER_SECTIONS.PORT, SHOPPING_CENTER_CATEGORIES.TYPE_BOOSTERS, null),
  shopItem(i.silk_scarf, SHOPPING_CENTER_SECTIONS.PORT, SHOPPING_CENTER_CATEGORIES.TYPE_BOOSTERS, null),
  shopItem(i.spell_tag, SHOPPING_CENTER_SECTIONS.PORT, SHOPPING_CENTER_CATEGORIES.TYPE_BOOSTERS, null),
  shopItem(i.poison_barb, SHOPPING_CENTER_SECTIONS.PORT, SHOPPING_CENTER_CATEGORIES.TYPE_BOOSTERS, null),
  shopItem(i.light_ball, SHOPPING_CENTER_SECTIONS.PORT, SHOPPING_CENTER_CATEGORIES.TYPE_BOOSTERS, null),
  shopItem(i.leek, SHOPPING_CENTER_SECTIONS.PORT, SHOPPING_CENTER_CATEGORIES.TYPE_BOOSTERS, null),
  shopItem(i.lucky_punch, SHOPPING_CENTER_SECTIONS.PORT, SHOPPING_CENTER_CATEGORIES.TYPE_BOOSTERS, null),
  shopItem(i.thick_club, SHOPPING_CENTER_SECTIONS.PORT, SHOPPING_CENTER_CATEGORIES.TYPE_BOOSTERS, null),

  shopItem(i.go_goggles, SHOPPING_CENTER_SECTIONS.DEVON, SHOPPING_CENTER_CATEGORIES.DEVON, 2000),
  shopItem(i.silph_scope, SHOPPING_CENTER_SECTIONS.DEVON, SHOPPING_CENTER_CATEGORIES.DEVON, 2000),
  shopItem(i.heavy_duty_boots, SHOPPING_CENTER_SECTIONS.DEVON, SHOPPING_CENTER_CATEGORIES.DEVON, 2000),
  shopItem(i.shell_bell, SHOPPING_CENTER_SECTIONS.DEVON, SHOPPING_CENTER_CATEGORIES.DEVON, 4000),

  shopItem(i.life_orb, SHOPPING_CENTER_SECTIONS.DEVON, SHOPPING_CENTER_CATEGORIES.DEVON, 8000),
  shopItem(i.metronome, SHOPPING_CENTER_SECTIONS.DEVON, SHOPPING_CENTER_CATEGORIES.DEVON, 8000),
  shopItem(i.zoom_lens, SHOPPING_CENTER_SECTIONS.DEVON, SHOPPING_CENTER_CATEGORIES.DEVON, 8000),
  shopItem(i.protector, SHOPPING_CENTER_SECTIONS.DEVON, SHOPPING_CENTER_CATEGORIES.DEVON, 10000),
  shopItem(i.rocky_helmet, SHOPPING_CENTER_SECTIONS.DEVON, SHOPPING_CENTER_CATEGORIES.DEVON, 10000),
  shopItem(i.blunder_policy, SHOPPING_CENTER_SECTIONS.DEVON, SHOPPING_CENTER_CATEGORIES.DEVON, 12000),

  shopItem(i.lax_incense, SHOPPING_CENTER_SECTIONS.DEVON, SHOPPING_CENTER_CATEGORIES.INCENSES, null),
  shopItem(i.luck_incense, SHOPPING_CENTER_SECTIONS.DEVON, SHOPPING_CENTER_CATEGORIES.INCENSES, null),
  shopItem(i.pure_incense, SHOPPING_CENTER_SECTIONS.DEVON, SHOPPING_CENTER_CATEGORIES.INCENSES, null),
  shopItem(i.odd_incense, SHOPPING_CENTER_SECTIONS.DEVON, SHOPPING_CENTER_CATEGORIES.INCENSES, null),
  shopItem(i.full_incense, SHOPPING_CENTER_SECTIONS.DEVON, SHOPPING_CENTER_CATEGORIES.INCENSES, null),
  shopItem(i.white_flute, SHOPPING_CENTER_SECTIONS.DEVON, SHOPPING_CENTER_CATEGORIES.FLUTES, null),
  shopItem(i.black_flute, SHOPPING_CENTER_SECTIONS.DEVON, SHOPPING_CENTER_CATEGORIES.FLUTES, null),
  shopItem(i.master_ball, SHOPPING_CENTER_SECTIONS.DEVON, SHOPPING_CENTER_CATEGORIES.POKE_BALL, null),
  shopItem(i.felix_stone, SHOPPING_CENTER_SECTIONS.DEVON, SHOPPING_CENTER_CATEGORIES.EVOLUTION_ITEMS, null),
  shopItem(i.moon_stone, SHOPPING_CENTER_SECTIONS.DEVON, SHOPPING_CENTER_CATEGORIES.EVOLUTION_ITEMS, null),
  shopItem(i.sun_stone, SHOPPING_CENTER_SECTIONS.DEVON, SHOPPING_CENTER_CATEGORIES.EVOLUTION_ITEMS, null),
  shopItem(i.deep_sea_tooth, SHOPPING_CENTER_SECTIONS.DEVON, SHOPPING_CENTER_CATEGORIES.EVOLUTION_ITEMS, null),
  shopItem(i.deep_sea_scale, SHOPPING_CENTER_SECTIONS.DEVON, SHOPPING_CENTER_CATEGORIES.EVOLUTION_ITEMS, null),
  shopItem(i.prism_scale, SHOPPING_CENTER_SECTIONS.DEVON, SHOPPING_CENTER_CATEGORIES.EVOLUTION_ITEMS, null),
  shopItem(i.upgrade, SHOPPING_CENTER_SECTIONS.DEVON, SHOPPING_CENTER_CATEGORIES.EVOLUTION_ITEMS, null),
  shopItem(i.dragon_scale, SHOPPING_CENTER_SECTIONS.DEVON, SHOPPING_CENTER_CATEGORIES.EVOLUTION_ITEMS, null),
  shopItem(i.linking_cord, SHOPPING_CENTER_SECTIONS.DEVON, SHOPPING_CENTER_CATEGORIES.EVOLUTION_ITEMS, null)
];

var STOCK_RULES = [
  { item: i.hp_up, stock: { kind: "fixed", limit: 10 } },
  { item: i.pp_up, stock: { kind: "fixed", limit: 10 } },
  { item: i.pp_max, stock: { kind: "fixed", limit: 10 } },
  { item: i.kings_rock, stock: { kind: "fixed", limit: 2 } },
  { item: i.focus_band, stock: { kind: "fixed", limit: 2 } },
  { item: i.bright_powder, stock: { kind: "fixed", limit: 2 } },
  { item: i.focus_sash, stock: { kind: "fixed", limit: 2 } }
];

// A null purchase price is the canonical signal that an item is displayed but
// cannot be bought.
export var SHOPPING_CENTER_UNPURCHASABLE_ITEMS = SHOPPING_CENTER_ITEMS
  .filter(function (entry) { return entry.price === null; })
  .map(function (entry) { return entry.item; });

export var SHOPPING_CENTER_UNSELLABLE_ITEMS = i.itemsSortedByIndex(i.ITEM_LIBRARY.filter(function (item) {
  return item && item.category === i.ItemCategory.TM;
})).concat([i.go_goggles, i.silph_scope, i.white_flute, i.black_flute]);

function itemIndex(item) {
  return item && item.index !== undefined && item.index !== null ? Number(item.index) : 0;
}

function itemInList(item, list) {
  var idx = itemIndex(item);
  return Boolean(idx && list.some(function (candidate) { return itemIndex(candidate) === idx; }));
}

function inventoryEntryIndex(entry) {
  if (Array.isArray(entry)) return Number(entry[0]);
  return Number(entry && entry.index);
}

function inventoryEntryQuantity(entry) {
  if (Array.isArray(entry)) return Number(entry[1]) || 0;
  return Number(entry && entry.quantity) || 0;
}

function findShopItem(item) {
  var idx = itemIndex(item);
  return SHOPPING_CENTER_ITEMS.find(function (entry) { return itemIndex(entry.item) === idx; }) || null;
}

function findStockRule(item) {
  var idx = itemIndex(item);
  return STOCK_RULES.find(function (entry) { return itemIndex(entry.item) === idx; }) || null;
}

function getUnlockRule(item) {
  var idx = itemIndex(item);
  return ITEM_UNLOCK_RULES.find(function (rule) { return rule && itemIndex(rule.item) === idx; }) || null;
}

function isSinglePurchaseItem(item) {
  if (!item) return false;
  if (shoppingCenterIsUnsellableItem(item) && !shoppingCenterItemIsUnpurchasable(item)) return true;
  var rule = findStockRule(item);
  return Boolean(rule && rule.stock && rule.stock.kind === "single_owned");
}

function isItemAlreadyOwned(item, inventory) {
  if (!isSinglePurchaseItem(item)) return false;
  return (inventory || []).some(function (entry) {
    return entry && inventoryEntryIndex(entry) === itemIndex(item) && inventoryEntryQuantity(entry) > 0;
  });
}

function shoppingCenterItemUnlockBadges(item) {
  if (item && item.category === i.ItemCategory.TM) return tmUnlockBadges(item);
  var rule = getUnlockRule(item);
  return rule ? (rule.requirement.value || 0) : -1;
}

function computeStockRemaining(item, state) {
  if (isSinglePurchaseItem(item)) return isItemAlreadyOwned(item, state.inventory) ? 0 : 1;
  var stockEntry = findStockRule(item);
  if (!stockEntry || !stockEntry.stock) return Infinity;
  var rule = stockEntry.stock;
  if (rule.kind === "fixed") {
    var purchased = Math.max(0, Math.floor(Number((state.shopPurchases || {})[String(item.index)]) || 0));
    return Math.max(0, Math.floor(Number(rule.limit) || 0) - purchased);
  }
  return Infinity;
}

function itemAvailability(item, state) {
  var badges = normalizedBadges(state.trainerInfo && state.trainerInfo[2]);
  if (shoppingCenterItemIsUnpurchasable(item) || shoppingCenterItemPrice(item) === null) {
    return { key: "unpurchasable", canPurchase: false };
  }
  if (isItemAlreadyOwned(item, state.inventory)) {
    return { key: "already_owned", canPurchase: false };
  }
  var unlockBadges = shoppingCenterItemUnlockBadges(item);
  if (unlockBadges < 0) return { key: "unknown", canPurchase: false };
  if (badges < unlockBadges) {
    return { key: "locked_badges", requiredBadges: unlockBadges, canPurchase: false };
  }
  return { key: "unlocked", canPurchase: true };
}

function resolveShopEntry(item, state, fallbackGroup) {
  var shopEntry = findShopItem(item) || fallbackGroup || {};
  var availability = itemAvailability(item, state);
  var stockRemaining = computeStockRemaining(item, state);
  return {
    item: item,
    price: shoppingCenterItemPrice(item),
    section: shopEntry.section || "",
    category: shopEntry.category || "",
    availability: availability,
    canPurchase: availability.canPurchase && stockRemaining > 0,
    stockRemaining: stockRemaining
  };
}

function entryUnlockBadges(entry) {
  var badges = shoppingCenterItemUnlockBadges(entry && entry.item);
  return badges >= 0 ? badges : Infinity;
}

function groupUnlockBadges(entries) {
  return entries.reduce(function (lowest, entry) {
    return Math.min(lowest, entryUnlockBadges(entry));
  }, Infinity);
}

function pushGroup(groups, categoryKey, availabilityKey, entries, purchasable, requiredBadges) {
  if (entries.length) groups.push({
    categoryKey: categoryKey,
    availabilityKey: availabilityKey,
    requiredBadges: Number(requiredBadges) || 0,
    items: entries,
    purchasable: purchasable,
    unlockBadges: groupUnlockBadges(entries),
    order: groups.length
  });
}

function sortGroupsByUnlockBadges(groups) {
  return groups.slice().sort(function (a, b) {
    var badgeDiff = a.unlockBadges - b.unlockBadges;
    return badgeDiff || a.order - b.order;
  });
}

function buildPurchaseGroups(entriesByCategory) {
  var groups = [];
  var ownedGroups = [];
  Object.keys(entriesByCategory).forEach(function (categoryName) {
    var entries = entriesByCategory[categoryName];
    var unlocked = [];
    var owned = [];
    var unpurchasable = [];
    var lockedByBadgeCount = {};

    entries.forEach(function (entry) {
      if (entry.availability.key === "unlocked") unlocked.push(entry);
      else if (entry.availability.key === "already_owned") owned.push(entry);
      else if (entry.availability.key === "locked_badges") {
        var requiredBadges = String(entry.availability.requiredBadges || 0);
        if (!lockedByBadgeCount[requiredBadges]) lockedByBadgeCount[requiredBadges] = [];
        lockedByBadgeCount[requiredBadges].push(entry);
      } else unpurchasable.push(entry);
    });

    pushGroup(groups, categoryName, "unlocked", unlocked, true);
    Object.keys(lockedByBadgeCount).forEach(function (requiredBadges) {
      pushGroup(groups, categoryName, "locked_badges", lockedByBadgeCount[requiredBadges], true, requiredBadges);
    });
    pushGroup(groups, categoryName, "unpurchasable", unpurchasable, false);
    pushGroup(ownedGroups, categoryName, "already_owned", owned, false);
  });
  return sortGroupsByUnlockBadges(groups).concat(sortGroupsByUnlockBadges(ownedGroups));
}

function buildTMGroups(state) {
  var byCategory = {};
  var groups;
  byCategory[SHOPPING_CENTER_CATEGORIES.TM] = [];
  i.itemsSortedByIndex(i.ITEM_LIBRARY).forEach(function (item) {
    if (item && item.category === i.ItemCategory.TM) {
      byCategory[SHOPPING_CENTER_CATEGORIES.TM].push(resolveShopEntry(item, state, { section: SHOPPING_CENTER_SECTIONS.TM, category: SHOPPING_CENTER_CATEGORIES.TM }));
    }
  });
  groups = buildPurchaseGroups(byCategory);
  return groups.filter(function (group) { return group.availabilityKey !== "unpurchasable" && group.availabilityKey !== "already_owned"; })
    .concat(groups.filter(function (group) { return group.availabilityKey === "unpurchasable"; }))
    .concat(groups.filter(function (group) { return group.availabilityKey === "already_owned"; }));
}

function buildSellGroups(state) {
  var sellable = [];
  i.resolveInventoryItems(state.inventory || []).forEach(function (item) {
    if (!shoppingCenterIsUnsellableItem(item)) sellable.push(item);
  });
  var groups = [];
  pushGroup(groups, "sell_cart", "sell", sellable, true);
  return groups;
}

export function getShoppingCenterSections() {
  var sections = [];
  SHOPPING_CENTER_ITEMS.forEach(function (entry) {
    if (sections.indexOf(entry.section) === -1) sections.push(entry.section);
  });
  return sections.concat([SHOPPING_CENTER_SECTIONS.TM, SHOPPING_CENTER_SECTIONS.SELL]);
}

export function getShoppingCenterGroups(sectionName, state) {
  if (!sectionName) return [];
  if (sectionName === SHOPPING_CENTER_SECTIONS.SELL) return buildSellGroups(state);
  if (sectionName === SHOPPING_CENTER_SECTIONS.TM) return buildTMGroups(state);
  var byCategory = {};
  SHOPPING_CENTER_ITEMS.filter(function (entry) { return entry.section === sectionName; }).forEach(function (entry) {
    if (!byCategory[entry.category]) byCategory[entry.category] = [];
    byCategory[entry.category].push(resolveShopEntry(entry.item, state, entry));
  });
  return buildPurchaseGroups(byCategory);
}

export function shoppingCenterItemCanBePurchased(item, state) {
  if (!item) return false;
  var availability = itemAvailability(item, state);
  return availability.canPurchase && computeStockRemaining(item, state) > 0;
}

export function shoppingCenterItemPrice(item) {
  if (item && item.category === i.ItemCategory.TM) return tmPrice(item);
  var entry = findShopItem(item);
  return entry ? entry.price : null;
}

export function shoppingCenterSalePrice(item) {
  if (!item) return 0;
  if (item.category === i.ItemCategory.Berry) return 50;
  var price = shoppingCenterItemPrice(item);
  return price === null ? DEFAULT_UNCATALOGUED_SALE_PRICE : Math.floor(price / 2);
}

export function shoppingCenterRemainingCartQuantity(item, state, cart) {
  var stockRemaining = computeStockRemaining(item, state);
  if (stockRemaining === Infinity) return Infinity;
  var cartQty = item ? Number((cart || {})[String(item.index)]) || 0 : 0;
  return Math.max(0, stockRemaining - cartQty);
}

export function shoppingCenterItemIsUnpurchasable(item) {
  return itemInList(item, SHOPPING_CENTER_UNPURCHASABLE_ITEMS);
}

export function shoppingCenterIsSellSection(sectionName) {
  return sectionName === SHOPPING_CENTER_SECTIONS.SELL;
}

export function shoppingCenterIsUnsellableItem(item) {
  return itemInList(item, SHOPPING_CENTER_UNSELLABLE_ITEMS);
}

export function shoppingCenterItemIsSinglePurchase(item) {
  return isSinglePurchaseItem(item);
}

export function shoppingCenterSectionify(currentSection) {
  var sections = getShoppingCenterSections();
  return sections.indexOf(currentSection) !== -1 ? currentSection : sections[0];
}

export function computeCartEntries(cart, isSale, inventory, stateObj) {
  return Object.keys(cart || {}).map(function (itemIndex) {
    var item = isSale ? i.getResolvedInventoryItem(inventory || [], itemIndex) : i.getItemByIndex(itemIndex);
    var quantity = Number(cart[itemIndex]) || 0;
    if (!item || quantity <= 0) return null;
    if (isSale) {
      if (shoppingCenterIsUnsellableItem(item)) return null;
      quantity = Math.min(quantity, Math.floor(Number(item.quantity) || 0));
      if (quantity <= 0) return null;
    } else {
      var remaining = shoppingCenterRemainingCartQuantity(item, stateObj, {});
      if (!shoppingCenterItemCanBePurchased(item, stateObj)) return null;
      quantity = remaining === Infinity ? quantity : Math.min(quantity, remaining);
      if (quantity <= 0) return null;
    }
    var price = isSale ? shoppingCenterSalePrice(item) : shoppingCenterItemPrice(item);
    return { item: item, quantity: quantity, subtotal: quantity * price };
  }).filter(Boolean);
}

export function computeCartTotal(entries) {
  return entries.reduce(function (t, e) { return t + e.subtotal; }, 0);
}
