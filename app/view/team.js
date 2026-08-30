import { GDR_DATA } from "../data/index.js";
import * as Engine from "../engine/index.js";
import { resolveInventoryItems, ItemCategory } from "../data/items.js";
import { isSingleCopyInventoryItem } from "./inventory-helpers.js";
import { trainerSpriteByIndex } from "../data/trainers.js";
import { state } from "../client/game-state.js";
import { assetPath, escapeHtml, getItemDisplayImage, getItemImage, getPokemonStaticImage, getTrainerImage, renderImage, withPokemonSpriteAttrs, withPokemonSpriteClass, withTrainerSpriteAttrs, withTrainerSpriteClass } from "../client/asset-helpers.js";
import { battlePointsMarkup, button, moneyMarkup, renderSummary, sceneShell } from "../client/render-utils.js";
import { renderPokemonCard, renderPokemonCardFrame } from "../client/pokemon-card.js";
import { renderDebugPokemonCreator, renderDebugTrainerBadgeControls, renderDebugTrainerBattlePointControls, renderDebugTrainerMoneyControls, renderDebugTrainerTitleControls } from "../client/debug-tools.js";
import { KANTO_GYM_BADGES } from "../data/gyms.js";
import { TRAINER_TITLES } from "../data/titles.js";
import { itemDisplayDescription, itemDisplayName, speciesDisplayName } from "../client/entity-text.js";
import { t } from "../client/i18n.js";

var GEN_FILTERS = [
  { gen: 0, key: "national" },
  { gen: 1, key: "gen1" },
  { gen: 2, key: "gen2" },
  { gen: 3, key: "gen3" }
];

function selectedPokedexGenFilter() {
  var filter = Number(state.scene && state.scene.pokedexGenFilter);
  return filter >= 0 && filter <= 3 ? filter : 0;
}

function emptyPokedexCounts() {
  return {
    0: { caught: 0, total: 0 },
    1: { caught: 0, total: 0 },
    2: { caught: 0, total: 0 },
    3: { caught: 0, total: 0 }
  };
}

function pokedexCountLabel(counts, filterGen) {
  var count = counts[filterGen] || counts[0];
  return count.caught + "/" + count.total;
}

function renderTrainerTitlesPanel() {
  var titleStateByKey = new Map((state.trainerTitles || []).map(function (entry) {
    return [String(entry && entry.titleKey || ""), entry];
  }));
  var unlockedTitles = TRAINER_TITLES.filter(function (title) {
    return titleStateByKey.has(title.key);
  }).sort(function (left, right) {
    var leftPreferred = Boolean(titleStateByKey.get(left.key) && titleStateByKey.get(left.key).isPreferred);
    var rightPreferred = Boolean(titleStateByKey.get(right.key) && titleStateByKey.get(right.key).isPreferred);
    if (leftPreferred !== rightPreferred) return leftPreferred ? -1 : 1;
    return left.sortOrder - right.sortOrder;
  });
  var titleList = '<ul class="trainer-title-list">' + unlockedTitles.map(function (title) {
    var preferred = Boolean(titleStateByKey.get(title.key) && titleStateByKey.get(title.key).isPreferred);
    return '<li><button type="button" class="trainer-title-button' + (preferred ? " is-preferred" : "")
      + '" data-action="trainer-title-select" data-title-key="' + escapeHtml(title.key)
      + '" aria-pressed="' + (preferred ? "true" : "false") + '"' + (preferred ? " disabled" : "") + ">"
      + '<span>' + escapeHtml(t("ui.team.trainerTitles.entries." + title.key + ".name")) + "</span>"
      + (preferred ? '<span class="trainer-title-preferred">(' + escapeHtml(t("ui.team.trainerTitles.preferred")) + ")</span>" : "")
      + "</button></li>";
  }).join("") + "</ul>";
  return [
    '<aside class="trainer-titles-panel">',
    '  <div class="trainer-titles-heading">',
    '    <h3>' + escapeHtml(t("ui.team.trainerTitles.panelTitle")) + "</h3>",
    '    <button type="button" class="trainer-titles-info-button" data-action="trainer-titles-info" aria-label="' + escapeHtml(t("ui.team.trainerTitles.infoTooltip")) + '" title="' + escapeHtml(t("ui.team.trainerTitles.infoTooltip")) + '">?</button>',
    "  </div>",
    '  <div class="trainer-titles-list-wrap">' + titleList + "</div>",
    '  <div class="trainer-titles-debug-controls">' + renderDebugTrainerTitleControls() + "</div>",
    "</aside>"
  ].join("");
}

function renderPokedexGrid() {
  var caughtDexNumbers = state.playerDex || [];
  var speciesLibrary = GDR_DATA.speciesLibrary || {};
  var caughtDexLookup = {};
  var counts = emptyPokedexCounts();
  caughtDexNumbers.forEach(function (dexNumber) {
    caughtDexLookup[String(dexNumber)] = true;
  });
  var pokedexSpecies = Object.keys(speciesLibrary).map(function (speciesKey) {
    var entry = speciesLibrary[speciesKey];
    return {
      speciesKey: speciesKey,
      name: entry.name || speciesKey,
      dexNumber: entry.dexNumber,
      gender: entry.gender || []
    };
  }).sort(function (left, right) {
    return Number(left.dexNumber) - Number(right.dexNumber);
  });
  var gridHtml = '<div class="trainer-pokedex-grid">' + pokedexSpecies.map(function (species) {
    var dexNumber = Number(species.dexNumber);
    var isCaught = Boolean(caughtDexLookup[String(dexNumber)]);
    var generation = Engine.generationForDexNumber(dexNumber);
    var source = {
      speciesKey: species.speciesKey,
      name: species.name,
      gender: species.gender
    };
    counts[0].total += 1;
    if (isCaught) counts[0].caught += 1;
    if (counts[generation]) {
      counts[generation].total += 1;
      if (isCaught) counts[generation].caught += 1;
    }
    var imageAttrs = 'decoding="async" fetchpriority="low"' + (isCaught ? "" : ' aria-hidden="true"');
    var speciesName = speciesDisplayName(species.speciesKey);
    var image = renderImage(getPokemonStaticImage(source), isCaught ? speciesName : "", withPokemonSpriteClass("", source), withPokemonSpriteAttrs(source, imageAttrs));
    var dexNumberLabel = "#" + String(dexNumber).padStart(2, "0");
    var dexMeta = '<strong>' + (isCaught
      ? renderImage(assetPath("img_miscellaneous", "ball_icon.webp"), t("ui.team.caught"), "", 'decoding="async" fetchpriority="low"')
      : "") + "<span>" + escapeHtml(dexNumberLabel) + "</span></strong>";
    var name = "<em>" + (isCaught ? escapeHtml(speciesName) : '<span class="trainer-pokedex-name-placeholder" aria-hidden="true">' + escapeHtml(t("ui.team.unknownPokemon")) + "</span>") + "</em>";
    return [
      '<article class="trainer-pokedex-entry" data-caught="' + (isCaught ? "1" : "0") + '" data-gen="' + escapeHtml(generation) + '">',
      dexMeta,
      "<span>" + image + "</span>",
      name,
      "</article>"
    ].join("");
  }).join("") + "</div>";
  return { html: gridHtml, counts: counts };
}

export function renderTeamScene() {
  var pokedexGenFilter = selectedPokedexGenFilter();
  var trainerInfo = state.trainerInfo;
  var trainerSprite = trainerSpriteByIndex(trainerInfo[0]);
  var pokedollars = Number(trainerInfo[1]) || 0;
  var battlePoints = Number(trainerInfo[3]) || 0;
  var badges = Math.max(0, Math.min(KANTO_GYM_BADGES.length, Math.floor(Number(trainerInfo[2]) || 0)));
  var trainerName = state.playerName || state.auth.userLabel || t("ui.team.defaultTrainer");
  var badgeImages = KANTO_GYM_BADGES.map(function (badge, index) {
    var badgeClass = "trainer-badge-image" + (index < badges ? "" : " trainer-badge-image-locked");
    return renderImage(assetPath("img_miscellaneous", badge.image), t("ui.gyms.badges." + badge.key), badgeClass);
  }).join("");
  var trainerProfile = [
    '<section class="team-description-panel trainer-profile-panel" data-render-region="trainer-profile">',
    '  <div class="trainer-profile-media">',
    renderImage(getTrainerImage(trainerSprite), t("ui.team.trainerAlt"), withTrainerSpriteClass("trainer-profile-image", trainerSprite), withTrainerSpriteAttrs(trainerSprite, 'loading="eager" decoding="async"')),
    "  </div>",
    '  <div class="trainer-profile-content">',
    '    <h2 class="trainer-profile-name">' + escapeHtml(trainerName) + "</h2>",
    '    <p class="trainer-profile-battle-points"><span class="trainer-battle-points-value">' + battlePointsMarkup(battlePoints) + "</span>" + renderDebugTrainerBattlePointControls() + "</p>",
    '    <p class="trainer-profile-money"><span class="trainer-money-value">' + moneyMarkup(pokedollars) + "</span>" + renderDebugTrainerMoneyControls() + "</p>",
    '    <div class="trainer-profile-badges">',
    '      <div class="trainer-badge-summary">',
    '        <span>' + escapeHtml(t("ui.team.kantoBadges", { count: badges, total: KANTO_GYM_BADGES.length })) + "</span>",
    '        <span class="trainer-badge-debug-controls">' + renderDebugTrainerBadgeControls() + "</span>",
    "      </div>",
    '      <div class="trainer-badge-images">' + badgeImages + "</div>",
    "    </div>",
    "  </div>",
    renderTrainerTitlesPanel(),
    "</section>"
  ].join("");
  var teamCount = Math.min(3, state.team.length);
  var selectedMoveIndex = state.scene && state.scene.teamMoveIndex !== null && state.scene.teamMoveIndex !== undefined ? Number(state.scene.teamMoveIndex) : NaN;
  var hasMoveSelection = Number.isInteger(selectedMoveIndex) && selectedMoveIndex >= 0 && selectedMoveIndex < state.team.length;
  var teamSection = state.team.length
    ? '<section class="pokemon-grid team-pokemon-grid team-pokemon-count-' + escapeHtml(teamCount) + '" data-render-region="trainer-team">' + state.team.map(function (pokemon, index) {
      var moveAction;
      var cardClass = hasMoveSelection && selectedMoveIndex === index ? "is-team-move-selected" : "";
      if (hasMoveSelection && selectedMoveIndex === index) {
        moveAction = button(t("ui.team.cancelMove"), "team-move-cancel", 'data-index="' + index + '"' + (state.inBattle ? " disabled" : ""), "button-dark team-move-button");
      } else if (hasMoveSelection) {
        moveAction = button(t("ui.team.moveHere"), "team-move-place", 'data-index="' + index + '"' + (state.inBattle ? " disabled" : ""), "button-accent team-move-button");
      } else {
        moveAction = button(t("ui.team.move"), "team-move-start", 'data-index="' + index + '"' + (state.inBattle ? " disabled" : ""), "button-dark team-move-button");
      }
      var actions = button(t("ui.team.deposit"), "team-to-box", 'data-index="' + index + '"' + (state.inBattle ? " disabled" : ""), "button-primary team-to-box-button") + moveAction;
      return renderPokemonCardFrame(renderPokemonCard(pokemon, { className: cardClass }), { actions: actions });
    }).join("") + "</section>"
    : '<section class="pokemon-grid team-pokemon-grid team-pokemon-count-1" data-render-region="trainer-team"><div class="empty-state">' + escapeHtml(t("ui.team.emptyTeam")) + "</div></section>";

  function getInventorySectionKey(item) {
    var category = item.category || "";
    if (category === ItemCategory.Ball) { return "balls"; }
    if (category === ItemCategory.TM) { return "mt"; }
    if (category === ItemCategory.Vitamin) { return "tools"; }
    if (category === ItemCategory.HeldItem) { return "held"; }
    if (category === ItemCategory.Berry) { return "berries"; }
    if (category === ItemCategory.BattleItem) { return "battle"; }
    return "tools";
  }

  function renderInventoryItem(item) {
    var itemName = itemDisplayName(item);
    var imageSrc = getItemDisplayImage(item);
    var itemImageClass = item.category === ItemCategory.TM ? "trainer-zaino-item-image trainer-zaino-item-image-mt" : "trainer-zaino-item-image";
    var imageMarkup = imageSrc
      ? renderImage(imageSrc, itemName, itemImageClass)
      : '<span class="trainer-zaino-item-image trainer-zaino-item-image-empty"></span>';
    var availabilityMarkup = isSingleCopyInventoryItem(item) ? "" : '<div class="trainer-zaino-item-availability"><span class="trainer-zaino-item-quantity">x' + escapeHtml(item.quantity) + "</span></div>";

    return [
      '<article class="trainer-zaino-item-card">',
      '  <div class="trainer-zaino-item-media">',
      imageMarkup,
      availabilityMarkup,
      "  </div>",
      '  <div class="trainer-zaino-item-copy">',
      '    <div class="trainer-zaino-item-heading"><h3 class="trainer-zaino-item-name">' + escapeHtml(itemName) + "</h3></div>",
      '    <p class="trainer-zaino-item-description">' + escapeHtml(itemDisplayDescription(item)) + "</p>",
      "  </div>",
      "</article>"
    ].join("");
  }

  function renderInventorySection(section, inventoryItems) {
    var sectionItems = inventoryItems.filter(function (item) {
      return getInventorySectionKey(item) === section.key;
    });
    var sectionContent = sectionItems.length
      ? sectionItems.map(renderInventoryItem).join("")
      : '<p class="trainer-zaino-empty">' + escapeHtml(t("common.emptyPocket")) + "</p>";

    return [
      '<section class="trainer-zaino-pocket">',
      '  <h3 class="trainer-zaino-pocket-title">' + escapeHtml(section.title) + "</h3>",
      '  <div class="trainer-zaino-pocket-scroll">',
      '    <div class="trainer-zaino-item-grid">' + sectionContent + "</div>",
      "  </div>",
      "</section>"
    ].join("");
  }

  var inventorySections = ["tools", "held", "battle", "balls", "mt", "berries"].map(function (key) {
    return { key: key, title: t("ui.team.inventorySections." + key) };
  });
  var inventoryItems = resolveInventoryItems(state.inventory);

  var debugPokemonCreator = renderDebugPokemonCreator();
  var zainoContent = '<section class="trainer-inventory-panel trainer-zaino-panel" data-render-region="trainer-inventory"><div class="trainer-inventory-stack trainer-zaino-stack">' +
    inventorySections.map(function (section) {
      return renderInventorySection(section, inventoryItems);
    }).join("") +
    '</div></section>';
  var gridResult = renderPokedexGrid();
  var filterButtons = GEN_FILTERS.map(function (f) {
    var activeClass = f.gen === pokedexGenFilter ? ' active' : '';
    return button(t("ui.team.generations." + f.key), "pokedex-set-filter", 'data-gen="' + f.gen + '"', "button-ghost button-slim pokedex-filter-btn" + activeClass);
  }).join('');
  var pokedexContent = '<section class="team-description-panel trainer-pokedex-panel" data-render-region="trainer-pokedex">' +
    '<div class="trainer-pokedex-heading">' +
    '<h2 class="stack-title trainer-pokedex-title">Pok&eacute;dex <span class="trainer-pokedex-count">' + escapeHtml(pokedexCountLabel(gridResult.counts, pokedexGenFilter)) + "</span></h2>" +
    '</div>' +
    '<div class="trainer-pokedex-filters">' + filterButtons + '</div>' +
    '<div id="trainer-pokedex-grid-wrapper" data-filter="' + escapeHtml(pokedexGenFilter) + '" data-count-all="' + escapeHtml(pokedexCountLabel(gridResult.counts, 0)) + '" data-count-gen-1="' + escapeHtml(pokedexCountLabel(gridResult.counts, 1)) + '" data-count-gen-2="' + escapeHtml(pokedexCountLabel(gridResult.counts, 2)) + '" data-count-gen-3="' + escapeHtml(pokedexCountLabel(gridResult.counts, 3)) + '">' + gridResult.html + '</div>' +
    "</section>";

  return sceneShell(
    t("ui.team.sceneTitle"),
    "",
    '<div class="team-scene-stack">' + trainerProfile + teamSection + debugPokemonCreator + zainoContent + pokedexContent + "</div>",
    "",
    "scene-content-team",
    "parent-back"
  );
}
