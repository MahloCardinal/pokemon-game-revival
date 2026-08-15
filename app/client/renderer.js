import { resetBoxFilter, state, root } from "./game-state.js";
import { renderDialog } from "../view/dialogs.js";
import { renderLoginScene } from "../view/auth.js";
import { renderBattleRestoreScene, renderBattleScene } from "../view/battle.js";
import { renderBattleAreaScene, renderBattleTowerScene } from "../view/battle-area.js";
import { renderBattleShopScene } from "../view/battle-shop.js";
import { renderBoxScene } from "../view/box.js";
import { captureWildCardKey, renderCaptureScene } from "../view/capture.js";
import { renderCityScene } from "../view/city.js";
import { renderDaycareScene } from "../view/daycare.js";
import { renderGymCityScene, renderKantoLeagueScene } from "../view/gyms.js";
import { renderActivityFeedSection, renderHomeScene } from "../view/home.js";
import { renderPrivacyPolicyScene, renderTermsScene } from "../view/legal.js";
import { renderPokemonCenterScene } from "../view/pokemon-center.js";
import { renderPokefanScene } from "../view/pokefan.js";
import { renderRulesScene } from "../view/rules.js";
import { renderShoppingCenterScene } from "../view/shopping-center.js";
import { renderStarterScene } from "../view/starter.js";
import { renderStylesScene } from "../view/styles.js";
import { renderTeamScene } from "../view/team.js";
import { renderTrainingZoneScene } from "../view/training-zone.js";
import { renderZonesScene } from "../view/zones.js";
import { renderGardenScene } from "../view/garden.js";
import { renderGlobalNavigation } from "./render-utils.js";
import { renderAdminBattleRestoreScene, renderAdminBattlesScene, renderAdminHomeScene } from "../view/admin-battles.js";
import { currentUserIsAdmin } from "./admin-auth.js";
import { isDebugUser } from "./debug-tools.js";
import { writeSceneHistory } from "./router.js";
import { playerCanAccessZone } from "../data/zone-access-rules.js";
import { kantoEliteFourChallengeStatus } from "../data/gyms.js";
import { renderUserSettingsMenu, syncMusicForScene } from "./audio-handler.js";
import { syncHomeActivityFeedPolling } from "./activity-feed-runtime.js";
import { applySceneBackground, prepareSceneBackground, preloadSceneMarkup } from "./scene-background.js";

var RENDERABLE_SCENES = [
  "login", "starter", "home", "city", "battle-area", "battle-tower", "battle-shop", "pokemon-center", "shopping-center", "training-zone", "city-daycare", "city-garden",
  "rules", "privacy-policy", "terms", "styles", "gyms", "gym-city", "city-fanclub", "zones", "team", "box", "capture", "battle", "battle-restore", "admin-home", "admin-battles", "admin-battle", "admin-battle-restore"
];
var renderRequestId = 0;

function isPublicScene(scene) {
  return scene && (scene.name === "login" || scene.name === "privacy-policy" || scene.name === "terms");
}

function isAdminScene(scene) {
  return scene && String(scene.name || "").indexOf("admin-") === 0;
}

function authenticatedDefaultScene() {
  var loadState = state.playerLoadStatus ? state.playerLoadStatus.state : "idle";
  if (currentUserIsAdmin()) {
    return { name: "admin-home" };
  }
  if (loadState === "new-player") {
    return { name: "starter" };
  }
  if (loadState === "ready") {
    return { name: "home" };
  }
  return { name: "login" };
}

function normalizeRenderableScene(scene) {
  if (!scene || RENDERABLE_SCENES.indexOf(scene.name) === -1) {
    return { name: "home" };
  }
  if (!state.auth.user && !isPublicScene(scene)) {
    return { name: "login" };
  }
  if (isAdminScene(scene) && !currentUserIsAdmin()) {
    return { name: "home" };
  }
  if (currentUserIsAdmin() && scene.name === "home") {
    return { name: "admin-home" };
  }
  if (state.auth.user && !state.auth.loading && scene.name === "login" && state.auth.mode !== "reset-password" && scene.authMode !== "reset-password") {
    return authenticatedDefaultScene();
  }
  if (state.auth.user && scene.name === "starter" && (!state.playerLoadStatus || state.playerLoadStatus.state !== "new-player")) {
    return authenticatedDefaultScene();
  }
  if (scene.name === "styles" && !isDebugUser()) {
    return { name: "home" };
  }
  if (scene.name === "capture" && !playerCanAccessZone(state.inventory, scene.zoneName)) {
    return { name: "zones" };
  }
  if (scene.name === "gym-city" && (scene.cityKey === "elite_four" || scene.cityKey === "kanto_champion") && kantoEliteFourChallengeStatus(state.trainerInfo[2]).state === "locked") {
    return { name: "gyms" };
  }
  return scene;
}

function currentSceneMarkup() {
  state.scene = normalizeRenderableScene(state.scene);
  if (state.scene.name === "login") {
    return renderLoginScene();
  }
  if (state.scene.name === "starter") {
    return renderStarterScene();
  }
  if (state.scene.name === "home") {
    return renderHomeScene();
  }
  if (state.scene.name === "city") {
    return renderCityScene();
  }
  if (state.scene.name === "battle-area") {
    return renderBattleAreaScene();
  }
  if (state.scene.name === "battle-tower") {
    return renderBattleTowerScene();
  }
  if (state.scene.name === "battle-shop") {
    return renderBattleShopScene();
  }
  if (state.scene.name === "pokemon-center") {
    return renderPokemonCenterScene();
  }
  if (state.scene.name === "shopping-center") {
    return renderShoppingCenterScene();
  }
  if (state.scene.name === "training-zone") {
    return renderTrainingZoneScene();
  }
  if (state.scene.name === "city-daycare") {
    return renderDaycareScene();
  }
  if (state.scene.name === "city-garden") {
    return renderGardenScene();
  }
  if (state.scene.name === "rules") {
    return renderRulesScene(state.scene);
  }
  if (state.scene.name === "privacy-policy") {
    return renderPrivacyPolicyScene();
  }
  if (state.scene.name === "terms") {
    return renderTermsScene();
  }
  if (state.scene.name === "styles") {
    return renderStylesScene();
  }
  if (state.scene.name === "gyms") {
    return renderKantoLeagueScene();
  }
  if (state.scene.name === "gym-city") {
    return renderGymCityScene(state.scene);
  }
  if (state.scene.name === "city-fanclub") {
    return renderPokefanScene();
  }
  if (state.scene.name === "zones") {
    return renderZonesScene();
  }
  if (state.scene.name === "team") {
    return renderTeamScene();
  }
  if (state.scene.name === "box") {
    return renderBoxScene();
  }
  if (state.scene.name === "capture") {
    return renderCaptureScene(state.scene);
  }
  if (state.scene.name === "battle") {
    return renderBattleScene(state.scene);
  }
  if (state.scene.name === "admin-home") {
    return renderAdminHomeScene();
  }
  if (state.scene.name === "admin-battles") {
    return renderAdminBattlesScene(state.scene);
  }
  if (state.scene.name === "admin-battle") {
    return renderBattleScene(state.scene);
  }
  if (state.scene.name === "admin-battle-restore") {
    return renderAdminBattleRestoreScene();
  }
  if (state.scene.name === "battle-restore") {
    return renderBattleRestoreScene();
  }
  state.scene = { name: "home" };
  return renderHomeScene();
}

function isScrollable(element) {
  var style = window.getComputedStyle(element);
  var overflowY = style.overflowY;
  var overflowX = style.overflowX;
  var canScrollY = ["auto", "scroll", "overlay"].indexOf(overflowY) !== -1 && element.scrollHeight > element.clientHeight;
  var canScrollX = ["auto", "scroll", "overlay"].indexOf(overflowX) !== -1 && element.scrollWidth > element.clientWidth;
  return canScrollY || canScrollX;
}

function scrollKey(element, index) {
  if (element.dataset && element.dataset.scrollKey) {
    return element.dataset.scrollKey;
  }
  if (element.id) {
    return "id:" + element.id;
  }
  return "scrollable:" + index + ":" + element.tagName.toLowerCase() + ":" + element.className;
}

function captureScrollPositions() {
  var positions = {};
  var scrollables = Array.prototype.slice.call(root.querySelectorAll("*")).filter(isScrollable);
  scrollables.forEach(function (element, index) {
    positions[scrollKey(element, index)] = {
      left: element.scrollLeft,
      top: element.scrollTop
    };
  });
  return positions;
}

function restoreScrollPositions(positions) {
  var scrollables = Array.prototype.slice.call(root.querySelectorAll("*")).filter(isScrollable);
  scrollables.forEach(function (element, index) {
    var position = positions[scrollKey(element, index)];
    if (!position) {
      return;
    }
    element.scrollLeft = position.left;
    element.scrollTop = position.top;
  });
}

function scrollBattleLogToBottom() {
  var battleLog = root.querySelector('[data-scroll-key="battle-log"]');
  if (battleLog) {
    battleLog.scrollTop = battleLog.scrollHeight;
    battleLog.scrollLeft = battleLog.scrollWidth;
  }
}

function preserveCaptureWildCard() {
  var wildCardWrap;
  var key;
  if (!state.scene || state.scene.name !== "capture") {
    return;
  }
  key = captureWildCardKey(state.scene);
  wildCardWrap = root.querySelector(".wild-card-wrap");
  if (!wildCardWrap) {
    return;
  }
  if (!key || !wildCardWrap.firstElementChild) {
    state.captureWildCard = null;
    return;
  }
  state.captureWildCard = { key: key, node: wildCardWrap.removeChild(wildCardWrap.firstElementChild) };
}

function restoreCaptureWildCard() {
  var wildCardWrap;
  var key;
  var cached = state.captureWildCard;
  if (!state.scene || state.scene.name !== "capture" || !cached) {
    return;
  }
  key = captureWildCardKey(state.scene);
  wildCardWrap = root.querySelector(".wild-card-wrap");
  if (!wildCardWrap || cached.key !== key) {
    state.captureWildCard = null;
    return;
  }
  wildCardWrap.appendChild(cached.node);
}

function scheduleBattleLogScroll() {
  if (typeof window === "undefined") {
    return;
  }
  window.requestAnimationFrame(scrollBattleLogToBottom);
}

export function syncBattleLayoutMeasurements() {
  var layout = root.querySelector(".battle-layout");
  var infoCard = root.querySelector("[data-battle-info-card]");
  var panelInner = infoCard ? infoCard.querySelector(".battle-info-inner") : null;
  var tabs = panelInner ? panelInner.querySelector(".battle-info-tabs") : null;
  var summary = panelInner ? panelInner.querySelector("[data-battle-summary-measure]") : null;
  var actions = panelInner ? panelInner.querySelector(".battle-info-actions") : null;
  var panelStyle;
  var rowGap = 0;
  var paddingTop = 0;
  var paddingBottom = 0;
  var minHeight = 0;
  var configuredHeight = "";
  if (!layout || !infoCard || !panelInner || !summary) {
    return;
  }
  configuredHeight = window.getComputedStyle(layout).getPropertyValue("--battle-stage-min-height").trim();
  if (configuredHeight && configuredHeight !== "auto") {
    return;
  }
  panelStyle = window.getComputedStyle(panelInner);
  rowGap = parseFloat(panelStyle.rowGap || panelStyle.gap) || 0;
  paddingTop = parseFloat(panelStyle.paddingTop) || 0;
  paddingBottom = parseFloat(panelStyle.paddingBottom) || 0;
  minHeight = Math.ceil(
    summary.scrollHeight +
    (tabs ? tabs.getBoundingClientRect().height : 0) +
    (actions ? actions.getBoundingClientRect().height : 0) +
    (actions ? rowGap * 2 : rowGap) +
    paddingTop +
    paddingBottom
  );
  if (minHeight > 0) {
    layout.style.setProperty("--battle-stage-min-height", minHeight + "px");
  }
}

export function syncRulesHeadingButtonWidths(scope) {
  var container = scope || root;
  var rows = container && container.querySelectorAll ? container.querySelectorAll(".rules-heading-row") : [];
  Array.prototype.forEach.call(rows, function (row) {
    var buttons = Array.prototype.slice.call(row.querySelectorAll(".rules-heading-button"));
    var maxWidth = 0;
    row.style.removeProperty("--rules-heading-button-width");
    buttons.forEach(function (button) {
      var previousWidth = button.style.width;
      var previousWhiteSpace = button.style.whiteSpace;
      button.style.width = "auto";
      button.style.whiteSpace = "nowrap";
      maxWidth = Math.max(maxWidth, Math.ceil(button.getBoundingClientRect().width));
      button.style.width = previousWidth;
      button.style.whiteSpace = previousWhiteSpace;
    });
    if (maxWidth > 0) {
      row.style.setProperty("--rules-heading-button-width", maxWidth + "px");
    }
  });
}

export function render(options) {
  options = options || {};
  var preserveScroll = options.preserveScroll !== false;
  var scrollX = window.scrollX || window.pageXOffset || 0;
  var scrollY = window.scrollY || window.pageYOffset || 0;
  var requestId = ++renderRequestId;
  var sceneMarkup;
  var scene;
  var internalScrollPositions = preserveScroll ? captureScrollPositions() : {};
  preserveCaptureWildCard();
  state.scene = normalizeRenderableScene(state.scene);
  scene = state.scene;
  syncMusicForScene(scene);
  sceneMarkup = renderGlobalNavigation(scene) + currentSceneMarkup() + renderDialog(state.dialog);
  root.classList.add("is-scene-loading");
  return Promise.all([prepareSceneBackground(scene), preloadSceneMarkup(sceneMarkup)]).then(function (results) {
    if (requestId !== renderRequestId || state.scene !== scene) {
      return;
    }
    applySceneBackground(results[0]);
    root.innerHTML = sceneMarkup;
    root.classList.remove("is-scene-loading");
    restoreCaptureWildCard();
  var sceneHeading = root.querySelector(".scene-heading");
  var userSettingsMarkup = renderUserSettingsMenu(state.scene);
  if (sceneHeading && userSettingsMarkup) {
    var sceneHeadingAction = sceneHeading.querySelector(".scene-heading-spacer:last-child");
    if (sceneHeadingAction) {
      sceneHeadingAction.insertAdjacentHTML("beforebegin", userSettingsMarkup);
      sceneHeadingAction.remove();
    }
  }
  if (state.scene.name === "battle") {
    syncBattleLayoutMeasurements();
    window.requestAnimationFrame(syncBattleLayoutMeasurements);
  }
  if (state.scene.name === "rules") {
    syncRulesHeadingButtonWidths(root);
  }
  if (options.sceneTransition) {
    var nextSceneShell = root.querySelector(".scene-shell");
    if (nextSceneShell) {
      nextSceneShell.classList.add("scene-shell--entering");
      window.setTimeout(function () {
        nextSceneShell.classList.remove("scene-shell--entering");
      }, 320);
    }
  }
  syncHomeActivityFeedPolling(function () {
    setHtml(".home-activity-dashboards", renderActivityFeedSection());
  });
  if (!preserveScroll) {
    window.scrollTo(0, 0);
    if (options.scrollBattleLogToBottom) {
      scheduleBattleLogScroll();
    }
    return;
  }
  restoreScrollPositions(internalScrollPositions);
  if (options.scrollBattleLogToBottom) {
    scheduleBattleLogScroll();
  }
  window.scrollTo(scrollX, scrollY);
  });
}

function syncRegionAttributes(current, next) {
  Array.prototype.slice.call(current.attributes).forEach(function (attribute) {
    if (!next.hasAttribute(attribute.name)) {
      current.removeAttribute(attribute.name);
    }
  });
  Array.prototype.slice.call(next.attributes).forEach(function (attribute) {
    current.setAttribute(attribute.name, attribute.value);
  });
}

export function renderRegions(regionNames, options) {
  options = options || {};
  var names = Array.isArray(regionNames) ? regionNames.filter(function (name, index, entries) {
    return /^[a-z0-9-]+$/.test(String(name || "")) && entries.indexOf(name) === index;
  }) : [];
  var scene = state.scene;
  var template;
  var markup;
  var regions;
  var internalScrollPositions;
  if (!scene || !names.length) {
    return render(options);
  }
  state.scene = normalizeRenderableScene(scene);
  if (state.scene !== scene) {
    return render(options);
  }
  markup = currentSceneMarkup();
  template = document.createElement("template");
  template.innerHTML = markup;
  regions = names.map(function (name) {
    var selector = '[data-render-region="' + name + '"]';
    return { current: root.querySelector(selector), next: template.content.querySelector(selector) };
  });
  if (regions.some(function (entry) { return !entry.current || !entry.next; })) {
    return render(options);
  }
  internalScrollPositions = options.preserveScroll === false ? {} : captureScrollPositions();
  regions.forEach(function (entry) {
    syncRegionAttributes(entry.current, entry.next);
    entry.current.innerHTML = entry.next.innerHTML;
  });
  if (options.preserveScroll !== false) {
    restoreScrollPositions(internalScrollPositions);
  }
  if (options.scrollBattleLogToBottom) {
    scheduleBattleLogScroll();
  }
  return Promise.resolve(true);
}

export function renderDialogLayer(options) {
  options = options || {};
  var regionNames = Array.prototype.slice.call(root.querySelectorAll("[data-render-region]"))
    .map(function (element) { return String(element.dataset.renderRegion || ""); })
    .filter(function (name, index, entries) { return name && entries.indexOf(name) === index; });
  if (!regionNames.length) {
    return render(options);
  }
  renderRegions(regionNames, options);
  Array.prototype.slice.call(root.children).forEach(function (element) {
    if (element.classList && element.classList.contains("dialog-backdrop")) {
      element.remove();
    }
  });
  var markup = renderDialog(state.dialog);
  if (markup) {
    root.insertAdjacentHTML("beforeend", markup);
  }
  if (options.scrollBattleLogToBottom) {
    scheduleBattleLogScroll();
  }
  return Promise.resolve(true);
}

export function setScene(scene, options) {
  options = options || {};
  var previousSceneName = state.scene && state.scene.name;
  scene = normalizeRenderableScene(scene);
  var historyMode = options.history === "replace" ? "replace" : "push";
  if (state.scene && state.scene.name === "city-garden" && scene.name !== "city-garden" && state.garden && state.garden.harvestNotices) {
    state.garden.harvestNotices = [null, null, null];
  }
  if (state.scene && state.scene.name === "box" && scene.name !== "box") {
    resetBoxFilter();
  }
  if (state.scene && state.scene.name === "shopping-center" && scene.name !== "shopping-center") {
    state.shoppingCenterCart = {};
    state.shoppingCenterSellCart = {};
  }
  if (state.scene && state.scene.name === "capture" && scene.name !== "capture") {
    preserveCaptureWildCard();
  }
  state.scene = scene;
  state.dialog = null;
  if (options.history !== "skip") {
    writeSceneHistory(scene, historyMode);
  }
  try { sessionStorage.setItem("pokemon_game_revival:scene_name", scene.name); } catch (e) {}
  render({
    preserveScroll: false,
    sceneTransition: options.sceneTransition !== false && Boolean(previousSceneName && previousSceneName !== scene.name && root.children.length),
    scrollBattleLogToBottom: scene.name === "battle" || scene.name === "admin-battle"
  });
  if (scene.name === "training-zone") {
    import("./training-zone-handler.js").then(function (module) {
      module.recoverPendingAuthoritativeDebugTrainingStart({ silent: true });
    });
  }
  if (scene.name === "battle-shop" && !state.battleShopOffersLoaded && !state.battleShopOffersLoading) {
    import("./battle-shop-handler.js").then(function (module) {
      module.refreshBattleShopOffers();
    });
  }
}

export function markDirty() {
  state.dirty = true;
}

export function setHtml(target, html) {
  var element = typeof target === "string" ? root.querySelector(target) : target;
  if (element) {
    element.innerHTML = html;
  }
  return element;
}

export function removeElement(element) {
  if (element) {
    element.remove();
  }
}
