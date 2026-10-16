import { auth } from './firebase';

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
      throw new Error(`El servidor de IA respondió con HTTP ${response.status}: ${rawText.slice(0, 240)}`);
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
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Inicia sesión para utilizar las funciones de IA.');
  }

  const token = await user.getIdToken();
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const result = await parseAiResponse<T>(response);
  if (!response.ok) {
    throw new Error(result.error || 'No fue posible completar la solicitud de IA.');
  }
  if (result.result === undefined) {
    throw new Error('El servicio de IA devolvió una respuesta vacía.');
  }
  return result.result;
};
