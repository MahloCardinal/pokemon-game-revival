import * as Engine from "../engine/index.js";
import { state } from "../client/game-state.js";
import { ensureBattleBindings } from "../client/battle-scene-lock.js";
import { escapeHtml, getItemImage, getTrainerImage, renderImage } from "../client/asset-helpers.js";
import { button, hpMarkup, renderSummary, sceneShell } from "../client/render-utils.js";
import { renderPokemonCard, renderPokemonCardFrame } from "../client/pokemon-card.js";
import { resolveInventoryItems, isPlayerBattleInventoryItem, ItemCategory } from "../data/items.js";
import { isAdminRewardBattleType } from "../data/admin-battles.js";
import { itemDisplayDescription, itemDisplayName, moveDisplayDescription, moveDisplayName, pokemonDisplayName, typeDisplayName } from "../client/entity-text.js";
import { t } from "../client/i18n.js";
import { localizeBattleSummary, resolveBattleEvent } from "../client/battle-text.js";

var TEAM_MAX = Engine.TEAM_MAX;

function pokemonForBattleCard(combatant) {
  var struggleState = (combatant && combatant.moveStates || []).find(function (stateEntry) {
    return stateEntry.enabled && stateEntry.move && stateEntry.move.key === "struggle";
  });
  return struggleState
    ? Object.assign({}, combatant.pokemon, { moves: [struggleState.move] })
    : combatant.pokemon;
}

function renderMiniCombatant(combatant, isActive, options) {
  options = options || {};
  var className = "mini-card";
  var statusLabel = "";
  var actions = "";
  if (isActive) {
    className += " is-active";
    statusLabel = t("ui.battle.active");
  }
  if (combatant.isFainted()) {
    className += " is-ko";
    statusLabel = statusLabel ? statusLabel + " - KO" : "KO";
  }
  if (options.canSwitch && (!isActive || options.allowActiveSwitch) && !combatant.isFainted()) {
    actions = '<button type="button" class="button button-primary button-slim" data-action="' + escapeHtml(options.switchAction || "battle-switch") + '" data-index="' + escapeHtml(options.index) + '">' + escapeHtml(options.switchLabel || t("ui.battle.switch")) + '</button>';
  }
  var frameClassName = "battle-roster-entry";
  if (options.reserveFooter && !statusLabel && !actions) {
    frameClassName += " battle-roster-entry-footer-placeholder";
    statusLabel = t("ui.battle.active");
  }

  return renderPokemonCardFrame(renderPokemonCard(pokemonForBattleCard(combatant), {
    className: className,
    currentHp: combatant.hp
  }), {
    className: frameClassName,
    statusLabel: statusLabel,
    actions: actions
  });
}

function renderBattleSlot(combatant, title, showMoves, options) {
  options = options || {};
  var moveMarkup = "";
  var moveStates = combatant && combatant.moveStates || [];
  var visibleMoveStates = moveStates;
  var battleHpMarkup = combatant ? '<div class="pokemon-card-hp battle-active-hp" data-battle-hp-team="' + (options.ownTeam && combatant.team === options.ownTeam ? "own" : "enemy") + '" data-battle-hp-index="' + escapeHtml(combatant.team ? combatant.team.combatantList.indexOf(combatant) : 0) + '">' + hpMarkup(combatant.hp, combatant.pokemon.maxHp) + "</div>" : "";
  function renderSlot(cardMarkup) {
    return [
      '<div class="battle-field-slot">',
       '  <h2 class="stack-title battle-field-slot-label">' + escapeHtml(title) + "</h2>",
      cardMarkup,
      "</div>"
    ].join("");
  }
  if (!combatant) {
    return renderSlot([
      '<article class="pokemon-card pokemon-card-battle pokemon-card-battle-active battle-empty-slot">',
      '  <p class="battle-empty-slot-message">' + escapeHtml(options.placeholderText || t("ui.battle.waitingForAdminChoice")) + "</p>",
      options.overlayContent || "",
      "</article>"
    ].join(""));
  }
  if (moveStates.length) {
    if (moveStates.some(function (stateEntry) {
      return stateEntry.enabled && stateEntry.move && stateEntry.move.key === "struggle";
    })) {
      visibleMoveStates = moveStates.filter(function (stateEntry) {
        return stateEntry.move && stateEntry.move.key === "struggle";
      });
    }
    moveMarkup = visibleMoveStates.map(function (stateEntry) {
      var index = Number.isInteger(stateEntry.idx) ? stateEntry.idx : moveStates.indexOf(stateEntry);
      var description = moveDisplayDescription(stateEntry.move);
      var moveContent = '<span class="move-name">' + escapeHtml(moveDisplayName(stateEntry.move)) + (description ? ' <span class="move-effect">(' + escapeHtml(description) + ")</span>" : "") + "</span>";
      var weatherBlocked = options.manager && options.manager.isWeatherMoveBlocked(options.moveActor, stateEntry.move);
      var disabled = !stateEntry.enabled || weatherBlocked;

      if (!showMoves) {
        return '<button type="button" class="move-button battle-move-preview' + (disabled ? " is-disabled" : "") + '" disabled>' + moveContent + "</button>";
      }

      return '<button type="button" class="move-button ' + (disabled ? "is-disabled" : "") + '" data-action="' + escapeHtml(options.moveAction || "battle-move") + '" data-index="' + escapeHtml(index) + '" ' + (disabled ? "disabled" : "") + ">" + moveContent + "</button>";
    }).join("");
  }

  return renderSlot(renderPokemonCard(combatant.pokemon, {
    className: "pokemon-card-battle pokemon-card-battle-active is-active" + (showMoves ? " has-battle-actions" : " has-battle-previews") + (options.className ? " " + options.className : ""),
    currentHp: combatant.hp,
    extraContent: battleHpMarkup + (moveMarkup ? '<div class="pokemon-card-moves battle-card-moves">' + moveMarkup + "</div>" : ""),
    showMoves: false,
    overlayContent: options.overlayContent || ""
  }));
}

function renderBattleLog(logEntries, scene) {
  var groups = [];
  var currentGroup = null;

  function flushGroup() {
    if (currentGroup) {
      groups.push(currentGroup);
      currentGroup = null;
    }
  }

  logEntries.forEach(function (entry) {
    if (!entry || typeof entry.key !== "string") {
      return;
    }
    if (entry.divider || entry.key === "turn.divider") {
      flushGroup();
      groups.push({ divider: true });
      return;
    }
    if (entry.group === "turn" || entry.key === "turn.started") {
      if (!currentGroup || currentGroup.turn !== String(entry.turn || entry.params && entry.params.number || "")) {
        flushGroup();
        currentGroup = {
          turn: String(entry.turn || entry.params && entry.params.number || ""),
          title: t("ui.battle.turn", { number: entry.turn || entry.params && entry.params.number || "" }),
          lines: []
        };
      }
      currentGroup.lines.push({
        text: resolveBattleEvent(entry, scene),
        team: entry.key === "turn.started"
      });
      return;
    }
    if (!currentGroup) {
      currentGroup = {
        turn: "",
        title: "",
        lines: []
      };
    }
    currentGroup.lines.push({ text: resolveBattleEvent(entry, scene), team: false });
  });

  flushGroup();

  return groups.map(function (group) {
    if (group.divider) {
      return '<div class="log-line is-divider"></div>';
    }

    return [
      '<div class="log-line log-turn-group">',
      group.title ? '<p class="log-turn-title">' + escapeHtml(group.title) + "</p>" : "",
      group.lines.map(function (line) {
        var className = line.team ? "log-turn-entry log-turn-team" : "log-turn-entry";
        var content = escapeHtml(line.text);
        return '<p class="' + className + '">' + (line.team ? "<strong>" + content + "</strong>" : content) + "</p>";
      }).join(""),
      "</div>"
    ].join("");
  }).join("");
}

export function renderBattleScene(scene) {
  var renderScene = scene.finalBattleDisplayScene || scene;
  ensureBattleBindings(renderScene);

  var summaryLines = localizeBattleSummary(Engine.buildBattleSummary(renderScene.playerTeam, renderScene.enemyTeam, renderScene.manager.usedItems, renderScene.manager.enemyUsedItems, renderScene.manager), renderScene);
  var logLines = renderBattleLog(renderScene.manager.log, renderScene);
  var battleInfoPanel = scene.battleInfoPanel === "summary" ? "summary" : "log";
  var battleBottomPanel = scene.battleBottomPanel === "teams" ? "teams" : scene.battleBottomPanel === "items" ? "items" : "info";

  function renderForcedSwitchOverlay(team, switchAction) {
    var activeIndex = team.activeIndex;
    var availableCount = team.combatantList.filter(Boolean).length;
    var choices = Array.from({ length: TEAM_MAX }, function (_, index) {
      var combatant = team.combatantList[index];
      if (!combatant) {
        return '<button type="button" class="battle-context-choice-option battle-switch-choice is-empty" disabled></button>';
      }
      var isKo = combatant.isFainted();
      var disabled = isKo || index === activeIndex;
      var label = pokemonDisplayName(combatant.pokemon);
      return '<button type="button" class="battle-context-choice-option battle-switch-choice' + (isKo ? " is-ko" : "") + '" data-action="' + escapeHtml(switchAction || "battle-switch") + '" data-index="' + escapeHtml(index) + '" ' + (disabled ? "disabled" : "") + ">" + escapeHtml(label) + "</button>";
    }).join("");
    return [
      '<div class="battle-ko-switch-overlay">',
      '  <section class="battle-ko-switch-panel battle-context-choice-panel pokemon_choice-panel">',
      '    <h3>' + escapeHtml(t("ui.battle.chooseFieldPokemon")) + '</h3>',
      '    <div class="capture-starter-grid battle-switch-grid battle-switch-grid-count-' + Math.min(3, Math.max(1, availableCount)) + '">' + choices + "</div>",
      "  </section>",
      "</div>"
    ].join("");
  }

  function renderEntryChoiceOverlay(panel) {
    var itemName = itemDisplayName(panel.item);
    var pokemonName = pokemonDisplayName(panel.pokemon);
    var isMoveChoice = panel.kind === "move";
    var choices = (panel.entries || []).map(function (entry) {
      return '<button type="button" class="battle-context-choice-option" data-action="battle-entry-choice-pick" data-index="' + escapeHtml(entry.index) + '">' + escapeHtml(entry.name) + "</button>";
    }).join("");
    return [
      '<div class="battle-ko-switch-overlay battle-entry-choice-overlay">',
      '  <section class="battle-ko-switch-panel battle-context-choice-panel battle-entry-choice-panel">',
      '    <div class="battle-entry-choice-heading">',
      renderImage(getItemImage(panel.item && panel.item.image), itemName, "battle-entry-choice-item-image"),
      '      <div><span class="battle-entry-choice-eyebrow">' + escapeHtml(t("ui.battle.heldItemChoice")) + '</span><h3>' + escapeHtml(itemName) + "</h3></div>",
      "    </div>",
      '    <p class="battle-entry-choice-copy">' + escapeHtml(t(isMoveChoice
        ? "ui.battle.entryDisableMovePrompt" : "ui.battle.entryAddTypePrompt", { pokemon: pokemonName, item: itemName })) + "</p>",
      '    <p class="battle-entry-choice-subtitle">' + escapeHtml(t(isMoveChoice
        ? "ui.battle.chooseMoveToBlock" : "ui.battle.chooseSecondType")) + "</p>",
      '    <div class="battle-entry-choice-list">' + choices + "</div>",
      panel.canCancel
        ? '    <div class="battle-entry-choice-actions">' + button(t("ui.dialogs.cancel"), "battle-entry-choice-cancel", "", "button-dark button-slim") + "</div>"
        : '    <p class="battle-entry-choice-required">' + escapeHtml(t("ui.battle.entryChoiceRequired")) + "</p>",
      "  </section>",
      "</div>"
    ].join("");
  }

  var adminPerspective = Boolean(scene.adminBattle);
  var ownTeam = adminPerspective ? renderScene.enemyTeam : renderScene.playerTeam;
  var opponentTeam = adminPerspective ? renderScene.playerTeam : renderScene.enemyTeam;
  var playerNeedsSwitch = renderScene.manager.playerNeedsSwitch && !renderScene.manager.battleOver;
  var playerPostMoveSwitch = renderScene.manager.playerPostMoveSwitch && !renderScene.manager.battleOver;
  var adminNeedsSwitch = renderScene.manager.npcNeedsSwitch && !renderScene.manager.battleOver;
  var waitingForAdmin = renderScene.manager.adminControlled && renderScene.manager.waitingFor === "admin" && !renderScene.manager.battleOver;
  var pendingAdminEntryChoice = Boolean(scene.pendingAdminEntryChoice && waitingForAdmin);
  var adminEntryChoiceActive = scene.adminBattle && pendingAdminEntryChoice;
  var authoritativeAdminEntryChoice = scene.adminBattle && scene.authoritativeAdminEntryChoice;
  var playerActionLocked = playerNeedsSwitch || playerPostMoveSwitch || waitingForAdmin || scene.adminBattle
    || Boolean(scene.battleEntryChoicePanel)
    || scene.authoritativeCommandPending || scene.authoritativeCommandUncertain;
  var adminActionEnabled = scene.adminBattle && waitingForAdmin;
  var ownNeedsSwitch = adminPerspective ? adminNeedsSwitch : playerNeedsSwitch;
  var opponentNeedsSwitch = adminPerspective ? playerNeedsSwitch : adminNeedsSwitch;
  var ownSwitchAction = adminPerspective ? "admin-battle-switch" : "battle-switch";
  var ownMoveAction = adminPerspective ? "admin-battle-move" : "battle-move";
  var ownActionEnabled = adminPerspective ? adminActionEnabled && !adminNeedsSwitch && !adminEntryChoiceActive
    && !authoritativeAdminEntryChoice && !scene.authoritativeCommandPending : !renderScene.manager.battleOver && !playerActionLocked;
  var playerItemsReadonly = scene.adminBattle ? Boolean(scene.authoritativeCommandPending) : playerActionLocked;
  var battleType = renderScene.battleType || scene.battleType || "";
  var canFinalizeAdminReward = scene.adminBattle
    && !scene.authoritativeAdminBattle
    && renderScene.manager.battleOver
    && renderScene.enemyTeam.isAllFainted()
    && isAdminRewardBattleType(battleType)
    && !scene.rewardFinalized;
  var ownSlotOptions = ownNeedsSwitch ? {
    className: "has-fainted-overlay has-forced-switch",
    overlayContent: renderForcedSwitchOverlay(ownTeam, ownSwitchAction),
    moveAction: ownMoveAction
  } : scene.battleEntryChoicePanel && !adminPerspective ? {
    className: "has-fainted-overlay has-entry-choice-overlay",
    overlayContent: renderEntryChoiceOverlay(scene.battleEntryChoicePanel),
    moveAction: ownMoveAction
  } : { moveAction: ownMoveAction };
  var opponentSlotOptions = opponentNeedsSwitch ? { className: "has-fainted-overlay" } : {};
  var authoritativeRefresh = scene.authoritativeBattle && waitingForAdmin && !scene.adminBattle;
  var authoritativeUncertaintyMessage = scene.authoritativeCommandUncertain
    ? '<p class="battle-authoritative-uncertain-message">' + escapeHtml(resolveText(scene.authoritativeUncertaintyMessage, t("ui.battle.commandUncertain"))) + "</p>"
    : "";
  var battleInfoFooter = scene.authoritativeCommandUncertain
    ? '<div class="battle-info-actions">' + authoritativeUncertaintyMessage
      + button(t("ui.battle.retry"), "battle-authoritative-retry", scene.authoritativeCommandPending ? "disabled" : "", "button-accent button-slim")
      + button(t("ui.battle.cancelBattle"), "battle-authoritative-cancel", scene.authoritativeCommandPending ? "disabled" : "", "button-danger button-slim") + "</div>"
    : scene.authoritativeCommandPending
      ? '<div class="battle-info-actions" data-battle-abandon-inline>' + button(t("ui.battle.abandon"), "battle-abandon-open", "disabled", "button-danger button-slim") + "</div>"
    : authoritativeRefresh
    ? '<div class="battle-info-actions battle-abandon-actions" data-battle-abandon-inline>' + button(t("ui.battle.abandon"), "battle-abandon-open", "", "button-danger button-slim") + "</div>"
    : authoritativeAdminEntryChoice
      ? '<div class="battle-info-actions"><p class="battle-admin-thinking-log">' + escapeHtml(t("ui.battle.chooseHeldEffect")) + '</p>'
        + (authoritativeAdminEntryChoice.entries || []).map(function (entry) {
          var label = authoritativeAdminEntryChoice.kind === "type" ? typeDisplayName(entry.key || entry.typeName)
            : authoritativeAdminEntryChoice.kind === "move" ? moveDisplayName(entry) : entry.name;
          return button(label, "admin-battle-entry-choice", 'data-index="' + escapeHtml(entry.index) + '"', "button-ghost button-slim");
        }).join("") + "</div>"
    : canFinalizeAdminReward
    ? '<div class="battle-info-actions">' + button(t("ui.battle.registerRewards"), "admin-battle-finalize-reward", "", "button-accent button-slim") + "</div>"
    : scene.terminalExitReady
      ? '<div class="battle-info-actions">' + button(t("ui.battle.exit"), "battle-terminal-exit", "", "button-primary button-slim") + "</div>"
    : scene.adminBattle && scene.rewardFinalized
      ? '<div class="battle-info-actions"><p class="battle-admin-thinking-log">' + escapeHtml(t("ui.battle.rewardsRegistered")) + '</p></div>'
      : renderScene.manager.battleOver || scene.adminBattle || (playerActionLocked && !waitingForAdmin)
        ? ""
        : '<div class="battle-info-actions" data-battle-abandon-inline>' + button(t("ui.battle.abandon"), "battle-abandon-open", "", "button-danger button-slim") + "</div>";
  var waitingLogLine = "";
  if (waitingForAdmin && !scene.adminBattle) {
    waitingLogLine = '<div class="log-line battle-admin-thinking-log">' + escapeHtml(t(scene.pendingAdminEntryChoice ? "ui.battle.choosingFieldPokemon" : "ui.battle.thinking", { name: renderScene.enemyTeam.name || t("ui.battle.opponent") })) + "</div>";
  } else if (adminEntryChoiceActive) {
    waitingLogLine = '<div class="log-line battle-admin-thinking-log">' + escapeHtml(t("ui.battle.choosePokemon")) + '</div>';
  } else if (scene.adminBattle && renderScene.manager.waitingFor === "player" && !renderScene.manager.battleOver) {
    waitingLogLine = '<div class="log-line battle-admin-thinking-log">' + escapeHtml(t("ui.battle.thinking", { name: scene.playerUsername || t("ui.battle.playerArticle") })) + "</div>";
  }
  var infoCard = [
    '    <section class="panel battle-info-card" data-battle-info-card data-battle-panel-section="info"><div class="panel-inner stack battle-info-inner">',
    '      <div class="battle-info-tabs" role="tablist" aria-label="' + escapeHtml(t("ui.battle.infoAria")) + '">',
    button(t("ui.battle.log"), "battle-info-tab", 'data-panel="log" aria-selected="' + (battleInfoPanel === "log" ? "true" : "false") + '"', "button-slim battle-info-tab" + (battleInfoPanel === "log" ? " button-primary" : " button-ghost")),
    button(t("ui.battle.summary"), "battle-info-tab", 'data-panel="summary" aria-selected="' + (battleInfoPanel === "summary" ? "true" : "false") + '"', "button-slim battle-info-tab" + (battleInfoPanel === "summary" ? " button-primary" : " button-ghost")),
    "      </div>",
    '      <div class="battle-info-body">',
    '        <div class="battle-info-pane battle-summary-pane' + (battleInfoPanel === "summary" ? " is-active" : "") + '" data-battle-info-pane="summary" aria-hidden="' + (battleInfoPanel === "summary" ? "false" : "true") + '">',
    '          <div class="summary-list" data-battle-summary-measure>' + renderSummary(summaryLines) + "</div>",
    "        </div>",
    '        <div class="battle-info-pane battle-log-pane' + (battleInfoPanel === "log" ? " is-active" : "") + '" data-battle-info-pane="log" aria-hidden="' + (battleInfoPanel === "log" ? "false" : "true") + '">',
    '          <div class="log-panel" data-scroll-key="battle-log"><div class="log-list">' + (logLines || '<div class="log-line">' + escapeHtml(t("ui.battle.noTurns")) + '</div>') + waitingLogLine + "</div></div>",
    "        </div>",
    "      </div>",
    battleInfoFooter,
    "    </div></section>"
  ].join("");

  var battleItemsPanel = "";
  var towerOpponentPanel = scene.battleTower && renderScene.authoritativePresentation
    ? '<section class="battle-tower-opponent-panel"><div class="battle-tower-opponent-media">'
      + renderImage(getTrainerImage(renderScene.authoritativePresentation.sprite), renderScene.authoritativePresentation.name || t("ui.battle.challenger"), "battle-tower-opponent-sprite")
      + '</div><p>' + escapeHtml(t("ui.battle.towerChallenge", { number: scene.authoritativeTowerChallenge || 1 })) + '</p><h2>'
      + escapeHtml(renderScene.authoritativePresentation.name || t("ui.battle.challenger")) + "</h2></section>"
    : "";
  if (!renderScene.manager.battleOver && !scene.battleTower && state && (scene.adminBattle || Array.isArray(scene.playerInventory) || (!scene.authoritativeBattle && state.inventory))) {
    var playerInventory = Array.isArray(scene.playerInventory) ? scene.playerInventory : state.inventory;
    var ownInventoryItems = resolveInventoryItems(scene.adminBattle ? scene.adminItems : playerInventory);
    var opponentInventoryItems = scene.adminBattle ? resolveInventoryItems(scene.playerInventory || []) : [];
    function getBattleInventorySectionKey(item) {
      var category = item.category || "";
      if (category === ItemCategory.Berry && isPlayerBattleInventoryItem(item)) { return "berries"; }
      if (category === ItemCategory.Ball && String(renderScene.battleType || "").indexOf("capture_") === 0) { return "balls"; }
      if (category === ItemCategory.BattleItem && isPlayerBattleInventoryItem(item)) { return "battle"; }
      return "";
    }
    function renderBattleInventoryItem(item, options) {
      options = options || {};
      var itemName = itemDisplayName(item);
      var itemImageClass = item.category === ItemCategory.TM ? "battle-zaino-item-image battle-zaino-item-image-mt" : "battle-zaino-item-image";
      var imageMarkup = item.image
        ? renderImage(getItemImage(item.image), itemName, itemImageClass)
        : '<span class="battle-zaino-item-image battle-zaino-item-image-empty"></span>';
      var availabilityMarkup = '<div class="battle-zaino-item-availability"><span class="battle-zaino-item-quantity">x' + escapeHtml(item.quantity) + "</span></div>";
      var useButton = '<button type="button" class="button button-primary button-slim battle-inventory-use" data-action="' + (scene.adminBattle ? "admin-battle-item-use" : "battle-item-use") + '" data-item-index="' + escapeHtml(item.index) + '"' + (options.readonly ? " disabled" : "") + ">" + escapeHtml(t("ui.battle.use")) + "</button>";
      var itemCard = [
        '<article class="battle-zaino-item-card' + (options.readonly ? " battle-inventory-item-readonly" : "") + '">',
        '  <div class="battle-zaino-item-media">',
        imageMarkup,
        availabilityMarkup,
        "  </div>",
        '  <div class="battle-zaino-item-copy">',
        '    <div class="battle-zaino-item-heading"><h3 class="battle-zaino-item-name">' + escapeHtml(itemName) + "</h3>" + useButton + "</div>",
        '    <p class="battle-zaino-item-description">' + escapeHtml(itemDisplayDescription(item)) + "</p>",
        "  </div>",
        "</article>"
      ].join("");

      return [
        '<div class="battle-inventory-entry' + (options.readonly ? " battle-inventory-entry-readonly" : "") + '">',
        itemCard,
        "</div>"
      ].join("");
    }
    function renderBattleInventorySection(section, inventoryItems, options) {
      var sectionItems = Array.isArray(options.items)
        ? options.items
        : inventoryItems.filter(function (item) {
          return getBattleInventorySectionKey(item) === section.key;
        });
      var sectionContent = sectionItems.length
        ? sectionItems.map(function (item) { return renderBattleInventoryItem(item, options); }).join("")
        : "";

      return [
        '<section class="battle-zaino-pocket battle-inventory-section battle-inventory-section-' + escapeHtml(section.key) + '">',
        '  <h3 class="battle-zaino-pocket-title">' + escapeHtml(section.title) + "</h3>",
        '  <div class="battle-zaino-pocket-scroll">',
        '    <div class="battle-zaino-item-grid">' + sectionContent + "</div>",
        "  </div>",
        "</section>"
      ].join("");
    }
    var battleInventorySections = [
      { key: "battle", title: t("ui.battle.inventorySections.battle") },
      { key: "berries", title: t("ui.battle.inventorySections.berries") }
    ];
    if (!renderScene.trainingBattle && String(renderScene.battleType || "").indexOf("gym_") !== 0) {
      battleInventorySections.push({ key: "balls", title: t("ui.battle.inventorySections.balls") });
    }
    function getAvailableBattleInventoryItems(inventoryItems) {
      return inventoryItems.filter(function (item) {
        return Boolean(getBattleInventorySectionKey(item));
      });
    }
    function renderBattleInventoryStack(inventoryItems, options) {
      var availableItems = getAvailableBattleInventoryItems(inventoryItems);

      return availableItems.length
        ? battleInventorySections.filter(function (section) {
          return inventoryItems.some(function (item) { return getBattleInventorySectionKey(item) === section.key; });
        }).map(function (section) { return renderBattleInventorySection(section, inventoryItems, options); }).join("")
        : '<p class="battle-zaino-empty">' + escapeHtml(t("ui.battle.noItems")) + '</p>';
    }
    function renderMobileBattleInventoryStack(inventoryItems, options) {
      var availableItems = getAvailableBattleInventoryItems(inventoryItems);

      return availableItems.length
        ? renderBattleInventorySection({ key: "all", title: t("ui.battle.inventorySections.all") }, inventoryItems, Object.assign({}, options, { items: availableItems }))
        : '<p class="battle-zaino-empty">' + escapeHtml(t("ui.battle.noItems")) + '</p>';
    }
    battleItemsPanel = '<section class="panel battle-inventory-panel" data-battle-panel-section="items"><div class="battle-inventory-stack battle-zaino-stack battle-inventory-desktop-stack">' +
      renderBattleInventoryStack(ownInventoryItems, { readonly: playerItemsReadonly }) +
      '</div><div class="battle-inventory-stack battle-zaino-stack battle-inventory-mobile-stack">' +
      renderMobileBattleInventoryStack(ownInventoryItems, { readonly: playerItemsReadonly }) +
      "</div></section>";
    if (scene.adminBattle) {
      battleItemsPanel += '<section class="panel battle-inventory-panel battle-opponent-inventory-panel" data-battle-panel-section="items"><h2 class="stack-title">' + escapeHtml(t("ui.battle.opponentBag")) + '</h2><div class="battle-inventory-stack battle-zaino-stack battle-inventory-desktop-stack">' +
        renderBattleInventoryStack(opponentInventoryItems, { readonly: true }) +
        '</div><div class="battle-inventory-stack battle-zaino-stack battle-inventory-mobile-stack">' +
        renderMobileBattleInventoryStack(opponentInventoryItems, { readonly: true }) +
        "</div></section>";
    }
  }

  return sceneShell(
    t(scene.battleTower ? "ui.battle.towerTitle" : "ui.battle.sceneTitle"),
    "",
    [
      '<section class="battle-layout" data-battle-active-panel="' + battleBottomPanel + '">',
      towerOpponentPanel,
      '  <div class="battle-stage">',
      '    <div class="panel battle-field-panel">',
      renderBattleSlot(!adminPerspective && pendingAdminEntryChoice ? null : opponentTeam.getActive(), t(adminPerspective ? "ui.battle.playerPokemon" : "ui.battle.opponentPokemon"), false, Object.assign({ ownTeam: ownTeam }, opponentSlotOptions, { placeholderText: t("ui.battle.choosingFieldPokemon", { name: opponentTeam.name || t("ui.battle.opponent") }) })),
      renderBattleSlot(adminEntryChoiceActive ? null : ownTeam.getActive(), t(adminPerspective ? "ui.battle.opponentPokemon" : "ui.battle.playerPokemon"), ownActionEnabled, Object.assign({ ownTeam: ownTeam, manager: renderScene.manager, moveActor: adminPerspective ? "npc" : "player" }, ownSlotOptions, { placeholderText: t("ui.battle.choosingFieldPokemon", { name: ownTeam.name || t("ui.battle.adminFallback") }) })),
      "    </div>",
      '      <div class="battle-mobile-tabs" data-battle-mobile-tabs>',
      button(t("ui.battle.info"), "battle-bottom-tab", 'data-panel="info"', "button-slim battle-mobile-tab" + (battleBottomPanel === "info" ? " button-primary" : " button-ghost")),
      button(t("ui.battle.teams"), "battle-bottom-tab", 'data-panel="teams"', "button-slim battle-mobile-tab" + (battleBottomPanel === "teams" ? " button-primary" : " button-ghost")),
      button(t("ui.battle.items"), "battle-bottom-tab", 'data-panel="items"', "button-slim battle-mobile-tab" + (battleBottomPanel === "items" ? " button-primary" : " button-ghost")),
      "      </div>",
      infoCard,
      "  </div>",
      '  <div class="battle-rosters" data-battle-panel-section="teams">',
      '    <section class="panel battle-roster-card battle-enemy-roster-card"><div class="panel-inner stack">',
      '      <h2 class="stack-title">' + escapeHtml(t("ui.battle.opponentTeam")) + '</h2>',
      '      <div class="mini-roster" data-scroll-key="battle-enemy-roster">' + opponentTeam.combatantList.map(function (combatant, index) {
        return renderMiniCombatant(combatant, !pendingAdminEntryChoice && index === opponentTeam.activeIndex, {
          reserveFooter: true
        });
      }).join("") + "</div>",
      "    </div></section>",
      '    <section class="panel battle-roster-card battle-player-roster-card"><div class="panel-inner stack">',
      '      <h2 class="stack-title">' + escapeHtml(t("ui.battle.playerTeam")) + '</h2>',
      '      <div class="mini-roster" data-scroll-key="battle-player-roster">' + ownTeam.combatantList.map(function (combatant, index) {
        return renderMiniCombatant(combatant, !adminEntryChoiceActive && index === ownTeam.activeIndex, {
          canSwitch: adminEntryChoiceActive || (adminPerspective ? adminActionEnabled : !renderScene.manager.battleOver && !playerActionLocked),
          switchAction: adminEntryChoiceActive ? "admin-battle-entry" : ownSwitchAction,
          switchLabel: t(adminEntryChoiceActive ? "ui.battle.choose" : "ui.battle.switch"),
          allowActiveSwitch: adminEntryChoiceActive,
          reserveFooter: true,
          index: index
        });
      }).join("") + "</div>",
      "    </div></section>",
      "  </div>",
      battleItemsPanel,
      "</section>"
    ].join(""),
    "",
    "",
    "parent-back"
  );
}

export function renderBattleRestoreScene() {
  return sceneShell(
    t("ui.battle.sceneTitle"),
    "",
    '<div class="empty-state">' + escapeHtml(t("ui.battle.loading")) + '</div>',
    "",
    "",
    "parent-back"
  );
}
