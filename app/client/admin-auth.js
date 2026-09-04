import { state } from "./game-state.js";

export function currentUsername() {
  if (!state) {
    return "";
  }
  return String(state.auth && state.auth.userLabel || state.playerName || "").trim();
}

export function currentUserIsAdmin() {
  return Boolean(state.auth && Array.isArray(state.auth.serverRoles) && state.auth.serverRoles.indexOf("admin") !== -1);
}
