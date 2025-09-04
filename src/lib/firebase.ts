// Firebase v9 configuration - Error-free version
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

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
let app;
try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    console.log('Firebase app initialized successfully');
  } else {
    app = getApps()[0];
    console.log('Using existing Firebase app');
  }
} catch (error) {
  console.error('Failed to initialize Firebase app:', error);
  throw error;
}

// Initialize Firebase services with error handling
let auth;
let db;

try {
  // Initialize Auth
  auth = getAuth(app);
  console.log('Firebase Auth initialized successfully');
  
  // Initialize Firestore
  db = getFirestore(app);
  console.log('Firebase Firestore initialized successfully');
  
} catch (error) {
  console.error('Failed to initialize Firebase services:', error);
  // Create fallback objects to prevent app crash
  auth = null;
  db = null;
}

export { auth, db };
export default app;