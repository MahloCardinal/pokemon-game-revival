// Keep the backdrop and dialog box mounted; only their content changes between
// steps. This module has no game state and can also survive a full scene render.
function backdrops(root) {
  return Array.from(root.children).filter(function (node) {
    return node.classList.contains("dialog-backdrop");
  });
}

function copyAttributes(current, next) {
  Array.from(current.attributes).forEach(function (attribute) {
    if (!next.hasAttribute(attribute.name)) current.removeAttribute(attribute.name);
  });
  Array.from(next.attributes).forEach(function (attribute) {
    current.setAttribute(attribute.name, attribute.value);
  });
}

export function replaceSceneContent(root, markup) {
  var template = root.ownerDocument.createElement("template");
  template.innerHTML = markup;
  Array.from(root.childNodes).forEach(function (node) {
    if (!node.classList || !node.classList.contains("dialog-backdrop")) node.remove();
  });
  root.insertBefore(template.content, root.firstChild);
}

export function updateDialogContent(root, markup, pending) {
  var current = backdrops(root);
  if (pending && current.length) {
    // Do not re-render (or empty) the last screen during a network request.
    current.forEach(function (node) {
      node.setAttribute("inert", "");
      node.setAttribute("aria-busy", "true");
      node.classList.add("dialog-backdrop--pending");
    });
    return;
  }
  var template = root.ownerDocument.createElement("template");
  template.innerHTML = markup;
  var next = Array.from(template.content.children);
  next.forEach(function (replacement, index) {
    var existing = current[index];
    if (!existing) { root.appendChild(replacement); return; }
    copyAttributes(existing, replacement);
    var box = existing.firstElementChild;
    var nextBox = replacement.firstElementChild;
    if (box && nextBox && box.tagName === nextBox.tagName) {
      copyAttributes(box, nextBox);
      // One synchronous replacement: there is never an empty rendered frame.
      if (box.innerHTML !== nextBox.innerHTML) box.innerHTML = nextBox.innerHTML;
    } else {
      existing.replaceChildren(...replacement.childNodes);
    }
  });
  current.slice(next.length).forEach(function (node) { node.remove(); });
}
