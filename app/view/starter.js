import { TRAINER_SPRITES } from "../data/trainers.js";
import * as Engine from "../engine/index.js";
import { state } from "../client/game-state.js";
import { escapeHtml, getGenderImage, getPokemonImage, getTrainerImage, renderImage, withPokemonSpriteAttrs, withPokemonSpriteClass, withTrainerSpriteAttrs, withTrainerSpriteClass } from "../client/asset-helpers.js";
import { button, renderScenePresentationPanel, sceneShell } from "../client/render-utils.js";

var starterSpeciesCache = null;

function baseStarterSpecies() {
  if (!starterSpeciesCache) {
    starterSpeciesCache = Engine.getAllSpecies().filter(function (species) {
      var stage = species.evolution && species.evolution.stage;
      return stage === "base" && ["s", "f", "m", "l"].indexOf(species.rarity) === -1;
    }).sort(function (a, b) {
      return a.dexNumber - b.dexNumber;
    });
  }
  return starterSpeciesCache;
}

function starterGenerationFilter(setup) {
  var generation = Number((setup || state.starterSetup || {}).generation || 1);
  return generation >= 1 && generation <= 3 ? generation : 1;
}

function renderStarterGenderPicker(species, selectedGender) {
  if (!species.gender || species.gender.length <= 1) {
    return "";
  }
  return '<span class="starter-gender-picker" aria-label="Sesso Pokemon">' + species.gender.map(function (gender) {
    var selectedClass = gender === selectedGender ? " is-selected" : "";
    return '<span role="button" tabindex="0" class="starter-gender-option' + selectedClass + '" data-action="starter-gender-pick" data-gender="' + escapeHtml(gender) + '" aria-label="' + escapeHtml(gender) + '">' + renderImage(getGenderImage(gender), gender, "starter-gender-icon") + "</span>";
  }).join("") + "</span>";
}

export function renderStarterPokemonGrid(setup) {
  setup = setup || state.starterSetup || { error: "", loading: false };
  var selectedSpeciesName = String(setup.speciesName || "");
  var selectedGender = String(setup.gender || "");
  var activeGeneration = starterGenerationFilter(setup);
  var speciesList = baseStarterSpecies();
  return speciesList.filter(function (species) {
    return (Engine.generationForDexNumber(Number(species.dexNumber)) || 1) === activeGeneration;
  }).map(function (species) {
    var selectedClass = species.speciesKey === selectedSpeciesName || species.name === selectedSpeciesName ? " is-selected" : "";

    function renderCard(source) {
      return [
        '<button type="button" class="starter-card' + selectedClass + '" data-action="starter-pick" data-species="' + escapeHtml(species.speciesKey) + '" ' + (setup.loading ? "disabled" : "") + '>',
        '  <span class="starter-card-visual">',
        renderImage(getPokemonImage(source), species.name, withPokemonSpriteClass("starter-card-sprite", source), withPokemonSpriteAttrs(source)),
        "  </span>",
        '  <strong>' + escapeHtml(species.name) + "</strong>",
        selectedClass ? renderStarterGenderPicker(species, selectedGender) : "",
        "</button>"
      ].join("");
    }

    var selectedSpeciesSource = selectedClass && selectedGender
      ? { speciesKey: species.speciesKey, name: species.name, gender: selectedGender }
      : species;
    return renderCard(selectedSpeciesSource);
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
      renderImage(getTrainerImage(trainer.file), "Personaggio", withTrainerSpriteClass("trainer-card-sprite", trainer.file), withTrainerSpriteAttrs(trainer.file)),
      "</button>"
    ].join("");
  }).join("");
  var generationButtons = [1, 2, 3].map(function (generation) {
    var activeClass = generation === activeStarterGeneration ? " active" : "";
    return button("Gen " + generation, "starter-set-generation", 'data-generation="' + generation + '"' + (setup.loading ? " disabled" : ""), "button-ghost button-slim starter-generation-button" + activeClass);
  }).join("");

  var content = [
    setup.error ? '<p class="auth-error starter-setup-error">' + escapeHtml(setup.error) + "</p>" : "",
    '<div class="starter-choice-stack">',
    renderScenePresentationPanel("Start", "starter-info-panel"),
    '<section class="panel starter-choice-panel"><div class="panel-inner">',
    '  <section class="starter-choice-section">',
    '    <h2 class="starter-section-title">Personaggio</h2>',
    '    <div class="trainer-picker" data-scroll-key="trainer-picker">' + trainerButtons + "</div>",
    "  </section>",
    "</div></section>",
    '<section class="panel starter-choice-panel"><div class="panel-inner">',
    '  <section class="starter-choice-section">',
    '    <h2 class="starter-section-title">Pokemon iniziale</h2>',
    '    <div class="starter-generation-filters">' + generationButtons + "</div>",
    '    <div class="starter-picker" data-scroll-key="starter-picker">' + renderStarterPokemonGrid(setup) + "</div>",
    "  </section>",
    "</div></section>",
    "</div>"
  ].join("");

  return sceneShell("Inizia l'avventura!", "", content, "", "scene-content-starter");
}
