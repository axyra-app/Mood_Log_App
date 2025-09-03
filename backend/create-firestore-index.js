// Script para crear el índice de Firestore necesario
// Ejecuta este script después de instalar las dependencias

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, orderBy, where, limit, getDocs } = require('firebase/firestore');

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
const db = getFirestore(app);

async function createIndex() {
  try {
    console.log('Creating Firestore index...');
    
    // Esta consulta creará automáticamente el índice necesario
    const moodLogsRef = collection(db, 'moodLogs');
    const q = query(
      moodLogsRef,
      where('userId', '==', 'test-user-id'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    
    // Ejecutar la consulta (esto creará el índice)
    const querySnapshot = await getDocs(q);
    console.log('✅ Index creation query executed successfully');
    console.log('📋 The index should now be available in Firebase Console');
    
  } catch (error) {
    if (error.code === 'failed-precondition') {
      console.log('⚠️  Index creation required. Please visit:');
      console.log('https://console.firebase.google.com/v1/r/project/mood-log-app-0/firestore/indexes?create_composite=Ck9wcm9qZWN0cy9tb29kLWxvZy1hcHAtMC9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvbW9vZExvZ3MvaW5kZXhlcy9fEAEaCgoGdXNlcklkEAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg');
    } else {
      console.error('❌ Error:', error);
    }
  }
}

createIndex();
