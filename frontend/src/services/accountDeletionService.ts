import {
  EmailAuthProvider,
  GoogleAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  signOut,
} from 'firebase/auth';
import { auth } from './firebase';

const getErrorCode = (error: unknown): string | undefined =>
  error && typeof error === 'object' && 'code' in error && typeof error.code === 'string'
    ? error.code
    : undefined;

const getDeletionErrorMessage = (error: unknown): string => {
  const code = getErrorCode(error);
  if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
    return 'La contraseña no es correcta. No se eliminó la cuenta.';
  }
  if (code === 'auth/popup-closed-by-user') {
    return 'Cerraste la verificación de Google. No se eliminó la cuenta.';
  }
  if (code === 'auth/popup-blocked') {
    return 'El navegador bloqueó la ventana de Google. Permite las ventanas emergentes e inténtalo de nuevo.';
  }
  if (code === 'auth/requires-recent-login' || code === 'RECENT_LOGIN_REQUIRED') {
    return 'Por seguridad, verifica tu identidad de nuevo e inténtalo otra vez.';
  }
  if (code === 'auth/network-request-failed') {
    return 'No se pudo conectar con el servicio de autenticación. Revisa tu conexión.';
  }
  return error instanceof Error
    ? error.message
    : 'No se pudo confirmar la eliminación. Inténtalo de nuevo o contacta soporte.';
};

export const deleteCurrentAccount = async (password?: string): Promise<void> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Tu sesión terminó. Inicia sesión nuevamente antes de continuar.');
  }

  try {
    const providers = currentUser.providerData.map((provider) => provider.providerId);
    if (providers.includes('password')) {
      if (!currentUser.email || !password) {
        throw new Error('Escribe tu contraseña actual para verificar tu identidad.');
      }
      await reauthenticateWithCredential(
        currentUser,
        EmailAuthProvider.credential(currentUser.email, password)
      );
    } else if (providers.includes('google.com')) {
      await reauthenticateWithPopup(currentUser, new GoogleAuthProvider());
    } else {
      throw new Error('Este método de acceso aún no admite la verificación necesaria para eliminar la cuenta.');
    }

    const token = await currentUser.getIdToken(true);
    const response = await fetch('/api/delete-account', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: '{}',
      cache: 'no-store',
    });
    const responseBody: unknown = await response.json();
    const message = responseBody && typeof responseBody === 'object' && 'error' in responseBody
      && typeof responseBody.error === 'string'
      ? responseBody.error
      : 'No se pudo confirmar la eliminación. Inténtalo de nuevo o contacta soporte.';

    if (!response.ok) {
      const error = new Error(message);
      if (
        responseBody && typeof responseBody === 'object' && 'code' in responseBody
        && typeof responseBody.code === 'string'
      ) {
        Object.assign(error, { code: responseBody.code });
      }
      throw error;
    }

    await signOut(auth);
  } catch (error) {
    throw new Error(getDeletionErrorMessage(error));
  }
};
