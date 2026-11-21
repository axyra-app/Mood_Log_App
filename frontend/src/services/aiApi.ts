import { auth } from './firebase';
import { AI_CONSENT_VERSION } from '../utils/legalVersions';
import { apiUrl } from './apiUrl';

export const AI_FEATURES_ENABLED = import.meta.env.VITE_AI_FEATURES_ENABLED === 'true';

interface AiApiResponse<T> {
  result?: T;
  error?: string;
}

const parseAiResponse = async <T>(response: Response): Promise<AiApiResponse<T>> => {
  const rawText = await response.text();
  let parsed: unknown;
  try {
    parsed = rawText ? JSON.parse(rawText) : {};
  } catch {
    if (!response.ok) {
      throw new Error(`El servidor de IA respondió con HTTP ${response.status}.`);
    }
    throw new Error('El servicio de IA devolvió una respuesta con formato no válido.');
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(`El servidor de IA respondió con HTTP ${response.status} y un formato no válido.`);
  }

  const body = parsed as Record<string, unknown>;
  return {
    result: body.result as T | undefined,
    error: typeof body.error === 'string' ? body.error : undefined,
  };
};

export const requestAi = async <T>(payload: Record<string, unknown>): Promise<T> => {
  if (!AI_FEATURES_ENABLED) {
    throw new Error('Las funciones de IA están pausadas en esta prueba. Tus registros no se enviaron a la IA.');
  }

  if (payload.consentVersion !== AI_CONSENT_VERSION) {
    throw new Error('Confirma la autorización vigente para enviar contenido a IA antes de continuar.');
  }

  const user = auth.currentUser;
  if (!user) {
    throw new Error('Inicia sesión para utilizar las funciones de IA.');
  }

  const token = await user.getIdToken();
  const response = await fetch(apiUrl('/api/ai'), {
    method: 'POST',
    signal: AbortSignal.timeout(50000),
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const result = await parseAiResponse<T>(response);
  if (!response.ok) {
    const message = result.error || 'No fue posible completar la solicitud de IA.';
    const retryAfterHeader = response.status === 429
      ? response.headers.get('retry-after')
      : null;
    const retryAfterSeconds = retryAfterHeader && /^\d{1,6}$/.test(retryAfterHeader)
      ? Number(retryAfterHeader)
      : null;
    throw new Error(
      response.status === 429 && retryAfterSeconds !== null && retryAfterSeconds > 0
        ? `${message} Puedes volver a intentar en ${retryAfterSeconds} s.`
        : message,
    );
  }
  if (result.result === undefined) {
    throw new Error('El servicio de IA devolvió una respuesta vacía.');
  }
  return result.result;
};
