import { useEffect, useReducer } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AI_CONSENT_VERSION } from '../utils/legalVersions';

export const aiPermissionScopes = {
  chat: 'Chat con MIA',
  journal: 'Análisis de entradas del diario',
  mood: 'Análisis de un registro de ánimo',
  statistics: 'Análisis de estadísticas',
  reports: 'Reportes con IA',
} as const;

type Scope = keyof typeof aiPermissionScopes;
const changeEvent = 'mood-log-ai-permission-change';
const sessionChoices = new Set<string>();
const permissionKey = (uid: string, scope: Scope) => ['mood-log-ai-permission', AI_CONSENT_VERSION, uid, scope].join(':');

export function revokeAiPermissions(uid: string) {
  for (const scope of Object.keys(aiPermissionScopes) as Scope[]) {
    const key = permissionKey(uid, scope);
    sessionChoices.delete(key);
    try { localStorage.removeItem(key); } catch { /* Storage may be unavailable. */ }
  }
  window.dispatchEvent(new Event(changeEvent));
}

export function useAiPermission(scope: Scope) {
  const { user } = useAuth();
  const key = user ? permissionKey(user.uid, scope) : null;
  const [, refresh] = useReducer((revision: number) => revision + 1, 0);

  useEffect(() => {
    window.addEventListener(changeEvent, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(changeEvent, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  let allowed = false;
  if (key) {
    try { allowed = localStorage.getItem(key) === 'yes'; }
    catch { allowed = sessionChoices.has(key); }
  }

  const setAllowed = (value: boolean) => {
    if (!key) return;
    try {
      if (value) localStorage.setItem(key, 'yes');
      else localStorage.removeItem(key);
    } catch {
      if (value) sessionChoices.add(key);
      else sessionChoices.delete(key);
    }
    window.dispatchEvent(new Event(changeEvent));
  };

  return [allowed, setAllowed] as const;
}
