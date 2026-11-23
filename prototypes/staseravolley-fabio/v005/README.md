# V005 — Proposta di nuova esperienza

Prototipo grafico e di navigazione costruito sulle 22 risposte del team: A,B,C,A,A,C,A,B,A,A,A,A,B,A,B,A,A,A,B,B,A,C.

## Direzione scelta

Priorità: trovare una serata. Apertura sulle serate, stile pulito e accogliente, ricerca compatta, quattro voci inferiori (Home, Serate, Gruppi, Profilo), messaggi in alto. Schede compatte e ordine temporale. Campo con fotografie come protagonista del dettaglio; scelta del posto soltanto dopo Partecipa. Adesione al gruppo guidata prima della prenotazione. Home con pagamento da completare; notifiche separate dai messaggi. I miei gruppi separati dalla directory; presentazione e regole nel cartellino. Pannello organizzatore trasversale ai gruppi.

## Interazioni implementate nella prova

- Navigazione Home/Serate/Gruppi/Profilo, notifiche, messaggi, pannello organizzatore.
- Tre serate future relative al giorno di apertura, ricerca manuale per città, filtro Oggi/Settimana.
- Cartellino del gruppo e percorso ingresso → approvazione locale → prenotazione.
- Simulazione esplicita del ruolo organizzatore per accettare/rifiutare l'adesione.
- Campo con numeri regolamentari: sopra 1–6–5 / 2–3–4, sotto 4–3–2 / 5–6–1, rete al centro.
- 11 giocatori demo e un posto selezionabile, popup senza selezione, focus sul pulsante di conferma.
- Conferma, promemoria quota, pagamento PayPal/Satispay simulato e cancellazione locale.
- Foto demo locali e storage autonomo `staseravolley-v005-design-demo-v1`.

## Limiti espliciti

Questa V005 è una proposta da valutare, non il porting completo della V004. Il prototipo precedente rimane disponibile e invariato. Nessun backend, account, richiesta o pagamento reale. I dati non si sincronizzano tra dispositivi. Il pannello organizzatore simula un ruolo, non applica autorizzazioni sicure.

La mappa apre ricerche della città su Google Maps: nessun indirizzo o distanza inventati. La geolocalizzazione richiede il permesso ma non calcola ancora distanze. Filtri avanzati, messaggistica, modifica profilo, gestione completa di gruppi e serate, traduzioni e temi della V004 devono ancora essere integrati dopo la revisione della proposta. Le due riserve sono un riepilogo dimostrativo, non selezionabile in questo scenario. La cancellazione rimuove lo stato demo e non simula rimborsi o un rendiconto. Il prezzo del pagamento è la quota illustrativa senza commissioni.

## Test eseguiti

Sintassi JavaScript verificata con `node --check app.js`. Edge headless: percorso richiesta ingresso, approvazione, selezione obbligatoria, prenotazione, pagamento e disdetta superato; navigazione e assenza di overflow nelle quattro schermate principali alle larghezze 320, 390, 820 e 1440. Nessuna eccezione JavaScript negli scenari eseguiti. Rapporto `checks.json`. Nessuna prova su dispositivi fisici o di accessibilità completa.

## Pubblicazione

Sorgenti: `prototypes/staseravolley-fabio/v005/` sul branch Html del repository Roberto. Percorso pubblico previsto: `/mockup/v005/`. Le versioni precedenti non vengono sostituite. HTML, CSS e JavaScript senza framework o dipendenze aggiunte.

## Aggiornamento Pulse

La V005 mantiene i percorsi e lo storage esistenti e adotta lo stile Pulse: header e navigazione color inchiostro, accenti lime, schede con data laterale, loghi demo dei gruppi e icone SVG coerenti per ricerca, posizione, filtri, mappa, messaggi, notifiche, gestione, navigazione e freccia indietro. Pulsanti principali lime, campo verde tattico e posizione selezionata evidenziata. Focus da tastiera e preferenza di movimento ridotto rispettati. Nessuna delle funzionalità incomplete elencate sopra viene presentata come integrata da questo aggiornamento grafico.
