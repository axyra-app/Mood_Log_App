import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Validate environment variables
const requiredEnvVars = {
  VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  VITE_FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('Missing Firebase environment variables:', missingVars);
  throw new Error(`Missing required Firebase environment variables: ${missingVars.join(', ')}`);
}

const firebaseConfig = {
  apiKey: requiredEnvVars.VITE_FIREBASE_API_KEY,
  authDomain: requiredEnvVars.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: requiredEnvVars.VITE_FIREBASE_PROJECT_ID,
  storageBucket: requiredEnvVars.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: requiredEnvVars.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: requiredEnvVars.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase app
console.log('Initializing Firebase with config:', {
  apiKey: firebaseConfig.apiKey ? '***' + firebaseConfig.apiKey.slice(-4) : 'MISSING',
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  hasStorageBucket: !!firebaseConfig.storageBucket,
  hasMessagingSenderId: !!firebaseConfig.messagingSenderId,
  hasAppId: !!firebaseConfig.appId,
  hasMeasurementId: !!firebaseConfig.measurementId,
});

let app;
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  console.log('Firebase app initialized successfully');
} catch (error) {
  console.error('Failed to initialize Firebase:', error);
  throw error;
}

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
console.log('Firebase services (auth, db) initialized successfully');

export default app;
