import test from 'node:test';
import assert from 'node:assert/strict';
import { createAgeEligibilityHandler } from '../../api/age-eligibility.ts';
const request = (body, token = 'valid') => new Request('https://example.test/api/age-eligibility', {
  method: 'POST', headers: token ? { authorization: `Bearer ${token}` } : {}, body: JSON.stringify(body),
});
const consent = { confirmedAdult: true, version: 'co-18plus-v1', uid: 'victim' };
const harness = ({ deleting = false, exists = true } = {}) => {
  const writes = [];
  const handler = createAgeEligibilityHandler(async () => ({
    auth: { verifyIdToken: async (token, revoked) => {
      assert.equal(revoked, true);
      if (token !== 'valid') throw { code: 'auth/id-token-expired' };
      return { uid: 'owner' };
    } },
    firestore: {
      collection: name => ({ doc: uid => ({ path: `${name}/${uid}` }) }),
      runTransaction: async fn => fn({
        get: async ref => ({ exists: ref.path.startsWith('users/') ? exists : deleting, data: () => ({ legacyField: 'keep' }) }),
        set: (ref, data, options) => writes.push({ ref, data, options }),
      }),
    },
  }));
  return { handler, writes };
};
test('age confirmation rejects anonymous, expired sessions and absent explicit consent', async () => {
  const { handler, writes } = harness();
  assert.equal((await handler(request(consent, ''))).status, 401);
  assert.equal((await handler(request(consent, 'expired'))).status, 401);
  assert.equal((await handler(request({ ...consent, confirmedAdult: false }))).status, 400);
  assert.equal((await handler(request({ ...consent, version: 'old' }))).status, 400);
  assert.equal(writes.length, 0);
});
test('age confirmation writes only the verified owner and preserves legacy fields', async () => {
  const { handler, writes } = harness();
  assert.equal((await handler(request(consent))).status, 200);
  assert.equal(writes[0].ref.path, 'users/owner');
  assert.deepEqual(Object.keys(writes[0].data).sort(), ['adultEligibility', 'updatedAt']);
  assert.deepEqual(writes[0].options, { merge: true });
});
test('age confirmation cannot recreate missing or deleting accounts', async () => {
  for (const [options, status] of [[{ deleting: true }, 403], [{ exists: false }, 404]]) {
    const { handler, writes } = harness(options);
    assert.equal((await handler(request(consent))).status, status);
    assert.equal(writes.length, 0);
  }
});
