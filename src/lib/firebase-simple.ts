// Simple Firebase initialization
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig, validateFirebaseConfig } from '../config/firebase-config-simple';

// Initialize Firebase
let app;
let auth;
let db;

try {
  // Validate configuration first
  if (!validateFirebaseConfig()) {
    throw new Error('Invalid Firebase configuration');
  }

  // Check if Firebase is already initialized
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    console.log('Firebase app initialized successfully');
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
