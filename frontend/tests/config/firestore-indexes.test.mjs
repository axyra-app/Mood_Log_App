import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const indexesPath = new URL('../../../firebase/firestore.indexes.json', import.meta.url);
const config = JSON.parse(await readFile(indexesPath, 'utf8'));
const vercelConfigPath = new URL('../../vercel.json', import.meta.url);
const vercelConfig = JSON.parse(await readFile(vercelConfigPath, 'utf8'));

test('Firestore composite indexes do not repeat field paths', () => {
  for (const index of config.indexes) {
    const fieldPaths = index.fields.map(({ fieldPath }) => fieldPath);
    assert.equal(
      new Set(fieldPaths).size,
      fieldPaths.length,
      `${index.collectionGroup} has duplicate field paths: ${fieldPaths.join(', ')}`,
    );
  }
});

test('Firestore composite indexes do not define duplicate index shapes', () => {
  const shapes = config.indexes.map((index) => JSON.stringify({
    collectionGroup: index.collectionGroup,
    queryScope: index.queryScope,
    fields: index.fields,
  }));

  assert.equal(new Set(shapes).size, shapes.length, 'Firestore index configuration repeats an index');
});

test('Vercel config applies security headers to all routes', () => {
  const globalHeaders = vercelConfig.headers.find(({ source }) => source === '/(.*)')?.headers ?? [];
  const headers = new Map(globalHeaders.map(({ key, value }) => [key.toLowerCase(), value]));

  assert.equal(headers.get('x-content-type-options'), 'nosniff');
  assert.equal(headers.get('x-frame-options'), 'DENY');
  assert.equal(headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
  assert.equal(headers.get('permissions-policy'), 'camera=(), geolocation=(), microphone=()');
  assert.match(headers.get('strict-transport-security') ?? '', /^max-age=31536000$/);
  assert.ok(headers.has('content-security-policy-report-only'));
  assert.equal(headers.has('content-security-policy'), false, 'CSP must remain report-only until reviewed');
});

test('report-only CSP allows required Firebase, Google sign-in, and app resources', () => {
  const globalHeaders = vercelConfig.headers.find(({ source }) => source === '/(.*)')?.headers ?? [];
  const policy = globalHeaders.find(
    ({ key }) => key.toLowerCase() === 'content-security-policy-report-only',
  )?.value ?? '';

  for (const directive of [
    "default-src 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    'https://*.googleapis.com',
    'https://*.firebaseapp.com',
    'https://accounts.google.com',
    'https://i.postimg.cc',
    "worker-src 'self' blob:",
  ]) {
    assert.ok(policy.includes(directive), `CSP is missing ${directive}`);
  }
});
