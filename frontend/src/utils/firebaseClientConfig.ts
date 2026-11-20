export type FirebaseClientConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
};

const REQUIRED_KEYS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

export const getFirebaseClientConfig = (
  env: Record<string, unknown>,
): FirebaseClientConfig => {
  const missing = REQUIRED_KEYS.filter((key) =>
    typeof env[key] !== 'string' || (env[key] as string).trim().length === 0,
  );

  if (missing.length > 0) {
    throw new Error(`Missing required Firebase client configuration: ${missing.join(', ')}`);
  }

  const config: FirebaseClientConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY as string,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN as string,
    projectId: env.VITE_FIREBASE_PROJECT_ID as string,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET as string,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
    appId: env.VITE_FIREBASE_APP_ID as string,
  };

  const measurementId = env.VITE_FIREBASE_MEASUREMENT_ID;
  if (typeof measurementId === 'string' && measurementId.trim().length > 0) {
    config.measurementId = measurementId;
  }

  return config;
};
