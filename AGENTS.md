# AGENTS.md — Pokemon Game Revival

## Scopo

Questo repository contiene il progetto definitivo Pokemon Game Revival. È una SPA statica a moduli ES con backend autoritativo Supabase.

- Sito: `https://pokemon-game-revival.vercel.app`
- Repository: `https://github.com/MahloCardinal/pokemon-game-revival`
- Branch di produzione: `main`
- Progetto Supabase: `etotvaneppzkxunezqrl`
- Progetto Vercel: `pokemon-game-revival`

Il progetto è esclusivamente Revival. Non reintrodurre codice legacy, modalità staging, nomi versionati come `_v1` o riferimenti ai vecchi progetti.

## Regole di lavoro

- Controllare `git status` prima e dopo ogni intervento.
- Preservare modifiche locali dell'utente non pertinenti al compito.
- Prima di ogni push, verificare e committare anche le modifiche locali già presenti dell'utente; se non appartengono all'intervento corrente, salvarle in un commit separato precedente. Restano esclusi segreti, dump e gli altri file che queste regole vietano di committare.
- `tools/` fa parte del repository e le sue modifiche devono essere incluse nei commit. Non modificarne autonomamente il contenuto se il compito non lo richiede.
- Non creare o committare dump SQL generati, segreti, token, password, service-role key o webhook.
- Non usare comandi `npm`: il repository non contiene `package.json`, lockfile o pipeline npm.
- Il progetto non usa Docker. Non installarlo, avviarlo o verificarlo per i flussi ordinari: usare Supabase collegato e Vercel. Un avviso della CLI relativo alla sola cache o all'ambiente locale Docker non annulla un'operazione remota conclusa con successo.
- Preferire modifiche piccole e additive. Non riscrivere migrazioni già applicate.
- Non aumentare limiti PostgreSQL per nascondere ricorsioni, query difettose o altri errori logici.
- Non eliminare account o dati reali durante i test. Gli account temporanei devono essere rimossi al termine anche in caso di errore.

## Architettura

### Frontend

- `index.html`: ingresso della SPA; carica esplicitamente tutti i CSS e `app/client/main.js`.
- `app/client/`: stato, sessione, routing, eventi, persistenza e coordinamento UI.
- `app/view/`: markup delle schermate. Effetti, callback e stato restano nel client.
- `app/api/`: adattatori verso Supabase; restituiscono dati di trasporto e non devono importare lo stato client.
- `app/i18n/`: cataloghi dei testi visibili, separati dai dati tecnici di gioco.
- `app/styles/`: CSS suddiviso per schermata o funzionalità.
- `app/assets/`: immagini, sprite, icone, sfondi e musica.

### Regole del gioco

- `app/data/`: cataloghi e regole statiche, incluse progressione, strumenti, zone, palestre e missioni.
- `app/engine/`: motore di battaglia, Pokémon, squadre, cattura, strumenti tenuti e costruzione degli avversari.

`app/` è la sorgente canonica del gameplay. Non modificare manualmente la copia del runtime dentro le Edge Function.

### Backend

- `supabase/migrations/`: baseline e migrazioni additive del database.
- `supabase/functions/`: sorgente delle Edge Function.
- `supabase/functions/_shared/`: helper condivisi e mirror generato del motore.
- `supabase/config.toml`: configurazione Supabase e verifica JWT delle funzioni.

La cartella `supabase/` è codice sorgente essenziale, non semplice documentazione. Il push GitHub/Vercel non distribuisce automaticamente migrazioni o Edge Function.

## Flusso delle richieste

```text
azione dell'utente
→ handler in app/client
→ adattatore in app/api
→ RPC PostgreSQL oppure Edge Function
→ autenticazione, revisione e validazione server
→ modifica atomica e ricevuta idempotente
→ risposta canonica
→ aggiornamento dello stato e rendering
```

Il browser non è fonte autoritativa e non deve concedere ricompense. Le battaglie passano da `battle-command`: JavaScript esegue il motore attendibile, mentre PostgreSQL conserva lock, revisioni, ricevute, snapshot, proiezioni ed eventi.

## Convenzioni frontend

- Le azioni UI usano `data-action` e vengono registrate con `registerAction()`.
- `app/client/action-bootstrap.js` importa gli handler per i loro effetti una sola volta.
- Non aggiungere dispatch specifici delle funzionalità direttamente a `main.js`.
- Una nuova schermata deve essere aggiunta coerentemente al parsing delle route, alla generazione delle route e al renderer.
- Usare `escapeHtml()` per i valori dinamici inseriti nel markup.
- Usare gli helper di `app/client/asset-helpers.js` e il catalogo esplicito `app/data/asset-paths.js`; non costruire percorsi a partire da etichette tradotte o chiavi tecniche.
- Le modifiche che richiedono persistenza devono attraversare i comandi autoritativi o il flusso di salvataggio già previsto.
- Se un'azione sincrona o asincrona cambia soltanto un pannello, una lista o un indicatore della schermata corrente, aggiornare una regione DOM nominata con `data-render-region` e `renderRegions()`. Usare `render()` completo soltanto quando cambia la scena o la sua struttura generale. I popup usano `renderDialogLayer()` e non devono ricostruire la pagina sottostante.
- Le regole di progressione restano centralizzate in `app/data/progression.js`.
- Importare l'API pubblica del motore tramite `import * as Engine from "../engine/index.js"` quando possibile.
- Revival supporta soltanto missioni avventura, cattura e giornaliere. Non reintrodurre categorie o reset per missioni ripetibili.
- Nel Centro Commerciale `price: null` significa sempre “non acquistabile”; non mantenere elenchi separati di disponibilità che possano divergere dal prezzo.
- Per le MT, il Tier `0` significa premio non acquistabile e produce sempre `price: null`; Club Pokéfan, Centro Commerciale e Negozio Lotta devono filtrare tramite questa regola canonica, senza elenchi paralleli delle MT escluse.
- I Titoli Allenatore sono definiti tecnicamente in `app/data/titles.js`; nomi e requisiti visibili appartengono soltanto a i18n. Gli sblocchi sono automatici, permanenti e autoritativi: non aggiungere polling o controlli frontend che concedano titoli.
- `Nuovo arrivato` appartiene alla collezione onboarding ed è concesso quando viene scelto lo starter; non fa parte della collezione stabile `trainer_titles_initial`. Il Titolo preferito è marcato su `player_title`, può essere scelto soltanto tra quelli posseduti tramite RPC autoritativo e non incrementa la revisione di gioco.
- Le Schede giocatori espongono soltanto il Titolo preferito. Non reintrodurre l'ultimo Titolo ottenuto né l'elenco completo dei Titoli nella proiezione pubblica.
- I Titoli basati sui tipi usano le registrazioni del Pokédex da qualsiasi fonte. Considerano tutte le specie del catalogo e ogni tipo di una specie doppio tipo, escludendo soltanto le rarità `fossil` e `legendary`; la rarità tecnica `mythic` resta valida.
- La missione della prima collezione resta legata alla collezione stabile `trainer_titles_initial`, non a ogni eventuale Titolo aggiunto in futuro.

La pagina `/styles`, `app/view/styles.js` e `app/styles/style-proposals.css` sono strumenti intenzionali dell'utente debug; non eliminarli come presunto codice di sviluppo inutilizzato.

### Testi e internazionalizzazione

- Identificatori, chiavi persistite e valori usati dalla logica devono essere in inglese e indipendenti dalla lingua visualizzata. Non confrontare né salvare etichette tradotte.
- Ogni testo visibile appartiene ai cataloghi sotto `app/i18n/`; italiano e inglese devono mantenere lo stesso schema. Non inserire stringhe UI direttamente in view, handler o motore.
- I cataloghi di gioco conservano chiavi tecniche, indici e regole, non copie inglesi dei nomi a schermo. In particolare il nome di una MT si compone via i18n dal suo numero e dalla chiave tecnica della mossa; i consumer non devono leggere `.name` come etichetta visibile.
- Usare `t()` per testo risolto immediatamente e `textDescriptor()` o `messageDescriptor()` per testo conservato nello stato o risolto più tardi. Nel renderer passare i descrittori a `resolveText()` prima di `escapeHtml()`.
- Dopo modifiche i18n eseguire `node --experimental-vm-modules scripts/audit-i18n.mjs` oltre ai test ordinari.

## Regole particolari del motore

- Il danno non applica STAB.
- La logica usa il tipo del Pokémon attaccante, non il tipo della mossa, dove previsto dal motore attuale.
- `BattleManager.emit()` aggiunge soltanto eventi al log.
- La UI di livello, mosse ed evoluzione appartiene al client, mentre l'esito canonico appartiene al backend.
- Conservare le regole di composizione della squadra nel motore e non duplicarle nei renderer.

### Pokémon Shiny

- Gli incontri selvatici applicano un tiro autoritativo con probabilità canonica `1/2000`; il frontend non decide mai se un Pokémon è Shiny.
- Lo stato compatto usa soltanto `sh: 1`. Il bonus ricevuto all'ottenimento resta incorporato nei valori persistiti del Pokémon, che da quel momento crescono normalmente; non conservare il livello di ottenimento o duplicare i bonus nello stato.
- `PP` nelle specifiche Shiny indica la potenza della mossa (`power`), non i punti utilizzo delle mosse.
- I cap Shiny dipendono dal livello corrente, non dal livello di ottenimento. Tabelle, cap e bonus canonici sono in `app/data/stat-tables.js`; la probabilità è in `app/data/progression.js`.
- Gli sprite Shiny restano in `app/assets/img_pokemon/` con suffisso finale `_shiny` (`25_shiny.webp`, `25_f_shiny.webp`) e devono ereditare scala e allineamento dallo sprite normale corrispondente.
- Lo strumento debug di `aaa` può creare uno Shiny, ma il relativo comando deve continuare a essere validato dalla Edge Function e dal database.

### Pokémon Legendary

- La rarità tecnica `legendary` concede all'ottenimento un bonus massimo di `+80 PV`, `+65 Power` e `+65 Stats`; sotto il livello 60 il bonus scala linearmente, dal livello 60 in poi resta pieno.
- I valori ricevuti restano incorporati nel Pokémon e crescono normalmente. I cap aggiungono gli stessi bonus Legendary in base al livello corrente: al livello 100 sono `480 PV`, `385 Power` e `235 Stats` per un Legendary non Shiny.
- Shiny e Legendary sono proprietà indipendenti e i relativi bonus e cap si sommano.

## Battaglie autoritative

- `battle-command` è l'unico ingresso Edge per le battaglie del giocatore e le funzioni debug previste.
- Gli RPC mutanti autoritativi non devono essere eseguibili direttamente dai ruoli browser.
- I comandi mantengono command ID, revisioni attese e ricevute idempotenti.
- Non considerare un timeout di trasporto come prova che un comando non sia stato eseguito.
- Applicare lo stato canonico restituito dal server prima di ricostruire la proiezione o mostrare ricompense.
- La catena SQL di preparazione deve rimanere aciclica:

```text
prepare_edge_battle_command
→ prepare_edge_battle_command_with_inventory
→ prepare_edge_battle_command_with_contract_items
→ prepare_edge_battle_command_with_roster
→ prepare_edge_battle_command_core
```

- Il `core` è il lettore terminale e non deve richiamare uno degli altri livelli della catena.
- Gli aggregati terminali e gli altri dati transitori devono conservare le retention configurate.
- Un incontro selvatico non ancora legato a una battaglia appartiene alla revisione giocatore che lo ha creato: qualsiasi successiva mutazione autoritativa lo annulla atomicamente. Le battaglie di cattura già inizializzate restano protette; le altre schede si aggiornano tramite la normale invalidazione della revisione.
- La versione snapshot accettata da PostgreSQL deve corrispondere a `BATTLE_SNAPSHOT_VERSION` in `app/engine/battle-runtime.js`; il test Revival deve fallire se le due versioni divergono.

## Runtime Edge e cataloghi

Quando cambia codice canonico usato dalle battaglie:

```powershell
node scripts/sync-game-runtime.mjs
node scripts/sync-game-runtime.mjs --check
```

Il mirror in `supabase/functions/_shared/game-runtime/` e il relativo checksum devono corrispondere ad `app/`. Non modificare manualmente il manifest generato.

Una nuova coppia catalogo/runtime richiede un binding additivo. Non sostituire un binding mentre esistono battaglie o snapshot attivi con checksum incompatibile.

Prima di considerare conclusa una modifica a dati canonici usati dal backend, controllare sempre l'intera catena, non soltanto i file frontend:

1. sorgente canonica in `app/data/` o `app/engine/`;
2. tutti i consumer frontend e gli eventuali percorsi client-side residui;
3. generatore del catalogo in `scripts/`;
4. validazioni e funzioni autoritative SQL che leggono quei dati;
5. mirror Edge generato e nuovo checksum del runtime;
6. binding catalogo/runtime richiesto dalla Edge Function;
7. stato realmente applicato sul progetto Supabase collegato.

Il superamento dei test locali dimostra coerenza del repository, ma non dimostra che catalogo, migrazioni, binding ed Edge Function siano già distribuiti.

I cataloghi SQL vengono generati dalle sorgenti in `app/data/` e `app/engine/`. Non committare i dump risultanti.

Revival mantiene una sola release stabile chiamata `revival-baseline`, anche quando esistono utenti reali. Non clonare l'intero catalogo per una modifica puntuale e non cambiare `catalog_release_id` dei profili. Ogni aggiornamento dei dati usa una nuova migrazione e il change set atomico introdotto da `20260814120000_granular_game_data_changes.sql`:

```sql
begin;

select server_authority_private.begin_game_data_change(
  p_label => 'Descrizione leggibile',
  p_affected_families => array['shop']::text[],
  p_source_checksums => jsonb_build_object(
    'app/data/shopping-center.js', '<sha256 del file canonico>'
  ),
  p_requires_battle_idle => false
);

-- Modificare soltanto le righe necessarie, sempre limitandole alla baseline.

select server_authority_private.finish_game_data_change();
commit;
```

Per creare lo scheletro corretto e calcolare automaticamente gli SHA-256 delle sorgenti:

```powershell
node scripts/create-game-data-change.mjs --slug aggiorna_prezzo --label "Aggiorna un prezzo" --families shop --source app/data/shopping-center.js
```

Il change set:

- porta la baseline in `draft` soltanto all'interno della transazione;
- impedisce modifiche al catalogo fuori dal change set;
- registra tabella, operazione e valori precedenti/successivi di ogni riga toccata;
- aggiorna conteggi, manifest e checksum delle sole famiglie dichiarate;
- ripubblica lo stesso `catalog_release_id` e incrementa `game_data_revision`;
- annulla l'intera transazione se non viene completato correttamente.

Usare `p_requires_battle_idle => true` per dati che possono influenzare una battaglia, un incontro o una risoluzione già aperti: roster e premi avversari, mosse, specie, learnset, evoluzioni, regole di combattimento, cattura o progressione. Prezzi di acquisto, etichette e altri valori consumati soltanto da una nuova azione possono normalmente usare `false`.

Una modifica ai dati non richiede automaticamente un nuovo runtime. Controllare però il grafo del mirror: se il file canonico è importato da `app/engine/battle-runtime.js`, il contenuto eseguibile Edge cambia davvero e servono sync, binding additivo e deploy di `battle-command`. Oggi, per esempio, i learnset delle specie sono usati anche per generare squadre di Allenamento e Torre Lotta e appartengono quindi al runtime; i premi Pokéfan e i prezzi commerciali non dovrebbero richiedere un nuovo runtime salvo dipendenze indirette da rimuovere o giustificare.

Se serve compatibilità durante un deploy del runtime, aggiungere il nuovo binding senza rimuovere quello precedente. Disabilitare il binding di transizione soltanto dopo il deploy della Edge Function e dopo aver verificato che non esistano battaglie o snapshot che lo usano. Preservare sempre l'utente `aaa` e il ruolo `debug`; la baseline stabile evita migrazioni dei profili.

Verifica deterministica della baseline corrente:

```powershell
node scripts/generate-all-catalog-seeds.mjs --release revival-baseline --checksum draft:revival-baseline --species-chunks 4 --check
```

## Supabase

Le Edge Function applicative sono:

- `register-with-username`
- `login-with-username`
- `request-password-recovery`
- `delete-account`
- `battle-command`

Tutte devono conservare `verify_jwt = true` in `supabase/config.toml`.

### Recupero password

L'email è facoltativa in registrazione. Quando presente, coincide con l'email dell'utente Supabase Auth ed è indicizzata nella tabella privata tramite RLS `player_auth_recovery`; gli account senza email usano soltanto l'indirizzo tecnico `@pokemon-game-revival.local` e non possono richiedere il recupero.

`request-password-recovery` verifica la coppia username–email senza rivelare se esiste, quindi chiama il recupero nativo Supabase. Il redirect canonico è il dato pubblico e fisso `https://pokemon-game-revival.vercel.app/auth/recovery`: non reintrodurre il segreto `APP_URL`, localhost o URL dei progetti eliminati. Supabase Auth deve mantenere:

- Site URL: `https://pokemon-game-revival.vercel.app`;
- Redirect URL consentito: `https://pokemon-game-revival.vercel.app/auth/recovery` (oltre all'origine principale se necessaria ad altri flussi).

La SPA usa `detectSessionInUrl`, intercetta `PASSWORD_RECOVERY`, mostra il form di nuova password e aggiorna la credenziale con `auth.updateUser()`. `vercel.json` deve continuare a riscrivere `/auth/recovery` verso `index.html`.

La configurazione remota Auth può essere aggiornata separatamente dal codice Edge. Non assumere che un errore finale di `supabase config push` implichi un rollback: il comando può aver già applicato Auth prima di fallire leggendo un altro servizio. Controllare sempre il diff proposto, preservare MFA/conferme/rate limit esistenti e verificare lo stato remoto prima di ripetere il comando.

### Migrazioni

Creare sempre una nuova migrazione:

```text
supabase/migrations/YYYYMMDDHHMMSS_descrizione.sql
```

Non modificare una migrazione già applicata. Prima di ogni operazione remota verificare che il progetto collegato sia `etotvaneppzkxunezqrl`.

Procedura:

```powershell
supabase db push --linked --dry-run
supabase db push --linked
supabase db lint --linked --level error
supabase migration list --linked
```

### Edge Function

Il push su GitHub non aggiorna le Edge Function. Distribuire esplicitamente soltanto quelle modificate sul progetto Revival. Prima di distribuire `battle-command` eseguire sempre:

```powershell
node scripts/sync-game-runtime.mjs --check
```

### Notifiche Discord delle battaglie admin

`battle-command` invia una notifica Discord dopo l'inizializzazione riuscita delle battaglie `admin_gym` e `league` e ogni volta che una mossa del giocatore restituisce il turno all'amministratore, per qualsiasi giocatore incluso `aaa`. La sfida `debug_training` della Zona Allenamento deve restare esclusa.

Il webhook è il segreto Supabase `DISCORD_ADMIN_BATTLE_WEBHOOK_URL`: non inserirne mai il valore nel repository, nelle migrazioni o nei log. I messaggi devono avere un campo `content` testuale non vuoto e il link diretto al pannello admin. La consegna è best effort e non deve mai impedire l'avvio o l'avanzamento della battaglia. Le ricevute private `server_authority_private.discord_admin_battle_notification` e `server_authority_private.discord_admin_battle_turn_notification` impediscono invii duplicati in caso di retry; non aggirarle con chiamate Discord dal frontend.

Le proiezioni complete restano nella risposta Edge, ma gli RPC di commit ricevono la variante ridotta tramite `projectionForDatabase()`: non reinviare `battle_state`, scelte di presentazione o stato grafico dei partecipanti, perché duplicano lo snapshot e possono superare il limite SQL nelle squadre numerose.

## Utenti speciali

- `admin`: amministrazione prevista delle battaglie e delle configurazioni.
- `aaa`: ruolo server `debug`, strumenti di debug e accesso alla pagina `/styles`.

Le funzionalità di `aaa` sono intenzionali e devono essere preservate. Ogni privilegio deve essere validato anche dal backend e non soltanto nascosto o mostrato nel browser.
I controlli debug `+1`/`-1` dei Titoli usano il comando Edge autoritativo `debug_titles`: aggiungono il primo Titolo non posseduto o rimuovono il primo Titolo posseduto secondo `sortOrder`. Non sostituirli con scritture browser su `player_title`.

## Versione frontend e cache

Il progetto non usa un numero di versione frontend manuale e non deve reintrodurre `app-version.json` o contatori da aggiornare a ogni modifica. `api/deployment-version.js` espone automaticamente lo SHA Git o l'URL univoco del deployment Vercel; `app/client/deployment-version.js` lo controlla all'avvio, quando la scheda torna visibile e periodicamente.

Quando cambia il deployment, le schede già aperte vengono ricaricate automaticamente. Durante una battaglia attiva il refresh resta rinviato. Non sostituire questo meccanismo con un file di versione modificato manualmente.

`vercel.json` impone inoltre la rivalidazione di HTML, moduli applicativi e CSS, così un nuovo caricamento o refresh riceve gli asset correnti.

Un push su `main` avvia il deploy automatico Vercel. Il dominio principale cambia soltanto quando il deployment è `Ready`; verificare il risultato pubblico e non soltanto il successo di `git push`.

## Verifiche locali

Test delle invarianti Revival:

```powershell
node --experimental-vm-modules scripts/test-revival-baseline.mjs
```

Controllo del runtime Edge:

```powershell
node scripts/sync-game-runtime.mjs --check
```

Controllo generale del diff:

```powershell
git diff --check
```

Per ogni file JavaScript modificato, verificarne il parsing come modulo ES:

```powershell
node --experimental-vm-modules --input-type=module --eval "import { readFileSync } from 'node:fs'; import vm from 'node:vm'; new vm.SourceTextModule(readFileSync(process.argv[1], 'utf8'), { identifier: process.argv[1] });" "app/client/example.js"
```

`ExperimentalWarning` è previsto; un errore di parsing no.

Per testare localmente route e refresh della SPA, usare `vercel.cmd dev` dalla radice quando la CLI Vercel è disponibile.

## Git e deploy frontend

Flusso ordinario:

```powershell
git status
git pull --ff-only
git diff --check
git add <file-selezionati>
git commit -m "Descrizione chiara"
git push
```

Preferire file selezionati a `git add .` per controllare con precisione il contenuto del commit. Le modifiche già presenti in `tools/` appartengono al progetto e devono essere incluse, pur senza alterarne autonomamente il contenuto se non richiesto.

## File locali e rigenerabili

- `.git/`: essenziale; non eliminare.
- `vercel.json`: configurazione versionata del sito; conservare.
- `.vercel/`: collegamento locale alla CLI; eliminabile se si usa soltanto GitHub.
- `.env.local`: configurazione locale; non committare.
- `supabase/.temp/`: collegamento e metadati locali della CLI; rigenerabile ma utile.
- `.build/`: artefatti temporanei; eliminabile e non versionare.
- `tools/`: strumenti e informazioni personali versionati; includere le modifiche nei commit, ma non modificarne il contenuto senza richiesta esplicita.

La connessione remota GitHub–Vercel deve restare attiva per i deploy automatici.

## Orientamento rapido

| Obiettivo | Punto di partenza |
|---|---|
| Testo o markup di una schermata | `app/view/` |
| Click o comportamento UI | `app/client/*-handler.js` |
| Routing o rendering | `app/client/router.js`, `app/client/renderer.js` |
| Chiamata Supabase dal browser | `app/api/` |
| Progressione | `app/data/progression.js` |
| Combattimento | `app/engine/` |
| Stili | `app/styles/` |
| Asset | `app/assets/` e `app/client/asset-helpers.js` |
| Tabelle o funzioni SQL | nuova migrazione in `supabase/migrations/` |
| Autenticazione o battaglie Edge | `supabase/functions/` |
