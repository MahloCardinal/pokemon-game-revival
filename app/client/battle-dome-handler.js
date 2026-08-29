import { registerAction } from "./action-registry.js";
import { root, state } from "./game-state.js";
import { render, renderRegions, setScene } from "./renderer.js";
import { applyAuthoritativeProjection, openPendingBattleEntryChoice } from "./battle-handler.js";
import { openMessage } from "./dialog-handler.js";
import { t } from "./i18n.js";
import { BATTLE_DOME_TEAM_SIZE, validateBattleDomeTeam } from "../data/battle-dome.js";
import { abandonBattleDomeBattle, cancelBattleDomeLobby, createBattleDomeInviteToken, createBattleDomeLobby, exitBattleDomeBattle, joinBattleDomeLobby, readBattleDomeBattle, readBattleDomeState, resolveBattleDomeEntryChoice, saveBattleDomeTeam, submitBattleDomeMove, switchBattleDomePokemon, useBattleDomeItem } from "../api/battle-dome.js";

var refreshPending = false;
var pollStarted = false;

function payload(result) {
  return result && result.ok ? result.projection || {} : null;
}

function hasOwnedDomeBattle() {
  return state.battleDome.battles.some(function (battle) { return battle.own_role !== "spectator"; });
}

function applyDomeState(data) {
  if (!data) return false;
  var dome = state.battleDome;
  dome.team = Array.isArray(data.team) ? data.team : dome.team;
  dome.teamRevision = Number(data.team_revision) || dome.teamRevision || 0;
  dome.lobby = data.lobby === undefined ? dome.lobby : data.lobby;
  dome.lobbies = Array.isArray(data.lobbies) ? data.lobbies : dome.lobbies;
  dome.battles = Array.isArray(data.battles) ? data.battles : dome.battles;
  dome.loaded = true;
  dome.loading = false;
  dome.error = "";
  return true;
}

export async function refreshBattleDomeState(options) {
  options = options || {};
  var ownedBattleBefore = hasOwnedDomeBattle();
  if (!state.auth.user || refreshPending) return false;
  if (typeof window !== "undefined" && state.scene && state.scene.name === "battle-dome") {
    var invite = state.scene.inviteToken || new URLSearchParams(window.location.search).get("invite");
    if (invite) {
      state.battleDome.tab = "lobby";
      state.battleDome.inviteDraft = state.scene.inviteUrl || window.location.href;
    }
  }
  refreshPending = true;
  if (!state.battleDome.loaded) state.battleDome.loading = true;
  if (!options.silent && state.scene && state.scene.name === "battle-dome") render();
  var result = await readBattleDomeState();
  refreshPending = false;
  if (!result.ok) {
    state.battleDome.loading = false;
    state.battleDome.error = result.message || t("ui.battleDome.commandFailed");
    if (!options.silent && state.scene && state.scene.name === "battle-dome") render();
    return false;
  }
  applyDomeState(payload(result));
  var ownedBattleChanged = ownedBattleBefore !== hasOwnedDomeBattle();
  if (state.scene && state.scene.name === "battle-dome"
    && (!options.silent || options.renderAfter || ownedBattleChanged)) {
    render({ preserveScroll: true });
  } else if (ownedBattleChanged && state.scene && state.scene.name !== "battle-dome-battle") {
    render({ preserveScroll: true });
  }
  return true;
}

function domeError(result) {
  state.battleDome.saving = false;
  state.battleDome.error = result && result.message || t("ui.battleDome.commandFailed");
  if (state.scene && state.scene.name === "battle-dome-battle") {
    openMessage([state.battleDome.error], { title: t("ui.sceneTitles.battleDome") });
    return false;
  }
  render({ preserveScroll: true });
  return false;
}

async function saveTeam(team) {
  state.battleDome.saving = true;
  state.battleDome.error = "";
  renderRegions(["battle-dome-content"]);
  var result = await saveBattleDomeTeam(team);
  if (!result.ok) return domeError(result);
  var data = payload(result);
  state.battleDome.team = Array.isArray(data.team) ? data.team : team;
  state.battleDome.teamRevision = Number(data.team_revision) || state.battleDome.teamRevision;
  state.battleDome.saving = false;
  state.battleDome.notice = t("ui.battleDome.saved");
  if (data.lobby_cancelled) state.battleDome.lobby = null;
  await refreshBattleDomeState({ silent: true });
  render({ preserveScroll: true });
}

document.addEventListener("search-combobox-change", function (event) {
  var hidden = event.target;
  var field = hidden && hidden.dataset && hidden.dataset.battleDomeField;
  var draft;
  var slot;
  if (!field || !state.scene || state.scene.name !== "battle-dome") return;
  draft = state.battleDome.draft;
  if (field === "species") {
    draft.speciesKey = String(hidden.value || "");
    draft.moveIndexes = [0, 0, 0, 0];
  } else if (field === "item") {
    draft.heldItemIndex = Number(hidden.value) || 0;
  } else if (/^move-[0-3]$/.test(field)) {
    slot = Number(field.slice(-1));
    draft.moveIndexes[slot] = Number(hidden.value) || 0;
  }
  if (!hidden.value) return;
  renderRegions(["battle-dome-content"], { preserveScroll: true });
});

document.addEventListener("input", function (event) {
  if (!event.target.matches || !event.target.matches("[data-battle-dome-join-url]")) return;
  state.battleDome.inviteDraft = String(event.target.value || "");
});

registerAction("battle-dome-tab", function (element) {
  state.battleDome.tab = element.dataset.tab === "lobby" ? "lobby" : "team";
  state.battleDome.error = "";
  render({ preserveScroll: true });
  refreshBattleDomeState({ silent: state.battleDome.tab !== "lobby" });
});

registerAction("battle-dome-add-pokemon", function () {
  var draft = state.battleDome.draft;
  var moves = draft.moveIndexes.map(Number).filter(Boolean);
  var next = state.battleDome.team.concat([{
    species_key: String(draft.speciesKey || ""), held_item_index: Number(draft.heldItemIndex) || 0, moves: moves
  }]);
  var violation = validateBattleDomeTeam(next, false);
  if (violation) {
    state.battleDome.error = t("ui.battleDome." + (violation === "species_limit" ? "speciesLimit"
      : violation === "item_limit" ? "itemLimit" : violation === "port_limit" ? "portLimit" : "invalidPokemon"));
    renderRegions(["battle-dome-content"]);
    return;
  }
  state.battleDome.draft = { speciesKey: "", heldItemIndex: 0, moveIndexes: [0, 0, 0, 0] };
  saveTeam(next);
});

registerAction("battle-dome-remove-pokemon", function (element) {
  var index = Number(element.dataset.teamIndex);
  if (!Number.isInteger(index) || index < 0 || index >= state.battleDome.team.length) return;
  saveTeam(state.battleDome.team.filter(function (_entry, teamIndex) { return teamIndex !== index; }));
});

registerAction("battle-dome-create-lobby", async function () {
  if (validateBattleDomeTeam(state.battleDome.team, true)) return;
  state.battleDome.saving = true;
  renderRegions(["battle-dome-content"]);
  var result = await createBattleDomeLobby(createBattleDomeInviteToken());
  state.battleDome.saving = false;
  if (!result.ok) return domeError(result);
  state.battleDome.notice = t("ui.battleDome.lobbyCreated");
  await refreshBattleDomeState({ silent: true });
  render({ preserveScroll: true });
});

registerAction("battle-dome-cancel-lobby", async function () {
  var result = await cancelBattleDomeLobby();
  if (!result.ok) return domeError(result);
  state.battleDome.notice = t("ui.battleDome.lobbyCancelled");
  await refreshBattleDomeState({ silent: true });
  render({ preserveScroll: true });
});

registerAction("battle-dome-copy-link", async function () {
  var input = root.querySelector("[data-battle-dome-invite-url]");
  if (!input) return;
  try {
    await navigator.clipboard.writeText(input.value);
    state.battleDome.notice = t("ui.battleDome.copied");
  } catch (error) {
    input.select();
  }
  render({ preserveScroll: true });
});

function tokenFromUrl(value) {
  try {
    var parsed = new URL(String(value || "").trim(), window.location.origin);
    return String(parsed.searchParams.get("invite") || "");
  } catch (error) { return ""; }
}

async function join(input) {
  if (validateBattleDomeTeam(state.battleDome.team, true)) {
    state.battleDome.error = t("ui.battleDome.teamRequirement");
    render({ preserveScroll: true });
    return;
  }
  var result = await joinBattleDomeLobby(input);
  if (!result.ok) return domeError(result);
  await refreshBattleDomeState({ silent: true });
  if (result.battle) openBattleDomeProjection(result.battle, result.events || []);
}

registerAction("battle-dome-join-url", function () {
  var input = root.querySelector("[data-battle-dome-join-url]");
  var token = tokenFromUrl(input && input.value);
  if (!token) {
    state.battleDome.error = t("ui.battleDome.invalidUrl");
    render({ preserveScroll: true });
    return;
  }
  join({ inviteToken: token });
});

registerAction("battle-dome-challenge", function (element) {
  join({ creatorUserId: String(element.dataset.creatorUserId || "") });
});

export function openBattleDomeProjection(projection, events, history) {
  var role = String(projection.viewer_role || "spectator");
  var scene = {
    name: "battle-dome-battle",
    battleDome: true,
    battleDomeBattleId: String(projection.battle_id || ""),
    battleDomeRole: role,
    battleDomeSpectator: role === "spectator",
    adminBattle: role === "challenger",
    authoritativeBattle: true,
    authoritativeLastEventSeq: 0,
    manager: { log: [] }
  };
  applyAuthoritativeProjection(scene, projection, events);
  scene.playerTeam.name = String(projection.creator_username || scene.playerTeam.name);
  scene.enemyTeam.name = String(projection.challenger_username || scene.enemyTeam.name);
  scene.playerUsername = scene.playerTeam.name;
  scene.battleDomeCreatorUsername = scene.playerTeam.name;
  scene.battleDomeChallengerUsername = scene.enemyTeam.name;
  scene.terminalExitReady = scene.manager.battleOver;
  setScene(scene, { history: history || undefined });
  if (role === "creator" && scene.authoritativeEntryChoice) openPendingBattleEntryChoice(scene);
  return scene;
}

export async function openBattleDomeBattle(battleId, history) {
  var result = await readBattleDomeBattle(battleId);
  if (!result.ok || !result.battle) {
    state.battleDome.notice = t("ui.battleDome.battleUnavailable");
    setScene({ name: "battle-dome" }, { history: "replace" });
    return null;
  }
  return openBattleDomeProjection(result.battle, result.events || [], history);
}

registerAction("battle-dome-open-battle", function (element) {
  openBattleDomeBattle(String(element.dataset.battleId || ""));
});

export async function runBattleDomeCommand(scene, kind, input) {
  var envelope = Object.assign({ battleId: scene.battleDomeBattleId, expectedBattleVersion: scene.authoritativeBattleVersion }, input || {});
  var result = kind === "move" ? await submitBattleDomeMove(envelope)
    : kind === "switch" ? await switchBattleDomePokemon(envelope)
      : kind === "entry_choice" ? await resolveBattleDomeEntryChoice(envelope)
        : await useBattleDomeItem(envelope);
  scene.authoritativeCommandPending = false;
  if (!result.ok) return domeError(result);
  applyAuthoritativeProjection(scene, result.battle, result.events || []);
  scene.playerTeam.name = scene.battleDomeCreatorUsername;
  scene.enemyTeam.name = scene.battleDomeChallengerUsername;
  scene.terminalExitReady = scene.manager.battleOver;
  render({ preserveScroll: true, scrollBattleLogToBottom: true });
  if (scene.battleDomeRole === "creator" && scene.authoritativeEntryChoice) openPendingBattleEntryChoice(scene);
  return result;
}

export async function abandonCurrentBattleDome(scene) {
  var result = await abandonBattleDomeBattle(scene.battleDomeBattleId);
  if (!result.ok) return domeError(result);
  state.battleDome.notice = t("ui.battleDome.battleCancelled");
  await refreshBattleDomeState({ silent: true });
  setScene({ name: "battle-dome" }, { history: "replace" });
  return result;
}

export async function exitCurrentBattleDome(scene) {
  var result = await exitBattleDomeBattle(scene.battleDomeBattleId);
  if (!result.ok) return domeError(result);
  await refreshBattleDomeState({ silent: true });
  setScene({ name: "battle-dome" }, { history: "replace" });
  return result;
}

function startPoll() {
  if (pollStarted || typeof window === "undefined") return;
  pollStarted = true;
  window.setInterval(async function () {
    if (!state.auth.user) return;
    if (state.scene && state.scene.name === "battle-dome-battle" && state.scene.battleDomeBattleId) {
      var scene = state.scene;
      var result = await readBattleDomeBattle(scene.battleDomeBattleId, { afterSeq: scene.authoritativeLastEventSeq || 0 });
      if (!result.ok || !result.battle) {
        state.battleDome.notice = t("ui.battleDome.battleCancelled");
        await refreshBattleDomeState({ silent: true });
        setScene({ name: "battle-dome" }, { history: "replace" });
        return;
      }
      applyAuthoritativeProjection(scene, result.battle, result.events || []);
      scene.playerTeam.name = scene.battleDomeCreatorUsername;
      scene.enemyTeam.name = scene.battleDomeChallengerUsername;
      scene.terminalExitReady = scene.manager.battleOver;
      render({ preserveScroll: true, scrollBattleLogToBottom: true });
    } else if (state.battleDome.loaded || state.scene && state.scene.name === "battle-dome") {
      refreshBattleDomeState({ silent: true,
        renderAfter: Boolean(state.scene && state.scene.name === "battle-dome" && state.battleDome.tab === "lobby") });
    }
  }, 5000);
}

startPoll();
