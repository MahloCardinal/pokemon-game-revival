import { trainerSpriteByIndex } from "../data/trainers.js";
import { getItemByIndex } from "../data/items.js";
import { assetPath, escapeHtml, getGenderImage, getItemDisplayImage, getPokemonImage, getTrainerImage, renderImage, withPokemonSpriteAttrs, withPokemonSpriteClass, withTrainerSpriteAttrs, withTrainerSpriteClass } from "../client/asset-helpers.js";
import { button, formatInteger, moneyMarkup } from "../client/render-utils.js";
import { renderPokemonCard, renderPokemonCardFrame } from "../client/pokemon-card.js";
import { itemDisplayName, moveDisplayDescription, moveDisplayName, pokemonDisplayName, speciesDisplayName } from "../client/entity-text.js";
import { formatPokedollarNumber, resolveText, t } from "../client/i18n.js";
import { TRAINER_TITLES } from "../data/titles.js";

function renderTrainerTitlesInfoDialog() {
  return [
    '<div class="dialog-backdrop">',
    '  <section class="dialog trainer-titles-dialog">',
    '    <h2 class="dialog-title">' + escapeHtml(t("ui.team.trainerTitles.infoTitle")) + "</h2>",
    '    <dl class="trainer-titles-info-list">',
    TRAINER_TITLES.map(function (title) {
      return '<div class="trainer-title-info-entry"><dt>'
        + escapeHtml(t("ui.team.trainerTitles.entries." + title.key + ".name"))
        + "</dt><dd>"
        + escapeHtml(t("ui.team.trainerTitles.entries." + title.key + ".requirement"))
        + "</dd></div>";
    }).join(""),
    "    </dl>",
    '    <div class="dialog-actions">' + button(t("ui.dialogs.close"), "dialog-close", "", "button-primary") + "</div>",
    "  </section>",
    "</div>"
  ].join("");
}

function renderTeamChoiceDialog(dialog) {
  var activeIndex = dialog.activeIndex;
  return [
    '<div class="dialog-backdrop"' + (dialog.canCancel ? ' data-action="dialog-close"' : "") + ">",
    '  <section class="dialog">',
    '    <h2 class="dialog-title">' + escapeHtml(resolveText(dialog.title)) + "</h2>",
    '    <div class="dialog-copy"><p>' + escapeHtml(resolveText(dialog.copy)) + "</p></div>",
    '    <div class="team-choice-grid">',
    dialog.entries.map(function (entry, index) {
      var disabled = entry.disabled;
      var actions = '<button type="button" class="button ' + (disabled ? "" : "button-primary") + '" data-action="dialog-team-pick" data-index="' + index + '" ' + (disabled ? "disabled" : "") + ">" + escapeHtml(t("ui.dialogs.choose")) + "</button>";
      return renderPokemonCardFrame(renderPokemonCard(entry.pokemon, {
        className: index === activeIndex ? "is-active" : ""
      }), {
        statusLabel: resolveText(entry.statusLabel),
        actions: actions
      });
    }).join(""),
    "    </div>",
    '    <div class="dialog-actions">',
    dialog.canCancel ? button(t("ui.dialogs.close"), "dialog-close", "", "button-dark") : "",
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
    dialog.title ? '    <h2 class="dialog-title">' + escapeHtml(resolveText(dialog.title)) + "</h2>" : "",
    '    <div class="dialog-copy">' + dialog.lines.map(function (line) {
      return "<p>" + escapeHtml(resolveText(line)) + "</p>";
    }).join("") + "</div>",
    dialog.rewardImage || "",
    dialog.pokemon ? '    <div class="progression-card-slot battle-shop-reward-card">' + renderPokemonCard(dialog.pokemon, { className: "mini-card" }) + "</div>" : "",
    '    <div class="dialog-actions">' + button(resolveText(dialog.closeLabel, t("ui.dialogs.close")), "dialog-close", "", dialog.closeClass || "button-primary") + "</div>",
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
    '    <h2 class="dialog-title">' + escapeHtml(resolveText(dialog.title)) + "</h2>",
    '    <div class="dialog-copy">' + dialog.lines.map(function (line) {
      return "<p>" + escapeHtml(resolveText(line)) + "</p>";
    }).join("") + "</div>",
    '    <div class="dialog-actions">',
    button(resolveText(dialog.confirmLabel, t("ui.dialogs.confirm")), "dialog-confirm", "", dialog.confirmClass || "button-danger"),
    button(t("ui.dialogs.cancel"), "dialog-close", "", "button-dark"),
    "    </div>",
    "  </section>",
    "</div>"
  ].join("");
}

function renderMoveLearnDialog(dialog) {
  var move = dialog.move;
  var description = moveDisplayDescription(move);
  var moveName = moveDisplayName(move);
  var movePreview = '<div class="pokemon-card-moves progression-new-move-preview progression-mini-move-list"><button type="button" class="move-button pokemon-move-line" disabled><span class="move-name">' + escapeHtml(moveName) + (description ? ' <span class="move-effect">(' + escapeHtml(description) + ")</span>" : "") + "</span></button></div>";
  var replacementMoves = dialog.moves.map(function (knownMove, index) {
    var knownDescription = moveDisplayDescription(knownMove);
    var moveContent = '<span class="move-name">' + escapeHtml(moveDisplayName(knownMove)) + (knownDescription ? ' <span class="move-effect">(' + escapeHtml(knownDescription) + ")</span>" : "") + "</span>";
    return '<button type="button" class="move-button progression-replace-move-button" data-action="' + escapeHtml(dialog.replaceAction || "progression-replace-move") + '" data-index="' + escapeHtml(index) + '">' + moveContent + "</button>";
  }).join("");
  var replacementCard = renderPokemonCard(dialog.pokemon, {
    className: "mini-card",
    showMoves: false,
    extraContent: '<div class="pokemon-card-moves progression-replace-move-list">' + replacementMoves + "</div>"
  });
  return [
    '<div class="dialog-backdrop">',
    '  <section class="dialog progression-dialog move-learn-dialog">',
    '    <h2 class="dialog-title">' + escapeHtml(t("ui.dialogs.newMove")) + '</h2>',
    '    <div class="dialog-copy">',
    "      <p>" + escapeHtml(t("ui.dialogs.wantsToLearn", { pokemon: pokemonDisplayName(dialog.pokemon || dialog.pokemonName), move: moveName })) + "</p>",
    "    </div>",
    movePreview,
    '    <div class="dialog-copy"><p>' + escapeHtml(t("ui.dialogs.selectMoveToReplace")) + '</p></div>',
    '    <div class="progression-card-slot">' + replacementCard + "</div>",
    '    <div class="dialog-actions progression-actions">',
    button(t("ui.dialogs.skipLearning", { move: moveName }), dialog.declineAction || "progression-skip-move", "", "button-dark"),
    "    </div>",
    "  </section>",
    "</div>"
  ].join("");
}

function renderMoveLearnResultDialog(dialog) {
  return [
    '<div class="dialog-backdrop">',
    '  <section class="dialog progression-dialog move-learn-result-dialog">',
    dialog.message ? '    <div class="dialog-copy"><p>' + escapeHtml(resolveText(dialog.message)) + "</p></div>" : "",
    dialog.pokemon ? '    <div class="progression-card-slot">' + renderPokemonCard(dialog.pokemon, { className: "mini-card" }) + "</div>" : "",
    '    <div class="dialog-actions progression-actions">',
    button(t("ui.dialogs.ok"), "progression-move-result-continue", "", "button-primary"),
    "    </div>",
    "  </section>",
    "</div>"
  ].join("");
}

function renderDaycareMoveResolutionDialog(dialog) {
  var prefix = dialog.type === "training-move-resolution" ? "training" : "daycare";
  return renderMoveLearnDialog(Object.assign({}, dialog, {
    replaceAction: prefix + "-resolution-replace-move",
    declineAction: prefix + "-resolution-decline-move"
  }));
}

function renderEvolutionChoices(dialog, chooseAction, declineAction, copy) {
  var targets = (dialog.targets || []).map(function (target) {
    return '<div class="evolution-choice"><div class="evolution-preview-wrap">'
      + renderImage(getPokemonImage(target), speciesDisplayName(target.speciesKey), withPokemonSpriteClass("evolution-preview-image", target), withPokemonSpriteAttrs(target, 'loading="eager" decoding="async"'))
      + '<strong>' + escapeHtml(speciesDisplayName(target.speciesKey)) + '</strong></div>'
      + '<div class="dialog-actions progression-actions evolution-actions">'
      + button(t("ui.dialogs.evolve"), chooseAction, 'data-species-key="' + escapeHtml(target.speciesKey) + '"', "button-primary")
      + button(t("ui.dialogs.stopEvolution"), declineAction, "", "button-dark")
      + '</div></div>';
  }).join("");
  return '<div class="dialog-backdrop"><section class="dialog progression-dialog evolution-dialog">'
    + '<h2 class="dialog-title">' + escapeHtml(t("ui.dialogs.evolution")) + '</h2>'
    + '<div class="dialog-copy"><p>' + escapeHtml(copy) + '</p></div>'
    + '<div class="team-choice-grid">' + targets + '</div></section></div>';
}

function renderDaycareEvolutionResolutionDialog(dialog) {
  var prefix = dialog.type === "training-evolution-resolution" ? "training" : "daycare";
  return renderEvolutionChoices(dialog, prefix + "-resolution-choose-evolution", prefix + "-resolution-decline-evolution",
    t("ui.dialogs.chooseEvolution", { pokemon: pokemonDisplayName(dialog.pokemon || dialog.pokemonName) }));
}

function renderPokemonCenterEvolutionDialog(dialog) {
  return renderEvolutionChoices(dialog, "pokemon-center-evolution-choose", "pokemon-center-evolution-decline",
    t("ui.dialogs.chooseItemEvolution", { pokemon: pokemonDisplayName(dialog.pokemon), item: itemDisplayName(dialog.item) }));
}

function renderEvolutionDialog(dialog) {
  var resultLines = (dialog.resultLines || []).map(function (line) {
    return "      <p>" + escapeHtml(resolveText(line)) + "</p>";
  }).join("");
  var targetPokemon = dialog.targetPokemon || dialog.targetName;
  var pokemonName = pokemonDisplayName(dialog.pokemon || dialog.pokemonName);
  var targetName = pokemonDisplayName(targetPokemon);
  return [
    '<div class="dialog-backdrop">',
    '  <section class="dialog progression-dialog evolution-dialog">',
    '    <h2 class="dialog-title">' + escapeHtml(t("ui.dialogs.evolution")) + '</h2>',
    '    <div class="dialog-copy">',
    resultLines,
    "      <p>" + escapeHtml(t("ui.dialogs.wantsToEvolve", { pokemon: pokemonName, target: targetName })) + "</p>",
    "    </div>",
    '    <div class="evolution-preview-wrap">',
    renderImage(getPokemonImage(targetPokemon), targetName, withPokemonSpriteClass("evolution-preview-image", targetPokemon), withPokemonSpriteAttrs(targetPokemon, 'loading="eager" decoding="async"')),
    "    </div>",
    '    <div class="dialog-actions progression-actions evolution-actions">',
    button(t("ui.dialogs.evolve"), "progression-evolve-confirm", "", "button-primary"),
    button(t("ui.dialogs.stopEvolution"), "progression-evolve-cancel", "", "button-dark"),
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
    return "      <p>" + escapeHtml(resolveText(line)) + "</p>";
  }).join("");
  return [
    '<div class="dialog-backdrop">',
    '  <section class="dialog progression-dialog level-up-dialog">',
    '    <h2 class="dialog-title">' + escapeHtml(dialog.title ? resolveText(dialog.title) : t("ui.dialogs.levelUp")) + '</h2>',
    resultLines ? '    <div class="dialog-copy">' : "",
    resultLines,
    resultLines ? "    </div>" : "",
    '    <div class="level-up-comparison">',
    '      <div class="level-up-card-slot"><span class="level-up-card-label">' + escapeHtml(t("ui.dialogs.before")) + '</span>' + renderPokemonCard(dialog.beforePokemon, { className: "mini-card" }) + "</div>",
    '      <div class="level-up-arrow-slot">' + renderImage(assetPath("img_miscellaneous", "freccia.webp"), t("ui.dialogs.arrowAlt"), "level-up-arrow-image", 'loading="eager" decoding="async"') + "</div>",
    '      <div class="level-up-card-slot"><span class="level-up-card-label">' + escapeHtml(t("ui.dialogs.after")) + '</span>' + renderPokemonCard(dialog.afterPokemon, { className: "mini-card" }) + "</div>",
    "    </div>",
    '    <div class="dialog-actions progression-actions">',
    button(t("ui.dialogs.ok"), dialog.continueAction || "progression-level-up-continue", "", "button-primary"),
    "    </div>",
    "  </section>",
    "</div>"
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
    return "      <p>" + escapeHtml(resolveText(line)) + "</p>";
  }).join("");
  var cards = (dialog.entries || []).map(function (entry, index) {
    var pokemon = entry.pokemon;
    var assigned = Math.max(0, Math.floor(Number(entry.assigned) || 0));
    var maxAssignable = Math.max(0, Math.floor(Number(entry.maxAssignable) || 0));
    var canDecrease = assigned > 0;
    var canIncrease = remainingLevels > 0 && assigned < maxAssignable;
    var status = maxAssignable > 0 ? "" : (entry.disabledReason || t("ui.dialogs.cannotReceiveLevels"));
    var controls = [
      '<div class="training-level-controls">',
      '  <button type="button" class="button training-level-step" data-action="training-level-adjust" data-index="' + escapeHtml(index) + '" data-delta="-1" ' + (canDecrease ? "" : "disabled") + ">-</button>",
      '  <span class="training-level-assigned" aria-label="' + escapeHtml(t("ui.dialogs.assignedLevelsAria")) + '">+' + escapeHtml(assigned) + "</span>",
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
    '    <h2 class="dialog-title">' + escapeHtml(t("ui.dialogs.trainingZone")) + '</h2>',
    rewardLines ? '    <div class="dialog-copy">' + rewardLines + "    </div>" : "",
    '    <div class="training-level-summary">' + escapeHtml(t("ui.dialogs.availableLevels", { remaining: remainingLevels, total: totalLevels })) + '</div>',
    '    <div class="training-level-grid">',
    cards,
    "    </div>",
    '    <div class="dialog-actions">',
    button(t("ui.dialogs.confirm"), "training-level-confirm", confirmDisabled ? "disabled" : "", "button-accent"),
    "    </div>",
    "  </section>",
    "</div>"
  ].join("");
}

function renderEvolutionResultDialog(dialog) {
  var pokemonImageSource = dialog.pokemon || dialog.newName;
  var oldName = pokemonDisplayName(dialog.oldPokemon || dialog.oldName);
  var newName = pokemonDisplayName(pokemonImageSource);
  return [
    '<div class="dialog-backdrop">',
    '  <section class="dialog progression-dialog evolution-result-dialog">',
    '    <div class="dialog-copy">',
    "      <p>" + escapeHtml(t("ui.dialogs.evolved", { pokemon: oldName, target: newName })) + "</p>",
    "    </div>",
    '    <div class="progression-card-slot">',
    renderPokemonCard(dialog.pokemon, { className: "mini-card" }),
    "    </div>",
    '    <div class="dialog-actions progression-actions">',
    button(t("ui.dialogs.continue"), dialog.continueAction || "progression-evolution-result-continue", "", "button-primary"),
    "    </div>",
    "  </section>",
    "</div>"
  ].join("");
}

function renderStarterConfirmDialog(dialog) {
  var trainerSprite = trainerSpriteByIndex(dialog.trainerIndex);
  var speciesName = pokemonDisplayName({ speciesKey: dialog.speciesName });
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
    renderImage(getTrainerImage(trainerSprite), t("ui.dialogs.selectedTrainerAlt"), withTrainerSpriteClass("starter-confirm-trainer", trainerSprite), withTrainerSpriteAttrs(trainerSprite, 'loading="eager" decoding="async"')),
    "      </div>",
    '      <div class="starter-confirm-card starter-confirm-pokemon-card">',
    renderImage(getPokemonImage(pokemonImageSource), speciesName, withPokemonSpriteClass("starter-card-sprite starter-confirm-pokemon", pokemonImageSource), withPokemonSpriteAttrs(pokemonImageSource, 'loading="eager" decoding="async"')),
    '        <strong class="starter-confirm-pokemon-name">' + escapeHtml(speciesName) + genderIcon + "</strong>",
    "      </div>",
    "    </div>",
    '    <div class="dialog-actions starter-confirm-actions">',
    button(t("ui.dialogs.confirm"), "starter-confirm", "", "button-primary"),
    button(t("ui.dialogs.changeSelection"), "starter-change-selection", "", "button-dark"),
    "    </div>",
    "  </section>",
    "</div>"
  ].join("");
}

function renderKantoLeagueEntryDialog(dialog) {
  var gridClass = "floating-panel-grid floating-panel-grid-count-" + Math.min(3, Math.max(1, (dialog.entries || []).length));
  var teamButtons = (dialog.entries || []).map(function (entry, index) {
    return '<button type="button" class="floating-panel-btn pokemon_choice-button selectable" data-action="kanto-league-entry-pick" data-index="' + index + '">' + escapeHtml(pokemonDisplayName(entry.pokemon || entry.name)) + "</button>";
  }).join("");
  return [
    '<div class="dialog-backdrop">',
    '  <section class="dialog kanto-league-entry-dialog">',
    '    <h2 class="dialog-title">' + escapeHtml(t("ui.dialogs.eliteFour")) + '</h2>',
    '    <div class="kanto-league-entry-content">',
    dialog.trainerImage ? renderImage(dialog.trainerImage, dialog.trainerName, "kanto-league-entry-trainer") : "",
    '      <p class="kanto-league-entry-text">' + escapeHtml(t("ui.dialogs.startChallenge", { trainer: dialog.trainerName })) + '</p>',
    "    </div>",
    '    <h3 class="kanto-league-entry-subtitle">' + escapeHtml(t("ui.dialogs.chooseLeadPokemon")) + '</h3>',
    '    <div class="' + gridClass + ' kanto-league-entry-grid">',
    teamButtons,
    "    </div>",
    "  </section>",
    "</div>"
  ].join("");
}

function renderRewardClaimDialog(dialog) {
  var reward = dialog.reward || {};
  var item = reward.kind === "item" ? getItemByIndex(reward.itemIndex) : null;
  var name = t("ui.pokefan.fallbackReward");
  var image = "";
  if (dialog.pokemon) {
    name = pokemonDisplayName(dialog.pokemon);
    image = renderImage(getPokemonImage(dialog.pokemon), name,
      withPokemonSpriteClass("claimed-reward-pokemon", dialog.pokemon),
      withPokemonSpriteAttrs(dialog.pokemon));
  } else if (item) {
    name = itemDisplayName(item);
    image = renderImage(getItemDisplayImage(item), name, "claimed-reward-item");
    if (Number(reward.quantity) > 1) {
      name = t("messages.rewards.quantity", { quantity: formatInteger(reward.quantity), reward: name });
    }
  } else if (reward.kind === "money") {
    name = t("messages.rewards.money", { quantity: formatPokedollarNumber(reward.quantity) });
    image = moneyMarkup(reward.quantity);
  }
  return renderMessageDialog({
    title: dialog.title,
    lines: [t("messages.rewards.claimed", { reward: name })],
    rewardImage: (image ? '<div class="claimed-reward-image">' + image + "</div>" : "")
      + (dialog.pokemon ? '<div class="dialog-copy"><p>' + escapeHtml(t("messages.rewards.sentToBox")) + "</p></div>" : ""),
    closeLabel: t("ui.dialogs.ok"),
    closeClass: "button-accent"
  });
}

export function renderDialog(dialog) {
  if (!dialog) {
    return "";
  }
  if (dialog.forgetConfirmation) {
    var underlying = renderDialog(Object.assign({}, dialog, { forgetConfirmation: null }));
    return underlying.replace('<div class="dialog-backdrop">', '<div class="dialog-backdrop" inert aria-hidden="true">')
      + '<div class="dialog-backdrop move-forget-backdrop"><section class="dialog" role="alertdialog" aria-modal="true" aria-labelledby="move-forget-title">'
      + '<h2 class="dialog-title" id="move-forget-title">' + escapeHtml(t("messages.progression.confirmForget", { move: moveDisplayName(dialog.forgetConfirmation.move) })) + '</h2>'
      + '<div class="dialog-actions">'
      + button(t("ui.dialogs.yes"), "move-forget-confirm", "", "button-primary")
      + button(t("ui.dialogs.no"), "move-forget-cancel", "", "button-dark")
      + '</div></section></div>';
  }
  if (dialog.type === "pokemon-center-move-resolution") {
    return renderMoveLearnDialog(Object.assign({}, dialog, {
      replaceAction: "pokemon-center-resolution-replace-move",
      declineAction: "pokemon-center-resolution-decline-move"
    }));
  }
  if (dialog.type === "message") {
    return renderMessageDialog(dialog);
  }
  if (dialog.type === "reward-claimed") {
    return renderRewardClaimDialog(dialog);
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
  if (dialog.type === "trainer-titles-info") {
    return renderTrainerTitlesInfoDialog();
  }
  return "";
}
