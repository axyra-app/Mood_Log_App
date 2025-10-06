// Configuración de producción
export const PRODUCTION_CONFIG = {
  // URLs de la aplicación
  APP_URL: import.meta.env.VITE_APP_URL || 'https://moodlogapp.vercel.app',

  // Configuración de Firebase
  FIREBASE: {
    API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
    AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    APP_ID: import.meta.env.VITE_FIREBASE_APP_ID,
  },

  // Configuración de OpenAI
  OPENAI: {
    API_KEY: import.meta.env.VITE_OPENAI_API_KEY,
    MODEL: 'gpt-3.5-turbo',
    MAX_TOKENS: 1000,
    TEMPERATURE: 0.7,
  },

  // Configuración de la aplicación
  APP: {
    NAME: 'Mood Log App',
    VERSION: '1.0.0',
    DESCRIPTION: 'Tu compañero personal para el seguimiento del estado de ánimo',
    AUTHOR: 'Mood Log App Team',
  },

  // Configuración de PWA
  PWA: {
    ENABLED: true,
    CACHE_STRATEGY: 'cacheFirst',
    OFFLINE_FALLBACK: true,
  },

  // Configuración de analytics
  ANALYTICS: {
    ENABLED: true,
    GOOGLE_ANALYTICS_ID: import.meta.env.VITE_GA_ID,
  },

  // Configuración de monitoreo de errores
  ERROR_MONITORING: {
    ENABLED: true,
    SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
  },

  // Configuración de notificaciones
  NOTIFICATIONS: {
    ENABLED: true,
    VAPID_KEY: import.meta.env.VITE_VAPID_KEY,
  },

  // Configuración de límites
  LIMITS: {
    MAX_MOOD_LOGS_PER_DAY: 10,
    MAX_MESSAGE_LENGTH: 1000,
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    MAX_CHAT_MESSAGES: 1000,
  },

  // Configuración de caché
  CACHE: {
    MOOD_LOGS_TTL: 5 * 60 * 1000, // 5 minutos
    STATISTICS_TTL: 15 * 60 * 1000, // 15 minutos
    PSYCHOLOGISTS_TTL: 30 * 60 * 1000, // 30 minutos
  },

  // Configuración de seguridad
  SECURITY: {
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 horas
    MAX_LOGIN_ATTEMPTS: 5,
    PASSWORD_MIN_LENGTH: 6,
  },

  // Configuración de desarrollo
  DEVELOPMENT: {
    ENABLE_LOGGING: import.meta.env.DEV,
    ENABLE_DEVTOOLS: import.meta.env.DEV,
    MOCK_DATA: false,
  },
};

// Función para validar la configuración
export const validateConfig = () => {
  const required = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
  ];

  const missing = required.filter((key) => !import.meta.env[key]);

  if (missing.length > 0) {
    console.warn('⚠️ Variables de entorno faltantes (no críticas):', missing);
    // No retornar false para no bloquear la aplicación
  }

  return true;
};

// Función para obtener la configuración de Firebase
export const getFirebaseConfig = () => {
  const config = {
    apiKey: PRODUCTION_CONFIG.FIREBASE.API_KEY || 'demo-api-key',
    authDomain: PRODUCTION_CONFIG.FIREBASE.AUTH_DOMAIN || 'demo-project.firebaseapp.com',
    projectId: PRODUCTION_CONFIG.FIREBASE.PROJECT_ID || 'demo-project',
    storageBucket: PRODUCTION_CONFIG.FIREBASE.STORAGE_BUCKET || 'demo-project.appspot.com',
    messagingSenderId: PRODUCTION_CONFIG.FIREBASE.MESSAGING_SENDER_ID || '123456789',
    appId: PRODUCTION_CONFIG.FIREBASE.APP_ID || '1:123456789:web:abcdef',
  };

  // Verificar si estamos usando valores demo
  if (config.apiKey === 'demo-api-key') {
    console.warn('⚠️ Usando configuración demo de Firebase. Configura las variables de entorno para producción.');
  }

  return config;
};

// Función para obtener la configuración de OpenAI
export const getOpenAIConfig = () => {
  return {
    apiKey: PRODUCTION_CONFIG.OPENAI.API_KEY,
    model: PRODUCTION_CONFIG.OPENAI.MODEL,
    maxTokens: PRODUCTION_CONFIG.OPENAI.MAX_TOKENS,
    temperature: PRODUCTION_CONFIG.OPENAI.TEMPERATURE,
  };
};
