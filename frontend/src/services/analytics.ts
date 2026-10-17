// Google Analytics Service
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

// Función para verificar si Google Analytics está disponible
export const isAnalyticsAvailable = (): boolean => {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
};

// Función para enviar eventos a Google Analytics
const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (!isAnalyticsAvailable()) {
    return;
  }

  const eventParameters: Record<string, string | number> = {
    event_category: category,
  };
  if (label !== undefined) eventParameters.event_label = label;
  if (value !== undefined) eventParameters.value = value;

  window.gtag('event', action, eventParameters);
};

// Función para trackear páginas vistas
const trackPageView = () => {
  if (!isAnalyticsAvailable()) {
    return;
  }

  window.gtag('config', 'G-CY8FK7SXKQ', {
    page_title: 'Mood Log App',
    page_location: window.location.origin,
  });
};

// Eventos específicos de la aplicación
export const analyticsEvents = {
  // Eventos de autenticación
  userSignUp: (method: 'email' | 'google') => {
    trackEvent('sign_up', 'Authentication', method);
  },

  userLogin: (method: 'email' | 'google') => {
    trackEvent('login', 'Authentication', method);
  },

  userLogout: () => {
    trackEvent('logout', 'Authentication');
  },

  // Eventos de mood logging
  moodLogged: () => {
    trackEvent('mood_logged', 'Mood Tracking');
  },

  moodViewStats: () => {
    trackEvent('view_stats', 'Mood Tracking');
  },

  // Eventos de chat
  chatMessageSent: () => {
    trackEvent('message_sent', 'Chat');
  },

  chatStarted: () => {
    trackEvent('chat_started', 'Chat');
  },

  // Eventos de navegación
  pageView: () => {
    trackPageView();
  },

  // Eventos de PWA
  pwaInstalled: () => {
    trackEvent('pwa_installed', 'PWA');
  },

  pwaOfflineUsed: () => {
    trackEvent('pwa_offline_used', 'PWA');
  },

  // Eventos de errores
  errorOccurred: () => {
    trackEvent('error_occurred', 'Error', undefined, 1);
  },
};

// Función para inicializar analytics (opcional)
export const initializeAnalytics = () => {
  if (isAnalyticsAvailable()) {
    // Google Analytics inicializado correctamente
  } else {
    console.warn('⚠️ Google Analytics no está disponible');
  }
};
