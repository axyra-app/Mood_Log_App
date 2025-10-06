import { Bell, Calendar, Check, Clock, X } from 'lucide-react';
import React, { useState } from 'react';
import { usePsychologistNotifications } from '../hooks/useAppointments';

const NotificationCard: React.FC<{ notification: any; onAccept: (id: string) => void; onReject: (id: string) => void; onMarkAsRead: (id: string) => void }> = ({ 
  notification, 
  onAccept, 
  onReject, 
  onMarkAsRead 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      await onAccept(notification.appointmentId);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      await onReject(notification.appointmentId);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkAsRead = () => {
    onMarkAsRead(notification.id);
  };

  return (
    <div className={`p-4 rounded-lg border ${
      notification.isRead 
        ? 'bg-gray-50 border-gray-200' 
        : 'bg-blue-50 border-blue-200'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            notification.isRead ? 'bg-gray-200' : 'bg-blue-500'
          }`}>
            <Bell className={`w-4 h-4 ${notification.isRead ? 'text-gray-600' : 'text-white'}`} />
          </div>
          <div>
            <h4 className={`font-medium ${notification.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
              Nueva Cita Solicitada
            </h4>
            <p className="text-sm text-gray-600">
              {notification.message}
            </p>
          </div>
        </div>
        
        {!notification.isRead && (
          <button
            onClick={handleMarkAsRead}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {notification.type === 'new_appointment' && (
        <div className="flex space-x-2">
          <button
            onClick={handleAccept}
            disabled={isProcessing}
            className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <Check className="w-4 h-4" />
            <span>{isProcessing ? 'Aceptando...' : 'Aceptar'}</span>
          </button>
          <button
            onClick={handleReject}
            disabled={isProcessing}
            className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>{isProcessing ? 'Rechazando...' : 'Rechazar'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

const PsychologistNotifications: React.FC = () => {
  const { 
    notifications, 
    loading, 
    unreadCount, 
    acceptAppointment, 
    rejectAppointment, 
    markAsRead 
  } = usePsychologistNotifications();

  const [isExpanded, setIsExpanded] = useState(false);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600">Cargando notificaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Notificaciones</h3>
            <p className="text-sm text-gray-600">
              {unreadCount > 0 ? `${unreadCount} nuevas` : 'Sin notificaciones nuevas'}
            </p>
          </div>
        </div>
        
        {notifications.length > 0 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            {isExpanded ? 'Ocultar' : 'Ver todas'}
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🔔</div>
          <p className="text-lg text-gray-600 mb-2">No hay notificaciones</p>
          <p className="text-sm text-gray-500">
            Las notificaciones de nuevas citas aparecerán aquí
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {isExpanded ? (
            notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onAccept={acceptAppointment}
                onReject={rejectAppointment}
                onMarkAsRead={markAsRead}
              />
            ))
          ) : (
            notifications.slice(0, 2).map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onAccept={acceptAppointment}
                onReject={rejectAppointment}
                onMarkAsRead={markAsRead}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default PsychologistNotifications;
