import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import { ArrowLeft, CalendarDays, Check, Clock3, CreditCard, HelpCircle, LogOut, RefreshCw, Search, ShieldCheck, Users, Volleyball, X, UserPlus, UserMinus } from 'lucide-react';
import './style.css';
import './admin.css';
import { AdminPhotos } from './admin-photos.jsx';
import './pwa.js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
const sb = url && key ? createClient(url, key) : null;
const euro = (cents = 0) => (Number(cents) / 100).toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });
const date = (value) => value ? new Date(value).toLocaleString('it-IT', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

function Admin() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('games');
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [adminEmail, setAdminEmail] = useState('');
  const [feedback,setFeedback] = useState([]);

  const load = useCallback(async () => {
    if (!sb) return;
    const { data: result, error } = await sb.rpc('admin_overview');
    if (error) { setData(null); setMessage(error.message); return; }
    setData(result);
    setMessage('');
    const adminsResult = await sb.rpc('admin_list_platform_admins');
    if (!adminsResult.error) setAdmins(adminsResult.data || []);
    const notes=await sb.from('feedback').select('*,profiles(display_name)').order('created_at',{ascending:false});
    if(!notes.error)setFeedback(notes.data||[]);
  }, []);

  useEffect(() => {
    if (!sb) return undefined;
    sb.auth.getSession().then(({ data: result }) => setSession(result.session));
    const { data: { subscription } } = sb.auth.onAuthStateChange((_, next) => setSession(next));
    return () => subscription.unsubscribe();
  }, []);
  useEffect(() => { if (session) load(); }, [session, load]);

  async function signIn(event) {
    event.preventDefault(); setBusy(true); setMessage('');
    const { data: result, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) setMessage(error.message);
    else setSession(result.session);
    setBusy(false);
  }

  async function run(action, success) {
    setBusy(true); setMessage('');
    try { await action(); await load(); setMessage(success); }
    catch (error) { setMessage(error.message || 'Operazione non riuscita'); }
    finally { setBusy(false); }
  }

  async function setBookingStatus(id, status) {
    await run(async () => {
      const { error } = await sb.rpc('admin_set_booking_status', { p_booking: id, p_status: status });
      if (error) throw error;
    }, 'Iscrizione aggiornata.');
  }

  async function togglePaid(booking) {
    await run(async () => {
      const { error } = await sb.rpc('mark_paid', { p_booking: booking.id, p_paid: !booking.paid });
      if (error) throw error;
    }, 'Pagamento aggiornato.');
  }

  async function saveGame(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const starts = new Date(`${form.get('date')}T${form.get('time')}`).toISOString();
    await run(async () => {
      const { error } = await sb.rpc('admin_set_game', {
        p_game: editing.id, p_starts_at: starts, p_venue: String(form.get('venue')),
        p_price_cents: Math.round(Number(form.get('price')) * 100),
        p_court_spots: Number(form.get('court')), p_rotation_spots: Number(form.get('rotation')),
      });
      if (error) throw error;
      setEditing(null);
    }, 'Partita aggiornata.');
  }

  async function changeAdmin(event, action, targetEmail) {
    event?.preventDefault();
    const emailToChange = targetEmail || adminEmail.trim();
    if (!emailToChange) return;
    await run(async () => {
      const { error } = await sb.rpc('admin_set_platform_admin', { p_email: emailToChange, p_enabled: action === 'add' });
      if (error) throw error;
      setAdminEmail('');
      const { data: rows, error: listError } = await sb.rpc('admin_list_platform_admins');
      if (listError) throw listError;
      setAdmins(rows || []);
    }, action === 'add' ? 'Amministratore autorizzato.' : 'Permesso amministrativo revocato.');
  }

  const games = data?.games || [];
  const bookings = data?.bookings || [];
  const payments = data?.payments || [];
  const filter = (value) => String(value || '').toLocaleLowerCase('it-IT').includes(query.toLocaleLowerCase('it-IT'));
  const visibleGames = useMemo(() => games.filter(g => filter(`${g.group_name} ${g.city} ${g.venue}`)), [games, query]);
  const visibleBookings = useMemo(() => bookings.filter(b => filter(`${b.display_name} ${b.email} ${b.group_name} ${b.status}`)), [bookings, query]);
  const visiblePayments = useMemo(() => payments.filter(p => filter(`${p.display_name} ${p.email} ${p.group_name} ${p.method} ${p.status} ${p.event_type}`)), [payments, query]);

  if (!sb) return <main className="wrap"><section className="panel"><h1>Configura Supabase</h1><p>Imposta VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY per aprire l’area amministrativa.</p></section></main>;
  if (!session) return <main className="wrap admin-wrap"><section className="panel admin-login"><div className="admin-mark"><ShieldCheck size={24}/></div><h1>Area amministratori</h1><p className="muted">Accedi con il tuo account StaseraVolley. Il database verifica i permessi admin.</p><form onSubmit={signIn}><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required/></label><button className="primary" disabled={busy}>Accedi</button></form>{message&&<p className="admin-message error">{message}</p>}<a className="back" href="/">← Torna all’app</a></section></main>;

  if (!data) return <main className="wrap admin-wrap"><section className="panel"><h1>Verifica accesso amministrativo</h1><p>{message || 'Caricamento dati…'}</p><button className="outline" onClick={() => sb.auth.signOut()}>Esci</button></section></main>;

  const stats = data.stats || {};
  return <main className="admin-wrap">
    <header className="admin-header"><div className="brand"><span className="admin-mark"><Volleyball size={22}/></span><span>Stasera<b>Volley</b><small>Area amministrativa</small></span></div><div className="admin-actions"><button className="icon-btn" title="Guida di questa pagina" aria-label="Guida di questa pagina" onClick={()=>setHelpOpen(true)}><HelpCircle size={19}/></button><button className="small" onClick={load} disabled={busy}><RefreshCw size={15}/> Aggiorna</button><button className="icon-btn" title="Esci" onClick={() => sb.auth.signOut()}><LogOut size={18}/></button></div></header>
    <section className="admin-hero"><div><span className="admin-eyebrow">CONTROLLO PIATTAFORMA</span><h1>Panoramica</h1><p>Partite, iscrizioni e rendiconti collegati al database.</p></div><span className="admin-live"><i/> Dati Supabase</span></section>
    {message && <div className="admin-message">{message}</div>}
    <section className="admin-stats">
      <article><CalendarDays/><small>Partite future</small><strong>{stats.games || 0}</strong></article>
      <article><Users/><small>Iscrizioni attive</small><strong>{stats.bookings || 0}</strong></article>
      <article><CreditCard/><small>Pagamenti simulati</small><strong>{euro(stats.gross)}</strong></article>
      <article><ShieldCheck/><small>Commissioni registrate</small><strong>{euro(stats.fees)}</strong></article>
      <article><RefreshCw/><small>Rimborsi simulati</small><strong>{euro(stats.refunds)}</strong></article>
    </section>
    <section className="panel admin-panel">
      <div className="admin-toolbar"><div className="admin-tabs">{[['games','Partite'],['bookings','Iscrizioni'],['payments','Pagamenti'],['admins','Amministratori']].map(([id,label])=><button key={id} className={tab===id?'selected':''} onClick={()=>setTab(id)}>{label}<span>{id==='games'?games.length:id==='bookings'?bookings.length:id==='payments'?payments.length:admins.length}</span></button>)}</div>{tab!=='admins'&&<label className="admin-search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Cerca giocatore, partita…"/></label>}</div>
      {tab==='games'&&<div className="admin-table-wrap"><table><thead><tr><th>Partita / gruppo</th><th>Data e luogo</th><th>Iscritti</th><th>Quota</th><th></th></tr></thead><tbody>{visibleGames.map(g=><tr key={g.id}><td><strong>{g.group_name}</strong><small>{g.city}</small></td><td>{date(g.starts_at)}<small>{g.venue}</small></td><td>{g.confirmed_count} confermati · {g.pending_count} in attesa</td><td>{euro(g.price_cents)}</td><td><button className="tiny" onClick={()=>setEditing(g)}>Modifica</button></td></tr>)}</tbody></table>{!visibleGames.length&&<p className="empty">Nessuna partita trovata.</p>}</div>}
      {tab==='bookings'&&<div className="admin-table-wrap"><table><thead><tr><th>Giocatore</th><th>Partita</th><th>Stato</th><th>Pagamento</th><th>Gestione</th></tr></thead><tbody>{visibleBookings.map(b=><tr key={b.id}><td><strong>{b.display_name||'Giocatore'}</strong><small>{b.email}</small></td><td>{b.group_name}<small>{date(b.game_date)} · {b.game_venue}</small></td><td><span className={`admin-state ${b.status}`}>{b.status}</span></td><td>{b.paid?'Registrato':'Da saldare'}</td><td className="admin-row-actions">{b.status==='pending'&&<><button className="tiny" onClick={()=>setBookingStatus(b.id,'confirmed')} disabled={busy}><Check size={14}/> Conferma</button><button className="tiny danger" onClick={()=>setBookingStatus(b.id,'rejected')} disabled={busy}><X size={14}/> Rifiuta</button></>}{b.status==='confirmed'&&<><button className="tiny" onClick={()=>togglePaid(b)} disabled={busy}>{b.paid?'Annulla registrazione':'Segna pagato'}</button><button className="tiny danger" onClick={()=>setBookingStatus(b.id,'cancelled')} disabled={busy}>Ritira</button></>}{b.status==='cancelled'&&<button className="tiny" onClick={()=>setBookingStatus(b.id,'confirmed')} disabled={busy}>Ripristina</button>}</td></tr>)}</tbody></table>{!visibleBookings.length&&<p className="empty">Nessuna iscrizione trovata.</p>}</div>}
      {tab==='payments'&&<div className="admin-table-wrap"><table><thead><tr><th>Data</th><th>Giocatore / partita</th><th>Operazione</th><th>Metodo</th><th>Quota</th><th>Commissione</th><th>Totale</th><th>Esito</th></tr></thead><tbody>{visiblePayments.map(p=><tr key={p.id}><td>{date(p.created_at)}</td><td><strong>{p.display_name}</strong><small>{p.email} · {p.group_name}</small></td><td>{p.event_type==='charge'?'Pagamento':'Rimborso / ritiro'}</td><td>{p.method}</td><td>{euro(p.quota_cents)}</td><td>{euro(p.fee_cents)}</td><td>{euro(p.total_cents)}</td><td><span className={`admin-state ${p.status}`}>{p.status}</span></td></tr>)}</tbody></table>{!visiblePayments.length&&<p className="empty">Nessuna operazione trovata.</p>}</div>}
      {tab==='admins'&&<div className="admin-table-wrap admin-managers"><p className="muted">Autorizza un indirizzo già registrato a Supabase. Il nuovo amministratore potrà gestire partite, iscrizioni, pagamenti e altri amministratori.</p><form className="admin-add-form" onSubmit={e=>changeAdmin(e,'add')}><label htmlFor="admin-email">Email dell’amministratore</label><input id="admin-email" type="email" value={adminEmail} onChange={e=>setAdminEmail(e.target.value)} placeholder="nome@esempio.it" required/><button className="primary" disabled={busy}><UserPlus size={16}/> Autorizza email</button></form><h3>Amministratori autorizzati</h3><table><thead><tr><th>Email</th><th>Gestione</th></tr></thead><tbody>{admins.map(a=><tr key={a.user_id}><td><strong>{a.email}</strong>{a.user_id===session.user.id&&<small>Il tuo account</small>}</td><td><button className="tiny danger" disabled={busy||a.user_id===session.user.id} title={a.user_id===session.user.id?'Non puoi revocare il tuo stesso accesso qui':''} onClick={()=>changeAdmin(null,'remove',a.email)}><UserMinus size={14}/> Revoca accesso</button></td></tr>)}</tbody></table>{admins.length===0&&<p className="empty">Nessun amministratore trovato.</p>}<p className="admin-footnote">Per evitare di perdere l’accesso, non puoi revocare il tuo stesso account da questa schermata.</p></div>}
    </section>
    <p className="admin-footnote"><Clock3 size={14}/> Pagamenti e rimborsi sono simulati e registrati nel database. La commissione non viene restituita; oltre 24 ore viene rimborsata solo la quota, entro 24 ore la quota è trattenuta. Rimborso reale non attivo.</p>
    <AdminPhotos sb={sb}/>
    <section className="panel"><h2>Feedback ricevuti ({feedback.length})</h2>{feedback.map(f=><article key={f.id}><strong>{f.profiles?.display_name||'Giocatore'} · {f.area}</strong><p>{f.message}</p><small>{date(f.created_at)}</small></article>)}</section>
    <a className="back" href="/">← Torna all’app</a>
    {helpOpen&&<div className="admin-modal-backdrop" role="dialog" aria-modal="true"><section className="panel admin-edit admin-guide"><button className="close-edit" onClick={()=>setHelpOpen(false)} aria-label="Chiudi guida"><X/></button><span className="admin-eyebrow">GUIDA · {tab==='games'?'PARTITE':tab==='bookings'?'ISCRIZIONI':'PAGAMENTI'}</span><h2>{tab==='games'?'Gestione partite':tab==='bookings'?'Gestione iscrizioni':'Rendiconto pagamenti'}</h2>{tab==='games'?<><p>Consulta le serate di tutti i gruppi e il numero di giocatori confermati o in attesa. Premi “Modifica” per cambiare data, ora, palestra, quota e capienza. Usa la ricerca per filtrare per gruppo, città o luogo.</p><p>Le modifiche vengono salvate nel database e diventano subito disponibili nell’app.</p></>:tab==='bookings'?<><p>Le candidature in attesa possono essere confermate o rifiutate. Un’iscrizione confermata può essere ritirata o ripristinata. Il pulsante “Segna pagato” registra un pagamento manuale nel registro della quota.</p><p>Quando ritiri un iscritto pagato, il database applica la regola delle 24 ore e crea la relativa riga di rimborso o trattenuta. La commissione non viene restituita.</p></>:<><p>Ogni riga è un movimento salvato in Supabase: quota, commissione, totale, metodo e stato. Satispay e PayPal sono etichette della simulazione; non viene effettuato un incasso reale.</p><p>Il totale commissioni include quelle registrate sui pagamenti, che non vengono rimborsate. I rimborsi oltre le 24 ore riguardano soltanto la quota.</p></>}<button className="primary" onClick={()=>setHelpOpen(false)}>Ho capito</button></section></div>}
    {editing&&<div className="admin-modal-backdrop"><section className="panel admin-edit"><button className="close-edit" onClick={()=>setEditing(null)} aria-label="Chiudi"><X/></button><h2>Modifica partita</h2><p className="muted">{editing.group_name} · {editing.city}</p><form onSubmit={saveGame}><label>Data<input name="date" type="date" defaultValue={new Date(editing.starts_at).toISOString().slice(0,10)} required/></label><label>Ora<input name="time" type="time" defaultValue={new Date(editing.starts_at).toTimeString().slice(0,5)} required/></label><label>Palestra<input name="venue" defaultValue={editing.venue} required/></label><label>Quota (€)<input name="price" type="number" min="0" step="0.01" defaultValue={(editing.price_cents/100).toFixed(2)} required/></label><label>Posti in campo<input name="court" type="number" min="2" max="24" defaultValue={editing.court_spots}/></label><label>Posti a rotazione<input name="rotation" type="number" min="0" max="12" defaultValue={editing.rotation_spots}/></label><button className="primary" disabled={busy}>Salva modifiche</button></form></section></div>}
  </main>;
}

createRoot(document.getElementById('admin-root')).render(<Admin/>);
