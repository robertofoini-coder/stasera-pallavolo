import React, { useEffect, useRef, useState } from 'react';
import { Smartphone, Download, X, Copy, Sun, Moon, Monitor, LogOut, ArrowLeft, Check, Camera, Trash2 } from 'lucide-react';
import { isStandalone, isIOS, isIOSSafari, isAndroid, canPrompt, promptInstall } from './pwa.js';

/* ---------- Tema ---------- */
const THEME_KEY = 'sv_theme';
export const getMode = () => { try { return localStorage.getItem(THEME_KEY) || 'light'; } catch (_) { return 'light'; } };
export function applyTheme(mode) {
  const dark = mode === 'dark' || (mode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  const m = document.querySelector('meta[name=theme-color]');
  if (m) m.setAttribute('content', dark ? '#000000' : '#123f7a');
}
applyTheme(getMode());
window.matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => { if (getMode() === 'auto') applyTheme('auto'); });

/* ---------- Installazione app ---------- */
function useInstalled() {
  const [done, setDone] = useState(isStandalone());
  useEffect(() => { const f = () => setDone(true); window.addEventListener('sv-installed', f); return () => window.removeEventListener('sv-installed', f); }, []);
  return done;
}

function Sheet({ platform, onClose }) {
  const [ready, setReady] = useState(canPrompt());
  const [copied, setCopied] = useState(false);
  useEffect(() => { const f = () => setReady(true); window.addEventListener('sv-install-ready', f); return () => window.removeEventListener('sv-install-ready', f); }, []);
  const url = window.location.origin;
  async function share() {
    try {
      if (navigator.share) await navigator.share({ title: 'StaseraVolley', url });
      else { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    } catch (_) {}
  }
  const android = platform === 'android';
  return (
    <div className="sheet-back" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <h2>{android ? 'Installa su Android' : 'Installa su iPhone'}</h2>
          <button className="icon-btn" aria-label="Chiudi" onClick={onClose}><X size={20} /></button>
        </div>
        {android ? (
          <>
            {ready && <button className="primary" onClick={async () => { if (await promptInstall()) onClose(); }}><Download size={18} /> Installa ora</button>}
            {!isAndroid() && <p className="muted">Questa è l’installazione per Android: aprila dal telefono. Dal computer puoi copiare il link e inviarlo.</p>}
            {!ready && (
              <ol className="steps">
                <li>Apri questo sito con <b>Chrome</b> sul telefono.</li>
                <li>Tocca i <b>tre puntini ⋮</b> in alto a destra.</li>
                <li>Scegli <b>“Installa app”</b> (o “Aggiungi a schermata Home”).</li>
                <li>Conferma: l’icona <b>StaseraVolley</b> compare tra le tue app.</li>
              </ol>
            )}
          </>
        ) : (
          <>
            {isIOS() && !isIOSSafari() && <p className="warn">Sei su un browser diverso da Safari: apri questo link in <b>Safari</b>, altrimenti l’opzione non compare.</p>}
            {!isIOS() && <p className="muted">Questa è l’installazione per iPhone: aprila dal telefono. Dal computer puoi copiare il link e inviarlo.</p>}
            <ol className="steps">
              <li>Apri questo sito con <b>Safari</b>.</li>
              <li>Tocca <b>Condividi</b> (il quadrato con la freccia verso l’alto) in basso.</li>
              <li>Scorri e scegli <b>“Aggiungi alla schermata Home”</b>.</li>
              <li>Tocca <b>Aggiungi</b>: l’icona <b>StaseraVolley</b> compare tra le tue app.</li>
            </ol>
          </>
        )}
        <button className="outline" onClick={share}>{copied ? <><Check size={17} /> Link copiato</> : <><Copy size={17} /> Condividi o copia il link</>}</button>
        <p className="muted">App gratuita e leggera: non serve passare da App Store o Play Store.</p>
      </div>
    </div>
  );
}

export function InstallActions({ compact }) {
  const [platform, setPlatform] = useState(null);
  const installed = useInstalled();
  if (installed) return <p className="muted"><Check size={14} className="inline" /> App già installata su questo dispositivo.</p>;
  return (
    <>
      <div className={'dl-actions' + (compact ? ' compact' : '')}>
        <button className="dl-btn" onClick={() => setPlatform('android')}><Smartphone size={17} /> Android</button>
        <button className="dl-btn" onClick={() => setPlatform('ios')}><Smartphone size={17} /> iPhone</button>
      </div>
      {platform && <Sheet platform={platform} onClose={() => setPlatform(null)} />}
    </>
  );
}

export function InstallBanner() {
  const installed = useInstalled();
  const [hidden, setHidden] = useState(() => { try { return sessionStorage.getItem('sv_banner_x') === '1'; } catch (_) { return false; } });
  if (installed || hidden) return null;
  return (
    <div className="dl-banner">
      <div className="dl-text">
        <strong>Scarica l’app StaseraVolley</strong>
        <small>Gratis, senza store · Android e iPhone</small>
      </div>
      <InstallActions compact />
      <button className="dl-x" aria-label="Chiudi" onClick={() => { try { sessionStorage.setItem('sv_banner_x', '1'); } catch (_) {} setHidden(true); }}><X size={18} /></button>
    </div>
  );
}

/* ---------- Impostazioni ---------- */
export function SettingsPanel({ sb, user, onSignOut, onBack }) {
  const [mode, setMode] = useState(getMode);
  const choose = (m) => { setMode(m); try { localStorage.setItem(THEME_KEY, m); } catch (_) {} applyTheme(m); };
  const opts = [{ id: 'light', label: 'Chiaro', icon: Sun }, { id: 'dark', label: 'Scuro', icon: Moon }, { id: 'auto', label: 'Automatico', icon: Monitor }];
  return (
    <>
      <section className="panel">
        <button className="back" onClick={onBack}><ArrowLeft /> Indietro</button>
        <h2>Impostazioni</h2>
        <h3>Tema</h3>
        <div className="seg" role="radiogroup" aria-label="Tema">
          {opts.map((o) => (
            <button key={o.id} role="radio" aria-checked={mode === o.id} className={mode === o.id ? 'on' : ''} onClick={() => choose(o.id)}>
              <o.icon size={17} /> {o.label}
            </button>
          ))}
        </div>
        <p className="muted">Il tema scuro usa sfondo nero e colori ad alto contrasto. “Automatico” segue le impostazioni del telefono.</p>
      </section>
      <section className="panel">
        <h3>Scarica l’app</h3>
        <p className="muted">Aggiungi StaseraVolley alla schermata Home del telefono.</p>
        <InstallActions />
      </section>
      <ModerationPanel sb={sb} user={user} />
      <section className="panel">
        <h3>Account</h3>
        <p className="muted">{user?.email}</p>
        <button className="outline" onClick={onSignOut}><LogOut size={17} /> Esci</button>
        <p className="muted">StaseraVolley · versione beta 0.2</p>
      </section>
    </>
  );
}

/* ---------- Foto profilo ---------- */
const REASONS = {
  FACE_NOT_VISIBLE: 'Il volto non è chiaramente visibile.',
  MULTIPLE_PEOPLE: 'Ci sono più persone: serve un solo soggetto in primo piano.',
  LOW_IMAGE_QUALITY: 'La foto è sfocata, troppo scura o di qualità troppo bassa.',
  POSSIBLE_MINOR: 'La foto potrebbe ritrarre un minorenne: la piattaforma è riservata ai maggiorenni.',
  ADULT_CONTENT: 'Contenuto non adatto (nudità o contenuti sessuali).',
  VIOLENCE: 'Contenuto violento.',
  WEAPON: 'Sono presenti armi.',
  DRUGS: 'Sono presenti droghe o sostanze illegali.',
  PERSONAL_DATA: 'Sono visibili dati personali o documenti.',
  ADVERTISEMENT: 'Contiene pubblicità o promozioni.',
  QR_CODE: 'È presente un QR code.',
  SCREENSHOT: 'Sembra uno screenshot: carica una foto scattata con la fotocamera.',
  LOGO: 'Sembra un logo.',
  AVATAR_OR_AI_IMAGE: 'Sembra un disegno, un avatar o un’immagine generata.',
  COPYRIGHT_CONTENT: 'Contiene marchi o materiale protetto da copyright.',
  OFFENSIVE_CONTENT: 'Contenuto offensivo o volgare.',
  NOT_PROFILE_PHOTO: 'Non è adatta come foto profilo.',
};

export function Avatar({ url, name, size = 40, className = '' }) {
  const [bad, setBad] = useState(false);
  useEffect(() => setBad(false), [url]);
  const style = { width: size, height: size };
  if (url && !bad) return <img className={'avatar img ' + className} style={style} src={url} alt={name ? 'Foto di ' + name : ''} loading="lazy" onError={() => setBad(true)} />;
  const ini = (name || '?').trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '?';
  return <span className={'avatar ' + className} style={{ ...style, fontSize: Math.round(size / 2.6), fontWeight: 700 }} aria-hidden="true">{ini}</span>;
}

const publicUrl = (sb, path) => sb.storage.from('avatars').getPublicUrl(path).data.publicUrl;
const rid = () => (crypto.randomUUID ? crypto.randomUUID().replace(/-/g, '') : Date.now().toString(36) + Math.random().toString(36).slice(2, 12));

/* Controlli gratuiti nel browser: servono a dare un riscontro subito e a risparmiare tempo a chi approva.
   NON sono una difesa: l'approvazione manuale resta l'unico filtro affidabile. */
const MIN_SHARPNESS = 15;   // varianza del Laplaciano a 256 px (non calibrata su molte foto: soglia prudente)
const MP = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14';
let detP = null;
function getDetector() {
  if (!detP) detP = (async () => {
    const mod = await import(/* @vite-ignore */ MP + '/vision_bundle.mjs');
    const fs = await mod.FilesetResolver.forVisionTasks(MP + '/wasm');
    return mod.FaceDetector.createFromOptions(fs, {
      baseOptions: { modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite', delegate: 'CPU' },
      runningMode: 'IMAGE', minDetectionConfidence: 0.6,
    });
  })();
  return detP;
}
async function detectFaces(canvas) { // area relativa di ogni volto (decrescente), oppure null se il rilevatore non è disponibile
  try {
    const det = await Promise.race([getDetector(), new Promise((_, ko) => setTimeout(() => ko(Error('timeout')), 20000))]);
    return det.detect(canvas).detections.map((d) => (d.boundingBox.width * d.boundingBox.height) / (canvas.width * canvas.height)).sort((a, b) => b - a);
  } catch (_) { detP = null; return null; }
}
function quality(canvas) {
  const k = 256 / Math.max(canvas.width, canvas.height), W = Math.max(8, Math.round(canvas.width * k)), H = Math.max(8, Math.round(canvas.height * k));
  const s = document.createElement('canvas'); s.width = W; s.height = H;
  const g = s.getContext('2d', { willReadFrequently: true }); g.drawImage(canvas, 0, 0, W, H);
  const d = g.getImageData(0, 0, W, H).data, L = new Float32Array(W * H); let sum = 0;
  for (let i = 0; i < W * H; i++) { L[i] = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]; sum += L[i]; }
  let m = 0, m2 = 0, n = 0;
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const i = y * W + x, v = 4 * L[i] - L[i - 1] - L[i + 1] - L[i - W] - L[i + W]; m += v; m2 += v * v; n++; }
  return { brightness: Math.round(sum / (W * H)), sharpness: Math.round(m2 / n - (m / n) ** 2) };
}

// Ridimensiona (max 1024 px), toglie i metadati EXIF (posizione GPS inclusa), converte in JPEG.
async function prepare(file) {
  if (!file.type.startsWith('image/')) throw Error('Scegli un file immagine.');
  if (file.type === 'image/png') { const e = Error('PNG'); e.codes = ['SCREENSHOT']; throw e; }
  const src = URL.createObjectURL(file);
  try {
    const img = await new Promise((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ko(Error('Formato non supportato: usa una foto JPEG.')); i.src = src; });
    const w = img.naturalWidth, h = img.naturalHeight;
    if (Math.min(w, h) < 300) throw Error('Foto troppo piccola: servono almeno 300 px sul lato corto.');
    const k = Math.min(1, 1024 / Math.max(w, h)), cw = Math.round(w * k), ch = Math.round(h * k);
    const canvas = document.createElement('canvas'); canvas.width = cw; canvas.height = ch;
    const g = canvas.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, cw, ch); g.drawImage(img, 0, 0, cw, ch);
    for (const q of [0.88, 0.75, 0.6]) { const blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', q)); if (blob && blob.size <= 900000) return { blob, canvas }; }
    throw Error('Foto troppo pesante.');
  } finally { URL.revokeObjectURL(src); }
}
async function localChecks(canvas) {
  const q = quality(canvas), codes = [];
  if (q.sharpness < MIN_SHARPNESS || q.brightness < 30 || q.brightness > 235) codes.push('LOW_IMAGE_QUALITY');
  const faces = await detectFaces(canvas);
  if (faces) {
    if (faces.length === 0 || faces[0] < 0.03) codes.push('FACE_NOT_VISIBLE');
    else if (faces.length > 1 && faces[1] >= 0.4 * faces[0]) codes.push('MULTIPLE_PEOPLE');
  }
  return { codes, checks: { ...q, faces: faces ? faces.length : null, face_area: faces?.[0] ? Math.round(faces[0] * 1000) / 1000 : null } };
}

export function AvatarEditor({ sb, user, own, url, onDone }) {
  const [busy, setBusy] = useState(''), [preview, setPreview] = useState(null), [sub, setSub] = useState(null), [msg, setMsg] = useState(null), [agree, setAgree] = useState(false);
  const fileRef = useRef(null);
  async function loadSub() {
    const { data } = await sb.from('avatar_submissions').select('*').eq('user_id', user.id).in('status', ['pending', 'rejected']).order('created_at', { ascending: false }).limit(1);
    setSub(data?.[0] || null);
  }
  useEffect(() => { loadSub(); }, [user.id]);
  async function pick(e) {
    const f = e.target.files?.[0]; e.target.value = ''; if (!f) return;
    setMsg(null);
    try {
      setBusy('Controllo della foto…');
      const { blob, canvas } = await prepare(f);
      const { codes, checks } = await localChecks(canvas);
      if (codes.length) { setMsg({ type: 'reject', codes }); return; }
      setBusy('Invio della foto…'); setPreview(URL.createObjectURL(blob));
      const path = `${user.id}/${rid()}.jpg`;
      const up = await sb.storage.from('avatars').upload(path, blob, { contentType: 'image/jpeg' });
      if (up.error) throw up.error;
      const { error } = await sb.rpc('submit_avatar', { p_path: path, p_checks: { ...checks, client: 'web-0.4' } });
      if (error) { await sb.storage.from('avatars').remove([path]); throw error; }
      if (sub?.status === 'pending') await sb.storage.from('avatars').remove([sub.path]);
      await loadSub(); setMsg({ type: 'sent' });
    } catch (err) {
      setMsg(err.codes ? { type: 'reject', codes: err.codes } : { type: 'error', text: /relation|function|bucket/i.test(err.message || '') ? 'Funzione foto non ancora attivata nel database (vedi README).' : err.message || 'Errore imprevisto.' });
    } finally { setBusy(''); setPreview(null); }
  }
  async function remove() {
    if (!window.confirm(sub?.status === 'pending' && !url ? 'Annullare la richiesta?' : 'Rimuovere la foto profilo?')) return;
    setBusy('Rimozione…'); setMsg(null);
    try {
      const { data, error } = await sb.rpc('remove_avatar'); if (error) throw error;
      if (data?.length) await sb.storage.from('avatars').remove(data);
      await loadSub(); await onDone?.();
    } catch (err) { setMsg({ type: 'error', text: err.message }); } finally { setBusy(''); }
  }
  const pending = sub?.status === 'pending' ? sub : null;
  const rejected = !pending && sub?.status === 'rejected' && !msg ? sub : null;
  const shown = preview || url || (pending ? publicUrl(sb, pending.path) : null);
  return (
    <div className="av-edit">
      <div className="av-row">
        <Avatar url={shown} name={own?.display_name} size={88} />
        <div className="av-actions">
          <strong>Foto profilo</strong>
          <small className="muted">{pending ? (url ? 'Nuova foto in attesa di approvazione' : 'In attesa di approvazione: la vedono solo gli amministratori') : url ? 'Visibile agli altri giocatori' : 'Facoltativa: aiuta a riconoscerti in palestra'}</small>
          <label className="check"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} /> Sono maggiorenne e la foto ritrae me</label>
          <div className="av-btns">
            <button type="button" className="small" disabled={!!busy || !agree} onClick={() => fileRef.current?.click()}><Camera size={16} /> {url || pending ? 'Cambia foto' : 'Carica foto'}</button>
            {(url || pending) && <button type="button" className="small danger" disabled={!!busy} onClick={remove}><Trash2 size={16} /> {url ? 'Rimuovi' : 'Annulla'}</button>}
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/*" hidden onChange={pick} />
        </div>
      </div>
      {busy && <p className="notice">{busy}</p>}
      {msg?.type === 'sent' && <p className="notice">✓ Foto inviata. Sarà visibile agli altri dopo il controllo di un amministratore.</p>}
      {(msg?.type === 'reject' || rejected) && (
        <div className="err"><strong>{msg?.type === 'reject' ? 'Foto non valida' : 'Foto non approvata'}</strong>
          <ul>{(msg?.codes || rejected.reasons).map((c) => <li key={c}>{REASONS[c] || c}</li>)}</ul>
          <small>Puoi riprovare con un’altra foto.</small></div>
      )}
      {msg?.type === 'error' && <div className="err">{msg.text}</div>}
      <details className="av-rules"><summary>Regole per la foto</summary>
        <ul>
          <li>Una sola persona, con il volto ben visibile e a fuoco, scattata con la fotocamera (JPEG).</li>
          <li>Niente disegni, avatar, immagini generate, loghi, meme o screenshot.</li>
          <li>Niente minorenni, nudità, armi, droghe, violenza, simboli d’odio o contenuti offensivi.</li>
          <li>Niente documenti, numeri di telefono, email, QR code, URL o pubblicità.</li>
          <li>Niente marchi in primo piano e non impersonare altre persone.</li>
        </ul>
        <small className="muted">Un controllo automatico nel browser verifica subito volto e nitidezza; poi un amministratore approva la foto a mano. In caso di dubbio viene rifiutata.</small>
      </details>
    </div>
  );
}

/* ---------- Moderazione (solo amministratori) ---------- */
export function ModerationPanel({ sb, user }) {
  const [admin, setAdmin] = useState(false), [items, setItems] = useState([]), [busy, setBusy] = useState(false), [msg, setMsg] = useState(''), [sel, setSel] = useState({});
  async function load() { const { data } = await sb.rpc('pending_avatars'); setItems(data || []); }
  useEffect(() => {
    (async () => {
      const { data } = await sb.from('platform_admins').select('user_id').eq('user_id', user.id).maybeSingle();
      if (data) { setAdmin(true); load(); }
    })();
  }, [user.id]);
  if (!admin) return null;
  async function decide(it, ok) {
    const reasons = ok ? [] : Object.keys(sel[it.id] || {}).filter((k) => sel[it.id][k]);
    if (!ok && !reasons.length) { setMsg('Per rifiutare seleziona almeno un motivo.'); return; }
    setBusy(true); setMsg('');
    try {
      const { data, error } = await sb.rpc('decide_avatar', { p_id: it.id, p_approve: ok, p_reasons: reasons });
      if (error) throw error;
      if (data) await sb.storage.from('avatars').remove([data]);
      await load();
    } catch (e) { setMsg(e.message); } finally { setBusy(false); }
  }
  return (
    <section className="panel">
      <h3>Moderazione foto ({items.length})</h3>
      {msg && <p className="err">{msg}</p>}
      {!items.length && <p className="muted">Nessuna foto in attesa.</p>}
      {items.map((it) => (
        <div className="mod-card" key={it.id}>
          <img className="mod-img" src={publicUrl(sb, it.path)} alt={'Foto inviata da ' + it.display_name} />
          <strong>{it.display_name || 'Senza nome'}</strong>
          <small className="muted">Controlli del browser: volti {it.checks?.faces ?? 'non verificati'} · nitidezza {it.checks?.sharpness ?? '—'} · luminosità {it.checks?.brightness ?? '—'} (indicativi: giudica tu)</small>
          <p className="muted">Approva solo se: persona reale, una sola, volto visibile e nitido; nessun minore, nudità, armi, droghe, violenza, documenti, dati personali, QR, pubblicità, loghi, meme, screenshot o immagini generate. Nel dubbio rifiuta.</p>
          <details><summary>Motivi di rifiuto</summary>
            <div className="reasons">{Object.keys(REASONS).map((c) => (
              <label className="check" key={c}><input type="checkbox" checked={!!sel[it.id]?.[c]} onChange={(e) => setSel({ ...sel, [it.id]: { ...(sel[it.id] || {}), [c]: e.target.checked } })} /> {REASONS[c]}</label>
            ))}</div>
          </details>
          <div className="av-btns">
            <button className="primary" disabled={busy} onClick={() => decide(it, true)}>Approva</button>
            <button className="outline" disabled={busy} onClick={() => decide(it, false)}>Rifiuta</button>
          </div>
        </div>
      ))}
    </section>
  );
}
