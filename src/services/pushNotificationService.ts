import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { captureError } from '../lib/sentry';

// Firebase config for messaging
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

class PushNotificationService {
  private messaging: any = null;
  private vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

  constructor() {
    this.initializeMessaging();
  }

  private initializeMessaging() {
    try {
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        const app = initializeApp(firebaseConfig);
        this.messaging = getMessaging(app);
        this.setupMessageListener();
      }
    } catch (error) {
      console.error('Error initializing messaging:', error);
      captureError(error as Error, { context: 'pushNotificationService.initializeMessaging' });
    }
  }

  // Request permission for push notifications
  async requestPermission(): Promise<boolean> {
    try {
      if (!this.messaging) {
        console.warn('Messaging not initialized');
        return false;
      }

      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        console.log('Notification permission granted');
        return true;
      } else {
        console.log('Notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      captureError(error as Error, { context: 'pushNotificationService.requestPermission' });
      return false;
    }
  }

  // Get FCM token
  async getToken(): Promise<string | null> {
    try {
      if (!this.messaging) {
        console.warn('Messaging not initialized');
        return null;
      }

      const token = await getToken(this.messaging, {
        vapidKey: this.vapidKey,
      });

      if (token) {
        console.log('FCM token:', token);
        return token;
      } else {
        console.log('No registration token available');
        return null;
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
      captureError(error as Error, { context: 'pushNotificationService.getToken' });
      return null;
    }
  }

  // Setup message listener
  private setupMessageListener() {
    if (!this.messaging) return;

    onMessage(this.messaging, (payload: any) => {
      console.log('Message received:', payload);

      // Show notification
      this.showNotification(payload.notification);
    });
  }

  // Show browser notification
  private showNotification(notification: any) {
    if (Notification.permission === 'granted') {
      const notificationOptions = {
        body: notification.body,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: 'mood-log-notification',
        requireInteraction: true,
        actions: [
          {
            action: 'open',
            title: 'Abrir App',
          },
          {
            action: 'dismiss',
            title: 'Cerrar',
          },
        ],
      };

      const notificationInstance = new Notification(notification.title, notificationOptions);

      notificationInstance.onclick = () => {
        window.focus();
        notificationInstance.close();
      };

      // Auto close after 10 seconds
      setTimeout(() => {
        notificationInstance.close();
      }, 10000);
    }
  }

  // Subscribe to topic
  async subscribeToTopic(topic: string): Promise<boolean> {
    try {
      const token = await this.getToken();
      if (!token) return false;

      // This would typically be done on the server side
      // For now, we'll just log the subscription
      console.log(`Subscribing to topic: ${topic}`);

      // Store subscription in localStorage
      const subscriptions = JSON.parse(localStorage.getItem('pushSubscriptions') || '[]');
      if (!subscriptions.includes(topic)) {
        subscriptions.push(topic);
        localStorage.setItem('pushSubscriptions', JSON.stringify(subscriptions));
      }

      return true;
    } catch (error) {
      console.error('Error subscribing to topic:', error);
      captureError(error as Error, { context: 'pushNotificationService.subscribeToTopic' });
      return false;
    }
  }

  // Unsubscribe from topic
  async unsubscribeFromTopic(topic: string): Promise<boolean> {
    try {
      console.log(`Unsubscribing from topic: ${topic}`);

      // Remove from localStorage
      const subscriptions = JSON.parse(localStorage.getItem('pushSubscriptions') || '[]');
      const updatedSubscriptions = subscriptions.filter((sub: string) => sub !== topic);
      localStorage.setItem('pushSubscriptions', JSON.stringify(updatedSubscriptions));

      return true;
    } catch (error) {
      console.error('Error unsubscribing from topic:', error);
      captureError(error as Error, { context: 'pushNotificationService.unsubscribeFromTopic' });
      return false;
    }
  }

  // Get subscription status
  getSubscriptionStatus(): {
    permission: NotificationPermission;
    token: string | null;
    subscriptions: string[];
  } {
    return {
      permission: Notification.permission,
      token: localStorage.getItem('fcmToken'),
      subscriptions: JSON.parse(localStorage.getItem('pushSubscriptions') || '[]'),
    };
  }

  // Initialize push notifications for user
  async initializeForUser(userId: string): Promise<boolean> {
    try {
      const hasPermission = await this.requestPermission();
      if (!hasPermission) return false;

      const token = await this.getToken();
      if (!token) return false;

      // Store token in localStorage
      localStorage.setItem('fcmToken', token);

      // Subscribe to user-specific topics
      await this.subscribeToTopic(`user-${userId}`);
      await this.subscribeToTopic('general');

      console.log('Push notifications initialized for user:', userId);
      return true;
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      captureError(error as Error, { context: 'pushNotificationService.initializeForUser' });
      return false;
    }
  }
}

export const pushNotificationService = new PushNotificationService();
