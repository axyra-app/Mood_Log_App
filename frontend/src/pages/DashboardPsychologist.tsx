import { AlertTriangle, Calendar, FileText, LogOut, MessageCircle, Moon, Search, Sun, TrendingUp, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';

const DashboardPsychologist: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeView, setActiveView] = useState<'dashboard' | 'appointments' | 'medical-history' | 'patients' | 'chat'>('dashboard');

  // Datos simulados para evitar errores
  const mockStats = {
    totalPatients: 0,
    activePatients: 0,
    averageMood: 0,
    riskPatients: 0,
  };

  const mockPatients: any[] = [];

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
    }
    setIsLoaded(true);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  if (!isLoaded) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${
        isDarkMode ? 'bg-gray-900' : 'bg-white'
      }`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <header className={`border-b transition-colors duration-500 ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Logo className="h-8" />
              <div>
                <h1 className={`text-xl font-bold transition-colors duration-500 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Dashboard Psicólogo
                </h1>
                <p className={`text-sm transition-colors duration-500 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Bienvenido, {user.displayName}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <button
                onClick={handleLogout}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <nav className={`mb-8 p-1 rounded-lg transition-colors duration-500 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex space-x-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
              { id: 'appointments', label: 'Citas', icon: Calendar },
              { id: 'medical-history', label: 'Historial', icon: FileText },
              { id: 'patients', label: 'Pacientes', icon: Users },
              { id: 'chat', label: 'Chat', icon: MessageCircle },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveView(id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-300 ${
                  activeView === id
                    ? isDarkMode
                      ? 'bg-purple-600 text-white'
                      : 'bg-purple-500 text-white'
                    : isDarkMode
                    ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <div className="space-y-6">
          {activeView === 'dashboard' && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className={`p-6 rounded-xl shadow-sm transition-colors duration-500 ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                } border`}>
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className={`text-sm font-medium transition-colors duration-500 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Total Pacientes
                      </p>
                      <p className={`text-2xl font-bold transition-colors duration-500 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {mockStats.totalPatients}
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`p-6 rounded-xl shadow-sm transition-colors duration-500 ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                } border`}>
                  <div className="flex items-center">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className={`text-sm font-medium transition-colors duration-500 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Pacientes Activos
                      </p>
                      <p className={`text-2xl font-bold transition-colors duration-500 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {mockStats.activePatients}
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`p-6 rounded-xl shadow-sm transition-colors duration-500 ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                } border`}>
                  <div className="flex items-center">
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <AlertTriangle className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className={`text-sm font-medium transition-colors duration-500 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        En Riesgo
                      </p>
                      <p className={`text-2xl font-bold transition-colors duration-500 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {mockStats.riskPatients}
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`p-6 rounded-xl shadow-sm transition-colors duration-500 ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                } border`}>
                  <div className="flex items-center">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className={`text-sm font-medium transition-colors duration-500 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Estado Promedio
                      </p>
                      <p className={`text-2xl font-bold transition-colors duration-500 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {mockStats.averageMood.toFixed(1)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notifications Panel */}
              <div className={`p-6 rounded-xl shadow-sm transition-colors duration-500 ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              } border`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <h3 className={`text-xl font-semibold transition-colors duration-500 ${
                      isDarkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      Notificaciones
                    </h3>
                  </div>
                </div>
                <p className={`transition-colors duration-500 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Las notificaciones de nuevas citas aparecerán aquí
                </p>
              </div>
            </>
          )}

          {activeView === 'appointments' && (
            <div className={`p-6 rounded-xl shadow-sm transition-colors duration-500 ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } border`}>
              <h2 className={`text-xl font-semibold mb-4 transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Gestión de Citas
              </h2>
              <p className={`transition-colors duration-500 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                El sistema de gestión de citas estará disponible próximamente.
              </p>
            </div>
          )}

          {activeView === 'medical-history' && (
            <div className={`p-6 rounded-xl shadow-sm transition-colors duration-500 ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } border`}>
              <h2 className={`text-xl font-semibold mb-4 transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Historial Médico
              </h2>
              <p className={`transition-colors duration-500 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                El sistema de historial médico estará disponible próximamente.
              </p>
            </div>
          )}

          {activeView === 'patients' && (
            <div className={`p-6 rounded-xl shadow-sm transition-colors duration-500 ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } border`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-semibold transition-colors duration-500 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Mis Pacientes
                </h2>
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors duration-500 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <input
                    type="text"
                    placeholder="Buscar pacientes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-10 pr-4 py-2 border rounded-lg transition-colors duration-500 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
              </div>

              <div className="text-center py-8">
                <Users className={`w-12 h-12 mx-auto mb-4 transition-colors duration-500 ${
                  isDarkMode ? 'text-gray-600' : 'text-gray-400'
                }`} />
                <p className={`text-lg transition-colors duration-500 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  No tienes pacientes registrados
                </p>
                <p className={`text-sm transition-colors duration-500 ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  Los pacientes aparecerán aquí cuando se registren
                </p>
              </div>
            </div>
          )}

          {activeView === 'chat' && (
            <div className={`p-6 rounded-xl shadow-sm transition-colors duration-500 ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } border`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-semibold transition-colors duration-500 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Chat con Pacientes
                </h2>
                <button
                  onClick={() => navigate('/psychologist-chat')}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center space-x-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Abrir Chat</span>
                </button>
              </div>
              <p className={`transition-colors duration-500 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Sistema de chat en tiempo real con tus pacientes. Haz clic en "Abrir Chat" para acceder a todas las conversaciones activas.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPsychologist;