import { registerAction } from "./action-registry.js";
import { openAuthoritativeBattleProjection, openBattleStartTargetPanel, battleTypeForGym } from "./battle-handler.js";
import { enforceBattleRuntimeSceneLock } from "./battle-scene-lock.js";
import { openMessage } from "./dialog-handler.js";
import { render } from "./renderer.js";
import { state } from "./game-state.js";
import { adventurePhaseForGym, kantoGymChallengeStatus, kantoGymCityByKey, kantoGymLeaderByCity } from "../data/gyms.js";
import { levelLimitForBadges } from "../data/progression.js";

var findOfficialChallengeSuperEffectivePokemonViolation = Engine.findOfficialChallengeSuperEffectivePokemonViolation;
var findTeamCompositionViolation = Engine.findTeamCompositionViolation;
var kantoGymSuperEffectivePokemonRuleForBadgeIndex = Engine.kantoGymSuperEffectivePokemonRuleForBadgeIndex;
import * as Engine from "../engine/index.js";
import { adventurePhaseIsCompleted } from "./mission-runtime.js";
import { authoritativeBattleRuntimeOwnerId, getAuthoritativeBattle, startAuthoritativeGymBattle, startAuthoritativeLeagueBattle } from "../api/battle.js";
import { isAdminControlledBattleType } from "../data/admin-battles.js";
import { pokemonDisplayName, teamViolationFromBattleResult, teamViolationLines } from "./entity-text.js";
import { messageDescriptor } from "./i18n.js";

var gymBattleStartPending = false;

function officialChallengeOverCapPokemon(team) {
  var levelLimit = levelLimitForBadges(state.trainerInfo[2]);
  return (team || []).find(function (pokemon) {
    return pokemon && Number(pokemon.level) > levelLimit;
  }) || null;
}

function blockOfficialChallengeIfOverCap(team, title) {
  var pokemon = officialChallengeOverCapPokemon(team);
  if (!pokemon) {
    return false;
  }
  openMessage([messageDescriptor("gyms.overLevelCap", { pokemon: pokemonDisplayName(pokemon) })], { title: title || messageDescriptor("gyms.officialTitle") });
  return true;
}

function blockChallengeIfTeamCompositionInvalid(team, title) {
  var violation = findTeamCompositionViolation(team);
  if (!violation) {
    return false;
  }
  openMessage(teamViolationLines(violation), { title: title });
  return true;
}

function blockGymChallengeIfSuperEffectivePokemonInvalid(team, cityKey, leader, title) {
  var city = kantoGymCityByKey(cityKey);
  var violation = findOfficialChallengeSuperEffectivePokemonViolation(
    team,
    leader && leader.team,
    kantoGymSuperEffectivePokemonRuleForBadgeIndex(city.badgeIndex)
  );
  if (!violation) {
    return false;
  }
  openMessage(teamViolationLines(violation), { title: title });
  return true;
}

registerAction("gym-leader-start", function (element) {
  var resolvedCityKey;
  var leader;
  var playerPokemon;
  var challengeStatus;
  if (enforceBattleRuntimeSceneLock()) {
    return;
  }
  if (gymBattleStartPending) {
    return;
  }
  if (state.scene && state.scene.name === "gym-city") {
    resolvedCityKey = String(element.dataset.city || state.scene.cityKey || "");
    leader = kantoGymLeaderByCity(resolvedCityKey);
    playerPokemon = state.team.filter(Boolean);
    challengeStatus = kantoGymChallengeStatus(resolvedCityKey, state.trainerInfo[2]);
    if (challengeStatus.state === "completed") {
      openMessage([messageDescriptor("gyms.alreadyDefeated")], { title: messageDescriptor("gyms.gymTitle") });
      return;
    }
    if (challengeStatus.state === "locked") {
      openMessage([messageDescriptor("gyms.previousBadgeRequired")], { title: messageDescriptor("gyms.gymTitle") });
      return;
    }
    if (!leader || !leader.team.length) {
      openMessage([messageDescriptor("gyms.gymUnavailable")], { title: messageDescriptor("gyms.gymTitle") });
      return;
    }
    if (!playerPokemon.length) {
      openMessage([messageDescriptor("gyms.emptyTeam")], { title: messageDescriptor("gyms.gymTitle") });
      return;
    }
    if (blockChallengeIfTeamCompositionInvalid(playerPokemon, messageDescriptor("gyms.gymTitle"))) {
      return;
    }
    if (blockOfficialChallengeIfOverCap(playerPokemon, messageDescriptor("gyms.gymTitle"))) {
      return;
    }
    if (!adventurePhaseIsCompleted(adventurePhaseForGym(resolvedCityKey))) {
      openMessage([messageDescriptor("gyms.adventureRequired")], { title: messageDescriptor("gyms.gymTitle") });
      return;
    }
    if (blockGymChallengeIfSuperEffectivePokemonInvalid(playerPokemon, resolvedCityKey, leader, messageDescriptor("gyms.gymTitle"))) {
      return;
    }
    if (playerPokemon.length > 1) {
      var targetEntries = state.team.map(function (pokemon, slot) { return pokemon ? { pokemon: pokemon, slot: slot } : null; }).filter(Boolean);
      openBattleStartTargetPanel(element, targetEntries.map(function (entry) {
        return { name: entry.pokemon.name, index: entry.slot };
      }), function (activeIndex) {
        startGymLeaderBattle(state.scene, resolvedCityKey, activeIndex);
      });
      return;
    }
    var onlySlot = state.team.findIndex(Boolean);
    startGymLeaderBattle(state.scene, resolvedCityKey, onlySlot, element);
  }
});

function startGymLeaderBattle(gymScene, cityKey, activeIndex, element) {
  if (gymBattleStartPending) {
    return;
  }
  gymBattleStartPending = true;
  if (element) {
    element.disabled = true;
  }
  buildGymLeaderBattleScene(gymScene, cityKey, activeIndex).then(function () {
    gymBattleStartPending = false;
    if (element && element.isConnected) {
      element.disabled = false;
    }
  });
}

function buildGymLeaderBattleScene(gymScene, cityKey, activeIndex) {
  var resolvedCityKey = String(cityKey || (gymScene && gymScene.cityKey) || "");
  var leader = kantoGymLeaderByCity(resolvedCityKey);
  var playerPokemon = state.team.filter(Boolean);
  var challengeStatus = kantoGymChallengeStatus(resolvedCityKey, state.trainerInfo[2]);
  var playerTeam;
  var enemyTeam;
  var battleScene;
  var battleType;

  if (challengeStatus.state === "completed") {
    openMessage([messageDescriptor("gyms.alreadyDefeated")], { title: messageDescriptor("gyms.gymTitle") });
    return Promise.resolve(false);
  }
  if (challengeStatus.state === "locked") {
    openMessage([messageDescriptor("gyms.previousBadgeRequired")], { title: messageDescriptor("gyms.gymTitle") });
    return Promise.resolve(false);
  }
  if (!leader || !leader.team.length) {
    openMessage([messageDescriptor("gyms.gymUnavailable")], { title: messageDescriptor("gyms.gymTitle") });
    return Promise.resolve(false);
  }
  if (!playerPokemon.length) {
    openMessage([messageDescriptor("gyms.emptyTeam")], { title: messageDescriptor("gyms.gymTitle") });
    return Promise.resolve(false);
  }
  if (blockChallengeIfTeamCompositionInvalid(playerPokemon, messageDescriptor("gyms.gymTitle"))) {
    return Promise.resolve(false);
  }
  if (blockOfficialChallengeIfOverCap(playerPokemon, messageDescriptor("gyms.gymTitle"))) {
    return Promise.resolve(false);
  }
  if (!adventurePhaseIsCompleted(adventurePhaseForGym(resolvedCityKey))) {
    openMessage([messageDescriptor("gyms.adventureRequired")], { title: messageDescriptor("gyms.gymTitle") });
    return Promise.resolve(false);
  }
  if (blockGymChallengeIfSuperEffectivePokemonInvalid(playerPokemon, resolvedCityKey, leader, messageDescriptor("gyms.gymTitle"))) {
    return Promise.resolve(false);
  }

  battleType = battleTypeForGym(resolvedCityKey);
  return startAuthoritativeGym(resolvedCityKey, activeIndex);
}

function startAuthoritativeGym(cityKey, activeSlot) {
  var ownerId = authoritativeBattleRuntimeOwnerId();
  var commandId = globalThis.crypto.randomUUID();
  render();
  return startAuthoritativeGymBattle({
    commandId: commandId,
    expectedPlayerRevision: state.authoritativeRevision,
    runtimeOwnerId: ownerId,
    gymKey: cityKey,
    adminControlled: isAdminControlledBattleType(battleTypeForGym(cityKey)),
    activeSlot: activeSlot
  }).then(function (result) {
    if (result.ok && result.battle) {
      state.authoritativeRevision = result.playerRevision;
      openAuthoritativeBattleProjection(result.battle, result.events, { history: "push" });
      return true;
    }
    var serverViolation = teamViolationFromBattleResult(result);
    if (serverViolation) {
      openMessage(teamViolationLines(serverViolation), { title: messageDescriptor("gyms.gymTitle") });
      render();
      return false;
    }
    if (result.uncertain || result.code === "revision_conflict" || result.code === "battle_command_rejected") {
      return getAuthoritativeBattle(null, {
        afterSeq: 0,
        limit: 100,
        commandId: commandId,
        runtimeOwnerId: ownerId
      }).then(function (readResult) {
        var battle = readResult.battle;
        if (readResult.ok && battle && ["gym", "admin_gym"].indexOf(battle.contract_key) !== -1
          && battle.gym_key === cityKey
          && ["active", "needs_player_switch"].indexOf(battle.status) !== -1
          && String(battle.runtime_owner_id || "") === ownerId) {
          state.authoritativeRevision = readResult.playerRevision;
          openAuthoritativeBattleProjection(battle, readResult.events, { history: "push" });
          return true;
        }
        openMessage([messageDescriptor("gyms.stateChanged")], { title: messageDescriptor("gyms.gymTitle") });
        render();
        return false;
      });
    }
    openMessage([messageDescriptor("gyms.gymStartFailed")], { title: messageDescriptor("gyms.gymTitle") });
    render();
    return false;
  }).catch(function (error) {
    openMessage([messageDescriptor("gyms.gymStartFailed")], { title: messageDescriptor("gyms.gymTitle") });
    render();
    return false;
  });
}

var kantoLeagueStartPending = false;

registerAction("kanto-league-start", function (element) {
  if (enforceBattleRuntimeSceneLock()) {
    return;
  }
  if (kantoLeagueStartPending) {
    return;
  }
  if (state.scene && state.scene.name === "gym-city" && state.scene.cityKey === "elite_four") {
    var playerPokemon = state.team.filter(Boolean);
    if (!playerPokemon.length) {
      openMessage([messageDescriptor("gyms.emptyTeam")], { title: messageDescriptor("gyms.leagueTitle") });
      return;
    }
    if (blockChallengeIfTeamCompositionInvalid(playerPokemon, messageDescriptor("gyms.leagueTitle"))) {
      return;
    }
    startKantoLeagueBattle(0, element);
  }
});

registerAction("kanto-league-resume", function (element) {
  var leagueState = state.authoritativeLeagueState;
  if (enforceBattleRuntimeSceneLock() || kantoLeagueStartPending
    || !leagueState || leagueState.status !== "awaiting_battle") {
    return;
  }
  startKantoLeagueBattle(Number(leagueState.nextMemberIndex), element);
});

function startKantoLeagueBattle(memberIndex, element) {
  if (kantoLeagueStartPending) {
    return;
  }
  kantoLeagueStartPending = true;
  if (element) {
    element.disabled = true;
  }
  var entries = state.team.map(function (pokemon, slot) { return pokemon ? { pokemon: pokemon, slot: slot } : null; }).filter(Boolean);
  openBattleStartTargetPanel(element, entries.map(function (entry) {
    return { name: entry.pokemon.name, index: entry.slot };
  }), function (activeSlot) {
    startAuthoritativeLeague(activeSlot, memberIndex, element);
  });
  kantoLeagueStartPending = false;
  if (element && element.isConnected) { element.disabled = false; }
  return;
}

export function startAuthoritativeLeague(activeSlot, expectedMemberIndex, element) {
  var ownerId = authoritativeBattleRuntimeOwnerId();
  var commandId = globalThis.crypto.randomUUID();
  kantoLeagueStartPending = true;
  if (element) { element.disabled = true; }
  render();
  return startAuthoritativeLeagueBattle({ commandId: commandId, expectedPlayerRevision: state.authoritativeRevision,
    runtimeOwnerId: ownerId, activeSlot: activeSlot, expectedMemberIndex: expectedMemberIndex }).then(function (result) {
    kantoLeagueStartPending = false;
    if (element && element.isConnected) { element.disabled = false; }
    if (result.ok && result.battle && result.battle.contract_key === "league") {
      state.authoritativeRevision = result.playerRevision;
      state.authoritativeLeagueState = null;
      openAuthoritativeBattleProjection(result.battle, result.events, { history: "push" });
      return true;
    }
    var serverViolation = teamViolationFromBattleResult(result);
    if (serverViolation) {
      openMessage(teamViolationLines(serverViolation), { title: messageDescriptor("gyms.leagueTitle") });
      render();
      return false;
    }
    if (result.uncertain || result.code === "revision_conflict" || result.code === "battle_command_rejected") {
      return getAuthoritativeBattle(null, { afterSeq: 0, limit: 100, commandId: commandId, runtimeOwnerId: ownerId }).then(function (readResult) {
        if (readResult.ok && readResult.battle && readResult.battle.contract_key === "league"
          && ["active", "needs_player_switch"].indexOf(readResult.battle.status) !== -1
          && String(readResult.battle.runtime_owner_id || "") === ownerId) {
          state.authoritativeRevision = readResult.playerRevision;
          state.authoritativeLeagueState = null;
          openAuthoritativeBattleProjection(readResult.battle, readResult.events, { history: "push" });
          return true;
        }
        if (readResult.ok && readResult.projection && readResult.projection.league_state) {
          state.authoritativeLeagueState = readResult.projection.league_state;
        }
        openMessage([messageDescriptor("gyms.leagueStateChanged")], { title: messageDescriptor("gyms.leagueTitle") });
        render();
        return false;
      });
    }
    openMessage([messageDescriptor("gyms.leagueStartFailed")], { title: messageDescriptor("gyms.leagueTitle") });
    render();
    return false;
  }).catch(function (error) {
    kantoLeagueStartPending = false;
    if (element && element.isConnected) { element.disabled = false; }
    openMessage([messageDescriptor("gyms.leagueStartFailed")], { title: messageDescriptor("gyms.leagueTitle") });
    render();
    return false;
  });
}
