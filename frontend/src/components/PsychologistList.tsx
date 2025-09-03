import { collection, getDocs, query, where } from 'firebase/firestore';
import { Clock, MessageCircle, Shield, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';

interface Psychologist {
  id: string;
  name: string;
  specialization: string;
  rating: number;
  experience: number;
  patients: number;
  status: string;
  lastSeen: string;
  avatar: string;
  bio: string;
  email: string;
  licenseNumber: string;
}

const PsychologistList = () => {
  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPsychologists();
  }, []);

  const fetchPsychologists = async () => {
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'psychologist'));

      const querySnapshot = await getDocs(q);
      const psychologistsData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        const isOnline = Math.random() > 0.5; // Estado online simulado
        return {
          id: doc.id,
          name: data.name,
          specialization: data.specialization || 'Psicología General',
          rating: 4.5 + Math.random() * 0.5, // Rating simulado
          experience: data.experience || 0,
          patients: Math.floor(Math.random() * 200) + 50, // Pacientes simulado
          status: isOnline ? 'online' : 'away',
          lastSeen: isOnline ? 'En línea' : 'Hace 2 horas',
          avatar: '👩‍⚕️',
          bio: data.bio || 'Psicólogo profesional con experiencia en salud mental.',
          email: data.email,
          licenseNumber: data.licenseNumber || 'N/A',
        };
      });

      setPsychologists(psychologistsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching psychologists:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  };

  if (loading) {
    return (
      <div className='bg-white rounded-2xl shadow-lg border border-gray-100 p-6'>
        <div className='animate-pulse'>
          <div className='h-6 bg-gray-200 rounded w-1/3 mb-4'></div>
          <div className='space-y-4'>
            {[1, 2, 3].map((i) => (
              <div key={i} className='h-20 bg-gray-200 rounded'></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-2xl shadow-lg border border-gray-100 p-6'>
      <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
        <Shield className='w-5 h-5 text-primary-600 mr-2' />
        Psicólogos Disponibles ({psychologists.length})
      </h3>

      {psychologists.length === 0 ? (
        <div className='text-center py-8 text-gray-500'>
          <Shield className='w-12 h-12 mx-auto mb-3 text-gray-300' />
          <p>No hay psicólogos registrados aún</p>
          <p className='text-sm'>Los psicólogos aparecerán aquí cuando se registren</p>
        </div>
      ) : (
        <div className='space-y-4'>
          {psychologists.map((psychologist) => (
            <div
              key={psychologist.id}
              className='p-4 rounded-lg border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all duration-200'
            >
              <div className='flex items-start space-x-3'>
                <div className='relative'>
                  <div className='w-12 h-12 bg-gradient-to-r from-primary-100 to-purple-100 rounded-full flex items-center justify-center text-2xl'>
                    {psychologist.avatar}
                  </div>
                  <div
                    className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(
                      psychologist.status
                    )} rounded-full border-2 border-white`}
                  ></div>
                </div>

                <div className='flex-1 min-w-0'>
                  <div className='flex items-center justify-between'>
                    <h4 className='font-semibold text-gray-900'>{psychologist.name}</h4>
                    <div className='flex items-center space-x-1'>
                      <Star className='w-4 h-4 text-yellow-500 fill-current' />
                      <span className='text-sm font-medium text-gray-700'>{psychologist.rating}</span>
                    </div>
                  </div>

                  <p className='text-sm text-primary-600 font-medium'>{psychologist.specialization}</p>
                  <p className='text-xs text-gray-600 mt-1'>
                    {psychologist.experience} años • {psychologist.patients} pacientes
                  </p>

                  <div className='flex items-center justify-between mt-3'>
                    <div className='flex items-center space-x-2 text-xs text-gray-500'>
                      <Clock className='w-3 h-3' />
                      <span>{psychologist.lastSeen}</span>
                    </div>

                    <button className='flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors'>
                      <MessageCircle className='w-4 h-4' />
                      <span>Chat</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className='mt-6 pt-4 border-t border-gray-100'>
        <button className='w-full flex items-center justify-center space-x-2 text-primary-600 hover:text-primary-700 font-medium py-2 px-4 rounded-lg hover:bg-primary-50 transition-colors'>
          <MessageCircle className='w-4 h-4' />
          <span>Ver todos los psicólogos</span>
        </button>
      </div>
    </div>
  );
};

export default PsychologistList;
