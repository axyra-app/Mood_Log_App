import { getAuth } from 'firebase-admin/auth';
import { FieldValue, Timestamp, getFirestore } from 'firebase-admin/firestore';
import { withApiCors } from './_lib/apiCors.ts';
import {
  isInvalidFirebaseIdTokenError,
  readRequestBodyWithinLimit,
} from './_lib/requestUtils.ts';
import { getFirebaseAdminApp } from './_lib/firebaseAdmin.ts';
import {
  getLegalAcceptanceEventId,
  hasCurrentLegalAcceptance,
  isCurrentLegalAcceptanceEvent,
} from './_lib/legalAcceptance.ts';
import {
  ADULT_ELIGIBILITY_VERSION,
  PRIVACY_NOTICE_VERSION,
  TERMS_VERSION,
} from '../src/utils/legalVersions.ts';

const MAX_BODY_BYTES = 2_000;

interface LegalAcceptanceBody {
  accepted?: unknown;
  termsVersion?: unknown;
  privacyNoticeVersion?: unknown;
  identityProvider?: unknown;
  flow?: unknown;
}

interface VerifiedToken {
  uid?: unknown;
}

interface LegalAcceptanceServices {
  auth: {
    verifyIdToken(token: string, checkRevoked?: boolean): Promise<VerifiedToken>;
  };
  firestore: ReturnType<typeof getFirestore>;
}

interface HandlerDependencies {
  getServices(): Promise<LegalAcceptanceServices>;
}

const jsonResponse = (status: number, body: unknown, headers: HeadersInit = {}): Response =>
  Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store', ...headers },
  });

const getSafeErrorCode = (error: unknown): string => {
  if (!error || typeof error !== 'object' || !('code' in error)) {
    return error instanceof Error ? error.name : 'UnknownError';
  }
  const code = error.code;
  return typeof code === 'string' && /^[A-Za-z0-9/_-]{1,80}$/.test(code)
    ? code
    : error instanceof Error ? error.name : 'UnknownError';
};

const parseBody = (rawBody: string | null): LegalAcceptanceBody | null => {
  if (!rawBody) return null;
  try {
    const parsed: unknown = JSON.parse(rawBody);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed as LegalAcceptanceBody
      : null;
  } catch {
    return null;
  }
};

const getAdminServices = async (): Promise<LegalAcceptanceServices> => {
  const app = getFirebaseAdminApp();
  return { auth: getAuth(app), firestore: getFirestore(app) };
};

export const createLegalAcceptanceHandler = (
  dependencies: HandlerDependencies,
) => async (request: Request): Promise<Response> => {
  if (!['GET', 'POST'].includes(request.method)) {
    return jsonResponse(405, { error: 'Método no permitido.' }, { Allow: 'GET, POST' });
  }

  const authorization = request.headers.get('authorization') || '';
  const token = authorization.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length).trim()
    : '';
  if (!token) return jsonResponse(401, { error: 'Inicia sesión para continuar.' });

  try {
    const services = await dependencies.getServices();
    let decodedToken: VerifiedToken;
    try {
      decodedToken = await services.auth.verifyIdToken(token, true);
    } catch (error) {
      const errorCode = getSafeErrorCode(error);
      if (isInvalidFirebaseIdTokenError(errorCode)) {
        return jsonResponse(401, { error: 'Tu sesión no es válida. Inicia sesión nuevamente.' });
      }
      console.error('Legal acceptance authentication failed:', errorCode);
      return jsonResponse(503, { error: 'No pudimos verificar tu sesión. Inténtalo de nuevo.' });
    }

    if (typeof decodedToken.uid !== 'string' || decodedToken.uid.length === 0) {
      return jsonResponse(401, { error: 'No se pudo verificar la cuenta autenticada.' });
    }
    const uid = decodedToken.uid;
    const profileRef = services.firestore.collection('users').doc(uid);
    const deletionRef = services.firestore.collection('accountDeletionRequests').doc(uid);
    const [profileSnapshot, deletionSnapshot] = await Promise.all([
      profileRef.get(),
      deletionRef.get(),
    ]);
    const eligibility = profileSnapshot.data()?.adultEligibility;
    if (
      !profileSnapshot.exists
      || eligibility?.isAdult !== true
      || eligibility.version !== ADULT_ELIGIBILITY_VERSION
      || !(eligibility.attestedAt instanceof Timestamp)
    ) {
      return jsonResponse(403, { error: 'Completa la confirmación de edad antes de continuar.' });
    }
    if (deletionSnapshot.exists) {
      return jsonResponse(403, { error: 'La cuenta está en proceso de eliminación.' });
    }

    const eventRef = services.firestore
      .collection('legalAcceptanceEvents')
      .doc(getLegalAcceptanceEventId(uid));
    if (request.method === 'GET') {
      const accepted = await hasCurrentLegalAcceptance(services.firestore, uid);
      return jsonResponse(200, {
        accepted,
        termsVersion: TERMS_VERSION,
        privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
      });
    }

    let rawBody: string | null;
    try {
      rawBody = await readRequestBodyWithinLimit(request, MAX_BODY_BYTES);
    } catch {
      return jsonResponse(400, { error: 'No se pudo leer la solicitud.' });
    }
    if (rawBody === null) return jsonResponse(413, { error: 'La solicitud supera el tamaño permitido.' });

    const body = parseBody(rawBody);
    if (
      !body
      || body.accepted !== true
      || body.termsVersion !== TERMS_VERSION
      || body.privacyNoticeVersion !== PRIVACY_NOTICE_VERSION
      || !['email', 'google'].includes(String(body.identityProvider))
      || !['registration', 'renewal'].includes(String(body.flow))
    ) {
      return jsonResponse(400, { error: 'No se pudieron validar las versiones de aceptación actuales.' });
    }

    const transactionRejection = await services.firestore.runTransaction(async (transaction) => {
      const [currentProfile, currentDeletion, existing] = await Promise.all([
        transaction.get(profileRef),
        transaction.get(deletionRef),
        transaction.get(eventRef),
      ]);
      if (!currentProfile.exists) return 'profile';
      if (currentDeletion.exists) return 'deleting';

      const currentEligibility = currentProfile.data()?.adultEligibility;
      if (
        currentEligibility?.isAdult !== true
        || currentEligibility.version !== ADULT_ELIGIBILITY_VERSION
        || !(currentEligibility.attestedAt instanceof Timestamp)
      ) return 'eligibility';

      if (existing.exists) {
        const data = existing.data();
        if (
          data?.userId !== uid
          || data?.termsVersion !== TERMS_VERSION
          || data?.privacyNoticeVersion !== PRIVACY_NOTICE_VERSION
        ) {
          throw new Error('Legal acceptance event key collision.');
        }
      }

      const currentAcceptance = currentProfile.data()?.legalAcceptance;
      const acceptanceAlreadyCurrent = existing.exists
        && isCurrentLegalAcceptanceEvent(existing.data(), uid)
        && currentAcceptance?.termsVersion === TERMS_VERSION
        && currentAcceptance?.privacyNoticeVersion === PRIVACY_NOTICE_VERSION
        && currentAcceptance?.acceptedAt instanceof Timestamp;
      if (acceptanceAlreadyCurrent) return 'unchanged';

      if (!existing.exists) {
        transaction.create(eventRef, {
          userId: uid,
          termsVersion: TERMS_VERSION,
          privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
          channel: body.flow,
          identityProvider: body.identityProvider,
          acceptedAt: FieldValue.serverTimestamp(),
        });
      }

      transaction.set(profileRef, {
        legalAcceptance: {
          termsVersion: TERMS_VERSION,
          privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
          acceptedAt: FieldValue.serverTimestamp(),
        },
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
      return 'recorded';
    });

    if (transactionRejection === 'profile') {
      return jsonResponse(404, { error: 'No se encontró el perfil de esta cuenta.' });
    }
    if (transactionRejection === 'deleting') {
      return jsonResponse(403, { error: 'La cuenta está en proceso de eliminación.' });
    }
    if (transactionRejection === 'eligibility') {
      return jsonResponse(403, { error: 'Completa la confirmación de edad antes de continuar.' });
    }

    return jsonResponse(200, { accepted: true });
  } catch (error) {
    console.error('Legal acceptance recording failed:', getSafeErrorCode(error));
    return jsonResponse(503, {
      error: 'No se pudo confirmar el registro de aceptación. Reinténtalo antes de continuar.',
    });
  }
};

export default {
  fetch: withApiCors(createLegalAcceptanceHandler({ getServices: getAdminServices })),
};
