import { getInventoryItemByIndex, occhialoni, spettrosonda } from "./items.js";

var ZONE_ACCESS_REQUIREMENTS = {
  "Torre Fantasma": {
    item: spettrosonda,
    message: "Ti serve la Spettrosonda!"
  },
  Deserto: {
    item: occhialoni,
    message: "Ti servono gli Occhialoni!"
  }
};

export function zoneAccessRequirement(zoneName) {
  return ZONE_ACCESS_REQUIREMENTS[zoneName] || null;
}

export function playerCanAccessZone(inventory, zoneName) {
  var requirement = zoneAccessRequirement(zoneName);
  if (!requirement) {
    return true;
  }
  return Boolean(getInventoryItemByIndex(inventory, requirement.item.index));
}
