import {
  AlertTriangle,
  BarChart3,
  Bell,
  Calendar,
  Download,
  Heart,
  LogOut,
  MessageCircle,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientManagement from '../components/PatientManagement';
import SessionScheduler from '../components/SessionScheduler';
import { useAuth } from '../contexts/AuthContext';

const PsychologistDashboard = () => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const metrics = [
    {
      title: 'Pacientes Activos',
      value: '24',
      change: '+3 esta semana',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Sesiones Hoy',
      value: '6',
      change: '2 pendientes',
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Mensajes Pendientes',
      value: '12',
      change: '3 urgentes',
      icon: MessageCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Progreso Promedio',
      value: '78%',
      change: '+5% este mes',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const patients = [
    {
      id: 1,
      name: 'María González',
      mood: '😊',
      progress: 85,
      lastSession: 'Hace 2 días',
      status: 'stable',
      risk: 'low',
      nextSession: 'Mañana 10:00 AM',
    },
    {
      id: 2,
      name: 'Carlos Ruiz',
      mood: '😐',
      progress: 45,
      lastSession: 'Hace 1 semana',
      status: 'attention',
      risk: 'medium',
      nextSession: 'Hoy 3:00 PM',
    },
    {
      id: 3,
      name: 'Ana Martínez',
      mood: '😢',
      progress: 25,
      lastSession: 'Hace 3 días',
      status: 'urgent',
      risk: 'high',
      nextSession: 'Urgente',
    },
    {
      id: 4,
      name: 'Luis Fernández',
      mood: '🙂',
      progress: 70,
      lastSession: 'Ayer',
      status: 'stable',
      risk: 'low',
      nextSession: 'Viernes 2:00 PM',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable':
        return 'bg-green-100 text-green-800';
      case 'attention':
        return 'bg-yellow-100 text-yellow-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'high':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

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
                <h1 className='text-2xl font-bold text-gray-900'>Bienvenido, Dr. {userProfile?.name?.split(' ')[0]}</h1>
                <p className='text-gray-600'>Panel de control profesional</p>
              </div>
            </div>
            <div className='flex items-center space-x-4'>
              <button className='relative p-2 text-gray-600 hover:text-primary-600 transition-colors'>
                <Bell className='w-6 h-6' />
                <span className='absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full'></span>
              </button>
              <button
                onClick={() => navigate('/chat')}
                className='p-2 text-gray-600 hover:text-primary-600 transition-colors'
              >
                <MessageCircle className='w-6 h-6' />
              </button>
              <button onClick={handleLogout} className='p-2 text-gray-600 hover:text-red-600 transition-colors'>
                <LogOut className='w-6 h-6' />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Metrics */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div key={index} className='bg-white rounded-xl shadow-lg border border-gray-100 p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>{metric.title}</p>
                    <p className='text-3xl font-bold text-gray-900 mt-2'>{metric.value}</p>
                    <p className='text-sm text-gray-500 mt-1'>{metric.change}</p>
                  </div>
                  <div className={`w-12 h-12 ${metric.bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${metric.color}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Alertas Urgentes */}
        <div className='bg-red-50 border border-red-200 rounded-xl p-6 mb-8'>
          <div className='flex items-center space-x-3 mb-4'>
            <AlertTriangle className='w-6 h-6 text-red-600' />
            <h3 className='text-lg font-semibold text-red-800'>Alertas Urgentes</h3>
          </div>
          <div className='space-y-3'>
            <div className='flex items-center justify-between p-3 bg-white rounded-lg border border-red-200'>
              <div className='flex items-center space-x-3'>
                <div className='w-3 h-3 bg-red-500 rounded-full'></div>
                <span className='font-medium text-gray-900'>Ana Martínez</span>
                <span className='text-sm text-gray-600'>Estado de ánimo crítico</span>
              </div>
              <button className='text-red-600 hover:text-red-700 font-medium text-sm'>Ver detalles</button>
            </div>
            <div className='flex items-center justify-between p-3 bg-white rounded-lg border border-red-200'>
              <div className='flex items-center space-x-3'>
                <div className='w-3 h-3 bg-yellow-500 rounded-full'></div>
                <span className='font-medium text-gray-900'>Carlos Ruiz</span>
                <span className='text-sm text-gray-600'>Sesión pendiente</span>
              </div>
              <button className='text-red-600 hover:text-red-700 font-medium text-sm'>Programar</button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className='flex space-x-1 mb-8'>
          {[
            { id: 'overview', label: 'Resumen', icon: BarChart3 },
            { id: 'patients', label: 'Pacientes', icon: Users },
            { id: 'sessions', label: 'Sesiones', icon: Calendar },
            { id: 'reports', label: 'Reportes', icon: Download },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                }`}
              >
                <Icon className='w-5 h-5' />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className='bg-white rounded-2xl shadow-lg border border-gray-100 p-8'>
          {activeTab === 'overview' && (
            <div className='space-y-6'>
              <h2 className='text-2xl font-bold text-gray-900 mb-6'>Resumen General</h2>

              {/* Patients List */}
              <div>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>Pacientes Recientes</h3>
                <div className='space-y-4'>
                  {patients.map((patient) => (
                    <div
                      key={patient.id}
                      className='flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all duration-200'
                    >
                      <div className='flex items-center space-x-4'>
                        <div className='w-12 h-12 bg-gradient-to-r from-primary-100 to-purple-100 rounded-full flex items-center justify-center text-2xl'>
                          {patient.mood}
                        </div>
                        <div>
                          <h4 className='font-semibold text-gray-900'>{patient.name}</h4>
                          <p className='text-sm text-gray-600'>Última sesión: {patient.lastSession}</p>
                        </div>
                      </div>

                      <div className='flex items-center space-x-4'>
                        <div className='text-right'>
                          <div className='flex items-center space-x-2 mb-1'>
                            <div className='w-20 bg-gray-200 rounded-full h-2'>
                              <div
                                className='bg-primary-600 h-2 rounded-full'
                                style={{ width: `${patient.progress}%` }}
                              ></div>
                            </div>
                            <span className='text-sm font-medium text-gray-700'>{patient.progress}%</span>
                          </div>
                          <p className='text-xs text-gray-500'>Progreso</p>
                        </div>

                        <div className='flex items-center space-x-2'>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}
                          >
                            {patient.status === 'stable'
                              ? 'Estable'
                              : patient.status === 'attention'
                              ? 'Atención'
                              : 'Urgente'}
                          </span>
                          <div className={`w-3 h-3 ${getRiskColor(patient.risk)} rounded-full`}></div>
                        </div>

                        <div className='text-right'>
                          <p className='text-sm font-medium text-gray-900'>{patient.nextSession}</p>
                          <p className='text-xs text-gray-500'>Próxima sesión</p>
                        </div>

                        <button className='flex items-center space-x-1 text-primary-600 hover:text-primary-700 font-medium text-sm'>
                          <MessageCircle className='w-4 h-4' />
                          <span>Chat</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'patients' && <PatientManagement />}

          {activeTab === 'sessions' && <SessionScheduler />}

          {activeTab === 'reports' && (
            <div className='text-center py-12'>
              <Download className='w-16 h-16 text-gray-400 mx-auto mb-4' />
              <h3 className='text-xl font-semibold text-gray-900 mb-2'>Reportes y Análisis</h3>
              <p className='text-gray-600'>Próximamente: Generación de reportes detallados</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PsychologistDashboard;
