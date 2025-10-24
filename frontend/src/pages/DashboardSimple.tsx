import { BarChart3, BookOpen, Calendar, LogOut, Menu, Moon, Sun, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppointmentSection from '../components/AppointmentSection';
import LateralSidebar from '../components/LateralSidebar';
import Logo from '../components/Logo';
import MoodHistoryPanel from '../components/MoodHistoryPanel';
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  // Removed secondaryModules array - now handled by sidebar

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
              <Logo size='sm' showText={false} />
              <h1 className={`text-lg sm:text-xl lg:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                MOOD LOG
              </h1>
            </div>

            <div className='flex items-center space-x-2 sm:space-x-4'>
              {/* Notificaciones */}
              <NotificationsPanel isDarkMode={isDarkMode} />

              {/* Botón del menú */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-2 rounded-lg transition-colors shadow-md ${
                  isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
                } ${isMenuOpen ? 'ring-2 ring-purple-500' : ''}`}
                title='Más herramientas'
              >
                {isMenuOpen ? <X className='w-4 h-4 sm:w-5 sm:h-5' /> : <Menu className='w-4 h-4 sm:w-5 sm:h-5' />}
              </button>

              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
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

      {/* Nuevo Lateral Sidebar */}
      <LateralSidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} isDarkMode={isDarkMode} />

      {/* Menú desktop (solo visible en pantallas grandes) - REMOVIDO */}

      {/* Main Content */}
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8'>
        {/* Welcome Section */}
        <div className='mb-6 sm:mb-8'>
          <h2 className={`text-2xl sm:text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            ¡Hola, {user?.displayName || user?.email?.split('@')[0] || 'Usuario'}! 👋
          </h2>
          <p className={`text-base sm:text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            ¿Cómo te sientes hoy? Reflexiona sobre tu día y mantén un seguimiento de tu bienestar emocional.
          </p>
        </div>

        {/* Journal Section - Destacado como función principal */}
        <div
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg border ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          } mb-8`}
        >
          <div className='p-6 border-b border-gray-200 dark:border-gray-700'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-3'>
                <div className='w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center'>
                  <BookOpen className='w-6 h-6 text-white' />
                </div>
                <div>
                  <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Mi Diario Personal
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Reflexiona sobre tu día y documenta tus pensamientos
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/journal')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isDarkMode
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                }`}
              >
                Escribir Entrada
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
                  className='mt-4 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl'
                >
                  ✍️ Escribir en el Diario
                </button>
              </div>
            ) : (
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                {journalEntries.slice(0, 6).map((entry, index) => (
                  <div
                    key={entry.id || index}
                    className={`p-4 rounded-lg border cursor-pointer hover:shadow-md transition-all duration-200 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => navigate('/journal')}
                  >
                    <div className='flex items-start justify-between mb-2'>
                      <h4 className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'} truncate`}>
                        {entry.title || `Entrada ${index + 1}`}
                      </h4>
                      <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {entry.date
                          ? entry.date.toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                            })
                          : 'Hoy'}
                      </span>
                    </div>

                    <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2 line-clamp-2`}>
                      {entry.content
                        ? entry.content.substring(0, 80) + (entry.content.length > 80 ? '...' : '')
                        : 'Sin contenido'}
                    </p>

                    <div className='flex items-center justify-between'>
                      <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {entry.date
                          ? entry.date.toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Ahora'}
                      </span>
                      <div className='flex items-center space-x-1'>
                        {entry.mood && (
                          <span className='text-xs'>{entry.mood <= 2 ? '😢' : entry.mood <= 3 ? '😐' : '😊'}</span>
                        )}
                        <span className={`text-xs ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                          Ver más →
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {journalEntries.length > 6 && (
                  <div className={`col-span-full text-center pt-4`}>
                    <button
                      onClick={() => navigate('/journal')}
                      className={`text-sm font-medium ${
                        isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'
                      }`}
                    >
                      Ver todas las entradas ({journalEntries.length})
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8'>
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
                <div
                  className={`w-6 h-6 rounded-full ${
                    isDarkMode ? 'bg-purple-500' : 'bg-purple-100'
                  } flex items-center justify-center`}
                >
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
          <AppointmentSection isDarkMode={isDarkMode} />
        </div>

        {/* Recent Mood Logs */}
        <div
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg border ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}
        >
          <div className='p-6'>
            <MoodHistoryPanel isDarkMode={isDarkMode} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardSimple;
