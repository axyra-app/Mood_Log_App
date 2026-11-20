import assert from 'node:assert/strict';
import test from 'node:test';
import { getFirebaseClientConfig } from '../../src/utils/firebaseClientConfig.ts';

const validEnv = {
  VITE_FIREBASE_API_KEY: 'public-api-key',
  VITE_FIREBASE_AUTH_DOMAIN: 'mood-log-dev.firebaseapp.com',
  VITE_FIREBASE_PROJECT_ID: 'mood-log-dev',
  VITE_FIREBASE_STORAGE_BUCKET: 'mood-log-dev.firebasestorage.app',
  VITE_FIREBASE_MESSAGING_SENDER_ID: '123456',
  VITE_FIREBASE_APP_ID: '1:123456:web:abcdef',
};

test('Firebase client config uses only the selected environment values', () => {
  assert.deepEqual(getFirebaseClientConfig({
    ...validEnv,
    VITE_FIREBASE_MEASUREMENT_ID: 'G-DEV1234567',
    VITE_GA_MEASUREMENT_ID: 'G-UNRELATED000',
  }), {
    apiKey: 'public-api-key',
    authDomain: 'mood-log-dev.firebaseapp.com',
    projectId: 'mood-log-dev',
    storageBucket: 'mood-log-dev.firebasestorage.app',
    messagingSenderId: '123456',
    appId: '1:123456:web:abcdef',
    measurementId: 'G-DEV1234567',
  });
});

test('Firebase client config fails closed if a required environment value is missing', () => {
  const { VITE_FIREBASE_PROJECT_ID: _projectId, ...missingProject } = validEnv;
  assert.throws(
    () => getFirebaseClientConfig(missingProject),
    /VITE_FIREBASE_PROJECT_ID/,
  );
  assert.throws(
    () => getFirebaseClientConfig({ ...validEnv, VITE_FIREBASE_API_KEY: '  ' }),
    /VITE_FIREBASE_API_KEY/,
  );
});

test('Firebase Analytics measurement ID is optional for environments without analytics', () => {
  const config = getFirebaseClientConfig(validEnv);
  assert.equal('measurementId' in config, false);
});
