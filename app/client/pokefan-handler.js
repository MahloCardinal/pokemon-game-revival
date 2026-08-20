import { getItemByIndex } from "../data/items.js";
import { SPECIES_LIBRARY } from "../data/index.js";
import { levelLimitForBadges, tmUnlockBadges } from "../data/progression.js";
import { shoppingCenterItemIsSinglePurchase } from "../data/shopping-center.js";
import { requireNotInBattle } from "./battle-scene-lock.js";
import { registerAction } from "./action-registry.js";
import { openMessage } from "./dialog-handler.js";
import { claimMission, missionByIndex, missionCatalogByIndex, missionCategories, missionIsActive, setMissionError } from "./mission-runtime.js";
import { renderRegions, setScene } from "./renderer.js";
import { applyPlayerSave, root, state } from "./game-state.js";
import { completeAuthoritativeDebugMission } from "../api/debug.js";
import { authoritativeDebugPlayerState } from "../api/debug-contract.js";
import { saveFromAuthoritativeProjection } from "../api/player.js";
import { isDebugUser } from "./debug-tools.js";
import { MISSION_CATEGORY_ADVENTURE, MISSION_CATEGORY_DAILY } from "../data/pokefan-missions.js";
import { getCurrentPlayerState } from "../api/player-command.js";
import { broadcastTeamBoxRuntimeState } from "./runtime-state.js";
import { itemDisplayName, speciesDisplayName } from "./entity-text.js";
import { getLocale, messageDescriptor, t } from "./i18n.js";

var pendingMissionChoice = null;
var missionChoiceCleanup = null;
var rewardEvolutionParents = Object.keys(SPECIES_LIBRARY).reduce(function (parentsBySpecies, parentKey) {
  var parent = SPECIES_LIBRARY[parentKey];
  var evolutions = parent && parent.evolution && Array.isArray(parent.evolution.to) ? parent.evolution.to : [];
  evolutions.forEach(function (evolution) {
    var targetKey = String(evolution.species);
    if (!parentsBySpecies[targetKey]) parentsBySpecies[targetKey] = [];
    parentsBySpecies[targetKey].push({ parentKey: parentKey, trigger: evolution.trigger || {} });
  });
  return parentsBySpecies;
}, {});

function minimumPokemonRewardLevel(speciesKey, visiting) {
  var parents = rewardEvolutionParents[String(speciesKey)] || [];
  var nextVisiting = visiting || new Set();
  if (!parents.length) return 5;
  if (nextVisiting.has(String(speciesKey))) return 101;
  nextVisiting.add(String(speciesKey));
  var minimum = parents.reduce(function (requiredLevel, link) {
    var parent = SPECIES_LIBRARY[link.parentKey];
    var triggerLevel = link.trigger.kind === "level"
      ? Number(link.trigger.level) || 101
      : Math.max(5, Number(parent && parent.encounter && parent.encounter.minLevel) || 5);
    return Math.max(requiredLevel, triggerLevel, minimumPokemonRewardLevel(link.parentKey, nextVisiting));
  }, 5);
  nextVisiting.delete(String(speciesKey));
  return minimum;
}

function isItemAlreadyOwned(item, inventory) {
  if (!shoppingCenterItemIsSinglePurchase(item)) return false;
  return (inventory || []).some(function (entry) {
    return Array.isArray(entry) && Number(entry[0]) === Number(item.index) && Number(entry[1]) > 0;
  });
}

function closeMissionChoiceMenu() {
  if (missionChoiceCleanup) {
    missionChoiceCleanup();
    missionChoiceCleanup = null;
  }
  var existing = root.querySelector("[data-pokefan-choice-panel]");
  if (existing) {
    existing.remove();
  }
}

function missionChoiceEntries(mission) {
  var reward = mission && mission.reward || {};
  var badges = Math.max(0, Math.min(8, Number(state.trainerInfo && state.trainerInfo[2]) || 0));
  if (reward.kind === "pokemon_choice") {
    var level = reward.levelMode === "badge_cap" ? levelLimitForBadges(badges) : 5;
    return Object.keys(SPECIES_LIBRARY).map(function (speciesKey) {
      var species = SPECIES_LIBRARY[speciesKey];
      var encounter = species && species.encounter || {};
      return species && encounter.rarity !== "legendary" && (!reward.excludeFossils || encounter.rarity !== "fossil")
        && minimumPokemonRewardLevel(speciesKey) <= level
        ? { kind: "pokemon", speciesKey: speciesKey, level: level, label: speciesDisplayName(speciesKey) + " (" + t("common.units.levelShort") + ". " + level + ")" }
        : null;
    }).filter(Boolean).sort(function (left, right) { return left.label.localeCompare(right.label, getLocale()); });
  }
  return (reward.choices || []).filter(function (choice) {
    var item = getItemByIndex(choice.itemIndex);
    return !reward.purchasableNow || !item || tmUnlockBadges(item) <= badges;
  });
}

function openMissionChoiceMenu(anchorElement, mission) {
  var backdrop = document.createElement("div");
  var panel = document.createElement("section");
  var title = document.createElement("h3");
  var list = document.createElement("div");
  closeMissionChoiceMenu();
  pendingMissionChoice = { missionIndex: mission.missionIndex };
  backdrop.className = "pokefan-choice-backdrop";
  backdrop.dataset.pokefanChoicePanel = "true";
  backdrop.dataset.action = "pokefan-choice-close";
  panel.className = "pokefan-choice-panel";
  panel.style.left = "0";
  panel.style.top = "0";
  panel.style.visibility = "hidden";
  title.className = "pokefan-choice-title";
  title.textContent = t("ui.pokefan.chooseReward");
  list.className = "pokefan-choice-list";
  missionChoiceEntries(mission).forEach(function (choice) {
    var item = getItemByIndex(choice.itemIndex);
    if (item && isItemAlreadyOwned(item, state.inventory)) return;
    var choiceButton = document.createElement("button");
    choiceButton.type = "button";
    choiceButton.className = "pokefan-choice-button";
    choiceButton.dataset.action = "pokefan-choice-pick";
    choiceButton.dataset.missionIndex = String(mission.missionIndex);
    if (choice.kind === "pokemon") {
      choiceButton.dataset.speciesKey = String(choice.speciesKey);
    } else {
      choiceButton.dataset.itemIndex = String(choice.itemIndex);
    }
    choiceButton.textContent = choice.kind === "pokemon"
      ? choice.label
      : item ? itemDisplayName(item) : t("ui.pokefan.fallbackReward");
    list.appendChild(choiceButton);
  });
  panel.appendChild(title);
  panel.appendChild(list);
  backdrop.appendChild(panel);
  root.appendChild(backdrop);

  function syncPosition() {
    if (!anchorElement || !anchorElement.isConnected || !panel.isConnected) {
      closeMissionChoiceMenu();
      return;
    }
    var rect = anchorElement.getBoundingClientRect();
    panel.style.left = Math.round(rect.left + rect.width / 2) + "px";
    panel.style.top = Math.round(rect.bottom + 10) + "px";
    panel.style.visibility = "";
  }

  syncPosition();
  window.addEventListener("scroll", syncPosition, true);
  window.addEventListener("resize", syncPosition);
  missionChoiceCleanup = function () {
    window.removeEventListener("scroll", syncPosition, true);
    window.removeEventListener("resize", syncPosition);
  };
}

function showClaimError(message) {
  var localizedMessage = message || messageDescriptor("pokefan.claimFailed");
  setMissionError(localizedMessage);
  openMessage([localizedMessage], { title: messageDescriptor("pokefan.title") });
  renderRegions(["pokefan-content"]);
}

function commitMissionClaim(mission, selectedReward) {
  var claimPromise = claimMission(mission.missionIndex, selectedReward);
  renderRegions(["pokefan-content"]);
  claimPromise.then(function (result) {
    if (!result.ok) {
      showClaimError(messageDescriptor("pokefan.claimFailed"));
      return;
    }
    if (selectedReward && selectedReward.kind === "pokemon" && result.projection) {
      applyPlayerSave(saveFromAuthoritativeProjection(result.projection));
      state.missions.claimedNoticeMissionIndex = mission.missionIndex;
      broadcastTeamBoxRuntimeState();
    }
    renderRegions(["pokefan-content"]);
  });
}

registerAction("pokefan-section", function (element) {
  var section = String(element.dataset.section || "");
  if (missionCategories().indexOf(section) === -1 || !state.scene || state.scene.name !== "city-fanclub") {
    return;
  }
  state.scene.pokefanSection = section;
  state.missions.claimedNoticeMissionIndex = null;
  renderRegions(["pokefan-content"]);
});

registerAction("open-completed-mission", function () {
  setScene({ name: "city-fanclub", pokefanSection: MISSION_CATEGORY_DAILY });
});

registerAction("pokefan-claim-mission", function (element) {
  var missionIndex;
  var mission;
  var runtimeMission;
  if (!requireNotInBattle()) return;
  missionIndex = Number(element.dataset.missionIndex);
  mission = missionCatalogByIndex(missionIndex);
  runtimeMission = missionByIndex(missionIndex);
  if (!mission || !runtimeMission) {
    showClaimError(messageDescriptor("pokefan.missionNotFound"));
    return;
  }
  if (Number(runtimeMission.counter) < Number(mission.target)) {
    showClaimError(messageDescriptor("pokefan.missionIncomplete"));
    return;
  }
  if (mission.reward && (mission.reward.kind === "choice" || mission.reward.kind === "pokemon_choice")) {
    openMissionChoiceMenu(element, mission);
    return;
  }
  commitMissionClaim(mission, null);
});

registerAction("pokefan-debug-complete-mission", async function (element) {
  var missionIndex;
  var mission;
  var runtimeMission;
  var result;
  var playerState;
  if (!requireNotInBattle() || false || !isDebugUser()) return;
  if (state.missions.debugCompletingMissionIndex != null) return;
  missionIndex = Number(element.dataset.missionIndex);
  mission = missionCatalogByIndex(missionIndex);
  runtimeMission = missionByIndex(missionIndex);
  if (!mission || !runtimeMission || !missionIsActive(runtimeMission)
    || runtimeMission.claimStatus !== "unclaimed" || Number(runtimeMission.counter) >= Number(mission.target)) {
    showClaimError(messageDescriptor("pokefan.debugUnavailable"));
    return;
  }
  state.missions.debugCompletingMissionIndex = missionIndex;
  state.missions.error = "";
  renderRegions(["pokefan-content"]);
  try {
    result = await completeAuthoritativeDebugMission({
      expectedPlayerRevision: state.authoritativeRevision,
      missionIndex: missionIndex
    });
  } catch (error) {
    state.missions.debugCompletingMissionIndex = null;
    showClaimError(messageDescriptor("pokefan.debugFailed"));
    return;
  }
  state.missions.debugCompletingMissionIndex = null;
  playerState = authoritativeDebugPlayerState(result);
  if (!playerState) {
    if (result && result.code === "revision_conflict") {
      var refreshed = await getCurrentPlayerState();
      if (refreshed.ok && refreshed.projection && refreshed.projection.has_player) {
        applyPlayerSave(saveFromAuthoritativeProjection(refreshed.projection));
        showClaimError(messageDescriptor("pokefan.debugStateChanged"));
        return;
      }
      showClaimError(messageDescriptor("pokefan.debugRefreshFailed"));
      return;
    }
    showClaimError(messageDescriptor("pokefan.debugFailed"));
    return;
  }
  applyPlayerSave(saveFromAuthoritativeProjection(playerState));
  renderRegions(["pokefan-content"]);
});

registerAction("pokefan-choice-close", function () {
  pendingMissionChoice = null;
  closeMissionChoiceMenu();
});

registerAction("pokefan-choice-pick", function (element) {
  var missionIndex = Number(element.dataset.missionIndex);
  var itemIndex = Number(element.dataset.itemIndex);
  var speciesKey = String(element.dataset.speciesKey || "");
  var mission = missionCatalogByIndex(missionIndex);
  var choice = missionChoiceEntries(mission).find(function (entry) {
    return speciesKey ? String(entry.speciesKey || "") === speciesKey : Number(entry.itemIndex) === itemIndex;
  }) || null;
  if (!pendingMissionChoice || Number(pendingMissionChoice.missionIndex) !== missionIndex || !choice) {
    closeMissionChoiceMenu();
    return;
  }
  pendingMissionChoice = null;
  closeMissionChoiceMenu();
  commitMissionClaim(mission, choice);
});
