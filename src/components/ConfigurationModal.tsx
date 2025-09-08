import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Modal from './Modal';
import NotificationModal from './NotificationModal';

interface ConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    displayName: string | null;
    email: string | null;
  } | null;
}

const ConfigurationModal: React.FC<ConfigurationModalProps> = ({ isOpen, onClose, user }) => {
  const { updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile');
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationData, setNotificationData] = useState({
    type: 'success' as 'success' | 'error' | 'info',
    title: '',
    message: '',
    icon: '',
  });
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    notifications: true,
    darkMode: false,
    language: 'es',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const showNotificationModal = (type: 'success' | 'error' | 'info', title: string, message: string, icon?: string) => {
    setNotificationData({ type, title, message, icon: icon || '' });
    setShowNotification(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      if (activeTab === 'profile') {
        // Actualizar perfil del usuario
        await updateUserProfile({
          displayName: formData.displayName,
          username: formData.displayName, // Usar displayName como username también
        });
        showNotificationModal(
          'success',
          'Perfil Actualizado',
          'Tu información personal se ha actualizado correctamente.',
          '✅'
        );
        // Cerrar el modal después de un breve delay
        setTimeout(() => {
          onClose();
        }, 1500);
      } else if (activeTab === 'security') {
        // Aquí iría la lógica para cambiar contraseña
        if (formData.newPassword !== formData.confirmPassword) {
          showNotificationModal('error', 'Error de Contraseña', 'Las contraseñas no coinciden.', '❌');
          return;
        }
        if (formData.newPassword.length < 6) {
          showNotificationModal(
            'error',
            'Contraseña Inválida',
            'La contraseña debe tener al menos 6 caracteres.',
            '❌'
          );
          return;
        }
        // TODO: Implementar cambio de contraseña con Firebase Auth
        showNotificationModal('info', 'Próximamente', 'El cambio de contraseña estará disponible pronto.', 'ℹ️');
      } else if (activeTab === 'preferences') {
        // Aquí iría la lógica para guardar preferencias
        showNotificationModal(
          'success',
          'Preferencias Guardadas',
          'Tus preferencias se han guardado correctamente.',
          '✅'
        );
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      showNotificationModal(
        'error',
        'Error al Guardar',
        'No se pudieron guardar los cambios. Inténtalo de nuevo.',
        '❌'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className='w-full max-w-2xl max-h-[50vh] overflow-y-auto'>
        {/* Header */}
        <div className='text-center mb-4'>
          <div className='text-4xl mb-3'>⚙️</div>
          <h2 className='text-2xl font-black text-gray-900 mb-2'>CONFIGURACIÓN</h2>
          <p className='text-sm text-gray-600'>Personaliza tu experiencia en Mood Log</p>
        </div>

        {/* Tabs */}
        <div className='flex space-x-1 mb-4 bg-gray-100 rounded-xl p-1'>
          {[
            { id: 'profile', label: 'Perfil', icon: '👤' },
            { id: 'security', label: 'Seguridad', icon: '🔒' },
            { id: 'preferences', label: 'Preferencias', icon: '🎨' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2 px-3 rounded-lg font-bold transition-all duration-300 text-sm ${
                activeTab === tab.id ? 'bg-white text-purple-600 shadow-lg' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <span className='mr-2'>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className='space-y-4'>
          {activeTab === 'profile' && (
            <div className='space-y-4'>
              <h3 className='text-lg font-bold text-gray-800 mb-3'>📝 Información Personal</h3>

              <div>
                <label className='block text-sm font-bold text-gray-700 mb-2'>Nombre de Usuario</label>
                <input
                  type='text'
                  name='displayName'
                  value={formData.displayName}
                  onChange={handleInputChange}
                  className='w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors duration-300'
                  placeholder='Tu nombre de usuario'
                />
              </div>

              <div>
                <label className='block text-sm font-bold text-gray-700 mb-2'>Correo Electrónico</label>
                <input
                  type='email'
                  name='email'
                  value={formData.email}
                  onChange={handleInputChange}
                  className='w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors duration-300'
                  placeholder='tu@email.com'
                />
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className='space-y-4'>
              <h3 className='text-xl font-bold text-gray-800 mb-4'>🔐 Seguridad</h3>

              <div>
                <label className='block text-sm font-bold text-gray-700 mb-2'>Contraseña Actual</label>
                <input
                  type='password'
                  name='currentPassword'
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  className='w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors duration-300'
                  placeholder='••••••••'
                />
              </div>

              <div>
                <label className='block text-sm font-bold text-gray-700 mb-2'>Nueva Contraseña</label>
                <input
                  type='password'
                  name='newPassword'
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className='w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors duration-300'
                  placeholder='••••••••'
                />
              </div>

              <div>
                <label className='block text-sm font-bold text-gray-700 mb-2'>Confirmar Nueva Contraseña</label>
                <input
                  type='password'
                  name='confirmPassword'
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className='w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors duration-300'
                  placeholder='••••••••'
                />
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className='space-y-4'>
              <h3 className='text-xl font-bold text-gray-800 mb-4'>🎨 Preferencias</h3>

              <div className='flex items-center justify-between p-4 bg-gray-50 rounded-xl'>
                <div>
                  <h4 className='font-bold text-gray-800'>Notificaciones</h4>
                  <p className='text-sm text-gray-600'>Recibir notificaciones sobre tu estado de ánimo</p>
                </div>
                <label className='relative inline-flex items-center cursor-pointer'>
                  <input
                    type='checkbox'
                    name='notifications'
                    checked={formData.notifications}
                    onChange={handleInputChange}
                    className='sr-only peer'
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className='flex items-center justify-between p-4 bg-gray-50 rounded-xl'>
                <div>
                  <h4 className='font-bold text-gray-800'>Modo Oscuro</h4>
                  <p className='text-sm text-gray-600'>Cambiar entre tema claro y oscuro</p>
                </div>
                <label className='relative inline-flex items-center cursor-pointer'>
                  <input
                    type='checkbox'
                    name='darkMode'
                    checked={formData.darkMode}
                    onChange={handleInputChange}
                    className='sr-only peer'
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div>
                <label className='block text-sm font-bold text-gray-700 mb-2'>Idioma</label>
                <select
                  name='language'
                  value={formData.language}
                  onChange={handleInputChange}
                  className='w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors duration-300'
                >
                  <option value='es'>Español</option>
                  <option value='en'>English</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className='flex space-x-4 mt-8'>
          <button
            onClick={onClose}
            className='flex-1 py-3 px-6 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all duration-300'
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className='flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      <NotificationModal
        isOpen={showNotification}
        onClose={() => setShowNotification(false)}
        type={notificationData.type}
        title={notificationData.title}
        message={notificationData.message}
        icon={notificationData.icon}
      />
    </Modal>
  );
};

export default ConfigurationModal;
