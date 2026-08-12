import { applyPlayerSave, state, root } from "./game-state.js";
import { enforceBattleRuntimeSceneLock } from "./battle-scene-lock.js";
import { battleReturnScene, handleBattleRuntimeChange, openActiveProgressionScene, refreshActiveBattleFromDb, resumeBattleSceneFollowup } from "./battle-handler.js";
import { handleTeamBoxRuntimeChange } from "./team-handler.js";
import { handleAction } from "./action-registry.js";
import "./action-bootstrap.js";
import { initializeBattleRuntime, onBattleRuntimeChange } from "./battle-scene-lock.js";
import { broadcastAuthoritativeRevision, initializeTeamBoxRuntime } from "./runtime-state.js";
import { handleCaptureEncounterRuntimeInvalidation, initializeCaptureEncounterRuntime } from "./capture-handler.js";
import { setScene } from "./renderer.js";
import { bindHistoryNavigation } from "./router.js";
import { initializeSession } from "./session.js";
import { getResolvedInventoryItem } from "../data/items.js";
import { currentUserIsAdmin } from "./admin-auth.js";
import { openAdminBattle, refreshAdminBattles } from "./admin-battle-handler.js";
import { initializeHeldItemTooltip } from "./held-item-tooltip.js";
import { initializeAppVersionWatcher, setupAppVersionWatch } from "./app-version.js";
import { saveFromAuthoritativeProjection } from "../api/player.js";
import { PLAYER_REVISION_SYNC_EVENT } from "../api/player-command.js";

function clearCaptureSearchErrorInline() {
  state.scene.searchError = "";
  var levelHint = root.querySelector("[data-capture-level-hint]");
  if (levelHint) {
    levelHint.classList.remove("is-invalid");
  }
}

var globalNavDrag = null;
var suppressGlobalNavClick = false;
var suppressGlobalNavClickTimer = null;
var GLOBAL_NAV_MARGIN = 10;
var skipBattleLockOnce = false;

function isPublicLegalScene(scene) {
  return scene && (scene.name === "privacy-policy" || scene.name === "terms");
}

initializeHeldItemTooltip(root);

window.addEventListener(PLAYER_REVISION_SYNC_EVENT, function (event) {
  var detail = event && event.detail || {};
  var projection = detail.projection;
  var revision = Math.max(0, Number(projection && projection.revision) || Number(detail.revision) || 0);
  if (detail.conflict && projection && projection.has_player && !state.activeBattle && !state.inBattle) {
    applyPlayerSave(saveFromAuthoritativeProjection(projection));
    revision = state.authoritativeRevision;
  } else if (revision > (Number(state.authoritativeRevision) || 0)) {
    state.authoritativeRevision = revision;
  }
  if (revision > 0) broadcastAuthoritativeRevision(revision);
});


function clampGlobalNavPosition(left, top, nav) {
  var trigger = nav.querySelector(".global-nav-trigger");
  var navRect = nav.getBoundingClientRect();
  var triggerRect = trigger ? trigger.getBoundingClientRect() : navRect;
  var minLeft = GLOBAL_NAV_MARGIN;
  var minTop = GLOBAL_NAV_MARGIN;
  var maxLeft = window.innerWidth - triggerRect.width - GLOBAL_NAV_MARGIN;
  var maxTop = window.innerHeight - triggerRect.height - GLOBAL_NAV_MARGIN;
  var menu;
  var menuRect;
  var menuOffsetLeft;
  var menuOffsetTop;

  if (nav.open) {
    menu = nav.querySelector(".global-nav-menu");
    menuRect = menu ? menu.getBoundingClientRect() : null;
    if (menuRect && menuRect.width && menuRect.height) {
      menuOffsetLeft = menuRect.left - navRect.left;
      menuOffsetTop = menuRect.top - navRect.top;
      minLeft = GLOBAL_NAV_MARGIN - menuOffsetLeft;
      maxLeft = window.innerWidth - menuOffsetLeft - menuRect.width - GLOBAL_NAV_MARGIN;
      maxTop = window.innerHeight - menuOffsetTop - menuRect.height - GLOBAL_NAV_MARGIN;
    }
  }

  return {
    left: Math.min(Math.max(minLeft, left), Math.max(minLeft, maxLeft)),
    top: Math.min(Math.max(minTop, top), Math.max(minTop, maxTop))
  };
}

function setGlobalNavPosition(left, top, nav) {
  var position = clampGlobalNavPosition(left, top, nav);
  root.style.setProperty("--global-nav-left", position.left + "px");
  root.style.setProperty("--global-nav-top", position.top + "px");
}

function finishGlobalNavDrag(event) {
  if (!globalNavDrag) {
    return;
  }

  if (globalNavDrag.moved) {
    suppressGlobalNavClick = true;
    if (suppressGlobalNavClickTimer) {
      window.clearTimeout(suppressGlobalNavClickTimer);
    }
    suppressGlobalNavClickTimer = window.setTimeout(function () {
      suppressGlobalNavClick = false;
      suppressGlobalNavClickTimer = null;
    }, 350);
    event.preventDefault();
  }
  globalNavDrag.nav.classList.remove("is-dragging");
  if (globalNavDrag.trigger.releasePointerCapture) {
    try {
      globalNavDrag.trigger.releasePointerCapture(globalNavDrag.pointerId);
    } catch (error) {
      // Pointer capture may already be gone if the browser cancelled the gesture.
    }
  }
  globalNavDrag = null;
}

root.addEventListener("pointerdown", function (event) {
  var trigger = event.target.closest(".global-nav-trigger");
  if (!trigger || event.button > 0) {
    return;
  }

  event.preventDefault();
  var nav = trigger.closest(".global-nav");
  var rect = trigger.getBoundingClientRect();
  globalNavDrag = {
    trigger: trigger,
    nav: nav,
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    offsetX: event.clientX - rect.left,
    offsetY: event.clientY - rect.top,
    moved: false
  };

  if (trigger.setPointerCapture) {
    trigger.setPointerCapture(event.pointerId);
  }
});

root.addEventListener("pointermove", function (event) {
  if (!globalNavDrag || event.pointerId !== globalNavDrag.pointerId) {
    return;
  }

  var deltaX = event.clientX - globalNavDrag.startX;
  var deltaY = event.clientY - globalNavDrag.startY;
  if (!globalNavDrag.moved && Math.hypot(deltaX, deltaY) < 6) {
    return;
  }

  globalNavDrag.moved = true;
  globalNavDrag.nav.classList.add("is-dragging");
  event.preventDefault();
  setGlobalNavPosition(
    event.clientX - globalNavDrag.offsetX,
    event.clientY - globalNavDrag.offsetY,
    globalNavDrag.nav
  );
});

root.addEventListener("pointerup", finishGlobalNavDrag);
root.addEventListener("pointercancel", finishGlobalNavDrag);

root.addEventListener("dragstart", function (event) {
  if (!event.target.closest(".global-nav-trigger")) {
    return;
  }
  event.preventDefault();
});

root.addEventListener("toggle", function (event) {
  var nav = event.target;
  if (!nav.matches || !nav.matches(".global-nav") || !nav.open) {
    return;
  }

  var trigger = nav.querySelector(".global-nav-trigger");
  var rect = trigger ? trigger.getBoundingClientRect() : nav.getBoundingClientRect();
  setGlobalNavPosition(rect.left, rect.top, nav);
}, true);

root.addEventListener("click", function (event) {
  var trigger = event.target.closest(".global-nav-trigger");
  var nav;
  var rect;

  if (!trigger) {
    return;
  }

  event.preventDefault();
  event.stopImmediatePropagation();
  if (suppressGlobalNavClick) {
    suppressGlobalNavClick = false;
    if (suppressGlobalNavClickTimer) {
      window.clearTimeout(suppressGlobalNavClickTimer);
      suppressGlobalNavClickTimer = null;
    }
    return;
  }

  nav = trigger.closest(".global-nav");
  nav.open = !nav.open;
  if (nav.open) {
    rect = trigger.getBoundingClientRect();
    setGlobalNavPosition(rect.left, rect.top, nav);
  }
}, true);

root.addEventListener("click", function (event) {
  var choiceOption = event.target.closest(".choice-menu-option");
  if (choiceOption) {
    var choiceMenu = choiceOption.closest(".choice-menu");
    if (choiceMenu) {
      choiceMenu.open = false;
    }
  }

  root.querySelectorAll(".global-nav[open]").forEach(function (nav) {
    if (!nav.contains(event.target)) {
      nav.open = false;
    }
  });

  root.querySelectorAll(".choice-menu[open]").forEach(function (menu) {
    if (!menu.contains(event.target)) {
      menu.open = false;
    }
  });

  root.querySelectorAll(".user-settings[open]").forEach(function (menu) {
    if (!menu.contains(event.target)) {
      menu.open = false;
    }
  });

  var target = event.target.closest("[data-action]");
  if (!target || target.disabled) {
    return;
  }
  if (target.classList.contains("dialog-backdrop") && event.target !== target) {
    return;
  }
  if (target.matches("a[href]")) {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
  }
  handleAction(target.dataset.action, target);
});

root.addEventListener("submit", function (event) {
  if (!event.target.matches("[data-auth-form]")) {
    return;
  }
  event.preventDefault();
  handleAction(event.target.dataset.authSubmitAction || "auth-login", event.target);
});

root.addEventListener("keydown", function (event) {
  if (event.key === "Enter" && state.scene.name === "box" && event.target.closest(".box-filter-row")) {
    event.preventDefault();
    handleAction("box-filter-apply", event.target);
    return;
  }

  if (event.key === "Enter" && state.scene.name === "capture" && (event.target.closest(".capture-type-menu") || event.target.closest(".capture-range-menu") || event.target.matches('[data-field="capture-level"]'))) {
    event.preventDefault();
    handleAction("capture-search", event.target);
    return;
  }

  if (event.key !== "Enter" || !event.target.closest("[data-auth-form]")) {
    return;
  }
  event.preventDefault();
  var authForm = event.target.closest("[data-auth-form]");
  handleAction(authForm.dataset.authSubmitAction || "auth-login", authForm);
});

root.addEventListener("change", function (event) {
  if ((state.scene.name === "box" && event.target.matches('[name="box-filter-type"]')) || (state.scene.name === "capture" && event.target.matches('[name="capture-search-type"], [name="capture-search-range"]'))) {
    var typeMenu = event.target.closest(".choice-menu");
    var selectedOption = event.target.closest(".choice-menu-option");
    var summary = typeMenu ? typeMenu.querySelector(".choice-menu-summary") : null;
    var selectedImage = selectedOption ? selectedOption.querySelector("img") : null;
    var selectedLabel = selectedOption ? selectedOption.querySelector("span") : null;

    if (typeMenu) {
      typeMenu.querySelectorAll(".choice-menu-option").forEach(function (option) {
        option.classList.remove("is-active");
      });
      if (selectedOption) {
        selectedOption.classList.add("is-active");
      }
    }

    if (summary) {
      summary.innerHTML = "";
      if (selectedImage) {
        summary.appendChild(selectedImage.cloneNode(true));
      } else if (selectedLabel) {
        summary.textContent = selectedLabel.textContent;
      } else {
        var placeholder = document.createElement("span");
        placeholder.className = "choice-menu-placeholder";
        placeholder.textContent = state.scene.name === "capture" ? "Tipo" : "Tutti";
        summary.appendChild(placeholder);
      }
    }

    if (typeMenu) {
      typeMenu.open = false;
    }

    if (state.scene.name === "capture") {
      if (event.target.matches('[name="capture-search-range"]')) {
        state.scene.selectedRangeIndex = Number(event.target.value) || 0;
      } else {
        state.scene.selectedType = event.target.value;
      }
      if (state.scene.searchError) {
        clearCaptureSearchErrorInline();
      }
    }
    return;
  }

  if (state.scene.name === "capture" && event.target.matches('[data-field="capture-level"]')) {
    state.scene.levelText = event.target.value.replace(/\D/g, "").slice(0, 2);
    event.target.value = state.scene.levelText;
    clearCaptureSearchErrorInline();
    return;
  }

  if (state.scene.name === "capture" && event.target.matches('[name="capture-use-white-flute"], [name="capture-use-black-flute"]')) {
    if (event.target.matches('[name="capture-use-white-flute"]')) {
      state.scene.useWhiteFlute = event.target.checked;
    } else {
      state.scene.useBlackFlute = event.target.checked;
    }
    clearCaptureSearchErrorInline();
    return;
  }
});

root.addEventListener("input", function (event) {
  if (event.target.matches('[data-field="music-volume"]')) {
    handleAction("music-volume-change", event.target);
    return;
  }

  if (state.scene.name === "shopping-center" && event.target.matches('[data-field="shopping-center-sell-quantity"]')) {
    var sellItem = getResolvedInventoryItem(state.inventory, Number(event.target.dataset.itemIndex));
    var maxQuantity = sellItem ? Number(sellItem.quantity) || 0 : 0;
    var sellQuantityText = event.target.value.replace(/\D/g, "");
    var sellQuantityValue = Number(sellQuantityText) || 0;
    if (sellQuantityText && sellQuantityValue > maxQuantity) {
      sellQuantityText = String(maxQuantity);
    }
    event.target.value = sellQuantityText;
    return;
  }

  if (state.scene.name === "box" && event.target.matches('[data-field="box-filter-min-level"], [data-field="box-filter-max-level"]')) {
    var levelText = event.target.value.replace(/\D/g, "").slice(0, 3);
    var levelValue = Number(levelText);
    if (levelText && levelValue < 1) {
      levelText = "1";
    } else if (levelText && levelValue > 100) {
      levelText = "100";
    }
    event.target.value = levelText;
    return;
  }

  if (state.scene.name === "box" && event.target.matches('[data-field="box-filter-name"]')) {
    event.target.value = event.target.value.replace(/[^A-Za-z0-9-]/g, "").slice(0, 3);
    return;
  }

  if (state.scene.name === "capture" && event.target.matches('[data-field="capture-level"]')) {
    var captureLevelText = event.target.value.replace(/\D/g, "").slice(0, 2);
    event.target.value = captureLevelText;
    state.scene.levelText = captureLevelText;
    clearCaptureSearchErrorInline();
    return;
  }
});

bindHistoryNavigation(function (scene) {
  if (scene.invalidRoute) {
    scene = { name: "home" };
  }
  if (state.auth.loading) {
    setScene({ name: "login" }, { history: "replace" });
    enforceBattleRuntimeSceneLock();
    return;
  }
  if (!state.auth.user && scene.name !== "login" && !isPublicLegalScene(scene)) {
    setScene({ name: "login" }, { history: "replace" });
    enforceBattleRuntimeSceneLock();
    return;
  }
  if (state.auth.user && !currentUserIsAdmin() && scene.name !== "starter" && state.playerLoadStatus && state.playerLoadStatus.state === "new-player" && !isPublicLegalScene(scene)) {
    setScene({ name: "starter" }, { history: "replace" });
    enforceBattleRuntimeSceneLock();
    return;
  }
  if (state.auth.user && scene.name === "starter" && (currentUserIsAdmin() || !state.playerLoadStatus || state.playerLoadStatus.state !== "new-player")) {
    setScene({ name: currentUserIsAdmin() ? "admin-home" : state.playerLoadStatus && state.playerLoadStatus.state === "ready" ? "home" : "login" }, { history: "replace" });
    enforceBattleRuntimeSceneLock();
    return;
  }
  if (state.auth.user && scene.name === "login" && state.auth.mode !== "reset-password" && scene.authMode !== "reset-password") {
    setScene({ name: currentUserIsAdmin() ? "admin-home" : state.playerLoadStatus && state.playerLoadStatus.state === "new-player" ? "starter" : state.playerLoadStatus && state.playerLoadStatus.state === "ready" ? "home" : "login" }, { history: "replace" });
    enforceBattleRuntimeSceneLock();
    return;
  }
  if (state.auth.user && !currentUserIsAdmin() && String(scene.name || "").indexOf("admin-") === 0) {
    setScene({ name: "home" }, { history: "replace" });
    enforceBattleRuntimeSceneLock();
    return;
  }
  setScene(scene, { history: "skip" });
  if (scene.name === "battle") {
    resumeBattleSceneFollowup(scene);
    return;
  }
  if (scene.name === "battle-restore") {
    if (!openActiveProgressionScene()) {
      refreshActiveBattleFromDb({ open: true });
    }
    return;
  }
  if (scene.name === "admin-battle-restore") {
    openAdminBattle(scene.playerAuthUserId || "", scene.battleId || "");
    return;
  }
  if (scene.name === "admin-battles") {
    refreshAdminBattles();
    return;
  }
  if (scene.name === "city-daycare") {
    import("./daycare-handler.js").then(function (module) {
      module.refreshDaycare();
    });
  }
  if (skipBattleLockOnce) {
    skipBattleLockOnce = false;
    return;
  }
  enforceBattleRuntimeSceneLock();
}, function () {
  if (state.scene && state.scene.name === "battle") {
    skipBattleLockOnce = true;
    return battleReturnScene(state.scene);
  }
  return null;
});

initializeAppVersionWatcher().then(function (reloading) {
  if (reloading) {
    return;
  }

  setupAppVersionWatch();
  onBattleRuntimeChange(handleBattleRuntimeChange);
  initializeBattleRuntime();
  initializeTeamBoxRuntime(handleTeamBoxRuntimeChange, handleCaptureEncounterRuntimeInvalidation);
  initializeCaptureEncounterRuntime();
  initializeSession();
});
