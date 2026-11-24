# StaseraVolley V005

Prototipo di pallavolo amatoriale con campo Arena 3D interattivo, serate, gruppi, prenotazioni, richieste, chat, profilo e rendiconto demo. Il sito è pubblicato su https://stasera-pallavolo.vercel.app/ e protetto da Vercel Authentication.

## Avvio locale

Esegui `npm start` e apri http://127.0.0.1:4197/. Il selettore Personaggio demo si trova nella barra superiore. In Profilo puoi creare un account locale, accedere, uscire o eliminare un account creato nella demo.

I dati sono salvati nel browser. Pagamenti, rimborsi, ruoli e messaggi sono simulati. Il supporto salva una bozza locale. Le mappe esterne si abilitano dalle preferenze Privacy. Il rendiconto locale si apre dalle Impostazioni con il personaggio Amministratore Demo.

## Test

Esegui `npm test` per i test del modello. Le prove `tests/*-browser.mjs` richiedono Playwright ed Edge.

Il branch main contiene la V005 alla radice. I sorgenti precedenti, inclusa l'app Supabase, sono consultabili nella cronologia Git. Questa copia contiene il pannello amministrativo demo della V005.
