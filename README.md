# StaseraVolley — beta integrata

Questa versione unisce il mockup StaseraVolley all’app React/Vite della beta. L’interfaccia del mockup in `/` carica partite, iscrizioni, pagamenti e rimborsi da Supabase dopo l’accesso; anche l’area amministrativa (`/admin.html`) legge gli stessi movimenti. I pagamenti Satispay/PayPal sono simulati, ma vengono registrati una sola volta nel database condiviso. È inclusa una dashboard amministrativa multi pagina con permessi verificati dal database.

## Requisiti

- Node.js 20 o successivo
- Un progetto Supabase con Email/Password abilitato
- URL Supabase e chiave publishable/anon

## Configurazione database

Nel SQL Editor di Supabase esegui i file nell’ordine indicato:

1. `supabase/schema.sql`
2. `supabase/avatars.sql`
3. `supabase/merge-mockup-migration.sql`
4. `supabase/admin-management.sql`
5. `supabase/20261117-live-mockup.sql`

Se il database della beta è già operativo, esegui soltanto il quinto file: aggiunge conteggio dei posti, pubblicazione atomica delle serate ricorrenti, feedback e valutazioni. Non rieseguire lo schema iniziale sul database esistente. I dati e gli amministratori attuali restano validi.

Crea poi il tuo account dalla schermata Profilo. In fondo a `merge-mockup-migration.sql` trovi il comando commentato per assegnare il primo amministratore: sostituisci l’indirizzo con l’email del tuo account ed eseguilo una volta nel SQL Editor. Dopo `admin-management.sql`, gli amministratori esistenti possono abilitare o revocare altri account già registrati dalla scheda Amministratori. Il vecchio PIN demo non è usato.

## Avvio locale

1. Copia `.env.example` in `.env`.
2. Imposta `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` con i valori del progetto.
3. Esegui `npm install` e `npm run dev`.
4. Apri l’indirizzo locale di Vite. L’app è su `/` e il pannello admin su `/admin.html`.

Non inserire la chiave `service_role` nel frontend. Per il deploy configura le stesse due variabili come variabili di build dell’hosting e pubblica il contenuto generato da `npm run build`.

## Funzioni incluse

- Guida dettagliata contestuale al punto interrogativo di ogni schermata.
- Tema chiaro, scuro e automatico; app installabile come PWA.
- Registrazione, profilo, caricamento foto con approvazione, gruppi, partite ricorrenti, inviti e candidatura con approvazione.
- Prenotazione atomica con controllo dei posti lato database.
- Pagamento Satispay/PayPal simulato, commissione demo del 5%, registrazione dei movimenti e gestione admin.
- Prenotazioni, pagamenti e rimborsi sono visibili sia nell’app sia nel pannello admin perché entrambi leggono le stesse tabelle Supabase.
- Disdetta almeno 24 ore prima: rimborso simulato della sola quota. Entro 24 ore la quota è trattenuta. La commissione non viene rimborsata.
- Dashboard admin per vedere tutte le partite, le iscrizioni e il rendiconto dei pagamenti; può modificare partite, confermare/rifiutare/ritirare iscrizioni e registrare un pagamento manuale.
- Gruppi e serate ricorrenti con riepilogo delle date e festivi esclusi; inviti a utenti reali disponibili.
- Feedback inviati agli amministratori e valutazioni delle partite concluse, con un voto aggiornabile per partecipante e partita.
- App a schermo intero con la grafica del mockup aggiornato, senza cornice o selettore di telefono.

## Limiti

Satispay e PayPal non inviano pagamenti reali e il rimborso non restituisce denaro: il database registra soltanto la simulazione. Prima di usare la piattaforma con quote reali servono provider, server e procedure di rimborso effettive. La dashboard non usa segreti nel browser; le azioni admin passano da RPC con controllo del ruolo.

La home (/) apre l'app completa e responsive; non mostra una cornice da smartphone. /app.html reindirizza alla home.
