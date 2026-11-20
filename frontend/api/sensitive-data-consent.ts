import { getAuth } from 'firebase-admin/auth';
import { FieldValue, Timestamp, getFirestore } from 'firebase-admin/firestore';
import { withApiCors } from './_lib/apiCors.ts';
import { ADULT_ELIGIBILITY_VERSION, SENSITIVE_SELF_REPORT_CONSENT_VERSION } from '../src/utils/legalVersions.ts';
import { getFirebaseAdminApp } from './_lib/firebaseAdmin.ts';
import {
  getLegalAcceptanceEventId,
  hasCurrentLegalAcceptance,
  isCurrentLegalAcceptanceEvent,
} from './_lib/legalAcceptance.ts';
import { hasCurrentSensitiveSelfReportConsent } from './_lib/sensitiveDataConsent.ts';
import { readRequestBodyWithinLimit } from './_lib/requestUtils.ts';

interface ConsentBody { accepted?: unknown; version?: unknown; }
interface Services {
  auth: { verifyIdToken(token: string, checkRevoked?: boolean): Promise<{ uid?: unknown }> };
  firestore: ReturnType<typeof getFirestore>;
}

const response = (status: number, body: unknown) => Response.json(body, {
  status,
  headers: { 'Cache-Control': 'no-store' },
});

const safeError = (error: unknown): string => {
  if (!error || typeof error !== 'object' || !('code' in error)) return error instanceof Error ? error.name : 'UnknownError';
  return typeof error.code === 'string' && /^[A-Za-z0-9/_-]{1,80}$/.test(error.code)
    ? error.code : error instanceof Error ? error.name : 'UnknownError';
};

export const createSensitiveDataConsentHandler = (getServices: () => Promise<Services>) =>
  async (request: Request): Promise<Response> => {
    if (!['GET', 'POST', 'DELETE'].includes(request.method)) {
      return response(405, { error: 'Método no permitido.' });
    }
    const authorization = request.headers.get('authorization') || '';
    const token = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : '';
    if (!token) return response(401, { error: 'Inicia sesión para continuar.' });

    try {
      const services = await getServices();
      let decoded: { uid?: unknown };
      try {
        decoded = await services.auth.verifyIdToken(token, true);
      } catch (error) {
        console.error('Sensitive data consent authentication failed:', safeError(error));
        return response(401, { error: 'Tu sesión no es válida. Inicia sesión nuevamente.' });
      }
      if (typeof decoded.uid !== 'string' || !decoded.uid) {
        return response(401, { error: 'No se pudo verificar la cuenta autenticada.' });
      }
      const uid = decoded.uid;
      const profileRef = services.firestore.collection('users').doc(uid);
      const deletionRef = services.firestore.collection('accountDeletionRequests').doc(uid);
      const [profileSnapshot, deletionSnapshot] = await Promise.all([
        profileRef.get(),
        deletionRef.get(),
      ]);
      const eligibility = profileSnapshot.data()?.adultEligibility;
      if (!profileSnapshot.exists) return response(404, { error: 'No se encontró el perfil de esta cuenta.' });
      if (deletionSnapshot.exists) return response(403, { error: 'La cuenta está en proceso de eliminación.' });
      if (request.method === 'GET') {
        const accepted = await hasCurrentSensitiveSelfReportConsent(services.firestore, uid);
        return response(200, { accepted, version: SENSITIVE_SELF_REPORT_CONSENT_VERSION });
      }

      if (request.method === 'POST' && !(await hasCurrentLegalAcceptance(services.firestore, uid))) {
        return response(403, { error: 'Confirma primero los términos y el aviso de privacidad vigentes.' });
      }
      if (request.method === 'POST'
        && (eligibility?.isAdult !== true
          || eligibility.version !== ADULT_ELIGIBILITY_VERSION
          || !(eligibility.attestedAt instanceof Timestamp))) {
        return response(403, { error: 'Completa la confirmación de edad antes de autorizar este tratamiento.' });
      }

      let decision: 'accepted' | 'revoked';
      if (request.method === 'POST') {
        let body: ConsentBody;
        try {
          const raw = await readRequestBodyWithinLimit(request, 2_000);
          if (raw === null) return response(413, { error: 'La solicitud supera el tamaño permitido.' });
          body = JSON.parse(raw) as ConsentBody;
        } catch {
          return response(400, { error: 'No se pudo leer la solicitud.' });
        }
        if (body.accepted !== true || body.version !== SENSITIVE_SELF_REPORT_CONSENT_VERSION) {
          return response(400, { error: 'No se pudo validar la versión de autorización vigente.' });
        }
        decision = 'accepted';
      } else {
        decision = 'revoked';
      }

      const eventRef = services.firestore.collection('sensitiveDataConsentEvents').doc();
      const legalEventRef = request.method === 'POST'
        ? services.firestore.collection('legalAcceptanceEvents').doc(getLegalAcceptanceEventId(uid))
        : null;
      const transactionRejection = await services.firestore.runTransaction(async (transaction) => {
        const [currentProfile, currentDeletion, currentLegalEvent] = await Promise.all([
          transaction.get(profileRef),
          transaction.get(deletionRef),
          legalEventRef ? transaction.get(legalEventRef) : Promise.resolve(null),
        ]);
        if (!currentProfile.exists) return 'profile';
        if (currentDeletion.exists) return 'deleting';

        const currentProfileData = currentProfile.data();
        if (request.method === 'POST') {
          const currentEligibility = currentProfileData?.adultEligibility;
          if (
            currentEligibility?.isAdult !== true
            || currentEligibility.version !== ADULT_ELIGIBILITY_VERSION
            || !(currentEligibility.attestedAt instanceof Timestamp)
          ) return 'eligibility';

          const currentLegalAcceptance = currentProfileData?.legalAcceptance;
          const currentLegalEventData = currentLegalEvent?.data();
          if (
            !currentLegalEvent?.exists
            || !isCurrentLegalAcceptanceEvent(currentLegalEventData, uid)
            || currentLegalAcceptance?.termsVersion !== currentLegalEventData?.termsVersion
            || currentLegalAcceptance?.privacyNoticeVersion !== currentLegalEventData?.privacyNoticeVersion
            || !(currentLegalAcceptance?.acceptedAt instanceof Timestamp)
          ) return 'legal';
        }

        const currentConsent = currentProfileData?.sensitiveSelfReportConsent;
        if (
          currentConsent?.version === SENSITIVE_SELF_REPORT_CONSENT_VERSION
          && currentConsent.decision === decision
          && typeof currentConsent.eventId === 'string'
        ) {
          const currentEvent = await transaction.get(
            services.firestore.collection('sensitiveDataConsentEvents').doc(currentConsent.eventId),
          );
          const currentEventData = currentEvent.data();
          if (
            currentEvent.exists
            && currentEventData?.userId === uid
            && currentEventData?.version === SENSITIVE_SELF_REPORT_CONSENT_VERSION
            && currentEventData?.decision === decision
            && currentEventData?.recordedAt instanceof Timestamp
          ) return 'unchanged';
        }

        transaction.create(eventRef, {
          userId: uid,
          version: SENSITIVE_SELF_REPORT_CONSENT_VERSION,
          decision,
          recordedAt: FieldValue.serverTimestamp(),
        });
        transaction.set(profileRef, {
          sensitiveSelfReportConsent: {
            version: SENSITIVE_SELF_REPORT_CONSENT_VERSION,
            decision,
            eventId: eventRef.id,
            changedAt: FieldValue.serverTimestamp(),
          },
          updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });
        return null;
      });
      if (transactionRejection === 'profile') {
        return response(404, { error: 'No se encontró el perfil de esta cuenta.' });
      }
      if (transactionRejection === 'deleting') {
        return response(403, { error: 'La cuenta está en proceso de eliminación.' });
      }
      if (transactionRejection === 'eligibility') {
        return response(403, { error: 'Completa la confirmación de edad antes de autorizar este tratamiento.' });
      }
      if (transactionRejection === 'legal') {
        return response(403, { error: 'Confirma primero los términos y el aviso de privacidad vigentes.' });
      }
      return response(200, { accepted: decision === 'accepted', version: SENSITIVE_SELF_REPORT_CONSENT_VERSION });
    } catch (error) {
      console.error('Sensitive data consent request failed:', safeError(error));
      return response(503, { error: 'No se pudo guardar o comprobar la autorización. Inténtalo de nuevo.' });
    }
  };

export default {
  fetch: withApiCors(createSensitiveDataConsentHandler(async () => {
    const app = getFirebaseAdminApp();
    return { auth: getAuth(app), firestore: getFirestore(app) };
  })),
};
