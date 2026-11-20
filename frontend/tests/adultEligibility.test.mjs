import assert from 'node:assert/strict';
import test from 'node:test';
import { hasCurrentAdultEligibilityMarker } from '../src/utils/adultEligibility.ts';

test('adult eligibility requires a current affirmative marker and a valid attestation timestamp', () => {
  const now = new Date('2026-11-20T12:00:00.000Z');
  const current = { isAdult: true, version: 'co-18plus-v1', attestedAt: now };

  assert.equal(hasCurrentAdultEligibilityMarker(current), true);
  assert.equal(hasCurrentAdultEligibilityMarker({
    ...current,
    attestedAt: { toDate: () => now },
  }), true);
  assert.equal(hasCurrentAdultEligibilityMarker({ ...current, attestedAt: undefined }), false);
  assert.equal(hasCurrentAdultEligibilityMarker({ ...current, attestedAt: '2026-11-20' }), false);
  assert.equal(hasCurrentAdultEligibilityMarker({ ...current, attestedAt: new Date('invalid') }), false);
  assert.equal(hasCurrentAdultEligibilityMarker({ ...current, version: 'old-version' }), false);
  assert.equal(hasCurrentAdultEligibilityMarker({ ...current, isAdult: false }), false);
});
