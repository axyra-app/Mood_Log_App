import { Calendar, Clock, Edit, MapPin, Phone, Plus, Video, XCircle } from 'lucide-react';
import React, { useState } from 'react';
import { cancelAppointment, createAppointment, updateAppointment } from '../../services/patientService';
import { Appointment, Patient } from '../../types';

interface AppointmentsCalendarProps {
  appointments: Appointment[];
  patients: Patient[];
  onAppointmentUpdate: () => void;
}

const AppointmentsCalendar: React.FC<AppointmentsCalendarProps> = ({ appointments, patients, onAppointmentUpdate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreateAppointment = async (appointmentData: Partial<Appointment>) => {
    try {
      setLoading(true);
      await createAppointment({
        patientId: appointmentData.patientId || '',
        psychologistId: appointmentData.psychologistId || '',
        title: appointmentData.title || '',
        description: appointmentData.description || '',
        startTime: appointmentData.startTime || new Date(),
        endTime: appointmentData.endTime || new Date(),
        status: 'scheduled',
        type: appointmentData.type || 'consultation',
        location: appointmentData.location || 'office',
        meetingLink: appointmentData.meetingLink,
        notes: appointmentData.notes || '',
        reminderSent: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      onAppointmentUpdate();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creando cita:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAppointment = async (appointmentId: string, updates: Partial<Appointment>) => {
    try {
      setLoading(true);
      await updateAppointment(appointmentId, updates);
      onAppointmentUpdate();
      setShowEditModal(false);
    } catch (error) {
      console.error('Error actualizando cita:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: string, reason?: string) => {
    if (window.confirm('¿Estás seguro de que quieres cancelar esta cita?')) {
      try {
        setLoading(true);
        await cancelAppointment(appointmentId, reason);
        onAppointmentUpdate();
      } catch (error) {
        console.error('Error cancelando cita:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.startTime);
      return appointmentDate.toDateString() === date.toDateString();
    });
  };

  const getAppointmentsForWeek = (date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.startTime);
      return appointmentDate >= startOfWeek && appointmentDate <= endOfWeek;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no-show':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLocationIcon = (location: string) => {
    switch (location) {
      case 'office':
        return <MapPin className='h-4 w-4' />;
      case 'online':
        return <Video className='h-4 w-4' />;
      case 'phone':
        return <Phone className='h-4 w-4' />;
      default:
        return <Calendar className='h-4 w-4' />;
    }
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find((p) => p.id === patientId);
    return patient ? `Paciente ${patient.id.slice(0, 8)}` : 'Paciente desconocido';
  };

  const renderDayView = () => {
    const dayAppointments = getAppointmentsForDate(currentDate);

    return (
      <div className='space-y-4'>
        <div className='text-center'>
          <h3 className='text-lg font-medium text-gray-900'>
            {currentDate.toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </h3>
        </div>

        <div className='space-y-2'>
          {dayAppointments.length === 0 ? (
            <div className='text-center py-8 text-gray-500'>No hay citas programadas para este día</div>
          ) : (
            dayAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onEdit={() => {
                  setSelectedAppointment(appointment);
                  setShowEditModal(true);
                }}
                onView={() => {
                  setSelectedAppointment(appointment);
                  setShowDetailsModal(true);
                }}
                onCancel={() => handleCancelAppointment(appointment.id)}
                getPatientName={getPatientName}
                getStatusColor={getStatusColor}
                getLocationIcon={getLocationIcon}
              />
            ))
          )}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekAppointments = getAppointmentsForWeek(currentDate);
    const days = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() - currentDate.getDay() + i);
      days.push(date);
    }

    return (
      <div className='space-y-4'>
        <div className='text-center'>
          <h3 className='text-lg font-medium text-gray-900'>
            Semana del {days[0].toLocaleDateString()} al {days[6].toLocaleDateString()}
          </h3>
        </div>

        <div className='grid grid-cols-7 gap-2'>
          {days.map((day, index) => {
            const dayAppointments = getAppointmentsForDate(day);
            return (
              <div key={index} className='border rounded-lg p-2'>
                <div className='text-center mb-2'>
                  <div className='text-sm font-medium text-gray-900'>
                    {day.toLocaleDateString('es-ES', { weekday: 'short' })}
                  </div>
                  <div className='text-lg font-bold text-gray-900'>{day.getDate()}</div>
                </div>
                <div className='space-y-1'>
                  {dayAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className='text-xs p-1 bg-blue-100 rounded cursor-pointer hover:bg-blue-200'
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setShowDetailsModal(true);
                      }}
                    >
                      <div className='font-medium truncate'>{appointment.title}</div>
                      <div className='text-gray-600'>
                        {new Date(appointment.startTime).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const monthAppointments = appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.startTime);
      return (
        appointmentDate.getMonth() === currentDate.getMonth() &&
        appointmentDate.getFullYear() === currentDate.getFullYear()
      );
    });

    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }

    return (
      <div className='space-y-4'>
        <div className='text-center'>
          <h3 className='text-lg font-medium text-gray-900'>
            {currentDate.toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
            })}
          </h3>
        </div>

        <div className='grid grid-cols-7 gap-1'>
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
            <div key={day} className='text-center py-2 text-sm font-medium text-gray-500'>
              {day}
            </div>
          ))}
          {days.map((day, index) => {
            const dayAppointments = getAppointmentsForDate(day);
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            const isToday = day.toDateString() === new Date().toDateString();

            return (
              <div
                key={index}
                className={`min-h-[100px] border rounded p-1 ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'} ${
                  isToday ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className={`text-sm font-medium ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
                  {day.getDate()}
                </div>
                <div className='space-y-1 mt-1'>
                  {dayAppointments.slice(0, 3).map((appointment) => (
                    <div
                      key={appointment.id}
                      className='text-xs p-1 bg-blue-100 rounded cursor-pointer hover:bg-blue-200 truncate'
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setShowDetailsModal(true);
                      }}
                    >
                      {appointment.title}
                    </div>
                  ))}
                  {dayAppointments.length > 3 && (
                    <div className='text-xs text-gray-500'>+{dayAppointments.length - 3} más</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <h2 className='text-2xl font-bold text-gray-900'>Calendario de Citas</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
        >
          <Plus className='h-4 w-4 mr-2' />
          Nueva Cita
        </button>
      </div>

      {/* Controls */}
      <div className='bg-white p-4 rounded-lg shadow'>
        <div className='flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0'>
          <div className='flex items-center space-x-4'>
            <div className='flex rounded-md shadow-sm'>
              <button
                onClick={() => setViewMode('day')}
                className={`px-3 py-2 text-sm font-medium rounded-l-md border ${
                  viewMode === 'day'
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Día
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-2 text-sm font-medium border-t border-b ${
                  viewMode === 'week'
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Semana
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-2 text-sm font-medium rounded-r-md border ${
                  viewMode === 'month'
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Mes
              </button>
            </div>
          </div>

          <div className='flex items-center space-x-4'>
            <button
              onClick={() => {
                const newDate = new Date(currentDate);
                if (viewMode === 'day') {
                  newDate.setDate(currentDate.getDate() - 1);
                } else if (viewMode === 'week') {
                  newDate.setDate(currentDate.getDate() - 7);
                } else {
                  newDate.setMonth(currentDate.getMonth() - 1);
                }
                setCurrentDate(newDate);
              }}
              className='p-2 text-gray-400 hover:text-gray-600'
            >
              ←
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className='px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50'
            >
              Hoy
            </button>
            <button
              onClick={() => {
                const newDate = new Date(currentDate);
                if (viewMode === 'day') {
                  newDate.setDate(currentDate.getDate() + 1);
                } else if (viewMode === 'week') {
                  newDate.setDate(currentDate.getDate() + 7);
                } else {
                  newDate.setMonth(currentDate.getMonth() + 1);
                }
                setCurrentDate(newDate);
              }}
              className='p-2 text-gray-400 hover:text-gray-600'
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      <div className='bg-white rounded-lg shadow'>
        <div className='p-6'>
          {viewMode === 'day' && renderDayView()}
          {viewMode === 'week' && renderWeekView()}
          {viewMode === 'month' && renderMonthView()}
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateAppointmentModal
          patients={patients}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateAppointment}
          loading={loading}
        />
      )}

      {showEditModal && selectedAppointment && (
        <EditAppointmentModal
          appointment={selectedAppointment}
          patients={patients}
          onClose={() => setShowEditModal(false)}
          onSubmit={(updates) => handleUpdateAppointment(selectedAppointment.id, updates)}
          loading={loading}
        />
      )}

      {showDetailsModal && selectedAppointment && (
        <AppointmentDetailsModal
          appointment={selectedAppointment}
          patientName={getPatientName(selectedAppointment.patientId)}
          onClose={() => setShowDetailsModal(false)}
          onCancel={() => handleCancelAppointment(selectedAppointment.id)}
        />
      )}
    </div>
  );
};

// Appointment Card Component
const AppointmentCard: React.FC<{
  appointment: Appointment;
  onEdit: () => void;
  onView: () => void;
  onCancel: () => void;
  getPatientName: (patientId: string) => string;
  getStatusColor: (status: string) => string;
  getLocationIcon: (location: string) => React.ReactNode;
}> = ({ appointment, onEdit, onView, onCancel, getPatientName, getStatusColor, getLocationIcon }) => {
  return (
    <div className='border rounded-lg p-4 hover:shadow-md transition-shadow'>
      <div className='flex items-center justify-between'>
        <div className='flex-1'>
          <div className='flex items-center space-x-3'>
            <div className='flex-shrink-0'>{getLocationIcon(appointment.location)}</div>
            <div>
              <h3 className='text-lg font-medium text-gray-900'>{appointment.title}</h3>
              <p className='text-sm text-gray-600'>{getPatientName(appointment.patientId)}</p>
              <div className='flex items-center space-x-4 mt-1'>
                <div className='flex items-center space-x-1 text-sm text-gray-500'>
                  <Clock className='h-4 w-4' />
                  <span>
                    {new Date(appointment.startTime).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                    appointment.status
                  )}`}
                >
                  {appointment.status}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className='flex items-center space-x-2'>
          <button onClick={onView} className='text-gray-400 hover:text-gray-600' title='Ver detalles'>
            <Calendar className='h-4 w-4' />
          </button>
          <button onClick={onEdit} className='text-gray-400 hover:text-gray-600' title='Editar'>
            <Edit className='h-4 w-4' />
          </button>
          <button onClick={onCancel} className='text-gray-400 hover:text-red-600' title='Cancelar'>
            <XCircle className='h-4 w-4' />
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal Components
const CreateAppointmentModal: React.FC<{
  patients: Patient[];
  onClose: () => void;
  onSubmit: (data: Partial<Appointment>) => void;
  loading: boolean;
}> = ({ patients, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    patientId: '',
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    type: 'consultation' as const,
    location: 'office' as const,
    meetingLink: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      startTime: new Date(formData.startTime),
      endTime: new Date(formData.endTime),
      psychologistId: 'current-psychologist-id', // Esto debería venir del contexto
    });
  };

  return (
    <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50'>
      <div className='relative top-10 mx-auto p-5 border w-4/5 max-w-2xl shadow-lg rounded-md bg-white'>
        <div className='mt-3'>
          <h3 className='text-lg font-medium text-gray-900 mb-4'>Nueva Cita</h3>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700'>Paciente</label>
              <select
                value={formData.patientId}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500'
                required
              >
                <option value=''>Selecciona un paciente</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    Paciente {patient.id.slice(0, 8)} - {patient.status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700'>Título</label>
              <input
                type='text'
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500'
                required
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700'>Fecha y Hora de Inicio</label>
                <input
                  type='datetime-local'
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700'>Fecha y Hora de Fin</label>
                <input
                  type='datetime-local'
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500'
                  required
                />
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700'>Tipo de Cita</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500'
                >
                  <option value='consultation'>Consulta</option>
                  <option value='follow-up'>Seguimiento</option>
                  <option value='emergency'>Emergencia</option>
                  <option value='assessment'>Evaluación</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700'>Ubicación</label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value as any })}
                  className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500'
                >
                  <option value='office'>Consultorio</option>
                  <option value='online'>Online</option>
                  <option value='phone'>Teléfono</option>
                </select>
              </div>
            </div>

            {formData.location === 'online' && (
              <div>
                <label className='block text-sm font-medium text-gray-700'>Enlace de Reunión</label>
                <input
                  type='url'
                  value={formData.meetingLink}
                  onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                  className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500'
                  placeholder='https://meet.google.com/...'
                />
              </div>
            )}

            <div>
              <label className='block text-sm font-medium text-gray-700'>Descripción</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500'
                rows={3}
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700'>Notas</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500'
                rows={2}
              />
            </div>

            <div className='flex justify-end space-x-3'>
              <button
                type='button'
                onClick={onClose}
                className='px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50'
              >
                Cancelar
              </button>
              <button
                type='submit'
                disabled={loading}
                className='px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50'
              >
                {loading ? 'Creando...' : 'Crear Cita'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const EditAppointmentModal: React.FC<{
  appointment: Appointment;
  patients: Patient[];
  onClose: () => void;
  onSubmit: (updates: Partial<Appointment>) => void;
  loading: boolean;
}> = ({ appointment, patients, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    patientId: appointment.patientId,
    title: appointment.title,
    description: appointment.description || '',
    startTime: appointment.startTime.toISOString().slice(0, 16),
    endTime: appointment.endTime.toISOString().slice(0, 16),
    type: appointment.type,
    location: appointment.location,
    meetingLink: appointment.meetingLink || '',
    notes: appointment.notes || '',
    status: appointment.status,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      startTime: new Date(formData.startTime),
      endTime: new Date(formData.endTime),
    });
  };

  return (
    <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50'>
      <div className='relative top-10 mx-auto p-5 border w-4/5 max-w-2xl shadow-lg rounded-md bg-white'>
        <div className='mt-3'>
          <h3 className='text-lg font-medium text-gray-900 mb-4'>Editar Cita</h3>
          <form onSubmit={handleSubmit} className='space-y-4'>
            {/* Similar form fields as CreateAppointmentModal */}
            <div>
              <label className='block text-sm font-medium text-gray-700'>Estado</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500'
              >
                <option value='scheduled'>Programada</option>
                <option value='confirmed'>Confirmada</option>
                <option value='in-progress'>En Progreso</option>
                <option value='completed'>Completada</option>
                <option value='cancelled'>Cancelada</option>
                <option value='no-show'>No se presentó</option>
              </select>
            </div>

            <div className='flex justify-end space-x-3'>
              <button
                type='button'
                onClick={onClose}
                className='px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50'
              >
                Cancelar
              </button>
              <button
                type='submit'
                disabled={loading}
                className='px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50'
              >
                {loading ? 'Actualizando...' : 'Actualizar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const AppointmentDetailsModal: React.FC<{
  appointment: Appointment;
  patientName: string;
  onClose: () => void;
  onCancel: () => void;
}> = ({ appointment, patientName, onClose, onCancel }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no-show':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLocationIcon = (location: string) => {
    switch (location) {
      case 'office':
        return <MapPin className='h-5 w-5' />;
      case 'online':
        return <Video className='h-5 w-5' />;
      case 'phone':
        return <Phone className='h-5 w-5' />;
      default:
        return <Calendar className='h-5 w-5' />;
    }
  };

  return (
    <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50'>
      <div className='relative top-10 mx-auto p-5 border w-4/5 max-w-2xl shadow-lg rounded-md bg-white'>
        <div className='mt-3'>
          <div className='flex justify-between items-center mb-4'>
            <h3 className='text-lg font-medium text-gray-900'>Detalles de la Cita</h3>
            <button onClick={onClose} className='text-gray-400 hover:text-gray-600'>
              ✕
            </button>
          </div>

          <div className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <h4 className='font-medium text-gray-900 mb-2'>Información Básica</h4>
                <div className='space-y-2 text-sm'>
                  <p>
                    <strong>Título:</strong> {appointment.title}
                  </p>
                  <p>
                    <strong>Paciente:</strong> {patientName}
                  </p>
                  <p>
                    <strong>Tipo:</strong> {appointment.type}
                  </p>
                  <p>
                    <strong>Estado:</strong>
                    <span
                      className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        appointment.status
                      )}`}
                    >
                      {appointment.status}
                    </span>
                  </p>
                </div>
              </div>

              <div>
                <h4 className='font-medium text-gray-900 mb-2'>Horario y Ubicación</h4>
                <div className='space-y-2 text-sm'>
                  <div className='flex items-center space-x-2'>
                    <Clock className='h-4 w-4 text-gray-400' />
                    <span>{new Date(appointment.startTime).toLocaleString('es-ES')}</span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Clock className='h-4 w-4 text-gray-400' />
                    <span>{new Date(appointment.endTime).toLocaleString('es-ES')}</span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    {getLocationIcon(appointment.location)}
                    <span>{appointment.location}</span>
                  </div>
                  {appointment.meetingLink && (
                    <div className='flex items-center space-x-2'>
                      <Video className='h-4 w-4 text-gray-400' />
                      <a
                        href={appointment.meetingLink}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-blue-600 hover:text-blue-800'
                      >
                        Unirse a la reunión
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {appointment.description && (
              <div>
                <h4 className='font-medium text-gray-900 mb-2'>Descripción</h4>
                <div className='bg-gray-50 p-4 rounded text-sm'>{appointment.description}</div>
              </div>
            )}

            {appointment.notes && (
              <div>
                <h4 className='font-medium text-gray-900 mb-2'>Notas</h4>
                <div className='bg-gray-50 p-4 rounded text-sm'>{appointment.notes}</div>
              </div>
            )}
          </div>

          <div className='flex justify-end space-x-3 mt-6'>
            <button
              onClick={onCancel}
              className='px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-50'
            >
              Cancelar Cita
            </button>
            <button
              onClick={onClose}
              className='px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50'
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentsCalendar;
