import { BarChart3, Bell, Heart, LogOut, MessageCircle, Settings, User } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [currentMood, setCurrentMood] = useState<number | null>(null);

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

  const recentActivities = [
    { id: 1, action: 'Registraste tu estado de ánimo', time: 'Hace 2 horas', mood: '😊' },
    { id: 2, action: 'Completaste tu rutina matutina', time: 'Ayer', mood: '🙂' },
    { id: 3, action: 'Tuviste una sesión de chat', time: 'Hace 3 días', mood: '😐' },
  ];

  const psychologists = [
    { id: 1, name: 'Dr. María González', specialty: 'Ansiedad y Estrés', rating: 4.9, available: true },
    { id: 2, name: 'Lic. Carlos Rodríguez', specialty: 'Terapia Cognitiva', rating: 4.8, available: false },
    { id: 3, name: 'Dra. Ana Martínez', specialty: 'Depresión', rating: 4.9, available: true },
  ];

  const handleMoodSelect = (mood: number) => {
    setCurrentMood(mood);
    // Aquí se guardaría el mood en la base de datos
    console.log('Mood seleccionado:', mood);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
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
                <button className='p-2 text-gray-400 hover:text-gray-600 transition-colors'>
                  <Bell className='w-6 h-6' />
                </button>
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
          </div>

          {/* Quick Mood Selection */}
          <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>¿Cómo te sientes hoy?</h3>
            <div className='flex justify-center space-x-4'>
              {moodEmojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => handleMoodSelect(index + 1)}
                  className={`p-4 rounded-xl text-4xl transition-all duration-200 ${
                    currentMood === index + 1
                      ? 'bg-purple-100 border-2 border-purple-500 scale-110'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            {currentMood && (
              <p className='text-center text-gray-600 mt-4'>
                Seleccionaste: {moodLabels[currentMood - 1]} ({moodEmojis[currentMood - 1]})
              </p>
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
            <div className='lg:col-span-2'>
              <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>Actividades Recientes</h3>
                <div className='space-y-4'>
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className='flex items-center space-x-4 p-3 bg-gray-50 rounded-lg'>
                      <div className='text-2xl'>{activity.mood}</div>
                      <div className='flex-1'>
                        <p className='text-gray-900 font-medium'>{activity.action}</p>
                        <p className='text-gray-500 text-sm'>{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Psychologists */}
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
              <button className='w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200'>
                Ver Todos los Psicólogos
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
