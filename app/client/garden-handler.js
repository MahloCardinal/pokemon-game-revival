import { registerAction } from "./action-registry.js";
import { openMessage } from "./dialog-handler.js";
import { render } from "./renderer.js";
import { claimDailyBerryAuthoritative, getCurrentPlayerState, harvestGardenPlotAuthoritative, plantGardenBerryAuthoritative } from "../api/player-command.js";
import { saveFromAuthoritativeProjection } from "../api/player.js";
import { BERRY_NORMAL_CYCLE_ITEMS, BERRY_LONG_CYCLE_ITEMS, getBerryGrowthCycle, getItemByIndex, ItemCategory } from "../data/items.js";
import { requireNotInBattle } from "./battle-scene-lock.js";
import { applyGardenDailyLimit, applyPlayerSave, state } from "./game-state.js";
import { messageDescriptor, textDescriptor } from "./i18n.js";

var DAILY_BERRY_LONG_CHANCE = 0.1;
var authoritativeGardenCommandPending = false;
var dailyBerryRefreshId = 0;

function inventoryQuantity(itemIndex) {
    return (state.inventory || []).reduce(function(total, entry) {
        return Number(entry[0]) === Number(itemIndex) ? total + Number(entry[1] || 0) : total;
    }, 0);
}

function ensureGardenRuntimeState() {
    if (!state.garden.harvestNotices) {
        state.garden.harvestNotices = [null, null, null];
    }
    if (state.garden.plantingPlotIndex === undefined) {
        state.garden.plantingPlotIndex = null;
    }
}

export function clearGardenHarvestNotices() {
    ensureGardenRuntimeState();
    state.garden.harvestNotices = [null, null, null];
}

function rollDailyBerryIndex() {
    var pool = Math.random() < DAILY_BERRY_LONG_CHANCE ? BERRY_LONG_CYCLE_ITEMS : BERRY_NORMAL_CYCLE_ITEMS;
    var item = pool[Math.floor(Math.random() * pool.length)];
    return item ? item.index : 0;
}

export async function refreshDailyBerryLimit() {
    var refreshId = ++dailyBerryRefreshId;
    var garden = state.garden;
    var scene = state.scene;
    if (!state.garden.dailyBerry) {
        state.garden.dailyBerry = {};
    }
    state.garden.dailyBerry.loading = true;
    state.garden.dailyBerry.claiming = false;
    state.garden.dailyBerry.error = "";
    state.garden.dailyBerry.rewardItemIndex = null;
    render();

    var result;
    result = await getCurrentPlayerState();
    if (refreshId !== dailyBerryRefreshId || state.garden !== garden || result.code === "stale_session") {
        return result;
    }
    garden.dailyBerry.loading = false;
    if (state.scene !== scene || state.inBattle || state.battleStartPending) {
        return result;
    }
    if (result.projection && Number(result.projection.revision) < Number(state.authoritativeRevision)) {
        render();
        return result;
    }
    if (result.ok && result.projection && result.projection.has_player) {
        applyPlayerSave(saveFromAuthoritativeProjection(result.projection));
        render();
        return result;
    }
    if (!result.ok) {
        state.garden.dailyBerry.loading = false;
        state.garden.dailyBerry.error = messageDescriptor("garden.actionFailed");
        render();
        return result;
    }

    applyGardenDailyLimit(result.dailyLimit);
    render();
    return result;
}

registerAction("garden-plant-plot", function(element) {
    if (!requireNotInBattle()) return;
    var plotIndex = Number(element.dataset.plotIndex);

    ensureGardenRuntimeState();
    if (!Number.isInteger(plotIndex) || state.garden.plots[plotIndex]) {
        return;
    }

    clearGardenHarvestNotices();
    state.garden.plantingPlotIndex = state.garden.plantingPlotIndex === plotIndex ? null : plotIndex;
    render();
    return;

});

registerAction("garden-plant-select", async function(element) {
    if (!requireNotInBattle()) return;
    var berryIndex = Number(element.dataset.itemIndex);
    var plotIndex = Number(element.dataset.plotIndex);
    var item = getItemByIndex(berryIndex);
    var growthSeconds = Number(getBerryGrowthCycle(berryIndex));
    var result;

    ensureGardenRuntimeState();
    if (!Number.isInteger(plotIndex) || !item || item.category !== ItemCategory.Berry || state.garden.plots[plotIndex]) {
        return;
    }
    if (!Number.isFinite(growthSeconds) || growthSeconds <= 0) {
        return;
    }
    if (inventoryQuantity(berryIndex) <= 0) {
        return;
    }

    if (authoritativeGardenCommandPending) return;
    authoritativeGardenCommandPending = true;
    result = await plantGardenBerryAuthoritative({
        expectedRevision: state.authoritativeRevision,
        plotIndex: plotIndex,
        itemIndex: berryIndex
    });
    authoritativeGardenCommandPending = false;
    if (!result.ok) {
        openMessage([messageDescriptor("garden.actionFailed")], { title: messageDescriptor("generic.errorTitle") });
        return;
    }
    applyPlayerSave(saveFromAuthoritativeProjection(result.projection));
    render();
    return;
});

registerAction("garden-harvest", async function(element) {
    if (!requireNotInBattle()) return;
    var plotIndex = Number(element.dataset.plotIndex);
    var plot = state.garden.plots[plotIndex];
    var growthSeconds = plot ? Number(getBerryGrowthCycle(plot.berryIndex)) : 0;
    var result;
    if (!plot) return;
    if (!Number.isFinite(growthSeconds) || growthSeconds <= 0) return;

    if (authoritativeGardenCommandPending) return;
    authoritativeGardenCommandPending = true;
    result = await harvestGardenPlotAuthoritative({
        expectedRevision: state.authoritativeRevision,
        plotIndex: plotIndex
    });
    authoritativeGardenCommandPending = false;
    if (!result.ok) {
        openMessage([messageDescriptor("garden.actionFailed")], { title: messageDescriptor("generic.errorTitle") });
        return;
    }
    applyPlayerSave(saveFromAuthoritativeProjection(result.projection));
    ensureGardenRuntimeState();
    state.garden.harvestNotices[plotIndex] = {
        berryIndex: Number(result.projection.berry_index),
        quantity: Number(result.projection.quantity)
    };
    render();
    return;
});

registerAction("garden-harvest-notice-ok", function(element) {
    var plotIndex = Number(element.dataset.plotIndex);
    ensureGardenRuntimeState();
    if (Number.isInteger(plotIndex)) {
        state.garden.harvestNotices[plotIndex] = null;
    }
    render();
    return;

});

registerAction("garden-daily-berry-claim", async function(element) {
    if (!requireNotInBattle()) return;
    if (state.garden.dailyBerry && (state.garden.dailyBerry.loading || state.garden.dailyBerry.claiming)) {
        return;
    }

    if (authoritativeGardenCommandPending) return;
    authoritativeGardenCommandPending = true;
    state.garden.dailyBerry.claiming = true;
    render();
    var authoritativeResult = await claimDailyBerryAuthoritative({
        expectedRevision: state.authoritativeRevision
    });
    authoritativeGardenCommandPending = false;
    if (!authoritativeResult.ok) {
        state.garden.dailyBerry.claiming = false;
        openMessage([messageDescriptor("garden.actionFailed")], { title: textDescriptor("ui.garden.sceneTitle") });
        return;
    }
    applyPlayerSave(saveFromAuthoritativeProjection(authoritativeResult.projection));
    state.garden.dailyBerry.rewardItemIndex = Number(authoritativeResult.projection.reward_item_index) || null;
    render();
    return;
});
