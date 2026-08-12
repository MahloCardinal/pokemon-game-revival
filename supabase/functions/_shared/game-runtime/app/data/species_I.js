import * as m from "./moves.js";
import * as i from "./items.js";

export var SPECIES_LIBRARY = {
  "1": {
    name: "Bulbasaur",
    dexNumber: 1,
    type: ["Erba", "Veleno"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 21
    },
    exp: 50,
    movesByLevel: {
      5: [m.Azione, m.Ruggito],
      7: [m.Parassiseme],
      10: [m.Frustata],
      15: [m.Velenpolvere, m.Sonnifero],
      20: [m.Foglielama],
      25: [m.Profumino],
      32: [m.Crescita],
      39: [m.Sintesi],
      46: [m.Solarraggio]
    },
    movesByMT: [
      m.Taglio, m.Forza, m.Solarraggio, m.Tossina, m.Doppioteam,
      m.Flash, m.Riposo, m.Protezione, m.Fangobomba, m.Gigassorbimento,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Introforza, m.Giornodisole,
      m.Spaccaroccia, m.Facciata, m.Forzasegreta, m.Semitraglia, m.Petalodanza,
      m.Schermoluce, m.Capocciata, m.Maledizione, m.Fascino, m.Salvaguardia,
      m.Meloderba, m.Fogliamagica, m.Danzaspada, m.Corposcontro, m.Sdoppiatore,
      m.Mimica, m.Ricciolscudo, m.Sostituto, m.Russare, m.Fangosberla,
      m.Resistenza, m.Bullo, m.Tagliofuria, m.Sonnolalia
    ],
    evolution: {stage: "base", to: [{species: "2", trigger: {kind: "level", level: 16}}]}
  },
  "2": {
    name: "Ivysaur",
    dexNumber: 2,
    type: ["Erba", "Veleno"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 16,
      maxLevel: 42
    },
    exp: 100,
    movesByLevel: {
      5: [m.Azione, m.Ruggito, m.Parassiseme],
      10: [m.Frustata],
      15: [m.Sonnifero, m.Velenpolvere],
      22: [m.Foglielama],
      29: [m.Profumino],
      38: [m.Crescita],
      47: [m.Sintesi],
      56: [m.Solarraggio]
    },
    movesByMT: [
      m.Taglio, m.Forza, m.Solarraggio, m.Tossina, m.Doppioteam,
      m.Flash, m.Riposo, m.Protezione, m.Fangobomba, m.Gigassorbimento,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Introforza, m.Giornodisole,
      m.Spaccaroccia, m.Facciata, m.Forzasegreta, m.Semitraglia, m.Petalodanza,
      m.Schermoluce, m.Capocciata, m.Maledizione, m.Fascino, m.Salvaguardia,
      m.Meloderba, m.Fogliamagica, m.Danzaspada, m.Corposcontro, m.Sdoppiatore,
      m.Mimica, m.Ricciolscudo, m.Sostituto, m.Russare, m.Fangosberla,
      m.Resistenza, m.Bullo, m.Tagliofuria, m.Sonnolalia
    ],
    evolution: {stage: "stage1", to: [{species: "3", trigger: {kind: "level", level: 32}}]}
  },
  "3": {
    name: "Venusaur",
    dexNumber: 3,
    type: ["Erba", "Veleno"],
    gender: ["Maschio", "Femmina"],
    spriteGendered: true,
    encounter: {
      rarity: "r",
      minLevel: 32,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.Azione, m.Ruggito, m.Parassiseme, m.Frustata],
      15: [m.Sonnifero, m.Velenpolvere],
      22: [m.Foglielama],
      29: [m.Profumino],
      41: [m.Crescita],
      53: [m.Sintesi],
      65: [m.Solarraggio]
    },
    movesByMT: [
      m.Taglio, m.Boato, m.IperRaggio, m.Forza, m.Solarraggio,
      m.Terremoto, m.Tossina, m.Doppioteam, m.Flash, m.Riposo,
      m.Protezione, m.Fangobomba, m.Gigassorbimento, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Introforza, m.Giornodisole, m.Spaccaroccia, m.Facciata,
      m.Forzasegreta, m.Semitraglia, m.Petalodanza, m.Schermoluce, m.Capocciata,
      m.Maledizione, m.Fascino, m.Salvaguardia, m.Meloderba, m.Fogliamagica,
      m.Danzaspada, m.Corposcontro, m.Sdoppiatore, m.Mimica, m.Ricciolscudo,
      m.Sostituto, m.Russare, m.Fangosberla, m.Resistenza, m.Bullo,
      m.Tagliofuria, m.Sonnolalia, m.Radicalbero
    ],
    evolution: {stage: "stage2", to: []}
  },
  "4": {
    name: "Charmander",
    dexNumber: 4,
    type: ["Fuoco"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 21
    },
    exp: 50,
    movesByLevel: {
      5: [m.Graffio, m.Ruggito],
      7: [m.Braciere],
      13: [m.Ferrartigli],
      19: [m.MurodiFumo],
      25: [m.Visotruce],
      31: [m.Lanciafiamme],
      37: [m.Lacerazione],
      43: [m.IradiDrago],
      49: [m.Turbofuoco]
    },
    movesByMT: [
      m.Taglio, m.Lanciafiamme, m.Forza, m.Fossa, m.Tossina,
      m.Doppioteam, m.Fuocobomba, m.Riposo, m.Protezione, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Codacciaio, m.Introforza, m.Giornodisole,
      m.Spaccaroccia, m.Facciata, m.Centripugno, m.Breccia, m.Forzasegreta,
      m.Vampata, m.Aeroassalto, m.Dragartigli, m.Danzaspada, m.Morso,
      m.Frana, m.Panciamburo, m.Oltraggio, m.Forzantica, m.Picchiaduro,
      m.Dragodanza, m.Megapugno, m.Fuocopugno, m.Megacalcio, m.Corposcontro,
      m.Sdoppiatore, m.Contrattacco, m.MovimentoSismico, m.Mimica, m.Ricciolscudo,
      m.Comete, m.Sostituto, m.Russare, m.Fangosberla, m.Resistenza,
      m.Bullo, m.Tagliofuria, m.Sonnolalia, m.Dinamipugno, m.Sgranocchio,
      m.Ferrartigli
    ],
    evolution: {stage: "base", to: [{species: "5", trigger: {kind: "level", level: 16}}]}
  },
  "5": {
    name: "Charmeleon",
    dexNumber: 5,
    type: ["Fuoco"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 16,
      maxLevel: 46
    },
    exp: 100,
    movesByLevel: {
      5: [m.Graffio, m.Ruggito, m.Braciere],
      13: [m.Ferrartigli],
      20: [m.MurodiFumo],
      27: [m.Visotruce],
      34: [m.Lanciafiamme],
      41: [m.Lacerazione],
      48: [m.IradiDrago],
      55: [m.Turbofuoco]
    },
    movesByMT: [
      m.Taglio, m.Lanciafiamme, m.Forza, m.Fossa, m.Tossina,
      m.Doppioteam, m.Fuocobomba, m.Riposo, m.Protezione, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Codacciaio, m.Introforza, m.Giornodisole,
      m.Spaccaroccia, m.Facciata, m.Centripugno, m.Breccia, m.Forzasegreta,
      m.Vampata, m.Aeroassalto, m.Dragartigli, m.Danzaspada, m.Morso,
      m.Frana, m.Panciamburo, m.Oltraggio, m.Forzantica, m.Picchiaduro,
      m.Dragodanza, m.Megapugno, m.Fuocopugno, m.Megacalcio, m.Corposcontro,
      m.Sdoppiatore, m.Contrattacco, m.MovimentoSismico, m.Mimica, m.Ricciolscudo,
      m.Comete, m.Sostituto, m.Russare, m.Fangosberla, m.Resistenza,
      m.Bullo, m.Tagliofuria, m.Sonnolalia, m.Dinamipugno, m.Sgranocchio,
      m.Ferrartigli
    ],
    evolution: {stage: "stage1", to: [{species: "6", trigger: {kind: "level", level: 36}}]}
  },
  "6": {
    name: "Charizard",
    dexNumber: 6,
    type: ["Fuoco", "Volante"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 36,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.Ondacalda, m.Graffio, m.Ruggito, m.Braciere, m.Ferrartigli],
      20: [m.MurodiFumo],
      27: [m.Visotruce],
      34: [m.Lanciafiamme],
      36: [m.AttaccodAla],
      44: [m.Lacerazione],
      54: [m.IradiDrago],
      64: [m.Turbofuoco]
    },
    movesByMT: [
      m.Taglio, m.Volo, m.Boato, m.Lanciafiamme, m.IperRaggio,
      m.Forza, m.Terremoto, m.Fossa, m.Tossina, m.Doppioteam,
      m.Fuocobomba, m.Riposo, m.Protezione, m.Alacciaio, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Codacciaio, m.Introforza, m.Giornodisole,
      m.Spaccaroccia, m.Facciata, m.Centripugno, m.Breccia, m.Forzasegreta,
      m.Vampata, m.Aeroassalto, m.Dragartigli, m.Danzaspada, m.Morso,
      m.Frana, m.Panciamburo, m.Oltraggio, m.Forzantica, m.Picchiaduro,
      m.Dragodanza, m.Megapugno, m.Fuocopugno, m.Megacalcio, m.Corposcontro,
      m.Sdoppiatore, m.Contrattacco, m.MovimentoSismico, m.Mimica, m.Ricciolscudo,
      m.Comete, m.Sostituto, m.Russare, m.Fangosberla, m.Resistenza,
      m.Bullo, m.Tagliofuria, m.Sonnolalia, m.Dinamipugno, m.Sgranocchio,
      m.Ferrartigli, m.Incendio
    ],
    evolution: {stage: "stage2", to: []}
  },
  "7": {
    name: "Squirtle",
    dexNumber: 7,
    type: ["Acqua"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 21
    },
    exp: 50,
    movesByLevel: {
      5: [m.Azione, m.Colpocoda],
      7: [m.Bolla],
      10: [m.Ritirata],
      13: [m.Pistolacqua],
      18: [m.Morso],
      23: [m.Rapigiro],
      28: [m.Protezione],
      33: [m.Pioggiadanza],
      40: [m.Capocciata],
      47: [m.Idropompa]
    },
    movesByMT: [
      m.Surf, m.Geloraggio, m.Bora, m.Forza, m.Fossa,
      m.Tossina, m.Doppioteam, m.Cascata, m.Riposo, m.Protezione,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Codacciaio, m.Introforza,
      m.Pioggiadanza, m.Spaccaroccia, m.Grandine, m.Facciata, m.Centripugno,
      m.Breccia, m.Forzasegreta, m.Sub, m.Idropulsar, m.Nebbia,
      m.Nube, m.Flagello, m.Preveggenza, m.Specchiovelo, m.Sbadiglio,
      m.Rinfrescata, m.Fangata, m.Megapugno, m.Gelopugno, m.Megacalcio,
      m.Corposcontro, m.Sdoppiatore, m.Contrattacco, m.MovimentoSismico, m.Mimica,
      m.Ricciolscudo, m.Sostituto, m.Russare, m.Fangosberla, m.Ventogelato,
      m.Resistenza, m.Rotolamento, m.Bullo, m.Sonnolalia, m.Dinamipugno
    ],
    evolution: {stage: "base", to: [{species: "8", trigger: {kind: "level", level: 16}}]}
  },
  "8": {
    name: "Wartortle",
    dexNumber: 8,
    type: ["Acqua"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 16,
      maxLevel: 46
    },
    exp: 100,
    movesByLevel: {
      5: [m.Azione, m.Colpocoda, m.Bolla],
      10: [m.Ritirata],
      13: [m.Pistolacqua],
      19: [m.Morso],
      25: [m.Rapigiro],
      31: [m.Protezione],
      37: [m.Pioggiadanza],
      45: [m.Capocciata],
      53: [m.Idropompa]
    },
    movesByMT: [
      m.Surf, m.Geloraggio, m.Bora, m.Forza, m.Fossa,
      m.Tossina, m.Doppioteam, m.Cascata, m.Riposo, m.Protezione,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Codacciaio, m.Introforza,
      m.Pioggiadanza, m.Spaccaroccia, m.Grandine, m.Facciata, m.Centripugno,
      m.Breccia, m.Forzasegreta, m.Sub, m.Idropulsar, m.Nebbia,
      m.Nube, m.Flagello, m.Preveggenza, m.Specchiovelo, m.Sbadiglio,
      m.Rinfrescata, m.Fangata, m.Megapugno, m.Gelopugno, m.Megacalcio,
      m.Corposcontro, m.Sdoppiatore, m.Contrattacco, m.MovimentoSismico, m.Mimica,
      m.Ricciolscudo, m.Sostituto, m.Russare, m.Fangosberla, m.Ventogelato,
      m.Resistenza, m.Rotolamento, m.Bullo, m.Sonnolalia, m.Dinamipugno
    ],
    evolution: {stage: "stage1", to: [{species: "9", trigger: {kind: "level", level: 36}}]}
  },
  "9": {
    name: "Blastoise",
    dexNumber: 9,
    type: ["Acqua"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 36,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.Azione, m.Colpocoda, m.Bolla, m.Ritirata],
      13: [m.Pistolacqua],
      19: [m.Morso],
      25: [m.Rapigiro],
      31: [m.Protezione],
      42: [m.Pioggiadanza],
      55: [m.Capocciata],
      68: [m.Idropompa]
    },
    movesByMT: [
      m.Boato, m.Surf, m.Geloraggio, m.Bora, m.IperRaggio,
      m.Forza, m.Terremoto, m.Fossa, m.Tossina, m.Doppioteam,
      m.Cascata, m.Riposo, m.Protezione, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Codacciaio, m.Introforza, m.Pioggiadanza, m.Spaccaroccia,
      m.Grandine, m.Facciata, m.Centripugno, m.Breccia, m.Forzasegreta,
      m.Sub, m.Idropulsar, m.Nebbia, m.Nube, m.Flagello,
      m.Preveggenza, m.Specchiovelo, m.Sbadiglio, m.Rinfrescata, m.Fangata,
      m.Megapugno, m.Gelopugno, m.Megacalcio, m.Corposcontro, m.Sdoppiatore,
      m.Contrattacco, m.MovimentoSismico, m.Mimica, m.Ricciolscudo, m.Sostituto,
      m.Russare, m.Fangosberla, m.Ventogelato, m.Resistenza, m.Rotolamento,
      m.Bullo, m.Sonnolalia, m.Dinamipugno, m.Idrocannone
    ],
    evolution: {stage: "stage2", to: []}
  },
  "10": {
    name: "Caterpie",
    dexNumber: 10,
    type: ["Coleottero"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 10
    },
    exp: 50,
    movesByLevel: {
      5: [m.Azione, m.Millebave]
    },
    movesByMT: [],
    evolution: {
      stage: "base",
      to: [
        { species: "11", trigger: { kind: "level", level: 7 } }
      ]
    }
  },
  "11": {
    name: "Metapod",
    dexNumber: 11,
    type: ["Coleottero"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 7,
      maxLevel: 15
    },
    exp: 100,
    movesByLevel: {
      5: [m.Azione, m.Rafforzatore, m.Millebave]
    },
    movesByMT: [],
    evolution: {
      stage: "stage1",
      to: [
        { species: "12", trigger: { kind: "level", level: 10 } }
      ]
    }
  },
  "12": {
    name: "Butterfree",
    dexNumber: 12,
    type: ["Coleottero", "Volante"],
    gender: ["Maschio", "Femmina"],
    spriteGendered: true,
    encounter: {
      rarity: "u",
      minLevel: 10,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.Confusione],
      13: [m.Velenpolvere],
      14: [m.Paralizzante],
      15: [m.Sonnifero],
      18: [m.Supersuono],
      23: [m.Turbine],
      28: [m.Raffica],
      34: [m.Psicoraggio],
      40: [m.Salvaguardia],
      47: [m.Ventargenteo]
    },
    movesByMT: [
      m.IperRaggio, m.Solarraggio, m.Tossina, m.Psichico, m.Doppioteam,
      m.Flash, m.Riposo, m.Furto, m.Protezione, m.Gigassorbimento,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Salvaguardia, m.Introforza,
      m.Pioggiadanza, m.Giornodisole, m.PallaOmbra, m.Facciata, m.Forzasegreta,
      m.Aeroassalto, m.Sdoppiatore, m.Mimica, m.Comete, m.Mangiasogni,
      m.Sostituto, m.Incubo, m.Russare, m.Resistenza, m.Bullo,
      m.Sonnolalia, m.Sonnifero, m.Mattindoro
    ],
    evolution: {
      stage: "stage2",
      to: []
    }
  },
  "13": {
    name: "Weedle",
    dexNumber: 13,
    type: ["Coleottero", "Veleno"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 10
    },
    exp: 50,
    movesByLevel: {
      5: [m.Velenospina, m.Millebave]
    },
    movesByMT: [],
    evolution: {
      stage: "base",
      to: [
        { species: "14", trigger: { kind: "level", level: 7 } }
      ]
    }
  },
  "14": {
    name: "Kakuna",
    dexNumber: 14,
    type: ["Coleottero", "Veleno"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 7,
      maxLevel: 15
    },
    exp: 100,
    movesByLevel: {
      5: [m.Millebave, m.Rafforzatore, m.Velenospina]
    },
    movesByMT: [],
    evolution: {
      stage: "stage1",
      to: [
        { species: "15", trigger: { kind: "level", level: 10 } }
      ]
    }
  },
  "15": {
    name: "Beedrill",
    dexNumber: 15,
    type: ["Coleottero", "Veleno"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 10,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.Furia, m.Velenospina],
      15: [m.Focalenergia],
      20: [m.DoppioAgo],
      25: [m.Ira],
      30: [m.Inseguimento],
      35: [m.Missilspillo],
      40: [m.Agilita],
      45: [m.Rimonta]
    },
    movesByMT: [
      m.Taglio, m.IperRaggio, m.Solarraggio, m.Tossina, m.Doppioteam,
      m.Riposo, m.Furto, m.Protezione, m.Fangobomba, m.Gigassorbimento,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Introforza, m.Giornodisole,
      m.Spaccaroccia, m.Facciata, m.Breccia, m.Forzasegreta, m.Aeroassalto,
      m.Danzaspada, m.Sdoppiatore, m.Mimica, m.Comete, m.Sostituto,
      m.Russare, m.Resistenza, m.Bullo, m.Tagliofuria, m.Sonnolalia,
      m.DoppioAgo, m.Staffetta
    ],
    evolution: {
      stage: "stage2",
      to: []
    }
  },
  "16": {
    name: "Pidgey",
    dexNumber: 16,
    type: ["Normale", "Volante"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 50
    },
    exp: 50,
    movesByLevel: {
      5: [m.Azione, m.Turbosabbia],
      9: [m.Raffica],
      13: [m.AttaccoRapido],
      19: [m.Turbine],
      25: [m.AttaccodAla],
      31: [m.Danzadipiume],
      39: [m.Agilita],
      47: [m.Speculmossa]
    },
    movesByMT: [
      m.Volo, m.Tossina, m.Doppioteam, m.Riposo, m.Furto,
      m.Protezione, m.Alacciaio, m.Attrazione, m.Ritorno, m.Frustrazione,
      m.Introforza, m.Pioggiadanza, m.Giornodisole, m.Facciata, m.Forzasegreta,
      m.Aeroassalto, m.Finta, m.Preveggenza, m.Inseguimento, m.Aerasoio,
      m.Sdoppiatore, m.Mimica, m.Comete, m.Aeroattacco, m.Sostituto,
      m.Russare, m.Fangosberla, m.Resistenza, m.Bullo, m.Sonnolalia
    ],
    evolution: {
      stage: "base",
      to: [
        { species: "17", trigger: { kind: "level", level: 18 } }
      ]
    }
  },
  "17": {
    name: "Pidgeotto",
    dexNumber: 17,
    type: ["Normale", "Volante"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 50
    },
    exp: 100,
    movesByLevel: {
      5: [m.Azione, m.Turbosabbia, m.Raffica],
      13: [m.AttaccoRapido],
      20: [m.Turbine],
      27: [m.AttaccodAla],
      34: [m.Danzadipiume],
      43: [m.Agilita],
      52: [m.Speculmossa]
    },
    movesByMT: [
      m.Volo, m.Tossina, m.Doppioteam, m.Riposo, m.Furto,
      m.Protezione, m.Alacciaio, m.Attrazione, m.Ritorno, m.Frustrazione,
      m.Introforza, m.Pioggiadanza, m.Giornodisole, m.Facciata, m.Forzasegreta,
      m.Aeroassalto, m.Finta, m.Preveggenza, m.Inseguimento, m.Aerasoio,
      m.Sdoppiatore, m.Mimica, m.Comete, m.Aeroattacco, m.Sostituto,
      m.Russare, m.Fangosberla, m.Resistenza, m.Bullo, m.Sonnolalia,
      m.AttaccodAla, m.Rinfrescata, m.Danzadipiume
    ],
    evolution: {
      stage: "stage1",
      to: [
        { species: "18", trigger: { kind: "level", level: 36 } }
      ]
    }
  },
  "18": {
    name: "Pidgeot",
    dexNumber: 18,
    type: ["Normale", "Volante"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 36,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.Azione, m.Turbosabbia, m.Raffica, m.AttaccoRapido],
      20: [m.Turbine],
      27: [m.AttaccodAla],
      34: [m.Danzadipiume],
      48: [m.Agilita],
      62: [m.Speculmossa]
    },
    movesByMT: [
      m.Volo, m.IperRaggio, m.Tossina, m.Doppioteam, m.Riposo,
      m.Furto, m.Protezione, m.Alacciaio, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Giornodisole, m.Facciata,
      m.Forzasegreta, m.Aeroassalto, m.Finta, m.Preveggenza, m.Inseguimento,
      m.Aerasoio, m.Sdoppiatore, m.Mimica, m.Comete, m.Aeroattacco,
      m.Sostituto, m.Russare, m.Fangosberla, m.Resistenza, m.Bullo,
      m.Sonnolalia, m.AttaccodAla, m.Rinfrescata, m.Danzadipiume
    ],
    evolution: {stage: "stage2", to: []}
  },
  "19": {
    name: "Rattata",
    dexNumber: 19,
    type: ["Normale"],
    gender: ["Maschio", "Femmina"],
    spriteGendered: true,
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 30
    },
    exp: 50,
    movesByLevel: {
      5: [m.Azione, m.Colpocoda],
      7: [m.AttaccoRapido],
      13: [m.Iperzanna],
      20: [m.Focalenergia],
      27: [m.Inseguimento],
      34: [m.Superzanna],
      41: [m.Rimonta]
    },
    movesByMT: [
      m.Taglio, m.Geloraggio, m.Bora, m.Fulmine, m.Tuono,
      m.Fossa, m.Tossina, m.Doppioteam, m.Riposo, m.Furto,
      m.Protezione, m.Attrazione, m.Ritorno, m.Frustrazione, m.Codacciaio,
      m.Introforza, m.Pioggiadanza, m.Giornodisole, m.PallaOmbra, m.Spaccaroccia,
      m.Facciata, m.Provocazione, m.Forzasegreta, m.Ondashock, m.Morso,
      m.Contrattacco, m.Stridio, m.Sfuriate, m.Ruotafuoco, m.Contropiede,
      m.Bullo, m.Baraonda, m.Corposcontro, m.Sdoppiatore, m.Tuononda,
      m.Mimica, m.Ricciolscudo, m.Comete, m.Sostituto, m.Russare,
      m.Fangosberla, m.Ventogelato, m.Resistenza, m.Sonnolalia
    ],
    evolution: {stage: "base", to: [{species: "20", trigger: {kind: "level", level: 20}}]}
  },
  "20": {
    name: "Raticate",
    dexNumber: 20,
    type: ["Normale"],
    gender: ["Maschio", "Femmina"],
    spriteGendered: true,
    encounter: {
      rarity: "u",
      minLevel: 20,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Azione, m.Colpocoda, m.AttaccoRapido],
      13: [m.Iperzanna],
      20: [m.Visotruce],
      30: [m.Inseguimento],
      40: [m.Superzanna],
      50: [m.Rimonta]
    },
    movesByMT: [
      m.Taglio, m.Boato, m.Geloraggio, m.Bora, m.IperRaggio,
      m.Forza, m.Fulmine, m.Tuono, m.Fossa, m.Tossina,
      m.Doppioteam, m.Riposo, m.Furto, m.Protezione, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Codacciaio, m.Introforza, m.Pioggiadanza,
      m.Giornodisole, m.PallaOmbra, m.Spaccaroccia, m.Facciata, m.Provocazione,
      m.Forzasegreta, m.Ondashock, m.Morso, m.Contrattacco, m.Stridio,
      m.Sfuriate, m.Ruotafuoco, m.Contropiede, m.Bullo, m.Baraonda,
      m.Corposcontro, m.Sdoppiatore, m.Tuononda, m.Mimica, m.Ricciolscudo,
      m.Comete, m.Sostituto, m.Russare, m.Fangosberla, m.Ventogelato,
      m.Resistenza, m.Sonnolalia, m.Iperzanna, m.Superzanna, m.Visotruce,
      m.Rinfrescata
    ],
    evolution: {stage: "stage1", to: []}
  },
  "21": {
    name: "Spearow",
    dexNumber: 21,
    type: ["Normale", "Volante"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 30
    },
    exp: 50,
    movesByLevel: {
      5: [m.Beccata, m.Ruggito],
      7: [m.Fulmisguardo],
      13: [m.Furia],
      19: [m.Inseguimento],
      25: [m.Aeroassalto],
      31: [m.Speculmossa],
      37: [m.Perforbecco],
      43: [m.Agilita]
    },
    movesByMT: [
      m.Volo, m.Tossina, m.Doppioteam, m.Riposo, m.Furto,
      m.Protezione, m.Alacciaio, m.Attrazione, m.Ritorno, m.Frustrazione,
      m.Introforza, m.Pioggiadanza, m.Giornodisole, m.Facciata, m.Forzasegreta,
      m.Aeroassalto, m.AttaccoRapido, m.Aeroattacco, m.Tripletta, m.Visotruce,
      m.Finta, m.Falsofinale, m.Sgomento, m.Sdoppiatore, m.Mimica,
      m.Comete, m.Sostituto, m.Russare, m.Fangosberla, m.Resistenza,
      m.Bullo, m.Sonnolalia, m.Fulmisguardo, m.Staffetta
    ],
    evolution: {stage: "base", to: [{species: "22", trigger: {kind: "level", level: 20}}]}
  },
  "22": {
    name: "Fearow",
    dexNumber: 22,
    type: ["Normale", "Volante"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 20,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Beccata, m.Ruggito, m.Fulmisguardo, m.Furia],
      26: [m.Inseguimento],
      32: [m.Speculmossa],
      40: [m.Perforbecco],
      47: [m.Agilita]
    },
    movesByMT: [
      m.Volo, m.IperRaggio, m.Tossina, m.Doppioteam, m.Riposo,
      m.Furto, m.Protezione, m.Alacciaio, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Giornodisole, m.Facciata,
      m.Forzasegreta, m.Aeroassalto, m.AttaccoRapido, m.Aeroattacco, m.Tripletta,
      m.Visotruce, m.Finta, m.Falsofinale, m.Sgomento, m.Sdoppiatore,
      m.Mimica, m.Comete, m.Sostituto, m.Russare, m.Fangosberla,
      m.Resistenza, m.Bullo, m.Sonnolalia, m.Fulmisguardo, m.Staffetta
    ],
    evolution: {stage: "stage1", to: []}
  },
  "23": {
    name: "Ekans",
    dexNumber: 23,
    type: ["Veleno"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 32
    },
    exp: 50,
    movesByLevel: {
      5: [m.Avvolgibotta, m.Fulmisguardo],
      8: [m.Velenospina],
      13: [m.Morso],
      20: [m.SguardoFeroce],
      25: [m.Stridio],
      32: [m.Acido],
      37: [m.Introenergia, m.Sfoghenergia, m.Accumulo],
      44: [m.Nube]
    },
    movesByMT: [
      m.Forza, m.Terremoto, m.Fossa, m.Tossina, m.Doppioteam,
      m.Riposo, m.Furto, m.Protezione, m.Fangobomba, m.Gigassorbimento,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Codacciaio, m.Introforza,
      m.Pioggiadanza, m.Giornodisole, m.Attaccalite, m.Facciata, m.Scippo,
      m.Forzasegreta, m.Schianto, m.Dispetto, m.Inseguimento, m.Picchiaduro,
      m.Velenodenti, m.Corposcontro, m.Sdoppiatore, m.Mimica, m.Frana,
      m.Sostituto, m.Russare, m.Resistenza, m.Bullo, m.Sonnolalia
    ],
    evolution: {stage: "base", to: [{species: "24", trigger: {kind: "level", level: 22}}]}
  },
  "24": {
    name: "Arbok",
    dexNumber: 24,
    type: ["Veleno"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 22,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Avvolgibotta, m.Fulmisguardo, m.Velenospina, m.Morso],
      20: [m.SguardoFeroce],
      28: [m.Stridio],
      38: [m.Acido],
      46: [m.Introenergia, m.Sfoghenergia, m.Accumulo],
      56: [m.Nube]
    },
    movesByMT: [
      m.IperRaggio, m.Forza, m.Terremoto, m.Fossa, m.Tossina,
      m.Doppioteam, m.Riposo, m.Furto, m.Protezione, m.Fangobomba,
      m.Gigassorbimento, m.Attrazione, m.Ritorno, m.Frustrazione, m.Codacciaio,
      m.Introforza, m.Pioggiadanza, m.Giornodisole, m.Attaccalite, m.Facciata,
      m.Scippo, m.Forzasegreta, m.Schianto, m.Dispetto, m.Inseguimento,
      m.Picchiaduro, m.Velenodenti, m.Corposcontro, m.Sdoppiatore, m.Mimica,
      m.Frana, m.Sostituto, m.Russare, m.Resistenza, m.Bullo,
      m.Sonnolalia, m.Morso, m.SguardoFeroce, m.Rinfrescata
    ],
    evolution: {stage: "stage1", to: []}
  },
  "25": {
    name: "Pikachu",
    dexNumber: 25,
    type: ["Elettro"],
    gender: ["Maschio", "Femmina"],
    spriteGendered: true,
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 50
    },
    exp: 100,
    movesByLevel: {
      5: [m.Tuonoshock, m.Ruggito],
      6: [m.Colpocoda],
      8: [m.Tuononda],
      11: [m.AttaccoRapido],
      15: [m.Doppioteam],
      20: [m.Schianto],
      26: [m.Fulmine],
      33: [m.Agilita],
      41: [m.Tuono],
      50: [m.Schermoluce]
    },
    movesByMT: [
      m.Forza, m.Fulmine, m.Tuono, m.Fossa, m.Tossina,
      m.Doppioteam, m.Schermoluce, m.Flash, m.Riposo, m.Protezione,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Codacciaio, m.Introforza,
      m.Pioggiadanza, m.Spaccaroccia, m.Facciata, m.Centripugno, m.Breccia,
      m.Forzasegreta, m.Ondashock, m.Doppiasberla, m.Pazienza, m.Contropiede,
      m.Regalino, m.Ripeti, m.Sottocarica, m.Desiderio, m.Megapugno,
      m.Tuonopugno, m.Megacalcio, m.Corposcontro, m.Sdoppiatore, m.Contrattacco,
      m.MovimentoSismico, m.Tuononda, m.Mimica, m.Ricciolscudo, m.Comete,
      m.Sostituto, m.Russare, m.Fangosberla, m.Resistenza, m.Rotolamento,
      m.Bullo, m.Sonnolalia, m.Dinamipugno, m.Locomovolt, m.Strampadanza,
      m.Surf, m.Volo
    ],
    evolution: {stage: "base", to: [{species: "26", trigger: {kind: "item", item: i.pietratuono}}]}
  },
  "26": {
    name: "Raichu",
    dexNumber: 26,
    type: ["Elettro"],
    gender: ["Maschio", "Femmina"],
    spriteGendered: true,
    encounter: {
      rarity: "u",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.Tuonoshock, m.Colpocoda, m.AttaccoRapido, m.Fulmine]
    },
    movesByMT: [
      m.IperRaggio, m.Forza, m.Fulmine, m.Tuono, m.Fossa,
      m.Tossina, m.Doppioteam, m.Schermoluce, m.Flash, m.Riposo,
      m.Furto, m.Protezione, m.Attrazione, m.Ritorno, m.Frustrazione,
      m.Codacciaio, m.Introforza, m.Pioggiadanza, m.Spaccaroccia, m.Facciata,
      m.Centripugno, m.Breccia, m.Forzasegreta, m.Ondashock, m.Doppiasberla,
      m.Pazienza, m.Contropiede, m.Regalino, m.Ripeti, m.Sottocarica,
      m.Desiderio, m.Megapugno, m.Tuonopugno, m.Megacalcio, m.Corposcontro,
      m.Sdoppiatore, m.Contrattacco, m.MovimentoSismico, m.Tuononda, m.Mimica,
      m.Ricciolscudo, m.Comete, m.Sostituto, m.Russare, m.Fangosberla,
      m.Resistenza, m.Rotolamento, m.Bullo, m.Sonnolalia, m.Dinamipugno,
      m.Locomovolt, m.Strampadanza, m.Surf, m.Volo
    ],
    evolution: {stage: "stage1", to: []}
  },
  "27": {
    name: "Sandshrew",
    dexNumber: 27,
    type: ["Terra"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 32
    },
    exp: 50,
    movesByLevel: {
      5: [m.Graffio],
      6: [m.Ricciolscudo],
      11: [m.Turbosabbia],
      17: [m.Velenospina],
      23: [m.Lacerazione],
      30: [m.Comete],
      37: [m.Sfuriate],
      45: [m.Sabbiotomba],
      53: [m.Terrempesta]
    },
    movesByMT: [
      m.Taglio, m.Forza, m.Terremoto, m.Fossa, m.Tossina,
      m.Doppioteam, m.Riposo, m.Furto, m.Protezione, m.Terrempesta,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Codacciaio, m.Introforza,
      m.Giornodisole, m.Spaccaroccia, m.Facciata, m.Centripugno, m.Breccia,
      m.Forzasegreta, m.Rocciotomba, m.Aeroassalto, m.Danzaspada, m.Contrattacco,
      m.Frana, m.Flagello, m.Salvaguardia, m.Rapigiro, m.Ferrartigli,
      m.Tritartigli, m.Corposcontro, m.Sdoppiatore, m.MovimentoSismico, m.Mimica,
      m.Ricciolscudo, m.Comete, m.Sostituto, m.Russare, m.Fangosberla,
      m.Resistenza, m.Rotolamento, m.Bullo, m.Tagliofuria, m.Sonnolalia,
      m.Dinamipugno
    ],
    evolution: {stage: "base", to: [{species: "28", trigger: {kind: "level", level: 22}}]}
  },
  "28": {
    name: "Sandslash",
    dexNumber: 28,
    type: ["Terra"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 22,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Graffio, m.Ricciolscudo, m.Turbosabbia],
      17: [m.Velenospina],
      24: [m.Lacerazione],
      33: [m.Comete],
      42: [m.Sfuriate],
      52: [m.Sabbiotomba],
      62: [m.Terrempesta]
    },
    movesByMT: [
      m.Taglio, m.IperRaggio, m.Forza, m.Terremoto, m.Fossa,
      m.Tossina, m.Doppioteam, m.Riposo, m.Furto, m.Protezione,
      m.Terrempesta, m.Attrazione, m.Ritorno, m.Frustrazione, m.Codacciaio,
      m.Introforza, m.Giornodisole, m.Spaccaroccia, m.Facciata, m.Centripugno,
      m.Breccia, m.Forzasegreta, m.Rocciotomba, m.Aeroassalto, m.Danzaspada,
      m.Contrattacco, m.Frana, m.Flagello, m.Salvaguardia, m.Rapigiro,
      m.Ferrartigli, m.Tritartigli, m.Corposcontro, m.Sdoppiatore, m.MovimentoSismico,
      m.Mimica, m.Ricciolscudo, m.Comete, m.Sostituto, m.Russare,
      m.Fangosberla, m.Resistenza, m.Rotolamento, m.Bullo, m.Tagliofuria,
      m.Sonnolalia, m.Dinamipugno
    ],
    evolution: {stage: "stage1", to: []}
  },
  "29": {
    name: "Nidoran",
    dexNumber: 29,
    type: ["Veleno"],
    gender: ["Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 21
    },
    exp: 50,
    movesByLevel: {
      5: [m.Ruggito, m.Graffio],
      8: [m.Colpocoda],
      12: [m.Doppiocalcio],
      17: [m.Velenospina],
      20: [m.Morso],
      23: [m.Altruismo],
      30: [m.Sfuriate],
      38: [m.Adulazione],
      47: [m.Sgranocchio]
    },
    movesByMT: [
      m.Taglio, m.Geloraggio, m.Bora, m.Forza, m.Fulmine,
      m.Tuono, m.Fossa, m.Tossina, m.Doppioteam, m.Riposo,
      m.Furto, m.Protezione, m.Fangobomba, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Codacciaio, m.Introforza, m.Pioggiadanza, m.Giornodisole,
      m.Spaccaroccia, m.Facciata, m.Forzasegreta, m.Aeroassalto, m.Ondashock,
      m.Idropulsar, m.Riduttore, m.Supersuono, m.Inibitore, m.Contrattacco,
      m.Focalenergia, m.Fascino, m.Picchiaduro, m.Corposcontro, m.Sdoppiatore,
      m.Mimica, m.Ricciolscudo, m.Sostituto, m.Russare, m.Fangosberla,
      m.Resistenza, m.Bullo, m.Sonnolalia
    ],
    evolution: {stage: "base", to: [{species: "30", trigger: {kind: "level", level: 16}}]}
  },
  "30": {
    name: "Nidorina",
    dexNumber: 30,
    type: ["Veleno"],
    gender: ["Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 16,
      maxLevel: 50
    },
    exp: 100,
    movesByLevel: {
      5: [m.Ruggito, m.Graffio],
      8: [m.Colpocoda],
      12: [m.Doppiocalcio],
      18: [m.Velenospina],
      22: [m.Morso],
      26: [m.Altruismo],
      34: [m.Sfuriate],
      43: [m.Adulazione],
      53: [m.Sgranocchio]
    },
    movesByMT: [
      m.Taglio, m.Geloraggio, m.Bora, m.Forza, m.Fulmine,
      m.Tuono, m.Fossa, m.Tossina, m.Doppioteam, m.Riposo,
      m.Furto, m.Protezione, m.Fangobomba, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Codacciaio, m.Introforza, m.Pioggiadanza, m.Giornodisole,
      m.Spaccaroccia, m.Facciata, m.Forzasegreta, m.Aeroassalto, m.Ondashock,
      m.Idropulsar, m.Riduttore, m.Supersuono, m.Inibitore, m.Contrattacco,
      m.Focalenergia, m.Fascino, m.Picchiaduro, m.Corposcontro, m.Sdoppiatore,
      m.Mimica, m.Ricciolscudo, m.Sostituto, m.Russare, m.Fangosberla,
      m.Resistenza, m.Bullo, m.Sonnolalia
    ],
    evolution: {stage: "stage1", to: [{species: "31", trigger: {kind: "item", item: i.pietralunare}}]}
  },
  "31": {
    name: "Nidoqueen",
    dexNumber: 31,
    type: ["Veleno", "Terra"],
    gender: ["Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.Graffio, m.Colpocoda, m.Doppiocalcio, m.Velenospina],
      22: [m.Corposcontro],
      43: [m.Troppoforte]
    },
    movesByMT: [
      m.Taglio, m.Boato, m.Lanciafiamme, m.Surf, m.Geloraggio,
      m.Bora, m.IperRaggio, m.Forza, m.Fulmine, m.Tuono,
      m.Terremoto, m.Fossa, m.Tossina, m.Doppioteam, m.Fuocobomba,
      m.Riposo, m.Furto, m.Protezione, m.Fangobomba, m.Terrempesta,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Codacciaio, m.Introforza,
      m.Pioggiadanza, m.Giornodisole, m.PallaOmbra, m.Spaccaroccia, m.Attaccalite,
      m.Facciata, m.Centripugno, m.Provocazione, m.Breccia, m.Forzasegreta,
      m.Rocciotomba, m.Aeroassalto, m.Ondashock, m.Idropulsar, m.Riduttore,
      m.Supersuono, m.Inibitore, m.Contrattacco, m.Focalenergia, m.Fascino,
      m.Picchiaduro, m.Megapugno, m.Fuocopugno, m.Gelopugno, m.Tuonopugno,
      m.Megacalcio, m.Corposcontro, m.Sdoppiatore, m.MovimentoSismico, m.Mimica,
      m.Ricciolscudo, m.Frana, m.Sostituto, m.Russare, m.Fangosberla,
      m.Ventogelato, m.Resistenza, m.Bullo, m.Tagliofuria, m.Sonnolalia,
      m.Dinamipugno
    ],
    evolution: {stage: "stage2", to: []}
  },
  "32": {
    name: "Nidoran",
    dexNumber: 32,
    type: ["Veleno"],
    gender: ["Maschio"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 21
    },
    exp: 50,
    movesByLevel: {
      5: [m.Fulmisguardo, m.Beccata],
      8: [m.Focalenergia],
      12: [m.Doppiocalcio],
      17: [m.Velenospina],
      20: [m.Incornata],
      23: [m.Altruismo],
      30: [m.Furia],
      38: [m.Adulazione],
      47: [m.Perforcorno]
    },
    movesByMT: [
      m.Taglio, m.Geloraggio, m.Bora, m.Forza, m.Fulmine,
      m.Tuono, m.Fossa, m.Tossina, m.Doppioteam, m.Riposo,
      m.Furto, m.Protezione, m.Fangobomba, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Codacciaio, m.Introforza, m.Pioggiadanza, m.Giornodisole,
      m.Spaccaroccia, m.Facciata, m.Forzasegreta, m.Ondashock, m.Idropulsar,
      m.Riduttore, m.Supersuono, m.Inibitore, m.Contrattacco, m.Confusione,
      m.Amnesia, m.Picchiaduro, m.Corposcontro, m.Sdoppiatore, m.Mimica,
      m.Ricciolscudo, m.Sostituto, m.Russare, m.Fangosberla, m.Resistenza,
      m.Bullo, m.Sonnolalia
    ],
    evolution: {stage: "base", to: [{species: "33", trigger: {kind: "level", level: 16}}]}
  },
  "33": {
    name: "Nidorino",
    dexNumber: 33,
    type: ["Veleno"],
    gender: ["Maschio"],
    encounter: {
      rarity: "c",
      minLevel: 16,
      maxLevel: 50
    },
    exp: 100,
    movesByLevel: {
      5: [m.Fulmisguardo, m.Beccata],
      8: [m.Focalenergia],
      12: [m.Doppiocalcio],
      18: [m.Velenospina],
      22: [m.Incornata],
      26: [m.Altruismo],
      34: [m.Furia],
      43: [m.Adulazione],
      53: [m.Perforcorno]
    },
    movesByMT: [
      m.Taglio, m.Geloraggio, m.Bora, m.Forza, m.Fulmine,
      m.Tuono, m.Fossa, m.Tossina, m.Doppioteam, m.Riposo,
      m.Furto, m.Protezione, m.Fangobomba, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Codacciaio, m.Introforza, m.Pioggiadanza, m.Giornodisole,
      m.Spaccaroccia, m.Facciata, m.Forzasegreta, m.Ondashock, m.Idropulsar,
      m.Riduttore, m.Supersuono, m.Inibitore, m.Contrattacco, m.Confusione,
      m.Amnesia, m.Picchiaduro, m.Corposcontro, m.Sdoppiatore, m.Mimica,
      m.Ricciolscudo, m.Sostituto, m.Russare, m.Fangosberla, m.Resistenza,
      m.Bullo, m.Sonnolalia
    ],
    evolution: {stage: "stage1", to: [{species: "34", trigger: {kind: "item", item: i.pietralunare}}]}
  },
  "34": {
    name: "Nidoking",
    dexNumber: 34,
    type: ["Veleno", "Terra"],
    gender: ["Maschio"],
    encounter: {
      rarity: "r",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.Beccata, m.Focalenergia, m.Doppiocalcio, m.Velenospina],
      22: [m.Colpo],
      43: [m.Megacorno]
    },
    movesByMT: [
      m.Taglio, m.Boato, m.Lanciafiamme, m.Surf, m.Geloraggio,
      m.Bora, m.IperRaggio, m.Forza, m.Fulmine, m.Tuono,
      m.Terremoto, m.Fossa, m.Tossina, m.Doppioteam, m.Fuocobomba,
      m.Riposo, m.Furto, m.Protezione, m.Fangobomba, m.Terrempesta,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Codacciaio, m.Introforza,
      m.Pioggiadanza, m.Giornodisole, m.PallaOmbra, m.Spaccaroccia, m.Attaccalite,
      m.Facciata, m.Centripugno, m.Provocazione, m.Breccia, m.Forzasegreta,
      m.Rocciotomba, m.Ondashock, m.Idropulsar, m.Riduttore, m.Supersuono,
      m.Inibitore, m.Contrattacco, m.Confusione, m.Amnesia, m.Picchiaduro,
      m.Megapugno, m.Fuocopugno, m.Gelopugno, m.Tuonopugno, m.Megacalcio,
      m.Corposcontro, m.Sdoppiatore, m.MovimentoSismico, m.Mimica, m.Ricciolscudo,
      m.Frana, m.Sostituto, m.Russare, m.Fangosberla, m.Ventogelato,
      m.Resistenza, m.Bullo, m.Tagliofuria, m.Sonnolalia, m.Dinamipugno
    ],
    evolution: {stage: "stage2", to: []}
  },
  "35": {
    name: "Clefairy",
    dexNumber: 35,
    type: ["Folletto"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 5,
      maxLevel: 50
    },
    exp: 100,
    movesByLevel: {
      5: [m.Botta, m.Ruggito, m.Ripeti],
      9: [m.Canto],
      13: [m.Doppiasberla],
      21: [m.Minimizzato],
      25: [m.Ricciolscudo],
      29: [m.Metronomo],
      33: [m.Cosmoforza],
      37: [m.Lucelunare],
      41: [m.Schermoluce],
      45: [m.Meteorpugno]
    },
    movesByMT: [
      m.Lanciafiamme, m.Geloraggio, m.Bora, m.Forza, m.Solarraggio,
      m.Fulmine, m.Tuono, m.Fossa, m.Tossina, m.Psichico,
      m.Doppioteam, m.Schermoluce, m.Riflesso, m.Fuocobomba, m.Flash,
      m.Riposo, m.Protezione, m.Attrazione, m.Ritorno, m.Frustrazione,
      m.Salvaguardia, m.Codacciaio, m.Introforza, m.Pioggiadanza, m.Giornodisole,
      m.PallaOmbra, m.Facciata, m.Centripugno, m.Breccia, m.Scippo,
      m.Forzasegreta, m.Calmamente, m.Ondashock, m.Idropulsar, m.Mimica,
      m.Metronomo, m.Amnesia, m.Splash, m.Sostituto, m.Panciamburo,
      m.Regalino, m.Desiderio, m.Megapugno, m.Fuocopugno, m.Gelopugno,
      m.Tuonopugno, m.Megacalcio, m.Corposcontro, m.Sdoppiatore, m.Contrattacco,
      m.MovimentoSismico, m.Tuononda, m.Ricciolscudo, m.Covauova, m.Mangiasogni,
      m.Incubo, m.Russare, m.Fangosberla, m.Ventogelato, m.Resistenza,
      m.Rotolamento, m.Bullo, m.Sonnolalia, m.Dinamipugno, m.Psicamisu
    ],
    evolution: {stage: "base", to: [{species: "36", trigger: {kind: "item", item: i.pietralunare}}]}
  },
  "36": {
    name: "Clefable",
    dexNumber: 36,
    type: ["Folletto"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.Canto, m.Doppiasberla, m.Minimizzato, m.Metronomo]
    },
    movesByMT: [
      m.Lanciafiamme, m.Geloraggio, m.Bora, m.IperRaggio, m.Forza,
      m.Solarraggio, m.Fulmine, m.Tuono, m.Fossa, m.Tossina,
      m.Psichico, m.Doppioteam, m.Schermoluce, m.Riflesso, m.Fuocobomba,
      m.Flash, m.Riposo, m.Protezione, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Salvaguardia, m.Codacciaio, m.Introforza, m.Pioggiadanza,
      m.Giornodisole, m.PallaOmbra, m.Facciata, m.Centripugno, m.Breccia,
      m.Scippo, m.Forzasegreta, m.Calmamente, m.Ondashock, m.Idropulsar,
      m.Mimica, m.Metronomo, m.Amnesia, m.Splash, m.Sostituto,
      m.Panciamburo, m.Regalino, m.Desiderio, m.Megapugno, m.Fuocopugno,
      m.Gelopugno, m.Tuonopugno, m.Megacalcio, m.Corposcontro, m.Sdoppiatore,
      m.Contrattacco, m.MovimentoSismico, m.Tuononda, m.Ricciolscudo, m.Covauova,
      m.Mangiasogni, m.Incubo, m.Russare, m.Fangosberla, m.Ventogelato,
      m.Resistenza, m.Rotolamento, m.Bullo, m.Sonnolalia, m.Dinamipugno,
      m.Psicamisu
    ],
    evolution: {stage: "stage1", to: []}
  },
  "37": {
    name: "Vulpix",
    dexNumber: 37,
    type: ["Fuoco"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 5,
      maxLevel: 50
    },
    exp: 50,
    movesByLevel: {
      5: [m.Braciere, m.Colpocoda],
      9: [m.Boato],
      13: [m.AttaccoRapido],
      17: [m.Fuocofatuo],
      21: [m.Stordiraggio],
      25: [m.Esclusiva],
      29: [m.Lanciafiamme],
      33: [m.Salvaguardia],
      37: [m.Rancore],
      41: [m.Turbofuoco]
    },
    movesByMT: [
      m.Boato, m.Lanciafiamme, m.Fossa, m.Tossina, m.Doppioteam,
      m.Fuocobomba, m.Riposo, m.Protezione, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Salvaguardia, m.Codacciaio, m.Introforza, m.Giornodisole,
      m.Facciata, m.Forzasegreta, m.Vampata, m.Inibitore, m.Ipnosi,
      m.Flagello, m.Dispetto, m.Finta, m.Psicamisu, m.Ondacalda,
      m.Gridodilotta, m.Corposcontro, m.Sdoppiatore, m.Mimica, m.Comete,
      m.Sostituto, m.Russare, m.Resistenza, m.Bullo, m.Sonnolalia,
      m.Braciere, m.Fascino
    ],
    evolution: {stage: "base", to: [{species: "38", trigger: {kind: "item", item: i.pietrafocaia}}]}
  },
  "38": {
    name: "Ninetales",
    dexNumber: 38,
    type: ["Fuoco"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Braciere, m.AttaccoRapido, m.Stordiraggio, m.Salvaguardia],
      45: [m.Turbofuoco]
    },
    movesByMT: [
      m.Boato, m.Lanciafiamme, m.IperRaggio, m.Fossa, m.Tossina,
      m.Doppioteam, m.Fuocobomba, m.Riposo, m.Protezione, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Salvaguardia, m.Codacciaio, m.Introforza,
      m.Giornodisole, m.Facciata, m.Forzasegreta, m.Vampata, m.Inibitore,
      m.Ipnosi, m.Flagello, m.Dispetto, m.Finta, m.Psicamisu,
      m.Ondacalda, m.Gridodilotta, m.Corposcontro, m.Sdoppiatore, m.Mimica,
      m.Comete, m.Sostituto, m.Russare, m.Resistenza, m.Bullo,
      m.Sonnolalia, m.Braciere, m.Fascino
    ],
    evolution: {stage: "stage1", to: []}
  },
  "39": {
    name: "Jigglypuff",
    dexNumber: 39,
    type: ["Normale", "Folletto"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 5,
      maxLevel: 50
    },
    exp: 100,
    movesByLevel: {
      5: [m.Canto, m.Ricciolscudo, m.Botta],
      14: [m.Inibitore],
      19: [m.Rotolamento],
      24: [m.Doppiasberla],
      29: [m.Riposo],
      34: [m.Corposcontro],
      39: [m.Mimica],
      44: [m.Granvoce],
      49: [m.Sdoppiatore]
    },
    movesByMT: [
      m.Lanciafiamme, m.Geloraggio, m.Bora, m.Forza, m.Solarraggio,
      m.Fulmine, m.Tuono, m.Fossa, m.Tossina, m.Psichico,
      m.Doppioteam, m.Schermoluce, m.Riflesso, m.Fuocobomba, m.Flash,
      m.Riposo, m.Protezione, m.Attrazione, m.Ritorno, m.Frustrazione,
      m.Salvaguardia, m.Introforza, m.Pioggiadanza, m.Giornodisole, m.PallaOmbra,
      m.Facciata, m.Centripugno, m.Breccia, m.Scippo, m.Forzasegreta,
      m.Ondashock, m.Idropulsar, m.Finta, m.Ultimocanto, m.Regalino,
      m.Desiderio, m.Falselacrime, m.Megapugno, m.Fuocopugno, m.Gelopugno,
      m.Tuonopugno, m.Megacalcio, m.Corposcontro, m.Sdoppiatore, m.Contrattacco,
      m.MovimentoSismico, m.Tuononda, m.Mimica, m.Ricciolscudo, m.Mangiasogni,
      m.Sostituto, m.Incubo, m.Russare, m.Fangosberla, m.Ventogelato,
      m.Resistenza, m.Rotolamento, m.Bullo, m.Sonnolalia, m.Dinamipugno,
      m.Psicamisu, m.Solletico
    ],
    evolution: {stage: "base", to: [{species: "40", trigger: {kind: "item", item: i.pietralunare}}]}
  },
  "40": {
    name: "Wigglytuff",
    dexNumber: 40,
    type: ["Normale", "Folletto"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.Canto, m.Inibitore, m.Ricciolscudo, m.Doppiasberla]
    },
    movesByMT: [
      m.Lanciafiamme, m.Geloraggio, m.Bora, m.IperRaggio, m.Forza,
      m.Solarraggio, m.Fulmine, m.Tuono, m.Fossa, m.Tossina,
      m.Psichico, m.Doppioteam, m.Schermoluce, m.Riflesso, m.Fuocobomba,
      m.Flash, m.Riposo, m.Protezione, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Salvaguardia, m.Introforza, m.Pioggiadanza, m.Giornodisole,
      m.PallaOmbra, m.Facciata, m.Centripugno, m.Breccia, m.Scippo,
      m.Forzasegreta, m.Ondashock, m.Idropulsar, m.Finta, m.Ultimocanto,
      m.Regalino, m.Desiderio, m.Falselacrime, m.Megapugno, m.Fuocopugno,
      m.Gelopugno, m.Tuonopugno, m.Megacalcio, m.Corposcontro, m.Sdoppiatore,
      m.Contrattacco, m.MovimentoSismico, m.Tuononda, m.Mimica, m.Ricciolscudo,
      m.Mangiasogni, m.Sostituto, m.Incubo, m.Russare, m.Fangosberla,
      m.Ventogelato, m.Resistenza, m.Rotolamento, m.Bullo, m.Sonnolalia,
      m.Dinamipugno, m.Psicamisu, m.Solletico
    ],
    evolution: {stage: "stage1", to: []}
  },
  "41": {
    name: "Zubat",
    dexNumber: 41,
    type: ["Veleno", "Volante"],
    gender: ["Maschio", "Femmina"],
    spriteGendered: true,
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 40
    },
    exp: 50,
    movesByLevel: {
      5: [m.Sanguisuga],
      6: [m.Sgomento],
      11: [m.Supersuono],
      16: [m.Morso],
      21: [m.AttaccodAla],
      26: [m.Stordiraggio],
      31: [m.Aerasoio],
      36: [m.Malosguardo],
      41: [m.Velenodenti],
      46: [m.Nube]
    },
    movesByMT: [
      m.Tossina, m.Doppioteam, m.Riposo, m.Furto, m.Protezione,
      m.Fangobomba, m.Gigassorbimento, m.Alacciaio, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Giornodisole, m.PallaOmbra,
      m.Attaccalite, m.Facciata, m.Provocazione, m.Scippo, m.Forzasegreta,
      m.Aeroassalto, m.Raffica, m.Turbine, m.AttaccoRapido, m.Maledizione,
      m.Finta, m.Inseguimento, m.Sdoppiatore, m.Mimica, m.Comete,
      m.Sostituto, m.Russare, m.Resistenza, m.Bullo, m.Sonnolalia
    ],
    evolution: {stage: "base", to: [{species: "42", trigger: {kind: "level", level: 30}}]}
  },
  "42": {
    name: "Golbat",
    dexNumber: 42,
    type: ["Veleno", "Volante"],
    gender: ["Maschio", "Femmina"],
    spriteGendered: true,
    encounter: {
      rarity: "c",
      minLevel: 30,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Stridio, m.Sanguisuga, m.Sgomento, m.Supersuono],
      16: [m.Morso],
      21: [m.AttaccodAla],
      28: [m.Stordiraggio],
      35: [m.Aerasoio],
      42: [m.Malosguardo],
      49: [m.Velenodenti],
      56: [m.Nube]
    },
    movesByMT: [
      m.IperRaggio, m.Tossina, m.Doppioteam, m.Riposo, m.Furto,
      m.Protezione, m.Fangobomba, m.Gigassorbimento, m.Alacciaio, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Giornodisole,
      m.PallaOmbra, m.Attaccalite, m.Facciata, m.Provocazione, m.Scippo,
      m.Forzasegreta, m.Aeroassalto, m.Raffica, m.Turbine, m.AttaccoRapido,
      m.Maledizione, m.Finta, m.Inseguimento, m.Sdoppiatore, m.Mimica,
      m.Comete, m.Sostituto, m.Russare, m.Resistenza, m.Bullo,
      m.Sonnolalia
    ],
    evolution: {stage: "stage1", to: [{species: "169", trigger: {kind: "item", item: i.felixpietra}}]}
  },
  "43": {
    name: "Oddish",
    dexNumber: 43,
    type: ["Erba", "Veleno"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 26
    },
    exp: 50,
    movesByLevel: {
      5: [m.Assorbimento],
      7: [m.Profumino],
      14: [m.Velenpolvere],
      16: [m.Paralizzante],
      18: [m.Sonnifero],
      23: [m.Acido],
      32: [m.Lucelunare],
      39: [m.Petalodanza]
    },
    movesByMT: [
      m.Taglio, m.Solarraggio, m.Tossina, m.Doppioteam, m.Flash,
      m.Riposo, m.Protezione, m.Fangobomba, m.Gigassorbimento, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Introforza, m.Giornodisole, m.Facciata,
      m.Forzasegreta, m.Semitraglia, m.Danzaspada, m.Foglielama, m.Flagello,
      m.Fascino, m.Sintesi, m.Radicamento, m.Sdoppiatore, m.Mimica,
      m.Sostituto, m.Russare, m.Resistenza, m.Bullo, m.Sonnolalia,
      m.Parassiseme
    ],
    evolution: {stage: "base", to: [{species: "44", trigger: {kind: "level", level: 21}}]}
  },
  "44": {
    name: "Gloom",
    dexNumber: 44,
    type: ["Erba", "Veleno"],
    gender: ["Maschio", "Femmina"],
    spriteGendered: true,
    encounter: {
      rarity: "c",
      minLevel: 21,
      maxLevel: 50
    },
    exp: 100,
    movesByLevel: {
      5: [m.Assorbimento, m.Profumino, m.Velenpolvere],
      16: [m.Paralizzante],
      18: [m.Sonnifero],
      24: [m.Acido],
      35: [m.Lucelunare],
      44: [m.Petalodanza]
    },
    movesByMT: [
      m.Taglio, m.Solarraggio, m.Tossina, m.Doppioteam, m.Flash,
      m.Riposo, m.Protezione, m.Fangobomba, m.Gigassorbimento, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Introforza, m.Giornodisole, m.Facciata,
      m.Forzasegreta, m.Semitraglia, m.Danzaspada, m.Foglielama, m.Flagello,
      m.Fascino, m.Sintesi, m.Radicamento, m.Sdoppiatore, m.Mimica,
      m.Sostituto, m.Russare, m.Resistenza, m.Bullo, m.Sonnolalia,
      m.Parassiseme
    ],
    evolution: {stage: "stage1", to: [{species: "45", trigger: {kind: "item", item: i.pietrafoglia}} , {species: "182", trigger: {kind: "item", item: i.pietrasolare}}]}
  },
  "45": {
    name: "Vileplume",
    dexNumber: 45,
    type: ["Erba", "Veleno"],
    gender: ["Maschio", "Femmina"],
    spriteGendered: true,
    encounter: {
      rarity: "r",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.Assorbimento, m.Aromaterapia, m.Paralizzante, m.Megassorbimento],
      44: [m.Petalodanza]
    },
    movesByMT: [
      m.Taglio, m.IperRaggio, m.Solarraggio, m.Tossina, m.Doppioteam,
      m.Flash, m.Riposo, m.Protezione, m.Fangobomba, m.Gigassorbimento,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Introforza, m.Giornodisole,
      m.Facciata, m.Forzasegreta, m.Semitraglia, m.Danzaspada, m.Foglielama,
      m.Flagello, m.Fascino, m.Sintesi, m.Radicamento, m.Corposcontro,
      m.Sdoppiatore, m.Mimica, m.Sostituto, m.Russare, m.Resistenza,
      m.Bullo, m.Sonnolalia, m.Parassiseme
    ],
    evolution: {stage: "stage2", to: []}
  },
  "46": {
    name: "Paras",
    dexNumber: 46,
    type: ["Coleottero", "Erba"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 34
    },
    exp: 50,
    movesByLevel: {
      5: [m.Graffio],
      7: [m.Paralizzante],
      13: [m.Velenpolvere],
      19: [m.Sanguisuga],
      25: [m.Spora],
      31: [m.Lacerazione],
      37: [m.Crescita],
      43: [m.Gigassorbimento],
      49: [m.Aromaterapia]
    },
    movesByMT: [
      m.Taglio, m.Solarraggio, m.Fossa, m.Tossina, m.Doppioteam,
      m.Flash, m.Riposo, m.Furto, m.Protezione, m.Fangobomba,
      m.Gigassorbimento, m.Attrazione, m.Ritorno, m.Frustrazione, m.Introforza,
      m.Giornodisole, m.Spaccaroccia, m.Facciata, m.Forzasegreta, m.Semitraglia,
      m.Aeroassalto, m.Psicoraggio, m.Contrattacco, m.Stridio, m.Schermoluce,
      m.Flagello, m.Falsofinale, m.Inseguimento, m.Profumino, m.Danzaspada,
      m.Corposcontro, m.Sdoppiatore, m.Mimica, m.Sostituto, m.Russare,
      m.Resistenza, m.Bullo, m.Tagliofuria, m.Sonnolalia, m.Spora,
      m.Lacerazione, m.Rinfrescata
    ],
    evolution: {stage: "base", to: [{species: "47", trigger: {kind: "level", level: 24}}]}
  },
  "47": {
    name: "Parasect",
    dexNumber: 47,
    type: ["Coleottero", "Erba"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 24,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Graffio, m.Paralizzante, m.Velenpolvere],
      19: [m.Sanguisuga],
      27: [m.Spora],
      35: [m.Lacerazione],
      43: [m.Crescita],
      51: [m.Gigassorbimento],
      59: [m.Aromaterapia]
    },
    movesByMT: [
      m.Taglio, m.IperRaggio, m.Solarraggio, m.Fossa, m.Tossina,
      m.Doppioteam, m.Flash, m.Riposo, m.Furto, m.Protezione,
      m.Fangobomba, m.Gigassorbimento, m.Attrazione, m.Ritorno, m.Frustrazione,
      m.Introforza, m.Giornodisole, m.Spaccaroccia, m.Facciata, m.Forzasegreta,
      m.Semitraglia, m.Aeroassalto, m.Psicoraggio, m.Contrattacco, m.Stridio,
      m.Schermoluce, m.Flagello, m.Falsofinale, m.Inseguimento, m.Profumino,
      m.Danzaspada, m.Corposcontro, m.Sdoppiatore, m.Mimica, m.Sostituto,
      m.Russare, m.Resistenza, m.Bullo, m.Tagliofuria, m.Sonnolalia,
      m.Spora, m.Lacerazione, m.Rinfrescata
    ],
    evolution: {stage: "stage1", to: []}
  },
  "48": {
    name: "Venonat",
    dexNumber: 48,
    type: ["Coleottero", "Veleno"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 41
    },
    exp: 50,
    movesByLevel: {
      5: [m.Azione, m.Inibitore, m.Preveggenza],
      9: [m.Supersuono],
      17: [m.Confusione],
      20: [m.Velenpolvere],
      25: [m.Sanguisuga],
      28: [m.Paralizzante],
      33: [m.Psicoraggio],
      36: [m.Sonnifero],
      41: [m.Psichico]
    },
    movesByMT: [
      m.Solarraggio, m.Tossina, m.Psichico, m.Doppioteam, m.Flash,
      m.Riposo, m.Furto, m.Protezione, m.Fangobomba, m.Gigassorbimento,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Introforza, m.Giornodisole,
      m.Facciata, m.Forzasegreta, m.Stridio, m.Staffetta, m.Segnoraggio,
      m.Sdoppiatore, m.Mimica, m.Comete, m.Sostituto, m.Russare,
      m.Resistenza, m.Bullo, m.Sonnolalia
    ],
    evolution: {stage: "base", to: [{species: "49", trigger: {kind: "level", level: 31}}]}
  },
  "49": {
    name: "Venomoth",
    dexNumber: 49,
    type: ["Coleottero", "Veleno"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 31,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Ventargenteo, m.Azione, m.Inibitore, m.Preveggenza, m.Supersuono],
      17: [m.Confusione],
      20: [m.Velenpolvere],
      25: [m.Sanguisuga],
      28: [m.Paralizzante],
      31: [m.Raffica],
      36: [m.Psicoraggio],
      42: [m.Sonnifero],
      52: [m.Psichico]
    },
    movesByMT: [
      m.IperRaggio, m.Solarraggio, m.Tossina, m.Psichico, m.Doppioteam,
      m.Flash, m.Riposo, m.Furto, m.Protezione, m.Fangobomba,
      m.Gigassorbimento, m.Attrazione, m.Ritorno, m.Frustrazione, m.Introforza,
      m.Giornodisole, m.Facciata, m.Forzasegreta, m.Aeroassalto, m.Stridio,
      m.Staffetta, m.Segnoraggio, m.Sdoppiatore, m.Mimica, m.Comete,
      m.Sostituto, m.Russare, m.Resistenza, m.Bullo, m.Sonnolalia,
      m.Rinfrescata, m.Ventargenteo
    ],
    evolution: {stage: "stage1", to: []}
  },
  "50": {
    name: "Diglett",
    dexNumber: 50,
    type: ["Terra"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 36
    },
    exp: 50,
    movesByLevel: {
      5: [m.Turbosabbia, m.Graffio, m.Ruggito],
      9: [m.Magnitudo],
      17: [m.Fossa],
      21: [m.Sfuriate],
      25: [m.Fangosberla],
      33: [m.Lacerazione],
      41: [m.Terremoto],
      49: [m.Abisso]
    },
    movesByMT: [
      m.Taglio, m.Terremoto, m.Fossa, m.Tossina, m.Doppioteam,
      m.Riposo, m.Furto, m.Protezione, m.Fangobomba, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Introforza, m.Giornodisole, m.Spaccaroccia,
      m.Facciata, m.Forzasegreta, m.Rocciotomba, m.Aeroassalto, m.Stridio,
      m.Frana, m.Finta, m.Inseguimento, m.Forzantica, m.Picchiaduro,
      m.Baraonda, m.Corposcontro, m.Sdoppiatore, m.Mimica, m.Sostituto,
      m.Russare, m.Fangosberla, m.Resistenza, m.Bullo, m.Sonnolalia
    ],
    evolution: {stage: "base", to: [{species: "51", trigger: {kind: "level", level: 26}}]}
  },
  "51": {
    name: "Dugtrio",
    dexNumber: 51,
    type: ["Terra"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 26,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Tripletta, m.Turbosabbia, m.Graffio, m.Ruggito],
      9: [m.Magnitudo],
      17: [m.Fossa],
      21: [m.Sfuriate],
      25: [m.Fangosberla],
      26: [m.Sabbiotomba],
      38: [m.Lacerazione],
      51: [m.Terremoto],
      64: [m.Abisso]
    },
    movesByMT: [
      m.Taglio, m.IperRaggio, m.Terremoto, m.Fossa, m.Tossina,
      m.Doppioteam, m.Riposo, m.Furto, m.Protezione, m.Fangobomba,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Introforza, m.Giornodisole,
      m.Spaccaroccia, m.Facciata, m.Forzasegreta, m.Rocciotomba, m.Aeroassalto,
      m.Stridio, m.Frana, m.Finta, m.Inseguimento, m.Forzantica,
      m.Picchiaduro, m.Baraonda, m.Corposcontro, m.Sdoppiatore, m.Mimica,
      m.Sostituto, m.Russare, m.Fangosberla, m.Resistenza, m.Bullo,
      m.Sonnolalia, m.Tripletta, m.Terrempesta, m.Fascino
    ],
    evolution: {stage: "stage1", to: []}
  },
  "52": {
    name: "Meowth",
    dexNumber: 52,
    type: ["Normale"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 38
    },
    exp: 50,
    movesByLevel: {
      5: [m.Graffio, m.Ruggito],
      10: [m.Morso],
      18: [m.Giornopaga],
      25: [m.Finta],
      31: [m.Stridio],
      36: [m.Sfuriate],
      40: [m.Lacerazione],
      43: [m.Bruciapelo],
      45: [m.Bullo]
    },
    movesByMT: [
      m.Taglio, m.Fulmine, m.Tuono, m.Fossa, m.Tossina,
      m.Doppioteam, m.Flash, m.Riposo, m.Furto, m.Protezione,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Codacciaio, m.Introforza,
      m.Pioggiadanza, m.Giornodisole, m.PallaOmbra, m.Attaccalite, m.Facciata,
      m.Provocazione, m.Scippo, m.Forzasegreta, m.Aeroassalto, m.Ondashock,
      m.Idropulsar, m.Ipnosi, m.Amnesia, m.Dispetto, m.Fascino,
      m.Psicamisu, m.Assistente, m.Corposcontro, m.Sdoppiatore, m.Mimica,
      m.Ricciolscudo, m.Comete, m.Mangiasogni, m.Sostituto, m.Incubo,
      m.Russare, m.Fangosberla, m.Ventogelato, m.Resistenza, m.Bullo,
      m.Sonnolalia, m.Giornopaga, m.Morso, m.Canto, m.Lacerazione,
      m.Petalodanza
    ],
    evolution: {stage: "base", to: [{species: "53", trigger: {kind: "level", level: 28}}]}
  },
  "53": {
    name: "Persian",
    dexNumber: 53,
    type: ["Normale"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 28,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Graffio, m.Ruggito, m.Morso],
      18: [m.Giornopaga],
      25: [m.Finta],
      34: [m.Stridio],
      42: [m.Sfuriate],
      49: [m.Lacerazione],
      55: [m.Bruciapelo],
      61: [m.Bullo]
    },
    movesByMT: [
      m.Taglio, m.Boato, m.IperRaggio, m.Fulmine, m.Tuono,
      m.Fossa, m.Tossina, m.Doppioteam, m.Flash, m.Riposo,
      m.Furto, m.Protezione, m.Attrazione, m.Ritorno, m.Frustrazione,
      m.Codacciaio, m.Introforza, m.Pioggiadanza, m.Giornodisole, m.PallaOmbra,
      m.Attaccalite, m.Facciata, m.Provocazione, m.Scippo, m.Forzasegreta,
      m.Aeroassalto, m.Ondashock, m.Idropulsar, m.Ipnosi, m.Amnesia,
      m.Dispetto, m.Fascino, m.Psicamisu, m.Assistente, m.Corposcontro,
      m.Sdoppiatore, m.Mimica, m.Ricciolscudo, m.Comete, m.Mangiasogni,
      m.Sostituto, m.Incubo, m.Russare, m.Fangosberla, m.Ventogelato,
      m.Resistenza, m.Bullo, m.Sonnolalia, m.Giornopaga, m.Morso,
      m.Canto, m.Lacerazione, m.Petalodanza
    ],
    evolution: {stage: "stage1", to: []}
  },
  "54": {
    name: "Psyduck",
    dexNumber: 54,
    type: ["Acqua"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 43
    },
    exp: 50,
    movesByLevel: {
      5: [m.Docciascudo, m.Graffio, m.Colpocoda],
      10: [m.Inibitore],
      16: [m.Confusione],
      23: [m.Stridio],
      31: [m.Psicamisu],
      40: [m.Sfuriate],
      50: [m.Idropompa]
    },
    movesByMT: [
      m.Surf, m.Geloraggio, m.Bora, m.Forza, m.Fossa,
      m.Tossina, m.Doppioteam, m.Cascata, m.Flash, m.Riposo,
      m.Protezione, m.Attrazione, m.Ritorno, m.Frustrazione, m.Codacciaio,
      m.Introforza, m.Pioggiadanza, m.Spaccaroccia, m.Grandine, m.Facciata,
      m.Centripugno, m.Breccia, m.Forzasegreta, m.Sub, m.Aeroassalto,
      m.Calmamente, m.Idropulsar, m.Psicoraggio, m.Psichico, m.Ipnosi,
      m.Schermoluce, m.Preveggenza, m.Incrocolpo, m.Divinazione, m.Rinfrescata,
      m.Megapugno, m.Gelopugno, m.Megacalcio, m.Corposcontro, m.Sdoppiatore,
      m.Contrattacco, m.MovimentoSismico, m.Mimica, m.Comete, m.Sostituto,
      m.Russare, m.Fangosberla, m.Ventogelato, m.Resistenza, m.Bullo,
      m.Sonnolalia, m.Dinamipugno, m.Psicamisu, m.Fangata
    ],
    evolution: {stage: "base", to: [{species: "55", trigger: {kind: "level", level: 33}}]}
  },
  "55": {
    name: "Golduck",
    dexNumber: 55,
    type: ["Acqua"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 33,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Docciascudo, m.Graffio, m.Colpocoda, m.Inibitore],
      16: [m.Confusione],
      23: [m.Stridio],
      31: [m.Psicamisu],
      44: [m.Sfuriate],
      58: [m.Idropompa]
    },
    movesByMT: [
      m.Surf, m.Geloraggio, m.Bora, m.IperRaggio, m.Forza,
      m.Fossa, m.Tossina, m.Doppioteam, m.Cascata, m.Flash,
      m.Riposo, m.Protezione, m.Attrazione, m.Ritorno, m.Frustrazione,
      m.Codacciaio, m.Introforza, m.Pioggiadanza, m.Spaccaroccia, m.Grandine,
      m.Facciata, m.Centripugno, m.Breccia, m.Forzasegreta, m.Sub,
      m.Aeroassalto, m.Calmamente, m.Idropulsar, m.Psicoraggio, m.Psichico,
      m.Ipnosi, m.Schermoluce, m.Preveggenza, m.Incrocolpo, m.Divinazione,
      m.Rinfrescata, m.Megapugno, m.Gelopugno, m.Megacalcio, m.Corposcontro,
      m.Sdoppiatore, m.Contrattacco, m.MovimentoSismico, m.Mimica, m.Comete,
      m.Sostituto, m.Russare, m.Fangosberla, m.Ventogelato, m.Resistenza,
      m.Bullo, m.Tagliofuria, m.Sonnolalia, m.Dinamipugno, m.Psicamisu,
      m.Fascino, m.Fangata
    ],
    evolution: {stage: "stage1", to: []}
  },
  "56": {
    name: "Mankey",
    dexNumber: 56,
    type: ["Lotta"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 38
    },
    exp: 50,
    movesByLevel: {
      5: [m.Graffio, m.Fulmisguardo],
      6: [m.ColpoBasso],
      11: [m.Colpokarate],
      16: [m.Sfuriate],
      21: [m.Focalenergia],
      26: [m.MovimentoSismico],
      31: [m.Incrocolpo],
      36: [m.Bullo],
      41: [m.Stridio],
      46: [m.Colpo]
    },
    movesByMT: [
      m.Forza, m.Fulmine, m.Tuono, m.Terremoto, m.Fossa,
      m.Tossina, m.Doppioteam, m.Riposo, m.Furto, m.Protezione,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Codacciaio, m.Introforza,
      m.Pioggiadanza, m.Giornodisole, m.Spaccaroccia, m.Facciata, m.Centripugno,
      m.Provocazione, m.Breccia, m.Forzasegreta, m.Vampata, m.Rocciotomba,
      m.Aeroassalto, m.Granfisico, m.Contrattacco, m.Meditazione, m.Frana,
      m.Contropiede, m.Preveggenza, m.Picchiaduro, m.Maniereforti, m.Vendetta,
      m.Megapugno, m.Fuocopugno, m.Gelopugno, m.Tuonopugno, m.Megacalcio,
      m.Corposcontro, m.Sdoppiatore, m.MovimentoSismico, m.Mimica, m.Ricciolscudo,
      m.Metronomo, m.Comete, m.Sostituto, m.Russare, m.Fangosberla,
      m.Resistenza, m.Bullo, m.Sonnolalia, m.Dinamipugno, m.Psicamisu
    ],
    evolution: {stage: "base", to: [{species: "57", trigger: {kind: "level", level: 28}}]}
  },
  "57": {
    name: "Primeape",
    dexNumber: 57,
    type: ["Lotta"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 28,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Graffio, m.Fulmisguardo, m.ColpoBasso, m.Ira],
      11: [m.Colpokarate],
      16: [m.Sfuriate],
      21: [m.Focalenergia],
      26: [m.MovimentoSismico],
      35: [m.Incrocolpo],
      44: [m.Bullo],
      53: [m.Stridio],
      62: [m.Colpo]
    },
    movesByMT: [
      m.IperRaggio, m.Forza, m.Fulmine, m.Tuono, m.Terremoto,
      m.Fossa, m.Tossina, m.Doppioteam, m.Riposo, m.Furto,
      m.Protezione, m.Attrazione, m.Ritorno, m.Frustrazione, m.Codacciaio,
      m.Introforza, m.Pioggiadanza, m.Giornodisole, m.Spaccaroccia, m.Facciata,
      m.Centripugno, m.Provocazione, m.Breccia, m.Forzasegreta, m.Vampata,
      m.Rocciotomba, m.Aeroassalto, m.Granfisico, m.Contrattacco, m.Meditazione,
      m.Frana, m.Contropiede, m.Preveggenza, m.Picchiaduro, m.Maniereforti,
      m.Vendetta, m.Megapugno, m.Fuocopugno, m.Gelopugno, m.Tuonopugno,
      m.Megacalcio, m.Corposcontro, m.Sdoppiatore, m.MovimentoSismico, m.Mimica,
      m.Ricciolscudo, m.Metronomo, m.Comete, m.Sostituto, m.Russare,
      m.Fangosberla, m.Resistenza, m.Bullo, m.Sonnolalia, m.Dinamipugno,
      m.Psicamisu, m.Focalenergia, m.Incrocolpo, m.Altruismo
    ],
    evolution: {stage: "stage1", to: []}
  },
  "58": {
    name: "Growlithe",
    dexNumber: 58,
    type: ["Fuoco"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 5,
      maxLevel: 50
    },
    exp: 50,
    movesByLevel: {
      5: [m.Morso, m.Boato],
      7: [m.Braciere],
      13: [m.Fulmisguardo],
      19: [m.Segugio],
      25: [m.Riduttore],
      31: [m.Ruotafuoco],
      37: [m.Altruismo],
      43: [m.Agilita],
      49: [m.Lanciafiamme]
    },
    movesByMT: [
      m.Boato, m.Lanciafiamme, m.Forza, m.Fossa, m.Tossina,
      m.Doppioteam, m.Fuocobomba, m.Riposo, m.Furto, m.Protezione,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Codacciaio, m.Introforza,
      m.Giornodisole, m.Spaccaroccia, m.Facciata, m.Forzasegreta, m.Vampata,
      m.Aeroassalto, m.Corposcontro, m.Colpo, m.Turbofuoco, m.Salvaguardia,
      m.Sgranocchio, m.Ondacalda, m.Gridodilotta, m.Sdoppiatore, m.Mimica,
      m.Comete, m.Sostituto, m.Russare, m.Resistenza, m.Bullo,
      m.Sonnolalia, m.Riduttore, m.Morso, m.Fascino
    ],
    evolution: {stage: "base", to: [{species: "59", trigger: {kind: "item", item: i.pietrafocaia}}]}
  },
  "59": {
    name: "Arcanine",
    dexNumber: 59,
    type: ["Fuoco"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Morso, m.Boato, m.Braciere, m.Segugio],
      49: [m.Extrarapido]
    },
    movesByMT: [
      m.Boato, m.Lanciafiamme, m.IperRaggio, m.Forza, m.Fossa,
      m.Tossina, m.Doppioteam, m.Fuocobomba, m.Riposo, m.Furto,
      m.Protezione, m.Attrazione, m.Ritorno, m.Frustrazione, m.Codacciaio,
      m.Introforza, m.Giornodisole, m.Spaccaroccia, m.Facciata, m.Forzasegreta,
      m.Vampata, m.Aeroassalto, m.Corposcontro, m.Colpo, m.Turbofuoco,
      m.Salvaguardia, m.Sgranocchio, m.Ondacalda, m.Gridodilotta, m.Sdoppiatore,
      m.Mimica, m.Comete, m.Sostituto, m.Russare, m.Resistenza,
      m.Bullo, m.Sonnolalia, m.Riduttore, m.Morso, m.Fascino
    ],
    evolution: {stage: "stage1", to: []}
  },
  "60": {
    name: "Poliwag",
    dexNumber: 60,
    type: ["Acqua"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 30
    },
    exp: 50,
    movesByLevel: {
      5: [m.Botta, m.Bolla],
      7: [m.Ipnosi],
      13: [m.Pistolacqua],
      19: [m.Doppiasberla],
      25: [m.Pioggiadanza],
      31: [m.Corposcontro],
      37: [m.Panciamburo],
      43: [m.Idropompa]
    },
    movesByMT: [
      m.Surf, m.Geloraggio, m.Bora, m.Fossa, m.Tossina,
      m.Psichico, m.Doppioteam, m.Cascata, m.Riposo, m.Furto,
      m.Protezione, m.Attrazione, m.Ritorno, m.Frustrazione, m.Introforza,
      m.Pioggiadanza, m.Grandine, m.Facciata, m.Forzasegreta, m.Sub,
      m.Idropulsar, m.Nebbia, m.Bollaraggio, m.Nube, m.Splash,
      m.Leggimente, m.PallaGelo, m.Docciascudo, m.Corposcontro, m.Sdoppiatore,
      m.Mimica, m.Ricciolscudo, m.Sostituto, m.Russare, m.Ventogelato,
      m.Resistenza, m.Bullo, m.Sonnolalia, m.Dolcebacio
    ],
    evolution: {stage: "base", to: [{species: "61", trigger: {kind: "level", level: 25}}]}
  },
  "61": {
    name: "Poliwhirl",
    dexNumber: 61,
    type: ["Acqua"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 25,
      maxLevel: 50
    },
    exp: 100,
    movesByLevel: {
      5: [m.Bolla, m.Ipnosi, m.Pistolacqua],
      19: [m.Doppiasberla],
      27: [m.Pioggiadanza],
      35: [m.Corposcontro],
      43: [m.Panciamburo],
      51: [m.Idropompa]
    },
    movesByMT: [
      m.Surf, m.Geloraggio, m.Bora, m.Forza, m.Terremoto,
      m.Fossa, m.Tossina, m.Psichico, m.Doppioteam, m.Cascata,
      m.Riposo, m.Furto, m.Protezione, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Spaccaroccia, m.Grandine,
      m.Facciata, m.Centripugno, m.Breccia, m.Forzasegreta, m.Sub,
      m.Idropulsar, m.Nebbia, m.Bollaraggio, m.Nube, m.Splash,
      m.Leggimente, m.PallaGelo, m.Docciascudo, m.Megapugno, m.Gelopugno,
      m.Megacalcio, m.Corposcontro, m.Sdoppiatore, m.Contrattacco, m.MovimentoSismico,
      m.Mimica, m.Ricciolscudo, m.Metronomo, m.Sostituto, m.Russare,
      m.Fangosberla, m.Ventogelato, m.Resistenza, m.Bullo, m.Sonnolalia,
      m.Dolcebacio
    ],
    evolution: {stage: "stage1", to: [{species: "62", trigger: {kind: "item", item: i.pietraidrica}} , {species: "186", trigger: {kind: "item", item: i.roccia_di_re}}]}
  },
  "62": {
    name: "Poliwrath",
    dexNumber: 62,
    type: ["Acqua", "Lotta"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.Pistolacqua, m.Ipnosi, m.Doppiasberla, m.Sottomissione],
      51: [m.Leggimente]
    },
    movesByMT: [
      m.Surf, m.Geloraggio, m.Bora, m.IperRaggio, m.Forza,
      m.Terremoto, m.Fossa, m.Tossina, m.Psichico, m.Doppioteam,
      m.Cascata, m.Riposo, m.Furto, m.Protezione, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Spaccaroccia,
      m.Grandine, m.Facciata, m.Centripugno, m.Breccia, m.Forzasegreta,
      m.Sub, m.Rocciotomba, m.Granfisico, m.Idropulsar, m.Nebbia,
      m.Bollaraggio, m.Nube, m.Splash, m.Leggimente, m.PallaGelo,
      m.Docciascudo, m.Megapugno, m.Gelopugno, m.Megacalcio, m.Corposcontro,
      m.Sdoppiatore, m.Contrattacco, m.MovimentoSismico, m.Mimica, m.Ricciolscudo,
      m.Metronomo, m.Sostituto, m.Russare, m.Fangosberla, m.Ventogelato,
      m.Resistenza, m.Bullo, m.Sonnolalia, m.Dinamipugno, m.Idropompa,
      m.Altruismo, m.Dolcebacio
    ],
    evolution: {stage: "stage2", to: []}
  },
  "63": {
    name: "Abra",
    dexNumber: 63,
    type: ["Psico"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 21
    },
    exp: 50,
    movesByLevel: {
      5: [m.Confusione, m.Teletrasporto]
    },
    movesByMT: [
      m.Tossina, m.Psichico, m.Doppioteam, m.Schermoluce, m.Riflesso,
      m.Flash, m.Riposo, m.Furto, m.Protezione, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Salvaguardia, m.Codacciaio, m.Introforza,
      m.Pioggiadanza, m.Giornodisole, m.PallaOmbra, m.Attaccalite, m.Facciata,
      m.Centripugno, m.Provocazione, m.Scippo, m.Forzasegreta, m.Calmamente,
      m.Ondashock, m.Fuocopugno, m.Gelopugno, m.Tuonopugno, m.Barriera,
      m.Ripeti, m.Privazione, m.Megapugno, m.Megacalcio, m.Corposcontro,
      m.Sdoppiatore, m.Contrattacco, m.MovimentoSismico, m.Tuononda, m.Mimica,
      m.Metronomo, m.Mangiasogni, m.Sostituto, m.Incubo, m.Russare,
      m.Resistenza, m.Bullo, m.Sonnolalia, m.Dinamipugno, m.Psicamisu
    ],
    evolution: {stage: "base", to: [{species: "64", trigger: {kind: "level", level: 16}}]}
  },
  "64": {
    name: "Kadabra",
    dexNumber: 64,
    type: ["Psico"],
    gender: ["Maschio", "Femmina"],
    spriteGendered: true,
    encounter: {
      rarity: "u",
      minLevel: 16,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Teletrasporto, m.Cinesi, m.Confusione],
      18: [m.Inibitore],
      21: [m.Psicoraggio],
      23: [m.Riflesso],
      25: [m.Ripresa],
      30: [m.Divinazione],
      33: [],
      36: [m.Psichico],
      43: [m.Raggiro]
    },
    movesByMT: [
      m.Tossina, m.Psichico, m.Doppioteam, m.Schermoluce, m.Riflesso,
      m.Flash, m.Riposo, m.Furto, m.Protezione, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Salvaguardia, m.Codacciaio, m.Introforza,
      m.Pioggiadanza, m.Giornodisole, m.PallaOmbra, m.Attaccalite, m.Facciata,
      m.Centripugno, m.Provocazione, m.Scippo, m.Forzasegreta, m.Calmamente,
      m.Ondashock, m.Fuocopugno, m.Gelopugno, m.Tuonopugno, m.Barriera,
      m.Ripeti, m.Privazione, m.Megapugno, m.Megacalcio, m.Corposcontro,
      m.Sdoppiatore, m.Contrattacco, m.MovimentoSismico, m.Tuononda, m.Mimica,
      m.Metronomo, m.Mangiasogni, m.Sostituto, m.Incubo, m.Russare,
      m.Resistenza, m.Bullo, m.Sonnolalia, m.Dinamipugno, m.Psicamisu
    ],
    evolution: {stage: "stage1", to: [{species: "65", trigger: {kind: "item", item: i.filo_dell_unione}}]}
  },
  "65": {
    name: "Alakazam",
    dexNumber: 65,
    type: ["Psico"],
    gender: ["Maschio", "Femmina"],
    spriteGendered: true,
    encounter: {
      rarity: "r",
      minLevel: 55,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.Teletrasporto, m.Cinesi, m.Confusione],
      18: [m.Inibitore],
      21: [m.Psicoraggio],
      23: [m.Riflesso],
      25: [m.Ripresa],
      30: [m.Divinazione],
      33: [m.Calmamente],
      36: [m.Psichico],
      43: [m.Raggiro]
    },
    movesByMT: [
      m.IperRaggio, m.Tossina, m.Psichico, m.Doppioteam, m.Schermoluce,
      m.Riflesso, m.Flash, m.Riposo, m.Furto, m.Protezione,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Salvaguardia, m.Codacciaio,
      m.Introforza, m.Pioggiadanza, m.Giornodisole, m.PallaOmbra, m.Attaccalite,
      m.Facciata, m.Centripugno, m.Provocazione, m.Scippo, m.Forzasegreta,
      m.Calmamente, m.Ondashock, m.Fuocopugno, m.Gelopugno, m.Tuonopugno,
      m.Barriera, m.Ripeti, m.Privazione, m.Megapugno, m.Megacalcio,
      m.Corposcontro, m.Sdoppiatore, m.Contrattacco, m.MovimentoSismico, m.Tuononda,
      m.Mimica, m.Metronomo, m.Mangiasogni, m.Sostituto, m.Incubo,
      m.Russare, m.Resistenza, m.Bullo, m.Sonnolalia, m.Dinamipugno,
      m.Psicamisu
    ],
    evolution: {stage: "stage2", to: []}
  },
  "66": {
    name: "Machop",
    dexNumber: 66,
    type: ["Lotta"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 33
    },
    exp: 50,
    movesByLevel: {
      5: [m.ColpoBasso, m.Fulmisguardo],
      7: [m.Focalenergia],
      13: [m.Colpokarate],
      19: [m.MovimentoSismico],
      22: [m.Preveggenza],
      25: [m.Vendetta],
      31: [m.Vitaltiro],
      37: [m.Sottomissione],
      40: [m.Incrocolpo],
      43: [m.Visotruce],
      49: [m.Dinamipugno]
    },
    movesByMT: [
      m.Lanciafiamme, m.Forza, m.Terremoto, m.Fossa, m.Tossina,
      m.Doppioteam, m.Fuocobomba, m.Riposo, m.Furto, m.Protezione,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Introforza, m.Pioggiadanza,
      m.Giornodisole, m.Spaccaroccia, m.Facciata, m.Centripugno, m.Breccia,
      m.Forzasegreta, m.Rocciotomba, m.Granfisico, m.Calciorullo, m.Contrattacco,
      m.Meditazione, m.Schermoluce, m.Frana, m.Ripeti, m.Maniereforti,
      m.Megapugno, m.Fuocopugno, m.Gelopugno, m.Tuonopugno, m.Megacalcio,
      m.Corposcontro, m.Sdoppiatore, m.MovimentoSismico, m.Mimica, m.Metronomo,
      m.Sostituto, m.Russare, m.Fangosberla, m.Resistenza, m.Bullo,
      m.Sonnolalia, m.Dinamipugno
    ],
    evolution: {stage: "base", to: [{species: "67", trigger: {kind: "level", level: 28}}]}
  },
  "67": {
    name: "Machoke",
    dexNumber: 67,
    type: ["Lotta"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 28,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.ColpoBasso, m.Fulmisguardo, m.Focalenergia],
      13: [m.Colpokarate],
      19: [m.MovimentoSismico],
      22: [m.Preveggenza],
      25: [m.Vendetta],
      33: [m.Vitaltiro],
      41: [m.Sottomissione],
      46: [m.Incrocolpo],
      51: [m.Visotruce],
      59: [m.Dinamipugno]
    },
    movesByMT: [
      m.Lanciafiamme, m.Forza, m.Terremoto, m.Fossa, m.Tossina,
      m.Doppioteam, m.Fuocobomba, m.Riposo, m.Furto, m.Protezione,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Introforza, m.Pioggiadanza,
      m.Giornodisole, m.Spaccaroccia, m.Facciata, m.Centripugno, m.Breccia,
      m.Forzasegreta, m.Rocciotomba, m.Granfisico, m.Calciorullo, m.Contrattacco,
      m.Meditazione, m.Schermoluce, m.Frana, m.Ripeti, m.Maniereforti,
      m.Megapugno, m.Fuocopugno, m.Gelopugno, m.Tuonopugno, m.Megacalcio,
      m.Corposcontro, m.Sdoppiatore, m.MovimentoSismico, m.Mimica, m.Metronomo,
      m.Sostituto, m.Russare, m.Fangosberla, m.Resistenza, m.Bullo,
      m.Sonnolalia, m.Dinamipugno
    ],
    evolution: {stage: "stage1", to: [{species: "68", trigger: {kind: "item", item: i.filo_dell_unione}}]}
  },
  "68": {
    name: "Machamp",
    dexNumber: 68,
    type: ["Lotta"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 55,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.ColpoBasso, m.Fulmisguardo, m.Focalenergia],
      13: [m.Colpokarate],
      19: [m.MovimentoSismico],
      22: [m.Preveggenza],
      25: [m.Vendetta],
      33: [m.Vitaltiro],
      41: [m.Sottomissione],
      46: [m.Incrocolpo],
      51: [m.Visotruce],
      59: [m.Dinamipugno]
    },
    movesByMT: [
      m.Lanciafiamme, m.IperRaggio, m.Forza, m.Terremoto, m.Fossa,
      m.Tossina, m.Doppioteam, m.Fuocobomba, m.Riposo, m.Furto,
      m.Protezione, m.Attrazione, m.Ritorno, m.Frustrazione, m.Introforza,
      m.Pioggiadanza, m.Giornodisole, m.Spaccaroccia, m.Facciata, m.Centripugno,
      m.Breccia, m.Forzasegreta, m.Rocciotomba, m.Granfisico, m.Calciorullo,
      m.Contrattacco, m.Meditazione, m.Schermoluce, m.Frana, m.Ripeti,
      m.Maniereforti, m.Megapugno, m.Fuocopugno, m.Gelopugno, m.Tuonopugno,
      m.Megacalcio, m.Corposcontro, m.Sdoppiatore, m.MovimentoSismico, m.Mimica,
      m.Metronomo, m.Sostituto, m.Russare, m.Fangosberla, m.Resistenza,
      m.Bullo, m.Sonnolalia, m.Dinamipugno
    ],
    evolution: {stage: "stage2", to: []}
  },
  "69": {
    name: "Bellsprout",
    dexNumber: 69,
    type: ["Erba", "Veleno"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 26
    },
    exp: 50,
    movesByLevel: {
      5: [m.Frustata],
      6: [m.Crescita],
      11: [m.Avvolgibotta],
      15: [m.Sonnifero],
      17: [m.Velenpolvere],
      19: [m.Paralizzante],
      23: [m.Acido],
      30: [m.Profumino],
      37: [m.Foglielama],
      45: [m.Schianto]
    },
    movesByMT: [
      m.Taglio, m.Solarraggio, m.Tossina, m.Doppioteam, m.Flash,
      m.Riposo, m.Furto, m.Protezione, m.Fangobomba, m.Gigassorbimento,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Introforza, m.Giornodisole,
      m.Facciata, m.Forzasegreta, m.Semitraglia, m.Danzaspada, m.Riflesso,
      m.Sanguisuga, m.Ripeti, m.Sintesi, m.Radicamento, m.Fogliamagica,
      m.Sdoppiatore, m.Mimica, m.Sostituto, m.Russare, m.Resistenza,
      m.Bullo, m.Sonnolalia, m.Strampadanza
    ],
    evolution: {stage: "base", to: [{species: "70", trigger: {kind: "level", level: 21}}]}
  },
  "70": {
    name: "Weepinbell",
    dexNumber: 70,
    type: ["Erba", "Veleno"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 21,
      maxLevel: 50
    },
    exp: 100,
    movesByLevel: {
      5: [m.Frustata, m.Crescita, m.Avvolgibotta],
      15: [m.Sonnifero],
      17: [m.Velenpolvere],
      19: [m.Paralizzante],
      24: [m.Acido],
      33: [m.Profumino],
      42: [m.Foglielama],
      54: [m.Schianto]
    },
    movesByMT: [
      m.Taglio, m.Solarraggio, m.Tossina, m.Doppioteam, m.Flash,
      m.Riposo, m.Furto, m.Protezione, m.Fangobomba, m.Gigassorbimento,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Introforza, m.Giornodisole,
      m.Facciata, m.Forzasegreta, m.Semitraglia, m.Danzaspada, m.Riflesso,
      m.Sanguisuga, m.Ripeti, m.Sintesi, m.Radicamento, m.Fogliamagica,
      m.Sdoppiatore, m.Mimica, m.Sostituto, m.Russare, m.Resistenza,
      m.Bullo, m.Sonnolalia, m.Profumino, m.Mattindoro, m.Strampadanza
    ],
    evolution: {stage: "stage1", to: [{species: "71", trigger: {kind: "item", item: i.pietrafoglia}}]}
  },
  "71": {
    name: "Victreebel",
    dexNumber: 71,
    type: ["Erba", "Veleno"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [
        m.Frustata,
        m.Sonnifero,
        m.Profumino,
        m.Foglielama
      ]
    },
    movesByMT: [
      m.Taglio, m.IperRaggio, m.Solarraggio, m.Tossina, m.Doppioteam,
      m.Flash, m.Riposo, m.Furto, m.Protezione, m.Fangobomba,
      m.Gigassorbimento, m.Attrazione, m.Ritorno, m.Frustrazione, m.Introforza,
      m.Giornodisole, m.Facciata, m.Forzasegreta, m.Semitraglia, m.Danzaspada,
      m.Riflesso, m.Sanguisuga, m.Ripeti, m.Sintesi, m.Radicamento,
      m.Fogliamagica, m.Corposcontro, m.Sdoppiatore, m.Mimica, m.Sostituto,
      m.Russare, m.Resistenza, m.Bullo, m.Sonnolalia, m.Profumino,
      m.Mattindoro, m.Strampadanza
    ],
    evolution: {stage: "stage2", to: []}
  },
  "72": {
    name: "Tentacool",
    dexNumber: 72,
    type: ["Acqua", "Veleno"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 40
    },
    exp: 50,
    movesByLevel: {
      5: [m.Velenospina],
      6: [m.Supersuono],
      12: [m.Limitazione],
      19: [m.Acido],
      25: [m.Bollaraggio],
      30: [m.Avvolgibotta],
      36: [m.Barriera],
      43: [m.Stridio],
      49: [m.Idropompa]
    },
    movesByMT: [
      m.Taglio, m.Surf, m.Geloraggio, m.Bora, m.Tossina,
      m.Doppioteam, m.Cascata, m.Riposo, m.Furto, m.Protezione,
      m.Fangobomba, m.Gigassorbimento, m.Attrazione, m.Ritorno, m.Frustrazione,
      m.Introforza, m.Pioggiadanza, m.Grandine, m.Facciata, m.Forzasegreta,
      m.Sub, m.Idropulsar, m.Raggiaurora, m.Stordiraggio, m.Nube,
      m.Salvaguardia, m.Rapigiro, m.Specchiovelo, m.Danzaspada, m.Sdoppiatore,
      m.Mimica, m.Sostituto, m.Russare, m.Ventogelato, m.Resistenza,
      m.Bullo, m.Sonnolalia
    ],
    evolution: {stage: "base", to: [{species: "73", trigger: {kind: "level", level: 30}}]}
  },
  "73": {
    name: "Tentacruel",
    dexNumber: 73,
    type: ["Acqua", "Veleno"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 30,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Velenospina, m.Supersuono, m.Limitazione],
      19: [m.Acido],
      25: [m.Bollaraggio],
      30: [m.Avvolgibotta],
      38: [m.Barriera],
      47: [m.Stridio],
      55: [m.Idropompa]
    },
    movesByMT: [
      m.Taglio, m.Surf, m.Geloraggio, m.Bora, m.IperRaggio,
      m.Tossina, m.Doppioteam, m.Cascata, m.Riposo, m.Furto,
      m.Protezione, m.Fangobomba, m.Gigassorbimento, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Grandine, m.Facciata,
      m.Forzasegreta, m.Sub, m.Idropulsar, m.Raggiaurora, m.Stordiraggio,
      m.Nube, m.Salvaguardia, m.Rapigiro, m.Specchiovelo, m.Danzaspada,
      m.Sdoppiatore, m.Mimica, m.Sostituto, m.Russare, m.Ventogelato,
      m.Resistenza, m.Bullo, m.Sonnolalia
    ],
    evolution: {stage: "stage1", to: []}
  },
  "74": {
    name: "Geodude",
    dexNumber: 74,
    type: ["Roccia", "Terra"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 30
    },
    exp: 50,
    movesByLevel: {
      5: [m.Azione, m.Ricciolscudo],
      6: [m.Fangata],
      11: [m.Sassata],
      16: [m.Magnitudo],
      21: [m.Autodistruzione],
      26: [m.Rotolamento],
      31: [m.Cadutamassi],
      36: [m.Terremoto],
      41: [m.Esplosione],
      46: [m.Sdoppiatore]
    },
    movesByMT: [
      m.Lanciafiamme, m.Forza, m.Terremoto, m.Fossa, m.Tossina,
      m.Doppioteam, m.Fuocobomba, m.Riposo, m.Protezione, m.Terrempesta,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Introforza, m.Giornodisole,
      m.Spaccaroccia, m.Facciata, m.Centripugno, m.Breccia, m.Forzasegreta,
      m.Rocciotomba, m.Megapugno, m.Frana, m.Blocco, m.Fuocopugno,
      m.Corposcontro, m.Sdoppiatore, m.Contrattacco, m.MovimentoSismico, m.Mimica,
      m.Ricciolscudo, m.Metronomo, m.Autodistruzione, m.Esplosione, m.Sostituto,
      m.Russare, m.Fangosberla, m.Resistenza, m.Rotolamento, m.Bullo,
      m.Sonnolalia, m.Dinamipugno
    ],
    evolution: {stage: "base", to: [{species: "75", trigger: {kind: "level", level: 25}}]}
  },
  "75": {
    name: "Graveler",
    dexNumber: 75,
    type: ["Roccia", "Terra"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 25,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Azione, m.Ricciolscudo, m.Fangata, m.Sassata],
      16: [m.Magnitudo],
      21: [m.Autodistruzione],
      29: [m.Rotolamento],
      37: [m.Cadutamassi],
      45: [m.Terremoto],
      53: [m.Esplosione],
      62: [m.Sdoppiatore]
    },
    movesByMT: [
      m.Lanciafiamme, m.Forza, m.Terremoto, m.Fossa, m.Tossina,
      m.Doppioteam, m.Fuocobomba, m.Riposo, m.Protezione, m.Terrempesta,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Introforza, m.Giornodisole,
      m.Spaccaroccia, m.Facciata, m.Centripugno, m.Breccia, m.Forzasegreta,
      m.Rocciotomba, m.Megapugno, m.Frana, m.Blocco, m.Fuocopugno,
      m.Corposcontro, m.Sdoppiatore, m.Contrattacco, m.MovimentoSismico, m.Mimica,
      m.Ricciolscudo, m.Metronomo, m.Autodistruzione, m.Esplosione, m.Sostituto,
      m.Russare, m.Fangosberla, m.Resistenza, m.Rotolamento, m.Bullo,
      m.Sonnolalia, m.Dinamipugno
    ],
    evolution: {stage: "stage1", to: [{species: "76", trigger: {kind: "item", item: i.filo_dell_unione}}]}
  },
  "76": {
    name: "Golem",
    dexNumber: 76,
    type: ["Roccia", "Terra"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 50,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.Azione, m.Ricciolscudo, m.Fangata, m.Sassata],
      16: [m.Magnitudo],
      21: [m.Autodistruzione],
      29: [m.Rotolamento],
      37: [m.Cadutamassi],
      45: [m.Terremoto],
      53: [m.Esplosione],
      62: [m.Sdoppiatore]
    },
    movesByMT: [
      m.Boato, m.Lanciafiamme, m.IperRaggio, m.Forza, m.Terremoto,
      m.Fossa, m.Tossina, m.Doppioteam, m.Fuocobomba, m.Riposo,
      m.Protezione, m.Terrempesta, m.Attrazione, m.Ritorno, m.Frustrazione,
      m.Introforza, m.Giornodisole, m.Spaccaroccia, m.Facciata, m.Centripugno,
      m.Breccia, m.Forzasegreta, m.Rocciotomba, m.Megapugno, m.Frana,
      m.Blocco, m.Fuocopugno, m.Megacalcio, m.Corposcontro, m.Sdoppiatore,
      m.Contrattacco, m.MovimentoSismico, m.Mimica, m.Ricciolscudo, m.Metronomo,
      m.Autodistruzione, m.Esplosione, m.Sostituto, m.Russare, m.Fangosberla,
      m.Resistenza, m.Rotolamento, m.Bullo, m.Tagliofuria, m.Sonnolalia,
      m.Dinamipugno
    ],
    evolution: {stage: "stage2", to: []}
  },
  "77": {
    name: "Ponyta",
    dexNumber: 77,
    type: ["Fuoco"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 50
    },
    exp: 50,
    movesByLevel: {
      5: [m.AttaccoRapido, m.Ruggito],
      9: [m.Colpocoda],
      14: [m.Braciere],
      19: [m.Pestone],
      25: [m.Turbofuoco],
      31: [m.Riduttore],
      38: [m.Agilita],
      45: [m.Rimbalzo],
      53: [m.Fuocobomba]
    },
    movesByMT: [
      m.Lanciafiamme, m.Forza, m.Solarraggio, m.Tossina, m.Doppioteam,
      m.Fuocobomba, m.Riposo, m.Protezione, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Codacciaio, m.Introforza, m.Giornodisole, m.Facciata,
      m.Forzasegreta, m.Vampata, m.Doppiocalcio, m.Colpo, m.Sdoppiatore,
      m.Ipnosi, m.Ruotafuoco, m.Fascino, m.Corposcontro, m.Mimica,
      m.Comete, m.Sostituto, m.Russare, m.Resistenza, m.Bullo,
      m.Sonnolalia
    ],
    evolution: {stage: "base", to: [{species: "78", trigger: {kind: "level", level: 40}}]}
  },
  "78": {
    name: "Rapidash",
    dexNumber: 78,
    type: ["Fuoco"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.AttaccoRapido, m.Ruggito, m.Colpocoda, m.Braciere],
      19: [m.Pestone],
      25: [m.Turbofuoco],
      31: [m.Riduttore],
      38: [m.Agilita],
      40: [m.Furia],
      50: [m.Rimbalzo],
      63: [m.Fuocobomba]
    },
    movesByMT: [
      m.Lanciafiamme, m.IperRaggio, m.Forza, m.Solarraggio, m.Tossina,
      m.Doppioteam, m.Fuocobomba, m.Riposo, m.Protezione, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Codacciaio, m.Introforza, m.Giornodisole,
      m.Facciata, m.Forzasegreta, m.Vampata, m.Doppiocalcio, m.Colpo,
      m.Sdoppiatore, m.Ipnosi, m.Ruotafuoco, m.Fascino, m.Corposcontro,
      m.Mimica, m.Comete, m.Sostituto, m.Russare, m.Resistenza,
      m.Bullo, m.Sonnolalia, m.Staffetta
    ],
    evolution: {stage: "stage1", to: []}
  },
  "79": {
    name: "Slowpoke",
    dexNumber: 79,
    type: ["Acqua", "Psico"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 47
    },
    exp: 50,
    movesByLevel: {
      5: [m.Maledizione, m.Sbadiglio, m.Azione],
      6: [m.Ruggito],
      13: [m.Pistolacqua],
      17: [m.Confusione],
      24: [m.Inibitore],
      29: [m.Bottintesta],
      36: [m.Amnesia],
      40: [m.Psichico],
      47: [m.Psicamisu]
    },
    movesByMT: [
      m.Lanciafiamme, m.Surf, m.Geloraggio, m.Bora, m.Forza,
      m.Terremoto, m.Fossa, m.Tossina, m.Psichico, m.Doppioteam,
      m.Fuocobomba, m.Flash, m.Riposo, m.Protezione, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Salvaguardia, m.Codacciaio, m.Introforza,
      m.Pioggiadanza, m.Giornodisole, m.PallaOmbra, m.Grandine, m.Facciata,
      m.Forzasegreta, m.Sub, m.Calmamente, m.Idropulsar, m.Pestone,
      m.Russare, m.Panciamburo, m.Sonnolalia, m.Divinazione, m.Fangata,
      m.Corposcontro, m.Sdoppiatore, m.Tuononda, m.Mimica, m.Comete,
      m.Mangiasogni, m.Sostituto, m.Incubo, m.Fangosberla, m.Ventogelato,
      m.Resistenza, m.Bullo, m.Psicamisu
    ],
    evolution: {stage: "base", to: [{species: "80", trigger: {kind: "level", level: 37}} , {species: "199", trigger: {kind: "item", item: i.roccia_di_re}}]}
  },
  "80": {
    name: "Slowbro",
    dexNumber: 80,
    type: ["Acqua", "Psico"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 37,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Maledizione, m.Sbadiglio, m.Azione, m.Ruggito],
      13: [m.Pistolacqua],
      17: [m.Confusione],
      24: [m.Inibitore],
      29: [m.Bottintesta],
      36: [m.Amnesia],
      37: [m.Ritirata],
      44: [m.Psichico],
      55: [m.Psicamisu]
    },
    movesByMT: [
      m.Lanciafiamme, m.Surf, m.Geloraggio, m.Bora, m.IperRaggio,
      m.Forza, m.Terremoto, m.Fossa, m.Tossina, m.Psichico,
      m.Doppioteam, m.Fuocobomba, m.Flash, m.Riposo, m.Protezione,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Salvaguardia, m.Codacciaio,
      m.Introforza, m.Pioggiadanza, m.Giornodisole, m.PallaOmbra, m.Spaccaroccia,
      m.Grandine, m.Facciata, m.Centripugno, m.Breccia, m.Forzasegreta,
      m.Sub, m.Calmamente, m.Idropulsar, m.Pestone, m.Russare,
      m.Panciamburo, m.Sonnolalia, m.Divinazione, m.Fangata, m.Megapugno,
      m.Gelopugno, m.Megacalcio, m.Corposcontro, m.Sdoppiatore, m.Contrattacco,
      m.MovimentoSismico, m.Tuononda, m.Mimica, m.Comete, m.Mangiasogni,
      m.Sostituto, m.Incubo, m.Fangosberla, m.Ventogelato, m.Resistenza,
      m.Bullo, m.Tagliofuria, m.Dinamipugno, m.Psicamisu
    ],
    evolution: {stage: "stage1", to: []}
  },
  "81": {
    name: "Magnemite",
    dexNumber: 81,
    type: ["Elettro", "Acciaio"],
    gender: [],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 40
    },
    exp: 50,
    movesByLevel: {
      5: [m.Ferrostrido, m.Azione],
      6: [m.Tuonoshock],
      11: [m.Supersuono],
      16: [m.Sonicboom],
      21: [m.Tuononda],
      26: [m.Scintilla],
      32: [m.Localizza],
      38: [m.Comete],
      44: [m.Stridio],
      50: [m.Falcecannone]
    },
    movesByMT: [
      m.Fulmine, m.Tuono, m.Tossina, m.Doppioteam, m.Riflesso,
      m.Flash, m.Riposo, m.Protezione, m.Ritorno, m.Frustrazione,
      m.Introforza, m.Pioggiadanza, m.Giornodisole, m.Facciata, m.Forzasegreta,
      m.Ondashock, m.Sdoppiatore, m.Tuononda, m.Mimica, m.Comete,
      m.Sostituto, m.Russare, m.Resistenza, m.Rotolamento, m.Bullo,
      m.Sonnolalia
    ],
    evolution: {stage: "base", to: [{species: "82", trigger: {kind: "level", level: 30}}]}
  },
  "82": {
    name: "Magneton",
    dexNumber: 82,
    type: ["Elettro", "Acciaio"],
    gender: [],
    encounter: {
      rarity: "u",
      minLevel: 30,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Ferrostrido, m.Azione, m.Tuonoshock, m.Supersuono],
      16: [m.Sonicboom],
      21: [m.Tuononda],
      26: [m.Scintilla],
      35: [m.Localizza],
      44: [m.Tripletta],
      53: [m.Stridio],
      62: [m.Falcecannone]
    },
    movesByMT: [
      m.IperRaggio, m.Fulmine, m.Tuono, m.Tossina, m.Doppioteam,
      m.Riflesso, m.Flash, m.Riposo, m.Protezione, m.Ritorno,
      m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Giornodisole, m.Facciata,
      m.Forzasegreta, m.Ondashock, m.Sdoppiatore, m.Tuononda, m.Mimica,
      m.Comete, m.Sostituto, m.Russare, m.Resistenza, m.Rotolamento,
      m.Bullo, m.Sonnolalia, m.Rinfrescata
    ],
    evolution: {stage: "stage1", to: []}
  },
  "83": {
    name: "Farfetch'd",
    dexNumber: 83,
    type: ["Normale", "Volante"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Beccata],
      6: [m.Turbosabbia],
      11: [m.Fulmisguardo],
      16: [m.Furia],
      21: [m.Privazione],
      26: [m.Tagliofuria],
      31: [m.Danzaspada],
      36: [m.Agilita],
      41: [m.Lacerazione],
      46: [m.Falsofinale]
    },
    movesByMT: [
      m.Taglio, m.Volo, m.Tossina, m.Doppioteam, m.Riposo,
      m.Furto, m.Protezione, m.Alacciaio, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Codacciaio, m.Introforza, m.Giornodisole, m.Facciata,
      m.Forzasegreta, m.Aeroassalto, m.Raffica, m.AttaccoRapido, m.Speculmossa,
      m.Maledizione, m.Flagello, m.Preveggenza, m.Danzadipiume, m.Danzaspada,
      m.Corposcontro, m.Sdoppiatore, m.Mimica, m.Comete, m.Sostituto,
      m.Russare, m.Fangosberla, m.Resistenza, m.Bullo, m.Sonnolalia,
      m.Psicamisu, m.Lacerazione, m.Staffetta, m.Desiderio, m.Sbadiglio
    ],
    evolution: {stage: "base", to: []}
  },
  "84": {
    name: "Doduo",
    dexNumber: 84,
    type: ["Normale", "Volante"],
    gender: ["Maschio", "Femmina"],
    spriteGendered: true,
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 41
    },
    exp: 50,
    movesByLevel: {
      5: [m.Beccata, m.Ruggito],
      9: [m.Inseguimento],
      13: [m.Furia],
      21: [m.Tripletta],
      25: [m.Ira],
      33: [m.Baraonda],
      37: [m.Perforbecco],
      45: [m.Agilita]
    },
    movesByMT: [
      m.Volo, m.Tossina, m.Doppioteam, m.Riposo, m.Furto,
      m.Protezione, m.Alacciaio, m.Attrazione, m.Ritorno, m.Frustrazione,
      m.Introforza, m.Giornodisole, m.Facciata, m.Forzasegreta, m.Aeroassalto,
      m.Supersuono, m.AttaccoRapido, m.Nube, m.Flagello, m.Finta,
      m.Rimonta, m.Corposcontro, m.Sdoppiatore, m.Mimica, m.Comete,
      m.Aeroattacco, m.Sostituto, m.Russare, m.Fangosberla, m.Resistenza,
      m.Bullo, m.Sonnolalia
    ],
    evolution: {stage: "base", to: [{species: "85", trigger: {kind: "level", level: 31}}]}
  },
  "85": {
    name: "Dodrio",
    dexNumber: 85,
    type: ["Normale", "Volante"],
    gender: ["Maschio", "Femmina"],
    spriteGendered: true,
    encounter: {
      rarity: "u",
      minLevel: 31,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Beccata, m.Ruggito, m.Inseguimento, m.Furia],
      21: [m.Tripletta],
      25: [m.Ira],
      38: [m.Baraonda],
      47: [m.Perforbecco],
      60: [m.Agilita]
    },
    movesByMT: [
      m.Volo, m.IperRaggio, m.Tossina, m.Doppioteam, m.Riposo,
      m.Furto, m.Protezione, m.Alacciaio, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Introforza, m.Giornodisole, m.Attaccalite, m.Facciata,
      m.Provocazione, m.Forzasegreta, m.Aeroassalto, m.Supersuono, m.AttaccoRapido,
      m.Nube, m.Flagello, m.Finta, m.Rimonta, m.Corposcontro,
      m.Sdoppiatore, m.Mimica, m.Comete, m.Aeroattacco, m.Sostituto,
      m.Russare, m.Fangosberla, m.Resistenza, m.Bullo, m.Sonnolalia,
      m.Perforbecco, m.Agilita, m.Tripletta, m.Staffetta
    ],
    evolution: {stage: "stage1", to: []}
  },
  "86": {
    name: "Seel",
    dexNumber: 86,
    type: ["Acqua"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 44
    },
    exp: 50,
    movesByLevel: {
      5: [m.Bottintesta],
      9: [m.Ruggito],
      17: [m.Ventogelato],
      21: [m.Raggiaurora],
      29: [m.Riposo],
      37: [m.Riduttore],
      41: [m.Geloraggio],
      49: [m.Salvaguardia]
    },
    movesByMT: [
      m.Surf, m.Geloraggio, m.Bora, m.Tossina, m.Doppioteam,
      m.Cascata, m.Riposo, m.Furto, m.Protezione, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Salvaguardia, m.Introforza, m.Pioggiadanza,
      m.Grandine, m.Facciata, m.Forzasegreta, m.Sub, m.Idropulsar,
      m.Schianto, m.Perforcorno, m.Inibitore, m.Leccata, m.Ultimocanto,
      m.Ripeti, m.Bruciapelo, m.Gelolancia, m.Corposcontro, m.Sdoppiatore,
      m.Mimica, m.Sostituto, m.Russare, m.Ventogelato, m.Resistenza,
      m.Bullo, m.Sonnolalia, m.Altruismo
    ],
    evolution: {stage: "base", to: [{species: "87", trigger: {kind: "level", level: 34}}]}
  },
  "87": {
    name: "Dewgong",
    dexNumber: 87,
    type: ["Acqua", "Ghiaccio"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 34,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Segnoraggio, m.Bottintesta, m.Ruggito, m.Ventogelato, m.Raggiaurora],
      29: [m.Riposo],
      34: [m.Purogelo],
      42: [m.Riduttore],
      51: [m.Geloraggio],
      64: [m.Salvaguardia]
    },
    movesByMT: [
      m.Surf, m.Geloraggio, m.Bora, m.IperRaggio, m.Tossina,
      m.Doppioteam, m.Cascata, m.Riposo, m.Furto, m.Protezione,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Salvaguardia, m.Introforza,
      m.Pioggiadanza, m.Grandine, m.Facciata, m.Forzasegreta, m.Sub,
      m.Idropulsar, m.Schianto, m.Perforcorno, m.Inibitore, m.Leccata,
      m.Ultimocanto, m.Ripeti, m.Bruciapelo, m.Gelolancia, m.Corposcontro,
      m.Sdoppiatore, m.Mimica, m.Sostituto, m.Russare, m.Ventogelato,
      m.Resistenza, m.Bullo, m.Sonnolalia, m.Altruismo
    ],
    evolution: {stage: "stage1", to: []}
  },
  "88": {
    name: "Grimer",
    dexNumber: 88,
    type: ["Veleno"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 48
    },
    exp: 50,
    movesByLevel: {
      5: [m.Velenogas, m.Botta, m.Rafforzatore],
      8: [m.Inibitore],
      13: [m.Fango],
      19: [m.Minimizzato],
      26: [m.Stridio],
      34: [m.ScudoAcido],
      43: [m.Fangobomba],
      53: [m.Memento]
    },
    movesByMT: [
      m.Lanciafiamme, m.Fulmine, m.Tuono, m.Fossa, m.Tossina,
      m.Doppioteam, m.Fuocobomba, m.Riposo, m.Furto, m.Protezione,
      m.Fangobomba, m.Gigassorbimento, m.Attrazione, m.Ritorno, m.Frustrazione,
      m.Introforza, m.Pioggiadanza, m.Giornodisole, m.Attaccalite, m.Facciata,
      m.Provocazione, m.Forzasegreta, m.Rocciotomba, m.Ondashock, m.Nube,
      m.Leccata, m.Esplosione, m.Maledizione, m.Malosguardo, m.Esclusiva,
      m.Pugnodombra, m.Fuocopugno, m.Gelopugno, m.Tuonopugno, m.Corposcontro,
      m.Mimica, m.Autodistruzione, m.Sostituto, m.Russare, m.Fangosberla,
      m.Resistenza, m.Bullo, m.Sonnolalia, m.Dinamipugno, m.Minimizzato,
      m.Altruismo
    ],
    evolution: {stage: "base", to: [{species: "89", trigger: {kind: "level", level: 38}}]}
  },
  "89": {
    name: "Muk",
    dexNumber: 89,
    type: ["Veleno"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 38,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Velenogas, m.Botta, m.Rafforzatore],
      8: [m.Inibitore],
      13: [m.Fango],
      19: [m.Minimizzato],
      26: [m.Stridio],
      34: [m.ScudoAcido],
      47: [m.Fangobomba],
      61: [m.Memento]
    },
    movesByMT: [
      m.Lanciafiamme, m.IperRaggio, m.Forza, m.Fulmine, m.Tuono,
      m.Fossa, m.Tossina, m.Doppioteam, m.Fuocobomba, m.Riposo,
      m.Furto, m.Protezione, m.Fangobomba, m.Gigassorbimento, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Giornodisole,
      m.Spaccaroccia, m.Attaccalite, m.Facciata, m.Centripugno, m.Provocazione,
      m.Breccia, m.Forzasegreta, m.Rocciotomba, m.Ondashock, m.Nube,
      m.Leccata, m.Esplosione, m.Maledizione, m.Malosguardo, m.Esclusiva,
      m.Pugnodombra, m.Fuocopugno, m.Gelopugno, m.Tuonopugno, m.Corposcontro,
      m.Mimica, m.Autodistruzione, m.Sostituto, m.Russare, m.Fangosberla,
      m.Resistenza, m.Bullo, m.Sonnolalia, m.Dinamipugno, m.Minimizzato,
      m.Altruismo
    ],
    evolution: {stage: "stage1", to: []}
  },
  "90": {
    name: "Shellder",
    dexNumber: 90,
    type: ["Acqua"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 50
    },
    exp: 50,
    movesByLevel: {
      5: [m.Azione, m.Ritirata],
      8: [m.Gelolancia],
      15: [m.Supersuono],
      22: [m.Raggiaurora],
      29: [m.Protezione],
      36: [m.Fulmisguardo],
      43: [m.Tenaglia],
      50: [m.Geloraggio]
    },
    movesByMT: [
      m.Surf, m.Geloraggio, m.Bora, m.Tossina, m.Doppioteam,
      m.Riposo, m.Protezione, m.Attrazione, m.Ritorno, m.Frustrazione,
      m.Introforza, m.Pioggiadanza, m.Grandine, m.Facciata, m.Forzasegreta,
      m.Sub, m.Idropulsar, m.Riduttore, m.Bollaraggio, m.Stridio,
      m.Barriera, m.Rapigiro, m.Gelolancia, m.Sdoppiatore, m.Mimica,
      m.Autodistruzione, m.Comete, m.Esplosione, m.Sostituto, m.Russare,
      m.Ventogelato, m.Resistenza, m.Bullo, m.Sonnolalia, m.Raggiaurora,
      m.Rinfrescata
    ],
    evolution: {stage: "base", to: [{species: "91", trigger: {kind: "item", item: i.pietraidrica}}]}
  },
  "91": {
    name: "Cloyster",
    dexNumber: 91,
    type: ["Acqua", "Ghiaccio"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Ritirata, m.Supersuono, m.Raggiaurora, m.Protezione],
      36: [m.Punte],
      43: [m.Sparalance]
    },
    movesByMT: [
      m.Surf, m.Geloraggio, m.Bora, m.IperRaggio, m.Tossina,
      m.Doppioteam, m.Riposo, m.Protezione, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Grandine, m.Attaccalite,
      m.Facciata, m.Forzasegreta, m.Sub, m.Idropulsar, m.Riduttore,
      m.Bollaraggio, m.Stridio, m.Barriera, m.Rapigiro, m.Gelolancia,
      m.Sdoppiatore, m.Mimica, m.Autodistruzione, m.Comete, m.Esplosione,
      m.Sostituto, m.Russare, m.Ventogelato, m.Resistenza, m.Bullo,
      m.Sonnolalia, m.Raggiaurora, m.Rinfrescata
    ],
    evolution: {stage: "stage1", to: []}
  },
  "92": {
    name: "Gastly",
    dexNumber: 92,
    type: ["Spettro", "Veleno"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 30
    },
    exp: 50,
    movesByLevel: {
      5: [m.Ipnosi, m.Leccata],
      8: [m.Dispetto],
      13: [m.Maledizione],
      16: [m.OmbraNotturna],
      21: [m.Stordiraggio],
      28: [m.Mangiasogni],
      33: [m.Destinobbligato],
      36: [m.PallaOmbra],
      41: [m.Incubo],
      48: [m.Malosguardo]
    },
    movesByMT: [
      m.Fulmine, m.Tossina, m.Psichico, m.Doppioteam, m.Riposo,
      m.Furto, m.Protezione, m.Fangobomba, m.Gigassorbimento, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Giornodisole,
      m.PallaOmbra, m.Attaccalite, m.Facciata, m.Provocazione, m.Scippo,
      m.Forzasegreta, m.Nube, m.Psiconda, m.Esplosione, m.Ultimocanto,
      m.Fuocofatuo, m.Rancore, m.Sgomento, m.Mimica, m.Autodistruzione,
      m.Mangiasogni, m.Sostituto, m.Incubo, m.Russare, m.Resistenza,
      m.Bullo, m.Sonnolalia, m.Psicamisu
    ],
    evolution: {stage: "base", to: [{species: "93", trigger: {kind: "level", level: 25}}]}
  },
  "93": {
    name: "Haunter",
    dexNumber: 93,
    type: ["Spettro", "Veleno"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 25,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Ipnosi, m.Leccata, m.Dispetto],
      13: [m.Maledizione],
      16: [m.OmbraNotturna],
      21: [m.Stordiraggio],
      25: [m.Pugnodombra],
      31: [m.Mangiasogni],
      39: [m.Destinobbligato],
      45: [m.PallaOmbra],
      53: [m.Incubo],
      64: [m.Malosguardo]
    },
    movesByMT: [
      m.Fulmine, m.Tossina, m.Psichico, m.Doppioteam, m.Riposo,
      m.Furto, m.Protezione, m.Fangobomba, m.Gigassorbimento, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Giornodisole,
      m.PallaOmbra, m.Attaccalite, m.Facciata, m.Provocazione, m.Scippo,
      m.Forzasegreta, m.Nube, m.Psiconda, m.Esplosione, m.Ultimocanto,
      m.Fuocofatuo, m.Rancore, m.Sgomento, m.Mimica, m.Autodistruzione,
      m.Mangiasogni, m.Sostituto, m.Incubo, m.Russare, m.Resistenza,
      m.Bullo, m.Sonnolalia, m.Psicamisu
    ],
    evolution: {stage: "stage1", to: [{species: "94", trigger: {kind: "item", item: i.filo_dell_unione}}]}
  },
  "94": {
    name: "Gengar",
    dexNumber: 94,
    type: ["Spettro", "Veleno"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 55,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.Ipnosi, m.Leccata, m.Dispetto],
      13: [m.Maledizione],
      16: [m.OmbraNotturna],
      21: [m.Stordiraggio],
      25: [m.Pugnodombra],
      31: [m.Mangiasogni],
      39: [m.Destinobbligato],
      45: [m.PallaOmbra],
      53: [m.Incubo],
      64: [m.Malosguardo]
    },
    movesByMT: [
      m.IperRaggio, m.Forza, m.Fulmine, m.Tuono, m.Tossina,
      m.Psichico, m.Doppioteam, m.Riposo, m.Furto, m.Protezione,
      m.Fangobomba, m.Gigassorbimento, m.Attrazione, m.Ritorno, m.Frustrazione,
      m.Introforza, m.Pioggiadanza, m.Giornodisole, m.PallaOmbra, m.Spaccaroccia,
      m.Attaccalite, m.Facciata, m.Centripugno, m.Provocazione, m.Breccia,
      m.Scippo, m.Forzasegreta, m.Nube, m.Psiconda, m.Esplosione,
      m.Ultimocanto, m.Fuocofatuo, m.Rancore, m.Sgomento, m.Megapugno,
      m.Fuocopugno, m.Gelopugno, m.Tuonopugno, m.Megacalcio, m.Corposcontro,
      m.Sdoppiatore, m.Contrattacco, m.MovimentoSismico, m.Mimica, m.Metronomo,
      m.Autodistruzione, m.Mangiasogni, m.Sostituto, m.Incubo, m.Russare,
      m.Resistenza, m.Bullo, m.Sonnolalia, m.Dinamipugno, m.Psicamisu
    ],
    evolution: {stage: "stage2", to: []}
  },
  "95": {
    name: "Onix",
    dexNumber: 95,
    type: ["Roccia", "Terra"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 50,
    movesByLevel: {
      5: [m.Azione, m.Stridio],
      8: [m.Legatutto],
      12: [m.Sassata],
      19: [m.Rafforzatore],
      23: [m.Ira],
      30: [m.Dragospiro],
      34: [m.Terrempesta],
      41: [m.Schianto],
      45: [m.Codacciaio],
      52: [m.Sabbiotomba],
      56: [m.Sdoppiatore]
    },
    movesByMT: [
      m.Boato, m.Forza, m.Terremoto, m.Fossa, m.Tossina,
      m.Doppioteam, m.Riposo, m.Protezione, m.Terrempesta, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Codacciaio, m.Introforza, m.Giornodisole,
      m.Spaccaroccia, m.Attaccalite, m.Facciata, m.Provocazione, m.Forzasegreta,
      m.Rocciotomba, m.Esplosione, m.Frana, m.Flagello, m.Blocco,
      m.Corposcontro, m.Sdoppiatore, m.Mimica, m.Autodistruzione, m.Sostituto,
      m.Russare, m.Fangosberla, m.Resistenza, m.Bullo, m.Sonnolalia,
      m.Psicamisu
    ],
    evolution: {stage: "base", to: [{species: "208", trigger: {kind: "item", item: i.metalcopertura}}]}
  },
  "96": {
    name: "Drowzee",
    dexNumber: 96,
    type: ["Psico"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 36
    },
    exp: 50,
    movesByLevel: {
      5: [m.Botta, m.Ipnosi],
      7: [m.Inibitore],
      11: [m.Confusione],
      17: [m.Bottintesta],
      21: [m.Velenogas],
      27: [m.Meditazione],
      31: [m.Psichico],
      37: [m.Psicamisu],
      41: [m.Bullo],
      47: [m.Divinazione]
    },
    movesByMT: [
      m.Tossina, m.Psichico, m.Doppioteam, m.Schermoluce, m.Riflesso,
      m.Flash, m.Riposo, m.Furto, m.Protezione, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Salvaguardia, m.Introforza, m.Pioggiadanza,
      m.Giornodisole, m.PallaOmbra, m.Attaccalite, m.Facciata, m.Centripugno,
      m.Provocazione, m.Breccia, m.Scippo, m.Forzasegreta, m.Calmamente,
      m.Fuocopugno, m.Gelopugno, m.Tuonopugno, m.Barriera, m.Assistente,
      m.Megapugno, m.Megacalcio, m.Corposcontro, m.Sdoppiatore, m.Contrattacco,
      m.MovimentoSismico, m.Tuononda, m.Mimica, m.Metronomo, m.Mangiasogni,
      m.Sostituto, m.Incubo, m.Russare, m.Resistenza, m.Bullo,
      m.Sonnolalia, m.Dinamipugno, m.Psicamisu, m.Desiderio, m.Panciamburo
    ],
    evolution: {stage: "base", to: [{species: "97", trigger: {kind: "level", level: 26}}]}
  },
  "97": {
    name: "Hypno",
    dexNumber: 97,
    type: ["Psico"],
    gender: ["Maschio", "Femmina"],
    spriteGendered: true,
    encounter: {
      rarity: "u",
      minLevel: 26,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Incubo, m.Botta, m.Ipnosi, m.Inibitore, m.Confusione],
      17: [m.Bottintesta],
      21: [m.Velenogas],
      29: [m.Meditazione],
      35: [m.Psichico],
      43: [m.Psicamisu],
      49: [m.Bullo],
      57: [m.Divinazione]
    },
    movesByMT: [
      m.IperRaggio, m.Tossina, m.Psichico, m.Doppioteam, m.Schermoluce,
      m.Riflesso, m.Flash, m.Riposo, m.Furto, m.Protezione,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Salvaguardia, m.Introforza,
      m.Pioggiadanza, m.Giornodisole, m.PallaOmbra, m.Attaccalite, m.Facciata,
      m.Centripugno, m.Provocazione, m.Breccia, m.Scippo, m.Forzasegreta,
      m.Calmamente, m.Fuocopugno, m.Gelopugno, m.Tuonopugno, m.Barriera,
      m.Assistente, m.Megapugno, m.Megacalcio, m.Corposcontro, m.Sdoppiatore,
      m.Contrattacco, m.MovimentoSismico, m.Tuononda, m.Mimica, m.Metronomo,
      m.Mangiasogni, m.Sostituto, m.Incubo, m.Russare, m.Resistenza,
      m.Bullo, m.Sonnolalia, m.Dinamipugno, m.Psicamisu, m.Meditazione,
      m.Staffetta, m.Desiderio, m.Panciamburo
    ],
    evolution: {stage: "stage1", to: []}
  },
  "98": {
    name: "Krabby",
    dexNumber: 98,
    type: ["Acqua"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 38
    },
    exp: 50,
    movesByLevel: {
      5: [m.Bolla, m.Fulmisguardo],
      12: [m.Presa],
      16: [m.Rafforzatore],
      23: [m.Colpodifango],
      27: [m.Pestone],
      34: [m.Ghigliottina],
      38: [m.Protezione],
      45: [m.Martellata],
      49: [m.Flagello]
    },
    movesByMT: [
      m.Taglio, m.Surf, m.Geloraggio, m.Bora, m.Forza,
      m.Fossa, m.Tossina, m.Doppioteam, m.Riposo, m.Furto,
      m.Protezione, m.Attrazione, m.Ritorno, m.Frustrazione, m.Introforza,
      m.Pioggiadanza, m.Spaccaroccia, m.Grandine, m.Facciata, m.Forzasegreta,
      m.Sub, m.Rocciotomba, m.Idropulsar, m.Danzaspada, m.Schianto,
      m.Nube, m.Amnesia, m.Flagello, m.Privazione, m.Corposcontro,
      m.Sdoppiatore, m.Mimica, m.Sostituto, m.Russare, m.Fangosberla,
      m.Ventogelato, m.Resistenza, m.Bullo, m.Tagliofuria, m.Sonnolalia
    ],
    evolution: {stage: "base", to: [{species: "99", trigger: {kind: "level", level: 28}}]}
  },
  "99": {
    name: "Kingler",
    dexNumber: 99,
    type: ["Acqua"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 28,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Ferrartigli, m.Bolla, m.Fulmisguardo, m.Presa, m.Rafforzatore],
      23: [m.Colpodifango],
      27: [m.Pestone],
      38: [m.Ghigliottina],
      42: [m.Protezione],
      57: [m.Martellata],
      65: [m.Flagello]
    },
    movesByMT: [
      m.Taglio, m.Surf, m.Geloraggio, m.Bora, m.IperRaggio,
      m.Forza, m.Fossa, m.Tossina, m.Doppioteam, m.Riposo,
      m.Furto, m.Protezione, m.Attrazione, m.Ritorno, m.Frustrazione,
      m.Introforza, m.Pioggiadanza, m.Spaccaroccia, m.Grandine, m.Facciata,
      m.Forzasegreta, m.Sub, m.Rocciotomba, m.Idropulsar, m.Danzaspada,
      m.Schianto, m.Nube, m.Amnesia, m.Flagello, m.Privazione,
      m.Corposcontro, m.Sdoppiatore, m.Mimica, m.Sostituto, m.Russare,
      m.Fangosberla, m.Ventogelato, m.Resistenza, m.Bullo, m.Tagliofuria,
      m.Sonnolalia
    ],
    evolution: {stage: "stage1", to: []}
  },
  "100": {
    name: "Voltorb",
    dexNumber: 100,
    type: ["Elettro"],
    gender: [],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 40
    },
    exp: 50,
    movesByLevel: {
      5: [m.Sottocarica, m.Azione],
      8: [m.Stridio],
      15: [m.Sonicboom],
      21: [m.Scintilla],
      27: [m.Autodistruzione],
      32: [m.Rotolamento],
      37: [m.Schermoluce],
      42: [m.Comete],
      46: [m.Esplosione],
      49: [m.Specchiovelo]
    },
    movesByMT: [
      m.Fulmine, m.Tuono, m.Tossina, m.Doppioteam, m.Schermoluce,
      m.Flash, m.Riposo, m.Furto, m.Protezione, m.Ritorno,
      m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Attaccalite, m.Facciata,
      m.Provocazione, m.Forzasegreta, m.Ondashock, m.Tuononda, m.Mimica,
      m.Autodistruzione, m.Comete, m.Esplosione, m.Sostituto, m.Russare,
      m.Resistenza, m.Rotolamento, m.Bullo, m.Sonnolalia, m.Scintilla,
      m.Specchiovelo, m.Rinfrescata
    ],
    evolution: {stage: "base", to: [{species: "101", trigger: {kind: "level", level: 30}}]}
  },
  "101": {
    name: "Electrode",
    dexNumber: 101,
    type: ["Elettro"],
    gender: [],
    encounter: {
      rarity: "u",
      minLevel: 30,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Azione, m.Sottocarica],
      8: [m.Stridio],
      15: [m.Sonicboom],
      21: [m.Scintilla],
      27: [m.Autodistruzione],
      34: [m.Rotolamento],
      41: [m.Schermoluce],
      48: [m.Comete],
      54: [m.Esplosione],
      59: [m.Specchiovelo]
    },
    movesByMT: [
      m.IperRaggio, m.Fulmine, m.Tuono, m.Tossina, m.Doppioteam,
      m.Schermoluce, m.Flash, m.Riposo, m.Furto, m.Protezione,
      m.Ritorno, m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Attaccalite,
      m.Facciata, m.Provocazione, m.Forzasegreta, m.Ondashock, m.Tuononda,
      m.Mimica, m.Autodistruzione, m.Comete, m.Esplosione, m.Sostituto,
      m.Russare, m.Resistenza, m.Rotolamento, m.Bullo, m.Sonnolalia,
      m.Scintilla, m.Specchiovelo, m.Rinfrescata
    ],
    evolution: {stage: "stage1", to: []}
  },
  "102": {
    name: "Exeggcute",
    dexNumber: 102,
    type: ["Erba", "Psico"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 50
    },
    exp: 50,
    movesByLevel: {
      5: [m.Ipnosi, m.AttaccoPioggia, m.Baraonda],
      7: [m.Riflesso],
      13: [m.Parassiseme],
      19: [m.Confusione],
      25: [m.Paralizzante],
      31: [m.Velenpolvere],
      37: [m.Sonnifero],
      43: [m.Solarraggio]
    },
    movesByMT: [
      m.Forza, m.Solarraggio, m.Tossina, m.Psichico, m.Doppioteam,
      m.Schermoluce, m.Riflesso, m.Flash, m.Riposo, m.Furto,
      m.Protezione, m.Fangobomba, m.Gigassorbimento, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Introforza, m.Giornodisole, m.Facciata, m.Forzasegreta,
      m.Semitraglia, m.Maledizione, m.Sintesi, m.Lucelunare, m.Psicamisu,
      m.Forzantica, m.Radicamento, m.Sdoppiatore, m.Mimica, m.Autodistruzione,
      m.Mangiasogni, m.Esplosione, m.Sostituto, m.Incubo, m.Russare,
      m.Resistenza, m.Rotolamento, m.Bullo, m.Sonnolalia, m.Desiderio,
      m.Profumino
    ],
    evolution: {stage: "base", to: [{species: "103", trigger: {kind: "item", item: i.pietrafoglia}}]}
  },
  "103": {
    name: "Exeggutor",
    dexNumber: 103,
    type: ["Erba", "Psico"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Confusione, m.Ipnosi, m.AttaccoPioggia],
      19: [m.Pestone],
      31: [m.Uovobomba]
    },
    movesByMT: [
      m.IperRaggio, m.Forza, m.Solarraggio, m.Tossina, m.Psichico,
      m.Doppioteam, m.Schermoluce, m.Riflesso, m.Flash, m.Riposo,
      m.Furto, m.Protezione, m.Fangobomba, m.Gigassorbimento, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Introforza, m.Giornodisole, m.Facciata,
      m.Forzasegreta, m.Semitraglia, m.Falcecannone, m.Maledizione, m.Sintesi,
      m.Lucelunare, m.Psicamisu, m.Forzantica, m.Radicamento, m.Sdoppiatore,
      m.Mimica, m.Autodistruzione, m.Mangiasogni, m.Esplosione, m.Sostituto,
      m.Incubo, m.Russare, m.Resistenza, m.Rotolamento, m.Bullo,
      m.Sonnolalia, m.Ipnosi, m.Rinfrescata, m.Desiderio, m.Profumino
    ],
    evolution: {stage: "stage1", to: []}
  },
  "104": {
    name: "Cubone",
    dexNumber: 104,
    type: ["Terra"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 5,
      maxLevel: 38
    },
    exp: 50,
    movesByLevel: {
      5: [m.Botta, m.Ruggito, m.Colpocoda],
      9: [m.Ossoclava],
      13: [m.Bottintesta],
      17: [m.Fulmisguardo],
      21: [m.Focalenergia],
      25: [m.Ossomerang],
      29: [m.Ira],
      33: [m.Falsofinale],
      37: [m.Colpo],
      41: [m.Ossoraffica],
      45: [m.Sdoppiatore]
    },
    movesByMT: [
      m.Lanciafiamme, m.Geloraggio, m.Bora, m.Forza, m.Terremoto,
      m.Fossa, m.Tossina, m.Doppioteam, m.Fuocobomba, m.Riposo,
      m.Furto, m.Protezione, m.Terrempesta, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Codacciaio, m.Introforza, m.Giornodisole, m.Spaccaroccia,
      m.Facciata, m.Centripugno, m.Breccia, m.Forzasegreta, m.Rocciotomba,
      m.Aeroassalto, m.Danzaspada, m.Stridio, m.Capocciata, m.Frana,
      m.Panciamburo, m.Ultimocanto, m.Forzantica, m.Megapugno, m.Fuocopugno,
      m.Tuonopugno, m.Megacalcio, m.Corposcontro, m.Sdoppiatore, m.Contrattacco,
      m.MovimentoSismico, m.Mimica, m.Sostituto, m.Russare, m.Fangosberla,
      m.Ventogelato, m.Resistenza, m.Bullo, m.Sonnolalia, m.Dinamipugno
    ],
    evolution: {stage: "base", to: [{species: "105", trigger: {kind: "level", level: 28}}]}
  },
  "105": {
    name: "Marowak",
    dexNumber: 105,
    type: ["Terra"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 28,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Colpocoda, m.Ruggito],
      9: [m.Ossoclava],
      13: [m.Bottintesta],
      17: [m.Fulmisguardo],
      21: [m.Focalenergia],
      25: [m.Ossomerang],
      32: [m.Ira],
      39: [m.Falsofinale],
      46: [m.Colpo],
      53: [m.Ossoraffica],
      61: [m.Sdoppiatore]
    },
    movesByMT: [
      m.Lanciafiamme, m.Geloraggio, m.Bora, m.IperRaggio, m.Forza,
      m.Terremoto, m.Fossa, m.Tossina, m.Doppioteam, m.Fuocobomba,
      m.Riposo, m.Furto, m.Protezione, m.Terrempesta, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Codacciaio, m.Introforza, m.Giornodisole,
      m.Spaccaroccia, m.Facciata, m.Centripugno, m.Breccia, m.Forzasegreta,
      m.Rocciotomba, m.Aeroassalto, m.Danzaspada, m.Stridio, m.Capocciata,
      m.Frana, m.Panciamburo, m.Ultimocanto, m.Forzantica, m.Megapugno,
      m.Fuocopugno, m.Tuonopugno, m.Megacalcio, m.Corposcontro, m.Sdoppiatore,
      m.Contrattacco, m.MovimentoSismico, m.Mimica, m.Sostituto, m.Russare,
      m.Fangosberla, m.Ventogelato, m.Resistenza, m.Bullo, m.Sonnolalia,
      m.Dinamipugno, m.Canto
    ],
    evolution: {stage: "stage1", to: []}
  },
  "106": {
    name: "Hitmonlee",
    dexNumber: 106,
    type: ["Lotta"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Doppiocalcio, m.Vendetta],
      6: [m.Meditazione],
      11: [m.Calciorullo],
      16: [m.Calciosalto],
      20: [m.Breccia],
      21: [m.Focalenergia],
      26: [m.Calcinvolo],
      31: [m.Leggimente],
      36: [m.Preveggenza],
      41: [m.Resistenza],
      46: [m.Megacalcio],
      51: [m.Contropiede]
    },
    movesByMT: [
      m.Forza, m.Terremoto, m.Tossina, m.Doppioteam, m.Riposo,
      m.Furto, m.Protezione, m.Attrazione, m.Ritorno, m.Frustrazione,
      m.Introforza, m.Pioggiadanza, m.Giornodisole, m.Spaccaroccia, m.Facciata,
      m.Centripugno, m.Breccia, m.Forzasegreta, m.Rocciotomba, m.Granfisico,
      m.Calcinvolo, m.Leggimente, m.Pugnorapido, m.Rapigiro, m.Altruismo,
      m.Megapugno, m.Megacalcio, m.Corposcontro, m.Sdoppiatore, m.Contrattacco,
      m.MovimentoSismico, m.Mimica, m.Metronomo, m.Comete, m.Frana,
      m.Sostituto, m.Russare, m.Fangosberla, m.Resistenza, m.Bullo,
      m.Sonnolalia, m.Dinamipugno, m.Rinfrescata
    ],
    evolution: {stage: "base", to: []}
  },
  "107": {
    name: "Hitmonchan",
    dexNumber: 107,
    type: ["Lotta"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Cometapugno, m.Vendetta],
      7: [m.Agilita],
      13: [m.Inseguimento],
      20: [m.Pugnorapido],
      26: [m.Fuocopugno, m.Gelopugno, m.Tuonopugno],
      32: [m.Stramontante],
      38: [m.Megapugno],
      44: [m.Individua],
      50: [m.Contrattacco]
    },
    movesByMT: [
      m.Forza, m.Terremoto, m.Tossina, m.Doppioteam, m.Riposo,
      m.Furto, m.Protezione, m.Attrazione, m.Ritorno, m.Frustrazione,
      m.Introforza, m.Pioggiadanza, m.Giornodisole, m.Spaccaroccia, m.Facciata,
      m.Centripugno, m.Breccia, m.Forzasegreta, m.Rocciotomba, m.Granfisico,
      m.Calcinvolo, m.Leggimente, m.Pugnorapido, m.Rapigiro, m.Altruismo,
      m.Megapugno, m.Fuocopugno, m.Gelopugno, m.Tuonopugno, m.Megacalcio,
      m.Corposcontro, m.Sdoppiatore, m.Contrattacco, m.MovimentoSismico, m.Mimica,
      m.Metronomo, m.Comete, m.Frana, m.Sostituto, m.Russare,
      m.Fangosberla, m.Resistenza, m.Bullo, m.Sonnolalia, m.Dinamipugno,
      m.Stramontante
    ],
    evolution: {stage: "base", to: []}
  },
  "108": {
    name: "Lickitung",
    dexNumber: 108,
    type: ["Normale"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 50,
    movesByLevel: {
      5: [m.Leccata],
      7: [m.Supersuono],
      12: [m.Ricciolscudo],
      18: [m.Privazione],
      23: [m.Pestone],
      29: [m.Avvolgibotta],
      34: [m.Inibitore],
      40: [m.Schianto],
      45: [m.Stridio],
      51: [m.Rinfrescata]
    },
    movesByMT: [
      m.Taglio, m.Lanciafiamme, m.Surf, m.Geloraggio, m.Bora,
      m.IperRaggio, m.Forza, m.Solarraggio, m.Fulmine, m.Tuono,
      m.Terremoto, m.Fossa, m.Tossina, m.Doppioteam, m.Fuocobomba,
      m.Riposo, m.Furto, m.Protezione, m.Terrempesta, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Codacciaio, m.Introforza, m.Pioggiadanza,
      m.Giornodisole, m.PallaOmbra, m.Spaccaroccia, m.Facciata, m.Centripugno,
      m.Breccia, m.Forzasegreta, m.Rocciotomba, m.Ondashock, m.Idropulsar,
      m.Corposcontro, m.Sostituto, m.Russare, m.Maledizione, m.Panciamburo,
      m.Sonnolalia, m.Magnitudo, m.Maniereforti, m.Megapugno, m.Fuocopugno,
      m.Gelopugno, m.Tuonopugno, m.Danzaspada, m.Megacalcio, m.Sdoppiatore,
      m.Contrattacco, m.MovimentoSismico, m.Mimica, m.Ricciolscudo, m.Mangiasogni,
      m.Frana, m.Incubo, m.Fangosberla, m.Ventogelato, m.Resistenza,
      m.Rotolamento, m.Bullo, m.Dinamipugno, m.Psicamisu, m.Altruismo,
      m.Desiderio, m.Rintoccasana
    ],
    evolution: {stage: "base", to: []}
  },
  "109": {
    name: "Koffing",
    dexNumber: 109,
    type: ["Veleno"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 45
    },
    exp: 50,
    movesByLevel: {
      5: [m.Azione, m.Velenogas],
      9: [m.Smog],
      17: [m.Autodistruzione],
      21: [m.Fango],
      25: [m.MurodiFumo],
      33: [m.Nube],
      41: [m.Esplosione],
      45: [m.Destinobbligato],
      49: [m.Memento]
    },
    movesByMT: [
      m.Lanciafiamme, m.Fulmine, m.Tuono, m.Tossina, m.Doppioteam,
      m.Fuocobomba, m.Flash, m.Riposo, m.Furto, m.Protezione,
      m.Fangobomba, m.Attrazione, m.Ritorno, m.Frustrazione, m.Introforza,
      m.Pioggiadanza, m.Giornodisole, m.PallaOmbra, m.Attaccalite, m.Facciata,
      m.Provocazione, m.Forzasegreta, m.Ondashock, m.Psicoraggio, m.Stridio,
      m.Psiconda, m.Destinobbligato, m.Malcomune, m.Fuocofatuo, m.Mimica,
      m.Autodistruzione, m.Esplosione, m.Sostituto, m.Russare, m.Resistenza,
      m.Rotolamento, m.Bullo, m.Sonnolalia
    ],
    evolution: {stage: "base", to: [{species: "110", trigger: {kind: "level", level: 35}}]}
  },
  "110": {
    name: "Weezing",
    dexNumber: 110,
    type: ["Veleno"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 35,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Azione, m.Velenogas],
      9: [m.Smog],
      17: [m.Autodistruzione],
      21: [m.Fango],
      25: [m.MurodiFumo],
      33: [m.Nube],
      44: [m.Esplosione],
      51: [m.Destinobbligato],
      58: [m.Memento]
    },
    movesByMT: [
      m.Lanciafiamme, m.IperRaggio, m.Fulmine, m.Tuono, m.Tossina,
      m.Doppioteam, m.Fuocobomba, m.Flash, m.Riposo, m.Furto,
      m.Protezione, m.Fangobomba, m.Attrazione, m.Ritorno, m.Frustrazione,
      m.Introforza, m.Pioggiadanza, m.Giornodisole, m.PallaOmbra, m.Attaccalite,
      m.Facciata, m.Provocazione, m.Forzasegreta, m.Ondashock, m.Psicoraggio,
      m.Stridio, m.Psiconda, m.Destinobbligato, m.Malcomune, m.Fuocofatuo,
      m.Mimica, m.Autodistruzione, m.Esplosione, m.Sostituto, m.Russare,
      m.Resistenza, m.Rotolamento, m.Bullo, m.Sonnolalia
    ],
    evolution: {stage: "stage1", to: []}
  },
  "111": {
    name: "Rhyhorn",
    dexNumber: 111,
    type: ["Terra", "Roccia"],
    gender: ["Maschio", "Femmina"],
    spriteGendered: true,
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 52
    },
    exp: 50,
    movesByLevel: {
      5: [m.Incornata, m.Colpocoda],
      10: [m.Pestone],
      15: [m.Furia],
      24: [m.Visotruce],
      29: [m.Cadutamassi],
      38: [m.Perforcorno],
      43: [m.Riduttore],
      52: [m.Terremoto],
      57: [m.Megacorno]
    },
    movesByMT: [
      m.Boato, m.Lanciafiamme, m.Geloraggio, m.Bora, m.Forza,
      m.Fulmine, m.Tuono, m.Terremoto, m.Fossa, m.Tossina,
      m.Doppioteam, m.Fuocobomba, m.Riposo, m.Furto, m.Protezione,
      m.Terrempesta, m.Attrazione, m.Ritorno, m.Frustrazione, m.Codacciaio,
      m.Introforza, m.Pioggiadanza, m.Giornodisole, m.Spaccaroccia, m.Facciata,
      m.Forzasegreta, m.Rocciotomba, m.Ondashock, m.Danzaspada, m.Contrattacco,
      m.Frana, m.Maledizione, m.Contropiede, m.Magnitudo, m.Sgranocchio,
      m.Tritartigli, m.Corposcontro, m.Sdoppiatore, m.Mimica, m.Sostituto,
      m.Russare, m.Fangosberla, m.Ventogelato, m.Resistenza, m.Rotolamento,
      m.Bullo, m.Sonnolalia
    ],
    evolution: {stage: "base", to: [{species: "112", trigger: {kind: "level", level: 42}}]}
  },
  "112": {
    name: "Rhydon",
    dexNumber: 112,
    type: ["Terra", "Roccia"],
    gender: ["Maschio", "Femmina"],
    spriteGendered: true,
    encounter: {
      rarity: "r",
      minLevel: 42,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Incornata, m.Colpocoda],
      10: [m.Pestone],
      15: [m.Furia],
      24: [m.Visotruce],
      29: [m.Cadutamassi],
      38: [m.Perforcorno],
      46: [m.Riduttore],
      58: [m.Terremoto],
      66: [m.Megacorno]
    },
    movesByMT: [
      m.Taglio, m.Boato, m.Lanciafiamme, m.Surf, m.Geloraggio,
      m.Bora, m.IperRaggio, m.Forza, m.Fulmine, m.Tuono,
      m.Terremoto, m.Fossa, m.Tossina, m.Doppioteam, m.Fuocobomba,
      m.Riposo, m.Furto, m.Protezione, m.Terrempesta, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Codacciaio, m.Introforza, m.Pioggiadanza,
      m.Giornodisole, m.Spaccaroccia, m.Facciata, m.Centripugno, m.Breccia,
      m.Forzasegreta, m.Rocciotomba, m.Ondashock, m.Danzaspada, m.Contrattacco,
      m.Frana, m.Maledizione, m.Contropiede, m.Magnitudo, m.Sgranocchio,
      m.Tritartigli, m.Megapugno, m.Fuocopugno, m.Tuonopugno, m.Megacalcio,
      m.Corposcontro, m.Sdoppiatore, m.MovimentoSismico, m.Mimica, m.Sostituto,
      m.Russare, m.Fangosberla, m.Ventogelato, m.Resistenza, m.Rotolamento,
      m.Bullo, m.Tagliofuria, m.Sonnolalia, m.Dinamipugno, m.Visotruce,
      m.Megacorno, m.Altruismo
    ],
    evolution: {stage: "stage1", to: []}
  },
  "113": {
    name: "Chansey",
    dexNumber: 113,
    type: ["Normale"],
    gender: ["Femmina"],
    encounter: {
      rarity: "s",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Botta, m.Ruggito, m.Colpocoda],
      9: [m.Rinfrescata],
      13: [m.Covauova],
      17: [m.Doppiasberla],
      23: [m.Minimizzato],
      29: [m.Canto],
      35: [m.Uovobomba],
      41: [m.Ricciolscudo],
      49: [m.Schermoluce],
      57: [m.Sdoppiatore]
    },
    movesByMT: [
      m.Lanciafiamme, m.Geloraggio, m.Bora, m.IperRaggio, m.Forza,
      m.Solarraggio, m.Fulmine, m.Tuono, m.Terremoto, m.Tossina,
      m.Psichico, m.Doppioteam, m.Schermoluce, m.Fuocobomba, m.Flash,
      m.Riposo, m.Protezione, m.Terrempesta, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Salvaguardia, m.Codacciaio, m.Introforza, m.Pioggiadanza,
      m.Giornodisole, m.PallaOmbra, m.Spaccaroccia, m.Grandine, m.Facciata,
      m.Centripugno, m.Breccia, m.Scippo, m.Forzasegreta, m.Rocciotomba,
      m.Calmamente, m.Ondashock, m.Idropulsar, m.Metronomo, m.Sostituto,
      m.Rintoccasana, m.Regalino, m.Aromaterapia, m.Megapugno, m.Megacalcio,
      m.Corposcontro, m.Sdoppiatore, m.Contrattacco, m.MovimentoSismico, m.Tuononda,
      m.Mimica, m.Ricciolscudo, m.Covauova, m.Mangiasogni, m.Russare,
      m.Fangosberla, m.Ventogelato, m.Resistenza, m.Rotolamento, m.Bullo,
      m.Sonnolalia, m.Dinamipugno, m.Psicamisu, m.Dolcebacio, m.Desiderio,
      m.Profumino
    ],
    evolution: {stage: "base", to: [{species: "242", trigger: {kind: "item", item: i.felixpietra}}]}
  },
  "114": {
    name: "Tangela",
    dexNumber: 114,
    type: ["Erba"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 50,
    movesByLevel: {
      5: [m.Limitazione, m.Radicamento, m.Sonnifero],
      10: [m.Assorbimento],
      13: [m.Crescita],
      19: [m.Velenpolvere],
      22: [m.Frustata],
      28: [m.Legatutto],
      31: [m.Megassorbimento],
      37: [m.Paralizzante],
      40: [m.Schianto],
      46: [m.Solletico]
    },
    movesByMT: [
      m.Taglio, m.IperRaggio, m.Solarraggio, m.Tossina, m.Doppioteam,
      m.Flash, m.Riposo, m.Furto, m.Protezione, m.Fangobomba,
      m.Gigassorbimento, m.Attrazione, m.Ritorno, m.Frustrazione, m.Introforza,
      m.Giornodisole, m.Spaccaroccia, m.Facciata, m.Forzasegreta, m.Semitraglia,
      m.Megassorbimento, m.Parassiseme, m.Confusione, m.Riflesso, m.Amnesia,
      m.Flagello, m.Naturforza, m.Danzaspada, m.Corposcontro, m.Sdoppiatore,
      m.Mimica, m.Sostituto, m.Russare, m.Resistenza, m.Bullo,
      m.Sonnolalia, m.Psicamisu, m.Mattindoro, m.Radicamento
    ],
    evolution: {stage: "base", to: []}
  },
  "115": {
    name: "Kangaskhan",
    dexNumber: 115,
    type: ["Normale"],
    gender: ["Femmina"],
    encounter: {
      rarity: "s",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Cometapugno, m.Fulmisguardo],
      7: [m.Morso],
      13: [m.Colpocoda],
      19: [m.Bruciapelo],
      25: [m.Megapugno],
      31: [m.Ira],
      37: [m.Resistenza],
      43: [m.Stordipugno],
      49: [m.Contropiede]
    },
    movesByMT: [
      m.Taglio, m.Boato, m.Lanciafiamme, m.Surf, m.Geloraggio,
      m.Bora, m.IperRaggio, m.Forza, m.Solarraggio, m.Fulmine,
      m.Tuono, m.Terremoto, m.Fossa, m.Tossina, m.Doppioteam,
      m.Fuocobomba, m.Riposo, m.Furto, m.Protezione, m.Terrempesta,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Codacciaio, m.Introforza,
      m.Pioggiadanza, m.Giornodisole, m.PallaOmbra, m.Spaccaroccia, m.Grandine,
      m.Facciata, m.Centripugno, m.Breccia, m.Forzasegreta, m.Rocciotomba,
      m.Aeroassalto, m.Ondashock, m.Idropulsar, m.Pestone, m.Inibitore,
      m.Contrattacco, m.Focalenergia, m.Sostituto, m.Preveggenza, m.Salvaguardia,
      m.Tritartigli, m.Megapugno, m.Fuocopugno, m.Gelopugno, m.Tuonopugno,
      m.Megacalcio, m.Corposcontro, m.Sdoppiatore, m.MovimentoSismico, m.Mimica,
      m.Frana, m.Russare, m.Fangosberla, m.Ventogelato, m.Resistenza,
      m.Bullo, m.Tagliofuria, m.Sonnolalia, m.Dinamipugno, m.Colpocoda,
      m.Canto, m.Stordipugno, m.Desiderio, m.Sbadiglio
    ],
    evolution: {stage: "base", to: []}
  },
  "116": {
    name: "Horsea",
    dexNumber: 116,
    type: ["Acqua"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 42
    },
    exp: 50,
    movesByLevel: {
      5: [m.Bolla],
      8: [m.MurodiFumo],
      15: [m.Fulmisguardo],
      22: [m.Pistolacqua],
      29: [m.Tornado],
      36: [m.Agilita],
      43: [m.Idropompa],
      50: [m.Dragodanza]
    },
    movesByMT: [
      m.Surf, m.Geloraggio, m.Bora, m.Tossina, m.Doppioteam,
      m.Cascata, m.Riposo, m.Protezione, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Grandine, m.Facciata,
      m.Forzasegreta, m.Sub, m.Idropulsar, m.Inibitore, m.Raggiaurora,
      m.IradiDrago, m.Splash, m.Flagello, m.Octazooka, m.Dragospiro,
      m.Sdoppiatore, m.Mimica, m.Comete, m.Sostituto, m.Russare,
      m.Ventogelato, m.Resistenza, m.Bullo, m.Sonnolalia
    ],
    evolution: {stage: "base", to: [{species: "117", trigger: {kind: "level", level: 32}}]}
  },
  "117": {
    name: "Seadra",
    dexNumber: 117,
    type: ["Acqua"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 32,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Bolla],
      8: [m.MurodiFumo],
      15: [m.Fulmisguardo],
      22: [m.Pistolacqua],
      29: [m.Tornado],
      40: [m.Agilita],
      51: [m.Idropompa],
      62: [m.Dragodanza]
    },
    movesByMT: [
      m.Surf, m.Geloraggio, m.Bora, m.IperRaggio, m.Tossina,
      m.Doppioteam, m.Cascata, m.Riposo, m.Protezione, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Grandine,
      m.Facciata, m.Forzasegreta, m.Sub, m.Idropulsar, m.Inibitore,
      m.Raggiaurora, m.IradiDrago, m.Splash, m.Flagello, m.Octazooka,
      m.Dragospiro, m.Sdoppiatore, m.Mimica, m.Comete, m.Sostituto,
      m.Russare, m.Ventogelato, m.Resistenza, m.Bullo, m.Sonnolalia
    ],
    evolution: {stage: "stage1", to: [{species: "230", trigger: {kind: "item", item: i.squama_drago}}]}
  },
  "118": {
    name: "Goldeen",
    dexNumber: 118,
    type: ["Acqua"],
    gender: ["Maschio", "Femmina"],
    spriteGendered: true,
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 43
    },
    exp: 50,
    movesByLevel: {
      5: [m.Colpocoda, m.Beccata, m.Docciascudo],
      10: [m.Supersuono],
      15: [m.Incornata],
      24: [m.Flagello],
      29: [m.Furia],
      38: [m.Cascata],
      43: [m.Perforcorno],
      52: [m.Agilita],
      57: [m.Megacorno]
    },
    movesByMT: [
      m.Surf, m.Geloraggio, m.Bora, m.Tossina, m.Doppioteam,
      m.Cascata, m.Riposo, m.Protezione, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Grandine, m.Facciata,
      m.Forzasegreta, m.Sub, m.Idropulsar, m.Idropompa, m.Psicoraggio,
      m.Nube, m.Sonnolalia, m.Fangata, m.Sdoppiatore, m.Mimica,
      m.Comete, m.Sostituto, m.Russare, m.Ventogelato, m.Resistenza,
      m.Bullo
    ],
    evolution: {stage: "base", to: [{species: "119", trigger: {kind: "level", level: 33}}]}
  },
  "119": {
    name: "Seaking",
    dexNumber: 119,
    type: ["Acqua"],
    gender: ["Maschio", "Femmina"],
    spriteGendered: true,
    encounter: {
      rarity: "c",
      minLevel: 33,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Colpocoda, m.Beccata, m.Docciascudo],
      10: [m.Supersuono],
      15: [m.Incornata],
      24: [m.Flagello],
      29: [m.Furia],
      41: [m.Cascata],
      49: [m.Perforcorno],
      61: [m.Agilita],
      69: [m.Megacorno]
    },
    movesByMT: [
      m.Surf, m.Geloraggio, m.Bora, m.IperRaggio, m.Tossina,
      m.Doppioteam, m.Cascata, m.Riposo, m.Protezione, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Grandine,
      m.Facciata, m.Forzasegreta, m.Sub, m.Idropulsar, m.Idropompa,
      m.Psicoraggio, m.Nube, m.Sonnolalia, m.Fangata, m.Sdoppiatore,
      m.Mimica, m.Comete, m.Sostituto, m.Russare, m.Ventogelato,
      m.Resistenza, m.Bullo
    ],
    evolution: {stage: "stage1", to: []}
  },
  "120": {
    name: "Staryu",
    dexNumber: 120,
    type: ["Acqua"],
    gender: [],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 50
    },
    exp: 50,
    movesByLevel: {
      5: [m.Azione, m.Rafforzatore],
      6: [m.Pistolacqua],
      10: [m.Rapigiro],
      15: [m.Ripresa],
      19: [m.Camuffamento],
      24: [m.Comete],
      28: [m.Bollaraggio],
      33: [m.Minimizzato],
      37: [m.Schermoluce],
      42: [m.Cosmoforza],
      46: [m.Idropompa]
    },
    movesByMT: [
      m.Surf, m.Geloraggio, m.Bora, m.Fulmine, m.Tuono,
      m.Tossina, m.Psichico, m.Doppioteam, m.Schermoluce, m.Riflesso,
      m.Cascata, m.Flash, m.Riposo, m.Protezione, m.Ritorno,
      m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Grandine, m.Facciata,
      m.Forzasegreta, m.Sub, m.Idropulsar, m.Sdoppiatore, m.Tuononda,
      m.Mimica, m.Comete, m.Sostituto, m.Russare, m.Ventogelato,
      m.Resistenza, m.Bullo, m.Sonnolalia, m.Psicamisu
    ],
    evolution: {stage: "base", to: [{species: "121", trigger: {kind: "item", item: i.pietraidrica}}]}
  },
  "121": {
    name: "Starmie",
    dexNumber: 121,
    type: ["Acqua", "Psico"],
    gender: [],
    encounter: {
      rarity: "u",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Pistolacqua, m.Ripresa, m.Comete, m.Rapigiro],
      33: [m.Stordiraggio]
    },
    movesByMT: [
      m.Surf, m.Geloraggio, m.Bora, m.IperRaggio, m.Fulmine,
      m.Tuono, m.Tossina, m.Psichico, m.Doppioteam, m.Schermoluce,
      m.Riflesso, m.Cascata, m.Flash, m.Riposo, m.Protezione,
      m.Ritorno, m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Grandine,
      m.Facciata, m.Forzasegreta, m.Sub, m.Idropulsar, m.Sdoppiatore,
      m.Tuononda, m.Mimica, m.Comete, m.Mangiasogni, m.Sostituto,
      m.Incubo, m.Russare, m.Ventogelato, m.Resistenza, m.Bullo,
      m.Sonnolalia, m.Psicamisu, m.Ripresa, m.Rinfrescata
    ],
    evolution: {stage: "stage1", to: []}
  },
  "122": {
    name: "Mr. Mime",
    dexNumber: 122,
    type: ["Psico", "Folletto"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Barriera, m.Confusione],
      8: [m.Sostituto],
      12: [m.Meditazione],
      15: [m.Doppiasberla],
      19: [m.Schermoluce, m.Riflesso],
      22: [m.Fogliamagica],
      26: [m.Ripeti],
      29: [m.Psicoraggio],
      33: [m.Riciclo],
      36: [m.Raggiro],
      43: [m.Psichico],
      47: [m.Staffetta],
      50: [m.Salvaguardia]
    },
    movesByMT: [
      m.IperRaggio, m.Solarraggio, m.Fulmine, m.Tuono, m.Tossina,
      m.Psichico, m.Doppioteam, m.Schermoluce, m.Riflesso, m.Flash,
      m.Riposo, m.Furto, m.Protezione, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Salvaguardia, m.Introforza, m.Pioggiadanza, m.Giornodisole,
      m.PallaOmbra, m.Attaccalite, m.Facciata, m.Centripugno, m.Provocazione,
      m.Breccia, m.Scippo, m.Forzasegreta, m.Calmamente, m.Ondashock,
      m.Ipnosi, m.Mimica, m.Psicamisu, m.Divinazione, m.Bruciapelo,
      m.Raggiro, m.Megapugno, m.Fuocopugno, m.Gelopugno, m.Tuonopugno,
      m.Megacalcio, m.Corposcontro, m.Sdoppiatore, m.Contrattacco, m.MovimentoSismico,
      m.Tuononda, m.Metronomo, m.Mangiasogni, m.Sostituto, m.Incubo,
      m.Russare, m.Fangosberla, m.Resistenza, m.Bullo, m.Sonnolalia,
      m.Ripeti
    ],
    evolution: {stage: "base", to: []}
  },
  "123": {
    name: "Scyther",
    dexNumber: 123,
    type: ["Coleottero", "Volante"],
    gender: ["Maschio", "Femmina"],
    spriteGendered: true,
    encounter: {
      rarity: "s",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 50,
    movesByLevel: {
      5: [m.Fulmisguardo, m.AttaccoRapido],
      6: [m.Focalenergia],
      11: [m.Inseguimento],
      16: [m.Falsofinale],
      21: [m.Agilita],
      26: [m.AttaccodAla],
      31: [m.Lacerazione],
      36: [m.Danzaspada],
      41: [m.Doppioteam],
      46: [m.Tagliofuria]
    },
    movesByMT: [
      m.Taglio, m.IperRaggio, m.Tossina, m.Doppioteam, m.Riposo,
      m.Furto, m.Protezione, m.Alacciaio, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Giornodisole, m.Spaccaroccia,
      m.Facciata, m.Forzasegreta, m.Aeroassalto, m.Ventagliente, m.Contrattacco,
      m.Schermoluce, m.Contropiede, m.Resistenza, m.Salvaguardia, m.Staffetta,
      m.Ventargenteo, m.Danzaspada, m.Sdoppiatore, m.Mimica, m.Comete,
      m.Sostituto, m.Russare, m.Bullo, m.Tagliofuria, m.Sonnolalia,
      m.Lacerazione, m.Mattindoro
    ],
    evolution: {stage: "base", to: [{species: "212", trigger: {kind: "item", item: i.metalcopertura}}]}
  },
  "124": {
    name: "Jynx",
    dexNumber: 124,
    type: ["Ghiaccio", "Psico"],
    gender: ["Femmina"],
    encounter: {
      rarity: "s",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Botta, m.Leccata],
      9: [m.Demonbacio],
      13: [m.Polneve],
      21: [m.Doppiasberla],
      25: [m.Gelopugno],
      35: [m.Malosguardo],
      41: [m.Falselacrime],
      51: [m.Corposcontro],
      57: [m.Ultimocanto],
      67: [m.Bora]
    },
    movesByMT: [
      m.Geloraggio, m.Bora, m.IperRaggio, m.Tossina, m.Psichico,
      m.Doppioteam, m.Schermoluce, m.Riflesso, m.Flash, m.Riposo,
      m.Furto, m.Protezione, m.Attrazione, m.Ritorno, m.Frustrazione,
      m.Introforza, m.Pioggiadanza, m.PallaOmbra, m.Grandine, m.Attaccalite,
      m.Facciata, m.Centripugno, m.Provocazione, m.Breccia, m.Forzasegreta,
      m.Calmamente, m.Idropulsar, m.Gelopugno, m.Meditazione, m.Psicamisu,
      m.Bruciapelo, m.Desiderio, m.Megapugno, m.Megacalcio, m.Corposcontro,
      m.Sdoppiatore, m.Contrattacco, m.MovimentoSismico, m.Mimica, m.Metronomo,
      m.Mangiasogni, m.Sostituto, m.Incubo, m.Russare, m.Fangosberla,
      m.Ventogelato, m.Resistenza, m.Bullo, m.Sonnolalia, m.Dinamipugno
    ],
    evolution: {stage: "base", to: []}
  },
  "125": {
    name: "Electabuzz",
    dexNumber: 125,
    type: ["Elettro"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "s",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Fulmisguardo, m.AttaccoRapido],
      9: [m.Tuonopugno],
      17: [m.Schermoluce],
      25: [m.Comete],
      36: [m.Stridio],
      47: [m.Fulmine],
      58: [m.Tuono]
    },
    movesByMT: [
      m.IperRaggio, m.Forza, m.Fulmine, m.Tuono, m.Tossina,
      m.Psichico, m.Doppioteam, m.Schermoluce, m.Flash, m.Riposo,
      m.Furto, m.Protezione, m.Attrazione, m.Ritorno, m.Frustrazione,
      m.Codacciaio, m.Introforza, m.Pioggiadanza, m.Spaccaroccia, m.Facciata,
      m.Centripugno, m.Breccia, m.Forzasegreta, m.Ondashock, m.Colpokarate,
      m.Fuocopugno, m.Gelopugno, m.Calciorullo, m.Meditazione, m.Barriera,
      m.Incrocolpo, m.Megapugno, m.Tuonopugno, m.Megacalcio, m.Corposcontro,
      m.Sdoppiatore, m.Contrattacco, m.MovimentoSismico, m.Tuononda, m.Mimica,
      m.Comete, m.Sostituto, m.Russare, m.Fangosberla, m.Resistenza,
      m.Bullo, m.Sonnolalia, m.Dinamipugno
    ],
    evolution: {stage: "base", to: []}
  },
  "126": {
    name: "Magmar",
    dexNumber: 126,
    type: ["Fuoco"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "s",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Braciere],
      7: [m.Fulmisguardo],
      13: [m.Smog],
      19: [m.Fuocopugno],
      25: [m.MurodiFumo],
      33: [m.Giornodisole],
      41: [m.Lanciafiamme],
      49: [m.Stordiraggio],
      57: [m.Fuocobomba]
    },
    movesByMT: [
      m.Lanciafiamme, m.IperRaggio, m.Forza, m.Tossina, m.Psichico,
      m.Doppioteam, m.Fuocobomba, m.Riposo, m.Furto, m.Protezione,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Codacciaio, m.Introforza,
      m.Giornodisole, m.Spaccaroccia, m.Facciata, m.Centripugno, m.Breccia,
      m.Forzasegreta, m.Colpokarate, m.Megapugno, m.Tuonopugno, m.Stridio,
      m.Barriera, m.Incrocolpo, m.Fuocopugno, m.Megacalcio, m.Corposcontro,
      m.Sdoppiatore, m.Contrattacco, m.MovimentoSismico, m.Mimica, m.Sostituto,
      m.Russare, m.Fangosberla, m.Resistenza, m.Bullo, m.Sonnolalia,
      m.Dinamipugno
    ],
    evolution: {stage: "base", to: []}
  },
  "127": {
    name: "Pinsir",
    dexNumber: 127,
    type: ["Coleottero"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Presa, m.Focalenergia],
      7: [m.Legatutto],
      13: [m.MovimentoSismico],
      19: [m.Rafforzatore],
      25: [m.Vendetta],
      31: [m.Breccia],
      37: [m.Ghigliottina],
      43: [m.Sottomissione],
      49: [m.Danzaspada]
    },
    movesByMT: [
      m.Taglio, m.IperRaggio, m.Forza, m.Terremoto, m.Fossa,
      m.Tossina, m.Doppioteam, m.Riposo, m.Furto, m.Protezione,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Introforza, m.Pioggiadanza,
      m.Giornodisole, m.Spaccaroccia, m.Facciata, m.Centripugno, m.Breccia,
      m.Forzasegreta, m.Rocciotomba, m.Granfisico, m.Furia, m.Flagello,
      m.Finta, m.Falsofinale, m.Danzaspada, m.Corposcontro, m.Sdoppiatore,
      m.MovimentoSismico, m.Mimica, m.Frana, m.Sostituto, m.Russare,
      m.Resistenza, m.Bullo, m.Tagliofuria, m.Sonnolalia, m.Ghigliottina,
      m.Sottomissione, m.Altruismo
    ],
    evolution: {stage: "base", to: []}
  },
  "128": {
    name: "Tauros",
    dexNumber: 128,
    type: ["Normale"],
    gender: ["Maschio"],
    encounter: {
      rarity: "s",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Azione, m.Colpocoda, m.Ira],
      8: [m.Incornata],
      13: [m.Visotruce],
      19: [m.Inseguimento],
      26: [m.Bullo],
      34: [m.Riposo],
      43: [m.Colpo],
      53: [m.Riduttore]
    },
    movesByMT: [
      m.Lanciafiamme, m.Surf, m.Geloraggio, m.Bora, m.IperRaggio,
      m.Forza, m.Solarraggio, m.Fulmine, m.Tuono, m.Terremoto,
      m.Tossina, m.Doppioteam, m.Fuocobomba, m.Riposo, m.Protezione,
      m.Terrempesta, m.Attrazione, m.Ritorno, m.Frustrazione, m.Codacciaio,
      m.Introforza, m.Pioggiadanza, m.Giornodisole, m.Spaccaroccia, m.Facciata,
      m.Forzasegreta, m.Rocciotomba, m.Ondashock, m.Idropulsar, m.Corposcontro,
      m.Sdoppiatore, m.Mimica, m.Sostituto, m.Russare, m.Ventogelato,
      m.Resistenza, m.Bullo, m.Sonnolalia, m.Colpocoda, m.Rinfrescata
    ],
    evolution: {stage: "base", to: []}
  },
  "129": {
    name: "Magikarp",
    dexNumber: 129,
    type: ["Acqua"],
    gender: ["Maschio", "Femmina"],
    spriteGendered: true,
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 30
    },
    exp: 50,
    movesByLevel: {
      5: [m.Azione, m.Splash],
      30: [m.Flagello]
    },
    movesByMT: [],
    evolution: {stage: "stage1", to: [{species: "130", trigger: {kind: "level", level: 20}}]}
  },
  "130": {
    name: "Gyarados",
    dexNumber: 130,
    type: ["Acqua", "Volante"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 20,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Colpo],
      20: [m.Morso],
      25: [m.IradiDrago],
      30: [m.Fulmisguardo],
      35: [m.Tornado],
      40: [m.Idropompa],
      45: [m.Pioggiadanza],
      50: [m.Dragodanza],
      55: [m.IperRaggio]
    },
    movesByMT: [
      m.Boato, m.Lanciafiamme, m.Surf, m.Geloraggio, m.Bora,
      m.IperRaggio, m.Forza, m.Fulmine, m.Tuono, m.Terremoto,
      m.Tossina, m.Doppioteam, m.Fuocobomba, m.Cascata, m.Riposo,
      m.Protezione, m.Terrempesta, m.Attrazione, m.Ritorno, m.Frustrazione,
      m.Introforza, m.Pioggiadanza, m.Spaccaroccia, m.Grandine, m.Attaccalite,
      m.Facciata, m.Provocazione, m.Forzasegreta, m.Sub, m.Idropulsar,
      m.Corposcontro, m.Sdoppiatore, m.Tuononda, m.Mimica, m.Sostituto,
      m.Russare, m.Ventogelato, m.Resistenza, m.Bullo, m.Sonnolalia
    ],
    evolution: {stage: "stage1", to: []}
  },
  "131": {
    name: "Lapras",
    dexNumber: 131,
    type: ["Acqua", "Ghiaccio"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "s",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Ruggito, m.Canto, m.Pistolacqua],
      7: [m.Nebbia],
      13: [m.Corposcontro],
      19: [m.Stordiraggio],
      25: [m.Ultimocanto],
      31: [m.Geloraggio],
      37: [m.Pioggiadanza],
      43: [m.Salvaguardia],
      49: [m.Idropompa],
      55: [m.Purogelo]
    },
    movesByMT: [
      m.Boato, m.Surf, m.Geloraggio, m.Bora, m.IperRaggio,
      m.Forza, m.Fulmine, m.Tuono, m.Tossina, m.Psichico,
      m.Doppioteam, m.Cascata, m.Riposo, m.Protezione, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Salvaguardia, m.Codacciaio, m.Introforza,
      m.Pioggiadanza, m.Spaccaroccia, m.Grandine, m.Facciata, m.Forzasegreta,
      m.Sub, m.Ondashock, m.Idropulsar, m.Perforcorno, m.Sostituto,
      m.Maledizione, m.Preveggenza, m.Sonnolalia, m.Rinfrescata, m.Solletico,
      m.Dragodanza, m.Corposcontro, m.Sdoppiatore, m.Mimica, m.Mangiasogni,
      m.Incubo, m.Russare, m.Ventogelato, m.Resistenza, m.Bullo,
      m.Idropompa, m.Rintoccasana
    ],
    evolution: {stage: "base", to: []}
  },
  "132": {
    name: "Ditto",
    dexNumber: 132,
    type: ["Normale"],
    gender: [],
    encounter: {
      rarity: "s",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Trasformazione]
    },
    movesByMT: [],
    evolution: {stage: "base", to: []}
  },
  "133": {
    name: "Eevee",
    dexNumber: 133,
    type: ["Normale"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 50
    },
    exp: 50,
    movesByLevel: {
      5: [m.Azione, m.Colpocoda, m.Altruismo],
      8: [m.Turbosabbia],
      16: [m.Ruggito],
      23: [m.AttaccoRapido],
      30: [m.Morso],
      36: [m.Staffetta],
      42: [m.Riduttore]
    },
    movesByMT: [
      m.Fossa, m.Tossina, m.Doppioteam, m.Riposo, m.Protezione,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Codacciaio, m.Introforza,
      m.Pioggiadanza, m.Giornodisole, m.PallaOmbra, m.Facciata, m.Forzasegreta,
      m.Maledizione, m.Flagello, m.Resistenza, m.Fascino, m.Desiderio,
      m.Solletico, m.Corposcontro, m.Sdoppiatore, m.Mimica, m.Comete,
      m.Sostituto, m.Russare, m.Fangosberla, m.Bullo, m.Sonnolalia
    ],
    evolution: {stage: "base", to: [{species: "134", trigger: {kind: "item", item: i.pietraidrica}}, {species: "135", trigger: {kind: "item", item: i.pietratuono}}, {species: "136", trigger: {kind: "item", item: i.pietrafocaia}}, {species: "196", trigger: {kind: "item", item: i.pietrasolare}}, {species: "197", trigger: {kind: "item", item: i.pietralunare}}]}
  },
  "134": {
    name: "Vaporeon",
    dexNumber: 134,
    type: ["Acqua"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Azione, m.Colpocoda, m.Altruismo],
      8: [m.Turbosabbia],
      16: [m.Pistolacqua],
      23: [m.AttaccoRapido],
      30: [m.Morso],
      36: [m.Raggiaurora],
      42: [m.Nube],
      47: [m.ScudoAcido],
      52: [m.Idropompa]
    },
    movesByMT: [
      m.Boato, m.Surf, m.Geloraggio, m.Bora, m.IperRaggio,
      m.Fossa, m.Tossina, m.Doppioteam, m.Cascata, m.Riposo,
      m.Protezione, m.Attrazione, m.Ritorno, m.Frustrazione, m.Codacciaio,
      m.Introforza, m.Pioggiadanza, m.Giornodisole, m.PallaOmbra, m.Grandine,
      m.Facciata, m.Forzasegreta, m.Sub, m.Idropulsar, m.Maledizione,
      m.Flagello, m.Resistenza, m.Fascino, m.Desiderio, m.Solletico,
      m.Corposcontro, m.Sdoppiatore, m.Mimica, m.Comete, m.Sostituto,
      m.Russare, m.Fangosberla, m.Ventogelato, m.Bullo, m.Sonnolalia
    ],
    evolution: {stage: "stage1", to: []}
  },
  "135": {
    name: "Jolteon",
    dexNumber: 135,
    type: ["Elettro"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Azione, m.Colpocoda, m.Altruismo],
      8: [m.Turbosabbia],
      16: [m.Tuonoshock],
      23: [m.AttaccoRapido],
      30: [m.Doppiocalcio],
      36: [m.Missilspillo],
      42: [m.Tuononda],
      47: [m.Agilita],
      52: [m.Tuono]
    },
    movesByMT: [
      m.Boato, m.IperRaggio, m.Fulmine, m.Tuono, m.Fossa,
      m.Tossina, m.Doppioteam, m.Flash, m.Riposo, m.Protezione,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Codacciaio, m.Introforza,
      m.Pioggiadanza, m.Giornodisole, m.PallaOmbra, m.Facciata, m.Forzasegreta,
      m.Ondashock, m.Maledizione, m.Flagello, m.Resistenza, m.Fascino,
      m.Desiderio, m.Solletico, m.Corposcontro, m.Sdoppiatore, m.Tuononda,
      m.Mimica, m.Comete, m.Sostituto, m.Russare, m.Fangosberla,
      m.Bullo, m.Sonnolalia
    ],
    evolution: {stage: "stage1", to: []}
  },
  "136": {
    name: "Flareon",
    dexNumber: 136,
    type: ["Fuoco"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Azione, m.Colpocoda, m.Altruismo],
      8: [m.Turbosabbia],
      16: [m.Braciere],
      23: [m.AttaccoRapido],
      30: [m.Morso],
      36: [m.Turbofuoco],
      42: [m.Smog],
      47: [m.Fulmisguardo],
      52: [m.Lanciafiamme]
    },
    movesByMT: [
      m.Boato, m.Lanciafiamme, m.IperRaggio, m.Fossa, m.Tossina,
      m.Doppioteam, m.Fuocobomba, m.Riposo, m.Protezione, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Codacciaio, m.Introforza, m.Pioggiadanza,
      m.Giornodisole, m.PallaOmbra, m.Facciata, m.Forzasegreta, m.Vampata,
      m.Maledizione, m.Flagello, m.Resistenza, m.Fascino, m.Desiderio,
      m.Solletico, m.Corposcontro, m.Sdoppiatore, m.Mimica, m.Comete,
      m.Sostituto, m.Russare, m.Fangosberla, m.Bullo, m.Sonnolalia
    ],
    evolution: {stage: "stage1", to: []}
  },
  "137": {
    name: "Porygon",
    dexNumber: 137,
    type: ["Normale"],
    gender: [],
    encounter: {
      rarity: "s",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 50,
    movesByLevel: {
      5: [m.Azione, m.Conversione, m.Conversione2],
      9: [m.Agilita],
      12: [m.Psicoraggio],
      20: [m.Ripresa],
      24: [m.Affilatore],
      32: [m.Localizza],
      36: [m.Tripletta],
      44: [m.Riciclo],
      48: [m.Falcecannone]
    },
    movesByMT: [
      m.Geloraggio, m.Bora, m.IperRaggio, m.Solarraggio, m.Fulmine,
      m.Tuono, m.Tossina, m.Psichico, m.Doppioteam, m.Flash,
      m.Riposo, m.Furto, m.Protezione, m.Ritorno, m.Frustrazione,
      m.Codacciaio, m.Introforza, m.Pioggiadanza, m.Giornodisole, m.PallaOmbra,
      m.Facciata, m.Forzasegreta, m.Aeroassalto, m.Ondashock, m.Sdoppiatore,
      m.Tuononda, m.Mimica, m.Comete, m.Mangiasogni, m.Sostituto,
      m.Incubo, m.Russare, m.Ventogelato, m.Resistenza, m.Bullo,
      m.Sonnolalia, m.Psicamisu
    ],
    evolution: {stage: "base", to: [{species: "233", trigger: {kind: "item", item: i.upgrade}}]}
  },
  "138": {
    name: "Omanyte",
    dexNumber: 138,
    type: ["Roccia", "Acqua"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "f",
      minLevel: 5,
      maxLevel: 50
    },
    exp: 50,
    movesByLevel: {
      5: [m.Ritirata, m.Limitazione],
      13: [m.Morso],
      19: [m.Pistolacqua],
      25: [m.Colpodifango],
      31: [m.Fulmisguardo],
      37: [m.Protezione],
      43: [m.Solletico],
      49: [m.Forzantica],
      55: [m.Idropompa]
    },
    movesByMT: [
      m.Surf, m.Geloraggio, m.Bora, m.Tossina, m.Doppioteam,
      m.Cascata, m.Riposo, m.Furto, m.Protezione, m.Terrempesta,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Introforza, m.Pioggiadanza,
      m.Spaccaroccia, m.Grandine, m.Facciata, m.Forzasegreta, m.Sub,
      m.Rocciotomba, m.Idropulsar, m.Schianto, m.Supersuono, m.Bollaraggio,
      m.Raggiaurora, m.Nube, m.Frana, m.Punte, m.Corposcontro,
      m.Sdoppiatore, m.Mimica, m.Sostituto, m.Russare, m.Ventogelato,
      m.Resistenza, m.Rotolamento, m.Bullo, m.Sonnolalia
    ],
    evolution: {stage: "base", to: [{species: "139", trigger: {kind: "level", level: 40}}]}
  },
  "139": {
    name: "Omastar",
    dexNumber: 139,
    type: ["Roccia", "Acqua"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "f",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Ritirata, m.Limitazione],
      13: [m.Morso],
      19: [m.Pistolacqua],
      25: [m.Colpodifango],
      31: [m.Fulmisguardo],
      37: [m.Protezione],
      40: [m.Sparalance],
      46: [m.Solletico],
      55: [m.Forzantica],
      65: [m.Idropompa]
    },
    movesByMT: [
      m.Surf, m.Geloraggio, m.Bora, m.IperRaggio, m.Tossina,
      m.Doppioteam, m.Cascata, m.Riposo, m.Furto, m.Protezione,
      m.Terrempesta, m.Attrazione, m.Ritorno, m.Frustrazione, m.Introforza,
      m.Pioggiadanza, m.Spaccaroccia, m.Grandine, m.Facciata, m.Forzasegreta,
      m.Sub, m.Rocciotomba, m.Idropulsar, m.Schianto, m.Supersuono,
      m.Bollaraggio, m.Raggiaurora, m.Nube, m.Frana, m.Punte,
      m.Corposcontro, m.Sdoppiatore, m.MovimentoSismico, m.Mimica, m.Sostituto,
      m.Russare, m.Ventogelato, m.Resistenza, m.Rotolamento, m.Bullo,
      m.Sonnolalia
    ],
    evolution: {stage: "stage1", to: []}
  },
  "140": {
    name: "Kabuto",
    dexNumber: 140,
    type: ["Roccia", "Acqua"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "f",
      minLevel: 5,
      maxLevel: 50
    },
    exp: 50,
    movesByLevel: {
      5: [m.Graffio, m.Rafforzatore],
      13: [m.Assorbimento],
      19: [m.Fulmisguardo],
      25: [m.Colpodifango],
      31: [m.Turbosabbia],
      37: [m.Resistenza],
      43: [m.Ferrostrido],
      49: [m.Megassorbimento],
      55: [m.Forzantica]
    },
    movesByMT: [
      m.Surf, m.Geloraggio, m.Bora, m.Fossa, m.Tossina,
      m.Doppioteam, m.Cascata, m.Riposo, m.Furto, m.Protezione,
      m.Terrempesta, m.Gigassorbimento, m.Attrazione, m.Ritorno, m.Frustrazione,
      m.Introforza, m.Pioggiadanza, m.Spaccaroccia, m.Grandine, m.Facciata,
      m.Forzasegreta, m.Rocciotomba, m.Aeroassalto, m.Idropulsar, m.Bollaraggio,
      m.Raggiaurora, m.Stordiraggio, m.Flagello, m.Rapigiro, m.Privazione,
      m.Corposcontro, m.Sdoppiatore, m.Mimica, m.Frana, m.Sostituto,
      m.Russare, m.Ventogelato, m.Resistenza, m.Rotolamento, m.Bullo,
      m.Sonnolalia
    ],
    evolution: {stage: "base", to: [{species: "141", trigger: {kind: "level", level: 40}}]}
  },
  "141": {
    name: "Kabutops",
    dexNumber: 141,
    type: ["Roccia", "Acqua"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "f",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Graffio, m.Rafforzatore, m.Tagliofuria],
      13: [m.Assorbimento],
      19: [m.Fulmisguardo],
      25: [m.Colpodifango],
      31: [m.Turbosabbia],
      37: [m.Resistenza],
      40: [m.Lacerazione],
      46: [m.Ferrostrido],
      55: [m.Megassorbimento],
      65: [m.Forzantica]
    },
    movesByMT: [
      m.Taglio, m.Surf, m.Geloraggio, m.Bora, m.IperRaggio,
      m.Fossa, m.Tossina, m.Doppioteam, m.Cascata, m.Riposo,
      m.Furto, m.Protezione, m.Terrempesta, m.Gigassorbimento, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Spaccaroccia,
      m.Grandine, m.Facciata, m.Breccia, m.Forzasegreta, m.Sub,
      m.Rocciotomba, m.Aeroassalto, m.Idropulsar, m.Bollaraggio, m.Raggiaurora,
      m.Stordiraggio, m.Flagello, m.Rapigiro, m.Privazione, m.Danzaspada,
      m.Megacalcio, m.Corposcontro, m.Sdoppiatore, m.MovimentoSismico, m.Mimica,
      m.Frana, m.Sostituto, m.Russare, m.Ventogelato, m.Resistenza,
      m.Rotolamento, m.Bullo, m.Tagliofuria, m.Sonnolalia
    ],
    evolution: {stage: "stage1", to: []}
  },
  "142": {
    name: "Aerodactyl",
    dexNumber: 142,
    type: ["Roccia", "Volante"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "f",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.AttaccodAla],
      8: [m.Agilita],
      15: [m.Morso],
      22: [m.Supersuono],
      29: [m.Forzantica],
      36: [m.Visotruce],
      43: [m.Riduttore],
      50: [m.IperRaggio]
    },
    movesByMT: [
      m.Volo, m.Boato, m.Lanciafiamme, m.IperRaggio, m.Forza,
      m.Terremoto, m.Tossina, m.Doppioteam, m.Fuocobomba, m.Riposo,
      m.Furto, m.Protezione, m.Terrempesta, m.Alacciaio, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Codacciaio, m.Introforza, m.Pioggiadanza,
      m.Giornodisole, m.Spaccaroccia, m.Attaccalite, m.Facciata, m.Provocazione,
      m.Forzasegreta, m.Rocciotomba, m.Aeroassalto, m.Dragartigli, m.Turbine,
      m.Maledizione, m.Preveggenza, m.Dragospiro, m.Inseguimento, m.Sdoppiatore,
      m.Mimica, m.Comete, m.Aeroattacco, m.Frana, m.Sostituto,
      m.Russare, m.Resistenza, m.Bullo, m.Sonnolalia
    ],
    evolution: {stage: "base", to: []}
  },
  "143": {
    name: "Snorlax",
    dexNumber: 143,
    type: ["Normale"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "s",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Azione, m.Amnesia],
      9: [m.Ricciolscudo],
      13: [m.Panciamburo],
      17: [m.Bottintesta],
      21: [m.Sbadiglio],
      25: [m.Riposo],
      29: [m.Russare],
      33: [m.Corposcontro],
      37: [m.Sonnolalia],
      41: [m.Blocco],
      45: [m.Supplica],
      49: [m.Rotolamento],
      53: [m.IperRaggio]
    },
    movesByMT: [
      m.Lanciafiamme, m.Surf, m.Geloraggio, m.Bora, m.IperRaggio,
      m.Forza, m.Solarraggio, m.Fulmine, m.Tuono, m.Terremoto,
      m.Tossina, m.Psichico, m.Doppioteam, m.Fuocobomba, m.Riposo,
      m.Protezione, m.Terrempesta, m.Attrazione, m.Ritorno, m.Frustrazione,
      m.Introforza, m.Pioggiadanza, m.Giornodisole, m.PallaOmbra, m.Facciata,
      m.Centripugno, m.Breccia, m.Forzasegreta, m.Rocciotomba, m.Ondashock,
      m.Idropulsar, m.Sdoppiatore, m.Abisso, m.Leccata, m.Sostituto,
      m.Maledizione, m.Fascino, m.Megapugno, m.Fuocopugno, m.Gelopugno,
      m.Tuonopugno, m.Megacalcio, m.Corposcontro, m.Contrattacco, m.MovimentoSismico,
      m.Mimica, m.Ricciolscudo, m.Metronomo, m.Autodistruzione, m.Frana,
      m.Russare, m.Fangosberla, m.Ventogelato, m.Resistenza, m.Rotolamento,
      m.Bullo, m.Sonnolalia, m.Dinamipugno, m.Psicamisu, m.Rinfrescata
    ],
    evolution: {stage: "base", to: []}
  },
  "144": {
    name: "Articuno",
    dexNumber: 144,
    type: ["Ghiaccio", "Volante"],
    gender: [],
    encounter: {
      rarity: "l",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 300,
    movesByLevel: {
      5: [m.Raffica, m.Polneve],
      13: [m.Nebbia],
      25: [m.Agilita],
      37: [m.Leggimente],
      49: [m.Geloraggio],
      61: [m.Riflesso],
      73: [m.Bora],
      85: [m.Purogelo]
    },
    movesByMT: [
      m.Volo, m.Boato, m.Geloraggio, m.Bora, m.IperRaggio,
      m.Tossina, m.Doppioteam, m.Riflesso, m.Riposo, m.Protezione,
      m.Terrempesta, m.Alacciaio, m.Ritorno, m.Frustrazione, m.Introforza,
      m.Pioggiadanza, m.Giornodisole, m.Spaccaroccia, m.Grandine, m.Facciata,
      m.Forzasegreta, m.Aeroassalto, m.Idropulsar, m.Falcecannone, m.Sdoppiatore,
      m.Mimica, m.Comete, m.Aeroattacco, m.Sostituto, m.Russare,
      m.Fangosberla, m.Ventogelato, m.Resistenza, m.Bullo, m.Sonnolalia,
      m.Nube, m.Rintoccasana, m.Extrasenso
    ],
    evolution: {stage: "base", to: []}
  },
  "145": {
    name: "Zapdos",
    dexNumber: 145,
    type: ["Elettro", "Volante"],
    gender: [],
    encounter: {
      rarity: "l",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 300,
    movesByLevel: {
      5: [m.Beccata, m.Tuonoshock],
      13: [m.Tuononda],
      25: [m.Agilita],
      37: [m.Individua],
      49: [m.Perforbecco],
      61: [m.Sottocarica],
      73: [m.Schermoluce],
      85: [m.Tuono]
    },
    movesByMT: [
      m.Volo, m.Boato, m.IperRaggio, m.Fulmine, m.Tuono,
      m.Tossina, m.Doppioteam, m.Schermoluce, m.Flash, m.Riposo,
      m.Protezione, m.Terrempesta, m.Alacciaio, m.Ritorno, m.Frustrazione,
      m.Introforza, m.Pioggiadanza, m.Giornodisole, m.Spaccaroccia, m.Facciata,
      m.Forzasegreta, m.Aeroassalto, m.Ondashock, m.Sdoppiatore, m.Tuononda,
      m.Mimica, m.Comete, m.Aeroattacco, m.Sostituto, m.Russare,
      m.Fangosberla, m.Resistenza, m.Bullo, m.Sonnolalia, m.Staffetta,
      m.Ferrostrido, m.Extrasenso
    ],
    evolution: {stage: "base", to: []}
  },
  "146": {
    name: "Moltres",
    dexNumber: 146,
    type: ["Fuoco", "Volante"],
    gender: [],
    encounter: {
      rarity: "l",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 300,
    movesByLevel: {
      5: [m.AttaccodAla, m.Braciere],
      13: [m.Turbofuoco],
      25: [m.Agilita],
      37: [m.Resistenza],
      49: [m.Lanciafiamme],
      61: [m.Salvaguardia],
      73: [m.Ondacalda],
      85: [m.Aeroattacco]
    },
    movesByMT: [
      m.Volo, m.Boato, m.Lanciafiamme, m.IperRaggio, m.Tossina,
      m.Doppioteam, m.Fuocobomba, m.Riposo, m.Protezione, m.Terrempesta,
      m.Alacciaio, m.Ritorno, m.Frustrazione, m.Salvaguardia, m.Introforza,
      m.Pioggiadanza, m.Giornodisole, m.Spaccaroccia, m.Facciata, m.Forzasegreta,
      m.Vampata, m.Aeroassalto, m.Falcecannone, m.Sdoppiatore, m.Mimica,
      m.Comete, m.Aeroattacco, m.Sostituto, m.Russare, m.Fangosberla,
      m.Resistenza, m.Bullo, m.Sonnolalia, m.Mattindoro, m.Fuocofatuo,
      m.Extrasenso
    ],
    evolution: {stage: "base", to: []}
  },
  "147": {
    name: "Dratini",
    dexNumber: 147,
    type: ["Drago"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "s",
      minLevel: 5,
      maxLevel: 35
    },
    exp: 50,
    movesByLevel: {
      5: [m.Avvolgibotta, m.Fulmisguardo],
      8: [m.Tuononda],
      15: [m.Tornado],
      22: [m.IradiDrago],
      29: [m.Schianto],
      36: [m.Agilita],
      43: [m.Salvaguardia],
      50: [m.Oltraggio],
      57: [m.IperRaggio]
    },
    movesByMT: [
      m.Lanciafiamme, m.Surf, m.Geloraggio, m.Bora, m.IperRaggio,
      m.Fulmine, m.Tuono, m.Tossina, m.Doppioteam, m.Fuocobomba,
      m.Cascata, m.Riposo, m.Protezione, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Salvaguardia, m.Codacciaio, m.Introforza, m.Pioggiadanza,
      m.Giornodisole, m.Grandine, m.Facciata, m.Forzasegreta, m.Ondashock,
      m.Idropulsar, m.Supersuono, m.Nebbia, m.Schermoluce, m.Nube,
      m.Dragospiro, m.Dragodanza, m.Corposcontro, m.Sdoppiatore, m.Tuononda,
      m.Mimica, m.Comete, m.Sostituto, m.Russare, m.Ventogelato,
      m.Resistenza, m.Bullo, m.Sonnolalia
    ],
    evolution: {stage: "base", to: [{species: "148", trigger: {kind: "level", level: 30}}]}
  },
  "148": {
    name: "Dragonair",
    dexNumber: 148,
    type: ["Drago"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "m",
      minLevel: 30,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Avvolgibotta, m.Fulmisguardo],
      8: [m.Tuononda],
      15: [m.Tornado],
      22: [m.IradiDrago],
      29: [m.Schianto],
      38: [m.Agilita],
      47: [m.Salvaguardia],
      56: [m.Oltraggio],
      65: [m.IperRaggio]
    },
    movesByMT: [
      m.Lanciafiamme, m.Surf, m.Geloraggio, m.Bora, m.IperRaggio,
      m.Fulmine, m.Tuono, m.Tossina, m.Doppioteam, m.Fuocobomba,
      m.Cascata, m.Riposo, m.Protezione, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Salvaguardia, m.Codacciaio, m.Introforza, m.Pioggiadanza,
      m.Giornodisole, m.Grandine, m.Facciata, m.Forzasegreta, m.Ondashock,
      m.Idropulsar, m.Supersuono, m.Nebbia, m.Schermoluce, m.Nube,
      m.Dragospiro, m.Dragodanza, m.Corposcontro, m.Sdoppiatore, m.Tuononda,
      m.Mimica, m.Comete, m.Sostituto, m.Russare, m.Ventogelato,
      m.Resistenza, m.Bullo, m.Sonnolalia
    ],
    evolution: {stage: "stage1", to: [{species: "149", trigger: {kind: "level", level: 55}}]}
  },
  "149": {
    name: "Dragonite",
    dexNumber: 149,
    type: ["Drago", "Volante"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "m",
      minLevel: 55,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.Avvolgibotta, m.Fulmisguardo],
      8: [m.Tuononda],
      15: [m.Tornado],
      22: [m.IradiDrago],
      29: [m.Schianto],
      38: [m.Agilita],
      47: [m.Salvaguardia],
      55: [m.AttaccodAla],
      61: [m.Oltraggio],
      75: [m.IperRaggio]
    },
    movesByMT: [
      m.Taglio, m.Volo, m.Boato, m.Lanciafiamme, m.Surf,
      m.Geloraggio, m.Bora, m.IperRaggio, m.Forza, m.Fulmine,
      m.Tuono, m.Terremoto, m.Tossina, m.Doppioteam, m.Fuocobomba,
      m.Cascata, m.Riposo, m.Protezione, m.Terrempesta, m.Alacciaio,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Salvaguardia, m.Codacciaio,
      m.Introforza, m.Pioggiadanza, m.Giornodisole, m.Spaccaroccia, m.Grandine,
      m.Facciata, m.Centripugno, m.Breccia, m.Forzasegreta, m.Sub,
      m.Rocciotomba, m.Aeroassalto, m.Dragartigli, m.Ondashock, m.Idropulsar,
      m.Supersuono, m.Nebbia, m.Schermoluce, m.Nube, m.Dragospiro,
      m.Dragodanza, m.Fuocopugno, m.Gelopugno, m.Tuonopugno, m.Corposcontro,
      m.Sdoppiatore, m.Tuononda, m.Mimica, m.Comete, m.Sostituto,
      m.Russare, m.Fangosberla, m.Ventogelato, m.Resistenza, m.Bullo,
      m.Tagliofuria, m.Sonnolalia, m.Dinamipugno, m.Rintoccasana
    ],
    evolution: {stage: "stage2", to: []}
  },
  "150": {
    name: "Mewtwo",
    dexNumber: 150,
    type: ["Psico"],
    gender: [],
    encounter: {
      rarity: "l",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 300,
    movesByLevel: {
      5: [m.Inibitore, m.Confusione],
      11: [m.Barriera],
      22: [m.Nebbia],
      33: [m.Comete],
      44: [m.Ripresa],
      55: [m.Salvaguardia],
      66: [m.Psichico],
      77: [m.Psicamisu],
      88: [m.Divinazione],
      99: [m.Amnesia]
    },
    movesByMT: [
      m.Lanciafiamme, m.Geloraggio, m.Bora, m.IperRaggio, m.Forza,
      m.Solarraggio, m.Fulmine, m.Tuono, m.Terremoto, m.Tossina,
      m.Psichico, m.Doppioteam, m.Schermoluce, m.Riflesso, m.Fuocobomba,
      m.Flash, m.Riposo, m.Protezione, m.Terrempesta, m.Ritorno,
      m.Frustrazione, m.Salvaguardia, m.Codacciaio, m.Introforza, m.Pioggiadanza,
      m.Giornodisole, m.PallaOmbra, m.Spaccaroccia, m.Grandine, m.Attaccalite,
      m.Facciata, m.Centripugno, m.Provocazione, m.Breccia, m.Scippo,
      m.Forzasegreta, m.Rocciotomba, m.Aeroassalto, m.Granfisico, m.Calmamente,
      m.Ondashock, m.Idropulsar, m.Megapugno, m.Fuocopugno, m.Gelopugno,
      m.Tuonopugno, m.Megacalcio, m.Corposcontro, m.Sdoppiatore, m.Contrattacco,
      m.MovimentoSismico, m.Tuononda, m.Mimica, m.Metronomo, m.Autodistruzione,
      m.Comete, m.Mangiasogni, m.Sostituto, m.Incubo, m.Russare,
      m.Fangosberla, m.Ventogelato, m.Resistenza, m.Bullo, m.Sonnolalia,
      m.Dinamipugno, m.Psicamisu
    ],
    evolution: {stage: "base", to: []}
  },
  "151": {
    name: "Mew",
    dexNumber: 151,
    type: ["Psico"],
    gender: [],
    encounter: {
      rarity: "l",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 300,
    movesByLevel: {
      5: [m.Botta],
      10: [m.Trasformazione],
      20: [m.Megapugno],
      30: [m.Metronomo],
      40: [m.Psichico],
      50: [m.Forzantica]
    },
    movesByMT: [
      m.Taglio, m.Volo, m.Boato, m.Lanciafiamme, m.Surf,
      m.Geloraggio, m.Bora, m.IperRaggio, m.Forza, m.Solarraggio,
      m.Fulmine, m.Tuono, m.Terremoto, m.Fossa, m.Tossina,
      m.Psichico, m.Doppioteam, m.Schermoluce, m.Riflesso, m.Fuocobomba,
      m.Cascata, m.Flash, m.Riposo, m.Furto, m.Protezione,
      m.Fangobomba, m.Terrempesta, m.Gigassorbimento, m.Alacciaio, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Salvaguardia, m.Codacciaio, m.Introforza,
      m.Pioggiadanza, m.Giornodisole, m.PallaOmbra, m.Spaccaroccia, m.Grandine,
      m.Attaccalite, m.Facciata, m.Centripugno, m.Provocazione, m.Breccia,
      m.Scippo, m.Forzasegreta, m.Sub, m.Vampata, m.Rocciotomba,
      m.Semitraglia, m.Aeroassalto, m.Dragartigli, m.Granfisico, m.Calmamente,
      m.Ondashock, m.Idropulsar, m.Megapugno, m.Fuocopugno, m.Gelopugno,
      m.Tuonopugno, m.Danzaspada, m.Megacalcio, m.Corposcontro, m.Sdoppiatore,
      m.Contrattacco, m.MovimentoSismico, m.Tuononda, m.Ipnosi, m.OmbraNotturna,
      m.Mimica, m.Ricciolscudo, m.Metronomo, m.Autodistruzione, m.Comete,
      m.Covauova, m.Mangiasogni, m.Aeroattacco, m.Esplosione, m.Frana,
      m.Sostituto, m.Incubo, m.Russare, m.Finta, m.Fangosberla,
      m.Falcecannone, m.Ventogelato, m.Resistenza, m.Rotolamento, m.Bullo,
      m.Tagliofuria, m.Sonnolalia, m.Dinamipugno, m.Psicamisu, m.Bruciapelo
    ],
    evolution: {stage: "base", to: []}
  }
};