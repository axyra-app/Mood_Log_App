// Firebase initialization and exports
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, FirebaseStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics, Analytics } from 'firebase/analytics';
import { getMessaging, Messaging } from 'firebase/messaging';
import { firebaseConfig, validateFirebaseConfig, isDevelopment } from '../config/firebase-config';

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let analytics: Analytics | null = null;
let messaging: Messaging | null = null;

// Initialize Firebase app
if (getApps().length === 0) {
  if (!validateFirebaseConfig()) {
    throw new Error('Invalid Firebase configuration');
  }
  
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Auth
auth = getAuth(app);

// Initialize Firestore
db = getFirestore(app);

// Initialize Storage
storage = getStorage(app);

// Initialize Analytics (only in production and browser)
if (typeof window !== 'undefined' && !isDevelopment) {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('Analytics initialization failed:', error);
  }
}

// Initialize Messaging (only in browser and if supported)
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.warn('Messaging initialization failed:', error);
  }
}

// Connect to emulators in development
if (isDevelopment && typeof window !== 'undefined') {
  try {
    // Auth emulator
    if (!auth.emulatorConfig) {
      connectAuthEmulator(auth, 'http://localhost:9099');
    }
    
    // Firestore emulator
    if (!db._delegate._databaseId.projectId.includes('demo-')) {
      connectFirestoreEmulator(db, 'localhost', 8080);
    }
    
    // Storage emulator
    if (!storage._delegate._host.includes('localhost')) {
      connectStorageEmulator(storage, 'localhost', 9199);
    }
  } catch (error) {
    console.warn('Emulator connection failed:', error);
  }
}

// Export Firebase services
export { app, auth, db, storage, analytics, messaging };

// Export Firebase types
export type { User } from 'firebase/auth';
export type { DocumentData, DocumentSnapshot, QuerySnapshot } from 'firebase/firestore';

// Utility functions
export const getCurrentUser = () => auth.currentUser;
export const getCurrentUserId = () => auth.currentUser?.uid;

// Error handling
export const handleFirebaseError = (error: any) => {
  console.error('Firebase error:', error);
  
  if (error.code) {
    switch (error.code) {
      case 'auth/user-not-found':
        return 'Usuario no encontrado';
      case 'auth/wrong-password':
        return 'Contraseña incorrecta';
      case 'auth/email-already-in-use':
        return 'Este email ya está en uso';
      case 'auth/weak-password':
        return 'La contraseña es muy débil';
      case 'auth/invalid-email':
        return 'Email inválido';
      case 'auth/too-many-requests':
        return 'Demasiados intentos. Intenta más tarde';
      case 'permission-denied':
        return 'No tienes permisos para realizar esta acción';
      case 'unavailable':
        return 'Servicio no disponible. Intenta más tarde';
      default:
        return 'Error inesperado. Intenta más tarde';
    }
  }
  
  return 'Error inesperado. Intenta más tarde';
};
