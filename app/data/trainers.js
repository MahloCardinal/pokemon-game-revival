export var TRAINER_SPRITES = [
  { index: 1, file: "avicoltore.webp", gender: "m" },
  { index: 2, file: "bellezza.webp", gender: "f" },
  { index: 3, file: "bimba.webp", gender: "f" },
  { index: 4, file: "bimbo.webp", gender: "m" },
  { index: 5, file: "brandifuoco.webp", gender: "m" },
  { index: 6, file: "chitarrista.webp", gender: "m" },
  { index: 7, file: "cinturanera.webp", gender: "m" },
  { index: 8, file: "domadraghi.webp", gender: "m" },
  { index: 9, file: "fantallenatore.webp", gender: "m" },
  { index: 10, file: "fantallenatrice.webp", gender: "f" },
  { index: 11, file: "fantallenatore_v2.webp", gender: "m" },
  { index: 12, file: "fantallenatrice_v2.webp", gender: "f" },
  { index: 13, file: "gentiluomo.webp", gender: "m" },
  { index: 14, file: "lady.webp", gender: "f" },
  { index: 15, file: "marinaio.webp", gender: "m" },
  { index: 16, file: "pokefanatico.webp", gender: "m" },
  { index: 17, file: "pupa.webp", gender: "f" },
  { index: 18, file: "ranger_f.webp", gender: "f" },
  { index: 19, file: "ranger_m.webp", gender: "m" },
  { index: 20, file: "scienziata.webp", gender: "f" },
  { index: 21, file: "sensitivo.webp", gender: "m" },
  { index: 22, file: "specialista_f.webp", gender: "f" },
  { index: 23, file: "specialista_m.webp", gender: "m" },
  { index: 24, file: "elegantone.webp", gender: "m" },
  { index: 25, file: "domestica.webp", gender: "f" },
  { index: 26, file: "ciambellino.webp", gender: "m" },
  { index: 27, file: "ciambellina.webp", gender: "f" },
  { index: 28, file: "madame.webp", gender: "f" },
  { index: 29, file: "pupa_2.webp", gender: "f" },
  { index: 30, file: "profumina.webp", gender: "f" },
  { index: 31, file: "pescatrice_di_perle.webp", gender: "f" },
  { index: 32, file: "ombrellina.webp", gender: "f" },
  { index: 33, file: "ninja.webp", gender: "m" },
  { index: 34, file: "campeggiatore.webp", gender: "m" },
  { index: 35, file: "campeggiatrice.webp", gender: "f" },
  { index: 36, file: "giardiniere.webp", gender: "m" },
  { index: 37, file: "giramondo.webp", gender: "m" },
  { index: 38, file: "ragazza_delle_fiabe.webp", gender: "f" }
];

export var TRAINER_NAME_POOLS = {
  m: [
    "Alberto", "Andrea", "Arturo", "Bruno", "Carlo", "Claudio", "Dario", "Diego", "Elia", "Emilio",
    "Fabio", "Federico", "Gabriele", "Giulio", "Ivan", "Jacopo", "Lorenzo", "Luca", "Marco", "Matteo",
    "Nico", "Nicola", "Oscar", "Paolo", "Pietro", "Riccardo", "Roberto", "Samuele", "Stefano", "Tiziano",
    "Tommaso", "Umberto", "Valerio", "Vittorio", "Walter", "Yuri", "Adriano", "Benedetto", "Cristiano", "Daniele",
    "Edoardo", "Filippo", "Giacomo", "Leonardo", "Massimo", "Michele", "Raffaele", "Simone", "Vincenzo", "Zeno"
  ],
  f: [
    "Alessia", "Arianna", "Beatrice", "Bianca", "Chiara", "Claudia", "Diana", "Elena", "Eleonora", "Federica",
    "Francesca", "Gaia", "Giulia", "Ilaria", "Irene", "Laura", "Letizia", "Martina", "Marta", "Noemi",
    "Nadia", "Olivia", "Paola", "Rebecca", "Rachele", "Sara", "Silvia", "Teresa", "Valentina", "Viola",
    "Zoe", "Adriana", "Benedetta", "Camilla", "Daniela", "Elisa", "Fabiola", "Greta", "Livia", "Marina",
    "Monica", "Nicole", "Ornella", "Patrizia", "Rossella", "Serena", "Tamara", "Veronica", "Vittoria", "Ylenia"
  ]
};

export function isTrainerIndex(index) {
  var normalizedIndex = Number(index);
  return TRAINER_SPRITES.some(function (trainer) {
    return trainer.index === normalizedIndex;
  });
}

export function trainerSpriteByIndex(index) {
  var normalizedIndex = Number(index);
  var trainer = TRAINER_SPRITES.find(function (entry) {
    return entry.index === normalizedIndex;
  });
  return trainer ? trainer.file : (TRAINER_SPRITES[0] ? TRAINER_SPRITES[0].file : "");
}

export function defaultTrainerIndex() {
  return TRAINER_SPRITES.length ? TRAINER_SPRITES[0].index : 0;
}
