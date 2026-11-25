import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../services/firebase';
import { downloadDailyReminder } from '../utils/dailyReminder';

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
  const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => {
    if (!uid) return;
    let active = true;
    setPublicKey('');
    setSavedTime(null);
    void reminderRequest(uid).then((data) => {
      if (!active) return;
      setPublicKey(data.publicKey);
      setSavedTime(data.time);
      setTime(data.time || '19:00');
    }).catch(() => { if (active) setNotice('Las notificaciones push aún no están disponibles.'); });
    return () => { active = false; };
  }, [uid]);

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
        userVisibleOnly: true, applicationServerKey: publicKey,
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
      <input type='time' value={time} onChange={(event) => setTime(event.target.value)} className='input-field mt-1 block max-w-48' />
    </label>
    <p className='text-xs text-[var(--mood-text-muted)]'>{timeZone}</p>
    <div className='flex flex-wrap gap-2'>
      <button type='button' className='btn-primary disabled:opacity-50' onClick={() => void save()} disabled={busy || !time || !supported || !publicKey}>
        {savedTime ? 'Guardar hora en este dispositivo' : 'Activar notificaciones'}
      </button>
      {savedTime && <button type='button' className='min-h-11 rounded-xl border px-4' onClick={() => void disable()} disabled={busy}>Desactivar notificaciones</button>}
      <button type='button' className='min-h-11 rounded-xl border px-4' disabled={!time} onClick={() => downloadDailyReminder(time)}>Agregar al calendario</button>
    </div>
    {!supported && <p className='text-sm'>Si usas iPhone, agrega Mood Log a tu pantalla de inicio y vuelve desde el ícono.</p>}
    {notice && <p className='text-sm' role='status'>{notice}</p>}
    <p className='text-xs text-[var(--mood-text-muted)]'>Los eventos que agregaste al calendario se eliminan desde el calendario.</p>
  </>;
}
