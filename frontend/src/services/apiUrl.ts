import { Capacitor } from '@capacitor/core';

const getNativeApiBaseUrl = (): URL => {
  const value = import.meta.env.VITE_API_BASE_URL?.trim();
  if (!value) {
    throw new Error('La app móvil no tiene configurado el servicio de Mood Log.');
  }

  let apiBase: URL;
  try {
    apiBase = new URL(value);
  } catch {
    throw new Error('La URL del servicio de Mood Log no es válida.');
  }

  if (apiBase.protocol !== 'https:' && apiBase.hostname !== 'localhost') {
    throw new Error('La app móvil requiere una conexión segura con Mood Log.');
  }

  return apiBase;
};

export const apiUrl = (path: `/api/${string}`): string => {
  if (!Capacitor.isNativePlatform()) return path;
  return new URL(path, getNativeApiBaseUrl()).toString();
};
