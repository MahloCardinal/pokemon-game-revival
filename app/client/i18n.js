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
    return variables && variables[name] !== undefined ? resolveText(variables[name], match) : match;
  });
}

function translationValueWithFallback(key) {
  var value = translationCatalogValue(currentLocale, key);
  if (value === undefined) {
    value = translationCatalogValue(DEFAULT_LOCALE, key);
  }
  return value;
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

export function getLocaleLabel(locale) {
  var normalizedLocale = normalizeLocale(locale);
  var label = translationCatalogValue(normalizedLocale, "locale.label");
  return typeof label === "string" ? label : normalizedLocale.toUpperCase();
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
  var value = translationValueWithFallback(key);
  if (typeof value !== "string") {
    value = fallbackValue !== undefined ? fallbackValue : key;
  }
  return interpolate(value, variables || {});
}

export function textDescriptor(key, params) {
  return Object.freeze({ key: String(key || ""), params: Object.freeze(Object.assign({}, params || {})) });
}

export function messageDescriptor(key, params) {
  return textDescriptor("messages." + String(key || ""), params);
}

export function resolveText(value, fallbackValue) {
  if (value && typeof value === "object" && !Array.isArray(value) && typeof value.key === "string") {
    return t(value.key, value.params || {}, fallbackValue);
  }
  return value === undefined || value === null ? String(fallbackValue || "") : String(value);
}

export function tList(key, variables) {
  var value = translationValueWithFallback(key);
  return Array.isArray(value) ? value.map(function (entry) {
    return interpolate(entry, variables || {});
  }) : [];
}

export function tp(key, count, variables) {
  var value = translationValueWithFallback(key);
  var pluralCategory = new Intl.PluralRules(currentLocale).select(Number(count) || 0);
  var message = value && typeof value === "object" && !Array.isArray(value)
    ? value[pluralCategory] || value.other
    : value;
  return typeof message === "string"
    ? interpolate(message, Object.assign({ count: count }, variables || {}))
    : key;
}

export function formatLocaleNumber(value, options) {
  return new Intl.NumberFormat(currentLocale, options || {}).format(Number(value) || 0);
}

export function formatLocaleDate(value, options) {
  return new Intl.DateTimeFormat(currentLocale, options || {}).format(value instanceof Date ? value : new Date(value));
}

export { LOCALE_CHANGE_EVENT };
