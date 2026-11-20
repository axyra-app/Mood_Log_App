import { auth } from './firebase';
import { apiUrl } from './apiUrl';
import { SENSITIVE_SELF_REPORT_CONSENT_VERSION } from '../utils/legalVersions';

interface ConsentResponse { accepted?: boolean; version?: string; error?: string; }

const requestConsent = async (method: 'GET' | 'POST' | 'DELETE'): Promise<ConsentResponse> => {
  const user = auth.currentUser;
  if (!user) throw new Error('Inicia sesión para gestionar esta autorización.');
  const token = await user.getIdToken();
  let response: Response;
  try {
    response = await fetch(apiUrl('/api/sensitive-data-consent'), {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(method === 'POST' ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(method === 'POST' ? {
        body: JSON.stringify({ accepted: true, version: SENSITIVE_SELF_REPORT_CONSENT_VERSION }),
      } : {}),
      cache: 'no-store',
    });
  } catch {
    throw new Error('No se pudo conectar para gestionar la autorización. Inténtalo de nuevo.');
  }
  let payload: ConsentResponse;
  try { payload = await response.json() as ConsentResponse; }
  catch { throw new Error('El servidor no pudo confirmar el estado de la autorización.'); }
  if (!response.ok) throw new Error(payload.error || 'No se pudo gestionar la autorización.');
  return payload;
};

export const hasCurrentSensitiveSelfReportConsent = async (): Promise<boolean> => {
  const result = await requestConsent('GET');
  return result.accepted === true && result.version === SENSITIVE_SELF_REPORT_CONSENT_VERSION;
};

export const grantSensitiveSelfReportConsent = async (): Promise<void> => {
  const result = await requestConsent('POST');
  if (result.accepted !== true || result.version !== SENSITIVE_SELF_REPORT_CONSENT_VERSION) {
    throw new Error('El servidor no confirmó la autorización vigente.');
  }
};

export const revokeSensitiveSelfReportConsent = async (): Promise<void> => {
  const result = await requestConsent('DELETE');
  if (result.accepted !== false || result.version !== SENSITIVE_SELF_REPORT_CONSENT_VERSION) {
    throw new Error('El servidor no confirmó el retiro de la autorización.');
  }
};
