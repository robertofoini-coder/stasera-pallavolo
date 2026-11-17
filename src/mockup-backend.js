import { createClient } from '@supabase/supabase-js';
import { mountShell } from './app-shell.js';
import './pwa.js';
mountShell();

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const sb = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
const $ = (selector, root = document) => root.querySelector(selector);
const euro = cents => `€ ${(Number(cents || 0) / 100).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
const fmtDate = value => new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
const getGroup = game => Array.isArray(game.groups) ? game.groups[0] : game.groups;
const seatLabel=slot=>Number(slot)>12?`Riserva ${Number(slot)-12}`:`Squadra ${Number(slot)<=6?'A':'B'} · posizione ${[1,6,5,2,3,4][(Number(slot)-1)%6]}`;

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
let ownProfile = null, groups = [], members = [], profiles = [], invitations = [], feedbacks = [], ratings = [];
let gameStats = [], activeGroupId = null, ratingGame = null;
let dateFilter = 'all', exactDate = '', cityFilter = '';
let refreshSequence = 0;

function toast(message) {
  const node = $('#toast');
  if (!node) return;
  ($('#toastText') || node).textContent = message;
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
  if (id === 'groups') renderGroups();
  if (id === 'feedback') renderFeedbacks();
  if (id === 'notifications') renderInvitations();
  if (id === 'editProfile') fillProfileForm();
  if (back) back.hidden = ['explore','bookings','profile','groups','feedback'].includes(id);
  window.scrollTo({top:0,behavior:'instant'});
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
    else { clearAccountData(); toast('Hai effettuato la disconnessione'); }
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
    renderProfile();
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
  const filtered = games.filter(game => {
    const group = getGroup(game) || {};
    const query = $('#exploreSearch').value.toLocaleLowerCase('it-IT');
    const date = new Date(game.starts_at);
    const day = localDateKey(date), nowDay = localDateKey(today);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate()+1);
    const week = new Date(today); week.setDate(week.getDate()+7);
    return (!cityFilter || group.city === cityFilter) && `${group.name} ${game.venue}`.toLocaleLowerCase('it-IT').includes(query)
      && (!exactDate || day === exactDate)
      && (exactDate || dateFilter === 'all' || (dateFilter === 'stasera' && day === nowDay) || (dateFilter === 'domani' && day === localDateKey(tomorrow)) || (dateFilter === 'settimana' && date <= week));
  });
  container.innerHTML = filtered.map(game => {
    const index = games.indexOf(game);
    const group = getGroup(game) || {};
    const date = new Date(game.starts_at);
    const day = date.toDateString() === today.toDateString() ? 'Oggi' : new Intl.DateTimeFormat('it-IT', { weekday: 'short', day: 'numeric', month: 'short' }).format(date);
    const time = new Intl.DateTimeFormat('it-IT', { hour: '2-digit', minute: '2-digit' }).format(date);
    const occupied = occupiedCount(game.id);
    const free = Math.max(0, Number(game.court_spots || 0) + Number(game.rotation_spots || 0) - occupied);
    return `<button class="card game" data-live-game="${index}" data-date="${date.toDateString() === today.toDateString() ? 'stasera' : 'domani'}">
      <span class="icon-square">🏐</span><span><strong>${escapeHtml(day)} · ${escapeHtml(time)}</strong><small>${escapeHtml(game.venue)}</small><span class="group-name">${escapeHtml(group.name || 'Gruppo')}</span></span>
      <span><i class="spots">${free} ${free === 1 ? 'posto' : 'posti'}</i><em class="price">${euro(game.price_cents)}</em></span></button>`;
  }).join('');
  if (!filtered.length) container.innerHTML='<div class="info">Nessuna partita corrisponde ai filtri selezionati.</div>';
  $('#viewLabel').textContent = `${filtered.length} ${filtered.length === 1 ? 'partita disponibile' : 'partite disponibili'}`;
  container.querySelectorAll('[data-live-game]').forEach(card => {
    card.onclick = () => showGame(games[Number(card.dataset.liveGame)]);
  });
  document.querySelectorAll('.map-pin').forEach(pin => { pin.hidden = true; });
  document.querySelectorAll('.map-pin').forEach(pin => pin.onclick = null);
  $('#nearbyMap').innerHTML = '<div class="map-results"><strong>Apri il luogo della partita sulla mappa</strong>'+filtered.map(game=>`<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(game.venue+' '+(getGroup(game)?.city||''))}" target="_blank" rel="noopener noreferrer">${escapeHtml(game.venue)} · ${escapeHtml(getGroup(game)?.city||'')}</a>`).join('')+'</div>';
}

function showGame(game) {
  if(selectedGame?.id!==game.id||!$('#details').classList.contains('active')) selectedPosition=null;
  selectedGame = game;
  const group = getGroup(game) || {};
  const date = new Date(game.starts_at);
  const end = new Date(date.getTime() + 2 * 60 * 60 * 1000);
  const timeFmt = value => new Intl.DateTimeFormat('it-IT', { hour: '2-digit', minute: '2-digit' }).format(value);
  $('#detailTitle').textContent = group.name || 'Partita di pallavolo';
  $('#detailTime').textContent = `${timeFmt(date)} – ${timeFmt(end)}`;
  let dateLabel=$('#detailDate');
  if(!dateLabel){$('#detailTitle').insertAdjacentHTML('afterend','<p class="detail-date" id="detailDate"></p>');dateLabel=$('#detailDate');}
  dateLabel.textContent=new Intl.DateTimeFormat('it-IT',{weekday:'long',day:'numeric',month:'long'}).format(date);
  $('#detailPlace').textContent = `${game.venue} · ${group.city || ''}`;
  const occupied = occupiedCount(game.id);
  const total = Number(game.court_spots || 0) + Number(game.rotation_spots || 0);
  $('#playersCount').textContent = `Giocatori già prenotati: ${occupied}`;
  $('#courtLabel').textContent = `Il numero dei posti disponibili è: ${Math.max(0,total-occupied)}`;
  const positions=[1,6,5,2,3,4],fieldCount=Math.min(12,Number(game.court_spots)),occupiedField=Math.min(fieldCount,occupied);
  $('#courtFloor').innerHTML = Array.from({length:fieldCount},(_,index)=>`<span class="court-player ${index<6?'p':'q'}${index%6+1}${index>=6?' opponent':''} ${index<occupiedField?'occupied':'open'}" role="img" aria-label="Posizione ${positions[index%6]}: ${index<occupiedField?'occupata':'libera'}">${positions[index%6]}</span>`).join('')+'<i class="court-net" aria-hidden="true"></i>';
  $('#court').classList.toggle('has-reserves',Number(game.rotation_spots)>0);
  $('#reserveRoster').hidden = !game.rotation_spots;
  $('#reserveRoster').innerHTML=Array.from({length:Number(game.rotation_spots)||0},(_,index)=>`<span class="avatar ${index<Math.max(0,occupied-fieldCount)?'':'empty'}" aria-label="Posto a rotazione ${index+1}"></span>`).join('');
  const confirmation = $('#details .confirmation');
  if(confirmation) confirmation.textContent=game.approval_required?'Conferma richiesta all’organizzatore':'✓ Conferma immediata';
  $('#positionPanel').innerHTML = `<strong>${game.approval_required ? 'Prenotazione con approvazione' : 'Posto disponibile'}</strong><p>${game.approval_required ? 'La quota si paga dopo la conferma della candidatura.' : 'La prenotazione e la quota demo vengono registrate insieme.'}</p>`;
  $('#reserveSummary').hidden = !game.rotation_spots;
  $('#reserveSummary').textContent=`${game.rotation_spots||0} posti a rotazione`;
  $('#playerRoster').innerHTML = Array.from({ length: Math.min(occupiedField,12) }, () => '<span class="player-avatar" aria-label="Giocatore prenotato"></span>').join('') || '<small class="roster-empty">Nessun giocatore ancora prenotato.</small>';
  const prior = bookings.find(row => row.game_id === game.id && ['pending', 'confirmed'].includes(row.status));
  const button = $('#book');
  button.textContent = prior ? (prior.status === 'pending' ? 'Candidatura inviata' : (prior.paid ? 'Posto confermato · pagato' : 'Completa pagamento demo')) : 'Prenota il tuo posto';
  button.disabled = prior?.status === 'pending' || Boolean(prior?.paid) || (!prior && occupied>=total);
  if(!prior && occupied>=total) button.textContent='Partita completa';
  button.style.background = prior ? '#12975b' : '';
  button.onclick = () => {
    if (!session?.user) { pendingGame = game; openScreen('profile'); toast('Accedi per salvare la prenotazione e il pagamento.'); return; }
    if (prior?.status === 'confirmed' && !prior.paid) { openPayment(game, prior.id); return; }
    if (prior) return;
    openPayment(game);
  };
  openScreen('details');
  loadCourtSeats(game,prior);
  loadGamePlayers(game.id);
}

let seatRequest=0;
async function loadCourtSeats(game,prior){
 const request=++seatRequest;
 $('#book').disabled=true;
 $('#book').textContent='Caricamento posti…';
 const {data,error}=await sb.rpc('app_seat_map',{p_game:game.id});
 if(request!==seatRequest||selectedGame?.id!==game.id||!$('#details').classList.contains('active'))return;
 if(error){$('#book').textContent='Selezione posti da attivare';$('#courtLabel').textContent='Aggiornamento database necessario per scegliere il posto';return;}
 const seats=data||[],own=seats.find(s=>s.is_mine),capacity=Number(game.court_spots)+Number(game.rotation_spots);
 const occupied=new Set(seats.map(s=>Number(s.slot))),numbers=[1,6,5,2,3,4];
 if(own)selectedPosition=Number(own.slot);
 else if(occupied.has(selectedPosition))selectedPosition=null;
 // Every free seat is explicitly chosen, exactly as in the final mockup.
 const render=()=>{
  const field=Math.min(12,Number(game.court_spots));
  const seat=(slot,cls,label)=>{const taken=occupied.has(slot),mine=own?.slot===slot,chosen=selectedPosition===slot;return `<button type="button" class="court-player ${cls} ${taken?'occupied':'open selectable'}${chosen?' chosen':''}${mine?' your-position':''}" data-seat="${slot}" ${taken||prior?'disabled':''} aria-pressed="${chosen}" aria-label="${label}${mine?' · Il tuo posto':taken?' · Occupato':' · Libero'}">${slot<=field?numbers[(slot-1)%6]:'R'}</button>`;};
  $('#courtFloor').innerHTML=Array.from({length:field},(_,i)=>seat(i+1,`${i<6?'p':'q'}${i%6+1}${i>=6?' opponent':''}`,`Squadra ${i<6?'A':'B'}, posizione ${numbers[i%6]}`)).join('')+'<i class="court-net" aria-hidden="true"></i>'+Array.from({length:capacity-field},(_,i)=>seat(field+i+1,`reserve reserve-${i%2?'b':'a'}`,`Riserva ${i+1}`)).join('');
  $('#court').classList.toggle('has-reserves',capacity>field);
  $('#courtFloor').querySelectorAll('[data-seat]:not(:disabled)').forEach(b=>b.onclick=()=>{selectedPosition=Number(b.dataset.seat);render();});
  $('#courtLabel').textContent=`Il numero dei posti disponibili è: ${capacity-seats.length}`;
  $('#playersCount').textContent=`Giocatori già prenotati: ${seats.length}`;
  const button=$('#book');button.disabled=prior?.status==='pending'||!!prior?.paid||(!prior&&!selectedPosition);
  button.textContent=prior?(prior.status==='pending'?'Candidatura inviata':prior.paid?'✓ Posto confermato':'Completa pagamento demo'):selectedPosition?'Prenota il tuo posto':capacity<=seats.length?'Partita completa':'Seleziona un posto sul campo';
  if(!prior&&capacity<=seats.length)button.disabled=true;
 };
 render();
}

async function loadGamePlayers(gameId){
  const {data,error}=await sb.rpc('app_game_roster',{p_game:gameId});
  if(selectedGame?.id!==gameId||!$('#details').classList.contains('active'))return;
  const people=error?[]:[...(data||[])];
  const mine=bookings.find(b=>b.game_id===gameId&&['pending','confirmed'].includes(b.status));
  if(mine&&!people.some(p=>p.user_id===session?.user.id))people.push({...ownProfile,user_id:session.user.id,display_name:ownProfile?.display_name||session.user.user_metadata?.display_name||'Il tuo profilo',slot:mine.court_slot,status:mine.status});
  if(!people.length){$('#playerRoster').innerHTML='<small class="roster-empty">Nessun profilo pubblico disponibile.</small>';return;}
  $('#playerRoster').innerHTML=people.map(p=>{
    const isMe=p.user_id===session?.user.id,name=p.display_name?.trim()||(isMe?ownProfile?.display_name||'Il tuo profilo':'Giocatore');
    const image=p.avatar_status==='approved'&&p.avatar_path?sb.storage.from('avatars').getPublicUrl(p.avatar_path).data.publicUrl:null;
    return `<button class="roster-person${isMe?' is-me':''}" type="button" data-profile-id="${p.user_id}" aria-label="${escapeHtml(name)}${isMe?' · Tu':''}"><span class="player-avatar${image?' has-photo':''}">${image?`<img src="${escapeHtml(image)}" alt="">`:''}</span><span class="roster-name">${escapeHtml(name)}</span><small>${isMe?'Tu · ':''}${p.status==='pending'?'In attesa':p.slot?escapeHtml(seatLabel(p.slot)):'Confermato'}</small></button>`;
  }).join('');
  $('#playerRoster').querySelectorAll('[data-profile-id]').forEach(button=>button.onclick=()=>{
    const player=people.find(p=>p.user_id===button.dataset.profileId),name=player?.display_name||'Giocatore';
    $('#playerCard').innerHTML=`<article class="card player-page"><div class="player-avatar-large" aria-hidden="true"></div><span class="invite-kicker">SCHEDA GIOCATORE</span><h1>${escapeHtml(name)}</h1><p>${escapeHtml(player?.role||'Giocatore')} · ${escapeHtml(player?.experience||'Pallavolo amatoriale')}</p>${player?.bio?`<p>${escapeHtml(player.bio)}</p>`:''}</article>`;openScreen('playerCard');
  });
}

function openPayment(game, bookingId = null) {
  const needsApproval=game.approval_required&&!bookingId;
  const slot=selectedPosition;
  if(!bookingId&&!slot){toast('Seleziona un posto sul campo');return;}
  pendingGame = game;
  if (!session?.user) { openScreen('profile'); toast('Accedi per salvare la prenotazione e il pagamento.'); return; }
  const fee = Math.round(Number(game.price_cents || 0) * 0.05);
  const overlay = document.createElement('div');
  overlay.className = 'demo-overlay';
  overlay.innerHTML = `<div class="invite-card" role="dialog" aria-modal="true" aria-labelledby="dbPaymentTitle">
    <button class="sheet-close" aria-label="Chiudi">×</button><span class="invite-kicker">${needsApproval?'CANDIDATURA E QUOTA':'PAGAMENTO SIMULATO'}</span><h2 id="dbPaymentTitle">${needsApproval?'Riepilogo prenotazione':'Conferma la quota'}</h2>
    <p>Nessun pagamento reale verrà effettuato. La registrazione apparirà anche nel rendiconto amministrativo.</p>
    ${needsApproval?'<p class="approval-payment-note">Questa partita richiede approvazione: ora invii la candidatura. Il pagamento simulato sarà registrato solo dopo la conferma dell’organizzatore.</p>':''}
    ${slot?`<p class="selected-seat-summary">${escapeHtml(seatLabel(slot))}</p>`:''}
    <div class="payment-methods"><button class="on" data-method="Satispay">Satispay</button><button data-method="PayPal">PayPal</button></div>
    <div class="payment-summary"><div>Quota partita <b>${euro(game.price_cents)}</b></div><div>Commissione piattaforma (5%) <b>${euro(fee)}</b></div><strong>Totale ${euro(Number(game.price_cents || 0) + fee)}</strong><small>La commissione non viene rimborsata.</small></div>
    <button class="cta" id="confirmDbPayment">${needsApproval?'Invia candidatura':'Simula pagamento'}</button></div>`;
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
        : await sb.rpc('app_book_seat', { p_game: game.id, p_slot: slot, p_method: paymentMethod });
      if (result.error) throw result.error;
      overlay.remove();
      await loadData();
      toast(needsApproval?'Candidatura inviata: paga dopo la conferma':`Pagamento demo ${paymentMethod} registrato nel database`);
      openScreen('bookings');
    } catch (error) { showError(error); if(/posto|completa/i.test(error.message||'')){overlay.remove();selectedPosition=null;await loadData();}else $('#confirmDbPayment', overlay).disabled = false; }
    finally { busy = false; }
  };
}

async function bookPending(game) {
  if (busy) return;
  busy = true;
  try {
    if(!selectedPosition)throw Error('Seleziona un posto sul campo');
    const { error } = await sb.rpc('app_book_seat', { p_game: game.id, p_slot:selectedPosition,p_method:null });
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
    const payment = transactions.find(row => row.booking_id === booking.id && row.event_type === 'charge' && (['pending','confirmed'].includes(booking.status) ? ['paid','recorded'].includes(row.status) : true));
    const refundable = game && new Date(game.starts_at).getTime() - Date.now() >= 24 * 60 * 60 * 1000;
    const refund = transactions.find(row => row.booking_id === booking.id && row.event_type === 'refund');
    return `<article class="card booking-item"><div class="booking-item-head"><span class="icon-square">🏐</span><div class="booking-item-copy"><strong>${escapeHtml(group.name || 'Partita')}</strong><small>${escapeHtml(game?.venue || '')} · ${game ? escapeHtml(fmtDate(game.starts_at)) : ''}</small></div><span class="booking-status ${booking.status === 'cancelled' || booking.status === 'rejected' ? 'past' : ''}">${booking.status === 'confirmed' ? 'Confermata' : booking.status === 'pending' ? 'In attesa' : booking.status === 'cancelled' ? 'Disdetta' : 'Rifiutata'}</span></div>
      ${booking.court_slot?`<p class="selected-seat-summary">${escapeHtml(seatLabel(booking.court_slot))}</p>`:''}
      ${payment ? `<div class="payment-summary"><div>Quota partita <b>${euro(payment.quota_cents)}</b></div><div>Commissione non rimborsabile <b>${euro(payment.fee_cents)}</b></div><div>Totale registrato <b>${euro(payment.total_cents)}</b></div><div>Metodo <b>${escapeHtml(payment.method)} · demo</b></div></div>` : '<p class="settings-note">Pagamento non ancora registrato.</p>'}
      ${refund && booking.status === 'cancelled' ? `<div class="info"><strong>${refund.status === 'refunded' ? 'Rimborso simulato registrato' : 'Quota trattenuta'}</strong><div>Importo rimborsato <b>${euro(refund.total_cents)}</b></div><small>Commissione trattenuta: ${euro(payment?.fee_cents || refund.fee_cents)}</small></div>` : ''}
      ${booking.status==='confirmed' && game && new Date(game.starts_at).getTime()+2*3600000<Date.now() ? `<button class="booking-action" data-rate-game="${game.id}">${ratings.some(r=>r.game_id===game.id)?'Aggiorna valutazioni':'Valuta partita e giocatori'}</button>`:''}
      ${booking.status === 'confirmed' && !booking.paid ? `<button class="booking-action" data-pay-booking="${booking.id}">Completa il pagamento demo</button>` : ''}
      ${game?`<button class="booking-action" data-open-booking="${booking.id}">Vedi partita e partecipanti</button>`:''}
      ${['pending', 'confirmed'].includes(booking.status) && game && new Date(game.starts_at) > new Date() ? `<button class="booking-action cancel" data-cancel-booking="${booking.id}" data-game="${game.id}" data-refundable="${refundable}" data-quota="${payment?.quota_cents || 0}" data-fee="${payment?.fee_cents || 0}">Disdici prenotazione</button>` : ''}</article>`;
  }).join('')}<p class="view-label">Almeno 24 ore prima viene rimborsata la sola quota; entro 24 ore la quota è trattenuta. La commissione non viene restituita.</p><p class="booking-section-label">Rendiconto dei tuoi movimenti</p>${paymentHistory()}`;
  container.querySelectorAll('[data-pay-booking]').forEach(button => button.onclick = () => {
    const booking = bookings.find(row => row.id === button.dataset.payBooking);
    const game = Array.isArray(booking?.games) ? booking.games[0] : booking?.games;
    if (booking && game) openPayment(game, booking.id);
  });
  container.querySelectorAll('[data-rate-game]').forEach(button=>button.onclick=()=>startRating(button.dataset.rateGame));
  container.querySelectorAll('[data-open-booking]').forEach(button=>button.onclick=()=>{const booking=bookings.find(b=>b.id===button.dataset.openBooking);const game=games.find(g=>g.id===booking?.game_id)||(Array.isArray(booking?.games)?booking.games[0]:booking?.games);if(game)showGame(game);});
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

function localDateKey(date){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
function occupiedCount(id){const stat=gameStats.find(g=>g.game_id===id);return Number(stat?.occupied||0);}
function requireLogin(){if(session?.user)return true;openScreen('profile');toast('Accedi per continuare.');return false;}
async function perform(action){if(busy)return;busy=true;try{await action();await loadData();}catch(error){showError(error);}finally{busy=false;}}
function check(result){if(result.error)throw result.error;return result.data;}
function clearAccountData(){++refreshSequence;session=null;ownProfile=null;games=[];bookings=[];transactions=[];groups=[];members=[];profiles=[];invitations=[];feedbacks=[];ratings=[];gameStats=[];selectedGame=null;pendingGame=null;renderDataState();renderBookings();renderAccount();renderGroups();renderFeedbacks();renderInvitations();$('#profile h1').textContent='Il tuo profilo';$('#profilePhoto').src='/profile-volleyball-transparent.png';$('#profileReviews').textContent='Accedi per vedere le valutazioni.';$('#profileBio').textContent='';$('#profileStrengths').replaceChildren();$('#avatarStatus').textContent='';$('#profile .pill').textContent='';$('#profile .role').textContent='';}
function renderProfile(){
  const p=ownProfile||{},meta=session?.user.user_metadata||{};
  $('#profile h1').textContent=p.display_name||'Giocatore';
  $('#profile .pill').textContent=p.experience||'Livello da definire';$('#profile .role').textContent=p.role||'Ruolo da definire';
  $('#profileBio').textContent=p.bio||'Aggiungi una presentazione.';
  $('#profileStrengths').innerHTML=String(meta.strengths||'').split(',').filter(Boolean).map(s=>`<span>${escapeHtml(s.trim())}</span>`).join('');
  $('#availabilityDays').textContent=meta.days?`Disponibile: ${meta.days}`:'Scegli i tuoi giorni dal profilo.';
  $('#availabilityState').textContent=p.discoverable?'Disponibile':'Non disponibile';$('#toggleAvailable').setAttribute('aria-checked',String(!!p.discoverable));
  $('#profilePhoto').src=p.avatar_status==='approved'&&p.avatar_path?sb.storage.from('avatars').getPublicUrl(p.avatar_path).data.publicUrl:'/profile-volleyball-transparent.png';
  $('#avatarStatus').textContent='Le nuove foto sono pubblicate dopo l’approvazione di un amministratore.';
}
function fillProfileForm(){const p=ownProfile||{},m=session?.user.user_metadata||{};for(const [id,value] of Object.entries({editName:p.display_name,editCity:p.city,editRole:p.role||'Universale',editLevel:p.experience||'Intermedio',editNotes:p.bio,editStrengths:m.strengths,editDays:m.days}))$('#'+id).value=value||'';}
function updateCities(){const cities=[...new Set(groups.map(g=>g.city))].sort();$('#locationName').textContent=cityFilter||'Tutte le città';$('#locationMenu').innerHTML=['',...cities].map(city=>`<button data-city="${escapeHtml(city)}">${escapeHtml(city||'Tutte le città')}</button>`).join('');$('#locationMenu').querySelectorAll('button').forEach(b=>b.onclick=()=>{cityFilter=b.dataset.city;$('#locationName').textContent=cityFilter||'Tutte le città';$('#locationMenu').classList.remove('show');$('#locationPicker').setAttribute('aria-expanded','false');renderDataState();});}
function renderGroups(){const root=$('#groupList');if(!root)return;root.innerHTML=!session?'<div class="info">Accedi per vedere gruppi e serate.</div>':groups.map(g=>`<button class="card group-item" data-group="${g.id}"><span class="group-kicker">${escapeHtml(g.city)}</span><h2>${escapeHtml(g.name)}</h2><p>${escapeHtml(g.venue)}</p><div class="group-stats"><span>${members.filter(m=>m.group_id===g.id).length} membri</span><span>${games.filter(game=>game.group_id===g.id).length} serate future</span></div></button>`).join('')||'<div class="info">Nessun gruppo. Crea la prima serata.</div>';root.querySelectorAll('[data-group]').forEach(b=>b.onclick=()=>showGroup(b.dataset.group));}
function groupAdmin(id){return members.some(m=>m.group_id===id&&m.user_id===session?.user.id&&m.role==='admin');}
function personName(id){return profiles.find(p=>p.id===id)?.display_name||'Giocatore';}
function showGroup(id){activeGroupId=id;const g=groups.find(g=>g.id===id);if(!g)return;const upcoming=games.filter(game=>game.group_id===id);$('#groupDetail').innerHTML=`<button class="group-back" id="allGroups">← Tutti i gruppi</button><h1>${escapeHtml(g.name)}</h1><p>${escapeHtml(g.city)} · ${escapeHtml(g.venue)}</p><div class="group-detail-grid"><article class="card form-card"><h2>Prossime serate</h2>${upcoming.map(game=>`<button class="secondary-cta" data-group-game="${game.id}">${escapeHtml(fmtDate(game.starts_at))} · ${euro(game.price_cents)} · ${Math.max(0,game.court_spots+game.rotation_spots-occupiedCount(game.id))} posti</button>${groupAdmin(id)?`<button class="group-action" data-invite-game="${game.id}">Invita giocatori</button><button class="group-action" data-duplicate-game="${game.id}">Duplica</button>`:''}`).join('')||'<p>Nessuna serata futura.</p>'}${groupAdmin(id)?'<button class="cta" id="addGroupGame">Programma una serata</button>':''}</article><article class="card form-card"><h2>Membri del gruppo</h2>${members.filter(m=>m.group_id===id).map(m=>`<div class="group-participant"><span>${escapeHtml(personName(m.user_id))}</span><small>${m.role==='admin'?'Organizzatore':'Membro'}</small></div>`).join('')}</article></div>`;$('#allGroups').onclick=()=>openScreen('groups');$('#addGroupGame')?.addEventListener('click',()=>newGroupForm(id));$('#groupDetail').querySelectorAll('[data-group-game]').forEach(b=>b.onclick=()=>showGame(games.find(g=>g.id===b.dataset.groupGame)));$('#groupDetail').querySelectorAll('[data-invite-game]').forEach(b=>b.onclick=()=>showInvites(b.dataset.inviteGame));$('#groupDetail').querySelectorAll('[data-duplicate-game]').forEach(b=>b.onclick=()=>newGroupForm(id,games.find(g=>g.id===b.dataset.duplicateGame)));openScreen('groupDetail');}
function newGroupForm(groupId='',game=null){if(!requireLogin())return;$('#groupForm').reset();$('#existingGroup').innerHTML='<option value="">Crea un nuovo gruppo</option>'+groups.filter(g=>groupAdmin(g.id)).map(g=>`<option value="${g.id}">${escapeHtml(g.name)}</option>`).join('');$('#existingGroup').value=groupId;fillGroup();const date=new Date();date.setDate(date.getDate()+1);$('#groupDate').min=localDateKey(new Date());$('#groupDate').value=localDateKey(date);$('#recurrenceUntil').value=localDateKey(new Date(date.getFullYear(),date.getMonth()+2,date.getDate()));if(game){$('#groupPlace').value=game.venue;$('#groupPrice').value=game.price_cents/100;$('#groupCapacity').value=game.court_spots+game.rotation_spots;$('#groupTime').value=new Date(game.starts_at).toTimeString().slice(0,5);$('#groupApproval').checked=game.approval_required;}previewDates();openScreen('groupCreate');}
function fillGroup(){const g=groups.find(g=>g.id===$('#existingGroup').value);for(const [id,value]of Object.entries({groupName:g?.name||'',groupCity:g?.city||'',groupPlace:g?.venue||''})){$('#'+id).value=value;if(id!=='groupPlace')$('#'+id).readOnly=!!g;}}
function holiday(key){const d=new Date(key+'T12:00:00'),y=d.getFullYear(),fixed={'01-01':'Capodanno','01-06':'Epifania','04-25':'Liberazione','05-01':'Lavoro','06-02':'Repubblica','08-15':'Ferragosto','11-01':'Ognissanti','12-08':'Immacolata','12-25':'Natale','12-26':'Santo Stefano'};if(fixed[key.slice(5)])return fixed[key.slice(5)];if(y>=2026&&key.slice(5)==='10-04')return 'San Francesco';const a=y%19,b=Math.floor(y/100),c=y%100,h=(19*a+b-Math.floor(b/4)-Math.floor((b-Math.floor((b+8)/25)+1)/3)+15)%30,l=(32+2*(b%4)+2*Math.floor(c/4)-h-c%4)%7,m=Math.floor((a+11*h+22*l)/451),easter=new Date(y,Math.floor((h+l-7*m+114)/31)-1,(h+l-7*m+114)%31+1,12);if(localDateKey(easter)===key)return 'Pasqua';easter.setDate(easter.getDate()+1);return localDateKey(easter)===key?'Pasquetta':null;}
function plannedDates(){const start=$('#groupDate').value,end=$('#groupRecurring').checked?$('#recurrenceUntil').value:start;if(!start||!end||end<start)return[];const dates=[],cursor=new Date(start+'T12:00:00');while(localDateKey(cursor)<=end&&dates.length<105){const key=localDateKey(cursor),name=holiday(key);dates.push({date:key,holiday:name,skip:!!name&&$('#skipHolidays').checked});cursor.setDate(cursor.getDate()+7);}return dates;}
function previewDates(){$('#recurrenceOptions').hidden=!$('#groupRecurring').checked;$('#recurrenceUntil').required=$('#groupRecurring').checked;const dates=plannedDates();$('#recurrenceSummary').textContent=`${dates.filter(d=>!d.skip).length} partite da creare · ${dates.filter(d=>d.skip).length} festivi esclusi (massimo 104)`;$('#recurrencePreview').innerHTML=dates.map(d=>`<div>${escapeHtml(d.date)} · ${d.skip?'Esclusa: ':''}${escapeHtml(d.holiday||'Da creare')}</div>`).join('');}
function showInvites(gameId){if(!requireLogin())return;const game=games.find(g=>g.id===gameId);if(!game)return;$('#groupInvite').innerHTML='<h1>Invita un giocatore</h1><p>L’invito non blocca il posto. Il giocatore dovrà prenotare e completare il pagamento.</p><input id="availableSearch" type="search" placeholder="Nome, ruolo o città"><div id="availablePlayers"></div>';const render=()=>{$('#availablePlayers').innerHTML=profiles.filter(p=>p.id!==session.user.id&&p.discoverable&&`${p.display_name} ${p.role} ${p.city}`.toLowerCase().includes($('#availableSearch').value.toLowerCase())).map(p=>`<div class="group-participant"><div class="person-copy"><strong>${escapeHtml(p.display_name)}</strong><small>${escapeHtml(p.role)} · ${escapeHtml(p.city)}</small></div><button class="group-action" data-recipient="${p.id}">Invita</button></div>`).join('');$('#availablePlayers').querySelectorAll('[data-recipient]').forEach(b=>b.onclick=()=>perform(async()=>{check(await sb.rpc('invite_player',{p_game:gameId,p_recipient:b.dataset.recipient}));toast('Invito registrato');b.disabled=true;b.textContent='Invitato';}));};$('#availableSearch').oninput=render;render();openScreen('groupInvite');}
function renderInvitations(){const root=$('#invitationList');if(!root)return;const active=invitations.filter(i=>new Date(i.games?.starts_at)>new Date());root.innerHTML=active.map(i=>`<button class="card game" data-invitation="${i.id}"><span>🏐</span><span><strong>${escapeHtml(getGroup(i.games)?.name)}</strong><small>${escapeHtml(fmtDate(i.games.starts_at))} · ${escapeHtml(i.games.venue)}</small></span></button>`).join('')||'<div class="info">Nessun invito a partite future.</div>';$('#notificationBadge').hidden=!active.length;$('#notificationBadge').textContent=active.length;root.querySelectorAll('[data-invitation]').forEach(b=>b.onclick=()=>{const i=active.find(i=>i.id===b.dataset.invitation);showGame(i.games);});}
function renderFeedbacks(){const root=$('#feedbackList');if(root)root.innerHTML=feedbacks.map(f=>`<article class="card form-card"><strong>${escapeHtml(f.area)}</strong><p>${escapeHtml(f.message)}</p><small>${escapeHtml(fmtDate(f.created_at))}</small></article>`).join('');}
async function startRating(gameId){if(!requireLogin())return;try{const booking=bookings.find(b=>b.game_id===gameId);const game=booking?.games;if(!game)return;ratingGame=gameId;const people=check(await sb.rpc('app_game_players',{p_game:gameId}))||[];const saved=ratings.find(r=>r.game_id===gameId)?.scores||{};const metric=(key,label)=>`<label>${escapeHtml(label)}<select data-rating="${key}"><option value="">Non valuto</option>${[1,2,3,4,5].map(n=>`<option value="${n}" ${saved[key]===n?'selected':''}>${'★'.repeat(n)}</option>`).join('')}</select></label>`;$('#ratingGrid').innerHTML=`<article class="rating-section">${metric('venue','Il campo')}</article>`+people.filter(p=>p.user_id!==session.user.id).map(p=>`<article class="rating-section"><h2>${escapeHtml(p.display_name)}</h2>${metric(p.user_id+':reliability','Affidabilità')}${metric(p.user_id+':technique','Tecnica')}</article>`).join('');openScreen('matchRating');}catch(error){showError(error);}}
function initInterface(){
  document.querySelector('.bottom').insertAdjacentHTML('beforebegin','<section id="playerCard" class="screen"></section>');
  $('#openFeedback').onclick=()=>openScreen('feedback');
  const theme=$('#themeSelect'),apply=()=>{const mode=theme.value;document.body.dataset.theme=mode==='dark'||mode==='auto'&&matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';localStorage.setItem('staseravolley-theme',mode);};theme.value=localStorage.getItem('staseravolley-theme')||'auto';apply();theme.onchange=apply;matchMedia('(prefers-color-scheme: dark)').addEventListener('change',apply);
  $('#settingsButton').onclick=()=>openScreen('settings');$('#notificationsButton').onclick=()=>openScreen('notifications');$('#closeToast').onclick=()=>$('#toast').classList.remove('show');
  $('#locationPicker').onclick=()=>{const shown=$('#locationPicker').getAttribute('aria-expanded')!=='true';$('#locationPicker').setAttribute('aria-expanded',String(shown));$('#locationMenu').classList.toggle('show',shown);};
  $('#exploreSearch').oninput=renderDataState;$('#exactDate').onchange=()=>{exactDate=$('#exactDate').value;renderDataState();};
  document.querySelectorAll('[data-date-filter]').forEach(b=>b.onclick=()=>{dateFilter=b.dataset.dateFilter;exactDate='';$('#exactDate').value='';document.querySelectorAll('[data-date-filter]').forEach(x=>x.classList.toggle('on',x===b));renderDataState();});document.querySelectorAll('[data-date-filter]').forEach(b=>b.classList.remove('on'));
  $('#listTab').onclick=()=>{$('#games').hidden=false;$('#nearbyMap').classList.remove('show');$('#listTab').classList.add('on');$('#mapTab').classList.remove('on');};$('#mapTab').onclick=()=>{$('#games').hidden=true;$('#nearbyMap').classList.add('show');$('#listTab').classList.remove('on');$('#mapTab').classList.add('on');};
  $('#editProfileButton').onclick=()=>{if(requireLogin())openScreen('editProfile');};
  $('#profileForm').onsubmit=e=>{e.preventDefault();if(!requireLogin())return;perform(async()=>{check(await sb.from('profiles').update({display_name:$('#editName').value.trim(),city:$('#editCity').value.trim(),role:$('#editRole').value,experience:$('#editLevel').value,bio:$('#editNotes').value.trim()}).eq('id',session.user.id));const result=await sb.auth.updateUser({data:{strengths:$('#editStrengths').value,days:$('#editDays').value}});check(result);session={...session,user:result.data.user};toast('Profilo salvato');openScreen('profile');});};
  $('#toggleAvailable').onclick=()=>{if(requireLogin())perform(async()=>check(await sb.from('profiles').update({discoverable:!ownProfile?.discoverable}).eq('id',session.user.id)));};
  const choosePhoto=()=>{if(!requireLogin())return;const overlay=document.createElement('div');overlay.className='demo-overlay';overlay.innerHTML='<div class="invite-card"><h2>Foto profilo</h2><button class="cta" data-upload>Carica foto</button><button class="secondary-cta" data-remove>Elimina foto</button><button class="secondary-cta" data-close>Annulla</button></div>';document.body.append(overlay);overlay.querySelector('[data-close]').onclick=()=>overlay.remove();overlay.querySelector('[data-upload]').onclick=()=>{overlay.remove();$('#profilePhotoInput').click();};overlay.querySelector('[data-remove]').onclick=()=>perform(async()=>{const paths=check(await sb.rpc('remove_avatar'));if(paths?.length)check(await sb.storage.from('avatars').remove(paths));overlay.remove();toast('Foto rimossa');});};$('#profilePhotoButton').onclick=choosePhoto;$('#profilePhotoButton').onkeydown=e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();choosePhoto();}};
  $('#profilePhotoInput').onchange=()=>{const file=$('#profilePhotoInput').files[0];if(!file||!requireLogin())return;perform(async()=>{if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>10*1024*1024)throw Error('Scegli un’immagine JPG, PNG o WebP fino a 10 MB.');const image=await createImageBitmap(file),scale=Math.min(1,800/Math.max(image.width,image.height)),canvas=document.createElement('canvas');canvas.width=Math.round(image.width*scale);canvas.height=Math.round(image.height*scale);canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);image.close();const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.82));if(!blob||blob.size>1048576)throw Error('Immagine troppo grande.');const path=`${session.user.id}/${crypto.randomUUID()}.jpg`;check(await sb.storage.from('avatars').upload(path,blob,{contentType:'image/jpeg'}));try{check(await sb.rpc('submit_avatar',{p_path:path,p_checks:{source:'profile-upload'}}));}catch(error){await sb.storage.from('avatars').remove([path]);throw error;}toast('Foto caricata: in attesa di approvazione.');});$('#profilePhotoInput').value='';};
  $('#newGroup').onclick=()=>newGroupForm();$('#existingGroup').onchange=fillGroup;$('#cancelGroupCreate').onclick=()=>openScreen('groups');for(const id of ['groupDate','groupRecurring','recurrenceUntil','skipHolidays'])$('#'+id).onchange=previewDates;
  $('#groupForm').onsubmit=e=>{e.preventDefault();if(!requireLogin())return;perform(async()=>{const dates=plannedDates().filter(d=>!d.skip);if(!dates.length||dates.length>104)throw Error('Scegli da 1 a 104 date valide.');const starts=dates.map(d=>new Date(`${d.date}T${$('#groupTime').value}:00`).toISOString());const capacity=Number($('#groupCapacity').value);check(await sb.rpc('app_create_series',{p_group:$('#existingGroup').value||null,p_name:$('#groupName').value.trim(),p_city:$('#groupCity').value.trim(),p_venue:$('#groupPlace').value.trim(),p_dates:starts,p_price_cents:Math.round(Number($('#groupPrice').value)*100),p_court_spots:Math.min(capacity,12),p_rotation_spots:Math.max(0,capacity-12),p_approval:$('#groupApproval').checked}));toast(`${dates.length} serate pubblicate`);openScreen('groups');});};
  $('#feedbackForm').onsubmit=e=>{e.preventDefault();if(requireLogin())perform(async()=>{check(await sb.from('feedback').insert({user_id:session.user.id,area:$('#feedbackArea').value,message:$('#feedbackText').value.trim()}));$('#feedbackText').value='';toast('Feedback inviato agli amministratori');});};
  $('#matchRatingForm').onsubmit=e=>{e.preventDefault();if(!requireLogin()||!ratingGame)return;perform(async()=>{const scores={};document.querySelectorAll('[data-rating]').forEach(s=>{if(s.value)scores[s.dataset.rating]=Number(s.value);});if(!Object.keys(scores).length)throw Error('Seleziona almeno una valutazione.');check(await sb.rpc('app_submit_rating',{p_game:ratingGame,p_scores:scores}));toast('Valutazioni salvate');openScreen('bookings');});};
  initTutorial();
}
function initTutorial(){const tours={explore:[['Scegli la zona','Le partite arrivano dal database. Seleziona una città oppure tutte le città.','#locationPicker'],['Trova la serata','Cerca il nome del gruppo o della palestra, poi scegli un giorno o una data precisa.','#exploreSearch'],['Lista e mappa','Apri una scheda per quota e disponibilità. La vista mappa apre l’indirizzo della palestra.','#games']],details:[['Controlla la partita','Verifica data, città, palestra, quota e posti liberi. Il campo rappresenta l’occupazione totale, senza assegnare un ruolo.','#detailTitle'],['Conferma il posto','Per le candidature attendi l’approvazione; per le prenotazioni dirette seleziona Satispay o PayPal e registra il pagamento simulato.','#book'],['Quota e commissione','La commissione è del 5%. Nessun addebito reale: quota e commissione sono salvate nel rendiconto degli amministratori.','#book']],bookings:[['Stato delle iscrizioni','Qui trovi le prenotazioni salvate sul tuo account. Completa il pagamento dopo l’approvazione se necessario.','#bookingState'],['Disdetta','Prima dell’inizio puoi ritirarti. Almeno 24 ore prima ricevi la sola quota; nelle ultime 24 ore viene trattenuta. La commissione non è rimborsabile.','#bookingState'],['Movimenti e valutazioni','Il rendiconto mostra tutti i pagamenti e i rimborsi. Dopo una partita confermata puoi valutare campo e giocatori.','#bookingState']],profile:[['Il tuo account','Accedi o registrati per sincronizzare le attività su tutti i dispositivi.','#accountPanel'],['Foto e disponibilità','Tocca l’immagine per caricarla o eliminarla. Le nuove foto attendono l’approvazione admin. Attiva la disponibilità per ricevere inviti.','#profilePhotoButton'],['Presentati','Modifica nome, città, ruolo, livello, capacità e giorni disponibili.','#editProfileButton']],groups:[['Gruppi reali','Qui trovi i gruppi e le serate salvati nel database. Apri un gruppo per vedere le date.','#groupList'],['Crea o programma','Puoi creare un gruppo o aggiungere date a uno che organizzi. La pubblicazione non prenota automaticamente un posto.','#newGroup']],groupCreate:[['Dati della serata','Scegli gruppo, città, palestra, quota, capienza e se approvare le candidature.','#groupForm'],['Ripetizione','Attiva la ricorrenza e scegli la data finale: il riepilogo mostra le date create e i festivi esclusi. Controlla le chiusure locali.','#recurrenceSummary']],groupDetail:[['Serate e membri','Apri una serata per prenotarla. Gli organizzatori possono duplicarla o invitare giocatori disponibili.','#groupDetail']],groupInvite:[['Invita','Cerca per nome, ruolo o città. L’invito è reale ma non blocca il posto: il destinatario dovrà confermare la prenotazione.','#groupInvite']],settings:[['Aspetto','Scegli tema chiaro, scuro o automatico. La preferenza viene ricordata su questo dispositivo.','#themeSelect'],['Amministrazione','Il pannello legge lo stesso database dell’app. L’accesso è verificato da Supabase in base ai privilegi del tuo account.','#settings']],feedback:[['Invia un suggerimento','Scegli l’area e descrivi il problema. Gli amministratori lo leggeranno nel database e nel pannello.','#feedbackForm']],editProfile:[['Salva il profilo','Le modifiche ai dati personali vengono sincronizzate sul tuo account.','#profileForm']],notifications:[['Inviti','Apri una partita e controlla i posti. Ricevere un invito non effettua un pagamento.','#invitationList']],matchRating:[['Valuta ciò che conosci','Puoi lasciare vuote le voci che non sai giudicare. Puoi aggiornare le tue risposte senza duplicare il voto.','#ratingGrid']]};let steps=[],index=0;const close=()=>{$('#tourOverlay').hidden=true;document.querySelectorAll('.tour-focus').forEach(n=>n.classList.remove('tour-focus'));};const render=()=>{document.querySelectorAll('.tour-focus').forEach(n=>n.classList.remove('tour-focus'));const step=steps[index];$(step[2])?.classList.add('tour-focus');$('#tourProgress').textContent=`${index+1} di ${steps.length}`;$('#tourTitle').textContent=step[0];$('#tourText').textContent=step[1];$('#tourNext').textContent=index===steps.length-1?'Fine':'Avanti';};$('#tourButton').onclick=()=>{steps=tours[$('.screen.active').id]||tours.explore;index=0;$('#tourOverlay').hidden=false;render();};$('#tourSkip').onclick=close;$('#tourNext').onclick=()=>{if(++index>=steps.length)close();else render();};}

async function loadData() {
  if (!sb || !session?.user) { renderDataState(); renderBookings(); renderAccount(); return; }
  const request = ++refreshSequence, userId = session.user.id;
  try {
    const results = await Promise.all([
      sb.from('games').select('*, groups(name,city)').gte('starts_at', new Date().toISOString()).order('starts_at'),
      sb.from('bookings').select('*, games(id,starts_at,venue,price_cents,court_spots,rotation_spots,approval_required,groups(name,city))').eq('user_id', session.user.id).order('created_at', { ascending: false }),
      sb.from('payment_transactions').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
      sb.from('profiles').select('*'), sb.from('groups').select('*').order('created_at',{ascending:false}),
      sb.from('group_members').select('*'), sb.from('invitations').select('*,games(*,groups(name,city))').eq('recipient_id',userId),
      sb.rpc('app_game_stats'), sb.from('feedback').select('*').order('created_at',{ascending:false}),
      sb.from('match_ratings').select('*').eq('user_id',userId), sb.rpc('app_my_rating_summary'),
    ]);
    if(request!==refreshSequence || session?.user.id!==userId) return;
    const [gameResult,bookingResult,paymentResult,profileResult,groupResult,memberResult,inviteResult,statsResult,feedbackResult,ratingResult,summaryResult]=results;
    for (const result of results) if (result.error) throw result.error;
    games = gameResult.data || [];
    bookings = bookingResult.data || [];
    transactions = paymentResult.data || [];
    profiles=profileResult.data||[]; ownProfile=profiles.find(p=>p.id===userId);
    groups=groupResult.data||[]; members=memberResult.data||[]; invitations=inviteResult.data||[];
    gameStats=statsResult.data||[]; feedbacks=feedbackResult.data||[]; ratings=ratingResult.data||[];
    renderDataState();
    renderBookings();
    renderAccount();
    const summary=summaryResult.data;
    $('#profileReviews').textContent=summary?.count?`${summary.count} valutazioni · Affidabilità: ${summary.reliability?Number(summary.reliability).toFixed(1):'—'}/5 · Tecnica: ${summary.technique?Number(summary.technique).toFixed(1):'—'}/5`:'Nessuna valutazione ricevuta.';
    renderGroups(); renderFeedbacks(); renderInvitations(); updateCities();
    if($('#details').classList.contains('active') && selectedGame) showGame(games.find(g=>g.id===selectedGame.id)||selectedGame);
  } catch (error) { showError(error); }
}

initInterface();
mountAuth();
renderDataState();
renderBookings();
renderAccount();
document.querySelectorAll('.bottom button[data-screen]').forEach(button => button.onclick = () => openScreen(button.dataset.screen));
$('#back').onclick = () => openScreen($('.screen.active').id==='playerCard'?'details':['groupCreate','groupDetail','groupInvite'].includes($('.screen.active').id)?'groups':$('.screen.active').id==='matchRating'?'bookings':'explore');
$('#book').onclick = () => {
  if (!selectedGame) { toast('Apri una partita disponibile dal database per prenotare.'); return; }
  if (!session?.user) { pendingGame = selectedGame; openScreen('profile'); toast('Accedi per salvare la prenotazione e il pagamento.'); return; }
  openPayment(selectedGame);
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
    if(!newSession) clearAccountData();
    session = newSession;
    // Defer queries until Supabase releases its auth lock.
    setTimeout(()=>loadData(),0);
  });
}
