import assert from 'node:assert/strict';
import test from 'node:test';
import {
  analyticsEvents,
  hasCurrentAnalyticsConsent,
  isAnalyticsAvailable,
} from '../src/services/analytics.ts';
import { Timestamp } from 'firebase/firestore';
import {
  ANALYTICS_CONSENT_VERSION,
  PRIVACY_NOTICE_VERSION,
  TERMS_VERSION,
} from '../src/utils/legalVersions.ts';
import { hasCurrentLegalAcceptanceMarker } from '../src/utils/legalAcceptanceMarker.ts';

test('analytics consent requires an explicit choice, current version, and timestamp', () => {
  assert.equal(hasCurrentAnalyticsConsent(undefined), false);
  assert.equal(hasCurrentAnalyticsConsent({ analyticsOptIn: true }), false);
  assert.equal(hasCurrentAnalyticsConsent({
    analyticsOptIn: true,
    analyticsConsentVersion: 'old-version',
    analyticsConsentAt: new Date(),
  }), false);
  assert.equal(hasCurrentAnalyticsConsent({
    analyticsOptIn: true,
    analyticsConsentVersion: ANALYTICS_CONSENT_VERSION,
  }), false);
  assert.equal(hasCurrentAnalyticsConsent({
    analyticsOptIn: true,
    analyticsConsentVersion: ANALYTICS_CONSENT_VERSION,
    analyticsConsentAt: new Date(),
  }), true);
  assert.equal(hasCurrentAnalyticsConsent({
    analyticsOptIn: false,
    analyticsConsentVersion: ANALYTICS_CONSENT_VERSION,
    analyticsConsentAt: new Date(),
  }), false);
});

test('legal acceptance marker requires current versions and a Firestore timestamp', () => {
  assert.equal(hasCurrentLegalAcceptanceMarker(undefined), false);
  assert.equal(hasCurrentLegalAcceptanceMarker({
    termsVersion: TERMS_VERSION,
    privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
    acceptedAt: new Date(),
  }), false);
  assert.equal(hasCurrentLegalAcceptanceMarker({
    termsVersion: 'old-terms',
    privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
    acceptedAt: Timestamp.now(),
  }), false);
  assert.equal(hasCurrentLegalAcceptanceMarker({
    termsVersion: TERMS_VERSION,
    privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
    acceptedAt: Timestamp.now(),
  }), true);
});

test('analytics events remain disabled by default even if a gtag global exists', () => {
  const calls = [];
  globalThis.window = {
    gtag: (...args) => calls.push(args),
    location: { origin: 'https://mood-log-app-main.vercel.app', pathname: '/private-path' },
  };

  try {
    analyticsEvents.moodLogged('private mood content');
    analyticsEvents.errorOccurred('private error', 'private message');
    analyticsEvents.pageView('private page', '/private-path?secret=value');

    assert.equal(isAnalyticsAvailable(), false);
    assert.deepEqual(calls, []);
  } finally {
    delete globalThis.window;
  }
});
