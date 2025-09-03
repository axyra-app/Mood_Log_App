import { addDoc, collection, getDocs, query, serverTimestamp, where } from 'firebase/firestore';
import { Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';

interface Session {
  id: string;
  patientId: string;
  patientName: string;
  psychologistId: string;
  title: string;
  description: string;
  scheduledAt: Date;
  duration: number; // in minutes
  type: 'video' | 'phone' | 'in-person';
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: any;
}

interface Patient {
  id: string;
  name: string;
  email: string;
}

const SessionScheduler = () => {
  const { userProfile } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScheduler, setShowScheduler] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [selectedPatient, setSelectedPatient] = useState('');
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');
  const [sessionDuration, setSessionDuration] = useState(60);
  const [sessionType, setSessionType] = useState<'video' | 'phone' | 'in-person'>('video');

  useEffect(() => {
    if (userProfile?.uid) {
      fetchSessions();
      fetchPatients();
    }
  }, [userProfile?.uid]);

  const fetchSessions = async () => {
    if (!userProfile?.uid) return;

    try {
      const sessionsQuery = query(
        collection(db, 'sessions'),
        where('psychologistId', '==', userProfile.uid),
        where('scheduledAt', '>=', new Date())
      );
      const sessionsSnapshot = await getDocs(sessionsQuery);

      const sessionsData = sessionsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        scheduledAt: doc.data().scheduledAt.toDate(),
      })) as Session[];

      // Sort by scheduled date
      sessionsData.sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());
      setSessions(sessionsData);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    if (!userProfile?.uid) return;

    try {
      const patientsQuery = query(collection(db, 'users'), where('role', '==', 'user'));
      const patientsSnapshot = await getDocs(patientsQuery);

      const patientsData = patientsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Patient[];

      setPatients(patientsData);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const createSession = async () => {
    if (!userProfile?.uid || !selectedPatient || !sessionTitle) return;

    try {
      const scheduledDateTime = new Date(`${selectedDate}T${selectedTime}`);

      const sessionData = {
        patientId: selectedPatient,
        patientName: patients.find((p) => p.id === selectedPatient)?.name || 'Paciente',
        psychologistId: userProfile.uid,
        title: sessionTitle,
        description: sessionDescription,
        scheduledAt: scheduledDateTime,
        duration: sessionDuration,
        type: sessionType,
        status: 'scheduled',
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'sessions'), sessionData);

      // Reset form
      setSessionTitle('');
      setSessionDescription('');
      setSelectedPatient('');
      setShowScheduler(false);

      // Refresh sessions
      fetchSessions();
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('es-ES', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return '📹';
      case 'phone':
        return '📞';
      case 'in-person':
        return '🏢';
      default:
        return '📅';
    }
  };

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'bg-blue-100 text-blue-800';
      case 'phone':
        return 'bg-green-100 text-green-800';
      case 'in-person':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUpcomingSessions = () => {
    const now = new Date();
    return sessions.filter((session) => session.scheduledAt > now && session.status === 'scheduled').slice(0, 5);
  };

  const getTodaySessions = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return sessions.filter(
      (session) => session.scheduledAt >= today && session.scheduledAt < tomorrow && session.status === 'scheduled'
    );
  };

  if (loading) {
    return (
      <div className='space-y-4'>
        {[1, 2, 3].map((i) => (
          <div key={i} className='animate-pulse bg-gray-200 h-16 rounded-lg'></div>
        ))}
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <h3 className='text-xl font-semibold text-gray-900'>Sesiones Programadas</h3>
        <button onClick={() => setShowScheduler(true)} className='btn-primary'>
          <Plus className='w-4 h-4 mr-2' />
          Nueva Sesión
        </button>
      </div>

      {/* Today's Sessions */}
      {getTodaySessions().length > 0 && (
        <div>
          <h4 className='text-lg font-medium text-gray-900 mb-4'>Sesiones de Hoy</h4>
          <div className='space-y-3'>
            {getTodaySessions().map((session) => (
              <div key={session.id} className='p-4 bg-primary-50 border border-primary-200 rounded-lg'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-3'>
                    <span className='text-2xl'>{getSessionTypeIcon(session.type)}</span>
                    <div>
                      <h5 className='font-medium text-gray-900'>{session.title}</h5>
                      <p className='text-sm text-gray-600'>con {session.patientName}</p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='text-sm font-medium text-gray-900'>
                      {session.scheduledAt.toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <p className='text-xs text-gray-500'>{session.duration} min</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Sessions */}
      <div>
        <h4 className='text-lg font-medium text-gray-900 mb-4'>Próximas Sesiones</h4>
        <div className='space-y-3'>
          {getUpcomingSessions().map((session) => (
            <div
              key={session.id}
              className='p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors'
            >
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-3'>
                  <span className='text-2xl'>{getSessionTypeIcon(session.type)}</span>
                  <div>
                    <h5 className='font-medium text-gray-900'>{session.title}</h5>
                    <p className='text-sm text-gray-600'>con {session.patientName}</p>
                    {session.description && <p className='text-xs text-gray-500 mt-1'>{session.description}</p>}
                  </div>
                </div>
                <div className='text-right'>
                  <p className='text-sm font-medium text-gray-900'>{formatDateTime(session.scheduledAt)}</p>
                  <div className='flex items-center space-x-2 mt-1'>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getSessionTypeColor(session.type)}`}>
                      {session.type === 'video' ? 'Video' : session.type === 'phone' ? 'Teléfono' : 'Presencial'}
                    </span>
                    <span className='text-xs text-gray-500'>{session.duration} min</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Session Scheduler Modal */}
      {showScheduler && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-xl shadow-xl w-full max-w-md mx-4'>
            <div className='p-6'>
              <div className='flex items-center justify-between mb-6'>
                <h3 className='text-xl font-semibold text-gray-900'>Programar Sesión</h3>
                <button
                  onClick={() => setShowScheduler(false)}
                  className='p-2 text-gray-400 hover:text-gray-600 transition-colors'
                >
                  <X className='w-5 h-5' />
                </button>
              </div>

              <div className='space-y-4'>
                {/* Patient Selection */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>Paciente</label>
                  <select
                    value={selectedPatient}
                    onChange={(e) => setSelectedPatient(e.target.value)}
                    className='input-field'
                  >
                    <option value=''>Seleccionar paciente</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Session Title */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>Título de la Sesión</label>
                  <input
                    type='text'
                    value={sessionTitle}
                    onChange={(e) => setSessionTitle(e.target.value)}
                    className='input-field'
                    placeholder='Ej: Sesión de seguimiento'
                  />
                </div>

                {/* Date and Time */}
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>Fecha</label>
                    <input
                      type='date'
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className='input-field'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>Hora</label>
                    <input
                      type='time'
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className='input-field'
                    />
                  </div>
                </div>

                {/* Duration and Type */}
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>Duración (min)</label>
                    <select
                      value={sessionDuration}
                      onChange={(e) => setSessionDuration(Number(e.target.value))}
                      className='input-field'
                    >
                      <option value={30}>30 min</option>
                      <option value={45}>45 min</option>
                      <option value={60}>60 min</option>
                      <option value={90}>90 min</option>
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>Tipo</label>
                    <select
                      value={sessionType}
                      onChange={(e) => setSessionType(e.target.value as any)}
                      className='input-field'
                    >
                      <option value='video'>Video</option>
                      <option value='phone'>Teléfono</option>
                      <option value='in-person'>Presencial</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>Descripción (opcional)</label>
                  <textarea
                    value={sessionDescription}
                    onChange={(e) => setSessionDescription(e.target.value)}
                    className='input-field resize-none h-20'
                    placeholder='Notas sobre la sesión...'
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className='flex space-x-3 mt-6'>
                <button onClick={() => setShowScheduler(false)} className='flex-1 btn-secondary'>
                  Cancelar
                </button>
                <button
                  onClick={createSession}
                  disabled={!selectedPatient || !sessionTitle}
                  className='flex-1 btn-primary disabled:opacity-50'
                >
                  Programar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionScheduler;
