import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { SENSITIVE_SELF_REPORT_CONSENT_VERSION } from '../../src/utils/legalVersions.ts';

type AdminFirestore = ReturnType<typeof getFirestore>;

export const isCurrentSensitiveSelfReportConsent = (
  profileValue: unknown,
  eventValue: unknown,
  uid: string,
): boolean => {
  if (!profileValue || typeof profileValue !== 'object' || Array.isArray(profileValue)) return false;
  const consent = (profileValue as Record<string, unknown>).sensitiveSelfReportConsent;
  if (!consent || typeof consent !== 'object' || Array.isArray(consent)) return false;
  const marker = consent as Record<string, unknown>;
  if (
    marker.version !== SENSITIVE_SELF_REPORT_CONSENT_VERSION
    || marker.decision !== 'accepted'
    || typeof marker.eventId !== 'string'
  ) return false;
  if (!eventValue || typeof eventValue !== 'object' || Array.isArray(eventValue)) return false;
  const event = eventValue as Record<string, unknown>;
  return event.userId === uid
    && event.version === SENSITIVE_SELF_REPORT_CONSENT_VERSION
    && event.decision === 'accepted'
    && event.recordedAt instanceof Timestamp;
};

export const hasCurrentSensitiveSelfReportConsent = async (
  firestore: AdminFirestore,
  uid: string,
): Promise<boolean> => {
  const profile = await firestore.collection('users').doc(uid).get();
  const consent = profile.data()?.sensitiveSelfReportConsent;
  if (typeof consent?.eventId !== 'string') return false;
  const event = await firestore.collection('sensitiveDataConsentEvents').doc(consent.eventId).get();
  return event.exists && isCurrentSensitiveSelfReportConsent(profile.data(), event.data(), uid);
};
