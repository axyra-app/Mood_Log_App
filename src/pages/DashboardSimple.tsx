import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const DashboardSimple: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentMood, setCurrentMood] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState<any>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [moodLogs, setMoodLogs] = useState<any[]>([]);

  const moodEmojis = ['😢', '😕', '😐', '🙂', '😊'];
  const moodLabels = ['Muy mal', 'Mal', 'Regular', 'Bien', 'Excelente'];

  useEffect(() => {
    setIsLoaded(true);
    loadUserData();
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const loadUserData = async () => {
    try {
      // Simular datos de estadísticas
      const mockStats = {
        totalLogs: 15,
        averageMood: 3.8,
        weeklyTrend: 'improving'
      };
      setStatistics(mockStats);

      // Simular actividades recientes
      const activities = [
        {
          id: '1',
          action: 'Registraste tu estado de ánimo',
          time: 'Hace 2 horas',
          mood: '😊',
          details: 'Me siento muy bien hoy, el sol está brillando...'
        },
        {
          id: '2',
          action: 'Registraste tu estado de ánimo',
          time: 'Ayer',
          mood: '🙂',
          details: 'Día productivo en el trabajo...'
        },
        {
          id: '3',
          action: 'Registraste tu estado de ánimo',
          time: 'Hace 2 días',
          mood: '😐',
          details: 'Día normal, sin mucho que destacar...'
        }
      ];
      setRecentActivities(activities);

      // Simular notificaciones
      const mockNotifications = [
        {
          id: 'welcome-1',
          title: '¡Bienvenido!',
          message: 'Comienza registrando tu primer estado de ánimo para obtener análisis personalizados con IA.',
          type: 'info',
          timestamp: new Date(),
          isRead: false,
        },
        {
          id: 'milestone-1',
          title: '¡Hito alcanzado!',
          message: 'Has registrado 15 estados de ánimo. ¡Sigue así!',
          type: 'success',
          timestamp: new Date(),
          isRead: false,
        }
      ];
      setNotifications(mockNotifications);

    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleMoodSelect = async (mood: number) => {
    setCurrentMood(mood);
    setLoading(true);

    try {
      // Simular análisis con IA
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular guardado exitoso
      const newActivity = {
        id: Date.now().toString(),
        action: 'Registraste tu estado de ánimo',
        time: 'Hace unos segundos',
        mood: moodEmojis[mood - 1],
        details: `Mood registrado: ${moodLabels[mood - 1]}`
      };
      
      setRecentActivities(prev => [newActivity, ...prev.slice(0, 2)]);
      
      // Agregar notificación de éxito
      const newNotification = {
        id: Date.now().toString(),
        title: 'Mood Guardado',
        message: `Análisis de IA: Emoción positiva (85% confianza)`,
        type: 'success',
        timestamp: new Date(),
        isRead: false,
      };
      setNotifications(prev => [newNotification, ...prev]);

      // Mostrar mensaje de éxito
      alert(`¡Mood guardado exitosamente! 😊\n\nAnálisis de IA: Emoción positiva (85% confianza)`);
      
    } catch (error) {
      console.error('Error saving mood:', error);
      alert('Error al guardar el mood. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification => 
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    );
  };

  const handleDismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  if (!isLoaded) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${
        isDarkMode ? 'bg-gray-900' : 'bg-white'
      }`}>
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isDarkMode ? 'bg-gray-900' : 'bg-white'
    }`}>
      {/* Header */}
      <header className={`py-6 px-6 transition-colors duration-500 ${
        isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'
      } backdrop-blur-lg border-b ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span className="text-white font-black text-lg">💜</span>
            </div>
            <span className={`text-2xl font-black transition-colors duration-500 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              MOOD LOG
            </span>
          </Link>
          
          <div className="flex items-center space-x-4">
            {/* Notificaciones */}
            <div className="relative">
              <button
                className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 ${
                  isDarkMode 
                    ? 'bg-gray-700 text-white hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                🔔
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications.filter(n => !n.isRead).length}
                  </span>
                )}
              </button>
            </div>
            
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
              onClick={() => window.location.href = '/login'}
              className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 ${
                isDarkMode
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className={`text-4xl font-black mb-4 transition-colors duration-500 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            ¡HOLA! 👋
          </h2>
          <p className={`text-xl transition-colors duration-500 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Tu bienestar emocional es importante. ¿Cómo te sientes hoy?
          </p>

          {/* Estadísticas rápidas */}
          {statistics && statistics.totalLogs > 0 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                isDarkMode
                  ? 'bg-gray-800/50 border-gray-700 hover:border-purple-500'
                  : 'bg-white/50 border-gray-200 hover:border-purple-500'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">📊</div>
                  <div>
                    <p className={`text-sm transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Mood Promedio</p>
                    <p className={`text-2xl font-black transition-colors duration-500 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{statistics.averageMood}/5</p>
                  </div>
                </div>
              </div>
              <div className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                isDarkMode
                  ? 'bg-gray-800/50 border-gray-700 hover:border-purple-500'
                  : 'bg-white/50 border-gray-200 hover:border-purple-500'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">📝</div>
                  <div>
                    <p className={`text-sm transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Total Registros</p>
                    <p className={`text-2xl font-black transition-colors duration-500 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{statistics.totalLogs}</p>
                  </div>
                </div>
              </div>
              <div className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                isDarkMode
                  ? 'bg-gray-800/50 border-gray-700 hover:border-purple-500'
                  : 'bg-white/50 border-gray-200 hover:border-purple-500'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">
                    {statistics.weeklyTrend === 'improving'
                      ? '📈'
                      : statistics.weeklyTrend === 'declining'
                      ? '📉'
                      : '➡️'}
                  </div>
                  <div>
                    <p className={`text-sm transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Tendencia</p>
                    <p className={`text-2xl font-black transition-colors duration-500 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
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
        <div className={`p-8 rounded-2xl border-2 mb-8 transition-all duration-300 ${
          isDarkMode
            ? 'bg-gray-800 border-gray-700 hover:border-purple-500'
            : 'bg-white border-gray-200 hover:border-purple-500'
        }`}>
          <h3 className={`text-2xl font-black mb-6 transition-colors duration-500 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            ¿CÓMO TE SIENTES HOY?
          </h3>
          <div className="flex justify-center space-x-4">
            {moodEmojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => handleMoodSelect(index + 1)}
                disabled={loading}
                className={`p-6 rounded-2xl text-5xl transition-all duration-300 ${
                  currentMood === index + 1
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 border-4 border-purple-500 scale-110 shadow-2xl'
                    : `border-4 border-transparent hover:scale-105 ${
                        isDarkMode
                          ? 'bg-gray-700 hover:bg-gray-600'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`
                } ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
              >
                {loading && currentMood === index + 1 ? (
                  <div className="animate-spin text-4xl">⚡</div>
                ) : (
                  emoji
                )}
              </button>
            ))}
          </div>
          {currentMood && (
            <div className="text-center mt-6">
              <p className={`text-lg transition-colors duration-500 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Seleccionaste: {moodLabels[currentMood - 1]} ({moodEmojis[currentMood - 1]})
              </p>
              {loading && (
                <div className="flex items-center justify-center space-x-2 mt-3">
                  <div className="animate-pulse text-2xl">✨</div>
                  <span className={`text-lg font-bold transition-colors duration-500 ${
                    isDarkMode ? 'text-purple-400' : 'text-purple-600'
                  }`}>
                    Analizando con IA...
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activities */}
          <div className="lg:col-span-2 space-y-6">
            <div className={`p-8 rounded-2xl border-2 transition-all duration-300 ${
              isDarkMode
                ? 'bg-gray-800 border-gray-700 hover:border-purple-500'
                : 'bg-white border-gray-200 hover:border-purple-500'
            }`}>
              <h3 className={`text-2xl font-black mb-6 transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                ACTIVIDADES RECIENTES
              </h3>
              <div className="space-y-4">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
                    <div key={activity.id} className={`flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 ${
                      isDarkMode
                        ? 'bg-gray-700 hover:bg-gray-600'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}>
                      <div className="text-3xl">{activity.mood}</div>
                      <div className="flex-1">
                        <p className={`font-bold transition-colors duration-500 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>{activity.action}</p>
                        <p className={`text-sm transition-colors duration-500 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>{activity.time}</p>
                        {activity.details && (
                          <p className={`text-xs mt-1 transition-colors duration-500 ${
                            isDarkMode ? 'text-gray-500' : 'text-gray-400'
                          }`}>{activity.details}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">📝</div>
                    <p className={`text-lg transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>No hay actividades recientes</p>
                    <p className={`text-sm transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}>Registra tu primer mood para comenzar</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Psicólogos */}
            <div className={`p-8 rounded-2xl border-2 transition-all duration-300 ${
              isDarkMode
                ? 'bg-gray-800 border-gray-700 hover:border-purple-500'
                : 'bg-white border-gray-200 hover:border-purple-500'
            }`}>
              <h3 className={`text-2xl font-black mb-6 transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                PSICÓLOGOS DISPONIBLES
              </h3>
              <div className="space-y-4">
                {[
                  { id: 1, name: 'Dr. María González', specialty: 'Ansiedad y Estrés', rating: 4.9, available: true },
                  { id: 2, name: 'Lic. Carlos Rodríguez', specialty: 'Terapia Cognitiva', rating: 4.8, available: false },
                  { id: 3, name: 'Dra. Ana Martínez', specialty: 'Depresión', rating: 4.9, available: true },
                ].map((psychologist) => (
                  <div key={psychologist.id} className={`p-4 rounded-xl transition-all duration-300 ${
                    isDarkMode
                      ? 'bg-gray-700 hover:bg-gray-600'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={`font-bold transition-colors duration-500 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>{psychologist.name}</h4>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          psychologist.available 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {psychologist.available ? 'Disponible' : 'Ocupado'}
                      </span>
                    </div>
                    <p className={`text-sm transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>{psychologist.specialty}</p>
                    <div className="flex items-center space-x-1 mt-2">
                      <span className="text-yellow-500">⭐</span>
                      <span className={`text-sm font-bold transition-colors duration-500 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>{psychologist.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                to="/chat"
                className={`w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-lg uppercase tracking-wider py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 block text-center`}
              >
                VER TODOS LOS PSICÓLOGOS
              </Link>
            </div>

            {/* Recordatorios */}
            <div className={`p-8 rounded-2xl border-2 transition-all duration-300 ${
              isDarkMode
                ? 'bg-gray-800 border-gray-700 hover:border-purple-500'
                : 'bg-white border-gray-200 hover:border-purple-500'
            }`}>
              <h3 className={`text-2xl font-black mb-6 transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                RECORDATORIOS
              </h3>
              <div className="space-y-4">
                <div className={`p-4 rounded-xl transition-all duration-300 ${
                  isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">⏰</div>
                    <div>
                      <p className={`font-bold transition-colors duration-500 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>Registro diario</p>
                      <p className={`text-sm transition-colors duration-500 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>Todos los días a las 9:00 AM</p>
                    </div>
                  </div>
                </div>
                <div className={`p-4 rounded-xl transition-all duration-300 ${
                  isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">💬</div>
                    <div>
                      <p className={`font-bold transition-colors duration-500 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>Sesión semanal</p>
                      <p className={`text-sm transition-colors duration-500 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>Viernes a las 6:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSimple;
