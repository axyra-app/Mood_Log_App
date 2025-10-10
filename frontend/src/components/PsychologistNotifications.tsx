import React, { useState } from 'react';
import { Bell, Calendar, MessageCircle, AlertTriangle, X, Check, CheckCheck } from 'lucide-react';
import { usePsychologistNotifications } from '../hooks/useNotifications';

interface PsychologistNotificationsProps {
  isDarkMode: boolean;
}

const PsychologistNotifications: React.FC<PsychologistNotificationsProps> = ({ isDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    notifications,
    loading,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
  } = usePsychologistNotifications(''); // Se pasará el ID del psicólogo desde el dashboard

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'message':
        return <MessageCircle className="w-5 h-5 text-green-500" />;
      case 'crisis':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'appointment':
        return 'border-l-blue-500 bg-blue-50';
      case 'message':
        return 'border-l-green-500 bg-green-50';
      case 'crisis':
        return 'border-l-red-500 bg-red-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const unreadCount = getUnreadCount();

  return (
    <div className={`p-6 rounded-xl shadow-sm transition-colors duration-500 ${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } border`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <h3 className={`text-xl font-semibold transition-colors duration-500 ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            Notificaciones
          </h3>
          {unreadCount > 0 && (
            <span className="px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className={`px-3 py-1 text-xs rounded-lg transition-colors duration-300 ${
                isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Marcar todas como leídas
            </button>
          )}
          
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`p-2 rounded-lg transition-colors duration-300 ${
              isDarkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {isOpen ? <X className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto mb-2"></div>
              <p className={`text-sm transition-colors duration-500 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Cargando notificaciones...
              </p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className={`w-12 h-12 mx-auto mb-4 transition-colors duration-500 ${
                isDarkMode ? 'text-gray-600' : 'text-gray-400'
              }`} />
              <p className={`text-sm transition-colors duration-500 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                No hay notificaciones nuevas
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border-l-4 transition-colors duration-500 ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600'
                    : getNotificationColor(notification.type)
                } ${!notification.isRead ? 'opacity-100' : 'opacity-60'}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-sm font-medium transition-colors duration-500 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {notification.title}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs transition-colors duration-500 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {formatTime(notification.createdAt)}
                        </span>
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-1 rounded-full hover:bg-gray-200 transition-colors duration-300"
                          >
                            <Check className="w-3 h-3 text-gray-500" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <p className={`text-sm mt-1 transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {notification.message}
                    </p>
                    
                    {notification.type === 'crisis' && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Urgente
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {!isOpen && (
        <div className="text-center py-4">
          <p className={`text-sm transition-colors duration-500 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {unreadCount > 0 
              ? `Tienes ${unreadCount} notificación${unreadCount !== 1 ? 'es' : ''} nueva${unreadCount !== 1 ? 's' : ''}`
              : 'No hay notificaciones nuevas'
            }
          </p>
          <p className={`text-xs transition-colors duration-500 ${
            isDarkMode ? 'text-gray-500' : 'text-gray-500'
          }`}>
            Haz clic en la campana para ver todas las notificaciones
          </p>
        </div>
      )}
    </div>
  );
};

export default PsychologistNotifications;