import { cert, getApps, initializeApp } from 'firebase-admin/app';

export interface FirebaseAdminCredentials {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

export type FirebaseAdminConfigurationErrorCode =
  | 'missing-credentials'
  | 'invalid-json'
  | 'invalid-credentials'
  | 'project-mismatch'
  | 'unsafe-emulator-configuration';

export class FirebaseAdminConfigurationError extends Error {
  readonly code: FirebaseAdminConfigurationErrorCode;

  constructor(code: FirebaseAdminConfigurationErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

export const LOCAL_EMULATOR_PROJECT_ID = 'demo-mood-log-local';

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

const assertLocalEmulatorConfiguration = (): void => {
  const requiredHosts: Record<string, string> = {
    FIREBASE_AUTH_EMULATOR_HOST: '127.0.0.1:9099',
    FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080',
    STORAGE_EMULATOR_HOST: '127.0.0.1:9199',
  };
  const isDevelopment = process.env.NODE_ENV === 'development';
  const usesDemoProject = process.env.FIREBASE_PROJECT_ID === LOCAL_EMULATOR_PROJECT_ID;
  const hostsMatch = Object.entries(requiredHosts)
    .every(([key, value]) => process.env[key] === value);

  if (!isDevelopment || !usesDemoProject || !hostsMatch) {
    throw new FirebaseAdminConfigurationError(
      'unsafe-emulator-configuration',
      'Los emuladores requieren desarrollo local, el proyecto demo y hosts loopback exactos.',
    );
  }
};

export const getFirebaseAdminApp = (storageBucket?: string) => {
  const emulatorHosts = [
    process.env.FIREBASE_AUTH_EMULATOR_HOST,
    process.env.FIRESTORE_EMULATOR_HOST,
    process.env.STORAGE_EMULATOR_HOST,
  ];
  const emulatorMode = process.env.MOOD_LOG_USE_FIREBASE_EMULATORS === 'true';
  if (!emulatorMode && emulatorHosts.some(Boolean)) {
    throw new FirebaseAdminConfigurationError(
      'unsafe-emulator-configuration',
      'No se permite usar hosts de emulador fuera del modo local explícito.',
    );
  }

  if (emulatorMode) {
    assertLocalEmulatorConfiguration();
    const existingApp = getApps().find((app) => app.name === '[DEFAULT]');
    if (existingApp) {
      if (existingApp.options.projectId !== LOCAL_EMULATOR_PROJECT_ID) {
        throw new FirebaseAdminConfigurationError(
          'unsafe-emulator-configuration',
          'La aplicación Admin existente no usa el proyecto emulador esperado.',
        );
      }
      return existingApp;
    }
    return initializeApp({ projectId: LOCAL_EMULATOR_PROJECT_ID });
  }

  const credentials = parseFirebaseAdminCredentials(
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON,
    process.env.FIREBASE_PROJECT_ID,
  );
  const existingApp = getApps().find((app) => app.name === '[DEFAULT]');
  if (existingApp) return existingApp;

  return initializeApp({
    credential: cert(credentials),
    projectId: credentials.projectId,
    ...(storageBucket ? { storageBucket } : {}),
  });
};
