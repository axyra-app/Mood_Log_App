import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDW4VRBdTMzDwxmkcnsVqrdaxlXoskxqFw",
  authDomain: "mood-log-app-1.firebaseapp.com",
  projectId: "mood-log-app-1",
  storageBucket: "mood-log-app-1.firebasestorage.app",
  messagingSenderId: "163973255515",
  appId: "1:163973255515:web:f4c2c94e97262ed53d4a7e",
  measurementId: "G-XXTF4D7MRW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Analytics (only in browser environment)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
