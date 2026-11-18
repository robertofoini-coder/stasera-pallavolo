# StaseraVolley V003 — messaggistica dimostrativa

**Versione demo separata, con pubblicazione autorizzata.** Deriva dalla nuova V002 locale e ne mantiene tutti gli accorgimenti: avviso pagamento chiudibile con campanella rossa, tutorial con focus, confronto versioni, foto/logo con matita e Salva unico, gruppi modificabili/eliminabili e interruttori on/off.

Le funzioni base sono documentate in [README V002](../v002/README.md). V000 e V001 rimangono immutate.

## Avvio

Dal terminale in questa directory:

```powershell
node tools/serve.mjs 4193
```

Aprire http://127.0.0.1:4193/v003/ sul computer del server. La V002 locale è consultabile a http://127.0.0.1:4192/v002/ quando il suo server è avviato. Il menu superiore permette il confronto; non importa i dati delle altre versioni.

## Chat demo

- Nuova voce Messaggi nella navigazione inferiore.
- Rubrica dei personaggi demo con ricerca, avatar, anteprima dell’ultimo messaggio e contatore non letti.
- Chat dirette tra due personaggi, accessibili anche dal cartellino di un altro giocatore.
- Bolle distinte, orari, separatori data e indicazione inviato localmente/letto.
- Compositore con emoji rapidi; Invio invia, Maiusc+Invio va a capo.
- Testo semplice fino a 2000 caratteri, con escape HTML. Niente allegati, audio o servizi esterni.
- Notifiche locali di nuovo messaggio; apertura della chat segna come letti solo i messaggi indirizzati al personaggio corrente da quel contatto.
- Aspetto blu/viola, mobile e desktop, chiaro/scuro; italiano e inglese; guida contestuale anche nelle chat.

### Come provarla

1. Scegli Giocatore Demo, apri Messaggi e cerca Luca B.
2. Scrivi un messaggio e invialo.
3. Cambia il personaggio superiore in Luca B.: compare il contatore non letti.
4. Apri la chat con Giocatore Demo e rispondi.
5. Torna a Giocatore Demo per leggere la risposta e verificare gli indicatori di lettura.

Nessun interlocutore è online realmente e non vengono inviate risposte automatiche. Per rispondere bisogna cambiare personaggio. Questa è una simulazione nello stesso browser, non messaggistica tra account o dispositivi reali.

## Dati isolati

Chiavi: `staseravolley-v003-state-v1` e `staseravolley-v003-settings-v1`. Nessuna importazione o cancellazione dei dati V002. I messaggi si aggiungono al modello base come entità con identificativi stabili, mittente, destinatario, thread, testo, data e lettura. Il selettore demo e i dati in localStorage non costituiscono autenticazione o protezione multiutente.

## Test

```powershell
node --test tests/core.test.mjs
node tests/browser.mjs
node tests/next-ux.mjs
node tests/robustness.mjs
node tests/chat.mjs
```

Playwright/Edge richiesti per i test browser; indicare il modulo con PLAYWRIGHT_MODULE se installato esternamente. Report in docs; screenshot chat in docs/v003-chat-mobile.png e docs/v003-chat-desktop.png.

Per trasformarla in messaggistica reale servono autenticazione, autorizzazioni server, database condiviso, sincronizzazione realtime, regole di accesso e gestione della privacy. Nessuna di queste integrazioni è presente o dichiarata funzionante in questa versione.

## Pubblicazione e ultime funzioni

Link diretto: https://stasera-pallavolo.vercel.app/mockup/v003/ . V002: https://stasera-pallavolo.vercel.app/mockup/v002/ . I sorgenti sono nel branch Html dei due repository; V000 e V001 restano intatte. Il sito condivide il codice, non i dati dei browser.

La chat è consentita soltanto tra membri attivi/approvati di almeno un gruppo comune non eliminato. Chi non condivide gruppi non appare in Nuova chat; la regola è verificata anche nelle transizioni, ma rimane una simulazione e non sicurezza server. Per provare Luca B. con Giocatore Demo, entra prima in Voltaren.

Conversazioni mostra soltanto le chat esistenti. Nuova chat apre i contatti consentiti; Archiviate raccoglie quelle archiviate. Il menu ⋮ permette di archiviare/ripristinare o eliminare una conversazione solo per il personaggio corrente: l’altra persona conserva la sua copia. Nuovi messaggi riaprono le chat archiviate/eliminate. Nessun messaggio diretto aggiunge notifiche alla campanella: i non letti compaiono nella sezione Messaggi, con badge vicino all’icona.

Il selettore emoji include 3.963 sequenze fully-qualified (varianti incluse), categorie, ricerca per nome inglese e caricamento progressivo. Fonte: [Unicode emoji-test](https://unicode.org/Public/emoji/latest/emoji-test.txt); dati disponibili localmente in assets/emoji.json, senza richieste esterne durante l’uso.

La bacheca del gruppo è riservata ai membri. L’organizzatore o amministratore autorizzato può pubblicare messaggi; ogni altro membro attivo riceve una notifica con collegamento alla bacheca. Aprirla marca come lette soltanto le relative notifiche. I non membri non vedono i messaggi.

Sono inclusi tutti gli accorgimenti V002: sezioni del gruppo separate, immagini con ritaglio confermato, modifica foto soltanto dal modulo Profilo e interruttori su righe alternate soft. Test: tests/social.mjs, tests/chat.mjs, tests/crop-layout.mjs oltre alle verifiche base.

## Navigazione Messaggi con icone

L’ingresso in Messaggi e il ritorno dalla chat aprono sempre Conversazioni, con ricerca azzerata. Se non esistono chat, l’elenco è vuoto. I contatti dei gruppi comuni si aprono solo con l’icona di composizione. Conversazioni, Nuova chat, Archiviate e Indietro usano icone SVG con titolo ed etichetta accessibile IT/EN. Test dedicato: tests/inbox.mjs.

## Mappa geografica

La directory usa Leaflet 1.9.4 locale e cartografia OpenStreetMap via HTTPS, con attribuzione visibile, trascinamento, zoom e punti raggruppati per località. Filtri e ricerca coincidono con l’elenco. Le coordinate sono centri delle località verificati con Nominatim, non indirizzi inventati delle palestre; il popup lo dichiara e apre i gruppi associati. Le nuove località vengono cercate con richieste serializzate e risultati memorizzati per la sessione. Serve connessione per la cartografia: in caso di problemi l’elenco rimane disponibile. Nessun servizio a pagamento. Licenza Leaflet in assets/leaflet/LICENSE. Questa sezione sostituisce la precedente descrizione della mappa schematica.

## Quota dell’organizzatore

L’organizzatore è esente nelle proprie serate: il posto è confermato, la sua quota è zero e lo stato è Esente, senza pagamento né promemoria. Nelle serate organizzate da altri paga come gli altri membri. Le quote delle altre persone non cambiano. Le prenotazioni future dell’organizzatore ancora non pagate vengono aggiornate automaticamente; pagamenti e rendiconti già registrati vengono conservati.
