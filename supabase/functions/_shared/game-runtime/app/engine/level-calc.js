import { GDR_DATA as DATA } from "../data/index.js";

import { random } from "./deterministic-rng.js";

export function randInt(min, max) {
  return min + Math.floor(random() * (max - min + 1));
}

export function hpForLevel(level) {
  var tableValue = DATA.hpByLevel[level];
  var maxDelta = 0;
  if (tableValue === undefined) {
    tableValue = DATA.hpByLevel[60];
    if (level > 60) {
      tableValue += (level - 60) * 3;
    }
  }
  if (level >= 35) {
    maxDelta = 4;
  } else if (level >= 15) {
    maxDelta = 2;
  }
  return tableValue - randInt(0, maxDelta);
}

export function powerForLevel(level) {
  var tableValue = DATA.powerByLevel[level];
  var maxDelta = 0;
  if (tableValue === undefined) {
    tableValue = DATA.powerByLevel[60];
    if (level > 60) {
      tableValue += (level - 60) * 2;
    }
  }
  if (level >= 50) {
    maxDelta = 4;
  } else if (level >= 20) {
    maxDelta = 3;
  } else if (level >= 10) {
    maxDelta = 2;
  }
  return tableValue - randInt(0, maxDelta);
}

export function statsForLevel(level) {
  var tableValue = DATA.statsByLevel[level];
  var maxDelta = 0;
  if (tableValue === undefined) {
    tableValue = DATA.statsByLevel[60];
    if (level > 60) {
      tableValue += (level - 60) * 2;
    }
  }
  if (level >= 40) {
    maxDelta = 2;
  }
  return tableValue - randInt(0, maxDelta);
}
