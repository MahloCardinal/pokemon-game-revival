import { registerAction } from "./action-registry.js";
import { state } from "./game-state.js";
import { render } from "./renderer.js";

registerAction("home-activity-dashboard-select", function (element) {
  var dashboard = String(element && element.dataset.dashboard || "");
  if (!state.scene || state.scene.name !== "home" || ["players", "admin"].indexOf(dashboard) === -1) {
    return;
  }
  state.activityFeed.selectedDashboard = dashboard;
  render({ preserveScroll: true });
});
