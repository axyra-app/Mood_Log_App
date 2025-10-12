import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { ArrowLeft, Save, User, Mail, Phone, MapPin, FileText, Camera } from 'lucide-react';
import Logo from '../components/Logo';

const EditProfile: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    displayName: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    professionalTitle: '',
    specialization: '',
    yearsOfExperience: '',
    licenseNumber: '',
  });

  useEffect(() => {
    setIsLoaded(true);
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      // Intentar obtener datos del usuario
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setFormData({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          displayName: userData.displayName || '',
          email: userData.email || user.email || '',
          phone: userData.phone || '',
          location: userData.location || '',
          bio: userData.bio || '',
          professionalTitle: userData.professionalTitle || '',
          specialization: userData.specialization || '',
          yearsOfExperience: userData.yearsOfExperience?.toString() || '',
          licenseNumber: userData.licenseNumber || '',
        });
      } else {
        // Si no existe en users, verificar si es psicólogo
        const psychologistDoc = await getDoc(doc(db, 'psychologists', user.uid));
        if (psychologistDoc.exists()) {
          const psychologistData = psychologistDoc.data();
          setFormData({
            firstName: psychologistData.firstName || '',
            lastName: psychologistData.lastName || '',
            displayName: psychologistData.displayName || '',
            email: psychologistData.email || user.email || '',
            phone: psychologistData.phone || '',
            location: psychologistData.location || '',
            bio: psychologistData.bio || '',
            professionalTitle: psychologistData.professionalTitle || '',
            specialization: psychologistData.specialization || '',
            yearsOfExperience: psychologistData.yearsOfExperience?.toString() || '',
            licenseNumber: psychologistData.licenseNumber || '',
          });
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Error al cargar los datos del usuario');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        displayName: formData.displayName,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        bio: formData.bio,
        updatedAt: serverTimestamp(),
      };

      // Si es psicólogo, agregar campos profesionales
      if (user?.role === 'psychologist') {
        updateData.professionalTitle = formData.professionalTitle;
        updateData.specialization = formData.specialization;
        updateData.yearsOfExperience = parseInt(formData.yearsOfExperience) || 0;
        updateData.licenseNumber = formData.licenseNumber;
      }

      await updateUserProfile(updateData);
      toast.success('Perfil actualizado exitosamente');
      navigate('/settings');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('theme', !isDarkMode ? 'dark' : 'light');
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`border-b transition-colors duration-500 ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/settings')}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <Logo size="md" />
              <div>
                <h1 className={`text-xl font-bold transition-colors duration-500 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Editar Perfil
                </h1>
                <p className={`text-sm transition-colors duration-500 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Actualiza tu información personal
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
                {isDarkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`rounded-xl shadow-sm transition-colors duration-500 ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border p-6`}>
          
          {/* Profile Picture Section */}
          <div className="flex items-center space-x-6 mb-8">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <User className="w-12 h-12 text-gray-400" />
            </div>
            <div>
              <h2 className={`text-xl font-semibold transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Foto de Perfil
              </h2>
              <p className={`text-sm transition-colors duration-500 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Haz clic para cambiar tu foto de perfil
              </p>
              <button className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2">
                <Camera className="w-4 h-4" />
                <span>Cambiar Foto</span>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className={`text-lg font-semibold mb-4 transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Información Personal
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <User className="w-4 h-4 inline mr-2" />
                    Nombre *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Apellido *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    required
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Nombre Completo
                </label>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className={`text-lg font-semibold mb-4 transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Información de Contacto
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <Phone className="w-4 h-4 inline mr-2" />
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Ubicación
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
            </div>

            {/* Professional Information (for psychologists) */}
            {user?.role === 'psychologist' && (
              <div>
                <h3 className={`text-lg font-semibold mb-4 transition-colors duration-500 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Información Profesional
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Título Profesional
                    </label>
                    <input
                      type="text"
                      name="professionalTitle"
                      value={formData.professionalTitle}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Especialización
                    </label>
                    <input
                      type="text"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Años de Experiencia
                    </label>
                    <input
                      type="number"
                      name="yearsOfExperience"
                      value={formData.yearsOfExperience}
                      onChange={handleInputChange}
                      min="0"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Número de Licencia
                    </label>
                    <input
                      type="text"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Bio */}
            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <FileText className="w-4 h-4 inline mr-2" />
                Biografía
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
                placeholder="Cuéntanos sobre ti..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Guardando...' : 'Guardar Cambios'}</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EditProfile;
