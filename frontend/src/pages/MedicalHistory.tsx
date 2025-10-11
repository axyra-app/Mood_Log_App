import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, FileText, User, Calendar, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePsychologistAppointments } from '../hooks/usePsychologistAppointments';

const MedicalHistory: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  const { appointments, loading } = usePsychologistAppointments(user?.uid || '');

  // Obtener pacientes únicos de las citas aceptadas
  const acceptedAppointments = appointments.filter(apt => apt.status === 'accepted');
  const uniquePatients = acceptedAppointments.reduce((acc: any[], appointment) => {
    const existingPatient = acc.find(p => p.userId === appointment.userId);
    if (!existingPatient) {
      acc.push({
        userId: appointment.userId,
        userName: appointment.userName,
        userEmail: appointment.userEmail,
        appointmentCount: acceptedAppointments.filter(apt => apt.userId === appointment.userId).length,
        lastAppointment: acceptedAppointments
          .filter(apt => apt.userId === appointment.userId)
          .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime())[0]
      });
    }
    return acc;
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
    }

    // Si viene desde el dashboard con un paciente específico, seleccionarlo automáticamente
    if (location.state?.selectedPatient) {
      setSelectedPatient(location.state.selectedPatient);
    }
  }, [location.state]);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

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
      // Aquí puedes implementar la lógica para crear un reporte
      console.log('Crear reporte para:', selectedPatient.userName);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <header className={`border-b transition-colors duration-500 ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard-psychologist')}
                className={`p-2 rounded-lg transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h1 className={`text-xl font-bold transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Historial Médico
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className={`rounded-xl shadow-sm border transition-colors duration-500 ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className={`text-xl font-semibold transition-colors duration-500 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Gestiona los reportes médicos de tus pacientes
                </h2>
                <p className={`text-sm transition-colors duration-500 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
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
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-medium transition-colors duration-500 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Pacientes con Citas Aceptadas
                </h3>
                <span className={`text-sm px-3 py-1 rounded-full ${
                  isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                }`}>
                  {uniquePatients.length} pacientes
                </span>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
                  <p className={`text-sm transition-colors duration-500 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Cargando pacientes...
                  </p>
                </div>
              ) : uniquePatients.length === 0 ? (
                <div className="text-center py-12">
                  <User className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  <h3 className={`text-lg font-medium mb-2 transition-colors duration-500 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    No hay pacientes con citas aceptadas
                  </h3>
                  <p className={`text-sm transition-colors duration-500 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Los pacientes aparecerán aquí cuando aceptes sus citas
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            selectedPatient?.userId === patient.userId
                              ? 'bg-purple-500 text-white'
                              : isDarkMode
                              ? 'bg-gray-600 text-gray-300'
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className={`font-medium transition-colors duration-500 ${
                              selectedPatient?.userId === patient.userId
                                ? 'text-white'
                                : isDarkMode
                                ? 'text-white'
                                : 'text-gray-900'
                            }`}>
                              {patient.userName}
                            </h4>
                            <p className={`text-sm transition-colors duration-500 ${
                              selectedPatient?.userId === patient.userId
                                ? 'text-purple-100'
                                : isDarkMode
                                ? 'text-gray-400'
                                : 'text-gray-600'
                            }`}>
                              {patient.userEmail}
                            </p>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          selectedPatient?.userId === patient.userId
                            ? 'bg-purple-500 text-white'
                            : isDarkMode
                            ? 'bg-gray-600 text-gray-300'
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {patient.appointmentCount} cita{patient.appointmentCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs">
                        <Calendar className={`w-3 h-3 ${
                          selectedPatient?.userId === patient.userId
                            ? 'text-purple-200'
                            : isDarkMode
                            ? 'text-gray-400'
                            : 'text-gray-500'
                        }`} />
                        <span className={`transition-colors duration-500 ${
                          selectedPatient?.userId === patient.userId
                            ? 'text-purple-100'
                            : isDarkMode
                            ? 'text-gray-400'
                            : 'text-gray-500'
                        }`}>
                          Última: {formatDate(patient.lastAppointment?.appointmentDate)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Historial Médico */}
            <div className="mt-8">
              <h2 className={`text-xl font-semibold mb-4 transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Historial Médico
              </h2>
              {selectedPatient ? (
                <div className="text-center py-12">
                  <FileText className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  <h3 className={`text-lg font-medium mb-2 transition-colors duration-500 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Historial de {selectedPatient.userName}
                  </h3>
                  <p className={`text-sm transition-colors duration-500 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Los reportes médicos aparecerán aquí cuando los crees
                  </p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  <h3 className={`text-lg font-medium mb-2 transition-colors duration-500 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Selecciona un Paciente
                  </h3>
                  <p className={`text-sm transition-colors duration-500 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Selecciona un paciente para ver su historial médico
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalHistory;
