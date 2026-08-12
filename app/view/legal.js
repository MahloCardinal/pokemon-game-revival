import { sceneShell } from "../client/render-utils.js";

function paragraph(text) {
  return "<p>" + text + "</p>";
}

function list(items) {
  return "<ul>" + items.map(function (item) {
    return "<li>" + item + "</li>";
  }).join("") + "</ul>";
}

function orderedList(items) {
  return "<ol>" + items.map(function (item) {
    return "<li>" + item + "</li>";
  }).join("") + "</ol>";
}

function legalArticle(title, sections) {
  return [
    '<article class="rules-article legal-article">',
    "<h2>" + title + "</h2>",
    sections.join(""),
    "</article>"
  ].join("");
}

function legalLayout(article) {
  return '<section class="legal-layout">' + article + "</section>";
}

function legalBackAction() {
  return "parent-back";
}

export function renderPrivacyPolicyScene() {
  var sections = [
    paragraph("Ultimo aggiornamento: 5 Luglio 2026"),
    paragraph("Questa Privacy Policy descrive come vengono trattati i dati personali degli utenti del sito <strong>PokéProject-32</strong>, disponibile all'indirizzo <strong>https://project-cg32x.vercel.app/</strong>."),
    paragraph("Il progetto è un gioco fan-made, gratuito e non commerciale."),
    "<h3>1. Titolare del trattamento</h3>",
    paragraph("Il titolare del trattamento è: <strong>Matteo Guerrieri</strong><br>Contatto email: <strong>pokeproject32@gmail.com</strong>"),
    paragraph("Per qualsiasi richiesta relativa ai dati personali puoi scrivere all'indirizzo indicato sopra."),
    "<h3>2. Dati raccolti</h3>",
    paragraph("Il sito raccoglie e tratta solo i dati necessari al funzionamento del gioco e dell'account utente."),
    paragraph("In particolare, possono essere trattati:"),
    list([
      "<strong>username</strong>, scelto dall'utente al momento della registrazione;",
      "<strong>password</strong>, conservata in forma non leggibile tramite hash e non in chiaro;",
      "<strong>email</strong>, facoltativa, se l'utente decide di inserirla per poter recuperare la password;",
      "<strong>dati di gioco</strong>, come impostazioni, progressi, salvataggi, stato dell'account e preferenze."
    ]),
    paragraph("Non vengono richiesti nome reale, cognome, indirizzo, numero di telefono o dati di pagamento."),
    "<h3>3. Finalità del trattamento</h3>",
    paragraph("I dati sono trattati per le seguenti finalità:"),
    orderedList([
      "creare e gestire l'account utente;",
      "consentire l'accesso al gioco online;",
      "salvare preferenze, impostazioni e progressi di gioco;",
      "permettere il recupero della password, solo se l'utente ha inserito un'email;",
      "garantire sicurezza, prevenzione di abusi, cheat, accessi non autorizzati o malfunzionamenti;",
      "rispondere a eventuali richieste dell'utente."
    ]),
    paragraph("I dati non sono utilizzati per pubblicità, marketing, profilazione commerciale o vendita a terzi."),
    "<h3>4. Base giuridica del trattamento</h3>",
    paragraph("Il trattamento dei dati necessari alla creazione e gestione dell'account si basa sulla necessità di fornire il servizio richiesto dall'utente."),
    paragraph("Il trattamento dei dati tecnici e dei log di sicurezza si basa sul legittimo interesse del gestore a mantenere il sito sicuro, funzionante e protetto da abusi."),
    paragraph("L'email è facoltativa e viene usata solo per il recupero password. Se l'utente non la inserisce, potrà comunque usare il gioco, ma potrebbe non essere possibile recuperare l'account in caso di perdita della password."),
    "<h3>5. Cookie e dati salvati nel browser</h3>",
    paragraph("Il sito utilizza solo cookie tecnici o strumenti equivalenti necessari al funzionamento del gioco, ad esempio per:"),
    list([
      "mantenere la sessione di login;",
      "ricordare impostazioni o preferenze tra una pagina e l'altra;",
      "consentire il corretto funzionamento del gioco."
    ]),
    paragraph("Non vengono usati cookie di profilazione, pubblicitari o di tracciamento marketing."),
    paragraph("L'utente può comunque cancellare o bloccare i cookie tramite le impostazioni del browser. In tal caso alcune funzioni del sito, come il login o il salvataggio delle preferenze, potrebbero non funzionare correttamente."),
    "<h3>6. Conservazione dei dati</h3>",
    paragraph("I dati dell'account sono conservati finché l'account resta attivo."),
    paragraph("L'utente può chiedere accesso, correzione, e cancellazione dei dati scrivendo a <strong>pokeproject32@gmail.com</strong>. In caso di cancellazione, i dati associati all'account saranno eliminati."),
    "<h3>7. Destinatari dei dati</h3>",
    paragraph("I dati non vengono venduti né ceduti a terzi."),
    paragraph("I dati possono essere trattati tramite servizi tecnici necessari al funzionamento del sito. Servizi utilizzati: <strong>Vercel</strong> (hosting), <strong>Supabase</strong> (database, servizio e-mail)."),
    "<h3>8. Modifiche alla Privacy Policy</h3>",
    paragraph("Questa Privacy Policy può essere aggiornata in caso di modifiche al sito o al trattamento dei dati."),
    paragraph("La versione aggiornata sarà pubblicata su questa pagina con indicazione della data di ultimo aggiornamento.")
  ];
  return sceneShell("Privacy Policy", "", legalLayout(legalArticle("Privacy Policy", sections)), "", "scene-content-legal", legalBackAction());
}

export function renderTermsScene() {
  var sections = [
    paragraph("Ultimo aggiornamento: 5 Luglio 2026"),
    paragraph("I presenti Termini d'uso regolano l'accesso e l'utilizzo del sito <strong>PokéProject-32</strong>, disponibile all'indirizzo <strong>https://project-cg32x.vercel.app/</strong>."),
    paragraph("Usando il sito o creando un account, l'utente dichiara di aver letto e accettato questi Termini d'uso."),
    "<h3>1. Natura del progetto</h3>",
    paragraph("<strong>PokéProject-32</strong> è un progetto fan-made, gratuito, amatoriale e non commerciale."),
    paragraph("Il gioco non è affiliato, approvato, sponsorizzato o autorizzato da Nintendo, Creatures Inc., GAME FREAK inc., The Pokémon Company o altri titolari dei diritti relativi al mondo Pokémon."),
    paragraph("Pokémon, i nomi dei Pokémon, gli sprite, le musiche, i marchi e tutti i materiali correlati appartengono ai rispettivi titolari."),
    paragraph("Il progetto non genera ricavi, non contiene pubblicità, non prevede acquisti, abbonamenti, merchandising o altre forme di monetizzazione."),
    "<h3>2. Account utente</h3>",
    paragraph("Per giocare è essere necessario creare un account."),
    paragraph("L'utente deve scegliere uno username e una password. L'inserimento dell'email è facoltativo e serve solo per il recupero password."),
    paragraph("L'utente è responsabile della riservatezza della propria password e delle attività effettuate tramite il proprio account."),
    paragraph("è vietato creare account con nomi offensivi, discriminatori, ingannevoli, impersonanti altre persone o contrari alle regole della community."),
    "<h3>3. Regole di comportamento</h3>",
    paragraph("L'utente si impegna a usare il sito e il gioco in modo corretto e rispettoso."),
    paragraph("è vietato:"),
    list([
      "insultare, molestare, minacciare o discriminare altri utenti;",
      "usare cheat, bot, script, exploit o strumenti automatici non autorizzati;",
      "tentare di accedere ad account, dati, server o aree non autorizzate;",
      "danneggiare, rallentare o compromettere il funzionamento del sito;",
      "sfruttare bug o errori del gioco senza segnalarli;",
      "pubblicare contenuti illegali, offensivi, violenti, pornografici, discriminatori o lesivi di diritti altrui;",
      "usare il gioco per spam, phishing o altre attività abusive."
    ]),
    "<h3>4. Moderazione, sospensione e cancellazione account</h3>",
    paragraph("Il gestore può intervenire in caso di violazione dei presenti Termini d'uso."),
    paragraph("A seconda della gravità del comportamento, il gestore può:"),
    list([
      "inviare un avviso;",
      "limitare temporaneamente alcune funzioni;",
      "sospendere l'account;",
      "cancellare l'account;",
      "rimuovere contenuti o dati di gioco collegati ad abusi, cheat o malfunzionamenti."
    ]),
    paragraph("Il gestore può inoltre intervenire per motivi tecnici, di sicurezza o per proteggere la community."),
    "<h3>5. Disponibilità del servizio</h3>",
    paragraph("Il gioco è fornito gratuitamente."),
    paragraph("Il gestore non garantisce che il sito sia sempre disponibile, privo di errori o compatibile con ogni dispositivo o browser."),
    paragraph("Il sito può essere modificato, sospeso o chiuso in qualsiasi momento, anche senza preavviso, soprattutto trattandosi di un progetto amatoriale e non commerciale."),
    "<h3>6. Progressi, salvataggi e dati di gioco</h3>",
    paragraph("Il gestore farà il possibile per mantenere correttamente salvataggi, progressi e dati di gioco, ma non garantisce che tali dati siano sempre disponibili o recuperabili."),
    paragraph("Bug, manutenzioni, errori tecnici o modifiche al gioco potrebbero causare perdita o modifica dei dati di gioco."),
    "<h3>7. Proprietà intellettuale e materiali Pokémon</h3>",
    paragraph("Il progetto può contenere o fare riferimento a materiali appartenenti al mondo Pokémon, inclusi nomi, sprite, strumenti, musiche o altri elementi."),
    paragraph("Tali materiali appartengono ai rispettivi titolari dei diritti."),
    paragraph("L'uso di tali materiali avviene nell'ambito di un progetto fan-made, gratuito, amatoriale e non commerciale."),
    paragraph("In caso di richiesta da parte dei titolari dei diritti, il gestore rimuoverà o modificherà i materiali interessati e, se necessario, sospenderà o chiuderà il progetto."),
    "<h3>10. Privacy</h3>",
    paragraph('Il trattamento dei dati personali degli utenti è descritto nella Privacy Policy, disponibile qui: <a href="/privacy-policy" data-action="open-privacy-policy">Privacy Policy</a>.'),
    paragraph("Creando un account, l'utente dichiara di aver letto la Privacy Policy."),
    "<h3>11. Modifiche ai Termini d'uso</h3>",
    paragraph("Il gestore può modificare questi Termini d'uso in caso di cambiamenti al sito, al gioco, alle regole della community o per esigenze legali o tecniche."),
    paragraph("La versione aggiornata sarà pubblicata su questa pagina con indicazione della data di ultimo aggiornamento."),
    "<h3>12. Contatti</h3>",
    paragraph("Per domande, segnalazioni, richieste di cancellazione account o comunicazioni relative al sito, è possibile scrivere a: <strong>pokeproject32@gmail.com</strong>")
  ];
  return sceneShell("Termini d'uso", "", legalLayout(legalArticle("Termini d'uso", sections)), "", "scene-content-legal", legalBackAction());
}
