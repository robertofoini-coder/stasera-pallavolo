# StaseraVolley — MVP 0.2

Web app mobile-first React/Vite + Supabase, primo codice sorgente per test pilota. Non ancora pubblicata. Lingua italiana.

## Avvio locale

1. Installa Node.js 20 o superiore.
2. Crea un nuovo progetto su https://supabase.com.
3. Apri **SQL Editor** e incolla l'intero file `supabase/schema.sql`. Eseguilo una sola volta su un progetto vuoto.
4. In **Authentication → Providers → Email**, abilita l'accesso email. Durante il test scegli consapevolmente se richiedere conferma email; in produzione abilitala.
5. Copia `.env.example` in `.env` e sostituisci `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` con URL e chiave **publishable/anon** dal progetto Supabase. Non inserire mai la chiave `service_role` nel frontend.
6. Esegui `npm install`, quindi `npm run dev`.
7. Apri l'indirizzo locale mostrato da Vite. Per test tra dispositivi pubblica la web app con un host HTTPS e configura gli URL autorizzati in Supabase Authentication.
8. Registrati, crea un gruppo chiamato **VOLTAREN**, località **Costa di Mezzate**, palestra **Palestra comunale di Costa di Mezzate**, quota 5 €, 12 posti in campo, 0 o 2 posti a rotazione, programmazione settimanale al giovedì. L'ora effettiva non è stata specificata: impostala con gli organizzatori.

## Funzionalità presenti

- Registrazione e login email/password (Supabase Auth)
- Profilo giocatore: ruolo, esperienza, città, presentazione, visibilità e disponibilità per società
- Creazione gruppi da qualsiasi account, fondatore amministratore
- Gruppi con storia, palestra e disponibilità tornei
- Creazione partite singole o settimanali (serie di date), prezzo libero, posti e rotazione, approvazione facoltativa
- Prenotazioni atomiche tramite funzioni SQL con lock su partita per impedire overbooking
- Candidature, approvazione/rifiuto da amministratore, cancellazione fino a 12 ore per confermati
- Elenco giocatori, scheda giocatore, inviti tra utenti e schermata attività
- Registrazione manuale pagamento da parte dell'amministratore
- Realtime su partite, prenotazioni e inviti (secondo permessi)

## Limiti intenzionali di questa prima iterazione

- **Non sono inclusi Satispay, split, abbonamenti o incassi effettivi.** Il prezzo della partita è un dato informativo e `paid` è un segno manuale.
- La UI utilizza una rappresentazione schematica dei posti, non una disposizione regolamentare dei giocatori. I posti a rotazione sono conteggiati ma non rappresentati con pallini separati.
- La gestione dell'approvazione a meno di 12 ore è temporaneamente bloccata: occorre sviluppare accettazione esplicita del giocatore prima di confermare una candidatura tardiva.
- La lista d'attesa, i ruoli di amministratore aggiuntivi, il trasferimento di proprietà, la modifica delle partite, il controllo delle collisioni tra orari e le notifiche push/email automatiche non sono ancora implementati.
- Non esistono ancora upload immagini, fotografie palestra, rating verificati, profili enti, profili società verificati o valutazioni tecniche.
- Le schermate non sono state sottoposte a test sistematici multiutente; il codice è uno **starter MVP**, non un prodotto production-ready.
- La privacy e la moderazione richiedono ulteriori controlli: policy di visibilità, blocco utenti, gestione richieste GDPR, retention, termini d'uso, procedure per segnalazioni, protezione minori (test pilota consigliato solo 18+).
- I nomi dei giocatori sono leggibili dagli iscritti confermati alla stessa partita e dagli amministratori; la visibilità dei profili pubblici dipende da `discoverable`. Va definita e verificata l'informativa.
- I gruppi non possono ancora aggiungere autonomamente altri membri permanenti (gli inviti attuali sono per le singole partite).

## Sicurezza e verifiche prima del pilot

1. Testare SQL/RLS con almeno 3 account distinti (amministratore, iscritto, estraneo).
2. Simulare prenotazioni contemporanee sull'ultimo posto, cancellazioni vicino alla scadenza e tentativi di approvazione non autorizzati.
3. Configurare protezioni antispam e limiti alle richieste di invito.
4. Completare privacy policy, termini di servizio e informativa sulla palestra, con revisione professionale.
5. Decidere la politica per partite annullate, quote già versate e giocatori assenti.
6. Aggiungere monitoraggio errori, backup e un ambiente di test separato.

## Note di architettura

Frontend SPA Vite/React. Database PostgreSQL gestito da Supabase. RLS attivo su tutte le tabelle. Le mutazioni sensibili (`book_game`, `cancel_booking`, `decide_booking`, `mark_paid`, `invite_player`) sono funzioni SQL `security definer` con controlli espliciti. Nessuna chiave privata deve raggiungere il browser.

## Prossimo sprint

1. Test end-to-end e correzioni UX con 3 account.
2. Gestione membri gruppo, inviti e lista d'attesa.
3. Palestra condivisa tra gruppi, fotografie autorizzate, servizi e segnalazioni.
4. Notifiche email reali e accettazione delle candidature tardive.
5. Distribuzione su HTTPS con dominio di test.


## App installabile (PWA), tema scuro, impostazioni

- Banner "Scarica l'app" in cima a tutte le schermate (chiudibile; sparisce se l'app è già installata) con due pulsanti, Android e iPhone, che aprono la guida all'installazione. Su Android, se il browser lo consente, compare il pulsante "Installa ora".
- Menu **Impostazioni** (ingranaggio in alto a destra): tema Chiaro / Scuro / Automatico, scorciatoia per scaricare l'app, account e logout. Il tema è salvato sul dispositivo.
- `public/manifest.webmanifest`, `public/icons/`, `public/sw.js` (service worker minimo; Supabase non viene mai messo in cache, attivo solo in produzione), `src/pwa.js`, `src/extras.jsx`.
- Dopo modifiche importanti a `sw.js`, incrementa `CACHE`.

## iPhone: barra superiore
- La barra con il logo è fissa in alto e tiene conto di notch/Dynamic Island (`env(safe-area-inset-*)`), perché la web app installata usa la status bar traslucida.
- Se l'icona era già stata aggiunta alla Home, va rimossa e riaggiunta per applicare le nuove impostazioni.
