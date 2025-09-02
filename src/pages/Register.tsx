import { Check, Eye, EyeOff, Heart, Shield, User } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    birthDate: '',
    gender: '',
    role: 'user' as 'user' | 'psychologist',
    // Psychologist specific fields
    licenseNumber: '',
    specialization: '',
    experience: '',
    bio: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (!acceptTerms) {
      setError('Debes aceptar los términos y condiciones');
      setLoading(false);
      return;
    }

    try {
      await register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: formData.role,
        phone: formData.phone,
        birthDate: formData.birthDate,
        gender: formData.gender,
        licenseNumber: formData.licenseNumber,
        specialization: formData.specialization,
        experience: formData.experience ? parseInt(formData.experience) : undefined,
        bio: formData.bio,
      });
      navigate(formData.role === 'psychologist' ? '/psychologist-dashboard' : '/dashboard');
    } catch (err: any) {
      setError('Error al crear la cuenta. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-2xl mx-auto'>
        {/* Header */}
        <div className='text-center mb-8'>
          <Link to='/' className='flex items-center justify-center space-x-2 mb-6'>
            <div className='w-12 h-12 bg-gradient-to-r from-primary-600 to-purple-600 rounded-lg flex items-center justify-center'>
              <Heart className='w-7 h-7 text-white' />
            </div>
            <span className='text-3xl font-bold text-gradient'>Mood Log App</span>
          </Link>
          <h2 className='text-3xl font-bold text-gray-900 mb-2'>Crear Cuenta</h2>
          <p className='text-gray-600'>Únete a nuestra comunidad de bienestar mental</p>
        </div>

        {/* Form */}
        <div className='bg-white rounded-2xl shadow-xl p-8 border border-gray-100'>
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Role Selection */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-3'>Tipo de Usuario</label>
              <div className='grid grid-cols-2 gap-3'>
                <button
                  type='button'
                  onClick={() => setFormData({ ...formData, role: 'user' })}
                  className={`flex items-center justify-center space-x-2 p-4 rounded-lg border-2 transition-all duration-200 ${
                    formData.role === 'user'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <User className='w-5 h-5' />
                  <span className='font-medium'>Usuario</span>
                </button>
                <button
                  type='button'
                  onClick={() => setFormData({ ...formData, role: 'psychologist' })}
                  className={`flex items-center justify-center space-x-2 p-4 rounded-lg border-2 transition-all duration-200 ${
                    formData.role === 'psychologist'
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <Shield className='w-5 h-5' />
                  <span className='font-medium'>Psicólogo</span>
                </button>
              </div>
            </div>

            {/* Basic Information */}
            <div className='grid md:grid-cols-2 gap-6'>
              <div>
                <label htmlFor='name' className='block text-sm font-medium text-gray-700 mb-2'>
                  Nombre Completo *
                </label>
                <input
                  id='name'
                  name='name'
                  type='text'
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className='input-field'
                  placeholder='Tu nombre completo'
                />
              </div>

              <div>
                <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-2'>
                  Email *
                </label>
                <input
                  id='email'
                  name='email'
                  type='email'
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className='input-field'
                  placeholder='tu@email.com'
                />
              </div>
            </div>

            <div className='grid md:grid-cols-2 gap-6'>
              <div>
                <label htmlFor='phone' className='block text-sm font-medium text-gray-700 mb-2'>
                  Teléfono
                </label>
                <input
                  id='phone'
                  name='phone'
                  type='tel'
                  value={formData.phone}
                  onChange={handleChange}
                  className='input-field'
                  placeholder='+1 (555) 123-4567'
                />
              </div>

              <div>
                <label htmlFor='birthDate' className='block text-sm font-medium text-gray-700 mb-2'>
                  Fecha de Nacimiento
                </label>
                <input
                  id='birthDate'
                  name='birthDate'
                  type='date'
                  value={formData.birthDate}
                  onChange={handleChange}
                  className='input-field'
                />
              </div>
            </div>

            <div>
              <label htmlFor='gender' className='block text-sm font-medium text-gray-700 mb-2'>
                Género
              </label>
              <select id='gender' name='gender' value={formData.gender} onChange={handleChange} className='input-field'>
                <option value=''>Seleccionar género</option>
                <option value='masculino'>Masculino</option>
                <option value='femenino'>Femenino</option>
                <option value='otro'>Otro</option>
                <option value='prefiero-no-decir'>Prefiero no decir</option>
              </select>
            </div>

            {/* Password Fields */}
            <div className='grid md:grid-cols-2 gap-6'>
              <div>
                <label htmlFor='password' className='block text-sm font-medium text-gray-700 mb-2'>
                  Contraseña *
                </label>
                <div className='relative'>
                  <input
                    id='password'
                    name='password'
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className='input-field pr-12'
                    placeholder='••••••••'
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
                  >
                    {showPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor='confirmPassword' className='block text-sm font-medium text-gray-700 mb-2'>
                  Confirmar Contraseña *
                </label>
                <div className='relative'>
                  <input
                    id='confirmPassword'
                    name='confirmPassword'
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className='input-field pr-12'
                    placeholder='••••••••'
                  />
                  <button
                    type='button'
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
                  >
                    {showConfirmPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                  </button>
                </div>
              </div>
            </div>

            {/* Psychologist Specific Fields */}
            {formData.role === 'psychologist' && (
              <div className='border-t border-gray-200 pt-6 space-y-6'>
                <h3 className='text-lg font-semibold text-gray-900'>Información Profesional</h3>

                <div className='grid md:grid-cols-2 gap-6'>
                  <div>
                    <label htmlFor='licenseNumber' className='block text-sm font-medium text-gray-700 mb-2'>
                      Número de Licencia *
                    </label>
                    <input
                      id='licenseNumber'
                      name='licenseNumber'
                      type='text'
                      required={formData.role === 'psychologist'}
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      className='input-field'
                      placeholder='Número de licencia profesional'
                    />
                  </div>

                  <div>
                    <label htmlFor='specialization' className='block text-sm font-medium text-gray-700 mb-2'>
                      Especialización
                    </label>
                    <input
                      id='specialization'
                      name='specialization'
                      type='text'
                      value={formData.specialization}
                      onChange={handleChange}
                      className='input-field'
                      placeholder='Ej: Terapia cognitivo-conductual'
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor='experience' className='block text-sm font-medium text-gray-700 mb-2'>
                    Años de Experiencia
                  </label>
                  <input
                    id='experience'
                    name='experience'
                    type='number'
                    min='0'
                    value={formData.experience}
                    onChange={handleChange}
                    className='input-field'
                    placeholder='0'
                  />
                </div>

                <div>
                  <label htmlFor='bio' className='block text-sm font-medium text-gray-700 mb-2'>
                    Biografía Profesional
                  </label>
                  <textarea
                    id='bio'
                    name='bio'
                    rows={4}
                    value={formData.bio}
                    onChange={handleChange}
                    className='input-field resize-none'
                    placeholder='Cuéntanos sobre tu experiencia y enfoque terapéutico...'
                  />
                </div>
              </div>
            )}

            {/* Terms and Conditions */}
            <div className='flex items-start space-x-3'>
              <button
                type='button'
                onClick={() => setAcceptTerms(!acceptTerms)}
                className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  acceptTerms
                    ? 'bg-primary-600 border-primary-600 text-white'
                    : 'border-gray-300 hover:border-primary-500'
                }`}
              >
                {acceptTerms && <Check className='w-3 h-3' />}
              </button>
              <label className='text-sm text-gray-600'>
                Acepto los{' '}
                <a href='#' className='text-primary-600 hover:text-primary-700 font-medium'>
                  términos y condiciones
                </a>{' '}
                y la{' '}
                <a href='#' className='text-primary-600 hover:text-primary-700 font-medium'>
                  política de privacidad
                </a>
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
                <p className='text-red-600 text-sm'>{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type='submit'
              disabled={loading}
              className='w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {loading ? (
                <div className='flex items-center justify-center space-x-2'>
                  <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                  <span>Creando cuenta...</span>
                </div>
              ) : (
                'Crear Cuenta'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className='mt-6 text-center'>
            <p className='text-gray-600'>
              ¿Ya tienes cuenta?{' '}
              <Link to='/login' className='text-primary-600 hover:text-primary-700 font-medium transition-colors'>
                Iniciar sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
