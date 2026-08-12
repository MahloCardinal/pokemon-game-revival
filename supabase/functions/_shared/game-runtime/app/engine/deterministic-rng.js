var activeRng = null;

function normalizeUint32(value, fallback) {
  var normalized = Number(value) >>> 0;
  return normalized || (fallback >>> 0) || 0x6d2b79f5;
}

export function createRngState(seed) {
  return {
    algorithm: "xorshift32-v1",
    state: normalizeUint32(seed, 0x6d2b79f5),
    draws: 0
  };
}

export function restoreRngState(value) {
  if (!value || value.algorithm !== "xorshift32-v1") {
    throw new Error("Stato RNG non supportato.");
  }
  return {
    algorithm: value.algorithm,
    state: normalizeUint32(value.state, 0x6d2b79f5),
    draws: Math.max(0, Math.floor(Number(value.draws) || 0))
  };
}

function draw(state) {
  var value = state.state >>> 0;
  value ^= value << 13;
  value ^= value >>> 17;
  value ^= value << 5;
  state.state = value >>> 0;
  state.draws += 1;
  return state.state / 0x100000000;
}

export function random() {
  return activeRng ? draw(activeRng) : Math.random();
}

export function withDeterministicRng(state, operation) {
  var previous;
  var result;
  if (activeRng) {
    throw new Error("Un'esecuzione RNG deterministica è già attiva.");
  }
  previous = activeRng;
  activeRng = restoreRngState(state);
  try {
    result = operation();
    if (result && typeof result.then === "function") {
      throw new Error("L'esecuzione RNG deterministica deve essere sincrona.");
    }
    return { result: result, rngState: restoreRngState(activeRng) };
  } finally {
    activeRng = previous;
  }
}
