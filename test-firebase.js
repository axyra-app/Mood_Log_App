// Test Firebase connection
import { initializeApp } from 'firebase/app';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log('Firebase initialized:', app);
console.log('Auth:', auth);
console.log('Database:', db);

// Test registration
async function testRegistration() {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, 'test@example.com', 'testpassword123');
    console.log('Registration successful:', userCredential.user);
  } catch (error) {
    console.error('Registration error:', error);
  }
}

// Uncomment to test
// testRegistration();
