// Toast notification component
import { AlertCircle, CheckCircle, X, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
  show?: boolean;
}

const Toast = ({ message, type, duration = 5000, onClose, show = true }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    setIsVisible(show);
  }, [show]);

  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className='w-5 h-5 text-green-600' />;
      case 'error':
        return <XCircle className='w-5 h-5 text-red-600' />;
      case 'warning':
        return <AlertCircle className='w-5 h-5 text-yellow-600' />;
      default:
        return <AlertCircle className='w-5 h-5 text-blue-600' />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  if (!isVisible) return null;

  return (
    <div className='fixed top-4 right-4 z-50 animate-in slide-in-from-right-full duration-300'>
      <div className={`max-w-sm w-full rounded-lg border p-4 shadow-lg ${getStyles()}`}>
        <div className='flex items-start space-x-3'>
          {getIcon()}
          <div className='flex-1'>
            <p className='text-sm font-medium'>{message}</p>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              onClose?.();
            }}
            className='text-gray-400 hover:text-gray-600 transition-colors'
          >
            <X className='w-4 h-4' />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;
