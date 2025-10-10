import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { useValidation } from '../hooks/useValidation';
import { uploadFile } from '../services/firebase';

const CompleteProfile: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const { validate, hasError, getError, clearErrors } = useValidation();
  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    role: 'user' as 'user' | 'psychologist',
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
      if (file.size > 5 * 1024 * 1024) {
        toast.error('El archivo es demasiado grande. Máximo 5MB.');
        return;
      }
      setFormData((prev) => ({ ...prev, cvFile: file }));
    }
  };

  const validateForm = () => {
    let isValid = true;
    
    if (!formData.displayName.trim()) {
      validate('displayName', 'El nombre es requerido');
      isValid = false;
    }
    
    if (!formData.username.trim()) {
      validate('username', 'El nombre de usuario es requerido');
      isValid = false;
    }
    
    if (formData.role === 'psychologist') {
      if (!formData.professionalTitle.trim()) {
        validate('professionalTitle', 'El título profesional es requerido');
        isValid = false;
      }
      if (!formData.specialization.trim()) {
        validate('specialization', 'La especialización es requerida');
        isValid = false;
      }
      if (!formData.yearsOfExperience) {
        validate('yearsOfExperience', 'Los años de experiencia son requeridos');
        isValid = false;
      }
    }
    
    return isValid;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      let cvUrl = '';
      if (formData.role === 'psychologist' && formData.cvFile) {
        setUploadingFile(true);
        try {
          cvUrl = await uploadFile(formData.cvFile, `psychologists/${user?.email}/cv`);
          toast.success('Archivo subido correctamente');
        } catch (uploadError) {
          console.error('Error uploading CV:', uploadError);
          toast.error('Error al subir el archivo');
          return;
        } finally {
          setUploadingFile(false);
        }
      }

      const updateData: any = {
        displayName: formData.displayName,
        username: formData.username,
        role: formData.role,
      };

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

      // Si es psicólogo, crear documento en la colección psychologists
      if (formData.role === 'psychologist' && user) {
        try {
          const psychologistData = {
            userId: user.uid,
            displayName: formData.displayName,
            email: user.email,
            professionalTitle: formData.professionalTitle,
            specialization: formData.specialization,
            yearsOfExperience: parseInt(formData.yearsOfExperience),
            bio: formData.bio,
            licenseNumber: formData.licenseNumber,
            phone: formData.phone,
            cvUrl: cvUrl,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          await setDoc(doc(db, 'psychologists', user.uid), psychologistData);
          console.log('Psychologist document created successfully');
        } catch (error) {
          console.error('Error creating psychologist document:', error);
          toast.error('Error al crear el perfil de psicólogo');
          return;
        }
      }

      toast.success(`¡Perfil completado! Bienvenido${formData.role === 'psychologist' ? ' psicólogo' : ''} a Mood Log`);

      setTimeout(() => {
        if (formData.role === 'psychologist') {
          navigate('/dashboard-psychologist');
        } else {
          navigate('/dashboard');
        }
      }, 1500);
    } catch (error: any) {
      console.error('Profile completion error:', error);
      toast.error(error.message || 'Error al completar el perfil');
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
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <div className='min-h-screen flex items-center justify-center p-4'>
        <div className='w-full max-w-2xl'>
          <div
            className={`backdrop-blur-lg rounded-2xl shadow-2xl border transition-all duration-500 ${
              isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            <div className='p-8'>
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

              <form onSubmit={handleSubmit} className='space-y-6'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <label className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Nombre completo *
                    </label>
                    <input
                      type='text'
                      name='displayName'
                      value={formData.displayName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 ${
                        hasError('displayName')
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : isDarkMode
                          ? 'border-gray-600 bg-gray-700 text-white focus:border-purple-500 focus:ring-purple-500'
                          : 'border-gray-300 bg-white text-gray-900 focus:border-purple-500 focus:ring-purple-500'
                      }`}
                      placeholder='Tu nombre completo'
                    />
                    {hasError('displayName') && (
                      <p className='text-red-500 text-sm mt-1'>{getError('displayName')}</p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Nombre de usuario *
                    </label>
                    <input
                      type='text'
                      name='username'
                      value={formData.username}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 ${
                        hasError('username')
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : isDarkMode
                          ? 'border-gray-600 bg-gray-700 text-white focus:border-purple-500 focus:ring-purple-500'
                          : 'border-gray-300 bg-white text-gray-900 focus:border-purple-500 focus:ring-purple-500'
                      }`}
                      placeholder='nombre_usuario'
                    />
                    {hasError('username') && (
                      <p className='text-red-500 text-sm mt-1'>{getError('username')}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Tipo de cuenta *
                  </label>
                  <select
                    name='role'
                    value={formData.role}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 ${
                      isDarkMode
                        ? 'border-gray-600 bg-gray-700 text-white focus:border-purple-500 focus:ring-purple-500'
                        : 'border-gray-300 bg-white text-gray-900 focus:border-purple-500 focus:ring-purple-500'
                    }`}
                  >
                    <option value='user'>Usuario</option>
                    <option value='psychologist'>Psicólogo</option>
                  </select>
                </div>

                {formData.role === 'psychologist' && (
                  <>
                    <div className='border-t pt-6'>
                      <h3 className={`text-lg font-semibold mb-4 transition-colors duration-500 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        Información Profesional
                      </h3>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                      <div>
                        <label className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Título profesional *
                        </label>
                        <input
                          type='text'
                          name='professionalTitle'
                          value={formData.professionalTitle}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 ${
                            hasError('professionalTitle')
                              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                              : isDarkMode
                              ? 'border-gray-600 bg-gray-700 text-white focus:border-purple-500 focus:ring-purple-500'
                              : 'border-gray-300 bg-white text-gray-900 focus:border-purple-500 focus:ring-purple-500'
                          }`}
                          placeholder='Lic. en Psicología'
                        />
                        {hasError('professionalTitle') && (
                          <p className='text-red-500 text-sm mt-1'>{getError('professionalTitle')}</p>
                        )}
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Especialización *
                        </label>
                        <input
                          type='text'
                          name='specialization'
                          value={formData.specialization}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 ${
                            hasError('specialization')
                              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                              : isDarkMode
                              ? 'border-gray-600 bg-gray-700 text-white focus:border-purple-500 focus:ring-purple-500'
                              : 'border-gray-300 bg-white text-gray-900 focus:border-purple-500 focus:ring-purple-500'
                          }`}
                          placeholder='Terapia cognitiva'
                        />
                        {hasError('specialization') && (
                          <p className='text-red-500 text-sm mt-1'>{getError('specialization')}</p>
                        )}
                      </div>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                      <div>
                        <label className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Años de experiencia *
                        </label>
                        <input
                          type='number'
                          name='yearsOfExperience'
                          value={formData.yearsOfExperience}
                          onChange={handleInputChange}
                          min='0'
                          max='50'
                          className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 ${
                            hasError('yearsOfExperience')
                              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                              : isDarkMode
                              ? 'border-gray-600 bg-gray-700 text-white focus:border-purple-500 focus:ring-purple-500'
                              : 'border-gray-300 bg-white text-gray-900 focus:border-purple-500 focus:ring-purple-500'
                          }`}
                          placeholder='5'
                        />
                        {hasError('yearsOfExperience') && (
                          <p className='text-red-500 text-sm mt-1'>{getError('yearsOfExperience')}</p>
                        )}
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Número de licencia
                        </label>
                        <input
                          type='text'
                          name='licenseNumber'
                          value={formData.licenseNumber}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 ${
                            isDarkMode
                              ? 'border-gray-600 bg-gray-700 text-white focus:border-purple-500 focus:ring-purple-500'
                              : 'border-gray-300 bg-white text-gray-900 focus:border-purple-500 focus:ring-purple-500'
                          }`}
                          placeholder='PSI-123456'
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Teléfono
                      </label>
                      <input
                        type='tel'
                        name='phone'
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 ${
                          isDarkMode
                            ? 'border-gray-600 bg-gray-700 text-white focus:border-purple-500 focus:ring-purple-500'
                            : 'border-gray-300 bg-white text-gray-900 focus:border-purple-500 focus:ring-purple-500'
                        }`}
                        placeholder='+57 300 123 4567'
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Biografía profesional
                      </label>
                      <textarea
                        name='bio'
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows={4}
                        className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 resize-none ${
                          isDarkMode
                            ? 'border-gray-600 bg-gray-700 text-white focus:border-purple-500 focus:ring-purple-500'
                            : 'border-gray-300 bg-white text-gray-900 focus:border-purple-500 focus:ring-purple-500'
                        }`}
                        placeholder='Cuéntanos sobre tu experiencia y enfoque terapéutico...'
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Hoja de vida (PDF) - Opcional
                      </label>
                      <input
                        type='file'
                        name='cvFile'
                        onChange={handleFileChange}
                        accept='.pdf'
                        className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 ${
                          isDarkMode
                            ? 'border-gray-600 bg-gray-700 text-white focus:border-purple-500 focus:ring-purple-500'
                            : 'border-gray-300 bg-white text-gray-900 focus:border-purple-500 focus:ring-purple-500'
                        }`}
                      />
                      <p className={`text-sm mt-1 transition-colors duration-500 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Máximo 5MB. Formatos permitidos: PDF
                      </p>
                    </div>
                  </>
                )}

                <div className='flex space-x-4 pt-6'>
                  <button
                    type='button'
                    onClick={() => navigate('/login')}
                    className={`flex-1 px-6 py-3 rounded-lg border transition-all duration-300 ${
                      isDarkMode
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Cancelar
                  </button>
                  <button
                    type='submit'
                    disabled={loading || uploadingFile}
                    className='flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {loading ? (
                      <div className='flex items-center justify-center'>
                        <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
                        Completando...
                      </div>
                    ) : uploadingFile ? (
                      <div className='flex items-center justify-center'>
                        <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
                        Subiendo archivo...
                      </div>
                    ) : (
                      'Completar Perfil'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;