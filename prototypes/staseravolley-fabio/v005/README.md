# StaseraVolley V005 — Pulse con tutte le funzionalità V004

> Revisione del 24 novembre 2026: tema blu/azzurro, campo Arena 3D interattivo, nome organizzatore rimosso dalle sole schede Serate, menu legali e supporto nelle Impostazioni, login/logout e creazione/eliminazione account demo. Pubblicazione autorizzata sul branch Html dei repository Roberto e Fabio e nello stesso percorso V005 su Vercel. Gli esiti di rilascio vengono verificati separatamente.

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

Blu scuro per header e navigazione, accenti azzurri, icone SVG lineari, serate a biglietto con data laterale e loghi dei gruppi. Campo tattico con fotografie, numeri regolamentari, colori squadra, proprio posto e riserve. La navigazione inferiore contiene Home, Serate, Gruppi e Profilo; i messaggi restano nell'header. L'organizzatore resta nel dettaglio partita e nel gruppo, ma non nelle schede dell'elenco Serate.

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
node tests/privacy-browser.mjs
node tests/arena-account-browser.mjs
```

I test browser richiedono Playwright/Edge e `PLAYWRIGHT_MODULE` se installato fuori dal progetto. Rapporti attuali in `docs/`. Non si tratta di test su dispositivi fisici o di una certificazione completa di accessibilità.

## Privacy e condizioni — prova locale

Footer e Impostazioni aprono schermate demo in italiano e inglese per Privacy, Condizioni demo, Cookie e archiviazione e Preferenze privacy. Titolare e contatti sono esplicitamente da definire: nessun dato aziendale è inventato. Non è richiesta una firma o accettazione contrattuale della bozza per usare l'app.

Il codice usa localStorage, non integra analisi/pubblicità e non scrive cookie applicativi. Questo non certifica hosting o altri servizi esterni. Mappe e ricerche di località non già note sono facoltative e disattivate inizialmente: il pannello blocca davvero tile OpenStreetMap e richieste Nominatim finché non sono abilitate. I link Google Maps sono navigazioni esterne avviate dall'utente. Il permesso geolocalizzazione del browser è distinto.

Le scelte sono riapribili, modificabili e salvate su questo browser con `staseravolley-v005-privacy-v1`, versione informativa e data della scelta. Non costituiscono una prova server di consenso multiutente. Una scelta assente, non valida o di altra versione mantiene le mappe disattivate. Nessuna categoria analitica/pubblicitaria fittizia è presentata come attiva. Rifiuto e consenso alle mappe hanno pari evidenza; si può continuare a usare le funzioni locali senza abilitarle. Il reset dei dati demo non cancella le preferenze privacy: modificarle nel relativo pannello.

Verifiche aggiuntive locali: 35 test modello, 10 scenari browser, 44 controlli responsive e 36 controlli privacy/interfaccia superati. Il test privacy intercetta i provider remoti e usa risposte simulate per misurare invio/blocco delle richieste senza dipendere dalle tile reali; la regressione con mappe abilitate prova anche il percorso geografico esistente. Controllati persistenza, revoca, ricerca esterna negata, assenza iniziale di richieste, dati corrotti, IT/EN, overflow e navigazione. Nessuna prova su dispositivi fisici o valutazione legale definitiva.

Prima di un uso reale occorre completare l'identità del titolare/gestore, contatti, finalità e basi giuridiche, destinatari e fornitori, conservazione, diritti, eventuali trasferimenti e condizioni economiche effettive, oltre a verificare la configurazione dell'hosting. Riferimenti: [Garante — Linee guida cookie](https://www.garanteprivacy.it/home/docweb/-/docweb-display/docweb/9677876) e [GDPR — articolo 13](https://eur-lex.europa.eu/legal-content/IT/TXT/?uri=CELEX%3A32016R0679). Le schermate restano bozze per il prototipo.

## Campo Arena 3D, account e supporto

Il campo riprende la variante Arena scelta: pavimento blu in prospettiva, linee, rete a maglia e pali, fotografie circolari e numeri delle posizioni. È realizzato in HTML/CSS, non con uno screenshot statico: selezione posto, apertura profili, riserve, cambio posto e prenotazione restano collegati al modello V004. I giocatori non sono trasformati in prospettiva, per preservare leggibilità e controlli da tastiera. Temi chiaro/scuro e numerazione regolamentare restano disponibili.

Impostazioni presenta menu a righe per Privacy, Condizioni demo, Cookie e archiviazione, Preferenze privacy, e una sezione Aiuto con Contatta il supporto. Il footer conserva collegamenti piccoli e sobri. Le pagine sono bozze IT/EN; non inventano titolare, contatti o condizioni contrattuali definitive.

Nel Profilo è disponibile Esci dalla demo, con conferma. I dati del modello restano salvati. Dopo l'uscita appare Accedi alla demo con selettore personaggio; chat, prenotazioni personali e comandi che modificano il modello richiedono il rientro nella sessione demo. Lo stato di uscita persiste alla riapertura. Per compatibilità, le sessioni del prototipo già esistenti rimangono inizialmente attive. Questo controllo dell'interfaccia non è autenticazione sicura o Supabase Auth: gli strumenti Personaggio demo restano intenzionalmente strumenti di sviluppo.

Crea account demo genera un nuovo profilo locale con identificativo stabile, nome, città e posizione preferita, senza password, email verificata, adesioni automatiche o privilegi amministrativi. Il nuovo profilo può usare le funzioni del modello esistente. Elimina account demo è disponibile sui profili creati nella prova e richiede conferma; i personaggi precaricati e gli amministratori sono protetti. Se il profilo organizza gruppi attivi deve prima gestirli/eliminarli, per non lasciare membri senza organizzatore. Le prenotazioni future vengono disdette tramite le regole di rimborso esistenti, senza duplicare movimenti; nome, foto, adesioni, messaggi associati e bozza supporto vengono rimossi. Il rendiconto e i riferimenti storici restano associati a un segnaposto senza nome/foto dell'utente. Il profilo eliminato non è più selezionabile per l'accesso. Non è un servizio reale di cancellazione GDPR.

Il modulo supporto permette di inserire nome dimostrativo, email facoltativa, argomento e messaggio, salvare o eliminare la bozza e riprenderla dopo la riapertura. La chiave è `staseravolley-v005-support-draft-v1`. Il destinatario NON è configurato: nessuna email, ticket o richiesta viene inviata, come indicato accanto al modulo e nel messaggio di salvataggio. Nessun servizio o costo esterno è introdotto. L'utente ha confermato di mantenere login demo e supporto senza invio fino a comunicazione dell'email.

Verifiche della revisione: 41 test modello/account, 39 controlli browser Arena/account/supporto, 36 controlli privacy/interfaccia, 10 scenari funzionali, 44 verifiche responsive a 320/820 pixel e ritaglio logo superati. Rapporti in `docs/`. Gli scenari di creazione/eliminazione includono persistenza, annullamento della conferma, blocco dei profili protetti, gestione dei gruppi posseduti, liberazione posti e conservazione coerente di rimborso/commissione. Non sono test su dispositivi fisici o autenticazione multiutente.
