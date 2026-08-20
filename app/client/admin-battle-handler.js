import { registerAction } from "./action-registry.js";
import { state, root } from "./game-state.js";
import { render, setScene } from "./renderer.js";
import { openMessage } from "./dialog-handler.js";
import { appendAuthoritativeEventLines, applyAuthoritativeProjection, closeBattleTargetPanel, openBattleTargetPanel, hpSnapshot, animateHpSequence } from "./battle-handler.js";
import { currentUserIsAdmin } from "./admin-auth.js";
import { listAdminControlledBattles, loadAdminControlledBattle, resolveAuthoritativeAdminEntryChoice, submitAuthoritativeAdminMove, switchAuthoritativeAdminPokemon, useAuthoritativeAdminItem } from "../api/battle.js";
import { appendAdminGlobalActivityMessage } from "../api/activity-feed.js";
import { getSupabaseClient } from "../api/supabase.js";
import { getInventoryItemByIndex } from "../data/items.js";
import { messageDescriptor } from "./i18n.js";

var activeAdminBattleRealtimeChannel = null;
var activeAdminBattleRealtimePlayerId = "";
var activeAdminBattleRefresh = null;
var activeAdminBattleRefreshGeneration = 0;
var activeAdminBattleRefreshDirty = false;
var activeAdminBattlesRealtimeChannel = null;
var activeAdminBattlesRefresh = null;
var activeAdminBattlesRefreshDirty = false;

function requireAdmin() {
  if (currentUserIsAdmin()) {
    return true;
  }
  setScene({ name: "home" }, { history: "replace" });
  return false;
}

export function refreshAdminBattles(options) {
  options = options || {};
  if (!requireAdmin()) {
    return Promise.resolve({ ok: false });
  }
  syncAdminBattlesRealtime();
  state.adminBattles.loading = !options.silent;
  state.adminBattles.error = "";
  if (!options.silent) {
    render();
  }
  return listAdminControlledBattles().then(function (result) {
    state.adminBattles.loading = false;
    if (!result.ok) {
      state.adminBattles.error = messageDescriptor("admin.loadBattlesFailed");
      state.adminBattles.rows = [];
      if (state.scene && state.scene.name === "admin-battles") {
        render();
      }
      return result;
    }
    state.adminBattles.rows = result.battles || [];
    if (state.scene && state.scene.name === "admin-battles") {
      render();
    }
    return result;
  }).catch(function (error) {
    state.adminBattles.loading = false;
    state.adminBattles.error = messageDescriptor("admin.loadBattlesFailed");
    if (state.scene && state.scene.name === "admin-battles") {
      render();
    }
    return { ok: false, message: error.message };
  });
}

function syncAdminBattlesRealtime() {
  var client = getSupabaseClient();
  if (!client || activeAdminBattlesRealtimeChannel) {
    return;
  }
  var table = "authoritative_battle";
  activeAdminBattlesRealtimeChannel = client.channel("admin-battles-list-" + table).on("postgres_changes", {
    event: "*",
    schema: "public",
    table: table
  }, function (payload) {
    if (currentUserIsAdmin() && state.scene && state.scene.name === "admin-battles") {
      if (payload && payload.new && payload.new.contract_key
        && ["admin_gym", "league", "debug_training"].indexOf(String(payload.new.contract_key)) === -1) { return; }
      queueAdminBattlesRefresh();
    }
  }).subscribe();
}

function queueAdminBattlesRefresh() {
  if (activeAdminBattlesRefresh) {
    activeAdminBattlesRefreshDirty = true;
    return activeAdminBattlesRefresh;
  }
  function drainRefreshes() {
    activeAdminBattlesRefreshDirty = false;
    return refreshAdminBattles({ silent: true }).then(function (result) {
      return activeAdminBattlesRefreshDirty ? drainRefreshes() : result;
    });
  }
  activeAdminBattlesRefresh = drainRefreshes().finally(function () { activeAdminBattlesRefresh = null; });
  return activeAdminBattlesRefresh;
}

export function openAdminBattles() {
  if (!requireAdmin()) {
    return;
  }
  setScene({ name: "admin-battles" });
  refreshAdminBattles();
}

registerAction("admin-dashboard-message-send", function () {
  var input;
  var text;
  if (!requireAdmin()) {
    return;
  }
  if (state.adminDashboardMessage && state.adminDashboardMessage.sending) {
    return;
  }
  input = root.querySelector('[data-field="admin-dashboard-message"]');
  text = input ? String(input.value || "").trim() : "";
  state.adminDashboardMessage = {
    text: text,
    sending: false,
    error: "",
    notice: ""
  };
  if (!text) {
    state.adminDashboardMessage.error = messageDescriptor("admin.enterAnnouncement");
    render();
    return;
  }
  state.adminDashboardMessage.sending = true;
  render();
  appendAdminGlobalActivityMessage(text).then(function (result) {
    state.adminDashboardMessage.sending = false;
    if (!result.ok) {
      state.adminDashboardMessage.error = messageDescriptor("admin.sendAnnouncementFailed");
      state.adminDashboardMessage.notice = "";
      render();
      return result;
    }
    state.adminDashboardMessage = {
      text: "",
      sending: false,
      error: "",
      notice: messageDescriptor("admin.announcementSent")
    };
    render();
    return result;
  }).catch(function (error) {
    state.adminDashboardMessage.sending = false;
    state.adminDashboardMessage.error = messageDescriptor("admin.sendAnnouncementFailed");
    state.adminDashboardMessage.notice = "";
    render();
  });
});

function buildAdminBattleScene(result, playerAuthUserId, previousScene) {
  var scene = applyAuthoritativeProjection({ name: "admin-battle", adminBattle: true, authoritativeBattle: true,
    authoritativeAdminBattle: true, authoritativeLastEventSeq: 0, manager: { log: [] } }, result.battle, result.events || []);
  scene.name = "admin-battle";
  scene.adminBattle = true;
  scene.playerAuthUserId = result.battle.auth_user_id || playerAuthUserId;
  scene.authoritativeBattleId = result.battle.battle_id || scene.authoritativeBattleId || "";
  scene.playerUsername = result.battle.player_username || "";
  if (previousScene && previousScene.battleInfoPanel) {
    scene.battleInfoPanel = previousScene.battleInfoPanel;
  }
  if (previousScene && previousScene.battleBottomPanel) {
    scene.battleBottomPanel = previousScene.battleBottomPanel;
  }
  return scene;
}

function loadAuthoritativeAdminBattlePages(playerAuthUserId, battleId, afterSeq, onPage) {
  var limit = 100;
  var combined = { ok: true, battle: null, events: [] };
  function readPage() {
    var pageAfterSeq = Number(afterSeq) || 0;
    return loadAdminControlledBattle(playerAuthUserId, battleId, { afterSeq: pageAfterSeq, limit: limit }).then(function (result) {
      var events = result.events || [];
      if (!result.ok || !result.battle) { return result; }
      combined.battle = result.battle;
      combined.events = combined.events.concat(events);
      if (onPage) { onPage(result); }
      var nextSeq = events.reduce(function (highest, event) { return Math.max(highest, Number(event.seq) || 0); }, pageAfterSeq);
      afterSeq = nextSeq;
      return events.length === limit && nextSeq > pageAfterSeq ? readPage() : combined;
    });
  }
  return readPage();
}

function refreshAuthoritativeAdminBattle(playerAuthUserId, battleId) {
  var scene = state.scene && state.scene.name === "admin-battle" ? state.scene : null;
  var generation = activeAdminBattleRefreshGeneration;
  if (!scene || String(scene.authoritativeBattleId || "") !== String(battleId || "")) {
    return Promise.resolve({ ok: false });
  }
  return loadAuthoritativeAdminBattlePages(playerAuthUserId, battleId, scene.authoritativeLastEventSeq, function (page) {
    if (generation !== activeAdminBattleRefreshGeneration || state.scene !== scene) { return; }
    if ((Number(page.battle.battle_version) || 0) >= (Number(scene.authoritativeBattleVersion) || 0)) {
      applyAuthoritativeProjection(scene, page.battle, page.events);
    } else {
      appendAuthoritativeEventLines(scene, page.events);
    }
    scene.name = "admin-battle";
    scene.adminBattle = true;
    scene.authoritativeAdminBattle = true;
  }).then(function (result) {
    if (generation === activeAdminBattleRefreshGeneration && state.scene === scene) {
      if (result.ok && !result.battle) { handleAdminBattleDeleted(playerAuthUserId); }
      else if (!result.ok) { state.saveStatus = { state: "error", message: messageDescriptor("admin.updateBattleFailed") }; }
      render({ scrollBattleLogToBottom: true });
    }
    return result;
  });
}

function refreshOpenAdminBattle(playerAuthUserId, battleId) {
  if (!battleId) { return Promise.resolve({ ok: false, code: "missing_battle_id" }); }
  if (activeAdminBattleRefresh) { activeAdminBattleRefreshDirty = true; return activeAdminBattleRefresh; }
  var generation = activeAdminBattleRefreshGeneration;
  function drainNotifications() {
    activeAdminBattleRefreshDirty = false;
    return refreshAuthoritativeAdminBattle(playerAuthUserId, battleId).then(function (result) {
      return activeAdminBattleRefreshDirty && generation === activeAdminBattleRefreshGeneration
        ? drainNotifications() : result;
    });
  }
  var refresh = drainNotifications().finally(function () {
    if (generation === activeAdminBattleRefreshGeneration && activeAdminBattleRefresh === refresh) {
      activeAdminBattleRefresh = null;
    }
  });
  activeAdminBattleRefresh = refresh;
  return activeAdminBattleRefresh;
}

function handleAdminBattleDeleted(playerAuthUserId) {
  if (!state.scene || (state.scene.name !== "admin-battle" && state.scene.name !== "admin-battle-restore")) {
    return;
  }
  if (String(state.scene.playerAuthUserId || "") !== String(playerAuthUserId || "")) {
    return;
  }
  state.adminBattles = { loading: false, rows: [], error: "" };
  setScene({ name: "admin-home" }, { history: "replace" });
}

function syncAdminBattleRealtime(playerAuthUserId, battleId) {
  var client = getSupabaseClient();
  var normalizedPlayerId = String(playerAuthUserId || "");
  var normalizedBattleId = String(battleId || "");
  var channelIdentity = normalizedBattleId || normalizedPlayerId;
  if (!client || !normalizedPlayerId || activeAdminBattleRealtimePlayerId === channelIdentity) {
    return;
  }
  if (activeAdminBattleRealtimeChannel) {
    client.removeChannel(activeAdminBattleRealtimeChannel);
    activeAdminBattleRealtimeChannel = null;
  }
  activeAdminBattleRealtimePlayerId = channelIdentity;
  if (!normalizedBattleId) { return; }
  activeAdminBattleRefreshGeneration += 1;
  activeAdminBattleRefreshDirty = false;
  activeAdminBattleRefresh = null;
  function refreshBattle() {
    if (state.scene && state.scene.name === "admin-battle"
      && String(state.scene.authoritativeBattleId || "") === normalizedBattleId) {
      refreshOpenAdminBattle(normalizedPlayerId, normalizedBattleId);
    }
  }
  activeAdminBattleRealtimeChannel = client.channel("admin-authoritative-battle-" + normalizedBattleId)
    .on("postgres_changes", { event: "UPDATE", schema: "public", table: "authoritative_battle",
      filter: "id=eq." + normalizedBattleId }, refreshBattle)
    .subscribe(function (status) {
      if (status === "SUBSCRIBED") {
        refreshBattle();
      }
    });
}

export function openAdminBattle(playerAuthUserId, battleId) {
  if (!requireAdmin()) {
    return;
  }
  setScene({ name: "admin-battle-restore", playerAuthUserId: playerAuthUserId, battleId: battleId });
  loadAuthoritativeAdminBattlePages(playerAuthUserId, battleId, 0).then(function (result) {
    var scene;
    if (!result.ok || !result.battle) {
      openMessage([messageDescriptor("admin.battleNotFound")], { title: messageDescriptor("admin.activeBattlesTitle") });
      setScene({ name: "admin-battles" }, { history: "replace" });
      return;
    }
    scene = buildAdminBattleScene(result, playerAuthUserId, null);
    setScene(scene, { history: "replace" });
    syncAdminBattleRealtime(scene.playerAuthUserId, scene.authoritativeBattleId);
  }).catch(function (error) {
    openMessage([messageDescriptor("admin.openBattleFailed")], { title: messageDescriptor("admin.activeBattlesTitle") });
    setScene({ name: "admin-battles" }, { history: "replace" });
  });
}

function adminScene() {
  return state.scene && state.scene.name === "admin-battle" ? state.scene : null;
}

registerAction("admin-battles-refresh", function () {
  refreshAdminBattles();
});

registerAction("open-admin-battles", function () {
  openAdminBattles();
});

registerAction("admin-battle-open", function (element) {
  openAdminBattle(element.dataset.authUserId || "", element.dataset.battleId || "");
});

function runAuthoritativeAdminAction(scene, commandType, payload, operation) {
  if (!scene || scene.authoritativeCommandPending) { return Promise.resolve({ ok: false }); }
  var canonicalPayload = JSON.stringify({ commandType: commandType, payload: payload });
  var pending = scene.authoritativeAdminRetryCommand;
  if (pending && pending.canonicalPayload !== canonicalPayload) {
    openMessage([messageDescriptor("admin.pendingUncertainCommand")], { title: messageDescriptor("admin.activeBattlesTitle") });
    return Promise.resolve({ ok: false, uncertain: true });
  }
  pending = pending || {
    commandId: globalThis.crypto.randomUUID(),
    expectedBattleVersion: scene.authoritativeBattleVersion,
    canonicalPayload: canonicalPayload
  };
  var hpBefore = hpSnapshot(scene);
  scene.authoritativeAdminRetryCommand = pending;
  scene.authoritativeCommandPending = true;
  render();
  return operation(Object.assign({ battleId: scene.authoritativeBattleId,
    expectedBattleVersion: pending.expectedBattleVersion, commandId: pending.commandId }, payload)).then(function (result) {
    scene.authoritativeCommandPending = false;
    if (!result.ok) {
      if (!result.uncertain) { scene.authoritativeAdminRetryCommand = null; }
      if (result.code === "revision_conflict") {
        scene.authoritativeAdminRetryCommand = null;
        refreshOpenAdminBattle(scene.playerAuthUserId, scene.authoritativeBattleId);
        return result;
      }
      openMessage([messageDescriptor(result.uncertain ? "admin.uncertainReceipt" : "admin.actionFailed")], {
        title: messageDescriptor("admin.activeBattlesTitle")
      });
      render();
      return result;
    }
    scene.authoritativeAdminRetryCommand = null;
    applyAuthoritativeProjection(scene, result.battle, result.events);
    var hpAfter = hpSnapshot(scene);
    var hpChanged = Object.keys(hpAfter).some(function (key) { return hpAfter[key] !== hpBefore[key]; });
    scene.name = "admin-battle";
    scene.adminBattle = true;
    scene.authoritativeAdminBattle = true;
    render({ scrollBattleLogToBottom: true }).then(function () {
      if (state.scene !== scene || !hpChanged) {
        return;
      }
      return animateHpSequence([hpBefore, hpAfter], scene);
    });
    return result;
  }).catch(function (error) {
    scene.authoritativeCommandPending = false;
    openMessage([messageDescriptor("admin.uncertainAction")], { title: messageDescriptor("admin.activeBattlesTitle") });
    render();
    return { ok: false, message: error.message };
  });
}

registerAction("admin-battle-move", function (element) {
  var scene = adminScene();
  var moveIndex = Number(element.dataset.index);
  var moveEntry = scene && scene.enemyTeam.getActive().moveStates[moveIndex];
  if (!scene || activeAdminBattleRefresh || !moveEntry || !moveEntry.enabled || scene.manager.waitingFor !== "admin") {
    return;
  }
  runAuthoritativeAdminAction(scene, "move", { moveSlot: moveIndex }, submitAuthoritativeAdminMove);
});

registerAction("admin-battle-entry-choice", function (element) {
  var scene = adminScene();
  var choice = scene && scene.authoritativeAdminEntryChoice;
  if (!scene || activeAdminBattleRefresh || scene.authoritativeCommandPending || !choice
    || scene.manager.waitingFor !== "admin") { return; }
  runAuthoritativeAdminAction(scene, "entry_choice", {
    entryChoice: { index: Number(element.dataset.index), kind: String(choice.kind || "") }
  }, resolveAuthoritativeAdminEntryChoice);
});

registerAction("admin-battle-switch", function (element) {
  var scene = adminScene();
  var targetIndex = Number(element.dataset.index);
  var target = scene && scene.enemyTeam.combatantList[targetIndex];
  if (!scene || activeAdminBattleRefresh || !target || scene.manager.waitingFor !== "admin") {
    return;
  }
  runAuthoritativeAdminAction(scene, "switch", { teamSlot: target.pokemon.authoritativeSlot }, switchAuthoritativeAdminPokemon);
});

function useAdminItemOnTarget(scene, item, targetIndex) {
  var target = scene.enemyTeam.combatantList[targetIndex];
  if (!target) {
    return;
  }
  runAuthoritativeAdminAction(scene, "item", {
    itemIndex: item.index,
    targetSlot: target.pokemon.authoritativeSlot
  }, useAuthoritativeAdminItem);
}

registerAction("admin-battle-item-use", function (element) {
  var scene = adminScene();
  var itemIndex = Number(element.dataset.itemIndex);
  var item = scene ? getInventoryItemByIndex(scene.adminItems, itemIndex) : null;
  if (!scene || activeAdminBattleRefresh || scene.pendingAdminEntryChoice || scene.manager.waitingFor !== "admin" || !item || item.quantity <= 0) {
    return;
  }
  if (!scene.manager.itemNeedsPokemonTarget(item)) {
    useAdminItemOnTarget(scene, item, scene.enemyTeam.activeIndex);
    return;
  }
  var targetEntries = scene.enemyTeam.combatantList.map(function (combatant, index) {
    return {
      name: combatant.pokemon ? combatant.pokemon.name : "",
      idx: index,
      selectable: combatant.pokemon && scene.manager.canUseItemOnTarget(item, combatant).ok
    };
  });
  openBattleTargetPanel(element, item, targetEntries, "admin-battle-item-target");
});

registerAction("admin-battle-item-target", function (element) {
  var scene = adminScene();
  if (!scene || activeAdminBattleRefresh || scene.pendingAdminEntryChoice || scene.manager.waitingFor !== "admin" || !state.battleTargetPanel.visible) {
    return;
  }
  var itemIndex = Number(element.dataset.itemIndex || state.battleTargetPanel.itemIndex);
  var item = getInventoryItemByIndex(scene.adminItems, itemIndex);
  var targetIndex = Number(element.dataset.index);
  if (!item) {
    return;
  }
  useAdminItemOnTarget(scene, item, targetIndex);
  closeBattleTargetPanel();
});
