import { Calendar, Plus } from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AppointmentManagement from './AppointmentManagement';
import AppointmentModal from './AppointmentModal';

const AppointmentSection: React.FC = () => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Mis Citas</h2>
            <p className="text-gray-600">Gestiona tus citas con psicólogos</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Cita</span>
        </button>
      </div>

      {/* Gestión de Citas */}
      <AppointmentManagement />

      {/* Modal de Nueva Cita */}
      <AppointmentModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default AppointmentSection;
