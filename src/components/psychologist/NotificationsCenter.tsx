import { AlertTriangle, Bell, Calendar, Check, Heart, Info, MessageCircle, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import {
  deleteNotification,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../../services/notificationService';
import { PushNotification } from '../../types';

interface NotificationsCenterProps {
  notifications: PushNotification[];
  onNotificationClick: (notification: PushNotification) => void;
}

const NotificationsCenter: React.FC<NotificationsCenterProps> = ({ notifications, onNotificationClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const unread = notifications.filter((n) => !n.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  const handleNotificationClick = async (notification: PushNotification) => {
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
    }
    onNotificationClick(notification);
    setIsOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead(notifications[0]?.userId || '');
    } catch (error) {
      console.error('Error marcando todas las notificaciones como leídas:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteNotification(notificationId);
    } catch (error) {
      console.error('Error eliminando notificación:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'emergency':
        return <AlertTriangle className='h-5 w-5 text-red-500' />;
      case 'appointment':
        return <Calendar className='h-5 w-5 text-blue-500' />;
      case 'message':
        return <MessageCircle className='h-5 w-5 text-green-500' />;
      case 'mood_check':
        return <Heart className='h-5 w-5 text-pink-500' />;
      default:
        return <Info className='h-5 w-5 text-gray-500' />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'emergency':
        return 'bg-red-50 border-red-200';
      case 'appointment':
        return 'bg-blue-50 border-blue-200';
      case 'message':
        return 'bg-green-50 border-green-200';
      case 'mood_check':
        return 'bg-pink-50 border-pink-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours}h`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Hace ${diffInDays}d`;

    return date.toLocaleDateString('es-ES');
  };

  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
  );

  return (
    <div className='relative'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-full'
      >
        <Bell className='h-6 w-6' />
        {unreadCount > 0 && (
          <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className='fixed inset-0 z-10' onClick={() => setIsOpen(false)} />
          <div className='absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20'>
            <div className='p-4 border-b border-gray-200'>
              <div className='flex items-center justify-between'>
                <h3 className='text-lg font-medium text-gray-900'>Notificaciones</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className='text-sm text-green-600 hover:text-green-700 flex items-center space-x-1'
                  >
                    <Check className='h-4 w-4' />
                    <span>Marcar todas como leídas</span>
                  </button>
                )}
              </div>
            </div>

            <div className='max-h-96 overflow-y-auto'>
              {sortedNotifications.length === 0 ? (
                <div className='p-4 text-center text-gray-500'>
                  <Bell className='h-8 w-8 mx-auto mb-2 text-gray-400' />
                  <p>No hay notificaciones</p>
                </div>
              ) : (
                <div className='divide-y divide-gray-200'>
                  {sortedNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className='flex items-start space-x-3'>
                        <div className='flex-shrink-0'>{getNotificationIcon(notification.type)}</div>
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-center justify-between'>
                            <p
                              className={`text-sm font-medium ${
                                !notification.read ? 'text-gray-900' : 'text-gray-700'
                              }`}
                            >
                              {notification.title}
                            </p>
                            <div className='flex items-center space-x-2'>
                              <span className='text-xs text-gray-500'>{formatTimeAgo(notification.sentAt)}</span>
                              <button
                                onClick={(e) => handleDeleteNotification(notification.id, e)}
                                className='text-gray-400 hover:text-red-500'
                              >
                                <X className='h-4 w-4' />
                              </button>
                            </div>
                          </div>
                          <p className={`text-sm mt-1 ${!notification.read ? 'text-gray-700' : 'text-gray-500'}`}>
                            {notification.body}
                          </p>
                          {!notification.read && (
                            <div className='mt-2'>
                              <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                                Nuevo
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {sortedNotifications.length > 0 && (
              <div className='p-4 border-t border-gray-200'>
                <button
                  onClick={() => setIsOpen(false)}
                  className='w-full text-center text-sm text-gray-600 hover:text-gray-800'
                >
                  Ver todas las notificaciones
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationsCenter;
