import { useState } from 'react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  timestamp: Date;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  showSuccess: (title: string, message: string) => void;
  showError: (title: string, message: string) => void;
  showInfo: (title: string, message: string) => void;
  showWarning: (title: string, message: string) => void;
  removeNotification: (id: string) => void;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (type: Notification['type'], title: string, message: string) => {
    const id = Date.now().toString();
    const notification: Notification = {
      id,
      title,
      message,
      type,
      timestamp: new Date(),
    };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  const showSuccess = (title: string, message: string) => {
    addNotification('success', title, message);
  };

  const showError = (title: string, message: string) => {
    addNotification('error', title, message);
  };

  const showInfo = (title: string, message: string) => {
    addNotification('info', title, message);
  };

  const showWarning = (title: string, message: string) => {
    addNotification('warning', title, message);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return {
    notifications,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    removeNotification,
  };
};
