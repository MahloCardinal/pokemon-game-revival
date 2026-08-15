import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  normalizeLocale,
  translationCatalogValue
} from "../data/i18n/index.js";

var LOCALE_STORAGE_KEY = "pokemon-game-revival:locale";
var LOCALE_CHANGE_EVENT = "pokemon-game-revival:locale-change";
var currentLocale = readStoredLocale();

applyDocumentLocale();

function readStoredLocale() {
  var storedLocale = "";
  try {
    storedLocale = typeof localStorage !== "undefined" ? localStorage.getItem(LOCALE_STORAGE_KEY) : "";
  } catch (_error) {
    storedLocale = "";
  }
  return normalizeLocale(storedLocale || DEFAULT_LOCALE);
}

function interpolate(message, variables) {
  return String(message).replace(/\{([a-zA-Z0-9_]+)\}/g, function(match, name) {
    return variables && variables[name] !== undefined ? String(variables[name]) : match;
  });
}

function applyDocumentLocale() {
  if (typeof document !== "undefined" && document.documentElement) {
    document.documentElement.lang = currentLocale;
  }
}

export function getLocale() {
  return currentLocale;
}

export function getSupportedLocales() {
  return SUPPORTED_LOCALES.slice();
}

export function setLocale(locale) {
  var nextLocale = normalizeLocale(locale);
  if (nextLocale === currentLocale) {
    return currentLocale;
  }
  currentLocale = nextLocale;
  applyDocumentLocale();
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(LOCALE_STORAGE_KEY, currentLocale);
    }
  } catch (_error) {
    // The selected locale still applies to the current tab when storage is unavailable.
  }
  if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
    window.dispatchEvent(new CustomEvent(LOCALE_CHANGE_EVENT, { detail: { locale: currentLocale } }));
  }
  return currentLocale;
}

export function t(key, variables, fallbackValue) {
  var value = translationCatalogValue(currentLocale, key);
  if (typeof value !== "string") {
    value = translationCatalogValue(DEFAULT_LOCALE, key);
  }
  if (typeof value !== "string") {
    value = fallbackValue !== undefined ? fallbackValue : key;
  }
  return interpolate(value, variables || {});
}

export { LOCALE_CHANGE_EVENT };
