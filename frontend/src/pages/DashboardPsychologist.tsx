import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppointmentManagement from '../components/AppointmentManagement';
import Logo from '../components/Logo';
import MedicalHistory from '../components/MedicalHistory';
import NotificationsPanel from '../components/NotificationsPanel';
import PsychologistNotifications from '../components/PsychologistNotifications';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { usePatients } from '../hooks/usePatients';
import { createPatientRelationsFromAppointments } from '../utils/createPatientRelations';

const DashboardPsychologist: React.FC = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  // Hook para obtener datos reales de pacientes
  const {
    patients,
    loading: patientsLoading,
    getStatistics,
    getPatientsByRiskLevel,
    getPatientsNeedingAttention,
  } = usePatients(user?.uid || '');

  // Estadísticas reales
  const stats = getStatistics();
  const highRiskPatients = getPatientsByRiskLevel('high');
  const mediumRiskPatients = getPatientsByRiskLevel('medium');
  const lowRiskPatients = getPatientsByRiskLevel('low');
  const patientsNeedingAttention = getPatientsNeedingAttention();

  useEffect(() => {
    setIsLoaded(true);

    // Actualizar sesiones de chat existentes (deshabilitado temporalmente)
    // updateExistingChatSessions().catch(console.error);
    
    // Crear relaciones paciente-psicólogo desde citas existentes (deshabilitado temporalmente)
    // createPatientRelationsFromAppointments().catch(console.error);
  }, []);

  const handlePatientChat = (patient: any) => {
    // Navegar al chat del psicólogo con el paciente específico
    navigate('/psychologist-chat', { 
      state: { 
        selectedPatient: patient,
        patientId: patient.uid || patient.userId,
        patientName: patient.displayName || patient.userName,
        patientEmail: patient.email || patient.userEmail
      } 
    });
  };

  const handlePatientHistory = (patient: any) => {
    // Navegar al historial médico con el paciente específico
    navigate('/medical-history', { 
      state: { 
        selectedPatient: patient,
        patientId: patient.userId 
      } 
    });
  };

  const handlePatientReport = (patient: any) => {
    // Navegar a crear reporte médico con el paciente específico
    navigate('/medical-history', { 
      state: { 
        selectedPatient: patient,
        patientId: patient.userId,
        action: 'create-report'
      } 
    });
  };


  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  if (!isLoaded) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${
          isDarkMode ? 'bg-gray-900' : 'bg-white'
        }`}
      >
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500'></div>
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header
        className={`border-b transition-colors duration-500 ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}
      >
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex items-center space-x-2 sm:space-x-4'>
              <Logo className='h-6 sm:h-8' />
              <div>
                <h1
                  className={`text-lg sm:text-xl font-bold transition-colors duration-500 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  <span className='hidden sm:inline'>Dashboard Psicólogo</span>
                  <span className='sm:hidden'>Psicólogo</span>
                </h1>
                <p
                  className={`text-xs sm:text-sm transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  <span className='hidden sm:inline'>Bienvenido, {user.displayName}</span>
                  <span className='sm:hidden'>{user.displayName}</span>
                </p>
              </div>
            </div>

            <div className='flex items-center space-x-2 sm:space-x-4'>
              {/* Notificaciones */}
              <NotificationsPanel isDarkMode={isDarkMode} />

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

              <button
                onClick={() => navigate('/settings')}
                className={`p-2 rounded-lg transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title='Configuración'
              >
                ⚙️
              </button>

              <button
                onClick={handleLogout}
                className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-lg transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className='text-sm sm:text-base'>
                  <span className='hidden sm:inline'>Cerrar Sesión</span>
                  <span className='sm:hidden'>Salir</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Stats Cards */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8'>
          <div
            className={`p-4 sm:p-6 rounded-xl shadow-sm transition-colors duration-500 ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } border`}
          >
            <div className='flex items-center'>
              <div className='p-2 sm:p-3 bg-blue-100 rounded-lg'>
                <span className='text-blue-600 text-lg sm:text-xl'>👥</span>
              </div>
              <div className='ml-3 sm:ml-4'>
                <p
                  className={`text-xs sm:text-sm font-medium transition-colors duration-500 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Total Pacientes
                </p>
                <p
                  className={`text-xl sm:text-2xl font-bold transition-colors duration-500 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {patientsLoading ? '...' : stats.totalPatients}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`p-4 sm:p-6 rounded-xl shadow-sm transition-colors duration-500 ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } border`}
          >
            <div className='flex items-center'>
              <div className='p-2 sm:p-3 bg-green-100 rounded-lg'>
                <span className='text-green-600 text-lg sm:text-xl'>📈</span>
              </div>
              <div className='ml-3 sm:ml-4'>
                <p
                  className={`text-xs sm:text-sm font-medium transition-colors duration-500 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Pacientes Activos
                </p>
                <p
                  className={`text-xl sm:text-2xl font-bold transition-colors duration-500 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {patientsLoading ? '...' : stats.activePatients}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`p-4 sm:p-6 rounded-xl shadow-sm transition-colors duration-500 ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } border`}
          >
            <div className='flex items-center'>
              <div className='p-2 sm:p-3 bg-yellow-100 rounded-lg'>
                <span className='text-yellow-600 text-lg sm:text-xl'>⚠️</span>
              </div>
              <div className='ml-3 sm:ml-4'>
                <p
                  className={`text-xs sm:text-sm font-medium transition-colors duration-500 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  En Riesgo
                </p>
                <p
                  className={`text-xl sm:text-2xl font-bold transition-colors duration-500 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {patientsLoading ? '...' : stats.riskPatients}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`p-4 sm:p-6 rounded-xl shadow-sm transition-colors duration-500 ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } border`}
          >
            <div className='flex items-center'>
              <div className='p-2 sm:p-3 bg-purple-100 rounded-lg'>
                <span className='text-purple-600 text-lg sm:text-xl'>😊</span>
              </div>
              <div className='ml-3 sm:ml-4'>
                <p
                  className={`text-xs sm:text-sm font-medium transition-colors duration-500 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Estado Promedio
                </p>
                <p
                  className={`text-xl sm:text-2xl font-bold transition-colors duration-500 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {patientsLoading ? '...' : stats.averageMood.toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className='grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6'>
          {/* Chat */}
          <div
            className={`p-4 sm:p-6 rounded-xl shadow-sm transition-colors duration-500 ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } border`}
          >
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0'>
              <div className='flex items-center space-x-3'>
                <div className='w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center'>
                  <span className='text-white text-sm sm:text-lg'>💬</span>
                </div>
                <h3
                  className={`text-lg sm:text-xl font-semibold transition-colors duration-500 ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}
                >
                  Chat con Pacientes
                </h3>
              </div>
              <button
                onClick={() => navigate('/psychologist-chat')}
                className='w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 text-sm sm:text-base'
              >
                Abrir Chat
              </button>
            </div>
            <p className={`text-sm sm:text-base transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Sistema de chat en tiempo real con tus pacientes
            </p>
          </div>

          {/* Appointments */}
          {/* Appointment Management */}
          <AppointmentManagement isDarkMode={isDarkMode} />

          {/* Medical History */}
          <MedicalHistory isDarkMode={isDarkMode} />
        </div>

        <div
          className={`mt-6 sm:mt-8 p-4 sm:p-6 rounded-xl shadow-sm transition-colors duration-500 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } border`}
        >
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0'>
            <div className='flex items-center space-x-3'>
              <div className='w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center'>
                <span className='text-white text-sm sm:text-lg'>👥</span>
              </div>
              <div>
                <h2
                  className={`text-base sm:text-lg lg:text-xl font-semibold transition-colors duration-500 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Mis Pacientes
                </h2>
                <p
                  className={`text-xs sm:text-sm transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  Gestiona el historial y comunicación con tus pacientes
                </p>
              </div>
            </div>
            <div className='flex items-center space-x-2'>
              <span
                className={`text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full ${
                  isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {patients.length} pacientes
              </span>
            </div>
          </div>

          {patientsLoading ? (
            <div className='text-center py-12'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4'></div>
              <p className={`text-sm transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Cargando pacientes...
              </p>
            </div>
          ) : patients.length === 0 ? (
            <div className='text-center py-12'>
              <div
                className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <span className='text-4xl'>👥</span>
              </div>
              <h3
                className={`text-lg font-medium mb-2 transition-colors duration-500 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                No tienes pacientes aún
              </h3>
              <p className={`text-sm transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Los pacientes aparecerán aquí cuando agenden citas contigo
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4'>
              {patients.map((patient) => (
                <div
                  key={patient.uid}
                  className={`p-3 sm:p-4 rounded-lg border transition-colors duration-500 hover:shadow-md ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                      : 'bg-gray-50 border-gray-200 hover:bg-white'
                  }`}
                >
                  <div className='flex items-start justify-between mb-3'>
                    <div className='flex items-center space-x-3'>
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          patient.riskLevel === 'high'
                            ? 'bg-red-100 text-red-600'
                            : patient.riskLevel === 'medium'
                            ? 'bg-yellow-100 text-yellow-600'
                            : 'bg-green-100 text-green-600'
                        }`}
                      >
                        <span className='text-sm font-medium'>
                          {(patient.displayName || 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3
                          className={`font-medium transition-colors duration-500 ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {patient.displayName || 'Usuario'}
                        </h3>
                        <p
                          className={`text-xs transition-colors duration-500 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          {patient.email}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        patient.riskLevel === 'high'
                          ? 'bg-red-100 text-red-600'
                          : patient.riskLevel === 'medium'
                          ? 'bg-yellow-100 text-yellow-600'
                          : 'bg-green-100 text-green-600'
                      }`}
                    >
                      {patient.riskLevel === 'high'
                        ? 'Alto Riesgo'
                        : patient.riskLevel === 'medium'
                        ? 'Riesgo Medio'
                        : 'Bajo Riesgo'}
                    </div>
                  </div>

                  <div className='space-y-2 mb-4'>
                    <div className='flex justify-between text-xs'>
                      <span
                        className={`transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                      >
                        Última actividad:
                      </span>
                      <span
                        className={`transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        {patient.lastSeen ? new Date(patient.lastSeen).toLocaleDateString() : 'Nunca'}
                      </span>
                    </div>
                    <div className='flex justify-between text-xs'>
                      <span
                        className={`transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                      >
                        Estado de ánimo promedio:
                      </span>
                      <span
                        className={`transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        {patient.averageMood ? `${patient.averageMood.toFixed(1)}/10` : 'N/A'}
                      </span>
                    </div>
                    <div className='flex justify-between text-xs'>
                      <span
                        className={`transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                      >
                        Registros de ánimo:
                      </span>
                      <span
                        className={`transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        {patient.moodLogCount || 0}
                      </span>
                    </div>
                  </div>

                  <div className='flex flex-col space-y-2'>
                    <button
                      onClick={() => handlePatientChat(patient)}
                      className={`w-full px-3 py-2 text-xs rounded-lg font-medium transition-colors duration-300 ${
                        isDarkMode
                          ? 'bg-purple-600 text-white hover:bg-purple-700'
                          : 'bg-purple-500 text-white hover:bg-purple-600'
                      }`}
                    >
                      💬 Chat
                    </button>
                    <button
                      onClick={() => handlePatientReport(patient)}
                      className={`w-full px-3 py-2 text-xs rounded-lg font-medium transition-colors duration-300 ${
                        isDarkMode
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      📄 Reporte Médico
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPsychologist;
