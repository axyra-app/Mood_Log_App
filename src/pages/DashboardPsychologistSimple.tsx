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

const DashboardPsychologistSimple: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  // Datos estáticos simulados
  const patients = [
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

  const appointments = [
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
      time: '11:30 AM',
      date: '2024-01-22',
      type: 'Sesión individual',
      duration: 50,
      status: 'confirmed',
      location: 'Online',
      notes: 'Revisión de progreso semanal',
    },
    {
      id: '3',
      patientName: 'Ana Martínez',
      patientId: '3',
      time: '2:00 PM',
      date: '2024-01-22',
      type: 'Sesión individual',
      duration: 50,
      status: 'pending',
      location: 'Presencial',
      notes: 'Primera sesión de seguimiento',
    },
    {
      id: '4',
      patientName: 'Luis Hernández',
      patientId: '4',
      time: '4:00 PM',
      date: '2024-01-22',
      type: 'Sesión de crisis',
      duration: 60,
      status: 'urgent',
      location: 'Online',
      notes: 'Sesión de emergencia - seguimiento de crisis',
    },
  ];

  const notifications = [
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
      type: 'info',
      title: 'Nueva cita programada',
      message: 'María González programó una cita para mañana',
      time: 'Hace 4 horas',
      patientId: '1',
      isRead: true,
    },
    {
      id: '3',
      type: 'warning',
      title: 'Medicación pendiente',
      message: 'Carlos Rodríguez no ha tomado su medicación hoy',
      time: 'Hace 6 horas',
      patientId: '2',
      isRead: false,
    },
    {
      id: '4',
      type: 'success',
      title: 'Nuevo registro de mood',
      message: 'Ana Martínez registró un mood de 4/5',
      time: 'Hace 6 horas',
      patientId: '3',
      isRead: true,
    },
  ];

  const stats = {
    totalPatients: patients.length,
    activePatients: patients.filter((p) => p.isActive).length,
    todayAppointments: appointments.length,
    weeklyAppointments: 12,
    averageMood: 3.6,
    satisfactionRate: 87,
    riskPatients: patients.filter((p) => p.riskLevel === 'high').length,
  };

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Funciones de utilidad
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

  const handlePatientClick = (patient: any) => {
    setSelectedPatient(patient);
    setShowPatientModal(true);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (status: string) => {
    setFilterStatus(status);
  };

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || patient.riskLevel === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <SEO 
        title="Dashboard Psicólogo - Mood Log App"
        description="Panel de control para psicólogos - Gestión de pacientes y seguimiento del estado de ánimo"
      />
      
      {/* Header */}
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Dashboard Psicólogo
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
              <button
                onClick={logout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Pacientes
                </p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.totalPatients}
                </p>
              </div>
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Pacientes Activos
                </p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.activePatients}
                </p>
              </div>
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Citas Hoy
                </p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.todayAppointments}
                </p>
              </div>
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Mood Promedio
                </p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.averageMood}/5
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Patients Section */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm mb-8`}>
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Pacientes
              </h2>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Buscar pacientes..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className={`px-3 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
                <select
                  value={filterStatus}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  className={`px-3 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  <option value="all">Todos</option>
                  <option value="high">Alto Riesgo</option>
                  <option value="medium">Riesgo Medio</option>
                  <option value="low">Bajo Riesgo</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Paciente
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Última Sesión
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Mood Promedio
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Riesgo
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Progreso
                  </th>
                </tr>
              </thead>
              <tbody className={`${isDarkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'}`}>
                {filteredPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    onClick={() => handlePatientClick(patient)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <span className="text-purple-600 font-medium">
                              {patient.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {patient.name}
                          </div>
                          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {patient.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                      {patient.lastSession}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                      {patient.averageMood}/5
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(patient.riskLevel)}`}>
                        {patient.riskLevel === 'high' ? 'Alto' : patient.riskLevel === 'medium' ? 'Medio' : 'Bajo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${patient.progress}%` }}
                          ></div>
                        </div>
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          {patient.progress}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Appointments Section */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm`}>
          <div className="p-6 border-b border-gray-200">
            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Citas de Hoy
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {appointment.patientName}
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {appointment.time} - {appointment.type}
                      </p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {appointment.location}
                      </p>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                      {appointment.status === 'confirmed' ? 'Confirmada' : 
                       appointment.status === 'pending' ? 'Pendiente' : 'Urgente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Patient Modal */}
      {showPatientModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {selectedPatient.name}
              </h3>
              <button
                onClick={() => setShowPatientModal(false)}
                className={`text-2xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Información Personal</h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Edad: {selectedPatient.age} años | Género: {selectedPatient.gender}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Teléfono: {selectedPatient.phone}
                </p>
              </div>
              <div>
                <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Diagnóstico</h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {selectedPatient.diagnosis}
                </p>
              </div>
              <div>
                <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Medicamentos</h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {selectedPatient.medications.length > 0 ? selectedPatient.medications.join(', ') : 'Ninguno'}
                </p>
              </div>
              <div>
                <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Objetivos</h4>
                <ul className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} list-disc list-inside`}>
                  {selectedPatient.goals.map((goal: string, index: number) => (
                    <li key={index}>{goal}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPsychologistSimple;
