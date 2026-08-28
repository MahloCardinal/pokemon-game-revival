import { getPlayerDirectory } from "../api/player-directory.js";
import { messageDescriptor } from "./i18n.js";
import { registerAction } from "./action-registry.js";
import { renderRegions, setScene } from "./renderer.js";
import { state } from "./game-state.js";

export async function loadPlayerDirectory(scene) {
  var result;
  if (!scene || scene.name !== "player-directory" || state.scene !== scene) return;
  result = await getPlayerDirectory();
  if (state.scene !== scene || scene.name !== "player-directory") return;
  scene.playerDirectory = {
    loading: false,
    loaded: result.ok,
    players: result.ok ? result.players : [],
    error: result.ok ? null : messageDescriptor("playerDirectory.loadFailed")
  };
  renderRegions(["player-directory-content"]);
}

registerAction("open-player-directory", function () {
  setScene({
    name: "player-directory",
    playerDirectory: { loading: true, loaded: false, players: [], error: null }
  });
});
