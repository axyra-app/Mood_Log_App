// New Firebase initialization - minimal and working
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration - exact copy from Firebase console
const firebaseConfig = {
  apiKey: "AIzaSyDB8VIbM5bFJTvuwkLThDIXeJgor87hQgQ",
  authDomain: "mood-log-app-0.firebaseapp.com",
  projectId: "mood-log-app-0",
  storageBucket: "mood-log-app-0.firebasestorage.app",
  messagingSenderId: "39654401201",
  appId: "1:39654401201:web:c0edd8ea835df67a84ae90",
  measurementId: "G-8G4S8BJK98"
};

console.log('Initializing Firebase with config:', firebaseConfig);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log('Firebase app initialized:', app);

// Initialize Firebase Authentication
const auth = getAuth(app);
console.log('Firebase Auth initialized:', auth);

// Initialize Cloud Firestore
const db = getFirestore(app);
console.log('Firebase Firestore initialized:', db);

export { auth, db };
export default app;
