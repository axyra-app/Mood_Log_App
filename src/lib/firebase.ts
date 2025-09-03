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

// Initialize Firebase app with error handling
let app;
try {
  // Check if Firebase is already initialized
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    console.log('Firebase app initialized');
  } else {
    app = getApp();
    console.log('Using existing Firebase app');
  }
} catch (error) {
  console.error('Error initializing Firebase app:', error);
  throw error;
}

// Initialize services with error handling
let auth, db;

try {
  auth = getAuth(app);
  console.log('Firebase Auth initialized');
} catch (error) {
  console.error('Error initializing Firebase Auth:', error);
  // Retry after a short delay
  setTimeout(() => {
    try {
      auth = getAuth(app);
      console.log('Firebase Auth initialized on retry');
    } catch (retryError) {
      console.error('Error retrying Firebase Auth:', retryError);
    }
  }, 1000);
}

try {
  db = getFirestore(app);
  console.log('Firebase Firestore initialized');
} catch (error) {
  console.error('Error initializing Firebase Firestore:', error);
  // Retry after a short delay
  setTimeout(() => {
    try {
      db = getFirestore(app);
      console.log('Firebase Firestore initialized on retry');
    } catch (retryError) {
      console.error('Error retrying Firebase Firestore:', retryError);
    }
  }, 1000);
}

export { auth, db };
export default app;
