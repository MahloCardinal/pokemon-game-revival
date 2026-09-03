import { loadGlobalActivityFeed } from "../api/activity-feed.js";
import { state } from "./game-state.js";
import { messageDescriptor } from "./i18n.js";

var HOME_ACTIVITY_POLL_MS = 60000;
var homeActivityTimer = null;
var homeActivityRefreshInFlight = false;
var homeActivityWasActive = false;

function defaultActivityFeedState() {
  return { loading: false, loaded: false, rows: [], error: "", selectedDashboard: "players" };
}

function ensureActivityFeedState() {
  if (!state.activityFeed) {
    state.activityFeed = defaultActivityFeedState();
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
