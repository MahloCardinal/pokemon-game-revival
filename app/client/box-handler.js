import { registerAction } from "./action-registry.js";
import { blockActionDuringBattle } from "./battle-handler.js";
import * as Engine from "../engine/index.js";

var TEAM_MAX = Engine.TEAM_MAX;
import { openInlineConfirm, openInlineMessage } from "./dialog-handler.js";
import { removeElement } from "./renderer.js";
import { renderRegions } from "./renderer.js";
import { applyPlayerSave, resetBoxFilter, root, state } from "./game-state.js";
import { broadcastTeamBoxRuntimeState } from "./runtime-state.js";
import { moveBoxPokemonToTeamAuthoritative, releaseBoxPokemonAuthoritative } from "../api/player-command.js";
import { saveFromAuthoritativeProjection } from "../api/player.js";
import { pokemonDisplayName } from "./entity-text.js";
import { messageDescriptor, textDescriptor } from "./i18n.js";
var authoritativeBoxCommandPending = false;

registerAction("box-to-team", async function(element) {
  var boxIndex = Number(element.dataset.index);
  var pokemonToTeam;
  var result;
  if (blockActionDuringBattle([messageDescriptor("box.battleBlocked")], { title: textDescriptor("ui.box.sceneTitle") })) {
    return;
  }
  if (state.team.length >= TEAM_MAX) {
    openInlineMessage([messageDescriptor("box.teamFull"), messageDescriptor("box.removeFirst")], { title: textDescriptor("ui.box.sceneTitle") });
    return;
  }
  if (authoritativeBoxCommandPending || !state.box[boxIndex] || !state.box[boxIndex].instanceId) {
    return;
  }
  authoritativeBoxCommandPending = true;
  try {
    result = await moveBoxPokemonToTeamAuthoritative({
      expectedRevision: state.authoritativeRevision,
      pokemonInstanceId: state.box[boxIndex].instanceId,
      targetSlot: state.team.length
    });
    if (!result.ok) {
      openInlineMessage([messageDescriptor("box.withdrawFailed")], { title: textDescriptor("ui.box.sceneTitle") });
      return;
    }
    applyPlayerSave(saveFromAuthoritativeProjection(result.projection));
    broadcastTeamBoxRuntimeState();
    renderRegions(["box-storage"]);
  } finally {
    authoritativeBoxCommandPending = false;
  }
  return;
});

registerAction("box-release", function(element) {
    var releaseIndex = Number(element.dataset.index);
    openInlineConfirm(messageDescriptor("box.releaseTitle"), [messageDescriptor("box.releaseConfirm", { pokemon: pokemonDisplayName(state.box[releaseIndex]) })], async function () {
      var result;
      if (authoritativeBoxCommandPending || !state.box[releaseIndex] || !state.box[releaseIndex].instanceId) {
        return;
      }
      authoritativeBoxCommandPending = true;
      try {
        result = await releaseBoxPokemonAuthoritative({
          expectedRevision: state.authoritativeRevision,
          pokemonInstanceId: state.box[releaseIndex].instanceId
        });
        if (!result.ok) {
          openInlineMessage([messageDescriptor("box.releaseFailed")], { title: textDescriptor("ui.box.sceneTitle") });
          return;
        }
        applyPlayerSave(saveFromAuthoritativeProjection(result.projection));
        state.dialog = null;
        broadcastTeamBoxRuntimeState();
        renderRegions(["box-storage"]);
      } finally {
        authoritativeBoxCommandPending = false;
      }
      return;
    });
    return;

});

registerAction("box-filter-apply", function(element) {
    var selectedBoxType = root.querySelector('[name="box-filter-type"]:checked');
    var minLevelInput = root.querySelector('[data-field="box-filter-min-level"]');
    var maxLevelInput = root.querySelector('[data-field="box-filter-max-level"]');
    var nameInput = root.querySelector('[data-field="box-filter-name"]');
    var heldItemInput = root.querySelector('[data-field="box-filter-held-item"]');
    state.boxFilter = {
      type: selectedBoxType ? String(selectedBoxType.value || "") : "",
      minLevel: minLevelInput ? normalizeBoxLevelFilter(minLevelInput.value) : "",
      maxLevel: maxLevelInput ? normalizeBoxLevelFilter(maxLevelInput.value) : "",
      name: nameInput ? String(nameInput.value || "").replace(/[^A-Za-z0-9-]/g, "").slice(0, 3).toLocaleLowerCase("en-US") : "",
      heldItemOnly: heldItemInput ? heldItemInput.checked : false
    };
    renderRegions(["box-filter", "box-storage"]);
    return;

});

registerAction("box-filter-reset", function(element) {
    resetBoxFilter();
    renderRegions(["box-filter", "box-storage"]);
    return;

});

export function assignNextBoxIndex(pokemon) {
  pokemon.boxIndex = state.box.reduce(function (highest, p) {
    var boxIndex = Number(p.boxIndex);
    return Number.isFinite(boxIndex) && boxIndex > highest ? boxIndex : highest;
  }, -1) + 1;
  return pokemon;
}

export function queueBoxUpsert(pokemon) {
  if (!state.pendingBoxUpserts) {
    state.pendingBoxUpserts = [];
  }
  state.pendingBoxUpserts.push(pokemon);
}

export function removePokemonCardInline(element) {
  removeElement(element ? element.closest(".pokemon-card-frame") || element.closest(".pokemon-card") : null);
}

function normalizeBoxLevelFilter(value) {
  var levelText = String(value || "").replace(/\D/g, "").slice(0, 3);
  var level = Number(levelText);
  if (!levelText) {
    return "";
  }
  if (level < 1) {
    return "1";
  }
  if (level > 100) {
    return "100";
  }
  return String(level);
}
