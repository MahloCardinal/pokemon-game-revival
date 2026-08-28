// Presentation assets are listed explicitly. Display labels and locale data must
// never be used to derive a file name.

export var TYPE_ASSET_PATHS = Object.freeze({
  normal: "/app/assets/img_type/normale.webp",
  fire: "/app/assets/img_type/fuoco.webp",
  water: "/app/assets/img_type/acqua.webp",
  electric: "/app/assets/img_type/elettro.webp",
  grass: "/app/assets/img_type/erba.webp",
  ice: "/app/assets/img_type/ghiaccio.webp",
  fighting: "/app/assets/img_type/lotta.webp",
  poison: "/app/assets/img_type/veleno.webp",
  ground: "/app/assets/img_type/terra.webp",
  flying: "/app/assets/img_type/volante.webp",
  psychic: "/app/assets/img_type/psico.webp",
  bug: "/app/assets/img_type/coleottero.webp",
  rock: "/app/assets/img_type/roccia.webp",
  ghost: "/app/assets/img_type/spettro.webp",
  dragon: "/app/assets/img_type/drago.webp",
  dark: "/app/assets/img_type/buio.webp",
  steel: "/app/assets/img_type/acciaio.webp",
  fairy: "/app/assets/img_type/folletto.webp"
});

export var CAPTURE_ZONE_ASSET_PATHS = Object.freeze({
  viridian_forest: Object.freeze({
    card: "/app/assets/img_zone/bosco_smeraldo_bottone.webp",
    presentation: "/app/assets/img_zone/bosco_smeraldo_presentazione.webp",
    background: Object.freeze({
      desktop: "/app/assets/img_zone/bosco_smeraldo_desktop.webp",
      mobile: "/app/assets/img_zone/bosco_smeraldo_mobile.webp"
    })
  }),
  mt_moon: Object.freeze({
    card: "/app/assets/img_zone/monte_luna_bottone.webp",
    presentation: "/app/assets/img_zone/monte_luna_presentazione.webp",
    background: Object.freeze({
      desktop: "/app/assets/img_zone/monte_luna_desktop.webp",
      mobile: "/app/assets/img_zone/monte_luna_mobile.webp"
    })
  }),
  sea: Object.freeze({
    card: "/app/assets/img_zone/mare_bottone.webp",
    presentation: "/app/assets/img_zone/mare_presentazione.webp",
    background: Object.freeze({
      desktop: "/app/assets/img_zone/mare_desktop.webp",
      mobile: "/app/assets/img_zone/mare_mobile.webp"
    })
  }),
  ghost_tower: Object.freeze({
    card: "/app/assets/img_zone/torre_fantasma_bottone.webp",
    presentation: "/app/assets/img_zone/torre_fantasma_presentazione.webp",
    background: Object.freeze({
      desktop: "/app/assets/img_zone/torre_fantasma_desktop.webp",
      mobile: "/app/assets/img_zone/torre_fantasma_mobile.webp"
    })
  }),
  safari_zone: Object.freeze({
    card: "/app/assets/img_zone/safari_bottone.webp",
    presentation: "/app/assets/img_zone/safari_presentazione.webp",
    background: Object.freeze({
      desktop: "/app/assets/img_zone/safari_desktop.webp",
      mobile: "/app/assets/img_zone/safari_mobile.webp"
    })
  }),
  swamp: Object.freeze({
    card: "/app/assets/img_zone/palude_bottone.webp",
    presentation: "/app/assets/img_zone/palude_presentazione.webp",
    background: Object.freeze({
      desktop: "/app/assets/img_zone/palude_desktop.webp",
      mobile: "/app/assets/img_zone/palude_mobile.webp"
    })
  }),
  desert: Object.freeze({
    card: "/app/assets/img_zone/deserto_bottone.webp",
    presentation: "/app/assets/img_zone/deserto_presentazione.webp",
    background: Object.freeze({
      desktop: "/app/assets/img_zone/deserto_desktop.webp",
      mobile: "/app/assets/img_zone/deserto_mobile.webp"
    })
  })
});

export var SCENE_PRESENTATION_ASSET_PATHS = Object.freeze({
  start: "/app/assets/img_zone/start_presentazione.webp",
  pokemon_center: "/app/assets/img_zone/centro_pokemon_presentazione.webp",
  shopping_center: "/app/assets/img_zone/centro_commerciale_presentazione.webp",
  daycare: "/app/assets/img_zone/pensione_presentazione.webp",
  garden: "/app/assets/img_zone/giardino_presentazione.webp",
  pokefan_club: "/app/assets/img_zone/club_pokefan_presentazione.webp",
  battle_tower: "/app/assets/img_zone/torre_lotta_presentazione.webp",
  training_zone: "/app/assets/img_zone/zona_allenamento_presentazione.webp",
  battle_shop: "/app/assets/img_zone/negozio_lotta_presentazione.webp",
  elite_four: "/app/assets/img_zone/start_presentazione.webp"
});

export function captureZoneAssetPaths(zoneKey) {
  return CAPTURE_ZONE_ASSET_PATHS[String(zoneKey || "")] || null;
}

export function scenePresentationAssetPath(presentationKey) {
  var key = String(presentationKey || "");
  var directPath = SCENE_PRESENTATION_ASSET_PATHS[key];
  if (directPath) {
    return directPath;
  }
  if (key.indexOf("capture.") === 0) {
    var zoneAssets = captureZoneAssetPaths(key.slice("capture.".length));
    return zoneAssets ? zoneAssets.presentation : "";
  }
  return "";
}
