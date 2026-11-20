import assert from 'node:assert/strict';
import test from 'node:test';
import { withApiCors } from '../../api/_lib/apiCors.ts';

test('normalizes Node incoming requests before calling Web API handlers', async () => {
  const handler = withApiCors(async (request) => {
    assert.equal(request.url, 'https://mood-log-app-main.vercel.app/api/example');
    assert.equal(request.headers.get('authorization'), 'Bearer smoke');
    assert.deepEqual(await request.json(), { ok: true });
    return Response.json({ handled: true });
  });

  const response = await handler({
    url: '/api/example',
    method: 'POST',
    headers: {
      host: 'mood-log-app-main.vercel.app',
      origin: 'https://mood-log-app-main.vercel.app',
      'content-type': 'application/json',
      authorization: 'Bearer smoke',
    },
    body: { ok: true },
  });

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { handled: true });
});

test('answers native app CORS preflight without invoking the route', async () => {
  let called = false;
  const handler = withApiCors(async () => {
    called = true;
    return new Response('unexpected');
  });

  const response = await handler({
    url: '/api/example',
    method: 'OPTIONS',
    headers: {
      host: 'mood-log-app-main.vercel.app',
      origin: 'https://localhost',
    },
  });

  assert.equal(response.status, 204);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), 'https://localhost');
  assert.equal(called, false);
});
