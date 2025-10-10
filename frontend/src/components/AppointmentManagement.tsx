import React, { useState } from 'react';
import { Calendar, Clock, User, Check, X, Eye, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAppointments } from '../hooks/useAppointments';
import { useAuth } from '../contexts/AuthContext';

interface AppointmentManagementProps {
  isDarkMode: boolean;
}

const AppointmentManagement: React.FC<AppointmentManagementProps> = ({ isDarkMode }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending' | 'upcoming' | 'all'>('pending');
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [notes, setNotes] = useState('');

  const {
    appointments,
    loading,
    updateAppointmentStatus,
    getPendingAppointments,
    getUpcomingAppointments,
  } = useAppointments(user?.uid || '');

  const pendingAppointments = getPendingAppointments();
  const upcomingAppointments = getUpcomingAppointments();

  const handleAcceptAppointment = async (appointmentId: string) => {
    try {
      await updateAppointmentStatus(appointmentId, 'accepted', notes);
      toast.success('Cita aceptada');
      setShowDetails(false);
      setNotes('');
    } catch (error) {
      console.error('Error accepting appointment:', error);
      toast.error('Error al aceptar la cita');
    }
  };

  const handleRejectAppointment = async (appointmentId: string) => {
    try {
      await updateAppointmentStatus(appointmentId, 'rejected', notes);
      toast.success('Cita rechazada');
      setShowDetails(false);
      setNotes('');
    } catch (error) {
      console.error('Error rejecting appointment:', error);
      toast.error('Error al rechazar la cita');
    }
  };

  const handleCreateAppointment = async () => {
    try {
      // Crear nueva cita
      toast.success('Funcionalidad de nueva cita próximamente disponible');
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error('Error al crear la cita');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'accepted':
        return 'Aceptada';
      case 'rejected':
        return 'Rechazada';
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return 'Desconocido';
    }
  };

  const getCurrentAppointments = () => {
    switch (activeTab) {
      case 'pending':
        return pendingAppointments;
      case 'upcoming':
        return upcomingAppointments;
      case 'all':
        return appointments;
      default:
        return [];
    }
  };

  return (
    <div className={`p-6 rounded-xl shadow-sm transition-colors duration-500 ${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } border`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <h2 className={`text-xl font-semibold transition-colors duration-500 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Gestión de Citas
          </h2>
        </div>
        
        <button
          onClick={handleCreateAppointment}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Cita</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        {[
          { id: 'pending', label: 'Pendientes', count: pendingAppointments.length },
          { id: 'upcoming', label: 'Próximas', count: upcomingAppointments.length },
          { id: 'all', label: 'Todas', count: appointments.length },
        ].map(({ id, label, count }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-300 ${
              activeTab === id
                ? isDarkMode
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-500 text-white'
                : isDarkMode
                ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span>{label}</span>
            <span className={`px-2 py-1 text-xs rounded-full ${
              activeTab === id
                ? 'bg-purple-200 text-purple-800'
                : isDarkMode
                ? 'bg-gray-600 text-gray-300'
                : 'bg-gray-200 text-gray-600'
            }`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className={`transition-colors duration-500 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Cargando citas...
            </p>
          </div>
        ) : getCurrentAppointments().length === 0 ? (
          <div className="text-center py-8">
            <Calendar className={`w-12 h-12 mx-auto mb-4 transition-colors duration-500 ${
              isDarkMode ? 'text-gray-600' : 'text-gray-400'
            }`} />
            <p className={`text-lg transition-colors duration-500 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              No hay citas {activeTab === 'pending' ? 'pendientes' : activeTab === 'upcoming' ? 'próximas' : ''}
            </p>
            <p className={`text-sm transition-colors duration-500 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>
              Las citas aparecerán aquí cuando los pacientes las soliciten
            </p>
          </div>
        ) : (
          getCurrentAppointments().map((appointment) => (
            <div
              key={appointment.id}
              className={`p-4 rounded-lg border transition-colors duration-500 ${
                isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  
                  <div>
                    <h3 className={`font-medium transition-colors duration-500 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {appointment.userName}
                    </h3>
                    <p className={`text-sm transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {appointment.userEmail}
                    </p>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center space-x-1">
                        <Calendar className={`w-4 h-4 transition-colors duration-500 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`} />
                        <span className={`text-sm transition-colors duration-500 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {formatDate(appointment.date)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className={`w-4 h-4 transition-colors duration-500 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`} />
                        <span className={`text-sm transition-colors duration-500 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {formatTime(appointment.time)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                    {getStatusText(appointment.status)}
                  </span>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setShowDetails(true);
                      }}
                      className={`p-2 rounded-lg transition-colors duration-300 ${
                        isDarkMode
                          ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    {appointment.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAcceptAppointment(appointment.id)}
                          className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-300"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRejectAppointment(appointment.id)}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Appointment Details Modal */}
      {showDetails && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-xl shadow-xl transition-colors duration-500 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } border max-w-md w-full mx-4`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Detalles de la Cita
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className={`p-2 rounded-lg transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Paciente
                </label>
                <p className={`transition-colors duration-500 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {selectedAppointment.userName}
                </p>
                <p className={`text-sm transition-colors duration-500 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {selectedAppointment.userEmail}
                </p>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Fecha y Hora
                </label>
                <p className={`transition-colors duration-500 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {formatDate(selectedAppointment.date)} a las {formatTime(selectedAppointment.time)}
                </p>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Notas
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg transition-colors duration-500 ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="Agregar notas sobre la cita..."
                />
              </div>
              
              {selectedAppointment.status === 'pending' && (
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleAcceptAppointment(selectedAppointment.id)}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-300 flex items-center justify-center space-x-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Aceptar</span>
                  </button>
                  <button
                    onClick={() => handleRejectAppointment(selectedAppointment.id)}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300 flex items-center justify-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Rechazar</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentManagement;
