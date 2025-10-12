import React, { useState } from 'react';
import { Bell, Calendar, X, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePsychologistAppointments } from '../hooks/usePsychologistAppointments';

interface PsychologistNotificationsProps {
  isDarkMode: boolean;
}

const PsychologistNotifications: React.FC<PsychologistNotificationsProps> = ({ isDarkMode }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  
  // Obtener citas pendientes como notificaciones
  const {
    getPendingAppointments,
    updateAppointmentStatus,
    loading,
  } = usePsychologistAppointments(user?.uid || '');

  const pendingAppointments = getPendingAppointments();

  // Verificar si el usuario necesita completar perfil
  const needsProfileCompletion = !user?.firstName || !user?.lastName;
  
  // Crear notificación de perfil incompleto si es necesario
  const profileNotification = needsProfileCompletion ? {
    id: 'profile-incomplete',
    type: 'profile' as const,
    title: 'Perfil Incompleto',
    message: 'Necesitas completar tu perfil para acceder a todas las funcionalidades',
    priority: 'high' as const,
    createdAt: new Date(),
  } : null;

  // Combinar notificaciones
  const allNotifications = [
    ...(profileNotification ? [profileNotification] : []),
    ...pendingAppointments.map(apt => ({
      id: apt.id,
      type: 'appointment' as const,
      title: 'Nueva Cita Pendiente',
      message: `Cita con ${apt.patientName} el ${apt.date.toLocaleDateString()}`,
      priority: 'medium' as const,
      createdAt: apt.createdAt,
      appointmentId: apt.id,
    }))
  ];

  const handleAcceptAppointment = async (appointmentId: string) => {
    try {
      await updateAppointmentStatus(appointmentId, 'accepted');
    } catch (error) {
      console.error('Error accepting appointment:', error);
    }
  };

  const handleRejectAppointment = async (appointmentId: string) => {
    try {
      await updateAppointmentStatus(appointmentId, 'rejected');
    } catch (error) {
      console.error('Error rejecting appointment:', error);
    }
  };

  const unreadCount = allNotifications.length;

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
              onClick={() => {
                // Aceptar todas las citas pendientes
                pendingAppointments.forEach(appointment => {
                  handleAcceptAppointment(appointment.id);
                });
              }}
              className={`px-3 py-1 text-xs rounded-lg transition-colors duration-300 ${
                isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Aceptar todas
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

      {/* Contenido principal */}
      {!isOpen ? (
        <div className="text-center py-4">
          {loading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
          ) : unreadCount === 0 ? (
            <>
              <p className={`text-sm transition-colors duration-500 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                No hay notificaciones pendientes
              </p>
              <p className={`text-xs transition-colors duration-500 ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>
                Haz clic en la campana para ver todas las notificaciones
              </p>
            </>
          ) : (
            <>
              {/* Mostrar vista previa de la notificación más importante */}
              {allNotifications.length > 0 && (
                <div className={`p-3 rounded-lg border-l-4 mb-3 ${
                  allNotifications[0].type === 'profile' 
                    ? (isDarkMode ? 'bg-gray-700 border-red-500' : 'bg-red-50 border-red-500')
                    : (isDarkMode ? 'bg-gray-700 border-blue-500' : 'bg-blue-50 border-blue-500')
                }`}>
                  <div className="flex items-center space-x-2">
                    {allNotifications[0].type === 'profile' ? (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    ) : (
                      <Calendar className="w-4 h-4 text-blue-500" />
                    )}
                    <div className="text-left flex-1">
                      <p className={`text-sm font-medium ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {allNotifications[0].title}
                      </p>
                      <p className={`text-xs ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {allNotifications[0].message}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <p className={`text-sm transition-colors duration-500 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {unreadCount} notificación{unreadCount !== 1 ? 'es' : ''} pendiente{unreadCount !== 1 ? 's' : ''}
              </p>
              <p className={`text-xs transition-colors duration-500 ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>
                Haz clic en la campana para gestionar
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto mb-2"></div>
              <p className={`text-sm transition-colors duration-500 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Cargando citas...
              </p>
            </div>
          ) : pendingAppointments.length === 0 ? (
            <div className="text-center py-8">
              <Bell className={`w-12 h-12 mx-auto mb-4 transition-colors duration-500 ${
                isDarkMode ? 'text-gray-600' : 'text-gray-400'
              }`} />
              <p className={`text-sm transition-colors duration-500 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                No hay citas pendientes
              </p>
              <p className={`text-xs transition-colors duration-500 ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>
                Las citas aparecerán aquí cuando los pacientes las soliciten
              </p>
            </div>
          ) : (
            allNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border-l-4 transition-colors duration-500 ${
                  notification.type === 'profile' 
                    ? (isDarkMode ? 'bg-gray-700 border-red-500' : 'bg-red-50 border-red-500')
                    : (isDarkMode ? 'bg-gray-700 border-blue-500' : 'bg-blue-50 border-blue-500')
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {notification.type === 'profile' ? (
                      <AlertCircle className="w-5 h-5 text-red-500 mt-1" />
                    ) : (
                      <Calendar className="w-5 h-5 text-blue-500 mt-1" />
                    )}
                    <div className="flex-1">
                      <h4 className={`font-medium transition-colors duration-500 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {notification.title}
                      </h4>
                      <p className={`text-sm transition-colors duration-500 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {notification.message}
                      </p>
                      {notification.type === 'appointment' && (
                        <p className={`text-xs transition-colors duration-500 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {notification.createdAt.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {notification.type === 'appointment' && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleAcceptAppointment(notification.appointmentId!)}
                        className="p-1 text-green-600 hover:bg-green-100 rounded"
                        title="Aceptar cita"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRejectAppointment(notification.appointmentId!)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                        title="Rechazar cita"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  
                  {notification.type === 'profile' && (
                    <button
                      onClick={() => {
                        // Navegar a completar perfil
                        window.location.href = '/complete-profile';
                      }}
                      className="px-3 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Completar
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default PsychologistNotifications;