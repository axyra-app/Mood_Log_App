import assert from 'node:assert/strict';
import test from 'node:test';
import { createDevApiEmulatorHandlers } from '../../scripts/devApiEmulatorRoutes.mjs';

const routeCases = [
  ['/api/ai', 'POST', 503],
  ['/api/delete-account', 'POST', 503],
  ['/api/legal-acceptance', 'GET', 401],
  ['/api/sensitive-data-consent', 'GET', 401],
  ['/api/user-data-export', 'POST', 401],
];

test('local API bridge routes every frontend API endpoint without auth to its handler', async () => {
  const handlers = await createDevApiEmulatorHandlers();
  assert.deepEqual([...handlers.keys()].sort(), routeCases.map(([path]) => path).sort());

  for (const [path, method, expectedStatus] of routeCases) {
    const response = await handlers.get(path)(new Request(`http://127.0.0.1:3001${path}`, { method }));
    assert.equal(response.status, expectedStatus, `${method} ${path} must reach its configured handler`);
    if (path === '/api/ai') {
      assert.match((await response.json()).error, /no está configurado/i);
    }
    if (path === '/api/delete-account') {
      assert.match((await response.json()).error, /no está habilitada/i);
    }
  }
});
