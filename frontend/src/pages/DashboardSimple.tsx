import { BarChart3, Calendar, LogOut, MessageCircle, Moon, Settings, Sun } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useMood } from '../hooks/useMood';
import AppointmentSection from '../components/AppointmentSection';

const DashboardSimple: React.FC = () => {
  // Versión actualizada con corrección de importación Heart
  const { user, logout } = useAuth();
  const { moodLogs, loading: moodLoading, getMoodStreak, getAverageMood } = useMood();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Calcular estadísticas reales
  const weeklyLogs = moodLogs.filter(log => {
    const logDate = log.createdAt && typeof log.createdAt.toDate === 'function' 
      ? log.createdAt.toDate() 
      : new Date(log.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return logDate >= weekAgo;
  });

  const averageMood = getAverageMood(7);
  const streak = getMoodStreak();

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

  const quickActions = [
    {
      title: 'Registrar Estado de Ánimo',
      description: 'Cómo te sientes hoy',
      icon: '😊',
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      action: () => navigate('/mood-flow'),
    },
    {
      title: 'Ver Estadísticas',
      description: 'Tu progreso emocional',
      icon: '📊',
      color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      action: () => navigate('/statistics'),
    },
    {
      title: 'Chat de Apoyo',
      description: 'IA o psicólogo real',
      icon: '💬',
      color: 'bg-gradient-to-r from-green-500 to-emerald-500',
      action: () => navigate('/chat'),
    },
    {
      title: 'Configuración',
      description: 'Personaliza tu experiencia',
      icon: '⚙️',
      color: 'bg-gradient-to-r from-orange-500 to-red-500',
      action: () => navigate('/settings'),
    },
  ];

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
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">🧠</span>
              </div>
              <h1 className="text-2xl font-bold">MOOD LOG</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className={`text-3xl font-bold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            ¡Hola, {user?.displayName || user?.email?.split('@')[0] || 'Usuario'}! 👋
          </h2>
          <p className={`text-lg ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            ¿Cómo te sientes hoy? Registra tu estado de ánimo y mantén un seguimiento de tu bienestar emocional.
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className={`${action.color} p-6 rounded-xl text-white hover:scale-105 transition-transform duration-200 shadow-lg`}
            >
              <div className="text-4xl mb-3">{action.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{action.title}</h3>
              <p className="text-sm opacity-90">{action.description}</p>
            </button>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg border ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Registros esta semana
                </p>
                <p className={`text-2xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {moodLoading ? '...' : weeklyLogs.length}
                </p>
              </div>
              <BarChart3 className={`w-8 h-8 ${
                isDarkMode ? 'text-purple-400' : 'text-purple-500'
              }`} />
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg border ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Estado de ánimo promedio
                </p>
                <p className={`text-2xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {moodLoading ? '...' : averageMood ? averageMood.toFixed(1) : '-'}
                </p>
              </div>
              <div className={`w-8 h-8 flex items-center justify-center text-2xl ${
                isDarkMode ? 'text-pink-400' : 'text-pink-500'
              }`}>
                ❤️
              </div>
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg border ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Días consecutivos
                </p>
                <p className={`text-2xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {moodLoading ? '...' : streak}
                </p>
              </div>
              <Calendar className={`w-8 h-8 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-500'
              }`} />
            </div>
          </div>
        </div>

        {/* Appointment Section */}
        <div className="mb-8">
          <AppointmentSection />
        </div>

        {/* Recent Activity */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg border ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className={`text-lg font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Actividad Reciente
            </h3>
          </div>
          <div className="p-6">
            {moodLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Cargando actividad...
                </p>
              </div>
            ) : moodLogs.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">📝</div>
                <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Aún no tienes registros de estado de ánimo
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  Comienza registrando cómo te sientes hoy
                </p>
                <button
                  onClick={() => navigate('/mood-flow')}
                  className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:scale-105 transition-transform duration-200"
                >
                  Registrar Estado de Ánimo
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {moodLogs.slice(0, 5).map((log, index) => {
                  const logDate = log.createdAt && typeof log.createdAt.toDate === 'function' 
                    ? log.createdAt.toDate() 
                    : new Date(log.createdAt);
                  const moodEmojis = ['😢', '😕', '😐', '🙂', '😊'];
                  const moodLabels = ['Muy mal', 'Mal', 'Regular', 'Bien', 'Excelente'];
                  
                  return (
                    <div key={log.id || index} className={`p-4 rounded-lg border ${
                      isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{moodEmojis[log.mood - 1]}</span>
                          <div>
                            <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {moodLabels[log.mood - 1]} ({log.mood}/5)
                            </p>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {logDate.toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Energía: {log.energy}/10
                          </p>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Estrés: {log.stress}/10
                          </p>
                        </div>
                      </div>
                      {log.notes && (
                        <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          "{log.notes}"
                        </p>
                      )}
                    </div>
                  );
                })}
                
                {moodLogs.length > 5 && (
                  <div className="text-center pt-4">
                    <button
                      onClick={() => navigate('/statistics')}
                      className={`px-4 py-2 rounded-lg font-medium ${
                        isDarkMode 
                          ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Ver todos los registros ({moodLogs.length})
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardSimple;
