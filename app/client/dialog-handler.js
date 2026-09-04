import { root, state } from "./game-state.js";
import { renderConfirmDialog, renderMessageDialog } from "../view/dialogs.js";
import { renderDialogLayer } from "./renderer.js";
import { registerAction } from "./action-registry.js";
import { textDescriptor } from "./i18n.js";

export function openMessage(lines, options) {
  options = options || {};
  state.dialog = {
    type: "message",
    title: options.title || "",
    lines: lines,
    closeLabel: options.closeLabel || textDescriptor("ui.dialogs.close"),
    closeClass: options.closeClass || "button-primary",
    onClose: options.onClose || null,
    pokemon: options.pokemon || null,
    battleLockScene: options.battleLockScene || "",
    requireButtonClose: !!options.requireButtonClose
  };
  renderDialogLayer({ scrollBattleLogToBottom: !!options.scrollBattleLogToBottom });
}

export function openRewardClaimMessage(reward, title, pokemonInstanceId) {
  var pokemon = pokemonInstanceId ? (state.team || []).concat(state.box || []).find(function (entry) {
    return entry && String(entry.instanceId || "") === String(pokemonInstanceId);
  }) : null;
  state.dialog = {
    type: "reward-claimed",
    title: title,
    reward: reward,
    pokemon: pokemon || null
  };
  renderDialogLayer();
}

export function openConfirm(title, lines, onConfirm, options) {
  options = options || {};
  state.dialog = {
    type: "confirm",
    title: title,
    lines: lines,
    confirmLabel: options.confirmLabel || textDescriptor("ui.dialogs.confirm"),
    confirmClass: options.confirmClass || "button-danger",
    onConfirm: onConfirm,
    requireButtonClose: !!options.requireButtonClose
  };
  renderDialogLayer();
}

function closeInlineDialog() {
  var backdrop = root.querySelector("[data-inline-dialog]");
  if (backdrop) {
    backdrop.remove();
  }
  state.dialog = null;
}

export function openInlineConfirm(title, lines, onConfirm, options) {
  options = options || {};
  closeInlineDialog();
  state.dialog = {
    type: "confirm",
    inline: true,
    title: title,
    lines: lines,
    confirmLabel: options.confirmLabel || textDescriptor("ui.dialogs.confirm"),
    confirmClass: options.confirmClass || "button-danger",
    onConfirm: onConfirm
  };
  root.insertAdjacentHTML("beforeend", renderConfirmDialog(state.dialog));
}

export function openInlineMessage(lines, options) {
  options = options || {};
  closeInlineDialog();
  state.dialog = {
    type: "message",
    inline: true,
    title: options.title || "",
    lines: lines,
    closeLabel: options.closeLabel || textDescriptor("ui.dialogs.close"),
    closeClass: options.closeClass || "button-primary"
  };
  root.insertAdjacentHTML("beforeend", renderMessageDialog(state.dialog));
}

function dismissDialog(runCallback) {
  var dialog = state.dialog;
  state.dialog = null;
  if (runCallback && dialog && typeof dialog.onClose === "function") {
    dialog.onClose();
    return;
  }
  renderDialogLayer();
}

export function openTeamChoiceDialog(options) {
  state.dialog = {
    type: "team-choose",
    title: options.title,
    copy: options.copy,
    entries: options.entries,
    canCancel: options.canCancel,
    activeIndex: options.activeIndex,
    onPick: options.onPick
  };
  renderDialogLayer();
}

registerAction("dialog-close", function(element) {
    if (state.dialog && state.dialog.inline) {
      closeInlineDialog();
      return;
    }
    dismissDialog(true);
    return;

});

registerAction("dialog-confirm", function(element) {
    var dialog = state.dialog;
    if (dialog && dialog.inline) {
      closeInlineDialog();
    } else {
      state.dialog = null;
    }
    if (dialog && typeof dialog.onConfirm === "function") {
      dialog.onConfirm();
      if (!dialog.inline) renderDialogLayer();
    } else {
      renderDialogLayer();
    }
    return;

});

registerAction("dialog-team-pick", function(element) {
    var teamDialog = state.dialog;
    if (!teamDialog || typeof teamDialog.onPick !== "function") {
      return;
    }
    teamDialog.onPick(Number(element.dataset.index));

});

registerAction("kanto-league-entry-start", function() {
    var entryDialog = state.dialog;
    state.dialog = null;
    if (entryDialog && typeof entryDialog.onStart === "function") {
      entryDialog.onStart();
    } else {
      renderDialogLayer();
    }

});

registerAction("kanto-league-entry-pick", function(element) {
    var index = Number(element.dataset.index);
    var entryDialog = state.dialog;
    state.dialog = null;
    if (entryDialog && typeof entryDialog.onPick === "function") {
      entryDialog.onPick(isNaN(index) ? 0 : index);
    } else {
      renderDialogLayer();
    }

});
