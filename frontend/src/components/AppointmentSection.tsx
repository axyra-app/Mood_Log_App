import { Calendar, Plus, Shield, Star, User, X } from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAppointments } from '../hooks/useAppointments';
import { usePsychologists } from '../hooks/usePsychologists';
import { Psychologist } from '../types';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { createAppointment, loading, appointments } = useAppointments();
  const { psychologists, loading: psychologistsLoading } = usePsychologists();
  const [formData, setFormData] = useState({
    appointmentDate: '',
    appointmentTime: '',
    duration: 60,
    type: 'consultation' as 'consultation' | 'follow-up' | 'emergency',
    reason: '',
    notes: '',
    psychologistId: '',
  });
  const [selectedPsychologist, setSelectedPsychologist] = useState<Psychologist | null>(null);
  const [conflictError, setConflictError] = useState<string>('');

  // Check for appointment conflicts
  const checkConflicts = (
    appointmentDate: string,
    appointmentTime: string,
    duration: number,
    psychologistId: string
  ) => {
    if (!appointmentDate || !appointmentTime || !psychologistId) return false;

    const newAppointmentStart = new Date(`${appointmentDate}T${appointmentTime}`);
    const newAppointmentEnd = new Date(newAppointmentStart.getTime() + duration * 60000);

    // Check conflicts with existing appointments
    const hasConflict = appointments.some((appointment) => {
      if (appointment.psychologistId !== psychologistId) return false;
      if (appointment.status === 'cancelled' || appointment.status === 'rejected') return false;

      const existingStart = appointment.appointmentDate;
      const existingEnd = new Date(existingStart.getTime() + appointment.duration * 60000);

      return (
        (newAppointmentStart >= existingStart && newAppointmentStart < existingEnd) ||
        (newAppointmentEnd > existingStart && newAppointmentEnd <= existingEnd) ||
        (newAppointmentStart <= existingStart && newAppointmentEnd >= existingEnd)
      );
    });

    return hasConflict;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check for conflicts
    const hasConflict = checkConflicts(
      formData.appointmentDate,
      formData.appointmentTime,
      formData.duration,
      formData.psychologistId
    );

    if (hasConflict) {
      setConflictError('Ya existe una cita en ese horario con este psicólogo. Por favor, elige otro horario.');
      return;
    }

    setConflictError('');

    try {
      const appointmentDateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime}`);

      await createAppointment({
        appointmentDate: appointmentDateTime,
        duration: formData.duration,
        type: formData.type,
        reason: formData.reason,
        notes: formData.notes,
        status: 'pending',
        psychologistId: formData.psychologistId,
        psychologistName: selectedPsychologist?.name || 'Psicólogo',
      });

      // Reset form
      setFormData({
        appointmentDate: '',
        appointmentTime: '',
        duration: 60,
        type: 'consultation',
        reason: '',
        notes: '',
        psychologistId: '',
      });
      setSelectedPsychologist(null);
      setConflictError('');

      onClose();
    } catch (error) {
      console.error('Error creating appointment:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear conflict error when form changes
    if (conflictError) {
      setConflictError('');
    }

    // Handle psychologist selection
    if (name === 'psychologistId') {
      const psychologist = psychologists.find((p) => p.id === value);
      setSelectedPsychologist(psychologist || null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto'>
        <div className='p-6'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-2xl font-bold text-gray-900'>Agendar Cita</h2>
            <button onClick={onClose} className='p-2 hover:bg-gray-100 rounded-lg transition-colors'>
              <X className='w-5 h-5 text-gray-500' />
            </button>
          </div>

          <form onSubmit={handleSubmit} className='space-y-4'>
            {/* Psychologist Selection */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Seleccionar Psicólogo</label>
              {psychologistsLoading ? (
                <div className='w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50'>
                  <div className='flex items-center space-x-2'>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500'></div>
                    <span className='text-gray-600'>Cargando psicólogos...</span>
                  </div>
                </div>
              ) : (
                <select
                  name='psychologistId'
                  value={formData.psychologistId}
                  onChange={handleChange}
                  required
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
                >
                  <option value=''>Selecciona un psicólogo</option>
                  {psychologists.map((psychologist) => (
                    <option key={psychologist.id} value={psychologist.id}>
                      {psychologist.name} - {psychologist.specialization.join(', ')} ({psychologist.rating}/5⭐)
                    </option>
                  ))}
                </select>
              )}

              {/* Selected Psychologist Info */}
              {selectedPsychologist && (
                <div className='mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200'>
                  <div className='flex items-center space-x-3'>
                    <div className='w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center'>
                      <User className='w-5 h-5 text-white' />
                    </div>
                    <div className='flex-1'>
                      <h4 className='font-medium text-gray-900'>{selectedPsychologist.name}</h4>
                      <div className='flex items-center space-x-2 text-sm text-gray-600'>
                        <span className='flex items-center'>
                          <Star className='w-4 h-4 text-yellow-500 mr-1' />
                          {selectedPsychologist.rating}/5
                        </span>
                        <span>•</span>
                        <span>{selectedPsychologist.experience} años de experiencia</span>
                      </div>
                      <p className='text-xs text-gray-500 mt-1'>{selectedPsychologist.bio}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Fecha de la cita</label>
              <input
                type='date'
                name='appointmentDate'
                value={formData.appointmentDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                required
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Hora de la cita</label>
              <input
                type='time'
                name='appointmentTime'
                value={formData.appointmentTime}
                onChange={handleChange}
                required
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Duración (minutos)</label>
              <select
                name='duration'
                value={formData.duration}
                onChange={handleChange}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
              >
                <option value={30}>30 minutos</option>
                <option value={60}>1 hora</option>
                <option value={90}>1.5 horas</option>
                <option value={120}>2 horas</option>
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Tipo de consulta</label>
              <select
                name='type'
                value={formData.type}
                onChange={handleChange}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
              >
                <option value='consultation'>Consulta general</option>
                <option value='follow-up'>Seguimiento</option>
                <option value='emergency'>Emergencia</option>
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Motivo de la consulta</label>
              <textarea
                name='reason'
                value={formData.reason}
                onChange={handleChange}
                placeholder='Describe brevemente el motivo de tu consulta...'
                rows={3}
                required
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Notas adicionales (opcional)</label>
              <textarea
                name='notes'
                value={formData.notes}
                onChange={handleChange}
                placeholder='Cualquier información adicional que consideres importante...'
                rows={2}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none'
              />
            </div>

            {/* Conflict Error Display */}
            {conflictError && (
              <div className='p-3 bg-red-50 border border-red-200 rounded-lg'>
                <div className='flex items-center space-x-2'>
                  <Shield className='w-5 h-5 text-red-500' />
                  <p className='text-sm text-red-700'>{conflictError}</p>
                </div>
              </div>
            )}

            <div className='flex space-x-3 pt-4'>
              <button
                type='button'
                onClick={onClose}
                className='flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'
              >
                Cancelar
              </button>
              <button
                type='submit'
                disabled={loading || !!conflictError || !formData.psychologistId}
                className='flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors disabled:opacity-50'
              >
                {loading ? 'Agendando...' : 'Agendar Cita'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const AppointmentCard: React.FC<{ appointment: any }> = ({ appointment }) => {
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
        return status;
    }
  };

  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-4'>
      <div className='flex items-start justify-between mb-3'>
        <div className='flex items-center space-x-3'>
          <div className='w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center'>
            <Calendar className='w-5 h-5 text-white' />
          </div>
          <div>
            <h3 className='font-semibold text-gray-900'>
              {appointment.appointmentDate.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </h3>
            <p className='text-sm text-gray-600'>
              {appointment.appointmentDate.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
              })}{' '}
              - {appointment.duration} min
            </p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
          {getStatusText(appointment.status)}
        </span>
      </div>

      <div className='space-y-2'>
        <p className='text-sm text-gray-600'>
          <strong>Tipo:</strong>{' '}
          {appointment.type === 'consultation'
            ? 'Consulta general'
            : appointment.type === 'follow-up'
            ? 'Seguimiento'
            : 'Emergencia'}
        </p>
        <p className='text-sm text-gray-600'>
          <strong>Motivo:</strong> {appointment.reason}
        </p>
        {appointment.psychologistName && (
          <p className='text-sm text-gray-600'>
            <strong>Psicólogo:</strong> {appointment.psychologistName}
          </p>
        )}
      </div>
    </div>
  );
};

const AppointmentSection: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const { appointments, loading } = useAppointments();

  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center space-x-3'>
          <div className='w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center'>
            <Calendar className='w-5 h-5 text-white' />
          </div>
          <div>
            <h3 className='text-lg font-semibold text-gray-900'>Mis Citas</h3>
            <p className='text-sm text-gray-600'>Gestiona tus citas con psicólogos</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className='px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors flex items-center space-x-2'
        >
          <Plus className='w-4 h-4' />
          <span>Nueva Cita</span>
        </button>
      </div>

      {loading ? (
        <div className='text-center py-8'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4'></div>
          <p className='text-gray-600'>Cargando citas...</p>
        </div>
      ) : appointments.length === 0 ? (
        <div className='text-center py-8'>
          <div className='text-6xl mb-4'>📅</div>
          <p className='text-lg text-gray-600 mb-2'>No tienes citas agendadas</p>
          <p className='text-sm text-gray-500 mb-4'>Agenda una cita para hablar con un psicólogo profesional</p>
          <button
            onClick={() => setShowModal(true)}
            className='px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors'
          >
            Agendar Primera Cita
          </button>
        </div>
      ) : (
        <div className='space-y-4'>
          {appointments.slice(0, 3).map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))}

          {appointments.length > 3 && (
            <div className='text-center pt-4'>
              <button className='text-purple-600 hover:text-purple-700 font-medium'>
                Ver todas las citas ({appointments.length})
              </button>
            </div>
          )}
        </div>
      )}

      <AppointmentModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default AppointmentSection;
