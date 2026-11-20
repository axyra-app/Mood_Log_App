import { createHash } from 'node:crypto';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { PRIVACY_NOTICE_VERSION, TERMS_VERSION } from '../../src/utils/legalVersions.ts';

type AdminFirestore = ReturnType<typeof getFirestore>;

export const getLegalAcceptanceEventId = (uid: string): string =>
  createHash('sha256')
    .update(`${uid}\0${TERMS_VERSION}\0${PRIVACY_NOTICE_VERSION}`)
    .digest('hex');

export const isCurrentLegalAcceptanceEvent = (value: unknown, uid: string): boolean => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const event = value as Record<string, unknown>;
  return event.userId === uid
    && event.termsVersion === TERMS_VERSION
    && event.privacyNoticeVersion === PRIVACY_NOTICE_VERSION
    && event.acceptedAt instanceof Timestamp;
};

export const hasCurrentLegalAcceptance = async (
  firestore: AdminFirestore,
  uid: string,
): Promise<boolean> => {
  const [eventSnapshot, profileSnapshot] = await Promise.all([
    firestore.collection('legalAcceptanceEvents').doc(getLegalAcceptanceEventId(uid)).get(),
    firestore.collection('users').doc(uid).get(),
  ]);
  const profileAcceptance = profileSnapshot.data()?.legalAcceptance;
  return eventSnapshot.exists
    && isCurrentLegalAcceptanceEvent(eventSnapshot.data(), uid)
    && profileAcceptance?.termsVersion === TERMS_VERSION
    && profileAcceptance?.privacyNoticeVersion === PRIVACY_NOTICE_VERSION
    && profileAcceptance?.acceptedAt instanceof Timestamp;
};
