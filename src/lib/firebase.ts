import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDB8VIbM5bFJTvuwkLThDIXeJgor87hQgQ',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'mood-log-app-0.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'mood-log-app-0',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'mood-log-app-0.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '39654401201',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:39654401201:web:c0edd8ea835df67a84ae90',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-8G4S8BJK98',
};

console.log('Firebase config loaded:', {
  apiKey: firebaseConfig.apiKey ? '***' + firebaseConfig.apiKey.slice(-4) : 'MISSING',
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  hasStorageBucket: !!firebaseConfig.storageBucket,
  hasMessagingSenderId: !!firebaseConfig.messagingSenderId,
  hasAppId: !!firebaseConfig.appId,
  hasMeasurementId: !!firebaseConfig.measurementId,
});

// Initialize Firebase app
let app;
try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    console.log('Firebase app initialized successfully');
  } else {
    app = getApp();
    console.log('Firebase app already initialized');
  }
} catch (error) {
  console.error('Failed to initialize Firebase app:', error);
  app = null;
}

// Initialize Firebase services
let auth = null;
let db = null;

if (app) {
  try {
    // Initialize Auth
    auth = getAuth(app);
    console.log('Firebase Auth initialized successfully');
    
    // Initialize Firestore
    db = getFirestore(app);
    console.log('Firebase Firestore initialized successfully');
    
    console.log('All Firebase services initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firebase services:', error);
    auth = null;
    db = null;
  }
} else {
  console.warn('Firebase app not initialized, services will be null');
}

export { auth, db };
export default app;
