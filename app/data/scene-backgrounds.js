export var BACKGROUND_ASSETS = Object.freeze({
  home: Object.freeze({ desktop: "home_desktop.webp", mobile: "home_mobile.webp" }),
  "battle-area": Object.freeze({ desktop: "area_lotta_desktop.webp", mobile: "area_lotta_mobile.webp" }),
  "battle-tower": Object.freeze({ desktop: "torre_lotta_desktop.webp", mobile: "torre_lotta_mobile.webp" }),
  "battle-shop": Object.freeze({ desktop: "negozio_lotta_desktop.webp", mobile: "negozio_lotta_mobile.webp" }),
  zones: Object.freeze({ desktop: "zone_cattura_desktop.webp", mobile: "zone_cattura_mobile.webp" }),
  city: Object.freeze({ desktop: "citta_desktop.webp", mobile: "citta_mobile.webp" }),
  "pokemon-center": Object.freeze({ desktop: "centro_pokemon_desktop.webp", mobile: "centro_pokemon_mobile.webp" }),
  "shopping-center": Object.freeze({ desktop: "centro_commerciale_desktop.webp", mobile: "centro_commerciale_mobile.webp" }),
  "training-zone": Object.freeze({ desktop: "zona_allenamento_desktop.webp", mobile: "zona_allenamento_mobile.webp" }),
  "city-daycare": Object.freeze({ desktop: "pensione_desktop.webp", mobile: "pensione_mobile.webp" }),
  "city-garden": Object.freeze({ desktop: "giardino_desktop.webp", mobile: "giardino_mobile.webp" }),
  rules: Object.freeze({ desktop: "regolamento_desktop.webp", mobile: "regolamento_mobile.webp" }),
  "city-fanclub": Object.freeze({ desktop: "club_pokefan_desktop.webp", mobile: "club_pokefan_mobile.webp" }),
  team: Object.freeze({ desktop: "scheda_desktop.webp", mobile: "scheda_mobile.webp" }),
  box: Object.freeze({ desktop: "box_desktop.webp", mobile: "box_mobile.webp" }),
  gyms: Object.freeze({ desktop: "lega_kanto_desktop.webp", mobile: "lega_kanto_mobile.webp" }),
  "capture:viridian_forest": Object.freeze({ desktop: "bosco_smeraldo_desktop.webp", mobile: "bosco_smeraldo_mobile.webp" }),
  "capture:mt_moon": Object.freeze({ desktop: "monte_luna_desktop.webp", mobile: "monte_luna_mobile.webp" }),
  "capture:sea": Object.freeze({ desktop: "mare_desktop.webp", mobile: "mare_mobile.webp" }),
  "capture:ghost_tower": Object.freeze({ desktop: "torre_fantasma_desktop.webp", mobile: "torre_fantasma_mobile.webp" }),
  "capture:safari_zone": Object.freeze({ desktop: "safari_desktop.webp", mobile: "safari_mobile.webp" }),
  "capture:swamp": Object.freeze({ desktop: "palude_desktop.webp", mobile: "palude_mobile.webp" }),
  "capture:desert": Object.freeze({ desktop: "deserto_desktop.webp", mobile: "deserto_mobile.webp" }),
  "gym:pewter_city": Object.freeze({ desktop: "plumbeopoli_desktop.webp", mobile: "plumbeopoli_mobile.webp" }),
  "gym:cerulean_city": Object.freeze({ desktop: "celestopoli_desktop.webp", mobile: "celestopoli_mobile.webp" }),
  "gym:vermilion_city": Object.freeze({ desktop: "aranciopoli_desktop.webp", mobile: "aranciopoli_mobile.webp" }),
  "gym:celadon_city": Object.freeze({ desktop: "azzurropoli_desktop.webp", mobile: "azzurropoli_mobile.webp" }),
  "gym:saffron_city": Object.freeze({ desktop: "zafferanopoli_desktop.webp", mobile: "zafferanopoli_mobile.webp" }),
  "gym:fuchsia_city": Object.freeze({ desktop: "fucsiapoli_desktop.webp", mobile: "fucsiapoli_mobile.webp" }),
  "gym:cinnabar_island": Object.freeze({ desktop: "isola_cannella_desktop.webp", mobile: "isola_cannella_mobile.webp" }),
  "gym:viridian_city": Object.freeze({ desktop: "smeraldopoli_desktop.webp", mobile: "smeraldopoli_mobile.webp" }),
  "gym:elite_four": Object.freeze({ desktop: "superquattro_desktop.webp", mobile: "superquattro_mobile.webp" }),
  "gym:kanto_champion": Object.freeze({ desktop: "campione_desktop.webp", mobile: "campione_mobile.webp" })
});

function captureBackgroundKey(zoneName) {
  return zoneName ? "capture:" + String(zoneName) : "capture";
}

function gymBackgroundKey(cityKey) {
  return cityKey ? "gym:" + String(cityKey) : "gym";
}

export function backgroundAssetForKey(key) {
  return BACKGROUND_ASSETS[String(key || "")] || null;
}

export function backgroundKeyForScene(scene) {
  var name = String(scene && scene.name || "");
  var captureScene;
  var gymScene;
  if (name === "capture") {
    return captureBackgroundKey(scene.zoneName);
  }
  if (name === "gym-city") {
    return gymBackgroundKey(scene.cityKey);
  }
  if (name === "battle" || name === "battle-restore" || name === "admin-battle" || name === "admin-battle-restore") {
    captureScene = scene && scene.captureScene;
    gymScene = scene && scene.gymScene;
    if (captureScene && captureScene.zoneName) {
      return captureBackgroundKey(captureScene.zoneName);
    }
    if (gymScene && gymScene.cityKey) {
      return gymBackgroundKey(gymScene.cityKey);
    }
    if (scene && (scene.trainingBattle || scene.trainingScene)) {
      return "training-zone";
    }
    if (scene && scene.battleTower) {
      return "battle-tower";
    }
    return "battle";
  }
  if (name === "admin-home" || name === "admin-battles") {
    return "";
  }
  return backgroundAssetForKey(name) ? name : "";
}
