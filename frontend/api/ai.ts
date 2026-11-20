import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore';
import { withApiCors } from './_lib/apiCors.ts';
import { ADULT_ELIGIBILITY_VERSION, AI_CONSENT_VERSION } from '../src/utils/legalVersions.ts';
import { normalizeAiProviderResult } from './_lib/aiResponse.ts';
import { isInvalidFirebaseIdTokenError, readRequestBodyWithinLimit } from './_lib/requestUtils.ts';
import {
  FirebaseAdminConfigurationError,
  getFirebaseAdminApp,
} from './_lib/firebaseAdmin.ts';
import {
  getLegalAcceptanceEventId,
  hasCurrentLegalAcceptance,
  isCurrentLegalAcceptanceEvent,
} from './_lib/legalAcceptance.ts';
import {
  hasCurrentSensitiveSelfReportConsent,
  isCurrentSensitiveSelfReportConsent,
} from './_lib/sensitiveDataConsent.ts';

const MAX_REQUEST_BYTES = 24_000;
const MAX_DAILY_REQUESTS = 40;
const MAX_REQUESTS_PER_MINUTE = 8;
const MAX_CONFIGURED_GLOBAL_REQUESTS_PER_WINDOW = 10_000;
const GLOBAL_DAILY_WINDOW_MS = 24 * 60 * 60_000;
const GROQ_REQUEST_TIMEOUT_MS = 20_000;
const DEFAULT_GROQ_MODEL = 'openai/gpt-oss-20b';
const CONFIGURABLE_GROQ_MODELS = new Set([
  DEFAULT_GROQ_MODEL,
  'openai/gpt-oss-120b',
]);
const COLOMBIA_DATE_FORMATTER = new Intl.DateTimeFormat('en', {
  timeZone: 'America/Bogota',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

type AssistantId = 'mia' | 'reflection';
type AiTask = 'chat' | 'journal-analysis' | 'mood-analysis';
type GroqUsageSummary = {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
};

type AiProviderResponse = {
  result: string | Record<string, unknown> | null;
  usage: GroqUsageSummary | null;
};

interface AiRequest {
  task?: unknown;
  assistantId?: unknown;
  message?: unknown;
  content?: unknown;
  moodData?: unknown;
  consentVersion?: unknown;
}

export { parseFirebaseAdminCredentials } from './_lib/firebaseAdmin.ts';

const assistantPrompts: Record<AssistantId, string> = {
  mia: `Eres MIA, una asistente de IA centrada en acompañar la autorreflexión sobre el estado de ánimo. Escucha con calidez y sin juzgar; ayuda a la persona a identificar y expresar sus emociones, explorar qué necesita en este momento y considerar un pequeño paso cotidiano que cuide su bienestar. Mantén las respuestas breves y conversacionales, haz una pregunta abierta cada vez y no presupongas causas ni sentimientos que la persona no haya mencionado. No afirmes tener formación o experiencia profesional, no diagnostiques ni recomiendes tratamientos. No presentes tus respuestas como atención clínica o asesoría médica. Si la persona describe peligro inmediato o una emergencia, anímala a contactar los servicios de emergencia locales y a una persona de confianza.`,
  reflection: `Eres una guía de IA para autorreflexión. Ayuda a la persona a explorar una situación mediante preguntas abiertas, identificar perspectivas y pensar en pequeños pasos prácticos. Mantén un tono respetuoso y evita juicios. No afirmes tener formación o experiencia profesional, no diagnostiques, no recomiendes tratamientos ni presentes tus respuestas como atención clínica o asesoría médica. Si la persona describe peligro inmediato o una emergencia, anímala a contactar los servicios de emergencia locales y a una persona de confianza.`,
};

const journalSystemPrompt = `Eres un asistente de IA que resume entradas de diario para apoyar la autorreflexión. No eres profesional de salud y no brindas atención clínica, diagnósticos ni tratamientos. Resume el texto de forma empática, clara y no clínica; identifica sentimiento general (positive, negative o neutral), temas principales, observaciones descriptivas y sugerencias cotidianas de autorreflexión. Responde en español y en JSON con las propiedades sentiment, themes, insights, recommendations y summary.`;

const moodSystemPrompt = `Eres un asistente de IA que resume datos personales de estado de ánimo para apoyar la autorreflexión. No eres profesional de salud y no brindas atención clínica, diagnósticos, tratamientos ni evaluaciones de riesgo. Usa únicamente los datos recibidos; no infieras causas clínicas, emociones no expresadas ni relaciones causales entre pulso y estado de ánimo. Presenta patrones como observaciones descriptivas y señala cuando los datos son insuficientes. No clasifiques el riesgo ni la salud mental. Responde en español como JSON: summary debe ser una cadena; patterns, insights, recommendations, nextSteps y keyFactors deben ser siempre arreglos JSON de cadenas, aunque solo haya un elemento (nunca los devuelvas como párrafos). Las recomendaciones deben ser opciones generales de reflexión o bienestar cotidiano, sin urgencias, diagnósticos, tratamientos ni instrucciones clínicas.`;

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

const getProviderRetryAfter = (error: unknown): string | null => {
  if (!error || typeof error !== 'object' || !('headers' in error)) return null;
  const headers = error.headers;
  if (!(headers instanceof Headers)) return null;
  const value = headers.get('retry-after');
  return value && /^\d{1,6}$/.test(value) ? value : null;
};

export const hasPendingAccountDeletion = async (
  firestore: Awaited<ReturnType<typeof getAdminServices>>['firestore'],
  uid: string,
): Promise<boolean> => {
  const deletionRequest = await firestore.collection('accountDeletionRequests').doc(uid).get();
  return deletionRequest.exists;
};

export const hasCurrentAdultEligibility = async (
  firestore: Awaited<ReturnType<typeof getAdminServices>>['firestore'],
  uid: string,
): Promise<boolean> => {
  const profile = await firestore.collection('users').doc(uid).get();
  const eligibility = profile.data()?.adultEligibility;
  return eligibility?.isAdult === true
    && eligibility.version === ADULT_ELIGIBILITY_VERSION
    && eligibility.attestedAt instanceof Timestamp;
};

const hasEligibleAdultProfile = (profile: { data: () => unknown }): boolean => {
  const data = profile.data();
  if (!data || typeof data !== 'object' || Array.isArray(data)) return false;
  const eligibility = (data as Record<string, unknown>).adultEligibility;
  if (!eligibility || typeof eligibility !== 'object' || Array.isArray(eligibility)) return false;
  const attestation = eligibility as Record<string, unknown>;
  return attestation.isAdult === true
    && attestation.version === ADULT_ELIGIBILITY_VERSION
    && attestation.attestedAt instanceof Timestamp;
};

export const hasCurrentAiConsent = (consentVersion: unknown): boolean =>
  consentVersion === AI_CONSENT_VERSION;

export const getConfiguredGroqModel = (configuredModel: string | undefined): string | null => {
  const model = configuredModel?.trim() || DEFAULT_GROQ_MODEL;
  return CONFIGURABLE_GROQ_MODELS.has(model) ? model : null;
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

export { isInvalidFirebaseIdTokenError, readRequestBodyWithinLimit } from './_lib/requestUtils.ts';

const getAdminServices = async () => {
  const app = getFirebaseAdminApp();

  return {
    auth: getAuth(app),
    firestore: getFirestore(app),
    fieldValue: FieldValue,
  };
};

export type AiQuotaDecision =
  | 'allowed'
  | 'daily-limit'
  | 'minute-limit'
  | 'global-daily-limit'
  | 'global-minute-limit'
  | 'global-config-mismatch'
  | 'account-deleting'
  | 'account-ineligible';

export type AiGlobalRequestLimitConfig = {
  scope: string;
  requestsPerMinute: number;
  requestsPer24Hours: number;
};

export type AiGlobalRequestLimitConfigResult =
  | { status: 'configured'; config: AiGlobalRequestLimitConfig }
  | { status: 'missing' | 'invalid' };

export const getConfiguredAiGlobalRequestLimits = (
  environment: Record<string, string | undefined>,
): AiGlobalRequestLimitConfigResult => {
  const scope = environment.GROQ_LIMIT_SCOPE?.trim() || '';
  const rpmValue = environment.GROQ_PROJECT_RPM_LIMIT?.trim() || '';
  const rpdValue = environment.GROQ_PROJECT_RPD_LIMIT?.trim() || '';
  if (!scope && !rpmValue && !rpdValue) return { status: 'missing' };

  const parseLimit = (value: string): number | null => {
    if (!/^\d{1,5}$/.test(value)) return null;
    const limit = Number(value);
    return Number.isSafeInteger(limit)
      && limit >= 1
      && limit <= MAX_CONFIGURED_GLOBAL_REQUESTS_PER_WINDOW
      ? limit
      : null;
  };
  const requestsPerMinute = parseLimit(rpmValue);
  const requestsPer24Hours = parseLimit(rpdValue);
  if (
    !/^[A-Za-z0-9_-]{1,80}$/.test(scope)
    || requestsPerMinute === null
    || requestsPer24Hours === null
  ) return { status: 'invalid' };

  return {
    status: 'configured',
    config: { scope, requestsPerMinute, requestsPer24Hours },
  };
};

const getColombiaQuotaDay = (date: Date): string => {
  const parts = Object.fromEntries(
    COLOMBIA_DATE_FORMATTER.formatToParts(date).map(({ type, value }) => [type, value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
};

const summarizeGroqUsage = (usage: unknown): GroqUsageSummary | null => {
  if (!usage || typeof usage !== 'object') return null;
  const values = usage as Record<string, unknown>;
  const promptTokens = values.prompt_tokens;
  const completionTokens = values.completion_tokens;
  const totalTokens = values.total_tokens;
  if (
    ![promptTokens, completionTokens, totalTokens].every((value) =>
      typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
    )
  ) return null;
  return {
    promptTokens: promptTokens as number,
    completionTokens: completionTokens as number,
    totalTokens: totalTokens as number,
  };
};

export const recordGroqUsage = async (
  uid: string,
  task: AiTask,
  modelId: string,
  usage: GroqUsageSummary | null,
  firestore: Awaited<ReturnType<typeof getAdminServices>>['firestore'],
  fieldValue: Awaited<ReturnType<typeof getAdminServices>>['fieldValue'],
): Promise<void> => {
  if (!usage) return;

  const quotaRef = firestore.collection('aiUsage').doc(uid);
  const deletionRequestRef = firestore.collection('accountDeletionRequests').doc(uid);
  const profileRef = firestore.collection('users').doc(uid);
  const day = getColombiaQuotaDay(new Date());
  await firestore.runTransaction(async (transaction) => {
    const [deletionRequest, profile, snapshot] = await Promise.all([
      transaction.get(deletionRequestRef),
      transaction.get(profileRef),
      transaction.get(quotaRef),
    ]);
    if (deletionRequest.exists || !profile.exists || !hasEligibleAdultProfile(profile)) return;
    const data = snapshot.data();
    const existingProviderUsage = data?.providerUsage;
    const previousDay = existingProviderUsage?.day === day ? existingProviderUsage : null;
    const models = previousDay?.models && typeof previousDay.models === 'object'
      ? { ...previousDay.models }
      : {};
    const tasks: Record<string, Record<string, unknown>> =
      models[modelId] && typeof models[modelId] === 'object'
        ? { ...models[modelId] }
      : {};
    const previous = tasks[task] && typeof tasks[task] === 'object'
      ? tasks[task]
      : {};
    const addSafe = (value: unknown, increment: number): number =>
      typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
        ? value + increment
        : increment;

    tasks[task] = {
      requests: addSafe(previous.requests, 1),
      promptTokens: addSafe(previous.promptTokens, usage.promptTokens),
      completionTokens: addSafe(previous.completionTokens, usage.completionTokens),
      totalTokens: addSafe(previous.totalTokens, usage.totalTokens),
    };
    models[modelId] = tasks;
    transaction.set(quotaRef, {
      providerUsage: {
        day,
        models,
        updatedAt: fieldValue.serverTimestamp(),
      },
    }, { merge: true });
  });
};

export type AiConsentEventDecision =
  | { status: 'recorded'; activeRequestId: string }
  | { status: 'account-deleting' }
  | { status: 'account-ineligible' }
  | { status: 'consent-unavailable' };

export const recordAiConsentEvent = async (
  uid: string,
  task: AiTask,
  firestore: Awaited<ReturnType<typeof getAdminServices>>['firestore'],
): Promise<AiConsentEventDecision> => {
  const deletionRequestRef = firestore.collection('accountDeletionRequests').doc(uid);
  const profileRef = firestore.collection('users').doc(uid);
  const legalAcceptanceEventRef = firestore.collection('legalAcceptanceEvents').doc(getLegalAcceptanceEventId(uid));
  const eventRef = firestore.collection('aiConsentEvents').doc();
  const activeRequestRef = firestore.collection('activeAiRequests').doc();
  return firestore.runTransaction(async (transaction) => {
    const [deletionRequest, profile, legalAcceptanceEvent] = await Promise.all([
      transaction.get(deletionRequestRef),
      transaction.get(profileRef),
      transaction.get(legalAcceptanceEventRef),
    ]);
    if (deletionRequest.exists) return { status: 'account-deleting' };
    if (!profile.exists || !hasEligibleAdultProfile(profile)) return { status: 'account-ineligible' };

    const profileData = profile.data();
    const legalAcceptance = profileData?.legalAcceptance;
    if (
      !legalAcceptanceEvent.exists
      || !isCurrentLegalAcceptanceEvent(legalAcceptanceEvent.data(), uid)
      || legalAcceptance?.termsVersion !== legalAcceptanceEvent.data()?.termsVersion
      || legalAcceptance?.privacyNoticeVersion !== legalAcceptanceEvent.data()?.privacyNoticeVersion
      || !(legalAcceptance?.acceptedAt instanceof Timestamp)
    ) return { status: 'consent-unavailable' };

    if (task === 'journal-analysis' || task === 'mood-analysis') {
      const sensitiveConsent = profileData?.sensitiveSelfReportConsent;
      if (typeof sensitiveConsent?.eventId !== 'string') return { status: 'consent-unavailable' };
      const sensitiveConsentEvent = await transaction.get(
        firestore.collection('sensitiveDataConsentEvents').doc(sensitiveConsent.eventId),
      );
      if (
        !sensitiveConsentEvent.exists
        || !isCurrentSensitiveSelfReportConsent(profileData, sensitiveConsentEvent.data(), uid)
      ) return { status: 'consent-unavailable' };
    }

    transaction.create(eventRef, {
      userId: uid,
      task,
      consentVersion: AI_CONSENT_VERSION,
      agreedAt: FieldValue.serverTimestamp(),
    });
    transaction.create(activeRequestRef, {
      userId: uid,
      task,
      startedAt: FieldValue.serverTimestamp(),
      leaseExpiresAt: Timestamp.fromMillis(Date.now() + 60_000),
    });
    return { status: 'recorded', activeRequestId: activeRequestRef.id };
  });
};

export const consumeAiQuota = async (
  uid: string,
  firestore: Awaited<ReturnType<typeof getAdminServices>>['firestore'],
  fieldValue: Awaited<ReturnType<typeof getAdminServices>>['fieldValue'],
  globalLimits?: AiGlobalRequestLimitConfig,
): Promise<AiQuotaDecision> => {
  const quotaRef = firestore.collection('aiUsage').doc(uid);
  const deletionRequestRef = firestore.collection('accountDeletionRequests').doc(uid);
  const profileRef = firestore.collection('users').doc(uid);
  const globalQuotaRef = globalLimits
    ? firestore.collection('aiGlobalRateLimits').doc(globalLimits.scope)
    : null;

  return firestore.runTransaction(async (transaction) => {
    const now = new Date();
    const day = getColombiaQuotaDay(now);
    const nowMs = now.getTime();
    const [deletionRequest, profile, quota, globalQuota] = await Promise.all([
      transaction.get(deletionRequestRef),
      transaction.get(profileRef),
      transaction.get(quotaRef),
      globalQuotaRef ? transaction.get(globalQuotaRef) : Promise.resolve(null),
    ]);
    if (deletionRequest.exists) return 'account-deleting';
    if (!profile.exists || !hasEligibleAdultProfile(profile)) return 'account-ineligible';
    const data = quota.data();
    const currentCount = data?.day === day && typeof data.count === 'number' ? data.count : 0;
    const recentRequestTimes = Array.isArray(data?.minuteRequestTimestamps)
      ? data.minuteRequestTimestamps.filter((timestamp): timestamp is number =>
        typeof timestamp === 'number'
        && Number.isSafeInteger(timestamp)
        && timestamp > nowMs - 60_000
        && timestamp <= nowMs
      )
      : [];

    if (currentCount >= MAX_DAILY_REQUESTS) {
      return 'daily-limit';
    }
    if (recentRequestTimes.length >= MAX_REQUESTS_PER_MINUTE) {
      return 'minute-limit';
    }

    const globalData = globalQuota?.data();
    const recentGlobalMinuteTimes = Array.isArray(globalData?.minuteRequestTimestamps)
      ? globalData.minuteRequestTimestamps.filter((timestamp): timestamp is number =>
        typeof timestamp === 'number'
        && Number.isSafeInteger(timestamp)
        && timestamp > nowMs - 60_000
        && timestamp <= nowMs
      )
      : [];
    const recentGlobalDailyTimes = Array.isArray(globalData?.dailyRequestTimestamps)
      ? globalData.dailyRequestTimestamps.filter((timestamp): timestamp is number =>
        typeof timestamp === 'number'
        && Number.isSafeInteger(timestamp)
        && timestamp > nowMs - GLOBAL_DAILY_WINDOW_MS
        && timestamp <= nowMs
      )
      : [];
    const storedGlobalRpm = globalData?.requestsPerMinute;
    const storedGlobalRpd = globalData?.requestsPer24Hours;
    const hasStoredGlobalLimits = Number.isSafeInteger(storedGlobalRpm)
      && typeof storedGlobalRpm === 'number'
      && storedGlobalRpm >= 1
      && Number.isSafeInteger(storedGlobalRpd)
      && typeof storedGlobalRpd === 'number'
      && storedGlobalRpd >= 1;
    const hasRecentGlobalActivity = recentGlobalMinuteTimes.length > 0
      || recentGlobalDailyTimes.length > 0;
    if (
      globalLimits
      && hasRecentGlobalActivity
      && (!hasStoredGlobalLimits
        || storedGlobalRpm !== globalLimits.requestsPerMinute
        || storedGlobalRpd !== globalLimits.requestsPer24Hours)
    ) return 'global-config-mismatch';
    if (
      globalLimits
      && recentGlobalMinuteTimes.length >= globalLimits.requestsPerMinute
    ) return 'global-minute-limit';
    if (
      globalLimits
      && recentGlobalDailyTimes.length >= globalLimits.requestsPer24Hours
    ) return 'global-daily-limit';

    transaction.set(quotaRef, {
      day,
      count: currentCount + 1,
      minuteRequestTimestamps: [...recentRequestTimes, nowMs],
      updatedAt: fieldValue.serverTimestamp(),
    });
    if (globalQuotaRef && globalLimits) {
      transaction.set(globalQuotaRef, {
        scope: globalLimits.scope,
        requestsPerMinute: globalLimits.requestsPerMinute,
        requestsPer24Hours: globalLimits.requestsPer24Hours,
        minuteRequestTimestamps: [...recentGlobalMinuteTimes, nowMs],
        dailyRequestTimestamps: [...recentGlobalDailyTimes, nowMs],
        updatedAt: fieldValue.serverTimestamp(),
      });
    }
    return 'allowed';
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

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const hasOnlyKeys = (value: Record<string, unknown>, allowedKeys: Set<string>): boolean =>
  Object.keys(value).every((key) => allowedKeys.has(key));

const isMoodScore = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 1 && value <= 10;

const isBoundedLabelList = (value: unknown): value is string[] =>
  Array.isArray(value)
  && value.length <= 4
  && value.every((item) => typeof item === 'string' && item.length <= 32);

const MOOD_DATA_KEYS = new Set(['period', 'moodLogs']);
const MOOD_LOG_KEYS = new Set([
  'date', 'mood', 'energy', 'stress', 'sleep', 'emotions', 'activities', 'notes',
]);

const getMoodData = (body: AiRequest): string | null => {
  if (!isObjectRecord(body.moodData) || !hasOnlyKeys(body.moodData, MOOD_DATA_KEYS)) {
    return null;
  }

  const parsed = body.moodData;
  if (
    (parsed.period !== undefined && (typeof parsed.period !== 'string' || parsed.period.length > 120))
    || !Array.isArray(parsed.moodLogs)
    || parsed.moodLogs.length === 0
    || parsed.moodLogs.length > 60
  ) return null;

  const moodLogs: Record<string, unknown>[] = [];
  for (const value of parsed.moodLogs) {
    if (!isObjectRecord(value) || !hasOnlyKeys(value, MOOD_LOG_KEYS)) return null;
    const parsedDate = typeof value.date === 'string' ? new Date(value.date) : null;
    if (
      typeof value.date !== 'string'
      || !parsedDate
      || !Number.isFinite(parsedDate.getTime())
      || parsedDate.toISOString() !== value.date
      || !isMoodScore(value.mood)
    ) return null;

    const log: Record<string, unknown> = {
      date: value.date,
      mood: value.mood,
    };
    for (const key of ['energy', 'stress', 'sleep'] as const) {
      if (value[key] !== undefined) {
        if (!isMoodScore(value[key])) return null;
        log[key] = value[key];
      }
    }
    for (const key of ['emotions', 'activities'] as const) {
      if (value[key] !== undefined) {
        if (!isBoundedLabelList(value[key])) return null;
        log[key] = value[key];
      }
    }
    if (value.notes !== undefined) {
      if (typeof value.notes !== 'string' || value.notes.length > 180) return null;
      log.notes = value.notes;
    }
    moodLogs.push(log);
  }

  const sanitized = JSON.stringify({
    ...(typeof parsed.period === 'string' ? { period: parsed.period } : {}),
    moodLogs,
  });
  return new TextEncoder().encode(sanitized).byteLength <= 18_000 ? sanitized : null;
};

const isValidTaskRequest = (task: AiTask, body: AiRequest): boolean => {
  if (task === 'chat') return getChatRequest(body) !== null;
  if (task === 'journal-analysis') return getJournalContent(body) !== null;
  return getMoodData(body) !== null;
};

const requestGroq = async (
  task: AiTask,
  body: AiRequest,
  modelId: string,
): Promise<AiProviderResponse | null> => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('Missing Groq API key.');
  }

  const { default: Groq } = await import('groq-sdk');
  const groq = new Groq({
    apiKey,
    timeout: GROQ_REQUEST_TIMEOUT_MS,
    maxRetries: 0,
  });
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
    model: modelId,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
    temperature: 0.7,
    max_tokens: task === 'mood-analysis' ? 2_000 : 800,
    ...(jsonResponse ? { response_format: { type: 'json_object' as const } } : {}),
  });
  const content = completion.choices[0]?.message?.content?.trim();
  const usage = summarizeGroqUsage(completion.usage);
  if (!content) {
    return { result: null, usage };
  }

  if (!jsonResponse) {
    return { result: content, usage };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    return { result: null, usage };
  }
  return {
    result: parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed as Record<string, unknown>
      : null,
    usage,
  };
};

const handleAiRequest = async (req: Request): Promise<Response> => {
    const isDeployedRuntime = process.env.NODE_ENV === 'production'
      || Boolean(process.env.VERCEL_ENV)
      || process.env.VERCEL === '1';
    if (isDeployedRuntime && process.env.GROQ_AI_ENABLED !== 'true') {
      return sendError(503, 'Las funciones de IA están desactivadas temporalmente.');
    }

    if (req.method !== 'POST') {
      return sendError(405, 'Método no permitido.', { Allow: 'POST' });
    }

    const contentLengthHeader = req.headers.get('content-length');
    const contentLength = contentLengthHeader ? Number(contentLengthHeader) : 0;
    if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
      return sendError(413, 'La solicitud supera el tamaño permitido.');
    }

    let rawBody: string | null;
    try {
      rawBody = await readRequestBodyWithinLimit(req, MAX_REQUEST_BYTES);
    } catch {
      return sendError(400, 'No se pudo leer el cuerpo de la solicitud.');
    }
    if (rawBody === null) {
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
      uid = (await services.auth.verifyIdToken(token, true)).uid;
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

    if (!hasCurrentAiConsent(body.consentVersion)) {
      return sendError(403, 'Confirma el envío de datos a Groq antes de usar esta función de IA.');
    }

    try {
      if (!await hasCurrentAdultEligibility(services.firestore, uid)) {
        return sendError(403, 'Confirma que tienes 18 años o más antes de usar funciones de IA.');
      }
    } catch (error) {
      console.error('AI age eligibility check failed:', getSafeErrorCode(error));
      return sendError(503, 'No se pudo comprobar la elegibilidad de la cuenta. Inténtalo de nuevo.');
    }

    try {
      if (await hasPendingAccountDeletion(services.firestore, uid)) {
        return sendError(403, 'La cuenta está en proceso de eliminación.');
      }
    } catch (error) {
      console.error('AI account deletion status check failed:', getSafeErrorCode(error));
      return sendError(503, 'No se pudo comprobar el estado de la cuenta. Inténtalo de nuevo.');
    }

    try {
      if (!await hasCurrentLegalAcceptance(services.firestore, uid)) {
        return sendError(403, 'Revisa y confirma los documentos vigentes antes de usar funciones personales.');
      }
    } catch (error) {
      console.error('AI legal acceptance check failed:', getSafeErrorCode(error));
      return sendError(503, 'No se pudo comprobar la aceptación vigente. Inténtalo de nuevo.');
    }

    const task = body.task as AiTask;
    if (!isValidTaskRequest(task, body)) {
      return sendError(400, 'Los datos enviados no son válidos o superan el límite permitido.');
    }
    const modelId = getConfiguredGroqModel(process.env.GROQ_MODEL_ID);
    if (!modelId) {
      console.error('AI model configuration failed: unsupported model');
      return sendError(503, 'La configuración del modelo de IA no es válida.');
    }
    const globalLimitResult = getConfiguredAiGlobalRequestLimits(process.env);
    if (globalLimitResult.status === 'invalid') {
      console.error('AI shared rate limiter configuration failed: invalid values');
      return sendError(503, 'El control compartido de capacidad de IA tiene una configuración no válida.');
    }
    if (isDeployedRuntime && globalLimitResult.status !== 'configured') {
      console.error('AI shared rate limiter configuration failed: missing production settings');
      return sendError(503, 'El control compartido de capacidad de IA no está configurado. No se enviaron datos al proveedor.');
    }
    const globalRequestLimits = globalLimitResult.status === 'configured'
      ? globalLimitResult.config
      : undefined;
    if (task === 'journal-analysis' || task === 'mood-analysis') {
      try {
        if (!await hasCurrentSensitiveSelfReportConsent(services.firestore, uid)) {
          return sendError(403, 'Autoriza por separado el tratamiento de registros de ánimo y diario antes de analizarlos.');
        }
      } catch (error) {
        console.error('AI sensitive-data consent check failed:', getSafeErrorCode(error));
        return sendError(503, 'No se pudo comprobar la autorización de datos. Inténtalo de nuevo.');
      }
    }

    let quotaDecision: AiQuotaDecision;
    try {
      quotaDecision = await consumeAiQuota(
        uid,
        services.firestore,
        services.fieldValue,
        globalRequestLimits,
      );
    } catch (error) {
      console.error('AI quota check failed:', getSafeErrorCode(error));
      return sendError(
        503,
        'No se pudo comprobar el límite de uso en Firestore. Verifica los permisos de Firestore de la cuenta de servicio.',
      );
    }
    if (quotaDecision === 'daily-limit') {
      return sendError(429, 'Alcanzaste el límite diario de solicitudes de IA. Inténtalo mañana.');
    }
    if (quotaDecision === 'minute-limit') {
      return sendError(429, 'Enviaste varias solicitudes de IA seguidas. Espera un minuto e inténtalo de nuevo.');
    }
    if (quotaDecision === 'global-daily-limit') {
      return sendError(429, 'Se alcanzó el límite compartido de solicitudes de IA de las últimas 24 horas. Inténtalo más tarde.');
    }
    if (quotaDecision === 'global-minute-limit') {
      return sendError(429, 'Se alcanzó el límite compartido de solicitudes de IA por minuto. Espera un momento e inténtalo de nuevo.');
    }
    if (quotaDecision === 'global-config-mismatch') {
      console.error('AI shared rate limiter configuration mismatch: align deployed scopes and limits');
      return sendError(503, 'El límite compartido de capacidad no coincide entre despliegues. No se enviaron datos al proveedor.');
    }
    if (quotaDecision === 'account-deleting') {
      return sendError(403, 'La cuenta está en proceso de eliminación.');
    }
    if (quotaDecision === 'account-ineligible') {
      return sendError(403, 'La cuenta ya no cumple los requisitos para usar esta función.');
    }

    let consentEventDecision: AiConsentEventDecision;
    try {
      consentEventDecision = await recordAiConsentEvent(uid, task, services.firestore);
    } catch (error) {
      console.error('AI consent audit write failed:', getSafeErrorCode(error));
      return sendError(503, 'No se pudo registrar la confirmación de privacidad. No se enviaron datos a la IA.');
    }
    if (consentEventDecision.status === 'account-deleting') {
      return sendError(403, 'La cuenta está en proceso de eliminación.');
    }
    if (consentEventDecision.status === 'account-ineligible') {
      return sendError(403, 'La cuenta ya no cumple los requisitos para usar esta función.');
    }
    if (consentEventDecision.status === 'consent-unavailable') {
      return sendError(403, 'La autorización vigente cambió o ya no está disponible. Confirma nuevamente antes de usar la IA.');
    }

    const activeRequestId = consentEventDecision.activeRequestId;
    try {
      try {
        if (await hasPendingAccountDeletion(services.firestore, uid)) {
          return sendError(403, 'La cuenta está en proceso de eliminación. No se enviaron datos a la IA.');
        }
      } catch (error) {
        console.error('AI pre-provider deletion status check failed:', getSafeErrorCode(error));
        return sendError(503, 'No se pudo comprobar el estado de la cuenta. No se enviaron datos a la IA.');
      }

      try {
        const providerResponse = await requestGroq(task, body, modelId);
        if (providerResponse === null) {
          return sendError(400, 'Los datos enviados no son válidos o superan el límite permitido.');
        }
        try {
          await recordGroqUsage(
            uid,
            task,
            modelId,
            providerResponse.usage,
            services.firestore,
            services.fieldValue,
          );
        } catch (error) {
          console.error('AI usage metadata write failed:', getSafeErrorCode(error));
        }
        if (providerResponse.result === null) {
          return sendError(503, 'La respuesta del servicio de IA no tenía el formato esperado.');
        }
        try {
          return jsonResponse(200, { result: normalizeAiProviderResult(task, providerResponse.result) });
        } catch {
          return sendError(503, 'La respuesta de IA no pasó la validación de formato y tamaño. Inténtalo de nuevo.');
        }
      } catch (error) {
        const errorCode = getSafeErrorCode(error);
        console.error('AI provider request failed:', errorCode);
        if (errorCode === 'blocked_api_access') {
          return sendError(503, 'El servicio de IA alcanzó el límite de gasto configurado. Inténtalo más adelante.');
        }
        if (error && typeof error === 'object' && 'status' in error && error.status === 429) {
          const retryAfter = getProviderRetryAfter(error);
          return sendError(
            429,
            'El servicio de IA está ocupado o alcanzó su cuota temporal. Espera un momento e inténtalo de nuevo.',
            retryAfter ? { 'Retry-After': retryAfter } : {},
          );
        }
        return sendError(503, 'No fue posible completar el análisis de IA. Inténtalo de nuevo más tarde.');
      }
    } finally {
      try {
        await services.firestore
          .collection('activeAiRequests')
          .doc(activeRequestId)
          .delete();
      } catch (error) {
        console.error('AI in-flight request cleanup failed:', getSafeErrorCode(error));
      }
    }
};

export default {
  fetch: withApiCors(handleAiRequest),
};
