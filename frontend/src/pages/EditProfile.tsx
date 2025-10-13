import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { User, Mail, Phone, MapPin, BookOpen, Briefcase, Award, FileText, Image, ArrowLeft, Save } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import CountrySelector from '../components/CountrySelector';
import { countries } from '../utils/countries';

interface ProfileData {
  displayName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  // Psychologist specific fields
  professionalTitle?: string;
  specialization?: string;
  yearsOfExperience?: string;
  licenseNumber?: string;
  cvUrl?: string;
  profilePhotoUrl?: string;
}

const EditProfile: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    displayName: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
  });
  const [userRole, setUserRole] = useState<'user' | 'psychologist'>('user');
  const [selectedCountry, setSelectedCountry] = useState(countries.find(c => c.name === 'Colombia') || countries[0]);

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) {
        setLoading(false);
        navigate('/login');
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserRole('user');
          const userData = userDoc.data();
          setProfileData({
            displayName: userData.displayName || user.displayName || '',
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || user.email || '',
            phone: userData.phone || '',
            location: userData.location || '',
            bio: userData.bio || '',
            profilePhotoUrl: userData.profilePhotoUrl || '',
          });
          const countryFromPhone = countries.find(c => userData.phone?.startsWith(c.phoneCode));
          if (countryFromPhone) setSelectedCountry(countryFromPhone);
        } else {
          const psychologistDoc = await getDoc(doc(db, 'psychologists', user.uid));
          if (psychologistDoc.exists()) {
            setUserRole('psychologist');
            const psychologistData = psychologistDoc.data();
            setProfileData({
              displayName: psychologistData.name || user.displayName || '',
              firstName: psychologistData.firstName || '',
              lastName: psychologistData.lastName || '',
              email: psychologistData.email || user.email || '',
              phone: psychologistData.phone || '',
              location: psychologistData.location || '',
              bio: psychologistData.bio || '',
              professionalTitle: psychologistData.professionalTitle || '',
              specialization: psychologistData.specialization || '',
              yearsOfExperience: psychologistData.yearsOfExperience || '',
              licenseNumber: psychologistData.licenseNumber || '',
              cvUrl: psychologistData.cvUrl || '',
              profilePhotoUrl: psychologistData.profilePhotoUrl || '',
            });
            const countryFromPhone = countries.find(c => psychologistData.phone?.startsWith(c.phoneCode));
            if (countryFromPhone) setSelectedCountry(countryFromPhone);
          } else {
            toast.error('No se encontraron datos de perfil.');
            navigate('/complete-profile');
            return;
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        toast.error('Error al cargar los datos del perfil.');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user, navigate]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawPhone = e.target.value.replace(selectedCountry.phoneCode, '').trim();
    setProfileData(prev => ({ ...prev, phone: rawPhone }));
  };

  const handleCountryChange = (country: any) => {
    setSelectedCountry(country);
    setProfileData(prev => ({ ...prev, location: country.name }));
  };

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Usuario no autenticado.');
      return;
    }
    setSaving(true);

    try {
      const fullPhoneNumber = `${selectedCountry.phoneCode} ${profileData.phone}`;
      const updates = {
        ...profileData,
        phone: fullPhoneNumber,
        location: selectedCountry.name,
        updatedAt: serverTimestamp(),
      };

      if (userRole === 'user') {
        await updateDoc(doc(db, 'users', user.uid), updates);
      } else {
        await updateDoc(doc(db, 'psychologists', user.uid), updates);
      }

      // Also update AuthContext user state
      await updateUserProfile({
        displayName: profileData.displayName,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        phone: fullPhoneNumber,
        location: selectedCountry.name,
        bio: profileData.bio,
      });

      toast.success('Perfil actualizado exitosamente!');
      navigate('/settings');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Error al guardar el perfil. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} p-4 sm:p-6 lg:p-8`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/settings')}
            className={`flex items-center ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span>Volver a Configuración</span>
          </button>
          <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Editar Perfil
          </h2>
        </div>

        <form onSubmit={handleSaveProfile} className={`space-y-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 sm:p-8`}>
          {/* Profile Photo Placeholder */}
          <div className="flex flex-col items-center space-y-4 mb-6">
            <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
              {profileData.profilePhotoUrl ? (
                <img src={profileData.profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <button
              type="button"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
            >
              <Image className="w-4 h-4" />
              <span>Cambiar Foto de Perfil</span>
            </button>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              (Funcionalidad de subida de imagen próximamente)
            </p>
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Nombre
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={profileData.firstName}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
                required
              />
            </div>
            <div>
              <label htmlFor="lastName" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Apellido
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={profileData.lastName}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
                required
              />
            </div>
            <div>
              <label htmlFor="email" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={profileData.email}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
                disabled
              />
            </div>
            <div>
              <label htmlFor="phone" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Teléfono
              </label>
              <div className="flex space-x-2">
                <div className="w-32">
                  <CountrySelector
                    selectedCountry={selectedCountry}
                    onCountryChange={handleCountryChange}
                    isDarkMode={isDarkMode}
                  />
                </div>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={profileData.phone}
                  onChange={handlePhoneChange}
                  className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  placeholder="300 123 4567"
                />
              </div>
            </div>
            <div>
              <label htmlFor="location" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Ubicación
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={selectedCountry.name}
                readOnly
                className={`w-full px-3 py-2 border rounded-lg ${
                  isDarkMode ? 'bg-gray-800 border-gray-600 text-gray-300' : 'bg-gray-100 border-gray-300 text-gray-600'
                }`}
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Biografía
            </label>
            <textarea
              id="bio"
              name="bio"
              value={profileData.bio}
              onChange={handleInputChange}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
              placeholder="Cuéntanos un poco sobre ti..."
            />
          </div>

          {/* Psychologist Specific Fields */}
          {userRole === 'psychologist' && (
            <div className="space-y-4 border-t pt-6">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Información Profesional
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="professionalTitle" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Título Profesional
                  </label>
                  <input
                    type="text"
                    id="professionalTitle"
                    name="professionalTitle"
                    value={profileData.professionalTitle || ''}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    placeholder="Psicólogo Clínico"
                  />
                </div>
                <div>
                  <label htmlFor="specialization" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Especialización
                  </label>
                  <input
                    type="text"
                    id="specialization"
                    name="specialization"
                    value={profileData.specialization || ''}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    placeholder="Terapia Cognitivo-Conductual"
                  />
                </div>
                <div>
                  <label htmlFor="yearsOfExperience" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Años de Experiencia
                  </label>
                  <input
                    type="number"
                    id="yearsOfExperience"
                    name="yearsOfExperience"
                    value={profileData.yearsOfExperience || ''}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    placeholder="5"
                  />
                </div>
                <div>
                  <label htmlFor="licenseNumber" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Número de Licencia
                  </label>
                  <input
                    type="text"
                    id="licenseNumber"
                    name="licenseNumber"
                    value={profileData.licenseNumber || ''}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    placeholder="PS-12345"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-6 border-t">
            <button
              type="submit"
              disabled={saving}
              className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors flex items-center space-x-2 ${
                saving ? 'bg-purple-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
              }`}
            >
              {saving ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <Save className="w-5 h-5" />
              )}
              <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;