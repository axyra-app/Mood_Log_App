import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import { deleteApp, initializeApp } from 'firebase-admin/app';
import { Timestamp, getFirestore, FieldPath } from 'firebase-admin/firestore';
import { createLegalAcceptanceHandler } from '../../api/legal-acceptance.ts';
import { createSensitiveDataConsentHandler } from '../../api/sensitive-data-consent.ts';
import { getLegalAcceptanceEventId } from '../../api/_lib/legalAcceptance.ts';

const projectId = 'demo-mood-log-rules';

test('Admin API transaction persists the event and profile marker together in Firestore Emulator', async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, 'Run this test through Firebase Emulator Suite.');

  const app = initializeApp({ projectId }, `legal-acceptance-emulator-${randomUUID()}`);
  const firestore = getFirestore(app);
  const uid = `legal-emulator-${randomUUID()}`;
  const profileRef = firestore.collection('users').doc(uid);
  const eventRef = firestore.collection('legalAcceptanceEvents').doc(getLegalAcceptanceEventId(uid));
  const consentEvents = firestore.collection('sensitiveDataConsentEvents');

  await profileRef.set({
    role: 'user',
    adultEligibility: {
      isAdult: true,
      version: 'co-18plus-v1',
      attestedAt: Timestamp.now(),
    },
  });

  const handler = createLegalAcceptanceHandler({
    getServices: async () => ({
      firestore,
      auth: { verifyIdToken: async () => ({ uid }) },
    }),
  });
  const request = (method, body) => new Request('https://example.test/api/legal-acceptance', {
    method,
    headers: {
      Authorization: 'Bearer emulator-token',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  try {
    const accepted = await handler(request('POST', {
      accepted: true,
      termsVersion: 'co-terms-draft-v2-sensitive-data',
      privacyNoticeVersion: 'co-privacy-draft-v4-groq-retention',
      identityProvider: 'email',
      flow: 'registration',
    }));
    assert.equal(accepted.status, 200);

    const [eventSnapshot, profileSnapshot] = await Promise.all([eventRef.get(), profileRef.get()]);
    assert.equal(eventSnapshot.exists, true);
    assert.equal(eventSnapshot.data().userId, uid);
    assert.ok(eventSnapshot.data().acceptedAt instanceof Timestamp);
    const profileData = profileSnapshot.data();
    assert.ok(profileData?.legalAcceptance, `Profile marker missing: ${JSON.stringify(profileData)}`);
    assert.equal(profileData.legalAcceptance.termsVersion, 'co-terms-draft-v2-sensitive-data');
    assert.equal(profileData.legalAcceptance.privacyNoticeVersion, 'co-privacy-draft-v4-groq-retention');
    assert.ok(profileData.legalAcceptance.acceptedAt instanceof Timestamp);

    const current = await handler(request('GET'));
    assert.equal(current.status, 200);
    assert.equal((await current.json()).accepted, true);

    const sensitiveHandler = createSensitiveDataConsentHandler(async () => ({
      firestore,
      auth: { verifyIdToken: async () => ({ uid }) },
    }));
    const sensitiveRequest = (method, body) => new Request('https://example.test/api/sensitive-data-consent', {
      method,
      headers: {
        Authorization: 'Bearer emulator-token',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const sensitiveAccepted = await sensitiveHandler(sensitiveRequest('POST', {
      accepted: true,
      version: 'co-sensitive-selfreport-draft-v1',
    }));
    assert.equal(sensitiveAccepted.status, 200);
    const sensitiveState = await sensitiveHandler(sensitiveRequest('GET'));
    assert.equal((await sensitiveState.json()).accepted, true);
    const acceptedProfile = (await profileRef.get()).data();
    assert.equal(acceptedProfile.sensitiveSelfReportConsent.decision, 'accepted');
    const recordedEvents = await consentEvents.where('userId', '==', uid).orderBy(FieldPath.documentId()).get();
    assert.equal(recordedEvents.size, 1);
    assert.equal(recordedEvents.docs[0].data().decision, 'accepted');
    assert.ok(recordedEvents.docs[0].data().recordedAt instanceof Timestamp);

    const revoked = await sensitiveHandler(sensitiveRequest('DELETE'));
    assert.equal(revoked.status, 200);
    assert.equal((await (await sensitiveHandler(sensitiveRequest('GET'))).json()).accepted, false);
    assert.equal((await profileRef.get()).data().sensitiveSelfReportConsent.decision, 'revoked');
    assert.equal((await consentEvents.where('userId', '==', uid).get()).size, 2);
  } finally {
    const consentEventSnapshots = await consentEvents.where('userId', '==', uid).get();
    await Promise.all(consentEventSnapshots.docs.map((event) => event.ref.delete()));
    await eventRef.delete();
    await profileRef.delete();
    await deleteApp(app);
  }
});
