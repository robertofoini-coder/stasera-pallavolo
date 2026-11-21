# StaseraVolley V004 — interfaccia minimale

V004 deriva dalla V003 (`4cf9c69` nel repository Roberto), con l'intera review grafica integrata. Mantiene HTML, CSS e JavaScript, il modello dati e le funzioni della V003. Non introduce framework o servizi a pagamento.

## Aprire la versione

- Pubblicazione prevista: https://stasera-pallavolo.vercel.app/mockup/v004/
- V003 conservata: https://stasera-pallavolo.vercel.app/mockup/v003/
- Sorgenti: `prototypes/staseravolley-fabio/v004/`, branch `Html`.
- Locale: `npm start`, poi http://127.0.0.1:4195/v004/ .

Il selettore di versione e di personaggio demo è nella barra superiore richiudibile. Dalla V004 si possono confrontare V000, V001, V002 e V003; a ogni passaggio appaiono le note sulle differenze. I percorsi precedenti e l'app principale rimangono separati.

## Cosa cambia rispetto alla V003

### Stile e navigazione

Superfici neutre, bordi leggeri, spaziature coerenti, blu per le azioni principali, icone lineari e titoli compatti. Le schermate secondarie e i moduli hanno una freccia di ritorno. La navigazione inferiore mantiene Esplora, Prenotazioni, Gruppi, Messaggi e Profilo; il profilo usa la foto quando disponibile. Campanella sempre visibile; impostazioni, tutorial e richieste sono nel menu aggiuntivo. Tema chiaro, scuro e automatico; italiano e inglese nelle Impostazioni.

### Esplora e mappe

Ricerca geografica in una riga con Invio/pulsante e posizione del dispositivo solo su richiesta. Date rapide: Tutte, Oggi, Domani, Settimana. Il pannello filtri contiene ricerca gruppo/palestra, provincia, data precisa e ordine per data, distanza, quota o disponibilità. Le scelte restano attive alla chiusura; è presente il comando di azzeramento.

Le schede mostrano logo del gruppo, nome, data, orari, palestra, organizzatore, disponibilità e quota. Nessuna fotografia decorativa. Una colonna su smartphone e due su desktop. A 390 × 844 la prima serata inizia a circa 355 px, contro 750 px della V003 di partenza: tre schede complete subito visibili.

Elenco e mappa Leaflet/OpenStreetMap condividono i filtri. I punti sono raggruppati per località; con zoom ravvicinato mostrano loghi e informazioni delle serate. Le distanze sono indicative in linea d'aria rispetto alla località, non tragitti stradali o indirizzi inventati delle palestre demo. Le tile e le località non già note richiedono connessione. Toccando una serata si apre la propria scheda Info, senza prenotare automaticamente.

### Gruppi

Gruppi apre le appartenenze attive del personaggio; le richieste pendenti sono distinte. Cerca altri gruppi apre la directory alfabetica, con nome/palestra/località/provincia e vista mappa.

Il cartellino è diviso in **Serate**, **Membri** e **Info**. Le serate e la bacheca non sono precedute dall'intero elenco dei membri. Info contiene descrizione/storia, palestra, giorno abituale e regole. L'organizzatore può modificare gruppo e logo, gestire richieste e creare serate; l'eliminazione è separata e richiede conferma. Il logo/foto si carica dal simbolo con matita, scegliendo il ritaglio prima di salvarlo.

I sei gruppi iniziali rimangono distinti, inclusi Bagher & Spritz e Volley & Spritz. I due gruppi di Brescia mantengono 14 prenotazioni su 16: 12 in campo, due riserve confermate e due posti riserva disponibili. Nomi, foto generate, loghi e palestre dimostrativi restano dichiarati tali.

### Partita, campo e prenotazioni

Scheda compatta con gruppo, organizzatore, data, luogo cliccabile e avanzamento iscrizioni. Campo, Partecipanti e Info sono schede coerenti, navigabili anche con le frecce da tastiera. Rimangono le 12 posizioni regolamentari, i numeri, le foto o iniziali, i colori squadra, l'evidenza del proprio posto e le riserve separate.

La selezione di un posto porta il focus sul comando di prenotazione. Senza selezione viene mostrato il popup «Scegli un posto nel campo tra quelli a disposizione». Doppie prenotazioni, posti occupati e superamento della capienza restano impediti dal modello locale. I membri permanenti sono distinti dagli iscritti alla serata.

La prenotazione richiede prima l'appartenenza approvata al gruppo. Approvazione membri e prenotazioni sono impostazioni indipendenti. Le richieste di prenotazione bloccano temporaneamente il posto: accettazione conferma, rifiuto/scadenza libera. La scadenza demo è 24 ore o l'inizio della serata, se precedente; è verificata anche alla riapertura.

Prenotazioni distingue **In programma** e **Storico**. Ogni scheda riunisce stato, posizione, quota e comandi pertinenti. Una quota passata priva di registrazione è indicata come tale, senza un pulsante di pagamento improprio.

### Organizzazione

Creazione/modifica di gruppo e serata sono divise in sezioni. Un solo Salva; i dati caricati restano bozza fino alla conferma. Inizio/fine sono affiancati anche su smartphone. Le opzioni di ricorrenza compaiono quando attivate. Conservate duplicazione, esclusione delle festività prevista dal modello, capienza fino a 30 e preservazione degli iscritti durante la modifica.

L'organizzatore è confermato automaticamente nella posizione del proprio profilo, senza richiesta a se stesso; non paga nelle proprie serate. Nelle serate altrui segue le normali regole. I controlli su collisioni del posto e rendiconti già registrati rimangono quelli della V003.

Richieste usa filtri compatti, decisioni Accetta/Rifiuta e storico con autore e data. Una richiesta già conclusa o scaduta non può essere decisa di nuovo. Le richieste sono gestibili solo dall'organizzatore/amministratore demo autorizzato.

### Profilo, notifiche, chat e pagamenti

Profilo riunisce identità, livello/ruolo, disponibilità settimanale, capacità e valutazioni realmente presenti nel modello. Nessun voto casuale è inventato. La foto si modifica dal modulo; disponibilità, capacità e giorni usano interruttori e un unico salvataggio. Il profilo di un partecipante permette di tornare alla partita di provenienza.

Notifiche è un elenco compatto: le non lette hanno una lieve evidenza, i pagamenti da completare sono separati. Il promemoria di pagamento è chiudibile ma resta nelle notifiche; la campanella rimane rossa fino al saldo simulato. I messaggi diretti usano i propri contatori, senza notifiche duplicate nella campanella.

Messaggi mostra solo conversazioni avviate. Nuova chat parte vuota, cerca da due caratteri e include soltanto membri approvati di gruppi comuni senza una chat già esistente. Restano foto, bolle, orari, lettura locale, emoji, Invio/Maiusc+Invio e menu per archiviare/ripristinare o eliminare la conversazione per il proprio personaggio. La bacheca dell'organizzatore notifica i membri del gruppo. Le categorie emoji sono tradotte; la ricerca usa i nomi inglesi del dataset, come indicato nel campo. Alcuni simboli dipendono dal supporto del sistema operativo.

Pagamento accessibile solo dopo conferma, con Satispay/PayPal **simulati**, quota, commissione del 5% e totale. Nessuna transazione reale. La disdetta rimborsa la quota se mancano almeno 24 ore, senza commissione; nelle ultime 24 ore il rimborso è zero. Il rendiconto demo conserva addebiti, rimborsi e commissioni.

Impostazioni presenta subito tema e lingua. Gli strumenti del prototipo sono richiudibili; il rendiconto è accessibile con Amministratore Demo e codice demo `2468`. Questo codice non è autenticazione o sicurezza di produzione.

## Dati e limiti

Chiavi dedicate: `staseravolley-v004-state-v1` e `staseravolley-v004-settings-v1`. Nessuna importazione automatica dalla V003 o dalla review locale, nessun `localStorage.clear()`. Il reset riguarda soltanto V004.

Profili, autorizzazioni, notifiche, chat, richieste, pagamenti e rendiconti sono locali allo stesso browser. Non sono multiutente, cifrati end-to-end o sincronizzati tra dispositivi. Il sito principale con Supabase non viene modificato da questa versione del mockup.

## Verifiche

```powershell
npm test
node tests/review-browser.mjs
node tests/versions.mjs
node tests/all-screens.mjs
node tests/responsive-screens.mjs
node tests/group-photo-check.mjs
```

I test browser richiedono Playwright ed Edge; usare `PLAYWRIGHT_MODULE` se il modulo è installato esternamente.

- Sintassi JavaScript verificata.
- 34 test del modello superati.
- 10 scenari funzionali superati: filtri, mappa, GPS simulato, dettagli evento, gruppi, riserva/prenotazione, pagamento/disdetta, approvazione, profilo, chat, lingua e tutorial.
- 44 schermate/stati acquisiti a 390 e 1440 px, con due percorsi completi superati.
- 22 sezioni a 320 px inglese/scuro e 22 a 820 px italiano/chiaro, senza overflow nelle schermate provate.
- Caricamento logo, annullamento ritaglio e salvataggio unico verificati.
- Identità V004, storage isolato, cinque versioni selezionabili e note di confronto verificati.
- 308 file delle versioni precedenti controllati con SHA256 e invariati.

Report in `docs/*-results.json`, `docs/core-results.txt` e `docs/previous-versions-integrity.json`. Screenshot di esempio in `docs/v004-mobile.png` e `docs/v004-desktop.png`; acquisizioni complete generate localmente in `docs/screens/` ed escluse dal commit.

Non sono prove su dispositivi fisici né un audit completo con lettore schermo. Restano utili prove con il team prima di trasformare il prototipo in un prodotto reale.

## Riferimenti progettuali

[Airbnb](https://news.airbnb.com/product-releases/airbnb-2025-summer-release), [gruppi Strava](https://support.strava.com/en-us/articles/15401837-clubs-on-the-mobile-app), [messaggistica Strava](https://support.strava.com/en-us/articles/15401651-messaging-on-strava) e [approccio WhatsApp](https://www.meta.com/design-at-meta/blog/whatsapp-user-interface-update/) sono riferimenti per gerarchie, ricerca, navigazione stabile e icone. Sono adattati a StaseraVolley; non sono una copia o un'integrazione con questi servizi.
