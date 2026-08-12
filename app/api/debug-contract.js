export function authoritativeDebugPlayerState(result) {
  var playerState = result && result.ok && result.projection && result.projection.player_state;
  return playerState && typeof playerState === "object" ? playerState : null;
}
