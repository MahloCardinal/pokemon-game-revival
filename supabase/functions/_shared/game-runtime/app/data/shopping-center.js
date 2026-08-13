import * as i from "./items.js";
import { ITEM_UNLOCK_RULES, GYM_REWARD_MT_ITEMS, mtPrice, mtUnlockBadges, normalizedBadges } from "./progression.js";

function shopItem(item, section, category, price) {
  return { item: item, section: section, category: category, price: price };
}

var DEFAULT_UNCATALOGUED_SALE_PRICE = 100;

export var SHOPPING_CENTER_SECTIONS = {
  MARKET: "Market",
  PORT: "Mercato del Porto",
  DEVON: "Devon SpA",
  MT: "Negozio MT",
  SELL: "Vendi"
};

export var SHOPPING_CENTER_CATEGORIES = {
  POKE_BALL: "Poké Ball",
  HEALING: "Strumenti curativi",
  EVOLUTION_STONES: "Pietre evolutive",
  HERB: "Erbe medicinali",
  DRINK: "Bevande",
  VITAMIN: "Vitamine",
  COMPETITIVE: "Strumenti del Porto",
  TYPE_BOOSTERS: "Strumenti potenziatori",
  DEVON: "Devon SpA",
  INCENSES: "Aromi",
  FLUTES: "Flauti",
  EVOLUTION_ITEMS: "Strumenti evolutivi",
  MT: "MT",
  RARE: "Strumenti rari"
};

export var SHOPPING_CENTER_ITEMS = [
  shopItem(i.poke_ball, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.POKE_BALL, 200),
  shopItem(i.mega_ball, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.POKE_BALL, 600),
  shopItem(i.ultra_ball, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.POKE_BALL, 1200),
  shopItem(i.pozione, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.HEALING, 300),
  shopItem(i.superpozione, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.HEALING, 700),
  shopItem(i.iperpozione, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.HEALING, 2000),
  shopItem(i.pozione_max, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.HEALING, 3500),
  shopItem(i.ricarica_totale, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.HEALING, 4500),
  shopItem(i.antidoto, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.HEALING, 100),
  shopItem(i.antiparalisi, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.HEALING, 200),
  shopItem(i.sveglia, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.HEALING, 250),
  shopItem(i.antiscottatura, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.HEALING, 250),
  shopItem(i.antigelo, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.HEALING, 250),
  shopItem(i.cura_totale, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.HEALING, 600),
  shopItem(i.elisir_chiarocielo, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.HEALING, 1000),
  shopItem(i.revitalizzante, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.HEALING, 2000),
  shopItem(i.revitalizzante_max, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.HEALING, 6000),
  shopItem(i.pietrafocaia, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.EVOLUTION_STONES, 2500),
  shopItem(i.pietratuono, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.EVOLUTION_STONES, 2500),
  shopItem(i.pietraidrica, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.EVOLUTION_STONES, 2500),
  shopItem(i.pietrafoglia, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.EVOLUTION_STONES, 2500),
  shopItem(i.polvocura, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.HERB, 300),
  shopItem(i.polvenergia, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.HERB, 500),
  shopItem(i.radicenergia, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.HERB, 1200),
  shopItem(i.vitalerba, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.HERB, 2800),
  shopItem(i.acqua_fresca, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.DRINK, null),
  shopItem(i.gassosa, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.DRINK, null),
  shopItem(i.lemonsucco, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.DRINK, null),
  shopItem(i.latte_mumu, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.DRINK, null),
  shopItem(i.squama_cuore, SHOPPING_CENTER_SECTIONS.MARKET, SHOPPING_CENTER_CATEGORIES.RARE, null),

  shopItem(i.ps_su, SHOPPING_CENTER_SECTIONS.PORT, SHOPPING_CENTER_CATEGORIES.VITAMIN, 10000),
  shopItem(i.pp_su, SHOPPING_CENTER_SECTIONS.PORT, SHOPPING_CENTER_CATEGORIES.VITAMIN, 10000),
  shopItem(i.pp_max, SHOPPING_CENTER_SECTIONS.PORT, SHOPPING_CENTER_CATEGORIES.VITAMIN, 15000),

  shopItem(i.bandana, SHOPPING_CENTER_SECTIONS.PORT, SHOPPING_CENTER_CATEGORIES.COMPETITIVE, 8000),
  shopItem(i.focalnastro, SHOPPING_CENTER_SECTIONS.PORT, SHOPPING_CENTER_CATEGORIES.COMPETITIVE, 10000),
  shopItem(i.luminpolvere, SHOPPING_CENTER_SECTIONS.PORT, SHOPPING_CENTER_CATEGORIES.COMPETITIVE, 10000),
  shopItem(i.roccia_di_re, SHOPPING_CENTER_SECTIONS.PORT, SHOPPING_CENTER_CATEGORIES.COMPETITIVE, 12000),

  shopItem(i.acqua_magica, SHOPPING_CENTER_SECTIONS.PORT, SHOPPING_CENTER_CATEGORIES.TYPE_BOOSTERS, null),
  shopItem(i.argenpolvere, SHOPPING_CENTER_SECTIONS.PORT, SHOPPING_CENTER_CATEGORIES.TYPE_BOOSTERS, null),
  shopItem(i.beccaffilato, SHOPPING_CENTER_SECTIONS.PORT, SHOPPING_CENTER_CATEGORIES.TYPE_BOOSTERS, null),
  shopItem(i.calamita, SHOPPING_CENTER_SECTIONS.PORT, SHOPPING_CENTER_CATEGORIES.TYPE_BOOSTERS, null),
  shopItem(i.carbonella, SHOPPING_CENTER_SECTIONS.PORT, SHOPPING_CENTER_CATEGORIES.TYPE_BOOSTERS, null),
  shopItem(i.cintura_nera, SHOPPING_CENTER_SECTIONS.PORT, SHOPPING_CENTER_CATEGORIES.TYPE_BOOSTERS, null),
  shopItem(i.cucchiaio_torto, SHOPPING_CENTER_SECTIONS.PORT, SHOPPING_CENTER_CATEGORIES.TYPE_BOOSTERS, null),
  shopItem(i.dente_di_drago, SHOPPING_CENTER_SECTIONS.PORT, SHOPPING_CENTER_CATEGORIES.TYPE_BOOSTERS, null),
  shopItem(i.gelomai, SHOPPING_CENTER_SECTIONS.PORT, SHOPPING_CENTER_CATEGORIES.TYPE_BOOSTERS, null),
  shopItem(i.metalcopertura, SHOPPING_CENTER_SECTIONS.PORT, SHOPPING_CENTER_CATEGORIES.TYPE_BOOSTERS, null),
  shopItem(i.miracolseme, SHOPPING_CENTER_SECTIONS.PORT, SHOPPING_CENTER_CATEGORIES.TYPE_BOOSTERS, null),
  shopItem(i.occhialineri, SHOPPING_CENTER_SECTIONS.PORT, SHOPPING_CENTER_CATEGORIES.TYPE_BOOSTERS, null),
  shopItem(i.pietradura, SHOPPING_CENTER_SECTIONS.PORT, SHOPPING_CENTER_CATEGORIES.TYPE_BOOSTERS, null),
  shopItem(i.piuma_fatata, SHOPPING_CENTER_SECTIONS.PORT, SHOPPING_CENTER_CATEGORIES.TYPE_BOOSTERS, null),
  shopItem(i.sabbia_soffice, SHOPPING_CENTER_SECTIONS.PORT, SHOPPING_CENTER_CATEGORIES.TYPE_BOOSTERS, null),
  shopItem(i.sciarpa_seta, SHOPPING_CENTER_SECTIONS.PORT, SHOPPING_CENTER_CATEGORIES.TYPE_BOOSTERS, null),
  shopItem(i.spettrotarga, SHOPPING_CENTER_SECTIONS.PORT, SHOPPING_CENTER_CATEGORIES.TYPE_BOOSTERS, null),
  shopItem(i.velenaculeo, SHOPPING_CENTER_SECTIONS.PORT, SHOPPING_CENTER_CATEGORIES.TYPE_BOOSTERS, null),
  shopItem(i.elettropalla, SHOPPING_CENTER_SECTIONS.PORT, SHOPPING_CENTER_CATEGORIES.TYPE_BOOSTERS, null),
  shopItem(i.gambo, SHOPPING_CENTER_SECTIONS.PORT, SHOPPING_CENTER_CATEGORIES.TYPE_BOOSTERS, null),
  shopItem(i.fortunpugno, SHOPPING_CENTER_SECTIONS.PORT, SHOPPING_CENTER_CATEGORIES.TYPE_BOOSTERS, null),
  shopItem(i.osso_spesso, SHOPPING_CENTER_SECTIONS.PORT, SHOPPING_CENTER_CATEGORIES.TYPE_BOOSTERS, null),

  shopItem(i.occhialoni, SHOPPING_CENTER_SECTIONS.DEVON, SHOPPING_CENTER_CATEGORIES.DEVON, 2000),
  shopItem(i.spettrosonda, SHOPPING_CENTER_SECTIONS.DEVON, SHOPPING_CENTER_CATEGORIES.DEVON, 2000),
  shopItem(i.scarponi_robusti, SHOPPING_CENTER_SECTIONS.DEVON, SHOPPING_CENTER_CATEGORIES.DEVON, 2000),
  shopItem(i.conchinella, SHOPPING_CENTER_SECTIONS.DEVON, SHOPPING_CENTER_CATEGORIES.DEVON, 4000),

  shopItem(i.assorbisfera, SHOPPING_CENTER_SECTIONS.DEVON, SHOPPING_CENTER_CATEGORIES.DEVON, 8000),
  shopItem(i.plessimetro, SHOPPING_CENTER_SECTIONS.DEVON, SHOPPING_CENTER_CATEGORIES.DEVON, 8000),
  shopItem(i.zoomlente, SHOPPING_CENTER_SECTIONS.DEVON, SHOPPING_CENTER_CATEGORIES.DEVON, 8000),
  shopItem(i.copertura, SHOPPING_CENTER_SECTIONS.DEVON, SHOPPING_CENTER_CATEGORIES.DEVON, 10000),
  shopItem(i.bitorzolelmo, SHOPPING_CENTER_SECTIONS.DEVON, SHOPPING_CENTER_CATEGORIES.DEVON, 10000),
  shopItem(i.fiascopolizza, SHOPPING_CENTER_SECTIONS.DEVON, SHOPPING_CENTER_CATEGORIES.DEVON, 12000),

  shopItem(i.distraroma, SHOPPING_CENTER_SECTIONS.DEVON, SHOPPING_CENTER_CATEGORIES.INCENSES, null),
  shopItem(i.fortunaroma, SHOPPING_CENTER_SECTIONS.DEVON, SHOPPING_CENTER_CATEGORIES.INCENSES, null),
  shopItem(i.puroaroma, SHOPPING_CENTER_SECTIONS.DEVON, SHOPPING_CENTER_CATEGORIES.INCENSES, null),
  shopItem(i.bizzoaroma, SHOPPING_CENTER_SECTIONS.DEVON, SHOPPING_CENTER_CATEGORIES.INCENSES, null),
  shopItem(i.gonfioaroma, SHOPPING_CENTER_SECTIONS.DEVON, SHOPPING_CENTER_CATEGORIES.INCENSES, null),
  shopItem(i.flauto_bianco, SHOPPING_CENTER_SECTIONS.DEVON, SHOPPING_CENTER_CATEGORIES.FLUTES, null),
  shopItem(i.flauto_nero, SHOPPING_CENTER_SECTIONS.DEVON, SHOPPING_CENTER_CATEGORIES.FLUTES, null),
  shopItem(i.master_ball, SHOPPING_CENTER_SECTIONS.DEVON, SHOPPING_CENTER_CATEGORIES.POKE_BALL, null),
  shopItem(i.felixpietra, SHOPPING_CENTER_SECTIONS.DEVON, SHOPPING_CENTER_CATEGORIES.EVOLUTION_ITEMS, null),
  shopItem(i.pietralunare, SHOPPING_CENTER_SECTIONS.DEVON, SHOPPING_CENTER_CATEGORIES.EVOLUTION_ITEMS, null),
  shopItem(i.pietrasolare, SHOPPING_CENTER_SECTIONS.DEVON, SHOPPING_CENTER_CATEGORIES.EVOLUTION_ITEMS, null),
  shopItem(i.dente_abissi, SHOPPING_CENTER_SECTIONS.DEVON, SHOPPING_CENTER_CATEGORIES.EVOLUTION_ITEMS, null),
  shopItem(i.squamabissi, SHOPPING_CENTER_SECTIONS.DEVON, SHOPPING_CENTER_CATEGORIES.EVOLUTION_ITEMS, null),
  shopItem(i.squama_bella, SHOPPING_CENTER_SECTIONS.DEVON, SHOPPING_CENTER_CATEGORIES.EVOLUTION_ITEMS, null),
  shopItem(i.upgrade, SHOPPING_CENTER_SECTIONS.DEVON, SHOPPING_CENTER_CATEGORIES.EVOLUTION_ITEMS, null),
  shopItem(i.squama_drago, SHOPPING_CENTER_SECTIONS.DEVON, SHOPPING_CENTER_CATEGORIES.EVOLUTION_ITEMS, null),
  shopItem(i.filo_dell_unione, SHOPPING_CENTER_SECTIONS.DEVON, SHOPPING_CENTER_CATEGORIES.EVOLUTION_ITEMS, null)
];

var STOCK_RULES = [
  { item: i.ps_su, stock: { kind: "fixed", limit: 10 } },
  { item: i.pp_su, stock: { kind: "fixed", limit: 10 } },
  { item: i.pp_max, stock: { kind: "fixed", limit: 10 } },
  { item: i.roccia_di_re, stock: { kind: "fixed", limit: 2 } },
  { item: i.bandana, stock: { kind: "fixed", limit: 2 } },
  { item: i.luminpolvere, stock: { kind: "fixed", limit: 2 } },
  { item: i.focalnastro, stock: { kind: "fixed", limit: 2 } }
];

// A null purchase price is the canonical signal that an item is displayed but
// cannot be bought.
export var SHOPPING_CENTER_UNPURCHASABLE_ITEMS = SHOPPING_CENTER_ITEMS
  .filter(function (entry) { return entry.price === null; })
  .map(function (entry) { return entry.item; });

export var SHOPPING_CENTER_UNSELLABLE_ITEMS = i.itemsSortedByIndex(i.ITEM_LIBRARY.filter(function (item) {
  return item && item.category === i.ItemCategory.Mt;
})).concat([i.occhialoni, i.spettrosonda, i.flauto_bianco, i.flauto_nero]);

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

function isItemGymRewardMt(item) {
  return Boolean(item && item.category === i.ItemCategory.Mt && GYM_REWARD_MT_ITEMS.indexOf(item.index) !== -1);
}

function isSinglePurchaseItem(item) {
  if (!item) return false;
  if (shoppingCenterIsUnsellableItem(item) && !shoppingCenterItemIsUnpurchasable(item)) return true;
  var rule = findStockRule(item);
  return Boolean(rule && rule.stock && rule.stock.kind === "single-owned");
}

function isItemAlreadyOwned(item, inventory) {
  if (!isSinglePurchaseItem(item)) return false;
  return (inventory || []).some(function (entry) {
    return entry && inventoryEntryIndex(entry) === itemIndex(item) && inventoryEntryQuantity(entry) > 0;
  });
}

function shoppingCenterItemUnlockBadges(item) {
  if (item && item.category === i.ItemCategory.Mt) return mtUnlockBadges(item);
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
  if (shoppingCenterItemIsUnpurchasable(item) || isItemGymRewardMt(item)) {
    return { key: "unpurchasable", label: "Non acquistabile", canPurchase: false };
  }
  if (isItemAlreadyOwned(item, state.inventory)) {
    return { key: "already-owned", label: item && item.category === i.ItemCategory.Mt ? "Già acquistata" : "Già acquistato", canPurchase: false };
  }
  var unlockBadges = shoppingCenterItemUnlockBadges(item);
  if (unlockBadges < 0) return { key: "unknown", label: "Non acquistabile", canPurchase: false };
  if (badges < unlockBadges) {
    return { key: "locked-badges", label: "Acquistabili con " + unlockBadges + (unlockBadges === 1 ? " Medaglia" : " Medaglie"), canPurchase: false };
  }
  return { key: "unlocked", label: "Acquistabili", canPurchase: true };
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

function pushGroup(groups, title, entries, purchasable) {
  if (entries.length) groups.push({
    title: title,
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
    var lockedByLabel = {};

    entries.forEach(function (entry) {
      if (entry.availability.key === "unlocked") unlocked.push(entry);
      else if (entry.availability.key === "already-owned") owned.push(entry);
      else if (entry.availability.key === "locked-badges") {
        if (!lockedByLabel[entry.availability.label]) lockedByLabel[entry.availability.label] = [];
        lockedByLabel[entry.availability.label].push(entry);
      } else unpurchasable.push(entry);
    });

    pushGroup(groups, categoryName + " - Acquistabili", unlocked, true);
    Object.keys(lockedByLabel).forEach(function (label) {
      pushGroup(groups, categoryName + " - " + label, lockedByLabel[label], true);
    });
    pushGroup(groups, categoryName + " - Non acquistabili", unpurchasable, false);
    pushGroup(ownedGroups, categoryName + (categoryName === SHOPPING_CENTER_CATEGORIES.MT ? " - Già acquistate" : " - Già acquistati"), owned, false);
  });
  return sortGroupsByUnlockBadges(groups).concat(sortGroupsByUnlockBadges(ownedGroups));
}

function buildMtGroups(state) {
  var byCategory = {};
  var groups;
  var nonPurchasableTitle = SHOPPING_CENTER_CATEGORIES.MT + " - Non acquistabili";
  var ownedTitle = SHOPPING_CENTER_CATEGORIES.MT + " - Già acquistate";
  byCategory[SHOPPING_CENTER_CATEGORIES.MT] = [];
  i.itemsSortedByIndex(i.ITEM_LIBRARY).forEach(function (item) {
    if (item && item.category === i.ItemCategory.Mt) {
      byCategory[SHOPPING_CENTER_CATEGORIES.MT].push(resolveShopEntry(item, state, { section: SHOPPING_CENTER_SECTIONS.MT, category: SHOPPING_CENTER_CATEGORIES.MT }));
    }
  });
  groups = buildPurchaseGroups(byCategory);
  return groups.filter(function (group) { return group.title !== nonPurchasableTitle && group.title !== ownedTitle; })
    .concat(groups.filter(function (group) { return group.title === nonPurchasableTitle; }))
    .concat(groups.filter(function (group) { return group.title === ownedTitle; }));
}

function buildSellGroups(state) {
  var sellable = [];
  i.resolveInventoryItems(state.inventory || []).forEach(function (item) {
    if (!shoppingCenterIsUnsellableItem(item)) sellable.push(item);
  });
  var groups = [];
  pushGroup(groups, "Inserisci nel carrello gli oggetti da vendere", sellable, true);
  return groups;
}

export function getShoppingCenterSections() {
  var sections = [];
  SHOPPING_CENTER_ITEMS.forEach(function (entry) {
    if (sections.indexOf(entry.section) === -1) sections.push(entry.section);
  });
  return sections.concat([SHOPPING_CENTER_SECTIONS.MT, SHOPPING_CENTER_SECTIONS.SELL]);
}

export function getShoppingCenterGroups(sectionName, state) {
  if (!sectionName) return [];
  if (sectionName === SHOPPING_CENTER_SECTIONS.SELL) return buildSellGroups(state);
  if (sectionName === SHOPPING_CENTER_SECTIONS.MT) return buildMtGroups(state);
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
  if (item && item.category === i.ItemCategory.Mt) return mtPrice(item);
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

export function shoppingCenterItemIsGymRewardMt(item) {
  return isItemGymRewardMt(item);
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
