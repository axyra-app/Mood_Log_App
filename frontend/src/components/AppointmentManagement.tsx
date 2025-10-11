import { Calendar, Check, Clock, Eye, Plus, X } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { usePsychologistAppointments } from '../hooks/usePsychologistAppointments';

interface AppointmentManagementProps {
  isDarkMode: boolean;
}

const AppointmentManagement: React.FC<AppointmentManagementProps> = ({ isDarkMode }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending' | 'upcoming' | 'all'>('pending');
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    patientName: '',
    date: '',
    time: '',
    reason: '',
    notes: '',
  });

  // Hook para obtener citas reales del psicólogo
  const {
    appointments,
    loading: appointmentsLoading,
    updateAppointmentStatus,
    getPendingAppointments,
    getUpcomingAppointments,
    getStatistics,
  } = usePsychologistAppointments(user?.uid || '');

  const stats = getStatistics();
  const pendingAppointments = getPendingAppointments();
  const upcomingAppointments = getUpcomingAppointments();

  const handleNewAppointment = () => {
    setShowNewAppointment(true);
  };

  const handleCreateAppointment = async () => {
    try {
      setLoading(true);
      // Simular creación de cita
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Cita creada exitosamente');
      setShowNewAppointment(false);
      setNewAppointment({
        patientName: '',
        date: '',
        time: '',
        reason: '',
        notes: '',
      });
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error('Error al crear la cita');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptAppointment = async (appointmentId: string) => {
    try {
      setLoading(true);
      await updateAppointmentStatus(appointmentId, 'accepted', notes);
      toast.success('Cita aceptada');
      setShowDetails(false);
      setNotes('');
    } catch (error) {
      console.error('Error accepting appointment:', error);
      toast.error('Error al aceptar la cita');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectAppointment = async (appointmentId: string) => {
    try {
      setLoading(true);
      await updateAppointmentStatus(appointmentId, 'rejected', notes);
      toast.success('Cita rechazada');
      setShowDetails(false);
      setNotes('');
    } catch (error) {
      console.error('Error rejecting appointment:', error);
      toast.error('Error al rechazar la cita');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (appointment: any) => {
    setSelectedAppointment(appointment);
    setShowDetails(true);
  };

  const getAppointmentsByTab = () => {
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

  const formatDate = (date: any) => {
    if (!date) return 'Fecha no disponible';
    try {
      // Si es un objeto Date, usarlo directamente
      if (date instanceof Date) {
        return date.toLocaleDateString('es-CO', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }
      // Si es un timestamp de Firebase, convertirlo
      if (date && typeof date.toDate === 'function') {
        return date.toDate().toLocaleDateString('es-CO', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }
      // Si es una string o número, crear Date
      return new Date(date).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  const formatTime = (date: any) => {
    if (!date) return 'Hora no disponible';
    try {
      // Si es un objeto Date, usarlo directamente
      if (date instanceof Date) {
        return date.toLocaleTimeString('es-CO', {
          hour: '2-digit',
          minute: '2-digit',
        });
      }
      // Si es un timestamp de Firebase, convertirlo
      if (date && typeof date.toDate === 'function') {
        return date.toDate().toLocaleTimeString('es-CO', {
          hour: '2-digit',
          minute: '2-digit',
        });
      }
      // Si es una string o número, crear Date
      return new Date(date).toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Hora inválida';
    }
  };

  return (
    <div
      className={`p-6 rounded-xl shadow-sm transition-colors duration-500 ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } border mb-8`}
    >
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center space-x-3'>
          <div
            className={`p-3 rounded-full ${
              isDarkMode ? 'bg-green-600/20 text-green-400' : 'bg-green-100 text-green-600'
            }`}
          >
            <Calendar className='w-6 h-6' />
          </div>
          <div>
            <h2
              className={`text-xl font-semibold transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Gestión de Citas
            </h2>
            <p className={`text-sm transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Administra las citas de tus pacientes
            </p>
          </div>
        </div>

        <button
          onClick={handleNewAppointment}
          className={`px-4 py-2 rounded-lg font-medium transition-colors duration-300 ${
            isDarkMode ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-purple-500 text-white hover:bg-purple-600'
          } flex items-center space-x-2`}
        >
          <Plus className='w-4 h-4' />
          <span>Nueva Cita</span>
        </button>
      </div>

      {/* Tabs */}
      <div className='flex space-x-1 mb-6'>
        {[
          { key: 'pending', label: 'Pendientes', count: pendingAppointments.length },
          { key: 'upcoming', label: 'Próximas', count: upcomingAppointments.length },
          { key: 'all', label: 'Todas', count: appointments.length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-300 ${
              activeTab === tab.key
                ? isDarkMode
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-500 text-white'
                : isDarkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label} {tab.count}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      <div className='space-y-4'>
        {loading ? (
          <div className='text-center py-8'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4'></div>
            <p className={`transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Cargando citas...
            </p>
          </div>
        ) : getAppointmentsByTab().length === 0 ? (
          <div className='text-center py-12'>
            <div
              className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <Calendar className='w-8 h-8' />
            </div>
            <h3
              className={`text-lg font-medium mb-2 transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              {activeTab === 'pending' && 'No hay citas pendientes'}
              {activeTab === 'upcoming' && 'No hay citas próximas'}
              {activeTab === 'all' && 'No hay citas registradas'}
            </h3>
            <p className={`text-sm transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {activeTab === 'pending' && 'Las citas aparecerán aquí cuando los pacientes las soliciten'}
              {activeTab === 'upcoming' && 'Las citas programadas aparecerán aquí'}
              {activeTab === 'all' && 'Todas las citas aparecerán aquí'}
            </p>
          </div>
        ) : (
          getAppointmentsByTab().map((appointment) => (
            <div
              key={appointment.id}
              className={`p-4 rounded-lg border transition-colors duration-500 ${
                isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-4'>
                  <div
                    className={`p-2 rounded-full ${
                      appointment.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-600'
                        : appointment.status === 'accepted'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                    }`}
                  >
                    <Clock className='w-4 h-4' />
                  </div>
                  <div>
                    <h3
                      className={`font-medium transition-colors duration-500 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {appointment.userName || 'Paciente'}
                    </h3>
                    <p
                      className={`text-sm transition-colors duration-500 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      {formatDate(appointment.appointmentDate)} a las {formatTime(appointment.appointmentDate)}
                    </p>
                  </div>
                </div>

                <div className='flex items-center space-x-2'>
                  <button
                    onClick={() => handleViewDetails(appointment)}
                    className={`p-2 rounded-lg transition-colors duration-300 ${
                      isDarkMode
                        ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                    title='Ver detalles'
                  >
                    <Eye className='w-4 h-4' />
                  </button>

                  {appointment.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleAcceptAppointment(appointment.id)}
                        disabled={loading}
                        className='p-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors duration-300 disabled:opacity-50'
                        title='Aceptar cita'
                      >
                        <Check className='w-4 h-4' />
                      </button>
                      <button
                        onClick={() => handleRejectAppointment(appointment.id)}
                        disabled={loading}
                        className='p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors duration-300 disabled:opacity-50'
                        title='Rechazar cita'
                      >
                        <X className='w-4 h-4' />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Appointment Details Modal */}
      {showDetails && selectedAppointment && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div
            className={`w-full max-w-md rounded-xl shadow-2xl transition-colors duration-500 ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } border`}
          >
            <div className='p-6'>
              <div className='flex items-center justify-between mb-4'>
                <h3
                  className={`text-lg font-semibold transition-colors duration-500 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
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
                  <X className='w-4 h-4' />
                </button>
              </div>

              <div className='space-y-4'>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Paciente
                  </label>
                  <p className={`transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedAppointment.userName || 'Paciente'}
                  </p>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Fecha y Hora
                  </label>
                  <p className={`transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {formatDate(selectedAppointment.appointmentDate)} a las{' '}
                    {formatTime(selectedAppointment.appointmentDate)}
                  </p>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Motivo
                  </label>
                  <p className={`transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedAppointment.reason || 'Consulta general'}
                  </p>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Notas
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500'
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:ring-purple-500'
                    }`}
                    rows={3}
                    placeholder='Agregar notas sobre la cita...'
                  />
                </div>
              </div>

              <div className='flex justify-end space-x-3 mt-6'>
                <button
                  onClick={() => setShowDetails(false)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-300 ${
                    isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Cerrar
                </button>
                {selectedAppointment.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleRejectAppointment(selectedAppointment.id)}
                      disabled={loading}
                      className='px-4 py-2 rounded-lg font-medium bg-red-500 text-white hover:bg-red-600 transition-colors duration-300 disabled:opacity-50'
                    >
                      Rechazar
                    </button>
                    <button
                      onClick={() => handleAcceptAppointment(selectedAppointment.id)}
                      disabled={loading}
                      className='px-4 py-2 rounded-lg font-medium bg-green-500 text-white hover:bg-green-600 transition-colors duration-300 disabled:opacity-50'
                    >
                      Aceptar
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Appointment Modal */}
      {showNewAppointment && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div
            className={`w-full max-w-md rounded-xl shadow-2xl transition-colors duration-500 ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } border`}
          >
            <div className='p-6'>
              <div className='flex items-center justify-between mb-4'>
                <h3
                  className={`text-lg font-semibold transition-colors duration-500 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Nueva Cita
                </h3>
                <button
                  onClick={() => setShowNewAppointment(false)}
                  className={`p-2 rounded-lg transition-colors duration-300 ${
                    isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <X className='w-4 h-4' />
                </button>
              </div>

              <div className='space-y-4'>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Nombre del Paciente
                  </label>
                  <input
                    type='text'
                    value={newAppointment.patientName}
                    onChange={(e) => setNewAppointment((prev) => ({ ...prev, patientName: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500'
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:ring-purple-500'
                    }`}
                    placeholder='Nombre del paciente'
                  />
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                    >
                      Fecha
                    </label>
                    <input
                      type='date'
                      value={newAppointment.date}
                      onChange={(e) => setNewAppointment((prev) => ({ ...prev, date: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500'
                          : 'bg-gray-50 border-gray-300 text-gray-900 focus:ring-purple-500'
                      }`}
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                    >
                      Hora
                    </label>
                    <input
                      type='time'
                      value={newAppointment.time}
                      onChange={(e) => setNewAppointment((prev) => ({ ...prev, time: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500'
                          : 'bg-gray-50 border-gray-300 text-gray-900 focus:ring-purple-500'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Motivo de la Cita
                  </label>
                  <textarea
                    value={newAppointment.reason}
                    onChange={(e) => setNewAppointment((prev) => ({ ...prev, reason: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500'
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:ring-purple-500'
                    }`}
                    rows={3}
                    placeholder='Describe el motivo de la cita...'
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Notas Adicionales
                  </label>
                  <textarea
                    value={newAppointment.notes}
                    onChange={(e) => setNewAppointment((prev) => ({ ...prev, notes: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500'
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:ring-purple-500'
                    }`}
                    rows={3}
                    placeholder='Notas adicionales...'
                  />
                </div>
              </div>

              <div className='flex justify-end space-x-3 mt-6'>
                <button
                  onClick={() => setShowNewAppointment(false)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-300 ${
                    isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateAppointment}
                  disabled={loading || !newAppointment.patientName || !newAppointment.date || !newAppointment.time}
                  className='px-4 py-2 rounded-lg font-medium bg-green-500 text-white hover:bg-green-600 transition-colors duration-300 disabled:opacity-50'
                >
                  {loading ? 'Creando...' : 'Crear Cita'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentManagement;
