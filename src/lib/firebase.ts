import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDB8VIbM5bFJTvuwkLThDIXeJgor87hQgQ',
  authDomain: 'mood-log-app-0.firebaseapp.com',
  projectId: 'mood-log-app-0',
  storageBucket: 'mood-log-app-0.firebasestorage.app',
  messagingSenderId: '39654401201',
  appId: '1:39654401201:web:c0edd8ea835df67a84ae90',
  measurementId: 'G-8G4S8BJK98',
};

// Initialize Firebase app
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Wait for Firebase to be ready before initializing services
let auth: any = null;
let db: any = null;

// Initialize services after a short delay to ensure Firebase is ready
setTimeout(() => {
  try {
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('Firebase services initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase services:', error);
  }
}, 100);

// Export functions that return the services
export const getAuthInstance = () => {
  if (!auth) {
    auth = getAuth(app);
  }
  return auth;
};

export const getDbInstance = () => {
  if (!db) {
    db = getFirestore(app);
  }
  return db;
};

// For backward compatibility - these will be null initially
export { auth, db };
export default app;
