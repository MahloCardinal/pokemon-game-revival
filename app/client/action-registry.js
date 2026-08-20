var actionHandlers;

export function registerAction(action, handler) {
  if (!actionHandlers) { actionHandlers = {}; }
  if (actionHandlers[action]) {
    throw new Error("Duplicate action registration: " + action);
  }
  actionHandlers[action] = handler;
}

export function handleAction(action, element) {
  var handler = actionHandlers[action];
  if (handler) {
    return handler(element);
  }
  console.warn("No handler is registered for this action:", action);
}
