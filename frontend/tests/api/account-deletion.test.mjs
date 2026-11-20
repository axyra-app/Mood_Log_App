import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createDeleteAccountHandler,
  isRecentAuthentication,
} from '../../api/delete-account.ts';
import deleteAccountApi from '../../api/delete-account.ts';
import { deleteUserOwnedData } from '../../api/_lib/accountDataDeletion.ts';

const NOW_SECONDS = 1_800_000_000;

const responseWith = (authTime, overrides = {}) => {
  const calls = { deletedDataFor: [], deletedAuthFor: [] };
  const services = {
    auth: {
      verifyIdToken: async () => ({ uid: 'verified-owner', auth_time: authTime }),
      deleteUser: async (uid) => { calls.deletedAuthFor.push(uid); },
    },
    firestore: {},
    bucket: {},
  };
  const handler = createDeleteAccountHandler({
    getServices: async () => services,
    deleteOwnedData: async (_firestore, _bucket, _auth, uid) => {
      calls.deletedDataFor.push(uid);
      if (overrides.deleteError) throw overrides.deleteError;
      await _auth.deleteUser(uid);
    },
    now: () => NOW_SECONDS * 1000,
  });
  return { handler, calls };
};

test('requires a valid, recent authentication timestamp', () => {
  assert.equal(isRecentAuthentication(NOW_SECONDS, NOW_SECONDS), true);
  assert.equal(isRecentAuthentication(NOW_SECONDS - 600, NOW_SECONDS), true);
  assert.equal(isRecentAuthentication(NOW_SECONDS - 601, NOW_SECONDS), false);
  assert.equal(isRecentAuthentication(NOW_SECONDS + 61, NOW_SECONDS), false);
  assert.equal(isRecentAuthentication('1800000000', NOW_SECONDS), false);
});

test('keeps account deletion disabled by default in deployed environments', async () => {
  const priorValue = process.env.ACCOUNT_DELETION_ENABLED;
  delete process.env.ACCOUNT_DELETION_ENABLED;
  try {
    const response = await deleteAccountApi.fetch(new Request('https://example.test/api/delete-account', {
      method: 'POST',
      headers: { Authorization: 'Bearer token' },
    }));
    assert.equal(response.status, 503);
    assert.match((await response.json()).error, /aún no está habilitada/);
  } finally {
    if (priorValue === undefined) delete process.env.ACCOUNT_DELETION_ENABLED;
    else process.env.ACCOUNT_DELETION_ENABLED = priorValue;
  }
});

test('rejects non-POST requests without initializing deletion services', async () => {
  let initialized = false;
  const handler = createDeleteAccountHandler({
    getServices: async () => {
      initialized = true;
      throw new Error('should not initialize');
    },
    deleteOwnedData: async () => {},
    now: () => NOW_SECONDS * 1000,
  });

  const response = await handler(new Request('https://example.test/api/delete-account'));
  assert.equal(response.status, 405);
  assert.equal(response.headers.get('allow'), 'POST');
  assert.equal(initialized, false);
});

test('requires a bearer token before initializing admin services', async () => {
  let initialized = false;
  const handler = createDeleteAccountHandler({
    getServices: async () => {
      initialized = true;
      throw new Error('should not initialize');
    },
    deleteOwnedData: async () => {},
  });

  const response = await handler(new Request('https://example.test/api/delete-account', { method: 'POST' }));
  assert.equal(response.status, 401);
  assert.equal(initialized, false);
});

test('rejects stale authentication without deleting data or identity', async () => {
  const { handler, calls } = responseWith(NOW_SECONDS - 601);
  const response = await handler(new Request('https://example.test/api/delete-account', {
    method: 'POST',
    headers: { Authorization: 'Bearer token' },
  }));

  assert.equal(response.status, 401);
  assert.equal(calls.deletedDataFor.length, 0);
  assert.equal(calls.deletedAuthFor.length, 0);
});

test('uses only the UID verified from the token, not a UID in the request body', async () => {
  const { handler, calls } = responseWith(NOW_SECONDS - 20);
  const response = await handler(new Request('https://example.test/api/delete-account', {
    method: 'POST',
    headers: { Authorization: 'Bearer token', 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid: 'another-person' }),
  }));

  assert.equal(response.status, 200);
  assert.deepEqual(calls.deletedDataFor, ['verified-owner']);
  assert.deepEqual(calls.deletedAuthFor, ['verified-owner']);
});

test('keeps Auth available when data deletion fails so the user can retry', async () => {
  const { handler, calls } = responseWith(NOW_SECONDS - 20, {
    deleteError: new Error('Firestore failed'),
  });
  const response = await handler(new Request('https://example.test/api/delete-account', {
    method: 'POST',
    headers: { Authorization: 'Bearer token' },
  }));

  assert.equal(response.status, 503);
  assert.deepEqual(calls.deletedAuthFor, []);
  assert.match((await response.json()).error, /contacta soporte/);
});

test('returns a retryable conflict while an AI request lease is active', async () => {
  const deleteError = Object.assign(new Error('AI request in progress'), {
    code: 'account/ai-request-in-progress',
  });
  const { handler, calls } = responseWith(NOW_SECONDS - 20, { deleteError });
  const response = await handler(new Request('https://example.test/api/delete-account', {
    method: 'POST',
    headers: { Authorization: 'Bearer token' },
  }));

  assert.equal(response.status, 409);
  assert.equal((await response.json()).code, 'AI_REQUEST_IN_PROGRESS');
  assert.deepEqual(calls.deletedAuthFor, []);
});

class FakeFirestore {
  documents = new Map();
  recursiveDeleteCalls = 0;
  bulkWriterInstances = 0;
  bulkWriterCloseCalls = 0;
  bulkWriter() {
    this.bulkWriterInstances += 1;
    return {
      delete: async (ref) => { this.documents.delete(ref.path); },
      close: async () => { this.bulkWriterCloseCalls += 1; },
    };
  }
  collection(name) {
    return {
      where: (field, _operator, value) => ({
        limit: () => ({
          get: async () => {
            const docs = [...this.documents.entries()]
              .filter(([path, document]) =>
                path.startsWith(`${name}/`)
                && path.split('/').length === 2
                && document[field] === value
              )
              .slice(0, 400)
              .map(([path, document]) => ({ ref: { path }, data: () => document }));
            return { docs, empty: docs.length === 0 };
          },
        }),
      }),
      doc: (id) => this.doc(`${name}/${id}`),
    };
  }
  doc(path) {
    return {
      path,
      get: async () => {
        const value = this.documents.get(path);
        return { exists: value !== undefined, data: () => value };
      },
      delete: async () => { this.documents.delete(path); },
      set: async (data) => { this.documents.set(path, data); },
    };
  }
  recursiveDelete = async (ref) => {
    this.recursiveDeleteCalls += 1;
    for (const path of this.documents.keys()) {
      if (path === ref.path || path.startsWith(`${ref.path}/`)) this.documents.delete(path);
    }
  };
  batch() {
    const paths = [];
    return {
      delete: (ref) => paths.push(ref.path),
      commit: async () => paths.forEach((path) => this.documents.delete(path)),
    };
  }
  runTransaction() {
    throw new Error('Transactions are not expected in this test fixture');
  }
}

const makeDeletionFixture = () => {
  const firestore = new FakeFirestore();
  firestore.documents.set('users/owner', { uid: 'owner', displayName: 'Owner' });
  firestore.documents.set('users/other', { uid: 'other', displayName: 'Other' });
  firestore.documents.set('userSettings/owner', { userId: 'owner', privacy: { shareData: false } });
  firestore.documents.set('aiUsage/owner', { count: 9 });
  firestore.documents.set('aiConsentEvents/consent-owner', { userId: 'owner', task: 'chat' });
  firestore.documents.set('aiConsentEvents/consent-other', { userId: 'other', task: 'chat' });
  firestore.documents.set('moodLogs/owner-log', { userId: 'owner', mood: 8 });
  firestore.documents.set('moodLogs/other-log', { userId: 'other', mood: 3 });
  firestore.documents.set('chatSessions/owner-chat', { uid: 'owner', transcript: 'private' });
  firestore.documents.set('chatSessions/owner-chat/messages/message-a', { body: 'private' });
  const deletedFiles = [];
  const bucket = {
    getFiles: async ({ prefix }) => [[
      { name: `${prefix}journal.pdf`, delete: async () => deletedFiles.push(`${prefix}journal.pdf`) },
      { name: 'users/other/private.pdf', delete: async () => deletedFiles.push('users/other/private.pdf') },
    ].filter((file) => file.name.startsWith(prefix)), undefined, {}],
  };
  const deletedAuth = [];
  const auth = { deleteUser: async (uid) => deletedAuth.push(uid) };
  return { firestore, bucket, deletedFiles, deletedAuth, auth };
};

test('deletes only the verified account documents, storage prefix, and internal quota', async () => {
  const fixture = makeDeletionFixture();
  await deleteUserOwnedData(
    fixture.firestore,
    fixture.bucket,
    fixture.auth,
    'owner',
  );

  assert.equal(fixture.firestore.documents.has('moodLogs/owner-log'), false);
  assert.equal(fixture.firestore.documents.has('chatSessions/owner-chat'), false);
  assert.equal(fixture.firestore.documents.has('chatSessions/owner-chat/messages/message-a'), false);
  assert.equal(fixture.firestore.documents.has('moodLogs/other-log'), true);
  assert.equal(fixture.firestore.documents.has('users/other'), true);
  assert.equal(fixture.firestore.documents.has('users/owner'), false);
  assert.equal(fixture.firestore.documents.has('userSettings/owner'), false);
  assert.equal(fixture.firestore.documents.has('aiUsage/owner'), false);
  assert.equal(fixture.firestore.documents.has('aiConsentEvents/consent-owner'), false);
  assert.equal(fixture.firestore.documents.has('aiConsentEvents/consent-other'), true);
  assert.equal(fixture.firestore.documents.has('accountDeletionRequests/owner'), false);
  assert.deepEqual(fixture.deletedFiles, ['users/owner/journal.pdf']);
  assert.deepEqual(fixture.deletedAuth, ['owner']);
  assert.equal(fixture.firestore.bulkWriterInstances, 1);
  assert.equal(fixture.firestore.bulkWriterCloseCalls, 1);
});

test('keeps user data and Auth intact while an AI lease is still active', async () => {
  const fixture = makeDeletionFixture();
  fixture.firestore.documents.set('activeAiRequests/request-active', {
    userId: 'owner',
    leaseExpiresAt: { toMillis: () => Date.now() + 30_000 },
  });

  await assert.rejects(
    deleteUserOwnedData(fixture.firestore, fixture.bucket, fixture.auth, 'owner'),
    (error) => error.code === 'account/ai-request-in-progress',
  );

  assert.equal(fixture.firestore.documents.has('accountDeletionRequests/owner'), true);
  assert.equal(fixture.firestore.documents.has('activeAiRequests/request-active'), true);
  assert.equal(fixture.firestore.documents.has('moodLogs/owner-log'), true);
  assert.equal(fixture.firestore.documents.has('users/owner'), true);
  assert.deepEqual(fixture.deletedAuth, []);
});

test('cleans expired AI request leases before deleting account data', async () => {
  const fixture = makeDeletionFixture();
  fixture.firestore.documents.set('activeAiRequests/request-expired', {
    userId: 'owner',
    leaseExpiresAt: { toMillis: () => Date.now() - 30_000 },
  });

  await deleteUserOwnedData(fixture.firestore, fixture.bucket, fixture.auth, 'owner');

  assert.equal(fixture.firestore.documents.has('activeAiRequests/request-expired'), false);
  assert.equal(fixture.firestore.documents.has('moodLogs/owner-log'), false);
  assert.deepEqual(fixture.deletedAuth, ['owner']);
});

test('closes the shared Firestore writer and keeps Auth when recursive deletion fails', async () => {
  const fixture = makeDeletionFixture();
  fixture.firestore.recursiveDelete = async () => {
    throw Object.assign(new Error('Firestore failed'), { code: 'firestore/unavailable' });
  };

  await assert.rejects(
    deleteUserOwnedData(fixture.firestore, fixture.bucket, fixture.auth, 'owner'),
    /Firestore failed/,
  );

  assert.equal(fixture.firestore.bulkWriterInstances, 1);
  assert.equal(fixture.firestore.bulkWriterCloseCalls, 1);
  assert.equal(fixture.firestore.documents.has('accountDeletionRequests/owner'), true);
  assert.equal(fixture.firestore.documents.has('users/owner'), true);
  assert.deepEqual(fixture.deletedAuth, []);
});

test('recursively deletes owned documents and nested data across multiple pages', async () => {
  const fixture = makeDeletionFixture();
  fixture.firestore.documents.set('journalEntries/owner-entry', { userId: 'owner', content: 'private' });
  fixture.firestore.documents.set('journalEntries/owner-entry/attachments/attachment-a', { storagePath: 'private' });
  for (let index = 0; index < 300; index += 1) {
    fixture.firestore.documents.set(`chatSessions/by-user-${index}`, { userId: 'owner' });
    fixture.firestore.documents.set(`chatSessions/by-uid-${index}`, { uid: 'owner' });
  }

  await deleteUserOwnedData(
    fixture.firestore,
    fixture.bucket,
    fixture.auth,
    'owner',
  );

  assert.equal(
    [...fixture.firestore.documents.keys()].filter((path) =>
      path.startsWith('chatSessions/') || path.startsWith('journalEntries/owner-entry')
    ).length,
    0,
  );
  assert.ok(fixture.firestore.recursiveDeleteCalls > 400);
  assert.equal(fixture.firestore.bulkWriterInstances, 1);
  assert.equal(fixture.firestore.bulkWriterCloseCalls, 1);
});

test('restores profile and settings if Auth deletion fails, allowing safe retry', async () => {
  const fixture = makeDeletionFixture();
  fixture.auth.deleteUser = async () => {
    throw new Error('Auth temporarily unavailable');
  };

  await assert.rejects(
    deleteUserOwnedData(fixture.firestore, fixture.bucket, fixture.auth, 'owner'),
    /Auth temporarily unavailable/
  );

  assert.equal(fixture.firestore.documents.get('users/owner').displayName, 'Owner');
  assert.deepEqual(fixture.firestore.documents.get('userSettings/owner'), {
    userId: 'owner',
    privacy: { shareData: false },
  });
  assert.equal(fixture.firestore.documents.has('accountDeletionRequests/owner'), true);
});
