import { createServer } from 'node:http';
import { createDevApiEmulatorHandlers } from './devApiEmulatorRoutes.mjs';

const expectedEnvironment = {
  NODE_ENV: 'development',
  MOOD_LOG_USE_FIREBASE_EMULATORS: 'true',
  FIREBASE_PROJECT_ID: 'demo-mood-log-local',
  FIREBASE_STORAGE_BUCKET: 'demo-mood-log-local.firebasestorage.app',
  VITE_FIREBASE_STORAGE_BUCKET: 'demo-mood-log-local.firebasestorage.app',
  FIREBASE_AUTH_EMULATOR_HOST: '127.0.0.1:9099',
  FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080',
  STORAGE_EMULATOR_HOST: '127.0.0.1:9199',
};

for (const [key, value] of Object.entries(expectedEnvironment)) {
  if (process.env[key] && process.env[key] !== value) {
    throw new Error(`Unsafe local emulator override for ${key}.`);
  }
  process.env[key] = value;
}

const handlers = await createDevApiEmulatorHandlers();

const MAX_BODY_BYTES = 32_000;

const toWebHeaders = (nodeHeaders) => {
  const headers = new Headers();
  for (const [name, value] of Object.entries(nodeHeaders)) {
    if (Array.isArray(value)) headers.set(name, value.join(', '));
    else if (typeof value === 'string') headers.set(name, value);
  }
  return headers;
};

const readBody = async (request, response) => {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.byteLength;
    if (size > MAX_BODY_BYTES) {
      response.writeHead(413, { 'content-type': 'application/json', 'cache-control': 'no-store' });
      response.end(JSON.stringify({ error: 'Solicitud demasiado grande para el servidor local.' }));
      return null;
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
};

const server = createServer(async (incoming, outgoing) => {
  const url = new URL(incoming.url || '/', 'http://127.0.0.1:3001');
  const handler = handlers.get(url.pathname);
  if (!handler) {
    outgoing.writeHead(404, { 'content-type': 'application/json', 'cache-control': 'no-store' });
    outgoing.end(JSON.stringify({ error: 'Ruta API local no encontrada.' }));
    return;
  }

  try {
    const body = ['GET', 'HEAD'].includes(incoming.method || 'GET')
      ? Buffer.alloc(0)
      : await readBody(incoming, outgoing);
    if (body === null) return;

    const request = new Request(`http://127.0.0.1:3001${url.pathname}${url.search}`, {
      method: incoming.method,
      headers: toWebHeaders(incoming.headers),
      ...(body.byteLength > 0 ? { body } : {}),
    });
    const apiResponse = await handler(request);
    outgoing.statusCode = apiResponse.status;
    apiResponse.headers.forEach((value, name) => {
      if (!['connection', 'transfer-encoding'].includes(name.toLowerCase())) {
        outgoing.setHeader(name, value);
      }
    });
    outgoing.end(Buffer.from(await apiResponse.arrayBuffer()));
  } catch (error) {
    console.error('Local emulator API request failed:', error instanceof Error ? error.name : 'UnknownError');
    outgoing.writeHead(500, { 'content-type': 'application/json', 'cache-control': 'no-store' });
    outgoing.end(JSON.stringify({ error: 'Error interno en la API local.' }));
  }
});

server.listen(3001, '127.0.0.1', () => {
  console.log('Local API emulator bridge listening at http://127.0.0.1:3001');
  console.log(`Firebase Admin is restricted to ${expectedEnvironment.FIREBASE_PROJECT_ID} emulators.`);
});

const shutdown = () => server.close(() => process.exit(0));
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
