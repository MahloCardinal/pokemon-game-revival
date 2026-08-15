import { EN_TRANSLATIONS } from "./en.js";
import { IT_TRANSLATIONS } from "./it.js";

export var DEFAULT_LOCALE = "it";
export var SUPPORTED_LOCALES = Object.freeze(["it", "en"]);
export var TRANSLATION_CATALOGS = Object.freeze({
  it: IT_TRANSLATIONS,
  en: EN_TRANSLATIONS
});

export function normalizeLocale(locale) {
  var normalized = String(locale || "").trim().toLowerCase().split(/[-_]/)[0];
  return SUPPORTED_LOCALES.indexOf(normalized) !== -1 ? normalized : DEFAULT_LOCALE;
}

export function translationCatalogValue(locale, key) {
  var catalog = TRANSLATION_CATALOGS[normalizeLocale(locale)];
  return String(key || "").split(".").filter(Boolean).reduce(function(value, segment) {
    return value && Object.prototype.hasOwnProperty.call(value, segment) ? value[segment] : undefined;
  }, catalog);
}
