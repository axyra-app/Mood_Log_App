// Simple Firebase initialization
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase Configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

console.log('Firebase Config:', {
  apiKey: firebaseConfig.apiKey ? 'SET' : 'NOT SET',
  authDomain: firebaseConfig.authDomain ? 'SET' : 'NOT SET',
  projectId: firebaseConfig.projectId ? 'SET' : 'NOT SET',
  storageBucket: firebaseConfig.storageBucket ? 'SET' : 'NOT SET',
  messagingSenderId: firebaseConfig.messagingSenderId ? 'SET' : 'NOT SET',
  appId: firebaseConfig.appId ? 'SET' : 'NOT SET',
  measurementId: firebaseConfig.measurementId ? 'SET' : 'NOT SET',
});

// Initialize Firebase
let app;
let auth;
let db;

try {
  // Check if Firebase is already initialized
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    console.log('Firebase app initialized');
  } else {
    app = getApps()[0];
    console.log('Using existing Firebase app');
  }

  // Initialize services
  auth = getAuth(app);
  db = getFirestore(app);
  
  console.log('Firebase services initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
  throw error;
}

export { app, auth, db };
export type { User } from 'firebase/auth';
export type { DocumentData, DocumentSnapshot, QuerySnapshot } from 'firebase/firestore';
