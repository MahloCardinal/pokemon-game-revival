import * as Moves from "./moves.js";

function moveIndexes(moves) {
  return Object.freeze(moves.map(function (move) {
    if (!move || !Number.isFinite(Number(move.index))) {
      throw new Error("Categoria IA PvE con mossa non valida.");
    }
    return Number(move.index);
  }));
}

export const PVE_MOVE_CATEGORIES = Object.freeze({
  status: moveIndexes([
    Moves.Canto, Moves.Demonbacio, Moves.Ipnosi, Moves.Meloderba,
    Moves.Sonnifero, Moves.Spora, Moves.Velenogas, Moves.Velenpolvere,
    Moves.Dolcebacio, Moves.Stordiraggio, Moves.Strampadanza, Moves.Supersuono,
    Moves.Fuocofatuo, Moves.Paralizzante, Moves.SguardoFeroce, Moves.Tuononda,
    Moves.Adulazione, Moves.Bullo, Moves.Sbadiglio
  ]),

  statSelfAtk: moveIndexes([
    Moves.Affilatore, Moves.Agilita, Moves.Gridodilotta, Moves.Meditazione,
    Moves.Codadiluce, Moves.Danzaspada, Moves.Panciamburo, Moves.Maledizione,
    Moves.Calmamente, Moves.Crescita, Moves.Dragodanza, Moves.Granfisico,
    Moves.Altruismo, Moves.Focalenergia
  ]),

  statSelfDef: moveIndexes([
    Moves.Accumulo, Moves.Amnesia, Moves.Barriera,
    Moves.Cosmoforza, Moves.Doppioteam, Moves.Ferroscudo, Moves.Minimizzato,
    Moves.Rafforzatore, Moves.Ricciolscudo, Moves.Ritirata, Moves.ScudoAcido,
    Moves.Docciascudo, Moves.Leggimente, Moves.Localizza, Moves.Sottocarica,
    Moves.Calmamente, Moves.Crescita, Moves.Dragodanza, Moves.Granfisico,
    Moves.Riflesso, Moves.Schermoluce
  ]),

  statEnemyAtk: moveIndexes([
    Moves.Attrazione, Moves.Cinesi, Moves.Cottonspora, Moves.Danzadipiume,
    Moves.Fangata, Moves.Fascino, Moves.Millebave, Moves.MurodiFumo,
    Moves.Ruggito, Moves.Turbosabbia, Moves.Visotruce, Moves.Memento,
    Moves.Solletico
  ]),

  statEnemyDef: moveIndexes([
    Moves.Colpocoda, Moves.Falselacrime, Moves.Ferrostrido, Moves.Fulmisguardo,
    Moves.Profumino, Moves.Stridio, Moves.Memento, Moves.Solletico
  ]),

  gainHP: moveIndexes([
    Moves.Buonlatte, Moves.Covauova, Moves.Lucelunare, Moves.Pigro,
    Moves.Ripresa, Moves.Desiderio, Moves.Mattindoro, Moves.Sintesi,
    Moves.Radicamento, Moves.Riposo
  ]),

  utility: moveIndexes([
    Moves.Nebbia, Moves.Protezione, Moves.Individua, Moves.Salvaguardia,
    Moves.Giornodisole, Moves.Grandine, Moves.Pioggiadanza, Moves.Terrempesta,
    Moves.Attaccalite, Moves.Inibitore, Moves.Provocazione, Moves.Blocco,
    Moves.Malosguardo, Moves.Ragnatela, Moves.Boato, Moves.Turbine,
    Moves.Camuffamento, Moves.Conversione, Moves.Conversione2, Moves.Destinobbligato,
    Moves.Esclusiva, Moves.Flash, Moves.Dispetto, Moves.Magivelo,
    Moves.Malcomune, Moves.Mimica, Moves.Resistenza, Moves.Sostituto,
    Moves.Ripeti, Moves.Schizzo, Moves.Trasformazione, Moves.Ultimocanto
  ]),

  noUtility: moveIndexes([
    Moves.Punte, Moves.Introenergia, Moves.Sfoghenergia, Moves.Nube,
    Moves.Preveggenza, Moves.Segugio, Moves.Psicamisu, Moves.Scippo,
    Moves.Staffetta, Moves.Aromaterapia, Moves.Rintoccasana, Moves.Rinfrescata,
    Moves.Incubo, Moves.Sonnolalia, Moves.Raggiro, Moves.Riciclo,
    Moves.Teletrasporto, Moves.Splash
  ]),

  damageNoPercentagePriority1: moveIndexes([
    Moves.Avvolgibotta, Moves.Legatutto, Moves.Mulinello, Moves.Sabbiotomba,
    Moves.Tenaglia, Moves.Turbofuoco, Moves.Parassiseme, Moves.Abbagliante,
    Moves.Foschisfera, Moves.Aerocolpo, Moves.Ossoclava, Moves.Troppoforte,
    Moves.Vampata, Moves.Tossina, Moves.Dinamipugno, Moves.Falcecannone,
    Moves.Magifuoco, Moves.Doppiocalcio, Moves.Furia, Moves.Missilspillo,
    Moves.Sparalance, Moves.Tagliofuria, Moves.Eruzione, Moves.Zampillo,
    Moves.Inseguimento, Moves.Introforza, Moves.Ira, Moves.Vendetta,
    Moves.Metronomo, Moves.MovimentoSismico, Moves.OmbraNotturna, Moves.Picchiaduro
  ]),

  damageNoPercentagePriority2: moveIndexes([
    Moves.IperRaggio, Moves.Idrocannone, Moves.Incendio, Moves.Radicalbero,
    Moves.Comete, Moves.Pugnodombra, Moves.Magnitudo,
    Moves.Raffica, Moves.Stramontante, Moves.Tornado, Moves.Rapigiro,
    Moves.Divinazione, Moves.Obbliderio, Moves.Ruotafuoco, Moves.Facciata,
    Moves.Megassorbimento, Moves.Sanguisuga, Moves.Gigassorbimento, Moves.Fuocopugno,
    Moves.Tuonopugno, Moves.Colpokarate, Moves.Frana, Moves.Gelopugno,
    Moves.Fangosberla, Moves.Taglio, Moves.Fangobomba, Moves.Terremoto,
    Moves.Sassata, Moves.Aeroassalto, Moves.ColpoBasso, Moves.Megacorno,
    Moves.Finta, Moves.Spaccaroccia, Moves.Surf, Moves.Psicoraggio, Moves.Cascata,
    Moves.Breccia, Moves.Centripugno, Moves.Contropiede, Moves.Flagello,
    Moves.Privazione
  ]),

  damageNoPercentagePriority3: moveIndexes([
    Moves.Aerasoio, Moves.Aeroattacco, Moves.AttaccoPioggia, Moves.AttaccoRapido,
    Moves.AttaccodAla, Moves.Azione, Moves.Beccata, Moves.Bolla,
    Moves.Bollaraggio, Moves.Botta, Moves.Bottintesta, Moves.Braciere,
    Moves.Bruciapelo, Moves.Cadutamassi, Moves.Calciardente, Moves.Calcinvolo,
    Moves.Calciorullo, Moves.Calciosalto, Moves.Colpodifango, Moves.Cometapugno,
    Moves.Confusione, Moves.Doppiasberla, Moves.Dragartigli, Moves.Extrarapido,
    Moves.Extrasenso, Moves.Fanghiglia, Moves.Fendifoglia, Moves.Fogliamagica,
    Moves.Foglielama, Moves.Forza, Moves.Frustata, Moves.Frustrazione,
    Moves.Gelolancia, Moves.Giornopaga, Moves.Graffio, Moves.Granvoce,
    Moves.Idropompa, Moves.Incornata, Moves.Incrocolpo, Moves.Iperzanna,
    Moves.IradiDrago, Moves.Lacerazione, Moves.Limitazione, Moves.Martellata,
    Moves.Megacalcio, Moves.Megapugno, Moves.Morso, Moves.Ondacalda,
    Moves.Ondashock, Moves.Ossomerang, Moves.Ossoraffica, Moves.PallaGelo,
    Moves.Perforbecco, Moves.Pestone, Moves.Pistolacqua, Moves.Polneve,
    Moves.Presa, Moves.Psicoslancio, Moves.Pugnorapido, Moves.Pugnospine,
    Moves.Ritorno, Moves.Russare, Moves.Sberletese, Moves.Schianto,
    Moves.Semitraglia, Moves.Sfuriate, Moves.Sgomento, Moves.Sonicboom,
    Moves.Tripletta, Moves.Triplocalcio, Moves.Tuonoshock, Moves.Uovobomba,
    Moves.Velenocoda, Moves.Velenospina, Moves.Vitaltiro
  ]),

  damageNoPercentagePriority4: moveIndexes([
    Moves.Capocciata, Moves.Pazienza, Moves.Colpo, Moves.Oltraggio,
    Moves.Petalodanza, Moves.Solarraggio, Moves.Ventagliente, Moves.Fossa,
    Moves.Volo, Moves.Sub, Moves.Rimbalzo, Moves.Baraonda, Moves.Maniereforti,
    Moves.Assorbimento, Moves.Mangiasogni, Moves.PallaClima, Moves.Naturforza,
    Moves.Forzasegreta, Moves.Assistente, Moves.Autodistruzione, Moves.Esplosione,
    Moves.Contrattacco, Moves.Specchiovelo, Moves.Falsofinale, Moves.Psiconda,
    Moves.Riduttore, Moves.Locomovolt, Moves.Sdoppiatore, Moves.Sottomissione, Moves.Rimonta,
    Moves.Rotolamento, Moves.Speculmossa, Moves.Superzanna
  ]),

  damagePercentageStatus: moveIndexes([
    Moves.DoppioAgo, Moves.Fango, Moves.Smog, Moves.Velenodenti,
    Moves.Idropulsar, Moves.Segnoraggio, Moves.Stordipugno, Moves.Bora,
    Moves.Geloraggio, Moves.Corposcontro, Moves.Dragospiro, Moves.Fulmine,
    Moves.Leccata, Moves.Scintilla, Moves.Fuocobomba, Moves.Lanciafiamme,
    Moves.Tuono
  ]),

  damagePercentageStatSelfAtk: moveIndexes([
    Moves.Ferrartigli, Moves.Meteorpugno, Moves.Tritartigli, Moves.Forzantica,
    Moves.Ventargenteo
  ]),

  damagePercentageStatSelfDef: moveIndexes([
    Moves.Alacciaio, Moves.Rocciotomba, Moves.Forzantica,
    Moves.Ventargenteo
  ]),

  damagePercentageStatEnemyAtk: moveIndexes([
    Moves.Octazooka, Moves.Raggiaurora, Moves.Ventogelato
  ]),

  damagePercentageStatEnemyDef: moveIndexes([
    Moves.Acido, Moves.Codacciaio, Moves.Psichico, Moves.Sgranocchio,
    Moves.PallaOmbra
  ]),

  damagePercentageOther: moveIndexes([
    Moves.Abisso, Moves.Ghigliottina, Moves.Perforcorno, Moves.Purogelo,
    Moves.Furto, Moves.Supplica, Moves.Regalino
  ]),
});

const PVE_MOVE_CATEGORY_INDEX = Object.freeze((function () {
  var index = Object.keys(PVE_MOVE_CATEGORIES).reduce(function (byMoveIndex, category) {
    PVE_MOVE_CATEGORIES[category].forEach(function (moveIndex) {
      if (!byMoveIndex[moveIndex]) {
        byMoveIndex[moveIndex] = [];
      }
      if (byMoveIndex[moveIndex].indexOf(category) === -1) {
        byMoveIndex[moveIndex].push(category);
      }
    });
    return byMoveIndex;
  }, {});

  Object.keys(index).forEach(function (moveIndex) {
    index[moveIndex] = Object.freeze(index[moveIndex]);
  });

  return index;
}()));

function categoriesForMove(move) {
  return PVE_MOVE_CATEGORY_INDEX[Number(move && move.index)] || [];
}

export function pveMoveHasCategory(move, category) {
  return categoriesForMove(move).indexOf(category) !== -1;
}

export function pveMoveCategoriesFor(move) {
  return categoriesForMove(move).slice();
}
