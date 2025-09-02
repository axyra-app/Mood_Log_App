import { BarChart3, Heart, LogOut, MessageCircle, Settings } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Achievements from '../components/Achievements';
import DailyRegistry from '../components/DailyRegistry';
import DiaryHistory from '../components/DiaryHistory';
import Notifications from '../components/Notifications';
import PsychologistList from '../components/PsychologistList';
import RecentActivities from '../components/RecentActivities';
import Statistics from '../components/Statistics';
import { useAuth } from '../contexts/AuthContext';

const UserDashboard = () => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('mood');

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = userProfile?.name || 'Usuario';
    if (hour < 12) return `Buenos días, ${name}`;
    if (hour < 18) return `Buenas tardes, ${name}`;
    return `Buenas noches, ${name}`;
  };

  const quickActions = [
    {
      id: 'mood',
      title: 'Registrar Estado de Ánimo',
      description: 'Comparte cómo te sientes hoy',
      icon: Heart,
      color: 'from-pink-500 to-red-500',
      bgColor: 'bg-pink-50',
      iconColor: 'text-pink-600',
    },
    {
      id: 'daily',
      title: 'Registro Diario',
      description: 'Ve tu progreso diario',
      icon: BarChart3,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      id: 'history',
      title: 'Historial',
      description: 'Ve tus entradas anteriores',
      icon: MessageCircle,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      id: 'stats',
      title: 'Ver Estadísticas',
      description: 'Analiza tus patrones',
      icon: BarChart3,
      color: 'from-indigo-500 to-purple-500',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
    },
    {
      id: 'chat',
      title: 'Chat con Psicólogos',
      description: 'Conecta con profesionales',
      icon: MessageCircle,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      id: 'achievements',
      title: 'Logros',
      description: 'Ve tus conquistas',
      icon: Settings,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
    },
    {
      id: 'notifications',
      title: 'Notificaciones',
      description: 'Mantente informado',
      icon: MessageCircle,
      color: 'from-indigo-500 to-blue-500',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
    },
    {
      id: 'settings',
      title: 'Configuraciones',
      description: 'Personaliza tu experiencia',
      icon: Settings,
      color: 'from-purple-500 to-violet-500',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
  ];

  return (
    <div className='min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50'>
      {/* Header */}
      <header className='bg-white border-b border-gray-100 shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-6'>
            <div className='flex items-center space-x-3'>
              <div className='w-10 h-10 bg-gradient-to-r from-primary-600 to-purple-600 rounded-lg flex items-center justify-center'>
                <Heart className='w-6 h-6 text-white' />
              </div>
              <div>
                <h1 className='text-2xl font-bold text-gray-900'>
                  {getGreeting()}, {userProfile?.name?.split(' ')[0]}!
                </h1>
                <p className='text-gray-600'>Tu bienestar mental es nuestra prioridad</p>
              </div>
            </div>
            <div className='flex items-center space-x-4'>
              <button
                onClick={() => navigate('/chat')}
                className='relative p-2 text-gray-600 hover:text-primary-600 transition-colors'
              >
                <MessageCircle className='w-6 h-6' />
                <span className='absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full'></span>
              </button>
              <button onClick={handleLogout} className='p-2 text-gray-600 hover:text-red-600 transition-colors'>
                <LogOut className='w-6 h-6' />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='grid lg:grid-cols-3 gap-8'>
          {/* Main Content */}
          <div className='lg:col-span-2 space-y-8'>
            {/* Quick Actions */}
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => {
                      if (action.id === 'mood') {
                        navigate('/diary-entry');
                      } else {
                        setActiveTab(action.id);
                      }
                    }}
                    className={`p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-lg transform hover:-translate-y-1 ${
                      activeTab === action.id
                        ? 'border-primary-200 bg-primary-50'
                        : 'border-gray-100 bg-white hover:border-gray-200'
                    }`}
                  >
                    <div className={`w-12 h-12 ${action.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                      <Icon className={`w-6 h-6 ${action.iconColor}`} />
                    </div>
                    <h3 className='font-semibold text-gray-900 mb-2'>{action.title}</h3>
                    <p className='text-sm text-gray-600'>{action.description}</p>
                  </button>
                );
              })}
            </div>

            {/* Content Area */}
            <div className='bg-white rounded-2xl shadow-lg border border-gray-100 p-8'>
              {activeTab === 'mood' && (
                <div className='text-center py-12'>
                  <Heart className='w-16 h-16 text-primary-400 mx-auto mb-4' />
                  <h3 className='text-xl font-semibold text-gray-900 mb-2'>Registrar Estado de Ánimo</h3>
                  <p className='text-gray-600 mb-6'>Comienza escribiendo sobre tu día para registrar cómo te sientes</p>
                  <button onClick={() => navigate('/diary-entry')} className='btn-primary'>
                    Comenzar
                  </button>
                </div>
              )}
              {activeTab === 'daily' && <DailyRegistry />}
              {activeTab === 'history' && <DiaryHistory />}
              {activeTab === 'stats' && <Statistics />}
              {activeTab === 'chat' && (
                <div className='text-center py-12'>
                  <MessageCircle className='w-16 h-16 text-gray-400 mx-auto mb-4' />
                  <h3 className='text-xl font-semibold text-gray-900 mb-2'>Chat con Psicólogos</h3>
                  <p className='text-gray-600 mb-6'>Conecta con profesionales de la salud mental</p>
                  <button onClick={() => navigate('/chat')} className='btn-primary'>
                    Ir al Chat
                  </button>
                </div>
              )}
              {activeTab === 'achievements' && <Achievements />}
              {activeTab === 'notifications' && <Notifications />}
              {activeTab === 'settings' && <Settings />}
            </div>
          </div>

          {/* Sidebar */}
          <div className='space-y-8'>
            {/* Recent Activities */}
            <RecentActivities />

            {/* Psychologist List */}
            <PsychologistList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
