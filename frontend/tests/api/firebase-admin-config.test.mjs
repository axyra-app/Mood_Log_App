import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseFirebaseAdminCredentials } from '../../api/ai.ts';

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
