import { Calendar, Plus, Eye, Clock, User, CheckCircle, Trash2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUserAppointments } from '../hooks/useUserAppointments';
import CreateAppointmentModal from './CreateAppointmentModal';
import PsychologistCreateAppointmentModal from './PsychologistCreateAppointmentModal';

interface Appointment {
  id: string;
  psychologistId: string;
  psychologistName: string;
  appointmentDate: Date;
  appointmentTime?: string;
  duration: number;
  type: string;
  reason: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled' | 'expired';
  createdAt: Date;
  updatedAt: Date;
}

interface AppointmentManagementProps {
  isDarkMode?: boolean;
}

const AppointmentManagement: React.FC<AppointmentManagementProps> = ({ isDarkMode = false }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { appointments, loading, updateAppointment, deleteAppointment } = useUserAppointments(user?.uid || '');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const handleToggleHistory = () => {
      // Esta función ya no es necesaria pero la mantenemos por compatibilidad
    };

    window.addEventListener('toggleAppointmentHistory', handleToggleHistory);
    
    return () => {
      window.removeEventListener('toggleAppointmentHistory', handleToggleHistory);
    };
  }, []);

  // Separar citas activas e históricas
  const now = new Date();
  const activeAppointments = appointments.filter(apt => 
    new Date(apt.appointmentDate) >= now && apt.status !== 'completed' && apt.status !== 'cancelled'
  );
  const historicalAppointments = appointments.filter(apt => 
    new Date(apt.appointmentDate) < now || apt.status === 'completed' || apt.status === 'cancelled'
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'expired':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'accepted': return 'Aceptada';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      case 'expired': return 'Expirada';
      default: return 'Desconocido';
    }
  };

  const formatDate = (date: Date) => {
    try {
      // Si es un string, convertir a Date
      if (typeof date === 'string') {
        date = new Date(date);
      }
      
      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        return 'Fecha no válida';
      }
      
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Fecha no válida';
    }
  };

  const formatTime = (time: string) => {
    return time || 'Hora no especificada';
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      await updateAppointment(appointmentId, { status: newStatus as any });
    } catch (error) {
      console.error('Error updating appointment status:', error);
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta cita?')) {
      try {
        await deleteAppointment(appointmentId);
      } catch (error) {
        console.error('Error deleting appointment:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Cargando citas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dos contenedores lado a lado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Citas Activas */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border p-6`}>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Citas Activas</h3>
          {activeAppointments.length === 0 ? (
            <div className={`text-center py-12 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
              <div className="text-6xl mb-4">📅</div>
              <h4 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>No tienes citas activas</h4>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>Crea tu primera cita con un psicólogo</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:scale-105 transition-transform duration-200"
              >
                Crear Primera Cita
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {activeAppointments.map((appointment) => (
                <div key={appointment.id} className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} rounded-lg border p-4`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className={`font-semibold text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                            {formatDate(appointment.appointmentDate)}
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            {getStatusText(appointment.status)}
                          </span>
                        </div>
                        
                        <div className={`space-y-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>{formatTime(appointment.appointmentTime || '')} - {appointment.duration} min</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <span>{appointment.psychologistName}</span>
                          </div>
                          <div>
                            <span className="font-medium">Tipo:</span> {appointment.type}
                          </div>
                          <div>
                            <span className="font-medium">Motivo:</span> {appointment.reason}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      {appointment.status === 'accepted' && (
                        <button
                          onClick={() => handleStatusChange(appointment.id, 'completed')}
                          className={`p-2 text-green-500 ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-green-50'} rounded-lg transition-colors`}
                          title="Marcar como completada"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAppointment(appointment.id)}
                        className={`p-2 text-red-500 ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-red-50'} rounded-lg transition-colors`}
                        title="Eliminar cita"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Historial de Citas */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border p-6`}>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Historial de Citas</h3>
          {historicalAppointments.length === 0 ? (
            <div className={`text-center py-12 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
              <div className="text-6xl mb-4">📚</div>
              <h4 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>No hay historial de citas</h4>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Las citas completadas aparecerán aquí</p>
            </div>
          ) : (
            <div className="space-y-4">
              {historicalAppointments.map((appointment) => (
                <div key={appointment.id} className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} rounded-lg border p-4`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gray-400 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className={`font-semibold text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                            {formatDate(appointment.appointmentDate)}
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            {getStatusText(appointment.status)}
                          </span>
                        </div>
                        
                        <div className={`space-y-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>{formatTime(appointment.appointmentTime || '')} - {appointment.duration} min</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <span>{appointment.psychologistName}</span>
                          </div>
                          <div>
                            <span className="font-medium">Tipo:</span> {appointment.type}
                          </div>
                          <div>
                            <span className="font-medium">Motivo:</span> {appointment.reason}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Crear Cita */}
      {user?.role === 'psychologist' ? (
        <PsychologistCreateAppointmentModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onAppointmentCreated={() => {
            // Cita creada exitosamente
          }}
        />
      ) : (
        <CreateAppointmentModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onAppointmentCreated={() => {
            // Cita creada exitosamente
          }}
        />
      )}
    </div>
  );
};

export default AppointmentManagement;
