// Simple Firebase configuration that works
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export { auth, db };
export default app;
