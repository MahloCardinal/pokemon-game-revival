import { GDR_DATA } from "../data/index.js";
import * as Engine from "../engine/index.js";
import { resolveInventoryItems, itemDisplayDescription, ItemCategory } from "../data/items.js";
import { trainerSpriteByIndex } from "../data/trainers.js";
import { state } from "../client/game-state.js";
import { assetPath, escapeHtml, getItemDisplayImage, getItemImage, getPokemonStaticImage, getTrainerImage, renderImage, withPokemonSpriteAttrs, withPokemonSpriteClass, withTrainerSpriteAttrs, withTrainerSpriteClass } from "../client/asset-helpers.js";
import { battlePointsMarkup, button, moneyMarkup, renderSummary, sceneShell } from "../client/render-utils.js";
import { renderPokemonCard, renderPokemonCardFrame } from "../client/pokemon-card.js";
import { renderDebugPokemonCreator, renderDebugTrainerBadgeControls, renderDebugTrainerBattlePointControls, renderDebugTrainerMoneyControls } from "../client/debug-tools.js";

var GEN_FILTERS = [
  { gen: 0, label: "Tutti" },
  { gen: 1, label: "1° Generazione" },
  { gen: 2, label: "2° Generazione" },
  { gen: 3, label: "3° Generazione" }
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
    var image = renderImage(getPokemonStaticImage(source), isCaught ? species.name : "", withPokemonSpriteClass("", source), withPokemonSpriteAttrs(source, imageAttrs));
    var dexNumberLabel = "#" + String(dexNumber).padStart(2, "0");
    var dexMeta = '<strong>' + (isCaught
      ? renderImage(assetPath("img_miscellaneous", "ball_icon.webp"), "Catturato", "", 'decoding="async" fetchpriority="low"')
      : "") + "<span>" + escapeHtml(dexNumberLabel) + "</span></strong>";
    var name = "<em>" + (isCaught ? escapeHtml(species.name) : '<span class="trainer-pokedex-name-placeholder" aria-hidden="true">Pokemon</span>') + "</em>";
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

var KANTO_BADGES = [
  { name: "Medaglia Sasso", image: "medaglia_sasso.webp" },
  { name: "Medaglia Cascata", image: "medaglia_cascata.webp" },
  { name: "Medaglia Tuono", image: "medaglia_tuono.webp" },
  { name: "Medaglia Arcobaleno", image: "medaglia_arcobaleno.webp" },
  { name: "Medaglia Anima", image: "medaglia_anima.webp" },
  { name: "Medaglia Palude", image: "medaglia_palude.webp" },
  { name: "Medaglia Vulcano", image: "medaglia_vulcano.webp" },
  { name: "Medaglia Terra", image: "medaglia_terra.webp" }
];

export function renderTeamScene() {
  var pokedexGenFilter = selectedPokedexGenFilter();
  var trainerInfo = state.trainerInfo;
  var trainerSprite = trainerSpriteByIndex(trainerInfo[0]);
  var pokedollars = Number(trainerInfo[1]) || 0;
  var battlePoints = Number(trainerInfo[3]) || 0;
  var badges = Math.max(0, Math.min(KANTO_BADGES.length, Math.floor(Number(trainerInfo[2]) || 0)));
  var trainerName = state.playerName || state.auth.userLabel || "Allenatore";
  var badgeImages = KANTO_BADGES.map(function (badge, index) {
    var badgeClass = "trainer-badge-image" + (index < badges ? "" : " trainer-badge-image-locked");
    return renderImage(assetPath("img_miscellaneous", badge.image), badge.name, badgeClass);
  }).join("");
  var trainerProfile = [
    '<section class="team-description-panel trainer-profile-panel">',
    '  <div class="trainer-profile-media">',
    renderImage(getTrainerImage(trainerSprite), "Allenatore", withTrainerSpriteClass("trainer-profile-image", trainerSprite), withTrainerSpriteAttrs(trainerSprite, 'loading="eager" decoding="async"')),
    "  </div>",
    '  <div class="trainer-profile-content">',
    '    <h2 class="trainer-profile-name">' + escapeHtml(trainerName) + "</h2>",
    '    <p class="trainer-profile-battle-points"><span class="trainer-battle-points-value">' + battlePointsMarkup(battlePoints) + "</span>" + renderDebugTrainerBattlePointControls() + "</p>",
    '    <p class="trainer-profile-money"><span class="trainer-money-value">' + moneyMarkup(pokedollars) + "</span>" + renderDebugTrainerMoneyControls() + "</p>",
    '    <div class="trainer-profile-badges">',
    '      <div class="trainer-badge-summary">',
    '        <span>Medaglie Kanto: ' + escapeHtml(badges) + "/" + escapeHtml(KANTO_BADGES.length) + "</span>",
    '        <span class="trainer-badge-debug-controls">' + renderDebugTrainerBadgeControls() + "</span>",
    "      </div>",
    '      <div class="trainer-badge-images">' + badgeImages + "</div>",
    "    </div>",
    "  </div>",
    "</section>"
  ].join("");
  var teamCount = Math.min(3, state.team.length);
  var selectedMoveIndex = state.scene && state.scene.teamMoveIndex !== null && state.scene.teamMoveIndex !== undefined ? Number(state.scene.teamMoveIndex) : NaN;
  var hasMoveSelection = Number.isInteger(selectedMoveIndex) && selectedMoveIndex >= 0 && selectedMoveIndex < state.team.length;
  var teamSection = state.team.length
    ? '<section class="pokemon-grid team-pokemon-grid team-pokemon-count-' + escapeHtml(teamCount) + '">' + state.team.map(function (pokemon, index) {
      var moveAction;
      var cardClass = hasMoveSelection && selectedMoveIndex === index ? "is-team-move-selected" : "";
      if (hasMoveSelection && selectedMoveIndex === index) {
        moveAction = button("Annulla", "team-move-cancel", 'data-index="' + index + '"' + (state.inBattle ? " disabled" : ""), "button-dark team-move-button");
      } else if (hasMoveSelection) {
        moveAction = button("Sposta qui", "team-move-place", 'data-index="' + index + '"' + (state.inBattle ? " disabled" : ""), "button-accent team-move-button");
      } else {
        moveAction = button("Sposta", "team-move-start", 'data-index="' + index + '"' + (state.inBattle ? " disabled" : ""), "button-dark team-move-button");
      }
      var actions = button("Deposita nel Box", "team-to-box", 'data-index="' + index + '"' + (state.inBattle ? " disabled" : ""), "button-primary team-to-box-button") + moveAction;
      return renderPokemonCardFrame(renderPokemonCard(pokemon, { className: cardClass }), { actions: actions });
    }).join("") + "</section>"
    : '<section class="pokemon-grid team-pokemon-grid team-pokemon-count-1"><div class="empty-state">La squadra e\' vuota.</div></section>';

  function getInventorySectionKey(item) {
    var category = item.category || "";
    if (category === ItemCategory.Ball) { return "balls"; }
    if (category === ItemCategory.Mt) { return "mt"; }
    if (category === ItemCategory.Vitamin) { return "tools"; }
    if (category === ItemCategory.HeldItem) { return "held"; }
    if (category === ItemCategory.Berry) { return "berries"; }
    if (category === ItemCategory.BattleItem) { return "battle"; }
    return "tools";
  }

  function renderInventoryItem(item) {
    var imageSrc = getItemDisplayImage(item);
    var itemImageClass = item.category === ItemCategory.Mt ? "style-zaino-item-image style-zaino-item-image-mt" : "style-zaino-item-image";
    var imageMarkup = imageSrc
      ? renderImage(imageSrc, item.name, itemImageClass)
      : '<span class="style-zaino-item-image style-zaino-item-image-empty"></span>';
    var availabilityMarkup = item.category === ItemCategory.Mt ? "" : '<div class="style-zaino-item-availability"><span class="style-zaino-item-quantity">x' + escapeHtml(item.quantity) + "</span></div>";

    return [
      '<article class="style-zaino-item-card">',
      '  <div class="style-zaino-item-media">',
      imageMarkup,
      availabilityMarkup,
      "  </div>",
      '  <div class="style-zaino-item-copy">',
      '    <div class="style-zaino-item-heading"><h3 class="style-zaino-item-name">' + escapeHtml(item.name) + "</h3></div>",
      '    <p class="style-zaino-item-description">' + escapeHtml(itemDisplayDescription(item)) + "</p>",
      "  </div>",
      "</article>"
    ].join("");
  }

  function renderInventorySection(section, inventoryItems) {
    var sectionItems = inventoryItems.filter(function (item) {
      return getInventorySectionKey(item) === section.key;
    });
    if (!sectionItems.length) return "";
    var sectionContent = sectionItems.map(renderInventoryItem).join("");

    return [
      '<section class="style-zaino-pocket">',
      '  <h3 class="style-zaino-pocket-title">' + escapeHtml(section.title) + "</h3>",
      '  <div class="style-zaino-pocket-scroll">',
      '    <div class="style-zaino-item-grid">' + sectionContent + "</div>",
      "  </div>",
      "</section>"
    ].join("");
  }

  var inventorySections = [
    { key: "tools", title: "Strumenti" },
    { key: "held", title: "Strumenti assegnabili" },
    { key: "battle", title: "Strumenti battaglia" },
    { key: "balls", title: "Poké Ball" },
    { key: "mt", title: "MT" },
    { key: "berries", title: "Bacche" }
  ];
  var inventoryItems = resolveInventoryItems(state.inventory);

  var debugPokemonCreator = renderDebugPokemonCreator();
  var zainoContent = '<section class="trainer-inventory-panel style-zaino-panel"><div class="trainer-inventory-stack style-zaino-stack">' +
    inventorySections.map(function (section) {
      return renderInventorySection(section, inventoryItems);
    }).join("") +
    '</div></section>';
  var gridResult = renderPokedexGrid();
  var filterButtons = GEN_FILTERS.map(function (f) {
    var activeClass = f.gen === pokedexGenFilter ? ' active' : '';
    return button(f.label, "pokedex-set-filter", 'data-gen="' + f.gen + '"', "button-ghost button-slim pokedex-filter-btn" + activeClass);
  }).join('');
  var pokedexContent = '<section class="team-description-panel trainer-pokedex-panel">' +
    '<div class="trainer-pokedex-heading">' +
    '<h2 class="stack-title trainer-pokedex-title">Pok&eacute;dex <span class="trainer-pokedex-count">' + escapeHtml(pokedexCountLabel(gridResult.counts, pokedexGenFilter)) + "</span></h2>" +
    '</div>' +
    '<div class="trainer-pokedex-filters">' + filterButtons + '</div>' +
    '<div id="trainer-pokedex-grid-wrapper" data-filter="' + escapeHtml(pokedexGenFilter) + '" data-count-all="' + escapeHtml(pokedexCountLabel(gridResult.counts, 0)) + '" data-count-gen-1="' + escapeHtml(pokedexCountLabel(gridResult.counts, 1)) + '" data-count-gen-2="' + escapeHtml(pokedexCountLabel(gridResult.counts, 2)) + '" data-count-gen-3="' + escapeHtml(pokedexCountLabel(gridResult.counts, 3)) + '">' + gridResult.html + '</div>' +
    "</section>";

  return sceneShell(
    "Scheda allenatore",
    "",
    '<div class="team-scene-stack">' + trainerProfile + teamSection + debugPokemonCreator + zainoContent + pokedexContent + "</div>",
    "",
    "scene-content-team",
    "parent-back"
  );
}
