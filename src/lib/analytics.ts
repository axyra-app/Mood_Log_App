// Google Analytics 4 integration
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export const initAnalytics = () => {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  if (!measurementId || measurementId === 'your_ga_measurement_id') {
    // Silently disable Google Analytics if not configured
    return;
  }

  // Load Google Analytics script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    page_title: document.title,
    page_location: window.location.href,
  });
};

export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

export const trackPageView = (pagePath: string, pageTitle: string) => {
  if (typeof window.gtag === 'function') {
    window.gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID, {
      page_path: pagePath,
      page_title: pageTitle,
    });
  }
};

export const trackUser = (userId: string, userProperties?: Record<string, any>) => {
  if (typeof window.gtag === 'function') {
    window.gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID, {
      user_id: userId,
      custom_map: userProperties,
    });
  }
};

// Specific tracking functions for the app
export const trackMoodLog = (mood: number, method: 'ai' | 'manual' | 'fallback') => {
  trackEvent('mood_logged', 'engagement', `${mood}_${method}`, mood);
};

export const trackChatMessage = (messageType: 'sent' | 'received') => {
  trackEvent('chat_message', 'engagement', messageType);
};

export const trackLogin = (method: 'email' | 'google') => {
  trackEvent('login', 'authentication', method);
};

export const trackRegistration = (userType: 'user' | 'psychologist') => {
  trackEvent('sign_up', 'authentication', userType);
};

export const trackAchievement = (achievementId: string) => {
  trackEvent('achievement_unlocked', 'engagement', achievementId);
};

export const trackError = (errorType: string, _errorMessage: string) => {
  trackEvent('error', 'technical', errorType, 1);
};
