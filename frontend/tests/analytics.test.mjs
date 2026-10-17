import assert from 'node:assert/strict';
import test from 'node:test';
import { analyticsEvents } from '../src/services/analytics.ts';

test('analytics events omit mood scores and error details', () => {
  const calls = [];
  globalThis.window = {
    gtag: (...args) => calls.push(args),
    location: { origin: 'https://mood-log-app-main.vercel.app', pathname: '/private-path' },
  };

  try {
    analyticsEvents.moodLogged('very-low-mood-note');
    analyticsEvents.errorOccurred('private-error-detail', 'private message');

    assert.deepEqual(calls, [
      ['event', 'mood_logged', { event_category: 'Mood Tracking' }],
      ['event', 'error_occurred', { event_category: 'Error', value: 1 }],
    ]);
  } finally {
    delete globalThis.window;
  }
});

test('analytics page views omit paths and query parameters', () => {
  const calls = [];
  globalThis.window = {
    gtag: (...args) => calls.push(args),
    location: {
      origin: 'https://mood-log-app-main.vercel.app',
      pathname: '/private-path',
      search: '?private=value',
    },
  };

  try {
    analyticsEvents.pageView('private page title', '/private-path?private=value');

    assert.deepEqual(calls, [[
      'config',
      'G-CY8FK7SXKQ',
      {
        page_title: 'Mood Log App',
        page_location: 'https://mood-log-app-main.vercel.app',
      },
    ]]);
  } finally {
    delete globalThis.window;
  }
});

test('authentication analytics retain only the fixed sign-in method', () => {
  const calls = [];
  globalThis.window = {
    gtag: (...args) => calls.push(args),
    location: { origin: 'https://mood-log-app-main.vercel.app' },
  };

  try {
    analyticsEvents.userLogin('google');
    assert.deepEqual(calls, [[
      'event',
      'login',
      { event_category: 'Authentication', event_label: 'google' },
    ]]);
  } finally {
    delete globalThis.window;
  }
});
