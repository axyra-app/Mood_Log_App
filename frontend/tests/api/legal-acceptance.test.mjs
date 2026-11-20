import assert from 'node:assert/strict';
import test from 'node:test';
import { Timestamp } from 'firebase-admin/firestore';
import { createLegalAcceptanceHandler } from '../../api/legal-acceptance.ts';

const currentEligibility = () => ({
  isAdult: true,
  version: 'co-18plus-v1',
  attestedAt: Timestamp.now(),
});

const createHarness = ({ eligible = true, deleting = false, failProfileWrite = false } = {}) => {
  const records = new Map();
  const pathFor = (collectionName, id) => `${collectionName}/${id}`;
  const snapshotFor = (path) => {
    const value = records.get(path);
    return {
      exists: value !== undefined,
      data: () => value === undefined ? undefined : { ...value },
    };
  };
  const docRef = (collectionName, id) => {
    const path = pathFor(collectionName, id);
    return {
      get: async () => snapshotFor(path),
      set: async (data, options = {}) => {
        const previous = options.merge ? records.get(path) ?? {} : {};
        const saved = {
          ...data,
          ...(data.legalAcceptance ? {
            legalAcceptance: { ...data.legalAcceptance, acceptedAt: Timestamp.now() },
          } : {}),
        };
        records.set(path, { ...previous, ...saved });
      },
      path,
    };
  };
  records.set(pathFor('users', 'user-a'), {
    adultEligibility: eligible ? currentEligibility() : { ...currentEligibility(), version: 'old' },
  });
  if (deleting) records.set(pathFor('accountDeletionRequests', 'user-a'), { requestedAt: Timestamp.now() });

  const firestore = {
    collection: (name) => ({ doc: (id) => docRef(name, id) }),
    runTransaction: async (callback) => {
      const writes = [];
      const result = await callback({
        get: async (reference) => snapshotFor(reference.path),
        create: (reference, data) => {
          if (records.has(reference.path)) throw new Error('Document already exists');
          writes.push({ type: 'create', path: reference.path, data });
        },
        set: (reference, data, options = {}) => {
          if (failProfileWrite && reference.path === 'users/user-a') {
            throw new Error('Injected profile write failure');
          }
          writes.push({ type: 'set', path: reference.path, data, options });
        },
      });
      for (const write of writes) {
        if (write.type === 'create') {
          records.set(write.path, { ...write.data, acceptedAt: Timestamp.now() });
          continue;
        }
        const previous = write.options.merge ? records.get(write.path) ?? {} : {};
        const saved = {
          ...write.data,
          ...(write.data.legalAcceptance ? {
            legalAcceptance: { ...write.data.legalAcceptance, acceptedAt: Timestamp.now() },
          } : {}),
        };
        records.set(write.path, { ...previous, ...saved });
      }
      return result;
    },
  };
  const auth = {
    verifyIdToken: async (token) => {
      if (token !== 'valid-token') {
        const error = new Error('Invalid token');
        error.code = 'auth/id-token-expired';
        throw error;
      }
      return { uid: 'user-a' };
    },
  };
  const handler = createLegalAcceptanceHandler({ getServices: async () => ({ auth, firestore }) });
  return { handler, records };
};

const authorizedRequest = (method, body) => new Request('https://example.test/api/legal-acceptance', {
  method,
  headers: {
    Authorization: 'Bearer valid-token',
    ...(body ? { 'Content-Type': 'application/json' } : {}),
  },
  ...(body ? { body: JSON.stringify(body) } : {}),
});

const acceptanceBody = (overrides = {}) => ({
  accepted: true,
  termsVersion: 'co-terms-draft-v2-sensitive-data',
  privacyNoticeVersion: 'co-privacy-draft-v4-groq-retention',
  identityProvider: 'google',
  flow: 'registration',
  ...overrides,
});

test('requires a verified session and current eligibility before recording acceptance', async () => {
  const { handler } = createHarness();
  const missingAuth = await handler(new Request('https://example.test/api/legal-acceptance', { method: 'GET' }));
  assert.equal(missingAuth.status, 401);

  const invalidAuth = await handler(new Request('https://example.test/api/legal-acceptance', {
    method: 'GET',
    headers: { Authorization: 'Bearer invalid-token' },
  }));
  assert.equal(invalidAuth.status, 401);

  const ineligibleHarness = createHarness({ eligible: false });
  const ineligible = await ineligibleHarness.handler(authorizedRequest('POST', acceptanceBody()));
  assert.equal(ineligible.status, 403);
  assert.equal(ineligibleHarness.records.size, 1);
});

test('records an immutable idempotent event and reports the acceptance as current', async () => {
  const { handler, records } = createHarness();
  const first = await handler(authorizedRequest('POST', acceptanceBody()));
  assert.equal(first.status, 200);
  assert.deepEqual(await first.json(), { accepted: true });

  const eventRecords = [...records.entries()].filter(([path]) => path.startsWith('legalAcceptanceEvents/'));
  assert.equal(eventRecords.length, 1);
  const [eventPath, event] = eventRecords[0];
  assert.equal(event.userId, 'user-a');
  assert.equal(event.termsVersion, 'co-terms-draft-v2-sensitive-data');
  assert.equal(event.privacyNoticeVersion, 'co-privacy-draft-v4-groq-retention');
  assert.equal(event.channel, 'registration');
  assert.equal(event.identityProvider, 'google');
  assert.ok(event.acceptedAt instanceof Timestamp);

  const repeated = await handler(authorizedRequest('POST', acceptanceBody({ flow: 'renewal' })));
  assert.equal(repeated.status, 200);
  assert.equal([...records.keys()].filter((path) => path.startsWith('legalAcceptanceEvents/')).length, 1);
  assert.equal(records.get(eventPath).channel, 'registration');

  const current = await handler(authorizedRequest('GET'));
  assert.equal(current.status, 200);
  assert.equal((await current.json()).accepted, true);
});

test('rejects stale versions and keeps an event without its profile marker non-current', async () => {
  const { handler, records } = createHarness();
  const stale = await handler(authorizedRequest('POST', acceptanceBody({ termsVersion: 'old-terms' })));
  assert.equal(stale.status, 400);
  assert.equal([...records.keys()].some((path) => path.startsWith('legalAcceptanceEvents/')), false);

  const accepted = await handler(authorizedRequest('POST', acceptanceBody()));
  assert.equal(accepted.status, 200);
  const profile = records.get('users/user-a');
  delete profile.legalAcceptance;

  const current = await handler(authorizedRequest('GET'));
  assert.equal(current.status, 200);
  assert.equal((await current.json()).accepted, false);
});

test('rejects acceptance while account deletion is pending', async () => {
  const { handler, records } = createHarness({ deleting: true });
  const response = await handler(authorizedRequest('POST', acceptanceBody()));
  assert.equal(response.status, 403);
  assert.equal([...records.keys()].some((path) => path.startsWith('legalAcceptanceEvents/')), false);
});

test('keeps event and profile marker atomic if the profile write fails', async () => {
  const { handler, records } = createHarness({ failProfileWrite: true });
  const response = await handler(authorizedRequest('POST', acceptanceBody()));
  assert.equal(response.status, 503);
  assert.equal([...records.keys()].some((path) => path.startsWith('legalAcceptanceEvents/')), false);
  assert.equal(records.get('users/user-a').legalAcceptance, undefined);
});
