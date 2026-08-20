import { getInventoryItemByIndex, go_goggles, silph_scope } from "./items.js";

var ZONE_ACCESS_REQUIREMENTS = {
  ghost_tower: {
    item: silph_scope
  },
  desert: {
    item: go_goggles
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
