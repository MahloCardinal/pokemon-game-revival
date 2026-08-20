import { escapeHtml } from "./asset-helpers.js";
import { getLocale, getLocaleLabel, getSupportedLocales, setLocale, t } from "./i18n.js";
import { registerAction } from "./action-registry.js";

export function renderLanguageSettingsControl() {
  var currentLocale = getLocale();
  var buttons = getSupportedLocales().map(function (locale) {
    var selected = locale === currentLocale;
    return [
      '<button type="button" class="button settings-language-option' + (selected ? ' is-selected' : '') + '"',
      ' data-action="settings-language-select" data-locale="' + escapeHtml(locale) + '"',
      ' aria-pressed="' + (selected ? 'true' : 'false') + '" lang="' + escapeHtml(locale) + '">',
      escapeHtml(getLocaleLabel(locale)),
      '</button>'
    ].join("");
  }).join("");

  return [
    '<div class="settings-language-control">',
    '  <span class="settings-language-label">' + escapeHtml(t("settings.language")) + '</span>',
    '  <div class="settings-language-options" role="group" aria-label="' + escapeHtml(t("settings.language")) + '">',
    buttons,
    '  </div>',
    '</div>'
  ].join("");
}

registerAction("settings-language-select", function (element) {
  setLocale(element && element.dataset.locale);
});
