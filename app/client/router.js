import * as Engine from "../engine/index.js";
import { KANTO_GYM_CITIES } from "../data/gyms.js";

var sceneRegistry = {};
var nextSceneId = 1;
var nextHistoryIndex = 1;
var currentHistoryIndex = 0;
var currentHistoryRoute = "";

// --- Route registry ---
var routeMap = {
  "home": "/",
  "login": "/login",
  "starter": "/starter",
  "zones": "/zones",
  "rules": "/rules",
  "privacy-policy": "/privacy-policy",
  "terms": "/terms",
  "styles": "/styles",
  "city": "/city",
  "battle-area": "/battle-area",
  "battle-tower": "/battle-area/battle-tower",
  "battle-shop": "/battle-area/battle-shop",
  "pokemon-center": "/city/pokemon-center",
  "shopping-center": "/city/shopping-center",
  "training-zone": "/battle-area/training-zone",
  "city-daycare": "/city/daycare",
  "city-garden": "/city/garden",
  "city-fanclub": "/city/fanclub",
  "gyms": "/gyms",
  "admin-home": "/admin",
  "admin-battles": "/admin/battles",
  "admin-battle": "/admin/battle",
  "team": "/team",
  "box": "/box",
  "battle": "/battle"
};

var sceneByPage = {
  "": { name: "home" },
  "home": { name: "home" },
  "zones": { name: "zones" },
  "login": { name: "login" },
  "starter": { name: "starter" },
  "rules": { name: "rules" },
  "privacy-policy": { name: "privacy-policy" },
  "terms": { name: "terms" },
  "styles": { name: "styles" },
  "battle-area": { name: "battle-area" },
  "team": { name: "team" },
  "box": { name: "box" }
};

var backSceneParents = {
  "rules": { name: "home" },
  "privacy-policy": { name: "home" },
  "terms": { name: "home" },
  "styles": { name: "home" },
  "zones": { name: "home" },
  "city": { name: "home" },
  "battle-area": { name: "home" },
  "gyms": { name: "home" },
  "admin-home": { name: "home" },
  "admin-battles": { name: "home" },
  "admin-battle": { name: "admin-battles" },
  "team": { name: "home" },
  "box": { name: "home" }
};

function canUseHistory() {
  return typeof window !== "undefined" && typeof window.history !== "undefined";
}

function currentRoute(fallbackRoute) {
  var path;
  if (!canUseHistory()) {
    return fallbackRoute || "/";
  }
  path = window.location.pathname || "/";
  if (/\/index\.html$/i.test(path)) {
    path = path.replace(/\/index\.html$/i, "/");
  }
  if (path.length > 1) {
    path = path.replace(/\/+$/g, "");
  }
  return path || fallbackRoute || (window.history.state && window.history.state.route) || "/";
}

function shouldNormalizeIndexPath() {
  return canUseHistory() && /\/index\.html$/i.test(window.location.pathname || "");
}

function urlForRoute(route) {
  if (!canUseHistory()) {
    return route;
  }
  return route || "/";
}

function historyIndexFromState(historyState) {
  var navIndex = historyState ? Number(historyState.navIndex) : NaN;
  return Number.isFinite(navIndex) ? navIndex : null;
}

function allocateHistoryIndex(mode, currentState) {
  var currentIndex = historyIndexFromState(currentState);
  if (mode === "replace" && currentIndex !== null) {
    return currentIndex;
  }
  if (mode === "replace" && currentHistoryIndex) {
    return currentHistoryIndex;
  }
  nextHistoryIndex = Math.max(nextHistoryIndex, currentHistoryIndex + 1);
  return nextHistoryIndex++;
}

function battleIdFromRoute(route) {
  var parts = String(route || "").replace(/^#\/?/, "").split("/");
  return parts[0] === "battle" ? parts[1] : "";
}

function routeParts(route) {
  return String(route || "/").replace(/^\/+|\/+$/g, "").split("/");
}

function routePage(route) {
  return routeParts(route)[0] || "";
}

function invalidRouteScene() {
  return { name: "home", invalidRoute: true };
}

function decodeRoutePart(part) {
  try {
    return decodeURIComponent(part || "");
  } catch (error) {
    return null;
  }
}

function isRouteIdentifier(value) {
  return /^[A-Za-z0-9_-]{1,80}$/.test(value || "");
}

function isGymCityKey(cityKey) {
  return cityKey === "elite_four" || cityKey === "kanto_champion" || KANTO_GYM_CITIES.some(function (city) {
    return city.key === cityKey;
  });
}

function isBattleRoute(route) {
  return routePage(route) === "battle";
}

function sceneId(scene) {
  if (!scene.__historyId) {
    Object.defineProperty(scene, "__historyId", {
      value: String(nextSceneId),
      configurable: true
    });
    nextSceneId += 1;
  }
  sceneRegistry[scene.__historyId] = scene;
  return scene.__historyId;
}

function parentSceneForBattleRoute(route) {
  var battleId = battleIdFromRoute(route);
  var scene = battleId ? sceneRegistry[battleId] : null;
  var captureScene = scene && scene.captureScene;
  var trainingScene = scene && scene.trainingScene;
  var battleTower = scene && scene.battleTower;
  var gymScene = scene && scene.gymScene;
  if (trainingScene && trainingScene.name === "training-zone") {
    return {
      name: "training-zone",
      trainingDifficulty: trainingScene.trainingDifficulty || "",
      trainingOpponentTeam: Array.isArray(trainingScene.trainingOpponentTeam) ? trainingScene.trainingOpponentTeam.slice() : [],
      trainingOpponent: trainingScene.trainingOpponent ? Object.assign({}, trainingScene.trainingOpponent) : null,
      trainingPreparedBattle: null
    };
  }
  if (captureScene && captureScene.zoneName) {
    return createCaptureScene(captureScene.zoneName, captureScene);
  }
  if (gymScene && gymScene.cityKey) {
    return { name: "gym-city", cityKey: gymScene.cityKey };
  }
  if (battleTower) {
    return { name: "battle-tower" };
  }
  return { name: "zones" };
}

export function clearSceneHistory() {
  sceneRegistry = {};
  nextSceneId = 1;
  nextHistoryIndex = 1;
  currentHistoryIndex = 0;
  currentHistoryRoute = "";
}

function routeForScene(scene) {
  if (!scene) {
    return routeMap.home;
  }
  if (scene.name === "gym-city") {
    return "/gyms/" + encodeURIComponent(scene.cityKey || "");
  }
  if (scene.name === "capture") {
    return "/capture/" + encodeURIComponent(scene.zoneName || "");
  }
  if (scene.name === "admin-home") {
    return "/admin";
  }
  if (scene.name === "admin-battle") {
    return "/admin/battle/" + encodeURIComponent(scene.playerAuthUserId || "")
      + (scene.authoritativeBattleId ? "/" + encodeURIComponent(scene.authoritativeBattleId) : "");
  }
  if (scene.name === "admin-battle-restore") {
    return "/admin/battle/" + encodeURIComponent(scene.playerAuthUserId || "")
      + (scene.battleId ? "/" + encodeURIComponent(scene.battleId) : "");
  }
  if (scene.name === "login" && scene.authMode === "reset-password") {
    return "/auth/recovery";
  }
  return routeMap[scene.name] || "/";
}

export function createCaptureScene(zoneName, sourceScene) {
  var zoneTypes = Engine.getZoneTypes(zoneName);
  if (!zoneName || !zoneTypes.length) {
    return { name: "zones" };
  }
  return {
    name: "capture",
    zoneName: zoneName,
    selectedType: sourceScene && sourceScene.selectedType && zoneTypes.indexOf(sourceScene.selectedType) !== -1
      ? sourceScene.selectedType : zoneTypes[0] || "",
    selectedRangeIndex: sourceScene ? sourceScene.selectedRangeIndex : 0,
    useWhiteFlute: Boolean(sourceScene && sourceScene.useWhiteFlute),
    useBlackFlute: Boolean(sourceScene && sourceScene.useBlackFlute),
    levelText: sourceScene && sourceScene.levelText || "",
    wildPokemon: null,
    encounterId: null,
    searchError: ""
  };
}

function captureSceneFromZone(zoneName) {
  return createCaptureScene(zoneName);
}

export function sceneFromRoute(route) {
  var normalized = route || "/";
  var parts = routeParts(normalized);
  var page = parts[0] || "";
  var base;
  var routeValue;

  base = sceneByPage[page];
  if (base && parts.length === 1) {
    return base;
  }

  if (page === "city") {
    if (parts.length === 1) {
      return { name: "city" };
    }
    if (parts.length !== 2) {
      return invalidRouteScene();
    }
    if (parts[1] === "pokemon-center") {
      return { name: "pokemon-center" };
    }
    if (parts[1] === "shopping-center" || parts[1] === "market") {
      return { name: "shopping-center", shoppingCenterSection: "market" };
    }
    if (parts[1] === "daycare") {
      return { name: "city-daycare", daycareDepositSlotIndex: null };
    }
    if (parts[1] === "garden") {
      return { name: "city-garden" };
    }
    if (parts[1] === "fanclub") {
      return { name: "city-fanclub" };
    }
    return invalidRouteScene();
  }
  if (page === "battle-area") {
    if (parts.length === 1) {
      return { name: "battle-area" };
    }
    if (parts.length !== 2) {
      return invalidRouteScene();
    }
    if (parts[1] === "battle-tower") {
      return { name: "battle-tower" };
    }
    if (parts[1] === "training-zone") {
      return { name: "training-zone", trainingDifficulty: "", trainingOpponentTeam: [], trainingOpponent: null, trainingPreparedBattle: null };
    }
    if (parts[1] === "battle-shop") {
      return { name: "battle-shop" };
    }
    return invalidRouteScene();
  }
  if (page === "gyms") {
    if (parts.length === 1) {
      return { name: "gyms" };
    }
    if (parts.length !== 2) {
      return invalidRouteScene();
    }
    routeValue = decodeRoutePart(parts[1]);
    if (routeValue && isGymCityKey(routeValue)) {
      return { name: "gym-city", cityKey: routeValue };
    }
    return invalidRouteScene();
  }
  if (page === "capture") {
    if (parts.length !== 2) {
      return invalidRouteScene();
    }
    routeValue = decodeRoutePart(parts[1]);
    return routeValue && Engine.getZoneTypes(routeValue).length ? captureSceneFromZone(routeValue) : invalidRouteScene();
  }
  if (page === "admin") {
    if (parts.length === 1) {
      return { name: "admin-home" };
    }
    if (parts[1] === "battle" && (parts.length === 3 || parts.length === 4)) {
      var playerAuthUserId = decodeRoutePart(parts[2]);
      var battleId = parts.length === 4 ? decodeRoutePart(parts[3]) : "";
      if (isRouteIdentifier(playerAuthUserId) && (battleId === "" || isRouteIdentifier(battleId))) {
        return { name: "admin-battle-restore", playerAuthUserId: playerAuthUserId, battleId: battleId };
      }
    }
    if (parts[1] === "battles" && parts.length === 2) {
      return { name: "admin-battles" };
    }
    return invalidRouteScene();
  }
  if (page === "auth" && parts.length === 2 && parts[1] === "recovery") {
    return { name: "login", authMode: "reset-password" };
  }
  if (page === "battle") {
    if (parts.length === 1) {
      return { name: "battle-restore" };
    }
    if (parts.length === 2) {
      routeValue = decodeRoutePart(parts[1]);
      if (isRouteIdentifier(routeValue)) {
        return sceneRegistry[routeValue] || { name: "battle-restore" };
      }
    }
    return invalidRouteScene();
  }

  return invalidRouteScene();
}

function backSceneForRoute(route) {
  var parts = routeParts(route);
  var page = parts[0] || "";
  if (page === "battle") {
    return parentSceneForBattleRoute(route);
  }
  if (page === "capture") {
    return { name: "zones" };
  }
  if (page === "city" && parts[1]) {
    return { name: "city" };
  }
  if (page === "battle-area" && parts[1]) {
    return { name: "battle-area" };
  }
  if (page === "gyms" && parts[1]) {
    return { name: "gyms" };
  }
  if (page === "admin") {
    if (parts[1] === "battles") { return { name: "admin-home" }; }
    if (parts[1] === "battle") { return { name: "admin-battles" }; }
    return { name: "home" };
  }
  if (backSceneParents[page]) {
    return backSceneParents[page];
  }
  return sceneFromRoute(route);
}

export function sceneFromCurrentLocation() {
  var route;
  if (!canUseHistory()) {
    return { name: "home" };
  }
  route = currentRoute();
  return sceneFromRoute(route);
}

export function writeSceneHistory(scene, mode) {
  var route;
  var url;
  var id;
  var navIndex;
  var historyState;
  var currentState;
  if (!canUseHistory()) {
    return;
  }

  route = routeForScene(scene);
  url = urlForRoute(route);
  currentState = window.history.state;
  id = sceneId(scene);

  if (currentState && currentState.sceneId === id && currentRoute(currentState.route) === route && !shouldNormalizeIndexPath()) {
    currentHistoryIndex = historyIndexFromState(currentState) || currentHistoryIndex;
    currentHistoryRoute = route;
    return;
  }

  navIndex = allocateHistoryIndex(mode, currentState);
  historyState = {
    sceneId: id,
    route: route,
    navIndex: navIndex
  };

  if (mode === "replace") {
    window.history.replaceState(historyState, "", url);
    currentHistoryIndex = navIndex;
    currentHistoryRoute = route;
    return;
  }

  window.history.pushState(historyState, "", url);
  currentHistoryIndex = navIndex;
  currentHistoryRoute = route;
}

export function bindHistoryNavigation(onScene, onBattleBack) {
  if (!canUseHistory()) {
    return;
  }

  window.addEventListener("popstate", function (event) {
    var route = currentRoute(event.state && event.state.route);
    var previousRoute = currentHistoryRoute;
    var previousIndex = currentHistoryIndex;
    var navIndex = historyIndexFromState(event.state);
    var direction = navIndex !== null && previousIndex ? Math.sign(navIndex - previousIndex) : 0;
    var scene = sceneFromRoute(route);

    if (scene.invalidRoute) {
      if (navIndex !== null) {
        currentHistoryIndex = navIndex;
      }
      currentHistoryRoute = route;
      writeSceneHistory(scene, "replace");
      onScene(scene);
      return;
    }

    if (direction > 0 && isBattleRoute(route)) {
      window.history.go(-1);
      return;
    }

    if (navIndex !== null) {
      currentHistoryIndex = navIndex;
    }
    currentHistoryRoute = route;

    if (direction < 0 && isBattleRoute(previousRoute) && onBattleBack) {
      scene = onBattleBack(previousRoute, route);
      if (scene) {
        writeSceneHistory(scene, "replace");
        onScene(scene);
        return;
      }
    }

    if (direction < 0) {
      scene = backSceneForRoute(previousRoute);
      writeSceneHistory(scene, "replace");
      onScene(scene);
      return;
    }

    onScene(scene);
  });
}
