import assert from 'node:assert/strict';
import test from 'node:test';
import { Timestamp } from 'firebase-admin/firestore';
import { createSensitiveDataConsentHandler } from '../../api/sensitive-data-consent.ts';
import { getLegalAcceptanceEventId } from '../../api/_lib/legalAcceptance.ts';

const versions = {
  termsVersion: 'co-terms-draft-v2-sensitive-data',
  privacyNoticeVersion: 'co-privacy-draft-v4-groq-retention',
};

const createHarness = ({ eligible = true, deleting = false } = {}) => {
  const records = new Map();
  let generatedId = 0;
  const pathFor = (name, id) => `${name}/${id}`;
  const snapshot = (path) => ({ exists: records.has(path), data: () => records.get(path) });
  const docRef = (name, id) => {
    const actualId = id ?? `auto-${++generatedId}`;
    const path = pathFor(name, actualId);
    return { id: actualId, path, get: async () => snapshot(path) };
  };
  const uid = 'user-a';
  records.set(pathFor('users', uid), {
    adultEligibility: {
      isAdult: true,
      version: eligible ? 'co-18plus-v1' : 'old',
      attestedAt: Timestamp.now(),
    },
    legalAcceptance: { ...versions, acceptedAt: Timestamp.now() },
  });
  records.set(pathFor('legalAcceptanceEvents', getLegalAcceptanceEventId(uid)), {
    userId: uid,
    ...versions,
    acceptedAt: Timestamp.now(),
  });
  if (deleting) records.set(pathFor('accountDeletionRequests', uid), { requestedAt: Timestamp.now() });

  const firestore = {
    collection: (name) => ({ doc: (id) => docRef(name, id) }),
    runTransaction: async (callback) => {
      const writes = [];
      const result = await callback({
        get: async (reference) => snapshot(reference.path),
        create: (reference, data) => writes.push({ type: 'create', reference, data }),
        set: (reference, data, options) => writes.push({ type: 'set', reference, data, options }),
      });
      for (const write of writes) {
        if (write.type === 'create') records.set(write.reference.path, { ...write.data, recordedAt: Timestamp.now() });
        else records.set(write.reference.path, {
          ...(write.options?.merge ? records.get(write.reference.path) : {}),
          ...write.data,
          sensitiveSelfReportConsent: write.data.sensitiveSelfReportConsent
            ? { ...write.data.sensitiveSelfReportConsent, changedAt: Timestamp.now() }
            : undefined,
          updatedAt: Timestamp.now(),
        });
      }
      return result;
    },
  };
  const auth = {
    verifyIdToken: async (token) => {
      if (token !== 'valid-token') throw Object.assign(new Error('Invalid token'), { code: 'auth/id-token-expired' });
      return { uid };
    },
  };
  return {
    records,
    handler: createSensitiveDataConsentHandler(async () => ({ auth, firestore })),
  };
};

const request = (method, body) => new Request('https://example.test/api/sensitive-data-consent', {
  method,
  headers: {
    Authorization: 'Bearer valid-token',
    ...(body ? { 'Content-Type': 'application/json' } : {}),
  },
  ...(body ? { body: JSON.stringify(body) } : {}),
});

test('requires an authenticated account and current adult eligibility to grant consent', async () => {
  const harness = createHarness();
  assert.equal((await harness.handler(new Request('https://example.test/api/sensitive-data-consent', { method: 'GET' }))).status, 401);
  const ineligible = createHarness({ eligible: false });
  const result = await ineligible.handler(request('POST', { accepted: true, version: 'co-sensitive-selfreport-draft-v1' }));
  assert.equal(result.status, 403);
  assert.equal([...ineligible.records.keys()].some((path) => path.startsWith('sensitiveDataConsentEvents/')), false);
});

test('records a versioned decision, verifies its event, and supports revocation', async () => {
  const { handler, records } = createHarness();
  const before = await handler(request('GET'));
  assert.equal((await before.json()).accepted, false);

  const invalid = await handler(request('POST', { accepted: true, version: 'old-version' }));
  assert.equal(invalid.status, 400);
  assert.equal([...records.keys()].some((path) => path.startsWith('sensitiveDataConsentEvents/')), false);

  const accepted = await handler(request('POST', { accepted: true, version: 'co-sensitive-selfreport-draft-v1' }));
  assert.equal(accepted.status, 200);
  assert.equal((await handler(request('GET')).then((response) => response.json())).accepted, true);
  const events = [...records.entries()].filter(([path]) => path.startsWith('sensitiveDataConsentEvents/'));
  assert.equal(events.length, 1);
  assert.equal(events[0][1].decision, 'accepted');
  assert.ok(events[0][1].recordedAt instanceof Timestamp);

  const revoked = await handler(request('DELETE'));
  assert.equal(revoked.status, 200);
  assert.deepEqual(await revoked.json(), { accepted: false, version: 'co-sensitive-selfreport-draft-v1' });
  assert.equal((await handler(request('GET')).then((response) => response.json())).accepted, false);
  assert.equal([...records.values()].filter((record) => record?.userId === 'user-a' && record?.version === 'co-sensitive-selfreport-draft-v1').length, 2);
});

test('a pending account deletion prevents changing the consent marker', async () => {
  const { handler, records } = createHarness({ deleting: true });
  const result = await handler(request('POST', { accepted: true, version: 'co-sensitive-selfreport-draft-v1' }));
  assert.equal(result.status, 403);
  assert.equal([...records.keys()].some((path) => path.startsWith('sensitiveDataConsentEvents/')), false);
});
