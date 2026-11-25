import { applyActionCode, checkActionCode, confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { auth } from '../services/firebase';

const actions = {
  resetPassword: { title: 'Crea una nueva contraseña', operation: 'PASSWORD_RESET', done: 'Tu contraseña se actualizó.' },
  verifyEmail: { title: 'Confirma tu correo', operation: 'VERIFY_EMAIL', done: 'Tu correo quedó confirmado.' },
  recoverEmail: { title: 'Recupera tu correo anterior', operation: 'RECOVER_EMAIL', done: 'Tu correo anterior se restauró.' },
  verifyAndChangeEmail: { title: 'Confirma tu nuevo correo', operation: 'VERIFY_AND_CHANGE_EMAIL', done: 'Tu correo se actualizó.' },
} as const;

type Action = keyof typeof actions;

export default function AccountAction() {
  const [link] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode') ?? '';
    return {
      mode: Object.prototype.hasOwnProperty.call(actions, mode) ? mode as Action : null,
      code: params.get('oobCode') ?? '',
    };
  });
  const [state, setState] = useState<'checking' | 'ready' | 'invalid' | 'done'>('checking');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const action = link.mode ? actions[link.mode] : null;

  useEffect(() => {
    window.history.replaceState(window.history.state, '', window.location.pathname);
    if (!action || !link.code) {
      setState('invalid');
      return;
    }
    let active = true;
    const verification = link.mode === 'resetPassword'
      ? verifyPasswordResetCode(auth, link.code).then(() => true)
      : checkActionCode(auth, link.code).then((info) => info.operation === action.operation);
    void verification.then((valid) => {
      if (active) setState(valid ? 'ready' : 'invalid');
    }, () => {
      if (active) setState('invalid');
    });
    return () => { active = false; };
  }, [action, link]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving || state !== 'ready') return;
    if (link.mode === 'resetPassword' && password !== confirmation) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (link.mode === 'resetPassword') await confirmPasswordReset(auth, link.code, password);
      else await applyActionCode(auth, link.code);
      setPassword('');
      setConfirmation('');
      setState('done');
    } catch (cause) {
      const code = (cause as { code?: string } | null)?.code;
      if (code === 'auth/expired-action-code' || code === 'auth/invalid-action-code') setState('invalid');
      else setError(code === 'auth/weak-password' || code === 'auth/password-does-not-meet-requirements'
        ? 'Prueba una contraseña más larga que combine letras, números y símbolos.'
        : 'No pudimos guardar el cambio. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className='mood-canvas grid min-h-dvh place-items-center px-4 py-10'>
      <section className='card w-full max-w-md space-y-6 rounded-3xl p-6 sm:p-9'>
        <Logo size='lg' />
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>{action?.title ?? 'Gestiona tu cuenta'}</h1>
          {state === 'checking' && <p className='mt-2 text-sm' role='status'>Verificando el enlace…</p>}
          {state === 'done' && <p className='mt-2' role='status'>{action?.done}</p>}
          {state === 'invalid' && <p className='mt-2' role='alert'>Este enlace venció, ya se usó o no es válido. Abre el correo más reciente o solicita un enlace nuevo.</p>}
        </div>
        {state === 'ready' && (
          <form className='space-y-4' onSubmit={submit}>
            {link.mode === 'resetPassword' && (
              <>
                <label className='block text-sm font-semibold'>Nueva contraseña
                  <input className='input-field mt-1 bg-[var(--mood-surface)]' type={visible ? 'text' : 'password'} autoComplete='new-password' minLength={6} required value={password} onChange={(event) => setPassword(event.target.value)} />
                </label>
                <label className='block text-sm font-semibold'>Repite la contraseña
                  <input className='input-field mt-1 bg-[var(--mood-surface)]' type={visible ? 'text' : 'password'} autoComplete='new-password' required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
                </label>
                <label className='flex min-h-10 items-center gap-2 text-sm'><input type='checkbox' checked={visible} onChange={(event) => setVisible(event.target.checked)} /> Mostrar contraseñas</label>
              </>
            )}
            {error && <p role='alert' className='text-sm text-red-700 dark:text-red-300'>{error}</p>}
            <button type='submit' disabled={saving} className='btn-primary w-full disabled:opacity-60'>{saving ? 'Guardando…' : link.mode === 'resetPassword' ? 'Guardar contraseña' : 'Confirmar cambio'}</button>
          </form>
        )}
        {state === 'invalid' && link.mode === 'resetPassword' && <Link className='btn-primary block text-center' to='/forgot-password'>Solicitar otro enlace</Link>}
        <Link className='inline-block text-sm font-semibold underline underline-offset-4' to='/login'>Volver a iniciar sesión</Link>
      </section>
    </main>
  );
}

