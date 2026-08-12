import { completeDaycareWithdraw, depositDaycarePokemon, depositDaycarePokemonCommand, loadPlayerDaycare, resolveDaycareWithdrawalCommand, startDaycareWithdraw, withdrawDaycarePokemonCommand } from "../api/daycare.js";
import { DAYCARE_MAX_PENDING_LEVELS, DAYCARE_WITHDRAW_BASE_COST, DAYCARE_WITHDRAW_LEVEL_COST, levelLimitForBadges } from "../data/progression.js";
import { GDR_DATA as DATA } from "../data/index.js";
import { openConfirm, openMessage } from "./dialog-handler.js";
import { applyPlayerSave, root, state } from "./game-state.js";
import { clearHiddenProgression, startDirectLevelProgression } from "./level-up.js";
import * as Engine from "../engine/index.js";

var TEAM_MAX = Engine.TEAM_MAX;
var findPokemonJoinTeamViolation = Engine.findPokemonJoinTeamViolation;
import { markDirty, render, setScene } from "./renderer.js";
import { moneyText } from "./render-utils.js";
import { saveAfterStateChange } from "./save-runtime.js";
import { registerAction } from "./action-registry.js";
import { replaceTeamRuntimeState } from "./runtime-state.js";
import { recordMissionEvent } from "./mission-runtime.js";
import { clearPendingActivityRuntime, requireNotInBattle, setPendingActivityRuntime } from "./battle-scene-lock.js";
import { saveFromAuthoritativeProjection } from "../api/player.js";

var DAYCARE_LEVEL_INTERVAL_MS = 3600000;
var daycareDepositPending = false;
var authoritativeDaycareCommandPending = false;
var activeDaycareResolution = null;

function setDaycareDepositTargetsDisabled(disabled) {
  root.querySelectorAll('[data-action="daycare-deposit-pokemon"]').forEach(function (target) {
    if (disabled) {
      target.setAttribute("aria-disabled", "true");
      target.dataset.daycareDepositPending = "true";
      return;
    }
    target.removeAttribute("aria-disabled");
    delete target.dataset.daycareDepositPending;
  });
}

function setDaycareDepositPending(pending) {
  daycareDepositPending = Boolean(pending);
  if (state.scene && state.scene.name === "city-daycare") {
    state.scene.daycareDepositPending = daycareDepositPending;
  }
  setDaycareDepositTargetsDisabled(daycareDepositPending);
}

function normalizeDaycareRows(rows) {
  var slots = [null, null];
  (rows || []).forEach(function (row) {
    var slotIndex = Math.max(0, Math.min(1, Math.floor(Number(row.slotIndex) || 0)));
    if (!row.pokemon) {
      return;
    }
    slots[slotIndex] = {
      slotIndex: slotIndex,
      pokemon: Engine.Pokemon.fromJSON(row.pokemon),
      depositedAt: row.depositedAt || null,
      status: row.status || "deposited",
      pendingLevels: Math.max(0, Math.floor(Number(row.pendingLevels) || 0))
    };
  });
  return slots;
}

function daycareSlot(index) {
  return Array.isArray(state.daycare) ? state.daycare[index] || null : null;
}

function fullDaycareIntervalsSince(value) {
  var depositedAt = new Date(value).getTime();
  if (!Number.isFinite(depositedAt)) {
    return 0;
  }
  return Math.max(0, Math.floor((Date.now() - depositedAt) / DAYCARE_LEVEL_INTERVAL_MS));
}

function daycareLevelGain(slot) {
  var pokemon = slot && slot.pokemon;
  var levelLimit = levelLimitForBadges(state.trainerInfo[2]);
  var maxGain;
  if (!pokemon) {
    return 0;
  }
  return Math.max(0, Math.floor(Number(slot.pendingLevels) || 0));
}

function daycareWithdrawCost(levelsGained) {
  var slot = arguments.length > 1 ? arguments[1] : null;
  if (slot) {
    return Math.max(0, Math.floor(Number(slot.cost) || 0));
  }
  return DAYCARE_WITHDRAW_BASE_COST + Math.max(0, Math.floor(Number(levelsGained) || 0)) * DAYCARE_WITHDRAW_LEVEL_COST;
}

function pokemonCanBeDeposited(pokemon) {
  var levelLimit = levelLimitForBadges(state.trainerInfo[2]);
  return Boolean(pokemon && state.team.filter(Boolean).length > 1 && pokemon.level < 100 && pokemon.level < levelLimit);
}

function pendingDaycareSlot() {
  return Array.isArray(state.daycare) ? state.daycare.find(function (slot) {
    return slot && slot.status === "withdraw_pending";
  }) || null : null;
}

function pendingResolutionForSlot(slot) {
  var resolutionId = slot && slot.pendingResolutionId;
  return (state.pendingResolutions || []).find(function (resolution) {
    var options = resolution && resolution.options;
    return resolution && resolution.id === resolutionId && resolution.status === "pending"
      && options && options.source === "daycare_withdrawal";
  }) || null;
}

function moveNameByIndex(moveIndex, fallback) {
  var move = (DATA.moveLibrary || []).find(function (entry) {
    return Number(entry && entry.index) === Number(moveIndex);
  });
  return move && move.name || fallback || "Mossa " + moveIndex;
}

function speciesChoice(targetSpeciesKey, pokemon) {
  var species = Engine.findSpecies(targetSpeciesKey);
  return {
    speciesKey: String(targetSpeciesKey),
    name: species && species.name || String(targetSpeciesKey),
    gender: pokemon.gender,
    isShiny: pokemon.isShiny
  };
}

function submitAuthoritativeDaycareResolution(targetSpeciesKey) {
  var session = activeDaycareResolution;
  if (!session || authoritativeDaycareCommandPending) {
    return;
  }
  authoritativeDaycareCommandPending = true;
  state.dialog = null;
  state.saveStatus = { state: "saving", message: "daycare-resolution" };
  render();
  resolveDaycareWithdrawalCommand({
    expectedRevision: state.authoritativeRevision,
    pendingResolutionId: session.resolution.id,
    choices: {
      moves: session.choices,
      evolution_target_species_key: targetSpeciesKey || null
    }
  }).then(function (result) {
    if (!result.ok) {
      throw new Error(result.message || "Completamento del ritiro non riuscito.");
    }
    applyPlayerSave(saveFromAuthoritativeProjection(result.projection));
    replaceTeamRuntimeState(state.team);
    clearPendingActivityRuntime("daycare_withdraw");
    recordMissionEvent("daycare-cycle-completed", {}, {
      eventKey: "daycare-withdraw-resolution:" + session.resolution.id
    });
    activeDaycareResolution = null;
    state.saveStatus = { state: "saved", message: "" };
    openMessage(["Il Pokemon è tornato in squadra."], { title: "Pensione" });
  }).catch(function (error) {
    activeDaycareResolution = null;
    state.saveStatus = { state: "error", message: error.message || "Completamento del ritiro non riuscito." };
    openMessage([state.saveStatus.message], { title: "Pensione" });
  }).finally(function () {
    authoritativeDaycareCommandPending = false;
  });
}

function openNextAuthoritativeDaycareChoice() {
  var session = activeDaycareResolution;
  var offer;
  var moveIndex;
  var knownSlot;
  if (!session) {
    return;
  }
  while (session.offerIndex < session.offers.length) {
    offer = session.offers[session.offerIndex];
    moveIndex = Number(offer.move_index);
    knownSlot = session.moves.findIndex(function (move) { return move.index === moveIndex; });
    if (knownSlot !== -1) {
      session.choices.push({ offer_index: session.offerIndex, move_index: moveIndex, replacement_slot: null });
      session.offerIndex += 1;
      continue;
    }
    if (session.moves.length < 4) {
      session.choices.push({ offer_index: session.offerIndex, move_index: moveIndex, replacement_slot: null });
      session.moves.push({ index: moveIndex, name: moveNameByIndex(moveIndex, offer.name) });
      session.offerIndex += 1;
      continue;
    }
    state.dialog = {
      type: "daycare-move-resolution",
      pokemonName: session.pokemon.name,
      moveName: moveNameByIndex(moveIndex, offer.name),
      moves: session.moves.slice()
    };
    render();
    return;
  }
  if (session.evolutions.length) {
    state.dialog = {
      type: "daycare-evolution-resolution",
      pokemonName: session.pokemon.name,
      targets: session.evolutions.map(function (evolution) {
        return speciesChoice(evolution.target_species_key, session.pokemon);
      })
    };
    render();
    return;
  }
  submitAuthoritativeDaycareResolution(null);
}

function startAuthoritativeDaycareResolution(slot) {
  var resolution = pendingResolutionForSlot(slot);
  var options;
  if (!resolution) {
    openMessage(["La risoluzione del ritiro non è disponibile. Ricarica la Pensione."], { title: "Pensione" });
    return;
  }
  if (authoritativeDaycareCommandPending) {
    return;
  }
  if (activeDaycareResolution && activeDaycareResolution.resolution.id === resolution.id) {
    openNextAuthoritativeDaycareChoice();
    return;
  }
  options = resolution.options || {};
  activeDaycareResolution = {
    resolution: resolution,
    pokemon: slot.pokemon,
    offers: Array.isArray(options.level_moves) ? options.level_moves : [],
    evolutions: Array.isArray(options.evolutions) ? options.evolutions : [],
    offerIndex: 0,
    choices: [],
    moves: (slot.pokemon.moves || []).map(function (move) {
      return { index: Number(move.index), name: move.name };
    })
  };
  openNextAuthoritativeDaycareChoice();
}

function rememberDaycareWithdrawSpecies(slot, pokemon) {
  if (!slot || !pokemon || slot.withdrawSpeciesKey) {
    return;
  }
  slot.withdrawSpeciesKey = pokemon.speciesKey !== undefined && pokemon.speciesKey !== null ? String(pokemon.speciesKey) : "";
  slot.withdrawSpeciesName = pokemon.name || "Pokemon";
}

function daycareWithdrawCompositionPokemon(slot, pokemon) {
  rememberDaycareWithdrawSpecies(slot, pokemon);
  return Object.assign({}, pokemon, {
    speciesKey: slot && slot.withdrawSpeciesKey ? slot.withdrawSpeciesKey : pokemon.speciesKey,
    name: slot && slot.withdrawSpeciesName ? slot.withdrawSpeciesName : pokemon.name
  });
}

function daycareWithdrawJoinViolation(slot, pokemon) {
  return findPokemonJoinTeamViolation(state.team, daycareWithdrawCompositionPokemon(slot, pokemon));
}

function setDaycareWithdrawPending(slot) {
  if (!slot) {
    return;
  }
  setPendingActivityRuntime({
    type: "daycare_withdraw",
    label: "Ritiro Pokémon in corso",
    slotIndex: slot.slotIndex
  });
}

function completePendingDaycareWithdraw(slot, pokemon) {
  var nextTeam;
  var violation;
  if (!slot || !pokemon) {
    return;
  }
  if (state.team.length >= TEAM_MAX) {
    state.saveStatus = { state: "error", message: "La squadra è piena. Libera uno slot per completare il ritiro." };
    render();
    return;
  }
  violation = daycareWithdrawJoinViolation(slot, pokemon);
  if (violation) {
    state.saveStatus = { state: "error", message: violation.message };
    render();
    return;
  }
  slot.localProgressionComplete = true;
  nextTeam = state.team.concat([pokemon]);
  state.saveStatus = { state: "saving", message: "daycare-withdraw" };
  completeDaycareWithdraw(slot.slotIndex, nextTeam, state).then(function (result) {
    if (!result.ok) {
      state.saveStatus = { state: "error", message: result.message || "Ritiro non riuscito." };
      render();
      return;
    }
    state.team = nextTeam;
    if (!Array.isArray(state.daycare)) {
      state.daycare = [null, null];
    }
    state.daycare[slot.slotIndex] = null;
    state.scene.daycareDepositSlotIndex = null;
    replaceTeamRuntimeState(state.team);
    clearPendingActivityRuntime("daycare_withdraw");
    state.dirty = false;
    state.saveStatus = { state: "saved", message: "" };
    recordMissionEvent("daycare-cycle-completed", {}, {
      eventKey: "daycare-withdraw:" + slot.slotIndex + ":" + String(slot.depositedAt || "")
    });
    render();
  }).catch(function (error) {
    state.saveStatus = { state: "error", message: error.message || "Ritiro non riuscito." };
    render();
  });
}

export function resumePendingDaycareWithdraw() {
  var slot = pendingDaycareSlot();
  var pokemon = slot && slot.pokemon;
  var levelsGained = slot ? daycareLevelGain(slot) : 0;
  if (!slot || !pokemon) {
    return false;
  }
  setDaycareWithdrawPending(slot);
  startAuthoritativeDaycareResolution(slot);
  return true;
}

export function refreshDaycare() {
  return loadPlayerDaycare().then(function (result) {
    if (!result.ok) {
      state.saveStatus = { state: "error", message: result.message || "Errore durante il caricamento della Pensione." };
      render();
      return result;
    }
    if (result.projection) {
      applyPlayerSave(saveFromAuthoritativeProjection(result.projection));
    } else {
      state.daycare = normalizeDaycareRows(result.rows);
    }
    if (pendingDaycareSlot()) {
      setDaycareWithdrawPending(pendingDaycareSlot());
    } else if (state.pendingActivity && state.pendingActivity.type === "daycare_withdraw") {
      clearPendingActivityRuntime("daycare_withdraw");
    }
    render();
    return result;
  });
}

registerAction("daycare-start-deposit", function (element) {
  var slotIndex = Math.max(0, Math.min(1, Math.floor(Number(element.dataset.slotIndex) || 0)));
  if (!requireNotInBattle()) return;
  if (daycareSlot(slotIndex)) {
    return;
  }
  setDaycareDepositPending(false);
  state.scene.daycareDepositSlotIndex = slotIndex;
  render();
});

registerAction("daycare-cancel-deposit", function () {
  setDaycareDepositPending(false);
  state.scene.daycareDepositSlotIndex = null;
  render();
});

registerAction("daycare-deposit-pokemon", function (element) {
  var slotIndex = Math.max(0, Math.min(1, Math.floor(Number(state.scene.daycareDepositSlotIndex) || 0)));
  var teamIndex = Math.floor(Number(element.dataset.teamIndex) || 0);
  var pokemon = state.team[teamIndex];
  if (daycareDepositPending) {
    return;
  }
  if (!requireNotInBattle()) return;
  if (daycareSlot(slotIndex)) {
    openMessage(["Questo slot della Pensione è già occupato."], { title: "Pensione" });
    return;
  }
  if (!pokemonCanBeDeposited(pokemon)) {
    openMessage(["Questo Pokemon non può essere depositato in Pensione."], { title: "Pensione" });
    return;
  }
  if (authoritativeDaycareCommandPending || !pokemon.instanceId) {
    return;
  }
  authoritativeDaycareCommandPending = true;
  setDaycareDepositPending(true);
  depositDaycarePokemonCommand({
    expectedRevision: state.authoritativeRevision,
    pokemonInstanceId: pokemon.instanceId,
    slotIndex: slotIndex
  }).then(function (result) {
    if (!result.ok) {
      openMessage([result.message || "Deposito non riuscito."], { title: "Pensione" });
      return;
    }
    applyPlayerSave(saveFromAuthoritativeProjection(result.projection));
    state.scene.daycareDepositSlotIndex = null;
    replaceTeamRuntimeState(state.team);
    render();
  }).catch(function (error) {
    openMessage([error.message || "Deposito non riuscito."], { title: "Pensione" });
  }).finally(function () {
    authoritativeDaycareCommandPending = false;
    setDaycareDepositPending(false);
  });
  return;
});

registerAction("daycare-withdraw", function (element) {
  var slotIndex = Math.max(0, Math.min(1, Math.floor(Number(element.dataset.slotIndex) || 0)));
  var slot = daycareSlot(slotIndex);
  var pokemon = slot && slot.pokemon;
  var levelsGained;
  var cost;
  var violation;
  if (!pokemon) {
    return;
  }
  if (slot.status === "withdraw_pending") {
    resumePendingDaycareWithdraw();
    return;
  }
  if (!requireNotInBattle()) return;
  if (state.team.length >= TEAM_MAX) {
    openMessage(["La squadra è piena, ritorna con un posto libero per poter ritirare " + pokemon.name], { title: "Pensione" });
    return;
  }
  violation = daycareWithdrawJoinViolation(slot, pokemon);
  if (violation) {
    openMessage(violation.lines, { title: "Pensione" });
    return;
  }
  levelsGained = daycareLevelGain(slot);
  cost = daycareWithdrawCost(levelsGained, slot);
  if ((Number(state.trainerInfo[1]) || 0) < cost) {
    openMessage([
        "Servono " + moneyText(cost) + " per ritirare " + pokemon.name + ".",
        "Te ne mancano ancora un po'."
      ], { title: "Pensione" });
    return;
  }
  var hoursPassed = Math.max(0, Math.floor(Number(slot.elapsedIntervals) || 0));
  var hoursPhrase = hoursPassed === 1 ? "È passata 1 ora." : "Sono passate " + hoursPassed + " ore.";
  openConfirm("Pensione", [hoursPhrase, "Vuoi davvero ritirare " + pokemon.name + " e pagare " + moneyText(cost) + "?"], function () {
    if (state.team.length >= TEAM_MAX) {
      openMessage([
          "Servono " + moneyText(cost) + " per ritirare " + pokemon.name + ".",
          "Te ne mancano ancora un po'."
        ], { title: "Pensione" });
      return;
    }
    violation = daycareWithdrawJoinViolation(slot, pokemon);
    if (violation) {
      openMessage(violation.lines, { title: "Pensione" });
      return;
    }
    if ((Number(state.trainerInfo[1]) || 0) < cost) {
      openMessage(["Servono " + moneyText(cost) + " per ritirare " + pokemon.name + ",\nte ne mancano ancora un po'."], { title: "Pensione" });
      return;
    }
    if (authoritativeDaycareCommandPending || !pokemon.instanceId) {
      return;
    }
    authoritativeDaycareCommandPending = true;
    withdrawDaycarePokemonCommand({
      expectedRevision: state.authoritativeRevision,
      pokemonInstanceId: pokemon.instanceId
    }).then(function (result) {
      if (!result.ok) {
        openMessage([result.message || "Ritiro non riuscito."], { title: "Pensione" });
        return;
      }
      applyPlayerSave(saveFromAuthoritativeProjection(result.projection));
      state.scene.daycareDepositSlotIndex = null;
      replaceTeamRuntimeState(state.team);
      if (result.projection.withdrawal_status === "resolution_required") {
        authoritativeDaycareCommandPending = false;
        resumePendingDaycareWithdraw();
      }
      render();
    }).catch(function (error) {
      openMessage([error.message || "Ritiro non riuscito."], { title: "Pensione" });
    }).finally(function () {
      authoritativeDaycareCommandPending = false;
    });
    return;
  }, { confirmLabel: "Ritira", confirmClass: "button-accent", requireButtonClose: true });
});

registerAction("open-pending-daycare-withdraw", function () {
  setScene({ name: "city-daycare", daycareDepositSlotIndex: null });
  refreshDaycare().then(function () {
    resumePendingDaycareWithdraw();
  });
});

registerAction("daycare-resolution-replace-move", function (element) {
  var session = activeDaycareResolution;
  var replacementSlot = Math.floor(Number(element.dataset.index));
  var offer;
  var moveIndex;
  if (!session || replacementSlot < 0 || replacementSlot > 3) {
    return;
  }
  offer = session.offers[session.offerIndex];
  moveIndex = Number(offer.move_index);
  session.choices.push({ offer_index: session.offerIndex, move_index: moveIndex, replacement_slot: replacementSlot });
  session.moves[replacementSlot] = { index: moveIndex, name: moveNameByIndex(moveIndex, offer.name) };
  session.offerIndex += 1;
  state.dialog = null;
  openNextAuthoritativeDaycareChoice();
});

registerAction("daycare-resolution-decline-move", function () {
  var session = activeDaycareResolution;
  var offer;
  if (!session) {
    return;
  }
  offer = session.offers[session.offerIndex];
  session.choices.push({ offer_index: session.offerIndex, move_index: Number(offer.move_index), replacement_slot: null });
  session.offerIndex += 1;
  state.dialog = null;
  openNextAuthoritativeDaycareChoice();
});

registerAction("daycare-resolution-choose-evolution", function (element) {
  submitAuthoritativeDaycareResolution(String(element.dataset.speciesKey || ""));
});

registerAction("daycare-resolution-decline-evolution", function () {
  submitAuthoritativeDaycareResolution(null);
});
