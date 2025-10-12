import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle, Trash2, Edit, Eye } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUserAppointments } from '../hooks/useUserAppointments';

interface Appointment {
  id: string;
  psychologistId: string;
  psychologistName: string;
  date: Date;
  time: string;
  duration: number;
  type: string;
  reason: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled' | 'expired';
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentManagement: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { appointments, loading, updateAppointment, deleteAppointment } = useUserAppointments();
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'accepted' | 'completed' | 'cancelled' | 'expired'>('all');
  const [showHistory, setShowHistory] = useState(false);

  // Filtrar citas por estado
  const filteredAppointments = appointments.filter(appointment => {
    if (selectedStatus === 'all') return true;
    return appointment.status === selectedStatus;
  });

  // Separar citas activas e históricas
  const now = new Date();
  const activeAppointments = filteredAppointments.filter(apt => 
    new Date(apt.date) >= now && apt.status !== 'completed' && apt.status !== 'cancelled'
  );
  const historicalAppointments = filteredAppointments.filter(apt => 
    new Date(apt.date) < now || apt.status === 'completed' || apt.status === 'cancelled'
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'expired':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'accepted':
        return 'Aceptada';
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      case 'expired':
        return 'Expirada';
      default:
        return 'Desconocido';
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      await updateAppointment(appointmentId, { status: newStatus });
      toast.success(`Cita ${getStatusText(newStatus).toLowerCase()} exitosamente`);
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Error al actualizar la cita');
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta cita?')) {
      try {
        await deleteAppointment(appointmentId);
        toast.success('Cita eliminada exitosamente');
      } catch (error) {
        console.error('Error deleting appointment:', error);
        toast.error('Error al eliminar la cita');
      }
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    return time;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        <span className="ml-2 text-gray-600">Cargando citas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mis Citas</h2>
          <p className="text-gray-600">Gestiona tus citas con psicólogos</p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>{showHistory ? 'Ocultar Historial' : 'Ver Historial'}</span>
          </button>
          
          <button 
            onClick={() => {
              // Verificar si el usuario necesita completar perfil
              if (!user?.firstName || !user?.lastName) {
                toast.error('Necesitas completar tu perfil antes de crear una cita');
                return;
              }
              // Navegar a página de creación de cita
              navigate('/create-appointment');
            }}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center space-x-2"
          >
            <Calendar className="w-4 h-4" />
            <span>Nueva Cita</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {['all', 'pending', 'accepted', 'completed', 'cancelled', 'expired'].map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status as any)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedStatus === status
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status === 'all' ? 'Todas' : getStatusText(status)}
          </button>
        ))}
      </div>

      {/* Citas Activas */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Citas Activas</h3>
        {activeAppointments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No tienes citas activas</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {activeAppointments.map((appointment) => (
              <div key={appointment.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {formatDate(appointment.date)}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)} flex items-center space-x-1`}>
                          {getStatusIcon(appointment.status)}
                          <span>{getStatusText(appointment.status)}</span>
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(appointment.time)} - {appointment.duration} min</span>
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
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                      >
                        Marcar Completada
                      </button>
                    )}
                    
                    {appointment.status === 'pending' && (
                      <button
                        onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                      >
                        Cancelar
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDeleteAppointment(appointment.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
      {showHistory && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Historial de Citas</h3>
          {historicalAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No hay citas en el historial</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {historicalAppointments.map((appointment) => (
                <div key={appointment.id} className="bg-gray-50 rounded-lg border p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gray-400 rounded-lg flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold text-gray-700">
                            {formatDate(appointment.date)}
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)} flex items-center space-x-1`}>
                            {getStatusIcon(appointment.status)}
                            <span>{getStatusText(appointment.status)}</span>
                          </span>
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>{formatTime(appointment.time)} - {appointment.duration} min</span>
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
                      <button
                        onClick={() => handleDeleteAppointment(appointment.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
      )}
    </div>
  );
};

export default AppointmentManagement;