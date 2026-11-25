import { Capacitor } from '@capacitor/core';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface InstallEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const dismissalKey = 'mood-log-install-dismissed';
const reminderInterval = 7 * 24 * 60 * 60 * 1000;
const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches
  || (navigator as Navigator & { standalone?: boolean }).standalone === true;

export default function InstallNotice() {
  const { pathname } = useLocation();
  const [prompt, setPrompt] = useState<InstallEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => {
    try { return Date.now() - Number(localStorage.getItem(dismissalKey)) < reminderInterval; }
    catch { return false; }
  });
  const [installed, setInstalled] = useState(isStandalone);
  const [showSteps, setShowSteps] = useState(false);
  const [busy, setBusy] = useState(false);
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const android = /Android/i.test(navigator.userAgent);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) return;
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPrompt(null);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const dismiss = () => {
    setDismissed(true);
    try { localStorage.setItem(dismissalKey, String(Date.now())); }
    catch { /* Dismiss for this visit when storage is unavailable. */ }
  };

  const install = async () => {
    if (!prompt) {
      setShowSteps(true);
      return;
    }
    setBusy(true);
    setPrompt(null);
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      if (choice.outcome === 'accepted') setInstalled(true);
      else dismiss();
    } catch {
      setShowSteps(true);
    } finally {
      setBusy(false);
    }
  };

  if (pathname !== '/' || installed || dismissed || Capacitor.isNativePlatform()
    || (!ios && !android)) return null;

  return (
    <aside aria-label='Instalar Mood Log' className='fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-30 mx-auto max-w-md rounded-2xl border border-[var(--mood-border)] bg-[var(--mood-surface)] p-4 text-[var(--mood-text)] shadow-xl'>
      <p className='font-semibold'>¿Quieres agregar Mood Log a tu pantalla de inicio?</p>
      <p className='mt-1 text-sm text-[var(--mood-text-muted)]' aria-live='polite'>
        {showSteps
          ? ios
            ? 'Abre Mood Log en Safari. Toca Compartir → Agregar a pantalla de inicio → Agregar. Activa «Abrir como app web» si aparece.'
            : 'Abre Mood Log en Chrome. Toca el menú ⋮ → Instalar o Agregar a pantalla de inicio.'
          : 'Abre la app desde su ícono y registra cómo te sientes en unos toques.'}
      </p>
      <div className='mt-3 flex flex-wrap gap-2'>
        {!showSteps && <button type='button' disabled={busy} onClick={() => void install()} className='btn-primary text-sm'>
          {prompt || busy ? 'Instalar Mood Log' : 'Ver cómo agregarla'}
        </button>}
        <button type='button' onClick={dismiss} className='min-h-11 rounded-xl px-4 text-sm font-medium'>
          {showSteps ? 'Cerrar' : 'Ahora no'}
        </button>
      </div>
    </aside>
  );
}
