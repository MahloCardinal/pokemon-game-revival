import { GDR_DATA as DATA, maxHpForLevel, maxPowerForLevel, maxStatsForLevel } from "../data/index.js";
import { BADGE_LEVEL_LIMITS, CAPTURE_LEVEL_LIMITS } from "../data/progression.js";
import { assetPath, escapeHtml, getItemImage, getPokemonStaticImage, getTypeImage, renderImage } from "../client/asset-helpers.js";
import { button, sceneShell } from "../client/render-utils.js";
import { itemDisplayName, moveCatalogDescription, moveDisplayName, speciesDisplayName, typeDisplayName } from "../client/entity-text.js";
import { t, tList } from "../client/i18n.js";

var RULES_SECTION_KEYS = Object.freeze(["about", "gdr", "battle", "moves", "evolutions"]);
var EXTRA_LEARNABLE_MOVES = Object.freeze([
  { speciesKey: "103", moveKey: "zap_cannon" }, { speciesKey: "144", moveKey: "zap_cannon" },
  { speciesKey: "146", moveKey: "zap_cannon" }, { speciesKey: "189", moveKey: "dynamic_punch" },
  { speciesKey: "212", moveKey: "guillotine" }, { speciesKey: "215", moveKey: "sheer_cold" },
  { speciesKey: "219", moveKey: "zap_cannon" }, { speciesKey: "227", moveKey: "zap_cannon" },
  { speciesKey: "230", moveKey: "sheer_cold" }, { speciesKey: "230", moveKey: "knock_off" },
  { speciesKey: "244", moveKey: "zap_cannon" }, { speciesKey: "245", moveKey: "zap_cannon" },
  { speciesKey: "251", moveKey: "zap_cannon" }, { speciesKey: "279", moveKey: "zap_cannon" },
  { speciesKey: "301", moveKey: "zap_cannon" }, { speciesKey: "310", moveKey: "zap_cannon" },
  { speciesKey: "311", moveKey: "zap_cannon" }, { speciesKey: "312", moveKey: "zap_cannon" },
  { speciesKey: "330", moveKey: "zap_cannon" }, { speciesKey: "337", moveKey: "zap_cannon" },
  { speciesKey: "338", moveKey: "zap_cannon" }, { speciesKey: "342", moveKey: "pursuit" },
  { speciesKey: "344", moveKey: "zap_cannon" }, { speciesKey: "359", moveKey: "zap_cannon" },
  { speciesKey: "362", moveKey: "zap_cannon" }, { speciesKey: "376", moveKey: "calm_mind" },
  { speciesKey: "376", moveKey: "hypnosis" }, { speciesKey: "380", moveKey: "zap_cannon" },
  { speciesKey: "381", moveKey: "zap_cannon" }, { speciesKey: "382", moveKey: "zap_cannon" },
  { speciesKey: "384", moveKey: "zap_cannon" }
]);

export function rulesSectionByKey(key) {
  var sectionKey = RULES_SECTION_KEYS.indexOf(key) !== -1 ? key : RULES_SECTION_KEYS[0];
  return { key: sectionKey };
}

function renderEffectivenessImage() {
  return renderImage(assetPath("img_miscellaneous", "tabella_efficacia.webp"), t("ui.rules.effectivenessAlt"), "rules-effectiveness-image");
}

function renderRulesType(typeKey) {
  return renderImage(getTypeImage(typeKey), typeDisplayName(typeKey), "rules-type-inline");
}

function renderRulesPokemon(speciesKey) {
  var name = speciesDisplayName(speciesKey);
  return [
    '<span class="rules-entity rules-pokemon-entity">',
    renderImage(getPokemonStaticImage(speciesKey), name, "rules-pokemon-sprite"),
    '<span>' + escapeHtml(name) + "</span>",
    "</span>"
  ].join("");
}

function renderRulesItem(item) {
  var name = itemDisplayName(item);
  return [
    '<span class="rules-entity rules-item-entity">',
    item && item.image ? renderImage(getItemImage(item.image), name, "rules-item-image") : "",
    '<span>' + escapeHtml(name) + "</span>",
    "</span>"
  ].join("");
}

function evolutionRows() {
  return Object.keys(DATA.speciesLibrary).reduce(function (rows, speciesKey) {
    var entry = DATA.speciesLibrary[speciesKey];
    var evolutions = entry && entry.evolution && Array.isArray(entry.evolution.to) ? entry.evolution.to : [];
    evolutions.forEach(function (evolution) {
      if (evolution && evolution.trigger && evolution.trigger.kind === "item" && evolution.trigger.item && evolution.species) {
        rows.push({ from: speciesKey, item: evolution.trigger.item, to: evolution.species });
      }
    });
    return rows;
  }, []);
}

function renderEvolutionTable() {
  var header = '<div class="evo-header"><span>' + escapeHtml(t("ui.rules.evolutionHeaders.pokemon")) + '</span><span class="evo-cell-item">' + escapeHtml(t("ui.rules.evolutionHeaders.item")) + '</span><span>' + escapeHtml(t("ui.rules.evolutionHeaders.evolution")) + '</span></div>';
  var rows = evolutionRows().map(function (row) {
    return '<div class="evo-group"><div class="evo-cell">' + renderRulesPokemon(row.from) + '</div><div class="evo-cell evo-cell-item">' + renderRulesItem(row.item) + '</div><div class="evo-cell">' + renderRulesPokemon(row.to) + "</div></div>";
  }).join("");
  return '<div class="rules-data-table rules-evolution-table">' + header + rows + "</div>";
}

function renderMovesTable() {
  var rows = DATA.moveLibrary.map(function (move) {
    return '<div class="moves-group"><div class="moves-cell moves-cell-name"><strong>' + escapeHtml(moveDisplayName(move)) + '</strong></div><div class="moves-cell moves-cell-desc">' + escapeHtml(moveCatalogDescription(move)) + "</div></div>";
  }).join("");
  var header = '<div class="moves-header"><span>' + escapeHtml(t("ui.rules.moveHeaders.name")) + '</span><span>' + escapeHtml(t("ui.rules.moveHeaders.effect")) + '</span></div>';
  return '<div class="rules-data-table rules-moves-table">' + header + rows + "</div>";
}

function renderExtraLearnableMovesTable() {
  var rows = EXTRA_LEARNABLE_MOVES.map(function (row) {
    return '<div class="moves-group"><div class="moves-cell moves-cell-name">' + renderRulesPokemon(row.speciesKey) + '</div><div class="moves-cell moves-cell-desc"><strong>' + escapeHtml(moveDisplayName({ key: row.moveKey })) + "</strong></div></div>";
  }).join("");
  var header = '<div class="moves-header"><span>' + escapeHtml(t("ui.rules.evolutionHeaders.pokemon")) + '</span><span>' + escapeHtml(t("ui.rules.moveHeaders.learnable")) + '</span></div>';
  return '<div class="rules-data-table rules-moves-table rules-extra-moves-table">' + header + rows + "</div>";
}

function renderRulesTable(headers, rows) {
  return '<table class="rules-data-table"><thead><tr>' + headers.map(function (header) {
    return '<th>' + escapeHtml(header) + "</th>";
  }).join("") + "</tr></thead><tbody>" + rows.map(function (row) {
    return "<tr>" + row.map(function (cell) { return '<td>' + escapeHtml(cell) + "</td>"; }).join("") + "</tr>";
  }).join("") + "</tbody></table>";
}

function badgeLimitRows(limits, collapseTrailingEqual) {
  var rows = [];
  var end = limits.length - 1;
  var collapseStart = end;
  if (collapseTrailingEqual) {
    while (collapseStart > 0 && limits[collapseStart - 1] === limits[end]) collapseStart -= 1;
  }
  limits.forEach(function (limit, index) {
    if (collapseTrailingEqual && index > collapseStart) return;
    rows.push([index === collapseStart && collapseStart < end ? index + "+" : index, limit]);
  });
  return rows;
}

function renderCaptureLevelLimitTable() {
  return renderRulesTable([t("ui.rules.tableHeaders.badges"), t("ui.rules.tableHeaders.maxSearchLevel")], badgeLimitRows(CAPTURE_LEVEL_LIMITS, true));
}

function renderObedienceLevelLimitTable() {
  return renderRulesTable([t("ui.rules.tableHeaders.badges"), t("ui.rules.tableHeaders.maxObedienceLevel")], badgeLimitRows(BADGE_LEVEL_LIMITS, false));
}

function renderStatCapsTable() {
  return renderRulesTable([t("ui.rules.tableHeaders.level"), t("ui.rules.tableHeaders.hp"), t("ui.rules.tableHeaders.powerStats")], [5, 10, 20, 30, 40, 50, 60, 100].map(function (level) {
    return [level, maxHpForLevel(level), maxPowerForLevel(level) + " - " + maxStatsForLevel(level)];
  }));
}

function renderExperienceTable() {
  return renderRulesTable([t("ui.rules.tableHeaders.winnerLevel"), t("ui.rules.tableHeaders.experience")], [["5-30", "Lv x5"], ["31-60", "Lv x3"], ["61-99", "Lv x2"]]);
}

function renderMoveSearch() {
  return '<div class="rules-move-search"><input type="text" id="rules-move-input" class="rules-move-input" placeholder="' + escapeHtml(t("ui.rules.pokemonSearchPlaceholder")) + '" />' + button(t("ui.rules.openMoveList"), "rules-move-wiki") + '<span class="rules-move-copy-wrapper">' + button(t("ui.rules.copyMoveLink"), "rules-move-copy-link", 'id="rules-move-copy-btn"') + '<span class="rules-move-copy-tooltip">' + escapeHtml(t("ui.rules.copiedMoveLink")) + "</span></span></div>";
}

function h3Match(content) {
  return /^<h3>([\s\S]*?)<\/h3>$/.exec(String(content || ""));
}

function renderRulesSectionContent(sectionKey, contentItems) {
  var headings = [];
  var content = contentItems.map(function (item) {
    var match = h3Match(item);
    var id;
    if (!match) return item;
    id = "rules-heading-" + sectionKey + "-" + headings.length;
    headings.push({ id: id, label: match[1].replace(/<[^>]*>/g, "") });
    return '<h3 id="' + escapeHtml(id) + '">' + match[1] + "</h3>";
  }).join("");
  var nav = sectionKey !== "about" && sectionKey !== "evolutions" && headings.length
    ? '<div class="rules-heading-row">' + headings.map(function (heading) {
      return button(heading.label, "rules-heading-jump", 'data-heading-id="' + escapeHtml(heading.id) + '"', "rules-heading-button");
    }).join("") + "</div>"
    : "";
  return nav + content;
}

function rulesVariables() {
  return {
    captureTable: renderCaptureLevelLimitTable(), obedienceTable: renderObedienceLevelLimitTable(),
    effectivenessImage: renderEffectivenessImage(), experienceTable: renderExperienceTable(), statCapsTable: renderStatCapsTable(),
    evolutionTable: renderEvolutionTable(), moveSearch: renderMoveSearch(), moveTable: renderMovesTable(), extraMovesTable: renderExtraLearnableMovesTable(),
    typeFire: renderRulesType("fire"), typeGrass: renderRulesType("grass"), typeWater: renderRulesType("water"),
    typeElectric: renderRulesType("electric"), typeSteel: renderRulesType("steel"), typeFlying: renderRulesType("flying"),
    typeGround: renderRulesType("ground"), typeRock: renderRulesType("rock"), typeIce: renderRulesType("ice")
  };
}

function renderRulesArticle(section) {
  var content = tList("rulesContent." + section.key, rulesVariables());
  return '<article class="rules-article"><h2>' + escapeHtml(t("ui.rules.sections." + section.key)) + "</h2>" + renderRulesSectionContent(section.key, content) + "</article>";
}

export function renderRulesContent(sectionKey) {
  return renderRulesArticle(rulesSectionByKey(sectionKey));
}

function renderRulesSectionPanel(activeSectionKey) {
  var activeKey = rulesSectionByKey(activeSectionKey).key;
  var actions = RULES_SECTION_KEYS.map(function (sectionKey) {
    return button(t("ui.rules.sections." + sectionKey), "rules-section", 'data-section="' + escapeHtml(sectionKey) + '"', "button-slim" + (sectionKey === activeKey ? " button-primary" : " button-ghost"));
  }).join("");
  return '<section class="panel rules-sections-panel"><div class="panel-inner"><div class="rules-section-row section-tabs">' + actions + "</div></div></section>";
}

function renderRulesContentPanel(activeSectionKey) {
  return '<section class="rules-content-panel" data-rules-content data-scroll-key="rules-content">' + renderRulesContent(activeSectionKey) + '</section><button type="button" class="rules-top-button" data-action="rules-scroll-top">' + escapeHtml(t("ui.rules.backToTop")) + "</button>";
}

export function renderRulesScene(scene) {
  var activeSectionKey = rulesSectionByKey(scene && scene.rulesSection).key;
  var body = '<section class="rules-layout">' + renderRulesSectionPanel(activeSectionKey) + renderRulesContentPanel(activeSectionKey) + "</section>";
  return sceneShell(t("ui.rules.sceneTitle"), "", body, "", "scene-content-rules", "parent-back");
}
