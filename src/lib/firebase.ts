// Firebase v9 configuration - Production ready
import { initializeApp, getApps } from 'firebase/app';
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

// Initialize Firebase only if no apps exist
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Log successful initialization
console.log('Firebase initialized successfully:', { auth: !!auth, db: !!db });

export { auth, db };
export default app;