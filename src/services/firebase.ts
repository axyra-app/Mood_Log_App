import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFirebaseConfig } from '../config/production';
import { auth as mockAuth, db as mockDb } from './firebase-mock';

// Configuración de Firebase
const firebaseConfig = getFirebaseConfig();

let app: any;
let auth: any;
let db: any;

try {
  // Inicializar Firebase
  app = initializeApp(firebaseConfig);
  
  // Inicializar servicios
  auth = getAuth(app);
  db = getFirestore(app);
  
  console.log('✅ Firebase inicializado correctamente');
} catch (error) {
  console.warn('⚠️ Error al inicializar Firebase, usando modo demo:', error);
  
  // Usar mocks en caso de error
  auth = mockAuth;
  db = mockDb;
  app = { auth, db };
}

export { auth, db };
export default app;
