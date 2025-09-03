import { addDoc, collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { Search, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';

interface Psychologist {
  id: string;
  name: string;
  email: string;
  specialization: string;
  experience: number;
  bio: string;
  avatar: string;
}

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConversationCreated: (conversationId: string) => void;
}

const NewConversationModal = ({ isOpen, onClose, onConversationCreated }: NewConversationModalProps) => {
  const { userProfile } = useAuth();
  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const [filteredPsychologists, setFilteredPsychologists] = useState<Psychologist[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchPsychologists();
    }
  }, [isOpen]);

  useEffect(() => {
    const filtered = psychologists.filter(
      (psychologist) =>
        psychologist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        psychologist.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPsychologists(filtered);
  }, [psychologists, searchTerm]);

  const fetchPsychologists = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'psychologist'));

      const querySnapshot = await getDocs(q);
      const psychologistsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        avatar: '👩‍⚕️',
      })) as Psychologist[];

      setPsychologists(psychologistsData);
    } catch (error) {
      console.error('Error fetching psychologists:', error);
    }
    setLoading(false);
  };

  const createConversation = async (psychologistId: string) => {
    if (!userProfile?.uid) return;

    setCreating(psychologistId);
    try {
      // Check if conversation already exists
      const existingConversations = await getDocs(
        query(
          collection(db, 'conversations'),
          where(`participants.${userProfile.uid}`, '==', true),
          where(`participants.${psychologistId}`, '==', true)
        )
      );

      if (!existingConversations.empty) {
        const existingConversation = existingConversations.docs[0];
        onConversationCreated(existingConversation.id);
        onClose();
        return;
      }

      // Get psychologist data
      const psychologistDoc = await getDoc(doc(db, 'users', psychologistId));
      const psychologistData = psychologistDoc.data();

      // Create new conversation
      const conversationRef = await addDoc(collection(db, 'conversations'), {
        participants: {
          [userProfile.uid]: true,
          [psychologistId]: true,
        },
        participantNames: {
          [userProfile.uid]: userProfile.name,
          [psychologistId]: psychologistData?.name || 'Psicólogo',
        },
        participantRoles: {
          [userProfile.uid]: 'user',
          [psychologistId]: 'psychologist',
        },
        lastMessage: '',
        lastMessageTime: new Date(),
        unreadCount: {
          [userProfile.uid]: 0,
          [psychologistId]: 0,
        },
        isOnline: {
          [userProfile.uid]: true,
          [psychologistId]: false,
        },
        avatar: {
          [userProfile.uid]: '👤',
          [psychologistId]: '👩‍⚕️',
        },
        createdAt: new Date(),
      });

      onConversationCreated(conversationRef.id);
      onClose();
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
    setCreating(null);
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-xl shadow-xl w-full max-w-md mx-4'>
        <div className='p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-xl font-semibold text-gray-900'>Nueva Conversación</h2>
            <button onClick={onClose} className='p-2 text-gray-400 hover:text-gray-600 transition-colors'>
              <X className='w-5 h-5' />
            </button>
          </div>

          {/* Search */}
          <div className='relative mb-4'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
            <input
              type='text'
              placeholder='Buscar psicólogos...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
            />
          </div>

          {/* Psychologists List */}
          <div className='max-h-96 overflow-y-auto'>
            {loading ? (
              <div className='space-y-3'>
                {[1, 2, 3].map((i) => (
                  <div key={i} className='animate-pulse flex items-center space-x-3 p-3'>
                    <div className='w-10 h-10 bg-gray-200 rounded-full'></div>
                    <div className='flex-1'>
                      <div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
                      <div className='h-3 bg-gray-200 rounded w-1/2'></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredPsychologists.length === 0 ? (
              <div className='text-center py-8 text-gray-500'>
                <User className='w-12 h-12 mx-auto mb-3 text-gray-300' />
                <p>No se encontraron psicólogos</p>
                <p className='text-sm'>Intenta con otros términos de búsqueda</p>
              </div>
            ) : (
              <div className='space-y-2'>
                {filteredPsychologists.map((psychologist) => (
                  <button
                    key={psychologist.id}
                    onClick={() => createConversation(psychologist.id)}
                    disabled={creating === psychologist.id}
                    className='w-full p-3 text-left border border-gray-200 rounded-lg hover:border-primary-200 hover:bg-primary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    <div className='flex items-center space-x-3'>
                      <div className='w-10 h-10 bg-gradient-to-r from-primary-100 to-purple-100 rounded-full flex items-center justify-center text-lg'>
                        {psychologist.avatar}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <h3 className='font-medium text-gray-900 truncate'>{psychologist.name}</h3>
                        <p className='text-sm text-primary-600 truncate'>{psychologist.specialization}</p>
                        <p className='text-xs text-gray-500 truncate'>{psychologist.experience} años de experiencia</p>
                      </div>
                      {creating === psychologist.id && (
                        <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600'></div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewConversationModal;
