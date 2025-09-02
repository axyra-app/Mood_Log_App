// Test Firestore connection and write
import { initializeApp } from 'firebase/app';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { doc, getFirestore, setDoc } from 'firebase/firestore';

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

// Test registration and Firestore write
async function testRegistrationAndFirestore() {
  try {
    // Create user
    const userCredential = await createUserWithEmailAndPassword(auth, 'test2@example.com', 'testpassword123');
    console.log('Registration successful:', userCredential.user);

    // Try to write to Firestore
    const profile = {
      uid: userCredential.user.uid,
      email: 'test2@example.com',
      name: 'Test User',
      role: 'user',
      createdAt: new Date(),
    };

    await setDoc(doc(db, 'users', userCredential.user.uid), profile);
    console.log('Firestore write successful!');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Uncomment to test
// testRegistrationAndFirestore();
