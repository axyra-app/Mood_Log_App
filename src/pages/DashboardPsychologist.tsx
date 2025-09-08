import { BarChart3, Calendar, CheckCircle, Clock, MessageCircle } from 'lucide-react';
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

  useEffect(() => {
    setIsLoaded(true);
    loadPsychologistData();
  }, []);

  const loadPsychologistData = () => {
    // Simular datos de pacientes más detallados
    setPatients([
      {
        id: '1',
        name: 'María González',
        email: 'maria.gonzalez@email.com',
        lastSession: '2024-01-15',
        moodTrend: 'Mejorando',
        nextAppointment: '2024-01-22',
        totalSessions: 12,
        averageMood: 4.2,
        lastMood: 4,
        riskLevel: 'low',
        notes: 'Progreso excelente en manejo de ansiedad',
      },
      {
        id: '2',
        name: 'Carlos Rodríguez',
        email: 'carlos.rodriguez@email.com',
        lastSession: '2024-01-14',
        moodTrend: 'Estable',
        nextAppointment: '2024-01-21',
        totalSessions: 8,
        averageMood: 3.5,
        lastMood: 3,
        riskLevel: 'medium',
        notes: 'Necesita más trabajo en técnicas de relajación',
      },
      {
        id: '3',
        name: 'Ana Martínez',
        email: 'ana.martinez@email.com',
        lastSession: '2024-01-16',
        moodTrend: 'Mejorando',
        nextAppointment: '2024-01-23',
        totalSessions: 6,
        averageMood: 3.8,
        lastMood: 4,
        riskLevel: 'low',
        notes: 'Muy comprometida con el tratamiento',
      },
    ]);

    // Simular citas más detalladas
    setAppointments([
      {
        id: '1',
        patientName: 'María González',
        patientId: '1',
        time: '10:00 AM',
        date: '2024-01-22',
        type: 'Sesión individual',
        duration: 50,
        status: 'confirmed',
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
      },
    ]);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
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
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
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
                    {patients.length}
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
                    {appointments.length}
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
                    85%
                  </h3>
                  <p
                    className={`text-sm transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Satisfacción
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
                {patients.map((patient) => (
                  <div
                    key={patient.id}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
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
                          <span
                            className={`text-sm font-bold px-3 py-1 rounded-full ${
                              patient.moodTrend === 'Mejorando'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
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
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            patient.riskLevel === 'low'
                              ? 'bg-green-100 text-green-800'
                              : patient.riskLevel === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {patient.riskLevel === 'low'
                            ? 'Bajo riesgo'
                            : patient.riskLevel === 'medium'
                            ? 'Riesgo medio'
                            : 'Alto riesgo'}
                        </span>
                      </div>

                      <div className='flex items-center space-x-2'>
                        <button
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
                          className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm transition-colors ${
                            isDarkMode
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                        >
                          <BarChart3 className='w-4 h-4' />
                          <span>Ver Stats</span>
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
                          className={`flex items-center space-x-1 text-sm ${
                            appointment.status === 'confirmed' ? 'text-green-600' : 'text-yellow-600'
                          }`}
                        >
                          {appointment.status === 'confirmed' ? (
                            <CheckCircle className='w-4 h-4' />
                          ) : (
                            <Clock className='w-4 h-4' />
                          )}
                          <span>{appointment.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}</span>
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
    </>
  );
};

export default DashboardPsychologist;
