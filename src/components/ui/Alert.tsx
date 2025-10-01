import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import React from 'react';

interface AlertProps {
  type: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
  isDarkMode: boolean;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({ type, title, message, onClose, isDarkMode, className = '' }) => {
  const getAlertStyles = () => {
    switch (type) {
      case 'success':
        return {
          container: 'bg-green-50 border-green-200',
          icon: 'text-green-600',
          title: 'text-green-800',
          message: 'text-green-700',
          iconComponent: CheckCircle,
        };
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200',
          icon: 'text-yellow-600',
          title: 'text-yellow-800',
          message: 'text-yellow-700',
          iconComponent: AlertTriangle,
        };
      case 'error':
        return {
          container: 'bg-red-50 border-red-200',
          icon: 'text-red-600',
          title: 'text-red-800',
          message: 'text-red-700',
          iconComponent: AlertTriangle,
        };
      case 'info':
        return {
          container: 'bg-blue-50 border-blue-200',
          icon: 'text-blue-600',
          title: 'text-blue-800',
          message: 'text-blue-700',
          iconComponent: Info,
        };
      default:
        return {
          container: 'bg-gray-50 border-gray-200',
          icon: 'text-gray-600',
          title: 'text-gray-800',
          message: 'text-gray-700',
          iconComponent: Info,
        };
    }
  };

  const styles = getAlertStyles();
  const IconComponent = styles.iconComponent;

  return (
    <div className={`border rounded-lg p-4 ${styles.container} ${className}`}>
      <div className='flex items-start'>
        <IconComponent className={`h-5 w-5 ${styles.icon} mt-0.5 mr-3`} />
        <div className='flex-1'>
          {title && <h3 className={`text-sm font-medium ${styles.title} mb-1`}>{title}</h3>}
          <p className={`text-sm ${styles.message}`}>{message}</p>
        </div>
        {onClose && (
          <button onClick={onClose} className={`ml-3 ${styles.icon} hover:opacity-75 transition-opacity`}>
            <X className='h-4 w-4' />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;
