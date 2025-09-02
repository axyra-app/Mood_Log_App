import { collection, getDocs, query, where } from 'firebase/firestore';
import { Calendar, MessageCircle, Phone, TrendingDown, TrendingUp, User, Video } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';

interface Patient {
  id: string;
  name: string;
  email: string;
  lastMoodLog?: any;
  moodTrend: 'up' | 'down' | 'stable';
  riskLevel: 'low' | 'medium' | 'high';
  lastSession?: any;
  nextSession?: any;
  totalSessions: number;
  progress: number;
  isOnline: boolean;
}

const PatientManagement = () => {
  const { userProfile } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  useEffect(() => {
    if (userProfile?.uid) {
      fetchPatients();
    }
  }, [userProfile?.uid]);

  const fetchPatients = async () => {
    if (!userProfile?.uid) return;

    try {
      // Get all users (patients)
      const usersQuery = query(collection(db, 'users'), where('role', '==', 'user'));
      const usersSnapshot = await getDocs(usersQuery);

      const patientsData: Patient[] = [];

      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();

        // Get patient's mood logs
        const moodLogsQuery = query(
          collection(db, 'moodLogs'),
          where('userId', '==', userDoc.id),
          where('createdAt', '>=', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) // Last 30 days
        );
        const moodLogsSnapshot = await getDocs(moodLogsQuery);
        const moodLogs = moodLogsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        // Calculate mood trend
        let moodTrend: 'up' | 'down' | 'stable' = 'stable';
        if (moodLogs.length >= 2) {
          const recentMoods = moodLogs.slice(-7).map((log) => log.mood);
          const olderMoods = moodLogs.slice(-14, -7).map((log) => log.mood);

          if (recentMoods.length > 0 && olderMoods.length > 0) {
            const recentAvg = recentMoods.reduce((sum, mood) => sum + mood, 0) / recentMoods.length;
            const olderAvg = olderMoods.reduce((sum, mood) => sum + mood, 0) / olderMoods.length;

            if (recentAvg > olderAvg + 0.5) moodTrend = 'up';
            else if (recentAvg < olderAvg - 0.5) moodTrend = 'down';
          }
        }

        // Calculate risk level
        let riskLevel: 'low' | 'medium' | 'high' = 'low';
        if (moodLogs.length > 0) {
          const recentMoods = moodLogs.slice(-7).map((log) => log.mood);
          const avgMood = recentMoods.reduce((sum, mood) => sum + mood, 0) / recentMoods.length;

          if (avgMood <= 2) riskLevel = 'high';
          else if (avgMood <= 3) riskLevel = 'medium';
        }

        // Get conversations with this patient
        const conversationsQuery = query(
          collection(db, 'conversations'),
          where(`participants.${userDoc.id}`, '==', true),
          where(`participants.${userProfile.uid}`, '==', true)
        );
        const conversationsSnapshot = await getDocs(conversationsQuery);
        const totalSessions = conversationsSnapshot.size;

        const patient: Patient = {
          id: userDoc.id,
          name: userData.name,
          email: userData.email,
          lastMoodLog: moodLogs.length > 0 ? moodLogs[moodLogs.length - 1] : null,
          moodTrend,
          riskLevel,
          totalSessions,
          progress: Math.min(100, (moodLogs.length / 30) * 100), // Progress based on consistency
          isOnline: Math.random() > 0.5, // Simulate online status
        };

        patientsData.push(patient);
      }

      // Sort by risk level and recent activity
      patientsData.sort((a, b) => {
        const riskOrder = { high: 3, medium: 2, low: 1 };
        if (riskOrder[a.riskLevel] !== riskOrder[b.riskLevel]) {
          return riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
        }
        return b.progress - a.progress;
      });

      setPatients(patientsData);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className='w-4 h-4 text-green-600' />;
      case 'down':
        return <TrendingDown className='w-4 h-4 text-red-600' />;
      default:
        return <div className='w-4 h-4 bg-gray-400 rounded-full' />;
    }
  };

  const formatLastActivity = (lastMoodLog: any) => {
    if (!lastMoodLog) return 'Sin actividad reciente';

    const date = lastMoodLog.createdAt.toDate ? lastMoodLog.createdAt.toDate() : new Date(lastMoodLog.createdAt);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return `Hace ${diffInHours} horas`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Hace ${diffInDays} días`;
    }
  };

  if (loading) {
    return (
      <div className='space-y-4'>
        {[1, 2, 3].map((i) => (
          <div key={i} className='animate-pulse bg-gray-200 h-20 rounded-lg'></div>
        ))}
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Patient List */}
      <div className='space-y-4'>
        {patients.map((patient) => (
          <div
            key={patient.id}
            className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md cursor-pointer ${
              selectedPatient?.id === patient.id
                ? 'border-primary-200 bg-primary-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
            onClick={() => setSelectedPatient(patient)}
          >
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-4'>
                <div className='relative'>
                  <div className='w-12 h-12 bg-gradient-to-r from-primary-100 to-purple-100 rounded-full flex items-center justify-center'>
                    <User className='w-6 h-6 text-primary-600' />
                  </div>
                  {patient.isOnline && (
                    <div className='absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white'></div>
                  )}
                </div>

                <div>
                  <h3 className='font-semibold text-gray-900'>{patient.name}</h3>
                  <p className='text-sm text-gray-600'>{patient.email}</p>
                  <p className='text-xs text-gray-500'>Última actividad: {formatLastActivity(patient.lastMoodLog)}</p>
                </div>
              </div>

              <div className='flex items-center space-x-4'>
                {/* Mood Trend */}
                <div className='flex items-center space-x-1'>
                  {getTrendIcon(patient.moodTrend)}
                  <span className='text-sm text-gray-600'>
                    {patient.lastMoodLog ? `${patient.lastMoodLog.mood}/5` : 'N/A'}
                  </span>
                </div>

                {/* Progress */}
                <div className='text-right'>
                  <div className='text-sm font-medium text-gray-900'>{patient.progress.toFixed(0)}%</div>
                  <div className='w-20 bg-gray-200 rounded-full h-2'>
                    <div className='bg-primary-600 h-2 rounded-full' style={{ width: `${patient.progress}%` }}></div>
                  </div>
                </div>

                {/* Risk Level */}
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getRiskColor(patient.riskLevel)}`}
                >
                  {patient.riskLevel === 'high'
                    ? 'Alto Riesgo'
                    : patient.riskLevel === 'medium'
                    ? 'Riesgo Medio'
                    : 'Bajo Riesgo'}
                </span>

                {/* Actions */}
                <div className='flex items-center space-x-2'>
                  <button className='p-2 text-gray-600 hover:text-primary-600 transition-colors'>
                    <MessageCircle className='w-4 h-4' />
                  </button>
                  <button className='p-2 text-gray-600 hover:text-primary-600 transition-colors'>
                    <Phone className='w-4 h-4' />
                  </button>
                  <button className='p-2 text-gray-600 hover:text-primary-600 transition-colors'>
                    <Video className='w-4 h-4' />
                  </button>
                  <button className='p-2 text-gray-600 hover:text-primary-600 transition-colors'>
                    <Calendar className='w-4 h-4' />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Patient Details */}
      {selectedPatient && (
        <div className='bg-white rounded-xl shadow-lg border border-gray-100 p-6'>
          <div className='flex items-center justify-between mb-6'>
            <h3 className='text-xl font-semibold text-gray-900'>Detalles de {selectedPatient.name}</h3>
            <button
              onClick={() => setSelectedPatient(null)}
              className='p-2 text-gray-400 hover:text-gray-600 transition-colors'
            >
              ×
            </button>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {/* Patient Info */}
            <div>
              <h4 className='font-medium text-gray-900 mb-3'>Información del Paciente</h4>
              <div className='space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Email:</span>
                  <span className='text-gray-900'>{selectedPatient.email}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Sesiones:</span>
                  <span className='text-gray-900'>{selectedPatient.totalSessions}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Estado:</span>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      selectedPatient.isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {selectedPatient.isOnline ? 'En línea' : 'Desconectado'}
                  </span>
                </div>
              </div>
            </div>

            {/* Mood Analysis */}
            <div>
              <h4 className='font-medium text-gray-900 mb-3'>Análisis de Estado de Ánimo</h4>
              <div className='space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Último estado:</span>
                  <span className='text-gray-900'>
                    {selectedPatient.lastMoodLog ? `${selectedPatient.lastMoodLog.mood}/5` : 'N/A'}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Tendencia:</span>
                  <div className='flex items-center space-x-1'>
                    {getTrendIcon(selectedPatient.moodTrend)}
                    <span className='text-gray-900 capitalize'>{selectedPatient.moodTrend}</span>
                  </div>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Progreso:</span>
                  <span className='text-gray-900'>{selectedPatient.progress.toFixed(0)}%</span>
                </div>
              </div>
            </div>

            {/* Risk Assessment */}
            <div>
              <h4 className='font-medium text-gray-900 mb-3'>Evaluación de Riesgo</h4>
              <div className='space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Nivel de riesgo:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(selectedPatient.riskLevel)}`}>
                    {selectedPatient.riskLevel === 'high'
                      ? 'Alto'
                      : selectedPatient.riskLevel === 'medium'
                      ? 'Medio'
                      : 'Bajo'}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Última actividad:</span>
                  <span className='text-gray-900'>{formatLastActivity(selectedPatient.lastMoodLog)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='mt-6 pt-6 border-t border-gray-200'>
            <div className='flex space-x-3'>
              <button className='btn-primary'>
                <MessageCircle className='w-4 h-4 mr-2' />
                Iniciar Chat
              </button>
              <button className='btn-secondary'>
                <Calendar className='w-4 h-4 mr-2' />
                Programar Sesión
              </button>
              <button className='btn-secondary'>
                <Phone className='w-4 h-4 mr-2' />
                Llamada
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientManagement;
