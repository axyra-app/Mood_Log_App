import { validateConfig } from '../config/production';

// Validar variables de entorno al cargar la aplicación
export const validateEnvironment = () => {
  const isValid = validateConfig();

  if (!isValid) {
    console.error('❌ Configuración de entorno inválida');
    return false;
  }

  console.log('✅ Configuración de entorno válida');
  return true;
};

// Función para obtener variables de entorno con valores por defecto
export const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = import.meta.env[key];

  if (!value && !defaultValue) {
    console.warn(`⚠️ Variable de entorno ${key} no encontrada`);
    return '';
  }

  return value || defaultValue || '';
};

// Función para verificar si estamos en desarrollo
export const isDevelopment = () => {
  return import.meta.env.DEV;
};

// Función para verificar si estamos en producción
export const isProduction = () => {
  return import.meta.env.PROD;
};

// Función para obtener la URL base de la aplicación
export const getBaseUrl = () => {
  if (isDevelopment()) {
    return 'http://localhost:5173';
  }

  return getEnvVar('VITE_APP_URL', 'https://moodlogapp.vercel.app');
};

// Función para obtener la configuración de Firebase
export const getFirebaseEnvConfig = () => {
  return {
    apiKey: getEnvVar('VITE_FIREBASE_API_KEY'),
    authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN'),
    projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID'),
    storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    appId: getEnvVar('VITE_FIREBASE_APP_ID'),
  };
};

// Función para obtener la configuración de OpenAI
export const getOpenAIEnvConfig = () => {
  return {
    apiKey: getEnvVar('VITE_OPENAI_API_KEY'),
  };
};

// Función para verificar si todas las variables de entorno están configuradas
export const checkRequiredEnvVars = () => {
  const required = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
    'VITE_OPENAI_API_KEY',
  ];

  const missing = required.filter((key) => !getEnvVar(key));

  if (missing.length > 0) {
    console.error('❌ Variables de entorno faltantes:', missing);
    return false;
  }

  console.log('✅ Todas las variables de entorno están configuradas');
  return true;
};

// Función para mostrar información de la configuración (solo en desarrollo)
export const logEnvironmentInfo = () => {
  if (isDevelopment()) {
    console.log('🔧 Información del entorno:');
    console.log('- Modo:', isDevelopment() ? 'Desarrollo' : 'Producción');
    console.log('- URL base:', getBaseUrl());
    console.log('- Firebase configurado:', !!getEnvVar('VITE_FIREBASE_API_KEY'));
    console.log('- OpenAI configurado:', !!getEnvVar('VITE_OPENAI_API_KEY'));
  }
};
