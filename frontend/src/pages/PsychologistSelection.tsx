import { ArrowLeft, Clock, MessageCircle, Star, User, Users, Shield, Award, Sun, Moon } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePsychologists } from '../hooks/usePsychologists';
import { Psychologist } from '../services/psychologistService';

const PsychologistSelection: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  
  const { psychologists, loading, error } = usePsychologists();

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleSelectPsychologist = (psychologist: Psychologist) => {
    navigate(`/chat/psychologist/${psychologist.id}`);
  };

  const filteredPsychologists = psychologists.filter(psychologist => {
    const matchesSearch = psychologist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         psychologist.specialization.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSpecialization = selectedSpecialization === 'all' || 
                                 psychologist.specialization.includes(selectedSpecialization);
    
    return matchesSearch && matchesSpecialization;
  });

  const specializations = Array.from(new Set(psychologists.flatMap(p => p.specialization)));

  const formatWorkingHours = (hours: Psychologist['workingHours']) => {
    return `${hours.start} - ${hours.end} (${hours.timezone})`;
  };

  const getAvailabilityStatus = (psychologist: Psychologist) => {
    const now = new Date();
    const currentHour = now.getHours();
    const startHour = parseInt(psychologist.workingHours.start.split(':')[0]);
    const endHour = parseInt(psychologist.workingHours.end.split(':')[0]);
    
    if (currentHour >= startHour && currentHour < endHour) {
      return { status: 'online', text: 'En línea', color: 'text-green-500' };
    } else {
      return { status: 'offline', text: 'Fuera de horario', color: 'text-orange-500' };
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-green-50 to-emerald-50'
    }`}>
      {/* Header */}
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border-b ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/chat')}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Psicólogos Disponibles
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h2 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            ¡Hola, {user?.displayName || 'Usuario'}! 👋
          </h2>
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
            Conecta con psicólogos profesionales certificados para recibir apoyo personalizado y profesional.
          </p>
        </div>

        {/* Search and Filters */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg border ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        } p-6 mb-8`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Buscar psicólogo
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nombre o especialización..."
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-green-500`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Especialización
              </label>
              <select
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-green-500`}
              >
                <option value="all">Todas las especializaciones</option>
                {specializations.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Psychologists List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Cargando psicólogos...
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">😔</div>
            <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Error al cargar psicólogos: {error}
            </p>
          </div>
        ) : filteredPsychologists.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              No se encontraron psicólogos con los criterios seleccionados
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPsychologists.map((psychologist) => {
              const availability = getAvailabilityStatus(psychologist);
              
              return (
                <div
                  key={psychologist.id}
                  className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg border ${
                    isDarkMode ? 'border-gray-700' : 'border-gray-200'
                  } p-6 hover:shadow-xl transition-shadow duration-200 cursor-pointer`}
                  onClick={() => handleSelectPsychologist(psychologist)}
                >
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                      {psychologist.profileImage ? (
                        <img
                          src={psychologist.profileImage}
                          alt={psychologist.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {psychologist.name}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {psychologist.rating.toFixed(1)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4 text-blue-500" />
                          <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {psychologist.totalPatients} pacientes
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Especializaciones:
                      </h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {psychologist.specialization.map((spec, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Experiencia:
                      </h4>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {psychologist.experience} años
                      </p>
                    </div>

                    <div>
                      <h4 className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Horario de atención:
                      </h4>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {formatWorkingHours(psychologist.workingHours)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          availability.status === 'online' ? 'bg-green-500' : 'bg-orange-500'
                        }`}></div>
                        <span className={`text-sm ${availability.color}`}>
                          {availability.text}
                        </span>
                      </div>
                      
                      {psychologist.isVerified && (
                        <div className="flex items-center space-x-1">
                          <Shield className="w-4 h-4 text-blue-500" />
                          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Verificado
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      className="w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-4 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>Iniciar Chat</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Information Section */}
        <div className={`mt-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg border ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        } p-6`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            ℹ️ Información Importante
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                👨‍⚕️ Psicólogos Profesionales
              </h4>
              <ul className={`text-sm space-y-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <li>• Todos los psicólogos están certificados y verificados</li>
                <li>• Atención personalizada y confidencial</li>
                <li>• Horarios de atención establecidos</li>
                <li>• Sistema de calificaciones y reseñas</li>
              </ul>
            </div>
            <div>
              <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                💬 Chat en Tiempo Real
              </h4>
              <ul className={`text-sm space-y-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <li>• Comunicación directa con el psicólogo</li>
                <li>• Respuestas en tiempo real durante horarios de atención</li>
                <li>• Historial de conversaciones guardado</li>
                <li>• Sistema de calificación post-sesión</li>
              </ul>
            </div>
          </div>
          
          <div className={`mt-4 p-4 rounded-lg ${isDarkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
            <p className={`text-sm ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
              <strong>⚠️ En caso de emergencia:</strong> Si tienes pensamientos de autolesión o suicidio, 
              contacta inmediatamente con la línea de crisis: <strong>106</strong> (Colombia) 
              o acude a urgencias del hospital más cercano.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PsychologistSelection;
