import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { Bell, Clock, Eye, EyeOff, Globe, Info, Lock, Mail, Moon, Save, Shield, Sun, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { auth, db } from '../services/firebase';

type SettingsState = {
  notifications: boolean;
  emailUpdates: boolean;
  weeklyReports: boolean;
  language: string;
  timezone: string;
};

type EmailSettingsState = {
  weeklyReports: boolean;
  moodInsights: boolean;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const Settings: React.FC = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, setDarkMode } = useTheme();
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [settingsLoadError, setSettingsLoadError] = useState(false);
  const [loading, setLoading] = useState(false);

  const currentUser = auth.currentUser;
  const isGoogleUser = currentUser?.providerData?.some((p) => p.providerId === 'google.com') ?? false;

  // Estados para configuración
  const [settings, setSettings] = useState<SettingsState>({
    notifications: true,
    emailUpdates: true,
    weeklyReports: true,
    language: 'es',
    timezone: 'America/Bogota',
  });

  // Estados para cambiar contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Estados para notificaciones por Gmail
  const [emailSettings, setEmailSettings] = useState<EmailSettingsState>({
    weeklyReports: true,
    moodInsights: true,
  });

  useEffect(() => {
    let isCurrent = true;

    const loadSettings = async () => {
      setIsLoaded(false);
      setSettingsLoadError(false);

      if (!user) {
        setSettingsLoadError(true);
        setIsLoaded(true);
        return;
      }

      try {
        const userSnapshot = await getDoc(doc(db, 'users', user.uid));
        if (!isCurrent) {
          return;
        }
        if (!userSnapshot.exists()) {
          throw new Error('No se encontró el perfil para cargar la configuración.');
        }

        const savedSettings = userSnapshot.data().settings;
        if (isRecord(savedSettings)) {
          setSettings((current) => ({
            ...current,
            notifications: typeof savedSettings.notifications === 'boolean'
              ? savedSettings.notifications
              : current.notifications,
            emailUpdates: typeof savedSettings.emailUpdates === 'boolean'
              ? savedSettings.emailUpdates
              : current.emailUpdates,
            weeklyReports: typeof savedSettings.weeklyReports === 'boolean'
              ? savedSettings.weeklyReports
              : current.weeklyReports,
            language: typeof savedSettings.language === 'string'
              ? savedSettings.language
              : current.language,
            timezone: typeof savedSettings.timezone === 'string'
              ? savedSettings.timezone
              : current.timezone,
          }));

          const savedEmailSettings = savedSettings.emailSettings;
          if (isRecord(savedEmailSettings)) {
            setEmailSettings((current) => ({
              weeklyReports: typeof savedEmailSettings.weeklyReports === 'boolean'
                ? savedEmailSettings.weeklyReports
                : current.weeklyReports,
              moodInsights: typeof savedEmailSettings.moodInsights === 'boolean'
                ? savedEmailSettings.moodInsights
                : current.moodInsights,
            }));
          }
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        if (isCurrent) {
          setSettingsLoadError(true);
          toast.error('No se pudo cargar tu configuración. Inténtalo de nuevo.');
        }
      } finally {
        if (isCurrent) {
          setIsLoaded(true);
        }
      }
    };

    void loadSettings();
    return () => {
      isCurrent = false;
    };
  }, [user]);

  const handleSettingsChange = <K extends keyof SettingsState,>(key: K, value: SettingsState[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleEmailSettingsChange = (key: keyof EmailSettingsState, value: boolean) => {
    setEmailSettings((prev) => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión para guardar tu configuración.');
      return;
    }

    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        settings: {
          ...settings,
          emailSettings,
        },
        updatedAt: serverTimestamp(),
      });
      toast.success('Configuración guardada exitosamente');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Error al guardar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Las contraseñas nuevas no coinciden');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (!currentUser || !currentUser.email) {
      toast.error('Usuario no autenticado');
      return;
    }

    setLoading(true);
    try {
      if (isGoogleUser) {
        toast.error(
          'No puedes cambiar la contraseña porque te registraste con Google. Tu contraseña se gestiona a través de tu cuenta de Google.'
        );
        return;
      }

      // Reautenticar usuario con email/contraseña
      const credential = EmailAuthProvider.credential(currentUser.email, passwordData.currentPassword);
      await reauthenticateWithCredential(currentUser, credential);

      // Cambiar contraseña
      await updatePassword(currentUser, passwordData.newPassword);

      toast.success('Contraseña cambiada exitosamente');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      console.error('Error changing password:', error);
      if (error.code === 'auth/wrong-password') {
        toast.error('La contraseña actual es incorrecta');
      } else if (error.code === 'auth/weak-password') {
        toast.error('La nueva contraseña es muy débil');
      } else if (error.code === 'auth/requires-recent-login') {
        toast.error('Por seguridad, necesitas iniciar sesión nuevamente antes de cambiar la contraseña');
      } else {
        toast.error('Error al cambiar la contraseña');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (!isLoaded) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500'></div>
      </div>
    );
  }

  if (settingsLoadError) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Header title='Configuración' subtitle='Gestiona tu perfil y preferencias' backTo='/dashboard' />
        <main className='mx-auto max-w-xl px-4 py-16 text-center'>
          <p role='alert' className={`mb-5 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            No pudimos cargar tus preferencias. No se guardarán valores predeterminados para evitar reemplazar
            tu configuración existente.
          </p>
          <button
            type='button'
            onClick={() => window.location.reload()}
            className='rounded-lg bg-purple-600 px-5 py-3 font-medium text-white hover:bg-purple-700'
          >
            Reintentar
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Header title='Configuración' subtitle='Gestiona tu perfil y preferencias' backTo='/dashboard' />

      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='mb-8'>
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Configuración</h1>
          <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Personaliza tu experiencia en Mood Log App
          </p>
        </div>

        <div className='space-y-8'>
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border p-6`}>
            <div className='flex items-center justify-between gap-4'>
              <div className='flex items-center space-x-3'>
                <div className={`w-10 h-10 ${isDarkMode ? 'bg-indigo-900' : 'bg-indigo-100'} rounded-lg flex items-center justify-center`}>
                  {isDarkMode
                    ? <Moon className='w-5 h-5 text-indigo-300' />
                    : <Sun className='w-5 h-5 text-indigo-600' />}
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Apariencia</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Elige el modo claro u oscuro para toda la aplicación
                  </p>
                </div>
              </div>
              <button
                type='button'
                role='switch'
                aria-checked={isDarkMode}
                aria-label='Activar modo oscuro'
                onClick={() => setDarkMode(!isDarkMode)}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                  isDarkMode ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    isDarkMode ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Notificaciones */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border p-6`}>
            <div className='flex items-center space-x-3 mb-6'>
              <div
                className={`w-10 h-10 ${
                  isDarkMode ? 'bg-blue-900' : 'bg-blue-100'
                } rounded-lg flex items-center justify-center`}
              >
                <Bell className={`w-5 h-5 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`} />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Notificaciones
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Configura cómo recibir notificaciones
                </p>
              </div>
            </div>

            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Notificaciones Push</p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Recibe avisos relacionados con tu actividad en la aplicación
                  </p>
                </div>
                <label className='relative inline-flex items-center cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={settings.notifications}
                    onChange={(e) => handleSettingsChange('notifications', e.target.checked)}
                    className='sr-only peer'
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className='flex items-center justify-between'>
                <div>
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Actualizaciones por Email
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Recibe resúmenes semanales por correo
                  </p>
                </div>
                <label className='relative inline-flex items-center cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={settings.emailUpdates}
                    onChange={(e) => handleSettingsChange('emailUpdates', e.target.checked)}
                    className='sr-only peer'
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Configuración de Email */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border p-6`}>
            <div className='flex items-center space-x-3 mb-6'>
              <div
                className={`w-10 h-10 ${
                  isDarkMode ? 'bg-green-900' : 'bg-green-100'
                } rounded-lg flex items-center justify-center`}
              >
                <Mail className={`w-5 h-5 ${isDarkMode ? 'text-green-300' : 'text-green-600'}`} />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Preferencias de correo
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Configura tus preferencias de correo
                </p>
              </div>
            </div>

            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Reportes Semanales</p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Resumen de tu bienestar emocional semanal
                  </p>
                </div>
                <label className='relative inline-flex items-center cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={emailSettings.weeklyReports}
                    onChange={(e) => handleEmailSettingsChange('weeklyReports', e.target.checked)}
                    className='sr-only peer'
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className='flex items-center justify-between'>
                <div>
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Insights de Estado de Ánimo
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Análisis y recomendaciones personalizadas
                  </p>
                </div>
                <label className='relative inline-flex items-center cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={emailSettings.moodInsights}
                    onChange={(e) => handleEmailSettingsChange('moodInsights', e.target.checked)}
                    className='sr-only peer'
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

            </div>
          </div>

          {/* Información Personal */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border p-6`}>
            <div className='flex items-center space-x-3 mb-6'>
              <div
                className={`w-10 h-10 ${
                  isDarkMode ? 'bg-purple-900' : 'bg-purple-100'
                } rounded-lg flex items-center justify-center`}
              >
                <User className={`w-5 h-5 ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`} />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Información Personal
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Actualiza tu información de perfil
                </p>
              </div>
            </div>

            <div className='flex items-center justify-between'>
              <div>
                <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Editar Perfil Completo</p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Modifica tu nombre, información de contacto, biografía y más
                </p>
              </div>
              <button
                onClick={() => navigate('/edit-profile')}
                className='px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2'
              >
                <User className='w-4 h-4' />
                <span>Editar Perfil</span>
              </button>
            </div>
          </div>

          {/* Cambiar Contraseña */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border p-6`}>
            <div className='flex items-center space-x-3 mb-6'>
              <div
                className={`w-10 h-10 ${
                  isDarkMode ? 'bg-red-900' : 'bg-red-100'
                } rounded-lg flex items-center justify-center`}
              >
                <Lock className={`w-5 h-5 ${isDarkMode ? 'text-red-300' : 'text-red-600'}`} />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Cambiar Contraseña
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Actualiza tu contraseña de acceso
                </p>
              </div>
            </div>

            {/* Información para usuarios de Google */}
            {isGoogleUser && (
              <div
                className={`p-4 rounded-lg border-l-4 border-blue-500 ${
                  isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'
                } mb-6`}
              >
                <div className='flex items-start space-x-3'>
                  <Info className='w-5 h-5 text-blue-500 mt-0.5' />
                  <div>
                    <h4 className={`font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                      Usuario de Google
                    </h4>
                    <p className={`text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-700'} mt-1`}>
                      Te registraste con Google, por lo que tu contraseña se gestiona a través de tu cuenta de Google.
                      Para cambiar tu contraseña, ve a{' '}
                      <a
                        href='https://myaccount.google.com/security'
                        target='_blank'
                        rel='noopener noreferrer'
                        className='underline hover:no-underline'
                      >
                        Configuración de seguridad de Google
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className='space-y-4'>
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Contraseña Actual
                </label>
                <div className='relative'>
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                    disabled={isGoogleUser}
                    className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    } ${
                      isGoogleUser
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                  />
                  <button
                    type='button'
                    onClick={() => setShowPasswords((prev) => ({ ...prev, current: !prev.current }))}
                    disabled={isGoogleUser}
                    className='absolute right-3 top-1/2 transform -translate-y-1/2'
                  >
                    {showPasswords.current ? (
                      <EyeOff className='w-4 h-4 text-gray-400' />
                    ) : (
                      <Eye className='w-4 h-4 text-gray-400' />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Nueva Contraseña
                </label>
                <div className='relative'>
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                    disabled={isGoogleUser}
                    className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    } ${
                      isGoogleUser
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                  />
                  <button
                    type='button'
                    onClick={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))}
                    disabled={isGoogleUser}
                    className='absolute right-3 top-1/2 transform -translate-y-1/2'
                  >
                    {showPasswords.new ? (
                      <EyeOff className='w-4 h-4 text-gray-400' />
                    ) : (
                      <Eye className='w-4 h-4 text-gray-400' />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Confirmar Nueva Contraseña
                </label>
                <div className='relative'>
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    disabled={isGoogleUser}
                    className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    } ${
                      isGoogleUser
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                  />
                  <button
                    type='button'
                    onClick={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
                    disabled={isGoogleUser}
                    className='absolute right-3 top-1/2 transform -translate-y-1/2'
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className='w-4 h-4 text-gray-400' />
                    ) : (
                      <Eye className='w-4 h-4 text-gray-400' />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className='mt-6'>
              <button
                onClick={changePassword}
                disabled={
                  loading ||
                  !passwordData.currentPassword ||
                  !passwordData.newPassword ||
                  !passwordData.confirmPassword ||
                  isGoogleUser
                }
                className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2'
              >
                <Lock className='w-4 h-4' />
                <span>Cambiar Contraseña</span>
              </button>
            </div>
          </div>

          {/* Información del Sistema */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border p-6`}>
            <div className='flex items-center space-x-3 mb-6'>
              <div
                className={`w-10 h-10 ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                } rounded-lg flex items-center justify-center`}
              >
                <Info className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Información del Sistema
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Detalles de tu cuenta y configuración
                </p>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='flex items-center space-x-3'>
                <Globe className='w-5 h-5 text-gray-400' />
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Idioma</p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Español (Colombia)</p>
                </div>
              </div>

              <div className='flex items-center space-x-3'>
                <Shield className='w-5 h-5 text-gray-400' />
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Rol</p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Usuario
                  </p>
                </div>
              </div>

              <div className='flex items-center space-x-3'>
                <Clock className='w-5 h-5 text-gray-400' />
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Zona Horaria</p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>América/Bogotá</p>
                </div>
              </div>

              <div className='flex items-center space-x-3'>
                <Info className='w-5 h-5 text-gray-400' />
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Versión</p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Mood Log v1.0</p>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className='flex justify-between items-center'>
            <button
              onClick={saveSettings}
              disabled={loading}
              className='px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center space-x-2'
            >
              <Save className='w-5 h-5' />
              <span>Guardar Configuración</span>
            </button>

            <button
              onClick={handleLogout}
              className='px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2'
            >
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
