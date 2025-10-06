import { AlertTriangle, CheckCircle, Info, X, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';

export interface NotificationProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  onClose?: (id: string) => void;
  isDarkMode?: boolean;
}

const NotificationToast: React.FC<NotificationProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
  isDarkMode = false,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.(id);
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className='w-5 h-5 text-green-500' />;
      case 'error':
        return <XCircle className='w-5 h-5 text-red-500' />;
      case 'warning':
        return <AlertTriangle className='w-5 h-5 text-yellow-500' />;
      case 'info':
        return <Info className='w-5 h-5 text-blue-500' />;
      default:
        return <Info className='w-5 h-5 text-gray-500' />;
    }
  };

  const getBackgroundColor = () => {
    if (isDarkMode) {
      switch (type) {
        case 'success':
          return 'bg-green-900/20 border-green-500/30';
        case 'error':
          return 'bg-red-900/20 border-red-500/30';
        case 'warning':
          return 'bg-yellow-900/20 border-yellow-500/30';
        case 'info':
          return 'bg-blue-900/20 border-blue-500/30';
        default:
          return 'bg-gray-900/20 border-gray-500/30';
      }
    } else {
      switch (type) {
        case 'success':
          return 'bg-green-50 border-green-200';
        case 'error':
          return 'bg-red-50 border-red-200';
        case 'warning':
          return 'bg-yellow-50 border-yellow-200';
        case 'info':
          return 'bg-blue-50 border-blue-200';
        default:
          return 'bg-gray-50 border-gray-200';
      }
    }
  };

  const getTextColor = () => {
    if (isDarkMode) {
      return 'text-white';
    } else {
      switch (type) {
        case 'success':
          return 'text-green-800';
        case 'error':
          return 'text-red-800';
        case 'warning':
          return 'text-yellow-800';
        case 'info':
          return 'text-blue-800';
        default:
          return 'text-gray-800';
      }
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm w-full mx-4 transform transition-all duration-300 ${
        isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
      }`}
    >
      <div className={`p-4 rounded-xl border-2 shadow-lg backdrop-blur-sm ${getBackgroundColor()}`}>
        <div className='flex items-start space-x-3'>
          <div className='flex-shrink-0'>{getIcon()}</div>
          <div className='flex-1 min-w-0'>
            <h4 className={`text-sm font-bold ${getTextColor()}`}>{title}</h4>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{message}</p>
          </div>
          <button
            onClick={handleClose}
            className={`flex-shrink-0 p-1 rounded-lg transition-colors ${
              isDarkMode
                ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <X className='w-4 h-4' />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationToast;
