// Toast management hook
import { useCallback, useState } from 'react';
import { ToastProps } from '../components/Toast';

interface Toast extends Omit<ToastProps, 'show' | 'onClose'> {
  id: string;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showSuccess = useCallback(
    (message: string, duration?: number) => {
      addToast({ message, type: 'success', duration });
    },
    [addToast]
  );

  const showError = useCallback(
    (message: string, duration?: number) => {
      addToast({ message, type: 'error', duration });
    },
    [addToast]
  );

  const showWarning = useCallback(
    (message: string, duration?: number) => {
      addToast({ message, type: 'warning', duration });
    },
    [addToast]
  );

  const showInfo = useCallback(
    (message: string, duration?: number) => {
      addToast({ message, type: 'info', duration });
    },
    [addToast]
  );

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};
