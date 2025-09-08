import { ArrowLeft, Bell, Calendar, Download, Mail, MapPin, Palette, Phone, Save, Shield, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { useAuth } from '../contexts/AuthContext-debug';
import { getUserSettings, saveUserSettings } from '../services/firestore';

const Settings: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      reminders: true,
      weeklyReports: true,
    },
    privacy: {
      shareData: false,
      anonymousMode: false,
      dataRetention: 365,
    },
    preferences: {
      theme: 'light' as 'light' | 'dark' | 'auto',
      language: 'es',
      timezone: 'America/Mexico_City',
    },
  });
  const [profile, setProfile] = useState({
    displayName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    location: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      const userSettings = await getUserSettings(user.uid);
      if (userSettings) {
        setSettings(userSettings);
      }

      setProfile({
        displayName: user.displayName || '',
        email: user.email || '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        location: '',
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleSaveSettings = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await saveUserSettings(user.uid, settings);
      alert('Configuraciones guardadas exitosamente');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error al guardar las configuraciones');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Simular exportación de datos
      const exportData = {
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
        },
        profile: profile,
        settings: settings,
        exportDate: new Date().toISOString(),
        version: '1.0.0',
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `mood-log-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert('Datos exportados exitosamente');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error al exportar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      alert('Por favor completa todos los campos');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Las contraseñas nuevas no coinciden');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setLoading(true);

      // Simular cambio de contraseña
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      alert('Contraseña cambiada exitosamente');
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmText = 'ELIMINAR';
    const userInput = prompt(
      `⚠️ ADVERTENCIA: Esta acción es PERMANENTE e IRREVERSIBLE.\n\n` +
        `Se eliminarán TODOS tus datos:\n` +
        `• Perfil y configuraciones\n` +
        `• Historial de estados de ánimo\n` +
        `• Conversaciones con psicólogos\n` +
        `• Estadísticas y análisis\n\n` +
        `Escribe "${confirmText}" para confirmar:`
    );

    if (userInput === confirmText) {
      try {
        setLoading(true);

        // Simular eliminación de cuenta
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Cerrar sesión y redirigir
        await logout();
        alert('Cuenta eliminada exitosamente');
        window.location.href = '/';
      } catch (error) {
        console.error('Error deleting account:', error);
        alert('Error al eliminar la cuenta');
      } finally {
        setLoading(false);
      }
    } else if (userInput !== null) {
      alert('Texto de confirmación incorrecto. La cuenta no fue eliminada.');
    }
  };

  const tabs = [
    { id: 'profile', name: 'Perfil', icon: User },
    { id: 'notifications', name: 'Notificaciones', icon: Bell },
    { id: 'privacy', name: 'Privacidad', icon: Shield },
    { id: 'appearance', name: 'Apariencia', icon: Palette },
    { id: 'data', name: 'Datos', icon: Download },
  ];

  return (
    <>
      <SEO
        title='Configuraciones - Mood Log App'
        description='Personaliza tu experiencia y gestiona tu privacidad'
        keywords='configuraciones, privacidad, perfil, notificaciones'
      />

      <div className='min-h-screen bg-gray-50'>
        {/* Header */}
        <div className='bg-white shadow-sm border-b border-gray-200'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='flex justify-between items-center h-16'>
              <div className='flex items-center space-x-4'>
                <Link
                  to='/dashboard'
                  className='inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors'
                >
                  <ArrowLeft className='w-5 h-5 mr-2' />
                  Volver al Dashboard
                </Link>
                <div>
                  <h1 className='text-xl font-bold text-gray-900'>Configuraciones</h1>
                  <p className='text-sm text-gray-500'>Personaliza tu experiencia</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
            {/* Sidebar */}
            <div className='lg:col-span-1'>
              <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>Configuraciones</h3>
                <nav className='space-y-2'>
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          activeTab === tab.id ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className='w-5 h-5' />
                        <span>{tab.name}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Contenido principal */}
            <div className='lg:col-span-3'>
              <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6'>
                {/* Perfil */}
                {activeTab === 'profile' && (
                  <div className='space-y-6'>
                    <h2 className='text-2xl font-bold text-gray-900'>Información del Perfil</h2>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>Nombre completo</label>
                        <input
                          type='text'
                          value={profile.displayName}
                          onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
                        />
                      </div>

                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>Email</label>
                        <div className='relative'>
                          <Mail className='w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                          <input
                            type='email'
                            value={profile.email}
                            disabled
                            className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500'
                          />
                        </div>
                      </div>

                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>Teléfono</label>
                        <div className='relative'>
                          <Phone className='w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                          <input
                            type='tel'
                            value={profile.phone}
                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                            className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
                          />
                        </div>
                      </div>

                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>Fecha de nacimiento</label>
                        <div className='relative'>
                          <Calendar className='w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                          <input
                            type='date'
                            value={profile.dateOfBirth}
                            onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                            className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
                          />
                        </div>
                      </div>

                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>Género</label>
                        <select
                          value={profile.gender}
                          onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
                        >
                          <option value=''>Seleccionar</option>
                          <option value='male'>Masculino</option>
                          <option value='female'>Femenino</option>
                          <option value='other'>Otro</option>
                          <option value='prefer-not-to-say'>Prefiero no decir</option>
                        </select>
                      </div>

                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>Ubicación</label>
                        <div className='relative'>
                          <MapPin className='w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                          <input
                            type='text'
                            value={profile.location}
                            onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                            className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
                          />
                        </div>
                      </div>
                    </div>

                    {/* Cambio de contraseña */}
                    <div className='mt-8 pt-6 border-t border-gray-200'>
                      <h3 className='text-lg font-semibold text-gray-900 mb-4'>Cambiar Contraseña</h3>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>Contraseña actual</label>
                          <input
                            type='password'
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
                            placeholder='••••••••'
                          />
                        </div>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>Nueva contraseña</label>
                          <input
                            type='password'
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
                            placeholder='••••••••'
                          />
                        </div>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Confirmar nueva contraseña
                          </label>
                          <input
                            type='password'
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
                            placeholder='••••••••'
                          />
                        </div>
                        <div className='flex items-end'>
                          <button
                            onClick={handleChangePassword}
                            disabled={loading}
                            className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                          >
                            Cambiar Contraseña
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notificaciones */}
                {activeTab === 'notifications' && (
                  <div className='space-y-6'>
                    <h2 className='text-2xl font-bold text-gray-900'>Notificaciones</h2>

                    <div className='space-y-4'>
                      <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
                        <div>
                          <h3 className='font-medium text-gray-900'>Notificaciones por email</h3>
                          <p className='text-sm text-gray-600'>Recibe recordatorios y reportes por email</p>
                        </div>
                        <label className='relative inline-flex items-center cursor-pointer'>
                          <input
                            type='checkbox'
                            checked={settings.notifications.email}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                notifications: { ...settings.notifications, email: e.target.checked },
                              })
                            }
                            className='sr-only peer'
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>

                      <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
                        <div>
                          <h3 className='font-medium text-gray-900'>Notificaciones push</h3>
                          <p className='text-sm text-gray-600'>Recibe notificaciones en tu dispositivo</p>
                        </div>
                        <label className='relative inline-flex items-center cursor-pointer'>
                          <input
                            type='checkbox'
                            checked={settings.notifications.push}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                notifications: { ...settings.notifications, push: e.target.checked },
                              })
                            }
                            className='sr-only peer'
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>

                      <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
                        <div>
                          <h3 className='font-medium text-gray-900'>Recordatorios diarios</h3>
                          <p className='text-sm text-gray-600'>Recibe recordatorios para registrar tu mood</p>
                        </div>
                        <label className='relative inline-flex items-center cursor-pointer'>
                          <input
                            type='checkbox'
                            checked={settings.notifications.reminders}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                notifications: { ...settings.notifications, reminders: e.target.checked },
                              })
                            }
                            className='sr-only peer'
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>

                      <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
                        <div>
                          <h3 className='font-medium text-gray-900'>Reportes semanales</h3>
                          <p className='text-sm text-gray-600'>Recibe un resumen semanal de tu progreso</p>
                        </div>
                        <label className='relative inline-flex items-center cursor-pointer'>
                          <input
                            type='checkbox'
                            checked={settings.notifications.weeklyReports}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                notifications: { ...settings.notifications, weeklyReports: e.target.checked },
                              })
                            }
                            className='sr-only peer'
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Privacidad */}
                {activeTab === 'privacy' && (
                  <div className='space-y-6'>
                    <h2 className='text-2xl font-bold text-gray-900'>Privacidad y Seguridad</h2>

                    <div className='space-y-4'>
                      <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
                        <div>
                          <h3 className='font-medium text-gray-900'>Compartir datos anónimos</h3>
                          <p className='text-sm text-gray-600'>Permite el uso de datos anónimos para mejorar la app</p>
                        </div>
                        <label className='relative inline-flex items-center cursor-pointer'>
                          <input
                            type='checkbox'
                            checked={settings.privacy.shareData}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                privacy: { ...settings.privacy, shareData: e.target.checked },
                              })
                            }
                            className='sr-only peer'
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>

                      <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
                        <div>
                          <h3 className='font-medium text-gray-900'>Modo anónimo</h3>
                          <p className='text-sm text-gray-600'>Oculta tu identidad en las interacciones</p>
                        </div>
                        <label className='relative inline-flex items-center cursor-pointer'>
                          <input
                            type='checkbox'
                            checked={settings.privacy.anonymousMode}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                privacy: { ...settings.privacy, anonymousMode: e.target.checked },
                              })
                            }
                            className='sr-only peer'
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>

                      <div className='p-4 bg-gray-50 rounded-lg'>
                        <h3 className='font-medium text-gray-900 mb-2'>Retención de datos</h3>
                        <p className='text-sm text-gray-600 mb-3'>¿Cuánto tiempo mantener tus datos?</p>
                        <select
                          value={settings.privacy.dataRetention}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              privacy: { ...settings.privacy, dataRetention: parseInt(e.target.value) },
                            })
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
                        >
                          <option value={30}>30 días</option>
                          <option value={90}>90 días</option>
                          <option value={365}>1 año</option>
                          <option value={-1}>Indefinidamente</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Apariencia */}
                {activeTab === 'appearance' && (
                  <div className='space-y-6'>
                    <h2 className='text-2xl font-bold text-gray-900'>Apariencia</h2>

                    <div className='space-y-4'>
                      <div className='p-4 bg-gray-50 rounded-lg'>
                        <h3 className='font-medium text-gray-900 mb-2'>Tema</h3>
                        <div className='grid grid-cols-3 gap-3'>
                          {[
                            { value: 'light', label: 'Claro', icon: '☀️' },
                            { value: 'dark', label: 'Oscuro', icon: '🌙' },
                            { value: 'auto', label: 'Automático', icon: '🔄' },
                          ].map((theme) => (
                            <button
                              key={theme.value}
                              onClick={() =>
                                setSettings({
                                  ...settings,
                                  preferences: { ...settings.preferences, theme: theme.value as any },
                                })
                              }
                              className={`p-3 rounded-lg border-2 transition-colors ${
                                settings.preferences.theme === theme.value
                                  ? 'border-purple-500 bg-purple-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className='text-2xl mb-1'>{theme.icon}</div>
                              <div className='text-sm font-medium'>{theme.label}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className='p-4 bg-gray-50 rounded-lg'>
                        <h3 className='font-medium text-gray-900 mb-2'>Idioma</h3>
                        <select
                          value={settings.preferences.language}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              preferences: { ...settings.preferences, language: e.target.value },
                            })
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
                        >
                          <option value='es'>Español</option>
                          <option value='en'>English</option>
                          <option value='pt'>Português</option>
                        </select>
                      </div>

                      <div className='p-4 bg-gray-50 rounded-lg'>
                        <h3 className='font-medium text-gray-900 mb-2'>Zona horaria</h3>
                        <select
                          value={settings.preferences.timezone}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              preferences: { ...settings.preferences, timezone: e.target.value },
                            })
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
                        >
                          <option value='America/Mexico_City'>México (GMT-6)</option>
                          <option value='America/New_York'>Nueva York (GMT-5)</option>
                          <option value='Europe/Madrid'>Madrid (GMT+1)</option>
                          <option value='America/Los_Angeles'>Los Ángeles (GMT-8)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Datos */}
                {activeTab === 'data' && (
                  <div className='space-y-6'>
                    <h2 className='text-2xl font-bold text-gray-900'>Gestión de Datos</h2>

                    <div className='space-y-4'>
                      <div className='p-4 bg-gray-50 rounded-lg'>
                        <h3 className='font-medium text-gray-900 mb-2'>Exportar datos</h3>
                        <p className='text-sm text-gray-600 mb-3'>
                          Descarga una copia de todos tus datos en formato JSON
                        </p>
                        <button
                          onClick={handleExportData}
                          className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'
                        >
                          Exportar Datos
                        </button>
                      </div>

                      <div className='p-4 bg-red-50 rounded-lg border border-red-200'>
                        <h3 className='font-medium text-red-900 mb-2'>Zona de peligro</h3>
                        <p className='text-sm text-red-700 mb-3'>
                          Eliminar tu cuenta es permanente. Todos tus datos serán eliminados.
                        </p>
                        <button
                          onClick={handleDeleteAccount}
                          className='bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors'
                        >
                          Eliminar Cuenta
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Botón de guardar */}
                <div className='mt-8 pt-6 border-t border-gray-200'>
                  <button
                    onClick={handleSaveSettings}
                    disabled={loading}
                    className='bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2'
                  >
                    <Save className='w-5 h-5' />
                    <span>{loading ? 'Guardando...' : 'Guardar Cambios'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
