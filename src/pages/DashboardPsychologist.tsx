import {
  AlertTriangle,
  BarChart3,
  Bell,
  Calendar,
  MessageCircle,
  Phone,
  Search,
  Settings,
  TrendingUp,
  Users,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CrisisAlertsPanel from '../components/psychologist/CrisisAlertsPanel';
import PatientStatsPanel from '../components/psychologist/PatientStatsPanel';
import PsychologistNotifications from '../components/PsychologistNotifications';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../hooks/useNotificationsSimple';
import { usePatients } from '../hooks/usePatients';

const DashboardPsychologist: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Hook de notificaciones simplificado
  const { notifications } = useNotifications();
  const unreadCount = notifications.filter(n => n.type === 'info').length;

  // Hook de pacientes reales
  const { 
    patients, 
    loading: patientsLoading, 
    getPatientsByRiskLevel, 
    getPatientsNeedingAttention, 
    getStatistics 
  } = usePatients();

  // Datos estáticos simulados (en producción vendrían de Firebase) - SOLO PARA FALLBACK
  const fallbackPatients = [
    {
      id: '1',
      name: 'María González',
      email: 'maria.gonzalez@email.com',
      phone: '+52 55 1234 5678',
      lastSession: '2024-01-15',
      moodTrend: 'Mejorando',
      nextAppointment: '2024-01-22',
      totalSessions: 12,
      averageMood: 4.2,
      lastMood: 4,
      riskLevel: 'low',
      notes: 'Progreso excelente en manejo de ansiedad',
      age: 28,
      gender: 'Femenino',
      diagnosis: 'Trastorno de ansiedad generalizada',
      treatmentStart: '2023-10-15',
      progress: 85,
      emergencyContact: '+52 55 9876 5432',
      medications: ['Sertralina 50mg'],
      goals: ['Reducir ansiedad', 'Mejorar sueño', 'Aumentar confianza'],
      lastMoodDate: '2024-01-20',
      moodHistory: [3, 4, 3, 4, 4, 4, 4],
      isActive: true,
    },
    {
      id: '2',
      name: 'Carlos Rodríguez',
      email: 'carlos.rodriguez@email.com',
      phone: '+52 55 2345 6789',
      lastSession: '2024-01-18',
      moodTrend: 'Estable',
      nextAppointment: '2024-01-25',
      totalSessions: 8,
      averageMood: 3.8,
      lastMood: 4,
      riskLevel: 'medium',
      notes: 'Necesita más trabajo en técnicas de relajación',
      age: 35,
      gender: 'Masculino',
      diagnosis: 'Depresión moderada',
      treatmentStart: '2023-12-01',
      progress: 65,
      emergencyContact: '+52 55 8765 4321',
      medications: ['Fluoxetina 20mg'],
      goals: ['Mejorar estado de ánimo', 'Aumentar actividad física'],
      lastMoodDate: '2024-01-19',
      moodHistory: [3, 3, 4, 3, 4, 3, 4],
      isActive: true,
    },
    {
      id: '3',
      name: 'Ana Martínez',
      email: 'ana.martinez@email.com',
      phone: '+52 55 3456 7890',
      lastSession: '2024-01-20',
      moodTrend: 'Declinando',
      nextAppointment: '2024-01-23',
      totalSessions: 15,
      averageMood: 2.5,
      lastMood: 2,
      riskLevel: 'high',
      notes: 'Requiere atención inmediata - crisis emocional',
      age: 24,
      gender: 'Femenino',
      diagnosis: 'Trastorno límite de personalidad',
      treatmentStart: '2023-09-10',
      progress: 40,
      emergencyContact: '+52 55 7654 3210',
      medications: ['Quetiapina 100mg', 'Lorazepam 1mg'],
      goals: ['Estabilizar emociones', 'Reducir autolesiones'],
      lastMoodDate: '2024-01-21',
      moodHistory: [2, 2, 3, 2, 2, 1, 2],
      isActive: true,
    },
  ];

  const appointments = [
    {
      id: '1',
      patientId: '1',
      patientName: 'María González',
      date: '2024-01-22',
      time: '10:00',
      duration: 60,
      type: 'Individual',
      status: 'confirmed',
      notes: 'Seguimiento de técnicas de relajación',
    },
    {
      id: '2',
      patientId: '2',
      patientName: 'Carlos Rodríguez',
      date: '2024-01-22',
      time: '11:30',
      duration: 60,
      type: 'Individual',
      status: 'confirmed',
      notes: 'Evaluación de progreso',
    },
    {
      id: '3',
      patientId: '3',
      patientName: 'Ana Martínez',
      date: '2024-01-23',
      time: '09:00',
      duration: 90,
      type: 'Individual',
      status: 'urgent',
      notes: 'Sesión de crisis - URGENTE',
    },
  ];

  // Estadísticas reales
  const realStats = getStatistics();
  const highRiskPatients = getPatientsByRiskLevel('high');
  const patientsNeedingAttention = getPatientsNeedingAttention();

  // Usar pacientes reales o fallback si no hay datos
  const displayPatients = patients.length > 0 ? patients : fallbackPatients;

  const stats = {
    totalPatients: realStats.totalPatients || displayPatients.length,
    activePatients: realStats.activePatients || displayPatients.filter((p) => p.isActive).length,
    todayAppointments: appointments.filter((a) => a.date === '2024-01-22').length,
    weeklyAppointments: appointments.length,
    averageMood: realStats.averageMood || (displayPatients.reduce((sum, p) => sum + p.averageMood, 0) / displayPatients.length),
    satisfactionRate: 92,
    riskPatients: realStats.highRiskPatients || displayPatients.filter((p) => p.riskLevel === 'high').length,
    unreadMessages: 3,
    unreadNotifications: unreadCount,
  };

  useEffect(() => {
    setIsLoaded(true);
    setLoading(false);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const filteredPatients = displayPatients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'active' && patient.isActive) ||
      (filterStatus === 'risk' && patient.riskLevel === 'high');
    return matchesSearch && matchesFilter;
  });

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskText = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return 'Alto Riesgo';
      case 'medium':
        return 'Riesgo Medio';
      case 'low':
        return 'Bajo Riesgo';
      default:
        return 'Sin Riesgo';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: BarChart3 },
    { id: 'patients', label: 'Pacientes', icon: Users },
    { id: 'appointments', label: 'Citas', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'alerts', label: 'Alertas', icon: AlertTriangle },
  ];

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
    <>


      <div
        className={`min-h-screen transition-colors duration-500 ${
          isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'
        }`}
      >
        {/* Header */}
        <header
          className={`py-6 px-6 transition-colors duration-500 ${
            isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'
          } backdrop-blur-lg border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
        >
          <div className='max-w-7xl mx-auto flex items-center justify-between'>
            <Link to='/' className='flex items-center space-x-3 group'>
              <div className='w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300'>
                <span className='text-white font-black text-lg'>🧠</span>
              </div>
              <span
                className={`text-2xl font-black transition-colors duration-500 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                MOOD LOG - PSICÓLOGO
              </span>
            </Link>

            <div className='flex items-center space-x-4'>
              {/* Notificaciones */}
              <div className='relative'>
                <Bell
                  className={`w-6 h-6 transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
                />
                {stats.unreadNotifications > 0 && (
                  <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium'>
                    {stats.unreadNotifications > 99 ? '99+' : stats.unreadNotifications}
                  </span>
                )}
              </div>

              {/* Configuración */}
              <button
                onClick={() => setShowSettingsModal(true)}
                className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 ${
                  isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Settings className='w-6 h-6' />
              </button>

              {/* Dark Mode Toggle */}
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

              {/* User Info */}
              <div className={`px-4 py-2 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <p className='text-sm font-medium'>{user?.email}</p>
                <p className='text-xs opacity-75'>Psicólogo</p>
              </div>

              {/* Logout */}
              <button
                onClick={logout}
                className='px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium'
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className='max-w-7xl mx-auto p-6'>
          {/* Stats Cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
            <div
              className={`p-6 rounded-xl shadow-sm transition-colors duration-500 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <div className='flex items-center justify-between'>
                <div>
                  <p
                    className={`text-sm font-medium transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Total Pacientes
                  </p>
                  <p
                    className={`text-2xl font-bold transition-colors duration-500 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {stats.totalPatients}
                  </p>
                </div>
                <Users
                  className={`w-8 h-8 transition-colors duration-500 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}
                />
              </div>
            </div>

            <div
              className={`p-6 rounded-xl shadow-sm transition-colors duration-500 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <div className='flex items-center justify-between'>
                <div>
                  <p
                    className={`text-sm font-medium transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Citas Hoy
                  </p>
                  <p
                    className={`text-2xl font-bold transition-colors duration-500 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {stats.todayAppointments}
                  </p>
                </div>
                <Calendar
                  className={`w-8 h-8 transition-colors duration-500 ${
                    isDarkMode ? 'text-green-400' : 'text-green-600'
                  }`}
                />
              </div>
            </div>

            <div
              className={`p-6 rounded-xl shadow-sm transition-colors duration-500 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <div className='flex items-center justify-between'>
                <div>
                  <p
                    className={`text-sm font-medium transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Mood Promedio
                  </p>
                  <p
                    className={`text-2xl font-bold transition-colors duration-500 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {stats.averageMood.toFixed(1)}/5
                  </p>
                </div>
                <TrendingUp
                  className={`w-8 h-8 transition-colors duration-500 ${
                    isDarkMode ? 'text-purple-400' : 'text-purple-600'
                  }`}
                />
              </div>
            </div>

            <div
              className={`p-6 rounded-xl shadow-sm transition-colors duration-500 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <div className='flex items-center justify-between'>
                <div>
                  <p
                    className={`text-sm font-medium transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Pacientes en Riesgo
                  </p>
                  <p
                    className={`text-2xl font-bold transition-colors duration-500 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {stats.riskPatients}
                  </p>
                </div>
                <AlertTriangle
                  className={`w-8 h-8 transition-colors duration-500 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}
                />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div
            className={`mb-6 rounded-xl p-1 transition-colors duration-500 ${
              isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
            }`}
          >
            <div className='flex space-x-1'>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? isDarkMode
                          ? 'bg-gray-700 text-white shadow-sm'
                          : 'bg-white text-gray-900 shadow-sm'
                        : isDarkMode
                        ? 'text-gray-400 hover:text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className='w-4 h-4' />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div
            className={`rounded-xl shadow-sm transition-colors duration-500 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
          >
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className='p-6'>
                <h2
                  className={`text-2xl font-bold mb-6 transition-colors duration-500 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  📊 Resumen General
                </h2>

                <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                  {/* Crisis Alerts Panel */}
                  <CrisisAlertsPanel psychologistId={user?.uid || ''} isDarkMode={isDarkMode} />

                  {/* Patient Stats Panel */}
                  <PatientStatsPanel psychologistId={user?.uid || ''} isDarkMode={isDarkMode} />

                  {/* Notifications Panel */}
                  <PsychologistNotifications />
                </div>

                {/* Recent Activity */}
                <div className='mt-8'>
                  <h3
                    className={`text-lg font-semibold mb-4 transition-colors duration-500 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    📈 Actividad Reciente
                  </h3>
                  <div className='space-y-3'>
                    {patients.slice(0, 3).map((patient) => (
                      <div
                        key={patient.id}
                        className={`p-4 rounded-lg border transition-colors duration-500 ${
                          isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className='flex items-center justify-between'>
                          <div>
                            <h4
                              className={`font-medium transition-colors duration-500 ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}
                            >
                              {patient.name}
                            </h4>
                            <p
                              className={`text-sm transition-colors duration-500 ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                              }`}
                            >
                              Última sesión: {patient.lastSession}
                            </p>
                          </div>
                          <div className='flex items-center space-x-2'>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(
                                patient.riskLevel
                              )}`}
                            >
                              {getRiskText(patient.riskLevel)}
                            </span>
                            <span
                              className={`text-sm font-medium transition-colors duration-500 ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}
                            >
                              Mood: {patient.lastMood}/5
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Patients Tab */}
            {activeTab === 'patients' && (
              <div className='p-6'>
                <div className='flex items-center justify-between mb-6'>
                  <h2
                    className={`text-2xl font-bold transition-colors duration-500 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    👥 Gestión de Pacientes
                  </h2>

                  <div className='flex items-center space-x-4'>
                    {/* Search */}
                    <div className='relative'>
                      <Search
                        className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors duration-500 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}
                      />
                      <input
                        type='text'
                        placeholder='Buscar pacientes...'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`pl-10 pr-4 py-2 rounded-lg border transition-colors duration-500 ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                      />
                    </div>

                    {/* Filter */}
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className={`px-3 py-2 rounded-lg border transition-colors duration-500 ${
                        isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value='all'>Todos</option>
                      <option value='active'>Activos</option>
                      <option value='risk'>En Riesgo</option>
                    </select>
                  </div>
                </div>

                {/* Patients List */}
                <div className='space-y-4'>
                  {filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className={`p-6 rounded-xl border transition-colors duration-500 ${
                        isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className='flex items-center justify-between'>
                        <div className='flex-1'>
                          <div className='flex items-center space-x-4 mb-2'>
                            <h3
                              className={`text-lg font-semibold transition-colors duration-500 ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}
                            >
                              {patient.name}
                            </h3>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(
                                patient.riskLevel
                              )}`}
                            >
                              {getRiskText(patient.riskLevel)}
                            </span>
                          </div>

                          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
                            <div>
                              <p
                                className={`font-medium transition-colors duration-500 ${
                                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}
                              >
                                📧 {patient.email}
                              </p>
                              <p
                                className={`transition-colors duration-500 ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}
                              >
                                📞 {patient.phone}
                              </p>
                            </div>
                            <div>
                              <p
                                className={`transition-colors duration-500 ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}
                              >
                                📅 Última sesión: {patient.lastSession}
                              </p>
                              <p
                                className={`transition-colors duration-500 ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}
                              >
                                📊 Mood promedio: {patient.averageMood}/5
                              </p>
                            </div>
                            <div>
                              <p
                                className={`transition-colors duration-500 ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}
                              >
                                🎯 Progreso: {patient.progress}%
                              </p>
                              <p
                                className={`transition-colors duration-500 ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}
                              >
                                📝 Sesiones: {patient.totalSessions}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className='flex items-center space-x-2'>
                          <button
                            onClick={() => {
                              setSelectedPatient(patient);
                              setShowPatientModal(true);
                            }}
                            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium'
                          >
                            Ver Detalles
                          </button>
                          <button className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium'>
                            <MessageCircle className='w-4 h-4' />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Appointments Tab */}
            {activeTab === 'appointments' && (
              <div className='p-6'>
                <h2
                  className={`text-2xl font-bold mb-6 transition-colors duration-500 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  📅 Gestión de Citas
                </h2>

                <div className='space-y-4'>
                  {appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className={`p-6 rounded-xl border transition-colors duration-500 ${
                        isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className='flex items-center justify-between'>
                        <div className='flex-1'>
                          <div className='flex items-center space-x-4 mb-2'>
                            <h3
                              className={`text-lg font-semibold transition-colors duration-500 ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}
                            >
                              {appointment.patientName}
                            </h3>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                appointment.status === 'urgent'
                                  ? 'text-red-600 bg-red-100'
                                  : appointment.status === 'confirmed'
                                  ? 'text-green-600 bg-green-100'
                                  : 'text-yellow-600 bg-yellow-100'
                              }`}
                            >
                              {appointment.status === 'urgent'
                                ? 'URGENTE'
                                : appointment.status === 'confirmed'
                                ? 'Confirmada'
                                : 'Pendiente'}
                            </span>
                          </div>

                          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
                            <div>
                              <p
                                className={`font-medium transition-colors duration-500 ${
                                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}
                              >
                                📅 {appointment.date}
                              </p>
                              <p
                                className={`transition-colors duration-500 ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}
                              >
                                🕐 {appointment.time}
                              </p>
                            </div>
                            <div>
                              <p
                                className={`transition-colors duration-500 ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}
                              >
                                ⏱️ Duración: {appointment.duration} min
                              </p>
                              <p
                                className={`transition-colors duration-500 ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}
                              >
                                📋 Tipo: {appointment.type}
                              </p>
                            </div>
                            <div>
                              <p
                                className={`transition-colors duration-500 ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}
                              >
                                📝 {appointment.notes}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className='flex items-center space-x-2'>
                          <button className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium'>
                            <Phone className='w-4 h-4' />
                          </button>
                          <button className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium'>
                            <MessageCircle className='w-4 h-4' />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className='p-6'>
                <h2
                  className={`text-2xl font-bold mb-6 transition-colors duration-500 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  📊 Analytics y Reportes
                </h2>

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                  {/* Mood Trends */}
                  <div
                    className={`p-6 rounded-xl border transition-colors duration-500 ${
                      isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <h3
                      className={`text-lg font-semibold mb-4 transition-colors duration-500 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      📈 Tendencias de Mood
                    </h3>
                    <div className='space-y-3'>
                      {patients.map((patient) => (
                        <div key={patient.id} className='flex items-center justify-between'>
                          <span
                            className={`text-sm transition-colors duration-500 ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}
                          >
                            {patient.name}
                          </span>
                          <div className='flex items-center space-x-2'>
                            <div className='w-20 h-2 bg-gray-200 rounded-full overflow-hidden'>
                              <div
                                className='h-full bg-gradient-to-r from-red-500 to-green-500'
                                style={{ width: `${(patient.averageMood / 5) * 100}%` }}
                              />
                            </div>
                            <span
                              className={`text-sm font-medium transition-colors duration-500 ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}
                            >
                              {patient.averageMood.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Session Statistics */}
                  <div
                    className={`p-6 rounded-xl border transition-colors duration-500 ${
                      isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <h3
                      className={`text-lg font-semibold mb-4 transition-colors duration-500 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      📊 Estadísticas de Sesiones
                    </h3>
                    <div className='space-y-4'>
                      <div className='flex items-center justify-between'>
                        <span
                          className={`text-sm transition-colors duration-500 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}
                        >
                          Total de sesiones esta semana
                        </span>
                        <span
                          className={`text-lg font-bold transition-colors duration-500 ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {stats.weeklyAppointments}
                        </span>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span
                          className={`text-sm transition-colors duration-500 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}
                        >
                          Tasa de satisfacción
                        </span>
                        <span
                          className={`text-lg font-bold transition-colors duration-500 ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {stats.satisfactionRate}%
                        </span>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span
                          className={`text-sm transition-colors duration-500 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}
                        >
                          Pacientes activos
                        </span>
                        <span
                          className={`text-lg font-bold transition-colors duration-500 ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {stats.activePatients}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Alerts Tab */}
            {activeTab === 'alerts' && (
              <div className='p-6'>
                <h2
                  className={`text-2xl font-bold mb-6 transition-colors duration-500 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  🚨 Alertas y Crisis
                </h2>

                <div className='space-y-4'>
                  {patients
                    .filter((p) => p.riskLevel === 'high')
                    .map((patient) => (
                      <div
                        key={patient.id}
                        className={`p-6 rounded-xl border-2 border-red-500 transition-colors duration-500 ${
                          isDarkMode ? 'bg-red-900/20' : 'bg-red-50'
                        }`}
                      >
                        <div className='flex items-center justify-between'>
                          <div className='flex-1'>
                            <div className='flex items-center space-x-4 mb-2'>
                              <AlertTriangle className='w-6 h-6 text-red-600' />
                              <h3
                                className={`text-lg font-semibold transition-colors duration-500 ${
                                  isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}
                              >
                                {patient.name} - ALERTA DE CRISIS
                              </h3>
                              <span className='px-2 py-1 rounded-full text-xs font-medium text-red-600 bg-red-100'>
                                ALTO RIESGO
                              </span>
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                              <div>
                                <p
                                  className={`font-medium transition-colors duration-500 ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                  }`}
                                >
                                  📧 {patient.email}
                                </p>
                                <p
                                  className={`transition-colors duration-500 ${
                                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                  }`}
                                >
                                  📞 {patient.phone}
                                </p>
                              </div>
                              <div>
                                <p
                                  className={`transition-colors duration-500 ${
                                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                  }`}
                                >
                                  🚨 Contacto de emergencia: {patient.emergencyContact}
                                </p>
                                <p
                                  className={`transition-colors duration-500 ${
                                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                  }`}
                                >
                                  📊 Mood actual: {patient.lastMood}/5
                                </p>
                              </div>
                            </div>

                            <div className='mt-3'>
                              <p
                                className={`text-sm transition-colors duration-500 ${
                                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}
                              >
                                <strong>Notas:</strong> {patient.notes}
                              </p>
                            </div>
                          </div>

                          <div className='flex items-center space-x-2'>
                            <button className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium'>
                              <Phone className='w-4 h-4' />
                            </button>
                            <button className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium'>
                              <MessageCircle className='w-4 h-4' />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPsychologist;
