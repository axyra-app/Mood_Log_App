import { BarChart3, Calendar, LogOut, MessageCircle, Moon, Settings, Sun } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useMood } from '../hooks/useMood';

const DashboardSimple: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const {
    moodLogs,
    loading,
    error: moodError,
    statistics,
    createMoodLog,
    refreshMoodLogs,
    refreshStatistics,
  } = useMood();

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentMood, setCurrentMood] = useState<number | null>(null);
  const [moodLoading, setMoodLoading] = useState(false);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  const moodEmojis = ['😢', '😕', '😐', '🙂', '😊'];
  const moodLabels = ['Muy mal', 'Mal', 'Regular', 'Bien', 'Excelente'];

  useEffect(() => {
    setIsLoaded(true);
    loadUserData();
    checkFirstTimeToday();
  }, []);

  useEffect(() => {
    if (moodLogs.length > 0) {
      updateRecentActivities();
    }
  }, [moodLogs]);

  const checkFirstTimeToday = () => {
    if (!user) return;

    const today = new Date().toDateString();
    const userKey = `moodLogs_${user.uid}`;
    const existingData = JSON.parse(localStorage.getItem(userKey) || '{}');

    // Si no hay registro para hoy, redirigir a MoodFlow
    if (!existingData[today]) {
      setTimeout(() => {
        navigate('/mood-flow');
      }, 1000);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Hace menos de 1 hora';
    if (diffInHours < 24) return `Hace ${diffInHours} horas`;
    return `Hace ${Math.floor(diffInHours / 24)} días`;
  };

  const loadUserData = async () => {
    try {
      await refreshMoodLogs();
      await refreshStatistics();
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const updateRecentActivities = () => {
    const activities = moodLogs.slice(0, 5).map((log) => ({
      id: log.id,
      type: 'mood',
      emoji: moodEmojis[log.mood - 1],
      label: moodLabels[log.mood - 1],
      time: getTimeAgo(log.timestamp.toDate()),
      description: log.description,
    }));
    setRecentActivities(activities);
  };

  const handleMoodClick = async (mood: number) => {
    if (moodLoading) return;

    setMoodLoading(true);
    try {
      await createMoodLog({
        mood,
        description: `Estado de ánimo: ${moodLabels[mood - 1]}`,
        activities: [],
        sleep: 8,
        stress: 3,
        energy: 4,
      });
      setCurrentMood(mood);
      await refreshMoodLogs();
      await refreshStatistics();
      updateRecentActivities();
    } catch (error) {
      console.error('Error creating mood log:', error);
    } finally {
      setMoodLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading || !isLoaded) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className='flex flex-col items-center space-y-4'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600'></div>
          <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Cargando dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}
      >
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex items-center'>
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>🧠 Mood Log</h1>
            </div>

            <div className='flex items-center space-x-4'>
              {/* Notificaciones */}
              <div className="relative">
                <button className="p-2 text-gray-600 hover:text-gray-900">
                  <MessageCircle className="h-6 w-6" />
                </button>
              </div>

              {/* Modo oscuro */}
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg ${
                  isDarkMode ? 'text-yellow-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {isDarkMode ? <Sun className='h-5 w-5' /> : <Moon className='h-5 w-5' />}
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className={`p-2 rounded-lg ${
                  isDarkMode ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-gray-100'
                }`}
              >
                <LogOut className='h-5 w-5' />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Welcome Section */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-6 mb-8`}>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
            ¡Hola, {user?.displayName || user?.email}!
          </h2>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            ¿Cómo te sientes hoy? Registra tu estado de ánimo para mantener un seguimiento de tu bienestar emocional.
          </p>
        </div>

        {/* Quick Mood Selection */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-6 mb-8`}>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
            Estado de ánimo actual
          </h3>
          <div className='flex space-x-4'>
            {moodEmojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => handleMoodClick(index + 1)}
                disabled={moodLoading}
                className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                  currentMood === index + 1
                    ? 'border-purple-500 bg-purple-50'
                    : isDarkMode
                    ? 'border-gray-600 hover:border-gray-500 hover:bg-gray-700'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                } ${moodLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span className='text-3xl mb-2'>{emoji}</span>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {moodLabels[index]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Statistics */}
        {statistics && (
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-6 mb-8`}>
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
              Estadísticas
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className='flex items-center'>
                  <BarChart3 className={`h-8 w-8 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'} mr-3`} />
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Registros totales
                    </p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {statistics.totalLogs}
                    </p>
                  </div>
                </div>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className='flex items-center'>
                  <Calendar className={`h-8 w-8 ${isDarkMode ? 'text-green-400' : 'text-green-600'} mr-3`} />
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Promedio semanal
                    </p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {statistics.averageMood?.toFixed(1) || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className='flex items-center'>
                  <MessageCircle className={`h-8 w-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} mr-3`} />
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Racha actual
                    </p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {statistics.currentStreak || 0} días
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activities */}
        {recentActivities.length > 0 && (
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-6 mb-8`}>
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
              Actividades recientes
            </h3>
            <div className='space-y-3'>
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className={`flex items-center p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
                >
                  <span className='text-2xl mr-3'>{activity.emoji}</span>
                  <div className='flex-1'>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{activity.label}</p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {activity.description}
                    </p>
                  </div>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          <Link
            to='/mood-flow'
            className={`${
              isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
            } rounded-xl shadow-sm p-6 transition-colors border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
          >
            <div className='flex items-center mb-4'>
              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-purple-900' : 'bg-purple-100'}`}>
                <span className='text-2xl'>📝</span>
              </div>
            </div>
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
              Registrar Estado
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Registra cómo te sientes hoy</p>
          </Link>

          <Link
            to='/statistics'
            className={`${
              isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
            } rounded-xl shadow-sm p-6 transition-colors border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
          >
            <div className='flex items-center mb-4'>
              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
                <BarChart3 className={`h-6 w-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
            </div>
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
              Estadísticas
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Ve tus tendencias y progreso</p>
          </Link>

          <Link
            to='/chat'
            className={`${
              isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
            } rounded-xl shadow-sm p-6 transition-colors border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
          >
            <div className='flex items-center mb-4'>
              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-green-900' : 'bg-green-100'}`}>
                <MessageCircle className={`h-6 w-6 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
              </div>
            </div>
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Chat</h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Habla con psicólogos</p>
          </Link>

          <Link
            to='/settings'
            className={`${
              isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
            } rounded-xl shadow-sm p-6 transition-colors border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
          >
            <div className='flex items-center mb-4'>
              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <Settings className={`h-6 w-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              </div>
            </div>
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
              Configuración
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Personaliza tu experiencia</p>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default DashboardSimple;
