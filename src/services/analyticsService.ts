// Analytics Service for tracking user interactions
interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp?: Date;
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private isEnabled: boolean = false;

  constructor() {
    this.isEnabled = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';
  }

  // Track a custom event
  track(event: string, properties?: Record<string, any>) {
    if (!this.isEnabled) return;

    const analyticsEvent: AnalyticsEvent = {
      event,
      properties,
      timestamp: new Date(),
    };

    this.events.push(analyticsEvent);

    // Log to console in development
    if (import.meta.env.DEV) {
      console.log('📊 Analytics Event:', analyticsEvent);
    }

    // Send to external analytics service (if configured)
    this.sendToExternalService(analyticsEvent);
  }

  // Track page views
  trackPageView(page: string, properties?: Record<string, any>) {
    this.track('page_view', {
      page,
      ...properties,
    });
  }

  // Track user actions
  trackUserAction(action: string, properties?: Record<string, any>) {
    this.track('user_action', {
      action,
      ...properties,
    });
  }

  // Track mood logging flow events
  trackMoodFlowEvent(step: string, properties?: Record<string, any>) {
    this.track('mood_flow', {
      step,
      ...properties,
    });
  }

  // Track diary entry events
  trackDiaryEvent(action: string, properties?: Record<string, any>) {
    this.track('diary_entry', {
      action,
      ...properties,
    });
  }

  // Track achievement events
  trackAchievementEvent(achievement: string, properties?: Record<string, any>) {
    this.track('achievement', {
      achievement,
      ...properties,
    });
  }

  // Track error events
  trackError(error: string, properties?: Record<string, any>) {
    this.track('error', {
      error,
      ...properties,
    });
  }

  // Send to external analytics service
  private sendToExternalService(event: AnalyticsEvent) {
    // Google Analytics 4 example
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event.event, event.properties);
    }

    // Custom analytics endpoint
    if (import.meta.env.VITE_ANALYTICS_ENDPOINT) {
      fetch(import.meta.env.VITE_ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }).catch((error) => {
        console.error('Analytics error:', error);
      });
    }
  }

  // Get analytics data
  getAnalyticsData() {
    return {
      events: this.events,
      totalEvents: this.events.length,
      isEnabled: this.isEnabled,
    };
  }

  // Clear analytics data
  clearAnalyticsData() {
    this.events = [];
  }
}

export const analyticsService = new AnalyticsService();
