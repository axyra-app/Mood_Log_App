import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { User, Edit, Save, X, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Header from '../components/Header';

const Profile: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const { isDarkMode } = useTheme();
  const [isLoaded, setIsLoaded] = useState(false);
  const [profileLoadError, setProfileLoadError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    username: '',
  });
  const [originalProfileData, setOriginalProfileData] = useState(profileData);

  useEffect(() => {
    let isCurrent = true;

    const loadUserData = async () => {
      setIsLoaded(false);
      setProfileLoadError(false);

      if (!user) {
        setProfileLoadError(true);
        setIsLoaded(true);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!isCurrent) return;
        if (!userDoc.exists()) {
          throw new Error('No se encontró el perfil del usuario.');
        }

        const userData = userDoc.data();
        const loadedProfileData = {
          displayName: userData.displayName || user.displayName || '',
          email: userData.email || user.email || '',
          phone: userData.phone || '',
          bio: userData.bio || '',
          location: userData.location || '',
          username: userData.username || '',
        };
        setProfileData(loadedProfileData);
        setOriginalProfileData(loadedProfileData);
      } catch (error) {
        console.error('Error loading user data:', error);
        if (isCurrent) {
          setProfileLoadError(true);
          toast.error('No se pudo cargar tu perfil. Inténtalo de nuevo.');
        }
      } finally {
        if (isCurrent) {
          setIsLoaded(true);
        }
      }
    };

    void loadUserData();
    return () => {
      isCurrent = false;
    };
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { email: _email, ...profileUpdates } = profileData;
      await updateUserProfile(profileUpdates);
      setOriginalProfileData(profileData);
      setIsEditing(false);
      toast.success('Perfil actualizado exitosamente');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setProfileData(originalProfileData);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (profileLoadError) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Header
          title="Mi Perfil"
          subtitle="Gestiona tu información personal"
          backTo="/dashboard"
          backLabel="Volver al Dashboard"
        />
        <main className="mx-auto max-w-xl px-4 py-16 text-center">
          <p role="alert" className={`mb-5 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            No pudimos cargar tu perfil. No se guardarán datos vacíos para evitar sobrescribir tu información.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-lg bg-purple-600 px-5 py-3 font-medium text-white hover:bg-purple-700"
          >
            Reintentar
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Header 
        title="Mi Perfil"
        subtitle="Gestiona tu información personal"
        backTo="/dashboard"
        backLabel="Volver al Dashboard"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg border p-6`}>
          <aside
            aria-label='Función próximamente'
            className={`mb-6 flex items-start gap-3 rounded-lg border p-4 ${
              isDarkMode
                ? 'border-purple-800 bg-purple-900/20 text-purple-200'
                : 'border-purple-200 bg-purple-50 text-purple-800'
            }`}
          >
            <Info className='mt-0.5 h-5 w-5 shrink-0' />
            <p className='text-sm'>
              <strong>Fotos de perfil y archivos: próximamente.</strong> Por ahora no es posible cargar imágenes ni
              adjuntos.
            </p>
          </aside>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Información Personal
                </h2>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Actualiza tu información de perfil
                </p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancelar</span>
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{loading ? 'Guardando...' : 'Guardar'}</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Editar</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Nombre Completo
              </label>
              <input
                type="text"
                name="displayName"
                value={profileData.displayName}
                onChange={handleInputChange}
                maxLength={120}
                disabled={!isEditing}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
            </div>

            {/* Email */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Email
              </label>
              <input
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleInputChange}
                maxLength={254}
                readOnly
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-gray-100 border-gray-300 text-gray-600'
                } cursor-not-allowed`}
              />
              <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                El correo de acceso se administra en Firebase Authentication y no se modifica desde este formulario.
              </p>
            </div>

            {/* Teléfono */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Teléfono
              </label>
              <input
                type="tel"
                name="phone"
                value={profileData.phone}
                onChange={handleInputChange}
                maxLength={40}
                disabled={!isEditing}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
            </div>

            {/* Ubicación */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Ubicación
              </label>
              <input
                type="text"
                name="location"
                value={profileData.location}
                onChange={handleInputChange}
                maxLength={120}
                disabled={!isEditing}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
            </div>

            {/* Username */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Nombre de Usuario
              </label>
              <input
                type="text"
                name="username"
                value={profileData.username}
                onChange={handleInputChange}
                maxLength={64}
                disabled={!isEditing}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
            </div>

            {/* Biografía */}
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Biografía
              </label>
              <textarea
                name="bio"
                value={profileData.bio}
                onChange={handleInputChange}
                disabled={!isEditing}
                maxLength={2000}
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                placeholder="Cuéntanos un poco sobre ti..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
