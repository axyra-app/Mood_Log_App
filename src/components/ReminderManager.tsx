import React, { useState } from 'react';
import { useReminders } from '../hooks/useReminders';
import Modal from './Modal';
import NotificationModal from './NotificationModal';

interface ReminderManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReminderManager: React.FC<ReminderManagerProps> = ({ isOpen, onClose }) => {
  const {
    reminders,
    settings,
    loading,
    error,
    addReminder,
    editReminder,
    removeReminder,
    updateSettings,
    getRemindersByType,
    getActiveReminders,
  } = useReminders();

  const [activeTab, setActiveTab] = useState<'reminders' | 'settings'>('reminders');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationData, setNotificationData] = useState({
    type: 'success' as 'success' | 'error' | 'info',
    title: '',
    message: '',
    icon: '',
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

  const [newReminder, setNewReminder] = useState({
    title: '',
    message: '',
    type: 'mood' as 'mood' | 'wellness' | 'achievement' | 'custom',
    frequency: 'daily' as 'daily' | 'weekly' | 'custom',
    time: '09:00',
    days: [1, 2, 3, 4, 5] as number[],
    enabled: true,
  });

  const showNotificationModal = (type: 'success' | 'error' | 'info', title: string, message: string, icon?: string) => {
    setNotificationData({ type, title, message, icon: icon || '' });
    setShowNotification(true);
  };

  const handleAddReminder = async () => {
    try {
      await addReminder(newReminder);
      setShowAddModal(false);
      setNewReminder({
        title: '',
        message: '',
        type: 'mood',
        frequency: 'daily',
        time: '09:00',
        days: [1, 2, 3, 4, 5],
        enabled: true,
      });
      showNotificationModal('success', 'Recordatorio Creado', 'El recordatorio se ha creado correctamente.', '✅');
    } catch (error) {
      showNotificationModal('error', 'Error', 'No se pudo crear el recordatorio.', '❌');
    }
  };

  const handleEditReminder = async (reminderId: string, updates: Partial<Reminder>) => {
    try {
      await editReminder(reminderId, updates);
      setEditingReminder(null);
      showNotificationModal(
        'success',
        'Recordatorio Actualizado',
        'El recordatorio se ha actualizado correctamente.',
        '✅'
      );
    } catch (error) {
      showNotificationModal('error', 'Error', 'No se pudo actualizar el recordatorio.', '❌');
    }
  };

  const handleDeleteReminder = async (reminderId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este recordatorio?')) {
      try {
        await removeReminder(reminderId);
        showNotificationModal(
          'success',
          'Recordatorio Eliminado',
          'El recordatorio se ha eliminado correctamente.',
          '✅'
        );
      } catch (error) {
        showNotificationModal('error', 'Error', 'No se pudo eliminar el recordatorio.', '❌');
      }
    }
  };

  const handleToggleReminder = async (reminderId: string, enabled: boolean) => {
    try {
      await editReminder(reminderId, { enabled });
      showNotificationModal(
        'success',
        'Recordatorio Actualizado',
        `El recordatorio se ha ${enabled ? 'activado' : 'desactivado'}.`,
        '✅'
      );
    } catch (error) {
      showNotificationModal('error', 'Error', 'No se pudo actualizar el recordatorio.', '❌');
    }
  };

  const handleUpdateSettings = async (updates: Partial<ReminderSettings>) => {
    try {
      await updateSettings(updates);
      showNotificationModal(
        'success',
        'Configuración Actualizada',
        'La configuración se ha actualizado correctamente.',
        '✅'
      );
    } catch (error) {
      showNotificationModal('error', 'Error', 'No se pudo actualizar la configuración.', '❌');
    }
  };

  const getDayName = (day: number) => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[day];
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      mood: '😊',
      wellness: '💪',
      achievement: '🏆',
      custom: '🔔',
    };
    return icons[type as keyof typeof icons] || '🔔';
  };

  const getTypeName = (type: string) => {
    const names = {
      mood: 'Estado de Ánimo',
      wellness: 'Bienestar',
      achievement: 'Logros',
      custom: 'Personalizado',
    };
    return names[type as keyof typeof names] || 'Personalizado';
  };

  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className='text-center py-8'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Cargando recordatorios...</p>
        </div>
      </Modal>
    );
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className='w-full max-w-4xl max-h-[80vh] overflow-y-auto'>
          {/* Header */}
          <div className='text-center mb-6'>
            <div className='text-4xl mb-3'>🔔</div>
            <h2 className='text-2xl font-black text-gray-900 mb-2'>RECORDATORIOS</h2>
            <p className='text-sm text-gray-600'>Gestiona tus recordatorios personalizados</p>
          </div>

          {/* Tabs */}
          <div className='flex space-x-1 mb-6 bg-gray-100 rounded-xl p-1'>
            <button
              onClick={() => setActiveTab('reminders')}
              className={`flex-1 py-2 px-3 rounded-lg font-bold transition-all duration-300 text-sm ${
                activeTab === 'reminders' ? 'bg-white text-purple-600 shadow-lg' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📋 Recordatorios
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-2 px-3 rounded-lg font-bold transition-all duration-300 text-sm ${
                activeTab === 'settings' ? 'bg-white text-purple-600 shadow-lg' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              ⚙️ Configuración
            </button>
          </div>

          {/* Content */}
          {activeTab === 'reminders' && (
            <div className='space-y-4'>
              {/* Header con botón de agregar */}
              <div className='flex justify-between items-center'>
                <h3 className='text-lg font-semibold text-gray-900'>
                  Mis Recordatorios ({getActiveReminders().length})
                </h3>
                <button
                  onClick={() => setShowAddModal(true)}
                  className='bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors'
                >
                  + Agregar Recordatorio
                </button>
              </div>

              {/* Lista de recordatorios */}
              <div className='space-y-3'>
                {reminders.length === 0 ? (
                  <div className='text-center py-8 text-gray-500'>
                    <div className='text-4xl mb-2'>🔔</div>
                    <p>No tienes recordatorios configurados</p>
                    <p className='text-sm'>Crea tu primer recordatorio para comenzar</p>
                  </div>
                ) : (
                  reminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className={`bg-white border-2 rounded-lg p-4 transition-all duration-300 ${
                        reminder.enabled ? 'border-purple-200' : 'border-gray-200 opacity-60'
                      }`}
                    >
                      <div className='flex items-start justify-between'>
                        <div className='flex-1'>
                          <div className='flex items-center gap-2 mb-2'>
                            <span className='text-xl'>{getTypeIcon(reminder.type)}</span>
                            <h4 className='font-semibold text-gray-900'>{reminder.title}</h4>
                            <span className='text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full'>
                              {getTypeName(reminder.type)}
                            </span>
                          </div>
                          <p className='text-sm text-gray-600 mb-2'>{reminder.message}</p>
                          <div className='flex items-center gap-4 text-xs text-gray-500'>
                            <span>⏰ {reminder.time}</span>
                            <span>📅 {reminder.days.map(getDayName).join(', ')}</span>
                            <span>🔄 {reminder.frequency === 'daily' ? 'Diario' : 'Semanal'}</span>
                          </div>
                        </div>
                        <div className='flex items-center gap-2'>
                          <button
                            onClick={() => handleToggleReminder(reminder.id!, !reminder.enabled)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                              reminder.enabled
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {reminder.enabled ? 'Activo' : 'Inactivo'}
                          </button>
                          <button
                            onClick={() => setEditingReminder(reminder)}
                            className='px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors'
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteReminder(reminder.id!)}
                            className='px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium hover:bg-red-200 transition-colors'
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && settings && (
            <div className='space-y-6'>
              <h3 className='text-lg font-semibold text-gray-900'>Configuración de Recordatorios</h3>

              {/* Recordatorios de Mood */}
              <div className='bg-gray-50 rounded-lg p-4'>
                <h4 className='font-medium text-gray-900 mb-3'>😊 Recordatorios de Estado de Ánimo</h4>
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-gray-600'>Habilitar recordatorios de mood</span>
                    <label className='relative inline-flex items-center cursor-pointer'>
                      <input
                        type='checkbox'
                        checked={settings.moodReminders.enabled}
                        onChange={(e) =>
                          handleUpdateSettings({
                            moodReminders: { ...settings.moodReminders, enabled: e.target.checked },
                          })
                        }
                        className='sr-only peer'
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Recordatorios de Bienestar */}
              <div className='bg-gray-50 rounded-lg p-4'>
                <h4 className='font-medium text-gray-900 mb-3'>💪 Recordatorios de Bienestar</h4>
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-gray-600'>Habilitar recordatorios de bienestar</span>
                    <label className='relative inline-flex items-center cursor-pointer'>
                      <input
                        type='checkbox'
                        checked={settings.wellnessReminders.enabled}
                        onChange={(e) =>
                          handleUpdateSettings({
                            wellnessReminders: { ...settings.wellnessReminders, enabled: e.target.checked },
                          })
                        }
                        className='sr-only peer'
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Horas de Silencio */}
              <div className='bg-gray-50 rounded-lg p-4'>
                <h4 className='font-medium text-gray-900 mb-3'>🔇 Horas de Silencio</h4>
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-gray-600'>Habilitar horas de silencio</span>
                    <label className='relative inline-flex items-center cursor-pointer'>
                      <input
                        type='checkbox'
                        checked={settings.quietHours.enabled}
                        onChange={(e) =>
                          handleUpdateSettings({
                            quietHours: { ...settings.quietHours, enabled: e.target.checked },
                          })
                        }
                        className='sr-only peer'
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                  {settings.quietHours.enabled && (
                    <div className='flex gap-2'>
                      <div>
                        <label className='block text-xs text-gray-600 mb-1'>Inicio</label>
                        <input
                          type='time'
                          value={settings.quietHours.start}
                          onChange={(e) =>
                            handleUpdateSettings({
                              quietHours: { ...settings.quietHours, start: e.target.value },
                            })
                          }
                          className='px-3 py-2 border border-gray-300 rounded-lg text-sm'
                        />
                      </div>
                      <div>
                        <label className='block text-xs text-gray-600 mb-1'>Fin</label>
                        <input
                          type='time'
                          value={settings.quietHours.end}
                          onChange={(e) =>
                            handleUpdateSettings({
                              quietHours: { ...settings.quietHours, end: e.target.value },
                            })
                          }
                          className='px-3 py-2 border border-gray-300 rounded-lg text-sm'
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className='bg-red-50 border border-red-200 rounded-lg p-4 mt-4'>
              <div className='flex'>
                <div className='flex-shrink-0'>
                  <svg className='h-5 w-5 text-red-400' viewBox='0 0 20 20' fill='currentColor'>
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                      clipRule='evenodd'
                    />
                  </svg>
                </div>
                <div className='ml-3'>
                  <h3 className='text-sm font-medium text-red-800'>Error</h3>
                  <div className='mt-2 text-sm text-red-700'>
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Modal para agregar recordatorio */}
      {showAddModal && (
        <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
          <div className='w-full max-w-md'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>Agregar Recordatorio</h3>

            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Título</label>
                <input
                  type='text'
                  value={newReminder.title}
                  onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                  placeholder='Ej: Recordatorio de Mood'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Mensaje</label>
                <textarea
                  value={newReminder.message}
                  onChange={(e) => setNewReminder({ ...newReminder, message: e.target.value })}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                  rows={3}
                  placeholder='Ej: Es hora de registrar tu estado de ánimo'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Tipo</label>
                <select
                  value={newReminder.type}
                  onChange={(e) => setNewReminder({ ...newReminder, type: e.target.value as any })}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                >
                  <option value='mood'>Estado de Ánimo</option>
                  <option value='wellness'>Bienestar</option>
                  <option value='achievement'>Logros</option>
                  <option value='custom'>Personalizado</option>
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Hora</label>
                <input
                  type='time'
                  value={newReminder.time}
                  onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Días de la semana</label>
                <div className='grid grid-cols-7 gap-2'>
                  {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((day, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        const newDays = newReminder.days.includes(index)
                          ? newReminder.days.filter((d) => d !== index)
                          : [...newReminder.days, index];
                        setNewReminder({ ...newReminder, days: newDays });
                      }}
                      className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                        newReminder.days.includes(index)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className='flex gap-3 mt-6'>
              <button
                onClick={() => setShowAddModal(false)}
                className='flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'
              >
                Cancelar
              </button>
              <button
                onClick={handleAddReminder}
                disabled={!newReminder.title || !newReminder.message}
                className='flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                Crear Recordatorio
              </button>
            </div>
          </div>
        </Modal>
      )}

      <NotificationModal
        isOpen={showNotification}
        onClose={() => setShowNotification(false)}
        type={notificationData.type}
        title={notificationData.title}
        message={notificationData.message}
        icon={notificationData.icon}
      />
    </>
  );
};

export default ReminderManager;
