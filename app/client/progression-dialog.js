import * as Engine from "../engine/index.js";
import { state } from "./game-state.js";
import { renderDialogLayer } from "./renderer.js";
import { registerAction } from "./action-registry.js";

// These are presentation copies. Only a successful authoritative command can
// replace the player's actual Pokémon or moves.
export function progressionMove(offer) {
  return Engine.moveFromJSON([Number(offer.move_index), Number(offer.power), Number(offer.stats)]);
}

export function progressionPokemon(pokemon, moves) {
  var preview = Engine.Pokemon.fromJSON(pokemon.toJSON());
  preview.moves = moves.map(function (move) { return Engine.moveFromJSON(move.toJSON()); });
  return preview;
}

export function confirmMoveForget(index, onConfirm) {
  var dialog = state.dialog;
  if (!dialog || dialog.forgetConfirmation || !Number.isInteger(index) || !dialog.moves || !dialog.moves[index]) return;
  dialog.forgetConfirmation = { move: dialog.moves[index], onConfirm: onConfirm };
  renderDialogLayer();
}

registerAction("move-forget-cancel", function () {
  if (!state.dialog || !state.dialog.forgetConfirmation) return;
  delete state.dialog.forgetConfirmation;
  renderDialogLayer();
});

registerAction("move-forget-confirm", function () {
  var dialog = state.dialog;
  if (!dialog || !dialog.forgetConfirmation) return;
  var onConfirm = dialog.forgetConfirmation.onConfirm;
  delete dialog.forgetConfirmation;
  onConfirm();
});
