import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
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
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientManagement from '../components/PatientManagement';
import SessionScheduler from '../components/SessionScheduler';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';

interface Patient {
  id: string;
  name: string;
  email: string;
  mood: number;
  progress: number;
  lastSession: string;
  status: 'stable' | 'attention' | 'urgent';
  risk: 'low' | 'medium' | 'high';
  nextSession: string;
  lastMoodDate: Date;
}

interface DashboardMetrics {
  activePatients: number;
  sessionsToday: number;
  pendingMessages: number;
  averageProgress: number;
}

const PsychologistDashboard = () => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    activePatients: 0,
    sessionsToday: 0,
    pendingMessages: 0,
    averageProgress: 0,
  });
  const [loading, setLoading] = useState(true);
  const [urgentAlerts, setUrgentAlerts] = useState<Patient[]>([]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  useEffect(() => {
    if (userProfile?.uid) {
      fetchDashboardData();
    }
  }, [userProfile?.uid]);

  const fetchDashboardData = async () => {
    if (!userProfile?.uid) return;

    try {
      // Obtener pacientes (usuarios que han tenido conversaciones con este psicólogo)
      const conversationsQuery = query(
        collection(db, 'conversations'),
        where(`participants.${userProfile.uid}`, '==', true)
      );
      const conversationsSnapshot = await getDocs(conversationsQuery);
      const conversationIds = conversationsSnapshot.docs.map((doc) => doc.id);

      // Obtener información de los pacientes
      const patientsList: Patient[] = [];
      let totalProgress = 0;
      let urgentPatients: Patient[] = [];

      for (const conversationId of conversationIds) {
        // Obtener participantes de la conversación
        const conversationDoc = conversationsSnapshot.docs.find((doc) => doc.id === conversationId);
        if (conversationDoc) {
          const participants = conversationDoc.data().participants;
          const patientId = Object.keys(participants).find((id) => id !== userProfile.uid);

          if (patientId) {
            // Obtener información del paciente
            const patientQuery = query(
              collection(db, 'users'),
              where('uid', '==', patientId),
              where('role', '==', 'user')
            );
            const patientSnapshot = await getDocs(patientQuery);

            if (!patientSnapshot.empty) {
              const patientData = patientSnapshot.docs[0].data();

              // Obtener el último estado de ánimo del paciente
              const moodLogsQuery = query(
                collection(db, 'moodLogs'),
                where('userId', '==', patientId),
                orderBy('createdAt', 'desc'),
                limit(1)
              );
              const moodLogsSnapshot = await getDocs(moodLogsQuery);

              let lastMood = 3; // Valor por defecto
              let lastMoodDate = new Date();
              let progress = 50; // Valor por defecto

              if (!moodLogsSnapshot.empty) {
                const moodData = moodLogsSnapshot.docs[0].data();
                lastMood = moodData.mood || 3;
                lastMoodDate = moodData.createdAt?.toDate ? moodData.createdAt.toDate() : new Date();

                // Calcular progreso basado en los últimos 7 días
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);

                const recentMoodsQuery = query(
                  collection(db, 'moodLogs'),
                  where('userId', '==', patientId),
                  where('createdAt', '>=', weekAgo),
                  orderBy('createdAt', 'desc')
                );
                const recentMoodsSnapshot = await getDocs(recentMoodsQuery);

                if (!recentMoodsSnapshot.empty) {
                  const moods = recentMoodsSnapshot.docs.map((doc) => doc.data().mood || 3);
                  const averageMood = moods.reduce((sum, mood) => sum + mood, 0) / moods.length;
                  progress = Math.round((averageMood / 5) * 100);
                }
              }

              // Determinar estado y riesgo
              let status: 'stable' | 'attention' | 'urgent' = 'stable';
              let risk: 'low' | 'medium' | 'high' = 'low';

              if (lastMood <= 2) {
                status = 'urgent';
                risk = 'high';
                urgentPatients.push({
                  id: patientId,
                  name: patientData.name,
                  email: patientData.email,
                  mood: lastMood,
                  progress,
                  lastSession: getTimeAgo(lastMoodDate),
                  status,
                  risk,
                  nextSession: 'Urgente',
                  lastMoodDate,
                });
              } else if (lastMood === 3) {
                status = 'attention';
                risk = 'medium';
              }

              const patient: Patient = {
                id: patientId,
                name: patientData.name,
                email: patientData.email,
                mood: lastMood,
                progress,
                lastSession: getTimeAgo(lastMoodDate),
                status,
                risk,
                nextSession: status === 'urgent' ? 'Urgente' : 'Programar',
                lastMoodDate,
              };

              patientsList.push(patient);
              totalProgress += progress;
            }
          }
        }
      }

      // Obtener mensajes pendientes
      const messagesQuery = query(
        collection(db, 'chatMessages'),
        where('receiverId', '==', userProfile.uid),
        where('read', '==', false)
      );
      const messagesSnapshot = await getDocs(messagesQuery);
      const pendingMessages = messagesSnapshot.docs.length;

      // Calcular métricas
      const newMetrics: DashboardMetrics = {
        activePatients: patientsList.length,
        sessionsToday: 0, // Esto se puede implementar con una colección de sesiones
        pendingMessages,
        averageProgress: patientsList.length > 0 ? Math.round(totalProgress / patientsList.length) : 0,
      };

      setPatients(patientsList);
      setMetrics(newMetrics);
      setUrgentAlerts(urgentPatients);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Hace un momento';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} minutos`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
    if (diffInSeconds < 2592000) return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
    return date.toLocaleDateString('es-ES');
  };

  const getMoodEmoji = (mood: number) => {
    const emojis = ['😢', '😔', '😐', '🙂', '😊'];
    return emojis[mood - 1] || '😐';
  };

  const metricsData = [
    {
      title: 'Pacientes Activos',
      value: metrics.activePatients.toString(),
      change: `${urgentAlerts.length} urgentes`,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Sesiones Hoy',
      value: metrics.sessionsToday.toString(),
      change: 'Programar sesiones',
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Mensajes Pendientes',
      value: metrics.pendingMessages.toString(),
      change: `${urgentAlerts.length} urgentes`,
      icon: MessageCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Progreso Promedio',
      value: `${metrics.averageProgress}%`,
      change: 'Última semana',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
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
              <button
                onClick={() => setActiveTab('notifications')}
                className='relative p-2 text-gray-600 hover:text-primary-600 transition-colors'
              >
                <Bell className='w-6 h-6' />
                {urgentAlerts.length > 0 && (
                  <span className='absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full'></span>
                )}
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
          {loading
            ? // Loading skeleton
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className='bg-white rounded-xl shadow-lg border border-gray-100 p-6'>
                  <div className='animate-pulse'>
                    <div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
                    <div className='h-8 bg-gray-200 rounded w-1/2 mb-2'></div>
                    <div className='h-3 bg-gray-200 rounded w-2/3'></div>
                  </div>
                </div>
              ))
            : metricsData.map((metric, index) => {
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
        {urgentAlerts.length > 0 && (
          <div className='bg-red-50 border border-red-200 rounded-xl p-6 mb-8'>
            <div className='flex items-center space-x-3 mb-4'>
              <AlertTriangle className='w-6 h-6 text-red-600' />
              <h3 className='text-lg font-semibold text-red-800'>Alertas Urgentes</h3>
            </div>
            <div className='space-y-3'>
              {urgentAlerts.map((patient) => (
                <div
                  key={patient.id}
                  className='flex items-center justify-between p-3 bg-white rounded-lg border border-red-200'
                >
                  <div className='flex items-center space-x-3'>
                    <div className='w-3 h-3 bg-red-500 rounded-full'></div>
                    <span className='font-medium text-gray-900'>{patient.name}</span>
                    <span className='text-sm text-gray-600'>Estado de ánimo crítico ({patient.mood}/5)</span>
                  </div>
                  <button
                    onClick={() => navigate('/chat')}
                    className='text-red-600 hover:text-red-700 font-medium text-sm'
                  >
                    Ver detalles
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className='flex space-x-1 mb-8'>
          {[
            { id: 'overview', label: 'Resumen', icon: BarChart3 },
            { id: 'patients', label: 'Pacientes', icon: Users },
            { id: 'sessions', label: 'Sesiones', icon: Calendar },
            { id: 'notifications', label: 'Notificaciones', icon: Bell },
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
                {loading ? (
                  <div className='space-y-4'>
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={index}
                        className='flex items-center justify-between p-4 rounded-lg border border-gray-100'
                      >
                        <div className='animate-pulse flex items-center space-x-4'>
                          <div className='w-12 h-12 bg-gray-200 rounded-full'></div>
                          <div>
                            <div className='h-4 bg-gray-200 rounded w-32 mb-2'></div>
                            <div className='h-3 bg-gray-200 rounded w-24'></div>
                          </div>
                        </div>
                        <div className='animate-pulse flex items-center space-x-4'>
                          <div className='h-4 bg-gray-200 rounded w-16'></div>
                          <div className='h-6 bg-gray-200 rounded w-20'></div>
                          <div className='h-4 bg-gray-200 rounded w-16'></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : patients.length > 0 ? (
                  <div className='space-y-4'>
                    {patients.map((patient) => (
                      <div
                        key={patient.id}
                        className='flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all duration-200'
                      >
                        <div className='flex items-center space-x-4'>
                          <div className='w-12 h-12 bg-gradient-to-r from-primary-100 to-purple-100 rounded-full flex items-center justify-center text-2xl'>
                            {getMoodEmoji(patient.mood)}
                          </div>
                          <div>
                            <h4 className='font-semibold text-gray-900'>{patient.name}</h4>
                            <p className='text-sm text-gray-600'>Último estado de ánimo: {patient.lastSession}</p>
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

                          <button
                            onClick={() => navigate('/chat')}
                            className='flex items-center space-x-1 text-primary-600 hover:text-primary-700 font-medium text-sm'
                          >
                            <MessageCircle className='w-4 h-4' />
                            <span>Chat</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='text-center py-12'>
                    <Users className='w-16 h-16 text-gray-300 mx-auto mb-4' />
                    <h3 className='text-xl font-semibold text-gray-900 mb-2'>No hay pacientes</h3>
                    <p className='text-gray-600 mb-6'>
                      Los pacientes aparecerán aquí cuando inicien conversaciones contigo
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'patients' && <PatientManagement />}

          {activeTab === 'sessions' && <SessionScheduler />}

          {activeTab === 'notifications' && (
            <div className='space-y-6'>
              <h2 className='text-2xl font-bold text-gray-900 mb-6'>Notificaciones del Sistema</h2>

              {/* Alertas Urgentes */}
              {urgentAlerts.length > 0 ? (
                <div className='space-y-4'>
                  <h3 className='text-lg font-semibold text-gray-900'>Alertas Urgentes</h3>
                  {urgentAlerts.map((patient) => (
                    <div key={patient.id} className='p-4 bg-red-50 border border-red-200 rounded-lg'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center space-x-3'>
                          <AlertTriangle className='w-5 h-5 text-red-600' />
                          <div>
                            <h4 className='font-semibold text-red-800'>{patient.name}</h4>
                            <p className='text-sm text-red-600'>
                              Estado de ánimo crítico ({patient.mood}/5) - Requiere atención inmediata
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => navigate('/chat')}
                          className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors'
                        >
                          Contactar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-center py-12'>
                  <Bell className='w-16 h-16 text-gray-300 mx-auto mb-4' />
                  <h3 className='text-xl font-semibold text-gray-900 mb-2'>No hay notificaciones urgentes</h3>
                  <p className='text-gray-600'>Todo está bajo control</p>
                </div>
              )}

              {/* Notificaciones del Sistema */}
              <div className='mt-8'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>Notificaciones del Sistema</h3>
                <div className='space-y-3'>
                  <div className='p-4 bg-blue-50 border border-blue-200 rounded-lg'>
                    <div className='flex items-center space-x-3'>
                      <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                      <div>
                        <h4 className='font-medium text-blue-800'>Sistema actualizado</h4>
                        <p className='text-sm text-blue-600'>
                          Nuevas funcionalidades disponibles para el seguimiento de pacientes
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className='p-4 bg-green-50 border border-green-200 rounded-lg'>
                    <div className='flex items-center space-x-3'>
                      <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                      <div>
                        <h4 className='font-medium text-green-800'>Backup completado</h4>
                        <p className='text-sm text-green-600'>Respaldo de datos realizado exitosamente</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

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
