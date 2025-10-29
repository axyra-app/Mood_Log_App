import { Calendar, FileText, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { usePsychologistAppointments } from '../hooks/usePsychologistAppointments';

const MedicalHistory: React.FC = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState({
    sessionType: '',
    diagnosis: '',
    treatment: '',
    notes: '',
    recommendations: '',
  });

  const { appointments, loading } = usePsychologistAppointments(user?.uid || '');

  // Obtener pacientes únicos de las citas aceptadas
  const acceptedAppointments = appointments.filter((apt) => apt.status === 'accepted');
  const uniquePatients = acceptedAppointments.reduce((acc: any[], appointment) => {
    const existingPatient = acc.find((p) => p.userId === appointment.userId);
    if (!existingPatient) {
      acc.push({
        userId: appointment.userId,
        userName: appointment.userName,
        userEmail: appointment.userEmail,
        appointmentCount: acceptedAppointments.filter((apt) => apt.userId === appointment.userId).length,
        lastAppointment: acceptedAppointments
          .filter((apt) => apt.userId === appointment.userId)
          .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime())[0],
      });
    }
    return acc;
  }, []);

  useEffect(() => {
    // Si viene desde el dashboard con un paciente específico, seleccionarlo automáticamente
    if (location.state?.selectedPatient) {
      setSelectedPatient(location.state.selectedPatient);
    }
  }, [location.state]);

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    if (date instanceof Date) return date.toLocaleDateString('es-ES');
    if (date.toDate) return date.toDate().toLocaleDateString('es-ES');
    return new Date(date).toLocaleDateString('es-ES');
  };

  const handlePatientSelect = (patient: any) => {
    setSelectedPatient(patient);
  };

  const handleCreateReport = () => {
    if (selectedPatient) {
      setShowReportModal(true);
    }
  };

  const handleSaveReport = async () => {
    if (!selectedPatient || !reportData.sessionType || !reportData.diagnosis) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      // Aquí implementarías la lógica para guardar el reporte en Firebase

      // Simular guardado exitoso
      alert('Reporte médico creado exitosamente');
      setShowReportModal(false);
      setReportData({
        sessionType: '',
        diagnosis: '',
        treatment: '',
        notes: '',
        recommendations: '',
      });
    } catch (error) {
      console.error('Error al crear reporte:', error);
      alert('Error al crear el reporte');
    }
  };

  const handleCloseModal = () => {
    setShowReportModal(false);
    setReportData({
      sessionType: '',
      diagnosis: '',
      treatment: '',
      notes: '',
      recommendations: '',
    });
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Header
        title='Historial Médico'
        subtitle='Gestiona reportes médicos de pacientes'
        backTo='/dashboard-psychologist'
      />

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
        <div
          className={`rounded-xl shadow-sm border transition-colors duration-500 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          <div className='p-6'>
            <div className='flex items-center justify-between mb-6'>
              <div>
                <h2
                  className={`text-xl font-semibold transition-colors duration-500 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Gestiona los reportes médicos de tus pacientes
                </h2>
                <p
                  className={`text-sm transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  Selecciona un paciente para ver su historial médico
                </p>
              </div>
              {selectedPatient && (
                <button
                  onClick={handleCreateReport}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-300 ${
                    isDarkMode
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-purple-500 text-white hover:bg-purple-600'
                  }`}
                >
                  + Nuevo Reporte
                </button>
              )}
            </div>

            {/* Pacientes con Citas Aceptadas */}
            <div className='mb-8'>
              <div className='flex items-center justify-between mb-4'>
                <h3
                  className={`text-lg font-medium transition-colors duration-500 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Pacientes con Citas Aceptadas
                </h3>
                <span
                  className={`text-sm px-3 py-1 rounded-full ${
                    isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {uniquePatients.length} pacientes
                </span>
              </div>

              {loading ? (
                <div className='text-center py-8'>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4'></div>
                  <p
                    className={`text-sm transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Cargando pacientes...
                  </p>
                </div>
              ) : uniquePatients.length === 0 ? (
                <div className='text-center py-12'>
                  <User className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  <h3
                    className={`text-lg font-medium mb-2 transition-colors duration-500 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    No hay pacientes con citas aceptadas
                  </h3>
                  <p
                    className={`text-sm transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Los pacientes aparecerán aquí cuando aceptes sus citas
                  </p>
                </div>
              ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                  {uniquePatients.map((patient) => (
                    <div
                      key={patient.userId}
                      onClick={() => handlePatientSelect(patient)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 ${
                        selectedPatient?.userId === patient.userId
                          ? isDarkMode
                            ? 'bg-purple-600 border-purple-500 text-white'
                            : 'bg-purple-100 border-purple-500 text-purple-900'
                          : isDarkMode
                          ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-white'
                          : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-900'
                      }`}
                    >
                      <div className='flex items-center justify-between mb-2'>
                        <div className='flex items-center space-x-3'>
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              selectedPatient?.userId === patient.userId
                                ? 'bg-purple-500 text-white'
                                : isDarkMode
                                ? 'bg-gray-600 text-gray-300'
                                : 'bg-gray-200 text-gray-600'
                            }`}
                          >
                            <User className='w-5 h-5' />
                          </div>
                          <div>
                            <h4
                              className={`font-medium transition-colors duration-500 ${
                                selectedPatient?.userId === patient.userId
                                  ? 'text-white'
                                  : isDarkMode
                                  ? 'text-white'
                                  : 'text-gray-900'
                              }`}
                            >
                              {patient.userName}
                            </h4>
                            <p
                              className={`text-sm transition-colors duration-500 ${
                                selectedPatient?.userId === patient.userId
                                  ? 'text-purple-100'
                                  : isDarkMode
                                  ? 'text-gray-400'
                                  : 'text-gray-600'
                              }`}
                            >
                              {patient.userEmail}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            selectedPatient?.userId === patient.userId
                              ? 'bg-purple-500 text-white'
                              : isDarkMode
                              ? 'bg-gray-600 text-gray-300'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {patient.appointmentCount} cita{patient.appointmentCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className='flex items-center space-x-2 text-xs'>
                        <Calendar
                          className={`w-3 h-3 ${
                            selectedPatient?.userId === patient.userId
                              ? 'text-purple-200'
                              : isDarkMode
                              ? 'text-gray-400'
                              : 'text-gray-500'
                          }`}
                        />
                        <span
                          className={`transition-colors duration-500 ${
                            selectedPatient?.userId === patient.userId
                              ? 'text-purple-100'
                              : isDarkMode
                              ? 'text-gray-400'
                              : 'text-gray-500'
                          }`}
                        >
                          Última: {formatDate(patient.lastAppointment?.appointmentDate)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Historial Médico */}
            <div className='mt-8'>
              <h2
                className={`text-xl font-semibold mb-4 transition-colors duration-500 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Historial Médico
              </h2>
              {selectedPatient ? (
                <div className='text-center py-12'>
                  <FileText className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  <h3
                    className={`text-lg font-medium mb-2 transition-colors duration-500 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    Historial de {selectedPatient.userName}
                  </h3>
                  <p
                    className={`text-sm transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Los reportes médicos aparecerán aquí cuando los crees
                  </p>
                </div>
              ) : (
                <div className='text-center py-12'>
                  <FileText className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  <h3
                    className={`text-lg font-medium mb-2 transition-colors duration-500 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    Selecciona un Paciente
                  </h3>
                  <p
                    className={`text-sm transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Selecciona un paciente para ver su historial médico
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal para crear reporte médico */}
      {showReportModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div
            className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-xl transition-colors duration-500 ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <div className='p-6'>
              <div className='flex items-center justify-between mb-6'>
                <h3
                  className={`text-xl font-semibold transition-colors duration-500 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Nuevo Reporte Médico
                </h3>
                <button
                  onClick={handleCloseModal}
                  className={`p-2 rounded-lg transition-colors duration-300 ${
                    isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  ✕
                </button>
              </div>

              {selectedPatient && (
                <div
                  className={`p-4 rounded-lg mb-6 transition-colors duration-500 ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                  }`}
                >
                  <h4
                    className={`font-medium mb-2 transition-colors duration-500 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    Paciente: {selectedPatient.userName}
                  </h4>
                  <p
                    className={`text-sm transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    {selectedPatient.userEmail}
                  </p>
                </div>
              )}

              <div className='space-y-4'>
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                      isDarkMode ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    Tipo de Sesión *
                  </label>
                  <select
                    value={reportData.sessionType}
                    onChange={(e) => setReportData({ ...reportData, sessionType: e.target.value })}
                    className={`w-full p-3 rounded-lg border transition-colors duration-500 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                    }`}
                  >
                    <option value=''>Selecciona el tipo de sesión</option>
                    <option value='evaluation'>Evaluación inicial</option>
                    <option value='follow-up'>Seguimiento</option>
                    <option value='crisis'>Intervención en crisis</option>
                    <option value='therapy'>Terapia individual</option>
                    <option value='group'>Terapia grupal</option>
                  </select>
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                      isDarkMode ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    Diagnóstico *
                  </label>
                  <textarea
                    value={reportData.diagnosis}
                    onChange={(e) => setReportData({ ...reportData, diagnosis: e.target.value })}
                    rows={3}
                    placeholder='Describe el diagnóstico...'
                    className={`w-full p-3 rounded-lg border transition-colors duration-500 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                    }`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                      isDarkMode ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    Tratamiento
                  </label>
                  <textarea
                    value={reportData.treatment}
                    onChange={(e) => setReportData({ ...reportData, treatment: e.target.value })}
                    rows={3}
                    placeholder='Describe el tratamiento aplicado...'
                    className={`w-full p-3 rounded-lg border transition-colors duration-500 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                    }`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                      isDarkMode ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    Notas de la Sesión
                  </label>
                  <textarea
                    value={reportData.notes}
                    onChange={(e) => setReportData({ ...reportData, notes: e.target.value })}
                    rows={4}
                    placeholder='Notas adicionales sobre la sesión...'
                    className={`w-full p-3 rounded-lg border transition-colors duration-500 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                    }`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                      isDarkMode ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    Recomendaciones
                  </label>
                  <textarea
                    value={reportData.recommendations}
                    onChange={(e) => setReportData({ ...reportData, recommendations: e.target.value })}
                    rows={3}
                    placeholder='Recomendaciones para el paciente...'
                    className={`w-full p-3 rounded-lg border transition-colors duration-500 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                    }`}
                  />
                </div>
              </div>

              <div className='flex justify-end space-x-3 mt-6'>
                <button
                  onClick={handleCloseModal}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-300 ${
                    isDarkMode
                      ? 'bg-gray-600 text-white hover:bg-gray-500'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveReport}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-300 ${
                    isDarkMode
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-purple-500 text-white hover:bg-purple-600'
                  }`}
                >
                  Guardar Reporte
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalHistory;
