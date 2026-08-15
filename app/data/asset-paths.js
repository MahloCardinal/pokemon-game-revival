// Presentation assets are listed explicitly. Display labels and locale data must
// never be used to derive a file name.

export var CAPTURE_ZONE_ASSET_PATHS = Object.freeze({
  viridian_forest: Object.freeze({
    card: "/assets/img_zone/bosco_smeraldo_bottone.webp",
    presentationKey: "capture.viridian_forest",
    presentation: "/assets/img_zone/bosco_smeraldo_presentazione.webp",
    background: Object.freeze({
      desktop: "/assets/img_zone/bosco_smeraldo_desktop.webp",
      mobile: "/assets/img_zone/bosco_smeraldo_mobile.webp"
    })
  }),
  mt_moon: Object.freeze({
    card: "/assets/img_zone/monte_luna_bottone.webp",
    presentationKey: "capture.mt_moon",
    presentation: "/assets/img_zone/monte_luna_presentazione.webp",
    background: Object.freeze({
      desktop: "/assets/img_zone/monte_luna_desktop.webp",
      mobile: "/assets/img_zone/monte_luna_mobile.webp"
    })
  }),
  sea: Object.freeze({
    card: "/assets/img_zone/mare_bottone.webp",
    presentationKey: "capture.sea",
    presentation: "/assets/img_zone/mare_presentazione.webp",
    background: Object.freeze({
      desktop: "/assets/img_zone/mare_desktop.webp",
      mobile: "/assets/img_zone/mare_mobile.webp"
    })
  }),
  ghost_tower: Object.freeze({
    card: "/assets/img_zone/torre_fantasma_bottone.webp",
    presentationKey: "capture.ghost_tower",
    presentation: "/assets/img_zone/torre_fantasma_presentazione.webp",
    background: Object.freeze({
      desktop: "/assets/img_zone/torre_fantasma_desktop.webp",
      mobile: "/assets/img_zone/torre_fantasma_mobile.webp"
    })
  }),
  safari_zone: Object.freeze({
    card: "/assets/img_zone/safari_bottone.webp",
    presentationKey: "capture.safari_zone",
    presentation: "/assets/img_zone/safari_presentazione.webp",
    background: Object.freeze({
      desktop: "/assets/img_zone/safari_desktop.webp",
      mobile: "/assets/img_zone/safari_mobile.webp"
    })
  }),
  swamp: Object.freeze({
    card: "/assets/img_zone/palude_bottone.webp",
    presentationKey: "capture.swamp",
    presentation: "/assets/img_zone/palude_presentazione.webp",
    background: Object.freeze({
      desktop: "/assets/img_zone/palude_desktop.webp",
      mobile: "/assets/img_zone/palude_mobile.webp"
    })
  }),
  desert: Object.freeze({
    card: "/assets/img_zone/deserto_bottone.webp",
    presentationKey: "capture.desert",
    presentation: "/assets/img_zone/deserto_presentazione.webp",
    background: Object.freeze({
      desktop: "/assets/img_zone/deserto_desktop.webp",
      mobile: "/assets/img_zone/deserto_mobile.webp"
    })
  })
});

export var SCENE_PRESENTATION_ASSET_PATHS = Object.freeze({
  start: "/assets/img_zone/start_presentazione.webp",
  pokemon_center: "/assets/img_zone/centro_pokemon_presentazione.webp",
  shopping_center: "/assets/img_zone/centro_commerciale_presentazione.webp",
  daycare: "/assets/img_zone/pensione_presentazione.webp",
  garden: "/assets/img_zone/giardino_presentazione.webp",
  pokefan_club: "/assets/img_zone/club_pokefan_presentazione.webp",
  battle_tower: "/assets/img_zone/torre_lotta_presentazione.webp",
  training_zone: "/assets/img_zone/zona_allenamento_presentazione.webp",
  battle_shop: "/assets/img_zone/negozio_lotta_presentazione.webp",
  elite_four: "/assets/img_zone/start_presentazione.webp"
});

export function captureZoneAssetPaths(zoneKey) {
  return CAPTURE_ZONE_ASSET_PATHS[String(zoneKey || "")] || null;
}

export function captureZonePresentationKey(zoneKey) {
  var assets = captureZoneAssetPaths(zoneKey);
  return assets ? assets.presentationKey : "";
}

export function scenePresentationAssetPath(presentationKey) {
  var key = String(presentationKey || "");
  var directPath = SCENE_PRESENTATION_ASSET_PATHS[key];
  var zoneKey;
  if (directPath) {
    return directPath;
  }
  zoneKey = Object.keys(CAPTURE_ZONE_ASSET_PATHS).find(function(candidate) {
    return CAPTURE_ZONE_ASSET_PATHS[candidate].presentationKey === key;
  });
  return zoneKey ? CAPTURE_ZONE_ASSET_PATHS[zoneKey].presentation : "";
}
