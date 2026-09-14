# AGENTS.md — Guida operativa Pokemon Game Revival

## Ambiente e regole di lavoro

- SPA statica a moduli ES; backend autoritativo Supabase. Produzione: `main`, repository `MahloCardinal/pokemon-game-revival`, sito `https://pokemon-game-revival.vercel.app`, Supabase `etotvaneppzkxunezqrl`, Vercel `pokemon-game-revival`.
- Lavorare esclusivamente su Revival: niente modalità staging, compatibilità con progetti precedenti o nuovi identificatori versionati `_v1`.
- Leggere `git status` prima e dopo gli interventi. Preservare tutte le modifiche dell'utente, anche in `tools/`; non modificare strumenti o annotazioni senza necessità per il compito.
- Quando si committa, usare **`git add .`** e includere tutto il lavoro presente. Verificare prima il diff e le esclusioni: il repository deve contenere l'ambiente condivisibile tra PC. Commit/push devono essere richiesti dall'utente o necessari al compito autorizzato.
- `.gitignore` esclude configurazione locale riservata, collegamenti CLI e artefatti temporanei. Non ignorare sorgenti, strumenti, test o baseline. Non committare credenziali, webhook, dati personali dei giocatori o esportazioni diagnostiche. `.gitattributes` mantiene i fine riga del codice a LF: conservarlo.
- Non creare `.agents`. Non usare `npm`: non ci sono package.json o dipendenze npm del progetto. Non installare né avviare Docker; usare CLI remote e, per lo schema, `pg_dump` nativo. Gli avvisi CLI sulla sola cache Docker non annullano un deploy remoto riuscito.
- Non cancellare dati o attività reali per test o per sbloccare un deploy. Usare fixture temporanee con rollback. Non aumentare limiti PostgreSQL per nascondere errori logici.

Su un altro PC servono Git, Node.js 24 o compatibile con gli script, Supabase CLI e, per aggiornare la baseline, `pg_dump` compatibile con il server (disponibile con PostgreSQL 18; override `PG_DUMP`). Le credenziali CLI si configurano sul PC, non in Git:

```powershell
supabase login
supabase link --project-ref etotvaneppzkxunezqrl
node scripts/check.mjs
```

Per una preview con route SPA usare `vercel.cmd dev`, se disponibile. Per ogni operazione remota controllare `supabase/.temp/project-ref`. `supabase/config.toml` contiene la configurazione condivisa e opzioni CLI locali: non presumere che ogni impostazione Auth sia già applicata al servizio remoto.

## Dove intervenire

| Obiettivo | Sorgente e percorso da seguire |
|---|---|
| Testi e markup | `app/i18n/`, `app/view/`; nessuno stato applicativo nelle view |
| Click e coordinamento UI | handler in `app/client/`, registrati da `action-bootstrap.js` |
| Route, scene, DOM | `router.js`, `renderer.js`, `dialog-layer.js` in `app/client/` |
| Trasporto verso Supabase | `app/api/`; non importare stato client negli adattatori |
| Regole, cataloghi e progressione | `app/data/`, soprattutto `progression.js` e `stat-tables.js` |
| Battaglie, Pokémon, cattura | `app/engine/`; API pubblica `app/engine/index.js` |
| Comandi server e debug | `supabase/functions/battle-command/` e funzioni SQL nella baseline |
| Schema SQL corrente | `supabase/baseline/schema.sql`; cercare la definizione effettiva prima di creare una migrazione |
| Deploy e verifiche | strumenti in `scripts/`; test e fixture in `scripts/tests/` |
| Asset e CSS | `app/styles/`, `app/assets/`, `asset-helpers.js`, `app/data/asset-paths.js` |

Per una funzionalità cercare il dominio esistente in API → handler → view → stile. Cupola usa `battle-dome*`, storico `battle-history*`, feed `activity-feed*`, progressione `progression-dialog.js` e gli handler battaglia/Pensione/Centro Pokémon. Non aggiungere dispatch specifici a `main.js` né ricreare percorsi paralleli.

## Frontend e stato autoritativo

- Flusso: azione → handler → API → autenticazione/validazione server → mutazione atomica/ricevuta → stato canonico → render. Il browser non concede ricompense e non decide catture o Shiny.
- Usare `data-action` e `registerAction()`. Aggiornamenti parziali usano `data-render-region` e `renderRegions()`; `render()` completo serve per cambi di scena/struttura. I popup usano `renderDialogLayer()`.
- Inserire valori dinamici nel markup tramite `escapeHtml()`. Testi visibili soltanto in i18n, con schema italiano/inglese identico; `t()` per testo immediato, descrittori per testo conservato nello stato e `resolveText()` prima del render.
- Chiavi persistite e logica restano in inglese, indipendenti dalle etichette. Nomi di mosse/specie/strumenti/MT vanno risolti via i18n, non duplicati nei cataloghi. I percorsi asset vengono dal catalogo esplicito, mai dai nomi tradotti.
- Applicare la risposta canonica prima di ricostruire proiezioni o mostrare premi. `level-up.js` coordina anche flussi locali: non sostituire con questi i comandi autoritativi.
- I messaggi admin del feed sono separati dal limite dei dieci eventi utente. Mantenere la retention e la generazione autoritativa degli eventi.
- Il deployment frontend è identificato automaticamente da `/api/deployment-version`. Non reintrodurre versioni manuali. La SPA aggiorna le schede aperte rinviando il refresh durante una battaglia; conservare la rivalidazione di HTML/JS/CSS in `vercel.json`.

## Progressione e popup

- `advance_ordinary_progression` e `advance_training_progression` congelano un confronto fino alla prossima mossa sconosciuta, evoluzione o livello finale; evitare popup di livelli intermedi senza eventi. Applicare crescita, EXP e cap a ogni livello. Dopo un'evoluzione ricalcolare le tappe sulla nuova specie.
- EXP e confronto prima/dopo condividono il popup. Apprendimento/evoluzione mostrano il risultato server; `progressionResultPokemon()` usa il `before_state` della prossima risoluzione per non anticipare livelli successivi.
- Con quattro mosse mostrare l'effetto completo della nuova mossa e confermare quella da dimenticare con `confirmMoveForget()`. `showEvolutionResult()` continua solo dal callback del popup.
- I nodi del dialogo restano montati durante il render. Prima di attendere una risposta usare `holdDialogContent()`; contenuto trattenuto `inert`, dispatcher bloccato, sostituzione all'arrivo della risposta. Uscita definitiva: `state.dialog = null`. Conservare `replaceSceneContent()` e la sincronizzazione della dialog layer, non usare `root.innerHTML`.
- Nell'Allenamento lo stesso `progressionId` attraversa assegnazione e scelte: non deduplicare il nuovo popup soltanto per ID. I flussi errore/riprova e ripresa fuori dalla battaglia devono chiudere il dialogo correttamente.
- In Pensione `preview_daycare_withdrawal` è sola presentazione. Costo e livello finale si congelano una volta; `daycare_segment_options()`/`continue_daycare_progression()` avanzano i segmenti. Fino alla ricevuta `completed` il Pokémon resta in `state.daycare`. Non aggiungere campi UI alle `options` confrontate esattamente dal resolver.
- Le mosse persistite già oltre cap non bloccano squadra/caricamento; i valori vengono sistemati durante la successiva risoluzione autoritativa prevista.
- Le vittorie in palestra, normali e admin, assegnano la medaglia **prima** di creare la progressione EXP: usare il nuovo conteggio medaglie. I popup possono mostrare prima EXP e poi medaglia. I retry conservano limite e premi già congelati.

## Invarianti di gameplay da preservare

- Il danno non applica STAB; dove previsto il motore usa il tipo dell'attaccante. `BattleManager.emit()` aggiunge soltanto eventi. Regole e composizione appartengono al motore/catalogo, non ai renderer.
- Validare la composizione alla nuova battaglia via `findTeamCompositionViolation()` e `assert_player_team_composition()`: massimo due Pokémon della stessa specie, due copie di uno strumento tenuto, due Strumenti del Porto distinti e due Pokémon con mosse OHKO. Non impedire catture, evoluzioni o trasferimenti perché rendono temporaneamente non conforme la squadra.
- La Lega controlla la squadra all'inizio della scalata e poi usa il roster congelato. La Torre controlla all'inizio della run e non assegna EXP. Cupola usa il proprio roster salvato da uno a sei Pokémon, non la squadra persistente.
- Premi palestra: un premio in denaro, una medaglia coerente e tutti gli strumenti del catalogo, incluse le MT; non fissare il numero di righe premio.
- Disponibilità negozi derivata da `price`: `null` significa non acquistabile; MT Tier 0 sempre non acquistabili. Evitare liste parallele di esclusioni nei negozi/Club Pokéfan.
- Shiny: tiro server, probabilità in `progression.js`, stato compatto `sh: 1`. Bonus ricevuti incorporati nei valori persistiti; cap basati sul livello corrente. Legendary e Shiny sono indipendenti e i bonus si sommano: leggere `stat-tables.js`, non ricopiare i numeri nei consumer. Sprite Shiny col suffisso `_shiny` e stessa geometria del normale.
- Titoli: regole in `app/data/titles.js`, testi in i18n, sblocco automatico server e permanente. `Nuovo arrivato` è onboarding; la prima missione collezione usa `trainer_titles_initial`. Titoli per tipo: Pokédex da ogni fonte, entrambi i tipi, escluse solo rarità fossil/legendary. La scelta del preferito non incrementa la revisione di gameplay.
- Preservare `admin` e `aaa` con ruolo server `debug`, pagina `/styles` e strumenti debug. Privilegi sempre validati anche dal backend. `debug_titles` passa da Edge; `debug_completed` delle missioni è rispettato solo per debug, senza creare Pokémon/Pokédex/Titoli fittizi.

## Contratti di battaglia e concorrenza

- `battle-command` è l'ingresso Edge per battaglie, Cupola, storico, progressione, automazione admin e debug. Prima di aggiungere un'azione verificare `ALLOWED_ACTIONS`, payload, autorizzazione, revisione, ricevuta e RPC. I mutatori SQL interni non sono chiamabili dai ruoli browser.
- Conservare command ID, hash, revisioni attese, ownership, snapshot e ricevute idempotenti. Un timeout non dimostra che il comando non sia riuscito. In Cupola ricontrollare la ricevuta dopo il lock e prima di versione/snapshot; un replay non riscrive eventi o storico e la Edge proietta lo stato canonico corrente.
- Conflitti applicativi: usare `raise_revision_conflict()`, che produce HTTP 409 e codice JSON `40001` tramite SQLSTATE `PGRST`. Non sollevare SQLSTATE PostgreSQL `40001`, che può innescare retry PostgREST ripetuti.
- Preparazione aciclica: `prepare_edge_battle_command` → `with_inventory` → `with_contract_items` → `with_roster` → `core` (nomi completi con prefisso `prepare_edge_battle_command_`). Il core è il lettore terminale.
- Le funzioni `*_before_*` nello schema sono passaggi ancora eseguiti. Seguire la catena di chiamate prima di modificarle; il nome non indica che si possano cancellare. Accorparle richiede test del contratto completo e una migrazione dedicata.
- `projectionForDatabase()` riduce le proiezioni del commit: non aggiungere stato grafico o copie dello snapshot. Lo storico è read-only e rispetta confini/paginazione del server.
- Gli incontri non inizializzati si annullano alla successiva mutazione della revisione giocatore; quelli già legati a battaglie sono protetti. Non riscrivere specie/valori di un incontro per distribuire nuove regole.
- Cupola conclusa: eliminazione dopo entrambe le uscite o alla mezzanotte successiva `Europe/Rome`; mai eliminare automaticamente sfide attive. Cron e retention correnti sono in `supabase/baseline/metadata.json`.

## Baseline SQL e nuove modifiche

- `supabase/baseline/schema.sql` contiene le definizioni correnti di `public` e `server_authority_private`, inclusi RLS, permessi, trigger e indici. `metadata.json` registra estensioni, pubblicazioni, cron e ultima migrazione inclusa. Sono la baseline di riferimento per lavorare, non uno script da eseguire sul database collegato né un backup dei dati.
- La cronologia applicata resta su Supabase e in Git. `supabase/migrations/` contiene solo nuove migrazioni additive non ancora assorbite nella baseline. Non ricostruire lo stato corrente leggendo vecchie migrazioni; interrogare il server se la baseline risulta divergente.
- Creare `YYYYMMDDHHMMSS_descrizione.sql`, più recente di `through_migration`. Non modificare migrazioni già applicate. Per pubblicare usare **`scripts/database.mjs push`**, non `supabase db push` direttamente dalla root: lo script ricostruisce la cronologia remota in una cartella temporanea senza ripararla o azzerarla.

```powershell
node scripts/database.mjs snapshot --check
node scripts/database.mjs push --dry-run
node scripts/database.mjs push
supabase db lint --linked --level error
node scripts/database.mjs snapshot
node scripts/database.mjs snapshot --check
```

Dopo il deploy e i test, rimuovere solo i file di migrazione confermati applicati e inclusi nel nuovo `through_migration`; mantenere `.gitkeep`. Non eliminare migrazioni pendenti. La baseline si aggiorna con `pg_dump` nativo, senza dati giocatore o catalogo. Il codice dello schema è versionato intenzionalmente; dump diagnostici e seed generati restano temporanei. Non eseguire reset remoti. Per ricreare un servizio vuoto servono anche cataloghi generati, binding runtime e configurazione dei servizi Supabase: la baseline non automatizza quel ripristino.

## Cataloghi e runtime granulare

`app/` è la sorgente canonica. Il mirror `supabase/functions/_shared/game-runtime/` e il manifest sono generati: non editarli manualmente. Hash e copie normalizzano LF e usano ordinamento deterministico. I confini dei componenti sono in `scripts/runtime-components.mjs`; i moduli condivisi possono incidere su più componenti, quelli non classificati ricadono nel motore.

| Componente | Politica predefinita |
|---|---|
| encounters | Nuova ricerca; risultati degli incontri già generati conservati |
| initialization | Nuovo snapshot, prima delle scelte degli strumenti tenuti |
| battle_core | Prossimo comando in ogni ambiente |
| move_effects | Prossimo comando, incluse mosse caricate/copiate e in corso |
| consumable_items | Prossimo uso; effetti già applicati e consumi restano nello stato |
| held_items | Prossimo evento; bonus applicati e cariche consumate restano nello stato |
| capture | Prossimo lancio, anche nelle battaglie già attive |
| progression | Nuova progressione; scelte pendenti protette da completamento/migrazione esplicita |
| opponents_rewards | Nuova attività; contratti avversari/premi aperti protetti |
| presentation | Nessun vincolo di compatibilità del combattimento |

- Il checksum del bundle identifica il codice; `BATTLE_SNAPSHOT_VERSION` il formato dello stato. Cambi compatibili entrano nei comandi successivi senza riscrivere hash, turni, RNG o inventari passati. Cambi di significato/formato dello stato richiedono una migrazione esplicita e, se cambia il contratto, la versione snapshot coerente con SQL.
- `runtime_package` registra i pacchetti; `runtime_deployment` sceglie pacchetto e generazione. Preparazione e commit trasportano `runtime_generation`; SQL controlla pacchetto/generazione sotto lock condiviso, modifiche catalogo/attivazione sotto lock esclusivo. Non aggiungere eccezioni a checksum fissi.
- Le ricevute conservano checksum, componenti e generazione eseguiti. Mantenere i binding referenziati dagli snapshot conservati. Nessun motore storico parallelo per aggirare incompatibilità.
- Catalogo stabile unico `revival-baseline`: non clonarlo né cambiare `catalog_release_id` dei profili. Le modifiche ai dati usano `begin_game_data_change()` / `finish_game_data_change()`, aggiornando solo righe e famiglie necessarie nella stessa transazione. Il change set audita le righe e aggiorna checksum/revisione della baseline.
- Generare lo scheletro con `node scripts/create-game-data-change.mjs --slug descrizione --label "Descrizione" --families shop --source app/data/shopping-center.js`; completare gli UPDATE limitati alla baseline tra begin/finish.
- `p_requires_battle_idle=false` per cambi compatibili; `true` per incompatibilità dello stato inizializzato. `finish_game_data_change()` protegge progressioni e contratti premi pendenti e sospende i commit se serve un nuovo pacchetto. Non cancellare attività per superare questi controlli.
- Controllare l'intera catena: sorgente → consumer → generatore catalogo → SQL → mirror → binding/attivazione → stato remoto. Il grafo degli import determina se occorre distribuire Edge; l'inclusione di una costante nel pacchetto non ne prova l'uso nel combattimento.
- Esempio: la sola probabilità Shiny è letta da SQL alla nuova ricerca; cambiarla non modifica incontri/battaglie e non richiede deploy Edge. Prima del successivo vero deploy sincronizzare il pacchetto allora corrente. La presentazione cambia i propri hash, non il bundle eseguibile.

### Pubblicazione runtime

1. Controllare progetto, diff, catalogo e attività correnti; eseguire i test pertinenti.
2. `node scripts/sync-game-runtime.mjs` e `node scripts/sync-game-runtime.mjs --check`.
3. Se cambia il bundle: `node scripts/create-runtime-release.mjs --slug register_runtime_change` crea la registrazione additiva senza attivazione. Per dati canonici aggiungere il change set necessario.
4. Pubblicare SQL con il flusso `database.mjs`. Se il catalogo sospende i commit in attesa del pacchetto, completare prontamente i passi successivi.
5. Distribuire soltanto le Edge Function modificate; per battaglie: `supabase functions deploy battle-command --project-ref etotvaneppzkxunezqrl --use-api`. Scaricare il pacchetto e verificare il checksum effettivo.
6. Generare l'attivazione fuori dal repository: `node scripts/create-runtime-release.mjs --activate --output <file-temporaneo.sql>`, quindi eseguirla sul progetto verificato. La registrazione non equivale all'attivazione.
7. Verificare pacchetto/generazione remoti, test, lint e nuova baseline SQL; poi commit/push autorizzati. Non rimuovere binding ancora referenziati.

Correzioni solo SQL non richiedono un nuovo bundle; valutare una nuova generazione dello stesso pacchetto se occorre respingere comandi preparati prima del cambiamento. Se si deve preservare un pacchetto Edge distribuito, scaricarlo con `functions download --use-api` in una cartella temporanea e modificare solo il coordinamento richiesto.

## Servizi, autenticazione e deploy frontend

- Edge applicative: `register-with-username`, `login-with-username`, `request-password-recovery`, `delete-account`, `battle-command`; tutte mantengono `verify_jwt=true`.
- Email opzionale; gli account senza email usano `@pokemon-game-revival.local` e non possono recuperare la password. Recupero: coppia username/email senza rivelarne l'esistenza, flusso Auth nativo e redirect fisso `https://pokemon-game-revival.vercel.app/auth/recovery`. Conservare gestione `PASSWORD_RECOVERY`, `auth.updateUser()` e rewrite SPA.
- Prima di modificare Auth remoto leggere il diff e preservare MFA, conferme e rate limit. Il Site URL remoto è l'origine di produzione; il redirect recovery deve essere consentito. Non introdurre segreti per questo URL pubblico.
- Discord admin: notifiche best effort all'avvio gym/admin-Lega e al ritorno del turno all'admin, incluso `aaa`, escluso `debug_training`. Webhook solo nel segreto Supabase `DISCORD_ADMIN_BATTLE_WEBHOOK_URL`; ricevute private deduplicano gli invii. Non chiamare Discord dal frontend.
- Push `main`: deploy frontend automatico Vercel, non deploy SQL/Edge. Nei cambi coordinati pubblicare in ordine compatibile e verificare `/api/deployment-version` quando necessario; non imporre attese Vercel a modifiche che non lo richiedono.

## Verifiche da eseguire

```powershell
node scripts/check.mjs                        # gameplay/client, i18n, schema e mirror locali
node scripts/check.mjs runtime                # hash, portabilità e ripristino snapshot
node scripts/check.mjs i18n                   # cataloghi e nomi/descrizioni entità
node scripts/check.mjs database progression   # fixture SQL pertinenti sul progetto collegato
node scripts/check.mjs database               # tutte le fixture SQL isolate
node scripts/check.mjs --list                 # elenco test selezionabili anche con filtro nome
node scripts/database.mjs snapshot --check    # confronto schema/metadata col server
node scripts/generate-all-catalog-seeds.mjs --release revival-baseline --checksum draft:revival-baseline --species-chunks 4 --check
git diff --check
```

I test specifici sotto `scripts/tests/` sono regressioni del comportamento corrente, non cronologia degli incidenti. Estenderli nel dominio pertinente; evitare checksum storici e controlli che cercano vecchie patch. Le fixture SQL devono usare soltanto copie temporanee/rollback. Per identità e ciclo dei nodi dialogo aprire `scripts/tests/test-dialog-layer.html` da un server locale. Verificare il parsing dei JS modificati come moduli ES; gli avvisi sperimentali Node previsti non sono errori. I test locali non dimostrano l'avvenuto deploy remoto.
