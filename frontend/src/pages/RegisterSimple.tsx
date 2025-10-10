import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { useValidation } from '../hooks/useValidation';
import { uploadFile } from '../services/firebase';
import Logo from '../components/Logo';

const RegisterSimple: React.FC = () => {
  const { signUp, signUpWithGoogle } = useAuth();
  const { validate, hasError, getError, clearErrors } = useValidation();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user' as 'user' | 'psychologist',
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

    if (!formData.firstName.trim()) {
      validate('firstName', 'El nombre es requerido');
      isValid = false;
    }

    if (!formData.lastName.trim()) {
      validate('lastName', 'El apellido es requerido');
      isValid = false;
    }

    if (!formData.email.trim()) {
      validate('email', 'El correo electrónico es requerido');
      isValid = false;
    } else if (!commonValidationRules.email.test(formData.email)) {
      validate('email', 'El correo electrónico no es válido');
      isValid = false;
    }

    if (!formData.password) {
      validate('password', 'La contraseña es requerida');
      isValid = false;
    } else if (formData.password.length < 6) {
      validate('password', 'La contraseña debe tener al menos 6 caracteres');
      isValid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      validate('confirmPassword', 'Las contraseñas no coinciden');
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

    if (!agreedToTerms) {
      toast.error('Debes aceptar los términos y condiciones');
      isValid = false;
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
          cvUrl = await uploadFile(formData.cvFile, `psychologists/${formData.email}/cv`);
          toast.success('Archivo subido correctamente');
        } catch (uploadError) {
          console.error('Error uploading CV:', uploadError);
          toast.error('Error al subir el archivo CV. Inténtalo de nuevo.');
          return;
        } finally {
          setUploadingFile(false);
        }
      }

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

      toast.success(`¡Cuenta creada! Bienvenido${formData.role === 'psychologist' ? ' psicólogo' : ''} a Mood Log`);

      setTimeout(() => {
        if (formData.role === 'psychologist') {
          navigate('/dashboard-psychologist');
        } else {
          navigate('/dashboard');
        }
      }, 1500);
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setLoading(true);
      await signUpWithGoogle();
      toast.success('¡Cuenta creada con Google!');
    } catch (error: any) {
      console.error('Google registration error:', error);
      toast.error(error.message || 'Error al registrarse con Google');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return <LoadingSpinner />;
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

                <Logo className='mx-auto mb-6' />
                <h1
                  className={`text-3xl font-bold mb-2 transition-colors duration-500 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Crear Cuenta
                </h1>
                <p
                  className={`text-lg transition-colors duration-500 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  Únete a nuestra comunidad de bienestar
                </p>
              </div>

              <form onSubmit={handleSubmit} className='space-y-6'>
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

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label
                      className={`block text-sm font-bold mb-2 transition-colors duration-500 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      NOMBRE *
                    </label>
                    <input
                      type='text'
                      name='firstName'
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 ${
                        hasError('firstName')
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : isDarkMode
                          ? 'border-gray-600 bg-gray-700 text-white focus:border-purple-500 focus:ring-purple-500'
                          : 'border-gray-300 bg-white text-gray-900 focus:border-purple-500 focus:ring-purple-500'
                      }`}
                      placeholder='Tu nombre'
                    />
                    {hasError('firstName') && (
                      <p className='text-red-500 text-sm mt-1'>{getError('firstName')}</p>
                    )}
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-bold mb-2 transition-colors duration-500 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      APELLIDO *
                    </label>
                    <input
                      type='text'
                      name='lastName'
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 ${
                        hasError('lastName')
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : isDarkMode
                          ? 'border-gray-600 bg-gray-700 text-white focus:border-purple-500 focus:ring-purple-500'
                          : 'border-gray-300 bg-white text-gray-900 focus:border-purple-500 focus:ring-purple-500'
                      }`}
                      placeholder='Tu apellido'
                    />
                    {hasError('lastName') && (
                      <p className='text-red-500 text-sm mt-1'>{getError('lastName')}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    className={`block text-sm font-bold mb-2 transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    CORREO ELECTRÓNICO *
                  </label>
                  <input
                    type='email'
                    name='email'
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 ${
                      hasError('email')
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : isDarkMode
                        ? 'border-gray-600 bg-gray-700 text-white focus:border-purple-500 focus:ring-purple-500'
                        : 'border-gray-300 bg-white text-gray-900 focus:border-purple-500 focus:ring-purple-500'
                    }`}
                    placeholder='tu@email.com'
                  />
                  {hasError('email') && (
                    <p className='text-red-500 text-sm mt-1'>{getError('email')}</p>
                  )}
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label
                      className={`block text-sm font-bold mb-2 transition-colors duration-500 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      CONTRASEÑA *
                    </label>
                    <input
                      type='password'
                      name='password'
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 ${
                        hasError('password')
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : isDarkMode
                          ? 'border-gray-600 bg-gray-700 text-white focus:border-purple-500 focus:ring-purple-500'
                          : 'border-gray-300 bg-white text-gray-900 focus:border-purple-500 focus:ring-purple-500'
                      }`}
                      placeholder='Mínimo 6 caracteres'
                    />
                    {hasError('password') && (
                      <p className='text-red-500 text-sm mt-1'>{getError('password')}</p>
                    )}
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-bold mb-2 transition-colors duration-500 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      CONFIRMAR CONTRASEÑA *
                    </label>
                    <input
                      type='password'
                      name='confirmPassword'
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 ${
                        hasError('confirmPassword')
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : isDarkMode
                          ? 'border-gray-600 bg-gray-700 text-white focus:border-purple-500 focus:ring-purple-500'
                          : 'border-gray-300 bg-white text-gray-900 focus:border-purple-500 focus:ring-purple-500'
                      }`}
                      placeholder='Repite tu contraseña'
                    />
                    {hasError('confirmPassword') && (
                      <p className='text-red-500 text-sm mt-1'>{getError('confirmPassword')}</p>
                    )}
                  </div>
                </div>

                {formData.role === 'psychologist' && (
                  <>
                    <div className='border-t pt-6'>
                      <h3
                        className={`text-lg font-semibold mb-4 transition-colors duration-500 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        Información Profesional
                      </h3>
                    </div>

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
                        <label
                          className={`block text-sm font-bold mb-2 transition-colors duration-500 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}
                        >
                          ESPECIALIZACIÓN *
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
                        <label
                          className={`block text-sm font-bold mb-2 transition-colors duration-500 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}
                        >
                          NÚMERO DE LICENCIA
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
                      <label
                        className={`block text-sm font-bold mb-2 transition-colors duration-500 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        TELÉFONO
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
                      <label
                        className={`block text-sm font-bold mb-2 transition-colors duration-500 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        BIOGRAFÍA PROFESIONAL
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
                      <label
                        className={`block text-sm font-bold mb-2 transition-colors duration-500 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        HOJA DE VIDA (PDF) - OPCIONAL
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
                      <p
                        className={`text-sm mt-1 transition-colors duration-500 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}
                      >
                        Máximo 5MB. Formatos permitidos: PDF
                      </p>
                    </div>
                  </>
                )}

                <div className='flex items-center space-x-3'>
                  <input
                    type='checkbox'
                    id='terms'
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className='w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500'
                  />
                  <label
                    htmlFor='terms'
                    className={`text-sm transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Acepto los{' '}
                    <Link to='/terms' className='text-purple-600 hover:text-purple-700 underline'>
                      términos y condiciones
                    </Link>{' '}
                    y la{' '}
                    <Link to='/privacy' className='text-purple-600 hover:text-purple-700 underline'>
                      política de privacidad
                    </Link>
                  </label>
                </div>

                <div className='space-y-4'>
                  <button
                    type='submit'
                    disabled={loading || uploadingFile || !agreedToTerms}
                    className='w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg'
                  >
                    {loading ? (
                      <div className='flex items-center justify-center'>
                        <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
                        Creando cuenta...
                      </div>
                    ) : uploadingFile ? (
                      <div className='flex items-center justify-center'>
                        <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
                        Subiendo archivo...
                      </div>
                    ) : (
                      'CREAR CUENTA'
                    )}
                  </button>

                  <div className='relative'>
                    <div className='absolute inset-0 flex items-center'>
                      <div className='w-full border-t border-gray-300'></div>
                    </div>
                    <div className='relative flex justify-center text-sm'>
                      <span
                        className={`px-2 transition-colors duration-500 ${
                          isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'
                        }`}
                      >
                        O continúa con
                      </span>
                    </div>
                  </div>

                  <button
                    type='button'
                    onClick={handleGoogleSignUp}
                    disabled={loading}
                    className='w-full px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2'
                  >
                    <svg className='w-5 h-5' viewBox='0 0 24 24'>
                      <path
                        fill='#4285F4'
                        d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                      />
                      <path
                        fill='#34A853'
                        d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                      />
                      <path
                        fill='#FBBC05'
                        d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                      />
                      <path
                        fill='#EA4335'
                        d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                      />
                    </svg>
                    <span>Continuar con Google</span>
                  </button>
                </div>

                <div className='text-center'>
                  <p
                    className={`text-sm transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    ¿Ya tienes una cuenta?{' '}
                    <Link
                      to='/login'
                      className='text-purple-600 hover:text-purple-700 font-bold transition-colors duration-300'
                    >
                      Inicia sesión
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterSimple;