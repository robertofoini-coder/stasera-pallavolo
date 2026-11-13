// PWA: service worker + stato di installazione (Android: prompt nativo; iPhone: istruzioni manuali)
export const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
export const isIOS = () =>
  /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
export const isIOSSafari = () => isIOS() && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(navigator.userAgent);
export const isAndroid = () => /Android/i.test(navigator.userAgent);

let deferred = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferred = e;
  window.dispatchEvent(new Event('sv-install-ready'));
});
window.addEventListener('appinstalled', () => {
  deferred = null;
  window.dispatchEvent(new Event('sv-installed'));
});
export const canPrompt = () => !!deferred;
export async function promptInstall() {
  if (!deferred) return false;
  deferred.prompt();
  const r = await deferred.userChoice.catch(() => ({ outcome: 'dismissed' }));
  deferred = null;
  return r.outcome === 'accepted';
}

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}
