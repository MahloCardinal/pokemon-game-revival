var actionHandlers;

export function registerAction(action, handler) {
  if (!actionHandlers) { actionHandlers = {}; }
  if (actionHandlers[action]) {
    throw new Error("Registrazione duplicata dell'azione: " + action);
  }
  actionHandlers[action] = handler;
}

export function handleAction(action, element) {
  var handler = actionHandlers[action];
  if (handler) {
    return handler(element);
  }
  console.warn("Non ci sono handler per questa azione:", action);
}
