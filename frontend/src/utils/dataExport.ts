import { USER_DATA_COLLECTIONS } from './userDataCollections.ts';

export { LEGACY_UID_OWNED_COLLECTIONS, USER_DATA_COLLECTIONS } from './userDataCollections.ts';

export type ExportJsonValue =
  | null
  | boolean
  | number
  | string
  | ExportJsonValue[]
  | { [key: string]: ExportJsonValue };

export interface DataExportCoverage {
  status: 'partial';
  includedFirestorePaths: string[];
  notes: string[];
  excluded: Array<{ category: string; reason: string }>;
}

export const serializeAiUsageForExport = (value: unknown): ExportJsonValue | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const data = value as Record<string, unknown>;
  const minuteBucket = data.minuteBucket;
  const rollingTimestamps = Array.isArray(data.minuteRequestTimestamps)
    ? data.minuteRequestTimestamps.filter((timestamp): timestamp is number =>
      typeof timestamp === 'number' && Number.isSafeInteger(timestamp) && timestamp >= 0,
    )
    : null;
  const exportTime = Date.now();
  const recentRollingTimestamps = rollingTimestamps?.filter((timestamp) =>
    timestamp > exportTime - 60_000 && timestamp <= exportTime,
  ) ?? null;
  const minuteWindowDate = typeof minuteBucket === 'number'
    && Number.isSafeInteger(minuteBucket)
    && minuteBucket >= 0
    ? new Date(minuteBucket * 60_000)
    : null;
  const legacyMinuteWindowStartedAt = minuteWindowDate && Number.isFinite(minuteWindowDate.getTime())
    ? minuteWindowDate.toISOString()
    : null;
  const minuteWindowStartedAt = recentRollingTimestamps
    ? new Date(exportTime - 60_000).toISOString()
    : legacyMinuteWindowStartedAt;
  const providerUsage = data.providerUsage;
  let exportedProviderUsage: Record<string, unknown> | null = null;
  if (
    providerUsage && typeof providerUsage === 'object' && !Array.isArray(providerUsage)
    && typeof (providerUsage as Record<string, unknown>).day === 'string'
      && /^\d{4}-\d{2}-\d{2}$/.test((providerUsage as Record<string, unknown>).day as string)
    && (providerUsage as Record<string, unknown>).models
    && typeof (providerUsage as Record<string, unknown>).models === 'object'
    && !Array.isArray((providerUsage as Record<string, unknown>).models)
  ) {
    const providerUsageData = providerUsage as Record<string, unknown>;
    const models = providerUsageData.models as Record<string, unknown>;
    const safeModels: Record<string, unknown> = {};
    for (const modelId of ['openai/gpt-oss-20b', 'openai/gpt-oss-120b']) {
      const modelUsage = models[modelId];
      if (!modelUsage || typeof modelUsage !== 'object' || Array.isArray(modelUsage)) continue;
      const tasks = modelUsage as Record<string, unknown>;
      const safeTasks: Record<string, unknown> = {};
      for (const task of ['chat', 'journal-analysis', 'mood-analysis']) {
        const taskUsage = tasks[task];
        if (!taskUsage || typeof taskUsage !== 'object' || Array.isArray(taskUsage)) continue;
        const counters = taskUsage as Record<string, unknown>;
        const requests = counters.requests;
        const promptTokens = counters.promptTokens;
        const completionTokens = counters.completionTokens;
        const totalTokens = counters.totalTokens;
        const validCounters = [requests, promptTokens, completionTokens, totalTokens].every(
          (counter) => typeof counter === 'number' && Number.isSafeInteger(counter) && counter >= 0,
        );
        if (!validCounters) continue;
        safeTasks[task] = { requests, promptTokens, completionTokens, totalTokens };
      }
      if (Object.keys(safeTasks).length > 0) safeModels[modelId] = safeTasks;
    }
    exportedProviderUsage = {
      day: typeof providerUsageData.day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(providerUsageData.day)
        ? providerUsageData.day
        : null,
      models: safeModels,
    };
  }

  return serializeFirestoreValue({
    day: typeof data.day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(data.day) ? data.day : null,
    requestsToday: typeof data.count === 'number' && Number.isSafeInteger(data.count) && data.count >= 0
      ? data.count
      : null,
    minuteWindowStartedAt,
    requestsThisMinute: recentRollingTimestamps
      ? recentRollingTimestamps.length
      : typeof data.minuteCount === 'number'
        && Number.isSafeInteger(data.minuteCount)
        && data.minuteCount >= 0
        ? data.minuteCount
        : null,
    providerUsage: exportedProviderUsage,
    updatedAt: data.updatedAt ?? null,
  });
};

export const createDataExportCoverage = (
  collectionNames: readonly string[] = USER_DATA_COLLECTIONS,
): DataExportCoverage => ({
  status: 'partial',
  includedFirestorePaths: [
    'users/{uid}',
    'userSettings/{uid}',
    ...collectionNames.map((collectionName) => `${collectionName}/* (documentos propios y subcolecciones)`),
    'aiUsage/{uid} (proyección allowlist)',
  ],
  notes: [
    'La exportación es una lectura de mejor esfuerzo; los cambios simultáneos durante la descarga pueden no reflejarse en un único instante transaccional.',
    'Los documentos de aiUsage se reducen a campos permitidos; no se incluyen prompts ni respuestas de IA.',
    'El servidor transmite registros NDJSON; el navegador reúne el JSON final en memoria, así que cuentas grandes requieren pruebas de consumo y duración.',
  ],
  excluded: [
    {
      category: 'Archivos de Storage',
      reason: 'La copia JSON no incluye contenido binario ni una copia descargable de esos archivos.',
    },
    {
      category: 'Sistemas externos y logs de infraestructura',
      reason: 'Los logs de hosting y proveedor se rigen por sus sistemas y políticas; el historial de MIA no se persiste en Mood Log.',
    },
    {
      category: 'Wear OS local',
      reason: 'Las decisiones locales de permiso del scaffold no se sincronizan a la cuenta Mood Log.',
    },
    {
      category: 'Metadatos operativos temporales',
      reason: 'Los marcadores de borrado y leases de solicitudes activas no forman parte de la exportación de contenido personal.',
    },
  ],
});

export const serializeFirestoreValue = (value: unknown): ExportJsonValue => {
  if (value === null || typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (value instanceof Uint8Array) {
    let binary = '';
    for (let offset = 0; offset < value.length; offset += 0x8000) {
      binary += String.fromCharCode(...value.subarray(offset, offset + 0x8000));
    }
    return { encoding: 'base64', value: btoa(binary) };
  }

  if (Array.isArray(value)) {
    return value.map((item) => serializeFirestoreValue(item));
  }

  if (typeof value === 'object') {
    const toDate = Reflect.get(value, 'toDate');
    if (typeof toDate === 'function') {
      const date: unknown = Reflect.apply(toDate, value, []);
      if (!(date instanceof Date)) {
        throw new Error('Se encontró una fecha de Firestore no válida durante la exportación.');
      }
      return date.toISOString();
    }

    const toBase64 = Reflect.get(value, 'toBase64');
    if (typeof toBase64 === 'function') {
      return { encoding: 'base64', value: Reflect.apply(toBase64, value, []) };
    }

    const path = Reflect.get(value, 'path');
    const firestore = Reflect.get(value, 'firestore');
    if (typeof path === 'string' && firestore) {
      return { firestoreDocumentPath: path };
    }

    const latitude = Reflect.get(value, 'latitude');
    const longitude = Reflect.get(value, 'longitude');
    if (typeof latitude === 'number' && typeof longitude === 'number') {
      return { latitude, longitude };
    }

    return Object.fromEntries(
      Object.entries(value)
        .filter(([, item]) => item !== undefined)
        .map(([key, item]) => [key, serializeFirestoreValue(item)])
    );
  }

  throw new Error('Se encontró un valor no compatible durante la exportación.');
};
