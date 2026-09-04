import { registerAction } from "./action-registry.js";
import { battleReturnScene } from "./battle-handler.js";
import { enforceBattleRuntimeSceneLock } from "./battle-scene-lock.js";
import {
  render,
  setScene,
  setHtml,
  syncRulesHeadingButtonWidths
} from "./renderer.js";
import { applyTrainingDailyLimits, root, state } from "./game-state.js";
import { createCaptureScene } from "./router.js";
import { renderRulesContent, rulesSectionByKey } from "../view/rules.js";
import { clearGardenHarvestNotices, refreshDailyBerryLimit } from "./garden-handler.js";
import { refreshMissionState } from "./mission-runtime.js";
import { playerCanAccessZone } from "../data/zone-access-rules.js";
import { loadTrainingDailyLimits } from "../api/training-zone.js";
import { kantoEliteFourChallengeStatus } from "../data/gyms.js";
import { currentUserIsAdmin } from "./admin-auth.js";
import { isDebugUser } from "./debug-tools.js";
import { discardPreparedAuthoritativeTraining } from "./training-zone-handler.js";
import { t } from "./i18n.js";

registerAction("open-team", function(element) {
    setScene({ name: "team" });
    return;

});

registerAction("open-zones", function(element) {
    setScene({ name: "zones" });
    return;

});

registerAction("open-rules", function(element) {
    setScene({ name: "rules", rulesSection: "gdr" });
    return;

});

registerAction("open-privacy-policy", function(element) {
    setScene({ name: "privacy-policy" });
    return;

});

registerAction("open-terms", function(element) {
    setScene({ name: "terms" });
    return;

});

registerAction("open-styles", function(element) {
    if (!isDebugUser()) {
      setScene({ name: "home" });
      return;
    }
    setScene({ name: "styles" });
    return;

});

registerAction("open-city", function(element) {
    setScene({ name: "city" });
    return;

});

registerAction("open-battle-area", function(element) {
    setScene({ name: "battle-area" });
    return;

});

registerAction("open-battle-tower", function(element) {
    setScene({ name: "battle-tower" });
    return;

});

registerAction("open-battle-shop", function(element) {
    setScene({ name: "battle-shop" });
    return;

});

registerAction("open-battle-dome", function() {
    setScene({ name: "battle-dome" });
});

registerAction("open-battle-dome-lobby", function() {
    setScene({ name: "battle-dome", battleDomeTab: "lobby" });
});

registerAction("open-city-pokemon-center", function(element) {
    setScene({
      name: "pokemon-center",
      centerMode: "assign-held",
      pokemonIndex: null,
      moveIndex: null,
      targetKind: "pokemon",
      itemIndex: null,
      notice: ""
    });
    enforceBattleRuntimeSceneLock();
    return;

});

registerAction("open-battle-training-zone", function(element) {
    setScene({ name: "training-zone", trainingDifficulty: "", trainingOpponentTeam: [], trainingOpponent: null, trainingPreparedBattle: null });
    loadTrainingDailyLimits().then(function (result) {
      if (result.ok) {
        applyTrainingDailyLimits(result.rows);
        render();
      }
    });
    enforceBattleRuntimeSceneLock();
    return;

});

registerAction("open-city-daycare", function(element) {
    setScene({ name: "city-daycare", daycareDepositSlotIndex: null });
    import("./daycare-handler.js").then(function (module) {
      module.refreshDaycare();
    });
    return;

});

registerAction("open-city-shopping-center", function(element) {
    setScene({ name: "shopping-center", shoppingCenterSection: "" });
    return;

});

registerAction("open-city-fanclub", function(element) {
    setScene({ name: "city-fanclub" });
    refreshMissionState();
    return;

});

registerAction("open-city-garden", function(element) {
    clearGardenHarvestNotices();
    setScene({ name: "city-garden" });
    refreshDailyBerryLimit();
    return;

});

registerAction("back-home", function(element) {
    if (currentUserIsAdmin()) {
      setScene({ name: "admin-home" });
      return;
    }
    setScene({ name: "home" });
    return;

});

registerAction("parent-back", function(element) {
    if (state.scene.name === "battle-dome-battle") {
      state.battleDome.tab = "lobby";
      setScene({ name: "battle-dome" });
      return;
    }
    if (state.scene.name === "privacy-policy" || state.scene.name === "terms") {
      setScene({ name: "home" });
      return;
    }
    if (state.scene.name === "training-zone" && state.scene.trainingPreparedBattle) {
      discardPreparedAuthoritativeTraining(state.scene).then(function (discarded) {
        if (discarded && state.scene && state.scene.name === "training-zone") {
          setScene({ name: "battle-area" });
        }
      });
      return;
    }
    if (state.scene.name === "training-zone") {
      setScene({ name: "battle-area" });
      return;
    }
    if (state.scene.name === "battle-tower" || state.scene.name === "battle-shop" || state.scene.name === "battle-dome") {
      setScene({ name: "battle-area" });
      return;
    }
    if (state.scene.name === "pokemon-center" || state.scene.name === "shopping-center" || state.scene.name === "city-daycare" || state.scene.name === "city-garden" || state.scene.name === "city-fanclub") {
      setScene({ name: "city" });
      return;
    }
    if (state.scene.name === "gym-city") {
      setScene({ name: "gyms" });
      return;
    }
    if (state.scene.name === "capture") {
      setScene({ name: "zones" });
      return;
    }
    if (state.scene.name === "battle") {
      setScene(battleReturnScene(state.scene));
      return;
    }
    if (state.scene.name === "admin-battle") {
      setScene({ name: "admin-battles" });
      import("./admin-battle-handler.js").then(function (module) {
        module.refreshAdminBattles();
      });
      return;
    }
    if (state.scene.name === "admin-battles" || state.scene.name === "admin-battle-restore") {
      setScene({ name: "admin-home" });
      return;
    }
    setScene(currentUserIsAdmin() ? { name: "admin-home" } : { name: "home" });
    return;

});

registerAction("open-box", function(element) {
    setScene({ name: "box" });
    return;

});

registerAction("open-zone", function(element) {
    var zoneName = element.dataset.zone;
    if (!playerCanAccessZone(state.inventory, zoneName)) {
      openClosedSectionRequirementPanel(element, t("ui.zoneAccess." + zoneName));
      return;
    }
    setScene(createCaptureScene(zoneName));
    enforceBattleRuntimeSceneLock();
    return;

});

var zoneRequirementPanelCleanup = null;
var zoneRequirementPanelFrame = null;

registerAction("zone-requirement-close", function () {
  closeClosedSectionRequirementPanel();
});

root.addEventListener("click", function (event) {
  var panel = root.querySelector("[data-zone-requirement-panel]");
  if (panel && !panel.contains(event.target)) {
    closeClosedSectionRequirementPanel();
  }
}, true);

function closeClosedSectionRequirementPanel() {
  var existingPanel = root.querySelector("[data-zone-requirement-panel]");
  if (zoneRequirementPanelCleanup) {
    zoneRequirementPanelCleanup();
    zoneRequirementPanelCleanup = null;
  }
  if (zoneRequirementPanelFrame) {
    window.cancelAnimationFrame(zoneRequirementPanelFrame);
    zoneRequirementPanelFrame = null;
  }
  if (existingPanel) {
    existingPanel.remove();
  }
}
function positionClosedSectionRequirementPanel(anchorElement) {
  var rect = anchorElement.getBoundingClientRect();
  return {
    left: Math.round(rect.left + rect.width / 2),
    top: Math.round(rect.top + rect.height / 2)
  };
}

function openClosedSectionRequirementPanel(anchorElement, message) {
  var panel = document.createElement("section");
  var emptyMessage = document.createElement("div");

  closeClosedSectionRequirementPanel();

  panel.className = "floating-panel is-empty";
  panel.dataset.zoneRequirementPanel = "true";
  panel.style.left = "0";
  panel.style.top = "0";
  panel.style.transform = "translate(-50%, -50%)";
  panel.style.visibility = "hidden";

  emptyMessage.className = "floating-panel-empty";
  emptyMessage.textContent = message;
  panel.appendChild(emptyMessage);

  root.appendChild(panel);

  function syncClosedSectionRequirementPanelPosition() {
    var nextPosition;
    if (!anchorElement.isConnected || !panel.isConnected) {
      closeClosedSectionRequirementPanel();
      return;
    }
    nextPosition = positionClosedSectionRequirementPanel(anchorElement);
    panel.style.left = nextPosition.left + "px";
    panel.style.top = nextPosition.top + "px";
    panel.style.visibility = "";
  }

  syncClosedSectionRequirementPanelPosition();
  function scheduleClosedSectionRequirementPanelPosition() {
    if (zoneRequirementPanelFrame) {
      return;
    }
    zoneRequirementPanelFrame = window.requestAnimationFrame(function () {
      zoneRequirementPanelFrame = null;
      syncClosedSectionRequirementPanelPosition();
    });
  }

  window.addEventListener("scroll", scheduleClosedSectionRequirementPanelPosition, true);
  window.addEventListener("resize", scheduleClosedSectionRequirementPanelPosition);
  zoneRequirementPanelCleanup = function () {
    window.removeEventListener("scroll", scheduleClosedSectionRequirementPanelPosition, true);
    window.removeEventListener("resize", scheduleClosedSectionRequirementPanelPosition);
  };
}

registerAction("open-gyms", function(element) {
    setScene({ name: "gyms" });
    return;

});

registerAction("open-admin-home", function(element) {
    setScene({ name: "admin-home" });
    return;

});

registerAction("open-gym-city", function(element) {
    var cityKey = String(element.dataset.city || "");
    var leagueStatus = kantoEliteFourChallengeStatus(state.trainerInfo[2]);
    if ((cityKey === "elite_four" || cityKey === "kanto_champion") && leagueStatus.state === "locked") {
      var requiredBadge = leagueStatus.requiredBadgeKey
        ? t("ui.gyms.badges." + leagueStatus.requiredBadgeKey)
        : "";
      openClosedSectionRequirementPanel(
        element,
        t("ui.gyms.requirements." + leagueStatus.reason, { badge: requiredBadge })
      );
      return;
    }
    setScene({ name: "gym-city", cityKey: cityKey });
    return;

});

registerAction("rules-section", function(element) {
    if (state.scene && state.scene.name === "rules") {
      updateRulesSectionDom(element.dataset.section);
    }
    return;

});

registerAction("rules-heading-jump", function(element) {
    var headingId = String(element.dataset.headingId || "");
    var content = root.querySelector("[data-rules-content]");
    var heading = headingId ? document.getElementById(headingId) : null;
    var contentRect;
    var headingRect;
    if (!content || !heading || !content.contains(heading)) {
      return;
    }
    contentRect = content.getBoundingClientRect();
    headingRect = heading.getBoundingClientRect();
    content.scrollTop = content.scrollTop + headingRect.top - contentRect.top;
    return;

});

registerAction("rules-scroll-top", function() {
    var content = root.querySelector("[data-rules-content]");
    if (content) {
      content.scrollTop = 0;
    }
    window.scrollTo(0, 0);
    return;

});

registerAction("rules-move-wiki", function() {
    var input = document.getElementById("rules-move-input");
    if (input && input.value.trim()) {
      var name = input.value.trim().replace(/ /g, "_");
      window.open("https://wiki.pokemoncentral.it/" + name + "/Mosse_apprese_in_terza_generazione", "_blank");
    }
    return;

});

registerAction("rules-move-copy-link", function() {
    var input = document.getElementById("rules-move-input");
    if (input && input.value.trim()) {
      var name = input.value.trim().replace(/ /g, "_");
      var url = "https://wiki.pokemoncentral.it/" + name + "/Mosse_apprese_in_terza_generazione";
      navigator.clipboard.writeText(url).catch(function() {
        var ta = document.createElement("textarea");
        ta.value = url;
        ta.style.position = "fixed"; ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      });
      var btn = document.getElementById("rules-move-copy-btn");
      if (btn) {
        btn.classList.add("show-copy-tooltip");
        clearTimeout(btn._copyTooltipTimer);
        btn._copyTooltipTimer = setTimeout(function() {
          btn.classList.remove("show-copy-tooltip");
        }, 4000);
      }
    }
    return;

});

function updateRulesSectionDom(sectionKey) {
  var nextSection = rulesSectionByKey(sectionKey);
  var content = root.querySelector("[data-rules-content]");
  if (!state.scene || state.scene.name !== "rules") {
    return;
  }
  state.scene.rulesSection = nextSection.key;
  root.querySelectorAll('[data-action="rules-section"]').forEach(function (btn) {
    var isSelected = btn.dataset.section === nextSection.key;
    btn.classList.toggle("button-primary", isSelected);
    btn.classList.toggle("button-ghost", !isSelected);
  });
  if (content) {
    setHtml(content, renderRulesContent(nextSection.key));
    syncRulesHeadingButtonWidths(content);
    content.scrollTop = 0;
  }
}
