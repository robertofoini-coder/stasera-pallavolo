import React, { useEffect, useState } from 'react';
import { Smartphone, Download, X, Copy, Sun, Moon, Monitor, LogOut, ArrowLeft, Check } from 'lucide-react';
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
export function SettingsPanel({ user, onSignOut, onBack }) {
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
      <section className="panel">
        <h3>Account</h3>
        <p className="muted">{user?.email}</p>
        <button className="outline" onClick={onSignOut}><LogOut size={17} /> Esci</button>
        <p className="muted">StaseraVolley · versione beta 0.2</p>
      </section>
    </>
  );
}
