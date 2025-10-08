import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { useValidation } from '../hooks/useValidation';
import { uploadFile } from '../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';

const CompleteProfile: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const { validate, hasError, getError, clearErrors } = useValidation();
  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    role: 'user' as 'user' | 'psychologist',
    // Campos profesionales para psicólogos
    professionalTitle: '',
    specialization: '',
    yearsOfExperience: '',
    bio: '',
    licenseNumber: '',
    phone: '',
    cvFile: null as File | null,
  });
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoaded(true);
    // Pre-llenar con datos de Google si están disponibles
    if (user) {
      setFormData((prev) => ({
        ...prev,
        displayName: user.displayName || user.email?.split('@')[0] || '',
        username: user.username || user.email?.split('@')[0] || '',
      }));
    }
  }, [user]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    clearErrors(name);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamaño del archivo (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('El archivo es demasiado grande. Máximo 5MB.');
        return;
      }
      setFormData((prev) => ({ ...prev, cvFile: file }));
    }
  };

  const validateForm = () => {
    const rules = {
      displayName: { required: true, minLength: 2 },
      username: { required: true, minLength: 3, pattern: /^[a-zA-Z0-9_]+$/ },
      role: { required: true },
      ...(formData.role === 'psychologist' && {
        professionalTitle: { required: true, minLength: 2 },
        specialization: { required: true, minLength: 2 },
        yearsOfExperience: { required: true, min: 0, max: 50 },
        licenseNumber: { required: true, minLength: 3 },
        phone: { required: true, pattern: /^[0-9+\-\s()]+$/ },
        bio: { required: true, minLength: 10 },
      }),
    };

    return validate(formData, rules);
  };

  // Función para verificar si el email ya existe
  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      // Verificar si el email ya existe (solo si es diferente al actual)
      if (user?.email !== formData.email) {
        const emailExists = await checkEmailExists(formData.email);
        if (emailExists) {
          toast.error('Este correo electrónico ya está registrado. Por favor, usa otro correo.');
          setLoading(false);
          return;
        }
      }

      // Subir CV si es psicólogo y tiene archivo
      let cvUrl = '';
      if (formData.role === 'psychologist' && formData.cvFile) {
        setUploadingFile(true);
        try {
          cvUrl = await uploadFile(formData.cvFile, `psychologists/${user?.email}/cv`);
          toast.success('Tu hoja de vida se ha subido correctamente');
        } catch (uploadError) {
          console.error('Error uploading CV:', uploadError);
          toast.error('Error al subir el archivo CV. Inténtalo de nuevo.');
          return;
        } finally {
          setUploadingFile(false);
        }
      }

      // Preparar datos para actualizar
      const updateData: any = {
        displayName: formData.displayName,
        username: formData.username,
        role: formData.role,
      };

      // Agregar datos profesionales si es psicólogo
      if (formData.role === 'psychologist') {
        updateData.professionalTitle = formData.professionalTitle;
        updateData.specialization = formData.specialization;
        updateData.yearsOfExperience = parseInt(formData.yearsOfExperience);
        updateData.bio = formData.bio;
        updateData.licenseNumber = formData.licenseNumber;
        updateData.phone = formData.phone;
        updateData.cvUrl = cvUrl;
      }

      await updateUserProfile(updateData);

      // Mostrar mensaje de éxito
      toast.success(`¡Perfil completado! Bienvenido${formData.role === 'psychologist' ? ' psicólogo' : ''} a Mood Log`);

      // Redirigir inmediatamente sin delay
      if (formData.role === 'psychologist') {
        navigate('/dashboard-psychologist');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Profile completion error:', error);
      
      // Manejar errores específicos
      let errorMessage = 'Error al completar el perfil';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este correo electrónico ya está registrado. Por favor, usa otro correo.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'La contraseña es muy débil. Por favor, usa una contraseña más segura.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'El correo electrónico no es válido.';
      } else if (error.code === 'permission-denied') {
        errorMessage = 'No tienes permisos para realizar esta acción.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return <LoadingSpinner />;
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div
        className={`min-h-screen transition-colors duration-500 ${
          isDarkMode ? 'bg-gray-900' : 'bg-white'
        }`}
      >
        <div className='min-h-screen flex items-center justify-center p-4'>
          <div className='w-full max-w-2xl'>
            <div
              className={`backdrop-blur-lg rounded-2xl shadow-2xl border transition-all duration-500 ${
                isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div className='p-8'>
                {/* Header */}
                <div className='text-center mb-8'>
                  <button
                    onClick={toggleDarkMode}
                    className={`mb-4 p-2 rounded-full transition-colors duration-300 ${
                      isDarkMode
                        ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600'
                        : 'bg-white/20 text-yellow-300 hover:bg-white/30'
                    }`}
                  >
                    {isDarkMode ? '☀️' : '🌙'}
                  </button>

                  <div className='text-6xl mb-4'>👤</div>
                  <h1
                    className={`text-3xl font-bold mb-2 transition-colors duration-500 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    Completa tu Perfil
                  </h1>
                  <p
                    className={`text-lg transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    Termina de configurar tu cuenta para comenzar
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className='space-y-6'>
                  {/* Información Básica */}
                  <div className='space-y-4'>
                    <h3
                      className={`text-xl font-semibold transition-colors duration-500 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      Información Básica
                    </h3>

                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        Nombre Completo *
                      </label>
                      <input
                        type='text'
                        name='displayName'
                        value={formData.displayName}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          hasError('displayName')
                            ? 'border-red-500'
                            : isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                        placeholder='Tu nombre completo'
                      />
                      {hasError('displayName') && (
                        <p className='text-red-400 text-sm mt-1'>{getError('displayName')}</p>
                      )}
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        Nombre de Usuario *
                      </label>
                      <input
                        type='text'
                        name='username'
                        value={formData.username}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          hasError('username')
                            ? 'border-red-500'
                            : isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                        placeholder='tu_usuario'
                      />
                      {hasError('username') && <p className='text-red-400 text-sm mt-1'>{getError('username')}</p>}
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        Tipo de Usuario *
                      </label>
                      <select
                        name='role'
                        value={formData.role}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          hasError('role')
                            ? 'border-red-500'
                            : isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value='user'>Usuario Regular</option>
                        <option value='psychologist'>Psicólogo Profesional</option>
                      </select>
                      {hasError('role') && <p className='text-red-400 text-sm mt-1'>{getError('role')}</p>}
                    </div>
                  </div>

                  {/* Campos Profesionales para Psicólogos */}
                  {formData.role === 'psychologist' && (
                    <div className='space-y-4 border-t pt-6'>
                      <h3
                        className={`text-xl font-semibold transition-colors duration-500 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        Información Profesional
                      </h3>

                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                          <label
                            className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}
                          >
                            Título Profesional *
                          </label>
                          <input
                            type='text'
                            name='professionalTitle'
                            value={formData.professionalTitle}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                              hasError('professionalTitle')
                                ? 'border-red-500'
                                : isDarkMode
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                            }`}
                            placeholder='Psicólogo Clínico'
                          />
                          {hasError('professionalTitle') && (
                            <p className='text-red-400 text-sm mt-1'>{getError('professionalTitle')}</p>
                          )}
                        </div>

                        <div>
                          <label
                            className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}
                          >
                            Especialización *
                          </label>
                          <input
                            type='text'
                            name='specialization'
                            value={formData.specialization}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                              hasError('specialization')
                                ? 'border-red-500'
                                : isDarkMode
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                            }`}
                            placeholder='Terapia Cognitivo-Conductual'
                          />
                          {hasError('specialization') && (
                            <p className='text-red-400 text-sm mt-1'>{getError('specialization')}</p>
                          )}
                        </div>
                      </div>

                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                          <label
                            className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}
                          >
                            Años de Experiencia *
                          </label>
                          <input
                            type='number'
                            name='yearsOfExperience'
                            value={formData.yearsOfExperience}
                            onChange={handleInputChange}
                            min='0'
                            max='50'
                            className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                              hasError('yearsOfExperience')
                                ? 'border-red-500'
                                : isDarkMode
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                            }`}
                            placeholder='5'
                          />
                          {hasError('yearsOfExperience') && (
                            <p className='text-red-400 text-sm mt-1'>{getError('yearsOfExperience')}</p>
                          )}
                        </div>

                        <div>
                          <label
                            className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}
                          >
                            Número de Licencia *
                          </label>
                          <input
                            type='text'
                            name='licenseNumber'
                            value={formData.licenseNumber}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                              hasError('licenseNumber')
                                ? 'border-red-500'
                                : isDarkMode
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                            }`}
                            placeholder='PSI-12345'
                          />
                          {hasError('licenseNumber') && (
                            <p className='text-red-400 text-sm mt-1'>{getError('licenseNumber')}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label
                          className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}
                        >
                          Teléfono *
                        </label>
                        <input
                          type='tel'
                          name='phone'
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                            hasError('phone')
                              ? 'border-red-500'
                              : isDarkMode
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          }`}
                          placeholder='+57 300 123 4567'
                        />
                        {hasError('phone') && <p className='text-red-400 text-sm mt-1'>{getError('phone')}</p>}
                      </div>

                      <div>
                        <label
                          className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}
                        >
                          Biografía Profesional *
                        </label>
                        <textarea
                          name='bio'
                          value={formData.bio}
                          onChange={handleInputChange}
                          rows={4}
                          className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none ${
                            hasError('bio')
                              ? 'border-red-500'
                              : isDarkMode
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          }`}
                          placeholder='Cuéntanos sobre tu experiencia y enfoque terapéutico...'
                        />
                        {hasError('bio') && <p className='text-red-400 text-sm mt-1'>{getError('bio')}</p>}
                      </div>

                      <div>
                        <label
                          className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}
                        >
                          Hoja de Vida (PDF) - Opcional
                        </label>
                        <input
                          type='file'
                          name='cvFile'
                          onChange={handleFileChange}
                          accept='.pdf'
                          className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                            isDarkMode
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                        {formData.cvFile && (
                          <p
                            className={`text-sm mt-2 transition-colors duration-500 ${
                              isDarkMode ? 'text-gray-300' : 'text-white/80'
                            }`}
                          >
                            Archivo seleccionado: {formData.cvFile.name}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className='pt-6'>
                    <button
                      type='submit'
                      disabled={loading || uploadingFile}
                      className={`w-full py-4 px-6 rounded-xl font-bold text-lg uppercase tracking-wider transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                        isDarkMode
                          ? 'bg-purple-600 text-white hover:bg-purple-700'
                          : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/25'
                      }`}
                    >
                      {loading ? (
                        <div className='flex items-center justify-center space-x-2'>
                          <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-current'></div>
                          <span>Completando perfil...</span>
                        </div>
                      ) : uploadingFile ? (
                        <div className='flex items-center justify-center space-x-2'>
                          <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-current'></div>
                          <span>Subiendo archivo...</span>
                        </div>
                      ) : (
                        'COMPLETAR PERFIL'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
