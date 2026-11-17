# StaseraSiGioca — riepilogo tecnico e piano operativo

> Stato: pre-sviluppo / pilot MVP  
> Ultimo aggiornamento: 17 novembre 2026  
> Nota sul nome: nel materiale disponibile compare il brand **StaseraVolley**; l'utente indica il progetto come **StaseraSiGioca**. Prima del rilascio confermare quale dei due sarà il nome pubblico definitivo.

## 1. Obiettivo del prodotto

Realizzare una web app mobile-first per trovare e prenotare posti in partite di pallavolo vicine, con un primo pilot ristretto a 30–40 utenti.

Il prodotto deve consentire a un giocatore di:

- scoprire partite per zona, data e orario;
- consultare il dettaglio della partita e la sua posizione;
- prenotare un posto disponibile con conferma immediata;
- gestire disponibilità e prenotazioni;
- avere un profilo con livello, ruolo, caratteristiche e reputazione;
- vedere/lasciare valutazioni secondo regole che saranno definite.

Nel primo rilascio **non sono previsti pagamenti in-app**. Il prezzo eventuale della partita può essere mostrato come informazione, ma non viene incassato né elaborato dalla piattaforma.

## 2. Mockup e direzione UX

Il riferimento visivo corrente mostra tre schermate mobili:

1. **Esplora**: selettore della località, commutatore lista/mappa, elenco di partite con data/ora, palestra, posti rimasti e quota indicativa.
2. **Dettaglio partita**: tipo/livello della partita, orario, palestra e mappa, stato dei giocatori (`9 / 12`), CTA di prenotazione e conferma immediata.
3. **Profilo**: avatar, nome, livello, ruolo, skill, disponibilità serale e affidabilità con distribuzione delle valutazioni.

Stile desiderato: mobile-first, moderno e sportivo, palette blu/elettrico con accento corallo per la CTA, superfici chiare e card arrotondate.

Asset di riferimento esistenti nel precedente workspace:

- `staseravolley-mockup-v1.png`
- `Glossy Volleyball App Icon.png`
- `Minimalist White Volleyball Icon.png`

Prima di sviluppare, copiare gli asset necessari in questo repository e verificare licenza/origine delle immagini utilizzate.

## 3. Perimetro MVP pilot

### Funzionalità incluse

| Area | Funzionalità |
|---|---|
| Account | Registrazione/accesso via email, reset password, profilo utente. |
| Profilo | Nome, foto, città/zona, livello, ruolo preferito, skill e disponibilità. |
| Partite | Creazione e modifica per utenti autorizzati/organizzatori; data, orario, luogo, capienza, livello, quota solo informativa. |
| Scoperta | Lista filtrabile per zona e data; ordinamento per prossimità/tempo; vista mappa. |
| Prenotazioni | Prenota, annulla, capienza aggiornata in modo atomico, lista partecipanti e conferma immediata. |
| Affidabilità | Modello dati per rating e no-show; UI e regole finali da confermare. |
| Notifiche | Email essenziali: conferma prenotazione, annullamento e reset password. |
| Amministrazione | Funzioni minime per moderare utenti/partite e intervenire sui dati del pilot. |
| Sicurezza | Autorizzazione lato database tramite Row Level Security (RLS), nessuna chiave amministrativa esposta al browser. |

### Fuori perimetro MVP

- pagamenti, wallet, rimborsi e commissioni;
- app native iOS/Android (la web app può essere installabile come PWA);
- mappe offline e pre-download di aree;
- chat in tempo reale tra giocatori;
- integrazione con calendari, WhatsApp/SMS o notifiche push;
- marketplace di palestre e gestione contrattuale delle strutture;
- analytics/marketing e advertising;
- scalabilità enterprise, SLA e multi-regione.

## 4. Decisioni tecniche già prese

| Tema | Decisione | Implicazione |
|---|---|---|
| Sviluppo | Realizzato con Codex, senza fornitore esterno. | Servono revisione umana, test e decisioni di prodotto puntuali. |
| Hosting | Hosting/Vercel già pagato. | Non inserire un nuovo costo di hosting nel pilot; verificare account/progetto prima del deploy. |
| Backend | Supabase Free per il pilot. | Idoneo a 30–40 tester; piano Free con 500 MB DB, 1 GB storage, 5 GB egress e sospensione dopo 7 giorni di inattività. |
| Mappe | Stack gratuito: Leaflet + OpenStreetMap. | Mostrare attribuzione; no prefetch/offline; geocoding con cache, ricerca esplicita e senza autocomplete pubblico. |
| Pagamenti | Rimandati a una fase successiva. | Nessun provider Stripe/PayPal né trattamento PCI nel MVP. |
| Pubblico | Pilot chiuso con 30–40 persone. | Accesso su invito/allowlist e raccolta feedback diretta. |
| Collaborazione | Da definire per il progetto locale Codex. | La condivisione dei file/codice non avviene dal workspace locale: usare repository Git privato quando si coinvolgono sviluppatori. |

### Regole per OpenStreetMap/Nominatim

- Inserire sempre l'attribuzione visibile `© OpenStreetMap contributors`.
- Le tile devono essere richieste solo quando un utente visualizza la mappa, rispettando la cache HTTP.
- Non fare scraping, pre-caricamenti o download offline.
- La geocodifica pubblica Nominatim è limitata a una richiesta al secondo complessiva; risultati cache-ati lato applicazione.
- Non implementare autocomplete con l'endpoint pubblico Nominatim.
- Rendere configurabile il provider di tile/geocoding con variabili ambiente, così da poter sostituire il provider al crescere del traffico.

## 5. Architettura proposta

```text
Browser / PWA
  └─ Next.js (TypeScript, mobile-first UI)
       ├─ Leaflet + OpenStreetMap (mappa)
       ├─ API/server actions (logica applicativa)
       └─ Supabase client con sessione utente

Supabase
  ├─ Auth (email/password o magic link, da confermare)
  ├─ PostgreSQL (dati operativi)
  ├─ Row Level Security (autorizzazione)
  ├─ Storage (avatar, se abilitati)
  └─ Edge Functions / funzioni server per operazioni privilegiate, se necessarie

Vercel / hosting esistente
  ├─ deploy dell'app Next.js
  ├─ variabili ambiente
  └─ dominio e HTTPS esistenti
```

### Stack consigliato

- Next.js + TypeScript + React;
- Tailwind CSS e componenti accessibili;
- Supabase: Auth, PostgreSQL, Storage, RLS;
- Leaflet + OpenStreetMap;
- Zod per validazione server/client;
- test: Vitest per logica e Playwright per i flussi critici;
- email: provider gratuito compatibile con il volume pilot, da selezionare in fase di setup.

## 6. Modello dati iniziale

| Entità | Campi/relazioni essenziali |
|---|---|
| `profiles` | `id` (riferimento a auth user), nome, avatar, zona, livello, ruolo, skill, bio, disponibilità, stato/moderazione. |
| `venues` | nome, indirizzo, città, latitudine, longitudine, note di accesso. |
| `matches` | organizzatore, venue, data/ora inizio/fine, tipo, livello, capienza, posti disponibili derivati, quota informativa, stato. |
| `bookings` | partita, utente, stato (`confirmed`, `cancelled`, eventuale `waitlist`), timestamp e metadati di cancellazione. |
| `ratings` | autore, destinatario, partita, voto, commento opzionale, stato moderazione. |
| `reports` | segnalante, oggetto, categoria, note, stato e moderatore. |
| `audit_log` | eventi amministrativi e modifiche rilevanti, se necessario. |

### Invariante critica: prenotazioni

La prenotazione deve avvenire tramite operazione atomica lato database: verificare capienza, creare la prenotazione e aggiornare il conteggio nello stesso contesto transazionale. Non affidarsi esclusivamente al numero mostrato nel client, per evitare overbooking da richieste simultanee.

## 7. Ruoli e autorizzazioni da impostare

| Ruolo | Permessi minimi |
|---|---|
| Visitatore | Consultazione limitata secondo scelta di prodotto; nessun dato personale non necessario. |
| Giocatore | Gestisce il proprio profilo e le proprie prenotazioni; consulta partite disponibili. |
| Organizzatore | Crea e modifica solo le proprie partite; consulta partecipanti delle proprie partite. |
| Admin | Modera, gestisce utenti/partite/segnalazioni; accesso riservato. |

Le policy RLS devono verificare proprietario e ruolo sul database. Ogni endpoint server deve ripetere la verifica dell'autorizzazione, soprattutto per azioni admin e prenotazioni.

## 8. Privacy e sicurezza

- Trattare posizione, profilo e reputazione come dati personali.
- Pubblicare privacy policy e termini d'uso prima di invitare utenti esterni al pilot; chiarire titolare, finalità, conservazione, contatto e diritti.
- Non aggiungere analytics o pixel marketing nel pilot, salvo consenso cookie conforme.
- Se vengono impiegati solo cookie tecnici strettamente necessari alla sessione, evitare banner invasivi; predisporre comunque cookie policy.
- Non includere segreti nel repository: usare `.env.local` in sviluppo e variabili ambiente del provider di hosting in produzione.
- Configurare URL di redirect Auth per sviluppo, staging e dominio pilot.
- Stabilire procedura di backup/export manuale durante il piano Supabase Free e controllare che il progetto resti attivo.

## 9. Istruzioni operative per Codex

1. Prima di modificare il codice, leggere questo documento e le istruzioni del repository (`AGENTS.md`, se presente).
2. Non inventare regole business mancanti: elencarle come decisioni richieste e implementare solo i default approvati.
3. Usare TypeScript rigoroso, componenti accessibili e design mobile-first coerente con il mockup.
4. Non introdurre dipendenze a pagamento o servizi esterni senza approvazione esplicita.
5. Tenere separati dati demo, configurazione e dati reali; non committare mai chiavi API, password, URL service-role Supabase o dati utente.
6. Implementare RLS e testarla con più utenti simulati prima di ogni rilascio.
7. Per la mappa rispettare le regole OSM/Nominatim indicate nella sezione 4; mantenere i provider sostituibili tramite variabili ambiente.
8. Per ogni funzione di prenotazione, verificare concorrenza, capienza, annullamento e idempotenza.
9. Eseguire lint, type-check e test pertinenti prima di dichiarare completata una modifica.
10. Mantenere aggiornati README, schema/migrazioni database e questo brief quando vengono prese decisioni sostanziali.

## 10. Attività ancora da completare

### Decisioni di prodotto — bloccanti

- [ ] Confermare nome pubblico e dominio: `StaseraSiGioca` oppure `StaseraVolley`.
- [ ] Definire chi può creare una partita: tutti gli utenti, solo organizzatori approvati o solo admin nel pilot.
- [ ] Definire regole di annullamento, ritardo/no-show e lista d'attesa.
- [ ] Decidere se il prezzo è sempre informativo e come avviene il pagamento esterno tra partecipanti.
- [ ] Definire quando una recensione può essere lasciata e se è bilaterale.
- [ ] Definire visibilità di nome, immagine, livello e posizione degli utenti.
- [ ] Decidere autenticazione: password, magic link, Google/Apple, oppure solo invito email.
- [ ] Stabilire la città/zona iniziale del pilot e le palestre/partite seed.
- [ ] Identificare owner operativo, moderatore e canale di supporto per i tester.

### Setup tecnico

- [ ] Inizializzare repository Git privato e definire i collaboratori.
- [ ] Copiare/organizzare asset e definire licenze.
- [ ] Creare progetto Supabase Free e configurare Auth, database, storage e RLS.
- [ ] Creare app Next.js e pipeline di qualità (lint, type-check, test).
- [ ] Collegare l'hosting/Vercel già pagato e configurare variabili ambiente.
- [ ] Implementare mappa Leaflet/OSM conforme alle policy e cache geocoding.
- [ ] Predisporre staging separato, se supportato dall'hosting/account.
- [ ] Configurare un provider email per il pilot.
- [ ] Predisporre log di errori e una checklist di release.

### Realizzazione e validazione

- [ ] Tradurre le tre schermate mockup in componenti e pagine responsive.
- [ ] Realizzare i flussi account, profilo, ricerca, dettaglio, creazione e prenotazione.
- [ ] Implementare area admin minima.
- [ ] Inserire dati demo realistici e testare il flusso con account diversi.
- [ ] Testare prenotazioni concorrenti e autorizzazioni RLS.
- [ ] Verificare accessibilità, browser mobile e performance su rete mobile.
- [ ] Redigere privacy policy, termini e istruzioni pilot; farle verificare dalla società/consulente legale.
- [ ] Invitare i 30–40 tester, raccogliere feedback e stabilire metriche di successo.

## 11. Budget e soglie di evoluzione

### Pilot

| Voce | Piano |
|---|---|
| Sviluppo | Codex; costo di fornitore esterno non previsto. |
| Codex | Costo già sostenuto se l'abbonamento è attivo; considerare crediti aggiuntivi solo oltre quota. |
| Hosting | Già pagato. |
| Supabase | Free, costo zero. |
| Mappe | Leaflet + OSM, costo zero entro i limiti/policy. |
| Email | Piano gratuito o quota pilota, da confermare. |

### Dopo il pilot

Passare a Supabase Pro (da $25/mese secondo listino corrente) quando il servizio viene aperto stabilmente al pubblico, i dati diventano importanti o servono backup/assistenza maggiori. Riesaminare anche provider mappe, email, monitoraggio, privacy e budget di manutenzione.

## 12. Collaborazione

Il progetto locale Codex non ha un tasto di condivisione diretto. Per collaborare:

- usare un repository Git privato per codice e asset;
- invitare le due persone con privilegi minimi necessari;
- usare issue/board o pull request per decisioni e revisioni;
- se si desidera condividere brief e conversazioni in ChatGPT, creare un progetto ChatGPT separato e invitare i membri da lì; non confonderlo con il workspace locale Codex.

