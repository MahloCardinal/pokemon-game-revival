import { getItemByIndex } from "../data/items.js";
import {
  MISSION_CATEGORY_ADVENTURE,
  MISSION_CATEGORY_CAPTURE,
  MISSION_CATEGORY_DAILY,
  MISSION_STATUS_CLAIMED,
  MISSION_STATUS_SKIPPED
} from "../data/pokefan-missions.js";
import { state } from "../client/game-state.js";
import { isDebugUser } from "../client/debug-tools.js";
import { missionCategories, missionIsActive, missionRowsByCategory } from "../client/mission-runtime.js";
import { isBattleRuntimeActive } from "../client/battle-scene-lock.js";
import { escapeHtml, getItemImage, renderImage } from "../client/asset-helpers.js";
import { button, formatInteger, moneyMarkup, renderScenePresentationPanel, sceneShell } from "../client/render-utils.js";
import { itemDisplayName } from "../client/entity-text.js";
import { resolveText, t, tp } from "../client/i18n.js";

function renderMoneyReward(quantity) {
  return '<span class="pokefan-mission-reward">' + moneyMarkup(quantity) + "</span>";
}

function renderItemReward(reward) {
  var item = getItemByIndex(reward && reward.itemIndex);
  var quantity = Number(reward && reward.quantity) || 1;
  var itemName = item ? itemDisplayName(item) : t("ui.pokefan.fallbackReward");
  return [
    '<span class="pokefan-mission-reward">',
    item && item.image ? renderImage(getItemImage(item.image), itemName, "pokefan-mission-item-image") : "",
    '  <span>' + escapeHtml(quantity > 1 ? formatInteger(quantity) + "x " + itemName : itemName) + "</span>",
    "</span>"
  ].join("");
}

function rewardBadgeCount(mission) {
  var frozen = (mission && mission.trackedKeys || []).find(function (key) { return /^reward-badges:[0-8]$/.test(String(key)); });
  return frozen ? Number(String(frozen).split(":")[1]) : Math.max(0, Math.min(8, Number(state.trainerInfo && state.trainerInfo[2]) || 0));
}

function renderReward(reward, mission) {
  var badges = rewardBadgeCount(mission);
  if (reward && reward.kind === "dynamic_money") {
    return renderMoneyReward((Number(reward.baseQuantity) || 0) + badges * (Number(reward.perBadge) || 0));
  }
  if (reward && reward.kind === "dynamic_item") {
    return renderItemReward({
      kind: "item",
      itemIndex: reward.itemIndex,
      quantity: (Number(reward.baseQuantity) || 0) + badges * (Number(reward.perBadge) || 0)
    });
  }
  if (reward && reward.kind === "money") {
    return renderMoneyReward(reward.quantity);
  }
  if (reward && (reward.kind === "choice" || reward.kind === "pokemon_choice")) {
    return '<span class="pokefan-mission-reward"><span>' + escapeHtml(t("ui.pokefan.rewardChoices." + reward.choiceKey)) + "</span></span>";
  }
  return renderItemReward(reward);
}

function renderMissionStatus(mission) {
  var missionState = state.missions || {};
  var progress = Math.min(Number(mission.counter) || 0, Number(mission.target) || 0) + "/" + escapeHtml(mission.target);
  if (Number(missionState.claimedNoticeMissionIndex) === Number(mission.missionIndex)) {
    return '<span class="pokefan-mission-status is-claimed-now">' + escapeHtml(t("ui.pokefan.claimedNow")) + "</span>";
  }
  if (mission.claimStatus === MISSION_STATUS_SKIPPED) {
    return '<span class="pokefan-mission-status">' + escapeHtml(t("ui.pokefan.skippedDebug")) + "</span>";
  }
  if (mission.claimStatus === MISSION_STATUS_CLAIMED) {
    return '<span class="pokefan-mission-status">' + escapeHtml(t("ui.pokefan.claimed")) + "</span>";
  }
  if (!missionIsActive(mission)) {
    return '<span class="pokefan-mission-status">' + escapeHtml(t("ui.pokefan.inactive")) + "</span>";
  }
  if (Number(mission.counter) >= Number(mission.target)) {
    return button(
      t("ui.pokefan.claim"),
      "pokefan-claim-mission",
      'data-mission-index="' + escapeHtml(mission.missionIndex) + '"' + (Number(missionState.claimingMissionIndex) === Number(mission.missionIndex) || isBattleRuntimeActive() ? " disabled" : ""),
      "button-accent button-slim pokefan-claim-button"
    );
  }
  if (isDebugUser()) {
    return button(
      t("ui.pokefan.completeDebug"),
      "pokefan-debug-complete-mission",
      'data-mission-index="' + escapeHtml(mission.missionIndex) + '"' + (missionState.debugCompletingMissionIndex != null || isBattleRuntimeActive() ? " disabled" : ""),
      "button-ghost button-slim pokefan-debug-complete-button"
    );
  }
  return '<span class="pokefan-mission-progress">' + progress + "</span>";
}

function renderMissionRow(mission) {
  var badgeCount = Math.max(0, Number(mission.phase) - 1);
  var phase = mission.category === MISSION_CATEGORY_ADVENTURE ? '<span class="pokefan-mission-phase">' + escapeHtml(tp("ui.pokefan.badges", badgeCount)) + "</span>" : "";
  return [
    '<div class="pokefan-mission-row">',
    '  <div class="pokefan-mission-cell pokefan-mission-requirement">' + phase + escapeHtml(t("ui.pokefan.requirements." + mission.missionIndex)) + "</div>",
    '  <div class="pokefan-mission-cell">' + renderReward(mission.reward, mission) + "</div>",
    '  <div class="pokefan-mission-cell pokefan-mission-completion">' + renderMissionStatus(mission) + "</div>",
    "</div>"
  ].join("");
}

function renderMissionTable(title, missions, emptyText) {
  var body = missions.length ? missions.map(renderMissionRow).join("") : '<div class="pokefan-mission-row pokefan-empty-row"><div class="pokefan-empty-state">' + escapeHtml(emptyText) + "</div></div>";
  return [
    '  <div class="pokefan-data-table">',
    '    <div class="pokefan-mission-header"><span>' + escapeHtml(title) + "</span><span>" + escapeHtml(t("ui.pokefan.reward")) + "</span><span>" + escapeHtml(t("ui.pokefan.status")) + "</span></div>",
    body,
    "  </div>"
  ].join("");
}

function renderSectionTabs(activeSection) {
  var categories = missionCategories().slice().sort(function (left, right) {
    var order = {};
    order[MISSION_CATEGORY_DAILY] = 0;
    order[MISSION_CATEGORY_ADVENTURE] = 1;
    order[MISSION_CATEGORY_CAPTURE] = 2;
    return (order[left] ?? 99) - (order[right] ?? 99);
  });
  return '<section class="panel pokefan-sections-panel"><div class="panel-inner"><nav class="pokemon-center-action-row rules-section-row" aria-label="' + escapeHtml(t("ui.pokefan.categoriesAria")) + '">' + categories.map(function (section) {
    return button(
      t("ui.pokefan.categories." + section),
      "pokefan-section",
      'data-section="' + section + '" aria-pressed="' + (section === activeSection ? "true" : "false") + '"',
      "button-slim" + (section === activeSection ? " button-primary" : " button-ghost")
    );
  }).join("") + "</nav></div></section>";
}

export function renderPokefanScene() {
  var missionState = state.missions || {};
  var activeSection = state.scene.pokefanSection || MISSION_CATEGORY_DAILY;
  if (missionCategories().indexOf(activeSection) === -1) {
    activeSection = MISSION_CATEGORY_DAILY;
  }
  var missions = missionRowsByCategory(activeSection);
  var activeMissions = missions.filter(function (mission) {
    return (mission.claimStatus !== MISSION_STATUS_CLAIMED && mission.claimStatus !== MISSION_STATUS_SKIPPED)
      || Number(missionState.claimedNoticeMissionIndex) === Number(mission.missionIndex);
  });
  var completedMissions = missions.filter(function (mission) {
    return (mission.claimStatus === MISSION_STATUS_CLAIMED || mission.claimStatus === MISSION_STATUS_SKIPPED)
      && Number(missionState.claimedNoticeMissionIndex) !== Number(mission.missionIndex);
  });
  var error = missionState.error ? '<p class="auth-error pokefan-error">' + escapeHtml(resolveText(missionState.error)) + "</p>" : "";
  var body = [
    '<section class="pokefan-layout">',
    renderScenePresentationPanel("pokefan_club", "pokefan-info-panel"),
    '<div data-render-region="pokefan-content">',
    renderSectionTabs(activeSection),
    error,
    '<section class="panel pokefan-missions-panel"><div class="panel-inner">',
    renderMissionTable(t("ui.pokefan.activeMissions"), activeMissions, t("ui.pokefan.noAvailableMissions")),
    renderMissionTable(t("ui.pokefan.completedMissions"), completedMissions, t("ui.pokefan.noCompletedMissions")),
    "</div></section>",
    "</div>",
    "</section>"
  ].join("");
  return sceneShell(t("ui.pokefan.sceneTitle"), "", body, "", "scene-content-pokefan", "parent-back");
}
