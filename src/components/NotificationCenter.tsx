import { Bell, Check, X } from 'lucide-react';
import React, { useState } from 'react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  isRead: boolean;
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onDismiss: (id: string) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ notifications, onMarkAsRead, onDismiss }) => {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <div className='relative'>
      {/* Botón de notificaciones */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='relative p-2 text-gray-400 hover:text-gray-600 transition-colors'
      >
        <Bell className='w-6 h-6' />
        {unreadCount > 0 && (
          <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
            {unreadCount}
          </span>
        )}
      </button>

      {/* Panel de notificaciones */}
      {isOpen && (
        <div className='absolute right-0 top-12 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50'>
          <div className='p-4 border-b border-gray-200'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-semibold text-gray-900'>Notificaciones</h3>
              <button onClick={() => setIsOpen(false)} className='text-gray-400 hover:text-gray-600'>
                <X className='w-5 h-5' />
              </button>
            </div>
          </div>

          <div className='max-h-96 overflow-y-auto'>
            {notifications.length === 0 ? (
              <div className='p-6 text-center text-gray-500'>
                <Bell className='w-12 h-12 mx-auto mb-2 text-gray-300' />
                <p>No hay notificaciones</p>
              </div>
            ) : (
              <div className='divide-y divide-gray-200'>
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-l-4 ${getNotificationColor(notification.type)} ${
                      !notification.isRead ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <div className='flex items-start space-x-3'>
                      <div className='text-lg'>{getNotificationIcon(notification.type)}</div>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center justify-between'>
                          <p
                            className={`text-sm font-medium ${
                              !notification.isRead ? 'text-gray-900' : 'text-gray-600'
                            }`}
                          >
                            {notification.title}
                          </p>
                          <div className='flex items-center space-x-1'>
                            {!notification.isRead && (
                              <button
                                onClick={() => onMarkAsRead(notification.id)}
                                className='text-gray-400 hover:text-gray-600'
                                title='Marcar como leída'
                              >
                                <Check className='w-4 h-4' />
                              </button>
                            )}
                            <button
                              onClick={() => onDismiss(notification.id)}
                              className='text-gray-400 hover:text-gray-600'
                              title='Descartar'
                            >
                              <X className='w-4 h-4' />
                            </button>
                          </div>
                        </div>
                        <p className='text-sm text-gray-600 mt-1'>{notification.message}</p>
                        <p className='text-xs text-gray-400 mt-2'>{notification.timestamp.toLocaleTimeString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className='p-3 border-t border-gray-200 bg-gray-50'>
              <button
                onClick={() => {
                  notifications.forEach((n) => {
                    if (!n.isRead) onMarkAsRead(n.id);
                  });
                }}
                className='text-sm text-purple-600 hover:text-purple-700 font-medium'
              >
                Marcar todas como leídas
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
