import { getItemByIndex } from "../data/items.js";
import { SPECIES_LIBRARY } from "../data/index.js";
import { levelLimitForBadges, mtUnlockBadges } from "../data/progression.js";
import { shoppingCenterItemIsSinglePurchase } from "../data/shopping-center.js";
import { requireNotInBattle } from "./battle-scene-lock.js";
import { registerAction } from "./action-registry.js";
import { openMessage } from "./dialog-handler.js";
import { claimMission, missionByIndex, missionCatalogByIndex, missionCategories, missionIsActive, setMissionError } from "./mission-runtime.js";
import { render, setScene } from "./renderer.js";
import { applyPlayerSave, root, state } from "./game-state.js";
import { completeAuthoritativeDebugMission } from "../api/debug.js";
import { authoritativeDebugPlayerState } from "../api/debug-contract.js";
import { saveFromAuthoritativeProjection } from "../api/player.js";
import { isDebugUser } from "./debug-tools.js";
import { MISSION_CATEGORY_ADVENTURE, MISSION_CATEGORY_DAILY } from "../data/pokefan-missions.js";
import { getCurrentPlayerState } from "../api/player-command.js";
import { broadcastTeamBoxRuntimeState } from "./runtime-state.js";

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
  if (reward.kind === "pokemon-choice") {
    var level = reward.levelMode === "badge-cap" ? levelLimitForBadges(badges) : 5;
    return Object.keys(SPECIES_LIBRARY).map(function (speciesKey) {
      var species = SPECIES_LIBRARY[speciesKey];
      var encounter = species && species.encounter || {};
      return species && encounter.rarity !== "l" && (!reward.excludeFossils || encounter.rarity !== "f")
        && minimumPokemonRewardLevel(speciesKey) <= level
        ? { kind: "pokemon", speciesKey: speciesKey, level: level, label: species.name + " (Lv. " + level + ")" }
        : null;
    }).filter(Boolean).sort(function (left, right) { return left.label.localeCompare(right.label, "it"); });
  }
  return (reward.choices || []).filter(function (choice) {
    var item = getItemByIndex(choice.itemIndex);
    return !reward.purchasableNow || !item || mtUnlockBadges(item) <= badges;
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
  title.textContent = "Scegli la ricompensa";
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
    choiceButton.textContent = choice.label || (item ? item.name : "Ricompensa");
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
  setMissionError(message || "Riscossione non riuscita.");
  openMessage([message || "Riscossione non riuscita. Riprova."], { title: "Club Pokéfan" });
  render();
}

function commitMissionClaim(mission, selectedReward) {
  var claimPromise = claimMission(mission.missionIndex, selectedReward);
  render();
  claimPromise.then(function (result) {
    if (!result.ok) {
      showClaimError(result.message);
      return;
    }
    if (selectedReward && selectedReward.kind === "pokemon" && result.projection) {
      applyPlayerSave(saveFromAuthoritativeProjection(result.projection));
      state.missions.claimedNoticeMissionIndex = mission.missionIndex;
      broadcastTeamBoxRuntimeState();
    }
    render();
  });
}

registerAction("pokefan-section", function (element) {
  var section = String(element.dataset.section || "");
  if (missionCategories().indexOf(section) === -1 || !state.scene || state.scene.name !== "city-fanclub") {
    return;
  }
  state.scene.pokefanSection = section;
  state.missions.claimedNoticeMissionIndex = null;
  render();
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
    showClaimError("Missione non trovata.");
    return;
  }
  if (Number(runtimeMission.counter) < Number(mission.target)) {
    showClaimError("Missione non ancora completata.");
    return;
  }
  if (mission.reward && (mission.reward.kind === "choice" || mission.reward.kind === "pokemon-choice")) {
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
    showClaimError("La missione non può essere completata con il comando debug.");
    return;
  }
  state.missions.debugCompletingMissionIndex = missionIndex;
  state.missions.error = "";
  render();
  try {
    result = await completeAuthoritativeDebugMission({
      expectedPlayerRevision: state.authoritativeRevision,
      missionIndex: missionIndex
    });
  } catch (error) {
    state.missions.debugCompletingMissionIndex = null;
    showClaimError(error && error.message || "Completamento debug della missione non riuscito.");
    return;
  }
  state.missions.debugCompletingMissionIndex = null;
  playerState = authoritativeDebugPlayerState(result);
  if (!playerState) {
    if (result && result.code === "revision_conflict") {
      var refreshed = await getCurrentPlayerState();
      if (refreshed.ok && refreshed.projection && refreshed.projection.has_player) {
        applyPlayerSave(saveFromAuthoritativeProjection(refreshed.projection));
        showClaimError("Lo stato del giocatore è cambiato. Dati aggiornati: riprova il comando debug.");
        return;
      }
      showClaimError("Lo stato del giocatore è cambiato e non è stato possibile aggiornarlo. Ricarica prima di riprovare.");
      return;
    }
    showClaimError(result && result.message || "Completamento debug della missione non riuscito.");
    return;
  }
  applyPlayerSave(saveFromAuthoritativeProjection(playerState));
  render();
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
