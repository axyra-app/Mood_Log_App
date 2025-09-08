import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  BarChart3, 
  MessageCircle, 
  Settings, 
  LogOut, 
  User, 
  Calendar,
  TrendingUp,
  Heart,
  Brain,
  Bell,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface MoodLog {
  id: string;
  mood: number;
  description: string;
  emotion: string;
  sentiment: string;
  createdAt: Timestamp;
}

interface DashboardStats {
  totalLogs: number;
  averageMood: number;
  streak: number;
  lastLogDate: string | null;
}

const Dashboard: React.FC = () => {
  const { user, userProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalLogs: 0,
    averageMood: 0,
    streak: 0,
    lastLogDate: null
  });
  const [recentLogs, setRecentLogs] = useState<MoodLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch recent mood logs
      const logsRef = collection(db, 'moodLogs');
      const q = query(
        logsRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      
      const querySnapshot = await getDocs(q);
      const logs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MoodLog[];

      setRecentLogs(logs);

      // Calculate stats
      const totalLogs = logs.length;
      const averageMood = logs.length > 0 
        ? logs.reduce((sum, log) => sum + log.mood, 0) / logs.length 
        : 0;
      
      // Calculate streak (simplified)
      const streak = calculateStreak(logs);
      
      // Get last log date
      const lastLogDate = logs.length > 0 
        ? logs[0].createdAt.toDate().toLocaleDateString('es-ES')
        : null;

      setStats({
        totalLogs,
        averageMood: Math.round(averageMood * 10) / 10,
        streak,
        lastLogDate
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (logs: MoodLog[]): number => {
    if (logs.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < logs.length; i++) {
      const logDate = logs[i].createdAt.toDate();
      logDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
      } else if (daysDiff > streak) {
        break;
      }
    }
    
    return streak;
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const getMoodEmoji = (mood: number) => {
    const emojis = ['😢', '😕', '😐', '🙂', '😊'];
    return emojis[Math.round(mood) - 1] || '😐';
  };

  const getMoodColor = (mood: number) => {
    if (mood <= 2) return 'text-red-500';
    if (mood <= 3) return 'text-orange-500';
    if (mood <= 4) return 'text-yellow-500';
    return 'text-green-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
        <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-white shadow-xl">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Mood Log</h2>
            <button onClick={() => setSidebarOpen(false)}>
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <SidebarContent userProfile={userProfile} onSignOut={handleSignOut} />
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:bg-white lg:border-r lg:border-gray-200">
        <div className="flex items-center justify-center p-4 border-b">
          <h2 className="text-xl font-bold text-primary-600">😊 Mood Log</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <SidebarContent userProfile={userProfile} onSignOut={handleSignOut} />
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              <div className="flex items-center space-x-4">
                <button className="p-2 rounded-full text-gray-500 hover:text-gray-600 hover:bg-gray-100">
                  <Bell className="w-6 h-6" />
                </button>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {userProfile?.displayName || user?.email}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard content */}
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Welcome section */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              {getGreeting()}, {userProfile?.displayName?.split(' ')[0] || 'Usuario'}! 👋
            </h1>
            <p className="text-gray-600 mt-1">
              {stats.lastLogDate 
                ? `Último registro: ${stats.lastLogDate}`
                : 'Aún no has registrado tu estado de ánimo'
              }
            </p>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Link
              to="/mood-flow"
              className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-lg"
            >
              <div className="flex items-center space-x-3">
                <Plus className="w-8 h-8" />
                <div>
                  <h3 className="text-lg font-semibold">Registrar Estado de Ánimo</h3>
                  <p className="text-primary-100 text-sm">Comparte cómo te sientes hoy</p>
                </div>
              </div>
            </Link>

            <Link
              to="/statistics"
              className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-8 h-8 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Estadísticas</h3>
                  <p className="text-gray-600 text-sm">Ve tu progreso y tendencias</p>
                </div>
              </div>
            </Link>

            <Link
              to="/chat"
              className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <MessageCircle className="w-8 h-8 text-green-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Chat</h3>
                  <p className="text-gray-600 text-sm">Conecta con tu psicólogo</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Heart className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Registros</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalLogs}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Promedio de Ánimo</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageMood || '-'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Racha Actual</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.streak} días</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Análisis IA</p>
                  <p className="text-2xl font-bold text-gray-900">{recentLogs.filter(log => log.emotion).length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent logs */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Registros Recientes</h3>
            </div>
            <div className="p-6">
              {recentLogs.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📝</div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No hay registros aún</h4>
                  <p className="text-gray-600 mb-4">Comienza registrando tu primer estado de ánimo</p>
                  <Link
                    to="/mood-flow"
                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Registrar Estado de Ánimo
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl">{getMoodEmoji(log.mood)}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className={`text-lg font-semibold ${getMoodColor(log.mood)}`}>
                            {log.mood}/5
                          </span>
                          {log.emotion && (
                            <span className="text-sm text-gray-600">• {log.emotion}</span>
                          )}
                        </div>
                        {log.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {log.description}
                          </p>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {log.createdAt.toDate().toLocaleDateString('es-ES')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sidebar content component
const SidebarContent: React.FC<{ userProfile: any; onSignOut: () => void }> = ({ userProfile, onSignOut }) => {
  return (
    <>
      <Link
        to="/dashboard"
        className="flex items-center space-x-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
      >
        <User className="w-5 h-5" />
        <span>Dashboard</span>
      </Link>
      <Link
        to="/mood-flow"
        className="flex items-center space-x-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
      >
        <Plus className="w-5 h-5" />
        <span>Registrar Estado</span>
      </Link>
      <Link
        to="/statistics"
        className="flex items-center space-x-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
      >
        <BarChart3 className="w-5 h-5" />
        <span>Estadísticas</span>
      </Link>
      <Link
        to="/chat"
        className="flex items-center space-x-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
      >
        <MessageCircle className="w-5 h-5" />
        <span>Chat</span>
      </Link>
      <Link
        to="/settings"
        className="flex items-center space-x-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
      >
        <Settings className="w-5 h-5" />
        <span>Configuración</span>
      </Link>
      <button
        onClick={onSignOut}
        className="w-full flex items-center space-x-3 px-3 py-2 text-red-600 rounded-lg hover:bg-red-50"
      >
        <LogOut className="w-5 h-5" />
        <span>Cerrar Sesión</span>
      </button>
    </>
  );
};

export default Dashboard;
