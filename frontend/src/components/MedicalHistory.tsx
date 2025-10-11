import { Download, Eye, FileText, Plus, User } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { usePsychologistAppointments } from '../hooks/usePsychologistAppointments';

interface MedicalHistoryProps {
  isDarkMode: boolean;
}

const MedicalHistory: React.FC<MedicalHistoryProps> = ({ isDarkMode }) => {
  const { user } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [showNewReport, setShowNewReport] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newReport, setNewReport] = useState({
    patientId: '',
    sessionDate: '',
    sessionType: 'individual' as 'individual' | 'group' | 'emergency' | 'follow-up',
    diagnosis: '',
    treatment: '',
    notes: '',
    recommendations: '',
  });

  // Hook para obtener citas aceptadas del psicólogo
  const {
    appointments,
    loading: appointmentsLoading,
    getUpcomingAppointments,
    getStatistics,
  } = usePsychologistAppointments(user?.uid || '');

  // Obtener pacientes únicos de las citas aceptadas
  const acceptedAppointments = appointments.filter((app) => app.status === 'accepted');
  const uniquePatients = acceptedAppointments.reduce((acc: any[], appointment) => {
    const existingPatient = acc.find((p) => p.userId === appointment.userId);
    if (!existingPatient) {
      acc.push({
        userId: appointment.userId,
        userName: appointment.userName,
        userEmail: appointment.userEmail,
        lastAppointment: appointment.appointmentDate,
        appointmentCount: 1,
      });
    } else {
      existingPatient.appointmentCount++;
      if (appointment.appointmentDate > existingPatient.lastAppointment) {
        existingPatient.lastAppointment = appointment.appointmentDate;
      }
    }
    return acc;
  }, []);

  const stats = getStatistics();

  const handleNewReport = () => {
    // Permitir crear reporte sin seleccionar paciente primero
    setShowNewReport(true);
  };

  const handleCreateReport = async () => {
    try {
      setLoading(true);

      if (!selectedPatient) {
        toast.error('Por favor selecciona un paciente');
        return;
      }

      if (!newReport.sessionDate || !newReport.diagnosis || !newReport.treatment) {
        toast.error('Por favor completa todos los campos requeridos');
        return;
      }

      // TODO: Implementar creación real de reporte médico
      // const reportData = {
      //   userId: selectedPatient,
      //   psychologistId: user?.uid,
      //   sessionDate: newReport.sessionDate,
      //   sessionType: newReport.sessionType,
      //   diagnosis: newReport.diagnosis,
      //   treatment: newReport.treatment,
      //   notes: newReport.notes,
      //   recommendations: newReport.recommendations,
      //   createdAt: new Date(),
      // };

      // Simular creación de reporte
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success('Reporte médico creado exitosamente');
      setShowNewReport(false);
      setNewReport({
        patientId: '',
        sessionDate: '',
        sessionType: 'individual',
        diagnosis: '',
        treatment: '',
        notes: '',
        recommendations: '',
      });
    } catch (error) {
      console.error('Error creating report:', error);
      toast.error('Error al crear el reporte');
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = (report: any) => {
    toast.success('Funcionalidad de visualización disponible próximamente');
  };

  const handleDownloadReport = (report: any) => {
    toast.success('Funcionalidad de descarga disponible próximamente');
  };

  const formatDate = (date: any) => {
    if (!date) return 'Fecha no disponible';
    try {
      return new Date(date).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'Fecha inválida';
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
              isDarkMode ? 'bg-orange-600/20 text-orange-400' : 'bg-orange-100 text-orange-600'
            }`}
          >
            <FileText className='w-6 h-6' />
          </div>
          <div>
            <h2
              className={`text-xl font-semibold transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Historial Médico
            </h2>
            <p className={`text-sm transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Gestiona los reportes médicos de tus pacientes
            </p>
          </div>
        </div>

        <button
          onClick={handleNewReport}
          className={`px-4 py-2 rounded-lg font-medium transition-colors duration-300 ${
            isDarkMode ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-purple-500 text-white hover:bg-purple-600'
          } flex items-center space-x-2`}
        >
          <Plus className='w-4 h-4' />
          <span>Nuevo Reporte</span>
        </button>
      </div>

      {/* Enhanced Patient Selection */}
      <div className='mb-6'>
        <div className='flex items-center justify-between mb-4'>
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Pacientes con Citas Aceptadas
          </label>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {uniquePatients.length} pacientes
          </span>
        </div>

        {uniquePatients.length === 0 ? (
          <div
            className={`p-6 rounded-lg border text-center ${
              isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <User className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <p className={`text-sm transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              No hay pacientes con citas aceptadas aún
            </p>
            <p
              className={`text-xs mt-1 transition-colors duration-500 ${
                isDarkMode ? 'text-gray-500' : 'text-gray-500'
              }`}
            >
              Los pacientes aparecerán aquí cuando aceptes sus citas
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            {uniquePatients.map((patient) => (
              <div
                key={patient.userId}
                onClick={() => setSelectedPatient(patient.userId)}
                className={`p-4 rounded-lg border cursor-pointer transition-colors duration-300 ${
                  selectedPatient === patient.userId
                    ? isDarkMode
                      ? 'bg-purple-600 border-purple-500 text-white'
                      : 'bg-purple-100 border-purple-300 text-purple-900'
                    : isDarkMode
                    ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className='flex items-center justify-between'>
                  <div>
                    <h3
                      className={`font-medium transition-colors duration-500 ${
                        selectedPatient === patient.userId ? 'text-white' : isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {patient.userName || 'Usuario'}
                    </h3>
                    <p
                      className={`text-xs transition-colors duration-500 ${
                        selectedPatient === patient.userId
                          ? 'text-purple-100'
                          : isDarkMode
                          ? 'text-gray-400'
                          : 'text-gray-600'
                      }`}
                    >
                      {patient.userEmail}
                    </p>
                  </div>
                  <div className='text-right'>
                    <div
                      className={`text-xs px-2 py-1 rounded-full ${
                        selectedPatient === patient.userId
                          ? 'bg-purple-500 text-white'
                          : isDarkMode
                          ? 'bg-gray-600 text-gray-300'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {patient.appointmentCount} cita{patient.appointmentCount !== 1 ? 's' : ''}
                    </div>
                    <p
                      className={`text-xs mt-1 transition-colors duration-500 ${
                        selectedPatient === patient.userId
                          ? 'text-purple-100'
                          : isDarkMode
                          ? 'text-gray-500'
                          : 'text-gray-500'
                      }`}
                    >
                      Última: {new Date(patient.lastAppointment).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Medical Reports */}
      <div className='space-y-4'>
        {loading ? (
          <div className='text-center py-8'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4'></div>
            <p className={`transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Cargando reportes...
            </p>
          </div>
        ) : !selectedPatient ? (
          <div className='text-center py-12'>
            <div
              className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-400'
              }`}
            >
              <User className='w-8 h-8' />
            </div>
            <h3
              className={`text-lg font-medium mb-2 transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Selecciona un Paciente
            </h3>
            <p className={`text-sm transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Selecciona un paciente para ver su historial médico
            </p>
          </div>
        ) : (
          <div className='text-center py-12'>
            <div
              className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-400'
              }`}
            >
              <FileText className='w-8 h-8' />
            </div>
            <h3
              className={`text-lg font-medium mb-2 transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              No hay reportes médicos
            </h3>
            <p className={`text-sm transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Los reportes médicos aparecerán aquí cuando los crees
            </p>
          </div>
        )}
      </div>

      {/* New Report Modal */}
      {showNewReport && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div
            className={`w-full max-w-lg max-h-[90vh] rounded-xl shadow-2xl transition-colors duration-500 ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } border flex flex-col`}
          >
            {/* Header fijo */}
            <div className='flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700'>
              <h3
                className={`text-lg font-semibold transition-colors duration-500 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Nuevo Reporte
              </h3>
              <button
                onClick={() => setShowNewReport(false)}
                className={`p-2 rounded-lg transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                ✕
              </button>
            </div>

            {/* Contenido desplazable */}
            <div className='flex-1 overflow-y-auto p-4'>
              <div className='space-y-4'>
                {/* Patient Info */}
                {selectedPatient ? (
                  <div
                    className={`p-4 rounded-lg border ${
                      isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Paciente Seleccionado
                    </h4>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {uniquePatients.find((p) => p.userId === selectedPatient)?.userName || 'Usuario'}
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {uniquePatients.find((p) => p.userId === selectedPatient)?.userEmail || ''}
                    </p>
                  </div>
                ) : (
                  <div
                    className={`p-4 rounded-lg border border-dashed ${
                      isDarkMode ? 'border-gray-600' : 'border-gray-300'
                    }`}
                  >
                    <p className={`text-sm text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Selecciona un paciente arriba para crear su reporte médico
                    </p>
                  </div>
                )}

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                    >
                      Fecha de Sesión
                    </label>
                    <input
                      type='date'
                      value={newReport.sessionDate}
                      onChange={(e) => setNewReport((prev) => ({ ...prev, sessionDate: e.target.value }))}
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
                      Tipo de Sesión
                    </label>
                    <select
                      value={newReport.sessionType}
                      onChange={(e) => setNewReport((prev) => ({ ...prev, sessionType: e.target.value as any }))}
                      className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500'
                          : 'bg-gray-50 border-gray-300 text-gray-900 focus:ring-purple-500'
                      }`}
                    >
                      <option value='individual'>Individual</option>
                      <option value='group'>Grupal</option>
                      <option value='emergency'>Emergencia</option>
                      <option value='follow-up'>Seguimiento</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Diagnóstico
                  </label>
                  <textarea
                    value={newReport.diagnosis}
                    onChange={(e) => setNewReport((prev) => ({ ...prev, diagnosis: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500'
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:ring-purple-500'
                    }`}
                    rows={2}
                    placeholder='Describe el diagnóstico...'
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Tratamiento
                  </label>
                  <textarea
                    value={newReport.treatment}
                    onChange={(e) => setNewReport((prev) => ({ ...prev, treatment: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500'
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:ring-purple-500'
                    }`}
                    rows={2}
                    placeholder='Describe el tratamiento recomendado...'
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Notas Adicionales
                  </label>
                  <textarea
                    value={newReport.notes}
                    onChange={(e) => setNewReport((prev) => ({ ...prev, notes: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500'
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:ring-purple-500'
                    }`}
                    rows={2}
                    placeholder='Notas adicionales sobre la sesión...'
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Recomendaciones
                  </label>
                  <textarea
                    value={newReport.recommendations}
                    onChange={(e) => setNewReport((prev) => ({ ...prev, recommendations: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500'
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:ring-purple-500'
                    }`}
                    rows={2}
                    placeholder='Recomendaciones para el paciente...'
                  />
                </div>
              </div>
            </div>

            {/* Footer fijo */}
            <div className='flex justify-end space-x-3 p-4 border-t border-gray-200 dark:border-gray-700'>
              <button
                onClick={() => setShowNewReport(false)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateReport}
                disabled={loading || !newReport.patientId || !newReport.sessionDate}
                className='px-4 py-2 rounded-lg font-medium bg-green-500 text-white hover:bg-green-600 transition-colors duration-300 disabled:opacity-50'
              >
                {loading ? 'Creando...' : 'Crear Reporte'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalHistory;
