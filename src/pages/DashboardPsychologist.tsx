import {
  AlertTriangle,
  BarChart3,
  Bell,
  Calendar,
  CheckCircle,
  Clock,
  MessageCircle,
  Phone,
  Search,
  TrendingUp,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { useAuth } from '../contexts/AuthContext';

const DashboardPsychologist: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [stats, setStats] = useState({
    totalPatients: 0,
    activePatients: 0,
    todayAppointments: 0,
    weeklyAppointments: 0,
    averageMood: 0,
    satisfactionRate: 0,
    riskPatients: 0,
  });

  useEffect(() => {
    setIsLoaded(true);
    loadPsychologistData();
  }, []);

  const loadPsychologistData = async () => {
    try {
      // Usar datos simulados para evitar problemas de Firebase
      const patientsData = [
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
          lastSession: '2024-01-14',
          moodTrend: 'Estable',
          nextAppointment: '2024-01-21',
          totalSessions: 8,
          averageMood: 3.5,
          lastMood: 3,
          riskLevel: 'medium',
          notes: 'Necesita más trabajo en técnicas de relajación',
          age: 35,
          gender: 'Masculino',
          diagnosis: 'Depresión moderada',
          treatmentStart: '2023-11-01',
          progress: 60,
          emergencyContact: '+52 55 8765 4321',
          medications: ['Fluoxetina 20mg'],
          goals: ['Mejorar estado de ánimo', 'Aumentar actividad física'],
          lastMoodDate: '2024-01-19',
          moodHistory: [2, 3, 3, 3, 3, 3, 3],
          isActive: true,
        },
        {
          id: '3',
          name: 'Ana Martínez',
          email: 'ana.martinez@email.com',
          phone: '+52 55 3456 7890',
          lastSession: '2024-01-16',
          moodTrend: 'Mejorando',
          nextAppointment: '2024-01-23',
          totalSessions: 6,
          averageMood: 3.8,
          lastMood: 4,
          riskLevel: 'low',
          notes: 'Muy comprometida con el tratamiento',
          age: 24,
          gender: 'Femenino',
          diagnosis: 'Trastorno adaptativo',
          treatmentStart: '2023-12-01',
          progress: 75,
          emergencyContact: '+52 55 7654 3210',
          medications: [],
          goals: ['Adaptación al cambio', 'Manejo del estrés'],
          lastMoodDate: '2024-01-21',
          moodHistory: [3, 3, 4, 4, 4, 4, 4],
          isActive: true,
        },
        {
          id: '4',
          name: 'Luis Hernández',
          email: 'luis.hernandez@email.com',
          phone: '+52 55 4567 8901',
          lastSession: '2024-01-10',
          moodTrend: 'Declinando',
          nextAppointment: '2024-01-24',
          totalSessions: 15,
          averageMood: 2.8,
          lastMood: 2,
          riskLevel: 'high',
          notes: 'Requiere atención inmediata - crisis reciente',
          age: 42,
          gender: 'Masculino',
          diagnosis: 'Trastorno bipolar',
          treatmentStart: '2023-08-15',
          progress: 40,
          emergencyContact: '+52 55 6543 2109',
          medications: ['Litio 300mg', 'Quetiapina 100mg'],
          goals: ['Estabilizar estado de ánimo', 'Prevenir crisis'],
          lastMoodDate: '2024-01-18',
          moodHistory: [2, 2, 1, 2, 2, 2, 2],
          isActive: true,
        },
        ];

      setPatients(patientsData);

      // Usar datos simulados para citas
      const appointmentsData = [
        {
          id: '1',
          patientName: 'María González',
          patientId: '1',
          time: '10:00 AM',
          date: '2024-01-22',
          type: 'Sesión individual',
          duration: 50,
          status: 'confirmed',
          location: 'Presencial',
          notes: 'Seguimiento de técnicas de relajación',
        },
        {
          id: '2',
          patientName: 'Carlos Rodríguez',
          patientId: '2',
          time: '2:00 PM',
          date: '2024-01-22',
          type: 'Sesión individual',
          duration: 50,
          status: 'confirmed',
          location: 'Online',
          notes: 'Evaluación de progreso',
        },
        {
          id: '3',
          patientName: 'Ana Martínez',
          patientId: '3',
          time: '4:00 PM',
          date: '2024-01-22',
          type: 'Sesión individual',
          duration: 50,
          status: 'pending',
          location: 'Presencial',
          notes: 'Primera sesión de la semana',
        },
        {
          id: '4',
          patientName: 'Luis Hernández',
          patientId: '4',
          time: '6:00 PM',
          date: '2024-01-22',
          type: 'Sesión de crisis',
          duration: 60,
          status: 'urgent',
          location: 'Online',
          notes: 'Sesión de emergencia - seguimiento de crisis',
        },
        ];
      }

      setAppointments(appointmentsData);

      // Usar datos simulados para notificaciones
      const notificationsData = [
        {
          id: '1',
          type: 'urgent',
          title: 'Paciente en crisis',
          message: 'Luis Hernández reportó pensamientos suicidas',
          time: 'Hace 2 horas',
          patientId: '4',
          isRead: false,
        },
        {
          id: '2',
          type: 'appointment',
          title: 'Cita confirmada',
          message: 'María González confirmó su cita de las 10:00 AM',
          time: 'Hace 4 horas',
          patientId: '1',
          isRead: true,
        },
        {
          id: '3',
          type: 'mood',
          title: 'Nuevo registro de mood',
          message: 'Ana Martínez registró un mood de 4/5',
          time: 'Hace 6 horas',
          patientId: '3',
          isRead: true,
        },
        ];

      setNotifications(notificationsData);

      // Calcular estadísticas
      const activePatients = patientsData.filter((p) => p.isActive).length;
      const riskPatients = patientsData.filter((p) => p.riskLevel === 'high').length;
      const todayAppointments = appointmentsData.length;
      const averageMood = patientsData.reduce((sum, p) => sum + p.averageMood, 0) / patientsData.length;

      setStats({
        totalPatients: patientsData.length,
        activePatients,
        todayAppointments,
        weeklyAppointments: 12,
        averageMood: Math.round(averageMood * 10) / 10,
        satisfactionRate: 87,
        riskPatients,
      });
    } catch (error) {
      console.error('Error loading psychologist data:', error);
      
      // En caso de error, establecer datos vacíos para evitar crashes
      setPatients([]);
      setAppointments([]);
      setNotifications([]);
      setStats({
        totalPatients: 0,
        activePatients: 0,
        todayAppointments: 0,
        weeklyAppointments: 0,
        averageMood: 0,
        satisfactionRate: 0,
        riskPatients: 0,
      });
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Funciones de utilidad
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'high':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'urgent':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getMoodEmoji = (mood: number) => {
    const emojis = ['😢', '😕', '😐', '🙂', '😊'];
    return emojis[mood - 1] || '😐';
  };

  // Filtros
  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'active' && patient.isActive) ||
      (filterStatus === 'risk' && patient.riskLevel === 'high') ||
      (filterStatus === 'inactive' && !patient.isActive);
    return matchesSearch && matchesFilter;
  });

  const handlePatientClick = (patient: any) => {
    setSelectedPatient(patient);
    setShowPatientModal(true);
  };

  const handleNotificationClick = (notification: any) => {
    // Marcar como leída
    setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)));

    // Si es de un paciente, abrir modal
    if (notification.patientId) {
      const patient = patients.find((p) => p.id === notification.patientId);
      if (patient) {
        handlePatientClick(patient);
      }
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
    <>
      <SEO
        title='Dashboard Psicólogo - Mood Log App'
        description='Panel profesional para psicólogos - Gestión de pacientes y seguimiento emocional'
        keywords='psicólogo, dashboard, pacientes, terapia, salud mental'
      />

      <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
        {/* Header */}
        <header
          className={`py-6 px-6 transition-colors duration-500 ${
            isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'
          } backdrop-blur-lg border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
        >
          <div className='max-w-7xl mx-auto flex items-center justify-between'>
            <Link to='/' className='flex items-center space-x-3 group'>
              <div className='w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300'>
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
              {/* Búsqueda */}
              <div className='relative'>
                <Search
                  className={`w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                />
                <input
                  type='text'
                  placeholder='Buscar pacientes...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 pr-4 py-2 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-600 text-white focus:border-green-500 focus:ring-green-500/20'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-green-500 focus:ring-green-500/20'
                  }`}
                />
              </div>

              {/* Notificaciones */}
              <div className='relative'>
                <button
                  className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 ${
                    isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Bell className='w-5 h-5' />
                  {notifications.filter((n) => !n.isRead).length > 0 && (
                    <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
                      {notifications.filter((n) => !n.isRead).length}
                    </span>
                  )}
                </button>
              </div>

              {/* Filtros */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`px-3 py-2 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-600 text-white focus:border-green-500 focus:ring-green-500/20'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-green-500 focus:ring-green-500/20'
                }`}
              >
                <option value='all'>Todos los pacientes</option>
                <option value='active'>Activos</option>
                <option value='risk'>Alto riesgo</option>
                <option value='inactive'>Inactivos</option>
              </select>

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
        <main className='max-w-7xl mx-auto px-6 py-8'>
          {/* Welcome Section */}
          <div
            className={`p-8 rounded-2xl border-2 mb-8 transition-all duration-300 ${
              isDarkMode
                ? 'bg-gray-800 border-gray-700 hover:border-green-500'
                : 'bg-white border-gray-200 hover:border-green-500'
            }`}
          >
            <div className='text-center'>
              <div className='text-6xl mb-4'>👨‍⚕️</div>
              <h1
                className={`text-4xl font-black mb-4 transition-colors duration-500 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                ¡HOLA {user?.displayName?.toUpperCase() || 'PSICÓLOGO'}! 👋
              </h1>
              <p className={`text-lg transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Panel profesional para el seguimiento de pacientes
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
            <div
              className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700 hover:border-blue-500'
                  : 'bg-white border-gray-200 hover:border-blue-500'
              }`}
            >
              <div className='flex items-center space-x-4'>
                <div className='text-4xl'>👥</div>
                <div>
                  <h3
                    className={`text-2xl font-black transition-colors duration-500 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {stats.activePatients}
                  </h3>
                  <p
                    className={`text-sm transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Pacientes Activos
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700 hover:border-green-500'
                  : 'bg-white border-gray-200 hover:border-green-500'
              }`}
            >
              <div className='flex items-center space-x-4'>
                <div className='text-4xl'>📅</div>
                <div>
                  <h3
                    className={`text-2xl font-black transition-colors duration-500 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {stats.todayAppointments}
                  </h3>
                  <p
                    className={`text-sm transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Citas Hoy
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700 hover:border-purple-500'
                  : 'bg-white border-gray-200 hover:border-purple-500'
              }`}
            >
              <div className='flex items-center space-x-4'>
                <div className='text-4xl'>📊</div>
                <div>
                  <h3
                    className={`text-2xl font-black transition-colors duration-500 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {stats.averageMood}/5
                  </h3>
                  <p
                    className={`text-sm transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Mood Promedio
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700 hover:border-red-500'
                  : 'bg-white border-gray-200 hover:border-red-500'
              }`}
            >
              <div className='flex items-center space-x-4'>
                <div className='text-4xl'>⚠️</div>
                <div>
                  <h3
                    className={`text-2xl font-black transition-colors duration-500 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {stats.riskPatients}
                  </h3>
                  <p
                    className={`text-sm transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Alto Riesgo
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Patients and Appointments */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            {/* Patients List */}
            <div
              className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700 hover:border-green-500'
                  : 'bg-white border-gray-200 hover:border-green-500'
              }`}
            >
              <h3
                className={`text-2xl font-black mb-6 transition-colors duration-500 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                👥 PACIENTES ACTIVOS
              </h3>
              <div className='space-y-4'>
                {filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    onClick={() => handlePatientClick(patient)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer hover:scale-105 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 hover:border-green-400'
                        : 'bg-gray-50 border-gray-200 hover:border-green-400'
                    }`}
                  >
                    <div className='space-y-3'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <h4
                            className={`font-bold transition-colors duration-500 ${
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
                        <div className='text-right'>
                          <div className='flex items-center space-x-2 mb-2'>
                            <span className='text-2xl'>{getMoodEmoji(patient.lastMood)}</span>
                            <span
                              className={`text-sm font-bold px-3 py-1 rounded-full ${getRiskColor(patient.riskLevel)}`}
                            >
                              {patient.riskLevel === 'low'
                                ? 'Bajo riesgo'
                                : patient.riskLevel === 'medium'
                                ? 'Riesgo medio'
                                : 'Alto riesgo'}
                            </span>
                          </div>
                          <span
                            className={`text-sm font-bold px-3 py-1 rounded-full ${
                              patient.moodTrend === 'Mejorando'
                                ? 'bg-green-100 text-green-800'
                                : patient.moodTrend === 'Estable'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {patient.moodTrend}
                          </span>
                        </div>
                      </div>

                      <div className='flex items-center justify-between text-sm'>
                        <div className='flex items-center space-x-4'>
                          <span
                            className={`flex items-center space-x-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
                          >
                            <BarChart3 className='w-4 h-4' />
                            <span>Mood: {patient.lastMood}/5</span>
                          </span>
                          <span
                            className={`flex items-center space-x-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
                          >
                            <Calendar className='w-4 h-4' />
                            <span>{patient.totalSessions} sesiones</span>
                          </span>
                          <span
                            className={`flex items-center space-x-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
                          >
                            <TrendingUp className='w-4 h-4' />
                            <span>{patient.progress}% progreso</span>
                          </span>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {patient.age} años
                          </span>
                          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {patient.gender}
                          </span>
                        </div>
                      </div>

                      <div className='flex items-center space-x-2'>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Lógica para chat
                          }}
                          className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm transition-colors ${
                            isDarkMode
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                          }`}
                        >
                          <MessageCircle className='w-4 h-4' />
                          <span>Chat</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Lógica para ver estadísticas
                          }}
                          className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm transition-colors ${
                            isDarkMode
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                        >
                          <BarChart3 className='w-4 h-4' />
                          <span>Stats</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Lógica para llamar
                          }}
                          className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm transition-colors ${
                            isDarkMode
                              ? 'bg-purple-600 text-white hover:bg-purple-700'
                              : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                          }`}
                        >
                          <Phone className='w-4 h-4' />
                          <span>Llamar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Appointments */}
            <div
              className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700 hover:border-blue-500'
                  : 'bg-white border-gray-200 hover:border-blue-500'
              }`}
            >
              <h3
                className={`text-2xl font-black mb-6 transition-colors duration-500 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                📅 CITAS DE HOY
              </h3>
              <div className='space-y-4'>
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 hover:border-blue-400'
                        : 'bg-gray-50 border-gray-200 hover:border-blue-400'
                    }`}
                  >
                    <div className='space-y-3'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <h4
                            className={`font-bold transition-colors duration-500 ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            {appointment.patientName}
                          </h4>
                          <p
                            className={`text-sm transition-colors duration-500 ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}
                          >
                            {appointment.type}
                          </p>
                        </div>
                        <div className='text-right'>
                          <span
                            className={`text-sm font-bold transition-colors duration-500 ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            {appointment.time}
                          </span>
                          <p
                            className={`text-xs transition-colors duration-500 ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}
                          >
                            {appointment.duration} min
                          </p>
                        </div>
                      </div>

                      <div className='flex items-center justify-between'>
                        <span
                          className={`flex items-center space-x-1 text-sm px-3 py-1 rounded-full ${getStatusColor(
                            appointment.status
                          )}`}
                        >
                          {appointment.status === 'confirmed' ? (
                            <CheckCircle className='w-4 h-4' />
                          ) : appointment.status === 'urgent' ? (
                            <AlertTriangle className='w-4 h-4' />
                          ) : (
                            <Clock className='w-4 h-4' />
                          )}
                          <span>
                            {appointment.status === 'confirmed'
                              ? 'Confirmada'
                              : appointment.status === 'urgent'
                              ? 'Urgente'
                              : 'Pendiente'}
                          </span>
                        </span>

                        <div className='flex items-center space-x-2'>
                          <button
                            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                              isDarkMode
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                            }`}
                          >
                            Iniciar
                          </button>
                          <button
                            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                              isDarkMode
                                ? 'bg-gray-600 text-white hover:bg-gray-700'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                          >
                            Reprogramar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal de detalles del paciente */}
      {showPatientModal && selectedPatient && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div
            className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border-2 ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            <div className='p-6'>
              {/* Header del modal */}
              <div className='flex items-center justify-between mb-6'>
                <h2 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  📋 PERFIL DEL PACIENTE
                </h2>
                <button
                  onClick={() => setShowPatientModal(false)}
                  className={`p-2 rounded-xl transition-colors ${
                    isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  ✕
                </button>
              </div>

              {/* Información básica */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
                <div
                  className={`p-4 rounded-xl border-2 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <h3 className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Información Personal
                  </h3>
                  <div className='space-y-2'>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <strong>Nombre:</strong> {selectedPatient.name}
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <strong>Email:</strong> {selectedPatient.email}
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <strong>Teléfono:</strong> {selectedPatient.phone}
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <strong>Edad:</strong> {selectedPatient.age} años
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <strong>Género:</strong> {selectedPatient.gender}
                    </p>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-xl border-2 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <h3 className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Estado Actual
                  </h3>
                  <div className='space-y-2'>
                    <div className='flex items-center space-x-2'>
                      <span className='text-2xl'>{getMoodEmoji(selectedPatient.lastMood)}</span>
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Mood actual: {selectedPatient.lastMood}/5
                      </span>
                    </div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <strong>Promedio:</strong> {selectedPatient.averageMood}/5
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <strong>Progreso:</strong> {selectedPatient.progress}%
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <strong>Sesiones:</strong> {selectedPatient.totalSessions}
                    </p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getRiskColor(
                        selectedPatient.riskLevel
                      )}`}
                    >
                      {selectedPatient.riskLevel === 'low'
                        ? 'Bajo riesgo'
                        : selectedPatient.riskLevel === 'medium'
                        ? 'Riesgo medio'
                        : 'Alto riesgo'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Información clínica */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
                <div
                  className={`p-4 rounded-xl border-2 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <h3 className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Diagnóstico y Tratamiento
                  </h3>
                  <div className='space-y-2'>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <strong>Diagnóstico:</strong> {selectedPatient.diagnosis}
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <strong>Inicio del tratamiento:</strong> {selectedPatient.treatmentStart}
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <strong>Medicamentos:</strong>{' '}
                      {selectedPatient.medications.length > 0 ? selectedPatient.medications.join(', ') : 'Ninguno'}
                    </p>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-xl border-2 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <h3 className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Objetivos</h3>
                  <div className='space-y-1'>
                    {selectedPatient.goals.map((goal: string, index: number) => (
                      <p key={index} className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        • {goal}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Notas y contacto de emergencia */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
                <div
                  className={`p-4 rounded-xl border-2 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <h3 className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Notas del Psicólogo
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{selectedPatient.notes}</p>
                </div>

                <div
                  className={`p-4 rounded-xl border-2 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <h3 className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Contacto de Emergencia
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {selectedPatient.emergencyContact}
                  </p>
                </div>
              </div>

              {/* Historial de mood */}
              <div
                className={`p-4 rounded-xl border-2 ${
                  isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <h3 className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Historial de Mood (Últimos 7 días)
                </h3>
                <div className='flex items-center space-x-2'>
                  {selectedPatient.moodHistory.map((mood: number, index: number) => (
                    <div key={index} className='flex flex-col items-center space-y-1'>
                      <span className='text-2xl'>{getMoodEmoji(mood)}</span>
                      <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>D{index + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botones de acción */}
              <div className='flex items-center justify-end space-x-4 mt-6'>
                <button
                  onClick={() => setShowPatientModal(false)}
                  className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                    isDarkMode
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Cerrar
                </button>
                <button
                  className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                    isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  Editar Perfil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardPsychologist;
