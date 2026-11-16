import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, HelpCircle, X } from 'lucide-react';

const guides = {
  home: [
    ['Benvenuto su StaseraVolley', 'Qui trovi le partite future dei gruppi a cui puoi accedere. Gli orari e i posti disponibili arrivano dal database aggiornato in tempo reale.'],
    ['Apri una partita', 'Tocca una scheda per vedere palestra, data, quota, posti occupati e partecipanti. Se una partita richiede approvazione, la scheda lo segnala prima della candidatura.'],
    ['Esplora i gruppi', 'Apri un gruppo per leggere la descrizione, vedere i membri e consultare le serate in programma. Ogni fondatore gestisce il proprio gruppo.'],
    ['Crea un gruppo', 'Dal pulsante Crea puoi fondare un gruppo, indicare città e palestra e poi programmare una o più partite settimanali.'],
  ],
  create: [
    ['Crea un gruppo amatoriale', 'Scegli un nome riconoscibile, la città e una descrizione utile a chi vuole unirsi. Puoi specificare palestra e disponibilità per tornei.'],
    ['Diventi amministratore del gruppo', 'Il tuo account viene registrato come amministratore del gruppo appena creato. Potrai programmare partite e gestire le candidature dei partecipanti.'],
    ['Programma le serate', 'Dopo la creazione apri il gruppo e usa “Programma una partita”. Imposta data, ora, quota, numero di posti ed eventuale approvazione.'],
  ],
  group: [
    ['Pagina del gruppo', 'Qui trovi località, descrizione, palestra e membri. Se hai un ruolo amministrativo, puoi pianificare nuove serate.'],
    ['Partite del gruppo', 'Apri ogni serata per vedere i posti liberi e le iscrizioni. I dati vengono letti dal database condiviso, non dalla memoria del browser.'],
    ['Amministratori e membri', 'Gli amministratori possono approvare candidature e registrare pagamenti manuali. I partecipanti vedono solo i dati consentiti dalle regole di accesso.'],
  ],
  newgame: [
    ['Data e ripetizione', 'Scegli la prima data e l’ora. Se attivi la ripetizione, vengono create le serate settimanali per il numero di settimane indicato.'],
    ['Quota e posti', 'Inserisci quota, posti in campo e posti a rotazione. La capienza viene ricontrollata dal database quando ogni persona prenota.'],
    ['Approvazione', 'Senza approvazione il posto viene confermato e il pagamento demo registrato insieme alla prenotazione. Con approvazione si invia prima una candidatura, senza addebito.'],
  ],
  game: [
    ['Dettagli e disponibilità', 'Controlla luogo, orario, quota e capienza. I posti riservati includono le candidature in attesa, così non vengono accettate più persone dei posti disponibili.'],
    ['Prenotazione e pagamento', 'Le prenotazioni dirette aprono il riepilogo Satispay o PayPal simulato. Per le partite con approvazione, invii la candidatura e paghi soltanto dopo che è stata confermata.'],
    ['Quota e commissione', 'La simulazione registra quota, commissione del 5% e metodo nel database. Non viene eseguito alcun pagamento reale.'],
    ['Ritiro e rimborso', 'Puoi disdire la prenotazione. Se mancano almeno 24 ore viene registrato il rimborso della sola quota; entro 24 ore la quota resta trattenuta. La commissione non viene restituita.'],
    ['Partecipanti', 'Gli amministratori del gruppo gestiscono le candidature, mentre i partecipanti confermati possono invitare altri giocatori. L’invito non blocca un posto.'],
  ],
  invite: [
    ['Cerca un giocatore', 'Filtra i profili visibili usando nome, città o ruolo. La ricerca mostra soltanto gli utenti che hanno scelto di essere individuabili.'],
    ['Invia l’invito', 'L’invito avvisa il destinatario ma non prenota al suo posto. Deve aprire la partita e completare personalmente la prenotazione.'],
  ],
  player: [
    ['Scheda giocatore', 'La scheda raccoglie nome, ruolo, esperienza e città condivisi nel profilo. Le informazioni visibili rispettano le impostazioni di privacy.'],
    ['Gruppi e disponibilità', 'Puoi vedere i gruppi associati e se la persona accetta proposte da società sportive.'],
  ],
  profile: [
    ['Completa il profilo', 'Aggiungi nome, località, ruolo, esperienza e una breve presentazione. Puoi scegliere se apparire nelle ricerche e se ricevere proposte da società.'],
    ['Foto profilo', 'Tocca l’immagine per caricare una foto. La foto inviata resta in attesa di approvazione; da qui puoi anche rimuovere la foto esistente.'],
    ['Privacy', 'Disattivando la visibilità non comparirai nelle ricerche di giocatori. I dati di partecipazione restano disponibili agli amministratori della partita secondo le regole del database.'],
    ['Salva le modifiche', 'Premi Salva profilo per aggiornare i dati nel database. Se qualcosa non viene salvato, l’app mostra l’errore restituito dal servizio.'],
  ],
  activity: [
    ['Prenotazioni e candidature', 'Questa pagina raccoglie le tue partecipazioni attive e le richieste in attesa. Apri una riga per tornare ai dettagli della partita.'],
    ['Inviti ricevuti', 'Gli inviti alle partite appaiono qui. Accettare un invito non iscrive automaticamente: dovrai prenotare se ci sono posti disponibili.'],
  ],
  settings: [
    ['Tema chiaro, scuro o automatico', 'Scegli il tema preferito. Automatico segue l’impostazione di aspetto del dispositivo; la scelta viene salvata localmente.'],
    ['Installa l’app', 'Usa le istruzioni in questa pagina per aggiungere StaseraVolley alla schermata Home e riaprirla come app.'],
    ['Moderazione foto', 'Se sei amministratore della piattaforma, da qui puoi esaminare le foto in attesa e approvarle o rifiutarle.'],
    ['Area amministratori', 'I proprietari autorizzati vedono il collegamento al pannello globale per gestire tutte le partite, iscrizioni e rendiconti dei pagamenti.'],
    ['Account', 'Qui vedi l’email con cui hai effettuato l’accesso e puoi uscire dall’account.'],
  ],
};

export function TourButton({ onClick }) {
  return <button className="icon-btn help-button" aria-label="Guida di questa pagina" title="Guida di questa pagina" onClick={onClick}><HelpCircle size={20}/></button>;
}

export function Tutorial({ open, onClose, view }) {
  const steps = guides[view] || guides.home;
  const [index, setIndex] = useState(0);
  useEffect(() => setIndex(0), [view, open]);
  if (!open) return null;
  const [title, body] = steps[index];
  return <div className="tour-backdrop" role="dialog" aria-modal="true" aria-labelledby="tour-title">
    <section className="tour-card"><button className="tour-close" onClick={onClose} aria-label="Chiudi guida"><X size={19}/></button>
      <span className="tour-label">GUIDA · {view === 'home' ? 'INIZIO' : view.toUpperCase()}</span>
      <div className="tour-progress"><span style={{ width: `${((index+1)/steps.length)*100}%` }}/></div>
      <small>Passaggio {index+1} di {steps.length}</small>
      <h2 id="tour-title">{title}</h2><p>{body}</p>
      <div className="tour-actions"><button className="outline" onClick={onClose}>Chiudi guida</button><div>{index>0&&<button className="tour-nav secondary" onClick={()=>setIndex(index-1)}><ArrowLeft size={16}/> Indietro</button>}<button className="primary tour-nav" onClick={()=>index+1<steps.length?setIndex(index+1):onClose()}>{index+1===steps.length?'Fine':'Avanti'} {index+1<steps.length&&<ArrowRight size={16}/>}</button></div></div>
    </section>
  </div>;
}
