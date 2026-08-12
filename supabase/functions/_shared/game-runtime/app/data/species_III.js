import * as m from "./moves.js";
import * as i from "./items.js";

export var SPECIES_LIBRARY = {
  "252": {
    name: "Treecko",
    dexNumber: 252,
    type: ["Erba"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 21
    },
    exp: 50,
    movesByLevel: {
      5: [m.Botta, m.Fulmisguardo],
      6: [m.Assorbimento],
      11: [m.AttaccoRapido],
      16: [m.Inseguimento],
      21: [m.Stridio],
      26: [m.Megassorbimento],
      31: [m.Agilita],
      36: [m.Schianto],
      41: [m.Individua],
      46: [m.Gigassorbimento]
    },
    movesByMT: [
      m.Taglio, m.Forza, m.Solarraggio, m.Fossa, m.Tossina,
      m.Doppioteam, m.Flash, m.Riposo, m.Protezione, m.Gigassorbimento,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Salvaguardia, m.Codacciaio,
      m.Introforza, m.Giornodisole, m.Spaccaroccia, m.Facciata, m.Centripugno,
      m.Breccia, m.Forzasegreta, m.Rocciotomba, m.Semitraglia, m.Aeroassalto,
      m.Parassiseme, m.Dragospiro, m.Sgranocchio, m.Rimonta, m.Fangata,
      m.Tritartigli, m.Megapugno, m.Tuonopugno, m.Danzaspada, m.Megacalcio,
      m.Corposcontro, m.Sdoppiatore, m.Contrattacco, m.MovimentoSismico, m.Mimica,
      m.Comete, m.Sostituto, m.Russare, m.Fangosberla, m.Resistenza,
      m.Bullo, m.Tagliofuria, m.Sonnolalia, m.Dinamipugno
    ],
    evolution: { stage: "base", to: [{ species: "253", trigger: { kind: "level", level: 16 } }] }
  },
  "253": {
    name: "Grovyle",
    dexNumber: 253,
    type: ["Erba"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 16,
      maxLevel: 46
    },
    exp: 100,
    movesByLevel: {
      5: [m.Botta, m.Fulmisguardo],
      6: [m.Assorbimento],
      11: [m.AttaccoRapido],
      16: [m.Tagliofuria],
      17: [m.Inseguimento],
      23: [m.Stridio],
      29: [m.Fendifoglia],
      35: [m.Agilita],
      41: [m.Schianto],
      47: [m.Individua],
      53: [m.Falsofinale]
    },
    movesByMT: [
      m.Taglio, m.Forza, m.Solarraggio, m.Fossa, m.Tossina,
      m.Doppioteam, m.Flash, m.Riposo, m.Protezione, m.Gigassorbimento,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Salvaguardia, m.Codacciaio,
      m.Introforza, m.Giornodisole, m.Spaccaroccia, m.Facciata, m.Centripugno,
      m.Breccia, m.Forzasegreta, m.Rocciotomba, m.Semitraglia, m.Aeroassalto,
      m.Parassiseme, m.Dragospiro, m.Sgranocchio, m.Rimonta, m.Fangata,
      m.Tritartigli, m.Megapugno, m.Tuonopugno, m.Danzaspada, m.Megacalcio,
      m.Corposcontro, m.Sdoppiatore, m.Contrattacco, m.MovimentoSismico, m.Mimica,
      m.Comete, m.Sostituto, m.Russare, m.Fangosberla, m.Resistenza,
      m.Bullo, m.Tagliofuria, m.Sonnolalia, m.Dinamipugno
    ],
    evolution: { stage: "stage1", to: [{ species: "254", trigger: { kind: "level", level: 36 } }] }
  },
  "254": {
    name: "Sceptile",
    dexNumber: 254,
    type: ["Erba"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 36,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.Botta, m.Fulmisguardo],
      6: [m.Assorbimento],
      11: [m.AttaccoRapido],
      16: [m.Tagliofuria],
      17: [m.Inseguimento],
      23: [m.Stridio],
      29: [m.Fendifoglia],
      35: [m.Agilita],
      43: [m.Schianto],
      51: [m.Individua],
      59: [m.Falsofinale]
    },
    movesByMT: [
      m.Taglio, m.Boato, m.IperRaggio, m.Forza, m.Solarraggio,
      m.Terremoto, m.Fossa, m.Tossina, m.Doppioteam, m.Flash,
      m.Riposo, m.Protezione, m.Gigassorbimento, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Salvaguardia, m.Codacciaio, m.Introforza, m.Giornodisole,
      m.Spaccaroccia, m.Facciata, m.Centripugno, m.Breccia, m.Forzasegreta,
      m.Rocciotomba, m.Semitraglia, m.Aeroassalto, m.Dragartigli, m.Parassiseme,
      m.Dragospiro, m.Sgranocchio, m.Rimonta, m.Fangata, m.Tritartigli,
      m.Megapugno, m.Tuonopugno, m.Danzaspada, m.Megacalcio, m.Corposcontro,
      m.Sdoppiatore, m.Contrattacco, m.MovimentoSismico, m.Mimica, m.Comete,
      m.Sostituto, m.Russare, m.Fangosberla, m.Resistenza, m.Bullo,
      m.Tagliofuria, m.Sonnolalia, m.Dinamipugno
    ],
    evolution: { stage: "stage2", to: [] }
  },
  "255": {
    name: "Torchic",
    dexNumber: 255,
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
      7: [m.Focalenergia],
      10: [m.Braciere],
      16: [m.Beccata],
      19: [m.Turbosabbia],
      25: [m.Turbofuoco],
      28: [m.AttaccoRapido],
      34: [m.Lacerazione],
      37: [m.Speculmossa],
      43: [m.Lanciafiamme]
    },
    movesByMT: [
      m.Taglio, m.Lanciafiamme, m.Forza, m.Fossa, m.Tossina,
      m.Doppioteam, m.Fuocobomba, m.Riposo, m.Protezione, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Introforza, m.Giornodisole, m.Spaccaroccia,
      m.Facciata, m.Forzasegreta, m.Vampata, m.Rocciotomba, m.Aeroassalto,
      m.Contrattacco, m.Frana, m.Contropiede, m.Resistenza, m.Bullo,
      m.Maniereforti, m.Megapugno, m.Danzaspada, m.Megacalcio, m.Corposcontro,
      m.Sdoppiatore, m.MovimentoSismico, m.Mimica, m.Comete, m.Sostituto,
      m.Russare, m.Fangosberla, m.Sonnolalia
    ],
    evolution: { stage: "base", to: [{ species: "256", trigger: { kind: "level", level: 16 } }] }
  },
  "256": {
    name: "Combusken",
    dexNumber: 256,
    type: ["Fuoco", "Lotta"],
    gender: ["Maschio", "Femmina"],
    spriteGendered: true,
    encounter: {
      rarity: "u",
      minLevel: 16,
      maxLevel: 46
    },
    exp: 100,
    movesByLevel: {
      5: [m.Graffio, m.Ruggito],
      7: [m.Focalenergia],
      13: [m.Braciere],
      16: [m.Doppiocalcio],
      17: [m.Beccata],
      21: [m.Turbosabbia],
      28: [m.Granfisico],
      32: [m.AttaccoRapido],
      39: [m.Lacerazione],
      43: [m.Speculmossa],
      50: [m.Stramontante]
    },
    movesByMT: [
      m.Taglio, m.Lanciafiamme, m.Forza, m.Fossa, m.Tossina,
      m.Doppioteam, m.Fuocobomba, m.Riposo, m.Protezione, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Introforza, m.Giornodisole, m.Spaccaroccia,
      m.Facciata, m.Centripugno, m.Breccia, m.Forzasegreta, m.Vampata,
      m.Rocciotomba, m.Aeroassalto, m.Granfisico, m.Contrattacco, m.Frana,
      m.Contropiede, m.Resistenza, m.Bullo, m.Maniereforti, m.Megapugno,
      m.Fuocopugno, m.Tuonopugno, m.Danzaspada, m.Megacalcio, m.Corposcontro,
      m.Sdoppiatore, m.MovimentoSismico, m.Mimica, m.Comete, m.Sostituto,
      m.Russare, m.Fangosberla, m.Tagliofuria, m.Sonnolalia, m.Dinamipugno
    ],
    evolution: { stage: "stage1", to: [{ species: "257", trigger: { kind: "level", level: 36 } }] }
  },
  "257": {
    name: "Blaziken",
    dexNumber: 257,
    type: ["Fuoco", "Lotta"],
    gender: ["Maschio", "Femmina"],
    spriteGendered: true,
    encounter: {
      rarity: "r",
      minLevel: 36,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.Fuocopugno, m.Graffio, m.Ruggito],
      7: [m.Focalenergia],
      13: [m.Braciere],
      16: [m.Doppiocalcio],
      17: [m.Beccata],
      21: [m.Turbosabbia],
      28: [m.Granfisico],
      32: [m.AttaccoRapido],
      36: [m.Calciardente],
      42: [m.Lacerazione],
      49: [m.Speculmossa],
      59: [m.Stramontante]
    },
    movesByMT: [
      m.Taglio, m.Boato, m.Lanciafiamme, m.IperRaggio, m.Forza,
      m.Terremoto, m.Fossa, m.Tossina, m.Doppioteam, m.Fuocobomba,
      m.Riposo, m.Protezione, m.Attrazione, m.Ritorno, m.Frustrazione,
      m.Introforza, m.Giornodisole, m.Spaccaroccia, m.Facciata, m.Centripugno,
      m.Breccia, m.Forzasegreta, m.Vampata, m.Rocciotomba, m.Aeroassalto,
      m.Granfisico, m.Contrattacco, m.Frana, m.Contropiede, m.Resistenza,
      m.Bullo, m.Maniereforti, m.Megapugno, m.Fuocopugno, m.Tuonopugno,
      m.Danzaspada, m.Megacalcio, m.Corposcontro, m.Sdoppiatore, m.MovimentoSismico,
      m.Mimica, m.Comete, m.Sostituto, m.Russare, m.Fangosberla,
      m.Tagliofuria, m.Sonnolalia, m.Dinamipugno
    ],
    evolution: { stage: "stage2", to: [] }
  },
  "258": {
    name: "Mudkip",
    dexNumber: 258,
    type: ["Acqua"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 21
    },
    exp: 50,
    movesByLevel: {
      5: [m.Azione, m.Ruggito],
      6: [m.Fangosberla],
      10: [m.Pistolacqua],
      15: [m.Pazienza],
      19: [m.Preveggenza],
      24: [m.Fangata],
      28: [m.Riduttore],
      33: [m.Mulinello],
      37: [m.Protezione],
      42: [m.Idropompa],
      46: [m.Rimonta]
    },
    movesByMT: [
      m.Surf, m.Geloraggio, m.Bora, m.Forza, m.Fossa,
      m.Tossina, m.Doppioteam, m.Cascata, m.Riposo, m.Protezione,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Codacciaio, m.Introforza,
      m.Pioggiadanza, m.Spaccaroccia, m.Grandine, m.Facciata, m.Forzasegreta,
      m.Sub, m.Rocciotomba, m.Idropulsar, m.Pestone, m.Maledizione,
      m.Specchiovelo, m.Baraonda, m.Rinfrescata, m.PallaGelo, m.Corposcontro,
      m.Sdoppiatore, m.Mimica, m.Ricciolscudo, m.Sostituto, m.Russare,
      m.Fangosberla, m.Ventogelato, m.Resistenza, m.Rotolamento, m.Bullo,
      m.Sonnolalia
    ],
    evolution: { stage: "base", to: [{ species: "259", trigger: { kind: "level", level: 16 } }] }
  },
  "259": {
    name: "Marshtomp",
    dexNumber: 259,
    type: ["Acqua", "Terra"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 16,
      maxLevel: 46
    },
    exp: 100,
    movesByLevel: {
      5: [m.Azione, m.Ruggito],
      6: [m.Fangosberla],
      10: [m.Pistolacqua],
      15: [m.Pazienza],
      16: [m.Colpodifango],
      20: [m.Preveggenza],
      25: [m.Fangata],
      31: [m.Riduttore],
      37: [m.Fanghiglia],
      42: [m.Protezione],
      46: [m.Terremoto],
      53: [m.Rimonta]
    },
    movesByMT: [
      m.Surf, m.Geloraggio, m.Bora, m.Forza, m.Terremoto,
      m.Fossa, m.Tossina, m.Doppioteam, m.Cascata, m.Riposo,
      m.Protezione, m.Attrazione, m.Ritorno, m.Frustrazione, m.Codacciaio,
      m.Introforza, m.Pioggiadanza, m.Spaccaroccia, m.Grandine, m.Facciata,
      m.Forzasegreta, m.Sub, m.Rocciotomba, m.Idropulsar, m.Pestone,
      m.Maledizione, m.Specchiovelo, m.Baraonda, m.Rinfrescata, m.PallaGelo,
      m.Megapugno, m.Gelopugno, m.Megacalcio, m.Corposcontro, m.Sdoppiatore,
      m.Contrattacco, m.MovimentoSismico, m.Mimica, m.Ricciolscudo, m.Frana,
      m.Sostituto, m.Russare, m.Fangosberla, m.Ventogelato, m.Resistenza,
      m.Rotolamento, m.Bullo, m.Sonnolalia, m.Dinamipugno
    ],
    evolution: { stage: "stage1", to: [{ species: "260", trigger: { kind: "level", level: 36 } }] }
  },
  "260": {
    name: "Swampert",
    dexNumber: 260,
    type: ["Acqua", "Terra"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 36,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.Azione, m.Ruggito],
      6: [m.Fangosberla],
      10: [m.Pistolacqua],
      15: [m.Pazienza],
      16: [m.Colpodifango],
      20: [m.Preveggenza],
      25: [m.Fangata],
      31: [m.Riduttore],
      39: [m.Fanghiglia],
      46: [m.Protezione],
      52: [m.Terremoto],
      61: [m.Rimonta]
    },
    movesByMT: [
      m.Boato, m.Surf, m.Geloraggio, m.Bora, m.IperRaggio,
      m.Forza, m.Terremoto, m.Fossa, m.Tossina, m.Doppioteam,
      m.Cascata, m.Riposo, m.Protezione, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Codacciaio, m.Introforza, m.Pioggiadanza, m.Spaccaroccia,
      m.Grandine, m.Facciata, m.Centripugno, m.Breccia, m.Forzasegreta,
      m.Sub, m.Rocciotomba, m.Idropulsar, m.Pestone, m.Maledizione,
      m.Specchiovelo, m.Baraonda, m.Rinfrescata, m.PallaGelo, m.Megapugno,
      m.Gelopugno, m.Megacalcio, m.Corposcontro, m.Sdoppiatore, m.Contrattacco,
      m.MovimentoSismico, m.Mimica, m.Ricciolscudo, m.Frana, m.Sostituto,
      m.Russare, m.Fangosberla, m.Ventogelato, m.Resistenza, m.Rotolamento,
      m.Bullo, m.Sonnolalia, m.Dinamipugno
    ],
    evolution: { stage: "stage2", to: [] }
  },
  "261": {
    name: "Poochyena",
    dexNumber: 261,
    type: ["Buio"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 28
    },
    exp: 50,
    movesByLevel: {
      5: [m.Azione, m.Gridodilotta],
      9: [m.Turbosabbia],
      13: [m.Morso],
      17: [m.Segugio],
      21: [m.Boato],
      25: [m.Bullo],
      29: [m.Visotruce],
      33: [m.Riduttore],
      37: [m.Provocazione],
      41: [m.Sgranocchio],
      45: [m.Furto]
    },
    movesByMT: [
      m.Boato, m.Fossa, m.Tossina, m.Doppioteam, m.Riposo,
      m.Furto, m.Protezione, m.Attrazione, m.Ritorno, m.Frustrazione,
      m.Codacciaio, m.Introforza, m.Pioggiadanza, m.Giornodisole, m.PallaOmbra,
      m.Spaccaroccia, m.Attaccalite, m.Facciata, m.Provocazione, m.Scippo,
      m.Forzasegreta, m.Fulmisguardo, m.Sbadiglio, m.Velenodenti, m.Sgomento,
      m.Supplica, m.Corposcontro, m.Sdoppiatore, m.Contrattacco, m.Mimica,
      m.Sostituto, m.Russare, m.Fangosberla, m.Resistenza, m.Bullo,
      m.Sonnolalia, m.Psicamisu, m.Rintoccasana, m.Gridodilotta
    ],
    evolution: { stage: "base", to: [{ species: "262", trigger: { kind: "level", level: 18 } }] }
  },
  "262": {
    name: "Mightyena",
    dexNumber: 262,
    type: ["Buio"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 18,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Azione, m.Gridodilotta],
      9: [m.Turbosabbia],
      13: [m.Morso],
      17: [m.Segugio],
      22: [m.Boato],
      27: [m.Bullo],
      32: [m.Visotruce],
      37: [m.Riduttore],
      42: [m.Provocazione],
      47: [m.Sgranocchio],
      52: [m.Furto]
    },
    movesByMT: [
      m.Boato, m.IperRaggio, m.Forza, m.Fossa, m.Tossina,
      m.Doppioteam, m.Riposo, m.Furto, m.Protezione, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Codacciaio, m.Introforza, m.Pioggiadanza,
      m.Giornodisole, m.PallaOmbra, m.Spaccaroccia, m.Attaccalite, m.Facciata,
      m.Provocazione, m.Scippo, m.Forzasegreta, m.Fulmisguardo, m.Sbadiglio,
      m.Velenodenti, m.Sgomento, m.Supplica, m.Corposcontro, m.Sdoppiatore,
      m.Contrattacco, m.Mimica, m.Sostituto, m.Russare, m.Fangosberla,
      m.Resistenza, m.Bullo, m.Sonnolalia, m.Psicamisu, m.Rintoccasana,
      m.Gridodilotta
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "263": {
    name: "Zigzagoon",
    dexNumber: 263,
    type: ["Normale"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 30
    },
    exp: 50,
    movesByLevel: {
      5: [m.Azione, m.Ruggito, m.Colpocoda],
      9: [m.Bottintesta],
      13: [m.Turbosabbia],
      17: [m.Segugio],
      21: [m.Fangata],
      25: [m.Missilspillo],
      29: [m.Supplica],
      33: [m.Flagello],
      37: [m.Riposo],
      41: [m.Panciamburo]
    },
    movesByMT: [
      m.Taglio, m.Surf, m.Geloraggio, m.Bora, m.Fulmine,
      m.Tuono, m.Fossa, m.Tossina, m.Doppioteam, m.Riposo,
      m.Furto, m.Protezione, m.Attrazione, m.Ritorno, m.Frustrazione,
      m.Codacciaio, m.Introforza, m.Pioggiadanza, m.Giornodisole, m.PallaOmbra,
      m.Spaccaroccia, m.Facciata, m.Forzasegreta, m.Ondashock, m.Idropulsar,
      m.Sostituto, m.Fascino, m.Inseguimento, m.Raggiro, m.Solletico,
      m.Corposcontro, m.Sdoppiatore, m.Tuononda, m.Mimica, m.Ricciolscudo,
      m.Comete, m.Russare, m.Fangosberla, m.Ventogelato, m.Resistenza,
      m.Rotolamento, m.Bullo, m.Tagliofuria, m.Sonnolalia, m.Extrarapido
    ],
    evolution: { stage: "base", to: [{ species: "264", trigger: { kind: "level", level: 20 } }] }
  },
  "264": {
    name: "Linoone",
    dexNumber: 264,
    type: ["Normale"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 20,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Azione, m.Colpocoda, m.Ruggito],
      9: [m.Bottintesta],
      13: [m.Turbosabbia],
      17: [m.Segugio],
      23: [m.Fangata],
      29: [m.Sfuriate],
      35: [m.Supplica],
      41: [m.Lacerazione],
      47: [m.Riposo],
      53: [m.Panciamburo]
    },
    movesByMT: [
      m.Taglio, m.Boato, m.Surf, m.Geloraggio, m.Bora,
      m.IperRaggio, m.Forza, m.Fulmine, m.Tuono, m.Fossa,
      m.Tossina, m.Doppioteam, m.Riposo, m.Furto, m.Protezione,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Codacciaio, m.Introforza,
      m.Pioggiadanza, m.Giornodisole, m.PallaOmbra, m.Spaccaroccia, m.Facciata,
      m.Forzasegreta, m.Ondashock, m.Idropulsar, m.Sostituto, m.Fascino,
      m.Inseguimento, m.Raggiro, m.Solletico, m.Corposcontro, m.Sdoppiatore,
      m.Tuononda, m.Mimica, m.Ricciolscudo, m.Comete, m.Russare,
      m.Fangosberla, m.Ventogelato, m.Resistenza, m.Rotolamento, m.Bullo,
      m.Tagliofuria, m.Sonnolalia, m.Extrarapido
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "265": {
    name: "Wurmple",
    dexNumber: 265,
    type: ["Coleottero"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 12
    },
    exp: 50,
    movesByLevel: {
      5: [m.Azione, m.Millebave, m.Velenospina]
    },
    movesByMT: [],
    evolution: { stage: "base", to: [{ species: "266", trigger: { kind: "level", level: 7 } }, { species: "268", trigger: { kind: "level", level: 7 } }] }
  },
  "266": {
    name: "Silcoon",
    dexNumber: 266,
    type: ["Coleottero"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 7,
      maxLevel: 20
    },
    exp: 100,
    movesByLevel: {
      5: [m.Azione],
      7: [m.Rafforzatore]
    },
    movesByMT: [],
    evolution: { stage: "stage1", to: [{ species: "267", trigger: { kind: "level", level: 10 } }] }
  },
  "267": {
    name: "Beautifly",
    dexNumber: 267,
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
      5: [m.Assorbimento],
      13: [m.Raffica],
      17: [m.Paralizzante],
      20: [m.Mattindoro],
      24: [m.Megassorbimento],
      27: [m.Turbine],
      31: [m.Attrazione],
      34: [m.Ventargenteo],
      38: [m.Gigassorbimento]
    },
    movesByMT: [
      m.IperRaggio, m.Solarraggio, m.Tossina, m.Psichico, m.Doppioteam,
      m.Flash, m.Riposo, m.Furto, m.Protezione, m.Gigassorbimento,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Salvaguardia, m.Introforza,
      m.Giornodisole, m.PallaOmbra, m.Facciata, m.Forzasegreta, m.Aeroassalto,
      m.Sdoppiatore, m.Mimica, m.Comete, m.Sostituto, m.Russare,
      m.Resistenza, m.Bullo, m.Sonnolalia
    ],
    evolution: { stage: "stage2", to: [] }
  },
  "268": {
    name: "Cascoon",
    dexNumber: 268,
    type: ["Coleottero"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 7,
      maxLevel: 20
    },
    exp: 100,
    movesByLevel: {
      5: [m.Azione],
      7: [m.Rafforzatore]
    },
    movesByMT: [],
    evolution: { stage: "stage1", to: [{ species: "269", trigger: { kind: "level", level: 10 } }] }
  },
  "269": {
    name: "Dustox",
    dexNumber: 269,
    type: ["Coleottero", "Veleno"],
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
      13: [m.Raffica],
      17: [m.Protezione],
      20: [m.Lucelunare],
      24: [m.Psicoraggio],
      27: [m.Turbine],
      31: [m.Schermoluce],
      34: [m.Ventargenteo],
      38: [m.Tossina]
    },
    movesByMT: [
      m.IperRaggio, m.Solarraggio, m.Tossina, m.Psichico, m.Doppioteam,
      m.Schermoluce, m.Flash, m.Riposo, m.Furto, m.Protezione,
      m.Fangobomba, m.Gigassorbimento, m.Attrazione, m.Ritorno, m.Frustrazione,
      m.Introforza, m.Giornodisole, m.PallaOmbra, m.Facciata, m.Forzasegreta,
      m.Aeroassalto, m.Sdoppiatore, m.Mimica, m.Comete, m.Sostituto,
      m.Russare, m.Resistenza, m.Bullo, m.Sonnolalia
    ],
    evolution: { stage: "stage2", to: [] }
  },
  "270": {
    name: "Lotad",
    dexNumber: 270,
    type: ["Acqua", "Erba"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 19
    },
    exp: 50,
    movesByLevel: {
      5: [m.Ruggito, m.Sgomento],
      7: [m.Assorbimento],
      13: [m.Naturforza],
      21: [m.Nebbia],
      31: [m.Pioggiadanza],
      43: [m.Megassorbimento]
    },
    movesByMT: [
      m.Surf, m.Geloraggio, m.Bora, m.Solarraggio, m.Tossina,
      m.Doppioteam, m.Flash, m.Riposo, m.Furto, m.Protezione,
      m.Gigassorbimento, m.Attrazione, m.Ritorno, m.Frustrazione, m.Introforza,
      m.Pioggiadanza, m.Giornodisole, m.Grandine, m.Facciata, m.Forzasegreta,
      m.Semitraglia, m.Idropulsar, m.Pistolacqua, m.Parassiseme, m.Foglielama,
      m.Flagello, m.Profumino, m.Sintesi, m.Danzaspada, m.Corposcontro,
      m.Sdoppiatore, m.Mimica, m.Sostituto, m.Russare, m.Ventogelato,
      m.Resistenza, m.Bullo, m.Sonnolalia
    ],
    evolution: { stage: "base", to: [{ species: "271", trigger: { kind: "level", level: 14 } }] }
  },
  "271": {
    name: "Lombre",
    dexNumber: 271,
    type: ["Acqua", "Erba"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 14,
      maxLevel: 50
    },
    exp: 100,
    movesByLevel: {
      5: [m.Ruggito, m.Sgomento],
      7: [m.Assorbimento],
      13: [m.Naturforza],
      19: [m.Bruciapelo],
      25: [m.Sfuriate],
      31: [m.Docciascudo],
      37: [m.Furto],
      43: [m.Baraonda],
      49: [m.Idropompa]
    },
    movesByMT: [
      m.Surf, m.Geloraggio, m.Bora, m.Forza, m.Solarraggio,
      m.Tossina, m.Doppioteam, m.Cascata, m.Flash, m.Riposo,
      m.Furto, m.Protezione, m.Gigassorbimento, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Giornodisole, m.Spaccaroccia,
      m.Grandine, m.Facciata, m.Breccia, m.Forzasegreta, m.Sub,
      m.Semitraglia, m.Idropulsar, m.Pistolacqua, m.Parassiseme, m.Foglielama,
      m.Flagello, m.Profumino, m.Sintesi, m.Fuocopugno, m.Gelopugno,
      m.Tuonopugno, m.Danzaspada, m.Corposcontro, m.Sdoppiatore, m.Mimica,
      m.Sostituto, m.Russare, m.Fangosberla, m.Ventogelato, m.Resistenza,
      m.Bullo, m.Sonnolalia, m.Dinamipugno
    ],
    evolution: { stage: "stage1", to: [{ species: "272", trigger: { kind: "item", item: i.pietraidrica } }] }
  },
  "272": {
    name: "Ludicolo",
    dexNumber: 272,
    type: ["Acqua", "Erba"],
    gender: ["Maschio", "Femmina"],
    spriteGendered: true,
    encounter: {
      rarity: "r",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.Ruggito, m.Assorbimento, m.Naturforza, m.Sgomento]
    },
    movesByMT: [
      m.Surf, m.Geloraggio, m.Bora, m.IperRaggio, m.Forza,
      m.Solarraggio, m.Tossina, m.Doppioteam, m.Cascata, m.Flash,
      m.Riposo, m.Furto, m.Protezione, m.Gigassorbimento, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Giornodisole,
      m.Spaccaroccia, m.Grandine, m.Facciata, m.Centripugno, m.Breccia,
      m.Forzasegreta, m.Sub, m.Semitraglia, m.Idropulsar, m.Pistolacqua,
      m.Parassiseme, m.Foglielama, m.Flagello, m.Profumino, m.Sintesi,
      m.Megapugno, m.Fuocopugno, m.Gelopugno, m.Tuonopugno, m.Danzaspada,
      m.Megacalcio, m.Corposcontro, m.Sdoppiatore, m.Contrattacco, m.MovimentoSismico,
      m.Mimica, m.Metronomo, m.Sostituto, m.Russare, m.Fangosberla,
      m.Ventogelato, m.Resistenza, m.Bullo, m.Sonnolalia, m.Dinamipugno
    ],
    evolution: { stage: "stage2", to: [] }
  },
  "273": {
    name: "Seedot",
    dexNumber: 273,
    type: ["Erba"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 19
    },
    exp: 50,
    movesByLevel: {
      5: [m.Azione, m.Pazienza, m.Rafforzatore],
      7: [m.Crescita],
      13: [m.Naturforza],
      21: [m.Sintesi],
      31: [m.Giornodisole],
      43: [m.Esplosione]
    },
    movesByMT: [
      m.Solarraggio, m.Fossa, m.Tossina, m.Doppioteam, m.Flash,
      m.Riposo, m.Protezione, m.Gigassorbimento, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Introforza, m.Giornodisole, m.PallaOmbra, m.Spaccaroccia,
      m.Facciata, m.Forzasegreta, m.Semitraglia, m.Ventagliente, m.Riduttore,
      m.Parassiseme, m.AttaccoRapido, m.Amnesia, m.Falsofinale, m.Danzaspada,
      m.Corposcontro, m.Sdoppiatore, m.Mimica, m.Ricciolscudo, m.Autodistruzione,
      m.Esplosione, m.Sostituto, m.Russare, m.Resistenza, m.Rotolamento,
      m.Bullo, m.Sonnolalia, m.Rinfrescata
    ],
    evolution: { stage: "base", to: [{ species: "274", trigger: { kind: "level", level: 14 } }] }
  },
  "274": {
    name: "Nuzleaf",
    dexNumber: 274,
    type: ["Erba", "Buio"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 14,
      maxLevel: 50
    },
    exp: 100,
    movesByLevel: {
      5: [m.Rafforzatore, m.Botta],
      7: [m.Crescita],
      13: [m.Naturforza],
      19: [m.Bruciapelo],
      25: [m.Attaccalite],
      31: [m.Finta],
      37: [m.Ventagliente],
      43: [m.Bullo],
      49: [m.Extrasenso]
    },
    movesByMT: [
      m.Taglio, m.IperRaggio, m.Forza, m.Solarraggio, m.Fossa,
      m.Tossina, m.Doppioteam, m.Flash, m.Riposo, m.Furto,
      m.Protezione, m.Gigassorbimento, m.Attrazione, m.Ritorno, m.Frustrazione,
      m.Introforza, m.Giornodisole, m.PallaOmbra, m.Spaccaroccia, m.Attaccalite,
      m.Facciata, m.Breccia, m.Forzasegreta, m.Rocciotomba, m.Semitraglia,
      m.Ventagliente, m.Riduttore, m.Parassiseme, m.AttaccoRapido, m.Amnesia,
      m.Falsofinale, m.Danzaspada, m.Megacalcio, m.Corposcontro, m.Sdoppiatore,
      m.Mimica, m.Ricciolscudo, m.Autodistruzione, m.Comete, m.Esplosione,
      m.Sostituto, m.Russare, m.Fangosberla, m.Resistenza, m.Rotolamento,
      m.Bullo, m.Tagliofuria, m.Sonnolalia, m.Psicamisu, m.Rinfrescata
    ],
    evolution: { stage: "stage1", to: [{ species: "275", trigger: { kind: "item", item: i.pietrafoglia } }] }
  },
  "275": {
    name: "Shiftry",
    dexNumber: 275,
    type: ["Erba", "Buio"],
    gender: ["Maschio", "Femmina"],
    spriteGendered: true,
    encounter: {
      rarity: "r",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.Botta, m.Crescita, m.Rafforzatore, m.Naturforza]
    },
    movesByMT: [
      m.Taglio, m.IperRaggio, m.Forza, m.Solarraggio, m.Fossa,
      m.Tossina, m.Doppioteam, m.Flash, m.Riposo, m.Furto,
      m.Protezione, m.Gigassorbimento, m.Attrazione, m.Ritorno, m.Frustrazione,
      m.Introforza, m.Giornodisole, m.PallaOmbra, m.Spaccaroccia, m.Attaccalite,
      m.Facciata, m.Breccia, m.Forzasegreta, m.Rocciotomba, m.Semitraglia,
      m.Aeroassalto, m.Ventagliente, m.Riduttore, m.Parassiseme, m.AttaccoRapido,
      m.Amnesia, m.Falsofinale, m.Danzaspada, m.Megacalcio, m.Corposcontro,
      m.Sdoppiatore, m.Mimica, m.Ricciolscudo, m.Autodistruzione, m.Comete,
      m.Esplosione, m.Sostituto, m.Russare, m.Fangosberla, m.Resistenza,
      m.Rotolamento, m.Bullo, m.Tagliofuria, m.Sonnolalia, m.Psicamisu,
      m.Rinfrescata
    ],
    evolution: { stage: "stage2", to: [] }
  },
  "276": {
    name: "Taillow",
    dexNumber: 276,
    type: ["Normale", "Volante"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 32
    },
    exp: 50,
    movesByLevel: {
      5: [m.Focalenergia, m.Ruggito, m.Beccata],
      8: [m.AttaccoRapido],
      13: [m.AttaccodAla],
      19: [m.Doppioteam],
      26: [m.Rimonta],
      34: [m.Aeroassalto],
      43: [m.Agilita]
    },
    movesByMT: [
      m.Volo, m.Tossina, m.Doppioteam, m.Riposo, m.Furto,
      m.Protezione, m.Alacciaio, m.Attrazione, m.Ritorno, m.Frustrazione,
      m.Introforza, m.Pioggiadanza, m.Giornodisole, m.Facciata, m.Forzasegreta,
      m.Aeroassalto, m.Supersuono, m.Ira, m.Speculmossa, m.Aeroattacco,
      m.Inseguimento, m.Rinfrescata, m.Sdoppiatore, m.Contrattacco, m.Mimica,
      m.Comete, m.Sostituto, m.Russare, m.Fangosberla, m.Resistenza,
      m.Bullo, m.Sonnolalia, m.Danzadipiume
    ],
    evolution: { stage: "base", to: [{ species: "277", trigger: { kind: "level", level: 22 } }] }
  },
  "277": {
    name: "Swellow",
    dexNumber: 277,
    type: ["Normale", "Volante"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 22,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Ruggito, m.Beccata, m.Focalenergia],
      8: [m.AttaccoRapido],
      13: [m.AttaccodAla],
      19: [m.Doppioteam],
      28: [m.Rimonta],
      38: [m.Aeroassalto],
      49: [m.Agilita]
    },
    movesByMT: [
      m.Volo, m.IperRaggio, m.Tossina, m.Doppioteam, m.Riposo,
      m.Furto, m.Protezione, m.Alacciaio, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Giornodisole, m.Facciata,
      m.Forzasegreta, m.Aeroassalto, m.Supersuono, m.Ira, m.Speculmossa,
      m.Aeroattacco, m.Inseguimento, m.Rinfrescata, m.Sdoppiatore, m.Contrattacco,
      m.Mimica, m.Comete, m.Sostituto, m.Russare, m.Fangosberla,
      m.Resistenza, m.Bullo, m.Sonnolalia, m.Agilita, m.Staffetta,
      m.Danzadipiume
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "278": {
    name: "Wingull",
    dexNumber: 278,
    type: ["Acqua", "Volante"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 35
    },
    exp: 50,
    movesByLevel: {
      5: [m.Ruggito, m.Pistolacqua],
      7: [m.Supersuono],
      13: [m.AttaccodAla],
      21: [m.Nebbia],
      31: [m.AttaccoRapido],
      43: [m.Inseguimento],
      55: [m.Agilita]
    },
    movesByMT: [
      m.Volo, m.Geloraggio, m.Bora, m.Tossina, m.Doppioteam,
      m.Riposo, m.Furto, m.Protezione, m.Alacciaio, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Grandine,
      m.Facciata, m.Forzasegreta, m.Aeroassalto, m.Ondashock, m.Idropulsar,
      m.Raffica, m.Nebbia, m.Agilita, m.Tornado, m.Docciascudo,
      m.Sdoppiatore, m.Mimica, m.Comete, m.Aeroattacco, m.Sostituto,
      m.Russare, m.Fangosberla, m.Ventogelato, m.Resistenza, m.Bullo,
      m.Sonnolalia
    ],
    evolution: { stage: "base", to: [{ species: "279", trigger: { kind: "level", level: 25 } }] }
  },
  "279": {
    name: "Pelipper",
    dexNumber: 279,
    type: ["Acqua", "Volante"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 25,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Ruggito, m.Pistolacqua, m.Docciascudo],
      7: [m.Supersuono],
      13: [m.AttaccodAla],
      21: [m.Nebbia],
      25: [m.Protezione],
      33: [m.Accumulo, m.Introenergia],
      47: [m.Sfoghenergia],
      61: [m.Idropompa]
    },
    movesByMT: [
      m.Volo, m.Surf, m.Geloraggio, m.Bora, m.IperRaggio,
      m.Tossina, m.Doppioteam, m.Riposo, m.Furto, m.Protezione,
      m.Alacciaio, m.Attrazione, m.Ritorno, m.Frustrazione, m.Introforza,
      m.Pioggiadanza, m.Grandine, m.Facciata, m.Forzasegreta, m.Aeroassalto,
      m.Ondashock, m.Idropulsar, m.Falcecannone, m.Raffica, m.Nebbia,
      m.Agilita, m.Tornado, m.Docciascudo, m.Sdoppiatore, m.Mimica,
      m.Comete, m.Aeroattacco, m.Sostituto, m.Russare, m.Fangosberla,
      m.Ventogelato, m.Resistenza, m.Bullo, m.Sonnolalia
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "280": {
    name: "Ralts",
    dexNumber: 280,
    type: ["Psico", "Folletto"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 25
    },
    exp: 50,
    movesByLevel: {
      5: [m.Botta, m.Ruggito],
      6: [m.Confusione],
      11: [m.Doppioteam],
      16: [m.Teletrasporto],
      21: [m.Calmamente],
      26: [m.Psichico],
      31: [m.Esclusiva],
      36: [m.Divinazione],
      41: [m.Ipnosi],
      46: [m.Mangiasogni]
    },
    movesByMT: [
      m.Fulmine, m.Tossina, m.Psichico, m.Doppioteam, m.Schermoluce,
      m.Riflesso, m.Flash, m.Riposo, m.Furto, m.Protezione,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Salvaguardia, m.Introforza,
      m.Pioggiadanza, m.Giornodisole, m.PallaOmbra, m.Attaccalite, m.Facciata,
      m.Provocazione, m.Scippo, m.Forzasegreta, m.Calmamente, m.Ondashock,
      m.Inibitore, m.Destinobbligato, m.Malosguardo, m.Fuocofatuo, m.Memento,
      m.Fuocopugno, m.Gelopugno, m.Tuonopugno, m.Corposcontro, m.Sdoppiatore,
      m.Tuononda, m.Mimica, m.Ricciolscudo, m.Mangiasogni, m.Sostituto,
      m.Incubo, m.Russare, m.Fangosberla, m.Ventogelato, m.Resistenza,
      m.Bullo, m.Sonnolalia, m.Psicamisu, m.Canto, m.Confusione,
      m.Desiderio, m.Fascino
    ],
    evolution: { stage: "base", to: [{ species: "281", trigger: { kind: "level", level: 20 } }] }
  },
  "281": {
    name: "Kirlia",
    dexNumber: 281,
    type: ["Psico", "Folletto"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 20,
      maxLevel: 40
    },
    exp: 100,
    movesByLevel: {
      5: [m.Ruggito, m.Fogliamagica],
      6: [m.Confusione],
      11: [m.Doppioteam],
      16: [m.Teletrasporto],
      21: [m.Calmamente],
      26: [m.Psichico],
      33: [m.Esclusiva],
      40: [m.Divinazione],
      47: [m.Ipnosi],
      54: [m.Mangiasogni]
    },
    movesByMT: [
      m.Fulmine, m.Tossina, m.Psichico, m.Doppioteam, m.Schermoluce,
      m.Riflesso, m.Flash, m.Riposo, m.Furto, m.Protezione,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Salvaguardia, m.Introforza,
      m.Pioggiadanza, m.Giornodisole, m.PallaOmbra, m.Attaccalite, m.Facciata,
      m.Provocazione, m.Scippo, m.Forzasegreta, m.Calmamente, m.Ondashock,
      m.Inibitore, m.Destinobbligato, m.Malosguardo, m.Fuocofatuo, m.Memento,
      m.Fuocopugno, m.Gelopugno, m.Tuonopugno, m.Corposcontro, m.Sdoppiatore,
      m.Tuononda, m.Mimica, m.Ricciolscudo, m.Mangiasogni, m.Sostituto,
      m.Incubo, m.Russare, m.Fangosberla, m.Ventogelato, m.Resistenza,
      m.Bullo, m.Sonnolalia, m.Psicamisu, m.Canto, m.Confusione,
      m.Desiderio, m.Fascino
    ],
    evolution: { stage: "stage1", to: [{ species: "282", trigger: { kind: "level", level: 30 } }] }
  },
  "282": {
    name: "Gardevoir",
    dexNumber: 282,
    type: ["Psico", "Folletto"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 30,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.Ruggito, m.Confusione, m.Fogliamagica],
      11: [m.Doppioteam],
      16: [m.Teletrasporto],
      21: [m.Calmamente],
      26: [m.Psichico],
      33: [m.Esclusiva],
      42: [m.Divinazione],
      51: [m.Ipnosi],
      60: [m.Mangiasogni]
    },
    movesByMT: [
      m.IperRaggio, m.Fulmine, m.Tossina, m.Psichico, m.Doppioteam,
      m.Schermoluce, m.Riflesso, m.Flash, m.Riposo, m.Furto,
      m.Protezione, m.Attrazione, m.Ritorno, m.Frustrazione, m.Salvaguardia,
      m.Introforza, m.Pioggiadanza, m.Giornodisole, m.PallaOmbra, m.Attaccalite,
      m.Facciata, m.Provocazione, m.Scippo, m.Forzasegreta, m.Calmamente,
      m.Ondashock, m.Inibitore, m.Destinobbligato, m.Malosguardo, m.Fuocofatuo,
      m.Memento, m.Fuocopugno, m.Gelopugno, m.Tuonopugno, m.Corposcontro,
      m.Sdoppiatore, m.Tuononda, m.Mimica, m.Ricciolscudo, m.Mangiasogni,
      m.Sostituto, m.Incubo, m.Russare, m.Fangosberla, m.Ventogelato,
      m.Resistenza, m.Bullo, m.Sonnolalia, m.Psicamisu, m.Canto,
      m.Confusione, m.Desiderio, m.Fascino
    ],
    evolution: { stage: "stage2", to: [] }
  },
  "283": {
    name: "Surskit",
    dexNumber: 283,
    type: ["Coleottero", "Acqua"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 32
    },
    exp: 50,
    movesByLevel: {
      5: [m.Bolla],
      7: [m.AttaccoRapido],
      13: [m.Profumino],
      19: [m.Docciascudo],
      25: [m.Bollaraggio],
      31: [m.Agilita],
      37: [m.Nebbia, m.Nube]
    },
    movesByMT: [
      m.Geloraggio, m.Bora, m.Solarraggio, m.Tossina, m.Doppioteam,
      m.Flash, m.Riposo, m.Furto, m.Protezione, m.Gigassorbimento,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Introforza, m.Pioggiadanza,
      m.Giornodisole, m.PallaOmbra, m.Facciata, m.Forzasegreta, m.Idropulsar,
      m.Idropompa, m.Psicoraggio, m.Leggimente, m.Preveggenza, m.Colpodifango,
      m.Sdoppiatore, m.Mimica, m.Comete, m.Sostituto, m.Russare,
      m.Ventogelato, m.Resistenza, m.Bullo, m.Sonnolalia, m.Psicamisu,
      m.Fangata
    ],
    evolution: { stage: "base", to: [{ species: "284", trigger: { kind: "level", level: 22 } }] }
  },
  "284": {
    name: "Masquerain",
    dexNumber: 284,
    type: ["Coleottero", "Volante"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 22,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Bolla],
      7: [m.AttaccoRapido],
      13: [m.Profumino],
      19: [m.Docciascudo],
      26: [m.Raffica],
      33: [m.Visotruce],
      40: [m.Paralizzante],
      47: [m.Ventargenteo],
      53: [m.Turbine]
    },
    movesByMT: [
      m.Geloraggio, m.Bora, m.IperRaggio, m.Solarraggio, m.Tossina,
      m.Doppioteam, m.Flash, m.Riposo, m.Furto, m.Protezione,
      m.Gigassorbimento, m.Attrazione, m.Ritorno, m.Frustrazione, m.Introforza,
      m.Pioggiadanza, m.Giornodisole, m.PallaOmbra, m.Facciata, m.Forzasegreta,
      m.Aeroassalto, m.Idropulsar, m.Idropompa, m.Psicoraggio, m.Leggimente,
      m.Preveggenza, m.Colpodifango, m.Sdoppiatore, m.Mimica, m.Comete,
      m.Sostituto, m.Incubo, m.Russare, m.Ventogelato, m.Resistenza,
      m.Bullo, m.Sonnolalia, m.Psicamisu, m.Fangata
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "285": {
    name: "Shroomish",
    dexNumber: 285,
    type: ["Erba"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 33
    },
    exp: 50,
    movesByLevel: {
      5: [m.Assorbimento, m.Azione],
      7: [m.Paralizzante],
      10: [m.Parassiseme],
      16: [m.Megassorbimento],
      22: [m.Bottintesta],
      28: [m.Velenpolvere],
      36: [m.Crescita],
      45: [m.Gigassorbimento],
      54: [m.Spora]
    },
    movesByMT: [
      m.Solarraggio, m.Tossina, m.Doppioteam, m.Flash, m.Riposo,
      m.Protezione, m.Fangobomba, m.Gigassorbimento, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Salvaguardia, m.Introforza, m.Giornodisole, m.Facciata,
      m.Scippo, m.Forzasegreta, m.Semitraglia, m.Fascino, m.Falsofinale,
      m.Bullo, m.Altruismo, m.Falselacrime, m.Danzaspada, m.Corposcontro,
      m.Sdoppiatore, m.Mimica, m.Sostituto, m.Russare, m.Resistenza,
      m.Sonnolalia, m.Megassorbimento, m.Paralizzante, m.Rinfrescata
    ],
    evolution: { stage: "base", to: [{ species: "286", trigger: { kind: "level", level: 23 } }] }
  },
  "286": {
    name: "Breloom",
    dexNumber: 286,
    type: ["Erba", "Lotta"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 23,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Azione, m.Assorbimento],
      7: [m.Paralizzante],
      10: [m.Parassiseme],
      16: [m.Megassorbimento],
      22: [m.Bottintesta],
      23: [m.Pugnorapido],
      28: [m.Contrattacco],
      36: [m.Stramontante],
      45: [m.Leggimente],
      54: [m.Dinamipugno]
    },
    movesByMT: [
      m.Taglio, m.IperRaggio, m.Forza, m.Solarraggio, m.Tossina,
      m.Doppioteam, m.Flash, m.Riposo, m.Protezione, m.Fangobomba,
      m.Gigassorbimento, m.Attrazione, m.Ritorno, m.Frustrazione, m.Salvaguardia,
      m.Codacciaio, m.Introforza, m.Giornodisole, m.Spaccaroccia, m.Facciata,
      m.Centripugno, m.Breccia, m.Scippo, m.Forzasegreta, m.Semitraglia,
      m.Granfisico, m.Fascino, m.Falsofinale, m.Bullo, m.Altruismo,
      m.Falselacrime, m.Megapugno, m.Tuonopugno, m.Danzaspada, m.Megacalcio,
      m.Corposcontro, m.Sdoppiatore, m.Contrattacco, m.MovimentoSismico, m.Mimica,
      m.Sostituto, m.Russare, m.Fangosberla, m.Resistenza, m.Tagliofuria,
      m.Sonnolalia, m.Dinamipugno, m.Megassorbimento, m.Paralizzante, m.Rinfrescata
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "287": {
    name: "Slakoth",
    dexNumber: 287,
    type: ["Normale"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 23
    },
    exp: 50,
    movesByLevel: {
      5: [m.Graffio, m.Sbadiglio],
      7: [m.Ripeti],
      13: [m.Pigro],
      19: [m.Finta],
      25: [m.Amnesia],
      31: [m.Supplica],
      37: [m.Contrattacco],
      43: [m.Flagello]
    },
    movesByMT: [
      m.Taglio, m.Lanciafiamme, m.Geloraggio, m.Bora, m.Forza,
      m.Solarraggio, m.Fulmine, m.Tuono, m.Tossina, m.Doppioteam,
      m.Fuocobomba, m.Riposo, m.Protezione, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Giornodisole, m.PallaOmbra,
      m.Spaccaroccia, m.Facciata, m.Centripugno, m.Breccia, m.Forzasegreta,
      m.Aeroassalto, m.Granfisico, m.Ondashock, m.Idropulsar, m.Corposcontro,
      m.Lacerazione, m.Russare, m.Maledizione, m.Sonnolalia, m.Inseguimento,
      m.Tritartigli, m.Megapugno, m.Fuocopugno, m.Gelopugno, m.Tuonopugno,
      m.Megacalcio, m.Sdoppiatore, m.Contrattacco, m.MovimentoSismico, m.Mimica,
      m.Frana, m.Sostituto, m.Fangosberla, m.Ventogelato, m.Resistenza,
      m.Bullo, m.Tagliofuria, m.Dinamipugno
    ],
    evolution: { stage: "base", to: [{ species: "288", trigger: { kind: "level", level: 18 } }] }
  },
  "288": {
    name: "Vigoroth",
    dexNumber: 288,
    type: ["Normale"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 18,
      maxLevel: 46
    },
    exp: 100,
    movesByLevel: {
      5: [m.Graffio, m.Focalenergia],
      7: [m.Ripeti],
      13: [m.Baraonda],
      19: [m.Sfuriate],
      25: [m.Resistenza],
      31: [m.Lacerazione],
      37: [m.Contrattacco],
      43: [m.Centripugno],
      49: [m.Contropiede]
    },
    movesByMT: [
      m.Taglio, m.Boato, m.Lanciafiamme, m.Geloraggio, m.Bora,
      m.Forza, m.Solarraggio, m.Fulmine, m.Tuono, m.Terremoto,
      m.Tossina, m.Doppioteam, m.Fuocobomba, m.Riposo, m.Protezione,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Introforza, m.Pioggiadanza,
      m.Giornodisole, m.PallaOmbra, m.Spaccaroccia, m.Facciata, m.Centripugno,
      m.Provocazione, m.Breccia, m.Forzasegreta, m.Aeroassalto, m.Granfisico,
      m.Ondashock, m.Idropulsar, m.Corposcontro, m.Lacerazione, m.Russare,
      m.Maledizione, m.Sonnolalia, m.Inseguimento, m.Tritartigli, m.Megapugno,
      m.Fuocopugno, m.Gelopugno, m.Tuonopugno, m.Megacalcio, m.Sdoppiatore,
      m.Contrattacco, m.MovimentoSismico, m.Mimica, m.Frana, m.Sostituto,
      m.Fangosberla, m.Ventogelato, m.Resistenza, m.Bullo, m.Tagliofuria,
      m.Dinamipugno
    ],
    evolution: { stage: "stage1", to: [{ species: "289", trigger: { kind: "level", level: 36 } }] }
  },
  "289": {
    name: "Slaking",
    dexNumber: 289,
    type: ["Normale"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 36,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.Graffio, m.Sbadiglio],
      7: [m.Ripeti],
      13: [m.Pigro],
      19: [m.Finta],
      25: [m.Amnesia],
      31: [m.Supplica],
      36: [m.Bullo],
      37: [m.Contrattacco],
      43: [m.Flagello]
    },
    movesByMT: [
      m.Taglio, m.Boato, m.Lanciafiamme, m.Geloraggio, m.Bora,
      m.IperRaggio, m.Forza, m.Solarraggio, m.Fulmine, m.Tuono,
      m.Terremoto, m.Tossina, m.Doppioteam, m.Fuocobomba, m.Riposo,
      m.Protezione, m.Attrazione, m.Ritorno, m.Frustrazione, m.Introforza,
      m.Pioggiadanza, m.Giornodisole, m.PallaOmbra, m.Spaccaroccia, m.Facciata,
      m.Centripugno, m.Provocazione, m.Breccia, m.Forzasegreta, m.Aeroassalto,
      m.Granfisico, m.Ondashock, m.Idropulsar, m.Corposcontro, m.Lacerazione,
      m.Russare, m.Maledizione, m.Sonnolalia, m.Inseguimento, m.Tritartigli,
      m.Megapugno, m.Fuocopugno, m.Gelopugno, m.Tuonopugno, m.Megacalcio,
      m.Sdoppiatore, m.Contrattacco, m.MovimentoSismico, m.Mimica, m.Frana,
      m.Sostituto, m.Fangosberla, m.Ventogelato, m.Resistenza, m.Bullo,
      m.Tagliofuria, m.Dinamipugno
    ],
    evolution: { stage: "stage2", to: [] }
  },
  "290": {
    name: "Nincada",
    dexNumber: 290,
    type: ["Coleottero", "Terra"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 30
    },
    exp: 50,
    movesByLevel: {
      5: [m.Graffio, m.Rafforzatore, m.Sanguisuga],
      9: [m.Turbosabbia],
      14: [m.Sfuriate],
      19: [m.Leggimente],
      25: [m.Falsofinale],
      31: [m.Fangosberla],
      38: [m.Ferrartigli],
      45: [m.Fossa]
    },
    movesByMT: [
      m.Taglio, m.Solarraggio, m.Fossa, m.Tossina, m.Doppioteam,
      m.Flash, m.Riposo, m.Protezione, m.Terrempesta, m.Gigassorbimento,
      m.Ritorno, m.Frustrazione, m.Introforza, m.Giornodisole, m.PallaOmbra,
      m.Facciata, m.Forzasegreta, m.Aeroassalto, m.Raffica, m.Finta,
      m.Resistenza, m.Ventargenteo, m.Sdoppiatore, m.Mimica, m.Sostituto,
      m.Russare, m.Fangosberla, m.Bullo, m.Tagliofuria, m.Sonnolalia
    ],
    evolution: { stage: "base", to: [{ species: "291", trigger: { kind: "level", level: 20 } }] }
  },
  "291": {
    name: "Ninjask",
    dexNumber: 291,
    type: ["Coleottero", "Volante"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 20,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Graffio, m.Rafforzatore, m.Sanguisuga],
      9: [m.Turbosabbia],
      14: [m.Sfuriate],
      19: [m.Leggimente],
      20: [m.Stridio, m.Doppioteam, m.Tagliofuria],
      25: [m.Danzaspada],
      31: [m.Lacerazione],
      38: [m.Agilita],
      45: [m.Staffetta]
    },
    movesByMT: [
      m.Taglio, m.IperRaggio, m.Solarraggio, m.Fossa, m.Tossina,
      m.Doppioteam, m.Flash, m.Riposo, m.Furto, m.Protezione,
      m.Terrempesta, m.Gigassorbimento, m.Attrazione, m.Ritorno, m.Frustrazione,
      m.Introforza, m.Giornodisole, m.PallaOmbra, m.Facciata, m.Forzasegreta,
      m.Aeroassalto, m.Raffica, m.Finta, m.Resistenza, m.Ventargenteo,
      m.Danzaspada, m.Sdoppiatore, m.Mimica, m.Comete, m.Sostituto,
      m.Russare, m.Fangosberla, m.Bullo, m.Tagliofuria, m.Sonnolalia
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "292": {
    name: "Shedinja",
    dexNumber: 292,
    type: ["Coleottero", "Spettro"],
    gender: [],
    encounter: {
      rarity: "r",
      minLevel: 20,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Graffio, m.Rafforzatore, m.Sanguisuga],
      9: [m.Turbosabbia],
      14: [m.Sfuriate],
      19: [m.Leggimente],
      25: [m.Dispetto],
      31: [m.Stordiraggio],
      38: [m.PallaOmbra],
      45: [m.Rancore]
    },
    movesByMT: [
      m.Taglio, m.IperRaggio, m.Solarraggio, m.Fossa, m.Tossina,
      m.Doppioteam, m.Flash, m.Riposo, m.Furto, m.Protezione,
      m.Terrempesta, m.Gigassorbimento, m.Ritorno, m.Frustrazione, m.Introforza,
      m.Giornodisole, m.PallaOmbra, m.Facciata, m.Forzasegreta, m.Aeroassalto,
      m.Sdoppiatore, m.Mimica, m.Mangiasogni, m.Sostituto, m.Incubo,
      m.Russare, m.Fangosberla, m.Resistenza, m.Bullo, m.Tagliofuria,
      m.Sonnolalia
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "293": {
    name: "Whismur",
    dexNumber: 293,
    type: ["Normale"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 25
    },
    exp: 50,
    movesByLevel: {
      5: [m.Botta, m.Baraonda],
      11: [m.Sgomento],
      15: [m.Gridodilotta],
      21: [m.Supersuono],
      25: [m.Pestone],
      31: [m.Stridio],
      35: [m.Boato],
      41: [m.Riposo, m.Sonnolalia],
      45: [m.Granvoce]
    },
    movesByMT: [
      m.Boato, m.Lanciafiamme, m.Geloraggio, m.Bora, m.Solarraggio,
      m.Tossina, m.Doppioteam, m.Fuocobomba, m.Riposo, m.Protezione,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Introforza, m.Pioggiadanza,
      m.Giornodisole, m.PallaOmbra, m.Facciata, m.Forzasegreta, m.Ondashock,
      m.Idropulsar, m.Riduttore, m.Russare, m.Bullo, m.Maniereforti,
      m.Extrasenso, m.Megapugno, m.Fuocopugno, m.Gelopugno, m.Tuonopugno,
      m.Megacalcio, m.Corposcontro, m.Sdoppiatore, m.Contrattacco, m.MovimentoSismico,
      m.Mimica, m.Ricciolscudo, m.Sostituto, m.Fangosberla, m.Ventogelato,
      m.Resistenza, m.Rotolamento, m.Sonnolalia, m.Dinamipugno, m.Psicamisu,
      m.Strampadanza
    ],
    evolution: { stage: "base", to: [{ species: "294", trigger: { kind: "level", level: 20 } }] }
  },
  "294": {
    name: "Loudred",
    dexNumber: 294,
    type: ["Normale"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 20,
      maxLevel: 50
    },
    exp: 100,
    movesByLevel: {
      5: [m.Botta, m.Baraonda],
      11: [m.Sgomento],
      15: [m.Gridodilotta],
      23: [m.Supersuono],
      29: [m.Pestone],
      37: [m.Stridio],
      43: [m.Boato],
      51: [m.Riposo, m.Sonnolalia],
      57: [m.Granvoce]
    },
    movesByMT: [
      m.Boato, m.Lanciafiamme, m.Geloraggio, m.Bora, m.Forza,
      m.Solarraggio, m.Terremoto, m.Tossina, m.Doppioteam, m.Fuocobomba,
      m.Riposo, m.Protezione, m.Attrazione, m.Ritorno, m.Frustrazione,
      m.Introforza, m.Pioggiadanza, m.Giornodisole, m.PallaOmbra, m.Spaccaroccia,
      m.Attaccalite, m.Facciata, m.Provocazione, m.Breccia, m.Forzasegreta,
      m.Vampata, m.Ondashock, m.Idropulsar, m.Riduttore, m.Russare,
      m.Bullo, m.Maniereforti, m.Extrasenso, m.Megapugno, m.Fuocopugno,
      m.Gelopugno, m.Tuonopugno, m.Megacalcio, m.Corposcontro, m.Sdoppiatore,
      m.Contrattacco, m.MovimentoSismico, m.Mimica, m.Ricciolscudo, m.Frana,
      m.Sostituto, m.Fangosberla, m.Ventogelato, m.Resistenza, m.Rotolamento,
      m.Sonnolalia, m.Dinamipugno, m.Psicamisu, m.Strampadanza
    ],
    evolution: { stage: "stage1", to: [{ species: "295", trigger: { kind: "level", level: 40 } }] }
  },
  "295": {
    name: "Exploud",
    dexNumber: 295,
    type: ["Normale"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.Botta, m.Baraonda],
      11: [m.Sgomento],
      15: [m.Gridodilotta],
      23: [m.Supersuono],
      29: [m.Pestone],
      37: [m.Stridio],
      40: [m.IperRaggio],
      45: [m.Boato],
      55: [m.Riposo, m.Sonnolalia],
      63: [m.Granvoce]
    },
    movesByMT: [
      m.Boato, m.Lanciafiamme, m.Geloraggio, m.Bora, m.IperRaggio,
      m.Forza, m.Solarraggio, m.Terremoto, m.Tossina, m.Doppioteam,
      m.Fuocobomba, m.Riposo, m.Protezione, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Giornodisole, m.PallaOmbra,
      m.Spaccaroccia, m.Attaccalite, m.Facciata, m.Provocazione, m.Breccia,
      m.Forzasegreta, m.Vampata, m.Ondashock, m.Idropulsar, m.Riduttore,
      m.Russare, m.Bullo, m.Maniereforti, m.Extrasenso, m.Megapugno,
      m.Fuocopugno, m.Gelopugno, m.Tuonopugno, m.Megacalcio, m.Corposcontro,
      m.Sdoppiatore, m.Contrattacco, m.MovimentoSismico, m.Mimica, m.Ricciolscudo,
      m.Frana, m.Sostituto, m.Fangosberla, m.Ventogelato, m.Resistenza,
      m.Rotolamento, m.Sonnolalia, m.Dinamipugno, m.Psicamisu, m.Strampadanza
    ],
    evolution: { stage: "stage2", to: [] }
  },
  "296": {
    name: "Makuhita",
    dexNumber: 296,
    type: ["Lotta"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 34
    },
    exp: 50,
    movesByLevel: {
      5: [m.Azione, m.Focalenergia, m.Turbosabbia],
      10: [m.Sberletese],
      13: [m.Vitaltiro],
      19: [m.Bruciapelo],
      22: [m.Turbine],
      28: [m.Privazione],
      31: [m.Maniereforti],
      37: [m.Panciamburo],
      40: [m.Resistenza],
      46: [m.MovimentoSismico],
      49: [m.Contropiede]
    },
    movesByMT: [
      m.Surf, m.Forza, m.Terremoto, m.Fossa, m.Tossina,
      m.Doppioteam, m.Riposo, m.Protezione, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Giornodisole, m.Spaccaroccia,
      m.Facciata, m.Centripugno, m.Breccia, m.Forzasegreta, m.Rocciotomba,
      m.Granfisico, m.Contrattacco, m.Finta, m.Preveggenza, m.Individua,
      m.Dinamipugno, m.Incrocolpo, m.Altruismo, m.Vendetta, m.Megapugno,
      m.Fuocopugno, m.Gelopugno, m.Tuonopugno, m.Megacalcio, m.Corposcontro,
      m.Sdoppiatore, m.MovimentoSismico, m.Mimica, m.Metronomo, m.Frana,
      m.Sostituto, m.Russare, m.Fangosberla, m.Resistenza, m.Bullo,
      m.Sonnolalia, m.Rinfrescata, m.Sberletese
    ],
    evolution: { stage: "base", to: [{ species: "297", trigger: { kind: "level", level: 24 } }] }
  },
  "297": {
    name: "Hariyama",
    dexNumber: 297,
    type: ["Lotta"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 24,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Turbosabbia, m.Azione, m.Focalenergia],
      10: [m.Sberletese],
      13: [m.Vitaltiro],
      19: [m.Bruciapelo],
      22: [m.Turbine],
      29: [m.Privazione],
      33: [m.Maniereforti],
      40: [m.Panciamburo],
      44: [m.Resistenza],
      51: [m.MovimentoSismico],
      55: [m.Contropiede]
    },
    movesByMT: [
      m.Surf, m.IperRaggio, m.Forza, m.Terremoto, m.Fossa,
      m.Tossina, m.Doppioteam, m.Riposo, m.Protezione, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Giornodisole,
      m.Spaccaroccia, m.Facciata, m.Centripugno, m.Breccia, m.Forzasegreta,
      m.Rocciotomba, m.Granfisico, m.Contrattacco, m.Finta, m.Preveggenza,
      m.Individua, m.Dinamipugno, m.Incrocolpo, m.Altruismo, m.Vendetta,
      m.Megapugno, m.Fuocopugno, m.Gelopugno, m.Tuonopugno, m.Megacalcio,
      m.Corposcontro, m.Sdoppiatore, m.MovimentoSismico, m.Mimica, m.Metronomo,
      m.Frana, m.Sostituto, m.Russare, m.Fangosberla, m.Resistenza,
      m.Bullo, m.Sonnolalia, m.Rinfrescata, m.Sberletese
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "298": {
    name: "Azurill",
    dexNumber: 298,
    type: ["Normale", "Folletto"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 15
    },
    exp: 50,
    movesByLevel: {
      5: [m.Botta, m.Fascino, m.Splash],
      6: [m.Colpocoda],
      10: [m.Bolla],
      15: [m.Schianto],
      21: [m.Pistolacqua]
    },
    movesByMT: [
      m.Surf, m.Geloraggio, m.Bora, m.Tossina, m.Doppioteam,
      m.Cascata, m.Riposo, m.Protezione, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Codacciaio, m.Introforza, m.Pioggiadanza, m.Grandine,
      m.Facciata, m.Forzasegreta, m.Idropulsar, m.Schianto, m.Canto,
      m.Ripeti, m.Rinfrescata, m.Solletico, m.Corposcontro, m.Sdoppiatore,
      m.Mimica, m.Ricciolscudo, m.Comete, m.Sostituto, m.Russare,
      m.Fangosberla, m.Ventogelato, m.Resistenza, m.Rotolamento, m.Bullo,
      m.Sonnolalia
    ],
    evolution: { stage: "base", to: [{ species: "183", trigger: { kind: "item", item: i.felixpietra } }] }
  },
  "299": {
    name: "Nosepass",
    dexNumber: 299,
    type: ["Roccia"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Azione],
      7: [m.Rafforzatore],
      13: [m.Sassata],
      16: [m.Blocco],
      22: [m.Tuononda],
      28: [m.Frana],
      31: [m.Terrempesta],
      37: [m.Riposo],
      43: [m.Falcecannone],
      46: [m.Localizza]
    },
    movesByMT: [
      m.Forza, m.Fulmine, m.Tuono, m.Terremoto, m.Tossina,
      m.Doppioteam, m.Riposo, m.Protezione, m.Terrempesta, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Introforza, m.Giornodisole, m.Spaccaroccia,
      m.Attaccalite, m.Facciata, m.Provocazione, m.Forzasegreta, m.Rocciotomba,
      m.Ondashock, m.Esplosione, m.Rotolamento, m.Magnitudo, m.Fuocopugno,
      m.Gelopugno, m.Tuonopugno, m.Corposcontro, m.Sdoppiatore, m.Tuononda,
      m.Mimica, m.Ricciolscudo, m.Autodistruzione, m.Frana, m.Sostituto,
      m.Russare, m.Fangosberla, m.Resistenza, m.Bullo, m.Sonnolalia,
      m.Dinamipugno, m.Altruismo
    ],
    evolution: { stage: "base", to: [] }
  },
  "300": {
    name: "Skitty",
    dexNumber: 300,
    type: ["Normale"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 50
    },
    exp: 50,
    movesByLevel: {
      5: [m.Azione, m.Colpocoda, m.Ruggito],
      7: [m.Attrazione],
      13: [m.Canto],
      15: [m.Doppiasberla],
      19: [m.Assistente],
      25: [m.Fascino],
      27: [m.Finta],
      31: [m.Supplica],
      37: [m.Rintoccasana],
      39: [m.Sdoppiatore]
    },
    movesByMT: [
      m.Geloraggio, m.Bora, m.Solarraggio, m.Fulmine, m.Tuono,
      m.Fossa, m.Tossina, m.Doppioteam, m.Flash, m.Riposo,
      m.Protezione, m.Attrazione, m.Ritorno, m.Frustrazione, m.Salvaguardia,
      m.Codacciaio, m.Introforza, m.Pioggiadanza, m.Giornodisole, m.PallaOmbra,
      m.Facciata, m.Forzasegreta, m.Calmamente, m.Ondashock, m.Idropulsar,
      m.Sostituto, m.Staffetta, m.Psicamisu, m.Baraonda, m.Altruismo,
      m.Desiderio, m.Falselacrime, m.Solletico, m.Corposcontro, m.Sdoppiatore,
      m.Tuononda, m.Mimica, m.Ricciolscudo, m.Comete, m.Mangiasogni,
      m.Russare, m.Fangosberla, m.Ventogelato, m.Resistenza, m.Rotolamento,
      m.Bullo, m.Sonnolalia, m.Giornopaga
    ],
    evolution: { stage: "base", to: [{ species: "301", trigger: { kind: "item", item: i.pietralunare } }] }
  },
  "301": {
    name: "Delcatty",
    dexNumber: 301,
    type: ["Normale"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Doppiasberla, m.Ruggito, m.Canto, m.Attrazione]
    },
    movesByMT: [
      m.Geloraggio, m.Bora, m.IperRaggio, m.Forza, m.Solarraggio,
      m.Fulmine, m.Tuono, m.Fossa, m.Tossina, m.Doppioteam,
      m.Flash, m.Riposo, m.Protezione, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Salvaguardia, m.Codacciaio, m.Introforza, m.Pioggiadanza,
      m.Giornodisole, m.PallaOmbra, m.Spaccaroccia, m.Facciata, m.Forzasegreta,
      m.Calmamente, m.Ondashock, m.Idropulsar, m.Falcecannone, m.Sostituto,
      m.Staffetta, m.Psicamisu, m.Baraonda, m.Altruismo, m.Desiderio,
      m.Falselacrime, m.Solletico, m.Corposcontro, m.Sdoppiatore, m.Tuononda,
      m.Mimica, m.Ricciolscudo, m.Comete, m.Mangiasogni, m.Russare,
      m.Fangosberla, m.Ventogelato, m.Resistenza, m.Rotolamento, m.Bullo,
      m.Sonnolalia, m.Dolcebacio, m.Giornopaga
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "302": {
    name: "Sableye",
    dexNumber: 302,
    type: ["Buio", "Spettro"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "s",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Graffio, m.Fulmisguardo, m.Preveggenza],
      9: [m.OmbraNotturna],
      13: [m.Sgomento],
      17: [m.Sfuriate],
      21: [m.Bruciapelo],
      25: [m.Individua],
      29: [m.Finta],
      33: [m.Privazione],
      37: [m.Stordiraggio],
      41: [m.PallaOmbra],
      45: [m.Malosguardo]
    },
    movesByMT: [
      m.Taglio, m.Fossa, m.Tossina, m.Psichico, m.Doppioteam,
      m.Flash, m.Riposo, m.Furto, m.Protezione, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Giornodisole,
      m.PallaOmbra, m.Spaccaroccia, m.Attaccalite, m.Facciata, m.Centripugno,
      m.Provocazione, m.Breccia, m.Scippo, m.Forzasegreta, m.Rocciotomba,
      m.Aeroassalto, m.Calmamente, m.Ondashock, m.Idropulsar, m.Ripresa,
      m.Lucelunare, m.Psicamisu, m.Megapugno, m.Fuocopugno, m.Gelopugno,
      m.Tuonopugno, m.Megacalcio, m.Corposcontro, m.Sdoppiatore, m.Contrattacco,
      m.MovimentoSismico, m.Mimica, m.Metronomo, m.Mangiasogni, m.Sostituto,
      m.Incubo, m.Russare, m.Fangosberla, m.Resistenza, m.Bullo,
      m.Tagliofuria, m.Sonnolalia, m.Dinamipugno, m.Finta, m.Altruismo
    ],
    evolution: { stage: "base", to: [] }
  },
  "303": {
    name: "Mawile",
    dexNumber: 303,
    type: ["Acciaio", "Folletto"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "s",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Sgomento],
      6: [m.Falselacrime],
      11: [m.Morso],
      16: [m.Profumino],
      21: [m.Presa],
      26: [m.Finta],
      31: [m.Staffetta],
      36: [m.Sgranocchio],
      41: [m.Ferroscudo],
      46: [m.Accumulo, m.Sfoghenergia, m.Introenergia]
    },
    movesByMT: [
      m.Lanciafiamme, m.Geloraggio, m.IperRaggio, m.Forza, m.Solarraggio,
      m.Tossina, m.Doppioteam, m.Fuocobomba, m.Riposo, m.Protezione,
      m.Fangobomba, m.Terrempesta, m.Attrazione, m.Ritorno, m.Frustrazione,
      m.Introforza, m.Pioggiadanza, m.Giornodisole, m.Spaccaroccia, m.Attaccalite,
      m.Facciata, m.Centripugno, m.Provocazione, m.Breccia, m.Forzasegreta,
      m.Rocciotomba, m.Danzaspada, m.Falsofinale, m.Psicamisu, m.Forzantica,
      m.Velenodenti, m.Solletico, m.Megapugno, m.Gelopugno, m.Tuonopugno,
      m.Megacalcio, m.Corposcontro, m.Sdoppiatore, m.Contrattacco, m.MovimentoSismico,
      m.Mimica, m.Frana, m.Sostituto, m.Russare, m.Fangosberla,
      m.Ventogelato, m.Resistenza, m.Bullo, m.Sonnolalia, m.Dinamipugno,
      m.Presa, m.Canto, m.Ferroscudo
    ],
    evolution: { stage: "base", to: [] }
  },
  "304": {
    name: "Aron",
    dexNumber: 304,
    type: ["Acciaio", "Roccia"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 37
    },
    exp: 50,
    movesByLevel: {
      5: [m.Azione, m.Rafforzatore],
      7: [m.Fangosberla],
      10: [m.Bottintesta],
      13: [m.Ferrartigli],
      17: [m.Ferroscudo],
      21: [m.Boato],
      25: [m.Riduttore],
      29: [m.Codacciaio],
      34: [m.Protezione],
      39: [m.Ferrostrido],
      44: [m.Sdoppiatore]
    },
    movesByMT: [
      m.Taglio, m.Boato, m.Forza, m.Terremoto, m.Fossa,
      m.Tossina, m.Doppioteam, m.Riposo, m.Protezione, m.Terrempesta,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Codacciaio, m.Introforza,
      m.Pioggiadanza, m.Giornodisole, m.Spaccaroccia, m.Facciata, m.Forzasegreta,
      m.Rocciotomba, m.Aeroassalto, m.Ondashock, m.Idropulsar, m.Pestone,
      m.Corposcontro, m.Maniereforti, m.Rimonta, m.Sdoppiatore, m.Mimica,
      m.Ricciolscudo, m.Frana, m.Sostituto, m.Russare, m.Fangosberla,
      m.Resistenza, m.Rotolamento, m.Bullo, m.Tagliofuria, m.Sonnolalia
    ],
    evolution: { stage: "base", to: [{ species: "305", trigger: { kind: "level", level: 32 } }] }
  },
  "305": {
    name: "Lairon",
    dexNumber: 305,
    type: ["Acciaio", "Roccia"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 32,
      maxLevel: 52
    },
    exp: 100,
    movesByLevel: {
      5: [m.Azione, m.Rafforzatore],
      7: [m.Fangosberla],
      10: [m.Bottintesta],
      13: [m.Ferrartigli],
      17: [m.Ferroscudo],
      21: [m.Boato],
      25: [m.Riduttore],
      29: [m.Codacciaio],
      37: [m.Protezione],
      45: [m.Ferrostrido],
      53: [m.Sdoppiatore]
    },
    movesByMT: [
      m.Taglio, m.Boato, m.Forza, m.Terremoto, m.Fossa,
      m.Tossina, m.Doppioteam, m.Riposo, m.Protezione, m.Terrempesta,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Codacciaio, m.Introforza,
      m.Pioggiadanza, m.Giornodisole, m.Spaccaroccia, m.Facciata, m.Forzasegreta,
      m.Rocciotomba, m.Aeroassalto, m.Ondashock, m.Idropulsar, m.Pestone,
      m.Corposcontro, m.Maniereforti, m.Rimonta, m.Sdoppiatore, m.Mimica,
      m.Ricciolscudo, m.Frana, m.Sostituto, m.Russare, m.Fangosberla,
      m.Resistenza, m.Rotolamento, m.Bullo, m.Tagliofuria, m.Sonnolalia
    ],
    evolution: { stage: "stage1", to: [{ species: "306", trigger: { kind: "level", level: 42 } }] }
  },
  "306": {
    name: "Aggron",
    dexNumber: 306,
    type: ["Acciaio", "Roccia"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 42,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.Azione, m.Rafforzatore],
      7: [m.Fangosberla],
      10: [m.Bottintesta],
      13: [m.Ferrartigli],
      17: [m.Ferroscudo],
      21: [m.Boato],
      25: [m.Riduttore],
      29: [m.Codacciaio],
      37: [m.Protezione],
      50: [m.Ferrostrido],
      63: [m.Sdoppiatore]
    },
    movesByMT: [
      m.Taglio, m.Boato, m.Lanciafiamme, m.Surf, m.Geloraggio,
      m.Bora, m.IperRaggio, m.Forza, m.Solarraggio, m.Fulmine,
      m.Tuono, m.Terremoto, m.Fossa, m.Tossina, m.Doppioteam,
      m.Fuocobomba, m.Riposo, m.Protezione, m.Terrempesta, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Codacciaio, m.Introforza, m.Pioggiadanza,
      m.Giornodisole, m.Spaccaroccia, m.Facciata, m.Centripugno, m.Provocazione,
      m.Breccia, m.Forzasegreta, m.Rocciotomba, m.Aeroassalto, m.Dragartigli,
      m.Ondashock, m.Idropulsar, m.Pestone, m.Corposcontro, m.Maniereforti,
      m.Rimonta, m.Megapugno, m.Fuocopugno, m.Gelopugno, m.Tuonopugno,
      m.Megacalcio, m.Sdoppiatore, m.Contrattacco, m.MovimentoSismico, m.Tuononda,
      m.Mimica, m.Ricciolscudo, m.Frana, m.Sostituto, m.Russare,
      m.Fangosberla, m.Ventogelato, m.Resistenza, m.Rotolamento, m.Bullo,
      m.Tagliofuria, m.Sonnolalia, m.Dinamipugno
    ],
    evolution: { stage: "stage2", to: [] }
  },
  "307": {
    name: "Meditite",
    dexNumber: 307,
    type: ["Lotta", "Psico"],
    gender: ["Maschio", "Femmina"],
    spriteGendered: true,
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 47
    },
    exp: 50,
    movesByLevel: {
      5: [m.Botta, m.Pazienza, m.Meditazione],
      9: [m.Confusione],
      12: [m.Individua],
      17: [m.Introforza],
      20: [m.Bullo],
      25: [m.Leggimente],
      28: [m.Calmamente],
      33: [m.Calcinvolo],
      36: [m.Psicamisu],
      41: [m.Contropiede],
      44: [m.Ripresa]
    },
    movesByMT: [
      m.Forza, m.Tossina, m.Psichico, m.Doppioteam, m.Schermoluce,
      m.Riflesso, m.Flash, m.Riposo, m.Protezione, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Giornodisole,
      m.PallaOmbra, m.Spaccaroccia, m.Facciata, m.Centripugno, m.Breccia,
      m.Forzasegreta, m.Rocciotomba, m.Granfisico, m.Calmamente, m.Fuocopugno,
      m.Gelopugno, m.Tuonopugno, m.Preveggenza, m.Dinamipugno, m.Staffetta,
      m.Bruciapelo, m.Megapugno, m.Megacalcio, m.Corposcontro, m.Sdoppiatore,
      m.Contrattacco, m.MovimentoSismico, m.Mimica, m.Metronomo, m.Comete,
      m.Mangiasogni, m.Sostituto, m.Russare, m.Fangosberla, m.Resistenza,
      m.Bullo, m.Sonnolalia, m.Psicamisu
    ],
    evolution: { stage: "base", to: [{ species: "308", trigger: { kind: "level", level: 37 } }] }
  },
  "308": {
    name: "Medicham",
    dexNumber: 308,
    type: ["Lotta", "Psico"],
    gender: ["Maschio", "Femmina"],
    spriteGendered: true,
    encounter: {
      rarity: "u",
      minLevel: 37,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Fuocopugno, m.Gelopugno, m.Tuonopugno, m.Meditazione, m.Pazienza],
      9: [m.Confusione],
      12: [m.Individua],
      17: [m.Introforza],
      20: [m.Bullo],
      25: [m.Leggimente],
      28: [m.Calmamente],
      33: [m.Calcinvolo],
      36: [m.Psicamisu],
      47: [m.Contropiede],
      56: [m.Ripresa]
    },
    movesByMT: [
      m.IperRaggio, m.Forza, m.Tossina, m.Psichico, m.Doppioteam,
      m.Schermoluce, m.Riflesso, m.Flash, m.Riposo, m.Protezione,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Introforza, m.Pioggiadanza,
      m.Giornodisole, m.PallaOmbra, m.Spaccaroccia, m.Facciata, m.Centripugno,
      m.Breccia, m.Forzasegreta, m.Rocciotomba, m.Granfisico, m.Calmamente,
      m.Fuocopugno, m.Gelopugno, m.Tuonopugno, m.Preveggenza, m.Dinamipugno,
      m.Staffetta, m.Bruciapelo, m.Megapugno, m.Megacalcio, m.Corposcontro,
      m.Sdoppiatore, m.Contrattacco, m.MovimentoSismico, m.Mimica, m.Metronomo,
      m.Comete, m.Mangiasogni, m.Frana, m.Sostituto, m.Russare,
      m.Fangosberla, m.Resistenza, m.Bullo, m.Sonnolalia, m.Psicamisu
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "309": {
    name: "Electrike",
    dexNumber: 309,
    type: ["Elettro"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 36
    },
    exp: 50,
    movesByLevel: {
      5: [m.Azione, m.Tuononda],
      9: [m.Fulmisguardo],
      12: [m.Gridodilotta],
      17: [m.AttaccoRapido],
      20: [m.Scintilla],
      25: [m.Segugio],
      28: [m.Boato],
      33: [m.Morso],
      36: [m.Tuono],
      41: [m.Sottocarica]
    },
    movesByMT: [
      m.Boato, m.Forza, m.Fulmine, m.Tuono, m.Tossina,
      m.Doppioteam, m.Flash, m.Riposo, m.Furto, m.Protezione,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Codacciaio, m.Introforza,
      m.Pioggiadanza, m.Facciata, m.Forzasegreta, m.Ondashock, m.Bottintesta,
      m.Comete, m.Maledizione, m.Sgranocchio, m.Baraonda, m.Corposcontro,
      m.Sdoppiatore, m.Tuononda, m.Mimica, m.Sostituto, m.Russare,
      m.Fangosberla, m.Resistenza, m.Bullo, m.Sonnolalia
    ],
    evolution: { stage: "base", to: [{ species: "310", trigger: { kind: "level", level: 26 } }] }
  },
  "310": {
    name: "Manectric",
    dexNumber: 310,
    type: ["Elettro"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 26,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Azione, m.Tuononda],
      9: [m.Fulmisguardo],
      12: [m.Gridodilotta],
      17: [m.AttaccoRapido],
      20: [m.Scintilla],
      25: [m.Segugio],
      31: [m.Boato],
      39: [m.Morso],
      45: [m.Tuono],
      53: [m.Sottocarica]
    },
    movesByMT: [
      m.Boato, m.IperRaggio, m.Forza, m.Fulmine, m.Tuono,
      m.Tossina, m.Doppioteam, m.Flash, m.Riposo, m.Furto,
      m.Protezione, m.Attrazione, m.Ritorno, m.Frustrazione, m.Codacciaio,
      m.Introforza, m.Pioggiadanza, m.Facciata, m.Forzasegreta, m.Ondashock,
      m.Falcecannone, m.Bottintesta, m.Comete, m.Maledizione, m.Sgranocchio,
      m.Baraonda, m.Corposcontro, m.Sdoppiatore, m.Tuononda, m.Mimica,
      m.Sostituto, m.Russare, m.Fangosberla, m.Resistenza, m.Bullo,
      m.Sonnolalia, m.Morso, m.Rinfrescata
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "311": {
    name: "Plusle",
    dexNumber: 311,
    type: ["Elettro"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Azione, m.Ruggito, m.Tuononda],
      10: [m.AttaccoRapido],
      13: [m.Altruismo],
      19: [m.Scintilla],
      22: [m.Ripeti],
      28: [m.Falselacrime],
      31: [m.Sottocarica],
      37: [m.Tuono],
      40: [m.Staffetta],
      47: [m.Agilita]
    },
    movesByMT: [
      m.Fulmine, m.Tuono, m.Tossina, m.Doppioteam, m.Schermoluce,
      m.Flash, m.Riposo, m.Protezione, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Codacciaio, m.Introforza, m.Pioggiadanza, m.Facciata,
      m.Forzasegreta, m.Ondashock, m.Falcecannone, m.Sostituto, m.Desiderio,
      m.Megapugno, m.Tuonopugno, m.Megacalcio, m.Corposcontro, m.Sdoppiatore,
      m.Contrattacco, m.MovimentoSismico, m.Tuononda, m.Mimica, m.Ricciolscudo,
      m.Metronomo, m.Comete, m.Russare, m.Fangosberla, m.Resistenza,
      m.Rotolamento, m.Bullo, m.Sonnolalia, m.Dinamipugno, m.Docciascudo
    ],
    evolution: { stage: "base", to: [] }
  },
  "312": {
    name: "Minun",
    dexNumber: 312,
    type: ["Elettro"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Azione, m.Ruggito, m.Tuononda],
      10: [m.AttaccoRapido],
      13: [m.Altruismo],
      19: [m.Scintilla],
      22: [m.Ripeti],
      28: [m.Fascino],
      31: [m.Sottocarica],
      37: [m.Tuono],
      40: [m.Staffetta],
      47: [m.Agilita]
    },
    movesByMT: [
      m.Fulmine, m.Tuono, m.Tossina, m.Doppioteam, m.Schermoluce,
      m.Flash, m.Riposo, m.Protezione, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Codacciaio, m.Introforza, m.Pioggiadanza, m.Facciata,
      m.Forzasegreta, m.Ondashock, m.Falcecannone, m.Sostituto, m.Desiderio,
      m.Megapugno, m.Tuonopugno, m.Megacalcio, m.Corposcontro, m.Sdoppiatore,
      m.Contrattacco, m.MovimentoSismico, m.Tuononda, m.Mimica, m.Ricciolscudo,
      m.Metronomo, m.Comete, m.Russare, m.Fangosberla, m.Resistenza,
      m.Rotolamento, m.Bullo, m.Sonnolalia, m.Dinamipugno, m.Fangata
    ],
    evolution: { stage: "base", to: [] }
  },
  "313": {
    name: "Volbeat",
    dexNumber: 313,
    type: ["Coleottero"],
    gender: ["Maschio"],
    encounter: {
      rarity: "u",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Azione, m.Stordiraggio],
      9: [m.Doppioteam],
      13: [m.Lucelunare],
      17: [m.AttaccoRapido],
      21: [m.Codadiluce],
      25: [m.Segnoraggio],
      29: [m.Protezione],
      33: [m.Altruismo],
      37: [m.Sdoppiatore]
    },
    movesByMT: [
      m.Solarraggio, m.Fulmine, m.Tuono, m.Tossina, m.Doppioteam,
      m.Schermoluce, m.Flash, m.Riposo, m.Furto, m.Protezione,
      m.Gigassorbimento, m.Attrazione, m.Ritorno, m.Frustrazione, m.Introforza,
      m.Pioggiadanza, m.Giornodisole, m.PallaOmbra, m.Facciata, m.Centripugno,
      m.Breccia, m.Forzasegreta, m.Aeroassalto, m.Ondashock, m.Idropulsar,
      m.Staffetta, m.Raggiro, m.Ventargenteo, m.Megapugno, m.Gelopugno,
      m.Tuonopugno, m.Megacalcio, m.Corposcontro, m.Sdoppiatore, m.Contrattacco,
      m.MovimentoSismico, m.Tuononda, m.Mimica, m.Metronomo, m.Comete,
      m.Sostituto, m.Russare, m.Fangosberla, m.Resistenza, m.Bullo,
      m.Sonnolalia, m.Dinamipugno, m.Psicamisu
    ],
    evolution: { stage: "base", to: [] }
  },
  "314": {
    name: "Illumise",
    dexNumber: 314,
    type: ["Coleottero"],
    gender: ["Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Azione, m.Profumino],
      9: [m.Fascino],
      13: [m.Lucelunare],
      17: [m.AttaccoRapido],
      21: [m.Desiderio],
      25: [m.Ripeti],
      29: [m.Adulazione],
      33: [m.Altruismo],
      37: [m.Supplica]
    },
    movesByMT: [
      m.Solarraggio, m.Fulmine, m.Tuono, m.Tossina, m.Doppioteam,
      m.Schermoluce, m.Flash, m.Riposo, m.Furto, m.Protezione,
      m.Gigassorbimento, m.Attrazione, m.Ritorno, m.Frustrazione, m.Introforza,
      m.Pioggiadanza, m.Giornodisole, m.PallaOmbra, m.Facciata, m.Centripugno,
      m.Breccia, m.Forzasegreta, m.Aeroassalto, m.Ondashock, m.Idropulsar,
      m.Crescita, m.Staffetta, m.Ventargenteo, m.Megapugno, m.Gelopugno,
      m.Tuonopugno, m.Megacalcio, m.Corposcontro, m.Sdoppiatore, m.Contrattacco,
      m.MovimentoSismico, m.Tuononda, m.Mimica, m.Metronomo, m.Comete,
      m.Sostituto, m.Russare, m.Fangosberla, m.Resistenza, m.Bullo,
      m.Sonnolalia, m.Dinamipugno, m.Psicamisu
    ],
    evolution: { stage: "base", to: [] }
  },
  "315": {
    name: "Roselia",
    dexNumber: 315,
    type: ["Erba", "Veleno"],
    gender: ["Maschio", "Femmina"],
    spriteGendered: true,
    encounter: {
      rarity: "u",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Assorbimento, m.Crescita],
      9: [m.Velenospina],
      13: [m.Paralizzante],
      17: [m.Megassorbimento],
      21: [m.Parassiseme],
      25: [m.Fogliamagica],
      29: [m.Meloderba],
      33: [m.Gigassorbimento],
      37: [m.Profumino],
      41: [m.Radicamento],
      45: [m.Tossina],
      49: [m.Petalodanza],
      53: [m.Aromaterapia],
      57: [m.Sintesi]
    },
    movesByMT: [
      m.Taglio, m.Solarraggio, m.Tossina, m.Doppioteam, m.Flash,
      m.Riposo, m.Protezione, m.Fangobomba, m.Gigassorbimento, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Introforza, m.Giornodisole, m.PallaOmbra,
      m.Facciata, m.Forzasegreta, m.Semitraglia, m.Missilspillo, m.Cottonspora,
      m.Punte, m.Sintesi, m.Danzaspada, m.Corposcontro, m.Sdoppiatore,
      m.Mimica, m.Comete, m.Sostituto, m.Incubo, m.Russare,
      m.Fangosberla, m.Resistenza, m.Bullo, m.Tagliofuria, m.Sonnolalia,
      m.Psicamisu, m.Parassiseme, m.Dolcebacio, m.Meloderba, m.Fogliamagica
    ],
    evolution: { stage: "base", to: [] }
  },
  "316": {
    name: "Gulpin",
    dexNumber: 316,
    type: ["Veleno"],
    gender: ["Maschio", "Femmina"],
    spriteGendered: true,
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 36
    },
    exp: 50,
    movesByLevel: {
      5: [m.Botta],
      6: [m.Sbadiglio],
      9: [m.Velenogas],
      14: [m.Fango],
      17: [m.Amnesia],
      23: [m.Ripeti],
      28: [m.Tossina],
      34: [m.Accumulo, m.Sfoghenergia, m.Introenergia],
      39: [m.Fangobomba]
    },
    movesByMT: [
      m.Geloraggio, m.Forza, m.Solarraggio, m.Tossina, m.Doppioteam,
      m.Riposo, m.Protezione, m.Fangobomba, m.Gigassorbimento, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Giornodisole,
      m.PallaOmbra, m.Spaccaroccia, m.Facciata, m.Scippo, m.Forzasegreta,
      m.Semitraglia, m.Ondashock, m.Idropulsar, m.Smog, m.Mangiasogni,
      m.ScudoAcido, m.Malcomune, m.Fuocopugno, m.Gelopugno, m.Tuonopugno,
      m.Corposcontro, m.Sdoppiatore, m.Contrattacco, m.Mimica, m.Ricciolscudo,
      m.Autodistruzione, m.Esplosione, m.Sostituto, m.Incubo, m.Russare,
      m.Fangosberla, m.Resistenza, m.Rotolamento, m.Bullo, m.Sonnolalia,
      m.Dinamipugno, m.Canto, m.Fango
    ],
    evolution: { stage: "base", to: [{ species: "317", trigger: { kind: "level", level: 26 } }] }
  },
  "317": {
    name: "Swalot",
    dexNumber: 317,
    type: ["Veleno"],
    gender: ["Maschio", "Femmina"],
    spriteGendered: true,
    encounter: {
      rarity: "u",
      minLevel: 26,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Botta],
      6: [m.Sbadiglio],
      9: [m.Velenogas],
      14: [m.Fango],
      17: [m.Amnesia],
      23: [m.Ripeti],
      26: [m.Corposcontro],
      31: [m.Tossina],
      40: [m.Accumulo, m.Sfoghenergia, m.Introenergia],
      48: [m.Fangobomba]
    },
    movesByMT: [
      m.Geloraggio, m.IperRaggio, m.Forza, m.Solarraggio, m.Tossina,
      m.Doppioteam, m.Riposo, m.Protezione, m.Fangobomba, m.Gigassorbimento,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Introforza, m.Pioggiadanza,
      m.Giornodisole, m.PallaOmbra, m.Spaccaroccia, m.Facciata, m.Scippo,
      m.Forzasegreta, m.Semitraglia, m.Ondashock, m.Idropulsar, m.Smog,
      m.Mangiasogni, m.ScudoAcido, m.Malcomune, m.Fuocopugno, m.Gelopugno,
      m.Tuonopugno, m.Corposcontro, m.Sdoppiatore, m.Contrattacco, m.Mimica,
      m.Ricciolscudo, m.Autodistruzione, m.Esplosione, m.Sostituto, m.Incubo,
      m.Russare, m.Fangosberla, m.Resistenza, m.Rotolamento, m.Bullo,
      m.Sonnolalia, m.Dinamipugno, m.Canto, m.Fango
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "318": {
    name: "Carvanha",
    dexNumber: 318,
    type: ["Acqua", "Buio"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 40
    },
    exp: 50,
    movesByLevel: {
      5: [m.Fulmisguardo, m.Morso],
      7: [m.Ira],
      13: [m.Focalenergia],
      16: [m.Visotruce],
      22: [m.Sgranocchio],
      28: [m.Stridio],
      31: [m.Riduttore],
      37: [m.Bullo],
      43: [m.Agilita]
    },
    movesByMT: [
      m.Surf, m.Geloraggio, m.Bora, m.Tossina, m.Doppioteam,
      m.Cascata, m.Riposo, m.Furto, m.Protezione, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Grandine,
      m.Attaccalite, m.Facciata, m.Provocazione, m.Forzasegreta, m.Sub,
      m.Idropulsar, m.Colpo, m.Sdoppiatore, m.Idropompa, m.Mimica,
      m.Comete, m.Sostituto, m.Russare, m.Fangosberla, m.Ventogelato,
      m.Resistenza, m.Bullo, m.Tagliofuria, m.Sonnolalia, m.Morso,
      m.Visotruce, m.Rinfrescata
    ],
    evolution: { stage: "base", to: [{ species: "319", trigger: { kind: "level", level: 30 } }] }
  },
  "319": {
    name: "Sharpedo",
    dexNumber: 319,
    type: ["Acqua", "Buio"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 30,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Fulmisguardo, m.Morso],
      7: [m.Ira],
      13: [m.Focalenergia],
      16: [m.Visotruce],
      22: [m.Sgranocchio],
      28: [m.Stridio],
      33: [m.Lacerazione],
      38: [m.Provocazione],
      43: [m.Bullo],
      48: [m.Capocciata],
      53: [m.Agilita]
    },
    movesByMT: [
      m.Boato, m.Surf, m.Geloraggio, m.Bora, m.IperRaggio,
      m.Forza, m.Terremoto, m.Tossina, m.Doppioteam, m.Cascata,
      m.Riposo, m.Furto, m.Protezione, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Spaccaroccia, m.Grandine,
      m.Attaccalite, m.Facciata, m.Provocazione, m.Forzasegreta, m.Sub,
      m.Rocciotomba, m.Idropulsar, m.Colpo, m.Sdoppiatore, m.Idropompa,
      m.Mimica, m.Comete, m.Sostituto, m.Russare, m.Fangosberla,
      m.Ventogelato, m.Resistenza, m.Bullo, m.Tagliofuria, m.Sonnolalia,
      m.Morso, m.Visotruce, m.Rinfrescata
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "320": {
    name: "Wailmer",
    dexNumber: 320,
    type: ["Acqua"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 50
    },
    exp: 50,
    movesByLevel: {
      5: [m.Pistolacqua, m.Splash, m.Ruggito],
      14: [m.Rotolamento],
      19: [m.Mulinello],
      23: [m.Sgomento],
      28: [m.Idropulsar],
      32: [m.Nebbia],
      37: [m.Riposo],
      41: [m.Zampillo],
      46: [m.Amnesia],
      50: [m.Idropompa]
    },
    movesByMT: [
      m.Boato, m.Surf, m.Geloraggio, m.Bora, m.Forza,
      m.Terremoto, m.Tossina, m.Doppioteam, m.Cascata, m.Riposo,
      m.Protezione, m.Attrazione, m.Ritorno, m.Frustrazione, m.Introforza,
      m.Pioggiadanza, m.Spaccaroccia, m.Grandine, m.Facciata, m.Forzasegreta,
      m.Sub, m.Rocciotomba, m.Idropulsar, m.Colpo, m.Sdoppiatore,
      m.Abisso, m.Russare, m.Maledizione, m.Bullo, m.Sonnolalia,
      m.Solletico, m.Corposcontro, m.Mimica, m.Ricciolscudo, m.Autodistruzione,
      m.Sostituto, m.Ventogelato, m.Resistenza, m.Rotolamento
    ],
    evolution: { stage: "base", to: [{ species: "321", trigger: { kind: "level", level: 40 } }] }
  },
  "321": {
    name: "Wailord",
    dexNumber: 321,
    type: ["Acqua"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Ruggito, m.Pistolacqua, m.Splash],
      14: [m.Rotolamento],
      19: [m.Mulinello],
      23: [m.Sgomento],
      28: [m.Idropulsar],
      32: [m.Nebbia],
      37: [m.Riposo],
      44: [m.Zampillo],
      52: [m.Amnesia],
      59: [m.Idropompa]
    },
    movesByMT: [
      m.Boato, m.Surf, m.Geloraggio, m.Bora, m.IperRaggio,
      m.Forza, m.Terremoto, m.Tossina, m.Doppioteam, m.Cascata,
      m.Riposo, m.Protezione, m.Attrazione, m.Ritorno, m.Frustrazione,
      m.Introforza, m.Pioggiadanza, m.Spaccaroccia, m.Grandine, m.Facciata,
      m.Forzasegreta, m.Sub, m.Rocciotomba, m.Idropulsar, m.Colpo,
      m.Sdoppiatore, m.Abisso, m.Russare, m.Maledizione, m.Bullo,
      m.Sonnolalia, m.Solletico, m.Corposcontro, m.Mimica, m.Ricciolscudo,
      m.Autodistruzione, m.Sostituto, m.Ventogelato, m.Resistenza, m.Rotolamento
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "322": {
    name: "Numel",
    dexNumber: 322,
    type: ["Fuoco", "Terra"],
    gender: ["Maschio", "Femmina"],
    spriteGendered: true,
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 43
    },
    exp: 50,
    movesByLevel: {
      5: [m.Azione, m.Ruggito],
      11: [m.Braciere],
      19: [m.Magnitudo],
      25: [m.Focalenergia],
      29: [m.Riduttore],
      31: [m.Amnesia],
      35: [m.Terremoto],
      41: [m.Lanciafiamme],
      49: [m.Sdoppiatore]
    },
    movesByMT: [
      m.Lanciafiamme, m.Forza, m.Terremoto, m.Fossa, m.Tossina,
      m.Doppioteam, m.Fuocobomba, m.Riposo, m.Protezione, m.Terrempesta,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Introforza, m.Giornodisole,
      m.Spaccaroccia, m.Facciata, m.Forzasegreta, m.Vampata, m.Rocciotomba,
      m.Pestone, m.Corposcontro, m.Ricciolscudo, m.Visotruce, m.Rotolamento,
      m.Gridodilotta, m.Sdoppiatore, m.Mimica, m.Frana, m.Sostituto,
      m.Russare, m.Fangosberla, m.Resistenza, m.Bullo, m.Sonnolalia,
      m.Riduttore, m.Braciere, m.Fascino
    ],
    evolution: { stage: "base", to: [{ species: "323", trigger: { kind: "level", level: 33 } }] }
  },
  "323": {
    name: "Camerupt",
    dexNumber: 323,
    type: ["Fuoco", "Terra"],
    gender: ["Maschio", "Femmina"],
    spriteGendered: true,
    encounter: {
      rarity: "r",
      minLevel: 33,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Azione, m.Ruggito],
      11: [m.Braciere],
      19: [m.Magnitudo],
      25: [m.Focalenergia],
      29: [m.Riduttore],
      31: [m.Amnesia],
      33: [m.Frana],
      37: [m.Terremoto],
      45: [m.Eruzione],
      55: [m.Abisso]
    },
    movesByMT: [
      m.Boato, m.Lanciafiamme, m.IperRaggio, m.Forza, m.Terremoto,
      m.Fossa, m.Tossina, m.Doppioteam, m.Fuocobomba, m.Riposo,
      m.Protezione, m.Terrempesta, m.Attrazione, m.Ritorno, m.Frustrazione,
      m.Introforza, m.Giornodisole, m.Spaccaroccia, m.Facciata, m.Forzasegreta,
      m.Vampata, m.Rocciotomba, m.Pestone, m.Corposcontro, m.Ricciolscudo,
      m.Visotruce, m.Rotolamento, m.Gridodilotta, m.Sdoppiatore, m.Mimica,
      m.Autodistruzione, m.Esplosione, m.Frana, m.Sostituto, m.Russare,
      m.Fangosberla, m.Resistenza, m.Bullo, m.Sonnolalia, m.Riduttore,
      m.Braciere, m.Fascino
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "324": {
    name: "Torkoal",
    dexNumber: 324,
    type: ["Fuoco"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Braciere, m.Smog],
      7: [m.Maledizione],
      14: [m.MurodiFumo],
      17: [m.Turbofuoco],
      20: [m.Corposcontro],
      27: [m.Protezione],
      30: [m.Lanciafiamme],
      33: [m.Ferroscudo],
      40: [m.Amnesia],
      43: [m.Flagello],
      46: [m.Ondacalda]
    },
    movesByMT: [
      m.Lanciafiamme, m.Forza, m.Tossina, m.Doppioteam, m.Fuocobomba,
      m.Riposo, m.Protezione, m.Fangobomba, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Codacciaio, m.Introforza, m.Giornodisole, m.Spaccaroccia,
      m.Facciata, m.Forzasegreta, m.Vampata, m.Resistenza, m.Sonnolalia,
      m.Sbadiglio, m.Eruzione, m.Corposcontro, m.Sdoppiatore, m.Mimica,
      m.Autodistruzione, m.Esplosione, m.Frana, m.Sostituto, m.Russare,
      m.Fangosberla, m.Bullo
    ],
    evolution: { stage: "base", to: [] }
  },
  "325": {
    name: "Spoink",
    dexNumber: 325,
    type: ["Psico"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 42
    },
    exp: 50,
    movesByLevel: {
      5: [m.Botta, m.Splash],
      7: [m.Psiconda],
      10: [m.Segugio],
      16: [m.Psicoraggio],
      19: [m.Psicamisu],
      25: [m.Stordiraggio],
      28: [m.Magivelo],
      34: [m.Psichico],
      37: [m.Riposo, m.Russare],
      43: [m.Rimbalzo]
    },
    movesByMT: [
      m.Tossina, m.Psichico, m.Doppioteam, m.Schermoluce, m.Riflesso,
      m.Flash, m.Riposo, m.Furto, m.Protezione, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Codacciaio, m.Introforza, m.Pioggiadanza,
      m.Giornodisole, m.PallaOmbra, m.Attaccalite, m.Facciata, m.Provocazione,
      m.Scippo, m.Forzasegreta, m.Calmamente, m.Ondashock, m.Sostituto,
      m.Divinazione, m.Raggiro, m.Extrasenso, m.Corposcontro, m.Sdoppiatore,
      m.Mimica, m.Comete, m.Mangiasogni, m.Russare, m.Ventogelato,
      m.Resistenza, m.Bullo, m.Sonnolalia, m.Psicamisu, m.Baraonda
    ],
    evolution: { stage: "base", to: [{ species: "326", trigger: { kind: "level", level: 32 } }] }
  },
  "326": {
    name: "Grumpig",
    dexNumber: 326,
    type: ["Psico"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 32,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Psiconda, m.Splash],
      10: [m.Segugio],
      16: [m.Psicoraggio],
      19: [m.Psicamisu],
      25: [m.Stordiraggio],
      28: [m.Magivelo],
      37: [m.Psichico],
      43: [m.Riposo, m.Russare],
      55: [m.Rimbalzo]
    },
    movesByMT: [
      m.IperRaggio, m.Tossina, m.Psichico, m.Doppioteam, m.Schermoluce,
      m.Riflesso, m.Flash, m.Riposo, m.Furto, m.Protezione,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Codacciaio, m.Introforza,
      m.Pioggiadanza, m.Giornodisole, m.PallaOmbra, m.Attaccalite, m.Facciata,
      m.Centripugno, m.Provocazione, m.Scippo, m.Forzasegreta, m.Calmamente,
      m.Ondashock, m.Sostituto, m.Divinazione, m.Raggiro, m.Extrasenso,
      m.Megapugno, m.Fuocopugno, m.Gelopugno, m.Tuonopugno, m.Megacalcio,
      m.Corposcontro, m.Sdoppiatore, m.Contrattacco, m.MovimentoSismico, m.Mimica,
      m.Comete, m.Mangiasogni, m.Russare, m.Fangosberla, m.Ventogelato,
      m.Resistenza, m.Bullo, m.Sonnolalia, m.Dinamipugno, m.Psicamisu,
      m.Baraonda
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "327": {
    name: "Spinda",
    dexNumber: 327,
    type: ["Normale"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Azione, m.Baraonda],
      12: [m.Finta],
      16: [m.Psicoraggio],
      23: [m.Ipnosi],
      27: [m.Stordipugno],
      34: [m.Strampadanza],
      38: [m.Psicamisu],
      45: [m.Sdoppiatore],
      49: [m.Flagello],
      56: [m.Colpo]
    },
    movesByMT: [
      m.Forza, m.Fossa, m.Tossina, m.Psichico, m.Doppioteam,
      m.Flash, m.Riposo, m.Furto, m.Protezione, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Salvaguardia, m.Introforza, m.Pioggiadanza,
      m.Giornodisole, m.PallaOmbra, m.Spaccaroccia, m.Facciata, m.Centripugno,
      m.Breccia, m.Scippo, m.Forzasegreta, m.Rocciotomba, m.Calmamente,
      m.Ondashock, m.Idropulsar, m.Inibitore, m.Frana, m.Staffetta,
      m.Ripeti, m.Maniereforti, m.Raggiro, m.Desiderio, m.Assistente,
      m.Megapugno, m.Fuocopugno, m.Gelopugno, m.Tuonopugno, m.Megacalcio,
      m.Corposcontro, m.Sdoppiatore, m.Contrattacco, m.MovimentoSismico, m.Mimica,
      m.Ricciolscudo, m.Metronomo, m.Comete, m.Mangiasogni, m.Sostituto,
      m.Incubo, m.Russare, m.Fangosberla, m.Ventogelato, m.Resistenza,
      m.Rotolamento, m.Bullo, m.Sonnolalia, m.Dinamipugno, m.Psicamisu,
      m.Canto
    ],
    evolution: { stage: "base", to: [] }
  },
  "328": {
    name: "Trapinch",
    dexNumber: 328,
    type: ["Terra"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 40
    },
    exp: 50,
    movesByLevel: {
      5: [m.Morso],
      9: [m.Turbosabbia],
      17: [m.Finta],
      25: [m.Sabbiotomba],
      33: [m.Sgranocchio],
      41: [m.Fossa],
      49: [m.Terrempesta],
      57: [m.IperRaggio]
    },
    movesByMT: [
      m.IperRaggio, m.Forza, m.Solarraggio, m.Terremoto, m.Fossa,
      m.Tossina, m.Doppioteam, m.Riposo, m.Protezione, m.Terrempesta,
      m.Gigassorbimento, m.Attrazione, m.Ritorno, m.Frustrazione, m.Introforza,
      m.Giornodisole, m.Spaccaroccia, m.Facciata, m.Forzasegreta, m.Rocciotomba,
      m.Raffica, m.AttaccoRapido, m.Focalenergia, m.Corposcontro, m.Sdoppiatore,
      m.Mimica, m.Frana, m.Sostituto, m.Russare, m.Fangosberla,
      m.Resistenza, m.Bullo, m.Sonnolalia
    ],
    evolution: { stage: "base", to: [{ species: "329", trigger: { kind: "level", level: 35 } }] }
  },
  "329": {
    name: "Vibrava",
    dexNumber: 329,
    type: ["Terra", "Drago"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 35,
      maxLevel: 55
    },
    exp: 100,
    movesByLevel: {
      5: [m.Morso],
      9: [m.Turbosabbia],
      17: [m.Finta],
      25: [m.Sabbiotomba],
      33: [m.Sgranocchio],
      35: [m.Dragospiro],
      41: [m.Stridio],
      49: [m.Terrempesta],
      57: [m.IperRaggio]
    },
    movesByMT: [
      m.Volo, m.IperRaggio, m.Forza, m.Solarraggio, m.Terremoto,
      m.Fossa, m.Tossina, m.Doppioteam, m.Riposo, m.Protezione,
      m.Terrempesta, m.Gigassorbimento, m.Alacciaio, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Introforza, m.Giornodisole, m.Spaccaroccia, m.Facciata,
      m.Forzasegreta, m.Rocciotomba, m.Raffica, m.AttaccoRapido, m.Focalenergia,
      m.Corposcontro, m.Sdoppiatore, m.Mimica, m.Comete, m.Frana,
      m.Sostituto, m.Russare, m.Fangosberla, m.Resistenza, m.Bullo,
      m.Sonnolalia
    ],
    evolution: { stage: "stage1", to: [{ species: "330", trigger: { kind: "level", level: 45 } }] }
  },
  "330": {
    name: "Flygon",
    dexNumber: 330,
    type: ["Terra", "Drago"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 45,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.Morso],
      9: [m.Turbosabbia],
      17: [m.Finta],
      25: [m.Sabbiotomba],
      33: [m.Sgranocchio],
      35: [m.Dragospiro],
      41: [m.Stridio],
      53: [m.Terrempesta],
      65: [m.IperRaggio]
    },
    movesByMT: [
      m.Volo, m.Lanciafiamme, m.IperRaggio, m.Forza, m.Solarraggio,
      m.Terremoto, m.Fossa, m.Tossina, m.Doppioteam, m.Fuocobomba,
      m.Riposo, m.Protezione, m.Terrempesta, m.Gigassorbimento, m.Alacciaio,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Codacciaio, m.Introforza,
      m.Giornodisole, m.Spaccaroccia, m.Facciata, m.Forzasegreta, m.Rocciotomba,
      m.Dragartigli, m.Falcecannone, m.Raffica, m.AttaccoRapido, m.Focalenergia,
      m.Fuocopugno, m.Corposcontro, m.Sdoppiatore, m.Mimica, m.Comete,
      m.Frana, m.Sostituto, m.Russare, m.Fangosberla, m.Resistenza,
      m.Bullo, m.Tagliofuria, m.Sonnolalia
    ],
    evolution: { stage: "stage2", to: [] }
  },
  "331": {
    name: "Cacnea",
    dexNumber: 331,
    type: ["Erba"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 42
    },
    exp: 50,
    movesByLevel: {
      5: [m.Velenospina, m.Fulmisguardo, m.Assorbimento],
      9: [m.Crescita],
      13: [m.Parassiseme],
      17: [m.Turbosabbia],
      21: [m.Missilspillo],
      25: [m.Radicamento],
      29: [m.Finta],
      33: [m.Punte],
      37: [m.Pugnospine],
      41: [m.Cottonspora],
      45: [m.Terrempesta],
      49: [m.Destinobbligato]
    },
    movesByMT: [
      m.Taglio, m.Solarraggio, m.Tossina, m.Doppioteam, m.Flash,
      m.Riposo, m.Protezione, m.Terrempesta, m.Gigassorbimento, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Introforza, m.Giornodisole, m.Facciata,
      m.Centripugno, m.Forzasegreta, m.Semitraglia, m.Acido, m.Contrattacco,
      m.Dinamipugno, m.Strampadanza, m.Meloderba, m.Megapugno, m.Tuonopugno,
      m.Danzaspada, m.Corposcontro, m.Sdoppiatore, m.MovimentoSismico, m.Mimica,
      m.Sostituto, m.Russare, m.Fangosberla, m.Resistenza, m.Bullo,
      m.Tagliofuria, m.Sonnolalia, m.Ripeti
    ],
    evolution: { stage: "base", to: [{ species: "332", trigger: { kind: "level", level: 32 } }] }
  },
  "332": {
    name: "Cacturne",
    dexNumber: 332,
    type: ["Erba", "Buio"],
    gender: ["Maschio", "Femmina"],
    spriteGendered: true,
    encounter: {
      rarity: "r",
      minLevel: 32,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Velenospina, m.Fulmisguardo, m.Assorbimento, m.Vendetta],
      9: [m.Crescita],
      13: [m.Parassiseme],
      17: [m.Turbosabbia],
      21: [m.Missilspillo],
      25: [m.Radicamento],
      29: [m.Finta],
      35: [m.Punte],
      41: [m.Pugnospine],
      47: [m.Cottonspora],
      53: [m.Terrempesta],
      59: [m.Destinobbligato]
    },
    movesByMT: [
      m.Taglio, m.IperRaggio, m.Forza, m.Solarraggio, m.Tossina,
      m.Doppioteam, m.Flash, m.Riposo, m.Protezione, m.Terrempesta,
      m.Gigassorbimento, m.Attrazione, m.Ritorno, m.Frustrazione, m.Introforza,
      m.Giornodisole, m.Facciata, m.Centripugno, m.Forzasegreta, m.Semitraglia,
      m.Acido, m.Contrattacco, m.Dinamipugno, m.Strampadanza, m.Meloderba,
      m.Megapugno, m.Tuonopugno, m.Danzaspada, m.Megacalcio, m.Corposcontro,
      m.Sdoppiatore, m.MovimentoSismico, m.Mimica, m.Sostituto, m.Russare,
      m.Fangosberla, m.Resistenza, m.Bullo, m.Tagliofuria, m.Sonnolalia,
      m.Ripeti
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "333": {
    name: "Swablu",
    dexNumber: 333,
    type: ["Normale", "Volante"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 45
    },
    exp: 50,
    movesByLevel: {
      5: [m.Ruggito, m.Beccata],
      8: [m.Sgomento],
      11: [m.Canto],
      18: [m.Furia],
      21: [m.Salvaguardia],
      28: [m.Nebbia],
      31: [m.Riduttore],
      38: [m.Speculmossa],
      41: [m.Rinfrescata],
      48: [m.Ultimocanto]
    },
    movesByMT: [
      m.Volo, m.Geloraggio, m.Solarraggio, m.Tossina, m.Doppioteam,
      m.Riposo, m.Furto, m.Protezione, m.Alacciaio, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Salvaguardia, m.Introforza, m.Pioggiadanza,
      m.Giornodisole, m.Facciata, m.Forzasegreta, m.Aeroassalto, m.Agilita,
      m.Ira, m.Nube, m.Inseguimento, m.Corposcontro, m.Sdoppiatore,
      m.Mimica, m.Comete, m.Mangiasogni, m.Aeroattacco, m.Sostituto,
      m.Russare, m.Fangosberla, m.Resistenza, m.Bullo, m.Sonnolalia,
      m.Psicamisu, m.Falsofinale
    ],
    evolution: { stage: "base", to: [{ species: "334", trigger: { kind: "level", level: 35 } }] }
  },
  "334": {
    name: "Altaria",
    dexNumber: 334,
    type: ["Drago", "Volante"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 35,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Ruggito, m.Beccata],
      8: [m.Sgomento],
      11: [m.Canto],
      18: [m.Furia],
      21: [m.Salvaguardia],
      28: [m.Nebbia],
      31: [m.Riduttore],
      35: [m.Dragospiro],
      40: [m.Dragodanza],
      45: [m.Rinfrescata],
      54: [m.Ultimocanto],
      59: [m.Aeroattacco]
    },
    movesByMT: [
      m.Volo, m.Boato, m.Lanciafiamme, m.Geloraggio, m.IperRaggio,
      m.Solarraggio, m.Terremoto, m.Tossina, m.Doppioteam, m.Fuocobomba,
      m.Riposo, m.Furto, m.Protezione, m.Alacciaio, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Salvaguardia, m.Codacciaio, m.Introforza,
      m.Pioggiadanza, m.Giornodisole, m.Spaccaroccia, m.Facciata, m.Forzasegreta,
      m.Aeroassalto, m.Dragartigli, m.Agilita, m.Ira, m.Nube,
      m.Inseguimento, m.Corposcontro, m.Sdoppiatore, m.Mimica, m.Comete,
      m.Mangiasogni, m.Aeroattacco, m.Sostituto, m.Russare, m.Fangosberla,
      m.Resistenza, m.Bullo, m.Sonnolalia, m.Psicamisu, m.Rintoccasana,
      m.Dragospiro, m.Falsofinale
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "335": {
    name: "Zangoose",
    dexNumber: 335,
    type: ["Normale"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Graffio, m.Fulmisguardo],
      7: [m.AttaccoRapido],
      10: [m.Danzaspada],
      13: [m.Tagliofuria],
      19: [m.Lacerazione],
      25: [m.Inseguimento],
      31: [m.Tritartigli],
      37: [m.Provocazione],
      46: [m.Individua],
      55: [m.Falsofinale]
    },
    movesByMT: [
      m.Boato, m.Lanciafiamme, m.Geloraggio, m.Bora, m.Forza,
      m.Solarraggio, m.Fulmine, m.Tuono, m.Fossa, m.Tossina,
      m.Doppioteam, m.Fuocobomba, m.Riposo, m.Furto, m.Protezione,
      m.Gigassorbimento, m.Attrazione, m.Ritorno, m.Frustrazione, m.Codacciaio,
      m.Introforza, m.Pioggiadanza, m.Giornodisole, m.PallaOmbra, m.Spaccaroccia,
      m.Facciata, m.Centripugno, m.Provocazione, m.Breccia, m.Forzasegreta,
      m.Aeroassalto, m.Ondashock, m.Idropulsar, m.Ventagliente, m.Doppiocalcio,
      m.Contrattacco, m.Maledizione, m.Flagello, m.Megapugno, m.Fuocopugno,
      m.Gelopugno, m.Tuonopugno, m.Danzaspada, m.Megacalcio, m.Corposcontro,
      m.Sdoppiatore, m.MovimentoSismico, m.Tuononda, m.Mimica, m.Ricciolscudo,
      m.Comete, m.Frana, m.Sostituto, m.Russare, m.Fangosberla,
      m.Ventogelato, m.Resistenza, m.Rotolamento, m.Bullo, m.Tagliofuria,
      m.Sonnolalia, m.Dinamipugno, m.Rinfrescata, m.Tritartigli
    ],
    evolution: { stage: "base", to: [] }
  },
  "336": {
    name: "Seviper",
    dexNumber: 336,
    type: ["Veleno"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Avvolgibotta],
      7: [m.Leccata],
      10: [m.Morso],
      16: [m.Velenocoda],
      19: [m.Stridio],
      25: [m.SguardoFeroce],
      28: [m.Sgranocchio],
      34: [m.Velenodenti],
      37: [m.Bullo],
      43: [m.Nube]
    },
    movesByMT: [
      m.Lanciafiamme, m.Forza, m.Terremoto, m.Fossa, m.Tossina,
      m.Doppioteam, m.Riposo, m.Furto, m.Protezione, m.Fangobomba,
      m.Gigassorbimento, m.Attrazione, m.Ritorno, m.Frustrazione, m.Codacciaio,
      m.Introforza, m.Pioggiadanza, m.Giornodisole, m.Spaccaroccia, m.Facciata,
      m.Provocazione, m.Scippo, m.Forzasegreta, m.Corposcontro, m.Accumulo,
      m.Sfoghenergia, m.Introenergia, m.Sdoppiatore, m.Mimica, m.Comete,
      m.Sostituto, m.Russare, m.Fangosberla, m.Resistenza, m.Bullo,
      m.Tagliofuria, m.Sonnolalia
    ],
    evolution: { stage: "base", to: [] }
  },
  "337": {
    name: "Lunatone",
    dexNumber: 337,
    type: ["Roccia", "Psico"],
    gender: [],
    encounter: {
      rarity: "r",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Azione, m.Rafforzatore],
      7: [m.Confusione],
      13: [m.Sassata],
      19: [m.Ipnosi],
      25: [m.Psiconda],
      31: [m.Cosmoforza],
      37: [m.Psichico],
      43: [m.Divinazione],
      49: [m.Esplosione]
    },
    movesByMT: [
      m.Geloraggio, m.IperRaggio, m.Terremoto, m.Tossina, m.Psichico,
      m.Doppioteam, m.Schermoluce, m.Riflesso, m.Flash, m.Riposo,
      m.Protezione, m.Terrempesta, m.Ritorno, m.Frustrazione, m.Salvaguardia,
      m.Introforza, m.Pioggiadanza, m.PallaOmbra, m.Facciata, m.Forzasegreta,
      m.Rocciotomba, m.Calmamente, m.Falcecannone, m.Corposcontro, m.Sdoppiatore,
      m.Mimica, m.Ricciolscudo, m.Autodistruzione, m.Comete, m.Mangiasogni,
      m.Esplosione, m.Frana, m.Sostituto, m.Russare, m.Resistenza,
      m.Rotolamento, m.Bullo, m.Sonnolalia, m.Psicamisu, m.Staffetta
    ],
    evolution: { stage: "base", to: [] }
  },
  "338": {
    name: "Solrock",
    dexNumber: 338,
    type: ["Roccia", "Psico"],
    gender: [],
    encounter: {
      rarity: "r",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Azione, m.Rafforzatore],
      7: [m.Confusione],
      13: [m.Sassata],
      19: [m.Turbofuoco],
      25: [m.Psiconda],
      31: [m.Cosmoforza],
      37: [m.Frana],
      43: [m.Solarraggio],
      49: [m.Esplosione]
    },
    movesByMT: [
      m.Lanciafiamme, m.IperRaggio, m.Solarraggio, m.Terremoto, m.Tossina,
      m.Psichico, m.Doppioteam, m.Schermoluce, m.Riflesso, m.Fuocobomba,
      m.Flash, m.Riposo, m.Protezione, m.Terrempesta, m.Ritorno,
      m.Frustrazione, m.Salvaguardia, m.Introforza, m.Giornodisole, m.PallaOmbra,
      m.Facciata, m.Forzasegreta, m.Vampata, m.Rocciotomba, m.Calmamente,
      m.Falcecannone, m.Corposcontro, m.Sdoppiatore, m.Mimica, m.Ricciolscudo,
      m.Autodistruzione, m.Comete, m.Mangiasogni, m.Esplosione, m.Frana,
      m.Sostituto, m.Russare, m.Resistenza, m.Rotolamento, m.Bullo,
      m.Sonnolalia, m.Psicamisu, m.Staffetta, m.Cosmoforza
    ],
    evolution: { stage: "base", to: [] }
  },
  "339": {
    name: "Barboach",
    dexNumber: 339,
    type: ["Acqua", "Terra"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 40
    },
    exp: 50,
    movesByLevel: {
      5: [m.Fangosberla],
      6: [m.Fangata, m.Docciascudo],
      11: [m.Pistolacqua],
      16: [m.Magnitudo],
      21: [m.Amnesia],
      26: [m.Riposo, m.Russare],
      31: [m.Terremoto],
      36: [m.Divinazione],
      41: [m.Abisso]
    },
    movesByMT: [
      m.Surf, m.Geloraggio, m.Bora, m.Terremoto, m.Tossina,
      m.Doppioteam, m.Cascata, m.Riposo, m.Protezione, m.Terrempesta,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Introforza, m.Pioggiadanza,
      m.Grandine, m.Facciata, m.Forzasegreta, m.Sub, m.Rocciotomba,
      m.Idropulsar, m.Colpo, m.Scintilla, m.Mulinello, m.Sdoppiatore,
      m.Mimica, m.Sostituto, m.Russare, m.Fangosberla, m.Ventogelato,
      m.Resistenza, m.Bullo, m.Sonnolalia
    ],
    evolution: { stage: "base", to: [{ species: "340", trigger: { kind: "level", level: 30 } }] }
  },
  "340": {
    name: "Whiscash",
    dexNumber: 340,
    type: ["Acqua", "Terra"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 30,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Fangosberla, m.Solletico],
      6: [m.Fangata, m.Docciascudo],
      11: [m.Pistolacqua],
      16: [m.Magnitudo],
      21: [m.Amnesia],
      26: [m.Riposo, m.Russare],
      36: [m.Terremoto],
      46: [m.Divinazione],
      56: [m.Abisso]
    },
    movesByMT: [
      m.Surf, m.Geloraggio, m.Bora, m.IperRaggio, m.Forza,
      m.Terremoto, m.Tossina, m.Doppioteam, m.Cascata, m.Riposo,
      m.Protezione, m.Terrempesta, m.Attrazione, m.Ritorno, m.Frustrazione,
      m.Introforza, m.Pioggiadanza, m.Spaccaroccia, m.Grandine, m.Facciata,
      m.Forzasegreta, m.Sub, m.Rocciotomba, m.Idropulsar, m.Colpo,
      m.Scintilla, m.Mulinello, m.Sdoppiatore, m.Mimica, m.Frana,
      m.Sostituto, m.Russare, m.Fangosberla, m.Ventogelato, m.Resistenza,
      m.Bullo, m.Sonnolalia
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "341": {
    name: "Corphish",
    dexNumber: 341,
    type: ["Acqua"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 40
    },
    exp: 50,
    movesByLevel: {
      5: [m.Bolla],
      7: [m.Rafforzatore],
      10: [m.Presa],
      13: [m.Fulmisguardo],
      19: [m.Bollaraggio],
      22: [m.Protezione],
      25: [m.Privazione],
      31: [m.Provocazione],
      34: [m.Martellata],
      37: [m.Danzaspada],
      43: [m.Sgranocchio],
      46: [m.Ghigliottina]
    },
    movesByMT: [
      m.Taglio, m.Surf, m.Geloraggio, m.Bora, m.Forza,
      m.Fossa, m.Tossina, m.Doppioteam, m.Cascata, m.Riposo,
      m.Protezione, m.Fangobomba, m.Attrazione, m.Ritorno, m.Frustrazione,
      m.Introforza, m.Pioggiadanza, m.Spaccaroccia, m.Grandine, m.Facciata,
      m.Provocazione, m.Breccia, m.Forzasegreta, m.Rocciotomba, m.Aeroassalto,
      m.Idropulsar, m.Corposcontro, m.Forzantica, m.Rimonta, m.Fangata,
      m.Danzaspada, m.Sdoppiatore, m.Contrattacco, m.Mimica, m.Sostituto,
      m.Russare, m.Fangosberla, m.Ventogelato, m.Resistenza, m.Bullo,
      m.Tagliofuria, m.Sonnolalia, m.Docciascudo
    ],
    evolution: { stage: "base", to: [{ species: "342", trigger: { kind: "level", level: 30 } }] }
  },
  "342": {
    name: "Crawdaunt",
    dexNumber: 342,
    type: ["Acqua", "Buio"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 30,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Bolla],
      7: [m.Rafforzatore],
      10: [m.Presa],
      13: [m.Fulmisguardo],
      19: [m.Bollaraggio],
      22: [m.Protezione],
      25: [m.Privazione],
      33: [m.Provocazione],
      38: [m.Martellata],
      43: [m.Danzaspada],
      51: [m.Sgranocchio],
      56: [m.Ghigliottina],
      60: [m.Inseguimento]
    },
    movesByMT: [
      m.Taglio, m.Surf, m.Geloraggio, m.Bora, m.IperRaggio,
      m.Forza, m.Fossa, m.Tossina, m.Doppioteam, m.Cascata,
      m.Riposo, m.Protezione, m.Fangobomba, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Spaccaroccia, m.Grandine,
      m.Facciata, m.Provocazione, m.Breccia, m.Forzasegreta, m.Sub,
      m.Rocciotomba, m.Aeroassalto, m.Idropulsar, m.Corposcontro, m.Forzantica,
      m.Rimonta, m.Fangata, m.Danzaspada, m.Sdoppiatore, m.Contrattacco,
      m.Mimica, m.Comete, m.Sostituto, m.Russare, m.Fangosberla,
      m.Ventogelato, m.Resistenza, m.Bullo, m.Tagliofuria, m.Sonnolalia,
      m.Docciascudo
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "343": {
    name: "Baltoy",
    dexNumber: 343,
    type: ["Terra", "Psico"],
    gender: [],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 46
    },
    exp: 50,
    movesByLevel: {
      5: [m.Confusione, m.Rapigiro, m.Rafforzatore],
      7: [m.Fangosberla],
      11: [m.Psicoraggio],
      15: [m.Rocciotomba],
      19: [m.Autodistruzione],
      25: [m.Forzantica],
      31: [m.Terrempesta],
      37: [m.Cosmoforza],
      45: [m.Esplosione]
    },
    movesByMT: [
      m.Geloraggio, m.Solarraggio, m.Terremoto, m.Fossa, m.Tossina,
      m.Psichico, m.Doppioteam, m.Schermoluce, m.Riflesso, m.Flash,
      m.Riposo, m.Protezione, m.Terrempesta, m.Ritorno, m.Frustrazione,
      m.Introforza, m.Pioggiadanza, m.Giornodisole, m.PallaOmbra, m.Facciata,
      m.Forzasegreta, m.Rocciotomba, m.Sdoppiatore, m.Mimica, m.Autodistruzione,
      m.Mangiasogni, m.Esplosione, m.Frana, m.Sostituto, m.Russare,
      m.Fangosberla, m.Resistenza, m.Bullo, m.Sonnolalia, m.Psicamisu,
      m.Psicoraggio, m.Rinfrescata
    ],
    evolution: { stage: "base", to: [{ species: "344", trigger: { kind: "level", level: 36 } }] }
  },
  "344": {
    name: "Claydol",
    dexNumber: 344,
    type: ["Terra", "Psico"],
    gender: [],
    encounter: {
      rarity: "u",
      minLevel: 36,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Confusione, m.Teletrasporto, m.Rafforzatore, m.Rapigiro],
      7: [m.Fangosberla],
      11: [m.Psicoraggio],
      15: [m.Rocciotomba],
      19: [m.Autodistruzione],
      25: [m.Forzantica],
      31: [m.Terrempesta],
      36: [m.IperRaggio],
      42: [m.Cosmoforza],
      55: [m.Esplosione]
    },
    movesByMT: [
      m.Geloraggio, m.IperRaggio, m.Forza, m.Solarraggio, m.Terremoto,
      m.Fossa, m.Tossina, m.Psichico, m.Doppioteam, m.Schermoluce,
      m.Riflesso, m.Flash, m.Riposo, m.Protezione, m.Terrempesta,
      m.Ritorno, m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Giornodisole,
      m.PallaOmbra, m.Spaccaroccia, m.Facciata, m.Forzasegreta, m.Rocciotomba,
      m.Falcecannone, m.Sdoppiatore, m.Mimica, m.Autodistruzione, m.Mangiasogni,
      m.Esplosione, m.Frana, m.Sostituto, m.Russare, m.Fangosberla,
      m.Resistenza, m.Bullo, m.Sonnolalia, m.Psicamisu, m.Psicoraggio,
      m.Rinfrescata
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "345": {
    name: "Lileep",
    dexNumber: 345,
    type: ["Roccia", "Erba"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "f",
      minLevel: 5,
      maxLevel: 50
    },
    exp: 50,
    movesByLevel: {
      5: [m.Sgomento],
      8: [m.Limitazione],
      15: [m.Acido],
      22: [m.Radicamento],
      29: [m.Stordiraggio],
      36: [m.Amnesia],
      43: [m.Forzantica],
      50: [m.Accumulo, m.Sfoghenergia, m.Introenergia]
    },
    movesByMT: [
      m.Solarraggio, m.Tossina, m.Doppioteam, m.Riposo, m.Protezione,
      m.Fangobomba, m.Terrempesta, m.Gigassorbimento, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Introforza, m.Giornodisole, m.Facciata, m.Forzasegreta,
      m.Semitraglia, m.Ripresa, m.Barriera, m.Frana, m.Specchiovelo,
      m.Corposcontro, m.Sdoppiatore, m.Mimica, m.Sostituto, m.Russare,
      m.Fangosberla, m.Resistenza, m.Bullo, m.Sonnolalia, m.Psicamisu
    ],
    evolution: { stage: "base", to: [{ species: "346", trigger: { kind: "level", level: 40 } }] }
  },
  "346": {
    name: "Cradily",
    dexNumber: 346,
    type: ["Roccia", "Erba"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "f",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Sgomento],
      8: [m.Limitazione],
      15: [m.Acido],
      22: [m.Radicamento],
      29: [m.Stordiraggio],
      36: [m.Amnesia],
      48: [m.Forzantica],
      60: [m.Accumulo, m.Sfoghenergia, m.Introenergia]
    },
    movesByMT: [
      m.IperRaggio, m.Forza, m.Solarraggio, m.Terremoto, m.Tossina,
      m.Doppioteam, m.Riposo, m.Protezione, m.Fangobomba, m.Terrempesta,
      m.Gigassorbimento, m.Attrazione, m.Ritorno, m.Frustrazione, m.Introforza,
      m.Giornodisole, m.Spaccaroccia, m.Facciata, m.Forzasegreta, m.Rocciotomba,
      m.Semitraglia, m.Ripresa, m.Barriera, m.Frana, m.Specchiovelo,
      m.Corposcontro, m.Sdoppiatore, m.Mimica, m.Sostituto, m.Russare,
      m.Fangosberla, m.Resistenza, m.Bullo, m.Sonnolalia, m.Psicamisu
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "347": {
    name: "Anorith",
    dexNumber: 347,
    type: ["Roccia", "Coleottero"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "f",
      minLevel: 5,
      maxLevel: 50
    },
    exp: 50,
    movesByLevel: {
      5: [m.Graffio],
      7: [m.Rafforzatore],
      13: [m.Fangata],
      19: [m.Pistolacqua],
      25: [m.Ferrartigli],
      31: [m.Protezione],
      37: [m.Forzantica],
      43: [m.Tagliofuria],
      49: [m.Lacerazione],
      55: [m.Cadutamassi]
    },
    movesByMT: [
      m.Taglio, m.Fossa, m.Tossina, m.Doppioteam, m.Riposo,
      m.Protezione, m.Terrempesta, m.Attrazione, m.Ritorno, m.Frustrazione,
      m.Introforza, m.Giornodisole, m.Spaccaroccia, m.Facciata, m.Breccia,
      m.Forzasegreta, m.Rocciotomba, m.Aeroassalto, m.Idropulsar, m.Danzaspada,
      m.Frana, m.Rapigiro, m.Privazione, m.Corposcontro, m.Sdoppiatore,
      m.Mimica, m.Sostituto, m.Russare, m.Fangosberla, m.Resistenza,
      m.Bullo, m.Tagliofuria, m.Sonnolalia
    ],
    evolution: { stage: "base", to: [{ species: "348", trigger: { kind: "level", level: 40 } }] }
  },
  "348": {
    name: "Armaldo",
    dexNumber: 348,
    type: ["Roccia", "Coleottero"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "f",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Graffio],
      7: [m.Rafforzatore],
      13: [m.Fangata],
      19: [m.Pistolacqua],
      25: [m.Ferrartigli],
      31: [m.Protezione],
      37: [m.Forzantica],
      46: [m.Tagliofuria],
      55: [m.Lacerazione],
      64: [m.Cadutamassi]
    },
    movesByMT: [
      m.Taglio, m.IperRaggio, m.Forza, m.Terremoto, m.Fossa,
      m.Tossina, m.Doppioteam, m.Riposo, m.Protezione, m.Terrempesta,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Codacciaio, m.Introforza,
      m.Giornodisole, m.Spaccaroccia, m.Facciata, m.Breccia, m.Forzasegreta,
      m.Rocciotomba, m.Aeroassalto, m.Idropulsar, m.Danzaspada, m.Frana,
      m.Rapigiro, m.Privazione, m.Corposcontro, m.Sdoppiatore, m.MovimentoSismico,
      m.Mimica, m.Sostituto, m.Russare, m.Fangosberla, m.Resistenza,
      m.Bullo, m.Tagliofuria, m.Sonnolalia
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "349": {
    name: "Feebas",
    dexNumber: 349,
    type: ["Acqua"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "s",
      minLevel: 5,
      maxLevel: 50
    },
    exp: 50,
    movesByLevel: {
      5: [m.Azione, m.Splash],
      30: [m.Flagello]
    },
    movesByMT: [
      m.Surf, m.Geloraggio, m.Bora, m.Tossina, m.Doppioteam,
      m.Cascata, m.Riposo, m.Protezione, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Grandine, m.Facciata,
      m.Forzasegreta, m.Sub, m.Idropulsar, m.Ipnosi, m.Stordiraggio,
      m.Schermoluce, m.Dragospiro, m.Specchiovelo, m.Fangata, m.Sdoppiatore,
      m.Mimica, m.Comete, m.Sostituto, m.Russare, m.Ventogelato,
      m.Resistenza, m.Bullo, m.Sonnolalia
    ],
    evolution: { stage: "base", to: [{ species: "350", trigger: { kind: "item", item: i.squama_bella } }] }
  },
  "350": {
    name: "Milotic",
    dexNumber: 350,
    type: ["Acqua"],
    gender: ["Maschio", "Femmina"],
    spriteGendered: true,
    encounter: {
      rarity: "s",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Pistolacqua, m.Avvolgibotta],
      10: [m.Docciascudo],
      15: [m.Rinfrescata],
      20: [m.Idropulsar],
      25: [m.Tornado],
      30: [m.Ripresa],
      35: [m.Pioggiadanza],
      40: [m.Idropompa],
      45: [m.Attrazione],
      50: [m.Salvaguardia]
    },
    movesByMT: [
      m.Surf, m.Geloraggio, m.Bora, m.IperRaggio, m.Tossina,
      m.Doppioteam, m.Cascata, m.Riposo, m.Protezione, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Salvaguardia, m.Codacciaio, m.Introforza,
      m.Pioggiadanza, m.Grandine, m.Facciata, m.Forzasegreta, m.Sub,
      m.Idropulsar, m.Ipnosi, m.Stordiraggio, m.Schermoluce, m.Dragospiro,
      m.Specchiovelo, m.Fangata, m.Corposcontro, m.Sdoppiatore, m.Mimica,
      m.Comete, m.Sostituto, m.Russare, m.Fangosberla, m.Ventogelato,
      m.Resistenza, m.Bullo, m.Sonnolalia, m.Psicamisu
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "351": {
    name: "Castform",
    dexNumber: 351,
    type: ["Normale"],
    gender: [],
    encounter: {
      rarity: "r",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Azione],
      10: [m.Braciere, m.Pistolacqua, m.Polneve],
      20: [m.Pioggiadanza, m.Giornodisole, m.Grandine],
      30: [m.PallaClima]
    },
    movesByMT: [
      m.Lanciafiamme, m.Geloraggio, m.Bora, m.Solarraggio, m.Fulmine,
      m.Tuono, m.Tossina, m.Doppioteam, m.Fuocobomba, m.Flash,
      m.Riposo, m.Furto, m.Protezione, m.Terrempesta, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Giornodisole,
      m.PallaOmbra, m.Grandine, m.Facciata, m.Forzasegreta, m.Ondashock,
      m.Idropulsar, m.Psicamisu, m.Divinazione, m.Corposcontro, m.Sdoppiatore,
      m.Tuononda, m.Mimica, m.Ricciolscudo, m.Comete, m.Sostituto,
      m.Russare, m.Ventogelato, m.Resistenza, m.Bullo, m.Sonnolalia
    ],
    evolution: { stage: "base", to: [] }
  },
  "352": {
    name: "Kecleon",
    dexNumber: 352,
    type: ["Normale"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Graffio, m.Colpocoda, m.Leccata, m.Legatutto,m.Furto, m.Sgomento],
      7: [m.Finta],
      12: [m.Sfuriate],
      17: [m.Psicoraggio],
      24: [m.Stridio],
      31: [m.Lacerazione],
      40: [m.Sostituto],
      49: [m.Forzantica]
    },
    movesByMT: [
      m.Taglio, m.Lanciafiamme, m.Geloraggio, m.Bora, m.Forza,
      m.Solarraggio, m.Fulmine, m.Tuono, m.Fossa, m.Tossina,
      m.Doppioteam, m.Fuocobomba, m.Flash, m.Riposo, m.Furto,
      m.Protezione, m.Attrazione, m.Ritorno, m.Frustrazione, m.Codacciaio,
      m.Introforza, m.Pioggiadanza, m.Giornodisole, m.PallaOmbra, m.Spaccaroccia,
      m.Facciata, m.Centripugno, m.Breccia, m.Scippo, m.Forzasegreta,
      m.Rocciotomba, m.Aeroassalto, m.Ondashock, m.Idropulsar, m.Inibitore,
      m.Raggiro, m.Magivelo, m.Megapugno, m.Fuocopugno, m.Gelopugno,
      m.Tuonopugno, m.Megacalcio, m.Corposcontro, m.Sdoppiatore, m.Contrattacco,
      m.MovimentoSismico, m.Tuononda, m.Mimica, m.Ricciolscudo, m.Metronomo,
      m.Comete, m.Frana, m.Sostituto, m.Russare, m.Fangosberla,
      m.Ventogelato, m.Resistenza, m.Rotolamento, m.Bullo, m.Tagliofuria,
      m.Sonnolalia, m.Dinamipugno, m.Psicamisu
    ],
    evolution: { stage: "base", to: [] }
  },
  "353": {
    name: "Shuppet",
    dexNumber: 353,
    type: ["Spettro"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 47
    },
    exp: 50,
    movesByLevel: {
      5: [m.Privazione],
      8: [m.Stridio],
      13: [m.OmbraNotturna],
      20: [m.Maledizione],
      25: [m.Dispetto],
      32: [m.Fuocofatuo],
      37: [m.Finta],
      44: [m.PallaOmbra],
      49: [m.Scippo],
      56: [m.Rancore]
    },
    movesByMT: [
      m.Fulmine, m.Tuono, m.Tossina, m.Psichico, m.Doppioteam,
      m.Flash, m.Riposo, m.Furto, m.Protezione, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Giornodisole,
      m.PallaOmbra, m.Attaccalite, m.Facciata, m.Provocazione, m.Scippo,
      m.Forzasegreta, m.Calmamente, m.Ondashock, m.Inibitore, m.Preveggenza,
      m.Destinobbligato, m.Esclusiva, m.Sgomento, m.Corposcontro, m.Sdoppiatore,
      m.Tuononda, m.Mimica, m.Mangiasogni, m.Sostituto, m.Incubo,
      m.Russare, m.Ventogelato, m.Resistenza, m.Bullo, m.Sonnolalia,
      m.Psicamisu
    ],
    evolution: { stage: "base", to: [{ species: "354", trigger: { kind: "level", level: 37 } }] }
  },
  "354": {
    name: "Banette",
    dexNumber: 354,
    type: ["Spettro"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 37,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Privazione],
      8: [m.Stridio],
      13: [m.OmbraNotturna],
      20: [m.Maledizione],
      25: [m.Dispetto],
      32: [m.Fuocofatuo],
      39: [m.Finta],
      48: [m.PallaOmbra],
      55: [m.Scippo],
      64: [m.Rancore]
    },
    movesByMT: [
      m.IperRaggio, m.Fulmine, m.Tuono, m.Tossina, m.Psichico,
      m.Doppioteam, m.Flash, m.Riposo, m.Furto, m.Protezione,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Introforza, m.Pioggiadanza,
      m.Giornodisole, m.PallaOmbra, m.Attaccalite, m.Facciata, m.Provocazione,
      m.Scippo, m.Forzasegreta, m.Calmamente, m.Ondashock, m.Inibitore,
      m.Preveggenza, m.Destinobbligato, m.Esclusiva, m.Sgomento, m.Corposcontro,
      m.Sdoppiatore, m.Tuononda, m.Mimica, m.Metronomo, m.Mangiasogni,
      m.Sostituto, m.Incubo, m.Russare, m.Fangosberla, m.Ventogelato,
      m.Resistenza, m.Bullo, m.Sonnolalia, m.Psicamisu, m.Maledizione,
      m.Finta, m.Altruismo
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "355": {
    name: "Duskull",
    dexNumber: 355,
    type: ["Spettro"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 47
    },
    exp: 50,
    movesByLevel: {
      5: [m.Fulmisguardo, m.OmbraNotturna, m.Inibitore],
      12: [m.Preveggenza],
      16: [m.Sgomento],
      23: [m.Stordiraggio],
      27: [m.Inseguimento],
      34: [m.Maledizione],
      38: [m.Fuocofatuo],
      45: [m.Malosguardo],
      49: [m.Divinazione]
    },
    movesByMT: [
      m.Geloraggio, m.Bora, m.Tossina, m.Psichico, m.Doppioteam,
      m.Flash, m.Riposo, m.Furto, m.Protezione, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Giornodisole,
      m.PallaOmbra, m.Attaccalite, m.Facciata, m.Provocazione, m.Scippo,
      m.Forzasegreta, m.Calmamente, m.Finta, m.Destinobbligato, m.Malcomune,
      m.Memento, m.Esclusiva, m.Rancore, m.Corposcontro, m.Sdoppiatore,
      m.Mimica, m.Mangiasogni, m.Sostituto, m.Incubo, m.Russare,
      m.Ventogelato, m.Resistenza, m.Bullo, m.Sonnolalia, m.Psicamisu,
      m.Stordiraggio, m.Altruismo, m.Sgomento
    ],
    evolution: { stage: "base", to: [{ species: "356", trigger: { kind: "level", level: 37 } }] }
  },
  "356": {
    name: "Dusclops",
    dexNumber: 356,
    type: ["Spettro"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 37,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Legatutto, m.Fulmisguardo, m.Inibitore, m.OmbraNotturna],
      12: [m.Preveggenza],
      16: [m.Sgomento],
      23: [m.Stordiraggio],
      27: [m.Inseguimento],
      34: [m.Maledizione],
      37: [m.Pugnodombra],
      41: [m.Fuocofatuo],
      51: [m.Malosguardo],
      58: [m.Divinazione]
    },
    movesByMT: [
      m.Geloraggio, m.Bora, m.IperRaggio, m.Forza, m.Terremoto,
      m.Tossina, m.Psichico, m.Doppioteam, m.Flash, m.Riposo,
      m.Furto, m.Protezione, m.Attrazione, m.Ritorno, m.Frustrazione,
      m.Introforza, m.Pioggiadanza, m.Giornodisole, m.PallaOmbra, m.Spaccaroccia,
      m.Attaccalite, m.Facciata, m.Centripugno, m.Provocazione, m.Scippo,
      m.Forzasegreta, m.Rocciotomba, m.Calmamente, m.Finta, m.Destinobbligato,
      m.Malcomune, m.Memento, m.Esclusiva, m.Rancore, m.Megapugno,
      m.Fuocopugno, m.Gelopugno, m.Tuonopugno, m.Megacalcio, m.Corposcontro,
      m.Sdoppiatore, m.Contrattacco, m.MovimentoSismico, m.Mimica, m.Metronomo,
      m.Mangiasogni, m.Frana, m.Sostituto, m.Incubo, m.Russare,
      m.Fangosberla, m.Ventogelato, m.Resistenza, m.Bullo, m.Sonnolalia,
      m.Dinamipugno, m.Psicamisu, m.Stordiraggio, m.Altruismo, m.Sgomento
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "357": {
    name: "Tropius",
    dexNumber: 357,
    type: ["Erba", "Volante"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Raffica, m.Fulmisguardo],
      7: [m.Crescita],
      11: [m.Foglielama],
      17: [m.Pestone],
      21: [m.Profumino],
      27: [m.Turbine],
      31: [m.Fogliamagica],
      37: [m.Corposcontro],
      41: [m.Solarraggio],
      47: [m.Sintesi]
    },
    movesByMT: [
      m.Taglio, m.Volo, m.Boato, m.IperRaggio, m.Forza,
      m.Solarraggio, m.Terremoto, m.Tossina, m.Doppioteam, m.Flash,
      m.Riposo, m.Protezione, m.Gigassorbimento, m.Alacciaio, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Salvaguardia, m.Introforza, m.Giornodisole,
      m.Spaccaroccia, m.Facciata, m.Forzasegreta, m.Semitraglia, m.Aeroassalto,
      m.Ventagliente, m.Schianto, m.Bottintesta, m.Parassiseme, m.Naturforza,
      m.Danzaspada, m.Corposcontro, m.Sdoppiatore, m.Mimica, m.Sostituto,
      m.Russare, m.Fangosberla, m.Resistenza, m.Bullo, m.Tagliofuria,
      m.Sonnolalia
    ],
    evolution: { stage: "base", to: [] }
  },
  "358": {
    name: "Chimecho",
    dexNumber: 358,
    type: ["Psico"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Avvolgibotta],
      6: [m.Ruggito],
      9: [m.Sgomento],
      14: [m.Confusione],
      17: [m.Riduttore],
      22: [m.Baraonda],
      25: [m.Sbadiglio],
      30: [m.Psiconda],
      33: [m.Sdoppiatore],
      38: [m.Rintoccasana],
      41: [m.Salvaguardia],
      46: [m.Psichico]
    },
    movesByMT: [
      m.Tossina, m.Psichico, m.Doppioteam, m.Schermoluce, m.Riflesso,
      m.Flash, m.Riposo, m.Protezione, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Salvaguardia, m.Introforza, m.Pioggiadanza, m.Giornodisole,
      m.PallaOmbra, m.Attaccalite, m.Facciata, m.Provocazione, m.Scippo,
      m.Forzasegreta, m.Calmamente, m.Ondashock, m.Inibitore, m.Ipnosi,
      m.Mangiasogni, m.Maledizione, m.Sdoppiatore, m.Mimica, m.Ricciolscudo,
      m.Sostituto, m.Incubo, m.Russare, m.Ventogelato, m.Resistenza,
      m.Rotolamento, m.Bullo, m.Sonnolalia, m.Psicamisu
    ],
    evolution: { stage: "base", to: [] }
  },
  "359": {
    name: "Absol",
    dexNumber: 359,
    type: ["Buio"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "s",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Graffio, m.Fulmisguardo],
      9: [m.Provocazione],
      13: [m.AttaccoRapido],
      17: [m.Ventagliente],
      21: [m.Morso],
      26: [m.Danzaspada],
      31: [m.Doppioteam],
      36: [m.Lacerazione],
      41: [m.Divinazione],
      46: [m.Ultimocanto]
    },
    movesByMT: [
      m.Taglio, m.Lanciafiamme, m.Geloraggio, m.Bora, m.IperRaggio,
      m.Forza, m.Fulmine, m.Tuono, m.Tossina, m.Doppioteam,
      m.Fuocobomba, m.Flash, m.Riposo, m.Furto, m.Protezione,
      m.Terrempesta, m.Attrazione, m.Ritorno, m.Frustrazione, m.Codacciaio,
      m.Introforza, m.Pioggiadanza, m.Giornodisole, m.PallaOmbra, m.Spaccaroccia,
      m.Grandine, m.Attaccalite, m.Facciata, m.Provocazione, m.Scippo,
      m.Forzasegreta, m.Aeroassalto, m.Calmamente, m.Ondashock, m.Idropulsar,
      m.Falcecannone, m.Sdoppiatore, m.Sostituto, m.Maledizione, m.Finta,
      m.Staffetta, m.Magivelo, m.Danzaspada, m.Corposcontro, m.Contrattacco,
      m.Tuononda, m.Mimica, m.Comete, m.Mangiasogni, m.Frana,
      m.Incubo, m.Russare, m.Fangosberla, m.Ventogelato, m.Resistenza,
      m.Bullo, m.Tagliofuria, m.Sonnolalia, m.Psicamisu, m.Desiderio,
      m.Dispetto
    ],
    evolution: { stage: "base", to: [] }
  },
  "360": {
    name: "Wynaut",
    dexNumber: 360,
    type: ["Psico"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 5,
      maxLevel: 15
    },
    exp: 50,
    movesByLevel: {
      5: [m.Splash, m.Fascino, m.Ripeti, m.Botta],
      15: [m.Contrattacco, m.Destinobbligato, m.Salvaguardia, m.Specchiovelo]
    },
    movesByMT: [
      m.Solletico
    ],
    evolution: { stage: "base", to: [{ species: "202", trigger: { kind: "level", level: 15 } }] }
  },
  "361": {
    name: "Snorunt",
    dexNumber: 361,
    type: ["Ghiaccio"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 5,
      maxLevel: 52
    },
    exp: 50,
    movesByLevel: {
      5: [m.Fulmisguardo, m.Polneve],
      7: [m.Doppioteam],
      10: [m.Morso],
      16: [m.Ventogelato],
      19: [m.Bottintesta],
      25: [m.Protezione],
      28: [m.Sgranocchio],
      34: [m.Geloraggio],
      37: [m.Grandine],
      43: [m.Bora]
    },
    movesByMT: [
      m.Geloraggio, m.Bora, m.Tossina, m.Doppioteam, m.Schermoluce,
      m.Flash, m.Riposo, m.Protezione, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Salvaguardia, m.Introforza, m.Pioggiadanza, m.PallaOmbra,
      m.Grandine, m.Facciata, m.Forzasegreta, m.Idropulsar, m.Punte,
      m.Blocco, m.Corposcontro, m.Sdoppiatore, m.Mimica, m.Sostituto,
      m.Russare, m.Ventogelato, m.Resistenza, m.Bullo, m.Sonnolalia,
      m.Morso, m.Canto
    ],
    evolution: { stage: "base", to: [{ species: "362", trigger: { kind: "level", level: 42 } }] }
  },
  "362": {
    name: "Glalie",
    dexNumber: 362,
    type: ["Ghiaccio"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 42,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Fulmisguardo, m.Polneve],
      7: [m.Doppioteam],
      10: [m.Morso],
      16: [m.Ventogelato],
      19: [m.Bottintesta],
      25: [m.Protezione],
      28: [m.Sgranocchio],
      34: [m.Geloraggio],
      42: [m.Grandine],
      53: [m.Bora],
      61: [m.Purogelo]
    },
    movesByMT: [
      m.Geloraggio, m.Bora, m.IperRaggio, m.Terremoto, m.Tossina,
      m.Doppioteam, m.Schermoluce, m.Flash, m.Riposo, m.Protezione,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Salvaguardia, m.Introforza,
      m.Pioggiadanza, m.PallaOmbra, m.Grandine, m.Attaccalite, m.Facciata,
      m.Provocazione, m.Forzasegreta, m.Idropulsar, m.Falcecannone, m.Punte,
      m.Blocco, m.Corposcontro, m.Sdoppiatore, m.Mimica, m.Ricciolscudo,
      m.Autodistruzione, m.Esplosione, m.Sostituto, m.Russare, m.Ventogelato,
      m.Resistenza, m.Rotolamento, m.Bullo, m.Sonnolalia, m.Morso,
      m.Canto
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "363": {
    name: "Spheal",
    dexNumber: 363,
    type: ["Ghiaccio", "Acqua"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "c",
      minLevel: 5,
      maxLevel: 37
    },
    exp: 50,
    movesByLevel: {
      5: [m.Ruggito, m.Pistolacqua, m.Ricciolscudo, m.Polneve],
      7: [m.Ripeti],
      13: [m.PallaGelo],
      19: [m.Corposcontro],
      25: [m.Raggiaurora],
      31: [m.Grandine],
      37: [m.Riposo, m.Russare],
      43: [m.Bora],
      49: [m.Purogelo]
    },
    movesByMT: [
      m.Surf, m.Geloraggio, m.Bora, m.Forza, m.Terremoto,
      m.Tossina, m.Doppioteam, m.Cascata, m.Riposo, m.Protezione,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Codacciaio, m.Introforza,
      m.Pioggiadanza, m.Spaccaroccia, m.Grandine, m.Facciata, m.Forzasegreta,
      m.Sub, m.Rocciotomba, m.Idropulsar, m.Abisso, m.Frana,
      m.Maledizione, m.Accumulo, m.Sfoghenergia, m.Introenergia, m.Sbadiglio,
      m.Docciascudo, m.Corposcontro, m.Sdoppiatore, m.Mimica, m.Ricciolscudo,
      m.Sostituto, m.Russare, m.Fangosberla, m.Ventogelato, m.Resistenza,
      m.Rotolamento, m.Bullo, m.Sonnolalia, m.Pistolacqua, m.Raggiaurora,
      m.Fascino
    ],
    evolution: { stage: "base", to: [{ species: "364", trigger: { kind: "level", level: 32 } }] }
  },
  "364": {
    name: "Sealeo",
    dexNumber: 364,
    type: ["Ghiaccio", "Acqua"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 32,
      maxLevel: 54
    },
    exp: 100,
    movesByLevel: {
      5: [m.Ruggito, m.Pistolacqua, m.Ricciolscudo, m.Polneve],
      7: [m.Ripeti],
      13: [m.PallaGelo],
      19: [m.Corposcontro],
      25: [m.Raggiaurora],
      31: [m.Grandine],
      39: [m.Riposo, m.Russare],
      47: [m.Bora],
      55: [m.Purogelo]
    },
    movesByMT: [
      m.Boato, m.Surf, m.Geloraggio, m.Bora, m.Forza,
      m.Terremoto, m.Tossina, m.Doppioteam, m.Cascata, m.Riposo,
      m.Protezione, m.Attrazione, m.Ritorno, m.Frustrazione, m.Codacciaio,
      m.Introforza, m.Pioggiadanza, m.Spaccaroccia, m.Grandine, m.Facciata,
      m.Forzasegreta, m.Sub, m.Rocciotomba, m.Idropulsar, m.Abisso,
      m.Frana, m.Maledizione, m.Accumulo, m.Sfoghenergia, m.Introenergia,
      m.Sbadiglio, m.Docciascudo, m.Corposcontro, m.Sdoppiatore, m.Mimica,
      m.Ricciolscudo, m.Sostituto, m.Russare, m.Fangosberla, m.Ventogelato,
      m.Resistenza, m.Rotolamento, m.Bullo, m.Sonnolalia, m.Pistolacqua,
      m.Raggiaurora, m.Fascino
    ],
    evolution: { stage: "stage1", to: [{ species: "365", trigger: { kind: "level", level: 44 } }] }
  },
  "365": {
    name: "Walrein",
    dexNumber: 365,
    type: ["Ghiaccio", "Acqua"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 44,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.Ruggito, m.Pistolacqua, m.Ricciolscudo, m.Polneve],
      7: [m.Ripeti],
      13: [m.PallaGelo],
      19: [m.Corposcontro],
      25: [m.Raggiaurora],
      31: [m.Grandine],
      39: [m.Riposo, m.Russare],
      50: [m.Bora],
      61: [m.Purogelo]
    },
    movesByMT: [
      m.Boato, m.Surf, m.Geloraggio, m.Bora, m.IperRaggio,
      m.Forza, m.Terremoto, m.Tossina, m.Doppioteam, m.Cascata,
      m.Riposo, m.Protezione, m.Attrazione, m.Ritorno, m.Frustrazione,
      m.Codacciaio, m.Introforza, m.Pioggiadanza, m.Spaccaroccia, m.Grandine,
      m.Facciata, m.Forzasegreta, m.Sub, m.Rocciotomba, m.Idropulsar,
      m.Abisso, m.Frana, m.Maledizione, m.Accumulo, m.Sfoghenergia,
      m.Introenergia, m.Sbadiglio, m.Docciascudo, m.Corposcontro, m.Sdoppiatore,
      m.Mimica, m.Ricciolscudo, m.Sostituto, m.Russare, m.Fangosberla,
      m.Ventogelato, m.Resistenza, m.Rotolamento, m.Bullo, m.Sonnolalia,
      m.Pistolacqua, m.Raggiaurora, m.Fascino
    ],
    evolution: { stage: "stage2", to: [] }
  },
  "366": {
    name: "Clamperl",
    dexNumber: 366,
    type: ["Acqua"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "r",
      minLevel: 5,
      maxLevel: 50
    },
    exp: 50,
    movesByLevel: {
      5: [m.Pistolacqua, m.Tenaglia, m.Mulinello, m.Ferroscudo]
    },
    movesByMT: [
      m.Surf, m.Geloraggio, m.Bora, m.Tossina, m.Doppioteam,
      m.Cascata, m.Riposo, m.Protezione, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Grandine, m.Facciata,
      m.Forzasegreta, m.Sub, m.Idropulsar, m.Corposcontro, m.Supersuono,
      m.Stordiraggio, m.Barriera, m.Rinfrescata, m.Fangata, m.Sdoppiatore,
      m.Mimica, m.Sostituto, m.Russare, m.Ventogelato, m.Resistenza,
      m.Bullo, m.Sonnolalia
    ],
    evolution: { stage: "base", to: [{ species: "367", trigger: { kind: "item", item: i.dente_abissi } }, { species: "368", trigger: { kind: "item", item: i.squamabissi } }] }
  },
  "367": {
    name: "Huntail",
    dexNumber: 367,
    type: ["Acqua"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "s",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Mulinello],
      8: [m.Morso],
      15: [m.Stridio],
      22: [m.Idropulsar],
      29: [m.Visotruce],
      36: [m.Sgranocchio],
      43: [m.Staffetta],
      50: [m.Idropompa]
    },
    movesByMT: [
      m.Surf, m.Geloraggio, m.Bora, m.IperRaggio, m.Tossina,
      m.Doppioteam, m.Cascata, m.Riposo, m.Protezione, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Grandine,
      m.Facciata, m.Scippo, m.Forzasegreta, m.Sub, m.Rocciotomba,
      m.Idropulsar, m.Corposcontro, m.Supersuono, m.Stordiraggio, m.Barriera,
      m.Rinfrescata, m.Fangata, m.Sdoppiatore, m.Mimica, m.Comete,
      m.Sostituto, m.Russare, m.Fangosberla, m.Ventogelato, m.Resistenza,
      m.Bullo, m.Sonnolalia
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "368": {
    name: "Gorebyss",
    dexNumber: 368,
    type: ["Acqua"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "s",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Mulinello],
      8: [m.Confusione],
      15: [m.Agilita],
      22: [m.Idropulsar],
      29: [m.Amnesia],
      36: [m.Psichico],
      43: [m.Staffetta],
      50: [m.Idropompa]
    },
    movesByMT: [
      m.Surf, m.Geloraggio, m.Bora, m.IperRaggio, m.Tossina,
      m.Psichico, m.Doppioteam, m.Cascata, m.Riposo, m.Protezione,
      m.Attrazione, m.Ritorno, m.Frustrazione, m.Salvaguardia, m.Introforza,
      m.Pioggiadanza, m.PallaOmbra, m.Grandine, m.Facciata, m.Forzasegreta,
      m.Sub, m.Idropulsar, m.Corposcontro, m.Supersuono, m.Stordiraggio,
      m.Barriera, m.Rinfrescata, m.Fangata, m.Sdoppiatore, m.Mimica,
      m.Comete, m.Sostituto, m.Russare, m.Fangosberla, m.Ventogelato,
      m.Resistenza, m.Bullo, m.Sonnolalia
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "369": {
    name: "Relicanth",
    dexNumber: 369,
    type: ["Acqua", "Roccia"],
    gender: ["Maschio", "Femmina"],
    spriteGendered: true,
    encounter: {
      rarity: "s",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Azione, m.Rafforzatore],
      8: [m.Pistolacqua],
      15: [m.Rocciotomba],
      22: [m.Sbadiglio],
      29: [m.Riduttore],
      36: [m.Fangata],
      43: [m.Forzantica],
      50: [m.Riposo],
      57: [m.Sdoppiatore],
      64: [m.Idropompa]
    },
    movesByMT: [
      m.Surf, m.Geloraggio, m.Bora, m.IperRaggio, m.Terremoto,
      m.Tossina, m.Doppioteam, m.Cascata, m.Riposo, m.Protezione,
      m.Terrempesta, m.Attrazione, m.Ritorno, m.Frustrazione, m.Salvaguardia,
      m.Introforza, m.Pioggiadanza, m.Spaccaroccia, m.Grandine, m.Facciata,
      m.Forzasegreta, m.Sub, m.Rocciotomba, m.Calmamente, m.Idropulsar,
      m.Capocciata, m.Amnesia, m.Frana, m.Sonnolalia, m.Magnitudo,
      m.Docciascudo, m.Corposcontro, m.Sdoppiatore, m.Mimica, m.Sostituto,
      m.Russare, m.Fangosberla, m.Ventogelato, m.Resistenza, m.Bullo,
      m.Psicamisu
    ],
    evolution: { stage: "base", to: [] }
  },
  "370": {
    name: "Luvdisc",
    dexNumber: 370,
    type: ["Acqua"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "u",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Azione, m.Fascino],
      12: [m.Pistolacqua],
      16: [m.Agilita],
      24: [m.Riduttore],
      28: [m.Attrazione],
      36: [m.Dolcebacio],
      40: [m.Flagello],
      48: [m.Salvaguardia]
    },
    movesByMT: [
      m.Surf, m.Geloraggio, m.Bora, m.Tossina, m.Doppioteam,
      m.Cascata, m.Riposo, m.Protezione, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Salvaguardia, m.Introforza, m.Pioggiadanza, m.Grandine,
      m.Facciata, m.Forzasegreta, m.Sub, m.Idropulsar, m.Supersuono,
      m.Splash, m.Fangata, m.Docciascudo, m.Sdoppiatore, m.Mimica,
      m.Comete, m.Sostituto, m.Russare, m.Ventogelato, m.Resistenza,
      m.Bullo, m.Sonnolalia, m.Psicamisu
    ],
    evolution: { stage: "base", to: [] }
  },
  "371": {
    name: "Bagon",
    dexNumber: 371,
    type: ["Drago"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "s",
      minLevel: 5,
      maxLevel: 35
    },
    exp: 50,
    movesByLevel: {
      5: [m.Ira, m.Morso],
      9: [m.Fulmisguardo],
      17: [m.Bottintesta],
      21: [m.Focalenergia],
      25: [m.Braciere],
      33: [m.Dragospiro],
      37: [m.Visotruce],
      41: [m.Sgranocchio],
      49: [m.Dragartigli],
      53: [m.Sdoppiatore]
    },
    movesByMT: [
      m.Taglio, m.Boato, m.Lanciafiamme, m.Forza, m.Tossina,
      m.Doppioteam, m.Fuocobomba, m.Riposo, m.Protezione, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Giornodisole,
      m.Spaccaroccia, m.Facciata, m.Breccia, m.Forzasegreta, m.Rocciotomba,
      m.Aeroassalto, m.Dragartigli, m.Colpo, m.Idropompa, m.IradiDrago,
      m.Tornado, m.Dragodanza, m.Corposcontro, m.Sdoppiatore, m.Mimica,
      m.Frana, m.Sostituto, m.Russare, m.Fangosberla, m.Resistenza,
      m.Bullo, m.Tagliofuria, m.Sonnolalia, m.Desiderio, m.Ferroscudo
    ],
    evolution: { stage: "base", to: [{ species: "372", trigger: { kind: "level", level: 30 } }] }
  },
  "372": {
    name: "Shelgon",
    dexNumber: 372,
    type: ["Drago"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "m",
      minLevel: 30,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.Morso, m.Ira],
      9: [m.Fulmisguardo],
      17: [m.Bottintesta],
      21: [m.Focalenergia],
      25: [m.Braciere],
      30: [m.Protezione],
      38: [m.Dragospiro],
      47: [m.Visotruce],
      56: [m.Sgranocchio],
      69: [m.Dragartigli],
      78: [m.Sdoppiatore]
    },
    movesByMT: [
      m.Taglio, m.Boato, m.Lanciafiamme, m.Forza, m.Tossina,
      m.Doppioteam, m.Fuocobomba, m.Riposo, m.Protezione, m.Attrazione,
      m.Ritorno, m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Giornodisole,
      m.Spaccaroccia, m.Facciata, m.Breccia, m.Forzasegreta, m.Rocciotomba,
      m.Aeroassalto, m.Dragartigli, m.Colpo, m.Idropompa, m.IradiDrago,
      m.Tornado, m.Dragodanza, m.Corposcontro, m.Sdoppiatore, m.Mimica,
      m.Ricciolscudo, m.Frana, m.Sostituto, m.Russare, m.Fangosberla,
      m.Resistenza, m.Rotolamento, m.Bullo, m.Tagliofuria, m.Sonnolalia,
      m.Desiderio, m.Ferroscudo
    ],
    evolution: { stage: "stage1", to: [{ species: "373", trigger: { kind: "level", level: 50 } }] }
  },
  "373": {
    name: "Salamence",
    dexNumber: 373,
    type: ["Drago", "Volante"],
    gender: ["Maschio", "Femmina"],
    encounter: {
      rarity: "m",
      minLevel: 50,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.Morso, m.Ira],
      9: [m.Fulmisguardo],
      17: [m.Bottintesta],
      21: [m.Focalenergia],
      25: [m.Braciere],
      30: [m.Protezione],
      38: [m.Dragospiro],
      47: [m.Visotruce],
      50: [m.Volo],
      61: [m.Sgranocchio],
      79: [m.Dragartigli],
      93: [m.Sdoppiatore]
    },
    movesByMT: [
      m.Taglio, m.Volo, m.Boato, m.Lanciafiamme, m.IperRaggio,
      m.Forza, m.Terremoto, m.Tossina, m.Doppioteam, m.Fuocobomba,
      m.Riposo, m.Protezione, m.Alacciaio, m.Attrazione, m.Ritorno,
      m.Frustrazione, m.Codacciaio, m.Introforza, m.Pioggiadanza, m.Giornodisole,
      m.Spaccaroccia, m.Facciata, m.Breccia, m.Forzasegreta, m.Rocciotomba,
      m.Aeroassalto, m.Dragartigli, m.Colpo, m.Idropompa, m.IradiDrago,
      m.Tornado, m.Dragodanza, m.Corposcontro, m.Sdoppiatore, m.Mimica,
      m.Ricciolscudo, m.Comete, m.Frana, m.Sostituto, m.Russare,
      m.Fangosberla, m.Resistenza, m.Rotolamento, m.Bullo, m.Tagliofuria,
      m.Sonnolalia, m.Rinfrescata, m.Desiderio, m.Ferroscudo
    ],
    evolution: { stage: "stage2", to: [] }
  },
  "374": {
    name: "Beldum",
    dexNumber: 374,
    type: ["Acciaio", "Psico"],
    gender: [],
    encounter: {
      rarity: "s",
      minLevel: 5,
      maxLevel: 25
    },
    exp: 50,
    movesByLevel: {
      5: [m.Riduttore]
    },
    movesByMT: [],
    evolution: { stage: "base", to: [{ species: "375", trigger: { kind: "level", level: 20 } }] }
  },
  "375": {
    name: "Metang",
    dexNumber: 375,
    type: ["Acciaio", "Psico"],
    gender: [],
    encounter: {
      rarity: "m",
      minLevel: 20,
      maxLevel: 55
    },
    exp: 100,
    movesByLevel: {
      5: [m.Riduttore],
      20: [m.Confusione, m.Ferrartigli],
      26: [m.Visotruce],
      32: [m.Inseguimento],
      38: [m.Psichico],
      44: [m.Ferroscudo],
      50: [m.Meteorpugno],
      56: [m.Agilita],
      62: [m.IperRaggio]
    },
    movesByMT: [
      m.Taglio, m.IperRaggio, m.Forza, m.Terremoto, m.Tossina,
      m.Psichico, m.Doppioteam, m.Schermoluce, m.Riflesso, m.Flash,
      m.Riposo, m.Protezione, m.Fangobomba, m.Terrempesta, m.Ritorno,
      m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Giornodisole, m.PallaOmbra,
      m.Spaccaroccia, m.Facciata, m.Breccia, m.Forzasegreta, m.Rocciotomba,
      m.Aeroassalto, m.Gelopugno, m.Tuonopugno, m.Corposcontro, m.Sdoppiatore,
      m.Mimica, m.Ricciolscudo, m.Autodistruzione, m.Comete, m.Esplosione,
      m.Frana, m.Sostituto, m.Russare, m.Fangosberla, m.Ventogelato,
      m.Resistenza, m.Rotolamento, m.Bullo, m.Tagliofuria, m.Sonnolalia,
      m.Dinamipugno, m.Psicamisu, m.Rinfrescata
    ],
    evolution: { stage: "stage1", to: [{ species: "376", trigger: { kind: "level", level: 45 } }] }
  },
  "376": {
    name: "Metagross",
    dexNumber: 376,
    type: ["Acciaio", "Psico"],
    gender: [],
    encounter: {
      rarity: "m",
      minLevel: 45,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.Riduttore],
      20: [m.Confusione, m.Ferrartigli],
      26: [m.Visotruce],
      32: [m.Inseguimento],
      38: [m.Psichico],
      44: [m.Ferroscudo],
      55: [m.Meteorpugno],
      60: [m.Ipnosi],
      66: [m.Agilita],
      77: [m.IperRaggio]
    },
    movesByMT: [
      m.Taglio, m.IperRaggio, m.Forza, m.Terremoto, m.Tossina,
      m.Psichico, m.Doppioteam, m.Schermoluce, m.Riflesso, m.Flash,
      m.Riposo, m.Protezione, m.Fangobomba, m.Terrempesta, m.Ritorno,
      m.Frustrazione, m.Introforza, m.Pioggiadanza, m.Giornodisole, m.PallaOmbra,
      m.Spaccaroccia, m.Facciata, m.Breccia, m.Forzasegreta, m.Rocciotomba,
      m.Aeroassalto, m.Calmamente, m.Gelopugno, m.Tuonopugno, m.Corposcontro,
      m.Sdoppiatore, m.Mimica, m.Ricciolscudo, m.Autodistruzione, m.Comete,
      m.Esplosione, m.Frana, m.Sostituto, m.Russare, m.Fangosberla,
      m.Ventogelato, m.Resistenza, m.Rotolamento, m.Bullo, m.Tagliofuria,
      m.Sonnolalia, m.Dinamipugno, m.Psicamisu, m.Rinfrescata
    ],
    evolution: { stage: "stage2", to: [] }
  },
  "377": {
    name: "Regirock",
    dexNumber: 377,
    type: ["Roccia"],
    gender: [],
    encounter: {
      rarity: "l",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 300,
    movesByLevel: {
      5: [m.Azione, m.Esplosione],
      9: [m.Sassata],
      17: [m.Maledizione],
      25: [m.Troppoforte],
      33: [m.Forzantica],
      41: [m.Ferroscudo],
      49: [m.Falcecannone],
      57: [m.Localizza],
      65: [m.IperRaggio]
    },
    movesByMT: [
      m.IperRaggio, m.Forza, m.Fulmine, m.Tuono, m.Terremoto,
      m.Fossa, m.Tossina, m.Doppioteam, m.Riposo, m.Protezione,
      m.Terrempesta, m.Ritorno, m.Frustrazione, m.Salvaguardia, m.Introforza,
      m.Giornodisole, m.Spaccaroccia, m.Facciata, m.Centripugno, m.Breccia,
      m.Forzasegreta, m.Rocciotomba, m.Ondashock, m.Megapugno, m.Fuocopugno,
      m.Gelopugno, m.Tuonopugno, m.Megacalcio, m.Corposcontro, m.Sdoppiatore,
      m.Contrattacco, m.MovimentoSismico, m.Tuononda, m.Mimica, m.Ricciolscudo,
      m.Autodistruzione, m.Esplosione, m.Frana, m.Sostituto, m.Russare,
      m.Fangosberla, m.Resistenza, m.Rotolamento, m.Bullo, m.Sonnolalia,
      m.Dinamipugno, m.Psicamisu
    ],
    evolution: { stage: "base", to: [] }
  },
  "378": {
    name: "Regice",
    dexNumber: 378,
    type: ["Ghiaccio"],
    gender: [],
    encounter: {
      rarity: "l",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 300,
    movesByLevel: {
      5: [m.Azione, m.Esplosione],
      9: [m.Ventogelato],
      17: [m.Maledizione],
      25: [m.Troppoforte],
      33: [m.Forzantica],
      41: [m.Amnesia],
      49: [m.Falcecannone],
      57: [m.Localizza],
      65: [m.IperRaggio]
    },
    movesByMT: [
      m.Geloraggio, m.Bora, m.IperRaggio, m.Forza, m.Fulmine,
      m.Tuono, m.Terremoto, m.Tossina, m.Doppioteam, m.Riposo,
      m.Protezione, m.Ritorno, m.Frustrazione, m.Salvaguardia, m.Introforza,
      m.Pioggiadanza, m.Spaccaroccia, m.Grandine, m.Facciata, m.Centripugno,
      m.Breccia, m.Forzasegreta, m.Ondashock, m.Megapugno, m.Gelopugno,
      m.Tuonopugno, m.Megacalcio, m.Corposcontro, m.Sdoppiatore, m.Contrattacco,
      m.MovimentoSismico, m.Tuononda, m.Mimica, m.Ricciolscudo, m.Autodistruzione,
      m.Esplosione, m.Frana, m.Sostituto, m.Russare, m.Fangosberla,
      m.Ventogelato, m.Resistenza, m.Rotolamento, m.Bullo, m.Sonnolalia,
      m.Dinamipugno, m.Psicamisu
    ],
    evolution: { stage: "base", to: [] }
  },
  "379": {
    name: "Registeel",
    dexNumber: 379,
    type: ["Acciaio"],
    gender: [],
    encounter: {
      rarity: "l",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 300,
    movesByLevel: {
      5: [m.Azione, m.Esplosione],
      9: [m.Ferrartigli],
      17: [m.Maledizione],
      25: [m.Troppoforte],
      33: [m.Forzantica],
      41: [m.Amnesia, m.Ferroscudo],
      49: [m.Falcecannone],
      57: [m.Localizza],
      65: [m.IperRaggio]
    },
    movesByMT: [
      m.IperRaggio, m.Forza, m.Fulmine, m.Tuono, m.Terremoto,
      m.Tossina, m.Doppioteam, m.Riposo, m.Protezione, m.Terrempesta,
      m.Ritorno, m.Frustrazione, m.Salvaguardia, m.Introforza, m.Pioggiadanza,
      m.Giornodisole, m.Spaccaroccia, m.Facciata, m.Centripugno, m.Breccia,
      m.Forzasegreta, m.Rocciotomba, m.Aeroassalto, m.Ondashock, m.Megapugno,
      m.Gelopugno, m.Tuonopugno, m.Megacalcio, m.Corposcontro, m.Sdoppiatore,
      m.Contrattacco, m.MovimentoSismico, m.Tuononda, m.Mimica, m.Ricciolscudo,
      m.Autodistruzione, m.Esplosione, m.Frana, m.Sostituto, m.Russare,
      m.Fangosberla, m.Resistenza, m.Rotolamento, m.Bullo, m.Sonnolalia,
      m.Dinamipugno, m.Psicamisu
    ],
    evolution: { stage: "base", to: [] }
  },
  "380": {
    name: "Latias",
    dexNumber: 380,
    type: ["Drago", "Psico"],
    gender: ["Femmina"],
    encounter: {
      rarity: "l",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 300,
    movesByLevel: {
      5: [m.Psiconda, m.Desiderio],
      10: [m.Altruismo],
      15: [m.Salvaguardia],
      20: [m.Dragospiro],
      25: [m.Docciascudo],
      30: [m.Rinfrescata],
      35: [m.Foschisfera],
      40: [m.Psichico],
      45: [m.Ripresa],
      50: [m.Fascino]
    },
    movesByMT: [
      m.Taglio, m.Volo, m.Boato, m.Surf, m.Geloraggio,
      m.IperRaggio, m.Solarraggio, m.Fulmine, m.Tuono, m.Terremoto,
      m.Tossina, m.Psichico, m.Doppioteam, m.Schermoluce, m.Riflesso,
      m.Cascata, m.Flash, m.Riposo, m.Protezione, m.Terrempesta,
      m.Alacciaio, m.Attrazione, m.Ritorno, m.Frustrazione, m.Salvaguardia,
      m.Introforza, m.Pioggiadanza, m.Giornodisole, m.PallaOmbra, m.Facciata,
      m.Forzasegreta, m.Sub, m.Aeroassalto, m.Dragartigli, m.Calmamente,
      m.Ondashock, m.Idropulsar, m.Falcecannone, m.Corposcontro, m.Sdoppiatore,
      m.Tuononda, m.Mimica, m.Comete, m.Mangiasogni, m.Sostituto,
      m.Russare, m.Fangosberla, m.Ventogelato, m.Resistenza, m.Bullo,
      m.Tagliofuria, m.Sonnolalia, m.Psicamisu
    ],
    evolution: { stage: "base", to: [] }
  },
  "381": {
    name: "Latios",
    dexNumber: 381,
    type: ["Drago", "Psico"],
    gender: ["Maschio"],
    encounter: {
      rarity: "l",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 300,
    movesByLevel: {
      5: [m.Psiconda, m.Memento],
      10: [m.Altruismo],
      15: [m.Salvaguardia],
      20: [m.Dragospiro],
      25: [m.Protezione],
      30: [m.Rinfrescata],
      35: [m.Abbagliante],
      40: [m.Psichico],
      45: [m.Ripresa],
      50: [m.Dragodanza]
    },
    movesByMT: [
      m.Taglio, m.Volo, m.Boato, m.Surf, m.Geloraggio,
      m.IperRaggio, m.Solarraggio, m.Fulmine, m.Tuono, m.Terremoto,
      m.Tossina, m.Psichico, m.Doppioteam, m.Schermoluce, m.Riflesso,
      m.Cascata, m.Flash, m.Riposo, m.Protezione, m.Terrempesta,
      m.Alacciaio, m.Attrazione, m.Ritorno, m.Frustrazione, m.Salvaguardia,
      m.Introforza, m.Pioggiadanza, m.Giornodisole, m.PallaOmbra, m.Facciata,
      m.Forzasegreta, m.Sub, m.Aeroassalto, m.Dragartigli, m.Calmamente,
      m.Ondashock, m.Idropulsar, m.Falcecannone, m.Corposcontro, m.Sdoppiatore,
      m.Tuononda, m.Mimica, m.Comete, m.Mangiasogni, m.Sostituto,
      m.Russare, m.Fangosberla, m.Ventogelato, m.Resistenza, m.Bullo,
      m.Tagliofuria, m.Sonnolalia, m.Psicamisu
    ],
    evolution: { stage: "base", to: [] }
  },
  "382": {
    name: "Kyogre",
    dexNumber: 382,
    type: ["Acqua"],
    gender: [],
    encounter: {
      rarity: "l",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 300,
    movesByLevel: {
      5: [m.Idropulsar, m.Visotruce],
      15: [m.Forzantica],
      20: [m.Corposcontro],
      30: [m.Calmamente],
      35: [m.Geloraggio],
      45: [m.Idropompa],
      50: [m.Riposo],
      60: [m.Purogelo],
      65: [m.Sdoppiatore],
      75: [m.Zampillo]
    },
    movesByMT: [
      m.Boato, m.Surf, m.Geloraggio, m.Bora, m.IperRaggio,
      m.Forza, m.Fulmine, m.Tuono, m.Terremoto, m.Tossina,
      m.Doppioteam, m.Cascata, m.Riposo, m.Protezione, m.Ritorno,
      m.Frustrazione, m.Salvaguardia, m.Introforza, m.Pioggiadanza, m.Spaccaroccia,
      m.Grandine, m.Facciata, m.Breccia, m.Forzasegreta, m.Sub,
      m.Rocciotomba, m.Calmamente, m.Ondashock, m.Idropulsar, m.Falcecannone,
      m.Corposcontro, m.Sdoppiatore, m.Tuononda, m.Mimica, m.Ricciolscudo,
      m.Comete, m.Frana, m.Sostituto, m.Russare, m.Fangosberla,
      m.Ventogelato, m.Resistenza, m.Bullo, m.Sonnolalia, m.Psicamisu
    ],
    evolution: { stage: "base", to: [] }
  },
  "383": {
    name: "Groudon",
    dexNumber: 383,
    type: ["Terra"],
    gender: [],
    encounter: {
      rarity: "l",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 300,
    movesByLevel: {
      5: [m.Colpodifango, m.Visotruce],
      15: [m.Forzantica],
      20: [m.Lacerazione],
      30: [m.Granfisico],
      35: [m.Terremoto],
      45: [m.Fuocobomba],
      50: [m.Riposo],
      60: [m.Abisso],
      65: [m.Solarraggio],
      75: [m.Eruzione]
    },
    movesByMT: [
      m.Taglio, m.Boato, m.Lanciafiamme, m.IperRaggio, m.Forza,
      m.Solarraggio, m.Fulmine, m.Tuono, m.Terremoto, m.Fossa,
      m.Tossina, m.Doppioteam, m.Fuocobomba, m.Riposo, m.Protezione,
      m.Terrempesta, m.Ritorno, m.Frustrazione, m.Salvaguardia, m.Codacciaio,
      m.Introforza, m.Giornodisole, m.Spaccaroccia, m.Facciata, m.Breccia,
      m.Forzasegreta, m.Vampata, m.Rocciotomba, m.Aeroassalto, m.Dragartigli,
      m.Granfisico, m.Ondashock, m.Megapugno, m.Fuocopugno, m.Tuonopugno,
      m.Danzaspada, m.Megacalcio, m.Corposcontro, m.Sdoppiatore, m.Contrattacco,
      m.MovimentoSismico, m.Tuononda, m.Mimica, m.Ricciolscudo, m.Comete,
      m.Frana, m.Sostituto, m.Russare, m.Fangosberla, m.Resistenza,
      m.Rotolamento, m.Bullo, m.Tagliofuria, m.Sonnolalia, m.Dinamipugno,
      m.Psicamisu
    ],
    evolution: { stage: "base", to: [] }
  },
  "384": {
    name: "Rayquaza",
    dexNumber: 384,
    type: ["Drago", "Volante"],
    gender: [],
    encounter: {
      rarity: "l",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 300,
    movesByLevel: {
      5: [m.Tornado, m.Visotruce],
      15: [m.Forzantica],
      20: [m.Dragartigli],
      30: [m.Dragodanza],
      35: [m.Sgranocchio],
      45: [m.Volo],
      50: [m.Riposo],
      60: [m.Extrarapido],
      65: [m.Oltraggio],
      75: [m.IperRaggio]
    },
    movesByMT: [
      m.Volo, m.Boato, m.Lanciafiamme, m.Surf, m.Geloraggio,
      m.Bora, m.IperRaggio, m.Forza, m.Solarraggio, m.Fulmine,
      m.Tuono, m.Terremoto, m.Tossina, m.Doppioteam, m.Fuocobomba,
      m.Cascata, m.Riposo, m.Protezione, m.Terrempesta, m.Ritorno,
      m.Frustrazione, m.Codacciaio, m.Introforza, m.Pioggiadanza, m.Giornodisole,
      m.Spaccaroccia, m.Facciata, m.Breccia, m.Forzasegreta, m.Sub,
      m.Vampata, m.Aeroassalto, m.Dragartigli, m.Granfisico, m.Ondashock,
      m.Idropulsar, m.Falcecannone, m.Corposcontro, m.Sdoppiatore, m.Tuononda,
      m.Mimica, m.Comete, m.Frana, m.Sostituto, m.Russare,
      m.Fangosberla, m.Ventogelato, m.Resistenza, m.Bullo, m.Tagliofuria,
      m.Sonnolalia, m.Psicamisu
    ],
    evolution: { stage: "base", to: [] }
  },
  "385": {
    name: "Jirachi",
    dexNumber: 385,
    type: ["Acciaio", "Psico"],
    gender: [],
    encounter: {
      rarity: "l",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 300,
    movesByLevel: {
      5: [m.Confusione, m.Desiderio],
      10: [m.Comete],
      15: [m.Altruismo],
      20: [m.Psichico],
      25: [m.Rinfrescata],
      30: [m.Riposo],
      35: [m.Sdoppiatore],
      40: [m.Divinazione],
      45: [m.Cosmoforza],
      50: [m.Obbliderio]
    },
    movesByMT: [
      m.IperRaggio, m.Fulmine, m.Tuono, m.Tossina, m.Psichico,
      m.Doppioteam, m.Schermoluce, m.Riflesso, m.Flash, m.Riposo,
      m.Protezione, m.Terrempesta, m.Ritorno, m.Frustrazione, m.Salvaguardia,
      m.Introforza, m.Pioggiadanza, m.Giornodisole, m.PallaOmbra, m.Facciata,
      m.Forzasegreta, m.Aeroassalto, m.Calmamente, m.Ondashock, m.Idropulsar,
      m.Fuocopugno, m.Gelopugno, m.Tuonopugno, m.Corposcontro, m.Sdoppiatore,
      m.Tuononda, m.Mimica, m.Ricciolscudo, m.Metronomo, m.Comete,
      m.Mangiasogni, m.Sostituto, m.Incubo, m.Russare, m.Fangosberla,
      m.Ventogelato, m.Resistenza, m.Bullo, m.Sonnolalia, m.Dinamipugno,
      m.Psicamisu
    ],
    evolution: { stage: "base", to: [] }
  },
  "386": {
    name: "Deoxys",
    dexNumber: 386,
    type: ["Psico"],
    gender: [],
    encounter: {
      rarity: "l",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 300,
    movesByLevel: {
      5: [m.Avvolgibotta, m.Fulmisguardo, m.OmbraNotturna],
      10: [m.Teletrasporto],
      15: [m.Privazione],
      20: [m.Inseguimento],
      25: [m.Psichico],
      30: [m.Scippo],
      35: [m.Cosmoforza],
      40: [m.Ripresa],
      45: [m.Psicoslancio],
      50: [m.IperRaggio]
    },
    movesByMT: [
      m.Taglio, m.Geloraggio, m.IperRaggio, m.Forza, m.Solarraggio,
      m.Fulmine, m.Tuono, m.Tossina, m.Psichico, m.Doppioteam,
      m.Schermoluce, m.Riflesso, m.Flash, m.Riposo, m.Protezione,
      m.Ritorno, m.Frustrazione, m.Salvaguardia, m.Introforza, m.Pioggiadanza,
      m.Giornodisole, m.PallaOmbra, m.Spaccaroccia, m.Attaccalite, m.Facciata,
      m.Centripugno, m.Provocazione, m.Breccia, m.Scippo, m.Forzasegreta,
      m.Rocciotomba, m.Aeroassalto, m.Calmamente, m.Ondashock, m.Idropulsar,
      m.Corposcontro, m.Sdoppiatore, m.MovimentoSismico, m.Tuononda, m.Mimica,
      m.Mangiasogni, m.Sostituto, m.Incubo, m.Ventogelato, m.Bullo
    ],
    evolution: { stage: "base", to: [] }
  }
};