// Diary History Component
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { Calendar, Clock, MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';

interface DiaryEntry {
  id: string;
  text: string;
  mood: number;
  moodLabel: string;
  timestamp: any;
  aiAnalysis?: {
    emotion: string;
    confidence: number;
    sentiment: string;
  };
}

const DiaryHistory = () => {
  const { userProfile } = useAuth();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userProfile) {
      fetchDiaryEntries();
    }
  }, [userProfile]);

  const fetchDiaryEntries = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'moodLogs'),
        where('userId', '==', userProfile?.uid),
        orderBy('timestamp', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const entriesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as DiaryEntry[];

      setEntries(entriesData);
    } catch (err) {
      console.error('Error fetching diary entries:', err);
      setError('Error al cargar el historial');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timestamp: any) => {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMoodEmoji = (mood: number) => {
    const emojis = ['😢', '😔', '😐', '😊', '😄'];
    return emojis[mood - 1] || '😐';
  };

  const getMoodColor = (mood: number) => {
    const colors = ['text-red-600', 'text-orange-600', 'text-yellow-600', 'text-blue-600', 'text-green-600'];
    return colors[mood - 1] || 'text-gray-600';
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <div className='w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin'></div>
        <span className='ml-3 text-gray-600'>Cargando historial...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
        <p className='text-red-800'>{error}</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className='text-center py-8'>
        <MessageSquare className='w-16 h-16 text-gray-300 mx-auto mb-4' />
        <h3 className='text-lg font-medium text-gray-900 mb-2'>No hay entradas aún</h3>
        <p className='text-gray-600'>Comienza escribiendo tu primera entrada de diario</p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between mb-6'>
        <h2 className='text-xl font-bold text-gray-900'>Mi Historial</h2>
        <span className='text-sm text-gray-500'>{entries.length} entradas</span>
      </div>

      {entries.map((entry) => (
        <div
          key={entry.id}
          className='bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow'
        >
          <div className='flex items-start justify-between mb-3'>
            <div className='flex items-center space-x-3'>
              <div className={`text-2xl ${getMoodColor(entry.mood)}`}>{getMoodEmoji(entry.mood)}</div>
              <div>
                <div className='flex items-center space-x-2'>
                  <span className='font-medium text-gray-900'>{entry.moodLabel}</span>
                  <span className='text-sm text-gray-500'>({entry.mood}/5)</span>
                </div>
                {entry.aiAnalysis && (
                  <div className='text-xs text-gray-500 mt-1'>
                    IA: {entry.aiAnalysis.emotion} ({Math.round(entry.aiAnalysis.confidence * 100)}% confianza)
                  </div>
                )}
              </div>
            </div>
            <div className='text-right text-sm text-gray-500'>
              <div className='flex items-center space-x-1'>
                <Calendar className='w-4 h-4' />
                <span>{formatDate(entry.timestamp)}</span>
              </div>
              <div className='flex items-center space-x-1 mt-1'>
                <Clock className='w-4 h-4' />
                <span>{formatTime(entry.timestamp)}</span>
              </div>
            </div>
          </div>

          <div className='bg-gray-50 rounded-lg p-3'>
            <p className='text-gray-700 text-sm leading-relaxed'>
              {entry.text.length > 200 ? `${entry.text.substring(0, 200)}...` : entry.text}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DiaryHistory;
