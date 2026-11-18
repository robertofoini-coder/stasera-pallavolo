# StaseraVolley V002

Prototipo interattivo HTML, CSS e JavaScript per gruppi e partite amatoriali di pallavolo. La V002 mantiene le versioni precedenti e aggiunge gestione dei gruppi, adesioni, richieste di prenotazione, organizzatori, riserve, profili, loghi e pagamenti dimostrativi.

**È una simulazione locale nel browser:** utenti, autorizzazioni, notifiche, pagamenti e rendiconti non sono servizi reali. Non comunica con Supabase e non sincronizza persone o dispositivi.

## Link e versioni

- Ingresso pubblico mantenuto: https://stasera-pallavolo.vercel.app/mockup/v001/ — apre la V002.
- Indirizzo diretto V002: https://stasera-pallavolo.vercel.app/mockup/v002/
- V001 precedente archiviata: https://stasera-pallavolo.vercel.app/mockup/archive/v001/
- V000 originale: https://stasera-pallavolo.vercel.app/mockup/v000/
- Sorgenti: `prototypes/staseravolley-fabio/v002/`, branch `Html`, nei repository `robertofoini-coder/stasera-pallavolo` e `fabiodimicco/StaseraVolley`.

Lo stesso codice V002 viene sincronizzato nei due repository. V000 e V001 non vengono modificate. Il selettore superiore permette il confronto con le versioni precedenti, con un popup informativo. L'applicazione principale alla radice rimane separata dal prototipo.

## Ultimo aggiornamento

- Avviso di pagamento visibile all’apertura e chiudibile; la quota resta nelle Notifiche. La campanella è rossa finché ci sono quote confermate da saldare, anche dopo «segna come lette».
- Tutorial contestuale con spotlight, spiegazione per elemento, Avanti/Indietro, progressione, Escape e ripristino del focus.
- Popup del selettore versioni con gli interventi effettivi tra le due versioni selezionate.
- Foto e logo con matita, anteprima nel modulo e **un unico Salva**, compresi dati e interruttori. Annulla non applica le bozze.
- Modifica completa del gruppo e cancellazione confermata: gruppo nascosto, serate future annullate, richieste chiuse e quote demo rimborsate (commissione trattenuta), mantenendo storico e rendiconto.
- Selettori on/off accessibili per disponibilità, giorni, caratteristiche, approvazioni e opzioni di ricorrenza.
- Pubblicazione autorizzata sui branch Html dei due repository e su Vercel; la V003 demo è separata.

## Funzioni della versione precedente e loro evoluzione

1. Ogni scheda evento in Esplora mostra il logo del proprio gruppo al posto del pallone, usando la stessa associazione del cartellino e della directory. Un logo caricato dall'organizzatore si aggiorna anche sulle relative serate; senza logo vengono usate le iniziali.
2. Un avviso chiudibile sopra la navigazione segnala le quote ancora da pagare dopo una prenotazione immediata o l'accettazione dell'organizzatore.
3. L’avviso può essere chiuso per la sessione corrente; riappare alla riapertura. La quota resta nelle Notifiche e mantiene la campanella rossa fino al saldo. Mostra la prossima quota dovuta, il totale comprensivo di commissione e, quando necessario, il numero delle quote aperte.
4. **Paga ora** apre il pagamento simulato della prenotazione indicata. Con più quote, un collegamento apre anche Prenotazioni. Dopo il pagamento resta visibile soltanto se esistono altre quote da saldare.
5. Non vengono richiesti pagamenti per richieste in attesa, rifiutate o scadute, prenotazioni annullate, partite passate o serate gratuite.

## Dati dimostrativi iniziali

| Gruppo | Provincia / località | Gioco abituale | Quota | Prenotati / capienza |
| --- | --- | --- | --- | --- |
| Voltaren | BG / Bergamo | Mercoledì 20:30–22:30 | €7 | 9 / 12 |
| Smash & Fun | BG / Bergamo | Giovedì 21:00–23:00 | €6 | 11 / 12 |
| Bagher & Spritz | BG / Bergamo | Giovedì 20:30–22:30 | €7 | 12 / 14 |
| Volley & Spritz | BG / Costa di Mezzate | Giovedì 20:30–22:30 | €7 | 10 / 12 |
| Brescia Volley Friends | BS / Brescia | Martedì 20:30–22:30 | €7 | 14 / 16 |
| Leonessa Volley Club | BS / Brescia | Venerdì 21:00–23:00 | €8 | 14 / 16 |

Bagher & Spritz e Volley & Spritz sono gruppi distinti. I due gruppi di Brescia hanno ciascuno 12 giocatori in campo, 2 riserve confermate e 2 posti riserva liberi. Le palestre di Brescia sono dichiaratamente dimostrative, senza indirizzi reali inventati.

I profili demo sono 42: 12 giocatori condivisi dai gruppi di Bergamo, 28 giocatori distinti dei gruppi di Brescia, Giocatore Demo e Amministratore Demo. I 40 giocatori hanno ritratti di adulti inesistenti generati artificialmente, salvati localmente come JPEG 256×256; i due personaggi di servizio partono senza fotografia. Non sono foto attribuite a persone reali.

I sei gruppi hanno loghi SVG di fantasia. Le date delle prossime serate demo sono calcolate nel futuro rispetto all'utilizzo e non si duplicano a ogni caricamento. Una serata passata dimostrativa permette di provare le valutazioni.

## Esplora e navigazione degli eventi

- Ricerca per gruppo, palestra e località; filtro provincia.
- Filtri oggi, domani, settimana e data specifica.
- Schede con logo del gruppo, nome, data, orario, palestra, organizzatore, disponibilità, quota ed eventuali richieste in attesa.
- Nessuna fotografia decorativa dei giocatori nelle schede Esplora.
- Percorso: **evento → cartellino del gruppo → serata selezionata → campo e prenotazione**.
- L'apertura delle schermate non genera prenotazioni o richieste.
- Navigazione inferiore Esplora, Prenotazioni, Gruppi e Profilo. Quando disponibile, la foto del personaggio corrente sostituisce l'icona Profilo.

## Directory Gruppi e cartellino

La directory contiene tutti i gruppi demo e quelli creati durante l'utilizzo. Supporta ordinamento alfabetico, ricerca per nome, palestra, città e provincia, filtro BG/BS e visualizzazione elenco/mappa. La mappa è uno schema locale per provincia: elenco e punti usano gli stessi risultati filtrati. Non è una cartografia reale e non usa geocodifica.

Nel cartellino sono presenti:

- Logo, nome, descrizione e storia.
- Identità dell'organizzatore.
- Palestra abituale, località, giorno e orari abituali.
- Indirizzo/nome della palestra cliccabile, con ricerca Google Maps basata sui dati disponibili.
- Regole di adesione e prenotazione.
- Membri permanenti, fotografie e ruolo dell'organizzatore.
- Prossime serate attive con data, orari, palestra, quota e disponibilità.
- Controlli di gestione riservati localmente all'organizzatore o all'amministratore demo.

La directory non prenota direttamente: si apre sempre una singola partita. I membri del gruppo e i partecipanti alla partita rimangono due entità distinte.

### Logo del gruppo

L'organizzatore può caricare o rimuovere un logo dal cartellino. Sono accettati PNG, JPEG e WebP fino a 5 MB; il browser li ritaglia al centro e li ottimizza a 256×256 prima di salvarli nello storage V002. Il logo è condiviso visivamente da directory, cartellino e schede delle serate. Senza immagine compaiono le iniziali del gruppo. L'autorizzazione è solo dimostrativa e non costituisce protezione server.

## Adesione al gruppo prima della prenotazione

**Regola attuale:** per creare una nuova prenotazione occorre appartenere al gruppo con stato attivo/approvato. Una richiesta di adesione ancora in attesa non è sufficiente.

Il percorso visivo comprende tre passi: scopri il gruppo, entra nel gruppo, scegli e prenota. Durante l'attesa viene mostrato un messaggio chiaro; il comando di richiesta non può essere inviato due volte. La partita rimane consultabile, ma la prenotazione è bloccata.

L'organizzatore configura separatamente:

1. **Ingresso nel gruppo:** automatico, quindi approvato immediatamente, oppure soggetto ad approvazione.
2. **Prenotazione della partita:** conferma immediata oppure soggetta ad approvazione.

Anche con prenotazione immediata è necessaria l'appartenenza approvata. Le modifiche delle impostazioni non decidono retroattivamente richieste già concluse o ancora in attesa. L'accettazione nel gruppo non prenota automaticamente una partita.

Questa regola sostituisce la precedente possibilità V002 di prenotare senza appartenere al gruppo. Le prenotazioni già confermate vengono conservate.

## Organizzatore e posizione automatica

Nel profilo è possibile scegliere la posizione preferita in campo, da 1 a 6, separatamente dal ruolo tecnico. Alla creazione di ogni serata, comprese ricorrenze e duplicazioni, l'organizzatore riceve automaticamente una prenotazione confermata in quella posizione, senza mandarsi richieste.

Ciascuna delle due squadre ha le posizioni 1–6: viene scelta la prima di quelle corrispondenti ancora libera. Sulle serate già salvate viene conservata ogni prenotazione esistente. Se entrambe le posizioni preferite sono occupate o la capienza è piena, viene mostrato un avviso invece di spostare o cancellare altri giocatori. La migrazione è idempotente. Una disdetta intenzionale dell'organizzatore non viene annullata alla riapertura; una sua successiva prenotazione non richiede approvazione a sé stesso.

## Dettaglio partita, campo e riserve

Le schede Campo, Partecipanti e Info condividono la stessa partita selezionata.

- Campo con rete, due squadre e 12 posizioni regolamentari specchiate.
- Foto o iniziali, nome e numero di posizione per ogni giocatore.
- Colori distinti delle squadre e evidenziazione del proprio posto.
- Posti liberi selezionabili; i posti occupati aprono il profilo del giocatore.
- Riserve separate dal campo, con comando esplicito di selezione.
- Stato visivo distinto per posti confermati e bloccati temporaneamente.
- Dopo la selezione, evidenziazione e focus sul pulsante di prenotazione.
- Senza selezione compare: «Scegli un posto nel campo tra quelli a disposizione», con OK e nessuna prenotazione creata.
- Impossibili doppia prenotazione della stessa persona, doppia assegnazione del posto e superamento della capienza.
- Capienza configurabile fino a 30: 12 posizioni di campo e fino a 18 riserve.
- Nome dell'organizzatore visibile senza duplicarlo nei partecipanti.

La scheda Info mostra ritrovo, quota, 30 minuti obbligatori di riscaldamento prima del gioco, inizio e fine. Esempio: ritrovo/riscaldamento 20:00–20:30, gioco 20:30–22:30. Per un inizio alle 21:00 il ritrovo è alle 20:30.

I collegamenti Maps usano la palestra effettiva della partita, quando dichiarata, e la località. Per le palestre fittizie viene cercata soltanto la località; non vengono inventate coordinate o vie.

## Richieste, scadenze, notifiche e storico

Per le prenotazioni soggette ad approvazione:

1. Un membro approvato seleziona il posto e invia la richiesta.
2. Il posto è bloccato temporaneamente e l'organizzatore riceve una notifica locale.
3. L'accettazione conferma il posto; rifiuto, disdetta o scadenza lo liberano.
4. La scadenza predefinita è 24 ore dalla richiesta, o l'inizio della partita se precedente.
5. La scadenza viene verificata anche alla riapertura, senza dipendere da un timer lasciato in esecuzione.

Una richiesta scaduta non può essere approvata; non sono consentite doppie decisioni. La durata del blocco è configurabile dal pannello demo senza cambiare le scadenze delle richieste già create.

Gestione richieste comprende adesioni e prenotazioni, persona/foto, gruppo, partita, data, stato, scadenza, Accetta/Rifiuta e storico. Sono disponibili filtri per gruppo, tipo e stato. Soltanto organizzatore o amministratore autorizzato localmente possono decidere. Le decisioni aggiornano disponibilità, storico e notifiche del richiedente. La campanella mostra le notifiche non lette del personaggio corrente.

## Prenotazioni, pagamenti e rimborsi simulati

Prenotazioni mostra stato, posto/riserva, partita, quota e azioni disponibili. Sono presenti annullamento, nuova prenotazione dopo la disdetta e cambio posto quando consentito.

Il pagamento è consentito solo per una prenotazione confermata e una partita futura attiva. Non è consentito per richieste in attesa, rifiutate/scadute o prenotazioni annullate. La prenotazione conserva la quota applicabile al momento della sua creazione.

- Metodi dimostrativi: Satispay e PayPal.
- Commissione simulata: 5% aggiuntivo alla quota, arrotondato ai centesimi.
- Esempio: quota €8 + commissione €0,40 = totale €8,40.
- Nessuna transazione reale o collegamento ai gestori di pagamento.
- Divieto di doppio pagamento.
- Avviso chiudibile per le quote confermate non saldate e richiamo persistente nelle Notifiche.
- Pagamento e disdetta aggiornano immediatamente il promemoria e il rendiconto.

Per una disdetta almeno 24 ore prima dell'inizio viene rimborsata la quota, mai la commissione. Nelle ultime 24 ore il rimborso demo è zero. Il rendiconto distingue addebiti, commissioni e rimborsi. Non è contabilità fiscale o un sistema finanziario produttivo.

## Creazione, modifica e ricorrenze

L'organizzatore può creare gruppi e serate, configurare gli accessi, modificare le partite future e duplicarle. La modifica preserva gli iscritti e i riferimenti delle prenotazioni. La capienza non può scendere sotto le prenotazioni attive e non può eliminare una riserva occupata. Le variazioni generano notifiche locali agli iscritti; le richieste in attesa vengono accorciate se l'inizio viene anticipato.

Le ricorrenze sono settimanali, con data limite, anteprima ed esclusione opzionale delle festività italiane previste dal calendario del prototipo. Ogni occorrenza riceve l'iscrizione automatica dell'organizzatore; gli altri iscritti non vengono copiati automaticamente. Date e orari sono gestiti nel fuso Europe/Rome.

## Profili, disponibilità, inviti e valutazioni

I profili comprendono nome, città, biografia, ruolo, livello, punti di forza, giorni disponibili, disponibilità attuale e posizione preferita 1–6. La fotografia può essere caricata o rimossa, con fallback alle iniziali e ottimizzazione locale. La stessa identità/fotografia è usata in gruppo, partecipanti, campo e menu Profilo.

Sono presenti inviti locali dei giocatori disponibili. Accettare un invito apre la partita, ma non aggira l'obbligo di appartenenza approvata né prenota automaticamente un posto.

Le valutazioni sono disponibili per partite concluse alle quali il personaggio ha partecipato. Sono riferite alla struttura e ai partecipanti effettivi, possono essere parziali e non possono essere inviate due volte per la stessa partita/persona.

## Impostazioni, lingue, accessibilità e amministrazione demo

- Italiano e inglese, selettore disponibile soltanto nelle Impostazioni; cambio immediato e persistenza locale.
- Traduzioni centralizzate di schermate, moduli, popup, stati, notifiche e promemoria. Nomi propri e contenuti inseriti dagli utenti non vengono tradotti automaticamente.
- Tema chiaro, scuro e automatico.
- Anteprima auto/mobile/tablet/desktop.
- Campi orari compatti e controlli responsive.
- Focus dei dialoghi, tastiera, etichette accessibili e supporto a movimento ridotto.
- Tutorial collegato alla schermata corrente.
- Selettore «Personaggio demo» per simulare richiedenti, organizzatori e amministratore nello stesso browser.
- Pannello Amministratore Demo nelle Impostazioni, codice dimostrativo **2468**: rendiconti, gestione locale e durata dei blocchi. Non è autenticazione reale e non protegge dati sensibili.
- Esportazione e ripristino esplicito dei soli dati V002.

## Avvio locale

Richiede Node.js, nessun framework e nessuna dipendenza runtime aggiuntiva.

```powershell
cd prototypes/staseravolley-fabio/v002
node tools/serve.mjs 4192
```

Aprire http://127.0.0.1:4192/v002/ sul computer del server. Non aprire il file HTML direttamente: i moduli richiedono HTTP. L'indirizzo locale non è un link pubblico accessibile dallo smartphone.

## Struttura dei file e modello dati

| File / directory | Responsabilità |
| --- | --- |
| `index.html`, `admin.html` | Struttura e ingresso al pannello demo |
| `app.css` | Grafica, responsive, temi, campo e promemoria fisso |
| `app.js` | Navigazione, storage, dialoghi, focus, upload e interazioni |
| `core.js` | Regole, transizioni validate, prenotazioni, richieste, pagamenti e storico |
| `participation.js` | Migrazione idempotente, loghi e posto automatico dell'organizzatore |
| `data.js`, `dates.js` | Dati demo, identificativi, date, ricorrenze e festività |
| `views.js` | Rendering senza mutazioni e promemoria derivato dalle prenotazioni |
| `translations.js` | Cataloghi IT/EN |
| `assets/avatars/`, `avatar-manifest.js` | 40 ritratti e associazioni stabili |
| `assets/groups/` | Sei loghi SVG di fantasia |
| `tests/`, `tools/` | Test, server locale, ottimizzazione e verifiche |
| `docs/` | Report, screenshot, inventario SHA-256 e documentazione storica |

Entità separate: profili, gruppi, appartenenze, partite, prenotazioni, richieste, notifiche, pagamenti, inviti, valutazioni e storico. Disponibilità e quote da pagare derivano dalle prenotazioni: non esistono contatori paralleli da mantenere manualmente.

Storage dedicato: `staseravolley-v002-state-v1` e `staseravolley-v002-settings-v1`. Nessuna importazione automatica dalla V001 e nessun `localStorage.clear()`. I dati corrotti non vengono cancellati silenziosamente; è disponibile l'esportazione seguita da ripristino esplicito. Se il salvataggio fallisce per quota esaurita, la modifica non viene presentata come confermata.

## Verifiche

```powershell
node --test tests/core.test.mjs
node tests/browser.mjs
node tests/robustness.mjs
node tests/avatars.mjs
```

I test browser richiedono Playwright e Microsoft Edge. Se il modulo è installato altrove, indicarlo con `PLAYWRIGHT_MODULE`. Nessuna nuova dipendenza viene installata nel repository.

Ultima verifica locale: 29 test di logica/rendering, 18 verifiche browser, 4 verifiche robuste e controllo dei 40 ritratti.

I report aggiornati sono in `docs/core-test-results.txt`, `docs/browser-results.json`, `docs/robustness-results.json` e `docs/avatar-test-results.json`. Coprono regole di iscrizione, organizzatore, capienza, scadenze, pagamenti, rimborsi, loghi, promemoria, navigazione, lingua, storage e foto. Sono verificati viewport 390, 820 e 1440 nei due temi. Gli screenshot full-page possono mostrare gli elementi fissi alla quota del primo viewport, come durante lo scorrimento.

`docs/source-baseline.json` registra i file originali V000/V001. I report e gli snapshot V001 presenti in `docs/v001-reference/` sono storici, non codice attivo né dichiarazioni delle funzioni attuali. `tools/verify-scope.mjs` e il relativo report si riferiscono alla preparazione iniziale precedente ai commit di pubblicazione; le successive consegne verificano anche Git e i percorsi modificati.

## Limiti e sviluppi necessari per un'app reale

- Nessuna autenticazione effettiva, autorizzazione server, database condiviso, notifica push, transazione finanziaria o garanzia di concorrenza tra utenti.
- Il selettore di personaggio e il codice admin sono strumenti dimostrativi.
- Nessuna sincronizzazione tra browser, account o dispositivi: la condivisione del link con i soci non condivide i dati del proprio browser.
- Lo storage ha una quota limitata e può essere cancellato dalle impostazioni del browser.
- Mappa schematica locale; Google Maps viene aperto solo cliccando il collegamento della palestra/località.
- Test responsive su Edge Chromium; nessuna certificazione su dispositivi iOS/Android fisici o Safari/WebKit.
- Per la produzione occorrono backend, autenticazione, controllo permessi server-side, transazioni atomiche, persistenza dei file, notifiche reali e un'integrazione pagamenti autorizzata.

La pubblicazione su GitHub/Vercel è stata autorizzata separatamente dalla fase iniziale locale. V000, V001, main e il sito principale non vengono sostituiti dallo sviluppo della V002.


## Verifica nuova iterazione locale

Eseguire anche `node tests/next-ux.mjs`. I sei scenari coprono Salva unico, immagini in bozza, avviso chiudibile/campanella, tutorial, confronto versioni e cancellazione gruppo. La logica comprende 31 test; sono disponibili anche 18 verifiche browser generali e 4 controlli robusti. `experience.js` gestisce quote dovute e confronto versioni; `tour.js` contiene la guida contestuale.

## Sezioni del gruppo, ritaglio e profilo

Il cartellino separa Gestione gruppo (Modifica/Elimina), Gestione richieste e Prossime serate attive con Crea serata. Le immagini vengono prima aperte in un ritaglio quadrato: trascinamento, zoom e posizione X/Y, Annulla o Conferma ritaglio; solo il Salva del modulo applica la foto o il logo. La foto del profilo è modificabile soltanto entrando in Modifica profilo. Gli interruttori hanno righe alternate in colori soft e sezioni dedicate per ridurre gli errori. Test specifico: `node tests/crop-layout.mjs`.

V003 pubblicata separatamente: https://stasera-pallavolo.vercel.app/mockup/v003/ . Le chat non sono presenti in V002.

## Mappa geografica

La directory usa Leaflet 1.9.4 locale e cartografia OpenStreetMap via HTTPS, con attribuzione visibile, trascinamento, zoom e punti raggruppati per località. Filtri e ricerca coincidono con l’elenco. Le coordinate sono centri delle località verificati con Nominatim, non indirizzi inventati delle palestre; il popup lo dichiara e apre i gruppi associati. Le nuove località vengono cercate con richieste serializzate e risultati memorizzati per la sessione. Serve connessione per la cartografia: in caso di problemi l’elenco rimane disponibile. Nessun servizio a pagamento. Licenza Leaflet in assets/leaflet/LICENSE. Questa sezione sostituisce la precedente descrizione della mappa schematica.

## Quota dell’organizzatore

L’organizzatore è esente nelle proprie serate: il posto è confermato, la sua quota è zero e lo stato è Esente, senza pagamento né promemoria. Nelle serate organizzate da altri paga come gli altri membri. Le quote delle altre persone non cambiano. Le prenotazioni future dell’organizzatore ancora non pagate vengono aggiornate automaticamente; pagamenti e rendiconti già registrati vengono conservati.

La campanella apre/chiude Notifiche: il secondo tocco torna alla pagina e alla posizione di scorrimento precedenti. È presente anche il comando Indietro nella schermata.
