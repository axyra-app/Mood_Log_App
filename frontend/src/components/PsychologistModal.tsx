// Psychologist Modal Component
import { X, Search, Star, MapPin, Clock, Filter } from 'lucide-react';
import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { samplePsychologists } from '../data/samplePsychologists';

interface Psychologist {
  id: string;
  name: string;
  email: string;
  specialty: string;
  experience: number;
  rating: number;
  location: string;
  languages: string[];
  availability: string;
  bio: string;
  profileImage?: string;
  isOnline: boolean;
}

interface PsychologistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PsychologistModal = ({ isOpen, onClose }: PsychologistModalProps) => {
  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const [filteredPsychologists, setFilteredPsychologists] = useState<Psychologist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  // Fetch psychologists from Firestore
  useEffect(() => {
    const fetchPsychologists = async () => {
      try {
        setLoading(true);
        const psychologistsRef = collection(db, 'psychologists');
        const q = query(psychologistsRef, where('isActive', '==', true));
        const querySnapshot = await getDocs(q);
        
        const psychologistsData: Psychologist[] = [];
        querySnapshot.forEach((doc) => {
          psychologistsData.push({
            id: doc.id,
            ...doc.data()
          } as Psychologist);
        });
        
        // If no psychologists found in Firestore, use sample data
        if (psychologistsData.length === 0) {
          console.log('No psychologists found in Firestore, using sample data');
          setPsychologists(samplePsychologists);
          setFilteredPsychologists(samplePsychologists);
        } else {
          setPsychologists(psychologistsData);
          setFilteredPsychologists(psychologistsData);
        }
      } catch (error) {
        console.error('Error fetching psychologists:', error);
        console.log('Using sample data due to error');
        // Use sample data as fallback
        setPsychologists(samplePsychologists);
        setFilteredPsychologists(samplePsychologists);
        setError(''); // Clear error since we have fallback data
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchPsychologists();
    }
  }, [isOpen]);

  // Filter psychologists based on search and filters
  useEffect(() => {
    let filtered = psychologists;

    if (searchTerm) {
      filtered = filtered.filter(psychologist =>
        psychologist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        psychologist.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
        psychologist.bio.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSpecialty) {
      filtered = filtered.filter(psychologist =>
        psychologist.specialty === selectedSpecialty
      );
    }

    if (selectedLocation) {
      filtered = filtered.filter(psychologist =>
        psychologist.location.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    setFilteredPsychologists(filtered);
  }, [psychologists, searchTerm, selectedSpecialty, selectedLocation]);

  const specialties = [...new Set(psychologists.map(p => p.specialty))];
  const locations = [...new Set(psychologists.map(p => p.location))];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Psicólogos Disponibles</h2>
            <p className="text-gray-600 mt-1">
              {filteredPsychologists.length} psicólogo{filteredPsychologists.length !== 1 ? 's' : ''} encontrado{filteredPsychologists.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar psicólogo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Specialty Filter */}
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Todas las especialidades</option>
              {specialties.map(specialty => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>

            {/* Location Filter */}
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Todas las ubicaciones</option>
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-600">Cargando psicólogos...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 mb-4">{error}</div>
              <button
                onClick={() => window.location.reload()}
                className="btn-primary"
              >
                Reintentar
              </button>
            </div>
          ) : filteredPsychologists.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {psychologists.length === 0 ? 'No hay psicólogos disponibles' : 'No se encontraron resultados'}
              </h3>
              <p className="text-gray-600">
                {psychologists.length === 0 
                  ? 'Actualmente no hay psicólogos registrados en la plataforma.'
                  : 'Intenta ajustar los filtros de búsqueda.'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPsychologists.map((psychologist) => (
                <div key={psychologist.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start space-x-4">
                    {/* Profile Image */}
                    <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {psychologist.name.charAt(0)}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{psychologist.name}</h3>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium text-gray-700">{psychologist.rating}</span>
                        </div>
                      </div>

                      <p className="text-primary-600 font-medium mb-2">{psychologist.specialty}</p>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{psychologist.bio}</p>

                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{psychologist.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{psychologist.experience} años exp.</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${psychologist.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          <span className="text-sm text-gray-600">
                            {psychologist.isOnline ? 'En línea' : 'Desconectado'}
                          </span>
                        </div>
                        <button className="btn-primary text-sm px-4 py-2">
                          Contactar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PsychologistModal;
