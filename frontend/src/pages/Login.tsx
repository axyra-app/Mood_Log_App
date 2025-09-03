import { Eye, EyeOff, Heart, Shield, User } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'psychologist'>('user');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate(role === 'psychologist' ? '/psychologist-dashboard' : '/dashboard');
    } catch (err: any) {
      setError('Credenciales inválidas. Por favor, verifica tu email y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        {/* Header */}
        <div className='text-center'>
          <Link to='/' className='flex items-center justify-center space-x-2 mb-6'>
            <div className='w-12 h-12 bg-gradient-to-r from-primary-600 to-purple-600 rounded-lg flex items-center justify-center'>
              <Heart className='w-7 h-7 text-white' />
            </div>
            <span className='text-3xl font-bold text-gradient'>Mood Log App</span>
          </Link>
          <h2 className='text-3xl font-bold text-gray-900 mb-2'>Iniciar Sesión</h2>
          <p className='text-gray-600'>Accede a tu cuenta para continuar</p>
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
                  onClick={() => setRole('user')}
                  className={`flex items-center justify-center space-x-2 p-4 rounded-lg border-2 transition-all duration-200 ${
                    role === 'user'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <User className='w-5 h-5' />
                  <span className='font-medium'>Usuario</span>
                </button>
                <button
                  type='button'
                  onClick={() => setRole('psychologist')}
                  className={`flex items-center justify-center space-x-2 p-4 rounded-lg border-2 transition-all duration-200 ${
                    role === 'psychologist'
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <Shield className='w-5 h-5' />
                  <span className='font-medium'>Psicólogo</span>
                </button>
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-2'>
                Email
              </label>
              <input
                id='email'
                type='email'
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='input-field'
                placeholder='tu@email.com'
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor='password' className='block text-sm font-medium text-gray-700 mb-2'>
                Contraseña
              </label>
              <div className='relative'>
                <input
                  id='password'
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  <span>Iniciando sesión...</span>
                </div>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className='mt-6 text-center'>
            <p className='text-gray-600'>
              ¿No tienes cuenta?{' '}
              <Link to='/register' className='text-primary-600 hover:text-primary-700 font-medium transition-colors'>
                Crear cuenta
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
