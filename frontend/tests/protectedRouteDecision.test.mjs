import assert from 'node:assert/strict';
import test from 'node:test';
import { getProtectedRouteDecision } from '../src/utils/protectedRouteDecision.ts';

const baseInput = {
  loading: false,
  isAuthenticated: true,
  adultEligible: true,
  acceptanceState: 'current',
  needsProfileCompletion: false,
  allowIncompleteProfile: false,
};

test('protected route checks authentication, age, acceptance, then profile completion in order', () => {
  assert.equal(getProtectedRouteDecision({ ...baseInput, loading: true }), 'loading');
  assert.equal(getProtectedRouteDecision({ ...baseInput, isAuthenticated: false }), 'login');
  assert.equal(getProtectedRouteDecision({ ...baseInput, adultEligible: false }), 'age-confirmation');
  assert.equal(getProtectedRouteDecision({ ...baseInput, acceptanceState: 'checking' }), 'checking-acceptance');
  assert.equal(getProtectedRouteDecision({ ...baseInput, acceptanceState: 'required' }), 'legal-acceptance');
  assert.equal(getProtectedRouteDecision({ ...baseInput, acceptanceState: 'error' }), 'acceptance-error');
  assert.equal(getProtectedRouteDecision({ ...baseInput, needsProfileCompletion: true }), 'complete-profile');
  assert.equal(getProtectedRouteDecision({
    ...baseInput,
    needsProfileCompletion: true,
    allowIncompleteProfile: true,
  }), 'allowed');
  assert.equal(getProtectedRouteDecision(baseInput), 'allowed');
});
