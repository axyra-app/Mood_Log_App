import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

const MAX_REQUEST_BYTES = 24_000;
const MAX_DAILY_REQUESTS = 40;
const MODEL = 'openai/gpt-oss-20b';

type AssistantId = 'mia' | 'reflection';
type AiTask = 'chat' | 'journal-analysis' | 'mood-analysis';

interface AiRequest {
  task?: unknown;
  assistantId?: unknown;
  message?: unknown;
  content?: unknown;
  moodData?: unknown;
}

interface FirebaseAdminCredentials {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

type FirebaseAdminConfigurationErrorCode =
  | 'missing-credentials'
  | 'invalid-json'
  | 'invalid-credentials'
  | 'project-mismatch';

class FirebaseAdminConfigurationError extends Error {
  readonly code: FirebaseAdminConfigurationErrorCode;

  constructor(code: FirebaseAdminConfigurationErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

export const parseFirebaseAdminCredentials = (
  serviceAccountValue: string | undefined,
  configuredProjectId: string | undefined,
): FirebaseAdminCredentials => {
  const rawValue = serviceAccountValue?.trim();
  if (!rawValue) {
    throw new FirebaseAdminConfigurationError(
      'missing-credentials',
      'Falta FIREBASE_SERVICE_ACCOUNT_JSON en la configuración del servidor.',
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawValue);
    if (typeof parsed === 'string') parsed = JSON.parse(parsed);
  } catch {
    throw new FirebaseAdminConfigurationError(
      'invalid-json',
      'FIREBASE_SERVICE_ACCOUNT_JSON debe contener el JSON completo de una cuenta de servicio.',
    );
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new FirebaseAdminConfigurationError(
      'invalid-credentials',
      'FIREBASE_SERVICE_ACCOUNT_JSON no contiene una cuenta de servicio válida.',
    );
  }

  const account = parsed as Record<string, unknown>;
  const credentialProjectId = typeof account.project_id === 'string' ? account.project_id.trim() : '';
  const projectId = configuredProjectId?.trim() || credentialProjectId;
  const clientEmail = typeof account.client_email === 'string' ? account.client_email.trim() : '';
  const privateKey = typeof account.private_key === 'string'
    ? account.private_key.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n').trim()
    : '';

  if (
    !projectId
    || !credentialProjectId
    || !clientEmail
    || !privateKey.includes('-----BEGIN PRIVATE KEY-----')
    || !privateKey.includes('-----END PRIVATE KEY-----')
  ) {
    throw new FirebaseAdminConfigurationError(
      'invalid-credentials',
      'La cuenta de servicio está incompleta o su clave privada no tiene un formato PEM válido.',
    );
  }

  if (configuredProjectId?.trim() && configuredProjectId.trim() !== credentialProjectId) {
    throw new FirebaseAdminConfigurationError(
      'project-mismatch',
      'FIREBASE_PROJECT_ID no coincide con el proyecto de la cuenta de servicio.',
    );
  }

  return { projectId, clientEmail, privateKey };
};

const assistantPrompts: Record<AssistantId, string> = {
  mia: `Eres MIA, una asistente de IA centrada en acompañar la autorreflexión sobre el estado de ánimo. Escucha con calidez y sin juzgar; ayuda a la persona a identificar y expresar sus emociones, explorar qué necesita en este momento y considerar un pequeño paso cotidiano que cuide su bienestar. Mantén las respuestas breves y conversacionales, haz una pregunta abierta cada vez y no presupongas causas ni sentimientos que la persona no haya mencionado. No afirmes tener formación o experiencia profesional, no diagnostiques ni recomiendes tratamientos. No presentes tus respuestas como atención clínica o asesoría médica. Si la persona describe peligro inmediato o una emergencia, anímala a contactar los servicios de emergencia locales y a una persona de confianza.`,
  reflection: `Eres una guía de IA para autorreflexión. Ayuda a la persona a explorar una situación mediante preguntas abiertas, identificar perspectivas y pensar en pequeños pasos prácticos. Mantén un tono respetuoso y evita juicios. No afirmes tener formación o experiencia profesional, no diagnostiques, no recomiendes tratamientos ni presentes tus respuestas como atención clínica o asesoría médica. Si la persona describe peligro inmediato o una emergencia, anímala a contactar los servicios de emergencia locales y a una persona de confianza.`,
};

const journalSystemPrompt = `Eres un asistente de IA que resume entradas de diario para apoyar la autorreflexión. No eres profesional de salud y no brindas atención clínica, diagnósticos ni tratamientos. Resume el texto de forma empática, clara y no clínica; identifica sentimiento general (positive, negative o neutral), temas principales, observaciones descriptivas y sugerencias cotidianas de autorreflexión. Responde en español y en JSON con las propiedades sentiment, themes, insights, recommendations y summary.`;

const moodSystemPrompt = `Eres un asistente de IA que resume datos personales de estado de ánimo para apoyar la autorreflexión. No eres profesional de salud y no brindas atención clínica, diagnósticos ni tratamientos. Usa únicamente los datos recibidos, no infieras causas clínicas y presenta patrones como observaciones descriptivas. Responde en español como JSON: summary debe ser una cadena; patterns, insights, recommendations, nextSteps, keyFactors, interventionStrategies y wellnessPlan deben ser siempre arreglos JSON de cadenas, aunque solo haya un elemento (nunca los devuelvas como párrafos); riskLevel debe ser exactamente low, medium o high; moodTrend debe ser exactamente improving, stable o declining.`;

const jsonResponse = (status: number, body: unknown, headers: HeadersInit = {}): Response =>
  Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      ...headers,
    },
  });

const sendError = (status: number, message: string, headers: HeadersInit = {}): Response =>
  jsonResponse(status, { error: message }, headers);

const getSafeErrorCode = (error: unknown): string => {
  if (!error || typeof error !== 'object' || !('code' in error)) {
    return error instanceof Error ? error.name : 'UnknownError';
  }
  const code = error.code;
  return typeof code === 'string' && /^[A-Za-z0-9/_-]{1,80}$/.test(code)
    ? code
    : error instanceof Error ? error.name : 'UnknownError';
};

export const isInvalidFirebaseIdTokenError = (errorCode: string): boolean =>
  /^auth\/(argument-error|id-token-expired|invalid-id-token|id-token-revoked|user-disabled|user-not-found)$/.test(errorCode);

export const hasPendingAccountDeletion = async (
  firestore: Awaited<ReturnType<typeof getAdminServices>>['firestore'],
  uid: string,
): Promise<boolean> => {
  const deletionRequest = await firestore.collection('accountDeletionRequests').doc(uid).get();
  return deletionRequest.exists;
};

const parseBody = (body: unknown): AiRequest | null => {
  if (typeof body === 'string') {
    try {
      const parsed: unknown = JSON.parse(body);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? parsed as AiRequest
        : null;
    } catch {
      return null;
    }
  }
  return body && typeof body === 'object' && !Array.isArray(body)
    ? body as AiRequest
    : null;
};

const getAdminServices = async () => {
  const credentials = parseFirebaseAdminCredentials(
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON,
    process.env.FIREBASE_PROJECT_ID,
  );

  const app = getApps()[0] ?? initializeApp({
    credential: cert(credentials),
    projectId: credentials.projectId,
  });

  return {
    auth: getAuth(app),
    firestore: getFirestore(app),
    fieldValue: FieldValue,
  };
};

const consumeDailyQuota = async (
  uid: string,
  firestore: Awaited<ReturnType<typeof getAdminServices>>['firestore'],
  fieldValue: Awaited<ReturnType<typeof getAdminServices>>['fieldValue'],
): Promise<boolean> => {
  const day = new Date().toISOString().slice(0, 10);
  const quotaRef = firestore.collection('aiUsage').doc(uid);

  return firestore.runTransaction(async (transaction) => {
    const quota = await transaction.get(quotaRef);
    const data = quota.data();
    const currentCount = data?.day === day && typeof data.count === 'number' ? data.count : 0;

    if (currentCount >= MAX_DAILY_REQUESTS) {
      return false;
    }

    transaction.set(quotaRef, {
      day,
      count: currentCount + 1,
      updatedAt: fieldValue.serverTimestamp(),
    });
    return true;
  });
};

const getChatRequest = (body: AiRequest): { prompt: string; message: string } | null => {
  const assistantId = body.assistantId;
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if ((assistantId !== 'mia' && assistantId !== 'reflection') || !message || message.length > 4_000) {
    return null;
  }
  return { prompt: assistantPrompts[assistantId], message };
};

const getJournalContent = (body: AiRequest): string | null => {
  const content = typeof body.content === 'string' ? body.content.trim() : '';
  return content && content.length <= 5_000 ? content : null;
};

const getMoodData = (body: AiRequest): string | null => {
  if (!body.moodData || typeof body.moodData !== 'object' || Array.isArray(body.moodData)) {
    return null;
  }
  const serialized = JSON.stringify(body.moodData);
  if (serialized.length > 18_000) {
    return null;
  }

  const parsed = body.moodData as { moodLogs?: unknown[] };
  if (!Array.isArray(parsed.moodLogs) || parsed.moodLogs.length === 0 || parsed.moodLogs.length > 60) {
    return null;
  }
  return serialized;
};

const isValidTaskRequest = (task: AiTask, body: AiRequest): boolean => {
  if (task === 'chat') return getChatRequest(body) !== null;
  if (task === 'journal-analysis') return getJournalContent(body) !== null;
  return getMoodData(body) !== null;
};

const requestGroq = async (
  task: AiTask,
  body: AiRequest,
): Promise<string | Record<string, unknown> | null> => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('Missing Groq API key.');
  }

  const { default: Groq } = await import('groq-sdk');
  const groq = new Groq({ apiKey });
  let systemPrompt: string;
  let userContent: string;
  const jsonResponse = task !== 'chat';

  if (task === 'chat') {
    const chatRequest = getChatRequest(body);
    if (!chatRequest) return null;
    systemPrompt = chatRequest.prompt;
    userContent = chatRequest.message;
  } else if (task === 'journal-analysis') {
    const content = getJournalContent(body);
    if (!content) return null;
    systemPrompt = journalSystemPrompt;
    userContent = content;
  } else {
    const moodData = getMoodData(body);
    if (!moodData) return null;
    systemPrompt = moodSystemPrompt;
    userContent = moodData;
  }

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
    temperature: 0.7,
    max_tokens: task === 'mood-analysis' ? 2_000 : 800,
    ...(jsonResponse ? { response_format: { type: 'json_object' as const } } : {}),
  });
  const content = completion.choices[0]?.message?.content?.trim();
  if (!content) {
    throw new Error('Groq returned an empty response.');
  }

  if (!jsonResponse) return content;
  const parsed: unknown = JSON.parse(content);
  return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
    ? parsed as Record<string, unknown>
    : null;
};

export default {
  async fetch(req: Request): Promise<Response> {
    if (req.method !== 'POST') {
      return sendError(405, 'Método no permitido.', { Allow: 'POST' });
    }

    const contentLengthHeader = req.headers.get('content-length');
    const contentLength = contentLengthHeader ? Number(contentLengthHeader) : 0;
    if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
      return sendError(413, 'La solicitud supera el tamaño permitido.');
    }

    const rawBody = await req.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_REQUEST_BYTES) {
      return sendError(413, 'La solicitud supera el tamaño permitido.');
    }
    const body = parseBody(rawBody);
    if (!process.env.GROQ_API_KEY) {
      return sendError(503, 'El servicio de IA aún no está configurado.');
    }

    let services: Awaited<ReturnType<typeof getAdminServices>>;
    try {
      services = await getAdminServices();
    } catch (error) {
      if (error instanceof FirebaseAdminConfigurationError) {
        console.error('AI service configuration failed:', error.code);
        return sendError(503, error.message);
      }
      const errorCode = getSafeErrorCode(error);
      console.error('AI service initialization failed:', errorCode);
      return sendError(
        503,
        `No se pudo iniciar Firebase Admin (código: ${errorCode}). Comparte solo el código; nunca compartas claves ni credenciales.`,
      );
    }

    const authorization = req.headers.get('authorization') || '';
    const token = authorization.startsWith('Bearer ')
      ? authorization.slice('Bearer '.length)
      : '';
    if (!token) {
      return sendError(401, 'Inicia sesión para usar las funciones de IA.');
    }

    let uid: string;
    try {
      uid = (await services.auth.verifyIdToken(token)).uid;
    } catch (error) {
      const errorCode = getSafeErrorCode(error);
      if (isInvalidFirebaseIdTokenError(errorCode)) {
        return sendError(401, 'La sesión no es válida. Inicia sesión nuevamente.');
      }
      console.error('AI authentication service failed:', errorCode);
      return sendError(
        503,
        `Firebase Authentication no pudo validar la sesión (código: ${errorCode}). No compartas tokens.`,
      );
    }

    if (!body || !['chat', 'journal-analysis', 'mood-analysis'].includes(String(body.task))) {
      return sendError(400, 'La solicitud de IA no es válida.');
    }

    try {
      if (await hasPendingAccountDeletion(services.firestore, uid)) {
        return sendError(403, 'La cuenta está en proceso de eliminación.');
      }
    } catch (error) {
      console.error('AI account deletion status check failed:', getSafeErrorCode(error));
      return sendError(503, 'No se pudo comprobar el estado de la cuenta. Inténtalo de nuevo.');
    }

    const task = body.task as AiTask;
    if (!isValidTaskRequest(task, body)) {
      return sendError(400, 'Los datos enviados no son válidos o superan el límite permitido.');
    }

    let hasQuota: boolean;
    try {
      hasQuota = await consumeDailyQuota(uid, services.firestore, services.fieldValue);
    } catch (error) {
      console.error('AI quota check failed:', getSafeErrorCode(error));
      return sendError(
        503,
        'No se pudo comprobar el límite de uso en Firestore. Verifica los permisos de Firestore de la cuenta de servicio.',
      );
    }
    if (!hasQuota) {
      return sendError(429, 'Alcanzaste el límite diario de solicitudes de IA. Inténtalo mañana.');
    }

    try {
      const result = await requestGroq(task, body);
      if (result === null) {
        return sendError(400, 'Los datos enviados no son válidos o superan el límite permitido.');
      }
      return jsonResponse(200, { result });
    } catch (error) {
      console.error('AI provider request failed:', getSafeErrorCode(error));
      return sendError(503, 'No fue posible completar el análisis de IA. Inténtalo de nuevo más tarde.');
    }
  }
};
