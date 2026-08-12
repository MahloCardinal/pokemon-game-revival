import * as m from "./moves.js";
import * as i from "./items.js";

export var SPECIES_LIBRARY = {
  "152": {
    name: "Chikorita",
    dexNumber: 152,
    type: ["Erba"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 21
    },
    exp: 50,
    movesByLevel: {
      5: [m.Azione, m.Ruggito],
      8: [m.Foglielama],
      12: [m.Riflesso],
      15: [m.Velenpolvere],
      22: [m.Sintesi],
      29: [m.Corposcontro],
      36: [m.Schermoluce],
      43: [m.Salvaguardia],
      50: [m.Solarraggio]
    },
    movesByMT: [
      m.Taglio, m.Solarraggio, m.Tossina, m.Doppioteam, m.Schermoluce,
      m.Riflesso, m.Flash, m.Riposo, m.Protezione, m.Gigassorbimento,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Salvaguardia, m.Codacciaio,
      m.Introforza, m.Giornodisole, m.Facciata, m.Forzasegreta, m.Semitraglia,
      m.Frustata, m.Contrattacco, m.Parassiseme, m.Flagello, m.Forzantica,
      m.Naturforza, m.Radicamento, m.Meloderba, m.Danzaspada, m.Corposcontro,
      m.Sdoppiatore, m.Mimica, m.Sostituto, m.Russare, m.Fangosberla,
      m.Resistenza, m.Bullo, m.Sonnolalia, m.Radicalbero
    ],
    evolution: {stage: "base", to: [{species: "153", trigger: {kind: "level", level: 16}}]}
  },
  "153": {
    name: "Bayleef",
    dexNumber: 153,
    type: ["Erba"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 16,
      maxLevel: 42
    },
    exp: 100,
    movesByLevel: {
      5: [m.Azione, m.Ruggito],
      8: [m.Foglielama],
      12: [m.Riflesso],
      15: [m.Velenpolvere],
      23: [m.Sintesi],
      31: [m.Corposcontro],
      39: [m.Schermoluce],
      47: [m.Salvaguardia],
      55: [m.Solarraggio]
    },
    movesByMT: [
      m.Taglio, m.Forza, m.Solarraggio, m.Tossina, m.Doppioteam,
      m.Schermoluce, m.Riflesso, m.Flash, m.Riposo, m.Protezione,
      m.Gigassorbimento, m.Attrazione, m.Ritorno, m.Frustrazione, m.Salvaguardia,
      m.Codacciaio, m.Introforza, m.Giornodisole, m.Spaccaroccia, m.Facciata,
      m.Forzasegreta, m.Semitraglia, m.Frustata, m.Contrattacco, m.Parassiseme,
      m.Flagello, m.Forzantica, m.Naturforza, m.Radicamento, m.Meloderba,
      m.Danzaspada, m.Corposcontro, m.Sdoppiatore, m.Mimica, m.Sostituto,
      m.Russare, m.Fangosberla, m.Resistenza, m.Bullo, m.Tagliofuria,
      m.Sonnolalia, m.Radicalbero
    ],
    evolution: {stage: "stage1", to: [{species: "154", trigger: {kind: "level", level: 32}}]}
  },
  "154": {
    name: "Meganium",
    dexNumber: 154,
    type: ["Erba"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 32,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.Azione, m.Ruggito],
      8: [m.Foglielama],
      12: [m.Riflesso],
      15: [m.Velenpolvere],
      23: [m.Sintesi],
      31: [m.Corposcontro],
      41: [m.Schermoluce],
      51: [m.Salvaguardia],
      61: [m.Solarraggio]
    },
    movesByMT: [
      m.Taglio, m.IperRaggio, m.Forza, m.Solarraggio, m.Terremoto,
      m.Tossina, m.Doppioteam, m.Schermoluce, m.Riflesso, m.Flash,
      m.Riposo, m.Protezione, m.Gigassorbimento, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Salvaguardia, m.Codacciaio, m.Introforza, m.Giornodisole,
      m.Spaccaroccia, m.Facciata, m.Forzasegreta, m.Semitraglia, m.Frustata,
      m.Contrattacco, m.Parassiseme, m.Flagello, m.Forzantica, m.Naturforza,
      m.Radicamento, m.Meloderba, m.Danzaspada, m.Corposcontro, m.Sdoppiatore,
      m.Mimica, m.Sostituto, m.Russare, m.Fangosberla, m.Resistenza,
      m.Bullo, m.Tagliofuria, m.Sonnolalia, m.Radicalbero
    ],
    evolution: {stage: "stage2", to: []}
  },
  "155": {
    name: "Cyndaquil",
    dexNumber: 155,
    type: ["Fuoco"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 19
    },
    exp: 50,
    movesByLevel: {
      5: [m.Azione, m.Fulmisguardo],
      6: [m.MurodiFumo],
      12: [m.Braciere],
      19: [m.AttaccoRapido],
      27: [m.Ruotafuoco],
      36: [m.Comete],
      46: [m.Lanciafiamme]
    },
    movesByMT: [
      m.Taglio, m.Lanciafiamme, m.Fossa, m.Tossina, m.Doppioteam,
      m.Fuocobomba, m.Riposo, m.Protezione, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Introforza, m.Giornodisole, m.Facciata, m.Forzasegreta,
      m.Vampata, m.Aeroassalto, m.Colpo, m.AttaccoRapido, m.Sfuriate,
      m.Contropiede, m.Preveggenza, m.Tritartigli, m.Gridodilotta, m.Supplica,
      m.Corposcontro, m.Sdoppiatore, m.Mimica, m.Ricciolscudo, m.Comete,
      m.Sostituto, m.Russare, m.Fangosberla, m.Resistenza, m.Rotolamento,
      m.Bullo, m.Sonnolalia, m.Incendio
    ],
    evolution: {stage: "base", to: [{species: "156", trigger: {kind: "level", level: 14}}]}
  },
  "156": {
    name: "Quilava",
    dexNumber: 156,
    type: ["Fuoco"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 14,
      maxLevel: 46
    },
    exp: 100,
    movesByLevel: {
      5: [m.Azione, m.Fulmisguardo],
      6: [m.MurodiFumo],
      12: [m.Braciere],
      21: [m.AttaccoRapido],
      31: [m.Ruotafuoco],
      42: [m.Comete],
      54: [m.Lanciafiamme]
    },
    movesByMT: [
      m.Taglio, m.Boato, m.Lanciafiamme, m.Forza, m.Fossa,
      m.Tossina, m.Doppioteam, m.Fuocobomba, m.Riposo, m.Protezione,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Introforza, m.Giornodisole,
      m.Spaccaroccia, m.Facciata, m.Centripugno, m.Breccia, m.Forzasegreta,
      m.Vampata, m.Aeroassalto, m.Colpo, m.AttaccoRapido, m.Sfuriate,
      m.Contropiede, m.Preveggenza, m.Tritartigli, m.Gridodilotta, m.Supplica,
      m.Corposcontro, m.Sdoppiatore, m.Mimica, m.Ricciolscudo, m.Comete,
      m.Sostituto, m.Russare, m.Fangosberla, m.Resistenza, m.Rotolamento,
      m.Bullo, m.Tagliofuria, m.Sonnolalia, m.Incendio
    ],
    evolution: {stage: "stage1", to: [{species: "157", trigger: {kind: "level", level: 36}}]}
  },
  "157": {
    name: "Typhlosion",
    dexNumber: 157,
    type: ["Fuoco"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 36,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.Azione, m.Fulmisguardo],
      6: [m.MurodiFumo],
      12: [m.Braciere],
      21: [m.AttaccoRapido],
      31: [m.Ruotafuoco],
      45: [m.Comete],
      60: [m.Lanciafiamme]
    },
    movesByMT: [
      m.Taglio, m.Boato, m.Lanciafiamme, m.IperRaggio, m.Forza,
      m.Terremoto, m.Fossa, m.Tossina, m.Doppioteam, m.Fuocobomba,
      m.Riposo, m.Protezione, m.Attrazione, m.Ritorno, m.Frustrazione,
      m.Introforza, m.Giornodisole, m.Spaccaroccia, m.Facciata, m.Centripugno,
      m.Breccia, m.Forzasegreta, m.Vampata, m.Aeroassalto, m.Colpo,
      m.AttaccoRapido, m.Sfuriate, m.Contropiede, m.Preveggenza, m.Tritartigli,
      m.Gridodilotta, m.Supplica, m.Megapugno, m.Fuocopugno, m.Tuonopugno,
      m.Megacalcio, m.Corposcontro, m.Sdoppiatore, m.Contrattacco, m.MovimentoSismico,
      m.Mimica, m.Ricciolscudo, m.Comete, m.Frana, m.Sostituto,
      m.Russare, m.Fangosberla, m.Resistenza, m.Rotolamento, m.Bullo,
      m.Tagliofuria, m.Sonnolalia, m.Dinamipugno, m.Incendio
    ],
    evolution: {stage: "stage2", to: []}
  },
  "158": {
    name: "Totodile",
    dexNumber: 158,
    type: ["Acqua"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 23
    },
    exp: 50,
    movesByLevel: {
      5: [m.Graffio, m.Fulmisguardo],
      7: [m.Ira],
      13: [m.Pistolacqua],
      20: [m.Morso],
      27: [m.Visotruce],
      35: [m.Lacerazione],
      43: [m.Stridio],
      52: [m.Idropompa]
    },
    movesByMT: [
      m.Taglio, m.Surf, m.Geloraggio, m.Bora, m.Fossa,
      m.Tossina, m.Doppioteam, m.Cascata, m.Riposo, m.Protezione,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Codacciaio, m.Introforza,
      m.Pioggiadanza, m.Grandine, m.Facciata, m.Centripugno, m.Breccia,
      m.Forzasegreta, m.Sub, m.Aeroassalto, m.Idropulsar, m.Colpo,
      m.Idropompa, m.Frana, m.Sgranocchio, m.Forzantica, m.Fangata,
      m.Dragartigli, m.Docciascudo, m.Megapugno, m.Gelopugno, m.Danzaspada,
      m.Megacalcio, m.Corposcontro, m.Sdoppiatore, m.Contrattacco, m.MovimentoSismico,
      m.Mimica, m.Sostituto, m.Russare, m.Fangosberla, m.Ventogelato,
      m.Resistenza, m.Bullo, m.Sonnolalia, m.Dinamipugno, m.Idrocannone
    ],
    evolution: {stage: "base", to: [{species: "159", trigger: {kind: "level", level: 18}}]}
  },
  "159": {
    name: "Croconaw",
    dexNumber: 159,
    type: ["Acqua"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 18,
      maxLevel: 40
    },
    exp: 100,
    movesByLevel: {
      5: [m.Graffio, m.Fulmisguardo],
      7: [m.Ira],
      13: [m.Pistolacqua],
      21: [m.Morso],
      28: [m.Visotruce],
      37: [m.Lacerazione],
      45: [m.Stridio],
      55: [m.Idropompa]
    },
    movesByMT: [
      m.Taglio, m.Boato, m.Surf, m.Geloraggio, m.Bora,
      m.Forza, m.Fossa, m.Tossina, m.Doppioteam, m.Cascata,
      m.Riposo, m.Protezione, m.Attrazione, m.Ritorno, m.Frustrazione,
      m.Codacciaio, m.Introforza, m.Pioggiadanza, m.Spaccaroccia, m.Grandine,
      m.Facciata, m.Centripugno, m.Breccia, m.Forzasegreta, m.Sub,
      m.Aeroassalto, m.Idropulsar, m.Colpo, m.Idropompa, m.Frana,
      m.Sgranocchio, m.Forzantica, m.Fangata, m.Dragartigli, m.Docciascudo,
      m.Megapugno, m.Gelopugno, m.Danzaspada, m.Megacalcio, m.Corposcontro,
      m.Sdoppiatore, m.Contrattacco, m.MovimentoSismico, m.Mimica, m.Sostituto,
      m.Russare, m.Fangosberla, m.Ventogelato, m.Resistenza, m.Bullo,
      m.Tagliofuria, m.Sonnolalia, m.Dinamipugno, m.Idrocannone
    ],
    evolution: {stage: "stage1", to: [{species: "160", trigger: {kind: "level", level: 30}}]}
  },
  "160": {
    name: "Feraligatr",
    dexNumber: 160,
    type: ["Acqua"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 30,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.Graffio, m.Fulmisguardo],
      7: [m.Ira],
      13: [m.Pistolacqua],
      21: [m.Morso],
      28: [m.Visotruce],
      38: [m.Lacerazione],
      47: [m.Stridio],
      58: [m.Idropompa]
    },
    movesByMT: [
      m.Taglio, m.Boato, m.Surf, m.Geloraggio, m.Bora,
      m.IperRaggio, m.Forza, m.Terremoto, m.Fossa, m.Tossina,
      m.Doppioteam, m.Cascata, m.Riposo, m.Protezione, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Codacciaio, m.Introforza, m.Pioggiadanza,
      m.Spaccaroccia, m.Grandine, m.Facciata, m.Centripugno, m.Breccia,
      m.Forzasegreta, m.Sub, m.Aeroassalto, m.Dragartigli, m.Idropulsar,
      m.Colpo, m.Idropompa, m.Frana, m.Sgranocchio, m.Forzantica,
      m.Fangata, m.Docciascudo, m.Megapugno, m.Gelopugno, m.Danzaspada,
      m.Megacalcio, m.Corposcontro, m.Sdoppiatore, m.Contrattacco, m.MovimentoSismico,
      m.Mimica, m.Sostituto, m.Russare, m.Fangosberla, m.Ventogelato,
      m.Resistenza, m.Bullo, m.Tagliofuria, m.Sonnolalia, m.Dinamipugno,
      m.Idrocannone
    ],
    evolution: {stage: "stage2", to: []}
  },
  "161": {
    name: "Sentret",
    dexNumber: 161,
    type: ["Normale"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 25
    },
    exp: 50,
    movesByLevel: {
      5: [m.Graffio, m.Ricciolscudo],
      7: [m.AttaccoRapido],
      12: [m.Sfuriate],
      17: [m.Altruismo],
      24: [m.Schianto],
      40: [m.Riposo],
      49: [m.Amnesia]
    },
    movesByMT: [
      m.Taglio, m.Lanciafiamme, m.Surf, m.Geloraggio, m.Solarraggio,
      m.Fulmine, m.Fossa, m.Tossina, m.Doppioteam, m.Riposo,
      m.Furto, m.Protezione, m.Attrazione, m.Ritorno, m.Frustrazione,
      m.Codacciaio, m.Introforza, m.Pioggiadanza, m.Giornodisole, m.PallaOmbra,
      m.Facciata, m.Centripugno, m.Breccia, m.Forzasegreta, m.Ondashock,
      m.Idropulsar, m.Sdoppiatore, m.Focalenergia, m.Lacerazione, m.Sostituto,
      m.Contropiede, m.Inseguimento, m.Raggiro, m.Assistente, m.Fuocopugno,
      m.Gelopugno, m.Tuonopugno, m.Corposcontro, m.Mimica, m.Ricciolscudo,
      m.Comete, m.Russare, m.Fangosberla, m.Resistenza, m.Rotolamento,
      m.Bullo, m.Tagliofuria, m.Sonnolalia, m.Dinamipugno
    ],
    evolution: {stage: "base", to: [{species: "162", trigger: {kind: "level", level: 15}}]}
  },
  "162": {
    name: "Furret",
    dexNumber: 162,
    type: ["Normale"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 15,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Graffio, m.AttaccoRapido, m.Ricciolscudo],
      12: [m.Sfuriate],
      19: [m.Altruismo],
      28: [m.Schianto],
      48: [m.Riposo],
      59: [m.Amnesia]
    },
    movesByMT: [
      m.Taglio, m.Lanciafiamme, m.Surf, m.Geloraggio, m.Bora,
      m.IperRaggio, m.Forza, m.Solarraggio, m.Fulmine, m.Tuono,
      m.Fossa, m.Tossina, m.Doppioteam, m.Riposo, m.Furto,
      m.Protezione, m.Attrazione, m.Ritorno, m.Frustrazione, m.Codacciaio,
      m.Introforza, m.Pioggiadanza, m.Giornodisole, m.PallaOmbra, m.Spaccaroccia,
      m.Facciata, m.Centripugno, m.Breccia, m.Forzasegreta, m.Ondashock,
      m.Idropulsar, m.Sdoppiatore, m.Focalenergia, m.Lacerazione, m.Sostituto,
      m.Contropiede, m.Inseguimento, m.Raggiro, m.Assistente, m.Fuocopugno,
      m.Gelopugno, m.Tuonopugno, m.Corposcontro, m.Mimica, m.Ricciolscudo,
      m.Comete, m.Russare, m.Fangosberla, m.Resistenza, m.Rotolamento,
      m.Bullo, m.Tagliofuria, m.Sonnolalia, m.Dinamipugno
    ],
    evolution: {stage: "stage1", to: []}
  },
  "163": {
    name: "Hoothoot",
    dexNumber: 163,
    type: ["Normale", "Volante"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 30
    },
    exp: 50,
    movesByLevel: {
      5: [m.Azione, m.Ruggito],
      6: [m.Preveggenza],
      11: [m.Beccata],
      16: [m.Ipnosi],
      22: [m.Riflesso],
      28: [m.Riduttore],
      34: [m.Confusione],
      48: [m.Mangiasogni]
    },
    movesByMT: [
      m.Volo, m.Tossina, m.Psichico, m.Doppioteam, m.Riflesso,
      m.Flash, m.Riposo, m.Furto, m.Protezione, m.Alacciaio,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Introforza, m.Pioggiadanza,
      m.Giornodisole, m.PallaOmbra, m.Facciata, m.Forzasegreta, m.Aeroassalto,
      m.AttaccodAla, m.Turbine, m.Supersuono, m.Speculmossa, m.Aeroattacco,
      m.Finta, m.Danzadipiume, m.Sdoppiatore, m.Mimica, m.Comete,
      m.Mangiasogni, m.Sostituto, m.Incubo, m.Russare, m.Fangosberla,
      m.Resistenza, m.Bullo, m.Sonnolalia
    ],
    evolution: {stage: "base", to: [{species: "164", trigger: {kind: "level", level: 20}}]}
  },
  "164": {
    name: "Noctowl",
    dexNumber: 164,
    type: ["Normale", "Volante"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 20,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Azione, m.Ruggito],
      6: [m.Preveggenza],
      11: [m.Beccata],
      16: [m.Ipnosi],
      25: [m.Riflesso],
      33: [m.Riduttore],
      41: [m.Confusione],
      57: [m.Mangiasogni]
    },
    movesByMT: [
      m.Volo, m.IperRaggio, m.Tossina, m.Psichico, m.Doppioteam,
      m.Riflesso, m.Flash, m.Riposo, m.Furto, m.Protezione,
      m.Alacciaio, m.Attrazione, m.Ritorno, m.Frustrazione, m.Introforza,
      m.Pioggiadanza, m.Giornodisole, m.PallaOmbra, m.Facciata, m.Forzasegreta,
      m.Aeroassalto, m.AttaccodAla, m.Turbine, m.Supersuono, m.Speculmossa,
      m.Aeroattacco, m.Finta, m.Danzadipiume, m.Sdoppiatore, m.Mimica,
      m.Comete, m.Mangiasogni, m.Sostituto, m.Incubo, m.Russare,
      m.Fangosberla, m.Resistenza, m.Bullo, m.Sonnolalia
    ],
    evolution: {stage: "stage1", to: []}
  },
  "165": {
    name: "Ledyba",
    dexNumber: 165,
    type: ["Coleottero", "Volante"],
    gender: ["Maschio", "Femmina"],
    spriteGendered: true,
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 28
    },
    exp: 50,
    movesByLevel: {
      5: [m.Azione],
      8: [m.Supersuono],
      15: [m.Cometapugno],
      22: [m.Schermoluce, m.Riflesso, m.Salvaguardia],
      29: [m.Staffetta],
      36: [m.Comete],
      43: [m.Agilita],
      50: [m.Sdoppiatore]
    },
    movesByMT: [
      m.Solarraggio, m.Fossa, m.Tossina, m.Doppioteam, m.Schermoluce,
      m.Riflesso, m.Flash, m.Riposo, m.Furto, m.Protezione,
      m.Gigassorbimento, m.Attrazione, m.Ritorno, m.Frustrazione, m.Salvaguardia,
      m.Introforza, m.Giornodisole, m.Facciata, m.Centripugno, m.Breccia,
      m.Forzasegreta, m.Aeroassalto, m.Psicoraggio, m.Pazienza, m.Ventargenteo,
      m.Megapugno, m.Gelopugno, m.Tuonopugno, m.Danzaspada, m.Sdoppiatore,
      m.Mimica, m.Comete, m.Sostituto, m.Russare, m.Resistenza,
      m.Rotolamento, m.Bullo, m.Sonnolalia, m.Dinamipugno, m.Supersuono,
      m.Rinfrescata
    ],
    evolution: {stage: "base", to: [{species: "166", trigger: {kind: "level", level: 18}}]}
  },
  "166": {
    name: "Ledian",
    dexNumber: 166,
    type: ["Coleottero", "Volante"],
    gender: ["Maschio", "Femmina"],
    spriteGendered: true,
    encounter: {
      rarity: "u",
      minLevel: 18,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Azione],
      8: [m.Supersuono],
      15: [m.Cometapugno],
      24: [m.Schermoluce, m.Riflesso, m.Salvaguardia],
      33: [m.Staffetta],
      42: [m.Comete],
      51: [m.Agilita],
      60: [m.Sdoppiatore]
    },
    movesByMT: [
      m.IperRaggio, m.Solarraggio, m.Fossa, m.Tossina, m.Doppioteam,
      m.Schermoluce, m.Riflesso, m.Flash, m.Riposo, m.Furto,
      m.Protezione, m.Gigassorbimento, m.Attrazione, m.Ritorno, m.Frustrazione,
      m.Salvaguardia, m.Introforza, m.Giornodisole, m.Facciata, m.Centripugno,
      m.Breccia, m.Forzasegreta, m.Aeroassalto, m.Psicoraggio, m.Pazienza,
      m.Ventargenteo, m.Megapugno, m.Gelopugno, m.Tuonopugno, m.Danzaspada,
      m.Sdoppiatore, m.Mimica, m.Comete, m.Sostituto, m.Russare,
      m.Resistenza, m.Rotolamento, m.Bullo, m.Sonnolalia, m.Dinamipugno,
      m.Supersuono, m.Rinfrescata
    ],
    evolution: {stage: "stage1", to: []}
  },
  "167": {
    name: "Spinarak",
    dexNumber: 167,
    type: ["Coleottero", "Veleno"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 32
    },
    exp: 50,
    movesByLevel: {
      5: [m.Velenospina, m.Millebave],
      6: [m.Visotruce],
      11: [m.Limitazione],
      17: [m.OmbraNotturna],
      23: [m.Sanguisuga],
      30: [m.Sfuriate],
      37: [m.Ragnatela],
      45: [m.Agilita],
      53: [m.Psichico]
    },
    movesByMT: [
      m.Solarraggio, m.Fossa, m.Tossina, m.Psichico, m.Doppioteam,
      m.Flash, m.Riposo, m.Furto, m.Protezione, m.Fangobomba,
      m.Gigassorbimento, m.Attrazione, m.Ritorno, m.Frustrazione, m.Introforza,
      m.Giornodisole, m.Facciata, m.Forzasegreta, m.Sonicboom, m.Inibitore,
      m.Psicoraggio, m.Staffetta, m.Inseguimento, m.Segnoraggio, m.Corposcontro,
      m.Sdoppiatore, m.Mimica, m.Sostituto, m.Russare, m.Resistenza,
      m.Bullo, m.Sonnolalia, m.OmbraNotturna, m.Rinfrescata
    ],
    evolution: {stage: "base", to: [{species: "168", trigger: {kind: "level", level: 22}}]}
  },
  "168": {
    name: "Ariados",
    dexNumber: 168,
    type: ["Coleottero", "Veleno"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 22,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Velenospina, m.Millebave],
      6: [m.Visotruce],
      11: [m.Limitazione],
      17: [m.OmbraNotturna],
      25: [m.Sanguisuga],
      34: [m.Sfuriate],
      43: [m.Ragnatela],
      53: [m.Agilita],
      63: [m.Psichico]
    },
    movesByMT: [
      m.IperRaggio, m.Solarraggio, m.Fossa, m.Tossina, m.Psichico,
      m.Doppioteam, m.Flash, m.Riposo, m.Furto, m.Protezione,
      m.Fangobomba, m.Gigassorbimento, m.Attrazione, m.Ritorno, m.Frustrazione,
      m.Introforza, m.Giornodisole, m.Facciata, m.Forzasegreta, m.Sonicboom,
      m.Inibitore, m.Psicoraggio, m.Staffetta, m.Inseguimento, m.Segnoraggio,
      m.Corposcontro, m.Sdoppiatore, m.Mimica, m.Sostituto, m.Russare,
      m.Resistenza, m.Bullo, m.Sonnolalia, m.OmbraNotturna, m.Rinfrescata
    ],
    evolution: {stage: "stage1", to: []}
  },
  "169": {
    name: "Crobat",
    dexNumber: 169,
    type: ["Veleno", "Volante"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.Stridio, m.Sanguisuga],
      6: [m.Sgomento],
      11: [m.Supersuono],
      16: [m.Morso],
      21: [m.AttaccodAla],
      28: [m.Stordiraggio],
      35: [m.Aerasoio],
      42: [m.Malosguardo],
      49: [m.Velenodenti],
      56: [m.Nube]
    },
    movesByMT: [
      m.Volo, m.IperRaggio, m.Tossina, m.Doppioteam, m.Riposo,
      m.Furto, m.Protezione, m.Fangobomba, m.Gigassorbimento, m.Alacciaio,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Introforza, m.Pioggiadanza,
      m.Giornodisole, m.PallaOmbra, m.Attaccalite, m.Facciata, m.Provocazione,
      m.Scippo, m.Forzasegreta, m.Aeroassalto, m.Raffica, m.Turbine,
      m.AttaccoRapido, m.Maledizione, m.Finta, m.Inseguimento, m.Sdoppiatore,
      m.Mimica, m.Comete, m.Sostituto, m.Russare, m.Resistenza,
      m.Bullo, m.Sonnolalia
    ],
    evolution: {stage: "stage2", to: []}
  },
  "170": {
    name: "Chinchou",
    dexNumber: 170,
    type: ["Acqua", "Elettro"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 37
    },
    exp: 50,
    movesByLevel: {
      5: [m.Tuononda, m.Bolla, m.Supersuono],
      13: [m.Flagello],
      17: [m.Pistolacqua],
      25: [m.Scintilla],
      29: [m.Stordiraggio],
      37: [m.Riduttore],
      41: [m.Idropompa],
      49: [m.Sottocarica]
    },
    movesByMT: [
      m.Surf, m.Geloraggio, m.Bora, m.Fulmine, m.Tuono,
      m.Tossina, m.Doppioteam, m.Cascata, m.Flash, m.Riposo,
      m.Protezione, m.Attrazione, m.Ritorno, m.Frustrazione, m.Introforza,
      m.Pioggiadanza, m.Grandine, m.Facciata, m.Forzasegreta, m.Sub,
      m.Ondashock, m.Idropulsar, m.Stridio, m.Amnesia, m.Flagello,
      m.Sdoppiatore, m.Tuononda, m.Mimica, m.Sostituto, m.Russare,
      m.Resistenza, m.Bullo, m.Sonnolalia
    ],
    evolution: {stage: "base", to: [{species: "171", trigger: {kind: "level", level: 27}}]}
  },
  "171": {
    name: "Lanturn",
    dexNumber: 171,
    type: ["Acqua", "Elettro"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 27,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Supersuono, m.Tuononda, m.Bolla],
      13: [m.Flagello],
      17: [m.Pistolacqua],
      25: [m.Scintilla],
      32: [m.Stordiraggio],
      43: [m.Riduttore],
      50: [m.Idropompa],
      61: [m.Sottocarica]
    },
    movesByMT: [
      m.Surf, m.Geloraggio, m.Bora, m.IperRaggio, m.Fulmine,
      m.Tuono, m.Tossina, m.Doppioteam, m.Cascata, m.Flash,
      m.Riposo, m.Protezione, m.Attrazione, m.Ritorno, m.Frustrazione,
      m.Introforza, m.Pioggiadanza, m.Grandine, m.Facciata, m.Forzasegreta,
      m.Sub, m.Ondashock, m.Idropulsar, m.Stridio, m.Amnesia,
      m.Flagello, m.Sdoppiatore, m.Tuononda, m.Mimica, m.Sostituto,
      m.Russare, m.Resistenza, m.Bullo, m.Sonnolalia
    ],
    evolution: {stage: "stage1", to: []}
  },
  "172": {
    name: "Pichu",
    dexNumber: 172,
    type: ["Elettro"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 5,
      maxLevel: 15
    },
    exp: 50,
    movesByLevel: {
      5: [m.Tuonoshock, m.Fascino],
      6: [m.Colpocoda],
      8: [m.Tuononda],
      11: [m.Dolcebacio]
    },
    movesByMT: [
      m.Fulmine, m.Tuono, m.Tossina, m.Doppioteam, m.Schermoluce,
      m.Flash, m.Riposo, m.Protezione, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Codacciaio, m.Introforza, m.Pioggiadanza, m.Facciata,
      m.Forzasegreta, m.Ondashock, m.Doppiasberla, m.Pazienza, m.Contropiede,
      m.Regalino, m.Ripeti, m.Sottocarica, m.Desiderio, m.Megapugno,
      m.Megacalcio, m.Corposcontro, m.Sdoppiatore, m.Contrattacco, m.MovimentoSismico,
      m.Tuononda, m.Mimica, m.Ricciolscudo, m.Comete, m.Sostituto,
      m.Russare, m.Fangosberla, m.Resistenza, m.Rotolamento, m.Bullo,
      m.Sonnolalia, m.Locomovolt, m.Strampadanza, m.Surf
    ],
    evolution: {stage: "base", to: [{species: "25", trigger: {kind: "item", item: i.felixpietra}}]}
  },
  "173": {
    name: "Cleffa",
    dexNumber: 173,
    type: ["Folletto"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 5,
      maxLevel: 15
    },
    exp: 50,
    movesByLevel: {
      5: [m.Botta, m.Fascino, m.Ripeti],
      8: [m.Canto],
      13: [m.Dolcebacio],
      17: [m.Fogliamagica]
    },
    movesByMT: [
      m.Lanciafiamme, m.Solarraggio, m.Fossa, m.Tossina, m.Psichico,
      m.Doppioteam, m.Schermoluce, m.Riflesso, m.Fuocobomba, m.Flash,
      m.Riposo, m.Protezione, m.Attrazione, m.Ritorno, m.Frustrazione,
      m.Salvaguardia, m.Codacciaio, m.Introforza, m.Pioggiadanza, m.Giornodisole,
      m.PallaOmbra, m.Facciata, m.Forzasegreta, m.Ondashock, m.Idropulsar,
      m.Mimica, m.Metronomo, m.Amnesia, m.Splash, m.Sostituto,
      m.Panciamburo, m.Regalino, m.Desiderio, m.Megapugno, m.Megacalcio,
      m.Corposcontro, m.Sdoppiatore, m.Contrattacco, m.MovimentoSismico, m.Tuononda,
      m.Ricciolscudo, m.Covauova, m.Mangiasogni, m.Incubo, m.Russare,
      m.Fangosberla, m.Ventogelato, m.Resistenza, m.Rotolamento, m.Bullo,
      m.Sonnolalia, m.Psicamisu
    ],
    evolution: {stage: "base", to: [{species: "35", trigger: {kind: "item", item: i.felixpietra}}]}
  },
  "174": {
    name: "Igglybuff",
    dexNumber: 174,
    type: ["Normale", "Folletto"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 5,
      maxLevel: 15
    },
    exp: 50,
    movesByLevel: {
      5: [m.Botta, m.Canto, m.Fascino, m.Ricciolscudo],
      14: [m.Dolcebacio]
    },
    movesByMT: [
      m.Lanciafiamme, m.Solarraggio, m.Fossa, m.Tossina, m.Psichico,
      m.Doppioteam, m.Schermoluce, m.Riflesso, m.Fuocobomba, m.Flash,
      m.Riposo, m.Protezione, m.Attrazione, m.Ritorno, m.Frustrazione,
      m.Salvaguardia, m.Introforza, m.Pioggiadanza, m.Giornodisole, m.PallaOmbra,
      m.Facciata, m.Forzasegreta, m.Ondashock, m.Idropulsar, m.Finta,
      m.Ultimocanto, m.Regalino, m.Desiderio, m.Falselacrime, m.Megapugno,
      m.Megacalcio, m.Corposcontro, m.Sdoppiatore, m.Contrattacco, m.MovimentoSismico,
      m.Tuononda, m.Mimica, m.Ricciolscudo, m.Mangiasogni, m.Sostituto,
      m.Incubo, m.Russare, m.Fangosberla, m.Ventogelato, m.Resistenza,
      m.Rotolamento, m.Bullo, m.Sonnolalia, m.Psicamisu, m.Solletico
    ],
    evolution: {stage: "base", to: [{species: "39", trigger: {kind: "item", item: i.felixpietra}}]}
  },
  "175": {
    name: "Togepi",
    dexNumber: 175,
    type: ["Folletto"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 5,
      maxLevel: 15
    },
    exp: 50,
    movesByLevel: {
      5: [m.Botta, m.Ruggito, m.Fascino, m.Metronomo],
      9: [m.Dolcebacio],
      13: [m.Sbadiglio],
      17: [m.Ripeti],
      21: [m.Forzantica],
      29: [m.Desiderio],
      33: [m.Salvaguardia],
      37: [m.Sdoppiatore],
      41: [m.Staffetta]
    },
    movesByMT: [
      m.Lanciafiamme, m.Solarraggio, m.Tossina, m.Psichico, m.Doppioteam,
      m.Schermoluce, m.Riflesso, m.Fuocobomba, m.Flash, m.Riposo,
      m.Protezione, m.Attrazione, m.Ritorno, m.Frustrazione, m.Salvaguardia,
      m.Introforza, m.Pioggiadanza, m.Giornodisole, m.PallaOmbra, m.Spaccaroccia,
      m.Facciata, m.Forzasegreta, m.Ondashock, m.Idropulsar, m.Beccata,
      m.Speculmossa, m.Sostituto, m.Preveggenza, m.Regalino, m.Psicamisu,
      m.Divinazione, m.Megapugno, m.Megacalcio, m.Corposcontro, m.Sdoppiatore,
      m.Contrattacco, m.MovimentoSismico, m.Tuononda, m.Mimica, m.Ricciolscudo,
      m.Metronomo, m.Comete, m.Covauova, m.Mangiasogni, m.Russare,
      m.Fangosberla, m.Resistenza, m.Rotolamento, m.Bullo, m.Sonnolalia,
      m.Tripletta, m.Forzantica, m.Altruismo
    ],
    evolution: {stage: "base", to: [{species: "176", trigger: {kind: "item", item: i.felixpietra}}]}
  },
  "176": {
    name: "Togetic",
    dexNumber: 176,
    type: ["Folletto", "Volante"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 15,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Metronomo, m.Fascino, m.Fogliamagica],
      9: [m.Dolcebacio],
      13: [m.Sbadiglio],
      17: [m.Ripeti],
      21: [m.Forzantica],
      29: [m.Desiderio],
      33: [m.Salvaguardia],
      37: [m.Sdoppiatore],
      41: [m.Staffetta]
    },
    movesByMT: [
      m.Volo, m.Lanciafiamme, m.IperRaggio, m.Solarraggio, m.Tossina,
      m.Psichico, m.Doppioteam, m.Schermoluce, m.Riflesso, m.Fuocobomba,
      m.Flash, m.Riposo, m.Protezione, m.Alacciaio, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Salvaguardia, m.Introforza, m.Pioggiadanza,
      m.Giornodisole, m.PallaOmbra, m.Spaccaroccia, m.Facciata, m.Centripugno,
      m.Breccia, m.Forzasegreta, m.Aeroassalto, m.Ondashock, m.Idropulsar,
      m.Beccata, m.Speculmossa, m.Sostituto, m.Preveggenza, m.Regalino,
      m.Psicamisu, m.Divinazione, m.Megapugno, m.Megacalcio, m.Corposcontro,
      m.Sdoppiatore, m.Contrattacco, m.MovimentoSismico, m.Tuononda, m.Mimica,
      m.Ricciolscudo, m.Metronomo, m.Comete, m.Covauova, m.Mangiasogni,
      m.Aeroattacco, m.Russare, m.Fangosberla, m.Resistenza, m.Rotolamento,
      m.Bullo, m.Sonnolalia, m.Tripletta, m.Forzantica, m.Altruismo
    ],
    evolution: {stage: "stage1", to: []}
  },
  "177": {
    name: "Natu",
    dexNumber: 177,
    type: ["Psico", "Volante"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 35
    },
    exp: 50,
    movesByLevel: {
      5: [m.Fulmisguardo, m.Beccata],
      10: [m.OmbraNotturna],
      20: [m.Teletrasporto],
      30: [m.Divinazione, m.Desiderio],
      40: [m.Stordiraggio],
      50: [m.Psichico]
    },
    movesByMT: [
      m.Solarraggio, m.Tossina, m.Psichico, m.Doppioteam, m.Schermoluce,
      m.Riflesso, m.Flash, m.Riposo, m.Furto, m.Protezione,
      m.Gigassorbimento, m.Alacciaio, m.Attrazione, m.Ritorno, m.Frustrazione,
      m.Introforza, m.Pioggiadanza, m.Giornodisole, m.PallaOmbra, m.Facciata,
      m.Forzasegreta, m.Aeroassalto, m.Calmamente, m.Perforbecco, m.AttaccoRapido,
      m.Nube, m.Finta, m.Psicamisu, m.Rinfrescata, m.Danzadipiume,
      m.Sdoppiatore, m.Tuononda, m.Mimica, m.Comete, m.Mangiasogni,
      m.Aeroattacco, m.Sostituto, m.Incubo, m.Russare, m.Resistenza,
      m.Bullo, m.Sonnolalia, m.OmbraNotturna, m.Staffetta, m.Divinazione
    ],
    evolution: {stage: "base", to: [{species: "178", trigger: {kind: "level", level: 25}}]}
  },
  "178": {
    name: "Xatu",
    dexNumber: 178,
    type: ["Psico", "Volante"],
    gender: ["Maschio", "Femmina"],
    spriteGendered: true,
    encounter: {
      rarity: "u",
      minLevel: 25,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Fulmisguardo, m.Beccata],
      10: [m.OmbraNotturna],
      20: [m.Teletrasporto],
      35: [m.Divinazione, m.Desiderio],
      50: [m.Stordiraggio],
      65: [m.Psichico]
    },
    movesByMT: [
      m.Volo, m.IperRaggio, m.Solarraggio, m.Tossina, m.Psichico,
      m.Doppioteam, m.Schermoluce, m.Riflesso, m.Flash, m.Riposo,
      m.Furto, m.Protezione, m.Gigassorbimento, m.Alacciaio, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Giornodisole,
      m.PallaOmbra, m.Facciata, m.Forzasegreta, m.Aeroassalto, m.Calmamente,
      m.Perforbecco, m.AttaccoRapido, m.Nube, m.Finta, m.Psicamisu,
      m.Rinfrescata, m.Danzadipiume, m.Sdoppiatore, m.Tuononda, m.Mimica,
      m.Comete, m.Mangiasogni, m.Aeroattacco, m.Sostituto, m.Incubo,
      m.Russare, m.Resistenza, m.Bullo, m.Sonnolalia, m.OmbraNotturna,
      m.Staffetta, m.Divinazione
    ],
    evolution: {stage: "stage1", to: []}
  },
  "179": {
    name: "Mareep",
    dexNumber: 179,
    type: ["Elettro"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 20
    },
    exp: 50,
    movesByLevel: {
      5: [m.Azione, m.Ruggito],
      9: [m.Tuonoshock],
      16: [m.Tuononda],
      23: [m.Cottonspora],
      30: [m.Schermoluce],
      37: [m.Tuono]
    },
    movesByMT: [
      m.Fulmine, m.Tuono, m.Tossina, m.Doppioteam, m.Schermoluce,
      m.Flash, m.Riposo, m.Protezione, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Codacciaio, m.Introforza, m.Pioggiadanza, m.Facciata,
      m.Forzasegreta, m.Ondashock, m.Corposcontro, m.Riduttore, m.Stridio,
      m.Riflesso, m.Salvaguardia, m.Sottocarica, m.Segugio, m.Sdoppiatore,
      m.Tuononda, m.Mimica, m.Ricciolscudo, m.Comete, m.Sostituto,
      m.Russare, m.Resistenza, m.Bullo, m.Sonnolalia, m.Tuonoshock,
      m.Rintoccasana
    ],
    evolution: {stage: "base", to: [{species: "180", trigger: {kind: "level", level: 15}}]}
  },
  "180": {
    name: "Flaaffy",
    dexNumber: 180,
    type: ["Elettro"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 15,
      maxLevel: 40
    },
    exp: 100,
    movesByLevel: {
      5: [m.Azione, m.Ruggito],
      9: [m.Tuonoshock],
      18: [m.Tuononda],
      27: [m.Cottonspora],
      36: [m.Schermoluce],
      45: [m.Tuono]
    },
    movesByMT: [
      m.Forza, m.Fulmine, m.Tuono, m.Tossina, m.Doppioteam,
      m.Schermoluce, m.Flash, m.Riposo, m.Protezione, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Codacciaio, m.Introforza, m.Pioggiadanza,
      m.Spaccaroccia, m.Facciata, m.Centripugno, m.Breccia, m.Forzasegreta,
      m.Ondashock, m.Corposcontro, m.Riduttore, m.Stridio, m.Riflesso,
      m.Salvaguardia, m.Sottocarica, m.Segugio, m.Megapugno, m.Fuocopugno,
      m.Tuonopugno, m.Megacalcio, m.Sdoppiatore, m.Contrattacco, m.MovimentoSismico,
      m.Tuononda, m.Mimica, m.Ricciolscudo, m.Comete, m.Sostituto,
      m.Russare, m.Resistenza, m.Bullo, m.Sonnolalia, m.Dinamipugno,
      m.Tuonoshock, m.Rintoccasana
    ],
    evolution: {stage: "stage1", to: [{species: "181", trigger: {kind: "level", level: 30}}]}
  },
  "181": {
    name: "Ampharos",
    dexNumber: 181,
    type: ["Elettro"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 30,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.Azione, m.Ruggito],
      9: [m.Tuonoshock],
      18: [m.Tuononda],
      27: [m.Cottonspora],
      30: [m.Tuonopugno],
      42: [m.Schermoluce],
      57: [m.Tuono]
    },
    movesByMT: [
      m.IperRaggio, m.Forza, m.Fulmine, m.Tuono, m.Tossina,
      m.Doppioteam, m.Schermoluce, m.Flash, m.Riposo, m.Protezione,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Codacciaio, m.Introforza,
      m.Pioggiadanza, m.Spaccaroccia, m.Facciata, m.Centripugno, m.Breccia,
      m.Forzasegreta, m.Ondashock, m.Corposcontro, m.Riduttore, m.Stridio,
      m.Riflesso, m.Salvaguardia, m.Sottocarica, m.Segugio, m.Megapugno,
      m.Fuocopugno, m.Tuonopugno, m.Megacalcio, m.Sdoppiatore, m.Contrattacco,
      m.MovimentoSismico, m.Tuononda, m.Mimica, m.Ricciolscudo, m.Comete,
      m.Sostituto, m.Russare, m.Resistenza, m.Bullo, m.Sonnolalia,
      m.Dinamipugno, m.Tuonoshock, m.Rintoccasana
    ],
    evolution: {stage: "stage2", to: []}
  },
  "182": {
    name: "Bellossom",
    dexNumber: 182,
    type: ["Erba"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.Assorbimento, m.Paralizzante, m.Profumino, m.Fogliamagica],
      44: [m.Petalodanza],
      55: [m.Solarraggio]
    },
    movesByMT: [
      m.Taglio, m.IperRaggio, m.Solarraggio, m.Tossina, m.Doppioteam,
      m.Flash, m.Riposo, m.Protezione, m.Fangobomba, m.Gigassorbimento,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Salvaguardia, m.Introforza,
      m.Giornodisole, m.Facciata, m.Forzasegreta, m.Semitraglia, m.Danzaspada,
      m.Foglielama, m.Flagello, m.Fascino, m.Sintesi, m.Radicamento,
      m.Sdoppiatore, m.Mimica, m.Sostituto, m.Russare, m.Resistenza,
      m.Bullo, m.Sonnolalia, m.Parassiseme
    ],
    evolution: {stage: "stage2", to: []}
  },
  "183": {
    name: "Marill",
    dexNumber: 183,
    type: ["Acqua", "Folletto"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 28
    },
    exp: 100,
    movesByLevel: {
      5: [m.Azione, m.Ricciolscudo],
      6: [m.Colpocoda],
      10: [m.Pistolacqua],
      15: [m.Rotolamento],
      21: [m.Bollaraggio],
      28: [m.Sdoppiatore],
      36: [m.Pioggiadanza],
      45: [m.Idropompa]
    },
    movesByMT: [
      m.Surf, m.Geloraggio, m.Bora, m.Forza, m.Fossa,
      m.Tossina, m.Doppioteam, m.Cascata, m.Riposo, m.Protezione,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Codacciaio, m.Introforza,
      m.Pioggiadanza, m.Spaccaroccia, m.Grandine, m.Facciata, m.Centripugno,
      m.Breccia, m.Forzasegreta, m.Sub, m.Idropulsar, m.Schianto,
      m.Canto, m.Supersuono, m.Schermoluce, m.Amnesia, m.Sostituto,
      m.Panciamburo, m.Ultimocanto, m.Regalino, m.Ripeti, m.Divinazione,
      m.Rinfrescata, m.Solletico, m.Megapugno, m.Gelopugno, m.Megacalcio,
      m.Corposcontro, m.Sdoppiatore, m.MovimentoSismico, m.Mimica, m.Ricciolscudo,
      m.Comete, m.Russare, m.Fangosberla, m.Ventogelato, m.Resistenza,
      m.Rotolamento, m.Bullo, m.Sonnolalia, m.Dinamipugno
    ],
    evolution: {stage: "base", to: [{species: "184", trigger: {kind: "level", level: 18}}]}
  },
  "184": {
    name: "Azumarill",
    dexNumber: 184,
    type: ["Acqua", "Folletto"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 18,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.Azione, m.Ricciolscudo],
      6: [m.Colpocoda],
      10: [m.Pistolacqua],
      15: [m.Rotolamento],
      24: [m.Bollaraggio],
      34: [m.Sdoppiatore],
      45: [m.Pioggiadanza],
      57: [m.Idropompa]
    },
    movesByMT: [
      m.Surf, m.Geloraggio, m.Bora, m.IperRaggio, m.Forza,
      m.Fossa, m.Tossina, m.Doppioteam, m.Cascata, m.Riposo,
      m.Protezione, m.Attrazione, m.Ritorno, m.Frustrazione, m.Codacciaio,
      m.Introforza, m.Pioggiadanza, m.Spaccaroccia, m.Grandine, m.Facciata,
      m.Centripugno, m.Breccia, m.Forzasegreta, m.Sub, m.Idropulsar,
      m.Schianto, m.Canto, m.Supersuono, m.Schermoluce, m.Amnesia,
      m.Sostituto, m.Panciamburo, m.Ultimocanto, m.Regalino, m.Ripeti,
      m.Divinazione, m.Rinfrescata, m.Solletico, m.Megapugno, m.Gelopugno,
      m.Megacalcio, m.Corposcontro, m.Sdoppiatore, m.MovimentoSismico, m.Mimica,
      m.Ricciolscudo, m.Comete, m.Russare, m.Fangosberla, m.Ventogelato,
      m.Resistenza, m.Rotolamento, m.Bullo, m.Sonnolalia, m.Dinamipugno
    ],
    evolution: {stage: "stage1", to: []}
  },
  "185": {
    name: "Sudowoodo",
    dexNumber: 185,
    type: ["Roccia"],
    gender: ["Maschio", "Femmina"],
    spriteGendered: true,
    encounter: {
      rarity: "u",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Sassata, m.Mimica],
      9: [m.Flagello],
      17: [m.ColpoBasso],
      25: [m.Frana],
      33: [m.Blocco],
      41: [m.Staffetta],
      49: [m.Schianto],
      57: [m.Sdoppiatore]
    },
    movesByMT: [
      m.Forza, m.Terremoto, m.Fossa, m.Tossina, m.Doppioteam,
      m.Riposo, m.Furto, m.Protezione, m.Terrempesta, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Introforza, m.Giornodisole, m.Spaccaroccia,
      m.Facciata, m.Centripugno, m.Provocazione, m.Breccia, m.Forzasegreta,
      m.Rocciotomba, m.Calmamente, m.Autodistruzione, m.Megapugno, m.Fuocopugno,
      m.Gelopugno, m.Tuonopugno, m.Megacalcio, m.Corposcontro, m.Sdoppiatore,
      m.Contrattacco, m.MovimentoSismico, m.Mimica, m.Ricciolscudo, m.Esplosione,
      m.Frana, m.Sostituto, m.Russare, m.Fangosberla, m.Resistenza,
      m.Rotolamento, m.Bullo, m.Sonnolalia, m.Dinamipugno, m.Psicamisu
    ],
    evolution: {stage: "base", to: []}
  },
  "186": {
    name: "Politoed",
    dexNumber: 186,
    type: ["Acqua"],
    gender: ["Maschio", "Femmina"],
    spriteGendered: true,
    encounter: {
      rarity: "r",
      minLevel: 50,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.Doppiasberla, m.Pistolacqua, m.Ipnosi],
      35: [m.Ultimocanto],
      51: [m.Bullo]
    },
    movesByMT: [
      m.Surf, m.Geloraggio, m.Bora, m.IperRaggio, m.Forza,
      m.Terremoto, m.Fossa, m.Tossina, m.Psichico, m.Doppioteam,
      m.Cascata, m.Riposo, m.Furto, m.Protezione, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Spaccaroccia,
      m.Grandine, m.Facciata, m.Centripugno, m.Breccia, m.Forzasegreta,
      m.Sub, m.Idropulsar, m.Nebbia, m.Bollaraggio, m.Nube,
      m.Splash, m.Leggimente, m.PallaGelo, m.Docciascudo, m.Megapugno,
      m.Gelopugno, m.Megacalcio, m.Corposcontro, m.Sdoppiatore, m.Contrattacco,
      m.MovimentoSismico, m.Mimica, m.Ricciolscudo, m.Metronomo, m.Sostituto,
      m.Russare, m.Fangosberla, m.Ventogelato, m.Resistenza, m.Bullo,
      m.Sonnolalia, m.Dinamipugno, m.Dolcebacio
    ],
    evolution: {stage: "stage2", to: []}
  },
  "187": {
    name: "Hoppip",
    dexNumber: 187,
    type: ["Erba", "Volante"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 23
    },
    exp: 50,
    movesByLevel: {
      5: [m.Splash, m.Colpocoda, m.Sintesi, m.Azione],
      13: [m.Velenpolvere],
      15: [m.Paralizzante],
      17: [m.Sonnifero],
      20: [m.Parassiseme],
      25: [m.Cottonspora],
      30: [m.Megassorbimento]
    },
    movesByMT: [
      m.Solarraggio, m.Tossina, m.Doppioteam, m.Flash, m.Riposo,
      m.Protezione, m.Gigassorbimento, m.Attrazione, m.Ritorno, m.Frustrazione,
      m.Introforza, m.Giornodisole, m.Facciata, m.Forzasegreta, m.Semitraglia,
      m.Aeroassalto, m.Sdoppiatore, m.Confusione, m.Riflesso, m.Amnesia,
      m.Ripeti, m.Psicamisu, m.Altruismo, m.Danzaspada, m.Mimica,
      m.Ricciolscudo, m.Sostituto, m.Russare, m.Resistenza, m.Bullo,
      m.Sonnolalia
    ],
    evolution: {stage: "base", to: [{species: "188", trigger: {kind: "level", level: 18}}]}
  },
  "188": {
    name: "Skiploom",
    dexNumber: 188,
    type: ["Erba", "Volante"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 18,
      maxLevel: 37
    },
    exp: 100,
    movesByLevel: {
      5: [m.Azione, m.Colpocoda, m.Splash, m.Sintesi],
      13: [m.Velenpolvere],
      15: [m.Paralizzante],
      17: [m.Sonnifero],
      22: [m.Parassiseme],
      29: [m.Cottonspora],
      36: [m.Megassorbimento]
    },
    movesByMT: [
      m.Solarraggio, m.Tossina, m.Doppioteam, m.Flash, m.Riposo,
      m.Protezione, m.Gigassorbimento, m.Attrazione, m.Ritorno, m.Frustrazione,
      m.Introforza, m.Giornodisole, m.Facciata, m.Forzasegreta, m.Semitraglia,
      m.Aeroassalto, m.Sdoppiatore, m.Confusione, m.Riflesso, m.Amnesia,
      m.Ripeti, m.Psicamisu, m.Altruismo, m.Danzaspada, m.Mimica,
      m.Ricciolscudo, m.Sostituto, m.Russare, m.Resistenza, m.Bullo,
      m.Sonnolalia
    ],
    evolution: {stage: "stage1", to: [{species: "189", trigger: {kind: "level", level: 27}}]}
  },
  "189": {
    name: "Jumpluff",
    dexNumber: 189,
    type: ["Erba", "Volante"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 27,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.Azione, m.Colpocoda, m.Splash, m.Sintesi],
      13: [m.Velenpolvere],
      15: [m.Paralizzante],
      17: [m.Sonnifero],
      22: [m.Parassiseme],
      33: [m.Cottonspora],
      44: [m.Megassorbimento]
    },
    movesByMT: [
      m.IperRaggio, m.Solarraggio, m.Tossina, m.Doppioteam, m.Flash,
      m.Riposo, m.Protezione, m.Gigassorbimento, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Introforza, m.Giornodisole, m.Facciata, m.Forzasegreta,
      m.Semitraglia, m.Aeroassalto, m.Dinamipugno, m.Sdoppiatore, m.Confusione,
      m.Riflesso, m.Amnesia, m.Ripeti, m.Psicamisu, m.Altruismo,
      m.Danzaspada, m.Mimica, m.Ricciolscudo, m.Sostituto, m.Russare,
      m.Resistenza, m.Bullo, m.Sonnolalia
    ],
    evolution: {stage: "stage2", to: []}
  },
  "190": {
    name: "Aipom",
    dexNumber: 190,
    type: ["Normale"],
    gender: ["Maschio", "Femmina"],
    spriteGendered: true,
    encounter: {
      rarity: "u",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Graffio, m.Colpocoda],
      6: [m.Turbosabbia],
      13: [m.Sgomento],
      18: [m.Staffetta],
      25: [m.Solletico],
      31: [m.Sfuriate],
      38: [m.Comete],
      43: [m.Stridio],
      50: [m.Agilita]
    },
    movesByMT: [
      m.Taglio, m.Forza, m.Solarraggio, m.Fulmine, m.Tuono,
      m.Fossa, m.Tossina, m.Doppioteam, m.Riposo, m.Furto,
      m.Protezione, m.Attrazione, m.Ritorno, m.Frustrazione, m.Codacciaio,
      m.Introforza, m.Pioggiadanza, m.Giornodisole, m.PallaOmbra, m.Spaccaroccia,
      m.Facciata, m.Centripugno, m.Provocazione, m.Breccia, m.Scippo,
      m.Forzasegreta, m.Aeroassalto, m.Ondashock, m.Idropulsar, m.Doppiasberla,
      m.Schianto, m.Contrattacco, m.Agilita, m.Stridio, m.Dispetto,
      m.Inseguimento, m.Picchiaduro, m.Megapugno, m.Fuocopugno, m.Gelopugno,
      m.Tuonopugno, m.Megacalcio, m.Corposcontro, m.Sdoppiatore, m.MovimentoSismico,
      m.Tuononda, m.Mimica, m.Ricciolscudo, m.Metronomo, m.Comete,
      m.Mangiasogni, m.Sostituto, m.Incubo, m.Russare, m.Fangosberla,
      m.Resistenza, m.Bullo, m.Tagliofuria, m.Sonnolalia, m.Dinamipugno
    ],
    evolution: {stage: "base", to: []}
  },
  "191": {
    name: "Sunkern",
    dexNumber: 191,
    type: ["Erba"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 50
    },
    exp: 50,
    movesByLevel: {
      5: [m.Assorbimento],
      6: [m.Crescita],
      13: [m.Megassorbimento],
      18: [m.Radicamento],
      25: [m.Rimonta],
      30: [m.Giornodisole],
      37: [m.Sintesi],
      42: [m.Gigassorbimento]
    },
    movesByMT: [
      m.Taglio, m.Solarraggio, m.Tossina, m.Doppioteam, m.Schermoluce,
      m.Flash, m.Riposo, m.Protezione, m.Fangobomba, m.Gigassorbimento,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Salvaguardia, m.Introforza,
      m.Giornodisole, m.Facciata, m.Forzasegreta, m.Semitraglia, m.Parassiseme,
      m.Maledizione, m.Ripeti, m.Naturforza, m.Altruismo, m.Meloderba,
      m.Danzaspada, m.Sdoppiatore, m.Mimica, m.Sostituto, m.Russare,
      m.Resistenza, m.Bullo, m.Sonnolalia
    ],
    evolution: {stage: "base", to: [{species: "192", trigger: {kind: "item", item: i.pietrasolare}}]}
  },
  "192": {
    name: "Sunflora",
    dexNumber: 192,
    type: ["Erba"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Botta, m.Assorbimento],
      6: [m.Crescita],
      13: [m.Foglielama],
      18: [m.Radicamento],
      25: [m.Semitraglia],
      30: [m.Giornodisole],
      37: [m.Petalodanza],
      42: [m.Solarraggio]
    },
    movesByMT: [
      m.Taglio, m.IperRaggio, m.Solarraggio, m.Tossina, m.Doppioteam,
      m.Schermoluce, m.Flash, m.Riposo, m.Protezione, m.Fangobomba,
      m.Gigassorbimento, m.Attrazione, m.Ritorno, m.Frustrazione, m.Salvaguardia,
      m.Introforza, m.Giornodisole, m.Facciata, m.Forzasegreta, m.Semitraglia,
      m.Parassiseme, m.Maledizione, m.Ripeti, m.Naturforza, m.Altruismo,
      m.Meloderba, m.Danzaspada, m.Sdoppiatore, m.Mimica, m.Sostituto,
      m.Russare, m.Resistenza, m.Bullo, m.Sonnolalia
    ],
    evolution: {stage: "stage1", to: []}
  },
  "193": {
    name: "Yanma",
    dexNumber: 193,
    type: ["Coleottero", "Volante"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Azione, m.Preveggenza],
      6: [m.AttaccoRapido],
      12: [m.Doppioteam],
      17: [m.Sonicboom],
      23: [m.Ipnosi],
      28: [m.Individua],
      34: [m.Baraonda],
      39: [m.AttaccodAla],
      45: [m.Supersuono],
      50: [m.Stridio]
    },
    movesByMT: [
      m.Solarraggio, m.Tossina, m.Psichico, m.Doppioteam, m.Flash,
      m.Riposo, m.Furto, m.Protezione, m.Gigassorbimento, m.Alacciaio,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Introforza, m.Giornodisole,
      m.PallaOmbra, m.Facciata, m.Forzasegreta, m.Aeroassalto, m.Turbine,
      m.Sanguisuga, m.Contropiede, m.Ventargenteo, m.Segnoraggio, m.Sdoppiatore,
      m.Mimica, m.Comete, m.Mangiasogni, m.Sostituto, m.Russare,
      m.Resistenza, m.Bullo, m.Sonnolalia
    ],
    evolution: {stage: "base", to: []}
  },
  "194": {
    name: "Wooper",
    dexNumber: 194,
    type: ["Acqua", "Terra"],
    gender: ["Maschio", "Femmina"],
    spriteGendered: true,
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 30
    },
    exp: 50,
    movesByLevel: {
      5: [m.Colpocoda, m.Pistolacqua],
      11: [m.Schianto],
      16: [m.Colpodifango],
      21: [m.Amnesia],
      31: [m.Sbadiglio],
      36: [m.Terremoto],
      41: [m.Pioggiadanza],
      51: [m.Nebbia, m.Nube]
    },
    movesByMT: [
      m.Surf, m.Geloraggio, m.Bora, m.Terremoto, m.Fossa,
      m.Tossina, m.Doppioteam, m.Cascata, m.Flash, m.Riposo,
      m.Protezione, m.Fangobomba, m.Terrempesta, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Codacciaio, m.Introforza, m.Pioggiadanza, m.Spaccaroccia,
      m.Grandine, m.Facciata, m.Forzasegreta, m.Sub, m.Idropulsar,
      m.Corposcontro, m.Maledizione, m.Salvaguardia, m.Forzantica, m.Accumulo,
      m.Sfoghenergia, m.Introenergia, m.Fangata, m.Gelopugno, m.Sdoppiatore,
      m.Mimica, m.Ricciolscudo, m.Sostituto, m.Russare, m.Fangosberla,
      m.Resistenza, m.Rotolamento, m.Bullo, m.Sonnolalia, m.Dinamipugno
    ],
    evolution: {stage: "base", to: [{species: "195", trigger: {kind: "level", level: 20}}]}
  },
  "195": {
    name: "Quagsire",
    dexNumber: 195,
    type: ["Acqua", "Terra"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 20,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Colpocoda, m.Pistolacqua],
      11: [m.Schianto],
      16: [m.Colpodifango],
      23: [m.Amnesia],
      35: [m.Sbadiglio],
      42: [m.Terremoto],
      49: [m.Pioggiadanza],
      61: [m.Nebbia, m.Nube]
    },
    movesByMT: [
      m.Surf, m.Geloraggio, m.Bora, m.IperRaggio, m.Forza,
      m.Terremoto, m.Fossa, m.Tossina, m.Doppioteam, m.Cascata,
      m.Flash, m.Riposo, m.Protezione, m.Fangobomba, m.Terrempesta,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Codacciaio, m.Introforza,
      m.Pioggiadanza, m.Spaccaroccia, m.Grandine, m.Facciata, m.Centripugno,
      m.Breccia, m.Forzasegreta, m.Sub, m.Rocciotomba, m.Idropulsar,
      m.Corposcontro, m.Maledizione, m.Salvaguardia, m.Forzantica, m.Accumulo,
      m.Sfoghenergia, m.Introenergia, m.Fangata, m.Megapugno, m.Gelopugno,
      m.Megacalcio, m.Sdoppiatore, m.Contrattacco, m.MovimentoSismico, m.Mimica,
      m.Ricciolscudo, m.Sostituto, m.Russare, m.Fangosberla, m.Resistenza,
      m.Rotolamento, m.Bullo, m.Sonnolalia, m.Dinamipugno
    ],
    evolution: {stage: "stage1", to: []}
  },
  "196": {
    name: "Espeon",
    dexNumber: 196,
    type: ["Psico"],
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
      16: [m.Confusione],
      23: [m.AttaccoRapido],
      30: [m.Comete],
      36: [m.Psicoraggio],
      42: [m.Psicamisu],
      47: [m.Psichico],
      52: [m.Mattindoro]
    },
    movesByMT: [
      m.Taglio, m.IperRaggio, m.Fossa, m.Tossina, m.Psichico,
      m.Doppioteam, m.Schermoluce, m.Riflesso, m.Flash, m.Riposo,
      m.Protezione, m.Attrazione, m.Ritorno, m.Frustrazione, m.Codacciaio,
      m.Introforza, m.Pioggiadanza, m.Giornodisole, m.PallaOmbra, m.Facciata,
      m.Forzasegreta, m.Calmamente, m.Maledizione, m.Flagello, m.Resistenza,
      m.Fascino, m.Desiderio, m.Solletico, m.Corposcontro, m.Sdoppiatore,
      m.Mimica, m.Comete, m.Mangiasogni, m.Sostituto, m.Incubo,
      m.Russare, m.Fangosberla, m.Bullo, m.Sonnolalia, m.Psicamisu
    ],
    evolution: {stage: "stage1", to: []}
  },
  "197": {
    name: "Umbreon",
    dexNumber: 197,
    type: ["Buio"],
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
      16: [m.Inseguimento],
      23: [m.AttaccoRapido],
      30: [m.Stordiraggio],
      36: [m.Finta],
      42: [m.Malosguardo],
      47: [m.Stridio],
      52: [m.Lucelunare]
    },
    movesByMT: [
      m.Taglio, m.IperRaggio, m.Fossa, m.Tossina, m.Psichico,
      m.Doppioteam, m.Flash, m.Riposo, m.Protezione, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Codacciaio, m.Introforza, m.Pioggiadanza,
      m.Giornodisole, m.PallaOmbra, m.Attaccalite, m.Facciata, m.Provocazione,
      m.Scippo, m.Forzasegreta, m.Maledizione, m.Flagello, m.Resistenza,
      m.Fascino, m.Desiderio, m.Solletico, m.Corposcontro, m.Sdoppiatore,
      m.Mimica, m.Comete, m.Mangiasogni, m.Sostituto, m.Incubo,
      m.Russare, m.Fangosberla, m.Bullo, m.Sonnolalia, m.Psicamisu
    ],
    evolution: {stage: "stage1", to: []}
  },
  "198": {
    name: "Murkrow",
    dexNumber: 198,
    type: ["Buio", "Volante"],
    gender: ["Maschio", "Femmina"],
    spriteGendered: true,
    encounter: {
      rarity: "u",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Beccata],
      9: [m.Sgomento],
      14: [m.Inseguimento],
      22: [m.Nube],
      27: [m.OmbraNotturna],
      35: [m.Finta],
      40: [m.Provocazione],
      48: [m.Malosguardo]
    },
    movesByMT: [
      m.Volo, m.Tossina, m.Doppioteam, m.Riposo, m.Furto,
      m.Protezione, m.Alacciaio, m.Attrazione, m.Ritorno, m.Frustrazione,
      m.Introforza, m.Pioggiadanza, m.Giornodisole, m.PallaOmbra, m.Attaccalite,
      m.Facciata, m.Provocazione, m.Scippo, m.Forzasegreta, m.Aeroassalto,
      m.Calmamente, m.AttaccodAla, m.Turbine, m.Perforbecco, m.Stordiraggio,
      m.Speculmossa, m.Aeroattacco, m.Ultimocanto, m.Danzadipiume, m.Sdoppiatore,
      m.Tuononda, m.Mimica, m.Comete, m.Mangiasogni, m.Sostituto,
      m.Incubo, m.Russare, m.Fangosberla, m.Ventogelato, m.Resistenza,
      m.Bullo, m.Sonnolalia, m.Psicamisu
    ],
    evolution: {stage: "base", to: []}
  },
  "199": {
    name: "Slowking",
    dexNumber: 199,
    type: ["Acqua", "Psico"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 50,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.Azione, m.Maledizione, m.Sbadiglio],
      6: [m.Ruggito],
      13: [m.Pistolacqua],
      17: [m.Confusione],
      24: [m.Inibitore],
      29: [m.Bottintesta],
      36: [m.Bullo],
      40: [m.Psichico],
      47: [m.Psicamisu]
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
    evolution: {stage: "stage2", to: []}
  },
  "200": {
    name: "Misdreavus",
    dexNumber: 200,
    type: ["Spettro"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Ruggito, m.Psiconda, m.Sgomento],
      6: [m.Dispetto],
      17: [m.Stordiraggio],
      23: [m.Malosguardo],
      30: [m.Psicoraggio],
      37: [m.Malcomune],
      45: [m.Ultimocanto],
      53: [m.Rancore]
    },
    movesByMT: [
      m.Fulmine, m.Tuono, m.Tossina, m.Psichico, m.Doppioteam,
      m.Flash, m.Riposo, m.Furto, m.Protezione, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Giornodisole,
      m.PallaOmbra, m.Attaccalite, m.Facciata, m.Provocazione, m.Scippo,
      m.Forzasegreta, m.Aeroassalto, m.Calmamente, m.Ondashock, m.Stridio,
      m.Destinobbligato, m.Psicamisu, m.Esclusiva, m.Sdoppiatore, m.Tuononda,
      m.Mimica, m.Ricciolscudo, m.Comete, m.Mangiasogni, m.Sostituto,
      m.Incubo, m.Russare, m.Resistenza, m.Bullo, m.Sonnolalia
    ],
    evolution: {stage: "base", to: []}
  },
  "201": {
    name: "Unown",
    dexNumber: 201,
    type: ["Psico"],
    gender: [],
    encounter: {
      rarity: "u",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Introforza]
    },
    movesByMT: [],
    evolution: {stage: "base", to: []}
  },
  "202": {
    name: "Wobbuffet",
    dexNumber: 202,
    type: ["Psico"],
    gender: ["Maschio", "Femmina"],
    spriteGendered: true,
    encounter: {
      rarity: "u",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Contrattacco, m.Destinobbligato, m.Salvaguardia, m.Specchiovelo]
    },
    movesByMT: [
      m.Solletico
    ],
    evolution: {stage: "base", to: []}
  },
  "203": {
    name: "Girafarig",
    dexNumber: 203,
    type: ["Normale", "Psico"],
    gender: ["Maschio", "Femmina"],
    spriteGendered: true,
    encounter: {
      rarity: "r",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Azione, m.Ruggito],
      7: [m.Sgomento],
      13: [m.Confusione],
      19: [m.Pestone],
      25: [m.Segugio],
      31: [m.Agilita],
      37: [m.Staffetta],
      43: [m.Psicoraggio],
      49: [m.Sgranocchio]
    },
    movesByMT: [
      m.Forza, m.Fulmine, m.Tuono, m.Terremoto, m.Tossina,
      m.Psichico, m.Doppioteam, m.Schermoluce, m.Riflesso, m.Flash,
      m.Riposo, m.Furto, m.Protezione, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Codacciaio, m.Introforza, m.Pioggiadanza, m.Giornodisole,
      m.PallaOmbra, m.Spaccaroccia, m.Facciata, m.Forzasegreta, m.Calmamente,
      m.Ondashock, m.Riduttore, m.Amnesia, m.Preveggenza, m.Psicamisu,
      m.Divinazione, m.Picchiaduro, m.Desiderio, m.Magivelo, m.Corposcontro,
      m.Sdoppiatore, m.Tuononda, m.Mimica, m.Comete, m.Mangiasogni,
      m.Sostituto, m.Incubo, m.Russare, m.Fangosberla, m.Resistenza,
      m.Bullo, m.Sonnolalia
    ],
    evolution: {stage: "base", to: []}
  },
  "204": {
    name: "Pineco",
    dexNumber: 204,
    type: ["Coleottero"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 41
    },
    exp: 50,
    movesByLevel: {
      5: [m.Azione, m.Protezione],
      8: [m.Autodistruzione],
      15: [m.Riduttore],
      22: [m.Rapigiro],
      29: [m.Pazienza],
      36: [m.Esplosione],
      43: [m.Punte],
      50: [m.Sdoppiatore]
    },
    movesByMT: [
      m.Forza, m.Solarraggio, m.Terremoto, m.Fossa, m.Tossina,
      m.Doppioteam, m.Schermoluce, m.Riflesso, m.Riposo, m.Protezione,
      m.Terrempesta, m.Gigassorbimento, m.Attrazione, m.Ritorno, m.Frustrazione,
      m.Introforza, m.Giornodisole, m.Spaccaroccia, m.Facciata, m.Forzasegreta,
      m.Missilspillo, m.Contrattacco, m.Comete, m.Flagello, m.Sabbiotomba,
      m.Corposcontro, m.Sdoppiatore, m.Mimica, m.Ricciolscudo, m.Autodistruzione,
      m.Esplosione, m.Frana, m.Sostituto, m.Russare, m.Resistenza,
      m.Rotolamento, m.Bullo, m.Sonnolalia, m.Punte, m.Rinfrescata
    ],
    evolution: {stage: "base", to: [{species: "205", trigger: {kind: "level", level: 31}}]}
  },
  "205": {
    name: "Forretress",
    dexNumber: 205,
    type: ["Coleottero", "Acciaio"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 31,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Azione, m.Protezione],
      8: [m.Autodistruzione],
      15: [m.Riduttore],
      22: [m.Rapigiro],
      29: [m.Pazienza],
      31: [m.Falcecannone],
      39: [m.Esplosione],
      49: [m.Punte],
      59: [m.Sdoppiatore]
    },
    movesByMT: [
      m.IperRaggio, m.Forza, m.Solarraggio, m.Terremoto, m.Fossa,
      m.Tossina, m.Doppioteam, m.Schermoluce, m.Riflesso, m.Riposo,
      m.Protezione, m.Terrempesta, m.Gigassorbimento, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Introforza, m.Giornodisole, m.Spaccaroccia, m.Facciata,
      m.Forzasegreta, m.Missilspillo, m.Contrattacco, m.Comete, m.Flagello,
      m.Sabbiotomba, m.Corposcontro, m.Sdoppiatore, m.Mimica, m.Ricciolscudo,
      m.Autodistruzione, m.Esplosione, m.Frana, m.Sostituto, m.Russare,
      m.Resistenza, m.Rotolamento, m.Bullo, m.Sonnolalia, m.Punte,
      m.Rinfrescata
    ],
    evolution: {stage: "stage1", to: []}
  },
  "206": {
    name: "Dunsparce",
    dexNumber: 206,
    type: ["Normale"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Ira, m.Ricciolscudo],
      11: [m.Sbadiglio],
      14: [m.SguardoFeroce],
      21: [m.Rotolamento],
      24: [m.Dispetto],
      31: [m.Inseguimento],
      34: [m.Stridio],
      41: [m.Riduttore],
      44: [m.Flagello],
      51: [m.Rimonta]
    },
    movesByMT: [
      m.Lanciafiamme, m.Geloraggio, m.Bora, m.Forza, m.Solarraggio,
      m.Fulmine, m.Tuono, m.Terremoto, m.Fossa, m.Tossina,
      m.Doppioteam, m.Fuocobomba, m.Riposo, m.Furto, m.Protezione,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Codacciaio, m.Introforza,
      m.Pioggiadanza, m.Giornodisole, m.PallaOmbra, m.Spaccaroccia, m.Facciata,
      m.Forzasegreta, m.Rocciotomba, m.Calmamente, m.Ondashock, m.Idropulsar,
      m.Bottintesta, m.Morso, m.Pazienza, m.Frana, m.Maledizione,
      m.Forzantica, m.Sgomento, m.Corposcontro, m.Sdoppiatore, m.Contrattacco,
      m.Tuononda, m.Mimica, m.Ricciolscudo, m.Mangiasogni, m.Sostituto,
      m.Incubo, m.Russare, m.Fangosberla, m.Resistenza, m.Rotolamento,
      m.Bullo, m.Sonnolalia, m.Psicamisu
    ],
    evolution: {stage: "base", to: []}
  },
  "207": {
    name: "Gligar",
    dexNumber: 207,
    type: ["Terra", "Volante"],
    gender: ["Maschio", "Femmina"],
    spriteGendered: true,
    encounter: {
      rarity: "u",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Velenospina],
      6: [m.Turbosabbia],
      13: [m.Rafforzatore],
      20: [m.AttaccoRapido],
      28: [m.Finta],
      36: [m.Lacerazione],
      44: [m.Stridio],
      52: [m.Ghigliottina]
    },
    movesByMT: [
      m.Taglio, m.Forza, m.Terremoto, m.Fossa, m.Tossina,
      m.Doppioteam, m.Riposo, m.Furto, m.Protezione, m.Fangobomba,
      m.Terrempesta, m.Alacciaio, m.Attrazione, m.Ritorno, m.Frustrazione,
      m.Codacciaio, m.Introforza, m.Pioggiadanza, m.Giornodisole, m.Spaccaroccia,
      m.Facciata, m.Forzasegreta, m.Rocciotomba, m.Aeroassalto, m.Ventagliente,
      m.AttaccodAla, m.Contrattacco, m.Ferrartigli, m.Sabbiotomba, m.Danzaspada,
      m.Sdoppiatore, m.Mimica, m.Comete, m.Mangiasogni, m.Frana,
      m.Sostituto, m.Russare, m.Resistenza, m.Bullo, m.Tagliofuria,
      m.Sonnolalia
    ],
    evolution: {stage: "base", to: []}
  },
  "208": {
    name: "Steelix",
    dexNumber: 208,
    type: ["Acciaio", "Terra"],
    gender: ["Maschio", "Femmina"],
    spriteGendered: true,
    encounter: {
      rarity: "r",
      minLevel: 50,
      maxLevel: 60
    },
    exp: 100,
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
      52: [m.Sgranocchio],
      56: [m.Sdoppiatore]
    },
    movesByMT: [
      m.Taglio, m.Boato, m.IperRaggio, m.Forza, m.Terremoto,
      m.Fossa, m.Tossina, m.Doppioteam, m.Riposo, m.Protezione,
      m.Terrempesta, m.Attrazione, m.Ritorno, m.Frustrazione, m.Codacciaio,
      m.Introforza, m.Giornodisole, m.Spaccaroccia, m.Attaccalite, m.Facciata,
      m.Provocazione, m.Forzasegreta, m.Rocciotomba, m.Esplosione, m.Frana,
      m.Flagello, m.Blocco, m.Corposcontro, m.Sdoppiatore, m.Mimica,
      m.Ricciolscudo, m.Autodistruzione, m.Sostituto, m.Russare, m.Fangosberla,
      m.Resistenza, m.Rotolamento, m.Bullo, m.Sonnolalia, m.Psicamisu
    ],
    evolution: {stage: "stage1", to: []}
  },
  "209": {
    name: "Snubbull",
    dexNumber: 209,
    type: ["Folletto"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 33
    },
    exp: 50,
    movesByLevel: {
      5: [m.Azione, m.Colpocoda, m.Visotruce],
      8: [m.Fascino],
      13: [m.Morso],
      19: [m.Leccata],
      26: [m.Boato],
      34: [m.Ira],
      43: [m.Riduttore],
      53: [m.Sgranocchio]
    },
    movesByMT: [
      m.Boato, m.Lanciafiamme, m.Forza, m.Solarraggio, m.Fulmine,
      m.Tuono, m.Terremoto, m.Fossa, m.Tossina, m.Doppioteam,
      m.Fuocobomba, m.Riposo, m.Furto, m.Protezione, m.Fangobomba,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Introforza, m.Pioggiadanza,
      m.Giornodisole, m.PallaOmbra, m.Spaccaroccia, m.Attaccalite, m.Facciata,
      m.Centripugno, m.Provocazione, m.Breccia, m.Forzasegreta, m.Vampata,
      m.Granfisico, m.Ondashock, m.Idropulsar, m.Riflesso, m.Metronomo,
      m.Russare, m.Finta, m.Rintoccasana, m.Regalino, m.Sgranocchio,
      m.Maniereforti, m.Megapugno, m.Fuocopugno, m.Gelopugno, m.Tuonopugno,
      m.Megacalcio, m.Corposcontro, m.Sdoppiatore, m.Contrattacco, m.MovimentoSismico,
      m.Tuononda, m.Mimica, m.Ricciolscudo, m.Sostituto, m.Fangosberla,
      m.Resistenza, m.Bullo, m.Sonnolalia, m.Dinamipugno
    ],
    evolution: {stage: "base", to: [{species: "210", trigger: {kind: "level", level: 23}}]}
  },
  "210": {
    name: "Granbull",
    dexNumber: 210,
    type: ["Folletto"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 23,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Azione, m.Colpocoda, m.Visotruce],
      8: [m.Fascino],
      13: [m.Morso],
      19: [m.Leccata],
      28: [m.Boato],
      38: [m.Ira],
      49: [m.Riduttore],
      61: [m.Sgranocchio]
    },
    movesByMT: [
      m.Boato, m.Lanciafiamme, m.IperRaggio, m.Forza, m.Solarraggio,
      m.Fulmine, m.Tuono, m.Terremoto, m.Fossa, m.Tossina,
      m.Doppioteam, m.Fuocobomba, m.Riposo, m.Furto, m.Protezione,
      m.Fangobomba, m.Attrazione, m.Ritorno, m.Frustrazione, m.Codacciaio,
      m.Introforza, m.Pioggiadanza, m.Giornodisole, m.PallaOmbra, m.Spaccaroccia,
      m.Attaccalite, m.Facciata, m.Centripugno, m.Provocazione, m.Breccia,
      m.Forzasegreta, m.Vampata, m.Rocciotomba, m.Granfisico, m.Ondashock,
      m.Idropulsar, m.Riflesso, m.Metronomo, m.Russare, m.Finta,
      m.Rintoccasana, m.Regalino, m.Sgranocchio, m.Maniereforti, m.Megapugno,
      m.Fuocopugno, m.Gelopugno, m.Tuonopugno, m.Megacalcio, m.Corposcontro,
      m.Sdoppiatore, m.Contrattacco, m.MovimentoSismico, m.Tuononda, m.Mimica,
      m.Ricciolscudo, m.Frana, m.Sostituto, m.Fangosberla, m.Resistenza,
      m.Bullo, m.Sonnolalia, m.Dinamipugno
    ],
    evolution: {stage: "stage1", to: []}
  },
  "211": {
    name: "Qwilfish",
    dexNumber: 211,
    type: ["Acqua", "Veleno"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Azione, m.Velenospina, m.Punte],
      9: [m.Rafforzatore, m.Minimizzato],
      13: [m.Pistolacqua],
      21: [m.Missilspillo],
      25: [m.Vendetta],
      33: [m.Riduttore],
      37: [m.Idropompa],
      45: [m.Destinobbligato]
    },
    movesByMT: [
      m.Surf, m.Geloraggio, m.Bora, m.Tossina, m.Doppioteam,
      m.Cascata, m.Riposo, m.Protezione, m.Fangobomba, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Introforza, m.Pioggiadanza, m.PallaOmbra,
      m.Grandine, m.Facciata, m.Forzasegreta, m.Sub, m.Ondashock,
      m.Idropulsar, m.Supersuono, m.Bollaraggio, m.Nube, m.Flagello,
      m.Sgomento, m.Danzaspada, m.Sdoppiatore, m.Tuononda, m.Mimica,
      m.Ricciolscudo, m.Autodistruzione, m.Comete, m.Sostituto, m.Russare,
      m.Ventogelato, m.Resistenza, m.Rotolamento, m.Bullo, m.Sonnolalia
    ],
    evolution: {stage: "base", to: []}
  },
  "212": {
    name: "Scizor",
    dexNumber: 212,
    type: ["Coleottero", "Acciaio"],
    gender: ["Maschio", "Femmina"],
    spriteGendered: true,
    encounter: {
      rarity: "r",
      minLevel: 50,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Fulmisguardo, m.AttaccoRapido],
      6: [m.Focalenergia],
      11: [m.Inseguimento],
      16: [m.Falsofinale],
      21: [m.Agilita],
      26: [m.Ferrartigli],
      31: [m.Lacerazione],
      36: [m.Danzaspada],
      41: [m.Ferroscudo],
      46: [m.Tagliofuria],
      60: [m.Ghigliottina]
    },
    movesByMT: [
      m.Taglio, m.IperRaggio, m.Forza, m.Tossina, m.Doppioteam,
      m.Riposo, m.Furto, m.Protezione, m.Terrempesta, m.Alacciaio,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Introforza, m.Pioggiadanza,
      m.Giornodisole, m.Spaccaroccia, m.Facciata, m.Forzasegreta, m.Aeroassalto,
      m.Ventagliente, m.Contrattacco, m.Schermoluce, m.Contropiede, m.Resistenza,
      m.Salvaguardia, m.Staffetta, m.Ventargenteo, m.Danzaspada, m.Sdoppiatore,
      m.Mimica, m.Comete, m.Sostituto, m.Russare, m.Bullo,
      m.Tagliofuria, m.Sonnolalia, m.Lacerazione, m.Mattindoro
    ],
    evolution: {stage: "stage1", to: []}
  },
  "213": {
    name: "Shuckle",
    dexNumber: 213,
    type: ["Coleottero", "Roccia"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Ritirata, m.Limitazione],
      9: [m.Avvolgibotta],
      14: [m.Ripeti],
      23: [m.Salvaguardia],
      28: [m.Pazienza],
      37: [m.Riposo]
    },
    movesByMT: [
      m.Forza, m.Terremoto, m.Fossa, m.Tossina, m.Doppioteam,
      m.Flash, m.Riposo, m.Protezione, m.Fangobomba, m.Terrempesta,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Salvaguardia, m.Introforza,
      m.Giornodisole, m.Spaccaroccia, m.Facciata, m.Forzasegreta, m.Rocciotomba,
      m.Profumino, m.Corposcontro, m.Sdoppiatore, m.Mimica, m.Ricciolscudo,
      m.Frana, m.Sostituto, m.Russare, m.Fangosberla, m.Resistenza,
      m.Rotolamento, m.Bullo, m.Sonnolalia
    ],
    evolution: {stage: "base", to: []}
  },
  "214": {
    name: "Heracross",
    dexNumber: 214,
    type: ["Coleottero", "Lotta"],
    gender: ["Maschio", "Femmina"],
    spriteGendered: true,
    encounter: {
      rarity: "r",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Azione, m.Fulmisguardo],
      6: [m.Incornata],
      11: [m.Resistenza],
      17: [m.Furia],
      23: [m.Breccia],
      30: [m.Contrattacco],
      37: [m.Riduttore],
      45: [m.Contropiede],
      53: [m.Megacorno]
    },
    movesByMT: [
      m.Taglio, m.IperRaggio, m.Forza, m.Terremoto, m.Fossa,
      m.Tossina, m.Doppioteam, m.Riposo, m.Furto, m.Protezione,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Introforza, m.Pioggiadanza,
      m.Giornodisole, m.Spaccaroccia, m.Facciata, m.Centripugno, m.Breccia,
      m.Forzasegreta, m.Rocciotomba, m.Granfisico, m.Rafforzatore, m.Pazienza,
      m.Flagello, m.Falsofinale, m.Danzaspada, m.Corposcontro, m.Sdoppiatore,
      m.Contrattacco, m.MovimentoSismico, m.Mimica, m.Frana, m.Sostituto,
      m.Russare, m.Resistenza, m.Bullo, m.Tagliofuria, m.Sonnolalia
    ],
    evolution: {stage: "base", to: []}
  },
  "215": {
    name: "Sneasel",
    dexNumber: 215,
    type: ["Buio", "Ghiaccio"],
    gender: ["Maschio", "Femmina"],
    spriteGendered: true,
    encounter: {
      rarity: "r",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Graffio, m.Fulmisguardo, m.Provocazione],
      8: [m.AttaccoRapido],
      15: [m.Stridio],
      22: [m.Finta],
      29: [m.Sfuriate],
      36: [m.Agilita],
      43: [m.Ventogelato],
      50: [m.Lacerazione],
      57: [m.Picchiaduro],
      60: [m.Purogelo],
      64: [m.Ferrartigli]
    },
    movesByMT: [
      m.Taglio, m.Surf, m.Geloraggio, m.Bora, m.Forza,
      m.Fossa, m.Tossina, m.Doppioteam, m.Riposo, m.Furto,
      m.Protezione, m.Attrazione, m.Ritorno, m.Frustrazione, m.Codacciaio,
      m.Introforza, m.Pioggiadanza, m.Giornodisole, m.PallaOmbra, m.Spaccaroccia,
      m.Grandine, m.Attaccalite, m.Facciata, m.Centripugno, m.Provocazione,
      m.Breccia, m.Scippo, m.Forzasegreta, m.Aeroassalto, m.Calmamente,
      m.Morso, m.Contrattacco, m.Riflesso, m.Dispetto, m.Preveggenza,
      m.Bruciapelo, m.Tritartigli, m.Gelopugno, m.Danzaspada, m.Sdoppiatore,
      m.Mimica, m.Ricciolscudo, m.Comete, m.Mangiasogni, m.Sostituto,
      m.Incubo, m.Russare, m.Fangosberla, m.Ventogelato, m.Resistenza,
      m.Bullo, m.Tagliofuria, m.Sonnolalia, m.Dinamipugno, m.Psicamisu
    ],
    evolution: {stage: "base", to: []}
  },
  "216": {
    name: "Teddiursa",
    dexNumber: 216,
    type: ["Normale"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 40
    },
    exp: 50,
    movesByLevel: {
      5: [m.Graffio, m.Fulmisguardo],
      7: [m.Leccata],
      13: [m.Sfuriate],
      19: [m.Falselacrime],
      25: [m.Finta],
      31: [m.Riposo],
      37: [m.Lacerazione],
      43: [m.Russare],
      49: [m.Colpo]
    },
    movesByMT: [
      m.Taglio, m.Boato, m.Forza, m.Terremoto, m.Fossa,
      m.Tossina, m.Doppioteam, m.Riposo, m.Furto, m.Protezione,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Introforza, m.Pioggiadanza,
      m.Giornodisole, m.Spaccaroccia, m.Attaccalite, m.Facciata, m.Centripugno,
      m.Provocazione, m.Breccia, m.Forzasegreta, m.Aeroassalto, m.Granfisico,
      m.Riduttore, m.Contrattacco, m.MovimentoSismico, m.Sonnolalia, m.Ferrartigli,
      m.Sgranocchio, m.Sbadiglio, m.Falselacrime, m.Megapugno, m.Fuocopugno,
      m.Gelopugno, m.Tuonopugno, m.Danzaspada, m.Megacalcio, m.Corposcontro,
      m.Sdoppiatore, m.Mimica, m.Ricciolscudo, m.Metronomo, m.Comete,
      m.Sostituto, m.Russare, m.Fangosberla, m.Resistenza, m.Rotolamento,
      m.Bullo, m.Tagliofuria, m.Dinamipugno, m.Leccata, m.Rinfrescata
    ],
    evolution: {stage: "base", to: [{species: "217", trigger: {kind: "level", level: 30}}]}
  },
  "217": {
    name: "Ursaring",
    dexNumber: 217,
    type: ["Normale"],
    gender: ["Maschio", "Femmina"],
    spriteGendered: true,
    encounter: {
      rarity: "u",
      minLevel: 30,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Graffio, m.Fulmisguardo],
      7: [m.Leccata],
      13: [m.Sfuriate],
      19: [m.Falselacrime],
      25: [m.Finta],
      31: [m.Riposo],
      37: [m.Lacerazione],
      43: [m.Russare],
      49: [m.Colpo]
    },
    movesByMT: [
      m.Taglio, m.Boato, m.IperRaggio, m.Forza, m.Terremoto,
      m.Fossa, m.Tossina, m.Doppioteam, m.Riposo, m.Furto,
      m.Protezione, m.Attrazione, m.Ritorno, m.Frustrazione, m.Introforza,
      m.Pioggiadanza, m.Giornodisole, m.Spaccaroccia, m.Attaccalite, m.Facciata,
      m.Centripugno, m.Provocazione, m.Breccia, m.Forzasegreta, m.Rocciotomba,
      m.Aeroassalto, m.Granfisico, m.Riduttore, m.Contrattacco, m.MovimentoSismico,
      m.Sonnolalia, m.Ferrartigli, m.Sgranocchio, m.Sbadiglio, m.Falselacrime,
      m.Megapugno, m.Fuocopugno, m.Gelopugno, m.Tuonopugno, m.Danzaspada,
      m.Megacalcio, m.Corposcontro, m.Sdoppiatore, m.Mimica, m.Ricciolscudo,
      m.Metronomo, m.Comete, m.Frana, m.Sostituto, m.Russare,
      m.Fangosberla, m.Resistenza, m.Rotolamento, m.Bullo, m.Tagliofuria,
      m.Dinamipugno, m.Leccata, m.Rinfrescata
    ],
    evolution: {stage: "stage1", to: []}
  },
  "218": {
    name: "Slugma",
    dexNumber: 218,
    type: ["Fuoco"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 48
    },
    exp: 50,
    movesByLevel: {
      5: [m.Smog, m.Sbadiglio],
      8: [m.Braciere],
      15: [m.Sassata],
      22: [m.Rafforzatore],
      29: [m.Amnesia],
      36: [m.Lanciafiamme],
      43: [m.Frana],
      50: [m.Corposcontro]
    },
    movesByMT: [
      m.Lanciafiamme, m.Tossina, m.Doppioteam, m.Schermoluce, m.Riflesso,
      m.Fuocobomba, m.Riposo, m.Protezione, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Introforza, m.Giornodisole, m.Spaccaroccia, m.Facciata,
      m.Forzasegreta, m.Vampata, m.ScudoAcido, m.Ondacalda, m.Corposcontro,
      m.Sdoppiatore, m.Mimica, m.Ricciolscudo, m.Autodistruzione, m.Frana,
      m.Sostituto, m.Russare, m.Fangosberla, m.Resistenza, m.Rotolamento,
      m.Bullo, m.Sonnolalia
    ],
    evolution: {stage: "base", to: [{species: "219", trigger: {kind: "level", level: 38}}]}
  },
  "219": {
    name: "Magcargo",
    dexNumber: 219,
    type: ["Fuoco", "Roccia"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 38,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Smog, m.Sbadiglio],
      8: [m.Braciere],
      15: [m.Sassata],
      22: [m.Rafforzatore],
      29: [m.Amnesia],
      36: [m.Lanciafiamme],
      48: [m.Frana],
      60: [m.Corposcontro]
    },
    movesByMT: [
      m.Lanciafiamme, m.IperRaggio, m.Forza, m.Terremoto, m.Tossina,
      m.Doppioteam, m.Schermoluce, m.Riflesso, m.Fuocobomba, m.Riposo,
      m.Protezione, m.Terrempesta, m.Attrazione, m.Ritorno, m.Frustrazione,
      m.Introforza, m.Giornodisole, m.Spaccaroccia, m.Facciata, m.Forzasegreta,
      m.Vampata, m.Rocciotomba, m.Falcecannone, m.ScudoAcido, m.Ondacalda,
      m.Corposcontro, m.Sdoppiatore, m.Mimica, m.Ricciolscudo, m.Autodistruzione,
      m.Frana, m.Sostituto, m.Russare, m.Fangosberla, m.Resistenza,
      m.Rotolamento, m.Bullo, m.Sonnolalia, m.Rinfrescata
    ],
    evolution: {stage: "stage1", to: []}
  },
  "220": {
    name: "Swinub",
    dexNumber: 220,
    type: ["Ghiaccio", "Terra"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 43
    },
    exp: 50,
    movesByLevel: {
      5: [m.Azione, m.Segugio],
      10: [m.Polneve],
      19: [m.Resistenza],
      28: [m.Riduttore],
      37: [m.Nebbia],
      46: [m.Bora],
      55: [m.Amnesia]
    },
    movesByMT: [
      m.Boato, m.Geloraggio, m.Bora, m.Forza, m.Terremoto,
      m.Fossa, m.Tossina, m.Doppioteam, m.Schermoluce, m.Riflesso,
      m.Riposo, m.Protezione, m.Terrempesta, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Spaccaroccia, m.Grandine,
      m.Facciata, m.Forzasegreta, m.Rocciotomba, m.Corposcontro, m.Riduttore,
      m.Sdoppiatore, m.Morso, m.Frana, m.Forzantica, m.Gelolancia,
      m.Colpodifango, m.Mimica, m.Ricciolscudo, m.Sostituto, m.Russare,
      m.Fangosberla, m.Ventogelato, m.Resistenza, m.Bullo, m.Sonnolalia,
      m.Nebbia, m.Fascino
    ],
    evolution: {stage: "base", to: [{species: "221", trigger: {kind: "level", level: 33}}]}
  },
  "221": {
    name: "Piloswine",
    dexNumber: 221,
    type: ["Ghiaccio", "Terra"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 33,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Incornata, m.Segugio],
      10: [m.Polneve],
      19: [m.Resistenza],
      28: [m.Riduttore],
      33: [m.Furia],
      42: [m.Nebbia],
      56: [m.Bora],
      70: [m.Amnesia]
    },
    movesByMT: [
      m.Boato, m.Geloraggio, m.Bora, m.IperRaggio, m.Forza,
      m.Terremoto, m.Fossa, m.Tossina, m.Doppioteam, m.Schermoluce,
      m.Riflesso, m.Riposo, m.Protezione, m.Terrempesta, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Spaccaroccia,
      m.Grandine, m.Facciata, m.Forzasegreta, m.Rocciotomba, m.Corposcontro,
      m.Riduttore, m.Sdoppiatore, m.Morso, m.Frana, m.Forzantica,
      m.Gelolancia, m.Colpodifango, m.Mimica, m.Ricciolscudo, m.Sostituto,
      m.Russare, m.Fangosberla, m.Ventogelato, m.Resistenza, m.Bullo,
      m.Sonnolalia, m.Nebbia, m.Fascino
    ],
    evolution: {stage: "stage1", to: []}
  },
  "222": {
    name: "Corsola",
    dexNumber: 222,
    type: ["Acqua", "Roccia"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Azione],
      6: [m.Rafforzatore],
      12: [m.Bolla],
      17: [m.Ripresa, m.Rinfrescata],
      23: [m.Bollaraggio],
      28: [m.Sparalance],
      34: [m.Cadutamassi],
      39: [m.Specchiovelo],
      45: [m.Forzantica]
    },
    movesByMT: [
      m.Surf, m.Geloraggio, m.Bora, m.Forza, m.Terremoto,
      m.Fossa, m.Tossina, m.Psichico, m.Doppioteam, m.Schermoluce,
      m.Riflesso, m.Riposo, m.Protezione, m.Terrempesta, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Salvaguardia, m.Introforza, m.Pioggiadanza,
      m.Giornodisole, m.PallaOmbra, m.Spaccaroccia, m.Grandine, m.Facciata,
      m.Forzasegreta, m.Rocciotomba, m.Calmamente, m.Idropulsar, m.Nebbia,
      m.Stridio, m.Stordiraggio, m.Barriera, m.Amnesia, m.Frana,
      m.Radicamento, m.Gelolancia, m.Corposcontro, m.Sdoppiatore, m.Mimica,
      m.Ricciolscudo, m.Autodistruzione, m.Esplosione, m.Sostituto, m.Russare,
      m.Fangosberla, m.Resistenza, m.Rotolamento, m.Bullo, m.Sonnolalia,
      m.Fangata
    ],
    evolution: {stage: "base", to: []}
  },
  "223": {
    name: "Remoraid",
    dexNumber: 223,
    type: ["Acqua"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 35
    },
    exp: 50,
    movesByLevel: {
      5: [m.Pistolacqua],
      11: [m.Localizza],
      22: [m.Psicoraggio, m.Bollaraggio, m.Raggiaurora],
      33: [m.Focalenergia],
      44: [m.Geloraggio],
      55: [m.IperRaggio]
    },
    movesByMT: [
      m.Lanciafiamme, m.Surf, m.Geloraggio, m.Bora, m.IperRaggio,
      m.Tossina, m.Psichico, m.Doppioteam, m.Fuocobomba, m.Cascata,
      m.Riposo, m.Furto, m.Protezione, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Giornodisole, m.Facciata,
      m.Forzasegreta, m.Sub, m.Idropulsar, m.Supersuono, m.Raggiaurora,
      m.Tuononda, m.Stridio, m.Nube, m.Octazooka, m.Cadutamassi,
      m.Sdoppiatore, m.Mimica, m.Ricciolscudo, m.Comete, m.Sostituto,
      m.Russare, m.Fangosberla, m.Resistenza, m.Bullo, m.Sonnolalia
    ],
    evolution: {stage: "base", to: [{species: "224", trigger: {kind: "level", level: 25}}]}
  },
  "224": {
    name: "Octillery",
    dexNumber: 224,
    type: ["Acqua"],
    gender: ["Maschio", "Femmina"],
    spriteGendered: true,
    encounter: {
      rarity: "u",
      minLevel: 25,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Pistolacqua],
      11: [m.Limitazione],
      22: [m.Psicoraggio, m.Bollaraggio, m.Raggiaurora],
      25: [m.Octazooka],
      38: [m.Focalenergia],
      54: [m.Geloraggio],
      70: [m.IperRaggio]
    },
    movesByMT: [
      m.Lanciafiamme, m.Surf, m.Geloraggio, m.Bora, m.IperRaggio,
      m.Tossina, m.Psichico, m.Doppioteam, m.Fuocobomba, m.Cascata,
      m.Riposo, m.Furto, m.Protezione, m.Fangobomba, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Giornodisole,
      m.Facciata, m.Forzasegreta, m.Sub, m.Semitraglia, m.Idropulsar,
      m.Supersuono, m.Raggiaurora, m.Tuononda, m.Stridio, m.Nube,
      m.Octazooka, m.Cadutamassi, m.Sdoppiatore, m.MovimentoSismico, m.Mimica,
      m.Ricciolscudo, m.Comete, m.Sostituto, m.Russare, m.Fangosberla,
      m.Resistenza, m.Bullo, m.Sonnolalia
    ],
    evolution: {stage: "stage1", to: []}
  },
  "225": {
    name: "Delibird",
    dexNumber: 225,
    type: ["Ghiaccio", "Volante"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Regalino, m.Azione]
    },
    movesByMT: [
      m.Volo, m.Geloraggio, m.Bora, m.Tossina, m.Doppioteam,
      m.Riposo, m.Furto, m.Protezione, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Grandine, m.Facciata,
      m.Centripugno, m.Forzasegreta, m.Aeroassalto, m.Idropulsar, m.Raggiaurora,
      m.AttaccoRapido, m.Splash, m.Rapigiro, m.Divinazione, m.PallaGelo,
      m.Megapugno, m.Megacalcio, m.Corposcontro, m.Sdoppiatore, m.Contrattacco,
      m.MovimentoSismico, m.Mimica, m.Comete, m.Aeroattacco, m.Sostituto,
      m.Russare, m.Fangosberla, m.Ventogelato, m.Resistenza, m.Bullo,
      m.Sonnolalia
    ],
    evolution: {stage: "base", to: []}
  },
  "226": {
    name: "Mantine",
    dexNumber: 226,
    type: ["Acqua", "Volante"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Azione, m.Bolla],
      8: [m.Supersuono],
      15: [m.Bollaraggio],
      22: [m.Riduttore],
      29: [m.Agilita],
      36: [m.AttaccodAla],
      43: [m.Idropulsar],
      50: [m.Stordiraggio]
    },
    movesByMT: [
      m.Surf, m.Geloraggio, m.Bora, m.Terremoto, m.Tossina,
      m.Doppioteam, m.Cascata, m.Riposo, m.Protezione, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Grandine,
      m.Facciata, m.Forzasegreta, m.Sub, m.Aeroassalto, m.Idropulsar,
      m.Schianto, m.Idropompa, m.Nube, m.Frana, m.Tornado,
      m.Fangata, m.Corposcontro, m.Sdoppiatore, m.Mimica, m.Comete,
      m.Sostituto, m.Russare, m.Fangosberla, m.Ventogelato, m.Resistenza,
      m.Bullo, m.Sonnolalia
    ],
    evolution: {stage: "base", to: []}
  },
  "227": {
    name: "Skarmory",
    dexNumber: 227,
    type: ["Acciaio", "Volante"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Fulmisguardo, m.Beccata],
      10: [m.Turbosabbia],
      13: [m.Comete],
      16: [m.Agilita],
      26: [m.Furia],
      29: [m.Aerasoio],
      32: [m.Alacciaio],
      42: [m.Punte],
      45: [m.Ferrostrido]
    },
    movesByMT: [
      m.Taglio, m.Volo, m.Boato, m.Tossina, m.Doppioteam,
      m.Riposo, m.Furto, m.Protezione, m.Terrempesta, m.Alacciaio,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Introforza, m.Giornodisole,
      m.Spaccaroccia, m.Attaccalite, m.Facciata, m.Provocazione, m.Forzasegreta,
      m.Aeroassalto, m.Falcecannone, m.Turbine, m.Perforbecco, m.Aeroattacco,
      m.Maledizione, m.Inseguimento, m.Sdoppiatore, m.Contrattacco, m.Mimica,
      m.Comete, m.Frana, m.Sostituto, m.Russare, m.Fangosberla,
      m.Resistenza, m.Bullo, m.Sonnolalia
    ],
    evolution: {stage: "base", to: []}
  },
  "228": {
    name: "Houndour",
    dexNumber: 228,
    type: ["Buio", "Fuoco"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 34
    },
    exp: 50,
    movesByLevel: {
      5: [m.Fulmisguardo, m.Braciere],
      7: [m.Gridodilotta],
      13: [m.Smog],
      19: [m.Boato],
      25: [m.Morso],
      31: [m.Segugio],
      37: [m.Finta],
      43: [m.Lanciafiamme],
      49: [m.Sgranocchio]
    },
    movesByMT: [
      m.Boato, m.Lanciafiamme, m.Solarraggio, m.Tossina, m.Doppioteam,
      m.Fuocobomba, m.Riposo, m.Furto, m.Protezione, m.Fangobomba,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Codacciaio, m.Introforza,
      m.Giornodisole, m.PallaOmbra, m.Spaccaroccia, m.Attaccalite, m.Facciata,
      m.Provocazione, m.Scippo, m.Forzasegreta, m.Vampata, m.Contrattacco,
      m.Turbofuoco, m.Ira, m.Contropiede, m.Dispetto, m.Inseguimento,
      m.Picchiaduro, m.Fuocofatuo, m.Corposcontro, m.Sdoppiatore, m.Mimica,
      m.Comete, m.Mangiasogni, m.Sostituto, m.Incubo, m.Russare,
      m.Fangosberla, m.Resistenza, m.Bullo, m.Sonnolalia, m.Braciere,
      m.Finta, m.Fascino
    ],
    evolution: {stage: "base", to: [{species: "229", trigger: {kind: "level", level: 24}}]}
  },
  "229": {
    name: "Houndoom",
    dexNumber: 229,
    type: ["Buio", "Fuoco"],
    gender: ["Maschio", "Femmina"],
    spriteGendered: true,
    encounter: {
      rarity: "u",
      minLevel: 24,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Fulmisguardo, m.Braciere],
      7: [m.Gridodilotta],
      13: [m.Smog],
      19: [m.Boato],
      27: [m.Morso],
      35: [m.Segugio],
      43: [m.Finta],
      51: [m.Lanciafiamme],
      59: [m.Sgranocchio]
    },
    movesByMT: [
      m.Boato, m.Lanciafiamme, m.IperRaggio, m.Forza, m.Solarraggio,
      m.Tossina, m.Doppioteam, m.Fuocobomba, m.Riposo, m.Furto,
      m.Protezione, m.Fangobomba, m.Attrazione, m.Ritorno, m.Frustrazione,
      m.Codacciaio, m.Introforza, m.Giornodisole, m.PallaOmbra, m.Spaccaroccia,
      m.Attaccalite, m.Facciata, m.Provocazione, m.Scippo, m.Forzasegreta,
      m.Vampata, m.Contrattacco, m.Turbofuoco, m.Ira, m.Contropiede,
      m.Dispetto, m.Inseguimento, m.Picchiaduro, m.Fuocofatuo, m.Corposcontro,
      m.Sdoppiatore, m.Mimica, m.Comete, m.Mangiasogni, m.Sostituto,
      m.Incubo, m.Russare, m.Fangosberla, m.Resistenza, m.Bullo,
      m.Sonnolalia, m.Braciere, m.Finta, m.Fascino
    ],
    evolution: {stage: "stage1", to: []}
  },
  "230": {
    name: "Kingdra",
    dexNumber: 230,
    type: ["Acqua", "Drago"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 50,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.Bolla],
      8: [m.MurodiFumo],
      15: [m.Fulmisguardo],
      22: [m.Pistolacqua],
      29: [m.Tornado],
      40: [m.Agilita],
      51: [m.Idropompa],
      60: [m.Purogelo, m.Privazione],
      62: [m.Dragodanza]
    },
    movesByMT: [
      m.Surf, m.Geloraggio, m.Bora, m.IperRaggio, m.Tossina,
      m.Doppioteam, m.Cascata, m.Riposo, m.Protezione, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Grandine,
      m.Facciata, m.Forzasegreta, m.Sub, m.Idropulsar, m.Inibitore,
      m.Raggiaurora, m.IradiDrago, m.Splash, m.Flagello, m.Octazooka,
      m.Dragospiro, m.Corposcontro, m.Sdoppiatore, m.Mimica, m.Comete,
      m.Sostituto, m.Russare, m.Ventogelato, m.Resistenza, m.Bullo,
      m.Sonnolalia
    ],
    evolution: {stage: "stage2", to: []}
  },
  "231": {
    name: "Phanpy",
    dexNumber: 231,
    type: ["Terra"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 35
    },
    exp: 50,
    movesByLevel: {
      5: [m.Azione, m.Ruggito, m.Segugio],
      9: [m.Ricciolscudo],
      17: [m.Flagello],
      25: [m.Riduttore],
      33: [m.Rotolamento],
      41: [m.Resistenza],
      49: [m.Sdoppiatore]
    },
    movesByMT: [
      m.Boato, m.Forza, m.Terremoto, m.Tossina, m.Doppioteam,
      m.Riposo, m.Protezione, m.Terrempesta, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Codacciaio, m.Introforza, m.Giornodisole, m.Spaccaroccia,
      m.Facciata, m.Forzasegreta, m.Rocciotomba, m.Corposcontro, m.Contrattacco,
      m.Abisso, m.Focalenergia, m.Russare, m.Forzantica, m.Sdoppiatore,
      m.Mimica, m.Ricciolscudo, m.Sostituto, m.Fangosberla, m.Resistenza,
      m.Rotolamento, m.Bullo, m.Sonnolalia
    ],
    evolution: {stage: "base", to: [{species: "232", trigger: {kind: "level", level: 25}}]}
  },
  "232": {
    name: "Donphan",
    dexNumber: 232,
    type: ["Terra"],
    gender: ["Maschio", "Femmina"],
    spriteGendered: true,
    encounter: {
      rarity: "u",
      minLevel: 25,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Incornata, m.Ruggito, m.Segugio],
      9: [m.Ricciolscudo],
      17: [m.Flagello],
      25: [m.Furia],
      33: [m.Rotolamento],
      41: [m.Rapigiro],
      49: [m.Terremoto]
    },
    movesByMT: [
      m.Boato, m.IperRaggio, m.Forza, m.Terremoto, m.Tossina,
      m.Doppioteam, m.Riposo, m.Protezione, m.Terrempesta, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Codacciaio, m.Introforza, m.Giornodisole,
      m.Spaccaroccia, m.Facciata, m.Forzasegreta, m.Rocciotomba, m.Corposcontro,
      m.Contrattacco, m.Abisso, m.Focalenergia, m.Russare, m.Forzantica,
      m.Sdoppiatore, m.Mimica, m.Ricciolscudo, m.Frana, m.Sostituto,
      m.Fangosberla, m.Resistenza, m.Rotolamento, m.Bullo, m.Sonnolalia
    ],
    evolution: {stage: "stage1", to: []}
  },
  "233": {
    name: "Porygon2",
    dexNumber: 233,
    type: ["Normale"],
    gender: [],
    encounter: {
      rarity: "r",
      minLevel: 50,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Azione, m.Conversione, m.Conversione2],
      9: [m.Agilita],
      12: [m.Psicoraggio],
      20: [m.Ripresa],
      24: [m.Ricciolscudo],
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
      m.Tuononda, m.Mimica, m.Ricciolscudo, m.Comete, m.Mangiasogni,
      m.Sostituto, m.Incubo, m.Russare, m.Ventogelato, m.Resistenza,
      m.Bullo, m.Sonnolalia, m.Psicamisu
    ],
    evolution: {stage: "stage1", to: []}
  },
  "234": {
    name: "Stantler",
    dexNumber: 234,
    type: ["Normale"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Azione],
      7: [m.Fulmisguardo],
      11: [m.Sgomento],
      17: [m.Ipnosi],
      21: [m.Pestone],
      27: [m.Turbosabbia],
      31: [],
      37: [m.Riduttore],
      41: [m.Stordiraggio],
      47: [m.Calmamente]
    },
    movesByMT: [
      m.Boato, m.Solarraggio, m.Fulmine, m.Tuono, m.Terremoto,
      m.Tossina, m.Psichico, m.Doppioteam, m.Schermoluce, m.Riflesso,
      m.Flash, m.Riposo, m.Furto, m.Protezione, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Codacciaio, m.Introforza, m.Pioggiadanza,
      m.Giornodisole, m.PallaOmbra, m.Facciata, m.Forzasegreta, m.Calmamente,
      m.Ondashock, m.Morso, m.Inibitore, m.Dispetto, m.Bullo,
      m.Psicamisu, m.Extrasenso, m.Corposcontro, m.Sdoppiatore, m.Tuononda,
      m.Mimica, m.Comete, m.Mangiasogni, m.Sostituto, m.Incubo,
      m.Russare, m.Fangosberla, m.Resistenza, m.Sonnolalia
    ],
    evolution: {stage: "base", to: []}
  },
  "235": {
    name: "Smeargle",
    dexNumber: 235,
    type: ["Normale"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Schizzo],
      11: [m.Schizzo],
      21: [m.Schizzo],
      31: [m.Schizzo],
      41: [m.Schizzo],
      51: [m.Schizzo],
      61: [m.Schizzo],
      71: [m.Schizzo],
      81: [m.Schizzo],
      91: [m.Schizzo]
    },
    movesByMT: [],
    evolution: {stage: "base", to: []}
  },
  "236": {
    name: "Tyrogue",
    dexNumber: 236,
    type: ["Lotta"],
    gender: ["Maschio"],
    encounter: {
      rarity: "r",
      minLevel: 5,
      maxLevel: 25
    },
    exp: 50,
    movesByLevel: {
      5: [m.Azione]
    },
    movesByMT: [
      m.Forza, m.Terremoto, m.Tossina, m.Doppioteam, m.Riposo,
      m.Furto, m.Protezione, m.Attrazione, m.Ritorno, m.Frustrazione,
      m.Introforza, m.Pioggiadanza, m.Giornodisole, m.Spaccaroccia, m.Facciata,
      m.Breccia, m.Forzasegreta, m.Granfisico, m.Calcinvolo, m.Leggimente,
      m.Pugnorapido, m.Rapigiro, m.Altruismo, m.Megacalcio, m.Corposcontro,
      m.Sdoppiatore, m.Contrattacco, m.MovimentoSismico, m.Mimica, m.Comete,
      m.Frana, m.Sostituto, m.Russare, m.Fangosberla, m.Resistenza,
      m.Bullo, m.Sonnolalia
    ],
    evolution: {stage: "base", to: [{species: "106", trigger: {kind: "item", item: i.pp_max}} , {species: "107", trigger: {kind: "item", item: i.pp_su}} , {species: "237", trigger: {kind: "item", item: i.ps_su}}]}
  },
  "237": {
    name: "Hitmontop",
    dexNumber: 237,
    type: ["Lotta"],
    gender: ["Maschio"],
    encounter: {
      rarity: "r",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Calciorullo, m.Vendetta],
      7: [m.Focalenergia],
      13: [m.Inseguimento],
      19: [m.AttaccoRapido],
      20: [m.Triplocalcio],
      25: [m.Rapigiro],
      31: [m.Contrattacco],
      37: [m.Agilita],
      43: [m.Individua],
      49: [m.Rimonta]
    },
    movesByMT: [
      m.Forza, m.Terremoto, m.Fossa, m.Tossina, m.Doppioteam,
      m.Riposo, m.Furto, m.Protezione, m.Terrempesta, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Giornodisole,
      m.Spaccaroccia, m.Facciata, m.Breccia, m.Forzasegreta, m.Granfisico,
      m.Calcinvolo, m.Leggimente, m.Pugnorapido, m.Rapigiro, m.Altruismo,
      m.Megacalcio, m.Corposcontro, m.Sdoppiatore, m.Contrattacco, m.MovimentoSismico,
      m.Mimica, m.Comete, m.Frana, m.Sostituto, m.Russare,
      m.Fangosberla, m.Resistenza, m.Bullo, m.Sonnolalia
    ],
    evolution: {stage: "stage1", to: []}
  },
  "238": {
    name: "Smoochum",
    dexNumber: 238,
    type: ["Ghiaccio", "Psico"],
    gender: ["Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 5,
      maxLevel: 35
    },
    exp: 50,
    movesByLevel: {
      5: [m.Botta, m.Leccata],
      9: [m.Dolcebacio],
      13: [m.Polneve],
      21: [m.Confusione],
      25: [m.Canto],
      33: [m.Malosguardo],
      37: [m.Falselacrime],
      45: [m.Psichico],
      49: [m.Ultimocanto],
      57: [m.Bora]
    },
    movesByMT: [
      m.Geloraggio, m.Bora, m.Tossina, m.Psichico, m.Doppioteam,
      m.Schermoluce, m.Riflesso, m.Flash, m.Riposo, m.Furto,
      m.Protezione, m.Attrazione, m.Ritorno, m.Frustrazione, m.Introforza,
      m.Pioggiadanza, m.PallaOmbra, m.Grandine, m.Facciata, m.Forzasegreta,
      m.Calmamente, m.Idropulsar, m.Gelopugno, m.Meditazione, m.Psicamisu,
      m.Bruciapelo, m.Desiderio, m.Megapugno, m.Megacalcio, m.Corposcontro,
      m.Sdoppiatore, m.Contrattacco, m.MovimentoSismico, m.Mimica, m.Metronomo,
      m.Mangiasogni, m.Sostituto, m.Incubo, m.Russare, m.Fangosberla,
      m.Ventogelato, m.Resistenza, m.Bullo, m.Sonnolalia, m.Dinamipugno
    ],
    evolution: {stage: "base", to: [{species: "124", trigger: {kind: "level", level: 30}}]}
  },
  "239": {
    name: "Elekid",
    dexNumber: 239,
    type: ["Elettro"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 5,
      maxLevel: 35
    },
    exp: 50,
    movesByLevel: {
      5: [m.Fulmisguardo, m.AttaccoRapido],
      9: [m.Tuonopugno],
      17: [m.Schermoluce],
      25: [m.Comete],
      33: [m.Stridio],
      41: [m.Fulmine],
      49: [m.Tuono]
    },
    movesByMT: [
      m.Fulmine, m.Tuono, m.Tossina, m.Psichico, m.Doppioteam,
      m.Schermoluce, m.Flash, m.Riposo, m.Furto, m.Protezione,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Introforza, m.Pioggiadanza,
      m.Spaccaroccia, m.Facciata, m.Centripugno, m.Breccia, m.Forzasegreta,
      m.Ondashock, m.Colpokarate, m.Fuocopugno, m.Gelopugno, m.Calciorullo,
      m.Meditazione, m.Barriera, m.Incrocolpo, m.Megapugno, m.Tuonopugno,
      m.Megacalcio, m.Corposcontro, m.Sdoppiatore, m.Contrattacco, m.MovimentoSismico,
      m.Tuononda, m.Mimica, m.Comete, m.Sostituto, m.Russare,
      m.Fangosberla, m.Resistenza, m.Bullo, m.Sonnolalia, m.Dinamipugno
    ],
    evolution: {stage: "base", to: [{species: "125", trigger: {kind: "level", level: 30}}]}
  },
  "240": {
    name: "Magby",
    dexNumber: 240,
    type: ["Fuoco"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 5,
      maxLevel: 35
    },
    exp: 50,
    movesByLevel: {
      5: [m.Braciere],
      7: [m.Fulmisguardo],
      13: [m.Smog],
      19: [m.Fuocopugno],
      25: [m.MurodiFumo],
      31: [m.Giornodisole],
      37: [m.Lanciafiamme],
      43: [m.Stordiraggio],
      49: [m.Fuocobomba]
    },
    movesByMT: [
      m.Lanciafiamme, m.Tossina, m.Psichico, m.Doppioteam, m.Fuocobomba,
      m.Riposo, m.Furto, m.Protezione, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Codacciaio, m.Introforza, m.Giornodisole, m.Spaccaroccia,
      m.Facciata, m.Centripugno, m.Breccia, m.Forzasegreta, m.Colpokarate,
      m.Megapugno, m.Tuonopugno, m.Stridio, m.Barriera, m.Incrocolpo,
      m.Fuocopugno, m.Megacalcio, m.Corposcontro, m.Sdoppiatore, m.Contrattacco,
      m.MovimentoSismico, m.Mimica, m.Sostituto, m.Russare, m.Fangosberla,
      m.Resistenza, m.Bullo, m.Sonnolalia, m.Dinamipugno
    ],
    evolution: {stage: "base", to: [{species: "126", trigger: {kind: "level", level: 30}}]}
  },
  "241": {
    name: "Miltank",
    dexNumber: 241,
    type: ["Normale"],
    gender: ["Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Azione, m.Ruggito],
      8: [m.Ricciolscudo],
      13: [m.Pestone],
      19: [m.Buonlatte],
      26: [m.Pazienza],
      34: [m.Rotolamento],
      43: [m.Corposcontro],
      53: [m.Rintoccasana]
    },
    movesByMT: [
      m.Surf, m.Geloraggio, m.Bora, m.IperRaggio, m.Forza,
      m.Solarraggio, m.Fulmine, m.Tuono, m.Terremoto, m.Tossina,
      m.Doppioteam, m.Riposo, m.Protezione, m.Terrempesta, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Codacciaio, m.Introforza, m.Pioggiadanza,
      m.Giornodisole, m.PallaOmbra, m.Spaccaroccia, m.Facciata, m.Centripugno,
      m.Breccia, m.Forzasegreta, m.Rocciotomba, m.Ondashock, m.Idropulsar,
      m.MovimentoSismico, m.Maledizione, m.Contropiede, m.Resistenza, m.Sonnolalia,
      m.Regalino, m.Psicamisu, m.Altruismo, m.Megapugno, m.Fuocopugno,
      m.Gelopugno, m.Tuonopugno, m.Megacalcio, m.Corposcontro, m.Sdoppiatore,
      m.Contrattacco, m.Tuononda, m.Mimica, m.Ricciolscudo, m.Metronomo,
      m.Frana, m.Sostituto, m.Russare, m.Fangosberla, m.Ventogelato,
      m.Rotolamento, m.Bullo, m.Dinamipugno
    ],
    evolution: {stage: "base", to: []}
  },
  "242": {
    name: "Blissey",
    dexNumber: 242,
    type: ["Normale"],
    gender: ["Femmina"],
    encounter: {
      rarity: "s",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.Botta, m.Colpocoda, m.Ruggito],
      7: [m.Rinfrescata],
      10: [m.Covauova],
      13: [m.Doppiasberla],
      18: [m.Minimizzato],
      23: [m.Canto],
      28: [m.Uovobomba],
      33: [m.Ricciolscudo],
      40: [m.Schermoluce],
      47: [m.Sdoppiatore]
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
    evolution: {stage: "stage2", to: []}
  },
  "243": {
    name: "Raikou",
    dexNumber: 243,
    type: ["Elettro"],
    gender: [],
    encounter: {
      rarity: "l",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 300,
    movesByLevel: {
      5: [m.Fulmisguardo, m.Morso],
      11: [m.Tuonoshock],
      21: [m.Boato],
      31: [m.AttaccoRapido],
      41: [m.Scintilla],
      51: [m.Riflesso],
      61: [m.Sgranocchio],
      71: [m.Tuono],
      81: [m.Calmamente]
    },
    movesByMT: [
      m.Taglio, m.Boato, m.IperRaggio, m.Forza, m.Fulmine,
      m.Tuono, m.Fossa, m.Tossina, m.Doppioteam, m.Riflesso,
      m.Flash, m.Riposo, m.Protezione, m.Terrempesta, m.Ritorno,
      m.Frustrazione, m.Codacciaio, m.Introforza, m.Pioggiadanza, m.Giornodisole,
      m.Spaccaroccia, m.Facciata, m.Forzasegreta, m.Calmamente, m.Ondashock,
      m.Corposcontro, m.Sdoppiatore, m.Tuononda, m.Mimica, m.Comete,
      m.Sostituto, m.Russare, m.Fangosberla, m.Resistenza, m.Bullo,
      m.Sonnolalia, m.Psicamisu
    ],
    evolution: {stage: "base", to: []}
  },
  "244": {
    name: "Entei",
    dexNumber: 244,
    type: ["Fuoco"],
    gender: [],
    encounter: {
      rarity: "l",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 300,
    movesByLevel: {
      5: [m.Fulmisguardo, m.Morso],
      11: [m.Braciere],
      21: [m.Boato],
      31: [m.Turbofuoco],
      41: [m.Pestone],
      51: [m.Lanciafiamme],
      61: [m.Bullo],
      71: [m.Fuocobomba],
      81: [m.Calmamente]
    },
    movesByMT: [
      m.Taglio, m.Boato, m.Lanciafiamme, m.IperRaggio, m.Forza,
      m.Solarraggio, m.Fossa, m.Tossina, m.Doppioteam, m.Riflesso,
      m.Fuocobomba, m.Flash, m.Riposo, m.Protezione, m.Terrempesta,
      m.Ritorno, m.Frustrazione, m.Codacciaio, m.Introforza, m.Pioggiadanza,
      m.Giornodisole, m.Spaccaroccia, m.Facciata, m.Forzasegreta, m.Calmamente,
      m.Falcecannone, m.Corposcontro, m.Sdoppiatore, m.Mimica, m.Comete,
      m.Sostituto, m.Russare, m.Fangosberla, m.Resistenza, m.Bullo,
      m.Sonnolalia, m.Psicamisu
    ],
    evolution: {stage: "base", to: []}
  },
  "245": {
    name: "Suicune",
    dexNumber: 245,
    type: ["Acqua"],
    gender: [],
    encounter: {
      rarity: "l",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 300,
    movesByLevel: {
      5: [m.Fulmisguardo, m.Morso],
      11: [m.Bollaraggio],
      21: [m.Pioggiadanza],
      31: [m.Raffica],
      41: [m.Raggiaurora],
      51: [m.Nebbia],
      61: [m.Specchiovelo],
      71: [m.Idropompa],
      81: [m.Calmamente]
    },
    movesByMT: [
      m.Taglio, m.Boato, m.Surf, m.Geloraggio, m.Bora,
      m.IperRaggio, m.Fossa, m.Tossina, m.Doppioteam, m.Riflesso,
      m.Cascata, m.Riposo, m.Protezione, m.Terrempesta, m.Ritorno,
      m.Frustrazione, m.Codacciaio, m.Introforza, m.Pioggiadanza, m.Giornodisole,
      m.Spaccaroccia, m.Grandine, m.Facciata, m.Forzasegreta, m.Sub,
      m.Calmamente, m.Idropulsar, m.Falcecannone, m.Corposcontro, m.Sdoppiatore,
      m.Mimica, m.Comete, m.Sostituto, m.Russare, m.Fangosberla,
      m.Ventogelato, m.Resistenza, m.Bullo, m.Sonnolalia, m.Psicamisu
    ],
    evolution: {stage: "base", to: []}
  },
  "246": {
    name: "Larvitar",
    dexNumber: 246,
    type: ["Roccia", "Terra"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "s",
      minLevel: 5,
      maxLevel: 35
    },
    exp: 50,
    movesByLevel: {
      5: [m.Fulmisguardo, m.Morso],
      8: [m.Terrempesta],
      15: [m.Stridio],
      22: [m.Frana],
      29: [m.Colpo],
      36: [m.Visotruce],
      43: [m.Sgranocchio],
      50: [m.Terremoto],
      57: [m.IperRaggio]
    },
    movesByMT: [
      m.IperRaggio, m.Terremoto, m.Fossa, m.Tossina, m.Doppioteam,
      m.Riposo, m.Protezione, m.Terrempesta, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Giornodisole, m.Spaccaroccia,
      m.Attaccalite, m.Facciata, m.Provocazione, m.Breccia, m.Forzasegreta,
      m.Pestone, m.Focalenergia, m.Maledizione, m.Oltraggio, m.Inseguimento,
      m.Forzantica, m.Dragodanza, m.Corposcontro, m.Sdoppiatore, m.Mimica,
      m.Frana, m.Sostituto, m.Russare, m.Fangosberla, m.Resistenza,
      m.Bullo, m.Sonnolalia
    ],
    evolution: {stage: "base", to: [{species: "247", trigger: {kind: "level", level: 30}}]}
  },
  "247": {
    name: "Pupitar",
    dexNumber: 247,
    type: ["Roccia", "Terra"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "m",
      minLevel: 30,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Fulmisguardo, m.Morso],
      8: [m.Terrempesta],
      15: [m.Stridio],
      22: [m.Frana],
      29: [m.Colpo],
      38: [m.Visotruce],
      47: [m.Sgranocchio],
      56: [m.Terremoto],
      65: [m.IperRaggio]
    },
    movesByMT: [
      m.IperRaggio, m.Terremoto, m.Fossa, m.Tossina, m.Doppioteam,
      m.Riposo, m.Protezione, m.Terrempesta, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Giornodisole, m.Spaccaroccia,
      m.Attaccalite, m.Facciata, m.Provocazione, m.Breccia, m.Forzasegreta,
      m.Pestone, m.Focalenergia, m.Maledizione, m.Oltraggio, m.Inseguimento,
      m.Forzantica, m.Dragodanza, m.Corposcontro, m.Sdoppiatore, m.Mimica,
      m.Frana, m.Sostituto, m.Russare, m.Fangosberla, m.Resistenza,
      m.Bullo, m.Sonnolalia
    ],
    evolution: {stage: "stage1", to: [{species: "248", trigger: {kind: "level", level: 55}}]}
  },
  "248": {
    name: "Tyranitar",
    dexNumber: 248,
    type: ["Roccia", "Buio"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "m",
      minLevel: 55,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.Fulmisguardo, m.Morso],
      8: [m.Terrempesta],
      15: [m.Stridio],
      22: [m.Frana],
      29: [m.Colpo],
      38: [m.Visotruce],
      47: [m.Sgranocchio],
      61: [m.Terremoto],
      75: [m.IperRaggio]
    },
    movesByMT: [
      m.Taglio, m.Boato, m.Lanciafiamme, m.Surf, m.Geloraggio,
      m.Bora, m.IperRaggio, m.Forza, m.Fulmine, m.Tuono,
      m.Terremoto, m.Fossa, m.Tossina, m.Doppioteam, m.Fuocobomba,
      m.Riposo, m.Protezione, m.Terrempesta, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Codacciaio, m.Introforza, m.Pioggiadanza, m.Giornodisole,
      m.Spaccaroccia, m.Attaccalite, m.Facciata, m.Centripugno, m.Provocazione,
      m.Breccia, m.Forzasegreta, m.Rocciotomba, m.Aeroassalto, m.Dragartigli,
      m.Ondashock, m.Idropulsar, m.Pestone, m.Focalenergia, m.Maledizione,
      m.Oltraggio, m.Inseguimento, m.Forzantica, m.Dragodanza, m.Megapugno,
      m.Fuocopugno, m.Megacalcio, m.Corposcontro, m.Sdoppiatore, m.Contrattacco,
      m.MovimentoSismico, m.Tuononda, m.Mimica, m.Frana, m.Sostituto,
      m.Incubo, m.Russare, m.Fangosberla, m.Resistenza, m.Bullo,
      m.Tagliofuria, m.Sonnolalia, m.Dinamipugno
    ],
    evolution: {stage: "stage2", to: []}
  },
  "249": {
    name: "Lugia",
    dexNumber: 249,
    type: ["Psico", "Volante"],
    gender: [],
    encounter: {
      rarity: "l",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 300,
    movesByLevel: {
      5: [m.Raffica, m.Turbine],
      11: [m.Salvaguardia],
      33: [m.Ripresa],
      44: [m.Idropompa],
      55: [m.Pioggiadanza],
      66: [m.Comete],
      77: [m.Aerocolpo],
      88: [m.Forzantica],
      99: [m.Divinazione]
    },
    movesByMT: [
      m.Volo, m.Boato, m.Surf, m.Geloraggio, m.Bora,
      m.IperRaggio, m.Forza, m.Fulmine, m.Tuono, m.Terremoto,
      m.Tossina, m.Psichico, m.Doppioteam, m.Schermoluce, m.Riflesso,
      m.Cascata, m.Riposo, m.Protezione, m.Terrempesta, m.Gigassorbimento,
      m.Alacciaio, m.Ritorno, m.Frustrazione, m.Salvaguardia, m.Codacciaio,
      m.Introforza, m.Pioggiadanza, m.Giornodisole, m.PallaOmbra, m.Spaccaroccia,
      m.Grandine, m.Facciata, m.Forzasegreta, m.Sub, m.Aeroassalto,
      m.Calmamente, m.Ondashock, m.Idropulsar, m.Corposcontro, m.Sdoppiatore,
      m.Tuononda, m.Mimica, m.Comete, m.Mangiasogni, m.Sostituto,
      m.Incubo, m.Russare, m.Fangosberla, m.Ventogelato, m.Resistenza,
      m.Bullo, m.Sonnolalia, m.Psicamisu, m.Idropompa, m.Danzadipiume,
      m.Psicoslancio
    ],
    evolution: {stage: "base", to: []}
  },
  "250": {
    name: "Ho-Oh",
    dexNumber: 250,
    type: ["Fuoco", "Volante"],
    gender: [],
    encounter: {
      rarity: "l",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 300,
    movesByLevel: {
      5: [m.Raffica, m.Turbine],
      11: [m.Salvaguardia],
      33: [m.Ripresa],
      44: [m.Fuocobomba],
      55: [m.Giornodisole],
      66: [m.Comete],
      77: [m.Magifuoco],
      88: [m.Forzantica],
      99: [m.Divinazione]
    },
    movesByMT: [
      m.Volo, m.Boato, m.Lanciafiamme, m.IperRaggio, m.Forza,
      m.Solarraggio, m.Fulmine, m.Tuono, m.Terremoto, m.Tossina,
      m.Psichico, m.Doppioteam, m.Schermoluce, m.Riflesso, m.Fuocobomba,
      m.Flash, m.Riposo, m.Protezione, m.Terrempesta, m.Gigassorbimento,
      m.Alacciaio, m.Ritorno, m.Frustrazione, m.Salvaguardia, m.Introforza,
      m.Pioggiadanza, m.Giornodisole, m.PallaOmbra, m.Spaccaroccia, m.Facciata,
      m.Forzasegreta, m.Vampata, m.Aeroassalto, m.Calmamente, m.Ondashock,
      m.Sdoppiatore, m.Tuononda, m.Mimica, m.Comete, m.Mangiasogni,
      m.Aeroattacco, m.Sostituto, m.Incubo, m.Russare, m.Fangosberla,
      m.Resistenza, m.Bullo, m.Sonnolalia, m.Psicamisu
    ],
    evolution: {stage: "base", to: []}
  },
  "251": {
    name: "Celebi",
    dexNumber: 251,
    type: ["Psico", "Erba"],
    gender: [],
    encounter: {
      rarity: "l",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 300,
    movesByLevel: {
      5: [m.Parassiseme, m.Confusione, m.Ripresa, m.Rintoccasana],
      10: [m.Salvaguardia],
      20: [m.Forzantica],
      30: [m.Divinazione],
      40: [m.Staffetta],
      50: [m.Ultimocanto]
    },
    movesByMT: [
      m.Taglio, m.IperRaggio, m.Solarraggio, m.Tossina, m.Psichico,
      m.Doppioteam, m.Schermoluce, m.Riflesso, m.Flash, m.Riposo,
      m.Protezione, m.Terrempesta, m.Gigassorbimento, m.Ritorno, m.Frustrazione,
      m.Salvaguardia, m.Introforza, m.Pioggiadanza, m.Giornodisole, m.PallaOmbra,
      m.Facciata, m.Forzasegreta, m.Aeroassalto, m.Calmamente, m.Ondashock,
      m.Idropulsar, m.Falcecannone, m.Danzaspada, m.Sdoppiatore, m.Mimica,
      m.Ricciolscudo, m.Metronomo, m.Comete, m.Mangiasogni, m.Sostituto,
      m.Incubo, m.Russare, m.Fangosberla, m.Resistenza, m.Bullo,
      m.Sonnolalia, m.Psicamisu
    ],
    evolution: {stage: "base", to: []}
  }
};