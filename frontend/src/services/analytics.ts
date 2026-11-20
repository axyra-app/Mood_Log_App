import type { Analytics } from 'firebase/analytics';
import { ANALYTICS_CONSENT_VERSION } from '../utils/legalVersions.ts';

let analyticsInstance: Analytics | null = null;
let analyticsEnabled = false;
let analyticsRevision = 0;

export const hasCurrentAnalyticsConsent = (settings: unknown): boolean => {
  if (!settings || typeof settings !== 'object' || Array.isArray(settings)) return false;
  const value = settings as Record<string, unknown>;
  return value.analyticsOptIn === true
    && value.analyticsConsentVersion === ANALYTICS_CONSENT_VERSION
    && value.analyticsConsentAt !== undefined
    && value.analyticsConsentAt !== null;
};

export const isAnalyticsAvailable = (): boolean =>
  analyticsEnabled && analyticsInstance !== null;

/** Starts collection only after a current, explicit user choice has been saved. */
export const setAnalyticsConsent = async (enabled: boolean): Promise<void> => {
  const revision = ++analyticsRevision;
  analyticsEnabled = false;

  if (!enabled) {
    if (analyticsInstance) {
      try {
        const { setAnalyticsCollectionEnabled } = await import('firebase/analytics');
        setAnalyticsCollectionEnabled(analyticsInstance, false);
      } catch {
        // Collection remains disabled in this wrapper even if the SDK cannot be reached.
      }
    }
    return;
  }

  if (typeof window === 'undefined') return;

  try {
    const analyticsSdk = await import('firebase/analytics');
    if (revision !== analyticsRevision || !(await analyticsSdk.isSupported())) return;
    const { default: app } = await import('./firebase.ts');
    if (revision !== analyticsRevision || !app.options.measurementId) return;

    analyticsInstance ??= analyticsSdk.initializeAnalytics(app, {
      config: { send_page_view: false },
    });
    analyticsSdk.setAnalyticsCollectionEnabled(analyticsInstance, true);
    analyticsEnabled = true;
  } catch {
    analyticsEnabled = false;
    console.warn('Firebase Analytics no está disponible en este entorno.');
  }
};

const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number,
) => {
  if (!isAnalyticsAvailable()) return;

  const parameters: Record<string, string | number> = { event_category: category };
  if (label !== undefined) parameters.event_label = label;
  if (value !== undefined) parameters.value = value;

  const instance = analyticsInstance;
  if (!instance) return;
  const revision = analyticsRevision;
  void import('firebase/analytics').then(({ logEvent }) => {
    if (analyticsEnabled && revision === analyticsRevision && instance === analyticsInstance) {
      logEvent(instance, action, parameters);
    }
  }).catch(() => undefined);
};

const trackPageView = () => {
  if (!isAnalyticsAvailable() || typeof window === 'undefined') return;

  const instance = analyticsInstance;
  if (!instance) return;
  const revision = analyticsRevision;
  void import('firebase/analytics').then(({ logEvent }) => {
    if (!analyticsEnabled || revision !== analyticsRevision || instance !== analyticsInstance) return;
    logEvent(instance, 'page_view', {
      page_title: 'Mood Log App',
      page_location: window.location.origin,
    });
  }).catch(() => undefined);
};

export const analyticsEvents = {
  userSignUp: (method: 'email' | 'google') => trackEvent('sign_up', 'Authentication', method),
  userLogin: (method: 'email' | 'google') => trackEvent('login', 'Authentication', method),
  userLogout: () => trackEvent('logout', 'Authentication'),
  moodLogged: () => trackEvent('mood_logged', 'Mood Tracking'),
  moodViewStats: () => trackEvent('view_stats', 'Mood Tracking'),
  chatMessageSent: () => trackEvent('message_sent', 'Chat'),
  chatStarted: () => trackEvent('chat_started', 'Chat'),
  pageView: () => trackPageView(),
  pwaInstalled: () => trackEvent('pwa_installed', 'PWA'),
  pwaOfflineUsed: () => trackEvent('pwa_offline_used', 'PWA'),
  errorOccurred: () => trackEvent('error_occurred', 'Error', undefined, 1),
};
