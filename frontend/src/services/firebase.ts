import { getAnalytics } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';

// Firebase configuration - Production ready
const firebaseConfig = {
  apiKey: "AIzaSyA-C1BT_zMxuYc9KijrjwJvQ7q6HambXhc",
  authDomain: "mood-log-app-01.firebaseapp.com",
  projectId: "mood-log-app-01",
  storageBucket: "mood-log-app-01.firebasestorage.app",
  messagingSenderId: "49395788789",
  appId: "1:49395788789:web:0d09416d660b75d1820ebc",
  measurementId: "G-2T3QQ2ESWM"
};

// Debug: Log configuration (only in development)
if (import.meta.env.DEV) {
  console.log('🔥 Firebase Config:', firebaseConfig);
}

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

// Función para subir archivos con retry y mejor manejo de errores
export const uploadFile = async (file: File, path: string): Promise<string> => {
  const maxRetries = 3;
  let retryCount = 0;
  
  while (retryCount < maxRetries) {
    try {
      console.log(`📤 Upload attempt ${retryCount + 1}/${maxRetries}:`, { 
        fileName: file.name, 
        path, 
        size: file.size,
        type: file.type 
      });
      
      const storageRef = ref(storage, path);
      
      // Configurar metadata específica para evitar problemas de CORS
      const metadata = {
        contentType: file.type || 'application/octet-stream',
        cacheControl: 'public, max-age=31536000',
        customMetadata: {
          uploadedAt: new Date().toISOString(),
          originalName: file.name,
        },
      };
      
      console.log('📤 Uploading with metadata:', metadata);
      
      const snapshot = await uploadBytes(storageRef, file, metadata);
      console.log('✅ Upload successful:', snapshot);
      
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('🔗 Download URL generated:', downloadURL);
      
      return downloadURL;
    } catch (error) {
      retryCount++;
      console.error(`❌ Upload attempt ${retryCount} failed:`, error);
      
      if (retryCount >= maxRetries) {
        console.error('❌ All upload attempts failed');
        console.error('❌ Final error details:', {
          code: (error as any)?.code,
          message: (error as any)?.message,
          serverResponse: (error as any)?.serverResponse,
          name: (error as any)?.name,
        });
        
        // Si es un error de CORS, sugerir solución alternativa
        if ((error as any)?.message?.includes('CORS') || (error as any)?.code === 'storage/unauthorized') {
          throw new Error('Error de CORS: La configuración de Firebase Storage necesita ser actualizada. Contacta al administrador.');
        }
        
        throw new Error(`Error al subir el archivo después de ${maxRetries} intentos: ${(error as any)?.message || 'Error desconocido'}`);
      }
      
      // Esperar antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
    }
  }
  
  throw new Error('Error inesperado en la subida de archivos');
};

export default app;
