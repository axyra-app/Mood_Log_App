import { auth, db } from '../services/firebase';
import { testFirestoreConnection } from '../services/firestore';

// Función para probar la conexión a Firebase
export const testFirebaseConnection = async (): Promise<{
  auth: boolean;
  firestore: boolean;
  overall: boolean;
}> => {
  const results = {
    auth: false,
    firestore: false,
    overall: false
  };

  try {
    // Probar Auth
    console.log('🔥 Testing Firebase Auth...');
    if (auth) {
      results.auth = true;
      console.log('✅ Firebase Auth initialized successfully');
    } else {
      console.log('❌ Firebase Auth failed to initialize');
    }

    // Probar Firestore
    console.log('🔥 Testing Firestore connection...');
    const firestoreResult = await testFirestoreConnection();
    results.firestore = firestoreResult;
    
    if (firestoreResult) {
      console.log('✅ Firestore connection successful');
    } else {
      console.log('❌ Firestore connection failed');
    }

    // Resultado general
    results.overall = results.auth && results.firestore;
    
    if (results.overall) {
      console.log('🎉 Firebase is fully configured and working!');
    } else {
      console.log('⚠️ Firebase has some issues. Check the logs above.');
    }

  } catch (error) {
    console.error('❌ Firebase test failed:', error);
    results.overall = false;
  }

  return results;
};

// Función para mostrar el estado de Firebase en la consola
export const logFirebaseStatus = () => {
  console.log('🔥 Firebase Configuration Status:');
  console.log('Project ID:', 'mood-log-app-1');
  console.log('Auth Domain:', 'mood-log-app-1.firebaseapp.com');
  console.log('Storage Bucket:', 'mood-log-app-1.firebasestorage.app');
  console.log('App ID:', '1:163973255515:web:f4c2c94e97262ed53d4a7e');
  console.log('Measurement ID:', 'G-XXTF4D7MRW');
  console.log('Auth Instance:', auth ? '✅ Initialized' : '❌ Failed');
  console.log('Firestore Instance:', db ? '✅ Initialized' : '❌ Failed');
};
