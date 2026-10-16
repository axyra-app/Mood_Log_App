import Groq from 'groq-sdk';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

interface VercelRequest {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
}

interface VercelResponse {
  setHeader(name: string, value: string): void;
  status(code: number): VercelResponse;
  json(body: unknown): void;
}

const MAX_REQUEST_BYTES = 24_000;
const MAX_DAILY_REQUESTS = 40;
const MODEL = 'llama-3.1-8b-instant';

type AssistantId = 'mia' | 'reflection';
type AiTask = 'chat' | 'journal-analysis' | 'mood-analysis';

interface AiRequest {
  task?: unknown;
  assistantId?: unknown;
  message?: unknown;
  content?: unknown;
  moodData?: unknown;
}

const assistantPrompts: Record<AssistantId, string> = {
  mia: `Eres MIA, una asistente de IA centrada en acompañar la autorreflexión sobre el estado de ánimo. Escucha con calidez y sin juzgar; ayuda a la persona a identificar y expresar sus emociones, explorar qué necesita en este momento y considerar un pequeño paso cotidiano que cuide su bienestar. Mantén las respuestas breves y conversacionales, haz una pregunta abierta cada vez y no presupongas causas ni sentimientos que la persona no haya mencionado. No afirmes tener formación o experiencia profesional, no diagnostiques ni recomiendes tratamientos. No presentes tus respuestas como atención clínica o asesoría médica. Si la persona describe peligro inmediato o una emergencia, anímala a contactar los servicios de emergencia locales y a una persona de confianza.`,
  reflection: `Eres una guía de IA para autorreflexión. Ayuda a la persona a explorar una situación mediante preguntas abiertas, identificar perspectivas y pensar en pequeños pasos prácticos. Mantén un tono respetuoso y evita juicios. No afirmes tener formación o experiencia profesional, no diagnostiques, no recomiendes tratamientos ni presentes tus respuestas como atención clínica o asesoría médica. Si la persona describe peligro inmediato o una emergencia, anímala a contactar los servicios de emergencia locales y a una persona de confianza.`,
};

const journalSystemPrompt = `Eres un asistente de IA que resume entradas de diario para apoyar la autorreflexión. No eres profesional de salud y no brindas atención clínica, diagnósticos ni tratamientos. Resume el texto de forma empática, clara y no clínica; identifica sentimiento general (positive, negative o neutral), temas principales, observaciones descriptivas y sugerencias cotidianas de autorreflexión. Responde en español y en JSON con las propiedades sentiment, themes, insights, recommendations y summary.`;

const moodSystemPrompt = `Eres un asistente de IA que resume datos personales de estado de ánimo para apoyar la autorreflexión. No eres profesional de salud y no brindas atención clínica, diagnósticos ni tratamientos. Usa únicamente los datos recibidos, no infieras causas clínicas, presenta patrones como observaciones descriptivas y responde en español como JSON con summary, patterns, insights, recommendations, riskLevel, nextSteps, moodTrend, keyFactors, interventionStrategies y wellnessPlan. riskLevel debe ser low, medium o high; moodTrend debe ser improving, stable o declining.`;

const sendError = (res: VercelResponse, status: number, message: string): void => {
  res.status(status).json({ error: message });
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

const getAdminServices = () => {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    throw new Error('Missing Firebase Admin credentials.');
  }

  const credentials = JSON.parse(serviceAccountJson);
  const app = getApps()[0] ?? initializeApp({
    credential: cert(credentials),
    projectId: process.env.FIREBASE_PROJECT_ID || credentials.project_id,
  });

  return {
    auth: getAuth(app),
    firestore: getFirestore(app),
  };
};

const consumeDailyQuota = async (uid: string): Promise<boolean> => {
  const { firestore } = getAdminServices();
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
      updatedAt: FieldValue.serverTimestamp(),
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

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    sendError(res, 405, 'Método no permitido.');
    return;
  }

  const contentLengthHeader = req.headers['content-length'];
  const contentLength = typeof contentLengthHeader === 'string' ? Number(contentLengthHeader) : 0;
  const body = parseBody(req.body);
  const serializedBodyLength = body ? Buffer.byteLength(JSON.stringify(body), 'utf8') : 0;
  if (contentLength > MAX_REQUEST_BYTES || serializedBodyLength > MAX_REQUEST_BYTES) {
    sendError(res, 413, 'La solicitud supera el tamaño permitido.');
    return;
  }
  if (!process.env.GROQ_API_KEY || !process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    sendError(res, 503, 'El servicio de IA aún no está configurado.');
    return;
  }

  let services: ReturnType<typeof getAdminServices>;
  try {
    services = getAdminServices();
  } catch {
    sendError(res, 503, 'El servicio de IA no está configurado correctamente.');
    return;
  }

  const authorization = req.headers.authorization;
  const token = typeof authorization === 'string' && authorization.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length)
    : '';
  if (!token) {
    sendError(res, 401, 'Inicia sesión para usar las funciones de IA.');
    return;
  }

  let uid: string;
  try {
    uid = (await services.auth.verifyIdToken(token, true)).uid;
  } catch {
    sendError(res, 401, 'La sesión no es válida. Inicia sesión nuevamente.');
    return;
  }

  if (!body || !['chat', 'journal-analysis', 'mood-analysis'].includes(String(body.task))) {
    sendError(res, 400, 'La solicitud de IA no es válida.');
    return;
  }

  const task = body.task as AiTask;
  if (!isValidTaskRequest(task, body)) {
    sendError(res, 400, 'Los datos enviados no son válidos o superan el límite permitido.');
    return;
  }

  try {
    if (!(await consumeDailyQuota(uid))) {
      sendError(res, 429, 'Alcanzaste el límite diario de solicitudes de IA. Inténtalo mañana.');
      return;
    }
    const result = await requestGroq(task, body);
    if (result === null) {
      sendError(res, 400, 'Los datos enviados no son válidos o superan el límite permitido.');
      return;
    }
    res.status(200).json({ result });
  } catch (error) {
    console.error('AI request failed:', error instanceof Error ? error.name : 'UnknownError');
    sendError(res, 503, 'No fue posible completar el análisis de IA. Inténtalo de nuevo más tarde.');
  }
}
