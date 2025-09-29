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
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (!isAnalyticsAvailable()) {
    console.warn('Google Analytics no está disponible');
    return;
  }

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// Función para trackear páginas vistas
export const trackPageView = (pageName: string, pagePath: string) => {
  if (!isAnalyticsAvailable()) {
    console.warn('Google Analytics no está disponible');
    return;
  }

  window.gtag('config', 'G-CY8FK7SXKQ', {
    page_title: pageName,
    page_location: pagePath,
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
  moodLogged: (mood: string) => {
    trackEvent('mood_logged', 'Mood Tracking', mood);
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
  pageView: (pageName: string, pagePath: string) => {
    trackPageView(pageName, pagePath);
  },

  // Eventos de PWA
  pwaInstalled: () => {
    trackEvent('pwa_installed', 'PWA');
  },

  pwaOfflineUsed: () => {
    trackEvent('pwa_offline_used', 'PWA');
  },

  // Eventos de errores
  errorOccurred: (errorType: string, errorMessage: string) => {
    trackEvent('error_occurred', 'Error', errorType, 1);
  },
};

// Función para inicializar analytics (opcional)
export const initializeAnalytics = () => {
  if (isAnalyticsAvailable()) {
    console.log('✅ Google Analytics inicializado correctamente');
  } else {
    console.warn('⚠️ Google Analytics no está disponible');
  }
};
