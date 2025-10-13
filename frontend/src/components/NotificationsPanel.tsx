import { Bell, Calendar, Check, FileText, MessageCircle, X, AlertCircle } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import { toast } from 'react-hot-toast';

interface NotificationsPanelProps {
  isDarkMode: boolean;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ isDarkMode }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications(
    user?.uid || '',
    user?.role || 'user'
  );

  const totalUnreadCount = unreadCount;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'profile_incomplete':
        return <AlertCircle className='w-4 h-4' />;
      case 'chat_message':
        return <MessageCircle className='w-4 h-4' />;
      case 'appointment_request':
      case 'appointment_accepted':
      case 'appointment_rejected':
        return <Calendar className='w-4 h-4' />;
      case 'medical_report':
        return <FileText className='w-4 h-4' />;
      default:
        return <Bell className='w-4 h-4' />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'profile_incomplete':
        return isDarkMode ? 'text-red-400' : 'text-red-600';
      case 'chat_message':
        return isDarkMode ? 'text-blue-400' : 'text-blue-600';
      case 'appointment_request':
        return isDarkMode ? 'text-yellow-400' : 'text-yellow-600';
      case 'appointment_accepted':
        return isDarkMode ? 'text-green-400' : 'text-green-600';
      case 'appointment_rejected':
        return isDarkMode ? 'text-red-400' : 'text-red-600';
      case 'medical_report':
        return isDarkMode ? 'text-purple-400' : 'text-purple-600';
      default:
        return isDarkMode ? 'text-gray-400' : 'text-gray-600';
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
    return `Hace ${diffInDays}d`;
  };

  const handleDeleteNotification = async (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevenir que se active el click en la notificación
    try {
      await deleteNotification(notificationId);
      toast.success('Notificación eliminada');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Error al eliminar la notificación');
    }
  };

  const handleNotificationClick = (notification: any) => {
    // Manejar notificación de perfil incompleto
    if (notification.type === 'profile_incomplete') {
      setIsOpen(false);
      // Redirigir a edit-profile en lugar de complete-profile
      // porque el usuario ya tiene un perfil básico pero necesita completar información
      navigate('/edit-profile');
      return;
    }
    
    // Marcar como leída
    markAsRead(notification.id);
    
    // Cerrar el panel
    setIsOpen(false);
    
    // Navegar según el tipo de notificación
    switch (notification.type) {
      case 'chat_message':
        if (user?.role === 'psychologist') {
          navigate('/psychologist-chat');
        } else {
          navigate('/user-chat');
        }
        break;
      case 'appointment_request':
      case 'appointment_accepted':
      case 'appointment_rejected':
        if (user?.role === 'psychologist') {
          navigate('/dashboard-psychologist');
        } else {
          navigate('/dashboard');
        }
        break;
      case 'medical_report':
        if (user?.role === 'psychologist') {
          navigate('/dashboard-psychologist');
        } else {
          navigate('/dashboard');
        }
        break;
      default:
        // Navegar al dashboard por defecto
        if (user?.role === 'psychologist') {
          navigate('/dashboard-psychologist');
        } else {
          navigate('/dashboard');
        }
    }
  };

  return (
    <div className='relative'>
      {/* Botón de notificaciones */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-lg transition-colors duration-300 ${
          isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
        }`}
      >
        <Bell className='w-5 h-5' />
        {totalUnreadCount > 0 && (
          <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
            {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
          </span>
        )}
      </button>

      {/* Panel de notificaciones */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div className='fixed inset-0 z-40' onClick={() => setIsOpen(false)} />

          {/* Panel */}
          <div
            className={`absolute right-0 top-12 w-80 max-h-96 rounded-xl shadow-2xl border z-50 ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            {/* Header */}
            <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className='flex items-center justify-between'>
                <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Notificaciones</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className={`text-sm px-2 py-1 rounded transition-colors duration-300 ${
                      isDarkMode ? 'text-blue-400 hover:bg-gray-700' : 'text-blue-600 hover:bg-gray-100'
                    }`}
                  >
                    Marcar todas como leídas
                  </button>
                )}
              </div>
            </div>

            {/* Lista de notificaciones */}
            <div className='max-h-64 overflow-y-auto'>
              {loading ? (
                <div className='p-4 text-center'>
                  <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto'></div>
                  <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Cargando notificaciones...
                  </p>
                </div>
              ) : notifications.length === 0 ? (
                <div className='p-6 text-center'>
                  <Bell className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No hay notificaciones</p>
                </div>
              ) : (
                <div className='divide-y divide-gray-200 dark:divide-gray-700'>
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer ${
                        !notification.isRead ? (isDarkMode ? 'bg-gray-700/50' : 'bg-blue-50') : ''
                      }`}
                    >
                      <div className='flex items-start space-x-3'>
                        <div className={`flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>

                        <div className='flex-1 min-w-0'>
                          <div className='flex items-center justify-between'>
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {notification.title}
                            </p>
                            <div className='flex items-center space-x-2'>
                              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {formatTimeAgo(notification.createdAt)}
                              </span>
                              {!notification.isRead && <div className='w-2 h-2 bg-blue-500 rounded-full'></div>}
                            </div>
                          </div>

                          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {notification.message}
                          </p>
                        </div>

                        {!notification.isRead && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className={`p-1 rounded transition-colors duration-300 ${
                              isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                            }`}
                            title='Marcar como leída'
                          >
                            <Check className='w-3 h-3 text-gray-400' />
                          </button>
                        )}
                        
                        <button
                          onClick={(e) => handleDeleteNotification(notification.id, e)}
                          className={`p-1 rounded transition-colors duration-300 ${
                            isDarkMode ? 'hover:bg-red-600/20' : 'hover:bg-red-100'
                          }`}
                          title='Eliminar notificación'
                        >
                          <X className='w-3 h-3 text-red-500' />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationsPanel;
