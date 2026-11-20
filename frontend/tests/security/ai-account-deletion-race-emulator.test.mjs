import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import { deleteApp, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore';
import {
  consumeAiQuota,
  recordAiConsentEvent,
  recordGroqUsage,
} from '../../api/ai.ts';

const projectId = 'demo-mood-log-rules';

test('AI transactions cannot recreate user data after deletion marker and profile are gone', async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, 'Run this test through Firebase Emulator Suite.');

  const app = initializeApp({ projectId }, `ai-deletion-race-emulator-${randomUUID()}`);
  const firestore = getFirestore(app);
  const uid = `ai-deletion-race-${randomUUID()}`;
  const profileRef = firestore.collection('users').doc(uid);
  const deletionRef = firestore.collection('accountDeletionRequests').doc(uid);
  const quotaRef = firestore.collection('aiUsage').doc(uid);
  const events = firestore.collection('aiConsentEvents');
  const leases = firestore.collection('activeAiRequests');

  try {
    await profileRef.set({
      adultEligibility: {
        isAdult: true,
        version: 'co-18plus-v1',
        attestedAt: Timestamp.now(),
      },
    });
    await deletionRef.set({ requestedAt: Timestamp.now() });
    await profileRef.delete();
    await deletionRef.delete();

    const quotaDecision = await consumeAiQuota(uid, firestore, FieldValue);
    const consentDecision = await recordAiConsentEvent(uid, 'chat', firestore);
    await recordGroqUsage(uid, 'chat', 'openai/gpt-oss-20b', {
      promptTokens: 10,
      completionTokens: 5,
      totalTokens: 15,
    }, firestore, FieldValue);

    assert.equal(quotaDecision, 'account-ineligible');
    assert.deepEqual(consentDecision, { status: 'account-ineligible' });
    assert.equal((await quotaRef.get()).exists, false);
    assert.equal((await events.where('userId', '==', uid).get()).size, 0);
    assert.equal((await leases.where('userId', '==', uid).get()).size, 0);
  } finally {
    await Promise.all([
      profileRef.delete(),
      deletionRef.delete(),
      quotaRef.delete(),
    ]);
    for (const collection of [events, leases]) {
      const snapshots = await collection.where('userId', '==', uid).get();
      await Promise.all(snapshots.docs.map((document) => document.ref.delete()));
    }
    await deleteApp(app);
  }
});
