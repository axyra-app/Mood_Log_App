type ApiHandler = (request: Request) => Promise<Response>;

type IncomingRequestLike = {
  url?: unknown;
  method?: unknown;
  headers?: unknown;
  body?: unknown;
};

const NATIVE_APP_ORIGINS = ['https://localhost', 'capacitor://localhost'];
const DEVELOPMENT_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

const normalizeRequest = (incoming: Request): Request => {
  const raw = incoming as unknown as IncomingRequestLike;
  const rawHeaders = raw.headers;
  if (
    rawHeaders instanceof Headers
    && typeof raw.url === 'string'
    && /^https?:\/\//i.test(raw.url)
  ) {
    return incoming;
  }

  const headers = new Headers();
  if (rawHeaders && typeof rawHeaders === 'object') {
    for (const [name, value] of Object.entries(rawHeaders)) {
      if (typeof value === 'string') headers.set(name, value);
      else if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
        headers.set(name, value.join(', '));
      }
    }
  }

  const forwardedHost = headers.get('x-forwarded-host');
  const host = forwardedHost?.split(',')[0]?.trim() || headers.get('host') || '127.0.0.1';
  const forwardedProtocol = headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const protocol = forwardedProtocol === 'http' ? 'http' : 'https';
  const rawUrl = typeof raw.url === 'string' ? raw.url : '/';
  const url = new URL(rawUrl, `${protocol}://${host}`).toString();
  const method = typeof raw.method === 'string' ? raw.method.toUpperCase() : 'GET';
  const bodyValue = raw.body;
  let body: BodyInit | undefined;
  if (typeof bodyValue === 'string') {
    body = bodyValue;
  } else if (bodyValue instanceof Uint8Array) {
    body = new TextDecoder().decode(bodyValue);
  } else if (bodyValue !== undefined && bodyValue !== null) {
    body = JSON.stringify(bodyValue);
  }

  return new Request(url, {
    method,
    headers,
    ...(!['GET', 'HEAD'].includes(method) && body !== undefined ? { body } : {}),
  });
};

const getAllowedOrigins = (): Set<string> => {
  const origins = new Set(NATIVE_APP_ORIGINS);
  if (process.env.NODE_ENV !== 'production') {
    DEVELOPMENT_ORIGINS.forEach((origin) => origins.add(origin));
  }

  for (const configuredOrigin of (process.env.MOOD_LOG_ALLOWED_ORIGINS || '').split(',')) {
    const value = configuredOrigin.trim();
    if (!value) continue;
    try {
      const origin = new URL(value).origin;
      if (origin !== 'null') origins.add(origin);
    } catch {
      // Ignore invalid entries instead of widening the origin policy.
    }
  }
  return origins;
};

const getRequestOrigin = (request: Request): string | null => {
  try {
    return new URL(request.url).origin;
  } catch {
    return null;
  }
};

const appendVaryOrigin = (headers: Headers): void => {
  const existing = headers.get('Vary');
  const values = existing?.split(',').map((value) => value.trim().toLowerCase()) ?? [];
  if (!values.includes('*') && !values.includes('origin')) {
    headers.set('Vary', existing ? `${existing}, Origin` : 'Origin');
  }
};

const createCorsHeaders = (origin: string): Headers => {
  const headers = new Headers({
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Expose-Headers': 'Content-Disposition, Retry-After',
    'Access-Control-Max-Age': '600',
  });
  appendVaryOrigin(headers);
  return headers;
};

export const withApiCors = (handler: ApiHandler): ApiHandler => async (incoming) => {
  const request = normalizeRequest(incoming);
  const origin = request.headers.get('Origin');
  const requestOrigin = getRequestOrigin(request);
  const isSameOrigin = Boolean(origin && requestOrigin && origin === requestOrigin);
  const isAllowedOrigin = Boolean(origin && (isSameOrigin || getAllowedOrigins().has(origin)));

  if (origin && !isAllowedOrigin) {
    return Response.json({ error: 'Origen no permitido.' }, { status: 403 });
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: origin && !isSameOrigin ? createCorsHeaders(origin) : undefined,
    });
  }

  const response = await handler(request);
  if (!origin || isSameOrigin) return response;

  const headers = new Headers(response.headers);
  createCorsHeaders(origin).forEach((value, key) => headers.set(key, value));
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};
