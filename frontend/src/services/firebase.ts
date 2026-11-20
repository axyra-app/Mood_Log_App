import { FirebaseError, initializeApp } from 'firebase/app';
import {
  browserLocalPersistence,
  connectAuthEmulator,
  indexedDBLocalPersistence,
  initializeAuth,
} from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectStorageEmulator, getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { getFirebaseClientConfig } from '../utils/firebaseClientConfig';

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

// Client config is public by design, but must point at the explicitly selected environment.
const firebaseConfig = getFirebaseClientConfig(import.meta.env);

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
// Load the browser OAuth popup resolver only when Google sign-in is requested.
// Initializing it here eagerly loads Google's iframe helper on the public landing page.
export const auth = initializeAuth(app, {
  persistence: [indexedDBLocalPersistence, browserLocalPersistence],
});

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Storage and get a reference to the service
export const storage = getStorage(app);

const useFirebaseEmulators = import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true';
if (
  import.meta.env.DEV
  && firebaseConfig.projectId === 'demo-mood-log-local'
  && !useFirebaseEmulators
) {
  throw new Error('The local demo project must connect to Firebase emulators.');
}

if (useFirebaseEmulators) {
  if (!import.meta.env.DEV || firebaseConfig.projectId !== 'demo-mood-log-local') {
    throw new Error('Firebase emulators are restricted to local development and the demo project.');
  }

  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  connectStorageEmulator(storage, '127.0.0.1', 9199);
}

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
