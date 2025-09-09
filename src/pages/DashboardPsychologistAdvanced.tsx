import React, { useEffect, useState } from 'react';
import SEO from '../components/SEO';
import AnalyticsDashboard from '../components/psychologist/AnalyticsDashboard';
import AppointmentsCalendar from '../components/psychologist/AppointmentsCalendar';
import ChatInterface from '../components/psychologist/ChatInterface';
import NotificationsCenter from '../components/psychologist/NotificationsCenter';
import PatientManagement from '../components/psychologist/PatientManagement';
import SessionNotes from '../components/psychologist/SessionNotes';
import TreatmentPlans from '../components/psychologist/TreatmentPlans';
import { useAuth } from '../contexts/AuthContext';
import { getUnreadMessageCount } from '../services/chatService';
import { getNotifications, markNotificationAsRead, subscribeToNotifications } from '../services/notificationService';
import {
  getAppointments,
  getPatientStatistics,
  getPatientsByPsychologist,
  subscribeToAppointments,
  subscribeToPatients,
} from '../services/patientService';
import { Appointment, Patient, PushNotification } from '../types';

const DashboardPsychologistAdvanced: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    activePatients: 0,
    todayAppointments: 0,
    unreadMessages: 0,
    unreadNotifications: 0,
    averageMood: 0,
    riskPatients: 0,
  });

  useEffect(() => {
    if (user?.uid) {
      loadDashboardData();
      setupRealtimeSubscriptions();
    }
  }, [user?.uid]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Cargar datos iniciales
      const [patientsData, appointmentsData, notificationsData] = await Promise.all([
        getPatientsByPsychologist(user!.uid),
        getAppointments(user!.uid),
        getNotifications(user!.uid, 20),
      ]);

      setPatients(patientsData);
      setAppointments(appointmentsData);
      setNotifications(notificationsData);

      // Calcular estadísticas
      await calculateStats(patientsData, appointmentsData, notificationsData);
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    if (!user?.uid) return;

    // Suscripciones en tiempo real
    const unsubscribePatients = subscribeToPatients(user.uid, setPatients);
    const unsubscribeAppointments = subscribeToAppointments(user.uid, setAppointments);
    const unsubscribeNotifications = subscribeToNotifications(user.uid, setNotifications);

    return () => {
      unsubscribePatients();
      unsubscribeAppointments();
      unsubscribeNotifications();
    };
  };

  const calculateStats = async (
    patientsData: Patient[],
    appointmentsData: Appointment[],
    notificationsData: PushNotification[]
  ) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayAppointments = appointmentsData.filter(
      (apt) => apt.startTime >= today && apt.status !== 'cancelled'
    ).length;

    const activePatients = patientsData.filter((p) => p.status === 'active').length;
    const riskPatients = patientsData.filter((p) => p.riskLevel === 'high').length;

    // Calcular mood promedio
    let totalMood = 0;
    let moodCount = 0;

    for (const patient of patientsData) {
      try {
        const patientStats = await getPatientStatistics(patient.id);
        if (patientStats.averageMoodAfter > 0) {
          totalMood += patientStats.averageMoodAfter;
          moodCount++;
        }
      } catch (error) {
        console.error('Error calculando estadísticas del paciente:', error);
      }
    }

    const averageMood = moodCount > 0 ? totalMood / moodCount : 0;

    // Contar mensajes no leídos
    let unreadMessages = 0;
    try {
      unreadMessages = await getUnreadMessageCount(user!.uid);
    } catch (error) {
      console.error('Error contando mensajes no leídos:', error);
    }

    setStats({
      totalPatients: patientsData.length,
      activePatients,
      todayAppointments,
      unreadMessages,
      unreadNotifications: notificationsData.filter((n) => !n.read).length,
      averageMood: Math.round(averageMood * 10) / 10,
      riskPatients,
    });
  };

  const handleNotificationClick = async (notification: PushNotification) => {
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
    }

    // Navegar a la sección relevante
    if (notification.type === 'message') {
      setActiveTab('chat');
    } else if (notification.type === 'appointment') {
      setActiveTab('appointments');
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title='Dashboard Psicólogo - Mood Log App'
        description='Panel profesional para psicólogos - Gestión completa de pacientes y seguimiento emocional'
        keywords='psicólogo, dashboard, pacientes, terapia, salud mental, gestión clínica'
      />

      <div className='min-h-screen bg-gray-50'>
        {/* Header */}
        <header className='bg-white shadow-sm border-b border-gray-200'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='flex justify-between items-center py-4'>
              <div className='flex items-center space-x-4'>
                <div className='w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center'>
                  <span className='text-white font-black text-lg'>🧠</span>
                </div>
                <div>
                  <h1 className='text-2xl font-bold text-gray-900'>Dashboard Psicólogo</h1>
                  <p className='text-sm text-gray-600'>Bienvenido, {user?.displayName || 'Dr. Psicólogo'}</p>
                </div>
              </div>

              <div className='flex items-center space-x-4'>
                <NotificationsCenter notifications={notifications} onNotificationClick={handleNotificationClick} />
                <div className='text-sm text-gray-600'>
                  {stats.unreadMessages > 0 && (
                    <span className='bg-red-500 text-white px-2 py-1 rounded-full text-xs'>
                      {stats.unreadMessages} mensajes
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className='bg-white border-b border-gray-200'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='flex space-x-8'>
              {[
                { id: 'overview', label: 'Resumen', icon: '📊' },
                { id: 'patients', label: 'Pacientes', icon: '👥' },
                { id: 'sessions', label: 'Sesiones', icon: '📝' },
                { id: 'treatments', label: 'Tratamientos', icon: '🎯' },
                { id: 'appointments', label: 'Citas', icon: '📅' },
                { id: 'chat', label: 'Chat', icon: '💬' },
                { id: 'analytics', label: 'Analytics', icon: '📈' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className='mr-2'>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          {activeTab === 'overview' && (
            <div className='space-y-6'>
              {/* Stats Cards */}
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                <div className='bg-white overflow-hidden shadow rounded-lg'>
                  <div className='p-5'>
                    <div className='flex items-center'>
                      <div className='flex-shrink-0'>
                        <div className='text-2xl'>👥</div>
                      </div>
                      <div className='ml-5 w-0 flex-1'>
                        <dl>
                          <dt className='text-sm font-medium text-gray-500 truncate'>Pacientes Activos</dt>
                          <dd className='text-lg font-medium text-gray-900'>{stats.activePatients}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='bg-white overflow-hidden shadow rounded-lg'>
                  <div className='p-5'>
                    <div className='flex items-center'>
                      <div className='flex-shrink-0'>
                        <div className='text-2xl'>📅</div>
                      </div>
                      <div className='ml-5 w-0 flex-1'>
                        <dl>
                          <dt className='text-sm font-medium text-gray-500 truncate'>Citas Hoy</dt>
                          <dd className='text-lg font-medium text-gray-900'>{stats.todayAppointments}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='bg-white overflow-hidden shadow rounded-lg'>
                  <div className='p-5'>
                    <div className='flex items-center'>
                      <div className='flex-shrink-0'>
                        <div className='text-2xl'>😊</div>
                      </div>
                      <div className='ml-5 w-0 flex-1'>
                        <dl>
                          <dt className='text-sm font-medium text-gray-500 truncate'>Mood Promedio</dt>
                          <dd className='text-lg font-medium text-gray-900'>{stats.averageMood}/5</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='bg-white overflow-hidden shadow rounded-lg'>
                  <div className='p-5'>
                    <div className='flex items-center'>
                      <div className='flex-shrink-0'>
                        <div className='text-2xl'>⚠️</div>
                      </div>
                      <div className='ml-5 w-0 flex-1'>
                        <dl>
                          <dt className='text-sm font-medium text-gray-500 truncate'>Alto Riesgo</dt>
                          <dd className='text-lg font-medium text-gray-900'>{stats.riskPatients}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                <div className='bg-white shadow rounded-lg'>
                  <div className='px-4 py-5 sm:p-6'>
                    <h3 className='text-lg leading-6 font-medium text-gray-900 mb-4'>Pacientes Recientes</h3>
                    <div className='space-y-3'>
                      {patients.slice(0, 5).map((patient) => (
                        <div key={patient.id} className='flex items-center justify-between'>
                          <div className='flex items-center'>
                            <div className='flex-shrink-0 h-10 w-10'>
                              <div className='h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center'>
                                <span className='text-sm font-medium text-gray-700'>
                                  {patient.userId.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className='ml-4'>
                              <div className='text-sm font-medium text-gray-900'>Paciente {patient.id.slice(0, 8)}</div>
                              <div className='text-sm text-gray-500'>
                                {patient.status === 'active' ? 'Activo' : 'Inactivo'}
                              </div>
                            </div>
                          </div>
                          <div className='flex items-center'>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                patient.riskLevel === 'high'
                                  ? 'bg-red-100 text-red-800'
                                  : patient.riskLevel === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {patient.riskLevel === 'high'
                                ? 'Alto'
                                : patient.riskLevel === 'medium'
                                ? 'Medio'
                                : 'Bajo'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className='bg-white shadow rounded-lg'>
                  <div className='px-4 py-5 sm:p-6'>
                    <h3 className='text-lg leading-6 font-medium text-gray-900 mb-4'>Próximas Citas</h3>
                    <div className='space-y-3'>
                      {appointments.slice(0, 5).map((appointment) => (
                        <div key={appointment.id} className='flex items-center justify-between'>
                          <div>
                            <div className='text-sm font-medium text-gray-900'>{appointment.title}</div>
                            <div className='text-sm text-gray-500'>
                              {new Date(appointment.startTime).toLocaleDateString()} -{' '}
                              {new Date(appointment.startTime).toLocaleTimeString()}
                            </div>
                          </div>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              appointment.status === 'confirmed'
                                ? 'bg-green-100 text-green-800'
                                : appointment.status === 'scheduled'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {appointment.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'patients' && <PatientManagement patients={patients} onPatientUpdate={loadDashboardData} />}

          {activeTab === 'sessions' && <SessionNotes patients={patients} />}

          {activeTab === 'treatments' && <TreatmentPlans patients={patients} />}

          {activeTab === 'appointments' && (
            <AppointmentsCalendar
              appointments={appointments}
              patients={patients}
              onAppointmentUpdate={loadDashboardData}
            />
          )}

          {activeTab === 'chat' && <ChatInterface psychologistId={user?.uid || ''} />}

          {activeTab === 'analytics' && <AnalyticsDashboard patients={patients} />}
        </main>
      </div>
    </>
  );
};

export default DashboardPsychologistAdvanced;
