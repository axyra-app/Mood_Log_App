import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePatients } from '../hooks/usePatients';
import PsychologistNotifications from '../components/PsychologistNotifications';

const DashboardPsychologist: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
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
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
    }
    setIsLoaded(true);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
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
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${
        isDarkMode ? 'bg-gray-900' : 'bg-white'
      }`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

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
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">ML</span>
              </div>
              <div>
                <h1 className={`text-xl font-bold transition-colors duration-500 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Dashboard Psicólogo
                </h1>
                <p className={`text-sm transition-colors duration-500 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Bienvenido, {user.displayName}
                </p>
              </div>
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
              
              <button
                onClick={handleLogout}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className={`p-6 rounded-xl shadow-sm transition-colors duration-500 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } border`}>
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <span className="text-blue-600 text-xl">👥</span>
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium transition-colors duration-500 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Total Pacientes
                </p>
                <p className={`text-2xl font-bold transition-colors duration-500 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {patientsLoading ? '...' : stats.totalPatients}
                </p>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-xl shadow-sm transition-colors duration-500 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } border`}>
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <span className="text-green-600 text-xl">📈</span>
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium transition-colors duration-500 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Pacientes Activos
                </p>
                <p className={`text-2xl font-bold transition-colors duration-500 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {patientsLoading ? '...' : stats.activePatients}
                </p>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-xl shadow-sm transition-colors duration-500 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } border`}>
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <span className="text-yellow-600 text-xl">⚠️</span>
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium transition-colors duration-500 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  En Riesgo
                </p>
                <p className={`text-2xl font-bold transition-colors duration-500 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {patientsLoading ? '...' : stats.riskPatients}
                </p>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-xl shadow-sm transition-colors duration-500 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } border`}>
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <span className="text-purple-600 text-xl">😊</span>
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium transition-colors duration-500 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Estado Promedio
                </p>
                <p className={`text-2xl font-bold transition-colors duration-500 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {patientsLoading ? '...' : stats.averageMood.toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notifications */}
              {/* Notifications Panel */}
              <PsychologistNotifications isDarkMode={isDarkMode} />

          {/* Chat */}
          <div className={`p-6 rounded-xl shadow-sm transition-colors duration-500 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } border`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">💬</span>
                </div>
                <h3 className={`text-xl font-semibold transition-colors duration-500 ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  Chat con Pacientes
                </h3>
              </div>
              <button
                onClick={() => navigate('/psychologist-chat')}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
              >
                Abrir Chat
              </button>
            </div>
            <p className={`transition-colors duration-500 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Sistema de chat en tiempo real con tus pacientes
            </p>
          </div>

          {/* Appointments */}
          <div className={`p-6 rounded-xl shadow-sm transition-colors duration-500 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } border`}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">📅</span>
              </div>
              <h3 className={`text-xl font-semibold transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                Gestión de Citas
              </h3>
            </div>
            <p className={`transition-colors duration-500 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              El sistema de gestión de citas estará disponible próximamente
            </p>
          </div>

          {/* Medical History */}
          <div className={`p-6 rounded-xl shadow-sm transition-colors duration-500 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } border`}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">📋</span>
              </div>
              <h3 className={`text-xl font-semibold transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                Historial Médico
              </h3>
            </div>
            <p className={`transition-colors duration-500 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              El sistema de historial médico estará disponible próximamente
            </p>
          </div>
        </div>

        {/* Patients Section */}
        <div className={`mt-8 p-6 rounded-xl shadow-sm transition-colors duration-500 ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border`}>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">👥</span>
            </div>
            <h2 className={`text-xl font-semibold transition-colors duration-500 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Mis Pacientes
            </h2>
          </div>

          <div className="text-center py-8">
            <span className="text-6xl mb-4 block">👥</span>
            {patientsLoading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mb-4"></div>
                <p className={`text-lg transition-colors duration-500 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Cargando pacientes...
                </p>
              </div>
            ) : patients.length === 0 ? (
              <>
                <p className={`text-lg transition-colors duration-500 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  No tienes pacientes registrados
                </p>
                <p className={`text-sm transition-colors duration-500 ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  Los pacientes aparecerán aquí cuando se registren
                </p>
              </>
            ) : (
              <div className="space-y-4">
                {patients.map((patient) => (
                  <div
                    key={patient.uid}
                    className={`p-4 rounded-lg border transition-colors duration-500 ${
                      isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className={`font-medium transition-colors duration-500 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {patient.displayName || 'Usuario'}
                        </h3>
                        <p className={`text-sm transition-colors duration-500 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {patient.email}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm transition-colors duration-500 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Última actividad
                        </p>
                        <p className={`text-xs transition-colors duration-500 ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          {patient.lastSeen ? new Date(patient.lastSeen).toLocaleDateString() : 'Nunca'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPsychologist;