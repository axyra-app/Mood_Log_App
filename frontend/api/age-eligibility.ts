import { getAuth } from 'firebase-admin/auth';
import { FieldValue, Timestamp, getFirestore } from 'firebase-admin/firestore';
import { withApiCors } from './_lib/apiCors.ts';
import { getFirebaseAdminApp } from './_lib/firebaseAdmin.ts';
import { isInvalidFirebaseIdTokenError, readRequestBodyWithinLimit } from './_lib/requestUtils.ts';
import { ADULT_ELIGIBILITY_VERSION } from '../src/utils/legalVersions.ts';

const MAX_BODY_BYTES = 1_000;

interface Services {
  auth: { verifyIdToken(token: string, checkRevoked?: boolean): Promise<{ uid?: unknown }> };
  firestore: ReturnType<typeof getFirestore>;
}

const json = (status: number, body: unknown): Response => Response.json(body, {
  status,
  headers: { 'Cache-Control': 'no-store' },
});

const safeError = (error: unknown): string => {
  if (!error || typeof error !== 'object' || !('code' in error)) {
    return error instanceof Error ? error.name : 'UnknownError';
  }
  const code = error.code;
  return typeof code === 'string' && /^[A-Za-z0-9/_-]{1,80}$/.test(code)
    ? code
    : error instanceof Error ? error.name : 'UnknownError';
};

const hasValidEligibility = (value: unknown): boolean => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const marker = value as Record<string, unknown>;
  return marker.isAdult === true
    && marker.version === ADULT_ELIGIBILITY_VERSION
    && marker.attestedAt instanceof Timestamp;
};

export const createAgeEligibilityHandler = (getServices: () => Promise<Services>) =>
  async (request: Request): Promise<Response> => {
    if (request.method !== 'POST') {
      return json(405, { error: 'Método no permitido.' });
    }

    const authorization = request.headers.get('authorization') || '';
    const token = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : '';
    if (!token) return json(401, { error: 'Inicia sesión para confirmar tu edad.' });

    let rawBody: string | null;
    try {
      rawBody = await readRequestBodyWithinLimit(request, MAX_BODY_BYTES);
    } catch {
      return json(400, { error: 'No se pudo leer la solicitud.' });
    }
    if (rawBody === null) return json(413, { error: 'La solicitud supera el tamaño permitido.' });

    let body: unknown;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return json(400, { error: 'La solicitud no es válida.' });
    }
    if (
      !body
      || typeof body !== 'object'
      || Array.isArray(body)
      || (body as Record<string, unknown>).confirmedAdult !== true
      || (body as Record<string, unknown>).version !== ADULT_ELIGIBILITY_VERSION
    ) {
      return json(400, { error: 'Confirma que tienes 18 años o más para continuar.' });
    }

    try {
      const services = await getServices();
      let decoded: { uid?: unknown };
      try {
        decoded = await services.auth.verifyIdToken(token, true);
      } catch (error) {
        if (isInvalidFirebaseIdTokenError(safeError(error))) {
          return json(401, { error: 'Tu sesión no es válida. Inicia sesión nuevamente.' });
        }
        console.error('Age eligibility authentication failed:', safeError(error));
        return json(503, { error: 'No pudimos verificar tu sesión. Inténtalo de nuevo.' });
      }
      if (typeof decoded.uid !== 'string' || !decoded.uid) {
        return json(401, { error: 'No se pudo verificar la cuenta autenticada.' });
      }

      const profileRef = services.firestore.collection('users').doc(decoded.uid);
      const deletionRef = services.firestore.collection('accountDeletionRequests').doc(decoded.uid);
      const outcome = await services.firestore.runTransaction(async (transaction) => {
        const [profile, deletion] = await Promise.all([
          transaction.get(profileRef),
          transaction.get(deletionRef),
        ]);
        if (!profile.exists) return 'profile-missing';
        if (deletion.exists) return 'deleting';
        if (hasValidEligibility(profile.data()?.adultEligibility)) return 'already-confirmed';

        transaction.set(profileRef, {
          adultEligibility: {
            isAdult: true,
            version: ADULT_ELIGIBILITY_VERSION,
            attestedAt: FieldValue.serverTimestamp(),
          },
          updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });
        return 'confirmed';
      });

      if (outcome === 'profile-missing') return json(404, { error: 'No se encontró el perfil de esta cuenta.' });
      if (outcome === 'deleting') return json(403, { error: 'La cuenta está en proceso de eliminación.' });
      return json(200, { confirmed: true });
    } catch (error) {
      console.error('Age eligibility recording failed:', safeError(error));
      return json(503, { error: 'No se pudo guardar la confirmación. Reintenta o inicia sesión otra vez.' });
    }
  };

const getServices = async (): Promise<Services> => {
  const app = getFirebaseAdminApp();
  return { auth: getAuth(app), firestore: getFirestore(app) };
};

export default {
  fetch: withApiCors(createAgeEligibilityHandler(getServices)),
};
