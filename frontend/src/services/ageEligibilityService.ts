import { auth } from './firebase';
import { ADULT_ELIGIBILITY_VERSION } from '../utils/legalVersions';
import { apiUrl } from './apiUrl';

export const saveAdultEligibility = async (expectedUid: string): Promise<void> => {
  const currentUser = auth.currentUser;
  if (currentUser?.uid !== expectedUid) throw new Error('Inicia sesión nuevamente para confirmar tu edad.');

  const token = await currentUser.getIdToken();
  const response = await fetch(apiUrl('/api/age-eligibility'), {
    method: 'POST',
    signal: AbortSignal.timeout(20000),
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      confirmedAdult: true,
      version: ADULT_ELIGIBILITY_VERSION,
    }),
  });

  let body: { confirmed?: unknown; error?: unknown };
  try {
    body = await response.json() as { confirmed?: unknown; error?: unknown };
  } catch {
    throw new Error(`El servidor respondió con HTTP ${response.status}. Reintenta.`);
  }

  if (!body || typeof body !== 'object' || !response.ok || body.confirmed !== true) {
    throw new Error(typeof body?.error === 'string' ? body.error : 'No se pudo guardar la confirmación.');
  }
};
