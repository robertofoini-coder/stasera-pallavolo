# StaseraVolley V005 — Pulse con tutte le funzionalità V004

Aggiornamento del 24 novembre 2026. Questa versione sostituisce la precedente proposta ridotta V005 con il runtime completo della V004 e il linguaggio visivo Pulse. HTML, CSS e JavaScript; nessun framework o backend aggiunto. Le versioni V000–V004 e l'app principale rimangono separate e invariate.

## Apertura e strumenti demo

- Link pubblico: https://stasera-pallavolo.vercel.app/mockup/v005/
- Sorgenti: `prototypes/staseravolley-fabio/v005/`, branch `Html` del repository Roberto.
- Locale: `npm start`, poi http://127.0.0.1:4197/v005/ .
- **Cambiare giocatore:** aprire la barra in alto che mostra `V005 · nome del giocatore · Personaggio demo`, poi usare il selettore Personaggio demo. Comprende giocatori, organizzatori e Amministratore Demo.
- Messaggi: icona fumetto nell'header, con contatore indipendente dalle notifiche.
- Impostazioni, tutorial e pannello organizzatore/richieste: menu con tre puntini in alto.
- Amministrazione/rendiconto: Impostazioni, strumenti del prototipo, con personaggio Amministratore Demo e codice demo `2468`. Non è autenticazione di produzione.

## Navigazione e identità visiva

Inchiostro scuro per header e navigazione, accenti lime, icone SVG lineari, serate a biglietto con data laterale e loghi dei gruppi. Campo tattico con fotografie, numeri regolamentari, colori squadra, proprio posto e riserve. La navigazione inferiore contiene Home, Serate, Gruppi e Profilo; i messaggi restano nell'header.

Home conserva l'elenco completo delle prenotazioni, In programma e Storico, richieste pendenti, pagamento, disdetta, apertura della partita e valutazioni. Il promemoria globale dei pagamenti rimane chiudibile e nelle notifiche. Il dettaglio evento si apre sul Campo; Partecipanti e Info restano disponibili. Il pannello organizzatore affianca tutti i gruppi gestibili alla gestione completa delle richieste. La guida all'adesione spiega ingresso → approvazione → prenotazione senza sostituire i controlli del modello.

## Funzionalità conservate dalla V004

### Serate, ricerca e mappe

- Ricerca città/paese, posizione del dispositivo solo su richiesta e distanze indicative.
- Filtri per gruppo/palestra, provincia, data precisa, Tutte/Oggi/Domani/Settimana; reset e ordinamento per data, distanza, quota o disponibilità.
- Elenco e mappa Leaflet/OpenStreetMap coerenti; loghi e dati delle serate, apertura dell'evento corretto e link Google Maps dinamico.
- Località dell'utente distinta dalla palestra dell'evento; nessun indirizzo inventato per le palestre demo. Servizi geografici e tile richiedono connessione.

### Gruppi e organizzazione

- Sei gruppi distinti, inclusi Bagher & Spritz e Volley & Spritz; due gruppi Brescia con 14 prenotazioni su 16, 12 in campo e due riserve confermate.
- I miei gruppi e richieste pendenti separati dalla directory ricercabile, filtrabile e con mappa.
- Cartellino con Serate, Membri, Info, storia, organizzatore, regole e bacheca.
- Creazione, modifica ed eliminazione del gruppo con conferma; membri e prenotazioni preservati durante le modifiche compatibili.
- Logo caricabile/rimuovibile con ritaglio e bozza prima del Salva unico.
- Creazione/modifica serata, duplicazione, ricorrenze settimanali ed esclusione festività prevista dal modello; capienza fino a 30.
- Organizzatore inserito automaticamente nella propria posizione, con controlli sulle collisioni, esente dalla quota nelle proprie serate.

### Iscrizioni, posti e richieste

- Membri permanenti distinti dagli iscritti alla singola serata; appartenenza approvata necessaria prima di prenotare.
- Impostazioni indipendenti per approvazione nuovi membri e prenotazioni.
- Selezione campo e riserva, popup senza posto, focus sul comando di prenotazione, cambio posizione e disdetta.
- Controlli contro doppia prenotazione, posto occupato e superamento della capienza.
- Richieste con blocco temporaneo del posto: 24 ore o inizio partita, se precedente. Scadenza riconciliata anche alla riapertura.
- Accetta/Rifiuta, filtri, storico, autore/data, scadenze e controlli sui ruoli demo. Decisioni concluse non ripetibili.
- Inviti e relativa gestione preservati.

### Profilo e comunicazione

- Profilo modificabile, livello, ruolo, posizione, capacità, disponibilità settimanale con interruttori e Salva unico.
- Caricamento/rimozione foto con ritaglio; fotografie demo e avatar con iniziali. Profili dei partecipanti apribili e ritorno alla partita.
- Valutazioni delle strutture/giocatori e distribuzioni basate sui dati registrati, senza voti casuali.
- Notifiche locali per richieste e avvisi; stato letto/non letto e campanella rossa fino al pagamento.
- Chat solo tra membri approvati di gruppi comuni; inbox inizialmente vuota, nuova chat con ricerca, fotografie, messaggi, orari, lettura, contatori, emoji, Invio/Maiusc+Invio.
- Menu conversazione: archivia, ripristina, elimina per il proprio personaggio. Bacheca dell'organizzatore con notifica ai membri.

### Pagamenti e strumenti

- PayPal/Satispay simulati soltanto dopo conferma: quota, commissione 5% e totale.
- Disdetta con almeno 24 ore: rimborso quota, commissione trattenuta; ultime 24 ore: rimborso zero.
- Rendiconto demo di addebiti, rimborsi e commissioni, con regole e controlli V004 conservati.
- Lingue italiano/inglese centralizzate, selettore solo nelle Impostazioni, cambio immediato e persistenza.
- Tema chiaro/scuro/automatico, tutorial contestuale con focus, selettore versioni e note delle differenze.
- Esportazione/reset dei soli dati V005 e gestione degli errori dello storage.

## Dati e limiti

Chiavi del runtime completo: `staseravolley-v005-state-v1` e `staseravolley-v005-settings-v1`. Non si importano automaticamente dati V004 o della precedente proposta ridotta. La vecchia chiave `staseravolley-v005-design-demo-v1` rimane intatta nel browser, ma il formato ridotto non è usato dal nuovo modello. Le date e le relazioni sono quelle stabili del modello V004.

Profili, permessi, richieste, notifiche, inviti, messaggi, pagamenti e rendiconti rimangono simulazioni locali nello stesso browser. Nessun incasso reale, autenticazione reale, sincronizzazione tra account/dispositivi o cifratura end-to-end. Il sito principale collegato a Supabase non viene modificato da questa versione del mockup.

## Verifiche eseguite

- 35 test del modello superati: i 34 della V004 e un controllo aggiuntivo per Home/pannello organizzatore in entrambe le lingue e con diversi ruoli, senza mutazioni durante il rendering.
- 10 scenari browser superati: filtri, mappe/GPS, eventi, gruppi, riserve, prenotazione, pagamento/disdetta, approvazioni, profilo, chat, lingue, temi e tutorial.
- 88 acquisizioni di schermate/stati, 44 per larghezza a 390 e 1440 pixel; due percorsi completi superati.
- 44 controlli responsive: 22 a 320 pixel inglese/scuro, 22 a 820 italiano/chiaro; nessun overflow o errore JavaScript negli scenari provati.
- Versioni V000–V004 confrontabili dalla V005, note delle differenze e storage isolato verificati.
- Ritaglio logo: annullamento, isolamento della bozza e salvataggio unico verificati.

I test ereditati sono adattati solo per identità V005, accesso a Prenotazioni tramite Home, Messaggi nell'header, titolo Pulse e apertura iniziale sul Campo. Non sono state indebolite le verifiche sulle regole del modello.

```powershell
npm test
node tests/review-browser.mjs
node tests/all-screens.mjs
node tests/responsive-screens.mjs
node tests/versions.mjs
node tests/group-photo-check.mjs
```

I test browser richiedono Playwright/Edge e `PLAYWRIGHT_MODULE` se installato fuori dal progetto. Rapporti attuali in `docs/`. Non si tratta di test su dispositivi fisici o di una certificazione completa di accessibilità.
