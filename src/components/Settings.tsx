import { EmailAuthProvider, reauthenticateWithCredential, sendPasswordResetEmail, updatePassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { AlertCircle, Bell, Eye, Key, Mail, Moon, Palette, Shield, Sun, User, Volume2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { auth, db } from '../lib/firebase';

interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    reminders: boolean;
    weeklyReports: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'psychologists';
    dataSharing: boolean;
    analytics: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    language: 'es' | 'en';
    fontSize: 'small' | 'medium' | 'large';
  };
  reminders: {
    dailyMood: boolean;
    weeklyCheck: boolean;
    sessionReminders: boolean;
    time: string;
  };
  accessibility: {
    highContrast: boolean;
    reducedMotion: boolean;
    screenReader: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    passwordLastChanged: Date | null;
  };
}

const Settings = () => {
  const { userProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      email: true,
      push: true,
      reminders: true,
      weeklyReports: false,
    },
    privacy: {
      profileVisibility: 'psychologists',
      dataSharing: false,
      analytics: true,
    },
    appearance: {
      theme: 'auto',
      language: 'es',
      fontSize: 'medium',
    },
    reminders: {
      dailyMood: true,
      weeklyCheck: true,
      sessionReminders: true,
      time: '09:00',
    },
    accessibility: {
      highContrast: false,
      reducedMotion: false,
      screenReader: false,
    },
    security: {
      twoFactorEnabled: false,
      passwordLastChanged: null,
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [passwordResetSent, setPasswordResetSent] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    if (!userProfile?.uid) return;

    try {
      const settingsDoc = await getDoc(doc(db, 'userSettings', userProfile.uid));
      if (settingsDoc.exists()) {
        setSettings(settingsDoc.data() as UserSettings);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: UserSettings) => {
    if (!userProfile?.uid) return;

    setSaving(true);
    try {
      await setDoc(doc(db, 'userSettings', userProfile.uid), newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
    setSaving(false);
  };

  const updateSetting = (section: keyof UserSettings, key: string, value: any) => {
    const newSettings = {
      ...settings,
      [section]: {
        ...settings[section],
        [key]: value,
      },
    };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handlePasswordReset = async () => {
    if (!userProfile?.email) return;

    try {
      await sendPasswordResetEmail(auth, userProfile.email);
      setPasswordResetSent(true);
      setTimeout(() => setPasswordResetSent(false), 5000);
    } catch (error) {
      console.error('Error sending password reset email:', error);
    }
  };

  const handlePasswordChange = async () => {
    if (!auth.currentUser) return;

    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      // Re-authenticate user before changing password
      const credential = EmailAuthProvider.credential(userProfile?.email || '', currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Update password
      await updatePassword(auth.currentUser, newPassword);

      // Update settings
      const newSettings = {
        ...settings,
        security: {
          ...settings.security,
          passwordLastChanged: new Date(),
        },
      };
      await saveSettings(newSettings);

      setPasswordSuccess('Contraseña actualizada exitosamente');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => setPasswordSuccess(''), 5000);
    } catch (error: any) {
      console.error('Error changing password:', error);
      if (error.code === 'auth/wrong-password') {
        setPasswordError('La contraseña actual es incorrecta');
      } else if (error.code === 'auth/weak-password') {
        setPasswordError('La nueva contraseña es muy débil');
      } else {
        setPasswordError('Error al cambiar la contraseña. Inténtalo de nuevo.');
      }
    }
  };

  const toggleTwoFactor = async () => {
    const newSettings = {
      ...settings,
      security: {
        ...settings.security,
        twoFactorEnabled: !settings.security.twoFactorEnabled,
      },
    };
    await saveSettings(newSettings);
  };

  if (loading) {
    return (
      <div className='bg-white rounded-xl shadow-lg p-6'>
        <div className='animate-pulse'>
          <div className='h-6 bg-gray-200 rounded w-1/3 mb-6'></div>
          <div className='space-y-4'>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className='h-16 bg-gray-200 rounded'></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-xl shadow-lg p-6'>
      <h3 className='text-xl font-semibold text-gray-900 mb-6'>Configuraciones</h3>

      <div className='space-y-8'>
        {/* Notificaciones */}
        <div>
          <div className='flex items-center gap-3 mb-4'>
            <Bell className='w-5 h-5 text-primary-600' />
            <h4 className='text-lg font-medium text-gray-900'>Notificaciones</h4>
          </div>
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <div>
                <div className='font-medium text-gray-900'>Notificaciones por email</div>
                <div className='text-sm text-gray-500'>Recibe actualizaciones importantes por correo</div>
              </div>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  checked={settings.notifications.email}
                  onChange={(e) => updateSetting('notifications', 'email', e.target.checked)}
                  className='sr-only peer'
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className='flex items-center justify-between'>
              <div>
                <div className='font-medium text-gray-900'>Notificaciones push</div>
                <div className='text-sm text-gray-500'>Recibe notificaciones en tiempo real</div>
              </div>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  checked={settings.notifications.push}
                  onChange={(e) => updateSetting('notifications', 'push', e.target.checked)}
                  className='sr-only peer'
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className='flex items-center justify-between'>
              <div>
                <div className='font-medium text-gray-900'>Recordatorios diarios</div>
                <div className='text-sm text-gray-500'>Recuerda registrar tu estado de ánimo</div>
              </div>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  checked={settings.notifications.reminders}
                  onChange={(e) => updateSetting('notifications', 'reminders', e.target.checked)}
                  className='sr-only peer'
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Privacidad */}
        <div>
          <div className='flex items-center gap-3 mb-4'>
            <Shield className='w-5 h-5 text-primary-600' />
            <h4 className='text-lg font-medium text-gray-900'>Privacidad</h4>
          </div>
          <div className='space-y-3'>
            <div>
              <div className='font-medium text-gray-900 mb-2'>Visibilidad del perfil</div>
              <select
                value={settings.privacy.profileVisibility}
                onChange={(e) => updateSetting('privacy', 'profileVisibility', e.target.value)}
                className='w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
              >
                <option value='public'>Público</option>
                <option value='psychologists'>Solo psicólogos</option>
                <option value='private'>Privado</option>
              </select>
            </div>

            <div className='flex items-center justify-between'>
              <div>
                <div className='font-medium text-gray-900'>Compartir datos para investigación</div>
                <div className='text-sm text-gray-500'>Ayuda a mejorar la aplicación (datos anónimos)</div>
              </div>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  checked={settings.privacy.dataSharing}
                  onChange={(e) => updateSetting('privacy', 'dataSharing', e.target.checked)}
                  className='sr-only peer'
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Apariencia */}
        <div>
          <div className='flex items-center gap-3 mb-4'>
            <Palette className='w-5 h-5 text-primary-600' />
            <h4 className='text-lg font-medium text-gray-900'>Apariencia</h4>
          </div>
          <div className='space-y-3'>
            <div>
              <div className='font-medium text-gray-900 mb-2'>Tema</div>
              <div className='flex gap-2'>
                <button
                  onClick={() => updateSetting('appearance', 'theme', 'light')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                    settings.appearance.theme === 'light'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Sun className='w-4 h-4' />
                  Claro
                </button>
                <button
                  onClick={() => updateSetting('appearance', 'theme', 'dark')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                    settings.appearance.theme === 'dark'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Moon className='w-4 h-4' />
                  Oscuro
                </button>
                <button
                  onClick={() => updateSetting('appearance', 'theme', 'auto')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                    settings.appearance.theme === 'auto'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Eye className='w-4 h-4' />
                  Automático
                </button>
              </div>
            </div>

            <div>
              <div className='font-medium text-gray-900 mb-2'>Tamaño de fuente</div>
              <select
                value={settings.appearance.fontSize}
                onChange={(e) => updateSetting('appearance', 'fontSize', e.target.value)}
                className='w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
              >
                <option value='small'>Pequeño</option>
                <option value='medium'>Mediano</option>
                <option value='large'>Grande</option>
              </select>
            </div>
          </div>
        </div>

        {/* Recordatorios */}
        <div>
          <div className='flex items-center gap-3 mb-4'>
            <Volume2 className='w-5 h-5 text-primary-600' />
            <h4 className='text-lg font-medium text-gray-900'>Recordatorios</h4>
          </div>
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <div>
                <div className='font-medium text-gray-900'>Recordatorio diario de estado de ánimo</div>
                <div className='text-sm text-gray-500'>Recibe un recordatorio para registrar tu estado de ánimo</div>
              </div>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  checked={settings.reminders.dailyMood}
                  onChange={(e) => updateSetting('reminders', 'dailyMood', e.target.checked)}
                  className='sr-only peer'
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            {settings.reminders.dailyMood && (
              <div>
                <div className='font-medium text-gray-900 mb-2'>Hora del recordatorio</div>
                <input
                  type='time'
                  value={settings.reminders.time}
                  onChange={(e) => updateSetting('reminders', 'time', e.target.value)}
                  className='p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
                />
              </div>
            )}
          </div>
        </div>

        {/* Seguridad */}
        <div>
          <div className='flex items-center gap-3 mb-4'>
            <Shield className='w-5 h-5 text-primary-600' />
            <h4 className='text-lg font-medium text-gray-900'>Seguridad</h4>
          </div>
          <div className='space-y-4'>
            {/* Two-Factor Authentication */}
            <div className='flex items-center justify-between'>
              <div>
                <div className='font-medium text-gray-900'>Autenticación de dos factores</div>
                <div className='text-sm text-gray-500'>Añade una capa extra de seguridad a tu cuenta</div>
              </div>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  checked={settings.security.twoFactorEnabled}
                  onChange={toggleTwoFactor}
                  className='sr-only peer'
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            {/* Password Reset via Email */}
            <div className='border-t border-gray-200 pt-4'>
              <div className='flex items-center justify-between mb-3'>
                <div>
                  <div className='font-medium text-gray-900'>Restablecer contraseña por email</div>
                  <div className='text-sm text-gray-500'>Recibe un enlace para restablecer tu contraseña</div>
                </div>
                <button
                  onClick={handlePasswordReset}
                  className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                >
                  <Mail className='w-4 h-4' />
                  Enviar enlace
                </button>
              </div>
              {passwordResetSent && (
                <div className='bg-green-50 border border-green-200 rounded-lg p-3'>
                  <div className='flex items-center gap-2 text-green-700'>
                    <div className='w-4 h-4 bg-green-500 rounded-full flex items-center justify-center'>
                      <span className='text-white text-xs'>✓</span>
                    </div>
                    <span className='text-sm'>Enlace de restablecimiento enviado a tu email</span>
                  </div>
                </div>
              )}
            </div>

            {/* Change Password */}
            <div className='border-t border-gray-200 pt-4'>
              <div className='mb-3'>
                <div className='font-medium text-gray-900 mb-2'>Cambiar contraseña</div>
                <div className='text-sm text-gray-500'>Actualiza tu contraseña actual</div>
              </div>

              <div className='space-y-3'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Contraseña actual</label>
                  <input
                    type='password'
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className='w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
                    placeholder='Ingresa tu contraseña actual'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Nueva contraseña</label>
                  <input
                    type='password'
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className='w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
                    placeholder='Ingresa tu nueva contraseña'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Confirmar nueva contraseña</label>
                  <input
                    type='password'
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className='w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
                    placeholder='Confirma tu nueva contraseña'
                  />
                </div>

                <button
                  onClick={handlePasswordChange}
                  disabled={!currentPassword || !newPassword || !confirmPassword}
                  className='w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors'
                >
                  <Key className='w-4 h-4' />
                  Cambiar contraseña
                </button>

                {passwordError && (
                  <div className='bg-red-50 border border-red-200 rounded-lg p-3'>
                    <div className='flex items-center gap-2 text-red-700'>
                      <AlertCircle className='w-4 h-4' />
                      <span className='text-sm'>{passwordError}</span>
                    </div>
                  </div>
                )}

                {passwordSuccess && (
                  <div className='bg-green-50 border border-green-200 rounded-lg p-3'>
                    <div className='flex items-center gap-2 text-green-700'>
                      <div className='w-4 h-4 bg-green-500 rounded-full flex items-center justify-center'>
                        <span className='text-white text-xs'>✓</span>
                      </div>
                      <span className='text-sm'>{passwordSuccess}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Accesibilidad */}
        <div>
          <div className='flex items-center gap-3 mb-4'>
            <User className='w-5 h-5 text-primary-600' />
            <h4 className='text-lg font-medium text-gray-900'>Accesibilidad</h4>
          </div>
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <div>
                <div className='font-medium text-gray-900'>Alto contraste</div>
                <div className='text-sm text-gray-500'>Mejora la visibilidad del texto</div>
              </div>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  checked={settings.accessibility.highContrast}
                  onChange={(e) => updateSetting('accessibility', 'highContrast', e.target.checked)}
                  className='sr-only peer'
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className='flex items-center justify-between'>
              <div>
                <div className='font-medium text-gray-900'>Reducir animaciones</div>
                <div className='text-sm text-gray-500'>Reduce las animaciones para mejor accesibilidad</div>
              </div>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  checked={settings.accessibility.reducedMotion}
                  onChange={(e) => updateSetting('accessibility', 'reducedMotion', e.target.checked)}
                  className='sr-only peer'
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {saving && (
        <div className='mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
          <div className='flex items-center gap-2 text-blue-700'>
            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700'></div>
            Guardando configuraciones...
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
