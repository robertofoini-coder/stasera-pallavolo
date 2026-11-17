# Riepilogo tecnico — StaseraVolley

## 1. Obiettivo del progetto

Realizzare un mockup interattivo e navigabile di **StaseraVolley**, un’app per trovare, organizzare e prenotare partite amatoriali di pallavolo.

Il prototipo serve per raccogliere impressioni e provare i flussi con amici prima dello sviluppo dell’app produttiva. Deve funzionare su **telefono, tablet e desktop**.

Non è ancora un’app produttiva: autenticazione, autorizzazioni, pagamenti, inviti e dati condivisi sono prevalentemente simulati.

## 2. Repository, pubblicazione e workspace

- Repository GitHub: [fabiodimicco/StaseraVolley](https://github.com/fabiodimicco/StaseraVolley), privato.
- Branch remoto aggiornato: `main`.
- Sito pubblico: [StaseraVolley — Prototipo](https://staseravolley-prototipo.funnywalnut2.chatgpt.site/).
- Sites project ID: `appgprj_6afa150130648191ab153c5949b98c95`.
- Ultima versione pubblicata: **33**.
- Ultimo commit GitHub: `b625508f7ee01d7bcde71120ea2920316d5d006a`.
- Ultimo commit sorgente Sites: `9e152fdc66b8edd84949fb9b9c439c77595677cc`.

Il workspace è stato recentemente indicato come:

```text
/Users/fabio.dimicco/Documents/ChatGPT/StaseraVolley
```

Le modifiche precedenti sono state eseguite nel checkout:

```text
/Users/fabio.dimicco/Documents/GPT/StaseraVolley/staseravolley-prototipo
```

Prima di lavorare, verificare quale cartella contiene la copia effettivamente aggiornata. Non presumere che il cambio di workspace abbia copiato o spostato automaticamente i file.

## 3. Architettura attuale

Il prototipo è prevalentemente **buildless HTML/CSS/JavaScript**.

File principale del checkout usato finora:

```text
staseravolley-prototipo/dist/index.html
```

Contiene:

- Markup delle schermate.
- CSS e regole responsive.
- JavaScript per navigazione, dati demo e interazioni.
- Componenti aggiunti dinamicamente durante l’avvio.

Altri file e risorse presenti:

```text
dist/admin.html
dist/profile-volleyball-transparent.png
dist/toolbar-volleyball-transparent.png
dist/profile-avatar.jpg
.openai/hosting.json
```

Il repository GitHub contiene `index.html` e risorse nella radice, mentre il checkout Sites usa `dist/`. Le due strutture non sono identiche.

Il checkout Sites non aveva remoti Git standard configurati; il riferimento `roberto/main` è stato aggiornato tramite fetch espliciti dal repository GitHub.

## 4. Navigazione e layout

La navigazione attuale è:

1. **Esplora**
2. **Prenotazioni**
3. **Gruppi**
4. **Profilo**

Decisioni consolidate:

- Il vecchio tab **Disponibile** è stato eliminato: disponibilità e giorni disponibili sono nel Profilo.
- La sezione **Feedback** è stata rimossa dall’interfaccia.
- La footer bar deve restare sempre visibile in basso.
- Il contenuto delle schermate scorre all’interno della cornice dell’app.
- Nel mockup è presente un controllo per passare tra **Mobile, Tablet e Desktop**.
- Il selettore formato usa un’icona dispositivo senza la scritta “Vista”.
- La scelta del formato è memorizzata per la sessione.

### Tablet e desktop

- In Esplora la mappa è sempre visibile.
- Il selettore Lista/Mappa viene nascosto.
- Nel dettaglio partita:
  - Informazioni e prenotazione a sinistra.
  - Campo a destra.
- Nel Profilo:
  - Scheda identità compatta.
  - Capacità tra identità e disponibilità, nella colonna sinistra.
  - Valutazioni ricevute nella colonna destra.

### Mobile

- Layout a colonna singola.
- Esplora mantiene la scelta Lista/Mappa.
- Footer sempre disponibile.

## 5. Identità visiva

Scelte richieste dall’utente:

- Palette blu/navy, azzurro, bianco e accenti corallo.
- Header con curva azzurra ascendente, ispirata al mockup fornito.
- Logo pallavolo stilizzato chiaro nella toolbar.
- Pallone colorato come immagine predefinita del profilo personale.
- Entrambe le immagini del pallone con sfondo trasparente.
- Campanella notifiche nella top bar.
- Simulazione della status bar iPhone:
  - Giorno e ora a sinistra.
  - Segnale, Wi-Fi e batteria a destra.
- Icone SVG per i principali controlli.
- Avatar standard locali per i giocatori quando manca una foto.

## 6. Esplora

Funzionalità implementate:

- Selezione comune:
  - Bergamo.
  - Costa di Mezzate.
  - Montello.
- Ricerca per palestra o nome del gruppo.
- Filtri:
  - Stasera.
  - Domani.
  - Questa settimana.
  - Giorno preciso tramite calendario.
- Nomi gruppo demo:
  - Voltaren.
  - Smash & Fun.
  - Bagher & Spritz.
- Schede partita a larghezza piena.
- Posti disponibili e prezzo allineati.
- Mappa con marker cliccabili per evidenziare la partita corrispondente.
- Accesso al dettaglio della partita.

Il controllo **Scegli data** è stato corretto usando `HTMLInputElement.showPicker()` su clic e tastiera, con fallback al campo data visibile.

## 7. Campo e prenotazione dei posti

### Aspetto

- Campo azzurro in prospettiva.
- Linee dei tre metri.
- Rete centrale simulata con:
  - Trama.
  - Bordo chiaro.
  - Pali.
  - Ombra.
- La rete e le linee decorative non devono intercettare i clic.

### Numerazione

Le due metà sono speculari, ruotate di 180°.

| Riga | Fondo sinistro | Vicino alla rete, sinistra | Vicino alla rete, destra | Fondo destro |
|---|---:|---:|---:|---:|
| Alta | 5 | 4 | 2 | 1 |
| Centrale | 6 | 3 | 3 | 6 |
| Bassa | 1 | 2 | 4 | 5 |

Il numero **1** deve essere nella zona battuta: in basso a sinistra e in alto a destra.

### Stati dei posti

- Rosso: occupato.
- Verde: libero e selezionabile.
- Il posto scelto viene evidenziato.
- Nessun posto viene preselezionato all’ingresso.
- Il giocatore deve cliccare personalmente un posto libero.
- Il pulsante di prenotazione resta disabilitato finché non viene effettuata una scelta.
- Il box “Posto selezionato / Tocca un posto verde…” è stato rimosso.
- Rimossi i riferimenti “blu vs corallo”.
- Sotto il campo appare il numero dei posti disponibili.

### Capienza

- Partite da 12 giocatori.
- Esempio da 14:
  - 12 in campo.
  - Una riserva per squadra.
- Le riserve sono selezionabili come i posti in campo.
- I posti riserva occupati non devono risultare ancora disponibili.

### Ruoli

Era stata introdotta un’associazione demo:

- Laterale/Schiacciatore: posizioni 1 e 4.
- Centrale: 3 e 6.
- Palleggiatore: 2.
- Opposto: 5.
- Libero: 5 e 6.
- Universale: scelta libera.

La selezione automatica basata sul ruolo è stata successivamente eliminata dalla UX. Rimangono nel sorgente alcune funzioni e associazioni storiche da ripulire.

## 8. Giocatori iscritti e scheda giocatore

Nel dettaglio partita:

- La rosa mostra avatar cliccabili dei giocatori già prenotati.
- Gli avatar standard evitano dipendenze da immagini mancanti.
- Il clic apre una **schermata interna dedicata**.
- La scheda giocatore non deve aprirsi come popup.
- È disponibile il ritorno alla partita tramite indietro.

Dati demo mostrati:

- Nome.
- Ruolo.
- Affidabilità.
- Alcuni attributi descrittivi.

## 9. Prenotazioni e pagamento demo

Funzionalità:

- Prenotazione dopo selezione del posto.
- Pagamento simulato con:
  - Satispay.
  - PayPal.
- Riepilogo:
  - Quota partita.
  - Commissione piattaforma del 5%.
  - Totale.
- Salvataggio locale della prenotazione e del movimento demo.
- Elenco prenotazioni.
- Disdetta con conferma.
- Politica demo:
  - Rimborso della quota fino a 24 ore prima.
  - Commissione non rimborsabile.
  - Sotto le 24 ore la quota viene trattenuta.
- Partita conclusa demo per provare le valutazioni.

Nessun pagamento reale viene effettuato.

## 10. Valutazione partita e giocatori

Ultima funzionalità implementata, ispirata allo screenshot fornito dall’utente.

Percorso:

```text
Prenotazioni → partita conclusa → Valuta partita e giocatori
```

Schermata dedicata con:

- Valutazione del campo da 1 a 5 stelle.
- Schede giocatore con iniziali.
- Per ogni giocatore:
  - Affidabilità.
  - Tecnica.
- Criteri indipendenti.
- Voti facoltativi.
- Le voci non compilate non vengono conteggiate.
- Invio unico.
- Blocco del secondo invio per la stessa partita demo.
- Persistenza dopo ricaricamento.

Giocatori demo:

- Luca Bonetti.
- Marta Previtali.
- Davide Locatelli.

I voti sono salvati nel browser. Non esiste ancora un sistema condiviso che li aggrega nei profili reali.

## 11. Profilo personale

Implementato:

- Nome.
- Livello.
- Ruolo.
- Punti di forza.
- Descrizione delle capacità.
- Giorni di disponibilità.
- Interruttore disponibile/non disponibile.
- Modifica tramite matita.
- Foto selezionabile dal dispositivo.
- Valutazioni ricevute in sola lettura.

Modifica dei dati tramite pulsanti, evitando menu a tendina per:

- Ruolo.
- Livello.
- Punti di forza.
- Giorni della settimana.

Valutazioni mostrate separatamente:

- Presenze rispettate.
- Puntualità.
- Tecnica.
- Spirito di squadra.
- Fair play.

Affidabilità e capacità tecnica devono rimanere concetti distinti.

## 12. Disponibilità e notifiche demo

Regola richiesta dall’utente:

- Nessuna notifica aperta automaticamente all’avvio.
- L’invito demo parte quando la disponibilità viene disattivata e poi riattivata.
- Compare un banner di invito.
- La campanella permette di accedere all’invito.
- “Non ora” chiude l’invito.
- “Partecipo” chiude la notifica e apre il dettaglio per accettare o rifiutare.

Correzioni effettuate:

- X per chiusura manuale.
- Banner temporanei che scompaiono completamente.
- Stato chiuso con `visibility`, `opacity` e `pointer-events`.
- Messaggi contenuti nella cornice dell’app.
- Sovrapposizioni corrette tra footer e popup di pagamento.

## 13. Gruppi

Il tab Gruppi sostituisce Feedback.

Per il mockup i permessi organizzatore sono attivi. L’effettiva visibilità in base al profilo deve essere definita successivamente.

### Creazione serata aperta

Campi:

- Nome del gruppo.
- Data.
- Ora.
- Palestra/luogo.
- Capienza totale.

Esempio luogo:

```text
Centro sportivo Costa di Mezzate
```

Comportamento:

- L’organizzatore viene inserito tra i partecipanti.
- I posti restanti sono prenotabili.
- Possibilità di prenotare e disdire il proprio posto.
- Conteggio iscritti/capienza/posti liberi.
- Elenco iscritti confermati.
- Dati conservati nel browser.

### Inviti

- Ricerca dei giocatori demo disponibili per nome o ruolo.
- Esclusione di chi è già iscritto.
- Inviti in attesa.
- Il posto viene occupato solo all’accettazione.
- Pulsante **Simula accettazione** per provare il flusso.
- Aggiornamento dei conteggi.

Gli inviti non vengono realmente inviati ad altri utenti.

### Ricorrenze

- Opzione “Ripeti ogni settimana”.
- Giorno determinato dalla data iniziale.
- Data finale inclusiva.
- Anteprima delle date prima della creazione.
- Partite indipendenti con iscritti e inviti separati.
- Identificativo di serie condiviso.
- Limite attuale: 104 occorrenze.

### Festivi

- Controllo delle festività nazionali italiane.
- Calcolo di Pasqua e Pasquetta.
- Inclusione di San Francesco d’Assisi dal 2026.
- Avviso con date e nome della festività.
- Esclusione dei festivi attiva per impostazione predefinita.
- Possibilità di disattivare l’esclusione mantenendo l’avviso.
- Patroni locali e chiusure della palestra non sono calcolati automaticamente.

### Duplicazione

- “Duplica partita” riapre il modulo precompilato.
- Copia nome, ora, luogo e capienza.
- Permette di scegliere una nuova data.
- Non copia iscritti e inviti.
- La ricorrenza deve essere riattivata esplicitamente.

## 14. Altre funzionalità presenti

- Tutorial contestuale avviabile dal pulsante `?`.
- Nell’app finale il tutorial dovrebbe partire al primo accesso dopo il login.
- Impostazioni tema:
  - Chiaro.
  - Scuro.
  - Automatico.
- Pannello amministratori demo in `admin.html`.
- Accesso amministratori con codice locale dimostrativo `2468`.
- Rendicontazione demo dei pagamenti.

Queste funzioni derivano anche dall’integrazione delle modifiche di Roberto su GitHub.

## 15. Persistenza attuale

Dati conservati principalmente in `localStorage`, tra cui:

```text
staseravolley-profile
staseravolley-photo
staseravolley-theme
staseravolley-booking
staseravolley-ledger
staseravolley-groups-v1
staseravolley-match-ratings-v1
```

Il formato di anteprima usa:

```text
sessionStorage:
staseravolley-mockup-view
```

Sono ancora presenti riferimenti storici al feedback locale, benché la funzione sia stata rimossa dalla UI.

## 16. Test eseguiti

È stato installato temporaneamente Playwright in:

```text
/private/tmp/volley-qa
```

Browser usato:

```text
/Applications/Google Chrome.app/Contents/MacOS/Google Chrome
```

Test reali in Chrome headless con viewport:

- 390 × 1000.
- 820 × 1000.
- 1440 × 1000.

Script temporanei:

```text
check.cjs
flows.cjs
groups.cjs
recurring.cjs
calendar.cjs
ratings.cjs
```

Copertura verificata nei diversi interventi:

- Rendering delle 12 posizioni.
- Selezione manuale dei posti.
- Assenza di preselezione.
- Pulsante prenotazione disabilitato senza posto.
- Scheda giocatore e ritorno.
- Chiusura manuale e automatica dei banner.
- Pagamento demo.
- Ricaricamento con dati salvati.
- Disdetta.
- Prenotazione riserve.
- Cambio formato.
- Disponibilità e invito demo.
- Modifica profilo.
- Creazione gruppi.
- Ricerca, invito e accettazione.
- Conteggi e persistenza.
- Ricorrenze ed esclusione festivi.
- Duplicazione.
- Apertura calendario con clic e tastiera.
- Valutazioni indipendenti, invio parziale e blocco duplicati.
- Assenza di errori JavaScript nei flussi testati.
- Controlli di overflow orizzontale.
- Ispezione di alcuni screenshot.

Gli script sono temporanei e contengono percorsi assoluti al vecchio workspace. Non costituiscono ancora una suite di test versionata e portabile.

## 17. Istruzioni operative per Codex

Regole esplicite dell’utente:

1. **Prima di modificare, controllare sempre GitHub.**
2. Se ci sono aggiornamenti, acquisirli e integrarli prima del nuovo lavoro.
3. Preservare le modifiche dei collaboratori, incluso Roberto.
4. Eseguire test effettivi prima di pubblicare.
5. Se restano dubbi o i test falliscono, mantenere la correzione in locale.
6. Pubblicare solo dopo test superati.
7. Aggiornare anche GitHub.
8. Usare lo stesso sito pubblico.
9. Non considerare un controllo di sintassi equivalente a un test del funzionamento.
10. Screenshot e commenti browser sono riferimenti visivi da interpretare rispetto alla richiesta.

Ulteriori indicazioni tecniche:

- Verificare sempre il workspace attivo prima di usare percorsi precedenti.
- Usare `apply_patch` per le modifiche.
- Non sovrascrivere cambiamenti locali o remoti non analizzati.
- Per Sites, seguire il relativo workflow e conservare il project ID esistente.
- Non cambiare audience del sito.
- Credenziali di pubblicazione soltanto in memoria e tramite stdin.
- I commit Sites e GitHub hanno SHA differenti perché usano strutture repository diverse.
- Evitare ulteriori sovrapposizioni di funzioni e CSS: il sorgente contiene già molte revisioni successive.

L’utente aveva chiesto in precedenza lavoro parallelo con più agenti. Le istruzioni operative attuali richiedono però una richiesta esplicita applicabile prima di delegare nuovi subtask.

## 18. Debito tecnico e attività ancora da completare

### Consolidamento del mockup

- Separare HTML, CSS e JavaScript in file/moduli.
- Eliminare funzioni duplicate e implementazioni storiche sovrascritte.
- Rimuovere definitivamente il codice Feedback inutilizzato.
- Consolidare navigazione, gestione dello stato e apertura delle schermate.
- Ridurre gli override CSS accumulati.
- Rimuovere fallback statici non più coerenti con lo stato dinamico.
- Portare i test nel repository e renderli indipendenti dal percorso locale.
- Aggiungere test su browser diversi da Chrome e dispositivi reali.

### Coerenza dei dati

Attualmente Esplora, prenotazioni demo, gruppi creati e schede giocatore usano in parte modelli separati.

Da fare:

- Unificare il modello partita.
- Mostrare le partite create dai gruppi anche in Esplora e sulla mappa.
- Collegare le prenotazioni dei gruppi al tab Prenotazioni e al campo.
- Associare ogni giocatore a un’identità stabile.
- Collegare le valutazioni ai partecipanti effettivi della partita conclusa.
- Aggregare i voti nelle schede giocatore.
- Gestire riserve e assegnazioni anche nelle partite create dall’utente.

### Regole prodotto da definire

- Profili e ruoli autorizzati a creare gruppi.
- Differenza tra gruppo permanente e singola serata aperta.
- Regole di visibilità delle partite.
- Inviti, scadenza, rifiuto e lista d’attesa.
- Modifica o cancellazione di una singola ricorrenza o dell’intera serie.
- Gestione dei conflitti tra partite duplicate o ricorrenti.
- Chiusure palestra e festività locali.
- Criteri, anonimato e finestra temporale delle valutazioni.
- Possibilità di modificare una valutazione già inviata.

### Passaggio ad app produttiva

- Backend e database condiviso.
- Login e onboarding.
- Autorizzazioni lato server.
- Prenotazioni atomiche per evitare doppie assegnazioni.
- Inviti e notifiche reali.
- Mappe e coordinate reali delle strutture.
- Pagamenti e rimborsi reali.
- Privacy, gestione foto e dati personali.
- Sicurezza e validazione degli input.
- Gestione degli errori di rete e sincronizzazione.
- Accessibilità completa.
- Osservabilità, log e monitoraggio.

## 19. Stato finale della conversazione

L’ultima richiesta funzionale, **valutare anche i giocatori**, è stata implementata, testata e pubblicata nella versione 33; GitHub è stato aggiornato.

Non risultano richieste funzionali esplicite rimaste aperte. Le attività elencate sopra sono consolidamenti e sviluppi successivi, da distinguere dalle funzionalità già completate nel mockup.