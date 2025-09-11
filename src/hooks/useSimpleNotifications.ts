import { useCallback, useState } from 'react';

export interface SimpleNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: number;
}

export const useSimpleNotifications = () => {
  const [notifications, setNotifications] = useState<SimpleNotification[]>([]);

  const showSuccess = useCallback((title: string, message: string) => {
    const notification: SimpleNotification = {
      id: Date.now().toString(),
      type: 'success',
      title,
      message,
      timestamp: Date.now(),
    };
    
    setNotifications(prev => [notification, ...prev]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      removeNotification(notification.id);
    }, 5000);
  }, []);

  const showError = useCallback((title: string, message: string) => {
    const notification: SimpleNotification = {
      id: Date.now().toString(),
      type: 'error',
      title,
      message,
      timestamp: Date.now(),
    };
    
    setNotifications(prev => [notification, ...prev]);
    
    // Auto remove after 8 seconds for errors
    setTimeout(() => {
      removeNotification(notification.id);
    }, 8000);
  }, []);

  const showInfo = useCallback((title: string, message: string) => {
    const notification: SimpleNotification = {
      id: Date.now().toString(),
      type: 'info',
      title,
      message,
      timestamp: Date.now(),
    };
    
    setNotifications(prev => [notification, ...prev]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      removeNotification(notification.id);
    }, 5000);
  }, []);

  const showWarning = useCallback((title: string, message: string) => {
    const notification: SimpleNotification = {
      id: Date.now().toString(),
      type: 'warning',
      title,
      message,
      timestamp: Date.now(),
    };
    
    setNotifications(prev => [notification, ...prev]);
    
    // Auto remove after 6 seconds
    setTimeout(() => {
      removeNotification(notification.id);
    }, 6000);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    removeNotification,
    clearAllNotifications,
  };
};

export default useSimpleNotifications;
