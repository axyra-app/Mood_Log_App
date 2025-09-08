// Simple Firebase initialization
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
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

  // Initialize Auth service
  try {
    auth = getAuth(app);
    console.log('Firebase Auth initialized successfully');
  } catch (authError) {
    console.error('Firebase Auth initialization error:', authError);
    throw authError;
  }

  // Initialize Firestore service
  try {
    db = getFirestore(app);
    console.log('Firebase Firestore initialized successfully');
  } catch (firestoreError) {
    console.error('Firebase Firestore initialization error:', firestoreError);
    throw firestoreError;
  }
  
  console.log('All Firebase services initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
  throw error;
}

export { app, auth, db };
export type { User } from 'firebase/auth';
export type { DocumentData, DocumentSnapshot, QuerySnapshot } from 'firebase/firestore';
