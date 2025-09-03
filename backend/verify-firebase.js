// Script para verificar la configuración de Firebase
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc, getDoc } = require('firebase/firestore');

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

async function testFirebaseConnection() {
  try {
    console.log('Testing Firebase connection...');
    
    // Test Firestore connection
    const testDoc = doc(db, 'test', 'connection');
    await setDoc(testDoc, { 
      timestamp: new Date(),
      message: 'Connection test successful'
    });
    console.log('✅ Firestore connection successful');
    
    // Clean up test document
    // await deleteDoc(testDoc);
    
  } catch (error) {
    console.error('❌ Firebase connection failed:', error);
  }
}

testFirebaseConnection();
