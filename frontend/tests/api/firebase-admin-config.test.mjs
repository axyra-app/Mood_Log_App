import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Timestamp } from 'firebase-admin/firestore';
import {
  hasCurrentAdultEligibility,
  hasCurrentAiConsent,
  hasPendingAccountDeletion,
  isInvalidFirebaseIdTokenError,
  parseFirebaseAdminCredentials,
} from '../../api/ai.ts';

const createServiceAccount = () => ({
  project_id: 'mood-log-test',
  client_email: 'firebase-admin@mood-log-test.iam.gserviceaccount.com',
  private_key: '-----BEGIN PRIVATE KEY-----\\nTEST-KEY\\n-----END PRIVATE KEY-----',
});

test('parses service-account JSON and normalizes escaped private-key newlines', () => {
  const credentials = parseFirebaseAdminCredentials(
    JSON.stringify(createServiceAccount()),
    'mood-log-test',
  );

  assert.equal(credentials.projectId, 'mood-log-test');
  assert.equal(credentials.clientEmail, 'firebase-admin@mood-log-test.iam.gserviceaccount.com');
  assert.ok(credentials.privateKey.includes('\nTEST-KEY\n'));
});

test('accepts JSON-encoded service-account JSON', () => {
  const serviceAccountJson = JSON.stringify(createServiceAccount());

  assert.equal(
    parseFirebaseAdminCredentials(JSON.stringify(serviceAccountJson), undefined).projectId,
    'mood-log-test',
  );
});

test('rejects malformed service-account JSON without exposing credential contents', () => {
  assert.throws(
    () => parseFirebaseAdminCredentials('not-json', 'mood-log-test'),
    /FIREBASE_SERVICE_ACCOUNT_JSON debe contener el JSON completo/,
  );
});

test('rejects a project ID that does not match the service account', () => {
  assert.throws(
    () => parseFirebaseAdminCredentials(JSON.stringify(createServiceAccount()), 'other-project'),
    /FIREBASE_PROJECT_ID no coincide/,
  );
});

test('classifies invalid or expired Firebase ID tokens as client authentication errors', () => {
  for (const code of [
    'auth/argument-error',
    'auth/id-token-expired',
    'auth/invalid-id-token',
    'auth/id-token-revoked',
    'auth/user-disabled',
    'auth/user-not-found',
  ]) {
    assert.equal(isInvalidFirebaseIdTokenError(code), true, code);
  }
});

test('does not classify Firebase service permission failures as invalid user tokens', () => {
  assert.equal(isInvalidFirebaseIdTokenError('auth/insufficient-permission'), false);
  assert.equal(isInvalidFirebaseIdTokenError('auth/internal-error'), false);
});

test('checks the private deletion marker before allowing new AI work', async () => {
  const reads = [];
  const firestore = {
    collection: (name) => ({
      doc: (uid) => ({
        get: async () => {
          reads.push([name, uid]);
          return { exists: uid === 'deleting-user' };
        },
      }),
    }),
  };

  assert.equal(await hasPendingAccountDeletion(firestore, 'deleting-user'), true);
  assert.equal(await hasPendingAccountDeletion(firestore, 'active-user'), false);
  assert.deepEqual(reads, [
    ['accountDeletionRequests', 'deleting-user'],
    ['accountDeletionRequests', 'active-user'],
  ]);
});

test('requires a current, timestamped adult eligibility attestation for AI access', async () => {
  const profiles = new Map([
    ['current-user', {
      adultEligibility: { isAdult: true, version: 'co-18plus-v1', attestedAt: Timestamp.now() },
    }],
    ['old-version-user', {
      adultEligibility: { isAdult: true, version: 'co-17plus-v0', attestedAt: new Date() },
    }],
    ['no-timestamp-user', {
      adultEligibility: { isAdult: true, version: 'co-18plus-v1' },
    }],
    ['malformed-timestamp-user', {
      adultEligibility: { isAdult: true, version: 'co-18plus-v1', attestedAt: '2026-11-20' },
    }],
  ]);
  const firestore = {
    collection: (name) => ({
      doc: (uid) => ({ get: async () => ({ data: () => name === 'users' ? profiles.get(uid) : undefined }) }),
    }),
  };

  assert.equal(await hasCurrentAdultEligibility(firestore, 'current-user'), true);
  assert.equal(await hasCurrentAdultEligibility(firestore, 'old-version-user'), false);
  assert.equal(await hasCurrentAdultEligibility(firestore, 'no-timestamp-user'), false);
  assert.equal(await hasCurrentAdultEligibility(firestore, 'malformed-timestamp-user'), false);
  assert.equal(await hasCurrentAdultEligibility(firestore, 'missing-user'), false);
});

test('accepts only the current disclosure version for sending content to Groq', () => {
  assert.equal(hasCurrentAiConsent('co-ai-groq-v3-retention-and-location'), true);
  assert.equal(hasCurrentAiConsent('co-ai-groq-v1'), false);
  assert.equal(hasCurrentAiConsent('co-ai-groq-v0'), false);
  assert.equal(hasCurrentAiConsent(undefined), false);
  assert.equal(hasCurrentAiConsent({ version: 'co-ai-groq-v3-retention-and-location' }), false);
});
