var actionHandlers;
var actionGuards = [];

export function registerActionGuard(guard) {
  actionGuards.push(guard);
}

export function registerAction(action, handler) {
  if (!actionHandlers) { actionHandlers = {}; }
  if (actionHandlers[action]) {
    throw new Error("Duplicate action registration: " + action);
  }
  actionHandlers[action] = handler;
}

export function handleAction(action, element) {
  if (actionGuards.some(function (guard) { return guard(action, element) === false; })) return;
  var handler = actionHandlers[action];
  if (handler) {
    return handler(element);
  }
  console.warn("No handler is registered for this action:", action);
}
