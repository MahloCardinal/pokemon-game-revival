import { TRAINING_ZONE_DEBUG_DIFFICULTY, TRAINING_ZONE_DIFFICULTIES, normalizeTrainingOpponentProfile, trainingAssignableLevelsForTeam, trainingDifficultyConfig, trainingOpponentLevel } from "../client/training-data.js";
import { isDebugUser, renderDebugPokemonCreatorPanel } from "../client/debug-tools.js";
import { state } from "../client/game-state.js";
import * as Engine from "../engine/index.js";

var TEAM_MAX = Engine.TEAM_MAX;
import { escapeHtml, getTrainerImage, renderImage, withTrainerSpriteAttrs, withTrainerSpriteClass } from "../client/asset-helpers.js";
import { battlePointsMarkup, button, moneyMarkup, renderScenePresentationPanel, sceneShell } from "../client/render-utils.js";
import { renderPokemonCard, renderPokemonCardFrame } from "../client/pokemon-card.js";

export function renderTrainingZoneScene() {
  var selectedDifficulty = state.scene.trainingDifficulty || "";
  var selectedConfig = trainingDifficultyConfig(selectedDifficulty);
  var opponentTeam = Array.isArray(state.scene.trainingOpponentTeam) ? state.scene.trainingOpponentTeam : [];
  var opponentProfile = normalizeTrainingOpponentProfile(state.scene.trainingOpponent);
  var debugTrainingEnabled = isDebugUser();
  var isDebugTraining = debugTrainingEnabled && selectedDifficulty === TRAINING_ZONE_DEBUG_DIFFICULTY.key;
  var availableDifficulties = TRAINING_ZONE_DIFFICULTIES.concat(debugTrainingEnabled ? [TRAINING_ZONE_DEBUG_DIFFICULTY] : []);
  var rewardCards = availableDifficulties.map(function (difficulty) {
    var displayDifficulty = difficulty.debug ? difficulty : trainingDifficultyConfig(difficulty.key);
    var assignableLevels = difficulty.debug ? 0 : trainingAssignableLevelsForTeam(state.team, displayDifficulty.expLevels);
    var activeClass = difficulty.key === selectedDifficulty ? " is-selected" : "";
    var targetLevel = trainingOpponentLevel(state.team, difficulty.key);
    var prizeSection = difficulty.debug
      ? ""
      : [
        '  <span class="training-zone-prize-section">',
        '    <span class="training-zone-prize-title">' + (displayDifficulty.fullRewardAvailable ? "Premio pieno giornaliero" : "Ricompensa ripetuta") + '</span>',
        '    <span class="training-zone-prize-list">',
        '      <span class="gym-badge-row training-zone-prize-row">Livelli: +' + escapeHtml(assignableLevels) + "</span>",
        '      <span class="gym-badge-row training-zone-prize-row">' + (battlePointsMarkup(displayDifficulty.battlePoints)) + "</span>",
        "    </span>",
        "  </span>"
      ].join("");
    return [
      '<button type="button" class="training-zone-reward-card' + activeClass + '" data-action="training-zone-difficulty" data-difficulty="' + escapeHtml(difficulty.key) + '" aria-pressed="' + (difficulty.key === selectedDifficulty ? "true" : "false") + '" ' + (state.battleStartPending ? "disabled" : "") + '>',
      '  <span class="training-zone-difficulty-title">Difficolt&agrave;: ' + escapeHtml(difficulty.label) + "</span>",
      '  <span class="training-zone-difficulty-level">' + (difficulty.debug ? "Team avversario personalizzato" : "Livello Pokémon avversari: " + escapeHtml(targetLevel)) + "</span>",
      prizeSection,
      "</button>"
    ].join("");
  }).join("");
  var hasOpponent = state.scene.trainingOpponent !== null && state.scene.trainingOpponent !== undefined;
  var searchAttrs = selectedConfig && !state.battleStartPending ? "" : "disabled";
  var battleAttrs = !state.battleStartPending && selectedConfig && state.team.filter(Boolean).length
    && (opponentTeam.length || !selectedConfig.debug && state.scene.trainingAuthoritativeReady) ? "" : "disabled";
  var debugPokemonCreator = isDebugTraining && hasOpponent
    ? renderDebugPokemonCreatorPanel({
      action: "training-zone-debug-add-pokemon",
      buttonLabel: "Aggiungi Pokemon",
      className: "training-zone-debug-pokemon-panel",
      count: opponentTeam.length,
      max: TEAM_MAX,
      title: "Pokemon sfidante"
    })
    : "";
  var opponentCards = opponentTeam.map(function (pokemon, index) {
    var card = renderPokemonCard(pokemon, {
      className: "mini-card",
      showMoves: true,
      imageAttrs: 'loading="eager" decoding="async"'
    });
    return isDebugTraining && hasOpponent
      ? renderPokemonCardFrame(card, { actions: button("Togli Pokémon", "training-zone-debug-remove-pokemon", 'data-index="' + escapeHtml(index) + '"', "button-dark button-slim") })
      : card;
  }).join("");
  if (isDebugTraining && hasOpponent && !opponentCards) {
    opponentCards = '<div class="empty-state">Aggiungi almeno un Pokémon allo sfidante.</div>';
  }
  var challenger = opponentTeam.length || (isDebugTraining && hasOpponent)
    ? [
      '  <section class="panel training-zone-challenger-panel"><div class="panel-inner training-zone-challenger">',
      '    <div class="training-zone-trainer-cell">',
      '      <div class="trainer-profile-media training-zone-trainer-media">',
      renderImage(getTrainerImage(opponentProfile.sprite), opponentProfile.name, withTrainerSpriteClass("trainer-profile-image", opponentProfile.sprite), withTrainerSpriteAttrs(opponentProfile.sprite, 'loading="eager" decoding="async"')),
      "      </div>",
      '      <h2 class="stack-title">' + escapeHtml(opponentProfile.name) + "</h2>",
      "    </div>",
      '    <div class="training-zone-team-grid">' + opponentCards + "</div>",
      debugPokemonCreator,
      "  </div></section>"
    ].join("")
    : state.scene.trainingAuthoritativeReady
      ? '<section class="panel training-zone-challenger-panel"><div class="panel-inner"><p class="empty-state">Lo sfidante e la sua squadra saranno generati dal motore autoritativo all\'avvio.</p></div></section>'
      : "";
  var content = [
    '<section class="team-scene-stack training-zone-layout">',
    renderScenePresentationPanel("Zona allenamento", "training-zone-info-panel"),
    '  <section class="panel training-zone-panel"><div class="panel-inner stack">',
    '    <div class="training-zone-control-row">',
    '      <div class="training-zone-reward-grid">' + rewardCards + "</div>",
    '      <div class="training-zone-combat-row">' + button("Cerca sfidante", "training-zone-search", searchAttrs, "button-accent") + button("Combatti", "training-zone-start", battleAttrs, "button-primary") + "</div>",
    "    </div>",
    "  </div></section>",
    challenger,
    "</section>"
  ].join("");

  return sceneShell("Zona allenamento", "", content, "", "scene-content-training-zone", "parent-back");
}
