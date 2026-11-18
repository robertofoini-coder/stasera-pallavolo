# StaseraVolley V002 — prototipo locale

Sviluppo isolato da V001, senza framework o backend, pubblicato come prototipo statico su Vercel. Tutti i dati, i permessi, le richieste, le notifiche e i pagamenti sono simulati nello stesso browser. Non è un sistema multiutente sicuro e non comunica con Supabase.

## Avvio

Richiede Node.js. Aprire un terminale in questa directory ed eseguire:

```powershell
node tools/serve.mjs 4192
```

Aprire http://127.0.0.1:4192/v002/ sul computer che esegue il server. Non aprire direttamente il file HTML: i moduli JavaScript richiedono HTTP. Questo indirizzo non è un link pubblico e non è accessibile dallo smartphone. Il selettore superiore mostra V000/V001 in un iframe di consultazione; lo sviluppo riguarda esclusivamente V002.

## Prova guidata

1. In Gruppi cercare Brescia o filtrare BS. I sei gruppi sono distinti, inclusi Bagher & Spritz e Volley & Spritz. Elenco e mappa condividono gli stessi filtri.
2. Aprire Brescia Volley Friends, distinguere i 14 membri permanenti dai partecipanti alla serata, poi aprire la partita: 12 giocatori in campo, 2 riserve confermate, 2 riserve libere.
3. Con Giocatore Demo richiedere prima l’ingresso nel gruppo e farlo approvare da Anna Fontana usando il selettore demo. Tornare al Giocatore Demo, selezionare R3 e inviare la richiesta di prenotazione. Senza selezione compare il popup richiesto, senza creare prenotazioni.
4. Selezionare Anna Fontana nel menu Personaggio demo: campanella e Gestione richieste consentono di accettare o rifiutare la richiesta. Tornare a Giocatore Demo per pagare dopo la conferma.
5. Leonessa Volley Club permette inizialmente prenotazioni immediate. Gli organizzatori possono cambiare separatamente le regole per adesioni e prenotazioni. La modifica non conclude richieste pregresse.
6. Per il rendiconto scegliere Amministratore Demo, aprire Impostazioni e il pannello demo con codice 2468. Questo codice non è una protezione reale. In questa modalità è configurabile anche la durata dei blocchi temporanei.
7. Lingua IT/EN, tema e anteprima dispositivo si trovano nelle Impostazioni. La lingua non è selezionabile altrove. Esportazione e ripristino riguardano solo V002.

## Architettura e file

- `index.html`, `app.css`: struttura e grafica responsive.
- `app.js`: navigazione, storage, dialoghi, focus, impostazioni e upload.
- `core.js`: transizioni validate, autorizzazioni locali, prenotazioni, scadenze, notifiche, pagamenti e storico.
- `data.js`, `dates.js`: dati demo con identificativi stabili, date Europe/Rome, ricorrenze e festività.
- `views.js`, `translations.js`: viste senza mutazioni e cataloghi IT/EN centralizzati.
- `assets/avatars/`, `avatar-manifest.js`: 40 ritratti locali di adulti inesistenti generati con ImageGen, JPEG 256×256, associazioni stabili e fallback con iniziali.
- `tests/`, `tools/`: verifiche, server locale e ottimizzazione asset.
- `docs/`: risultati, screenshot, inventario SHA-256 e snapshot inattivi della base V001 per confronto. I documenti V001 copiati descrivono la versione precedente, non la V002.

Storage dedicato: `staseravolley-v002-state-v1` e `staseravolley-v002-settings-v1`. Nessuna importazione automatica dalla V001 e nessun uso di `localStorage.clear()`.

La disponibilità deriva da prenotazioni confermate e blocchi temporanei non scaduti. Le richieste scadono dopo 24 ore, o all'inizio della partita se precedente; la verifica avviene anche alla riapertura. Membri, prenotazioni e richieste sono entità separate. La quota è congelata nella prenotazione; il pagamento simulato aggiunge il 5% di commissione. Per disdette almeno 24 ore prima viene rimborsata la quota, mai la commissione; nelle ultime 24 ore il rimborso demo è zero.

## Verifiche eseguite

- 28 test di modello/rendering: `node --test tests/core.test.mjs`.
- 17 verifiche browser Edge: `node tests/browser.mjs` (incluso inventario versioni).
- 4 verifiche robuste: `node tests/robustness.mjs` (quota esaurita, dati corrotti, upload/rimozione e isolamento V001).
- Verifica dei 40 asset e associazioni: `node tests/avatars.mjs`.
- Controllo perimetro/hash: `node tools/verify-scope.mjs`.

I test browser richiedono Playwright e Microsoft Edge. Se Playwright non è installato localmente, indicare il suo modulo con la variabile `PLAYWRIGHT_MODULE`. Nessuna dipendenza è stata installata nel repository. I report JSON e gli screenshot alle larghezze 390/820/1440, nei due temi, sono in `docs/`. Gli screenshot full-page mostrano la barra inferiore fissa all'altezza del viewport iniziale, come durante lo scorrimento.

## Limiti dichiarati

- Mappa schematica locale per provincia, non cartografia geografica: nessun servizio cartografico o geocodifica collegato. I collegamenti Maps avviano una ricerca della località; le palestre demo non dichiarano indirizzi reali.
- Nessuna autenticazione reale, notifica push, sincronizzazione tra dispositivi, transazione finanziaria o garanzia concorrente tra utenti. Il selettore personaggio serve esclusivamente ai test locali.
- Le modifiche e le fotografie caricate restano nel browser e dipendono dalla sua quota di storage. Dati corrotti non vengono cancellati automaticamente; l'utente può esportarli e ripristinare esplicitamente la sola V002.
- Verifiche responsive eseguite con Edge Chromium; non eseguiti test su dispositivi iOS/Android fisici o Safari/WebKit.
- Il cambio anno/date mantiene prossime serate demo future senza duplicarle a ogni caricamento. Le vecchie serate e lo storico rimangono consultabili; gli orari sono Europe/Rome.

La pubblicazione e la sincronizzazione sui branch Html sono state autorizzate successivamente alla fase locale. V000 e V001 restano invariate. Il report source-baseline.json registra l’inventario originale; i report final-verification.json precedenti descrivono lo stato al momento della loro esecuzione.


## Aggiornamento accessi e grafica

Le prenotazioni nuove richiedono appartenenza attiva al gruppo; una richiesta di adesione in attesa non è sufficiente. Se l’organizzatore imposta ingresso automatico, l’adesione viene approvata immediatamente; se imposta approvazione, va attesa la sua decisione. Questo sostituisce la precedente regola che consentiva prenotazioni ai non membri. Le prenotazioni già confermate rimangono conservate.

Alla creazione di ogni serata, incluse ricorrenze e duplicazioni, l’organizzatore riceve automaticamente un posto confermato nella posizione 1–6 scelta nel proprio profilo, senza richieste a sé stesso. Le due squadre hanno ciascuna quella posizione: viene usata la prima disponibile. Sulle vecchie serate si conserva ogni posto occupato; se la posizione richiesta è indisponibile o la capienza è piena si mostra un avviso invece di spostare persone. Una disdetta intenzionale dell’organizzatore non viene annullata alla riapertura.

Sei loghi SVG di fantasia identificano i gruppi demo. Dal cartellino l’organizzatore può caricare o rimuovere il logo (PNG/JPEG/WebP, ottimizzato localmente). La foto dell’attore corrente compare nella navigazione Profilo, gli orari sono compatti su smartphone e il nome della palestra è il collegamento Maps.

