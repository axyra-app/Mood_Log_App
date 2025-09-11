import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import NotificationToast from '../components/NotificationToast';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import { commonValidationRules, useValidation } from '../hooks/useValidation';
import { uploadFile } from '../services/firebase';

const RegisterSimple: React.FC = () => {
  const { signUp, signUpWithGoogle } = useAuth();
  const { validate, hasError, getError, clearErrors } = useValidation();
  const { notifications, showSuccess, showError, removeNotification } = useNotifications();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
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
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      if (!allowedTypes.includes(file.type)) {
        showError('Error de archivo', 'Solo se permiten archivos PDF o Word');
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showError('Error de archivo', 'El archivo debe ser menor a 5MB');
        return;
      }

      setFormData((prev) => ({
        ...prev,
        cvFile: file,
      }));

      showSuccess('Archivo seleccionado', 'El archivo se subirá al crear la cuenta');
    }
  };

  const validateForm = () => {
    clearErrors();

    // Crear reglas de validación dinámicas
    const validationRules = {
      ...commonValidationRules,
      confirmPassword: {
        required: true,
        custom: (value: string) => {
          if (value !== formData.password) {
            return 'Las contraseñas no coinciden';
          }
          return null;
        },
      },
      agreedToTerms: {
        required: true,
        custom: (value: boolean) => {
          if (!value) {
            return 'Debes aceptar los términos de servicio y política de privacidad';
          }
          return null;
        },
      },
    };

    // Agregar validaciones específicas para psicólogos
    if (formData.role === 'psychologist') {
      Object.assign(validationRules, {
        professionalTitle: commonValidationRules.professionalTitle,
        specialization: commonValidationRules.specialization,
        yearsOfExperience: commonValidationRules.yearsOfExperience,
        licenseNumber: commonValidationRules.licenseNumber,
        bio: commonValidationRules.bio,
      });
    }

    const dataToValidate = {
      ...formData,
      agreedToTerms,
    };

    const isValid = validate(dataToValidate, validationRules);

    if (!isValid) {
      showError('Error de validación', 'Por favor corrige los errores en el formulario');
    }

    return isValid;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      // Subir CV si es psicólogo y tiene archivo
      let cvUrl = '';
      if (formData.role === 'psychologist' && formData.cvFile) {
        setUploadingFile(true);
        try {
          cvUrl = await uploadFile(formData.cvFile, `psychologists/${formData.email}/cv`);
          showSuccess('Archivo subido', 'Tu hoja de vida se ha subido correctamente');
        } catch (uploadError) {
          console.error('Error uploading CV:', uploadError);
          showError('Error de archivo', 'Error al subir el archivo CV. Inténtalo de nuevo.');
          return;
        } finally {
          setUploadingFile(false);
        }
      }

      // Preparar datos profesionales si es psicólogo
      const professionalData =
        formData.role === 'psychologist'
          ? {
              professionalTitle: formData.professionalTitle,
              specialization: formData.specialization,
              yearsOfExperience: formData.yearsOfExperience,
              bio: formData.bio,
              licenseNumber: formData.licenseNumber,
              phone: formData.phone,
              cvUrl: cvUrl,
            }
          : undefined;

      await signUp(formData.email, formData.password, formData.role, professionalData);

      showSuccess('¡Cuenta creada!', `Bienvenido${formData.role === 'psychologist' ? ' psicólogo' : ''} a Mood Log`);

      // Redirigir según el rol
      setTimeout(() => {
        if (formData.role === 'psychologist') {
          navigate('/dashboard-psychologist');
        } else {
          navigate('/dashboard');
        }
      }, 1500);
    } catch (error: any) {
      console.error('Registration error:', error);

      // Manejar específicamente el error de email ya existente
      if (error.message && error.message.includes('Ya existe una cuenta con este email')) {
        showError(
          'Email ya registrado',
          'Ya existe una cuenta con este email. ¿Quieres iniciar sesión? Ve a la página de login.'
        );
      } else {
        showError('Error de registro', error.message || 'Error inesperado al crear la cuenta');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setLoading(true);

      await signUpWithGoogle();
      // La redirección se maneja en el useEffect
    } catch (error: any) {
      showError('Error en el registro con Google', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${
          isDarkMode ? 'bg-gray-900' : 'bg-white'
        }`}
      >
        <LoadingSpinner size='xl' text='Cargando...' isDarkMode={isDarkMode} />
      </div>
    );
  }

  return (
    <>
      {/* Notificaciones */}
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          {...notification}
          onClose={removeNotification}
          isDarkMode={isDarkMode}
        />
      ))}

      <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
        {/* Header */}
        <header
          className={`py-6 px-6 transition-colors duration-500 ${
            isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'
          } backdrop-blur-lg border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
        >
          <div className='max-w-7xl mx-auto flex items-center justify-between'>
            <Link to='/' className='flex items-center space-x-3 group'>
              <div className='w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300'>
                <span className='text-white font-black text-lg'>💜</span>
              </div>
              <span
                className={`text-2xl font-black transition-colors duration-500 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                MOOD LOG
              </span>
            </Link>

            <button
              onClick={toggleDarkMode}
              className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 ${
                isDarkMode
                  ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </header>

        {/* Main Content */}
        <div className='flex min-h-[calc(100vh-80px)]'>
          {/* Centered Form */}
          <div className='flex-1 flex items-center justify-center p-8'>
            <div className='w-full max-w-md'>
              <div className='text-center mb-8'>
                <h1
                  className={`text-4xl font-black mb-4 transition-colors duration-500 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  CREAR CUENTA
                </h1>
                <p
                  className={`text-lg transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  Únete a la revolución emocional
                </p>
              </div>

              <form onSubmit={handleSubmit} className='space-y-6'>
                {/* Role Selection */}
                <div>
                  <label
                    className={`block text-sm font-bold mb-3 transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    TIPO DE CUENTA
                  </label>
                  <div className='grid grid-cols-2 gap-3'>
                    <button
                      type='button'
                      onClick={() => setFormData((prev) => ({ ...prev, role: 'user' }))}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                        formData.role === 'user'
                          ? isDarkMode
                            ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                            : 'border-purple-500 bg-purple-50 text-purple-600'
                          : isDarkMode
                          ? 'border-gray-600 text-gray-400 hover:border-gray-500'
                          : 'border-gray-300 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <div className='text-2xl mb-2'>👤</div>
                      <div className='font-bold text-sm'>USUARIO</div>
                    </button>
                    <button
                      type='button'
                      onClick={() => setFormData((prev) => ({ ...prev, role: 'psychologist' }))}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                        formData.role === 'psychologist'
                          ? isDarkMode
                            ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                            : 'border-purple-500 bg-purple-50 text-purple-600'
                          : isDarkMode
                          ? 'border-gray-600 text-gray-400 hover:border-gray-500'
                          : 'border-gray-300 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <div className='text-2xl mb-2'>🧠</div>
                      <div className='font-bold text-sm'>PSICÓLOGO</div>
                    </button>
                  </div>
                </div>

                {/* Name Fields */}
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label
                      className={`block text-sm font-bold mb-2 transition-colors duration-500 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      NOMBRE
                    </label>
                    <input
                      type='text'
                      name='firstName'
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-4 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 ${
                        hasError('firstName')
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                          : isDarkMode
                          ? 'bg-gray-800 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500/20'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-purple-500/20'
                      }`}
                      placeholder='Juan'
                    />
                    {hasError('firstName') && <p className='text-red-500 text-xs mt-1'>{getError('firstName')}</p>}
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-bold mb-2 transition-colors duration-500 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      APELLIDO
                    </label>
                    <input
                      type='text'
                      name='lastName'
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-4 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 ${
                        isDarkMode
                          ? 'bg-gray-800 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500/20'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-purple-500/20'
                      }`}
                      placeholder='Pérez'
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    className={`block text-sm font-bold mb-2 transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    EMAIL
                  </label>
                  <input
                    type='email'
                    name='email'
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-4 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 ${
                      isDarkMode
                        ? 'bg-gray-800 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500/20'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-purple-500/20'
                    }`}
                    placeholder='tu@email.com'
                  />
                </div>

                {/* Password Fields */}
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label
                      className={`block text-sm font-bold mb-2 transition-colors duration-500 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      CONTRASEÑA
                    </label>
                    <input
                      type='password'
                      name='password'
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-4 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 ${
                        isDarkMode
                          ? 'bg-gray-800 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500/20'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-purple-500/20'
                      }`}
                      placeholder='••••••••'
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-bold mb-2 transition-colors duration-500 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      CONFIRMAR
                    </label>
                    <input
                      type='password'
                      name='confirmPassword'
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-4 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 ${
                        isDarkMode
                          ? 'bg-gray-800 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500/20'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-purple-500/20'
                      }`}
                      placeholder='••••••••'
                    />
                  </div>
                </div>

                {/* Campos profesionales para psicólogos */}
                {formData.role === 'psychologist' && (
                  <div className='space-y-6 p-6 rounded-2xl border-2 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'>
                    <div className='text-center'>
                      <h3
                        className={`text-xl font-black mb-2 transition-colors duration-500 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        🧠 INFORMACIÓN PROFESIONAL
                      </h3>
                      <p
                        className={`text-sm transition-colors duration-500 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}
                      >
                        Completa tu perfil profesional para conectar con pacientes
                      </p>
                    </div>

                    {/* Título profesional y especialización */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div>
                        <label
                          className={`block text-sm font-bold mb-2 transition-colors duration-500 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}
                        >
                          TÍTULO PROFESIONAL *
                        </label>
                        <input
                          type='text'
                          name='professionalTitle'
                          value={formData.professionalTitle}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-4 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 ${
                            isDarkMode
                              ? 'bg-gray-800 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500/20'
                              : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-purple-500/20'
                          }`}
                          placeholder='Lic. en Psicología'
                        />
                      </div>
                      <div>
                        <label
                          className={`block text-sm font-bold mb-2 transition-colors duration-500 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}
                        >
                          ESPECIALIZACIÓN *
                        </label>
                        <select
                          name='specialization'
                          value={formData.specialization}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-4 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 ${
                            isDarkMode
                              ? 'bg-gray-800 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500/20'
                              : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-purple-500/20'
                          }`}
                        >
                          <option value=''>Seleccionar especialización</option>
                          <option value='ansiedad-estres'>Ansiedad y Estrés</option>
                          <option value='depresion'>Depresión</option>
                          <option value='terapia-pareja'>Terapia de Pareja</option>
                          <option value='terapia-familiar'>Terapia Familiar</option>
                          <option value='trauma'>Trauma y EMDR</option>
                          <option value='adolescentes'>Psicología Adolescente</option>
                          <option value='infantil'>Psicología Infantil</option>
                          <option value='neuropsicologia'>Neuropsicología</option>
                          <option value='forense'>Psicología Forense</option>
                          <option value='organizacional'>Psicología Organizacional</option>
                          <option value='otra'>Otra especialización</option>
                        </select>
                      </div>
                    </div>

                    {/* Años de experiencia y número de licencia */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div>
                        <label
                          className={`block text-sm font-bold mb-2 transition-colors duration-500 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}
                        >
                          AÑOS DE EXPERIENCIA *
                        </label>
                        <input
                          type='number'
                          name='yearsOfExperience'
                          value={formData.yearsOfExperience}
                          onChange={handleInputChange}
                          min='0'
                          max='50'
                          className={`w-full px-4 py-4 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 ${
                            isDarkMode
                              ? 'bg-gray-800 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500/20'
                              : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-purple-500/20'
                          }`}
                          placeholder='5'
                        />
                      </div>
                      <div>
                        <label
                          className={`block text-sm font-bold mb-2 transition-colors duration-500 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}
                        >
                          NÚMERO DE LICENCIA *
                        </label>
                        <input
                          type='text'
                          name='licenseNumber'
                          value={formData.licenseNumber}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-4 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 ${
                            isDarkMode
                              ? 'bg-gray-800 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500/20'
                              : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-purple-500/20'
                          }`}
                          placeholder='PSI-12345'
                        />
                      </div>
                    </div>

                    {/* Teléfono */}
                    <div>
                      <label
                        className={`block text-sm font-bold mb-2 transition-colors duration-500 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        TELÉFONO DE CONTACTO
                      </label>
                      <input
                        type='tel'
                        name='phone'
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-4 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 ${
                          isDarkMode
                            ? 'bg-gray-800 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500/20'
                            : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-purple-500/20'
                        }`}
                        placeholder='+52 55 1234 5678'
                      />
                    </div>

                    {/* Descripción profesional */}
                    <div>
                      <label
                        className={`block text-sm font-bold mb-2 transition-colors duration-500 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        DESCRIPCIÓN PROFESIONAL * (mínimo 50 caracteres)
                      </label>
                      <textarea
                        name='bio'
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows={4}
                        className={`w-full px-4 py-4 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 resize-none ${
                          isDarkMode
                            ? 'bg-gray-800 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500/20'
                            : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-purple-500/20'
                        }`}
                        placeholder='Describe tu experiencia, enfoque terapéutico y cómo puedes ayudar a tus pacientes...'
                      />
                      <p
                        className={`text-xs mt-1 transition-colors duration-500 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}
                      >
                        {formData.bio.length}/50 caracteres mínimos
                      </p>
                    </div>

                    {/* Subida de CV */}
                    <div>
                      <label
                        className={`block text-sm font-bold mb-2 transition-colors duration-500 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        HOJA DE VIDA (PDF o Word) - OPCIONAL
                      </label>
                      <div className='relative'>
                        <input
                          type='file'
                          onChange={handleFileChange}
                          accept='.pdf,.doc,.docx'
                          className='hidden'
                          id='cv-upload'
                        />
                        <label
                          htmlFor='cv-upload'
                          className={`w-full px-4 py-4 rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer hover:bg-gray-50 ${
                            isDarkMode
                              ? 'border-gray-600 text-gray-300 hover:bg-gray-800'
                              : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <div className='text-center'>
                            <div className='text-2xl mb-2'>📄</div>
                            <div className='font-semibold'>
                              {formData.cvFile ? formData.cvFile.name : 'Haz clic para subir tu CV'}
                            </div>
                            <div className='text-sm opacity-75'>PDF, DOC o DOCX (máximo 5MB)</div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Terms Agreement */}
                <div className='flex items-start space-x-3'>
                  <input
                    type='checkbox'
                    id='terms'
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className={`mt-1 w-5 h-5 rounded border-2 transition-colors duration-300 ${
                      isDarkMode
                        ? 'bg-gray-800 border-gray-600 text-purple-600 focus:ring-purple-500/20'
                        : 'bg-white border-gray-300 text-purple-600 focus:ring-purple-500/20'
                    }`}
                  />
                  <label
                    htmlFor='terms'
                    className={`text-sm transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    Acepto los{' '}
                    <Link to='/terms' className='text-purple-600 hover:underline font-semibold'>
                      términos de servicio
                    </Link>{' '}
                    y la{' '}
                    <Link to='/privacy' className='text-purple-600 hover:underline font-semibold'>
                      política de privacidad
                    </Link>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type='submit'
                  disabled={loading || uploadingFile}
                  className={`w-full py-4 px-6 rounded-xl font-black text-lg uppercase tracking-wider transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDarkMode
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-2xl hover:shadow-purple-500/50'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-2xl hover:shadow-purple-500/50'
                  }`}
                >
                  {loading ? (
                    <div className='flex items-center justify-center space-x-2'>
                      <div className='animate-spin text-xl'>⚡</div>
                      <span>{uploadingFile ? 'SUBIENDO ARCHIVO...' : 'CREANDO CUENTA...'}</span>
                    </div>
                  ) : (
                    'CREAR CUENTA'
                  )}
                </button>

                {/* Google Sign Up */}
                <button
                  type='button'
                  onClick={handleGoogleSignUp}
                  disabled={loading}
                  className={`w-full py-4 px-6 rounded-xl font-bold text-lg uppercase tracking-wider transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border-2 ${
                    isDarkMode
                      ? 'border-gray-600 text-white hover:bg-gray-800'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  🔗 REGISTRARSE CON GOOGLE
                </button>
              </form>

              {/* Login Link */}
              <div className='mt-8 text-center'>
                <p
                  className={`text-sm transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  ¿Ya tienes cuenta?{' '}
                  <Link
                    to='/login'
                    className={`font-bold transition-colors duration-300 hover:underline ${
                      isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-500'
                    }`}
                  >
                    INICIAR SESIÓN
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterSimple;
