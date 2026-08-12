export function normalizeMoveDescriptionText(text) {
  return String(text)
    .replace(/\+2x\{(?:stats|buff)\}/g, function (_match, offset) {
      return offset === 0 ? "Aumenta di molto" : "aumenta di molto";
    })
    .replace(/-2x\{(?:stats|buff)\}/g, function (_match, offset) {
      return offset === 0 ? "Diminuisce di molto" : "diminuisce di molto";
    });
}

export function formatCatalogDescription(move) {
  return normalizeMoveDescriptionText(move.description || "Nessun effetto in battaglia")
    .replace(/\s*\(potenza: \{power\}, stats: \{(?:stats|buff)\}\)/g, "")
    .replace(/-\{power\}/g, function (_match, offset) {
      return offset === 0 ? "Danni" : "danni";
    })
    .replace(/\+\{stats\}/g, function (_match, offset) {
      return offset === 0 ? "Aumenta" : "aumenta";
    })
    .replace(/-\{stats\}/g, function (_match, offset) {
      return offset === 0 ? "Diminuisce" : "diminuisce";
    })
    .replace(/\+\{buff\}/g, function (_match, offset) {
      return offset === 0 ? "Aumenta" : "aumenta";
    })
    .replace(/-\{buff\}/g, function (_match, offset) {
      return offset === 0 ? "Diminuisce" : "diminuisce";
    });
}
