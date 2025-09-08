import { BarChart3, Heart, Loader2, LogOut, MessageCircle, Settings, Sparkles, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AIInsights from '../components/AIInsights';
import NotificationCenter from '../components/NotificationCenter';
import ReminderWidget from '../components/ReminderWidget';
import SEO from '../components/SEO';
import WeeklyProgress from '../components/WeeklyProgress';
import { useAuth } from '../contexts/AuthContext';
import { useMood } from '../hooks/useMood';
import { saveMoodLog } from '../services/firestore';
import { analyzeMoodWithAI } from '../services/openai';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { moodLogs, getMoodStatistics, saveMoodLog: saveMoodHook } = useMood(user?.uid);
  const [currentMood, setCurrentMood] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState<any>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  const moodEmojis = ['😢', '😕', '😐', '🙂', '😊'];
  const moodLabels = ['Muy mal', 'Mal', 'Regular', 'Bien', 'Excelente'];

  const quickActions = [
    {
      id: 'mood',
      title: 'Registrar Estado de Ánimo',
      description: '¿Cómo te sientes hoy?',
      icon: <Heart className='w-8 h-8' />,
      color: 'from-pink-500 to-rose-500',
      href: '/mood-flow',
    },
    {
      id: 'stats',
      title: 'Ver Estadísticas',
      description: 'Analiza tus patrones',
      icon: <BarChart3 className='w-8 h-8' />,
      color: 'from-blue-500 to-cyan-500',
      href: '/statistics',
    },
    {
      id: 'chat',
      title: 'Chat con Psicólogos',
      description: 'Conecta con profesionales',
      icon: <MessageCircle className='w-8 h-8' />,
      color: 'from-green-500 to-emerald-500',
      href: '/chat',
    },
    {
      id: 'settings',
      title: 'Configuraciones',
      description: 'Personaliza tu experiencia',
      icon: <Settings className='w-8 h-8' />,
      color: 'from-purple-500 to-violet-500',
      href: '/settings',
    },
  ];

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      const stats = getMoodStatistics();
      setStatistics(stats);

      // Generar actividades recientes basadas en los mood logs
      const activities = moodLogs.slice(0, 3).map((log, index) => ({
        id: log.id,
        action: 'Registraste tu estado de ánimo',
        time: getTimeAgo(log.createdAt),
        mood: moodEmojis[log.mood - 1],
        details: log.notes ? log.notes.substring(0, 50) + '...' : null,
      }));

      setRecentActivities(activities);

      // Agregar notificaciones de bienvenida si es la primera vez
      if (moodLogs.length === 0) {
        const welcomeNotification = {
          id: 'welcome-1',
          title: '¡Bienvenido!',
          message: 'Comienza registrando tu primer estado de ánimo para obtener análisis personalizados con IA.',
          type: 'info',
          timestamp: new Date(),
          isRead: false,
        };
        setNotifications((prev) => [welcomeNotification, ...prev]);
      } else if (moodLogs.length > 0 && moodLogs.length % 7 === 0) {
        // Notificación cada 7 registros
        const milestoneNotification = {
          id: `milestone-${moodLogs.length}`,
          title: '¡Hito alcanzado!',
          message: `Has registrado ${moodLogs.length} estados de ánimo. ¡Sigue así!`,
          type: 'success',
          timestamp: new Date(),
          isRead: false,
        };
        setNotifications((prev) => [milestoneNotification, ...prev]);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
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

  const psychologists = [
    { id: 1, name: 'Dr. María González', specialty: 'Ansiedad y Estrés', rating: 4.9, available: true },
    { id: 2, name: 'Lic. Carlos Rodríguez', specialty: 'Terapia Cognitiva', rating: 4.8, available: false },
    { id: 3, name: 'Dra. Ana Martínez', specialty: 'Depresión', rating: 4.9, available: true },
  ];

  const handleMoodSelect = async (mood: number) => {
    if (!user) return;

    setCurrentMood(mood);
    setLoading(true);

    try {
      // Crear datos básicos del mood
      const moodData = {
        mood,
        energy: 5, // Valor por defecto
        stress: 5, // Valor por defecto
        sleep: 5, // Valor por defecto
        notes: `Mood registrado desde el Dashboard: ${moodLabels[mood - 1]}`,
        activities: [],
        emotions: [],
      };

      // Análisis con IA
      const aiAnalysis = await analyzeMoodWithAI(moodData);

      // Guardar en Firestore
      const moodLogData = {
        userId: user.uid,
        ...moodData,
        aiAnalysis,
      };

      await saveMoodLog(moodLogData);

      // Actualizar datos locales
      await loadUserData();

      // Agregar notificación de éxito
      const newNotification = {
        id: Date.now().toString(),
        title: 'Mood Guardado',
        message: `Análisis de IA: ${aiAnalysis.primaryEmotion} (${aiAnalysis.confidence}% confianza)`,
        type: 'success',
        timestamp: new Date(),
        isRead: false,
      };
      setNotifications((prev) => [newNotification, ...prev]);

      // Mostrar mensaje de éxito
      alert(
        `¡Mood guardado exitosamente! 😊\n\nAnálisis de IA: ${aiAnalysis.primaryEmotion} (${aiAnalysis.confidence}% confianza)`
      );
    } catch (error) {
      console.error('Error saving mood:', error);
      alert('Error al guardar el mood. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
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

  return (
    <>
      <SEO
        title='Dashboard - Mood Log App'
        description='Tu panel de control personalizado para el seguimiento del bienestar emocional'
        keywords='dashboard, bienestar emocional, mood tracking, psicología'
      />

      <div className='min-h-screen bg-gray-50'>
        {/* Header */}
        <header className='bg-white shadow-sm border-b border-gray-200'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='flex justify-between items-center h-16'>
              <div className='flex items-center space-x-4'>
                <div className='w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center'>
                  <Heart className='w-6 h-6 text-white' />
                </div>
                <div>
                  <h1 className='text-xl font-bold text-gray-900'>Mood Log App</h1>
                  <p className='text-sm text-gray-500'>Bienvenido de vuelta, {user?.displayName || user?.email}</p>
                </div>
              </div>

              <div className='flex items-center space-x-4'>
                <NotificationCenter
                  notifications={notifications}
                  onMarkAsRead={handleMarkNotificationAsRead}
                  onDismiss={handleDismissNotification}
                />
                <button className='p-2 text-gray-400 hover:text-gray-600 transition-colors'>
                  <User className='w-6 h-6' />
                </button>
                <button onClick={handleLogout} className='p-2 text-gray-400 hover:text-red-600 transition-colors'>
                  <LogOut className='w-6 h-6' />
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          {/* Welcome Section */}
          <div className='mb-8'>
            <h2 className='text-3xl font-bold text-gray-900 mb-2'>¡Hola! 👋</h2>
            <p className='text-gray-600'>Tu bienestar emocional es importante. ¿Cómo te sientes hoy?</p>

            {/* Estadísticas rápidas */}
            {statistics && statistics.totalLogs > 0 && (
              <div className='mt-4 grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-white/20'>
                  <div className='flex items-center space-x-2'>
                    <div className='text-2xl'>📊</div>
                    <div>
                      <p className='text-sm text-gray-600'>Mood Promedio</p>
                      <p className='text-lg font-bold text-gray-900'>{statistics.averageMood}/5</p>
                    </div>
                  </div>
                </div>
                <div className='bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-white/20'>
                  <div className='flex items-center space-x-2'>
                    <div className='text-2xl'>📝</div>
                    <div>
                      <p className='text-sm text-gray-600'>Total Registros</p>
                      <p className='text-lg font-bold text-gray-900'>{statistics.totalLogs}</p>
                    </div>
                  </div>
                </div>
                <div className='bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-white/20'>
                  <div className='flex items-center space-x-2'>
                    <div className='text-2xl'>
                      {statistics.weeklyTrend === 'improving'
                        ? '📈'
                        : statistics.weeklyTrend === 'declining'
                        ? '📉'
                        : '➡️'}
                    </div>
                    <div>
                      <p className='text-sm text-gray-600'>Tendencia</p>
                      <p className='text-lg font-bold text-gray-900'>
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
          <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>¿Cómo te sientes hoy?</h3>
            <div className='flex justify-center space-x-4'>
              {moodEmojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => handleMoodSelect(index + 1)}
                  disabled={loading}
                  className={`p-4 rounded-xl text-4xl transition-all duration-200 ${
                    currentMood === index + 1
                      ? 'bg-purple-100 border-2 border-purple-500 scale-110'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                >
                  {loading && currentMood === index + 1 ? (
                    <Loader2 className='w-8 h-8 animate-spin text-purple-600' />
                  ) : (
                    emoji
                  )}
                </button>
              ))}
            </div>
            {currentMood && (
              <div className='text-center mt-4'>
                <p className='text-gray-600'>
                  Seleccionaste: {moodLabels[currentMood - 1]} ({moodEmojis[currentMood - 1]})
                </p>
                {loading && (
                  <div className='flex items-center justify-center space-x-2 mt-2 text-purple-600'>
                    <Sparkles className='w-4 h-4 animate-pulse' />
                    <span className='text-sm'>Analizando con IA...</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Actions Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
            {quickActions.map((action) => (
              <Link
                key={action.id}
                to={action.href}
                className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 group'
              >
                <div
                  className={`w-16 h-16 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-200`}
                >
                  {action.icon}
                </div>
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>{action.title}</h3>
                <p className='text-gray-600 text-sm'>{action.description}</p>
              </Link>
            ))}
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            {/* Recent Activities */}
            <div className='lg:col-span-2 space-y-6'>
              <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>Actividades Recientes</h3>
                <div className='space-y-4'>
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity) => (
                      <div key={activity.id} className='flex items-center space-x-4 p-3 bg-gray-50 rounded-lg'>
                        <div className='text-2xl'>{activity.mood}</div>
                        <div className='flex-1'>
                          <p className='text-gray-900 font-medium'>{activity.action}</p>
                          <p className='text-gray-500 text-sm'>{activity.time}</p>
                          {activity.details && <p className='text-gray-400 text-xs mt-1'>{activity.details}</p>}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className='text-center py-8'>
                      <div className='text-4xl mb-2'>📝</div>
                      <p className='text-gray-500'>No hay actividades recientes</p>
                      <p className='text-gray-400 text-sm'>Registra tu primer mood para comenzar</p>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Insights del último mood */}
              {moodLogs.length > 0 && moodLogs[0].aiAnalysis && <AIInsights analysis={moodLogs[0].aiAnalysis} />}
            </div>

            {/* Sidebar */}
            <div className='space-y-6'>
              {/* Recordatorios */}
              <ReminderWidget />

              {/* Progreso Semanal */}
              <WeeklyProgress moodLogs={moodLogs} />

              {/* Psicólogos */}
              <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>Psicólogos Disponibles</h3>
                <div className='space-y-4'>
                  {psychologists.map((psychologist) => (
                    <div key={psychologist.id} className='p-4 bg-gray-50 rounded-lg'>
                      <div className='flex items-center justify-between mb-2'>
                        <h4 className='font-medium text-gray-900'>{psychologist.name}</h4>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            psychologist.available ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {psychologist.available ? 'Disponible' : 'Ocupado'}
                        </span>
                      </div>
                      <p className='text-gray-600 text-sm mb-2'>{psychologist.specialty}</p>
                      <div className='flex items-center space-x-1'>
                        <span className='text-yellow-500'>⭐</span>
                        <span className='text-sm text-gray-600'>{psychologist.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  to='/chat'
                  className='w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 block text-center'
                >
                  Ver Todos los Psicólogos
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
