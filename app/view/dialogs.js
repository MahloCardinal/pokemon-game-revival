import { trainerSpriteByIndex } from "../data/trainers.js";
import { formatDescription } from "../engine/index.js";
import { assetPath, escapeHtml, getGenderImage, getPokemonDisplayName, getPokemonImage, getTrainerImage, renderImage, withPokemonSpriteAttrs, withPokemonSpriteClass, withTrainerSpriteAttrs, withTrainerSpriteClass } from "../client/asset-helpers.js";
import { button } from "../client/render-utils.js";
import { renderPokemonCard, renderPokemonCardFrame } from "../client/pokemon-card.js";

function renderTeamChoiceDialog(dialog) {
  var activeIndex = dialog.activeIndex;
  return [
    '<div class="dialog-backdrop"' + (dialog.canCancel ? ' data-action="dialog-close"' : "") + ">",
    '  <section class="dialog">',
    '    <h2 class="dialog-title">' + escapeHtml(dialog.title) + "</h2>",
    '    <div class="dialog-copy"><p>' + escapeHtml(dialog.copy) + "</p></div>",
    '    <div class="team-choice-grid">',
    dialog.entries.map(function (entry, index) {
      var disabled = entry.disabled;
      var actions = '<button type="button" class="button ' + (disabled ? "" : "button-primary") + '" data-action="dialog-team-pick" data-index="' + index + '" ' + (disabled ? "disabled" : "") + ">Scegli</button>";
      return renderPokemonCardFrame(renderPokemonCard(entry.pokemon, {
        className: index === activeIndex ? "is-active" : ""
      }), {
        statusLabel: entry.statusLabel,
        actions: actions
      });
    }).join(""),
    "    </div>",
    '    <div class="dialog-actions">',
    dialog.canCancel ? button("Chiudi", "dialog-close", "", "button-dark") : "",
    "    </div>",
    "  </section>",
    "</div>"
  ].join("");
}

export function renderMessageDialog(dialog) {
  var backdropAttrs = dialog.inline ? " data-inline-dialog" : "";
  if (!dialog.requireButtonClose) {
    backdropAttrs += ' data-action="dialog-close"';
  }
  return [
    '<div class="dialog-backdrop"' + backdropAttrs + ">",
    '  <section class="dialog message-dialog">',
    dialog.title ? '    <h2 class="dialog-title">' + escapeHtml(dialog.title) + "</h2>" : "",
    '    <div class="dialog-copy">' + dialog.lines.map(function (line) {
      return "<p>" + escapeHtml(line) + "</p>";
    }).join("") + "</div>",
    dialog.pokemon ? '    <div class="progression-card-slot battle-shop-reward-card">' + renderPokemonCard(dialog.pokemon, { className: "mini-card" }) + "</div>" : "",
    '    <div class="dialog-actions">' + button(dialog.closeLabel || "Chiudi", "dialog-close", "", dialog.closeClass || "button-primary") + "</div>",
    "  </section>",
    "</div>"
  ].join("");
}

export function renderConfirmDialog(dialog) {
  var backdropAttrs = dialog.inline ? " data-inline-dialog" : "";
  if (!dialog.requireButtonClose) {
    backdropAttrs += ' data-action="dialog-close"';
  }
  return [
    '<div class="dialog-backdrop"' + backdropAttrs + ">",
    '  <section class="dialog">',
    '    <h2 class="dialog-title">' + escapeHtml(dialog.title) + "</h2>",
    '    <div class="dialog-copy">' + dialog.lines.map(function (line) {
      return "<p>" + escapeHtml(line) + "</p>";
    }).join("") + "</div>",
    '    <div class="dialog-actions">',
    button(dialog.confirmLabel || "Conferma", "dialog-confirm", "", dialog.confirmClass || "button-danger"),
    button("Annulla", "dialog-close", "", "button-dark"),
    "    </div>",
    "  </section>",
    "</div>"
  ].join("");
}

function renderMoveLearnDialog(dialog) {
  var move = dialog.move;
  var description = formatDescription(move);
  var movePreview = '<div class="pokemon-card-moves progression-new-move-preview progression-mini-move-list"><button type="button" class="move-button pokemon-move-line" disabled><span class="move-name">' + escapeHtml(move.name) + (description ? ' <span class="move-effect">(' + escapeHtml(description) + ")</span>" : "") + "</span></button></div>";
  var replacementMoves = dialog.moves.map(function (knownMove, index) {
    var knownDescription = formatDescription(knownMove);
    var moveContent = '<span class="move-name">' + escapeHtml(knownMove.name) + (knownDescription ? ' <span class="move-effect">(' + escapeHtml(knownDescription) + ")</span>" : "") + "</span>";
    return '<button type="button" class="move-button progression-replace-move-button" data-action="progression-replace-move" data-index="' + escapeHtml(index) + '">' + moveContent + "</button>";
  }).join("");
  var replacementCard = renderPokemonCard(dialog.pokemon, {
    className: "mini-card",
    showMoves: false,
    extraContent: '<div class="pokemon-card-moves progression-replace-move-list">' + replacementMoves + "</div>"
  });
  return [
    '<div class="dialog-backdrop">',
    '  <section class="dialog progression-dialog move-learn-dialog">',
    '    <h2 class="dialog-title">Nuova mossa</h2>',
    '    <div class="dialog-copy">',
    "      <p>" + escapeHtml(dialog.pokemonName) + " vuole imparare " + escapeHtml(move.name) + "</p>",
    "    </div>",
    movePreview,
    '    <div class="dialog-copy"><p>Seleziona quale mossa sostituire</p></div>',
    '    <div class="progression-card-slot">' + replacementCard + "</div>",
    '    <div class="dialog-actions progression-actions">',
    button("Annulla l'apprendimento di " + move.name, "progression-skip-move", "", "button-dark"),
    "    </div>",
    "  </section>",
    "</div>"
  ].join("");
}

function renderMoveLearnResultDialog(dialog) {
  return [
    '<div class="dialog-backdrop">',
    '  <section class="dialog progression-dialog move-learn-result-dialog">',
    dialog.message ? '    <div class="dialog-copy"><p>' + escapeHtml(dialog.message) + "</p></div>" : "",
    dialog.pokemon ? '    <div class="progression-card-slot">' + renderPokemonCard(dialog.pokemon, { className: "mini-card" }) + "</div>" : "",
    '    <div class="dialog-actions progression-actions">',
    button("Ok", "progression-move-result-continue", "", "button-primary"),
    "    </div>",
    "  </section>",
    "</div>"
  ].join("");
}

function renderDaycareMoveResolutionDialog(dialog) {
  var training = dialog.type === "training-move-resolution";
  var replaceAction = training ? "training-resolution-replace-move" : "daycare-resolution-replace-move";
  var declineAction = training ? "training-resolution-decline-move" : "daycare-resolution-decline-move";
  var replacementMoves = (dialog.moves || []).map(function (move, index) {
    return '<button type="button" class="move-button progression-replace-move-button" data-action="' + replaceAction + '" data-index="' + escapeHtml(index) + '"><span class="move-name">' + escapeHtml(move.name) + "</span></button>";
  }).join("");
  return [
    '<div class="dialog-backdrop">',
    '  <section class="dialog progression-dialog move-learn-dialog">',
    '    <h2 class="dialog-title">' + (training ? "Zona Allenamento" : "Rientro dalla Pensione") + "</h2>",
    '    <div class="dialog-copy"><p>' + escapeHtml(dialog.pokemonName) + " può imparare " + escapeHtml(dialog.moveName) + ".</p><p>Seleziona quale mossa sostituire.</p></div>",
    '    <div class="pokemon-card-moves progression-replace-move-list">' + replacementMoves + "</div>",
    '    <div class="dialog-actions progression-actions">',
    button("Non imparare " + dialog.moveName, declineAction, "", "button-dark"),
    "    </div>",
    "  </section>",
    "</div>"
  ].join("");
}

function renderDaycareEvolutionResolutionDialog(dialog) {
  var training = dialog.type === "training-evolution-resolution";
  var chooseAction = training ? "training-resolution-choose-evolution" : "daycare-resolution-choose-evolution";
  var declineAction = training ? "training-resolution-decline-evolution" : "daycare-resolution-decline-evolution";
  var targets = (dialog.targets || []).map(function (target) {
    return '<button type="button" class="capture-starter-slot battle-switch-choice" data-action="' + chooseAction + '" data-species-key="' + escapeHtml(target.speciesKey) + '">' +
      renderImage(getPokemonImage(target), target.name, withPokemonSpriteClass("evolution-preview-image", target), withPokemonSpriteAttrs(target, 'loading="eager" decoding="async"')) +
      "<strong>" + escapeHtml(target.name) + "</strong></button>";
  }).join("");
  return [
    '<div class="dialog-backdrop">',
    '  <section class="dialog progression-dialog evolution-dialog">',
    '    <h2 class="dialog-title">Evoluzione</h2>',
    '    <div class="dialog-copy"><p>Scegli se far evolvere ' + escapeHtml(dialog.pokemonName) + ".</p></div>",
    '    <div class="team-choice-grid">' + targets + "</div>",
    '    <div class="dialog-actions progression-actions">',
    button("Blocca evoluzione", declineAction, "", "button-dark"),
    "    </div>",
    "  </section>",
    "</div>"
  ].join("");
}

function renderPokemonCenterEvolutionDialog(dialog) {
  var targets = (dialog.targets || []).map(function (target) {
    return '<button type="button" class="capture-starter-slot battle-switch-choice" data-action="pokemon-center-evolution-choose" data-species-key="' + escapeHtml(target.speciesKey) + '">' +
      renderImage(getPokemonImage(target), target.name, withPokemonSpriteClass("evolution-preview-image", target), withPokemonSpriteAttrs(target, 'loading="eager" decoding="async"')) +
      "<strong>" + escapeHtml(target.name) + "</strong></button>";
  }).join("");
  return [
    '<div class="dialog-backdrop">',
    '  <section class="dialog progression-dialog evolution-dialog">',
    '    <h2 class="dialog-title">Evoluzione</h2>',
    '    <div class="dialog-copy"><p>Scegli se far evolvere ' + escapeHtml(dialog.pokemonName) + " usando " + escapeHtml(dialog.itemName) + ".</p></div>",
    '    <div class="team-choice-grid">' + targets + "</div>",
    '    <div class="dialog-actions progression-actions">',
    button("Blocca evoluzione", "pokemon-center-evolution-decline", "", "button-dark"),
    "    </div>",
    "  </section>",
    "</div>"
  ].join("");
}

function renderEvolutionDialog(dialog) {
  var resultLines = (dialog.resultLines || []).map(function (line) {
    return "      <p>" + escapeHtml(line) + "</p>";
  }).join("");
  var targetPokemon = dialog.targetPokemon || dialog.targetName;
  return [
    '<div class="dialog-backdrop">',
    '  <section class="dialog progression-dialog evolution-dialog">',
    '    <h2 class="dialog-title">Evoluzione</h2>',
    '    <div class="dialog-copy">',
    resultLines,
    "      <p>" + escapeHtml(dialog.pokemonName) + " vorrebbe evolversi in " + escapeHtml(dialog.targetName) + ".</p>",
    "    </div>",
    '    <div class="evolution-preview-wrap">',
    renderImage(getPokemonImage(targetPokemon), dialog.targetName, withPokemonSpriteClass("evolution-preview-image", targetPokemon), withPokemonSpriteAttrs(targetPokemon, 'loading="eager" decoding="async"')),
    "    </div>",
    '    <div class="dialog-actions progression-actions evolution-actions">',
    button("Evolvi", "progression-evolve-confirm", "", "button-primary"),
    button("Blocca evoluzione", "progression-evolve-cancel", "", "button-dark"),
    "    </div>",
    "  </section>",
    "</div>"
  ].join("");
}

function renderLevelUpDialog(dialog) {
  var resultLines = (dialog.resultLines || []).map(function (line) {
    if (!String(line || "").trim()) {
      return "";
    }
    return "      <p>" + escapeHtml(line) + "</p>";
  }).join("");
  return [
    '<div class="dialog-backdrop">',
    '  <section class="dialog progression-dialog level-up-dialog">',
    '    <h2 class="dialog-title">Sale di livello</h2>',
    resultLines ? '    <div class="dialog-copy">' : "",
    resultLines,
    resultLines ? "    </div>" : "",
    '    <div class="level-up-comparison">',
    '      <div class="level-up-card-slot"><span class="level-up-card-label">Prima</span>' + renderPokemonCard(dialog.beforePokemon, { className: "mini-card" }) + "</div>",
    '      <div class="level-up-arrow-slot">' + renderImage(assetPath("img_miscellaneous", "freccia.webp"), "Freccia", "level-up-arrow-image", 'loading="eager" decoding="async"') + "</div>",
    '      <div class="level-up-card-slot"><span class="level-up-card-label">Dopo</span>' + renderPokemonCard(dialog.afterPokemon, { className: "mini-card" }) + "</div>",
    "    </div>",
    '    <div class="dialog-actions progression-actions">',
    button("Ok", dialog.continueAction || "progression-level-up-continue", "", "button-primary"),
    "    </div>",
    "  </section>",
    "</div>"
  ].join("");
}

function renderExperienceDialog(dialog) {
  return [
    '<div class="dialog-backdrop">',
    '  <section class="dialog progression-dialog experience-dialog">',
    '    <h2 class="dialog-title">Esperienza acquisita</h2>',
    '    <div class="dialog-copy experience-copy">',
    '      <p>' + escapeHtml(dialog.pokemon.name) + ' ha guadagnato <strong class="experience-points">' + escapeHtml(dialog.exp) + '</strong> punti esperienza</p>',
    '    </div>',
    '    <div class="experience-card-slot">',
    renderPokemonCard(dialog.pokemon, { className: "mini-card" }),
    '    </div>',
    '    <div class="dialog-actions progression-actions">',
    button("Continua", "dialog-close", "", "button-primary"),
    '    </div>',
    '  </section>',
    '</div>'
  ].join("");
}

function renderTrainingLevelAssignmentDialog(dialog) {
  var totalLevels = Math.max(0, Math.floor(Number(dialog.totalLevels) || 0));
  var assignedTotal = (dialog.entries || []).reduce(function (sum, entry) {
    return sum + Math.max(0, Math.floor(Number(entry.assigned) || 0));
  }, 0);
  var remainingLevels = Math.max(0, totalLevels - assignedTotal);
  var canAssignMore = remainingLevels > 0 && (dialog.entries || []).some(function (entry) {
    return entry && entry.assigned < entry.maxAssignable;
  });
  var confirmDisabled = remainingLevels > 0 && canAssignMore;
  var rewardLines = (dialog.lines || []).map(function (line) {
    return "      <p>" + escapeHtml(line) + "</p>";
  }).join("");
  var cards = (dialog.entries || []).map(function (entry, index) {
    var pokemon = entry.pokemon;
    var assigned = Math.max(0, Math.floor(Number(entry.assigned) || 0));
    var maxAssignable = Math.max(0, Math.floor(Number(entry.maxAssignable) || 0));
    var canDecrease = assigned > 0;
    var canIncrease = remainingLevels > 0 && assigned < maxAssignable;
    var status = maxAssignable > 0 ? "" : (entry.disabledReason || "Non può ricevere livelli");
    var controls = [
      '<div class="training-level-controls">',
      '  <button type="button" class="button training-level-step" data-action="training-level-adjust" data-index="' + escapeHtml(index) + '" data-delta="-1" ' + (canDecrease ? "" : "disabled") + ">-</button>",
      '  <span class="training-level-assigned" aria-label="Livelli assegnati">+' + escapeHtml(assigned) + "</span>",
      '  <button type="button" class="button button-primary training-level-step" data-action="training-level-adjust" data-index="' + escapeHtml(index) + '" data-delta="1" ' + (canIncrease ? "" : "disabled") + ">+</button>",
      "</div>",
      status ? '<p class="training-level-status">' + escapeHtml(status) + "</p>" : ""
    ].join("");
    return renderPokemonCardFrame(renderPokemonCard(pokemon, {
      className: "mini-card training-level-card"
    }), {
      actions: controls,
      className: maxAssignable > 0 ? "" : "is-disabled"
    });
  }).join("");
  return [
    '<div class="dialog-backdrop">',
    '  <section class="dialog training-level-dialog">',
    '    <h2 class="dialog-title">Zona allenamento</h2>',
    rewardLines ? '    <div class="dialog-copy">' + rewardLines + "    </div>" : "",
    '    <div class="training-level-summary">Livelli disponibili: <strong>' + escapeHtml(remainingLevels) + " / " + escapeHtml(totalLevels) + "</strong></div>",
    '    <div class="training-level-grid">',
    cards,
    "    </div>",
    '    <div class="dialog-actions">',
    button("Conferma", "training-level-confirm", confirmDisabled ? "disabled" : "", "button-accent"),
    "    </div>",
    "  </section>",
    "</div>"
  ].join("");
}

function renderEvolutionResultDialog(dialog) {
  var pokemonImageSource = dialog.pokemon || dialog.newName;
  return [
    '<div class="dialog-backdrop">',
    '  <section class="dialog progression-dialog evolution-result-dialog">',
    '    <div class="dialog-copy">',
    "      <p>" + escapeHtml(dialog.oldName) + " si è evoluto in " + escapeHtml(dialog.newName) + "!</p>",
    "    </div>",
    '    <div class="evolution-result-image-wrap">',
    renderImage(getPokemonImage(pokemonImageSource), dialog.newName, withPokemonSpriteClass("evolution-result-image", pokemonImageSource), withPokemonSpriteAttrs(pokemonImageSource, 'loading="eager" decoding="async"')),
    "    </div>",
    '    <div class="dialog-actions progression-actions">',
    button("Continua", "progression-evolution-result-continue", "", "button-primary"),
    "    </div>",
    "  </section>",
    "</div>"
  ].join("");
}

function renderStarterConfirmDialog(dialog) {
  var trainerSprite = trainerSpriteByIndex(dialog.trainerIndex);
  var speciesName = getPokemonDisplayName(dialog.speciesName);
  var genderIcon = dialog.gender ? renderImage(getGenderImage(dialog.gender), dialog.gender, "starter-confirm-gender-icon") : "";
  var pokemonImageSource = {
    speciesKey: dialog.speciesName,
    gender: dialog.gender || null
  };
  return [
    '<div class="dialog-backdrop">',
    '  <section class="dialog starter-confirm-dialog">',
    '    <div class="starter-confirm-preview">',
    '      <div class="starter-confirm-card starter-confirm-trainer-card">',
    renderImage(getTrainerImage(trainerSprite), "Allenatore scelto", withTrainerSpriteClass("starter-confirm-trainer", trainerSprite), withTrainerSpriteAttrs(trainerSprite, 'loading="eager" decoding="async"')),
    "      </div>",
    '      <div class="starter-confirm-card starter-confirm-pokemon-card">',
    renderImage(getPokemonImage(pokemonImageSource), speciesName, withPokemonSpriteClass("starter-card-sprite starter-confirm-pokemon", pokemonImageSource), withPokemonSpriteAttrs(pokemonImageSource, 'loading="eager" decoding="async"')),
    '        <strong class="starter-confirm-pokemon-name">' + escapeHtml(speciesName) + genderIcon + "</strong>",
    "      </div>",
    "    </div>",
    '    <div class="dialog-actions starter-confirm-actions">',
    button("Conferma", "starter-confirm", "", "button-primary"),
    button("Cambia scelta", "starter-change-selection", "", "button-dark"),
    "    </div>",
    "  </section>",
    "</div>"
  ].join("");
}

function renderKantoLeagueEntryDialog(dialog) {
  var gridClass = "floating-panel-grid floating-panel-grid-count-" + Math.min(3, Math.max(1, (dialog.entries || []).length));
  var teamButtons = (dialog.entries || []).map(function (entry, index) {
    return '<button type="button" class="floating-panel-btn pokemon_choice-button selectable" data-action="kanto-league-entry-pick" data-index="' + index + '">' + escapeHtml(entry.name || entry.pokemon.name) + "</button>";
  }).join("");
  return [
    '<div class="dialog-backdrop">',
    '  <section class="dialog kanto-league-entry-dialog">',
    '    <h2 class="dialog-title">Superquattro</h2>',
    '    <div class="kanto-league-entry-content">',
    dialog.trainerImage ? renderImage(dialog.trainerImage, dialog.trainerName, "kanto-league-entry-trainer") : "",
    '      <p class="kanto-league-entry-text">Inizia la tua sfida con ' + escapeHtml(dialog.trainerName) + "!</p>",
    "    </div>",
    '    <h3 class="kanto-league-entry-subtitle">Scegli il pok\u00e9mon da mandare in campo</h3>',
    '    <div class="' + gridClass + ' kanto-league-entry-grid">',
    teamButtons,
    "    </div>",
    "  </section>",
    "</div>"
  ].join("");
}

export function renderDialog(dialog) {
  if (!dialog) {
    return "";
  }
  if (dialog.type === "message") {
    return renderMessageDialog(dialog);
  }
  if (dialog.type === "confirm") {
    return renderConfirmDialog(dialog);
  }
  if (dialog.type === "move-learn") {
    return renderMoveLearnDialog(dialog);
  }
  if (dialog.type === "move-learn-result") {
    return renderMoveLearnResultDialog(dialog);
  }
  if (dialog.type === "daycare-move-resolution" || dialog.type === "training-move-resolution") {
    return renderDaycareMoveResolutionDialog(dialog);
  }
  if (dialog.type === "daycare-evolution-resolution" || dialog.type === "training-evolution-resolution") {
    return renderDaycareEvolutionResolutionDialog(dialog);
  }
  if (dialog.type === "pokemon-center-evolution") {
    return renderPokemonCenterEvolutionDialog(dialog);
  }
  if (dialog.type === "evolution") {
    return renderEvolutionDialog(dialog);
  }
  if (dialog.type === "level-up") {
    return renderLevelUpDialog(dialog);
  }
  if (dialog.type === "experience") {
    return renderExperienceDialog(dialog);
  }
  if (dialog.type === "training-level-assignment") {
    return renderTrainingLevelAssignmentDialog(dialog);
  }
  if (dialog.type === "evolution-result") {
    return renderEvolutionResultDialog(dialog);
  }
  if (dialog.type === "team-choose") {
    return renderTeamChoiceDialog(dialog);
  }
  if (dialog.type === "starter-confirm") {
    return renderStarterConfirmDialog(dialog);
  }
  if (dialog.type === "kanto-league-entry") {
    return renderKantoLeagueEntryDialog(dialog);
  }
  return "";
}
