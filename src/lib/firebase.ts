import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDB8VIbM5bFJTvuwkLThDIXeJgor87hQgQ',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'mood-log-app-0.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'mood-log-app-0',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'mood-log-app-0.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '39654401201',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:39654401201:web:c0edd8ea835df67a84ae90',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-8G4S8BJK98',
};

// Initialize Firebase app
console.log('Initializing Firebase with config:', {
  apiKey: firebaseConfig.apiKey ? '***' + firebaseConfig.apiKey.slice(-4) : 'MISSING',
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  hasStorageBucket: !!firebaseConfig.storageBucket,
  hasMessagingSenderId: !!firebaseConfig.messagingSenderId,
  hasAppId: !!firebaseConfig.appId,
  hasMeasurementId: !!firebaseConfig.measurementId
});

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
console.log('Firebase app initialized successfully');

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
console.log('Firebase services (auth, db) initialized successfully');

export default app;
