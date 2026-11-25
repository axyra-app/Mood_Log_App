import { sendPasswordResetEmail } from 'firebase/auth';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../services/firebase';

export default function ChangePassword() {
  const { user } = useAuth();
  const account = auth.currentUser;
  const email = account?.uid === user?.uid && account?.email;
  const canSend = email && account?.providerData.some((provider) => provider.providerId === 'password');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const sendLink = async () => {
    if (!email || !canSend || sending || sent) return;
    setSending(true);
    setError('');
    try {
      await sendPasswordResetEmail(auth, email, {
        url: new URL('/login', window.location.origin).href,
        handleCodeInApp: false,
      });
      setSent(true);
    } catch {
      setError('No pudimos enviar el enlace. Espera un momento y vuelve a intentarlo.');
    } finally {
      setSending(false);
    }
  };

  return (
    <main className='mood-canvas grid min-h-dvh place-items-center px-4 py-10'>
      <section className='card w-full max-w-md space-y-5 rounded-3xl p-6 sm:p-9'>
        <Logo size='lg' />
        <h1 className='text-2xl font-bold'>Cambia tu contraseña</h1>
        {canSend ? (
          <>
            <p className='break-words text-sm text-[var(--mood-text-muted)]'>
              Enviaremos un enlace de un solo uso a <strong>{email}</strong>. Ábrelo para crear tu nueva contraseña.
            </p>
            {sent ? <p role='status'>Enlace enviado. Revisa también la carpeta de spam.</p> : (
              <button type='button' className='btn-primary w-full disabled:opacity-60' disabled={sending} onClick={() => void sendLink()}>
                {sending ? 'Enviando…' : 'Enviar enlace de confirmación'}
              </button>
            )}
          </>
        ) : <p>Tu proveedor de inicio de sesión gestiona la contraseña de esta cuenta.</p>}
        {error && <p role='alert' className='text-sm text-red-700 dark:text-red-300'>{error}</p>}
        <Link to='/settings' className='inline-block text-sm font-semibold underline underline-offset-4'>Volver a Configuración</Link>
      </section>
    </main>
  );
}
