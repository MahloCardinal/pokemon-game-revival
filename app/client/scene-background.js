import { backgroundAssetForKey, backgroundKeyForScene } from "../data/scene-backgrounds.js";
import { assetPath } from "./asset-helpers.js";

var MOBILE_BACKGROUND_QUERY = "(max-width: 360px)";
var assetLoadCache = {};
var backgroundRequestId = 0;
var currentScene = null;
var lastMobileLayout = null;

export function getSceneBackgroundKey(scene) {
  return backgroundKeyForScene(scene);
}

function mobileLayoutActive() {
  return typeof window !== "undefined" && typeof window.matchMedia === "function"
    && window.matchMedia(MOBILE_BACKGROUND_QUERY).matches;
}

function clearSceneBackground() {
  document.body.removeAttribute("data-bg");
  document.body.style.removeProperty("--scene-bg");
}

export function preloadSceneMarkup(markup) {
  var template = document.createElement("template");
  var urls;
  template.innerHTML = String(markup || "");
  urls = Array.prototype.map.call(template.content.querySelectorAll("img[src]"), function (image) {
    return image.getAttribute("src");
  }).filter(Boolean);
  return Promise.all(urls.map(assetLoads));
}

function assetLoads(url) {
  if (assetLoadCache[url] !== undefined) {
    return Promise.resolve(assetLoadCache[url]);
  }
  return new Promise(function (resolve) {
    var image = new Image();
    image.onload = function () {
      assetLoadCache[url] = true;
      resolve(true);
    };
    image.onerror = function () {
      assetLoadCache[url] = false;
      resolve(false);
    };
    image.src = url;
  });
}

export function preloadSceneBackground(scene) {
  var key = getSceneBackgroundKey(scene);
  var asset = backgroundAssetForKey(key);
  var mobile = mobileLayoutActive();
  var fileName = asset && (mobile ? asset.mobile : asset.desktop);
  var url = fileName ? assetPath("img_zone", fileName) : "";
  if (!url || typeof Image === "undefined") {
    return Promise.resolve({ scene: scene || null, key: key, url: "", mobile: mobile, loaded: false });
  }
  return assetLoads(url).then(function (loaded) {
    return { scene: scene || null, key: key, url: url, mobile: mobile, loaded: loaded };
  });
}

export function prepareSceneBackground(scene) {
  var requestId = ++backgroundRequestId;
  currentScene = scene || null;
  lastMobileLayout = mobileLayoutActive();
  return preloadSceneBackground(scene).then(function (background) {
    background.requestId = requestId;
    return background;
  });
}

export function applySceneBackground(background) {
  if (!background || background.requestId !== backgroundRequestId) {
    return false;
  }
  currentScene = background && background.scene ? background.scene : null;
  lastMobileLayout = background ? background.mobile : null;
  if (!background || !background.loaded || !background.url) {
    clearSceneBackground();
    return false;
  }
  document.body.dataset.bg = background.key;
  document.body.style.setProperty("--scene-bg", 'url("' + background.url + '")');
  return true;
}

export function syncSceneBackground(scene) {
  return prepareSceneBackground(scene).then(applySceneBackground);
}

if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
  window.addEventListener("resize", function () {
    var mobile = mobileLayoutActive();
    if (currentScene && mobile !== lastMobileLayout) {
      syncSceneBackground(currentScene);
    }
  });
}
