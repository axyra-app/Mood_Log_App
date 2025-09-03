import { Bell, Clock, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { notificationService } from '../services/notificationService';

interface ReminderSettings {
  enabled: boolean;
  time: string;
  days: number[];
}

const DailyReminder = () => {
  const { userProfile } = useAuth();
  const [settings, setSettings] = useState<ReminderSettings>({
    enabled: false,
    time: '20:00',
    days: [1, 2, 3, 4, 5], // Monday to Friday
  });
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);

  const daysOfWeek = [
    { value: 0, label: 'Dom', name: 'Domingo' },
    { value: 1, label: 'Lun', name: 'Lunes' },
    { value: 2, label: 'Mar', name: 'Martes' },
    { value: 3, label: 'Mié', name: 'Miércoles' },
    { value: 4, label: 'Jue', name: 'Jueves' },
    { value: 5, label: 'Vie', name: 'Viernes' },
    { value: 6, label: 'Sáb', name: 'Sábado' },
  ];

  useEffect(() => {
    if (userProfile?.uid) {
      loadSettings();
    }
  }, [userProfile?.uid]);

  const loadSettings = async () => {
    if (!userProfile?.uid) return;

    try {
      const userSettings = await notificationService.getNotificationSettings(userProfile.uid);
      if (userSettings?.reminders) {
        setSettings({
          enabled: userSettings.reminders.enabled,
          time: userSettings.reminders.time,
          days: userSettings.reminders.days,
        });
      }
    } catch (error) {
      console.error('Error loading reminder settings:', error);
    }
  };

  const saveSettings = async () => {
    if (!userProfile?.uid) return;

    setLoading(true);
    try {
      await notificationService.updateNotificationSettings(userProfile.uid, {
        reminders: settings,
      });

      // Request notification permission if enabled
      if (settings.enabled) {
        await notificationService.requestNotificationPermission();
      }

      setShowSettings(false);
    } catch (error) {
      console.error('Error saving reminder settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day: number) => {
    setSettings((prev) => ({
      ...prev,
      days: prev.days.includes(day) ? prev.days.filter((d) => d !== day) : [...prev.days, day],
    }));
  };

  const testReminder = async () => {
    if (!userProfile?.uid) return;

    try {
      await notificationService.createReminderNotification(
        userProfile.uid,
        'Este es un recordatorio de prueba. ¡Es hora de registrar tu estado de ánimo!'
      );

      // Show browser notification
      await notificationService.showBrowserNotification('Recordatorio de Prueba', {
        body: 'Este es un recordatorio de prueba. ¡Es hora de registrar tu estado de ánimo!',
        icon: '/pwa-192x192.png',
      });
    } catch (error) {
      console.error('Error sending test reminder:', error);
    }
  };

  return (
    <div className='bg-white rounded-xl shadow-lg p-6'>
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-3'>
          <Bell className='w-6 h-6 text-primary-600' />
          <h3 className='text-xl font-semibold text-gray-900'>Recordatorio Diario</h3>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className='p-2 text-gray-600 hover:text-primary-600 transition-colors'
        >
          <Settings className='w-5 h-5' />
        </button>
      </div>

      {!showSettings ? (
        <div className='space-y-4'>
          <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
            <div className='flex items-center gap-3'>
              <div className={`w-3 h-3 rounded-full ${settings.enabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span className='font-medium text-gray-900'>{settings.enabled ? 'Activado' : 'Desactivado'}</span>
            </div>
            <div className='text-sm text-gray-600'>
              {settings.enabled ? `A las ${settings.time}` : 'Sin recordatorios'}
            </div>
          </div>

          {settings.enabled && (
            <div className='p-4 bg-primary-50 rounded-lg'>
              <div className='flex items-center gap-2 mb-2'>
                <Clock className='w-4 h-4 text-primary-600' />
                <span className='text-sm font-medium text-primary-800'>Días activos:</span>
              </div>
              <div className='flex gap-2 flex-wrap'>
                {daysOfWeek.map((day) => (
                  <span
                    key={day.value}
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      settings.days.includes(day.value) ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {day.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className='flex gap-3'>
            <button
              onClick={testReminder}
              disabled={!settings.enabled}
              className='flex-1 btn-secondary disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Probar Recordatorio
            </button>
          </div>
        </div>
      ) : (
        <div className='space-y-6'>
          {/* Enable/Disable Toggle */}
          <div className='flex items-center justify-between'>
            <div>
              <h4 className='font-medium text-gray-900'>Activar Recordatorios</h4>
              <p className='text-sm text-gray-600'>Recibe notificaciones para registrar tu estado de ánimo</p>
            </div>
            <button
              onClick={() => setSettings((prev) => ({ ...prev, enabled: !prev.enabled }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.enabled ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Time Selection */}
          {settings.enabled && (
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Hora del Recordatorio</label>
              <input
                type='time'
                value={settings.time}
                onChange={(e) => setSettings((prev) => ({ ...prev, time: e.target.value }))}
                className='input-field'
              />
            </div>
          )}

          {/* Days Selection */}
          {settings.enabled && (
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-3'>Días de la Semana</label>
              <div className='grid grid-cols-7 gap-2'>
                {daysOfWeek.map((day) => (
                  <button
                    key={day.value}
                    onClick={() => toggleDay(day.value)}
                    className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                      settings.days.includes(day.value)
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className='flex gap-3 pt-4 border-t border-gray-200'>
            <button onClick={() => setShowSettings(false)} className='flex-1 btn-secondary'>
              Cancelar
            </button>
            <button onClick={saveSettings} disabled={loading} className='flex-1 btn-primary disabled:opacity-50'>
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyReminder;
