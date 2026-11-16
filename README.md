# StaseraVolley — beta integrata

Questa versione unisce il mockup StaseraVolley all’app React/Vite della beta. Le pagine per giocatori usano Supabase Auth e PostgreSQL: gruppi, partite, iscrizioni, profili e foto non sono salvati soltanto nel browser. È inclusa una dashboard amministrativa multi pagina (`/admin.html`) con permessi verificati dal database.

## Requisiti

- Node.js 20 o successivo
- Un progetto Supabase con Email/Password abilitato
- URL Supabase e chiave publishable/anon

## Configurazione database

Nel SQL Editor di Supabase esegui i file nell’ordine indicato:

1. `supabase/schema.sql`
2. `supabase/avatars.sql`
3. `supabase/merge-mockup-migration.sql`

Crea poi il tuo account amministratore dalla schermata di registrazione. In fondo a `merge-mockup-migration.sql` trovi il comando commentato: sostituisci l’indirizzo con l’email del tuo account ed eseguilo una volta nel SQL Editor. L’area admin si apre con l’accesso normale dell’app; la funzione SQL nega i dati agli account non autorizzati. Il vecchio PIN demo non è usato.

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
- Disdetta almeno 24 ore prima: rimborso simulato della sola quota. Entro 24 ore la quota è trattenuta. La commissione non viene rimborsata.
- Dashboard admin per vedere tutte le partite, le iscrizioni e il rendiconto dei pagamenti; può modificare partite, confermare/rifiutare/ritirare iscrizioni e registrare un pagamento manuale.

## Limiti

Satispay e PayPal non inviano pagamenti reali e il rimborso non restituisce denaro: il database registra soltanto la simulazione. Prima di usare la piattaforma con quote reali servono provider, server e procedure di rimborso effettive. La dashboard non usa segreti nel browser; le azioni admin passano da RPC con controllo del ruolo.
