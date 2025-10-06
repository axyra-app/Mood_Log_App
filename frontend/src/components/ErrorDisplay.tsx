import React from 'react';
import { ErrorInfo } from '../hooks/useErrorHandler';

interface ErrorDisplayProps {
  errors: ErrorInfo[];
  onDismiss: (errorId: string) => void;
  onRetry?: (errorId: string) => void;
  maxDisplay?: number;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ errors, onDismiss, onRetry, maxDisplay = 5 }) => {
  const displayErrors = errors.slice(0, maxDisplay);

  if (displayErrors.length === 0) {
    return null;
  }

  const getErrorIcon = (type: ErrorInfo['type']) => {
    switch (type) {
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '❌';
    }
  };

  const getErrorColor = (type: ErrorInfo['type']) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-red-50 border-red-200 text-red-800';
    }
  };

  return (
    <div className='space-y-2'>
      {displayErrors.map((error) => (
        <div key={error.id} className={`border rounded-lg p-3 ${getErrorColor(error.type)}`}>
          <div className='flex items-start justify-between'>
            <div className='flex items-start space-x-2 flex-1'>
              <span className='text-lg'>{getErrorIcon(error.type)}</span>
              <div className='flex-1'>
                <p className='text-sm font-medium'>{error.message}</p>
                {error.context && <p className='text-xs opacity-75 mt-1'>Contexto: {error.context}</p>}
                {error.details && process.env.NODE_ENV === 'development' && (
                  <details className='mt-2'>
                    <summary className='text-xs cursor-pointer opacity-75'>Ver detalles técnicos</summary>
                    <pre className='text-xs mt-1 p-2 bg-black bg-opacity-10 rounded overflow-auto'>
                      {JSON.stringify(error.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>

            <div className='flex items-center space-x-2 ml-2'>
              {error.retryable && onRetry && (
                <button
                  onClick={() => onRetry(error.id)}
                  className='text-xs bg-white bg-opacity-20 hover:bg-opacity-30 px-2 py-1 rounded transition-colors'
                >
                  Reintentar
                </button>
              )}
              <button
                onClick={() => onDismiss(error.id)}
                className='text-xs bg-white bg-opacity-20 hover:bg-opacity-30 px-2 py-1 rounded transition-colors'
              >
                ✕
              </button>
            </div>
          </div>

          <div className='text-xs opacity-75 mt-1'>{error.timestamp.toLocaleTimeString()}</div>
        </div>
      ))}

      {errors.length > maxDisplay && (
        <div className='text-xs text-gray-500 text-center'>
          Y {errors.length - maxDisplay} error{errors.length - maxDisplay !== 1 ? 'es' : ''} más...
        </div>
      )}
    </div>
  );
};

export default ErrorDisplay;
