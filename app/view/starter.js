import { TRAINER_SPRITES } from "../data/trainers.js";
import * as Engine from "../engine/index.js";
import { state } from "../client/game-state.js";
import { escapeHtml, getGenderImage, getPokemonStaticImage, getTrainerImage, renderImage, withPokemonSpriteAttrs, withPokemonSpriteClass, withTrainerSpriteAttrs, withTrainerSpriteClass } from "../client/asset-helpers.js";
import { button, renderScenePresentationPanel, sceneShell } from "../client/render-utils.js";
import { speciesDisplayName } from "../client/entity-text.js";
import { resolveText, t } from "../client/i18n.js";

var starterSpeciesCache = null;

function baseStarterSpecies() {
  if (!starterSpeciesCache) {
    starterSpeciesCache = Engine.getAllSpecies().filter(function (species) {
      var stage = species.evolution && species.evolution.stage;
      return stage === "base" && ["super_rare", "fossil", "mythic", "legendary"].indexOf(species.rarity) === -1;
    }).sort(function (a, b) {
      return a.dexNumber - b.dexNumber;
    });
  }
  return starterSpeciesCache;
}

function starterGenerationFilter(setup) {
  var configuredGeneration = (setup || state.starterSetup || {}).generation;
  var generation = configuredGeneration === undefined || configuredGeneration === null || configuredGeneration === ""
    ? 1
    : Number(configuredGeneration);
  if (generation === 0) {
    return 0;
  }
  return generation >= 1 && generation <= 3 ? generation : 1;
}

function renderStarterGenderPicker(species, selectedGender) {
  if (!species.gender || species.gender.length <= 1) {
    return "";
  }
  return '<span class="starter-gender-picker" aria-label="' + escapeHtml(t("ui.starter.pokemonGender")) + '">' + species.gender.map(function (gender) {
    var selectedClass = gender === selectedGender ? " is-selected" : "";
    var genderLabel = t("ui.starter.genders." + gender);
    return '<span role="button" tabindex="0" class="starter-gender-option' + selectedClass + '" data-action="starter-gender-pick" data-gender="' + escapeHtml(gender) + '" aria-label="' + escapeHtml(genderLabel) + '">' + renderImage(getGenderImage(gender), genderLabel, "starter-gender-icon") + "</span>";
  }).join("") + "</span>";
}

export function renderStarterPokemonGrid(setup, nameQuery) {
  setup = setup || state.starterSetup || { error: "", loading: false };
  var selectedSpeciesName = String(setup.speciesName || "");
  var selectedGender = String(setup.gender || "");
  var activeGeneration = starterGenerationFilter(setup);
  var normalizedNameQuery = String(nameQuery || "").trim().toLocaleLowerCase();
  var speciesList = baseStarterSpecies();
  if (activeGeneration === 0 && normalizedNameQuery.length < 2) {
    return "";
  }
  return speciesList.filter(function (species) {
    if (activeGeneration === 0) {
      return speciesDisplayName(species.speciesKey).toLocaleLowerCase().indexOf(normalizedNameQuery) !== -1;
    }
    return (Engine.generationForDexNumber(Number(species.dexNumber)) || 1) === activeGeneration;
  }).map(function (species) {
    var selectedClass = species.speciesKey === selectedSpeciesName ? " is-selected" : "";
    var speciesName = speciesDisplayName(species.speciesKey);

    function renderCard(source) {
      return [
        '<button type="button" class="starter-card' + selectedClass + '" data-action="starter-pick" data-species="' + escapeHtml(species.speciesKey) + '" ' + (setup.loading ? "disabled" : "") + '>',
        '  <span class="starter-card-visual">',
        renderImage(getPokemonStaticImage(source), speciesName, withPokemonSpriteClass("starter-card-sprite", source), withPokemonSpriteAttrs(source)),
        "  </span>",
        '  <strong>' + escapeHtml(speciesName) + "</strong>",
        selectedClass ? renderStarterGenderPicker(species, selectedGender) : "",
        "</button>"
      ].join("");
    }

    return renderCard(species);
  }).join("");
}

export function renderStarterScene() {
  var setup = state.starterSetup || { error: "", loading: false };
  var selectedTrainerIndex = Number(setup.trainerIndex || 0);
  var activeStarterGeneration = starterGenerationFilter(setup);
  var trainerButtons = TRAINER_SPRITES.map(function (trainer) {
    var selectedClass = trainer.index === selectedTrainerIndex ? " is-selected" : "";
    return [
      '<button type="button" class="starter-card trainer-card' + selectedClass + '" data-action="trainer-pick" data-trainer-index="' + escapeHtml(trainer.index) + '" ' + (setup.loading ? "disabled" : "") + '>',
      renderImage(getTrainerImage(trainer.file), t("ui.starter.characterAlt"), withTrainerSpriteClass("trainer-card-sprite", trainer.file), withTrainerSpriteAttrs(trainer.file)),
      "</button>"
    ].join("");
  }).join("");
  var generationButtons = [1, 2, 3].map(function (generation) {
    var activeClass = generation === activeStarterGeneration ? " active" : "";
    return button(t("ui.starter.generation", { generation: generation }), "starter-set-generation", 'data-generation="' + generation + '"' + (setup.loading ? " disabled" : ""), "button-ghost button-slim starter-generation-button" + activeClass);
  }).join("");
  var nameFilterButton = button(t("ui.starter.nameFilter"), "starter-set-generation", 'data-generation="0"' + (setup.loading ? " disabled" : ""), "button-ghost button-slim starter-generation-button" + (activeStarterGeneration === 0 ? " active" : ""));
  var nameFilterInput = '<input type="search" class="starter-name-filter" data-starter-name-filter autocomplete="off" maxlength="40" placeholder="' + escapeHtml(t("ui.starter.nameSearch")) + '" aria-label="' + escapeHtml(t("ui.starter.nameSearch")) + '"' + (activeStarterGeneration === 0 ? "" : " hidden") + (setup.loading ? " disabled" : "") + '>';

  var content = [
    setup.error ? '<p class="starter-error starter-setup-error">' + escapeHtml(resolveText(setup.error)) + "</p>" : "",
    '<div class="starter-choice-stack">',
    renderScenePresentationPanel("start", "starter-info-panel"),
    '<section class="panel starter-choice-panel"><div class="panel-inner">',
    '  <section class="starter-choice-section">',
    '    <h2 class="starter-section-title">' + escapeHtml(t("ui.starter.character")) + "</h2>",
    '    <div class="trainer-picker" data-scroll-key="trainer-picker">' + trainerButtons + "</div>",
    "  </section>",
    "</div></section>",
    '<section class="panel starter-choice-panel"><div class="panel-inner">',
    '  <section class="starter-choice-section">',
    '    <h2 class="starter-section-title">' + escapeHtml(t("ui.starter.starterPokemon")) + "</h2>",
    '    <div class="starter-generation-filters">' + generationButtons + nameFilterButton + nameFilterInput + "</div>",
    '    <div class="starter-picker" data-scroll-key="starter-picker">' + renderStarterPokemonGrid(setup) + "</div>",
    "  </section>",
    "</div></section>",
    "</div>"
  ].join("");

  return sceneShell(t("ui.starter.sceneTitle"), "", content, "", "scene-content-starter");
}
