// Simple Firebase Configuration
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Log configuration for debugging
console.log('Firebase Config Check:', {
  hasApiKey: !!firebaseConfig.apiKey,
  hasAuthDomain: !!firebaseConfig.authDomain,
  hasProjectId: !!firebaseConfig.projectId,
  hasStorageBucket: !!firebaseConfig.storageBucket,
  hasMessagingSenderId: !!firebaseConfig.messagingSenderId,
  hasAppId: !!firebaseConfig.appId,
  hasMeasurementId: !!firebaseConfig.measurementId,
  apiKeyPreview: firebaseConfig.apiKey ? firebaseConfig.apiKey.substring(0, 10) + '...' : 'NOT SET',
  projectId: firebaseConfig.projectId || 'NOT SET'
});

// Validate Firebase configuration
export const validateFirebaseConfig = () => {
  const requiredKeys = [
    'apiKey',
    'authDomain', 
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId'
  ];

  const missingKeys = requiredKeys.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);
  
  if (missingKeys.length > 0) {
    console.error('Missing Firebase configuration keys:', missingKeys);
    return false;
  }
  
  console.log('Firebase configuration is valid');
  return true;
};

// Environment check
export const isProduction = import.meta.env.PROD;
export const isDevelopment = import.meta.env.DEV;
