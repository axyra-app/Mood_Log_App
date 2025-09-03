// Alternative Firebase initialization
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDB8VIbM5bFJTvuwkLThDIXeJgor87hQgQ",
  authDomain: "mood-log-app-0.firebaseapp.com",
  projectId: "mood-log-app-0",
  storageBucket: "mood-log-app-0.firebasestorage.app",
  messagingSenderId: "39654401201",
  appId: "1:39654401201:web:c0edd8ea835df67a84ae90",
  measurementId: "G-8G4S8BJK98"
};

// Initialize Firebase
let app;
try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    console.log('Firebase app initialized successfully (alt)');
  } else {
    app = getApp();
    console.log('Firebase app already initialized (alt)');
  }
} catch (error) {
  console.error('Failed to initialize Firebase app (alt):', error);
  app = null;
}

// Initialize services
let auth = null;
let db = null;

if (app) {
  try {
    auth = getAuth(app);
    console.log('Firebase Auth initialized successfully (alt)');
    
    db = getFirestore(app);
    console.log('Firebase Firestore initialized successfully (alt)');
  } catch (error) {
    console.error('Failed to initialize Firebase services (alt):', error);
    auth = null;
    db = null;
  }
}

export { auth, db };
export default app;
