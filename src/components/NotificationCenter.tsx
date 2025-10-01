import { AlertTriangle, Bell, Calendar, Check, CheckCheck, Clock, Heart, Zap } from 'lucide-react';
import React, { useState } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import Modal from '../ui/Modal';

interface NotificationCenterProps {
  userId: string;
  isDarkMode: boolean;
  isOpen: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ userId, isDarkMode, isOpen, onClose }) => {
  const { notifications, unreadCount, loading, error, markAsRead, markAllAsRead, handleNotificationAction } =
    useNotifications(userId);

  const [filter, setFilter] = useState<'all' | 'unread' | 'crisis' | 'appointments' | 'achievements'>('all');

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'crisis_alert':
        return <AlertTriangle className='w-5 h-5 text-red-600' />;
      case 'appointment_reminder':
        return <Calendar className='w-5 h-5 text-blue-600' />;
      case 'mood_check':
        return <Heart className='w-5 h-5 text-pink-600' />;
      case 'achievement':
        return <Zap className='w-5 h-5 text-yellow-600' />;
      case 'recommendation':
        return <Bell className='w-5 h-5 text-purple-600' />;
      default:
        return <Bell className='w-5 h-5 text-gray-600' />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'border-red-500 bg-red-50';
      case 'high':
        return 'border-orange-500 bg-orange-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-green-500 bg-green-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Ahora mismo';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)} h`;
    return `Hace ${Math.floor(diffInMinutes / 1440)} días`;
  };

  const filteredNotifications = notifications.filter((notification) => {
    switch (filter) {
      case 'unread':
        return !notification.read;
      case 'crisis':
        return notification.type === 'crisis_alert';
      case 'appointments':
        return notification.type === 'appointment_reminder';
      case 'achievements':
        return notification.type === 'achievement';
      default:
        return true;
    }
  });

  const handleActionClick = async (notificationId: string, actionId: string) => {
    await handleNotificationAction(notificationId, actionId);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='🔔 Centro de Notificaciones' isDarkMode={isDarkMode} size='lg'>
      <div className='space-y-4'>
        {/* Header con filtros y acciones */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <Bell className='w-5 h-5 text-blue-600' />
            <span className='font-medium'>{unreadCount > 0 ? `${unreadCount} no leídas` : 'Todas leídas'}</span>
          </div>

          <div className='flex items-center space-x-2'>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className={`px-3 py-1 rounded-lg border text-sm ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-700'
              }`}
            >
              <option value='all'>Todas</option>
              <option value='unread'>No leídas</option>
              <option value='crisis'>Crisis</option>
              <option value='appointments'>Citas</option>
              <option value='achievements'>Logros</option>
            </select>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className='flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm'
              >
                <CheckCheck className='w-4 h-4' />
                <span>Marcar todas</span>
              </button>
            )}
          </div>
        </div>

        {/* Lista de notificaciones */}
        <div className='max-h-96 overflow-y-auto space-y-3'>
          {loading ? (
            <div className='text-center py-8'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
              <p className='text-gray-600 mt-2'>Cargando notificaciones...</p>
            </div>
          ) : error ? (
            <div className='text-center py-8'>
              <p className='text-red-600'>{error}</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className='text-center py-8'>
              <Bell className='w-12 h-12 text-gray-400 mx-auto mb-3' />
              <p className='text-gray-600'>
                {filter === 'unread' ? 'No hay notificaciones no leídas' : 'No hay notificaciones'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border transition-all duration-200 ${
                  notification.read
                    ? isDarkMode
                      ? 'bg-gray-700 border-gray-600'
                      : 'bg-gray-50 border-gray-200'
                    : getPriorityColor(notification.priority)
                }`}
              >
                <div className='flex items-start space-x-3'>
                  <div className='flex-shrink-0 mt-1'>{getNotificationIcon(notification.type)}</div>

                  <div className='flex-1 min-w-0'>
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <h4 className={`font-medium ${notification.read ? 'text-gray-600' : 'text-gray-900'}`}>
                          {notification.title}
                        </h4>
                        <p className={`text-sm mt-1 ${notification.read ? 'text-gray-500' : 'text-gray-700'}`}>
                          {notification.message}
                        </p>

                        <div className='flex items-center space-x-2 mt-2'>
                          <span className='text-xs text-gray-500 flex items-center space-x-1'>
                            <Clock className='w-3 h-3' />
                            <span>{formatTimeAgo(notification.createdAt)}</span>
                          </span>

                          {!notification.read && (
                            <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                              Nuevo
                            </span>
                          )}
                        </div>
                      </div>

                      <div className='flex items-center space-x-1'>
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id!)}
                            className='p-1 hover:bg-gray-200 rounded transition-colors'
                            title='Marcar como leída'
                          >
                            <Check className='w-4 h-4 text-gray-500' />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Acciones */}
                    {notification.actions && notification.actions.length > 0 && (
                      <div className='mt-3 flex flex-wrap gap-2'>
                        {notification.actions.map((action) => (
                          <button
                            key={action.id}
                            onClick={() => handleActionClick(notification.id!, action.id)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                              action.style === 'primary'
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : action.style === 'danger'
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};

export default NotificationCenter;
