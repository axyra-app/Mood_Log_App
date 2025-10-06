import { Activity, Bell, Calendar, Camera, Download, Edit, Globe, Mail, Save, Shield, User, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { getMoodStatistics } from '../services/analyticsService';
import { getUserSettings, updateUserSettings } from '../services/notificationService';
import { MoodStatistics, UserSettings, User as UserType } from '../types';

interface UserProfileProps {
  user: UserType;
  isDarkMode?: boolean;
  onUpdate?: (updatedUser: UserType) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, isDarkMode = false, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<UserType>(user);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [moodStats, setMoodStats] = useState<MoodStatistics | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'privacy' | 'notifications' | 'analytics'>(
    'profile'
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUserData();
  }, [user.uid]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const [settingsData, statsData] = await Promise.all([getUserSettings(user.uid), getMoodStatistics(user.uid)]);

      setSettings(settingsData);
      setMoodStats(statsData);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      // Update user profile
      if (onUpdate) {
        onUpdate(editedUser);
      }

      // Update settings if changed
      if (settings) {
        await updateUserSettings(user.uid, settings);
      }

      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof UserType, value: any) => {
    setEditedUser((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSettingsChange = (field: string, value: any) => {
    if (!settings) return;

    const keys = field.split('.');
    const newSettings = { ...settings };

    if (keys.length === 1) {
      (newSettings as any)[keys[0]] = value;
    } else if (keys.length === 2) {
      (newSettings as any)[keys[0]][keys[1]] = value;
    }

    setSettings(newSettings);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getMoodEmoji = (mood: number) => {
    if (mood >= 4) return '😊';
    if (mood >= 3) return '😐';
    if (mood >= 2) return '😔';
    return '😢';
  };

  const getMoodText = (mood: number) => {
    if (mood >= 4) return 'Excelente';
    if (mood >= 3) return 'Bueno';
    if (mood >= 2) return 'Regular';
    return 'Bajo';
  };

  if (loading) {
    return (
      <div className={`p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className='animate-pulse'>
          <div className='h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-6'></div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='h-64 bg-gray-300 dark:bg-gray-700 rounded'></div>
            <div className='h-64 bg-gray-300 dark:bg-gray-700 rounded'></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Header */}
      <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold'>Mi Perfil</h1>
            <p className='text-gray-500'>Gestiona tu información personal y preferencias</p>
          </div>

          <div className='flex items-center space-x-3'>
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className='flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50'
                >
                  <Save className='w-4 h-4' />
                  <span>Guardar</span>
                </button>
                <button
                  onClick={handleCancel}
                  className='flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600'
                >
                  <X className='w-4 h-4' />
                  <span>Cancelar</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className='flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600'
              >
                <Edit className='w-4 h-4' />
                <span>Editar</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <nav className='flex space-x-8 px-6'>
          {[
            { id: 'profile', label: 'Perfil', icon: User },
            { id: 'preferences', label: 'Preferencias', icon: Globe },
            { id: 'privacy', label: 'Privacidad', icon: Shield },
            { id: 'notifications', label: 'Notificaciones', icon: Bell },
            { id: 'analytics', label: 'Analíticas', icon: Activity },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className='w-4 h-4' />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className='p-6'>
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className='space-y-6'>
            {/* Profile Picture and Basic Info */}
            <div className='flex items-start space-x-6'>
              <div className='relative'>
                <div className='w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold'>
                  {user.displayName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                </div>
                {isEditing && (
                  <button className='absolute bottom-0 right-0 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600'>
                    <Camera className='w-4 h-4' />
                  </button>
                )}
              </div>

              <div className='flex-1'>
                <h2 className='text-xl font-semibold mb-2'>
                  {isEditing ? (
                    <input
                      type='text'
                      value={editedUser.displayName || ''}
                      onChange={(e) => handleInputChange('displayName', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder='Nombre completo'
                    />
                  ) : (
                    user.displayName || 'Sin nombre'
                  )}
                </h2>

                <div className='space-y-2'>
                  <div className='flex items-center space-x-2'>
                    <Mail className='w-4 h-4 text-gray-500' />
                    <span className='text-gray-600 dark:text-gray-400'>{user.email}</span>
                  </div>

                  <div className='flex items-center space-x-2'>
                    <Calendar className='w-4 h-4 text-gray-500' />
                    <span className='text-gray-600 dark:text-gray-400'>Miembro desde {formatDate(user.createdAt)}</span>
                  </div>

                  <div className='flex items-center space-x-2'>
                    <Shield className='w-4 h-4 text-gray-500' />
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        user.role === 'psychologist'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}
                    >
                      {user.role === 'psychologist' ? 'Psicólogo' : 'Usuario'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <h3 className='font-semibold mb-3'>Información Personal</h3>
                <div className='space-y-3'>
                  <div>
                    <label className='text-sm font-medium text-gray-500'>Nombre</label>
                    {isEditing ? (
                      <input
                        type='text'
                        value={editedUser.firstName || ''}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className={`w-full mt-1 px-3 py-2 border rounded-lg ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder='Nombre'
                      />
                    ) : (
                      <p className='text-sm'>{user.firstName || 'No especificado'}</p>
                    )}
                  </div>

                  <div>
                    <label className='text-sm font-medium text-gray-500'>Apellido</label>
                    {isEditing ? (
                      <input
                        type='text'
                        value={editedUser.lastName || ''}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className={`w-full mt-1 px-3 py-2 border rounded-lg ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder='Apellido'
                      />
                    ) : (
                      <p className='text-sm'>{user.lastName || 'No especificado'}</p>
                    )}
                  </div>

                  <div>
                    <label className='text-sm font-medium text-gray-500'>Teléfono</label>
                    {isEditing ? (
                      <input
                        type='tel'
                        value={editedUser.phone || ''}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={`w-full mt-1 px-3 py-2 border rounded-lg ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder='Teléfono'
                      />
                    ) : (
                      <p className='text-sm'>{user.phone || 'No especificado'}</p>
                    )}
                  </div>

                  <div>
                    <label className='text-sm font-medium text-gray-500'>Fecha de Nacimiento</label>
                    {isEditing ? (
                      <input
                        type='date'
                        value={editedUser.dateOfBirth || ''}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                        className={`w-full mt-1 px-3 py-2 border rounded-lg ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    ) : (
                      <p className='text-sm'>{user.dateOfBirth ? formatDate(user.dateOfBirth) : 'No especificado'}</p>
                    )}
                  </div>

                  <div>
                    <label className='text-sm font-medium text-gray-500'>Género</label>
                    {isEditing ? (
                      <select
                        value={editedUser.gender || ''}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        className={`w-full mt-1 px-3 py-2 border rounded-lg ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value=''>Seleccionar</option>
                        <option value='male'>Masculino</option>
                        <option value='female'>Femenino</option>
                        <option value='other'>Otro</option>
                        <option value='prefer-not-to-say'>Prefiero no decir</option>
                      </select>
                    ) : (
                      <p className='text-sm'>{user.gender || 'No especificado'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <h3 className='font-semibold mb-3'>Contacto de Emergencia</h3>
                <div className='space-y-3'>
                  <div>
                    <label className='text-sm font-medium text-gray-500'>Nombre</label>
                    {isEditing ? (
                      <input
                        type='text'
                        value={editedUser.emergencyContact?.name || ''}
                        onChange={(e) =>
                          handleInputChange('emergencyContact', {
                            ...editedUser.emergencyContact,
                            name: e.target.value,
                          })
                        }
                        className={`w-full mt-1 px-3 py-2 border rounded-lg ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder='Nombre del contacto'
                      />
                    ) : (
                      <p className='text-sm'>{user.emergencyContact?.name || 'No especificado'}</p>
                    )}
                  </div>

                  <div>
                    <label className='text-sm font-medium text-gray-500'>Teléfono</label>
                    {isEditing ? (
                      <input
                        type='tel'
                        value={editedUser.emergencyContact?.phone || ''}
                        onChange={(e) =>
                          handleInputChange('emergencyContact', {
                            ...editedUser.emergencyContact,
                            phone: e.target.value,
                          })
                        }
                        className={`w-full mt-1 px-3 py-2 border rounded-lg ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder='Teléfono del contacto'
                      />
                    ) : (
                      <p className='text-sm'>{user.emergencyContact?.phone || 'No especificado'}</p>
                    )}
                  </div>

                  <div>
                    <label className='text-sm font-medium text-gray-500'>Relación</label>
                    {isEditing ? (
                      <input
                        type='text'
                        value={editedUser.emergencyContact?.relationship || ''}
                        onChange={(e) =>
                          handleInputChange('emergencyContact', {
                            ...editedUser.emergencyContact,
                            relationship: e.target.value,
                          })
                        }
                        className={`w-full mt-1 px-3 py-2 border rounded-lg ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder='Relación (ej: Padre, Madre, Hermano/a)'
                      />
                    ) : (
                      <p className='text-sm'>{user.emergencyContact?.relationship || 'No especificado'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && settings && (
          <div className='space-y-6'>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h3 className='font-semibold mb-4'>Preferencias Generales</h3>
              <div className='space-y-4'>
                <div>
                  <label className='text-sm font-medium text-gray-500'>Tema</label>
                  <select
                    value={settings.preferences.theme}
                    onChange={(e) => handleSettingsChange('preferences.theme', e.target.value)}
                    className={`w-full mt-1 px-3 py-2 border rounded-lg ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value='light'>Claro</option>
                    <option value='dark'>Oscuro</option>
                    <option value='auto'>Automático</option>
                  </select>
                </div>

                <div>
                  <label className='text-sm font-medium text-gray-500'>Idioma</label>
                  <select
                    value={settings.preferences.language}
                    onChange={(e) => handleSettingsChange('preferences.language', e.target.value)}
                    className={`w-full mt-1 px-3 py-2 border rounded-lg ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value='es'>Español</option>
                    <option value='en'>English</option>
                    <option value='pt'>Português</option>
                  </select>
                </div>

                <div>
                  <label className='text-sm font-medium text-gray-500'>Zona Horaria</label>
                  <select
                    value={settings.preferences.timezone}
                    onChange={(e) => handleSettingsChange('preferences.timezone', e.target.value)}
                    className={`w-full mt-1 px-3 py-2 border rounded-lg ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value='America/Mexico_City'>México (GMT-6)</option>
                    <option value='America/New_York'>Nueva York (GMT-5)</option>
                    <option value='America/Los_Angeles'>Los Ángeles (GMT-8)</option>
                    <option value='Europe/Madrid'>Madrid (GMT+1)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Tab */}
        {activeTab === 'privacy' && settings && (
          <div className='space-y-6'>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h3 className='font-semibold mb-4'>Configuración de Privacidad</h3>
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <label className='text-sm font-medium text-gray-500'>Compartir datos anónimos</label>
                    <p className='text-xs text-gray-400'>Ayuda a mejorar la aplicación compartiendo datos anónimos</p>
                  </div>
                  <label className='relative inline-flex items-center cursor-pointer'>
                    <input
                      type='checkbox'
                      checked={settings.privacy.shareData}
                      onChange={(e) => handleSettingsChange('privacy.shareData', e.target.checked)}
                      className='sr-only peer'
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className='flex items-center justify-between'>
                  <div>
                    <label className='text-sm font-medium text-gray-500'>Modo anónimo</label>
                    <p className='text-xs text-gray-400'>Oculta tu identidad en la aplicación</p>
                  </div>
                  <label className='relative inline-flex items-center cursor-pointer'>
                    <input
                      type='checkbox'
                      checked={settings.privacy.anonymousMode}
                      onChange={(e) => handleSettingsChange('privacy.anonymousMode', e.target.checked)}
                      className='sr-only peer'
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div>
                  <label className='text-sm font-medium text-gray-500'>Retención de datos (días)</label>
                  <select
                    value={settings.privacy.dataRetention}
                    onChange={(e) => handleSettingsChange('privacy.dataRetention', parseInt(e.target.value))}
                    className={`w-full mt-1 px-3 py-2 border rounded-lg ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value={30}>30 días</option>
                    <option value={90}>90 días</option>
                    <option value={365}>1 año</option>
                    <option value={-1}>Indefinidamente</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && settings && (
          <div className='space-y-6'>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h3 className='font-semibold mb-4'>Configuración de Notificaciones</h3>
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <label className='text-sm font-medium text-gray-500'>Notificaciones push</label>
                    <p className='text-xs text-gray-400'>Recibe notificaciones en tu dispositivo</p>
                  </div>
                  <label className='relative inline-flex items-center cursor-pointer'>
                    <input
                      type='checkbox'
                      checked={settings.pushEnabled}
                      onChange={(e) => handleSettingsChange('pushEnabled', e.target.checked)}
                      className='sr-only peer'
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className='flex items-center justify-between'>
                  <div>
                    <label className='text-sm font-medium text-gray-500'>Notificaciones por email</label>
                    <p className='text-xs text-gray-400'>Recibe notificaciones por correo electrónico</p>
                  </div>
                  <label className='relative inline-flex items-center cursor-pointer'>
                    <input
                      type='checkbox'
                      checked={settings.emailEnabled}
                      onChange={(e) => handleSettingsChange('emailEnabled', e.target.checked)}
                      className='sr-only peer'
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className='flex items-center justify-between'>
                  <div>
                    <label className='text-sm font-medium text-gray-500'>Recordatorios de citas</label>
                    <p className='text-xs text-gray-400'>Recibe recordatorios antes de tus citas</p>
                  </div>
                  <label className='relative inline-flex items-center cursor-pointer'>
                    <input
                      type='checkbox'
                      checked={settings.appointmentReminders}
                      onChange={(e) => handleSettingsChange('appointmentReminders', e.target.checked)}
                      className='sr-only peer'
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className='flex items-center justify-between'>
                  <div>
                    <label className='text-sm font-medium text-gray-500'>Recordatorios de estado de ánimo</label>
                    <p className='text-xs text-gray-400'>Recibe recordatorios para registrar tu estado de ánimo</p>
                  </div>
                  <label className='relative inline-flex items-center cursor-pointer'>
                    <input
                      type='checkbox'
                      checked={settings.moodCheckReminders}
                      onChange={(e) => handleSettingsChange('moodCheckReminders', e.target.checked)}
                      className='sr-only peer'
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className='flex items-center justify-between'>
                  <div>
                    <label className='text-sm font-medium text-gray-500'>Notificaciones de mensajes</label>
                    <p className='text-xs text-gray-400'>Recibe notificaciones cuando recibas mensajes</p>
                  </div>
                  <label className='relative inline-flex items-center cursor-pointer'>
                    <input
                      type='checkbox'
                      checked={settings.messageNotifications}
                      onChange={(e) => handleSettingsChange('messageNotifications', e.target.checked)}
                      className='sr-only peer'
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className='flex items-center justify-between'>
                  <div>
                    <label className='text-sm font-medium text-gray-500'>Reportes semanales</label>
                    <p className='text-xs text-gray-400'>Recibe un resumen semanal de tu progreso</p>
                  </div>
                  <label className='relative inline-flex items-center cursor-pointer'>
                    <input
                      type='checkbox'
                      checked={settings.weeklyReports}
                      onChange={(e) => handleSettingsChange('weeklyReports', e.target.checked)}
                      className='sr-only peer'
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && moodStats && (
          <div className='space-y-6'>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h3 className='font-semibold mb-4'>Resumen de Actividad</h3>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-blue-600'>{moodStats.totalEntries}</div>
                  <div className='text-sm text-gray-500'>Registros totales</div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-green-600'>{moodStats.averageMood.toFixed(1)}/5</div>
                  <div className='text-sm text-gray-500'>Estado de ánimo promedio</div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-purple-600'>
                    {moodStats.mostCommonEmotions[0]?.emotion || 'N/A'}
                  </div>
                  <div className='text-sm text-gray-500'>Emoción más común</div>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h3 className='font-semibold mb-4'>Actividades Más Comunes</h3>
              <div className='space-y-2'>
                {moodStats.mostCommonActivities.slice(0, 5).map((activity: any, index: number) => (
                  <div key={index} className='flex justify-between items-center'>
                    <span className='capitalize'>{activity.activity}</span>
                    <span className='text-sm text-gray-500'>{activity.count} veces</span>
                  </div>
                ))}
              </div>
            </div>

            <div className='flex justify-end space-x-3'>
              <button className='flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600'>
                <Download className='w-4 h-4' />
                <span>Exportar Datos</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
