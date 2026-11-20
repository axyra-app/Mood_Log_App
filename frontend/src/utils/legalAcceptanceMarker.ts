import { Timestamp } from 'firebase/firestore';
import { PRIVACY_NOTICE_VERSION, TERMS_VERSION } from './legalVersions.ts';

export const hasCurrentLegalAcceptanceMarker = (value: unknown): boolean => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const marker = value as Record<string, unknown>;
  return marker.termsVersion === TERMS_VERSION
    && marker.privacyNoticeVersion === PRIVACY_NOTICE_VERSION
    && marker.acceptedAt instanceof Timestamp;
};
