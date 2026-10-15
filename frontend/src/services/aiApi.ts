import { auth } from './firebase';

interface AiApiResponse<T> {
  result?: T;
  error?: string;
}

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

  const result = await response.json() as AiApiResponse<T>;
  if (!response.ok) {
    throw new Error(result.error || 'No fue posible completar la solicitud de IA.');
  }
  if (result.result === undefined) {
    throw new Error('El servicio de IA devolvió una respuesta vacía.');
  }
  return result.result;
};
