import { escapeHtml } from "./asset-helpers.js";

function normalized(value) {
  return String(value || "").trim().toLocaleLowerCase();
}

function optionMarkup(option, selectedKey) {
  var key = String(option && option.key !== undefined ? option.key : "");
  var label = String(option && option.label || "");
  return '<button type="button" class="search-combobox-option' + (key === selectedKey ? " is-selected" : "") + '" role="option" data-search-combobox-option="' + escapeHtml(key) + '" data-search-label="' + escapeHtml(label) + '">' + escapeHtml(label) + "</button>";
}

export function renderSearchCombobox(config) {
  config = config || {};
  var options = Array.isArray(config.options) ? config.options : [];
  var selectedKey = config.value === undefined || config.value === null ? "" : String(config.value);
  var selected = options.find(function (option) { return String(option.key) === selectedKey; });
  var hiddenAttrs = config.field ? ' data-' + escapeHtml(config.field.attribute) + '="' + escapeHtml(config.field.value) + '"' : "";
  var inputAttrs = config.inputAttrs ? " " + String(config.inputAttrs) : "";
  return [
    '<div class="search-combobox" data-search-combobox>',
    '<input class="search-combobox-input" type="text" value="' + escapeHtml(selected ? selected.label : "") + '" placeholder="' + escapeHtml(config.placeholder || "") + '" autocomplete="off" aria-autocomplete="list"' + inputAttrs + '>',
    '<input type="hidden" value="' + escapeHtml(selectedKey) + '" data-search-combobox-value' + hiddenAttrs + '>',
    '<div class="search-combobox-options" role="listbox" data-search-combobox-options>',
    options.map(function (option) { return optionMarkup(option, selectedKey); }).join(""),
    "</div>",
    "</div>"
  ].join("");
}

function comboboxFor(element) {
  return element && element.closest ? element.closest("[data-search-combobox]") : null;
}

function setOpen(combobox, open) {
  if (combobox) combobox.classList.toggle("is-open", Boolean(open));
}

function syncTypedValue(combobox) {
  var input = combobox.querySelector(".search-combobox-input");
  var hidden = combobox.querySelector("[data-search-combobox-value]");
  var buttons = Array.prototype.slice.call(combobox.querySelectorAll("[data-search-combobox-option]"));
  var query = normalized(input && input.value);
  var exact = null;
  buttons.forEach(function (button) {
    var label = String(button.dataset.searchLabel || "");
    var matches = !query || normalized(label).indexOf(query) === 0;
    button.hidden = !matches;
    if (normalized(label) === query) exact = button;
  });
  var previous = hidden.value;
  hidden.value = exact ? String(exact.dataset.searchComboboxOption || "") : "";
  buttons.forEach(function (button) {
    button.classList.toggle("is-selected", String(button.dataset.searchComboboxOption || "") === hidden.value);
  });
  if (previous !== hidden.value) dispatchChange(hidden, previous);
}

function dispatchChange(hidden, previous) {
  hidden.dispatchEvent(new CustomEvent("search-combobox-change", {
    bubbles: true,
    detail: { value: hidden.value, previousValue: previous }
  }));
}

document.addEventListener("focusin", function (event) {
  if (!event.target.matches || !event.target.matches(".search-combobox-input")) return;
  var combobox = comboboxFor(event.target);
  setOpen(combobox, true);
  syncTypedValue(combobox);
});

document.addEventListener("input", function (event) {
  if (!event.target.matches || !event.target.matches(".search-combobox-input")) return;
  var combobox = comboboxFor(event.target);
  setOpen(combobox, true);
  syncTypedValue(combobox);
});

document.addEventListener("click", function (event) {
  var option = event.target.closest && event.target.closest("[data-search-combobox-option]");
  var combobox;
  var hidden;
  var input;
  var previous;
  if (option) {
    combobox = comboboxFor(option);
    hidden = combobox.querySelector("[data-search-combobox-value]");
    input = combobox.querySelector(".search-combobox-input");
    previous = hidden.value;
    hidden.value = String(option.dataset.searchComboboxOption || "");
    input.value = String(option.dataset.searchLabel || "");
    combobox.querySelectorAll("[data-search-combobox-option]").forEach(function (button) {
      button.hidden = false;
      button.classList.toggle("is-selected", button === option);
    });
    setOpen(combobox, false);
    if (previous !== hidden.value) dispatchChange(hidden, previous);
    return;
  }
  document.querySelectorAll("[data-search-combobox].is-open").forEach(function (entry) {
    if (!entry.contains(event.target)) setOpen(entry, false);
  });
});

document.addEventListener("keydown", function (event) {
  if (event.key !== "Escape" || !event.target.matches || !event.target.matches(".search-combobox-input")) return;
  setOpen(comboboxFor(event.target), false);
  event.target.blur();
});
