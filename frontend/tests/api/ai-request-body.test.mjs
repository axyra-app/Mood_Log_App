import assert from 'node:assert/strict';
import test from 'node:test';
import { readRequestBodyWithinLimit } from '../../api/ai.ts';

const requestWithChunks = (chunks) => new Request('https://example.test/api/ai', {
  method: 'POST',
  body: new ReadableStream({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(new TextEncoder().encode(chunk));
      controller.close();
    },
  }),
  duplex: 'half',
});

test('reads a streamed request body within the byte limit', async () => {
  const request = requestWithChunks(['{"task":', '"chat"}']);
  assert.equal(await readRequestBodyWithinLimit(request, 20), '{"task":"chat"}');
});

test('stops a streamed request body that exceeds the limit without Content-Length', async () => {
  const request = requestWithChunks(['12345', '67890']);
  assert.equal(await readRequestBodyWithinLimit(request, 8), null);
});

test('counts UTF-8 bytes instead of JavaScript characters', async () => {
  const request = requestWithChunks(['áá']);
  assert.equal(await readRequestBodyWithinLimit(request, 3), null);
});
