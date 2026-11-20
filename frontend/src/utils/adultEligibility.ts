import { ADULT_ELIGIBILITY_VERSION } from './legalVersions.ts';

const hasValidAttestationTimestamp = (value: unknown): boolean => {
  if (value instanceof Date) return Number.isFinite(value.getTime());
  if (!value || typeof value !== 'object' || !('toDate' in value)) return false;
  const toDate = (value as { toDate?: unknown }).toDate;
  if (typeof toDate !== 'function') return false;
  try {
    const date = toDate.call(value);
    return date instanceof Date && Number.isFinite(date.getTime());
  } catch {
    return false;
  }
};

export const hasCurrentAdultEligibilityMarker = (eligibility: unknown): boolean => {
  if (!eligibility || typeof eligibility !== 'object' || Array.isArray(eligibility)) return false;
  const marker = eligibility as Record<string, unknown>;
  return marker.isAdult === true
    && marker.version === ADULT_ELIGIBILITY_VERSION
    && hasValidAttestationTimestamp(marker.attestedAt);
};
