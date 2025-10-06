import { getAnalytics } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyA-C1BT_zMxuYc9KijrjwJvQ7q6HambXhc',
  authDomain: 'mood-log-app-01.firebaseapp.com',
  projectId: 'mood-log-app-01',
  storageBucket: 'mood-log-app-01.firebasestorage.app',
  messagingSenderId: '49395788789',
  appId: '1:49395788789:web:0d09416d660b75d1820ebc',
  measurementId: 'G-2T3QQ2ESWM',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Storage and get a reference to the service
export const storage = getStorage(app);

// Initialize Analytics (only in browser environment)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Función para subir archivos
export const uploadFile = async (file: File, path: string): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Error al subir el archivo');
  }
};

export default app;
