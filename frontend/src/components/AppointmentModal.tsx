import { Calendar, Plus, Shield, Star, User, X } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useUserAppointments } from '../hooks/useUserAppointments';
import { usePsychologists } from '../hooks/usePsychologists';
import { Psychologist } from '../types';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { createAppointment, loading } = useUserAppointments(user?.uid || '');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPsychologist) {
      toast.error('Por favor selecciona un psicólogo');
      return;
    }

    if (!formData.appointmentDate || !formData.appointmentTime) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      await createAppointment({
        psychologistId: selectedPsychologist.id,
        appointmentDate: new Date(formData.appointmentDate),
        appointmentTime: formData.appointmentTime,
        duration: formData.duration,
        type: formData.type,
        reason: formData.reason,
        notes: formData.notes,
      });

      toast.success('Cita creada exitosamente');
      onClose();
      
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
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error('Error al crear la cita');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Nueva Cita</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Selección de Psicólogo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar Psicólogo
              </label>
              {psychologistsLoading ? (
                <div className="animate-pulse bg-gray-200 h-10 rounded-lg"></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {psychologists.map((psychologist) => (
                    <div
                      key={psychologist.id}
                      onClick={() => {
                        setSelectedPsychologist(psychologist);
                        setFormData(prev => ({ ...prev, psychologistId: psychologist.id }));
                      }}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedPsychologist?.id === psychologist.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{psychologist.name}</h4>
                          <p className="text-sm text-gray-600">{psychologist.specialty}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm text-gray-600">{psychologist.rating}</span>
                            <Shield className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-600">Verificado</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Fecha y Hora */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de la Cita
                </label>
                <input
                  type="date"
                  value={formData.appointmentDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, appointmentDate: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora de la Cita
                </label>
                <input
                  type="time"
                  value={formData.appointmentTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, appointmentTime: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Duración y Tipo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duración (minutos)
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value={30}>30 minutos</option>
                  <option value={45}>45 minutos</option>
                  <option value={60}>60 minutos</option>
                  <option value={90}>90 minutos</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Consulta
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="consultation">Consulta General</option>
                  <option value="follow-up">Seguimiento</option>
                  <option value="emergency">Emergencia</option>
                </select>
              </div>
            </div>

            {/* Motivo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo de la Consulta
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Describe brevemente el motivo de tu consulta..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-20 resize-none"
                required
              />
            </div>

            {/* Notas Adicionales */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas Adicionales (Opcional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Cualquier información adicional que consideres importante..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-20 resize-none"
              />
            </div>

            {/* Botones */}
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

export default AppointmentModal;
