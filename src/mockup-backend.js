import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const sb = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
const $ = (selector, root = document) => root.querySelector(selector);
const euro = cents => `€ ${(Number(cents || 0) / 100).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
const fmtDate = value => new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
const getGroup = game => Array.isArray(game.groups) ? game.groups[0] : game.groups;

let session = null;
let games = [];
let bookings = [];
let transactions = [];
let selectedGame = null;
let selectedPosition = null;
let pendingGame = null;
let paymentMethod = 'Satispay';
let authMode = 'login';
let busy = false;

function toast(message) {
  const node = $('#toast');
  if (!node) return;
  node.textContent = message;
  node.classList.add('show');
  setTimeout(() => node.classList.remove('show'), 3000);
}

function showError(error) {
  console.error(error);
  toast(error?.message || 'Non è stato possibile completare l’operazione. Riprova.');
}

function openScreen(id) {
  document.querySelectorAll('.screen').forEach(node => node.classList.toggle('active', node.id === id));
  document.querySelectorAll('.bottom button').forEach(node => node.classList.toggle('active', node.dataset.screen === id));
  const back = $('#back');
  if (back) back.hidden = id !== 'details';
  if (id === 'bookings') renderBookings();
  if (id === 'profile') renderAccount();
}

function mountAuth() {
  if ($('#accountPanel')) return;
  $('#profile').insertAdjacentHTML('afterbegin', `
    <section class="card form-card" id="accountPanel" aria-live="polite">
      <strong id="accountHeading">Accedi per prenotare</strong>
      <p id="accountHint" class="settings-note">Le prenotazioni e i pagamenti demo saranno registrati in modo sicuro nel database della piattaforma.</p>
      <form id="accountForm">
        <label id="accountNameWrap" hidden>Nome visualizzato<input id="accountName" autocomplete="name" /></label>
        <label>Email<input id="accountEmail" type="email" autocomplete="email" required /></label>
        <label>Password<input id="accountPassword" type="password" autocomplete="current-password" minlength="6" required /></label>
        <button class="cta" id="accountSubmit" type="submit">Accedi</button>
      </form>
      <button class="inline-action" id="accountMode" type="button">Crea un account</button>
      <button class="inline-action" id="accountLogout" type="button" hidden>Esci dall’account</button>
    </section>`);
  $('#accountMode').onclick = () => {
    authMode = authMode === 'login' ? 'signup' : 'login';
    $('#accountNameWrap').hidden = authMode !== 'signup';
    $('#accountName').required = authMode === 'signup';
    $('#accountHeading').textContent = authMode === 'signup' ? 'Crea il tuo account' : 'Accedi per prenotare';
    $('#accountSubmit').textContent = authMode === 'signup' ? 'Registrati' : 'Accedi';
    $('#accountMode').textContent = authMode === 'signup' ? 'Ho già un account' : 'Crea un account';
  };
  $('#accountForm').onsubmit = async event => {
    event.preventDefault();
    if (!sb || busy) return;
    busy = true;
    $('#accountSubmit').disabled = true;
    try {
      const email = $('#accountEmail').value.trim();
      const password = $('#accountPassword').value;
      const result = authMode === 'signup'
        ? await sb.auth.signUp({ email, password, options: { data: { display_name: $('#accountName').value.trim() } } })
        : await sb.auth.signInWithPassword({ email, password });
      if (result.error) throw result.error;
      if (authMode === 'signup' && !result.data.session) {
        toast('Account creato: conferma l’email e poi accedi.');
      } else {
        session = result.data.session;
        await loadData();
        toast('Accesso effettuato');
        if (pendingGame) openPayment(pendingGame);
      }
    } catch (error) { showError(error); }
    finally { busy = false; $('#accountSubmit').disabled = false; }
  };
  $('#accountLogout').onclick = async () => {
    if (!sb) return;
    const { error } = await sb.auth.signOut();
    if (error) showError(error);
    else { session = null; games = []; bookings = []; transactions = []; renderDataState(); renderAccount(); toast('Hai effettuato la disconnessione'); }
  };
}

function renderAccount() {
  const panel = $('#accountPanel');
  if (!panel) return;
  const signedIn = Boolean(session?.user);
  $('#accountHeading').textContent = signedIn ? `Account · ${session.user.email}` : 'Accedi per prenotare';
  $('#accountHint').textContent = signedIn
    ? 'Le partite, le iscrizioni e i pagamenti simulati sono sincronizzati con il database e con l’area amministrativa.'
    : 'Accedi o crea un account. La prenotazione e il pagamento demo verranno registrati nel database condiviso con gli amministratori.';
  $('#accountForm').hidden = signedIn;
  $('#accountMode').hidden = signedIn;
  $('#accountLogout').hidden = !signedIn;
  if (signedIn) {
    const name = session.user.user_metadata?.display_name;
    if (name) $('#profile h1').textContent = name;
  }
}

function renderDataState() {
  const container = $('#games');
  if (!container) return;
  if (!session?.user) {
    container.innerHTML = '<div class="info">Accedi dal Profilo per caricare le partite pubblicate nel database e prenotare.</div>';
    $('#viewLabel').textContent = 'Accesso richiesto per caricare le partite';
    return;
  }
  if (!games.length) {
    container.innerHTML = '<div class="info">Nessuna partita futura disponibile nel database. Riprova più tardi.</div>';
    $('#viewLabel').textContent = 'Nessuna partita pubblicata';
    return;
  }
  const today = new Date();
  container.innerHTML = games.map((game, index) => {
    const group = getGroup(game) || {};
    const date = new Date(game.starts_at);
    const day = date.toDateString() === today.toDateString() ? 'Oggi' : new Intl.DateTimeFormat('it-IT', { weekday: 'short', day: 'numeric', month: 'short' }).format(date);
    const time = new Intl.DateTimeFormat('it-IT', { hour: '2-digit', minute: '2-digit' }).format(date);
    const occupied = bookings.filter(row => row.game_id === game.id && ['pending', 'confirmed'].includes(row.status)).length;
    const free = Math.max(0, Number(game.court_spots || 0) + Number(game.rotation_spots || 0) - occupied);
    return `<button class="card game" data-live-game="${index}" data-date="${date.toDateString() === today.toDateString() ? 'stasera' : 'domani'}">
      <span class="icon-square">🏐</span><span><strong>${escapeHtml(day)} · ${escapeHtml(time)}</strong><small>${escapeHtml(game.venue)}</small><span class="group-name">${escapeHtml(group.name || 'Gruppo')}</span></span>
      <span><i class="spots">${free} ${free === 1 ? 'posto' : 'posti'}</i><em class="price">${euro(game.price_cents)}</em></span></button>`;
  }).join('');
  $('#viewLabel').textContent = `${games.length} ${games.length === 1 ? 'partita disponibile' : 'partite disponibili'} nel database`;
  container.querySelectorAll('[data-live-game]').forEach(card => {
    card.onclick = () => showGame(games[Number(card.dataset.liveGame)]);
  });
  document.querySelectorAll('.map-pin').forEach(pin => { pin.hidden = true; });
  document.querySelectorAll('.map-pin').forEach(pin => pin.onclick = null);
}

function showGame(game) {
  selectedGame = game;
  selectedPosition = null;
  const group = getGroup(game) || {};
  const date = new Date(game.starts_at);
  const end = new Date(date.getTime() + 2 * 60 * 60 * 1000);
  const timeFmt = value => new Intl.DateTimeFormat('it-IT', { hour: '2-digit', minute: '2-digit' }).format(value);
  $('#detailTitle').textContent = `${group.name || 'Partita'} · Pallavolo`;
  $('#detailTime').textContent = `${fmtDate(date)} · ${timeFmt(date)}–${timeFmt(end)}`;
  $('#detailPlace').textContent = `${game.venue} · ${group.city || ''}`;
  const occupied = bookings.filter(row => row.game_id === game.id && ['pending', 'confirmed'].includes(row.status)).length;
  const total = Number(game.court_spots || 0) + Number(game.rotation_spots || 0);
  $('#playersCount').textContent = `${occupied} / ${total} giocatori`;
  $('#positionPanel').innerHTML = `<strong>${game.approval_required ? 'Prenotazione con approvazione' : 'Posto disponibile'}</strong><p>${game.approval_required ? 'La quota si paga dopo la conferma della candidatura.' : 'La prenotazione e la quota demo vengono registrate insieme.'}</p>`;
  $('#reserveSummary').hidden = true;
  $('#playerRoster').innerHTML = Array.from({ length: Math.min(total, 12) }, (_, index) => `<span class="avatar ${index < occupied ? '' : 'empty'}" aria-hidden="true"></span>`).join('');
  const prior = bookings.find(row => row.game_id === game.id && ['pending', 'confirmed'].includes(row.status));
  const button = $('#book');
  button.textContent = prior ? (prior.status === 'pending' ? 'Candidatura inviata' : (prior.paid ? 'Posto confermato · pagato' : 'Completa pagamento demo')) : 'Prenota il tuo posto';
  button.disabled = prior?.status === 'pending' || Boolean(prior?.paid);
  button.style.background = prior ? '#12975b' : '';
  button.onclick = () => {
    if (!session?.user) { pendingGame = game; openScreen('profile'); toast('Accedi per salvare la prenotazione e il pagamento.'); return; }
    if (prior?.status === 'confirmed' && !prior.paid) { openPayment(game, prior.id); return; }
    if (prior) return;
    if (game.approval_required) bookPending(game);
    else openPayment(game);
  };
  openScreen('details');
}

function openPayment(game, bookingId = null) {
  pendingGame = game;
  if (!session?.user) { openScreen('profile'); toast('Accedi per salvare la prenotazione e il pagamento.'); return; }
  const fee = Math.round(Number(game.price_cents || 0) * 0.05);
  const overlay = document.createElement('div');
  overlay.className = 'demo-overlay';
  overlay.innerHTML = `<div class="invite-card" role="dialog" aria-modal="true" aria-labelledby="dbPaymentTitle">
    <button class="sheet-close" aria-label="Chiudi">×</button><span class="invite-kicker">PAGAMENTO SIMULATO</span><h2 id="dbPaymentTitle">Conferma la quota</h2>
    <p>Nessun pagamento reale verrà effettuato. La registrazione apparirà anche nel rendiconto amministrativo.</p>
    <div class="payment-methods"><button class="on" data-method="Satispay">Satispay</button><button data-method="PayPal">PayPal</button></div>
    <div class="payment-summary"><div>Quota partita <b>${euro(game.price_cents)}</b></div><div>Commissione piattaforma (5%) <b>${euro(fee)}</b></div><strong>Totale ${euro(Number(game.price_cents || 0) + fee)}</strong><small>La commissione non viene rimborsata.</small></div>
    <button class="cta" id="confirmDbPayment">Simula pagamento</button></div>`;
  document.body.append(overlay);
  paymentMethod = 'Satispay';
  overlay.querySelector('.sheet-close').onclick = () => overlay.remove();
  overlay.querySelectorAll('[data-method]').forEach(button => button.onclick = () => {
    paymentMethod = button.dataset.method;
    overlay.querySelectorAll('[data-method]').forEach(option => option.classList.toggle('on', option === button));
  });
  $('#confirmDbPayment', overlay).onclick = async () => {
    if (busy) return;
    busy = true;
    $('#confirmDbPayment', overlay).disabled = true;
    try {
      const result = bookingId
        ? await sb.rpc('record_game_payment', { p_booking: bookingId, p_method: paymentMethod })
        : await sb.rpc('book_game_paid', { p_game: game.id, p_method: paymentMethod });
      if (result.error) throw result.error;
      overlay.remove();
      await loadData();
      toast(`Pagamento demo ${paymentMethod} registrato nel database`);
      openScreen('bookings');
    } catch (error) { showError(error); $('#confirmDbPayment', overlay).disabled = false; }
    finally { busy = false; }
  };
}

async function bookPending(game) {
  if (busy) return;
  busy = true;
  try {
    const { error } = await sb.rpc('book_game', { p_game: game.id });
    if (error) throw error;
    await loadData();
    toast('Candidatura inviata. La quota si paga dopo la conferma.');
    openScreen('bookings');
  } catch (error) { showError(error); }
  finally { busy = false; }
}

function renderBookings() {
  const container = $('#bookingState');
  if (!container) return;
  if (!session?.user) {
    container.innerHTML = '<div class="info" style="text-align:center;padding:25px">Accedi dal Profilo per vedere le prenotazioni e i relativi movimenti salvati nel database.</div>';
    return;
  }
  if (!bookings.length) {
    container.innerHTML = '<p class="booking-section-label">In programma</p><div class="info" style="text-align:center;padding:24px 15px"><strong>Nessuna prenotazione in programma</strong><p>Esplora le partite per prenotare un posto.</p><button class="booking-action" id="findAgain">Trova una partita</button></div><p class="booking-section-label">Movimenti recenti</p>' + (transactions.length ? paymentHistory() : '<div class="info">Nessun pagamento registrato.</div>');
    $('#findAgain')?.addEventListener('click', () => openScreen('explore'));
    return;
  }
  const sorted = [...bookings].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  container.innerHTML = `<p class="booking-section-label">Prenotazioni</p>${sorted.map(booking => {
    const game = Array.isArray(booking.games) ? booking.games[0] : booking.games;
    const group = getGroup(game || {}) || {};
    const payment = transactions.find(row => row.booking_id === booking.id && row.event_type === 'charge');
    const refundable = game && new Date(game.starts_at).getTime() - Date.now() >= 24 * 60 * 60 * 1000;
    const refund = transactions.find(row => row.booking_id === booking.id && row.event_type === 'refund');
    return `<article class="card booking-item"><div class="booking-item-head"><span class="icon-square">🏐</span><div class="booking-item-copy"><strong>${escapeHtml(group.name || 'Partita')}</strong><small>${escapeHtml(game?.venue || '')} · ${game ? escapeHtml(fmtDate(game.starts_at)) : ''}</small></div><span class="booking-status ${booking.status === 'cancelled' || booking.status === 'rejected' ? 'past' : ''}">${booking.status === 'confirmed' ? 'Confermata' : booking.status === 'pending' ? 'In attesa' : booking.status === 'cancelled' ? 'Disdetta' : 'Rifiutata'}</span></div>
      ${payment ? `<div class="payment-summary"><div>Quota partita <b>${euro(payment.quota_cents)}</b></div><div>Commissione non rimborsabile <b>${euro(payment.fee_cents)}</b></div><div>Totale registrato <b>${euro(payment.total_cents)}</b></div><div>Metodo <b>${escapeHtml(payment.method)} · demo</b></div></div>` : '<p class="settings-note">Pagamento non ancora registrato.</p>'}
      ${refund ? `<div class="info"><strong>${refund.status === 'refunded' ? 'Rimborso simulato registrato' : 'Quota trattenuta'}</strong><div>Importo rimborsato <b>${euro(refund.total_cents)}</b></div><small>Commissione trattenuta: ${euro(payment?.fee_cents || refund.fee_cents)}</small></div>` : ''}
      ${booking.status === 'confirmed' && !payment ? `<button class="booking-action" data-pay-booking="${booking.id}">Completa il pagamento demo</button>` : ''}
      ${['pending', 'confirmed'].includes(booking.status) && game && new Date(game.starts_at) > new Date() ? `<button class="booking-action cancel" data-cancel-booking="${booking.id}" data-game="${game.id}" data-refundable="${refundable}" data-quota="${payment?.quota_cents || 0}" data-fee="${payment?.fee_cents || 0}">Disdici prenotazione</button>` : ''}</article>`;
  }).join('')}<p class="view-label">Almeno 24 ore prima viene rimborsata la sola quota; entro 24 ore la quota è trattenuta. La commissione non viene restituita.</p><p class="booking-section-label">Rendiconto dei tuoi movimenti</p>${paymentHistory()}`;
  container.querySelectorAll('[data-pay-booking]').forEach(button => button.onclick = () => {
    const booking = bookings.find(row => row.id === button.dataset.payBooking);
    const game = Array.isArray(booking?.games) ? booking.games[0] : booking?.games;
    if (booking && game) openPayment(game, booking.id);
  });
  container.querySelectorAll('[data-cancel-booking]').forEach(button => button.onclick = async () => {
    const refundable = button.dataset.refundable === 'true';
    const quota = Number(button.dataset.quota || 0);
    const fee = Number(button.dataset.fee || 0);
    const message = refundable
      ? `Ritiro oltre 24 ore: verrà registrato il rimborso simulato della quota (${euro(quota)}). La commissione (${euro(fee)}) resta trattenuta. Confermi?`
      : `Ritiro entro 24 ore: la quota (${euro(quota)}) e la commissione (${euro(fee)}) restano trattenute. Confermi?`;
    if (!window.confirm(message)) return;
    button.disabled = true;
    try {
      const { error } = await sb.rpc('cancel_booking', { p_game: button.dataset.game });
      if (error) throw error;
      await loadData();
      toast(refundable ? 'Rimborso simulato della quota registrato' : 'Disdetta registrata: quota trattenuta');
    } catch (error) { showError(error); button.disabled = false; }
  });
}

function paymentHistory() {
  if (!transactions.length) return '<div class="info">Nessun movimento registrato.</div>';
  return transactions.map(row => `<div class="info payment-history-row"><strong>${row.event_type === 'charge' ? 'Pagamento' : 'Rimborso / trattenuta'} · ${escapeHtml(row.method)}</strong><div>Quota ${euro(row.quota_cents)} · Commissione ${euro(row.fee_cents)} · Totale ${euro(row.total_cents)}</div><small>${escapeHtml(row.status)} · ${new Date(row.created_at).toLocaleString('it-IT')}</small></div>`).join('');
}

async function loadData() {
  if (!sb || !session?.user) { renderDataState(); renderBookings(); renderAccount(); return; }
  try {
    const [gameResult, bookingResult, paymentResult] = await Promise.all([
      sb.from('games').select('*, groups(name,city)').gte('starts_at', new Date().toISOString()).order('starts_at'),
      sb.from('bookings').select('*, games(id,starts_at,venue,price_cents,court_spots,rotation_spots,approval_required,groups(name,city))').eq('user_id', session.user.id).order('created_at', { ascending: false }),
      sb.from('payment_transactions').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
    ]);
    for (const result of [gameResult, bookingResult, paymentResult]) if (result.error) throw result.error;
    games = gameResult.data || [];
    bookings = bookingResult.data || [];
    transactions = paymentResult.data || [];
    renderDataState();
    renderBookings();
    renderAccount();
  } catch (error) { showError(error); }
}

mountAuth();
renderDataState();
renderBookings();
renderAccount();
document.querySelectorAll('.bottom button[data-screen]').forEach(button => {
  const id = button.dataset.screen;
  if (id === 'bookings' || id === 'profile') button.onclick = () => openScreen(id);
});
$('#back').onclick = () => openScreen('explore');
$('#book').onclick = () => {
  if (!selectedGame) { toast('Apri una partita disponibile dal database per prenotare.'); return; }
  if (!session?.user) { pendingGame = selectedGame; openScreen('profile'); toast('Accedi per salvare la prenotazione e il pagamento.'); return; }
  if (selectedGame.approval_required) bookPending(selectedGame); else openPayment(selectedGame);
};

if (!sb) {
  toast('Configurazione Supabase mancante: i pagamenti non sono attivi.');
  $('#games').innerHTML = '<div class="info">Database non configurato: le prenotazioni e i pagamenti sono disattivati.</div>';
  $('#viewLabel').textContent = 'Configurazione Supabase necessaria';
  $('#accountHeading').textContent = 'Database non configurato';
  $('#accountHint').textContent = 'Configura le variabili Supabase in Vercel per attivare prenotazioni e pagamenti sincronizzati.';
  $('#accountForm').hidden = true;
  $('#accountMode').hidden = true;
} else {
  sb.auth.getSession().then(({ data, error }) => {
    if (error) showError(error);
    session = data.session;
    loadData();
  });
  sb.auth.onAuthStateChange((_event, newSession) => {
    session = newSession;
    loadData();
  });
}
