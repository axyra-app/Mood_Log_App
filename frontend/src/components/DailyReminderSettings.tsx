import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../services/firebase';
import { downloadDailyReminder, googleCalendarReminderUrl } from '../utils/dailyReminder';

function decodePushKey(key: string): ArrayBuffer {
  const base64 = key.replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')), (char) => char.charCodeAt(0)).buffer;
}

async function reminderRequest(uid: string, method = 'GET', body?: unknown) {
  const user = auth.currentUser;
  if (user?.uid !== uid) throw new Error('Vuelve a iniciar sesión.');
  const response = await fetch('/api/push-reminders', {
    method, signal: AbortSignal.timeout(12000),
    headers: { Authorization: 'Bearer ' + await user.getIdToken(), 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) throw new Error('No pudimos conectar con el servicio de recordatorios.');
  return response.json() as Promise<{ publicKey: string; time: string | null; timeZone: string | null }>;
}

export default function DailyReminderSettings() {
  const { user } = useAuth();
  const uid = user?.uid;
  const [time, setTime] = useState('19:00');
  const [savedTime, setSavedTime] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  const iPhoneOrPad = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const calendarUrl = googleCalendarReminderUrl(time);

  useEffect(() => {
    if (!uid) return;
    let active = true;
    setLoadState('loading');
    setNotice('');
    setPublicKey('');
    setSavedTime(null);
    void reminderRequest(uid).then((data) => {
      if (!active) return;
      setPublicKey(data.publicKey);
      setSavedTime(data.time);
      setTime(data.time || '19:00');
      setLoadState('ready');
    }).catch(() => { if (active) setLoadState('error'); });
    return () => { active = false; };
  }, [uid, loadAttempt]);

  const save = async () => {
    if (!uid || !supported || !time || !publicKey || busy) return;
    setBusy(true);
    setNotice('');
    try {
      const permission = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
      if (permission !== 'granted') throw new Error('Permite las notificaciones de Mood Log en tu dispositivo.');
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration?.active) throw new Error('Recarga Mood Log y vuelve a intentarlo.');
      const existing = await registration.pushManager.getSubscription();
      const subscription = existing ?? await registration.pushManager.subscribe({
        userVisibleOnly: true, applicationServerKey: decodePushKey(publicKey),
      });
      await reminderRequest(uid, 'PUT', { subscription: subscription.toJSON(), time, timeZone });
      setSavedTime(time);
      setNotice('Recordatorio guardado para este dispositivo.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'No pudimos activar el recordatorio.');
    } finally { setBusy(false); }
  };

  const disable = async () => {
    if (!uid || busy) return;
    setBusy(true);
    try {
      await reminderRequest(uid, 'DELETE');
      setSavedTime(null);
      setNotice('Recordatorio push desactivado.');
    } catch { setNotice('No pudimos desactivarlo. Vuelve a intentarlo.'); }
    finally { setBusy(false); }
  };

  return <>
    <h2 id='recordatorio-titulo' className='text-lg font-semibold'>Recordatorio diario</h2>
    <p className='text-sm text-[var(--mood-text-muted)]'>Recibe «¿Cómo va tu día?» en el dispositivo que elijas.</p>
    <label className='block text-sm font-semibold'>
      Hora del recordatorio
      <input type='time' value={time} onChange={(event) => setTime(event.target.value)} className='input-field mt-1 block min-w-0 !w-full !max-w-48' />
    </label>
    <p className='text-xs text-[var(--mood-text-muted)]'>Zona horaria de este dispositivo: {timeZone}</p>
    {savedTime && <p className='text-sm text-[var(--mood-text-muted)]'>Hora guardada: {savedTime}. Si guardas desde otro dispositivo, los avisos llegarán al último que guardes.</p>}
    <div className='flex flex-wrap gap-2'>
      {supported && loadState === 'ready' && <button type='button' className='btn-primary disabled:opacity-50' onClick={() => void save()} disabled={busy || !time || !publicKey}>
        {busy ? 'Procesando…' : savedTime ? 'Guardar hora en este dispositivo' : 'Activar notificaciones'}
      </button>}
      {savedTime && <button type='button' className='min-h-11 rounded-xl border px-4' onClick={() => void disable()} disabled={busy}>Desactivar notificaciones</button>}
    </div>
    {supported && loadState === 'loading' && <p role='status' className='text-sm'>Consultando tu recordatorio…</p>}
    {supported && loadState === 'error' && <div role='status' className='text-sm'>No pudimos consultar tu recordatorio. <button type='button' className='min-h-11 font-semibold underline' onClick={() => setLoadAttempt((attempt) => attempt + 1)}>Reintentar</button></div>}
    {!supported && iPhoneOrPad && <details className='text-sm'><summary className='cursor-pointer font-semibold'>Cómo activar avisos en iPhone o iPad</summary><p className='mt-2'>Abre Mood Log desde su ícono en la pantalla de inicio y vuelve a Configuración. Si aún no tienes el ícono, en Safari toca Compartir → Agregar a pantalla de inicio.</p></details>}
    {!supported && !iPhoneOrPad && <p className='text-sm'>Este navegador no admite avisos de Mood Log. Puedes usar el calendario.</p>}
    {notice && <p className='text-sm' role='status'>{notice}</p>}
    <details className='border-t border-[var(--mood-border)] pt-3 text-sm'>
      <summary className='cursor-pointer font-semibold'>Usar un calendario</summary>
      <p className='mt-2 text-[var(--mood-text-muted)]'>Guarda el evento y activa una alerta en tu calendario. Descargar el archivo por sí solo no activa el recordatorio.</p>
      <div className='mt-2 flex flex-wrap gap-2'>
        {calendarUrl && <a href={calendarUrl} target='_blank' rel='noopener noreferrer' className='inline-flex min-h-11 items-center rounded-xl border px-4'>Abrir en Google Calendar</a>}
        <button type='button' className='min-h-11 rounded-xl border px-4' disabled={!time} onClick={() => downloadDailyReminder(time)}>Descargar archivo .ics</button>
      </div>
    </details>
  </>;
}
