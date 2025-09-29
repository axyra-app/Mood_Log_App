import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useMood } from '../hooks/useMood';
import {
  getNotifications,
} from '../services/notificationService';

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

  // Si el usuario es psicólogo, mostrar el dashboard de psicólogo
  if (user?.role === 'psychologist') {
    return <DashboardPsychologist />;
  }

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentMood, setCurrentMood] = useState<number | null>(null);
  const [moodLoading, setMoodLoading] = useState(false);
  // statistics ya viene del hook useMood
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showComingSoonAlert, setShowComingSoonAlert] = useState(false);
  const [comingSoonMessage, setComingSoonMessage] = useState('');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [showReminderManager, setShowReminderManager] = useState(false);
  const [notificationData, setNotificationData] = useState({
    type: 'success' as 'success' | 'error' | 'info',
    title: '',
    message: '',
    icon: '',
  });

  const moodEmojis = ['😢', '😕', '😐', '🙂', '😊'];
  const moodLabels = ['Muy mal', 'Mal', 'Regular', 'Bien', 'Excelente'];

  useEffect(() => {
    setIsLoaded(true);
    loadUserData();
    checkFirstTimeToday();
  }, []);

  useEffect(() => {
    if (moodLogs.length > 0) {
      // Las estadísticas ya vienen del hook useMood
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
      }, 1000); // Pequeño delay para que se vea el dashboard brevemente
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
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Ayer';
    return `Hace ${diffInDays} días`;
  };

  const showNotification = (type: 'success' | 'error' | 'info', title: string, message: string, icon?: string) => {
    setNotificationData({ type, title, message, icon: icon || '' });
    // Mostrar notificación simple
  };

  const loadUserData = async () => {
    try {
      if (!user) return;

      // Las estadísticas ya vienen del hook useMood

      // Cargar notificaciones reales
      try {
        const realNotifications = await getNotifications(user.uid, 10);
        setNotifications(
          realNotifications.map((notif) => ({
            id: notif.id,
            title: notif.title,
            message: notif.message,
            type: notif.type,
            timestamp:
              notif.createdAt && typeof notif.createdAt.toDate === 'function' ? notif.createdAt.toDate() : new Date(),
            isRead: notif.read,
          }))
        );
      } catch (error) {
        console.error('Error loading notifications:', error);
        // Fallback a notificaciones mock si hay error
        const mockNotifications = [
          {
            id: 'welcome-1',
            title: '¡Bienvenido!',
            message: 'Comienza registrando tu primer estado de ánimo para obtener análisis personalizados con IA.',
            type: 'info',
            timestamp: new Date(),
            isRead: false,
          },
        ];
        setNotifications(mockNotifications);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const updateRecentActivities = () => {
    const activities = moodLogs.slice(0, 3).map((log) => {
      const logDate = log.createdAt && typeof log.createdAt.toDate === 'function' ? log.createdAt.toDate() : new Date();
      return {
        id: log.id,
        action: 'Registraste tu estado de ánimo',
        time: getTimeAgo(logDate),
        mood: moodEmojis[log.mood - 1],
        details: log.notes ? log.notes.substring(0, 50) + '...' : null,
      };
    });
    setRecentActivities(activities);
  };

  const handleMoodSelect = async (mood: number) => {
    setCurrentMood(mood);
    setMoodLoading(true);

    try {
      // Usar el nuevo sistema de IA para guardar el mood
      const moodLogId = await createMoodLog({
        mood: mood,
        energy: Math.floor(Math.random() * 10) + 1,
        stress: Math.floor(Math.random() * 10) + 1,
        sleep: Math.floor(Math.random() * 10) + 1,
        notes: `Mood registrado: ${moodLabels[mood - 1]}`,
        activities: ['registro_mood'],
        emotions: [moodLabels[mood - 1].toLowerCase()],
      });

      // Crear notificación real en Firestore
      try {
        // Notificación de mood log creado

        // Verificar si es un logro (cada 5 moods)
        const totalLogs = moodLogs.length + 1;
        if (totalLogs % 5 === 0) {
          // Logro alcanzado: {totalLogs} registros de ánimo
        }

        // Recargar notificaciones
        const updatedNotifications = await getNotifications(user.uid, 10);
        setNotifications(
          updatedNotifications.map((notif) => ({
            id: notif.id,
            title: notif.title,
            message: notif.message,
            type: notif.type,
            timestamp: notif.createdAt?.toDate ? notif.createdAt.toDate() : new Date(),
            isRead: notif.read,
          }))
        );
      } catch (error) {
        console.error('Error creating notification:', error);
      }

      // Mostrar mensaje de éxito
      showNotification(
        'success',
        '¡Mood Guardado!',
        `Tu estado de ánimo ha sido registrado exitosamente. Revisa tu dashboard para ver el análisis.`,
        '😊'
      );
    } catch (error) {
      console.error('Error saving mood:', error);
      showNotification(
        'error',
        'Error al Guardar',
        'No se pudo guardar tu estado de ánimo. Por favor, inténtalo de nuevo.',
        '😔'
      );
    } finally {
      setMoodLoading(false);
    }
  };

  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, isRead: true } : notification))
    );
  };

  const handleDismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'chat':
        setComingSoonMessage('Próximamente: Chat con IA especializada en bienestar emocional');
        setShowComingSoonAlert(true);
        break;
      case 'psychologists':
        setComingSoonMessage('Próximamente: Conecta con psicólogos profesionales certificados');
        setShowComingSoonAlert(true);
        break;
      case 'statistics':
        setComingSoonMessage('Próximamente: Estadísticas avanzadas y análisis detallados');
        setShowComingSoonAlert(true);
        break;
      case 'goals':
        setComingSoonMessage('Próximamente: Objetivos de bienestar con seguimiento inteligente');
        setShowComingSoonAlert(true);
        break;
      case 'reminders':
        setShowReminderManager(true);
        break;
    }
  };

  if (!isLoaded) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${
          isDarkMode ? 'bg-gray-900' : 'bg-white'
        }`}
      >
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600'></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>

      {/* Header */}
      <header
        className={`py-6 px-6 transition-colors duration-500 ${
          isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'
        } backdrop-blur-lg border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
      >
        <div className='max-w-7xl mx-auto flex items-center justify-between'>
          <Link to='/' className='flex items-center space-x-3 group'>
            <div className='w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300'>
              <span className='text-white font-black text-lg'>💜</span>
            </div>
            <span
              className={`text-2xl font-black transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              MOOD LOG
            </span>
          </Link>

          <div className='flex items-center space-x-4'>
            {/* Notificaciones */}
            <div className="relative">
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <Bell className="h-6 w-6" />
              </button>
            </div>

            <button
              onClick={() => setShowConfigModal(true)}
              className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 ${
                isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              ⚙️
            </button>
            <button
              onClick={toggleDarkMode}
              className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 ${
                isDarkMode
                  ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <button
              onClick={logout}
              className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 ${
                isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className='max-w-7xl mx-auto px-6 py-8'>
        {/* Welcome Section */}
        <div className='mb-8'>
          <h2
            className={`text-4xl font-black mb-4 transition-colors duration-500 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            ¡HOLA {user?.username || user?.displayName || user?.email?.split('@')[0]?.toUpperCase() || 'USUARIO'}! 👋
          </h2>
          <p className={`text-xl transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Tu bienestar emocional es importante. ¿Cómo te sientes hoy?
          </p>

          {/* Today's Mood Status */}
          {statistics && (
            <div
              className={`mt-6 p-6 rounded-2xl border-2 transition-all duration-300 ${
                statistics.todayMood
                  ? isDarkMode
                    ? 'bg-green-900/20 border-green-500'
                    : 'bg-green-50 border-green-200'
                  : isDarkMode
                  ? 'bg-orange-900/20 border-orange-500'
                  : 'bg-orange-50 border-orange-200'
              }`}
            >
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-4'>
                  <div className='text-4xl'>
                    {statistics.todayMood ? moodEmojis[statistics.todayMood.mood - 1] : '⏰'}
                  </div>
                  <div>
                    <h3
                      className={`text-2xl font-black transition-colors duration-500 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {statistics.todayMood
                        ? `Mood de hoy: ${moodLabels[statistics.todayMood.mood - 1]}`
                        : 'Aún no has registrado tu mood de hoy'}
                    </h3>
                    <p
                      className={`text-lg transition-colors duration-500 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}
                    >
                      {statistics.todayMood
                        ? `Registrado a las ${new Date(statistics.todayMood.timestamp).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}`
                        : 'Es importante registrar cómo te sientes cada día'}
                    </p>
                  </div>
                </div>
                <Link
                  to='/mood-flow'
                  className={`px-8 py-4 rounded-xl font-black text-lg uppercase tracking-wider transition-all duration-300 transform hover:scale-105 ${
                    statistics.todayMood
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-2xl hover:shadow-green-500/50'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-2xl hover:shadow-purple-500/50'
                  }`}
                >
                  {statistics.todayMood ? 'Actualizar Mood' : 'Registrar Mood'}
                </Link>
              </div>
            </div>
          )}

          {/* Estadísticas rápidas */}
          {statistics && statistics.totalLogs > 0 && (
            <div className='mt-6 grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div
                className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                  isDarkMode
                    ? 'bg-gray-800/50 border-gray-700 hover:border-purple-500'
                    : 'bg-white/50 border-gray-200 hover:border-purple-500'
                }`}
              >
                <div className='flex items-center space-x-3'>
                  <div className='text-3xl'>📊</div>
                  <div>
                    <p
                      className={`text-sm transition-colors duration-500 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      Mood Promedio
                    </p>
                    <p
                      className={`text-2xl font-black transition-colors duration-500 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {statistics.averageMood}/5
                    </p>
                  </div>
                </div>
              </div>
              <div
                className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                  isDarkMode
                    ? 'bg-gray-800/50 border-gray-700 hover:border-purple-500'
                    : 'bg-white/50 border-gray-200 hover:border-purple-500'
                }`}
              >
                <div className='flex items-center space-x-3'>
                  <div className='text-3xl'>📝</div>
                  <div>
                    <p
                      className={`text-sm transition-colors duration-500 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      Total Registros
                    </p>
                    <p
                      className={`text-2xl font-black transition-colors duration-500 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {statistics.totalLogs}
                    </p>
                  </div>
                </div>
              </div>
              <div
                className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                  isDarkMode
                    ? 'bg-gray-800/50 border-gray-700 hover:border-purple-500'
                    : 'bg-white/50 border-gray-200 hover:border-purple-500'
                }`}
              >
                <div className='flex items-center space-x-3'>
                  <div className='text-3xl'>
                    {statistics.weeklyTrend === 'improving'
                      ? '📈'
                      : statistics.weeklyTrend === 'declining'
                      ? '📉'
                      : '➡️'}
                  </div>
                  <div>
                    <p
                      className={`text-sm transition-colors duration-500 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      Tendencia
                    </p>
                    <p
                      className={`text-2xl font-black transition-colors duration-500 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {statistics.weeklyTrend === 'improving'
                        ? 'Mejorando'
                        : statistics.weeklyTrend === 'declining'
                        ? 'Declinando'
                        : 'Estable'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Mood Selection */}
        <div
          className={`p-8 rounded-2xl border-2 mb-8 transition-all duration-300 ${
            isDarkMode
              ? 'bg-gray-800 border-gray-700 hover:border-purple-500'
              : 'bg-white border-gray-200 hover:border-purple-500'
          }`}
        >
          <h3
            className={`text-2xl font-black mb-6 transition-colors duration-500 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            ¿CÓMO TE SIENTES HOY?
          </h3>
          <div className='flex justify-center space-x-4'>
            {moodEmojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => handleMoodSelect(index + 1)}
                disabled={moodLoading}
                className={`p-6 rounded-2xl text-5xl transition-all duration-300 ${
                  currentMood === index + 1
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 border-4 border-purple-500 scale-110 shadow-2xl'
                    : `border-4 border-transparent hover:scale-105 ${
                        isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                      }`
                } ${moodLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
              >
                {moodLoading && currentMood === index + 1 ? <div className='animate-spin text-4xl'>⚡</div> : emoji}
              </button>
            ))}
          </div>
          {currentMood && (
            <div className='text-center mt-6'>
              <p className={`text-lg transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Seleccionaste: {moodLabels[currentMood - 1]} ({moodEmojis[currentMood - 1]})
              </p>
              {moodLoading && (
                <div className='flex items-center justify-center space-x-2 mt-3'>
                  <div className='animate-pulse text-2xl'>✨</div>
                  <span
                    className={`text-lg font-bold transition-colors duration-500 ${
                      isDarkMode ? 'text-purple-400' : 'text-purple-600'
                    }`}
                  >
                    Analizando con IA...
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Recent Activities */}
          <div className='lg:col-span-2 space-y-6'>
            <div
              className={`p-8 rounded-2xl border-2 transition-all duration-300 ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700 hover:border-purple-500'
                  : 'bg-white border-gray-200 hover:border-purple-500'
              }`}
            >
              <h3
                className={`text-2xl font-black mb-6 transition-colors duration-500 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                ACTIVIDADES RECIENTES
              </h3>
              <div className='space-y-4'>
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className={`flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 ${
                        isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className='text-3xl'>{activity.mood}</div>
                      <div className='flex-1'>
                        <p
                          className={`font-bold transition-colors duration-500 ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {activity.action}
                        </p>
                        <p
                          className={`text-sm transition-colors duration-500 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          {activity.time}
                        </p>
                        {activity.details && (
                          <p
                            className={`text-xs mt-1 transition-colors duration-500 ${
                              isDarkMode ? 'text-gray-500' : 'text-gray-400'
                            }`}
                          >
                            {activity.details}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className='text-center py-8'>
                    <div className='text-6xl mb-4'>📝</div>
                    <p
                      className={`text-lg transition-colors duration-500 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      No hay actividades recientes
                    </p>
                    <p
                      className={`text-sm transition-colors duration-500 ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-400'
                      }`}
                    >
                      Registra tu primer mood para comenzar
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            {/* Quick Actions */}
            <div
              className={`p-8 rounded-2xl border-2 transition-all duration-300 ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700 hover:border-purple-500'
                  : 'bg-white border-gray-200 hover:border-purple-500'
              }`}
            >
              <h3
                className={`text-2xl font-black mb-6 transition-colors duration-500 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                ACCIONES RÁPIDAS
              </h3>
              <div className='space-y-4'>
                {/* Insights de IA */}
                <button
                  onClick={() => setShowAIInsights(!showAIInsights)}
                  className={`w-full p-4 rounded-xl transition-all duration-300 hover:scale-105 ${
                    isDarkMode
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                  } text-white`}
                >
                  <div className='flex items-center space-x-3'>
                    <div className='text-2xl'>🧠</div>
                    <div className='text-left'>
                      <h4 className='font-bold text-lg'>Insights de IA</h4>
                      <p className='text-sm opacity-90'>Análisis personalizado</p>
                    </div>
                  </div>
                </button>

                {/* Chat con IA */}
                <button
                  onClick={() => handleQuickAction('chat')}
                  className={`w-full p-4 rounded-xl transition-all duration-300 hover:scale-105 ${
                    isDarkMode
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
                  } text-white`}
                >
                  <div className='flex items-center space-x-3'>
                    <div className='text-2xl'>🤖</div>
                    <div className='text-left'>
                      <h4 className='font-bold text-lg'>Chat con IA</h4>
                      <p className='text-sm opacity-90'>Habla sobre tus sentimientos</p>
                    </div>
                  </div>
                </button>

                {/* Chat con Psicólogos */}
                <button
                  onClick={() => handleQuickAction('psychologists')}
                  className={`w-full p-4 rounded-xl transition-all duration-300 hover:scale-105 ${
                    isDarkMode
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                  } text-white`}
                >
                  <div className='flex items-center space-x-3'>
                    <div className='text-2xl'>👨‍⚕️</div>
                    <div className='text-left'>
                      <h4 className='font-bold text-lg'>Psicólogos</h4>
                      <p className='text-sm opacity-90'>Conecta con profesionales</p>
                    </div>
                  </div>
                </button>

                {/* Estadísticas */}
                <button
                  onClick={() => handleQuickAction('statistics')}
                  className={`w-full p-4 rounded-xl transition-all duration-300 hover:scale-105 ${
                    isDarkMode
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                  } text-white`}
                >
                  <div className='flex items-center space-x-3'>
                    <div className='text-2xl'>📊</div>
                    <div className='text-left'>
                      <h4 className='font-bold text-lg'>Estadísticas</h4>
                      <p className='text-sm opacity-90'>Ve tu progreso detallado</p>
                    </div>
                  </div>
                </button>

                {/* Objetivos */}
                <button
                  onClick={() => handleQuickAction('goals')}
                  className={`w-full p-4 rounded-xl transition-all duration-300 hover:scale-105 ${
                    isDarkMode
                      ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700'
                      : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
                  } text-white`}
                >
                  <div className='flex items-center space-x-3'>
                    <div className='text-2xl'>🎯</div>
                    <div className='text-left'>
                      <h4 className='font-bold text-lg'>Objetivos</h4>
                      <p className='text-sm opacity-90'>Establece metas de bienestar</p>
                    </div>
                  </div>
                </button>

                {/* Recordatorios */}
                <button
                  onClick={() => handleQuickAction('reminders')}
                  className={`w-full p-4 rounded-xl transition-all duration-300 hover:scale-105 ${
                    isDarkMode
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                  } text-white`}
                >
                  <div className='flex items-center space-x-3'>
                    <div className='text-2xl'>🔔</div>
                    <div className='text-left'>
                      <h4 className='font-bold text-lg'>Recordatorios</h4>
                      <p className='text-sm opacity-90'>Gestiona tus recordatorios</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Recordatorios */}
            <div
              className={`p-8 rounded-2xl border-2 transition-all duration-300 ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700 hover:border-purple-500'
                  : 'bg-white border-gray-200 hover:border-purple-500'
              }`}
            >
              <h3
                className={`text-2xl font-black mb-6 transition-colors duration-500 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                RECORDATORIOS
              </h3>
              <div className='space-y-4'>
                <div
                  className={`p-4 rounded-xl transition-all duration-300 ${
                    isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className='flex items-center space-x-3'>
                    <div className='text-2xl'>⏰</div>
                    <div>
                      <p
                        className={`font-bold transition-colors duration-500 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        Registro diario
                      </p>
                      <p
                        className={`text-sm transition-colors duration-500 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}
                      >
                        Todos los días a las 9:00 AM
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  className={`p-4 rounded-xl transition-all duration-300 ${
                    isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className='flex items-center space-x-3'>
                    <div className='text-2xl'>💬</div>
                    <div>
                      <p
                        className={`font-bold transition-colors duration-500 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        Sesión semanal
                      </p>
                      <p
                        className={`text-sm transition-colors duration-500 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}
                      >
                        Viernes a las 6:00 PM
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de Insights de IA */}
        {showAIInsights && (
          <div className='mt-8'>
            <div className='bg-white rounded-lg p-6 shadow-sm'>
              <h3 className='text-lg font-semibold mb-4'>Insights de IA</h3>
              <p className='text-gray-600'>Próximamente: Análisis inteligente de tus patrones emocionales</p>
            </div>
          </div>
        )}
      </div>

      {/* Alertas */}
      {showComingSoonAlert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-2">🚀 Próximamente</h3>
            <p className="text-gray-600 mb-4">{comingSoonMessage}</p>
            <button
              onClick={() => setShowComingSoonAlert(false)}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}



    </div>
  );
};

export default DashboardSimple;
