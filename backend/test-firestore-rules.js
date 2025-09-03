// Script para probar las reglas de Firestore
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

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

async function testFirestoreRules() {
  try {
    console.log('Testing Firestore rules...');
    
    // Test with a known user (replace with your test credentials)
    const email = 'test@example.us'; // Replace with your test email
    const password = '123456789'; // Replace with your test password
    
    console.log('Signing in with:', email);
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ Signed in successfully with UID:', user.uid);
    
    // Test writing to moodLogs collection
    console.log('Testing moodLogs write...');
    const moodLogData = {
      userId: user.uid,
      mood: 5,
      text: 'Test entry',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(db, 'moodLogs'), moodLogData);
    console.log('✅ Successfully wrote to moodLogs with ID:', docRef.id);
    
  } catch (error) {
    console.error('❌ Error:', error);
    if (error.code === 'permission-denied') {
      console.log('🔒 Permission denied - check Firestore rules');
    }
  }
}

testFirestoreRules();
