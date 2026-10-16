import { getAnalytics } from 'firebase/analytics';
import { FirebaseError, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';

const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_UPLOAD_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]);
const RETRYABLE_STORAGE_ERRORS = new Set([
  'storage/retry-limit-exceeded',
  'storage/unknown',
]);

const getUploadErrorMessage = (error: unknown): string => {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'storage/unauthenticated':
        return 'Tu sesión expiró. Inicia sesión de nuevo para subir el archivo.';
      case 'storage/unauthorized':
        return 'No tienes permisos para subir este archivo. Revisa las reglas de Firebase Storage.';
      case 'storage/quota-exceeded':
        return 'Se alcanzó el límite de almacenamiento del proyecto.';
      case 'storage/canceled':
        return 'La subida del archivo fue cancelada.';
      default:
        return `Error de Firebase Storage (${error.code}): ${error.message}`;
    }
  }

  return error instanceof Error
    ? `Error al subir el archivo: ${error.message}`
    : 'Ocurrió un error inesperado al subir el archivo.';
};

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

export const uploadFile = async (file: File, path: string): Promise<string> => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    throw new Error('Debes iniciar sesión para subir un archivo.');
  }
  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    throw new Error('El archivo supera el límite de 10 MB.');
  }
  if (!ALLOWED_UPLOAD_TYPES.has(file.type)) {
    throw new Error('Tipo de archivo no permitido. Usa una imagen JPEG, PNG, WebP o un PDF.');
  }

  const pathSegments = path.split('/').filter(Boolean);
  if (
    pathSegments.length === 0
    || pathSegments.some((segment) => segment === '.' || segment === '..')
  ) {
    throw new Error('La ruta del archivo no es válida.');
  }

  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const storageRef = ref(storage, `users/${userId}/${pathSegments.join('/')}`);
      const metadata = {
        contentType: file.type,
        cacheControl: 'private, no-store',
        customMetadata: {
          uploadedAt: new Date().toISOString(),
        },
      };
      
      const snapshot = await uploadBytes(storageRef, file, metadata);
      return await getDownloadURL(snapshot.ref);
    } catch (error) {
      const code = error instanceof FirebaseError ? error.code : undefined;
      const shouldRetry = code !== undefined && RETRYABLE_STORAGE_ERRORS.has(code);
      console.error('File upload failed', { attempt, code });

      if (!shouldRetry || attempt === maxAttempts) {
        throw new Error(getUploadErrorMessage(error));
      }

      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }

  throw new Error('Error inesperado al subir el archivo.');
};

export default app;
