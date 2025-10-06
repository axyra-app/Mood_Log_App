import { collection, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { Activity, AlertTriangle, Heart, TrendingDown, TrendingUp, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { db } from '../../services/firebase';

interface PatientStats {
  totalPatients: number;
  activePatients: number;
  crisisAlerts: number;
  averageMood: number;
  moodTrend: 'up' | 'down' | 'stable';
  recentActivity: number;
  highRiskPatients: number;
}

interface PatientStatsPanelProps {
  psychologistId: string;
  isDarkMode: boolean;
}

const PatientStatsPanel: React.FC<PatientStatsPanelProps> = ({ psychologistId, isDarkMode }) => {
  const [stats, setStats] = useState<PatientStats>({
    totalPatients: 0,
    activePatients: 0,
    crisisAlerts: 0,
    averageMood: 0,
    moodTrend: 'stable',
    recentActivity: 0,
    highRiskPatients: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!psychologistId) return;

    // Escuchar cambios en pacientes
    const patientsQuery = query(collection(db, 'patients'), where('psychologistId', '==', psychologistId));

    const patientsUnsubscribe = onSnapshot(patientsQuery, (querySnapshot) => {
      const patients = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const activePatients = patients.filter((p) => p.status === 'active');
      const highRiskPatients = patients.filter((p) => p.riskLevel === 'high' || p.riskLevel === 'critical');

      setStats((prev) => ({
        ...prev,
        totalPatients: patients.length,
        activePatients: activePatients.length,
        highRiskPatients: highRiskPatients.length,
      }));
    });

    // Escuchar cambios en alertas de crisis
    const crisisQuery = query(
      collection(db, 'crisisAlerts'),
      where('psychologistId', '==', psychologistId),
      where('resolved', '==', false)
    );

    const crisisUnsubscribe = onSnapshot(crisisQuery, (querySnapshot) => {
      setStats((prev) => ({
        ...prev,
        crisisAlerts: querySnapshot.docs.length,
      }));
    });

    // Escuchar cambios en mood logs de pacientes
    const moodLogsQuery = query(collection(db, 'moodLogs'), orderBy('createdAt', 'desc'), limit(100));

    const moodLogsUnsubscribe = onSnapshot(moodLogsQuery, (querySnapshot) => {
      const moodLogs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Calcular estadísticas de mood
      const recentMoods = moodLogs
        .slice(0, 20)
        .map((log) => log.mood)
        .filter((mood) => mood !== undefined);
      const olderMoods = moodLogs
        .slice(20, 40)
        .map((log) => log.mood)
        .filter((mood) => mood !== undefined);

      const recentAvg =
        recentMoods.length > 0 ? recentMoods.reduce((sum, mood) => sum + mood, 0) / recentMoods.length : 0;
      const olderAvg = olderMoods.length > 0 ? olderMoods.reduce((sum, mood) => sum + mood, 0) / olderMoods.length : 0;

      let moodTrend: 'up' | 'down' | 'stable' = 'stable';
      if (recentAvg > olderAvg + 0.2) moodTrend = 'up';
      else if (recentAvg < olderAvg - 0.2) moodTrend = 'down';

      setStats((prev) => ({
        ...prev,
        averageMood: recentAvg,
        moodTrend,
        recentActivity: moodLogs.filter((log) => {
          const logDate = log.createdAt?.toDate() || new Date();
          const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          return logDate > oneDayAgo;
        }).length,
      }));

      setLoading(false);
    });

    return () => {
      patientsUnsubscribe();
      crisisUnsubscribe();
      moodLogsUnsubscribe();
    };
  }, [psychologistId]);

  const getMoodColor = (mood: number) => {
    if (mood >= 4) return 'text-green-600';
    if (mood >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className='w-4 h-4 text-green-600' />;
      case 'down':
        return <TrendingDown className='w-4 h-4 text-red-600' />;
      default:
        return <Activity className='w-4 h-4 text-gray-600' />;
    }
  };

  if (loading) {
    return (
      <div
        className={`p-6 rounded-xl border-2 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
      >
        <div className='animate-pulse'>
          <div className='h-6 bg-gray-300 rounded mb-4'></div>
          <div className='grid grid-cols-2 gap-4'>
            <div className='h-20 bg-gray-300 rounded'></div>
            <div className='h-20 bg-gray-300 rounded'></div>
            <div className='h-20 bg-gray-300 rounded'></div>
            <div className='h-20 bg-gray-300 rounded'></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-6 rounded-xl border-2 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
    >
      <h3 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        📊 Estadísticas de Pacientes
      </h3>

      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
        {/* Total de Pacientes */}
        <div
          className={`p-4 rounded-lg border ${
            isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}
        >
          <div className='flex items-center space-x-2 mb-2'>
            <Users className='w-5 h-5 text-blue-600' />
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Total Pacientes
            </span>
          </div>
          <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {stats.totalPatients}
          </div>
        </div>

        {/* Pacientes Activos */}
        <div
          className={`p-4 rounded-lg border ${
            isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}
        >
          <div className='flex items-center space-x-2 mb-2'>
            <Heart className='w-5 h-5 text-green-600' />
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Activos</span>
          </div>
          <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {stats.activePatients}
          </div>
        </div>

        {/* Alertas de Crisis */}
        <div
          className={`p-4 rounded-lg border ${
            isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}
        >
          <div className='flex items-center space-x-2 mb-2'>
            <AlertTriangle className='w-5 h-5 text-red-600' />
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Alertas Crisis
            </span>
          </div>
          <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {stats.crisisAlerts}
          </div>
        </div>

        {/* Promedio de Estado de Ánimo */}
        <div
          className={`p-4 rounded-lg border ${
            isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}
        >
          <div className='flex items-center space-x-2 mb-2'>
            <div className='flex items-center space-x-1'>
              <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Estado de Ánimo
              </span>
              {getTrendIcon(stats.moodTrend)}
            </div>
          </div>
          <div className={`text-2xl font-bold ${getMoodColor(stats.averageMood)}`}>{stats.averageMood.toFixed(1)}</div>
        </div>
      </div>

      {/* Estadísticas Adicionales */}
      <div className='mt-6 grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div
          className={`p-4 rounded-lg border ${
            isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}
        >
          <div className='flex items-center justify-between'>
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Pacientes de Alto Riesgo
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.highRiskPatients}
              </p>
            </div>
            <AlertTriangle className='w-8 h-8 text-orange-600' />
          </div>
        </div>

        <div
          className={`p-4 rounded-lg border ${
            isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}
        >
          <div className='flex items-center justify-between'>
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Actividad Reciente (24h)
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.recentActivity}
              </p>
            </div>
            <Activity className='w-8 h-8 text-blue-600' />
          </div>
        </div>
      </div>

      {/* Indicador de Tendencia */}
      <div className='mt-4 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200'>
        <div className='flex items-center space-x-2'>
          {getTrendIcon(stats.moodTrend)}
          <span className='text-sm font-medium text-gray-700'>
            {stats.moodTrend === 'up' && 'Tendencia positiva en el estado de ánimo de los pacientes'}
            {stats.moodTrend === 'down' && 'Tendencia negativa - requiere atención'}
            {stats.moodTrend === 'stable' && 'Estado de ánimo estable en los pacientes'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PatientStatsPanel;



