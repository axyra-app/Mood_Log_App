import {
  AlertTriangle,
  BarChart3,
  Bell,
  Calendar,
  MessageCircle,
  Phone,
  Search,
  Settings,
  TrendingUp,
  Users,
  LogOut,
  Moon,
  Sun,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CrisisAlertsPanel from '../components/psychologist/CrisisAlertsPanel';
import PatientStatsPanel from '../components/psychologist/PatientStatsPanel';
import PsychologistNotifications from '../components/PsychologistNotifications';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import { usePatients } from '../hooks/usePatients';
import Logo from '../components/Logo';

const DashboardPsychologist: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Hook de notificaciones
  const { notifications } = useNotifications();
  const unreadCount = notifications.filter(n => n.type === 'info').length;

  // Hook de pacientes reales
  const { 
    patients, 
    loading: patientsLoading, 
    getPatientsByRiskLevel, 
    getPatientsNeedingAttention, 
    getStatistics 
  } = usePatients();

  // Estadísticas reales
  const realStats = getStatistics();
  const highRiskPatients = getPatientsByRiskLevel('high');
  const mediumRiskPatients = getPatientsByRiskLevel('medium');
  const lowRiskPatients = getPatientsByRiskLevel('low');
  const patientsNeedingAttention = getPatientsNeedingAttention();

  // Usar datos reales
  const hasRealData = patients.length > 0;

  const stats = {
    totalPatients: realStats.totalPatients || 0,
    activePatients: realStats.activePatients || 0,
    averageMood: realStats.averageMood || 0,
    riskPatients: highRiskPatients.length,
  };

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Header */}
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg border-b ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Logo size="lg" />
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">MOOD LOG - Psicólogo</h1>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {isDarkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm sm:text-base"
              >
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
                <span className="sm:hidden">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className={`text-2xl sm:text-3xl font-bold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            ¡Hola, Dr. {user?.displayName || user?.email?.split('@')[0] || 'Psicólogo'}! 👋
          </h2>
          <p className={`text-base sm:text-lg ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Panel de control para gestión de pacientes y seguimiento terapéutico.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4 sm:p-6 rounded-xl shadow-lg border ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs sm:text-sm font-medium ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Total Pacientes
                </p>
                <p className={`text-xl sm:text-2xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {patientsLoading ? '...' : stats.totalPatients}
                </p>
              </div>
              <Users className={`w-6 h-6 sm:w-8 sm:h-8 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-500'
              }`} />
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4 sm:p-6 rounded-xl shadow-lg border ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs sm:text-sm font-medium ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Pacientes Activos
                </p>
                <p className={`text-xl sm:text-2xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {patientsLoading ? '...' : stats.activePatients}
                </p>
              </div>
              <TrendingUp className={`w-6 h-6 sm:w-8 sm:h-8 ${
                isDarkMode ? 'text-green-400' : 'text-green-500'
              }`} />
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4 sm:p-6 rounded-xl shadow-lg border ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs sm:text-sm font-medium ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Estado de Ánimo Promedio
                </p>
                <p className={`text-xl sm:text-2xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {patientsLoading ? '...' : stats.averageMood ? stats.averageMood.toFixed(1) : '-'}
                </p>
              </div>
              <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
                <Logo size="md" />
              </div>
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4 sm:p-6 rounded-xl shadow-lg border ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs sm:text-sm font-medium ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Pacientes en Riesgo
                </p>
                <p className={`text-xl sm:text-2xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {patientsLoading ? '...' : stats.riskPatients}
                </p>
              </div>
              <AlertTriangle className={`w-6 h-6 sm:w-8 sm:h-8 ${
                isDarkMode ? 'text-red-400' : 'text-red-500'
              }`} />
            </div>
          </div>
        </div>

        {/* Panels Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Crisis Alerts Panel */}
          <CrisisAlertsPanel psychologistId={user?.uid || ''} isDarkMode={isDarkMode} />

          {/* Patient Stats Panel */}
          <PatientStatsPanel psychologistId={user?.uid || ''} isDarkMode={isDarkMode} />

          {/* Notifications Panel */}
          <PsychologistNotifications />
        </div>

        {/* Patients Section */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg border ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        } p-4 sm:p-6`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
            <h3 className={`text-lg sm:text-xl font-semibold mb-2 sm:mb-0 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Lista de Pacientes
            </h3>
            
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  placeholder="Buscar pacientes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
            </div>
          </div>

          {patientsLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : !hasRealData ? (
            <div className="text-center py-8">
              <Users className={`w-16 h-16 mx-auto mb-4 ${
                isDarkMode ? 'text-gray-600' : 'text-gray-400'
              }`} />
              <h4 className={`text-lg font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                No tienes pacientes asignados
              </h4>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Los pacientes aparecerán aquí cuando se registren y te asignen como su psicólogo.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        patient.riskLevel === 'high' ? 'bg-red-100 text-red-600' :
                        patient.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className={`font-medium ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {patient.name || 'Paciente'}
                        </h4>
                        <p className={`text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {patient.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        patient.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                        patient.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {patient.riskLevel === 'high' ? 'Alto Riesgo' :
                         patient.riskLevel === 'medium' ? 'Riesgo Medio' :
                         'Bajo Riesgo'}
                      </span>
                      <button
                        onClick={() => navigate(`/chat/psychologist/${user?.uid}`)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardPsychologist;