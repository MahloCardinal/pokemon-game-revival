import { GDR_DATA as DATA, STAT_CAP_LEVELS, maxHpForLevel, maxPowerForLevel, maxStatsForLevel } from "../data/index.js";
import { BADGE_LEVEL_LIMITS, CAPTURE_LEVEL_LIMITS } from "../data/progression.js";
import { formatCatalogDescription } from "../engine/index.js";
import { assetPath, escapeHtml, getItemImage, getPokemonStaticImage, getTypeImage, renderImage } from "../client/asset-helpers.js";
import { button, sceneShell } from "../client/render-utils.js";

var RULES_SECTIONS = [
  { key: "about", label: "Pokémon Game Revival" },
  { key: "gdr", label: "Info GdR" },
  { key: "battle", label: "Info sulle lotte" },
  { key: "moves", label: "Info sulle mosse" },
  { key: "evolutions", label: "Lista evoluzioni" }
];

var EXTRA_LEARNABLE_MOVES = [
  { pokemon: "Exeggutor", move: "Falcecannone" },
  { pokemon: "Articuno", move: "Falcecannone" },
  { pokemon: "Moltres", move: "Falcecannone" },
  { pokemon: "Jumpluff", move: "Dinamipugno" },
  { pokemon: "Scizor", move: "Ghigliottina" },
  { pokemon: "Sneasel", move: "Purogelo" },
  { pokemon: "Magcargo", move: "Falcecannone" },
  { pokemon: "Skarmory", move: "Falcecannone" },
  { pokemon: "Kingdra", move: "Purogelo" },
  { pokemon: "Kingdra", move: "Privazione" },
  { pokemon: "Entei", move: "Falcecannone" },
  { pokemon: "Suicune", move: "Falcecannone" },
  { pokemon: "Celebi", move: "Falcecannone" },
  { pokemon: "Pelipper", move: "Falcecannone" },
  { pokemon: "Delcatty", move: "Falcecannone" },
  { pokemon: "Manectric", move: "Falcecannone" },
  { pokemon: "Plusle", move: "Falcecannone" },
  { pokemon: "Minun", move: "Falcecannone" },
  { pokemon: "Flygon", move: "Falcecannone" },
  { pokemon: "Lunatone", move: "Falcecannone" },
  { pokemon: "Solrock", move: "Falcecannone" },
  { pokemon: "Crawdaunt", move: "Inseguimento" },
  { pokemon: "Claydol", move: "Falcecannone" },
  { pokemon: "Absol", move: "Falcecannone" },
  { pokemon: "Glalie", move: "Falcecannone" },
  { pokemon: "Metagross", move: "Calmamente" },
  { pokemon: "Metagross", move: "Ipnosi" },
  { pokemon: "Latias", move: "Falcecannone" },
  { pokemon: "Latios", move: "Falcecannone" },
  { pokemon: "Kyogre", move: "Falcecannone" },
  { pokemon: "Rayquaza", move: "Falcecannone" }
];

export function rulesSectionByKey(key) {
  return RULES_SECTIONS.find(function (section) {
    return section.key === key;
  }) || RULES_SECTIONS[0];
}

function renderEffectivenessImage() {
  return renderImage(
    assetPath("img_miscellaneous", "tabella_efficacia.webp"),
    "Tabella efficacia tipi",
    "rules-effectiveness-image"
  );
}

function renderRulesType(typeName) {
  return renderImage(getTypeImage(typeName), typeName, "rules-type-inline");
}

function speciesName(speciesKey) {
  var entry = DATA.speciesLibrary[speciesKey];
  return entry ? entry.name || speciesKey : speciesKey;
}

function speciesKeyByName(name) {
  var normalizedName = String(name || "").toLocaleLowerCase("it-IT");
  return Object.keys(DATA.speciesLibrary).find(function (speciesKey) {
    var entry = DATA.speciesLibrary[speciesKey];
    return entry && String(entry.name || "").toLocaleLowerCase("it-IT") === normalizedName;
  }) || "";
}

function renderRulesPokemon(speciesKey) {
  return [
    '<span class="rules-entity rules-pokemon-entity">',
    renderImage(getPokemonStaticImage(speciesKey), speciesName(speciesKey), "rules-pokemon-sprite"),
    '<span>' + escapeHtml(speciesName(speciesKey)) + "</span>",
    "</span>"
  ].join("");
}

function renderRulesPokemonByName(name) {
  var speciesKey = speciesKeyByName(name);
  return speciesKey ? renderRulesPokemon(speciesKey) : escapeHtml(name);
}

function renderRulesItem(item) {
  return [
    '<span class="rules-entity rules-item-entity">',
    item && item.image ? renderImage(getItemImage(item.image), item.name, "rules-item-image") : "",
    '<span>' + escapeHtml(item ? item.name : "") + "</span>",
    "</span>"
  ].join("");
}

function evolutionRows() {
  return Object.keys(DATA.speciesLibrary).reduce(function (rows, speciesKey) {
    var entry = DATA.speciesLibrary[speciesKey];
    var evolutions = entry && entry.evolution && Array.isArray(entry.evolution.to) ? entry.evolution.to : [];
    evolutions.forEach(function (evolution) {
      if (evolution && evolution.trigger && evolution.trigger.kind === "item" && evolution.trigger.item && evolution.species) {
        rows.push({
          from: speciesKey,
          item: evolution.trigger.item,
          to: evolution.species
        });
      }
    });
    return rows;
  }, []);
}

function renderEvolutionTable() {
  var header = '<div class="evo-header"><span>Pokémon</span><span class="evo-cell-item">Pietra evolutiva</span><span>Evoluzione</span></div>';

  var rows = evolutionRows().map(function (row) {
    return [
      '<div class="evo-group">',
      '<div class="evo-cell">' + renderRulesPokemon(row.from) + '</div>',
      '<div class="evo-cell evo-cell-item">' + renderRulesItem(row.item) + '</div>',
      '<div class="evo-cell">' + renderRulesPokemon(row.to) + '</div>',
      "</div>"
    ].join("");
  }).join("");

  return [
    '<div class="rules-data-table rules-evolution-table">',
    header,
    rows,
    "</div>"
  ].join("");
}

function renderMovesTable() {
  var rows = DATA.moveLibrary.map(function (move) {
    return [
      '<div class="moves-group">',
      '<div class="moves-cell moves-cell-name"><strong>' + escapeHtml(move.name) + '</strong></div>',
      '<div class="moves-cell moves-cell-desc">' + escapeHtml(formatCatalogDescription(move)) + '</div>',
      "</div>"
    ].join("");
  }).join("");

  var header = '<div class="moves-header"><span>Nome</span><span>Effetto mossa</span></div>';

  return [
    '<div class="rules-data-table rules-moves-table">',
    header,
    rows,
    "</div>"
  ].join("");
}

function renderExtraLearnableMovesTable() {
  var rows = EXTRA_LEARNABLE_MOVES.map(function (row) {
    return [
      '<div class="moves-group">',
      '<div class="moves-cell moves-cell-name">' + renderRulesPokemonByName(row.pokemon) + '</div>',
      '<div class="moves-cell moves-cell-desc"><strong>' + escapeHtml(row.move) + '</strong></div>',
      "</div>"
    ].join("");
  }).join("");

  var header = '<div class="moves-header"><span>Pokémon</span><span>Mossa imparabile</span></div>';

  return [
    '<div class="rules-data-table rules-moves-table rules-extra-moves-table">',
    header,
    rows,
    "</div>"
  ].join("");
}

function renderRulesTable(headers, rows) {
  return [
    '<table class="rules-data-table"><thead><tr>',
    headers.map(function (header) { return '<th>' + escapeHtml(header) + '</th>'; }).join(""),
    '</tr></thead><tbody>',
    rows.map(function (row) {
      return '<tr>' + row.map(function (cell) { return '<td>' + escapeHtml(cell) + '</td>'; }).join("") + '</tr>';
    }).join(""),
    '</tbody></table>'
  ].join("");
}

function badgeLimitRows(limits, collapseTrailingEqual) {
  var rows = [];
  var end = limits.length - 1;
  var collapseStart = end;
  if (collapseTrailingEqual) {
    while (collapseStart > 0 && limits[collapseStart - 1] === limits[end]) {
      collapseStart -= 1;
    }
  }
  limits.forEach(function (limit, index) {
    if (collapseTrailingEqual && index > collapseStart) { return; }
    rows.push([index === collapseStart && collapseStart < end ? index + "+" : index, limit]);
  });
  return rows;
}

function renderCaptureLevelLimitTable() {
  return renderRulesTable(["Numero medaglie", "Lv max ricerca"], badgeLimitRows(CAPTURE_LEVEL_LIMITS, true));
}

function renderObedienceLevelLimitTable() {
  return renderRulesTable(["Numero medaglie", "Lv max obbedienza"], badgeLimitRows(BADGE_LEVEL_LIMITS, false));
}

function renderStatCapsTable() {
  return renderRulesTable(["Livello", "Punti Salute", "Potenza - Stats"], STAT_CAP_LEVELS.map(function (level) {
    return [level, maxHpForLevel(level), maxPowerForLevel(level) + " - " + maxStatsForLevel(level)];
  }));
}

function h3Match(content) {
  return /^<h3>([\s\S]*?)<\/h3>$/.exec(String(content || ""));
}

function rulesHeadingText(content) {
  var match = h3Match(content);
  return match ? match[1].replace(/<[^>]*>/g, "") : "";
}

function rulesHeadingId(sectionKey, index) {
  return "rules-heading-" + sectionKey + "-" + index;
}

function renderRulesHeadingNav(headings) {
  if (!headings.length) { return ""; }
  return '<div class="rules-heading-row">' + headings.map(function (heading) {
    return button(heading.label, "rules-heading-jump", 'data-heading-id="' + escapeHtml(heading.id) + '"', "rules-heading-button");
  }).join("") + "</div>";
}

function shouldRenderRulesHeadingNav(sectionKey) {
  return sectionKey !== "about" && sectionKey !== "evolutions";
}

function renderRulesSectionContent(sectionKey, contentItems) {
  var headingIndex = 0;
  var headings = [];
  var content = contentItems.map(function (item) {
    var match = h3Match(item);
    var id;
    if (!match) { return item; }
    id = rulesHeadingId(sectionKey, headingIndex);
    headings.push({ id: id, label: rulesHeadingText(item) });
    headingIndex += 1;
    return '<h3 id="' + escapeHtml(id) + '">' + match[1] + "</h3>";
  }).join("");
  return (shouldRenderRulesHeadingNav(sectionKey) ? renderRulesHeadingNav(headings) : "") + content;
}

function renderRulesArticle(section) {
  var contentMap = {
    about: [
      "<h3>Cos'è?</h3>",
      "<p>Benvenuti/e! Pokémon Game Revival è un gioco di ruolo ('GdR') incentrato su un'avventura nel mondo Pokémon.</p>",
      "<p>La sua creazione nasce dalla nostalgia di un vecchio gdr Pokémon nato nei forum di internet ormai più di vent'anni fa, e altro non è che il tentativo di crearne una versione nuova e automatizzata.</p>",
      "<p>Per giocare vi basterà muovervi tra le varie sezioni con dei semplici click per compiere azioni con il vostro personaggio. Al momento la modalità è principalmente single-player, ma in futuro spero di riuscire a implementare anche sfide e interazioni tra i vari giocatori.</p>",
      "<h3>Come potete aiutarmi?</h3>",
       "<p>Il gioco è ancora in fase di sviluppo, per cui è possibile ci siano errori o malfunzionamenti. Inoltre anche struttura, regole, e logiche di gioco potrebbero non essere ottimali.</p>",
       "<p>Per questo in caso di consigli, osservazioni, rilevazioni di bug (e più in generale tutto quello che avete da dirmi) vi chiedo di scrivermi tramite email all'indirizzo: <strong>guerrieri.tals@gmail.com</strong></p>",
       "<p>Eventualmente potete scrivere in DM al seguente account Instagram: <a href=\"https://www.instagram.com/pokemongamerevival\"><strong>Pokémon Game Revival</strong></a></p>",
       "<h3>Aggiornamenti previsti</h3>",
      "<p>Di seguito i bug conosciuti e gli aggiornamenti di gioco che sono in programma, intanto vi invito a testare così com'è.</p>",
      "<p class='rules-note'><strong>Battaglia</strong><span>Verificare corretto funzionamento e interazione di mosse e Strumenti in battaglia</span></p>",
      "<p class='rules-note'><strong>Battaglia</strong><span>Implementare sfide PvP tra giocatori</span></p>",
      "<p class='rules-note'><strong>Battaglia</strong><span>Inserire modalità in inglese</span></p>",
    ],
    gdr: [
      "<h3>Scopo del gioco</h3>",
      "<p>Fondamentalmente gli obiettivi principali di questo gioco di ruolo sono due: diventare Campioni di Kanto e collezionare tutti i Pokémon! Riguardo il completamento del Pokédex, alcuni Pokémon non sono ancora ottenibili normalmente (per esempio i Pokémon Leggendari), ma lo saranno in seguito tramite eventi o nuove implementazioni.</p>",
      "<p>Riguardo la velocità di avanzamento all'interno del gioco, bisogna partire dal presupposto che alcune difficoltà e limitazioni sono voluti, per esempio:</p>",
      "<ul><li>Far avanzare di livello i proprio Pokémon: può risultare faticoso e ripetitivo farlo solo tramite le Zone cattura, da cui l'utilità di <strong>Pensione</strong> e <strong>Zona allenamento</strong>, che però richiedono più tempo. Nel frattempo nulla impedisce di continuare a livellare tramite Pokémon selvatici</li><li>Acquisizione di Pokédollari e acquisto Strumenti: la fonte principale di guadagno è la <strong>Zona allenamento</strong>, ma per evitarne abusi il premio pieno è disponibile solo per la prima vittoria di ogni giorno. Ciò di conseguenza limita le risorse acquistabili, che quindi devono essere scelte con cura</li><li>Difficoltà delle Palestre: considerate che le mosse degli NPC non sono ottimizzate, oltre al fatto che il giocatore può contare su un'intera squadra costruita ad-hoc, per cui le Palestre quando possibile sfrutteranno appieno gli Strumenti a loro disposizione</li></ul>",
      "<h3>Zone cattura</h3>",
      "<p>Nella sezione delle Zone cattura potrete trovare gli habitat dove andare a catturare nuovi Pokémon da aggiungere alla vostra collezione. La ricerca base permette di scegliere zona e fascia di livello, ma con gli strumenti adatti potrete ottenere ricerche anche più precise. Di seguito la tabella dei livelli massimi che è possibile cercare in base al numero di Medaglie possedute</p>",
      renderCaptureLevelLimitTable(),
      "<h3>Livelli di obbedienza</h3>",
      "<p>Il numero di Medaglie che possedete influenzarà non solo Livello massimo dei Pokémon selvatici, ma anche il Livello massimo dei Pokémon che potrete tenere con voi.</p>",
      "<p>Se un Pokémon ha già raggiunto il massimo Livello in base al vostro numero di Medaglie, non acquisisce più esperienza finché non otterrete la Medaglia successiva.</p>",
      renderObedienceLevelLimitTable(),
      "<h3>Lottare contro un Pokémon</h3>",
      "<p>Se scegliete di combattere contro un Pokémon selvatico si aprirà la schermata di combattimento. Al suo interno trovate il riquadro che indica i Pokémon attualmente in campo, e anche un pannello interscambiabile che contienere lo sato attuale della battaglia e il log delle mosse effettuate dagli sfidanti. Durante il vostro turno potrete:</p>",
      "<ul><li>attaccare, cliccando sul bottone della mossa che volete effettuare, dopodiché il Pokémon selvatico risponderà in automatico;</li><li>sostituire il vostro Pokémon in campo, cliccando il bottone che si trova sotto ogni Pokémon nel pannello della vostra squadra;</li><li>usare uno strumento dallo zaino, cliccando il bottone 'Usa' di fianco alle targhette, mentre cliccando direttamente la targhetta potrete leggere l'effetto dello strumento.</li></ul>",
      "<p>Tra gli strumenti da utilizzare ci sono anche vari tipi di Poké Ball, per tentare di catturare il Pokémon selvatico!</p>",
      '<p class="rules-note"><strong>Importante</strong><span>In <strong>qualsiasi</strong> sfida, che sia contro un Pokémon selvatico o contro un allenatore, non è possibile usare più di <strong>3 copie</strong> dello stesso strumento (ad eccezione delle Ball per catturare i Pokémon selvatici).</span></p>',
      "<p>Se volete rinunciare alla sfida, il bottone 'Abbandona scontro' si trova in fondo al pannello con il riassunto della sfida.<br>Al termine dello scontro la vostra squadra sarà automaticamente curata, senza bisogno di passare per il Centro Pokémon, che ha altre funzionalità.<br>Tuttavia se la vostra intera squadra andrà ko, perderete 1/5 dei vostri Pokédollari.</p>",
      '<p class="rules-note"><strong>Importante</strong><span>In questo gioco NON si considera il Tipo della mossa, bensì il Tipo del Pokémon stesso. Questo significa che se un Pokémon di Tipo ' + renderRulesType("Fuoco") + ' attacca un Pokémon di Tipo ' + renderRulesType("Erba") + ', farà sempre un danno superefficace a prescindere dalla mossa utilizzata.</span></p>',
      renderEffectivenessImage(),
      "<h3>Guadagnare esperienza</h3>",
      "<p>Quando mettete ko un Pokémon selvatico, il Pokémon che l'ha messo ko guadagna Punti Esperienza ('Exp') pari al livello del Pokémon sconfitto per un moltiplicare a seconda del suo livello.</p>",
      "<p><strong>Non vengono considerati i ko indiretti</strong>, dovuti per esempio a status come Avvelenamento o al meteo.</p>",
      '<table class="rules-data-table"><thead><tr><th>Livello Pokémon vincitore</th><th>Exp ottenuta</th></tr></thead><tbody><tr><td>5-30</td><td>(Lv Pokémon sconfitto)x5</td></tr><tr><td>31-60</td><td>(Lv Pokémon sconfitto)x3</td></tr><tr><td>61-99</td><td>(Lv Pokémon sconfitto)x2</td></tr></tbody></table>',
      "<p>Per esempio se un Pokémon Lv18 sconfigge un Pokémon di Lv10 guadagna 10x5 = 50 punti esperienza, mentre se un Pokémon Lv50 sconfigge un Pokémon di Lv10 guadagna 10x3 = 30 punti esperienza. L'esperienza viene acquisita solo <strong>al termine della lotta</strong>.</p>",
      "<p>Se il Pokémon sale di livello ottiene +2 ai Punti Vita massimi e +3 alla potenza delle mosse. Inoltre salendo di livello può imparare nuove mosse o addirittura evolvere!</p>",
      "<p><strong>Punti Esperienza necessari per aumentare di 1 livello</strong></p>",
      "<ul><li>Pokémon Base non evoluti da Pokémon Baby e Pokémon Baby: 50 Punti Esperienza</li><li>1° Evoluzione e Pokémon evoluti da Pokémon Baby: 100 Punti Esperienza</li><li>2° Evoluzione e Pokémon evoluti da evoluzioni di Pokémon Baby: 150 Punti Esperienza</li><li>Pokémon senza Evoluzione: 100 Punti Esperienza</li><li>Pokémon Leggendario: 300 Punti Esperienza</li></ul>",
      "<h3>Centro Pokémon</h3>",
      "<p>Nel Centro Pokémon è possibile compiere alcune azioni sui Pokémon della vostra squadra:</p>",
      "<ul><li>assegnare o togliere uno strumento;</li><li>usare uno strumento, per esempio una pietra evolutiva o un potenziatore;</li><li>usare una MT, ossia una Macchina Tecnica, che permette al Pokémon di imparare una nuova mossa (purché possa apprenderla);</li></ul>",
      "<p>Riguardo le MT, queste possono essere usate quante volte si vuole, non sono usa e getta.</p>",
      "<h3>Centro commerciale</h3>",
      "<p>Nel Centro Commerciale è possibile acquistare strumenti diversi in ognuno dei reparti, anche se molti sono acquistabili solo dopo aver vinto un certo numero di Medaglie. È possibile che ci siano strumenti non acquistabili, nel qual caso sono ottenibili in altre modalità e/o diventeranno acquistabili in particolari eventi.</p>",
      "<h3>Zona allenamento</h3>",
      "<p>La Zona allenamento è una zona particolare dove vi sarà concesso di cercare uno allenatore da poter sfidare per ottenere dei premi. Ogni giorno la prima sfida vi darà il premio completo, mentre le successive avranno ricompense molto minori (si resetta a mezzanotte). Le regole della sfida sono indicate in base alla difficoltà. Se si viene sconfitti non c'è alcuna penalità.</p>",
      "<h3>Giardino</h3>",
      "<p>Nel Giardino viene offerta una descrizione delle Bacche esistenti, e inoltre vi è possibile piantare le vostre! Si possono piantare fino a 3 Bacche contemporaneamente, che cresceranno con il tempo. Una volta che la pianta è giunta all fine del proprio ciclo, sarà possibile raccoglierne i frutti.</p>",
      "<h3>Club Pokéfan</h3>",
      "<p>Nel Club Pokéfan potrete ritirare dei premi, rari e non, in base a quanto avete ampliato la vostra collezione di Pokémon! Sappiate che alcuni Strumenti sono ottenibili solo qua.</p>",
      "<h3>Pensione</h3>",
      "<p>Nella Pensione vi sarà possibile affidare alle cure degli allevatori i vostri Pokémon, che saliranno di livello in base alle ore in cui li lascerete depositati. Attenzione ad avere i Pokédollari necessari per poterli ritirare.</p>",
      "<h3>Scheda e Box</h3>",
      "<p>Nella sezione Scheda sono indicati i vostri dati allenatore, i Pokémon attualmente in squadra (massimo 6), gli strumenti che possedete, e lo stato del vostro Pokédex, utile a tracciare quali Pokémon siete riusciti a ottenere. Il Box contiene tutti gli altri Pokémon che avete possedete.<br>Potete inviare i Pokémon dalla Scheda al Box e viceversa tramite i bottoni sotto le singole card dei Pokémon.</p>",
      '<p class="rules-note"><strong>Importante</strong><span>Non è possibile avere in squadra più di 2 Pokémon della stessa specie. Per esempio non si possono avere 3 Charmander, ma sono ammessi 2 Charmander e 1 Charmeleon.</span></p>',
      '<p class="rules-note"><strong>Importante</strong><span>Non è possibile avere in squadra più di 2 Pokémon con lo stesso strumento assegnato.</span></p>',
      "<h3>Lega Kanto</h3>",
      "<p>Per progredire nella vostra avventura dovrete sconfiggere i Capipalestra di Kanto! Per farlo vi basterà accedere alla sezione del Capopalestra e iniziare la sfida.</p>",
      "<p>Attenzione: ogni Palestra avrà delle limitazioni specifiche, e se perdete o abbandonate la sfida dovrete rinunciare a 1/5 dei vostri Pokédollari.</p>",
      "<p>Una volta sconfitta anche l'ottava palestra, si sbloccherà la sfida contro i Superquattro di Kanto, ossia gli allenatori ritenuti i più forti della regione. Migliore di loro è soltanto il Campione di Kanto: l'ultima sfida da superare per ottenere il rango di Campione e vincere il gioco!</p>",
      "<p>Sconfiggere la Lega non è da poco: i Superquattro vanno sfidati uno dopo l'altro, senza possibilità di modificare la propria squadra, per poi passare alla sfida finale con il Campione. Se si perde la scalata, nei tentativi succcessivi bisognerà sempre ricominciare dal primo Superquattro.</p>",
      "<p class='rules-note'><strong>Importante</strong><span>Mentre per le prime sei Palestre il Capopalestra sarà gestito dal programma, a partire dalla settima Palestra (inclusi Superquattro e Campione di Kanto) a fare le mosse sarà un giocatore reale.</span><span>Questo significa che la risposta non sarà istantanea e potrebbe volerci anche un giorno o più a seconda della disponibilità, proprio come vent'anni fa sui primi forum :P</span></p>",
    ],
    battle: [
      "<h3>Debolezze e resistenze</h3>",
      "<p>Per verificare se il vostro Pokémno fa danno superefficace, poco efficace, o normale sul Pokémon avversario bisogna considerare la seguente tabella:</p>",
      renderEffectivenessImage(),
      "<p>Ricordo che si considera il <strong>Tipo del Pokémon</strong>, non quello della mossa. Ulteriore differenza rispetto ad altri giochi Pokémon è che non esistono Tipi 'immuni' ad altri, ma sono considerati 'poco efficaci'.</p>",
      "<h3>Pokémon con tipo multiplo</h3>",
      "<p>In caso di Pokémon con Tipo multiplo va considerata l'efficacia totale. Prendiamo come esempio un Magneton " + renderRulesType("Elettro") + "/" + renderRulesType("Acciaio") + " che attacca un Gyarados " + renderRulesType("Acqua") + "/" + renderRulesType("Volante") + ".</p>",
      "<ul><li>" + renderRulesType("Elettro") + " vs " + renderRulesType("Acqua") + " = superefficace</li><li>" + renderRulesType("Elettro") + " vs " + renderRulesType("Volante") + " = superefficace</li><li>" + renderRulesType("Acciaio") + " vs " + renderRulesType("Acqua") + " = poco efficace</li><li>" + renderRulesType("Acciaio") + " vs " + renderRulesType("Volante") + " = anno normale</li></ul>",
      "<p>Considerando che è maggiore il numero di 'superefficace', Magneton farà danno x2 a Gyarados.</p>",
      '<p class="rules-note"><strong>Importante</strong><span>In questo gioco non esistono danni x4 o :4 da efficacia. Per esempio se Pikachu ' + renderRulesType("Elettro") + ' attacca Gyarados ' + renderRulesType("Acqua") + "/" + renderRulesType("Volante") + ', anche se Pikachu è 2 volte superefficace il danno sarà x2, e non x4.</span></p>',
      "<h3>Cambiamenti di stato</h3>",
      "<p>Ciascun Pokémon può essere affetto da un solo cambiamento di stato per volta. Finché il Pokémon è affetto da uno status esso non viene 'sostituito', anche se si usa una mossa che lo cambierebbe ulteriormente.</p>",
      "<p>Per esempio se si usa Tuononda su un Pokémon addormentato, esso continua a dormire e non è paralizzato.</p>",
      "<p><strong>Sonno</strong></p>",
      "<ul><li>Dura 3 turni</li><li>Il Pokémon non può usare attacchi (tranne in casi particolari, come Russare)</li><li>Se si usa un oggetto si conta come un turno di sonno trascorso</li><li>Ritirando il Pokémon, esso non si sveglia. Se rientra in campo dovrà dormire il numero di turni che gli mancavano quando è stato ritirato</li></ul>",
      "<p><strong>Paralisi</strong></p>",
      "<ul><li>Non ha limiti di tempo</li><li>Il Pokémon attacca una volta no, una sì, una no, una sì...</li><li>Se si usa un oggetto nel turno in cui il proprio Pokémon non attaccherebbe, esso, nel turno dopo, non attaccherà (stessa cosa vale se, nel turno in cui si usa un oggetto, esso attaccherebbe)</li><li>Ritirando il Pokémon, la Paralisi non si cura. Se rientra in campo potrà attaccare o no a seconda di cosa avrebbe potuto fare quando è stato ritirato</li></ul>",
      "<p><strong>Confusione</strong></p>",
      "<ul><li>Dura 5 turni</li><li>Il Pokémon attacca una volta no, una sì, una no, una sì...</li><li>Nei turni in cui non riesce ad attaccare si colpisce da solo e perde 1/16 dei propri PS Max</li><li>Se si usa un oggetto nel turno in cui il proprio Pokémon non attaccherebbe, esso, nel turno dopo, non attaccherà (stessa cosa vale se, nel turno in cui si usa un oggetto, esso attaccherebbe)</li><li>Se si usa un oggetto mentre si è confusi (a prescindere se il Pokémon attaccherebbe o no) si considera trascorso uno dei 5 turni della confusione</li><li>Ritirando il Pokémon esso guarisce dalla Confusione</li></ul>",
      "<p><strong>Veleno</strong></p>",
      "<ul><li>Non ha limiti di tempo</li><li>Il Pokémon attacca regolarmente, ma dopo ogni suo attacco (anche se si usano oggetti) perde 1/16 dei propri PS Max</li><li>Il Pokémon perde PS solo se è in campo (se si ritira un Pokémon avvelenato, non perderà PS finché non tornerà in campo)</li><li>Ritirando il Pokémon, l'Avvelenamento non si cura</li></ul>",
      "<p><strong>Scottatura</strong></p>",
      "<ul><li>Non ha limiti di tempo</li><li>Il Pokémon attacca regolarmente, ma dopo ogni suo attacco (anche se si usano oggetti) perde 1/16 dei propri PS Max</li><li>Il Pokémon perde PS solo se è in campo (se si ritira un Pokémon scottato, non perderà PS finché non tornerà in campo)</li><li>Ritirando il Pokémon, la Scottatura non si cura</li><li>Finché un Pokémon è Scottato ha l'Attacco diminuito di 1.5xLv mentre è in campo</li></ul>",
      "<p><strong>Congelamento</strong></p>",
      "<ul><li>Non ha limiti di tempo</li><li>Il Pokémon non può attaccare, tranne usare attacchi che hanno la possibilità di scongelarlo</li><li>Ritirando il Pokémon, il congelamento non si cura</li></ul>",
      "<h3>Statistiche</h3>",
      "<p>Le modifiche di statistiche su un Pokémon durano finché è in campo, salvo specifiche diverse della mossa.</p>",
      "<p>Nel caso un Pokémon abbia due modifiche di statistiche concordi (per esempio due aumenti di Attacco), si considera il buff/nerf più alto.</p>",
      "<p>Nel caso di statistiche discordi, si fa la somma (per esempio se il mio Pikachu ha +10 Attacco, ma l'avversario usa una mossa che gli fa -6 Attacco, alla fine il mio Pikachu avrà +4 Attacco).</p>",
      "<h3>Calcolo del danno</h3>",
      "<p>Per il calcolo del danno, l'ordine dei modificatori da considerare è il seguente:</p>",
      "<p><strong>(Effetti che aumentano e diminuiscono l'Attacco) (Moltiplicatori delle Mosse) (Debolezze/Resistenze) (Effetti che aumentano/diminuiscono la Difesa) (Oggetti assegnati/usati)</strong></p>",
      "<h3>Regola del 50%</h3>",
      "<p>Alcune mosse oltre al danno hanno un effetto secondario che si attiva in base alla regola del 50%, oppure ci sono le mosse OHKO (Abisso, Perforcorno, ...) che la sfruttano per mandare direttamente KO l'avversario.</p>",
      '<p class="rules-note"><strong>Importante</strong><span>Ogni squadra può contenere al massimo 2 Pokémon con mosse OHKO.</span></p>',
      "<p>Ecco come funziona esattamente la regola. Partiamo dal fatto che durante la lotta ogni allenatore ha la variabile 'Percentuale' (indicata anche con '%' o '50%'). Questa può essere <strong>positiva</strong> o <strong>negativa</strong>.</p>",
      "<p>All'inizio di ogni sfida, ogni allenatore parte sempre con il 50% positivo.</p>",
      "<p>Quando un allenatore utilizza una mossa soggetta alla regola del 50%, si applica un effetto in base al valore che possiede in quel momento:</p>",
      "<ul><li>se l'allenatore ha il 50% positivo, la mossa applica anche il suo effetto aggiuntivo e la percentuale diventa negativa;</li><li>se l'allenatore ha il 50% negativo, l'effetto non si applica, ma la % torna positiva.</li></ul>",
      "<p>In pratica, le mosse al 50% alternano attivazione e mancata attivazione. Nota bene che se una mossa come Geloraggio infligge danno e ha il 50% di congelare l'avversario, il danno viene comunque inflitto a prescindere dalla %.</p>",
      "<p>Facciamo un esempio con le mosse <strong>Geloraggio (-87, 50% Congela l'avversario)</strong> e <strong>Abisso (50% manda ko l'avversario)</strong>, e supponiamo che vengano utilizzate una dopo l'altra in quest'ordine: (1) Geloraggio, (2) Abisso, (3) Abisso, (4) Geloraggio.</p>",
      "<p>Vediamo come si applica la regola:</p>",
      "<ol><li>Geloraggio infligge 87 danni e congela l'avversario. L'allenatore ora ha la % negativa</li><li>Abisso fallisce dato che l'allenatore aveva la % negativa. La % torna positiva</li><li>Stavolta Abisso manda ko l'avversario. La % diventa negativa</li><li>Geloraggio infligge 87 danni e NON congela l'avversario. La % torna positiva</li></ol>",
      "<p>In sintesi:</p>",
      "<ul><li>Il 50% è legato all'allenatore, non al Pokémon in campo</li><li>Cambiare Pokémon non influisce sul 50%</li><li>Ogni allenatore inizia la lotta con il 50% positivo</li><li>Solo le mosse soggette alla regola del 50% consumano o ricaricano il valore del 50%</li><li>Le mosse con effetto garantito al 100% non influenzano il conteggio</li><li>Con il 50% positivo, la mossa applica anche l'effetto secondario, dopodiché il 50% diventa negativo</li><li>Con il 50% negativo, la mossa NON applica l'effetto secondario, dopodiché il 50% diventa positivo</li></ul>",
      "<h3>Strumenti</h3>",
      "<p><strong>Distraroma</strong></p>",
      "<p>In caso riceva una mossa che altera lo status e infligge danni: i danni vengono inflitti subito e lo status dopo 2 turni.</p>",
      "<p>Lo status in attesa rimane tale anche se il Pokémon in questione viene ritirato: se il Pokémon viene ritirato e dopo un turno sarebbe stato confuso/paralizzato/... verrà confuso/paralizzato/... il turno dopo quello in cui è tornato in campo.</p>",
      "<p>Sonno e recupero PS causati da Riposo NON vengono ritardati da Distraroma. Tuttavia usare Riposo annulla eventuali status in attesa.</p>",
      "<p>Un Pokémon con uno status in attesa da Distraroma NON può subire altri status.</p>",
      "<p><strong>Bacche</strong></p>",
      "<p>Le Bacche sono strumenti che possono essere assegnati ai Pokémon. Quando si attiva la condizione, il Pokémon mangia la Bacca e ne attiva l'effetto.</p>",
      "<p>Per esempio se un Pokémon che tiene Baccaliegia viene Paralizzato, il Pokémon consuma la Bacca e si cura autonomamente. Per quanto riguarda le Bacche che restituiscono PS, si attivano quando il Pokémon scende sotto 1/4 dei PS massimi.</p>",
      "<p>Oltre a questa modalità, alcune Bacche possono essere usate direttamente come strumenti per curare il Pokémon. Per esempio se un Pokémon è Addormentato, posso usare Baccastagna per svegliarlo, come se usassi lo strumento Sveglia.</p>",
      "<h3>Doppio KO</h3>",
      "<p>In caso di doppio KO, per esempio dopo mosse come Autodistruzione, le azioni successive avvengono nel seguente ordine:</p>",
      "<ul><li>Giocatore 1 usa Autodistruzione, entrambi i Pokémon vanno ko</li><li>Giocatore 2 manda in campo il nuovo Pokémon attivo</li><li>Giocatore 1 manda in campo il nuovo Pokémon attivo</li><li>Giocatore 2 esegue la mossa normalmente e si prosegue</li></ul>",
      "<p>Nel caso il doppio ko, chi ha usato la mossa conclusiva <strong>perde lo scontro</strong>.</p>",
      "<h3>Auto KO</h3>",
      "<p>Nel caso un Pokémon vada ko nel proprio turno, per esempio a causa dell'Avvelenamento, il giocatore dovrà scegliere il turno stesso il nuovo Pokémon da mandare in campo. Dopodiché inizierà il turno dell'avversario.</p>",
      "<h3>Limiti PS e potenza mosse</h3>",
      "<p>Un Pokémon può aumentare i propri PS e potenza/stats delle proprio mosse solo fino a un certo limite determinato dal suo livello attuale. Infatti i valori potrebbero aumentare indefinitivamente tramite l'utilizzo delle Vitamine, oltre che salendo di livello e imparando nuove mosse. Ecco la tabella dei limiti:</p>",
      renderStatCapsTable(),
      "<p>Esempio: se usassi dieci PP-Max su <strong>Ruggito (-3 Attacco avversario)</strong> del mio Growlithe Lv20, l'attacco non potrà andare oltre <strong>Ruggito (-5 Attacco avversario)</strong>.</p>",
      "<p>Riguardo i livelli intermedi, bisogna considerare l'ultimo limite raggiunto e aggiungere 3 per i PS e 2 per le mosse. Per esempio per il limite PS del livello 15 prendiamo il limite del livello 10 e aggiungiamo 3 per ogni livello di differenza: quindi il limite PS del livello 15 sarà (5x3)+60=75.</p>",
      "<h3>Effetti meteorologici</h3>",
      "<p>Il meteo indotto da una mossa dura finché non viene usata una mossa meteorologica differente, e in tal caso il vecchio viene sostituito dal nuovo. Oppure si può annullare il meteo attivo tramite l'oggetto Elisir Chiarocielo.</p>",
      "<p><strong>Giornodisole</strong></p>",
      "<ul>",
      "<li>Il danno base delle mosse dei Pokémon " + renderRulesType("Fuoco") + " è aumentato di metà del livello di chi attacca</li>",
      "<li>Il danno base delle mosse dei Pokémon " + renderRulesType("Acqua") + " è diminuito di metà del livello di chi attacca</li>",
      "<li>I Pokémon " + renderRulesType("Fuoco") + " ignorano i nerf alle statistiche (anche quelli già presenti)</li>",
      "</ul>",
      "<p><strong>Pioggiadanza</strong></p>",
      "<ul>",
      "<li>Il danno base delle mosse dei Pokémon " + renderRulesType("Acqua") + " è aumentato di metà del livello di chi attacca</li>",
      "<li>Il danno base delle mosse dei Pokémon " + renderRulesType("Fuoco") + " è diminuito di metà del livello di chi attacca</li>",
      "<li>Tuono paralizza al 100% (la percentuale non viene persa/recuperata)</li>",
      "</ul>",
      "<p><strong>Terrempesta</strong></p>",
      "<ul>",
      "<li>Ogni Pokémon perde PS pari a 1/8 dei propri PS massimi alla fine di ogni turno. I Pokémon " + renderRulesType("Acciaio") + ", " + renderRulesType("Terra") + " e " + renderRulesType("Roccia") + " sono esclusi.</li>",
      "<li>I Pokémon " + renderRulesType("Roccia") + " guadagnano un buff in Attacco e Difesa pari a metà del proprio livello.</li>",
      "</ul>",
      "<p><strong>Grandine</strong></p>",
      "<ul>",
      "<li>Ogni Pokémon perde PS pari a 1/8 dei propri PS massimi alla fine di ogni turno. I Pokémon " + renderRulesType("Ghiaccio") + " ne sono esclusi.</li>",
      "<li>I Pokémon " + renderRulesType("Ghiaccio") + " guadagnano un buff in Attacco e Difesa pari a metà del proprio livello.</li>",
      "</ul>",
    ],
    evolutions: [
      "<h3>Evoluzioni tramite metodi particolari</h3>",
      "<p>Molti Pokémon si evolvono salendo di livello, mentre qua sono indicate tutte le evoluzioni che si effettuano in altro modo. Se non trovate un Pokémon che vi aspettereste di vedere, significa che in questo gioco evolve salendo di livello.</p>",
      renderEvolutionTable()
    ],
    moves: [
      "<h3>Lista mosse ed effetti</h3>",
      "<p>Attualmente il gioco è aggiornato con Pokémon fino alla terza generazione e le informazioni sulle mosse che si possono apprendere le potete trovare nelle enciclopedie online.</p>",
      "<p>Per facilitarvi nella ricerca potete inserire il nome del Pokémon nella casella sottostante, e cliccando il bottone vi poterà a una pagina con le mosse che può apprendere. Fate attenzione al nome, dato che se è scritto male la pagina sarà vuota.</p>",
      '<div class="rules-move-search"><input type="text" id="rules-move-input" class="rules-move-input" placeholder="Inserisci il nome del Pokémon" />' + button("Vai alla lista mosse", "rules-move-wiki") + '<span class="rules-move-copy-wrapper">' + button("Non funziona? Cliccami per copiare il link", "rules-move-copy-link", 'id="rules-move-copy-btn"') + '<span class="rules-move-copy-tooltip">URL copiato, incollalo nella barra degli indirizzi del browser</span>' + "</span></div>",
      "<p>Di seguito la tabella con la lista delle mosse e i relativi effetti.</p>",
      renderMovesTable(),
      "<h3>Mosse extra imparabili</h3>",
      "<p>Data la diversa gestione dei Pokémon e delle battaglie, alcuni Pokémon possono imparare mosse aggiuntive salendo di Livello e/o tramite MT, per renderli più competitivi all'interno del GdR.</p>",
      renderExtraLearnableMovesTable()
    ]
  };

  return [
    '<article class="rules-article">',
    '  <h2>' + escapeHtml(section.label) + "</h2>",
    renderRulesSectionContent(section.key, contentMap[section.key] || []),
    "</article>"
  ].join("");
}

export function renderRulesContent(sectionKey) {
  return renderRulesArticle(rulesSectionByKey(sectionKey));
}

function renderRulesSectionPanel(activeSectionKey) {
  var activeKey = rulesSectionByKey(activeSectionKey).key;
  var actionButtons = RULES_SECTIONS.map(function (section) {
    var selectedClass = section.key === activeKey ? " button-primary" : " button-ghost";
    return button(section.label, "rules-section", 'data-section="' + escapeHtml(section.key) + '"', "button-slim" + selectedClass);
  }).join("");

  return [
    '<section class="panel rules-sections-panel"><div class="panel-inner">',
    '  <div class="pokemon-center-action-row rules-section-row">' + actionButtons + "</div>",
    "</div></section>"
  ].join("");
}

function renderRulesContentPanel(activeSectionKey) {
  return [
    '<section class="rules-content-panel" data-rules-content data-scroll-key="rules-content">',
    renderRulesContent(activeSectionKey),
    "</section>",
    '<button type="button" class="rules-top-button" data-action="rules-scroll-top">Torna su</button>'
  ].join("");
}

export function renderRulesScene(scene) {
  var activeSectionKey = rulesSectionByKey(scene && scene.rulesSection).key;
  var body = [
    '<section class="rules-layout">',
    renderRulesSectionPanel(activeSectionKey),
    renderRulesContentPanel(activeSectionKey),
    "</section>"
  ].join("");
  return sceneShell("Regolamento", "", body, "", "scene-content-rules", "parent-back");
}
