import { BarChart3, Calendar, LogOut, Moon, Sun } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppointmentSection from '../components/AppointmentSection';
import Logo from '../components/Logo';
import NotificationsPanel from '../components/NotificationsPanel';
import { useAuth } from '../contexts/AuthContext';
import { useJournal } from '../hooks/useJournal';
import { useMood } from '../hooks/useMood';

const DashboardSimple: React.FC = () => {
  // Dashboard con logo personalizado
  const { user, logout } = useAuth();
  const { moodLogs, loading: moodLoading, getMoodStreak, getAverageMood } = useMood();
  const { entries: journalEntries, getJournalStats } = useJournal(user?.uid || '');
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Calcular estadísticas reales
  const weeklyLogs = moodLogs.filter((log) => {
    const logDate =
      log.createdAt && typeof log.createdAt.toDate === 'function' ? log.createdAt.toDate() : new Date(log.createdAt);
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
      title: 'Mi Diario',
      description: 'Reflexiona sobre tu día',
      icon: '📖',
      color: 'bg-gradient-to-r from-indigo-500 to-purple-500',
      action: () => navigate('/journal'),
    },
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
      title: 'Reportes Avanzados',
      description: 'Análisis detallados',
      icon: '📋',
      color: 'bg-gradient-to-r from-yellow-500 to-orange-500',
      action: () => navigate('/reports'),
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
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 via-pink-500 to-red-500'>
        <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-white'></div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      }`}
    >
      {/* Header */}
      <header
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        } sticky top-0 z-40`}
      >
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-3 sm:py-4'>
            <div className='flex items-center space-x-2 sm:space-x-3'>
              <div className='w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md'>
                <span className='text-white text-lg sm:text-xl'>🧠</span>
              </div>
              <h1 className={`text-lg sm:text-xl lg:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                MOOD LOG
              </h1>
            </div>

            <div className='flex items-center space-x-2 sm:space-x-4'>
              {/* Notificaciones */}
              <NotificationsPanel isDarkMode={isDarkMode} />
              
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
                }`}
              >
                {isDarkMode ? <Sun className='w-4 h-4 sm:w-5 sm:h-5' /> : <Moon className='w-4 h-4 sm:w-5 sm:h-5' />}
              </button>

              <button
                onClick={handleLogout}
                className='flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm sm:text-base shadow-md'
              >
                <LogOut className='w-3 h-3 sm:w-4 sm:h-4' />
                <span className='hidden sm:inline'>Cerrar Sesión</span>
                <span className='sm:hidden'>Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8'>
        {/* Welcome Section */}
        <div className='mb-6 sm:mb-8'>
          <h2 className={`text-2xl sm:text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            ¡Hola, {user?.displayName || user?.email?.split('@')[0] || 'Usuario'}! 👋
          </h2>
          <p className={`text-base sm:text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            ¿Cómo te sientes hoy? Registra tu estado de ánimo y mantén un seguimiento de tu bienestar emocional.
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8'>
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className={`${action.color} p-4 sm:p-6 rounded-xl text-white hover:scale-105 transition-transform duration-200 shadow-lg`}
            >
              <div className='text-3xl sm:text-4xl mb-2 sm:mb-3'>{action.icon}</div>
              <h3 className='text-base sm:text-lg font-semibold mb-1 sm:mb-2'>{action.title}</h3>
              <p className='text-xs sm:text-sm opacity-90'>{action.description}</p>
            </button>
          ))}
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8'>
          <div
            className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg border ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}
          >
            <div className='flex items-center justify-between'>
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Registros esta semana
                </p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {moodLoading ? '...' : weeklyLogs.length}
                </p>
              </div>
              <BarChart3 className={`w-8 h-8 ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`} />
            </div>
          </div>

          <div
            className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg border ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}
          >
            <div className='flex items-center justify-between'>
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Estado de ánimo promedio
                </p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {moodLoading ? '...' : averageMood ? averageMood.toFixed(1) : '-'}
                </p>
              </div>
              <div className='w-8 h-8 flex items-center justify-center'>
                <div className={`w-6 h-6 rounded-full ${isDarkMode ? 'bg-purple-500' : 'bg-purple-100'} flex items-center justify-center`}>
                  <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-purple-600'}`}>📊</span>
                </div>
              </div>
            </div>
          </div>

          <div
            className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg border ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}
          >
            <div className='flex items-center justify-between'>
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Días consecutivos
                </p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {moodLoading ? '...' : streak}
                </p>
              </div>
              <Calendar className={`w-8 h-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
            </div>
          </div>
        </div>

        {/* Appointment Section */}
        <div className='mb-8'>
          <AppointmentSection />
        </div>

        {/* Recent Activity - Split into Journal and Mood Logs */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Recent Journal Entries */}
          <div
            className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg border ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}
          >
            <div className='p-6 border-b border-gray-200 dark:border-gray-700'>
              <div className='flex items-center justify-between'>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  📖 Entradas del Diario
                </h3>
                <button
                  onClick={() => navigate('/journal')}
                  className={`px-3 py-1 text-sm rounded-lg font-medium ${
                    isDarkMode
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  }`}
                >
                  Ver todas
                </button>
              </div>
            </div>
            <div className='p-6'>
              {journalEntries.length === 0 ? (
                <div className='text-center py-8'>
                  <div className='text-6xl mb-4'>📝</div>
                  <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Aún no tienes entradas en tu diario
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    Comienza escribiendo sobre tu día
                  </p>
                  <button
                    onClick={() => navigate('/journal')}
                    className='mt-4 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:scale-105 transition-transform duration-200'
                  >
                    Escribir en el Diario
                  </button>
                </div>
              ) : (
                <div className='space-y-4'>
                  {journalEntries.slice(0, 3).map((entry, index) => (
                    <div
                      key={entry.id || index}
                      className={`p-4 rounded-lg border ${
                        isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className='flex items-start justify-between'>
                        <div className='flex-1'>
                          <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {entry.title}
                          </h4>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                            {entry.date.toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mt-2 line-clamp-2`}>
                            {entry.content.substring(0, 100)}...
                          </p>
                          {entry.tags.length > 0 && (
                            <div className='flex flex-wrap gap-1 mt-2'>
                              {entry.tags.slice(0, 3).map((tag, tagIndex) => (
                                <span
                                  key={tagIndex}
                                  className={`px-2 py-1 text-xs rounded-full ${
                                    isDarkMode ? 'bg-purple-600 text-purple-100' : 'bg-purple-100 text-purple-700'
                                  }`}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        {entry.mood && (
                          <div className='ml-4 text-center'>
                            <div className='text-2xl'>
                              {entry.mood <= 2 ? '😢' : entry.mood <= 3 ? '😐' : entry.mood <= 4 ? '🙂' : '😊'}
                            </div>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {entry.mood}/10
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Mood Logs */}
          <div
            className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg border ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}
          >
            <div className='p-6 border-b border-gray-200 dark:border-gray-700'>
              <div className='flex items-center justify-between'>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  😊 Registros de Estado de Ánimo
                </h3>
                <button
                  onClick={() => navigate('/statistics')}
                  className={`px-3 py-1 text-sm rounded-lg font-medium ${
                    isDarkMode
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  Ver todas
                </button>
              </div>
            </div>
            <div className='p-6'>
              {moodLoading ? (
                <div className='text-center py-8'>
                  <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4'></div>
                  <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Cargando registros...</p>
                </div>
              ) : moodLogs.length === 0 ? (
                <div className='text-center py-8'>
                  <div className='text-6xl mb-4'>😊</div>
                  <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Aún no tienes registros de estado de ánimo
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    Comienza registrando cómo te sientes hoy
                  </p>
                  <button
                    onClick={() => navigate('/mood-flow')}
                    className='mt-4 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:scale-105 transition-transform duration-200'
                  >
                    Registrar Estado de Ánimo
                  </button>
                </div>
              ) : (
                <div className='space-y-4'>
                  {moodLogs.slice(0, 3).map((log, index) => {
                    const logDate =
                      log.createdAt && typeof log.createdAt.toDate === 'function'
                        ? log.createdAt.toDate()
                        : new Date(log.createdAt);
                    const moodEmojis = ['😢', '😕', '😐', '🙂', '😊'];
                    const moodLabels = ['Muy mal', 'Mal', 'Regular', 'Bien', 'Excelente'];

                    return (
                      <div
                        key={log.id || index}
                        className={`p-4 rounded-lg border ${
                          isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center space-x-3'>
                            <span className='text-2xl'>{moodEmojis[log.mood - 1]}</span>
                            <div>
                              <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {moodLabels[log.mood - 1]} ({log.mood}/5)
                              </p>
                              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {logDate.toLocaleDateString('es-ES', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </div>
                          <div className='text-right'>
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
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardSimple;
