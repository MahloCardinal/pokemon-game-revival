import { BERRY_NORMAL_CYCLE_ITEMS, BERRY_LONG_CYCLE_ITEMS, getBerryGrowthCycle, getItemByIndex } from "../data/items.js";
import { assetPath, escapeHtml, getItemDisplayImage, renderImage } from "../client/asset-helpers.js";
import { button, renderScenePresentationPanel, sceneShell } from "../client/render-utils.js";
import { state } from "../client/game-state.js";
import { renderDebugButton } from "../client/debug-tools.js";
import { itemDisplayDescription, itemDisplayName } from "../client/entity-text.js";
import { t } from "../client/i18n.js";

function getPlotStage(plot) {
  if (!plot) return "empty";
  if (!plot.seedTime) return "sprout";
  var elapsed = Date.now() - new Date(plot.seedTime).getTime();
  if (!Number.isFinite(elapsed)) return "sprout";
  if (plot.readyAt) {
    var plantedAt = new Date(plot.seedTime).getTime();
    var readyAt = new Date(plot.readyAt).getTime();
    var authoritativeDuration = readyAt - plantedAt;
    if (Number.isFinite(authoritativeDuration) && authoritativeDuration > 0) {
      var authoritativeProgress = elapsed / authoritativeDuration;
      if (authoritativeProgress < 1/3) return "sprout";
      if (authoritativeProgress < 2/3) return "sapling";
      if (authoritativeProgress < 1) return "flowering";
      return "ready";
    }
  }
  var durationHours = getBerryGrowthCycle(plot.berryIndex);
  if (!durationHours) return "empty";
  var duration = durationHours * 3600 * 1000;
  if (duration <= 0) return "ready";
  var progress = elapsed / duration;
  if (progress < 1/3) return "sprout";
  if (progress < 2/3) return "sapling";
  if (progress < 1) return "flowering";
  return "ready";
}

var PLANT_IMAGES = {
  empty: "terriccio.webp",
  sprout: "piantina.webp",
  sapling: "alberello.webp",
  flowering: "albero_fiorito.webp",
  ready: "albero_con_bacche.webp"
};

function inventoryQuantity(itemIndex) {
  return (state.inventory || []).reduce(function (total, entry) {
    return Number(entry[0]) === Number(itemIndex) ? total + Number(entry[1] || 0) : total;
  }, 0);
}

function renderBerryCatalog() {
  function renderBerryCard(item) {
    var itemName = itemDisplayName(item);
    var quantity = inventoryQuantity(item.index);
    var plantingPlotIndex = Number(state.garden.plantingPlotIndex);
    var isPlanting = state.garden.plantingPlotIndex !== null && Number.isInteger(plantingPlotIndex) && plantingPlotIndex >= 0;
    var disabled = isPlanting && quantity <= 0;
    var tagName = isPlanting ? "button" : "article";
    var attrs = isPlanting
      ? ' type="button" data-action="garden-plant-select" data-plot-index="' + escapeHtml(plantingPlotIndex) + '" data-item-index="' + escapeHtml(item.index) + '"' + (disabled ? " disabled" : "")
      : "";
    var cardClass = "garden-berry-card";
    var debugButton = renderDebugButton("+50", "debug-add-item", 'data-item-index="' + escapeHtml(item.index) + '"', "button-ghost button-slim garden-berry-debug-add");
    var availabilityMarkup = quantity > 0
      ? '<span class="garden-berry-availability">' + escapeHtml(t("ui.garden.available", { count: quantity })) + "</span>"
      : '<span class="garden-berry-availability-placeholder" aria-hidden="true"></span>';

    if (isPlanting) {
      cardClass += " garden-berry-button";
    }
    if (disabled) {
      cardClass += " is-unavailable";
    }

    return [
      '<div class="garden-berry-card-shell">',
      "<" + tagName + ' class="' + cardClass + '"' + attrs + ">",
      '  <div class="garden-berry-side">',
      '    <div class="garden-berry-media">',
      renderImage(getItemDisplayImage(item), itemName, "garden-berry-image"),
      "    </div>",
      '    <div class="garden-berry-availability-cell">',
      availabilityMarkup,
      "    </div>",
      "  </div>",
      '  <div class="garden-berry-copy">',
      '    <h3 class="garden-berry-name">' + escapeHtml(itemName) + "</h3>",
      '    <p class="garden-berry-description">' + escapeHtml(itemDisplayDescription(item)) + "</p>",
      "  </div>",
      "</" + tagName + ">",
      debugButton ? '<div class="garden-berry-debug-actions">' + debugButton + "</div>" : "",
      "</div>"
    ].join("");
  }

  function renderGroup(title, items) {
    var groupItems = items.filter(Boolean);
    if (!groupItems.length) return "";
    return [
      '<section class="panel garden-catalog-group">',
      '  <h2 class="garden-catalog-title">' + escapeHtml(title) + "</h2>",
      '  <div class="garden-catalog-grid">',
      groupItems.map(renderBerryCard).join(""),
      "  </div>",
      "</section>"
    ].join("");
  }

  return [
    '<section class="garden-catalog">',
    renderGroup(t("ui.garden.normalCycle"), BERRY_NORMAL_CYCLE_ITEMS),
    renderGroup(t("ui.garden.longCycle"), BERRY_LONG_CYCLE_ITEMS),
    "</section>"
  ].join("");
}

function renderPlot(index) {
  var plot = state.garden.plots[index];
  var harvestNotice = state.garden.harvestNotices && state.garden.harvestNotices[index];
  var stage = getPlotStage(plot);
  var plantImage = PLANT_IMAGES[stage] || "terriccio.webp";
  var nameLabel = plot ? getItemByIndex(plot.berryIndex) : null;
  var isPlantingTarget = state.garden.plantingPlotIndex === index;

  var body = isPlantingTarget && !plot
    ? [
      '  <div class="garden-plot-visual garden-plot-selection-prompt">',
      '    <span>' + escapeHtml(t("ui.garden.selectBerry")) + '</span>',
      "  </div>",
      '  <div class="garden-plot-info">'
    ]
    : [
      '  <div class="garden-plot-visual">',
      renderImage(assetPath("img_miscellaneous", plantImage), t("ui.garden.stages." + stage), "garden-plot-image"),
      "  </div>",
      '  <div class="garden-plot-info">'
    ];

  if (harvestNotice) {
    nameLabel = getItemByIndex(harvestNotice.berryIndex);
    body = [
      '  <div class="garden-plot-info garden-harvest-notice">',
      '    <span class="garden-plot-label">' + escapeHtml(t("ui.garden.harvested", { count: harvestNotice.quantity, berry: nameLabel ? itemDisplayName(nameLabel) : t("ui.garden.berryFallback") })) + "</span>",
      "  </div>",
      '  <div class="garden-plot-action">',
      button(t("ui.pokemonCenter.ok"), "garden-harvest-notice-ok", 'data-plot-index="' + index + '"', "button-primary"),
      "  </div>"
    ];
  } else if (!plot) {
    if (!isPlantingTarget) {
      body.push('    <span class="garden-plot-label">' + escapeHtml(t("ui.garden.empty")) + '</span>');
    }
    body.push("  </div>");
    body.push('  <div class="garden-plot-action">');
    body.push(button(t(isPlantingTarget ? "ui.garden.cancel" : "ui.garden.plant"), "garden-plant-plot", 'data-plot-index="' + index + '"' + (state.inBattle ? " disabled" : ""), isPlantingTarget ? "button-dark" : "button-primary"));
    body.push("  </div>");
  } else {
    body.push('    <span class="garden-plot-label">' + escapeHtml(nameLabel ? itemDisplayName(nameLabel) : "") + "</span>");
    body.push("  </div>");
    if (stage === "ready") {
      body.push('  <div class="garden-plot-action">');
      body.push(button(t("ui.garden.harvest"), "garden-harvest", 'data-plot-index="' + index + '"' + (state.inBattle ? " disabled" : ""), "button-accent"));
      body.push("  </div>");
    }
  }

  var stageClass = "garden-plot-stage-" + stage;
  if (isPlantingTarget) {
    stageClass += " is-planting-target";
  }

  return '<div class="garden-plot ' + stageClass + '" data-plot-index="' + index + '">' + body.join("") + "</div>";
}

function renderPlotsPanel() {
  var plotsHtml = Array.from({ length: 3 }, function (_, i) {
    return renderPlot(i);
  }).join("");

  return [
    '<section class="panel garden-plots-panel">',
    '  <h2 class="garden-plots-title">' + escapeHtml(t("ui.garden.plotsTitle")) + '</h2>',
    '  <div class="garden-plots-grid" data-garden-plots>',
    plotsHtml,
    "  </div>",
    "</section>"
  ].join("");
}

function renderDailyBerryPanel() {
  var dailyBerry = state.garden.dailyBerry || {};
  var rewardItem = dailyBerry.rewardItemIndex ? getItemByIndex(dailyBerry.rewardItemIndex) : null;
  var content;

  if (rewardItem) {
    var rewardName = itemDisplayName(rewardItem);
    content = [
      '<span class="garden-daily-label">' + escapeHtml(t("ui.garden.obtained")) + '</span>',
      renderImage(getItemDisplayImage(rewardItem), rewardName, "garden-daily-reward-image"),
      '<span class="garden-daily-label">' + escapeHtml(rewardName) + "</span>"
    ].join("");
  } else if (dailyBerry.claimedToday) {
    content = '<span class="garden-daily-label">' + escapeHtml(t("ui.garden.alreadyClaimed")) + '</span>';
  } else if (dailyBerry.loading) {
    content = '<span class="garden-daily-label">' + escapeHtml(t("ui.garden.checkingReward")) + '</span>';
  } else {
    content = [
      '    <span class="garden-daily-label">' + escapeHtml(t("ui.garden.dailyGift")) + '</span>',
      button(t("ui.garden.claim"), "garden-daily-berry-claim", (state.inBattle || dailyBerry.claiming ? "disabled" : ""), "button-accent")
    ].join("");
  }

  return [
    '<section class="panel garden-daily-panel">',
    '  <div class="garden-daily-row">',
    content,
    "  </div>",
    "</section>"
  ].join("");
}

export function renderGardenScene() {
  var content = [
    '<section class="garden-layout">',
    renderScenePresentationPanel("garden", "garden-info-panel"),
    renderDailyBerryPanel(),
    renderPlotsPanel(),
    renderBerryCatalog(),
    "</section>"
  ].join("");

  return sceneShell(t("ui.garden.sceneTitle"), "", content, "", "scene-content-garden", "parent-back");
}
