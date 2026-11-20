import assert from 'node:assert/strict';
import test from 'node:test';
import { createUserDataExportHandler } from '../../api/user-data-export.ts';

const makeSnapshot = (path, value, firestore) => ({
  id: path.split('/').at(-1),
  ref: {
    path,
    listCollections: async () => {
      const prefix = `${path}/`;
      const names = new Set();
      for (const documentPath of firestore.documents.keys()) {
        if (!documentPath.startsWith(prefix)) continue;
        const nextSegment = documentPath.slice(prefix.length).split('/')[0];
        if (nextSegment) names.add(nextSegment);
      }
      return [...names].map((name) => firestore.collection(`${path}/${name}`));
    },
  },
  exists: value !== undefined,
  data: () => value,
});

class FakeFirestore {
  documents = new Map();
  collection(path) {
    const collection = {
      where: (field, _operator, value) => ({
        orderBy: () => ({
          limit: (limit) => {
            let afterId;
            const query = {
              startAfter: (cursor) => { afterId = cursor.id; return query; },
              get: async () => collection.getPage(field, value, afterId, limit),
            };
            return query;
          },
        }),
      }),
      orderBy: () => ({
        limit: (limit) => {
          let afterId;
          const query = {
            startAfter: (cursor) => { afterId = cursor.id; return query; },
            get: async () => collection.getPage(undefined, undefined, afterId, limit),
          };
          return query;
        },
      }),
      doc: (id) => {
        const documentPath = `${path}/${id}`;
        return {
          ...makeSnapshot(documentPath, this.documents.get(documentPath), this).ref,
          get: async () => makeSnapshot(documentPath, this.documents.get(documentPath), this),
        };
      },
      getPage: async (field, value, afterId, limit) => {
        const docs = [...this.documents.entries()]
          .filter(([documentPath, data]) =>
            documentPath.startsWith(`${path}/`)
            && documentPath.slice(path.length + 1).split('/').length === 1
            && (field === undefined || data?.[field] === value)
            && (!afterId || documentPath.slice(path.length + 1) > afterId)
          )
          .sort(([left], [right]) => left.localeCompare(right))
          .slice(0, limit)
          .map(([documentPath, data]) => makeSnapshot(documentPath, data, this));
        return { docs, size: docs.length };
      },
    };
    return collection;
  }
}

const makeServices = () => {
  const firestore = new FakeFirestore();
  firestore.documents.set('users/owner', { uid: 'owner', role: 'user' });
  firestore.documents.set('userSettings/owner', { userId: 'owner', theme: 'dark' });
  firestore.documents.set('aiUsage/owner', {
    count: 3,
    providerUsage: {
      day: '2026-11-20',
      models: {
        'openai/gpt-oss-20b': {
          chat: { requests: 3, promptTokens: 30, completionTokens: 12, totalTokens: 42 },
        },
      },
    },
    secretPrompt: 'must never export',
  });
  firestore.documents.set('moodLogs/mood-1', { userId: 'owner', mood: 8 });
  firestore.documents.set('moodLogs/mood-1/attachments/file-1', { label: 'nested record' });
  firestore.documents.set('chatSessions/legacy-1', { uid: 'owner', title: 'old chat' });
  firestore.documents.set('chatSessions/legacy-1/messages/message-1', { body: 'old message' });
  firestore.documents.set('chatSessions/other-user', { uid: 'someone-else', title: 'private' });

  const calls = { verified: [], userLookups: [] };
  const auth = {
    verifyIdToken: async (token, checkRevoked) => {
      calls.verified.push([token, checkRevoked]);
      if (token !== 'owner-token') throw Object.assign(new Error('invalid'), { code: 'auth/invalid-id-token' });
      return { uid: 'owner' };
    },
    getUser: async (uid) => {
      calls.userLookups.push(uid);
      return { email: 'owner@example.test', displayName: 'Owner' };
    },
  };
  return { firestore, auth, calls };
};

const createHandler = (services) => createUserDataExportHandler({ getServices: async () => services });

test('streams only the verified account, including legacy and nested Firestore records', async () => {
  const services = makeServices();
  const handler = createHandler(services);
  const response = await handler(new Request('https://example.test/api/user-data-export', {
    method: 'POST',
    headers: { Authorization: 'Bearer owner-token' },
  }));

  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.match(response.headers.get('content-type'), /application\/x-ndjson/);
  const records = (await response.text()).trim().split('\n').map((line) => JSON.parse(line));
  assert.equal(records[0].type, 'metadata');
  assert.equal(records[0].formatVersion, 8);
  assert.equal(records[0].account.uid, 'owner');
  assert.equal(records.at(-1).type, 'end');
  assert.equal(records.at(-1).documentCount, records.filter((record) => record.type === 'document').length);
  assert.deepEqual(services.calls.verified, [['owner-token', true]]);
  assert.deepEqual(services.calls.userLookups, ['owner']);

  const documents = records.filter((record) => record.type === 'document');
  const paths = documents.map(({ path }) => path);
  assert.ok(paths.includes('moodLogs/mood-1'));
  assert.ok(paths.includes('moodLogs/mood-1/attachments/file-1'));
  assert.ok(paths.includes('chatSessions/legacy-1'));
  assert.ok(paths.includes('chatSessions/legacy-1/messages/message-1'));
  assert.ok(!paths.includes('chatSessions/other-user'));

  const usage = documents.find(({ path }) => path === 'aiUsage/owner');
  assert.equal(usage.data.requestsToday, 3);
  assert.equal(usage.data.secretPrompt, undefined);
});

test('rejects requests without a token before initializing Firebase Admin', async () => {
  let initialized = false;
  const handler = createUserDataExportHandler({
    getServices: async () => {
      initialized = true;
      throw new Error('must not initialize');
    },
  });
  const response = await handler(new Request('https://example.test/api/user-data-export', { method: 'POST' }));
  assert.equal(response.status, 401);
  assert.equal(initialized, false);
});

test('rejects exports while account deletion is pending', async () => {
  const services = makeServices();
  services.firestore.documents.set('accountDeletionRequests/owner', { requestedAt: new Date() });
  const handler = createHandler(services);
  const response = await handler(new Request('https://example.test/api/user-data-export', {
    method: 'POST',
    headers: { Authorization: 'Bearer owner-token' },
  }));
  assert.equal(response.status, 409);
});

test('does not mark an export complete if account deletion begins during the stream', async () => {
  const services = makeServices();
  const originalGetUser = services.auth.getUser;
  services.auth.getUser = async (uid) => {
    const user = await originalGetUser(uid);
    services.firestore.documents.set('accountDeletionRequests/owner', { requestedAt: new Date() });
    return user;
  };
  const handler = createHandler(services);
  const response = await handler(new Request('https://example.test/api/user-data-export', {
    method: 'POST',
    headers: { Authorization: 'Bearer owner-token' },
  }));
  const records = (await response.text()).trim().split('\n').map((line) => JSON.parse(line));
  assert.equal(records.at(-1).type, 'error');
  assert.equal(records.some((record) => record.type === 'end'), false);
});
