import { auth } from './firebase';
import { PRIVACY_NOTICE_VERSION, TERMS_VERSION } from '../utils/legalVersions';
import { apiUrl } from './apiUrl';

export type LegalAcceptanceChannel = 'email' | 'google';
export type LegalAcceptanceFlow = 'registration' | 'renewal';

interface LegalAcceptanceResponse {
  error?: string;
  accepted?: boolean;
}

export const recordCurrentLegalAcceptance = async (
  flow: LegalAcceptanceFlow = 'registration',
): Promise<void> => {
  const user = auth.currentUser;
  if (!user) throw new Error('Inicia sesión nuevamente para guardar esta aceptación.');

  const identityProvider: LegalAcceptanceChannel = user.providerData.some(
    (provider) => provider.providerId === 'google.com',
  ) ? 'google' : 'email';
  const token = await user.getIdToken();
  let response: Response;
  try {
    response = await fetch(apiUrl('/api/legal-acceptance'), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accepted: true,
        termsVersion: TERMS_VERSION,
        privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
        identityProvider,
        flow,
      }),
    });
  } catch {
    throw new Error('No se pudo conectar para guardar la aceptación. Reinténtalo.');
  }

  let payload: LegalAcceptanceResponse;
  try {
    payload = await response.json() as LegalAcceptanceResponse;
  } catch {
    throw new Error('El servidor no confirmó el registro de aceptación. Reinténtalo.');
  }

  if (!response.ok || payload.accepted !== true) {
    throw new Error(payload.error || 'No se pudo guardar la aceptación. Reinténtalo.');
  }
};

export const hasCurrentLegalAcceptance = async (): Promise<boolean> => {
  const user = auth.currentUser;
  if (!user) throw new Error('Inicia sesión para consultar la aceptación vigente.');

  const token = await user.getIdToken();
  let response: Response;
  try {
    response = await fetch(apiUrl('/api/legal-acceptance'), {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
  } catch {
    throw new Error('No se pudo comprobar la aceptación vigente. Reinténtalo.');
  }

  let payload: LegalAcceptanceResponse;
  try {
    payload = await response.json() as LegalAcceptanceResponse;
  } catch {
    throw new Error('El servidor no pudo comprobar la aceptación vigente.');
  }
  if (!response.ok) {
    throw new Error(payload.error || 'No se pudo comprobar la aceptación vigente.');
  }
  return payload.accepted === true;
};
