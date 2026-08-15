import * as Engine from "../engine/index.js";
import { state } from "../client/game-state.js";
import { ensureBattleBindings } from "../client/battle-scene-lock.js";
import { escapeHtml, getItemImage, getTrainerImage, renderImage } from "../client/asset-helpers.js";
import { button, hpMarkup, renderSummary, sceneShell } from "../client/render-utils.js";
import { renderPokemonCard, renderPokemonCardFrame } from "../client/pokemon-card.js";
import { resolveInventoryItems, itemDisplayDescription, isPlayerBattleInventoryItem, ItemCategory } from "../data/items.js";
import { isAdminRewardBattleType } from "../data/admin-battles.js";

var TEAM_MAX = Engine.TEAM_MAX;

function renderMiniCombatant(combatant, isActive, options) {
  options = options || {};
  var className = "mini-card";
  var statusLabel = "";
  var actions = "";
  if (isActive) {
    className += " is-active";
    statusLabel = "Attivo";
  }
  if (combatant.isFainted()) {
    className += " is-ko";
    statusLabel = statusLabel ? statusLabel + " - KO" : "KO";
  }
  if (options.canSwitch && (!isActive || options.allowActiveSwitch) && !combatant.isFainted()) {
    actions = '<button type="button" class="button button-primary button-slim" data-action="' + escapeHtml(options.switchAction || "battle-switch") + '" data-index="' + escapeHtml(options.index) + '">' + escapeHtml(options.switchLabel || "Cambia") + '</button>';
  }
  var frameClassName = "battle-roster-entry";
  if (options.reserveFooter && !statusLabel && !actions) {
    frameClassName += " battle-roster-entry-footer-placeholder";
    statusLabel = "Attivo";
  }

  return renderPokemonCardFrame(renderPokemonCard(combatant.pokemon, {
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
      '  <p class="battle-empty-slot-message">' + escapeHtml(options.placeholderText || "In attesa della scelta dell'admin") + "</p>",
      options.overlayContent || "",
      "</article>"
    ].join(""));
  }
  if (moveStates.length) {
    moveMarkup = moveStates.map(function (stateEntry, index) {
      var description = Engine.formatDescription(stateEntry.move);
      var moveContent = '<span class="move-name">' + escapeHtml(stateEntry.move.name) + (description ? ' <span class="move-effect">(' + escapeHtml(description) + ")</span>" : "") + "</span>";
      var weatherBlocked = options.manager && options.manager.isWeatherMoveBlocked(options.moveActor, stateEntry.move);
      var disabled = !stateEntry.enabled || weatherBlocked;

      if (!showMoves) {
        return '<button type="button" class="move-button battle-move-preview' + (disabled ? " is-disabled" : "") + '" disabled>' + moveContent + "</button>";
      }

      return '<button type="button" class="move-button ' + (disabled ? "is-disabled" : "") + '" data-action="' + escapeHtml(options.moveAction || "battle-move") + '" data-index="' + index + '" ' + (disabled ? "disabled" : "") + ">" + moveContent + "</button>";
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

function battleLogDisplayNames(scene) {
  var playerTeam = scene && scene.playerTeam;
  var playerName = String(playerTeam && playerTeam.name || "").trim();
  var enemyTeam = scene && scene.enemyTeam;
  var enemyActive = enemyTeam && enemyTeam.getActive ? enemyTeam.getActive() : null;
  var enemyName = String(enemyTeam && enemyTeam.name || "").trim();
  if (!playerName || playerName === "Giocatore") {
    playerName = playerBattleSummaryName(scene);
  }
  if ((!enemyName || enemyName === "Pokemon selvatico") && enemyActive && enemyActive.pokemon) {
    enemyName = enemyActive.pokemon.name;
  }
  return {
    player: playerName,
    enemy: enemyName || "Avversario"
  };
}

function normalizeBattleLogLine(line, names) {
  if (line === "Giocatore") {
    return names.player;
  }
  if (line.indexOf("Giocatore ") === 0) {
    return names.player + line.slice("Giocatore".length);
  }
  if (line === "Pokemon selvatico" || line === "Sfidante") {
    return names.enemy;
  }
  return line;
}

function renderBattleLog(logEntries, scene) {
  var groups = [];
  var currentGroup = null;
  var turnHeaderPattern = /^--- Turno (\d+):\s*(.+)$/;
  var forcedEntryPattern = /^(?:Entra in campo .+|.+ ritirato, entra in campo .+)$/;
  var names = battleLogDisplayNames(scene);

  function flushGroup() {
    if (currentGroup) {
      groups.push(currentGroup);
      currentGroup = null;
    }
  }

  logEntries.forEach(function (line) {
    var turnHeaderMatch = line.match(turnHeaderPattern);

    if (line === "\u200b") {
      flushGroup();
      groups.push({ divider: true });
      return;
    }

    if (turnHeaderMatch) {
      if (!currentGroup || currentGroup.turn !== turnHeaderMatch[1]) {
        flushGroup();
        currentGroup = {
          turn: turnHeaderMatch[1],
          title: "TURNO " + turnHeaderMatch[1],
          lines: []
        };
      }
      currentGroup.lines.push(normalizeBattleLogLine(turnHeaderMatch[2], names));
      return;
    }

    if (!currentGroup) {
      currentGroup = {
        turn: "",
        title: "",
        lines: []
      };
    }
    currentGroup.lines.push(normalizeBattleLogLine(line, names));
  });

  flushGroup();

  groups = groups.reduce(function (merged, group) {
    var previousGroup = merged[merged.length - 1];
    var previousDivider = previousGroup && previousGroup.divider ? previousGroup : null;
    var previousTurnGroup = previousDivider ? merged[merged.length - 2] : previousGroup;
    var isForcedEntryGroup = group
      && !group.divider
      && !group.title
      && group.lines.length > 0
      && group.lines.every(function (line) {
        return forcedEntryPattern.test(line);
      });

    if (isForcedEntryGroup && previousTurnGroup && !previousTurnGroup.divider) {
      previousTurnGroup.lines = previousTurnGroup.lines.concat(group.lines);
      if (previousDivider) {
        merged.pop();
      }
      return merged;
    }

    merged.push(group);
    return merged;
  }, []);

  return groups.map(function (group) {
    if (group.divider) {
      return '<div class="log-line is-divider"></div>';
    }

    return [
      '<div class="log-line log-turn-group">',
      group.title ? '<p class="log-turn-title">' + escapeHtml(group.title) + "</p>" : "",
      group.lines.map(function (line, index) {
        var className = index === 0 || line === names.player || line === names.enemy
          ? "log-turn-entry log-turn-team"
          : "log-turn-entry";
        return '<p class="' + className + '">' + escapeHtml(line) + "</p>";
      }).join(""),
      "</div>"
    ].join("");
  }).join("");
}

function playerBattleSummaryName(scene) {
  if (scene && scene.adminBattle && scene.playerUsername) {
    return String(scene.playerUsername || "").trim() || "Giocatore";
  }
  return String(state.playerName || state.auth.userLabel || "").trim() || "Giocatore";
}

function opponentBattleSummaryName(scene, currentName) {
  var battleType = String(scene && (scene.battleType || scene.manager && scene.manager.battleType) || "");
  var name = String(currentName || "").trim();
  if (battleType.indexOf("capture_") === 0 || !name || name === "Sfidante" || name === "Pokemon selvatico") {
    return "Avversario";
  }
  return name;
}

function applyBattleSummaryNames(lines, scene) {
  var teamIndex = 0;
  return lines.map(function (entry) {
    if (!entry || entry.kind !== "team") {
      return entry;
    }
    teamIndex += 1;
    return Object.assign({}, entry, {
      text: teamIndex === 1 ? playerBattleSummaryName(scene) : opponentBattleSummaryName(scene, entry.text)
    });
  });
}

export function renderBattleScene(scene) {
  var renderScene = scene.finalBattleDisplayScene || scene;
  ensureBattleBindings(renderScene);

  var summaryLines = applyBattleSummaryNames(Engine.buildBattleSummary(renderScene.playerTeam, renderScene.enemyTeam, renderScene.manager.usedItems, renderScene.manager.enemyUsedItems, renderScene.manager), renderScene);
  var logLines = renderBattleLog(renderScene.manager.log, renderScene);
  var battleInfoPanel = scene.battleInfoPanel === "summary" ? "summary" : "log";
  var battleBottomPanel = scene.battleBottomPanel === "teams" ? "teams" : scene.battleBottomPanel === "items" ? "items" : "info";

  function renderForcedSwitchOverlay(team, switchAction) {
    var activeIndex = team.activeIndex;
    var availableCount = team.combatantList.filter(Boolean).length;
    var choices = Array.from({ length: TEAM_MAX }, function (_, index) {
      var combatant = team.combatantList[index];
      if (!combatant) {
        return '<button type="button" class="capture-starter-slot battle-switch-choice is-empty" disabled></button>';
      }
      var isKo = combatant.isFainted();
      var disabled = isKo || index === activeIndex;
      var label = combatant.pokemon.name;
      return '<button type="button" class="capture-starter-slot battle-switch-choice' + (isKo ? " is-ko" : "") + '" data-action="' + escapeHtml(switchAction || "battle-switch") + '" data-index="' + escapeHtml(index) + '" ' + (disabled ? "disabled" : "") + ">" + escapeHtml(label) + "</button>";
    }).join("");
    return [
      '<div class="battle-ko-switch-overlay">',
      '  <section class="battle-ko-switch-panel pokemon-choice-panel">',
      '    <h3>Scegli chi mandare in campo:</h3>',
      '    <div class="capture-starter-grid battle-switch-grid battle-switch-grid-count-' + Math.min(3, Math.max(1, availableCount)) + '">' + choices + "</div>",
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
  } : { moveAction: ownMoveAction };
  var opponentSlotOptions = opponentNeedsSwitch ? { className: "has-fainted-overlay" } : {};
  var authoritativeRefresh = scene.authoritativeBattle && waitingForAdmin && !scene.adminBattle;
  var authoritativeUncertaintyMessage = scene.authoritativeCommandUncertain
    ? '<p class="battle-authoritative-uncertain-message">' + escapeHtml(scene.authoritativeUncertaintyMessage || "Il comando è ancora in verifica. Riprova prima di inviare altre azioni.") + "</p>"
    : "";
  var battleInfoFooter = scene.authoritativeCommandUncertain
    ? '<div class="battle-info-actions">' + authoritativeUncertaintyMessage
      + button("Riprova", "battle-authoritative-retry", scene.authoritativeCommandPending ? "disabled" : "", "button-accent button-slim")
      + button("Cancella sfida", "battle-authoritative-cancel", scene.authoritativeCommandPending ? "disabled" : "", "button-danger button-slim") + "</div>"
    : scene.authoritativeCommandPending
      ? '<div class="battle-info-actions" data-battle-abandon-inline>' + button("Abbandona scontro", "battle-abandon-open", "disabled", "button-danger button-slim") + "</div>"
    : authoritativeRefresh
    ? '<div class="battle-info-actions battle-abandon-actions" data-battle-abandon-inline>' + button("Abbandona scontro", "battle-abandon-open", "", "button-danger button-slim") + "</div>"
    : authoritativeAdminEntryChoice
      ? '<div class="battle-info-actions"><p class="battle-admin-thinking-log">Scegli l\'effetto dello strumento tenuto.</p>'
        + (authoritativeAdminEntryChoice.entries || []).map(function (entry) {
          return button(entry.name, "admin-battle-entry-choice", 'data-index="' + escapeHtml(entry.index) + '"', "button-ghost button-slim");
        }).join("") + "</div>"
    : canFinalizeAdminReward
    ? '<div class="battle-info-actions">' + button("Registra premi", "admin-battle-finalize-reward", "", "button-accent button-slim") + "</div>"
    : scene.terminalExitReady
      ? '<div class="battle-info-actions">' + button("Esci", "battle-terminal-exit", "", "button-primary button-slim") + "</div>"
    : scene.adminBattle && scene.rewardFinalized
      ? '<div class="battle-info-actions"><p class="battle-admin-thinking-log">Premi già registrati.</p></div>'
      : renderScene.manager.battleOver || scene.adminBattle || (playerActionLocked && !waitingForAdmin)
        ? ""
        : '<div class="battle-info-actions" data-battle-abandon-inline>' + button("Abbandona scontro", "battle-abandon-open", "", "button-danger button-slim") + "</div>";
  var waitingLogLine = "";
  if (waitingForAdmin && !scene.adminBattle) {
    waitingLogLine = '<div class="log-line battle-admin-thinking-log">' + escapeHtml((renderScene.enemyTeam.name || "L'avversario") + (scene.pendingAdminEntryChoice ? " sta scegliendo chi mandare in campo..." : " sta pensando alla mossa da fare...")) + "</div>";
  } else if (adminEntryChoiceActive) {
    waitingLogLine = '<div class="log-line battle-admin-thinking-log">Scegli il Pokémon da mandare in campo.</div>';
  } else if (scene.adminBattle && renderScene.manager.waitingFor === "player" && !renderScene.manager.battleOver) {
    waitingLogLine = '<div class="log-line battle-admin-thinking-log">' + escapeHtml((scene.playerUsername || "Il giocatore") + " sta pensando alla mossa da fare...") + "</div>";
  }
  var infoCard = [
    '    <section class="panel battle-info-card" data-battle-info-card data-battle-panel-section="info"><div class="panel-inner stack battle-info-inner">',
    '      <div class="battle-info-tabs" role="tablist" aria-label="Informazioni battaglia">',
    button("Log", "battle-info-tab", 'data-panel="log" aria-selected="' + (battleInfoPanel === "log" ? "true" : "false") + '"', "button-slim battle-info-tab" + (battleInfoPanel === "log" ? " button-primary" : " button-ghost")),
    button("Riassunto", "battle-info-tab", 'data-panel="summary" aria-selected="' + (battleInfoPanel === "summary" ? "true" : "false") + '"', "button-slim battle-info-tab" + (battleInfoPanel === "summary" ? " button-primary" : " button-ghost")),
    "      </div>",
    '      <div class="battle-info-body">',
    '        <div class="battle-info-pane battle-summary-pane' + (battleInfoPanel === "summary" ? " is-active" : "") + '" data-battle-info-pane="summary" aria-hidden="' + (battleInfoPanel === "summary" ? "false" : "true") + '">',
    '          <div class="summary-list" data-battle-summary-measure>' + renderSummary(summaryLines) + "</div>",
    "        </div>",
    '        <div class="battle-info-pane battle-log-pane' + (battleInfoPanel === "log" ? " is-active" : "") + '" data-battle-info-pane="log" aria-hidden="' + (battleInfoPanel === "log" ? "false" : "true") + '">',
    '          <div class="log-panel" data-scroll-key="battle-log"><div class="log-list">' + (logLines || '<div class="log-line">Nessun turno ancora eseguito.</div>') + waitingLogLine + "</div></div>",
    "        </div>",
    "      </div>",
    battleInfoFooter,
    "    </div></section>"
  ].join("");

  var battleItemsPanel = "";
  var towerOpponentPanel = scene.battleTower && renderScene.authoritativePresentation
    ? '<section class="battle-tower-opponent-panel"><div class="battle-tower-opponent-media">'
      + renderImage(getTrainerImage(renderScene.authoritativePresentation.sprite), renderScene.authoritativePresentation.name || "Sfidante", "battle-tower-opponent-sprite")
      + '</div><p>Sfida ' + escapeHtml(scene.authoritativeTowerChallenge || 1) + '</p><h2>'
      + escapeHtml(renderScene.authoritativePresentation.name || "Sfidante") + "</h2></section>"
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
      var itemName = String(item.name || "");
      var itemImageClass = item.category === ItemCategory.Mt ? "battle-zaino-item-image battle-zaino-item-image-mt" : "battle-zaino-item-image";
      var imageMarkup = item.image
        ? renderImage(getItemImage(item.image), item.name, itemImageClass)
        : '<span class="battle-zaino-item-image battle-zaino-item-image-empty"></span>';
      var availabilityMarkup = '<div class="battle-zaino-item-availability"><span class="battle-zaino-item-quantity">x' + escapeHtml(item.quantity) + "</span></div>";
      var useButton = '<button type="button" class="button button-primary button-slim battle-inventory-use" data-action="' + (scene.adminBattle ? "admin-battle-item-use" : "battle-item-use") + '" data-item-index="' + escapeHtml(item.index) + '"' + (options.readonly ? " disabled" : "") + ">Usa</button>";
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
      { key: "battle", title: "Strumenti battaglia" },
      { key: "berries", title: "Bacche" }
    ];
    if (!renderScene.trainingBattle && String(renderScene.battleType || "").indexOf("gym_") !== 0) {
      battleInventorySections.push({ key: "balls", title: "Pok\u00e9 Ball" });
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
        : '<p class="battle-zaino-empty">Nessuno strumento disponibile.</p>';
    }
    function renderMobileBattleInventoryStack(inventoryItems, options) {
      var availableItems = getAvailableBattleInventoryItems(inventoryItems);

      return availableItems.length
        ? renderBattleInventorySection({ key: "all", title: "Strumenti" }, inventoryItems, Object.assign({}, options, { items: availableItems }))
        : '<p class="battle-zaino-empty">Nessuno strumento disponibile.</p>';
    }
    battleItemsPanel = '<section class="panel battle-inventory-panel" data-battle-panel-section="items"><div class="battle-inventory-stack battle-zaino-stack battle-inventory-desktop-stack">' +
      renderBattleInventoryStack(ownInventoryItems, { readonly: playerItemsReadonly }) +
      '</div><div class="battle-inventory-stack battle-zaino-stack battle-inventory-mobile-stack">' +
      renderMobileBattleInventoryStack(ownInventoryItems, { readonly: playerItemsReadonly }) +
      "</div></section>";
    if (scene.adminBattle) {
      battleItemsPanel += '<section class="panel battle-inventory-panel battle-opponent-inventory-panel" data-battle-panel-section="items"><h2 class="stack-title">Zaino avversario</h2><div class="battle-inventory-stack battle-zaino-stack battle-inventory-desktop-stack">' +
        renderBattleInventoryStack(opponentInventoryItems, { readonly: true }) +
        '</div><div class="battle-inventory-stack battle-zaino-stack battle-inventory-mobile-stack">' +
        renderMobileBattleInventoryStack(opponentInventoryItems, { readonly: true }) +
        "</div></section>";
    }
  }

  return sceneShell(
    scene.battleTower ? "Torre Lotta" : "Battaglia",
    "",
    [
      '<section class="battle-layout" data-battle-active-panel="' + battleBottomPanel + '">',
      towerOpponentPanel,
      '  <div class="battle-stage">',
      '    <div class="panel battle-field-panel">',
      renderBattleSlot(!adminPerspective && pendingAdminEntryChoice ? null : opponentTeam.getActive(), adminPerspective ? "Pokémon del giocatore" : "Pokémon avversario", false, Object.assign({ ownTeam: ownTeam }, opponentSlotOptions, { placeholderText: (opponentTeam.name || "L'avversario") + " sta scegliendo il Pokémon da mandare in campo" })),
      renderBattleSlot(adminEntryChoiceActive ? null : ownTeam.getActive(), adminPerspective ? "Pokémon avversario" : "Pokémon del giocatore", ownActionEnabled, Object.assign({ ownTeam: ownTeam, manager: renderScene.manager, moveActor: adminPerspective ? "npc" : "player" }, ownSlotOptions, { placeholderText: (ownTeam.name || "L'admin") + " sta scegliendo il Pokémon da mandare in campo" })),
      "    </div>",
      '      <div class="battle-mobile-tabs" data-battle-mobile-tabs>',
      button("Info lotta", "battle-bottom-tab", 'data-panel="info"', "button-slim battle-mobile-tab" + (battleBottomPanel === "info" ? " button-primary" : " button-ghost")),
      button("Squadre", "battle-bottom-tab", 'data-panel="teams"', "button-slim battle-mobile-tab" + (battleBottomPanel === "teams" ? " button-primary" : " button-ghost")),
      button("Strumenti", "battle-bottom-tab", 'data-panel="items"', "button-slim battle-mobile-tab" + (battleBottomPanel === "items" ? " button-primary" : " button-ghost")),
      "      </div>",
      infoCard,
      "  </div>",
      '  <div class="battle-rosters" data-battle-panel-section="teams">',
      '    <section class="panel battle-roster-card battle-enemy-roster-card"><div class="panel-inner stack">',
      '      <h2 class="stack-title">Squadra avversaria</h2>',
      '      <div class="mini-roster" data-scroll-key="battle-enemy-roster">' + opponentTeam.combatantList.map(function (combatant, index) {
        return renderMiniCombatant(combatant, !pendingAdminEntryChoice && index === opponentTeam.activeIndex, {
          reserveFooter: true
        });
      }).join("") + "</div>",
      "    </div></section>",
      '    <section class="panel battle-roster-card battle-player-roster-card"><div class="panel-inner stack">',
      '      <h2 class="stack-title">Squadra del giocatore</h2>',
      '      <div class="mini-roster" data-scroll-key="battle-player-roster">' + ownTeam.combatantList.map(function (combatant, index) {
        return renderMiniCombatant(combatant, !adminEntryChoiceActive && index === ownTeam.activeIndex, {
          canSwitch: adminEntryChoiceActive || (adminPerspective ? adminActionEnabled : !renderScene.manager.battleOver && !playerActionLocked),
          switchAction: adminEntryChoiceActive ? "admin-battle-entry" : ownSwitchAction,
          switchLabel: adminEntryChoiceActive ? "Scegli" : "Cambia",
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
    "Battaglia",
    "",
    '<div class="empty-state">Caricamento battaglia in corso...</div>',
    "",
    "",
    "parent-back"
  );
}
