import { registerAction } from "./action-registry.js";
import { blockActionDuringBattle } from "./battle-handler.js";
import { openInlineMessage } from "./dialog-handler.js";
import { reindexActionButtons } from "./action-dom.js";
import { markDirty, render, renderRegions } from "./renderer.js";
import { saveAfterStateChange } from "./save-runtime.js";
import { applyPlayerSave, state } from "./game-state.js";
import { broadcastTeamBoxRuntimeState } from "./runtime-state.js";
import { updateCaptureTeamRuntimeInline } from "./capture-handler.js";
import { assignNextBoxIndex, queueBoxUpsert, removePokemonCardInline } from "./box-handler.js";
import { getCurrentPlayerState, moveTeamPokemonToBoxAuthoritative, swapTeamPokemonSlotsAuthoritative } from "../api/player-command.js";
import { saveFromAuthoritativeProjection } from "../api/player.js";
import { messageDescriptor } from "./i18n.js";

var authoritativeTeamCommandPending = false;
var authoritativeRuntimeRefreshInFlight = null;

registerAction("team-to-box", async function(element) {
  var teamIndex = Number(element.dataset.index);
  var pokemonToBox;
  var result;
  var hadMoveSelection = state.scene && Number.isInteger(Number(state.scene.teamMoveIndex));
  if (blockActionDuringBattle([messageDescriptor("team.depositDuringBattle")], { title: messageDescriptor("team.title") })) {
    return;
  }
  if (state.team.length <= 1) {
    openInlineMessage([messageDescriptor("team.minimumOne")], { title: messageDescriptor("team.title") });
    return;
  }
  if (authoritativeTeamCommandPending || !state.team[teamIndex] || !state.team[teamIndex].instanceId) {
    return;
  }
  authoritativeTeamCommandPending = true;
  try {
    result = await moveTeamPokemonToBoxAuthoritative({
      expectedRevision: state.authoritativeRevision,
      pokemonInstanceId: state.team[teamIndex].instanceId
    });
    if (!result.ok) {
      openInlineMessage([messageDescriptor("team.depositFailed")], { title: messageDescriptor("team.title") });
      return;
    }
    applyPlayerSave(saveFromAuthoritativeProjection(result.projection));
    if (state.scene) state.scene.teamMoveIndex = null;
    broadcastTeamBoxRuntimeState();
    renderRegions(["trainer-team"]);
  } finally {
    authoritativeTeamCommandPending = false;
  }
  return;
});

registerAction("team-move-start", function(element) {
    var teamIndex = Number(element.dataset.index);
    if (blockActionDuringBattle([messageDescriptor("team.moveDuringBattle")], { title: messageDescriptor("team.title") })) {
      return;
    }
    if (!state.scene || state.scene.name !== "team" || !state.team[teamIndex]) {
      return;
    }
    state.scene.teamMoveIndex = teamIndex;
    renderRegions(["trainer-team"]);
    return;

});

registerAction("team-move-cancel", function() {
    if (state.scene) {
      state.scene.teamMoveIndex = null;
    }
    renderRegions(["trainer-team"]);
    return;

});

registerAction("team-move-place", async function(element) {
  var targetIndex = Number(element.dataset.index);
  var sourceIndex = state.scene && state.scene.teamMoveIndex !== null && state.scene.teamMoveIndex !== undefined ? Number(state.scene.teamMoveIndex) : NaN;
  var swapPokemon;
  var result;
  if (blockActionDuringBattle([messageDescriptor("team.moveDuringBattle")], { title: messageDescriptor("team.title") })) {
    return;
  }
  if (!Number.isInteger(sourceIndex) || !Number.isInteger(targetIndex) || !state.team[sourceIndex] || !state.team[targetIndex] || sourceIndex === targetIndex) {
    if (state.scene) {
      state.scene.teamMoveIndex = null;
    }
    renderRegions(["trainer-team"]);
    return;
  }
  if (authoritativeTeamCommandPending || !state.team[sourceIndex].instanceId || !state.team[targetIndex].instanceId) {
    return;
  }
  authoritativeTeamCommandPending = true;
  try {
    result = await swapTeamPokemonSlotsAuthoritative({
      expectedRevision: state.authoritativeRevision,
      pokemonInstanceId: state.team[sourceIndex].instanceId,
      targetSlot: targetIndex
    });
    if (!result.ok) {
      openInlineMessage([messageDescriptor("team.moveFailed")], { title: messageDescriptor("team.title") });
      return;
    }
    applyPlayerSave(saveFromAuthoritativeProjection(result.projection));
    if (state.scene) state.scene.teamMoveIndex = null;
    broadcastTeamBoxRuntimeState();
    renderRegions(["trainer-team"]);
  } finally {
    authoritativeTeamCommandPending = false;
  }
  return;
});

registerAction("pokedex-set-filter", function(element) {
    if (!state.scene || state.scene.name !== "team") {
      return;
    }
    state.scene.pokedexGenFilter = Number(element.dataset.gen) || 0;
    renderRegions(["trainer-pokedex"]);
    return;

});

export function handleTeamBoxRuntimeChange(domains) {
  var domainList = Array.isArray(domains) ? domains : ["team", "box"];
  if (domainList.indexOf("canonicalStateInvalidation") !== -1 && true) {
    if (!authoritativeRuntimeRefreshInFlight) {
      authoritativeRuntimeRefreshInFlight = getCurrentPlayerState().then(function (result) {
        if (result.ok && result.projection && result.projection.has_player) {
          applyPlayerSave(saveFromAuthoritativeProjection(result.projection));
          if (state.scene && state.scene.name === "team") {
            renderRegions(["trainer-profile", "trainer-team", "trainer-inventory", "trainer-pokedex"]);
          } else if (state.scene && state.scene.name === "box") {
            renderRegions(["box-filter", "box-storage"]);
          } else if (state.scene && state.scene.name === "pokemon-center") {
            renderRegions(["pokemon-center-items", "pokemon-center-team"]);
          } else {
            render();
          }
        }
      }).finally(function () {
        authoritativeRuntimeRefreshInFlight = null;
      });
    }
    return;
  }
  var hasTeamBoxChange = domainList.indexOf("team") !== -1 || domainList.indexOf("box") !== -1;
  var hasTrainerSheetChange = hasTeamBoxChange || domainList.indexOf("inventory") !== -1 || domainList.indexOf("profile") !== -1;
  if (hasTeamBoxChange && updateCaptureTeamRuntimeInline()) {
    return;
  }
  if (!state.scene) {
    return;
  }
  if (hasTeamBoxChange && state.scene.name === "training-zone") {
    state.scene.trainingOpponentTeam = [];
    state.scene.trainingOpponent = null;
    render();
    return;
  }
  if (state.scene.name === "team" && hasTrainerSheetChange) {
    renderRegions(["trainer-profile", "trainer-team", "trainer-inventory", "trainer-pokedex"]);
    return;
  }
  if (state.scene.name === "box" && hasTeamBoxChange) {
    renderRegions(["box-storage"]);
    return;
  }
  if (state.scene.name === "pokemon-center" && (hasTeamBoxChange || domainList.indexOf("inventory") !== -1)) {
    renderRegions(["pokemon-center-items", "pokemon-center-team"]);
    return;
  }
  if (state.scene.name === "garden" && domainList.indexOf("inventory") !== -1) {
    render();
  }
}
