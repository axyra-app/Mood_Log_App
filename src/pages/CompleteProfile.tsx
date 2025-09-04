import { Heart, Shield, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const CompleteProfile = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: userProfile?.name || currentUser?.displayName || '',
    phone: userProfile?.phone || '',
    birthDate: userProfile?.birthDate || '',
    gender: userProfile?.gender || '',
    role: 'user' as 'user' | 'psychologist',
    // Psychologist specific fields
    licenseNumber: userProfile?.licenseNumber || '',
    specialization: userProfile?.specialization || '',
    experience: userProfile?.experience?.toString() || '',
    bio: userProfile?.bio || '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

    if (!currentUser?.uid) {
      setError('Error: Usuario no autenticado');
      setLoading(false);
      return;
    }

    try {
      // Update user profile in Firestore
      const updatedProfile = {
        uid: currentUser.uid,
        email: currentUser.email || '',
        name: formData.name,
        role: formData.role,
        phone: formData.phone,
        birthDate: formData.birthDate,
        gender: formData.gender,
        licenseNumber: formData.licenseNumber,
        specialization: formData.specialization,
        experience: formData.experience ? parseInt(formData.experience) : undefined,
        bio: formData.bio,
        createdAt: userProfile?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      console.log('Updating user profile:', updatedProfile);
      await setDoc(doc(db, 'users', currentUser.uid), updatedProfile);
      console.log('Profile updated successfully');

      // Navigate based on role
      navigate(formData.role === 'psychologist' ? '/psychologist-dashboard' : '/diary-entry');
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError('Error al actualizar el perfil. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-2xl mx-auto'>
        {/* Header */}
        <div className='text-center mb-8'>
          <Link to='/' className='inline-flex items-center space-x-2 mb-6'>
            <div className='w-12 h-12 bg-gradient-to-r from-primary-600 to-purple-600 rounded-lg flex items-center justify-center'>
              <Heart className='w-7 h-7 text-white' />
            </div>
            <span className='text-3xl font-bold text-gradient'>Mood Log App</span>
          </Link>
          <h2 className='text-3xl font-bold text-gray-900 mb-2'>Completa tu Perfil</h2>
          <p className='text-gray-600'>Necesitamos algunos datos adicionales para personalizar tu experiencia</p>
        </div>

        {/* Form */}
        <div className='bg-white rounded-2xl shadow-xl p-8 border border-gray-100'>
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* User Type Selection */}
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

            {/* Name */}
            <div>
              <label htmlFor='name' className='block text-sm font-medium text-gray-700 mb-2'>
                Nombre Completo *
              </label>
              <input
                type='text'
                id='name'
                name='name'
                value={formData.name}
                onChange={handleChange}
                required
                className='input-field'
                placeholder='Tu nombre completo'
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor='phone' className='block text-sm font-medium text-gray-700 mb-2'>
                Teléfono
              </label>
              <input
                type='tel'
                id='phone'
                name='phone'
                value={formData.phone}
                onChange={handleChange}
                className='input-field'
                placeholder='+57 300 123 4567'
              />
            </div>

            {/* Birth Date */}
            <div>
              <label htmlFor='birthDate' className='block text-sm font-medium text-gray-700 mb-2'>
                Fecha de Nacimiento
              </label>
              <input
                type='date'
                id='birthDate'
                name='birthDate'
                value={formData.birthDate}
                onChange={handleChange}
                className='input-field'
              />
            </div>

            {/* Gender */}
            <div>
              <label htmlFor='gender' className='block text-sm font-medium text-gray-700 mb-2'>
                Género
              </label>
              <select
                id='gender'
                name='gender'
                value={formData.gender}
                onChange={handleChange}
                className='input-field'
              >
                <option value=''>Selecciona tu género</option>
                <option value='masculino'>Masculino</option>
                <option value='femenino'>Femenino</option>
                <option value='otro'>Otro</option>
                <option value='prefiero_no_decir'>Prefiero no decir</option>
              </select>
            </div>

            {/* Psychologist specific fields */}
            {formData.role === 'psychologist' && (
              <>
                <div>
                  <label htmlFor='licenseNumber' className='block text-sm font-medium text-gray-700 mb-2'>
                    Número de Licencia *
                  </label>
                  <input
                    type='text'
                    id='licenseNumber'
                    name='licenseNumber'
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    required
                    className='input-field'
                    placeholder='Tu número de licencia profesional'
                  />
                </div>

                <div>
                  <label htmlFor='specialization' className='block text-sm font-medium text-gray-700 mb-2'>
                    Especialización *
                  </label>
                  <input
                    type='text'
                    id='specialization'
                    name='specialization'
                    value={formData.specialization}
                    onChange={handleChange}
                    required
                    className='input-field'
                    placeholder='Ej: Terapia cognitiva, Psicología clínica'
                  />
                </div>

                <div>
                  <label htmlFor='experience' className='block text-sm font-medium text-gray-700 mb-2'>
                    Años de Experiencia *
                  </label>
                  <input
                    type='number'
                    id='experience'
                    name='experience'
                    value={formData.experience}
                    onChange={handleChange}
                    required
                    min='0'
                    max='50'
                    className='input-field'
                    placeholder='0'
                  />
                </div>

                <div>
                  <label htmlFor='bio' className='block text-sm font-medium text-gray-700 mb-2'>
                    Biografía
                  </label>
                  <textarea
                    id='bio'
                    name='bio'
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    className='input-field'
                    placeholder='Cuéntanos sobre tu experiencia y enfoque profesional...'
                  />
                </div>
              </>
            )}

            {/* Error Message */}
            {error && (
              <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg'>
                {error}
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
                  <span>Completando perfil...</span>
                </div>
              ) : (
                'Completar Perfil'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
