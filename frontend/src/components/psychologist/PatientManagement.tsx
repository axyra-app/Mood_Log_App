import { Edit, Eye, Filter, MessageCircle, Phone, Plus, Search, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { createPatient, deletePatient, getPatientStatistics, updatePatient } from '../../services/patientService';
import { Patient } from '../../types';

interface PatientManagementProps {
  patients: Patient[];
  onPatientUpdate: () => void;
}

const PatientManagement: React.FC<PatientManagementProps> = ({ patients, onPatientUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const [patientStats, setPatientStats] = useState<any>(null);

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch = patient.userId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || patient.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleCreatePatient = async (patientData: Partial<Patient>) => {
    try {
      setLoading(true);
      await createPatient({
        userId: patientData.userId || '',
        psychologistId: patientData.psychologistId || '',
        assignedAt: new Date(),
        status: 'active',
        treatmentGoals: [],
        riskLevel: 'low',
        totalSessions: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      onPatientUpdate();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creando paciente:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePatient = async (patientId: string, updates: Partial<Patient>) => {
    try {
      setLoading(true);
      await updatePatient(patientId, updates);
      onPatientUpdate();
      setShowEditModal(false);
    } catch (error) {
      console.error('Error actualizando paciente:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePatient = async (patientId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este paciente?')) {
      try {
        setLoading(true);
        await deletePatient(patientId);
        onPatientUpdate();
      } catch (error) {
        console.error('Error eliminando paciente:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleViewDetails = async (patient: Patient) => {
    setSelectedPatient(patient);
    try {
      const stats = await getPatientStatistics(patient.id);
      setPatientStats(stats);
    } catch (error) {
      console.error('Error cargando estadísticas del paciente:', error);
    }
    setShowDetailsModal(true);
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'discharged':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <h2 className='text-2xl font-bold text-gray-900'>Gestión de Pacientes</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
        >
          <Plus className='h-4 w-4 mr-2' />
          Nuevo Paciente
        </button>
      </div>

      {/* Filters */}
      <div className='bg-white p-4 rounded-lg shadow'>
        <div className='flex flex-col sm:flex-row gap-4'>
          <div className='flex-1'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
              <input
                type='text'
                placeholder='Buscar pacientes...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500'
              />
            </div>
          </div>
          <div className='flex items-center space-x-2'>
            <Filter className='h-4 w-4 text-gray-400' />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className='border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500'
            >
              <option value='all'>Todos</option>
              <option value='active'>Activos</option>
              <option value='inactive'>Inactivos</option>
              <option value='discharged'>Dados de alta</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patients List */}
      <div className='bg-white shadow overflow-hidden sm:rounded-md'>
        <ul className='divide-y divide-gray-200'>
          {filteredPatients.map((patient) => (
            <li key={patient.id}>
              <div className='px-4 py-4 flex items-center justify-between hover:bg-gray-50'>
                <div className='flex items-center'>
                  <div className='flex-shrink-0 h-10 w-10'>
                    <div className='h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center'>
                      <span className='text-sm font-medium text-gray-700'>
                        {patient.userId.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className='ml-4'>
                    <div className='flex items-center'>
                      <p className='text-sm font-medium text-gray-900'>Paciente {patient.id.slice(0, 8)}</p>
                      <span
                        className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          patient.status
                        )}`}
                      >
                        {patient.status}
                      </span>
                    </div>
                    <div className='flex items-center mt-1'>
                      <p className='text-sm text-gray-500'>Sesiones: {patient.totalSessions}</p>
                      <span
                        className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(
                          patient.riskLevel
                        )}`}
                      >
                        {patient.riskLevel === 'high'
                          ? 'Alto riesgo'
                          : patient.riskLevel === 'medium'
                          ? 'Riesgo medio'
                          : 'Bajo riesgo'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className='flex items-center space-x-2'>
                  <button
                    onClick={() => handleViewDetails(patient)}
                    className='text-gray-400 hover:text-gray-600'
                    title='Ver detalles'
                  >
                    <Eye className='h-4 w-4' />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPatient(patient);
                      setShowEditModal(true);
                    }}
                    className='text-gray-400 hover:text-gray-600'
                    title='Editar'
                  >
                    <Edit className='h-4 w-4' />
                  </button>
                  <button
                    onClick={() => handleDeletePatient(patient.id)}
                    className='text-gray-400 hover:text-red-600'
                    title='Eliminar'
                  >
                    <Trash2 className='h-4 w-4' />
                  </button>
                  <button className='text-gray-400 hover:text-blue-600' title='Chat'>
                    <MessageCircle className='h-4 w-4' />
                  </button>
                  <button className='text-gray-400 hover:text-green-600' title='Llamar'>
                    <Phone className='h-4 w-4' />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Create Patient Modal */}
      {showCreateModal && (
        <CreatePatientModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreatePatient}
          loading={loading}
        />
      )}

      {/* Edit Patient Modal */}
      {showEditModal && selectedPatient && (
        <EditPatientModal
          patient={selectedPatient}
          onClose={() => setShowEditModal(false)}
          onSubmit={(updates) => handleUpdatePatient(selectedPatient.id, updates)}
          loading={loading}
        />
      )}

      {/* Patient Details Modal */}
      {showDetailsModal && selectedPatient && (
        <PatientDetailsModal
          patient={selectedPatient}
          stats={patientStats}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </div>
  );
};

// Modal Components
const CreatePatientModal: React.FC<{
  onClose: () => void;
  onSubmit: (data: Partial<Patient>) => void;
  loading: boolean;
}> = ({ onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    userId: '',
    diagnosis: '',
    treatmentGoals: '',
    riskLevel: 'low' as const,
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      treatmentGoals: formData.treatmentGoals.split(',').map((goal) => goal.trim()),
      psychologistId: 'current-psychologist-id', // Esto debería venir del contexto
    });
  };

  return (
    <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50'>
      <div className='relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white'>
        <div className='mt-3'>
          <h3 className='text-lg font-medium text-gray-900 mb-4'>Nuevo Paciente</h3>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700'>ID de Usuario</label>
              <input
                type='text'
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700'>Diagnóstico</label>
              <input
                type='text'
                value={formData.diagnosis}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700'>Objetivos de Tratamiento</label>
              <textarea
                value={formData.treatmentGoals}
                onChange={(e) => setFormData({ ...formData, treatmentGoals: e.target.value })}
                className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500'
                placeholder='Separar objetivos con comas'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700'>Nivel de Riesgo</label>
              <select
                value={formData.riskLevel}
                onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value as any })}
                className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500'
              >
                <option value='low'>Bajo</option>
                <option value='medium'>Medio</option>
                <option value='high'>Alto</option>
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700'>Notas</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500'
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
                {loading ? 'Creando...' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const EditPatientModal: React.FC<{
  patient: Patient;
  onClose: () => void;
  onSubmit: (updates: Partial<Patient>) => void;
  loading: boolean;
}> = ({ patient, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    diagnosis: patient.diagnosis || '',
    treatmentGoals: patient.treatmentGoals.join(', '),
    riskLevel: patient.riskLevel,
    notes: patient.notes || '',
    status: patient.status,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      diagnosis: formData.diagnosis,
      treatmentGoals: formData.treatmentGoals.split(',').map((goal) => goal.trim()),
      riskLevel: formData.riskLevel,
      notes: formData.notes,
      status: formData.status,
    });
  };

  return (
    <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50'>
      <div className='relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white'>
        <div className='mt-3'>
          <h3 className='text-lg font-medium text-gray-900 mb-4'>Editar Paciente</h3>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700'>Diagnóstico</label>
              <input
                type='text'
                value={formData.diagnosis}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700'>Objetivos de Tratamiento</label>
              <textarea
                value={formData.treatmentGoals}
                onChange={(e) => setFormData({ ...formData, treatmentGoals: e.target.value })}
                className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500'
                placeholder='Separar objetivos con comas'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700'>Nivel de Riesgo</label>
              <select
                value={formData.riskLevel}
                onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value as any })}
                className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500'
              >
                <option value='low'>Bajo</option>
                <option value='medium'>Medio</option>
                <option value='high'>Alto</option>
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700'>Estado</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500'
              >
                <option value='active'>Activo</option>
                <option value='inactive'>Inactivo</option>
                <option value='discharged'>Dado de alta</option>
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700'>Notas</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500'
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
                {loading ? 'Actualizando...' : 'Actualizar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const PatientDetailsModal: React.FC<{
  patient: Patient;
  stats: any;
  onClose: () => void;
}> = ({ patient, stats, onClose }) => {
  return (
    <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50'>
      <div className='relative top-10 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white'>
        <div className='mt-3'>
          <div className='flex justify-between items-center mb-4'>
            <h3 className='text-lg font-medium text-gray-900'>Detalles del Paciente</h3>
            <button onClick={onClose} className='text-gray-400 hover:text-gray-600'>
              ✕
            </button>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <h4 className='font-medium text-gray-900 mb-2'>Información Básica</h4>
              <div className='space-y-2 text-sm'>
                <p>
                  <strong>ID:</strong> {patient.id}
                </p>
                <p>
                  <strong>Usuario:</strong> {patient.userId}
                </p>
                <p>
                  <strong>Estado:</strong> {patient.status}
                </p>
                <p>
                  <strong>Nivel de Riesgo:</strong> {patient.riskLevel}
                </p>
                <p>
                  <strong>Asignado:</strong> {new Date(patient.assignedAt).toLocaleDateString()}
                </p>
                <p>
                  <strong>Sesiones Totales:</strong> {patient.totalSessions}
                </p>
              </div>
            </div>

            <div>
              <h4 className='font-medium text-gray-900 mb-2'>Tratamiento</h4>
              <div className='space-y-2 text-sm'>
                <p>
                  <strong>Diagnóstico:</strong> {patient.diagnosis || 'No especificado'}
                </p>
                <div>
                  <strong>Objetivos:</strong>
                  <ul className='list-disc list-inside mt-1'>
                    {patient.treatmentGoals.map((goal, index) => (
                      <li key={index}>{goal}</li>
                    ))}
                  </ul>
                </div>
                {patient.notes && (
                  <p>
                    <strong>Notas:</strong> {patient.notes}
                  </p>
                )}
              </div>
            </div>
          </div>

          {stats && (
            <div className='mt-6'>
              <h4 className='font-medium text-gray-900 mb-2'>Estadísticas</h4>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
                <div className='bg-gray-50 p-3 rounded'>
                  <p className='font-medium'>Sesiones Activas</p>
                  <p className='text-2xl font-bold text-green-600'>{stats.activePlans}</p>
                </div>
                <div className='bg-gray-50 p-3 rounded'>
                  <p className='font-medium'>Citas Próximas</p>
                  <p className='text-2xl font-bold text-blue-600'>{stats.upcomingAppointments}</p>
                </div>
                <div className='bg-gray-50 p-3 rounded'>
                  <p className='font-medium'>Mood Antes</p>
                  <p className='text-2xl font-bold text-yellow-600'>{stats.averageMoodBefore?.toFixed(1) || 'N/A'}</p>
                </div>
                <div className='bg-gray-50 p-3 rounded'>
                  <p className='font-medium'>Mood Después</p>
                  <p className='text-2xl font-bold text-green-600'>{stats.averageMoodAfter?.toFixed(1) || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          <div className='flex justify-end mt-6'>
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

export default PatientManagement;
