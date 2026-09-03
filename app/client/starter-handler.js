import { registerAction } from "./action-registry.js";

import { render, setScene } from "./renderer.js";
import { applyPlayerSave, root, state } from "./game-state.js";
import * as Engine from "../engine/index.js";
import { isTrainerIndex } from "../data/trainers.js";
import { createInitialPlayerSave } from "../api/player.js";
import { escapeHtml, getGenderImage, renderImage } from "./asset-helpers.js";
import { setHtml } from "./renderer.js";
import { renderDialog } from "../view/dialogs.js";
import { renderStarterPokemonGrid } from "../view/starter.js";
import { refreshMissionState } from "./mission-runtime.js";
import { messageDescriptor, t } from "./i18n.js";

registerAction("starter-pick", function(element) {
    var pickedSpeciesName = String(element.dataset.species || "");
    var currentStarterSetup = selectedStarterSetup();
    var nextSpeciesName;
    var picker;
    var previousCard;
    if (state.starterSetup && state.starterSetup.loading || !isAllowedStarterSpecies(pickedSpeciesName)) {
      return;
    }
    picker = element.closest(".starter-picker");
    previousCard = picker ? picker.querySelector(".starter-card.is-selected") : null;
    nextSpeciesName = currentStarterSetup.speciesName === pickedSpeciesName ? "" : pickedSpeciesName;
    state.starterSetup = {
      error: "",
      loading: false,
      trainerIndex: currentStarterSetup.trainerIndex,
      speciesName: nextSpeciesName,
      gender: "",
      generation: currentStarterSetup.generation
    };
    syncStarterPickUi(previousCard, element, nextSpeciesName);
    openStarterConfirmIfReady();
    return;

});

registerAction("starter-gender-pick", function(element) {
    var pickedStarterGender = String(element.dataset.gender || "");
    var currentGenderSetup = selectedStarterSetup();
    var currentPicker;
    var previousGenderOption;
    if (state.starterSetup && state.starterSetup.loading || !currentGenderSetup.speciesName || (starterSpeciesEntry(currentGenderSetup.speciesName) && Array.isArray(starterSpeciesEntry(currentGenderSetup.speciesName).gender) ? starterSpeciesEntry(currentGenderSetup.speciesName).gender : []).indexOf(pickedStarterGender) === -1) {
      return;
    }
    currentPicker = element.closest(".starter-gender-picker");
    previousGenderOption = currentPicker ? currentPicker.querySelector(".starter-gender-option.is-selected") : null;
    state.starterSetup = {
      error: "",
      loading: false,
      trainerIndex: currentGenderSetup.trainerIndex,
      speciesName: currentGenderSetup.speciesName,
      gender: pickedStarterGender,
      generation: currentGenderSetup.generation
    };
    clearStarterSetupError();
    closeStarterConfirmDialog();
    if (previousGenderOption && previousGenderOption !== element) {
      previousGenderOption.classList.remove("is-selected");
    }
    element.classList.add("is-selected");
    openStarterConfirmIfReady();
    return;

});

registerAction("trainer-pick", function(element) {
    var trainerIndex = Number(element.dataset.trainerIndex);
    var currentTrainerSetup = selectedStarterSetup();
    var nextTrainerIndex;
    var picker;
    var previousCard;
    if (state.starterSetup && state.starterSetup.loading || !isTrainerIndex(trainerIndex)) {
      return;
    }
    picker = element.closest(".trainer-picker");
    previousCard = picker ? picker.querySelector(".trainer-card.is-selected") : null;
    nextTrainerIndex = currentTrainerSetup.trainerIndex === trainerIndex ? 0 : trainerIndex;
    state.starterSetup = {
      error: "",
      loading: false,
      trainerIndex: nextTrainerIndex,
      speciesName: currentTrainerSetup.speciesName,
      gender: currentTrainerSetup.gender,
      generation: currentTrainerSetup.generation
    };
    syncTrainerPickUi(previousCard, element, nextTrainerIndex);
    openStarterConfirmIfReady();
    return;

});

registerAction("starter-set-generation", function(element) {
    var generation = Number(element.dataset.generation);
    var filterControls;
    var setup = selectedStarterSetup();
    var picker;
    var previousButton;
    var nameFilterInput;
    if (state.starterSetup && state.starterSetup.loading || generation < 0 || generation > 3 || generation === setup.generation) {
      return;
    }
    state.starterSetup = {
      error: "",
      loading: false,
      trainerIndex: setup.trainerIndex,
      speciesName: setup.speciesName,
      gender: setup.gender,
      generation: generation
    };
    clearStarterSetupError();
    picker = root.querySelector(".starter-picker");
    setHtml(picker, renderStarterPokemonGrid(state.starterSetup));
    filterControls = element.closest(".starter-generation-filters");
    nameFilterInput = filterControls ? filterControls.querySelector("[data-starter-name-filter]") : null;
    if (nameFilterInput) {
      nameFilterInput.value = "";
      nameFilterInput.hidden = generation !== 0;
      if (generation === 0) {
        nameFilterInput.focus();
      }
    }
    previousButton = filterControls ? filterControls.querySelector(".starter-generation-button.active") : null;
    if (previousButton) {
      previousButton.classList.remove("active");
    }
    element.classList.add("active");
    return;

});

document.addEventListener("input", function(event) {
    var picker;
    if (!event.target.matches || !event.target.matches("[data-starter-name-filter]") || selectedStarterSetup().generation !== 0) {
      return;
    }
    picker = root.querySelector(".starter-picker");
    setHtml(picker, renderStarterPokemonGrid(state.starterSetup, event.target.value));
});

registerAction("starter-confirm", function(element) {
    confirmStarterPick();
    return;

});

registerAction("starter-change-selection", function(element) {
    state.dialog = null;
    state.starterSetup = { error: "", loading: false };
    render();
    return;

});

function selectedStarterSetup() {
  var setup = state.starterSetup || {};
  var configuredGeneration = setup.generation;
  var generation = configuredGeneration === undefined || configuredGeneration === null || configuredGeneration === ""
    ? 1
    : Math.floor(Number(configuredGeneration));
  return {
    trainerIndex: Number(setup.trainerIndex || 0),
    speciesName: String(setup.speciesName || ""),
    gender: String(setup.gender || ""),
    generation: generation === 0 ? 0 : Math.max(1, Math.min(3, generation || 1))
  };
}



function isAllowedStarterSpecies(speciesName) {
  var species = starterSpeciesEntry(speciesName);
  var stage = species && species.evolution && species.evolution.stage;
  return !!species && stage === "base" && ["fossil", "mythic", "legendary"].indexOf(species.rarity) === -1;
}



function starterSpeciesEntry(speciesName) {
  return Engine.findSpecies(speciesName);
}

function renderStarterGenderPicker(species, selectedGender) {
  if (!species || !species.gender || species.gender.length <= 1) {
    return "";
  }
  return '<span class="starter-gender-picker" aria-label="' + escapeHtml(t("ui.starter.pokemonGender")) + '">' + species.gender.map(function (gender) {
    var selectedClass = gender === selectedGender ? " is-selected" : "";
    var genderLabel = t("ui.starter.genders." + gender);
    return '<span role="button" tabindex="0" class="starter-gender-option' + selectedClass + '" data-action="starter-gender-pick" data-gender="' + escapeHtml(gender) + '" aria-label="' + escapeHtml(genderLabel) + '">' + renderImage(getGenderImage(gender), genderLabel, "starter-gender-icon") + "</span>";
  }).join("") + "</span>";
}

function syncStarterCardPicker(card, speciesName) {
  var nameElement;
  var picker;
  var species;
  if (!card) {
    return;
  }
  picker = card.querySelector(".starter-gender-picker");
  if (picker) {
    picker.remove();
  }
  if (!speciesName) {
    return;
  }
  species = starterSpeciesEntry(speciesName);
  nameElement = species ? card.querySelector("strong") : null;
  if (nameElement) {
    nameElement.insertAdjacentHTML("afterend", renderStarterGenderPicker(species, ""));
  }
}

function syncStarterPickUi(previousCard, pickedCard, selectedSpeciesName) {
  clearStarterSetupError();
  closeStarterConfirmDialog();
  if (previousCard && previousCard !== pickedCard) {
    previousCard.classList.remove("is-selected");
    syncStarterCardPicker(previousCard, "");
  }
  pickedCard.classList.toggle("is-selected", !!selectedSpeciesName);
  syncStarterCardPicker(pickedCard, selectedSpeciesName);
}

function syncTrainerPickUi(previousCard, pickedCard, selectedTrainerIndex) {
  clearStarterSetupError();
  closeStarterConfirmDialog();
  if (previousCard && previousCard !== pickedCard) {
    previousCard.classList.remove("is-selected");
  }
  pickedCard.classList.toggle("is-selected", !!selectedTrainerIndex);
}

function clearStarterSetupError() {
  var error = root.querySelector(".starter-setup-error");
  if (error) {
    error.remove();
  }
}

function closeStarterConfirmDialog() {
  var dialog = root.querySelector(".starter-confirm-dialog");
  var backdrop;
  if (dialog) {
    backdrop = dialog.closest(".dialog-backdrop");
    if (backdrop) {
      backdrop.remove();
    }
  }
  if (state.dialog && state.dialog.type === "starter-confirm") {
    state.dialog = null;
  }
}

function openStarterConfirmIfReady() {
  var setup = selectedStarterSetup();
  closeStarterConfirmDialog();
  if (!isTrainerIndex(setup.trainerIndex) || !setup.speciesName) {
    return;
  }
  if ((starterSpeciesEntry(setup.speciesName) && Array.isArray(starterSpeciesEntry(setup.speciesName).gender) ? starterSpeciesEntry(setup.speciesName).gender : []).length > 1 && !setup.gender) {
    return;
  }
  state.dialog = {
    type: "starter-confirm",
    trainerIndex: setup.trainerIndex,
    speciesName: setup.speciesName,
    gender: setup.gender
  };
  root.insertAdjacentHTML("beforeend", renderDialog(state.dialog));
}

async function confirmStarterPick() {
  var result;
  var setup = selectedStarterSetup();

  if (!isTrainerIndex(setup.trainerIndex) || !setup.speciesName || !isAllowedStarterSpecies(setup.speciesName)) {
    state.starterSetup = {
      error: messageDescriptor("starter.invalidSelection"),
      loading: false,
      trainerIndex: setup.trainerIndex,
      speciesName: setup.speciesName,
      gender: setup.gender,
      generation: setup.generation
    };
    state.dialog = null;
    render();
    return;
  }

  state.starterSetup = {
    error: "",
    loading: true,
    trainerIndex: setup.trainerIndex,
    speciesName: setup.speciesName,
    gender: setup.gender,
    generation: setup.generation
  };
  state.dialog = null;
  render();

  try {
    result = await createInitialPlayerSave({
      expectedRevision: state.authoritativeRevision,
      trainerIndex: setup.trainerIndex,
      speciesKey: setup.speciesName,
      gender: setup.gender
    }, null);
  } catch (error) {
    result = { ok: false, code: "starter_save_failed" };
  }
  if (!result.ok) {
    state.starterSetup = {
      error: messageDescriptor("starter.saveFailed"),
      loading: false,
      trainerIndex: setup.trainerIndex,
      speciesName: setup.speciesName,
      gender: setup.gender,
      generation: setup.generation
    };
    render();
    return;
  }

  applyPlayerSave(result.save);
  // The starter is now persisted; later history navigation must not reopen it.
  state.playerLoadStatus = { state: "ready", message: "" };
  state.starterSetup = { error: "", loading: false };
  state.saveStatus = { state: "saved", message: "" };
  refreshMissionState({ renderOnComplete: false });
  setScene({ name: "home" }, { history: "replace" });
}
