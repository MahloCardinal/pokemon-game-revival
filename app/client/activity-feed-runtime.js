import { appendGlobalActivityFeedEvent, loadGlobalActivityFeed } from "../api/activity-feed.js";
import { state } from "./game-state.js";
import { messageDescriptor } from "./i18n.js";

var HOME_ACTIVITY_POLL_MS = 60000;
var homeActivityTimer = null;
var homeActivityRefreshInFlight = false;
var homeActivityFlushInFlight = false;
var homeActivityWasActive = false;

function defaultActivityFeedState() {
  return { loading: false, loaded: false, rows: [], error: "", selectedDashboard: "players" };
}

function normalizeActivityEvent(event) {
  var eventType = String(event && event.eventType || "");
  var subjectName = String(event && event.subjectName || "").trim();
  var secondarySubjectName = String(event && event.secondarySubjectName || "").trim();
  if (["starter", "capture", "badge", "evolution", "league"].indexOf(eventType) === -1 || !subjectName) {
    return null;
  }
  if (eventType === "evolution" && !secondarySubjectName) {
    return null;
  }
  return {
    eventType: eventType,
    subjectName: subjectName,
    secondarySubjectName: secondarySubjectName
  };
}

function ensureActivityFeedState() {
  if (!state.activityFeed) {
    state.activityFeed = defaultActivityFeedState();
  }
  if (!Array.isArray(state.pendingGlobalActivities)) {
    state.pendingGlobalActivities = [];
  }
}

function shouldPollHomeActivity() {
  return Boolean(state.auth && state.auth.user && state.scene && state.scene.name === "home");
}

function stopHomeActivityPolling() {
  if (homeActivityTimer) {
    window.clearInterval(homeActivityTimer);
    homeActivityTimer = null;
  }
  homeActivityWasActive = false;
}

export function createDefaultActivityFeedState() {
  return defaultActivityFeedState();
}

export function queueGlobalActivityEvent(event) {
  var normalized = normalizeActivityEvent(event);
  ensureActivityFeedState();
  if (normalized) {
    state.pendingGlobalActivities.push(normalized);
  }
}

export async function recordGlobalActivityEvent(event) {
  var normalized = normalizeActivityEvent(event);
  if (!normalized) {
    return { ok: true };
  }
  if (isActivityFeedBypassed()) {
    return { ok: true };
  }
  try {
    return await appendGlobalActivityFeedEvent(normalized);
  } catch (error) {
    return { ok: false, code: "activity_feed_save_failed" };
  }
}

export async function flushPendingGlobalActivityEvents() {
  var event;
  var result;
  ensureActivityFeedState();
  if (isActivityFeedBypassed()) {
    state.pendingGlobalActivities = [];
    return { ok: true };
  }
  if (homeActivityFlushInFlight || !state.pendingGlobalActivities.length) {
    return { ok: true };
  }
  homeActivityFlushInFlight = true;
  try {
    while (state.pendingGlobalActivities.length) {
      event = state.pendingGlobalActivities.shift();
      result = await appendGlobalActivityFeedEvent(event);
      if (!result.ok) {
        state.pendingGlobalActivities.unshift(event);
        homeActivityFlushInFlight = false;
        return result;
      }
    }
  } catch (error) {
    if (event) {
      state.pendingGlobalActivities.unshift(event);
    }
    homeActivityFlushInFlight = false;
    return { ok: false, code: "activity_feed_save_failed" };
  }
  homeActivityFlushInFlight = false;
  return { ok: true };
}

function isActivityFeedBypassed() {
  return String(state.auth && state.auth.userLabel || state.playerName || "").trim() === "aaa";
}

export function refreshHomeActivityFeed(onRefresh, silent) {
  ensureActivityFeedState();
  if (homeActivityRefreshInFlight || !(state.auth && state.auth.user)) {
    return;
  }
  homeActivityRefreshInFlight = true;
  if (!silent) {
    state.activityFeed.loading = true;
  }
  state.activityFeed.error = "";
  loadGlobalActivityFeed().then(function (result) {
    homeActivityRefreshInFlight = false;
    state.activityFeed.loading = false;
    state.activityFeed.loaded = true;
    if (result.ok) {
      state.activityFeed.rows = result.events || [];
      state.activityFeed.error = "";
    } else {
      state.activityFeed.error = messageDescriptor("activityFeed.loadFailed");
    }
    if (shouldPollHomeActivity() && typeof onRefresh === "function") {
      onRefresh();
    }
  }).catch(function (error) {
    homeActivityRefreshInFlight = false;
    state.activityFeed.loading = false;
    state.activityFeed.loaded = true;
    state.activityFeed.error = messageDescriptor("activityFeed.loadFailed");
    if (shouldPollHomeActivity() && typeof onRefresh === "function") {
      onRefresh();
    }
  });
}

export function syncHomeActivityFeedPolling(onRefresh) {
  var enteredHome;
  if (typeof window === "undefined") {
    return;
  }
  if (!shouldPollHomeActivity()) {
    stopHomeActivityPolling();
    return;
  }
  enteredHome = !homeActivityWasActive;
  homeActivityWasActive = true;
  if (enteredHome) {
    refreshHomeActivityFeed(onRefresh);
  }
  if (!homeActivityTimer) {
    homeActivityTimer = window.setInterval(function () {
      if (!shouldPollHomeActivity()) {
        stopHomeActivityPolling();
        return;
      }
      refreshHomeActivityFeed(onRefresh, true);
    }, HOME_ACTIVITY_POLL_MS);
  }
}
