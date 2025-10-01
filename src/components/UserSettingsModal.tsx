import { Bell, Clock, Download, Palette, RotateCcw, Shield, Upload, User } from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserSettings } from '../hooks/useUserSettings';
import Modal from './ui/Modal';

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

const UserSettingsModal: React.FC<UserSettingsModalProps> = ({ isOpen, onClose, isDarkMode }) => {
  const { user } = useAuth();
  const {
    settings,
    loading,
    error,
    updateNotificationSettings,
    updatePrivacySettings,
    updateAppSettings,
    updateMoodLoggingSettings,
    updatePsychologistSettings,
    resetToDefaults,
    exportSettings,
    importSettings,
  } = useUserSettings(user?.uid || '');

  const [activeTab, setActiveTab] = useState<'notifications' | 'privacy' | 'app' | 'mood' | 'psychologist' | 'data'>(
    'notifications'
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async (updateFunction: () => Promise<void>) => {
    try {
      setSaving(true);
      await updateFunction();
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    try {
      const settingsData = await exportSettings();
      const blob = new Blob([JSON.stringify(settingsData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mood-log-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting settings:', err);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const settingsData = JSON.parse(e.target?.result as string);
          await importSettings(settingsData);
        } catch (err) {
          console.error('Error importing settings:', err);
        }
      };
      reader.readAsText(file);
    }
  };

  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title='⚙️ Configuración' isDarkMode={isDarkMode} size='lg'>
        <div className='text-center py-8'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto'></div>
          <p className='text-gray-600 mt-2'>Cargando configuración...</p>
        </div>
      </Modal>
    );
  }

  if (!settings) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title='⚙️ Configuración' isDarkMode={isDarkMode} size='lg'>
        <div className='text-center py-8'>
          <p className='text-red-600'>Error al cargar configuración</p>
        </div>
      </Modal>
    );
  }

  const tabs = [
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'privacy', label: 'Privacidad', icon: Shield },
    { id: 'app', label: 'Aplicación', icon: Palette },
    { id: 'mood', label: 'Mood Logging', icon: Clock },
    ...(user?.role === 'psychologist' ? [{ id: 'psychologist', label: 'Psicólogo', icon: User }] : []),
    { id: 'data', label: 'Datos', icon: Download },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='⚙️ Configuración' isDarkMode={isDarkMode} size='xl'>
      <div className='space-y-6'>
        {/* Error Message */}
        {error && (
          <div className='p-4 bg-red-50 border border-red-200 rounded-lg'>
            <p className='text-red-700 text-sm'>{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className='flex space-x-1 bg-gray-100 rounded-lg p-1'>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className='w-4 h-4' />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className='min-h-[400px]'>
          {/* Notificaciones */}
          {activeTab === 'notifications' && (
            <div className='space-y-6'>
              <h3 className='text-lg font-semibold'>🔔 Configuración de Notificaciones</h3>

              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <label className='font-medium'>Notificaciones por Email</label>
                    <p className='text-sm text-gray-600'>Recibir notificaciones importantes por email</p>
                  </div>
                  <input
                    type='checkbox'
                    checked={settings.notifications.email}
                    onChange={(e) => handleSave(() => updateNotificationSettings({ email: e.target.checked }))}
                    className='w-5 h-5 text-purple-600 rounded focus:ring-purple-500'
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div>
                    <label className='font-medium'>Notificaciones Push</label>
                    <p className='text-sm text-gray-600'>Recibir notificaciones en el navegador</p>
                  </div>
                  <input
                    type='checkbox'
                    checked={settings.notifications.push}
                    onChange={(e) => handleSave(() => updateNotificationSettings({ push: e.target.checked }))}
                    className='w-5 h-5 text-purple-600 rounded focus:ring-purple-500'
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div>
                    <label className='font-medium'>Recordatorios de Mood</label>
                    <p className='text-sm text-gray-600'>Recordatorios para registrar tu estado de ánimo</p>
                  </div>
                  <input
                    type='checkbox'
                    checked={settings.notifications.moodReminders}
                    onChange={(e) => handleSave(() => updateNotificationSettings({ moodReminders: e.target.checked }))}
                    className='w-5 h-5 text-purple-600 rounded focus:ring-purple-500'
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div>
                    <label className='font-medium'>Alertas de Crisis</label>
                    <p className='text-sm text-gray-600'>Notificaciones cuando se detecten señales de crisis</p>
                  </div>
                  <input
                    type='checkbox'
                    checked={settings.notifications.crisisAlerts}
                    onChange={(e) => handleSave(() => updateNotificationSettings({ crisisAlerts: e.target.checked }))}
                    className='w-5 h-5 text-purple-600 rounded focus:ring-purple-500'
                  />
                </div>
              </div>

              {/* Horas de silencio */}
              <div className='border-t pt-4'>
                <h4 className='font-medium mb-3'>Horas de Silencio</h4>
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <label className='font-medium'>Activar horas de silencio</label>
                    <input
                      type='checkbox'
                      checked={settings.notifications.quietHours.enabled}
                      onChange={(e) =>
                        handleSave(() =>
                          updateNotificationSettings({
                            quietHours: { ...settings.notifications.quietHours, enabled: e.target.checked },
                          })
                        )
                      }
                      className='w-5 h-5 text-purple-600 rounded focus:ring-purple-500'
                    />
                  </div>

                  {settings.notifications.quietHours.enabled && (
                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <label className='block text-sm font-medium mb-1'>Desde</label>
                        <input
                          type='time'
                          value={settings.notifications.quietHours.start}
                          onChange={(e) =>
                            handleSave(() =>
                              updateNotificationSettings({
                                quietHours: { ...settings.notifications.quietHours, start: e.target.value },
                              })
                            )
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500'
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-medium mb-1'>Hasta</label>
                        <input
                          type='time'
                          value={settings.notifications.quietHours.end}
                          onChange={(e) =>
                            handleSave(() =>
                              updateNotificationSettings({
                                quietHours: { ...settings.notifications.quietHours, end: e.target.value },
                              })
                            )
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500'
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Privacidad */}
          {activeTab === 'privacy' && (
            <div className='space-y-6'>
              <h3 className='text-lg font-semibold'>🛡️ Configuración de Privacidad</h3>

              <div className='space-y-4'>
                <div>
                  <label className='block font-medium mb-2'>Visibilidad del Perfil</label>
                  <select
                    value={settings.privacy.profileVisibility}
                    onChange={(e) =>
                      handleSave(() => updatePrivacySettings({ profileVisibility: e.target.value as any }))
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500'
                  >
                    <option value='private'>Privado</option>
                    <option value='psychologists-only'>Solo Psicólogos</option>
                    <option value='public'>Público</option>
                  </select>
                </div>

                <div className='flex items-center justify-between'>
                  <div>
                    <label className='font-medium'>Compartir Datos Anónimos</label>
                    <p className='text-sm text-gray-600'>
                      Permitir el uso de datos anónimos para mejorar la aplicación
                    </p>
                  </div>
                  <input
                    type='checkbox'
                    checked={settings.privacy.dataSharing}
                    onChange={(e) => handleSave(() => updatePrivacySettings({ dataSharing: e.target.checked }))}
                    className='w-5 h-5 text-purple-600 rounded focus:ring-purple-500'
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div>
                    <label className='font-medium'>Analytics</label>
                    <p className='text-sm text-gray-600'>Permitir el seguimiento de uso para mejorar la experiencia</p>
                  </div>
                  <input
                    type='checkbox'
                    checked={settings.privacy.analyticsOptIn}
                    onChange={(e) => handleSave(() => updatePrivacySettings({ analyticsOptIn: e.target.checked }))}
                    className='w-5 h-5 text-purple-600 rounded focus:ring-purple-500'
                  />
                </div>
              </div>
            </div>
          )}

          {/* Aplicación */}
          {activeTab === 'app' && (
            <div className='space-y-6'>
              <h3 className='text-lg font-semibold'>🎨 Configuración de la Aplicación</h3>

              <div className='space-y-4'>
                <div>
                  <label className='block font-medium mb-2'>Tema</label>
                  <select
                    value={settings.app.theme}
                    onChange={(e) => handleSave(() => updateAppSettings({ theme: e.target.value as any }))}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500'
                  >
                    <option value='auto'>Automático</option>
                    <option value='light'>Claro</option>
                    <option value='dark'>Oscuro</option>
                  </select>
                </div>

                <div>
                  <label className='block font-medium mb-2'>Idioma</label>
                  <select
                    value={settings.app.language}
                    onChange={(e) => handleSave(() => updateAppSettings({ language: e.target.value as any }))}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500'
                  >
                    <option value='es'>Español</option>
                    <option value='en'>English</option>
                  </select>
                </div>

                <div>
                  <label className='block font-medium mb-2'>Formato de Fecha</label>
                  <select
                    value={settings.app.dateFormat}
                    onChange={(e) => handleSave(() => updateAppSettings({ dateFormat: e.target.value as any }))}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500'
                  >
                    <option value='DD/MM/YYYY'>DD/MM/YYYY</option>
                    <option value='MM/DD/YYYY'>MM/DD/YYYY</option>
                    <option value='YYYY-MM-DD'>YYYY-MM-DD</option>
                  </select>
                </div>

                <div>
                  <label className='block font-medium mb-2'>Formato de Hora</label>
                  <select
                    value={settings.app.timeFormat}
                    onChange={(e) => handleSave(() => updateAppSettings({ timeFormat: e.target.value as any }))}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500'
                  >
                    <option value='24h'>24 horas</option>
                    <option value='12h'>12 horas</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Mood Logging */}
          {activeTab === 'mood' && (
            <div className='space-y-6'>
              <h3 className='text-lg font-semibold'>⏰ Configuración de Mood Logging</h3>

              <div className='space-y-4'>
                <div>
                  <label className='block font-medium mb-2'>Escala de Mood por Defecto</label>
                  <select
                    value={settings.moodLogging.defaultMoodScale}
                    onChange={(e) =>
                      handleSave(() =>
                        updateMoodLoggingSettings({ defaultMoodScale: parseInt(e.target.value) as 5 | 10 })
                      )
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500'
                  >
                    <option value={5}>5 puntos</option>
                    <option value={10}>10 puntos</option>
                  </select>
                </div>

                <div className='flex items-center justify-between'>
                  <div>
                    <label className='font-medium'>Logging Detallado</label>
                    <p className='text-sm text-gray-600'>Incluir emociones y actividades en el registro</p>
                  </div>
                  <input
                    type='checkbox'
                    checked={settings.moodLogging.enableDetailedLogging}
                    onChange={(e) =>
                      handleSave(() => updateMoodLoggingSettings({ enableDetailedLogging: e.target.checked }))
                    }
                    className='w-5 h-5 text-purple-600 rounded focus:ring-purple-500'
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div>
                    <label className='font-medium'>Guardado Automático</label>
                    <p className='text-sm text-gray-600'>Guardar automáticamente los registros de mood</p>
                  </div>
                  <input
                    type='checkbox'
                    checked={settings.moodLogging.autoSave}
                    onChange={(e) => handleSave(() => updateMoodLoggingSettings({ autoSave: e.target.checked }))}
                    className='w-5 h-5 text-purple-600 rounded focus:ring-purple-500'
                  />
                </div>
              </div>
            </div>
          )}

          {/* Datos */}
          {activeTab === 'data' && (
            <div className='space-y-6'>
              <h3 className='text-lg font-semibold'>📊 Gestión de Datos</h3>

              <div className='space-y-4'>
                <div className='flex items-center justify-between p-4 border border-gray-200 rounded-lg'>
                  <div>
                    <h4 className='font-medium'>Exportar Configuración</h4>
                    <p className='text-sm text-gray-600'>Descargar tu configuración actual</p>
                  </div>
                  <button
                    onClick={handleExport}
                    className='flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                  >
                    <Download className='w-4 h-4' />
                    <span>Exportar</span>
                  </button>
                </div>

                <div className='flex items-center justify-between p-4 border border-gray-200 rounded-lg'>
                  <div>
                    <h4 className='font-medium'>Importar Configuración</h4>
                    <p className='text-sm text-gray-600'>Cargar configuración desde archivo</p>
                  </div>
                  <label className='flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer'>
                    <Upload className='w-4 h-4' />
                    <span>Importar</span>
                    <input type='file' accept='.json' onChange={handleImport} className='hidden' />
                  </label>
                </div>

                <div className='flex items-center justify-between p-4 border border-gray-200 rounded-lg'>
                  <div>
                    <h4 className='font-medium'>Resetear Configuración</h4>
                    <p className='text-sm text-gray-600'>Volver a la configuración por defecto</p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('¿Estás seguro de que quieres resetear toda la configuración?')) {
                        handleSave(resetToDefaults);
                      }
                    }}
                    className='flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors'
                  >
                    <RotateCcw className='w-4 h-4' />
                    <span>Resetear</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading Overlay */}
        {saving && (
          <div className='absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center'>
            <div className='flex items-center space-x-2'>
              <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600'></div>
              <span className='text-gray-600'>Guardando...</span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default UserSettingsModal;
