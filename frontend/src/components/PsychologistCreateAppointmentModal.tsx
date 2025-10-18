import React, { useState } from 'react';
import { Calendar, Clock, User, X, Save, Mail, CreditCard, Phone } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';

interface PsychologistCreateAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAppointmentCreated: () => void;
}

const PsychologistCreateAppointmentModal: React.FC<PsychologistCreateAppointmentModalProps> = ({
  isOpen,
  onClose,
  onAppointmentCreated,
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    // Datos del paciente
    patientName: '',
    patientEmail: '',
    patientPhone: '',
    patientId: '',
    // Datos de la cita
    date: '',
    time: '',
    duration: '60',
    type: 'online',
    reason: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validación básica
      if (!formData.patientName || !formData.patientEmail || !formData.date || !formData.time || !formData.reason) {
        toast.error('Por favor, completa todos los campos obligatorios.');
        setLoading(false);
        return;
      }

      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.patientEmail)) {
        toast.error('Por favor, ingresa un email válido.');
        setLoading(false);
        return;
      }

      // Crear la cita en Firestore
      const appointmentData = {
        // Datos del paciente
        patientName: formData.patientName,
        patientEmail: formData.patientEmail,
        patientPhone: formData.patientPhone || '',
        patientId: formData.patientId || '',
        // Datos del psicólogo
        psychologistId: user?.uid,
        psychologistName: user?.displayName || 'Psicólogo',
        psychologistEmail: user?.email,
        // Datos de la cita
        appointmentDate: new Date(`${formData.date}T${formData.time}`),
        appointmentTime: formData.time,
        duration: parseInt(formData.duration),
        type: formData.type,
        reason: formData.reason,
        notes: formData.notes || '',
        status: 'scheduled', // Cita programada directamente por el psicólogo
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'appointments'), appointmentData);

      toast.success('Cita creada exitosamente. Se enviará un email de confirmación al paciente.');
      
      // Reset form
      setFormData({
        patientName: '',
        patientEmail: '',
        patientPhone: '',
        patientId: '',
        date: '',
        time: '',
        duration: '60',
        type: 'online',
        reason: '',
        notes: '',
      });
      
      onAppointmentCreated();
      onClose();
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error('Error al crear la cita. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Crear Nueva Cita</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información del Paciente */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Información del Paciente
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre del Paciente */}
              <div>
                <label htmlFor="patientName" className="block text-sm font-medium mb-2 text-gray-700">
                  Nombre Completo del Paciente *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="patientName"
                    name="patientName"
                    value={formData.patientName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-purple-500 focus:ring-purple-500"
                    placeholder="Ej: Juan Pérez"
                    required
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* Email del Paciente */}
              <div>
                <label htmlFor="patientEmail" className="block text-sm font-medium mb-2 text-gray-700">
                  Email del Paciente *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="patientEmail"
                    name="patientEmail"
                    value={formData.patientEmail}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-purple-500 focus:ring-purple-500"
                    placeholder="ejemplo@email.com"
                    required
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* Teléfono del Paciente */}
              <div>
                <label htmlFor="patientPhone" className="block text-sm font-medium mb-2 text-gray-700">
                  Teléfono del Paciente
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    id="patientPhone"
                    name="patientPhone"
                    value={formData.patientPhone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-purple-500 focus:ring-purple-500"
                    placeholder="+57 300 123 4567"
                  />
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* Cédula del Paciente */}
              <div>
                <label htmlFor="patientId" className="block text-sm font-medium mb-2 text-gray-700">
                  Cédula del Paciente
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="patientId"
                    name="patientId"
                    value={formData.patientId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-purple-500 focus:ring-purple-500"
                    placeholder="12345678"
                  />
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Información de la Cita */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Información de la Cita
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fecha */}
              <div>
                <label htmlFor="date" className="block text-sm font-medium mb-2 text-gray-700">
                  Fecha de la Cita *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-purple-500 focus:ring-purple-500"
                    required
                  />
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* Hora */}
              <div>
                <label htmlFor="time" className="block text-sm font-medium mb-2 text-gray-700">
                  Hora de la Cita *
                </label>
                <div className="relative">
                  <input
                    type="time"
                    id="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-purple-500 focus:ring-purple-500"
                    required
                  />
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* Duración */}
              <div>
                <label htmlFor="duration" className="block text-sm font-medium mb-2 text-gray-700">
                  Duración (minutos)
                </label>
                <select
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-purple-500 focus:ring-purple-500"
                >
                  <option value="30">30 minutos</option>
                  <option value="45">45 minutos</option>
                  <option value="60">60 minutos</option>
                  <option value="90">90 minutos</option>
                  <option value="120">120 minutos</option>
                </select>
              </div>

              {/* Tipo */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium mb-2 text-gray-700">
                  Tipo de Cita
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-purple-500 focus:ring-purple-500"
                >
                  <option value="online">Online</option>
                  <option value="in-person">Presencial</option>
                </select>
              </div>
            </div>

            {/* Motivo */}
            <div className="mt-4">
              <label htmlFor="reason" className="block text-sm font-medium mb-2 text-gray-700">
                Motivo de la Cita *
              </label>
              <textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-purple-500 focus:ring-purple-500 resize-none"
                placeholder="Describe el motivo de la cita..."
                required
              ></textarea>
            </div>

            {/* Notas */}
            <div className="mt-4">
              <label htmlFor="notes" className="block text-sm font-medium mb-2 text-gray-700">
                Notas Adicionales (Opcional)
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-purple-500 focus:ring-purple-500 resize-none"
                placeholder="Cualquier información adicional relevante..."
              ></textarea>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors flex items-center space-x-2 ${
                loading ? 'bg-purple-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
              }`}
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <Save className="w-5 h-5" />
              )}
              <span>{loading ? 'Creando...' : 'Crear Cita'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PsychologistCreateAppointmentModal;
