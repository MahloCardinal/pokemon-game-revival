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
- Non modificare `tools/` se non richiesto esplicitamente: contiene strumenti personali del proprietario.
- Non creare o committare dump SQL generati, segreti, token, password, service-role key o webhook.
- Non usare comandi `npm`: il repository non contiene `package.json`, lockfile o pipeline npm.
- Preferire modifiche piccole e additive. Non riscrivere migrazioni già applicate.
- Non aumentare limiti PostgreSQL per nascondere ricorsioni, query difettose o altri errori logici.
- Non eliminare account o dati reali durante i test. Gli account temporanei devono essere rimossi al termine anche in caso di errore.

## Architettura

### Frontend

- `index.html`: ingresso della SPA; carica esplicitamente tutti i CSS e `app/client/main.js`.
- `app/client/`: stato, sessione, routing, eventi, persistenza e coordinamento UI.
- `app/view/`: markup delle schermate. Effetti, callback e stato restano nel client.
- `app/api/`: adattatori verso Supabase; restituiscono dati di trasporto e non devono importare lo stato client.
- `styles/`: CSS suddiviso per schermata o funzionalità.
- `assets/`: immagini, sprite, icone, sfondi e musica.

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
- Usare gli helper di `app/client/asset-helpers.js`; non costruire manualmente i percorsi degli asset.
- Le modifiche che richiedono persistenza devono attraversare i comandi autoritativi o il flusso di salvataggio già previsto.
- Le regole di progressione restano centralizzate in `app/data/progression.js`.
- Importare l'API pubblica del motore tramite `import * as Engine from "../engine/index.js"` quando possibile.

La pagina `/styles`, `app/view/styles.js` e `styles/style-proposals.css` sono strumenti intenzionali dell'utente debug; non eliminarli come presunto codice di sviluppo inutilizzato.

## Regole particolari del motore

- Il danno non applica STAB.
- La logica usa il tipo del Pokémon attaccante, non il tipo della mossa, dove previsto dal motore attuale.
- `BattleManager.emit()` aggiunge soltanto eventi al log.
- La UI di livello, mosse ed evoluzione appartiene al client, mentre l'esito canonico appartiene al backend.
- Conservare le regole di composizione della squadra nel motore e non duplicarle nei renderer.

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

Il contenuto di una release `published` o `retired` è immutabile. Per cambiare un catalogo pubblicato:

- generare e importare una nuova release `draft` completa;
- verificare le righe interessate prima della pubblicazione;
- creare il binding additivo per il checksum runtime corretto;
- verificare che non esistano battaglie attive o pending incompatibili;
- pubblicare la nuova release e gestire esplicitamente i profili già esistenti, perché `player_profile_state.catalog_release_id` non cambia automaticamente;
- preservare l'utente `aaa` e il suo ruolo `debug` durante qualunque migrazione dei profili;
- distribuire `battle-command` in un ordine che non lasci catalogo e runtime incompatibili;
- verificare infine release pubblicata, profili, binding abilitati e checksum della Edge Function.

Se serve compatibilità durante il deploy, usare temporaneamente binding additivi; rimuovere o disabilitare il binding di transizione soltanto dopo aver distribuito la nuova Edge Function e verificato che non esistano battaglie che lo usano.

Verifica deterministica:

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

## Utenti speciali

- `admin`: amministrazione prevista delle battaglie e delle configurazioni.
- `aaa`: ruolo server `debug`, strumenti di debug e accesso alla pagina `/styles`.

Le funzionalità di `aaa` sono intenzionali e devono essere preservate. Ogni privilegio deve essere validato anche dal backend e non soltanto nascosto o mostrato nel browser.

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

Preferire file selezionati a `git add .`, soprattutto perché `tools/` può contenere materiale personale non destinato al repository.

## File locali e rigenerabili

- `.git/`: essenziale; non eliminare.
- `vercel.json`: configurazione versionata del sito; conservare.
- `.vercel/`: collegamento locale alla CLI; eliminabile se si usa soltanto GitHub.
- `.env.local`: configurazione locale; non committare.
- `supabase/.temp/`: collegamento e metadati locali della CLI; rigenerabile ma utile.
- `.build/`: artefatti temporanei; eliminabile e non versionare.
- `tools/`: materiale personale; non modificare senza richiesta esplicita.

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
| Stili | `styles/` |
| Asset | `assets/` e `app/client/asset-helpers.js` |
| Tabelle o funzioni SQL | nuova migrazione in `supabase/migrations/` |
| Autenticazione o battaglie Edge | `supabase/functions/` |
